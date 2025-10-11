// lib/fees/highPressure/specificCompressed.ts
// 특정고압가스 사용시설 — 압축 (완성/정기)

export type HpSpecificInspect = 'completion' | 'periodic';

type Band = { maxM3: number; c?: number; p?: number };

/** 저장능력(표준상태 m³) 구간표 (완성/정기) */
const BANDS: Band[] = [
	{ maxM3: 300, c: 34_000, p: 29_000 },
	{ maxM3: 500, c: 37_000, p: 32_000 },
	{ maxM3: 1_000, c: 54_000, p: 40_000 },
];

// 1,000m³ 초과 가산/상한 (100m³ 단위 '올림')
const OVER = {
	completion: { addPer100: 2_000, cap: 455_000 },
	periodic: { addPer100: 2_000, cap: 339_000 },
} as const;

/** 특정고압가스 사용시설(압축) 수수료 계산 */
export const calcHpSpecificCompressedFee = (
	type: HpSpecificInspect,
	capacityStdM3: number,
) => {
	if (!Number.isFinite(capacityStdM3) || capacityStdM3 <= 0) {
		return { fee: 0, detail: { band: 'invalid' as const } };
	}

	const row = BANDS.find(r => capacityStdM3 <= r.maxM3);
	if (row) {
		const fee = type === 'completion' ? row.c! : row.p!;
		return { fee, detail: { band: `≤${row.maxM3.toLocaleString()}m³` } };
	}

	// > 1,000 m³
	const base = BANDS[BANDS.length - 1];
	const baseFee = type === 'completion' ? base.c! : base.p!;
	const over = capacityStdM3 - 1_000;

	// ✅ 100m³ '완전한' 단위마다 가산 (예: 1001~1099 → 0단계, 1100~1199 → 1단계)
	const steps = Math.floor(over / 100);

	const fee0 = baseFee + steps * OVER[type].addPer100;
	const fee = Math.min(fee0, OVER[type].cap);

	return {
		fee,
		detail: { band: '>1,000m³', steps, capped: fee === OVER[type].cap },
	};
};
