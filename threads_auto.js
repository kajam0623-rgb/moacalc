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
// --browser : API 토큰 대신 로그인 세션으로 올린다 (threads_browser.js).
// 토큰이 필요 없는 대신, 메타는 브라우저 자동 조작을 약관 위반으로 본다.
const useBrowser = process.argv.includes("--browser");
// 하루 두 번 돈다. 아침은 그날 일진, 저녁은 후킹 소재 은행.
const slot = process.argv.includes("--pm") ? "pm" : "am";

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

  // 같은 슬롯을 두 번 돌지 않게 막는다. 스케줄러가 밀려서 두 번 부를 수 있다.
  // 아침·저녁은 별개다 — 키에 슬롯을 넣지 않으면 저녁이 통째로 막힌다
  const key = `게시 완료 ${stamp} ${slot}`;
  if (publish && fs.existsSync(LOG)) {
    const done = fs.readFileSync(LOG, "utf8").split("\n").some(l => l.includes(key));
    if (done) { log(`이미 오늘(${stamp}) ${slot} 게시했다. 건너뛴다.`); return; }
  }

  log(`── 시작 (${slot}) ──`);

  // 저녁 원고는 밖에서 받아 붙여넣을 수 있다. 사람 눈을 안 거치고 나가므로
  // 게시 전에 은행 전체를 한 번 훑는다. 오류가 있으면 여기서 멈춘다
  if (slot === "pm") {
    try { run("threads_bank.js", ["--lint"]); }
    catch (e) {
      log("은행 원고 검사 실패 — 게시하지 않는다:");
      log(((e.stdout || "") + (e.stderr || "")).toString().trim());
      process.exitCode = 1;
      return;
    }
  }

  const gen = slot === "pm" ? "threads_bank.js" : "threads_daily.js";
  const text = run(gen).replace(/^━━━[^\n]*━━━\n+/, "").trim();
  log(`원고 ${text.length}자`);

  // 카드는 아침 일진용이다. 저녁 소재는 은행 이미지(img/social)를 쓴다
  if (slot === "am") {
    run("threads_card.js");
    const shot = run("threads_shot.js").trim();
    log(shot.replace(/^저장: /, "카드 "));
  }

  if (!publish) {
    log("원고·카드까지만 했다. 게시하려면 --publish 를 붙여라.");
    log(`올릴 글:\n${text}`);
    return;
  }

  // 게시는 전용 스크립트에 맡긴다 — 계정 확인·500자 가드가 거기 있다
  try {
    if (useBrowser) {
      const out = run("threads_browser.js", slot === "pm" ? ["--publish", "--pm"] : ["--publish"]);
      // 중복 방지 키는 threads_browser.js가 직접 남긴다. 여기서 또 쓰면 두 줄이 된다
      if (/게시 확인 OK/.test(out)) {
        log(`게시함 (${slot}) ${/첫 댓글 OK/.test(out) ? "· 댓글 OK" : "· 댓글 실패"}`);
      } else { log("게시 결과를 확인하지 못했다:"); log(out.trim()); }
    } else {
      const out = run("threads_post.js", ["--publish"]);
      const id = (out.match(/post id = (\S+)/) || [])[1];
      if (id) log(`${key} · post id ${id}`);
      else { log("게시 결과를 확인하지 못했다:"); log(out.trim()); }
    }
  } catch (e) {
    // 중단 사유는 stderr에 있다. stdout 끝줄을 집으면
    // "길이 160자" 같은 엉뚱한 줄이 사유로 찍힌다.
    const err = (e.stderr || "").toString().trim();
    log("게시 실패: " + (err ? err.split("\n").filter(Boolean).join(" / ") : (e.message || "알 수 없음")));
    process.exitCode = 1;
  }
})().catch(e => { log("오류: " + e.message); process.exitCode = 1; });
