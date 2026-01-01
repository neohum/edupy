import { useState } from 'react';
import './NewThemes.css';

interface Theme {
  name: string;
  vibe: string;
  palette: string[];
  type: string;
  layout: string;
  motion: string;
  texture: string;
}

const themes: Theme[] = [
  {
    name: 'Studio Atlas',
    vibe: '편집적인 느낌의 크리에이티브 스튜디오',
    palette: ['#111827', '#f9fafb', '#f97316', '#22c55e'],
    type: 'Fraunces + Space Grotesk',
    layout: '그리드 + 과감한 캡션',
    motion: '카드 스택 리빌 + 캡션 스와이프',
    texture: '하프톤 도트 + 잉크 블롭',
  },
  {
    name: 'Arcade Neon',
    vibe: '게임센터 에너지, 80s 네온',
    palette: ['#0f172a', '#38bdf8', '#f472b6', '#facc15'],
    type: 'Orbitron + IBM Plex Sans',
    layout: '모듈 카드 + 라이트 스트립',
    motion: '빛 스캔 라인 + 글로우 펄스',
    texture: '그리드 와이어프레임',
  },
  {
    name: 'Paper Craft',
    vibe: '종이 공예, 따뜻한 교재 감성',
    palette: ['#2f2d2e', '#faf4e8', '#f59e0b', '#84cc16'],
    type: 'Crimson Text + Work Sans',
    layout: '스택형 카드 + 라벨 태그',
    motion: '슬로우 스윙 + 종이 리프트',
    texture: '페이퍼 그레인',
  },
  {
    name: 'Circuit Bloom',
    vibe: '과학 실험실 + 유기적 패턴',
    palette: ['#0b1320', '#e2e8f0', '#34d399', '#60a5fa'],
    type: 'Sora + Source Code Pro',
    layout: '다이어그램 섹션 + 노드',
    motion: '노드 점멸 + 라인 드로잉',
    texture: '리소그래프 스팟',
  },
  {
    name: 'Sunset Campus',
    vibe: '캠퍼스 포스터, 매거진 표지',
    palette: ['#1f2937', '#fde68a', '#fb7185', '#f97316'],
    type: 'Alegreya + Manrope',
    layout: '오버랩 히어로 + 스티커',
    motion: '스티커 팝 + 텍스트 슬라이드',
    texture: '종이 스티커 테이프',
  },
  {
    name: 'Nordic Quiet',
    vibe: '미니멀 북유럽, 정돈된 학습',
    palette: ['#0f172a', '#f8fafc', '#94a3b8', '#38bdf8'],
    type: 'DM Sans + DM Mono',
    layout: '화이트 스페이스 + 칩',
    motion: '페이드 스택 + 섬세한 패럴럭스',
    texture: '리넨 패턴',
  },
  {
    name: 'Retro Terminal',
    vibe: 'CRT 터미널 + 픽셀 감성',
    palette: ['#0a0a0a', '#00ff9c', '#7c3aed', '#f97316'],
    type: 'VT323 + Space Mono',
    layout: '콘솔 패널 + 로그',
    motion: '커서 블링크 + 스캔라인',
    texture: '노이즈 그레인',
  },
  {
    name: 'Museum Tag',
    vibe: '전시 라벨, 큐레이션 느낌',
    palette: ['#1c1917', '#fdf6e3', '#0ea5e9', '#f59e0b'],
    type: 'Cormorant Garamond + Inter Tight',
    layout: '라벨 카드 + 아카이브 목록',
    motion: '라벨 슬라이드 + 잉크 웨이브',
    texture: '프레스 도장',
  },
  {
    name: 'City Sprint',
    vibe: '도시 러닝, 에너지 넘치는 학습',
    palette: ['#111827', '#f9fafb', '#22c55e', '#06b6d4'],
    type: 'Bebas Neue + Nunito',
    layout: '타이포 히어로 + 스트립',
    motion: '스트립 스크롤 + 리빌 스트라이프',
    texture: '애스팔트 패턴',
  },
  {
    name: 'Lagoon Lab',
    vibe: '바다 연구소, 맑고 청량',
    palette: ['#0f172a', '#ecfeff', '#14b8a6', '#38bdf8'],
    type: 'Eczar + Plus Jakarta Sans',
    layout: '파도형 섹션 + 캡슐 카드',
    motion: '웨이브 리빌 + 버블 플로트',
    texture: '수채 워시',
  },
];

// 테마 미리보기 컴포넌트
function ThemePreview({
  theme,
  themeIndex,
  onBack,
  onPrev,
  onNext,
}: {
  theme: Theme;
  themeIndex: number;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [bg, text, accent, secondary] = theme.palette;
  const isFirst = themeIndex === 0;
  const isLast = themeIndex === themes.length - 1;

  const sampleCode = `# ${theme.name} 테마로 학습하기
print("Hello, Python!")

# 변수 선언
name = "학생"
score = 100

# 조건문
if score >= 90:
    print(f"{name}님, 우수합니다!")
else:
    print("더 노력해보세요!")`;

  return (
    <div
      className="theme-preview"
      style={{
        '--preview-bg': bg,
        '--preview-text': text,
        '--preview-accent': accent,
        '--preview-secondary': secondary,
      } as React.CSSProperties}
    >
      {/* 헤더 */}
      <header className="theme-preview__header">
        <button className="theme-preview__back" onClick={onBack}>
          ← 테마 목록으로
        </button>
        <div className="theme-preview__header-center">
          <span className="theme-preview__badge">{theme.name}</span>
          <h1>파이썬 기초 학습</h1>
        </div>
        <div className="theme-preview__nav">
          <button onClick={onPrev} disabled={isFirst}>◀ 이전</button>
          <span>{themeIndex + 1} / {themes.length}</span>
          <button onClick={onNext} disabled={isLast}>다음 ▶</button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="theme-preview__main">
        {/* 활동 정보 카드 */}
        <section className="theme-preview__info">
          <div className="theme-preview__info-header">
            <h2>1. 변수와 출력문</h2>
            <div className="theme-preview__progress">
              <span>0 / 5 완료</span>
              <button><i className="fi fi-rr-refresh"></i> 초기화</button>
            </div>
          </div>
          <p className="theme-preview__description">
            파이썬에서 데이터를 저장하는 방법과 화면에 출력하는 방법을 배웁니다.
          </p>
          <div className="theme-preview__concepts">
            <strong>핵심 개념:</strong>
            <span className="theme-preview__tag">변수</span>
            <span className="theme-preview__tag">print()</span>
            <span className="theme-preview__tag">문자열</span>
          </div>
        </section>

        {/* 에디터 영역 */}
        <div className="theme-preview__editors">
          {/* 예제 코드 */}
          <section className="theme-preview__example">
            <div className="theme-preview__section-header">
              <span><i className="fi fi-rr-document"></i> 예제 코드</span>
              <button>복사</button>
            </div>
            <pre className="theme-preview__code">
              {sampleCode}
            </pre>
          </section>

          {/* 코드 에디터 */}
          <section className="theme-preview__editor">
            <div className="theme-preview__section-header theme-preview__section-header--primary">
              <span><i className="fi fi-rr-laptop-code"></i> 코드 에디터</span>
              <button className="theme-preview__run-btn">▶ 실행하기</button>
            </div>
            <div className="theme-preview__editor-area">
              <div className="theme-preview__cursor">|</div>
              <span className="theme-preview__placeholder">여기에 코드를 작성하세요...</span>
            </div>
          </section>
        </div>

        {/* 실행 결과 */}
        <section className="theme-preview__output">
          <div className="theme-preview__section-header">
            <span><i className="fi fi-rr-square-terminal"></i> 실행 결과</span>
          </div>
          <div className="theme-preview__output-content">
            <p className="theme-preview__output-placeholder">
              코드를 작성하고 실행 버튼을 눌러보세요!
            </p>
          </div>
        </section>
      </main>

      {/* 테마 정보 오버레이 */}
      <div className="theme-preview__overlay">
        <div className="theme-preview__overlay-content">
          <h3><i className="fi fi-rr-palette"></i> {theme.name}</h3>
          <p>{theme.vibe}</p>
          <div className="theme-preview__overlay-meta">
            <div><strong>Typography:</strong> {theme.type}</div>
            <div><strong>Layout:</strong> {theme.layout}</div>
            <div><strong>Motion:</strong> {theme.motion}</div>
            <div><strong>Texture:</strong> {theme.texture}</div>
          </div>
          <div className="theme-preview__overlay-palette">
            {theme.palette.map((color, i) => (
              <div key={i} className="theme-preview__color-chip">
                <span style={{ backgroundColor: color }} />
                <code>{color}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewThemes() {
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number | null>(null);

  const handlePrevTheme = () => {
    if (selectedThemeIndex !== null && selectedThemeIndex > 0) {
      setSelectedThemeIndex(selectedThemeIndex - 1);
    }
  };

  const handleNextTheme = () => {
    if (selectedThemeIndex !== null && selectedThemeIndex < themes.length - 1) {
      setSelectedThemeIndex(selectedThemeIndex + 1);
    }
  };

  if (selectedThemeIndex !== null) {
    return (
      <ThemePreview
        theme={themes[selectedThemeIndex]}
        themeIndex={selectedThemeIndex}
        onBack={() => setSelectedThemeIndex(null)}
        onPrev={handlePrevTheme}
        onNext={handleNextTheme}
      />
    );
  }

  return (
    <div className="new-themes">
      <section className="new-themes__hero">
        <div className="new-themes__hero-content">
          <p className="new-themes__eyebrow">Theme Playground</p>
          <h1>Edupy를 위한 10가지 추천 테마</h1>
          <p className="new-themes__lede">
            학습 분위기를 완전히 바꾸는 방향들입니다. 톤, 타이포, 모션, 질감까지
            한 번에 비교해 보세요.
          </p>
          <div className="new-themes__hero-actions">
            <button
              className="new-themes__primary"
              onClick={() => setSelectedThemeIndex(0)}
            >
              테마 비교 시작
            </button>
            <button className="new-themes__ghost">맞춤 커스터마이징</button>
          </div>
        </div>
        <div className="new-themes__hero-card">
          <p className="new-themes__hero-tag">Highlighted</p>
          <h2>Arcade Neon</h2>
          <p>게임 학습에 바로 어울리는 네온 리듬과 그리드.</p>
          <div className="new-themes__hero-palette">
            {themes[1].palette.map((color) => (
              <span key={color} style={{ backgroundColor: color }} />
            ))}
          </div>
          <button
            className="new-themes__cta"
            onClick={() => setSelectedThemeIndex(1)}
          >
            이 테마로 보기
          </button>
        </div>
      </section>

      <section className="new-themes__grid">
        {themes.map((theme, index) => (
          <article className="new-themes__card" key={theme.name}>
            <div className="new-themes__card-header">
              <h3>{theme.name}</h3>
              <p className="new-themes__card-vibe">{theme.vibe}</p>
            </div>
            <div className="new-themes__palette">
              {theme.palette.map((color) => (
                <span key={color} style={{ backgroundColor: color }} />
              ))}
            </div>
            <dl className="new-themes__meta">
              <div>
                <dt>Type</dt>
                <dd>{theme.type}</dd>
              </div>
              <div>
                <dt>Layout</dt>
                <dd>{theme.layout}</dd>
              </div>
              <div>
                <dt>Motion</dt>
                <dd>{theme.motion}</dd>
              </div>
              <div>
                <dt>Texture</dt>
                <dd>{theme.texture}</dd>
              </div>
            </dl>
            <button
              className="new-themes__cta"
              onClick={() => setSelectedThemeIndex(index)}
            >
              이 테마로 보기
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

export default NewThemes;
