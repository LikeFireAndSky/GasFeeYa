'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

type BackButtonProps = {
	href: string; // 이동할 경로
	label?: string; // 버튼 텍스트 (기본: '뒤로가기')
	className?: string; // 추가 커스텀 클래스
	variant?: 'light' | 'dark'; // 배경 톤에 맞춘 스타일 (기본: 'light')
};

const base =
	'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium transition';
const light =
	'bg-white text-neutral-900 border border-neutral-200 shadow-sm hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-300/60';
const dark =
	'bg-neutral-900/70 text-white border border-white/10 hover:bg-neutral-900/80 focus-visible:ring-2 focus-visible:ring-white/30';

const BackButton = ({
	href,
	label = '뒤로가기',
	className = '',
	variant = 'light',
}: BackButtonProps) => {
	const style = `${base} ${
		variant === 'dark' ? dark : light
	} ${className} curosr-pointer`;

	return (
		<Link
			href={href}
			aria-label={label}
			className="inline-block cursor-pointer"
		>
			<motion.button
				type="button"
				whileHover={{ scale: 1.04, y: -1 }}
				whileTap={{ scale: 0.98 }}
				className={style}
			>
				{/* 좌측 아이콘 (가벼운 SVG) */}
				<svg
					className="size-4 sm:size-[18px]"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M15 18l-6-6 6-6" />
				</svg>
				<span>{label}</span>
			</motion.button>
		</Link>
	);
};

export default BackButton;
