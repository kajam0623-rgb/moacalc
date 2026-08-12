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

const WD = ["일", "월", "화", "수", "목", "금", "토"];
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
  "자네 일간이 뭔지 모르겠거든 생일만 넣어보게. 프로필에 두었네.",
  "일간은 태어난 날의 천간일세. 생일 하나면 나오네.",
  "내 일간이 뭔지부터 알아야 이 말이 자네 것이 되네.",
];

// 네 가지 각도를 날짜로 돌린다. 매일 같은 틀이면 금세 질린다
function compose(d) {
  const angle = (d.dt.getDate() + d.dt.getMonth()) % 4;
  const tail = TAIL[d.dt.getDate() % TAIL.length];

  if (angle === 0) {
    // 최저점 저격 — 경고가 제일 잘 읽힌다
    const x = d.lo;
    return [
      HEAD(d), "",
      `${ILGAN_LABEL(x.ilgan)} 일간인 사람.`,
      `오늘 자네한테는 ${x.rel}이 도네. ${x.score}점.`, "",
      x.T[1], "",
      x.T[4], "",
      tail,
    ].join("\n");
  }
  if (angle === 1) {
    // 최고 vs 최저 — 같은 날인데 갈리는 게 후킹이 된다
    return [
      HEAD(d), "",
      `오늘 제일 좋은 자리는 ${ILGAN_LABEL(d.hi.ilgan)} 일간일세. ${d.hi.rel} ${d.hi.score}점.`,
      d.hi.T[1], "",
      `반대로 ${ILGAN_LABEL(d.lo.ilgan)} 일간은 ${d.lo.rel} ${d.lo.score}점.`,
      d.lo.T[4], "",
      "일진은 하나인데 사람마다 다른 이유가 이걸세.",
      "내 일간이 뭐냐에 따라 오늘의 결이 정해지네.", "",
      tail,
    ].join("\n");
  }
  if (angle === 2) {
    // 음양 짝 — 같은 오행인데 결이 다른 두 일간을 나란히
    const a = d.hi.ilgan, b = a % 2 === 0 ? a + 1 : a - 1;
    const rb = d.rows[b];
    return [
      HEAD(d), "",
      `${ILGAN_LABEL(a)}는 오늘 ${d.hi.rel} ${d.hi.score}점.`,
      `${ILGAN_LABEL(b)}는 ${rb.rel} ${rb.score}점.`, "",
      `같은 ${SJ_EL[SJ_ES[a]]}인데 왜 다르냐.`,
      "음양이 다르면 같은 관계도 결이 달라지네.", "",
      d.hi.T[9], "",
      tail,
    ].join("\n");
  }
  // 그날 지지(띠) 각도
  const x = d.rows[(d.dt.getDate() * 3) % 10];
  return [
    HEAD(d), `${d.tti}띠의 기운이 깔린 날이야.`, "",
    `${ILGAN_LABEL(x.ilgan)} 일간, 오늘 자네 ${x.rel}일세. ${x.score}점.`, "",
    x.T[1], "",
    x.T[3], "",
    tail,
  ].join("\n");
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
