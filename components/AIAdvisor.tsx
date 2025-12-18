
import React, { useState } from 'react';
import { getFinancialAdvice } from '../services/geminiService';
import { Transaction, BankAccount } from '../types';
import { CATEGORIES } from '../constants';

interface AIAdvisorProps {
  transactions: Transaction[];
  accounts: BankAccount[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, accounts }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<{ analysis: string, recommendations: string[], score: number } | null>(null);

  const fetchAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(transactions, CATEGORIES, accounts);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-xl shadow-indigo-200">
          <i className="fas fa-robot"></i>
        </div>
        <h2 className="text-3xl font-bold text-slate-800">AI 理財顧問</h2>
        <p className="text-slate-500 mt-2">基於您的消費習慣，Gemini 將為您提供最精準的建議</p>
      </div>

      {!advice && !loading && (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
          <h3 className="text-xl font-bold text-slate-700 mb-4">準備好獲得您的個人化建議了嗎？</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">我們的 AI 將分析您的收入分佈、支出頻率及資產配置，助您更快達成財務目標。</p>
          <button 
            onClick={fetchAdvice}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-1"
          >
            立即生成分析報告
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin text-4xl text-indigo-500">
              <i className="fas fa-circle-notch"></i>
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">正在分析您的財務數據...</h3>
          <p className="text-slate-400">這可能需要幾秒鐘時間</p>
        </div>
      )}

      {advice && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fas fa-chart-pie text-indigo-500"></i> 財務現狀分析
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg italic">
                "{advice.analysis}"
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">本月理財評分</h3>
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                  <circle 
                    cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * advice.score) / 100}
                    className="text-indigo-600" 
                  />
                </svg>
                <span className="absolute text-3xl font-black text-slate-800">{advice.score}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <i className="fas fa-lightbulb text-amber-400"></i> AI 的具體建議
            </h3>
            <div className="space-y-4">
              {advice.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-4 items-start bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <p className="text-slate-300 font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={fetchAdvice}
            className="w-full py-4 text-indigo-600 font-bold hover:bg-indigo-50 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-sync-alt"></i> 重新分析數據
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
