---
description: ~/.claude 리포(dotclaude)의 변경(CLAUDE.md, docs, commands, hooks)을 PR로 올리고 merge
---

`~/.claude`는 `dotclaude` 리포 자체입니다. `~/.claude`에서 바로 커밋하고, PR을 만들어 merge하세요.
`~/.claude`가 git 리포가 아니면 멈추고 `README.md`의 설치 방법을 알리세요.

# 해제하는 룰
아래 Git workflow 항목은 `~/.claude/docs/git/git.md`에 있습니다.
- Workflow 4번 (질문 창으로 동의 받기)
  - 이 command의 실행을 "동작 방식"의 브랜치, 커밋, push, PR, merge에 대한 동의로 보세요.
- Git workflow "요청 방식"의 작업 키 정하기(Jira 키, GitHub 이슈 등록)
- Git workflow "진행"의 이슈 문서와 테스트 단계
- Git workflow "요청 방식"의 릴리스 브랜치 질문: 릴리스 브랜치 없이 `main`으로 PR을 올리세요.

# 동작 방식
1. `~/.claude`에서 `git status`로 변경을 확인하세요. 변경이 없으면 멈추세요.
2. 바뀐 파일이 어느 리포에서나 쓸 수 있는지 확인하세요.
   - 특정 리포나 프로젝트에서만 쓰는 파일(e.g. ComfyUI 전용)은 커밋하지 마세요.
   - 공통인지 애매하면 멈추고 사용자에게 물으세요.
3. `git fetch`로 `origin/main`을 받으세요. 로컬 `main`보다 앞서 있으면 `git pull --rebase --autostash`로 맞추고, 충돌하면 멈추고 알리세요.
4. `main`에서 `chore/${user}/sync-claude-config-<YYYYMMDD>` 브랜치를 만드세요.
5. `README.md`의 구성 표를 실제 파일 목록과 맞추세요.
   - command의 설명은 그 파일의 `description`을 쓰세요.
6. 바뀐 내용을 요약한 영어 제목으로 커밋하고 push하세요.
7. `main`으로 PR을 만드세요. 본문은 한국어로 바뀐 파일과 요점만 적으세요.
8. `gh pr merge --merge --delete-branch`로 merge하고, 로컬을 `main`으로 돌려 pull하세요.
9. PR 번호와 바뀐 파일을 표로 알리세요.

# 금지
- `.gitignore`의 허용 목록을 넓혀 `.credentials.json`, `settings.json`, `projects/`(메모리 포함)를 추적하지 마세요.
- squash merge를 하지 마세요.

$ARGUMENTS
