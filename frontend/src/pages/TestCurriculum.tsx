import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { pythonCurriculum } from '../data/pythonCurriculum';
import { pygameCurriculum } from '../data/pygameCurriculum';
import { pygameGamesCurriculum } from '../data/pygameGamesCurriculum';
import type { GameLevel } from '../data/pygameGamesCurriculum';
import { allDataCurriculums } from '../data/dataAnalysisCurriculum';
import { allAICurriculums } from '../data/aiCodingCurriculum';
import { usePyodide, wrapUserCode, loadRequiredPackages } from '../hooks/usePyodide';
import LearningMenuDropdown from '../components/LearningMenuDropdown';
import { API_ENDPOINTS } from '../config/api';
import './TestCurriculum.css';

// 커리큘럼 타입 정의
interface CurriculumConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  shadowColor: string;
  getData: () => { levels: any[] } | GameLevel[];
  isGameCurriculum?: boolean;
}

// 모든 커리큘럼 동적 정의
const ALL_CURRICULUMS: CurriculumConfig[] = [
  {
    id: 'python',
    name: '파이썬 기초 문법',
    icon: 'fi-rr-code-simple',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    shadowColor: 'rgba(102, 126, 234, 0.4)',
    getData: () => pythonCurriculum,
  },
  {
    id: 'pygame',
    name: '파이게임 기초 문법',
    icon: 'fi-rr-book-alt',
    color: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    shadowColor: 'rgba(72, 187, 120, 0.4)',
    getData: () => pygameCurriculum,
  },
  {
    id: 'pygame-games',
    name: '파이게임 만들기',
    icon: 'fi-rr-gamepad',
    color: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
    shadowColor: 'rgba(237, 137, 54, 0.4)',
    getData: () => ({ levels: pygameGamesCurriculum }),
    isGameCurriculum: true,
  },
  // 데이터 분석과 시각화 커리큘럼들
  ...allDataCurriculums.map((curriculum) => ({
    id: curriculum.id,
    name: `데이터 분석 - ${curriculum.gradeLevelKorean}`,
    icon: 'fi-rr-chart-histogram',
    color: curriculum.color,
    shadowColor: 'rgba(56, 178, 172, 0.4)',
    getData: () => curriculum,
  })),
  // AI 코딩 커리큘럼들
  ...allAICurriculums.map((curriculum) => ({
    id: curriculum.id,
    name: `AI 코딩 - ${curriculum.gradeLevelKorean}`,
    icon: 'fi-rr-robot',
    color: curriculum.color,
    shadowColor: 'rgba(159, 122, 234, 0.4)',
    getData: () => curriculum,
  })),
];

interface TestResult {
  id: string;
  title: string;
  code: string;
  output: string;
  error: string | null;
  hasInput: boolean;
  testInputs?: string[];
}

interface APITestResult {
  name: string;
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  responseTime: number;
  message: string;
}

interface HTMLTestResult {
  id: string;
  title: string;
  status: 'success' | 'error';
  message: string;
  htmlSize?: number;
}

// Python 구문 강조 함수
const highlightPythonCode = (code: string): JSX.Element[] => {
  const lines = code.split('\n');

  return lines.map((line, lineIndex) => {
    const tokens: JSX.Element[] = [];
    let remaining = line;
    let tokenIndex = 0;

    while (remaining.length > 0) {
      let matched = false;

      // 주석 (# ...)
      const commentMatch = remaining.match(/^(#.*)$/);
      if (commentMatch) {
        tokens.push(<span key={tokenIndex++} className="token-comment">{commentMatch[1]}</span>);
        remaining = '';
        matched = true;
      }

      // 삼중 따옴표 문자열 ("""...""" 또는 '''...''')
      if (!matched) {
        const tripleStringMatch = remaining.match(/^("""[\s\S]*?"""|'''[\s\S]*?''')/);
        if (tripleStringMatch) {
          tokens.push(<span key={tokenIndex++} className="token-string">{tripleStringMatch[1]}</span>);
          remaining = remaining.slice(tripleStringMatch[1].length);
          matched = true;
        }
      }

      // 문자열 ("..." 또는 '...')
      if (!matched) {
        const stringMatch = remaining.match(/^(f?r?["'](?:[^"'\\]|\\.)*["'])/);
        if (stringMatch) {
          tokens.push(<span key={tokenIndex++} className="token-string">{stringMatch[1]}</span>);
          remaining = remaining.slice(stringMatch[1].length);
          matched = true;
        }
      }

      // 키워드
      if (!matched) {
        const keywordMatch = remaining.match(/^(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|raise|break|continue|pass|lambda|and|or|not|in|is|None|True|False|global|nonlocal|assert|async|await)\b/);
        if (keywordMatch) {
          tokens.push(<span key={tokenIndex++} className="token-keyword">{keywordMatch[1]}</span>);
          remaining = remaining.slice(keywordMatch[1].length);
          matched = true;
        }
      }

      // 내장 함수
      if (!matched) {
        const builtinMatch = remaining.match(/^(print|input|range|len|int|float|str|list|dict|tuple|set|bool|type|abs|max|min|sum|sorted|reversed|enumerate|zip|map|filter|open|format|round|pow|chr|ord|hex|bin|oct|id|hash|help|dir|vars|globals|locals|callable|isinstance|issubclass|hasattr|getattr|setattr|delattr|super|next|iter|slice|object|staticmethod|classmethod|property)\b/);
        if (builtinMatch) {
          tokens.push(<span key={tokenIndex++} className="token-builtin">{builtinMatch[1]}</span>);
          remaining = remaining.slice(builtinMatch[1].length);
          matched = true;
        }
      }

      // pygame/turtle 모듈 함수
      if (!matched) {
        const moduleMatch = remaining.match(/^(pygame|turtle|random|math|time|datetime|os|sys|json|re|numpy|pandas|matplotlib|plt)\b/);
        if (moduleMatch) {
          tokens.push(<span key={tokenIndex++} className="token-module">{moduleMatch[1]}</span>);
          remaining = remaining.slice(moduleMatch[1].length);
          matched = true;
        }
      }

      // self 키워드
      if (!matched) {
        const selfMatch = remaining.match(/^(self)\b/);
        if (selfMatch) {
          tokens.push(<span key={tokenIndex++} className="token-self">{selfMatch[1]}</span>);
          remaining = remaining.slice(selfMatch[1].length);
          matched = true;
        }
      }

      // 숫자
      if (!matched) {
        const numberMatch = remaining.match(/^(\d+\.?\d*|\.\d+)/);
        if (numberMatch) {
          tokens.push(<span key={tokenIndex++} className="token-number">{numberMatch[1]}</span>);
          remaining = remaining.slice(numberMatch[1].length);
          matched = true;
        }
      }

      // 함수 호출 (함수명 뒤에 괄호)
      if (!matched) {
        const funcMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(\s*\()/);
        if (funcMatch) {
          tokens.push(<span key={tokenIndex++} className="token-function">{funcMatch[1]}</span>);
          tokens.push(<span key={tokenIndex++}>{funcMatch[2]}</span>);
          remaining = remaining.slice(funcMatch[0].length);
          matched = true;
        }
      }

      // 데코레이터
      if (!matched) {
        const decoratorMatch = remaining.match(/^(@[a-zA-Z_][a-zA-Z0-9_]*)/);
        if (decoratorMatch) {
          tokens.push(<span key={tokenIndex++} className="token-decorator">{decoratorMatch[1]}</span>);
          remaining = remaining.slice(decoratorMatch[1].length);
          matched = true;
        }
      }

      // 연산자
      if (!matched) {
        const operatorMatch = remaining.match(/^(\+\+|--|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|^~])/);
        if (operatorMatch) {
          tokens.push(<span key={tokenIndex++} className="token-operator">{operatorMatch[1]}</span>);
          remaining = remaining.slice(operatorMatch[1].length);
          matched = true;
        }
      }

      // 괄호, 콜론 등
      if (!matched) {
        const punctMatch = remaining.match(/^([()[\]{}:,.])/);
        if (punctMatch) {
          tokens.push(<span key={tokenIndex++} className="token-punctuation">{punctMatch[1]}</span>);
          remaining = remaining.slice(punctMatch[1].length);
          matched = true;
        }
      }

      // 일반 텍스트 (한 문자씩)
      if (!matched) {
        tokens.push(<span key={tokenIndex++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    }

    return (
      <div key={lineIndex} className="code-line">
        <span className="line-number">{lineIndex + 1}</span>
        <span className="line-content">{tokens}</span>
      </div>
    );
  });
};

// 각 활동에 대한 테스트 입력값 정의
const testInputs: { [key: string]: string[] } = {
  // ===== 파이썬 기초 문법 =====
  // Level 3: 입력과 형변환
  '3-1': ['김파이'],
  '3-2': ['10'],
  '3-3': ['5', '3'],
  '3-4': ['80', '90', '85'],
  '3-5': ['125'],

  // Level 4: 조건문
  '4-1': ['15'],
  '4-2': ['7'],
  '4-3': ['85'],
  '4-4': ['y'],
  '4-5': ['수학'],

  // Level 5: 조건문 심화
  '5-1': ['85'],
  '5-2': ['150', '12'],
  '5-3': ['80', 'y'],
  '5-4': ['4'],
  '5-5': ['7'],

  // Level 6: 반복문
  '6-4': ['5'],
  '6-5': ['3'],

  // Level 7: 반복문 심화
  '7-1': ['10'],
  '7-2': ['5', '3', '0'],
  '7-3': ['3', '4'],
  '7-4': ['5'],
  '7-5': ['4'],

  // Level 8: 리스트와 딕셔너리
  // (input 없음)

  // Level 9: 랜덤과 모듈
  // 9-1은 while True 무한 루프이므로 테스트 제외
  '9-2': ['25', '30', '28', '26', '27'], // 최대 5번 시도
  '9-3': ['가위'],
  '9-5': ['김코딩'],

  // Level 10: Turtle 그래픽
  // turtle 모듈은 Pyodide에서 지원하지 않으므로 테스트 제외

  // ===== 파이게임 기초 문법 =====
  // Level 1: 출력과 입력
  '1-1': ['용사'],
  '1-4': ['김파이'],
  '1-5': ['보통'],
};

// 테스트를 건너뛸 활동 목록 (무한 루프 + pygame 실제 코드)
const skipTests: string[] = [
  // 파이썬 기초 문법
  '9-1', // while True 무한 루프 (숫자 맞추기 - 정답을 맞출 때까지)
  '7-2', // while True 무한 루프 (0이 나올 때까지)

  // 파이게임 - Level 11 (실제 pygame 코드)
  '11-1', // 기본 파이게임 루프
  '11-2', // 키보드로 원 이동
  '11-3', // 화면 가장자리에서 튕기기
  '11-4', // 여러 적 그리기
  '11-5', // 점수 텍스트 표시
];

interface TestCurriculumProps {
  hideHeader?: boolean;
}

export default function TestCurriculum({ hideHeader = false }: TestCurriculumProps) {
  const { pyodide, isReady, isLoading } = usePyodide();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('python');
  const [selectedTestType, setSelectedTestType] = useState<'curriculum' | 'api' | 'html'>('curriculum');
  const [apiResults, setApiResults] = useState<APITestResult[]>([]);
  const [htmlResults, setHtmlResults] = useState<HTMLTestResult[]>([]);
  const [testAllMode, setTestAllMode] = useState(false);
  const [filterCurriculumId, setFilterCurriculumId] = useState<string | null>(null);

  // 현재 선택된 커리큘럼 설정 가져오기
  const selectedCurriculum = ALL_CURRICULUMS.find(c => c.id === selectedCurriculumId) || ALL_CURRICULUMS[0];

  useEffect(() => {
    if (isReady && pyodide) {
      // 기본 print 오버라이드만 설정
      pyodide.runPython(`
import builtins

# print 오버라이드
def custom_print(*args, sep=' ', end='\\n', **kwargs):
    output = sep.join(str(arg) for arg in args)
    if 'js_print' in globals():
        js_print(output)

builtins.print = custom_print
      `);
    }
  }, [isReady, pyodide]);

  // 단일 커리큘럼 테스트 실행
  const runCurriculumTest = async (curriculumConfig: CurriculumConfig, allActivities: TestResult[], startIndex: number): Promise<number> => {
    const curriculumData = curriculumConfig.getData();
    const levels = 'levels' in curriculumData ? curriculumData.levels : curriculumData;
    let testIndex = startIndex;

    for (const level of levels) {
      for (const activity of level.activities) {
        testIndex++;
        setCurrentTest(testIndex);

        // 코드 가져오기 (starterCode 또는 exampleCode)
        const code = activity.starterCode || activity.exampleCode || '';
        const hasInput = code.includes('input(');
        let output = '';
        let error = null;
        const inputs = testInputs[activity.id] || [];

        // 테스트 건너뛰기 목록에 있는 경우
        if (skipTests.includes(activity.id)) {
          allActivities.push({
            id: `[${curriculumConfig.icon}] ${activity.id}`,
            title: activity.title,
            code,
            output: '[SKIP] 무한 루프 게임이므로 자동 테스트를 건너뜁니다.',
            error: null,
            hasInput,
            testInputs: inputs
          });
          setResults([...allActivities]);
          await new Promise(resolve => setTimeout(resolve, 10));
          continue;
        }

        // Turtle 모듈 테스트
        const isTurtleCode = code.includes('import turtle') || code.includes('from turtle');
        if (isTurtleCode) {
          try {
            const response = await fetch('http://localhost:8000/api/turtle/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, width: 600, height: 600, animate: false }),
            });
            const result = await response.json();
            if (result.success) {
              output = '[TURTLE] Turtle 그래픽 실행 성공!';
            } else {
              error = result.error || 'Turtle 실행 실패';
            }
          } catch (err: any) {
            error = `백엔드 연결 실패: ${err.message}`;
          }
          allActivities.push({
            id: `[${curriculumConfig.icon}] ${activity.id}`,
            title: activity.title,
            code, output, error,
            hasInput: false, testInputs: []
          });
          setResults([...allActivities]);
          await new Promise(resolve => setTimeout(resolve, 10));
          continue;
        }

        // Pygame 모듈 테스트
        const isPygameCode = code.includes('import pygame') || code.includes('from pygame');
        if (isPygameCode) {
          try {
            // 파이게임 만들기 커리큘럼은 HTML 변환 테스트
            if (curriculumConfig.isGameCurriculum) {
              const response = await fetch(API_ENDPOINTS.pygameToHtml, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, width: 600, height: 400 }),
              });
              const result = await response.json();
              if (result.success && result.html) {
                output = `[PYGAME] HTML 변환 성공! (${(result.html.length / 1024).toFixed(1)}KB)`;
              } else {
                error = result.error || 'HTML 변환 실패';
              }
            } else {
              const response = await fetch('http://localhost:8000/api/pygame/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, width: 600, height: 400, max_frames: 60 }),
              });
              const result = await response.json();
              if (result.success) {
                output = '[PYGAME] Pygame 실행 성공!';
                if (result.output) output += '\n' + result.output;
              } else {
                error = result.error || 'Pygame 실행 실패';
              }
            }
          } catch (err: any) {
            error = `백엔드 연결 실패: ${err.message}`;
          }
          allActivities.push({
            id: `[${curriculumConfig.icon}] ${activity.id}`,
            title: activity.title,
            code, output, error,
            hasInput: false, testInputs: []
          });
          setResults([...allActivities]);
          await new Promise(resolve => setTimeout(resolve, 10));
          continue;
        }

        // 일반 Python 코드 테스트
        try {
          // 코드에 필요한 패키지 로드
          await loadRequiredPackages(pyodide, code);

          const outputs: string[] = [];
          pyodide!.globals.set('js_print', (...args: any[]) => outputs.push(args.join(' ')));
          let inputIndex = 0;
          pyodide!.globals.set('js_input', async (_prompt: string) => {
            if (inputIndex >= inputs.length) {
              outputs.push(`[입력 부족 - 기본값: 0]`);
              inputIndex++;
              return '0';
            }
            const value = inputs[inputIndex++];
            outputs.push(`[입력: ${value}]`);
            return value;
          });
          const wrappedCode = wrapUserCode(code);
          await pyodide!.runPythonAsync(wrappedCode);
          output = outputs.join('\n');
        } catch (err: any) {
          error = err.message || String(err);
        }

        allActivities.push({
          id: `[${curriculumConfig.icon}] ${activity.id}`,
          title: activity.title,
          code, output, error,
          hasInput, testInputs: inputs
        });
        setResults([...allActivities]);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    return testIndex;
  };

  const runAllTests = async () => {
    if (!pyodide || !isReady) {
      toast.warning('Pyodide가 아직 준비되지 않았습니다.');
      return;
    }

    setTesting(true);
    setResults([]);

    const allActivities: TestResult[] = [];

    // 전체 테스트 모드
    if (testAllMode) {
      let totalCount = 0;
      for (const curriculum of ALL_CURRICULUMS) {
        const data = curriculum.getData();
        const levels = 'levels' in data ? data.levels : data;
        totalCount += levels.reduce((sum: number, l: any) => sum + l.activities.length, 0);
      }
      setTotalTests(totalCount);

      let currentIndex = 0;
      for (const curriculum of ALL_CURRICULUMS) {
        currentIndex = await runCurriculumTest(curriculum, allActivities, currentIndex);
      }
    } else {
      // 단일 커리큘럼 테스트
      const curriculumData = selectedCurriculum.getData();
      const levels = 'levels' in curriculumData ? curriculumData.levels : curriculumData;
      const totalCount = levels.reduce((sum: number, l: any) => sum + l.activities.length, 0);
      setTotalTests(totalCount);

      await runCurriculumTest(selectedCurriculum, allActivities, 0);
    }

    setTesting(false);
    setCurrentTest(0);
  };

  // API 엔드포인트 테스트
  const runAPITests = async () => {
    setTesting(true);
    setApiResults([]);

    const apiTests = [
      { name: '서버 상태 확인', endpoint: 'http://localhost:8000/', method: 'GET' },
      { name: 'Python 실행 API', endpoint: 'http://localhost:8000/api/python/execute', method: 'POST', body: { code: 'print("Hello")' } },
      { name: 'Turtle 실행 API', endpoint: 'http://localhost:8000/api/turtle/execute', method: 'POST', body: { code: 'import turtle\nt = turtle.Turtle()\nt.forward(100)', width: 400, height: 400 } },
      { name: 'Pygame 실행 API', endpoint: 'http://localhost:8000/api/pygame/execute', method: 'POST', body: { code: 'import pygame\npygame.init()\nscreen = pygame.display.set_mode((100,100))\nscreen.fill((255,255,255))\npygame.quit()', width: 100, height: 100, max_frames: 1 } },
      { name: 'Pygame HTML 변환 API', endpoint: API_ENDPOINTS.pygameToHtml, method: 'POST', body: { code: 'import pygame\npygame.init()\nscreen = pygame.display.set_mode((100,100))\nscreen.fill((255,255,255))', width: 100, height: 100 } },
      { name: '오류 중복 체크 API', endpoint: 'http://localhost:8000/api/errors/check-duplicate', method: 'POST', body: { page: 'test', code: 'print("test")', output: 'test output' } },
    ];

    const results: APITestResult[] = [];
    setTotalTests(apiTests.length);

    for (let i = 0; i < apiTests.length; i++) {
      const test = apiTests[i];
      setCurrentTest(i + 1);

      const startTime = performance.now();
      let status: 'success' | 'error' = 'error';
      let message = '';

      try {
        const options: RequestInit = {
          method: test.method,
          headers: { 'Content-Type': 'application/json' },
        };
        if (test.body) {
          options.body = JSON.stringify(test.body);
        }

        const response = await fetch(test.endpoint, options);
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        if (response.ok) {
          const data = await response.json();
          status = 'success';
          message = `Status: ${response.status} OK (${responseTime}ms)`;
          if (data.success !== undefined) {
            message += data.success ? ' - 실행 성공' : ' - 실행 실패';
          }
        } else {
          message = `Status: ${response.status} ${response.statusText}`;
        }

        results.push({
          name: test.name,
          endpoint: test.endpoint,
          status,
          responseTime,
          message
        });
      } catch (err: any) {
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          status: 'error',
          responseTime: 0,
          message: `연결 실패: ${err.message}`
        });
      }

      setApiResults([...results]);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setTesting(false);
    setCurrentTest(0);
  };

  // HTML 생성 테스트 (파이게임 만들기)
  const runHTMLTests = async () => {
    setTesting(true);
    setHtmlResults([]);

    const results: HTMLTestResult[] = [];
    let testIndex = 0;

    const totalActivities = pygameGamesCurriculum.reduce((sum, level) => sum + level.activities.length, 0);
    setTotalTests(totalActivities);

    for (const level of pygameGamesCurriculum) {
      for (const activity of level.activities) {
        testIndex++;
        setCurrentTest(testIndex);

        try {
          const response = await fetch(API_ENDPOINTS.pygameToHtml, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: activity.exampleCode,
              width: 600,
              height: 400,
            }),
          });

          const data = await response.json();

          if (data.success && data.html) {
            results.push({
              id: activity.id,
              title: activity.title,
              status: 'success',
              message: `HTML 생성 성공`,
              htmlSize: data.html.length,
            });
          } else {
            results.push({
              id: activity.id,
              title: activity.title,
              status: 'error',
              message: data.error || 'HTML 생성 실패',
            });
          }
        } catch (err: any) {
          results.push({
            id: activity.id,
            title: activity.title,
            status: 'error',
            message: `연결 실패: ${err.message}`,
          });
        }

        setHtmlResults([...results]);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    setTesting(false);
    setCurrentTest(0);
  };

  // 정적 HTML 파일 테스트
  const runStaticHTMLTests = async () => {
    setTesting(true);
    setHtmlResults([]);

    const results: HTMLTestResult[] = [];
    let testIndex = 0;

    const totalActivities = pygameGamesCurriculum.reduce((sum, level) => sum + level.activities.length, 0);
    setTotalTests(totalActivities);

    for (const level of pygameGamesCurriculum) {
      for (const activity of level.activities) {
        testIndex++;
        setCurrentTest(testIndex);

        const gameFile = `/games/game_${activity.id.replace('-', '_')}.html`;

        try {
          const response = await fetch(gameFile);

          if (response.ok) {
            const html = await response.text();
            // 기본적인 검증: HTML에 필요한 요소가 있는지 확인
            const hasCanvas = html.includes('gameCanvas');
            const hasGameLoop = html.includes('gameLoop');
            const hasUpdate = html.includes('function update()');

            if (hasCanvas && hasGameLoop && hasUpdate) {
              results.push({
                id: activity.id,
                title: activity.title,
                status: 'success',
                message: `정적 HTML 파일 검증 성공`,
                htmlSize: html.length,
              });
            } else {
              results.push({
                id: activity.id,
                title: activity.title,
                status: 'error',
                message: `HTML 구조 불완전: canvas=${hasCanvas}, gameLoop=${hasGameLoop}, update=${hasUpdate}`,
              });
            }
          } else {
            results.push({
              id: activity.id,
              title: activity.title,
              status: 'error',
              message: `파일 없음: ${gameFile} (${response.status})`,
            });
          }
        } catch (err: any) {
          results.push({
            id: activity.id,
            title: activity.title,
            status: 'error',
            message: `로드 실패: ${err.message}`,
          });
        }

        setHtmlResults([...results]);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    setTesting(false);
    setCurrentTest(0);
  };

  // 필터링된 결과
  const getFilteredResults = () => {
    if (!filterCurriculumId || !testAllMode) return results;
    const filterCurriculum = ALL_CURRICULUMS.find(c => c.id === filterCurriculumId);
    if (!filterCurriculum) return results;
    return results.filter(r => r.id.includes(`[${filterCurriculum.icon}]`));
  };

  const filteredResults = getFilteredResults();
  const successCount = filteredResults.filter(r => !r.error && !r.output.includes('[SKIP]') && !r.output.includes('[TURTLE]') && !r.output.includes('[PYGAME]')).length;
  const errorCount = filteredResults.filter(r => r.error).length;
  const skippedCount = filteredResults.filter(r => r.output.includes('[SKIP]')).length;
  const turtleCount = filteredResults.filter(r => r.output.includes('[TURTLE]')).length;
  const pygameCount = filteredResults.filter(r => r.output.includes('[PYGAME]')).length;

  return (
    <>
      {/* Header - hideHeader가 true면 숨김 */}
      {!hideHeader && (
        <header className="header">
          <div className="container">
            <h1 className="logo">
              <a href="/"><span className="logo-icon">EPY</span>EduPy</a>
            </h1>

            <div className="page-title-wrapper">
              <h2 className="page-title">
                <i className="fi fi-rr-flask"></i> 커리큘럼 예제 코드 테스트
              </h2>
            </div>

            <div className="header-right-section">
              {/* 학습 메뉴 드롭다운 */}
              <LearningMenuDropdown />

              <a href="/admin/login" className="admin-login-link" title="관리자 로그인">
                <i className="fi fi-rr-lock"></i>
              </a>
            </div>
          </div>
        </header>
      )}

      <div className="test-curriculum-container">
        <div className="test-header">
          <p>다양한 자동 테스트를 실행합니다</p>
        </div>

      {isLoading && selectedTestType === 'curriculum' && (
        <div className="loading-message">
          <p>⏳ Pyodide 로딩 중...</p>
        </div>
      )}

      {!testing && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {/* 테스트 유형 선택 */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '25px'
          }}>
            <button
              onClick={() => { setSelectedTestType('curriculum'); setResults([]); setApiResults([]); setHtmlResults([]); }}
              style={{
                padding: '10px 20px',
                fontSize: '0.95rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: selectedTestType === 'curriculum' ? '#4a5568' : '#e2e8f0',
                color: selectedTestType === 'curriculum' ? 'white' : '#4a5568',
              }}
            >
              📚 커리큘럼 테스트
            </button>
            <button
              onClick={() => { setSelectedTestType('api'); setResults([]); setApiResults([]); setHtmlResults([]); }}
              style={{
                padding: '10px 20px',
                fontSize: '0.95rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: selectedTestType === 'api' ? '#4a5568' : '#e2e8f0',
                color: selectedTestType === 'api' ? 'white' : '#4a5568',
              }}
            >
              🔌 API 테스트
            </button>
            <button
              onClick={() => { setSelectedTestType('html'); setResults([]); setApiResults([]); setHtmlResults([]); }}
              style={{
                padding: '10px 20px',
                fontSize: '0.95rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: selectedTestType === 'html' ? '#4a5568' : '#e2e8f0',
                color: selectedTestType === 'html' ? 'white' : '#4a5568',
              }}
            >
              🎮 HTML 게임 테스트
            </button>
          </div>

          {/* 커리큘럼 테스트 옵션 */}
          {selectedTestType === 'curriculum' && isReady && (
            <>
              {/* 모든 커리큘럼 테스트 토글 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '20px',
                padding: '12px 20px',
                background: testAllMode ? 'linear-gradient(135deg, #f56565 0%, #c53030 100%)' : '#e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: testAllMode ? '0 4px 15px rgba(245, 101, 101, 0.4)' : 'none',
                maxWidth: '400px',
                margin: '0 auto 20px'
              }} onClick={() => setTestAllMode(!testAllMode)}>
                <input
                  type="checkbox"
                  checked={testAllMode}
                  onChange={(e) => setTestAllMode(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{
                  fontWeight: '600',
                  color: testAllMode ? 'white' : '#4a5568',
                  fontSize: '1rem'
                }}>
                  모든 커리큘럼 한번에 테스트 ({ALL_CURRICULUMS.length}개)
                </span>
              </div>

              {/* 커리큘럼 통계 (클릭하면 결과 필터링) */}
              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap'
              }}>
                {ALL_CURRICULUMS.map(curriculum => {
                  const data = curriculum.getData();
                  const levels = 'levels' in data ? data.levels : data;
                  const activityCount = levels.reduce((sum: number, l: any) => sum + l.activities.length, 0);
                  const isSelected = filterCurriculumId === curriculum.id;
                  return (
                    <div
                      key={curriculum.id}
                      onClick={() => setFilterCurriculumId(isSelected ? null : curriculum.id)}
                      style={{
                        padding: '8px 16px',
                        background: isSelected ? curriculum.color : '#f7fafc',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: isSelected ? 'white' : '#718096',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: isSelected ? 'none' : '2px solid transparent',
                        boxShadow: isSelected ? `0 2px 8px ${curriculum.shadowColor}` : 'none'
                      }}
                    >
                      <i className={`fi ${curriculum.icon}`} style={{ marginRight: '6px' }}></i>
                      {curriculum.name}: <strong>{activityCount}</strong>개 활동
                    </div>
                  );
                })}
              </div>

              {/* 개별 커리큘럼 선택 (testAllMode가 false일 때만) */}
              {!testAllMode && (
                <div className="curriculum-selector" style={{
                  display: 'flex',
                  gap: '15px',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap'
                }}>
                  {ALL_CURRICULUMS.map(curriculum => (
                    <button
                      key={curriculum.id}
                      className={`curriculum-tab ${selectedCurriculumId === curriculum.id ? 'active' : ''}`}
                      onClick={() => setSelectedCurriculumId(curriculum.id)}
                      style={{
                        padding: '12px 30px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: selectedCurriculumId === curriculum.id
                          ? curriculum.color
                          : '#e2e8f0',
                        color: selectedCurriculumId === curriculum.id ? 'white' : '#4a5568',
                        transition: 'all 0.3s',
                        boxShadow: selectedCurriculumId === curriculum.id
                          ? `0 4px 15px ${curriculum.shadowColor}`
                          : 'none'
                      }}
                    >
                      <i className={curriculum.icon} style={{ marginRight: '8px' }}></i>
                      {curriculum.name}
                    </button>
                  ))}
                </div>
              )}

              <button className="start-button" onClick={runAllTests} style={{
                background: testAllMode
                  ? 'linear-gradient(135deg, #f56565 0%, #c53030 100%)'
                  : selectedCurriculum.color
              }}>
                {testAllMode
                  ? `모든 커리큘럼 테스트 시작 (${ALL_CURRICULUMS.length}개)`
                  : `${selectedCurriculum.name} 테스트 시작`
                }
              </button>
            </>
          )}

          {/* API 테스트 옵션 */}
          {selectedTestType === 'api' && (
            <div>
              <p style={{ marginBottom: '20px', color: '#718096' }}>
                백엔드 API 엔드포인트 연결 상태와 응답 시간을 테스트합니다.
              </p>
              <button className="start-button" onClick={runAPITests}>
                🔌 API 연결 테스트 시작
              </button>
            </div>
          )}

          {/* HTML 게임 테스트 옵션 */}
          {selectedTestType === 'html' && (
            <div>
              <p style={{ marginBottom: '20px', color: '#718096' }}>
                파이게임 만들기 커리큘럼의 HTML 변환 및 정적 파일을 테스트합니다.
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button className="start-button" onClick={runHTMLTests} style={{ background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' }}>
                  🔄 실시간 HTML 변환 테스트
                </button>
                <button className="start-button" onClick={runStaticHTMLTests} style={{ background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)' }}>
                  📁 정적 HTML 파일 테스트
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {testing && (
        <div className="progress-section">
          <p className="progress-text">
            테스트 진행 중: {currentTest} / {totalTests}
          </p>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${(currentTest / totalTests) * 100}%` }}
            >
              {Math.round((currentTest / totalTests) * 100)}%
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '2rem', color: '#2d3748', marginBottom: '20px' }}>
            📊 {testAllMode
              ? filterCurriculumId
                ? `${ALL_CURRICULUMS.find(c => c.id === filterCurriculumId)?.name || ''} 테스트 결과`
                : '전체 커리큘럼 테스트 결과'
              : `${selectedCurriculum.name} 테스트 결과`
            }
            {testAllMode && filterCurriculumId && (
              <button
                onClick={() => setFilterCurriculumId(null)}
                style={{
                  marginLeft: '15px',
                  padding: '6px 12px',
                  fontSize: '0.9rem',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  verticalAlign: 'middle'
                }}
              >
                전체 보기
              </button>
            )}
          </h2>

          {/* 결과 필터링 카드 (전체 테스트 모드에서만 표시) */}
          {testAllMode && (
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              <div
                onClick={() => setFilterCurriculumId(null)}
                style={{
                  padding: '8px 16px',
                  background: !filterCurriculumId ? 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)' : '#f7fafc',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: !filterCurriculumId ? 'white' : '#718096',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '600'
                }}
              >
                전체 ({results.length})
              </div>
              {ALL_CURRICULUMS.map(curriculum => {
                const curriculumResults = results.filter(r => r.id.includes(`[${curriculum.icon}]`));
                if (curriculumResults.length === 0) return null;
                const isSelected = filterCurriculumId === curriculum.id;
                const errorCount = curriculumResults.filter(r => r.error).length;
                return (
                  <div
                    key={curriculum.id}
                    onClick={() => setFilterCurriculumId(isSelected ? null : curriculum.id)}
                    style={{
                      padding: '8px 16px',
                      background: isSelected ? curriculum.color : '#f7fafc',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      color: isSelected ? 'white' : '#718096',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? `0 2px 8px ${curriculum.shadowColor}` : 'none'
                    }}
                  >
                    <i className={`fi ${curriculum.icon}`} style={{ marginRight: '6px' }}></i>
                    {curriculum.name.split(' - ')[0]} ({curriculumResults.length})
                    {errorCount > 0 && (
                      <span style={{
                        marginLeft: '6px',
                        background: isSelected ? 'rgba(255,255,255,0.3)' : '#f56565',
                        color: isSelected ? 'white' : 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}>
                        {errorCount} 오류
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="results-summary">
            <div className="summary-card success">
              <div className="summary-number">{successCount}</div>
              <div className="summary-label">✅ 성공</div>
            </div>
            <div className="summary-card error">
              <div className="summary-number">{errorCount}</div>
              <div className="summary-label">❌ 오류</div>
            </div>
            <div className="summary-card warning">
              <div className="summary-number">{skippedCount}</div>
              <div className="summary-label">⏭️ 건너뜀</div>
            </div>
            {turtleCount > 0 && (
              <div className="summary-card turtle">
                <div className="summary-number">{turtleCount}</div>
                <div className="summary-label">🐢 Turtle</div>
              </div>
            )}
            {pygameCount > 0 && (
              <div className="summary-card pygame">
                <div className="summary-number">{pygameCount}</div>
                <div className="summary-label">🎮 Pygame</div>
              </div>
            )}
          </div>

          <div className="results-grid">
            {filteredResults.map((result) => {
              const isSkipped = result.output.includes('⏭️');
              const isTurtle = result.output.includes('🐢');
              const isPygame = result.output.includes('🎮');
              const cardClass = result.error ? 'error' : isSkipped ? 'skipped' : 'success';

              return (
                <div key={result.id} className={`result-card ${cardClass}`}>
                  <div className="result-header">
                    <h3>
                      {result.error ? '❌' : isSkipped ? '⏭️' : '✅'} {result.id} - {result.title}
                    </h3>
                    {result.hasInput && result.testInputs && result.testInputs.length > 0 && (
                      <span className="result-badge input">⌨️ Input</span>
                    )}
                    {isTurtle && (
                      <span className="result-badge turtle">🐢 Turtle</span>
                    )}
                    {isPygame && (
                      <span className="result-badge pygame">🎮 Pygame</span>
                    )}
                  </div>

                  <details>
                    <summary className="code-toggle">📝 코드 보기</summary>
                    <div className="code-block highlighted-code">
                      {highlightPythonCode(result.code)}
                    </div>
                  </details>

                  {result.hasInput && (
                    <div>
                      {result.testInputs && result.testInputs.length > 0 ? (
                        <div className="test-inputs">
                          <p>📝 테스트 입력값: {result.testInputs.join(', ')}</p>
                        </div>
                      ) : (
                        <div className="no-inputs-warning">
                          <p>⚠️ 이 예제는 사용자 입력(input)이 필요하지만 테스트 입력값이 정의되지 않았습니다.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {result.error && (
                    <div className="error-output">
                      <strong>오류:</strong>
                      <pre>{result.error}</pre>
                    </div>
                  )}

                  {!result.error && result.output && (
                    <div className="success-output">
                      <strong>출력:</strong>
                      <pre>{result.output}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* API 테스트 결과 */}
      {apiResults.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '2rem', color: '#2d3748', marginBottom: '20px' }}>
            🔌 API 연결 테스트 결과
          </h2>

          <div className="results-summary">
            <div className="summary-card success">
              <div className="summary-number">{apiResults.filter(r => r.status === 'success').length}</div>
              <div className="summary-label">✅ 성공</div>
            </div>
            <div className="summary-card error">
              <div className="summary-number">{apiResults.filter(r => r.status === 'error').length}</div>
              <div className="summary-label">❌ 실패</div>
            </div>
          </div>

          <div className="results-grid">
            {apiResults.map((result, index) => (
              <div key={index} className={`result-card ${result.status}`}>
                <div className="result-header">
                  <h3>
                    {result.status === 'success' ? '✅' : '❌'} {result.name}
                  </h3>
                  {result.responseTime > 0 && (
                    <span className="result-badge" style={{
                      background: result.responseTime < 500 ? '#48bb78' : result.responseTime < 1000 ? '#ed8936' : '#f56565',
                      color: 'white'
                    }}>
                      {result.responseTime}ms
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '8px', wordBreak: 'break-all' }}>
                  {result.endpoint}
                </div>
                <div style={{ marginTop: '10px', padding: '10px', background: result.status === 'success' ? '#f0fff4' : '#fff5f5', borderRadius: '6px' }}>
                  <pre style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{result.message}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HTML 테스트 결과 */}
      {htmlResults.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '2rem', color: '#2d3748', marginBottom: '20px' }}>
            🎮 HTML 게임 테스트 결과
          </h2>

          <div className="results-summary">
            <div className="summary-card success">
              <div className="summary-number">{htmlResults.filter(r => r.status === 'success').length}</div>
              <div className="summary-label">✅ 성공</div>
            </div>
            <div className="summary-card error">
              <div className="summary-number">{htmlResults.filter(r => r.status === 'error').length}</div>
              <div className="summary-label">❌ 실패</div>
            </div>
          </div>

          <div className="results-grid">
            {htmlResults.map((result) => (
              <div key={result.id} className={`result-card ${result.status}`}>
                <div className="result-header">
                  <h3>
                    {result.status === 'success' ? '✅' : '❌'} {result.id} - {result.title}
                  </h3>
                  {result.htmlSize && (
                    <span className="result-badge" style={{ background: '#667eea', color: 'white' }}>
                      {(result.htmlSize / 1024).toFixed(1)}KB
                    </span>
                  )}
                </div>
                <div style={{ marginTop: '10px', padding: '10px', background: result.status === 'success' ? '#f0fff4' : '#fff5f5', borderRadius: '6px' }}>
                  <pre style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{result.message}</pre>
                </div>
                {result.status === 'success' && (
                  <div style={{ marginTop: '10px' }}>
                    <a
                      href={`/games/game_${result.id.replace('-', '_')}.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        background: '#4299e1',
                        color: 'white',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '0.85rem'
                      }}
                    >
                      🎮 게임 열기
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
}

