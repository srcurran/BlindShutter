import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

interface CameraButtonProps {
  onCapture: (base64Image: string) => void;
}

export function CameraButton({ onCapture }: CameraButtonProps) {
  const captureImage = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Failed to get canvas context");

      ctx.drawImage(video, 0, 0);

      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());

      const base64Image = canvas.toDataURL('image/jpeg')
        .replace('data:image/jpeg;base64,', '');

      onCapture(base64Image);
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }, [onCapture]);

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        className="relative w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg hover:bg-white/15 transition-colors"
        onClick={captureImage}
      >
        <Camera className="w-7 h-7 text-white" />
      </motion.button>
    </div>
  );
}