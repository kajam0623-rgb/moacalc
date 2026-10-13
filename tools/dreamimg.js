// 꿈해몽 깊이 페이지 그림 한 장: Codex 래퍼(imggen.ps1)로 만들고 webp(16:9 1120px, ≤70KB)로 줄여 img/dream/<k>.webp 에 둔다.
// 사용: node tools/dreamimg.js <항목키> "<영문 장면 설명>"   — 래퍼가 생성 폴더 차이로 파일을 집으니 한 번에 하나만(병렬 금지).
// 장면은 무섭지 않게(피·시신·상처 금지). 원본 PNG 는 리포 밖 C:/tmp/dreamimg-raw.
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const [k, subject] = process.argv.slice(2);
if (!k || !subject) { console.log('사용: node tools/dreamimg.js <항목키> "<장면>"'); process.exit(1); }
const RAW = "C:/tmp/dreamimg-raw", OUT = path.join(__dirname, "../img/dream"), PS1 = process.env.USERPROFILE + "\\.claude\\scripts\\imggen.ps1";
fs.mkdirSync(RAW, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
const STYLE = "Cinematic East-Asian fantasy illustration in a painterly semi-realistic anime style, deep midnight-navy night atmosphere with warm gold glowing light particles, soft rim lighting, rich detail, dreamy mystical oriental mood, Korean traditional hanbok clothing wherever people appear";
const prompt = `Use case: stylized-concept. Asset type: inline illustration for a Korean dream-interpretation article. Subject and scene: ${subject}. Style: ${STYLE}. Composition: 2048x1152 wide 16:9, subject centered with generous margins. Gentle, calm, not scary: no blood, wounds, corpses or horror. Avoid any text, letters, numbers, Chinese characters, signs, watermark, logo, extra fingers.`;
const png = `${RAW}/dream-${k}.png`, dst = `${OUT}/${k}.webp`;
if (!fs.existsSync(png)) {
  for (let i = 1; i <= 3 && !fs.existsSync(png); i++) {
    const r = spawnSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", PS1, "-Prompt", prompt, "-Name", `dream-${k}`, "-Out", RAW.replace(/\//g, "\\")],
      { env: Object.assign({}, process.env, { IMGGEN_MODEL: process.env.IMGGEN_MODEL || "gpt-5.6-sol" }), encoding: "utf8", timeout: 480000 });
    if (!fs.existsSync(png)) console.log(`생성 실패 ${i}회: ${(r.stderr || r.stdout || "").toString().replace(/\s+/g, " ").slice(-200)}`);
  }
  if (!fs.existsSync(png)) process.exit(2);
}
const [w, h] = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", png], { encoding: "utf8" }).stdout.trim().split(",").map(Number);
const cw = Math.min(w, Math.floor(h * 16 / 9)), ch = Math.min(h, Math.floor(cw * 9 / 16));   // 반올림으로 원본보다 1px 커지면 crop 이 실패했다
let kb = 0, q = 62;
for (; q >= 36; q -= 4) {   // ffmpeg libwebp 는 -q:v 로 품질을 받는다
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", png, "-vf", `crop=${cw}:${ch},scale=1120:630:flags=lanczos`, "-c:v", "libwebp", "-q:v", String(q), dst], { encoding: "utf8" });
  if (r.status !== 0) { console.log("변환 실패", r.stderr); process.exit(3); }
  kb = Math.round(fs.statSync(dst).size / 1024); if (kb <= 70) break;
}
console.log(`OK ${dst} q${q} ${kb}KB`);
