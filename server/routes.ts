import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

if (!process.env.CLAUDE_API_KEY) {
  throw new Error("CLAUDE_API_KEY is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/process-image", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image is required" });
      }

      console.log("Starting image processing...");

      // First, analyze the image with Claude
      const visionResponse = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this image with extreme precision and detail. Focus on spatial relationships, colors, textures, lighting, and composition. The description will be used to recreate the image as accurately as possible."
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: image
              }
            }
          ]
        }]
      });

      const description = visionResponse.content[0].text;
      if (!description) {
        throw new Error("Failed to generate image description");
      }

      console.log("Generated description:", description);

      // Then use DALL-E to recreate the image based on the detailed description
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Recreate this scene photorealistically: ${description}. Focus on precise details and maintain accurate proportions. The result should look as close as possible to a real photograph while capturing all the described elements perfectly.`,
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

      if (error?.error?.code === "billing_hard_limit_reached") {
        return res.status(402).json({ 
          error: "API billing limit reached. Please try again later."
        });
      }

      if (error?.error?.code === "model_not_found") {
        return res.status(500).json({ 
          error: "API configuration error. Please try again later."
        });
      }

      res.status(500).json({ 
        error: "Failed to process image. Please try again." 
      });
    }
  });

  app.get("/api/images", async (_req, res) => {
    try {
      const images = await storage.getAllImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}