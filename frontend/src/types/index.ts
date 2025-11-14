// ============================================
// Typing Practice Types
// ============================================

export type TypingLanguage = 'korean' | 'english';

export interface TypingLesson {
  id: string;
  language: TypingLanguage;
  level: number;
  title: string;
  description: string;
  text: string;
  targetWPM: number;
  targetAccuracy: number;
}

export interface TypingResult {
  lessonId: string;
  language: TypingLanguage;
  wpm: number;
  accuracy: number;
  completedAt: string;
  mistakes: { [key: string]: number };
  timeSpent: number; // seconds
}

export interface TypingStats {
  totalPractices: number;
  averageWPM: number;
  averageAccuracy: number;
  bestWPM: number;
  totalTimeSpent: number; // seconds
  weakKeys: { [key: string]: number };
}

export interface TypingProgress {
  korean: TypingResult[];
  english: TypingResult[];
}

// ============================================
// Python Learning Types
// ============================================

export interface PythonLesson {
  id: string;
  title: string;
  description: string;
  level: number;
  content: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  question: string;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface LessonScore {
  score: number;
  completed: boolean;
  lastCode: string;
  completedAt: string;
}

export interface PythonProgress {
  completedLessons: string[];
  lessonScores: { [lessonId: string]: LessonScore };
  currentLesson: string;
}

export interface SavedCode {
  id: string;
  title: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Pygame Types
// ============================================

export interface PygameProject {
  id: string;
  title: string;
  description: string;
  code: string;
  files: { [filename: string]: string };
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

export interface PygameTutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
}

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  code: string;
  completed: boolean;
}

export interface PygameProgress {
  completedTutorials: string[];
  currentTutorial: string;
  currentStep: number;
}

// ============================================
// Settings Types
// ============================================

export interface AppSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  soundEnabled: boolean;
  language: 'ko' | 'en';
}

// ============================================
// LocalStorage Keys
// ============================================

export const STORAGE_KEYS = {
  TYPING_PROGRESS: 'edupy_typing_progress',
  TYPING_STATS: 'edupy_typing_stats',
  PYTHON_PROGRESS: 'edupy_python_progress',
  PYTHON_SAVED_CODES: 'edupy_python_saved_codes',
  PYGAME_PROJECTS: 'edupy_pygame_projects',
  PYGAME_PROGRESS: 'edupy_pygame_progress',
  SETTINGS: 'edupy_settings',
} as const;

// Export all types explicitly
export type { TypingLanguage, TypingLesson, TypingResult, TypingStats, TypingProgress };

