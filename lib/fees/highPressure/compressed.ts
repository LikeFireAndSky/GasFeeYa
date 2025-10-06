// lib/fees/highPressure/compressed.ts
// 고압가스(압축) 제조·충전·저장 수수료 계산 (완성/중간/정기)

export type HpInspect = "completion" | "intermediate" | "periodic";

type Band = { max: number; c?: number; i?: number; p?: number };

/** 표준상태 m³ 구간표 (완성/중간/정기) */
const BANDS: Band[] = [
  { max: 1_000, c: 212_000, i: 125_000, p: 152_000 },
  { max: 2_000, c: 371_000, i: 193_000, p: 231_000 },
  { max: 3_000, c: 466_000, i: 223_000, p: 282_000 },
  { max: 5_000, c: 548_000, i: 275_000, p: 342_000 },
  { max: 10_000, c: 927_000, i: 455_000, p: 656_000 },
  { max: 100_000, c: 1_519_000, i: 739_000, p: 1_017_000 },
  { max: 200_000, c: 2_027_000, i: 1_015_000, p: 1_703_000 },
  { max: 500_000, c: 2_582_000, i: 1_276_000, p: 2_182_000 },
  { max: 1_000_000, c: 3_195_000, i: 1_723_000, p: 2_637_000 },
];

// 100만 m³ 초과 가산/상한 (10만 m³ 단위 올림)
const OVER = {
  completion: { addPer100k: 161_000, cap: 4_297_000 },
  intermediate: { addPer100k: 87_000, cap: 2_435_000 },
  periodic: { addPer100k: 140_000, cap: 3_008_000 },
} as const;

const ceilDiv = (a: number, b: number) => Math.ceil(a / b);

export const calcHpCompressedFee = (type: HpInspect, stdM3: number) => {
  if (!Number.isFinite(stdM3) || stdM3 <= 0)
    return { fee: 0, detail: { band: "invalid" as const } };

  const row = BANDS.find((r) => stdM3 <= r.max);
  if (row) {
    const fee =
      type === "completion"
        ? row.c!
        : type === "intermediate"
        ? row.i!
        : row.p!;
    return { fee, detail: { band: `≤${row.max.toLocaleString()}m³` } };
  }

  // > 1,000,000 m³
  const base = BANDS[BANDS.length - 1];
  const baseFee =
    type === "completion"
      ? base.c!
      : type === "intermediate"
      ? base.i!
      : base.p!;

  const over = stdM3 - 1_000_000;
  const steps = ceilDiv(over, 100_000); // 10만 m³ 단위
  const add = OVER[type].addPer100k;
  const cap = OVER[type].cap;
  const fee0 = baseFee + steps * add;
  const fee = Math.min(fee0, cap);

  return { fee, detail: { band: ">1,000,000m³", steps, capped: fee === cap } };
};
