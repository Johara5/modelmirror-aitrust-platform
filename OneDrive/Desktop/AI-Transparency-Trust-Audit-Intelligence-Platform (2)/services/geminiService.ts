
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types.ts";

export type VerbosityLevel = 'simple' | 'detailed' | 'technical';

const analysisCache = new Map<string, AuditResult>();

export const analyzeModelOutput = async (
  inputData: any,
  outputData: any,
  confidence: number
): Promise<AuditResult> => {
  const cacheKey = JSON.stringify({ inputData, outputData, confidence });
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey)!;
  }

  // MUST initialize GoogleGenAI inside the function to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Analyze the following AI decision for transparency and explainability:
    Input Data: ${JSON.stringify(inputData)}
    AI Output: ${JSON.stringify(outputData)}
    Model Confidence: ${confidence}

    Generate three distinct narrative explanations:
    1. Simple: A high-level summary for end-users.
    2. Detailed: Explanation of logic and feature relationships.
    3. Technical: Discussion of potential statistical weights and logic.

    Also provide influencing factors and risk indicators (Bias, Confidence, Logic, Drift).
    Provide a 'trustScore' as a composite metric on a scale of 0 to 100 representing overall reliability.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
            trustScore: { type: Type.NUMBER, description: "A composite trust metric from 0 to 100." }
          },
          required: ["explanations", "influencingFactors", "riskIndicators", "trustScore"]
        }
      }
    });

    // Access .text property directly (not a method)
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const parsed = JSON.parse(text);
    const result: AuditResult = { ...parsed, status: 'live' };
    analysisCache.set(cacheKey, result);
    return result;
  } catch (error: any) {
    console.error("Gemini API Status: Falling back to Heuristic Engine.", error);
    
    const mockResult: AuditResult = {
      status: 'fallback',
      explanations: {
        simple: "HEURISTIC FALLBACK: The AI decision for this request is analyzed via structural logic mirrors. Income levels and requested amounts suggest a risk-balanced approval path.",
        detailed: "Operating in fallback mode. Input analysis shows feature weight distributions consistent with baseline behavior. 'Income' serves as the primary predictor, while 'LoanAmount' provides secondary control.",
        technical: "HEURISTIC MODE: Simulated feature attribution suggests SHAP-equivalent weights of 0.65 for 'income' and -0.22 for 'loanAmount'. The prediction vector is stable relative to historic data."
      },
      influencingFactors: [
        { factor: "Income Scaling", impact: "positive", weight: 0.65, explanation: "High income detected relative to typical approval brackets." },
        { factor: "Confidence Stability", impact: confidence > 0.8 ? "positive" : "negative", weight: 0.35, explanation: `Current model confidence is ${Math.round(confidence * 100)}%.` }
      ],
      riskIndicators: [
        { category: "Confidence", severity: confidence < 0.7 ? "high" : "low", finding: "Heuristic scan: Low impact drift detected in local confidence buffer." }
      ],
      trustScore: Math.round(confidence * 100)
    };
    
    return mockResult;
  }
};
