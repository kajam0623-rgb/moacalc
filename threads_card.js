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
  /* 금박 구름 결 — 사이트 삽화와 같은 분위기 */
  .glow{position:absolute;width:900px;height:900px;border-radius:50%;filter:blur(120px);opacity:.28}
  .g1{background:#d9a441;top:-320px;right:-260px}
  .g2{background:#3f5fbf;bottom:-380px;left:-300px}
  .wrap{position:relative;padding:86px 80px;height:100%;display:flex;flex-direction:column}
  .top{display:flex;align-items:center;gap:20px}
  .top img{width:78px;height:78px;border-radius:50%}
  .brand{font-size:34px;font-weight:800;letter-spacing:-.5px}
  .brand span{display:block;font-size:19px;font-weight:500;color:#c8bfa8;margin-top:5px;letter-spacing:0}
  .date{margin-left:auto;text-align:right;font-size:21px;color:#c8bfa8;line-height:1.5}
  .ganji{margin-top:64px;font-size:150px;font-weight:800;letter-spacing:10px;color:#e7b955;line-height:1}
  .ganji small{display:block;font-size:34px;font-weight:600;letter-spacing:2px;color:#c8bfa8;margin-top:18px}
  .line{margin-top:52px;height:2px;background:linear-gradient(90deg,#e7b955,transparent)}
  .body{margin-top:52px;font-size:41px;line-height:1.62;font-weight:600;word-break:keep-all}
  .body b{color:#e7b955}
  .pick{margin-top:auto;display:flex;gap:20px}
  .card{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(231,185,85,.34);
    border-radius:22px;padding:30px 32px}
  .card .k{font-size:20px;color:#c8bfa8;letter-spacing:.06em}
  .card .v{margin-top:12px;font-size:39px;font-weight:800}
  .card .s{margin-top:9px;font-size:25px;color:#e7b955;font-weight:700}
  .foot{margin-top:44px;display:flex;align-items:center;font-size:26px;color:#c8bfa8}
  .foot b{color:#f4efe4;font-weight:700}
  .foot .r{margin-left:auto;font-size:22px}
</style></head><body>
<div class="glow g1"></div><div class="glow g2"></div>
<div class="wrap">
  <div class="top">
    <img src="logo.png" alt="">
    <div class="brand">동네보살<span>무료 사주 · 오늘의 운세</span></div>
    <div class="date">${date}<br>${SJ_TTI[p.d.b]}띠 날</div>
  </div>

  <div class="ganji">${ganji}<small>${han} 일진</small></div>
  <div class="line"></div>

  <div class="body">${lo.gan}${lo.el}(${lo.han}) 일간인 사람.<br>
    오늘 자네한테는 <b>${lo.rel}</b>이 도네.<br><br>
    ${lo.T[4]}</div>

  <div class="pick">
    <div class="card"><div class="k">오늘 가장 무거운 자리</div>
      <div class="v">${lo.gan}${lo.el} 일간</div><div class="s">${lo.rel} ${lo.score}점</div></div>
    <div class="card"><div class="k">오늘 가장 좋은 자리</div>
      <div class="v">${hi.gan}${hi.el} 일간</div><div class="s">${hi.rel} ${hi.score}점</div></div>
  </div>

  <div class="foot"><b>dongnebosal.com</b><span class="r">생일만 넣으면 내 일간이 나오네</span></div>
</div>
</body></html>`;

fs.writeFileSync(path.join(OUT, "index.html"), html, "utf8");
console.log("생성:", path.join(OUT, "index.html"));
console.log(`${date} ${ganji}(${han})일 · ${SJ_TTI[p.d.b]}띠`);
console.log(`최저 ${lo.gan}${lo.el} ${lo.rel} ${lo.score} / 최고 ${hi.gan}${hi.el} ${hi.rel} ${hi.score}`);
