import { motion } from "framer-motion";
import { useEffect } from "react";



interface ResultImageProps {
  imageUrl: string;
  onReset: () => void;

}

export function ResultImage({ imageUrl, onReset }: ResultImageProps) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const imageContainer = document.getElementById("result-image-container");
      if (imageContainer && !imageContainer.contains(event.target as Node)) {
        console.log("clicked to close");
        onReset();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onReset]);

  return (
    <motion.div
      id="result-image-container"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-4/5 mx-auto bg-white backdrop-blur-md rounded-md p-4 pb-12 shadow-lg" // Updated styling
    >
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        src={imageUrl}
        alt="AI Generated"
        className="w-full rounded-2xl" // Updated styling
      />

      <div className="flex gap-2">

      </div>
    </motion.div>
  );
}