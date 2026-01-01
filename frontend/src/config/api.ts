// API 설정
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// API 엔드포인트
export const API_ENDPOINTS = {
  // 오류 관리
  errorReports: `${API_BASE_URL}/api/error-reports`,
  errorStatistics: `${API_BASE_URL}/api/error-reports/statistics`,
  errorReport: (id: number) => `${API_BASE_URL}/api/error-reports/${id}`,
  toggleResolved: (id: number) => `${API_BASE_URL}/api/error-reports/${id}/toggle-resolved`,
  verifyCode: `${API_BASE_URL}/api/verify-code`,

  // Turtle
  turtleExecute: `${API_BASE_URL}/api/turtle/execute`,

  // Pygame
  pygameExecute: `${API_BASE_URL}/api/pygame/execute`,
  pygameCreateSession: `${API_BASE_URL}/api/pygame/create-session`,
  pygameToHtml: `${API_BASE_URL}/api/pygame/to-html`,

  // 오류 보고
  sendErrorReport: `${API_BASE_URL}/api/error-report`,

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

