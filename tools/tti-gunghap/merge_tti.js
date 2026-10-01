// 에이전트가 쓴 띠 궁합 원고(out/pairs_01~07.json, out/hubs.json)를 합쳐 content_ttigunghap_text.js 로 쓴다.
// 사용: node merge_tti.js [out 폴더]   — 합치기 전에 78쌍 전체 검사(문장 중복·분량)를 돌리고, 오류가 있으면 쓰지 않는다.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const OUT = process.argv[2] || "C:/tmp/moacalc-learn/tti/out";
const ROOT = path.join(__dirname, "..", "..");
const T = require(path.join(ROOT, "content_ttigunghap.js"));
const pairs = {};
for (let i = 1; i <= 7; i++) {
  const f = path.join(OUT, "pairs_0" + i + ".json");
  if (!fs.existsSync(f)) { console.error("없음:", f); process.exit(1); }
  Object.assign(pairs, JSON.parse(fs.readFileSync(f, "utf8")));
}
const hubs = JSON.parse(fs.readFileSync(path.join(OUT, "hubs.json"), "utf8"));
const miss = T.PAIR_LIST.filter(p => !pairs[p.key]).map(p => p.key), extra = Object.keys(pairs).filter(k => !T.PAIR_LIST.some(p => p.key === k));
const missHub = T.JI.filter(z => !hubs[z.en]).map(z => z.en);
if (miss.length || extra.length || missHub.length) { console.error("빠진 짝:", miss.join(","), "· 모르는 키:", extra.join(","), "· 빠진 띠:", missHub.join(",")); process.exit(1); }
// 필드 순서를 고정해 diff 가 안정적으로
const ordered = {}; T.PAIR_LIST.forEach(p => { const o = pairs[p.key]; ordered[p.key] = { sum: o.sum, love: o.love, work: o.work, home: o.home, tips: o.tips, myth: o.myth }; });
const orderedHubs = {}; T.JI.forEach(z => { const o = hubs[z.en]; orderedHubs[z.en] = { intro: o.intro, love: o.love, work: o.work, tip: o.tip }; });
const tmp = path.join(OUT, "merged_pairs.json"); fs.writeFileSync(tmp, JSON.stringify(ordered));
try { cp.execFileSync("node", [path.join(__dirname, "tti_check.js"), "all-pairs", tmp], { stdio: "inherit" }); }
catch (e) { console.error("전체 검사 실패 — content_ttigunghap_text.js 를 쓰지 않았다"); process.exit(1); }
const body = "/* 띠 궁합 원고(짝 78 · 띠별 도입 12) — tools/tti-gunghap/merge_tti.js 가 에이전트 원고를 합쳐 쓴다. 손으로 고치지 말고 원고를 고쳐 다시 합친다. */\nmodule.exports = " + JSON.stringify({ pairs: ordered, hubs: orderedHubs }, null, 1) + ";\n";
fs.writeFileSync(path.join(ROOT, "content_ttigunghap_text.js"), body);
console.log("합침 완료: 짝", Object.keys(ordered).length, "· 띠별", Object.keys(orderedHubs).length, "→ content_ttigunghap_text.js", Math.round(body.length / 1000) + "KB");
