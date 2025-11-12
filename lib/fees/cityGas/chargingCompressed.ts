// lib/fees/cityGas/chargingCompressed.ts
// 도시가스충전시설 — 압축가스 (중간/완성/정기) 계산 모듈
// 수치 근거: 도시가스시설 등의 검사수수료 및 교육비 기준 [별표 4] (도시가스충전시설 - 압축가스)

export type CgInspect = 'completion' | 'intermediate' | 'periodic';

type Band = {
	max: number; // 표준상태 m³ 상한
	i: number; // 중간
	c: number; // 완성
	p: number; // 정기
};

// 구간표(≤1,000,000 m³)
const BANDS: Band[] = [
	{ max: 1_000, i: 123_000, c: 204_000, p: 151_000 },
	{ max: 2_000, i: 195_000, c: 357_000, p: 229_000 },
	{ max: 3_000, i: 223_000, c: 448_000, p: 279_000 },
	{ max: 5_000, i: 275_000, c: 527_000, p: 339_000 },
	{ max: 10_000, i: 455_000, c: 892_000, p: 649_000 },
	{ max: 100_000, i: 739_000, c: 1_461_000, p: 1_007_000 },
	{ max: 200_000, i: 1_015_000, c: 1_947_000, p: 1_686_000 },
	{ max: 500_000, i: 1_276_000, c: 2_485_000, p: 2_161_000 },
	{ max: 1_000_000, i: 1_723_000, c: 3_074_000, p: 2_613_000 },
];

// 100만 ㎥ 초과 가산/상한 (10만 ㎥ “완전” 단위)
const OVER = {
	intermediate: { addPer100k: 87_000, cap: 2_435_000 },
	completion: { addPer100k: 155_000, cap: 4_133_000 },
	periodic: { addPer100k: 139_000, cap: 2_752_000 },
} as const;

export type CgChargingCompressedDetail = {
	band: string; // 예: ≤1,000m³, >1,000,000m³
	steps?: number; // 10만 ㎥ 단위 가산 스텝(완전단위)
	capped?: boolean; // 상한 적용 여부
};

export const calcCgChargingCompressedFee = (
	type: CgInspect,
	capacityStdM3: number,
): { fee: number; detail: CgChargingCompressedDetail } => {
	if (!Number.isFinite(capacityStdM3) || capacityStdM3 <= 0) {
		return { fee: 0, detail: { band: 'invalid' } };
	}

	// 표 구간(≤ 1,000,000m³)
	const row = BANDS.find(r => capacityStdM3 <= r.max);
	if (row) {
		const fee =
			type === 'completion' ? row.c : type === 'intermediate' ? row.i : row.p;
		return { fee, detail: { band: `≤${row.max.toLocaleString()}m³` } };
	}

	// > 1,000,000 m³ : 초과분이 있으면 즉시(예: 1_000_000.1) 올림하여 10만 단위 가산
	const base = BANDS[BANDS.length - 1];
	const baseFee =
		type === 'completion' ? base.c : type === 'intermediate' ? base.i : base.p;

	const over = Math.max(0, capacityStdM3 - 1_000_000);
	const steps = over > 0 ? Math.ceil(over / 100_000) : 0; // 변경: 초과분 즉시 반영
	const add = OVER[type].addPer100k;
	const cap = OVER[type].cap;

	const fee0 = baseFee + steps * add;
	const fee = Math.min(fee0, cap);

	return {
		fee,
		detail: {
			band: '>1,000,000m³',
			steps,
			capped: fee === cap,
		},
	};
};
