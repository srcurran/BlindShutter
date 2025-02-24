import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CameraButton } from "@/components/camera/camera-button";
import { GradientBackground } from "@/components/camera/gradient-background";
import { ResultImage } from "@/components/camera/result-image";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { validateImageData } from "@/lib/openai";

export default function Home() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const { mutate: processImage, isPending } = useMutation({
    mutationFn: async (base64Image: string) => {
      console.log("Starting image processing request...");

      if (!validateImageData(base64Image)) {
        throw new Error("Invalid image data");
      }

      const response = await apiRequest("POST", "/api/process-image", {
        image: base64Image,
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      console.log("Image processed successfully:", data);
      if (!data.generatedImage) {
        throw new Error("No image was generated");
      }
      setResult(data.generatedImage);
      setProcessing(false);
    },
    onError: (error: any) => {
      console.error("Error in image processing:", error);
      let errorMessage = "Failed to process image. Please try again.";

      // Handle specific error messages from the backend
      if (error.message?.includes("billing limit reached")) {
        errorMessage = "API billing limit reached. Please try again later.";
      } else if (error.message?.includes("quota exceeded")) {
        errorMessage = "API quota exceeded. Please try again later.";
      } else if (error.message?.includes("Too many requests")) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.message?.includes("Invalid image data")) {
        errorMessage = "Invalid image format. Please try again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setProcessing(false);
    },
  });

  const handleCapture = async (base64Image: string) => {
    console.log("Image captured, starting processing...");
    setProcessing(true);
    setResult(null);
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