// lib/fees/lpgSpecific.ts
// 액화석유가스 특정사용시설 전용 계산 모듈 (작은 단위로 분리)

// ─────────────────────────────────────────────────────────
// Types
export type SpecificInspectionType = 'completion' | 'periodic';

export type SpecificOptions = {
	// 주거형 특례(완성): 세대마다 최저수수료
	isResidentialUnit?: boolean;
	householdCount?: number;

	// 공동 저장설비: 저장능력 ÷ 사용자수
	isSharedStorage?: boolean;
	userCount?: number;

	// 정기 면제: 사회복지시설 / 재래시장 내 사용
	isWelfareOrTraditionalMarket?: boolean;
};

// 결과 구조(필요 시 UI 표시용)
export type SpecificFeeResult = {
	fee: number;
	// 디버깅/툴팁용 상세 정보
	detail: {
		effectiveKg: number; // 공동저장 환산 후 kg
		baseBand:
			| 'le100'
			| '100-300'
			| '300-500'
			| 'over500'
			| 'residential-min'
			| 'exempt'
			| 'na';
		steps?: number; // >500kg에서 100kg '완전 단위' 가산 step 수
		note?: string; // 주석(면제, 최저수수료 등)
	};
};

// ─────────────────────────────────────────────────────────
// Constants (고시 반영값)
const COMPLETION_MIN = 31_800 as const; // 완성 최저수수료(≤100kg 및 주거형 세대당)
const COMPLETION_100_300 = 36_000 as const;
const COMPLETION_300_500 = 58_200 as const;
const COMPLETION_OVER500_ADD_PER_100KG = 3_100 as const;
const COMPLETION_OVER500_CAP = 477_000 as const;

const PERIODIC_100_300 = 26_500 as const;
const PERIODIC_300_500 = 38_100 as const;
const PERIODIC_OVER500_ADD_PER_100KG = 3_000 as const;
const PERIODIC_OVER500_CAP = 392_000 as const;

// 표상 정기 ≤100kg 칸은 '-' 처리 → 기본적으로 0(미부과/비대상)로 취급
const PERIODIC_LE100_TREATED_AS_ZERO = true;

// ─────────────────────────────────────────────────────────
// 작은 단위 함수들

// 1) 공동 저장설비일 경우 저장능력 환산 (kg ÷ 사용자수)
const getEffectiveKg = (kg: number, opts?: SpecificOptions): number => {
	if (opts?.isSharedStorage && opts.userCount && opts.userCount > 0) {
		return kg / opts.userCount;
	}
	return kg;
};

// 2) 정기 면제 여부
const isPeriodicExempt = (
	type: SpecificInspectionType,
	opts?: SpecificOptions,
): boolean => type === 'periodic' && !!opts?.isWelfareOrTraditionalMarket;

// 3) 주거형(완성) 최저수수료 적용 여부 + 계산
const tryResidentialCompletion = (
	type: SpecificInspectionType,
	opts?: SpecificOptions,
): SpecificFeeResult | null => {
	if (type !== 'completion') return null;
	if (!opts?.isResidentialUnit) return null;
	// ✅ 세대수 미입력 시 1세대로 간주
	const households = opts.householdCount ?? 1;
	if (households <= 0) return null;
	const fee = households * COMPLETION_MIN;
	return {
		fee,
		detail: {
			effectiveKg: 0,
			baseBand: 'residential-min',
			note: '주거형(완성): 세대마다 최저수수료(31,800원)',
		},
	};
};

// 4) 100kg 단위 가산 step 계산 (500kg 초과분만)
//    ✅ 변경: '완전한' 100kg 단위마다 가산 (예: 501~599 → 0단계, 600~699 → 1단계)
const stepsOver500By100kg = (effectiveKg: number): number => {
	const over = Math.max(0, effectiveKg - 500);
	return Math.floor(over / 100);
};

// 5) 구간 계산 - 완성
const computeCompletion = (effectiveKg: number): SpecificFeeResult => {
	if (effectiveKg <= 100) {
		return { fee: COMPLETION_MIN, detail: { effectiveKg, baseBand: 'le100' } };
	}
	if (effectiveKg <= 300) {
		return {
			fee: COMPLETION_100_300,
			detail: { effectiveKg, baseBand: '100-300' },
		};
	}
	if (effectiveKg <= 500) {
		return {
			fee: COMPLETION_300_500,
			detail: { effectiveKg, baseBand: '300-500' },
		};
	}
	const steps = stepsOver500By100kg(effectiveKg);
	const fee = Math.min(
		COMPLETION_300_500 + steps * COMPLETION_OVER500_ADD_PER_100KG,
		COMPLETION_OVER500_CAP,
	);
	return { fee, detail: { effectiveKg, baseBand: 'over500', steps } };
};

// 6) 구간 계산 - 정기
const computePeriodic = (effectiveKg: number): SpecificFeeResult => {
	// ✅ 250kg 미만 정기검사 면제 (0원)
	if (effectiveKg < 250) {
		return {
			fee: 0,
			detail: {
				effectiveKg,
				baseBand: 'exempt',
				note: '저장능력 250kg 미만: 정기검사 수수료 면제',
			},
		};
	}

	if (effectiveKg <= 100) {
		const fee = PERIODIC_LE100_TREATED_AS_ZERO ? 0 : PERIODIC_100_300;
		return {
			fee,
			detail: {
				effectiveKg,
				baseBand: 'le100',
				note: '정기 ≤100kg: 표상 “–” → 0 처리',
			},
		};
	}
	if (effectiveKg <= 300) {
		return {
			fee: PERIODIC_100_300,
			detail: { effectiveKg, baseBand: '100-300' },
		};
	}
	if (effectiveKg <= 500) {
		return {
			fee: PERIODIC_300_500,
			detail: { effectiveKg, baseBand: '300-500' },
		};
	}
	const steps = stepsOver500By100kg(effectiveKg);
	const fee = Math.min(
		PERIODIC_300_500 + steps * PERIODIC_OVER500_ADD_PER_100KG,
		PERIODIC_OVER500_CAP,
	);
	return { fee, detail: { effectiveKg, baseBand: 'over500', steps } };
};

// ─────────────────────────────────────────────────────────
// 공개 API: 특정사용시설 계산
export const calcLpgSpecificFee = (
	type: SpecificInspectionType,
	capacityKg: number,
	opts?: SpecificOptions,
): SpecificFeeResult => {
	// 0) 정기 면제
	if (isPeriodicExempt(type, opts)) {
		return {
			fee: 0,
			detail: {
				effectiveKg: 0,
				baseBand: 'exempt',
				note: '정기 면제(복지/재래시장)',
			},
		};
	}

	// 1) 공동저장 환산
	const effectiveKg = getEffectiveKg(capacityKg, opts);

	// 2) (완성) 주거형 최저수수료(세대수) 우선 적용
	const residential = tryResidentialCompletion(type, opts);
	if (residential) return residential;

	// 3) 구간표 계산
	const result =
		type === 'completion'
			? computeCompletion(effectiveKg)
			: computePeriodic(effectiveKg);

	// 결과에 effectiveKg만 덮어써서 반환(주거형 외에는 항상 표시)
	return { ...result, detail: { ...result.detail, effectiveKg } };
};
