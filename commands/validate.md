---
description: ~/.claude 지시사항(CLAUDE.md, docs, commands)의 모순, 모호한 표현, 깨진 참조를 고정 절차로 검사
---

`~/.claude`의 지시사항을 `~/.claude/docs/validate/validate.md`의 절차대로 검사하고 보고하세요.

# 동작 방식
1. 먼저 `~/.claude/docs/validate/validate.md`를 읽으세요.
2. 그 문서의 "절차"를 순서대로 모두 수행하세요. 검사를 건너뛰거나 순서를 바꾸지 마세요.
   - "대상"에 scratchpad 사본 경로가 있으면 그 사본을 검사하세요.
3. 서브에이전트(검토, 판독자)의 수와 모델은 `~/.claude/docs/workflow/subagents.md`대로 하고, 보고에 적으세요.
4. "보고 형식"대로 보고하세요. 문제가 없는 검사도 "이상 없음"으로 적으세요.
5. 파일을 고치는 것은 보고 뒤에 `~/.claude/docs/workflow/consent.md`의 단위로 동의를 받고 하세요.

# 금지
- 검사 결과를 보기 전에 고칠 안을 정하지 마세요.
- 지시사항이 아닌 파일(메모리, 프로젝트 코드)은 검사하지 마세요.

# 대상
$ARGUMENTS
