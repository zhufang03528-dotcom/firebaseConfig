
import React, { useState } from 'react';
import { Transaction, BankAccount, TransactionType } from '../types';
import { CATEGORIES } from '../constants';

interface TransactionsManagerProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  onUpdate: (transactions: Transaction[]) => void;
}

const TransactionsManager: React.FC<TransactionsManagerProps> = ({ transactions, accounts, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    accountId: accounts[0]?.id || '',
    categoryId: CATEGORIES[0]?.id || '',
    amount: 0,
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.accountId || !formData.categoryId) return;

    const newTrans: Transaction = {
      id: Date.now().toString(),
      accountId: formData.accountId!,
      categoryId: formData.categoryId!,
      amount: Number(formData.amount),
      type: formData.type as TransactionType,
      date: formData.date!,
      note: formData.note || ''
    };

    onUpdate([newTrans, ...transactions]);
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

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此筆紀錄嗎？')) {
      onUpdate(transactions.filter(t => t.id !== id));
    }
  };

  const getCategory = (id: string) => CATEGORIES.find(c => c.id === id);
  const getAccount = (id: string) => accounts.find(a => a.id === id);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">財務紀錄</h2>
          <p className="text-slate-500">追蹤您的每一筆收入與支出</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> 新增紀錄
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">日期</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">分類</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">帳戶</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">備註</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">金額</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.sort((a, b) => b.date.localeCompare(a.date)).map(t => {
                const cat = getCategory(t.categoryId);
                const acc = getAccount(t.accountId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{t.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${cat?.color} flex items-center justify-center text-white text-xs`}>
                          <i className={`fas ${cat?.icon}`}></i>
                        </div>
                        <span className="text-sm font-medium text-slate-700">{cat?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{acc?.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 italic">{t.note}</td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">尚無財務紀錄</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">新增財務紀錄</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                >
                  支出
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'INCOME'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  收入
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">金額</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">日期</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">分類</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.filter(c => c.type === formData.type).map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({...formData, categoryId: cat.id})}
                      className={`p-2 rounded-xl flex flex-col items-center gap-1 border-2 transition-all ${formData.categoryId === cat.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center text-white text-xs shadow-sm`}>
                        <i className={`fas ${cat.icon}`}></i>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">使用帳戶</label>
                <select 
                  value={formData.accountId}
                  onChange={e => setFormData({...formData, accountId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">備註</label>
                <input 
                  type="text" 
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none"
                  placeholder="寫點什麼..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">取消</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all">儲存紀錄</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsManager;
