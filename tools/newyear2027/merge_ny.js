// 묶음 6개(out/batch_01~06.json)를 전체 검사한 뒤 content_newyear_by_text.js 를 쓴다.
// 사용: node merge_ny.js [출력 폴더] [입력 폴더]
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const C = require("./ny_check.js");
const OUT = process.argv[2] || "C:/tmp/moacalc-learn/ny2027/out", IN = process.argv[3] || "C:/tmp/moacalc-learn/ny2027/in";
const all = {}, errs = [], sha = [];
for (let n = 1; n <= 6; n++) {
  const fo = path.join(OUT, `batch_0${n}.json`), inp = JSON.parse(fs.readFileSync(path.join(IN, `batch_0${n}.json`), "utf8"));
  if (!fs.existsSync(fo)) { errs.push("없음: " + fo); continue; }
  const raw = fs.readFileSync(fo, "utf8"); sha.push(`batch_0${n} ${crypto.createHash("sha1").update(raw).digest("hex").slice(0, 8)}`);
  const out = JSON.parse(raw); errs.push(...C.checkBatch(out, inp));
  inp.forEach(i => { const o = out[i.key]; if (o) all[i.key] = { sum: o.sum, all: o.all, work: o.work, people: o.people, life: o.life, tips: o.tips }; });
}
errs.push(...C.dupSentences(all).filter(x => !errs.includes(x)));
if (Object.keys(all).length !== 60) errs.push(`연도 ${Object.keys(all).length}/60`);
if (errs.length) { console.log("병합 중단 — 오류 " + errs.length + "개"); errs.slice(0, 40).forEach(x => console.log(" - " + x)); process.exit(1); }
const file = path.join(__dirname, "../../content_newyear_by_text.js");
fs.writeFileSync(file, "// 자동 생성: tools/newyear2027/merge_ny.js (원고는 out/batch_0N.json — 직접 고치지 말고 그쪽을 고친 뒤 다시 병합)\n" +
  "// " + sha.join(" · ") + "\nmodule.exports = " + JSON.stringify(all, null, 1) + ";\n");
console.log("병합 완료:", Object.keys(all).length + "편 →", path.relative(process.cwd(), file), "·", sha.join(" · "));
