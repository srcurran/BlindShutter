import type { Request, Response } from "express";

export async function handleGetImages(_req: Request, res: Response) {
  try {
    const images = await storage.getAllImages();
    res.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
}
import { images, type Image } from "@shared/schema";

export interface IStorage {
  createImage(image: {
    originalImage: string;
    aiDescription?: string | null;
    generatedImage?: string | null;
    metadata?: unknown;
  }): Promise<Image>;
  getImage(id: number): Promise<Image | undefined>;
  getAllImages(): Promise<Image[]>;
}

export class MemStorage implements IStorage {
  private images: Map<number, Image>;
  private currentId: number;

  constructor() {
    this.images = new Map();
    this.currentId = 1;
  }

  async createImage(image: {
    originalImage: string;
    aiDescription?: string | null;
    generatedImage?: string | null;
    metadata?: unknown;
  }): Promise<Image> {
    const id = this.currentId++;
    const newImage: Image = {
      id,
      originalImage: image.originalImage,
      aiDescription: image.aiDescription ?? null,
      generatedImage: image.generatedImage ?? null,
      metadata: image.metadata ?? null
    };
    this.images.set(id, newImage);
    return newImage;
  }

  async getImage(id: number): Promise<Image | undefined> {
    return this.images.get(id);
  }

  async getAllImages(): Promise<Image[]> {
    return Array.from(this.images.values())
      .sort((a, b) => b.id - a.id); // Most recent first
  }
}

export const storage = new MemStorage();