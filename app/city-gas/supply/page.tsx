// app/city-gas/supply/page.tsx
'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { calcCgSupplyPeriodicFee } from '@/lib/fees/cityGas/supply';

const schema = z.object({
	sngPlant: z.coerce.number().min(0),
	generalPlant: z.coerce.number().min(0),
	supplyStations: z.coerce.number().min(0),
	valveStations: z.coerce.number().min(0),
	regulators: z.coerce.number().min(0),
	pipelineKm: z.coerce.number().min(0),
});
// RHF 입력 타입으로 맞추기
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

const CityGasSupplyPage = () => {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: {
			sngPlant: 0,
			generalPlant: 0,
			supplyStations: 0,
			valveStations: 0,
			regulators: 0,
			pipelineKm: 0,
		},
	});

	// 원시값 watch
	const sngPlant = watch('sngPlant');
	const generalPlant = watch('generalPlant');
	const supplyStations = watch('supplyStations');
	const valveStations = watch('valveStations');
	const regulators = watch('regulators');
	const pipelineKm = watch('pipelineKm');

	const result = useMemo(() => {
		return calcCgSupplyPeriodicFee({
			sngPlant: Number.isFinite(sngPlant) ? sngPlant : (0 as any),
			generalPlant: Number.isFinite(generalPlant) ? generalPlant : (0 as any),
			supplyStations: Number.isFinite(supplyStations)
				? supplyStations
				: (0 as any),
			valveStations: Number.isFinite(valveStations)
				? valveStations
				: (0 as any),
			regulators: Number.isFinite(regulators) ? regulators : (0 as any),
			pipelineKm: Number.isFinite(pipelineKm) ? pipelineKm : (0 as any),
		});
	}, [
		sngPlant,
		generalPlant,
		supplyStations,
		valveStations,
		regulators,
		pipelineKm,
	]);

	return (
		<section className="min-h-[80vh] my-5 mx-auto max-w-4xl px-6 py-10 space-y-6 rounded-2xl border border-gray-300 shadow-2xl bg-white text-neutral-900">
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
					도시가스 — 가스공급시설 (정기검사)
				</h1>
				<p className="mt-2 text-[15px] text-black">
					제조소·공급소·정압(밸브)기지·정압기 개수와 배관 연장을 입력하면
					정기검사 수수료를 합산합니다. 배관은{' '}
					<b>{`<2km / 2–<5km / 5–<10km / ≥10km: 203,000 + (초과 1km당 19,000)`}</b>{' '}
					규칙을 적용합니다.
				</p>
			</div>

			{/* 입력 */}
			<div className={card}>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<div>
						<label className={label}>제조소(SNG) — 개수</label>
						<input
							type="number"
							min={0}
							step={1}
							className={input}
							{...register('sngPlant', { valueAsNumber: true })}
						/>
						{errors.sngPlant && <p className={err}>0 이상 정수</p>}
					</div>

					<div>
						<label className={label}>제조소(일반) — 개수</label>
						<input
							type="number"
							min={0}
							step={1}
							className={input}
							{...register('generalPlant', { valueAsNumber: true })}
						/>
						{errors.generalPlant && <p className={err}>0 이상 정수</p>}
					</div>

					<div>
						<label className={label}>공급소 — 개수</label>
						<input
							type="number"
							min={0}
							step={1}
							className={input}
							{...register('supplyStations', { valueAsNumber: true })}
						/>
						{errors.supplyStations && <p className={err}>0 이상 정수</p>}
					</div>

					<div>
						<label className={label}>정압(밸브)기지 — 개수</label>
						<input
							type="number"
							min={0}
							step={1}
							className={input}
							{...register('valveStations', { valueAsNumber: true })}
						/>
						{errors.valveStations && <p className={err}>0 이상 정수</p>}
					</div>

					<div>
						<label className={label}>정압기 — 개수</label>
						<input
							type="number"
							min={0}
							step={1}
							className={input}
							{...register('regulators', { valueAsNumber: true })}
						/>
						{errors.regulators && <p className={err}>0 이상 정수</p>}
					</div>

					<div>
						<label className={label}>배관 연장 (km)</label>
						<input
							type="number"
							min={0}
							step={0.1}
							className={input}
							{...register('pipelineKm', { valueAsNumber: true })}
						/>
						{errors.pipelineKm && <p className={err}>0 이상</p>}
						<p className="mt-2 text-xs text-neutral-900">
							* 10km 초과분은 <b>1km 단위 올림</b>으로 가산합니다.
						</p>
					</div>
				</div>
			</div>

			{/* 결과 */}
			<div className={`${card} space-y-3`}>
				<div className="flex items-center justify-between">
					<div>
						<div className="text-sm">예상 수수료(부가세포함)</div>
						<div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
							{fmt(result.fee * 1.1 || 0)}
						</div>
					</div>
					<button
						type="button"
						className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow"
					>
						계산됨
					</button>
				</div>

				{/* Breakdown */}
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-neutral-900">
					<div>제조소(SNG): {fmt(result.detail.sngPlantFee)}</div>
					<div>제조소(일반): {fmt(result.detail.generalPlantFee)}</div>
					<div>공급소: {fmt(result.detail.supplyStationFee)}</div>
					<div>정압(밸브)기지: {fmt(result.detail.valveStationFee)}</div>
					<div>정압기: {fmt(result.detail.regulatorFee)}</div>
					<div>
						배관: {fmt(result.detail.pipelineFee)}{' '}
						{result.detail.pipelineBand
							? ` (${result.detail.pipelineBand})`
							: ''}
						{result.detail.pipelineBand === '≥10km' &&
						typeof result.detail.pipelineOverKm === 'number'
							? ` — 10km 초과 ${result.detail.pipelineOverKm}km × ${fmt(
									result.detail.pipelineAddPerKm || 19000,
							  )}`
							: ''}
					</div>
				</div>
			</div>
		</section>
	);
};

export default CityGasSupplyPage;
