// 토정비결 다시 쓰기 검사기. 사용: node tj_check.js <출력.json> <원문.json>  — 오류(H)가 있으면 종료코드 1
const fs = require("fs");
const [, , OUT, ORIG] = process.argv;
if (!OUT || !ORIG) { console.error("사용: node tj_check.js <출력.json> <원문.json>"); process.exit(2); }
const load = f => JSON.parse(fs.readFileSync(f, "utf8"));
const O = load(OUT), R = load(ORIG);
const JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요|드립니다|주세요/;
const NEG = /위험|흉(?!내|터)|불행|재앙|사고(?!력)|실패|나쁜|망하|망한|화근|재난|불길|불운|파탄|파산|몰락|이혼|사별|단명|요절|횡액|관재|기운이 얇|기운이 약|복이 없|팔자가 사납|팔자가 세|액운|액땜/;
const HARD = /격국|용신|십성|신강|신약|일간|월지|천간|(?<![가-힣])지지|비견|겁재|식신|상관(?!없|이 없|이 있)|편재|정재|편관|정관|편인|정인|인성|재성|관성|식상|비겁/; // '이어지지'·'상관없이' 같은 흔한 말은 걸리지 않게
// 옛 말·한자어·시적 표현: 쉬운 말로 바꿔야 한다
const ARCH = /섣달|동짓달|정월|귀인|혼사|횡재|송사|구설|시비|곳간|음덕|덕망|경사|재물운|복을 짓|왕성|번창|융성|형통|도모|삼가|근신|유념|임하게|처신|길복|옥구슬|꾀꼬리|오곡|비단|보금자리|사방으로|형국|연유|대저|하매|울타리|덩굴|김매듯|나이테|가지치기|신선|보배|재물의 별|복덕|액을|탈이|탈을|탈로/;
const TOKEN = /[{}]|undefined|NaN|\[object/;
const H = [], S = [];
const add = (arr, code, f, msg, s) => arr.push(code + "." + f + " — " + msg + (s ? " : …" + String(s).slice(0, 60) + "…" : ""));
const sents = s => String(s).split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
const need = { title: [8, 30], sum: [60, 200], image: [50, 200], chongun: [250, 430], money: [70, 240], work: [70, 240], love: [70, 240], health: [70, 240] };
const codes = Object.keys(R);
codes.forEach(code => {
  const o = O[code], r = R[code];
  if (!o) return add(H, code, "-", "괘가 없다");
  const strs = [];
  Object.keys(need).forEach(f => {
    const v = o[f];
    if (typeof v !== "string" || !v.trim()) return add(H, code, f, "칸이 비었거나 문자열이 아니다");
    const [lo, hi] = need[f]; if (v.length < lo || v.length > hi) add(H, code, f, "길이 " + v.length + "자 (허용 " + lo + "~" + hi + ")");
    strs.push([f, v]);
  });
  if (!Array.isArray(o.tips) || o.tips.length !== 3 || o.tips.some(x => typeof x !== "string" || x.length < 15 || x.length > 80)) add(H, code, "tips", "3개, 각 15~80자 문자열이어야 한다");
  else o.tips.forEach((x, i) => strs.push(["tips." + i, x]));
  const months = o.months || {};
  for (let m = 1; m <= 12; m++) { const v = months[m]; if (typeof v !== "string") { add(H, code, "months." + m, "달이 없다"); continue; } if (v.length < 85 || v.length > 250) add(H, code, "months." + m, "길이 " + v.length + "자 (허용 85~250)"); strs.push(["months." + m, v]); }
  if (Object.keys(months).length !== 12) add(H, code, "months", "달은 정확히 12개(1~12)");
  const fl = o.flow;
  if (typeof fl !== "string" || !/^[goc]{12}$/.test(fl)) add(H, code, "flow", "g·o·c 12글자여야 한다");
  else { const g = (fl.match(/g/g) || []).length, c = (fl.match(/c/g) || []).length, gr = r.grade;
    if (gr === "길" && !(g >= 5 && g <= 9 && c <= 3)) add(H, code, "flow", "길 괘는 g 5~9개·c 3개 이하 (지금 g" + g + " c" + c + ")");
    if (gr === "평" && !(g >= 3 && g <= 6 && c >= 2 && c <= 5)) add(H, code, "flow", "평 괘는 g 3~6개·c 2~5개 (지금 g" + g + " c" + c + ")");
    if (gr === "흉" && !(g >= 2 && g <= 5 && c >= 3 && c <= 7)) add(H, code, "flow", "흉 괘는 g 2~5개·c 3~7개 (지금 g" + g + " c" + c + ")"); }
  // 문체
  const seen = {};
  strs.forEach(([f, v]) => {
    let m;
    if ((m = JOND.exec(v))) add(H, code, f, "존댓말 어미 '" + m[0] + "'", v.slice(Math.max(0, m.index - 15)));
    if ((m = NEG.exec(v))) add(H, code, f, "겁주는 말 '" + m[0] + "'", v.slice(Math.max(0, m.index - 15)));
    const vv = f === "image" ? v.replace(/'[^']*'/g, "") : v; // 옛 그림 이름은 따옴표 안에 그대로 인용해도 된다
    if ((m = HARD.exec(vv.replace(/\([^)]*\)/g, "")))) add(H, code, f, "어려운 명리 용어 '" + m[0] + "'");
    if ((m = ARCH.exec(vv))) add(H, code, f, "옛 말·시적 말 '" + m[0] + "' — 쉬운 말로", vv.slice(Math.max(0, m.index - 15)));
    if ((m = TOKEN.exec(v))) add(H, code, f, "토큰/undefined '" + m[0] + "'");
    sents(v).forEach(x => { if (x.length > 105) add(H, code, f, "105자 넘는 문장", x); else if (x.length > 85) add(S, code, f, "85자 넘는 문장", x); const k = x.replace(/\s+/g, ""); if (k.length >= 14) { if (seen[k]) add(H, code, f, "같은 괘 안에서 같은 문장 되풀이", x); seen[k] = 1; } });
  });
  // 제목은 짧고 쉬운 말: 문장부호 없이 '~해'로 끝나는 꼴 권장
  if (o.title && /[.!?]$/.test(o.title)) add(H, code, "title", "제목 끝에 문장부호 금지");
});
// 괘끼리 제목이 겹치면 안 된다
const tcount = {}; codes.forEach(c => { const t = (O[c] || {}).title; if (t) (tcount[t] = tcount[t] || []).push(c); });
Object.keys(tcount).forEach(t => { if (tcount[t].length > 1) add(H, tcount[t].join(","), "title", "제목이 겹친다", t); });
// 이 파일에 없는 괘가 섞이지 않게
Object.keys(O).forEach(c => { if (!R[c]) add(H, c, "-", "원문에 없는 괘"); });
const totOut = codes.reduce((a, c) => a + JSON.stringify(O[c] || {}).length, 0), totIn = codes.reduce((a, c) => a + JSON.stringify(R[c]).length, 0);
console.log("괘 " + codes.length + "개 · 글자 " + totOut + " (원문 " + totIn + " → " + (totOut / totIn).toFixed(2) + "배)");
if (H.length) { console.log("오류(H) " + H.length + "건"); H.slice(0, 45).forEach(x => console.log("  ✗ " + x)); if (H.length > 45) console.log("  … 외 " + (H.length - 45) + "건"); }
if (S.length) { console.log("경고(S) " + S.length + "건"); S.slice(0, 8).forEach(x => console.log("  ! " + x)); }
console.log(H.length ? "→ 오류가 남았다. 고쳐서 다시 검사하라." : "→ 오류 0. 통과.");
process.exit(H.length ? 1 : 0);
