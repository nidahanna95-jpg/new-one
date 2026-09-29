/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExaminerStats, StudentResult, UniversityConfig } from '../types/index.ts';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import universityCrest from '../assets/images/university_crest_logo_1790695986828.jpg';

interface BatchGazetteModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentResult[];
  stats: ExaminerStats;
  university: UniversityConfig;
  onExportExcel: () => void;
}

export const BatchGazetteModal: React.FC<BatchGazetteModalProps> = ({
  isOpen,
  onClose,
  students,
  stats,
  university,
  onExportExcel,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 no-print">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Official Examination Gazette
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Annual Master Result Tabulation Register
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 printable-card">
          
          {/* Institutional Document Header */}
          <div className="text-center pb-6 border-b-2 border-blue-900">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-blue-900/30">
                <img
                  src={universityCrest}
                  alt="University Seal"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h1 className="font-crest text-xl sm:text-2xl font-bold tracking-tight text-blue-950 uppercase leading-none">
                  {university.universityName}
                </h1>
                <p className="text-xs font-semibold tracking-wider text-slate-600 uppercase mt-1">
                  Directorate of Evaluations & Examinations · New Delhi
                </p>
                <p className="text-[11px] text-slate-500">
                  {university.academicYear} · {university.examinationSession}
                </p>
              </div>
            </div>

            <div className="inline-block mt-2 px-4 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-bold uppercase tracking-widest text-blue-900">
              Master Tabulation Register of Candidates
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-5 gap-3 py-4 my-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Total Candidates</span>
              <strong className="text-sm font-mono text-slate-900">{stats.totalStudents}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Marks Compiled</span>
              <strong className="text-sm font-mono text-slate-900">{stats.marksEnteredCount} / {stats.totalStudents}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Passed</span>
              <strong className="text-sm font-mono text-emerald-700">{stats.passCount}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Failed</span>
              <strong className="text-sm font-mono text-rose-700">{stats.failCount}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Pass Percentage</span>
              <strong className="text-sm font-mono text-blue-900">{stats.passPercentage}%</strong>
            </div>
          </div>

          {/* Master Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <th className="py-2 px-2.5 border-r border-slate-300">#</th>
                  <th className="py-2 px-3 border-r border-slate-300">Reg. No</th>
                  <th className="py-2 px-3 border-r border-slate-300">Student Name</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">ENG</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">MTH</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">SCI</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">SOC</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">CSC</th>
                  <th className="py-2 px-2.5 text-center font-bold border-r border-slate-300">Total (500)</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">%</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Grade</th>
                  <th className="py-2 px-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((st, idx) => (
                  <tr key={st.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                    <td className="py-2 px-2.5 font-mono text-slate-500 border-r border-slate-200">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-900 border-r border-slate-200">
                      {st.registerNumber}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-900 border-r border-slate-200">{st.name}</td>
                    <td className={`py-2 px-2 text-center font-mono border-r border-slate-200 ${st.marks && st.marks.english < 40 ? 'text-rose-700 font-bold bg-rose-50' : ''}`}>
                      {st.marks ? st.marks.english : '—'}
                    </td>
                    <td className={`py-2 px-2 text-center font-mono border-r border-slate-200 ${st.marks && st.marks.mathematics < 40 ? 'text-rose-700 font-bold bg-rose-50' : ''}`}>
                      {st.marks ? st.marks.mathematics : '—'}
                    </td>
                    <td className={`py-2 px-2 text-center font-mono border-r border-slate-200 ${st.marks && st.marks.science < 40 ? 'text-rose-700 font-bold bg-rose-50' : ''}`}>
                      {st.marks ? st.marks.science : '—'}
                    </td>
                    <td className={`py-2 px-2 text-center font-mono border-r border-slate-200 ${st.marks && st.marks.socialScience < 40 ? 'text-rose-700 font-bold bg-rose-50' : ''}`}>
                      {st.marks ? st.marks.socialScience : '—'}
                    </td>
                    <td className={`py-2 px-2 text-center font-mono border-r border-slate-200 ${st.marks && st.marks.computerScience < 40 ? 'text-rose-700 font-bold bg-rose-50' : ''}`}>
                      {st.marks ? st.marks.computerScience : '—'}
                    </td>
                    <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-900 border-r border-slate-200">
                      {st.hasMarks ? st.totalMarks : '—'}
                    </td>
                    <td className="py-2 px-2 text-center font-mono border-r border-slate-200">
                      {st.hasMarks ? `${st.percentage}%` : '—'}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-blue-900 border-r border-slate-200">
                      {st.hasMarks ? st.grade : '—'}
                    </td>
                    <td className="py-2 px-3 text-center font-bold">
                      {st.hasMarks ? (
                        <span className={st.status === 'PASSED' ? 'text-emerald-700' : 'text-rose-700'}>
                          {st.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">PENDING</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gazette Footer & Signatures */}
          <div className="mt-8 pt-8 border-t border-slate-300 flex items-end justify-between text-xs text-slate-600">
            <div>
              <div className="font-semibold text-slate-800">ABC International University Delhi</div>
              <div>Published Under Authority of the Vice Chancellor</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Report Generated on: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>

            <div className="text-center">
              <div className="w-36 border-b border-slate-400 pb-1 mb-1 font-serif italic text-slate-800 font-semibold">
                Abhinav
              </div>
              <div className="font-semibold text-slate-800 text-[11px]">Chief Examiner</div>
              <div className="text-[10px] text-slate-500">Board of Examinations</div>
            </div>

            <div className="text-center">
              <div className="w-40 border-b border-slate-400 pb-1 mb-1 font-serif italic text-blue-950 font-bold">
                Dr. R. K. Sharma
              </div>
              <div className="font-semibold text-slate-800 text-[11px]">Controller of Examinations</div>
              <div className="text-[10px] text-slate-500">ABC International University</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
