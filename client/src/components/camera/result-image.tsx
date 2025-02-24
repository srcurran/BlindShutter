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
      className="w-full max-w-md mx-4 bg-white rounded-lg overflow-hidden shadow-xl"
    >
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        src={imageUrl}
        alt="AI Generated"
        className="w-full h-auto"
      />
      
      <div className="p-4 flex justify-between items-center bg-white">
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
