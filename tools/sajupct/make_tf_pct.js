// 오늘의 운세 '상위 N%' 표 — 오늘 점수는 (일주, 필요한 기운)으로 정해진다(tfScore). 1950~2009년생 모든 날짜(시각 모름, 도구와 같은 입력)를
// 같은 엔진으로 돌려 60일주 × 5기운(목화토금수) 칸별 사람 수를 센다. 결과(JSON 한 줄)를 hub.html 의 TF_PCT 에 넣는다.
// 사용: node tools/sajupct/make_tf_pct.js [--days N]   verify.js 가 표본(7일 간격)으로 다시 재서 맞춰 본다
const fs = require("fs"), path = require("path");
function engine() {
  const src = fs.readFileSync(path.join(__dirname, "../../hub.html"), "utf8"), inner = src.match(/<script>([\s\S]*?)<\/script>/)[1];
  return new Function(inner.slice(inner.indexOf("var SJ_S="), inner.indexOf("// ---------- shared")) + "\nreturn {sjPillars,sjStrength};")();
}
function make(step) {
  const E = engine(), H = Array.from({ length: 60 }, () => [0, 0, 0, 0, 0]);
  for (let t = Date.UTC(1950, 0, 1); t <= Date.UTC(2009, 11, 31); t += 86400000 * step) {
    const d = new Date(t), p = E.sjPillars(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), null, 0, false);
    const i = ((6 * p.d.s - 5 * p.d.b) % 60 + 60) % 60; // 갑자 번호: i%10=천간, i%12=지지
    H[i][E.sjStrength(p).yong]++;
  }
  return H;
}
module.exports = { make };
if (require.main === module) {
  const i = process.argv.indexOf("--days"), step = i > 0 ? +process.argv[i + 1] : 1;
  console.log(JSON.stringify(make(step)));
}
