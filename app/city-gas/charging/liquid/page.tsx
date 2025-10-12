// app/city-gas/charging/liquid/page.tsx
'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	calcCgChargingLiquidFee,
	type CgInspect,
} from '@/lib/fees/cityGas/chargingLiquid';

const schema = z.object({
	type: z.enum(['completion', 'intermediate', 'periodic']),
	capacityTon: z.number().min(0, '0 이상을 입력하세요.'),
});

// RHF 입력 타입
type FormValues = z.input<typeof schema>;

const card =
	'rounded-2xl bg-white border border-neutral-200 p-4 sm:p-5 shadow-sm';
const label = 'text-sm text-neutral-900 mb-1 block';
const input =
	'w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-sky-400/40';
const err = 'text-xs text-rose-600 mt-1';

const fmt = (n: number) =>
	new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		maximumFractionDigits: 0,
	}).format(n);

const CityGasChargingLiquidPage = () => {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: {
			type: 'completion',
			capacityTon: 0,
		},
	});

	const v = watch();

	const result = useMemo(() => {
		const parsed = schema.safeParse(v);
		const data = parsed.success ? parsed.data : (v as Partial<FormValues>);

		const type = (data.type ?? 'completion') as CgInspect;
		const ton = data.capacityTon ?? 0;

		return calcCgChargingLiquidFee(type, ton);
	}, [v]);

	return (
		<section className="min-h-[80vh] my-5 mx-auto max-w-3xl px-6 py-10 space-y-6 rounded-2xl border border-gray-300 shadow-2xl bg-white text-neutral-900">
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
					도시가스 — 충전시설 (액화가스)
				</h1>
				<p className="mt-2 text-[15px] text-black">
					저장능력(ton) 기준. <b>1,000t 초과 시 “완전한 500t”</b>마다 가산 +
					상한 적용. 중간검사 포함.
				</p>
			</div>

			{/* 검사종류 */}
			<div className={card}>
				<span className="text-sm text-neutral-900">검사종류</span>
				<div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
					<label className="inline-flex items-center cursor-pointer">
						<input
							type="radio"
							value="completion"
							className="mr-2 accent-sky-600"
							{...register('type')}
						/>
						<span className="text-neutral-900">완성검사</span>
					</label>
					<label className="inline-flex items-center cursor-pointer">
						<input
							type="radio"
							value="intermediate"
							className="mr-2 accent-sky-600"
							{...register('type')}
						/>
						<span className="text-neutral-900">중간검사</span>
					</label>
					<label className="inline-flex items-center cursor-pointer">
						<input
							type="radio"
							value="periodic"
							className="mr-2 accent-sky-600"
							{...register('type')}
						/>
						<span className="text-neutral-900">정기검사</span>
					</label>
				</div>
			</div>

			{/* 입력 */}
			<div className={card}>
				<label className={label}>저장(처리)능력 — ton</label>
				<input
					type="number"
					min={0}
					step={0.1}
					placeholder="예: 1200"
					className={input}
					{...register('capacityTon', { valueAsNumber: true })}
				/>
				{errors.capacityTon && (
					<p className={err}>{errors.capacityTon.message}</p>
				)}
				<p className="mt-2 text-xs text-neutral-800">
					* 1,000t 초과분은 <b>500t “완전단위”</b>가 찼을 때만 가산됩니다 (예:
					1,499t → 가산 0단계, 1,500t → 가산 1단계).
				</p>
			</div>

			{/* 결과 */}
			<div className={`${card} flex items-center justify-between`}>
				<div>
					<div className="text-sm">예상 수수료(부가세포함)</div>
					<div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
						{fmt(result.fee * 1.1 || 0)}
					</div>
					{'detail' in result && (
						<div className="mt-2 text-xs text-neutral-900 space-y-1">
							{'band' in (result as any).detail && (
								<div>구간: {(result as any).detail.band}</div>
							)}
							{(result as any).detail?.steps ? (
								<div>초과단계(×500t): {(result as any).detail.steps}</div>
							) : null}
							{(result as any).detail?.capped ? <div>상한 적용</div> : null}
						</div>
					)}
				</div>
				<button
					type="button"
					className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow"
				>
					계산됨
				</button>
			</div>
		</section>
	);
};

export default CityGasChargingLiquidPage;
