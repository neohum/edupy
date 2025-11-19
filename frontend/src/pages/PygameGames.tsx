import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { pygameGamesCurriculum, gameConceptExplanations } from '../data/pygameGamesCurriculum';
import Footer from '../components/Footer';
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

  const currentLevel = pygameGamesCurriculum[currentLevelIndex];
  const currentActivity = currentLevel.activities[currentActivityIndex];

  // 활동 변경 시 코드 초기화
  useEffect(() => {
    setCode('');
    setOutput('');
    setGameImage(null);
    setHasError(false);
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

    try {
      // 게임 타입 자동 감지
      const gameType = detectGameType(code, currentActivity.title);

      const response = await fetch('http://localhost:8000/api/pygame/execute', {
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

  // 예제 코드 복사
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentActivity.exampleCode);
    setCopyButtonText('✓ 복사됨!');
    setTimeout(() => setCopyButtonText('복사'), 2000);
  };

  // 오류 보고 (자동 저장)
  const handleReportError = async () => {
    // 오류 내용 자동 생성
    const autoDescription = `[오류 내용]\n${output}\n\n[실행한 코드]\n${code || '(코드 없음)'}`;

    setErrorSubmitting(true);

    try {
      // 1. 기존 오류 확인
      const checkResponse = await fetch('http://localhost:8000/api/errors/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: `파이게임 만들기 - ${currentActivity.title}`,
          code: code,
          output: output,
        }),
      });

      const checkResult = await checkResponse.json();

      if (checkResult.exists) {
        // 중복된 오류가 이미 존재
        alert(`이 오류는 이미 보고되었습니다.\n\n보고 ID: ${checkResult.error_id}\n보고 시간: ${new Date(checkResult.created_at).toLocaleString()}\n\n관리자가 확인 중입니다.`);
        setErrorSubmitting(false);
        return;
      }

      // 2. 새로운 오류 자동 저장
      const response = await fetch('http://localhost:8000/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: `파이게임 만들기 - ${currentActivity.title}`,
          error_type: 'game_error',
          description: autoDescription,
          code: code,
          output: output,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`오류가 자동으로 보고되었습니다!\n\n보고 ID: ${result.error_id}\n\n관리자가 확인 후 수정하겠습니다. 감사합니다!`);
      } else {
        // 저장 실패 시 모달 표시
        setShowErrorModal(true);
        setErrorDescription(autoDescription);
        alert('자동 저장에 실패했습니다. 직접 내용을 확인하고 제출해주세요.');
      }
    } catch (error) {
      // 네트워크 오류 시 모달 표시
      setShowErrorModal(true);
      setErrorDescription(autoDescription);
      alert('오류 보고 중 문제가 발생했습니다. 직접 내용을 확인하고 제출해주세요.');
    } finally {
      setErrorSubmitting(false);
    }
  };

  const handleSubmitError = async () => {
    if (!errorDescription.trim()) {
      alert('오류 내용을 입력해주세요.');
      return;
    }

    setErrorSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/errors/report', {
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
        alert('오류가 성공적으로 보고되었습니다. 감사합니다!');
        setShowErrorModal(false);
        setErrorDescription('');
      } else {
        alert('오류 보고에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      alert('오류 보고 중 문제가 발생했습니다.');
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
    <div className="learning-page">
      {/* 헤더 */}
      <header className="learning-header">
        <div className="container">
          <h1 className="logo">
            <a href="/">🐍 EduPy</a>
          </h1>

          <div className="page-title-wrapper">
            <button
              className="header-nav-button prev-header-button"
              onClick={handlePrevious}
              disabled={!hasPrevious}
            >
              <span className="nav-emoji">⬅️</span>
              <span className="nav-text">이전</span>
            </button>

            <h2 className="page-title">
              🎮 파이게임 만들기 - Level {currentLevel.level} ({currentActivityIndex + 1}/{currentLevel.activities.length})
            </h2>

            <button
              className="header-nav-button next-header-button"
              onClick={handleNext}
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
                🎮 학습 메뉴 ▼
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
                {currentActivity.id}. {currentActivity.title}
                <span className={`difficulty-badge ${currentActivity.difficulty}`}>
                  {currentActivity.difficulty}
                </span>
              </h2>
            </div>
            <p className="activity-description">{currentActivity.description}</p>

            <div className="concepts">
              <strong>📚 학습 개념:</strong>
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
                      <>
                        <div
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.3)',
                            zIndex: 9999,
                          }}
                          onClick={() => setActiveTooltip(null)}
                        />
                        <div
                          style={{
                            position: 'fixed',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
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
                            lineHeight: '1.5',
                          }}
                        >
                          {explanation}
                        </div>
                      </>
                    )}
                  </span>
                );
              })}
            </div>

            <div className="hints-section">
              <strong>💡 힌트:</strong>
              <ul>
                {currentActivity.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Example Code */}
          <div className="example-code-section">
            <div className="example-header">
              <h3>📝 예제 코드</h3>
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
        </aside>

        {/* Right Panel - Code Editor & Output */}
        <main className="right-panel">
          {/* Code Editor */}
          <section className="code-editor-section">
            <div className="section-header">
              <h3>💻 코드 에디터</h3>
            </div>
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
              }}
            />
            <div className="run-button-container">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="run-button-center"
                title="코드 실행 (Ctrl+Enter)"
              >
                {isRunning ? '⏳ 실행 중...' : '▶️ 실행'}
              </button>
            </div>
          </section>

          {/* Output */}
          <section className="output-section">
            <div className="output-header">
              <span>🎮 게임 실행 결과</span>
              {hasError && (
                <button onClick={handleReportError} className="report-error-button">
                  🐛 오류 보고
                </button>
              )}
            </div>

            {gameImage ? (
              <div className="game-result">
                <img
                  src={gameImage}
                  alt="Game Screenshot"
                  className="pygame-screenshot"
                />
                <pre className="output-content">{output}</pre>
              </div>
            ) : (
              <pre className="output-content">
                {output || '▶️ 실행 버튼을 클릭하여 게임을 실행하세요!\n\n게임 화면이 여기에 표시됩니다.'}
              </pre>
            )}
          </section>
        </main>
      </div>

      {/* 오류 보고 모달 */}
      {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🐛 오류 보고</h2>
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

      <Footer />
    </div>
  );
}

