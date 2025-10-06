// lib/fees/lpgManufacturer.ts
// 가스용품 제조시설: 완성검사만 정액 (정기는 표 없음)

export type ManufacturerInspectionType = "completion" | "periodic";

export const MANUFACTURER_COMPLETION_FEE = 429_000 as const;

export const calcLpgManufacturerFee = (type: ManufacturerInspectionType) => {
  if (type !== "completion") {
    return { fee: 0, note: "가스용품 제조시설은 완성검사만 해당합니다." };
  }
  return { fee: MANUFACTURER_COMPLETION_FEE, note: "완성검사 정액" };
};
