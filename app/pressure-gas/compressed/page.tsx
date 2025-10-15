'use client';

import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
	calcHpCompressedFee,
	type HpInspect,
} from '@/lib/fees/highPressure/compressed';
import BackButton from '@/components/BackButton';

const schema = z.object({
	type: z.enum(['completion', 'intermediate', 'periodic']),
	capacityStdM3: z.number().min(0, '0 이상을 입력하세요.'),
});
type FormValues = z.infer<typeof schema>;
const resolver: Resolver<FormValues> = zodResolver<FormValues, any, FormValues>(
	schema,
);

const inputCls =
	'w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-indigo-400/40';
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

const HPCompressedPage = () => {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver,
		mode: 'onChange',
		defaultValues: {
			type: 'completion',
			capacityStdM3: 0,
		},
	});

	const values = watch();

	const result = useMemo(() => {
		const parsed = schema.safeParse(values);
		const v = parsed.success ? parsed.data : values;
		return calcHpCompressedFee(v.type as HpInspect, v.capacityStdM3 ?? 0);
	}, [values]);

	return (
		<motion.section
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
			className="min-h-[80vh] my-5 shadow-2xl border border-gray-300 rounded-2xl mx-auto max-w-3xl px-6 py-5 space-y-6 bg-white text-neutral-900"
		>
			<div className="w-full flex justify-end">
				<BackButton href="/pressure-gas" />
			</div>
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
					고압가스 — 압축 (제조·충전·저장)
				</h1>
				<p className="mt-2 text-[15px] text-black">
					표준상태(m³) 기준. 1,000,000m³ 초과 시 100,000m³ 단위 가산 + 상한
					적용. 중간검사 포함.
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
							className="mr-2 accent-indigo-600"
							{...register('type')}
						/>
						완성검사
					</label>
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="intermediate"
							className="mr-2 accent-indigo-600"
							{...register('type')}
						/>
						중간검사
					</label>
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="periodic"
							className="mr-2 accent-indigo-600"
							{...register('type')}
						/>
						정기검사
					</label>
				</div>
			</div>

			{/* 입력 */}
			<div className={sectionCls}>
				<label className={labelCls}>제조(충전·저장) 능력 — 표준상태 (m³)</label>
				<input
					type="number"
					min={0}
					step={100}
					placeholder="예: 1,250,000"
					className={inputCls}
					{...register('capacityStdM3', { valueAsNumber: true })}
				/>
				{errors.capacityStdM3 && (
					<p className={errCls}>{errors.capacityStdM3.message}</p>
				)}
				<p className="mt-2 text-xs text-neutral-800">
					* 0 또는 미입력 시 계산 금액은 0원으로 표시됩니다.
				</p>
			</div>

			{/* 결과 */}
			<div className={`${sectionCls} flex items-center justify-between`}>
				<div>
					<div className="text-sm">예상 수수료(부가세포함)</div>
					<div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
						{formatKRW(result.fee * 1.1 || 0)}
					</div>
					{'detail' in result && (
						<div className="mt-2 text-xs space-y-1">
							{'band' in (result as any).detail && (
								<div>구간: {(result as any).detail.band}</div>
							)}
							{(result as any).detail?.steps ? (
								<div>초과단계(×10만m³): {(result as any).detail.steps}</div>
							) : null}
							{(result as any).detail?.capped ? <div>상한 적용</div> : null}
						</div>
					)}
				</div>
				<button
					type="button"
					className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-slate-700 text-white font-semibold shadow"
				>
					계산됨
				</button>
			</div>
		</motion.section>
	);
};

export default HPCompressedPage;
