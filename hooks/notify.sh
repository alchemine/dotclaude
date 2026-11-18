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

/usr/bin/osascript - "$msg" "$header" <<'AS'
on run argv
  display notification (item 1 of argv) with title (item 2 of argv) sound name "Glass"
end run
AS
exit 0
