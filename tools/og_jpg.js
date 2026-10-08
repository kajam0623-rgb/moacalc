// 공유 미리보기(og:image)용 JPG 만들기 — 카카오톡 스크랩은 JPG·PNG만 읽어서 webp 대표 그림을 img/ogj/ 아래 같은 경로 .jpg 로 둔다.
// 빌드는 img/ogj/<경로>.jpg 가 있으면 og:image 를 그쪽으로 바꾼다. 새 webp 대표 그림을 넣었으면: node tools/og_jpg.js
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const SITE = path.join(__dirname, "..", "site"), IMG = path.join(__dirname, "..", "img");
const FF = process.env.FFMPEG || "ffmpeg";
const need = new Set();
for (const f of fs.readdirSync(SITE)) if (f.endsWith(".html")) {
  const m = fs.readFileSync(path.join(SITE, f), "utf8").match(/property="og:image" content="https:\/\/dongnebosal\.com\/img\/([^"]+)\.webp"/);
  if (m) need.add(m[1]);
}
let made = 0;
for (const rel of need) {
  const src = path.join(IMG, rel + ".webp"), dst = path.join(IMG, "ogj", rel + ".jpg");
  if (fs.existsSync(dst) || !fs.existsSync(src)) continue;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  execFileSync(FF, ["-loglevel", "error", "-y", "-i", src, "-vf", "scale='min(800,iw)':-2", "-q:v", "5", dst]);
  made++;
}
console.log("og jpg:", need.size, "대상,", made, "새로 만듦");
