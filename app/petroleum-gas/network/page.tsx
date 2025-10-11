'use client';

import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { calcLpgNetworkFee } from '@/lib/fees/lpgNetwork';

// ✅ 각 항목 포함 여부 + 값
const schema = z
	.object({
		includePlant: z.boolean(),
		includeRegulator: z.boolean(),
		includePipeline: z.boolean(),

		plantCapacityTon: z.number().min(0, '0 이상을 입력하세요.'),
		regulatorCount: z.number().int().min(0, '0 이상을 입력하세요.'),
		pipelineKm: z.number().min(0, '0 이상을 입력하세요.'),
	})
	.superRefine((v, ctx) => {
		// 최소 한 항목은 포함
		if (!v.includePlant && !v.includeRegulator && !v.includePipeline) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['includePlant'],
				message: '최소 한 항목을 선택하세요.',
			});
		}
		// 포함된 항목은 "양수" 권장(0도 허용하지만 0이면 0원)
		if (v.includePlant && v.plantCapacityTon < 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['plantCapacityTon'],
				message: '0 이상을 입력하세요.',
			});
		}
		if (v.includeRegulator && v.regulatorCount < 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['regulatorCount'],
				message: '0 이상을 입력하세요.',
			});
		}
		if (v.includePipeline && v.pipelineKm < 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['pipelineKm'],
				message: '0 이상을 입력하세요.',
			});
		}
	});
type FormValues = z.infer<typeof schema>;

// resolver 고정
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

const LPGNetworkPage = () => {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver,
		mode: 'onChange',
		defaultValues: {
			includePlant: true,
			includeRegulator: false,
			includePipeline: false,
			plantCapacityTon: 0,
			regulatorCount: 0,
			pipelineKm: 0,
		},
	});

	const values = watch();

	// 포함된 항목만 계산 (0이면 해당 항목 0원)
	const result = useMemo(() => {
		const parsed = schema.safeParse(values);
		const v = parsed.success ? parsed.data : values;

		const inputs = {
			plantCapacityTon: v.includePlant ? v.plantCapacityTon ?? 0 : 0,
			regulatorCount: v.includeRegulator ? v.regulatorCount ?? 0 : 0,
			pipelineKm: v.includePipeline ? v.pipelineKm ?? 0 : 0,
		};
		return calcLpgNetworkFee(inputs);
	}, [values]);

	return (
		<section className="min-h-[80vh] shadow-2xl rounded-2xl border border-gray-300 mx-auto max-w-3xl px-6 py-10 space-y-6 bg-white text-neutral-900">
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
					배관망공급사업 (정기검사 전용)
				</h1>
				<p className="mt-2 text-[15px]">
					필요한 항목만 선택하여 입력하세요. 선택하지 않은 항목은 계산에
					포함되지 않습니다.
				</p>
			</div>

			<div className={`${sectionCls} space-y-5`}>
				{/* 제조소 */}
				<div className="space-y-2">
					<label className="inline-flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							className="size-4 accent-violet-600"
							{...register('includePlant')}
						/>
						<span className="text-sm">제조소 저장능력 포함</span>
					</label>
					<div>
						<label className={labelCls}>제조소 저장능력 (ton)</label>
						<input
							type="number"
							min={0}
							step={0.1}
							placeholder="예: 30"
							className={inputCls}
							{...register('plantCapacityTon', { valueAsNumber: true })}
						/>
						{errors.plantCapacityTon && (
							<p className={errCls}>{errors.plantCapacityTon.message}</p>
						)}
					</div>
				</div>

				{/* 정압기 */}
				<div className="space-y-2">
					<label className="inline-flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							className="size-4 accent-violet-600"
							{...register('includeRegulator')}
						/>
						<span className="text-sm">정압기 포함</span>
					</label>
					<div>
						<label className={labelCls}>정압기 대수 (대)</label>
						<input
							type="number"
							min={0}
							step={1}
							placeholder="예: 3"
							className={inputCls}
							{...register('regulatorCount', { valueAsNumber: true })}
						/>
						{errors.regulatorCount && (
							<p className={errCls}>{errors.regulatorCount.message}</p>
						)}
					</div>
				</div>

				{/* 배관 연장 */}
				<div className="space-y-2">
					<label className="inline-flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							className="size-4 accent-violet-600"
							{...register('includePipeline')}
						/>
						<span className="text-sm">배관 연장 포함</span>
					</label>
					<div>
						<label className={labelCls}>배관 연장 (km)</label>
						<input
							type="number"
							min={0}
							step={0.1}
							placeholder="예: 12.5"
							className={inputCls}
							{...register('pipelineKm', { valueAsNumber: true })}
						/>
						{errors.pipelineKm && (
							<p className={errCls}>{errors.pipelineKm.message}</p>
						)}
					</div>
				</div>

				<p className="text-xs">
					* 포함 체크가 된 항목만 계산에 반영됩니다. (값이 0이면 해당 항목 0원)
				</p>
			</div>

			<div className={`${sectionCls} flex items-center justify-between`}>
				<div>
					<div className="text-sm">예상 수수료(부가세포함)</div>
					<div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
						{formatKRW(result.fee * 1.1 || 0)}
					</div>
					<div className="mt-2 text-xs space-y-1">
						<div>제조소: {formatKRW(result.detail.plantFee)}</div>
						<div>정압기: {formatKRW(result.detail.regulatorFee)}</div>
						<div>배관연장: {formatKRW(result.detail.pipeFee)}</div>
					</div>
				</div>
				<button
					type="button"
					className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow"
				>
					계산됨
				</button>
			</div>
		</section>
	);
};

export default LPGNetworkPage;
