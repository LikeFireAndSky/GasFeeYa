'use client';

import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
	calcHpRetailFee,
	type HpRetailType,
} from '@/lib/fees/highPressure/retail';
import BackButton from '@/components/BackButton';

const schema = z.object({
	type: z.enum(['completion', 'periodic']),
});
type FormValues = z.infer<typeof schema>;
const resolver: Resolver<FormValues> = zodResolver<FormValues, any, FormValues>(
	schema,
);

const sectionCls =
	'rounded-2xl bg-white border border-neutral-200 p-4 sm:p-5 shadow-sm';
const formatKRW = (n: number) =>
	new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		maximumFractionDigits: 0,
	}).format(n);

const HPRetailPage = () => {
	const { register, watch } = useForm<FormValues>({
		resolver,
		mode: 'onChange',
		defaultValues: {
			type: 'completion',
		},
	});

	const values = watch();

	const result = useMemo(() => {
		const parsed = schema.safeParse(values);
		const v = parsed.success ? parsed.data : values;
		return calcHpRetailFee((v.type as HpRetailType) ?? 'completion');
	}, [values]);

	return (
		<motion.section className="min-h-[80vh] my-5 shadow-2xl border border-gray-300 rounded-2xl mx-auto max-w-3xl px-6 py-5 space-y-6 bg-white text-neutral-900">
			<div className="w-full flex justify-end">
				<BackButton href="/pressure-gas" />
			</div>
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
					고압가스 — 판매시설 (정액)
				</h1>
				<p className="mt-2 text-[15px] text-black">
					판매시설은 <b>완성검사 정액</b>으로 산정됩니다. 정기검사는 별도 규정이
					없습니다.
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
							className="mr-2 accent-amber-600"
							{...register('type')}
						/>
						완성검사 (정액)
					</label>
					<label className="cursor-pointer inline-flex items-center opacity-70">
						<input
							type="radio"
							value="periodic"
							className="mr-2 accent-amber-600"
							{...register('type')}
						/>
						정기검사 (해당 없음)
					</label>
				</div>
			</div>

			{/* 결과 */}
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
					className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow"
				>
					계산됨
				</button>
			</div>
		</motion.section>
	);
};

export default HPRetailPage;
