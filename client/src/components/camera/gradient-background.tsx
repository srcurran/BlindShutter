import { motion } from "framer-motion";

export function GradientBackground() {
  return (
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          "linear-gradient(145deg, #614385, #516395)",
          "linear-gradient(145deg, #516395, #614385)",
        ],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-black/10" />
      </div>
    </motion.div>
  );
}
