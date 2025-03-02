import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CameraButton } from "@/components/camera/camera-button";
import { GradientBackground } from "@/components/camera/gradient-background";
import { ResultImage } from "@/components/camera/result-image";
import { ImageGallery } from "@/components/gallery/image-gallery";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { validateImageData } from "@/lib/openai";
import type { Image } from "@shared/schema";

export default function Home() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshGallery, setRefreshGallery] = useState(false);

  // Fetch previous images
  const { data: images = [] } = useQuery<Image[]>({
    queryKey: ["/api/images", refreshGallery], // Add refreshGallery as a query key
  });

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

      if (error.message?.includes("billing limit reached")) {
        errorMessage = "API billing limit reached. Please try again later.";
      } else if (error.message?.includes("quota exceeded")) {
        errorMessage = "API quota exceeded. Please try again later.";
      } else if (error.message?.includes("Too many requests")) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.message?.includes("Invalid image data")) {
        errorMessage = "Invalid image format. Please try again.";
      } else if (error.message?.includes("API configuration error")) {
        errorMessage = "There was an issue with the image processing service. Please try again later.";
      } else if (error.message?.includes("Image analysis service unavailable")) {
        errorMessage = "Image analysis service is temporarily unavailable. Please try again later.";
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

  const handleReset = () => {
    setResult(null);
    setProcessing(false);
    setRefreshGallery(!refreshGallery); // Toggle refreshGallery
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
            <p className="text-white mt-4 text-lg">Generating</p>
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
              onReset={handleReset} // Pass the new handleReset
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ImageGallery
        images={images}
        isOpen={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
      />
    </div>
  );
}
