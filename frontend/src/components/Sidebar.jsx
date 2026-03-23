import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, Plus, Briefcase, Users,
  CreditCard, LogOut, ChevronLeft, ChevronRight,
  Search, ClipboardList, Star, MessageSquare, CheckCircle, Activity, Bookmark, User
} from 'lucide-react';

const SIDEBAR_STYLES = `
  .sidebar-nav::-webkit-scrollbar { width: 4px; }
  .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
  .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  .sidebar-nav::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
  .sidebar-nav { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
`;

const ICON = 20; // unified icon size

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const hiddenPaths = ['/', '/login', '/signup'];
  if (!user || hiddenPaths.includes(location.pathname)) return null;

  const isActive = (to) => {
    if (to.includes('?')) return location.pathname + location.search === to;
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const clientItems = [
    { section: 'Main' },
    { icon: <LayoutDashboard size={ICON} />, label: 'Dashboard',   to: '/dashboard' },
    { icon: <MessageSquare size={ICON} />,   label: 'Messages',     to: '/messages' },
    { section: 'Work' },
    { icon: <Plus size={ICON} />,            label: 'Post Job',     to: '/jobs/new' },
    { icon: <Briefcase size={ICON} />,       label: 'Posted Jobs',  to: '/dashboard?tab=jobs' },
    { icon: <ClipboardList size={ICON} />,   label: 'Proposals',    to: '/dashboard?tab=proposals' },
    { icon: <Activity size={ICON} />,        label: 'Projects',     to: '/dashboard?tab=projects' },
    { icon: <CheckCircle size={ICON} />,     label: 'Completed',    to: '/dashboard?tab=completed' },
    { section: 'Network' },
    { icon: <Users size={ICON} />,           label: 'Freelancers',  to: '/freelancers' },
    { section: 'Account' },
    { icon: <CreditCard size={ICON} />,      label: 'Payments',     to: '/dashboard?tab=payments' },
    { icon: <User size={ICON} />,            label: 'Profile',      to: `/profile/${user?.user_id}` },
  ];

  const freelancerItems = [
    { section: 'Main' },
    { icon: <LayoutDashboard size={ICON} />, label: 'Dashboard',  to: '/dashboard' },
    { icon: <MessageSquare size={ICON} />,   label: 'Messages',    to: '/messages' },
    { section: 'Work' },
    { icon: <Search size={ICON} />,          label: 'Browse Jobs', to: '/jobs' },
    { icon: <Bookmark size={ICON} />,        label: 'Saved Jobs',  to: '/saved-jobs' },
    { icon: <ClipboardList size={ICON} />,   label: 'My Bids',     to: '/dashboard?tab=bids' },
    { icon: <Briefcase size={ICON} />,       label: 'Projects',    to: '/dashboard?tab=projects' },
    { icon: <Star size={ICON} />,            label: 'Completed',   to: '/dashboard?tab=completed' },
    { section: 'Account' },
    { icon: <CreditCard size={ICON} />,      label: 'Earnings',    to: '/dashboard?tab=payments' },
    { icon: <User size={ICON} />,            label: 'Profile',     to: `/profile/${user?.user_id}` },
  ];

  const navItems = user?.role === 'client' ? clientItems : freelancerItems;

  const W_OPEN   = 272;
  const W_CLOSED = 76;
  const w = open ? W_OPEN : W_CLOSED;

  return (
    <>
      <aside style={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh', width: w, zIndex: 40,
        background: '#0a1122',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
      }}>
        <style>{SIDEBAR_STYLES}</style>

        {/* ── Navbar spacer ── */}
        <div style={{ minHeight: '4.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }} />

        {/* ── Nav links ── */}
        <nav className="sidebar-nav" style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item, idx) => {
            if (item.section) {
              return open ? (
                <div key={`section-${idx}`} style={{
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)',
                  padding: idx === 0 ? '8px 14px 8px' : '24px 14px 8px',
                }}>
                  {item.section}
                </div>
              ) : (
                <div key={`section-${idx}`} style={{ height: idx === 0 ? 8 : 20 }} />
              );
            }
            return <NavItem key={item.label} item={item} active={isActive(item.to)} open={open} />;
          })}
        </nav>

        {/* ── Bottom Controls ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '10px' }}>
          <button
            onClick={() => setOpen(!open)}
            title={open ? 'Collapse sidebar' : 'Expand sidebar'}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', padding: open ? '12px 14px' : '12px',
              borderRadius: 10, border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap',
              justifyContent: open ? 'space-between' : 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            {open && <span>Collapse Menu</span>}
            {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>

          <button
            onClick={handleLogout}
            title={!open ? 'Logout' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', padding: open ? '12px 14px' : '12px',
              borderRadius: 10, border: 'none',
              background: 'transparent',
              color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap',
              justifyContent: open ? 'flex-start' : 'center',
              transition: 'all 0.15s ease',
              marginTop: 2,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {open && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Push page content right */}
      <div style={{ width: w, flexShrink: 0, transition: 'width 0.22s cubic-bezier(0.16,1,0.3,1)' }} />
    </>
  );
};

/* ── Individual nav item ── */
const NavItem = ({ item, active, open }) => {
  const [hovered, setHovered] = useState(false);

  const bg    = active
    ? 'rgba(79,70,229,0.12)'
    : hovered
    ? 'rgba(255,255,255,0.04)'
    : 'transparent';
  const color = active ? '#a5b4fc' : hovered ? '#fff' : 'rgba(255,255,255,0.55)';

  return (
    <Link
      to={item.to}
      title={!open ? item.label : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: open ? '11px 14px' : '11px',
        borderRadius: 10, textDecoration: 'none',
        color, background: bg,
        fontWeight: active ? 700 : 500,
        fontSize: 14.5,
        whiteSpace: 'nowrap',
        justifyContent: open ? 'flex-start' : 'center',
        transition: 'background 0.18s ease, color 0.18s ease, transform 0.18s ease',
        transform: hovered && !active ? 'translateX(3px)' : 'translateX(0)',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {active && open && (
        <span style={{
          position: 'absolute', left: 0, top: '18%', bottom: '18%',
          width: 3, borderRadius: '0 4px 4px 0',
          background: '#6366f1',
        }} />
      )}
      <span style={{
        flexShrink: 0, display: 'flex',
        opacity: active ? 1 : hovered ? 0.9 : 0.55,
        color: active ? '#a5b4fc' : hovered ? '#fff' : 'inherit',
        transition: 'color 0.18s ease, opacity 0.18s ease',
      }}>
        {item.icon}
      </span>
      {open && <span style={{ letterSpacing: '0.005em' }}>{item.label}</span>}
    </Link>
  );
};

export default Sidebar;
