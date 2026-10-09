// 신살 엔진 손 검산(2026-10-09) — sjSinsal 결과를 사람이 손으로 따진 값과 대조한다. 실행: node tools/sinsal_check.js
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "hub.html"), "utf8");
const inner = src.match(/<script>([\s\S]*?)<\/script>/)[1];
eval(inner.slice(inner.indexOf("var SJ_S="), inner.indexOf("// ---------- shared")));
const gz = p => ["y", "m", "d", "h"].filter(k => p[k]).map(k => SJ_S[p[k].s] + SJ_B[p[k].b]).join(" ");
const cases = [
  // [생년월일, 시(없으면 null), 반드시 있어야 할 신살, 없어야 할 신살]
  [[1990, 3, 15], null, ["도화살"], []],                 // 경오년(인오술→도화 묘), 기묘월 → 도화
];
let bad = 0;
for (const [[y, m, d], h, must, mustNot] of cases) {
  const p = sjPillars(y, m, d, h, 0, true), s = sjSinsal(p);
  const miss = must.filter(x => !s.includes(x)), extra = mustNot.filter(x => s.includes(x));
  console.log(`${y}-${m}-${d} ${gz(p)} → ${s.join(", ") || "(없음)"}${miss.length || extra.length ? "  ✗ 빠짐:" + miss + " 잘못:" + extra : ""}`);
  bad += miss.length + extra.length;
}
// 홍염·현침·귀문·원진 정의 그대로 다시 계산해 엔진과 비교(60갑자 일주 × 몇 해)
const HY = [6, 6, 2, 7, 4, 4, 10, 9, 0, 8], HS = [0, 7], HB = [3, 6, 8];
const GW = [[0, 9], [1, 6], [2, 7], [3, 8], [4, 11], [5, 10]], WJ = [[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]];
let n = 0;
for (let yy = 1960; yy < 2010; yy += 7) for (let mm = 1; mm <= 12; mm += 2) for (let dd = 1; dd <= 28; dd += 3) for (const hh of [null, 3, 15]) {
  const p = sjPillars(yy, mm, dd, hh, 0, true), s = sjSinsal(p), bs = [p.y.b, p.m.b, p.d.b].concat(p.h ? [p.h.b] : []), ss = [p.y.s, p.m.s, p.d.s].concat(p.h ? [p.h.s] : []);
  const others = bs.filter((_, i) => i !== 2), pair = T => others.some(o => T.some(([a, b]) => (a === p.d.b && b === o) || (b === p.d.b && a === o)));
  const want = { 홍염살: bs.includes(HY[p.d.s]), 현침살: ss.filter(x => HS.includes(x)).length + bs.filter(x => HB.includes(x)).length >= 2, 귀문관살: pair(GW), 원진살: pair(WJ) };
  for (const k in want) if (want[k] !== s.includes(k)) { bad++; if (bad < 5) console.log("✗", yy, mm, dd, hh, gz(p), k, want[k]); }
  n++;
}
console.log(`대조 ${n}명, 어긋남 ${bad}`);
process.exit(bad ? 1 : 0);
