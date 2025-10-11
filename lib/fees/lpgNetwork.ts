// lib/fees/lpgNetwork.ts
// ✅ "0이면 그 항목은 0원" + '완전한' 단위 기준 가산(500t / 1km)

export type NetworkInputs = {
	plantCapacityTon?: number; // 제조소 저장능력(ton)
	regulatorCount?: number; // 정압기(대)
	pipelineKm?: number; // 배관 연장(km)
};

const PLANT_TABLE = [
	{ maxTon: 5, fee: 147_000 },
	{ maxTon: 10, fee: 202_000 },
	{ maxTon: 20, fee: 229_000 },
	{ maxTon: 50, fee: 316_000 },
	{ maxTon: 100, fee: 405_000 },
	{ maxTon: 500, fee: 700_000 },
	{ maxTon: 1000, fee: 1_004_000 },
] as const;

const OVER_1000 = { addPer500Ton: 125_000, cap: 1_831_000 };
const REGULATOR_FEE = 88_000;

const PIPELINE = {
	lt2km: 56_000,
	r2to5km: 115_000,
	r5to10km: 203_000,
	gte10km: { base: 203_000, addPerKm: 19_000 }, // >10km부터 가산
} as const;

export const calcLpgNetworkFee = (inputs: NetworkInputs) => {
	const plantTon = Math.max(0, inputs.plantCapacityTon ?? 0);
	const regCnt = Math.max(0, Math.floor(inputs.regulatorCount ?? 0));
	const km = Math.max(0, inputs.pipelineKm ?? 0);

	// 1) 제조소 (0t이면 0원)
	let plantFee = 0;
	if (plantTon > 0) {
		const row = PLANT_TABLE.find(r => plantTon <= r.maxTon);
		if (row) {
			plantFee = row.fee;
		} else {
			// ✅ '완전한' 500t 단위마다 가산 (예: 1000.1~1499.9 → 0단계, 1500~1999.9 → 1단계)
			const base = PLANT_TABLE[PLANT_TABLE.length - 1].fee; // ≤1000 구간
			const over = Math.max(0, plantTon - 1000);
			const steps = Math.floor(over / 500);
			plantFee = Math.min(base + steps * OVER_1000.addPer500Ton, OVER_1000.cap);
		}
	}

	// 2) 정압기 (대당, 0대면 0원)
	const regulatorFee = regCnt * REGULATOR_FEE;

	// 3) 배관 연장 (0km이면 0원)
	let pipeFee = 0;
	if (km > 0) {
		if (km < 2) pipeFee = PIPELINE.lt2km;
		else if (km < 5) pipeFee = PIPELINE.r2to5km;
		else if (km < 10) pipeFee = PIPELINE.r5to10km;
		else {
			// ✅ '완전한' 1km 단위마다 가산 (예: 10.1~10.999 → 0단계, 11.0~11.999 → 1단계)
			const overKm = Math.floor(Math.max(0, km - 10));
			pipeFee = PIPELINE.gte10km.base + overKm * PIPELINE.gte10km.addPerKm;
		}
	}

	return {
		fee: plantFee + regulatorFee + pipeFee,
		detail: { plantFee, regulatorFee, pipeFee },
	};
};
