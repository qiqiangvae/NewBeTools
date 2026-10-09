
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Singleton instance: created once, reused for every call.
let ai: GoogleGenAI | null = null;
const getAI = () => (ai ??= new GoogleGenAI({ apiKey }));

// Returns null when no result could be produced (missing key or request failure).
// Diagnostics only via console.error; locale lives in the callers.
const generate = async (model: string, prompt: string): Promise<string | null> => {
  if (!apiKey) {
    console.error("Gemini API key is missing.");
    return null;
  }
  try {
    const response = await getAI().models.generateContent({ model, contents: prompt });
    return response.text?.trim() || null;
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
};

// Selection: 'gemini-3-pro-preview' for complex reasoning (Regex).
export const generateRegex = async (description: string): Promise<string | null> => {
  const prompt = `You are a regex expert.
    User request: "${description}".
    
    Return ONLY the Regular Expression. Do not include markdown code blocks, do not include explanation.
    If the request is invalid, return "INVALID_REQUEST".
    `;

  const result = await generate('gemini-3-pro-preview', prompt);
  return result === 'INVALID_REQUEST' ? null : result;
};

// Selection: 'gemini-3-pro-preview' for coding reasoning tasks.
export const explainCode = async (code: string): Promise<string | null> => {
  const prompt = `Explain the following code snippet concisely for a developer audience.
     
     Code:
     \`\`\`
     ${code}
     \`\`\`
     `;
  return generate('gemini-3-pro-preview', prompt);
};

// Selection: 'gemini-3-pro-preview' for complex code conversion tasks.
export const convertCode = async (code: string): Promise<string | null> => {
  const prompt = `Convert the following code/request.
        If it looks like a curl command, convert it to Python and JavaScript Fetch.
        If it looks like code, translate it to the other most likely desired language or plain English explanation if vague.
        
        Code/Request:
        ${code}
        `;
  return generate('gemini-3-pro-preview', prompt);
};

// Selection: 'gemini-3-flash-preview' for basic text tasks.
export const convertToPinyin = async (text: string): Promise<string | null> => {
  const prompt = `Convert the following Chinese text to Pinyin.
        Provide ONLY the Pinyin text with tone marks. Keep punctuation.
        Text: ${text}`;
  return generate('gemini-3-flash-preview', prompt);
};

// Selection: 'gemini-3-flash-preview' for formatting tasks.
export const formatCode = async (code: string): Promise<string | null> => {
  const prompt = `Format the following code to be clean and readable. Detect the language automatically.
        Return ONLY the formatted code. Do not include markdown code blocks (like \`\`\`). Do not include any explanation or extra text.
        
        Code:
        ${code}`;

  const text = await generate('gemini-3-flash-preview', prompt);
  if (!text) return null;

  // Basic cleanup if model includes markdown code fences despite instructions
  if (text.startsWith('```')) {
    const lines = text.split('\n');
    if (lines.length >= 2) {
      lines.shift(); // remove first line (```language)
      if (lines[lines.length - 1].trim().startsWith('```')) {
        lines.pop(); // remove last line
      }
      return lines.join('\n');
    }
  }

  return text;
};
