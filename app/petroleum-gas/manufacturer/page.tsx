'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	calcLpgManufacturerFee,
	type ManufacturerInspectionType,
} from '@/lib/fees/lpgManufacturer';

const schema = z.object({
	type: z.enum(['completion', 'periodic']),
});
type FormValues = z.infer<typeof schema>;

const sectionCls =
	'rounded-2xl bg-white border border-neutral-200 p-4 sm:p-5 shadow-sm';
const inputLabel = 'text-sm text-neutral-900';
const formatKRW = (n: number) =>
	new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		maximumFractionDigits: 0,
	}).format(n);

const LPGManufacturerPage = () => {
	const { register, watch } = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: { type: 'completion' },
	});
	const values = watch();

	const result = useMemo(() => {
		const parsed = schema.safeParse(values);
		const t = (
			parsed.success ? parsed.data.type : values.type ?? 'completion'
		) as ManufacturerInspectionType;
		return calcLpgManufacturerFee(t);
	}, [values]);

	return (
		<section className="min-h-[80vh] mx-auto shadow-2xl border border-gray-300 rounded-2xl max-w-3xl px-6 py-10 space-y-6 bg-white text-neutral-900">
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
					가스용품 제조시설 (완성검사만)
				</h1>
				<p className="mt-2 text-[15px]">
					제조시설은 완성검사만 정액으로 산정됩니다.
				</p>
			</div>

			<div className={sectionCls}>
				<span className={inputLabel}>검사종류</span>
				<div className="mt-3 grid grid-cols-2 gap-2">
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="completion"
							className="mr-2 accent-emerald-600"
							{...register('type')}
						/>
						완성검사 (정액)
					</label>
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="periodic"
							className="mr-2 accent-emerald-600"
							{...register('type')}
						/>
						정기검사 (해당 없음)
					</label>
				</div>
			</div>

			<div className={`${sectionCls} flex items-center justify-between`}>
				<div>
					<div className="text-sm">예상 수수료(부가세포함)</div>
					<div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
						{formatKRW(result.fee * 1.1 || 0)}
					</div>
					{result.note && <div className="mt-2 text-xs">{result.note}</div>}
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

export default LPGManufacturerPage;
