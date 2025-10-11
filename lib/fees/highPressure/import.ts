// lib/fees/highPressure/import.ts
// 고압가스(수입업 시설) 수수료: 완성/정기 정액

export type HpImportType = 'completion' | 'periodic';

const IMPORT_FEE = {
	completion: 139_000,
	periodic: 104_000,
} as const;

export const calcHpImportFacilityFee = (type: HpImportType) => {
	return { fee: IMPORT_FEE[type], note: '정액' };
};
