import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import Joyride from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';
import Swal from 'sweetalert2';
import { pythonCurriculum, conceptExplanations } from '../data/pythonCurriculum';
import { useProgress, useCompletedActivities } from '../hooks/useLocalStorage';
import { usePyodide, setupPythonEnvironment, wrapUserCode } from '../hooks/usePyodide';
import ProgressModal from '../components/ProgressModal';
import ErrorReportButton from '../components/ErrorReportButton';
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
  const [errorInfo, setErrorInfo] = useState<{message: string, code: string} | null>(null);

  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{title: string, url: string, description: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);

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
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

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

      // 투어 완료 여부 확인
      if (status === 'finished') {
        const result = await Swal.fire({
          title: '🎉 가이드 투어 완료!',
          html: `
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">
              파이썬 학습 페이지의 모든 기능을 확인했습니다!
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
          localStorage.setItem('edupy_tour_completed', 'true');
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
          localStorage.setItem('edupy_tour_completed', 'true');
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
      return;
    }

    setIsRunning(true);
    setOutput('');
    setWaitingForInput(false);

    // turtle 코드인지 확인
    const isTurtleCode = code.includes('import turtle') || code.includes('from turtle');

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
        setOutput(`❌ Turtle 실행 오류:\n${error.message || String(error)}`);
        setErrorInfo({
          message: error.message || String(error),
          code: code,
        });
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

      // 오류 정보 저장
      setErrorInfo({
        message: errorMsg,
        code: code,
      });

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
            <a href="/">🐍 EduPy</a>
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
              파이썬 기초 문법 - Level {currentLevel.level} ({currentActivityIndex + 1}/{currentLevel.activities.length})
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
                  {completedActivities.size} / 50 완료
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
              {currentLevel.concepts.map((concept, index) => (
                <span
                  key={index}
                  className="concept-tag"
                  title={conceptExplanations[concept] || concept}
                  data-tooltip={conceptExplanations[concept] || concept}
                >
                  {concept}
                </span>
              ))}
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

            {/* 이모지 입력 힌트 */}
            {currentActivity.starterCode.match(/[😀-🙏🌀-🗿🚀-🛿]/u) && (
              <div className="emoji-hint">
                💡 <strong>이모지 입력 방법:</strong>
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
              <div className="help-header">
                <span>🆘 도움 받기 / 원하는 기능 찾기</span>
              </div>

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
                  {isSearching ? '🔍 검색 중...' : '🔍 검색'}
                </button>
              </div>

              {/* 검색 결과 */}
              <div className="help-links">
                {searchResults.length > 0 ? (
                  <>
                    <div className="search-results-header">
                      🔍 검색 결과 {searchResults.length}개
                    </div>
                    {searchResults.map((result, index) => {
                      // 아이콘 배열
                      const icons = ['📚', '📖', '🎥', '💡', '🔗', '📝', '🌐', '📄', '🎓', '⭐'];
                      return (
                        <a
                          key={index}
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="help-link"
                        >
                          <div className="link-icon">
                            {icons[index % icons.length]}
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
                    💡 궁금한 내용을 검색하면 관련 학습 자료를 찾아드립니다!
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel - Code Editor & Output */}
        <main className="right-panel">
          {/* Code Editor */}
          <div className="code-editor-section">
            <div className="editor-header">
              <span>💻 코드 에디터 (예제를 보고 따라 쳐보세요)</span>
            </div>
            <div className="monaco-editor-wrapper">
              <Editor
                height="400px"
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
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="run-button"
              onClick={handleRunCode}
              disabled={isRunning || !code.trim()}
            >
              {isRunning ? (
                <>
                  <span className="spinner"></span>
                  실행 중...
                </>
              ) : (
                '▶️ 실행하기'
              )}
            </button>

            {/* 오류 보고 버튼 */}
            <ErrorReportButton
              errorInfo={errorInfo}
              level={`Level ${currentLevel.level}: ${currentLevel.title}`}
              activity={`${currentActivity.id} - ${currentActivity.title}`}
            />
          </div>

          {/* Output Area */}
          <div className="output-section">
            <div className="output-header">실행 결과</div>
            <div className="output-content">
              {output ? (
                output.includes('<img') ? (
                  <div dangerouslySetInnerHTML={{ __html: output.replace(/\n/g, '<br/>') }} />
                ) : (
                  <pre className="output-text">{output}</pre>
                )
              ) : (
                <p className="output-placeholder">
                  코드를 작성하고 실행 버튼을 눌러보세요!
                </p>
              )}

              {/* Turtle 애니메이션 컨트롤 */}
              {turtleFrames.length > 0 && (
                <div className="turtle-animation-controls">
                  <div className="animation-display">
                    <img
                      src={turtleFrames[currentFrameIndex]}
                      alt={`Frame ${currentFrameIndex + 1}`}
                      style={{
                        maxWidth: '100%',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        marginTop: '10px'
                      }}
                    />
                    <div className="frame-info">
                      프레임 {currentFrameIndex + 1} / {turtleFrames.length}
                    </div>
                  </div>

                  <div className="animation-buttons">
                    <button
                      onClick={resetAnimation}
                      className="control-btn"
                      title="처음으로"
                    >
                      ⏮️ 처음
                    </button>
                    <button
                      onClick={prevFrame}
                      className="control-btn"
                      disabled={currentFrameIndex === 0}
                      title="이전 프레임"
                    >
                      ⏪ 이전
                    </button>
                    <button
                      onClick={isPlaying ? pauseAnimation : playAnimation}
                      className="control-btn play-pause"
                      title={isPlaying ? "일시정지" : "재생"}
                    >
                      {isPlaying ? '⏸️ 일시정지' : '▶️ 재생'}
                    </button>
                    <button
                      onClick={nextFrame}
                      className="control-btn"
                      disabled={currentFrameIndex === turtleFrames.length - 1}
                      title="다음 프레임"
                    >
                      다음 ⏩
                    </button>
                    <button
                      onClick={() => {
                        stopAnimation();
                        setCurrentFrameIndex(turtleFrames.length - 1);
                      }}
                      className="control-btn"
                      title="마지막으로"
                    >
                      마지막 ⏭️
                    </button>
                  </div>
                </div>
              )}

              {/* 입력 대기 중일 때 입력 필드 표시 */}
              {waitingForInput && (
                <div className="input-area">
                  <input
                    type="text"
                    className="console-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleInputSubmit();
                      }
                    }}
                    placeholder="입력 후 Enter를 누르세요..."
                    autoFocus
                  />
                  <button
                    className="input-submit-button"
                    onClick={handleInputSubmit}
                  >
                    입력
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
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
    </div>
  );
}

