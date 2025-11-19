#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, 'backend')
os.chdir('backend')

from database import get_error_reports

# 모든 오류 가져오기
all_errors = get_error_reports(limit=100, offset=0, filter_status='all')
print(f"전체 오류 개수: {len(all_errors)}")
print("\n전체 오류 목록:")
for error in all_errors:
    print(f"  ID {error['id']}: {error['level']} - {error['activity']} (resolved: {error['resolved']})")

# 미해결 오류만 가져오기
unresolved_errors = get_error_reports(limit=100, offset=0, filter_status='unresolved')
print(f"\n미해결 오류 개수: {len(unresolved_errors)}")
print("\n미해결 오류 목록:")
for error in unresolved_errors:
    print(f"  ID {error['id']}: {error['level']} - {error['activity']}")

# 해결된 오류만 가져오기
resolved_errors = get_error_reports(limit=100, offset=0, filter_status='resolved')
print(f"\n해결된 오류 개수: {len(resolved_errors)}")
print("\n해결된 오류 목록:")
for error in resolved_errors:
    print(f"  ID {error['id']}: {error['level']} - {error['activity']}")

