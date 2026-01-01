import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { allDataCurriculums, dataConceptExplanations } from '../data/dataAnalysisCurriculum';
import { allAICurriculums, aiConceptExplanations } from '../data/aiCodingCurriculum';
import { usePyodide, setupPythonEnvironment, wrapUserCode, loadRequiredPackages } from '../hooks/usePyodide';
import ThemeDropdown from '../components/ThemeDropdown';
import LearningMenuDropdown from '../components/LearningMenuDropdown';
import OutputModal from '../components/OutputModal';
import Footer from '../components/Footer';
import { API_ENDPOINTS } from '../config/api';
import './PythonLearning.css';

export default function CurriculumLearning() {
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const navigate = useNavigate();
  const { pyodide, isReady: pyodideReady, isLoading: loadingPyodide } = usePyodide();

  // 커리큘럼 찾기
  const allCurriculums = [...allDataCurriculums, ...allAICurriculums];
  const curriculum = allCurriculums.find(c => c.id === curriculumId);
  const conceptExplanations = curriculumId?.startsWith('data') ? dataConceptExplanations : aiConceptExplanations;

  // 상태
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('복사');
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [userInput, setUserInput] = useState('');
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [showHelpSection, setShowHelpSection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{title: string, url: string, description: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const inputResolveRef = useRef<((value: string) => void) | null>(null);

  // 검색 기능 (데이터 분석 커리큘럼 전용)
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
      }
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 커리큘럼이 없으면 선택 페이지로 이동
  useEffect(() => {
    if (!curriculum) {
      toast.error('커리큘럼을 찾을 수 없습니다.');
      navigate('/');
    }
  }, [curriculum, navigate]);

  if (!curriculum) {
    return null;
  }

  const currentLevel = curriculum.levels[currentLevelIndex];
  const currentActivity = currentLevel.activities[currentActivityIndex];

  // LocalStorage에서 진행 상황 로드
  useEffect(() => {
    const saved = localStorage.getItem(`edupy_${curriculumId}_completed`);
    if (saved) {
      setCompletedActivities(new Set(JSON.parse(saved)));
    }

    const savedProgress = localStorage.getItem(`edupy_${curriculumId}_progress`);
    if (savedProgress) {
      const { levelIndex, activityIndex } = JSON.parse(savedProgress);
      setCurrentLevelIndex(levelIndex);
      setCurrentActivityIndex(activityIndex);
    }
  }, [curriculumId]);

  // 진행 상황 저장
  useEffect(() => {
    localStorage.setItem(`edupy_${curriculumId}_progress`, JSON.stringify({
      levelIndex: currentLevelIndex,
      activityIndex: currentActivityIndex
    }));
  }, [curriculumId, currentLevelIndex, currentActivityIndex]);

  // 완료 활동 저장
  useEffect(() => {
    localStorage.setItem(`edupy_${curriculumId}_completed`, JSON.stringify([...completedActivities]));
  }, [curriculumId, completedActivities]);

  // Pyodide 로딩 상태 표시
  useEffect(() => {
    if (loadingPyodide) {
      setOutput('🐍 Python 환경을 준비하고 있습니다...');
    } else if (pyodideReady) {
      setOutput('✅ Python 환경이 준비되었습니다! 코드를 작성하고 실행해보세요.');
    }
  }, [loadingPyodide, pyodideReady]);

  // 활동 변경 시 코드 초기화
  useEffect(() => {
    setCode('');
    setOutput(pyodideReady ? '✅ Python 환경이 준비되었습니다! 코드를 작성하고 실행해보세요.' : '');
    setWaitingForInput(false);
  }, [currentLevelIndex, currentActivityIndex, pyodideReady]);

  // 사용자 입력 제출
  const handleInputSubmit = () => {
    if (!userInput.trim() || !inputResolveRef.current) return;

    const value = userInput;
    setOutput(prev => prev + value + '\n');

    const resolve = inputResolveRef.current;
    inputResolveRef.current = null;
    setUserInput('');
    setWaitingForInput(false);

    resolve(value);
  };

  // 코드 실행
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

      // 코드에 필요한 패키지 로드
      await loadRequiredPackages(pyodide, code);

      const wrappedCode = wrapUserCode(code);
      await pyodide.runPythonAsync(wrappedCode);

      setIsRunning(false);

      if (!outputBuffer.trim()) {
        setOutput('실행 완료 (출력 없음)');
      }

      // 활동 완료 표시
      setCompletedActivities(prev => new Set([...prev, currentActivity.id]));
      toast.success('코드 실행 완료!');

    } catch (error: any) {
      let errorMsg = error.message || String(error);
      setOutput(prev => (prev ? prev + '\n\n' : '') + `❌ 오류:\n${errorMsg}`);
      setIsRunning(false);
    }
  };

  // 이전/다음 활동 이동
  const goToNextActivity = () => {
    if (currentActivityIndex < currentLevel.activities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
    } else if (currentLevelIndex < curriculum.levels.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setCurrentActivityIndex(0);
    } else {
      toast.success('🎉 모든 과정을 완료했습니다!');
    }
  };

  const goToPreviousActivity = () => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(currentActivityIndex - 1);
    } else if (currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
      const prevLevel = curriculum.levels[currentLevelIndex - 1];
      setCurrentActivityIndex(prevLevel.activities.length - 1);
    }
  };

  const hasPrevious = currentLevelIndex > 0 || currentActivityIndex > 0;
  const hasNext = currentLevelIndex < curriculum.levels.length - 1 ||
                  currentActivityIndex < currentLevel.activities.length - 1;

  // 예제 코드 복사
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentActivity.starterCode);
      setCopyButtonText('✓ 복사됨!');
      setTimeout(() => setCopyButtonText('복사'), 2000);
    } catch (err) {
      setCopyButtonText('복사 실패');
      setTimeout(() => setCopyButtonText('복사'), 2000);
    }
  };

  // 진행 상황 초기화
  const resetProgress = () => {
    if (window.confirm('모든 학습 진행 상황을 초기화하시겠습니까?')) {
      setCompletedActivities(new Set());
      setCurrentLevelIndex(0);
      setCurrentActivityIndex(0);
      setCode('');
      setOutput('');
      localStorage.removeItem(`edupy_${curriculumId}_completed`);
      localStorage.removeItem(`edupy_${curriculumId}_progress`);
      toast.success('진행 상황이 초기화되었습니다.');
    }
  };

  // 특정 활동으로 이동
  const goToActivity = (levelIndex: number, activityIndex: number) => {
    setCurrentLevelIndex(levelIndex);
    setCurrentActivityIndex(activityIndex);
    setShowProgressModal(false);
  };

  // 총 활동 수 계산
  const totalActivities = curriculum.levels.reduce((sum, level) => sum + level.activities.length, 0);

  return (
    <div className="python-learning curriculum-learning">
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
              <i className={curriculum.icon}></i> {curriculum.title} ({curriculum.gradeLevelKorean}) - Level {currentLevel.level}
              {completedActivities.has(currentActivity.id) && <span className="completed-badge"><i className="fi fi-rr-check"></i> 완료</span>}
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
            <ThemeDropdown />

            <LearningMenuDropdown />

            <a href="/admin/login" className="admin-login-link" title="관리자 로그인">
              <i className="fi fi-rr-lock"></i>
            </a>
          </div>
        </div>
      </header>

      <div className="learning-container">
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
                <i className="fi fi-rr-refresh"></i> 학습 초기화
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
                onMouseEnter={() => setActiveTooltip(index)}
                onMouseLeave={() => setActiveTooltip(null)}
                style={{ position: 'relative', cursor: 'help' }}
              >
                {concept}
                {activeTooltip === index && conceptExplanations[concept] && (
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
                      lineHeight: '1.5'
                    }}
                  >
                    {conceptExplanations[concept]}
                  </span>
                )}
              </span>
            ))}
          </div>

          {currentActivity.hint && (
            <div className="hint-box" style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '8px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <strong><i className="fi fi-rr-lightbulb-on"></i> 힌트:</strong> {currentActivity.hint}
            </div>
          )}
        </div>

        {/* Editor Row */}
        <div className="editor-row">
          {/* Left Panel - Example Code */}
          <div className="left-panel">
            <div className="example-code-section">
              <div className="example-header">
                <span><i className="fi fi-rr-document"></i> 예제 코드</span>
                <button className="copy-button" onClick={handleCopyCode} title="예제 코드 복사">
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
          </div>

          {/* Right Panel - Code Editor */}
          <div className="right-panel">
            <section className="code-editor-section">
              <div className="editor-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: curriculum.color,
                color: 'white',
                fontWeight: '600',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px'
              }}>
                <span style={{ fontSize: '1rem' }}><i className="fi fi-rr-laptop-code"></i> 코드 작성</span>
                <button
                  className="run-button"
                  onClick={handleRunCode}
                  disabled={isRunning || !pyodideReady}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: isRunning || !pyodideReady
                      ? 'rgba(255, 255, 255, 0.3)'
                      : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: isRunning || !pyodideReady ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {isRunning ? (
                    <><i className="fi fi-rr-spinner"></i> 실행 중...</>
                  ) : !pyodideReady ? (
                    <><i className="fi fi-rr-hourglass-end"></i> 준비 중...</>
                  ) : (
                    <><i className="fi fi-rr-play"></i> 실행</>
                  )}
                </button>
              </div>
              <Editor
                height={`${Math.max(250, currentActivity.starterCode.split('\n').length * 28 + 20)}px`}
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
                  cursorSurroundingLines: 3,
                  cursorSurroundingLinesStyle: 'all',
                }}
              />
            </section>
          </div>
        </div>

        {/* 도움 받기 / 원하는 기능 찾기 - 데이터 분석 및 AI 커리큘럼 */}
        {(curriculumId?.startsWith('data') || curriculumId?.startsWith('ai')) && (
          <div className="help-section" style={{ marginTop: '1.5rem' }}>
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
                <div className="search-box">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="궁금한 내용을 검색하세요 (예: pandas, 그래프, 데이터프레임)"
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

                <div className="help-links">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="search-results-header">
                        <i className="fi fi-rr-search"></i> 검색 결과 {searchResults.length}개
                      </div>
                      {searchResults.map((result, index) => {
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
        )}

        </div>

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="modal-overlay" onClick={() => setShowProgressModal(false)}>
          <div className="modal-content curriculum-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className={curriculum.icon}></i> {curriculum.title} ({curriculum.gradeLevelKorean})</h2>
              <button className="modal-close" onClick={() => setShowProgressModal(false)}>
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="progress-summary" style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#f7fafc',
                borderRadius: '8px'
              }}>
                <div className="progress-stat">
                  <span className="stat-label">완료</span>
                  <span className="stat-value" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#48bb78' }}>
                    {completedActivities.size}
                  </span>
                </div>
                <div className="progress-stat">
                  <span className="stat-label">전체</span>
                  <span className="stat-value" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {totalActivities}
                  </span>
                </div>
                <div className="progress-stat">
                  <span className="stat-label">진행률</span>
                  <span className="stat-value" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--theme-accent)' }}>
                    {Math.round(completedActivities.size / totalActivities * 100)}%
                  </span>
                </div>
              </div>

              {curriculum.levels.map((level, levelIndex) => (
                <div key={level.level} style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    color: '#4a5568',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    Level {level.level}: {level.title}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {level.activities.map((activity, activityIndex) => {
                      const isCurrent = levelIndex === currentLevelIndex && activityIndex === currentActivityIndex;
                      const isCompleted = completedActivities.has(activity.id);

                      return (
                        <button
                          key={activity.id}
                          onClick={() => goToActivity(levelIndex, activityIndex)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: isCurrent ? '2px solid var(--theme-accent)' : '1px solid #e2e8f0',
                            background: isCompleted ? '#48bb78' : isCurrent ? '#f7fafc' : 'white',
                            color: isCompleted ? 'white' : '#4a5568',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isCompleted && <i className="fi fi-rr-check" style={{ marginRight: '4px' }}></i>}
                          {activity.id}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
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
        waitingForInput={waitingForInput}
        inputPrompt={inputPrompt}
        userInput={userInput}
        onUserInputChange={setUserInput}
        onInputSubmit={handleInputSubmit}
        level={`Level ${currentLevel.level}: ${currentLevel.title}`}
        activity={`${currentActivity.id} - ${currentActivity.title}`}
      />

      <Footer />
    </div>
  );
}
