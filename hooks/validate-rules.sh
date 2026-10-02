#!/usr/bin/env bash
# Stop hook: ~/.claude/CLAUDE.md 의 [hook-checked] 룰을 마지막 답변에 대해 기계 검사.
# 위반 시 exit 2 + stderr 메시지 -> Claude Code가 모델에 피드백을 주입해 답변을 고치게 함.
set -u

input=$(cat)

# Stop hook 피드백으로 재실행된 턴에서는 다시 블록하지 않음 (무한 루프 방지)
if [ "$(echo "$input" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

transcript=$(echo "$input" | jq -r '.transcript_path // empty')
[ -f "$transcript" ] || exit 0

# 마지막 assistant 메시지의 텍스트 블록을 전부 추출
last_text=$(jq -rs '
  [ .[] | select(.type == "assistant") ] | last
  | .message.content // []
  | map(select(.type == "text") | .text)
  | join("\n")
' "$transcript" 2>/dev/null)

[ -n "$last_text" ] || exit 0

violations=()

check_em_dash() {
  if printf '%s' "$last_text" | grep -q '—'; then
    violations+=("em-dash(—) 사용 금지: 문장을 끊어서 두 문장으로 다시 쓰세요.")
  fi
}

# 새 [hook-checked] 룰은 함수를 추가하고 아래에서 호출
check_em_dash

if [ "${#violations[@]}" -gt 0 ]; then
  {
    echo "룰 위반이 감지되었습니다 (~/.claude/CLAUDE.md). 답변을 수정하세요:"
    for v in "${violations[@]}"; do
      echo "- $v"
    done
  } >&2
  exit 2
fi

exit 0
