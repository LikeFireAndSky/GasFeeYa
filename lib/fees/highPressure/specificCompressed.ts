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

	// 변경: 소수 포함 — 1,000을 초과하면 즉시(예: 1000.1) 1단계 가산
	const over = Math.max(0, capacityStdM3 - 1_000);
	const steps = over > 0 ? Math.ceil(over / 100) : 0;
	// 예: over = 0.1..100 -> steps = 1 (1000.1 ~ 1100)
	//     over = 100.1..200 -> steps = 2 (1100.1 ~ 1200), 등

	const fee0 = baseFee + steps * OVER[type].addPer100;
	const fee = Math.min(fee0, OVER[type].cap);

	return {
		fee,
		detail: { band: '>1,000m³', steps, capped: fee === OVER[type].cap },
	};
};
