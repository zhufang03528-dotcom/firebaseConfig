import React, { useState } from 'react';
import { BankAccount } from '../types';
import { storageService } from '../services/storageService';
import { isDemoMode } from '../services/firebase';

interface AccountsManagerProps {
  accounts: BankAccount[];
  onUpdate: (accounts: BankAccount[]) => void;
  userId: string;
}

const AccountsManager: React.FC<AccountsManagerProps> = ({ accounts, onUpdate, userId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BankAccount>>({
    name: '',
    type: '儲蓄',
    balance: 0,
    currency: 'TWD',
    color: '#10b981'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      const updatedAccount = { ...formData, id: editingId } as BankAccount;
      if (!isDemoMode) {
        await storageService.saveAccount(userId, updatedAccount);
      }
      onUpdate(accounts.map(a => a.id === editingId ? updatedAccount : a));
    } else {
      const newAcc: BankAccount = {
        id: Date.now().toString(),
        name: formData.name!,
        type: formData.type!,
        balance: Number(formData.balance),
        currency: 'TWD',
        color: formData.color!
      };
      if (!isDemoMode) {
        await storageService.saveAccount(userId, newAcc);
      }
      onUpdate([...accounts, newAcc]);
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: '', type: '儲蓄', balance: 0, currency: 'TWD', color: '#10b981' });
  };

  const handleEdit = (acc: BankAccount) => {
    setFormData(acc);
    setEditingId(acc.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('確定要刪除此帳戶嗎？所有關聯紀錄將不再顯示。')) {
      if (!isDemoMode) {
        await storageService.deleteAccount(id);
      }
      onUpdate(accounts.filter(a => a.id !== id));
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-24 md:pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800">資產帳戶</h2>
          <p className="text-slate-500 font-medium">管理您的現金、銀行存款與信用卡資產</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 flex items-center gap-2 group"
        >
          <i className="fas fa-plus group-hover:rotate-90 transition-transform"></i> 新增帳戶
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10" style={{ backgroundColor: acc.color }}></div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg shadow-sm" style={{ backgroundColor: acc.color }}>
                  <i className={`fas ${acc.type === '信用' ? 'fa-credit-card' : acc.type === '投資' ? 'fa-chart-line' : 'fa-university'}`}></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{acc.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{acc.type}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(acc)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                  <i className="fas fa-pencil-alt"></i>
                </button>
                <button onClick={() => handleDelete(acc.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-tighter">當前餘額</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">{acc.currency}</span>
                <p className={`text-3xl font-black tracking-tight ${acc.balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                  {acc.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-8">{editingId ? '編輯帳戶' : '新增帳戶'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">帳戶名稱</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-bold"
                  placeholder="例如：台銀薪轉、中信卡..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">資產類型</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 font-bold bg-white"
                  >
                    <option value="儲蓄">儲蓄</option>
                    <option value="信用">信用</option>
                    <option value="投資">投資</option>
                    <option value="現金">現金</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">初始餘額</label>
                  <input 
                    type="number" 
                    value={formData.balance}
                    onChange={e => setFormData({...formData, balance: Number(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 font-bold"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">代表色</label>
                <div className="flex flex-wrap gap-3">
                  {['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#475569'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({...formData, color: c})}
                      className={`w-10 h-10 rounded-full transition-all border-4 ${formData.color === c ? 'border-slate-900 scale-110 shadow-lg' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all"
                >
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsManager;
