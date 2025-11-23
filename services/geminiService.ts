import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Quiz, Note, Question } from "../types";

// Lazy initialization to prevent crashes during build or initial load if API key is missing
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const key = process.env.API_KEY;
    if (!key) {
      // Return a dummy instance or throw a specific error that can be caught by UI
      throw new Error("API Key is missing. Please configure your API_KEY in Vercel settings.");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

// --- Schemas ---

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["mcq", "true_false", "fill_blank", "short_answer"] },
    text: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for MCQ" },
    correctAnswer: { type: Type.STRING, description: "For MCQ use index as string '0', for others use text" },
    explanation: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
  },
  required: ["type", "text", "correctAnswer", "explanation", "difficulty"]
};

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    questions: { type: Type.ARRAY, items: questionSchema }
  },
  required: ["title", "questions"]
};

const noteSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    content: { type: Type.STRING, description: "Markdown content" }
  },
  required: ["title", "content"]
};

// --- Functions ---

export const generateQuiz = async (
  context: string, 
  topic: string,
  difficulty: string = 'medium'
): Promise<Partial<Quiz>> => {
  const ai = getAI();
  const prompt = `Generate a quiz about "${topic}". 
  Difficulty: ${difficulty}.
  Context: ${context ? context.substring(0, 10000) : "Use your general knowledge."}
  
  Include 10 mixed questions: 4 MCQ, 3 True/False, 2 Short Answer, 1 Fill in the blank.
  Ensure the "correctAnswer" for MCQ is the string index (e.g., "0", "1").
  For True/False, correctAnswer should be "True" or "False".
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: quizSchema,
      temperature: 0.7,
    },
  });

  const data = JSON.parse(response.text!);
  return {
    title: data.title,
    questions: data.questions.map((q: any) => ({
      id: crypto.randomUUID(),
      ...q,
      options: q.options || [] // Ensure array for non-MCQ safety
    }))
  };
};

export const generateNotes = async (
  topic: string,
  type: 'bullet' | 'long' | 'eli5' | 'formula' | 'mindmap',
  context?: string
): Promise<Partial<Note>> => {
  const ai = getAI();
  let instruction = "";
  switch (type) {
    case 'bullet': instruction = "Create concise bullet-point notes covering key concepts."; break;
    case 'long': instruction = "Create a detailed academic study guide with sections and headers."; break;
    case 'eli5': instruction = "Explain the topic simply as if to a 5-year-old, using analogies."; break;
    case 'formula': instruction = "Extract all relevant formulas, theorems, or key definitions."; break;
    case 'mindmap': instruction = "Create a text-based hierarchical mind map using indentation."; break;
  }

  const prompt = `Topic: ${topic}.
  Style: ${type}.
  Instruction: ${instruction}
  Context: ${context ? context.substring(0, 10000) : "General knowledge."}
  Format the content in clean Markdown.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: noteSchema,
    },
  });

  return JSON.parse(response.text!);
};

export const generateAIChatResponse = async (
  history: { role: string, text: string }[],
  message: string
) => {
  const ai = getAI();
  
  const chatHistory = history.map(h => ({
    role: h.role === 'model' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: chatHistory,
    config: {
        systemInstruction: "You are a helpful AI Tutor. Help the student understand concepts, solve problems, and study effectively. Keep responses concise and encouraging."
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text;
};

// Helper to identify topics from text
export const extractTopicsFromText = async (text: string): Promise<string[]> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Extract 3-5 main topics/subjects from this text. Return as JSON list of strings. Text: ${text.substring(0, 2000)}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: { topics: { type: Type.ARRAY, items: { type: Type.STRING } } }
            }
        }
    });
    const json = JSON.parse(response.text!);
    return json.topics || [];
}