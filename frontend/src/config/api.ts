// API 설정
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

  // 오류 보고
  sendErrorReport: `${API_BASE_URL}/api/error-report`,

  // 검색
  search: `${API_BASE_URL}/api/search`,
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

