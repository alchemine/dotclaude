---
description: worktree를 만들지 않고 현재 리포에서 Git workflow대로 작업
---

"작업 내용"에 적힌 작업을 Git workflow대로 진행하되, 개발 브랜치는 현재 리포에 만드세요.

# 동작 방식
1. 작업 내용이 없으면 멈추고 물어보세요.
2. 브랜치를 바꾸기 전에 `git status`로 커밋되지 않은 변경이 있는지 확인하세요.
   - 있으면 멈추고 알리세요.
3. 개발 브랜치는 현재 리포에서 만들고 체크아웃하세요.
4. Git workflow "커밋, PR, merge"의 개발 브랜치 정리는 `/work` 항목을 따르세요.

# 작업 내용
$ARGUMENTS
