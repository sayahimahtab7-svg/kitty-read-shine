import { create } from 'zustand';

export type UserRole = 'teacher' | 'student';

export interface Student {
  id: string;
  name: string;
  avatar: string;
}

export interface Activity {
  id: string;
  title: string;
  text: string;
  date: string;
  classId: string;
  type: 'reading-fluency';
}

export interface Submission {
  id: string;
  studentId: string;
  activityId: string;
  score: number | null;
  submittedAt: string | null;
  corrections: { word: string; correct: string }[];
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  icon: string;
  code: string;
  students: Student[];
}

export interface JournalEntry {
  id: string;
  studentId: string;
  activityId: string;
  submittedAt: string;
  score: number;
  comment?: string;
}

interface AppState {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  currentClassId: string | null;
  setCurrentClassId: (id: string | null) => void;
  classes: ClassRoom[];
  activities: Activity[];
  submissions: Submission[];
  journal: JournalEntry[];
  studentName: string;
  setStudentName: (name: string) => void;
  joinedClassId: string | null;
  setJoinedClassId: (id: string | null) => void;
  addClass: (c: ClassRoom) => void;
  addActivity: (a: Activity) => void;
  addSubmission: (s: Submission) => void;
  addJournalEntry: (j: JournalEntry) => void;
}

const mockStudents: Student[] = [
  { id: 's1', name: 'Amira Khan', avatar: 'A' },
  { id: 's2', name: 'Leo Chen', avatar: 'L' },
  { id: 's3', name: 'Sofia Rivera', avatar: 'S' },
  { id: 's4', name: 'Noah Williams', avatar: 'N' },
  { id: 's5', name: 'Zara Patel', avatar: 'Z' },
];

const mockClasses: ClassRoom[] = [
  { id: 'c1', name: 'Sunshine Readers', grade: 'Grade 2', icon: '🌞', code: 'SUN123', students: mockStudents },
  { id: 'c2', name: 'Star Explorers', grade: 'Grade 3', icon: '⭐', code: 'STAR456', students: mockStudents.slice(0, 3) },
];

const mockActivities: Activity[] = [
  { id: 'a1', title: 'The Little Red Hen', text: 'Once upon a time there was a little red hen who lived on a farm. One day she found some grains of wheat.', date: '2025-02-03', classId: 'c1', type: 'reading-fluency' },
  { id: 'a2', title: 'The Three Bears', text: 'Once upon a time there were three bears who lived in a house in the forest. There was a great big father bear.', date: '2025-02-10', classId: 'c1', type: 'reading-fluency' },
  { id: 'a3', title: 'Jack and Jill', text: 'Jack and Jill went up the hill to fetch a pail of water. Jack fell down and broke his crown.', date: '2025-02-17', classId: 'c1', type: 'reading-fluency' },
];

const mockSubmissions: Submission[] = [
  { id: 'sub1', studentId: 's1', activityId: 'a1', score: 94, submittedAt: '2025-02-03', corrections: [] },
  { id: 'sub2', studentId: 's2', activityId: 'a1', score: 100, submittedAt: '2025-02-03', corrections: [] },
  { id: 'sub3', studentId: 's3', activityId: 'a1', score: 88, submittedAt: '2025-02-04', corrections: [{ word: 'grains', correct: 'grains' }] },
  { id: 'sub4', studentId: 's1', activityId: 'a2', score: 97, submittedAt: '2025-02-10', corrections: [] },
  { id: 'sub5', studentId: 's2', activityId: 'a2', score: 92, submittedAt: '2025-02-11', corrections: [] },
  { id: 'sub6', studentId: 's4', activityId: 'a1', score: 100, submittedAt: '2025-02-03', corrections: [] },
  { id: 'sub7', studentId: 's5', activityId: 'a1', score: 85, submittedAt: '2025-02-04', corrections: [] },
  { id: 'sub8', studentId: 's3', activityId: 'a2', score: null, submittedAt: null, corrections: [] },
  { id: 'sub9', studentId: 's1', activityId: 'a3', score: 91, submittedAt: '2025-02-17', corrections: [] },
];

const mockJournal: JournalEntry[] = [
  { id: 'j1', studentId: 's1', activityId: 'a1', submittedAt: '2025-02-03T10:30:00', score: 94 },
  { id: 'j2', studentId: 's2', activityId: 'a1', submittedAt: '2025-02-03T11:00:00', score: 100, comment: 'Great job!' },
  { id: 'j3', studentId: 's3', activityId: 'a1', submittedAt: '2025-02-04T09:15:00', score: 88 },
  { id: 'j4', studentId: 's1', activityId: 'a2', submittedAt: '2025-02-10T10:00:00', score: 97 },
];

export const useAppStore = create<AppState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
  currentClassId: null,
  setCurrentClassId: (id) => set({ currentClassId: id }),
  classes: mockClasses,
  activities: mockActivities,
  submissions: mockSubmissions,
  journal: mockJournal,
  studentName: '',
  setStudentName: (name) => set({ studentName: name }),
  joinedClassId: null,
  setJoinedClassId: (id) => set({ joinedClassId: id }),
  addClass: (c) => set((state) => ({ classes: [...state.classes, c] })),
  addActivity: (a) => set((state) => ({ activities: [...state.activities, a] })),
  addSubmission: (s) => set((state) => ({ submissions: [...state.submissions, s] })),
  addJournalEntry: (j) => set((state) => ({ journal: [...state.journal, j] })),
}));
