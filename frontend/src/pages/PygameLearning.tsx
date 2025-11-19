import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import Joyride from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';
import Swal from 'sweetalert2';
import { pygameCurriculum, conceptExplanations } from '../data/pygameCurriculum';
import { useProgress, useCompletedActivities } from '../hooks/useLocalStorage';
import { usePyodide, setupPythonEnvironment, wrapUserCode } from '../hooks/usePyodide';
import ProgressModal from '../components/ProgressModal';
import ErrorReportButton from '../components/ErrorReportButton';
import Footer from '../components/Footer';
import { API_ENDPOINTS } from '../config/api';
import './PythonLearning.css';

// 스피너 애니메이션을 위한 스타일
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
if (!document.head.querySelector('style[data-spinner]')) {
  spinnerStyle.setAttribute('data-spinner', 'true');
  document.head.appendChild(spinnerStyle);
}

export default function PygameLearning() {
  // Custom hooks 사용 (pygame 전용 키로 변경)
  const { progress, updateProgress, resetProgress: resetProgressHook } = useProgress('pygame');
  const { completedActivities, markAsCompleted, resetCompleted } = useCompletedActivities('pygame');
  const { pyodide, isReady: pyodideReady, isLoading: loadingPyodide } = usePyodide();

  const [currentLevelIndex, setCurrentLevelIndex] = useState(progress.levelIndex);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(progress.activityIndex);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('복사');
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{message: string, code: string} | null>(null);

  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{title: string, url: string, description: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 레벨 10 시각화 상태
  const [characterX, setCharacterX] = useState(100);
  const [characterY, setCharacterY] = useState(200);
  const [showVisualization, setShowVisualization] = useState(false);

  // 툴팁 상태
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  // 가이드 투어 상태
  const [runTour, setRunTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [tourSteps] = useState<Step[]>([
    {
      target: '.progress-info',
      content: '여기서 전체 학습 진행 상황을 확인할 수 있습니다. 파이게임까지 가는 11개 레벨의 활동을 완료해보세요!',
      disableBeacon: true,
    },
    {
      target: '.activity-info-box',
      content: '현재 활동의 제목, 설명, 그리고 "왜 파이게임에 필요한가?"를 확인할 수 있습니다.',
    },
    {
      target: '.example-code-section',
      content: '예제 코드를 확인하고 복사할 수 있습니다. 복사 버튼을 클릭하면 코드가 클립보드에 복사됩니다.',
    },
    {
      target: '.code-editor-section',
      content: 'Monaco 에디터에서 파이썬 코드를 작성할 수 있습니다. 자동 완성과 문법 강조 기능을 제공합니다.',
    },
    {
      target: '.run-button',
      content: '작성한 코드를 실행하려면 이 버튼을 클릭하세요. Pyodide를 사용하여 브라우저에서 직접 실행됩니다.',
    },
    {
      target: '.output-section',
      content: '코드 실행 결과가 여기에 표시됩니다. 오류가 발생하면 오류 메시지도 함께 표시됩니다.',
    },
    {
      target: '.page-title-wrapper',
      content: '이전/다음 버튼으로 활동을 이동할 수 있습니다. 진행 상황은 자동으로 저장됩니다. ❓ 버튼을 클릭하면 언제든 이 가이드를 다시 볼 수 있습니다.',
    },
    {
      target: '.search-box',
      content: '궁금한 내용을 검색할 수 있습니다. DuckDuckGo 검색 결과를 제공합니다.',
    },
  ]);

  const inputResolveRef = useRef<any>(null);

  const currentLevel = pygameCurriculum.levels[currentLevelIndex];
  const currentActivity = currentLevel.activities[currentActivityIndex];

  // 진행 상황을 LocalStorage에 저장
  useEffect(() => {
    updateProgress(currentLevelIndex, currentActivityIndex);
  }, [currentLevelIndex, currentActivityIndex, updateProgress]);

  // 현재 활동 완료 표시
  const markActivityAsCompleted = () => {
    markAsCompleted(currentActivity.id);
  };

  // 진행 상황 초기화
  const resetProgress = () => {
    if (window.confirm('모든 학습 진행 상황을 초기화하시겠습니까?')) {
      resetProgressHook();
      resetCompleted();
      setCurrentLevelIndex(0);
      setCurrentActivityIndex(0);
      clearExecutionResults();
      alert('진행 상황이 초기화되었습니다.');
    }
  };

  // 실행 결과 초기화 함수
  const clearExecutionResults = () => {
    setCode('');
    setOutput('');
    setCopyButtonText('복사');
    setWaitingForInput(false);
    setInputPrompt('');
    setUserInput('');
    setErrorInfo(null);
    setShowVisualization(false);
    setCharacterX(100);
    setCharacterY(200);
  };

  // 특정 활동으로 이동
  const goToActivity = (levelIndex: number, activityIndex: number) => {
    setCurrentLevelIndex(levelIndex);
    setCurrentActivityIndex(activityIndex);
    clearExecutionResults();
    setShowProgressModal(false);
  };

  // 가이드 투어 시작 체크
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('edupy_pygame_tour_completed');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 투어 콜백 처리
  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status) && !tourCompleted) {
      setRunTour(false);
      setTourCompleted(true);

      if (status === 'finished') {
        const result = await Swal.fire({
          title: '🎉 가이드 투어 완료!',
          html: `
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">
              파이게임 학습 페이지의 모든 기능을 확인했습니다!
            </p>
            <p style="font-size: 0.95rem; color: #666;">
              다음에도 이 가이드를 보시겠습니까?
            </p>
          `,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: '네, 다음에도 보기',
          cancelButtonText: '아니오, 다시 보지 않기',
          confirmButtonColor: '#667eea',
          cancelButtonColor: '#e53e3e',
          reverseButtons: true,
        });

        if (result.isDismissed || result.dismiss === Swal.DismissReason.cancel) {
          localStorage.setItem('edupy_pygame_tour_completed', 'true');
          Swal.fire({
            title: '설정 완료',
            text: '다음부터 가이드 투어가 자동으로 표시되지 않습니다. ❓ 버튼을 클릭하면 언제든 다시 볼 수 있습니다.',
            icon: 'info',
            confirmButtonText: '확인',
            confirmButtonColor: '#667eea',
            timer: 3000,
            timerProgressBar: true,
          });
        }
      } else if (status === 'skipped') {
        const result = await Swal.fire({
          title: '가이드 투어 건너뛰기',
          html: `
            <p style="font-size: 1rem; margin-bottom: 1rem;">
              가이드 투어를 건너뛰었습니다.
            </p>
            <p style="font-size: 0.95rem; color: #666;">
              다음부터 이 가이드를 보지 않으시겠습니까?
            </p>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '네, 다시 보지 않기',
          cancelButtonText: '아니오, 다음에 보기',
          confirmButtonColor: '#e53e3e',
          cancelButtonColor: '#667eea',
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          localStorage.setItem('edupy_pygame_tour_completed', 'true');
          Swal.fire({
            title: '설정 완료',
            text: '다음부터 가이드 투어가 자동으로 표시되지 않습니다. ❓ 버튼을 클릭하면 언제든 다시 볼 수 있습니다.',
            icon: 'info',
            confirmButtonText: '확인',
            confirmButtonColor: '#667eea',
            timer: 3000,
            timerProgressBar: true,
          });
        }
      }
    }
  };

  // Pyodide 로딩 상태 표시
  useEffect(() => {
    if (loadingPyodide) {
      setOutput('🐍 Python 환경을 준비하고 있습니다...');
    } else if (pyodideReady) {
      setOutput('✅ Python 환경이 준비되었습니다! 코드를 작성하고 실행해보세요.');
    }
  }, [loadingPyodide, pyodideReady]);

  // 사용자 입력 제출
  const handleInputSubmit = async () => {
    if (!userInput.trim() || !inputResolveRef.current) {
      return;
    }

    const value = userInput;
    setOutput((prev) => prev + value + '\n');

    const resolve = inputResolveRef.current;
    inputResolveRef.current = null;
    setUserInput('');
    setWaitingForInput(false);

    resolve(value);
  };

  // 키 버튼 클릭 처리
  const handleKeyButtonClick = (key: string) => {
    if (!inputResolveRef.current) {
      return;
    }

    setOutput((prev) => prev + key + '\n');

    // 레벨 10 활동에서 캐릭터 이동 시각화
    if (currentActivity.id === '10-1' || currentActivity.id === '10-3') {
      if (key === 'a') {
        setCharacterX((prev) => Math.max(20, prev - 50));
      } else if (key === 'd') {
        setCharacterX((prev) => Math.min(580, prev + 50));
      }
    } else if (currentActivity.id === '10-2') {
      if (key === 'w') {
        setCharacterY((prev) => Math.max(20, prev - 50));
      } else if (key === 's') {
        setCharacterY((prev) => Math.min(380, prev + 50));
      }
    }

    const resolve = inputResolveRef.current;
    inputResolveRef.current = null;
    setUserInput('');
    setWaitingForInput(false);

    resolve(key);
  };

  // 코드 실행 함수
  const handleRunCode = async () => {
    if (!pyodideReady || !pyodide) {
      setOutput('❌ Python 환경이 아직 준비되지 않았습니다. 잠시만 기다려주세요.');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setWaitingForInput(false);

    // 레벨 10 활동에서 시각화 활성화
    if (currentLevel.level === 10 && (currentActivity.id === '10-1' || currentActivity.id === '10-2' || currentActivity.id === '10-3')) {
      setShowVisualization(true);
      setCharacterX(100);
      setCharacterY(200);
    }

    try {
      let outputBuffer = '';

      setupPythonEnvironment(
        pyodide,
        (text: string) => {
          outputBuffer += text + '\n';
          setOutput(outputBuffer);
        },
        async (prompt: string) => {
          return new Promise((resolve) => {
            outputBuffer += prompt;
            setOutput(outputBuffer);
            setInputPrompt(prompt);
            setWaitingForInput(true);
            inputResolveRef.current = (value: string) => {
              outputBuffer += value + '\n';
              setOutput(outputBuffer);
              resolve(value);
            };
          });
        }
      );

      const wrappedCode = wrapUserCode(code);
      await pyodide.runPythonAsync(wrappedCode);

      setIsRunning(false);

      if (!outputBuffer.trim()) {
        setOutput('실행 완료 (출력 없음)');
      }

      markActivityAsCompleted();
      setErrorInfo(null);

    } catch (error: any) {
      let errorMsg = error.message || String(error);

      setOutput((prev) => (prev ? prev + '\n\n' : '') + `❌ 오류:\n${errorMsg}`);

      // 단순한 문법 오류는 오류 보고 대상에서 제외
      const isSyntaxError = errorMsg.includes('SyntaxError') ||
                           errorMsg.includes('IndentationError') ||
                           errorMsg.includes('TabError') ||
                           errorMsg.includes('unexpected EOF') ||
                           errorMsg.includes('invalid syntax') ||
                           errorMsg.includes('unindent does not match');

      if (!isSyntaxError) {
        setErrorInfo({
          message: errorMsg,
          code: code,
        });
      } else {
        setErrorInfo(null);
      }

      setIsRunning(false);
    }
  };

  // 다음 액티비티로 이동
  const goToNextActivity = () => {
    if (currentActivityIndex < currentLevel.activities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
      clearExecutionResults();
    } else if (currentLevelIndex < pygameCurriculum.levels.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setCurrentActivityIndex(0);
      clearExecutionResults();
    } else {
      setOutput('🎉 축하합니다! 모든 과정을 완료했습니다!');
    }
  };

  // 이전 액티비티로 이동
  const goToPreviousActivity = () => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(currentActivityIndex - 1);
      clearExecutionResults();
    } else if (currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
      const previousLevel = pygameCurriculum.levels[currentLevelIndex - 1];
      setCurrentActivityIndex(previousLevel.activities.length - 1);
      clearExecutionResults();
    }
  };

  // 이전/다음 버튼 활성화 여부
  const hasPrevious = currentLevelIndex > 0 || currentActivityIndex > 0;
  const hasNext =
    currentLevelIndex < pygameCurriculum.levels.length - 1 ||
    currentActivityIndex < currentLevel.activities.length - 1;

  // 예제 코드 복사 기능
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentActivity.starterCode);
      setCopyButtonText('✓ 복사됨!');

      setTimeout(() => {
        setCopyButtonText('복사');
      }, 2000);
    } catch (err) {
      console.error('복사 실패:', err);
      setCopyButtonText('복사 실패');
      setTimeout(() => {
        setCopyButtonText('복사');
      }, 2000);
    }
  };

  // 검색 버튼 클릭 시 검색 실행
  const handleSearchClick = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(API_ENDPOINTS.search, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      const data = await response.json();

      if (data.success && data.results && data.results.length > 0) {
        setSearchResults(data.results.slice(0, 10));
      } else {
        setSearchResults([]);
        if (data.error) {
          setOutput(`❌ 검색 오류: ${data.error}`);
        }
      }
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 총 활동 수 계산
  const totalActivities = pygameCurriculum.levels.reduce((sum, level) => sum + level.activities.length, 0);

  return (
    <div className="python-learning">
      {/* Joyride 가이드 투어 */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#667eea',
            zIndex: 10000,
          },
          tooltip: {
            fontSize: 16,
            padding: 20,
          },
          buttonNext: {
            backgroundColor: '#667eea',
            fontSize: 14,
            padding: '10px 20px',
          },
          buttonBack: {
            color: '#667eea',
            fontSize: 14,
            padding: '10px 20px',
          },
          buttonSkip: {
            color: '#999',
            fontSize: 14,
          },
        }}
        locale={{
          back: '이전',
          close: '닫기',
          last: '완료',
          next: '다음',
          skip: '건너뛰기',
        }}
      />

      {/* Header */}
      <header className="header">
        <div className="container">
          <h1 className="logo">
            <a href="/">🎮 EduPy - Pygame</a>
          </h1>

          <div className="page-title-wrapper">
            <button
              className="header-nav-button prev-header-button"
              onClick={goToPreviousActivity}
              disabled={!hasPrevious}
            >
              <span className="nav-emoji">⬅️</span>
              <span className="nav-text">이전</span>
            </button>

            <h2 className="page-title">
              파이게임까지 가는 파이썬 - Level {currentLevel.level} ({currentActivityIndex + 1}/{currentLevel.activities.length})
              {completedActivities.has(currentActivity.id) && <span className="completed-badge">✓ 완료</span>}
              <button
                className="tour-restart-button"
                onClick={() => {
                  setTourCompleted(false);
                  setRunTour(true);
                }}
                title="가이드 투어 다시 보기"
              >
                ❓
              </button>
            </h2>

            <button
              className="header-nav-button next-header-button"
              onClick={goToNextActivity}
              disabled={!hasNext}
            >
              <span className="nav-text">다음</span>
              <span className="nav-emoji">➡️</span>
            </button>
          </div>

          <div className="header-right-section">
            {/* 학습 메뉴 드롭다운 */}
            <div className="dropdown">
              <button className="nav-link dropdown-toggle">
                🐍 학습 메뉴 ▼
              </button>
              <div className="dropdown-menu">
                <a href="https://tt.hancomtaja.com/ko" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                  ⌨️ 한컴 타자 연습
                </a>
                <a href="/python" className="dropdown-item">
                  🐍 파이썬 학습
                </a>
                <a href="/pygame" className="dropdown-item">
                  📚 파이게임 기초 문법
                </a>
                <a href="/pygame-games" className="dropdown-item">
                  🎮 파이게임 만들기
                </a>
                <div className="dropdown-item disabled">
                  📊 데이터 분석과 시각화 <span className="badge-coming-soon">준비중</span>
                </div>
                <div className="dropdown-item disabled">
                  🤖 AI 코딩 <span className="badge-coming-soon">준비중</span>
                </div>
              </div>
            </div>

            <a href="/admin/login" className="admin-login-link" title="관리자 로그인">
              🔐
            </a>
          </div>
        </div>
      </header>

      <div className="learning-container">
        {/* Left Panel - Activity Info & Example Code */}
        <aside className="left-panel">
          {/* Activity Info */}
          <div className="activity-info-box">
            <div className="activity-header">
              <h2 className="activity-main-title">
                {currentActivity.title}
                {completedActivities.has(currentActivity.id) && (
                  <span className="activity-completed-badge">✓</span>
                )}
              </h2>
              <div className="progress-controls">
                <button
                  className="progress-info"
                  onClick={() => setShowProgressModal(true)}
                  title="전체 학습 진행 상황 보기"
                >
                  {completedActivities.size} / {totalActivities} 완료
                </button>
                <button
                  className="reset-progress-button"
                  onClick={resetProgress}
                  title="진행 상황 초기화"
                >
                  🔄 학습 초기화
                </button>
              </div>
            </div>
            <p className="activity-description">{currentActivity.description}</p>

            <div className="concepts">
              <strong>핵심 개념:</strong>
              {currentLevel.concepts.map((concept, index) => {
                // 툴팁 위치 계산 (화면 밖으로 나가지 않도록)
                const getTooltipStyle = () => {
                  const baseStyle: React.CSSProperties = {
                    position: 'fixed',
                    bottom: 'auto',
                    top: 'auto',
                    left: 'auto',
                    right: 'auto',
                    marginBottom: '8px',
                    padding: '10px 14px',
                    background: '#2d3748',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    whiteSpace: 'normal',
                    width: '600px',
                    maxWidth: '90vw',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 10000,
                    animation: 'fadeIn 0.2s ease-in-out',
                    lineHeight: '1.5'
                  };

                  // 화면 중앙에 배치
                  baseStyle.left = '50%';
                  baseStyle.top = '50%';
                  baseStyle.transform = 'translate(-50%, -50%)';

                  return baseStyle;
                };

                return (
                  <span
                    key={index}
                    className="concept-tag"
                    onMouseEnter={() => setActiveTooltip(index)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    style={{
                      position: 'relative',
                      cursor: 'help'
                    }}
                  >
                    {concept}
                    {activeTooltip === index && (
                      <>
                        {/* 반투명 배경 오버레이 */}
                        <div
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 9999
                          }}
                          onClick={() => setActiveTooltip(null)}
                        />
                        {/* 툴팁 */}
                        <span
                          className="concept-tooltip"
                          style={getTooltipStyle()}
                        >
                          {conceptExplanations[concept] || concept}
                        </span>
                      </>
                    )}
                  </span>
                );
              })}
            </div>

            {/* 왜 파이게임에 필요한가? */}
            <div className="why-pygame">
              <strong>🎮 왜 파이게임에 필요한가?</strong>
              <p>{currentLevel.whyInPygame}</p>
            </div>
          </div>

          {/* Example Code */}
          <div className="example-code-section">
            <div className="example-header">
              <span>📝 예제 코드</span>
              <button
                className="copy-button"
                onClick={handleCopyCode}
                title="예제 코드 복사"
              >
                {copyButtonText}
              </button>
            </div>
            <div className="code-with-lines">
              {currentActivity.starterCode.split('\n').map((line, index) => (
                <div key={index} className="code-line">
                  <span className="line-number">{index + 1}</span>
                  <span className="line-content">{line || ' '}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="search-box" style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#2d3748',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🔍 궁금한 내용 검색
            </h3>
            <div className="search-input-group" style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: searchResults.length > 0 ? '1rem' : '0'
            }}>
              <input
                type="text"
                placeholder="예: pygame 키보드 입력, 충돌 감지"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchClick();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={handleSearchClick}
                disabled={isSearching}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: isSearching
                    ? '#a0aec0'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                  minWidth: '90px'
                }}
                onMouseEnter={(e) => {
                  if (!isSearching) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                }}
              >
                {isSearching ? '🔄 검색 중...' : '🔍 검색'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results" style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: '#667eea',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #667eea'
                }}>
                  📚 검색 결과 ({searchResults.length}개)
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {searchResults.map((result, index) => (
                    <li key={index} style={{
                      padding: '0.875rem',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'block'
                        }}
                      >
                        <strong style={{
                          color: '#2d3748',
                          fontSize: '0.95rem',
                          display: 'block',
                          marginBottom: '0.25rem'
                        }}>
                          {result.title}
                        </strong>
                        {result.description && (
                          <p style={{
                            margin: 0,
                            fontSize: '0.85rem',
                            color: '#718096',
                            lineHeight: '1.5'
                          }}>
                            {result.description}
                          </p>
                        )}
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#a0aec0',
                          marginTop: '0.25rem',
                          display: 'block'
                        }}>
                          🔗 {new URL(result.url).hostname}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isSearching && searchResults.length === 0 && searchQuery === '' && (
              <div style={{
                marginTop: '1rem',
                padding: '1.5rem',
                textAlign: 'center',
                color: '#a0aec0',
                fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '8px',
                border: '2px dashed #e2e8f0'
              }}>
                💡 파이게임 관련 궁금한 내용을 검색해보세요!
                <br />
                <span style={{ fontSize: '0.85rem', color: '#cbd5e0', marginTop: '0.5rem', display: 'block' }}>
                  예: "pygame 스프라이트", "충돌 감지", "키보드 입력"
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel - Code Editor & Output */}
        <main className="right-panel">
          {/* Code Editor */}
          <section className="code-editor-section">
            <div className="editor-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: '600',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              <span style={{ fontSize: '1rem' }}>💻 코드 작성</span>
              <button
                className="run-button"
                onClick={handleRunCode}
                disabled={isRunning || !pyodideReady}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: isRunning || !pyodideReady
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: isRunning || !pyodideReady ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  minWidth: '120px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (!isRunning && pyodideReady) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.5)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                  if (!isRunning && pyodideReady) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
                  }
                }}
              >
                {isRunning ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      animation: 'spin 1s linear infinite'
                    }}>⏳</span>
                    실행 중...
                  </>
                ) : !pyodideReady ? (
                  <>
                    <span>⌛</span>
                    준비 중...
                  </>
                ) : (
                  <>
                    <span>▶️</span>
                    실행하기
                  </>
                )}
              </button>
            </div>
            <Editor
              height="300px"
              defaultLanguage="python"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
              }}
            />
          </section>

          {/* 레벨 10 시각화 캔버스 */}
          {showVisualization && (
            <section className="visualization-section" style={{
              marginBottom: '1.5rem',
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#2d3748'
                }}>
                  🎮 캐릭터 이동 시각화
                </h3>
                <span style={{
                  fontSize: '0.9rem',
                  color: '#718096',
                  fontFamily: 'monospace'
                }}>
                  위치: ({characterX}, {characterY})
                </span>
              </div>
              <div style={{
                width: '600px',
                height: '400px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                margin: '0 auto'
              }}>
                {/* 그리드 배경 */}
                <svg width="600" height="400" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.1 }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" stroke="white" strokeWidth="1" />
                  ))}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="white" strokeWidth="1" />
                  ))}
                </svg>

                {/* 캐릭터 */}
                <div style={{
                  position: 'absolute',
                  left: `${characterX}px`,
                  top: `${characterY}px`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  fontSize: '3rem',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }}>
                  🦸
                </div>

                {/* 좌표 표시 */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  background: 'rgba(255,255,255,0.9)',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  fontFamily: 'monospace'
                }}>
                  X: {characterX} / Y: {characterY}
                </div>
              </div>
            </section>
          )}

          {/* Output */}
          <section className="output-section">
            <div className="output-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'nowrap',
              overflow: 'hidden'
            }}>
              <span style={{ flexShrink: 0 }}>📤 실행 결과</span>
              {errorInfo && (
                <ErrorReportButton
                  errorInfo={errorInfo}
                  level={`Level ${currentLevel.level}: ${currentLevel.title}`}
                  activity={`${currentActivity.id} - ${currentActivity.title}`}
                />
              )}
            </div>
            <pre className="output-content">{output}</pre>

            {/* 입력 대기 중일 때 입력 필드 또는 키 버튼 표시 */}
            {waitingForInput && (
              <div className="input-box">
                <label>{inputPrompt}</label>

                {/* 키 입력 활동 (10-1, 10-2, 10-3, 10-4)인 경우 버튼으로 표시 */}
                {(currentActivity.id === '10-1' || currentActivity.id === '10-2' ||
                  currentActivity.id === '10-3' || currentActivity.id === '10-4') ? (
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }}>
                    {/* 10-1, 10-3: a/d 키 */}
                    {(currentActivity.id === '10-1' || currentActivity.id === '10-3') && (
                      <>
                        <button
                          onClick={() => handleKeyButtonClick('a')}
                          style={{
                            padding: '1.5rem 2.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                            minWidth: '120px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                          }}
                        >
                          ⬅️ A (왼쪽)
                        </button>
                        <button
                          onClick={() => handleKeyButtonClick('d')}
                          style={{
                            padding: '1.5rem 2.5rem',
                            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(72, 187, 120, 0.4)',
                            minWidth: '120px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(72, 187, 120, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.4)';
                          }}
                        >
                          ➡️ D (오른쪽)
                        </button>
                      </>
                    )}

                    {/* 10-2: w/s 키 */}
                    {currentActivity.id === '10-2' && (
                      <>
                        <button
                          onClick={() => handleKeyButtonClick('w')}
                          style={{
                            padding: '1.5rem 2.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                            minWidth: '120px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                          }}
                        >
                          ⬆️ W (위)
                        </button>
                        <button
                          onClick={() => handleKeyButtonClick('s')}
                          style={{
                            padding: '1.5rem 2.5rem',
                            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(72, 187, 120, 0.4)',
                            minWidth: '120px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(72, 187, 120, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.4)';
                          }}
                        >
                          ⬇️ S (아래)
                        </button>
                      </>
                    )}

                    {/* 10-4: y/n 키 */}
                    {currentActivity.id === '10-4' && (
                      <>
                        <button
                          onClick={() => handleKeyButtonClick('y')}
                          style={{
                            padding: '1.5rem 2.5rem',
                            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(72, 187, 120, 0.4)',
                            minWidth: '120px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(72, 187, 120, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.4)';
                          }}
                        >
                          ✅ Y (이동)
                        </button>
                        <button
                          onClick={() => handleKeyButtonClick('n')}
                          style={{
                            padding: '1.5rem 2.5rem',
                            background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(245, 101, 101, 0.4)',
                            minWidth: '120px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 101, 101, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 101, 101, 0.4)';
                          }}
                        >
                          ❌ N (정지)
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  /* 일반 입력 필드 */
                  <div className="input-group" style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginTop: '0.75rem'
                  }}>
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleInputSubmit();
                        }
                      }}
                      placeholder="입력 후 Enter 또는 제출 버튼 클릭"
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      onClick={handleInputSubmit}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                        minWidth: '80px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                      }}
                    >
                      ✅ 제출
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={showProgressModal}
        curriculum={pygameCurriculum}
        completedActivities={completedActivities}
        currentLevelIndex={currentLevelIndex}
        currentActivityIndex={currentActivityIndex}
        onClose={() => setShowProgressModal(false)}
        onActivityClick={goToActivity}
      />

      <Footer />
    </div>
  );
}

