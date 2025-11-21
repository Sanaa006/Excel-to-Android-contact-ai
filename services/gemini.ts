import { GoogleGenAI, Type } from "@google/genai";
import { ColumnMapping } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeExcelColumns = async (
  headers: string[], 
  sampleRows: any[][]
): Promise<ColumnMapping> => {
  
  const sampleDataStr = JSON.stringify({
    headers: headers,
    first_3_rows: sampleRows.slice(0, 3)
  });

  const prompt = `
    You are a data processing assistant. I have an Excel file with the following structure (headers and sample data).
    
    Your task is to identify:
    1. The column index (0-based) that most likely contains the **Contact Name** (Person's name, Full name, Arabic name, etc).
    2. The column index (0-based) that most likely contains the **Phone Number** (Mobile, Cell, Tel, etc).

    Data:
    ${sampleDataStr}

    If you cannot find a suitable column, return -1 for that index.
    Return a JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nameIndex: { type: Type.INTEGER, description: "Index of the column containing names" },
            phoneIndex: { type: Type.INTEGER, description: "Index of the column containing phone numbers" },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1" }
          },
          required: ["nameIndex", "phoneIndex", "confidence"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      nameIndex: result.nameIndex ?? -1,
      phoneIndex: result.phoneIndex ?? -1,
      confidence: result.confidence ?? 0
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback: default to 0 and 1 if error occurs
    return { nameIndex: 0, phoneIndex: 1, confidence: 0 };
  }
};
