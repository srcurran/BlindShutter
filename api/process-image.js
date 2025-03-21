import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: "Image is required" });
        }

        console.log("Starting image processing...");

        // First, analyze the image with gpt
        const visionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            max_tokens: 1000,
            messages: [{
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Describe this image with extreme precision and detail. Focus on spatial relationships, colors, textures, lighting, and composition. The description will be used to recreate the image as accurately as possible."
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${image}`
                        }
                    }
                ]
            }]
        });

        const description = visionResponse.choices[0].message.content;
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
    } catch (error) {
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

        // Handle Anthropic-specific errors
        if (error?.status === 400 && error.error?.message?.includes("credit balance")) {
            return res.status(402).json({
                error: "Image analysis service unavailable. Please try again later."
            });
        }

        res.status(500).json({
            error: "Failed to process image. Please try again."
        });
    }
}

/**
 * JavaScript version of the storage module
 */

// Define the storage interface through implementation
export class MemStorage {
    constructor() {
        this.images = new Map();
        this.currentId = 1;
    }

    async createImage(image) {
        const id = this.currentId++;
        const newImage = {
            id,
            originalImage: image.originalImage,
            aiDescription: image.aiDescription ?? null,
            generatedImage: image.generatedImage ?? null,
            metadata: image.metadata ?? null
        };
        this.images.set(id, newImage);
        return newImage;
    }

    async getImage(id) {
        return this.images.get(id);
    }

    async getAllImages() {
        return Array.from(this.images.values())
            .sort((a, b) => b.id - a.id); // Most recent first
    }
}

export const storage = new MemStorage();