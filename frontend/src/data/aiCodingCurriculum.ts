export interface Activity {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  hint?: string;
}

export interface Level {
  level: number;
  title: string;
  concepts: string[];
  activities: Activity[];
}

export interface Curriculum {
  id: string;
  title: string;
  gradeLevel: 'elementary' | 'middle' | 'high';
  gradeLevelKorean: string;
  description: string;
  icon: string;
  color: string;
  levels: Level[];
}

// 핵심 개념 설명 사전
export const aiConceptExplanations: { [key: string]: string } = {
  "조건문": "if-else를 사용해서 컴퓨터가 상황에 따라 다른 행동을 하게 만듭니다.",
  "패턴 인식": "데이터에서 반복되는 규칙이나 특징을 찾아내는 것입니다.",
  "분류": "데이터를 정해진 카테고리로 나누는 것입니다. 예: 스팸/정상 메일 구분",
  "예측": "과거 데이터를 바탕으로 미래의 값을 추측하는 것입니다.",
  "챗봇": "사람과 대화할 수 있는 컴퓨터 프로그램입니다.",
  "자연어처리": "컴퓨터가 사람의 언어를 이해하고 처리하는 기술입니다.",
  "규칙기반": "미리 정해진 규칙에 따라 판단하는 방식입니다.",
  "머신러닝": "컴퓨터가 데이터로부터 스스로 학습하는 기술입니다.",
  "학습데이터": "AI가 학습하는 데 사용하는 예제 데이터입니다.",
  "정확도": "AI가 올바르게 예측한 비율입니다.",
  "특성(Feature)": "데이터를 설명하는 속성입니다. 예: 과일의 색상, 크기",
  "라벨(Label)": "데이터의 정답입니다. 예: 이 과일은 '사과'입니다.",
  "훈련(Training)": "AI 모델이 데이터로부터 패턴을 학습하는 과정입니다.",
  "테스트": "학습된 모델이 새로운 데이터에서 얼마나 잘 작동하는지 확인합니다.",
  "신경망": "뇌의 뉴런처럼 연결된 노드들로 이루어진 AI 모델입니다.",
  "딥러닝": "여러 층의 신경망을 사용하는 머신러닝 기법입니다.",
  "k-NN": "가장 가까운 k개의 이웃을 보고 분류하는 알고리즘입니다.",
  "결정트리": "질문을 통해 데이터를 분류하는 나무 모양의 모델입니다.",
  "과적합": "학습 데이터에만 너무 맞춰져서 새 데이터에는 잘 안 맞는 현상입니다.",
  "검증세트": "모델의 성능을 중간에 확인하기 위한 데이터입니다.",
  "하이퍼파라미터": "사람이 직접 설정하는 모델의 설정값입니다.",
  "손실함수": "모델의 예측이 얼마나 틀렸는지 측정하는 함수입니다.",
  "경사하강법": "손실을 줄이는 방향으로 모델을 조금씩 개선하는 방법입니다.",
  "판단": "조건에 따라 다른 결과를 선택하는 것입니다. if문으로 구현합니다.",
  "반복": "같은 작업을 여러 번 수행하는 것입니다. for, while 등으로 구현합니다.",
  "응답 생성": "입력에 맞는 적절한 대답을 만들어내는 것입니다.",
  "키워드 매칭": "특정 단어가 포함되어 있는지 확인하여 처리하는 방식입니다.",
  "추천": "사용자의 취향을 분석해서 좋아할 만한 것을 제안하는 것입니다.",
  "유사도": "두 데이터가 얼마나 비슷한지를 수치로 나타낸 것입니다.",
  "점수 계산": "여러 조건에 점수를 매겨 최종 결과를 결정하는 방식입니다.",
  "거리 계산": "두 점 사이의 거리를 구하는 것입니다. k-NN에서 가까운 이웃을 찾을 때 사용합니다.",
  "토큰화": "문장을 단어나 문자 단위로 나누는 것입니다. 자연어처리의 첫 단계입니다.",
  "단어 빈도": "텍스트에서 각 단어가 몇 번 나타나는지 세는 것입니다.",
  "특성 추출": "데이터에서 중요한 정보만 뽑아내는 것입니다.",
  "픽셀 분석": "이미지의 각 점(픽셀)의 색상값을 분석하는 것입니다.",
  "패턴 매칭": "데이터에서 특정 패턴을 찾아내는 것입니다.",
  "정보 이득": "어떤 특성으로 분류했을 때 얼마나 유용한지를 나타내는 값입니다.",
  "퍼셉트론": "가장 기본적인 인공 신경망 단위입니다. 입력을 받아 가중치를 곱하고 합산합니다.",
  "가중치": "각 입력의 중요도를 나타내는 숫자입니다. 학습 과정에서 조정됩니다.",
  "활성화 함수": "신경망의 출력을 결정하는 함수입니다. ReLU, Sigmoid 등이 있습니다.",
  "학습률": "모델이 한 번에 얼마나 많이 학습할지 결정하는 값입니다.",
  "순전파": "입력에서 출력으로 계산이 진행되는 과정입니다.",
  "역전파": "오류를 뒤로 전파하며 가중치를 조정하는 학습 방법입니다.",
  "엔트로피": "데이터의 불확실성을 측정하는 값입니다. 결정트리에서 분기 기준으로 사용됩니다.",
  "규칙 발견": "데이터에서 일정한 규칙이나 패턴을 찾아내는 과정입니다.",
};

// 초등학교 수준 커리큘럼
export const elementaryAICurriculum: Curriculum = {
  id: "ai-elementary",
  title: "AI 코딩",
  gradeLevel: "elementary",
  gradeLevelKorean: "초등학교",
  description: "규칙과 조건문으로 똑똑한 프로그램을 만들어요!",
  icon: "fi fi-rr-robot",
  color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  levels: [
    {
      level: 1,
      title: "조건으로 판단하기",
      concepts: ["조건문", "규칙기반", "판단"],
      activities: [
        {
          id: "ea1-1",
          title: "과일 분류기",
          description: "색깔로 과일을 분류해요.",
          starterCode: `# 색깔로 과일 맞추기
색깔 = "빨강"

if 색깔 == "빨강":
    print("사과일 것 같아요! 🍎")
elif 색깔 == "노랑":
    print("바나나일 것 같아요! 🍌")
elif 색깔 == "주황":
    print("오렌지일 것 같아요! 🍊")
else:
    print("무슨 과일일까요? 🤔")`,
          hint: "조건문으로 컴퓨터가 판단할 수 있어요!"
        },
        {
          id: "ea1-2",
          title: "점수 판정기",
          description: "점수에 따라 등급을 매겨요.",
          starterCode: `# 점수 등급 판정기
점수 = 85

if 점수 >= 90:
    등급 = "A"
elif 점수 >= 80:
    등급 = "B"
elif 점수 >= 70:
    등급 = "C"
else:
    등급 = "D"

print(f"점수: {점수}점")
print(f"등급: {등급}")`
        },
        {
          id: "ea1-3",
          title: "날씨 옷차림 추천",
          description: "기온에 맞는 옷을 추천해요.",
          starterCode: `# 날씨에 따른 옷차림 추천
기온 = 15

if 기온 >= 28:
    print(f"오늘 기온: {기온}도")
    print("추천: 반팔, 반바지 👕")
elif 기온 >= 20:
    print(f"오늘 기온: {기온}도")
    print("추천: 얇은 긴팔 👔")
elif 기온 >= 10:
    print(f"오늘 기온: {기온}도")
    print("추천: 자켓, 가디건 🧥")
else:
    print(f"오늘 기온: {기온}도")
    print("추천: 패딩, 두꺼운 외투 🧣")`
        }
      ]
    },
    {
      level: 2,
      title: "패턴 찾기",
      concepts: ["패턴 인식", "규칙 발견", "반복"],
      activities: [
        {
          id: "ea2-1",
          title: "숫자 패턴 찾기",
          description: "숫자 규칙을 발견해요.",
          starterCode: `# 숫자 패턴 찾기
숫자들 = [2, 4, 6, 8, 10]

print("숫자 패턴:", 숫자들)

# 규칙 찾기: 각 숫자 사이의 차이
print("\\n규칙 분석:")
for i in range(len(숫자들) - 1):
    차이 = 숫자들[i + 1] - 숫자들[i]
    print(f"{숫자들[i+1]} - {숫자들[i]} = {차이}")

# 다음 숫자 예측
다음 = 숫자들[-1] + 2
print(f"\\n다음 숫자 예측: {다음}")`,
          hint: "숫자들 사이의 규칙을 찾으면 다음 숫자를 예측할 수 있어요!"
        },
        {
          id: "ea2-2",
          title: "짝수/홀수 분류",
          description: "숫자를 짝수와 홀수로 분류해요.",
          starterCode: `# 짝수 홀수 분류기
숫자들 = [1, 4, 7, 2, 9, 6, 3, 8, 5]

짝수 = []
홀수 = []

for 숫자 in 숫자들:
    if 숫자 % 2 == 0:
        짝수.append(숫자)
    else:
        홀수.append(숫자)

print("원래 숫자:", 숫자들)
print("짝수:", 짝수)
print("홀수:", 홀수)`
        },
        {
          id: "ea2-3",
          title: "단어 길이 분류",
          description: "단어를 길이에 따라 분류해요.",
          starterCode: `# 단어 길이로 분류하기
단어들 = ["고양이", "강아지", "새", "코끼리", "뱀", "호랑이"]

짧은단어 = []  # 2글자 이하
긴단어 = []    # 3글자 이상

for 단어 in 단어들:
    길이 = len(단어)
    if 길이 <= 2:
        짧은단어.append(단어)
    else:
        긴단어.append(단어)

print("=== 단어 분류 결과 ===")
print("짧은 단어 (2글자 이하):", 짧은단어)
print("긴 단어 (3글자 이상):", 긴단어)`
        }
      ]
    },
    {
      level: 3,
      title: "간단한 챗봇 만들기",
      concepts: ["챗봇", "응답 생성", "키워드 매칭"],
      activities: [
        {
          id: "ea3-1",
          title: "인사 챗봇",
          description: "인사를 주고받는 챗봇을 만들어요.",
          starterCode: `# 간단한 인사 챗봇
def 챗봇_응답(입력):
    if "안녕" in 입력:
        return "안녕하세요! 반가워요! 😊"
    elif "이름" in 입력:
        return "저는 파이봇이에요! 🤖"
    elif "날씨" in 입력:
        return "오늘 날씨가 좋네요! ☀️"
    elif "잘가" in 입력 or "안녕히" in 입력:
        return "안녕히 가세요! 다음에 또 만나요! 👋"
    else:
        return "무슨 말인지 잘 모르겠어요. 🤔"

# 챗봇 테스트
print("=== 파이봇과 대화하기 ===")
대화들 = ["안녕", "이름이 뭐야?", "날씨 어때?", "잘가"]

for 말 in 대화들:
    print(f"나: {말}")
    print(f"봇: {챗봇_응답(말)}")
    print()`,
          hint: "키워드를 찾아서 적절한 응답을 해요!"
        },
        {
          id: "ea3-2",
          title: "퀴즈 챗봇",
          description: "문제를 내고 정답을 확인하는 챗봇이에요.",
          starterCode: `# 퀴즈 챗봇
import random

퀴즈 = [
    {"문제": "대한민국의 수도는?", "정답": "서울"},
    {"문제": "1 + 1은?", "정답": "2"},
    {"문제": "빨강 + 파랑 = ?", "정답": "보라"},
    {"문제": "지구에서 가장 큰 바다는?", "정답": "태평양"},
]

print("=== 퀴즈 챗봇 ===\\n")

점수 = 0
for q in 퀴즈:
    print(f"문제: {q['문제']}")
    # 실제로는 input()으로 받지만, 예시로 정답을 넣어요
    답 = q['정답']  # 정답으로 테스트

    if 답 == q['정답']:
        print(f"✅ 정답이에요!")
        점수 += 1
    else:
        print(f"❌ 틀렸어요. 정답은 {q['정답']}입니다.")
    print()

print(f"최종 점수: {점수}/{len(퀴즈)}")`
        },
        {
          id: "ea3-3",
          title: "감정 분석 챗봇",
          description: "말의 감정을 분석해요.",
          starterCode: `# 간단한 감정 분석
긍정_단어 = ["좋아", "행복", "기쁘", "최고", "사랑", "웃", "재미"]
부정_단어 = ["싫어", "슬프", "화나", "짜증", "우울", "힘들"]

def 감정_분석(문장):
    긍정_점수 = 0
    부정_점수 = 0

    for 단어 in 긍정_단어:
        if 단어 in 문장:
            긍정_점수 += 1

    for 단어 in 부정_단어:
        if 단어 in 문장:
            부정_점수 += 1

    if 긍정_점수 > 부정_점수:
        return "긍정 😊", 긍정_점수
    elif 부정_점수 > 긍정_점수:
        return "부정 😢", 부정_점수
    else:
        return "중립 😐", 0

# 테스트
문장들 = [
    "오늘 정말 행복하고 기분이 좋아!",
    "시험이 너무 힘들고 슬프다",
    "그냥 그래",
    "친구와 놀아서 재미있었어"
]

print("=== 감정 분석 결과 ===")
for 문장 in 문장들:
    감정, 점수 = 감정_분석(문장)
    print(f"'{문장}'")
    print(f"  → 감정: {감정}\\n")`
        }
      ]
    },
    {
      level: 4,
      title: "추천 시스템 만들기",
      concepts: ["추천", "유사도", "점수 계산"],
      activities: [
        {
          id: "ea4-1",
          title: "책 추천 시스템",
          description: "취향에 맞는 책을 추천해요.",
          starterCode: `# 간단한 책 추천 시스템
책들 = [
    {"제목": "해리포터", "장르": "판타지", "레벨": "중급"},
    {"제목": "어린왕자", "장르": "동화", "레벨": "초급"},
    {"제목": "그리스로마신화", "장르": "신화", "레벨": "중급"},
    {"제목": "과학이야기", "장르": "과학", "레벨": "초급"},
    {"제목": "마법사의돌", "장르": "판타지", "레벨": "초급"},
]

# 사용자 선호도
좋아하는_장르 = "판타지"
선호_레벨 = "초급"

print(f"=== {좋아하는_장르} 장르, {선호_레벨} 레벨 책 추천 ===\\n")

추천_책 = []
for 책 in 책들:
    점수 = 0
    if 책["장르"] == 좋아하는_장르:
        점수 += 2
    if 책["레벨"] == 선호_레벨:
        점수 += 1

    if 점수 > 0:
        추천_책.append((책["제목"], 점수))

# 점수순 정렬
추천_책.sort(key=lambda x: x[1], reverse=True)

for 제목, 점수 in 추천_책:
    별 = "⭐" * 점수
    print(f"{제목}: {별}")`,
          hint: "조건에 맞으면 점수를 주고, 점수가 높은 순서로 추천해요!"
        },
        {
          id: "ea4-2",
          title: "게임 캐릭터 추천",
          description: "성향에 맞는 게임 캐릭터를 추천해요.",
          starterCode: `# 게임 캐릭터 추천
캐릭터들 = [
    {"이름": "전사", "스타일": "공격", "체력": "높음", "이모지": "⚔️"},
    {"이름": "마법사", "스타일": "마법", "체력": "낮음", "이모지": "🧙"},
    {"이름": "힐러", "스타일": "지원", "체력": "중간", "이모지": "💚"},
    {"이름": "궁수", "스타일": "공격", "체력": "중간", "이모지": "🏹"},
    {"이름": "탱커", "스타일": "방어", "체력": "높음", "이모지": "🛡️"},
]

# 성향 테스트 결과 (예시)
선호_스타일 = "공격"
선호_체력 = "높음"

print("=== 나에게 맞는 캐릭터는? ===\\n")

for 캐릭터 in 캐릭터들:
    매칭 = 0
    if 캐릭터["스타일"] == 선호_스타일:
        매칭 += 1
    if 캐릭터["체력"] == 선호_체력:
        매칭 += 1

    if 매칭== 2:
        print(f"{캐릭터['이모지']} {캐릭터['이름']} - 완벽한 매칭! ⭐⭐")
    elif 매칭 == 1:
        print(f"{캐릭터['이모지']} {캐릭터['이름']} - 괜찮은 선택 ⭐")`
        }
      ]
    }
  ]
};

// 중학교 수준 커리큘럼
export const middleAICurriculum: Curriculum = {
  id: "ai-middle",
  title: "AI 코딩",
  gradeLevel: "middle",
  gradeLevelKorean: "중학교",
  description: "머신러닝의 기초 개념을 배워요!",
  icon: "fi fi-rr-brain",
  color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  levels: [
    {
      level: 1,
      title: "머신러닝이란?",
      concepts: ["머신러닝", "학습데이터", "예측"],
      activities: [
        {
          id: "ma1-1",
          title: "데이터로 배우는 AI",
          description: "AI가 데이터로부터 배우는 과정을 이해해요.",
          starterCode: `# AI가 학습하는 과정 시뮬레이션
print("=== AI 학습 과정 ===\\n")

# 학습 데이터: 키와 몸무게
학습_데이터 = [
    {"키": 160, "몸무게": 55, "체형": "보통"},
    {"키": 170, "몸무게": 80, "체형": "과체중"},
    {"키": 155, "몸무게": 45, "체형": "저체중"},
    {"키": 175, "몸무게": 70, "체형": "보통"},
    {"키": 165, "몸무게": 85, "체형": "과체중"},
]

print("1. 학습 데이터 확인:")
for 데이터 in 학습_데이터:
    print(f"   키 {데이터['키']}cm, 몸무게 {데이터['몸무게']}kg → {데이터['체형']}")

# 간단한 규칙 발견 (BMI 계산)
print("\\n2. AI가 패턴을 발견:")
print("   → 키와 몸무게의 비율(BMI)로 체형을 판단할 수 있어!")

# 새로운 데이터 예측
새_키 = 168
새_몸무게 = 75
BMI = 새_몸무게 / (새_키/100)**2

print(f"\\n3. 새로운 사람 예측:")
print(f"   키: {새_키}cm, 몸무게: {새_몸무게}kg")
print(f"   BMI: {BMI:.1f}")

if BMI < 18.5:
    print("   예측: 저체중")
elif BMI < 25:
    print("   예측: 보통")
else:
    print("   예측: 과체중")`,
          hint: "AI는 데이터에서 패턴을 찾아 새로운 데이터를 예측해요!"
        },
        {
          id: "ma1-2",
          title: "학습과 테스트",
          description: "데이터를 학습용과 테스트용으로 나눠요.",
          starterCode: `import random

# 전체 데이터
전체_데이터 = [
    (150, "어린이"), (155, "어린이"), (160, "청소년"),
    (165, "청소년"), (170, "성인"), (175, "성인"),
    (180, "성인"), (145, "어린이"), (158, "청소년"),
    (172, "성인")
]

# 데이터 섞기
random.seed(42)
random.shuffle(전체_데이터)

# 학습용 70%, 테스트용 30%
분할점 = int(len(전체_데이터) * 0.7)
학습_데이터 = 전체_데이터[:분할점]
테스트_데이터 = 전체_데이터[분할점:]

print("=== 데이터 분할 ===")
print(f"전체: {len(전체_데이터)}개")
print(f"학습용: {len(학습_데이터)}개")
print(f"테스트용: {len(테스트_데이터)}개")

print("\\n학습 데이터:")
for 키, 분류 in 학습_데이터:
    print(f"  {키}cm → {분류}")

print("\\n테스트 데이터:")
for 키, 분류 in 테스트_데이터:
    print(f"  {키}cm → ???")`
        },
        {
          id: "ma1-3",
          title: "정확도 계산하기",
          description: "AI 모델의 정확도를 계산해요.",
          starterCode: `# 간단한 분류 모델의 정확도 계산
def 분류_예측(키):
    if 키 < 158:
        return "어린이"
    elif 키 < 168:
        return "청소년"
    else:
        return "성인"

# 테스트 데이터 (실제 정답이 있음)
테스트 = [
    (155, "어린이"),
    (163, "청소년"),
    (175, "성인"),
    (148, "어린이"),
    (170, "성인"),
]

print("=== 모델 평가 ===\\n")

맞은_개수 = 0
for 키, 정답 in 테스트:
    예측 = 분류_예측(키)
    정답여부 = "✅" if 예측 == 정답 else "❌"
    if 예측 == 정답:
        맞은_개수 += 1
    print(f"키 {키}cm: 예측={예측}, 정답={정답} {정답여부}")

정확도 = 맞은_개수 / len(테스트) * 100
print(f"\\n정확도: {맞은_개수}/{len(테스트)} = {정확도:.1f}%")`
        }
      ]
    },
    {
      level: 2,
      title: "k-최근접 이웃 (k-NN)",
      concepts: ["k-NN", "거리 계산", "분류"],
      activities: [
        {
          id: "ma2-1",
          title: "거리로 분류하기",
          description: "가장 가까운 이웃을 찾아 분류해요.",
          starterCode: `import math

# 학습 데이터: (x, y, 라벨)
학습_데이터 = [
    (1, 1, "A"), (2, 1, "A"), (1, 2, "A"),
    (5, 5, "B"), (6, 5, "B"), (5, 6, "B"),
]

def 거리_계산(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

# 새로운 점
새_점 = (2, 2)

print("=== k-NN 분류 ===")
print(f"새로운 점: {새_점}\\n")

# 모든 점과의 거리 계산
거리들 = []
for x, y, 라벨 in 학습_데이터:
    d = 거리_계산(새_점, (x, y))
    거리들.append((d, 라벨))
    print(f"({x},{y}) {라벨}: 거리 = {d:.2f}")

# 거리순 정렬
거리들.sort()
print(f"\\n가장 가까운 점: {거리들[0][1]} (거리: {거리들[0][0]:.2f})")`,
          hint: "새로운 점과 가장 가까운 점의 라벨로 분류해요!"
        },
        {
          id: "ma2-2",
          title: "k=3 으로 투표하기",
          description: "가장 가까운 3개의 이웃으로 다수결 투표해요.",
          starterCode: `import math

학습_데이터 = [
    (1, 1, "사과"), (2, 1, "사과"), (1, 2, "사과"),
    (4, 4, "오렌지"), (5, 4, "오렌지"),
    (3, 3, "사과"), (4, 3, "오렌지"),
]

def 거리(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

def knn_분류(새_점, k=3):
    거리들 = []
    for x, y, 라벨 in 학습_데이터:
        d = 거리(새_점, (x, y))
        거리들.append((d, 라벨))

    거리들.sort()
    k_이웃 = 거리들[:k]

    # 투표
    투표 = {}
    for _, 라벨 in k_이웃:
        투표[라벨] = 투표.get(라벨, 0) + 1

    return k_이웃, max(투표, key=투표.get)

새_점 = (3, 2)
k = 3

print(f"=== k-NN (k={k}) ===")
print(f"새로운 점: {새_점}\\n")

이웃들, 결과 = knn_분류(새_점, k)

print(f"가장 가까운 {k}개 이웃:")
for 거리값, 라벨 in 이웃들:
    print(f"  {라벨} (거리: {거리값:.2f})")

print(f"\\n분류 결과: {결과}")`
        },
        {
          id: "ma2-3",
          title: "붓꽃 분류하기",
          description: "꽃잎 크기로 붓꽃 종류를 분류해요.",
          starterCode: `import math
import random

# 붓꽃 데이터 (꽃잎길이, 꽃잎폭, 종류)
붓꽃_데이터 = [
    (1.4, 0.2, "setosa"), (1.5, 0.2, "setosa"),
    (1.3, 0.2, "setosa"), (1.5, 0.1, "setosa"),
    (4.5, 1.5, "versicolor"), (4.7, 1.4, "versicolor"),
    (4.0, 1.3, "versicolor"), (4.6, 1.5, "versicolor"),
    (6.0, 2.5, "virginica"), (5.8, 2.2, "virginica"),
    (6.1, 2.3, "virginica"), (5.9, 2.1, "virginica"),
]

def 거리(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

def knn(새_점, k=3):
    거리들 = [(거리(새_점, (x, y)), 종류) for x, y, 종류 in 붓꽃_데이터]
    거리들.sort()

    투표 = {}
    for _, 종류 in 거리들[:k]:
        투표[종류] = 투표.get(종류, 0) + 1

    return max(투표, key=투표.get)

# 테스트
테스트_데이터 = [(1.6, 0.2), (4.3, 1.4), (5.7, 2.0)]

print("=== 붓꽃 분류 (k-NN) ===\\n")
for 길이, 폭 in 테스트_데이터:
    예측 = knn((길이, 폭), k=3)
    print(f"꽃잎 길이: {길이}, 폭: {폭}")
    print(f"→ 예측: {예측}\\n")`
        }
      ]
    },
    {
      level: 3,
      title: "자연어 처리 기초",
      concepts: ["자연어처리", "토큰화", "단어 빈도"],
      activities: [
        {
          id: "ma3-1",
          title: "단어 빈도 분석",
          description: "문장에서 단어 빈도를 분석해요.",
          starterCode: `# 단어 빈도 분석
문장 = "파이썬은 재미있다 파이썬으로 AI를 만들 수 있다 AI는 재미있다"

# 단어 분리 (토큰화)
단어들 = 문장.split()

# 빈도 계산
빈도 = {}
for 단어 in 단어들:
    빈도[단어] = 빈도.get(단어, 0) + 1

print("=== 단어 빈도 분석 ===\\n")
print(f"원문: {문장}\\n")
print("단어 빈도:")

# 빈도순 정렬
정렬된 = sorted(빈도.items(), key=lambda x: x[1], reverse=True)
for 단어, 횟수 in 정렬된:
    막대 = "█" * 횟수
    print(f"  {단어}: {막대} ({횟수}회)")`,
          hint: "문장을 단어로 나누고 각 단어가 몇 번 나왔는지 세요!"
        },
        {
          id: "ma3-2",
          title: "스팸 필터",
          description: "키워드로 스팸 메시지를 분류해요.",
          starterCode: `# 스팸 필터
스팸_키워드 = ["광고", "무료", "당첨", "할인", "클릭", "이벤트", "경품"]
햄_키워드 = ["안녕", "감사", "부탁", "회의", "프로젝트", "업무"]

def 스팸_점수(메시지):
    스팸점수 = 0
    햄점수 = 0

    for 키워드 in 스팸_키워드:
        if 키워드 in 메시지:
            스팸점수 += 1

    for 키워드 in 햄_키워드:
        if 키워드 in 메시지:
            햄점수 += 1

    return 스팸점수, 햄점수

메시지들 = [
    "축하합니다! 무료 경품 당첨! 클릭하세요!",
    "안녕하세요, 내일 회의 부탁드립니다.",
    "특별 할인 이벤트! 광고입니다!",
    "프로젝트 진행 상황 보고드립니다. 감사합니다.",
]

print("=== 스팸 필터 ===\\n")
for 메시지 in 메시지들:
    스팸, 햄 = 스팸_점수(메시지)
    판정 = "🚫 스팸" if 스팸 > 햄 else "✅ 정상"
    print(f"[{판정}] {메시지}")
    print(f"    (스팸점수: {스팸}, 정상점수: {햄})\\n")`
        },
        {
          id: "ma3-3",
          title: "문장 유사도",
          description: "두 문장이 얼마나 비슷한지 계산해요.",
          starterCode: `# 문장 유사도 계산 (자카드 유사도)
def 단어_집합(문장):
    return set(문장.replace(".", "").replace(",", "").split())

def 자카드_유사도(문장1, 문장2):
    집합1 = 단어_집합(문장1)
    집합2 = 단어_집합(문장2)

    교집합 = 집합1 & 집합2
    합집합 = 집합1 | 집합2

    return len(교집합) / len(합집합)

문장들 = [
    "오늘 날씨가 좋다",
    "오늘 날씨가 정말 좋다",
    "내일은 비가 올 것 같다",
    "오늘 기분이 좋다",
]

기준_문장 = 문장들[0]
print(f"기준 문장: '{기준_문장}'\\n")
print("=== 문장 유사도 ===\\n")

for 문장 in 문장들[1:]:
    유사도 = 자카드_유사도(기준_문장, 문장)
    막대 = "█" * int(유사도 * 10)
    print(f"'{문장}'")
    print(f"  유사도: {막대} {유사도:.1%}\\n")`
        }
      ]
    },
    {
      level: 4,
      title: "이미지 분류 개념",
      concepts: ["특성 추출", "픽셀 분석", "패턴 매칭"],
      activities: [
        {
          id: "ma4-1",
          title: "숫자 이미지 인식",
          description: "간단한 숫자 패턴을 인식해요.",
          starterCode: `# 간단한 숫자 인식 (5x5 그리드)
숫자_1 = [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
]

숫자_0 = [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
]

def 이미지_출력(이미지, 이름):
    print(f"=== {이름} ===")
    for 행 in 이미지:
        print("".join("█" if p else " " for p in 행))
    print()

def 픽셀_수(이미지):
    return sum(sum(행) for 행 in 이미지)

def 가운데_세로줄(이미지):
    return sum(이미지[i][2] for i in range(5))

이미지_출력(숫자_1, "숫자 1")
이미지_출력(숫자_0, "숫자 0")

print("=== 특성 분석 ===")
print(f"숫자 1: 픽셀 수={픽셀_수(숫자_1)}, 가운데줄={가운데_세로줄(숫자_1)}")
print(f"숫자 0: 픽셀 수={픽셀_수(숫자_0)}, 가운데줄={가운데_세로줄(숫자_0)}")

print("\\n→ 숫자 1은 픽셀 수가 적고, 가운데 세로줄이 채워져 있어요!")`,
          hint: "이미지의 특성(픽셀 수, 위치 등)을 추출해서 분류할 수 있어요!"
        },
        {
          id: "ma4-2",
          title: "패턴 매칭으로 분류",
          description: "이미지 패턴을 비교해서 분류해요.",
          starterCode: `# 패턴 매칭으로 숫자 분류
템플릿 = {
    "1": [[0,1,0], [1,1,0], [0,1,0], [0,1,0], [1,1,1]],
    "7": [[1,1,1], [0,0,1], [0,1,0], [0,1,0], [0,1,0]],
    "4": [[1,0,1], [1,0,1], [1,1,1], [0,0,1], [0,0,1]],
}

def 유사도(이미지1, 이미지2):
    일치 = 0
    전체 = 0
    for i in range(len(이미지1)):
        for j in range(len(이미지1[0])):
            전체 += 1
            if 이미지1[i][j] == 이미지2[i][j]:
                일치 += 1
    return 일치 / 전체

# 테스트 이미지 (약간 변형된 7)
테스트 = [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 0],
    [1, 1, 0],  # 약간 다름
    [0, 1, 0],
]

print("=== 테스트 이미지 ===")
for 행 in 테스트:
    print("".join("█" if p else " " for p in 행))

print("\\n=== 템플릿 매칭 ===")
최고_유사도 = 0
예측_숫자 = None

for 숫자, 템플릿_이미지 in 템플릿.items():
    유사 = 유사도(테스트, 템플릿_이미지)
    print(f"숫자 {숫자}: 유사도 {유사:.1%}")
    if 유사 > 최고_유사도:
        최고_유사도 = 유사
        예측_숫자 = 숫자

print(f"\\n→ 예측 결과: {예측_숫자}")`
        }
      ]
    }
  ]
};

// 고등학교 수준 커리큘럼
export const highAICurriculum: Curriculum = {
  id: "ai-high",
  title: "AI 코딩",
  gradeLevel: "high",
  gradeLevelKorean: "고등학교",
  description: "신경망과 딥러닝의 원리를 이해해요!",
  icon: "fi fi-rr-head-side-brain",
  color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  levels: [
    {
      level: 1,
      title: "결정 트리",
      concepts: ["결정트리", "정보 이득", "엔트로피"],
      activities: [
        {
          id: "ha1-1",
          title: "스무고개 게임",
          description: "결정 트리로 스무고개 게임을 만들어요.",
          starterCode: `# 스무고개 - 결정 트리 원리
class 결정노드:
    def __init__(self, 질문, 예_답=None, 아니오_답=None):
        self.질문 = 질문
        self.예 = 예_답
        self.아니오 = 아니오_답

# 동물 맞추기 결정 트리
동물_트리 = 결정노드(
    "다리가 4개인가요?",
    예_답=결정노드(
        "짖을 수 있나요?",
        예_답="강아지 🐕",
        아니오_답="고양이 🐱"
    ),
    아니오_답=결정노드(
        "날 수 있나요?",
        예_답="새 🐦",
        아니오_답="뱀 🐍"
    )
)

def 예측(노드, 응답들, idx=0):
    if isinstance(노드, str):
        return 노드

    print(f"Q: {노드.질문}")
    답 = 응답들[idx]
    print(f"A: {'예' if 답 else '아니오'}\\n")

    if 답:
        return 예측(노드.예, 응답들, idx + 1)
    else:
        return 예측(노드.아니오, 응답들, idx + 1)

print("=== 동물 맞추기 게임 ===\\n")

# 테스트 케이스: [다리4개?, 짖음?/날수있음?]
테스트 = [
    ([True, True], "강아지를 생각했어요"),
    ([True, False], "고양이를 생각했어요"),
    ([False, True], "새를 생각했어요"),
]

for 응답, 설명 in 테스트:
    print(f"--- {설명} ---")
    결과 = 예측(동물_트리, 응답)
    print(f"예측: {결과}\\n")`,
          hint: "결정 트리는 질문에 따라 가지가 나뉘면서 결과를 찾아요!"
        },
        {
          id: "ha1-2",
          title: "엔트로피 계산",
          description: "데이터의 불확실성(엔트로피)을 계산해요.",
          starterCode: `import math

def 엔트로피(라벨들):
    """데이터의 불확실성을 계산"""
    전체 = len(라벨들)
    if 전체 == 0:
        return 0

    빈도 = {}
    for 라벨 in 라벨들:
        빈도[라벨] = 빈도.get(라벨, 0) + 1

    엔트로피값 = 0
    for 개수 in 빈도.values():
        p = 개수 / 전체
        if p > 0:
            엔트로피값 -= p * math.log2(p)

    return 엔트로피값

# 예시 데이터셋
print("=== 엔트로피 계산 ===\\n")

# Case 1: 완전히 섞임
데이터1 = ["A", "B", "A", "B", "A", "B"]
e1 = 엔트로피(데이터1)
print(f"데이터: {데이터1}")
print(f"엔트로피: {e1:.3f} (높음 = 불확실)\\n")

# Case 2: 한쪽에 치우침
데이터2 = ["A", "A", "A", "A", "A", "B"]
e2 = 엔트로피(데이터2)
print(f"데이터: {데이터2}")
print(f"엔트로피: {e2:.3f} (중간)\\n")

# Case 3: 완전히 순수
데이터3 = ["A", "A", "A", "A", "A", "A"]
e3 = 엔트로피(데이터3)
print(f"데이터: {데이터3}")
print(f"엔트로피: {e3:.3f} (낮음 = 확실)\\n")

print("→ 엔트로피가 낮을수록 데이터가 순수해요!")`
        }
      ]
    },
    {
      level: 2,
      title: "퍼셉트론 - 신경망의 기초",
      concepts: ["퍼셉트론", "가중치", "활성화 함수"],
      activities: [
        {
          id: "ha2-1",
          title: "퍼셉트론 이해하기",
          description: "가장 간단한 신경망 - 퍼셉트론을 이해해요.",
          starterCode: `# 퍼셉트론 (단일 뉴런)
def 퍼셉트론(입력들, 가중치들, 편향):
    """
    퍼셉트론 = 입력 × 가중치의 합 + 편향
    결과가 0보다 크면 1, 아니면 0
    """
    합계 = 편향
    for x, w in zip(입력들, 가중치들):
        합계 += x * w

    # 활성화 함수 (스텝 함수)
    return 1 if 합계 > 0 else 0

# AND 게이트 구현
print("=== AND 게이트 (퍼셉트론) ===\\n")
가중치 = [0.5, 0.5]
편향 = -0.7

테스트 = [(0, 0), (0, 1), (1, 0), (1, 1)]

for x1, x2 in 테스트:
    결과 = 퍼셉트론([x1, x2], 가중치, 편향)
    print(f"입력: ({x1}, {x2}) → 출력: {결과}")

print("\\n가중치:", 가중치)
print("편향:", 편향)
print("\\n→ 두 입력이 모두 1일 때만 출력이 1!")`,
          hint: "퍼셉트론은 입력에 가중치를 곱하고 더해서 결과를 만들어요!"
        },
        {
          id: "ha2-2",
          title: "논리 게이트 구현",
          description: "OR, NAND 게이트를 퍼셉트론으로 구현해요.",
          starterCode: `def 퍼셉트론(x, 가중치, 편향):
    합계 = 편향
    for xi, wi in zip(x, 가중치):
        합계 += xi * wi
    return 1 if 합계 > 0 else 0

# AND 게이트
def AND(x1, x2):
    return 퍼셉트론([x1, x2], [0.5, 0.5], -0.7)

# OR 게이트
def OR(x1, x2):
    return 퍼셉트론([x1, x2], [0.5, 0.5], -0.2)

# NAND 게이트
def NAND(x1, x2):
    return 퍼셉트론([x1, x2], [-0.5, -0.5], 0.7)

테스트 = [(0, 0), (0, 1), (1, 0), (1, 1)]

print("=== 논리 게이트 진리표 ===\\n")
print("x1 | x2 | AND | OR  | NAND")
print("-" * 30)

for x1, x2 in 테스트:
    print(f" {x1} |  {x2} |  {AND(x1,x2)}  |  {OR(x1,x2)} |   {NAND(x1,x2)}")

print("\\n→ 가중치와 편향을 바꾸면 다른 논리 게이트가 됩니다!")`
        },
        {
          id: "ha2-3",
          title: "XOR - 다층 퍼셉트론",
          description: "XOR 문제를 다층 퍼셉트론으로 해결해요.",
          starterCode: `def 퍼셉트론(x, 가중치, 편향):
    합계 = 편향
    for xi, wi in zip(x, 가중치):
        합계 += xi * wi
    return 1 if 합계 > 0 else 0

def AND(x1, x2):
    return 퍼셉트론([x1, x2], [0.5, 0.5], -0.7)

def OR(x1, x2):
    return 퍼셉트론([x1, x2], [0.5, 0.5], -0.2)

def NAND(x1, x2):
    return 퍼셉트론([x1, x2], [-0.5, -0.5], 0.7)

# XOR = (NAND) AND (OR)
def XOR(x1, x2):
    s1 = NAND(x1, x2)  # 첫 번째 층
    s2 = OR(x1, x2)    # 첫 번째 층
    return AND(s1, s2)  # 두 번째 층

print("=== XOR 게이트 (다층 퍼셉트론) ===\\n")
print("XOR = (NAND) AND (OR)\\n")

print("x1 | x2 | NAND | OR | XOR")
print("-" * 30)

for x1, x2 in [(0,0), (0,1), (1,0), (1,1)]:
    nand = NAND(x1, x2)
    or_val = OR(x1, x2)
    xor = XOR(x1, x2)
    print(f" {x1} |  {x2} |   {nand}  |  {or_val} |  {xor}")

print("\\n→ 단일 퍼셉트론으로는 불가능하지만,")
print("   여러 층을 쌓으면 XOR을 구현할 수 있어요!")`
        }
      ]
    },
    {
      level: 3,
      title: "경사 하강법",
      concepts: ["손실함수", "경사하강법", "학습률"],
      activities: [
        {
          id: "ha3-1",
          title: "손실 함수 이해하기",
          description: "예측이 얼마나 틀렸는지 측정해요.",
          starterCode: `# 평균 제곱 오차 (MSE) 손실 함수
def MSE손실(예측값들, 실제값들):
    n = len(예측값들)
    오차합 = 0
    for 예측, 실제 in zip(예측값들, 실제값들):
        오차합 += (예측 - 실제) ** 2
    return 오차합 / n

# 예시: 집값 예측
실제_집값 = [3.0, 4.5, 5.0, 6.0, 7.5]  # 억원

# 모델 A의 예측
예측_A = [2.8, 4.3, 5.2, 5.8, 7.3]

# 모델 B의 예측 (더 안 좋음)
예측_B = [2.0, 3.5, 6.0, 5.0, 8.5]

print("=== 손실 함수 비교 ===\\n")
print("실제 집값:", 실제_집값)
print()

손실_A = MSE손실(예측_A, 실제_집값)
손실_B = MSE손실(예측_B, 실제_집값)

print(f"모델 A 예측: {예측_A}")
print(f"모델 A 손실(MSE): {손실_A:.4f}")
print()
print(f"모델 B 예측: {예측_B}")
print(f"모델 B 손실(MSE): {손실_B:.4f}")
print()
print(f"→ 모델 {'A' if 손실_A < 손실_B else 'B'}가 더 좋습니다!")`,
          hint: "손실이 작을수록 예측이 정확해요!"
        },
        {
          id: "ha3-2",
          title: "경사 하강법 시각화",
          description: "손실을 줄이는 방향으로 학습해요.",
          starterCode: `# 간단한 경사 하강법
# 목표: y = 2x + 1 찾기

import random

# 학습 데이터
X = [1, 2, 3, 4, 5]
Y = [3, 5, 7, 9, 11]  # y = 2x + 1

# 초기 파라미터 (랜덤)
w = random.uniform(-1, 1)  # 기울기
b = random.uniform(-1, 1)  # 절편

학습률 = 0.01
반복횟수 = 100

print("=== 경사 하강법 ===\\n")
print(f"목표: y = 2x + 1")
print(f"초기: y = {w:.3f}x + {b:.3f}")
print()

for epoch in range(반복횟수):
    # 예측
    예측 = [w * x + b for x in X]

    # 손실 계산 (MSE)
    손실 = sum((p - y) ** 2 for p, y in zip(예측, Y)) / len(Y)

    # 기울기 계산
    dw = sum(2 * (w * x + b - y) * x for x, y in zip(X, Y)) / len(X)
    db = sum(2 * (w * x + b - y) for x, y in zip(X, Y)) / len(X)

    # 파라미터 업데이트
    w -= 학습률 * dw
    b -= 학습률 * db

    if epoch % 20 == 0:
        print(f"에폭 {epoch:3d}: 손실={손실:.4f}, w={w:.3f}, b={b:.3f}")

print()
print(f"최종: y = {w:.3f}x + {b:.3f}")
print(f"실제: y = 2.000x + 1.000")`
        },
        {
          id: "ha3-3",
          title: "학습률의 중요성",
          description: "학습률에 따른 학습 과정을 비교해요.",
          starterCode: `# 학습률 비교 실험
def 경사하강(학습률, 초기값=10.0, 반복=20):
    """
    f(x) = x^2 의 최솟값 찾기
    미분: f'(x) = 2x
    최솟값: x = 0
    """
    x = 초기값
    이력 = [x]

    for _ in range(반복):
        기울기 = 2 * x
        x = x - 학습률 * 기울기
        이력.append(x)

    return 이력

print("=== 학습률 비교 ===")
print("목표: f(x) = x² 의 최솟값 (x=0)\\n")

학습률들 = [0.01, 0.1, 0.5, 0.9]

for lr in 학습률들:
    이력 = 경사하강(lr, 초기값=10.0, 반복=10)
    print(f"학습률 {lr}:")
    print(f"  시작: {이력[0]:.2f}")
    print(f"  5번째: {이력[5]:.2f}")
    print(f"  최종: {이력[-1]:.2f}")

    if abs(이력[-1]) < 0.1:
        print("  → 잘 수렴!")
    elif abs(이력[-1]) > abs(이력[0]):
        print("  → 발산! 학습률이 너무 큼")
    else:
        print("  → 느린 수렴. 학습률이 작음")
    print()`
        }
      ]
    },
    {
      level: 4,
      title: "신경망 구현",
      concepts: ["신경망", "순전파", "역전파"],
      activities: [
        {
          id: "ha4-1",
          title: "활성화 함수",
          description: "다양한 활성화 함수를 이해해요.",
          starterCode: `import math

def sigmoid(x):
    """S자 곡선, 0~1 사이 출력"""
    return 1 / (1 + math.exp(-x))

def relu(x):
    """음수는 0, 양수는 그대로"""
    return max(0, x)

def tanh(x):
    """S자 곡선, -1~1 사이 출력"""
    return math.tanh(x)

print("=== 활성화 함수 비교 ===\\n")

입력값들 = [-3, -1, 0, 1, 3]

print("입력 | Sigmoid | ReLU  | Tanh")
print("-" * 40)

for x in 입력값들:
    s = sigmoid(x)
    r = relu(x)
    t = tanh(x)
    print(f" {x:2d}  |  {s:.3f}  | {r:.1f}   | {t:+.3f}")

print("\\n특징:")
print("- Sigmoid: 출력이 0~1, 이진 분류에 적합")
print("- ReLU: 계산이 빠르고, 딥러닝에서 많이 사용")
print("- Tanh: 출력이 -1~1, 중심이 0")`
        },
        {
          id: "ha4-2",
          title: "2층 신경망",
          description: "입력층-은닉층-출력층 신경망을 구현해요.",
          starterCode: `import math
import random

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-500, min(500, x))))

def sigmoid_미분(x):
    return x * (1 - x)

# 2층 신경망: XOR 문제 해결
random.seed(42)

# 가중치 초기화
w_은닉 = [[random.uniform(-1, 1) for _ in range(2)] for _ in range(2)]
b_은닉 = [random.uniform(-1, 1) for _ in range(2)]
w_출력 = [random.uniform(-1, 1) for _ in range(2)]
b_출력 = random.uniform(-1, 1)

# XOR 학습 데이터
X = [[0, 0], [0, 1], [1, 0], [1, 1]]
Y = [0, 1, 1, 0]

학습률 = 0.5

print("=== 2층 신경망으로 XOR 학습 ===\\n")

for epoch in range(5000):
    총손실 = 0

    for x, y_실제 in zip(X, Y):
        # 순전파
        은닉 = []
        for i in range(2):
            z = b_은닉[i]
            for j in range(2):
                z += x[j] * w_은닉[i][j]
            은닉.append(sigmoid(z))

        z_출력 = b_출력
        for i in range(2):
            z_출력 += 은닉[i] * w_출력[i]
        y_예측 = sigmoid(z_출력)

        # 손실
        총손실 += (y_예측 - y_실제) ** 2

        # 역전파
        출력_오차 = (y_예측 - y_실제) * sigmoid_미분(y_예측)

        for i in range(2):
            w_출력[i] -= 학습률 * 출력_오차 * 은닉[i]
        b_출력 -= 학습률 * 출력_오차

        for i in range(2):
            은닉_오차 = 출력_오차 * w_출력[i] * sigmoid_미분(은닉[i])
            for j in range(2):
                w_은닉[i][j] -= 학습률 * 은닉_오차 * x[j]
            b_은닉[i] -= 학습률 * 은닉_오차

    if epoch % 1000 == 0:
        print(f"에폭 {epoch}: 손실 = {총손실:.4f}")

# 결과 확인
print("\\n=== 학습 결과 ===")
for x, y_실제 in zip(X, Y):
    은닉 = []
    for i in range(2):
        z = b_은닉[i] + sum(x[j] * w_은닉[i][j] for j in range(2))
        은닉.append(sigmoid(z))

    z_출력 = b_출력 + sum(은닉[i] * w_출력[i] for i in range(2))
    y_예측 = sigmoid(z_출력)

    print(f"{x} → 예측: {y_예측:.3f}, 실제: {y_실제}")`
        }
      ]
    }
  ]
};

// 전체 커리큘럼 배열
export const allAICurriculums = [
  elementaryAICurriculum,
  middleAICurriculum,
  highAICurriculum
];
