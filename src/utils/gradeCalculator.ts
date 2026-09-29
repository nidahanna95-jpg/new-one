/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Grade, StudentResult, SubjectMarks } from '../types/index.ts';

export const SUBJECT_LIST = [
  { key: 'english', label: 'English', code: 'ENG-101', maxMarks: 100, minMarks: 40 },
  { key: 'mathematics', label: 'Mathematics', code: 'MTH-102', maxMarks: 100, minMarks: 40 },
  { key: 'science', label: 'Science', code: 'SCI-103', maxMarks: 100, minMarks: 40 },
  { key: 'socialScience', label: 'Social Science', code: 'SOC-104', maxMarks: 100, minMarks: 40 },
  { key: 'computerScience', label: 'Computer Science', code: 'CSC-105', maxMarks: 100, minMarks: 40 },
] as const;

export function calculateGrade(percentage: number, isPassed: boolean): Grade {
  if (!isPassed) return 'F';
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

export function calculateStudentResult(
  id: string,
  name: string,
  registerNumber: string,
  marks: SubjectMarks | null,
  updatedAt?: string | null
): StudentResult {
  if (!marks) {
    return {
      id,
      name,
      registerNumber,
      marks: null,
      hasMarks: false,
      totalMarks: null,
      percentage: null,
      grade: null,
      status: null,
      updatedAt: updatedAt || null,
      failedSubjects: [],
    };
  }

  const { english, mathematics, science, socialScience, computerScience } = marks;

  const subjectValues = [
    { name: 'English', val: Number(english) },
    { name: 'Mathematics', val: Number(mathematics) },
    { name: 'Science', val: Number(science) },
    { name: 'Social Science', val: Number(socialScience) },
    { name: 'Computer Science', val: Number(computerScience) },
  ];

  const failedSubjects = subjectValues
    .filter((s) => isNaN(s.val) || s.val < 40)
    .map((s) => s.name);

  const total = subjectValues.reduce((acc, curr) => acc + (isNaN(curr.val) ? 0 : curr.val), 0);
  const percentage = Number(((total / 500) * 100).toFixed(2));
  const isPassed = failedSubjects.length === 0;
  const grade = calculateGrade(percentage, isPassed);
  const status: 'PASSED' | 'FAILED' = isPassed ? 'PASSED' : 'FAILED';

  return {
    id,
    name,
    registerNumber,
    marks: {
      english: Number(english),
      mathematics: Number(mathematics),
      science: Number(science),
      socialScience: Number(socialScience),
      computerScience: Number(computerScience),
    },
    hasMarks: true,
    totalMarks: total,
    percentage,
    grade,
    status,
    updatedAt: updatedAt || null,
    failedSubjects,
  };
}
