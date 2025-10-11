// lib/fees/highPressure/pipeline.ts
// 고압가스(배관) 수수료 계산 (완성/중간/정기 + 위치별 규칙)

export type HpInspect = 'completion' | 'intermediate' | 'periodic';
export type PipelineLocation =
	| 'inside'
	| 'outside_exposed'
	| 'outside_underground';

type Row = { maxKm: number; fee: number };

// 제조소 경계 '내' 배관: 완성/정기 테이블(동일) + >5km 가산(1km당 65,000원)
const INSIDE_CP: Row[] = [
	{ maxKm: 1, fee: 209_000 },
	{ maxKm: 2, fee: 392_000 },
	{ maxKm: 3, fee: 571_000 },
	{ maxKm: 4, fee: 753_000 },
	{ maxKm: 5, fee: 937_000 },
];
const INSIDE_CP_ADD_PER_KM = 65_000;

// 제조소 경계 '내' 배관: 중간검사 테이블 + >5km 가산(1km당 33,000원)
const INSIDE_I: Row[] = [
	{ maxKm: 1, fee: 144_000 },
	{ maxKm: 2, fee: 228_000 },
	{ maxKm: 3, fee: 325_000 },
	{ maxKm: 4, fee: 409_000 },
	{ maxKm: 5, fee: 504_000 },
];
const INSIDE_I_ADD_PER_KM = 33_000;

/** 제조소 경계 '내' 배관 기준 계산 (완성/정기 공통 로직, 중간은 별도)
 *  ▶ 변경: 5km 초과분 가산은 '완전한' 1km 단위마다 적용
 *     예) 5.1~5.999km → 0단계, 6.0~6.999km → 1단계, 7.0~7.999km → 2단계
 */
const calcInsideFee = (type: HpInspect, lengthKm: number) => {
	if (!Number.isFinite(lengthKm) || lengthKm <= 0) {
		return { fee: 0, detail: { band: 'invalid' as const } };
	}

	if (type === 'intermediate') {
		const row = INSIDE_I.find(r => lengthKm <= r.maxKm);
		if (row) return { fee: row.fee, detail: { band: `≤${row.maxKm}km` } };

		const fullExtraKm = Math.floor(Math.max(0, lengthKm - 5)); // ✅ 완전한 1km 단위만 가산
		const base5 = INSIDE_I[INSIDE_I.length - 1].fee;
		const fee = base5 + fullExtraKm * INSIDE_I_ADD_PER_KM;
		return {
			fee,
			detail: {
				band: '>5km',
				overKm: fullExtraKm,
				addPerKm: INSIDE_I_ADD_PER_KM,
			},
		};
	}

	// completion | periodic (동일 테이블/가산)
	const row = INSIDE_CP.find(r => lengthKm <= r.maxKm);
	if (row) return { fee: row.fee, detail: { band: `≤${row.maxKm}km` } };

	const fullExtraKm = Math.floor(Math.max(0, lengthKm - 5)); // ✅ 완전한 1km 단위만 가산
	const base5 = INSIDE_CP[INSIDE_CP.length - 1].fee;
	const fee = base5 + fullExtraKm * INSIDE_CP_ADD_PER_KM;
	return {
		fee,
		detail: {
			band: '>5km',
			overKm: fullExtraKm,
			addPerKm: INSIDE_CP_ADD_PER_KM,
		},
	};
};

/**
 * 경계 '밖' 노출배관:
 * - 완성/중간: [별표] 금액 그대로(= inside 로직)
 * - 정기: [별표] 배관 '정기' 수수료의 1/2 적용 (반올림)
 */
const calcOutsideExposedFee = (type: HpInspect, lengthKm: number) => {
	if (type === 'periodic') {
		const insidePeriodic = calcInsideFee('periodic', lengthKm);
		const half = Math.round(insidePeriodic.fee / 2);
		return {
			fee: half,
			detail: {
				...insidePeriodic.detail,
				note: '경계 밖 노출배관 정기 = 배관 정기 수수료의 1/2',
			},
		};
	}
	// 완성/중간은 inside와 동일
	return calcInsideFee(type, lengthKm);
};

/** 경계 '밖' 지하배관: 별도 고시(도시가스) 일단가 × 소요일수 → 여기서는 안내만 */
const calcOutsideUndergroundFee = (_type: HpInspect, lengthKm: number) => {
	if (!Number.isFinite(lengthKm) || lengthKm <= 0) {
		return { fee: 0, detail: { band: 'invalid' as const } };
	}
	return {
		fee: 0,
		detail: {
			band: 'not-applicable',
			note: '경계 밖 지하배관은 도시가스 고시의 감리 일단가 × 소요일수로 산정(별도 규정).',
		},
	};
};

export const calcHpPipelineFee = (
	type: HpInspect,
	lengthKm: number,
	location: PipelineLocation,
): {
	fee: number;
	detail: { band: string; overKm?: number; addPerKm?: number; note?: string };
} => {
	if (location === 'inside') return calcInsideFee(type, lengthKm);
	if (location === 'outside_exposed')
		return calcOutsideExposedFee(type, lengthKm);
	return calcOutsideUndergroundFee(type, lengthKm);
};
