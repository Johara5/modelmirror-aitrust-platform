
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types.ts";

// Always use process.env.API_KEY directly when initializing the GoogleGenAI client instance.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type VerbosityLevel = 'simple' | 'detailed' | 'technical';

export const analyzeModelOutput = async (
  inputData: any,
  outputData: any,
  confidence: number
): Promise<AuditResult> => {
  const prompt = `Analyze the following AI decision for transparency and explainability:
    Input Data: ${JSON.stringify(inputData)}
    AI Output: ${JSON.stringify(outputData)}
    Model Confidence: ${confidence}

    Generate three distinct narrative explanations:
    1. Simple: A high-level, jargon-free summary for end-users (1-2 sentences).
    2. Detailed: A comprehensive explanation of logic and feature relationships.
    3. Technical: A deep dive for ML engineers, discussing potential statistical weights and algorithmic logic.

    Also provide influencing factors and risk indicators (Bias, Confidence, Logic, Drift).`;

  // Use ai.models.generateContent with the appropriate model for complex reasoning tasks.
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanations: {
            type: Type.OBJECT,
            properties: {
              simple: { type: Type.STRING },
              detailed: { type: Type.STRING },
              technical: { type: Type.STRING }
            },
            required: ["simple", "detailed", "technical"]
          },
          influencingFactors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                factor: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["positive", "negative", "neutral"] },
                weight: { type: Type.NUMBER },
                explanation: { type: Type.STRING }
              },
              required: ["factor", "impact", "weight", "explanation"]
            }
          },
          riskIndicators: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, enum: ["Bias", "Confidence", "Logic", "Drift"] },
                severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                finding: { type: Type.STRING }
              },
              required: ["category", "severity", "finding"]
            }
          },
          trustScore: { type: Type.NUMBER }
        },
        required: ["explanations", "influencingFactors", "riskIndicators", "trustScore"]
      }
    }
  });

  try {
    // Access the .text property directly to extract the generated text content.
    const text = response.text || '';
    if (!text.trim()) throw new Error("Empty response from AI engine");
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse audit result:", error);
    throw new Error("Transparency Engine failed to generate the required report. Verify inputs and try again.");
  }
};
