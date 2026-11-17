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

header="Claude Code"
[ -n "$title" ] && header="Claude Code · $title"

/usr/bin/osascript - "$msg" "$header" <<'AS'
on run argv
  display notification (item 1 of argv) with title (item 2 of argv) sound name "Glass"
end run
AS
exit 0
