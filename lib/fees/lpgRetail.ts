// lib/fees/lpgRetail.ts
// 판매시설(판매소마다 정액)

export type RetailInspectionType = "completion" | "periodic";

const RETAIL = {
  completion: 186_000,
  periodic: 127_000,
} as const;

export const calcLpgRetailFee = (type: RetailInspectionType) => {
  return { fee: RETAIL[type] };
};
