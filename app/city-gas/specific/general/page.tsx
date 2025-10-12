// app/city-gas/specific/general/page.tsx
'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
	calcCgSpecificGeneralFee,
	type CgSpecType,
} from '@/lib/fees/cityGas/specificGeneral';

const schema = z.object({
	type: z.enum(['completion', 'periodic']),
	monthlyM3: z.number().min(0, '0 이상을 입력하세요.'),
	isProvincialDesignated: z.boolean().default(false),
	roomsWithAppliance: z.number().min(0).default(0),
	hasMetalDoubleFlue: z.boolean().default(false),
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

const CityGasSpecificGeneralPage = () => {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: {
			type: 'completion',
			monthlyM3: 0,
			isProvincialDesignated: false,
			roomsWithAppliance: 0,
			hasMetalDoubleFlue: false,
		},
	});

	// ✅ 개별 필드만 watch해서 원시값을 의존성으로 사용
	const type = watch('type');
	const monthlyM3Raw = watch('monthlyM3');
	const isProvincialDesignated = watch('isProvincialDesignated');
	const roomsWithAppliance = watch('roomsWithAppliance');
	const hasMetalDoubleFlue = watch('hasMetalDoubleFlue');

	const result = useMemo(() => {
		// 빈 입력시 NaN 방어
		const m3 = Number.isFinite(monthlyM3Raw) ? monthlyM3Raw : 0;

		return calcCgSpecificGeneralFee((type ?? 'completion') as CgSpecType, {
			monthlyM3: m3,
			isProvincialDesignated: !!isProvincialDesignated,
			roomsWithAppliance: Number.isFinite(roomsWithAppliance)
				? (roomsWithAppliance as number)
				: 0,
			hasMetalDoubleFlue: !!hasMetalDoubleFlue,
		});
	}, [
		type,
		monthlyM3Raw,
		isProvincialDesignated,
		roomsWithAppliance,
		hasMetalDoubleFlue,
	]);

	return (
		<motion.section
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
			className="min-h-[80vh] my-5 mx-auto max-w-3xl px-6 py-10 space-y-6 rounded-2xl border border-gray-300 shadow-2xl bg-white text-neutral-900"
		>
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
					도시가스 — 특정가스사용시설 (그 밖의 시설)
				</h1>
				<p className="mt-2 text-[15px] text-black">
					월사용예정량 기준. 4,000㎥ 초과 시 <b>500㎥ “완전 단위”</b> 가산 +
					상한 적용. (시·도 지정, 2실 이하 정기 상한, 금속 이중관 특례 반영)
				</p>
			</div>

			{/* 검사종류 */}
			<div className={card}>
				<span className="text-sm text-neutral-900">검사종류</span>
				<div className="mt-3 grid grid-cols-2 gap-2">
					<label className="inline-flex items-center cursor-pointer">
						<input
							type="radio"
							value="completion"
							className="mr-2 accent-sky-600"
							{...register('type')}
						/>
						<span className="text-neutral-900">완성검사</span>
					</label>
					<label className="inline-flex items-center cursor-pointer">
						<input
							type="radio"
							value="periodic"
							className="mr-2 accent-sky-600"
							{...register('type')}
						/>
						<span className="text-neutral-900">정기검사</span>
					</label>
				</div>
			</div>

			{/* 입력 */}
			<div className={card}>
				<label className={label}>월사용예정량 (㎥)</label>
				<input
					type="number"
					min={0}
					step={100}
					placeholder="예: 8,500"
					className={input}
					{...register('monthlyM3', { valueAsNumber: true })}
				/>
				{errors.monthlyM3 && <p className={err}>{errors.monthlyM3.message}</p>}

				<div className="mt-4 grid sm:grid-cols-2 gap-3">
					<label className="inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							className="mr-2 accent-sky-600"
							{...register('isProvincialDesignated')}
						/>
						<span className="text-neutral-900">
							시·도 지정 시설 (완성 = 정기 요율 적용)
						</span>
					</label>
					<label className="inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							className="mr-2 accent-sky-600"
							{...register('hasMetalDoubleFlue')}
						/>
						<span className="text-neutral-900">
							금속 이중관형 연돌 (완성 +104,000원)
						</span>
					</label>
				</div>

				<div className="mt-3">
					<label className={label}>연소기 설치 실 개수 (정기 특례)</label>
					<input
						type="number"
						min={0}
						step={1}
						className={input}
						{...register('roomsWithAppliance', { valueAsNumber: true })}
					/>
					<p className="mt-2 text-xs text-neutral-900">
						* 2실 이하 정기는 최종 금액이 194,000원을 넘지 않습니다.
					</p>
				</div>
			</div>

			{/* 결과 */}
			<div className={`${card} flex items-center justify-between`}>
				<div>
					<div className="text-sm">예상 수수료(부가세포함)</div>
					<div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
						{fmt(result.fee * 1.1 || 0)}
					</div>
					{result.detail && (
						<div className="mt-2 text-xs text-neutral-900 space-y-1">
							{result.detail.band !== 'zero' && (
								<div>구간: {result.detail.band}</div>
							)}
							{typeof result.detail.steps === 'number' ? (
								<div>초과단계(×500㎥): {result.detail.steps}</div>
							) : null}
							{result.detail.capped ? <div>상한 적용</div> : null}
							{result.detail.roomsHalfCap ? (
								<div>2실 이하 정기 상한(194,000) 적용</div>
							) : null}
							{result.detail.metalDoubleFlueAdded ? (
								<div>금속 이중관형 연돌 가산 +104,000원</div>
							) : null}
							{result.detail.provincialDesignated ? (
								<div>시·도 지정: 완성 → 정기 요율 적용</div>
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
		</motion.section>
	);
};

export default CityGasSpecificGeneralPage;
