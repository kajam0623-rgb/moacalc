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
/* 사이트 원고(TXT)는 보살 말투다. 그게 스레드 본문에 그대로 박히면
   한 글에 두 말투가 섞인다. 스레드는 처음 보는 사람에게 가는 글이라 사람 말투로 간다.
   내용은 사이트와 같다 — 말투만 옮겼다. 새로 지어낸 조언이 아니다.
   사이트 TXT를 고치면 여기도 같이 고쳐야 한다. */
const TXT_PLAIN = {
  "비견": { do: "오늘은 경쟁자가 아군이 되는 날이야. 자존심 싸움만 피하면 돼.",
           watch: "친구·동료랑 돈 섞이는 자리. 빌려주는 것도 대신 계산하는 것도 오늘은 만들지 마." },
  "겁재": { do: "베풀되 한도를 정해. 오늘 선심이 내일 네 부담으로 돌아와.",
           watch: "보증·대여·큰 결제. 오늘 지른 건 내일 아침이면 후회로 바뀌어 있어." },
  "식신": { do: "오늘은 즐기는 마음이 제일 좋은 전략이야.",
           watch: "과식이랑 과음. 먹을 복 좋은 날일수록 몸이 먼저 신호 보내." },
  "상관": { do: "오늘 떠오른 발상은 적어둬. 그게 나중에 돈이 돼.",
           watch: "윗사람 앞에서 한마디. 옳은 말이라도 오늘은 절반만 해." },
  "편재": { do: "계산기부터 두드리고 움직여. 그러면 승산 있어.",
           watch: "한 방 노리는 판단. 오늘 들어오는 큰 기회는 큰 손실이랑 같은 문으로 들어와." },
  "정재": { do: "오늘 쌓은 신용은 이자 붙어서 돌아와.",
           watch: "지나친 인색함. 아낄 자리랑 써야 할 자리는 구분할 줄 알아야 해." },
  "편관": { do: "피하지 말고 정면으로 가. 대신 서류랑 말은 두 번 확인하고.",
           watch: "과로랑 언쟁. 오늘 몸 몰아붙이면 이번 주 내내 그 값 치러." },
  "정관": { do: "오늘은 정도(正道)가 지름길이야.",
           watch: "편법이랑 지각. 오늘만큼은 절차 건너뛰지 마." },
  "편인": { do: "혼자 있는 시간이 답을 가져다주는 날이야.",
           watch: "즉답이랑 확답. 오늘 내린 결론은 내일 다시 보면 달라 보여." },
  "정인": { do: "도움받았으면 고맙다고 말로 해. 그러면 운이 두 배가 돼.",
           watch: "혼자 끙끙 앓기. 오늘은 손 내밀면 대부분 열려." },
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

/* 첫 줄이 전부다. 스크롤을 멈추게 하려면 "누구 얘기인지"가 첫 줄에 있어야 한다.
   사람들이 아는 건 일간이 아니라 띠다. 그래서 띠로 부른다.

   충(沖) — 지지가 여섯 칸 마주 보는 자리. 자↔오, 축↔미, 인↔신, 묘↔유, 진↔술, 사↔해.
   삼합 — 신자진(수), 해묘미(목), 인오술(화), 사유축(금).
   둘 다 그날 일지에서 바로 나온다. 지어낸 게 아니다. */
const SAMHAP = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
const chungTti = b => SJ_TTI[(b + 6) % 12];
const hapTti = b => (SAMHAP.find(g => g.includes(b)) || []).map(i => SJ_TTI[i]);

function hook(d) {
  const b = d.p.d.b;
  const ch = chungTti(b);
  const hp = hapTti(b);
  switch (d.dt.getDate() % 4) {
    case 0: return `오늘 ${ch}띠는 이거 보고 가.`;
    case 1: return `${hp.join("·")}띠 — 오늘 너희 판이야.`;
    case 2: return `오늘 하루, ${ch}띠가 제일 시끄러울 거야.`;
    default: return `${ch}띠는 눈 크게 뜨고, ${hp[0]}띠는 발 뻗고 자도 돼.`;
  }
}
// 본문에 주소를 넣지 않는다. 맥락 없는 링크는 도달이 깎인다 —
// 주소는 첫 댓글이 맡는다. 여기서는 궁금증과 "공짜"만 남긴다.
const TAIL = [
  "오늘이 네 날인지 아닌지, 생일 하나면 나와. 돈 안 받아.",
  "생년월일만 알면 돼. 시간도 이름도 필요 없고, 돈도 안 들어.",
  "네가 어느 쪽인지는 생일 하나로 갈려. 밑에 링크 뒀어.",
];

// 네 가지 각도를 날짜로 돌린다. 매일 같은 틀이면 금세 질린다.
// 어느 각도든 첫 줄은 일상어다. 간지·십성은 맨 뒤 근거 줄에만 둔다.
function why(d, x) {
  return `오늘은 ${d.ganji}(${d.han})일. 명리에서 ${ILGAN_LABEL(x.ilgan)} 일간한테 ${x.rel}이라고 부르는 자리야.`;
}
function compose(d) {
  const angle = (d.dt.getDate() + d.dt.getMonth()) % 4;
  const tail = TAIL[d.dt.getDate() % TAIL.length];
  const H = hook(d);   // 모든 각도의 첫 줄은 띠 호명이다

  if (angle === 0) {
    const x = d.lo;
    return [
      H, "",
      `오늘은 ${REL_PLAIN[x.rel]}이야.`, "",
      `누구한테? ${ILGAN_PLAIN[SJ_S[x.ilgan]]} 같은 사람.`, "",
      TXT_PLAIN[x.rel].watch, "",
      why(d, x), tail,
    ].join(NL);
  }
  if (angle === 1) {
    return [
      H, "",
      `오늘 잘 풀리는 사람이랑 눌리는 사람이 갈려.`, "",
      `${REL_PLAIN[d.hi.rel]} — ${ILGAN_PLAIN[SJ_S[d.hi.ilgan]]} 같은 사람.`,
      `${REL_PLAIN[d.lo.rel]} — ${ILGAN_PLAIN[SJ_S[d.lo.ilgan]]} 같은 사람.`, "",
      TXT_PLAIN[d.lo.rel].watch, "",
      `날은 하나인데 사람마다 다른 이유가 이거야.`,
      `태어난 날에 따라 오늘 결이 정해져.`, "",
      tail,
    ].join(NL);
  }
  if (angle === 2) {
    const a = d.hi.ilgan, b = a % 2 === 0 ? a + 1 : a - 1;
    const rb = d.rows[b];
    return [
      H, "",
      `같은 기운 타고났는데 오늘이 갈리는 두 사람이 있어.`, "",
      `${ILGAN_PLAIN[SJ_S[a]]} 같은 사람 — ${REL_PLAIN[d.hi.rel]}.`,
      `${ILGAN_PLAIN[SJ_S[b]]} 같은 사람 — ${REL_PLAIN[rb.rel]}.`, "",
      `둘 다 ${SJ_EL[SJ_ES[a]]} 기운이야. 근데 하나는 밖으로 뻗고 하나는 안으로 스며.`,
      `그 차이가 오늘을 갈라.`, "",
      tail,
    ].join(NL);
  }
  const x = d.rows[(d.dt.getDate() * 3) % 10];
  return [
    H, "",
    `오늘은 ${d.tti}띠 기운이 깔린 날이야.`, "",
    `${ILGAN_PLAIN[SJ_S[x.ilgan]]} 같은 사람한테는 ${REL_PLAIN[x.rel]}이야.`, "",
    TXT_PLAIN[x.rel].do, "",
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
