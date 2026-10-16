/* 사주 결과를 브라우저 없이 뽑는다 — hub.html 의 실제 사주 도구(render·go)를 가짜 화면으로 돌려 #out 의 HTML 을 받는다.
   화면 후처리(sjDedupe 등)는 document 가 없어 돌지 않는다 → 조립 단계에서 나온 글 그대로를 본다.
   쓰는 곳: verify.js(무작위 명식 검사), 사람이 읽어 보기(node tools/sajucheck/render.js 1990-03-15 14 m) */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..", "..");
const src = fs.readFileSync(path.join(ROOT, "hub.html"), "utf8");
const inner = src.match(/<script>([\s\S]*?)<\/script>/)[1];
const engine = inner.slice(inner.indexOf("var SJ_S="), inner.indexOf("// ---------- shared"));
const shared = inner.slice(inner.indexOf("function earnedDed"), inner.indexOf("// ---------- TOOLS"));
const blk = (() => { const i = inner.indexOf('{id:"saju"'), j = inner.indexOf('{id:"', i + 8); return inner.slice(i, j).trim().replace(/,$/, ""); })();
const COMBO = require(path.join(ROOT, "content_saju_combo.js")), VD = require(path.join(ROOT, "content_saju_verdict.js")), SY = require(path.join(ROOT, "content_saju_synth.js"));
const J = { "sj/char.json": require(path.join(ROOT, "content_saju_char.js")), "sj/easy.json": require(path.join(ROOT, "content_saju_easy.js")), "sj/q.json": require(path.join(ROOT, "content_saju_q.js")) };
Object.keys(COMBO).forEach(il => Object.keys(COMBO[il]).forEach(tg => {
  J["sj/" + il + "-" + tg + ".json"] = Object.assign({}, COMBO[il][tg], { v: Object.fromEntries(["money", "job", "love"].map(a => [a, { head: VD[a].head[il], follow: VD[a].follow[tg] }])),
    s: { p1: SY[il].synth[tg], miss: SY[il].miss, sin: SY[il].sin, now: SY.nowfit[tg] } }); }));
// 실제 화면의 Promise.all을 같은 순서로 즉시 완료해 기존 동기 검사 API를 유지한다.
const syncP = v => v && typeof v.then === "function" ? v : ({ then: f => syncP(f(v)), catch: () => syncP(v) });
const syncPromise = { resolve: syncP, all: values => { const out = []; values.forEach((p, i) => p.then(v => { out[i] = v; })); return syncP(out); } };
function stub(vals) {
  const kids = {};
  const o = { value: "", textContent: "", innerHTML: "", style: {}, dataset: {}, options: [], selectedOptions: [],
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    on: {}, addEventListener(ty, fn) { (this.on[ty] = this.on[ty] || []).push(fn); }, removeEventListener() {}, setAttribute() {}, getAttribute() { return ""; }, focus() {}, click() {}, scrollIntoView() {},
    insertBefore() {}, appendChild() {}, remove() {}, closest() { return null; },
    querySelector(s) { if (!kids[s]) { kids[s] = stub(vals); if (vals && s in vals) kids[s].value = vals[s]; } return kids[s]; },
    querySelectorAll() { return [stub(vals)]; } };
  return o;
}
const ctx = { console, Math, Date, JSON, Object, Array, String, Number, RegExp, Set, Map, Promise: syncPromise, isNaN, parseInt, parseFloat, encodeURIComponent, decodeURIComponent, setTimeout: () => 0, clearTimeout() {},
  Image: class { set src(v) {} }, window: { print() {}, addEventListener() {} },
  fetch: u => syncP({ ok: !!J[u], json: () => J[u] }),
  SAJU_GUNG: require(path.join(ROOT, "content_saju_gung.js")), SAJU_ILG: require(path.join(ROOT, "content_saju_ilgan.js")) };
vm.createContext(ctx);
vm.runInContext(engine + "\n" + shared, ctx);
// 화면에 손대는 도우미는 비운다(결과 글만 본다). askWire 는 go 를 붙잡는다
const NOOP = ["track", "birthDial", "foldAll", "plainWords", "fillBars", "slowReveal", "sjToon", "sjChapters", "bindSave", "bindSumShare", "bindShare", "bindYearFb", "tailAsk", "bindAiCopy", "iljuCardKey", "sjCelebFill"];
NOOP.forEach(n => { ctx[n] = () => {}; });
ctx.goodsRow = () => ""; ctx.location = { search: "" };
ctx.askWire = (el, go) => { ctx.__go = go; };
const tool = vm.runInContext("(" + blk + ")", ctx);

// 한 사람의 결과 HTML. h = 시각 "14"(그 시 30분), "03:30" 또는 null, g = "m"|"f"
function renderSaju(date, h, g, nm) {
  const vals = { "#d": date, "#t": "", "#tm": h != null ? (String(h).includes(":") ? h : h + "30") : "", "#c": "1", "#g": g || "m", "#nm": nm || "", "#q": "all" };
  const el = stub(vals);
  tool.render(el);
  (el.querySelector("#d").on.change || []).forEach(f => f());   // prefetch — 조합 원고(sj/<일간>-<십성>.json)를 받아 둔다(가짜 fetch 는 바로 끝난다)
  ctx.__go();
  return el.querySelector("#out").innerHTML;
}
// 읽기용 글(태그 걷고 칸마다 줄바꿈)
function toText(html) {
  return html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<h3[^>]*>/g, "\n## ").replace(/<\/h3>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n").replace(/<\/p>|<\/div>/g, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
module.exports = { renderSaju, toText, ctx };
if (require.main === module) {
  const [d, h, g] = process.argv.slice(2);
  console.log(toText(renderSaju(d || "1990-03-15", h && h !== "-" ? h : null, g || "m")));
}
