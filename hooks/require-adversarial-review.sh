#!/usr/bin/env bash
# Stop hook: 이번 턴에 적대적 리뷰(Agent 호출, description이 "적대적 리뷰"로 시작)를 거치지 않았으면 다시 답하게 함.
set -u

input=$(cat)

# Stop hook 피드백으로 재실행된 턴에서는 다시 블록하지 않음 (무한 루프 방지)
if [ "$(echo "$input" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

transcript=$(echo "$input" | jq -r '.transcript_path // empty')
answer=$(echo "$input" | jq -r '.last_assistant_message // empty')
[ -f "$transcript" ] && [ -n "$answer" ] || exit 0

# 이번 턴(마지막 사용자 입력 이후)에 "적대적 리뷰" Agent 호출이 있으면 통과
# 사용자 입력은 origin.kind == "human"인 항목만 본다 (작업 알림, 훅 피드백 제외)
reviewed=$(jq -rs '
  (map(.type == "user" and .origin.kind? == "human") | rindex(true)) as $start
  | .[($start // 0):]
  | map(select(.type == "assistant") | .message.content[]?
        | select(.type == "tool_use" and .name == "Agent"
                 and ((.input.description // "") | startswith("적대적 리뷰"))))
  | length
' "$transcript" 2>/dev/null)

if [ "${reviewed:-0}" -eq 0 ]; then
  jq -n '{decision: "block", reason: "이번 턴에 적대적 리뷰를 거치지 않았습니다. CLAUDE.md Workflow 14번대로 답변 초안을 sonnet 서브에이전트에 맡기고, 그 결과를 반영해 답변을 다시 쓰세요."}'
fi
exit 0
