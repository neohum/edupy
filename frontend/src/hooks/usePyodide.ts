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

        // 데이터 분석/AI에 필요한 패키지들 미리 로드
        console.log('📦 필수 패키지 로딩 중...');
        try {
          await pyodideInstance.loadPackage(['numpy', 'pandas', 'matplotlib', 'micropip']);
          console.log('✅ 패키지 로딩 완료: numpy, pandas, matplotlib');

          // matplotlib 백엔드 설정 및 한글 폰트 설치
          await pyodideInstance.runPythonAsync(`
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.ioff()  # 인터랙티브 모드 끄기

# 한글 폰트 다운로드 및 설정
import matplotlib.font_manager as fm
from pyodide.http import pyfetch
import os

async def setup_korean_font():
    font_path = '/tmp/NotoSansKR.otf'

    try:
        # 로컬 서버에서 폰트 다운로드 (public/fonts/NotoSansKR.otf)
        if not os.path.exists(font_path):
            response = await pyfetch('/fonts/NotoSansKR.otf')
            font_bytes = await response.bytes()
            with open(font_path, 'wb') as f:
                f.write(font_bytes)
            print(f'📥 폰트 다운로드 완료: {len(font_bytes)} bytes')

        # 폰트 등록
        fm.fontManager.addfont(font_path)

        # 폰트 이름 확인
        font_prop = fm.FontProperties(fname=font_path)
        font_name = font_prop.get_name()
        print(f'📝 폰트 이름: {font_name}')

        # 폰트가 제대로 등록되었는지 확인
        found_fonts = [f for f in fm.fontManager.ttflist if 'Noto' in f.name]
        print(f'📋 등록된 Noto 폰트 수: {len(found_fonts)}')
        for f in found_fonts:
            print(f'   - {f.name}: {f.fname}')

        # matplotlib 전역 설정 - 폰트 이름 직접 사용
        plt.rcParams['font.family'] = font_name
        plt.rcParams['axes.unicode_minus'] = False

        # 추가 설정 - sans-serif에도 추가
        current_sans = list(plt.rcParams.get('font.sans-serif', []))
        plt.rcParams['font.sans-serif'] = [font_name] + current_sans

        matplotlib.rcParams['font.family'] = font_name
        matplotlib.rcParams['axes.unicode_minus'] = False

        print(f'✅ 한글 폰트({font_name}) 설정 완료')
        print(f'   font.family: {plt.rcParams["font.family"]}')
        return font_path  # 폰트 경로 반환 (FontProperties에서 사용)
    except Exception as e:
        print(f'⚠️ 한글 폰트 설정 실패: {e}')
        import traceback
        traceback.print_exc()
        plt.rcParams['axes.unicode_minus'] = False
        return None

_korean_font_path = await setup_korean_font()

# plt.show()를 오버라이드하여 base64 이미지로 출력
import io
import base64
import builtins

_original_plt_show = plt.show

def _matplotlib_show_override(*args, **kwargs):
    """plt.show()를 base64 이미지로 출력하도록 오버라이드"""
    import matplotlib.pyplot as _plt
    import matplotlib.font_manager as _fm
    try:
        fig = _plt.gcf()
        # Figure가 비어있으면 스킵
        if not fig.get_axes():
            return

        # 한글 폰트가 설정되어 있으면 모든 텍스트 요소에 직접 적용
        if _korean_font_path:
            font_prop = _fm.FontProperties(fname=_korean_font_path)

            def apply_font_to_text(text_obj):
                """텍스트 객체에 폰트 적용"""
                if hasattr(text_obj, 'set_fontproperties'):
                    try:
                        text_obj.set_fontproperties(font_prop)
                    except:
                        pass

            # Figure의 모든 axes에 대해 폰트 적용
            for ax in fig.get_axes():
                # 제목
                apply_font_to_text(ax.title)
                # x, y 레이블
                apply_font_to_text(ax.xaxis.label)
                apply_font_to_text(ax.yaxis.label)
                # tick 레이블
                for label in ax.get_xticklabels():
                    apply_font_to_text(label)
                for label in ax.get_yticklabels():
                    apply_font_to_text(label)
                # 범례가 있으면
                legend = ax.get_legend()
                if legend:
                    for text in legend.get_texts():
                        apply_font_to_text(text)
                    if hasattr(legend, 'get_title'):
                        apply_font_to_text(legend.get_title())
                # axes 내의 모든 텍스트 (annotations, ax.text() 등)
                for text in ax.texts:
                    apply_font_to_text(text)
                # 모든 자식 요소 순회
                for child in ax.get_children():
                    apply_font_to_text(child)

            # Figure 레벨의 텍스트 (suptitle 등)
            for text in fig.texts:
                apply_font_to_text(text)

            # colorbar axes 처리 (colorbar는 별도 axes로 생성됨)
            for ax in fig.get_axes():
                # colorbar의 레이블 처리
                if hasattr(ax, 'yaxis') and ax.yaxis.label:
                    apply_font_to_text(ax.yaxis.label)
                if hasattr(ax, 'xaxis') and ax.xaxis.label:
                    apply_font_to_text(ax.xaxis.label)

        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight',
                    facecolor='white', edgecolor='none')
        buf.seek(0)
        img_data = buf.read()
        img_base64 = base64.b64encode(img_data).decode('utf-8')
        buf.close()
        output_text = f'[MATPLOTLIB_IMAGE:{img_base64}]'
        # builtins.print를 사용하여 출력 (runtime에 오버라이드된 버전 사용)
        builtins.print(output_text)
        _plt.close(fig)
    except Exception as e:
        builtins.print(f'matplotlib 오류: {e}')
        import traceback
        traceback.print_exc()

# 전역에 저장하여 나중에 접근 가능하도록
plt.show = _matplotlib_show_override
matplotlib.pyplot.show = _matplotlib_show_override
print('📊 Matplotlib 설정 완료')
          `);
        } catch (pkgError) {
          console.warn('⚠️ 일부 패키지 로딩 실패:', pkgError);
        }

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
    // MATPLOTLIB_IMAGE 마커가 있으면 이미지 출력임을 표시
    if (text.startsWith('[MATPLOTLIB_IMAGE:')) {
      console.log('🖼️ Matplotlib 이미지 출력:', text.length, 'bytes');
    } else {
      console.log('📝 Python 출력:', text);
    }
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
 * 코드에서 필요한 패키지를 감지하고 로드하는 함수
 */
export async function loadRequiredPackages(pyodide: any, code: string): Promise<void> {
  if (!pyodide) return;

  // 코드에서 import 문 분석
  const packageMap: { [key: string]: string } = {
    'numpy': 'numpy',
    'np': 'numpy',
    'pandas': 'pandas',
    'pd': 'pandas',
    'matplotlib': 'matplotlib',
    'plt': 'matplotlib',
    'scipy': 'scipy',
    'sklearn': 'scikit-learn',
    'seaborn': 'seaborn',
    'sns': 'seaborn',
  };

  const packagesToLoad: Set<string> = new Set();

  // import 패턴 감지
  const importPatterns = [
    /import\s+(\w+)/g,
    /from\s+(\w+)\s+import/g,
    /import\s+(\w+)\s+as\s+\w+/g,
  ];

  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const moduleName = match[1];
      if (packageMap[moduleName]) {
        packagesToLoad.add(packageMap[moduleName]);
      }
    }
  }

  // 필요한 패키지 로드
  if (packagesToLoad.size > 0) {
    const packages = Array.from(packagesToLoad);
    console.log(`📦 추가 패키지 로딩: ${packages.join(', ')}`);
    try {
      await pyodide.loadPackage(packages);
      console.log(`✅ 패키지 로딩 완료: ${packages.join(', ')}`);
    } catch (error) {
      console.warn('⚠️ 패키지 로딩 실패:', error);
    }
  }
}

/**
 * 사용자 코드를 처리하여 async/await 추가
 */
export function processUserCode(code: string): string {
  let processedCode = code;

  // 모든 input( 호출을 찾아서 await 추가
  // 1. 먼저 이미 await가 있는 경우를 표시
  processedCode = processedCode.replace(/await\s+input\s*\(/g, '___AWAIT_INPUT___(');

  // 2. 남은 모든 input(을 await input(으로 변경
  processedCode = processedCode.replace(/input\s*\(/g, 'await input(');

  // 3. 표시한 부분을 원래대로 복원
  processedCode = processedCode.replace(/___AWAIT_INPUT___\(/g, 'await input(');

  return processedCode;
}

/**
 * 사용자 코드를 async 함수로 감싸기
 */
export function wrapUserCode(code: string): string {
  const processedCode = processUserCode(code);

  const wrappedCode = `
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

  return wrappedCode;
}

