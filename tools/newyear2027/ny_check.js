// 년생별 2027 운세 원고 검사기.
// 묶음:  node ny_check.js <출력.json> <입력.json>
// 전체:  node ny_check.js all <출력 폴더> <입력 폴더>   (묶음 검사 + 묶음 사이 같은 문장)
// 금지어·문체 규칙은 STYLE_NY.md 와 같고, verify.js 가 같은 규칙으로 병합본을 다시 본다.
const fs = require("fs"), path = require("path");
// 글자 순서로 찾으므로 낱말 안에 든 경우(계약하·예약해·그대로·일정인·일주일간·삼형제)는 앞뒤 글자로 빼 준다
const BAN = /위험|흉(?!내|터)|불행|재앙|재난|불길|불운|파탄|이혼|사별|실패|나쁜|망하|최악|저주|상극|원수|악연|헤어|깨지|절대|반드시|단점|(?<![계예절요규공조특제서언확협해])약(?:하|한|해|점)|얇[은아다으고게]|여리[다고지게며]|여린|여려|모자라|모자란|부족한 사람|(?<![가-힣])힘이 없|큰일 나|수술|입원|질병|병에 걸|진단을 받|암 ?검진|주식|코인|가상화폐|로또|당신|자네|그대(?!로)/;
const JARG = /(?<![가-힣])일간|용신|십성|격국|신강|신약|지장간|천간|(?<![가-힣])지지(?![가-힣])|합화|오행|상생|(?<![가-힣])(?:비견|겁재|식신|상관(?!없)|편재|정재|편관|정관|편인(?![데지가걸])|정인(?![데지가걸]))|대운/;
const REL = { "삼합": /삼합/, "육합": /육합/, "충": /(?<![가-힣])충(?![가-힣])/, "원진": /원진/, "형": /(?<![가-힣])형(?![가-힣])|삼형(?!제)/, "같은 띠": /같은 띠/ };
const END = /(니다|세요|까요)[.!?]$/;
const LEN = { sum: [45, 90], all: [240, 400], work: [160, 300], people: [150, 280], life: [110, 220] };
const SENT = x => String(x).split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
const FIELDS = ["sum", "all", "work", "people", "life"];

function checkOne(inp, o) {
  const e = [], k = inp.key, A = inp.animal;
  if (!o || typeof o !== "object") return [k + ": 없음"];
  FIELDS.forEach(f => { const v = o[f]; if (typeof v !== "string" || !v) { e.push(`${k}.${f}: 비었음`); return; }
    const [lo, hi] = LEN[f]; if (v.length < lo || v.length > hi) e.push(`${k}.${f}: 분량 ${v.length}자(기준 ${lo}~${hi})`); });
  if (!Array.isArray(o.tips) || o.tips.length !== 3) e.push(`${k}.tips: 3개가 아님`);
  else { o.tips.forEach((t, i) => { if (typeof t !== "string" || t.length < 40 || t.length > 100) e.push(`${k}.tips${i}: 분량 ${String(t).length}자(기준 40~100)`); if (SENT(t).length !== 1) e.push(`${k}.tips${i}: 한 문장이 아님`); });
    const heads = o.tips.map(t => String(t).split(/\s/)[0]); if (new Set(heads).size !== 3) e.push(`${k}.tips: 첫 낱말이 겹침(${heads.join("/")})`); }
  if (SENT(o.sum).length !== 1) e.push(`${k}.sum: 한 문장이 아님`);
  ["sum", "all"].forEach(f => { if (!String(o[f]).includes(inp.year + "년생")) e.push(`${k}.${f}: '${inp.year}년생' 없음`); if (!String(o[f]).includes(A)) e.push(`${k}.${f}: '${A}' 없음`); });
  const texts = FIELDS.map(f => o[f]).concat(o.tips || []).map(String), all = texts.join(" ");
  SENT(all).forEach(s => { if (BAN.test(s)) e.push(`${k}: 금지어 — ${s.match(BAN)[0]} 「${s.slice(0, 24)}」`);
    if (JARG.test(s)) e.push(`${k}: 어려운 용어 — ${s.match(JARG)[0]} 「${s.slice(0, 24)}」`);
    if (!END.test(s)) e.push(`${k}: 존댓말 끝맺음 아님 「${s.slice(-16)}」`);
    if (s.length > 110) e.push(`${k}: 긴 문장 ${s.length}자 「${s.slice(0, 20)}」`); });
  Object.keys(REL).forEach(t => { if (t !== inp.rel.type && REL[t].test(all)) e.push(`${k}: 다른 관계 이름(${t})`); });
  if (inp.rel.type !== "무난" && REL[inp.rel.type] && (all.match(new RegExp(REL[inp.rel.type].source, "g")) || []).length > 2) e.push(`${k}: 관계 이름(${inp.rel.type})은 두 번까지`);
  if (/삼재/.test(all) && !/^(들|눌|날)삼재/.test(inp.samjae2027)) e.push(`${k}: 삼재가 아닌 해인데 '삼재'를 씀`);
  (all.match(/만 ?(\d+)세/g) || []).forEach(m => { const n = +m.replace(/\D/g, ""); if (!inp.ageNum.includes(n)) e.push(`${k}: 나이 ${m} — 계산값 ${inp.ageNum.join("·")}세와 다름`); });
  (all.match(/(?<!\d)(\d{4})년(?!생)/g) || []).forEach(m => { const n = +m.slice(0, 4); if (![inp.year, 2025, 2026, 2027, 2028, inp.sjNext].includes(n)) e.push(`${k}: 연도 ${m} — 쓰지 않는 해`); });
  (all.match(/(?<!\d)(\d{2})년생/g) || []).forEach(m => { if (m !== inp.short) e.push(`${k}: ${m} — 이 페이지는 ${inp.short}`); });
  (all.match(/(?<!\d)(\d{4})년생/g) || []).forEach(m => { if (m !== inp.year + "년생") e.push(`${k}: ${m} — 이 페이지는 ${inp.year}년생`); });
  if (/[\u{1F300}-\u{1FAFF}☀-➿]/u.test(all)) e.push(`${k}: 이모지`);
  if (/[“”"‘’]/.test(all)) e.push(`${k}: 따옴표(쓰지 말 것)`);
  return e;
}

function dupSentences(objs) {   // objs: {key: o} — 14자 이상 같은 문장이 두 연도에 나오면 오류
  const seen = new Map(), e = [];
  Object.entries(objs).forEach(([k, o]) => FIELDS.map(f => o[f]).concat(o.tips || []).forEach(t => SENT(t).forEach(s => { if (s.length < 14) return; if (!seen.has(s)) seen.set(s, new Set()); seen.get(s).add(k); })));
  seen.forEach((v, s) => { if (v.size > 1) e.push(`같은 문장(${[...v].join(",")}): ${s.slice(0, 30)}`); });
  return e;
}

function checkBatch(out, inp) {
  const e = []; inp.forEach(i => checkOne(i, out[i.key]).forEach(x => e.push(x)));
  Object.keys(out).forEach(k => { if (!inp.some(i => i.key === k)) e.push(`입력에 없는 키: ${k}`); });
  return e.concat(dupSentences(out));
}

module.exports = { checkOne, checkBatch, dupSentences, BAN, JARG, END, LEN, SENT, FIELDS };

if (require.main === module) {
  const a = process.argv.slice(2), rd = p => JSON.parse(fs.readFileSync(p, "utf8"));
  let errs = [];
  if (a[0] === "all") {
    const outs = {}, ins = [];
    for (let n = 1; n <= 6; n++) { const fo = path.join(a[1], `batch_0${n}.json`), fi = path.join(a[2], `batch_0${n}.json`);
      const inp = rd(fi); ins.push(...inp);
      if (!fs.existsSync(fo)) { errs.push(`없음: ${fo}`); continue; }
      const out = rd(fo); errs.push(...checkBatch(out, inp)); Object.assign(outs, out); }
    errs.push(...dupSentences(outs).filter(x => !errs.includes(x)));
    console.log(`전체 ${Object.keys(outs).length}/${ins.length}편`);
  } else errs = checkBatch(rd(a[0]), rd(a[1]));
  if (errs.length) { console.log("오류 " + errs.length + "개"); errs.forEach(x => console.log(" - " + x)); process.exit(1); }
  console.log("오류 0");
}
