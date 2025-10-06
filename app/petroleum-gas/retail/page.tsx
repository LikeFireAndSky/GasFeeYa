"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  calcLpgRetailFee,
  type RetailInspectionType,
} from "@/lib/fees/lpgRetail";

/** RHF + Zod (검사종류만 선택) */
const schema = z.object({
  type: z.enum(["completion", "periodic"]),
});
type FormValues = z.infer<typeof schema>;

const sectionCls =
  "rounded-2xl bg-white border border-neutral-200 p-4 sm:p-5 shadow-sm";

const LPGRetailPage = () => {
  const { register, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      type: "completion",
    },
  });

  const values = watch();

  const result = useMemo(() => {
    const parsed = schema.safeParse(values);
    const t = (
      parsed.success ? parsed.data.type : values.type ?? "completion"
    ) as RetailInspectionType;
    return calcLpgRetailFee(t);
  }, [values]);

  const formatKRW = (n: number) =>
    new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <section className="min-h-[80vh] rounded-2xl shadow-2xl border border-gray-300 mx-auto max-w-3xl px-6 py-10 space-y-6 bg-white text-neutral-900">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          판매시설 (정액)
        </h1>
        <p className="mt-2 text-[15px]">
          판매소마다 정액으로 산정됩니다. 검사종류를 선택하세요.
        </p>
      </div>

      {/* 검사종류 */}
      <div className={sectionCls}>
        <span className="text-sm">검사종류</span>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="cursor-pointer inline-flex items-center">
            <input
              type="radio"
              value="completion"
              className="mr-2 accent-amber-600"
              {...register("type")}
            />
            완성검사 (정액)
          </label>
          <label className="cursor-pointer inline-flex items-center">
            <input
              type="radio"
              value="periodic"
              className="mr-2 accent-amber-600"
              {...register("type")}
            />
            정기검사 (정액)
          </label>
        </div>
      </div>

      {/* 결과 */}
      <div className={`${sectionCls} flex items-center justify-between`}>
        <div>
          <div className="text-sm">예상 수수료</div>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {formatKRW(result.fee)}
          </div>
          <div className="mt-2 text-xs">판매소마다 정액 기준입니다.</div>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold shadow"
        >
          계산됨
        </button>
      </div>
    </section>
  );
};

export default LPGRetailPage;
