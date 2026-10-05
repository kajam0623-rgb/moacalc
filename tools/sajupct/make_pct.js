// 사주 결과 '상위 N%' 표 — 1950~2009년생 모든 날짜 × 12시진을 같은 엔진(hub.html)으로 돌려
// 십성 무리(비겁·식상·재성·관성·인성) 칸 수의 분포를 센다. 결과(JSON 한 줄)를 hub.html 의 SJ_PCT 에 넣는다.
// 사용: node tools/sajupct/make_pct.js [--days N]   (N일 간격 표본, 기본 1 = 전수). verify.js 가 표본으로 다시 재서 맞춰 본다
const fs = require("fs"), path = require("path");
function engine() {
  const src = fs.readFileSync(path.join(__dirname, "../../hub.html"), "utf8");
  const inner = src.match(/<script>([\s\S]*?)<\/script>/)[1];
  return new Function(inner.slice(inner.indexOf("var SJ_S="), inner.indexOf("// ---------- shared")) + "\nreturn {sjPillars,sjTenGod,SJ_BMAIN};")();
}
const GRP = { 비견: 0, 겁재: 0, 식신: 1, 상관: 1, 편재: 2, 정재: 2, 편관: 3, 정관: 3, 편인: 4, 정인: 4 };
// 결과 화면(hub.html saju)과 같은 셈: 날 하늘 글자(나)는 빼고, 하늘 글자는 십성, 아래 글자는 본기의 십성
function counts(E, p) { const g = [0, 0, 0, 0, 0], ch = [p.y, p.m, p.d]; if (p.h) ch.push(p.h);
  ch.forEach((c, ci) => { if (ci !== 2) g[GRP[E.sjTenGod(p.d.s, c.s)]]++; g[GRP[E.sjTenGod(p.d.s, E.SJ_BMAIN[c.b])]]++; }); return g; }
function make(step) {
  const E = engine(), H = { h: [0, 1, 2, 3, 4].map(() => new Array(8).fill(0)), n: [0, 1, 2, 3, 4].map(() => new Array(8).fill(0)) };
  for (let t = Date.UTC(1950, 0, 1); t <= Date.UTC(2009, 11, 31); t += 86400000 * step) {
    const d = new Date(t), y = d.getUTCFullYear(), mo = d.getUTCMonth() + 1, dd = d.getUTCDate();
    counts(E, E.sjPillars(y, mo, dd, null, 0, true)).forEach((v, i) => H.n[i][v]++);
    for (let h = 0; h < 24; h += 2) counts(E, E.sjPillars(y, mo, dd, h, 30, true)).forEach((v, i) => H.h[i][v]++);
  }
  return H;
}
module.exports = { make, counts, engine };
if (require.main === module) {
  const i = process.argv.indexOf("--days"), step = i > 0 ? +process.argv[i + 1] : 1, t0 = Date.now();
  const H = make(step);
  console.error("간격", step, "일 · 시각 있는 표본", H.h[0].reduce((a, b) => a + b, 0), "· ", ((Date.now() - t0) / 1000).toFixed(1) + "초");
  console.log(JSON.stringify({ h: H.h, n: H.n }));
}
