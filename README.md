# dotclaude

Claude Code의 전역 설정(`~/.claude`)을 보관하는 저장소입니다.

## 구성

| 경로 | 내용 |
|---|---|
| `CLAUDE.md` | 모든 프로젝트에 적용되는 전역 지침 |
| `commands/discuss.md` | `/discuss`: 읽기만 허용하고 변경 작업을 금지하는 토론 모드 |
| `commands/verbose.md` | `/verbose`: 이번 답변에 한해 길이 제약 없이 자세히 설명하는 상세 모드 |

## 설치

```bash
git clone git@github.com:alchemine/dotclaude.git
mkdir -p ~/.claude/commands
cp dotclaude/CLAUDE.md ~/.claude/CLAUDE.md
cp dotclaude/commands/*.md ~/.claude/commands/
```
