# dotclaude

Claude Code의 전역 설정(`~/.claude`)을 보관하는 저장소입니다.

## 구성

| 경로 | 내용 |
|---|---|
| `CLAUDE.md` | 모든 프로젝트에 적용되는 전역 지침 |
| `docs/git/git.md` | git 작업과 배포 때 읽는 Git 규칙(브랜치, 작업 절차, 배포) |
| `docs/architecture/architecture.md` | 새 서비스나 프로덕트의 구조를 잡을 때 읽는 설계 지침 |
| `docs/architecture/backend.md` | API와 백엔드 구성(계층, DB, 캐시, 에러, 인증, 백그라운드 작업)을 정할 때 읽는 지침 |
| `docs/architecture/deployment.md` | 배포 방식, Docker, CI/CD, 헬스 체크, 환경 설정, 롤백을 정할 때 읽는 지침 |
| `docs/documentation/documentation.md` | 문서 파일이나 Notion 페이지를 쓰거나 고칠 때 읽는 지침(캡션, 문서에 적을 말) |
| `docs/workflow/consent.md` | 파일 수정, 환경 변경, git 작업, 삭제, 외부 전송 전에 동의를 받는 절차 |
| `docs/workflow/subagents.md` | 서브에이전트의 수와 모델, 서버 부하 호출의 동시 요청 수를 정하는 규칙 |
| `docs/workflow/decision.md` | 비교나 추천을 할 때 평가 기준을 세우고 결론을 내는 절차 |
| `docs/workflow/visual-check.md` | 사람이 눈으로 보는 결과물을 만들거나 고칠 때 보이는 모습을 확인하는 절차 |
| `docs/workflow/pm.md` | `/pm`으로 PM 모드에 들어갔을 때 읽는 지침 |
| `docs/feedbacks/feedbacks.md` | `CLAUDE.md`에 있지만 자주 놓친 항목(답변과 행동 전에 확인) |
| `commands/auto.md` | `/auto`: PM 모드에서 동의 없이 티켓을 만들고 처리해 -auto 릴리스 브랜치에 쌓는 자동 모드 |
| `commands/pm.md` | `/pm`: Claude가 티켓을 만들고 처리하고 보고하며 사용자는 통과 여부와 릴리스 범위만 정하는 PM 모드 |
| `commands/discuss.md` | `/discuss`: 읽기만 허용하고 수정, 커밋, 푸시 등 일체의 변경 작업을 금지하는 토론 모드 |
| `commands/task.md` | `/task`: worktree를 만들지 않고 현재 리포에서 Git workflow대로 작업 |
| `commands/task-worktree.md` | `/task-worktree`: worktree를 만들어 Git workflow대로 작업 |
| `commands/reflect.md` | `/reflect`: 지적이나 세션을 되짚어 원인을 찾고, 규칙(CLAUDE.md, docs, command)과 메모리를 고침 |
| `commands/merge-dotclaude.md` | `/merge-dotclaude`: ~/.claude 리포(dotclaude)의 변경(CLAUDE.md, docs, commands, hooks)을 PR로 올리고 merge |
| `.gitignore` | 추적할 파일만 허용하는 목록 |
| `hooks/validate-hard-rules.sh` | 마지막 답변에 em-dash가 있으면 고치게 하는 Stop hook (`settings.json`의 `hooks.Stop`에 등록해야 동작) |
| `hooks/feedbacks-reminder.mjs` | `docs/feedbacks/feedbacks.md`의 확인 항목을 컨텍스트로 붙이는 UserPromptSubmit, PreToolUse hook (`settings.json`에 등록해야 동작) |
| `hooks/require-adversarial-review.sh` | 답변이 적대적 리뷰를 거치지 않았으면 다시 답하게 하는 Stop hook (참고용, 등록하지 않음) |

## 설치

`~/.claude`를 이 리포로 씁니다. `.gitignore`가 허용 목록 방식이라 `settings.json`, `projects/` 등 컴퓨터별 파일은 추적하지 않습니다.

```bash
cd ~/.claude
git init -b main
git remote add origin git@github.com:alchemine/dotclaude.git
git fetch origin
git reset origin/main          # 작업 트리는 그대로 두고 이력만 받음
git branch -u origin/main
git status                     # 리포와 다른 파일 확인
git checkout -- .              # 리포 내용으로 맞출 때만 실행
```

hook은 `settings.json`에 직접 등록해야 동작합니다.
