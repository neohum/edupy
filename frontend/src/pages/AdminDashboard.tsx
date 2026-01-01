import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import TestCurriculum from './TestCurriculum';
import { usePyodide } from '../hooks/usePyodide';
import LearningMenuDropdown from '../components/LearningMenuDropdown';
import DashboardOverview from '../components/DashboardOverview';
import { API_ENDPOINTS } from '../config/api';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'errors' | 'test'>('overview');
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'unresolved'>('unresolved');
  const [testingError, setTestingError] = useState<number | null>(null);
  const [selectedErrors, setSelectedErrors] = useState<Set<number>>(new Set());
  const [isBatchTesting, setIsBatchTesting] = useState(false);
  const navigate = useNavigate();
  const { pyodide, isReady } = usePyodide();

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
      const response = await fetch(API_ENDPOINTS.adminVerify, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
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
      const errorsResponse = await fetch(`${API_ENDPOINTS.errors}?filter_status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (errorsResponse.ok) {
        const errorsData = await errorsResponse.json();
        setErrors(errorsData.errors || []);
      }

      // 통계 가져오기
      const statsResponse = await fetch(API_ENDPOINTS.errorsStatistics, {
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
      const response = await fetch(API_ENDPOINTS.errorToggle(errorId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadData(filterStatus);
        toast.success('상태 변경 완료');
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

  const batchTestErrors = async () => {
    if (selectedErrors.size === 0) {
      toast.warning('테스트할 오류를 선택해주세요.');
      return;
    }

    const confirmed = window.confirm(`선택된 ${selectedErrors.size}개의 오류를 테스트하시겠습니까?`);

    if (!confirmed) return;

    setIsBatchTesting(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(API_ENDPOINTS.errorsBatchTest, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error_ids: Array.from(selectedErrors),
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // 결과 표시
        const successCount = data.results.filter((r: any) => r.success).length;
        const failCount = data.results.filter((r: any) => !r.success).length;

        const resultMessage = `테스트 결과: 성공 ${successCount}개, 실패 ${failCount}개`;

        if (successCount > 0) {
          toast.success(resultMessage);
        } else {
          toast.error(resultMessage);
        }

        // 상세 결과 콘솔 출력
        console.log('일괄 테스트 결과:', data.results);

        // 선택 해제 및 목록 새로고침
        setSelectedErrors(new Set());
        loadData(filterStatus);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || '테스트 실패');
      }
    } catch (error: any) {
      console.error('Batch test error:', error);
      toast.error(error.message || '서버 오류가 발생했습니다.');
    } finally {
      setIsBatchTesting(false);
    }
  };

  const testAndResolve = async (error: ErrorReport) => {
    if (!isReady || !pyodide) {
      toast.warning('Python 실행 환경을 준비 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setTestingError(error.id);

    try {
      // 출력 캡처를 위한 설정
      let output = '';

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
        const response = await fetch(API_ENDPOINTS.errorToggle(error.id), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          toast.success('테스트 성공! 오류를 해결됨으로 표시했습니다.');
          if (output) {
            console.log('실행 출력:', output);
          }
          loadData(filterStatus);
        }
      } catch (testError: any) {
        // 여전히 에러가 발생하면 알림
        toast.error('테스트 실패: 오류가 아직 해결되지 않았습니다.');
        console.error('테스트 오류:', testError.message);
      } finally {
        // stdout 복원
        pyodide.runPython('sys.stdout = _original_stdout');
      }
    } catch (error) {
      console.error('Failed to test code:', error);
      toast.error('코드 실행 중 오류가 발생했습니다.');
    } finally {
      setTestingError(null);
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
            <a href="/"><span className="logo-icon">EPY</span> EduPy</a>
          </h1>

          <div className="page-title-wrapper">
            <h2 className="page-title">
              <i className="fi fi-rr-chart-histogram"></i> 관리자 대시보드
            </h2>
          </div>

          <div className="admin-info">
            {/* 학습 메뉴 드롭다운 */}
            <LearningMenuDropdown />

            <span className="admin-username"><i className="fi fi-rr-user"></i> {username}</span>
            <button onClick={handleLogout} className="logout-button">
              <i className="fi fi-rr-sign-out-alt"></i> 로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="admin-dashboard-layout">
        {/* 왼쪽 사이드바 메뉴 */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`sidebar-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="menu-icon"><i className="fi fi-rr-chart-histogram"></i></span>
              <span className="menu-text">사용자 현황</span>
            </button>
            <button
              className={`sidebar-menu-item ${activeTab === 'errors' ? 'active' : ''}`}
              onClick={() => setActiveTab('errors')}
            >
              <span className="menu-icon"><i className="fi fi-rr-bug"></i></span>
              <span className="menu-text">오류 관리</span>
            </button>
            <button
              className={`sidebar-menu-item ${activeTab === 'test' ? 'active' : ''}`}
              onClick={() => setActiveTab('test')}
            >
              <span className="menu-icon"><i className="fi fi-rr-flask"></i></span>
              <span className="menu-text">테스트 페이지</span>
            </button>
          </nav>
        </aside>

        {/* 메인 콘텐츠 영역 */}
        <main className="admin-main-content">

        {/* 사용자 현황 탭 */}
        {activeTab === 'overview' && (
          <DashboardOverview />
        )}

        {/* 오류 관리 탭 */}
        {activeTab === 'errors' && (
          <>
            {/* 통계 카드 */}
            <div className="stats-section">
              <div className="stat-card total">
                <div className="stat-icon"><i className="fi fi-rr-chart-pie-alt"></i></div>
                <div className="stat-content">
                  <h3>전체 오류</h3>
                  <p className="stat-number">{statistics?.total_errors || 0}</p>
                </div>
              </div>

              <div className="stat-card resolved">
                <div className="stat-icon"><i className="fi fi-rr-check-circle"></i></div>
                <div className="stat-content">
                  <h3>해결됨</h3>
                  <p className="stat-number">{statistics?.resolved_errors || 0}</p>
                </div>
              </div>

              <div className="stat-card unresolved">
                <div className="stat-icon"><i className="fi fi-rr-triangle-warning"></i></div>
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
                    <button
                      className="batch-test-btn"
                      onClick={() => batchTestErrors()}
                      disabled={isBatchTesting}
                    >
                      {isBatchTesting ? '테스트 중...' : <><i className="fi fi-rr-flask"></i> 선택된 {selectedErrors.size}개 일괄 테스트</>}
                    </button>
                  )}
                </div>
              </div>

          {errors.length === 0 ? (
            <div className="no-errors">
              <p><i className="fi fi-rr-inbox"></i> 보고된 오류가 없습니다.</p>
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
                          {error.resolved ? <><i className="fi fi-rr-check-circle"></i> 해결됨</> : <><i className="fi fi-rr-triangle-warning"></i> 미해결</>}
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
                            <button
                              onClick={() => testAndResolve(error)}
                              className="btn-test"
                              disabled={testingError === error.id}
                            >
                              {testingError === error.id ? '테스트 중...' : <><i className="fi fi-rr-flask"></i> 테스트</>}
                            </button>
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
                  <i className="fi fi-rr-cross-small"></i>
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

        </main>
      </div>
    </>
  );
}

