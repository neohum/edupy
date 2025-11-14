// 키보드 레이아웃 및 손가락 매핑

export type FingerType = 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'left-thumb' | 
                         'right-thumb' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky';

export interface Key {
  key: string;
  finger: FingerType;
  row: number;
  position: number;
}

// 영문 키보드 레이아웃
export const englishKeyboard: Key[][] = [
  // Row 1 (숫자 행)
  [
    { key: '`', finger: 'left-pinky', row: 1, position: 0 },
    { key: '1', finger: 'left-pinky', row: 1, position: 1 },
    { key: '2', finger: 'left-ring', row: 1, position: 2 },
    { key: '3', finger: 'left-middle', row: 1, position: 3 },
    { key: '4', finger: 'left-index', row: 1, position: 4 },
    { key: '5', finger: 'left-index', row: 1, position: 5 },
    { key: '6', finger: 'right-index', row: 1, position: 6 },
    { key: '7', finger: 'right-index', row: 1, position: 7 },
    { key: '8', finger: 'right-middle', row: 1, position: 8 },
    { key: '9', finger: 'right-ring', row: 1, position: 9 },
    { key: '0', finger: 'right-pinky', row: 1, position: 10 },
    { key: '-', finger: 'right-pinky', row: 1, position: 11 },
    { key: '=', finger: 'right-pinky', row: 1, position: 12 },
  ],
  // Row 2 (QWERTY 행)
  [
    { key: 'q', finger: 'left-pinky', row: 2, position: 0 },
    { key: 'w', finger: 'left-ring', row: 2, position: 1 },
    { key: 'e', finger: 'left-middle', row: 2, position: 2 },
    { key: 'r', finger: 'left-index', row: 2, position: 3 },
    { key: 't', finger: 'left-index', row: 2, position: 4 },
    { key: 'y', finger: 'right-index', row: 2, position: 5 },
    { key: 'u', finger: 'right-index', row: 2, position: 6 },
    { key: 'i', finger: 'right-middle', row: 2, position: 7 },
    { key: 'o', finger: 'right-ring', row: 2, position: 8 },
    { key: 'p', finger: 'right-pinky', row: 2, position: 9 },
    { key: '[', finger: 'right-pinky', row: 2, position: 10 },
    { key: ']', finger: 'right-pinky', row: 2, position: 11 },
    { key: '\\', finger: 'right-pinky', row: 2, position: 12 },
  ],
  // Row 3 (Home Row - ASDF)
  [
    { key: 'a', finger: 'left-pinky', row: 3, position: 0 },
    { key: 's', finger: 'left-ring', row: 3, position: 1 },
    { key: 'd', finger: 'left-middle', row: 3, position: 2 },
    { key: 'f', finger: 'left-index', row: 3, position: 3 },
    { key: 'g', finger: 'left-index', row: 3, position: 4 },
    { key: 'h', finger: 'right-index', row: 3, position: 5 },
    { key: 'j', finger: 'right-index', row: 3, position: 6 },
    { key: 'k', finger: 'right-middle', row: 3, position: 7 },
    { key: 'l', finger: 'right-ring', row: 3, position: 8 },
    { key: ';', finger: 'right-pinky', row: 3, position: 9 },
    { key: "'", finger: 'right-pinky', row: 3, position: 10 },
  ],
  // Row 4 (ZXCV 행)
  [
    { key: 'z', finger: 'left-pinky', row: 4, position: 0 },
    { key: 'x', finger: 'left-ring', row: 4, position: 1 },
    { key: 'c', finger: 'left-middle', row: 4, position: 2 },
    { key: 'v', finger: 'left-index', row: 4, position: 3 },
    { key: 'b', finger: 'left-index', row: 4, position: 4 },
    { key: 'n', finger: 'right-index', row: 4, position: 5 },
    { key: 'm', finger: 'right-index', row: 4, position: 6 },
    { key: ',', finger: 'right-middle', row: 4, position: 7 },
    { key: '.', finger: 'right-ring', row: 4, position: 8 },
    { key: '/', finger: 'right-pinky', row: 4, position: 9 },
  ],
  // Row 5 (Space bar)
  [
    { key: ' ', finger: 'right-thumb', row: 5, position: 0 },
  ],
];

// 한글 키보드 레이아웃 (기본 자음/모음)
export const koreanKeyboard: Key[][] = [
  // Row 1
  [
    { key: 'ㅂ', finger: 'left-pinky', row: 2, position: 0 },
    { key: 'ㅈ', finger: 'left-ring', row: 2, position: 1 },
    { key: 'ㄷ', finger: 'left-middle', row: 2, position: 2 },
    { key: 'ㄱ', finger: 'left-index', row: 2, position: 3 },
    { key: 'ㅅ', finger: 'left-index', row: 2, position: 4 },
    { key: 'ㅛ', finger: 'right-index', row: 2, position: 5 },
    { key: 'ㅕ', finger: 'right-index', row: 2, position: 6 },
    { key: 'ㅑ', finger: 'right-middle', row: 2, position: 7 },
    { key: 'ㅐ', finger: 'right-ring', row: 2, position: 8 },
    { key: 'ㅔ', finger: 'right-pinky', row: 2, position: 9 },
  ],
  // Row 2 (Home Row)
  [
    { key: 'ㅁ', finger: 'left-pinky', row: 3, position: 0 },
    { key: 'ㄴ', finger: 'left-ring', row: 3, position: 1 },
    { key: 'ㅇ', finger: 'left-middle', row: 3, position: 2 },
    { key: 'ㄹ', finger: 'left-index', row: 3, position: 3 },
    { key: 'ㅎ', finger: 'left-index', row: 3, position: 4 },
    { key: 'ㅗ', finger: 'right-index', row: 3, position: 5 },
    { key: 'ㅓ', finger: 'right-index', row: 3, position: 6 },
    { key: 'ㅏ', finger: 'right-middle', row: 3, position: 7 },
    { key: 'ㅣ', finger: 'right-ring', row: 3, position: 8 },
  ],
  // Row 3
  [
    { key: 'ㅋ', finger: 'left-pinky', row: 4, position: 0 },
    { key: 'ㅌ', finger: 'left-ring', row: 4, position: 1 },
    { key: 'ㅊ', finger: 'left-middle', row: 4, position: 2 },
    { key: 'ㅍ', finger: 'left-index', row: 4, position: 3 },
    { key: 'ㅠ', finger: 'right-index', row: 4, position: 5 },
    { key: 'ㅜ', finger: 'right-index', row: 4, position: 6 },
    { key: 'ㅡ', finger: 'right-middle', row: 4, position: 7 },
  ],
  // Space bar
  [
    { key: ' ', finger: 'right-thumb', row: 5, position: 0 },
  ],
];

// 손가락 색상 매핑
export const fingerColors: Record<FingerType, string> = {
  'left-pinky': '#FF6B6B',
  'left-ring': '#4ECDC4',
  'left-middle': '#45B7D1',
  'left-index': '#96CEB4',
  'left-thumb': '#FFEAA7',
  'right-thumb': '#FFEAA7',
  'right-index': '#96CEB4',
  'right-middle': '#45B7D1',
  'right-ring': '#4ECDC4',
  'right-pinky': '#FF6B6B',
};

// 현재 문자에 해당하는 키 찾기
export function findKeyForChar(char: string, language: 'korean' | 'english'): Key | null {
  const keyboard = language === 'korean' ? koreanKeyboard : englishKeyboard;
  const lowerChar = char.toLowerCase();
  
  for (const row of keyboard) {
    const key = row.find(k => k.key.toLowerCase() === lowerChar);
    if (key) return key;
  }
  
  return null;
}

