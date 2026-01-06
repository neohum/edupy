// 확장된 Activity 인터페이스 - 인터랙티브 요소 포함
export interface InteractiveActivity {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  hint?: string;

  // 🎯 인터랙티브 요소
  expectedOutput?: string;           // 기대되는 출력 (자동 채점용)
  testCases?: TestCase[];            // 테스트 케이스
  visualization?: VisualizationType; // 시각화 타입
  quiz?: Quiz;                       // 이론 퀴즈
  challenges?: Challenge[];          // 도전 과제
  interactiveInputs?: InputField[];  // 사용자 입력 필드
  stepByStep?: boolean;              // 단계별 실행 지원
  codeExplanation?: CodeExplanation; // 코드 라인별 설명
}

// 테스트 케이스
export interface TestCase {
  input?: string;     // 입력 데이터
  expectedOutput: string;  // 기대 출력
  description: string;     // 테스트 설명
}

// 시각화 타입
export type VisualizationType =
  | 'sorting'        // 정렬 과정 애니메이션
  | 'searching'      // 탐색 과정 표시
  | 'tree'          // 트리 구조 시각화
  | 'graph'         // 그래프 시각화
  | 'stack-queue'   // 스택/큐 동작
  | 'array'         // 배열 상태 변화
  | 'recursion';    // 재귀 호출 스택

// 퀴즈
export interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;  // 정답 인덱스
  explanation: string;    // 정답 해설
}

// 도전 과제
export interface Challenge {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode?: string;
  solution?: string;  // 모범 답안 (숨김)
}

// 입력 필드
export interface InputField {
  id: string;
  label: string;
  type: 'number' | 'text' | 'array';
  defaultValue?: string | number | number[];
  placeholder?: string;
}

// 코드 설명
export interface CodeExplanation {
  [lineNumber: number]: string;  // 라인 번호: 설명
}

export interface Level {
  level: number;
  title: string;
  concepts: string[];
  activities: InteractiveActivity[];
}

export interface Curriculum {
  title: string;
  levels: Level[];
}

// 🎓 초등학교 - 인터랙티브 알고리즘 커리큘럼
export const elementaryInteractiveCurriculum: Curriculum = {
  title: "초등학교 알고리즘 기초 (인터랙티브)",
  levels: [
    {
      level: 1,
      title: "숫자 찾기 게임 - 순차 탐색",
      concepts: ["순차 탐색", "리스트", "반복문"],
      activities: [
        {
          id: "elem-int-1-1",
          title: "친구 이름 찾기",
          description: "친구 목록에서 특정 이름을 찾는 프로그램을 만듭니다.",
          starterCode: `# 친구 이름 찾기
friends = ["민수", "영희", "철수", "지영", "동현"]
find_name = input("찾을 친구 이름을 입력하세요: ")

# 여기에 순차 탐색 코드를 작성하세요
found = False
for name in friends:
    if name == find_name:
        print(f"{find_name}을(를) 찾았습니다!")
        found = True
        break

if not found:
    print(f"{find_name}을(를) 찾지 못했습니다.")`,
          hint: "리스트를 하나씩 확인하며 찾는 이름과 같은지 비교합니다.",

          // 🎯 인터랙티브 요소
          testCases: [
            {
              input: "철수",
              expectedOutput: "철수을(를) 찾았습니다!",
              description: "목록에 있는 이름 검색"
            },
            {
              input: "수진",
              expectedOutput: "수진을(를) 찾지 못했습니다.",
              description: "목록에 없는 이름 검색"
            }
          ],

          visualization: 'searching',

          quiz: {
            question: "순차 탐색의 시간 복잡도는?",
            options: [
              "O(1) - 항상 빠름",
              "O(n) - 데이터 개수에 비례",
              "O(log n) - 절반씩 줄어듦",
              "O(n²) - 이중 반복문"
            ],
            correctAnswer: 1,
            explanation: "순차 탐색은 최악의 경우 모든 원소를 확인해야 하므로 O(n)입니다."
          },

          challenges: [
            {
              title: "위치도 함께 출력하기",
              description: "이름을 찾았을 때 몇 번째에 있는지도 출력하세요.",
              difficulty: "easy",
              starterCode: `friends = ["민수", "영희", "철수", "지영", "동현"]
find_name = input("찾을 친구 이름: ")

# enumerate()를 사용해보세요!`,
              solution: `friends = ["민수", "영희", "철수", "지영", "동현"]
find_name = input("찾을 친구 이름: ")

for i, name in enumerate(friends):
    if name == find_name:
        print(f"{find_name}은(는) {i+1}번째에 있습니다!")
        break
else:
    print(f"{find_name}을(를) 찾지 못했습니다.")`
            }
          ],

          codeExplanation: {
            2: "input()으로 사용자가 찾을 이름을 입력받습니다.",
            5: "for문으로 friends 리스트를 하나씩 확인합니다.",
            6: "현재 이름이 찾는 이름과 같은지 비교합니다.",
            8: "찾았으면 found를 True로 설정합니다.",
            9: "break로 반복문을 종료합니다 (더 찾을 필요 없음)."
          }
        },
        {
          id: "elem-int-1-2",
          title: "숫자 맞추기 게임",
          description: "1부터 100까지 중 컴퓨터가 생각한 숫자를 맞춰보세요!",
          starterCode: `import random

# 컴퓨터가 1~100 사이 숫자 선택
secret_number = random.randint(1, 100)
attempts = 0

print("1부터 100 사이의 숫자를 맞춰보세요!")

while True:
    guess = int(input("숫자를 입력하세요: "))
    attempts += 1

    if guess < secret_number:
        print("더 큰 숫자입니다!")
    elif guess > secret_number:
        print("더 작은 숫자입니다!")
    else:
        print(f"정답! {attempts}번 만에 맞췄습니다!")
        break`,
          hint: "범위를 좁혀가며 찾으면 더 빨리 맞출 수 있습니다.",

          quiz: {
            question: "50번 안에 숫자를 맞추려면 어떻게 해야 할까요?",
            options: [
              "1부터 순서대로 입력한다",
              "아무 숫자나 랜덤으로 입력한다",
              "중간값(50)부터 시작해 범위를 절반씩 줄인다",
              "큰 숫자부터 거꾸로 입력한다"
            ],
            correctAnswer: 2,
            explanation: "이진 탐색 전략! 중간값부터 시작해 범위를 절반씩 줄이면 최대 7번이면 맞출 수 있습니다."
          },

          interactiveInputs: [
            {
              id: "max_number",
              label: "최대 숫자 범위",
              type: "number",
              defaultValue: 100,
              placeholder: "100"
            },
            {
              id: "max_attempts",
              label: "최대 시도 횟수",
              type: "number",
              defaultValue: 10,
              placeholder: "10"
            }
          ]
        }
      ]
    },
    {
      level: 2,
      title: "정렬 마법사 - 버블 정렬",
      concepts: ["버블 정렬", "교환", "비교"],
      activities: [
        {
          id: "elem-int-2-1",
          title: "키 순서로 정렬하기",
          description: "친구들의 키를 작은 순서대로 정렬합니다.",
          starterCode: `# 버블 정렬
heights = [152, 145, 160, 138, 155]
print(f"정렬 전: {heights}")

n = len(heights)
for i in range(n):
    for j in range(n - 1 - i):
        # 인접한 두 값 비교
        if heights[j] > heights[j + 1]:
            # 위치 바꾸기
            heights[j], heights[j + 1] = heights[j + 1], heights[j]
            print(f"교환: {heights}")  # 과정 출력

print(f"정렬 후: {heights}")`,
          hint: "큰 값이 거품처럼 뒤로 이동합니다!",

          visualization: 'sorting',
          stepByStep: true,  // 단계별 실행 지원

          testCases: [
            {
              expectedOutput: "[138, 145, 152, 155, 160]",
              description: "오름차순 정렬 확인"
            }
          ],

          quiz: {
            question: "버블 정렬에서 한 번의 순회(i=0일 때)가 끝나면 무엇이 확정될까요?",
            options: [
              "가장 작은 값이 맨 앞으로",
              "가장 큰 값이 맨 뒤로",
              "중간 값이 중앙으로",
              "아무것도 확정되지 않음"
            ],
            correctAnswer: 1,
            explanation: "버블 정렬은 매 순회마다 가장 큰 값이 맨 뒤로 이동합니다. 그래서 내부 루프가 n-1-i까지만 돕니다!"
          },

          challenges: [
            {
              title: "내림차순 정렬",
              description: "큰 순서대로 정렬하도록 코드를 수정하세요.",
              difficulty: "easy",
              starterCode: `heights = [152, 145, 160, 138, 155]
# 비교 연산자만 바꾸면 됩니다!`,
              solution: `heights = [152, 145, 160, 138, 155]
n = len(heights)
for i in range(n):
    for j in range(n - 1 - i):
        if heights[j] < heights[j + 1]:  # < 로 변경!
            heights[j], heights[j + 1] = heights[j + 1], heights[j]
print(heights)`
            },
            {
              title: "교환 횟수 세기",
              description: "정렬 과정에서 몇 번 교환이 일어나는지 세어보세요.",
              difficulty: "medium",
              starterCode: `heights = [152, 145, 160, 138, 155]
swap_count = 0
# 교환할 때마다 swap_count를 증가시키세요`,
              solution: `heights = [152, 145, 160, 138, 155]
swap_count = 0
n = len(heights)
for i in range(n):
    for j in range(n - 1 - i):
        if heights[j] > heights[j + 1]:
            heights[j], heights[j + 1] = heights[j + 1], heights[j]
            swap_count += 1
print(f"총 교환 횟수: {swap_count}번")`
            }
          ],

          interactiveInputs: [
            {
              id: "numbers",
              label: "정렬할 숫자 리스트",
              type: "array",
              defaultValue: [152, 145, 160, 138, 155],
              placeholder: "[숫자, 숫자, ...]"
            }
          ],

          codeExplanation: {
            6: "바깥 루프: 전체 정렬 과정을 n번 반복합니다.",
            7: "안쪽 루프: 인접한 원소들을 비교합니다. i가 증가할수록 범위가 줄어듭니다.",
            9: "왼쪽이 오른쪽보다 크면 교환해야 합니다.",
            11: "Python의 편리한 교환 문법입니다. temp 변수 없이 한 줄로 교환!",
            12: "각 교환 과정을 출력하여 정렬 과정을 볼 수 있습니다."
          }
        }
      ]
    }
  ]
};

// 🎓 중학교 - 인터랙티브 알고리즘 커리큘럼
export const middleSchoolInteractiveCurriculum: Curriculum = {
  title: "중학교 알고리즘 심화 (인터랙티브)",
  levels: [
    {
      level: 1,
      title: "이진 탐색 - 빠른 검색의 비밀",
      concepts: ["이진 탐색", "정렬", "분할 정복"],
      activities: [
        {
          id: "middle-int-1-1",
          title: "이진 탐색 체험하기",
          description: "정렬된 리스트에서 이진 탐색으로 빠르게 찾기",
          starterCode: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    steps = 0  # 탐색 단계 기록

    while left <= right:
        steps += 1
        mid = (left + right) // 2
        print(f"[단계 {steps}] 범위: [{left}~{right}], 중간 인덱스: {mid}, 값: {arr[mid]}")

        if arr[mid] == target:
            print(f"✅ {target}을 {steps}단계 만에 찾았습니다!")
            return mid
        elif arr[mid] < target:
            left = mid + 1
            print(f"   → 오른쪽 절반 탐색")
        else:
            right = mid - 1
            print(f"   → 왼쪽 절반 탐색")

    print(f"❌ {target}을 찾지 못했습니다.")
    return -1

# 정렬된 리스트 (필수!)
numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29]
target = int(input("찾을 숫자를 입력하세요 (1~29 중 홀수): "))

binary_search(numbers, target)`,
          hint: "매 단계마다 탐색 범위가 절반으로 줄어듭니다!",

          visualization: 'searching',
          stepByStep: true,

          quiz: {
            question: "1000개의 정렬된 데이터에서 이진 탐색으로 찾을 때 최대 몇 단계가 필요할까요?",
            options: [
              "1000단계",
              "500단계",
              "100단계",
              "10단계"
            ],
            correctAnswer: 3,
            explanation: "2^10 = 1024이므로 최대 10단계면 충분합니다! 이진 탐색의 시간 복잡도는 O(log n)입니다."
          },

          challenges: [
            {
              title: "첫 번째 위치 찾기",
              description: "중복된 값이 있을 때 가장 첫 번째 위치를 찾으세요.",
              difficulty: "medium",
              starterCode: `def find_first(arr, target):
    # 이진 탐색을 응용하세요!
    pass

numbers = [1, 2, 2, 2, 3, 4, 5]
print(find_first(numbers, 2))  # 1을 반환해야 함`,
              solution: `def find_first(arr, target):
    left, right = 0, len(arr) - 1
    result = -1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            result = mid
            right = mid - 1  # 왼쪽 계속 탐색
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return result`
            }
          ],

          interactiveInputs: [
            {
              id: "array_size",
              label: "배열 크기",
              type: "number",
              defaultValue: 15
            },
            {
              id: "search_value",
              label: "검색할 값",
              type: "number",
              defaultValue: 13
            }
          ],

          testCases: [
            {
              input: "13",
              expectedOutput: "✅ 13을 ",
              description: "중간 값 찾기"
            },
            {
              input: "1",
              expectedOutput: "✅ 1을 ",
              description: "첫 번째 값 찾기"
            },
            {
              input: "30",
              expectedOutput: "❌ 30을 찾지 못했습니다.",
              description: "없는 값 찾기"
            }
          ]
        }
      ]
    },
    {
      level: 2,
      title: "재귀의 마법",
      concepts: ["재귀 함수", "기저 조건", "재귀 호출"],
      activities: [
        {
          id: "middle-int-2-1",
          title: "팩토리얼 시각화",
          description: "재귀 호출 과정을 눈으로 확인하기",
          starterCode: `def factorial(n, depth=0):
    """팩토리얼을 재귀로 계산 (과정 시각화)"""
    indent = "  " * depth
    print(f"{indent}factorial({n}) 호출")

    # 기저 조건
    if n == 0 or n == 1:
        print(f"{indent}→ 기저 조건: {n}! = 1")
        return 1

    # 재귀 호출
    print(f"{indent}→ {n}! = {n} × factorial({n-1})")
    result = n * factorial(n - 1, depth + 1)

    print(f"{indent}← factorial({n}) = {result}")
    return result

# 테스트
n = int(input("팩토리얼을 계산할 숫자 (1~10): "))
answer = factorial(n)
print(f"\\n최종 답: {n}! = {answer}")`,
          hint: "재귀는 자기 자신을 호출하는 함수입니다. 기저 조건이 없으면 무한 루프!",

          visualization: 'recursion',
          stepByStep: true,

          quiz: {
            question: "재귀 함수에서 가장 중요한 것은?",
            options: [
              "빠른 실행 속도",
              "기저 조건 (종료 조건)",
              "복잡한 로직",
              "많은 매개변수"
            ],
            correctAnswer: 1,
            explanation: "기저 조건이 없으면 재귀가 무한히 계속되어 스택 오버플로우가 발생합니다!"
          },

          challenges: [
            {
              title: "피보나치 수열",
              description: "재귀로 피보나치 수열을 구현하고 시각화하세요.",
              difficulty: "medium",
              starterCode: `def fibonacci(n, depth=0):
    indent = "  " * depth
    # 여기에 재귀 코드 작성
    pass

n = int(input("몇 번째 피보나치 수? "))
print(fibonacci(n))`,
              solution: `def fibonacci(n, depth=0):
    indent = "  " * depth
    print(f"{indent}fib({n})")

    if n <= 1:
        print(f"{indent}→ {n}")
        return n

    left = fibonacci(n-1, depth+1)
    right = fibonacci(n-2, depth+1)
    result = left + right

    print(f"{indent}← fib({n}) = {result}")
    return result`
            }
          ],

          codeExplanation: {
            2: "depth 매개변수로 재귀 깊이를 추적합니다.",
            3: "들여쓰기로 재귀 깊이를 시각적으로 표현합니다.",
            6: "기저 조건: n이 0 또는 1이면 재귀를 멈춥니다.",
            12: "재귀 호출: n-1의 팩토리얼을 계산합니다.",
            14: "반환될 때도 출력하여 호출 스택을 볼 수 있습니다."
          }
        }
      ]
    },
    {
      level: 3,
      title: "스택과 큐 - 자료구조의 기초",
      concepts: ["스택", "큐", "LIFO", "FIFO"],
      activities: [
        {
          id: "middle-int-3-1",
          title: "괄호 짝 맞추기",
          description: "스택으로 괄호가 올바른지 검사하기",
          starterCode: `def check_brackets(expression):
    """괄호 짝이 맞는지 검사 (과정 시각화)"""
    stack = []
    pairs = {'(': ')', '[': ']', '{': '}'}

    print(f"검사할 표현식: {expression}")
    print("=" * 40)

    for i, char in enumerate(expression):
        print(f"[{i+1}] '{char}' 확인")

        if char in pairs.keys():  # 여는 괄호
            stack.append(char)
            print(f"   → 스택에 추가: {stack}")
        elif char in pairs.values():  # 닫는 괄호
            if not stack:
                print(f"   ✗ 짝이 맞지 않음 (스택이 비어있음)")
                return False

            opening = stack.pop()
            print(f"   → 스택에서 제거: '{opening}'")
            print(f"   → 현재 스택: {stack}")

            if pairs[opening] != char:
                print(f"   ✗ 짝이 맞지 않음 ({opening}와 {char})")
                return False

    if stack:
        print(f"\\n✗ 닫히지 않은 괄호가 있습니다: {stack}")
        return False

    print(f"\\n✓ 모든 괄호의 짝이 맞습니다!")
    return True

# 테스트
test = input("괄호 표현식을 입력하세요: ")
result = check_brackets(test)`,
          hint: "여는 괄호는 스택에 넣고, 닫는 괄호를 만나면 스택에서 꺼내 짝을 확인합니다.",

          visualization: 'stack-queue',
          stepByStep: true,

          testCases: [
            {
              input: "(())",
              expectedOutput: "✓ 모든 괄호의 짝이 맞습니다!",
              description: "올바른 괄호"
            },
            {
              input: "({[]})",
              expectedOutput: "✓ 모든 괄호의 짝이 맞습니다!",
              description: "복잡한 올바른 괄호"
            },
            {
              input: "(()",
              expectedOutput: "✗ 닫히지 않은 괄호가 있습니다",
              description: "닫히지 않은 괄호"
            },
            {
              input: "({[}])",
              expectedOutput: "✗ 짝이 맞지 않음",
              description: "순서가 틀린 괄호"
            }
          ],

          quiz: {
            question: "스택(Stack)의 특징은?",
            options: [
              "먼저 들어간 것이 먼저 나온다 (FIFO)",
              "나중에 들어간 것이 먼저 나온다 (LIFO)",
              "중간에서 빼낼 수 있다",
              "정렬된 상태로 저장된다"
            ],
            correctAnswer: 1,
            explanation: "스택은 LIFO(Last In First Out) 구조입니다. 접시를 쌓고 빼는 것과 같습니다!"
          },

          challenges: [
            {
              title: "HTML 태그 검사기",
              description: "HTML 태그의 열림/닫힘이 올바른지 검사하세요.",
              difficulty: "hard",
              starterCode: `def check_html_tags(html):
    """<div>, </div> 같은 HTML 태그 검사"""
    # 정규표현식이나 문자열 처리로 태그를 추출하고
    # 스택으로 검사하세요!
    pass

html = "<div><p>Hello</p></div>"
print(check_html_tags(html))`,
              solution: `import re

def check_html_tags(html):
    stack = []
    # 태그 추출: <태그명> 또는 </태그명>
    tags = re.findall(r'</?\\w+>', html)

    for tag in tags:
        if not tag.startswith('</'):  # 여는 태그
            stack.append(tag)
        else:  # 닫는 태그
            if not stack:
                return False
            opening = stack.pop()
            if opening[1:-1] != tag[2:-1]:  # 태그명 비교
                return False

    return len(stack) == 0`
            }
          ]
        }
      ]
    }
  ]
};

// 🎓 고등학교 - 인터랙티브 알고리즘 커리큘럼
export const highSchoolInteractiveCurriculum: Curriculum = {
  title: "고등학교 알고리즘 고급 (인터랙티브)",
  levels: [
    {
      level: 1,
      title: "동적 프로그래밍 - 최적화의 예술",
      concepts: ["동적 프로그래밍", "메모이제이션", "최적 부분 구조"],
      activities: [
        {
          id: "high-int-1-1",
          title: "피보나치 성능 비교",
          description: "일반 재귀 vs 메모이제이션의 성능 차이 체험",
          starterCode: `import time

# 일반 재귀 (느림)
call_count_normal = 0
def fib_normal(n):
    global call_count_normal
    call_count_normal += 1

    if n <= 1:
        return n
    return fib_normal(n-1) + fib_normal(n-2)

# 메모이제이션 (빠름)
call_count_memo = 0
def fib_memo(n, memo=None):
    global call_count_memo
    call_count_memo += 1

    if memo is None:
        memo = {}

    if n in memo:
        return memo[n]

    if n <= 1:
        return n

    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]

# 성능 비교
n = int(input("피보나치 수열의 n번째 항 (권장: 30~35): "))

print("\\n1️⃣ 일반 재귀")
call_count_normal = 0
start = time.time()
result1 = fib_normal(n)
time1 = time.time() - start
print(f"   결과: {result1}")
print(f"   함수 호출 횟수: {call_count_normal:,}회")
print(f"   실행 시간: {time1:.4f}초")

print("\\n2️⃣ 메모이제이션")
call_count_memo = 0
start = time.time()
result2 = fib_memo(n)
time2 = time.time() - start
print(f"   결과: {result2}")
print(f"   함수 호출 횟수: {call_count_memo:,}회")
print(f"   실행 시간: {time2:.6f}초")

print(f"\\n⚡ 속도 향상: {time1/time2:.0f}배 빠름!")
print(f"📊 호출 횟수 감소: {call_count_normal/call_count_memo:.0f}배")`,
          hint: "메모이제이션은 계산 결과를 저장해두고 재사용합니다!",

          visualization: 'recursion',

          testCases: [
            {
              input: "35",
              expectedOutput: "속도 향상",
              description: "성능 차이 확인"
            }
          ],

          quiz: {
            question: "동적 프로그래밍이 적용 가능한 조건은?",
            options: [
              "정렬된 데이터가 있어야 함",
              "최적 부분 구조와 중복 부분 문제가 있어야 함",
              "재귀 함수를 사용해야 함",
              "그래프 구조여야 함"
            ],
            correctAnswer: 1,
            explanation: "DP는 최적 부분 구조(작은 문제의 최적해로 큰 문제 해결)와 중복 부분 문제(같은 계산 반복)가 있을 때 적용됩니다."
          },

          challenges: [
            {
              title: "계단 오르기 문제",
              description: "한 번에 1칸 또는 2칸씩 오를 수 있을 때, n칸을 오르는 방법의 수를 DP로 구하세요.",
              difficulty: "medium",
              starterCode: `def climb_stairs(n):
    """
    1칸 또는 2칸씩 오르기
    n=3일 때: (1,1,1), (1,2), (2,1) = 3가지
    """
    # DP 테이블 사용
    pass

n = int(input("계단 칸 수: "))
print(f"{n}칸을 오르는 방법: {climb_stairs(n)}가지")`,
              solution: `def climb_stairs(n):
    if n <= 2:
        return n

    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2

    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]

    return dp[n]`
            }
          ],

          interactiveInputs: [
            {
              id: "fib_n",
              label: "계산할 피보나치 수",
              type: "number",
              defaultValue: 35
            }
          ]
        }
      ]
    }
  ]
};

// 전체 인터랙티브 커리큘럼
export const allInteractiveCurricula = {
  elementary: elementaryInteractiveCurriculum,
  middleSchool: middleSchoolInteractiveCurriculum,
  highSchool: highSchoolInteractiveCurriculum
};

// 배열 형태로도 export (CurriculumLearning에서 사용)
export const allInteractiveCurriculaArray = [
  elementaryInteractiveCurriculum,
  middleSchoolInteractiveCurriculum,
  highSchoolInteractiveCurriculum
];
