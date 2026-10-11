// 말투 바꾼 원고 검사: node tools/tone/check.js content_x.js
// 원본(tools/tone/orig/<파일>)과 키 구조·자리표시(placeholder)·태그 개수가 같은지, 보살 어미가 남았는지 본다
const path = require("path"), fs = require("fs");
const f = process.argv[2], ROOT = path.join(__dirname, "..", "..");
const cur = require(path.join(ROOT, f)), org = require(path.join(__dirname, "orig", path.basename(f)));
const BOSAL = /자네|일세[.!?,]|걸세|하게[.!]|하네[.!?]|있네[.!?]|없네[.!?]|좋네[.!?]|되네[.!?]|이네[.!?]|오네[.!?]|보게[.!]|두게[.!]|말게[.!]|[가-힣]네\.$/;
const PH = s => (s.match(/\{[A-Za-z_]+\}|\$\{[^}]+\}|<[^>]+>|\\n/g) || []).sort().join("|");
const errs = [];
let n = 0, left = [];
(function walk(a, b, at) {
  if (typeof a === "string") {
    n++;
    if (typeof b !== "string") return errs.push(at + ": 원본은 문자열 아님");
    if (PH(a) !== PH(b)) errs.push(at + ": 자리표시·태그가 달라짐");
    if (!/note$/.test(at) && BOSAL.test(a)) left.push(at + ": " + a.slice(0, 50));
    return;
  }
  if (Array.isArray(a)) { if (!Array.isArray(b) || a.length !== b.length) return errs.push(at + ": 배열 길이 다름"); return a.forEach((x, i) => walk(x, b[i], at + "[" + i + "]")); }
  if (a && typeof a === "object") {
    const ka = Object.keys(a).sort().join(","), kb = Object.keys(b || {}).sort().join(",");
    if (ka !== kb) return errs.push(at + ": 키가 다름");
    return Object.keys(a).forEach(k => walk(a[k], b[k], at + "." + k));
  }
})(cur, org, path.basename(f));
console.log(`${f}: 문자열 ${n}개, 구조 오류 ${errs.length}, 보살 어미 남음 ${left.length}`);
errs.slice(0, 10).forEach(e => console.log("  ✗ " + e));
left.slice(0, 10).forEach(e => console.log("  · " + e));
console.log(errs.length || left.length ? "FAIL" : "OK");
process.exit(errs.length || left.length ? 1 : 0);
