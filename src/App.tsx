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

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  principal: 'Principal',
  scanner: 'Scan Operator',
};

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'app'>('landing');
  const [role, setRole] = useState<Role>('admin');
  const [fullName, setFullName] = useState('');
  const [page, setPage] = useState<Page>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) setView('app');
    setIsLoading(false);
  }, []);

  const handleLogin = (incomingRole: string, name: string) => {
    const cleanRole = incomingRole.toLowerCase() as Role;
    setRole(cleanRole);
    setFullName(name);
    setPage(cleanRole === 'scanner' ? 'scanner' : 'dashboard');
    setView('app');
  };

  const handleLogout = () => {
    clearToken();
    setView('landing');
    setFullName('');
  };

  if (isLoading) return <div>Loading EduTrack...</div>;
  if (view === 'landing') return <LandingPage onEnterApp={() => setView('login')} />;
  if (view === 'login') return <LoginPage onLogin={handleLogin} onBack={() => setView('landing')} />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'analytics': return <Analytics />;
      case 'scanner': return <QRScanner />;
      case 'notifications': return <Notifications />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-user">
          <div>{fullName ? fullName.substring(0,2).toUpperCase() : role[0].toUpperCase()}</div>
          <div>
            <h4>{fullName || ROLE_LABELS[role]}</h4>
            <span>{ROLE_LABELS[role]}</span>
          </div>
        </div>

        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('students')}>Students</button>
        <button onClick={() => setPage('analytics')}>Analytics</button>
        <button onClick={() => setPage('scanner')}>Scanner</button>
        <button onClick={() => setPage('notifications')}>Notifications</button>

        <button onClick={handleLogout}>Logout</button>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
