import { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
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
      const response = await fetch(API_ENDPOINTS.sendErrorReport, {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || '오류 보고 전송 실패');
      }

      // 중복 오류인 경우
      if (data.duplicate) {
        const existingError = data.existing_error;
        const createdDate = new Date(existingError.created_at).toLocaleString('ko-KR');
        const statusText = existingError.resolved ? '✅ 해결됨' : '⏳ 처리 중';

        alert(
          `⚠️ 이미 접수된 오류입니다.\n\n` +
          `📋 오류 ID: #${existingError.id}\n` +
          `📅 최초 접수일: ${createdDate}\n` +
          `📊 상태: ${statusText}\n\n` +
          `동일한 오류가 이미 보고되어 처리 중입니다.`
        );
      } else {
        // 새로운 오류 접수 성공
        alert(
          `✅ 오류 보고가 성공적으로 전송되었습니다!\n\n` +
          `📋 오류 ID: #${data.error_id}\n` +
          `감사합니다! 빠른 시일 내에 확인하겠습니다.`
        );
      }
    } catch (error) {
      console.error('오류 보고 전송 실패:', error);
      alert('❌ 오류 보고 전송에 실패했습니다.\n\n백엔드 서버가 실행 중인지 확인해주세요.');
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

