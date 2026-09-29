/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { calculateStudentResult, calculateGrade, SUBJECT_LIST } from './src/utils/gradeCalculator.ts';
import {
  AuthSession,
  ExaminerRecord,
  ExaminerStats,
  StudentRecord,
  StudentResult,
  SubjectMarks,
  UniversityConfig,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  university: UniversityConfig;
  examiner: ExaminerRecord;
  students: StudentRecord[];
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Initial 15 students as required
const INITIAL_STUDENTS: { name: string; registerNumber: string }[] = [
  { name: 'Anu', registerNumber: 'PQASAEGR01' },
  { name: 'Manu', registerNumber: 'PQASAEGR02' },
  { name: 'Sanu', registerNumber: 'PQASAEGR03' },
  { name: 'Fanu', registerNumber: 'PQASAEGR04' },
  { name: 'Minu', registerNumber: 'PQASAEGR05' },
  { name: 'Ninu', registerNumber: 'PQASAEGR06' },
  { name: 'Lalu', registerNumber: 'PQASAEGR07' },
  { name: 'Shalu', registerNumber: 'PQASAEGR08' },
  { name: 'Ponnu', registerNumber: 'PQASAEGR09' },
  { name: 'Minnu', registerNumber: 'PQASAEGR10' },
  { name: 'Chinnu', registerNumber: 'PQASAEGR11' },
  { name: 'Kunju', registerNumber: 'PQASAEGR12' },
  { name: 'Sara', registerNumber: 'PQASAEGR13' },
  { name: 'Liya', registerNumber: 'PQASAEGR14' },
  { name: 'Mia', registerNumber: 'PQASAEGR15' },
];

// Examiner initial credentials
const EXAMINER_USERNAME = 'Abhinav';
const EXAMINER_DEFAULT_PASSWORD = 'Abhinav@Univ2026!Exam#Sec';

function initDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse database, re-initializing...', err);
    }
  }

  const examinerSalt = generateSalt();
  const examinerHash = hashPassword(EXAMINER_DEFAULT_PASSWORD, examinerSalt);

  const students: StudentRecord[] = INITIAL_STUDENTS.map((st, idx) => {
    const salt = generateSalt();
    return {
      id: `std_${idx + 1}`,
      name: st.name,
      registerNumber: st.registerNumber,
      passwordHash: hashPassword(st.registerNumber, salt),
      salt,
      marks: null, // ALL MARKS BLANK INITIALLY AS REQUIRED
      updatedAt: null,
    };
  });

  const schema: DatabaseSchema = {
    university: {
      universityName: 'ABC INTERNATIONAL UNIVERSITY DELHI',
      title: 'Student Result Management System',
      location: 'Chanakyapuri, New Delhi, 110021',
      academicYear: '2025–2026',
      examinationSession: 'Annual Degree Examinations',
      isPublished: false, // RESULT NOT PUBLISHED INITIALLY AS REQUIRED
      publishedAt: null,
    },
    examiner: {
      id: 'ex_1',
      username: EXAMINER_USERNAME,
      name: 'Abhinav',
      passwordHash: examinerHash,
      salt: examinerSalt,
    },
    students,
  };

  saveDatabase(schema);
  return schema;
}

let db = initDatabase();

function saveDatabase(data: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// In-memory active sessions (token -> session)
const sessions = new Map<string, AuthSession>();

// Cleanup expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(token);
    }
  }
}, 5 * 60 * 1000);

const app = express();
app.use(express.json());

// Auth helper middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.substring(7);
  const session = sessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }

  // Renew expiration on active usage (15 min inactivity timeout)
  session.expiresAt = Date.now() + 15 * 60 * 1000;
  (req as any).user = session;
  next();
}

function requireExaminer(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthSession;
  if (!user || user.role !== 'examiner') {
    return res.status(403).json({ error: 'Forbidden: Examiner access required' });
  }
  next();
}

function requireStudent(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthSession;
  if (!user || user.role !== 'student') {
    return res.status(403).json({ error: 'Forbidden: Student access required' });
  }
  next();
}

// Helper to compute overall examiner statistics
function computeExaminerStats(students: StudentRecord[], isPublished: boolean, publishedAt: string | null): ExaminerStats {
  const totalStudents = students.length;
  let marksEnteredCount = 0;
  let passCount = 0;
  let failCount = 0;
  let totalPercentageSum = 0;
  let highestPercentage = 0;
  let topScorer: { name: string; registerNumber: string; percentage: number } | null = null;

  const subjectSums = {
    english: 0,
    mathematics: 0,
    science: 0,
    socialScience: 0,
    computerScience: 0,
  };

  students.forEach((st) => {
    if (st.marks) {
      marksEnteredCount++;
      const res = calculateStudentResult(st.id, st.name, st.registerNumber, st.marks);
      if (res.percentage !== null) {
        totalPercentageSum += res.percentage;
        if (res.percentage > highestPercentage) {
          highestPercentage = res.percentage;
          topScorer = {
            name: st.name,
            registerNumber: st.registerNumber,
            percentage: res.percentage,
          };
        }
      }
      if (res.status === 'PASSED') {
        passCount++;
      } else if (res.status === 'FAILED') {
        failCount++;
      }

      subjectSums.english += st.marks.english;
      subjectSums.mathematics += st.marks.mathematics;
      subjectSums.science += st.marks.science;
      subjectSums.socialScience += st.marks.socialScience;
      subjectSums.computerScience += st.marks.computerScience;
    }
  });

  const pendingMarksCount = totalStudents - marksEnteredCount;
  const averagePercentage = marksEnteredCount > 0 ? Number((totalPercentageSum / marksEnteredCount).toFixed(2)) : 0;
  const passPercentage = marksEnteredCount > 0 ? Number(((passCount / marksEnteredCount) * 100).toFixed(2)) : 0;

  return {
    totalStudents,
    marksEnteredCount,
    pendingMarksCount,
    isPublished,
    publishedAt,
    passCount,
    failCount,
    passPercentage,
    averagePercentage,
    highestPercentage,
    topScorer,
    subjectAverages: {
      english: marksEnteredCount > 0 ? Number((subjectSums.english / marksEnteredCount).toFixed(1)) : 0,
      mathematics: marksEnteredCount > 0 ? Number((subjectSums.mathematics / marksEnteredCount).toFixed(1)) : 0,
      science: marksEnteredCount > 0 ? Number((subjectSums.science / marksEnteredCount).toFixed(1)) : 0,
      socialScience: marksEnteredCount > 0 ? Number((subjectSums.socialScience / marksEnteredCount).toFixed(1)) : 0,
      computerScience: marksEnteredCount > 0 ? Number((subjectSums.computerScience / marksEnteredCount).toFixed(1)) : 0,
    },
  };
}

// ----------------- API ROUTES -----------------

// 1. System Status (Public)
app.get('/api/system/status', (req: Request, res: Response) => {
  res.json({
    universityName: db.university.universityName,
    title: db.university.title,
    location: db.university.location,
    academicYear: db.university.academicYear,
    examinationSession: db.university.examinationSession,
    isPublished: db.university.isPublished,
    publishedAt: db.university.publishedAt,
    totalStudents: db.students.length,
    examinerUsername: EXAMINER_USERNAME,
  });
});

// 2. Authentication Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { role, username, password } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  const cleanUser = String(username).trim();
  const cleanPass = String(password).trim();

  if (role === 'examiner') {
    if (cleanUser.toLowerCase() !== db.examiner.username.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid Examiner username' });
    }

    const computedHash = hashPassword(cleanPass, db.examiner.salt);
    if (computedHash !== db.examiner.passwordHash) {
      return res.status(401).json({ error: 'Invalid Examiner password' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const session: AuthSession = {
      token,
      role: 'examiner',
      user: {
        id: db.examiner.id,
        name: db.examiner.name,
        username: db.examiner.username,
      },
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins inactivity
    };

    sessions.set(token, session);
    return res.json({ session });
  } else if (role === 'student') {
    // Student Login: Username = Student Name, Password = Register Number
    const student = db.students.find(
      (s) =>
        s.name.toLowerCase() === cleanUser.toLowerCase() &&
        s.registerNumber.toUpperCase() === cleanPass.toUpperCase()
    );

    if (!student) {
      return res.status(401).json({
        error: 'Invalid student credentials. Please enter your Student Name and Register Number.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const session: AuthSession = {
      token,
      role: 'student',
      user: {
        id: student.id,
        name: student.name,
        registerNumber: student.registerNumber,
      },
      expiresAt: Date.now() + 15 * 60 * 1000,
    };

    sessions.set(token, session);
    return res.json({ session });
  }

  return res.status(400).json({ error: 'Invalid role' });
});

// 3. Current User Profile
app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
  const session = (req as any).user as AuthSession;
  res.json({ session });
});

// 4. Logout
app.post('/api/auth/logout', authenticate, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    sessions.delete(authHeader.substring(7));
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// 5. Examiner - Get All Students & Statistics
app.get('/api/examiner/students', authenticate, requireExaminer, (req: Request, res: Response) => {
  const studentResults: StudentResult[] = db.students.map((st) =>
    calculateStudentResult(st.id, st.name, st.registerNumber, st.marks, st.updatedAt)
  );

  const stats = computeExaminerStats(db.students, db.university.isPublished, db.university.publishedAt);

  res.json({
    students: studentResults,
    stats,
    university: db.university,
  });
});

// 6. Examiner - Add / Edit Student Marks
app.post('/api/examiner/marks', authenticate, requireExaminer, (req: Request, res: Response) => {
  const { studentId, english, mathematics, science, socialScience, computerScience } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  const student = db.students.find((s) => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const parsedMarks: SubjectMarks = {
    english: Math.min(100, Math.max(0, Math.round(Number(english)))),
    mathematics: Math.min(100, Math.max(0, Math.round(Number(mathematics)))),
    science: Math.min(100, Math.max(0, Math.round(Number(science)))),
    socialScience: Math.min(100, Math.max(0, Math.round(Number(socialScience)))),
    computerScience: Math.min(100, Math.max(0, Math.round(Number(computerScience)))),
  };

  // Validate all are numbers between 0 and 100
  for (const [key, val] of Object.entries(parsedMarks)) {
    if (isNaN(val) || val < 0 || val > 100) {
      return res.status(400).json({ error: `Invalid mark for ${key}. Must be between 0 and 100.` });
    }
  }

  student.marks = parsedMarks;
  student.updatedAt = new Date().toISOString();
  saveDatabase(db);

  const updatedResult = calculateStudentResult(
    student.id,
    student.name,
    student.registerNumber,
    student.marks,
    student.updatedAt
  );

  const stats = computeExaminerStats(db.students, db.university.isPublished, db.university.publishedAt);

  res.json({
    success: true,
    student: updatedResult,
    stats,
  });
});

// 7. Examiner - Clear / Delete Marks
app.delete('/api/examiner/marks/:studentId', authenticate, requireExaminer, (req: Request, res: Response) => {
  const { studentId } = req.params;
  const student = db.students.find((s) => s.id === studentId);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  student.marks = null;
  student.updatedAt = new Date().toISOString();
  saveDatabase(db);

  const updatedResult = calculateStudentResult(student.id, student.name, student.registerNumber, null, student.updatedAt);
  const stats = computeExaminerStats(db.students, db.university.isPublished, db.university.publishedAt);

  res.json({
    success: true,
    message: `Marks cleared for ${student.name}`,
    student: updatedResult,
    stats,
  });
});

// 8. Examiner - Publish / Unpublish Results
app.post('/api/examiner/publish', authenticate, requireExaminer, (req: Request, res: Response) => {
  const { publish } = req.body;
  const isPublished = Boolean(publish);

  db.university.isPublished = isPublished;
  db.university.publishedAt = isPublished ? new Date().toISOString() : null;
  saveDatabase(db);

  const stats = computeExaminerStats(db.students, db.university.isPublished, db.university.publishedAt);

  res.json({
    success: true,
    isPublished: db.university.isPublished,
    publishedAt: db.university.publishedAt,
    stats,
    message: isPublished
      ? 'Results published successfully! Students can now view their marks.'
      : 'Results unpublished. Students will see "Result Not Published Yet."',
  });
});

// 9. Examiner - Load Demo Marks / Reset All Marks (For testing convenience)
app.post('/api/examiner/sample-marks', authenticate, requireExaminer, (req: Request, res: Response) => {
  const { action } = req.body;

  if (action === 'reset') {
    db.students.forEach((s) => {
      s.marks = null;
      s.updatedAt = null;
    });
    db.university.isPublished = false;
    db.university.publishedAt = null;
    saveDatabase(db);
    return res.json({
      success: true,
      message: 'All marks have been reset to blank. Results unpublished.',
      stats: computeExaminerStats(db.students, false, null),
    });
  }

  // Realistic sample marks array
  const sampleData: SubjectMarks[] = [
    { english: 92, mathematics: 95, science: 94, socialScience: 88, computerScience: 96 }, // Anu (A+)
    { english: 85, mathematics: 78, science: 82, socialScience: 80, computerScience: 88 }, // Manu (A)
    { english: 74, mathematics: 81, science: 76, socialScience: 72, computerScience: 79 }, // Sanu (B+)
    { english: 62, mathematics: 68, science: 65, socialScience: 60, computerScience: 71 }, // Fanu (B)
    { english: 55, mathematics: 52, science: 58, socialScience: 54, computerScience: 59 }, // Minu (C)
    { english: 45, mathematics: 48, science: 42, socialScience: 46, computerScience: 44 }, // Ninu (D)
    { english: 35, mathematics: 72, science: 65, socialScience: 58, computerScience: 64 }, // Lalu (Fail: Eng 35)
    { english: 88, mathematics: 92, science: 90, socialScience: 86, computerScience: 94 }, // Shalu (A)
    { english: 78, mathematics: 85, science: 80, socialScience: 75, computerScience: 82 }, // Ponnu (B+)
    { english: 95, mathematics: 98, science: 96, socialScience: 92, computerScience: 99 }, // Minnu (A+ Topper)
    { english: 66, mathematics: 70, science: 64, socialScience: 62, computerScience: 68 }, // Chinnu (B)
    { english: 50, mathematics: 45, science: 52, socialScience: 48, computerScience: 54 }, // Kunju (C)
    { english: 90, mathematics: 88, science: 92, socialScience: 85, computerScience: 91 }, // Sara (A+)
    { english: 42, mathematics: 38, science: 45, socialScience: 40, computerScience: 46 }, // Liya (Fail: Math 38)
    { english: 82, mathematics: 86, science: 84, socialScience: 79, computerScience: 85 }, // Mia (A)
  ];

  db.students.forEach((s, idx) => {
    s.marks = sampleData[idx] || { english: 75, mathematics: 75, science: 75, socialScience: 75, computerScience: 75 };
    s.updatedAt = new Date().toISOString();
  });

  saveDatabase(db);
  const stats = computeExaminerStats(db.students, db.university.isPublished, db.university.publishedAt);

  res.json({
    success: true,
    message: 'Sample marks populated successfully for evaluation.',
    stats,
  });
});

// 10. Student - View Own Result (Role-Based Access: Student views ONLY own result)
app.get('/api/student/result', authenticate, requireStudent, (req: Request, res: Response) => {
  const session = (req as any).user as AuthSession;
  const student = db.students.find((s) => s.id === session.user.id);

  if (!student) {
    return res.status(404).json({ error: 'Student record not found' });
  }

  // Check if results are published
  if (!db.university.isPublished) {
    return res.json({
      isPublished: false,
      message: 'Result Not Published Yet.',
      student: {
        name: student.name,
        registerNumber: student.registerNumber,
      },
      university: {
        universityName: db.university.universityName,
        title: db.university.title,
        academicYear: db.university.academicYear,
        examinationSession: db.university.examinationSession,
      },
    });
  }

  // If published but marks are blank
  if (!student.marks) {
    return res.json({
      isPublished: true,
      hasMarks: false,
      message: 'Marks are currently under compilation. Please contact the examination department.',
      student: {
        name: student.name,
        registerNumber: student.registerNumber,
      },
      university: {
        universityName: db.university.universityName,
        title: db.university.title,
        academicYear: db.university.academicYear,
        examinationSession: db.university.examinationSession,
      },
    });
  }

  const result = calculateStudentResult(
    student.id,
    student.name,
    student.registerNumber,
    student.marks,
    student.updatedAt
  );

  return res.json({
    isPublished: true,
    hasMarks: true,
    result,
    university: {
      universityName: db.university.universityName,
      title: db.university.title,
      location: db.university.location,
      academicYear: db.university.academicYear,
      examinationSession: db.university.examinationSession,
      publishedAt: db.university.publishedAt,
    },
  });
});

// Start dev or production server
const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
