import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CameraButton } from "@/components/camera/camera-button";
import { GradientBackground } from "@/components/camera/gradient-background";
import { ResultImage } from "@/components/camera/result-image";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const { mutate: processImage, isPending } = useMutation({
    mutationFn: async (base64Image: string) => {
      const response = await apiRequest("POST", "/api/process-image", {
        image: base64Image,
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setResult(data.generatedImage);
      setProcessing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    },
  });

  const handleCapture = async (base64Image: string) => {
    setProcessing(true);
    processImage(base64Image);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GradientBackground />
      
      <AnimatePresence>
        {!processing && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <CameraButton onCapture={handleCapture} />
          </motion.div>
        )}

        {(processing || isPending) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <div className="w-64 h-64 bg-white/10 rounded-lg backdrop-blur-lg flex items-center justify-center">
              <div className="loading-spinner" />
            </div>
            <p className="text-white mt-4 text-lg">Creating your masterpiece...</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <ResultImage
              imageUrl={result}
              onReset={() => {
                setResult(null);
                setProcessing(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
