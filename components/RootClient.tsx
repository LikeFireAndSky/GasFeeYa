// components/RootClient.tsx
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Background from '@/components/Background';

const RootClient = ({ children }: { children: ReactNode }) => {
	return (
		<>
			{/* 분리된 배경 */}
			<Background />

			{/* 메인 콘텐츠 */}
			<motion.main
				className="flex flex-col items-center justify-center min-h-screen px-6"
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: 'easeOut' }}
			>
				{children}
			</motion.main>
		</>
	);
};

export default RootClient;
