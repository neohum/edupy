import { useState, useEffect, useCallback } from 'react';

/**
 * LocalStorage를 사용하는 커스텀 훅
 * @param key - LocalStorage 키
 * @param initialValue - 초기값
 * @returns [value, setValue] - 상태값과 setter 함수
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // 초기값 로드
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // 값이 변경될 때마다 LocalStorage에 저장
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

/**
 * 진행 상황 관리 훅
 */
export function useProgress() {
  const getInitialProgress = () => {
    try {
      const saved = localStorage.getItem('edupy_python_progress');
      if (saved) {
        const { levelIndex, activityIndex } = JSON.parse(saved);
        return {
          levelIndex: levelIndex || 0,
          activityIndex: activityIndex || 0,
        };
      }
    } catch (error) {
      console.error('진행 상황 불러오기 실패:', error);
    }
    return { levelIndex: 0, activityIndex: 0 };
  };

  const [progress, setProgress] = useLocalStorage('edupy_python_progress', getInitialProgress());

  const updateProgress = useCallback((levelIndex: number, activityIndex: number) => {
    setProgress({ levelIndex, activityIndex });
  }, [setProgress]);

  const resetProgress = useCallback(() => {
    setProgress({ levelIndex: 0, activityIndex: 0 });
  }, [setProgress]);

  return { progress, updateProgress, resetProgress };
}

/**
 * 완료된 활동 관리 훅
 */
export function useCompletedActivities() {
  const getInitialCompleted = () => {
    try {
      const saved = localStorage.getItem('edupy_python_completed');
      if (saved) {
        return new Set<string>(JSON.parse(saved));
      }
    } catch (error) {
      console.error('완료 목록 불러오기 실패:', error);
    }
    return new Set<string>();
  };

  const [completedActivities, setCompletedActivities] = useState<Set<string>>(getInitialCompleted());

  // Set을 배열로 변환하여 저장
  useEffect(() => {
    try {
      localStorage.setItem('edupy_python_completed', JSON.stringify(Array.from(completedActivities)));
    } catch (error) {
      console.error('완료 목록 저장 실패:', error);
    }
  }, [completedActivities]);

  const markAsCompleted = useCallback((activityId: string) => {
    setCompletedActivities(prev => {
      if (prev.has(activityId)) {
        return prev;
      }
      return new Set([...prev, activityId]);
    });
  }, []);

  const resetCompleted = useCallback(() => {
    setCompletedActivities(new Set<string>());
    localStorage.removeItem('edupy_python_completed');
  }, []);

  return { completedActivities, markAsCompleted, resetCompleted };
}

