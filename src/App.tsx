/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { ExaminerDashboard } from './components/ExaminerDashboard.tsx';
import { StudentPortal } from './components/StudentPortal.tsx';
import { InactivityModal } from './components/InactivityModal.tsx';

const AppContent: React.FC = () => {
  const { session, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="w-10 h-10 border-3 border-blue-800 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ABC International University Delhi
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <Navbar />

      <main className="flex-1">
        {!session ? (
          <LoginPage />
        ) : role === 'examiner' ? (
          <ExaminerDashboard />
        ) : (
          <StudentPortal />
        )}
      </main>

      <Footer />
      <InactivityModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
