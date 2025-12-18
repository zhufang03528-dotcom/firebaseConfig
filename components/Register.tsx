
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { User } from '../types';

interface RegisterProps {
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Fix: Added async to handle the asynchronous storageService.register call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Fix: Use await since storageService.register returns a Promise
      const user = await storageService.register(email, password, name);
      onRegister(user);
      navigate('/');
    } catch (err: any) {
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-emerald-100">
            <i className="fas fa-user-plus"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">建立帳號</h1>
          <p className="text-slate-500 mt-2">開始您的智能理財之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">顯示名稱</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700"
              placeholder="您的姓名或暱稱"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
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
            <label className="block text-sm font-bold text-slate-700 mb-2">設定密碼</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700"
              placeholder="至少 8 個字元"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-100 transition-all transform active:scale-95"
          >
            註冊帳號
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500">
          已經有帳號了？ <Link to="/login" className="text-emerald-600 font-bold hover:underline">返回登入</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
