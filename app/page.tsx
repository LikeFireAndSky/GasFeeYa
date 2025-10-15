'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

const HomePage = () => {
	const gasTypes = [
		{
			name: '고압가스 수수료',
			color: 'from-cyan-400 to-blue-500',
			href: '/pressure-gas',
		},
		{
			name: '액화가스 수수료',
			color: 'from-pink-400 to-fuchsia-500',
			href: '/petroleum-gas',
		},
		{
			name: '도시가스 수수료',
			color: 'from-amber-400 to-orange-500',
			href: '/city-gas',
		},
	];

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.15, delayChildren: 0.4 },
		},
	};

	const buttonVariants: Variants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: 'easeOut' },
		},
	};

	return (
		<main className="flex min-h-screen flex-col">
			{/* Hero */}
			<section className="flex flex-1 flex-col items-center justify-center text-center px-6">
				<motion.h1
					className="text-6xl pb-3 sm:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-lg select-none"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					GASFEEYA
				</motion.h1>

				<motion.div
					className="text-black text-lg sm:text-2xl font-light tracking-wider select-none"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1.2, delay: 0.2 }}
				>
					한국가스안전공사 검사 수수료 계산기
					<p className=" text-lg italic pb-3">
						#한국가스안전공사 홈페이지 공지 기준
					</p>
				</motion.div>

				<motion.a
					className="text-neutral-900 text-md sm:text-md font-light tracking-wider select-none underline underline-offset-4 decoration-transparent hover:decoration-neutral-300 transition"
					href="https://www.kgs.or.kr/kgs/acdf/board.do"
					target="_blank"
					rel="noreferrer"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1.2, delay: 0.2 }}
				>
					👉 홈페이지에서 확인하기
				</motion.a>

				{/* Buttons */}
				<motion.div
					className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-10"
					variants={containerVariants}
					initial="hidden"
					animate="visible"
				>
					{gasTypes.map((gas, index) => (
						<motion.div
							key={index}
							variants={buttonVariants}
						>
							<Link href={gas.href}>
								<motion.button
									whileHover={{ scale: 1.08 }}
									whileTap={{ scale: 0.96 }}
									className={`
                    cursor-pointer px-8 py-4 rounded-2xl 
                    bg-gradient-to-r ${gas.color} 
                    text-white font-semibold 
                    shadow-lg shadow-black/20 
                    hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]
                    transition-all duration-300
                    text-sm sm:text-base w-56 sm:w-auto
                  `}
								>
									{gas.name}
								</motion.button>
							</Link>
						</motion.div>
					))}
				</motion.div>
			</section>

			{/* Footer (센터 정렬, 미니멀 톤) */}
			<footer className="w-full pt-6 pb-8">
				<div className="mx-auto max-w-6xl px-6">
					{/* 경고 문구 */}
					<p className="text-[11px] sm:text-xs leading-relaxed text-neutral-900 text-center">
						<span className="mr-1"></span>본 웹사이트는{' '}
						<b>한국가스안전공사와 무관한 개인 프로젝트</b>입니다. <br />
						고시를 바탕으로 한 참고용 계산 도구이며, 최종 해석·적용은 반드시{' '}
						<b>관할기관 공시/안내</b>를 확인하세요.
					</p>

					{/* 구분선 (은은하게) */}
					<div className="mt-3 flex justify-center">
						<div className="h-px w-24 bg-neutral-200/70" />
					</div>
				</div>
			</footer>
		</main>
	);
};

export default HomePage;
