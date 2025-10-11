// lib/fees/highPressure/retail.ts
// 고압가스(판매시설) 수수료: 완성검사 정액, 정기 없음

export type HpRetailType = 'completion' | 'periodic';

export const HP_RETAIL_COMPLETION_FEE = 139_000 as const;

export const calcHpRetailFee = (type: HpRetailType) => {
	if (type !== 'completion') {
		return {
			fee: 0,
			note: '판매시설은 정기검사 수수료가 별도로 규정되어 있지 않습니다.',
		};
	}
	return { fee: HP_RETAIL_COMPLETION_FEE, note: '완성검사 정액' };
};
