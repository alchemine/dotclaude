---
description: worktree를 만들지 않고 현재 리포에서 Git workflow대로 작업
---

"작업 내용"에 적힌 작업을 Git workflow대로 진행하되, 개발 브랜치는 현재 리포에 만드세요.

# 동작 방식
1. 먼저 `~/.claude/docs/git/git.md`를 읽으세요.
2. 작업 내용이 없으면 글로 되묻고 멈추세요.
3. 작업 내용이 Jira 티켓이면 첨부 이미지도 내려받아 읽으세요. 이미지 속 예시는 요구사항의 예시로 다룹니다(`~/.claude/docs/testing/testing.md` "대표 예제" 1번).
4. 브랜치를 바꾸기 전에 `git status`로 커밋되지 않은 변경이 있는지 확인하세요.
   - 있으면 `~/.claude/CLAUDE.md` Workflow 2번대로 합칠 순서를 제안하고 질문 창으로 고르게 하세요. 브랜치를 바꾸면 그 변경이 따라오므로, 같은 파일이 아니어도 묻습니다.
5. 개발 브랜치는 현재 리포에서 만들고 체크아웃하세요.
6. Git workflow "커밋, PR, merge"의 개발 브랜치 정리는 `/task` 항목을 따르세요.

# 작업 내용
$ARGUMENTS
