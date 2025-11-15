# Turtle Simulator - 지원되는 메서드 목록

## ✅ 구현 완료된 메서드

### 🐢 Turtle Motion (이동)
- `forward(distance)` / `fd(distance)` - 앞으로 이동
- `backward(distance)` / `bk(distance)` / `back(distance)` - 뒤로 이동
- `right(angle)` / `rt(angle)` - 오른쪽으로 회전
- `left(angle)` / `lt(angle)` - 왼쪽으로 회전
- `goto(x, y)` / `setpos(x, y)` / `setposition(x, y)` - 특정 위치로 이동
- `setx(x)` - x 좌표만 설정
- `sety(y)` - y 좌표만 설정
- `setheading(angle)` / `seth(angle)` - 방향 설정
- `home()` - 원점으로 이동하고 방향을 북쪽으로
- `circle(radius, extent)` - 원 그리기
- `dot(size, color)` - 점 그리기

### 📍 Tell Turtle's State (상태 확인)
- `position()` / `pos()` - 현재 위치 반환
- `xcor()` - x 좌표 반환
- `ycor()` - y 좌표 반환
- `heading()` - 현재 방향 반환
- `distance(x, y)` - 특정 위치까지의 거리

### 🖊️ Pen Control (펜 제어)
- `pendown()` / `pd()` / `down()` - 펜 내리기
- `penup()` / `pu()` / `up()` - 펜 들기
- `pensize(width)` / `width(width)` - 펜 두께 설정/반환
- `pencolor(color)` - 펜 색상 설정/반환
- `isdown()` - 펜이 내려져 있는지 확인

### 🎨 Color Control (색상 제어)
- `color(*args)` - 펜 색상과 채우기 색상 설정
- `pencolor(color)` - 펜 색상 설정
- `fillcolor(color)` - 채우기 색상 설정

### 🎨 Filling (채우기)
- `begin_fill()` - 채우기 시작
- `end_fill()` - 채우기 종료

### 👁️ Turtle State (거북이 상태)
- `hideturtle()` / `ht()` - 거북이 숨기기
- `showturtle()` / `st()` - 거북이 보이기
- `isvisible()` - 거북이가 보이는지 확인

### ⚙️ More Control (추가 제어)
- `speed(speed)` - 속도 설정 (시뮬레이션에서는 무시)
- `done()` - 완료 (호환성)

## 📝 사용 예제

### 예제 1: 정사각형 그리기
```python
import turtle as t

for i in range(4):
    t.forward(100)
    t.right(90)
```

### 예제 2: 별 그리기 (채우기)
```python
import turtle as t

t.color('red', 'yellow')
t.begin_fill()
for i in range(5):
    t.forward(200)
    t.right(144)
t.end_fill()
```

### 예제 3: 원 그리기
```python
import turtle as t

t.circle(100)
```

### 예제 4: 다양한 색상의 원
```python
import turtle as t

colors = ['red', 'blue', 'green', 'yellow', 'purple']
for i in range(5):
    t.pencolor(colors[i])
    t.circle(50 + i * 20)
```

### 예제 5: 점 그리기
```python
import turtle as t

for i in range(10):
    t.dot(20, 'red')
    t.forward(30)
```

### 예제 6: 숨겨진 거북이
```python
import turtle as t

t.hideturtle()
t.forward(100)
t.right(90)
t.forward(100)
```

## 🔄 애니메이션 지원

`animate=True` 옵션을 사용하면 프레임 단위로 애니메이션을 생성합니다:
- `forward()` 메서드는 4단계로 분할되어 부드러운 애니메이션 생성
- `circle()` 메서드는 원 전체를 그린 후 한 번만 프레임 저장 (성능 최적화)
- 각 프레임은 Base64 인코딩된 PNG 이미지로 반환

## 🎯 향후 추가 예정

### 미구현 메서드 (필요시 추가 가능)
- `stamp()` - 거북이 모양 스탬프
- `clearstamp(stampid)` - 스탬프 삭제
- `undo()` - 마지막 동작 취소
- `write(text)` - 텍스트 쓰기
- `shape(name)` - 거북이 모양 변경
- `shapesize()` / `turtlesize()` - 거북이 크기 변경
- `onclick()` - 마우스 클릭 이벤트
- `degrees()` / `radians()` - 각도 단위 설정

