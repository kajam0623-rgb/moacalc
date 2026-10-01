# 띠 궁합 페이지 (허브 1 + 띠별 12 + 짝 78)

사용자 지시(2026-10-01): "띠별 궁합 페이지도 만들어줘". 키워드 조사에서 띠궁합 7,910 · 띠별궁합 4,670 · 쥐띠궁합 2,260(월 검색량).

## 구성
| 페이지 | 주소 | 만드는 곳 |
|---|---|---|
| 허브(12×12 궁합표·띠 고르기·관계 설명·FAQ) | `tti-gunghap.html` | `ttiMainPage()` |
| 띠별 12(잘 맞는 띠·맞춰 갈 띠·도입 글) | `tti-gunghap-<en>.html` | `ttiHubPage(i)` |
| 짝 78(연애·결혼, 일·동업, 가족·친구, 풀어 가는 법) | `tti-pair-<a>-<b>.html` | `ttiPairPage(a,b)` |

- 관계표(삼합·육합·충·원진·형, 겹쳐 읽는 해·파)와 순수 계산은 `content_ttigunghap.js`. 가장 큰 관계 하나를 표시한다(삼합 > 육합 > 충 > 원진 > 형).
- 원고(짝 78 · 띠별 도입 12)는 `content_ttigunghap_text.js`. 직접 고치지 말고 아래 파이프라인으로 다시 합친다.
- 원고가 없으면 빌드가 멈춘다(빈 페이지를 내보내지 않는다).

## 원고 파이프라인
1. `node make_inputs.js` — `C:/tmp/moacalc-learn/tti/in/` 에 profiles·pairs_01~07·hubs 입력을 만든다(짝은 관계 종류별로 묶음).
2. 에이전트가 `STYLE_TTI.md`(존댓말·긍정 베이스·금지어·분량)를 읽고 `out/pairs_0N.json`·`out/hubs.json` 을 **Write 도구로** 쓴다.
3. `node tti_check.js pairs <out> <in>` / `hubs <out> <in>` 로 묶음별 검사(오류 0까지).
4. `node merge_tti.js` — 78쌍 전체 검사(문장 중복·분량) 후 `content_ttigunghap_text.js` 를 쓴다.
5. `node verify.js`(독립 표 대조·원고 문체·중복) → `node build_site.js` → `node adsense_audit.js`(띠궁합 91편·고유율) → 배포.

## 점검 도구(저장소 밖)
- `C:/tmp/moacalc-learn/tti_check.js` — 빌드한 site/ 를 로컬로 서빙해 허브 표 144칸·위젯·칸 클릭·폰 폭 넘침·짝/띠별 페이지 구조를 headless Chrome 으로 확인.

## 주의
- 관계표 출처는 지지 합·충·원진·형·해·파 일람(여러 명리 자료 교차 확인). verify 가 코드와 따로 적은 독립 표와 대조한다.
- 짝 페이지 원고는 일부러 "나쁜 궁합" 표현을 쓰지 않는다(충·원진·형도 맞춰 갈 점으로). 금지어는 `STYLE_TTI.md` 와 `tti_check.js`·`verify.js` 가 같다.
