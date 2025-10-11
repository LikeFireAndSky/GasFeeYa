// app/city-gas/safety/page.tsx
'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	calcSafetyFacility,
	calcSafetySystem,
	type SafetyType,
} from '@/lib/fees/cityGas/safety';

const schema = z.object({
	mode: z.enum(['facility', 'system']),
	pipelineKm: z.coerce.number().min(0).default(0), // 시설
	totalKm: z.coerce.number().min(0).default(0), // 시스템
});
type FormValues = z.input<typeof schema>;

const card =
	'rounded-2xl bg-white border border-neutral-200 p-4 sm:p-5 shadow-sm';
const label = 'text-sm text-neutral-900 mb-1 block';
const input =
	'w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-400/40';
const err = 'text-xs text-rose-600 mt-1';
const fmt = (n: number) =>
	new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		maximumFractionDigits: 0,
	}).format(n);

const SafetyEvalPage = () => {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: { mode: 'facility', pipelineKm: 0, totalKm: 0 },
	});

	const v = watch();

	const result = useMemo(() => {
		const parsed = schema.safeParse(v);
		const data = parsed.success ? parsed.data : (v as Partial<FormValues>);

		const mode = (data.mode ?? 'facility') as SafetyType;

		if (mode === 'facility') {
			return calcSafetyFacility({ pipelineKm: Number(data.pipelineKm ?? 0) });
		}
		return calcSafetySystem({ totalKm: Number(data.totalKm ?? 0) });
	}, [v]);

	return (
		<section className="min-h-[80vh] mx-auto max-w-3xl px-6 py-10 space-y-6 rounded-2xl border border-gray-300 shadow-2xl bg-white text-neutral-900">
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
					도시가스 — 안전관리수준평가
				</h1>
				<p className="mt-2 text-[15px] text-black">
					시설: <b>배관길이 1km당 40,000원(1km 미만도 1km로 계산)</b>, 시스템:{' '}
					<b>총연장 구간별 정액</b>을 적용합니다.
				</p>
			</div>

			{/* 모드 선택 */}
			<div className={card}>
				<span className="text-sm text-neutral-900">평가 구분</span>
				<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
					<label className="inline-flex items-center cursor-pointer">
						<input
							type="radio"
							value="facility"
							className="mr-2 accent-emerald-600"
							{...register('mode')}
						/>
						<span className="text-neutral-900">시설(배관 km당)</span>
					</label>
					<label className="inline-flex items-center cursor-pointer">
						<input
							type="radio"
							value="system"
							className="mr-2 accent-emerald-600"
							{...register('mode')}
						/>
						<span className="text-neutral-900">시스템(총연장 구간별)</span>
					</label>
				</div>
			</div>

			{/* 입력 */}
			{v.mode === 'facility' ? (
				<div className={card}>
					<label className={label}>배관 길이 (km)</label>
					<input
						type="number"
						min={0}
						step={0.1}
						className={input}
						placeholder="예: 0.8"
						{...register('pipelineKm', { valueAsNumber: true })}
					/>
					{errors.pipelineKm && <p className={err}>0 이상 입력</p>}
					<p className="mt-2 text-xs text-neutral-900">
						* 1km 미만도 <b>1km로 계산</b>합니다. 0km 입력 시 0원 처리합니다.
					</p>
				</div>
			) : (
				<div className={card}>
					<label className={label}>배관 총연장 (km)</label>
					<input
						type="number"
						min={0}
						step={1}
						className={input}
						placeholder="예: 420"
						{...register('totalKm', { valueAsNumber: true })}
					/>
					{errors.totalKm && <p className={err}>0 이상 입력</p>}
					<p className="mt-2 text-xs text-neutral-900">
						* 밴드:{' '}
						{'<300 / 300–<500 / 500–<1000 / 1000–<2000 / 2000–<3000 / ≥3000'}.
					</p>
				</div>
			)}

			{/* 결과 */}
			<div className={`${card} flex items-center justify-between`}>
				<div>
					<div className="text-sm">예상 수수료(부가세포함)</div>
					<div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
						{fmt(result.fee * 1.1 || 0)}
					</div>

					{/* 상세 */}
					{'detail' in result && result.detail && (
						<div className="mt-2 text-xs text-neutral-900 space-y-1">
							{result.detail.kind === 'facility' ? (
								<>
									<div>적용 길이: {result.detail.chargedKm} km</div>
									<div>단가: {fmt(result.detail.unit)}</div>
								</>
							) : (
								<div>적용 구간: {result.detail.band}</div>
							)}
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

export default SafetyEvalPage;
