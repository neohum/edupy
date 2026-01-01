import { API_ENDPOINTS } from '../config/api';

// 세션 ID 생성 및 조회
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem('edupy_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('edupy_session_id', sessionId);
  }
  return sessionId;
}

// 기기 정보 감지
export function getDeviceInfo(): {
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
} {
  const userAgent = navigator.userAgent;

  // 기기 유형 감지
  let deviceType = 'Desktop';
  if (/Mobi|Android/i.test(userAgent)) {
    deviceType = 'Mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = 'Tablet';
  }

  // 브라우저 감지
  let browser = 'Unknown';
  if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }

  // OS 감지
  let os = 'Unknown';
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  return {
    userAgent,
    deviceType,
    browser,
    os,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  };
}

// 세션 시작 추적
export async function trackSessionStart(): Promise<void> {
  const sessionId = getSessionId();
  const deviceInfo = getDeviceInfo();

  try {
    await fetch(API_ENDPOINTS.analyticsSession, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        user_agent: deviceInfo.userAgent,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        screen_width: deviceInfo.screenWidth,
        screen_height: deviceInfo.screenHeight,
      }),
    });
  } catch (error) {
    console.error('Failed to track session start:', error);
  }
}

// 페이지 조회 추적
let pageViewStartTime = Date.now();

export async function trackPageView(pagePath: string, pageTitle: string): Promise<void> {
  const sessionId = getSessionId();
  pageViewStartTime = Date.now();

  try {
    await fetch(API_ENDPOINTS.analyticsPageView, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        page_path: pagePath,
        page_title: pageTitle,
        referrer: document.referrer,
      }),
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

// 페이지 이탈 추적 (체류 시간)
export function trackPageLeave(pagePath: string): void {
  const sessionId = getSessionId();
  const durationSeconds = Math.floor((Date.now() - pageViewStartTime) / 1000);

  // sendBeacon 사용 (페이지 이탈 시에도 전송 보장)
  const data = JSON.stringify({
    session_id: sessionId,
    page_path: pagePath,
    duration_seconds: durationSeconds,
  });

  navigator.sendBeacon(API_ENDPOINTS.analyticsPageLeave, new Blob([data], { type: 'application/json' }));
}

// 코드 실행 추적
export async function trackCodeExecution(
  pagePath: string,
  executionResult: 'success' | 'error',
  options?: {
    curriculumType?: string;
    levelName?: string;
    activityName?: string;
    errorMessage?: string;
    executionTimeMs?: number;
  }
): Promise<void> {
  const sessionId = getSessionId();

  try {
    await fetch(API_ENDPOINTS.analyticsCodeExecution, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        page_path: pagePath,
        curriculum_type: options?.curriculumType,
        level_name: options?.levelName,
        activity_name: options?.activityName,
        execution_result: executionResult,
        error_message: options?.errorMessage,
        execution_time_ms: options?.executionTimeMs || 0,
      }),
    });
  } catch (error) {
    console.error('Failed to track code execution:', error);
  }
}

// 학습 진도 추적
export async function trackLearningProgress(
  curriculumType: string,
  levelIndex: number,
  activityIndex: number,
  totalActivities: number,
  completedCount: number,
  completionPercentage: number
): Promise<void> {
  const sessionId = getSessionId();

  try {
    await fetch(API_ENDPOINTS.analyticsProgress, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        curriculum_type: curriculumType,
        level_index: levelIndex,
        activity_index: activityIndex,
        total_activities: totalActivities,
        completed_count: completedCount,
        completion_percentage: completionPercentage,
      }),
    });
  } catch (error) {
    console.error('Failed to track learning progress:', error);
  }
}

// 세션 종료 추적 (beforeunload 이벤트에 사용)
export function setupSessionTracking(): void {
  // 세션 시작
  trackSessionStart();

  // 페이지 이탈/종료 시 세션 종료 전송
  window.addEventListener('beforeunload', () => {
    const sessionId = getSessionId();
    navigator.sendBeacon(
      `${API_ENDPOINTS.analyticsSessionEnd}?session_id=${sessionId}`,
      ''
    );
  });
}
