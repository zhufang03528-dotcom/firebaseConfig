
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fix: Added async to handle the asynchronous storageService.login call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Fix: Use await since storageService.login returns a Promise
      const user = await storageService.login(email, password);
      if (user) {
        onLogin(user);
        navigate('/');
      } else {
        setError('電子郵件或密碼錯誤');
      }
    } catch (err: any) {
      setError(err.message || '登入失敗');
    }
  };

  // Fix: Added async to handle the asynchronous storageService.login call
  const handleQuickLogin = async () => {
    const demoEmail = 'demo@example.com';
    const demoPass = 'password123';
    try {
      // Fix: Use await since storageService.login returns a Promise
      const user = await storageService.login(demoEmail, demoPass);
      if (user) {
        onLogin(user);
        navigate('/');
      }
    } catch (err: any) {
      setError('示範帳號登入失敗');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-emerald-100">
            <i className="fas fa-chart-pie"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">FinVue AI</h1>
          <p className="text-slate-500 mt-2">您的個人化智能理財助手</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">電子郵件</label>
            <input 
              type="email" 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">密碼</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-rose-500 text-sm font-medium text-center">{error}</p>}

          <div className="space-y-3">
            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all transform active:scale-95"
            >
              登入系統
            </button>
            
            <button 
              type="button"
              onClick={handleQuickLogin}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-3 rounded-2xl font-bold transition-all border border-emerald-200 flex items-center justify-center gap-2"
            >
              <i className="fas fa-bolt text-emerald-500"></i>
              示範帳號快速登入
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase mb-2">測試帳號資訊</p>
          <p className="text-sm text-slate-600">帳號: <span className="font-mono font-bold">demo@example.com</span></p>
          <p className="text-sm text-slate-600">密碼: <span className="font-mono font-bold">password123</span></p>
        </div>

        <p className="text-center mt-8 text-slate-500">
          還沒有帳號？ <Link to="/register" className="text-emerald-600 font-bold hover:underline">立即註冊</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
