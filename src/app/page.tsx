'use client';

import { useState, useEffect } from 'react';
import { Loader } from '@/components/loader';
import { LoginForm } from '@/components/auth/login-form';
import { Dashboard } from '@/components/dashboard';
import { AppHeader } from '@/components/app-header';
import { useAuth, type User } from '@/hooks/use-auth';

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);
  const { user, login, logout, isLoading } = useAuth();

  useEffect(() => {
    const loaderShown = sessionStorage.getItem('loaderShown');
    if (loaderShown) {
      setShowLoader(false);
    } else {
      const timer = setTimeout(() => {
        setShowLoader(false);
        sessionStorage.setItem('loaderShown', 'true');
      }, 5000); // As requested, 5-second loader
      return () => clearTimeout(timer);
    }
  }, []);

  if (isLoading || showLoader) {
    return <Loader />;
  }

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader user={user} onLogout={logout} />
      <main className="flex-1">
        <Dashboard />
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ICSEasy. All rights reserved.</p>
      </footer>
    </div>
  );
}
