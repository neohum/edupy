export interface Activity {
  id: string;
  title: string;
  description: string;
  starterCode: string;
}

export interface Level {
  level: number;
  title: string;
  concepts: string[];
  whyInPygame: string;
  activities: Activity[];
}

export interface PygameCurriculum {
  title: string;
  levels: Level[];
}

// 개념 설명 매핑
export const conceptExplanations: { [key: string]: string } = {
  // Level 1
  "print()": "화면에 텍스트나 값을 출력하는 함수입니다. 게임에서 점수, 메시지 등을 표시할 때 사용합니다.",
  "input()": "사용자로부터 키보드 입력을 받는 함수입니다. 플레이어 이름이나 설정을 입력받을 때 사용합니다.",
  "문자열 출력": "따옴표로 감싼 텍스트를 화면에 표시하는 것입니다.",

  // Level 2
  "변수": "값을 저장하는 상자입니다. 게임에서 점수, 체력, 위치 등을 저장할 때 사용합니다.",
  "int": "정수(소수점이 없는 숫자)를 나타내는 자료형입니다. 점수, 레벨 등에 사용합니다.",
  "str": "문자열(텍스트)을 나타내는 자료형입니다. 이름, 메시지 등에 사용합니다.",
  "자료형": "데이터의 종류를 나타냅니다. 숫자(int), 문자열(str), 실수(float) 등이 있습니다.",

  // Level 3
  "사칙연산": "더하기(+), 빼기(-), 곱하기(*), 나누기(/)를 말합니다. 점수 계산, 데미지 계산 등에 사용합니다.",
  "+=": "변수에 값을 더해서 저장하는 연산자입니다. score += 10은 score = score + 10과 같습니다.",
  "-=": "변수에서 값을 빼서 저장하는 연산자입니다. health -= 1은 health = health - 1과 같습니다.",

  // Level 4
  "if": "조건이 참일 때만 코드를 실행하는 제어문입니다. 게임에서 특정 상황에 따라 다른 동작을 할 때 사용합니다.",
  "elif": "if 조건이 거짓일 때 다른 조건을 검사합니다. 여러 경우의 수를 처리할 때 사용합니다.",
  "else": "모든 if/elif 조건이 거짓일 때 실행됩니다.",
  "비교 연산자": "두 값을 비교하는 연산자입니다. >, <, ==, !=, >=, <= 등이 있습니다.",

  // Level 5
  "리스트": "여러 값을 순서대로 저장하는 자료구조입니다. 게임에서 적의 위치, 아이템 목록 등을 저장할 때 사용합니다.",
  "인덱스": "리스트에서 각 요소의 위치를 나타내는 번호입니다. 0부터 시작합니다.",
  "append()": "리스트의 끝에 새로운 요소를 추가하는 메서드입니다.",

  // Level 6
  "for": "반복 작업을 수행하는 제어문입니다. 리스트의 모든 요소를 처리하거나 일정 횟수만큼 반복할 때 사용합니다.",
  "range()": "숫자 범위를 생성하는 함수입니다. for문과 함께 사용하여 반복 횟수를 지정합니다.",
  "반복문": "같은 코드를 여러 번 실행하는 구조입니다. for, while 등이 있습니다.",

  // Level 7
  "while": "조건이 참인 동안 계속 반복하는 제어문입니다. 게임 루프를 만들 때 주로 사용합니다.",
  "무한 루프": "조건이 항상 참이어서 끝나지 않는 반복문입니다. 게임 메인 루프에 사용됩니다.",
  "break": "반복문을 즉시 종료하는 명령어입니다. 게임 종료 조건을 만들 때 사용합니다.",

  // Level 8
  "함수": "특정 작업을 수행하는 코드 묶음입니다. 반복되는 코드를 재사용할 수 있게 해줍니다.",
  "def": "함수를 정의할 때 사용하는 키워드입니다.",
  "return": "함수의 결과값을 반환하는 명령어입니다.",
  "매개변수": "함수에 전달하는 입력값입니다.",

  // Level 9
  "딕셔너리": "키-값 쌍으로 데이터를 저장하는 자료구조입니다. 게임 설정, 캐릭터 정보 등을 저장할 때 사용합니다.",
  "키-값 쌍": "딕셔너리에서 키(이름)와 값(데이터)을 함께 저장하는 방식입니다.",

  // Level 10
  "사용자 입력": "키보드나 마우스로부터 입력을 받는 것입니다. 게임에서 플레이어의 조작을 처리할 때 사용합니다.",
  "이벤트 처리 개념": "사용자의 행동(키 입력, 마우스 클릭 등)에 반응하는 것입니다.",
  "조건문과 입력 결합": "입력값에 따라 다른 동작을 수행하도록 if문과 input을 함께 사용하는 것입니다.",

  // Level 11
  "pygame.init()": "파이게임 라이브러리를 초기화하는 함수입니다. 게임을 시작하기 전에 반드시 호출해야 합니다.",
  "화면 생성": "pygame.display.set_mode()로 게임 창을 만드는 것입니다.",
  "게임 루프 while": "게임이 실행되는 동안 계속 반복되는 메인 루프입니다.",
  "이벤트 처리": "pygame.event.get()으로 키보드, 마우스 입력 등을 처리하는 것입니다.",
  "도형 그리기": "pygame.draw 함수들로 원, 사각형 등을 화면에 그리는 것입니다.",
  "정수/실수": "정수(int)는 소수점 없는 숫자, 실수(float)는 소수점 있는 숫자입니다. 좌표와 속도에 사용합니다.",
  "캐릭터 속성": "캐릭터의 이름, 체력, 공격력 등을 변수로 저장하여 관리하는 것입니다.",
  "상태 업데이트": "게임 루프에서 캐릭터 위치, 점수 등의 상태를 매 프레임마다 갱신하는 것입니다.",
  "여러 개의 객체 관리": "리스트나 딕셔너리를 사용해 적, 총알 등 여러 객체를 동시에 관리하는 것입니다.",
  "난수": "random 모듈로 생성하는 무작위 숫자입니다. 적 생성 위치, 아이템 드롭 등에 사용합니다.",
  "좌표(x, y)": "화면에서 위치를 나타내는 두 숫자입니다. x는 가로, y는 세로 위치입니다.",
  "속도(dx, dy)": "객체가 이동하는 방향과 속도를 나타냅니다. x방향 속도(dx)와 y방향 속도(dy)로 구성됩니다.",
  "벡터 느낌": "방향과 크기를 가진 값으로, 게임에서 이동과 힘을 표현할 때 사용합니다.",
  "time.sleep": "프로그램을 일정 시간 멈추게 하는 함수입니다. 애니메이션 속도 조절에 사용합니다.",
  "프레임 간격": "화면이 갱신되는 시간 간격입니다. FPS(초당 프레임 수)로 조절합니다.",
  "속도와 시간": "속도 × 시간 = 이동 거리. 게임에서 부드러운 움직임을 구현하는 기본 원리입니다.",
  "함수 정의": "def 키워드로 재사용 가능한 코드 블록을 만드는 것입니다."
};

export const pygameCurriculum: PygameCurriculum = {
  "title": "파이게임까지 가는 확장형 파이썬 기초 문법 로드맵",
  "levels": [
    {
      "level": 1,
      "title": "출력과 입력 — 파이게임의 화면 개념 준비",
      "concepts": ["print()", "input()", "문자열 출력"],
      "whyInPygame": "게임에서 점수, 체력, 스테이지, 안내 문구 등을 화면에 글자로 보여주려면 출력이 필요하고, 플레이어 이름이나 설정을 입력받으려면 input이 필요합니다.",
      "activities": [
        {
          "id": "1-1",
          "title": "게임 시작 화면과 플레이어 이름 입력",
          "description": "게임이 시작될 때 환영 문구를 보여주고, 플레이어 이름을 입력받아 인사하는 코드를 만들어 봅니다.",
          "starterCode": "print(\"게임 시작!\")\nname = input(\"플레이어 이름을 입력하세요: \")\nprint(name, \"님 환영합니다!\")"
        },
        {
          "id": "1-2",
          "title": "점수와 체력 출력하기",
          "description": "점수와 체력을 변수 대신 직접 숫자로 넣어 출력해 보며, 나중에 변수로 바꾸는 준비를 합니다.",
          "starterCode": "print(\"현재 점수: 0\")\nprint(\"남은 체력: 3\")"
        },
        {
          "id": "1-3",
          "title": "여러 줄 게임 안내문 만들기",
          "description": "print를 여러 번 사용해 간단한 게임 설명서 화면을 만들어 봅니다.",
          "starterCode": "print(\"=== 점프 점프 게임 ===\")\nprint(\"1. 장애물을 피해 점프하세요.\")\nprint(\"2. 동전을 먹으면 점수가 올라갑니다.\")\nprint(\"3. 체력이 0이 되면 게임 오버!\")"
        },
        {
          "id": "1-4",
          "title": "플레이어 이름과 처음 점수 같이 보여주기",
          "description": "입력받은 이름과 함께 시작 점수를 출력해 봅니다.",
          "starterCode": "name = input(\"플레이어 이름을 입력하세요: \")\nprint(\"플레이어:\", name)\nprint(\"시작 점수: 0\")"
        },
        {
          "id": "1-5",
          "title": "게임 모드 선택 안내",
          "description": "입력받은 모드 이름을 이용해 어떤 모드로 시작하는지 출력합니다.",
          "starterCode": "mode = input(\"쉬움/보통/어려움 중 하나를 입력하세요: \")\nprint(\"선택한 모드:\", mode)\nprint(\"게임을 시작합니다!\")"
        }
      ]
    },
    {
      "level": 2,
      "title": "변수와 자료형 — 캐릭터 속성 표현",
      "concepts": ["변수", "정수/실수", "캐릭터 속성"],
      "whyInPygame": "캐릭터의 위치(x, y), 속도, 점수, 체력 같은 정보는 모두 변수로 저장하고 계속 바꿔 가며 사용해야 합니다.",
      "activities": [
        {
          "id": "2-1",
          "title": "캐릭터 위치와 속도 변수 만들기",
          "description": "캐릭터의 x, y 좌표와 속도를 변수로 저장하고 출력해 봅니다.",
          "starterCode": "x = 100\ny = 200\nspeed = 5\n\nprint(\"캐릭터의 위치:\", x, y)\nprint(\"속도:\", speed)"
        },
        {
          "id": "2-2",
          "title": "점수와 체력 변수로 관리하기",
          "description": "점수와 체력을 변수로 저장하고 값이 바뀌는 모습을 출력해 봅니다.",
          "starterCode": "score = 0\nhp = 3\n\nprint(\"처음 점수:\", score)\nprint(\"처음 체력:\", hp)\n\nscore = score + 10\nhp = hp - 1\n\nprint(\"동전 획득 후 점수:\", score)\nprint(\"피해를 입은 후 체력:\", hp)"
        },
        {
          "id": "2-3",
          "title": "난이도에 따라 속도 바꾸기",
          "description": "난이도가 높아질수록 캐릭터의 속도를 빠르게 설정해 봅니다.",
          "starterCode": "easy_speed = 3\nnormal_speed = 5\nhard_speed = 8\n\nprint(\"쉬움 모드 속도:\", easy_speed)\nprint(\"보통 모드 속도:\", normal_speed)\nprint(\"어려움 모드 속도:\", hard_speed)"
        },
        {
          "id": "2-4",
          "title": "불리언으로 게임 상태 표시하기",
          "description": "게임이 진행 중인지, 일시 정지 상태인지 불리언으로 표현해 봅니다.",
          "starterCode": "is_running = True\nis_paused = False\n\nprint(\"게임 진행 중인가요?\", is_running)\nprint(\"일시 정지 상태인가요?\", is_paused)"
        },
        {
          "id": "2-5",
          "title": "플레이어 정보 카드 만들기",
          "description": "플레이어 이름, 레벨, 골드를 변수로 저장하고 한 번에 출력합니다.",
          "starterCode": "name = \"용감한 기사\"\nlevel = 1\ngold = 50.0\n\nprint(\"=== 플레이어 정보 ===\")\nprint(\"이름:\", name)\nprint(\"레벨:\", level)\nprint(\"골드:\", gold)"
        }
      ]
    },
    {
      "level": 3,
      "title": "조건문 — 충돌, 이동 방향, 게임 오버 만들기",
      "concepts": ["if", "else", "비교 연산자"],
      "whyInPygame": "캐릭터가 벽에 부딪혔는지, 화면 밖으로 나갔는지, 점수가 목표를 넘었는지 등을 판단할 때 조건문이 꼭 필요합니다.",
      "activities": [
        {
          "id": "3-1",
          "title": "캐릭터가 벽에 닿았는지 검사하기",
          "description": "x 좌표가 특정 값을 넘으면 벽에 부딪힌 것으로 판단해 메시지를 출력합니다.",
          "starterCode": "x = 120\n\nif x > 300:\n    print(\"오른쪽 벽에 닿았습니다!\")\nelse:\n    print(\"아직 안전합니다.\")"
        },
        {
          "id": "3-2",
          "title": "체력이 0이면 게임 오버",
          "description": "체력이 0 이하인지 확인해 게임 오버 메시지를 출력합니다.",
          "starterCode": "hp = int(input(\"체력을 입력하세요: \"))\n\nif hp <= 0:\n    print(\"게임 오버...💀\")\nelse:\n    print(\"아직 싸울 수 있어요!\")"
        },
        {
          "id": "3-3",
          "title": "점수가 목표를 넘으면 클리어",
          "description": "점수가 목표 점수 이상이면 스테이지를 클리어한 것으로 판정합니다.",
          "starterCode": "score = int(input(\"현재 점수: \"))\ngoal = 50\n\nif score >= goal:\n    print(\"스테이지 클리어! 🎉\")\nelse:\n    print(\"조금만 더 점수를 모아봐요!\")"
        },
        {
          "id": "3-4",
          "title": "왼쪽/오른쪽 방향에 따라 메시지 바꾸기",
          "description": "사용자가 입력한 방향에 따라 이동 메시지를 다르게 출력합니다.",
          "starterCode": "direction = input(\"왼쪽은 left, 오른쪽은 right 입력: \")\n\nif direction == \"left\":\n    print(\"왼쪽으로 이동!\")\nelif direction == \"right\":\n    print(\"오른쪽으로 이동!\")\nelse:\n    print(\"그 방향으로는 못 가요...\")"
        },
        {
          "id": "3-5",
          "title": "점프 가능한지 확인하기",
          "description": "바닥에 있을 때만 점프할 수 있도록 조건을 만들어 봅니다.",
          "starterCode": "on_ground = True\n\nif on_ground:\n    print(\"점프! 🦘\")\nelse:\n    print(\"공중에서는 점프할 수 없어요!\")"
        }
      ]
    },
    {
      "level": 4,
      "title": "반복문 — 게임 루프를 이해하기 위한 핵심",
      "concepts": ["while", "반복", "상태 업데이트"],
      "whyInPygame": "파이게임에서는 while 루프 안에서 계속해서 입력을 받고, 캐릭터를 움직이고, 화면을 다시 그리는 구조를 사용합니다.",
      "activities": [
        {
          "id": "4-1",
          "title": "반복해서 캐릭터 위치 업데이트하기",
          "description": "while 반복문으로 x 좌표를 계속 증가시키며 이동 상태를 출력합니다.",
          "starterCode": "x = 0\n\nwhile x < 100:\n    print(\"캐릭터 이동:\", x)\n    x += 10"
        },
        {
          "id": "4-2",
          "title": "프레임 번호 출력하기",
          "description": "게임이 진행될 때 몇 번째 프레임인지 반복문으로 출력해 봅니다.",
          "starterCode": "frame = 1\n\nwhile frame <= 5:\n    print(\"프레임:\", frame)\n    frame += 1"
        },
        {
          "id": "4-3",
          "title": "카운트다운 타이머",
          "description": "게임 시작 전 3초 카운트다운을 while로 만들어 봅니다.",
          "starterCode": "time_left = 3\n\nwhile time_left > 0:\n    print(\"게임 시작까지\", time_left, \"초!\")\n    time_left -= 1\n\nprint(\"시작! 🚀\")"
        },
        {
          "id": "4-4",
          "title": "for문으로 여러 적 출력하기",
          "description": "for 반복문을 사용해 여러 적의 번호를 출력합니다.",
          "starterCode": "for i in range(1, 6):\n    print(\"적\", i, \"번 등장!\")"
        },
        {
          "id": "4-5",
          "title": "for문으로 여러 줄 상태바 그리기(텍스트)",
          "description": "체력 바 느낌의 텍스트를 반복문으로 출력해 봅니다.",
          "starterCode": "max_hp = 5\n\nfor current in range(1, max_hp + 1):\n    print(\"HP:\", \"❤\" * current)"
        }
      ]
    },
    {
      "level": 5,
      "title": "리스트/딕셔너리 — 여러 적(enemy) 표현하기",
      "concepts": ["list", "dict", "여러 개의 객체 관리"],
      "whyInPygame": "여러 개의 적, 총알, 아이템 등 많은 객체를 한꺼번에 관리하려면 리스트와 딕셔너리가 편리합니다.",
      "activities": [
        {
          "id": "5-1",
          "title": "여러 적의 위치와 플레이어 속성 관리",
          "description": "리스트로 여러 적의 x 좌표를 관리하고, 딕셔너리로 플레이어의 정보를 저장해 봅니다.",
          "starterCode": "enemies = [50, 120, 200]  # 적의 x 위치\n\nfor e in enemies:\n    print(\"적 위치:\", e)\n\nplayer = {\n    \"x\": 100,\n    \"y\": 200,\n    \"speed\": 4\n}\nprint(\"플레이어 x 좌표:\", player[\"x\"])\nprint(\"플레이어 속도:\", player[\"speed\"])"
        },
        {
          "id": "5-2",
          "title": "적 이름 리스트 만들기",
          "description": "적의 이름을 리스트로 저장하고 순서대로 출력합니다.",
          "starterCode": "enemy_names = [\"슬라임\", \"고블린\", \"드래곤\"]\n\nfor name in enemy_names:\n    print(\"적 등장:\", name)"
        },
        {
          "id": "5-3",
          "title": "아이템 가방(인벤토리) 만들기",
          "description": "리스트를 이용해 플레이어의 아이템 목록을 관리해 봅니다.",
          "starterCode": "inventory = [\"포션\", \"검\"]\nprint(\"현재 아이템:\", inventory)\n\ninventory.append(\"방패\")\nprint(\"아이템 추가 후:\", inventory)"
        },
        {
          "id": "5-4",
          "title": "딕셔너리로 적 정보 저장하기",
          "description": "적의 체력, 공격력, 위치를 딕셔너리로 저장합니다.",
          "starterCode": "enemy = {\n    \"name\": \"슬라임\",\n    \"hp\": 30,\n    \"attack\": 5,\n    \"x\": 150\n}\n\nprint(\"적 이름:\", enemy[\"name\"])\nprint(\"체력:\", enemy[\"hp\"])\nprint(\"공격력:\", enemy[\"attack\"])\nprint(\"위치:\", enemy[\"x\"])"
        },
        {
          "id": "5-5",
          "title": "여러 적 딕셔너리 한 번에 출력하기",
          "description": "딕셔너리 리스트를 만들어 여러 적 정보를 한 번에 관리해 봅니다.",
          "starterCode": "enemies = [\n    {\"name\": \"슬라임\", \"x\": 50},\n    {\"name\": \"고블린\", \"x\": 120},\n    {\"name\": \"드래곤\", \"x\": 300}\n]\n\nfor enemy in enemies:\n    print(enemy[\"name\"], \"의 위치:\", enemy[\"x\"])"
        }
      ]
    },
    {
      "level": 6,
      "title": "함수(Function) — 캐릭터 이동·충돌을 깔끔하게 처리",
      "concepts": ["함수 정의", "매개변수", "return"],
      "whyInPygame": "캐릭터 이동, 충돌 검사, 점수 계산 등 자주 쓰는 코드를 함수로 만들어 두면 게임 구조가 깔끔해지고 수정이 쉬워집니다.",
      "activities": [
        {
          "id": "6-1",
          "title": "이동 함수 만들기",
          "description": "현재 x 좌표와 속도를 받아 새로운 x 좌표를 계산하는 함수를 만들어 봅니다.",
          "starterCode": "def move(x, speed):\n    return x + speed\n\nx = 100\nx = move(x, 5)\nprint(\"새 좌표:\", x)"
        },
        {
          "id": "6-2",
          "title": "점수 올려 주는 함수",
          "description": "현재 점수와 얻은 점수를 받아 새로운 점수를 반환하는 함수를 만듭니다.",
          "starterCode": "def add_score(score, amount):\n    return score + amount\n\nscore = 0\nscore = add_score(score, 10)\nprint(\"새 점수:\", score)"
        },
        {
          "id": "6-3",
          "title": "충돌 여부를 알려주는 함수",
          "description": "두 위치가 같은지 확인해 충돌 여부를 True/False로 반환합니다.",
          "starterCode": "def is_collision(x1, x2):\n    if x1 == x2:\n        return True\n    else:\n        return False\n\nprint(is_collision(100, 100))\nprint(is_collision(50, 80))"
        },
        {
          "id": "6-4",
          "title": "플레이어 상태 출력 함수",
          "description": "플레이어 이름, 점수, 체력을 매개변수로 받아 상태를 출력합니다.",
          "starterCode": "def show_status(name, score, hp):\n    print(\"플레이어:\", name)\n    print(\"점수:\", score)\n    print(\"체력:\", hp)\n\nshow_status(\"용사\", 30, 3)"
        },
        {
          "id": "6-5",
          "title": "속도 변경 함수",
          "description": "난이도에 따라 속도를 바꾸는 함수를 만들어 봅니다.",
          "starterCode": "def get_speed(mode):\n    if mode == \"easy\":\n        return 3\n    elif mode == \"normal\":\n        return 5\n    else:\n        return 8\n\nspeed = get_speed(\"normal\")\nprint(\"선택된 속도:\", speed)"
        }
      ]
    },
    {
      "level": 7,
      "title": "모듈과 랜덤 — 아이템 생성, 적 등장",
      "concepts": ["import", "random.randint", "난수"],
      "whyInPygame": "적이나 아이템이 매번 다른 위치에 나오게 하려면 난수를 사용해야 하며, 이를 위해 random 모듈을 사용합니다.",
      "activities": [
        {
          "id": "7-1",
          "title": "랜덤 위치에 적 등장시키기",
          "description": "random 모듈을 사용해 적의 x 위치를 랜덤으로 정해 봅니다.",
          "starterCode": "import random\n\nenemy_x = random.randint(0, 300)\nprint(\"적 등장 위치:\", enemy_x)"
        },
        {
          "id": "7-2",
          "title": "랜덤 점수 보너스",
          "description": "1~10 사이의 랜덤한 점수를 보너스로 추가해 봅니다.",
          "starterCode": "import random\n\nscore = 0\nbonus = random.randint(1, 10)\nscore += bonus\n\nprint(\"보너스 점수:\", bonus)\nprint(\"총 점수:\", score)"
        },
        {
          "id": "7-3",
          "title": "랜덤 적 이름 선택",
          "description": "여러 적 이름 중 하나를 랜덤으로 선택해 등장시킵니다.",
          "starterCode": "import random\n\nenemy_names = [\"슬라임\", \"고블린\", \"해골\", \"마법사\"]\n\nchosen = random.choice(enemy_names)\nprint(\"오늘의 보스는:\", chosen)"
        },
        {
          "id": "7-4",
          "title": "랜덤 아이템 드랍",
          "description": "몬스터를 쓰러뜨렸을 때 랜덤하게 아이템이 떨어지도록 해 봅니다.",
          "starterCode": "import random\n\nitems = [\"포션\", \"골드\", \"없음\"]\n\ndrop = random.choice(items)\nprint(\"드랍된 아이템:\", drop)"
        },
        {
          "id": "7-5",
          "title": "랜덤으로 시작 위치 정하기",
          "description": "플레이어의 시작 x 좌표를 랜덤으로 정해 봅니다.",
          "starterCode": "import random\n\nplayer_x = random.randint(0, 600)\nprint(\"플레이어 시작 위치 x:\", player_x)"
        }
      ]
    },
    {
      "level": 8,
      "title": "좌표 개념과 속도 — 파이게임의 기초",
      "concepts": ["좌표(x, y)", "속도(dx, dy)", "벡터 느낌"],
      "whyInPygame": "캐릭터와 적, 총알 등 모든 게임 객체는 화면 위의 위치(x, y)와 이동 속도(dx, dy)로 표현되며, 매 프레임마다 위치에 속도를 더해 움직입니다.",
      "activities": [
        {
          "id": "8-1",
          "title": "속도를 이용해 위치 업데이트하기",
          "description": "x, y 좌표에 dx, dy를 더해 캐릭터를 움직입니다.",
          "starterCode": "x = 100\ny = 200\ndx = 3\ndy = -2\n\nx += dx\ny += dy\n\nprint(x, y)"
        },
        {
          "id": "8-2",
          "title": "대각선으로 계속 이동하기",
          "description": "반복문으로 좌표를 계속 업데이트하여 대각선으로 이동하는 모습을 출력합니다.",
          "starterCode": "x = 0\ny = 0\ndx = 5\ndy = 5\n\nfor i in range(5):\n    x += dx\n    y += dy\n    print(\"위치:\", x, y)"
        },
        {
          "id": "8-3",
          "title": "왼쪽/오른쪽에 따라 속도 바꾸기",
          "description": "방향에 따라 dx 값을 다르게 설정합니다.",
          "starterCode": "direction = input(\"left 또는 right 입력: \")\n\nx = 100\nif direction == \"left\":\n    dx = -5\nelse:\n    dx = 5\n\nx += dx\nprint(\"새 x 위치:\", x)"
        },
        {
          "id": "8-4",
          "title": "다음 프레임의 위치 미리 계산하기",
          "description": "현재 위치와 속도로 다음 프레임의 위치를 계산해서 보여줍니다.",
          "starterCode": "x = 50\ny = 80\ndx = 4\ndy = 0\n\nnext_x = x + dx\nnext_y = y + dy\n\nprint(\"현재 위치:\", x, y)\nprint(\"다음 위치:\", next_x, next_y)"
        },
        {
          "id": "8-5",
          "title": "여러 적의 좌표 한 번에 업데이트하기",
          "description": "리스트 안에 있는 여러 적의 x 좌표에 속도를 더해 이동시킵니다.",
          "starterCode": "enemy_x_list = [50, 100, 150]\ndx = 5\n\nfor i in range(len(enemy_x_list)):\n    enemy_x_list[i] += dx\n\nprint(\"이동 후 적들 위치:\", enemy_x_list)"
        }
      ]
    },
    {
      "level": 9,
      "title": "시간 개념 — 프레임(초당 30~60회) 이해",
      "concepts": ["time.sleep", "프레임 간격", "속도와 시간"],
      "whyInPygame": "게임은 보통 1초에 30~60번 화면을 다시 그리기 때문에, 프레임 간의 시간 간격을 조절해서 움직임 속도를 맞춰야 합니다.",
      "activities": [
        {
          "id": "9-1",
          "title": "시간을 두고 위치 변화 관찰하기",
          "description": "반복문과 time.sleep을 사용해 일정한 시간 간격으로 x 값을 바꾸며 출력합니다.",
          "starterCode": "import time\n\nx = 0\nfor _ in range(5):\n    x += 10\n    print(\"x:\", x)\n    time.sleep(0.5)   # 0.5초 기다림"
        },
        {
          "id": "9-2",
          "title": "프레임 번호와 시간 함께 출력하기",
          "description": "각 프레임마다 경과 시간을 함께 출력해 봅니다.",
          "starterCode": "import time\n\nstart = time.time()\nfor frame in range(1, 4):\n    now = time.time()\n    print(\"프레임:\", frame, \"경과 시간:\", now - start)\n    time.sleep(0.3)"
        },
        {
          "id": "9-3",
          "title": "느린 모드 vs 빠른 모드 비교",
          "description": "sleep 시간을 바꾸어 느린 모드와 빠른 모드의 차이를 느껴봅니다.",
          "starterCode": "import time\n\nprint(\"느린 모드\")\nfor _ in range(3):\n    print(\"...\")\n    time.sleep(0.7)\n\nprint(\"빠른 모드\")\nfor _ in range(3):\n    print(\"!!!\")\n    time.sleep(0.2)"
        },
        {
          "id": "9-4",
          "title": "카운트다운에 시간 넣기",
          "description": "카운트다운 숫자를 줄이면서 실제 시간도 지연시켜 봅니다.",
          "starterCode": "import time\n\nsec = 3\nwhile sec > 0:\n    print(sec)\n    time.sleep(1)\n    sec -= 1\n\nprint(\"GO!\")"
        },
        {
          "id": "9-5",
          "title": "프레임 간 이동 거리 계산하기",
          "description": "속도와 프레임 시간에 따라 이동 거리를 계산해 봅니다.",
          "starterCode": "speed = 100  # 1초에 100만큼 이동한다고 가정\nframe_time = 1 / 50  # 1초에 50프레임\n\nmove = speed * frame_time\nprint(\"한 프레임에서 이동 거리:\", move)"
        }
      ]
    },
    {
      "level": 10,
      "title": "이벤트(event) 이해 — 키보드로 캐릭터 움직이기 준비",
      "concepts": ["사용자 입력", "이벤트 처리 개념", "조건문과 입력 결합"],
      "whyInPygame": "파이게임에서는 키보드 이벤트를 감지해서 방향키가 눌렸을 때 캐릭터를 움직입니다. 콘솔에서 미리 입력과 조건문 조합을 익히면 이해가 쉬워집니다.",
      "activities": [
        {
          "id": "10-1",
          "title": "키 입력으로 캐릭터 좌표 바꾸기",
          "description": "사용자에게 a/d 키를 입력받아 x 좌표를 왼쪽 또는 오른쪽으로 이동시켜 봅니다.",
          "starterCode": "key = input(\"왼쪽은 a, 오른쪽은 d 입력: \")\n\nx = 100\nif key == \"a\":\n    x -= 5\nelif key == \"d\":\n    x += 5\n\nprint(\"새 좌표:\", x)"
        },
        {
          "id": "10-2",
          "title": "w/s 키로 위아래 움직이기",
          "description": "w/s 키에 따라 y 좌표를 위나 아래로 이동시켜 봅니다.",
          "starterCode": "key = input(\"위는 w, 아래는 s 입력: \")\n\ny = 200\nif key == \"w\":\n    y -= 5\nelif key == \"s\":\n    y += 5\n\nprint(\"새 y 위치:\", y)"
        },
        {
          "id": "10-3",
          "title": "여러 번 입력 받아서 연속 이동하기",
          "description": "세 번의 키 입력을 받아 그만큼 좌표를 계속 업데이트합니다.",
          "starterCode": "x = 100\n\nfor i in range(3):\n    key = input(\"왼쪽(a)/오른쪽(d) 중 하나: \")\n    if key == \"a\":\n        x -= 5\n    elif key == \"d\":\n        x += 5\n    print(\"현재 x:\", x)"
        },
        {
          "id": "10-4",
          "title": "정지/이동 상태 전환하기",
          "description": "입력에 따라 캐릭터가 움직이는지, 멈추는지 상태를 바꿔 봅니다.",
          "starterCode": "command = input(\"run 또는 stop 입력: \")\n\nis_running = False\nif command == \"run\":\n    is_running = True\n\nprint(\"움직이는 중인가요?\", is_running)"
        },
        {
          "id": "10-5",
          "title": "공격 키(q)와 점프 키(space) 인식하기",
          "description": "입력된 키에 따라 서로 다른 행동을 출력합니다.",
          "starterCode": "key = input(\"공격은 q, 점프는 space 입력: \")\n\nif key == \"q\":\n    print(\"공격!⚔\")\nelif key == \"space\":\n    print(\"점프!🦘\")\nelse:\n    print(\"아직 없는 동작이에요.\")"
        }
      ]
    },
    {
      "level": 11,
      "title": "파이게임 기초 문법 적용 — 화면/이벤트/그리기",
      "concepts": ["pygame.init()", "화면 생성", "게임 루프 while", "이벤트 처리", "도형 그리기"],
      "whyInPygame": "지금까지 배운 입력, 변수, 반복, 조건문 개념을 실제 파이게임 코드에서 어떻게 사용하는지 한 번에 연결해 보는 단계입니다.",
      "activities": [
        {
          "id": "11-1",
          "title": "기본 파이게임 루프 만들기",
          "description": "검은 화면 위에 노란색 원을 그린 뒤, 창을 닫으면 종료되는 가장 기본적인 파이게임 틀을 만들어 봅니다.",
          "starterCode": "import pygame\npygame.init()\n\nscreen = pygame.display.set_mode((600, 400))\nclock = pygame.time.Clock()\n\nx = 100\ny = 200\nrunning = True\n\nwhile running:\n    for event in pygame.event.get():\n        if event.type == pygame.QUIT:\n            running = False\n\n    screen.fill((0,0,0))\n    pygame.draw.circle(screen, (255,255,0), (x, y), 20)\n    pygame.display.update()\n    clock.tick(30)\n\npygame.quit()"
        },
        {
          "id": "11-2",
          "title": "키보드로 원 왼쪽/오른쪽 이동하기",
          "description": "좌우 방향키 이벤트를 받아 원의 x 좌표를 움직여 봅니다.",
          "starterCode": "import pygame\npygame.init()\n\nscreen = pygame.display.set_mode((600, 400))\nclock = pygame.time.Clock()\n\nx = 300\ny = 200\nspeed = 5\nrunning = True\n\nwhile running:\n    for event in pygame.event.get():\n        if event.type == pygame.QUIT:\n            running = False\n\n    keys = pygame.key.get_pressed()\n    if keys[pygame.K_LEFT]:\n        x -= speed\n    if keys[pygame.K_RIGHT]:\n        x += speed\n\n    screen.fill((0,0,0))\n    pygame.draw.circle(screen, (0,255,0), (x, y), 20)\n    pygame.display.update()\n    clock.tick(30)\n\npygame.quit()"
        },
        {
          "id": "11-3",
          "title": "화면 가장자리에서 튕기기",
          "description": "원을 자동으로 움직이게 하고, 벽에 닿으면 방향을 반대로 바꿔 튕기게 만듭니다.",
          "starterCode": "import pygame\npygame.init()\n\nscreen = pygame.display.set_mode((600, 400))\nclock = pygame.time.Clock()\n\nx = 100\ny = 200\ndx = 5\nrunning = True\n\nwhile running:\n    for event in pygame.event.get():\n        if event.type == pygame.QUIT:\n            running = False\n\n    x += dx\n    if x <= 20 or x >= 580:\n        dx = -dx\n\n    screen.fill((0,0,0))\n    pygame.draw.circle(screen, (0,0,255), (x, y), 20)\n    pygame.display.update()\n    clock.tick(60)\n\npygame.quit()"
        },
        {
          "id": "11-4",
          "title": "여러 적 그리기",
          "description": "리스트에 저장된 여러 x 좌표 위치에 적(원)을 여러 개 그립니다.",
          "starterCode": "import pygame\npygame.init()\n\nscreen = pygame.display.set_mode((600, 400))\nclock = pygame.time.Clock()\n\nenemy_x_list = [100, 250, 400]\ny = 200\nrunning = True\n\nwhile running:\n    for event in pygame.event.get():\n        if event.type == pygame.QUIT:\n            running = False\n\n    screen.fill((0,0,0))\n    for ex in enemy_x_list:\n        pygame.draw.circle(screen, (255,0,0), (ex, y), 20)\n\n    pygame.display.update()\n    clock.tick(30)\n\npygame.quit()"
        },
        {
          "id": "11-5",
          "title": "점수 텍스트 화면에 표시하기",
          "description": "점수 변수를 만들고, 파이게임의 글꼴 기능을 사용해 화면에 점수를 출력합니다.",
          "starterCode": "import pygame\npygame.init()\n\nscreen = pygame.display.set_mode((600, 400))\nclock = pygame.time.Clock()\nfont = pygame.font.SysFont(None, 40)\n\nscore = 0\nrunning = True\n\nwhile running:\n    for event in pygame.event.get():\n        if event.type == pygame.QUIT:\n            running = False\n\n    score += 1\n    screen.fill((0,0,0))\n\n    text = font.render(f\"Score: {score}\", True, (255,255,255))\n    screen.blit(text, (20, 20))\n\n    pygame.display.update()\n    clock.tick(30)\n\npygame.quit()"
        }
      ]
    }
  ]
};


