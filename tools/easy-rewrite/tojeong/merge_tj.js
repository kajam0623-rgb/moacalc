// 다시 쓴 토정비결(out/tj_XX.json 또는 지정 파일)을 content_tojeong.js 에 괘 코드별로 합친다. grade 는 기존 값을 그대로 둔다.
// 사용: node merge_tj.js [파일...]   (없으면 out/tj_*.json 전부)
const fs = require("fs"), path = require("path");
const REPO = "C:/Users/닥터원츠/salary-calc/", F = REPO + "content_tojeong.js";
const src = fs.readFileSync(F, "utf8"), i = src.indexOf("module.exports = ");
if (i < 0) throw new Error("module.exports 없음");
const head = src.slice(0, i + 17), body = src.slice(i + 17).replace(/;\s*$/, ""), tail = src.slice(i + 17).match(/;\s*$/)[0], data = JSON.parse(body);
if (head + JSON.stringify(data, null, 1) + tail !== src) throw new Error("원문 형식(들여쓰기 1칸)이 달라졌다");
const args = process.argv.slice(2), files = args.length ? args : fs.readdirSync(__dirname + "/out").filter(f => /^tj_\d+\.json$/.test(f)).sort().map(f => __dirname + "/out/" + f);
const FIELDS = ["title", "sum", "image", "chongun", "money", "work", "love", "health", "tips", "flow", "months"];
let n = 0;
files.forEach(f => { const o = JSON.parse(fs.readFileSync(f, "utf8")); Object.keys(o).forEach(code => {
  if (!data[code]) throw new Error(f + ": 없는 괘 " + code);
  FIELDS.forEach(k => { if (o[code][k] == null) throw new Error(f + " " + code + ": " + k + " 없음"); });
  const nx = { title: o[code].title, grade: data[code].grade }; FIELDS.slice(1).forEach(k => { nx[k] = o[code][k]; }); data[code] = nx; n++; }); });
const headNew = head.replace(/^\/\/[^\n]*\n/, "// 토정비결 144괘 — 동네보살이 쉬운 말로 새로 쓴 풀이(보살 말투). 전통 괘의 방향(길·평·흉)과 상징을 따르고, 칸은 title(제목) sum(한눈에) image(옛 그림 풀이) chongun(총운) money·work·love·health(분야별) tips(실천 3) flow(달별 분위기 12글자 g·o·c) months(음력 1~12월). grade = 길·평·흉\n");
fs.writeFileSync(F, headNew + JSON.stringify(data, null, 1) + tail);
console.log("합친 괘", n, "개 · 파일", files.length, "개 ·", Object.keys(data).filter(k => data[k].flow).length + "/144 괘가 새 형식");
