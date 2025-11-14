import type {
  TypingProgress,
  TypingStats,
  TypingResult,
  PythonProgress,
  SavedCode,
  PygameProject,
  PygameProgress,
  AppSettings,
} from '../types';
import { STORAGE_KEYS } from '../types';

class StorageService {
  // ============================================
  // Generic Storage Methods
  // ============================================

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  }

  // ============================================
  // Typing Progress Methods
  // ============================================

  getTypingProgress(): TypingProgress {
    return this.getItem<TypingProgress>(STORAGE_KEYS.TYPING_PROGRESS, {
      korean: [],
      english: [],
    });
  }

  saveTypingResult(result: TypingResult): void {
    const progress = this.getTypingProgress();
    progress[result.language].push(result);
    this.setItem(STORAGE_KEYS.TYPING_PROGRESS, progress);
    
    // Update stats
    this.updateTypingStats(result);
  }

  getTypingStats(): TypingStats {
    return this.getItem<TypingStats>(STORAGE_KEYS.TYPING_STATS, {
      totalPractices: 0,
      averageWPM: 0,
      averageAccuracy: 0,
      bestWPM: 0,
      totalTimeSpent: 0,
      weakKeys: {},
    });
  }

  private updateTypingStats(result: TypingResult): void {
    const stats = this.getTypingStats();
    
    stats.totalPractices += 1;
    stats.totalTimeSpent += result.timeSpent;
    stats.bestWPM = Math.max(stats.bestWPM, result.wpm);
    
    // Calculate new averages
    const progress = this.getTypingProgress();
    const allResults = [...progress.korean, ...progress.english];
    
    stats.averageWPM = allResults.reduce((sum, r) => sum + r.wpm, 0) / allResults.length;
    stats.averageAccuracy = allResults.reduce((sum, r) => sum + r.accuracy, 0) / allResults.length;
    
    // Update weak keys
    Object.entries(result.mistakes).forEach(([key, count]) => {
      stats.weakKeys[key] = (stats.weakKeys[key] || 0) + count;
    });
    
    this.setItem(STORAGE_KEYS.TYPING_STATS, stats);
  }

  // ============================================
  // Python Progress Methods
  // ============================================

  getPythonProgress(): PythonProgress {
    return this.getItem<PythonProgress>(STORAGE_KEYS.PYTHON_PROGRESS, {
      completedLessons: [],
      lessonScores: {},
      currentLesson: '',
    });
  }

  savePythonProgress(progress: PythonProgress): void {
    this.setItem(STORAGE_KEYS.PYTHON_PROGRESS, progress);
  }

  getSavedCodes(): SavedCode[] {
    return this.getItem<SavedCode[]>(STORAGE_KEYS.PYTHON_SAVED_CODES, []);
  }

  saveCode(code: SavedCode): void {
    const codes = this.getSavedCodes();
    const existingIndex = codes.findIndex(c => c.id === code.id);
    
    if (existingIndex >= 0) {
      codes[existingIndex] = code;
    } else {
      codes.push(code);
    }
    
    this.setItem(STORAGE_KEYS.PYTHON_SAVED_CODES, codes);
  }

  deleteCode(id: string): void {
    const codes = this.getSavedCodes().filter(c => c.id !== id);
    this.setItem(STORAGE_KEYS.PYTHON_SAVED_CODES, codes);
  }

  // ============================================
  // Pygame Methods
  // ============================================

  getPygameProjects(): PygameProject[] {
    return this.getItem<PygameProject[]>(STORAGE_KEYS.PYGAME_PROJECTS, []);
  }

  savePygameProject(project: PygameProject): void {
    const projects = this.getPygameProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    
    this.setItem(STORAGE_KEYS.PYGAME_PROJECTS, projects);
  }

  deletePygameProject(id: string): void {
    const projects = this.getPygameProjects().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PYGAME_PROJECTS, projects);
  }

  getPygameProgress(): PygameProgress {
    return this.getItem<PygameProgress>(STORAGE_KEYS.PYGAME_PROGRESS, {
      completedTutorials: [],
      currentTutorial: '',
      currentStep: 0,
    });
  }

  savePygameProgress(progress: PygameProgress): void {
    this.setItem(STORAGE_KEYS.PYGAME_PROGRESS, progress);
  }

  // ============================================
  // Settings Methods
  // ============================================

  getSettings(): AppSettings {
    return this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS, {
      theme: 'light',
      fontSize: 14,
      soundEnabled: true,
      language: 'ko',
    });
  }

  saveSettings(settings: AppSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // ============================================
  // Export/Import Methods
  // ============================================

  exportAllData(): string {
    const data = {
      typingProgress: this.getTypingProgress(),
      typingStats: this.getTypingStats(),
      pythonProgress: this.getPythonProgress(),
      savedCodes: this.getSavedCodes(),
      pygameProjects: this.getPygameProjects(),
      pygameProgress: this.getPygameProgress(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);

      if (data.typingProgress) this.setItem(STORAGE_KEYS.TYPING_PROGRESS, data.typingProgress);
      if (data.typingStats) this.setItem(STORAGE_KEYS.TYPING_STATS, data.typingStats);
      if (data.pythonProgress) this.setItem(STORAGE_KEYS.PYTHON_PROGRESS, data.pythonProgress);
      if (data.savedCodes) this.setItem(STORAGE_KEYS.PYTHON_SAVED_CODES, data.savedCodes);
      if (data.pygameProjects) this.setItem(STORAGE_KEYS.PYGAME_PROJECTS, data.pygameProjects);
      if (data.pygameProgress) this.setItem(STORAGE_KEYS.PYGAME_PROGRESS, data.pygameProgress);
      if (data.settings) this.setItem(STORAGE_KEYS.SETTINGS, data.settings);

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const storageService = new StorageService();
export default storageService;

