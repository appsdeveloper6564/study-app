
export type QuestionType = 'mcq' | 'true_false' | 'fill_blank' | 'short_answer';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // For MCQ
  correctAnswer: string | number; // Index for MCQ, string for others
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizAttempt {
  courseId: string; // Or quizId, keeping courseId for compatibility with QuizRunner
  answers: number[];
  score: number;
  completedAt: number;
}

export interface Quiz {
  id: string;
  chapterId?: string;
  title: string;
  questions: Question[];
  createdAt: number;
  sourceType: 'topic' | 'pdf' | 'manual' | 'text';
}

export interface Note {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  type: 'bullet' | 'long' | 'eli5' | 'formula' | 'mindmap';
  createdAt: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  createdAt: number;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: any[];
  completedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  username: string;
  voiceEnabled: boolean;
}

export interface BackupData {
  version: number;
  timestamp: number;
  subjects: Subject[];
  chapters: Chapter[];
  notes: Note[];
  quizzes: Quiz[];
  results: QuizResult[];
  chats: ChatSession[];
  messages: Record<string, ChatMessage[]>;
}

export interface AppState {
  subjects: Subject[];
  chapters: Record<string, Chapter[]>; // subjectId -> chapters
  quizzes: Quiz[]; // recent/all
  loading: boolean;
  refreshData: () => Promise<void>;
}
