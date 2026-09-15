# 동네보살 1~3단계 구현 계획 — 계측·게이트 → 만세력 월력 132 → 일주 60

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 크롤러가 읽을 페이지를 164 → 356으로 늘리되, 매 단계 자동 게이트(중복·분량)를 통과한 것만 배포한다.

**Architecture:** `hub.html`(단일 소스: CSS + TOOLS + 엔진) → `build_site.js` → `site/`. 새 페이지군은 `content_*.js` 원고 파일 + `build_site.js`의 생성 함수 한 쌍으로 추가한다. 기존 `seoPage(o)` 헬퍼를 그대로 쓴다. 검증은 `verify.js`(현재 197개)에 테스트를 추가하는 방식이고, 빌드가 `verify.js`를 먼저 돌려 실패하면 중단한다.

**Tech Stack:** Node.js (프레임워크 없음), 테스트 하네스는 `verify.js`의 `t(name, got, want)`, 배포는 `vercel --prod --yes`.

**참조 스펙:** `docs/superpowers/specs/2026-09-15-dongnebosal-seo-monetization-design.md`

---

## 이 계획을 시작하기 전에 알아야 할 것

### 코드베이스 규칙 (어기면 빌드가 막히거나 화면에 오류가 나간다)

1. **`site/` 폴더는 절대 직접 편집하지 않는다.** 빌드 산출물이고 매 빌드마다 `fs.rmSync`로 통째로 지워진다. 고칠 것은 `hub.html` 또는 `build_site.js`에 있다.
2. **조사(助詞)를 하드코딩하지 않는다.** 조립된 변수 뒤에 `"이"`, `"가"`, `"을"`, `"과"` 같은 글자를 직접 붙이면 `verify.js`가 잡아서 빌드를 막는다. `josa(word, "무받침/받침")`을 쓴다. 예: `josa(x, "가/이")` → 받침 없으면 "가", 있으면 "이".
3. **문체가 두 가지다.**
   - `hub.html`의 도구 안(`TXT` 등) = **보살 말투**. "자네" + `~일세/하게/네/야`
   - `content_*.js`의 SEO 원고 = **존댓말**. 검색으로 들어온 사람이 읽는 글
   - 계산 근거 고지(`.note`, 회색) = **존댓말**
   한 페이지에 두 말투를 섞지 않는다.
4. **파일 줄바꿈은 CRLF다.** 패치 스크립트를 쓸 때 `const NL = s.includes("\r\n") ? "\r\n" : "\n"` 으로 맞춘다.
5. **`gunghap:`은 `stargunghap:`의 부분문자열이다.** 문자열 검색으로 맵을 찾을 때 앞 글자 경계를 확인하지 않으면 엉뚱한 곳을 짚는다. 이 함정으로 실제 오진이 한 번 있었다.

### 빌드·검증 명령
```bash
node verify.js        # 197개 테스트. 실패하면 exit 1
node build_site.js    # 내부에서 verify.js를 먼저 돌린다. 실패 시 빌드 중단
```

`site/` 폴더를 정적 서버로 띄워두면 `build_site.js`가 `EPERM`으로 실패한다. 서버는 리포 루트에서 경로 인자로 띄운다:
```bash
npx --yes http-server ./site -p 8099 -c-1 --silent
```

### 측정을 먼저 의심한다
이 프로젝트에서 "제품이 깨졌다"고 판단했다가 측정 도구 문제였던 사례가 4건 있었다.
- `file://`의 CORS로 `cssRules` 접근 불가 → "매칭 규칙 0건"
- Browser pane이 뷰포트를 0으로 보고 → 스크린샷 전부 검은 화면
- `gunghap:`이 `stargunghap:`에 먼저 걸림
- 이 계획을 쓰는 중에도 절기 스크립트의 연도 계산 버그로 "525949분 차이"가 나왔다 (실제는 0분)

0%·100%·비정상적으로 큰 값이 나오면 집계 대신 원본 입력을 눈으로 읽는다.

---

## 파일 구조

### 새로 만드는 파일
| 파일 | 책임 |
|---|---|
| `tools/gate.js` | 중복(3-gram 자카드)·얇은 콘텐츠 게이트. 페이지군 이름을 인자로 받아 `site/`의 결과물을 검사하고 실패 시 exit 1 |
| `content_manse.js` | 월력 페이지의 월별 고유 문단 재료 (12개월 × 계절 서술, 24절기 이름·황경) |
| `content_ilju.js` | 일주 페이지의 **일지 12 원고**. 배우자 자리로서의 지지 해설 (일진의 "그 날 기운"과 다른 글) |

### 고치는 파일
| 파일 | 무엇을 |
|---|---|
| `hub.html` | ① 24절기 일반 함수 `sjTermJd` 추가 ② 결과 공유 바 `shareBar()` 추가 |
| `build_site.js` | ① `ENGINE` 반환 목록에 `sjTermJd` 추가 ② `MANSE_PAGES` + `mansePage()` ③ `ILJU_PAGES` + `iljuPage()` ④ 사이트맵·llms.txt에 두 페이지군 추가 ⑤ `iljin-*`에 일주 페이지 상호 링크 |
| `verify.js` | 절기 함수·공유 바·새 페이지군에 대한 테스트 추가 |

### 페이지 증감
```
164 (현재)  →  +132 (월력)  →  +60 (일주)  →  356
```

---

## Task 0: GA4 측정 ID (사용자 대기 · 코드 한 줄)

스펙 6절 1단계에 들어 있지만 **코드 작업이 아니다.** 배선은 이미 되어 있다 (`build_site.js:822`가 `ANALYTICS_ID`를 보고 gtag 로더를 넣는다).

- [ ] **Step 1: 사용자에게 GA4 측정 ID를 요청한다**

계정 로그인이 필요해 대신 할 수 없다. 사용자가 `G-XXXXXXXXXX` 형식의 ID를 주면:

```js
// build_site.js:14
const ANALYTICS_ID = "G-XXXXXXXXXX";
```

- [ ] **Step 2: 주입됐는지 확인한다**

```bash
node build_site.js && grep -c "googletagmanager" site/index.html site/saju.html
```
기대: 둘 다 `1`

ID를 아직 못 받았으면 **이 태스크를 건너뛰고 Task 1로 간다.** 나머지 작업은 GA4 없이도 전부 진행된다. 다만 배포 후 효과를 숫자로 확인할 수 없으므로, 받는 즉시 채운다.

---

## Task 1: 게이트 스크립트 — 중복·분량 검사

스펙 7절의 게이트 2·3번. **이걸 먼저 만든다.** 이후 모든 페이지군이 이걸로 검사받는다.

**Files:**
- Create: `tools/gate.js`
- Test: `tools/gate.test.js`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`tools/gate.test.js` 생성:

```js
/* gate.js 자체 검사. 프레임워크 없이 assert 로만. 실행: node tools/gate.test.js */
const assert = require("assert");
const { textOf, grams, jaccard, checkGroup } = require("./gate.js");

// 1) textOf: script/style/태그를 걷어내고 본문만 남긴다
{
  const html = `<html><head><style>.a{color:red}</style></head><body>
    <p>안녕하세요</p><script>var x=1;</script><div>반갑습니다</div></body></html>`;
  const t = textOf(html);
  assert.ok(t.includes("안녕하세요"), "본문이 남아야 한다");
  assert.ok(t.includes("반갑습니다"), "본문이 남아야 한다");
  assert.ok(!t.includes("var x"), "script 내용은 빠져야 한다");
  assert.ok(!t.includes("color:red"), "style 내용은 빠져야 한다");
}

// 2) jaccard: 같은 글은 1, 완전히 다른 글은 0에 가깝다
{
  const a = grams("가나다라마바사아자차카타파하");
  assert.strictEqual(jaccard(a, a), 1, "자기 자신과는 1");
  const b = grams("ABCDEFGHIJKLMNOP");
  assert.ok(jaccard(a, b) < 0.05, "겹치지 않는 글은 0에 가깝다");
}

// 3) checkGroup: 임계값을 넘으면 ok:false 와 이유를 돌려준다
{
  const same = "같은 문장이 반복되는 아주 긴 본문입니다. ".repeat(80);
  const docs = [
    { id: "a", text: same },
    { id: "b", text: same },
  ];
  const r = checkGroup(docs, { maxMean: 0.75, maxMax: 0.85, minChars: 2000 });
  assert.strictEqual(r.ok, false, "똑같은 문서 둘은 중복으로 잡혀야 한다");
  assert.ok(/유사도/.test(r.reasons.join(" ")), "이유에 유사도가 나와야 한다");
}

// 4) checkGroup: 짧은 본문은 분량 미달로 잡는다
{
  const docs = [
    { id: "a", text: "짧다" },
    { id: "b", text: "이것도 짧다" },
  ];
  const r = checkGroup(docs, { maxMean: 0.75, maxMax: 0.85, minChars: 2000 });
  assert.strictEqual(r.ok, false, "짧은 본문은 막아야 한다");
  assert.ok(/분량/.test(r.reasons.join(" ")), "이유에 분량이 나와야 한다");
}

// 5) checkGroup: 충분히 다르고 충분히 길면 통과
{
  const mk = seed => (seed + " 서로 다른 내용을 담은 문단입니다. ").repeat(60) +
    seed.repeat(400);
  const docs = [
    { id: "a", text: mk("가나다") },
    { id: "b", text: mk("ABCDEF") },
    { id: "c", text: mk("１２３４") },
  ];
  const r = checkGroup(docs, { maxMean: 0.75, maxMax: 0.85, minChars: 2000 });
  assert.strictEqual(r.ok, true, "통과해야 한다: " + r.reasons.join(" | "));
}

console.log("✅ gate.test.js 전부 통과");
```

- [ ] **Step 2: 실패를 확인한다**

```bash
node tools/gate.test.js
```
기대: `Cannot find module './gate.js'` 로 실패

- [ ] **Step 3: 최소 구현을 쓴다**

`tools/gate.js` 생성:

```js
/* 새 페이지군이 배포돼도 되는지 판정한다.
   - 중복: 구글은 본문이 거의 같은 페이지를 하나만 색인하고 나머지를 버린다
   - 분량: 얇은 페이지는 색인돼도 순위가 안 나오고 사이트 전체 평가를 깎는다
   기준값 근거: 기존 일진 60 페이지 실측이 평균 67.8%, 최대 73.2%였다. */
const fs = require("fs");
const path = require("path");

const textOf = html => {
  const b = html.slice(html.indexOf("<body"));
  return b.replace(/<script[\s\S]*?<\/script>/g, " ")
          .replace(/<style[\s\S]*?<\/style>/g, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
};

const grams = s => {
  const g = new Set();
  for (let i = 0; i < s.length - 3; i++) g.add(s.slice(i, i + 3));
  return g;
};

const jaccard = (a, b) => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const uni = a.size + b.size - inter;
  return uni === 0 ? 1 : inter / uni;
};

/* docs: [{id, text}], opts: {maxMean, maxMax, minChars}
   돌려주는 것: {ok, mean, max, maxPair, shortest, reasons[]} */
function checkGroup(docs, opts) {
  const reasons = [];
  const withG = docs.map(d => ({ ...d, g: grams(d.text) }));

  // 분량
  const shortest = docs.reduce((a, d) => d.text.length < a.text.length ? d : a);
  if (shortest.text.length < opts.minChars) {
    reasons.push(`분량 미달: ${shortest.id} ${shortest.text.length}자 (기준 ${opts.minChars}자)`);
  }

  // 중복 — 모든 쌍
  let sum = 0, n = 0, max = 0, maxPair = "";
  for (let i = 0; i < withG.length; i++)
    for (let j = i + 1; j < withG.length; j++) {
      const s = jaccard(withG[i].g, withG[j].g);
      sum += s; n++;
      if (s > max) { max = s; maxPair = `${withG[i].id} ↔ ${withG[j].id}`; }
    }
  const mean = n ? sum / n : 0;
  if (mean > opts.maxMean) reasons.push(`평균 유사도 ${(mean*100).toFixed(1)}% > 기준 ${(opts.maxMean*100)}%`);
  if (max > opts.maxMax)  reasons.push(`최대 유사도 ${(max*100).toFixed(1)}% (${maxPair}) > 기준 ${(opts.maxMax*100)}%`);

  return { ok: reasons.length === 0, mean, max, maxPair, shortest, reasons };
}

/* site/ 에서 접두사로 파일을 모아 검사한다 */
function checkFiles(dir, prefix, opts) {
  const files = fs.readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith(".html"));
  if (!files.length) return { ok: false, reasons: [`${prefix}* 파일이 없다`], mean: 0, max: 0 };
  const docs = files.map(f => ({ id: f, text: textOf(fs.readFileSync(path.join(dir, f), "utf8")) }));
  return { ...checkGroup(docs, opts), count: files.length };
}

module.exports = { textOf, grams, jaccard, checkGroup, checkFiles };

// CLI: node tools/gate.js <접두사> [최소글자수]
if (require.main === module) {
  const prefix = process.argv[2];
  const minChars = +(process.argv[3] || 2000);
  if (!prefix) { console.error("사용법: node tools/gate.js <파일접두사> [최소글자수]"); process.exit(2); }
  const r = checkFiles(path.join(__dirname, "..", "site"), prefix, { maxMean: 0.75, maxMax: 0.85, minChars });
  console.log(`${prefix}*  ${r.count || 0}개`);
  console.log(`  평균 유사도 ${(r.mean*100).toFixed(1)}%   최대 ${(r.max*100).toFixed(1)}%${r.maxPair ? " ("+r.maxPair+")" : ""}`);
  if (r.shortest) console.log(`  최소 분량 ${r.shortest.id} ${r.shortest.text.length}자`);
  if (r.ok) { console.log("  ✅ 통과"); }
  else { console.log("  ❌ 막힘:"); r.reasons.forEach(x => console.log("     - " + x)); process.exit(1); }
}
```

- [ ] **Step 4: 통과를 확인한다**

```bash
node tools/gate.test.js
```
기대: `✅ gate.test.js 전부 통과`

- [ ] **Step 5: 기존 일진 60에 돌려 기준값을 재확인한다**

```bash
node build_site.js && node tools/gate.js iljin- 2000
```
기대: 60개, 평균 약 67~68%, 최대 약 73%, `✅ 통과`

스펙에 적힌 기준(평균 67.8% / 최대 73.2%)과 크게 다르면 **게이트 구현을 의심한다.** 제품은 그동안 안 바뀌었다.

- [ ] **Step 6: 커밋**

```bash
git add tools/gate.js tools/gate.test.js
git commit -m "Add duplicate and thin-content gate for generated page groups"
```

---

## Task 2: 결과 공유 바

스펙 5.5. 현재 공유 수단이 0이다. 앱키가 필요 없는 Web Share API + 클립보드 복사만 쓴다.

**Files:**
- Modify: `hub.html` (공유 함수 추가 + `saju` 도구 결과에 호출)
- Modify: `verify.js` (개인정보 유출 방지 테스트)

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`verify.js` 맨 끝의 `console.log("\n결과: " + pass ...)` **바로 위**에 추가:

```js
// 공유 문구에 생년월일이 들어가면 개인정보가 링크를 타고 퍼진다.
// 함수 본문과 '호출부'를 둘 다 본다 — 위험한 값은 호출할 때 넘어간다.
const shareAt = src.indexOf("function shareBar");
t("shareBar 함수 존재", shareAt >= 0, true);
const shareSrc = shareAt < 0 ? "" : src.slice(shareAt, shareAt + 1400);
t("공유 URL에 쿼리스트링 없음", /location\.href\.split\("\?"\)\[0\]/.test(shareSrc), true);

// 호출부: shareBar(el, ...) 의 두 번째 인자에 생일 관련 값이 들어가면 막는다.
// loadPrefs().birth, d.value, #d 의 값, 연/월/일 변수 등이 대상이다.
const shareCalls = [...src.matchAll(/shareBar\s*\(([^;]{0,300}?)\)\s*;/g)].map(m => m[1]);
t("shareBar 호출이 최소 1개", shareCalls.length >= 1, true);
const leaky = shareCalls.filter(a =>
  /\bbirth\b|loadPrefs|\bd\.value|getElementById\(["']d["']\)|querySelector\(["']#d["']\)/.test(a));
t("공유 인자에 생년월일 값 없음", leaky.length, 0);
if (leaky.length) console.log("   ⚠ 공유 인자에 생일:", leaky.join(" | "));
```

- [ ] **Step 2: 실패를 확인한다**

```bash
node verify.js 2>&1 | tail -6
```
기대: `❌ shareBar 함수 존재 → false` 를 포함해 4개 실패, `결과: 197 통과 / 4 실패`

- [ ] **Step 3: 최소 구현을 쓴다**

`hub.html`에서 `function josa(` 를 찾아 그 **바로 앞**에 추가 (엔진 슬라이스 범위 밖이어야 한다 — `// ---------- shared` 뒤):

```js
  /* 결과 공유. 카카오 SDK는 앱키가 필요해 쓰지 않는다.
     공유 URL에 생년월일을 담지 않는다 — 링크가 퍼지면 개인정보가 같이 퍼진다.
     요약 문장만 담고 주소는 도구 페이지 그대로 보낸다. */
  function shareBar(el, summary){
    var url = location.href.split("?")[0];
    var text = summary + "\n너도 해봐 → " + url;
    var box = document.createElement("div");
    box.className = "sharebar";
    box.innerHTML = '<button type="button" id="shr">공유하기</button>'+
                    '<button type="button" id="cpy">주소 복사</button>'+
                    '<span class="shmsg" id="shmsg"></span>';
    el.appendChild(box);
    var msg = box.querySelector("#shmsg");
    var say = function(s){ msg.textContent = s; setTimeout(function(){ msg.textContent = ""; }, 2000); };
    box.querySelector("#shr").onclick = function(){
      if (navigator.share) { navigator.share({ text: text }).catch(function(){}); }
      else { navigator.clipboard.writeText(text).then(function(){ say("복사했습니다"); },
                                                      function(){ say("복사에 실패했습니다"); }); }
    };
    box.querySelector("#cpy").onclick = function(){
      navigator.clipboard.writeText(url).then(function(){ say("주소를 복사했습니다"); },
                                              function(){ say("복사에 실패했습니다"); });
    };
  }
```

`hub.html`의 CSS 영역(`.tool button` 규칙 근처)에 추가:

```css
  .sharebar{display:flex;gap:8px;align-items:center;margin-top:14px;flex-wrap:wrap}
  .sharebar button{padding:9px 14px;border:1px solid var(--line);border-radius:10px;
    background:var(--surface-2) !important;color:var(--fg) !important;font:inherit;font-size:13px;cursor:pointer}
  .shmsg{font-size:12.5px;color:var(--muted)}
```

> `.tool button`에 `!important` 배경 규칙이 있어 그냥 두면 보라색으로 칠해진다. 위처럼 `!important`로 되받거나 `<span role="button">`을 쓴다. 이 함정으로 실제 버그가 한 번 있었다.

- [ ] **Step 4: 통과를 확인한다**

```bash
node verify.js 2>&1 | tail -6
```
기대: `결과: 201 통과 / 0 실패`

- [ ] **Step 5: saju 결과에서 호출한다**

`hub.html`의 saju 도구에서 결과 HTML을 `el.innerHTML = ...` 로 넣은 **직후**에 한 줄 추가. 요약에는 일간과 오행만 담는다 (생년월일 금지):

```js
      shareBar(el, "내 일간은 " + SJ_S[p.d.s] + SJ_SH[p.d.s] + ", 오행은 " + mx + josa(mx, "가/이") + " 가장 세대.");
```

- [ ] **Step 6: 실제로 눌러서 확인한다**

```bash
node build_site.js
npx --yes http-server ./site -p 8099 -c-1 --silent &
```

그다음 Browser 도구로 `http://localhost:8099/saju.html`을 열어 생년월일을 넣고 결과를 뽑은 뒤, 공유 버튼이 실제로 보이는지와 클립보드 내용에 생년월일이 없는지 확인한다:

```js
// javascript_tool 로 실행
document.querySelector("#tool #go").click();
await new Promise(r => setTimeout(r, 1200));
const bar = document.querySelector(".sharebar");
({ 공유바있음: !!bar,
   버튼수: bar ? bar.querySelectorAll("button").length : 0,
   배경색: bar ? getComputedStyle(bar.querySelector("button")).backgroundColor : null })
```
기대: `공유바있음: true`, `버튼수: 2`, 배경색이 보라색(`rgb(...)` 강조색)이 **아닐** 것

- [ ] **Step 7: 커밋**

```bash
git add hub.html verify.js
git commit -m "Add result sharing without putting the birthdate in the URL"
```

---

## Task 3: 24절기 일반 함수

월력 페이지에 절기 시각을 넣으려면 필요하다. 엔진에는 입춘(`sjIpchun`)만 있다.

**정밀도는 이미 실측했다** (`scratchpad/term-precision.js`): 일반화 함수의 입춘이 기존 `sjIpchun`과 2000·2026·2030년 모두 **0.00분** 일치했고, 포스텔러 만세력 표시값과 백로 −3분 / 추분 0분이었다. 시각까지 표시해도 된다.

**Files:**
- Modify: `hub.html` (`sjIpchun` 바로 아래에 추가)
- Modify: `build_site.js` (`ENGINE` 반환 목록)
- Modify: `verify.js`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`verify.js`의 만세력 검증 구역(`// ── 만세력: 문헌 검증값 ──` 아래, `p = sjPillars(1900,...)` 근처)에 추가:

```js
// ── 24절기 ──
// 기존 sjIpchun 과 일반 함수가 어긋나면 월주 판정과 절기 표시가 서로 다른 말을 한다
const kst = jd => { // JD → KST 달력 (verify 안에서만 쓰는 역변환)
  const z = Math.floor(jd + 0.5 + 9/24), f = (jd + 0.5 + 9/24) - z;
  let a = z; if (z >= 2299161){ const al = Math.floor((z-1867216.25)/36524.25); a = z+1+al-Math.floor(al/4); }
  const b = a+1524, c = Math.floor((b-122.1)/365.25), d0 = Math.floor(365.25*c), e = Math.floor((b-d0)/30.6001);
  const day = b-d0-Math.floor(30.6001*e), mo = e<14 ? e-1 : e-13, yr = mo>2 ? c-4716 : c-4715;
  const mins = Math.round(f*1440);
  return { y:yr, mo, d:day, h:Math.floor(mins/60)%24, mi:mins%60 };
};
const fmtT = o => `${o.y}-${String(o.mo).padStart(2,"0")}-${String(o.d).padStart(2,"0")} ${String(o.h).padStart(2,"0")}:${String(o.mi).padStart(2,"0")}`;

for (const y of [2000, 2026, 2030]) {
  const diffMin = Math.abs(sjTermJd(y, 315) - sjIpchun(y)) * 1440;
  t(`${y} 입춘: 일반 절기 함수가 sjIpchun과 1분 이내`, diffMin < 1, true);
}
// 외부 대조 — 포스텔러 만세력 2026년 9월 표시값 (스크린샷)
t("2026 백로 날짜", fmtT(kst(sjTermJd(2026, 165))).slice(0,10), "2026-09-07");
t("2026 추분 날짜", fmtT(kst(sjTermJd(2026, 180))).slice(0,10), "2026-09-23");
// 시각은 ±5분 허용 (Meeus 근사)
const bkMin = (o => o.h*60+o.mi)(kst(sjTermJd(2026, 165)));
t("2026 백로 시각 23:40 ±5분", Math.abs(bkMin - (23*60+40)) <= 5, true);
```

- [ ] **Step 2: 실패를 확인한다**

```bash
node verify.js 2>&1 | tail -8
```
기대: `sjTermJd is not defined` 로 죽거나 해당 테스트들이 ❌

- [ ] **Step 3: 최소 구현을 쓴다**

`hub.html`에서 `function sjIpchun(y){` 블록이 끝나는 `return (lo+hi)/2;}` **바로 다음 줄**에 추가:

```js
  // 24절기 일반형 — 황경 deg 에 태양이 닿는 순간(KST JD). sjIpchun(315°)의 일반화.
  // 315°(입춘)처럼 연초 근사일이 한 해를 넘기는 값은 한 해 빼준다.
  function sjTermJd(y,deg){
    var approx=79+deg*365.2422/360; if(approx>365.2422)approx-=365.2422;
    var lo=sjJdKST(y,1,1,0,0)+approx-5, hi=lo+10;
    var norm=function(x){return ((x%360)+360)%360;};
    for(var i=0;i<60;i++){var mid=(lo+hi)/2;
      (norm(sjSunLong(mid)-deg)<180)?hi=mid:lo=mid;}
    return (lo+hi)/2;}
  // 절기 24개 — [이름, 황경]. 입춘(315°)부터 한 해가 시작한다.
  var SJ_TERM=[["입춘",315],["우수",330],["경칩",345],["춘분",0],["청명",15],["곡우",30],
    ["입하",45],["소만",60],["망종",75],["하지",90],["소서",105],["대서",120],
    ["입추",135],["처서",150],["백로",165],["추분",180],["한로",195],["상강",210],
    ["입동",225],["소설",240],["대설",255],["동지",270],["소한",285],["대한",300]];
```

- [ ] **Step 4: 통과를 확인한다**

```bash
node verify.js 2>&1 | tail -10
```
기대: `결과: 207 통과 / 0 실패` (201 + 입춘 3 + 날짜 2 + 시각 1)

- [ ] **Step 5: `ENGINE` 반환 목록에 넣는다**

`build_site.js`의 `const ENGINE = new Function(` 블록에서 반환 문자열 끝부분을 고친다:

```js
  "stOf,ST_KO,ST_SYM,ST_RANGE,ST_ELE,ST_RULER,ST_ASP,sjTermJd,SJ_TERM};")();
```

- [ ] **Step 6: 빌드가 깨지지 않는지 확인한다**

```bash
node build_site.js 2>&1 | tail -3
```
기대: `✅ 생성 완료: 55 개 도구 페이지 + index + sitemap + robots`

- [ ] **Step 7: 커밋**

```bash
git add hub.html build_site.js verify.js
git commit -m "Generalize the solar-term solver from ipchun to all 24 terms"
```

---

## Task 4: 월력 원고 재료

**Files:**
- Create: `content_manse.js`

- [ ] **Step 1: 원고 파일을 만든다**

각 달에 **고유 문단**이 있어야 얇은 콘텐츠 게이트를 통과한다. 달마다 다른 것: 절기 2개, 계절, 그 달에 드는 명절, 월지(月支).

`content_manse.js` 생성:

```js
/* 만세력 월력 페이지의 월별 재료.
   날짜별 일진·음력·절기 시각은 엔진이 계산한다. 이 파일에는 지어낸 문장만 있다.
   문체: 존댓말 (SEO 원고). 보살 말투는 hub.html 도구 안에만 둔다. */

// 양력 달 → 그 달에 드는 절기 두 개 (절입일이 월주를 가른다)
const MONTH_TERMS = {
  1:["소한","대한"], 2:["입춘","우수"], 3:["경칩","춘분"], 4:["청명","곡우"],
  5:["입하","소만"], 6:["망종","하지"], 7:["소서","대서"], 8:["입추","처서"],
  9:["백로","추분"], 10:["한로","상강"], 11:["입동","소설"], 12:["대설","동지"],
};

// 양력 달 → 그 달의 성격. 달마다 다른 문장이어야 중복 게이트를 통과한다.
const MONTH_TEXT = {
  1: { season:"한겨울", ji:"축(丑)",
    lead:`1월은 소한과 대한이 드는 달입니다. 이름은 작은 추위와 큰 추위지만 실제로 가장 추운 구간이 여기 들어 있습니다.`,
    body:`사주에서 1월은 대개 축월(丑月)입니다. 축토는 얼어 있는 흙이라 안에 물기를 머금고도 밖으로 내놓지 못합니다. 이 달에 태어난 사람은 속으로 쌓아두는 힘이 강하고, 겉으로 드러나기까지 시간이 걸립니다.
다만 절기로 갈리므로 1월 초에 태어났다면 앞 달인 자월(子月)일 수 있습니다. 소한 절입 시각 이전이면 12월생과 같은 월주를 씁니다.` },
  2: { season:"늦겨울에서 이른봄", ji:"인(寅)",
    lead:`2월은 입춘과 우수가 드는 달입니다. 입춘은 사주에서 한 해가 바뀌는 날이라 열두 절기 가운데 가장 무겁게 봅니다.`,
    body:`입춘 이전에 태어났다면 달력상 해가 아니라 앞 해의 간지를 씁니다. 1월생과 2월 초생이 "내 띠가 뭐냐"로 헷갈리는 이유가 여기 있습니다.
입춘 이후는 인월(寅月)입니다. 인목은 언 땅을 뚫고 나오는 첫 기운이라 시작하는 힘이 강한 대신 아직 받쳐주는 것이 얇습니다.` },
  3: { season:"봄", ji:"묘(卯)",
    lead:`3월은 경칩과 춘분이 드는 달입니다. 춘분에 낮과 밤이 같아지고 이후로 낮이 길어집니다.`,
    body:`경칩 이후는 묘월(卯月)입니다. 묘목은 곧게 뻗기보다 옆으로 번지는 기운이라 이 달의 목은 부드럽고 촘촘합니다.
춘분은 태양 황경 0도라 이 사이트의 만세력 계산에서 기준점이 되는 절기입니다.` },
  4: { season:"늦봄", ji:"진(辰)",
    lead:`4월은 청명과 곡우가 드는 달입니다. 곡우는 곡식을 기르는 비라는 뜻입니다.`,
    body:`청명 이후는 진월(辰月)입니다. 진토는 물기를 품은 봄의 흙이라 목의 기운을 아직 받쳐줍니다. 사주에서 진은 수(水)의 창고로도 보아 진월생은 안에 담아두는 힘이 있습니다.` },
  5: { season:"초여름", ji:"사(巳)",
    lead:`5월은 입하와 소만이 드는 달입니다. 입하부터 여름으로 봅니다.`,
    body:`입하 이후는 사월(巳月)입니다. 사화는 아직 뜨겁지는 않지만 방향이 확실히 위로 잡힌 불입니다. 사주에서 사는 금(金)의 장생지이기도 해서, 겉은 화인데 안에 금이 자라는 자리로 읽습니다.` },
  6: { season:"여름", ji:"오(午)",
    lead:`6월은 망종과 하지가 드는 달입니다. 하지에 낮이 가장 깁니다.`,
    body:`망종 이후는 오월(午月)입니다. 오화는 한낮의 불이라 열두 지지 가운데 화 기운이 가장 셉니다. 오월생은 드러내는 힘이 강하고 숨기는 데 서툽니다.
하지를 지나면 낮이 다시 짧아지므로, 명리에서는 하지를 양이 꺾이기 시작하는 지점으로 봅니다.` },
  7: { season:"한여름", ji:"미(未)",
    lead:`7월은 소서와 대서가 드는 달입니다. 대서 무렵이 실제로 가장 덥습니다.`,
    body:`소서 이후는 미월(未月)입니다. 미토는 바짝 마른 여름의 흙입니다. 사주에서 미는 목(木)의 창고라, 겉은 토인데 안에 목이 갇혀 있는 자리로 읽습니다.` },
  8: { season:"늦여름에서 이른가을", ji:"신(申)",
    lead:`8월은 입추와 처서가 드는 달입니다. 입추부터 가을로 보지만 더위는 처서까지 갑니다.`,
    body:`입추 이후는 신월(申月)입니다. 신금은 여름의 열기 속에서 처음 단단해지는 쇠라 이 달의 금은 아직 날이 서지 않았습니다. 신은 수(水)의 장생지이기도 합니다.` },
  9: { season:"가을", ji:"유(酉)",
    lead:`9월은 백로와 추분이 드는 달입니다. 추분에 다시 낮과 밤이 같아지고 이후로 밤이 길어집니다.`,
    body:`백로 이후는 유월(酉月)입니다. 유금은 벼려진 금이라 열두 지지 가운데 금 기운이 가장 맑습니다. 유월생은 가리는 눈이 밝고 어설픈 것을 견디지 못합니다.` },
  10:{ season:"늦가을", ji:"술(戌)",
    lead:`10월은 한로와 상강이 드는 달입니다. 상강은 서리가 내린다는 뜻입니다.`,
    body:`한로 이후는 술월(戌月)입니다. 술토는 가을 끝의 마른 흙이고 사주에서는 화(火)의 창고로 봅니다. 겉은 차게 식었는데 안에 불이 남아 있는 자리입니다.` },
  11:{ season:"초겨울", ji:"해(亥)",
    lead:`11월은 입동과 소설이 드는 달입니다. 입동부터 겨울로 봅니다.`,
    body:`입동 이후는 해월(亥月)입니다. 해수는 깊고 넉넉한 물이며 목(木)의 장생지입니다. 겉으로는 가장 고요한 달인데 안에서는 다음 봄이 시작됩니다.` },
  12:{ season:"한겨울", ji:"자(子)",
    lead:`12월은 대설과 동지가 드는 달입니다. 동지에 밤이 가장 깁니다.`,
    body:`대설 이후는 자월(子月)입니다. 자수는 한밤중의 물이라 수 기운이 가장 짙습니다.
동지는 음이 끝까지 간 뒤 양이 처음 돌아오는 날이라, 옛날에는 동지를 한 해의 시작으로 보기도 했습니다. 팥죽을 쑤는 풍습이 여기서 나왔습니다.` },
};

// 양력 기준 고정 명절·기념일 (음력 명절은 엔진이 계산한다)
const SOLAR_HOLIDAYS = {
  "1-1":"신정", "3-1":"삼일절", "5-5":"어린이날", "6-6":"현충일",
  "8-15":"광복절", "10-3":"개천절", "10-9":"한글날", "12-25":"성탄절",
};

module.exports = { MONTH_TERMS, MONTH_TEXT, SOLAR_HOLIDAYS };
```

- [ ] **Step 2: 원고가 로드되는지 확인한다**

```bash
node -e "const m=require('./content_manse.js');console.log('달 수',Object.keys(m.MONTH_TEXT).length);console.log('9월 절기',m.MONTH_TERMS[9].join(','));console.log('9월 본문',(m.MONTH_TEXT[9].lead+m.MONTH_TEXT[9].body).length+'자');"
```
기대: `달 수 12`, `9월 절기 백로,추분`, 본문 200자 이상

- [ ] **Step 3: 커밋**

```bash
git add content_manse.js
git commit -m "Add per-month copy for the 万歳暦 calendar pages"
```

---

## Task 5: 월력 132 페이지 생성

**Files:**
- Modify: `build_site.js`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`verify.js` 끝의 결과 출력 바로 위에 추가:

```js
// 월력 페이지가 빌드에 연결됐는지 — 사이트맵에 빠지면 크롤러가 못 찾는다
t("build_site에 MANSE_PAGES 존재", /const MANSE_PAGES\s*=/.test(bs), true);
t("사이트맵에 월력 포함", /MANSE_PAGES\.map\(p=>smUrl\("manse-/.test(bs), true);
```

- [ ] **Step 2: 실패를 확인한다**

```bash
node verify.js 2>&1 | tail -5
```
기대: 위 2개가 ❌, `결과: 207 통과 / 2 실패`

- [ ] **Step 3: 페이지 목록과 생성 함수를 쓴다**

`build_site.js`의 `const ILJIN_PAGES = Array.from(...)` 블록 **바로 앞**에 추가:

```js
const MANSE_SRC = require("./content_manse.js");
// UMD 번들이라 require() 가 생성자 함수를 그대로 돌려준다 (.KoreanLunarCalendar 아님).
// 132개 페이지마다 다시 불러오지 않도록 여기서 한 번만 잡는다.
const KoreanLunarCalendar = require("./vendor-lunar.js");

/* 만세력 월력 — 2020~2030 × 12개월 = 132.
   그 달 날짜별 일진·음력·절기 시각을 엔진이 직접 계산한다.
   달마다 절기 두 개와 고유 문단이 달라 본문이 겹치지 않는다. */
const MANSE_Y0 = 2020, MANSE_Y1 = 2030;
const MANSE_PAGES = [];
for (let y = MANSE_Y0; y <= MANSE_Y1; y++)
  for (let mo = 1; mo <= 12; mo++) MANSE_PAGES.push({ y, mo, en: `${y}-${String(mo).padStart(2,"0")}` });

// JD(KST) → KST 달력. 절기 시각 표시에 쓴다.
function jdToKst(jd){
  const z = Math.floor(jd + 0.5 + 9/24), f = (jd + 0.5 + 9/24) - z;
  let a = z; if (z >= 2299161){ const al = Math.floor((z-1867216.25)/36524.25); a = z+1+al-Math.floor(al/4); }
  const b = a+1524, c = Math.floor((b-122.1)/365.25), d0 = Math.floor(365.25*c), e = Math.floor((b-d0)/30.6001);
  const day = b-d0-Math.floor(30.6001*e), mo = e<14 ? e-1 : e-13, yr = mo>2 ? c-4716 : c-4715;
  const mins = Math.round(f*1440);
  return { y:yr, mo, d:day, h:Math.floor(mins/60)%24, mi:mins%60 };
}

function mansePage(p){
  const MT = MANSE_SRC.MONTH_TEXT[p.mo], TERMS = MANSE_SRC.MONTH_TERMS[p.mo];
  const url = `${DOMAIN}/manse-${p.en}.html`;
  const last = new Date(p.y, p.mo, 0).getDate();

  // 이 달에 드는 절기 두 개의 정확한 시각
  const termRows = TERMS.map(name => {
    const deg = ENGINE.SJ_TERM.find(x => x[0] === name)[1];
    const k = jdToKst(ENGINE.sjTermJd(p.y, deg));
    return { name, k };
  }).filter(x => x.k.mo === p.mo);   // 경계에서 앞뒤 달로 밀리면 뺀다

  // 날짜별 일진 + 음력
  // KoreanLunarCalendar 는 UMD 라 require() 가 생성자 '함수 자체'를 돌려준다.
  // require("./vendor-lunar.js").KoreanLunarCalendar 가 아니다 — 실측으로 확인했다.
  const days = [];
  for (let d = 1; d <= last; d++) {
    const pil = ENGINE.sjPillars(p.y, p.mo, d, null, 0, false);
    const gz = ENGINE.SJ_S[pil.d.s] + ENGINE.SJ_B[pil.d.b];
    // SJ_SH / SJ_BH 는 배열이 아니라 문자열("甲乙丙…")이다. 인덱싱하면 한 글자가 나온다.
    const gzh = ENGINE.SJ_SH[pil.d.s] + ENGINE.SJ_BH[pil.d.b];
    const cal = new KoreanLunarCalendar();
    cal.setSolarDate(p.y, p.mo, d);
    const L = cal.getLunarCalendar();
    const hol = MANSE_SRC.SOLAR_HOLIDAYS[`${p.mo}-${d}`] || "";
    const term = termRows.find(x => x.k.d === d);
    days.push({ d, gz, gzh, lunar:`${L.month}.${L.day}${L.intercalation?" 윤":""}`,
                dow:new Date(p.y,p.mo-1,d).getDay(), hol, term });
  }

  const table = '<div class="exbox" style="padding:12px"><div style="overflow-x:auto">'+
    '<table style="width:100%;border-collapse:collapse;font-size:13px;min-width:460px">'+
    '<thead><tr>'+["날짜","일진","음력","비고"].map(h=>`<th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);color:var(--muted);font-weight:600">${h}</th>`).join("")+'</tr></thead><tbody>'+
    days.map(x=>{
      const W = ["일","월","화","수","목","금","토"][x.dow];
      const note = [x.term ? `${x.term.name} ${String(x.term.k.h).padStart(2,"0")}:${String(x.term.k.mi).padStart(2,"0")}` : "", x.hol].filter(Boolean).join(" · ");
      return `<tr><td style="padding:6px 8px;border-bottom:1px solid var(--line)">${x.d}일(${W})</td>`+
             `<td style="padding:6px 8px;border-bottom:1px solid var(--line)"><a href="iljin-${ILJIN_PAGES.find(q=>q.ko===x.gz).en}.html">${x.gz}</a> <span style="color:var(--muted)">${x.gzh}</span></td>`+
             `<td style="padding:6px 8px;border-bottom:1px solid var(--line);color:var(--muted)">${x.lunar}</td>`+
             `<td style="padding:6px 8px;border-bottom:1px solid var(--line);color:var(--muted)">${esc(note)}</td></tr>`;
    }).join("")+'</tbody></table></div></div>';

  const termList = termRows.map(x =>
    `<div class="row"><span>${esc(x.name)}</span><b>${p.mo}월 ${x.k.d}일 ${String(x.k.h).padStart(2,"0")}:${String(x.k.mi).padStart(2,"0")}</b></div>`).join("");

  const prev = p.mo === 1 ? (p.y > MANSE_Y0 ? `${p.y-1}-12` : null) : `${p.y}-${String(p.mo-1).padStart(2,"0")}`;
  const next = p.mo === 12 ? (p.y < MANSE_Y1 ? `${p.y+1}-01` : null) : `${p.y}-${String(p.mo+1).padStart(2,"0")}`;
  const nav = '<div class="sibs" style="margin-top:6px">'+
    (prev ? `<a href="manse-${prev}.html">← ${prev.replace("-","년 ")}월</a>` : "")+
    (next ? `<a href="manse-${next}.html">${next.replace("-","년 ")}월 →</a>` : "")+'</div>';

  return seoPage({
    title:`${p.y}년 ${p.mo}월 만세력 — 날짜별 일진과 음력·절기 | 동네보살`,
    desc:`${p.y}년 ${p.mo}월 만세력입니다. 날짜마다 일진(간지)과 음력 날짜를 적고 ${TERMS.join("·")} 절기 시각까지 표시합니다. 태양황경을 직접 계산합니다.`,
    url, img:"img/tool/h-todayfortune.webp",
    h1:`${p.y}년 ${p.mo}월 만세력`,
    sub:`${MT.season} · 월지 ${MT.ji} · ${TERMS.join("·")}`,
    tags:[`${p.y}년 ${p.mo}월 만세력`,`${p.mo}월 일진`,"만세력 달력",...TERMS],
    parent:"iljin.html", parentName:"일진 달력",
    tool:"lunar", preset:"",
    body:
      `<div class="intro"><p style="margin-bottom:10px">${esc(MT.lead)}</p>`+
      MT.body.split(/\n\s*/).map(x=>`<p style="margin-bottom:10px">${esc(x)}</p>`).join("")+`</div>`+
      (termList ? `<section class="guide"><h2>${p.mo}월의 절기</h2><div class="exbox">${termList}</div>`+
        `<p style="color:var(--muted);font-size:13px;margin:10px 2px 0">절기는 태양 황경이 특정 각도에 닿는 순간으로 정해집니다. 날짜가 아니라 시각으로 갈리므로, 절입 시각 직전에 태어났다면 앞 달의 월주를 씁니다.</p></section>` : "")+
      `<section class="guide"><h2>${p.y}년 ${p.mo}월 날짜별 일진</h2>${table}`+
      `<p style="color:var(--muted);font-size:13px;margin:10px 2px 0">일진은 60일마다 같은 간지가 돌아옵니다. 간지를 누르면 그 일진의 풀이 페이지로 갑니다. 음력 날짜는 한국천문연구원(KASI) 기준입니다.</p></section>`+
      `<section class="guide"><h2>앞뒤 달 만세력</h2>${nav}</section>`,
    faq:[
      [`${p.y}년 ${p.mo}월 일진은 어떻게 계산했나요?`,`날짜를 율리우스 적일로 바꾼 뒤 60갑자 주기의 나머지로 구합니다. 표를 찾아보는 방식이 아니라 계산이므로 어느 해든 같은 방법으로 나옵니다.`],
      [`절기 시각이 왜 분 단위까지 나오나요?`,`절기는 태양 황경이 특정 각도에 닿는 순간이라 본래 시각이 있습니다. 이 사이트는 황경을 직접 계산해 그 순간을 구합니다. 절입 시각 앞뒤로 태어났다면 월주가 갈리므로 분 단위가 의미를 갖습니다.`],
      [`음력 날짜는 무엇을 기준으로 하나요?`,`한국천문연구원(KASI) 기준 데이터를 씁니다. 윤달이 든 달은 "윤"으로 표시합니다.`],
      [`${p.mo}월에 태어나면 월지가 ${MT.ji}인가요?`,`대개 그렇지만 절기로 갈립니다. ${TERMS[0]} 절입 시각 이전에 태어났다면 앞 달의 월지를 씁니다. 위 절기 표에서 시각을 확인하세요.`]],
    sibTitle:"다른 달 만세력", sibs:nav,
    related:["todayfortune","saju","lunar","newyear"]});
}
```

- [ ] **Step 4: 파일 출력과 사이트맵에 연결한다**

`build_site.js`에서 `ILJIN_PAGES.forEach(p=>fs.writeFileSync(path.join(OUT,"iljin-"+p.en+".html"), iljinPage(p)));` **바로 아래** 추가:

```js
MANSE_PAGES.forEach(p=>fs.writeFileSync(path.join(OUT,"manse-"+p.en+".html"), mansePage(p)));
```

사이트맵에서 `ILJIN_PAGES.map(p=>smUrl("iljin-"+p.en+".html")).join("\n")+"\n"+` **바로 아래** 추가:

```js
  MANSE_PAGES.map(p=>smUrl("manse-"+p.en+".html")).join("\n")+"\n"+
```

빌드 로그 줄(`console.log("   SEO 개별 페이지:", ...)`)의 마지막 인자 뒤에 추가:

```js
  , "+ 월력", MANSE_PAGES.length
```

- [ ] **Step 5: 통과를 확인한다**

```bash
node verify.js 2>&1 | tail -4 && node build_site.js 2>&1 | tail -3
```
기대: `결과: 209 통과 / 0 실패`, 빌드 성공

```bash
ls site/manse-*.html | wc -l
```
기대: `132`

- [ ] **Step 6: 게이트를 통과하는지 확인한다**

```bash
node tools/gate.js manse- 2000
```
기대: `132개`, `✅ 통과`

**막히면**: 달마다 고유 문단이 모자란 것이다. `content_manse.js`의 `MONTH_TEXT[n].body`를 늘리거나, 그 해에만 해당하는 문장(그해 윤달 여부, 그달 명절)을 본문에 추가한다. 게이트를 느슨하게 바꾸지 않는다.

- [ ] **Step 7: 실제 페이지를 눈으로 확인한다**

절기 시각이 포스텔러 값과 맞는지 본다:

```bash
node -e "const h=require('fs').readFileSync('site/manse-2026-09.html','utf8');const i=h.indexOf('9월의 절기');console.log(h.slice(i,i+400).replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));"
```
기대: `백로 9월 7일 23:37` 과 `추분 9월 23일 09:05` 이 보일 것 (포스텔러 23:40 / 09:05 대비 −3분 / 0분)

- [ ] **Step 8: 커밋**

```bash
git add build_site.js verify.js
git commit -m "Generate 132 monthly 만세력 pages with per-day iljin and solar-term times"
```

---

## Task 6: 월력 배포

- [ ] **Step 1: 전체 게이트를 다시 돌린다**

```bash
node verify.js 2>&1 | tail -2
node tools/gate.js manse- 2000
node tools/gate.js iljin- 2000
```
기대: 셋 다 통과. `iljin-`이 이번 변경으로 나빠지지 않았는지도 본다 (월력이 일진 페이지로 링크를 보내므로 일진 쪽 본문은 그대로여야 한다).

- [ ] **Step 2: 사이트맵 수를 확인한다**

```bash
grep -c "<loc>" site/sitemap.xml
```
기대: `296` (164 + 132)

- [ ] **Step 3: 배포하고 라이브를 확인한다**

```bash
git push origin main && vercel --prod --yes 2>&1 | grep -E "Production:|Aliased:"
```

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://dongnebosal.com/manse-2026-09.html
curl -s https://dongnebosal.com/manse-2026-09.html | grep -o "백로 9월 7일 [0-9:]*"
```
기대: `200`, 백로 시각이 보일 것

---

## Task 7: 일지 12 원고 (배우자 자리)

일주 페이지의 재료. **일진 원고와 문장이 겹치면 안 된다.** 일진의 `JI[n].day`는 "그 날의 기운"이고, 여기는 "이 사람의 배우자 자리"다.

**Files:**
- Create: `content_ilju.js`

- [ ] **Step 1: 원고 파일을 만든다**

```js
/* 일주(日柱) 페이지의 재료 — 일지 12개.
   일지는 사주에서 배우자 자리(配偶者宮)다. content_iljin.js 의 JI[].day 는
   "그 날의 기운"이고 이 파일은 "이 사람의 배우자 자리와 속마음"이다.
   같은 지지라도 쓰는 목적이 달라 문장이 겹치지 않아야 한다. 중복 게이트가 검사한다.

   문체: 존댓말 (SEO 원고). */

const JIJU = [
  { ko:"자", han:"子", tti:"쥐", rom:"ja", el:"수",
    seat:`일지가 자수인 사람은 배우자 자리에 깊은 물을 둔 셈입니다. 상대가 속을 다 보여주지 않아도 불안해하지 않고, 오히려 그 여백을 편하게 여깁니다.`,
    inner:`속마음은 늘 한 겹 안쪽에 있습니다. 밖으로는 무던해 보여도 안에서는 계속 재고 계산합니다. 결정을 늦추는 것처럼 보이지만 실제로는 이미 다 정해두고 말을 아끼는 쪽입니다.`,
    pair:`말수가 적은 상대보다 먼저 말을 꺼내주는 상대와 오래 갑니다. 둘 다 안으로 삼키면 대화가 끊깁니다.` },
  { ko:"축", han:"丑", tti:"소", rom:"chuk", el:"토",
    seat:`일지가 축토인 사람은 배우자 자리에 언 흙을 둡니다. 관계가 더디게 데워지지만 한번 자리를 잡으면 웬만한 일로 흔들리지 않습니다.`,
    inner:`참는 데 익숙합니다. 서운한 것을 그때 말하지 않고 쌓아두었다가 한참 뒤에 한꺼번에 꺼냅니다. 상대는 갑작스럽다고 느끼지만 본인에게는 오래된 일입니다.`,
    pair:`반응이 빠르고 그때그때 표현하는 상대를 만나면 균형이 맞습니다.` },
  { ko:"인", han:"寅", tti:"호랑이", rom:"in", el:"목",
    seat:`일지가 인목인 사람은 배우자 자리에 뻗어 오르는 나무를 둡니다. 상대를 키우고 세우는 데 힘을 씁니다.`,
    inner:`먼저 움직입니다. 관계에서도 기다리기보다 먼저 제안하고 먼저 책임집니다. 대신 상대가 따라오지 않으면 혼자 지칩니다.`,
    pair:`끌려다니는 것을 싫어하는 상대와는 부딪힙니다. 방향을 나눠 갖는 편이 낫습니다.` },
  { ko:"묘", han:"卯", tti:"토끼", rom:"myo", el:"목",
    seat:`일지가 묘목인 사람은 배우자 자리에 번지는 풀을 둡니다. 곁을 부드럽게 채우고 상대의 결에 맞춰 자랍니다.`,
    inner:`거절을 어려워합니다. 싫다는 말 대신 다른 이유를 대고, 그러다 본인이 감당 못 할 일까지 떠안습니다.`,
    pair:`선을 먼저 그어주는 상대를 만나면 편해집니다.` },
  { ko:"진", han:"辰", tti:"용", rom:"jin", el:"토",
    seat:`일지가 진토인 사람은 배우자 자리에 물을 머금은 흙을 둡니다. 품이 넓어 상대의 사정을 잘 받아줍니다.`,
    inner:`속이 여럿입니다. 상황마다 다른 얼굴이 나오는데 본인은 그것을 모순이라고 여기지 않습니다. 가까운 사람일수록 어느 쪽이 진짜냐고 묻게 됩니다.`,
    pair:`한 가지로 정해달라고 몰아붙이는 상대와는 답답해집니다.` },
  { ko:"사", han:"巳", tti:"뱀", rom:"sa", el:"화",
    seat:`일지가 사화인 사람은 배우자 자리에 방향이 정해진 불을 둡니다. 상대를 고르는 기준이 분명하고 잘 바뀌지 않습니다.`,
    inner:`겉은 차분한데 안은 빠릅니다. 이미 판단을 끝내고도 표정에 내지 않아 상대가 뒤늦게 알아차립니다.`,
    pair:`속도를 맞춰주는 상대보다 속을 물어봐 주는 상대와 오래 갑니다.` },
  { ko:"오", han:"午", tti:"말", rom:"o", el:"화",
    seat:`일지가 오화인 사람은 배우자 자리에 한낮의 불을 둡니다. 감정이 밖으로 바로 나오고 숨기지 못합니다.`,
    inner:`좋고 싫음이 분명합니다. 그래서 오해는 적은데 상처는 빨리 납니다. 식는 것도 빠릅니다.`,
    pair:`받아서 식혀주는 상대와 맞습니다. 둘 다 뜨거우면 오래 못 갑니다.` },
  { ko:"미", han:"未", tti:"양", rom:"mi", el:"토",
    seat:`일지가 미토인 사람은 배우자 자리에 마른 흙을 둡니다. 겉으로 순하지만 안에서는 고집이 단단합니다.`,
    inner:`남의 사정을 잘 헤아립니다. 대신 본인 몫을 말하지 않아서 억울함이 쌓입니다.`,
    pair:`묻지 않아도 챙겨주는 상대를 만나야 덜 지칩니다.` },
  { ko:"신", han:"申", tti:"원숭이", rom:"sin", el:"금",
    seat:`일지가 신금인 사람은 배우자 자리에 아직 벼려지지 않은 쇠를 둡니다. 관계에서 머리가 빨리 돌아가고 상황을 잘 읽습니다.`,
    inner:`재미를 중요하게 여깁니다. 지루한 것을 견디지 못해 관계에 변화를 계속 만듭니다.`,
    pair:`변화를 불안해하는 상대와는 어긋납니다.` },
  { ko:"유", han:"酉", tti:"닭", rom:"yu", el:"금",
    seat:`일지가 유금인 사람은 배우자 자리에 벼려진 금을 둡니다. 보는 눈이 밝고 기준이 높습니다.`,
    inner:`작은 흠이 크게 보입니다. 지적할 생각이 없어도 눈에 먼저 들어와서 표정에 나옵니다.`,
    pair:`둔한 듯 넉넉한 상대를 만나면 서로 깎이지 않습니다.` },
  { ko:"술", han:"戌", tti:"개", rom:"sul", el:"토",
    seat:`일지가 술토인 사람은 배우자 자리에 마른 가을 흙을 둡니다. 의리가 두텁고 한번 정한 사람을 잘 바꾸지 않습니다.`,
    inner:`의심과 믿음이 한 몸입니다. 믿기 전까지는 오래 재고, 믿고 나면 끝까지 갑니다.`,
    pair:`애매하게 구는 상대와는 오래 못 갑니다. 분명하게 말해주는 쪽이 맞습니다.` },
  { ko:"해", han:"亥", tti:"돼지", rom:"hae", el:"수",
    seat:`일지가 해수인 사람은 배우자 자리에 넉넉한 물을 둡니다. 상대를 잘 받아주고 웬만한 것은 덮어줍니다.`,
    inner:`거절보다 미루기를 택합니다. 싫다고 말하는 대신 시간을 끌어 상황이 저절로 정리되기를 기다립니다.`,
    pair:`결론을 내주는 상대를 만나면 관계가 깔끔해집니다.` },
];

/* 십이운성 해설 — 존댓말판.
   hub.html 의 SJ_UN_DESC 는 보살 말투("자리일세", "하네")라 SEO 페이지에 쓸 수 없다.
   같은 개념을 존댓말로 다시 쓴다. 뜻은 같고 문장은 겹치지 않게 한다. */
const UN_DESC = {
  "장생":"갓 태어난 기운입니다. 자랄 여지가 크고, 애쓰지 않아도 주변의 도움이 붙는 자리입니다. 시작하는 일에 볕이 듭니다.",
  "목욕":"꾸미고 드러내는 기운입니다. 매력이 있고 감정이 풍부한 대신 마음이 자주 흔들립니다. 한 가지를 오래 붙드는 연습이 필요합니다.",
  "관대":"세상에 막 나선 청년의 기운입니다. 자신감과 의욕이 앞서는 자리라 추진력이 좋고, 대신 급하게 결론을 냅니다.",
  "건록":"스스로 벌어 스스로 서는 자리입니다. 열두 단계 가운데 가장 실속 있는 축에 들고 책임감이 단단합니다.",
  "제왕":"기운이 정점에 오른 자리입니다. 주도하는 힘이 강하고 사람을 끌지만, 그만큼 고집으로 흐르기 쉽습니다.",
  "쇠":"정점을 지나 가라앉은 자리입니다. 벌이기보다 안을 다지는 데 강하고, 무리하지 않아 오래 갑니다.",
  "병":"기운이 얇아지며 예민해지는 자리입니다. 대신 남의 기색을 잘 읽어 사람을 살피는 데 밝습니다.",
  "사":"움직임보다 생각이 깊어지는 자리입니다. 연구·기획처럼 안으로 파고드는 일에 어울립니다.",
  "묘":"거두어 갈무리하는 자리입니다. 모으고 지키는 힘이 있어 관리와 축적에 강합니다.",
  "절":"끊어졌다 다시 이어지는 자리입니다. 변화가 잦지만 그때마다 새로 시작하는 기운도 함께 들어 있습니다.",
  "태":"새 생명이 자리를 잡는 단계입니다. 아이디어와 가능성이 씨앗처럼 들어앉아 아직 형태가 잡히지 않았습니다.",
  "양":"태어나기 전 길러지는 단계입니다. 보호받으며 준비하는 시기라 기질이 온화합니다.",
};

module.exports = { JIJU, UN_DESC };
```

- [ ] **Step 2: 일진 원고와 문장이 겹치지 않는지 잰다**

```bash
node -e "
const A=require('./content_iljin.js').JI.map(x=>x.day).join(' ');
const B=require('./content_ilju.js').JIJU.map(x=>x.seat+x.inner+x.pair).join(' ');
const g=s=>{const t=new Set();for(let i=0;i<s.length-3;i++)t.add(s.slice(i,i+3));return t;};
const a=g(A),b=g(B);let n=0;for(const x of a)if(b.has(x))n++;
console.log('일진 지지 원고 ↔ 일주 일지 원고 유사도 '+(n/(a.size+b.size-n)*100).toFixed(1)+'%');
console.log('기준: 30% 미만이면 충분히 다르다');"
```
기대: 30% 미만

**넘으면**: 같은 표현을 재활용한 것이다. 일주 쪽 문장을 배우자·속마음 중심으로 다시 쓴다.

- [ ] **Step 3: 십이운성 존댓말판이 열두 개 다 있는지 확인한다**

```bash
node -e "
const U=require('./content_ilju.js').UN_DESC;
const NEED=['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
const miss=NEED.filter(k=>!U[k]);
console.log('있는 키',Object.keys(U).length,'| 빠진 키',miss.join(',')||'없음');
const bosal=Object.entries(U).filter(([k,v])=>/일세|하네|야\.|자리야/.test(v));
console.log('보살 말투 섞인 항목:',bosal.map(x=>x[0]).join(',')||'없음');"
```
기대: `있는 키 12 | 빠진 키 없음`, `보살 말투 섞인 항목: 없음`

- [ ] **Step 4: 커밋**

```bash
git add content_ilju.js
git commit -m "Add branch copy for ilju pages, framed as the spouse palace"
```

---

## Task 8: 일주 60 페이지 생성

**Files:**
- Modify: `build_site.js`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`verify.js` 결과 출력 바로 위에 추가:

```js
// 일주 60은 일진 60과 같은 간지를 쓴다. 제목이 겹치면 자기잠식이 난다.
t("build_site에 ILJU_PAGES 존재", /const ILJU_PAGES\s*=/.test(bs), true);
t("사이트맵에 일주 포함", /ILJU_PAGES\.map\(p=>smUrl\("ilju-/.test(bs), true);
t("일주 제목에 '일주', 일진 제목에 '일' — 서로 다름",
  /일주 — 성격/.test(bs) && /일진 — 이 날/.test(bs), true);
```

- [ ] **Step 2: 실패를 확인한다**

```bash
node verify.js 2>&1 | tail -5
```
기대: 3개 ❌

- [ ] **Step 3: 페이지 목록과 생성 함수를 쓴다**

`build_site.js`의 `const iljinChips = cur =>` 줄 **바로 뒤**에 추가한다.

> **순서가 중요하다.** `ILJU_PAGES`는 초기화 시점에 `ILJIN_PAGES[k].en`을 읽으므로 반드시 `ILJIN_PAGES` 정의보다 **뒤**에 와야 한다. `mansePage` 앞에 두면 `ReferenceError: Cannot access 'ILJIN_PAGES' before initialization`이 난다.

```js
const ILJU_SRC = require("./content_ilju.js");

/* 일주(日柱) 60 — 태어난 날의 두 글자.
   iljin-* 이 "그 날의 기운"이라면 여기는 "그 일주로 태어난 사람"이다.
   천간은 ILGAN_PAGES(일간 원고)를 재활용하고 지지는 content_ilju.js 를 쓴다. */
const ILJU_PAGES = Array.from({length:60}, (_, k) => {
  const s = k % 10, b = k % 12;
  const g = ILGAN_PAGES[s], j = ILJU_SRC.JIJU[b];
  return {
    k, s, b, gan:g, ji:j,
    en:`${g.en}${j.rom}`,
    ko:`${g.ko}${j.ko}`,
    han:`${g.han}${j.han}`,
    // sjUnseong 은 인덱스가 아니라 이름("장생","태" …)을 바로 돌려준다.
    // SJ_UN[...] 으로 감싸면 undefined 가 된다 — 실측으로 확인했다.
    un:ENGINE.sjUnseong(s, b),
    tengod:ENGINE.sjTenGod(s, ENGINE.SJ_BMAIN[b]),    // 일지 지장간 본기와의 십성
    chung:ENGINE.SJ_TTI[(b + 6) % 12],
    samhap:[0,4,8].map(o=>ENGINE.SJ_TTI[(b + o) % 12]),
    yukhap:ENGINE.SJ_TTI[ENGINE.sjYukhap(b)],
    iljinEn:ILJIN_PAGES[k].en,                        // 같은 간지의 일진 페이지
  };
});
const iljuChips = cur => '<div class="sibs">'+ILJU_PAGES.map(p=>p.en===cur
  ? `<span class="cur">${p.ko}일주</span>` : `<a href="ilju-${p.en}.html">${p.ko}일주</a>`).join("")+'</div>';

function iljuPage(p){
  const G = p.gan, J = p.ji;
  const url = `${DOMAIN}/ilju-${p.en}.html`;
  return seoPage({
    title:`${p.ko}일주 — 성격·배우자·직업 풀이 | 동네보살`,
    desc:`${p.ko}일주(${p.han})로 태어난 사람의 성격과 배우자 자리를 풀이합니다. 일간 ${G.ko}${G.el}, 일지 ${J.ko}${J.el}, 십이운성 ${p.un}, 십성 ${p.tengod}까지 정통 명리로 계산합니다.`,
    url, img:"img/tool/h-saju.webp",
    h1:`${p.han} ${p.ko}일주 — ${G.metaphor}가 ${J.ko}${J.el} 위에 앉다`,
    sub:`일간 ${G.ko}${G.el} · 일지 ${J.ko}${J.el} · 십이운성 ${p.un}`,
    tags:[`${p.ko}일주`,`${p.ko}일주 성격`,`${p.ko}일주 여자`,`${p.ko}일주 남자`,"일주론"],
    parent:"saju.html", parentName:"사주팔자 만세력",
    tool:"saju", preset:"",
    body:
      `<div class="exbox"><h3>${p.ko}일주 한눈에 보기</h3>`+
      [["일주",`${p.han} (60갑자 ${p.k+1}번째)`],
       ["일간 — 나",`${G.han} ${G.ko}${G.el} · ${G.metaphor}`],
       ["일지 — 배우자 자리",`${J.han} ${J.ko} · ${J.tti}띠 · ${J.el}`],
       ["십이운성",p.un],
       ["일지 십성",p.tengod],
       ["삼합 띠",p.samhap.join(" · ")],
       ["육합 띠",p.yukhap],
       ["충 — 흔들리는 띠",p.chung]]
        .map(r=>`<div class="row"><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join("")+`</div>`+
      `<div class="intro">`+
      `<p style="margin-bottom:10px">${esc(p.ko)}일주는 태어난 날의 천간이 ${G.han}(${G.ko}${G.el}), 지지가 ${J.han}(${J.ko}${J.el})인 사주입니다. 사주 여덟 글자 가운데 일간은 나 자신이고 일지는 배우자 자리이므로, 일주 두 글자는 "나는 어떤 사람이고 어떤 자리에 앉아 있는가"를 함께 보여줍니다.</p>`+
      G.intro.trim().split(/\n\s*/).map(x=>`<p style="margin-bottom:10px">${esc(x)}</p>`).join("")+`</div>`+
      `<section class="guide"><h2>${p.ko}일주의 배우자 자리</h2>`+
      `<p style="margin-bottom:10px">${esc(J.seat)}</p>`+
      `<p style="margin-bottom:10px">${esc(J.inner)}</p>`+
      `<p style="margin-bottom:10px">${esc(J.pair)}</p>`+
      `<p style="color:var(--muted);font-size:13px;margin:10px 2px 0">일지는 배우자 자리로 보지만, 실제 궁합은 두 사람의 사주를 함께 세워야 나옵니다. <a href="gunghap.html">궁합 보기</a>에서 상대 생년월일까지 넣어 확인하세요.</p></section>`+
      `<section class="guide"><h2>${p.ko}일주의 십이운성 — ${esc(p.un)}</h2>`+
      // hub.html 의 SJ_UN_DESC 는 보살 말투라 여기 쓰면 한 페이지에 두 문체가 섞인다.
      // content_ilju.js 의 존댓말판을 쓴다. 키는 이름("장생")이지 인덱스가 아니다.
      `<p style="margin-bottom:10px">${esc(ILJU_SRC.UN_DESC[p.un])}</p>`+
      `<p style="color:var(--muted);font-size:13px;margin:10px 2px 0">십이운성은 일간이 그 지지에서 갖는 기운의 세기입니다. 사람의 일생에 빗대 장생부터 양까지 열두 단계로 나눕니다.</p></section>`+
      `<section class="guide"><h2>${p.ko}일주의 일과 재물</h2>`+
      G.work.trim().split(/\n\s*/).map(x=>`<p style="margin-bottom:10px">${esc(x)}</p>`).join("")+
      G.money.trim().split(/\n\s*/).map(x=>`<p style="margin-bottom:10px">${esc(x)}</p>`).join("")+`</section>`+
      `<section class="guide"><h2>${p.ko}일주와 ${p.ko}일은 다릅니다</h2>`+
      `<p style="margin-bottom:10px">같은 ${p.ko}라도 쓰임이 다릅니다. ${p.ko}<b>일주</b>는 그 날에 태어난 사람의 타고난 자리이고, ${p.ko}<b>일</b>은 60일마다 돌아오는 그 날의 기운입니다. 오늘이 어떤 날인지 보려면 <a href="iljin-${p.iljinEn}.html">${p.ko}일 일진</a> 페이지를 보세요.</p></section>`,
    faq:[
      [`${p.ko}일주는 어떤 성격인가요?`,`일간 ${G.han}(${G.ko}${G.el})이 성격의 뼈대입니다. ${G.metaphor}에 비유합니다. 여기에 일지 ${J.han}(${J.ko})가 더해져 ${p.un}의 기운이 됩니다. 다만 일주 두 글자만으로는 60갈래로만 나뉘므로, 나머지 여섯 글자를 함께 봐야 좁혀집니다.`],
      [`${p.ko}일주 여자와 남자가 다른가요?`,`일주 자체는 같습니다. 다만 배우자를 보는 십성이 달라 해석의 초점이 갈립니다. 남자는 재성을, 여자는 관성을 배우자성으로 보는 것이 전통적인 방식입니다. 일지 자리인 ${J.ko}는 남녀 모두 배우자 자리로 봅니다.`],
      [`내 일주는 어떻게 확인하나요?`,`생년월일을 <a href="saju.html">사주팔자 만세력</a>에 넣으면 네 기둥이 나옵니다. 그중 가운데 '일' 기둥의 두 글자가 일주입니다. 위 글자가 일간, 아래 글자가 일지입니다.`],
      [`일주가 ${p.ko}면 ${p.chung}띠와 안 맞나요?`,`일지 ${J.ko}와 ${p.chung}띠의 지지가 충(沖) 관계이긴 합니다. 다만 충은 부딪히는 만큼 끌리기도 하는 관계라 무조건 나쁘게 보지 않습니다. 삼합인 ${p.samhap.join("·")}띠와 육합인 ${p.yukhap}띠가 무난한 편입니다.`]],
    sibTitle:"다른 일주도 보기", sibs:iljuChips(p.en),
    related:["saju","gunghap","todayfortune","zodiacfortune"]});
}
```

- [ ] **Step 4: 파일 출력·사이트맵·일진 상호 링크를 연결한다**

`MANSE_PAGES.forEach(...)` 줄 **바로 아래** 추가:

```js
ILJU_PAGES.forEach(p=>fs.writeFileSync(path.join(OUT,"ilju-"+p.en+".html"), iljuPage(p)));
```

사이트맵에서 `MANSE_PAGES.map(...)` 줄 **바로 아래** 추가:

```js
  ILJU_PAGES.map(p=>smUrl("ilju-"+p.en+".html")).join("\n")+"\n"+
```

`iljinPage(p)` 안의 `body:` 문자열 마지막(`...일진 달력</a>에서 확인하세요.</p></section>`) **바로 뒤**에 이어 붙여 상호 링크를 만든다:

```js
      +`<section class="guide"><h2>${p.ko}일에 태어났다면</h2><p style="margin-bottom:10px">이 페이지는 <b>그 날의 기운</b>입니다. ${p.ko}일에 태어난 사람의 타고난 성격과 배우자 자리는 <a href="ilju-${ILJU_PAGES[p.k].en}.html">${p.ko}일주</a> 페이지에 있습니다.</p></section>`
```

- [ ] **Step 5: 통과를 확인한다**

```bash
node verify.js 2>&1 | tail -4 && node build_site.js 2>&1 | tail -3 && ls site/ilju-*.html | wc -l
```
기대: `결과: 212 통과 / 0 실패`, 빌드 성공, `60`

- [ ] **Step 6: 게이트 — 일주 내부 중복과 일진과의 자기잠식을 둘 다 본다**

```bash
node tools/gate.js ilju- 2000
node tools/gate.js iljin- 2000
```
기대: 둘 다 통과

교차 확인 (같은 간지끼리 얼마나 겹치는지):

```bash
node -e "
const {textOf,grams,jaccard}=require('./tools/gate.js');
const fs=require('fs');
const P=require('./build_site.js');" 2>/dev/null || node -e "
const {textOf,grams,jaccard}=require('./tools/gate.js');const fs=require('fs');
const pairs=fs.readdirSync('site').filter(f=>f.startsWith('ilju-')).map(f=>f.slice(5,-5));
let sum=0,n=0,max=0,mp='';
for(const en of pairs){
  const a=textOf(fs.readFileSync('site/ilju-'+en+'.html','utf8'));
  const p2='site/iljin-'+en+'.html';
  if(!fs.existsSync(p2))continue;
  const b=textOf(fs.readFileSync(p2,'utf8'));
  const s=jaccard(grams(a),grams(b));sum+=s;n++;
  if(s>max){max=s;mp=en;}
}
console.log('같은 간지 일주↔일진 '+n+'쌍');
console.log('  평균 '+(sum/n*100).toFixed(1)+'%   최대 '+(max*100).toFixed(1)+'% ('+mp+')');
console.log('  기준: 최대 85% 미만');"
```
기대: 최대 85% 미만

**넘으면**: 두 페이지가 같은 말을 하고 있다. 일주 쪽에서 일간 원고(`G.intro`) 재활용을 줄이고 배우자·십이운성 서술을 늘린다.

- [ ] **Step 7: 커밋**

```bash
git add build_site.js verify.js
git commit -m "Generate 60 ilju pages and cross-link them with the iljin day pages"
```

---

## Task 9: 일주 배포와 최종 확인

- [ ] **Step 1: 전체 게이트**

```bash
node verify.js 2>&1 | tail -2
for g in manse- ilju- iljin- star- zodiac- ilgan- sipseong-; do node tools/gate.js $g 2000 || echo "❌ $g 막힘"; done
```
기대: 전부 통과

- [ ] **Step 2: 사이트맵 수**

```bash
grep -c "<loc>" site/sitemap.xml
```
기대: `356` (164 + 132 + 60)

- [ ] **Step 3: 8/13 크롤본 대비 변화량을 잰다**

```bash
node scratchpad/measure.js 2>/dev/null || node -e "
const fs=require('fs'),cp=require('child_process');
const textOf=h=>{const b=h.slice(h.indexOf('<body'));return b.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();};
const OLD=cp.execSync('git log --until=2026-08-13 --format=%H -1').toString().trim();
const o=cp.execSync('git show '+OLD+':site/sitemap.xml',{maxBuffer:1e8}).toString().split('<loc>').length-1;
const n=fs.readFileSync('site/sitemap.xml','utf8').split('<loc>').length-1;
console.log('사이트맵 '+o+' → '+n+' (+'+(n-o)+')');"
```

- [ ] **Step 4: 배포**

```bash
git push origin main && vercel --prod --yes 2>&1 | grep -E "Production:|Aliased:"
```

- [ ] **Step 5: 라이브 확인 — 표본 3개**

```bash
for u in ilju-gapja manse-2026-09 iljin-gapja; do
  printf "%-18s %s  " "$u" "$(curl -s -o /dev/null -w '%{http_code}' https://dongnebosal.com/$u.html)"
  curl -s https://dongnebosal.com/$u.html | grep -o "<h1[^>]*>[^<]*" | head -1
done
```
기대: 셋 다 `200`, h1이 각각 다르게 나올 것 (일주 / 만세력 / 일진)

- [ ] **Step 6: 사용자에게 넘길 것을 적는다**

배포가 끝나면 사용자가 해야 할 계정 작업을 한 번에 정리해 전달한다:

```
1. GSC 사이트맵 재제출 — https://dongnebosal.com/sitemap.xml (356 URL)
2. GSC URL 검사 → 색인 요청: /ilju-gapja.html, /manse-2026-09.html
3. GA4 속성 생성 → 측정 ID 전달 (build_site.js:14 한 줄 교체)
4. 애드센스 신청 전 Vercel 대시보드에서 moacalc.vercel.app 정리
5. 네이버 서치어드바이저 소유확인 + 사이트맵 제출
```

---

## 이 계획이 끝나면

- 페이지 164 → 356
- 게이트 스크립트가 생겨 이후 페이지군은 자동 검사를 받는다
- 공유 수단이 0 → 2 (Web Share + 주소 복사)
- 24절기 함수가 엔진에 들어와 월력·절기 표시가 가능해진다

**다음 계획(4~6단계)은 이 계획의 게이트 수치를 보고 씁니다.** 특히 일주↔일진 교차 유사도가 띠궁합 78의 원고 설계를 좌우합니다.
