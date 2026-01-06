import { useState, useEffect } from 'react';
import './AlgorithmGame.css';

type GameType = 'sorting' | 'searching' | 'pathfinding';
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameScore {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
}

interface AlgorithmGameProps {
  type: GameType;
  difficulty?: Difficulty;
}

export default function AlgorithmGame({ type, difficulty = 'easy' }: AlgorithmGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [score, setScore] = useState<GameScore>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0
  });
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentRound, setCurrentRound] = useState(0);

  // 정렬 게임 상태
  const [numbers, setNumbers] = useState<number[]>([]);
  const [userOrder, setUserOrder] = useState<number[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // 탐색 게임 상태
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [searchArray, setSearchArray] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const getDifficultyConfig = () => {
    switch (difficulty) {
      case 'easy':
        return { arraySize: 5, maxNumber: 20, timeLimit: 60 };
      case 'medium':
        return { arraySize: 8, maxNumber: 50, timeLimit: 45 };
      case 'hard':
        return { arraySize: 10, maxNumber: 100, timeLimit: 30 };
    }
  };

  const config = getDifficultyConfig();

  // 게임 시작
  const startGame = () => {
    setGameState('playing');
    setScore({ correct: 0, incorrect: 0, streak: 0, bestStreak: 0 });
    setTimeLeft(config.timeLimit);
    setCurrentRound(1);
    generateNewRound();
  };

  // 새로운 라운드 생성
  const generateNewRound = () => {
    if (type === 'sorting') {
      const nums = Array.from(
        { length: config.arraySize },
        () => Math.floor(Math.random() * config.maxNumber) + 1
      );
      setNumbers([...nums]);
      setUserOrder([...nums]);
    } else if (type === 'searching') {
      const arr = Array.from(
        { length: config.arraySize },
        () => Math.floor(Math.random() * config.maxNumber) + 1
      ).sort((a, b) => a - b);
      const randomIndex = Math.floor(Math.random() * arr.length);
      setSearchArray(arr);
      setTargetNumber(arr[randomIndex]);
      setSelectedIndex(null);
    }
  };

  // 타이머
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  // 정렬 게임: 드래그 앤 드롭
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggingIndex === null) return;

    const newOrder = [...userOrder];
    const draggedItem = newOrder[draggingIndex];
    newOrder.splice(draggingIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    setUserOrder(newOrder);
    setDraggingIndex(null);
  };

  // 정렬 게임: 정답 확인
  const checkSortingAnswer = () => {
    const sorted = [...numbers].sort((a, b) => a - b);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(sorted);

    updateScore(isCorrect);

    if (isCorrect) {
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        generateNewRound();
      }, 1000);
    }
  };

  // 탐색 게임: 정답 확인
  const checkSearchingAnswer = (index: number) => {
    setSelectedIndex(index);
    const isCorrect = searchArray[index] === targetNumber;

    updateScore(isCorrect);

    if (isCorrect) {
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        generateNewRound();
      }, 1000);
    } else {
      setTimeout(() => {
        setSelectedIndex(null);
      }, 1000);
    }
  };

  // 점수 업데이트
  const updateScore = (isCorrect: boolean) => {
    setScore((prev) => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak)
      };
    });
  };

  // 게임 재시작
  const resetGame = () => {
    setGameState('ready');
    setTimeLeft(config.timeLimit);
    setCurrentRound(0);
  };

  const getGameTitle = () => {
    switch (type) {
      case 'sorting':
        return '정렬 게임';
      case 'searching':
        return '탐색 게임';
      case 'pathfinding':
        return '경로 찾기 게임';
    }
  };

  const getGameDescription = () => {
    switch (type) {
      case 'sorting':
        return '숫자들을 드래그해서 오름차순으로 정렬하세요!';
      case 'searching':
        return '목표 숫자를 배열에서 찾으세요!';
      case 'pathfinding':
        return '최단 경로를 찾아보세요!';
    }
  };

  return (
    <div className="algorithm-game">
      <div className="game-header">
        <div className="game-title">
          <i className="fi fi-rr-gamepad"></i>
          <h4>{getGameTitle()}</h4>
          <span className={`difficulty-badge ${difficulty}`}>{difficulty.toUpperCase()}</span>
        </div>

        {gameState === 'playing' && (
          <div className="game-stats">
            <div className="stat-item time">
              <i className="fi fi-rr-clock"></i>
              <span>{timeLeft}초</span>
            </div>
            <div className="stat-item round">
              <i className="fi fi-rr-trophy"></i>
              <span>라운드 {currentRound}</span>
            </div>
            <div className="stat-item streak">
              <i className="fi fi-rr-flame"></i>
              <span>{score.streak} 연속</span>
            </div>
          </div>
        )}
      </div>

      {gameState === 'ready' && (
        <div className="game-start-screen">
          <div className="start-card">
            <i className="fi fi-rr-gamepad game-icon"></i>
            <h3>{getGameTitle()}</h3>
            <p className="game-description">{getGameDescription()}</p>

            <div className="game-rules">
              <h5>게임 규칙</h5>
              <ul>
                <li>제한 시간: {config.timeLimit}초</li>
                <li>배열 크기: {config.arraySize}개</li>
                <li>연속으로 맞추면 보너스 점수!</li>
                <li>시간 내에 최대한 많이 맞추세요</li>
              </ul>
            </div>

            <button className="start-btn" onClick={startGame}>
              <i className="fi fi-rr-play"></i>
              게임 시작
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && type === 'sorting' && (
        <div className="game-area">
          <div className="game-instruction">
            <i className="fi fi-rr-info"></i>
            숫자를 드래그해서 오름차순으로 정렬하세요
          </div>

          <div className="sorting-game">
            <div className="original-array">
              <span className="array-label">원본:</span>
              <div className="number-list">
                {numbers.map((num, index) => (
                  <div key={index} className="number-item readonly">
                    {num}
                  </div>
                ))}
              </div>
            </div>

            <div className="user-array">
              <span className="array-label">정렬:</span>
              <div className="number-list">
                {userOrder.map((num, index) => (
                  <div
                    key={index}
                    className={`number-item draggable ${draggingIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="submit-btn" onClick={checkSortingAnswer}>
            <i className="fi fi-rr-check"></i>
            정답 확인
          </button>
        </div>
      )}

      {gameState === 'playing' && type === 'searching' && (
        <div className="game-area">
          <div className="game-instruction">
            <i className="fi fi-rr-info"></i>
            목표 숫자를 배열에서 찾으세요
          </div>

          <div className="searching-game">
            <div className="target-display-game">
              <span className="target-label">찾을 숫자:</span>
              <span className="target-number-game">{targetNumber}</span>
            </div>

            <div className="search-array">
              {searchArray.map((num, index) => {
                let className = 'search-item';
                if (selectedIndex === index) {
                  className += num === targetNumber ? ' correct' : ' incorrect';
                }

                return (
                  <div
                    key={index}
                    className={className}
                    onClick={() => checkSearchingAnswer(index)}
                  >
                    <div className="search-value">{num}</div>
                    <div className="search-index">index: {index}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="game-finish-screen">
          <div className="finish-card">
            <i className="fi fi-rr-trophy trophy-icon"></i>
            <h3>게임 종료!</h3>

            <div className="final-score">
              <div className="score-row">
                <span className="score-label">정답:</span>
                <span className="score-value correct">{score.correct}</span>
              </div>
              <div className="score-row">
                <span className="score-label">오답:</span>
                <span className="score-value incorrect">{score.incorrect}</span>
              </div>
              <div className="score-row">
                <span className="score-label">정확도:</span>
                <span className="score-value">
                  {score.correct + score.incorrect > 0
                    ? Math.round((score.correct / (score.correct + score.incorrect)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="score-row highlight">
                <span className="score-label">최고 연속:</span>
                <span className="score-value">{score.bestStreak}</span>
              </div>
            </div>

            <div className="finish-actions">
              <button className="retry-btn" onClick={startGame}>
                <i className="fi fi-rr-refresh"></i>
                다시 도전
              </button>
              <button className="reset-btn" onClick={resetGame}>
                <i className="fi fi-rr-home"></i>
                처음으로
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
