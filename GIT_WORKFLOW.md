# Git Workflow 정책

## 개요
이 문서는 edupy 프로젝트의 Git 브랜치 전략 및 작업 흐름을 정의합니다.

## 브랜치 전략

### Main 브랜치
- `main`: 프로덕션 준비 상태의 안정적인 코드
- 직접 커밋 금지
- PR을 통해서만 병합

### Feature 브랜치
- 명명 규칙: `feature/<기능명>` 또는 `fix/<버그명>`
- 예시: `feature/user-authentication`, `fix/login-error`

## 작업 흐름

### 1. 새로운 작업 시작

작업을 시작하기 전에 main 브랜치를 최신 상태로 업데이트합니다:

```bash
git checkout main
git pull origin main
```

### 2. 새 브랜치 생성

작업할 내용에 맞는 브랜치를 생성합니다:

```bash
git checkout -b feature/<기능명>
# 예시: git checkout -b feature/add-quiz-module
```

### 3. 작업 및 커밋

코드 작업 후 변경사항을 커밋합니다:

```bash
# 변경된 파일 확인
git status

# 파일 스테이징
git add <파일명>
# 또는 모든 변경사항 추가
git add .

# 커밋 (의미있는 커밋 메시지 작성)
git commit -m "feat: 퀴즈 모듈 추가"
```

#### 커밋 메시지 규칙
- `feat:` - 새로운 기능 추가
- `fix:` - 버그 수정
- `docs:` - 문서 수정
- `style:` - 코드 포맷팅, 세미콜론 누락 등
- `refactor:` - 코드 리팩토링
- `test:` - 테스트 코드 추가/수정
- `chore:` - 빌드 업무, 패키지 매니저 설정 등

### 4. 원격 저장소에 푸시

```bash
git push origin feature/<기능명>
# 예시: git push origin feature/add-quiz-module
```

처음 푸시하는 경우:
```bash
git push -u origin feature/<기능명>
```

### 5. Pull Request (PR) 생성

1. GitHub 저장소로 이동
2. "Compare & pull request" 버튼 클릭
3. PR 제목과 설명 작성
   - 제목: 명확하고 간결하게
   - 설명: 변경 내용, 이유, 테스트 방법 등 포함
4. Reviewer 지정 (필요시)
5. "Create pull request" 클릭

#### PR 템플릿 예시
```
## 변경 사항
- 구현한 기능 또는 수정한 버그 설명

## 변경 이유
- 왜 이 변경이 필요한지 설명

## 테스트 방법
- 어떻게 테스트했는지 설명

## 스크린샷 (필요시)
- UI 변경이 있는 경우 스크린샷 첨부
```

### 6. 코드 리뷰 및 수정

- 리뷰어의 피드백을 받으면 수정 작업 진행
- 수정 후 동일한 브랜치에 커밋 및 푸시
- PR은 자동으로 업데이트됨

```bash
# 수정 작업 후
git add .
git commit -m "fix: 리뷰 피드백 반영"
git push origin feature/<기능명>
```

### 7. Merge & Squash

PR이 승인되면 GitHub에서 다음 작업을 수행합니다:

1. "Squash and merge" 버튼 클릭
2. 커밋 메시지 확인/수정
3. Merge 완료
4. 원격 브랜치 삭제 (Delete branch 버튼 클릭)

### 8. 로컬 환경 정리

원격에서 merge가 완료되면 로컬 환경을 정리합니다:

```bash
# main 브랜치로 이동
git checkout main

# 최신 변경사항 가져오기
git pull origin main

# 로컬 브랜치 삭제
git branch -d feature/<기능명>

# 원격에서 삭제된 브랜치 정보 정리
git fetch --prune
```

## 주의사항

### ⚠️ 절대 하지 말아야 할 것
- `main` 브랜치에 직접 커밋하지 않기
- 다른 사람의 브랜치에 강제 푸시(`git push -f`) 하지 않기
- 민감한 정보(API 키, 비밀번호 등)를 커밋하지 않기

### ✅ 권장사항
- 작은 단위로 자주 커밋하기
- 의미있는 커밋 메시지 작성하기
- PR은 가능한 작게 유지하기 (리뷰하기 쉽게)
- 작업 시작 전 항상 main 브랜치를 최신 상태로 유지하기

## 긴급 상황 대응

### 작업 중 main 브랜치가 업데이트된 경우

```bash
# 현재 작업 임시 저장
git stash

# main 브랜치 업데이트
git checkout main
git pull origin main

# 작업 브랜치로 돌아가기
git checkout feature/<기능명>

# main의 최신 변경사항 가져오기
git rebase main

# 임시 저장한 작업 복원
git stash pop
```

### 잘못된 커밋을 한 경우

```bash
# 마지막 커밋 취소 (변경사항은 유지)
git reset --soft HEAD~1

# 마지막 커밋 메시지만 수정
git commit --amend -m "새로운 커밋 메시지"
```

## 참고 명령어

```bash
# 현재 브랜치 확인
git branch

# 모든 브랜치 확인 (원격 포함)
git branch -a

# 변경사항 확인
git status

# 커밋 히스토리 확인
git log --oneline

# 특정 파일의 변경사항 확인
git diff <파일명>
```

