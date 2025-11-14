import { create } from 'zustand';
import type { TypingProgress, TypingStats, TypingResult, TypingLesson } from '../types';
import { storageService } from '../services/storage';

interface TypingState {
  // Data
  progress: TypingProgress;
  stats: TypingStats;
  currentLesson: TypingLesson | null;

  // UI State
  isTyping: boolean;
  isComplete: boolean;
  currentText: string;
  userInput: string;
  startTime: number | null;
  mistakes: { [key: string]: number };
  mistakeCount: number;
  currentStage: number;
  totalStages: number;

  // Computed
  wpm: number;
  accuracy: number;

  // Actions
  loadProgress: () => void;
  setCurrentLesson: (lesson: TypingLesson, randomText?: string) => void;
  startTyping: () => void;
  updateInput: (input: string) => void;
  recordMistake: () => void;
  finishTyping: () => void;
  resetTyping: () => void;
  nextStage: (randomText: string) => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  // Initial State
  progress: { korean: [], english: [] },
  stats: {
    totalPractices: 0,
    averageWPM: 0,
    averageAccuracy: 0,
    bestWPM: 0,
    totalTimeSpent: 0,
    weakKeys: {},
  },
  currentLesson: null,
  isTyping: false,
  isComplete: false,
  currentText: '',
  userInput: '',
  startTime: null,
  mistakes: {},
  mistakeCount: 0,
  currentStage: 1,
  totalStages: 1,
  wpm: 0,
  accuracy: 100,

  // Actions
  loadProgress: () => {
    const progress = storageService.getTypingProgress();
    const stats = storageService.getTypingStats();
    set({ progress, stats });
  },

  setCurrentLesson: (lesson: TypingLesson, randomText?: string) => {
    set({
      currentLesson: lesson,
      currentText: randomText || lesson.text,
      userInput: '',
      mistakes: {},
      mistakeCount: 0,
      wpm: 0,
      accuracy: 100,
      isTyping: false,
      isComplete: false,
      startTime: null,
      currentStage: 1,
    });
  },

  startTyping: () => {
    set({
      isTyping: true,
      startTime: Date.now(),
      userInput: '',
      mistakes: {},
    });
  },

  updateInput: (input: string) => {
    const state = get();

    // Start typing on first character
    if (!state.isTyping && input.length > 0) {
      set({
        isTyping: true,
        startTime: Date.now(),
      });
    }

    const { currentText, startTime, mistakeCount } = state;

    // Calculate WPM
    let wpm = 0;
    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
      const wordsTyped = input.length / 5; // standard: 5 characters = 1 word
      wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
    }

    // Calculate accuracy - 정확한 입력 / (정확한 입력 + 오타 횟수)
    const totalKeyPresses = input.length + mistakeCount;
    const accuracy = totalKeyPresses > 0
      ? Math.round((input.length / totalKeyPresses) * 100)
      : 100;

    set({
      userInput: input,
      wpm,
      accuracy: Math.max(0, Math.min(100, accuracy)),
    });

    // Auto-finish when complete (exact match)
    if (input === currentText) {
      setTimeout(() => {
        get().finishTyping();
      }, 500);
    }
  },

  recordMistake: () => {
    const state = get();
    set({
      mistakeCount: state.mistakeCount + 1,
    });
  },

  finishTyping: () => {
    const state = get();

    if (!state.currentLesson || !state.startTime) return;

    const timeSpent = (Date.now() - state.startTime) / 1000; // seconds

    const result: TypingResult = {
      lessonId: state.currentLesson.id,
      language: state.currentLesson.language,
      wpm: state.wpm,
      accuracy: state.accuracy,
      completedAt: new Date().toISOString(),
      mistakes: state.mistakes,
      timeSpent,
    };

    // Save to localStorage
    storageService.saveTypingResult(result);

    // Reload progress and stats
    const progress = storageService.getTypingProgress();
    const stats = storageService.getTypingStats();

    set({
      progress,
      stats,
      isTyping: false,
      isComplete: true,
    });
  },

  resetTyping: () => {
    set({
      userInput: '',
      mistakes: {},
      mistakeCount: 0,
      wpm: 0,
      accuracy: 100,
      isTyping: false,
      isComplete: false,
      startTime: null,
      currentStage: 1,
    });
  },

  nextStage: (randomText: string) => {
    const state = get();
    const nextStageNum = state.currentStage + 1;

    set({
      currentText: randomText,
      userInput: '',
      mistakes: {},
      mistakeCount: 0,
      wpm: 0,
      accuracy: 100,
      isTyping: false,
      isComplete: false,
      startTime: null,
      currentStage: nextStageNum,
    });
  },
}));

