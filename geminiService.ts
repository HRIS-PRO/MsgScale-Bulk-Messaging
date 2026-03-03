
import { GoogleGenAI } from "@google/genai";

/**
 * Generates an AI-driven analysis of campaign data based on user queries.
 * @param userQuery The question or command from the user.
 * @param contextData Real-time campaign metrics and performance data.
 * @returns A string containing the AI's response.
 */
export const getAIAnalysis = async (userQuery: string, contextData: any) => {
  // Always initialize right before use to ensure the most current environment state
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Request: ${userQuery}`,
      config: {
        systemInstruction: `You are the MsgScale Enterprise AI Analyst, a world-class expert in marketing data and campaign optimization.
        
        You have access to the following workspace data:
        ${JSON.stringify(contextData, null, 2)}
        
        Your Goal:
        1. Provide deep, actionable insights based EXCLUSIVELY on the provided data.
        2. Identify trends, anomalies (like the Friday dip mentioned in reports), and optimization opportunities.
        3. Keep your tone professional, authoritative, yet helpful.
        4. Use Markdown for formatting: bold for key metrics, bullet points for lists, and headers for sections if needed.
        5. If a user asks a question unrelated to messaging or the provided data, politely guide them back to their campaign performance.
        
        Be concise but impactful. Focus on ROI, CTR, and deliverability.`,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    return response.text || "I processed your request but couldn't generate a text response. Please try rephrasing.";
  } catch (error) {
    console.error("MsgScale AI Analyst Error:", error);
    
    // Handle specific API errors gracefully
    if (error instanceof Error && error.message.includes("API key")) {
      return "I'm unable to access the AI service due to an invalid configuration. Please contact your workspace administrator.";
    }
    
    return "I'm currently experiencing a high volume of requests. Please try asking your question again in a moment.";
  }
};
