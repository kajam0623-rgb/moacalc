# 쉬운 말·긍정 베이스 다시 쓰기 도구 (2026-09-30)

사용자 지시: "전체적으로 말들이 어려워, 긍정적 베이스로 가면서 풀어서 설명해야지".

1. `STYLE.md` — 다시 쓸 때 지키는 스타일 가이드(에이전트에게 먼저 읽힌다).
2. 원문 조각을 in/*.json 으로 뽑고(같은 구조), 에이전트가 out/*.json 으로 다시 쓴다.
3. `node style_check.js out/x.json in/x.json` — 존댓말·겁주는 말·어려운 명리 용어·길이 비(0.95~1.9배)를 검사(오류 0이 될 때까지). 토큰 { } 가 있는 원고는 `TEMPLATES=1`.
4. `merge.js` — out/*.json 을 content_*.js(또는 hub.html 의 표)로 합친다. 경로(ROOT, in/out 폴더)는 작업 세션에 맞게 고칠 것.
5. `node verify.js`(원고 문체 검사 포함) → `node build_site.js` → 배포.

## 토정비결 144괘 (2026-10-01) — `tojeong/`
사용자 지적: "토정비결이 무슨 뜻인지 모르겠어, 말이 어려워". 옛 시적 풀이를 새 구조(title·sum·image·chongun·money·work·love·health·tips·flow·months)로 다시 썼다.
- `STYLE_TJ.md` 규칙, `examples.json` 완성 예시(562 길·311 흉), `tj_check.js` 검사기(칸 길이·등급별 달 분위기·존댓말·겁주는 말·옛말·명리 용어·같은 문장 되풀이·제목 중복), `merge_tj.js` 합치기(content_tojeong.js 에 괘 코드별로, grade 는 기존 값 유지).
- 입력은 괘 9개씩 in/tj_01~16.json, 에이전트 16개가 out/tj_XX.json 으로 씀. 세션 폴더 경로는 파일 안에서 고칠 것.
- 화면은 hub.html 의 `tjDeep`·`tjSecHtml`(순수 함수, verify 가 144괘로 검사)과 도구 render 가 만든다.
