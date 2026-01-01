import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Theme {
  name: string;
  vibe: string;
  palette: string[];
  type: string;
  layout: string;
  motion: string;
  texture: string;
}

export const themes: Theme[] = [
  {
    name: '기본 테마',
    vibe: '클래식한 EduPy 기본 디자인',
    palette: ['#1a202c', '#f7fafc', '#667eea', '#764ba2'],
    type: 'System Default',
    layout: '기본 레이아웃',
    motion: '기본 애니메이션',
    texture: '없음',
  },
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

interface ThemeContextType {
  currentTheme: Theme;
  currentThemeIndex: number;
  setThemeByIndex: (index: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'edupy_selected_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeIndex, setCurrentThemeIndex] = useState<number>(() => {
    // 로컬 스토리지에서 저장된 테마 인덱스 불러오기
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved !== null) {
      const index = parseInt(saved, 10);
      if (!isNaN(index) && index >= 0 && index < themes.length) {
        return index;
      }
    }
    return 10; // 기본값: Lagoon Lab
  });

  const setThemeByIndex = (index: number) => {
    if (index >= 0 && index < themes.length) {
      setCurrentThemeIndex(index);
      localStorage.setItem(THEME_STORAGE_KEY, index.toString());
    }
  };

  // 테마 변경 시 CSS 변수 업데이트
  useEffect(() => {
    const theme = themes[currentThemeIndex];
    const [bg, text, accent, secondary] = theme.palette;

    document.documentElement.style.setProperty('--theme-bg', bg);
    document.documentElement.style.setProperty('--theme-text', text);
    document.documentElement.style.setProperty('--theme-accent', accent);
    document.documentElement.style.setProperty('--theme-secondary', secondary);
  }, [currentThemeIndex]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: themes[currentThemeIndex],
        currentThemeIndex,
        setThemeByIndex,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { themes as allThemes };
