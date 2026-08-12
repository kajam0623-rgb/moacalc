/* 스레드 자동 게시.
   threads_daily.js가 만든 오늘 원고를 Threads API로 올린다.

   API 규격 (developers.facebook.com/docs/threads/posts 확인):
     1) POST https://graph.threads.net/v1.0/{user-id}/threads
        media_type=TEXT & text=... & access_token=...   → creation_id
     2) POST https://graph.threads.net/v1.0/{user-id}/threads_publish
        creation_id=... & access_token=...
   본문 500자 제한, 24시간에 250건 제한.
   컨테이너 생성 후 서버 처리에 평균 30초가 걸린다고 안내되어 있어 그만큼 기다린다.

   자격증명은 코드에 넣지 않는다. .env.local에서만 읽는다:
     THREADS_USER_ID=...
     THREADS_TOKEN=...

   실행:
     node threads_post.js            → 미리보기만 (아무것도 올리지 않음)
     node threads_post.js --publish  → 실제 게시
*/
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const ENV_FILE = path.join(ROOT, ".env.local");
const API = "https://graph.threads.net/v1.0";
const MAX_LEN = 500;

function loadEnv() {
  const out = { ...process.env };
  if (fs.existsSync(ENV_FILE)) {
    fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    });
  }
  return out;
}

// 오늘 원고를 새로 뽑는다. 파일이 오래됐을 수 있으니 매번 생성한다
function todayText() {
  execFileSync("node", [path.join(ROOT, "threads_daily.js")], { cwd: ROOT, stdio: "pipe" });
  const raw = fs.readFileSync(path.join(ROOT, "threads-today.txt"), "utf8");
  // "━━━ 날짜 · 간지 ━━━" 머리말은 확인용이라 게시에서는 뺀다
  return raw.replace(/^━━━[^\n]*━━━\n+/, "").trim();
}

async function post(url, params) {
  const body = new URLSearchParams(params);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { /* 그대로 둔다 */ }
  if (!res.ok) {
    const msg = (json && json.error && json.error.message) || text.slice(0, 300);
    throw new Error(`HTTP ${res.status} — ${msg}`);
  }
  return json;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const env = loadEnv();
  const text = todayText();
  const bytes = Buffer.byteLength(text, "utf8");

  console.log("── 오늘 원고 ──");
  console.log(text);
  console.log(`\n길이 ${text.length}자 / ${bytes}바이트 (제한 ${MAX_LEN})`);

  if (text.length > MAX_LEN) {
    console.error(`\n중단: 500자를 넘었다. 원고를 줄여야 한다.`);
    process.exit(1);
  }

  const publish = process.argv.includes("--publish");
  if (!publish) {
    console.log("\n미리보기만 했다. 실제로 올리려면 --publish 를 붙여라.");
    return;
  }

  const uid = env.THREADS_USER_ID, token = env.THREADS_TOKEN;
  if (!uid || !token) {
    console.error("\n중단: .env.local에 THREADS_USER_ID / THREADS_TOKEN 이 없다.");
    console.error("이 값은 본인이 직접 발급해 파일에 넣어야 한다.");
    process.exit(1);
  }

  console.log("\n컨테이너 생성…");
  const c = await post(`${API}/${uid}/threads`, {
    media_type: "TEXT", text, access_token: token,
  });
  console.log("creation_id =", c.id);

  // 문서 권고: 게시 전 평균 30초 대기
  console.log("서버 처리 대기 30초…");
  await sleep(30000);

  console.log("게시…");
  const p = await post(`${API}/${uid}/threads_publish`, {
    creation_id: c.id, access_token: token,
  });
  console.log("게시 완료. post id =", p.id);
})().catch(e => {
  console.error("\n실패:", e.message);
  process.exit(1);
});
