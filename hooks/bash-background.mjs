// PreToolUse hook(Bash): run_in_background가 true가 아닌 Bash 호출은 모두 막는다.
// 막힌 호출은 같은 명령을 run_in_background: true로 다시 부르게 한다.
// 입력을 읽을 수 없으면 아무것도 하지 않고 끝낸다.
import { readFileSync } from 'node:fs'

const exitQuietly = () => process.exit(0)

let input
try {
  input = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  exitQuietly()
}
if (input?.hook_event_name !== 'PreToolUse' || input?.tool_name !== 'Bash') exitQuietly()
if (input?.tool_input?.run_in_background === true) exitQuietly()

const reason = 'Bash는 모두 백그라운드로 실행한다. 같은 명령을 run_in_background: true로 다시 부르고, 기다리는 동안 의존하지 않는 작업을 계속한다.'
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }))
