import OpenAI from "openai";
import { storage } from "./storage";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Predefined questions for the chatbot
export const predefinedQuestions = [
  "What AI tools are available on this platform?",
  "How do I find code generation tools?",
  "What are the most popular development tools?",
  "Can you recommend tools for data integration?",
  "How do I search for specific features?",
];

// Rate limiting: 5 questions per day per device
export async function checkRateLimit(deviceId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sessionsToday = await storage.getChatSessionsForDevice(deviceId, today, tomorrow);
  return sessionsToday.length < 5;
}

export async function getRemainingQuestions(deviceId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sessionsToday = await storage.getChatSessionsForDevice(deviceId, today, tomorrow);
  return Math.max(0, 5 - sessionsToday.length);
}

// Get platform context for the AI
async function getPlatformContext(): Promise<string> {
  try {
    const [domains, categories, products] = await Promise.all([
      storage.getDomains(),
      storage.getCategories(),
      storage.getProducts(),
    ]);

    const context = `
Platform Context:
This is an AI Catalog Platform with the following content:

DOMAINS:
${domains.map(d => `- ${d.name}: ${d.description}`).join('\n')}

CATEGORIES:
${categories.map(c => `- ${c.name}: ${c.description}`).join('\n')}

FEATURED TOOLS:
${products.slice(0, 10).map(p => `- ${p.name}: ${p.subtitle || p.description?.substring(0, 100)}`).join('\n')}

The platform helps users discover AI tools, development resources, and technical solutions.
Users can search, filter, and explore various categories of tools and resources.
`;

    return context;
  } catch (error) {
    console.error("Error getting platform context:", error);
    return "This is an AI Catalog Platform that helps users discover AI tools and development resources.";
  }
}

// Generate AI response
export async function generateChatResponse(question: string): Promise<string> {
  try {
    const platformContext = await getPlatformContext();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant for an AI Catalog Platform. Your role is to help users discover and understand the tools and resources available on the platform.

${platformContext}

Guidelines:
- Be helpful, concise, and friendly
- Focus on the platform's content and capabilities
- If asked about specific tools, reference the ones available on the platform
- If asked about features not on the platform, politely redirect to what is available
- Keep responses under 200 words
- Use a conversational but professional tone
- Format responses using markdown for better readability:
  * Use **bold** for important terms and tool names
  * Use bullet points (-) for lists
  * Use code formatting for technical terms (use backticks)
  * Use line breaks for better structure
- If you don't know something specific about the platform, be honest and suggest they explore the relevant sections`
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try asking another question.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm experiencing some technical difficulties right now. Please try again later or browse the platform directly to find what you're looking for.";
  }
}