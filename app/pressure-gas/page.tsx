'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import BackButton from '@/components/BackButton';

const container: Variants = {
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
			className={`cursor-pointer rounded-2xl p-5 border border-gray-300 bg-white backdrop-blur-md shadow-lg shadow-black/10`}
		>
			<div
				className={`inline-block rounded-xl px-3 py-1 text-xs font-semibold text-gray-900 bg-gradient-to-r ${gradient}`}
			>
				이동
			</div>
			<h3 className="mt-3 text-xl font-bold text-black">{title}</h3>
			<p className="mt-1 text-sm text-black/80 min-h-16">{desc}</p>
		</motion.div>
	</Link>
);

const HighPressureIndexPage = () => {
	return (
		<section className="min-h-[80vh] mx-auto max-w-5xl px-6 py-10">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				className="text-center mb-10"
			>
				<div className="w-full flex justify-end">
					<BackButton href="/" />
				</div>
				<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
					고압가스 시설 선택
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
				{/* 제조(충전·저장) - 액화 */}
				<ButtonCard
					href="/pressure-gas/liquid"
					title="제조(충전·저장) — 액화"
					desc="저장능력(ton) 구간제. 1,000톤 초과 시 500톤마다 가산 + 상한 적용."
					gradient="from-cyan-400 to-blue-500"
				/>
				{/* 제조(충전·저장) - 압축 */}
				<ButtonCard
					href="/pressure-gas/compressed"
					title="제조(충전·저장) — 압축"
					desc="표준상태 m³ 구간제. 100만m³ 초과 시 10만m³마다 가산 + 상한 적용."
					gradient="from-sky-400 to-indigo-500"
				/>
				{/* 냉동제조시설 */}
				<ButtonCard
					href="/pressure-gas/refrigeration"
					title="냉동제조시설"
					desc="냉동능력(ton) 구간제. 500톤 초과 시 100톤마다 가산 + 상한 적용."
					gradient="from-emerald-400 to-teal-500"
				/>
				{/* 배관(제조소 경계 내) */}
				<ButtonCard
					href="/pressure-gas/pipeline"
					title="배관(제조소 경계 내)"
					desc="연장 km 구간제. 5km 초과 구간은 km당 가산."
					gradient="from-violet-400 to-purple-600"
				/>
				{/* 판매시설(정액) */}
				<ButtonCard
					href="/pressure-gas/retail"
					title="판매시설 (정액)"
					desc="완성검사 정액으로 산정됩니다."
					gradient="from-amber-400 to-orange-500"
				/>
				{/* 수입업시설(정액: 완성/정기) */}
				<ButtonCard
					href="/pressure-gas/import"
					title="수입업시설 (정액)"
					desc="완성/정기 정액 기준으로 산정됩니다."
					gradient="from-rose-400 to-pink-500"
				/>

				{/* 특정고압가스 사용시설 — 중간 페이지 없이 바로 두 버튼 추가 */}
				<ButtonCard
					href="/pressure-gas/specific/liquid"
					title="특정사용 — 액화"
					desc="저장능력(kg) 구간제 + 500kg 초과 100kg 단위 가산 + 상한."
					gradient="from-fuchsia-400 to-pink-500"
				/>
				<ButtonCard
					href="/pressure-gas/specific/compressed"
					title="특정사용 — 압축"
					desc="표준상태 m³ 구간제 + 1,000m³ 초과 100m³ 단위 가산 + 상한."
					gradient="from-fuchsia-500 to-rose-500"
				/>
			</motion.div>
		</section>
	);
};

export default HighPressureIndexPage;
