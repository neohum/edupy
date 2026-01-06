import { useState, useEffect, useRef } from 'react';
import './SortingVisualization.css';

type SortingAlgorithm = 'bubble' | 'selection' | 'insertion';

interface SortingStep {
  array: number[];
  comparing?: [number, number];
  swapping?: [number, number];
  sorted?: number[];
  message?: string;
}

interface SortingVisualizationProps {
  algorithm: SortingAlgorithm;
  initialArray?: number[];
  autoStart?: boolean;
}

export default function SortingVisualization({
  algorithm,
  initialArray = [64, 34, 25, 12, 22, 11, 90],
  autoStart = false
}: SortingVisualizationProps) {
  const [array, setArray] = useState<number[]>(initialArray);
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms
  const intervalRef = useRef<number | null>(null);

  // 정렬 알고리즘 실행 및 단계 생성
  const generateSortingSteps = (arr: number[], algo: SortingAlgorithm): SortingStep[] => {
    const steps: SortingStep[] = [];
    const tempArray = [...arr];
    const sortedIndices: number[] = [];

    steps.push({
      array: [...tempArray],
      message: '정렬 시작'
    });

    if (algo === 'bubble') {
      // 버블 정렬
      for (let i = 0; i < tempArray.length; i++) {
        for (let j = 0; j < tempArray.length - 1 - i; j++) {
          steps.push({
            array: [...tempArray],
            comparing: [j, j + 1],
            sorted: [...sortedIndices],
            message: `${tempArray[j]}과(와) ${tempArray[j + 1]}을(를) 비교`
          });

          if (tempArray[j] > tempArray[j + 1]) {
            steps.push({
              array: [...tempArray],
              swapping: [j, j + 1],
              sorted: [...sortedIndices],
              message: `${tempArray[j]}과(와) ${tempArray[j + 1]}을(를) 교환`
            });

            [tempArray[j], tempArray[j + 1]] = [tempArray[j + 1], tempArray[j]];

            steps.push({
              array: [...tempArray],
              sorted: [...sortedIndices],
              message: '교환 완료'
            });
          }
        }
        sortedIndices.push(tempArray.length - 1 - i);
      }
    } else if (algo === 'selection') {
      // 선택 정렬
      for (let i = 0; i < tempArray.length - 1; i++) {
        let minIdx = i;

        for (let j = i + 1; j < tempArray.length; j++) {
          steps.push({
            array: [...tempArray],
            comparing: [minIdx, j],
            sorted: [...sortedIndices],
            message: `최솟값 찾기: 현재 최솟값 ${tempArray[minIdx]}, 비교 대상 ${tempArray[j]}`
          });

          if (tempArray[j] < tempArray[minIdx]) {
            minIdx = j;
          }
        }

        if (minIdx !== i) {
          steps.push({
            array: [...tempArray],
            swapping: [i, minIdx],
            sorted: [...sortedIndices],
            message: `${tempArray[i]}과(와) ${tempArray[minIdx]}을(를) 교환`
          });

          [tempArray[i], tempArray[minIdx]] = [tempArray[minIdx], tempArray[i]];
        }

        sortedIndices.push(i);
        steps.push({
          array: [...tempArray],
          sorted: [...sortedIndices],
          message: `위치 ${i}에 ${tempArray[i]} 확정`
        });
      }
      sortedIndices.push(tempArray.length - 1);
    } else if (algo === 'insertion') {
      // 삽입 정렬
      sortedIndices.push(0);

      for (let i = 1; i < tempArray.length; i++) {
        const key = tempArray[i];
        let j = i - 1;

        steps.push({
          array: [...tempArray],
          comparing: [i, i],
          sorted: [...sortedIndices],
          message: `${key}을(를) 정렬된 부분에 삽입할 위치 찾기`
        });

        while (j >= 0 && tempArray[j] > key) {
          steps.push({
            array: [...tempArray],
            comparing: [j, j + 1],
            sorted: [...sortedIndices],
            message: `${tempArray[j]}을(를) 오른쪽으로 이동`
          });

          tempArray[j + 1] = tempArray[j];
          j--;

          steps.push({
            array: [...tempArray],
            sorted: [...sortedIndices],
            message: '이동 완료'
          });
        }

        tempArray[j + 1] = key;
        sortedIndices.push(i);

        steps.push({
          array: [...tempArray],
          sorted: [...sortedIndices],
          message: `${key}을(를) 위치 ${j + 1}에 삽입`
        });
      }
    }

    steps.push({
      array: [...tempArray],
      sorted: [...sortedIndices],
      message: '정렬 완료! 🎉'
    });

    return steps;
  };

  const handleStart = () => {
    const sortingSteps = generateSortingSteps(array, algorithm);
    setSteps(sortingSteps);
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
    setArray(initialArray);
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
    const newArray = Array.from({ length: 7 }, () => Math.floor(Math.random() * 90) + 10);
    setArray(newArray);
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
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
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
  const displayArray = currentStepData?.array || array;
  const maxValue = Math.max(...displayArray);

  const getAlgorithmName = () => {
    switch (algorithm) {
      case 'bubble':
        return '버블 정렬';
      case 'selection':
        return '선택 정렬';
      case 'insertion':
        return '삽입 정렬';
    }
  };

  return (
    <div className="sorting-visualization">
      <div className="visualization-header">
        <div className="algo-title">
          <i className="fi fi-rr-chart-histogram"></i>
          <h4>{getAlgorithmName()} 시각화</h4>
        </div>
        <div className="speed-control">
          <label>속도:</label>
          <input
            type="range"
            min="100"
            max="1000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{(1000 / speed).toFixed(1)}x</span>
        </div>
      </div>

      <div className="visualization-canvas">
        <div className="bars-container">
          {displayArray.map((value, index) => {
            let className = 'bar';

            if (currentStepData?.comparing?.includes(index)) {
              className += ' comparing';
            }
            if (currentStepData?.swapping?.includes(index)) {
              className += ' swapping';
            }
            if (currentStepData?.sorted?.includes(index)) {
              className += ' sorted';
            }

            const height = (value / maxValue) * 100;

            return (
              <div key={index} className="bar-wrapper">
                <div
                  className={className}
                  style={{ height: `${height}%` }}
                >
                  <span className="bar-value">{value}</span>
                </div>
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
        <button className="control-btn" onClick={handleRandomize}>
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
