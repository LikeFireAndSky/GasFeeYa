// lib/fees/lpgStorage.ts
// 저장소·충전·일반 집단공급 시설(ton) 전용 계산 (완성/정기)
// 표: 5t 이하 ~ 1000t 이하 구간, 1000t 초과는 '완전한' 500t마다 가산 + 상한

export type StorageInspectionType = 'completion' | 'periodic';

export type StorageFeeDetail = {
	band: '≤5' | '≤10' | '≤20' | '≤50' | '≤100' | '≤500' | '≤1000' | '>1000';
	capped?: boolean;
	stepsOver1000?: number; // 500t '완전 단위' 가산 스텝
};

const TABLE = [
	{ maxTon: 5, completion: 219_000, periodic: 147_000, band: '≤5' as const },
	{ maxTon: 10, completion: 326_000, periodic: 202_000, band: '≤10' as const },
	{ maxTon: 20, completion: 414_000, periodic: 229_000, band: '≤20' as const },
	{ maxTon: 50, completion: 535_000, periodic: 316_000, band: '≤50' as const },
	{
		maxTon: 100,
		completion: 681_000,
		periodic: 405_000,
		band: '≤100' as const,
	},
	{
		maxTon: 500,
		completion: 1_061_000,
		periodic: 700_000,
		band: '≤500' as const,
	},
	{
		maxTon: 1000,
		completion: 1_562_000,
		periodic: 1_004_000,
		band: '≤1000' as const,
	},
] as const;

const OVER_1000 = {
	completion: { addPer500Ton: 220_000, cap: 2_946_000 },
	periodic: { addPer500Ton: 125_000, cap: 1_831_000 },
};

export const calcLpgStorageFee = (
	type: StorageInspectionType,
	capacityTon: number,
): { fee: number; detail: StorageFeeDetail } => {
	if (capacityTon <= 0 || !Number.isFinite(capacityTon)) {
		return { fee: 0, detail: { band: '≤5' } };
	}

	// 표 구간
	const row = TABLE.find(r => capacityTon <= r.maxTon);
	if (row) {
		const fee = type === 'completion' ? row.completion : row.periodic;
		return { fee, detail: { band: row.band } };
	}

	// 1000t 초과 가산 + 상한
	const base = TABLE[TABLE.length - 1];

	// 변경: 소수톤 포함 — 1000을 초과하면 즉시(예: 1000.1) 가산 시작
	const over = Math.max(0, capacityTon - 1000); // 1000.1 -> over = 0.1
	const steps = over > 0 ? Math.ceil(over / 500) : 0;
	// 결과 예: over=0.1..500 => steps=1 (1000.0001 ~ 1500), over=500.0001..1000 => steps=2 (1500.0001 ~ 2000), 등

	if (type === 'completion') {
		const fee = Math.min(
			base.completion + steps * OVER_1000.completion.addPer500Ton,
			OVER_1000.completion.cap,
		);
		return {
			fee,
			detail: {
				band: '>1000',
				stepsOver1000: steps,
				capped: fee === OVER_1000.completion.cap,
			},
		};
	} else {
		const fee = Math.min(
			base.periodic + steps * OVER_1000.periodic.addPer500Ton,
			OVER_1000.periodic.cap,
		);
		return {
			fee,
			detail: {
				band: '>1000',
				stepsOver1000: steps,
				capped: fee === OVER_1000.periodic.cap,
			},
		};
	}
};
