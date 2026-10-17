#!/usr/bin/env node
// ~/.claude 지시사항(CLAUDE.md, docs/, commands/)의 기계 검사. docs/validate/validate.md의 R1~R12를 구현한다.
// 사용: node validate-rules.mjs [--root DIR] [--buckets] [--cases]
//   (없음)    R1~R12를 실행하고 결과를 출력한다. 문제가 하나라도 있으면 exit 1.
//   --buckets 행동별 규칙 묶음(S1 모순 검사용)을 출력한다.
//   --cases   docs/validate/cases.md에서 상황만 뽑아 출력한다(S3 판독자용).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const rootIdx = args.indexOf('--root')
const root = rootIdx >= 0 ? args[rootIdx + 1] : join(dirname(fileURLToPath(import.meta.url)), '..')
const LABELS = new Set(['필수', '금지', '권장'])
const CLAUDE_MD = 'CLAUDE.md'
const README = 'README.md'
const CASES = 'docs/validate/cases.md'
const README_DIRS = ['docs', 'commands', 'hooks', 'scripts']
// 같은 내용을 두 곳에 두는 것이 목적인 파일은 중복 검사(R7)에서 뺀다.
const DUP_EXCLUDE = new Set([README, 'docs/feedbacks/feedbacks.md', CASES])
// 리포 밖의 파일 이름은 존재 검사(R2)에서 뺀다.
const FILE_SKIP = new Set(['MEMORY.md'])
// 용어: [표준 표기, 변형을 찾는 정규식]. 코드와 따옴표 안은 보지 않는다.
const TERMS = [
  ['merge', /(?<![가-힣])머지/g],
  ['push', /푸시/g],
  ['커밋', /(?<![\w-])commit(?![\w-])/g],
  ['PR', /풀 ?리퀘스트|(?<![\w-])pull request/gi],
  ['릴리스', /릴리즈/g],
  ['질문 창', /질문창|팝업/g],
  ['서브에이전트', /(?<![\w-])sub-?agent|하위 에이전트/gi],
  ['worktree', /워크트리/g],
  ['Jira', /(?<![가-힣])지라(?![\w가-힣])/g],
  ['Notion', /노션/g],
  ['GitHub', /깃허브|(?<![\w./@-])[Gg]ithub(?![\w./-])/g],
]
// 행동별 묶음(--buckets): 같은 행동을 다루는 규칙을 모아 모순을 찾는다.
const BUCKETS = [
  ['질문 창', /질문 창|AskUserQuestion|물을 것|물어볼 것|묻지/],
  ['동의', /동의/],
  ['커밋', /커밋/],
  ['push', /push/],
  ['PR', /\bPR\b/],
  ['merge', /merge/],
  ['릴리스와 배포', /릴리스|배포/],
  ['삭제', /삭제|지울 것|지우/],
  ['메모리', /메모리/],
  ['서브에이전트', /서브에이전트/],
  ['멈추기와 보고', /멈추|멈춰|보고할|보고는|알릴 것|알리세요/],
  ['읽을 문서', /읽고 따를 것|읽으세요/],
  ['언어', /한국어|영어/],
  ['출처', /출처/],
]

const findings = new Map() // id -> [{file, line, msg}]
const CHECKS = {
  R1: '참조 해석(파일, 절, 번호, 표)',
  R2: '파일 존재',
  R3: 'README 표와 실제 파일',
  R4: 'em-dash',
  R5: '라벨 표기',
  R6: '번호 연속',
  R7: '중복 문장',
  R8: '용어 변형',
  R9: 'settings.json의 hook 파일',
  R10: 'command description과 README',
  R11: '읽히지 않는 문서',
  R12: '파일 안의 같은 제목',
}
for (const id of Object.keys(CHECKS)) findings.set(id, [])
const add = (id, file, line, msg) => {
  const rows = findings.get(id)
  if (!rows.some((r) => r.file === file && r.line === line && r.msg === msg)) rows.push({ file, line, msg })
}

function listFiles(dir, pred) {
  const out = []
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...listFiles(p, pred))
    else if (pred(p)) out.push(p)
  }
  return out.sort()
}

const ruleFiles = [
  join(root, CLAUDE_MD),
  ...listFiles(join(root, 'docs'), (p) => p.endsWith('.md')),
  ...listFiles(join(root, 'commands'), (p) => p.endsWith('.md')),
].filter(existsSync)

// 파일 구조 파싱: 제목, 번호 항목, 표 번호. 코드 블록 안은 본문으로 보지 않는다.
function parse(path) {
  const rel = relative(root, path)
  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  const headings = [] // {level, text, line}
  const items = [] // {num, line, heading, text}
  const subs = [] // {line, heading, text}  (들여쓴 - 항목)
  const tables = new Set()
  const prose = [] // 코드 블록 밖의 줄 {line, text}
  let inCode = false
  let inFront = false
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i]
    if (i === 0 && t === '---') { inFront = true; continue }
    if (inFront) { if (t === '---') inFront = false; continue }
    if (/^\s*```/.test(t)) { inCode = !inCode; continue }
    if (inCode) continue
    prose.push({ line: i + 1, text: t })
    const h = /^(#{1,6})\s+(.+?)\s*$/.exec(t)
    if (h) { headings.push({ level: h[1].length, text: h[2], line: i + 1 }); continue }
    const tb = /^Table (\d+)\./.exec(t)
    if (tb) { tables.add(Number(tb[1])); continue }
    const heading = headings.length ? headings[headings.length - 1].text : ''
    const it = /^(\d+)\.\s+(.*)$/.exec(t)
    if (it) { items.push({ num: Number(it[1]), line: i + 1, heading, text: it[2] }); continue }
    const sb = /^\s*-\s+(.*)$/.exec(t)
    if (sb && !/^\s*-\s*\[/.test(t)) subs.push({ line: i + 1, heading, text: sb[1] }) // 체크리스트(- [ ])는 제외
  }
  return { path, rel, lines, headings, items, subs, tables, prose }
}
const docs = ruleFiles.map(parse)
const byRel = new Map(docs.map((d) => [d.rel, d]))
const byBase = new Map()
for (const d of docs) byBase.set(basename(d.rel), [...(byBase.get(basename(d.rel)) ?? []), d])

const range = (a, b) => { const out = []; for (let n = Number(a); n <= Number(b ?? a); n++) out.push(n); return out }
const stripCode = (s) => s.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length))
const stripQuotes = (s) => s.replace(/"[^"]*"/g, (m) => ' '.repeat(m.length))
const hasHeading = (d, text) => d.headings.some((h) => h.text === text)
const itemsUnder = (d, text) => new Set(d.items.filter((it) => it.heading === text).map((it) => it.num))
// 파일 참조를 문서로 바꾼다. 같은 이름이 둘이면 절 제목이 있는 쪽을 고른다. 못 찾으면 null, 둘 이상이면 후보 목록.
function resolveFile(ref, section) {
  const r = ref.replace(/^~\/\.claude\//, '')
  if (r.includes('/')) return byRel.get(r) ?? null
  let cands = byBase.get(r) ?? []
  if (cands.length > 1 && section) cands = cands.filter((d) => hasHeading(d, section))
  return cands.length === 1 ? cands[0] : cands.length === 0 ? null : cands
}
function fileOrReport(id, d, line, ref, section) {
  const t = resolveFile(ref, section)
  if (!t) add(id, d.rel, line, `파일 ${ref}이 없다`)
  else if (Array.isArray(t)) add(id, d.rel, line, `${ref}이 둘 이상(${t.map((x) => x.rel).join(', ')})이라 하나로 정할 수 없다`)
  return t && !Array.isArray(t) ? t : null
}
// 파일을 적지 않은 절 참조: 현재 파일, 없으면 모든 파일에서 유일한 제목.
function resolveSection(cur, text) {
  if (hasHeading(cur, text)) return cur
  const owners = docs.filter((d) => hasHeading(d, text))
  return owners.length === 1 ? owners[0] : null
}
function checkItems(id, file, line, target, heading, nums, label) {
  const have = itemsUnder(target, heading)
  for (const n of nums) if (!have.has(n)) add(id, file, line, `${label} "${heading}" ${n}번이 ${target.rel}에 없다`)
}
// R1, R2
const NUM_TAIL_REQ = '((?:\\s*\\d+(?:~\\d+)?번(?:\\([^)]*\\))?)(?:(?:과|,|·)\\s*\\d+(?:~\\d+)?번(?:\\([^)]*\\))?)*)'
const NUM_TAIL = NUM_TAIL_REQ + '?'
const nums = (tail) => [...(tail ?? '').replace(/\([^)]*\)/g, '').matchAll(/(\d+)(?:~(\d+))?번/g)].flatMap((m) => range(m[1], m[2]))
const SECTION_REF = new RegExp('`((?:~\\/\\.claude\\/)?[\\w./-]+\\.md)`(?:의|에서|에)?\\s*"([^"]+)"(?:\\s*절)?' + NUM_TAIL, 'g')
const TABLE_REF = /`((?:~\/\.claude\/)?[\w./-]+\.md)`(?:의)?\s*(Table|Figure)\s*(\d+)/g
const LATIN_REF = /`((?:~\/\.claude\/)?[\w./-]+\.md)`(?:의)?\s*([A-Za-z][A-Za-z ]*?)\s*(\d+)번/g
const LOCAL_SECTION_REF = new RegExp('"([^"]+)"(?:\\s*절)?' + NUM_TAIL_REQ, 'g')
const LOCAL_SECTION_ONLY = /"([^"]+)"\s*절/g
const LOCAL_TABLE_REF = /(Table|Figure)\s*(\d+)/g
const LOCAL_LATIN_REF = /(?<![\w"`/.-])([A-Za-z][A-Za-z ]*?)\s+(\d+)번/g
const BARE_NUM_REF = /(?<![\w"~.\-/#v])(\d+)(?:~(\d+))?번(?!\s*(?:이하|이상|넘|반복|실행|돌|시도))/g // 횟수(5번 이하 등)는 참조가 아니다
const PATH_REF = /`((?:~\/\.claude\/)?(?:docs|commands|hooks|scripts)\/[^`\s]+|[\w.-]+\.(?:md|mjs|sh))`/g

for (const d of docs) {
  for (const { line, text } of d.prose) {
    let rest = text
    const blank = (m) => { rest = rest.replace(m, ' '.repeat(m.length)); return '' }
    const lineSections = [] // 이 줄에서 가리킨 절. 번호만 있는 참조는 여기부터 찾는다.
    for (const m of text.matchAll(SECTION_REF)) {
      blank(m[0])
      const target = fileOrReport('R2', d, line, m[1], m[2])
      if (!target) continue
      if (!hasHeading(target, m[2])) { add('R1', d.rel, line, `절 "${m[2]}"이 ${target.rel}에 없다`); continue }
      lineSections.push([target, m[2]])
      checkItems('R1', d.rel, line, target, m[2], nums(m[3]), '항목')
    }
    for (const m of text.matchAll(TABLE_REF)) {
      blank(m[0])
      const target = fileOrReport('R2', d, line, m[1])
      if (!target) continue
      if (m[2] === 'Table' && !target.tables.has(Number(m[3]))) add('R1', d.rel, line, `Table ${m[3]}이 ${target.rel}에 없다`)
    }
    for (const m of text.matchAll(LATIN_REF)) {
      blank(m[0])
      const sec = m[2].trim()
      const target = fileOrReport('R2', d, line, m[1], sec)
      if (!target) continue
      if (!hasHeading(target, sec)) { add('R1', d.rel, line, `절 "${sec}"이 ${target.rel}에 없다`); continue }
      checkItems('R1', d.rel, line, target, sec, [Number(m[3])], '항목')
    }
    const afterFileRefs = rest
    for (const m of afterFileRefs.matchAll(LOCAL_SECTION_REF)) {
      blank(m[0])
      const target = resolveSection(d, m[1])
      if (!target) { add('R1', d.rel, line, `절 "${m[1]}"을 이 파일이나 다른 파일에서 하나로 찾을 수 없다`); continue }
      lineSections.push([target, m[1]])
      checkItems('R1', d.rel, line, target, m[1], nums(m[2]), '항목')
    }
    for (const m of rest.matchAll(/"([^"]+)"/g)) { // 번호 없이 이름만 적은 절도 기준이 된다
      const target = resolveSection(d, m[1])
      if (target) lineSections.push([target, m[1]])
    }
    for (const m of rest.matchAll(LOCAL_SECTION_ONLY)) {
      blank(m[0])
      if (!resolveSection(d, m[1])) add('R1', d.rel, line, `절 "${m[1]}"을 이 파일이나 다른 파일에서 하나로 찾을 수 없다`)
    }
    const noCode = stripCode(rest)
    for (const m of noCode.matchAll(LOCAL_TABLE_REF)) {
      if (m[1] !== 'Table') continue
      const n = Number(m[2])
      if (!d.tables.has(n) && !lineSections.some(([t]) => t.tables.has(n))) add('R1', d.rel, line, `Table ${m[2]}이 이 파일과 이 줄이 가리킨 파일에 없다`)
    }
    let noTables = noCode.replace(LOCAL_TABLE_REF, (m) => ' '.repeat(m.length))
    for (const m of noTables.matchAll(LOCAL_LATIN_REF)) {
      const sec = m[1].trim()
      const target = hasHeading(d, sec) ? d : hasHeading(byRel.get(CLAUDE_MD), sec) ? byRel.get(CLAUDE_MD) : null
      if (!target) { add('R1', d.rel, line, `절 "${sec}"이 이 파일과 CLAUDE.md에 없다`); continue }
      checkItems('R1', d.rel, line, target, sec, [Number(m[2])], '항목')
    }
    noTables = noTables.replace(LOCAL_LATIN_REF, (m) => ' '.repeat(m.length))
    const sectionHere = [...d.headings].reverse().find((h) => h.line < line)?.text ?? ''
    for (const m of noTables.matchAll(BARE_NUM_REF)) {
      const wanted = range(m[1], m[2])
      const found = [...lineSections, [d, sectionHere]].some(([t, h]) => wanted.every((n) => itemsUnder(t, h).has(n)))
      if (!found) add('R1', d.rel, line, `${wanted.join('~')}번이 이 줄이 가리킨 절("${[...lineSections.map(([, h]) => h), sectionHere].join('", "')}")에 없다`)
    }
    for (const m of text.matchAll(PATH_REF)) {
      const ref = m[1]
      if (/[${}<>*]/.test(ref) || ref.includes('NNNN')) continue
      const r = ref.replace(/^~\/\.claude\//, '')
      if (FILE_SKIP.has(basename(r))) continue
      if (r.includes('/')) {
        const sub = r.split('/').slice(0, 2).join('/')
        if (r.startsWith('docs/') && !existsSync(join(root, sub))) continue // 프로젝트 쪽 경로(docs/issue 등)
        if (!existsSync(join(root, r))) add('R2', d.rel, line, `파일 ${ref}이 없다`)
      } else if (!(byBase.get(r)?.length) && !existsSync(join(root, r))) add('R2', d.rel, line, `파일 ${ref}이 없다`)
    }
  }
}

// R3, R10: README 표
const readmePath = join(root, README)
const readmeRows = new Map() // path -> desc
if (existsSync(readmePath)) {
  for (const t of readFileSync(readmePath, 'utf8').split(/\r?\n/)) {
    const m = /^\|\s*`([^`]+)`\s*\|\s*(.*?)\s*\|\s*$/.exec(t)
    if (m) readmeRows.set(m[1], m[2])
  }
  const actual = new Set([CLAUDE_MD, '.gitignore'])
  for (const dir of README_DIRS) for (const p of listFiles(join(root, dir), () => true)) actual.add(relative(root, p))
  for (const p of actual) if (!readmeRows.has(p)) add('R3', README, 0, `${p}의 행이 없다`)
  for (const p of readmeRows.keys()) if (!actual.has(p)) add('R3', README, 0, `${p}은 표에 있지만 파일이 없다`)
  for (const d of docs.filter((x) => x.rel.startsWith('commands/'))) {
    const fm = /^---\n([\s\S]*?)\n---/.exec(readFileSync(d.path, 'utf8'))
    const desc = /^description:\s*(.*)$/m.exec(fm?.[1] ?? '')?.[1]?.trim()
    if (!desc) { add('R10', d.rel, 1, 'frontmatter에 description이 없다'); continue }
    const row = readmeRows.get(d.rel)
    if (row === undefined) continue
    const expect = `\`/${basename(d.rel, '.md')}\`: ${desc}`
    if (row !== expect) add('R10', README, 0, `${d.rel}의 설명이 description과 다르다`)
  }
} else add('R3', README, 0, 'README.md가 없다')

// R4, R5, R8, R12
for (const d of docs) {
  for (const { line, text } of d.prose) {
    if (text.includes('—') && !text.includes('em-dash(—)')) add('R4', d.rel, line, 'em-dash(—)가 있다') // 용어를 정의한 줄은 제외
    for (const m of text.matchAll(/`\[([가-힣]+)\]`/g)) if (!LABELS.has(m[1])) add('R5', d.rel, line, `라벨 [${m[1]}]은 필수, 금지, 권장이 아니다`)
    if (/^#/.test(text)) continue // 제목은 영어로 쓴다
    const plain = stripQuotes(stripCode(text))
    for (const [canon, re] of TERMS) for (const m of plain.matchAll(re)) add('R8', d.rel, line, `"${m[0]}" 대신 "${canon}"`)
  }
  const seen = new Map()
  for (const h of d.headings) {
    if (seen.has(h.text)) add('R12', d.rel, h.line, `제목 "${h.text}"이 ${seen.get(h.text)}행에도 있다`)
    else seen.set(h.text, h.line)
  }
}

// R6: 절 안에서 번호가 1씩 늘어야 한다. 앞 절에서 이어 매기는 것은 허용한다.
for (const d of docs) {
  let prevEnd = 0
  let block = null
  for (const it of d.items) {
    if (!block || block.heading !== it.heading) {
      if (block) prevEnd = block.last
      block = { heading: it.heading, last: null }
      if (it.num !== 1 && it.num !== prevEnd + 1) add('R6', d.rel, it.line, `"${it.heading}" 절의 번호가 ${it.num}부터 시작한다`)
    } else if (it.num !== block.last + 1) add('R6', d.rel, it.line, `"${it.heading}" 절의 번호가 ${block.last} 다음에 ${it.num}이다`)
    block.last = it.num
  }
}

// R7: 다른 파일의 거의 같은 문장
const norm = (s) => s.replace(/`\[[^\]]*\]`\s*/, '').replace(/[^\p{L}\p{N}]/gu, '')
const grams = (s) => { const g = new Set(); for (let i = 0; i + 3 <= s.length; i++) g.add(s.slice(i, i + 3)); return g }
const sentences = []
for (const d of docs) {
  if (DUP_EXCLUDE.has(d.rel)) continue
  for (const x of [...d.items, ...d.subs]) {
    for (const piece of x.text.split(/(?<=\.)\s+/)) {
      const n = norm(piece)
      if (n.length >= 25) sentences.push({ file: d.rel, line: x.line, n, g: grams(n) })
    }
  }
}
for (let i = 0; i < sentences.length; i++) {
  for (let j = i + 1; j < sentences.length; j++) {
    const a = sentences[i], b = sentences[j]
    if (a.file === b.file) continue
    if (a.file.startsWith('commands/') && b.file.startsWith('commands/')) continue // command끼리의 공통 문구는 허용
    if (Math.abs(a.n.length - b.n.length) > Math.max(a.n.length, b.n.length) * 0.3) continue
    let inter = 0
    for (const g of a.g) if (b.g.has(g)) inter++
    const jac = inter / (a.g.size + b.g.size - inter)
    if (jac >= 0.8) add('R7', a.file, a.line, `${b.file}:${b.line}과 거의 같은 문장(유사도 ${jac.toFixed(2)})`)
  }
}

// R9: settings.json의 hook 명령이 가리키는 파일
const settingsPath = join(root, 'settings.json')
if (existsSync(settingsPath)) {
  let settings
  try { settings = JSON.parse(readFileSync(settingsPath, 'utf8')) } catch { add('R9', 'settings.json', 0, 'JSON을 읽을 수 없다') }
  for (const entries of Object.values(settings?.hooks ?? {})) for (const e of entries) for (const h of e.hooks ?? []) {
    const m = /~\/\.claude\/(\S+)/.exec(h.command ?? '')
    if (m && !existsSync(join(root, m[1]))) add('R9', 'settings.json', 0, `hook 파일 ${m[1]}이 없다`)
  }
}

// R11: CLAUDE.md, 다른 문서, command 어디에서도 가리키지 않는 docs/ 문서
const allText = docs.map((d) => ({ rel: d.rel, text: d.prose.map((p) => p.text).join('\n') }))
for (const d of docs) {
  if (!d.rel.startsWith('docs/')) continue
  const base = basename(d.rel)
  const referenced = allText.some((o) => o.rel !== d.rel && (o.text.includes(d.rel) || o.text.includes('`' + base + '`')))
  if (!referenced) add('R11', d.rel, 1, '어느 규칙 파일도 이 문서를 가리키지 않는다')
}

// --buckets, --cases
if (args.includes('--buckets')) {
  for (const [name, re] of BUCKETS) {
    const rows = []
    for (const d of docs) for (const it of [...d.items, ...d.subs].sort((a, b) => a.line - b.line)) if (re.test(it.text)) rows.push(`  ${d.rel}:${it.line}  ${it.text}`)
    console.log(`== ${name} (${rows.length})`)
    for (const r of rows) console.log(r)
  }
  process.exit(0)
}
if (args.includes('--cases')) {
  const casesPath = join(root, CASES)
  if (!existsSync(casesPath)) { console.error(`${CASES}가 없다`); process.exit(2) }
  let id = null
  for (const t of readFileSync(casesPath, 'utf8').split(/\r?\n/)) {
    const h = /^### (C\d+)\.\s*(.+)$/.exec(t)
    if (h) { id = h[1]; console.log(`${h[1]}. ${h[2]}`); continue }
    const s = /^- 상황:\s*(.*)$/.exec(t)
    if (s && id) console.log(`  상황: ${s[1]}`)
  }
  process.exit(0)
}

// 출력
let total = 0
for (const [id, name] of Object.entries(CHECKS)) {
  const rows = findings.get(id)
  total += rows.length
  console.log(`== ${id} ${name}: ${rows.length ? `${rows.length}건` : '이상 없음'}`)
  for (const r of rows) console.log(`  ${r.file}${r.line ? ':' + r.line : ''}  ${r.msg}`)
}
console.log(`\n검사 ${Object.keys(CHECKS).length}개, 문제 ${total}건`)
process.exit(total ? 1 : 0)
