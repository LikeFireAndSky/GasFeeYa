"use client";

import { motion } from "framer-motion";

const Background = () => {
  return (
    <motion.div
      className="fixed inset-0 -z-10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* 🔹 상단 왼쪽 Gradient Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-r from-cyan-400 to-blue-600 blur-[120px] opacity-30 animate-pulse"></div>

      {/* 🔹 하단 오른쪽 Gradient Blur */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-gradient-to-r from-pink-500 to-purple-600 blur-[130px] opacity-30 animate-pulse"></div>
    </motion.div>
  );
};

export default Background;
