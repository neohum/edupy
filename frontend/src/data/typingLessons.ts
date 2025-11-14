import type { TypingLesson } from '../types';

export const koreanLessons: TypingLesson[] = [
  {
    id: 'ko-1',
    language: 'korean',
    level: 1,
    title: '기본 자음 연습',
    description: '한글 기본 자음을 연습합니다',
    text: 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ',
    targetWPM: 30,
    targetAccuracy: 90,
  },
  {
    id: 'ko-2',
    language: 'korean',
    level: 1,
    title: '기본 모음 연습',
    description: '한글 기본 모음을 연습합니다',
    text: 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ',
    targetWPM: 30,
    targetAccuracy: 90,
  },
  {
    id: 'ko-3',
    language: 'korean',
    level: 2,
    title: '간단한 단어',
    description: '자주 사용하는 간단한 한글 단어를 연습합니다',
    text: '안녕하세요 반갑습니다 감사합니다 사랑합니다',
    targetWPM: 40,
    targetAccuracy: 92,
  },
  {
    id: 'ko-4',
    language: 'korean',
    level: 3,
    title: '프로그래밍 용어',
    description: '프로그래밍에서 자주 사용하는 한글 용어를 연습합니다',
    text: '변수 함수 클래스 객체 배열 문자열 조건문 반복문',
    targetWPM: 50,
    targetAccuracy: 93,
  },
  {
    id: 'ko-5',
    language: 'korean',
    level: 4,
    title: '긴 문장 연습',
    description: '실제 문장을 타이핑하며 속도와 정확도를 높입니다',
    text: '파이썬은 배우기 쉽고 강력한 프로그래밍 언어입니다. 데이터 분석, 웹 개발, 인공지능 등 다양한 분야에서 사용됩니다.',
    targetWPM: 60,
    targetAccuracy: 95,
  },
];

export const englishLessons: TypingLesson[] = [
  {
    id: 'en-1',
    language: 'english',
    level: 1,
    title: 'Home Row Keys',
    description: 'Practice the home row keys',
    text: 'asdf jkl; asdf jkl; asdf jkl;',
    targetWPM: 30,
    targetAccuracy: 90,
  },
  {
    id: 'en-2',
    language: 'english',
    level: 1,
    title: 'Top Row Keys',
    description: 'Practice the top row keys',
    text: 'qwer uiop qwer uiop qwer uiop',
    targetWPM: 30,
    targetAccuracy: 90,
  },
  {
    id: 'en-3',
    language: 'english',
    level: 2,
    title: 'Bottom Row Keys',
    description: 'Practice the bottom row keys',
    text: 'zxcv bnm, zxcv bnm, zxcv bnm,',
    targetWPM: 35,
    targetAccuracy: 90,
  },
  {
    id: 'en-4',
    language: 'english',
    level: 2,
    title: 'Simple Words',
    description: 'Practice common English words',
    text: 'the quick brown fox jumps over the lazy dog',
    targetWPM: 40,
    targetAccuracy: 92,
  },
  {
    id: 'en-5',
    language: 'english',
    level: 3,
    title: 'Programming Keywords',
    description: 'Practice Python programming keywords',
    text: 'def class import from return if else for while try except',
    targetWPM: 50,
    targetAccuracy: 93,
  },
  {
    id: 'en-6',
    language: 'english',
    level: 3,
    title: 'Special Characters',
    description: 'Practice special characters used in coding',
    text: '() {} [] <> != == += -= *= /= // ** && || ++ --',
    targetWPM: 45,
    targetAccuracy: 90,
  },
  {
    id: 'en-7',
    language: 'english',
    level: 4,
    title: 'Code Snippets',
    description: 'Practice typing actual code',
    text: 'def hello_world(): print("Hello, World!") return True',
    targetWPM: 55,
    targetAccuracy: 94,
  },
  {
    id: 'en-8',
    language: 'english',
    level: 5,
    title: 'Long Sentences',
    description: 'Practice typing longer sentences',
    text: 'Python is a high-level, interpreted programming language with dynamic semantics. Its high-level built-in data structures make it very attractive for rapid application development.',
    targetWPM: 60,
    targetAccuracy: 95,
  },
];

export const allLessons: TypingLesson[] = [...koreanLessons, ...englishLessons];

// 레벨별 연습 텍스트 풀
const koreanTextPool: Record<number, string[]> = {
  1: [
    'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ',
    'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ',
    'ㄱㄴㄷㄹㅁㅂㅅㅇ',
    'ㅈㅊㅋㅌㅍㅎ',
    'ㅏㅓㅗㅜㅡㅣ',
  ],
  2: [
    '안녕하세요 반갑습니다 감사합니다 사랑합니다',
    '좋은 아침 좋은 하루 좋은 저녁',
    '오늘 내일 어제 모레 그제',
    '봄 여름 가을 겨울',
    '월요일 화요일 수요일 목요일 금요일',
  ],
  3: [
    '변수 함수 클래스 객체 배열 문자열 조건문 반복문',
    '파이썬 자바 자바스크립트 타입스크립트',
    '데이터 알고리즘 자료구조 프로그래밍',
    '입력 출력 처리 저장 불러오기',
    '시작 종료 실행 중지 일시정지',
  ],
  4: [
    '파이썬은 배우기 쉽고 강력한 프로그래밍 언어입니다. 데이터 분석, 웹 개발, 인공지능 등 다양한 분야에서 사용됩니다.',
    '프로그래밍을 배우면 논리적 사고력이 향상됩니다. 문제를 분석하고 해결하는 능력을 기를 수 있습니다.',
    '타이핑 연습은 프로그래밍의 기본입니다. 빠르고 정확한 타이핑은 생산성을 높여줍니다.',
    '꾸준한 연습이 실력 향상의 지름길입니다. 매일 조금씩 연습하면 큰 발전을 이룰 수 있습니다.',
    '코딩은 창의력을 발휘할 수 있는 멋진 활동입니다. 자신만의 프로그램을 만들어보세요.',
  ],
  5: [
    '인공지능 기술은 우리 생활을 크게 변화시키고 있습니다. 음성 인식, 이미지 처리, 자연어 처리 등 다양한 분야에서 활용되고 있으며, 앞으로 더욱 발전할 것으로 예상됩니다.',
    '웹 개발은 프론트엔드와 백엔드로 나뉩니다. 프론트엔드는 사용자가 보는 화면을 만들고, 백엔드는 서버와 데이터베이스를 관리합니다. 두 영역 모두 중요합니다.',
    '데이터 과학은 데이터를 수집하고 분석하여 의미 있는 정보를 찾아내는 학문입니다. 통계학, 프로그래밍, 도메인 지식이 필요하며, 다양한 산업에서 활용됩니다.',
    '오픈소스 프로젝트에 참여하면 실력을 향상시킬 수 있습니다. 다른 개발자들과 협업하며 코드 리뷰를 받고, 새로운 기술을 배울 수 있는 좋은 기회입니다.',
    '프로그래밍 언어는 도구일 뿐입니다. 중요한 것은 문제 해결 능력과 알고리즘적 사고입니다. 하나의 언어를 깊이 있게 배우면 다른 언어도 쉽게 배울 수 있습니다.',
  ],
};

const englishTextPool: Record<number, string[]> = {
  1: [
    'asdf jkl;',
    'the quick brown fox',
    'hello world',
    'abcd efgh ijkl',
    'qwer tyui opas',
  ],
  2: [
    'The quick brown fox jumps over the lazy dog',
    'Hello world this is a typing practice',
    'Programming is fun and creative',
    'Practice makes perfect every day',
    'Learn to code step by step',
  ],
  3: [
    'function variable class object array string condition loop',
    'Python Java JavaScript TypeScript Ruby Swift',
    'data algorithm structure programming coding',
    'input output process save load',
    'start stop run pause continue',
  ],
  4: [
    'Python is a powerful and easy-to-learn programming language. It is used in data analysis, web development, artificial intelligence, and many other fields.',
    'Learning to program improves logical thinking skills. You can develop the ability to analyze and solve problems effectively.',
    'Typing practice is fundamental to programming. Fast and accurate typing increases productivity significantly.',
    'Consistent practice is the key to improvement. Practice a little every day and you will make great progress.',
    'Coding is a wonderful activity that allows creativity. Try creating your own programs and applications.',
  ],
  5: [
    'Artificial intelligence technology is greatly changing our lives. It is being used in various fields such as speech recognition, image processing, and natural language processing, and is expected to develop further in the future.',
    'Web development is divided into frontend and backend. Frontend creates the screen that users see, and backend manages servers and databases. Both areas are important for modern applications.',
    'Data science is the study of collecting and analyzing data to find meaningful information. It requires statistics, programming, and domain knowledge, and is utilized in various industries worldwide.',
    'Participating in open source projects can improve your skills. It is a great opportunity to collaborate with other developers, receive code reviews, and learn new technologies and best practices.',
    'Programming languages are just tools. What matters is problem-solving ability and algorithmic thinking. If you learn one language deeply, you can easily learn other languages as well.',
  ],
};

// 랜덤 텍스트 생성 함수
export const getRandomTextForLevel = (language: 'korean' | 'english', level: number): string => {
  const pool = language === 'korean' ? koreanTextPool : englishTextPool;
  const texts = pool[level] || pool[1];
  const randomIndex = Math.floor(Math.random() * texts.length);
  return texts[randomIndex];
};

export const getLessonsByLanguage = (language: 'korean' | 'english'): TypingLesson[] => {
  return language === 'korean' ? koreanLessons : englishLessons;
};

export const getLessonById = (id: string): TypingLesson | undefined => {
  return allLessons.find(lesson => lesson.id === id);
};

