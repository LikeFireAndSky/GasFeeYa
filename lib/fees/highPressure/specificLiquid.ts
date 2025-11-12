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

	// 변경: 소수 kg 포함 — 500을 초과하면 즉시 1단계 가산 (예: 500.1 -> 1단계)
	const over = Math.max(0, capacityKg - 500);
	const steps = over > 0 ? Math.ceil(over / 100) : 0;
	// 결과 예:
	// 500    -> steps = 0
	// 500.1  -> steps = 1
	// 599.9  -> steps = 1
	// 600    -> steps = 1
	// 600.1  -> steps = 2

	const fee0 = baseFee + steps * OVER[type].addPer100;
	const fee = Math.min(fee0, OVER[type].cap);

	return {
		fee,
		detail: { band: '>500kg', steps, capped: fee === OVER[type].cap },
	};
};
