/* 스레드 일일 원고 생성기.
   hub.html의 만세력 엔진과 원고를 그대로 읽어 그날 일진으로 글을 조립한다.
   지어내는 문장이 없으므로, 글을 보고 사이트에 온 사람이 같은 값을 본다.

   실행:  node threads_daily.js            → 오늘
          node threads_daily.js 2026-09-01 → 특정 날짜
          node threads_daily.js --week     → 오늘부터 7일치
*/
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "hub.html"), "utf8");
const inner = src.match(/<script>([\s\S]*?)<\/script>/)[1];
eval(inner.slice(inner.indexOf("var SJ_S="), inner.indexOf("// ---------- shared")));
eval(inner.slice(inner.indexOf("function earnedDed"), inner.indexOf("// ---------- TOOLS")));
const tfSrc = inner.slice(inner.indexOf('{id:"todayfortune"'));
eval(tfSrc.slice(tfSrc.indexOf("var TXT="), tfSrc.indexOf("el.innerHTML=")));

const NL = String.fromCharCode(10);
const WD = ["일", "월", "화", "수", "목", "금", "토"];
// 십성을 일상어로. 글은 이 사이트를 처음 보는 사람에게 간다 —
// "편관이 도네"라고만 쓰면 아무도 못 읽는다. 용어는 근거로 뒤에 붙인다.
const REL_PLAIN = {
  "비견": "내 힘이 세지는 날", "겁재": "돈이 새는 날",
  "식신": "말과 재주가 풀리는 날", "상관": "말이 앞서는 날",
  "편재": "큰돈이 오가는 날", "정재": "성실이 돈 되는 날",
  "편관": "압박이 들어오는 날", "정관": "원칙이 통하는 날",
  "편인": "생각이 깊어지는 날", "정인": "도움이 오는 날",
};
const ILGAN_PLAIN = require("./content_ilgan.js").reduce((m, g) => {
  m[g.ko] = g.metaphor; return m;
}, {});
// 일간 이름을 읽기 쉬운 형태로 — 갑 → 갑목(甲)
const ILGAN_LABEL = i => SJ_S[i] + SJ_EL[SJ_ES[i]] + "(" + SJ_SH[i] + ")";

function dayData(dt) {
  const p = sjPillars(dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), null, 0, false);
  const rows = [];
  for (let i = 0; i < 10; i++) {
    const rel = sjTenGod(i, p.d.s);
    rows.push({ ilgan: i, rel, score: TXT[rel][0], T: TXT[rel] });
  }
  return {
    dt, p,
    ganji: SJ_S[p.d.s] + SJ_B[p.d.b],
    han: SJ_SH[p.d.s] + SJ_BH[p.d.b],
    tti: SJ_TTI[p.d.b],
    rows,
    hi: rows.reduce((a, b) => (b.score > a.score ? b : a)),
    lo: rows.reduce((a, b) => (b.score < a.score ? b : a)),
  };
}

const HEAD = d =>
  `${d.ganji}(${d.han})일일세.`;
const TAIL = [
  "생일 하나 넣으면 오늘이 자네 날인지 아닌지 나오네. 프로필에 두었네.",
  "태어난 날만 알면 되네. 시간도 이름도 필요 없어.",
  "자네가 어느 쪽인지는 생일 하나로 갈리네.",
];

// 네 가지 각도를 날짜로 돌린다. 매일 같은 틀이면 금세 질린다.
// 어느 각도든 첫 줄은 일상어다. 간지·십성은 맨 뒤 근거 줄에만 둔다.
function why(d, x) {
  return `오늘은 ${d.ganji}(${d.han})일. 명리에서 ${ILGAN_LABEL(x.ilgan)} 일간에게 ${x.rel}이라 부르는 자리일세.`;
}
function compose(d) {
  const angle = (d.dt.getDate() + d.dt.getMonth()) % 4;
  const tail = TAIL[d.dt.getDate() % TAIL.length];

  if (angle === 0) {
    const x = d.lo;
    return [
      `오늘은 ${REL_PLAIN[x.rel]}일세.`, "",
      `누구한테? ${ILGAN_PLAIN[SJ_S[x.ilgan]]} 같은 사람.`, "",
      x.T[4], "",
      why(d, x), tail,
    ].join(NL);
  }
  if (angle === 1) {
    return [
      `오늘 잘 풀리는 사람과 눌리는 사람이 갈리네.`, "",
      `${REL_PLAIN[d.hi.rel]} — ${ILGAN_PLAIN[SJ_S[d.hi.ilgan]]} 같은 사람.`,
      `${REL_PLAIN[d.lo.rel]} — ${ILGAN_PLAIN[SJ_S[d.lo.ilgan]]} 같은 사람.`, "",
      d.lo.T[4], "",
      `날은 하나인데 사람마다 다른 이유가 이걸세.`,
      `태어난 날이 무엇이냐에 따라 오늘의 결이 정해지네.`, "",
      tail,
    ].join(NL);
  }
  if (angle === 2) {
    const a = d.hi.ilgan, b = a % 2 === 0 ? a + 1 : a - 1;
    const rb = d.rows[b];
    return [
      `같은 기운을 타고났는데 오늘이 갈리는 두 사람이 있네.`, "",
      `${ILGAN_PLAIN[SJ_S[a]]} 같은 사람 — ${REL_PLAIN[d.hi.rel]}.`,
      `${ILGAN_PLAIN[SJ_S[b]]} 같은 사람 — ${REL_PLAIN[rb.rel]}.`, "",
      `둘 다 ${SJ_EL[SJ_ES[a]]}의 기운일세. 그런데 하나는 밖으로 뻗고 하나는 안으로 스미네.`,
      `그 차이가 오늘을 가르네.`, "",
      tail,
    ].join(NL);
  }
  const x = d.rows[(d.dt.getDate() * 3) % 10];
  return [
    `오늘은 ${d.tti}띠의 기운이 깔린 날일세.`, "",
    `${ILGAN_PLAIN[SJ_S[x.ilgan]]} 같은 사람에게는 ${REL_PLAIN[x.rel]}이야.`, "",
    x.T[3], "",
    why(d, x), tail,
  ].join(NL);
}

function render(dt) {
  const d = dayData(dt);
  const stamp = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")} (${WD[dt.getDay()]})`;
  return { stamp, ganji: d.ganji, text: compose(d) };
}

const arg = process.argv[2];
const base = arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)
  ? new Date(+arg.slice(0, 4), +arg.slice(5, 7) - 1, +arg.slice(8, 10))
  : new Date();
const days = arg === "--week" ? 7 : 1;

const out = [];
for (let k = 0; k < days; k++) {
  const dt = new Date(base.getFullYear(), base.getMonth(), base.getDate() + k);
  const r = render(dt);
  out.push(`━━━ ${r.stamp} · ${r.ganji}일 ━━━\n\n${r.text}\n`);
}
const body = out.join("\n");
console.log(body);

// 붙여넣기용 파일도 남긴다 — 폰에서 열어 그대로 복사
fs.writeFileSync(path.join(__dirname, "threads-today.txt"), body, "utf8");
