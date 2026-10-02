// 칼럼 이미지 원본 PNG(Codex, 2~3MB) → webp 로 줄여 img/col/ 에 둔다. 사용: node tools/colimg/convert.js [이름 부분문자열…] [--force]
// 화면에 보이는 비율로 미리 잘라(크롭) 안 보이는 픽셀을 버리고, 칸 크기별 폭·품질로 줄인 뒤 용량 예산을 넘으면 품질을 낮춘다.
//   작은 타일 6:5 560px(≤32KB) · 큰 타일 6:5 960px(≤70KB) · 가로 타일 2.4:1 900px(≤45KB) · 글 안 그림 16:9 1120px(≤70KB)
//   초점(pos)은 content_column_img.js 의 값. ffmpeg 의 libwebp 는 -quality 가 아니라 -q:v 로 품질을 받는다(-quality 는 무시되어 같은 크기가 나온다).
// webp 가 PNG 보다 새로우면 건너뛴다(--force 면 다시). 이미지 생성이 병행될 때는 개발용 임시 파일의 mtime 을 1970 으로 찍어 두면 진짜 그림이 덮어쓴다.
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const RAW = process.env.COLIMG_RAW || "C:/tmp/colimg-raw", OUT = process.env.COLIMG_OUT || path.join(__dirname, "../../img/col");
const DATA = require("../../content_column_img.js");
const FORCE = process.argv.includes("--force"), only = process.argv.slice(2).filter(a => !a.startsWith("--"));
const tile = Object.fromEntries(DATA.tiles.map(t => [t[0], { sz: t[1], pos: t[2] }]));
// 이름 → {aspect(가로/세로), w(출력 폭), q(시작 품질), budget(KB), fx, fy(초점 0~1)}
const spec = name => {
  if (name.startsWith("fig-")) return { aspect: 16 / 9, w: 1120, q: 60, budget: 70, fx: .5, fy: .5 };
  const t = tile[name.slice(5)] || { sz: "s", pos: "50% 50%" }, [px, py] = t.pos.split(" ").map(v => parseFloat(v) / 100);
  return t.sz === "w" ? { aspect: 2.4, w: 900, q: 60, budget: 45, fx: px, fy: py } : t.sz === "l" ? { aspect: 1.2, w: 960, q: 60, budget: 70, fx: px, fy: py } : { aspect: 1.2, w: 560, q: 62, budget: 32, fx: px, fy: py };
};
const dims = f => { const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", f], { encoding: "utf8" }); const [w, h] = r.stdout.trim().split(",").map(Number); return { w, h }; };
fs.mkdirSync(OUT, { recursive: true });
const rows = []; let totalIn = 0, totalOut = 0;
for (const f of fs.readdirSync(RAW).filter(x => x.endsWith(".png")).sort()) {
  const name = f.slice(0, -4); if (only.length && !only.some(o => name.includes(o))) continue;
  const src = `${RAW}/${f}`, dst = `${OUT}/${name}.webp`, inKb = Math.round(fs.statSync(src).size / 1024); totalIn += inKb;
  if (!FORCE && fs.existsSync(dst) && fs.statSync(dst).mtimeMs > fs.statSync(src).mtimeMs) { const kb = Math.round(fs.statSync(dst).size / 1024); rows.push([name, "건너뜀", kb, inKb]); totalOut += kb; continue; }
  const s = spec(name), d = dims(src), srcA = d.w / d.h; let cw = d.w, ch = d.h, cx = 0, cy = 0;
  if (s.aspect > srcA) { ch = Math.round(d.w / s.aspect); cy = Math.round((d.h - ch) * s.fy); } else { cw = Math.round(d.h * s.aspect); cx = Math.round((d.w - cw) * s.fx); }
  // 먼저 품질을 낮추고(40까지), 그래도 예산을 넘는 디테일 많은 그림은 폭을 8%씩 줄여 가며 다시 한다(최대 4번, 비율은 그대로)
  let w = s.w, q = s.q, kb = 0, outH = 0;
  for (let round = 0; round < 5 && !(kb && kb <= s.budget); round++) {
    outH = Math.round(w / s.aspect / 2) * 2;
    for (q = round ? 48 : s.q; q >= 40; q -= 4) {
      const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-vf", `crop=${cw}:${ch}:${cx}:${cy},scale=${w}:${outH}:flags=lanczos`, "-c:v", "libwebp", "-q:v", String(q), "-compression_level", "6", dst], { encoding: "utf8" });
      if (r.status !== 0) { console.log("변환 실패", name, r.stderr); round = 9; break; }
      kb = Math.round(fs.statSync(dst).size / 1024); if (kb <= s.budget) break;
    }
    if (kb > s.budget) w = Math.round(w * 0.92 / 2) * 2;
  }
  totalOut += kb; rows.push([name, `q${q} ${w}×${outH} (예산 ${s.budget}KB)`, kb, inKb]);
}
rows.forEach(r => console.log(r[0].padEnd(34), String(r[1]).padEnd(30), String(r[2]).padStart(4) + "KB" + (r[3] ? "  ← 원본 " + r[3] + "KB" : "")));
console.log(`합계: ${rows.length}장, 원본 ${(totalIn / 1024).toFixed(1)}MB → webp ${(totalOut / 1024).toFixed(2)}MB`);
