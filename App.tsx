import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { User, Task, ViewState, Language, Priority, Category } from './types';
import { CATEGORIES, QUOTES, getTranslation } from './constants';
import { generateTasksFromAI } from './services/geminiService';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  subscribeToTasks, 
  addTaskToDb, 
  updateTaskInDb, 
  deleteTaskFromDb,
  resendVerification,
  auth
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  Circle, 
  Sparkles, 
  Search, 
  Calendar,
  X,
  Upload,
  AlertCircle,
  ChevronDown,
  CheckSquare,
  Moon,
  Zap,
  ArrowRight,
  MoreHorizontal,
  Mail,
  ShieldCheck
} from 'lucide-react';

// --- ONBOARDING COMPONENT ---
const Onboarding = ({ onComplete, lang }: { onComplete: () => void, lang: Language }) => (
  <div className="fixed inset-0 bg-deep-950 z-50 flex flex-col items-center justify-center p-8 text-white text-center overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-deep-900 to-black z-0"></div>
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-deep-700/30 rounded-full blur-[120px] animate-blob"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pale-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>

    <div className="relative z-10 flex flex-col items-center max-w-2xl animate-fade-in">
      <div className="w-24 h-24 bg-gradient-to-br from-pale-300 to-pale-500 rounded-[24px] flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(134,239,172,0.4)] transform rotate-12 hover:rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
        <Sparkles size={48} className="text-deep-900" strokeWidth={2.5} />
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-deep-200">
        CollabTask
      </h1>
      
      <p className="text-xl text-deep-200 mb-12 max-w-md leading-relaxed font-light">
        {getTranslation(lang, 'onboardingDesc')}
      </p>
      
      <button 
        onClick={onComplete} 
        className="group relative px-10 py-4 bg-pale-300 hover:bg-pale-200 text-deep-950 font-bold text-lg rounded-full shadow-glow transition-all hover:scale-105 hover:shadow-glow-hover flex items-center gap-3"
      >
        <span>{getTranslation(lang, 'getStarted')}</span>
        <div className="bg-deep-900/10 rounded-full p-1 group-hover:translate-x-1 transition-transform">
           <ArrowRight size={20} />
        </div>
      </button>
    </div>
  </div>
);

// --- AUTH COMPONENT ---
const AuthScreen = ({ onAuthSuccess, lang }: { onAuthSuccess: (u: User) => void, lang: Language }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (isRegister) {
        const firebaseUser = await registerUser(email, password, username);
        setSuccessMessage(getTranslation(lang, 'registrationSuccess'));
        console.log('Registration completed, user should now be in verification state');
        // Don't call onAuthSuccess here - let the auth listener handle it
      } else {
        const firebaseUser = await loginUser(email, password);
        console.log('Login completed, user:', firebaseUser.email);
        // Don't call onAuthSuccess here - let the auth listener handle it
      }
    } catch (err: any) {
      console.error('Auth error in component:', err.message || err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const t = (k: any) => getTranslation(lang, k);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-deep-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-deep-900 to-transparent opacity-50"></div>
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-pale-400/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-deep-600/20 rounded-full blur-[120px]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel p-8 md:p-10 rounded-[32px] shadow-2xl border border-white/10 animate-slide-up">
          <div className="flex justify-center mb-8">
             <div className="w-16 h-16 bg-gradient-to-br from-pale-300 to-pale-500 rounded-2xl flex items-center justify-center text-deep-900 shadow-glow shadow-pale-300/30">
               <CheckSquare size={32} strokeWidth={2.5} />
             </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-3 text-center text-white">
            {isRegister ? t('register') : t('login')}
          </h2>
          <p className="text-center text-deep-300 mb-6 text-sm">
            {isRegister ? 'Create your account to get started' : 'Welcome back! Please sign in to continue'}
          </p>
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-200 rounded-2xl text-sm flex items-center gap-3 animate-fade-in">
              <CheckCircle size={18} className="text-green-400"/> 
              {successMessage}
              <div className="text-xs text-green-300 mt-1">
                {isRegister && 'Please check your email for verification link.'}
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl text-sm flex items-center gap-3 animate-fade-in">
              <AlertCircle size={18} className="text-red-400"/> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-deep-400 ml-1">{t('username')}</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-deep-500 focus:bg-white/10 focus:border-pale-300 focus:ring-1 focus:ring-pale-300 outline-none transition-all"
                  placeholder="John Doe"
                  required
                  minLength={2}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-deep-400 ml-1">{t('email')}</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-deep-500 focus:bg-white/10 focus:border-pale-300 focus:ring-1 focus:ring-pale-300 outline-none transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-deep-400 ml-1">{t('password')}</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-deep-500 focus:bg-white/10 focus:border-pale-300 focus:ring-1 focus:ring-pale-300 outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {isRegister && (
                <p className="text-xs text-deep-400 mt-1">Password must be at least 6 characters</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              isLoading={isLoading} 
              className="w-full py-4 mt-4 text-lg font-bold"
              disabled={isLoading}
            >
              {isRegister ? t('register') : t('login')}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccessMessage('');
              }} 
              className="text-sm text-deep-300 hover:text-white transition-colors"
            >
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <span className="text-pale-300 font-semibold underline decoration-2 decoration-transparent hover:decoration-pale-300 transition-all">
                {isRegister ? t('login') : t('register')}
              </span>
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-deep-500">
              {isRegister 
                ? 'After registration, check your email for verification link.' 
                : 'Trouble logging in? Check your email/password and try again.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- VERIFICATION COMPONENT ---
const VerificationScreen = ({ lang, onVerified }: { lang: Language, onVerified: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [email, setEmail] = useState('');
  const t = (k: any) => getTranslation(lang, k);

  useEffect(() => {
    if (auth.currentUser?.email) {
      setEmail(auth.currentUser.email);
    }
  }, []);

  const handleResend = async () => {
    if (auth.currentUser) {
      setLoading(true);
      try {
        await resendVerification(auth.currentUser);
        setMsg("✅ Verification email sent again! Check your inbox (and spam folder).");
      } catch (error: any) {
        setMsg(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const checkVerification = async () => {
    setLoading(true);
    try {
      await auth.currentUser?.reload();
      const currentUser = auth.currentUser;
      
      if (currentUser?.emailVerified) {
        setMsg("✅ Email verified successfully!");
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setMsg("❌ Email not verified yet. Please click the link in your email.");
      }
    } catch (error: any) {
      setMsg(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-deep-950">
      <div className="glass-panel p-10 rounded-[32px] max-w-md w-full text-center border border-white/10">
        <div className="w-20 h-20 bg-pale-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
           <Mail size={40} className="text-pale-300" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">{t('verifyEmailTitle')}</h2>
        
        <div className="bg-white/5 p-4 rounded-xl mb-6">
          <p className="text-sm text-deep-300 mb-2">Verification email sent to:</p>
          <p className="font-mono text-pale-300 break-all">{email}</p>
        </div>
        
        <p className="text-deep-300 mb-8">
          {t('verifyEmailDesc')} <br/>
          <span className="text-xs text-deep-400">(Check your spam folder if you don't see it)</span>
        </p>
        
        {msg && (
          <div className={`mb-4 p-4 rounded-xl text-sm ${
            msg.includes('✅') ? 'bg-green-500/10 text-green-200' : 
            msg.includes('❌') ? 'bg-yellow-500/10 text-yellow-200' : 
            'bg-blue-500/10 text-blue-200'
          }`}>
            {msg}
          </div>
        )}

        <div className="space-y-4">
          <Button 
            onClick={checkVerification} 
            isLoading={loading} 
            variant="primary" 
            className="w-full"
          >
            <ShieldCheck size={20}/> {t('iHaveVerified')}
          </Button>
          
          <Button 
            onClick={handleResend} 
            variant="secondary" 
            className="w-full"
            disabled={loading}
          >
            {t('resendEmail')}
          </Button>
        </div>
        
        <button 
          onClick={() => logoutUser()} 
          className="mt-8 text-xs text-deep-400 hover:text-deep-300 transition-colors"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewState>('onboarding');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string>('');
  
  // Dashboard State
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Constants
  const t = (key: any) => user ? getTranslation(user.preferences.language, key) : getTranslation('en', key);

  // Auth Listener - FIXED VERSION
  useEffect(() => {
    console.log('🔐 Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser?.email, firebaseUser?.emailVerified);
      setAuthError('');

      // Check local storage for basic preferences even if not logged in fully yet
      const savedLang = localStorage.getItem('collab_lang') as Language || 'en';
      const savedTheme = localStorage.getItem('collab_theme') || 'light';

      // Apply theme
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const seenOnboarding = localStorage.getItem('collab_seenOnboarding');

      if (firebaseUser) {
        try {
          // IMPORTANT: Reload user to get latest email verification status
          await firebaseUser.reload();
          
          console.log('👤 User data after reload:', {
            email: firebaseUser.email,
            verified: firebaseUser.emailVerified,
            displayName: firebaseUser.displayName
          });
          
          // Construct User object
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            emailVerified: firebaseUser.emailVerified,
            avatar: firebaseUser.photoURL || undefined,
            preferences: { 
              theme: savedTheme as any, 
              language: savedLang, 
              notifications: true 
            }
          };
          
          setUser(userData);
          
          // Check email verification status
          if (!firebaseUser.emailVerified) {
            console.log('📧 User not verified, showing verification screen');
            setView('verification');
          } else {
            console.log('✅ User verified, showing dashboard');
            setView('dashboard');
          }
        } catch (error: any) {
          console.error('❌ Error processing user:', error);
          setAuthError('Error loading user data. Please try again.');
          setUser(null);
          setView('auth');
        }
      } else {
        console.log('👋 No user, checking onboarding');
        setUser(null);
        if (!seenOnboarding) {
          setView('onboarding');
        } else {
          setView('auth');
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error('❌ Auth state change error:', error);
      setAuthError('Authentication error. Please refresh the page.');
      setIsLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Real-time Database Listener
  useEffect(() => {
    let unsubscribe: () => void;

    if (user && user.emailVerified) {
      console.log('📋 Setting up task subscription for user:', user.id);
      unsubscribe = subscribeToTasks(user.id, (fetchedTasks) => {
        console.log('📥 Tasks received:', fetchedTasks.length);
        setTasks(fetchedTasks);
      });
    } else {
      console.log('⏸️ Skipping task subscription - user not verified or not logged in');
    }

    return () => {
      if (unsubscribe) {
        console.log('🧹 Cleaning up task subscription');
        unsubscribe();
      }
    };
  }, [user]); // Re-run when user changes

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setTasks([]);
      setView('auth');
    } catch (error: any) {
      console.error('Logout error:', error);
      alert('Error logging out: ' + error.message);
    }
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('collab_seenOnboarding', 'true');
    setView('auth');
  };

  // Profile Updates
  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates, preferences: { ...user.preferences, ...updates.preferences } };
    setUser(updatedUser);
    
    // Persist local preferences
    if (updates.preferences?.language) {
      localStorage.setItem('collab_lang', updates.preferences.language);
    }
    if (updates.preferences?.theme) {
      localStorage.setItem('collab_theme', updates.preferences.theme);
      if (updates.preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const addTask = async (newTask: Omit<Task, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) {
      alert('Please login to add tasks');
      return;
    }
    
    try {
      const taskData = {
        ...newTask,
        userId: user.id,
        createdAt: Date.now()
      };
      await addTaskToDb(taskData);
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error: any) {
      console.error('Error adding task:', error);
      alert('Failed to add task: ' + error.message);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await updateTaskInDb(id, updates);
    } catch (error: any) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + error.message);
    }
  };

  const deleteTask = async (id: string) => {
    if (confirm(t('confirmDelete'))) {
      try {
        await deleteTaskFromDb(id);
      } catch (error: any) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task: ' + error.message);
      }
    }
  };

  const handleAIGeneration = async () => {
    if (!aiPrompt.trim() || !user) return;
    setIsGenerating(true);
    try {
      const generatedTasks = await generateTasksFromAI(aiPrompt, user.preferences.language);
      
      // Add all generated tasks to Firestore
      const promises = generatedTasks.map(gt => {
        return addTaskToDb({
            userId: user.id,
            title: gt.title,
            description: gt.description,
            priority: gt.priority,
            category: gt.category,
            completed: false,
            createdAt: Date.now(),
            subTasks: gt.subTasks?.map(st => ({ id: crypto.randomUUID(), title: st, completed: false })) || []
        });
      });
      
      await Promise.all(promises);
      setShowAIModal(false);
      setAiPrompt('');
    } catch (e: any) {
      alert("Failed to generate tasks: " + (e.message || "Please try again."));
    } finally {
      setIsGenerating(false);
    }
  };

  const exportData = () => {
    const text = tasks.map(t => `[${t.completed ? 'x' : ' '}] ${t.title} (${t.priority}) - ${t.category}\n${t.description || ''}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.txt';
    a.click();
  };
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tasks, searchQuery, filterCategory]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, progress };
  }, [tasks]);

  // Show loading
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-deep-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pale-300 mb-4"></div>
        <p className="text-deep-300">Loading CollabTask...</p>
        <p className="text-xs text-deep-500 mt-2">Checking authentication status</p>
      </div>
    );
  }

  // Show auth error if any
  if (authError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-deep-950 text-white p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
        <p className="text-deep-300 text-center mb-6">{authError}</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Refresh Page
        </Button>
      </div>
    );
  }

  // Render appropriate screen
  if (view === 'onboarding') {
    return <Onboarding lang={'en'} onComplete={handleCompleteOnboarding} />;
  }
  
  if (view === 'auth') {
    return <AuthScreen 
      lang={'en'} 
      onAuthSuccess={(u) => { 
        console.log('Auth success callback, user:', u.email);
        // This is handled by the auth listener
      }} 
    />;
  }
  
  if (view === 'verification') {
    return <VerificationScreen 
      lang={user?.preferences.language || 'en'} 
      onVerified={() => {
        console.log('Email verified, switching to dashboard');
        setView('dashboard');
      }} 
    />;
  }

  return (
    <Layout user={user} currentView={view} onChangeView={setView} onLogout={handleLogout}>
      {/* Dashboard View - REMAINS THE SAME FROM YOUR ORIGINAL CODE */}
      {view === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header & Stats - Keep your original dashboard UI here */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-bold text-deep-900 dark:text-white tracking-tight leading-tight">
                {t('welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-deep-600 to-deep-400 dark:from-pale-200 dark:to-pale-400">{user?.username}</span>
              </h1>
              <p className="text-deep-500 dark:text-deep-400 mt-2 flex items-center gap-2 font-medium">
                 <Zap size={16} className="text-yellow-500 fill-yellow-500"/> {QUOTES[0]}
              </p>
            </div>
            
            <div className="hidden md:flex gap-3">
              <Button onClick={() => setShowAIModal(true)} variant="accent" className="shadow-lg hover:shadow-xl">
                <Sparkles size={18} /> {t('aiAssistant')}
              </Button>
            </div>
          </div>

          {/* Progress Card */}
          <div className="relative overflow-hidden rounded-[28px] p-8 text-white shadow-2xl transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] group border border-white/10">
             <div className="absolute inset-0 bg-gradient-to-br from-deep-800 to-deep-950 z-0"></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>
             <div className="absolute right-[-20%] top-[-50%] w-[500px] h-[500px] bg-pale-500/20 rounded-full blur-[100px] group-hover:bg-pale-400/30 transition-colors duration-500"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-deep-200 uppercase tracking-widest text-xs">Productivity Score</h3>
                    <div className="bg-white/10 px-3 py-1 rounded-full text-xs backdrop-blur-md border border-white/10">
                      {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="font-bold text-6xl text-white tracking-tighter drop-shadow-lg">{stats.progress}%</span>
                    <span className="text-deep-300 font-medium">completed</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-black/30 rounded-full h-3 backdrop-blur-sm p-0.5">
                    <div 
                      className="bg-gradient-to-r from-pale-400 to-pale-300 rounded-full h-full shadow-[0_0_15px_rgba(134,239,172,0.6)] relative overflow-hidden transition-all duration-1000 ease-out"
                      style={{ width: `${stats.progress}%` }}
                    >
                       <div className="absolute inset-0 bg-white/30 animate-[pulse_2s_infinite]"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 min-w-max">
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex flex-col items-center min-w-[100px]">
                    <span className="text-2xl font-bold text-pale-300">{stats.completed}</span>
                    <span className="text-xs text-deep-300 uppercase tracking-wider">{t('completed')}</span>
                  </div>
                   <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex flex-col items-center min-w-[100px]">
                    <span className="text-2xl font-bold text-white">{stats.total - stats.completed}</span>
                    <span className="text-xs text-deep-300 uppercase tracking-wider">{t('pending')}</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Controls & List */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-white/5 p-2 rounded-2xl backdrop-blur-sm border border-deep-100 dark:border-white/5">
              <div className="relative w-full sm:w-auto sm:flex-1 max-w-md group pl-2">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-deep-400 group-focus-within:text-pale-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent rounded-xl focus:outline-none dark:text-white placeholder-deep-400"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide pr-2">
                {['All', ...CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filterCategory === cat 
                      ? 'bg-deep-900 text-white dark:bg-pale-300 dark:text-deep-900 shadow-md' 
                      : 'text-deep-600 dark:text-deep-300 hover:bg-deep-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pb-24">
               {filteredTasks.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in opacity-50 hover:opacity-100 transition-opacity">
                   <div className="w-24 h-24 bg-deep-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                      <div className="w-12 h-12 border-4 border-deep-300 dark:border-deep-600 border-t-pale-300 rounded-full opacity-50"></div>
                   </div>
                   <p className="text-lg font-medium text-deep-600 dark:text-deep-300">No tasks found</p>
                   <p className="text-sm text-deep-400">Clear filters or create a new task to get started</p>
                 </div>
               ) : (
                 filteredTasks.map((task) => (
                   <div 
                    key={task.id} 
                    className={`group bg-white dark:bg-deep-850/50 rounded-2xl border transition-all duration-300 overflow-hidden
                      ${task.completed 
                        ? 'border-transparent opacity-60 bg-gray-50 dark:bg-deep-900/30' 
                        : 'border-deep-100 dark:border-white/5 hover:border-pale-300/50 dark:hover:border-pale-300/30 hover:shadow-lg dark:hover:bg-deep-800'
                      }`}
                   >
                      <div 
                        className="p-5 flex items-center gap-4 cursor-pointer"
                        onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateTask(task.id, { completed: !task.completed }); }}
                          className={`flex-shrink-0 transition-all duration-300 transform active:scale-90 ${task.completed ? 'text-pale-500' : 'text-deep-300 hover:text-pale-400'}`}
                        >
                          {task.completed ? <CheckCircle size={24} fill="currentColor" className="text-white dark:text-deep-900" /> : <Circle size={24} strokeWidth={2} />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                             <h3 className={`font-semibold text-base truncate ${task.completed ? 'line-through text-deep-400' : 'text-deep-900 dark:text-deep-50'}`}>
                              {task.title}
                            </h3>
                            {task.priority === 'high' && <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-deep-400">
                             <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(task.createdAt).toLocaleDateString()}</span>
                             <span className="w-1 h-1 rounded-full bg-deep-300"></span>
                             <span>{task.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                           <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border
                              ${task.priority === 'high' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                                task.priority === 'medium' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 
                                'bg-pale-500/10 text-pale-600 border-pale-500/20'}`}>
                              {t(task.priority)}
                            </div>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setEditingTask(task); setShowTaskModal(true); }}
                             className="p-2 text-deep-400 hover:text-deep-900 dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                           >
                              <Edit2 size={16}/>
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                             className="p-2 text-deep-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                           >
                              <Trash2 size={16}/>
                           </button>
                           <div className={`transition-transform duration-300 ${expandedTaskId === task.id ? 'rotate-180' : ''}`}>
                             <ChevronDown size={16} className="text-deep-400"/>
                           </div>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      <div className={`grid transition-all duration-300 ease-in-out ${expandedTaskId === task.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                           <div className="px-5 pb-5 pt-0 border-t border-deep-50 dark:border-white/5 mt-2">
                              {task.description && (
                                <p className="text-sm text-deep-600 dark:text-deep-300 mt-4 leading-relaxed">{task.description}</p>
                              )}
                              
                              {task.subTasks.length > 0 && (
                                <div className="mt-4 space-y-2 bg-deep-50/50 dark:bg-black/20 p-3 rounded-xl">
                                  {task.subTasks.map(st => (
                                    <div key={st.id} className="flex items-center gap-3 text-sm text-deep-600 dark:text-deep-300">
                                      <button onClick={() => {
                                        const newSub = task.subTasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s);
                                        updateTask(task.id, { subTasks: newSub });
                                      }} className="text-deep-300 hover:text-pale-400 transition-colors">
                                        {st.completed ? <CheckCircle size={14} className="text-pale-500"/> : <Circle size={14} />}
                                      </button>
                                      <span className={st.completed ? 'line-through opacity-60' : ''}>{st.title}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                           </div>
                        </div>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
          
          {/* Floating Action Buttons */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
             <Button 
              variant="floating" 
              onClick={() => setShowAIModal(true)}
              className="bg-white text-deep-900 dark:bg-deep-800 dark:text-pale-300 border border-deep-100 dark:border-white/10"
             >
               <Sparkles size={24} />
             </Button>
             <Button 
              variant="floating" 
              onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
             >
               <Plus size={28} />
             </Button>
          </div>
        </div>
      )}

      {/* Settings View - Keep your original settings UI here */}
      {view === 'settings' && user && (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-deep-900 dark:text-white mb-8">{t('settings')}</h1>

          <div className="glass-card dark:bg-deep-900/40 p-8 rounded-[32px] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-pale-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group mx-auto md:mx-0">
                  <div className="w-28 h-28 rounded-[24px] bg-gradient-to-br from-pale-200 to-pale-400 flex items-center justify-center text-4xl font-bold text-deep-900 shadow-xl overflow-hidden">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" /> : user.username[0].toUpperCase()}
                  </div>
                </div>
                
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-deep-400 mb-1 block">{t('username')}</label>
                    <div className="text-xl font-bold text-deep-900 dark:text-white py-2">{user.username}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-deep-400 mb-1 block">{t('email')}</label>
                    <div className="flex items-center gap-2 text-deep-700 dark:text-deep-200">
                      {user.email} 
                      {user.emailVerified && <ShieldCheck size={16} className="text-pale-500" />}
                    </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-card dark:bg-deep-900/40 p-6 rounded-[24px]">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white"><Moon size={20} className="text-pale-400"/> {t('appearance')}</h3>
               <div className="flex items-center justify-between p-4 bg-deep-50 dark:bg-black/20 rounded-xl border border-deep-100 dark:border-white/5">
                 <span className="text-deep-700 dark:text-deep-200 font-medium">{user.preferences.theme === 'dark' ? t('darkMode') : t('lightMode')}</span>
                 <button 
                  onClick={() => updateProfile({ preferences: { ...user.preferences, theme: user.preferences.theme === 'light' ? 'dark' : 'light' } })}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${user.preferences.theme === 'dark' ? 'bg-pale-500' : 'bg-deep-200'}`}
                 >
                   <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${user.preferences.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                 </button>
               </div>
             </div>

             <div className="glass-card dark:bg-deep-900/40 p-6 rounded-[24px]">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white"><MoreHorizontal size={20} className="text-pale-400"/> {t('language')}</h3>
               <div className="grid grid-cols-2 gap-2">
                 {['en', 'mm'].map((l) => (
                   <button
                    key={l}
                    onClick={() => updateProfile({ preferences: { ...user.preferences, language: l as Language } })}
                    className={`p-3 rounded-xl border font-medium text-sm transition-all ${
                      user.preferences.language === l 
                      ? 'bg-pale-500/10 border-pale-500/50 text-pale-600 dark:text-pale-300' 
                      : 'border-deep-100 dark:border-white/5 text-deep-500 hover:bg-deep-50 dark:hover:bg-white/5'
                    }`}
                   >
                     {l === 'en' ? 'English' : 'Myanmar'}
                   </button>
                 ))}
               </div>
             </div>
          </div>
          
          <div className="text-center pt-8 pb-4">
             <p className="text-xs text-deep-400 font-medium">Collab Task v1.0 • Powered by CodeCollab Technology</p>
          </div>
        </div>
      )}

      {/* --- MODALS (AI & TASK) --- */}
      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-deep-950/60 backdrop-blur-sm" onClick={() => setShowAIModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-deep-900 rounded-[32px] p-8 shadow-2xl border border-white/10 animate-scale-up overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pale-400/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-pale-100 dark:bg-pale-500/20 rounded-xl text-pale-600 dark:text-pale-300">
                     <Sparkles size={22} /> 
                   </div>
                   <h3 className="text-xl font-bold text-deep-900 dark:text-white">{t('aiAssistant')}</h3>
                 </div>
                 <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-deep-100 dark:hover:bg-white/10 rounded-full transition-colors text-deep-400"><X size={20} /></button>
              </div>
              
              <div className="bg-deep-50 dark:bg-black/20 p-1 rounded-2xl mb-6 border border-deep-100 dark:border-white/10 focus-within:ring-2 focus-within:ring-pale-300 transition-all">
                <textarea 
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder={t('aiPromptPlaceholder')}
                  className="w-full h-32 p-4 bg-transparent resize-none outline-none text-base text-deep-800 dark:text-deep-100 placeholder-deep-400"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowAIModal(false)}>{t('cancel')}</Button>
                <Button onClick={handleAIGeneration} isLoading={isGenerating} variant="accent" className="shadow-lg shadow-pale-300/20">
                  {t('generate')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-deep-950/60 backdrop-blur-sm" onClick={() => setShowTaskModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-deep-900 rounded-[32px] p-8 shadow-2xl border border-white/10 animate-scale-up">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-deep-900 dark:text-white">{editingTask ? t('editTask') : t('addTask')}</h3>
                <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-deep-100 dark:hover:bg-white/10 rounded-full transition-colors text-deep-400"><X size={20}/></button>
             </div>
             
             <form onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               const newTaskData = {
                 title: formData.get('title') as string,
                 description: formData.get('description') as string,
                 priority: formData.get('priority') as Priority,
                 category: formData.get('category') as Category,
                 completed: editingTask ? editingTask.completed : false,
                 subTasks: editingTask ? editingTask.subTasks : []
               };
               
               if (editingTask) {
                 updateTask(editingTask.id, newTaskData);
                 setShowTaskModal(false);
                 setEditingTask(null);
               } else {
                 addTask(newTaskData);
               }
             }} className="space-y-5">
                <div>
                   <label className="text-xs font-bold uppercase text-deep-400 mb-2 pl-1 block">{t('taskTitle')}</label>
                   <input 
                    name="title" 
                    defaultValue={editingTask?.title} 
                    required 
                    placeholder="E.g., Complete project report"
                    className="w-full p-4 rounded-2xl border border-deep-200 dark:border-white/10 bg-deep-50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-pale-300 dark:text-white transition-all placeholder-deep-400"
                  />
                </div>
                <div>
                   <label className="text-xs font-bold uppercase text-deep-400 mb-2 pl-1 block">{t('taskDesc')}</label>
                   <textarea 
                    name="description" 
                    defaultValue={editingTask?.description} 
                    placeholder="Add details..."
                    className="w-full p-4 rounded-2xl border border-deep-200 dark:border-white/10 bg-deep-50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-pale-300 dark:text-white h-24 resize-none transition-all placeholder-deep-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold uppercase text-deep-400 mb-2 pl-1 block">Priority</label>
                      <div className="relative">
                        <select name="priority" defaultValue={editingTask?.priority || 'medium'} className="w-full p-4 rounded-2xl border border-deep-200 dark:border-white/10 bg-deep-50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-pale-300 appearance-none dark:text-white cursor-pointer font-medium">
                            <option value="low">{t('low')}</option>
                            <option value="medium">{t('medium')}</option>
                            <option value="high">{t('high')}</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-deep-400 pointer-events-none" size={16}/>
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-bold uppercase text-deep-400 mb-2 pl-1 block">Category</label>
                      <div className="relative">
                        <select name="category" defaultValue={editingTask?.category || 'Personal'} className="w-full p-4 rounded-2xl border border-deep-200 dark:border-white/10 bg-deep-50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-pale-300 appearance-none dark:text-white cursor-pointer font-medium">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-deep-400 pointer-events-none" size={16}/>
                      </div>
                   </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                   <Button type="button" variant="ghost" onClick={() => { setShowTaskModal(false); setEditingTask(null); }}>{t('cancel')}</Button>
                   <Button type="submit" variant="primary" className="px-8">{t('save')}</Button>
                </div>
             </form>
          </div>
        </div>
      )}
    </Layout>
  );
}