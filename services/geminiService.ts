import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Singleton instance to avoid recreating if not needed,
// though lightweight enough to instantiate on demand.
const getAI = () => new GoogleGenAI({ apiKey });

export const generateRegex = async (description: string): Promise<string> => {
  if (!apiKey) return "Error: API Key is missing.";

  const ai = getAI();
  try {
    const prompt = `You are a regex expert.
    User request: "${description}".
    
    Return ONLY the Regular Expression. Do not include markdown code blocks, do not include explanation.
    If the request is invalid, return "INVALID_REQUEST".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating Regex. Please check your inputs.";
  }
};

export const explainCode = async (code: string): Promise<string> => {
  if (!apiKey) return "Error: API Key is missing.";
  const ai = getAI();
  try {
     const prompt = `Explain the following code snippet concisely for a developer audience.
     
     Code:
     \`\`\`
     ${code}
     \`\`\`
     `;
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
     });
     return response.text?.trim() || "No explanation available.";
  } catch (error) {
    console.error(error);
    return "Error generating explanation.";
  }
};

export const convertToPinyin = async (text: string): Promise<string> => {
    if (!apiKey) return "API Key missing";
    const ai = getAI();
    try {
        const prompt = `Convert the following Chinese text to Pinyin.
        Provide ONLY the Pinyin text with tone marks. Keep punctuation.
        Text: ${text}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text?.trim() || "Failed to convert";
    } catch (e) {
        return "Error converting to Pinyin";
    }
};

export const formatCode = async (code: string, language?: string): Promise<string> => {
    if (!apiKey) return code; // Fallback
    const ai = getAI();
    try {
        const prompt = `Format the following ${language || 'code'} nicely.
        Return ONLY the formatted code. No markdown fences.
        
        Code:
        ${code}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text?.trim() || code;
    } catch (e) {
        return code;
    }
};