import { useState } from 'react';
import Editor from '@monaco-editor/react';
import './ChallengeComponent.css';

export interface Challenge {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode?: string;
  solution?: string;
}

interface ChallengeComponentProps {
  challenges: Challenge[];
  onRunCode?: (code: string) => Promise<string>;
}

export default function ChallengeComponent({ challenges, onRunCode }: ChallengeComponentProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');

  const handleSelectChallenge = (index: number) => {
    setSelectedChallenge(index);
    setCode(challenges[index].starterCode || '# 여기에 코드를 작성하세요\n');
    setShowSolution(false);
    setOutput('');
  };

  const handleRunCode = async () => {
    if (!onRunCode) return;

    setIsRunning(true);
    setOutput('실행 중...');

    try {
      const result = await onRunCode(code);
      setOutput(result);
    } catch (error) {
      setOutput(`오류: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleToggleSolution = () => {
    setShowSolution(!showSolution);
  };

  const handleCloseChalenge = () => {
    setSelectedChallenge(null);
    setCode('');
    setShowSolution(false);
    setOutput('');
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return '#4caf50';
      case 'medium':
        return '#ff9800';
      case 'hard':
        return '#f44336';
    }
  };

  const getDifficultyText = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return '쉬움';
      case 'medium':
        return '보통';
      case 'hard':
        return '어려움';
    }
  };

  if (selectedChallenge === null) {
    return (
      <div className="challenge-component">
        <div className="challenge-header">
          <i className="fi fi-rr-trophy"></i>
          <h4>도전 과제</h4>
          <span className="challenge-count">{challenges.length}개</span>
        </div>

        <div className="challenge-list">
          {challenges.map((challenge, index) => (
            <div
              key={index}
              className="challenge-card"
              onClick={() => handleSelectChallenge(index)}
            >
              <div className="challenge-card-header">
                <h5>{challenge.title}</h5>
                <span
                  className="difficulty-badge"
                  style={{ background: getDifficultyColor(challenge.difficulty) }}
                >
                  {getDifficultyText(challenge.difficulty)}
                </span>
              </div>
              <p className="challenge-description">{challenge.description}</p>
              <button className="start-challenge-btn">
                <i className="fi fi-rr-rocket"></i>
                도전하기
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const challenge = challenges[selectedChallenge];

  return (
    <div className="challenge-component active">
      <div className="challenge-header">
        <div className="challenge-title-section">
          <i className="fi fi-rr-trophy"></i>
          <div>
            <h4>{challenge.title}</h4>
            <span
              className="difficulty-badge"
              style={{ background: getDifficultyColor(challenge.difficulty) }}
            >
              {getDifficultyText(challenge.difficulty)}
            </span>
          </div>
        </div>
        <button className="close-challenge-btn" onClick={handleCloseChalenge}>
          <i className="fi fi-rr-cross"></i>
        </button>
      </div>

      <div className="challenge-description-box">
        <p>{challenge.description}</p>
      </div>

      <div className="challenge-editor-section">
        <div className="editor-header">
          <span>코드 에디터</span>
          {challenge.solution && (
            <button className="solution-btn" onClick={handleToggleSolution}>
              <i className="fi fi-rr-eye"></i>
              {showSolution ? '힌트 숨기기' : '힌트 보기'}
            </button>
          )}
        </div>

        <Editor
          height="300px"
          defaultLanguage="python"
          value={showSolution ? challenge.solution : code}
          onChange={(value) => !showSolution && setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: showSolution,
          }}
        />

        <div className="editor-actions">
          <button
            className="run-code-btn"
            onClick={handleRunCode}
            disabled={isRunning || !onRunCode}
          >
            {isRunning ? (
              <>
                <i className="fi fi-rr-spinner spinning"></i>
                실행 중...
              </>
            ) : (
              <>
                <i className="fi fi-rr-play"></i>
                코드 실행
              </>
            )}
          </button>
        </div>

        {output && (
          <div className="challenge-output">
            <div className="output-header">
              <i className="fi fi-rr-terminal"></i>
              실행 결과
            </div>
            <pre>{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
