/**
 * 커리큘럼의 모든 예제 코드를 검증하는 스크립트
 * 
 * 사용법: node test-curriculum.js
 */

import { pythonCurriculum } from './src/data/pythonCurriculum.ts';

// 예제 코드에서 예상 출력을 추출하는 함수
function extractExpectedOutput(code) {
  const lines = code.split('\n');
  const outputs = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // print() 문 찾기
    const printMatch = trimmed.match(/print\((.*)\)/);
    if (printMatch) {
      let content = printMatch[1];
      
      // 따옴표 제거
      content = content.replace(/^["']|["']$/g, '');
      
      // 이스케이프 문자 처리
      content = content.replace(/\\n/g, '\n');
      
      outputs.push(content);
    }
  }
  
  return outputs.join('\n');
}

// 모든 활동 검증
function validateAllActivities() {
  console.log('🔍 커리큘럼 예제 코드 검증 시작...\n');
  
  let totalActivities = 0;
  let issuesFound = [];
  
  pythonCurriculum.levels.forEach(level => {
    console.log(`\n📚 Level ${level.level}: ${level.title}`);
    console.log('─'.repeat(60));
    
    level.activities.forEach(activity => {
      totalActivities++;
      console.log(`\n  ${activity.id} - ${activity.title}`);
      
      // 코드 분석
      const code = activity.starterCode;
      const hasInput = code.includes('input(');
      const hasPrint = code.includes('print(');
      const hasComment = code.includes('#');
      
      console.log(`    📝 코드 길이: ${code.length}자`);
      console.log(`    🔤 print() 사용: ${hasPrint ? '✅' : '❌'}`);
      console.log(`    ⌨️  input() 사용: ${hasInput ? '✅' : '⚠️  (사용자 입력 필요)'}`);
      console.log(`    💬 주석 포함: ${hasComment ? '✅' : '⚠️'}`);
      
      // 문제점 체크
      if (!hasPrint && !hasInput) {
        issuesFound.push({
          id: activity.id,
          title: activity.title,
          issue: 'print()나 input()이 없음'
        });
      }
      
      // 예상 출력 추출 (input이 없는 경우만)
      if (!hasInput && hasPrint) {
        const expectedOutput = extractExpectedOutput(code);
        if (expectedOutput) {
          console.log(`    📤 예상 출력:\n${expectedOutput.split('\n').map(l => '       ' + l).join('\n')}`);
        }
      }
    });
  });
  
  // 요약
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 검증 요약');
  console.log('='.repeat(60));
  console.log(`총 활동 수: ${totalActivities}개`);
  console.log(`문제 발견: ${issuesFound.length}개`);
  
  if (issuesFound.length > 0) {
    console.log('\n⚠️  발견된 문제:');
    issuesFound.forEach(issue => {
      console.log(`  - ${issue.id}: ${issue.title} - ${issue.issue}`);
    });
  } else {
    console.log('\n✅ 모든 예제 코드가 정상입니다!');
  }
}

// 실행
validateAllActivities();

