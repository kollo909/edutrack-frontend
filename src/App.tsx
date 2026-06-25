import React, { useState, useEffect } from 'react';
import './index.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Analytics from './pages/Analytics';
import QRScanner from './pages/QRScanner';
import Notifications from './pages/Notifications';
import { clearToken, getToken } from './api';

type Role = 'admin' | 'principal' | 'scanner';
type Page = 'dashboard' | 'students' | 'analytics' | 'scanner' | 'notifications';

const NAV_ITEMS: {
  page: Page;
  icon: string;
  label: string;
  roles: Role[];
  badge?: number;
}[] = [
  { page: 'dashboard',     icon: '📊', label: 'Dashboard',     roles: ['admin', 'principal'] },
  { page: 'scanner',       icon: '📱', label: 'QR Scanner',    roles: ['admin', 'scanner'] },
  { page: 'students',      icon: '🎒', label: 'Students',      roles: ['admin'] },
  { page: 'analytics',     icon: '📈', label: 'Analytics',     roles: ['admin', 'principal'] },
  { page: 'notifications', icon: '🔔', label: 'Notifications', roles: ['admin', 'principal'] },
];

const PAGE_TITLES: Record<Page, { title: string; subtitle: string }> = {
  dashboard:     { title: 'Dashboard',          subtitle: 'Live school attendance overview' },
  scanner:       { title: 'QR Scanner',         subtitle: 'Scan student arrival & departure' },
  students:      { title: 'Student Directory',  subtitle: 'Manage students and QR codes' },
  analytics:     { title: 'Analytics',          subtitle: 'Trends, reports and insights' },
  notifications: { title: 'Notifications',      subtitle: 'Parent alerts and system logs' },
};

const ROLE_LABELS: Record<Role, string> = {
  admin:     'Administrator',
  principal: 'Principal',
  scanner:   'Scan Operator',
};

export default function App() {
  const [view, setView]         = useState<'landing' | 'login' | 'app'>('landing');
  const [role, setRole]         = useState<Role>('admin');
  const [fullName, setFullName] = useState('');
  const [page, setPage]         = useState<Page>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Session Persistence: Check for an existing token on app startup
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        // If your token stores user details (JWT payload), you can decode it here using 'jwt-decode'
        // For now, we will restore the session. (If you have a /api/me endpoint, call it here)
        setView('app');
      } catch (error) {
        console.error("Invalid token session:", error);
        clearToken();
      }
    }
    setIsLoading(false);
  }, []);

  // 2. Safe Login Handler with Backend Role Normalization
  const handleLogin = (incomingRole: string, name: string) => {
    // Normalizes backend uppercase roles (e.g., 'ADMIN') to frontend lowercase roles ('admin')
    const cleanRole = incomingRole.toLowerCase() as Role;
    
    setRole(cleanRole);
    setFullName(name);
    
    // Scanner role lands directly on the scanner view, others land on dashboard
    setPage(cleanRole === 'scanner' ? 'scanner' : 'dashboard');
    setView('app');
  };

  const handleLogout = () => {
    clearToken();
    setView('landing');
    setFullName('');
  };

  // Prevent flash of landing page while checking token status
  if (isLoading) {
    return <div className="loading-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Nunito' }}>Loading EduTrack...</div>;
  }

  if (view === 'landing') {
    return <LandingPage onEnterApp={() => setView('login')} />;
  }

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={() => setView('landing')} />;
  }

  const visibleNav = NAV_ITEMS.filter(n => n.roles.includes(role));
  const { title, subtitle } = PAGE_TITLES[page];

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏫</div>
          <div className="sidebar-logo-text">
            <h2>EduTrack</h2>
            <span>Smart Attendance</span>
          </div>
        </div>

        <div className="sidebar-section-label">Navigation</div>

        <nav className="sidebar-nav">
          {visibleNav.map(item => (
            <button
              key={item.page}
              className={`nav-btn ${page === item.page ? 'active' : ''}`}
              onClick={() => setPage(item.page)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                color: 'inherit',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '4px',
                textDecoration: 'none'
              }}
            >
              <div className="nav-icon" style={{ marginRight: '12px' }}>{item.icon}</div>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {fullName ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2) : role[0]?.toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <h4>{fullName || ROLE_LABELS[role]}</h4>
              <span>{ROLE_LABELS[role]}</span>
            </div>
