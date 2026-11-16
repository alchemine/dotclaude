---
date: 2026-10-30
dotclaude: f65154c-dirty
principles: []
rules: []
---

## 상황
보안 인증 제출용 추론 구성도에서 AI 서비스 pod 노드의 보조 라벨에 무엇을 적을지 골라야 했다. 참고 그림에는 컴포넌트 이름(ai-api, ai-worker)이 적혀 있었다.

## rejected
Claude는 참고 그림과 같은 모양을 맞추려고 컴포넌트 이름을 보조 라벨에 그대로 적었다.

## chosen
사용자는 내부 서비스 로직은 심사 대상이 아니라며 빼게 했다.

> ai-worker, ai-api 이런 것도 불필요한 내용이야. 이건 내부 서비스 로직이지 구현 설명을 하는 게 아니야
