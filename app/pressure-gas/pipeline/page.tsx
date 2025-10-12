'use client';

import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
	calcHpPipelineFee,
	type HpInspect,
	type PipelineLocation,
} from '@/lib/fees/highPressure/pipeline';

const schema = z.object({
	type: z.enum(['completion', 'intermediate', 'periodic']),
	location: z.enum(['inside', 'outside_exposed', 'outside_underground']),
	lengthKm: z.number().min(0, '0 이상을 입력하세요.'),
});
type FormValues = z.infer<typeof schema>;
const resolver: Resolver<FormValues> = zodResolver<FormValues, any, FormValues>(
	schema,
);

const inputCls =
	'w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-violet-400/40';
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

const HPPipelinePage = () => {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver,
		mode: 'onChange',
		defaultValues: {
			type: 'completion',
			location: 'inside',
			lengthKm: 0,
		},
	});

	const values = watch();

	const result = useMemo(() => {
		const parsed = schema.safeParse(values);
		const v = parsed.success ? parsed.data : values;
		return calcHpPipelineFee(
			(v.type as HpInspect) ?? 'completion',
			v.lengthKm ?? 0,
			(v.location as PipelineLocation) ?? 'inside',
		);
	}, [values]);

	return (
		<motion.section
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
			className="min-h-[80vh] my-5 shadow-2xl border border-gray-300 rounded-2xl mx-auto max-w-3xl px-6 py-10 space-y-6 bg-white text-neutral-900"
		>
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
					고압가스 — 배관(제조소 경계 내/외)
				</h1>
				<p className="mt-2 text-[15px] text-black">
					연장(km) 기준. 5km 초과분은 1km 단위 가산(올림). 위치에 따라 정기 1/2
					규정이 적용될 수 있습니다.
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
							className="mr-2 accent-violet-600"
							{...register('type')}
						/>
						완성검사
					</label>
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="intermediate"
							className="mr-2 accent-violet-600"
							{...register('type')}
						/>
						중간검사
					</label>
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="periodic"
							className="mr-2 accent-violet-600"
							{...register('type')}
						/>
						정기검사
					</label>
				</div>
			</div>

			{/* 위치 */}
			<div className={sectionCls}>
				<span className="text-sm">위치</span>
				<div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="inside"
							className="mr-2 accent-violet-600"
							{...register('location')}
						/>
						제조소 경계 내
					</label>
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="outside_exposed"
							className="mr-2 accent-violet-600"
							{...register('location')}
						/>
						경계 밖(노출)
					</label>
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="outside_underground"
							className="mr-2 accent-violet-600"
							{...register('location')}
						/>
						경계 밖(지하)
					</label>
				</div>
			</div>

			{/* 입력 */}
			<div className={sectionCls}>
				<label className={labelCls}>배관 연장 (km)</label>
				<input
					type="number"
					min={0}
					step={0.1}
					placeholder="예: 6.3"
					className={inputCls}
					{...register('lengthKm', { valueAsNumber: true })}
				/>
				{errors.lengthKm && <p className={errCls}>{errors.lengthKm.message}</p>}
				<p className="mt-2 text-xs text-neutral-700">
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
							{(result as any).detail?.overKm ? (
								<div>초과 가산(㎞): {(result as any).detail.overKm}</div>
							) : null}
							{(result as any).detail?.addPerKm ? (
								<div>
									가산 단가(1km당): {formatKRW((result as any).detail.addPerKm)}
								</div>
							) : null}
							{(result as any).detail?.note ? (
								<div>{(result as any).detail.note}</div>
							) : null}
						</div>
					)}
				</div>
				<button
					type="button"
					className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow"
				>
					계산됨
				</button>
			</div>
		</motion.section>
	);
};

export default HPPipelinePage;
