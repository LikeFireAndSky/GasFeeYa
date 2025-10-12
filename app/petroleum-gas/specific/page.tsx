'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	calcLpgSpecificFee,
	type SpecificInspectionType,
} from '@/lib/fees/lpgSpecific';

/** 1) 스키마: RHF가 valueAsNumber로 넘겨주는 number를 그대로 받는다 */
const schema = z.object({
	type: z.enum(['completion', 'periodic']),
	capacityKg: z.number().min(1, '저장능력(kg)을 입력하세요.'),
	isResidentialUnit: z.boolean(),
	householdCount: z.number().int().min(1).optional(), // 검증은 완화
	isSharedStorage: z.boolean(),
	userCount: z.number().int().min(1).optional(), // 검증은 완화
	isWelfareOrTraditionalMarket: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const inputCls =
	'w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-fuchsia-400/40';
const labelCls = 'text-sm text-neutral-900 mb-1 block';
const sectionCls =
	'rounded-2xl bg-white border border-neutral-200 p-4 sm:p-5 shadow-sm';
const errCls = 'text-xs text-rose-600 mt-1';

const LPGSpecificPage = () => {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: {
			type: 'completion',
			capacityKg: 1,
			isResidentialUnit: false,
			householdCount: undefined,
			isSharedStorage: false,
			userCount: undefined,
			isWelfareOrTraditionalMarket: false,
		},
	});

	const values = watch();

	/** 2) 실시간 계산: 주거형 체크 & 세대수 미입력 시 1세대로 간주해서 전달 */
	const result = useMemo(() => {
		const parsed = schema.safeParse(values);
		if (!parsed.success) {
			// 입력 중 에러가 있더라도 capacityKg만 있으면 최선을 다해 계산 시도
			const v = values as Partial<FormValues>;
			if (!v || !v.capacityKg || v.capacityKg < 1)
				return { fee: 0, detail: null as any, error: true };

			const fallback = calcLpgSpecificFee(
				(v.type ?? 'completion') as SpecificInspectionType,
				v.capacityKg,
				{
					isResidentialUnit: !!v.isResidentialUnit,
					// ✅ 세대수 입력 전이라도 1세대로 간주
					householdCount: v.isResidentialUnit
						? v.householdCount ?? 1
						: undefined,
					isSharedStorage: !!v.isSharedStorage,
					userCount: v.isSharedStorage ? v.userCount ?? 1 : undefined, // 사용자수도 미입력 시 1로 가정
					isWelfareOrTraditionalMarket: !!v.isWelfareOrTraditionalMarket,
				},
			);
			return { fee: fallback.fee, detail: fallback.detail, error: false };
		}

		const v = parsed.data;
		const { fee, detail } = calcLpgSpecificFee(
			v.type as SpecificInspectionType,
			v.capacityKg,
			{
				isResidentialUnit: v.isResidentialUnit,
				// ✅ 주거형이면 세대수 미입력 시 1로 전달 (상단 lib 패치와 일관성)
				householdCount: v.isResidentialUnit ? v.householdCount ?? 1 : undefined,
				isSharedStorage: v.isSharedStorage,
				userCount: v.isSharedStorage ? v.userCount ?? 1 : undefined,
				isWelfareOrTraditionalMarket: v.isWelfareOrTraditionalMarket,
			},
		);
		return { fee, detail, error: false };
	}, [values]);

	const formatKRW = (n: number) =>
		new Intl.NumberFormat('ko-KR', {
			style: 'currency',
			currency: 'KRW',
			maximumFractionDigits: 0,
		}).format(n);

	return (
		<section className="min-h-[80vh] my-5 rounded-2xl shadow-2xl border border-gray-300 mx-auto max-w-3xl px-6 py-10 space-y-6 bg-white text-neutral-900">
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
					액화석유가스 특정사용시설
				</h1>
				<p className="mt-2 text-[15px]">
					저장능력과 특례(주거형/공동저장/복지·시장 면제)를 입력하면 즉시
					계산됩니다.
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
							className="mr-2 accent-fuchsia-600"
							{...register('type')}
						/>
						완성검사
					</label>
					<label className="cursor-pointer inline-flex items-center">
						<input
							type="radio"
							value="periodic"
							className="mr-2 accent-fuchsia-600"
							{...register('type')}
						/>
						정기검사
					</label>
				</div>
			</div>

			{/* 기본 입력 */}
			<div className={`${sectionCls} space-y-5`}>
				<div>
					<label className={labelCls}>저장능력 (kg)</label>
					<input
						type="number"
						min={1}
						placeholder="예: 480"
						className={inputCls}
						{...register('capacityKg', { valueAsNumber: true })}
					/>
					{errors.capacityKg && (
						<p className={errCls}>{errors.capacityKg.message}</p>
					)}
				</div>

				{/* 주거형 */}
				<div className="space-y-2">
					<label className="inline-flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							className="size-4 min-w-7 accent-fuchsia-600"
							{...register('isResidentialUnit')}
						/>
						<span className="text-sm">
							주거형 — 완성검사 시 계량기 수 * 최저수수료(31,800원)
						</span>
					</label>
					{values.isResidentialUnit && (
						<div>
							<label className={labelCls}>계량기</label>
							<input
								type="number"
								min={1}
								placeholder="예: 12 (미입력 시 1세대로 계산)"
								className={inputCls}
								{...register('householdCount', { valueAsNumber: true })}
							/>
							{/* 검증을 느슨화했으므로 에러는 표시하지 않거나, 있더라도 표시만 */}
							{errors.householdCount && (
								<p className={errCls}>{errors.householdCount.message}</p>
							)}
						</div>
					)}
				</div>

				{/* 공동 저장설비 */}
				<div className="space-y-2">
					<label className="inline-flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							className="size-4 min-w-7 accent-fuchsia-600"
							{...register('isSharedStorage')}
						/>
						<span className="text-sm">
							공동 저장설비 (저장능력 ÷ 사용자 수)
						</span>
					</label>
					{values.isSharedStorage && (
						<div>
							<label className={labelCls}>공동 사용자 수</label>
							<input
								type="number"
								min={1}
								placeholder="예: 5 (미입력 시 1명으로 계산)"
								className={inputCls}
								{...register('userCount', { valueAsNumber: true })}
							/>
							{errors.userCount && (
								<p className={errCls}>{errors.userCount.message}</p>
							)}
						</div>
					)}
				</div>

				{/* 정기 면제 */}
				<div>
					<label className="inline-flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							className="size-4 min-w-7 accent-fuchsia-600"
							{...register('isWelfareOrTraditionalMarket')}
						/>
						<span className="text-sm">
							사회복지시설 / 재래시장 내 사용 (정기검사 면제)
						</span>
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
					{result.detail && (
						<div className="mt-2 text-xs space-y-1">
							{'effectiveKg' in result.detail &&
								result.detail.effectiveKg > 0 && (
									<div>
										환산 저장능력: {Math.ceil(result.detail.effectiveKg)} kg
									</div>
								)}
							<div>적용 구간: {result.detail.baseBand}</div>
							{'steps' in (result.detail || {}) &&
								result.detail.steps != null && (
									<div>가산 스텝(100kg 단위): {result.detail.steps}</div>
								)}
							{result.detail.note && <div>{result.detail.note}</div>}
						</div>
					)}
				</div>
				<button
					type="button"
					className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold shadow"
				>
					계산됨
				</button>
			</div>
		</section>
	);
};

export default LPGSpecificPage;
