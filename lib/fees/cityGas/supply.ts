// lib/fees/cityGas/supply.ts
// 도시가스 가스공급시설 — 정기검사 수수료 계산
// 항목: 제조소(SNG/일반), 공급소, 정압(밸브)기지, 정압기, 배관 연장(km)

export type CgSupplyInputs = {
	sngPlant?: number; // 가스도매(SNG) 제조소 개수
	generalPlant?: number; // 일반도시가스 제조소 개수
	supplyStations?: number; // 공급소 개수
	valveStations?: number; // 정압(밸브)기지 개수
	regulators?: number; // 정압기 개수
	pipelineKm?: number; // 배관 연장(km)
};

export type CgSupplyDetail = {
	sngPlantFee: number;
	generalPlantFee: number;
	supplyStationFee: number;
	valveStationFee: number;
	regulatorFee: number;
	pipelineFee: number;
	pipelineBand?: '<2km' | '2–<5km' | '5–<10km' | '≥10km';
	pipelineOverKm?: number; // 10km 초과 올림 km
	pipelineAddPerKm?: number; // 19,000
};

const UNIT = {
	sngPlant: 1_030_000,
	generalPlant: 545_000,
	supplyStation: 245_000,
	valveStation: 197_000,
	regulator: 88_000,
} as const;

// 배관: <2 56,000 / 2–<5 115,000 / 5–<10 203,000 / ≥10 : 203,000 + (10 초과 km당 19,000)
const PIPE = {
	lt2: 56_000,
	r2to5: 115_000,
	r5to10: 203_000,
	gte10: { base: 203_000, addPerKm: 19_000 },
} as const;

const nni = (v?: number) => Math.max(0, Math.floor(Number(v ?? 0))); // 개수 정수화(음수 방지)
const nn = (v?: number) => Math.max(0, Number(v ?? 0)); // 길이 등 실수 허용

export const calcCgSupplyPeriodicFee = (
	input: CgSupplyInputs,
): { fee: number; detail: CgSupplyDetail } => {
	const sngCnt = nni(input.sngPlant);
	const genCnt = nni(input.generalPlant);
	const supCnt = nni(input.supplyStations);
	const valCnt = nni(input.valveStations);
	const regCnt = nni(input.regulators);
	const km = nn(input.pipelineKm);

	const sngPlantFee = sngCnt * UNIT.sngPlant;
	const generalPlantFee = genCnt * UNIT.generalPlant;
	const supplyStationFee = supCnt * UNIT.supplyStation;
	const valveStationFee = valCnt * UNIT.valveStation;
	const regulatorFee = regCnt * UNIT.regulator;

	let pipelineFee = 0;
	let pipelineBand: CgSupplyDetail['pipelineBand'];
	let pipelineOverKm: number | undefined;

	if (km > 0) {
		if (km < 2) {
			pipelineFee = PIPE.lt2;
			pipelineBand = '<2km';
		} else if (km < 5) {
			pipelineFee = PIPE.r2to5;
			pipelineBand = '2–<5km';
		} else if (km < 10) {
			pipelineFee = PIPE.r5to10;
			pipelineBand = '5–<10km';
		} else {
			const over = Math.ceil(km - 10); // 10km 초과 '1km 단위' 올림
			pipelineFee = PIPE.gte10.base + over * PIPE.gte10.addPerKm;
			pipelineBand = '≥10km';
			pipelineOverKm = over;
		}
	}

	const fee =
		sngPlantFee +
		generalPlantFee +
		supplyStationFee +
		valveStationFee +
		regulatorFee +
		pipelineFee;

	return {
		fee,
		detail: {
			sngPlantFee,
			generalPlantFee,
			supplyStationFee,
			valveStationFee,
			regulatorFee,
			pipelineFee,
			pipelineBand,
			pipelineOverKm,
			pipelineAddPerKm:
				pipelineBand === '≥10km' ? PIPE.gte10.addPerKm : undefined,
		},
	};
};
