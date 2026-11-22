# dotclaude

Claude Code의 전역 설정(`~/.claude`)을 보관하는 저장소입니다.

## 구성

| 경로 | 내용 |
|---|---|
| `CLAUDE.md` | 모든 프로젝트에 적용되는 전역 지침 |
| `docs/git/git.md` | git 작업과 배포 때 읽는 Git 규칙(브랜치, 작업 절차, 배포) |
| `docs/architecture/architecture.md` | 새 서비스나 프로덕트의 구조를 잡을 때 읽는 설계 지침 |
| `docs/architecture/backend.md` | API와 백엔드 구성(계층, DB, 캐시, 에러, 인증, 백그라운드 작업)을 정할 때 읽는 지침 |
| `docs/architecture/deployment.md` | 배포 방식, Docker, CI/CD, 헬스 체크, 환경 설정, 롤백을 정할 때 읽는 지침 |
| `docs/documentation/documentation.md` | 문서 파일, Notion 페이지, 사람이 보는 화면의 글을 쓰거나 고칠 때 읽는 지침(캡션, 문서에 적을 말) |
| `docs/testing/testing.md` | 이슈를 재현하거나 수정을 검증하는 테스트 코드를 쓸 때 읽는 지침(파일 구성, 시나리오 설명, 예제 구성, 대표 예제, 흔들림 측정) |
| `docs/experiments/experiments.md` | 코드, 프롬프트, 파라미터를 바꿔 결과를 비교할 때 읽는 지침(재현, 비교, 경계 정하기) |
| `docs/evaluation/evaluation.md` | LLM에게 결과물에 점수를 매기게 하거나 두 결과물 중 나은 쪽을 고르게 할 때 읽는 지침(점수 기준, 편향 거르기) |
| `docs/profile/profile.md` | 느려짐, 메모리 증가, 간헐적 멈춤 같은 성능 문제를 진단하고 고칠 때 읽는 지침(재기, 루프 갖추기, 프로브 설계, 원인 고치기, 검증과 보고) |
| `docs/workflow/consent.md` | 파일 수정, 환경 변경, git 작업, 삭제, 외부 전송 전에 동의를 받는 절차 |
| `docs/workflow/subagents.md` | 서브에이전트의 수와 모델, 서버 부하 호출의 동시 요청 수, 부하 배치의 안정 범위와 감시를 정하는 규칙 |
| `docs/workflow/decision.md` | 비교나 추천을 할 때 평가 기준을 세우고 결론을 내는 절차 |
| `docs/workflow/visual-check.md` | 사람이 눈으로 보는 결과물을 만들거나 고칠 때 보이는 모습을 확인하는 절차 |
| `docs/workflow/pm.md` | `/pm`으로 PM 모드에 들어갔을 때 읽는 지침 |
| `docs/workflow/goal.md` | `/goal`로 목표를 받았을 때 묻지 않고 끝까지 진행하는 지침 |
| `docs/feedbacks/feedbacks.md` | `CLAUDE.md`에 있지만 자주 놓친 항목(답변과 행동 전에 확인) |
| `docs/principles/principles.md` | 여러 방법 중 하나를 고를 때 따르는 선택 기준(원칙의 형식, 사례 기록, 원칙 갱신, 원칙) |
| `docs/principles/cases/` | 사용자가 선택을 바로잡은 사례(상황, rejected, chosen). 파일마다 사례 하나 |
| `docs/validate/validate.md` | `/validate`로 지시사항을 검사할 때 읽는 지침(문제의 종류, 절차, 모호 패턴, 기계 검사, 사례 판정, 보고 형식) |
| `docs/validate/cases.md` | 사례 판독에 쓰는 상황, 기대, 근거 목록 |
| `commands/auto.md` | `/auto`: PM 모드에서 동의 없이 티켓을 만들고 처리해 -auto 릴리스 브랜치에 쌓는 자동 모드 |
| `commands/pm.md` | `/pm`: Claude가 티켓을 만들고 처리하고 보고하며 사용자는 통과 여부와 릴리스 범위만 정하는 PM 모드 |
| `commands/discuss.md` | `/discuss`: 읽기만 허용하고 수정, 커밋, 푸시 등 일체의 변경 작업을 금지하는 토론 모드 |
| `commands/short.md` | `/short`: 답변을 한두 문장으로 줄이는 짧은 답변 모드 |
| `commands/slang.md` | `/slang`: 욕 대신 쓰는 강한 불만 표시. 사용자가 이 정도로 화났다는 것을 알리고 실수를 바로잡음 |
| `commands/task.md` | `/task`: worktree를 만들지 않고 현재 리포에서 Git workflow대로 작업 |
| `commands/task-worktree.md` | `/task-worktree`: worktree를 만들어 Git workflow대로 작업 |
| `commands/reflect.md` | `/reflect`: 지적이나 세션을 되짚어 원인을 찾고, 규칙(CLAUDE.md, docs, command)과 메모리를 고침 |
| `commands/merge-dotclaude.md` | `/merge-dotclaude`: ~/.claude 리포(dotclaude)의 변경(CLAUDE.md, docs, commands, hooks)을 PR로 올리고 merge |
| `commands/validate.md` | `/validate`: ~/.claude 지시사항(CLAUDE.md, docs, commands)의 모순, 모호한 표현, 깨진 참조를 고정 절차로 검사 |
| `.gitignore` | 추적할 파일만 허용하는 목록 |
| `hooks/validate-hard-rules.sh` | 마지막 답변에 em-dash가 있으면 고치게 하는 Stop hook (`settings.json`의 `hooks.Stop`에 등록해야 동작) |
| `hooks/feedbacks-reminder.mjs` | `docs/feedbacks/feedbacks.md`의 확인 항목을 컨텍스트로 붙이는 UserPromptSubmit, PreToolUse hook (`settings.json`에 등록해야 동작, PreToolUse는 matcher를 `AskUserQuestion`으로) |
| `hooks/goal-no-question.mjs` | `/goal`이 켜져 있으면 질문 창을 막는 PreToolUse hook (`settings.json`에 등록해야 동작, matcher는 `AskUserQuestion`) |
| `hooks/bash-background.mjs` | 백그라운드로 실행하지 않은 Bash 호출을 막는 PreToolUse hook (`settings.json`에 등록해야 동작, matcher는 `Bash`) |
| `hooks/notify.sh` | 세션 타이틀을 제목에 넣어 macOS 알림을 띄우는 Stop, Notification hook. 알림을 누르면 그 세션의 VS Code 창을 열고, 지금 보는 창이 그 세션이면 알리지 않음 (`settings.json`에 등록해야 동작) |
| `scripts/validate-rules.mjs` | 지시사항의 기계 검사(참조, 파일, README 표, 번호, 중복, 용어) 스크립트. `/validate`가 실행 |

## 설치

`~/.claude`를 이 리포로 씁니다. `.gitignore`가 허용 목록 방식이라 `settings.json`, `projects/` 등 컴퓨터별 파일은 추적하지 않습니다.

```bash
cd ~/.claude
git init -b main
git remote add origin git@github.com:alchemine/dotclaude.git
git fetch origin
git reset origin/main          # 작업 트리는 그대로 두고 이력만 받음
git branch -u origin/main
git status                     # 리포와 다른 파일 확인
git checkout -- .              # 리포 내용으로 맞출 때만 실행
```

hook은 `settings.json`에 직접 등록해야 동작합니다.

### 완료 알림 (`hooks/notify.sh`)

턴이 끝나면 macOS 알림을 띄우고, 알림을 누르면 그 세션의 VS Code 창으로 갑니다.

1. `settings.json`의 `hooks.Stop`에 등록합니다.

   ```json
   {
     "type": "command",
     "command": "NOTIFY_SKIP_IF_PENDING=1 bash ~/.claude/hooks/notify.sh \"작업 완료\""
   }
   ```

   `NOTIFY_SKIP_IF_PENDING=1`이면 백그라운드 작업이 남아 있을 때는 알리지 않습니다.

2. `terminal-notifier`를 설치합니다. 없으면 기본 알림(`osascript`)으로 뜨는데, 이 알림을 누르면 VS Code 대신 스크립트 편집기가 열립니다.

   ```bash
   brew install terminal-notifier
   ```

3. 알림 권한을 켭니다. 처음 설치하면 권한이 꺼진 채로 기록되어 알림이 뜨지 않습니다.
   1. `terminal-notifier -message test`를 한 번 실행합니다.
   2. 시스템 설정 > 알림 > 응용 프로그램 알림 목록에서 `terminal-notifier`를 열고 "알림 허용"을 켭니다.
   3. 목록에 없으면 `tccutil reset UserNotification fr.julienxx.oss.terminal-notifier`를 실행한 뒤 1번부터 다시 합니다.

4. (선택) 알림 아이콘을 VS Code로 바꿉니다. 알림 아이콘은 알림을 보낸 앱의 아이콘을 따르므로, VS Code 아이콘을 단 사본을 만듭니다. `notify.sh`는 이 사본이 있으면 사본을 씁니다.

   ```bash
   DST=~/Applications/claude-notifier.app
   mkdir -p ~/Applications && cp -R /opt/homebrew/opt/terminal-notifier/terminal-notifier.app "$DST"
   cp "/Applications/Visual Studio Code.app/Contents/Resources/Code.icns" "$DST/Contents/Resources/Terminal.icns"
   /usr/libexec/PlistBuddy -c 'Set :CFBundleIdentifier fr.julienxx.oss.terminal-notifier.vscode' "$DST/Contents/Info.plist"
   codesign --force --deep -s - "$DST"
   "$DST/Contents/MacOS/terminal-notifier" -message test
   ```

   사본은 별도 앱이라 3번의 알림 권한을 사본(`claude-notifier`)에도 한 번 켜야 합니다.

5. 확인합니다. 다른 앱 창을 띄워 둔 상태에서 아래를 실행해 알림이 뜨고, 누르면 VS Code 창이 열리면 됩니다.

   ```bash
   echo "{\"cwd\":\"$PWD\"}" | bash ~/.claude/hooks/notify.sh "테스트"
   ```

   지금 보고 있는 VS Code 창이 그 폴더면 알림이 뜨지 않습니다.
