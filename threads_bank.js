/* 저녁 슬롯 원고 — 후킹 콘텐츠 은행에서 하루 한 편 꺼낸다.

   아침(threads_daily.js)은 그날 일진이라 매일 값이 다르다.
   저녁은 날짜와 무관한 소재라 미리 써둔 은행을 돌린다.

   은행은 THREADS-HOOKS.md 의 ``` 블록이다. 원고를 코드에 박지 않는다 —
   글은 사람이 고쳐야 하고, 마크다운이 고치기 쉽다.

   실행:
     node threads_bank.js            → 오늘 저녁 원고
     node threads_bank.js 2026-09-01 → 특정 날짜
     node threads_bank.js --list     → 은행 목록만
*/
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const NL = String.fromCharCode(10);
const MAX_LEN = 500;

// 마지막 한 줄. 본문에는 주소를 넣지 않는다 —
// 맥락 없는 링크는 도달이 깎인다. 주소는 첫 댓글이 맡는다.
const CTA = [
  "너한테 이 자리가 있는지는 생일 하나면 나와. 돈 안 받아.",
  "궁금하면 생년월일만 넣어봐. 시간도 이름도 필요 없어.",
  "네 사주에 이 별 있는지, 무료로 볼 수 있어.",
];

function bank() {
  // 줄끝을 먼저 통일한다. 윈도우에서 git이 CRLF로 체크아웃하면
  // ```\n 을 찾는 정규식이 하나도 안 맞아 은행이 통째로 빈다
  const md = fs.readFileSync(path.join(ROOT, "THREADS-HOOKS.md"), "utf8").replace(/\r\n/g, "\n");
  const re = /^## \s*\d+\.\s*(.+?)\s*$[\s\S]*?```\n([\s\S]*?)```/gm;
  const out = [];
  let m;
  while ((m = re.exec(md))) {
    const title = m[1].replace(/\s*—.*$/, "").trim();   // "도화살 — `hook-...`" → "도화살"
    out.push({ title, text: m[2].trim() });
  }
  if (!out.length) throw new Error("THREADS-HOOKS.md 에서 원고를 못 읽었다.");
  return out;
}

// 날짜를 은행 순번으로. 같은 날은 항상 같은 편이 나온다 —
// 스케줄러가 두 번 불러도 다른 글이 나가지 않는다.
const dayIndex = dt => Math.floor(
  Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) / 86400000
);

const arg = process.argv[2];
const items = bank();

/* --lint : 은행 원고 검사.
   이 글들은 사람 눈을 안 거치고 자동으로 공개 게시된다.
   밖에서 받아온 원고를 붙여넣었을 때 그대로 나가면 안 되는 것들을 잡는다. */
if (arg === "--lint") {
  const errs = [], warns = [];
  const seen = new Map();
  const maxBody = MAX_LEN - Math.max(...CTA.map(c => c.length)) - 2;

  items.forEach((it, i) => {
    const tag = `${i + 1}. ${it.title}`;
    const t = it.text;
    if (seen.has(it.title)) errs.push(`${tag}: 제목이 ${seen.get(it.title)}번과 겹친다`);
    seen.set(it.title, i + 1);

    if (t.length > maxBody) errs.push(`${tag}: ${t.length}자 — CTA까지 붙으면 500자를 넘는다 (본문 ${maxBody}자 이하)`);
    if (/니다|세요|습니다|해요|하십시오/.test(t)) errs.push(`${tag}: 존댓말이 섞였다 — 스레드는 사람 말투(반말)다`);
    // "~네." 는 하게체 서술이다. 사람 말투에는 거의 안 나온다
    if (/자네|일세|[가-힣]네\.|하게\.|보게\.|말게\./.test(t))
      errs.push(`${tag}: 보살 말투가 섞였다 — 그건 사이트 안쪽 전용이다`);
    if (/https?:\/\//.test(t)) errs.push(`${tag}: 본문에 링크가 있다 — 주소는 첫 댓글이 맡는다`);
    if (/생일|생년월일/.test(t.split("\n").slice(-2).join("\n")))
      warns.push(`${tag}: 끝에 CTA를 직접 썼다 — CTA는 스크립트가 붙인다`);

    const first = t.split("\n")[0].trim();
    if (first.length > 34) warns.push(`${tag}: 첫 줄이 ${first.length}자 — 길면 훅이 안 산다`);
    if (/(사람이 있어|사람이 있네|사람이야)\.$/.test(first))
      warns.push(`${tag}: 첫 줄이 3인칭 관찰형이다 — 질문이나 호명으로 바꿔라`);
    // 한자를 썼으면 뜻풀이가 있어야 한다. 그게 이 콘텐츠의 신뢰 축이다
    if (/[一-鿿]/.test(t) && !/[가-힣] [一-鿿]\(|\([一-鿿]\)/.test(t))
      warns.push(`${tag}: 한자를 썼는데 글자 뜻풀이가 안 보인다`);
    if (t.split("\n").filter(l => !l.trim()).length < 2)
      warns.push(`${tag}: 문단이 안 나뉘었다 — 스레드는 한 덩어리면 안 읽힌다`);
  });

  warns.forEach(w => console.log("경고  " + w));
  errs.forEach(e => console.log("오류  " + e));
  console.log(`\n${items.length}편 · 오류 ${errs.length} · 경고 ${warns.length}`);
  if (errs.length) { console.log("오류가 있으면 게시하지 마라."); process.exit(1); }
  return;
}

if (arg === "--list") {
  items.forEach((it, i) => console.log(`${String(i + 1).padStart(2)}. ${it.title}  (${it.text.length}자)`));
  console.log(`\n총 ${items.length}편 — ${items.length}일 주기로 돈다.`);
  return;
}

const dt = arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)
  ? new Date(+arg.slice(0, 4), +arg.slice(5, 7) - 1, +arg.slice(8, 10))
  : new Date();

/* 아침 일진이 다룬 십성과 저녁 소재가 겹치면 같은 날 같은 얘기를 두 번 하게 된다.
   호출하는 쪽마다 따로 챙기면 어긋나므로 여기서 직접 알아낸다 —
   그날 아침 원고를 뽑아 십성 이름을 읽고, 같으면 다음 편으로 넘긴다.
   (--avoid=편관 으로 직접 지정할 수도 있다) */
function morningRel(stamp) {
  try {
    return execFileSync("node", [path.join(ROOT, "threads_daily.js"), stamp, "--rel"],
      { cwd: ROOT, encoding: "utf8" }).trim();
  } catch (e) { return ""; }   // 못 읽어도 저녁 글은 나가야 한다
}
const avoidArg = (process.argv.find(a => a.startsWith("--avoid=")) || "").slice(8);

const two0 = n => String(n).padStart(2, "0");
const dstamp = `${dt.getFullYear()}-${two0(dt.getMonth() + 1)}-${two0(dt.getDate())}`;
const avoid = avoidArg || morningRel(dstamp);

const idx = dayIndex(dt);
const wrap = n => ((n % items.length) + items.length) % items.length;
let at = wrap(idx);
if (avoid && items[at].title === avoid) {
  // 한 칸만 밀면 그게 내일 자리라 이틀 연속 같은 글이 나간다.
  // 반 바퀴 건너뛰어야 앞뒤 어느 날과도 안 붙는다.
  at = wrap(at + Math.floor(items.length / 2));
  for (let k = 0; k < items.length && items[at].title === avoid; k++) at = wrap(at + 1);
}
const it = items[at];
const text = it.text + NL + NL + CTA[((idx % CTA.length) + CTA.length) % CTA.length];

if (text.length > MAX_LEN) {
  console.error(`중단: ${it.title} 편이 CTA까지 붙이면 ${text.length}자다. 500자를 넘는다.`);
  process.exit(1);
}

const body = `━━━ ${dstamp} · 저녁 · ${it.title} ━━━\n\n${text}\n`;
console.log(body);
fs.writeFileSync(path.join(ROOT, "threads-today-pm.txt"), body, "utf8");
