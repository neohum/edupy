# 📦 LocalStorage 사용 가이드

## 개요

EduPy는 사용자 인증 없이 브라우저의 localStorage를 활용하여 모든 학습 데이터를 저장합니다. 이를 통해 회원가입 없이도 학습 진행도를 유지하고 이어서 학습할 수 있습니다.

## 📊 데이터 구조

### 1. 타이핑 진행도 (edupy_typing_progress)

```typescript
interface TypingProgress {
  korean: TypingRecord[];
  english: TypingRecord[];
}

interface TypingRecord {
  lessonId: string;
  wpm: number;
  accuracy: number;
  completedAt: string; // ISO 8601 format
  mistakes: string[]; // 틀린 글자들
  timeSpent: number; // 초 단위
}

// 예시
{
  "korean": [
    {
      "lessonId": "korean-basic-1",
      "wpm": 45,
      "accuracy": 92.5,
      "completedAt": "2025-01-15T10:30:00.000Z",
      "mistakes": ["ㅏ", "ㅓ"],
      "timeSpent": 120
    }
  ],
  "english": []
}
```

### 2. 타이핑 통계 (edupy_typing_stats)

```typescript
interface TypingStats {
  totalPractices: number;
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  bestAccuracy: number;
  totalTime: number; // 초 단위
  lastPracticeDate: string;
  weakKeys: { [key: string]: number }; // 키: 실수 횟수
}

// 예시
{
  "totalPractices": 15,
  "averageWpm": 42,
  "averageAccuracy": 90.5,
  "bestWpm": 55,
  "bestAccuracy": 98.2,
  "totalTime": 1800,
  "lastPracticeDate": "2025-01-15T10:30:00.000Z",
  "weakKeys": {
    "ㅏ": 5,
    "ㅓ": 3
  }
}
```

### 3. 파이썬 학습 진행도 (edupy_python_progress)

```typescript
interface PythonProgress {
  completedLessons: string[]; // lesson IDs
  lessonScores: {
    [lessonId: string]: LessonScore;
  };
  currentLesson: string; // 현재 학습 중인 레슨 ID
}

interface LessonScore {
  score: number;
  completed: boolean;
  lastCode: string;
  completedAt: string;
  attempts: number;
}

// 예시
{
  "completedLessons": ["python-basic-1", "python-basic-2"],
  "lessonScores": {
    "python-basic-1": {
      "score": 100,
      "completed": true,
      "lastCode": "print('Hello, World!')",
      "completedAt": "2025-01-14T15:20:00.000Z",
      "attempts": 2
    }
  },
  "currentLesson": "python-basic-3"
}
```

### 4. 파이썬 저장된 코드 (edupy_python_saved_codes)

```typescript
interface SavedCode {
  id: string; // UUID
  title: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// 예시
[
  {
    "id": "abc-123-def",
    "title": "내 첫 번째 프로그램",
    "code": "print('Hello, World!')\nprint('Python is fun!')",
    "createdAt": "2025-01-14T15:20:00.000Z",
    "updatedAt": "2025-01-14T15:25:00.000Z",
    "tags": ["basic", "print"]
  }
]
```

### 5. 파이게임 프로젝트 (edupy_pygame_projects)

```typescript
interface PygameProject {
  id: string; // UUID
  title: string;
  description: string;
  code: string; // main.py 코드
  files?: {
    [filename: string]: string; // 추가 파일들
  };
  createdAt: string;
  updatedAt: string;
  thumbnail?: string; // Base64 이미지 (선택)
}

// 예시
[
  {
    "id": "project-123",
    "title": "내 첫 게임",
    "description": "간단한 뱀 게임",
    "code": "import pygame\n...",
    "files": {
      "config.py": "WIDTH = 800\nHEIGHT = 600"
    },
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T11:30:00.000Z"
  }
]
```

### 6. 파이게임 진행도 (edupy_pygame_progress)

```typescript
interface PygameProgress {
  completedTutorials: string[];
  currentTutorial: string;
  tutorialScores: {
    [tutorialId: string]: {
      completed: boolean;
      completedAt: string;
    };
  };
}
```

### 7. 앱 설정 (edupy_settings)

```typescript
interface Settings {
  theme: 'light' | 'dark';
  fontSize: number; // 12-24
  editorTheme: string; // 'vs-dark', 'vs-light', etc.
  soundEnabled: boolean;
  autoSave: boolean;
  language: 'ko' | 'en';
}

// 기본값
{
  "theme": "light",
  "fontSize": 14,
  "editorTheme": "vs-dark",
  "soundEnabled": true,
  "autoSave": true,
  "language": "ko"
}
```

## 🔧 구현 예시

### StorageService 클래스

```typescript
// services/storage.ts

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // 타이핑 진행도
  saveTypingProgress(language: 'korean' | 'english', record: TypingRecord): void {
    const key = 'edupy_typing_progress';
    const data = this.get<TypingProgress>(key) || { korean: [], english: [] };
    data[language].push(record);
    this.set(key, data);
    this.updateTypingStats(record);
  }

  getTypingProgress(): TypingProgress {
    return this.get<TypingProgress>('edupy_typing_progress') || { korean: [], english: [] };
  }

  private updateTypingStats(record: TypingRecord): void {
    const key = 'edupy_typing_stats';
    const stats = this.get<TypingStats>(key) || this.getDefaultStats();
    
    stats.totalPractices++;
    stats.totalTime += record.timeSpent;
    stats.lastPracticeDate = record.completedAt;
    
    // 평균 계산
    const allRecords = [...this.getTypingProgress().korean, ...this.getTypingProgress().english];
    stats.averageWpm = allRecords.reduce((sum, r) => sum + r.wpm, 0) / allRecords.length;
    stats.averageAccuracy = allRecords.reduce((sum, r) => sum + r.accuracy, 0) / allRecords.length;
    
    // 최고 기록
    if (record.wpm > stats.bestWpm) stats.bestWpm = record.wpm;
    if (record.accuracy > stats.bestAccuracy) stats.bestAccuracy = record.accuracy;
    
    // 취약 키 업데이트
    record.mistakes.forEach(key => {
      stats.weakKeys[key] = (stats.weakKeys[key] || 0) + 1;
    });
    
    this.set(key, stats);
  }

  // 파이썬 진행도
  savePythonLessonProgress(lessonId: string, score: LessonScore): void {
    const key = 'edupy_python_progress';
    const data = this.get<PythonProgress>(key) || {
      completedLessons: [],
      lessonScores: {},
      currentLesson: ''
    };
    
    data.lessonScores[lessonId] = score;
    if (score.completed && !data.completedLessons.includes(lessonId)) {
      data.completedLessons.push(lessonId);
    }
    
    this.set(key, data);
  }

  // 코드 저장
  saveCode(title: string, code: string): SavedCode {
    const key = 'edupy_python_saved_codes';
    const codes = this.get<SavedCode[]>(key) || [];
    
    const newCode: SavedCode = {
      id: this.generateId(),
      title,
      code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    codes.push(newCode);
    this.set(key, codes);
    return newCode;
  }

  // 데이터 내보내기
  exportAllData(): string {
    const allData: { [key: string]: any } = {};
    const keys = [
      'edupy_typing_progress',
      'edupy_typing_stats',
      'edupy_python_progress',
      'edupy_python_saved_codes',
      'edupy_pygame_projects',
      'edupy_pygame_progress',
      'edupy_settings'
    ];
    
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        allData[key] = JSON.parse(data);
      }
    });
    
    return JSON.stringify(allData, null, 2);
  }

  // 데이터 가져오기
  importAllData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      Object.keys(data).forEach(key => {
        this.set(key, data[key]);
      });
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }

  // 모든 데이터 삭제
  clearAllData(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('edupy_'));
    keys.forEach(key => localStorage.removeItem(key));
  }

  // 헬퍼 메서드
  private get<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  private set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultStats(): TypingStats {
    return {
      totalPractices: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      totalTime: 0,
      lastPracticeDate: '',
      weakKeys: {}
    };
  }
}

export default StorageService.getInstance();
```

## 🔄 Zustand Store 통합

```typescript
// store/useTypingStore.ts

import { create } from 'zustand';
import storageService from '@/services/storage';

interface TypingStore {
  progress: TypingProgress;
  stats: TypingStats;
  currentLesson: Lesson | null;
  
  loadProgress: () => void;
  saveProgress: (language: 'korean' | 'english', record: TypingRecord) => void;
  setCurrentLesson: (lesson: Lesson) => void;
}

export const useTypingStore = create<TypingStore>((set) => ({
  progress: { korean: [], english: [] },
  stats: storageService.get<TypingStats>('edupy_typing_stats') || {},
  currentLesson: null,
  
  loadProgress: () => {
    const progress = storageService.getTypingProgress();
    const stats = storageService.get<TypingStats>('edupy_typing_stats');
    set({ progress, stats });
  },
  
  saveProgress: (language, record) => {
    storageService.saveTypingProgress(language, record);
    const progress = storageService.getTypingProgress();
    const stats = storageService.get<TypingStats>('edupy_typing_stats');
    set({ progress, stats });
  },
  
  setCurrentLesson: (lesson) => set({ currentLesson: lesson })
}));
```

## 💡 사용 예시

### 컴포넌트에서 사용

```typescript
// components/TypingPractice.tsx

import { useTypingStore } from '@/store/useTypingStore';
import { useEffect } from 'react';

function TypingPractice() {
  const { progress, stats, loadProgress, saveProgress } = useTypingStore();
  
  useEffect(() => {
    // 컴포넌트 마운트 시 진행도 로드
    loadProgress();
  }, []);
  
  const handleComplete = (result: TypingResult) => {
    const record: TypingRecord = {
      lessonId: 'korean-basic-1',
      wpm: result.wpm,
      accuracy: result.accuracy,
      completedAt: new Date().toISOString(),
      mistakes: result.mistakes,
      timeSpent: result.timeSpent
    };
    
    saveProgress('korean', record);
  };
  
  return (
    <div>
      <h2>타이핑 연습</h2>
      <p>평균 WPM: {stats?.averageWpm || 0}</p>
      <p>최고 WPM: {stats?.bestWpm || 0}</p>
      {/* ... */}
    </div>
  );
}
```

## 🔒 주의사항

### 1. 데이터 크기 제한
- localStorage는 브라우저당 약 5-10MB 제한
- 큰 이미지나 파일은 저장하지 않기
- 필요시 IndexedDB 사용 고려

### 2. 데이터 손실 방지
- 정기적으로 데이터 내보내기 권장
- 브라우저 캐시 삭제 시 데이터 손실 가능
- 중요한 프로젝트는 백업 필수

### 3. 보안
- 민감한 정보는 저장하지 않기
- localStorage는 암호화되지 않음
- XSS 공격에 취약할 수 있음

### 4. 브라우저 호환성
- 모든 모던 브라우저 지원
- 시크릿 모드에서는 제한적
- 쿠키 차단 시 작동하지 않을 수 있음

## 📤 데이터 내보내기/가져오기 UI

```typescript
// components/DataManagement.tsx

import storageService from '@/services/storage';

function DataManagement() {
  const handleExport = () => {
    const data = storageService.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edupy-backup-${new Date().toISOString()}.json`;
    a.click();
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        storageService.importAllData(data);
        alert('데이터를 성공적으로 가져왔습니다!');
        window.location.reload();
      } catch (error) {
        alert('데이터 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <div>
      <button onClick={handleExport}>데이터 내보내기</button>
      <input type="file" accept=".json" onChange={handleImport} />
    </div>
  );
}
```
