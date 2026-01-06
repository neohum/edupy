import { useState, useEffect, useRef } from 'react';
import './TreeVisualization.css';

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

interface TreeStep {
  tree: TreeNode | null;
  highlightNode?: number;
  message: string;
  operation?: 'insert' | 'search' | 'delete';
}

interface TreeVisualizationProps {
  autoStart?: boolean;
}

export default function TreeVisualization({ autoStart: _autoStart = false }: TreeVisualizationProps) {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [steps, setSteps] = useState<TreeStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [inputValue, setInputValue] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);

  // BST 삽입
  const insertNode = (root: TreeNode | null, value: number, steps: TreeStep[]): TreeNode => {
    if (root === null) {
      steps.push({
        tree: { value, left: null, right: null },
        highlightNode: value,
        message: `${value}를 삽입했습니다`,
        operation: 'insert'
      });
      return { value, left: null, right: null };
    }

    steps.push({
      tree: copyTree(root),
      highlightNode: root.value,
      message: `${value}와(과) ${root.value}을(를) 비교`,
      operation: 'insert'
    });

    if (value < root.value) {
      steps.push({
        tree: copyTree(root),
        highlightNode: root.value,
        message: `${value} < ${root.value} → 왼쪽 서브트리로 이동`,
        operation: 'insert'
      });
      root.left = insertNode(root.left, value, steps);
    } else if (value > root.value) {
      steps.push({
        tree: copyTree(root),
        highlightNode: root.value,
        message: `${value} > ${root.value} → 오른쪽 서브트리로 이동`,
        operation: 'insert'
      });
      root.right = insertNode(root.right, value, steps);
    } else {
      steps.push({
        tree: copyTree(root),
        highlightNode: root.value,
        message: `${value}는 이미 존재합니다`,
        operation: 'insert'
      });
    }

    return root;
  };

  // BST 탐색
  const searchNode = (root: TreeNode | null, value: number, steps: TreeStep[]): boolean => {
    if (root === null) {
      steps.push({
        tree: null,
        message: `${value}를 찾지 못했습니다`,
        operation: 'search'
      });
      return false;
    }

    steps.push({
      tree: copyTree(root),
      highlightNode: root.value,
      message: `${value}와(과) ${root.value}을(를) 비교`,
      operation: 'search'
    });

    if (value === root.value) {
      steps.push({
        tree: copyTree(root),
        highlightNode: root.value,
        message: `✅ ${value}를 찾았습니다!`,
        operation: 'search'
      });
      return true;
    } else if (value < root.value) {
      steps.push({
        tree: copyTree(root),
        highlightNode: root.value,
        message: `${value} < ${root.value} → 왼쪽 서브트리 탐색`,
        operation: 'search'
      });
      return searchNode(root.left, value, steps);
    } else {
      steps.push({
        tree: copyTree(root),
        highlightNode: root.value,
        message: `${value} > ${root.value} → 오른쪽 서브트리 탐색`,
        operation: 'search'
      });
      return searchNode(root.right, value, steps);
    }
  };

  // 트리 복사
  const copyTree = (node: TreeNode | null): TreeNode | null => {
    if (!node) return null;
    return {
      value: node.value,
      left: copyTree(node.left),
      right: copyTree(node.right)
    };
  };

  // 트리 위치 계산
  const calculatePositions = (
    node: TreeNode | null,
    x: number,
    y: number,
    horizontalSpacing: number
  ): void => {
    if (!node) return;

    node.x = x;
    node.y = y;

    const nextSpacing = horizontalSpacing / 2;
    const nextY = y + 80;

    if (node.left) {
      calculatePositions(node.left, x - horizontalSpacing, nextY, nextSpacing);
    }
    if (node.right) {
      calculatePositions(node.right, x + horizontalSpacing, nextY, nextSpacing);
    }
  };

  // 트리 그리기
  const drawTree = (node: TreeNode | null, highlightValue?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!node) {
      ctx.fillStyle = '#a0aec0';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('트리가 비어있습니다', canvas.width / 2, canvas.height / 2);
      return;
    }

    // 위치 계산
    calculatePositions(node, canvas.width / 2, 40, 100);

    // 선 그리기 (먼저)
    const drawLines = (n: TreeNode | null) => {
      if (!n || n.x === undefined || n.y === undefined) return;

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;

      if (n.left && n.left.x !== undefined && n.left.y !== undefined) {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(n.left.x, n.left.y);
        ctx.stroke();
        drawLines(n.left);
      }

      if (n.right && n.right.x !== undefined && n.right.y !== undefined) {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(n.right.x, n.right.y);
        ctx.stroke();
        drawLines(n.right);
      }
    };

    drawLines(node);

    // 노드 그리기
    const drawNodes = (n: TreeNode | null) => {
      if (!n || n.x === undefined || n.y === undefined) return;

      const radius = 25;
      const isHighlighted = n.value === highlightValue;

      // 노드 원
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);

      if (isHighlighted) {
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
      } else {
        ctx.fillStyle = '#667eea';
        ctx.strokeStyle = '#4c51bf';
        ctx.lineWidth = 2;
      }

      ctx.fill();
      ctx.stroke();

      // 노드 값
      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.value.toString(), n.x, n.y);

      if (n.left) drawNodes(n.left);
      if (n.right) drawNodes(n.right);
    };

    drawNodes(node);
  };

  // 삽입 처리
  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      alert('숫자를 입력하세요');
      return;
    }

    const newSteps: TreeStep[] = [];
    newSteps.push({
      tree: copyTree(tree),
      message: `${value}를 삽입 시작...`
    });

    const newTree = insertNode(copyTree(tree), value, newSteps);

    newSteps.push({
      tree: copyTree(newTree),
      message: `삽입 완료!`
    });

    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(true);
    setInputValue('');
  };

  // 탐색 처리
  const handleSearch = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      alert('숫자를 입력하세요');
      return;
    }

    const newSteps: TreeStep[] = [];
    newSteps.push({
      tree: copyTree(tree),
      message: `${value}를 탐색 시작...`
    });

    searchNode(copyTree(tree), value, newSteps);

    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(true);
    setInputValue('');
  };

  // 초기화
  const handleReset = () => {
    setTree(null);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // 샘플 트리 생성
  const handleSample = () => {
    const sampleValues = [50, 30, 70, 20, 40, 60, 80];
    const newSteps: TreeStep[] = [];

    let newTree: TreeNode | null = null;
    for (const value of sampleValues) {
      newTree = insertNode(copyTree(newTree), value, newSteps);
    }

    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(true);
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

  // 단계 변경 시 트리 업데이트 및 그리기
  useEffect(() => {
    if (steps[currentStep]) {
      const stepData = steps[currentStep];
      setTree(stepData.tree);
      drawTree(stepData.tree, stepData.highlightNode);
    }
  }, [currentStep, steps]);

  // 트리 변경 시 그리기
  useEffect(() => {
    if (!isPlaying && tree) {
      drawTree(tree);
    }
  }, [tree]);

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

  return (
    <div className="tree-visualization">
      <div className="visualization-header">
        <div className="algo-title">
          <i className="fi fi-rr-sitemap"></i>
          <h4>이진 탐색 트리 (BST) 시각화</h4>
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

      <div className="tree-controls">
        <div className="input-group">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="숫자 입력"
            className="number-input"
            disabled={isPlaying}
          />
          <button className="control-btn primary" onClick={handleInsert} disabled={isPlaying}>
            <i className="fi fi-rr-plus"></i>
            삽입
          </button>
          <button className="control-btn" onClick={handleSearch} disabled={isPlaying}>
            <i className="fi fi-rr-search"></i>
            탐색
          </button>
        </div>
        <div className="action-group">
          <button className="control-btn" onClick={handleSample} disabled={isPlaying}>
            <i className="fi fi-rr-magic-wand"></i>
            샘플 트리
          </button>
          <button className="control-btn" onClick={handleReset}>
            <i className="fi fi-rr-refresh"></i>
            초기화
          </button>
        </div>
      </div>

      <div className="visualization-canvas">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="tree-canvas"
        />

        {steps[currentStep]?.message && (
          <div className="step-message">
            <i className="fi fi-rr-comment-info"></i>
            {steps[currentStep].message}
          </div>
        )}
      </div>

      {steps.length > 0 && (
        <>
          <div className="playback-controls">
            <button
              className="control-btn"
              onClick={handleStepBackward}
              disabled={currentStep === 0}
            >
              <i className="fi fi-rr-angle-left"></i>
            </button>

            {isPlaying ? (
              <button className="control-btn primary" onClick={() => setIsPlaying(false)}>
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
        </>
      )}
    </div>
  );
}
