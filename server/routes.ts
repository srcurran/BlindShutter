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

      // Analyze image with OpenAI Vision
      const visionResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "recreate this image in a photorealistic style by describing it as accurately and with as much detail as possible and then recreating it"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ],
          },
        ],
        max_tokens: 1000
      });

      // Generate new image based on the description
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: visionResponse.choices[0].message.content || "",
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const result = await storage.createImage({
        originalImage: image,
        aiDescription: visionResponse.choices[0].message.content || "",
        generatedImage: imageResponse.data[0].url,
        metadata: { timestamp: new Date() }
      });

      res.json(result);
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ error: "Failed to process image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
