// PreToolUse hook(AskUserQuestion): /goal이 켜져 있으면 질문 창을 막는다(docs/workflow/goal.md "묻지 않기").
// goal 상태는 transcript의 마지막 goal_status 첨부로 판단한다. met이나 failed가 아니면 켜져 있다(Claude Code가 활성 goal을 찾는 방식과 같다).
// 입력이 잘못됐거나 transcript를 읽을 수 없으면 아무것도 하지 않고 끝낸다.
import { readFileSync } from 'node:fs'

const exitQuietly = () => process.exit(0)

let input
try {
  input = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  exitQuietly()
}
if (input?.hook_event_name !== 'PreToolUse' || input?.tool_name !== 'AskUserQuestion') exitQuietly()

let lines
try {
  lines = readFileSync(input.transcript_path, 'utf8').split('\n')
} catch {
  exitQuietly()
}

let active = false
for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i].includes('"goal_status"')) continue
  let attachment
  try {
    attachment = JSON.parse(lines[i]).attachment
  } catch {
    continue
  }
  if (attachment?.type !== 'goal_status') continue
  active = !attachment.met && !attachment.failed && typeof attachment.condition === 'string' && attachment.condition !== ''
  break
}
if (!active) exitQuietly()

const reason = '/goal이 켜져 있어 질문 창을 띄우지 않는다. ~/.claude/docs/workflow/goal.md "묻지 않기"대로 직접 정해 진행하고, 결정과 근거는 보고에 적는다.'
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }))
