
import { Category, BankAccount, Transaction } from './types';

export const CATEGORIES: Category[] = [
  { id: 'cat1', name: '餐飲美食', icon: 'fa-utensils', color: 'bg-orange-500', type: 'EXPENSE' },
  { id: 'cat2', name: '交通運輸', icon: 'fa-car', color: 'bg-blue-500', type: 'EXPENSE' },
  { id: 'cat3', name: '居家生活', icon: 'fa-home', color: 'bg-indigo-500', type: 'EXPENSE' },
  { id: 'cat4', name: '休閒娛樂', icon: 'fa-gamepad', color: 'bg-purple-500', type: 'EXPENSE' },
  { id: 'cat5', name: '醫療保健', icon: 'fa-heartbeat', color: 'bg-red-500', type: 'EXPENSE' },
  { id: 'cat6', name: '薪資收入', icon: 'fa-wallet', color: 'bg-emerald-500', type: 'INCOME' },
  { id: 'cat7', name: '投資收益', icon: 'fa-chart-line', color: 'bg-cyan-500', type: 'INCOME' },
  { id: 'cat8', name: '其他收入', icon: 'fa-plus-circle', color: 'bg-slate-500', type: 'INCOME' },
];

export const DEFAULT_ACCOUNTS: BankAccount[] = [
  { id: 'acc1', name: '薪轉帳戶', type: '儲蓄', balance: 50000, currency: 'TWD', color: '#10b981' },
  { id: 'acc2', name: '常用信用卡', type: '信用', balance: -12500, currency: 'TWD', color: '#6366f1' },
  { id: 'acc3', name: '投資帳戶', type: '投資', balance: 150000, currency: 'TWD', color: '#f59e0b' },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 't1', accountId: 'acc1', categoryId: 'cat6', amount: 60000, type: 'INCOME', date: '2023-11-05', note: '11月份薪資' },
  { id: 't2', accountId: 'acc1', categoryId: 'cat1', amount: 150, type: 'EXPENSE', date: '2023-11-06', note: '午餐' },
  { id: 't3', accountId: 'acc2', categoryId: 'cat2', amount: 2500, type: 'EXPENSE', date: '2023-11-07', note: '加油' },
  { id: 't4', accountId: 'acc1', categoryId: 'cat3', amount: 12000, type: 'EXPENSE', date: '2023-11-01', note: '房租' },
];
