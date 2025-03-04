// File: api/images-get.js

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const images = await storage.getAllImages();
        return res.status(200).json(images);
    } catch (error) {
        console.error("Error fetching images:", error);
        return res.status(500).json({ error: "Failed to fetch images" });
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