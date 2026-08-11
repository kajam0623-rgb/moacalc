# 운세 콘텐츠 대개편 — 기술개발서 (CONTENT-UPGRADE)

> 이 문서 전체가 새 Claude Code 세션의 실행 프롬프트다. 질문 없이 T1→T4 순서로 완주한다.
> 목표: 운세 결과의 후킹·질·양을 동시에 올린다. 반복 체감 제거(조합 폭발), 명리 근거 노출(용신), 롱테일 SEO(+24페이지).

---

## 0. 프로젝트 컨텍스트 (콜드 스타트용)

- 로컬 `C:\Users\닥터원츠\salary-calc` · 라이브 https://gyesangi.vercel.app · GitHub `kajam0623-rgb/moacalc` main
- 브랜드 **동네보살** ("무료 사주는 동네보살"). 신뢰 축: 랜덤 문구 아님 — 태양황경 만세력 엔진, 같은 입력=같은 결과
- `hub.html` = 단일 소스. CSS + 엔진(sj*/ST_* 함수) + TOOLS 배열 57개
- `build_site.js` = site/ 57페이지 생성. **verify.js를 내부 실행해 실패 시 빌드 중단**(게이트). 통과 수를 신뢰 카피에 주입. core.js+t-*.js 코드 분할, ?v=해시 캐시버스팅
- `verify.js` = 자동 테스트 58개. 새 헬퍼 함수는 HELPERS 배열에 등록(정적 린트)
- 검증 하네스: 스크래치패드에 audit.js(분량 측정)·smoke.js(빌드 산출물 전수 렌더) 패턴 있음. 없으면 이 문서 §6의 스펙으로 재작성

### 절대 규칙
1. 로직 수정 후 `node verify.js` 필수. 헬퍼에서 window/localStorage/gtag는 반드시 `typeof` 가드(노드 하네스가 깨짐)
2. build_site.js 정규식 대량 편집 금지(과거 데이터 손실 사고). 라인 단위로
3. CATS 배열은 hub.html·build_site.js 양쪽에 존재 — 둘 다
4. 배포: `node verify.js && node build_site.js` → commit/push → `vercel --prod --yes` → **`vercel alias set <배포URL> gyesangi.vercel.app` 필수**
5. 이미지 생성(image-gen 스킬) 시 **오염 주의**: 다른 세션 이미지를 물어온 사고 3회. 생성 직후 Read로 눈 확인, 고유 임시 파일명 사용. 이 개발서 범위에는 신규 이미지 불필요 — 만들지 마라
6. 콘텐츠 변경 배포 후 IndexNow 재제출(§7)

### 카피 원칙 (모든 신규 문장에 적용)
- 조사 빼기·명사 종결: "귀인의 날. 단, 혼자 앓지 말 것." (설명문 금지)
- 고객 시점: "표현이 자연스러워지는 날" ○ / "식신이 투출하여" ✕ (용어는 쓰되 즉시 풀이)
- 지어내지 않기: 모든 문장은 계산된 명리 요소(십성·운성·합충·용신)에 근거. "당신은 요즘 지쳐있다" 류 콜드리딩 금지
- 단정 금지: 건강·금전 문장은 "~하기 쉽습니다/~에 유리합니다" 수준. 의료·투자 단정 표현 금지

---

## T1. 오늘의 운세 — 후킹 재설계 + 차원 곱하기 + 용신 (핵심 태스크)

**대상:** `hub.html`의 todayfortune 도구, 공유 헬퍼 구역

### T1-1. 결과 첫 화면 구조 교체

현재: 점수 카드가 첫 요소. 변경 후:

```
[정체성 1줄]  "기(己) 일간 — 곡식을 기르는 밭의 흙."
[헤드라인]    "귀인의 날. 단, 혼자 앓지 말 것."
[점수 카드]   기존 .out (점수+등급+일진)
[4축 바]      기존
...이하 기존 섹션
```

구현:
- 일간 정체성 10문장: 신규 배열 `SJ_ILGAN_ID` (엔진 구역, SJ_EL 근처). 각 항목 "한자(음) 일간 — 은유 한 구." 예: 갑 "甲(갑) — 하늘로 곧게 크는 큰 나무.", 병 "丙(병) — 숨김없이 내리쬐는 태양." 10개 전부 작성. saju 도구의 ILGAN 배열(장문)과 별개 — 이건 1줄 압축판
- 헤드라인: 십성 데이터에 필드 추가(아래 T1-2의 `hl`). 조립: `hl + (합충 있으면 보정 경고 축약)`
- DOM: `.out` 위에 `<div class="tf-id">…</div><div class="tf-hl">…</div>`. CSS 신규: `.tf-id`(mono, 11.5px, muted, letter-spacing) `.tf-hl`(20px, 800, 줄바꿈 허용). hub.html `<style>`에 추가

### T1-2. 문장 뱅크 차원 곱하기 — 40조합 → 480조합

현재 TXT 구조: `십성: [점수, 총운, 재물, 조언, 주의, [보정4], 애정, 직장, 건강]` — 십성 하나가 모든 문장을 독점 → 십성이 같으면 매일 같은 글.

변경: 문장을 3계층 조립로 바꾼다. **기존 TXT 필드는 유지**하고(회귀 방지) 두 계층을 추가:

```js
// 신규 1: 십성 헤드라인 (T1-1용)
// TXT 각 항목 끝에 hl 필드 추가 (10개)
"정인":[84, ..., "귀인의 날. 단, 혼자 앓지 말 것."]

// 신규 2: 십이운성 무드 12문장 — 하루의 '온도'를 총운에 접합
var UN_MOOD={
"장생":"몸이 가볍게 시작되는 날이라, 새로 여는 일에 힘이 붙습니다.",
"제왕":"기운이 정점이라 밀어붙이는 힘은 좋지만 과속을 조심할 날입니다.",
... 12개 전부, 각 40~60자
};

// 신규 3: 합충 결과 문장은 기존 bonus 유지 + '없음'일 때도 한 줄
// (현재 합충 없으면 침묵 → "일지에 특별한 합충 없이 담백한 하루" 추가)
```

총운 출력 조립: `T[1] + " " + UN_MOOD[un] + (bonus||무합충문장)` — 십성 10 × 운성 12 × 합충 4 = **480가지 총운**. 같은 십성이어도 운성이 달라 매일 다르게 읽힘.

### T1-3. 용신 통합 — 차별화 킬러 콘텐츠

엔진의 `sjStrength(p)`가 이미 신강신약과 용신(오행 index 0~4)을 계산한다. 오늘의 운세에 연결:

```js
var st=sjStrength(me); // {strong, yong, de, ratio}
var todayEl=SJ_ES[today.d.s]; // 오늘 일진 천간의 오행
var yongHit=(todayEl===st.yong);
```

신규 섹션 "용신으로 보는 오늘" (십이운성 섹션 앞):
- 공통 도입: `"당신의 사주는 "+(st.strong?"신강":"신약")+" — 억부법으로 "+SJ_EL[st.yong]+"("+한자+")이 용신입니다."`
- yongHit이면: `"오늘 일진 천간이 바로 그 "+SJ_EL[st.yong]+" — 용신이 들어오는 날입니다. 평소보다 판단이 선명하고 몸이 가볍습니다. 미뤄둔 결정은 오늘 내리세요."` + **총점 +5** (클램프 유지)
- 용신을 극하는 오행이면(`(st.yong+2)%5===todayEl`): 주의 문장 + 총점 −3
- 그 외: 중립 한 줄
- note에 억부용신 한 줄 설명 추가. 행운색 근거를 인성 오행 → **용신 오행**으로 교체(더 정통): `SJ_LUCK[st.yong]` 사용, 설명 문장도 갱신

### T1-4. 내일 미리보기 (재방문 훅)

마지막 섹션(공유 버튼 위):
```js
var tmr=new Date(ty,tm-1,td+1),tp=sjPillars(tmr.getFullYear(),tmr.getMonth()+1,tmr.getDate(),null,0,false);
var tRel=sjTenGod(me.d.s,tp.d.s);
```
`"내일 미리보기 — "+간지+"일, 당신에게 "+tRel+"의 날"` + TXT[tRel]의 hl 재사용. "내일 자정에 다시 확인하세요" 한 줄. 공유 문구에도 낚시 없음 유지.

### T1 수용 기준
- audit.js 기준 todayfortune 결과 **1,400자 이상** (현재 980)
- 같은 생일로 연속 3일치 날짜(sjPillars에 날짜 주입해 시뮬레이션) 총운 문장이 서로 달라야 함 — 검증 스크립트로 확인
- verify에 추가: `SJ_ILGAN_ID.length===10`, `Object.keys(UN_MOOD).length===12`, TXT 10종에 hl 존재, 용신 보정 후에도 점수 35~98 클램프
- 헤드라인·정체성 문장이 첫 화면(점수 위)에 렌더

---

## T2. 타로 — 포지션별 해석 132조합 + 상징 스토리

**대상:** `hub.html` tarot 도구

### T2-1. 데이터 확장

현재 M[22] = [번호, 이름, 심볼, 정방향, 역방향] + FLD[22] = [연애, 일금전].

신규 `POSM[22]` = 카드별 `[과거정, 현재정, 미래정]` 3문장 (역방향은 기존 역방향 문장 + 포지션 접두로 처리 — 66문장 신규면 충분, 132 전부 쓸 필요 없음):

```js
var POSM=[
["과거의 무모한 시작이 지금 상황의 뿌리입니다.","지금 계산 없이 뛰어들고 싶은 마음이 움직이고 있습니다.","곧 새로운 출발선에 서게 됩니다. 준비물은 용기 하나면 됩니다."],
... 22개 전부, 각 30~50자
];
```

신규 `STORY[22]` = 카드 상징 1~2문장 (그림의 의미 — 아트 이미지와 함께 읽힘):
```js
var STORY=[
"절벽 끝에서 하늘을 보며 걷는 젊은이. 어리석음이 아니라 아직 결과를 모르는 순수한 가능성입니다.",
... 22개 전부
];
```

### T2-2. 출력 조립 변경

카드 뒤집을 때(one 블록):
```
[포지션 — 카드명 (역방향)]
STORY[i]                                  ← 상징 스토리
포지션 해석: POSM[i][pos] (역방향이면 "다만 역방향이라 이 흐름이 뒤집히거나 지연됩니다" 접미)
기존 정/역 핵심문 + 분야별 해석(기존 유지)
```
기존 summary(세 장 종합)는 유지.

### T2 수용 기준
- 타로 3장 오픈 시 총 출력 **1,200자 이상** (현재 623)
- verify 추가: `POSM.length===22 && POSM.every(r=>r.length===3)`, `STORY.length===22`
- 같은 카드가 과거/현재/미래에 뜰 때 포지션 문장이 달라짐을 스크립트로 확인

---

## T3. 프로그래매틱 SEO — 별자리 12 + 띠 12 개별 페이지

**대상:** `build_site.js` (hub.html 수정 불필요 — 기존 도구를 프리셋 마운트)

### T3-1. URL·데이터 스킴

- `star-aries.html` … `star-pisces.html` (ST_EN 순서 12개)
- `zodiac-rat.html` … `zodiac-pig.html` (ZO_EN 순서 12개: rat ox tiger rabbit dragon snake horse goat monkey rooster dog pig)
- build_site.js에 신규 데이터 `STAR_PAGES[12]`, `ZODIAC_PAGES[12]`:

```js
const STAR_PAGES=[ // ST_KO 순서와 일치
{en:"aries",ko:"양자리",sym:"♈",range:"3.21~4.19",ele:"불",ruler:"화성",
 intro:"3~4문단, 700자+ — 별자리 유래(신화 1문단), 성격 핵심, 강점·약점",
 love:"연애 스타일 2문단 300자+",
 work:"일·직업 적성 2문단 300자+",
 match:{best:["사자자리","궁수자리"],why:"...",hard:["게자리"],hardWhy:"..."},
 y2026:"2026년 흐름 1문단 200자+"},
...12개 전부 작성];
```
띠도 동일 스키마(신화 대신 십이지 설화, ele는 지지 오행, 2026은 병오 태세와의 합충 — 쥐띠 충/호랑이·개띠 삼합/양띠 육합/소띠 해 반영). **총 24항목 × 1,500자+ = 신규 원고 약 4만자. 이 원고 작성이 T3의 본체다. 위 카피 원칙 준수, 전부 직접 집필.**

### T3-2. 페이지 생성

`starPage(s)`/`zodiacPage(z)` 함수 신설 (toolPage 변형):
- title: `"사자자리 운세·성격·궁합 — 오늘의 사자자리 | 동네보살"` 패턴
- 본문: 캐릭터 이미지(`img/char/st-leo.webp`/`zo-horse.webp`, 520 치수) + intro/love/work/match표/y2026 섹션 + FAQPage JSON-LD(궁합·기간·성격 Q 3개씩)
- **도구 임베드:** `<div class="card tool" id="tool"></div>` + `<script src="core.js?v=">`+`t-horoscope.js`(띠는 t-zodiacfortune.js) + 인라인:
```html
<script>mountTool("horoscope","tool");
(function(){var s=document.querySelector("#tool #s");if(s){s.value="4";s.dispatchEvent(new Event("change"));}})();</script>
```
  (horoscope/zodiacfortune의 #s select는 change에 go 바인딩돼 있어 값 주입+이벤트로 해당 별자리 결과가 즉시 뜬다. 값은 페이지별 index)
- 내부링크: 12개 형제 페이지 칩 + 관련 도구(horoscope, stargunghap, todayfortune)
- sitemap에 24 URL 추가, 별자리운세·띠별운세 페이지 본문에서 개별 페이지로 링크(칩 12개)
- trust 칩 노출(재미·운세와 동일 취급)

### T3 수용 기준
- 빌드 후 site/*.html **57 → 81개**
- star-leo.html 정적 텍스트(스크립트 제외) 1,500자+, 개별 title/desc/canonical/OG(캐릭터 이미지)/FAQ JSON-LD
- 라이브에서 star-leo.html 열면 사자자리 운세가 자동 표시(select 프리셋 동작) — 브라우저로 확인
- sitemap.xml에 24 URL 포함

---

## T4. 궁합·신년·별자리궁합에 T1 헤드라인 패턴 이식 (소)

- gunghap: 첫 화면에 `"[띠A] × [띠B] — [등급]."` 헤드라인 + 핵심 축 1줄
- newyear: `"병오년, 당신에게 [십성]의 해."` 헤드라인
- stargunghap: `"[원소]와 [원소]가 만나면."` 헤드라인
- 각 30분 작업. 새 데이터 불필요(기존 계산값 조립)

---

## 5. 실행 순서

```
T1 (오늘의 운세) → 검증 → 커밋
T2 (타로) → 검증 → 커밋
T3 (24페이지 — 원고가 커서 별자리 12 먼저, 띠 12 다음, 커밋 분리)
T4 (헤드라인 이식) → 커밋
배포 → 라이브 검증 → IndexNow
```

## 6. 검증 스펙 (매 태스크 공통)

1. `node verify.js` 전체 통과 (신규 배열 길이 테스트 포함해서 **테스트를 먼저 추가**하고 구현)
2. `node build_site.js` 성공 (verify 게이트 + 청크 구문검사)
3. 전수 렌더: 스크래치패드 smoke.js — 산출물 t-*.js 전부 로드→render→클릭, undefined/[object 검출 시 실패
4. 분량 측정: audit.js — 목표: todayfortune 1,400+ / tarot 1,200+ / 나머지 유지
5. 반복 제거 확인: 같은 생일 × 다른 날짜 3개 → 총운 문장 상이함 assert
6. 라이브: 배포 후 todayfortune·tarot·star-leo 3페이지 실제 열어 첫 화면 구조·자동 프리셋 확인 (스크린샷 또는 innerText 검사)

## 7. 배포·색인

```bash
cd "C:/Users/닥터원츠/salary-calc"
node verify.js && node build_site.js
git add -A && git -c user.email="kajam0623@gmail.com" -c user.name="kajam0623-rgb" commit -m "..." && git push origin main
DEP=$(vercel --prod --yes 2>&1|grep -o 'https://moacalc-[a-z0-9]*-kajam0623-rgbs-projects.vercel.app'|head -1)
vercel alias set "$DEP" gyesangi.vercel.app
node -e 'const key="9f3c7a1e4b8d2f60a5c1e7b93d4f8a2c",h="gyesangi.vercel.app",b="https://"+h;const fs=require("fs");const u=fs.readdirSync("site").filter(f=>f.endsWith(".html")).map(f=>f==="index.html"?b+"/":b+"/"+f);fetch("https://api.indexnow.org/indexnow",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({host:h,key,keyLocation:b+"/"+key+".txt",urlList:u})}).then(r=>console.log("IndexNow",r.status,u.length));'
```

## 8. 완료 기준 요약표

| 지표 | 현재 | 목표 |
|---|---|---|
| 오늘의 운세 결과 분량 | 980자 | 1,400자+ |
| 오늘의 운세 총운 조합 | 40 | 480 (십성×운성×합충) |
| 용신 노출 | 없음 | 신강신약+용신+오늘 일진 판정 |
| 타로 결과 분량 | 623자 | 1,200자+ (포지션 66문장+스토리 22) |
| 페이지 수 | 57 | 81 (별자리 12+띠 12) |
| verify | 58 | 70+ (신규 데이터 길이·조립 테스트) |
| 첫 화면 후킹 | 점수부터 | 정체성 1줄+헤드라인 (운세 5종) |
