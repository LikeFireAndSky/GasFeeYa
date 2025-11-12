// lib/fees/cityGas/specificGeneral.ts
// 도시가스 특정가스사용시설 — 그 밖의 시설(월사용예정량 기준) 수수료
// 옵션 반영: 시·도 지정(완성=정기 요율), 2실 이하 정기 상한(194,000), 금속 이중관(완성 +104,000)
// 가산 철학: 4,000m³ 초과분은 '완전한' 500m³ 단위마다 가산 (초과분이 있으면 즉시 올림 처리)

export type CgSpecType = 'completion' | 'periodic';

export type CgGeneralInput = {
	monthlyM3: number; // 월사용예정량
	isProvincialDesignated?: boolean; // 시·도 지정 → 완성=정기 요율
	roomsWithAppliance?: number; // 연소기 설치 실 개수(정기 특례)
	hasMetalDoubleFlue?: boolean; // 금속 이중관형 연돌(완성 +104,000)
};

export type CgGeneralResult = {
	fee: number;
	detail: {
		band:
			| 'zero' // ✅ 0 또는 미입력일 때
			| '≤1000'
			| '≤4000'
			| '>4000';
		steps?: number;
		capped?: boolean;
		roomsHalfCap?: boolean;
		provincialDesignated?: boolean;
		metalDoubleFlueAdded?: number;
		effType: CgSpecType;
		monthlyM3: number;
		note?: string;
	};
};

// ───────── 표 수치
const BAND1 = { c: 66_700, p: 32_000 } as const; // ≤1,000m³
const BAND2 = { c: 66_700, p: 48_500 } as const; // 1,000~4,000m³
const OVER4K_ADD = { c: 9_300, p: 9_000 } as const; // 4,000 초과 500m³당
const CAP = { c: 1_047_000, p: 388_000 } as const; // 상한
const PERIODIC_2ROOMS_HALF_CAP = 194_000; // 2실 이하 정기 상한
const METAL_DOUBLE_FLUE_ADD = 104_000; // 완성 가산

export const calcCgSpecificGeneralFee = (
	type: CgSpecType,
	input: CgGeneralInput,
): CgGeneralResult => {
	// 시·도 지정이면 완성도 정기 요율로 계산
	const effType: CgSpecType =
		type === 'completion' && input.isProvincialDesignated ? 'periodic' : type;

	// ✅ 0 또는 미입력/NaN → 0원 처리
	const raw = Number(input.monthlyM3);
	const monthlyM3 = Number.isFinite(raw) ? Math.max(0, raw) : 0;
	if (monthlyM3 === 0) {
		return {
			fee: 0,
			detail: {
				band: 'zero',
				effType,
				monthlyM3,
				note: '월사용예정량 0 또는 미입력: 0원 처리',
			},
		};
	}

	let fee = 0;
	const detail: CgGeneralResult['detail'] = {
		band: '≤1000',
		effType,
		monthlyM3,
	};

	if (monthlyM3 <= 1_000) {
		fee = effType === 'completion' ? BAND1.c : BAND1.p;
		detail.band = '≤1000';
	} else if (monthlyM3 <= 4_000) {
		fee = effType === 'completion' ? BAND2.c : BAND2.p;
		detail.band = '≤4000';
	} else {
		// 변경: 초과분이 있으면 즉시 올림하여 500m³ 단위 가산
		const over = Math.max(0, monthlyM3 - 4_000);
		const steps = over > 0 ? Math.ceil(over / 500) : 0; // 4,000.1 -> 1, 4,500 -> 1, 4,500.1 -> 2
		const base = effType === 'completion' ? BAND2.c : BAND2.p;
		const addPer = effType === 'completion' ? OVER4K_ADD.c : OVER4K_ADD.p;
		const cap = effType === 'completion' ? CAP.c : CAP.p;
		const fee0 = base + steps * addPer;
		fee = Math.min(fee0, cap);
		detail.band = '>4000';
		detail.steps = steps;
		detail.capped = fee === cap;
	}

	if (effType === 'periodic' && (input.roomsWithAppliance ?? 0) <= 2) {
		if (fee > PERIODIC_2ROOMS_HALF_CAP) {
			fee = PERIODIC_2ROOMS_HALF_CAP;
			detail.roomsHalfCap = true;
		}
	}
	if (type === 'completion' && input.hasMetalDoubleFlue) {
		fee += METAL_DOUBLE_FLUE_ADD;
		detail.metalDoubleFlueAdded = METAL_DOUBLE_FLUE_ADD;
	}
	if (type === 'completion' && input.isProvincialDesignated) {
		detail.provincialDesignated = true;
	}

	return { fee, detail };
};

