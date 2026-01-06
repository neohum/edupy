import { useState } from 'react';
import './QuizComponent.css';

export interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizComponentProps {
  quiz: Quiz;
  onComplete?: (isCorrect: boolean) => void;
}

export default function QuizComponent({ quiz, onComplete }: QuizComponentProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswerSelect = (index: number) => {
    if (showResult) return; // 이미 제출한 경우 변경 불가
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === quiz.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (onComplete) {
      onComplete(correct);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
  };

  return (
    <div className="quiz-component">
      <div className="quiz-header">
        <i className="fi fi-rr-interrogation"></i>
        <h4>퀴즈</h4>
      </div>

      <div className="quiz-question">
        <p>{quiz.question}</p>
      </div>

      <div className="quiz-options">
        {quiz.options.map((option, index) => {
          let className = 'quiz-option';

          if (showResult) {
            if (index === quiz.correctAnswer) {
              className += ' correct';
            } else if (index === selectedAnswer && index !== quiz.correctAnswer) {
              className += ' incorrect';
            }
          } else if (selectedAnswer === index) {
            className += ' selected';
          }

          return (
            <button
              key={index}
              className={className}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
            >
              <span className="option-number">{index + 1}</span>
              <span className="option-text">{option}</span>
              {showResult && index === quiz.correctAnswer && (
                <i className="fi fi-rr-check-circle"></i>
              )}
              {showResult && index === selectedAnswer && index !== quiz.correctAnswer && (
                <i className="fi fi-rr-cross-circle"></i>
              )}
            </button>
          );
        })}
      </div>

      {!showResult && (
        <button
          className="quiz-submit-btn"
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
        >
          <i className="fi fi-rr-paper-plane"></i>
          정답 확인
        </button>
      )}

      {showResult && (
        <div className={`quiz-result ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="result-icon">
            {isCorrect ? (
              <i className="fi fi-rr-check-circle"></i>
            ) : (
              <i className="fi fi-rr-cross-circle"></i>
            )}
          </div>
          <div className="result-content">
            <h5>{isCorrect ? '정답입니다! 🎉' : '아쉽네요 😢'}</h5>
            <p className="explanation">{quiz.explanation}</p>
            {!isCorrect && (
              <button className="retry-btn" onClick={handleRetry}>
                <i className="fi fi-rr-refresh"></i>
                다시 풀기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
