/* IndexNow 색인 요청 — 새로 만들거나 고친 URL을 검색엔진에 바로 알린다.
   네이버는 2023-07부터, 빙·얀덱스·Seznam·Yep 도 참여한다.
   공용 엔드포인트(api.indexnow.org)가 참여 엔진 전체로 전달한다.

   키 파일은 build_site.js 가 site/<KEY>.txt 로 이미 만든다. 그것만으로는
   아무 일도 일어나지 않는다 — URL 목록을 여기서 POST 해야 한다.

   사용법:
     node tools/indexnow.js --dry              무엇을 보낼지만 출력
     node tools/indexnow.js                    사이트맵 전체 전송
     node tools/indexnow.js --since HEAD~1     그 커밋 이후 바뀐 페이지만
     node tools/indexnow.js --prefix manse-    접두사로 거른 것만

   --since 는 대개 전체를 돌려준다. 빌드가 매번 전 페이지를 다시 쓰기 때문이다
   (푸터의 검증 개수, core.js 캐시 해시가 모든 파일에 들어간다). 새 페이지군만
   보내려면 --prefix 를 쓰는 편이 정확하다.

   규격 (indexnow.org/documentation):
     POST https://api.indexnow.org/indexnow
     {host, key, keyLocation, urlList}   urlList 최대 10,000개
     200 성공 · 202 키 검증중 · 400 형식오류 · 403 키불일치 · 422 호스트불일치 · 429 과다 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const bs = fs.readFileSync(path.join(ROOT, "build_site.js"), "utf8");
const KEY = (bs.match(/const INDEXNOW_KEY = "([^"]+)"/) || [])[1];
const DOMAIN = (bs.match(/const DOMAIN = "([^"]+)"/) || [])[1];
if (!KEY || !DOMAIN) { console.error("build_site.js 에서 INDEXNOW_KEY / DOMAIN 을 못 읽었다"); process.exit(2); }
const HOST = DOMAIN.replace(/^https?:\/\//, "");

const argv = process.argv.slice(2);
const flag = n => { const i = argv.indexOf(n); return i < 0 ? null : (argv[i + 1] || true); };
const DRY = argv.includes("--dry");
const SINCE = flag("--since");
const PREFIX = flag("--prefix");

// 사이트맵에서 URL을 읽는다 — 배포된 것과 같은 목록이어야 한다
const sm = fs.readFileSync(path.join(ROOT, "site", "sitemap.xml"), "utf8");
let urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

if (SINCE) {
  // 그 커밋 이후 실제로 바뀐 site/*.html 만 고른다
  const changed = execSync(`git diff --name-only ${SINCE} -- site`, { cwd: ROOT, encoding: "utf8" })
    .split("\n").filter(x => x.endsWith(".html"))
    .map(x => DOMAIN + "/" + path.basename(x));
  const set = new Set(changed);
  // 홈은 site/index.html → DOMAIN + "/"
  if (set.has(DOMAIN + "/index.html")) set.add(DOMAIN + "/");
  urls = urls.filter(u => set.has(u));
}
if (PREFIX && typeof PREFIX === "string") {
  urls = urls.filter(u => path.basename(u).startsWith(PREFIX));
}

if (!urls.length) { console.error("보낼 URL이 없다"); process.exit(1); }
if (urls.length > 10000) { console.error("URL이 10,000개를 넘는다. 나눠 보내야 한다"); process.exit(1); }

const body = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: `${DOMAIN}/${KEY}.txt`,
  urlList: urls,
});

console.log(`호스트   ${HOST}`);
console.log(`키       ${KEY}`);
console.log(`키 위치  ${DOMAIN}/${KEY}.txt`);
console.log(`URL      ${urls.length}개`);
const byPrefix = {};
for (const u of urls) { const b = path.basename(u).replace(/-.*$/, "-") || "/"; byPrefix[b] = (byPrefix[b] || 0) + 1; }
console.log("  " + Object.entries(byPrefix).sort((a, b) => b[1] - a[1]).slice(0, 8)
  .map(([k, v]) => `${k}${v}`).join("  ") + (Object.keys(byPrefix).length > 8 ? "  …" : ""));
console.log("  예시: " + urls.slice(0, 3).join("\n         "));

if (DRY) { console.log("\n--dry 라 전송하지 않았다."); process.exit(0); }

const req = https.request({
  hostname: "api.indexnow.org", path: "/indexnow", method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body) },
}, res => {
  let d = ""; res.on("data", c => d += c);
  res.on("end", () => {
    const MEAN = { 200:"성공", 202:"수신됨 — 키 검증 진행중", 400:"형식 오류", 403:"키 불일치", 422:"호스트/키 불일치", 429:"요청 과다" };
    console.log(`\n응답 ${res.statusCode} — ${MEAN[res.statusCode] || "알 수 없음"}`);
    if (d.trim()) console.log("본문: " + d.trim().slice(0, 300));
    process.exit(res.statusCode === 200 || res.statusCode === 202 ? 0 : 1);
  });
});
req.on("error", e => { console.error("전송 실패:", e.message); process.exit(1); });
req.write(body);
req.end();
