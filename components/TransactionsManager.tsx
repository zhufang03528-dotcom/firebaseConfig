import React, { useState } from 'react';
import { Transaction, BankAccount, TransactionType } from '../types';
import { CATEGORIES } from '../constants';
import { storageService } from '../services/storageService';
import { isDemoMode } from '../services/firebase';

interface TransactionsManagerProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  onUpdate: (transactions: Transaction[]) => void;
  userId: string;
}

const TransactionsManager: React.FC<TransactionsManagerProps> = ({ transactions, accounts, onUpdate, userId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    accountId: accounts[0]?.id || '',
    categoryId: CATEGORIES[0]?.id || '',
    amount: 0,
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.accountId || !formData.categoryId) return;

    const newTrans: Omit<Transaction, 'id'> = {
      accountId: formData.accountId!,
      categoryId: formData.categoryId!,
      amount: Number(formData.amount),
      type: formData.type as TransactionType,
      date: formData.date!,
      note: formData.note || ''
    };

    if (!isDemoMode) {
      await storageService.addTransaction(userId, newTrans);
    }
    
    // 生成一個臨時 ID 用於前端顯示直到下次重新整理從資料庫抓取
    const displayTrans: Transaction = { ...newTrans, id: Date.now().toString() };
    onUpdate([displayTrans, ...transactions]);
    
    setIsAdding(false);
    setFormData({
      accountId: accounts[0]?.id || '',
      categoryId: CATEGORIES[0]?.id || '',
      amount: 0,
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('確定要刪除此筆紀錄嗎？')) {
      if (!isDemoMode) {
        await storageService.deleteTransaction(id);
      }
      onUpdate(transactions.filter(t => t.id !== id));
    }
  };

  const getCategory = (id: string) => CATEGORIES.find(c => c.id === id);
  const getAccount = (id: string) => accounts.find(a => a.id === id);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-24 md:pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800">收支明細</h2>
          <p className="text-slate-500 font-medium">記錄您的日常每一分花費與收入</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group"
        >
          <i className="fas fa-plus group-hover:rotate-90 transition-transform"></i> 新增紀錄
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">日期</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">分類</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">帳戶</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">備註</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">金額</th>
                <th className="px-8 py-5 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.sort((a, b) => b.date.localeCompare(a.date)).map(t => {
                const cat = getCategory(t.categoryId);
                const acc = getAccount(t.accountId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-slate-500">{t.date}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${cat?.color} flex items-center justify-center text-white text-sm shadow-sm`}>
                          <i className={`fas ${cat?.icon}`}></i>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{cat?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase">
                        {acc?.name || '未知帳戶'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-400 font-medium truncate max-w-[150px]">
                      {t.note || '—'}
                    </td>
                    <td className={`px-8 py-5 text-lg font-black text-right tracking-tight ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-2xl">
                        <i className="fas fa-inbox"></i>
                      </div>
                      <p className="text-slate-300 font-bold">尚無任何財務紀錄</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black text-slate-900 mb-8">新增紀錄</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}
                >
                  <i className="fas fa-arrow-down mr-2"></i>支出
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'INCOME'})}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.type === 'INCOME' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                >
                  <i className="fas fa-arrow-up mr-2"></i>收入
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">金額</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">日期</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">選擇分類</label>
                <div className="grid grid-cols-4 gap-3">
                  {CATEGORIES.filter(c => c.type === formData.type).map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({...formData, categoryId: cat.id})}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-2 border-4 transition-all ${formData.categoryId === cat.id ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center text-white text-sm shadow-sm`}>
                        <i className={`fas ${cat.icon}`}></i>
                      </div>
                      <span className="text-[10px] font-black text-slate-600 whitespace-nowrap">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">使用帳戶</label>
                <select 
                  value={formData.accountId}
                  onChange={e => setFormData({...formData, accountId: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 font-bold bg-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">備註</label>
                <input 
                  type="text" 
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 font-bold"
                  placeholder="這一筆錢花在哪裡？"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">取消</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all">儲存紀錄</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsManager;
