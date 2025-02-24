import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  originalImage: text("original_image").notNull(),
  aiDescription: text("ai_description"),
  generatedImage: text("generated_image"),
  metadata: jsonb("metadata")
});

export const insertImageSchema = createInsertSchema(images).pick({
  originalImage: true,
});

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
