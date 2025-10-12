'use client';

import { motion } from 'framer-motion';

const Background = () => {
	return (
		<motion.div
			className="fixed inset-0 -z-10 overflow-hidden pointer-events-none will-change-transform bg-white"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 1.2 }}
		>
			{/* 🔹 상단-좌측 Gradient Blur (모바일은 뷰포트 비율로, md↑는 고정값) */}
			<div
				className={`
          absolute
          /* 모바일: 화면 밖으로 더 빼서 여백 확보 */
          top-[-18vh] left-[-30vw]
          w-[clamp(260px,70vw,420px)] h-[clamp(260px,70vw,420px)]
          /* md 이상: 기존 값 유지 */
          md:top-[-10%] md:left-[-10%]
          md:w-[400px] md:h-[400px]
          bg-gradient-to-r from-cyan-400 to-blue-600
          /* blur/opacity 기존 톤 유지, 모바일은 약간만 완화 */
          blur-[110px] md:blur-[120px]
          opacity-30
          animate-pulse
        `}
			/>

			{/* 🔹 하단-우측 Gradient Blur (모바일 비율 조정, md↑ 기존 유지) */}
			<div
				className={`
          absolute
          bottom-[-22vh] right-[-35vw]
          w-[clamp(300px,75vw,480px)] h-[clamp(300px,75vw,480px)]
          md:bottom-[-10%] md:right-[-10%]
          md:w-[450px] md:h-[450px]
          bg-gradient-to-r from-pink-500 to-purple-600
          blur-[120px] md:blur-[130px]
          opacity-30
          animate-pulse
        `}
			/>
		</motion.div>
	);
};

export default Background;
