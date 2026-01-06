import { useState, useEffect, useRef } from 'react';
import './SearchVisualization.css';

type SearchAlgorithm = 'linear' | 'binary';

interface SearchStep {
  array: number[];
  currentIndex?: number;
  left?: number;
  right?: number;
  mid?: number;
  found?: boolean;
  message: string;
}

interface SearchVisualizationProps {
  algorithm: SearchAlgorithm;
  initialArray?: number[];
  target?: number;
  autoStart?: boolean;
}

export default function SearchVisualization({
  algorithm,
  initialArray = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
  target = 13,
  autoStart = false
}: SearchVisualizationProps) {
  const [array, setArray] = useState<number[]>(initialArray);
  const [searchTarget, setSearchTarget] = useState(target);
  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const intervalRef = useRef<number | null>(null);

  // 탐색 알고리즘 실행 및 단계 생성
  const generateSearchSteps = (arr: number[], target: number, algo: SearchAlgorithm): SearchStep[] => {
    const steps: SearchStep[] = [];

    steps.push({
      array: [...arr],
      message: `${target}을(를) 찾습니다...`
    });

    if (algo === 'linear') {
      // 순차 탐색
      for (let i = 0; i < arr.length; i++) {
        steps.push({
          array: [...arr],
          currentIndex: i,
          message: `[${i}번 인덱스] ${arr[i]}와(과) ${target}을(를) 비교`
        });

        if (arr[i] === target) {
          steps.push({
            array: [...arr],
            currentIndex: i,
            found: true,
            message: `✅ ${target}을(를) ${i}번 인덱스에서 찾았습니다!`
          });
          return steps;
        }
      }

      steps.push({
        array: [...arr],
        found: false,
        message: `❌ ${target}을(를) 찾지 못했습니다.`
      });
    } else if (algo === 'binary') {
      // 이진 탐색
      let left = 0;
      let right = arr.length - 1;
      let stepCount = 0;

      while (left <= right) {
        stepCount++;
        const mid = Math.floor((left + right) / 2);

        steps.push({
          array: [...arr],
          left,
          right,
          mid,
          message: `[단계 ${stepCount}] 탐색 범위: [${left}~${right}], 중간 인덱스: ${mid}`
        });

        steps.push({
          array: [...arr],
          left,
          right,
          mid,
          currentIndex: mid,
          message: `중간값 ${arr[mid]}와(과) ${target}을(를) 비교`
        });

        if (arr[mid] === target) {
          steps.push({
            array: [...arr],
            left,
            right,
            mid,
            currentIndex: mid,
            found: true,
            message: `✅ ${target}을(를) ${mid}번 인덱스에서 찾았습니다! (${stepCount}단계 소요)`
          });
          return steps;
        } else if (arr[mid] < target) {
          steps.push({
            array: [...arr],
            left,
            right,
            mid,
            message: `${arr[mid]} < ${target} → 오른쪽 절반 탐색`
          });
          left = mid + 1;
        } else {
          steps.push({
            array: [...arr],
            left,
            right,
            mid,
            message: `${arr[mid]} > ${target} → 왼쪽 절반 탐색`
          });
          right = mid - 1;
        }
      }

      steps.push({
        array: [...arr],
        found: false,
        message: `❌ ${target}을(를) 찾지 못했습니다. (${stepCount}단계 소요)`
      });
    }

    return steps;
  };

  const handleStart = () => {
    const searchSteps = generateSearchSteps(array, searchTarget, algorithm);
    setSteps(searchSteps);
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

  const handleRandomize = () => {
    const newArray = Array.from({ length: 10 }, (_, i) => (i + 1) * 2 - 1).sort((a, b) => a - b);
    setArray(newArray);
    const randomTarget = newArray[Math.floor(Math.random() * newArray.length)];
    setSearchTarget(randomTarget);
    setSteps([]);
    setCurrentStep(0);
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
    switch (algorithm) {
      case 'linear':
        return '순차 탐색';
      case 'binary':
        return '이진 탐색';
    }
  };

  const getElementClass = (index: number) => {
    if (!currentStepData) return 'element';

    let className = 'element';

    if (currentStepData.currentIndex === index) {
      className += ' current';
    }

    if (currentStepData.mid === index) {
      className += ' mid';
    }

    if (currentStepData.left !== undefined && index < currentStepData.left) {
      className += ' excluded';
    }

    if (currentStepData.right !== undefined && index > currentStepData.right) {
      className += ' excluded';
    }

    if (currentStepData.found && currentStepData.currentIndex === index) {
      className += ' found';
    }

    return className;
  };

  return (
    <div className="search-visualization">
      <div className="visualization-header">
        <div className="algo-title">
          <i className="fi fi-rr-search"></i>
          <h4>{getAlgorithmName()} 시각화</h4>
        </div>
        <div className="speed-control">
          <label>속도:</label>
          <input
            type="range"
            min="200"
            max="1500"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{(1500 / speed).toFixed(1)}x</span>
        </div>
      </div>

      <div className="target-display">
        <span className="label">찾을 값:</span>
        <span className="target-value">{searchTarget}</span>
        <input
          type="number"
          value={searchTarget}
          onChange={(e) => setSearchTarget(Number(e.target.value))}
          disabled={steps.length > 0}
          className="target-input"
        />
      </div>

      <div className="visualization-canvas">
        <div className="elements-container">
          {array.map((value, index) => {
            const className = getElementClass(index);

            return (
              <div key={index} className="element-wrapper">
                <div className={className}>
                  <div className="element-value">{value}</div>
                  <div className="element-index">{index}</div>
                </div>
                {currentStepData?.left === index && (
                  <div className="pointer left-pointer">
                    <i className="fi fi-rr-arrow-small-up"></i>
                    <span>left</span>
                  </div>
                )}
                {currentStepData?.right === index && (
                  <div className="pointer right-pointer">
                    <i className="fi fi-rr-arrow-small-up"></i>
                    <span>right</span>
                  </div>
                )}
                {currentStepData?.mid === index && (
                  <div className="pointer mid-pointer">
                    <i className="fi fi-rr-arrow-small-up"></i>
                    <span>mid</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {currentStepData?.message && (
          <div className="step-message">
            <i className="fi fi-rr-comment-info"></i>
            {currentStepData.message}
          </div>
        )}
      </div>

      <div className="visualization-controls">
        <button className="control-btn" onClick={handleRandomize} disabled={steps.length > 0}>
          <i className="fi fi-rr-shuffle"></i>
          랜덤 생성
        </button>

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
