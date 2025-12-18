
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Category, BankAccount } from "../types";

export const getFinancialAdvice = async (
  transactions: Transaction[],
  categories: Category[],
  accounts: BankAccount[]
) => {
  // Fix: Directly initialize GoogleGenAI with the API key from environment variables
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = transactions.map(t => {
    const cat = categories.find(c => c.id === t.categoryId);
    const acc = accounts.find(a => a.id === t.accountId);
    return `${t.date}: ${t.type === 'INCOME' ? '收入' : '支出'} ${t.amount} (${cat?.name || '未知'}) 帳戶: ${acc?.name || '未知'} 備註: ${t.note}`;
  }).join('\n');

  // Fix: Use systemInstruction to define the AI persona and task constraints
  const systemInstruction = `你是一位資深的專業理財顧問。請對使用者的財務數據進行深度分析，並提供具體建議與財務評分（1-100）。
  分析要求：
  1. 財務現狀分析：指出消費盲點或健康的財務徵兆。
  2. 具體建議：提供三個可執行的建議（包含資產配置比例、節流具體項目或開源方向）。
  3. 財務評分：根據收支比、儲蓄率給予 1-100 的綜合評分。
  請以繁體中文回答，並嚴格遵守 JSON 格式。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `以下是我的財務紀錄數據：\n${summary}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER }
          },
          required: ["analysis", "recommendations", "score"]
        }
      }
    });

    // Fix: Safely access the .text property of the GenerateContentResponse object
    const text = response.text?.trim();
    if (!text) {
      throw new Error("Model returned empty response");
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return {
      analysis: "AI 分析暫時發生錯誤，請稍後再試。",
      recommendations: ["檢視您的網路連接", "確認 API 權限是否正確"],
      score: 0
    };
  }
};
