/* 스레드·인스타용 카드 이미지 HTML 생성기.
   그날 일진을 계산해 1080x1350 카드 마크업을 만든다.
   글자는 HTML로 그린다 — 이미지 생성 모델은 한글을 뭉갠다.

   실행: node threads_card.js            → 오늘
         node threads_card.js 2026-09-01 → 특정 날짜
   결과: card-out/index.html  (브라우저로 열어 1080x1350으로 캡처)
*/
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "hub.html"), "utf8");
const inner = src.match(/<script>([\s\S]*?)<\/script>/)[1];
eval(inner.slice(inner.indexOf("var SJ_S="), inner.indexOf("// ---------- shared")));
eval(inner.slice(inner.indexOf("function earnedDed"), inner.indexOf("// ---------- TOOLS")));
const tfSrc = inner.slice(inner.indexOf('{id:"todayfortune"'));
eval(tfSrc.slice(tfSrc.indexOf("var TXT="), tfSrc.indexOf("el.innerHTML=")));

// 십성·일간을 일상어로 옮긴다. 카드는 이 사이트를 처음 보는 사람에게 간다 —
// "편관"이라고 쓰면 아무도 못 읽는다. 용어는 근거로 작게만 붙인다.
const REL_PLAIN = {
  "비견": "내 힘이 세지는 날", "겁재": "돈이 새는 날",
  "식신": "말과 재주가 풀리는 날", "상관": "말이 앞서는 날",
  "편재": "큰돈이 오가는 날", "정재": "성실이 돈 되는 날",
  "편관": "압박이 들어오는 날", "정관": "원칙이 통하는 날",
  "편인": "생각이 깊어지는 날", "정인": "도움이 오는 날",
};
// 일간을 사람 모습으로 — content_ilgan.js의 비유를 그대로 쓴다
const ILGAN_PLAIN = require("./content_ilgan.js").reduce((m, g) => {
  m[g.ko] = g.metaphor; return m;
}, {});

const arg = process.argv[2];
const now = arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)
  ? new Date(+arg.slice(0, 4), +arg.slice(5, 7) - 1, +arg.slice(8, 10))
  : new Date();

const p = sjPillars(now.getFullYear(), now.getMonth() + 1, now.getDate(), null, 0, false);
const rows = [];
for (let i = 0; i < 10; i++) {
  const rel = sjTenGod(i, p.d.s);
  rows.push({ gan: SJ_S[i], el: SJ_EL[SJ_ES[i]], han: SJ_SH[i], rel, score: TXT[rel][0], T: TXT[rel] });
}
const lo = rows.reduce((a, b) => (b.score < a.score ? b : a));
const hi = rows.reduce((a, b) => (b.score > a.score ? b : a));

const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
const ganji = SJ_S[p.d.s] + SJ_B[p.d.b];
const han = SJ_SH[p.d.s] + SJ_BH[p.d.b];

const OUT = path.join(__dirname, "card-out");
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(path.join(__dirname, "img", "logo.png"), path.join(OUT, "logo.png"));

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1350px;background:#0d1430;color:#f4efe4;
    font-family:"Pretendard","Malgun Gothic","맑은 고딕",sans-serif;overflow:hidden;position:relative}
  .glow{position:absolute;width:900px;height:900px;border-radius:50%;filter:blur(120px);opacity:.26}
  .g1{background:#d9a441;top:-330px;right:-270px}
  .g2{background:#3f5fbf;bottom:-390px;left:-310px}
  .wrap{position:relative;padding:82px 78px;height:100%;display:flex;flex-direction:column}
  .top{display:flex;align-items:center;gap:20px}
  .top img{width:74px;height:74px;border-radius:50%}
  .brand{font-size:32px;font-weight:800}
  .brand span{display:block;font-size:19px;font-weight:500;color:#c8bfa8;margin-top:5px}
  .date{margin-left:auto;text-align:right;font-size:22px;color:#c8bfa8}
  /* 제일 큰 글씨는 일상어다. 용어가 아니라 */
  .hero{margin-top:74px;font-size:78px;font-weight:800;line-height:1.28;
    letter-spacing:-2px;word-break:keep-all;color:#e7b955}
  .who{margin-top:34px;font-size:36px;font-weight:700;line-height:1.5;word-break:keep-all}
  .who em{font-style:normal;color:#e7b955}
  .say{margin-top:34px;font-size:38px;line-height:1.62;font-weight:500;
    color:#e6e0d2;word-break:keep-all}
  .vs{margin-top:52px;background:rgba(255,255,255,.055);
    border:1px solid rgba(231,185,85,.28);border-radius:24px;padding:38px 40px}
  .vs .k{font-size:24px;color:#c8bfa8;letter-spacing:.04em}
  .vs .v{margin-top:16px;font-size:46px;font-weight:800;color:#8fd6a8;line-height:1.35;word-break:keep-all}
  .vs .w{margin-top:14px;font-size:31px;color:#e6e0d2;line-height:1.5;word-break:keep-all}
  .why{margin-top:auto;padding-top:34px;border-top:1px solid rgba(231,185,85,.3);
    font-size:23px;color:#a99d84;line-height:1.62}
  .why b{color:#c8bfa8;font-weight:600}
  .cta{margin-top:30px;display:flex;align-items:center}
  .cta .t{font-size:31px;font-weight:700}
  .cta .u{margin-left:auto;font-size:29px;font-weight:800;color:#e7b955}
</style></head><body>
<div class="glow g1"></div><div class="glow g2"></div>
<div class="wrap">
  <div class="top">
    <img src="logo.png" alt="">
    <div class="brand">동네보살<span>무료 사주 · 오늘의 운세</span></div>
    <div class="date">${date}</div>
  </div>

  <div class="hero">${REL_PLAIN[lo.rel]}</div>

  <div class="who">누가? — <em>${ILGAN_PLAIN[lo.gan]}</em> 같은 사람</div>

  <div class="say">${lo.T[4]}</div>

  <div class="vs">
    <div class="k">반대로, 오늘 잘 풀리는 사람</div>
    <div class="v">${REL_PLAIN[hi.rel]}</div>
    <div class="w">${ILGAN_PLAIN[hi.gan]} 같은 사람일세.</div>
  </div>

  <div class="why">오늘은 <b>${ganji}(${han})</b>일. 절기까지 따지는 만세력으로 계산했네.<br>
    이런 사람을 명리에서는 <b>${lo.gan}${lo.el} 일간</b>, 오늘 기운을 <b>${lo.rel}</b>이라 부르네.</div>

  <div class="cta"><span class="t">내 날은 어떤 날인가</span><span class="u">dongnebosal.com</span></div>
</div>
</body></html>`;

fs.writeFileSync(path.join(OUT, "index.html"), html, "utf8");
console.log("생성:", path.join(OUT, "index.html"));
console.log(`${date} ${ganji}(${han})일 · ${SJ_TTI[p.d.b]}띠`);
console.log(`최저 ${lo.gan}${lo.el} ${lo.rel} ${lo.score} / 최고 ${hi.gan}${hi.el} ${hi.rel} ${hi.score}`);
