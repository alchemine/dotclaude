---
description: ~/.claude의 CLAUDE.md, commands, skills, hooks를 dotclaude 리포에 덮어쓰고 PR을 merge
---

`~/.claude`의 설정을 `dotclaude` 리포에 덮어쓰고, PR을 만들어 merge하세요.
`dotclaude` 리포의 위치를 모르면 사용자에게 물어보세요.

# 해제하는 룰
아래 Git workflow 항목은 `~/.claude/git.md`에 있습니다.
- Workflow 4번 (질문 창으로 동의 받기)
  - 이 command의 실행을 "동작 방식"의 복사, 커밋, push, PR, merge에 대한 동의로 보세요.
- Git workflow "요청 방식"의 작업 키 정하기(Jira 키, GitHub 이슈 등록)
- Git workflow "진행"의 이슈 문서와 테스트 단계
- Git workflow "요청 방식"의 릴리스 브랜치 질문: 릴리스 브랜치 없이 `main`으로 PR을 올리세요.

# 동작 방식
1. `dotclaude`에서 `git status`로 커밋되지 않은 변경이 있는지 확인하세요.
   - 있으면 그 파일이 `~/.claude`의 같은 파일과 내용이 같은지 확인하세요.
   - 같으면 이어서 진행하고, 다르면 멈추고 알리세요.
2. `git checkout main && git pull`로 최신 상태를 받으세요.
3. `main`에서 `chore/${user}/sync-claude-config-<YYYYMMDD>` 브랜치를 만드세요.
4. 아래를 덮어쓰세요. 원본에서 지워진 파일은 리포에서도 지우세요.
   - `~/.claude/CLAUDE.md` → `CLAUDE.md`
   - `~/.claude/git.md` → `git.md`
   - `~/.claude/commands/` → `commands/`
   - `~/.claude/skills/` → `skills/` (`synced/`, `.trash/`는 제외)
   - `~/.claude/hooks/` → `hooks/`
   - 어느 리포에서나 쓸 수 있는 파일만 복사하세요.
   - 특정 리포나 프로젝트에서만 쓰는 파일(e.g. ComfyUI 전용)은 제외하세요.
   - 제외 대상이 리포에 이미 있으면 지우세요.
   - 공통인지 애매하면 멈추고 사용자에게 물으세요.
5. `git diff --stat`으로 변경이 없으면 브랜치를 지우고 멈추세요.
6. `README.md`의 구성 표를 실제 파일 목록과 맞추세요.
   - command의 설명은 그 파일의 `description`을 쓰세요.
7. 바뀐 내용을 요약한 영어 제목으로 커밋하고 push하세요.
8. `main`으로 PR을 만드세요. 본문은 한국어로 바뀐 파일과 요점만 적으세요.
9. `gh pr merge --merge --delete-branch`로 merge하고, 로컬을 `main`으로 돌려 pull하세요.
10. PR 번호와 바뀐 파일을 표로 알리세요.

# 금지
- `.credentials.json`, `settings.json`, `projects/`(메모리 포함) 등 위 목록에 없는 파일을 복사하지 마세요.
- squash merge를 하지 마세요.

$ARGUMENTS
