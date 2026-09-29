/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ExaminerStats, StudentResult, SubjectMarks, UniversityConfig } from '../types/index.ts';
import { MarkEntryModal } from './MarkEntryModal.tsx';
import { BatchGazetteModal } from './BatchGazetteModal.tsx';
import {
  Users,
  CheckCircle,
  XCircle,
  Percent,
  Search,
  Download,
  Printer,
  Edit3,
  Trash2,
  Send,
  EyeOff,
  RefreshCw,
  Sparkles,
  Trophy,
  BarChart3,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const ExaminerDashboard: React.FC = () => {
  const { session } = useAuth();
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [stats, setStats] = useState<ExaminerStats | null>(null);
  const [university, setUniversity] = useState<UniversityConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'entered' | 'pending' | 'passed' | 'failed'>('all');
  
  // Modals state
  const [editingStudent, setEditingStudent] = useState<StudentResult | null>(null);
  const [isGazetteOpen, setIsGazetteOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchDashboardData = async () => {
    if (!session?.token) return;
    try {
      const res = await fetch('/api/examiner/students', {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setStats(data.stats);
        setUniversity(data.university);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [session]);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleSaveMarks = async (marks: SubjectMarks): Promise<boolean> => {
    if (!editingStudent || !session?.token) return false;
    try {
      const res = await fetch('/api/examiner/marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          studentId: editingStudent.id,
          ...marks,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudents((prev) =>
          prev.map((s) => (s.id === data.student.id ? data.student : s))
        );
        setStats(data.stats);
        showNotification(`Marks saved successfully for ${editingStudent.name}.`, 'success');
        return true;
      }
    } catch (err) {
      console.error('Error saving marks:', err);
    }
    return false;
  };

  const handleClearMarks = async (student: StudentResult) => {
    if (!window.confirm(`Are you sure you want to clear/delete marks for ${student.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/examiner/marks/${student.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStudents((prev) =>
          prev.map((s) => (s.id === data.student.id ? data.student : s))
        );
        setStats(data.stats);
        showNotification(`Marks cleared for ${student.name}.`, 'info');
      }
    } catch (err) {
      showNotification('Failed to clear marks.', 'error');
    }
  };

  const handleTogglePublish = async () => {
    if (!stats || !session?.token) return;
    const nextPublishState = !stats.isPublished;

    const confirmMsg = nextPublishState
      ? 'Publish results now? Students will immediately be able to view their marks, percentage, and grade cards.'
      : 'Unpublish results? Students will see "Result Not Published Yet."';

    if (!window.confirm(confirmMsg)) return;

    setIsPublishing(true);
    try {
      const res = await fetch('/api/examiner/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ publish: nextPublishState }),
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        if (university) {
          setUniversity({ ...university, isPublished: data.isPublished, publishedAt: data.publishedAt });
        }
        showNotification(data.message, 'success');
      }
    } catch (err) {
      showNotification('Error changing publication status.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDemoMarks = async (action: 'load' | 'reset') => {
    if (!session?.token) return;

    const confirmText =
      action === 'load'
        ? 'Load realistic sample marks across all 15 students for rapid demonstration and review?'
        : 'Reset all marks back to blank and unpublish results?';

    if (!window.confirm(confirmText)) return;

    try {
      const res = await fetch('/api/examiner/sample-marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchDashboardData();
        showNotification(data.message, 'success');
      }
    } catch (err) {
      showNotification('Failed to process sample marks action.', 'error');
    }
  };

  const handleExportExcel = () => {
    if (!students.length) return;

    // Build CSV with BOM for UTF-8 compatibility with Excel
    const headers = [
      'Registration Number',
      'Student Name',
      'English (100)',
      'Mathematics (100)',
      'Science (100)',
      'Social Science (100)',
      'Computer Science (100)',
      'Total Marks (500)',
      'Percentage (%)',
      'Grade',
      'Result Status',
      'Failed Subjects',
    ];

    const rows = students.map((s) => [
      `"${s.registerNumber}"`,
      `"${s.name}"`,
      s.marks ? s.marks.english : 'N/A',
      s.marks ? s.marks.mathematics : 'N/A',
      s.marks ? s.marks.science : 'N/A',
      s.marks ? s.marks.socialScience : 'N/A',
      s.marks ? s.marks.computerScience : 'N/A',
      s.hasMarks ? s.totalMarks : 'N/A',
      s.hasMarks ? s.percentage : 'N/A',
      s.hasMarks ? `"${s.grade}"` : 'N/A',
      s.hasMarks ? `"${s.status}"` : '"PENDING"',
      s.failedSubjects && s.failedSubjects.length > 0 ? `"${s.failedSubjects.join(', ')}"` : '"None"',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ABC_Univ_Results_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Excel spreadsheet report exported successfully.', 'success');
  };

  // Filter students based on search query and status filter
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'entered') return s.hasMarks;
    if (statusFilter === 'pending') return !s.hasMarks;
    if (statusFilter === 'passed') return s.status === 'PASSED';
    if (statusFilter === 'failed') return s.status === 'FAILED';
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-800 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading Examiner Control Center...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
              : actionMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800'
              : 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : actionMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Control Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">
              Central Evaluation Division
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Examiner: <strong>Abhinav</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Examiner Result Management Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter marks out of 100 for each candidate. All total scores, percentages, grades, and pass/fail rules are computed in real time.
          </p>
        </div>

        {/* Publish Results Master Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl border bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
            <div className={`w-2.5 h-2.5 rounded-full ${stats?.isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold leading-tight">
                Publication Status
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {stats?.isPublished ? 'Live & Published' : 'Unpublished (Draft)'}
              </span>
            </div>
          </div>

          <button
            onClick={handleTogglePublish}
            disabled={isPublishing}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
              stats?.isPublished
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {isPublishing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : stats?.isPublished ? (
              <>
                <EyeOff className="w-4 h-4 text-amber-600" />
                <span>Unpublish Results</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish Results</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Students</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {stats?.totalStudents || 15}
            </span>
            <span className="text-xs text-slate-400">candidates</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Compiled: <strong>{stats?.marksEnteredCount || 0}</strong> / {stats?.totalStudents || 15}
          </div>
        </div>

        {/* Pass Count */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Pass Count</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {stats?.passCount || 0}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              ({stats?.passPercentage || 0}%)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            All 5 subjects ≥ 40
          </div>
        </div>

        {/* Fail Count */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Fail Count</span>
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {stats?.failCount || 0}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              {stats?.marksEnteredCount ? `(${(((stats.failCount || 0) / stats.marksEnteredCount) * 100).toFixed(0)}%)` : ''}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Any subject &lt; 40
          </div>
        </div>

        {/* Average Percentage */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Average Score</span>
            <Percent className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {stats?.averagePercentage || 0}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Class aggregate average
          </div>
        </div>

        {/* Class Topper / High Score */}
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Class Topper</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2 truncate">
            <span className="text-lg font-bold text-blue-900 dark:text-blue-300 truncate">
              {stats?.topScorer ? stats.topScorer.name : '—'}
            </span>
            {stats?.topScorer && (
              <span className="text-xs font-mono font-bold text-amber-600">
                {stats.topScorer.percentage}%
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {stats?.topScorer ? `Reg: ${stats.topScorer.registerNumber}` : 'Awaiting marks entry'}
          </div>
        </div>

      </div>

      {/* Quick Testing & Demonstration Actions Bar */}
      <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Examiner Utilities:</span>
          <span className="font-normal text-blue-800 dark:text-blue-300 hidden sm:inline">
            You can enter marks individually, or load a realistic demo batch to test calculations & publishing.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDemoMarks('load')}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Populate test marks for all 15 candidates"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Demo Marks (15 Students)</span>
          </button>

          <button
            onClick={() => handleDemoMarks('reset')}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-700 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset all marks back to blank"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset All to Blank</span>
          </button>
        </div>
      </div>

      {/* Main Student Records Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Table Filter & Search Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or register number..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter Tabs & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filter Pills */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : ''
                }`}
              >
                All ({students.length})
              </button>
              <button
                onClick={() => setStatusFilter('entered')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'entered' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : ''
                }`}
              >
                Entered ({stats?.marksEnteredCount || 0})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : ''
                }`}
              >
                Pending ({stats?.pendingMarksCount || 0})
              </button>
              <button
                onClick={() => setStatusFilter('passed')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'passed' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold' : ''
                }`}
              >
                Passed ({stats?.passCount || 0})
              </button>
              <button
                onClick={() => setStatusFilter('failed')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'failed' ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs font-bold' : ''
                }`}
              >
                Failed ({stats?.failCount || 0})
              </button>
            </div>

            {/* Export Buttons */}
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Download results spreadsheet for Microsoft Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel Export</span>
            </button>

            <button
              onClick={() => setIsGazetteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Generate printable master tabulation register"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Gazette PDF</span>
            </button>
          </div>

        </div>

        {/* Student Marks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Reg. No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-2 text-center" title="English (100)">ENG</th>
                <th className="py-3 px-2 text-center" title="Mathematics (100)">MTH</th>
                <th className="py-3 px-2 text-center" title="Science (100)">SCI</th>
                <th className="py-3 px-2 text-center" title="Social Science (100)">SOC</th>
                <th className="py-3 px-2 text-center" title="Computer Science (100)">CSC</th>
                <th className="py-3 px-3 text-center font-bold">Total (500)</th>
                <th className="py-3 px-2 text-center font-bold">%</th>
                <th className="py-3 px-2 text-center font-bold">Grade</th>
                <th className="py-3 px-3 text-center font-bold">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    No student matches the search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {st.registerNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {st.name}
                      </td>

                      {/* Subject Marks */}
                      <td className={`py-3 px-2 text-center font-mono ${st.marks && st.marks.english < 40 ? 'text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/20' : 'text-slate-700 dark:text-slate-300'}`}>
                        {st.marks ? st.marks.english : '—'}
                      </td>
                      <td className={`py-3 px-2 text-center font-mono ${st.marks && st.marks.mathematics < 40 ? 'text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/20' : 'text-slate-700 dark:text-slate-300'}`}>
                        {st.marks ? st.marks.mathematics : '—'}
                      </td>
                      <td className={`py-3 px-2 text-center font-mono ${st.marks && st.marks.science < 40 ? 'text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/20' : 'text-slate-700 dark:text-slate-300'}`}>
                        {st.marks ? st.marks.science : '—'}
                      </td>
                      <td className={`py-3 px-2 text-center font-mono ${st.marks && st.marks.socialScience < 40 ? 'text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/20' : 'text-slate-700 dark:text-slate-300'}`}>
                        {st.marks ? st.marks.socialScience : '—'}
                      </td>
                      <td className={`py-3 px-2 text-center font-mono ${st.marks && st.marks.computerScience < 40 ? 'text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/20' : 'text-slate-700 dark:text-slate-300'}`}>
                        {st.marks ? st.marks.computerScience : '—'}
                      </td>

                      {/* Calculated Aggregate Total */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {st.hasMarks ? st.totalMarks : '—'}
                      </td>

                      {/* Calculated Percentage */}
                      <td className="py-3 px-2 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {st.hasMarks ? `${st.percentage}%` : '—'}
                      </td>

                      {/* Grade Badge */}
                      <td className="py-3 px-2 text-center">
                        {st.hasMarks ? (
                          <span
                            className={`font-mono font-bold text-xs ${
                              st.grade === 'A+' || st.grade === 'A'
                                ? 'text-blue-700 dark:text-blue-400'
                                : st.grade === 'B+' || st.grade === 'B'
                                ? 'text-indigo-700 dark:text-indigo-400'
                                : st.grade === 'C' || st.grade === 'D'
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {st.grade}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Pass/Fail Status */}
                      <td className="py-3 px-3 text-center">
                        {st.hasMarks ? (
                          <span
                            className={`inline-block font-bold text-[11px] ${
                              st.status === 'PASSED'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {st.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Pending</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingStudent(st)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-md font-semibold text-xs transition-colors cursor-pointer"
                            title="Enter or update marks"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{st.hasMarks ? 'Edit' : 'Enter'}</span>
                          </button>

                          {st.hasMarks && (
                            <button
                              onClick={() => handleClearMarks(st)}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                              title="Clear marks"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Mark Entry Modal */}
      <MarkEntryModal
        student={editingStudent}
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        onSave={handleSaveMarks}
      />

      {/* Master Batch Gazette Printable PDF Modal */}
      {university && stats && (
        <BatchGazetteModal
          isOpen={isGazetteOpen}
          onClose={() => setIsGazetteOpen(false)}
          students={students}
          stats={stats}
          university={university}
          onExportExcel={handleExportExcel}
        />
      )}

    </div>
  );
};
