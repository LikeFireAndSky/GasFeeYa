// app/city-gas/specific/buried/page.tsx
'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	calcCgSpecificBuriedFee,
	type CgSpecType,
} from '@/lib/fees/cityGas/specificBuried';

const schema = z.object({
	type: z.enum(['completion', 'periodic']),
	housingType: z.enum(['detached', 'apartment']),
	household: z.coerce.number().int().min(1, '세대수는 1 이상'),
});

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

const CityGasSpecificBuriedPage = () => {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: {
			type: 'completion',
			housingType: 'apartment',
			household: 1,
		},
	});

	// 개별 필드 watch (원시값 의존)
	const type = watch('type');
	const housingType = watch('housingType');
	const household = watch('household');

	const result = useMemo(() => {
		const hh = Number.isFinite(household) ? (household as number) : 0;
		return calcCgSpecificBuriedFee((type ?? 'completion') as CgSpecType, {
			housingType: (housingType ?? 'apartment') as 'detached' | 'apartment',
			household: hh,
		});
	}, [type, housingType, household]);

	return (
		<section className="min-h-[80vh] mx-auto max-w-3xl px-6 py-10 space-y-6 rounded-2xl border border-gray-300 shadow-2xl bg-white text-neutral-900">
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
					도시가스 — 특정가스사용시설 (배관 매립)
				</h1>
				<p className="mt-2 text-[15px] text-black">
					단독주택 20세대 미만은 <b>세대수 × 20,000원</b>, 그 외/공동주택은{' '}
					<b>공동주택 계수 × 13,000원</b>으로 산정합니다. 정기검사는 표상 항목이
					없어 0원 처리됩니다.
				</p>
			</div>

			{/* 검사종류 & 유형 */}
			<div className={card}>
				<div className="grid sm:grid-cols-2 gap-4">
					<div>
						<span className="text-sm">검사종류</span>
						<div className="mt-3 grid grid-cols-2 gap-2">
							<label className="inline-flex items-center cursor-pointer">
								<input
									type="radio"
									value="completion"
									className="mr-2 accent-sky-600"
									{...register('type')}
								/>
								완성검사
							</label>
							<label className="inline-flex items-center cursor-pointer">
								<input
									type="radio"
									value="periodic"
									className="mr-2 accent-sky-600"
									{...register('type')}
								/>
								정기검사
							</label>
						</div>
						<p className="mt-2 text-xs text-neutral-900">
							* 정기검사 항목 없음(‘–’) → 0원 처리
						</p>
					</div>

					<div>
						<span className="text-sm">주택 유형</span>
						<div className="mt-3 grid grid-cols-2 gap-2">
							<label className="inline-flex items-center cursor-pointer">
								<input
									type="radio"
									value="detached"
									className="mr-2 accent-sky-600"
									{...register('housingType')}
								/>
								단독주택
							</label>
							<label className="inline-flex items-center cursor-pointer">
								<input
									type="radio"
									value="apartment"
									className="mr-2 accent-sky-600"
									{...register('housingType')}
								/>
								공동주택
							</label>
						</div>
					</div>
				</div>
			</div>

			{/* 입력 */}
			<div className={card}>
				<label className={label}>세대수</label>
				<input
					type="number"
					min={1}
					step={1}
					className={input}
					{...register('household', { valueAsNumber: true })}
				/>
				{errors.household && <p className={err}>{errors.household.message}</p>}
				<p className="mt-2 text-xs text-neutral-900">
					* 단독 &lt; 20세대 = 세대수 × 20,000원. 그 외는 공동주택 계수 ×
					13,000원.
				</p>
			</div>

			{/* 결과 */}
			<div className={`${card} flex items-center justify-between`}>
				<div>
					<div className="text-sm text-neutral-900">예상 수수료</div>
					<div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
						{fmt(result.fee || 0)}
					</div>
					{result.detail && (
						<div className="mt-2 text-xs text-neutral-900 space-y-1">
							<div>
								유형:{' '}
								{result.detail.housingType === 'detached'
									? '단독주택'
									: '공동주택'}
							</div>
							<div>세대수: {result.detail.household}</div>
							{result.detail.unit ? (
								<div>단가: {fmt(result.detail.unit)}</div>
							) : null}
							{typeof result.detail.coef === 'number' ? (
								<div>계수: {result.detail.coef}</div>
							) : null}
							{result.detail.note ? <div>{result.detail.note}</div> : null}
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

export default CityGasSpecificBuriedPage;
