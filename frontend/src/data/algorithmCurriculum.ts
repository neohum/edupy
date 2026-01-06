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

// 알고리즘 개념 설명 사전
export const algorithmConceptExplanations: { [key: string]: string } = {
  // 초등학교 개념 - 프로그래밍 기초
  "변수": "데이터를 저장하는 상자입니다. 이름을 붙여서 나중에 다시 사용할 수 있습니다.",
  "자료형": "데이터의 종류입니다. 숫자(int, float), 문자열(str), 참/거짓(bool) 등이 있습니다.",
  "리스트": "여러 개의 값을 순서대로 담을 수 있는 자료구조입니다. 대괄호 []로 표현합니다.",
  "인덱스": "리스트에서 각 원소의 위치를 나타내는 번호입니다. 0부터 시작합니다.",
  "슬라이싱": "리스트의 일부분을 잘라내는 것입니다. [시작:끝] 형태로 사용합니다.",
  "함수": "특정 작업을 수행하는 코드 묶음입니다. def 키워드로 정의하고 재사용할 수 있습니다.",

  // 초등학교 개념 - 제어 구조
  "순차 구조": "명령어를 위에서 아래로 순서대로 실행하는 가장 기본적인 프로그램 구조입니다.",
  "선택 구조": "조건에 따라 다른 명령을 실행하는 구조입니다. if문을 사용합니다.",
  "반복 구조": "같은 명령을 여러 번 실행하는 구조입니다. for, while문을 사용합니다.",
  "최댓값 찾기": "여러 숫자 중에서 가장 큰 값을 찾는 알고리즘입니다.",
  "최솟값 찾기": "여러 숫자 중에서 가장 작은 값을 찾는 알고리즘입니다.",
  "합계 구하기": "여러 숫자를 모두 더하는 알고리즘입니다.",
  "평균 구하기": "숫자들의 합을 개수로 나누어 평균을 계산합니다.",
  "순차 탐색": "리스트의 처음부터 끝까지 하나씩 비교하며 원하는 값을 찾는 방법입니다.",
  "버블 정렬": "인접한 두 원소를 비교하여 정렬하는 방법입니다. 거품처럼 큰 값이 뒤로 이동합니다.",

  // 중학교 개념 - 정렬과 탐색
  "선택 정렬": "가장 작은(또는 큰) 원소를 찾아 맨 앞과 교환하는 정렬 방법입니다.",
  "삽입 정렬": "카드를 정렬하듯이 각 원소를 적절한 위치에 삽입하는 정렬 방법입니다.",
  "정렬 비교": "여러 정렬 알고리즘의 성능과 특징을 비교 분석하는 것입니다.",
  "이진 탐색": "정렬된 리스트에서 중간값과 비교하며 빠르게 찾는 탐색 방법입니다.",
  "정렬된 데이터": "값이 순서대로 배열된 데이터입니다. 이진 탐색 등 많은 알고리즘에서 필수입니다.",
  "시간 복잡도": "알고리즘의 실행 시간이 입력 크기에 따라 증가하는 정도를 나타냅니다. O(n), O(log n) 등으로 표현합니다.",

  // 중학교 개념 - 2차원 배열과 문자열
  "2차원 배열": "배열 안에 배열이 있는 구조입니다. 행과 열로 이루어진 표 형태의 데이터를 저장합니다.",
  "문자열 처리": "문자열을 다루는 여러 기법입니다. 검색, 치환, 분리, 결합 등을 포함합니다.",
  "회문": "앞에서 읽으나 뒤에서 읽으나 같은 문자열입니다. 예: '토마토', '기러기'",
  "아나그램": "같은 문자들로 이루어진 다른 단어입니다. 예: 'listen'과 'silent'",

  // 중학교 개념 - 트리
  "트리": "계층적 구조를 표현하는 자료구조입니다. 루트, 부모, 자식 노드로 구성됩니다.",
  "이진 트리 순회": "트리의 모든 노드를 방문하는 방법입니다. 전위, 중위, 후위 순회가 있습니다.",
  "연결 리스트": "각 노드가 데이터와 다음 노드의 주소를 가지는 선형 자료구조입니다.",
  "재귀 함수": "함수가 자기 자신을 호출하는 프로그래밍 기법입니다.",
  "팩토리얼": "1부터 n까지의 모든 자연수를 곱한 값입니다. n! = n × (n-1) × ... × 1",
  "피보나치 수열": "앞의 두 수를 더해 다음 수를 만드는 수열입니다. 0, 1, 1, 2, 3, 5, 8, ...",
  "스택": "후입선출(LIFO) 구조의 자료구조입니다. 마지막에 들어간 것이 먼저 나옵니다.",
  "LIFO": "Last In First Out의 약자로 후입선출을 의미합니다. 스택의 핵심 특성입니다.",
  "큐": "선입선출(FIFO) 구조의 자료구조입니다. 먼저 들어간 것이 먼저 나옵니다.",
  "FIFO": "First In First Out의 약자로 선입선출을 의미합니다. 큐의 핵심 특성입니다.",
  "깊이 우선 탐색": "그래프에서 한 방향으로 끝까지 탐색한 후 다른 방향을 탐색하는 방법입니다.",
  "너비 우선 탐색": "그래프에서 가까운 노드부터 차례대로 탐색하는 방법입니다.",
  "그래프 표현": "그래프를 컴퓨터에 저장하는 방법입니다. 인접 리스트와 인접 행렬 방식이 있습니다.",

  // 고등학교 개념 - 정렬
  "병합 정렬": "리스트를 절반씩 나누어 정렬한 후 합치는 분할정복 정렬 방법입니다.",
  "퀵 정렬": "기준값(pivot)을 정하고 작은 값과 큰 값으로 나누어 정렬하는 빠른 정렬 방법입니다.",
  "분할 정복": "큰 문제를 작은 부분 문제로 나누어 해결한 후 결과를 합치는 알고리즘 설계 기법입니다.",
  "동적 프로그래밍": "큰 문제를 작은 문제로 나누고, 결과를 저장하여 재사용하는 최적화 기법입니다.",
  "최적화": "문제의 최선의 해(최대 또는 최소)를 찾거나 알고리즘 성능을 개선하는 과정입니다.",
  "메모이제이션": "이미 계산한 결과를 저장해두었다가 재사용하는 기법입니다.",
  "최단 경로": "두 지점 사이의 가장 짧은 경로를 찾는 문제입니다.",
  "다익스트라 알고리즘": "가중치 그래프에서 최단 경로를 찾는 알고리즘입니다.",
  "가중치 그래프": "간선에 비용, 거리, 시간 등의 가중치가 부여된 그래프입니다.",
  "그리디 알고리즘": "각 단계에서 가장 좋아 보이는 선택을 하는 알고리즘입니다.",
  "활동 선택": "시간이 겹치지 않는 최대 개수의 활동을 선택하는 문제입니다. 그리디의 대표 예제입니다.",
  "배낭 문제": "제한된 용량에서 가치를 최대화하는 조합을 찾는 문제입니다.",
  "이진 트리": "각 노드가 최대 2개의 자식을 가지는 트리 구조입니다.",
  "해시 테이블": "키-값 쌍을 저장하는 빠른 자료구조입니다. 평균 O(1) 시간에 접근합니다.",
  "힙": "완전 이진 트리 기반 자료구조로, 최댓값이나 최솟값을 O(1)에 찾을 수 있습니다.",

  // 고등학교 개념 - 백트래킹과 고급 그래프
  "백트래킹": "모든 경우를 체계적으로 탐색하되, 조건에 맞지 않으면 즉시 되돌아가는 알고리즘입니다.",
  "N-Queen 문제": "N×N 체스판에 N개의 퀸을 서로 공격하지 않게 배치하는 문제입니다.",
  "조합 탐색": "가능한 모든 조합을 체계적으로 탐색하는 기법입니다. 백트래킹과 함께 사용됩니다.",
  "유니온-파인드": "서로소 집합을 효율적으로 관리하는 자료구조입니다. 집합의 합치기와 찾기 연산을 지원합니다.",
  "최소 신장 트리": "그래프의 모든 정점을 최소 비용으로 연결하는 트리입니다.",
  "크루스칼 알고리즘": "간선을 가중치 순으로 정렬하여 최소 신장 트리를 구하는 알고리즘입니다.",
  "프림 알고리즘": "한 정점에서 시작해 트리를 확장하며 최소 신장 트리를 구하는 알고리즘입니다.",
  "위상 정렬": "방향 그래프에서 순서 관계를 유지하며 정점을 나열하는 방법입니다.",
  "플로이드-워셜": "모든 정점 쌍 사이의 최단 경로를 구하는 알고리즘입니다. 동적 프로그래밍 기반입니다.",
  "모든 쌍 최단 경로": "그래프의 모든 정점 쌍 사이의 최단 경로를 구하는 문제입니다. 플로이드-워셜로 해결합니다.",
};

// 초등학교 알고리즘 커리큘럼
export const elementaryAlgorithmCurriculum: Curriculum = {
  id: "algorithm-elementary",
  title: "알고리즘 기초",
  gradeLevel: "elementary",
  gradeLevelKorean: "초등학교",
  description: "순차, 선택, 반복으로 알고리즘의 기초를 배워요!",
  icon: "fi fi-rr-bulb",
  color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  levels: [
    {
      level: 0,
      title: "프로그래밍 첫걸음 - 변수, 리스트, 함수",
      concepts: ["변수", "자료형", "리스트", "인덱스", "슬라이싱", "함수"],
      activities: [
        {
          id: "elem-0-1",
          title: "변수 사용하기",
          description: "변수에 값을 저장하고 출력해봅니다.",
          starterCode: `# 변수에 값 저장하기
name = "철수"
age = 10
height = 140.5

print(f"이름: {name}")
print(f"나이: {age}살")
print(f"키: {height}cm")

# 변수 값 바꾸기
age = 11
print(f"\\n생일이 지나서 이제 {age}살!")`,
          hint: "변수는 데이터를 담는 상자입니다. =로 값을 저장하고, 나중에 다시 사용할 수 있어요!"
        },
        {
          id: "elem-0-2",
          title: "리스트 만들기",
          description: "여러 값을 리스트에 담아봅니다.",
          starterCode: `# 친구들 이름 리스트
friends = ["민수", "영희", "철수", "지영"]

print("우리 반 친구들:")
print(friends)

# 리스트에 친구 추가
friends.append("동현")
print(f"\\n친구가 늘었어요: {friends}")

# 리스트 길이
print(f"전체 친구 수: {len(friends)}명")`,
          hint: "리스트는 [ ]로 만들고, 여러 값을 순서대로 저장할 수 있습니다."
        },
        {
          id: "elem-0-3",
          title: "인덱스로 값 꺼내기",
          description: "인덱스를 사용하여 리스트의 특정 값을 가져옵니다.",
          starterCode: `# 과일 리스트
fruits = ["사과", "바나나", "포도", "딸기", "수박"]

# 인덱스는 0부터 시작!
print(f"첫 번째 과일: {fruits[0]}")
print(f"두 번째 과일: {fruits[1]}")
print(f"마지막 과일: {fruits[-1]}")  # -1은 마지막 원소

# 특정 위치 값 바꾸기
fruits[2] = "오렌지"
print(f"\\n바뀐 리스트: {fruits}")`,
          hint: "인덱스는 0부터 시작합니다. fruits[0]은 첫 번째 원소, fruits[-1]은 마지막 원소입니다."
        },
        {
          id: "elem-0-4",
          title: "슬라이싱으로 부분 잘라내기",
          description: "슬라이싱으로 리스트의 일부를 가져옵니다.",
          starterCode: `# 숫자 리스트
numbers = [10, 20, 30, 40, 50, 60, 70, 80, 90]

# 슬라이싱: [시작:끝]
print(f"처음 3개: {numbers[0:3]}")  # 0, 1, 2번 인덱스
print(f"3번부터 6번까지: {numbers[3:7]}")
print(f"처음부터 5번까지: {numbers[:5]}")
print(f"5번부터 끝까지: {numbers[5:]}")

# 2칸씩 건너뛰기
print(f"2칸씩: {numbers[::2]}")`,
          hint: "[시작:끝]으로 슬라이싱합니다. 끝 인덱스는 포함되지 않아요!"
        },
        {
          id: "elem-0-5",
          title: "함수 만들기",
          description: "같은 작업을 반복할 때 함수를 만들어 재사용합니다.",
          starterCode: `# 인사하는 함수
def say_hello(name):
    """이름을 받아서 인사하는 함수"""
    print(f"안녕하세요, {name}님!")

# 함수 호출
say_hello("철수")
say_hello("영희")
say_hello("민수")

# 값을 반환하는 함수
def add_numbers(a, b):
    """두 숫자를 더해서 반환"""
    result = a + b
    return result

answer = add_numbers(10, 20)
print(f"\\n10 + 20 = {answer}")`,
          hint: "def로 함수를 정의하고, 필요할 때마다 호출할 수 있습니다. return으로 결과를 돌려줍니다."
        },
        {
          id: "elem-0-6",
          title: "자료형 알아보기",
          description: "Python의 다양한 자료형을 체험합니다.",
          starterCode: `# 다양한 자료형
number_int = 100           # 정수 (int)
number_float = 3.14        # 실수 (float)
text = "Hello, Python!"    # 문자열 (str)
is_student = True          # 불린 (bool)

# type() 함수로 자료형 확인
print(f"{number_int}의 타입: {type(number_int)}")
print(f"{number_float}의 타입: {type(number_float)}")
print(f"{text}의 타입: {type(text)}")
print(f"{is_student}의 타입: {type(is_student)}")

# 리스트도 하나의 자료형!
my_list = [1, 2, 3]
print(f"{my_list}의 타입: {type(my_list)}")`,
          hint: "Python은 숫자(int, float), 문자열(str), 불린(bool), 리스트(list) 등 다양한 자료형이 있습니다."
        }
      ]
    },
    {
      level: 1,
      title: "알고리즘의 기초 - 순차, 선택, 반복",
      concepts: ["순차 구조", "선택 구조", "반복 구조"],
      activities: [
        {
          id: "elem-1-1",
          title: "아침 준비 순서 프로그램",
          description: "아침에 일어나서 학교 가기까지의 순서를 프로그램으로 만들어봅니다.",
          starterCode: `# 아침 준비 순서를 순차적으로 출력하기
print("1. 일어나기")
print("2. 세수하기")
print("3. 아침 먹기")
# 나머지 순서를 추가해보세요!`,
          hint: "순차 구조는 명령어가 위에서 아래로 차례대로 실행됩니다. 학교 가기까지 어떤 일들을 하는지 순서대로 적어보세요!"
        },
        {
          id: "elem-1-2",
          title: "날씨에 따른 옷 선택",
          description: "온도에 따라 입을 옷을 선택하는 프로그램을 만듭니다.",
          starterCode: `# 온도에 따라 다른 옷 추천하기
temperature = 25

if temperature >= 28:
    print("반팔을 입으세요!")
elif temperature >= 20:
    print("긴팔을 입으세요!")
else:
    print("따뜻한 옷을 입으세요!")`,
          hint: "선택 구조는 조건에 따라 다른 명령을 실행합니다. temperature 값을 바꿔가며 테스트해보세요!"
        },
        {
          id: "elem-1-3",
          title: "구구단 2단 외우기",
          description: "반복문을 사용하여 구구단 2단을 출력합니다.",
          starterCode: `# 반복문으로 2단 출력하기
for i in range(1, 10):
    result = 2 * i
    print(f"2 × {i} = {result}")`,
          hint: "반복 구조는 같은 명령을 여러 번 실행합니다. range(1, 10)은 1부터 9까지의 숫자를 만듭니다."
        },
        {
          id: "elem-1-4",
          title: "별 그리기 패턴",
          description: "반복문으로 별(*)을 이용한 패턴을 만듭니다.",
          starterCode: `# 별로 패턴 만들기
for i in range(1, 6):
    stars = "*" * i
    print(stars)

# 5줄의 별이 점점 늘어나는 패턴이 만들어집니다`,
          hint: "문자열 * 숫자를 하면 문자열이 반복됩니다. '*' * 3은 '***'이 됩니다."
        }
      ]
    },
    {
      level: 2,
      title: "숫자 다루기 - 최대, 최소, 합계, 평균",
      concepts: ["최댓값 찾기", "최솟값 찾기", "합계 구하기", "평균 구하기"],
      activities: [
        {
          id: "elem-2-1",
          title: "우리 반 키 큰 친구 찾기",
          description: "여러 친구들의 키 중에서 가장 큰 값을 찾습니다.",
          starterCode: `# 친구들의 키 리스트
heights = [145, 152, 138, 149, 160, 155]

# 가장 큰 키 찾기
max_height = heights[0]  # 첫 번째 값으로 시작
for height in heights:
    if height > max_height:
        max_height = height

print(f"우리 반에서 가장 큰 키는 {max_height}cm입니다")`,
          hint: "첫 번째 값을 최댓값으로 정하고, 리스트를 돌면서 더 큰 값이 나오면 교체합니다!"
        },
        {
          id: "elem-2-2",
          title: "가장 저렴한 과자 찾기",
          description: "여러 과자의 가격 중에서 가장 작은 값을 찾습니다.",
          starterCode: `# 과자 가격 리스트
prices = [1500, 2000, 800, 1200, 3000]

# 가장 저렴한 가격 찾기
min_price = prices[0]
# 여기에 코드를 작성해보세요!

print(f"가장 저렴한 과자는 {min_price}원입니다")`,
          hint: "최댓값 찾기와 비슷하지만 비교 연산자를 < 로 바꿔야 합니다."
        },
        {
          id: "elem-2-3",
          title: "일주일 용돈 합계",
          description: "일주일 동안 받은 용돈의 합계를 계산합니다.",
          starterCode: `# 요일별 용돈
allowances = [1000, 0, 1000, 500, 1000, 0, 2000]

# 합계 구하기
total = 0
for money in allowances:
    total = total + money  # 또는 total += money

print(f"일주일 동안 받은 용돈: {total}원")`,
          hint: "합계는 0부터 시작해서 각 값을 하나씩 더해갑니다."
        },
        {
          id: "elem-2-4",
          title: "시험 평균 점수 계산하기",
          description: "5번의 시험 점수의 평균을 계산합니다.",
          starterCode: `# 시험 점수
scores = [85, 90, 78, 92, 88]

# 평균 = 합계 / 개수
total_score = 0
for score in scores:
    total_score += score

average = total_score / len(scores)
print(f"평균 점수: {average}점")`,
          hint: "평균은 모든 값의 합계를 개수로 나눈 값입니다. len()은 리스트의 길이를 반환합니다."
        }
      ]
    },
    {
      level: 3,
      title: "찾기와 정리하기 - 탐색과 정렬 기초",
      concepts: ["순차 탐색", "버블 정렬"],
      activities: [
        {
          id: "elem-3-1",
          title: "친구 이름 찾기",
          description: "친구 목록에서 특정 이름을 찾는 프로그램을 만듭니다.",
          starterCode: `# 친구 이름 목록
friends = ["민수", "영희", "철수", "지영", "동현"]
find_name = "철수"

# 순차 탐색
found = False
for name in friends:
    if name == find_name:
        found = True
        print(f"{find_name}을(를) 찾았습니다!")
        break

if not found:
    print(f"{find_name}을(를) 찾지 못했습니다.")`,
          hint: "순차 탐색은 리스트를 처음부터 끝까지 하나씩 확인합니다. 찾으면 break로 멈춥니다."
        },
        {
          id: "elem-3-2",
          title: "숫자 위치 찾기",
          description: "숫자 리스트에서 특정 숫자의 위치(인덱스)를 찾습니다.",
          starterCode: `# 숫자 리스트
numbers = [10, 25, 7, 42, 15, 33]
find_num = 42

# 위치 찾기
for i in range(len(numbers)):
    if numbers[i] == find_num:
        print(f"{find_num}는 {i}번째 위치에 있습니다!")
        break`,
          hint: "enumerate()나 range(len())을 사용하면 인덱스와 값을 함께 얻을 수 있습니다."
        },
        {
          id: "elem-3-3",
          title: "키 순서로 정렬하기 (버블 정렬)",
          description: "버블 정렬로 키를 작은 순서대로 정렬합니다.",
          starterCode: `# 친구들의 키 (cm)
heights = [152, 145, 160, 138, 155]
print(f"정렬 전: {heights}")

# 버블 정렬
n = len(heights)
for i in range(n):
    for j in range(n - 1 - i):
        # 인접한 두 값 비교
        if heights[j] > heights[j + 1]:
            # 위치 바꾸기 (swap)
            heights[j], heights[j + 1] = heights[j + 1], heights[j]

print(f"정렬 후: {heights}")`,
          hint: "버블 정렬은 인접한 두 원소를 비교하며 큰 값을 뒤로 보냅니다. 거품이 위로 올라가듯이!"
        },
        {
          id: "elem-3-4",
          title: "성적 순위 만들기",
          description: "시험 점수를 높은 순서로 정렬합니다.",
          starterCode: `# 시험 점수
scores = [85, 92, 78, 95, 88]
print(f"정렬 전: {scores}")

# 버블 정렬 (내림차순)
n = len(scores)
for i in range(n):
    for j in range(n - 1 - i):
        if scores[j] < scores[j + 1]:  # 부등호 방향 주목!
            scores[j], scores[j + 1] = scores[j + 1], scores[j]

print(f"정렬 후 (높은 순): {scores}")`,
          hint: "내림차순 정렬은 비교 연산자만 반대로 바꾸면 됩니다. > 대신 <를 사용하세요!"
        }
      ]
    }
  ]
};

// 중학교 알고리즘 커리큘럼
export const middleSchoolAlgorithmCurriculum: Curriculum = {
  id: "algorithm-middle",
  title: "알고리즘 심화",
  gradeLevel: "middle",
  gradeLevelKorean: "중학교",
  description: "정렬, 탐색, 재귀, 자료구조를 마스터해요!",
  icon: "fi fi-rr-search-alt",
  color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  levels: [
    {
      level: 0,
      title: "2차원 배열과 문자열 마스터",
      concepts: ["2차원 배열", "문자열 처리", "회문", "아나그램"],
      activities: [
        {
          id: "middle-0-1",
          title: "2차원 배열 만들기",
          description: "표 형태의 데이터를 2차원 배열로 표현합니다.",
          starterCode: `# 2차원 배열: 3×3 격자
grid = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# 전체 출력
print("2차원 배열:")
for row in grid:
    print(row)

# 특정 위치 값 접근
print(f"\\n[0][0] = {grid[0][0]}")  # 첫 번째 행, 첫 번째 열
print(f"[1][1] = {grid[1][1]}")  # 두 번째 행, 두 번째 열
print(f"[2][2] = {grid[2][2]}")  # 세 번째 행, 세 번째 열`,
          hint: "2차원 배열은 배열 안의 배열입니다. grid[행][열]로 접근합니다."
        },
        {
          id: "middle-0-2",
          title: "구구단 표 만들기",
          description: "이중 for문으로 구구단 표를 2차원 배열로 만듭니다.",
          starterCode: `# 구구단 표 (2단~9단)
gugudan = []

for i in range(2, 10):  # 2단~9단
    row = []
    for j in range(1, 10):  # 1~9 곱하기
        row.append(i * j)
    gugudan.append(row)

# 표 형태로 출력
print("   ", end="")
for i in range(1, 10):
    print(f"{i:3}", end="")
print()
print("-" * 30)

for i, row in enumerate(gugudan, start=2):
    print(f"{i}단:", end=" ")
    for value in row:
        print(f"{value:3}", end="")
    print()`,
          hint: "이중 for문으로 2차원 배열을 생성할 수 있습니다."
        },
        {
          id: "middle-0-3",
          title: "회문 검사하기",
          description: "문자열이 회문인지 확인하는 프로그램을 만듭니다.",
          starterCode: `def is_palindrome(text):
    """회문인지 검사"""
    # 공백 제거 및 소문자 변환
    text = text.replace(" ", "").lower()

    # 앞에서부터와 뒤에서부터 비교
    left = 0
    right = len(text) - 1

    while left < right:
        if text[left] != text[right]:
            return False
        left += 1
        right -= 1

    return True

# 테스트
words = ["토마토", "기러기", "apple", "level", "python", "noon"]

for word in words:
    result = "회문입니다" if is_palindrome(word) else "회문이 아닙니다"
    print(f"{word}: {result}")`,
          hint: "회문은 앞에서 읽으나 뒤에서 읽으나 같습니다. 양쪽 끝에서 시작해 중앙으로 비교합니다."
        },
        {
          id: "middle-0-4",
          title: "아나그램 검사하기",
          description: "두 문자열이 같은 문자로 이루어졌는지 확인합니다.",
          starterCode: `def is_anagram(word1, word2):
    """아나그램인지 검사"""
    # 공백 제거 및 소문자 변환
    word1 = word1.replace(" ", "").lower()
    word2 = word2.replace(" ", "").lower()

    # 정렬하여 비교
    return sorted(word1) == sorted(word2)

# 테스트
pairs = [
    ("listen", "silent"),
    ("evil", "vile"),
    ("a gentleman", "elegant man"),
    ("hello", "world"),
    ("학교", "교학")
]

for word1, word2 in pairs:
    result = "아나그램입니다" if is_anagram(word1, word2) else "아나그램이 아닙니다"
    print(f"'{word1}' & '{word2}': {result}")`,
          hint: "아나그램은 문자를 재배열하면 같은 단어가 됩니다. 정렬해서 비교하면 쉽습니다!"
        },
        {
          id: "middle-0-5",
          title: "문자열 압축하기",
          description: "연속된 문자를 개수로 표현하여 압축합니다.",
          starterCode: `def compress_string(text):
    """연속된 문자를 압축 (Run-Length Encoding)"""
    if not text:
        return ""

    compressed = []
    current_char = text[0]
    count = 1

    for i in range(1, len(text)):
        if text[i] == current_char:
            count += 1
        else:
            compressed.append(f"{current_char}{count}")
            current_char = text[i]
            count = 1

    # 마지막 문자 처리
    compressed.append(f"{current_char}{count}")

    return ''.join(compressed)

# 테스트
strings = ["aabbbcccc", "aaaa", "abcdef", "wwwwaaadexxxxxx"]

for s in strings:
    compressed = compress_string(s)
    print(f"{s} → {compressed}")`,
          hint: "연속된 같은 문자를 세어서 '문자+개수' 형태로 압축합니다."
        }
      ]
    },
    {
      level: 1,
      title: "효율적인 정렬 알고리즘",
      concepts: ["선택 정렬", "삽입 정렬", "정렬 비교"],
      activities: [
        {
          id: "middle-1-1",
          title: "선택 정렬 구현하기",
          description: "선택 정렬 알고리즘을 이해하고 구현합니다.",
          starterCode: `# 선택 정렬 (Selection Sort)
def selection_sort(arr):
    n = len(arr)

    for i in range(n):
        # 최솟값의 인덱스 찾기
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j

        # 최솟값을 맨 앞과 교환
        arr[i], arr[min_idx] = arr[min_idx], arr[i]

    return arr

# 테스트
numbers = [64, 25, 12, 22, 11]
print(f"정렬 전: {numbers}")
sorted_numbers = selection_sort(numbers.copy())
print(f"정렬 후: {sorted_numbers}")`,
          hint: "선택 정렬은 매번 남은 원소 중 가장 작은 값을 찾아 앞으로 보냅니다."
        },
        {
          id: "middle-1-2",
          title: "삽입 정렬 구현하기",
          description: "카드를 정렬하는 것처럼 삽입 정렬을 구현합니다.",
          starterCode: `# 삽입 정렬 (Insertion Sort)
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1

        # key보다 큰 원소들을 한 칸씩 뒤로 이동
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1

        # key를 올바른 위치에 삽입
        arr[j + 1] = key

    return arr

# 테스트
numbers = [12, 11, 13, 5, 6]
print(f"정렬 전: {numbers}")
sorted_numbers = insertion_sort(numbers.copy())
print(f"정렬 후: {sorted_numbers}")`,
          hint: "삽입 정렬은 각 원소를 이미 정렬된 부분의 적절한 위치에 삽입합니다. 카드 정리와 같습니다!"
        },
        {
          id: "middle-1-3",
          title: "정렬 알고리즘 성능 비교",
          description: "버블, 선택, 삽입 정렬의 실행 시간을 비교합니다.",
          starterCode: `import time
import random

# 세 가지 정렬 함수
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]

def selection_sort(arr):
    # 위에서 구현한 코드 사용
    pass

def insertion_sort(arr):
    # 위에서 구현한 코드 사용
    pass

# 랜덤 데이터 생성
data = [random.randint(1, 100) for _ in range(50)]

# 성능 측정
for sort_func in [bubble_sort, selection_sort, insertion_sort]:
    test_data = data.copy()
    start = time.time()
    sort_func(test_data)
    end = time.time()
    print(f"{sort_func.__name__}: {end - start:.5f}초")`,
          hint: "같은 데이터에 대해 각 정렬의 속도를 비교해보세요. 데이터가 많을수록 차이가 명확합니다!"
        }
      ]
    },
    {
      level: 2,
      title: "빠른 탐색 - 이진 탐색",
      concepts: ["이진 탐색", "정렬된 데이터", "시간 복잡도"],
      activities: [
        {
          id: "middle-2-1",
          title: "이진 탐색 이해하기",
          description: "정렬된 리스트에서 이진 탐색으로 값을 찾습니다.",
          starterCode: `# 이진 탐색 (Binary Search)
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid  # 찾았다!
        elif arr[mid] < target:
            left = mid + 1  # 오른쪽 절반 탐색
        else:
            right = mid - 1  # 왼쪽 절반 탐색

    return -1  # 못 찾음

# 테스트 (정렬된 리스트 필요!)
numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
target = 13

result = binary_search(numbers, target)
if result != -1:
    print(f"{target}을(를) {result}번 인덱스에서 찾았습니다!")
else:
    print(f"{target}을(를) 찾지 못했습니다.")`,
          hint: "이진 탐색은 중간값과 비교하여 탐색 범위를 절반씩 줄입니다. O(log n) 시간 복잡도!"
        },
        {
          id: "middle-2-2",
          title: "순차 탐색 vs 이진 탐색",
          description: "두 탐색 방법의 성능을 비교합니다.",
          starterCode: `import time

def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

def binary_search(arr, target):
    # 위에서 구현한 이진 탐색 사용
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# 큰 정렬된 리스트
data = list(range(0, 10000, 2))  # 0, 2, 4, ..., 9998
target = 9996

# 순차 탐색 시간 측정
start = time.time()
linear_search(data, target)
print(f"순차 탐색: {time.time() - start:.6f}초")

# 이진 탐색 시간 측정
start = time.time()
binary_search(data, target)
print(f"이진 탐색: {time.time() - start:.6f}초")`,
          hint: "데이터가 많을수록 이진 탐색이 훨씬 빠릅니다!"
        }
      ]
    },
    {
      level: 3,
      title: "재귀 함수 마스터하기",
      concepts: ["재귀 함수", "팩토리얼", "피보나치 수열"],
      activities: [
        {
          id: "middle-3-1",
          title: "팩토리얼 계산하기",
          description: "재귀 함수로 팩토리얼을 계산합니다.",
          starterCode: `# 팩토리얼: n! = n × (n-1) × ... × 1
def factorial(n):
    # 기저 조건 (base case)
    if n == 0 or n == 1:
        return 1

    # 재귀 호출
    return n * factorial(n - 1)

# 테스트
for i in range(1, 6):
    print(f"{i}! = {factorial(i)}")

# 5! = 5 × 4 × 3 × 2 × 1 = 120`,
          hint: "재귀 함수는 자기 자신을 호출합니다. 기저 조건이 없으면 무한 루프에 빠집니다!"
        },
        {
          id: "middle-3-2",
          title: "피보나치 수열 만들기",
          description: "재귀로 피보나치 수열을 구현합니다.",
          starterCode: `# 피보나치 수열: F(n) = F(n-1) + F(n-2)
def fibonacci(n):
    # 기저 조건
    if n <= 1:
        return n

    # 재귀 호출
    return fibonacci(n - 1) + fibonacci(n - 2)

# 피보나치 수열 출력
print("피보나치 수열:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

# 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...`,
          hint: "피보나치 수열은 이전 두 항의 합입니다. F(0)=0, F(1)=1부터 시작합니다."
        },
        {
          id: "middle-3-3",
          title: "하노이의 탑",
          description: "재귀로 하노이의 탑 문제를 해결합니다.",
          starterCode: `# 하노이의 탑: n개의 원판을 A에서 C로 이동 (B를 보조로 사용)
def hanoi(n, start, end, aux):
    if n == 1:
        print(f"원판 1을 {start}에서 {end}로 이동")
        return

    # 1. n-1개를 A에서 B로 이동 (C를 보조로)
    hanoi(n - 1, start, aux, end)

    # 2. 가장 큰 원판을 A에서 C로 이동
    print(f"원판 {n}을 {start}에서 {end}로 이동")

    # 3. n-1개를 B에서 C로 이동 (A를 보조로)
    hanoi(n - 1, aux, end, start)

# 원판 3개를 A에서 C로 이동
print("하노이의 탑 (원판 3개):")
hanoi(3, 'A', 'C', 'B')`,
          hint: "하노이의 탑은 재귀의 대표적인 예제입니다. 큰 문제를 작은 문제로 나누어 해결합니다!"
        }
      ]
    },
    {
      level: 4,
      title: "자료구조 - 스택과 큐",
      concepts: ["스택", "큐", "LIFO", "FIFO"],
      activities: [
        {
          id: "middle-4-1",
          title: "스택 구현하기",
          description: "리스트로 스택(LIFO)을 구현합니다.",
          starterCode: `# 스택 클래스
class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        """스택에 항목 추가"""
        self.items.append(item)

    def pop(self):
        """스택에서 항목 제거 및 반환"""
        if not self.is_empty():
            return self.items.pop()
        return None

    def peek(self):
        """맨 위 항목 확인 (제거 안 함)"""
        if not self.is_empty():
            return self.items[-1]
        return None

    def is_empty(self):
        """스택이 비어있는지 확인"""
        return len(self.items) == 0

    def size(self):
        """스택 크기 반환"""
        return len(self.items)

# 테스트
stack = Stack()
stack.push(1)
stack.push(2)
stack.push(3)
print(f"스택 크기: {stack.size()}")
print(f"Pop: {stack.pop()}")  # 3
print(f"Pop: {stack.pop()}")  # 2`,
          hint: "스택은 후입선출(LIFO) 구조입니다. 마지막에 넣은 것이 먼저 나옵니다!"
        },
        {
          id: "middle-4-2",
          title: "괄호 짝 맞추기",
          description: "스택을 사용하여 괄호가 올바른지 검사합니다.",
          starterCode: `def is_balanced(expression):
    """괄호 짝이 맞는지 확인"""
    stack = []
    pairs = {'(': ')', '[': ']', '{': '}'}

    for char in expression:
        if char in pairs.keys():  # 여는 괄호
            stack.append(char)
        elif char in pairs.values():  # 닫는 괄호
            if not stack:
                return False
            if pairs[stack.pop()] != char:
                return False

    return len(stack) == 0

# 테스트
test_cases = [
    "(())",
    "({[]})",
    "(()",
    "({[}])",
    "{[()]}"
]

for expr in test_cases:
    result = is_balanced(expr)
    print(f"{expr}: {'올바름' if result else '틀림'}")`,
          hint: "여는 괄호는 스택에 넣고, 닫는 괄호를 만나면 스택에서 꺼내 짝이 맞는지 확인합니다!"
        },
        {
          id: "middle-4-3",
          title: "큐 구현하기",
          description: "리스트로 큐(FIFO)를 구현합니다.",
          starterCode: `# 큐 클래스
class Queue:
    def __init__(self):
        self.items = []

    def enqueue(self, item):
        """큐에 항목 추가 (뒤에 삽입)"""
        self.items.append(item)

    def dequeue(self):
        """큐에서 항목 제거 및 반환 (앞에서 제거)"""
        if not self.is_empty():
            return self.items.pop(0)
        return None

    def front(self):
        """맨 앞 항목 확인"""
        if not self.is_empty():
            return self.items[0]
        return None

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

# 테스트: 은행 대기열
queue = Queue()
queue.enqueue("민수")
queue.enqueue("영희")
queue.enqueue("철수")

print("대기 순서:")
while not queue.is_empty():
    print(f"{queue.dequeue()}님 차례입니다")`,
          hint: "큐는 선입선출(FIFO) 구조입니다. 먼저 들어간 것이 먼저 나옵니다!"
        }
      ]
    },
    {
      level: 5,
      title: "그래프 탐색 알고리즘",
      concepts: ["깊이 우선 탐색", "너비 우선 탐색", "그래프 표현"],
      activities: [
        {
          id: "middle-5-1",
          title: "그래프 표현하기",
          description: "인접 리스트로 그래프를 표현합니다.",
          starterCode: `# 그래프를 딕셔너리로 표현
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}

# 그래프 출력
print("그래프 구조:")
for node, neighbors in graph.items():
    print(f"{node}: {neighbors}")

# A -- B -- D
# |    |
# C    E -- F`,
          hint: "그래프는 노드(정점)와 간선으로 이루어집니다. 딕셔너리로 각 노드의 이웃을 저장합니다."
        },
        {
          id: "middle-5-2",
          title: "깊이 우선 탐색 (DFS)",
          description: "재귀로 DFS를 구현합니다.",
          starterCode: `# DFS: 한 방향으로 끝까지 탐색
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()

    # 현재 노드 방문
    visited.add(start)
    print(start, end=' ')

    # 인접 노드 재귀 방문
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)

# 그래프
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}

print("DFS 탐색 순서:")
dfs(graph, 'A')`,
          hint: "DFS는 스택이나 재귀를 사용합니다. 한 경로를 끝까지 탐색한 후 다른 경로를 탐색합니다!"
        },
        {
          id: "middle-5-3",
          title: "너비 우선 탐색 (BFS)",
          description: "큐를 사용하여 BFS를 구현합니다.",
          starterCode: `from collections import deque

# BFS: 가까운 노드부터 탐색
def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)

    print("BFS 탐색 순서:")
    while queue:
        # 큐에서 노드 꺼내기
        node = queue.popleft()
        print(node, end=' ')

        # 인접 노드를 큐에 추가
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

# 그래프
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}

bfs(graph, 'A')`,
          hint: "BFS는 큐를 사용합니다. 현재 노드의 모든 이웃을 먼저 방문한 후 다음 레벨로 이동합니다!"
        }
      ]
    },
    {
      level: 6,
      title: "트리와 연결 리스트",
      concepts: ["트리", "이진 트리 순회", "연결 리스트"],
      activities: [
        {
          id: "middle-6-1",
          title: "트리 기본 개념",
          description: "트리 구조를 이해하고 딕셔너리로 표현합니다.",
          starterCode: `# 트리 구조 (딕셔너리로 표현)
# 각 노드는 자식 리스트를 가짐
tree = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F', 'G'],
    'D': [],
    'E': [],
    'F': [],
    'G': []
}

# 트리 출력 (계층 표시)
def print_tree(node, tree, level=0):
    """트리를 계층적으로 출력"""
    print("  " * level + f"└─ {node}")
    for child in tree[node]:
        print_tree(child, tree, level + 1)

print("트리 구조:")
print_tree('A', tree)`,
          hint: "트리는 계층적 구조입니다. 루트(최상위)부터 시작해 부모-자식 관계로 연결됩니다."
        },
        {
          id: "middle-6-2",
          title: "이진 트리 순회 - 전위/중위/후위",
          description: "3가지 순회 방법을 구현하고 비교합니다.",
          starterCode: `# 이진 트리 노드
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

# 트리 생성
#       1
#      / \\
#     2   3
#    / \\
#   4   5

root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)

# 전위 순회 (Pre-order): 루트 → 왼쪽 → 오른쪽
def preorder(node):
    if node:
        print(node.value, end=' ')
        preorder(node.left)
        preorder(node.right)

# 중위 순회 (In-order): 왼쪽 → 루트 → 오른쪽
def inorder(node):
    if node:
        inorder(node.left)
        print(node.value, end=' ')
        inorder(node.right)

# 후위 순회 (Post-order): 왼쪽 → 오른쪽 → 루트
def postorder(node):
    if node:
        postorder(node.left)
        postorder(node.right)
        print(node.value, end=' ')

print("전위 순회:", end=' ')
preorder(root)
print("\\n중위 순회:", end=' ')
inorder(root)
print("\\n후위 순회:", end=' ')
postorder(root)`,
          hint: "전위는 '루트→왼→오', 중위는 '왼→루트→오', 후위는 '왼→오→루트' 순서로 방문합니다."
        },
        {
          id: "middle-6-3",
          title: "연결 리스트 구현하기",
          description: "노드를 연결하여 리스트를 만듭니다.",
          starterCode: `# 노드 클래스
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

# 연결 리스트 클래스
class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        """끝에 노드 추가"""
        new_node = Node(data)

        if not self.head:
            self.head = new_node
            return

        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def print_list(self):
        """리스트 출력"""
        current = self.head
        while current:
            print(current.data, end=' → ')
            current = current.next
        print("None")

    def insert_at_beginning(self, data):
        """맨 앞에 노드 추가"""
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

# 테스트
llist = LinkedList()
llist.append(10)
llist.append(20)
llist.append(30)

print("연결 리스트:")
llist.print_list()

llist.insert_at_beginning(5)
print("\\n맨 앞에 5 추가:")
llist.print_list()`,
          hint: "연결 리스트는 각 노드가 다음 노드를 가리킵니다. 배열과 달리 중간 삽입/삭제가 효율적입니다."
        },
        {
          id: "middle-6-4",
          title: "연결 리스트 탐색과 삭제",
          description: "연결 리스트에서 값을 찾고 삭제합니다.",
          starterCode: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def search(self, target):
        """값 검색"""
        current = self.head
        position = 0

        while current:
            if current.data == target:
                return position
            current = current.next
            position += 1

        return -1

    def delete(self, target):
        """값 삭제"""
        if not self.head:
            return

        # 첫 번째 노드가 삭제 대상
        if self.head.data == target:
            self.head = self.head.next
            return

        # 중간이나 끝 노드 삭제
        current = self.head
        while current.next:
            if current.next.data == target:
                current.next = current.next.next
                return
            current = current.next

    def print_list(self):
        current = self.head
        while current:
            print(current.data, end=' → ')
            current = current.next
        print("None")

# 테스트
llist = LinkedList()
for val in [10, 20, 30, 40, 50]:
    llist.append(val)

print("초기 리스트:")
llist.print_list()

pos = llist.search(30)
print(f"\\n30의 위치: {pos}")

llist.delete(30)
print("\\n30 삭제 후:")
llist.print_list()`,
          hint: "삭제할 때는 이전 노드의 next를 변경해야 합니다."
        }
      ]
    }
  ]
};

// 고등학교 알고리즘 커리큘럼
export const highSchoolAlgorithmCurriculum: Curriculum = {
  id: "algorithm-high",
  title: "알고리즘 고급",
  gradeLevel: "high",
  gradeLevelKorean: "고등학교",
  description: "동적 프로그래밍, 그래프, 고급 자료구조를 정복해요!",
  icon: "fi fi-rr-rocket",
  color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  levels: [
    {
      level: 1,
      title: "고급 정렬 알고리즘",
      concepts: ["병합 정렬", "퀵 정렬", "분할 정복"],
      activities: [
        {
          id: "high-1-1",
          title: "병합 정렬 구현하기",
          description: "분할 정복 기법으로 병합 정렬을 구현합니다.",
          starterCode: `# 병합 정렬 (Merge Sort) - O(n log n)
def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    # 분할 (Divide)
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    # 정복 (Conquer) - 병합
    return merge(left, right)

def merge(left, right):
    """두 정렬된 리스트를 병합"""
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    # 남은 원소 추가
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# 테스트
numbers = [38, 27, 43, 3, 9, 82, 10]
print(f"정렬 전: {numbers}")
sorted_numbers = merge_sort(numbers)
print(f"정렬 후: {sorted_numbers}")`,
          hint: "병합 정렬은 리스트를 절반씩 나누어 정렬한 후 합칩니다. 안정적인 O(n log n) 알고리즘!"
        },
        {
          id: "high-1-2",
          title: "퀵 정렬 구현하기",
          description: "피벗을 기준으로 퀵 정렬을 구현합니다.",
          starterCode: `# 퀵 정렬 (Quick Sort) - 평균 O(n log n)
def quick_sort(arr):
    if len(arr) <= 1:
        return arr

    # 피벗 선택 (중간 원소)
    pivot = arr[len(arr) // 2]

    # 3개 그룹으로 분할
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    # 재귀적으로 정렬 후 합침
    return quick_sort(left) + middle + quick_sort(right)

# 테스트
numbers = [38, 27, 43, 3, 9, 82, 10]
print(f"정렬 전: {numbers}")
sorted_numbers = quick_sort(numbers)
print(f"정렬 후: {sorted_numbers}")`,
          hint: "퀵 정렬은 피벗을 기준으로 작은 값과 큰 값을 분리합니다. 평균적으로 가장 빠른 정렬!"
        },
        {
          id: "high-1-3",
          title: "정렬 알고리즘 성능 비교",
          description: "여러 정렬 알고리즘의 성능을 시각적으로 비교합니다.",
          starterCode: `import time
import random

def measure_sort_time(sort_func, data):
    """정렬 시간 측정"""
    start = time.time()
    sort_func(data.copy())
    return time.time() - start

# 정렬 함수들
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n-1-i):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]

# 테스트 데이터 크기별 비교
sizes = [10, 50, 100, 200]
sorts = [bubble_sort, merge_sort, quick_sort]

print("데이터 크기별 정렬 성능 (초):")
print(f"{'크기':<8}", end='')
for sort in sorts:
    print(f"{sort.__name__:<15}", end='')
print()

for size in sizes:
    data = [random.randint(1, 1000) for _ in range(size)]
    print(f"{size:<8}", end='')
    for sort in sorts:
        time_taken = measure_sort_time(sort, data)
        print(f"{time_taken:<15.6f}", end='')
    print()`,
          hint: "데이터가 많아질수록 알고리즘 효율성의 차이가 뚜렷해집니다!"
        }
      ]
    },
    {
      level: 2,
      title: "동적 프로그래밍 (Dynamic Programming)",
      concepts: ["동적 프로그래밍", "메모이제이션", "최적화"],
      activities: [
        {
          id: "high-2-1",
          title: "피보나치 - 메모이제이션",
          description: "메모이제이션으로 피보나치를 최적화합니다.",
          starterCode: `# 일반 재귀 (비효율적)
def fib_recursive(n):
    if n <= 1:
        return n
    return fib_recursive(n-1) + fib_recursive(n-2)

# 메모이제이션 (효율적)
def fib_memo(n, memo=None):
    if memo is None:
        memo = {}

    if n in memo:
        return memo[n]

    if n <= 1:
        return n

    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]

# 성능 비교
import time

n = 35
print(f"피보나치({n}) 계산:")

start = time.time()
result1 = fib_recursive(n)
time1 = time.time() - start
print(f"일반 재귀: {result1}, 시간: {time1:.4f}초")

start = time.time()
result2 = fib_memo(n)
time2 = time.time() - start
print(f"메모이제이션: {result2}, 시간: {time2:.4f}초")
print(f"속도 향상: {time1/time2:.0f}배")`,
          hint: "메모이제이션은 계산한 값을 저장하여 재사용합니다. 중복 계산을 없애 성능을 획기적으로 향상!"
        },
        {
          id: "high-2-2",
          title: "최장 공통 부분 수열 (LCS)",
          description: "동적 프로그래밍으로 LCS를 찾습니다.",
          starterCode: `# 최장 공통 부분 수열 (Longest Common Subsequence)
def lcs(text1, text2):
    m, n = len(text1), len(text2)

    # DP 테이블 생성
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    # DP 테이블 채우기
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    return dp[m][n]

# 테스트
text1 = "ABCDGH"
text2 = "AEDFHR"
result = lcs(text1, text2)
print(f"'{text1}'와 '{text2}'의 LCS 길이: {result}")
# 답: 3 (ADH)

text1 = "AGGTAB"
text2 = "GXTXAYB"
result = lcs(text1, text2)
print(f"'{text1}'와 '{text2}'의 LCS 길이: {result}")
# 답: 4 (GTAB)`,
          hint: "LCS는 두 문자열의 공통된 가장 긴 부분 수열을 찾습니다. DNA 분석, 파일 비교 등에 사용!"
        },
        {
          id: "high-2-3",
          title: "0/1 배낭 문제",
          description: "동적 프로그래밍으로 배낭 문제를 해결합니다.",
          starterCode: `# 0/1 배낭 문제 (Knapsack Problem)
def knapsack(weights, values, capacity):
    """
    weights: 물건들의 무게
    values: 물건들의 가치
    capacity: 배낭 용량
    """
    n = len(weights)

    # DP 테이블: dp[i][w] = i번째까지 고려, 용량 w일 때 최대 가치
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            # i-1번째 물건
            weight = weights[i-1]
            value = values[i-1]

            if weight <= w:
                # 넣는 경우 vs 안 넣는 경우
                dp[i][w] = max(
                    dp[i-1][w],  # 안 넣음
                    dp[i-1][w-weight] + value  # 넣음
                )
            else:
                dp[i][w] = dp[i-1][w]  # 못 넣음

    return dp[n][capacity]

# 테스트
weights = [2, 1, 3, 2]
values = [12, 10, 20, 15]
capacity = 5

max_value = knapsack(weights, values, capacity)
print(f"배낭 용량 {capacity}kg일 때 최대 가치: {max_value}")
# 물건 2(1kg, 10) + 물건 3(3kg, 20) + 물건 4(1kg, 15) = 45`,
          hint: "배낭 문제는 제한된 용량에서 가치를 최대화하는 조합을 찾습니다. 자원 할당 문제의 기본!"
        }
      ]
    },
    {
      level: 3,
      title: "그래프 알고리즘 - 최단 경로",
      concepts: ["최단 경로", "다익스트라 알고리즘", "가중치 그래프"],
      activities: [
        {
          id: "high-3-1",
          title: "다익스트라 알고리즘 구현",
          description: "우선순위 큐를 사용한 최단 경로 찾기",
          starterCode: `import heapq

def dijkstra(graph, start):
    """
    다익스트라 알고리즘으로 최단 거리 계산
    graph: {node: [(neighbor, weight), ...]}
    """
    # 최단 거리 테이블
    distances = {node: float('inf') for node in graph}
    distances[start] = 0

    # 우선순위 큐: (거리, 노드)
    pq = [(0, start)]

    while pq:
        current_dist, current_node = heapq.heappop(pq)

        # 이미 처리된 노드는 무시
        if current_dist > distances[current_node]:
            continue

        # 인접 노드 확인
        for neighbor, weight in graph[current_node]:
            distance = current_dist + weight

            # 더 짧은 경로 발견
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))

    return distances

# 가중치 그래프
graph = {
    'A': [('B', 4), ('C', 2)],
    'B': [('A', 4), ('C', 1), ('D', 5)],
    'C': [('A', 2), ('B', 1), ('D', 8), ('E', 10)],
    'D': [('B', 5), ('C', 8), ('E', 2)],
    'E': [('C', 10), ('D', 2)]
}

distances = dijkstra(graph, 'A')
print("A에서 각 노드까지의 최단 거리:")
for node, dist in sorted(distances.items()):
    print(f"A -> {node}: {dist}")`,
          hint: "다익스트라는 음의 가중치가 없는 그래프에서 최단 경로를 찾습니다. GPS 내비게이션에 사용!"
        },
        {
          id: "high-3-2",
          title: "최단 경로 역추적",
          description: "최단 경로의 실제 경로를 찾습니다.",
          starterCode: `import heapq

def dijkstra_path(graph, start, end):
    """최단 거리와 경로를 함께 반환"""
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    previous = {node: None for node in graph}  # 경로 추적용

    pq = [(0, start)]

    while pq:
        current_dist, current_node = heapq.heappop(pq)

        if current_node == end:
            break

        if current_dist > distances[current_node]:
            continue

        for neighbor, weight in graph[current_node]:
            distance = current_dist + weight

            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))

    # 경로 역추적
    path = []
    current = end
    while current is not None:
        path.append(current)
        current = previous[current]
    path.reverse()

    return distances[end], path

# 테스트
graph = {
    'A': [('B', 4), ('C', 2)],
    'B': [('A', 4), ('C', 1), ('D', 5)],
    'C': [('A', 2), ('B', 1), ('D', 8), ('E', 10)],
    'D': [('B', 5), ('C', 8), ('E', 2)],
    'E': [('C', 10), ('D', 2)]
}

distance, path = dijkstra_path(graph, 'A', 'E')
print(f"A에서 E까지 최단 거리: {distance}")
print(f"경로: {' -> '.join(path)}")`,
          hint: "previous 딕셔너리로 각 노드에 도달하기 전의 노드를 기록하여 경로를 역추적합니다!"
        }
      ]
    },
    {
      level: 4,
      title: "그리디 알고리즘",
      concepts: ["그리디 알고리즘", "최적화", "활동 선택"],
      activities: [
        {
          id: "high-4-1",
          title: "거스름돈 문제",
          description: "그리디로 최소 동전 개수 구하기",
          starterCode: `# 거스름돈 문제 (동전 개수 최소화)
def min_coins_greedy(amount, coins):
    """
    그리디 알고리즘으로 거스름돈 계산
    coins는 내림차순 정렬되어야 함
    """
    coins.sort(reverse=True)  # 큰 동전부터
    result = []

    for coin in coins:
        count = amount // coin
        if count > 0:
            result.extend([coin] * count)
            amount -= coin * count

    return result

# 테스트
coins = [500, 100, 50, 10]
amount = 1260

result = min_coins_greedy(amount, coins)
print(f"{amount}원을 거슬러주는 방법:")
print(f"동전: {result}")
print(f"총 {len(result)}개")

# 500원 2개 + 100원 2개 + 50원 1개 + 10원 1개 = 6개`,
          hint: "그리디는 매 선택에서 가장 좋아 보이는 것을 선택합니다. 항상 최적해를 보장하지는 않습니다!"
        },
        {
          id: "high-4-2",
          title: "회의실 배정 문제",
          description: "최대한 많은 회의를 배정하기",
          starterCode: `# 회의실 배정 문제 (Activity Selection Problem)
def activity_selection(meetings):
    """
    meetings: [(start, end), ...] 형태의 회의 목록
    끝나는 시간이 빠른 순으로 정렬하여 선택
    """
    # 끝나는 시간 기준 정렬
    meetings.sort(key=lambda x: x[1])

    selected = []
    last_end_time = 0

    for start, end in meetings:
        # 이전 회의가 끝난 후 시작하는 회의만 선택
        if start >= last_end_time:
            selected.append((start, end))
            last_end_time = end

    return selected

# 테스트
meetings = [
    (1, 4),   # 1시~4시
    (3, 5),   # 3시~5시
    (0, 6),   # 0시~6시
    (5, 7),   # 5시~7시
    (3, 9),   # 3시~9시
    (5, 9),   # 5시~9시
    (6, 10),  # 6시~10시
    (8, 11),  # 8시~11시
    (8, 12),  # 8시~12시
    (2, 14),  # 2시~14시
    (12, 16)  # 12시~16시
]

selected = activity_selection(meetings)
print(f"선택된 회의: {len(selected)}개")
for i, (start, end) in enumerate(selected, 1):
    print(f"{i}. {start}시 ~ {end}시")`,
          hint: "끝나는 시간이 빠른 회의를 우선 선택하면 최대 개수의 회의를 배정할 수 있습니다!"
        },
        {
          id: "high-4-3",
          title: "허프만 코딩",
          description: "그리디로 최적 이진 코드 만들기",
          starterCode: `import heapq
from collections import defaultdict

class Node:
    def __init__(self, char, freq):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None

    def __lt__(self, other):
        return self.freq < other.freq

def huffman_coding(text):
    """허프만 코딩으로 압축"""
    # 빈도수 계산
    freq = defaultdict(int)
    for char in text:
        freq[char] += 1

    # 우선순위 큐에 각 문자를 노드로 추가
    heap = [Node(char, f) for char, f in freq.items()]
    heapq.heapify(heap)

    # 허프만 트리 생성
    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)

        merged = Node(None, left.freq + right.freq)
        merged.left = left
        merged.right = right

        heapq.heappush(heap, merged)

    # 코드 생성
    root = heap[0]
    codes = {}

    def generate_codes(node, code):
        if node.char is not None:
            codes[node.char] = code
            return
        if node.left:
            generate_codes(node.left, code + '0')
        if node.right:
            generate_codes(node.right, code + '1')

    generate_codes(root, '')
    return codes

# 테스트
text = "ABRACADABRA"
codes = huffman_coding(text)

print("허프만 코딩 결과:")
for char, code in sorted(codes.items()):
    print(f"'{char}': {code}")

# 압축 결과
encoded = ''.join(codes[char] for char in text)
print(f"\\n원본: {text} ({len(text) * 8}bits)")
print(f"압축: {encoded} ({len(encoded)}bits)")
print(f"압축률: {len(encoded) / (len(text) * 8) * 100:.1f}%")`,
          hint: "허프만 코딩은 빈도가 높은 문자에 짧은 코드를 부여하여 데이터를 압축합니다!"
        }
      ]
    },
    {
      level: 5,
      title: "고급 자료구조",
      concepts: ["이진 트리", "해시 테이블", "힙"],
      activities: [
        {
          id: "high-5-1",
          title: "이진 탐색 트리 (BST) 구현",
          description: "이진 탐색 트리의 삽입, 탐색, 삭제",
          starterCode: `# 이진 탐색 트리 노드
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BinarySearchTree:
    def __init__(self):
        self.root = None

    def insert(self, value):
        """값 삽입"""
        if self.root is None:
            self.root = TreeNode(value)
        else:
            self._insert_recursive(self.root, value)

    def _insert_recursive(self, node, value):
        if value < node.value:
            if node.left is None:
                node.left = TreeNode(value)
            else:
                self._insert_recursive(node.left, value)
        else:
            if node.right is None:
                node.right = TreeNode(value)
            else:
                self._insert_recursive(node.right, value)

    def search(self, value):
        """값 탐색"""
        return self._search_recursive(self.root, value)

    def _search_recursive(self, node, value):
        if node is None:
            return False
        if node.value == value:
            return True
        elif value < node.value:
            return self._search_recursive(node.left, value)
        else:
            return self._search_recursive(node.right, value)

    def inorder(self):
        """중위 순회 (정렬된 순서)"""
        result = []
        self._inorder_recursive(self.root, result)
        return result

    def _inorder_recursive(self, node, result):
        if node:
            self._inorder_recursive(node.left, result)
            result.append(node.value)
            self._inorder_recursive(node.right, result)

# 테스트
bst = BinarySearchTree()
values = [50, 30, 70, 20, 40, 60, 80]

for val in values:
    bst.insert(val)

print(f"삽입한 값: {values}")
print(f"중위 순회 (정렬됨): {bst.inorder()}")
print(f"40 탐색: {bst.search(40)}")
print(f"25 탐색: {bst.search(25)}")`,
          hint: "BST는 왼쪽 자식 < 부모 < 오른쪽 자식 규칙을 따릅니다. 평균 O(log n) 탐색!"
        },
        {
          id: "high-5-2",
          title: "해시 테이블 구현",
          description: "체이닝으로 충돌 해결하는 해시 테이블",
          starterCode: `# 해시 테이블 (체이닝 방식)
class HashTable:
    def __init__(self, size=10):
        self.size = size
        self.table = [[] for _ in range(size)]

    def _hash(self, key):
        """해시 함수"""
        return hash(key) % self.size

    def insert(self, key, value):
        """키-값 쌍 삽입"""
        index = self._hash(key)

        # 기존 키 업데이트
        for i, (k, v) in enumerate(self.table[index]):
            if k == key:
                self.table[index][i] = (key, value)
                return

        # 새 키 추가
        self.table[index].append((key, value))

    def get(self, key):
        """값 조회"""
        index = self._hash(key)

        for k, v in self.table[index]:
            if k == key:
                return v

        raise KeyError(f"Key '{key}' not found")

    def delete(self, key):
        """키-값 삭제"""
        index = self._hash(key)

        for i, (k, v) in enumerate(self.table[index]):
            if k == key:
                del self.table[index][i]
                return

        raise KeyError(f"Key '{key}' not found")

    def __str__(self):
        items = []
        for bucket in self.table:
            items.extend(bucket)
        return str(dict(items))

# 테스트
ht = HashTable(5)
ht.insert("apple", 100)
ht.insert("banana", 200)
ht.insert("orange", 150)

print("해시 테이블:", ht)
print("apple:", ht.get("apple"))
print("banana:", ht.get("banana"))

ht.delete("banana")
print("banana 삭제 후:", ht)`,
          hint: "해시 테이블은 평균 O(1) 시간에 삽입, 삭제, 조회가 가능합니다. 딕셔너리의 내부 구조!"
        },
        {
          id: "high-5-3",
          title: "최소 힙 구현",
          description: "배열 기반 최소 힙 자료구조",
          starterCode: `# 최소 힙 (Min Heap)
class MinHeap:
    def __init__(self):
        self.heap = []

    def parent(self, i):
        return (i - 1) // 2

    def left_child(self, i):
        return 2 * i + 1

    def right_child(self, i):
        return 2 * i + 2

    def swap(self, i, j):
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]

    def insert(self, value):
        """값 삽입"""
        self.heap.append(value)
        self._heapify_up(len(self.heap) - 1)

    def _heapify_up(self, i):
        """위로 올리며 힙 속성 유지"""
        parent = self.parent(i)
        if i > 0 and self.heap[i] < self.heap[parent]:
            self.swap(i, parent)
            self._heapify_up(parent)

    def extract_min(self):
        """최솟값 제거 및 반환"""
        if not self.heap:
            return None

        min_val = self.heap[0]
        self.heap[0] = self.heap[-1]
        self.heap.pop()

        if self.heap:
            self._heapify_down(0)

        return min_val

    def _heapify_down(self, i):
        """아래로 내리며 힙 속성 유지"""
        min_index = i
        left = self.left_child(i)
        right = self.right_child(i)

        if left < len(self.heap) and self.heap[left] < self.heap[min_index]:
            min_index = left

        if right < len(self.heap) and self.heap[right] < self.heap[min_index]:
            min_index = right

        if min_index != i:
            self.swap(i, min_index)
            self._heapify_down(min_index)

    def peek(self):
        """최솟값 확인 (제거 안 함)"""
        return self.heap[0] if self.heap else None

# 테스트
heap = MinHeap()
values = [5, 3, 7, 1, 9, 2]

for val in values:
    heap.insert(val)
    print(f"{val} 삽입 후 힙: {heap.heap}")

print("\\n최솟값 추출:")
while heap.heap:
    print(heap.extract_min(), end=' ')`,
          hint: "힙은 우선순위 큐 구현에 사용됩니다. 삽입/삭제가 O(log n)으로 효율적입니다!"
        }
      ]
    },
    {
      level: 6,
      title: "백트래킹 - 모든 경우 탐색하기",
      concepts: ["백트래킹", "N-Queen 문제", "조합 탐색"],
      activities: [
        {
          id: "high-6-1",
          title: "백트래킹 기초 - 부분집합 생성",
          description: "백트래킹으로 모든 부분집합을 생성합니다.",
          starterCode: `def generate_subsets(nums):
    """백트래킹으로 모든 부분집합 생성"""
    result = []

    def backtrack(start, current):
        # 현재 부분집합 저장
        result.append(current[:])

        # 가능한 모든 경우 탐색
        for i in range(start, len(nums)):
            # 선택
            current.append(nums[i])
            # 재귀 호출
            backtrack(i + 1, current)
            # 선택 취소 (백트래킹)
            current.pop()

    backtrack(0, [])
    return result

# 테스트
nums = [1, 2, 3]
subsets = generate_subsets(nums)

print(f"{nums}의 모든 부분집합 ({len(subsets)}개):")
for i, subset in enumerate(subsets):
    print(f"{i}: {subset}")`,
          hint: "백트래킹은 선택 → 재귀 → 선택 취소 패턴으로 모든 경우를 탐색합니다."
        },
        {
          id: "high-6-2",
          title: "N-Queen 문제",
          description: "N×N 체스판에 N개의 퀸을 배치합니다.",
          starterCode: `def solve_n_queens(n):
    """N-Queen 문제 해결"""
    def is_safe(board, row, col):
        """현재 위치에 퀸을 놓을 수 있는지 확인"""
        # 같은 열 확인
        for i in range(row):
            if board[i] == col:
                return False

        # 왼쪽 대각선 확인
        for i in range(row):
            if board[i] == col - (row - i):
                return False

        # 오른쪽 대각선 확인
        for i in range(row):
            if board[i] == col + (row - i):
                return False

        return True

    def backtrack(row, board):
        """백트래킹으로 퀸 배치"""
        if row == n:
            solutions.append(board[:])
            return

        for col in range(n):
            if is_safe(board, row, col):
                board[row] = col
                backtrack(row + 1, board)
                board[row] = -1  # 백트래킹

    solutions = []
    backtrack(0, [-1] * n)
    return solutions

# 4×4 체스판
solutions = solve_n_queens(4)
print(f"4-Queen 문제의 해: {len(solutions)}가지\\n")

for i, sol in enumerate(solutions[:2], 1):  # 처음 2개만 출력
    print(f"해 #{i}:")
    for row in range(4):
        line = ""
        for col in range(4):
            line += "Q " if sol[row] == col else ". "
        print(line)
    print()`,
          hint: "각 행에 퀸을 하나씩 배치하며, 공격 가능 여부를 체크합니다. 불가능하면 백트래킹!"
        },
        {
          id: "high-6-3",
          title: "조합 생성 (nCr)",
          description: "백트래킹으로 모든 조합을 생성합니다.",
          starterCode: `def combinations(n, r):
    """n개 중 r개를 선택하는 모든 조합"""
    result = []

    def backtrack(start, current):
        # r개를 선택했으면 저장
        if len(current) == r:
            result.append(current[:])
            return

        # 남은 개수가 부족하면 중단 (가지치기)
        if start + (r - len(current)) > n:
            return

        for i in range(start, n + 1):
            current.append(i)
            backtrack(i + 1, current)
            current.pop()

    backtrack(1, [])
    return result

# 5C3 계산
n, r = 5, 3
combs = combinations(n, r)

print(f"{n}C{r} = {len(combs)}가지:")
for comb in combs:
    print(comb)`,
          hint: "조합은 순서를 고려하지 않습니다. start 인덱스로 중복을 방지합니다."
        },
        {
          id: "high-6-4",
          title: "스도쿠 솔버",
          description: "백트래킹으로 스도쿠를 해결합니다.",
          starterCode: `def solve_sudoku(board):
    """스도쿠 솔버 (9×9)"""
    def is_valid(row, col, num):
        """num을 (row, col)에 놓을 수 있는지 확인"""
        # 행 확인
        if num in board[row]:
            return False

        # 열 확인
        if num in [board[i][col] for i in range(9)]:
            return False

        # 3×3 박스 확인
        box_row, box_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                if board[i][j] == num:
                    return False

        return True

    def backtrack():
        """빈 칸을 찾아 백트래킹"""
        for row in range(9):
            for col in range(9):
                if board[row][col] == 0:
                    for num in range(1, 10):
                        if is_valid(row, col, num):
                            board[row][col] = num

                            if backtrack():
                                return True

                            board[row][col] = 0  # 백트래킹

                    return False  # 1~9 모두 불가능
        return True  # 모든 칸이 채워짐

    backtrack()
    return board

# 간단한 스도쿠 문제
board = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
]

print("스도쿠 해결:")
solve_sudoku(board)
for row in board:
    print(row)`,
          hint: "빈 칸마다 1~9를 시도하며, 조건을 만족하지 않으면 백트래킹합니다."
        }
      ]
    },
    {
      level: 7,
      title: "유니온-파인드와 최소 신장 트리",
      concepts: ["유니온-파인드", "최소 신장 트리", "크루스칼 알고리즘", "프림 알고리즘"],
      activities: [
        {
          id: "high-7-1",
          title: "유니온-파인드 (Disjoint Set) 구현",
          description: "서로소 집합을 효율적으로 관리합니다.",
          starterCode: `class UnionFind:
    """유니온-파인드 자료구조"""
    def __init__(self, n):
        self.parent = list(range(n))  # 각 노드의 부모
        self.rank = [0] * n  # 트리의 높이

    def find(self, x):
        """x가 속한 집합의 루트 찾기 (경로 압축)"""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # 경로 압축
        return self.parent[x]

    def union(self, x, y):
        """x와 y가 속한 집합을 합치기 (랭크 기반)"""
        root_x = self.find(x)
        root_y = self.find(y)

        if root_x == root_y:
            return False  # 이미 같은 집합

        # 랭크가 낮은 트리를 높은 트리 아래에 붙임
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1

        return True

    def is_connected(self, x, y):
        """x와 y가 같은 집합에 속하는지 확인"""
        return self.find(x) == self.find(y)

# 테스트
uf = UnionFind(6)

# 집합 합치기
uf.union(0, 1)
uf.union(1, 2)
uf.union(3, 4)

print("연결 확인:")
print(f"0과 2 연결? {uf.is_connected(0, 2)}")  # True
print(f"2와 3 연결? {uf.is_connected(2, 3)}")  # False

uf.union(2, 3)
print(f"2와 3 연결? {uf.is_connected(2, 3)}")  # True`,
          hint: "경로 압축과 랭크 기반 합치기로 거의 O(1) 시간 복잡도를 달성합니다!"
        },
        {
          id: "high-7-2",
          title: "크루스칼 알고리즘 - MST 구하기",
          description: "간선을 정렬하여 최소 신장 트리를 구합니다.",
          starterCode: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        root_x, root_y = self.find(x), self.find(y)
        if root_x == root_y:
            return False
        self.parent[root_x] = root_y
        return True

def kruskal_mst(n, edges):
    """크루스칼 알고리즘으로 MST 구하기"""
    # 간선을 가중치 순으로 정렬
    edges.sort(key=lambda x: x[2])

    uf = UnionFind(n)
    mst = []
    total_cost = 0

    for u, v, weight in edges:
        # 사이클이 생기지 않으면 추가
        if uf.union(u, v):
            mst.append((u, v, weight))
            total_cost += weight

            # n-1개 간선이면 완성
            if len(mst) == n - 1:
                break

    return mst, total_cost

# 그래프: (정점1, 정점2, 가중치)
n = 6
edges = [
    (0, 1, 4),
    (0, 2, 3),
    (1, 2, 1),
    (1, 3, 2),
    (2, 3, 4),
    (3, 4, 2),
    (4, 5, 6)
]

mst, cost = kruskal_mst(n, edges)

print("최소 신장 트리 (크루스칼):")
for u, v, w in mst:
    print(f"{u} - {v}: 가중치 {w}")
print(f"\\n총 비용: {cost}")`,
          hint: "크루스칼은 간선을 가중치 순으로 정렬하고, 사이클을 만들지 않는 간선만 선택합니다."
        },
        {
          id: "high-7-3",
          title: "프림 알고리즘 - MST 구하기",
          description: "우선순위 큐로 최소 신장 트리를 구합니다.",
          starterCode: `import heapq

def prim_mst(n, graph, start=0):
    """프림 알고리즘으로 MST 구하기"""
    visited = [False] * n
    mst = []
    total_cost = 0

    # 우선순위 큐: (가중치, 현재 노드, 이전 노드)
    pq = [(0, start, -1)]

    while pq:
        weight, node, prev = heapq.heappop(pq)

        if visited[node]:
            continue

        visited[node] = True
        if prev != -1:
            mst.append((prev, node, weight))
            total_cost += weight

        # 인접 간선을 큐에 추가
        for neighbor, w in graph[node]:
            if not visited[neighbor]:
                heapq.heappush(pq, (w, neighbor, node))

    return mst, total_cost

# 그래프: 인접 리스트
graph = {
    0: [(1, 4), (2, 3)],
    1: [(0, 4), (2, 1), (3, 2)],
    2: [(0, 3), (1, 1), (3, 4)],
    3: [(1, 2), (2, 4), (4, 2)],
    4: [(3, 2), (5, 6)],
    5: [(4, 6)]
}

mst, cost = prim_mst(6, graph)

print("최소 신장 트리 (프림):")
for u, v, w in mst:
    print(f"{u} - {v}: 가중치 {w}")
print(f"\\n총 비용: {cost}")`,
          hint: "프림은 한 정점에서 시작해 트리를 확장하며 MST를 만듭니다. 우선순위 큐를 사용합니다."
        }
      ]
    },
    {
      level: 8,
      title: "위상 정렬과 플로이드-워셜",
      concepts: ["위상 정렬", "플로이드-워셜", "모든 쌍 최단 경로"],
      activities: [
        {
          id: "high-8-1",
          title: "위상 정렬 - DFS 방식",
          description: "DFS로 위상 정렬을 구현합니다.",
          starterCode: `def topological_sort_dfs(graph):
    """DFS 기반 위상 정렬"""
    visited = set()
    stack = []

    def dfs(node):
        visited.add(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                dfs(neighbor)
        stack.append(node)  # 후위 순서로 스택에 추가

    # 모든 노드 방문
    for node in graph:
        if node not in visited:
            dfs(node)

    return stack[::-1]  # 역순으로 반환

# 방향 그래프 (과목 선수 관계)
graph = {
    '미적분학': ['선형대수', '미분방정식'],
    '선형대수': ['양자역학'],
    '프로그래밍': ['자료구조', '알고리즘'],
    '자료구조': ['알고리즘'],
    '알고리즘': [],
    '미분방정식': [],
    '양자역학': []
}

result = topological_sort_dfs(graph)

print("과목 수강 순서 (위상 정렬):")
for i, course in enumerate(result, 1):
    print(f"{i}. {course}")`,
          hint: "위상 정렬은 방향 그래프에서 순서 관계를 유지하며 정점을 나열합니다."
        },
        {
          id: "high-8-2",
          title: "위상 정렬 - Kahn 알고리즘",
          description: "진입 차수를 이용한 위상 정렬입니다.",
          starterCode: `from collections import deque, defaultdict

def topological_sort_kahn(graph, nodes):
    """Kahn 알고리즘 (진입 차수 이용)"""
    # 진입 차수 계산
    in_degree = {node: 0 for node in nodes}
    for node in graph:
        for neighbor in graph[node]:
            in_degree[neighbor] += 1

    # 진입 차수가 0인 노드부터 시작
    queue = deque([node for node in nodes if in_degree[node] == 0])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node)

        # 인접 노드의 진입 차수 감소
        for neighbor in graph.get(node, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # 사이클 확인
    if len(result) != len(nodes):
        return None  # 사이클 존재

    return result

# 그래프
nodes = ['A', 'B', 'C', 'D', 'E', 'F']
graph = {
    'A': ['C', 'D'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': ['F'],
    'E': ['F'],
    'F': []
}

result = topological_sort_kahn(graph, nodes)

if result:
    print("위상 정렬 결과:")
    print(" → ".join(result))
else:
    print("사이클이 존재하여 위상 정렬 불가능")`,
          hint: "Kahn 알고리즘은 진입 차수가 0인 노드를 하나씩 제거하며 정렬합니다."
        },
        {
          id: "high-8-3",
          title: "플로이드-워셜 알고리즘",
          description: "모든 정점 쌍 사이의 최단 경로를 구합니다.",
          starterCode: `def floyd_warshall(n, graph):
    """플로이드-워셜: 모든 쌍 최단 경로"""
    # 거리 행렬 초기화
    INF = float('inf')
    dist = [[INF] * n for _ in range(n)]

    # 자기 자신까지의 거리는 0
    for i in range(n):
        dist[i][i] = 0

    # 간선 정보 입력
    for u, v, w in graph:
        dist[u][v] = w

    # 모든 중간 정점을 거쳐가는 경로 확인
    for k in range(n):  # 중간 정점
        for i in range(n):  # 시작 정점
            for j in range(n):  # 도착 정점
                # i → k → j가 더 짧으면 업데이트
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]

    return dist

# 그래프: (출발, 도착, 가중치)
n = 4
edges = [
    (0, 1, 5),
    (0, 3, 10),
    (1, 2, 3),
    (2, 3, 1),
    (3, 1, 2)
]

dist = floyd_warshall(n, edges)

# 결과 출력
print("모든 쌍 최단 거리:")
print("    ", end="")
for i in range(n):
    print(f"{i:4}", end="")
print()

for i in range(n):
    print(f"{i}: ", end="")
    for j in range(n):
        if dist[i][j] == float('inf'):
            print("  ∞", end=" ")
        else:
            print(f"{dist[i][j]:3}", end=" ")
    print()`,
          hint: "플로이드-워셜은 O(n³) 동적 프로그래밍으로 모든 쌍의 최단 경로를 구합니다."
        },
        {
          id: "high-8-4",
          title: "플로이드-워셜로 경로 역추적",
          description: "최단 경로의 실제 경로를 찾습니다.",
          starterCode: `def floyd_warshall_with_path(n, graph):
    """플로이드-워셜 + 경로 역추적"""
    INF = float('inf')
    dist = [[INF] * n for _ in range(n)]
    next_node = [[None] * n for _ in range(n)]

    # 초기화
    for i in range(n):
        dist[i][i] = 0

    for u, v, w in graph:
        dist[u][v] = w
        next_node[u][v] = v

    # 플로이드-워셜
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    next_node[i][j] = next_node[i][k]

    def get_path(i, j):
        """i에서 j로 가는 경로 구하기"""
        if next_node[i][j] is None:
            return None

        path = [i]
        while i != j:
            i = next_node[i][j]
            path.append(i)
        return path

    return dist, get_path

# 그래프
n = 4
edges = [
    (0, 1, 5),
    (0, 3, 10),
    (1, 2, 3),
    (2, 3, 1),
    (3, 1, 2)
]

dist, get_path = floyd_warshall_with_path(n, edges)

# 0에서 3으로 가는 최단 경로
start, end = 0, 3
path = get_path(start, end)

print(f"{start}에서 {end}까지 최단 경로:")
print(f"거리: {dist[start][end]}")
print(f"경로: {' → '.join(map(str, path))}")`,
          hint: "next_node 배열로 경로를 역추적할 수 있습니다."
        }
      ]
    }
  ]
};

// 전체 알고리즘 커리큘럼 (배열)
export const allAlgorithmCurricula: Curriculum[] = [
  elementaryAlgorithmCurriculum,
  middleSchoolAlgorithmCurriculum,
  highSchoolAlgorithmCurriculum
];
