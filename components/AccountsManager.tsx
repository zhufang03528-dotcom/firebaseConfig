
import React, { useState } from 'react';
import { BankAccount } from '../types';

interface AccountsManagerProps {
  accounts: BankAccount[];
  onUpdate: (accounts: BankAccount[]) => void;
}

const AccountsManager: React.FC<AccountsManagerProps> = ({ accounts, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BankAccount>>({
    name: '',
    type: '儲蓄',
    balance: 0,
    currency: 'TWD',
    color: '#10b981'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      onUpdate(accounts.map(a => a.id === editingId ? { ...a, ...formData } as BankAccount : a));
    } else {
      const newAcc: BankAccount = {
        id: Date.now().toString(),
        name: formData.name!,
        type: formData.type!,
        balance: Number(formData.balance),
        currency: 'TWD',
        color: formData.color!
      };
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

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此帳戶嗎？所有關聯紀錄將不再顯示。')) {
      onUpdate(accounts.filter(a => a.id !== id));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">銀行帳戶管理</h2>
          <p className="text-slate-500">管理您的銀行存款、信用卡與投資帳戶</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> 新增帳戶
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: acc.color }}></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{acc.type}</p>
                <h3 className="text-xl font-bold text-slate-800">{acc.name}</h3>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(acc)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                  <i className="fas fa-edit"></i>
                </button>
                <button onClick={() => handleDelete(acc.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <p className={`text-2xl font-black ${acc.balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
              ${acc.balance.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">{acc.currency}</p>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">{editingId ? '編輯帳戶' : '新增帳戶'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">帳戶名稱</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="例如：台銀薪轉、中信卡..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">類型</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="儲蓄">儲蓄</option>
                    <option value="信用">信用</option>
                    <option value="投資">投資</option>
                    <option value="現金">現金</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">目前餘額</label>
                  <input 
                    type="number" 
                    value={formData.balance}
                    onChange={e => setFormData({...formData, balance: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">代表顏色</label>
                <div className="flex gap-2">
                  {['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#475569'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({...formData, color: c})}
                      className={`w-8 h-8 rounded-full transition-transform ${formData.color === c ? 'scale-125 ring-2 ring-offset-2 ring-emerald-500' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all"
                >
                  確認儲存
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
