"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";

const HomePage = () => {
  const gasTypes = [
    {
      name: "고압가스 수수료",
      color: "from-cyan-400 to-blue-500",
      href: "/pressure-gas",
    },
    {
      name: "액화가스 수수료",
      color: "from-pink-400 to-fuchsia-500",
      href: "/petroleum-gas",
    },
    {
      name: "도시가스 수수료",
      color: "from-amber-400 to-orange-500",
      href: "/town-gas",
    },
  ];

  // 🔹 motion variants (부드러운 순차 애니메이션)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4,
      },
    },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      {/* 메인 타이틀 */}
      <motion.h1
        className="text-6xl pb-3 sm:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-lg select-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        GASFEEYA
      </motion.h1>

      {/* 서브 타이틀 */}
      <motion.p
        className="text-black text-lg sm:text-2xl font-light tracking-wider select-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        한국가스안전공사 홈페이지 공시 검사 수수료 계산기
      </motion.p>

      {/* 링크 */}
      <motion.a
        className="text-gray-700 text-lg sm:text-xl font-light tracking-wider select-none"
        href="https://www.kgs.or.kr/kgs/acdf/board.do"
        target="_blank"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        홈페이지에서 확인하기
      </motion.a>

      {/* 버튼 그룹 */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {gasTypes.map((gas, index) => (
          <motion.div key={index} variants={buttonVariants}>
            <Link href={gas.href}>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                className={`
                  cursor-pointer
                  px-8 py-4 rounded-2xl 
                  bg-gradient-to-r ${gas.color} 
                  text-white font-semibold 
                  shadow-lg shadow-black/20 
                  hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]
                  transition-all duration-300
                  text-sm sm:text-base
                  w-56 sm:w-auto
                `}
              >
                {gas.name}
              </motion.button>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HomePage;
