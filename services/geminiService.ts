import { GoogleGenAI, Type } from "@google/genai";
import { AIGeneratedTask } from "../types";

const SYSTEM_INSTRUCTION = `
You are an intelligent task management assistant for the 'Collab Task' app.
Your goal is to take a user's natural language request and convert it into a structured list of tasks.
Analyze the request to determine appropriate priorities (low, medium, high) and categories (Work, Personal, Study, Health, Finance, Other).
If the request implies a schedule (e.g., "7 day plan"), create multiple tasks with titles indicating the day or phase.
Return ONLY JSON.
`;

export const generateTasksFromAI = async (prompt: string, language: string): Promise<AIGeneratedTask[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Returning mock data.");
    // Mock fallback for demonstration if key is missing
    return [
      {
        title: "Review Project Requirements (Mock)",
        description: "Analyze the documentation thoroughly.",
        priority: "high",
        category: "Work",
        subTasks: ["Read PDF", "Make notes"]
      },
      {
        title: "Setup Development Environment (Mock)",
        description: "Install Node.js and dependencies.",
        priority: "medium",
        category: "Work"
      }
    ];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct a language-aware prompt
    const langInstruction = language === 'mm' 
      ? "The user speaks Myanmar. Translate the task titles and descriptions to Myanmar Unicode if possible." 
      : "The user speaks English.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION} ${langInstruction}`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
              category: { type: Type.STRING, enum: ["Work", "Personal", "Study", "Health", "Finance", "Other"] },
              subTasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "priority", "category"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIGeneratedTask[];
    }
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};