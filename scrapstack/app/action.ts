'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function analyzeScrapImage(base64Image: string, description: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Act as a tech salvage expert for ScrapStack. 
      Analyze this image and description: "${description}".
      Identify high value salvageable components.
      Return ONLY a JSON array with these keys: name, health, condition, price.
      Price must be a number in PHP.
    `;

    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } }
    ]);

    const text = result.response.text();
    const jsonString = text.replace(/```json|```/g, "").trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to analyze image");
  }
}