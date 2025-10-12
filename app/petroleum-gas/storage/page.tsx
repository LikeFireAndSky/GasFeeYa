'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	calcLpgStorageFee,
	type StorageInspectionType,
} from '@/lib/fees/lpgStorage';

/** RHF가 valueAsNumber로 number를 보장 → 스키마는 z.number() */
const schema = z.object({
	type: z.enum(['completion', 'periodic']),
	capacityTon: z.number().min(0.1, '저장능력(ton)을 입력하세요.'),
});
type FormValues = z.infer<typeof schema>;

const inputCls =
	'w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-cyan-400/40';
const labelCls = 'text-sm text-neutral-900 mb-1 block';
const sectionCls =
	'rounded-2xl bg-white border border-neutral-200 p-4 sm:p-5 shadow-sm';
const errCls = 'text-xs text-rose-600 mt-1';

const LPGStoragePage = () => {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: {
			type: 'completion',
			capacityTon: 1,
		},
	});

	const values = watch();

	const result = useMemo(() => {
		const parsed = schema.safeParse(values);
		if (!parsed.success) {
			const v = values as Partial<FormValues>;
			if (!v || !v.capacityTon || v.capacityTon <= 0)
				return { fee: 0, detail: null as any };
			const { fee, detail } = calcLpgStorageFee(
				(v.type ?? 'completion') as StorageInspectionType,
				v.capacityTon,
			);
			return { fee, detail };
		}
		const v = parsed.data;
		return calcLpgStorageFee(v.type, v.capacityTon);
	}, [values]);

	const formatKRW = (n: number) =>
		new Intl.NumberFormat('ko-KR', {
			style: 'currency',
			currency: 'KRW',
			maximumFractionDigits: 0,
		}).format(n);

	return (
		<section className="min-h-[80vh] my-5 mx-auto max-w-3xl rounded-2xl shadow-2xl border border-gray-300 px-6 py-10 space-y-6 bg-white text-neutral-900">
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
					충전·일반 집단공급·저장소
				</h1>
				<p className="mt-2 text-[15px]">
					저장능력(ton)을 입력하면 즉시 계산됩니다. 1,000t 초과 시 500t마다
					가산, 상한 적용.
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
							className="mr-2 accent-cyan-600"
							{...register('type')}
						/>
						완성검사
					</label>
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="periodic"
							className="mr-2 accent-cyan-600"
							{...register('type')}
						/>
						정기검사
					</label>
				</div>
			</div>

			{/* 입력 */}
			<div className={`${sectionCls} space-y-5`}>
				<div>
					<label className={labelCls}>저장능력 (ton)</label>
					<input
						type="number"
						min={0.1}
						step={0.1}
						placeholder="예: 12.5"
						className={inputCls}
						{...register('capacityTon', { valueAsNumber: true })}
					/>
					{errors.capacityTon && (
						<p className={errCls}>{errors.capacityTon.message}</p>
					)}
				</div>
			</div>

			{/* 결과 */}
			<div className={`${sectionCls} flex items-center justify-between`}>
				<div>
					<div className="text-sm">예상 수수료(부가세포함)</div>
					<div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
						{formatKRW(result.fee * 1.1 || 0)}
					</div>
					{result.detail && (
						<div className="mt-2 text-xs space-y-1">
							<div>적용 구간: {result.detail.band}</div>
							{'stepsOver1000' in (result.detail || {}) &&
								result.detail.stepsOver1000 != null && (
									<div>가산 스텝(500t 단위): {result.detail.stepsOver1000}</div>
								)}
							{result.detail?.capped && <div>상한 적용됨</div>}
						</div>
					)}
				</div>
				<button
					type="button"
					className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow"
				>
					계산됨
				</button>
			</div>
		</section>
	);
};

export default LPGStoragePage;
