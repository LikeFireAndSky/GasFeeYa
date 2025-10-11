// lib/fees/cityGas/safety.ts
// 도시가스 — 안전관리수준평가 (시설/시스템) 계산

export type SafetyType = 'facility' | 'system';

export type FacilityInput = { pipelineKm: number };
export type SystemInput = { totalKm: number };

export type SafetyDetail =
	| {
			kind: 'facility';
			chargedKm: number; // 1km 미만도 1로 계산(0km는 0원)
			unit: number; // 40,000
	  }
	| {
			kind: 'system';
			band:
				| '<300'
				| '300–<500'
				| '500–<1000'
				| '1000–<2000'
				| '2000–<3000'
				| '≥3000';
	  };

const FACILITY_UNIT = 40_000 as const;

const SYSTEM_BANDS = [
	{ max: 300, fee: 4_378_000, band: '<300' as const },
	{ max: 500, fee: 6_568_000, band: '300–<500' as const },
	{ max: 1000, fee: 8_747_000, band: '500–<1000' as const },
	{ max: 2000, fee: 10_946_000, band: '1000–<2000' as const },
	{ max: 3000, fee: 13_135_000, band: '2000–<3000' as const },
] as const;
const SYSTEM_GTE_3000 = { fee: 15_325_000, band: '≥3000' as const };

export const calcSafetyFacility = (input: FacilityInput) => {
	const km = Number.isFinite(input.pipelineKm)
		? Math.max(0, input.pipelineKm)
		: 0;
	if (km <= 0)
		return {
			fee: 0,
			detail: {
				kind: 'facility',
				chargedKm: 0,
				unit: FACILITY_UNIT,
			} as SafetyDetail,
		};
	// 1km 미만도 1km로 계산, 그 이상은 km '올림' 적용이 명시되어 있지 않아 정수 km 그대로 사용.
	const chargedKm = km < 1 ? 1 : Math.ceil(km);
	const fee = chargedKm * FACILITY_UNIT;
	return {
		fee,
		detail: {
			kind: 'facility',
			chargedKm,
			unit: FACILITY_UNIT,
		} as SafetyDetail,
	};
};

export const calcSafetySystem = (input: SystemInput) => {
	const L = Number.isFinite(input.totalKm) ? Math.max(0, input.totalKm) : 0;

	const row = SYSTEM_BANDS.find(r => L < r.max);
	if (row)
		return {
			fee: row.fee,
			detail: { kind: 'system', band: row.band } as SafetyDetail,
		};

	// ≥3000 km
	return {
		fee: SYSTEM_GTE_3000.fee,
		detail: { kind: 'system', band: SYSTEM_GTE_3000.band } as SafetyDetail,
	};
};
