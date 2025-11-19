# AI 자동 수정 기능 설정 가이드

## 📋 개요

EduPy의 AI 자동 수정 기능은 OpenAI API를 사용하여 학생들이 작성한 코드의 오류를 자동으로 분석하고 수정합니다.

## 🔑 OpenAI API 키 발급

### 1. OpenAI 계정 생성
1. https://platform.openai.com/ 접속
2. 계정 생성 또는 로그인

### 2. API 키 발급
1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 버튼 클릭
3. 키 이름 입력 (예: "EduPy Auto Fix")
4. API 키 복사 (한 번만 표시되므로 안전한 곳에 저장)

### 3. 결제 정보 등록
1. https://platform.openai.com/account/billing 접속
2. 결제 수단 등록
3. 사용량 제한 설정 (권장: $5-10/월)

## ⚙️ 설정 방법

### 1. `.env` 파일 수정

프로젝트 루트의 `.env` 파일을 열고 다음 항목을 수정하세요:

```bash
# OpenAI API 설정 (자동 오류 수정)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**주의:** `your-openai-api-key-here`를 실제 발급받은 API 키로 교체하세요!

### 2. 백엔드 재시작

```bash
cd backend
python main.py
```

## 💰 비용 안내

### 사용 모델: `gpt-4o-mini`

- **입력 토큰:** $0.150 / 1M tokens
- **출력 토큰:** $0.600 / 1M tokens

### 예상 비용 (1회 오류 수정)

- 평균 입력: ~500 tokens (코드 + 오류 메시지)
- 평균 출력: ~300 tokens (수정된 코드 + 설명)
- **1회 비용:** 약 $0.0003 (0.03원)
- **100회 수정:** 약 $0.03 (3원)
- **1000회 수정:** 약 $0.30 (300원)

매우 저렴하므로 부담 없이 사용할 수 있습니다!

## 🧪 테스트 방법

### 1. 관리자 대시보드 접속
```
http://localhost:5173/admin
```

### 2. 오류 보고 확인
- "오류 관리" 탭에서 미해결 오류 확인

### 3. AI 수정 테스트
- 오류 항목의 "🤖 AI 수정" 버튼 클릭
- 수정된 코드와 설명 확인

## ❌ 문제 해결

### "OpenAI API 키가 설정되지 않았습니다"

**원인:** `.env` 파일에 API 키가 없거나 잘못됨

**해결:**
1. `.env` 파일 확인
2. `OPENAI_API_KEY=sk-proj-...` 형식으로 설정
3. 백엔드 재시작

### "API 오류: 401"

**원인:** API 키가 유효하지 않음

**해결:**
1. OpenAI 대시보드에서 API 키 재확인
2. 새 API 키 발급
3. `.env` 파일 업데이트

### "API 오류: 429"

**원인:** 사용량 한도 초과 또는 요청 속도 제한

**해결:**
1. OpenAI 대시보드에서 사용량 확인
2. 결제 수단 확인
3. 잠시 후 다시 시도

### "API 요청 시간 초과"

**원인:** 네트워크 문제 또는 OpenAI 서버 지연

**해결:**
1. 인터넷 연결 확인
2. 잠시 후 다시 시도
3. OpenAI 상태 페이지 확인: https://status.openai.com/

## 🔒 보안 주의사항

### ⚠️ API 키 보호

1. **절대 공개하지 마세요**
   - GitHub에 커밋하지 않기
   - `.env` 파일은 `.gitignore`에 포함됨

2. **정기적으로 교체**
   - 3-6개월마다 새 키 발급
   - 이전 키 삭제

3. **사용량 모니터링**
   - OpenAI 대시보드에서 정기적으로 확인
   - 이상 사용 패턴 감지 시 즉시 키 교체

## 📊 사용 통계 확인

### OpenAI 대시보드
https://platform.openai.com/usage

- 일별/월별 사용량
- 모델별 비용
- 요청 횟수

## 🎯 최적화 팁

### 1. 비용 절감
- 현재 사용 중인 `gpt-4o-mini`는 이미 가장 저렴한 모델
- 필요시 `max_tokens`를 줄여서 출력 제한 가능

### 2. 성능 향상
- `temperature=0.3`으로 일관된 결과 보장
- 시스템 프롬프트로 응답 품질 향상

### 3. 오류 처리
- 30초 타임아웃 설정
- 재시도 로직 (필요시 추가 가능)

## 📚 참고 자료

- [OpenAI API 문서](https://platform.openai.com/docs)
- [GPT-4o-mini 가격](https://openai.com/api/pricing/)
- [OpenAI 사용 가이드](https://platform.openai.com/docs/guides)

## 💡 추가 기능 아이디어

1. **배치 수정**: 여러 오류를 한 번에 수정
2. **학습 모드**: 수정 과정을 단계별로 설명
3. **난이도 조절**: 학생 수준에 맞는 설명
4. **코드 리뷰**: 오류가 없어도 개선 제안

---

**문의:** neohum77@gmail.com

