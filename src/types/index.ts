/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'examiner' | 'student';

export interface SubjectMarks {
  english: number;
  mathematics: number;
  science: number;
  socialScience: number;
  computerScience: number;
}

export type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';

export interface StudentResult {
  id: string;
  name: string;
  registerNumber: string;
  marks: SubjectMarks | null;
  hasMarks: boolean;
  totalMarks: number | null; // out of 500
  percentage: number | null; // 0 - 100
  grade: Grade | null;
  status: 'PASSED' | 'FAILED' | null;
  updatedAt?: string | null;
  failedSubjects?: string[];
}

export interface StudentRecord {
  id: string;
  name: string;
  registerNumber: string;
  passwordHash: string;
  salt: string;
  marks: SubjectMarks | null;
  updatedAt: string | null;
}

export interface ExaminerRecord {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  salt: string;
}

export interface UniversityConfig {
  universityName: string;
  title: string;
  location: string;
  academicYear: string;
  examinationSession: string;
  isPublished: boolean;
  publishedAt: string | null;
}

export interface ExaminerStats {
  totalStudents: number;
  marksEnteredCount: number;
  pendingMarksCount: number;
  isPublished: boolean;
  publishedAt: string | null;
  passCount: number;
  failCount: number;
  passPercentage: number;
  averagePercentage: number;
  highestPercentage: number;
  topScorer: { name: string; registerNumber: string; percentage: number } | null;
  subjectAverages: {
    english: number;
    mathematics: number;
    science: number;
    socialScience: number;
    computerScience: number;
  };
}

export interface AuthSession {
  token: string;
  role: UserRole;
  user: {
    id: string;
    name: string;
    username?: string;
    registerNumber?: string;
  };
  expiresAt: number;
}
