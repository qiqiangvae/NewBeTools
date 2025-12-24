
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Singleton instance to avoid recreating if not needed,
// though lightweight enough to instantiate on demand.
const getAI = () => new GoogleGenAI({ apiKey });

// Selection: 'gemini-3-pro-preview' for complex reasoning (Regex).
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
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text?.trim() || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating Regex. Please check your inputs.";
  }
};

// Selection: 'gemini-3-pro-preview' for coding reasoning tasks.
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
        model: 'gemini-3-pro-preview',
        contents: prompt,
     });
     return response.text?.trim() || "No explanation available.";
  } catch (error) {
    console.error(error);
    return "Error generating explanation.";
  }
};

// Selection: 'gemini-3-flash-preview' for basic text tasks.
export const convertToPinyin = async (text: string): Promise<string> => {
    if (!apiKey) return "API Key missing";
    const ai = getAI();
    try {
        const prompt = `Convert the following Chinese text to Pinyin.
        Provide ONLY the Pinyin text with tone marks. Keep punctuation.
        Text: ${text}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text?.trim() || "Failed to convert";
    } catch (e) {
        return "Error converting to Pinyin";
    }
};

// Selection: 'gemini-3-flash-preview' for formatting tasks.
export const formatCode = async (code: string): Promise<string> => {
    if (!apiKey) {
        console.error("API Key missing");
        return code;
    }
    const ai = getAI();
    try {
        const prompt = `Format the following code to be clean and readable. Detect the language automatically.
        Return ONLY the formatted code. Do not include markdown code blocks (like \`\`\`). Do not include any explanation or extra text.
        
        Code:
        ${code}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        
        let text = response.text?.trim() || "";
        // Basic cleanup if model includes markdown code fences despite instructions
        if (text.startsWith('```')) {
            const lines = text.split('\n');
            if (lines.length >= 2) {
                lines.shift(); // remove first line (```language)
                if (lines[lines.length-1].trim().startsWith('```')) {
                    lines.pop(); // remove last line
                }
                text = lines.join('\n');
            }
        }
        
        return text || code;
    } catch (e) {
        console.error("Error formatting code:", e);
        return code;
    }
};
