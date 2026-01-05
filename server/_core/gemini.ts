/**
 * Gemini AI 客户端配置
 * 用于 GlobalPass AI 导购功能
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./env";

let _geminiClient: GoogleGenerativeAI | null = null;

/**
 * 获取 Gemini AI 客户端实例
 */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!_geminiClient) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ENV.forgeApiKey;
    
    if (!apiKey) {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
    }
    
    _geminiClient = new GoogleGenerativeAI(apiKey);
  }
  
  return _geminiClient;
}

/**
 * 调用 Gemini AI 生成回答
 */
export async function generateGeminiResponse(params: {
  prompt: string;
  context?: string;
  model?: string;
}): Promise<string> {
  const { prompt, context, model = "gemini-2.5-flash" } = params;
  
  try {
    const client = getGeminiClient();
    const geminiModel = client.getGenerativeModel({ model });
    
    // 构建完整的提示词
    const fullPrompt = context 
      ? `${context}\n\n用户问题：${prompt}\n\n请基于上述套餐数据，用简洁、直接的语言回答用户问题。对比价格时要具体说明哪个提供商更便宜。`
      : prompt;
    
    const result = await geminiModel.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("[Gemini AI] Error:", error);
    throw new Error("AI 生成失败，请稍后重试");
  }
}

/**
 * 流式生成 Gemini 回答
 */
export async function* streamGeminiResponse(params: {
  prompt: string;
  context?: string;
  model?: string;
}): AsyncGenerator<string> {
  const { prompt, context, model = "gemini-2.5-flash" } = params;
  
  try {
    const client = getGeminiClient();
    const geminiModel = client.getGenerativeModel({ model });
    
    // 构建完整的提示词
    const fullPrompt = context 
      ? `${context}\n\n用户问题：${prompt}\n\n请基于上述套餐数据，用简洁、直接的语言回答用户问题。对比价格时要具体说明哪个提供商更便宜。`
      : prompt;
    
    const result = await geminiModel.generateContentStream(fullPrompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error) {
    console.error("[Gemini AI] Stream Error:", error);
    throw new Error("AI 生成失败，请稍后重试");
  }
}
