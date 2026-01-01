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
export const dataConceptExplanations: { [key: string]: string } = {
  "리스트": "여러 개의 데이터를 순서대로 저장하는 상자입니다. [1, 2, 3]처럼 대괄호로 만듭니다.",
  "평균": "모든 숫자를 더한 후 개수로 나눈 값입니다. 데이터의 대표값을 알 수 있습니다.",
  "합계": "모든 숫자를 더한 값입니다. sum() 함수로 쉽게 구할 수 있습니다.",
  "최댓값/최솟값": "데이터 중 가장 큰 값과 가장 작은 값입니다. max(), min() 함수를 사용합니다.",
  "막대그래프": "데이터의 크기를 막대의 길이로 나타내는 그래프입니다.",
  "원그래프": "전체에서 각 부분이 차지하는 비율을 원 모양으로 나타냅니다.",
  "꺾은선그래프": "시간에 따른 데이터의 변화를 선으로 연결해 보여줍니다.",
  "matplotlib": "파이썬에서 그래프를 그리는 라이브러리입니다.",
  "pandas": "데이터를 표 형태로 다루는 강력한 파이썬 라이브러리입니다.",
  "DataFrame": "pandas에서 표 형태의 데이터를 저장하는 자료구조입니다.",
  "CSV": "콤마로 구분된 데이터 파일 형식입니다. 엑셀처럼 표 데이터를 저장합니다.",
  "상관관계": "두 변수가 서로 어떤 관계가 있는지 나타내는 것입니다.",
  "산점도": "두 변수의 관계를 점으로 나타내는 그래프입니다.",
  "히스토그램": "데이터의 분포를 막대로 나타내는 그래프입니다.",
  "numpy": "수치 계산을 위한 파이썬 라이브러리입니다.",
  "통계": "데이터를 수집, 정리, 분석하여 의미있는 정보를 얻는 학문입니다.",
  "표준편차": "데이터가 평균으로부터 얼마나 퍼져있는지 나타내는 값입니다.",
  "중앙값": "데이터를 크기순으로 나열했을 때 가운데 위치하는 값입니다.",
  "데이터 정제": "잘못된 데이터나 빈 값을 찾아서 수정하거나 제거하는 과정입니다.",
  "시계열": "시간 순서대로 기록된 데이터입니다.",
  "회귀분석": "변수들 사이의 관계를 수학적으로 모델링하는 분석 방법입니다.",
  "len()": "리스트나 문자열의 길이(요소 개수)를 반환하는 함수입니다.",
  "인덱싱": "리스트에서 특정 위치의 값을 가져오는 것입니다. 0부터 시작합니다.",
  "sum()": "리스트의 모든 숫자를 더해서 합계를 반환하는 함수입니다.",
  "시각화": "데이터를 그래프나 차트로 표현하여 쉽게 이해할 수 있게 만드는 것입니다.",
  "반복문": "같은 코드를 여러 번 실행하는 구조입니다. for, while 등이 있습니다.",
  "Series": "pandas에서 1차원 데이터를 저장하는 자료구조입니다. 리스트와 비슷합니다.",
  "boxplot": "데이터의 분포를 상자 모양으로 나타내는 그래프입니다. 중앙값, 사분위수를 보여줍니다.",
  "분산": "데이터가 평균으로부터 얼마나 흩어져 있는지를 나타내는 값입니다. 표준편차의 제곱입니다.",
  "백분위수": "데이터를 100등분했을 때 특정 위치의 값입니다. 50백분위수가 중앙값입니다.",
  "seaborn": "matplotlib을 기반으로 더 예쁜 통계 그래프를 그리는 라이브러리입니다.",
  "heatmap": "데이터 값을 색상의 진하기로 나타내는 그래프입니다. 상관관계 분석에 유용합니다.",
  "pairplot": "여러 변수 쌍의 관계를 한 번에 보여주는 그래프입니다.",
  "이동평균": "일정 기간의 데이터 평균을 계속 계산하여 추세를 파악하는 방법입니다.",
  "추세 분석": "시간에 따른 데이터의 전체적인 방향성(증가/감소)을 분석하는 것입니다.",
  "예측": "기존 데이터를 바탕으로 미래의 값을 추정하는 것입니다.",
  "모델 평가": "예측 모델이 얼마나 정확한지 측정하는 것입니다. RMSE, R² 등을 사용합니다.",
};

// 초등학교 수준 커리큘럼
export const elementaryDataCurriculum: Curriculum = {
  id: "data-elementary",
  title: "데이터 분석과 시각화",
  gradeLevel: "elementary",
  gradeLevelKorean: "초등학교",
  description: "리스트와 간단한 그래프로 데이터를 탐험해요!",
  icon: "fi fi-rr-chart-pie-alt",
  color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  levels: [
    {
      level: 1,
      title: "숫자 모으기 - 리스트 기초",
      concepts: ["리스트", "len()", "인덱싱"],
      activities: [
        {
          id: "e1-1",
          title: "우리 반 키 모으기",
          description: "친구들의 키를 리스트에 저장해 봅니다.",
          starterCode: `# 우리 반 친구들의 키(cm)를 리스트에 저장해요
키_목록 = [142, 138, 145, 150, 143]

print("우리 반 친구들의 키:", 키_목록)
print("친구 수:", len(키_목록), "명")`,
          hint: "리스트는 여러 데이터를 한 곳에 모아두는 상자예요!"
        },
        {
          id: "e1-2",
          title: "좋아하는 과일 조사",
          description: "친구들이 좋아하는 과일을 리스트로 만들어요.",
          starterCode: `# 친구들이 좋아하는 과일
과일 = ["사과", "바나나", "딸기", "포도", "수박"]

print("조사한 과일들:", 과일)
print("첫 번째 과일:", 과일[0])
print("마지막 과일:", 과일[-1])`
        },
        {
          id: "e1-3",
          title: "일주일 날씨 기록",
          description: "일주일 동안의 최고 기온을 기록해요.",
          starterCode: `# 일주일 최고 기온 (월~일)
기온 = [22, 24, 21, 25, 26, 23, 20]
요일 = ["월", "화", "수", "목", "금", "토", "일"]

for i in range(7):
    print(요일[i] + "요일:", 기온[i], "도")`
        }
      ]
    },
    {
      level: 2,
      title: "숫자로 계산하기 - 합계와 평균",
      concepts: ["합계", "평균", "sum()", "len()"],
      activities: [
        {
          id: "e2-1",
          title: "시험 점수 합계 구하기",
          description: "과목별 점수의 합계를 구해요.",
          starterCode: `# 과목별 시험 점수
점수 = [95, 88, 92, 100, 85]
과목 = ["국어", "수학", "영어", "과학", "사회"]

합계 = sum(점수)
print("총점:", 합계, "점")`,
          hint: "sum() 함수는 리스트의 모든 숫자를 더해줘요!"
        },
        {
          id: "e2-2",
          title: "평균 점수 계산하기",
          description: "시험 점수의 평균을 계산해요.",
          starterCode: `# 시험 점수
점수 = [95, 88, 92, 100, 85]

합계 = sum(점수)
개수 = len(점수)
평균 = 합계 / 개수

print("총점:", 합계)
print("과목 수:", 개수)
print("평균 점수:", 평균)`
        },
        {
          id: "e2-3",
          title: "최고점과 최저점 찾기",
          description: "가장 높은 점수와 낮은 점수를 찾아요.",
          starterCode: `# 시험 점수
점수 = [95, 88, 92, 100, 85]

최고점 = max(점수)
최저점 = min(점수)

print("최고 점수:", 최고점)
print("최저 점수:", 최저점)
print("점수 차이:", 최고점 - 최저점)`
        }
      ]
    },
    {
      level: 3,
      title: "그림으로 보여주기 - 텍스트 그래프",
      concepts: ["막대그래프", "시각화", "반복문"],
      activities: [
        {
          id: "e3-1",
          title: "별로 막대그래프 그리기",
          description: "숫자 크기만큼 별을 출력해요.",
          starterCode: `# 좋아하는 동물 투표 결과
동물 = ["강아지", "고양이", "토끼", "햄스터"]
투표 = [8, 6, 4, 2]

print("=== 좋아하는 동물 투표 ===")
for i in range(len(동물)):
    별 = "★" * 투표[i]
    print(동물[i], ":", 별, 투표[i], "표")`,
          hint: "문자열 * 숫자를 하면 그 문자열이 숫자만큼 반복돼요!"
        },
        {
          id: "e3-2",
          title: "가로 막대그래프",
          description: "과일 판매량을 막대그래프로 표현해요.",
          starterCode: `# 과일 판매량
과일 = ["사과", "바나나", "오렌지", "포도"]
판매량 = [15, 12, 8, 10]

print("=== 과일 판매량 ===")
for i in range(len(과일)):
    막대 = "▓" * 판매량[i]
    print(f"{과일[i]:4} |{막대}| {판매량[i]}개")`
        },
        {
          id: "e3-3",
          title: "비율 계산하기",
          description: "전체에서 각 항목이 차지하는 비율을 계산해요.",
          starterCode: `# 하루 활동 시간 (시간)
활동 = ["수업", "숙제", "놀이", "식사", "수면"]
시간 = [6, 2, 3, 2, 11]

전체 = sum(시간)
print("=== 하루 24시간 사용 ===")
for i in range(len(활동)):
    비율 = 시간[i] / 전체 * 100
    print(f"{활동[i]}: {시간[i]}시간 ({비율:.1f}%)")`
        }
      ]
    },
    {
      level: 4,
      title: "matplotlib으로 그래프 그리기",
      concepts: ["matplotlib", "막대그래프", "원그래프"],
      activities: [
        {
          id: "e4-1",
          title: "첫 번째 막대그래프",
          description: "matplotlib으로 예쁜 막대그래프를 그려요.",
          starterCode: `import matplotlib.pyplot as plt

# 좋아하는 계절 투표
계절 = ["봄", "여름", "가을", "겨울"]
투표 = [8, 5, 10, 7]

plt.bar(계절, 투표, color=['pink', 'skyblue', 'orange', 'lightgray'])
plt.title("좋아하는 계절")
plt.ylabel("투표 수")
plt.show()`,
          hint: "plt.bar()로 막대그래프를, plt.show()로 화면에 표시해요!"
        },
        {
          id: "e4-2",
          title: "원그래프 그리기",
          description: "비율을 원그래프로 나타내요.",
          starterCode: `import matplotlib.pyplot as plt

# 점심 메뉴 선호도
메뉴 = ["짜장면", "떡볶이", "김밥", "라면"]
선호도 = [35, 25, 20, 20]

plt.pie(선호도, labels=메뉴, autopct='%1.0f%%')
plt.title("좋아하는 점심 메뉴")
plt.show()`
        },
        {
          id: "e4-3",
          title: "꺾은선그래프",
          description: "일주일 기온 변화를 꺾은선그래프로 그려요.",
          starterCode: `import matplotlib.pyplot as plt

요일 = ["월", "화", "수", "목", "금", "토", "일"]
기온 = [22, 24, 21, 25, 26, 23, 20]

plt.plot(요일, 기온, marker='o', color='red')
plt.title("일주일 기온 변화")
plt.ylabel("기온 (°C)")
plt.grid(True)
plt.show()`
        }
      ]
    }
  ]
};

// 중학교 수준 커리큘럼
export const middleDataCurriculum: Curriculum = {
  id: "data-middle",
  title: "데이터 분석과 시각화",
  gradeLevel: "middle",
  gradeLevelKorean: "중학교",
  description: "pandas와 matplotlib으로 데이터를 분석해요!",
  icon: "fi fi-rr-chart-histogram",
  color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  levels: [
    {
      level: 1,
      title: "pandas 시작하기",
      concepts: ["pandas", "DataFrame", "Series"],
      activities: [
        {
          id: "m1-1",
          title: "DataFrame 만들기",
          description: "pandas로 표 형태의 데이터를 만들어요.",
          starterCode: `import pandas as pd

# 학생 성적 데이터
데이터 = {
    "이름": ["철수", "영희", "민수", "지영"],
    "국어": [85, 92, 78, 95],
    "수학": [90, 88, 95, 82],
    "영어": [88, 95, 80, 90]
}

df = pd.DataFrame(데이터)
print(df)`,
          hint: "DataFrame은 엑셀 표처럼 행과 열로 이루어져 있어요!"
        },
        {
          id: "m1-2",
          title: "데이터 정보 확인하기",
          description: "DataFrame의 기본 정보를 확인해요.",
          starterCode: `import pandas as pd

데이터 = {
    "이름": ["철수", "영희", "민수", "지영"],
    "국어": [85, 92, 78, 95],
    "수학": [90, 88, 95, 82]
}

df = pd.DataFrame(데이터)

print("=== 데이터 모양 ===")
print("행 수:", len(df))
print("열:", list(df.columns))
print()
print("=== 기본 통계 ===")
print(df.describe())`
        },
        {
          id: "m1-3",
          title: "열 선택과 조건 필터링",
          description: "원하는 열을 선택하고 조건에 맞는 데이터를 찾아요.",
          starterCode: `import pandas as pd

데이터 = {
    "이름": ["철수", "영희", "민수", "지영", "준호"],
    "점수": [85, 92, 78, 95, 88],
    "반": ["A", "B", "A", "B", "A"]
}

df = pd.DataFrame(데이터)

print("=== 전체 데이터 ===")
print(df)
print()
print("=== 90점 이상 ===")
print(df[df["점수"] >= 90])
print()
print("=== A반 학생 ===")
print(df[df["반"] == "A"])`
        }
      ]
    },
    {
      level: 2,
      title: "통계 분석하기",
      concepts: ["평균", "중앙값", "표준편차", "상관관계"],
      activities: [
        {
          id: "m2-1",
          title: "기본 통계량 계산",
          description: "평균, 중앙값, 최댓값, 최솟값을 계산해요.",
          starterCode: `import pandas as pd

점수 = pd.Series([75, 82, 90, 68, 95, 88, 72, 85, 91, 78])

print("=== 기본 통계량 ===")
print(f"평균: {점수.mean():.1f}")
print(f"중앙값: {점수.median():.1f}")
print(f"최댓값: {점수.max()}")
print(f"최솟값: {점수.min()}")
print(f"표준편차: {점수.std():.2f}")`
        },
        {
          id: "m2-2",
          title: "그룹별 통계",
          description: "그룹별로 데이터를 나눠서 분석해요.",
          starterCode: `import pandas as pd

데이터 = {
    "이름": ["철수", "영희", "민수", "지영", "준호", "수진"],
    "반": ["A", "A", "A", "B", "B", "B"],
    "점수": [85, 92, 78, 95, 88, 82]
}

df = pd.DataFrame(데이터)

print("=== 반별 평균 점수 ===")
print(df.groupby("반")["점수"].mean())
print()
print("=== 반별 통계 ===")
print(df.groupby("반")["점수"].describe())`
        },
        {
          id: "m2-3",
          title: "상관관계 분석",
          description: "두 변수 사이의 관계를 분석해요.",
          starterCode: `import pandas as pd

데이터 = {
    "공부시간": [2, 3, 4, 5, 6, 7, 8],
    "점수": [65, 70, 75, 82, 88, 92, 95]
}

df = pd.DataFrame(데이터)

상관계수 = df["공부시간"].corr(df["점수"])
print(f"공부시간과 점수의 상관계수: {상관계수:.3f}")

if 상관계수 > 0.7:
    print("=> 강한 양의 상관관계가 있습니다!")
elif 상관계수 > 0.4:
    print("=> 보통의 양의 상관관계가 있습니다.")
else:
    print("=> 약한 상관관계가 있습니다.")`
        }
      ]
    },
    {
      level: 3,
      title: "다양한 그래프 그리기",
      concepts: ["산점도", "히스토그램", "boxplot"],
      activities: [
        {
          id: "m3-1",
          title: "산점도 그리기",
          description: "두 변수의 관계를 산점도로 표현해요.",
          starterCode: `import matplotlib.pyplot as plt

공부시간 = [2, 3, 4, 5, 6, 7, 8, 5, 4, 6]
점수 = [65, 70, 75, 82, 88, 92, 95, 80, 72, 85]

plt.scatter(공부시간, 점수, color='blue', s=100)
plt.xlabel("공부 시간")
plt.ylabel("시험 점수")
plt.title("공부시간과 점수의 관계")
plt.grid(True)
plt.show()`
        },
        {
          id: "m3-2",
          title: "히스토그램",
          description: "데이터의 분포를 히스토그램으로 확인해요.",
          starterCode: `import matplotlib.pyplot as plt
import random

# 100명의 학생 점수 (정규분포 모의)
점수 = [random.gauss(75, 10) for _ in range(100)]

plt.hist(점수, bins=10, color='skyblue', edgecolor='black')
plt.xlabel("점수")
plt.ylabel("학생 수")
plt.title("학생 점수 분포")
plt.axvline(sum(점수)/len(점수), color='red', linestyle='--', label='평균')
plt.legend()
plt.show()`
        },
        {
          id: "m3-3",
          title: "여러 그래프 한 번에",
          description: "subplot으로 여러 그래프를 배치해요.",
          starterCode: `import matplotlib.pyplot as plt

월 = ["1월", "2월", "3월", "4월"]
매출 = [120, 150, 180, 200]
비용 = [80, 90, 100, 110]

fig, axes = plt.subplots(1, 2, figsize=(10, 4))

# 왼쪽: 막대그래프
axes[0].bar(월, 매출, color='green', label='매출')
axes[0].bar(월, 비용, color='red', alpha=0.7, label='비용')
axes[0].legend()
axes[0].set_title("월별 매출과 비용")

# 오른쪽: 꺾은선그래프
이익 = [m-c for m, c in zip(매출, 비용)]
axes[1].plot(월, 이익, marker='o', color='blue')
axes[1].set_title("월별 순이익")
axes[1].grid(True)

plt.tight_layout()
plt.show()`
        }
      ]
    },
    {
      level: 4,
      title: "실전 데이터 분석",
      concepts: ["CSV", "데이터 정제", "시각화"],
      activities: [
        {
          id: "m4-1",
          title: "데이터 정제하기",
          description: "결측치와 이상치를 처리해요.",
          starterCode: `import pandas as pd

# 결측치가 있는 데이터
데이터 = {
    "이름": ["철수", "영희", "민수", None, "지영"],
    "점수": [85, None, 78, 95, 88],
    "나이": [15, 14, 15, 14, 15]
}

df = pd.DataFrame(데이터)
print("=== 원본 데이터 ===")
print(df)
print()

# 결측치 확인
print("=== 결측치 개수 ===")
print(df.isnull().sum())
print()

# 결측치 처리
df_정제 = df.dropna()  # 결측치가 있는 행 제거
print("=== 정제된 데이터 ===")
print(df_정제)`
        },
        {
          id: "m4-2",
          title: "데이터 분석 리포트",
          description: "데이터를 분석하고 결과를 정리해요.",
          starterCode: `import pandas as pd
import matplotlib.pyplot as plt

# 학생 성적 데이터
데이터 = {
    "학생": ["A", "B", "C", "D", "E", "F", "G", "H"],
    "국어": [85, 92, 78, 95, 88, 72, 90, 85],
    "수학": [90, 88, 95, 82, 78, 85, 92, 88],
    "영어": [88, 95, 80, 90, 85, 78, 88, 92]
}

df = pd.DataFrame(데이터)
df["평균"] = df[["국어", "수학", "영어"]].mean(axis=1)

print("=== 성적 분석 리포트 ===")
print(f"전체 평균: {df['평균'].mean():.1f}")
print(f"최고 점수 학생: {df.loc[df['평균'].idxmax(), '학생']}")
print(f"과목별 평균:")
print(f"  국어: {df['국어'].mean():.1f}")
print(f"  수학: {df['수학'].mean():.1f}")
print(f"  영어: {df['영어'].mean():.1f}")`
        }
      ]
    }
  ]
};

// 고등학교 수준 커리큘럼
export const highDataCurriculum: Curriculum = {
  id: "data-high",
  title: "데이터 분석과 시각화",
  gradeLevel: "high",
  gradeLevelKorean: "고등학교",
  description: "고급 통계 분석과 실전 데이터 사이언스!",
  icon: "fi fi-rr-stats",
  color: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
  levels: [
    {
      level: 1,
      title: "numpy와 고급 통계",
      concepts: ["numpy", "표준편차", "분산", "백분위수"],
      activities: [
        {
          id: "h1-1",
          title: "numpy 기초",
          description: "numpy 배열과 기본 연산을 익혀요.",
          starterCode: `import numpy as np

# numpy 배열 생성
점수 = np.array([85, 92, 78, 95, 88, 72, 90, 85, 91, 80])

print("=== numpy 기본 통계 ===")
print(f"평균: {np.mean(점수):.2f}")
print(f"표준편차: {np.std(점수):.2f}")
print(f"분산: {np.var(점수):.2f}")
print(f"중앙값: {np.median(점수):.2f}")
print()
print("=== 백분위수 ===")
print(f"25%: {np.percentile(점수, 25):.2f}")
print(f"50%: {np.percentile(점수, 50):.2f}")
print(f"75%: {np.percentile(점수, 75):.2f}")`
        },
        {
          id: "h1-2",
          title: "정규분포와 z-score",
          description: "데이터의 표준화와 z-score를 계산해요.",
          starterCode: `import numpy as np

점수 = np.array([85, 92, 78, 95, 88, 72, 90, 85, 91, 80])

평균 = np.mean(점수)
표준편차 = np.std(점수)

# z-score 계산 (표준화)
z_scores = (점수 - 평균) / 표준편차

print("=== Z-Score 분석 ===")
print(f"평균: {평균:.2f}, 표준편차: {표준편차:.2f}")
print()
for i, (원점수, z) in enumerate(zip(점수, z_scores)):
    if z > 1:
        평가 = "상위권"
    elif z < -1:
        평가 = "하위권"
    else:
        평가 = "중위권"
    print(f"학생{i+1}: {원점수}점 (z={z:.2f}) - {평가}")`
        },
        {
          id: "h1-3",
          title: "상관계수 행렬",
          description: "여러 변수 간의 상관관계를 분석해요.",
          starterCode: `import numpy as np
import pandas as pd

np.random.seed(42)
n = 50

데이터 = {
    "공부시간": np.random.randint(1, 10, n),
    "수면시간": np.random.randint(5, 10, n),
    "운동시간": np.random.randint(0, 3, n),
}
데이터["성적"] = 데이터["공부시간"] * 8 + 데이터["수면시간"] * 2 + np.random.randint(-10, 10, n)

df = pd.DataFrame(데이터)

print("=== 상관계수 행렬 ===")
print(df.corr().round(3))
print()
print("=== 성적과의 상관관계 ===")
for col in ["공부시간", "수면시간", "운동시간"]:
    r = df[col].corr(df["성적"])
    print(f"{col}: {r:.3f}")`
        }
      ]
    },
    {
      level: 2,
      title: "고급 시각화",
      concepts: ["seaborn", "heatmap", "pairplot"],
      activities: [
        {
          id: "h2-1",
          title: "상관관계 히트맵",
          description: "상관계수 행렬을 히트맵으로 시각화해요.",
          starterCode: `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

np.random.seed(42)
n = 100

df = pd.DataFrame({
    "수학": np.random.randint(60, 100, n),
    "과학": np.random.randint(60, 100, n),
    "영어": np.random.randint(60, 100, n),
})
df["과학"] = df["수학"] * 0.7 + np.random.randint(0, 30, n)

상관행렬 = df.corr()

plt.figure(figsize=(8, 6))
plt.imshow(상관행렬, cmap='coolwarm', vmin=-1, vmax=1)
plt.colorbar(label='상관계수')
plt.xticks(range(len(df.columns)), df.columns)
plt.yticks(range(len(df.columns)), df.columns)

for i in range(len(df.columns)):
    for j in range(len(df.columns)):
        plt.text(j, i, f'{상관행렬.iloc[i, j]:.2f}', ha='center', va='center')

plt.title("과목 간 상관관계 히트맵")
plt.show()`
        },
        {
          id: "h2-2",
          title: "Box Plot으로 분포 비교",
          description: "여러 그룹의 데이터 분포를 비교해요.",
          starterCode: `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

np.random.seed(42)

데이터 = {
    "A반": np.random.normal(75, 10, 30),
    "B반": np.random.normal(80, 8, 30),
    "C반": np.random.normal(70, 15, 30)
}

fig, ax = plt.subplots(figsize=(10, 6))
ax.boxplot(데이터.values(), labels=데이터.keys())
ax.set_ylabel("점수")
ax.set_title("반별 성적 분포 비교")
ax.grid(True, alpha=0.3)

# 평균선 추가
for i, (반, 점수) in enumerate(데이터.items(), 1):
    ax.scatter(i, np.mean(점수), color='red', marker='D', s=100, zorder=5)

plt.show()`
        }
      ]
    },
    {
      level: 3,
      title: "시계열 분석",
      concepts: ["시계열", "이동평균", "추세 분석"],
      activities: [
        {
          id: "h3-1",
          title: "주가 데이터 시뮬레이션",
          description: "주가 데이터를 생성하고 분석해요.",
          starterCode: `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

np.random.seed(42)

# 100일간의 주가 시뮬레이션
날짜 = pd.date_range('2024-01-01', periods=100)
주가 = 100 + np.cumsum(np.random.randn(100) * 2)

df = pd.DataFrame({'날짜': 날짜, '주가': 주가})

# 이동평균 계산
df['5일_이동평균'] = df['주가'].rolling(window=5).mean()
df['20일_이동평균'] = df['주가'].rolling(window=20).mean()

plt.figure(figsize=(12, 6))
plt.plot(df['날짜'], df['주가'], label='주가', alpha=0.7)
plt.plot(df['날짜'], df['5일_이동평균'], label='5일 이동평균', linestyle='--')
plt.plot(df['날짜'], df['20일_이동평균'], label='20일 이동평균', linestyle='-.')
plt.xlabel('날짜')
plt.ylabel('주가')
plt.title('주가 및 이동평균선')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()`
        },
        {
          id: "h3-2",
          title: "추세와 계절성 분석",
          description: "시계열 데이터에서 패턴을 찾아요.",
          starterCode: `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

np.random.seed(42)

# 2년간의 월별 판매량 (추세 + 계절성)
월 = np.arange(24)
추세 = 100 + 월 * 5  # 상승 추세
계절성 = 30 * np.sin(2 * np.pi * 월 / 12)  # 12개월 주기
노이즈 = np.random.randn(24) * 10
판매량 = 추세 + 계절성 + 노이즈

날짜 = pd.date_range('2023-01', periods=24, freq='M')
df = pd.DataFrame({'날짜': 날짜, '판매량': 판매량})

fig, axes = plt.subplots(2, 1, figsize=(12, 8))

# 원본 데이터
axes[0].plot(df['날짜'], df['판매량'], marker='o')
axes[0].set_title('월별 판매량')
axes[0].grid(True)

# 월별 평균 (계절성 확인)
df['월'] = df['날짜'].dt.month
월별평균 = df.groupby('월')['판매량'].mean()
axes[1].bar(월별평균.index, 월별평균.values)
axes[1].set_xlabel('월')
axes[1].set_title('월별 평균 판매량 (계절성)')

plt.tight_layout()
plt.show()`
        }
      ]
    },
    {
      level: 4,
      title: "회귀 분석 기초",
      concepts: ["회귀분석", "예측", "모델 평가"],
      activities: [
        {
          id: "h4-1",
          title: "단순 선형 회귀",
          description: "직선으로 데이터의 관계를 모델링해요.",
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

# 데이터 생성
np.random.seed(42)
X = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
Y = 2 * X + 3 + np.random.randn(10) * 2

# 최소제곱법으로 회귀 계수 계산
n = len(X)
기울기 = (n * sum(X*Y) - sum(X)*sum(Y)) / (n * sum(X**2) - sum(X)**2)
절편 = (sum(Y) - 기울기 * sum(X)) / n

print(f"회귀식: Y = {기울기:.2f}X + {절편:.2f}")

# 예측
Y_예측 = 기울기 * X + 절편

# R-squared 계산
SS_res = sum((Y - Y_예측)**2)
SS_tot = sum((Y - np.mean(Y))**2)
R2 = 1 - SS_res / SS_tot
print(f"R² = {R2:.4f}")

# 시각화
plt.scatter(X, Y, label='실제 데이터')
plt.plot(X, Y_예측, color='red', label=f'회귀선 (R²={R2:.3f})')
plt.xlabel('X')
plt.ylabel('Y')
plt.legend()
plt.title('단순 선형 회귀')
plt.show()`
        },
        {
          id: "h4-2",
          title: "다중 회귀 분석",
          description: "여러 변수로 결과를 예측해요.",
          starterCode: `import numpy as np
import pandas as pd

np.random.seed(42)
n = 50

# 데이터 생성
공부시간 = np.random.randint(1, 10, n)
수면시간 = np.random.randint(5, 10, n)
성적 = 공부시간 * 8 + 수면시간 * 3 + 10 + np.random.randn(n) * 5

df = pd.DataFrame({
    '공부시간': 공부시간,
    '수면시간': 수면시간,
    '성적': 성적
})

# 상관관계 확인
print("=== 상관관계 ===")
print(df.corr().round(3))
print()

# numpy로 다중 회귀 (정규방정식)
X = np.column_stack([np.ones(n), 공부시간, 수면시간])
Y = 성적
계수 = np.linalg.lstsq(X, Y, rcond=None)[0]

print("=== 회귀 분석 결과 ===")
print(f"성적 = {계수[0]:.2f} + {계수[1]:.2f}×공부시간 + {계수[2]:.2f}×수면시간")
print()

# 예측
새학생 = {"공부시간": 7, "수면시간": 8}
예측성적 = 계수[0] + 계수[1]*새학생["공부시간"] + 계수[2]*새학생["수면시간"]
print(f"새 학생 (공부 {새학생['공부시간']}시간, 수면 {새학생['수면시간']}시간)")
print(f"예측 성적: {예측성적:.1f}점")`
        }
      ]
    }
  ]
};

// 전체 커리큘럼 배열
export const allDataCurriculums = [
  elementaryDataCurriculum,
  middleDataCurriculum,
  highDataCurriculum
];
