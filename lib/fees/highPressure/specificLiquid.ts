// lib/fees/highPressure/specificLiquid.ts
// 특정고압가스 사용시설 — 액화가스 (완성/정기)

export type HpSpecificInspect = 'completion' | 'periodic';

type Band = { maxKg: number; c?: number; p?: number };

/** 저장능력(kg) 구간표 (완성/정기) */
const BANDS: Band[] = [
	{ maxKg: 100, c: 34_000, p: 29_000 },
	{ maxKg: 300, c: 37_000, p: 32_000 },
	{ maxKg: 500, c: 54_000, p: 42_000 },
];

// 500kg 초과 가산/상한 (100kg '완전 단위'마다 가산)
const OVER = {
	completion: { addPer100: 2_000, cap: 455_000 },
	periodic: { addPer100: 2_000, cap: 339_000 },
} as const;

export const calcHpSpecificLiquidFee = (
	type: HpSpecificInspect,
	capacityKg: number,
) => {
	if (!Number.isFinite(capacityKg) || capacityKg <= 0) {
		return { fee: 0, detail: { band: 'invalid' as const } };
	}

	const row = BANDS.find(r => capacityKg <= r.maxKg);
	if (row) {
		const fee = type === 'completion' ? row.c! : row.p!;
		return { fee, detail: { band: `≤${row.maxKg}kg` } };
	}

	// > 500kg
	const base = BANDS[BANDS.length - 1];
	const baseFee = type === 'completion' ? base.c! : base.p!;
	const over = capacityKg - 500;

	// ✅ 100kg '완전한' 단위마다 가산 (예: 501~599 → 0단계, 600~699 → 1단계)
	const steps = Math.floor(over / 100);

	const fee0 = baseFee + steps * OVER[type].addPer100;
	const fee = Math.min(fee0, OVER[type].cap);

	return {
		fee,
		detail: { band: '>500kg', steps, capped: fee === OVER[type].cap },
	};
};
