
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BankAccount, Transaction } from '../types';
import { CATEGORIES } from '../constants';

interface DashboardProps {
  accounts: BankAccount[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions }) => {
  const stats = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = monthlyTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthlyTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalBalance,
      monthlyIncome: income,
      monthlyExpenses: expense,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0
    };
  }, [accounts, transactions]);

  const chartData = useMemo(() => {
    // Last 6 months trend
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${d.getMonth() + 1}月`;
      const m = d.getMonth();
      const y = d.getFullYear();

      const mTrans = transactions.filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === m && td.getFullYear() === y;
      });

      months.push({
        name: label,
        收入: mTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
        支出: mTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
      });
    }
    return months;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenseMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      expenseMap[t.categoryId] = (expenseMap[t.categoryId] || 0) + t.amount;
    });

    return Object.entries(expenseMap).map(([catId, amount]) => {
      const cat = CATEGORIES.find(c => c.id === catId);
      return {
        name: cat?.name || '其他',
        value: amount,
        color: cat?.color.replace('bg-', '') || 'gray-500'
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">歡迎回來</h2>
          <p className="text-slate-500">這是您的個人財務概覽</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">總淨值</p>
          <p className={`text-4xl font-black ${stats.totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ${stats.totalBalance.toLocaleString()}
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="本月收入" 
          value={stats.monthlyIncome} 
          icon="fa-arrow-up" 
          color="emerald" 
        />
        <StatCard 
          label="本月支出" 
          value={stats.monthlyExpenses} 
          icon="fa-arrow-down" 
          color="rose" 
        />
        <StatCard 
          label="儲蓄率" 
          value={stats.savingsRate.toFixed(1) + '%'} 
          icon="fa-piggy-bank" 
          color="indigo" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-chart-line text-emerald-500"></i> 收支趨勢
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="收入" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="支出" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-pie-chart text-indigo-500"></i> 支出分類
          </h3>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                  <span className="text-sm text-slate-600">{cat.name}</span>
                </div>
                <span className="text-sm font-semibold">${cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, icon: string, color: string }> = ({ label, value, icon, color }) => {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
      <div className={`w-14 h-14 rounded-xl ${colorMap[color]} flex items-center justify-center text-xl`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-800">
          {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
