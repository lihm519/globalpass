import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, packages } = await request.json();

    // 从环境变量获取 API Key（服务端）
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 构建包含套餐信息的 prompt
    const packagesInfo = packages
      .map((pkg: any) => 
        `${pkg.provider} - ${pkg.plan_name}: ${pkg.data_amount}, ${pkg.validity}, $${pkg.price}`
      )
      .join('\n');
    
    const prompt = `You are an E-SIM shopping assistant for GlobalPass. 

User question: ${message}

Available packages:
${packagesInfo}

Please provide a helpful response recommending the best package(s) based on the user's needs. Keep your response concise and friendly.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('AI Error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
