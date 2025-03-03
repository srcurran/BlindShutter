import type { Request, Response } from "express";
import { storage } from "./storage";

export async function handleGetImages(_req: Request, res: Response) {
  try {
    const images = await storage.getAllImages();
    res.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
}
