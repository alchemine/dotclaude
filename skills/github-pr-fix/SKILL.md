---
name: github-pr-fix
description: 이미 열려 있는 GitHub PR의 리뷰 피드백/코멘트를 반영한다. 사용자가 "PR N번 피드백 반영해줘", "리뷰 코멘트 처리해줘", "PR에 달린 의견대로 고쳐줘"처럼 기존 PR의 코멘트 대응을 요청할 때 사용한다. (새 이슈로 PR을 처음 만드는 경우는 github-pr를 사용)
---

# github-pr-fix — PR 피드백 반영

## 입력

사용자 요청에서 대상 **PR 번호**를 파악한다. (예: "PR 12번 피드백 반영해줘" → PR #12)
번호가 분명하지 않으면 사용자에게 되묻는다.

## 가이드라인

1. Git 관련 작업들은 `gh` 명령어를 사용한다.
2. 로컬 작업들은 detached HEAD 에서만 수행하고 새로운 로컬 브랜치를 생성하지 않는다.
   - e.g. `git push origin HEAD:...`

## 작업 순서

1. 피드백 내용들을 확인하여 **답변 코멘트만 추가**해도 되는지, 혹은 **코드 변경**이 필요한지 결정한다.
   - 코드에 연관된 코멘트(review comment)와 코드 없이 달린 코멘트(issue comment)는 API가 다르니 주의한다.
2. 코드 변경이 필요하지 않다면, 답변 코멘트를 추가한다.
3. 코드 변경이 필요하다면, 피드백을 반영해 변경한 코드들을 기능 단위로 구별하여 커밋한다.
   - `.vscode/settings.json`을 참고하여 포맷팅한다.
   - 사용자가 직접 수정한 코드를 가져오기 위해 먼저 pull 한 다음 코드를 수정한다.
4. PR 본문은 다음 섹션으로 구성한다.
   - **Remark**: 해당 PR이 어떤 AI 모델에 의해 작성되었는지 알림
   - **Issues**: 어떤 이슈를 해결하였는지 (`Fixes #N` 활용)
   - **Descriptions**: 어떤 문제를 해결/개선하였는지, 어떻게 해결하였는지, 어떤 점이 난이도가 있었는지 핵심 내용을 구체적으로 작성
   - **Tests**: 구현 내용을 검증/시연할 수 있는 코드의 링크 및 간략한 설명
     - `playground/브랜치명` 디렉터리를 생성하고 그 안에 검증/시연용 코드 작성
     - 결과는 요약글로 생성
5. PR에 추가하기
   - 기존 기록을 지우지 말고 추가한다.
6. 머지 및 마무리
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
