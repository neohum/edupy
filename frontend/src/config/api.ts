// API 설정
// Production: 빈 문자열 (상대 경로 사용, nginx가 /api를 프록시)
// Development: localhost:8000
const isDev = import.meta.env.DEV;
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:8000' : '');
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || (isDev ? 'ws://localhost:8000' : `wss://${window.location.host}`);

// API 엔드포인트
export const API_ENDPOINTS = {
  // 오류 관리
  errorReports: `${API_BASE_URL}/api/error-reports`,
  errorStatistics: `${API_BASE_URL}/api/error-reports/statistics`,
  errorReport: (id: number) => `${API_BASE_URL}/api/error-reports/${id}`,
  toggleResolved: (id: number) => `${API_BASE_URL}/api/error-reports/${id}/toggle-resolved`,
  verifyCode: `${API_BASE_URL}/api/verify-code`,

  // 서버
  serverStatus: `${API_BASE_URL}/`,

  // Python
  pythonExecute: `${API_BASE_URL}/api/python/execute`,

  // Turtle
  turtleExecute: `${API_BASE_URL}/api/turtle/execute`,

  // Pygame
  pygameExecute: `${API_BASE_URL}/api/pygame/execute`,
  pygameCreateSession: `${API_BASE_URL}/api/pygame/create-session`,
  pygameToHtml: `${API_BASE_URL}/api/pygame/to-html`,

  // 오류 보고
  sendErrorReport: `${API_BASE_URL}/api/error-report`,
  submitError: `${API_BASE_URL}/api/errors/report`,
  checkDuplicate: `${API_BASE_URL}/api/errors/check-duplicate`,

  // 오류 관리 (관리자)
  errors: `${API_BASE_URL}/api/errors`,
  errorsStatistics: `${API_BASE_URL}/api/errors/statistics`,
  errorToggle: (id: number) => `${API_BASE_URL}/api/errors/${id}/toggle`,
  errorsBatchTest: `${API_BASE_URL}/api/errors/batch-test`,

  // 관리자 인증
  adminLogin: `${API_BASE_URL}/api/admin/login`,
  adminVerify: `${API_BASE_URL}/api/admin/verify`,

  // 검색
  search: `${API_BASE_URL}/api/search`,

  // Analytics - 추적
  analyticsSession: `${API_BASE_URL}/api/analytics/session`,
  analyticsSessionEnd: `${API_BASE_URL}/api/analytics/session-end`,
  analyticsPageView: `${API_BASE_URL}/api/analytics/page-view`,
  analyticsPageLeave: `${API_BASE_URL}/api/analytics/page-leave`,
  analyticsCodeExecution: `${API_BASE_URL}/api/analytics/code-execution`,
  analyticsProgress: `${API_BASE_URL}/api/analytics/progress`,

  // Analytics - 조회 (관리자)
  analyticsOverview: `${API_BASE_URL}/api/analytics/overview`,
  analyticsDailyVisitors: `${API_BASE_URL}/api/analytics/daily-visitors`,
  analyticsPageViews: `${API_BASE_URL}/api/analytics/page-views`,
  analyticsDevices: `${API_BASE_URL}/api/analytics/devices`,
  analyticsCodeStats: `${API_BASE_URL}/api/analytics/code-stats`,
  analyticsRecentActivity: `${API_BASE_URL}/api/analytics/recent-activity`,
  analyticsHourlyActivity: `${API_BASE_URL}/api/analytics/hourly-activity`,
};

// WebSocket 엔드포인트
export const WS_ENDPOINTS = {
  pygameStream: (sessionId: string) => `${WS_BASE_URL}/ws/pygame/${sessionId}`,
};

// API 헬퍼 함수
export async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

