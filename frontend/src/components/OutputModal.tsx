import { useRef, useEffect } from 'react';
import ErrorReportButton from './ErrorReportButton';
import './OutputModal.css';

interface OutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  output: string;
  isRunning: boolean;

  // Input handling
  waitingForInput?: boolean;
  inputPrompt?: string;
  userInput?: string;
  onUserInputChange?: (value: string) => void;
  onInputSubmit?: () => void;

  // Key buttons for specific activities
  showKeyButtons?: boolean;
  keyButtonType?: 'horizontal' | 'vertical' | 'confirm';
  onKeyButtonClick?: (key: string) => void;

  // Turtle animation
  turtleFrames?: string[];
  currentFrameIndex?: number;
  isPlaying?: boolean;
  onPlayAnimation?: () => void;
  onPauseAnimation?: () => void;
  onNextFrame?: () => void;
  onPrevFrame?: () => void;
  onResetAnimation?: () => void;
  onGoToLastFrame?: () => void;

  // Game image
  gameImage?: string | null;

  // Error reporting
  errorInfo?: { message: string; code: string } | null;
  level?: string;
  activity?: string;

  // New window button
  showNewWindowButton?: boolean;
  onOpenNewWindow?: () => void;
  isLaunchingNewWindow?: boolean;
}

export default function OutputModal({
  isOpen,
  onClose,
  output,
  isRunning,
  waitingForInput = false,
  inputPrompt = '',
  userInput = '',
  onUserInputChange,
  onInputSubmit,
  showKeyButtons = false,
  keyButtonType = 'horizontal',
  onKeyButtonClick,
  turtleFrames = [],
  currentFrameIndex = 0,
  isPlaying = false,
  onPlayAnimation,
  onPauseAnimation,
  onNextFrame,
  onPrevFrame,
  onResetAnimation,
  onGoToLastFrame,
  gameImage,
  errorInfo,
  level,
  activity,
  showNewWindowButton = false,
  onOpenNewWindow,
  isLaunchingNewWindow = false,
}: OutputModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when waiting for input
  useEffect(() => {
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingForInput]);

  // Auto-scroll to bottom of output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  if (!isOpen) return null;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onInputSubmit) {
      onInputSubmit();
    }
  };

  // Matplotlib 이미지를 포함한 출력 렌더링
  const renderOutputWithImages = (text: string) => {
    // [MATPLOTLIB_IMAGE:base64data] 패턴을 찾아서 이미지로 변환
    const parts = text.split(/(\[MATPLOTLIB_IMAGE:[^\]]+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[MATPLOTLIB_IMAGE:([^\]]+)\]/);
      if (match) {
        const base64Data = match[1];
        return (
          <div key={index} className="matplotlib-image-container">
            <img
              src={`data:image/png;base64,${base64Data}`}
              alt="Matplotlib Chart"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                margin: '10px 0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        );
      }
      // 일반 텍스트는 pre 태그로 감싸서 출력
      if (part.trim()) {
        return <pre key={index} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{part}</pre>;
      }
      return null;
    });
  };

  return (
    <div className="output-modal-overlay" onClick={onClose}>
      <div className="output-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="output-modal-header">
          <div className="output-modal-title">
            <i className="fi fi-rr-square-terminal"></i>
            <span>실행 결과</span>
            {isRunning && <span className="running-indicator"><i className="fi fi-rr-spinner"></i> 실행 중...</span>}
          </div>
          <div className="output-modal-actions">
            {showNewWindowButton && onOpenNewWindow && (
              <button
                className="new-window-button"
                onClick={onOpenNewWindow}
                disabled={isLaunchingNewWindow}
                title="새 창에서 실행"
                style={{
                  padding: '0.5rem 1rem',
                  background: isLaunchingNewWindow
                    ? 'linear-gradient(135deg, #718096 0%, #4a5568 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: isLaunchingNewWindow ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginRight: '0.5rem',
                }}
              >
                {isLaunchingNewWindow ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                      <i className="fi fi-rr-spinner"></i>
                    </span>
                    시작 중...
                  </>
                ) : (
                  <>
                    <i className="fi fi-rr-display"></i>
                    새 창에서 열기
                  </>
                )}
              </button>
            )}
            {errorInfo && level && activity && (
              <ErrorReportButton
                errorInfo={errorInfo}
                level={level}
                activity={activity}
              />
            )}
            <button className="output-modal-close" onClick={onClose}>
              <i className="fi fi-rr-cross-small"></i>
            </button>
          </div>
        </div>

        <div className="output-modal-body">
          {/* Game Image */}
          {gameImage && (
            <div className="game-image-container">
              <img src={gameImage} alt="Game Screenshot" />
            </div>
          )}

          {/* Turtle Animation */}
          {turtleFrames.length > 0 && (
            <div className="turtle-animation-container">
              <div className="turtle-frame-display">
                <img
                  src={turtleFrames[currentFrameIndex]}
                  alt={`Frame ${currentFrameIndex + 1}`}
                />
                <div className="frame-counter">
                  {currentFrameIndex + 1} / {turtleFrames.length}
                </div>
              </div>
              <div className="turtle-controls">
                <button onClick={onResetAnimation} title="처음으로">
                  <i className="fi fi-rr-rewind"></i>
                </button>
                <button onClick={onPrevFrame} disabled={currentFrameIndex === 0} title="이전">
                  <i className="fi fi-rr-angle-double-left"></i>
                </button>
                <button
                  onClick={isPlaying ? onPauseAnimation : onPlayAnimation}
                  className="play-pause-btn"
                  title={isPlaying ? "일시정지" : "재생"}
                >
                  {isPlaying ? <i className="fi fi-rr-pause"></i> : <i className="fi fi-rr-play"></i>}
                </button>
                <button onClick={onNextFrame} disabled={currentFrameIndex === turtleFrames.length - 1} title="다음">
                  <i className="fi fi-rr-angle-double-right"></i>
                </button>
                <button onClick={onGoToLastFrame} title="마지막으로">
                  <i className="fi fi-rr-forward"></i>
                </button>
              </div>
            </div>
          )}

          {/* Output Text with Matplotlib Images */}
          <div ref={outputRef} className="output-text">
            {output ? (
              renderOutputWithImages(output)
            ) : (
              '코드를 실행하면 결과가 여기에 표시됩니다.'
            )}
          </div>

          {/* Input Area */}
          {waitingForInput && (
            <div className="input-area">
              {showKeyButtons && onKeyButtonClick ? (
                <div className="key-buttons">
                  {keyButtonType === 'horizontal' && (
                    <>
                      <button onClick={() => onKeyButtonClick('a')} className="key-btn left">
                        <i className="fi fi-rr-arrow-left"></i> A (왼쪽)
                      </button>
                      <button onClick={() => onKeyButtonClick('d')} className="key-btn right">
                        <i className="fi fi-rr-arrow-right"></i> D (오른쪽)
                      </button>
                    </>
                  )}
                  {keyButtonType === 'vertical' && (
                    <>
                      <button onClick={() => onKeyButtonClick('w')} className="key-btn up">
                        <i className="fi fi-rr-arrow-up"></i> W (위)
                      </button>
                      <button onClick={() => onKeyButtonClick('s')} className="key-btn down">
                        <i className="fi fi-rr-arrow-down"></i> S (아래)
                      </button>
                    </>
                  )}
                  {keyButtonType === 'confirm' && (
                    <>
                      <button onClick={() => onKeyButtonClick('y')} className="key-btn yes">
                        <i className="fi fi-rr-check"></i> Y (이동)
                      </button>
                      <button onClick={() => onKeyButtonClick('n')} className="key-btn no">
                        <i className="fi fi-rr-cross-circle"></i> N (정지)
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-input-area">
                  <label>{inputPrompt}</label>
                  <div className="input-row">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInput}
                      onChange={(e) => onUserInputChange?.(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="입력 후 Enter를 누르세요..."
                      autoFocus
                    />
                    <button onClick={onInputSubmit} className="submit-btn">
                      <i className="fi fi-rr-check"></i> 입력
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
