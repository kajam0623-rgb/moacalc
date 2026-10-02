// 동네보살 사진(사용자가 만든 '일주 60편 시리즈' 그림 · 결과 카드)을 webp 로 줄여 img/ 에 둔다.
// 사용: node tools/iljuimg/convert.js [이름 부분문자열…] [--force]
//   원본 폴더는 DNBS_PHOTO(기본 C:/Users/닥터원츠/Downloads/동네보살 사진). 원본은 건드리지 않고 리포에는 webp 만 넣는다.
// 이름 규칙 → 결과
//   <일주>-anime.png              → img/ilju/<일주>-1.webp      (1~24번째 일주, 한 장씩)
//   <일주>-0N-YYYYMMDD.png        → img/ilju/<일주>-N.webp      (25번째부터, 세 장씩)
//   gapja-upright-tree · tree-water · relationships → img/ilju/gapja-1 · 2 · 3
//   동네보살-타로.png · 동네보살-타로 (1).png       → img/promo/tarot-card-1 · 2
//   이름궁합 (1).png                               → img/promo/namematch-card-1 (57점 성장형 · 김철수 ♥ 이영희)
//   그 밖(동네보살-프로필.png 등)은 건너뛴다 — 마스코트는 기존 img/mascot*.webp 를 그대로 쓴다(2026-10-02 사용자 결정).
//   이름궁합.png 는 이름 칸이 '김철수민준이서연 ♥ 이영희서연김민준이영' 같은 긴 이름 시험값이라 싣지 않는다(파일 이름과 내용을 열어 보고 확인했다).
// 원본 비율 그대로 줄인다(자르지 않는다 — 칼럼 그림에서 미리 자르면 얼굴이 잘렸다).
//   가로(3:2 · 4:3) 1200px · 정사각 1000px · 세로(4:5) 900px · 결과 카드 600/540px
//   용량 예산을 넘으면 품질을 q46 까지 4씩 낮추고, 그래도 넘으면 폭을 8%씩 줄인다(최대 4번).
//   ffmpeg libwebp 는 -quality 가 아니라 -q:v 로 품질을 받는다.
// webp 가 원본보다 새로우면 건너뛴다(--force 면 다시).
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const SRC = process.env.DNBS_PHOTO || "C:/Users/닥터원츠/Downloads/동네보살 사진";
const IMG = path.join(__dirname, "../../img");
const FORCE = process.argv.includes("--force"), only = process.argv.slice(2).filter(a => !a.startsWith("--"));
const GAPJA = { "upright-tree": 1, "tree-water": 2, "relationships": 3 };

// 원본 파일명 → [결과 상대경로, 종류] 또는 null(건너뜀)
function target(f) {
  let m;
  if ((m = /^([a-z]+)-anime\.png$/.exec(f))) return [`ilju/${m[1]}-1.webp`, "ilju"];
  if ((m = /^([a-z]+)-0(\d)-\d{8}\.png$/.exec(f))) return [`ilju/${m[1]}-${m[2]}.webp`, "ilju"];
  if ((m = /^gapja-([a-z-]+)\.png$/.exec(f)) && GAPJA[m[1]]) return [`ilju/gapja-${GAPJA[m[1]]}.webp`, "ilju"];
  if (f === "동네보살-타로.png") return ["promo/tarot-card-1.webp", "tarot"];
  if (f === "동네보살-타로 (1).png") return ["promo/tarot-card-2.webp", "tarot"];
  if (f === "이름궁합 (1).png") return ["promo/namematch-card-1.webp", "story"];
  return null;
}
const dims = f => { const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", f], { encoding: "utf8" }); const [w, h] = r.stdout.trim().split(",").map(Number); return { w, h }; };
// 종류·비율 → 시작 폭과 용량 예산(KB)
function spec(kind, ar) {
  if (kind === "tarot") return { w: 600, budget: 70 };
  if (kind === "story") return { w: 540, budget: 70 };
  if (ar > 1.05) return { w: 1200, budget: 100 };
  if (ar > 0.95) return { w: 1000, budget: 100 };
  return { w: 900, budget: 100 };
}

const rows = []; let tin = 0, tout = 0, skipped = [];
for (const f of fs.readdirSync(SRC).filter(x => x.toLowerCase().endsWith(".png")).sort()) {
  const t = target(f);
  if (!t) { skipped.push(f); continue; }
  const [rel, kind] = t;
  if (only.length && !only.some(o => f.includes(o) || rel.includes(o))) continue;
  const src = path.join(SRC, f), dst = path.join(IMG, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const inKb = Math.round(fs.statSync(src).size / 1024); tin += inKb;
  if (!FORCE && fs.existsSync(dst) && fs.statSync(dst).mtimeMs > fs.statSync(src).mtimeMs) {
    const kb = Math.round(fs.statSync(dst).size / 1024); tout += kb; rows.push([rel, "건너뜀(최신)", kb, inKb]); continue;
  }
  const d = dims(src), s = spec(kind, d.w / d.h);
  let w = Math.min(s.w, d.w), q = 62, kb = 0, h = 0, bytes = 0;
  for (let round = 0; round < 5 && !(bytes && bytes <= s.budget * 1024); round++) {
    h = Math.round(w * d.h / d.w / 2) * 2;
    for (q = round ? 50 : 62; q >= 46; q -= 4) {
      const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-vf", `scale=${w}:${h}:flags=lanczos`, "-c:v", "libwebp", "-q:v", String(q), "-compression_level", "6", dst], { encoding: "utf8" });
      if (r.status !== 0) { console.log("변환 실패", f, r.stderr); round = 9; break; }
      // 예산은 바이트로 잰다(반올림한 KB 로 재면 100.4KB 가 통과해 verify 의 100×1024 에 걸린다)
      bytes = fs.statSync(dst).size; kb = Math.round(bytes / 1024); if (bytes <= s.budget * 1024) break;
    }
    if (bytes > s.budget * 1024) w = Math.round(w * 0.92 / 2) * 2;
  }
  tout += kb; rows.push([rel, `q${q} ${w}×${h} (예산 ${s.budget}KB)`, kb, inKb]);
}
rows.forEach(r => console.log(r[0].padEnd(30), String(r[1]).padEnd(28), String(r[2]).padStart(4) + "KB  ← 원본 " + r[3] + "KB"));
if (skipped.length) console.log("건너뜀(쓰지 않는 파일): " + skipped.join(" · "));
console.log(`합계: ${rows.length}장, 원본 ${(tin / 1024).toFixed(1)}MB → webp ${(tout / 1024).toFixed(2)}MB`);
