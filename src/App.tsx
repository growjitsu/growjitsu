import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from './services/supabase';
import { ArenaNavbar } from './components/ArenaNavbar';
import { ArenaFeed } from './components/ArenaFeed';
import { ArenaRankings } from './components/ArenaRankings';
import { ArenaSearch } from './components/ArenaSearch';
import { ArenaProfileView } from './components/ArenaProfile';
import { ArenaSettings } from './components/ArenaSettings';
import { ArenaAuth } from './components/ArenaAuth';
import { ArenaNotifications } from './components/ArenaNotifications';
import { ArenaProfile } from './types';
import { Bell } from 'lucide-react';

const ProfileWrapper = ({ forceEdit }: { forceEdit?: boolean }) => {
  const { userId, username } = useParams();
  return <ArenaProfileView userId={userId} username={username} forceEdit={forceEdit} />;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [profile, setProfile] = useState<ArenaProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Close profile menu on navigation
    setShowProfileMenu(false);
    
    // Update active tab based on pathname
    const pathParts = location.pathname.split('/').filter(Boolean);
    const path = pathParts[0] || 'feed';
    const subPath = pathParts[1];
    
    if (path === 'feed') setActiveTab('feed');
    else if (path === 'profile' && subPath === 'edit') setActiveTab('profile/edit');
    else if (['rankings', 'search', 'profile', 'settings', 'gyms', 'notifications'].includes(path)) setActiveTab(path);
  }, [location.pathname]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsInitializing(false);
      return;
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        fetchProfile(session.user.id);
      }
      setIsInitializing(false);
    }).catch(err => {
      console.error('Supabase session error:', err);
      setIsInitializing(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoggedIn(true);
        fetchProfile(session.user.id);
      } else {
        setIsLoggedIn(false);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
      fetchUnreadNotifications(userId);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    }
  };

  const fetchUnreadNotifications = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      if (error) throw error;
      setUnreadNotifications(count || 0);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--bg)]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderLayout = (content: React.ReactNode, tabId: string) => {
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] pb-20 md:pb-0 md:pl-20 transition-colors duration-300">
        <ArenaNavbar 
          activeTab={tabId} 
          setActiveTab={(tab) => navigate(`/${tab === 'feed' ? '' : tab}`)} 
          userProfile={profile}
          unreadNotifications={unreadNotifications}
        />
        
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border-ui)] flex items-center justify-between px-4 z-40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-blue-700 rounded-lg flex items-center justify-center font-black text-white italic overflow-hidden">
              {profile?.profile_photo || profile?.avatar_url ? (
                <img src={profile.profile_photo || profile.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                'A'
              )}
            </div>
            <span className="text-xs font-black uppercase tracking-tighter italic">ArenaComp</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-[var(--text-muted)]"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[var(--bg)]">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border-ui)] overflow-hidden"
            >
              {profile?.profile_photo || profile?.avatar_url ? (
                <img src={profile.profile_photo || profile.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)]">
                  <span className="text-[10px] font-bold">{profile?.full_name?.charAt(0)}</span>
                </div>
              )}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto pt-14 md:pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={tabId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Header (Desktop Only) */}
        <header className="hidden md:flex fixed top-0 right-0 left-20 h-16 bg-[var(--bg)]/50 backdrop-blur-xl border-b border-[var(--border-ui)] items-center justify-between px-8 z-40 transition-colors duration-300">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Arena</span>
            <span className="text-xs font-black uppercase tracking-widest text-[var(--primary)]">{tabId}</span>
          </div>
          
          <div className="flex items-center space-x-4 relative">
            {/* Notification Bell */}
            <button 
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[var(--bg)]">
                  {unreadNotifications}
                </span>
              )}
            </button>

            <div className="text-right">
              <p className="text-xs font-bold text-[var(--text-main)]">{profile?.full_name}</p>
              <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">Score: {Math.round(profile?.arena_score || 0)}</p>
            </div>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border-ui)] overflow-hidden hover:border-[var(--primary)] transition-all"
            >
              {profile?.profile_photo || profile?.avatar_url ? (
                <img src={profile.profile_photo || profile.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)]">
                  <span className="text-xs font-bold">{profile?.full_name?.charAt(0)}</span>
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border-ui)] rounded-2xl shadow-2xl overflow-hidden z-50 py-2"
                >
                  <button 
                    onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors flex items-center space-x-2"
                  >
                    <span>Meu Perfil</span>
                  </button>
                  <button 
                    onClick={() => { navigate('/profile/edit'); setShowProfileMenu(false); }}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors flex items-center space-x-2"
                  >
                    <span>Editar Perfil</span>
                  </button>
                  <button 
                    onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors flex items-center space-x-2"
                  >
                    <span>Configurações</span>
                  </button>
                  <div className="h-px bg-[var(--border-ui)] my-1" />
                  <button 
                    onClick={() => { supabase.auth.signOut(); navigate('/login'); }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center space-x-2"
                  >
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <ArenaAuth />} />
      <Route path="/" element={renderLayout(<ArenaFeed userProfile={profile} />, 'feed')} />
      <Route path="/rankings" element={renderLayout(<ArenaRankings />, 'rankings')} />
      <Route path="/search" element={renderLayout(<ArenaSearch />, 'search')} />
      <Route path="/profile" element={renderLayout(<ProfileWrapper />, 'profile')} />
      <Route path="/profile/edit" element={renderLayout(<ProfileWrapper forceEdit />, 'profile/edit')} />
      <Route path="/profile/:userId" element={renderLayout(<ProfileWrapper />, 'profile')} />
      <Route path="/user/:username" element={renderLayout(<ProfileWrapper />, 'profile')} />
      <Route path="/notifications" element={renderLayout(<ArenaNotifications />, 'notifications')} />
      <Route path="/settings" element={renderLayout(<ArenaSettings />, 'settings')} />
      <Route path="/gyms" element={renderLayout(<div className="flex items-center justify-center h-screen text-[var(--text-muted)] uppercase font-black tracking-widest">Módulo de Academias em Breve</div>, 'gyms')} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
