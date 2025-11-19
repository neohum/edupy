import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import TestCurriculum from './TestCurriculum';
import { usePyodide } from '../hooks/usePyodide';
import './AdminDashboard.css';

interface ErrorReport {
  id: number;
  error_type: string;
  error_message: string;
  code: string;
  level: string;
  activity: string;
  user_agent: string;
  created_at: string;
  resolved: number;
}

interface ErrorStatistics {
  total_errors: number;
  resolved_errors: number;
  unresolved_errors: number;
  error_types: { [key: string]: number };
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [statistics, setStatistics] = useState<ErrorStatistics | null>(null);
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [activeTab, setActiveTab] = useState<'errors' | 'test'>('errors');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'unresolved'>('unresolved');
  const [testingError, setTestingError] = useState<number | null>(null);
  const [selectedErrors, setSelectedErrors] = useState<Set<number>>(new Set());
  const [isBatchTesting, setIsBatchTesting] = useState(false);
  const navigate = useNavigate();
  const { pyodide, isReady } = usePyodide();

  // 코드 실행 결과 상태
  const [executionResult, setExecutionResult] = useState<{
    type: 'turtle' | 'pygame' | 'python';
    image?: string;
    frames?: string[];
    output?: string;
    error?: string;
  } | null>(null);
  const [showExecutionModal, setShowExecutionModal] = useState(false);

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setTotpEnabled(data.totp_enabled || false);
        loadData();
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async (status: 'all' | 'resolved' | 'unresolved' = filterStatus) => {
    const token = localStorage.getItem('admin_token');

    try {
      // 오류 목록 가져오기 (필터 적용)
      const errorsResponse = await fetch(`http://localhost:8000/api/errors?filter_status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (errorsResponse.ok) {
        const errorsData = await errorsResponse.json();
        setErrors(errorsData.errors || []);
      }

      // 통계 가져오기
      const statsResponse = await fetch('http://localhost:8000/api/errors/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/admin/login');
  };

  const toggleResolved = async (errorId: number) => {
    const token = localStorage.getItem('admin_token');

    try {
      const response = await fetch(`http://localhost:8000/api/errors/${errorId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadData(filterStatus);
        Swal.fire({
          icon: 'success',
          title: '상태 변경 완료',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Failed to toggle resolved:', error);
    }
  };

  const viewErrorDetail = (error: ErrorReport) => {
    setSelectedError(error);
  };

  const toggleErrorSelection = (errorId: number) => {
    const newSelected = new Set(selectedErrors);
    if (newSelected.has(errorId)) {
      newSelected.delete(errorId);
    } else {
      newSelected.add(errorId);
    }
    setSelectedErrors(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedErrors.size === errors.filter(e => !e.resolved).length) {
      // 모두 선택된 경우 -> 모두 해제
      setSelectedErrors(new Set());
    } else {
      // 일부만 선택되거나 아무것도 선택 안 된 경우 -> 미해결 오류 모두 선택
      const unresolvedIds = errors.filter(e => !e.resolved).map(e => e.id);
      setSelectedErrors(new Set(unresolvedIds));
    }
  };

  // 코드 실행 및 결과 표시 함수
  const executeAndShowResult = async (code: string, errorInfo: ErrorReport) => {
    try {
      // 코드 타입 감지
      const isTurtleCode = code.includes('import turtle') || code.includes('from turtle');
      const isPygameCode = code.includes('import pygame') || code.includes('pygame.');

      if (isTurtleCode) {
        // Turtle 코드 실행
        const response = await fetch('http://localhost:8000/api/turtle/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code,
            width: 600,
            height: 600,
            animate: true,
          }),
        });

        const result = await response.json();

        if (result.success && result.frames) {
          setExecutionResult({
            type: 'turtle',
            frames: result.frames,
            output: `✅ Turtle 애니메이션 생성 완료 (${result.frame_count}개 프레임)`,
          });
          setShowExecutionModal(true);
        } else {
          throw new Error(result.error || 'Turtle 실행 실패');
        }
      } else if (isPygameCode) {
        // Pygame 코드 실행
        const response = await fetch('http://localhost:8000/api/pygame/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code,
            width: 800,
            height: 600,
            max_frames: 60,
          }),
        });

        const result = await response.json();

        if (result.success && result.image) {
          setExecutionResult({
            type: 'pygame',
            image: result.image,
            output: result.output || '✅ Pygame 코드 실행 완료',
          });
          setShowExecutionModal(true);
        } else {
          throw new Error(result.error || 'Pygame 실행 실패');
        }
      } else {
        // 일반 Python 코드 실행
        setExecutionResult({
          type: 'python',
          output: '✅ 코드가 성공적으로 실행되었습니다.',
        });
        setShowExecutionModal(true);
      }
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: '코드 실행 실패',
        text: error.message || '코드 실행 중 오류가 발생했습니다.',
      });
    }
  };

  const autoFixError = async (error: ErrorReport) => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'AI 자동 수정',
      html: `
        <p>Augment AI를 사용하여 오류를 자동으로 수정하시겠습니까?</p>
        <p style="font-size: 0.9rem; color: #718096; margin-top: 10px;">
          ⚠️ AI가 코드를 분석하고 수정을 시도합니다.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: '🤖 AI 수정 시작',
      cancelButtonText: '취소',
    });

    if (!result.isConfirmed) return;

    setTestingError(error.id);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:8000/api/errors/${error.id}/auto-fix`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          // 수정 성공 알림
          const confirmResult = await Swal.fire({
            icon: 'success',
            title: 'AI 수정 성공!',
            html: `
              <div style="text-align: left;">
                <h4>✅ 코드가 성공적으로 수정되었습니다!</h4>

                <h5 style="margin-top: 15px;">📝 수정 설명:</h5>
                <p style="background: #f7fafc; padding: 10px; border-radius: 4px;">${data.explanation || '설명 없음'}</p>

                <h5 style="margin-top: 15px;">🔧 수정된 코드:</h5>
                <pre style="background: #f7fafc; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; text-align: left;">${data.fixed_code}</pre>
              </div>
            `,
            width: '700px',
            showCancelButton: true,
            confirmButtonText: '🎯 실행 결과 보기',
            cancelButtonText: '닫기',
          });

          // 실행 결과 보기 버튼 클릭 시
          if (confirmResult.isConfirmed) {
            await executeAndShowResult(data.fixed_code, error);
          }

          loadData(filterStatus);
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'AI 수정 실패',
            html: `
              <p>${data.error || '코드 수정에 실패했습니다.'}</p>
              ${data.fixed_code ? `
                <h5 style="margin-top: 15px;">시도한 수정:</h5>
                <pre style="background: #fff5f5; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; text-align: left;">${data.fixed_code}</pre>
              ` : ''}
            `,
            width: '600px',
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'AI 수정 실패');
      }
    } catch (error: any) {
      console.error('Auto-fix error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'AI 수정 실패',
        text: error.message || '서버 오류가 발생했습니다.',
      });
    } finally {
      setTestingError(null);
    }
  };

  const batchTestErrors = async (autoFix: boolean = false) => {
    if (selectedErrors.size === 0) {
      await Swal.fire({
        icon: 'warning',
        title: '선택된 오류 없음',
        text: '테스트할 오류를 선택해주세요.',
      });
      return;
    }

    const result = await Swal.fire({
      icon: 'question',
      title: autoFix ? 'AI 자동 수정 일괄 테스트' : '일괄 테스트',
      html: `
        <p>선택된 <strong>${selectedErrors.size}개</strong>의 오류를 백엔드에서 테스트하시겠습니까?</p>
        ${autoFix ? '<p style="color: #667eea; font-weight: 600;">🤖 실패한 오류는 AI가 자동으로 수정을 시도합니다.</p>' : ''}
      `,
      showCancelButton: true,
      confirmButtonText: autoFix ? '🤖 AI 수정 시작' : '테스트 시작',
      cancelButtonText: '취소',
    });

    if (!result.isConfirmed) return;

    setIsBatchTesting(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:8000/api/errors/batch-test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error_ids: Array.from(selectedErrors),
          auto_fix: autoFix,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // 결과 표시
        const successCount = data.results.filter((r: any) => r.success).length;
        const failCount = data.results.filter((r: any) => !r.success).length;
        const autoFixedCount = data.results.filter((r: any) => r.auto_fixed).length;

        let resultHtml = `
          <div style="text-align: left;">
            <h3 style="margin-top: 0;">테스트 결과</h3>
            <p><strong>성공:</strong> ${successCount}개 (자동으로 해결됨으로 변경)</p>
            ${autoFix ? `<p><strong>AI 수정 성공:</strong> ${autoFixedCount}개 🤖</p>` : ''}
            <p><strong>실패:</strong> ${failCount}개</p>
            <hr style="margin: 15px 0;">
        `;

        // AI 수정 성공한 오류 표시
        if (autoFix && autoFixedCount > 0) {
          const autoFixedResults = data.results.filter((r: any) => r.auto_fixed);
          resultHtml += '<h4>🤖 AI가 수정한 오류:</h4>';
          autoFixedResults.forEach((r: any) => {
            resultHtml += `
              <div style="background: #e6fffa; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 3px solid #48bb78;">
                <strong>ID ${r.error_id}:</strong> ${r.explanation ? r.explanation.substring(0, 100) : '수정 완료'}
              </div>
            `;
          });
        }

        // 실패한 오류만 표시
        const failedResults = data.results.filter((r: any) => !r.success);
        if (failedResults.length > 0) {
          resultHtml += '<h4>실패한 오류:</h4>';
          failedResults.forEach((r: any) => {
            resultHtml += `
              <div style="background: #fff5f5; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 3px solid #f56565;">
                <strong>ID ${r.error_id}:</strong> ${r.error.substring(0, 100)}${r.error.length > 100 ? '...' : ''}
                ${r.auto_fix_attempted ? ' <span style="color: #667eea;">(AI 수정 시도함)</span>' : ''}
              </div>
            `;
          });
        }

        resultHtml += '</div>';

        await Swal.fire({
          icon: successCount > 0 ? 'success' : 'error',
          title: '일괄 테스트 완료',
          html: resultHtml,
          width: '600px',
        });

        // 선택 해제 및 목록 새로고침
        setSelectedErrors(new Set());
        loadData(filterStatus);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || '테스트 실패');
      }
    } catch (error: any) {
      console.error('Batch test error:', error);
      await Swal.fire({
        icon: 'error',
        title: '테스트 실패',
        text: error.message || '서버 오류가 발생했습니다.',
      });
    } finally {
      setIsBatchTesting(false);
    }
  };

  const testAndResolve = async (error: ErrorReport) => {
    if (!isReady || !pyodide) {
      await Swal.fire({
        icon: 'warning',
        title: 'Pyodide 로딩 중',
        text: 'Python 실행 환경을 준비 중입니다. 잠시 후 다시 시도해주세요.',
      });
      return;
    }

    setTestingError(error.id);

    try {
      // 출력 캡처를 위한 설정
      let output = '';
      const originalStdout = pyodide.globals.get('print');

      pyodide.runPython(`
import sys
from io import StringIO

_output_buffer = StringIO()
_original_stdout = sys.stdout

class OutputCapture:
    def write(self, text):
        _output_buffer.write(text)
    def flush(self):
        pass

sys.stdout = OutputCapture()
      `);

      try {
        // 코드 실행
        await pyodide.runPythonAsync(error.code);

        // 출력 가져오기
        output = pyodide.runPython('_output_buffer.getvalue()');

        // 에러 없이 실행되면 해결됨으로 표시
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`http://localhost:8000/api/errors/${error.id}/toggle`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await Swal.fire({
            icon: 'success',
            title: '테스트 성공!',
            html: `
              <p>코드가 정상적으로 실행되었습니다.</p>
              <p>오류를 <strong>해결됨</strong>으로 표시했습니다.</p>
              ${output ? `<pre style="text-align: left; background: #f7fafc; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto;">${output}</pre>` : ''}
            `,
          });
          loadData(filterStatus);
        }
      } catch (testError: any) {
        // 여전히 에러가 발생하면 알림
        await Swal.fire({
          icon: 'error',
          title: '테스트 실패',
          html: `
            <p>코드 실행 중 오류가 발생했습니다.</p>
            <p>오류가 아직 해결되지 않았습니다.</p>
            <pre style="text-align: left; background: #fff5f5; padding: 10px; border-radius: 4px; color: #c53030; max-height: 200px; overflow-y: auto;">${testError.message}</pre>
          `,
        });
      } finally {
        // stdout 복원
        pyodide.runPython('sys.stdout = _original_stdout');
      }
    } catch (error) {
      console.error('Failed to test code:', error);
      await Swal.fire({
        icon: 'error',
        title: '테스트 실패',
        text: '코드 실행 중 오류가 발생했습니다.',
      });
    } finally {
      setTestingError(null);
    }
  };

  const handleSetup2FA = async () => {
    const token = localStorage.getItem('admin_token');

    try {
      const response = await fetch('http://localhost:8000/api/admin/setup-2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qr_code);
        setTotpSecret(data.secret);
        setShow2FASetup(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: '오류',
          text: '2FA 설정을 시작할 수 없습니다.',
        });
      }
    } catch (error) {
      console.error('2FA setup error:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '서버 연결에 실패했습니다.',
      });
    }
  };

  const handleEnable2FA = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '6자리 인증 코드를 입력해주세요.',
      });
      return;
    }

    const token = localStorage.getItem('admin_token');
    const username = localStorage.getItem('admin_username');

    try {
      const response = await fetch('http://localhost:8000/api/admin/enable-2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          totp_code: verifyCode,
        }),
      });

      if (response.ok) {
        setTotpEnabled(true);
        setShow2FASetup(false);
        setVerifyCode('');
        Swal.fire({
          icon: 'success',
          title: '2FA 활성화 완료',
          text: '2단계 인증이 활성화되었습니다.',
        });
      } else {
        const data = await response.json();
        Swal.fire({
          icon: 'error',
          title: '인증 실패',
          text: data.detail || '인증 코드가 올바르지 않습니다.',
        });
      }
    } catch (error) {
      console.error('2FA enable error:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '서버 연결에 실패했습니다.',
      });
    }
  };

  const handleDisable2FA = async () => {
    const result = await Swal.fire({
      title: '2FA 비활성화',
      text: '2단계 인증을 비활성화하시겠습니까?',
      input: 'text',
      inputLabel: '현재 2FA 코드를 입력하세요',
      inputPlaceholder: '6자리 코드',
      showCancelButton: true,
      confirmButtonText: '비활성화',
      cancelButtonText: '취소',
      inputValidator: (value) => {
        if (!value || value.length !== 6) {
          return '6자리 코드를 입력해주세요';
        }
        return null;
      }
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem('admin_token');
    const username = localStorage.getItem('admin_username');

    try {
      const response = await fetch('http://localhost:8000/api/admin/disable-2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          totp_code: result.value,
        }),
      });

      if (response.ok) {
        setTotpEnabled(false);
        Swal.fire({
          icon: 'success',
          title: '2FA 비활성화 완료',
          text: '2단계 인증이 비활성화되었습니다.',
        });
      } else {
        const data = await response.json();
        Swal.fire({
          icon: 'error',
          title: '인증 실패',
          text: data.detail || '인증 코드가 올바르지 않습니다.',
        });
      }
    } catch (error) {
      console.error('2FA disable error:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '서버 연결에 실패했습니다.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const username = localStorage.getItem('admin_username');

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1 className="logo">
            <a href="/">🐍 EduPy</a>
          </h1>

          <div className="page-title-wrapper">
            <h2 className="page-title">
              📊 관리자 대시보드
            </h2>
          </div>

          <div className="admin-info">
            {/* 학습 메뉴 드롭다운 */}
            <div className="dropdown">
              <button className="nav-link dropdown-toggle">
                🐍 학습 메뉴 ▼
              </button>
              <div className="dropdown-menu">
                <a href="https://tt.hancomtaja.com/ko" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                  ⌨️ 한컴 타자 연습
                </a>
                <a href="/python" className="dropdown-item">
                  🐍 파이썬 학습
                </a>
                <a href="/pygame" className="dropdown-item">
                  📚 파이게임 기초 문법
                </a>
                <div className="dropdown-item disabled">
                  📊 데이터 분석과 시각화 <span className="badge-coming-soon">준비중</span>
                </div>
                <div className="dropdown-item disabled">
                  🤖 AI 코딩 <span className="badge-coming-soon">준비중</span>
                </div>
                <div className="dropdown-item disabled">
                  🎮 파이게임 만들기 <span className="badge-coming-soon">준비중</span>
                </div>
              </div>
            </div>

            <button onClick={() => setShowSecurityModal(true)} className="security-button">
              🔐 보안 설정
            </button>
            <span className="admin-username">👤 {username}</span>
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="admin-dashboard-layout">
        {/* 왼쪽 사이드바 메뉴 */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`sidebar-menu-item ${activeTab === 'errors' ? 'active' : ''}`}
              onClick={() => setActiveTab('errors')}
            >
              <span className="menu-icon">🐛</span>
              <span className="menu-text">오류 관리</span>
            </button>
            <button
              className={`sidebar-menu-item ${activeTab === 'test' ? 'active' : ''}`}
              onClick={() => setActiveTab('test')}
            >
              <span className="menu-icon">🧪</span>
              <span className="menu-text">테스트 페이지</span>
            </button>
          </nav>
        </aside>

        {/* 메인 콘텐츠 영역 */}
        <main className="admin-main-content">

        {/* 오류 관리 탭 */}
        {activeTab === 'errors' && (
          <>
            {/* 통계 카드 */}
            <div className="stats-section">
              <div className="stat-card total">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>전체 오류</h3>
                  <p className="stat-number">{statistics?.total_errors || 0}</p>
                </div>
              </div>

              <div className="stat-card resolved">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>해결됨</h3>
                  <p className="stat-number">{statistics?.resolved_errors || 0}</p>
                </div>
              </div>

              <div className="stat-card unresolved">
                <div className="stat-icon">⚠️</div>
                <div className="stat-content">
                  <h3>미해결</h3>
                  <p className="stat-number">{statistics?.unresolved_errors || 0}</p>
                </div>
              </div>
            </div>

            {/* 오류 목록 */}
            <div className="errors-section">
              <div className="errors-header">
                <h2>오류 보고 목록</h2>
                <div className="header-actions">
                  <div className="filter-buttons">
                    <button
                      className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setFilterStatus('all');
                        loadData('all');
                        setSelectedErrors(new Set());
                      }}
                    >
                      전체
                    </button>
                    <button
                      className={`filter-btn ${filterStatus === 'unresolved' ? 'active' : ''}`}
                      onClick={() => {
                        setFilterStatus('unresolved');
                        loadData('unresolved');
                        setSelectedErrors(new Set());
                      }}
                    >
                      미해결
                    </button>
                    <button
                      className={`filter-btn ${filterStatus === 'resolved' ? 'active' : ''}`}
                      onClick={() => {
                        setFilterStatus('resolved');
                        loadData('resolved');
                        setSelectedErrors(new Set());
                      }}
                    >
                      해결됨
                    </button>
                  </div>
                  {selectedErrors.size > 0 && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="batch-test-btn"
                        onClick={() => batchTestErrors(false)}
                        disabled={isBatchTesting}
                      >
                        {isBatchTesting ? '테스트 중...' : `🧪 선택된 ${selectedErrors.size}개 일괄 테스트`}
                      </button>
                      <button
                        className="batch-test-btn auto-fix"
                        onClick={() => batchTestErrors(true)}
                        disabled={isBatchTesting}
                        title="실패한 오류를 AI가 자동으로 수정합니다"
                      >
                        {isBatchTesting ? '테스트 중...' : `🤖 AI 자동 수정 테스트`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

          {errors.length === 0 ? (
            <div className="no-errors">
              <p>📭 보고된 오류가 없습니다.</p>
            </div>
          ) : (
            <div className="errors-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>
                      {errors.filter(e => !e.resolved).length > 0 && (
                        <input
                          type="checkbox"
                          checked={selectedErrors.size === errors.filter(e => !e.resolved).length && errors.filter(e => !e.resolved).length > 0}
                          onChange={toggleSelectAll}
                          title="전체 선택/해제"
                        />
                      )}
                    </th>
                    <th>ID</th>
                    <th>오류 타입</th>
                    <th>레벨/활동</th>
                    <th>발생 시간</th>
                    <th>상태</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((error) => (
                    <tr key={error.id} className={error.resolved ? 'resolved' : ''}>
                      <td>
                        {!error.resolved && (
                          <input
                            type="checkbox"
                            checked={selectedErrors.has(error.id)}
                            onChange={() => toggleErrorSelection(error.id)}
                          />
                        )}
                      </td>
                      <td>{error.id}</td>
                      <td>
                        <span className="error-type">{error.error_type}</span>
                      </td>
                      <td>
                        <div className="error-location">
                          <div>{error.level}</div>
                          <div className="activity-name">{error.activity}</div>
                        </div>
                      </td>
                      <td>{new Date(error.created_at).toLocaleString('ko-KR')}</td>
                      <td>
                        <span className={`status-badge ${error.resolved ? 'resolved' : 'unresolved'}`}>
                          {error.resolved ? '✅ 해결됨' : '⚠️ 미해결'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => viewErrorDetail(error)}
                            className="btn-view"
                          >
                            상세보기
                          </button>
                          {!error.resolved && (
                            <>
                              <button
                                onClick={() => testAndResolve(error)}
                                className="btn-test"
                                disabled={testingError === error.id}
                              >
                                {testingError === error.id ? '테스트 중...' : '🧪 테스트'}
                              </button>
                              <button
                                onClick={() => autoFixError(error)}
                                className="btn-auto-fix"
                                disabled={testingError === error.id}
                                title="AI가 자동으로 코드를 수정합니다"
                              >
                                {testingError === error.id ? '수정 중...' : '🤖 AI 수정'}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toggleResolved(error.id)}
                            className="btn-toggle"
                          >
                            {error.resolved ? '미해결로' : '해결됨으로'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 오류 상세 모달 */}
        {selectedError && (
          <div className="modal-overlay" onClick={() => setSelectedError(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>오류 상세 정보</h2>
                <button onClick={() => setSelectedError(null)} className="modal-close">
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-row">
                  <strong>오류 타입:</strong>
                  <span>{selectedError.error_type}</span>
                </div>

                <div className="detail-row">
                  <strong>오류 메시지:</strong>
                  <pre className="error-message">{selectedError.error_message}</pre>
                </div>

                <div className="detail-row">
                  <strong>레벨:</strong>
                  <span>{selectedError.level}</span>
                </div>

                <div className="detail-row">
                  <strong>활동:</strong>
                  <span>{selectedError.activity}</span>
                </div>

                <div className="detail-row">
                  <strong>코드:</strong>
                  <pre className="code-block">{selectedError.code}</pre>
                </div>

                <div className="detail-row">
                  <strong>발생 시간:</strong>
                  <span>{new Date(selectedError.created_at).toLocaleString('ko-KR')}</span>
                </div>

                <div className="detail-row">
                  <strong>User Agent:</strong>
                  <span className="user-agent">{selectedError.user_agent}</span>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* 테스트 페이지 탭 */}
        {activeTab === 'test' && (
          <div className="test-page-embedded">
            <TestCurriculum hideHeader={true} />
          </div>
        )}

        {/* 코드 실행 결과 모달 */}
        {showExecutionModal && executionResult && (
          <div className="modal-overlay" onClick={() => setShowExecutionModal(false)}>
            <div className="modal-content execution-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
              <div className="modal-header">
                <h2>🎯 코드 실행 결과</h2>
                <button className="close-button" onClick={() => setShowExecutionModal(false)}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {executionResult.type === 'turtle' && executionResult.frames && (
                  <div className="execution-result">
                    <h3>🐢 Turtle 애니메이션</h3>
                    <div className="turtle-animation-display">
                      <img
                        src={executionResult.frames[executionResult.frames.length - 1]}
                        alt="Turtle Result"
                        style={{
                          maxWidth: '100%',
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          marginTop: '10px'
                        }}
                      />
                      <p style={{ marginTop: '10px', color: '#48bb78' }}>
                        {executionResult.output}
                      </p>
                    </div>
                  </div>
                )}

                {executionResult.type === 'pygame' && executionResult.image && (
                  <div className="execution-result">
                    <h3>🎮 Pygame 실행 결과</h3>
                    <div className="pygame-display">
                      <img
                        src={executionResult.image}
                        alt="Pygame Result"
                        style={{
                          maxWidth: '100%',
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          marginTop: '10px'
                        }}
                      />
                      <p style={{ marginTop: '10px', color: '#48bb78' }}>
                        {executionResult.output}
                      </p>
                    </div>
                  </div>
                )}

                {executionResult.type === 'python' && (
                  <div className="execution-result">
                    <h3>🐍 Python 실행 결과</h3>
                    <pre style={{
                      background: '#f7fafc',
                      padding: '15px',
                      borderRadius: '8px',
                      marginTop: '10px',
                      color: '#2d3748'
                    }}>
                      {executionResult.output}
                    </pre>
                  </div>
                )}

                {executionResult.error && (
                  <div className="execution-error" style={{
                    background: '#fff5f5',
                    padding: '15px',
                    borderRadius: '8px',
                    marginTop: '10px',
                    color: '#c53030'
                  }}>
                    <h4>❌ 오류 발생:</h4>
                    <pre>{executionResult.error}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 보안 설정 모달 */}
        {showSecurityModal && (
          <div className="modal-overlay" onClick={() => setShowSecurityModal(false)}>
            <div className="modal-content security-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🔐 보안 설정</h2>
                <button className="close-button" onClick={() => setShowSecurityModal(false)}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="security-card">
                  <div className="security-info">
                    <h3>2단계 인증 (2FA)</h3>
                    <p>Google Authenticator를 사용한 추가 보안 계층</p>
                    <p className="security-status">
                      상태: {totpEnabled ? (
                        <span className="status-enabled">✅ 활성화됨</span>
                      ) : (
                        <span className="status-disabled">❌ 비활성화됨</span>
                      )}
                    </p>
                  </div>
                  <div className="security-actions">
                    {!totpEnabled ? (
                      <button onClick={() => { setShowSecurityModal(false); handleSetup2FA(); }} className="btn-enable-2fa">
                        2FA 활성화
                      </button>
                    ) : (
                      <button onClick={() => { setShowSecurityModal(false); handleDisable2FA(); }} className="btn-disable-2fa">
                        2FA 비활성화
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2FA 설정 모달 */}
        {show2FASetup && (
          <div className="modal-overlay" onClick={() => setShow2FASetup(false)}>
            <div className="modal-content setup-2fa-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🔐 2단계 인증 설정</h2>
                <button className="close-button" onClick={() => setShow2FASetup(false)}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="setup-steps">
                  <div className="setup-step">
                    <h3>1️⃣ Google Authenticator 앱 설치</h3>
                    <p>스마트폰에 Google Authenticator 앱을 설치하세요.</p>
                    <div className="app-links">
                      <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noopener noreferrer">
                        📱 Android
                      </a>
                      <a href="https://apps.apple.com/app/google-authenticator/id388497605" target="_blank" rel="noopener noreferrer">
                        🍎 iOS
                      </a>
                    </div>
                  </div>

                  <div className="setup-step">
                    <h3>2️⃣ QR 코드 스캔</h3>
                    <p>Google Authenticator 앱에서 아래 QR 코드를 스캔하세요.</p>
                    {qrCode && (
                      <div className="qr-code-container">
                        <img src={qrCode} alt="2FA QR Code" />
                      </div>
                    )}
                    <p className="secret-key">
                      <small>수동 입력 키: <code>{totpSecret}</code></small>
                    </p>
                  </div>

                  <div className="setup-step">
                    <h3>3️⃣ 인증 코드 입력</h3>
                    <p>앱에 표시된 6자리 코드를 입력하여 설정을 완료하세요.</p>
                    <input
                      type="text"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      placeholder="6자리 코드"
                      maxLength={6}
                      className="verify-code-input"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button onClick={handleEnable2FA} className="btn-confirm">
                    활성화
                  </button>
                  <button onClick={() => setShow2FASetup(false)} className="btn-cancel">
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </>
  );
}

