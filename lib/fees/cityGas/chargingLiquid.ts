// lib/fees/cityGas/chargingLiquid.ts
// 도시가스충전시설 — 액화가스 (중간/완성/정기) 수수료 계산
// 근거: 도시가스시설 등의 검사수수료 및 교육비 기준 [별표] 도시가스충전시설(액화) 표

export type CgInspect = 'completion' | 'intermediate' | 'periodic';

type Band = { max: number; c?: number; i?: number; p?: number };

const BANDS: Band[] = [
	// ≤5, ≤10, ≤20, ≤50, ≤100, ≤500, ≤1000 (단위: ton)
	{ max: 5, c: 174_000, i: 106_000, p: 139_000 },
	{ max: 10, c: 235_000, i: 142_000, p: 167_000 },
	{ max: 20, c: 295_000, i: 164_000, p: 197_000 },
	{ max: 50, c: 435_000, i: 230_000, p: 281_000 },
	{ max: 100, c: 599_000, i: 320_000, p: 375_000 },
	{ max: 500, c: 1_010_000, i: 546_000, p: 676_000 },
	{ max: 1000, c: 1_443_000, i: 768_000, p: 913_000 },
];

// >1000t 구간: “완전한 500t 초과분”마다 가산 + 상한
const OVER = {
	completion: { addPer500: 167_000, cap: 4_133_000 },
	intermediate: { addPer500: 100_000, cap: 2_435_000 },
	periodic: { addPer500: 145_000, cap: 2_148_000 },
} as const;

export const calcCgChargingLiquidFee = (type: CgInspect, ton: number) => {
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

	// > 1000t : 500t "완전단위" 가산(올림 아님, 내림)
	const base = BANDS[BANDS.length - 1];
	const baseFee =
		type === 'completion'
			? base.c!
			: type === 'intermediate'
			? base.i!
			: base.p!;

	// 예) 1000.1t ~ 1499.9t => steps = 0 (가산 없음), 1500t~1999.9t => steps = 1
	const over = ton - 1000;
	const steps = Math.floor(over / 500);
	const add = OVER[type].addPer500;
	const cap = OVER[type].cap;

	const fee0 = baseFee + Math.max(0, steps) * add;
	const fee = Math.min(fee0, cap);

	return { fee, detail: { band: '>1000t', steps, capped: fee === cap } };
};
