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
      {/* Glowing border animation */}
      <motion.div
        className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full opacity-75 blur-lg"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 7, // Total cycle of 10 seconds (3s animation + 7s delay)
        }}
      />

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        className="relative w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center border-4 border-white shadow-lg hover:bg-white/30 transition-colors"
        onClick={captureImage}
      >
        <Camera className="w-8 h-8 text-white" />
      </motion.button>
    </div>
  );
}