# dotclaude

Claude Code의 전역 설정(`~/.claude`)을 보관하는 저장소입니다.

## 구성

| 경로 | 내용 |
|---|---|
| `CLAUDE.md` | 모든 프로젝트에 적용되는 전역 지침 |
| `commands/discuss.md` | `/discuss`: 읽기만 허용하고 변경 작업을 금지하는 토론 모드 |
| `commands/verbose.md` | `/verbose`: 이번 답변에 한해 길이 제약 없이 자세히 설명하는 상세 모드 |
| `commands/local.md` | `/local`: worktree를 만들지 않고 현재 리포에서 직접 개발 |
| `commands/debrief.md` | `/debrief`: 세션을 되짚어 배운 것과 남은 일을 메모리와 CLAUDE.md에 기록 |
| `commands/reflect.md` | `/reflect`: 사용자가 지적한 문제의 원인을 되짚어 CLAUDE.md, skill, command를 고침 |
| `commands/update-dotclaude.md` | `/update-dotclaude`: ~/.claude의 CLAUDE.md, commands, skills, hooks를 dotclaude 리포에 덮어쓰고 PR을 merge |
| `hooks/validate-hard-rules.sh` | 마지막 답변에 em-dash가 있으면 고치게 하는 Stop hook (`settings.json`의 `hooks.Stop`에 등록해야 동작) |

## 설치

```bash
git clone git@github.com:alchemine/dotclaude.git
mkdir -p ~/.claude/commands ~/.claude/hooks
cp dotclaude/CLAUDE.md ~/.claude/CLAUDE.md
cp dotclaude/commands/*.md ~/.claude/commands/
cp dotclaude/hooks/*.sh ~/.claude/hooks/
```
