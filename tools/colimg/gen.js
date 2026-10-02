// 보살 칼럼 이미지 50장을 Codex 래퍼(imggen.ps1)로 하나씩 만든다. 사용: node tools/colimg/gen.js [이름 부분문자열…]
// 래퍼는 '생성 폴더 전/후 차이'로 결과 파일을 집으므로 병렬로 돌리면 서로 그림을 바꿔 집는다 → 반드시 순차 실행(장당 약 40~60초).
// 이어 하기: 이미 <COLIMG_RAW>/<name>.png 가 있으면 건너뛴다. 기본 모델이 거절되면(gpt-6-sol 400) gpt-5.6-sol 로 고정해 다시 한다.
const fs = require("fs"), { spawnSync } = require("child_process");
const DIR = __dirname, RAW = process.env.COLIMG_RAW || "C:/tmp/colimg-raw", LOG = RAW + "/gen.log";
const PS1 = process.env.IMGGEN_PS1 || (process.env.USERPROFILE + "\\.claude\\scripts\\imggen.ps1");
fs.mkdirSync(RAW, { recursive: true });   // 원본 PNG(장당 2~3MB)는 리포 밖에 둔다
const jobs = JSON.parse(fs.readFileSync(DIR + "/jobs.json", "utf8"));
const only = process.argv.slice(2);
const STYLE = "Cinematic East-Asian fantasy illustration in a painterly semi-realistic anime style, deep midnight-navy and black night atmosphere with warm gold glowing light particles and thin golden light lines, elegant soft rim lighting, rich detail, mystical oriental fortune-telling mood, Korean traditional hanbok clothing wherever people appear";
const AVOID = "Avoid any text, letters, numbers, Chinese characters, calligraphy, signs, watermark, logo, UI elements, extra fingers";
const build = j => j.kind === "tile"
  ? `Use case: stylized-concept. Asset type: website tile image for a Korean fortune-telling column. Subject and scene: ${j.subject}. Style: ${STYLE}. Composition: 1536x1024 landscape 3:2, main subject centered slightly above the middle with generous margins, a calmer darker area along the bottom third. Lighting: moody night lighting with a warm golden glow. ${AVOID}.`
  : `Use case: stylized-concept. Asset type: large inline illustration for a Korean fortune-telling article. Subject and scene: ${j.subject}. Style: ${STYLE}. Composition: 2048x1152 wide 16:9 cinematic, subject centered with generous margins. Lighting: moody night lighting with a warm golden glow. ${AVOID}.`;
const log = s => { const t = new Date().toTimeString().slice(0, 8) + " " + s; console.log(t); fs.appendFileSync(LOG, t + "\n"); };
let ok = 0, fail = 0;
for (const j of jobs) {
  if (only.length && !only.some(o => j.name.includes(o))) continue;
  if (fs.existsSync(`${RAW}/${j.name}.png`)) { log("건너뜀(있음) " + j.name); ok++; continue; }
  let done = false;
  for (let attempt = 1; attempt <= 3 && !done; attempt++) {
    const env = Object.assign({}, process.env, { IMGGEN_MODEL: process.env.IMGGEN_MODEL || "gpt-5.6-sol" });
    const t0 = Date.now();
    const r = spawnSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", PS1, "-Prompt", build(j), "-Name", j.name, "-Out", RAW.replace(/\//g, "\\")], { env, encoding: "utf8", timeout: 480000 });
    const secs = Math.round((Date.now() - t0) / 1000), exists = fs.existsSync(`${RAW}/${j.name}.png`);
    if (r.status === 0 && exists) { done = true; ok++; log(`OK  ${j.name} (${secs}s, 시도 ${attempt}) ${Math.round(fs.statSync(`${RAW}/${j.name}.png`).size / 1024)}KB`); }
    else log(`실패 ${j.name} 시도 ${attempt} (${secs}s) status=${r.status} ${(r.stderr || r.stdout || "").toString().replace(/\s+/g, " ").slice(-200)}`);
  }
  if (!done) fail++;
}
log(`끝: 성공 ${ok} · 실패 ${fail}`);
