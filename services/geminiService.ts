import { GoogleGenAI, Type } from "@google/genai";
import { AdvancedSettingsData } from '../components/AdvancedSettings';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

export interface GenerationResult {
  prompt: string;
  negativePrompt: string;
  keywords: string;
  timestamp?: number;
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        prompt: {
            type: Type.STRING,
            description: 'The main detailed, descriptive prompt for the AI image generator.'
        },
        negativePrompt: {
            type: Type.STRING,
            description: 'A comma-separated list of keywords to exclude from the image generation (e.g., ugly, blurry, text, watermark, deformed).'
        },
        keywords: {
            type: Type.STRING,
            description: 'A comma-separated list of stylistic and descriptive keywords (e.g., photorealistic, cinematic lighting, 8k, detailed).'
        }
    },
    required: ['prompt', 'negativePrompt', 'keywords']
};

const buildPrompt = (settings: AdvancedSettingsData) => {
  let basePrompt = `Perform a detailed analysis of this image to generate a rich prompt for an AI image generator like Midjourney or DALL-E. Your analysis should consider and incorporate the following aspects:
- **Scene Composition:** Describe the arrangement of elements (e.g., rule of thirds, symmetry, leading lines).
- **Dominant Colors & Palette:** Identify the key colors and describe the overall color scheme (e.g., monochromatic, analogous, complementary, vibrant, muted).
- **Lighting:** Characterize the lighting style (e.g., soft, harsh, dramatic, cinematic, golden hour, studio lighting).
- **Artistic Style:** Identify the artistic medium and style (e.g., photorealistic, oil painting, watercolor, 3D render, anime, cartoon, abstract).

Combine these observations into a cohesive, descriptive main prompt.`;

  const constraints = [];
  if (settings.style) {
      constraints.push(`The desired style is "${settings.style}".`);
  }
  if (settings.mood) {
      constraints.push(`The desired mood is "${settings.mood}".`);
  }
  
  let complexityDesc = '';
  switch (settings.complexity) {
      case 'simple':
          complexityDesc = 'brief and concise (about 1-2 sentences)';
          break;
      case 'detailed':
          complexityDesc = 'detailed (a full paragraph)';
          break;
      case 'highly-detailed':
          complexityDesc = 'highly detailed and evocative (multiple sentences, focusing on nuances)';
          break;
  }
  if (complexityDesc) {
    constraints.push(`The prompt complexity should be ${complexityDesc}.`);
  }
  
  if (constraints.length > 0) {
      basePrompt += `\n\nAdhere to the following user-defined parameters:\n- ${constraints.join('\n- ')}`;
  }

  basePrompt += `\n\n- Main Prompt: A cohesive paragraph describing the subject, style, composition, lighting, and color palette.
- Negative Prompt: A list of terms to avoid, such as "blurry, text, watermark, ugly, deformed".
- Keywords: A comma-separated list of stylistic keywords.
Return the response as a JSON object with three keys: "prompt", "negativePrompt", and "keywords".`;

  return basePrompt;
}

export const generatePromptFromImage = async (
  base64Image: string, 
  mimeType: string,
  settings: AdvancedSettingsData
): Promise<GenerationResult> => {
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: buildPrompt(settings),
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
    },
  });

  const jsonString = response.text.trim();
  try {
    const result: GenerationResult = JSON.parse(jsonString);
    return result;
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonString);
    throw new Error("The AI returned an unexpected response format. Please try again.");
  }
};