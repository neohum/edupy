import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import Joyride from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';
import { toast } from 'sonner';
import { pythonCurriculum, conceptExplanations } from '../data/pythonCurriculum';
import { useProgress, useCompletedActivities } from '../hooks/useLocalStorage';
import { usePyodide, setupPythonEnvironment, wrapUserCode } from '../hooks/usePyodide';
import ProgressModal from '../components/ProgressModal';
import OutputModal from '../components/OutputModal';
import ThemeDropdown from '../components/ThemeDropdown';
import LearningMenuDropdown from '../components/LearningMenuDropdown';
import Footer from '../components/Footer';
import { API_ENDPOINTS } from '../config/api';
import './PythonLearning.css';

export default function PythonLearning() {
  // Custom hooks 사용
  const { progress, updateProgress, resetProgress: resetProgressHook } = useProgress();
  const { completedActivities, markAsCompleted, resetCompleted } = useCompletedActivities();
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
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{message: string, code: string} | null>(null);

  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{title: string, url: string, description: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showHelpSection, setShowHelpSection] = useState(false);

  // 툴팁 상태
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  // 가이드 투어 상태
  const [runTour, setRunTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [tourSteps] = useState<Step[]>([
    {
      target: '.progress-info',
      content: '여기서 전체 학습 진행 상황을 확인할 수 있습니다. 총 50개의 활동 중 완료한 개수가 표시됩니다.',
      disableBeacon: true,
    },
    {
      target: '.activity-info-box',
      content: '현재 활동의 제목, 설명, 핵심 개념이 표시됩니다. 각 활동은 특정 파이썬 개념을 학습하도록 설계되었습니다.',
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

  // Turtle 애니메이션 상태
  const [turtleFrames, setTurtleFrames] = useState<string[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentLevel = pythonCurriculum.levels[currentLevelIndex];
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
      toast.success('진행 상황이 초기화되었습니다.');
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
    setTurtleFrames([]);
    setCurrentFrameIndex(0);
    setIsPlaying(false);
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
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
    const hasSeenTour = localStorage.getItem('edupy_tour_completed');
    if (!hasSeenTour) {
      // 페이지 로드 후 1초 뒤에 투어 시작
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

      if (status === 'skipped') {
        // "다시 보지 않기" 클릭 시 바로 저장
        localStorage.setItem('edupy_tour_completed', 'true');
        toast.info('가이드 투어가 비활성화되었습니다. ❓ 버튼을 클릭하면 다시 볼 수 있습니다.');
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

    // Promise 해결
    const resolve = inputResolveRef.current;
    inputResolveRef.current = null;
    setUserInput('');
    setWaitingForInput(false);

    // 입력값 반환
    resolve(value);
  };

  // Turtle 애니메이션 제어 함수들
  const stopAnimation = () => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAnimation = () => {
    if (turtleFrames.length === 0) return;

    setIsPlaying(true);

    const playNextFrame = (frameIndex: number) => {
      if (frameIndex >= turtleFrames.length) {
        setIsPlaying(false);
        return;
      }

      setCurrentFrameIndex(frameIndex);
      animationTimerRef.current = setTimeout(() => {
        playNextFrame(frameIndex + 1);
      }, 100);  // 100ms (0.1초)로 변경
    };

    playNextFrame(currentFrameIndex);
  };

  const pauseAnimation = () => {
    stopAnimation();
  };

  const nextFrame = () => {
    stopAnimation();
    if (currentFrameIndex < turtleFrames.length - 1) {
      setCurrentFrameIndex(currentFrameIndex + 1);
    }
  };

  const prevFrame = () => {
    stopAnimation();
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex(currentFrameIndex - 1);
    }
  };

  const resetAnimation = () => {
    stopAnimation();
    setCurrentFrameIndex(0);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  // 코드 실행 함수
  const handleRunCode = async () => {
    if (!pyodideReady || !pyodide) {
      setOutput('❌ Python 환경이 아직 준비되지 않았습니다. 잠시만 기다려주세요.');
      setShowOutputModal(true);
      return;
    }

    setIsRunning(true);
    setOutput('');
    setWaitingForInput(false);
    setShowOutputModal(true);

    // turtle 코드인지 확인 (오타 포함)
    const isTurtleCode =
      code.includes('import turtle') ||
      code.includes('from turtle') ||
      code.includes('mport turtle') ||  // 오타 감지
      /turtle\s*\.\s*(forward|backward|right|left|circle|penup|pendown|goto|shape|title|done)/i.test(code);

    if (isTurtleCode) {
      try {
        // turtle 코드에 input()이 있는지 확인
        const hasInput = code.includes('input(');
        let finalCode = code;
        let inputValues: { [key: string]: string } = {};

        if (hasInput) {
          // input()이 있으면 alert로 입력값 수집
          setOutput('📝 입력값을 받고 있습니다...\n');

          // 코드에서 모든 input() 패턴 찾기
          const inputPatterns = [
            // int(input("prompt"))
            /int\s*\(\s*input\s*\(\s*["']([^"']+)["']\s*\)\s*\)/g,
            // float(input("prompt"))
            /float\s*\(\s*input\s*\(\s*["']([^"']+)["']\s*\)\s*\)/g,
            // input("prompt")
            /input\s*\(\s*["']([^"']+)["']\s*\)/g,
          ];

          finalCode = code;

          // 각 패턴에 대해 입력값 수집
          for (const pattern of inputPatterns) {
            const matches = [...code.matchAll(pattern)];

            for (const match of matches) {
              const promptText = match[1];

              // 이미 처리된 경우 건너뛰기
              if (inputValues[promptText]) continue;

              // alert로 입력값 받기
              const userValue = window.prompt(promptText);

              if (userValue === null) {
                // 취소 버튼 클릭 시
                setOutput('❌ 입력이 취소되었습니다.');
                setIsRunning(false);
                return;
              }

              // 입력값 저장
              inputValues[promptText] = userValue;
              setOutput((prev) => prev + `${promptText} ${userValue}\n`);
            }
          }

          // 수집된 입력값으로 코드 수정
          for (const [prompt, value] of Object.entries(inputValues)) {
            // 프롬프트를 이스케이프 처리
            const escapedPrompt = prompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // int(input("prompt")) -> int(value) 형태로 대체
            const intPattern = new RegExp(`int\\s*\\(\\s*input\\s*\\(\\s*["']${escapedPrompt}["']\\s*\\)\\s*\\)`, 'g');
            finalCode = finalCode.replace(intPattern, `int(${value})`);

            // float(input("prompt")) -> float(value) 형태로 대체
            const floatPattern = new RegExp(`float\\s*\\(\\s*input\\s*\\(\\s*["']${escapedPrompt}["']\\s*\\)\\s*\\)`, 'g');
            finalCode = finalCode.replace(floatPattern, `float(${value})`);

            // input("prompt") -> "value" 형태로 대체 (문자열)
            const inputPattern = new RegExp(`input\\s*\\(\\s*["']${escapedPrompt}["']\\s*\\)`, 'g');
            finalCode = finalCode.replace(inputPattern, `"${value}"`);
          }
        }

        setOutput('🐢 Turtle 애니메이션을 생성하는 중...\n');

        // 백엔드로 turtle 코드 전송 (애니메이션 모드)
        const response = await fetch(API_ENDPOINTS.turtleExecute, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: finalCode,
            width: 600,
            height: 600,
            animate: true,  // 애니메이션 모드
          }),
        });

        const result = await response.json();

        if (result.success && result.frames) {
          // 프레임 데이터 저장
          setTurtleFrames(result.frames);
          setCurrentFrameIndex(0);
          setIsPlaying(false);

          setOutput(`✅ Turtle 애니메이션이 생성되었습니다! (${result.frame_count}개 프레임)\n\n아래 컨트롤을 사용하여 애니메이션을 제어하세요.`);

          markActivityAsCompleted();
          setErrorInfo(null);
        } else {
          setOutput(`❌ 오류:\n${result.error}`);
          setErrorInfo({
            message: result.error,
            code: code,
          });
        }

        setIsRunning(false);
        return;
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        setOutput(`❌ Turtle 실행 오류:\n${errorMsg}`);

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
        return;
      }
    }

    try {
      // 출력 버퍼
      let outputBuffer = '';

      // Python 환경 설정
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

      // 사용자 코드를 async 함수로 감싸서 실행
      const wrappedCode = wrapUserCode(code);

      await pyodide.runPythonAsync(wrappedCode);

      setIsRunning(false);

      if (!outputBuffer.trim()) {
        setOutput('실행 완료 (출력 없음)');
      }

      // 코드 실행 성공 시 완료 표시
      markActivityAsCompleted();
      setErrorInfo(null); // 성공 시 오류 정보 초기화

    } catch (error: any) {
      let errorMsg = error.message || String(error);

      // turtle 모듈 에러인 경우 친절한 메시지로 변경
      if (errorMsg.includes("module 'turtle' is removed")) {
        errorMsg = `🐢 turtle 모듈은 브라우저에서 실행할 수 없습니다.

이 코드는 참고용이며, 다음 방법으로 실행할 수 있습니다:

1️⃣ 컴퓨터에 Python 설치 (python.org)
2️⃣ IDLE, VS Code, PyCharm 등에서 코드 실행
3️⃣ 멋진 그래픽 결과를 확인!

💡 turtle은 그래픽 창을 띄우는 라이브러리라서 웹 브라우저에서는 작동하지 않아요.`;
      }

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
      // 같은 레벨의 다음 액티비티
      setCurrentActivityIndex(currentActivityIndex + 1);
      clearExecutionResults();
    } else if (currentLevelIndex < pythonCurriculum.levels.length - 1) {
      // 다음 레벨의 첫 번째 액티비티
      setCurrentLevelIndex(currentLevelIndex + 1);
      setCurrentActivityIndex(0);
      clearExecutionResults();
    } else {
      // 모든 과정 완료
      setOutput('🎉 축하합니다! 모든 과정을 완료했습니다!');
    }
  };

  // 이전 액티비티로 이동
  const goToPreviousActivity = () => {
    if (currentActivityIndex > 0) {
      // 같은 레벨의 이전 액티비티
      setCurrentActivityIndex(currentActivityIndex - 1);
      clearExecutionResults();
    } else if (currentLevelIndex > 0) {
      // 이전 레벨의 마지막 액티비티
      setCurrentLevelIndex(currentLevelIndex - 1);
      const previousLevel = pythonCurriculum.levels[currentLevelIndex - 1];
      setCurrentActivityIndex(previousLevel.activities.length - 1);
      clearExecutionResults();
    }
  };

  // 이전/다음 버튼 활성화 여부
  const hasPrevious = currentLevelIndex > 0 || currentActivityIndex > 0;
  const hasNext =
    currentLevelIndex < pythonCurriculum.levels.length - 1 ||
    currentActivityIndex < currentLevel.activities.length - 1;

  // 예제 코드 복사 기능
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentActivity.starterCode);
      setCopyButtonText('✓ 복사됨!');

      // 2초 후 버튼 텍스트 원래대로
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
        setSearchResults(data.results.slice(0, 10)); // 최대 10개
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
            primaryColor: 'var(--theme-accent)',
            zIndex: 10000,
          },
          tooltip: {
            fontSize: 16,
            padding: 20,
          },
          buttonNext: {
            backgroundColor: 'var(--theme-accent)',
            fontSize: 14,
            padding: '10px 20px',
          },
          buttonBack: {
            color: 'var(--theme-accent)',
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
          skip: '다시 보지 않기',
        }}
      />

      {/* Header */}
      <header className="header">
        <div className="container">
          <h1 className="logo">
            <a href="/"><span className="logo-icon">EPY</span>EduPy</a>
          </h1>

          <div className="page-title-wrapper">
            <button
              className="header-nav-button prev-header-button"
              onClick={goToPreviousActivity}
              disabled={!hasPrevious}
            >
              <span className="nav-emoji"><i className="fi fi-rr-angle-left"></i></span>
              <span className="nav-text">이전</span>
            </button>

            <h2 className="page-title">
              파이썬 기초 문법 - Level {currentLevel.level} ({currentActivityIndex + 1}/{currentLevel.activities.length})
              {completedActivities.has(currentActivity.id) && <span className="completed-badge"><i className="fi fi-rr-check"></i> 완료</span>}
              <button
                className="tour-restart-button"
                onClick={() => {
                  setTourCompleted(false);
                  setRunTour(true);
                }}
                title="가이드 투어 다시 보기"
              >
                <i className="fi fi-rr-interrogation"></i>
              </button>
            </h2>

            <button
              className="header-nav-button next-header-button"
              onClick={goToNextActivity}
              disabled={!hasNext}
            >
              <span className="nav-text">다음</span>
              <span className="nav-emoji"><i className="fi fi-rr-angle-right"></i></span>
            </button>
          </div>

          <div className="header-right-section">
            {/* 테마 선택 드롭다운 */}
            <ThemeDropdown />

            {/* 학습 메뉴 드롭다운 */}
            <LearningMenuDropdown />

            <a href="/admin/login" className="admin-login-link" title="관리자 로그인">
              <i className="fi fi-rr-lock"></i>
            </a>
          </div>
        </div>
      </header>

      <div className="learning-container">
        {/* Activity Info - Full Width */}
        <div className="activity-info-box">
            <div className="activity-header">
              <h2 className="activity-main-title">
                {currentActivity.title}
                {completedActivities.has(currentActivity.id) && (
                  <span className="activity-completed-badge"><i className="fi fi-rr-check"></i></span>
                )}
              </h2>
              <div className="progress-controls">
                <button
                  className="progress-info"
                  onClick={() => setShowProgressModal(true)}
                  title="전체 학습 진행 상황 보기"
                >
                  {completedActivities.size} / 50 완료
                </button>
                <button
                  className="reset-progress-button"
                  onClick={resetProgress}
                  title="진행 상황 초기화"
                >
                  <i className="fi fi-rr-refresh"></i> 학습 초기화
                </button>
              </div>
            </div>
            <p className="activity-description">{currentActivity.description}</p>

            <div className="concepts">
              <strong>핵심 개념:</strong>
              {currentLevel.concepts.map((concept, index) => {
                // 툴팁 위치 계산 (버튼 위 10px에 배치)
                const getTooltipStyle = (): React.CSSProperties => ({
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '10px',
                  padding: '10px 14px',
                  background: '#2d3748',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  whiteSpace: 'normal',
                  width: '300px',
                  maxWidth: '90vw',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 10000,
                  animation: 'fadeIn 0.2s ease-in-out',
                  lineHeight: '1.5'
                });

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
                      <span
                        className="concept-tooltip"
                        style={getTooltipStyle()}
                      >
                        {conceptExplanations[concept] || concept}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
        </div>

        {/* Editor Row - Example Code and Code Editor Side by Side */}
        <div className="editor-row">
          {/* Left Panel - Example Code */}
          <div className="left-panel">
            <div className="example-code-section">
            <div className="example-header">
              <span><i className="fi fi-rr-document"></i> 예제 코드</span>
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

            {/* 이모지 입력 힌트 */}
            {currentActivity.starterCode.match(/[😀-🙏🌀-🗿🚀-🛿]/u) && (
              <div className="emoji-hint">
                <i className="fi fi-rr-lightbulb-on"></i> <strong>이모지 입력 방법:</strong>
                <div className="hint-methods">
                  <span>
                    • 윈도우:
                    <kbd className="key-win">⊞ Win</kbd> + <kbd>.</kbd> 또는
                    <kbd className="key-win">⊞ Win</kbd> + <kbd>;</kbd>
                  </span>
                  <span>
                    • 맥:
                    <kbd className="key-ctrl">⌃ Control</kbd> + <kbd className="key-cmd">⌘ Command</kbd> + <kbd>Space</kbd>
                  </span>
                  <div className="chromebook-hint">
                    <div>
                      • 크롬북:
                      <kbd className="key-shift">⇧ Shift</kbd> + <kbd className="key-search">🔍 Search</kbd> + <kbd>Space</kbd>
                    </div>
                    <div className="hint-or">또는</div>
                    <div className="hint-indent">
                      <kbd className="key-search">🔍 Search</kbd> + <kbd>.</kbd>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 일반 힌트 */}
            {currentActivity.hint && (
              <div className="general-hint">
                {currentActivity.hint}
              </div>
            )}

            {/* 도움 받기 / 원하는 기능 찾기 */}
            <div className="help-section">
              <button
                className="help-header"
                onClick={() => setShowHelpSection(!showHelpSection)}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span><i className="fi fi-rr-life-ring"></i> 도움 받기 / 원하는 기능 찾기</span>
                <span style={{
                  transition: 'transform 0.3s ease',
                  transform: showHelpSection ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  <i className="fi fi-rr-angle-down"></i>
                </span>
              </button>

              {showHelpSection && (
                <>
                  {/* 검색창 */}
                  <div className="search-box">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="궁금한 내용을 검색하세요 (예: 리스트, 반복문, 함수)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchClick();
                        }
                      }}
                    />
                    <button
                      className="search-button"
                      onClick={handleSearchClick}
                      disabled={isSearching || !searchQuery.trim()}
                    >
                      {isSearching ? <><i className="fi fi-rr-spinner"></i> 검색 중...</> : <><i className="fi fi-rr-search"></i> 검색</>}
                    </button>
                  </div>

                  {/* 검색 결과 */}
                  <div className="help-links">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="search-results-header">
                          <i className="fi fi-rr-search"></i> 검색 결과 {searchResults.length}개
                        </div>
                        {searchResults.map((result, index) => {
                          // 아이콘 배열
                          const iconClasses = ['fi-rr-book', 'fi-rr-document', 'fi-rr-play-circle', 'fi-rr-lightbulb-on', 'fi-rr-link', 'fi-rr-edit', 'fi-rr-globe', 'fi-rr-file', 'fi-rr-graduation-cap', 'fi-rr-star'];
                          return (
                            <a
                              key={index}
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="help-link"
                            >
                              <div className="link-icon">
                                <i className={`fi ${iconClasses[index % iconClasses.length]}`}></i>
                              </div>
                              <div className="link-content">
                                <div className="link-title">
                                  {index + 1}. {result.title}
                                </div>
                                <div className="link-description">
                                  {result.description}
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </>
                    ) : searchQuery && !isSearching ? (
                      <div className="no-results">
                        검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                      </div>
                    ) : !searchQuery ? (
                      <div className="search-placeholder">
                        <i className="fi fi-rr-lightbulb-on"></i> 궁금한 내용을 검색하면 관련 학습 자료를 찾아드립니다!
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="right-panel">
            <div className="code-editor-section">
            <div className="editor-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-secondary) 100%)',
              color: 'white',
              fontWeight: '600',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              <span style={{ fontSize: '1rem' }}><i className="fi fi-rr-laptop-code"></i> 코드 에디터 (예제를 보고 따라 쳐보세요)</span>
              <button
                className="run-button"
                onClick={handleRunCode}
                disabled={isRunning || !code.trim()}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: isRunning || !code.trim()
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: isRunning || !code.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  minWidth: '120px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (!isRunning && code.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.5)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                  if (!isRunning && code.trim()) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
                  }
                }}
              >
                {isRunning ? (
                  <>
                    <span className="spinner"></span>
                    실행 중...
                  </>
                ) : (
                  <>
                    <span><i className="fi fi-rr-play"></i></span>
                    실행하기
                  </>
                )}
              </button>
            </div>
            <div className="monaco-editor-wrapper">
              <Editor
                height={`${Math.max(200, currentActivity.starterCode.split('\n').length * 28 + 20)}px`}
                defaultLanguage="python"
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 16,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: 'on',
                  padding: { top: 10, bottom: 10 },
                  cursorSurroundingLines: 3,
                  cursorSurroundingLinesStyle: 'all',
                }}
              />
            </div>
          </div>
          </div>
        </div>

        </div>

      <Footer showGitHub={false} />

      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        curriculum={pythonCurriculum}
        completedActivities={completedActivities}
        currentLevelIndex={currentLevelIndex}
        currentActivityIndex={currentActivityIndex}
        onActivityClick={goToActivity}
      />

      <OutputModal
        isOpen={showOutputModal}
        onClose={() => setShowOutputModal(false)}
        output={output}
        isRunning={isRunning}
        waitingForInput={waitingForInput}
        inputPrompt={inputPrompt}
        userInput={userInput}
        onUserInputChange={setUserInput}
        onInputSubmit={handleInputSubmit}
        turtleFrames={turtleFrames}
        currentFrameIndex={currentFrameIndex}
        isPlaying={isPlaying}
        onPlayAnimation={playAnimation}
        onPauseAnimation={pauseAnimation}
        onNextFrame={nextFrame}
        onPrevFrame={prevFrame}
        onResetAnimation={resetAnimation}
        onGoToLastFrame={() => {
          stopAnimation();
          setCurrentFrameIndex(turtleFrames.length - 1);
        }}
        errorInfo={errorInfo}
        level={`Level ${currentLevel.level}: ${currentLevel.title}`}
        activity={`${currentActivity.id} - ${currentActivity.title}`}
      />
    </div>
  );
}

