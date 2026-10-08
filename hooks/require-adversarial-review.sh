#!/usr/bin/env bash
# Stop hook: 이번 턴에 적대적 리뷰(Agent 호출, description이 "적대적 리뷰"로 시작)를 거치지 않았으면 다시 답하게 함.
#
# 참고용으로만 둔다. settings.json에 등록하지 않는다.
# 답변마다 리뷰를 돌리니 시간이 오래 걸리고 효과가 작아 쓰지 않음(2026-10-08).
# 아래는 이 hook과 함께 CLAUDE.md Workflow-14에 있던 규칙의 원문이다.
#
# 14. `[필수]` 사용자에게 보내는 답변 글(질문 창 앞의 설명 포함)은 초안을 먼저 만들고, sonnet 서브에이전트 하나에 적대적 리뷰를 맡긴 뒤 그 결과를 반영해 쓸 것.
#     - `Agent` 호출의 `description`은 "적대적 리뷰"로 시작할 것.
#     - 초안은 `Agent` 호출의 `prompt`에만 쓰고, 답변 글로 내보내지 말 것.
#     - 서브에이전트에는 아래만 줄 것.
#        - 사용자의 질문과 초안
#        - 지켜야 할 지침: `~/.claude/CLAUDE.md`, git 작업이면 `~/.claude/docs/git/git.md`, 프로젝트 지침과 메모리
#        - 근거를 찾을 위치: transcript 경로, 관련 파일
#     - 서브에이전트는 아래 두 가지를 비판적으로 평가할 것.
#        - 지침 준수: 초안과 이번 턴의 작업이 지침을 빠뜨리거나 미흡하게 지킨 곳이 없는지
#        - 주장 검증: 사실 주장은 근거를, 판단 주장은 근거와 추론과 반례를 확인할 것
#           - 사실 주장은 코드, 동작, 원인, 상태가 어떻다고 말하는 것이고, 판단 주장은 추천과 평가다.
#           - 완료 보고, 되묻기, 수락, 할 일만 적은 계획은 주장이 아니다.
#     - 서브에이전트는 구체적으로 짚을 수 있는 문제만 지적하고, 막연한 개선 제안은 하지 않을 것.
#     - 서브에이전트는 결과를 JSON 배열 하나로만 돌려줄 것.
#        - 배열 밖에는 출처를 포함해 아무것도 쓰지 말 것.
#        - 형식: `[{"issue": "...", "position": "...", "severity": 7}]`
#        - `issue`: 규칙 번호(e.g. `Writing-2`)나 문제 이름(e.g. 근거 없음, 논증 비약)을 20자 이내로 쓸 것
#        - `position`: 초안에서 문제가 된 곳(20자 이내)
#        - `severity`: 1~10 정수
#           - 9~10: 답이 틀렸거나 피해가 생기는 문제
#           - 5~8: 근거가 부족하거나 논리가 비약하는 문제
#           - 1~4: 표현과 서식 문제
#        - `severity`가 높은 순으로 정렬하고, 문제가 없으면 `[]`를 돌려줄 것.
#     - `severity` 5 이상인 지적은 반드시 반영하고, 4 이하인 지적은 판단해서 반영할 것.
#     - 결과가 `[]`이면 초안을 그대로 답변으로 쓸 것.
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
  jq -n '{decision: "block", reason: "이번 턴에 적대적 리뷰를 거치지 않았습니다. 위 주석의 규칙대로 답변 초안을 sonnet 서브에이전트에 맡기고, 그 결과를 반영해 답변을 다시 쓰세요."}'
fi
exit 0
