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
| `commands/discuss.md` | `/discuss`: 읽기만 허용하고 수정, 커밋, 푸시 등 일체의 변경 작업을 금지하는 토론 모드 |
| `commands/task.md` | `/task`: worktree를 만들지 않고 현재 리포에서 Git workflow대로 작업 |
| `commands/task-worktree.md` | `/task-worktree`: worktree를 만들어 Git workflow대로 작업 |
| `commands/debrief.md` | `/debrief`: 세션을 되짚어 배운 것과 남은 일을 메모리와 CLAUDE.md에 기록 |
| `commands/reflect.md` | `/reflect`: 사용자가 지적한 문제의 원인을 되짚어 CLAUDE.md, skill, command를 고침 |
| `commands/merge-dotclaude.md` | `/merge-dotclaude`: ~/.claude의 내용(CLAUDE.md, docs, commands, hooks)을 dotclaude 리포에 PR로 올리고 merge |
| `hooks/validate-hard-rules.sh` | 마지막 답변에 em-dash가 있으면 고치게 하는 Stop hook (`settings.json`의 `hooks.Stop`에 등록해야 동작) |
| `hooks/require-adversarial-review.sh` | 답변이 적대적 리뷰를 거치지 않았으면 다시 답하게 하는 Stop hook (참고용, 등록하지 않음) |

## 설치

```bash
git clone git@github.com:alchemine/dotclaude.git
mkdir -p ~/.claude/commands ~/.claude/hooks ~/.claude/docs
cp dotclaude/CLAUDE.md ~/.claude/
cp -r dotclaude/docs/. ~/.claude/docs/
cp dotclaude/commands/*.md ~/.claude/commands/
cp dotclaude/hooks/*.sh ~/.claude/hooks/
```
