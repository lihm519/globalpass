// 诊断脚本：检查 Google API Key 能访问哪些模型

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyBS3niu73alSBcI4AS6mCjp94RsqSjkJNA';

console.log('='.repeat(60));
console.log('Google Generative AI API Key 诊断');
console.log('='.repeat(60));
console.log(`API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 5)}`);
console.log('');

// 方法 1: 直接使用 fetch 调用 Google API
async function listModelsViaFetch() {
  console.log('【方法 1】直接调用 Google API (fetch)');
  console.log('-'.repeat(60));
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`状态码: ${response.status}`);
    console.log(`响应头: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    console.log('');
    
    if (response.ok) {
      console.log('✅ API Key 有效！');
      console.log(`可用模型数量: ${data.models ? data.models.length : 0}`);
      console.log('');
      
      if (data.models && data.models.length > 0) {
        console.log('可用模型列表:');
        data.models.forEach((model, index) => {
          console.log(`  ${index + 1}. ${model.name}`);
          console.log(`     - displayName: ${model.displayName || 'N/A'}`);
          console.log(`     - supportedGenerationMethods: ${model.supportedGenerationMethods ? model.supportedGenerationMethods.join(', ') : 'N/A'}`);
        });
      }
    } else {
      console.log('❌ API 调用失败');
      console.log('错误响应:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
  }
  
  console.log('');
}

// 方法 2: 使用 Google SDK
async function listModelsViaSDK() {
  console.log('【方法 2】使用 Google Generative AI SDK');
  console.log('-'.repeat(60));
  
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // 尝试列出模型
    console.log('尝试调用 SDK...');
    
    // SDK 可能没有 listModels 方法，所以我们尝试直接创建模型
    const testModels = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash-exp'
    ];
    
    console.log('测试以下模型是否可用:');
    for (const modelName of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`  ✅ ${modelName} - 可以初始化`);
      } catch (error) {
        console.log(`  ❌ ${modelName} - 初始化失败: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ SDK 错误:', error.message);
  }
  
  console.log('');
}

// 执行诊断
async function main() {
  await listModelsViaFetch();
  await listModelsViaSDK();
  
  console.log('='.repeat(60));
  console.log('诊断完成');
  console.log('='.repeat(60));
}

main();
