'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

const container: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.12, delayChildren: 0.2 },
	},
};
const item: Variants = {
	hidden: { opacity: 0, y: 14 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
			className="cursor-pointer rounded-2xl p-5 border border-neutral-200 bg-white shadow-lg"
		>
			<div
				className={`inline-block rounded-xl px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r ${gradient}`}
			>
				이동
			</div>
			<h3 className="mt-3 text-xl font-bold text-neutral-900">{title}</h3>
			<p className="mt-1 text-sm text-neutral-800 min-h-14">{desc}</p>
		</motion.div>
	</Link>
);

const CityGasIndexPage = () => (
	<section className="min-h-[80vh] mx-auto max-w-5xl px-6 py-10">
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="text-center mb-10"
		>
			<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
				도시가스 시설 선택
			</h1>
			<p className="mt-2 text-black">
				유형을 선택하고 필요한 항목만 입력해 정밀하게 수수료를 계산하세요.
			</p>
		</motion.div>

		<motion.div
			variants={container}
			initial="hidden"
			animate="visible"
			className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
		>
			<ButtonCard
				href="/city-gas/supply"
				title="가스공급시설 (정기)"
				desc="제조소/공급소/정압(밸브)기지/정압기/배관 연장 — 합산 계산"
				gradient="from-sky-500 to-blue-600"
			/>
			<ButtonCard
				href="/city-gas/specific/general"
				title="특정가스사용시설 - 일반"
				desc="완성/정기 — 월사용예정량(㎥)과 특례(시·도 지정, 2실 이하, 금속 이중관 등)"
				gradient="from-fuchsia-500 to-pink-600"
			/>
			<ButtonCard
				href="/city-gas/specific/buried"
				title="특정가스사용시설 - 배관"
				desc="완성/정기 — 공동주택, 단독주택 기준 "
				gradient="from-fuchsia-700 to-pink-700"
			/>
			<ButtonCard
				href="/city-gas/charging/liquid"
				title="충전시설 — 액화"
				desc="중간/완성/정기 — 톤 기준, 1000t 초과 500t 단위 가산 + 상한"
				gradient="from-emerald-500 to-teal-600"
			/>
			<ButtonCard
				href="/city-gas/charging/compressed"
				title="충전시설 — 압축"
				desc="중간/완성/정기 — 표준상태 ㎥ 기준, 100만㎥ 초과 10만㎥ 단위 가산 + 상한"
				gradient="from-amber-500 to-orange-600"
			/>
			<ButtonCard
				href="/city-gas/safety"
				title="안전관리수준평가"
				desc="배관 총연장·시스템 기준 수수료 — 1km 미만은 1km로 계산"
				gradient="from-violet-500 to-purple-600"
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

export default CityGasIndexPage;
