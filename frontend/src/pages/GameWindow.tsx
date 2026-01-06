import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { WS_ENDPOINTS } from '../config/api';
import './GameWindow.css';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export default function GameWindow() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fps, setFps] = useState<number>(0);

  // FPS 계산용
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(0);

  // 프레임 렌더링
  const renderFrame = useCallback((base64Data: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      if (canvas.width !== img.width || canvas.height !== img.height) {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      ctx.drawImage(img, 0, 0);
    };
    img.src = `data:image/jpeg;base64,${base64Data}`;
  }, []);

  // FPS 업데이트
  const updateFps = useCallback(() => {
    frameCountRef.current++;
    const now = Date.now();
    const elapsed = now - lastFpsUpdateRef.current;

    if (elapsed >= 1000) {
      setFps(Math.round(frameCountRef.current * 1000 / elapsed));
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }
  }, []);

  // 키 이벤트 전송
  const sendKeyEvent = useCallback((type: 'keydown' | 'keyup', code: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
      type,
      key: code
    }));
  }, []);

  // StrictMode cleanup 처리를 위한 ref
  const isCleaningUpRef = useRef(false);
  const cleanupTimeoutRef = useRef<number | null>(null);

  // WebSocket 연결
  useEffect(() => {
    if (!sessionId) return;

    // 이전 cleanup 취소
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
    isCleaningUpRef.current = false;

    // FPS 계산용 초기화
    if (lastFpsUpdateRef.current === 0) {
      lastFpsUpdateRef.current = Date.now();
    }

    // 이미 연결된 WebSocket이 있으면 재사용
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = WS_ENDPOINTS.pygameStream(sessionId);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isCleaningUpRef.current) {
        setStatus('connected');
      }
    };

    ws.onmessage = (event) => {
      if (isCleaningUpRef.current) return;

      try {
        const data = JSON.parse(event.data);

        if (data.type === 'frame') {
          renderFrame(data.data);
          updateFps();
        } else if (data.type === 'status') {
          if (data.state === 'stopped') {
            setStatus('disconnected');
          } else if (data.state === 'error') {
            setStatus('error');
            setErrorMessage(data.error || 'Unknown error');
          }
        } else if (data.type === 'error') {
          setStatus('error');
          setErrorMessage(data.message);
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = () => {
      if (!isCleaningUpRef.current) {
        setStatus('error');
        setErrorMessage('WebSocket connection error');
      }
    };

    ws.onclose = () => {
      if (!isCleaningUpRef.current) {
        setStatus('disconnected');
      }
    };

    return () => {
      // StrictMode에서 즉시 remount되는 경우를 위해 지연 처리
      isCleaningUpRef.current = true;
      cleanupTimeoutRef.current = window.setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'close' }));
          ws.close();
        }
        wsRef.current = null;
      }, 100); // 100ms 지연
    };
  }, [sessionId, renderFrame, updateFps]);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 브라우저 기본 동작 방지 (스크롤 등)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      sendKeyEvent('keydown', e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      sendKeyEvent('keyup', e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [sendKeyEvent]);

  // 게임 종료
  const handleClose = () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'close' }));
    }
    window.close();
  };

  return (
    <div className="game-window">
      <div className="game-header">
        <span className="game-title">
          <i className="fi fi-rr-gamepad"></i> EduPy Game
        </span>
        <span className={`connection-status ${status}`}>
          {status === 'connecting' && (
            <>
              <i className="fi fi-rr-refresh"></i> Connecting...
            </>
          )}
          {status === 'connected' && (
            <>
              <i className="fi fi-rr-check"></i> Connected ({fps} FPS)
            </>
          )}
          {status === 'disconnected' && (
            <>
              <i className="fi fi-rr-cross-circle"></i> Disconnected
            </>
          )}
          {status === 'error' && (
            <>
              <i className="fi fi-rr-exclamation"></i> Error
            </>
          )}
        </span>
        <button onClick={handleClose} className="close-button">
          <i className="fi fi-rr-cross"></i> Close
        </button>
      </div>

      <div className="game-container">
        {status === 'connecting' && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Starting game...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="error-overlay">
            <i className="fi fi-rr-exclamation error-icon"></i>
            <h2>Game Error</h2>
            <p className="error-message">{errorMessage}</p>
            <button onClick={handleClose} className="error-close-button">
              Close Game
            </button>
          </div>
        )}

        {status === 'disconnected' && (
          <div className="disconnected-overlay">
            <i className="fi fi-rr-check-circle success-icon"></i>
            <h2>Game Ended</h2>
            <p>The game session has ended.</p>
            <button onClick={handleClose} className="error-close-button">
              Close Window
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="game-canvas"
          width={800}
          height={600}
          tabIndex={0}
        />
      </div>

      <div className="game-footer">
        <div className="controls-info">
          <span className="key-hint">
            <kbd>Arrow Keys</kbd> / <kbd>WASD</kbd> Move
          </span>
          <span className="key-hint">
            <kbd>Space</kbd> Action
          </span>
          <span className="key-hint">
            <kbd>Enter</kbd> Confirm
          </span>
        </div>
      </div>
    </div>
  );
}
