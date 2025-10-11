// lib/fees/cityGas/specificBuried.ts
// 도시가스 특정가스사용시설 — 배관 매립 시설 (완성/정기)
// - 단독주택 20세대 미만: 세대수 × 20,000원
// - 그 외(단독 ≥20세대 포함)는 공동주택 계수식 × 13,000원
// - 정기검사는 표상 항목 없음('–') → 0원 처리

export type CgSpecType = 'completion' | 'periodic';
export type CgBuriedInput = {
	housingType: 'detached' | 'apartment';
	household: number; // 정수(세대수)
};

export type CgBuriedResult = {
	fee: number;
	detail: {
		kind: 'buriedPipeline';
		band: 'invalid' | 'detached<20' | 'detached≥20→apt-formula' | 'apartment';
		household: number;
		housingType: 'detached' | 'apartment';
		coef?: number; // 공동주택(또는 준용) 계수
		unit?: number; // 단가(13000 또는 20000)
		note?: string;
	};
};

const UNIT_APT = 13_000;
const UNIT_DET_LT20 = 20_000;

// 공동주택/준용 계수 계산
const calcAptCoef = (hh: number) => {
	if (hh <= 150) return hh;
	if (hh <= 300) return 150 + (hh - 150) * 0.75;
	if (hh <= 500) return 262.5 + (hh - 300) * 0.5;
	return 362.5 + (hh - 500) * 0.25;
};

export const calcCgSpecificBuriedFee = (
	type: CgSpecType,
	input: CgBuriedInput,
): CgBuriedResult => {
	const hh = Math.max(0, Math.floor(input.household || 0));
	const housingType = input.housingType;

	if (hh <= 0) {
		return {
			fee: 0,
			detail: {
				kind: 'buriedPipeline',
				band: 'invalid',
				household: hh,
				housingType,
				note: '세대수 1 이상을 입력하세요.',
			},
		};
	}

	// 정기: 표상 항목 없음 → 0원
	if (type === 'periodic') {
		return {
			fee: 0,
			detail: {
				kind: 'buriedPipeline',
				band: housingType === 'detached' ? 'detached<20' : 'apartment',
				household: hh,
				housingType,
				note: '정기검사 항목 없음(‘–’) → 0원 처리',
			},
		};
	}

	// 완성
	if (housingType === 'detached' && hh < 20) {
		const fee = hh * UNIT_DET_LT20;
		return {
			fee,
			detail: {
				kind: 'buriedPipeline',
				band: 'detached<20',
				household: hh,
				housingType,
				unit: UNIT_DET_LT20,
			},
		};
	}

	// 단독 20세대 이상은 공동주택 산식 준용
	const coef = calcAptCoef(hh);
	const fee = Math.round(coef * UNIT_APT);

	return {
		fee,
		detail: {
			kind: 'buriedPipeline',
			band:
				housingType === 'apartment' ? 'apartment' : 'detached≥20→apt-formula',
			household: hh,
			housingType,
			coef,
			unit: UNIT_APT,
			note:
				housingType === 'detached'
					? '단독 20세대 이상: 공동주택 계수식 준용'
					: undefined,
		},
	};
};
