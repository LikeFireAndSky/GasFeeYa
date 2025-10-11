// lib/fees/highPressure/liquid.ts
// 고압가스(액화) 제조·충전·저장 수수료 계산 (완성/중간/정기)

export type HpInspect = 'completion' | 'intermediate' | 'periodic';

type Band = { max: number; c?: number; i?: number; p?: number };

const BANDS: Band[] = [
	{ max: 5, c: 181_000, i: 106_000, p: 140_000 },
	{ max: 10, c: 245_000, i: 142_000, p: 169_000 },
	{ max: 20, c: 307_000, i: 164_000, p: 198_000 },
	{ max: 50, c: 451_000, i: 230_000, p: 284_000 },
	{ max: 100, c: 623_000, i: 320_000, p: 378_000 },
	{ max: 500, c: 1_049_000, i: 546_000, p: 682_000 },
	{ max: 1000, c: 1_500_000, i: 768_000, p: 921_000 },
];

// 1000t 초과 가산/상한
const OVER = {
	completion: { addPer500: 174_000, cap: 4_297_000 },
	intermediate: { addPer500: 100_000, cap: 2_435_000 },
	periodic: { addPer500: 146_000, cap: 2_169_000 },
} as const;

export const calcHpLiquidFee = (type: HpInspect, ton: number) => {
	if (!Number.isFinite(ton) || ton <= 0) {
		return { fee: 0, detail: { band: 'invalid' as const } };
	}

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

	// > 1000t
	const base = BANDS[BANDS.length - 1];
	const baseFee =
		type === 'completion'
			? base.c!
			: type === 'intermediate'
			? base.i!
			: base.p!;

	// ✅ '완전한' 500t 단위마다 가산 (예: 1000.1~1499.9t → 0단계, 1500~1999.9t → 1단계)
	const over = Math.max(0, ton - 1000);
	const steps = Math.floor(over / 500);

	const add = OVER[type].addPer500;
	const cap = OVER[type].cap;
	const fee0 = baseFee + steps * add;
	const fee = Math.min(fee0, cap);

	return {
		fee,
		detail: {
			band: steps === 0 ? '>1000t(가산 없음)' : '>1000t',
			steps,
			capped: fee === cap,
		},
	};
};
