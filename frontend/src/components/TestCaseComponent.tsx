import { useState } from 'react';
import './TestCaseComponent.css';

export interface TestCase {
  input?: string;
  expectedOutput: string;
  description: string;
}

interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actualOutput: string;
}

interface TestCaseComponentProps {
  testCases: TestCase[];
  onRunTests: (testCases: TestCase[]) => Promise<TestResult[]>;
}

export default function TestCaseComponent({ testCases, onRunTests }: TestCaseComponentProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    setShowResults(false);

    try {
      const testResults = await onRunTests(testCases);
      setResults(testResults);
      setShowResults(true);
    } catch (error) {
      console.error('테스트 실행 중 오류:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount && totalCount > 0;

  return (
    <div className="test-case-component">
      <div className="test-header">
        <div className="test-title">
          <i className="fi fi-rr-checkbox"></i>
          <h4>테스트 케이스</h4>
          <span className="test-count">{testCases.length}개</span>
        </div>
        <button
          className="run-tests-btn"
          onClick={handleRunTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <i className="fi fi-rr-spinner spinning"></i>
              실행 중...
            </>
          ) : (
            <>
              <i className="fi fi-rr-play"></i>
              테스트 실행
            </>
          )}
        </button>
      </div>

      {!showResults && (
        <div className="test-cases-list">
          {testCases.map((testCase, index) => (
            <div key={index} className="test-case-item">
              <div className="test-case-number">테스트 {index + 1}</div>
              <div className="test-case-desc">{testCase.description}</div>
              {testCase.input && (
                <div className="test-case-detail">
                  <span className="detail-label">입력:</span>
                  <code>{testCase.input}</code>
                </div>
              )}
              <div className="test-case-detail">
                <span className="detail-label">기대 출력:</span>
                <code>{testCase.expectedOutput}</code>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && (
        <div className="test-results">
          <div className={`results-summary ${allPassed ? 'all-passed' : 'some-failed'}`}>
            <div className="summary-icon">
              {allPassed ? (
                <i className="fi fi-rr-badge-check"></i>
              ) : (
                <i className="fi fi-rr-exclamation"></i>
              )}
            </div>
            <div className="summary-text">
              <h5>
                {allPassed ? '모든 테스트 통과! 🎉' : `${passedCount}/${totalCount} 테스트 통과`}
              </h5>
              <p>
                {allPassed
                  ? '훌륭합니다! 모든 테스트 케이스를 통과했습니다.'
                  : '일부 테스트가 실패했습니다. 코드를 다시 확인해보세요.'}
              </p>
            </div>
          </div>

          <div className="results-list">
            {results.map((result, index) => (
              <div
                key={index}
                className={`result-item ${result.passed ? 'passed' : 'failed'}`}
              >
                <div className="result-header">
                  <div className="result-status">
                    {result.passed ? (
                      <i className="fi fi-rr-check-circle"></i>
                    ) : (
                      <i className="fi fi-rr-cross-circle"></i>
                    )}
                    <span>테스트 {index + 1}</span>
                  </div>
                  <div className="result-badge">
                    {result.passed ? '통과' : '실패'}
                  </div>
                </div>

                <div className="result-description">
                  {result.testCase.description}
                </div>

                {result.testCase.input && (
                  <div className="result-detail">
                    <span className="detail-label">입력:</span>
                    <code>{result.testCase.input}</code>
                  </div>
                )}

                <div className="result-detail">
                  <span className="detail-label">기대 출력:</span>
                  <code className="expected">{result.testCase.expectedOutput}</code>
                </div>

                <div className="result-detail">
                  <span className="detail-label">실제 출력:</span>
                  <code className={result.passed ? 'actual-pass' : 'actual-fail'}>
                    {result.actualOutput || '(출력 없음)'}
                  </code>
                </div>

                {!result.passed && (
                  <div className="result-hint">
                    <i className="fi fi-rr-bulb"></i>
                    출력이 기대값과 다릅니다. 코드의 로직을 다시 확인해보세요.
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="retry-tests-btn" onClick={() => setShowResults(false)}>
            <i className="fi fi-rr-refresh"></i>
            테스트 목록으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
}
