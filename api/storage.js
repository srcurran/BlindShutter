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