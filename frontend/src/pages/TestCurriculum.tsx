import { useState, useEffect } from 'react';
import { pythonCurriculum } from '../data/pythonCurriculum';
import { pygameCurriculum } from '../data/pygameCurriculum';
import { usePyodide, setupPythonEnvironment, wrapUserCode } from '../hooks/usePyodide';
import './TestCurriculum.css';

interface TestResult {
  id: string;
  title: string;
  code: string;
  output: string;
  error: string | null;
  hasInput: boolean;
  testInputs?: string[];
}

// 각 활동에 대한 테스트 입력값 정의
const testInputs: { [key: string]: string[] } = {
  // ===== 파이썬 기초 문법 =====
  // Level 3: 입력과 형변환
  '3-1': ['김파이'],
  '3-2': ['10'],
  '3-3': ['5', '3'],
  '3-4': ['80', '90', '85'],
  '3-5': ['125'],

  // Level 4: 조건문
  '4-1': ['15'],
  '4-2': ['7'],
  '4-3': ['85'],
  '4-4': ['y'],
  '4-5': ['수학'],

  // Level 5: 조건문 심화
  '5-1': ['85'],
  '5-2': ['150', '12'],
  '5-3': ['80', 'y'],
  '5-4': ['4'],
  '5-5': ['7'],

  // Level 6: 반복문
  '6-4': ['5'],
  '6-5': ['3'],

  // Level 7: 반복문 심화
  '7-1': ['10'],
  '7-2': ['5', '3', '0'],
  '7-3': ['3', '4'],
  '7-4': ['5'],
  '7-5': ['4'],

  // Level 8: 리스트와 딕셔너리
  // (input 없음)

  // Level 9: 랜덤과 모듈
  // 9-1은 while True 무한 루프이므로 테스트 제외
  '9-2': ['25', '30', '28', '26', '27'], // 최대 5번 시도
  '9-3': ['가위'],
  '9-5': ['김코딩'],

  // Level 10: Turtle 그래픽
  // turtle 모듈은 Pyodide에서 지원하지 않으므로 테스트 제외

  // ===== 파이게임 기초 문법 =====
  // Level 1: 출력과 입력
  '1-1': ['용사'],
  '1-4': ['김파이'],
  '1-5': ['보통'],
};

// 테스트를 건너뛸 활동 목록 (무한 루프 + pygame 실제 코드)
const skipTests: string[] = [
  // 파이썬 기초 문법
  '9-1', // while True 무한 루프 (숫자 맞추기 - 정답을 맞출 때까지)
  '7-2', // while True 무한 루프 (0이 나올 때까지)

  // 파이게임 - Level 11 (실제 pygame 코드)
  '11-1', // 기본 파이게임 루프
  '11-2', // 키보드로 원 이동
  '11-3', // 화면 가장자리에서 튕기기
  '11-4', // 여러 적 그리기
  '11-5', // 점수 텍스트 표시
];

interface TestCurriculumProps {
  hideHeader?: boolean;
}

export default function TestCurriculum({ hideHeader = false }: TestCurriculumProps) {
  const { pyodide, isReady, isLoading } = usePyodide();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [selectedCurriculum, setSelectedCurriculum] = useState<'python' | 'pygame'>('python');

  useEffect(() => {
    if (isReady && pyodide) {
      // 기본 print 오버라이드만 설정
      pyodide.runPython(`
import builtins

# print 오버라이드
def custom_print(*args, sep=' ', end='\\n', **kwargs):
    output = sep.join(str(arg) for arg in args)
    if 'js_print' in globals():
        js_print(output)

builtins.print = custom_print
      `);
    }
  }, [isReady, pyodide]);

  const runAllTests = async () => {
    if (!pyodide || !isReady) {
      alert('Pyodide가 아직 준비되지 않았습니다.');
      return;
    }

    setTesting(true);
    setResults([]);

    const allActivities: TestResult[] = [];
    let testIndex = 0;

    const curriculum = selectedCurriculum === 'python' ? pythonCurriculum : pygameCurriculum;

    for (const level of curriculum.levels) {
      for (const activity of level.activities) {
        testIndex++;
        setCurrentTest(testIndex);
        setTotalTests(curriculum.levels.reduce((sum, l) => sum + l.activities.length, 0));

        const hasInput = activity.starterCode.includes('input(');
        let output = '';
        let error = null;
        const inputs = testInputs[activity.id] || [];

        // 테스트 건너뛰기 목록에 있는 경우
        if (skipTests.includes(activity.id)) {
          const skipReason = '⏭️ 무한 루프 게임이므로 자동 테스트를 건너뜁니다.';

          const skippedResult: TestResult = {
            id: activity.id,
            title: activity.title,
            code: activity.starterCode,
            output: skipReason,
            error: null,
            hasInput,
            testInputs: inputs
          };

          allActivities.push(skippedResult);
          setResults([...allActivities]);

          // UI 업데이트를 위한 짧은 대기
          await new Promise(resolve => setTimeout(resolve, 10));
          continue;
        }

        // Turtle 모듈 테스트 (백엔드 API 사용)
        const isTurtleCode = activity.starterCode.includes('import turtle') ||
                            activity.starterCode.includes('from turtle');

        if (isTurtleCode) {
          try {
            const response = await fetch('http://localhost:8000/api/turtle/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: activity.starterCode,
                width: 600,
                height: 600,
                animate: false, // 테스트에서는 정적 이미지만
              }),
            });

            const result = await response.json();

            if (result.success) {
              output = '🐢 Turtle 그래픽 실행 성공!\n(이미지는 실제 학습 페이지에서 확인하세요)';
            } else {
              error = result.error || 'Turtle 실행 실패';
            }
          } catch (err: any) {
            error = `백엔드 연결 실패: ${err.message}`;
          }

          allActivities.push({
            id: activity.id,
            title: activity.title,
            code: activity.starterCode,
            output,
            error,
            hasInput: false,
            testInputs: []
          });

          setResults([...allActivities]);
          await new Promise(resolve => setTimeout(resolve, 10));
          continue;
        }

        // Pygame 모듈 테스트 (백엔드 API 사용)
        const isPygameCode = activity.starterCode.includes('import pygame') ||
                            activity.starterCode.includes('from pygame');

        if (isPygameCode) {
          try {
            const response = await fetch('http://localhost:8000/api/pygame/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: activity.starterCode,
                width: 600,
                height: 400,
                max_frames: 60,
              }),
            });

            const result = await response.json();

            if (result.success) {
              output = '🎮 Pygame 실행 성공!\n(이미지는 실제 학습 페이지에서 확인하세요)';
              if (result.output) {
                output += '\n\n출력:\n' + result.output;
              }
            } else {
              error = result.error || 'Pygame 실행 실패';
              if (result.output) {
                output = result.output;
              }
            }
          } catch (err: any) {
            error = `백엔드 연결 실패: ${err.message}`;
          }

          allActivities.push({
            id: activity.id,
            title: activity.title,
            code: activity.starterCode,
            output,
            error,
            hasInput: false,
            testInputs: []
          });

          setResults([...allActivities]);
          await new Promise(resolve => setTimeout(resolve, 10));
          continue;
        }

        try {
          // output 캡처
          const outputs: string[] = [];
          pyodide.globals.set('js_print', (...args: any[]) => {
            outputs.push(args.join(' '));
          });

          // input 처리 (테스트 값 사용)
          let inputIndex = 0;
          pyodide.globals.set('js_input', async (prompt: string) => {
            if (inputIndex >= inputs.length) {
              // 입력값이 부족한 경우 기본값 제공
              const defaultValue = '0';
              outputs.push(`[입력 부족 - 기본값: ${defaultValue}]`);
              inputIndex++;
              return defaultValue;
            }
            const value = inputs[inputIndex];
            inputIndex++;
            outputs.push(`[입력: ${value}]`);
            return value;
          });

          const wrappedCode = wrapUserCode(activity.starterCode);
          await pyodide.runPythonAsync(wrappedCode);
          output = outputs.join('\n');
        } catch (err: any) {
          error = err.message || String(err);
        }

        allActivities.push({
          id: activity.id,
          title: activity.title,
          code: activity.starterCode,
          output,
          error,
          hasInput,
          testInputs: inputs
        });

        setResults([...allActivities]);

        // UI 업데이트를 위한 짧은 대기
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    setTesting(false);
    setCurrentTest(0);
  };

  const successCount = results.filter(r => !r.error && !r.output.includes('⏭️') && !r.output.includes('🐢') && !r.output.includes('🎮')).length;
  const errorCount = results.filter(r => r.error).length;
  const skippedCount = results.filter(r => r.output.includes('⏭️')).length;
  const turtleCount = results.filter(r => r.output.includes('🐢')).length;
  const pygameCount = results.filter(r => r.output.includes('🎮')).length;

  return (
    <>
      {/* Header - hideHeader가 true면 숨김 */}
      {!hideHeader && (
        <header className="header">
          <div className="container">
            <h1 className="logo">
              <a href="/">🐍 EduPy</a>
            </h1>

            <div className="page-title-wrapper">
              <h2 className="page-title">
                🧪 커리큘럼 예제 코드 테스트
              </h2>
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
                  <div className="dropdown-item disabled">
                    📊 데이터 분석과 시각화 <span className="badge-coming-soon">준비중</span>
                  </div>
                  <div className="dropdown-item disabled">
                    🤖 AI 코딩 <span className="badge-coming-soon">준비중</span>
                  </div>
                  <div className="dropdown-item disabled">
                    🎮 파이게임 만들기 <span className="badge-coming-soon">준비중</span>
                  </div>
                </div>
              </div>

              <a href="/admin/login" className="admin-login-link" title="관리자 로그인">
                🔐
              </a>
            </div>
          </div>
        </header>
      )}

      <div className="test-curriculum-container">
        <div className="test-header">
          <p>모든 레벨의 예제 코드를 자동으로 테스트합니다</p>
        </div>

      {isLoading && (
        <div className="loading-message">
          <p>⏳ Pyodide 로딩 중...</p>
        </div>
      )}

      {isReady && !testing && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="curriculum-selector" style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            marginBottom: '30px'
          }}>
            <button
              className={`curriculum-tab ${selectedCurriculum === 'python' ? 'active' : ''}`}
              onClick={() => setSelectedCurriculum('python')}
              style={{
                padding: '12px 30px',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedCurriculum === 'python'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#e2e8f0',
                color: selectedCurriculum === 'python' ? 'white' : '#4a5568',
                transition: 'all 0.3s',
                boxShadow: selectedCurriculum === 'python'
                  ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                  : 'none'
              }}
            >
              🐍 파이썬 기초 문법
            </button>
            <button
              className={`curriculum-tab ${selectedCurriculum === 'pygame' ? 'active' : ''}`}
              onClick={() => setSelectedCurriculum('pygame')}
              style={{
                padding: '12px 30px',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedCurriculum === 'pygame'
                  ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
                  : '#e2e8f0',
                color: selectedCurriculum === 'pygame' ? 'white' : '#4a5568',
                transition: 'all 0.3s',
                boxShadow: selectedCurriculum === 'pygame'
                  ? '0 4px 15px rgba(72, 187, 120, 0.4)'
                  : 'none'
              }}
            >
              🎮 파이게임 기초 문법
            </button>
          </div>
          <button className="start-button" onClick={runAllTests}>
            🚀 {selectedCurriculum === 'python' ? '파이썬' : '파이게임'} 예제 테스트 시작
          </button>
        </div>
      )}

      {testing && (
        <div className="progress-section">
          <p className="progress-text">
            테스트 진행 중: {currentTest} / {totalTests}
          </p>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${(currentTest / totalTests) * 100}%` }}
            >
              {Math.round((currentTest / totalTests) * 100)}%
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '2rem', color: '#2d3748', marginBottom: '20px' }}>
            📊 {selectedCurriculum === 'python' ? '파이썬 기초 문법' : '파이게임 기초 문법'} 테스트 결과
          </h2>

          <div className="results-summary">
            <div className="summary-card success">
              <div className="summary-number">{successCount}</div>
              <div className="summary-label">✅ 성공</div>
            </div>
            <div className="summary-card error">
              <div className="summary-number">{errorCount}</div>
              <div className="summary-label">❌ 오류</div>
            </div>
            <div className="summary-card warning">
              <div className="summary-number">{skippedCount}</div>
              <div className="summary-label">⏭️ 건너뜀</div>
            </div>
            {turtleCount > 0 && (
              <div className="summary-card turtle">
                <div className="summary-number">{turtleCount}</div>
                <div className="summary-label">🐢 Turtle</div>
              </div>
            )}
            {pygameCount > 0 && (
              <div className="summary-card pygame">
                <div className="summary-number">{pygameCount}</div>
                <div className="summary-label">🎮 Pygame</div>
              </div>
            )}
          </div>

          <div className="results-grid">
            {results.map((result) => {
              const isSkipped = result.output.includes('⏭️');
              const isTurtle = result.output.includes('🐢');
              const isPygame = result.output.includes('🎮');
              const cardClass = result.error ? 'error' : isSkipped ? 'skipped' : 'success';

              return (
                <div key={result.id} className={`result-card ${cardClass}`}>
                  <div className="result-header">
                    <h3>
                      {result.error ? '❌' : isSkipped ? '⏭️' : '✅'} {result.id} - {result.title}
                    </h3>
                    {result.hasInput && result.testInputs && result.testInputs.length > 0 && (
                      <span className="result-badge input">⌨️ Input</span>
                    )}
                    {isTurtle && (
                      <span className="result-badge turtle">🐢 Turtle</span>
                    )}
                    {isPygame && (
                      <span className="result-badge pygame">🎮 Pygame</span>
                    )}
                  </div>

                  <details>
                    <summary className="code-toggle">📝 코드 보기</summary>
                    <div className="code-block">
                      <pre>{result.code}</pre>
                    </div>
                  </details>

                  {result.hasInput && (
                    <div>
                      {result.testInputs && result.testInputs.length > 0 ? (
                        <div className="test-inputs">
                          <p>📝 테스트 입력값: {result.testInputs.join(', ')}</p>
                        </div>
                      ) : (
                        <div className="no-inputs-warning">
                          <p>⚠️ 이 예제는 사용자 입력(input)이 필요하지만 테스트 입력값이 정의되지 않았습니다.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {result.error && (
                    <div className="error-output">
                      <strong>오류:</strong>
                      <pre>{result.error}</pre>
                    </div>
                  )}

                  {!result.error && result.output && (
                    <div className="success-output">
                      <strong>출력:</strong>
                      <pre>{result.output}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </>
  );
}

