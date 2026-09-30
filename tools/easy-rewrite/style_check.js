// 쉬운 말·긍정 베이스 검사기. 사용: node style_check.js <출력.json> [<원문.json>]  — 오류(H)가 있으면 종료코드 1
// JSON 안의 모든 문자열을 훑는다. 원문이 있으면 키 구조·길이 비(0.95~1.9배)도 본다
const fs = require("fs");
const [, , OUT, ORIG] = process.argv;
const LO = +(process.env.MINR || 0.95), HI = +(process.env.MAXR || 1.9);
if (!OUT) { console.error("사용: node style_check.js <출력.json> [<원문.json>]"); process.exit(2); }
const load = f => JSON.parse(fs.readFileSync(f, "utf8"));
const flat = (o, p = "", acc = {}) => { if (typeof o === "string") acc[p] = o; else if (o && typeof o === "object") Object.keys(o).forEach(k => flat(o[k], p ? p + "." + k : k, acc)); return acc; };
const JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요|드립니다|주세요/;
const NEG = /위험|흉(?!내|터)|불행|재앙|사고(?!력)|실패|나쁜|망하|망한|화근|재난|불길한|불길함|불운|파탄|파산|몰락|이혼|사별|단명|요절|횡액|관재|기운이 얇|기운이 약|복이 없|팔자가 사납|팔자가 세/;
const HARD = /격국|용신|십성|신강|신약|일간|월지|천간|비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인|인성|재성|관성|식상|비겁/;
const VAGUE = /덩굴|뿌리째|울타리|김매듯|솎아|두둑|나이테|가지치기|형국|연유|대저|하매/;
const TOKEN = process.env.TEMPLATES ? /undefined|NaN|\[object/ : /[{}]|undefined|NaN|\[object/;
const o = flat(load(OUT)), r = ORIG ? flat(load(ORIG)) : null;
const H = [], S = [];
const add = (arr, k, msg, s) => arr.push(k + " — " + msg + (s ? " : …" + s.slice(0, 70) + "…" : ""));
if (r) {
  Object.keys(r).forEach(k => { if (!(k in o)) add(H, k, "키가 없다"); });
  Object.keys(o).forEach(k => { if (!(k in r)) add(H, k, "원문에 없는 키"); });
}
let sentences = 0, chars = 0, longS = 0, vague = 0;
Object.keys(o).forEach(k => {
  const s = o[k];
  if (!s.trim()) return add(H, k, "빈 문자열");
  const bare = s.replace(/\([^)]*\)/g, "").replace(/<[^>]+>/g, "");
  let m;
  if ((m = JOND.exec(s))) add(H, k, "존댓말 어미 '" + m[0] + "'", s.slice(Math.max(0, m.index - 20)));
  if ((m = NEG.exec(s))) add(H, k, "겁주는/깎아내리는 말 '" + m[0] + "'", s.slice(Math.max(0, m.index - 20)));
  if ((m = HARD.exec(bare))) add(H, k, "어려운 명리 용어 '" + m[0] + "'(괄호 밖)", s.slice(Math.max(0, m.index - 20)));
  if ((m = TOKEN.exec(s))) add(H, k, "토큰/undefined '" + m[0] + "'");
  if ((m = VAGUE.exec(s))) { vague++; add(S, k, "뜻 짐작 어려운 말 '" + m[0] + "'"); }
  if (r && r[k]) { const q = s.length / r[k].length; if (q < LO || q > HI) add(H, k, "길이 비 " + q.toFixed(2) + "배(원문 " + r[k].length + "자 → " + s.length + "자, 허용 " + LO + "~" + HI + ")"); }
  s.replace(/<[^>]+>/g, "").split(/(?<=[.!?])\s+/).filter(Boolean).forEach(x => { sentences++; chars += x.length; if (x.length > 100) { longS++; add(S, k, "100자 넘는 문장", x); } });
});
const avg = sentences ? chars / sentences : 0;
if (avg > 48) add(S, "(전체)", "평균 문장 길이 " + avg.toFixed(1) + "자(48 이하로)");
const n = Object.keys(o).length, tot = Object.values(o).join("").length, tr = r ? Object.values(r).join("").length : 0;
console.log("문자열 " + n + "개 · 글자 " + tot + (r ? " (원문 " + tr + " → " + (tot / tr).toFixed(2) + "배)" : "") + " · 평균 문장 " + avg.toFixed(1) + "자 · 긴 문장 " + longS + " · 어려운 비유 " + vague);
if (H.length) { console.log("오류(H) " + H.length + "건"); H.slice(0, 40).forEach(x => console.log("  ✗ " + x)); if (H.length > 40) console.log("  … 외 " + (H.length - 40) + "건"); }
if (S.length) { console.log("경고(S) " + S.length + "건"); S.slice(0, 15).forEach(x => console.log("  ! " + x)); }
console.log(H.length ? "→ 오류가 남았다. 고쳐서 다시 검사하라." : "→ 오류 0. 통과.");
process.exit(H.length ? 1 : 0);
