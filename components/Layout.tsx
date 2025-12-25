import React, { useState } from 'react';
import { User } from '../types';
import { getTranslation } from '../constants';
import { 
  LogOut, 
  Settings as SettingsIcon, 
  CheckSquare, 
  Menu, 
  X,
  LayoutDashboard
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  currentView: string;
  onChangeView: (view: any) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  currentView, 
  onChangeView, 
  onLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If no user (Auth/Onboarding), just render children with a simple background
  if (!user) return <div className="min-h-screen bg-deep-950">{children}</div>;

  const t = (key: any) => getTranslation(user.preferences.language, key);

  const NavItem = ({ view, icon: Icon, label }: any) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          onChangeView(view);
          setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative ${
          isActive 
            ? 'bg-pale-300/10 text-pale-300 shadow-[0_0_20px_rgba(134,239,172,0.1)] font-semibold' 
            : 'text-deep-300 hover:bg-white/5 hover:text-white'
        }`}>
        <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="tracking-wide text-sm">{label}</span>
        
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-pale-300 rounded-r-full shadow-glow"></div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-deep-50 dark:bg-deep-950 flex font-sans transition-colors duration-500 overflow-hidden relative selection:bg-pale-300 selection:text-deep-900">
      
      {/* Animated Background Blobs (Visible globally in app) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pale-400/20 dark:bg-pale-500/10 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-deep-500/20 dark:bg-deep-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white/80 dark:bg-deep-950/80 backdrop-blur-xl z-50 px-6 py-4 flex items-center justify-between border-b border-deep-100 dark:border-white/5">
        <div className="font-bold text-xl text-deep-900 dark:text-white flex items-center gap-2">
          <div className="bg-pale-300 p-1.5 rounded-lg text-deep-900 shadow-glow">
            <CheckSquare size={18} strokeWidth={3} />
          </div>
          CollabTask
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-xl text-deep-600 dark:text-white hover:bg-deep-100 dark:hover:bg-white/10 transition-colors">
          {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* Sidebar Navigation - Glassy Dark Theme */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 
        bg-deep-900/95 dark:bg-black/40 backdrop-blur-2xl border-r border-white/5
        transform transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6 relative z-10">
          <div className="hidden lg:flex items-center gap-3 px-2 py-2 mb-10 font-bold text-2xl tracking-tight text-white">
            <div className="bg-gradient-to-br from-pale-300 to-pale-500 p-2 rounded-xl text-deep-900 shadow-glow">
              <CheckSquare className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span>CollabTask</span>
          </div>

          {/* User Profile Snippet */}
          <div className="mb-8 p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-3 backdrop-blur-md">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pale-300 to-pale-500 flex items-center justify-center text-deep-900 font-bold text-lg shadow-lg shrink-0">
               {user.avatar ? (
                 <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
               ) : (
                  user.username.charAt(0).toUpperCase()
               )}
             </div>
             <div className="min-w-0 overflow-hidden">
               <p className="font-semibold text-white text-sm truncate">{user.username}</p>
               <p className="text-[10px] text-deep-300 truncate uppercase tracking-wider">{user.preferences.language === 'en' ? 'English' : 'Myanmar'}</p>
             </div>
          </div>

          <div className="flex-1 space-y-2">
            <p className="px-4 text-[10px] font-bold text-deep-500 uppercase tracking-widest mb-2">Menu</p>
            <NavItem view="dashboard" icon={LayoutDashboard} label={t('tasks')} />
            <NavItem view="settings" icon={SettingsIcon} label={t('settings')} />
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
             <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-5 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-2xl transition-all duration-200 font-medium text-sm group">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-24 lg:pt-0 min-h-screen overflow-y-auto relative z-10 scrollbar-hide">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto pb-28 lg:pb-10">
          {children}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}/>
      )}
    </div>
  );
};