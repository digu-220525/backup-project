import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Briefcase, Menu, X, Bell, ChevronDown, 
  LayoutDashboard, LogOut, User, Plus, Zap
} from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllRead } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Don't render navbar on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-slate-950/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all duration-300 group-hover:shadow-blue-500/40 group-hover:scale-105">
              <Briefcase className="w-4.5 h-4.5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="hidden sm:block text-white font-black text-lg tracking-[-0.04em] transition-all duration-300 group-hover:text-blue-300"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              VantagePoint
            </span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1">
            {user?.role === 'freelancer' && (
              <Link
                to="/jobs"
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-300 ${
                  isActive('/jobs')
                    ? 'text-blue-400 bg-blue-500/[0.1] border border-blue-500/[0.18]'
                    : 'text-white/35 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Browse Jobs
              </Link>
            )}
            {user?.role === 'client' && (
              <Link
                to="/freelancers"
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-300 ${
                  isActive('/freelancers')
                    ? 'text-blue-400 bg-blue-500/[0.1] border border-blue-500/[0.18]'
                    : 'text-white/35 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Freelancers
              </Link>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Post Job */}
                {user.role === 'client' && (
                  <Link
                    to="/jobs/new"
                    className="hidden md:flex items-center gap-2 bg-white text-slate-950 text-[10px] font-black px-5 py-2.5 rounded-full hover:bg-blue-50 transition-all duration-300 active:scale-[0.97] uppercase tracking-[0.2em] shadow-lg shadow-black/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Post Job
                  </Link>
                )}

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                      notifOpen ? 'bg-blue-500/[0.12] text-blue-400' : 'text-white/35 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Bell className="w-[18px] h-[18px]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-3 w-[340px] bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] border border-white/[0.08] overflow-hidden animate-slide-up z-50"
                      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 24px 64px rgba(0,0,0,0.6)' }}>
                      <div className="px-6 py-4 border-b border-white/[0.05] bg-white/[0.03] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="w-3.5 h-3.5 text-blue-400/60" />
                          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[8px] font-black text-blue-400/60 uppercase tracking-widest hover:text-blue-300 transition-colors"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      <div className="divide-y divide-white/[0.04] max-h-[360px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? notifications.map((n) => (
                          <div
                            key={n.notification_id}
                            onClick={() => {
                              markAsRead(n.notification_id);
                              setNotifOpen(false);
                              if (n.link) navigate(n.link);
                            }}
                            className={`px-6 py-4 hover:bg-white/[0.04] transition-colors cursor-pointer group relative ${!n.is_read ? 'bg-blue-500/[0.03]' : ''}`}
                          >
                            {!n.is_read && (
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                            )}
                            <p className="text-[11px] text-white/75 font-bold mb-1 group-hover:text-white transition-colors uppercase tracking-tight leading-snug">{n.title}</p>
                            <p className="text-[10px] text-white/35 font-medium truncate leading-relaxed">{n.message}</p>
                            <p className="text-[8px] text-blue-400/30 font-black uppercase tracking-[0.18em] mt-1.5">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true }).toUpperCase()}
                            </p>
                          </div>
                        )) : (
                          <div className="px-6 py-12 text-center">
                            <Bell className="w-7 h-7 text-white/[0.05] mx-auto mb-3" />
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No notifications</p>
                          </div>
                        )}
                      </div>

                      <div className="px-6 py-3 border-t border-white/[0.05] bg-slate-950/50">
                        <Link to="/dashboard" className="text-[9px] text-blue-400/60 font-black uppercase tracking-[0.18em] hover:text-blue-300 transition-colors" onClick={() => setNotifOpen(false)}>
                          View all in dashboard →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-2xl transition-all duration-300 ${
                      profileOpen ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-[11px] shadow-lg shadow-blue-500/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/20 transition-transform duration-300 ${profileOpen ? 'rotate-180 text-white/40' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] border border-white/[0.08] py-2 animate-slide-up z-50 overflow-hidden"
                      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 24px 64px rgba(0,0,0,0.6)' }}>
                      <div className="px-5 py-4 border-b border-white/[0.05] bg-white/[0.03]">
                        <p className="text-xs font-black text-white uppercase tracking-[0.15em] truncate"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{user.name}</p>
                        <p className="text-[9px] text-blue-400/40 font-bold uppercase tracking-[0.18em] mt-1">{user.role}</p>
                      </div>
                      <div className="py-1.5">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3.5 px-5 py-3 text-[10px] font-black text-white/35 uppercase tracking-[0.18em] hover:text-white hover:bg-white/[0.04] transition-all"
                          onClick={() => setProfileOpen(false)}
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-blue-500/40" />
                          Dashboard
                        </Link>
                        <Link
                          to={`/profile/${user.user_id}`}
                          className="flex items-center gap-3.5 px-5 py-3 text-[10px] font-black text-white/35 uppercase tracking-[0.18em] hover:text-white hover:bg-white/[0.04] transition-all"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="w-3.5 h-3.5 text-blue-500/40" />
                          Profile
                        </Link>
                      </div>
                      <div className="border-t border-white/[0.05] py-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3.5 w-full px-5 py-3 text-[10px] font-black text-red-400/50 uppercase tracking-[0.18em] hover:text-red-400 hover:bg-red-500/[0.05] transition-all"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    className="hidden sm:block px-6 py-2.5 text-[10px] font-black text-white/40 uppercase tracking-[0.25em] transition-all rounded-full border border-white/[0.1] hover:bg-white/[0.04] hover:border-white/20 hover:text-white mr-1"
                  >
                    Log In
                  </Link>
                )}
                {location.pathname !== '/signup' && (
                  <Link
                    to="/signup"
                    className="bg-white text-slate-950 text-[10px] font-black px-6 py-2.5 rounded-full hover:bg-blue-50 transition-all duration-300 active:scale-[0.97] uppercase tracking-[0.2em] shadow-lg shadow-black/20"
                  >
                    Sign Up
                  </Link>
                )}
              </>
            )}

            {/* Mobile Toggle */}
            <button
              className={`md:hidden p-2.5 rounded-xl transition-all ${
                menuOpen ? 'bg-white/[0.08] text-white' : 'text-white/35 hover:text-white hover:bg-white/[0.04]'
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-6 animate-slide-up">
            <div className="flex flex-col gap-1 pt-3 border-t border-white/[0.05]">
              {user ? (
                <>
                  {user.role === 'freelancer' && (
                    <Link to="/jobs" className="px-5 py-3.5 text-[10px] font-black text-white/35 uppercase tracking-[0.25em] hover:bg-white/[0.04] hover:text-white rounded-2xl transition-all" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
                  )}
                  {user.role === 'client' && (
                    <Link to="/freelancers" className="px-5 py-3.5 text-[10px] font-black text-white/35 uppercase tracking-[0.25em] hover:bg-white/[0.04] hover:text-white rounded-2xl transition-all" onClick={() => setMenuOpen(false)}>Freelancers</Link>
                  )}
                  <Link to="/dashboard" className="px-5 py-3.5 text-[10px] font-black text-white/35 uppercase tracking-[0.25em] hover:bg-white/[0.04] hover:text-white rounded-2xl transition-all" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  {user.role === 'client' && (
                    <Link to="/jobs/new" className="mx-3 my-1.5 px-5 py-3.5 text-[10px] font-black bg-white text-slate-950 rounded-2xl uppercase tracking-[0.25em] text-center" onClick={() => setMenuOpen(false)}>Post a Job</Link>
                  )}
                  <button onClick={handleLogout} className="px-5 py-3.5 text-[10px] font-black text-red-400/50 uppercase tracking-[0.18em] hover:text-red-400 rounded-2xl text-left transition-all">Sign Out</button>
                </>
              ) : (
                <>
                  {location.pathname !== '/login' && (
                    <Link to="/login" className="mx-3 my-1 px-5 py-3.5 text-[10px] font-black text-white border border-white/[0.1] rounded-2xl uppercase tracking-[0.25em] text-center hover:bg-white/[0.04] transition-all" onClick={() => setMenuOpen(false)}>Log In</Link>
                  )}
                  {location.pathname !== '/signup' && (
                    <Link to="/signup" className="mx-3 my-1 px-5 py-3.5 text-[10px] font-black bg-white text-slate-950 rounded-2xl uppercase tracking-[0.25em] text-center" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;