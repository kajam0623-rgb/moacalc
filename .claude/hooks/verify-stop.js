// Stop 훅: 응답이 끝날 때마다 node verify.js 를 돌려, 실패하면 끝내지 못하게 막고 실패 항목을 돌려준다.
// 통과하면 아무것도 찍지 않는다. verify.js 가 실패하는 동안에는 계속 막는다(사용자 요청: 고칠 때까지 끝내지 않는다).
const { spawnSync } = require("child_process");
const path = require("path");
const dir = process.env.CLAUDE_PROJECT_DIR || path.join(__dirname, "..", "..");
const r = spawnSync(process.execPath, ["verify.js"], { cwd: dir, encoding: "utf8", timeout: 60000 });
if (r.status === 0) process.exit(0);
const out = (r.stdout || "") + (r.stderr || "");
const fails = out.split("\n").filter(l => l.startsWith("❌")).slice(0, 20);
const summary = (out.match(/결과: .*/) || [r.error ? "verify.js 실행 실패: " + r.error.message : "verify.js 종료 코드 " + r.status])[0];
console.log(JSON.stringify({
  decision: "block",
  reason: "verify.js 실패 — 끝내지 말고 고쳐라. " + summary + "\n" + fails.join("\n"),
}));
