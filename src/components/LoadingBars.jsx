import React from "react";
import { motion } from "framer-motion";

const LoadingDots = () => {
  const dotVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "reverse",
      },
    },
  };

  return (
    <div className="flex justify-center items-center h-screen w-full gap-2">
      <p className="text-gray-500 text-2xl relative bottom-1 italic">
        Calculating ratings
      </p>
      <div className="flex space-x-2">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-2 h-2 bg-gray-500 rounded-full"
            variants={dotVariants}
            initial="hidden"
            animate="visible"
            style={{ animationDelay: `${dot * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingDots;
