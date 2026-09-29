/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudentResult, SubjectMarks } from '../types/index.ts';
import { SUBJECT_LIST, calculateGrade } from '../utils/gradeCalculator.ts';
import { X, Save, AlertCircle, CheckCircle2, Calculator } from 'lucide-react';

interface MarkEntryModalProps {
  student: StudentResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (marks: SubjectMarks) => Promise<boolean>;
}

export const MarkEntryModal: React.FC<MarkEntryModalProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
}) => {
  const [marks, setMarks] = useState<{
    english: string;
    mathematics: string;
    science: string;
    socialScience: string;
    computerScience: string;
  }>({
    english: '',
    mathematics: '',
    science: '',
    socialScience: '',
    computerScience: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      if (student.marks) {
        setMarks({
          english: String(student.marks.english),
          mathematics: String(student.marks.mathematics),
          science: String(student.marks.science),
          socialScience: String(student.marks.socialScience),
          computerScience: String(student.marks.computerScience),
        });
      } else {
        setMarks({
          english: '',
          mathematics: '',
          science: '',
          socialScience: '',
          computerScience: '',
        });
      }
      setFormError(null);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  // Real-time calculation computation
  const engNum = marks.english === '' ? null : Number(marks.english);
  const mathNum = marks.mathematics === '' ? null : Number(marks.mathematics);
  const sciNum = marks.science === '' ? null : Number(marks.science);
  const socNum = marks.socialScience === '' ? null : Number(marks.socialScience);
  const compNum = marks.computerScience === '' ? null : Number(marks.computerScience);

  const allFilled =
    engNum !== null &&
    mathNum !== null &&
    sciNum !== null &&
    socNum !== null &&
    compNum !== null;

  const subjectsToCheck = [
    { name: 'English', val: engNum },
    { name: 'Mathematics', val: mathNum },
    { name: 'Science', val: sciNum },
    { name: 'Social Science', val: socNum },
    { name: 'Computer Science', val: compNum },
  ];

  const failedSubjects = subjectsToCheck
    .filter((s) => s.val !== null && s.val < 40)
    .map((s) => s.name);

  const totalCalculated =
    (engNum || 0) + (mathNum || 0) + (sciNum || 0) + (socNum || 0) + (compNum || 0);

  const percentageCalculated = allFilled
    ? Number(((totalCalculated / 500) * 100).toFixed(2))
    : null;

  const isPassedCalculated = allFilled ? failedSubjects.length === 0 : null;
  const gradeCalculated =
    percentageCalculated !== null && isPassedCalculated !== null
      ? calculateGrade(percentageCalculated, isPassedCalculated)
      : null;

  const handleInputChange = (field: keyof typeof marks, value: string) => {
    // Only accept digits, max 100
    if (value === '') {
      setMarks((prev) => ({ ...prev, [field]: '' }));
      return;
    }
    const num = Number(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setMarks((prev) => ({ ...prev, [field]: value }));
      setFormError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFilled) {
      setFormError('Please enter marks for all 5 subjects (0 to 100).');
      return;
    }

    const payload: SubjectMarks = {
      english: Number(engNum),
      mathematics: Number(mathNum),
      science: Number(sciNum),
      socialScience: Number(socNum),
      computerScience: Number(compNum),
    };

    setIsSubmitting(true);
    const success = await onSave(payload);
    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      setFormError('Failed to save marks. Please check input and server connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Mark Entry & Assessment
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {student.name} <span className="font-mono text-sm font-normal text-slate-500">({student.registerNumber})</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Subject Inputs Grid */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Course Subjects (Max 100 Marks Each · Min 40 to Pass)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {SUBJECT_LIST.map((subj) => {
                const currentVal = marks[subj.key as keyof typeof marks];
                const numVal = currentVal === '' ? null : Number(currentVal);
                const isFailed = numVal !== null && numVal < 40;

                return (
                  <div
                    key={subj.key}
                    className={`p-3 rounded-xl border transition-colors ${
                      isFailed
                        ? 'border-rose-300 bg-rose-50/40 dark:border-rose-800/60 dark:bg-rose-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {subj.label}
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">
                        {subj.code}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentVal}
                        onChange={(e) =>
                          handleInputChange(subj.key as keyof typeof marks, e.target.value)
                        }
                        placeholder="Enter 0 - 100"
                        className={`w-full px-3 py-2 text-sm font-mono font-semibold rounded-lg border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 transition-colors ${
                          isFailed
                            ? 'border-rose-400 dark:border-rose-700 text-rose-700 dark:text-rose-300 focus:ring-rose-500'
                            : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-blue-500'
                        }`}
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                        / 100
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] flex items-center justify-between">
                      <span className="text-slate-400">Passing: 40</span>
                      {numVal !== null && (
                        <span
                          className={`font-semibold ${
                            isFailed
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isFailed ? 'Below Passing' : 'Satisfactory'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-Time Live Calculation Card */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-3">
              <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Real-Time Result Computation</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Marks</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  {allFilled ? `${totalCalculated} / 500` : `${totalCalculated} / 500*`}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Percentage</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  {percentageCalculated !== null ? `${percentageCalculated}%` : '—'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Grade</span>
                <span className="text-base font-bold font-mono text-blue-700 dark:text-blue-400">
                  {gradeCalculated || '—'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Status</span>
                <span
                  className={`text-sm font-bold block ${
                    isPassedCalculated === true
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isPassedCalculated === false
                      ? 'text-rose-700 dark:text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {isPassedCalculated === true
                    ? 'PASSED'
                    : isPassedCalculated === false
                    ? 'FAILED'
                    : 'INCOMPLETE'}
                </span>
              </div>
            </div>

            {/* Explanation of pass/fail condition */}
            {failedSubjects.length > 0 && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-100/70 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>
                  Result is <strong>FAILED</strong>: Score in {failedSubjects.join(', ')} is under the required 40 minimum passing marks.
                </span>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !allFilled}
              className="px-5 py-2 bg-blue-800 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Student Marks</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
