import { auth, db, isDemoMode } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { User, BankAccount, Transaction } from '../types';
import { DEFAULT_ACCOUNTS, DEFAULT_TRANSACTIONS } from '../constants';

const LOCAL_STORAGE_KEY = 'finvue_demo_user';

export const storageService = {
  // 監聽登入狀態
  subscribeAuth: (callback: (user: User | null) => void) => {
    // 如果是展示模式或 Firebase 未初始化
    if (isDemoMode || !auth) {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      const user = savedUser ? JSON.parse(savedUser) : null;
      // 使用 requestAnimationFrame 或 setTimeout 確保在主線程空閒時回傳，模擬異步行為
      const timeout = setTimeout(() => {
        callback(user);
      }, 0);
      return () => clearTimeout(timeout);
    }
    
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '使用者'
        });
      } else {
        callback(null);
      }
    });
  },

  login: async (email: string, pass: string): Promise<User | null> => {
    if (isDemoMode || !auth) {
      // 展示模式下的模擬登入邏輯
      if (email === 'demo@example.com' && pass === 'password123') {
        const demoUser = { id: 'demo-uid', email, displayName: '展示使用者' };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoUser));
        return demoUser;
      }
      throw new Error("帳號或密碼錯誤（展示模式僅支援示範帳號）");
    }
    
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return {
      id: result.user.uid,
      email: result.user.email || '',
      displayName: result.user.displayName || '使用者'
    };
  },

  register: async (email: string, pass: string, name: string): Promise<User> => {
    if (isDemoMode || !auth) {
      const newUser = { id: Date.now().toString(), email, displayName: name };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
      return newUser;
    }
    
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return {
      id: result.user.uid,
      email: result.user.email || '',
      displayName: name
    };
  },

  logout: async () => {
    if (isDemoMode) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload(); 
      return;
    }
    if (auth) await signOut(auth);
  },

  // Bank Accounts
  getAccounts: async (userId: string): Promise<BankAccount[]> => {
    if (isDemoMode || !db) {
      const saved = localStorage.getItem('finvue_accounts');
      return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
    }
    const q = query(collection(db, "accounts"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BankAccount));
  },

  saveAccount: async (userId: string, account: Partial<BankAccount>, allAccounts?: BankAccount[]) => {
    if (isDemoMode || !db) {
      if (allAccounts) localStorage.setItem('finvue_accounts', JSON.stringify(allAccounts));
      return;
    }
    if (account.id) {
      const ref = doc(db, "accounts", account.id);
      const { id, ...data } = account;
      await updateDoc(ref, { ...data });
    } else {
      await addDoc(collection(db, "accounts"), { ...account, userId });
    }
  },

  // Transactions
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    if (isDemoMode || !db) {
      const saved = localStorage.getItem('finvue_transactions');
      return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
    }
    const q = query(collection(db, "transactions"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  },

  addTransaction: async (userId: string, transaction: Omit<Transaction, 'id'>, allTrans?: Transaction[]) => {
    if (isDemoMode || !db) {
      if (allTrans) localStorage.setItem('finvue_transactions', JSON.stringify(allTrans));
      return;
    }
    await addDoc(collection(db, "transactions"), { ...transaction, userId });
  }
};