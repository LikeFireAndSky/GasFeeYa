"use client";

import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  calcHpRefrigerationFee,
  type HpInspect,
} from "@/lib/fees/highPressure/refrigeration";

const schema = z.object({
  type: z.enum(["completion", "intermediate", "periodic"]),
  capacityTon: z.number().min(0, "0 이상을 입력하세요."),
});
type FormValues = z.infer<typeof schema>;
const resolver: Resolver<FormValues> = zodResolver<FormValues, any, FormValues>(
  schema
);

const inputCls =
  "w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-400/40";
const labelCls = "text-sm text-neutral-900 mb-1 block";
const sectionCls =
  "rounded-2xl bg-white border border-neutral-200 p-4 sm:p-5 shadow-sm";
const errCls = "text-xs text-rose-600 mt-1";
const formatKRW = (n: number) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(n);

const HPRefrigerationPage = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver,
    mode: "onChange",
    defaultValues: {
      type: "completion",
      capacityTon: 0,
    },
  });

  const values = watch();

  const result = useMemo(() => {
    const parsed = schema.safeParse(values);
    const v = parsed.success ? parsed.data : values;
    return calcHpRefrigerationFee(v.type as HpInspect, v.capacityTon ?? 0);
  }, [values]);

  return (
    <section className="min-h-[80vh] rounded-2xl shadow-2xl border border-gray-300 mx-auto max-w-3xl px-6 py-10 space-y-6 bg-white text-neutral-900">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
          고압가스 — 냉동제조시설
        </h1>
        <p className="mt-2 text-[15px] text-black">
          냉동능력(ton) 기준. 500톤 초과 시 100톤 단위 가산 + 상한 적용.
          중간검사 포함.
        </p>
      </div>

      {/* 검사종류 */}
      <div className={sectionCls}>
        <span className="text-sm">검사종류</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label className="cursor-pointer inline-flex items-center">
            <input
              type="radio"
              value="completion"
              className="mr-2 accent-emerald-600"
              {...register("type")}
            />
            완성검사
          </label>
          <label className="cursor-pointer inline-flex items-center">
            <input
              type="radio"
              value="intermediate"
              className="mr-2 accent-emerald-600"
              {...register("type")}
            />
            중간검사
          </label>
          <label className="cursor-pointer inline-flex items-center">
            <input
              type="radio"
              value="periodic"
              className="mr-2 accent-emerald-600"
              {...register("type")}
            />
            정기검사
          </label>
        </div>
      </div>

      {/* 입력 */}
      <div className={sectionCls}>
        <label className={labelCls}>냉동능력 (ton)</label>
        <input
          type="number"
          min={0}
          step={0.1}
          placeholder="예: 275"
          className={inputCls}
          {...register("capacityTon", { valueAsNumber: true })}
        />
        {errors.capacityTon && (
          <p className={errCls}>{errors.capacityTon.message}</p>
        )}
        <p className="mt-2 text-xs text-neutral-700">
          * 0 또는 미입력 시 계산 금액은 0원으로 표시됩니다.
        </p>
      </div>

      {/* 결과 */}
      <div className={`${sectionCls} flex items-center justify-between`}>
        <div>
          <div className="text-sm">예상 수수료</div>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {formatKRW(result.fee || 0)}
          </div>
          {"detail" in result && (
            <div className="mt-2 text-xs space-y-1">
              {"band" in (result as any).detail && (
                <div>구간: {(result as any).detail.band}</div>
              )}
              {(result as any).detail?.steps ? (
                <div>초과단계(×100t): {(result as any).detail.steps}</div>
              ) : null}
              {(result as any).detail?.capped ? <div>상한 적용</div> : null}
            </div>
          )}
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow"
        >
          계산됨
        </button>
      </div>
    </section>
  );
};

export default HPRefrigerationPage;
