import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useTypingStore } from '../store/useTypingStore';
import { getLessonsByLanguage, getRandomTextForLevel } from '../data/typingLessons';
import type { TypingLesson, TypingLanguage } from '../types';
import KeyboardVisualizer from '../components/KeyboardVisualizer';
import './TypingPractice.css';

export default function TypingPractice() {
  const [selectedLanguage, setSelectedLanguage] = useState<TypingLanguage>('korean');
  const [lessons, setLessons] = useState<TypingLesson[]>([]);
  const [lastKoreanLesson, setLastKoreanLesson] = useState<TypingLesson | null>(null);
  const [lastEnglishLesson, setLastEnglishLesson] = useState<TypingLesson | null>(null);

  const {
    currentLesson,
    userInput,
    wpm,
    accuracy,
    isComplete,
    stats,
    setCurrentLesson,
    updateInput,
    recordMistake,
    resetTyping,
    loadProgress,
  } = useTypingStore();

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    const lessonList = getLessonsByLanguage(selectedLanguage);
    setLessons(lessonList);

    // 언어 전환 시 이전에 선택했던 레슨으로 복원
    if (lessonList.length > 0) {
      if (selectedLanguage === 'korean' && lastKoreanLesson) {
        // 한글로 전환 시 마지막 한글 레슨 복원
        const lesson = lessonList.find(l => l.id === lastKoreanLesson.id) || lessonList[0];
        const randomText = getRandomTextForLevel(lesson.language, lesson.level);
        setCurrentLesson(lesson, randomText);
      } else if (selectedLanguage === 'english' && lastEnglishLesson) {
        // 영어로 전환 시 마지막 영어 레슨 복원
        const lesson = lessonList.find(l => l.id === lastEnglishLesson.id) || lessonList[0];
        const randomText = getRandomTextForLevel(lesson.language, lesson.level);
        setCurrentLesson(lesson, randomText);
      } else if (!currentLesson || currentLesson.language !== selectedLanguage) {
        // 처음 선택하거나 언어가 다른 경우 첫 번째 레슨
        const lesson = lessonList[0];
        const randomText = getRandomTextForLevel(lesson.language, lesson.level);
        setCurrentLesson(lesson, randomText);
      }
    }
  }, [selectedLanguage]);

  // 완료 시 결과 표시
  useEffect(() => {
    if (isComplete && currentLesson) {
      const timer = setTimeout(async () => {
        const goalAchieved = wpm >= currentLesson.targetWPM && accuracy >= currentLesson.targetAccuracy;

        const result = await Swal.fire({
          title: goalAchieved ? '🎉 완료!' : '✅ 완료!',
          html: `
            <div style="text-align: center; padding: 1rem;">
              <div style="font-size: 1.2rem; color: #48bb78; margin-bottom: 1rem;">
                WPM: ${wpm} | 정확도: ${accuracy}%
              </div>
              <div style="font-size: 0.9rem; color: #a0aec0; margin-bottom: 1rem;">
                목표: WPM ${currentLesson.targetWPM} | 정확도 ${currentLesson.targetAccuracy}%
              </div>
              ${goalAchieved ? '<div style="font-size: 1.2rem; color: #667eea; font-weight: 700;">✨ 목표 달성! ✨</div>' : ''}
            </div>
          `,
          icon: goalAchieved ? 'success' : 'info',
          confirmButtonText: '확인',
          confirmButtonColor: '#667eea',
          showCancelButton: true,
          cancelButtonText: '다시 하기',
        });

        if (result.isDismissed) {
          // 다시 하기
          const randomText = getRandomTextForLevel(currentLesson.language, currentLesson.level);
          setCurrentLesson(currentLesson, randomText);
          resetTyping();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isComplete, currentLesson, wpm, accuracy, resetTyping, setCurrentLesson]);

  const handleLessonSelect = async (lesson: TypingLesson) => {
    // 선택한 레슨을 언어별로 저장
    if (lesson.language === 'korean') {
      setLastKoreanLesson(lesson);
    } else {
      setLastEnglishLesson(lesson);
    }

    // 랜덤 텍스트 생성
    const randomText = getRandomTextForLevel(lesson.language, lesson.level);
    setCurrentLesson(lesson, randomText);
    resetTyping();

    // 목표 표시
    await Swal.fire({
      title: '🎯 레슨 목표',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <h3 style="color: #667eea; margin-bottom: 1rem;">${lesson.title}</h3>
          <p style="color: #718096; margin-bottom: 1.5rem;">${lesson.description}</p>
          <div style="display: flex; gap: 2rem; justify-content: center; margin-top: 1.5rem;">
            <div style="text-align: center;">
              <div style="font-size: 0.875rem; color: #a0aec0; margin-bottom: 0.5rem;">목표 WPM</div>
              <div style="font-size: 2.5rem; font-weight: 700; color: #667eea;">${lesson.targetWPM}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 0.875rem; color: #a0aec0; margin-bottom: 0.5rem;">목표 정확도</div>
              <div style="font-size: 2.5rem; font-weight: 700; color: #667eea;">${lesson.targetAccuracy}%</div>
            </div>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '시작하기',
      confirmButtonColor: '#667eea',
      showCancelButton: true,
      cancelButtonText: '취소',
      width: '600px',
    });
  };

  // 한글 조합 상태 추적
  const [isComposing, setIsComposing] = useState(false);

  // Composition 이벤트 핸들러 (한글 입력)
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback((e: CompositionEvent) => {
    setIsComposing(false);
    if (!currentLesson || isComplete) return;

    const char = e.data;
    if (!char) return;

    // 입력 길이 체크
    if (userInput.length >= currentLesson.text.length) {
      return;
    }

    // 한글 모드인데 영어 레슨인 경우 체크
    const expectedChar = currentLesson.text[userInput.length];
    const isKoreanInput = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(char);
    const isKoreanExpected = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(expectedChar);

    if (isKoreanInput && !isKoreanExpected) {
      // 한글 입력했는데 영어가 필요한 경우
      Swal.fire({
        icon: 'warning',
        title: '⚠️ 한영키를 확인하세요',
        text: '영어로 입력해주세요!',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      recordMistake();
      return;
    }

    // 정확한 문자만 입력 허용
    if (char === expectedChar) {
      // 정확한 입력
      updateInput(userInput + char);
    } else {
      // 틀린 입력 - 오타 횟수만 증가
      recordMistake();
    }
  }, [currentLesson, isComplete, userInput, updateInput, recordMistake]);

  // 키보드 이벤트 핸들러 (영어 입력 및 Backspace)
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!currentLesson || isComplete) return;

    // 특수 키 무시
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    // Backspace 처리
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (userInput.length > 0) {
        updateInput(userInput.slice(0, -1));
        setLastInputLength(userInput.length - 1);
      }
      return;
    }

    // 한글 조합 중이면 무시
    if (isComposing) return;

    // 영어 입력만 처리 (한글은 composition 이벤트에서 처리)
    if (e.key.length === 1) {
      e.preventDefault();

      // 입력 길이 체크
      if (userInput.length >= currentLesson.text.length) {
        return;
      }

      const char = e.key;
      const expectedChar = currentLesson.text[userInput.length];

      // 영어 입력인데 한글이 필요한 경우 체크
      const isEnglishInput = /[a-zA-Z]/.test(char);
      const isKoreanExpected = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(expectedChar);

      if (isEnglishInput && isKoreanExpected) {
        // 영어 입력했는데 한글이 필요한 경우
        Swal.fire({
          icon: 'warning',
          title: '⚠️ 한영키를 확인하세요',
          text: '한글로 입력해주세요!',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        recordMistake();
        return;
      }

      // 정확한 문자만 입력 허용
      if (char === expectedChar) {
        // 정확한 입력
        updateInput(userInput + char);
      } else {
        // 틀린 입력 - 오타 횟수만 증가
        recordMistake();
      }
    }
  }, [currentLesson, isComplete, userInput, updateInput, recordMistake, isComposing]);

  // 키보드 및 Composition 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('compositionstart', handleCompositionStart as any);
    window.addEventListener('compositionend', handleCompositionEnd as any);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('compositionstart', handleCompositionStart as any);
      window.removeEventListener('compositionend', handleCompositionEnd as any);
    };
  }, [handleKeyPress, handleCompositionStart, handleCompositionEnd]);

  const handleLanguageChange = (language: TypingLanguage) => {
    setSelectedLanguage(language);
  };

  const renderText = () => {
    if (!currentLesson) return null;

    const text = currentLesson.text;
    const input = userInput;

    return (
      <div className="typing-text">
        {text.split('').map((char, index) => {
          let className = 'char';

          if (index < input.length) {
            className += input[index] === char ? ' correct' : ' incorrect';
          } else if (index === input.length) {
            className += ' current';
          }

          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="typing-practice">
      {/* Header */}
      <header className="typing-header">
        <div className="header-left">
          <Link to="/" className="home-button">
            🏠 홈으로
          </Link>
          <h1>⌨️ 타이핑 연습</h1>
        </div>
        <div className="language-selector">
          <button
            className={selectedLanguage === 'korean' ? 'active' : ''}
            onClick={() => handleLanguageChange('korean')}
          >
            한글
          </button>
          <button
            className={selectedLanguage === 'english' ? 'active' : ''}
            onClick={() => handleLanguageChange('english')}
          >
            English
          </button>
        </div>
      </header>

      <div className="typing-container">
        <div className="typing-content">
          {/* Sidebar - Lesson List */}
          <aside className="lesson-sidebar">
            <h3>레슨 선택</h3>
            <div className="lesson-list">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`lesson-item ${currentLesson?.id === lesson.id ? 'active' : ''}`}
                  onClick={() => handleLessonSelect(lesson)}
                >
                  <div className="lesson-level">Level {lesson.level}</div>
                  <div className="lesson-title">{lesson.title}</div>
                  <div className="lesson-description">{lesson.description}</div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Typing Area */}
          <main className="typing-main">
            {currentLesson && (
              <>
                {/* Text Display */}
                <div className="text-display">
                  {renderText()}
                </div>

                {/* Keyboard Visualizer */}
                <div className="keyboard-section">
                  <KeyboardVisualizer
                    language={selectedLanguage}
                    currentChar={currentLesson.text[userInput.length] || ''}
                  />
                </div>

                {/* Typing Instruction */}
                {!isComplete && (
                  <div className="typing-instruction">
                    ⌨️ 키보드로 바로 타이핑하세요
                  </div>
                )}

              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="typing-container">
          <p>© 2025 EduPy. 모든 학습 데이터는 브라우저에 안전하게 저장됩니다.</p>
          <p className="footer-made-by">Made by <a href="https://schoolworks.kr" target="_blank" rel="noopener noreferrer">schoolworks.kr</a></p>
        </div>
      </footer>
    </div>
  );
}

