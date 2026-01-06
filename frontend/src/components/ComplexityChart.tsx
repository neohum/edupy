import { useState, useEffect, useRef } from 'react';
import './ComplexityChart.css';

interface Algorithm {
  name: string;
  complexity: string;
  func: (n: number) => number;
  color: string;
}

interface ComplexityChartProps {
  algorithms?: Algorithm[];
  maxN?: number;
}

const defaultAlgorithms: Algorithm[] = [
  {
    name: 'O(1) - 상수',
    complexity: 'O(1)',
    func: () => 1,
    color: '#4caf50'
  },
  {
    name: 'O(log n) - 로그',
    complexity: 'O(log n)',
    func: (n: number) => Math.log2(n),
    color: '#2196f3'
  },
  {
    name: 'O(n) - 선형',
    complexity: 'O(n)',
    func: (n: number) => n,
    color: '#ff9800'
  },
  {
    name: 'O(n log n) - 선형 로그',
    complexity: 'O(n log n)',
    func: (n: number) => n * Math.log2(n),
    color: '#9c27b0'
  },
  {
    name: 'O(n²) - 이차',
    complexity: 'O(n²)',
    func: (n: number) => n * n,
    color: '#f44336'
  },
  {
    name: 'O(2ⁿ) - 지수',
    complexity: 'O(2ⁿ)',
    func: (n: number) => Math.pow(2, n),
    color: '#e91e63'
  }
];

const algorithmExamples: Record<string, string[]> = {
  'O(1)': ['배열 인덱스 접근', '해시 테이블 조회', '스택 push/pop'],
  'O(log n)': ['이진 탐색', '균형 이진 트리 탐색'],
  'O(n)': ['선형 탐색', '배열 순회', '연결 리스트 순회'],
  'O(n log n)': ['병합 정렬', '퀵 정렬(평균)', '힙 정렬'],
  'O(n²)': ['버블 정렬', '선택 정렬', '삽입 정렬'],
  'O(2ⁿ)': ['피보나치(재귀)', '모든 부분집합 생성']
};

export default function ComplexityChart({
  algorithms = defaultAlgorithms,
  maxN = 20
}: ComplexityChartProps) {
  const [selectedN, setSelectedN] = useState(10);
  const [hoveredAlgo, setHoveredAlgo] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);

    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 최대값 계산 (O(2^n)은 제외하고 계산)
    const visibleAlgos = algorithms.filter(algo =>
      algo.complexity !== 'O(2ⁿ)' || selectedN <= 10
    );

    let maxY = 0;
    for (let n = 1; n <= selectedN; n++) {
      visibleAlgos.forEach(algo => {
        const value = algo.func(n);
        if (value < 10000) { // 너무 큰 값 제외
          maxY = Math.max(maxY, value);
        }
      });
    }

    maxY = maxY * 1.1; // 10% 여유 추가

    // 그리드 그리기
    if (showGrid) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;

      // 수평선
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y축 레이블
        const value = maxY * (1 - i / 5);
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(value).toString(), padding - 10, y);
      }

      // 수직선
      const step = Math.ceil(selectedN / 10);
      for (let n = 0; n <= selectedN; n += step) {
        const x = padding + (chartWidth / selectedN) * n;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();

        // X축 레이블
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(n.toString(), x, height - padding + 10);
      }
    }

    // 축 그리기
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // Y축
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // X축
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // 축 레이블
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('입력 크기 (n)', width / 2, height - 20);

    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('연산 횟수', 0, 0);
    ctx.restore();

    // 알고리즘 그래프 그리기
    visibleAlgos.forEach(algo => {
      const isHovered = hoveredAlgo === algo.complexity;
      ctx.strokeStyle = algo.color;
      ctx.lineWidth = isHovered ? 4 : 2;
      ctx.globalAlpha = isHovered ? 1 : hoveredAlgo ? 0.3 : 1;

      ctx.beginPath();
      let started = false;

      for (let n = 1; n <= selectedN; n++) {
        const value = algo.func(n);

        // 너무 큰 값은 건너뛰기
        if (value > maxY * 10) continue;

        const x = padding + (chartWidth / selectedN) * n;
        const y = height - padding - (Math.min(value, maxY) / maxY) * chartHeight;

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }

        // 포인트 그리기 (호버된 경우)
        if (isHovered) {
          ctx.save();
          ctx.fillStyle = algo.color;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // 선택된 N 위치 표시
    const selectedX = padding + (chartWidth / selectedN) * selectedN;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(selectedX, padding);
    ctx.lineTo(selectedX, height - padding);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  useEffect(() => {
    drawChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedN, hoveredAlgo, showGrid, algorithms]);

  const getComplexityValue = (algo: Algorithm, n: number): string => {
    const value = algo.func(n);
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + 'K';
    } else {
      return value.toFixed(2);
    }
  };

  return (
    <div className="complexity-chart">
      <div className="chart-header">
        <div className="chart-title">
          <i className="fi fi-rr-chart-line-up"></i>
          <h4>시간 복잡도 비교</h4>
        </div>
        <div className="chart-options">
          <label className="grid-toggle">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            <span>격자 표시</span>
          </label>
        </div>
      </div>

      <div className="n-selector">
        <label>입력 크기 (n):</label>
        <input
          type="range"
          min="5"
          max={maxN}
          value={selectedN}
          onChange={(e) => setSelectedN(Number(e.target.value))}
          className="n-slider"
        />
        <span className="n-value">{selectedN}</span>
      </div>

      <div className="chart-canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="complexity-canvas"
        />
      </div>

      <div className="algorithm-legend">
        <h5>알고리즘 복잡도</h5>
        <div className="legend-items">
          {algorithms.map((algo) => (
            <div
              key={algo.complexity}
              className={`legend-item ${hoveredAlgo === algo.complexity ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredAlgo(algo.complexity)}
              onMouseLeave={() => setHoveredAlgo(null)}
            >
              <div className="legend-color" style={{ backgroundColor: algo.color }}></div>
              <div className="legend-info">
                <div className="legend-name">{algo.name}</div>
                <div className="legend-value">
                  n={selectedN}일 때: {getComplexityValue(algo, selectedN)}
                </div>
                {algorithmExamples[algo.complexity] && (
                  <div className="legend-examples">
                    예시: {algorithmExamples[algo.complexity].join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="complexity-guide">
        <h5>
          <i className="fi fi-rr-bulb"></i>
          시간 복잡도 가이드
        </h5>
        <div className="guide-content">
          <div className="guide-item good">
            <i className="fi fi-rr-check-circle"></i>
            <div>
              <strong>효율적:</strong> O(1), O(log n), O(n)
              <p>대부분의 실시간 애플리케이션에 적합</p>
            </div>
          </div>
          <div className="guide-item moderate">
            <i className="fi fi-rr-exclamation"></i>
            <div>
              <strong>보통:</strong> O(n log n), O(n²)
              <p>작은 데이터셋이나 일회성 작업에 사용</p>
            </div>
          </div>
          <div className="guide-item bad">
            <i className="fi fi-rr-cross-circle"></i>
            <div>
              <strong>비효율적:</strong> O(2ⁿ), O(n!)
              <p>매우 작은 입력에만 실용적</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
