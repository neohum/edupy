import { useState, useEffect, useRef } from 'react';

// Pyodide 타입 정의
declare global {
  interface Window {
    loadPyodide: any;
  }
}

interface UsePyodideReturn {
  pyodide: any;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Pyodide 초기화 및 관리 훅
 */
export function usePyodide(): UsePyodideReturn {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pyodideRef = useRef<any>(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    // 이미 초기화 중이거나 완료된 경우 스킵
    if (initializingRef.current || pyodideRef.current) {
      return;
    }

    const initPyodide = async () => {
      try {
        initializingRef.current = true;
        setIsLoading(true);
        setError(null);

        // Pyodide 로드 (CDN 사용)
        const pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
          fullStdLib: false, // 전체 표준 라이브러리 로드하지 않음
        });

        pyodideRef.current = pyodideInstance;
        setPyodide(pyodideInstance);
        setIsReady(true);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Pyodide 초기화 실패:', err);
        // 에러가 발생해도 pyodide 인스턴스가 있으면 사용
        if (pyodideRef.current) {
          setPyodide(pyodideRef.current);
          setIsReady(true);
          setIsLoading(false);
        } else {
          setError(err.message || 'Pyodide 초기화에 실패했습니다.');
          setIsLoading(false);
          initializingRef.current = false;
        }
      }
    };

    initPyodide();
  }, []);

  return { pyodide, isReady, isLoading, error };
}

/**
 * Python 코드 실행을 위한 헬퍼 함수
 */
export function setupPythonEnvironment(
  pyodide: any,
  onOutput: (text: string) => void,
  onInput: (prompt: string) => Promise<string>
) {
  if (!pyodide) return;

  // JavaScript 함수를 Python에서 사용할 수 있도록 등록
  pyodide.globals.set('js_print', (text: string) => {
    onOutput(text);
  });

  pyodide.globals.set('js_input', async (prompt: string) => {
    return await onInput(prompt);
  });

  // builtins 모듈 import 및 print 오버라이드
  pyodide.runPython(`
import builtins

# JavaScript 함수 가져오기
js_input = globals()['js_input']
js_print = globals()['js_print']

# print 오버라이드
def custom_print(*args, sep=' ', end='\\n', **kwargs):
    # 여러 인자를 sep으로 연결하여 하나의 문자열로 만듦
    output = sep.join(str(arg) for arg in args)
    js_print(output)

builtins.print = custom_print
  `);
}

/**
 * 사용자 코드를 처리하여 async/await 추가
 */
export function processUserCode(code: string): string {
  return code
    // int(input(...)) -> int(await input(...))
    .replace(/int\s*\(\s*input\s*\(/g, 'int(await input(')
    // float(input(...)) -> float(await input(...))
    .replace(/float\s*\(\s*input\s*\(/g, 'float(await input(')
    // str(input(...)) -> str(await input(...))
    .replace(/str\s*\(\s*input\s*\(/g, 'str(await input(')
    // 변수 = input(...) -> 변수 = await input(...)
    .replace(/=\s*input\s*\(/g, '= await input(')
    // print(input(...)) -> print(await input(...))
    .replace(/print\s*\(\s*input\s*\(/g, 'print(await input(');
}

/**
 * 사용자 코드를 async 함수로 감싸기
 */
export function wrapUserCode(code: string): string {
  const processedCode = processUserCode(code);

  return `
async def __user_code__():
    # input 함수를 async로 정의
    async def input(prompt=""):
        result = await js_input(str(prompt))
        return result

    # 사용자 코드 실행
${processedCode.split('\n').map(line => '    ' + line).join('\n')}

# 실행
await __user_code__()
  `;
}

