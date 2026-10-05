// 궁합 '상위 N%' 표 — hub.html 궁합 도구의 점수 함수 pts(a,b)를 그대로 뽑아, 1950~2009년생 두 사람 짝(시각 모름)을
// 고정 시드로 무작위 20만 쌍 돌려 점수 분포(35~99점 칸별 개수)를 센다. 결과(JSON 배열)를 hub.html 의 GH_PCT 에 넣는다.
// 사용: node tools/sajupct/make_gh_pct.js [--n 200000]   verify.js 가 다른 시드 표본으로 다시 재서 맞춰 본다
const fs = require("fs"), path = require("path");
function load() {
  const src = fs.readFileSync(path.join(__dirname, "../../hub.html"), "utf8"), inner = src.match(/<script>([\s\S]*?)<\/script>/)[1];
  const eng = inner.slice(inner.indexOf("var SJ_S="), inner.indexOf("// ---------- shared"));
  const a = inner.indexOf("    function pts(a,b){"), b = inner.indexOf("\n    }\n", a) + 6;
  return new Function(eng + "\n" + inner.slice(a, b) + "\nreturn {sjPillars,pts};")();
}
function make(n, seed) {
  const E = load(), H = new Array(65).fill(0), D0 = Date.UTC(1950, 0, 1), ND = Math.round((Date.UTC(2009, 11, 31) - D0) / 864e5) + 1;
  let s = seed >>> 0; const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  const P = d => { const t = new Date(D0 + d * 864e5); return E.sjPillars(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), null, 0, false); };
  for (let i = 0; i < n; i++) H[E.pts(P(Math.floor(rnd() * ND)), P(Math.floor(rnd() * ND)))[0] - 35]++;
  return H;
}
module.exports = { make, load };
if (require.main === module) {
  const i = process.argv.indexOf("--n"), n = i > 0 ? +process.argv[i + 1] : 200000, t0 = Date.now();
  const H = make(n, 20261005);
  console.error("짝", n, "쌍 ·", ((Date.now() - t0) / 1000).toFixed(1) + "초");
  console.log(JSON.stringify(H));
}
