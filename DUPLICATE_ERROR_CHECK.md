# 오류 보고 중복 체크 기능

## 📋 개요

오류 보고 시 데이터베이스의 기존 오류와 비교하여 중복 여부를 확인하는 기능입니다.

## 🔍 중복 체크 기준

다음 3가지 필드가 모두 일치하면 중복으로 판단합니다:
1. **level** - 레벨 정보 (예: "레벨 1")
2. **activity** - 활동 정보 (예: "활동 1")
3. **error_message** - 오류 메시지 (예: "NameError: name 'x' is not defined")

## 🛠️ 구현 내용

### 1. 백엔드 - database.py

#### `check_duplicate_error()` 함수 추가
```python
def check_duplicate_error(level: str, activity: str, error_message: str) -> Optional[Dict]:
    """
    중복 오류 체크
    
    Returns:
        중복된 오류가 있으면 해당 오류 정보 반환, 없으면 None
    """
```

#### `save_error_report()` 함수 수정
- 반환 타입 변경: `int` → `Dict`
- 중복 체크 로직 추가
- 반환 값:
  ```python
  {
      'success': bool,
      'duplicate': bool,
      'error_id': int (새로 저장된 경우),
      'existing_error': dict (중복인 경우),
      'message': str
  }
  ```

### 2. 백엔드 - main.py

#### `/api/error-report` 엔드포인트 수정
- 중복 체크 결과 처리
- 중복인 경우 이메일 발송 없이 즉시 반환
- 응답 형식:
  ```json
  {
      "success": false,
      "duplicate": true,
      "message": "이미 접수된 오류입니다.",
      "existing_error": {
          "id": 1,
          "level": "레벨 1",
          "activity": "활동 1",
          "error_message": "...",
          "created_at": "2025-11-15 12:00:00",
          "resolved": false
      }
  }
  ```

### 3. 프론트엔드 - ErrorReportButton.tsx

#### 중복 오류 처리 로직 추가
```typescript
if (data.duplicate) {
    const existingError = data.existing_error;
    const createdDate = new Date(existingError.created_at).toLocaleString('ko-KR');
    const statusText = existingError.resolved ? '✅ 해결됨' : '⏳ 처리 중';
    
    alert(
        `⚠️ 이미 접수된 오류입니다.\n\n` +
        `📋 오류 ID: #${existingError.id}\n` +
        `📅 최초 접수일: ${createdDate}\n` +
        `📊 상태: ${statusText}\n\n` +
        `동일한 오류가 이미 보고되어 처리 중입니다.`
    );
}
```

#### API 엔드포인트 중앙화
- `API_ENDPOINTS.sendErrorReport` 사용

## 📊 동작 흐름

```
사용자 오류 보고 클릭
    ↓
프론트엔드: API 요청 전송
    ↓
백엔드: check_duplicate_error() 실행
    ↓
중복 체크 (level + activity + error_message)
    ↓
    ├─ 중복 O → 기존 오류 정보 반환 (이메일 발송 X)
    │       ↓
    │   프론트엔드: 중복 알림 표시
    │
    └─ 중복 X → DB 저장 + 이메일 발송
            ↓
        프론트엔드: 성공 알림 표시
```

## 🧪 테스트 방법

### 1. 첫 번째 오류 보고
1. http://localhost:5173/learn 접속
2. 잘못된 코드 실행 (예: `print(x)`)
3. "🐛 오류 보고" 버튼 클릭
4. 결과: "✅ 오류 보고가 성공적으로 전송되었습니다!"

### 2. 동일한 오류 재보고
1. 같은 레벨, 같은 활동에서
2. 같은 오류 발생 (예: `print(x)`)
3. "🐛 오류 보고" 버튼 클릭
4. 결과: "⚠️ 이미 접수된 오류입니다."

### 3. 다른 오류 보고
1. 다른 오류 발생 (예: `print(1/0)`)
2. "🐛 오류 보고" 버튼 클릭
3. 결과: "✅ 오류 보고가 성공적으로 전송되었습니다!"

## 📝 예제 시나리오

### 시나리오 1: 중복 오류
```
첫 번째 보고:
- Level: "레벨 1"
- Activity: "활동 1"
- Error: "NameError: name 'x' is not defined"
→ 성공 (DB 저장 + 이메일 발송)

두 번째 보고 (동일):
- Level: "레벨 1"
- Activity: "활동 1"
- Error: "NameError: name 'x' is not defined"
→ 중복 (DB 저장 X, 이메일 발송 X)
```

### 시나리오 2: 다른 오류
```
첫 번째 보고:
- Level: "레벨 1"
- Activity: "활동 1"
- Error: "NameError: name 'x' is not defined"
→ 성공

두 번째 보고 (다른 오류):
- Level: "레벨 1"
- Activity: "활동 1"
- Error: "ZeroDivisionError: division by zero"
→ 성공 (다른 오류이므로 새로 저장)
```

## ✅ 장점

1. **중복 이메일 방지** - 같은 오류에 대해 여러 번 이메일 발송 방지
2. **데이터베이스 효율성** - 중복 데이터 저장 방지
3. **사용자 피드백** - 이미 접수된 오류임을 명확히 알림
4. **오류 추적** - 기존 오류 ID와 상태 정보 제공

## 🔧 기술 스택

- **백엔드**: FastAPI, SQLite3
- **프론트엔드**: React, TypeScript
- **데이터베이스**: SQLite (파라미터화된 쿼리로 SQL Injection 방지)

## 📌 주의사항

- 중복 체크는 **정확히 일치**하는 경우만 해당
- 오류 메시지가 조금이라도 다르면 별도 오류로 처리
- 해결된 오류도 중복으로 간주 (재발 방지)

