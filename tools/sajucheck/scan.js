/* 사주 결과 '한 사람 이야기' 검사 — 무작위 명식 N명을 실제 도구로 그려(render.js) 본문에서 어긋남을 센다.
   verify.js 가 3000명으로 돌려 전부 0 이어야 통과. 직접: node tools/sajucheck/scan.js 3000 [seed] */
const R = require("./render.js");
// 본문 = 종합부터 맺는 말까지의 풀이 글(근거 주석·회색 글씨·표·쿠팡 줄 빼고)
function prose(html) {
  const a = html.indexOf('<div class="sj-sec sj-synth'), b = html.indexOf('class="share', a);
  return html.slice(a, b < 0 ? html.length : b).replace(/<span style="color:var\(--muted\)[^>]*>[\s\S]*?<\/span>/g, "").replace(/<p class="(gh-note|note)">[\s\S]*?<\/p>/g, "")
    .replace(/<div class="sj-daeun">[\s\S]*?<\/div><p/g, "<p").replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<br\s*\/?>/g, " ").replace(/<\/p>|<\/h3>|<\/div>/g, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ");
}
const sents = t => t.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
// 규칙은 hub.html 의 거르개(sjFit)와 같은 정규식을 쓴다 — 조립이 제대로 걸렀는지 본다
const C = R.ctx, AGE = { young: C.SJ_YOUNG_BAN, senior: /소개팅|새 연애|연애 초반|썸|설레는 만남|월급|부모님|결혼 준비/ };
function check(date, h, g, nowY) {
  const html = R.renderSaju(date, h, g), t = prose(html), S = sents(t), y = +date.slice(0, 4), age = nowY - y, band = age < 35 ? "young" : age >= 55 ? "senior" : "mid";
  const st = /채워 가며 크는 편/.test(html.slice(html.indexOf("타고난 힘 "), html.indexOf("타고난 힘 ") + 30)) ? "weak" : /넉넉한 편/.test(html.slice(html.indexOf("타고난 힘 "), html.indexOf("타고난 힘 ") + 30)) ? "strong" : "mid";
  const bad = [];
  ["재물운","직업운","애정운","건강운","타고난 성격","맺는 말","타고난 그릇 모양"].forEach(k => { if (html.indexOf(">" + k) < 0 && html.indexOf(k + "<") < 0) bad.push(["칸 제목 빠짐", k]); });
  if (/<p>(\s|<br\s*\/?>)*<\/p>|<b>\s*<\/b>/.test(html)) bad.push(["빈 문단", date]);   // 거르개가 문장을 다 뺀 자리
  const own = S.filter(x => !C.SJ_OTHER.test(x));
  C.SJ_TRAIT_PAIRS.forEach((pr, i) => { const a = own.filter(x => pr[0].test(x)), b = own.filter(x => pr[1].test(x)); if (a.length && b.length) bad.push(["성향" + i, a[0].slice(0, 40) + " ↔ " + b[0].slice(0, 40)]); });
  if (st === "weak") S.filter(x => C.SJ_STRONG_CLAIM.test(x)).forEach(x => bad.push(["힘(약)", x.slice(0, 60)]));
  if (st === "strong") S.filter(x => C.SJ_WEAK_CLAIM.test(x)).forEach(x => bad.push(["힘(강)", x.slice(0, 60)]));
  if (age >= 45) S.filter(x => C.SJ_NEW_LOVE.test(x)).forEach(x => bad.push(["45+새만남", x.slice(0, 60)]));
  if (AGE[band]) S.filter(x => AGE[band].test(x)).forEach(x => bad.push(["나이" + band, x.slice(0, 60)]));
  const seen = {}; S.forEach(x => { const k = x.replace(/[^가-힣]/g, ""); if (k.length >= 14) { if (seen[k]) bad.push(["같은 문장", x.slice(0, 50)]); seen[k] = 1; } });
  return { bad, t, html, band, st };
}
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function run(N, seed) {
  const r = rnd(seed || 1012), nowY = new Date().getFullYear(), tally = {}, ex = {};
  for (let i = 0; i < N; i++) {
    const y = 1950 + Math.floor(r() * 59), m = 1 + Math.floor(r() * 12), d = 1 + Math.floor(r() * 28), h = r() < 0.35 ? null : String(Math.floor(r() * 24)).padStart(2, "0"), g = r() < 0.5 ? "m" : "f";
    const date = y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    check(date, h, g, nowY).bad.forEach(([k, v]) => { tally[k] = (tally[k] || 0) + 1; if (!ex[k]) ex[k] = date + " " + h + " " + g + " | " + v; });
  }
  return { tally, ex };
}
module.exports = { run, check, prose, sents };
if (require.main === module) { const r = run(+process.argv[2] || 300, +process.argv[3] || 1012); console.log(r.tally); console.log(r.ex); }
