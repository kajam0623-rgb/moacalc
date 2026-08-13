/* 스레드 브라우저 게시 — API 토큰 없이 로그인 세션으로 올린다.

   메타 공식 Web Intent를 쓴다:
     https://www.threads.com/intent/post?text=...
     https://www.threads.com/intent/post?text=...&reply_post_shortcode=...
   이 주소를 열면 작성창이 원고가 채워진 채로 뜬다.
   (developers.facebook.com/docs/threads/threads-web-intents)

   작성창을 DOM으로 긁어 채우지 않는 이유 — 스레드 화면은 클래스명이 매번 바뀌고,
   메타는 브라우저 자동 조작을 약관 위반으로 본다. Intent는 메타가 만들어 둔 문이다.

   본문에는 주소를 넣지 않는다. 맥락 없는 링크는 도달이 깎인다.
   주소는 게시 직후 자기 글에 다는 첫 댓글이 맡는다.

   세션은 이 폴더의 전용 크롬 프로필(.chrome-threads)에 남는다.
   개인 크롬과 분리돼 있어 계정이 섞이지 않는다. 이 폴더는 커밋 금지.

   실행:
     node threads_browser.js --login       로그인 전용. 창을 띄우고 기다린다 (최초 1회)
     node threads_browser.js --check       로그인 계정만 확인
     node threads_browser.js               아침 원고를 채운 작성창까지. 게시는 사람이  ← 기본
     node threads_browser.js --pm          저녁 원고로
     node threads_browser.js --publish     게시 + 첫 댓글까지 스크립트가 누른다
     node threads_browser.js --pm --publish
*/
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const puppeteer = require("puppeteer-core");

const ROOT = __dirname;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PROFILE = path.join(ROOT, ".chrome-threads");
const SITE = "https://dongnebosal.com";
const MAX_LEN = 500;

// 첫 댓글. 여기에만 주소가 들어간다.
const REPLY = `생일 하나면 되네. 값은 안 받네.\n${SITE}`;

const has = f => process.argv.includes(f);
const mode = has("--login") ? "login" : has("--check") ? "check" : has("--publish") ? "publish" : "fill";
const slot = has("--pm") ? "pm" : "am";

const sleep = ms => new Promise(r => setTimeout(r, ms));
const intent = (text, extra = "") =>
  `https://www.threads.com/intent/post?text=${encodeURIComponent(text)}${extra}`;

function handle() {
  const f = path.join(ROOT, ".threads-account");
  if (!fs.existsSync(f)) throw new Error(".threads-account 가 없다. 올릴 계정 아이디 한 줄을 넣어라.");
  const id = fs.readFileSync(f, "utf8").split(/\r?\n/)
    .map(l => l.trim()).filter(l => l && !l.startsWith("#"))[0];
  if (!id) throw new Error(".threads-account 에 아이디가 없다.");
  return id.replace(/^@/, "");
}

// 오늘 원고. 파일이 오래됐을 수 있으니 매번 새로 뽑는다
function todayText() {
  const gen = slot === "pm" ? "threads_bank.js" : "threads_daily.js";
  const out = slot === "pm" ? "threads-today-pm.txt" : "threads-today.txt";
  execFileSync("node", [path.join(ROOT, gen)], { cwd: ROOT, stdio: "pipe" });
  return fs.readFileSync(path.join(ROOT, out), "utf8").replace(/^━━━[^\n]*━━━\n+/, "").trim();
}

/* 지금 로그인된 계정이 누구인지 본다.
   자기 프로필을 열었을 때만 "프로필 편집" 버튼이 뜬다는 점을 쓴다.
   클래스명에 기대지 않으므로 화면이 바뀌어도 잘 버틴다. */
async function whoami(page, id) {
  await page.goto(`https://www.threads.com/@${id}`, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(1500);
  const body = await page.evaluate(() => document.body.innerText || "");
  if (/프로필 편집|Edit profile/.test(body)) return "me";
  if (/로그인|Log in|Continue with Instagram/.test(body)) return "logged-out";
  return "other";
}

/* 작성창의 '게시'를 누른다.
   피드 상단 작성바에도 '게시'가 있다. 그걸 누르면 빈 글 창이 열린다.
   반드시 모달(role=dialog) 안쪽 버튼만 집는다. */
async function clickPost(page) {
  const spot = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg) return { err: "작성창 모달을 못 찾았다" };
    const cands = [...dlg.querySelectorAll('[role="button"],button')]
      .filter(el => /^(게시|Post)$/.test((el.innerText || "").trim()));
    if (!cands.length) return { err: "모달 안에 게시 버튼이 없다" };
    const el = cands[cands.length - 1];
    el.scrollIntoView({ block: "center" });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (spot.err) return spot.err;
  await page.mouse.click(spot.x, spot.y);   // 실제 클릭 — React 이벤트가 제대로 붙는다
  await sleep(8000);
  return null;
}

(async () => {
  if (!fs.existsSync(CHROME)) throw new Error(`크롬을 못 찾았다: ${CHROME}`);
  const id = handle();

  let text = "";
  if (mode === "fill" || mode === "publish") {
    text = todayText();
    console.log(`── ${slot === "pm" ? "저녁" : "아침"} 원고 ──`);
    console.log(text);
    console.log(`\n길이 ${text.length}자 (제한 ${MAX_LEN})`);
    if (text.length > MAX_LEN) {
      console.error("\n중단: 500자를 넘었다. 원고를 줄여야 한다.");
      process.exit(1);
    }
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: false,
    userDataDir: PROFILE,
    defaultViewport: null,
    // "자동화된 소프트웨어가 제어 중" 배너가 뜬 창에서는 인스타 로그인이
    // 본인 확인 단계에서 막히는 일이 있다. 그 표시만 뗀다.
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--no-first-run", "--no-default-browser-check",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1180,900",
    ],
  });
  const page = (await browser.pages())[0] || await browser.newPage();

  if (mode === "login") {
    await page.goto("https://www.threads.com/login", { waitUntil: "networkidle2", timeout: 60000 });
    console.log(`\n창이 떴다. @${id} 계정으로 직접 로그인해라.`);
    console.log("로그인이 끝나면 창을 닫아라. 세션은 .chrome-threads 에 남는다.");
    console.log("(이 스크립트는 비밀번호를 만지지 않는다)");
    await new Promise(r => browser.on("disconnected", r));
    console.log("창이 닫혔다. 이제 node threads_browser.js 로 게시 준비를 할 수 있다.");
    return;
  }

  const who = await whoami(page, id);
  if (who === "logged-out") {
    console.error("\n중단: 로그인이 안 돼 있다. 먼저 node threads_browser.js --login 을 실행해라.");
    await browser.close();
    process.exit(1);
  }
  if (who === "other") {
    console.error(`\n중단: 로그인된 계정이 @${id} 가 아니다. 다른 계정에 올라갈 뻔했다.`);
    console.error(`스레드에서 계정을 @${id} 로 바꾸고 다시 실행해라.`);
    await browser.close();
    process.exit(1);
  }
  console.log(`\n계정 확인: @${id} 로 로그인돼 있다.`);

  if (mode === "check") { await browser.close(); return; }

  await page.goto(intent(text), { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(2000);

  if (mode === "fill") {
    console.log("\n작성창에 원고를 넣었다. 화면을 보고 확인해라.");
    console.log("올릴 거면 '게시' 버튼을 직접 눌러라. 안 올릴 거면 그냥 창을 닫아라.");
    console.log(`올린 뒤 첫 댓글에 주소를 달아라:\n${REPLY}`);
    await new Promise(r => browser.on("disconnected", r));
    console.log("창이 닫혔다.");
    return;
  }

  // --publish : 본문 게시
  console.log("\n게시 버튼을 누른다…");
  const err = await clickPost(page);
  if (err) {
    console.error(`${err}. 창은 열어 둔다 — 직접 눌러라.`);
    await new Promise(r => browser.on("disconnected", r));
    process.exit(1);
  }

  // 눈으로 확인하라고 떠넘기지 않는다. 프로필에서 직접 확인한다
  await page.goto(`https://www.threads.com/@${id}`, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(3000);
  const body = await page.evaluate(() => document.body.innerText || "");
  const probe = text.split("\n")[0].trim();
  const ok = probe && body.includes(probe);
  if (!ok) {
    await browser.close();
    console.error("게시를 확인하지 못했다. 프로필을 직접 봐라.");
    process.exit(1);
  }
  console.log(`게시 확인 OK · @${id}`);

  /* 첫 댓글에 주소를 단다.
     프로필 목록의 첫 글 shortcode를 집어 reply_post_shortcode 로 넘긴다. */
  const sc = await page.evaluate(() => {
    for (const a of document.querySelectorAll('a[href*="/post/"]')) {
      const m = (a.getAttribute("href") || "").match(/\/post\/([A-Za-z0-9_-]+)/);
      if (m) return m[1];
    }
    return null;
  });
  if (!sc) {
    console.error("글 주소를 못 찾아 댓글을 못 달았다. 직접 달아라:\n" + REPLY);
  } else {
    await page.goto(intent(REPLY, `&reply_post_shortcode=${sc}`), { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(2500);
    const rerr = await clickPost(page);
    console.log(rerr ? `댓글 실패(${rerr}). 직접 달아라:\n${REPLY}` : `첫 댓글 OK · ${SITE}`);
  }

  const shot = path.join(ROOT, "card-out", `posted-${slot}-${new Date().toISOString().slice(0, 10)}.png`);
  fs.mkdirSync(path.dirname(shot), { recursive: true });
  await page.screenshot({ path: shot });
  await browser.close();
  console.log(`결과 화면: ${shot}`);
})().catch(e => { console.error("\n실패:", e.message); process.exit(1); });
