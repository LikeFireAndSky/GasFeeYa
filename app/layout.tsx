"use client";

import "./globals.css";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import Background from "@/components/Background";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
        {/* 배경 분리된 컴포넌트 */}
        <Background />

        {/* 메인 콘텐츠 */}
        <motion.main
          className="flex flex-col items-center justify-center min-h-screen px-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </body>
    </html>
  );
};

export default Layout;
