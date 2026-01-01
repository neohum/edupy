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
  title: string;
  levels: Level[];
}

// 핵심 개념 설명 사전
export const conceptExplanations: { [key: string]: string } = {
  "print()": "화면에 텍스트나 값을 출력하는 파이썬의 기본 함수입니다. 괄호 안에 출력할 내용을 넣습니다.",
  "문자열 출력": "따옴표(\"\")나 작은따옴표('')로 감싼 텍스트를 화면에 표시하는 것입니다.",
  "줄바꿈(\\n)": "\\n 문자를 사용하면 텍스트를 다음 줄로 넘길 수 있습니다. 여러 줄 출력에 유용합니다.",
  "변수": "데이터를 저장하는 상자와 같습니다. 이름을 붙여서 나중에 다시 사용할 수 있습니다.",
  "정수(int)": "소수점이 없는 숫자입니다. 예: 1, 100, -5",
  "실수(float)": "소수점이 있는 숫자입니다. 예: 3.14, -0.5, 2.0",
  "문자열(str)": "텍스트 데이터입니다. 따옴표로 감싸서 표현합니다.",
  "input()": "사용자로부터 키보드 입력을 받는 함수입니다. 입력받은 값은 문자열로 저장됩니다.",
  "형변환": "데이터의 타입을 다른 타입으로 바꾸는 것입니다. 예: int(), float(), str()",
  "int()": "문자열이나 실수를 정수로 변환하는 함수입니다.",
  "if": "조건이 참(True)일 때만 코드를 실행하는 조건문입니다.",
  "else": "if 조건이 거짓(False)일 때 실행되는 코드 블록입니다.",
  "비교 연산자": "두 값을 비교합니다. ==, !=, >, <, >=, <= 등이 있습니다.",
  "elif": "여러 조건을 순서대로 검사할 때 사용합니다. 'else if'의 줄임말입니다.",
  "논리 연산자": "여러 조건을 결합합니다. and(그리고), or(또는), not(부정)이 있습니다.",
  "중첩 if": "if문 안에 또 다른 if문을 넣는 것입니다. 복잡한 조건을 표현할 수 있습니다.",
  "for": "정해진 횟수만큼 코드를 반복 실행하는 반복문입니다.",
  "range()": "숫자 범위를 만드는 함수입니다. range(5)는 0, 1, 2, 3, 4를 생성합니다.",
  "리스트 반복": "리스트의 각 요소를 하나씩 꺼내서 처리하는 것입니다.",
  "while": "조건이 참인 동안 계속 반복하는 반복문입니다.",
  "break": "반복문을 즉시 종료하고 빠져나가는 명령어입니다.",
  "중첩 반복": "반복문 안에 또 다른 반복문을 넣는 것입니다. 구구단, 패턴 출력 등에 사용됩니다.",
  "list": "여러 개의 값을 순서대로 저장하는 자료구조입니다. 대괄호 []로 만듭니다.",
  "인덱싱": "리스트에서 특정 위치의 값을 가져오는 것입니다. 0부터 시작합니다.",
  "dict": "키(key)와 값(value)을 쌍으로 저장하는 자료구조입니다. 중괄호 {}로 만듭니다.",
  "import": "다른 모듈이나 라이브러리를 가져와서 사용하는 명령어입니다.",
  "random.randint": "지정한 범위 내에서 무작위 정수를 생성하는 함수입니다.",
  "random.choice": "리스트에서 무작위로 하나의 요소를 선택하는 함수입니다.",
  "turtle": "그래픽을 그릴 수 있는 파이썬 라이브러리입니다. 거북이가 움직이며 선을 그립니다.",
  "forward()": "거북이를 앞으로 이동시키는 함수입니다.",
  "right()/left()": "거북이를 오른쪽/왼쪽으로 회전시키는 함수입니다.",
  "정수/실수": "정수(int)는 소수점 없는 숫자(1, 100), 실수(float)는 소수점 있는 숫자(3.14)입니다.",
  "문자열": "따옴표로 감싼 텍스트 데이터입니다. 예: \"안녕하세요\"",
  "불리언": "참(True) 또는 거짓(False) 두 가지 값만 가지는 자료형입니다.",
  "기본 사칙연산": "더하기(+), 빼기(-), 곱하기(*), 나누기(/)의 기본 수학 연산입니다.",
  "논리 연산자 and/or": "and는 두 조건이 모두 참일 때, or는 하나라도 참일 때 참입니다.",
  "범위 조건": "값이 특정 범위 안에 있는지 확인합니다. 예: 0 <= x <= 100",
  "횟수 반복": "for와 range()를 사용해 정해진 횟수만큼 코드를 반복 실행합니다.",
  "무한루프+break": "while True로 무한 반복하다가 break로 특정 조건에서 탈출하는 패턴입니다.",
  "중첩 for": "for문 안에 또 다른 for문을 넣어 2차원 패턴이나 구구단을 만들 수 있습니다.",
  "append": "리스트에 새로운 요소를 맨 뒤에 추가하는 메서드입니다.",
  "len": "리스트나 문자열의 길이(요소 개수)를 반환하는 함수입니다.",
  "items": "딕셔너리에서 키와 값을 쌍으로 가져오는 메서드입니다.",
  "turtle 기본 사용법": "import turtle로 가져와서 forward(), right(), left() 등으로 그림을 그립니다.",
  "반복과 그래픽 결합": "for 반복문과 turtle을 함께 사용해 도형이나 패턴을 그립니다.",
  "range": "숫자 범위를 만드는 함수입니다. range(5)는 0, 1, 2, 3, 4를 생성합니다.",
};

export const pythonCurriculum: Curriculum = {
  "title": "파이썬 기초 문법 커리큘럼",
  "levels": [
    {
      "level": 1,
      "title": "파이썬과 친해지기 (print, 줄바꿈)",
      "concepts": ["print()", "문자열 출력", "줄바꿈(\\n)"],
      "activities": [
        {
          "id": "1-1",
          "title": "한 줄 자기소개",
          "description": "간단한 자기소개 문장을 한 줄로 출력해 봅니다.",
          "starterCode": "print(\"안녕하세요! 저는 5학년 김코딩입니다.\")\n# 주석은 이렇게 씁니다.",
          "hint": "💬 주석(Comment)은 프로그램 실행에 영향을 주지 않는 메모입니다. # 기호 뒤에 작성하면 그 줄은 실행되지 않고 설명으로만 사용됩니다. 코드를 이해하기 쉽게 만들어주는 중요한 도구입니다!"
        },
        {
          "id": "1-2",
          "title": "오늘의 3줄 일기",
          "description": "오늘 하루를 3줄로 표현해 봅니다.",
          "starterCode": "print(\"오늘은 파이썬을 처음 배웠다.\")\nprint(\"조금 어렵지만 재미있다.\")\nprint(\"내일도 하고 싶다!\")"
        },
        {
          "id": "1-3",
          "title": "이모지 소개",
          "description": "이모지를 활용해 오늘 기분을 출력해 봅니다.",
          "starterCode": "print(\"내 기분: 😀 😴 🤩\")"
        },
        {
          "id": "1-4",
          "title": "줄바꿈 문자 써보기",
          "description": "줄바꿈 문자(\\n)를 사용해 여러 줄을 한 번에 출력해 봅니다.",
          "starterCode": "print(\"안녕!\\n나는 파이썬이야.\\n함께 놀자!\")"
        },
        {
          "id": "1-5",
          "title": "말풍선 만들기",
          "description": "별(*) 문자를 이용해 말풍선을 만들어 봅니다.",
          "starterCode": "print(\"****************\")\nprint(\"* 파이썬 짱!  *\")\nprint(\"****************\")"
        }
      ]
    },
    {
      "level": 2,
      "title": "변수와 자료형 (숫자, 문자, 논리)",
      "concepts": ["변수", "정수/실수", "문자열", "불리언"],
      "activities": [
        {
          "id": "2-1",
          "title": "나만의 상자(변수) 만들기",
          "description": "이름, 나이, 학생 여부를 변수에 저장해 출력합니다.",
          "starterCode": "name = \"김코딩\"\nage = 12\nis_student = True\n\nprint(name, age, \"살\")\nprint(\"학생인가요?\", is_student)"
        },
        {
          "id": "2-2",
          "title": "나의 취향 카드",
          "description": "좋아하는 음식, 색, 게임을 변수에 저장해 소개합니다.",
          "starterCode": "food = \"피자\"\ncolor = \"파란색\"\ngame = \"마인크래프트\"\n\nprint(\"내가 좋아하는 음식:\", food)\nprint(\"좋아하는 색:\", color)\nprint(\"좋아하는 게임:\", game)"
        },
        {
          "id": "2-3",
          "title": "내년 나이 계산",
          "description": "현재 나이에서 1을 더해 내년 나이를 출력합니다.",
          "starterCode": "age = 12\nprint(\"지금 나이:\", age)\nprint(\"내년 나이:\", age + 1)"
        },
        {
          "id": "2-4",
          "title": "키와 몸무게 저장",
          "description": "키와 몸무게를 실수 형태로 저장해 출력합니다.",
          "starterCode": "height = 148.5   # cm\nweight = 40.2    # kg\n\nprint(\"키:\", height, \"cm\")\nprint(\"몸무게:\", weight, \"kg\")"
        },
        {
          "id": "2-5",
          "title": "참/거짓 퀴즈",
          "description": "비가 오는지, 주말인지 불리언 값으로 표현해 봅니다.",
          "starterCode": "is_raining = False\nis_weekend = True\n\nprint(\"비가 오나요?\", is_raining)\nprint(\"주말인가요?\", is_weekend)"
        }
      ]
    },
    {
      "level": 3,
      "title": "입력과 간단한 계산 (input, int, float)",
      "concepts": ["input()", "형변환 int/float", "기본 사칙연산"],
      "activities": [
        {
          "id": "3-1",
          "title": "이름 받아서 인사하기",
          "description": "사용자로부터 이름을 입력받아 인사합니다.",
          "starterCode": "name = input(\"이름을 입력하세요: \")\nprint(\"안녕하세요,\", name, \"님!\")"
        },
        {
          "id": "3-2",
          "title": "나이 +1 계산기",
          "description": "입력받은 나이에 1을 더해 내년 나이를 알려줍니다.",
          "starterCode": "age = int(input(\"나이를 입력하세요: \"))\nprint(\"내년에는\", age + 1, \"살이 됩니다!\")"
        },
        {
          "id": "3-3",
          "title": "두 수의 합 구하기",
          "description": "두 숫자를 입력받아 합을 계산합니다.",
          "starterCode": "a = int(input(\"첫 번째 수: \"))\nb = int(input(\"두 번째 수: \"))\nprint(\"합 =\", a + b)"
        },
        {
          "id": "3-4",
          "title": "평균 점수 계산",
          "description": "국어, 수학, 영어 점수를 입력받아 평균을 구합니다.",
          "starterCode": "k = int(input(\"국어 점수: \"))\nm = int(input(\"수학 점수: \"))\ne = int(input(\"영어 점수: \"))\n\navg = (k + m + e) / 3\nprint(\"평균 점수:\", avg)"
        },
        {
          "id": "3-5",
          "title": "초를 분+초로 바꾸기",
          "description": "초 단위를 분과 초로 나누어 출력합니다.",
          "starterCode": "total = int(input(\"초를 입력하세요: \"))\nminutes = total // 60\nseconds = total % 60\nprint(minutes, \"분\", seconds, \"초\")"
        }
      ]
    },
    {
      "level": 4,
      "title": "조건문 기초 (if, else)",
      "concepts": ["if", "else", "비교 연산자"],
      "activities": [
        {
          "id": "4-1",
          "title": "성인/어린이 구분",
          "description": "나이에 따라 청소년/성인과 어린이를 구분합니다.",
          "starterCode": "age = int(input(\"나이: \"))\nif age >= 13:\n    print(\"청소년/성인입니다.\")\nelse:\n    print(\"어린이입니다.\")"
        },
        {
          "id": "4-2",
          "title": "짝수/홀수 판별",
          "description": "입력한 숫자가 짝수인지 홀수인지 판별합니다.",
          "starterCode": "n = int(input(\"숫자를 입력하세요: \"))\nif n % 2 == 0:\n    print(\"짝수입니다.\")\nelse:\n    print(\"홀수입니다.\")"
        },
        {
          "id": "4-3",
          "title": "시험 합격/불합격",
          "description": "점수에 따라 합격 여부를 출력합니다.",
          "starterCode": "score = int(input(\"점수: \"))\nif score >= 60:\n    print(\"합격! 🎉\")\nelse:\n    print(\"아쉽지만 다음에 다시!\")"
        },
        {
          "id": "4-4",
          "title": "비가 올까?",
          "description": "비가 오는지 여부에 따라 행동을 추천합니다.",
          "starterCode": "rain = input(\"비가 오나요? (y/n): \")\nif rain == \"y\":\n    print(\"우산을 챙기세요!\")\nelse:\n    print(\"산책 가도 좋겠어요!\")"
        },
        {
          "id": "4-5",
          "title": "좋아하는 과목에 따라 메시지",
          "description": "좋아하는 과목에 따라 다른 메시지를 보여줍니다.",
          "starterCode": "fav = input(\"가장 좋아하는 과목은?: \")\n\nif fav == \"수학\":\n    print(\"논리왕!\")\nelif fav == \"체육\":\n    print(\"에너지 왕!\")\nelif fav == \"미술\":\n    print(\"창의력 왕!\")\nelse:\n    print(\"모든 과목이 멋져요!\")"
        }
      ]
    },
    {
      "level": 5,
      "title": "조건문 응용 (elif, 논리 연산자)",
      "concepts": ["elif", "논리 연산자 and/or", "범위 조건"],
      "activities": [
        {
          "id": "5-1",
          "title": "등급 나누기",
          "description": "점수에 따라 A~D 등급을 나눕니다.",
          "starterCode": "score = int(input(\"점수: \"))\n\nif score >= 90:\n    print(\"A 등급\")\nelif score >= 80:\n    print(\"B 등급\")\nelif score >= 70:\n    print(\"C 등급\")\nelse:\n    print(\"D 등급\")"
        },
        {
          "id": "5-2",
          "title": "놀이공원 탑승 조건 (키 + 나이)",
          "description": "키와 나이를 모두 만족해야 놀이기구를 탈 수 있게 합니다.",
          "starterCode": "height = int(input(\"키(cm): \"))\nage = int(input(\"나이: \"))\n\nif height >= 140 and age >= 10:\n    print(\"놀이기구 탑승 가능! 🎢\")\nelse:\n    print(\"조금만 더 자라면 탈 수 있어요!\")"
        },
        {
          "id": "5-3",
          "title": "시험 보너스 점수",
          "description": "숙제를 한 경우 보너스 점수를 더해 최종 점수를 계산합니다.",
          "starterCode": "score = int(input(\"시험 점수: \"))\nhomework = input(\"숙제를 다 했나요? (y/n): \")\n\nif score >= 50 and homework == \"y\":\n    print(\"보너스 +5점!\")\n    score += 5\n\nprint(\"최종 점수:\", score)"
        },
        {
          "id": "5-4",
          "title": "계절 맞추기",
          "description": "입력한 월에 따라 계절을 출력합니다.",
          "starterCode": "month = int(input(\"월(1~12): \"))\n\nif 3 <= month <= 5:\n    print(\"봄 🌸\")\nelif 6 <= month <= 8:\n    print(\"여름 ☀️\")\nelif 9 <= month <= 11:\n    print(\"가을 🍁\")\nelse:\n    print(\"겨울 ❄️\")"
        },
        {
          "id": "5-5",
          "title": "운세 보기 (확장 버전)",
          "description": "선택한 숫자에 따라 다른 운세를 보여줍니다.",
          "starterCode": "num = int(input(\"1~10 중 하나 선택: \"))\n\nif num in [1,2]:\n    print(\"오늘은 엄청 행복한 일이 생겨요!\")\nelif num in [3,4]:\n    print(\"친구와 사이가 더 좋아져요!\")\nelif num in [5,6]:\n    print(\"새로운 것을 배우기 좋은 날!\")\nelif num in [7,8]:\n    print(\"집중해서 공부하면 성적 업!\")\nelse:\n    print(\"가족과 즐거운 시간을 보내요!\")"
        }
      ]
    },
    {
      "level": 6,
      "title": "반복문 기초 (for, range)",
      "concepts": ["for", "range", "횟수 반복"],
      "activities": [
        {
          "id": "6-1",
          "title": "1부터 10까지 출력",
          "description": "1부터 10까지 숫자를 차례대로 출력합니다.",
          "starterCode": "for i in range(1, 11):\n    print(i)"
        },
        {
          "id": "6-2",
          "title": "짝수만 출력",
          "description": "2부터 20까지 짝수만 출력합니다.",
          "starterCode": "for i in range(2, 21, 2):\n    print(i)"
        },
        {
          "id": "6-3",
          "title": "\"안녕\" 5번 말하기",
          "description": "for 반복을 사용해 인사말을 5번 출력합니다.",
          "starterCode": "for i in range(5):\n    print(\"안녕!\", i+1, \"번째\")"
        },
        {
          "id": "6-4",
          "title": "별 삼각형 (기본)",
          "description": "입력한 줄 수만큼 별(*)로 삼각형을 그립니다.",
          "starterCode": "n = int(input(\"줄 수: \"))\nfor i in range(1, n+1):\n    print(\"*\" * i)"
        },
        {
          "id": "6-5",
          "title": "구구단 한 단 출력",
          "description": "원하는 단의 구구단을 출력합니다.",
          "starterCode": "dan = int(input(\"단 입력: \"))\nfor i in range(1, 10):\n    print(f\"{dan} x {i} = {dan*i}\")"
        }
      ]
    },
    {
      "level": 7,
      "title": "반복문 심화 (while, 중첩 반복)",
      "concepts": ["while", "무한루프+break", "중첩 for"],
      "activities": [
        {
          "id": "7-1",
          "title": "1부터 N까지 합 (while)",
          "description": "while문을 사용해 1부터 N까지의 합을 구합니다.",
          "starterCode": "n = int(input(\"어디까지 더할까요?: \"))\nnum = 1\ns = 0\n\nwhile num <= n:\n    s += num\n    num += 1\n\nprint(\"합:\", s)"
        },
        {
          "id": "7-2",
          "title": "0이 나올 때까지 입력 받기",
          "description": "0을 입력할 때까지 숫자를 계속 입력받습니다.",
          "starterCode": "while True:\n    n = int(input(\"숫자 입력(0을 입력하면 끝): \"))\n    if n == 0:\n        print(\"끝!\")\n        break\n    print(\"당신이 입력한 숫자:\", n)"
        },
        {
          "id": "7-3",
          "title": "별 사각형 (중첩 for)",
          "description": "중첩 for문으로 별(*) 사각형을 그립니다.",
          "starterCode": "rows = int(input(\"세로 줄 수: \"))\ncols = int(input(\"가로 별 수: \"))\n\nfor i in range(rows):\n    line = \"\"\n    for j in range(cols):\n        line += \"*\"\n    print(line)"
        },
        {
          "id": "7-4",
          "title": "역삼각형 별",
          "description": "줄 수를 줄여 가며 역삼각형 모양으로 별을 출력합니다.",
          "starterCode": "n = int(input(\"줄 수: \"))\nfor i in range(n, 0, -1):\n    print(\"*\" * i)"
        },
        {
          "id": "7-5",
          "title": "숫자 피라미드",
          "description": "중첩 반복으로 숫자 피라미드 모양을 출력합니다.",
          "starterCode": "n = int(input(\"줄 수: \"))\n\nfor i in range(1, n+1):\n    line = \"\"\n    for j in range(1, i+1):\n        line += str(j)\n    print(line)"
        }
      ]
    },
    {
      "level": 8,
      "title": "리스트와 딕셔너리 (기초 자료구조)",
      "concepts": ["list", "append", "len", "dict", "items"],
      "activities": [
        {
          "id": "8-1",
          "title": "좋아하는 것 리스트",
          "description": "리스트에 좋아하는 음식들을 저장하고 출력합니다.",
          "starterCode": "favorites = [\"피자\", \"치킨\", \"떡볶이\"]\nprint(favorites)\nprint(\"첫 번째:\", favorites[0])"
        },
        {
          "id": "8-2",
          "title": "리스트에 추가하기",
          "description": "친구 이름 리스트에 새 친구를 추가합니다.",
          "starterCode": "friends = [\"민수\", \"지민\"]\nfriends.append(\"하준\")\nprint(\"친구들:\", friends)\nprint(\"친구 수:\", len(friends))"
        },
        {
          "id": "8-3",
          "title": "리스트 반복해서 출력",
          "description": "for문으로 리스트 안의 과목들을 한 줄씩 출력합니다.",
          "starterCode": "subjects = [\"국어\", \"수학\", \"영어\", \"체육\"]\n\nfor s in subjects:\n    print(\"오늘 공부할 과목:\", s)"
        },
        {
          "id": "8-4",
          "title": "딕셔너리로 전화번호부",
          "description": "가족 전화번호부를 딕셔너리로 만들고 조회합니다.",
          "starterCode": "phone = {\n    \"엄마\": \"010-1111-2222\",\n    \"아빠\": \"010-3333-4444\"\n}\n\nprint(\"엄마 번호:\", phone[\"엄마\"])"
        },
        {
          "id": "8-5",
          "title": "영어 단어장",
          "description": "영어-한국어 단어장을 만들고 전체 내용을 출력합니다.",
          "starterCode": "words = {\n    \"apple\": \"사과\",\n    \"banana\": \"바나나\",\n    \"dog\": \"개\"\n}\n\nfor en, kr in words.items():\n    print(en, \":\", kr)"
        }
      ]
    },
    {
      "level": 9,
      "title": "랜덤과 미니 게임 (숫자 맞추기, 가위바위보 등)",
      "concepts": ["import", "random.randint", "random.choice"],
      "activities": [
        {
          "id": "9-1",
          "title": "숫자 맞추기 (기본)",
          "description": "랜덤 숫자를 맞추는 업/다운 게임입니다.",
          "starterCode": "import random\n\nanswer = random.randint(1, 20)\n\nwhile True:\n    guess = int(input(\"1~20 숫자 맞추기: \"))\n    if guess == answer:\n        print(\"정답! 🎉\")\n        break\n    elif guess < answer:\n        print(\"업!\")\n    else:\n        print(\"다운!\")"
        },
        {
          "id": "9-2",
          "title": "시도 제한 숫자 맞추기",
          "description": "기회가 정해져 있는 숫자 맞추기 게임입니다.",
          "starterCode": "import random\n\nanswer = random.randint(1, 50)\ntries = 5\n\nwhile tries > 0:\n    print(\"남은 기회:\", tries)\n    guess = int(input(\"1~50 숫자: \"))\n    if guess == answer:\n        print(\"정답! 🎉\")\n        break\n    elif guess < answer:\n        print(\"업!\")\n    else:\n        print(\"다운!\")\n    tries -= 1\n\nif tries == 0:\n    print(\"실패! 정답은\", answer)"
        },
        {
          "id": "9-3",
          "title": "가위바위보 (기본)",
          "description": "랜덤으로 선택하는 컴퓨터와 가위바위보 게임을 합니다.",
          "starterCode": "import random\n\nchoices = [\"가위\", \"바위\", \"보\"]\nuser = input(\"가위/바위/보: \")\ncomputer = random.choice(choices)\n\nprint(\"컴퓨터:\", computer)\n\nif user == computer:\n    print(\"비겼어요!\")\nelif (user == \"가위\" and computer == \"보\") or \\\n     (user == \"바위\" and computer == \"가위\") or \\\n     (user == \"보\" and computer == \"바위\"):\n    print(\"이겼다! ✌️\")\nelse:\n    print(\"졌어요! 😢\")"
        },
        {
          "id": "9-4",
          "title": "주사위 던지기",
          "description": "주사위를 여러 번 던져 나온 눈을 출력합니다.",
          "starterCode": "import random\n\nfor i in range(5):\n    dice = random.randint(1, 6)\n    print(i+1, \"번째 주사위:\", dice)"
        },
        {
          "id": "9-5",
          "title": "랜덤 칭찬 머신",
          "description": "이름을 입력하면 랜덤으로 칭찬을 해주는 프로그램입니다.",
          "starterCode": "import random\n\ncompliments = [\n    \"오늘 정말 멋져요!\",\n    \"집중력이 최고예요!\",\n    \"친구에게 친절한 사람이에요!\",\n    \"아이디어가 참 좋아요!\"\n]\n\nname = input(\"이름: \")\nprint(name + \"님,\", random.choice(compliments))"
        }
      ]
    },
    {
      "level": 10,
      "title": "Turtle/그래픽 & 최종 프로젝트 준비",
      "concepts": ["turtle 기본 사용법", "반복과 그래픽 결합"],
      "activities": [
        {
          "id": "10-1",
          "title": "정사각형 그리기",
          "description": "turtle로 정사각형을 그립니다.",
          "starterCode": "import turtle as t\n\nfor _ in range(4):\n    t.forward(100)\n    t.right(90)\n\nt.done()"
        },
        {
          "id": "10-2",
          "title": "다각형 그리기",
          "description": "변의 수를 입력받아 정다각형을 그립니다.",
          "starterCode": "import turtle as t\n\nsides = int(input(\"변의 수(3~8): \"))\nangle = 360 / sides\n\nfor _ in range(sides):\n    t.forward(80)\n    t.right(angle)\n\nt.done()"
        },
        {
          "id": "10-3",
          "title": "여러 색으로 선 그리기",
          "description": "색 리스트를 사용해 여러 색의 선을 그립니다.",
          "starterCode": "import turtle as t\n\ncolors = [\"red\", \"green\", \"blue\", \"orange\"]\n\nfor c in colors:\n    t.pencolor(c)\n    t.forward(80)\n    t.right(90)\n\nt.done()"
        },
        {
          "id": "10-4",
          "title": "나선 패턴",
          "description": "조금씩 길어지는 선으로 나선을 그립니다.",
          "starterCode": "import turtle as t\n\nlength = 5\nfor _ in range(50):\n    t.forward(length)\n    t.right(20)\n    length += 2\n\nt.done()"
        },
        {
          "id": "10-5",
          "title": "나만의 그림 설계",
          "description": "원과 회전을 이용해 자신만의 패턴을 만들어 봅니다.",
          "starterCode": "import turtle as t\n\n# 여기에 내가 그리고 싶은 패턴을 설계해 보고\n# forward, right, left 등을 조합해 그림을 완성해 보세요.\n\nt.pencolor(\"purple\")\nfor _ in range(36):\n    t.circle(50)\n    t.right(10)\n\nt.done()"
        }
      ]
    }
  ]
};

