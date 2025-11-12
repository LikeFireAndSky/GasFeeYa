// lib/fees/highPressure/refrigeration.ts
// 고압가스(냉동제조시설) 수수료 계산 (완성/중간/정기)

export type HpInspect = 'completion' | 'intermediate' | 'periodic';

type Band = { max: number; c?: number; i?: number; p?: number };

/** 냉동능력(t) 구간표 (완성/중간/정기) */
const BANDS: Band[] = [
	{ max: 5, c: 50_000, i: 31_000, p: 34_000 },
	{ max: 10, c: 94_000, i: 51_000, p: 59_000 },
	{ max: 30, c: 175_000, i: 102_000, p: 107_000 },
	{ max: 50, c: 229_000, i: 143_000, p: 154_000 },
	{ max: 100, c: 390_000, i: 220_000, p: 255_000 },
	{ max: 200, c: 604_000, i: 306_000, p: 371_000 },
	{ max: 300, c: 731_000, i: 402_000, p: 472_000 },
	{ max: 500, c: 975_000, i: 554_000, p: 679_000 },
];

// 500t 초과 가산/상한 (100t '완전 단위'마다 가산)
const OVER = {
	completion: { addPer100: 155_000, cap: 1_811_000 },
	intermediate: { addPer100: 87_000, cap: 1_091_000 },
	periodic: { addPer100: 140_000, cap: 1_472_000 },
} as const;

export const calcHpRefrigerationFee = (type: HpInspect, ton: number) => {
	if (!Number.isFinite(ton) || ton <= 0)
		return { fee: 0, detail: { band: 'invalid' as const } };

	const row = BANDS.find(r => ton <= r.max);
	if (row) {
		const fee =
			type === 'completion'
				? row.c!
				: type === 'intermediate'
				? row.i!
				: row.p!;
		return { fee, detail: { band: `≤${row.max}t` } };
	}

	// > 500t
	const base = BANDS[BANDS.length - 1];
	const baseFee =
		type === 'completion'
			? base.c!
			: type === 'intermediate'
			? base.i!
			: base.p!;

	// 변경: 소수톤 포함 — 500을 초과하면 즉시(예: 500.1t) 1단계 가산
	const over = Math.max(0, ton - 500);
	const steps = over > 0 ? Math.ceil(over / 100) : 0;
	// 결과 예:
	// ton = 500    -> over = 0    -> steps = 0
	// ton = 500.1  -> over = 0.1  -> steps = 1
	// ton = 599.9  -> over = 99.9 -> steps = 1
	// ton = 600    -> over = 100  -> steps = 1
	// ton = 600.0001 -> over >100 -> steps = 2

	const add = OVER[type].addPer100;
	const cap = OVER[type].cap;
	const fee0 = baseFee + steps * add;
	const fee = Math.min(fee0, cap);

	return { fee, detail: { band: '>500t', steps, capped: fee === cap } };
};