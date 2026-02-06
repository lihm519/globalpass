import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, packages } = req.body;

    // 从环境变量获取 API Key（服务端）
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 构建包含套餐信息的 prompt
    const packagesInfo = packages
      .map((pkg: any) => 
        `${pkg.provider} - ${pkg.plan_name}: ${pkg.data_amount}, ${pkg.validity}, $${pkg.price}`
      )
      .join('\n');
    
    const prompt = `You are an E-SIM shopping assistant for GlobalPass. 

IMPORTANT: Respond in the SAME LANGUAGE as the user's question. If the user writes in Chinese, respond in Chinese. If in English, respond in English. If in Japanese, respond in Japanese, etc.

User question: ${message}

Available packages:
${packagesInfo}

Please provide a helpful response recommending the best package(s) based on the user's needs. Keep your response concise and friendly. Remember to use the SAME LANGUAGE as the user's question.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ response: text });
  } catch (error: any) {
    console.error('AI Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Unknown error' 
    });
  }
}
