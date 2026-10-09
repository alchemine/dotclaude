// UserPromptSubmit, PreToolUse hook: docs/feedbacks/feedbacks.md의 확인 항목을 Claude가 읽는 컨텍스트로 붙인다.
// PreToolUse에서 질문 창(AskUserQuestion)에 미리보기가 하나도 없으면 feedbacks.md와 상관없이 질문 창을 막는다.
// 인자로 절 제목을 주면 그 절만 붙인다. e.g. node feedbacks-reminder.mjs "질문 창을 띄우기 전"
// 입력이 잘못됐거나 문서나 항목이 없으면 아무것도 붙이지 않고 끝낸다.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const exitQuietly = () => process.exit(0)

let input
try {
  input = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  exitQuietly()
}
const event = input?.hook_event_name
if (!event) exitQuietly()

// 질문 창에 미리보기가 하나도 없으면 띄우기 전에 막는다. feedbacks.md의 절과 상관없이 검사한다.
// 질문 창이 뜨면 앞선 답변이 화면에서 접혀, 미리보기가 없으면 사용자는 근거를 볼 수 없다.
const questions = input?.tool_input?.questions
if (event === 'PreToolUse' && Array.isArray(questions)) {
  const hasPreview = questions.some(q => (q.options ?? []).some(o => typeof o.preview === 'string' && o.preview.trim() !== ''))
  if (!hasPreview) {
    const reason = '질문 창에 미리보기(preview)가 없다. 결정에 필요한 대상, 값, 근거를 선택지 미리보기에 넣어 다시 띄운다(~/.claude/docs/workflow/consent.md 동의 질문 1~2번).'
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, permissionDecision: 'deny', permissionDecisionReason: reason } }))
    process.exit(0)
  }
}

const doc = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'feedbacks', 'feedbacks.md')
let lines
try {
  lines = readFileSync(doc, 'utf8').split(/\r?\n/)
} catch {
  exitQuietly()
}

// 절 제목(## )과 그 아래 번호 항목의 첫 줄만 뽑는다. 실수 사례와 규칙 줄(들여쓴 하위 항목)은 뺀다.
const want = process.argv[2] ?? ''
const out = []
const intro = []
let keep = false
let inIntro = true
for (const line of lines) {
  // 제목(# )과 첫 절 사이의 글을 안내문으로 쓴다.
  if (inIntro && !line.startsWith('## ')) {
    if (line.trim() !== '' && !line.startsWith('# ')) intro.push(line.trim())
    continue
  }
  inIntro = false
  if (line.startsWith('## ')) {
    const title = line.slice(3).trim()
    keep = want === '' || title === want
    if (keep) out.push('', `[${title}]`)
  } else if (keep && /^\d+\. /.test(line)) {
    out.push(line.replace(/`\[[^\]]*\]` /, ''))
  }
}
if (!out.some(l => /^\d+\. /.test(l))) exitQuietly()

const text = intro.join(' ') + '(출처: ~/.claude/docs/feedbacks/feedbacks.md)\n' + out.join('\n')
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }))
