'use client';

import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	calcHpSpecificLiquidFee,
	type HpSpecificInspect,
} from '@/lib/fees/highPressure/specificLiquid';

const schema = z.object({
	type: z.enum(['completion', 'periodic']),
	capacityKg: z.number().min(0, '0 이상을 입력하세요.'),
});
type FormValues = z.infer<typeof schema>;
const resolver: Resolver<FormValues> = zodResolver<FormValues, any, FormValues>(
	schema,
);

const inputCls =
	'w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-fuchsia-400/40';
const labelCls = 'text-sm text-neutral-900 mb-1 block';
const sectionCls =
	'rounded-2xl bg-white border border-neutral-200 p-4 sm:p-5 shadow-sm';
const errCls = 'text-xs text-rose-600 mt-1';
const formatKRW = (n: number) =>
	new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		maximumFractionDigits: 0,
	}).format(n);

const HPSpecificLiquidPage = () => {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver,
		mode: 'onChange',
		defaultValues: {
			type: 'completion',
			capacityKg: 0,
		},
	});

	const values = watch();

	const result = useMemo(() => {
		const parsed = schema.safeParse(values);
		const v = parsed.success ? parsed.data : values;
		return calcHpSpecificLiquidFee(
			(v.type as HpSpecificInspect) ?? 'completion',
			v.capacityKg ?? 0,
		);
	}, [values]);

	return (
		<section className="min-h-[80vh] shadow-2xl border border-gray-300 rounded-2xl mx-auto max-w-3xl px-6 py-10 space-y-6 bg-white text-neutral-900">
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
					특정고압가스 사용시설 — 액화
				</h1>
				<p className="mt-2 text-[15px] text-black">
					저장능력(kg) 기준. 500kg 초과 시 <b>100kg 단위 가산(올림)</b> +{' '}
					<b>상한</b> 적용.
				</p>
			</div>

			{/* 검사종류 */}
			<div className={sectionCls}>
				<span className="text-sm">검사종류</span>
				<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="completion"
							className="mr-2 accent-fuchsia-600"
							{...register('type')}
						/>
						완성검사
					</label>
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="periodic"
							className="mr-2 accent-fuchsia-600"
							{...register('type')}
						/>
						정기검사
					</label>
				</div>
			</div>

			{/* 입력 */}
			<div className={sectionCls}>
				<label className={labelCls}>저장능력 (kg)</label>
				<input
					type="number"
					min={0}
					step={10}
					placeholder="예: 760"
					className={inputCls}
					{...register('capacityKg', { valueAsNumber: true })}
				/>
				{errors.capacityKg && (
					<p className={errCls}>{errors.capacityKg.message}</p>
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
					{'detail' in result && (
						<div className="mt-2 text-xs space-y-1">
							{'band' in (result as any).detail && (
								<div>구간: {(result as any).detail.band}</div>
							)}
							{(result as any).detail?.steps ? (
								<div>초과단계(×100kg): {(result as any).detail.steps}</div>
							) : null}
							{(result as any).detail?.capped ? <div>상한 적용</div> : null}
						</div>
					)}
				</div>
				<button
					type="button"
					className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-semibold shadow"
				>
					계산됨
				</button>
			</div>
		</section>
	);
};

export default HPSpecificLiquidPage;
