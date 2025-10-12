// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import RootClient from '@/components/RootClient';

export const metadata: Metadata = {
	metadataBase: new URL('https://gasfeeya.example.com'), // 실제 도메인으로 교체
	title: {
		default: 'GASFEEYA — 가스 검사 수수료 계산기',
		template: '%s | GASFEEYA',
	},
	description:
		'한국가스안전공사 고시에 기반한 고압가스·액화석유가스·도시가스 검사 수수료 계산기. 구간표·가산·상한을 반영하여 빠르게 산정하세요.',
	keywords: [
		'가스 수수료',
		'검사 수수료',
		'고압가스',
		'액화석유가스',
		'도시가스',
		'한국가스안전공사',
		'KGS',
		'수수료 계산기',
	],
	applicationName: 'GASFEEYA',
	authors: [{ name: 'GASFEEYA' }],
	creator: 'GASFEEYA',
	publisher: 'GASFEEYA',
	category: 'utility',
	openGraph: {
		type: 'website',
		siteName: 'GASFEEYA',
		title: 'GASFEEYA — 가스 검사 수수료 계산기',
		description:
			'고시 기반의 고압가스·액화석유가스·도시가스 검사 수수료 계산기',
		url: 'https://gasfeeya.example.com',

		locale: 'ko_KR',
	},
	robots: {
		index: true,
		follow: true,
	},
	alternates: {
		canonical: 'https://gasfeeya.example.com',
	},

	// 필요 시 PWA
	// manifest: '/site.webmanifest',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="ko"
			suppressHydrationWarning
		>
			<body className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
				<RootClient>{children}</RootClient>
			</body>
		</html>
	);
}
