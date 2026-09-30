# 쉬운 말·긍정 베이스 다시 쓰기 도구 (2026-09-30)

사용자 지시: "전체적으로 말들이 어려워, 긍정적 베이스로 가면서 풀어서 설명해야지".

1. `STYLE.md` — 다시 쓸 때 지키는 스타일 가이드(에이전트에게 먼저 읽힌다).
2. 원문 조각을 in/*.json 으로 뽑고(같은 구조), 에이전트가 out/*.json 으로 다시 쓴다.
3. `node style_check.js out/x.json in/x.json` — 존댓말·겁주는 말·어려운 명리 용어·길이 비(0.95~1.9배)를 검사(오류 0이 될 때까지). 토큰 { } 가 있는 원고는 `TEMPLATES=1`.
4. `merge.js` — out/*.json 을 content_*.js(또는 hub.html 의 표)로 합친다. 경로(ROOT, in/out 폴더)는 작업 세션에 맞게 고칠 것.
5. `node verify.js`(원고 문체 검사 포함) → `node build_site.js` → 배포.
