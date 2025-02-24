import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/process-image", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image is required" });
      }

      console.log("Starting image processing...");

      // Generate image based on the original
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: "Create a unique artistic interpretation that captures the essence and mood of the original image while adding creative elements. The result should be photorealistic but with an imaginative twist.",
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      if (!imageResponse.data[0]?.url) {
        throw new Error("Failed to generate image");
      }

      console.log("Image generated successfully:", imageResponse.data[0].url);

      const result = await storage.createImage({
        originalImage: image,
        aiDescription: null,
        generatedImage: imageResponse.data[0].url,
        metadata: { timestamp: new Date() }
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error processing image:", error);

      // Handle specific OpenAI errors
      if (error?.error?.type === "insufficient_quota") {
        return res.status(402).json({ 
          error: "OpenAI API quota exceeded. Please try again later." 
        });
      }

      if (error?.status === 429) {
        return res.status(429).json({ 
          error: "Too many requests. Please try again later." 
        });
      }

      if (error?.error?.code === "billing_hard_limit_reached") {
        return res.status(402).json({ 
          error: "API billing limit reached. Please try again later."
        });
      }

      res.status(500).json({ 
        error: "Failed to process image. Please try again." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}