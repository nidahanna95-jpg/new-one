/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { StudentResult, UniversityConfig } from '../types/index.ts';
import { SUBJECT_LIST } from '../utils/gradeCalculator.ts';
import {
  Download,
  Printer,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  GraduationCap,
  Calendar,
  Building,
  QrCode,
} from 'lucide-react';
import universityCrest from '../assets/images/university_crest_logo_1790695986828.jpg';

export const StudentPortal: React.FC = () => {
  const { session } = useAuth();
  const [data, setData] = useState<{
    isPublished: boolean;
    hasMarks?: boolean;
    message?: string;
    result?: StudentResult;
    student?: { name: string; registerNumber: string };
    university?: UniversityConfig;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchStudentResult = async () => {
    if (!session?.token) return;
    try {
      const res = await fetch('/api/student/result', {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching student result:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentResult();
  }, [session]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-800 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Retrieving Student Records...</span>
      </div>
    );
  }

  // 1. Result NOT Published Yet state
  if (!data?.isPublished) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Official Announcement
          </span>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Result Not Published Yet.
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            The examination evaluations and marks moderation process for the Annual Examinations 2025–2026 are currently in progress by the authorized examiners.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 max-w-md mx-auto text-left flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-800 dark:text-blue-300 font-bold shrink-0">
              {session?.user.name ? session.user.name[0] : 'S'}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Candidate: {session?.user.name}
              </div>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Register Number: {session?.user.registerNumber}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                ● Credentials Verified & Secure
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-400 dark:text-slate-500">
            Please check back once the Chief Examiner concludes mark verification and officially publishes the results.
          </div>

        </div>
      </div>
    );
  }

  // 2. Published but marks are still compiling for this student
  if (data.isPublished && !data.hasMarks) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Marks Under Compilation
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2">
            Your results have been initialized, but final subject scores are being verified by the examiner. Please refresh shortly.
          </p>

          <button
            onClick={fetchStudentResult}
            className="mt-6 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  // 3. Official Result Grade Card
  const result = data.result!;
  const university = data.university!;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Action Bar (Download & Print Buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs no-print">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            ● Official Result Verified
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Annual Examination Statement of Marks
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Result as PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Official Printable Statement of Marks Certificate */}
      <div className="bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-lg p-6 sm:p-10 relative overflow-hidden printable-card">
        
        {/* Subtle Watermark Seal in Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <img
            src={universityCrest}
            alt="Watermark Crest"
            className="w-96 h-96 object-contain"
          />
        </div>

        {/* Certificate Header */}
        <div className="text-center pb-6 border-b-2 border-blue-950 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
            <div className="w-20 h-20 rounded-full border-2 border-blue-900 p-0.5 shadow-xs">
              <img
                src={universityCrest}
                alt="University Crest"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="font-crest text-xl sm:text-2xl font-bold tracking-tight text-blue-950 uppercase leading-tight">
                {university.universityName}
              </h1>
              <p className="text-xs font-bold tracking-widest text-slate-700 uppercase mt-0.5">
                Directorate of Examinations & Academic Evaluations
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                New Delhi · Established by Act of Parliament
              </p>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-900">
            <span>Statement of Marks & Grades</span>
            <span>Annual Degree Examinations 2025–2026</span>
          </div>
        </div>

        {/* Student Credential Metadata Table */}
        <div className="my-6 p-4 rounded-xl bg-slate-50/80 border border-slate-200 relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 block">Candidate Name</span>
            <span className="font-bold text-sm text-slate-900 uppercase">{result.name}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Register Number</span>
            <span className="font-bold font-mono text-sm text-blue-950">{result.registerNumber}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Program / Faculty</span>
            <span className="font-semibold text-slate-800">Undergraduate Honours</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Date of Declaration</span>
            <span className="font-semibold text-slate-800">
              {university.publishedAt
                ? new Date(university.publishedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Official Release'}
            </span>
          </div>
        </div>

        {/* Detailed Marks Table */}
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                <th className="py-2.5 px-3 border-r border-slate-300">Course Code</th>
                <th className="py-2.5 px-4 border-r border-slate-300">Subject Name</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-300">Max Marks</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-300">Min Pass</th>
                <th className="py-2.5 px-3 text-center font-bold border-r border-slate-300">Marks Obtained</th>
                <th className="py-2.5 px-3 text-center font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {SUBJECT_LIST.map((subj) => {
                const mark = result.marks ? result.marks[subj.key as keyof typeof result.marks] : 0;
                const isSubjectPassed = mark >= subj.minMarks;

                return (
                  <tr key={subj.key} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-600 border-r border-slate-200">
                      {subj.code}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                      {subj.label}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-200">
                      {subj.maxMarks}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-200">
                      {subj.minMarks}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-sm text-slate-900 border-r border-slate-200">
                      {mark}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className={isSubjectPassed ? 'text-emerald-700' : 'text-rose-700'}>
                        {isSubjectPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Aggregate Summary Box */}
        <div className="mt-6 p-4 rounded-xl bg-blue-50/60 border border-blue-200 relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-2">
            <span className="text-[11px] text-slate-600 block uppercase font-semibold">Total Marks</span>
            <span className="text-xl font-bold font-mono text-blue-950">
              {result.totalMarks} <span className="text-xs text-slate-500">/ 500</span>
            </span>
          </div>

          <div className="p-2">
            <span className="text-[11px] text-slate-600 block uppercase font-semibold">Percentage</span>
            <span className="text-xl font-bold font-mono text-blue-950">
              {result.percentage}%
            </span>
          </div>

          <div className="p-2">
            <span className="text-[11px] text-slate-600 block uppercase font-semibold">Overall Grade</span>
            <span className="text-2xl font-bold font-mono text-blue-900">
              {result.grade}
            </span>
          </div>

          <div className="p-2">
            <span className="text-[11px] text-slate-600 block uppercase font-semibold">Final Result</span>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              {result.status === 'PASSED' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-lg font-bold text-emerald-700">PASSED</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span className="text-lg font-bold text-rose-700">FAILED</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Result Specific Explanations */}
        {result.failedSubjects && result.failedSubjects.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>
              <strong>Note:</strong> Reappear required in: {result.failedSubjects.join(', ')}. Minimum passing mark of 40 not secured.
            </span>
          </div>
        )}

        {/* Grading Scale Legend */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>A+ : 90–100% (Outstanding)</div>
          <div>A : 80–89% (Excellent)</div>
          <div>B+ : 70–79% (Very Good)</div>
          <div>B : 60–69% (Good)</div>
          <div>C : 50–59% (Above Average)</div>
          <div>D : 40–49% (Pass)</div>
          <div>F : Below 40% (Fail)</div>
          <div>Rule: 40% per subject required to pass</div>
        </div>

        {/* Signatures, Embellishment & Verification */}
        <div className="mt-8 pt-6 border-t-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-3">
            <div className="p-2 border border-slate-300 rounded-lg bg-white shadow-xs">
              <QrCode className="w-12 h-12 text-slate-700" />
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              <div className="font-bold text-slate-700">DIGITALLY VERIFIED DOCUMENT</div>
              <div>ID: ABC-VER-{result.registerNumber}-2026</div>
              <div>Valid without physical wet signature</div>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="font-serif italic text-base font-bold text-blue-950 mb-1">
              Dr. R. K. Sharma
            </div>
            <div className="text-xs font-bold text-slate-800 uppercase">Controller of Examinations</div>
            <div className="text-[10px] text-slate-500">ABC International University Delhi</div>
          </div>

        </div>

      </div>

    </div>
  );
};
