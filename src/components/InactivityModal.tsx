/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Clock, ShieldAlert, LogOut } from 'lucide-react';

export const InactivityModal: React.FC = () => {
  const { inactivityWarning, resetInactivityTimer, logout } = useAuth();

  if (!inactivityWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full text-center">
        
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 animate-pulse" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Session Inactivity Warning
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          Due to security policies at ABC International University, sessions automatically expire after 15 minutes of inactivity.
        </p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={() => logout()}
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Logout
          </button>
          
          <button
            onClick={resetInactivityTimer}
            className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Stay Signed In
          </button>
        </div>

      </div>
    </div>
  );
};
