#!/bin/bash
# Show a macOS notification with the session title.
# Usage: notify.sh "<message>"   (hook input JSON on stdin)
msg="${1:-알림}"
input=$(cat)
transcript=$(printf '%s' "$input" | /usr/bin/python3 -c 'import sys,json
try: print(json.load(sys.stdin).get("transcript_path",""))
except Exception: print("")')

title=""
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  title=$(/usr/bin/python3 - "$transcript" <<'PY'
import sys, json
custom = ai = ""
with open(sys.argv[1], encoding="utf-8") as f:
    for line in f:
        if '"title"' not in line and 'Title"' not in line:
            continue
        try:
            d = json.loads(line)
        except Exception:
            continue
        if d.get("type") == "custom-title" and d.get("customTitle"):
            custom = d["customTitle"]
        elif d.get("type") == "ai-title" and d.get("aiTitle"):
            ai = d["aiTitle"]
print(custom or ai)
PY
)
fi

# Stop 알림은 백그라운드 작업(명령, 에이전트)이 아직 돌고 있으면 건너뛴다.
# 그 작업이 끝나면 턴이 다시 이어지므로, 진짜 마지막 Stop에서만 알린다.
if [ "${NOTIFY_SKIP_IF_PENDING:-0}" = "1" ] && [ -n "$transcript" ] && [ -f "$transcript" ]; then
  pending=$(/usr/bin/python3 - "$transcript" <<'PY2'
import sys, json, re
started, done = set(), set()
def texts(c):
    if isinstance(c, str):
        yield c
    elif isinstance(c, list):
        for x in c:
            if isinstance(x, dict):
                if x.get("type") == "text":
                    yield x.get("text", "")
                elif x.get("type") == "tool_result":
                    yield from texts(x.get("content"))
with open(sys.argv[1], encoding="utf-8") as f:
    for line in f:
        if "background" not in line and "task-notification" not in line and "Async agent" not in line:
            continue
        try:
            d = json.loads(line)
        except Exception:
            continue
        if d.get("type") == "attachment":
            c = (d.get("attachment") or {}).get("prompt")
        elif d.get("type") == "user":
            c = d.get("message", {}).get("content")
        else:
            continue
        if isinstance(c, list):
            for x in c:
                if isinstance(x, dict) and x.get("type") == "tool_result":
                    t = "\n".join(texts(x.get("content")))
                    if t.startswith(("Command running in background with ID", "Async agent launched")):
                        started.add(x.get("tool_use_id"))
        for t in texts(c):
            for m in re.finditer(r"<task-notification>.*?<tool-use-id>([^<]+)</tool-use-id>.*?<status>([^<]+)</status>", t, re.S):
                if m.group(2).strip() != "running":
                    done.add(m.group(1).strip())
print(len(started - done))
PY2
)
  [ "${pending:-0}" != "0" ] && exit 0
fi

header="Claude Code"
[ -n "$title" ] && header="Claude Code · $title"

# 세션의 작업 폴더. 알림을 누르면 이 폴더가 열린 VS Code 창으로 간다.
cwd=$(printf '%s' "$input" | /usr/bin/python3 -c 'import sys,json
try: print(json.load(sys.stdin).get("cwd",""))
except Exception: print("")')
[ -n "$cwd" ] || cwd="$PWD"

# 지금 보고 있는 VS Code 창이 이 세션의 폴더면 알리지 않는다.
# 창 제목(" — "로 나뉜 조각)에 작업 폴더나 그 상위 폴더의 이름이 있으면 같은 창으로 본다.
# 창 제목을 읽으려면 VS Code에 손쉬움 접근 권한이 있어야 한다. 읽지 못하면 알린다.
front=$(/usr/bin/osascript -e 'tell application "System Events"
  set p to first application process whose frontmost is true
  if bundle identifier of p is not "com.microsoft.VSCode" then return ""
  return name of front window of p
end tell' 2>/dev/null)
if [ -n "$front" ]; then
  if /usr/bin/python3 - "$front" "$cwd" "$HOME" <<'PY3'
import sys, os
title, cwd, home = sys.argv[1], os.path.realpath(sys.argv[2]), os.path.realpath(sys.argv[3])
parts = {x.strip() for x in title.split(" \u2014 ")}
d = cwd
while d and d != "/":
    if os.path.basename(d) in parts:
        sys.exit(0)
    if d == home:
        break
    d = os.path.dirname(d)
sys.exit(1)
PY3
  then
    exit 0
  fi
fi

code_cli="/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
notifier=$(command -v terminal-notifier || ls /opt/homebrew/bin/terminal-notifier /usr/local/bin/terminal-notifier 2>/dev/null | head -1)
if [ -n "$notifier" ] && [ -x "$code_cli" ]; then
  "$notifier" -title "$header" -message "$msg" -sound Glass \
    -execute "$(printf '%q %q' "$code_cli" "$cwd")" >/dev/null 2>&1
  exit 0
fi

/usr/bin/osascript - "$msg" "$header" <<'AS'
on run argv
  display notification (item 1 of argv) with title (item 2 of argv) sound name "Glass"
end run
AS
exit 0
