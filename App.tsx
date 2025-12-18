import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { storageService } from './services/storageService';
import { isDemoMode } from './services/firebase';
import { User, BankAccount, Transaction } from './types';
import Dashboard from './components/Dashboard';
import AccountsManager from './components/AccountsManager';
import TransactionsManager from './components/TransactionsManager';
import Login from './components/Login';
import Register from './components/Register';
import AIAdvisor from './components/AIAdvisor';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribe = storageService.subscribeAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    if (user) {
      const accs = await storageService.getAccounts(user.id);
      const trans = await storageService.getTransactions(user.id);
      setAccounts(accs);
      setTransactions(trans);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleUpdateAccounts = async (newAccounts: BankAccount[]) => {
    if (!user) return;
    
    // 如果是刪除或新增，這裡需要判斷
    // 為了開發效率與一致性，我們對 State 做即時更新
    setAccounts(newAccounts);
    
    if (isDemoMode) {
      await storageService.saveAccount(user.id, {}, newAccounts);
    } else {
      // 在 Firebase 模式下，組件內部會直接調用個別的儲存 API
      // 這裡僅作為數據流同步
    }
  };

  const handleUpdateTransactions = async (newTransactions: Transaction[]) => {
    if (!user) return;
    setTransactions(newTransactions);
    if (isDemoMode) {
      await storageService.addTransaction(user.id, {} as any, newTransactions);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-4xl text-emerald-500">
            <i className="fas fa-circle-notch"></i>
          </div>
          <p className="tracking-widest">系統載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register onRegister={setUser} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
          <div className="p-8">
            <h1 className="text-2xl font-black flex items-center gap-3">
              <i className="fas fa-chart-pie text-emerald-400"></i>
              FinVue AI
            </h1>
            {isDemoMode && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                <i className="fas fa-flask"></i> DEMO MODE
              </div>
            )}
          </div>
          <nav className="flex-1 px-4 space-y-1">
            <SidebarLink to="/" icon="fa-th-large" label="財務總覽" />
            <SidebarLink to="/accounts" icon="fa-university" label="帳戶管理" />
            <SidebarLink to="/transactions" icon="fa-exchange-alt" label="收支明細" />
            <SidebarLink to="/ai-advisor" icon="fa-robot" label="AI 智能顧問" />
          </nav>
          <div className="p-6 mt-auto border-t border-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                {user.displayName.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user.displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => storageService.logout()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-900/20 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center gap-2 text-xs font-bold"
            >
              <i className="fas fa-sign-out-alt"></i> 登出系統
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative">
          <Routes>
            <Route path="/" element={<Dashboard accounts={accounts} transactions={transactions} />} />
            <Route path="/accounts" element={<AccountsManager accounts={accounts} onUpdate={handleUpdateAccounts} userId={user.id} />} />
            <Route path="/transactions" element={<TransactionsManager transactions={transactions} accounts={accounts} onUpdate={handleUpdateTransactions} userId={user.id} />} />
            <Route path="/ai-advisor" element={<AIAdvisor transactions={transactions} accounts={accounts} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          
          {/* Mobile Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
            <MobileNavLink to="/" icon="fa-th-large" />
            <MobileNavLink to="/accounts" icon="fa-university" />
            <MobileNavLink to="/transactions" icon="fa-exchange-alt" />
            <MobileNavLink to="/ai-advisor" icon="fa-robot" />
          </nav>
        </main>
      </div>
    </HashRouter>
  );
};

const SidebarLink: React.FC<{ to: string, icon: string, label: string }> = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-all group">
    <i className={`fas ${icon} text-slate-500 group-hover:text-emerald-400 w-5 transition-colors`}></i>
    <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
  </Link>
);

const MobileNavLink: React.FC<{ to: string, icon: string }> = ({ to, icon }) => (
  <Link to={to} className="p-3 text-slate-400 hover:text-emerald-500 transition-colors">
    <i className={`fas ${icon} text-xl`}></i>
  </Link>
);

export default App;
