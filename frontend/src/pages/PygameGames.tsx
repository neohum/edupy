import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { pygameGamesCurriculum, gameConceptExplanations } from '../data/pygameGamesCurriculum';
import ThemeDropdown from '../components/ThemeDropdown';
import LearningMenuDropdown from '../components/LearningMenuDropdown';
import OutputModal from '../components/OutputModal';
import Footer from '../components/Footer';
import { API_ENDPOINTS } from '../config/api';
import './PythonLearning.css';

export default function PygameGames() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [gameImage, setGameImage] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('복사');
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDescription, setErrorDescription] = useState('');
  const [errorSubmitting, setErrorSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLaunchingNewWindow, setIsLaunchingNewWindow] = useState(false);
  const [exampleCodeHeight, setExampleCodeHeight] = useState(300);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const gameWindowRef = useRef<Window | null>(null);
  const exampleCodeRef = useRef<HTMLDivElement>(null);

  const currentLevel = pygameGamesCurriculum[currentLevelIndex];
  const currentActivity = currentLevel.activities[currentActivityIndex];

  // 전체 활동 수 계산
  const totalActivities = pygameGamesCurriculum.reduce((sum, level) => sum + level.activities.length, 0);

  // 현재 활동 번호 계산
  const currentActivityNumber = pygameGamesCurriculum
    .slice(0, currentLevelIndex)
    .reduce((sum, level) => sum + level.activities.length, 0) + currentActivityIndex + 1;

  // 활동 변경 시 코드 초기화
  useEffect(() => {
    setCode('');
    setOutput('');
    setGameImage(null);
    setHasError(false);
  }, [currentActivity]);

  // 예제 코드 높이 측정
  useEffect(() => {
    if (exampleCodeRef.current) {
      const height = exampleCodeRef.current.offsetHeight;
      setExampleCodeHeight(height);
    }
  }, [currentActivity]);

  // 게임 타입 자동 감지
  const detectGameType = (code: string, title: string): string => {
    const lowerTitle = title.toLowerCase();
    const lowerCode = code.toLowerCase();

    // 제목으로 먼저 판단
    if (lowerTitle.includes('탁구') || lowerTitle.includes('pong')) {
      return 'pong';
    }
    if (lowerTitle.includes('타이핑')) {
      return 'typing';
    }
    if (lowerTitle.includes('슈팅') || lowerTitle.includes('shoot')) {
      return 'shoot';
    }
    if (lowerTitle.includes('피하기') || lowerTitle.includes('avoid')) {
      return 'avoid';
    }
    if (lowerTitle.includes('먹기') || lowerTitle.includes('collect') || lowerTitle.includes('사과')) {
      return 'collect';
    }

    // 코드 내용으로 판단
    if (lowerCode.includes('bullet') || lowerCode.includes('총알') || lowerCode.includes('발사')) {
      return 'shoot';
    }
    if (lowerCode.includes('enemy') || lowerCode.includes('적')) {
      return 'avoid';
    }
    if (lowerCode.includes('apple') || lowerCode.includes('사과') || lowerCode.includes('score')) {
      return 'collect';
    }

    return 'auto';
  };

  // 코드 실행
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('🎮 게임을 실행하는 중...\n키 입력이 자동으로 시뮬레이션됩니다.\n');
    setGameImage(null);
    setHasError(false);
    setShowOutputModal(true);

    try {
      // 게임 타입 자동 감지
      const gameType = detectGameType(code, currentActivity.title);

      const response = await fetch(API_ENDPOINTS.pygameExecute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          width: 800,
          height: 600,
          max_frames: 120,  // 더 긴 실행 시간 (2초)
          simulate_input: true,  // 키 입력 시뮬레이션 활성화
          game_type: gameType,  // 자동 감지된 게임 타입
        }),
      });

      const result = await response.json();

      if (result.success && result.image) {
        setGameImage(result.image);
        setOutput(`✅ 게임 실행 완료!\n게임 타입: ${gameType}\n\n${result.output || ''}`);
        setHasError(false);
      } else {
        setOutput(`❌ 오류:\n${result.error}`);
        setHasError(true);
      }
    } catch (error: any) {
      setOutput(`❌ 실행 오류:\n${error.message}`);
      setHasError(true);
    } finally {
      setIsRunning(false);
    }
  };

  // 새 창에서 HTML5 게임 실행
  const handleRunInNewWindow = async () => {
    if (!code.trim()) {
      toast.error('실행할 코드를 입력해주세요.');
      return;
    }

    setIsLaunchingNewWindow(true);

    try {
      // 원본 예제 코드와 동일한지 확인
      const isOriginalCode = code.trim() === currentActivity.exampleCode.trim();
      console.log('원본 코드 여부:', isOriginalCode);

      if (isOriginalCode) {
        // 미리 생성된 정적 HTML 파일 사용
        const gameFile = `/games/game_${currentActivity.id.replace('-', '_')}.html`;
        console.log('정적 파일 사용:', gameFile);

        const gameWindow = window.open(
          gameFile,
          '_blank',
          'width=700,height=950,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
        );

        if (gameWindow) {
          gameWindowRef.current = gameWindow;
          toast.success('게임이 새 창에서 실행됩니다!');

          const checkWindow = setInterval(() => {
            if (gameWindow.closed) {
              clearInterval(checkWindow);
              gameWindowRef.current = null;
            }
          }, 1000);
        } else {
          toast.error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        }
      } else {
        // 수정된 코드는 API로 동적 변환
        console.log('동적 변환 사용, 코드 길이:', code.length);

        const response = await fetch(API_ENDPOINTS.pygameToHtml, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            width: 600,
            height: 800,
          }),
        });

        const result = await response.json();

        if (result.success && result.html) {
          // Blob URL 방식으로 새 창 열기
          const blob = new Blob([result.html], { type: 'text/html;charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);

          const gameWindow = window.open(
            blobUrl,
            '_blank',
            'width=700,height=950,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
          );

          if (gameWindow) {
            gameWindowRef.current = gameWindow;
            toast.success('수정된 코드로 게임이 실행됩니다!');

            const checkWindow = setInterval(() => {
              if (gameWindow.closed) {
                clearInterval(checkWindow);
                gameWindowRef.current = null;
                URL.revokeObjectURL(blobUrl);
              }
            }, 1000);
          } else {
            URL.revokeObjectURL(blobUrl);
            toast.error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
          }
        } else {
          toast.error(`HTML 변환 실패: ${result.error || result.detail || '알 수 없는 오류'}`);
        }
      }
    } catch (error: any) {
      toast.error(`오류: ${error.message}`);
    } finally {
      setIsLaunchingNewWindow(false);
    }
  };

  // 예제 코드 복사
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentActivity.exampleCode);
    setCopyButtonText('✓ 복사됨!');
    setTimeout(() => setCopyButtonText('복사'), 2000);
  };

  const handleSubmitError = async () => {
    if (!errorDescription.trim()) {
      toast.warning('오류 내용을 입력해주세요.');
      return;
    }

    setErrorSubmitting(true);

    try {
      const response = await fetch(API_ENDPOINTS.submitError, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: `파이게임 만들기 - ${currentActivity.title}`,
          error_type: 'game_error',
          description: errorDescription,
          code: code,
          output: output,
        }),
      });

      if (response.ok) {
        toast.success('오류가 성공적으로 보고되었습니다. 감사합니다!');
        setShowErrorModal(false);
        setErrorDescription('');
      } else {
        toast.error('오류 보고에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      toast.error('오류 보고 중 문제가 발생했습니다.');
    } finally {
      setErrorSubmitting(false);
    }
  };

  // 이전/다음 활동
  const handlePrevious = () => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(currentActivityIndex - 1);
    } else if (currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
      setCurrentActivityIndex(pygameGamesCurriculum[currentLevelIndex - 1].activities.length - 1);
    }
  };

  const handleNext = () => {
    if (currentActivityIndex < currentLevel.activities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
    } else if (currentLevelIndex < pygameGamesCurriculum.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setCurrentActivityIndex(0);
    }
  };

  const hasPrevious = !(currentLevelIndex === 0 && currentActivityIndex === 0);
  const hasNext = !(
    currentLevelIndex === pygameGamesCurriculum.length - 1 &&
    currentActivityIndex === currentLevel.activities.length - 1
  );

  return (
    <div className="learning-page pygame-games-page">
      {/* 헤더 */}
      <header className="learning-header">
        <div className="container">
          <h1 className="logo">
            <a href="/"><span className="logo-icon">EPY</span>EduPy</a>
          </h1>

          <div className="page-title-wrapper">
            <button
              className="header-nav-button prev-header-button"
              onClick={handlePrevious}
              disabled={!hasPrevious}
            >
              <span className="nav-emoji"><i className="fi fi-rr-angle-left"></i></span>
              <span className="nav-text">이전</span>
            </button>

            <h2 className="page-title">
              <i className="fi fi-rr-gamepad"></i> 파이게임 만들기 - Level {currentLevel.level} ({currentActivityIndex + 1}/{currentLevel.activities.length})
            </h2>

            <button
              className="header-nav-button next-header-button"
              onClick={handleNext}
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
              {currentActivity.id}. {currentActivity.title}
              <span className={`difficulty-badge ${currentActivity.difficulty}`}>
                {currentActivity.difficulty}
              </span>
            </h2>
            <div className="progress-controls">
              <button
                className="progress-info"
                onClick={() => setShowCurriculumModal(true)}
                title="전체 학습 진행 상황 보기"
              >
                {currentActivityNumber} / {totalActivities} 완료
              </button>
              <button
                className="reset-progress-button"
                onClick={() => {
                  if (window.confirm('코드와 실행 결과를 초기화하시겠습니까?')) {
                    setCode('');
                    setOutput('');
                    setGameImage(null);
                    setHasError(false);
                    toast.success('초기화되었습니다.');
                  }
                }}
                title="코드 및 결과 초기화"
              >
                <i className="fi fi-rr-refresh"></i> 학습 초기화
              </button>
            </div>
          </div>
          <p className="activity-description">{currentActivity.description}</p>

          <div className="concepts">
            <strong><i className="fi fi-rr-book"></i> 학습 개념:</strong>
            {currentActivity.concepts.map((concept, index) => {
              const explanation = gameConceptExplanations[concept];
              return (
                <span
                  key={index}
                  className="concept-tag"
                  onMouseEnter={() => setActiveTooltip(index)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  style={{ position: 'relative', cursor: 'help' }}
                >
                  {concept}
                  {activeTooltip === index && explanation && (
                    <span
                      className="concept-tooltip"
                      style={{
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
                        lineHeight: '1.5',
                      }}
                    >
                      {explanation}
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          <div className="hints-section">
            <strong><i className="fi fi-rr-lightbulb-on"></i> 힌트:</strong>
            <ul>
              {currentActivity.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Editor Row - Example Code and Code Editor Side by Side */}
        <div className="editor-row">
          {/* Left Panel - Example Code */}
          <div className="left-panel">
            <div className="example-code-section" ref={exampleCodeRef}>
              <div className="example-header">
                <h3><i className="fi fi-rr-document"></i> 예제 코드</h3>
                <button onClick={handleCopyCode} className="copy-button">
                  {copyButtonText}
                </button>
              </div>
              <pre className="example-code-with-lines">
                {currentActivity.exampleCode.split('\n').map((line, index) => (
                  <div key={index} className="code-line">
                    <span className="line-number">{index + 1}</span>
                    <span className="line-content">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="right-panel">
            <div className="code-editor-section">
              <div className="section-header">
                <h3><i className="fi fi-rr-laptop-code"></i> 코드 에디터</h3>
                <div className="header-buttons">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning || isLaunchingNewWindow}
                    className="header-run-button"
                    title="코드 실행"
                  >
                    {isRunning ? <><i className="fi fi-rr-spinner"></i> 실행 중...</> : <><i className="fi fi-rr-play"></i> 실행</>}
                  </button>
                  {gameImage && (
                    <button
                      onClick={handleRunInNewWindow}
                      disabled={isRunning || isLaunchingNewWindow}
                      className="header-run-button header-run-button-alt"
                      title="새 창에서 실시간 게임 실행"
                    >
                      {isLaunchingNewWindow ? <><i className="fi fi-rr-spinner"></i> 시작 중...</> : <><i className="fi fi-rr-display"></i> 새 창</>}
                    </button>
                  )}
                </div>
              </div>
              <Editor
                height={`${Math.max(200, exampleCodeHeight - 60)}px`}
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
                  cursorSurroundingLines: 3,
                  cursorSurroundingLinesStyle: 'all',
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                  },
                }}
              />
            </div>
          </div>
        </div>

        </div>

      {/* 오류 보고 모달 */}
      {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2><i className="fi fi-rr-bug"></i> 오류 보고</h2>
            <p>아래 내용을 확인하고 추가 설명이 필요하면 수정해주세요.</p>
            <textarea
              value={errorDescription}
              onChange={(e) => setErrorDescription(e.target.value)}
              placeholder="오류 내용과 코드가 자동으로 입력됩니다."
              rows={15}
              className="error-textarea"
            />
            <div className="modal-actions">
              <button
                onClick={handleSubmitError}
                disabled={errorSubmitting}
                className="submit-button"
              >
                {errorSubmitting ? '제출 중...' : '제출'}
              </button>
              <button onClick={() => setShowErrorModal(false)} className="cancel-button">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 커리큘럼 선택 모달 */}
      {showCurriculumModal && (
        <div className="modal-overlay" onClick={() => setShowCurriculumModal(false)}>
          <div className="modal-content curriculum-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fi fi-rr-book-alt"></i> 파이게임 만들기 커리큘럼</h2>
              <button className="modal-close" onClick={() => setShowCurriculumModal(false)}><i className="fi fi-rr-cross-small"></i></button>
            </div>
            <div className="modal-body">
              <div className="progress-summary">
                <div className="progress-stat">
                  <span className="stat-label">현재 진행</span>
                  <span className="stat-value">{currentActivityNumber} / {totalActivities}</span>
                </div>
              </div>
              <div className="levels-list">
                {pygameGamesCurriculum.map((level, levelIndex) => (
                  <div
                    key={levelIndex}
                    className={`level-section ${levelIndex === currentLevelIndex ? 'current-level' : ''}`}
                  >
                    <div className="level-header">
                      <h3>Level {level.level}: {level.title}</h3>
                      <span className="level-progress">
                        {level.activities.length}개 활동
                      </span>
                    </div>
                    <div className="activities-grid">
                      {level.activities.map((activity, activityIndex) => {
                        const isCurrent = levelIndex === currentLevelIndex && activityIndex === currentActivityIndex;
                        return (
                          <button
                            key={activity.id}
                            className={`activity-card ${isCurrent ? 'current' : ''}`}
                            onClick={() => {
                              setCurrentLevelIndex(levelIndex);
                              setCurrentActivityIndex(activityIndex);
                              setShowCurriculumModal(false);
                            }}
                          >
                            <div className="activity-card-header">
                              <span className="activity-number">{activity.id}</span>
                              {isCurrent && <span className="activity-current-badge">현재</span>}
                            </div>
                            <div className="activity-card-title">{activity.title}</div>
                            <span className={`difficulty-badge ${activity.difficulty}`}>
                              {activity.difficulty}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Output Modal */}
      <OutputModal
        isOpen={showOutputModal}
        onClose={() => setShowOutputModal(false)}
        output={output}
        isRunning={isRunning}
        gameImage={gameImage}
        errorInfo={hasError ? { message: output, code: code } : null}
        level={`Level ${currentLevel.level}: ${currentLevel.title}`}
        activity={`${currentActivity.id} - ${currentActivity.title}`}
      />

      <Footer />
    </div>
  );
}

