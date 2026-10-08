---
name: github-pr
description: GitHub 이슈를 기반으로 변경 코드를 기능 단위로 커밋하고 PR을 생성한다. 사용자가 "N번 이슈 처리해줘", "이 이슈로 PR 올려줘", "이슈 N번 작업한 거 PR 만들어줘"처럼 이슈 번호를 주며 PR 생성을 요청할 때 사용한다. 또한 기존 이슈 없이 "이런 기능 만들어서 PR까지 올려줘"처럼 작업을 지시받은 경우, 내용을 정리해 이슈를 먼저 생성한 뒤 구현·PR까지 처리할 때도 사용한다. (이미 열린 PR에 피드백을 반영하는 경우는 github-pr-fix를 사용)
---

# github-pr — 이슈 기반 PR 생성

## 입력

다음 두 경우를 구분한다.

- **기존 이슈가 있는 경우**: 사용자 요청에서 처리할 **이슈 번호**를 파악한다. (예: "2번 이슈 처리해줘" → 이슈 #2)
- **기존 이슈가 없는 경우**: 사용자가 작업 내용을 직접 지시한다. (예: "로그 레벨을 env로 설정할 수 있게 해서 PR까지 올려줘") 이때는 작업 순서 0단계에 따라 이슈를 먼저 생성한 뒤 진행한다.

번호가 주어졌다고 했는데 분명하지 않으면 사용자에게 되묻는다.

## 가이드라인

1. Git 관련 작업들은 `gh` 명령어를 사용한다.
2. 로컬 작업들은 detached HEAD 에서만 수행하고 새로운 로컬 브랜치를 생성하지 않는다.
   - e.g. `git push origin HEAD:...`

## 작업 순서

0. **(기존 이슈가 없는 경우에만)** 사용자의 작업 지시를 정리하여 이슈를 먼저 생성한다.
   - 지시 내용을 바탕으로 제목과 본문(배경/목표/작업 항목)을 정리한다.
   - 내용이 모호하거나 범위가 불분명하면 이슈를 만들기 전에 사용자에게 확인한다.
   - `gh issue create --title "..." --body "..."`로 이슈를 생성하고, 반환된 이슈 번호를 이후 단계의 이슈 번호로 사용한다.
1. 주어진(또는 0단계에서 생성한) 이슈 번호를 기반으로 이슈를 확인한다 (`gh issue view <번호>`).
2. 변경한 코드들을 기능 단위로 구별하여 커밋을 수행한다.
   - `.vscode/settings.json`을 참고하여 포맷팅한다.
3. PR 본문은 다음 섹션으로 구성한다.
   - **Remark**: 해당 PR이 어떤 AI 모델에 의해 작성되었는지 알림
   - **Issues**: 어떤 이슈를 해결하였는지 (`Fixes #N` 활용)
   - **Descriptions**: 어떤 문제를 해결/개선하였는지, 어떻게 해결하였는지, 어떤 점이 난이도가 있었는지 핵심 내용을 구체적으로 작성
   - **Tests**: 구현 내용을 검증/시연할 수 있는 코드의 링크 및 간략한 설명
     - `playground/브랜치명` 디렉터리를 생성하고 그 안에 검증/시연용 코드 작성
     - 결과는 요약글로 생성
4. PR 올리기
   - 메인 브랜치는 `develop` 혹은 `main`. 둘 다 없으면 사용자에게 물어본다.
   - 원격 브랜치명은 `feature/${issueNumber}-${sanitizedIssueTitle}` 형식을 따른다.
5. 머지 및 마무리
   - 사용자로부터 merge 요청을 받으면 해당 PR의 merge를 수행하고, worktree·local branch를 제거한다.
   - 원격 브랜치는 삭제하지 않는다.

## PR 예시

```
### Remark
- 해당 PR은 AI에 의해 작성되었습니다.

### Issues
- Fixes #1

### Descriptions
1. 문제/개선 사항: 프로젝트 초기 세팅 시 기본적인 실행 가능한 Python 스크립트가 필요했습니다.
2. 해결 방법: `hello_world.py` 파일을 생성하여 "Hello, World!"를 출력하는 간단한 스크립트를 추가했습니다.
3. 구현 내용: Python의 print 함수를 사용하여 기본 메시지를 출력합니다.

### Tests
- [playground/create-hello-world/test_hello_world.py](playground/create-hello-world/test_hello_world.py)
    - `uv run playground/create-hello-world/test_hello_world.py` 명령어로 실행

<details>
<summary>📋 실행 결과</summary>

​```
Hello, World!
✅ 테스트 통과: 'Hello, World!' 출력 확인
​```

</details>
```
