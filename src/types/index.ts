export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points?: number;
  submissionInstructions?: string;
}

export interface LectureResource {
  id: string;
  title: string;
  url?: string;
  type: 'slides' | 'reading' | 'code' | 'video';
}

export interface Lecture {
  id: string;
  courseCode: string;
  subject: string;
  title: string;
  date: string; // YYYY-MM-DD
  instructor: string;
  room?: string;
  topicsCovered: string[];
  notes: string;
  assignments: Assignment[];
  resources?: LectureResource[];
  createdAt: string;
  updatedAt: string;
}

export type CatchUpStatus = 'to-review' | 'in-progress' | 'mastered';
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface CatchUpItem {
  id: string;
  lectureId: string;
  courseCode: string;
  subject: string;
  lectureTitle: string;
  topic: string;
  lectureDate: string;
  status: CatchUpStatus;
  targetDate?: string;
  priority: PriorityLevel;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type UserRole = 'student' | 'faculty';

export type ActiveTab = 'lectures' | 'planner' | 'tutor' | 'faculty-manage';
