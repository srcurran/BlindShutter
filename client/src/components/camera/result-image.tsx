import { motion } from "framer-motion";
import { Share2, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultImageProps {
  imageUrl: string;
  onReset: () => void;
}

export function ResultImage({ imageUrl, onReset }: ResultImageProps) {
  const handleShare = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "ai-photo.jpg", { type: "image/jpeg" });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'AI Generated Photo',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = async () => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-photo.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-lg" // Updated styling
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
        <Button
          variant="outline"
          size="sm" // Adjusted size for better fit
          className="flex-1 py-2.5 bg-white/10 rounded-xl text-white text-sm hover:bg-white/15 transition-colors" // Updated styling
          onClick={onReset}
        >
          Try Again
        </Button>
        <Button
          variant="outline"
          size="sm" // Adjusted size for better fit
          className="flex-1 py-2.5 bg-white/10 rounded-xl text-white text-sm hover:bg-white/15 transition-colors" // Updated styling
          onClick={handleDownload}
        >
          Download
        </Button>
        <Button
          variant="outline"
          size="sm" // Adjusted size for better fit
          className="flex-1 py-2.5 bg-white/10 rounded-xl text-white text-sm hover:bg-white/15 transition-colors" // Updated styling
          onClick={handleShare}
        >
          Share
        </Button>
      </div>
    </motion.div>
  );
}