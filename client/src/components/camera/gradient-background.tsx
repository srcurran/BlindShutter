import { motion } from "framer-motion";

export function GradientBackground() {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"
      animate={{
        background: [
          "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
          "linear-gradient(45deg, #A8E6CF, #FFD3B6)",
          "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
        ],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </motion.div>
  );
}
