/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { GraduationCap, LogOut, Moon, Sun, ShieldCheck, UserCheck } from 'lucide-react';
import universityCrest from '../assets/images/university_crest_logo_1790695986828.jpg';

interface NavbarProps {
  onOpenBatchGazette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBatchGazette }) => {
  const { session, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Zone 1: University Brand Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-blue-900/20 dark:border-blue-400/30 bg-white flex items-center justify-center shadow-xs shrink-0">
              <img
                src={universityCrest}
                alt="ABC International University Emblem"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-crest text-base sm:text-lg font-bold tracking-tight text-blue-950 dark:text-blue-100 block leading-tight">
                ABC INTERNATIONAL UNIVERSITY
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase block">
                Delhi · Student Result Management System
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links / Session Context */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            {role === 'examiner' && onOpenBatchGazette && (
              <button
                onClick={onOpenBatchGazette}
                className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 transition-colors cursor-pointer"
              >
                Annual Gazette Report
              </button>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Academic Session 2025–2026
            </span>
          </div>

          {/* Zone 3: Primary Actions (Theme Toggle & User Session) */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* User Session Info & Logout */}
            {session ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:flex flex-col text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    {role === 'examiner' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                      {session.user.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {role === 'examiner' ? 'Authorized Examiner' : `Reg: ${session.user.registerNumber}`}
                  </span>
                </div>

                <button
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                  title="Sign out of system"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </header>
  );
};
