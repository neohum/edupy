import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_ENDPOINTS, fetchAPI } from '../config/api';
import './ErrorManagement.css';

interface ErrorReport {
  id: number;
  level: string;
  activity: string;
  error_message: string;
  user_code: string;
  timestamp: string;
  resolved: number;
  resolved_at: string | null;
  created_at: string;
}

interface ErrorStatistics {
  total_errors: number;
  resolved_errors: number;
  unresolved_errors: number;
  errors_by_level: { level: string; count: number }[];
  errors_by_activity: { activity: string; count: number }[];
  common_errors: { error_message: string; count: number }[];
  recent_trend: { date: string; count: number }[];
}

interface VerificationResult {
  success: boolean;
  error_occurred: boolean;
  error_message?: string;
  error_type?: string;
  suggestion?: string;
  output?: string;
}

interface BulkVerificationResult extends VerificationResult {
  id: number;
  level: number;
  activity: string;
  error_message: string;
}

export default function ErrorManagement() {
  const [statistics, setStatistics] = useState<ErrorStatistics | null>(null);
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  const [activeTab, setActiveTab] = useState<'statistics' | 'reports'>('statistics');
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [verifyingReport, setVerifyingReport] = useState<ErrorReport | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [bulkVerifying, setBulkVerifying] = useState(false);
  const [bulkVerificationResults, setBulkVerificationResults] = useState<BulkVerificationResult[]>([]);
  const itemsPerPage = 10;

  // 통계 데이터 가져오기 (한 번만 실행)
  const fetchStatistics = useCallback(async () => {
    const result = await fetchAPI<ErrorStatistics>(API_ENDPOINTS.errorStatistics);
    if (result.success && result.data) {
      setStatistics(result.data);
    }
  }, []);

  // 오류 목록 가져오기 (페이지/필터 변경 시 실행)
  const fetchReports = useCallback(async () => {
    const offset = (currentPage - 1) * itemsPerPage;
    const url = `${API_ENDPOINTS.errorReports}?limit=${itemsPerPage}&offset=${offset}&filter_status=${filterStatus}`;

    const result = await fetchAPI<ErrorReport[]>(url);
    if (result.success && result.data) {
      setReports(result.data);
    }
  }, [currentPage, filterStatus]);

  // 전체 개수 계산 (통계 데이터 기반)
  const totalReportsCount = useMemo(() => {
    if (!statistics) return 0;

    if (filterStatus === 'all') {
      return statistics.total_errors;
    } else if (filterStatus === 'resolved') {
      return statistics.resolved_errors;
    } else {
      return statistics.unresolved_errors;
    }
  }, [statistics, filterStatus]);

  // 초기 로드 및 통계 갱신
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // 페이지/필터 변경 시 목록만 갱신
  useEffect(() => {
    setLoading(true);
    fetchReports().finally(() => setLoading(false));
  }, [fetchReports]);

  // totalReports 업데이트
  useEffect(() => {
    setTotalReports(totalReportsCount);
  }, [totalReportsCount]);

  // 데이터 전체 새로고침 (통계 + 목록)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStatistics(), fetchReports()]);
    } finally {
      setLoading(false);
    }
  }, [fetchStatistics, fetchReports]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // 코드 검증 함수 (최적화)
  const verifyCode = useCallback(async (report: ErrorReport) => {
    setVerifyingReport(report);
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch(API_ENDPOINTS.verifyCode, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: report.user_code,
        }),
      });

      const result = await response.json();
      setVerificationResult(result);
    } catch (error) {
      console.error('Failed to verify code:', error);
      setVerificationResult({
        success: false,
        error_occurred: true,
        error_message: '코드 검증 중 오류가 발생했습니다.',
        suggestion: '백엔드 서버를 확인해주세요.',
      });
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // 검증 후 해결 처리 (최적화)
  const resolveAfterVerification = useCallback(async (errorId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.toggleResolved(errorId), {
        method: 'PATCH',
      });

      if (response.ok) {
        // 데이터 새로고침
        await fetchData();
        // 선택 목록에서 제거
        setSelectedIds(prev => prev.filter(id => id !== errorId));
        // 모달 닫기
        setVerifyingReport(null);
        setVerificationResult(null);
      }
    } catch (error) {
      console.error('Failed to toggle resolved status:', error);
    }
  }, [fetchData]);

  const toggleResolved = useCallback(async (errorId: number, event: React.MouseEvent, currentStatus: number) => {
    event.stopPropagation();

    // 해결 상태로 변경하는 경우에만 검증
    if (currentStatus === 0) {
      // 해당 오류 찾기
      const report = reports.find(r => r.id === errorId);
      if (report) {
        // 검증 모달 열기
        await verifyCode(report);
      }
      return;
    }

    // 해결 취소 (미해결로 변경)
    try {
      const response = await fetch(API_ENDPOINTS.toggleResolved(errorId), {
        method: 'PATCH',
      });

      if (response.ok) {
        await fetchData();
        setSelectedIds(prev => prev.filter(id => id !== errorId));
      }
    } catch (error) {
      console.error('Failed to toggle resolved status:', error);
    }
  }, [reports, verifyCode, fetchData]);

  // 전체 선택/해제
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === reports.filter(r => r.resolved === 0).length) {
      // 전체 해제
      setSelectedIds([]);
    } else {
      // 미해결 오류만 전체 선택
      const unresolvedIds = reports.filter(r => r.resolved === 0).map(r => r.id);
      setSelectedIds(unresolvedIds);
    }
  }, [selectedIds.length, reports]);

  // 개별 선택/해제
  const toggleSelectOne = useCallback((errorId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedIds(prev => {
      if (prev.includes(errorId)) {
        return prev.filter(id => id !== errorId);
      } else {
        return [...prev, errorId];
      }
    });
  }, []);

  // 선택된 항목 일괄 검증 (최적화)
  const verifySelected = useCallback(async () => {
    if (selectedIds.length === 0) {
      alert('검증할 오류를 선택해주세요.');
      return;
    }

    setBulkVerifying(true);
    setBulkVerificationResults([]);

    try {
      // 선택된 오류들의 정보 가져오기
      const selectedReports = reports.filter(r => selectedIds.includes(r.id));

      // 모든 선택된 오류를 검증 (병렬 처리)
      const results = await Promise.all(
        selectedReports.map(async (report) => {
          try {
            const response = await fetch(API_ENDPOINTS.verifyCode, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code: report.user_code,
              }),
            });

            const result = await response.json();
            return {
              id: report.id,
              level: report.level,
              activity: report.activity,
              error_message: report.error_message,
              ...result,
            };
          } catch {
            return {
              id: report.id,
              level: report.level,
              activity: report.activity,
              error_message: report.error_message,
              success: false,
              error_occurred: true,
              error_message_new: '검증 실패',
              suggestion: '백엔드 서버를 확인해주세요.',
            };
          }
        })
      );

      setBulkVerificationResults(results);
    } catch (error) {
      console.error('Failed to verify selected errors:', error);
      alert('일괄 검증 중 오류가 발생했습니다.');
      setBulkVerifying(false);
    }
  }, [selectedIds, reports]);

  // 일괄 검증 후 해결 가능한 항목만 해결 (최적화)
  const resolveVerifiedItems = useCallback(async (resolvedIds: number[]) => {
    try {
      await Promise.all(
        resolvedIds.map(id =>
          fetch(API_ENDPOINTS.toggleResolved(id), {
            method: 'PATCH',
          })
        )
      );

      // 데이터 새로고침
      await fetchData();
      // 선택 목록 초기화
      setSelectedIds([]);
      // 모달 닫기
      setBulkVerifying(false);
      setBulkVerificationResults([]);
      alert(`${resolvedIds.length}개의 오류가 해결됨으로 표시되었습니다.`);
    } catch (error) {
      console.error('Failed to resolve verified items:', error);
      alert('해결 처리 중 오류가 발생했습니다.');
    }
  }, [fetchData]);

  // 선택된 항목 일괄 해결
  const resolveSelected = useCallback(async () => {
    if (selectedIds.length === 0) {
      alert('해결할 오류를 선택해주세요.');
      return;
    }

    // 일괄 검증 시작
    await verifySelected();
  }, [selectedIds, verifySelected]);

  return (
    <div className="error-management-page">
      <Header />
      
      <div className="error-management-container">
        <div className="page-header">
          <h1>🐛 오류 관리 대시보드</h1>
          <p>사용자가 보고한 오류를 분석하고 관리합니다</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            📊 통계
          </button>
          <button
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('reports');
              setCurrentPage(1);
            }}
          >
            📋 오류 목록 및 해결 상황
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {activeTab === 'statistics' && statistics && (
              <div className="statistics-section">
                <div className="stats-grid">
                  <div className="stat-card total">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                      <div className="stat-label">전체 오류</div>
                      <div className="stat-value">{statistics.total_errors}</div>
                    </div>
                  </div>

                  <div className="stat-card success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <div className="stat-label">해결된 오류</div>
                      <div className="stat-value">{statistics.resolved_errors}</div>
                    </div>
                  </div>

                  <div className="stat-card warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                      <div className="stat-label">미해결 오류</div>
                      <div className="stat-value">{statistics.unresolved_errors}</div>
                    </div>
                  </div>

                  <div className="stat-card info">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                      <div className="stat-label">영향받은 레벨</div>
                      <div className="stat-value">{statistics.errors_by_level.length}</div>
                    </div>
                  </div>
                </div>

                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>📚 레벨별 오류 분포</h3>
                    <div className="chart-content">
                      {statistics.errors_by_level.map((item) => (
                        <div key={item.level} className="chart-bar">
                          <div className="bar-label">{item.level}</div>
                          <div className="bar-container">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${(item.count / statistics.total_errors) * 100}%`
                              }}
                            ></div>
                          </div>
                          <div className="bar-value">{item.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>🎯 활동별 오류 Top 10</h3>
                    <div className="chart-content">
                      {statistics.errors_by_activity.map((item) => (
                        <div key={item.activity} className="chart-bar">
                          <div className="bar-label">{item.activity}</div>
                          <div className="bar-container">
                            <div
                              className="bar-fill activity"
                              style={{
                                width: `${(item.count / statistics.total_errors) * 100}%`
                              }}
                            ></div>
                          </div>
                          <div className="bar-value">{item.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>⚠️ 자주 발생하는 오류 Top 5</h3>
                    <div className="error-list">
                      {statistics.common_errors.map((item, index) => (
                        <div key={index} className="error-item">
                          <div className="error-rank">{index + 1}</div>
                          <div className="error-content">
                            <div className="error-text">{truncateMessage(item.error_message, 150)}</div>
                            <div className="error-count">{item.count}회 발생</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="reports-section">
                <div className="reports-header">
                  <h2>오류 목록 (전체 {totalReports}개)</h2>
                  <div className="reports-controls">
                    <div className="filter-buttons">
                      <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterStatus('all');
                          setCurrentPage(1);
                          setSelectedIds([]);
                        }}
                      >
                        전체 보기
                        {statistics && (
                          <span className="filter-badge">{statistics.total_errors}</span>
                        )}
                      </button>
                      <button
                        className={`filter-btn ${filterStatus === 'unresolved' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterStatus('unresolved');
                          setCurrentPage(1);
                          setSelectedIds([]);
                        }}
                      >
                        미해결
                        {statistics && (
                          <span className="filter-badge unresolved">{statistics.unresolved_errors}</span>
                        )}
                      </button>
                      <button
                        className={`filter-btn ${filterStatus === 'resolved' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterStatus('resolved');
                          setCurrentPage(1);
                          setSelectedIds([]);
                        }}
                      >
                        해결됨
                        {statistics && (
                          <span className="filter-badge resolved">{statistics.resolved_errors}</span>
                        )}
                      </button>
                    </div>
                    <button className="refresh-button" onClick={fetchData}>
                      🔄 새로고침
                    </button>
                  </div>
                </div>

                {filterStatus === 'unresolved' && reports.filter(r => r.resolved === 0).length > 0 && (
                  <div className="bulk-actions">
                    <label className="select-all-label">
                      <input
                        type="checkbox"
                        className="select-all-checkbox"
                        checked={selectedIds.length === reports.filter(r => r.resolved === 0).length && reports.filter(r => r.resolved === 0).length > 0}
                        onChange={toggleSelectAll}
                      />
                      <span>전체 선택 ({selectedIds.length}/{reports.filter(r => r.resolved === 0).length})</span>
                    </label>
                    {selectedIds.length > 0 && (
                      <button className="bulk-resolve-button" onClick={resolveSelected}>
                        ✅ 선택한 {selectedIds.length}개 해결하기
                      </button>
                    )}
                  </div>
                )}

                <div className="reports-grid">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className={`report-card ${report.resolved ? 'resolved' : ''} ${selectedIds.includes(report.id) ? 'selected' : ''}`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="report-header">
                        <div className="report-header-left">
                          {filterStatus === 'unresolved' && report.resolved === 0 ? (
                            <input
                              type="checkbox"
                              className="select-checkbox"
                              checked={selectedIds.includes(report.id)}
                              onChange={(e) => toggleSelectOne(report.id, e.nativeEvent as unknown as React.MouseEvent)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <input
                              type="checkbox"
                              className="resolve-checkbox"
                              checked={report.resolved === 1}
                              onChange={(e) => toggleResolved(report.id, e.nativeEvent as unknown as React.MouseEvent, report.resolved)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <span className="report-id">#{report.id}</span>
                        </div>
                        <span className="report-level">{report.level}</span>
                      </div>
                      <div className="report-activity">{report.activity}</div>
                      <div className="report-error">{truncateMessage(report.error_message)}</div>
                      <div className="report-footer">
                        <div className="report-times">
                          <div className="report-time">
                            <span className="time-label">보고:</span>
                            <span>{formatDate(report.created_at)}</span>
                          </div>
                          {report.resolved === 1 && report.resolved_at && (
                            <div className="report-time resolved-time">
                              <span className="time-label">해결:</span>
                              <span>{formatDate(report.resolved_at)}</span>
                            </div>
                          )}
                        </div>
                        {report.resolved === 1 && (
                          <span className="resolved-badge">✅ 해결됨</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {reports.length === 0 && (
                  <div className="empty-state">
                    <p>📭 {filterStatus === 'all' ? '아직 보고된 오류가 없습니다.' :
                        filterStatus === 'resolved' ? '해결된 오류가 없습니다.' :
                        '미해결 오류가 없습니다.'}</p>
                  </div>
                )}

                {reports.length > 0 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ⬅️ 이전
                    </button>

                    <div className="pagination-info">
                      <span className="page-numbers">
                        {Array.from({ length: Math.ceil(totalReports / itemsPerPage) }, (_, i) => i + 1)
                          .filter(page => {
                            const totalPages = Math.ceil(totalReports / itemsPerPage);
                            if (totalPages <= 7) return true;
                            if (page === 1 || page === totalPages) return true;
                            if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                            return false;
                          })
                          .map((page, index, array) => (
                            <span key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && <span className="ellipsis">...</span>}
                              <button
                                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            </span>
                          ))}
                      </span>
                      
                    </div>

                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(totalReports / itemsPerPage)}
                    >
                      다음 ➡️
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {selectedReport && (
          <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>오류 상세 정보</h2>
                <button className="close-button" onClick={() => setSelectedReport(null)}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-section">
                  <h3>📍 발생 위치</h3>
                  <p><strong>Level:</strong> {selectedReport.level}</p>
                  <p><strong>Activity:</strong> {selectedReport.activity}</p>
                </div>

                <div className="detail-section">
                  <h3>❌ 오류 메시지</h3>
                  <div className="error-message-box">{selectedReport.error_message}</div>
                </div>

                <div className="detail-section">
                  <h3>💻 사용자 코드</h3>
                  <pre className="code-box">{selectedReport.user_code}</pre>
                </div>

                <div className="detail-section">
                  <h3>🕐 발생 시간</h3>
                  <p>{formatDate(selectedReport.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 검증 모달 */}
        {verifyingReport && (
          <div className="modal-overlay" onClick={() => {
            setVerifyingReport(null);
            setVerificationResult(null);
          }}>
            <div className="modal-content verification-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🔍 오류 검증</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setVerifyingReport(null);
                    setVerificationResult(null);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-section">
                  <h3>📍 오류 정보</h3>
                  <p><strong>ID:</strong> #{verifyingReport.id}</p>
                  <p><strong>Level:</strong> {verifyingReport.level}</p>
                  <p><strong>Activity:</strong> {verifyingReport.activity}</p>
                </div>

                <div className="detail-section">
                  <h3>💻 코드 실행 결과</h3>
                  {isVerifying ? (
                    <div className="verification-loading">
                      <span className="spinner"></span>
                      <p>코드를 실행하여 오류를 검증하는 중...</p>
                    </div>
                  ) : verificationResult ? (
                    <div className="verification-result">
                      {verificationResult.error_occurred ? (
                        <>
                          <div className="result-status error">
                            ❌ 오류가 여전히 발생합니다
                          </div>
                          <div className="error-message-box">
                            <strong>오류 메시지:</strong><br />
                            {verificationResult.error_message}
                          </div>
                          <div className="suggestion-box">
                            <strong>💡 해결 방법:</strong><br />
                            {verificationResult.suggestion}
                          </div>
                          <div className="verification-actions">
                            <button
                              className="btn-cancel"
                              onClick={() => {
                                setVerifyingReport(null);
                                setVerificationResult(null);
                              }}
                            >
                              취소
                            </button>
                            <button
                              className="btn-resolve-anyway"
                              onClick={() => {
                                if (window.confirm('오류가 여전히 발생하지만 해결됨으로 표시하시겠습니까?')) {
                                  resolveAfterVerification(verifyingReport.id);
                                }
                              }}
                            >
                              그래도 해결됨으로 표시
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="result-status success">
                            ✅ 코드가 정상적으로 실행되었습니다!
                          </div>
                          <div className="success-box">
                            {verificationResult.suggestion}
                          </div>
                          {verificationResult.output && (
                            <div className="output-box">
                              <strong>출력:</strong><br />
                              <pre>{verificationResult.output}</pre>
                            </div>
                          )}
                          <div className="verification-actions">
                            <button
                              className="btn-cancel"
                              onClick={() => {
                                setVerifyingReport(null);
                                setVerificationResult(null);
                              }}
                            >
                              취소
                            </button>
                            <button
                              className="btn-resolve"
                              onClick={() => resolveAfterVerification(verifyingReport.id)}
                            >
                              ✅ 해결됨으로 표시
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 일괄 검증 모달 */}
        {bulkVerificationResults.length > 0 && (
          <div className="modal-overlay" onClick={() => {
            setBulkVerifying(false);
            setBulkVerificationResults([]);
          }}>
            <div className="modal-content bulk-verification-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🔍 일괄 검증 결과</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setBulkVerifying(false);
                    setBulkVerificationResults([]);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="bulk-verification-summary">
                  <div className="summary-item success">
                    <span className="summary-label">✅ 해결됨</span>
                    <span className="summary-count">
                      {bulkVerificationResults.filter(r => !r.error_occurred).length}
                    </span>
                  </div>
                  <div className="summary-item error">
                    <span className="summary-label">❌ 여전히 오류</span>
                    <span className="summary-count">
                      {bulkVerificationResults.filter(r => r.error_occurred).length}
                    </span>
                  </div>
                </div>

                <div className="bulk-verification-list">
                  {bulkVerificationResults.map((result, index) => (
                    <div
                      key={result.id}
                      className={`bulk-verification-item ${result.error_occurred ? 'error' : 'success'}`}
                    >
                      <div className="item-header">
                        <span className="item-number">#{index + 1}</span>
                        <span className="item-location">
                          Level {result.level} - Activity {result.activity}
                        </span>
                        <span className={`item-status ${result.error_occurred ? 'error' : 'success'}`}>
                          {result.error_occurred ? '❌ 오류 발생' : '✅ 정상'}
                        </span>
                      </div>
                      <div className="item-body">
                        {result.error_occurred ? (
                          <>
                            <div className="item-error">
                              <strong>오류:</strong> {result.error_message_new || result.error_message}
                            </div>
                            <div className="item-suggestion">
                              {result.suggestion}
                            </div>
                          </>
                        ) : (
                          <div className="item-success">
                            {result.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bulk-verification-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setBulkVerifying(false);
                      setBulkVerificationResults([]);
                    }}
                  >
                    취소
                  </button>
                  <button
                    className="btn-resolve-partial"
                    onClick={() => {
                      const resolvedIds = bulkVerificationResults
                        .filter(r => !r.error_occurred)
                        .map(r => r.id);
                      if (resolvedIds.length === 0) {
                        alert('해결된 오류가 없습니다.');
                        return;
                      }
                      if (window.confirm(`정상 실행된 ${resolvedIds.length}개의 오류를 해결됨으로 표시하시겠습니까?`)) {
                        resolveVerifiedItems(resolvedIds);
                      }
                    }}
                    disabled={bulkVerificationResults.filter(r => !r.error_occurred).length === 0}
                  >
                    ✅ 정상 실행된 {bulkVerificationResults.filter(r => !r.error_occurred).length}개 해결하기
                  </button>
                  <button
                    className="btn-resolve-all"
                    onClick={() => {
                      const allIds = bulkVerificationResults.map(r => r.id);
                      if (window.confirm(`모든 ${allIds.length}개의 오류를 해결됨으로 표시하시겠습니까?`)) {
                        resolveVerifiedItems(allIds);
                      }
                    }}
                  >
                    전체 {bulkVerificationResults.length}개 해결하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
