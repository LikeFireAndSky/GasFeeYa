'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

export const container: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.12, delayChildren: 0.2 },
	},
};

const item: Variants = {
	hidden: { opacity: 0, y: 16 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const ButtonCard = ({
	href,
	title,
	desc,
	gradient,
}: {
	href: string;
	title: string;
	desc: string;
	gradient: string;
}) => (
	<Link
		href={href}
		className="w-full sm:w-auto"
	>
		<motion.div
			variants={item}
			whileHover={{ scale: 1.03 }}
			whileTap={{ scale: 0.98 }}
			className={`cursor-pointer rounded-2xl p-5 border border-gray-300 bg-white/5 backdrop-blur-md shadow-lg shadow-black/10`}
		>
			<div
				className={`inline-block rounded-xl px-3 py-1 text-xs font-semibold text-gray-900 bg-gradient-to-r ${gradient}`}
			>
				이동
			</div>
			<h3 className="mt-3 text-xl font-bold">{title}</h3>
			<p className="mt-1 text-sm text-gray-800 min-h-16">{desc}</p>
		</motion.div>
	</Link>
);

const PetroleumGasIndexPage = () => {
	return (
		<section className="min-h-[80vh] mx-auto max-w-5xl px-6 py-10">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				className="text-center mb-10"
			>
				<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
					액화석유가스 시설 선택
				</h1>
				<p className="mt-2 text-black">
					먼저 시설 유형을 선택하세요. 각 페이지에서 필요한 항목만 간단히
					입력하여 수수료를 계산합니다.
				</p>
			</motion.div>

			<motion.div
				variants={container}
				initial="hidden"
				animate="visible"
				className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
			>
				<ButtonCard
					href="/petroleum-gas/specific"
					title="특정사용시설"
					desc="저장능력(kg) 기준. 주거형 최저수수료/공동 저장/정기 면제(복지·시장) 분기 포함."
					gradient="from-pink-400 to-fuchsia-500"
				/>
				<ButtonCard
					href="/petroleum-gas/storage"
					title="충전·일반 집단공급·저장소"
					desc="저장능력(ton) 구간제. 1,000톤 초과 시 500톤마다 가산 + 상한 적용."
					gradient="from-cyan-400 to-blue-500"
				/>
				<ButtonCard
					href="/petroleum-gas/retail"
					title="판매시설"
					desc="판매소마다 정액(완성/정기). 입력 없이 즉시 계산."
					gradient="from-amber-400 to-orange-500"
				/>
				<ButtonCard
					href="/petroleum-gas/manufacturer"
					title="가스용품 제조시설"
					desc="완성검사만 해당(정액)."
					gradient="from-emerald-400 to-teal-500"
				/>
				<ButtonCard
					href="/petroleum-gas/network"
					title="배관망공급사업"
					desc="정기검사 전용: 제조소(ton) + 정압기(대수) + 배관 연장(km) 합산."
					gradient="from-violet-400 to-purple-600"
				/>
				<ButtonCard
					href="/"
					title="돌아가기 ↩️"
					desc="홈 메뉴로 돌아가기"
					gradient="from-slate-300 to-slate-900 text-white rounded-xs"
				/>
			</motion.div>
		</section>
	);
};

export default PetroleumGasIndexPage;
