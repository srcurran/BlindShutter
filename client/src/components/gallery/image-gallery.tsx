import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { type Image } from "@shared/schema";
import { ChevronUp } from "lucide-react";

interface ImageGalleryProps {
  images: Image[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageGallery({ images, isOpen, onOpenChange }: ImageGalleryProps) {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-100, 0], [1, 0]);
  const scale = useTransform(y, [-100, 0], [1, 0.95]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y < -50 && !isOpen) {
      onOpenChange(true);
    } else if (info.offset.y > 50 && isOpen) {
      onOpenChange(false);
    }
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-10"
      animate={isOpen ? { y: "0%" } : { y: "85%" }}
      transition={{ type: "spring", damping: 30 }}
    >
      <motion.div
        className="bg-white/5 backdrop-blur-lg rounded-t-3xl p-4 px-8 overflow-scroll"
        style={{ height: "90vh" }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 gap-4 py-8 ">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="relative aspect-square rounded-lg overflow-hidden"
              >
                <img
                  src={image.generatedImage || ''}
                  alt={image.aiDescription || 'Generated image'}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
