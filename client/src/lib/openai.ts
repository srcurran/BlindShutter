// Note: This frontend utility file provides type definitions and helper functions
// for working with OpenAI-related data in the frontend components

export interface OpenAIImageResponse {
  url: string;
  processedAt: string;
}

export interface OpenAIError {
  message: string;
  code?: string;
  status?: number;
}

// Helper function to format OpenAI errors in a consistent way
export function formatOpenAIError(error: any): OpenAIError {
  if (error.response) {
    return {
      message: error.response.data?.error?.message || 'An OpenAI API error occurred',
      code: error.response.data?.error?.code,
      status: error.response.status
    };
  }
  return {
    message: error.message || 'An unexpected error occurred',
    status: 500
  };
}

// Constants for OpenAI configuration
export const OPENAI_CONFIG = {
  imageGeneration: {
    defaultSize: "1024x1024" as const,
    defaultQuality: "standard" as const,
    maxPromptLength: 4000,
    supportedFormats: ['png', 'jpeg', 'webp'] as const
  },
  vision: {
    maxImageSize: 20 * 1024 * 1024, // 20MB
    supportedFormats: ['png', 'jpeg', 'webp', 'gif'] as const,
    maxTokens: 1000
  }
};

// Helper function to validate image data before sending to OpenAI
export function validateImageData(base64Image: string): boolean {
  if (!base64Image) return false;
  
  // Check if the base64 string is properly formatted
  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Check if it's a valid base64 string
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      return false;
    }
    
    // Check file size (assuming base64 increases size by ~1.37x)
    const estimatedSize = (base64Data.length * 3) / 4;
    if (estimatedSize > OPENAI_CONFIG.vision.maxImageSize) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// Helper function to format image data for OpenAI API
export function formatImageData(base64Image: string): string {
  // Ensure the image data has the proper data URL prefix
  if (!base64Image.startsWith('data:image/')) {
    return `data:image/jpeg;base64,${base64Image}`;
  }
  return base64Image;
}

// Helper function to format the response for frontend display
export function formatOpenAIResponse(response: any): OpenAIImageResponse {
  return {
    url: response.generatedImage || response.url,
    processedAt: new Date().toISOString()
  };
}
