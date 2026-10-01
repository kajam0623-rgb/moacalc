// 띠 궁합 원고 검사기. 사용:
//   node tti_check.js pairs <출력.json> <입력.json>   (짝 원고)
//   node tti_check.js hubs  <출력.json> <입력.json>   (띠별 도입 글)
//   node tti_check.js all-pairs <합친 pairs.json>      (78쌍 전체: 문장 중복·분량)
// 오류(H)는 0이 될 때까지 고친다. 경고(S)는 가능하면 줄인다.
const fs = require("fs");
const [, , mode, outF, inF] = process.argv;
const BAN = /위험|흉(?!내|터)|불행|재앙|재난|불길|불운|파탄|이혼|사별|실패|나쁜|망하|최악|저주|상극|원수|악연|헤어|깨지|절대|반드시|결혼하면 안|단점|약하|약한|약해|약점|얇[은아다으고게]|여리[다고지게며]|여린|여려|모자라|모자란|부족한 사람|힘이 없/;
const JARGON = /일간|용신|십성|격국|신강|신약|지장간|천간|(?<![가-힣])지지(?![가-힣])|합화|오행|상생/; // 지지는 낱말일 때만(촘촘해지지·흐트러지지 같은 활용형은 통과)
const BOSAL = /(일세|하네|이야|이지|하게|하세나|이군|하군)[.!?]?$/;
const REL = ["삼합", "육합", "충", "원진", "형"];
const SENT = t => String(t).split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
const issues = [];
const H = (k, m) => issues.push(["H", k, m]), S = (k, m) => issues.push(["S", k, m]);
const len = (k, f, v, lo, hi) => { const n = String(v || "").length; if (n < lo || n > hi) H(k, `${f} ${n}자(허용 ${lo}~${hi})`); };

function common(k, f, text) {
  SENT(text).forEach(s => {
    if (BAN.test(s)) H(k, `${f} 금지어: ${(s.match(BAN) || [])[0]} — ${s.slice(0, 36)}…`);
    if (JARGON.test(s)) H(k, `${f} 어려운 명리 용어: ${(s.match(JARGON) || [])[0]}`);
    if (BOSAL.test(s)) H(k, `${f} 보살 말투 끝맺음: ${s.slice(-14)}`);
    if (s.length > 95) S(k, `${f} 긴 문장 ${s.length}자`);
    if (!/(다|요)[.!?]?$/.test(s)) S(k, `${f} 존댓말 끝맺음이 아닌 문장: …${s.slice(-12)}`);
  });
  if (/[{}]|undefined|NaN|\[object/.test(text)) H(k, `${f} 토큰·깨진 값`);
  if (/\d{2,}점|\d+%/.test(text)) S(k, `${f} 점수·퍼센트 숫자`);
}

if (mode === "pairs") {
  const out = JSON.parse(fs.readFileSync(outF, "utf8")), inp = JSON.parse(fs.readFileSync(inF, "utf8"));
  inp.forEach(p => {
    const o = out[p.key], k = p.key;
    if (!o) return H(k, "원고 없음");
    ["sum", "love", "work", "home", "tips", "myth"].forEach(f => { if (o[f] == null) H(k, `필드 없음: ${f}`); });
    if (!o.sum) return;
    len(k, "sum", o.sum, 45, 90); len(k, "love", o.love, 200, 350); len(k, "work", o.work, 180, 330); len(k, "home", o.home, 150, 290); len(k, "myth", o.myth, 45, 105);
    if (!Array.isArray(o.tips) || o.tips.length !== 3) H(k, "tips 는 문자열 3개"); else {
      o.tips.forEach((t, i) => len(k, "tips[" + i + "]", t, 45, 115));
      if (new Set(o.tips.map(t => t.split(" ")[0])).size < 3) H(k, "tips 세 개의 첫 단어가 겹친다");
    }
    ["sum", "love", "work", "home", "myth"].forEach(f => common(k, f, o[f])); (o.tips || []).forEach((t, i) => common(k, "tips[" + i + "]", t));
    const names = p.a === p.b ? [p.a] : [p.a, p.b];
    ["sum", "love", "work", "home"].forEach(f => names.forEach(n => { if (!String(o[f]).includes(n)) H(k, `${f} 에 '${n}' 가 없다`); }));
    // 다른 종류의 관계 이름은 쓰지 않는다(무난·같은 띠는 관계 이름 자체를 쓰지 않는다)
    const own = REL.includes(p.type) ? [p.type] : [];
    const all = ["sum", "love", "work", "home", "myth"].map(f => o[f]).concat(o.tips || []).join(" ");
    REL.filter(r => !own.includes(r)).forEach(r => { const re = r === "충" ? /(?<![가-힣])충(?![가-힣])|[가-힣]충[이은을과의]/ : r === "형" ? /(?<![가-힣])형(?![가-힣])/ : new RegExp(r); if (re.test(all)) H(k, `다른 종류의 관계 이름 '${r}' 를 썼다(이 짝은 ${p.type})`); });
    if (!REL.includes(p.type) && /합이나|합과|합이 |합의 /.test(all)) H(k, "관계 이름 없는 짝인데 '합'을 말한다");
    // 같은 짝 안에서 같은 문장 반복
    const ss = SENT(all), dup = ss.filter((s, i) => ss.indexOf(s) !== i); if (dup.length) H(k, "같은 문장이 두 번: " + dup[0].slice(0, 30));
  });
  Object.keys(out).filter(k => !inp.some(p => p.key === k)).forEach(k => H(k, "입력에 없는 키"));
} else if (mode === "hubs") {
  const out = JSON.parse(fs.readFileSync(outF, "utf8")), inp = JSON.parse(fs.readFileSync(inF, "utf8"));
  inp.forEach(h => {
    const o = out[h.key], k = h.key; if (!o) return H(k, "원고 없음");
    ["intro", "love", "work", "tip"].forEach(f => { if (!o[f]) H(k, "필드 없음: " + f); });
    len(k, "intro", o.intro, 170, 320); len(k, "love", o.love, 150, 280); len(k, "work", o.work, 150, 280); len(k, "tip", o.tip, 100, 220);
    ["intro", "love", "work", "tip"].forEach(f => { common(k, f, o[f]); if (!String(o[f]).includes(h.name)) H(k, `${f} 에 '${h.name}' 가 없다`); });
    const all = ["intro", "love", "work", "tip"].map(f => o[f]).join(" "); REL.forEach(r => { if (r !== "충" && new RegExp(r).test(all)) H(k, `띠별 도입 글에서 관계 이름 '${r}' 는 쓰지 않는다(표가 따로 싣는다)`); });
    if (/(?<![가-힣])충(?![가-힣])/.test(all)) H(k, "관계 이름 '충' 은 쓰지 않는다");
  });
} else if (mode === "all-pairs") {
  const o = JSON.parse(fs.readFileSync(outF, "utf8")), keys = Object.keys(o), seen = new Map();
  if (keys.length !== 78) H("전체", `짝이 ${keys.length}개(기대 78)`);
  keys.forEach(k => { const t = [o[k].sum, o[k].love, o[k].work, o[k].home, o[k].myth].concat(o[k].tips).join(" "); SENT(t).forEach(s => { if (s.length >= 14) { if (!seen.has(s)) seen.set(s, []); seen.get(s).push(k); } }); });
  [...seen].filter(([, v]) => new Set(v).size > 1).slice(0, 12).forEach(([s, v]) => H([...new Set(v)].join(","), "다른 짝과 같은 문장: " + s.slice(0, 40)));
  const total = keys.map(k => [o[k].sum, o[k].love, o[k].work, o[k].home, o[k].myth].concat(o[k].tips).join("").length), mean = total.reduce((a, b) => a + b, 0) / (total.length || 1);
  console.log("짝", keys.length, "· 짝당 평균 글자", Math.round(mean), "· 최소", Math.min(...total), "· 최대", Math.max(...total));
} else { console.log("사용법: pairs|hubs|all-pairs"); process.exit(2); }

const h = issues.filter(x => x[0] === "H"), s = issues.filter(x => x[0] === "S");
issues.slice(0, 60).forEach(([lv, k, m]) => console.log(`${lv} ${k}: ${m}`));
console.log(`\n오류 ${h.length} · 경고 ${s.length}`);
process.exit(h.length ? 1 : 0);
