import { useState, useEffect, useRef } from 'react';
import './RecursionVisualization.css';

type RecursionType = 'factorial' | 'fibonacci';

interface CallFrame {
  n: number;
  depth: number;
  result?: number;
  phase: 'call' | 'return';
}

interface RecursionStep {
  stack: CallFrame[];
  currentFrame?: CallFrame;
  message: string;
  finalResult?: number;
}

interface RecursionVisualizationProps {
  type: RecursionType;
  initialValue?: number;
  autoStart?: boolean;
}

export default function RecursionVisualization({
  type,
  initialValue = 5,
  autoStart = false
}: RecursionVisualizationProps) {
  const [n, setN] = useState(initialValue);
  const [steps, setSteps] = useState<RecursionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef<number | null>(null);

  // 재귀 알고리즘 실행 및 단계 생성
  const generateRecursionSteps = (value: number, recursionType: RecursionType): RecursionStep[] => {
    const steps: RecursionStep[] = [];
    const callStack: CallFrame[] = [];

    steps.push({
      stack: [],
      message: `${recursionType === 'factorial' ? 'factorial' : 'fibonacci'}(${value}) 호출 시작`
    });

    if (recursionType === 'factorial') {
      // 팩토리얼 재귀
      const factorial = (num: number, depth: number = 0): number => {
        // 호출 단계
        const frame: CallFrame = { n: num, depth, phase: 'call' };
        callStack.push(frame);

        steps.push({
          stack: [...callStack],
          currentFrame: frame,
          message: `factorial(${num}) 호출 (깊이: ${depth})`
        });

        // 기저 조건
        if (num === 0 || num === 1) {
          steps.push({
            stack: [...callStack],
            currentFrame: frame,
            message: `기저 조건: factorial(${num}) = 1`
          });

          frame.result = 1;
          frame.phase = 'return';

          steps.push({
            stack: [...callStack],
            currentFrame: frame,
            message: `factorial(${num}) 반환: 1`
          });

          callStack.pop();

          steps.push({
            stack: [...callStack],
            message: `스택에서 제거`
          });

          return 1;
        }

        // 재귀 호출
        steps.push({
          stack: [...callStack],
          currentFrame: frame,
          message: `factorial(${num}) = ${num} × factorial(${num - 1})`
        });

        const result = num * factorial(num - 1, depth + 1);

        // 반환 단계
        frame.result = result;
        frame.phase = 'return';

        steps.push({
          stack: [...callStack],
          currentFrame: frame,
          message: `factorial(${num}) = ${num} × ${result / num} = ${result}`
        });

        steps.push({
          stack: [...callStack],
          currentFrame: frame,
          message: `factorial(${num}) 반환: ${result}`
        });

        callStack.pop();

        if (callStack.length === 0) {
          steps.push({
            stack: [],
            message: `최종 결과: ${result}`,
            finalResult: result
          });
        } else {
          steps.push({
            stack: [...callStack],
            message: `스택에서 제거`
          });
        }

        return result;
      };

      factorial(value);
    } else if (recursionType === 'fibonacci') {
      // 피보나치 재귀
      const fibonacci = (num: number, depth: number = 0): number => {
        const frame: CallFrame = { n: num, depth, phase: 'call' };
        callStack.push(frame);

        steps.push({
          stack: [...callStack],
          currentFrame: frame,
          message: `fibonacci(${num}) 호출 (깊이: ${depth})`
        });

        // 기저 조건
        if (num <= 1) {
          steps.push({
            stack: [...callStack],
            currentFrame: frame,
            message: `기저 조건: fibonacci(${num}) = ${num}`
          });

          frame.result = num;
          frame.phase = 'return';

          steps.push({
            stack: [...callStack],
            currentFrame: frame,
            message: `fibonacci(${num}) 반환: ${num}`
          });

          callStack.pop();

          steps.push({
            stack: [...callStack],
            message: `스택에서 제거`
          });

          return num;
        }

        // 재귀 호출
        steps.push({
          stack: [...callStack],
          currentFrame: frame,
          message: `fibonacci(${num}) = fibonacci(${num - 1}) + fibonacci(${num - 2})`
        });

        const result1 = fibonacci(num - 1, depth + 1);

        steps.push({
          stack: [...callStack],
          currentFrame: frame,
          message: `fibonacci(${num - 1}) = ${result1}, 이제 fibonacci(${num - 2}) 계산`
        });

        const result2 = fibonacci(num - 2, depth + 1);

        const result = result1 + result2;

        frame.result = result;
        frame.phase = 'return';

        steps.push({
          stack: [...callStack],
          currentFrame: frame,
          message: `fibonacci(${num}) = ${result1} + ${result2} = ${result}`
        });

        steps.push({
          stack: [...callStack],
          currentFrame: frame,
          message: `fibonacci(${num}) 반환: ${result}`
        });

        callStack.pop();

        if (callStack.length === 0) {
          steps.push({
            stack: [],
            message: `최종 결과: ${result}`,
            finalResult: result
          });
        } else {
          steps.push({
            stack: [...callStack],
            message: `스택에서 제거`
          });
        }

        return result;
      };

      fibonacci(value);
    }

    return steps;
  };

  const handleStart = () => {
    if (n < 0 || n > 10) {
      alert('0부터 10 사이의 숫자를 입력하세요.');
      return;
    }

    const recursionSteps = generateRecursionSteps(n, type);
    setSteps(recursionSteps);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleReset = () => {
    handlePause();
    setSteps([]);
    setCurrentStep(0);
  };

  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 자동 재생
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length, speed]);

  // Auto start
  useEffect(() => {
    if (autoStart) {
      setTimeout(() => handleStart(), 500);
    }
  }, [autoStart]);

  const currentStepData = steps[currentStep];

  const getAlgorithmName = () => {
    switch (type) {
      case 'factorial':
        return '팩토리얼';
      case 'fibonacci':
        return '피보나치';
    }
  };

  return (
    <div className="recursion-visualization">
      <div className="visualization-header">
        <div className="algo-title">
          <i className="fi fi-rr-layers"></i>
          <h4>{getAlgorithmName()} 재귀 시각화</h4>
        </div>
        <div className="speed-control">
          <label>속도:</label>
          <input
            type="range"
            min="300"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{(2000 / speed).toFixed(1)}x</span>
        </div>
      </div>

      <div className="input-display">
        <span className="label">입력값 (n):</span>
        <input
          type="number"
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          disabled={steps.length > 0}
          min="0"
          max="10"
          className="value-input"
        />
        <span className="hint">(0~10 권장)</span>
      </div>

      <div className="visualization-canvas">
        <div className="stack-container">
          <div className="stack-label">
            <i className="fi fi-rr-layer-plus"></i>
            호출 스택 (깊이: {currentStepData?.stack.length || 0})
          </div>

          <div className="stack-frames">
            {currentStepData?.stack.length === 0 ? (
              <div className="empty-stack">
                <i className="fi fi-rr-inbox"></i>
                <span>스택이 비어있습니다</span>
              </div>
            ) : (
              currentStepData?.stack.map((frame, index) => {
                const isCurrent = currentStepData.currentFrame === frame;
                const indent = frame.depth * 20;

                return (
                  <div
                    key={index}
                    className={`stack-frame ${isCurrent ? 'current' : ''} ${frame.phase}`}
                    style={{ marginLeft: `${indent}px` }}
                  >
                    <div className="frame-header">
                      <span className="frame-function">
                        {type}({frame.n})
                      </span>
                      <span className="frame-depth">깊이: {frame.depth}</span>
                    </div>
                    <div className="frame-body">
                      <div className="frame-info">
                        <span className="info-label">상태:</span>
                        <span className={`info-value ${frame.phase}`}>
                          {frame.phase === 'call' ? '호출 중' : '반환 중'}
                        </span>
                      </div>
                      {frame.result !== undefined && (
                        <div className="frame-info">
                          <span className="info-label">결과:</span>
                          <span className="info-value result">{frame.result}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {currentStepData?.message && (
          <div className="step-message">
            <i className="fi fi-rr-comment-info"></i>
            {currentStepData.message}
          </div>
        )}

        {currentStepData?.finalResult !== undefined && (
          <div className="final-result">
            <i className="fi fi-rr-check-circle"></i>
            <span>최종 결과: {getAlgorithmName()}({n}) = {currentStepData.finalResult}</span>
          </div>
        )}
      </div>

      <div className="visualization-controls">
        <div className="playback-controls">
          <button
            className="control-btn"
            onClick={handleStepBackward}
            disabled={currentStep === 0}
          >
            <i className="fi fi-rr-angle-left"></i>
          </button>

          {steps.length === 0 ? (
            <button className="control-btn primary" onClick={handleStart}>
              <i className="fi fi-rr-play"></i>
              시작
            </button>
          ) : isPlaying ? (
            <button className="control-btn primary" onClick={handlePause}>
              <i className="fi fi-rr-pause"></i>
              일시정지
            </button>
          ) : (
            <button
              className="control-btn primary"
              onClick={() => setIsPlaying(true)}
              disabled={currentStep >= steps.length - 1}
            >
              <i className="fi fi-rr-play"></i>
              재생
            </button>
          )}

          <button
            className="control-btn"
            onClick={handleStepForward}
            disabled={currentStep >= steps.length - 1}
          >
            <i className="fi fi-rr-angle-right"></i>
          </button>
        </div>

        <button className="control-btn" onClick={handleReset}>
          <i className="fi fi-rr-refresh"></i>
          초기화
        </button>
      </div>

      {steps.length > 0 && (
        <div className="progress-bar-container">
          <div className="progress-label">
            진행: {currentStep + 1} / {steps.length}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
