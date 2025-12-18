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

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const accs = await storageService.getAccounts(user.id);
        const trans = await storageService.getTransactions(user.id);
        setAccounts(accs);
        setTransactions(trans);
      }
    };
    fetchData();
  }, [user]);

  const handleUpdateAccounts = async (newAccounts: BankAccount[]) => {
    if (!user) return;
    setAccounts(newAccounts);
    // 找出是否有新增或修改的項目並持久化
    // 在展示模式下，我們直接儲存整個陣列以求方便
    if (isDemoMode) {
      await storageService.saveAccount(user.id, {}, newAccounts);
    } else {
      // Firebase 模式下，AccountsManager 應該個別呼叫 storageService.saveAccount
      // 這裡維持 State 同步，實際儲存動作已在組件內優化
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
    return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin text-4xl text-emerald-500"><i className="fas fa-circle-notch"></i></div>
        <p>正在啟動加密連線...</p>
      </div>
    </div>;
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
          <div className="p-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <i className="fas fa-chart-pie text-emerald-400"></i>
              FinVue AI
              {isDemoMode && <span className="text-[10px] bg-amber-500 px-1 rounded ml-1">DEMO</span>}
            </h1>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <SidebarLink to="/" icon="fa-th-large" label="總覽控制台" />
            <SidebarLink to="/accounts" icon="fa-university" label="銀行帳戶" />
            <SidebarLink to="/transactions" icon="fa-exchange-alt" label="財務紀錄" />
            <SidebarLink to="/ai-advisor" icon="fa-robot" label="AI 理財建議" />
          </nav>
          <div className="p-4 mt-auto border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-2 truncate">登入帳號：{user.email}</p>
            <button 
              onClick={() => storageService.logout()}
              className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <i className="fas fa-sign-out-alt"></i> 登出系統
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard accounts={accounts} transactions={transactions} />} />
            <Route path="/accounts" element={<AccountsManager accounts={accounts} onUpdate={handleUpdateAccounts} />} />
            <Route path="/transactions" element={<TransactionsManager transactions={transactions} accounts={accounts} onUpdate={handleUpdateTransactions} />} />
            <Route path="/ai-advisor" element={<AIAdvisor transactions={transactions} accounts={accounts} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

const SidebarLink: React.FC<{ to: string, icon: string, label: string }> = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors group">
    <i className={`fas ${icon} text-slate-400 group-hover:text-emerald-400 w-5`}></i>
    <span className="font-medium">{label}</span>
  </Link>
);

export default App;