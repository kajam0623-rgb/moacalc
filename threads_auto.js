/* 매일 자동 실행되는 한 덩어리.
   원고 → 카드 → (토큰 있으면) 게시 까지 한 번에 한다.
   윈도우 작업 스케줄러가 이 파일 하나만 부르면 된다.

   실행: node threads_auto.js            → 원고+카드만 (안전)
         node threads_auto.js --publish  → 게시까지

   결과는 card-out/ 에 남고, 실행 기록은 threads-log.txt 에 쌓인다.
*/
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const LOG = path.join(ROOT, "threads-log.txt");
const publish = process.argv.includes("--publish");

// toISOString()은 UTC다. 한국 새벽에 돌리면 날짜가 전날로 찍혀
// 같은 날 두 번 게시되거나 로그 날짜가 원고 날짜와 어긋난다. 전부 로컬로 통일한다.
const two = n => String(n).padStart(2, "0");
const localDay = (d = new Date()) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
const localTime = (d = new Date()) => `${localDay(d)} ${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;

function log(line) {
  const t = localTime();
  const msg = `[${t}] ${line}`;
  console.log(msg);
  fs.appendFileSync(LOG, msg + "\n", "utf8");
}

function run(script, args = []) {
  return execFileSync("node", [path.join(ROOT, script), ...args],
    { cwd: ROOT, encoding: "utf8" });
}

(async () => {
  const stamp = localDay();

  // 같은 날 두 번 돌지 않게 막는다. 스케줄러가 밀려서 두 번 부를 수 있다
  if (publish && fs.existsSync(LOG)) {
    const done = fs.readFileSync(LOG, "utf8").split("\n")
      .some(l => l.includes(`게시 완료 ${stamp}`));
    if (done) { log(`이미 오늘(${stamp}) 게시했다. 건너뛴다.`); return; }
  }

  log("── 시작 ──");

  const text = run("threads_daily.js").replace(/^━━━[^\n]*━━━\n+/, "").trim();
  log(`원고 ${text.length}자`);

  run("threads_card.js");
  const shot = run("threads_shot.js").trim();
  log(shot.replace(/^저장: /, "카드 "));

  if (!publish) {
    log("원고·카드까지만 했다. 게시하려면 --publish 를 붙여라.");
    log(`올릴 글:\n${text}`);
    return;
  }

  // 게시는 threads_post.js에 맡긴다 — 토큰 확인·500자 가드가 거기 있다
  try {
    const out = run("threads_post.js", ["--publish"]);
    const id = (out.match(/post id = (\S+)/) || [])[1];
    if (id) log(`게시 완료 ${stamp} · post id ${id}`);
    else { log("게시 결과를 확인하지 못했다:"); log(out.trim()); }
  } catch (e) {
    // 중단 사유는 stderr에 있다. stdout 끝줄을 집으면
    // "길이 160자" 같은 엉뚱한 줄이 사유로 찍힌다.
    const err = (e.stderr || "").toString().trim();
    log("게시 실패: " + (err ? err.split("\n").filter(Boolean).join(" / ") : (e.message || "알 수 없음")));
    process.exitCode = 1;
  }
})().catch(e => { log("오류: " + e.message); process.exitCode = 1; });
