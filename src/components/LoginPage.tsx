/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/index.ts';
import { ShieldCheck, UserCheck, Eye, EyeOff, Lock, User, ArrowRight, AlertCircle, Info, Sparkles } from 'lucide-react';
import universityCrest from '../assets/images/university_crest_logo_1790695986828.jpg';
import campusBanner from '../assets/images/university_campus_banner_1790696008210.jpg';

const DEMO_STUDENTS = [
  { name: 'Anu', regNo: 'PQASAEGR01' },
  { name: 'Manu', regNo: 'PQASAEGR02' },
  { name: 'Sanu', regNo: 'PQASAEGR03' },
  { name: 'Fanu', regNo: 'PQASAEGR04' },
  { name: 'Minu', regNo: 'PQASAEGR05' },
  { name: 'Ninu', regNo: 'PQASAEGR06' },
  { name: 'Lalu', regNo: 'PQASAEGR07' },
  { name: 'Shalu', regNo: 'PQASAEGR08' },
  { name: 'Ponnu', regNo: 'PQASAEGR09' },
  { name: 'Minnu', regNo: 'PQASAEGR10' },
  { name: 'Chinnu', regNo: 'PQASAEGR11' },
  { name: 'Kunju', regNo: 'PQASAEGR12' },
  { name: 'Sara', regNo: 'PQASAEGR13' },
  { name: 'Liya', regNo: 'PQASAEGR14' },
  { name: 'Mia', regNo: 'PQASAEGR15' },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<UserRole>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const res = await login(activeTab, username.trim(), password.trim());
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleSelectDemoStudent = (name: string, regNo: string) => {
    setActiveTab('student');
    setUsername(name);
    setPassword(regNo);
    setError(null);
  };

  const handleFillExaminerCredentials = () => {
    setActiveTab('examiner');
    setUsername('Abhinav');
    setPassword('Abhinav@Univ2026!Exam#Sec');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: University Identity & Campus Backdrop */}
        <div className="relative lg:col-span-5 bg-blue-900 text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <img
              src={campusBanner}
              alt="ABC International University Campus"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/90 via-blue-900/80 to-blue-950/95" />

          {/* Identity Header */}
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-white p-1 mb-5 shadow-lg border border-blue-200">
              <img
                src={universityCrest}
                alt="University Crest"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="font-crest text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              ABC INTERNATIONAL UNIVERSITY
            </h1>
            <p className="text-xs uppercase tracking-widest text-blue-200 mt-1 font-semibold">
              New Delhi · Examination Branch
            </p>
            <div className="mt-4 pt-4 border-t border-blue-700/60">
              <p className="text-xs text-blue-100/90 leading-relaxed">
                Welcome to the Central Examination and Result Management Portal. All evaluations are governed under standard academic evaluation protocols.
              </p>
            </div>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="relative z-10 mt-8 pt-4 border-t border-blue-700/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Quick Test Access</span>
            </div>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleFillExaminerCredentials}
                className="w-full text-left text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-2.5 transition-colors cursor-pointer"
              >
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Examiner: Abhinav</span>
                  <span className="text-[10px] bg-blue-500/40 text-blue-100 px-1.5 py-0.5 rounded">Auto Fill</span>
                </div>
                <div className="text-[11px] text-blue-200 mt-0.5">
                  Full control: Enter, edit, calculate & publish
                </div>
              </button>

              <div className="bg-white/10 border border-white/20 rounded-lg p-2.5">
                <div className="text-xs font-semibold text-white mb-1.5">Students (15 Candidates):</div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {DEMO_STUDENTS.slice(0, 8).map((st) => (
                    <button
                      key={st.regNo}
                      type="button"
                      onClick={() => handleSelectDemoStudent(st.name, st.regNo)}
                      className="text-[10px] bg-blue-950/60 hover:bg-blue-600/80 text-blue-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
                      title={`${st.name} - ${st.regNo}`}
                    >
                      {st.name}
                    </button>
                  ))}
                  <span className="text-[10px] text-blue-300 self-center">+ 7 more</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Secure Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          
          {/* Role Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('examiner');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'examiner'
                  ? 'bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Examiner Login</span>
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeTab === 'student' ? 'Student Result Verification' : 'Examiner Administration'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeTab === 'student'
                ? 'Enter your Student Name as registered and Register Number as password to access your result.'
                : 'Authorized personnel only: Log in to enter, update marks, and publish final results.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {activeTab === 'student' ? 'Student Name' : 'Examiner Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === 'student' ? 'e.g. Anu, Manu, Sara' : 'Abhinav'}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {activeTab === 'student' ? 'Password (Register Number)' : 'Security Password'}
                </label>
                {activeTab === 'student' && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Format: PQASAEGR01 – PQASAEGR15
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'student' ? 'e.g. PQASAEGR01' : '••••••••••••'}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security Notice Note */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>
                {activeTab === 'student'
                  ? 'Students can only view their own registered results. No other student information is accessible.'
                  : 'Examiner access is protected with PBKDF2/SHA-512 salted hashing and time-limited tokens.'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-blue-800 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{activeTab === 'student' ? 'Access My Result' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
