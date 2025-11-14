import { useState } from 'react';
import './ErrorReportButton.css';

interface ErrorReportButtonProps {
  errorInfo: {
    message: string;
    code: string;
  } | null;
  level: string;
  activity: string;
}

export default function ErrorReportButton({ errorInfo, level, activity }: ErrorReportButtonProps) {
  const [sending, setSending] = useState(false);

  if (!errorInfo) return null;

  const sendErrorReport = async () => {
    setSending(true);

    try {
      // 백엔드 API로 오류 보고 전송
      const response = await fetch('http://localhost:8000/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          activity,
          error_message: errorInfo.message,
          user_code: errorInfo.code,
          timestamp: new Date().toLocaleString('ko-KR'),
        }),
      });

      if (!response.ok) {
        throw new Error('이메일 발송 실패');
      }

      alert('오류 보고가 성공적으로 전송되었습니다. 감사합니다!');
    } catch (error) {
      console.error('이메일 발송 실패:', error);
      alert('오류 보고 전송에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      className="error-report-button"
      onClick={sendErrorReport}
      disabled={sending}
    >
      {sending ? '📤 전송 중...' : '🐛 오류 보고'}
    </button>
  );
}

