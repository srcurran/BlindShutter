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
        model: "gpt-4-vision-preview", // Using the correct model for vision tasks
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this image in extreme detail, focusing on capturing every visual element precisely. Include details about composition, colors, subjects, and any notable features."
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

      const description = visionResponse.choices[0].message.content;
      if (!description) {
        throw new Error("Failed to generate image description");
      }

      // Generate new image based on the description
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a photorealistic recreation of this scene: ${description}. Maintain accurate proportions and realistic details.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      if (!imageResponse.data[0]?.url) {
        throw new Error("Failed to generate image");
      }

      const result = await storage.createImage({
        originalImage: image,
        aiDescription: description,
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

      res.status(500).json({ 
        error: "Failed to process image. Please try again." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}