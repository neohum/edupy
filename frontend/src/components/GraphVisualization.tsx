import { useState, useEffect, useRef } from 'react';
import './GraphVisualization.css';

type TraversalType = 'dfs' | 'bfs';

interface GraphNode {
  id: number;
  x: number;
  y: number;
  neighbors: number[];
}

interface GraphStep {
  currentNode?: number;
  visited: Set<number>;
  queue: number[];
  stack: number[];
  message: string;
  highlightEdge?: [number, number];
}

interface GraphVisualizationProps {
  type: TraversalType;
  autoStart?: boolean;
}

export default function GraphVisualization({ type, autoStart = false }: GraphVisualizationProps) {
  const [graph, setGraph] = useState<Map<number, GraphNode>>(new Map());
  const [steps, setSteps] = useState<GraphStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [startNode, setStartNode] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);

  // 샘플 그래프 생성
  useEffect(() => {
    createSampleGraph();
  }, []);

  const createSampleGraph = () => {
    const nodes = new Map<number, GraphNode>();

    // 7개의 노드를 원형으로 배치
    const centerX = 400;
    const centerY = 200;
    const radius = 120;

    for (let i = 0; i < 7; i++) {
      const angle = (i * 2 * Math.PI) / 7 - Math.PI / 2;
      nodes.set(i, {
        id: i,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        neighbors: []
      });
    }

    // 간선 추가
    const edges = [
      [0, 1], [0, 2],
      [1, 3], [1, 4],
      [2, 5], [2, 6],
      [3, 4], [5, 6]
    ];

    edges.forEach(([from, to]) => {
      nodes.get(from)?.neighbors.push(to);
      nodes.get(to)?.neighbors.push(from);
    });

    setGraph(nodes);
  };

  // DFS 알고리즘
  const generateDFSSteps = (startNodeId: number): GraphStep[] => {
    const steps: GraphStep[] = [];
    const visited = new Set<number>();
    const stack: number[] = [startNodeId];

    steps.push({
      visited: new Set(visited),
      queue: [],
      stack: [...stack],
      message: `DFS 탐색 시작: 노드 ${startNodeId}을(를) 스택에 추가`
    });

    const dfs = () => {
      while (stack.length > 0) {
        const currentNodeId = stack.pop()!;

        if (visited.has(currentNodeId)) {
          steps.push({
            currentNode: currentNodeId,
            visited: new Set(visited),
            queue: [],
            stack: [...stack],
            message: `노드 ${currentNodeId}은(는) 이미 방문했습니다`
          });
          continue;
        }

        visited.add(currentNodeId);

        steps.push({
          currentNode: currentNodeId,
          visited: new Set(visited),
          queue: [],
          stack: [...stack],
          message: `노드 ${currentNodeId}을(를) 방문`
        });

        const node = graph.get(currentNodeId);
        if (node) {
          // 이웃 노드들을 스택에 추가 (역순으로 추가하여 정순으로 방문)
          const unvisitedNeighbors = [...node.neighbors]
            .filter(n => !visited.has(n))
            .reverse();

          for (const neighborId of unvisitedNeighbors) {
            if (!visited.has(neighborId) && !stack.includes(neighborId)) {
              stack.push(neighborId);

              steps.push({
                currentNode: currentNodeId,
                visited: new Set(visited),
                queue: [],
                stack: [...stack],
                message: `노드 ${neighborId}을(를) 스택에 추가`,
                highlightEdge: [currentNodeId, neighborId]
              });
            }
          }
        }
      }
    };

    dfs();

    steps.push({
      visited: new Set(visited),
      queue: [],
      stack: [],
      message: `DFS 탐색 완료! 방문한 노드: ${Array.from(visited).join(', ')}`
    });

    return steps;
  };

  // BFS 알고리즘
  const generateBFSSteps = (startNodeId: number): GraphStep[] => {
    const steps: GraphStep[] = [];
    const visited = new Set<number>();
    const queue: number[] = [startNodeId];
    visited.add(startNodeId);

    steps.push({
      visited: new Set(visited),
      queue: [...queue],
      stack: [],
      message: `BFS 탐색 시작: 노드 ${startNodeId}을(를) 큐에 추가`
    });

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;

      steps.push({
        currentNode: currentNodeId,
        visited: new Set(visited),
        queue: [...queue],
        stack: [],
        message: `노드 ${currentNodeId}을(를) 큐에서 꺼내서 방문`
      });

      const node = graph.get(currentNodeId);
      if (node) {
        for (const neighborId of node.neighbors) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);

            steps.push({
              currentNode: currentNodeId,
              visited: new Set(visited),
              queue: [...queue],
              stack: [],
              message: `노드 ${neighborId}을(를) 큐에 추가`,
              highlightEdge: [currentNodeId, neighborId]
            });
          }
        }
      }
    }

    steps.push({
      visited: new Set(visited),
      queue: [],
      stack: [],
      message: `BFS 탐색 완료! 방문한 노드: ${Array.from(visited).join(', ')}`
    });

    return steps;
  };

  // 그래프 그리기
  const drawGraph = (stepData?: GraphStep) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 간선 그리기
    graph.forEach((node) => {
      node.neighbors.forEach((neighborId) => {
        if (node.id < neighborId) { // 중복 방지
          const neighbor = graph.get(neighborId);
          if (neighbor) {
            const isHighlightEdge =
              stepData?.highlightEdge &&
              ((stepData.highlightEdge[0] === node.id && stepData.highlightEdge[1] === neighborId) ||
               (stepData.highlightEdge[0] === neighborId && stepData.highlightEdge[1] === node.id));

            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(neighbor.x, neighbor.y);

            if (isHighlightEdge) {
              ctx.strokeStyle = '#ffd700';
              ctx.lineWidth = 4;
            } else if (stepData?.visited.has(node.id) && stepData?.visited.has(neighborId)) {
              ctx.strokeStyle = '#4caf50';
              ctx.lineWidth = 3;
            } else {
              ctx.strokeStyle = '#cbd5e1';
              ctx.lineWidth = 2;
            }

            ctx.stroke();
          }
        }
      });
    });

    // 노드 그리기
    graph.forEach((node) => {
      const isVisited = stepData?.visited.has(node.id);
      const isCurrent = stepData?.currentNode === node.id;
      const radius = 30;

      // 노드 원
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);

      if (isCurrent) {
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
      } else if (isVisited) {
        ctx.fillStyle = '#4caf50';
        ctx.strokeStyle = '#45a049';
        ctx.lineWidth = 3;
      } else {
        ctx.fillStyle = '#667eea';
        ctx.strokeStyle = '#4c51bf';
        ctx.lineWidth = 2;
      }

      ctx.fill();
      ctx.stroke();

      // 노드 번호
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id.toString(), node.x, node.y);
    });
  };

  const handleStart = () => {
    if (startNode < 0 || startNode >= graph.size) {
      alert(`0부터 ${graph.size - 1} 사이의 노드를 선택하세요.`);
      return;
    }

    const traversalSteps = type === 'dfs'
      ? generateDFSSteps(startNode)
      : generateBFSSteps(startNode);

    setSteps(traversalSteps);
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
    drawGraph();
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

  // 단계 변경 시 그래프 업데이트
  useEffect(() => {
    if (steps[currentStep]) {
      drawGraph(steps[currentStep]);
    }
  }, [currentStep, steps, graph]);

  // 초기 그래프 그리기
  useEffect(() => {
    if (graph.size > 0 && steps.length === 0) {
      drawGraph();
    }
  }, [graph]);

  // Auto start
  useEffect(() => {
    if (autoStart && graph.size > 0) {
      setTimeout(() => handleStart(), 500);
    }
  }, [autoStart, graph]);

  const currentStepData = steps[currentStep];

  const getAlgorithmName = () => {
    return type === 'dfs' ? '깊이 우선 탐색 (DFS)' : '너비 우선 탐색 (BFS)';
  };

  return (
    <div className="graph-visualization">
      <div className="visualization-header">
        <div className="algo-title">
          <i className="fi fi-rr-network"></i>
          <h4>{getAlgorithmName()} 시각화</h4>
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

      <div className="start-node-selector">
        <span className="label">시작 노드:</span>
        <input
          type="number"
          value={startNode}
          onChange={(e) => setStartNode(Number(e.target.value))}
          disabled={steps.length > 0}
          min="0"
          max={graph.size - 1}
          className="node-input"
        />
        <span className="hint">(0~{graph.size - 1})</span>
      </div>

      <div className="visualization-canvas">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="graph-canvas"
        />

        {currentStepData?.message && (
          <div className="step-message">
            <i className="fi fi-rr-comment-info"></i>
            {currentStepData.message}
          </div>
        )}
      </div>

      <div className="data-structure-display">
        {type === 'dfs' ? (
          <div className="stack-display">
            <div className="ds-header">
              <i className="fi fi-rr-layer-plus"></i>
              <span>스택 (Stack)</span>
            </div>
            <div className="ds-content">
              {currentStepData?.stack.length === 0 ? (
                <span className="empty-text">비어있음</span>
              ) : (
                currentStepData?.stack.map((nodeId, index) => (
                  <div key={index} className="ds-item stack-item">
                    {nodeId}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="queue-display">
            <div className="ds-header">
              <i className="fi fi-rr-arrow-right"></i>
              <span>큐 (Queue)</span>
            </div>
            <div className="ds-content">
              {currentStepData?.queue.length === 0 ? (
                <span className="empty-text">비어있음</span>
              ) : (
                currentStepData?.queue.map((nodeId, index) => (
                  <div key={index} className="ds-item queue-item">
                    {nodeId}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="visited-display">
          <div className="ds-header">
            <i className="fi fi-rr-check-circle"></i>
            <span>방문한 노드</span>
          </div>
          <div className="ds-content">
            {currentStepData?.visited.size === 0 ? (
              <span className="empty-text">없음</span>
            ) : (
              Array.from(currentStepData?.visited || []).map((nodeId, index) => (
                <div key={index} className="ds-item visited-item">
                  {nodeId}
                </div>
              ))
            )}
          </div>
        </div>
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
