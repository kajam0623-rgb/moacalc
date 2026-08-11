# 동네보살 기술 개발서 (DEV-ROADMAP)

> 2026-08-11 진단 기준. 현재 점수 65/100.
> 이 문서는 Claude Code가 세션을 새로 열어도 바로 착수할 수 있도록 작성됨.
> 각 태스크는 [대상 파일 → 구현 상세 → 수용 기준] 순. 완료 시 체크박스를 갱신할 것.

## 프로젝트 컨텍스트 (새 세션용 요약)

- 로컬 `C:\Users\닥터원츠\salary-calc`, 라이브 https://gyesangi.vercel.app, GitHub `kajam0623-rgb/moacalc` main
- `hub.html` = 단일 소스 (CSS + TOOLS 배열 56개 + 만세력/명리/점성술 엔진)
- `build_site.js` = hub.html에서 추출해 `site/`에 56페이지 정적 사이트 생성. SEO 콘텐츠 맵(intro/tags/deep/guide/faq) 포함
- `verify.js` = 자동 테스트 58개. **로직 수정 시 필수 실행**
- 배포: `node verify.js && node build_site.js && git push` 후 `vercel --prod --yes` → `vercel alias set <배포URL> gyesangi.vercel.app` (alias 필수)
- 규칙: 새 헬퍼 함수는 verify.js의 HELPERS 배열에 등록. CATS 배열은 hub.html·build_site.js 양쪽에 존재. build_site.js 정규식 대량 편집 금지(라인 단위로)

## 실측 현황 (2026-08-11)

| 항목 | 값 |
|---|---|
| app.js | 155KB (gzip 47KB), 전 페이지 공통 로드 |
| style.css | 27KB (gzip 6KB) |
| img/ 총량 | 6.5MB (페이지당 로드는 별개) |
| og.png | 689KB PNG, 전 페이지 공유, 구식 벡터 스타일 |
| aria 속성 | 페이지당 1개 |
| 애널리틱스 | 없음 |
| localStorage 활용 | 없음 (다크모드 테마 제외) |
| 공유 기능 | 없음 |
| 운세 결과 분량 | 사주 1830자 · 오늘운세 845 · 별자리 707 · 띠별 702 · 궁합 636 · 신년 591 · 이름궁합 488 |

---

## P0 — 수익·재방문에 직결 (이번 주)

### [ ] P0-1. 생년월일 기억 (localStorage)

**목적:** 운세는 일간 재방문 상품. 매번 생년월일 재입력은 이탈 요인 1순위.

**대상:** `hub.html` (공유 헬퍼 구역, `// ---------- shared` 아래), 운세 도구 6개(todayfortune, saju, horoscope, zodiacfortune, gunghap, newyear)의 render

**구현:**
1. 공유 헬퍼 추가:
```js
function loadPrefs(){try{return JSON.parse(localStorage.getItem("dnbs")||"{}");}catch(e){return {};}}
function savePrefs(p){try{var c=loadPrefs();for(var k in p)c[k]=p[k];localStorage.setItem("dnbs",JSON.stringify(c));}catch(e){}}
```
2. 각 운세 도구 render 시작부에서 `loadPrefs().birth`가 있으면 date input 기본값으로 주입. `go()` 실행 시 `savePrefs({birth:el.querySelector("#d").value})`.
   - saju는 birth + birthTime + gender, gunghap은 birth + partnerBirth 별도 키
3. 저장된 값이 있으면 페이지 진입 즉시 `go()` 자동 실행 (이미 대부분 `go()` 즉시 호출 구조라 기본값 주입만으로 충족)
4. verify.js HELPERS에 `loadPrefs`, `savePrefs` 등록

**수용 기준:**
- 오늘의 운세에서 생일 입력 → 새로고침 → 같은 생일로 결과가 이미 떠 있음
- 시크릿 모드(localStorage 예외)에서도 에러 없이 동작 (try/catch)
- `node verify.js` 전체 통과

**작업량:** 소 (1~2시간)

### [ ] P0-2. 결과 공유 — Web Share API + 클립보드 폴백

**목적:** 성장 루프. 한국 운세 서비스 트래픽의 상당분이 카톡 공유 유입.

**대상:** `hub.html` 공유 헬퍼 + 운세 도구 6개의 결과 출력부, `hub.html`의 `<style>`

**구현:**
1. 헬퍼:
```js
function shareBtn(title,text){
  return '<button class="share-btn" data-t="'+title.replace(/"/g,"&quot;")+'" data-x="'+text.replace(/"/g,"&quot;")+'">결과 공유하기</button>';}
function bindShare(el){el.querySelectorAll(".share-btn").forEach(function(b){b.addEventListener("click",function(){
  var d={title:b.dataset.t,text:b.dataset.x,url:location.href.split("#")[0]};
  if(navigator.share){navigator.share(d).catch(function(){});}
  else{navigator.clipboard.writeText(d.text+" "+d.url).then(function(){b.textContent="복사됨! 카톡에 붙여넣으세요";setTimeout(function(){b.textContent="결과 공유하기";},2000);});}});});}
```
2. 각 운세 도구의 `#out` 마지막에 `shareBtn()` 삽입, 렌더 후 `bindShare(el)` 호출.
   공유 텍스트 예시(오늘의 운세): `"오늘의 운세 84점 · 정인의 날 — 귀인과 배움의 날. 동네보살에서 확인"`
3. `.share-btn` 스타일: 기존 `#go` 버튼과 동일 계열, `margin-top:14px;width:100%`
4. HELPERS에 `shareBtn`, `bindShare` 등록

**수용 기준:**
- 데스크톱(share 미지원): 클릭 → 클립보드에 "점수+한줄+URL" 복사, 버튼 문구 2초 변경
- 모바일: OS 공유 시트 표시
- 운세 6종 전부에 버튼 존재. verify에 정적 검사 추가: 운세 6개 도구 소스에 `shareBtn(` 포함 여부

**작업량:** 소~중 (2~3시간)

### [x] P0-3. 애널리틱스 (GA4) — 코드 완료, ID 대기

**목적:** 현재 어떤 도구에 트래픽이 오는지 전혀 모름. 광고 배치·콘텐츠 우선순위 판단 불가.

**대상:** `build_site.js`의 `headExtra`

**구현:**
1. 상수 추가: `const ANALYTICS_ID = "";` (GA4 측정 ID 예: G-XXXXXXX)
2. headExtra에 조건부 삽입:
```js
${ANALYTICS_ID?`<script async src="https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ANALYTICS_ID}');</script>`:""}
```
3. 공유 버튼 클릭·운세 조회(go 실행)에 커스텀 이벤트: `if(window.gtag)gtag('event','fortune_view',{tool:'todayfortune'})`
   — hub.html에 안전 래퍼 `function track(ev,p){if(window.gtag)try{gtag('event',ev,p)}catch(e){}}` 추가, HELPERS 등록
4. 사용자에게 GA4 속성 생성 요청 → ID 수령 → 값 채우고 재빌드

**수용 기준:** ANALYTICS_ID 빈 값이면 스크립트 미출력(현재와 동일). 값 있으면 전 페이지 삽입 + fortune_view/share_click 이벤트 수집.

**작업량:** 소 (1시간, ID 수령 대기 별도)

### [ ] P0-4. 페이지별 OG 이미지 + og.png 교체

**목적:** 공유 썸네일이 689KB 구식 벡터 1장. 카톡 미리보기 품질이 공유 전환율을 결정.

**대상:** `build_site.js`의 `OG_IMG_TAG`, `img/` 에셋

**구현:**
1. og.png 재생성: image-gen 스킬로 1200×630 애니 톤(감청 야경·금색) 생성.
   **주의: image-gen 래퍼가 동시 실행 중인 다른 세션의 이미지를 물어오는 오염 사고 3회 발생.** 생성 직후 반드시 Read 툴로 열어 눈으로 확인. 오염 시 고유한 임시 이름(`dnbs-og-YYYYMMDD` 등)으로 재시도.
2. Pillow로 webp 변환 (스크래치패드의 towebp_w.py 패턴, 1200px q84 → 100~150KB 목표). og는 호환성 위해 jpg도 허용.
3. 운세 6종은 기존 히어로 배너를 페이지 OG로 재사용:
```js
const ogFor = id => fs.existsSync(path.join(IMG_SRC,"tool","h-"+id+".webp"))
  ? `${DOMAIN}/img/tool/h-${id}.webp` : `${DOMAIN}/img/og.jpg`;
```
   toolPage 내 OG_IMG_TAG를 `ogFor(t.id)` 기반으로 교체. (webp OG는 카톡/페북 지원됨. 트위터 구버전 호환이 걱정되면 jpg 사본 생성)
4. `og:image:width`/`og:image:height` 메타 추가

**수용 기준:** todayfortune.html의 og:image가 h-todayfortune 이미지. og 기본 이미지 200KB 이하. 카톡 디버거(https://developers.kakao.com/tool/debugger/sharing)에서 미리보기 확인은 사용자에게 요청.

**작업량:** 중 (2~3시간, 이미지 오염 리스크 포함)

---

## P1 — SEO·콘텐츠 격차 (다음 주)

### [ ] P1-1. 별자리 궁합 신규 도구 (키워드 약속 이행)

**목적:** horoscope 태그에 "별자리 궁합"이 있으나 도구가 없음. 검색 의도 불일치. "별자리 궁합"은 자체 검색량도 큰 키워드.

**대상:** `hub.html` TOOLS(horoscope 다음 위치), `build_site.js` 콘텐츠 맵 5곳(intro/tags/deep/guide/faq), `verify.js`

**구현:**
1. 도구 id `stargunghap`, cat 재미·운세. 입력: 두 사람 생년월일(또는 별자리 select 2개)
2. 로직 (기존 엔진 재사용, 새 천문 계산 불필요):
   - 원소 관계: 같은 원소(불-불 등)=조화 / 상생 조합(불-공기, 흙-물)=순풍 / 그 외(불-물, 흙-공기)=긴장 — index%4로 판정
   - 각도 관계: 두 별자리 거리 `dist=Math.min(k,12-k)` → 기존 `ST_ASP` 재사용 (0=합 … 6=오포지션)
   - 수호성 관계: `ST_ELE_RULERS` 활용, 서로의 수호성이 상대 원소와 맞으면 가점
   - 점수 = 원소(40%) + 각도(40%) + 수호성(20%), 35~99 클램프
3. 출력: 총점 + 끌림/대화/일상/롱런 4축 바 + `stCard` 2장(나/상대, gh-pair 그리드 재사용) + 원소 해설 + 각도 해설 + 조언. 목표 분량 600자 이상
4. build_site.js: FUN_TOP에 horoscope 다음 순서로 삽입, titleOverride `"별자리 궁합 — 12별자리 커플 궁합 무료"`
5. verify.js: 원소 판정 대칭성(`양자리-사자자리=같은 불`), 거리 계산, 배열 길이 테스트 추가

**수용 기준:** 12×12 전수 렌더에서 undefined/NaN 없음(스크래치패드 audit.js 패턴 재사용). verify 전체 통과. 도구 수 56→57 빌드 확인.

**작업량:** 중 (3~4시간)

### [ ] P1-2. 이달의 운세 섹션 (오늘의 운세 확장)

**목적:** "이달의 운세", "월간 운세"도 대형 키워드. 현재 일 단위만 있음.

**대상:** `hub.html` todayfortune 렌더

**구현:**
- 이번 달 월주(月柱)는 이미 sjPillars가 계산함. 이번 달 월간(月干)이 내 일간에 갖는 십성 → 기존 TXT 데이터 재사용해 "이번 달의 큰 흐름" 1문단
- 월지와 내 일지의 합충 → 보정 문장
- 출력 위치: "오늘의 기운" 섹션 뒤. 분량 +150자 내외

**수용 기준:** 845자 → 1,000자 이상. verify 통과.

**작업량:** 소 (1~2시간)

### [ ] P1-3. 캐시 헤더 (vercel.json)

**목적:** 이미지·app.js가 매 방문 재검증됨. 재방문 상품에서 낭비.

**대상:** `vercel.json`

**구현:**
```json
{
  "buildCommand": "node build_site.js",
  "outputDirectory": "site",
  "headers": [
    {"source": "/img/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=2592000, immutable"}]},
    {"source": "/(app.js|style.css)", "headers": [{"key": "Cache-Control", "value": "public, max-age=86400"}]}
  ]
}
```
주의: app.js는 콘텐츠 해시가 없으므로 max-age 1일로 제한. (장기적으로 P2-1에서 해시 파일명 도입 시 immutable로 상향)

**수용 기준:** 배포 후 `curl -sI https://gyesangi.vercel.app/img/hero.webp | grep -i cache-control` 에 max-age=2592000.

**작업량:** 소 (30분)

### [ ] P1-4. CLS 제거 — 이미지 치수 명시

**목적:** 히어로·캐릭터 카드 로드 시 레이아웃 점프.

**대상:** `hub.html`의 zoCard/stCard/타로 아트 img 태그, `build_site.js`의 히어로·toolhero·rcard img

**구현:**
- 고정 비율 이미지에 `width`/`height` 속성 추가: 캐릭터 카드 520×520, 히어로 배너 1000×667, 카테고리 1200×800, 히어로 1200×800
- CSS가 `width:100%`로 덮으므로 속성은 비율 힌트로만 작동 (aspect-ratio 이미 있는 곳은 유지)
- index의 히어로에 `fetchpriority="high"`, 나머지 전부 `loading="lazy"` 확인

**수용 기준:** Chrome DevTools Performance 패널에서 index/todayfortune CLS < 0.02.

**작업량:** 소 (1~2시간)

### [ ] P1-5. self-XSS 봉합 (이름궁합)

**목적:** 사용자 입력이 escape 없이 innerHTML 삽입. 현재 URL 주입 경로는 없어 저위험이나, 향후 쿼리 파라미터 프리필 도입 시 즉시 취약점이 됨.

**대상:** `hub.html` 공유 헬퍼 + namematch(및 텍스트 입력을 출력에 되쏘는 모든 도구 점검)

**구현:**
```js
function escH(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
```
namematch의 `'+A+'` → `'+escH(A)+'` 전부 치환. HELPERS 등록. draw(랜덤 뽑기)·ladder(사다리)도 같은 패턴이면 동일 처리.

**수용 기준:** 이름에 `<img src=x onerror=alert(1)>` 입력 → 화면에 문자 그대로 표시, 스크립트 미실행. verify에 escH 존재+미정의 호출 없음 통과.

**작업량:** 소 (1시간)

---

## P2 — 구조 개선 (여유 시)

### [ ] P2-1. app.js 페이지별 분리

**목적:** 155KB 모놀리스 → 페이지당 공유코어(엔진+헬퍼 ~40KB) + 해당 도구 코드만.

**대상:** `build_site.js`의 appJs 생성부

**구현 방향:**
- TOOLS 배열을 도구별 소스로 파싱하는 것은 이미 라인 기반으로 가능(`{id:"..."` 경계). `core.js`(헬퍼+엔진+mountTool) + `t-<id>.js`(해당 도구의 TOOLS 단일 요소 배열) 생성
- toolPage에서 `<script src="core.js"></script><script src="t-${t.id}.js"></script>`
- index는 검색용 메타만 필요하므로 도구 코드 불필요 → 별도 경량 스크립트
- **주의: 정규식 대량 편집 금지 원칙. 경계 파싱은 `\n  {id:"` 라인 스캔으로.** 파싱 결과 도구 수 56 검증을 빌드 스크립트 안에 assert로 내장
- 파일명에 콘텐츠 해시 8자리 부여(`core.a1b2c3d4.js`)하면 P1-3 캐시를 immutable로 상향 가능

**수용 기준:** todayfortune 페이지 JS 전송량 47KB→20KB(gzip) 이하. 56페이지 전부 mountTool 정상(빌드 후 전 페이지 스모크: node로 각 t-*.js eval + render 1회). verify 통과.

**작업량:** 대 (반나절, 회귀 리스크 있음 — 별도 커밋으로)

### [ ] P2-2. 접근성 기본선

**대상:** `hub.html` CSS/렌더, `build_site.js` 템플릿

**구현:**
1. 점수 바: `<span class="t" role="meter" aria-valuenow="86" aria-valuemin="0" aria-valuemax="100" aria-label="애정운 86점">` — bar() 계열 헬퍼 4곳(todayfortune/horoscope/zodiacfortune/gunghap/newyear) 일괄
2. 타로 카드: `tabindex="0" role="button" aria-label="과거 카드 뒤집기"` + keydown(Enter/Space) 핸들러
3. 등급 표기: 색 + 텍스트 병기(이미 "대길/길/평온/주의" 텍스트 있음 → 바에도 aria로)
4. `prefers-reduced-motion` 이미 일부 존재 — 타로 flip에도 적용됐는지 확인
5. 스킵 링크: toolPage 템플릿에 `<a class="skip" href="#tool">본문 바로가기</a>`

**수용 기준:** Lighthouse Accessibility 90+ (현재 추정 70대). 타로를 키보드만으로 3장 모두 뒤집기 가능.

**작업량:** 중 (3~4시간)

### [ ] P2-3. 운세 결과 이미지 저장 (카드 캡처)

**목적:** 공유 루프 강화 2단계. 텍스트 공유(P0-2)보다 전환 높은 이미지 공유.

**구현 방향:**
- 외부 라이브러리 없이 Canvas API로 결과 카드(점수+등급+한줄+브랜드) 1080×1350 렌더 → `canvas.toBlob` → `navigator.share({files})` 폴백 다운로드
- 폰트는 시스템 폰트로 제한(Pretendard 로컬 없음 주의). 캐릭터 이미지는 same-origin이라 taint 없음
- 도구별 템플릿 함수 1개(`fortuneCard(opts)`)를 공유 헬퍼로

**수용 기준:** 모바일에서 "이미지로 저장" → 갤러리에 1080×1350 PNG. 데스크톱 다운로드.

**작업량:** 대 (반나절)

### [ ] P2-4. 에러 모니터링 (최소)

**구현:** hub.html에 `window.addEventListener("error",...)` → `track('js_error',{m:e.message.slice(0,100)})` (P0-3의 track 재사용). 외부 서비스 불필요.

**작업량:** 소 (30분)

---

## 사용자 계정 필요 (코드로 불가 — 병목 순위 1)

| 항목 | 할 일 | 코드 반영 지점 |
|---|---|---|
| 커스텀 도메인 | `dongnebosal.com` 등 구매 → Vercel 연결 | `build_site.js` DOMAIN 상수 → 재빌드·재배포 → 301은 Vercel이 처리 |
| 구글 서치콘솔 | 속성 등록, HTML 태그 인증 선택 | `GSC_VERIFY`에 content 값 → 재빌드 |
| 네이버 서치어드바이저 | 사이트 등록 + 소유확인 | `NAVER_VERIFY` 상수 (구현 완료) |
| GA4 | 속성 생성 → 측정 ID | P0-3의 `ANALYTICS_ID` |
| 애드센스 | 승인 신청 (도메인 후 권장) | `ADSENSE_CLIENT`/`ADSENSE_SLOT` → ads.txt 자동 생성 |

**순서 중요: 도메인 → 서치콘솔/네이버 → 애드센스.** vercel.app 서브도메인으로 애드센스 신청하면 승인 확률이 급락하고, 도메인 변경 시 색인이 리셋됨.

## 실행 순서 요약

```
1주차: P0-1 → P0-2 → P0-3(코드만) → P0-4          [재방문·공유·측정]
2주차: P1-1 → P1-2 → P1-3 → P1-4 → P1-5          [SEO 격차·기술 부채]
이후:  P2-1 → P2-2 → P2-3 → P2-4                  [구조·품질]
상시:  사용자 계정 작업 병행 (도메인이 전체 병목)
```

## 공통 완료 조건 (모든 태스크)

1. `node verify.js` 전체 통과 (새 헬퍼는 HELPERS 등록)
2. `node build_site.js` 후 도구 수 확인
3. 커밋 → push → `vercel --prod` → **`vercel alias set <URL> gyesangi.vercel.app`** (누락 시 라이브 미반영)
4. 라이브에서 해당 페이지 1개 이상 실제 동작 확인 (브라우저 도구)
5. 콘텐츠 변경 시 IndexNow 재제출
