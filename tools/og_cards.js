// 공유 미리보기 카드(1200×630 JPG)를 페이지마다 만든다 → img/og/<slug>.jpg (리포에 커밋, 빌드가 og:image 로 쓴다).
// 사용: node build_site.js  →  node tools/og_cards.js [--only slug,slug]  →  node build_site.js
// 필요: puppeteer-core + Chrome(기본 경로 아래) + Pretendard(설치된 글꼴). 글자는 빌드된 site/*.html 에서 읽는다 —
// 제목·부제를 고치면 이 스크립트를 다시 돌려야 카드에 반영된다.
const fs = require("fs"), path = require("path");
let puppeteer; for (const p of ["puppeteer-core", process.env.PUPPETEER_CORE, "C:/Users/닥터원츠/node_modules/puppeteer-core"]) { if (!p) continue; try { puppeteer = require(p); break; } catch (e) { } }
if (!puppeteer) { console.error("puppeteer-core 를 찾지 못했다(PUPPETEER_CORE 환경변수로 경로 지정)"); process.exit(1); }
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ROOT = path.join(__dirname, ".."), SITE = path.join(ROOT, "site"), OUT = path.join(ROOT, "img", "og");
const { targets } = require("./og_targets.js");
const only = (process.argv.find(a => a.startsWith("--only=")) || "").replace("--only=", "").split(",").filter(Boolean);

// 그림형 카드(일간·띠·별자리·십성): 그 페이지의 대표 그림을 오른쪽에 크게
const ART_FAM = { ilgan: "사주 사전 · 일간", zodiac: "사주 사전 · 띠", star: "사주 사전 · 별자리", sipseong: "사주 사전 · 십성" };
function artTargets() {
  const out = [];
  for (const f of fs.readdirSync(SITE).filter(x => /^(ilgan|zodiac|star|sipseong)-.+\.html$/.test(x)).sort()) {
    const slug = f.replace(/\.html$/, ""), h = fs.readFileSync(path.join(SITE, f), "utf8"), fam = slug.split("-")[0];
    const art = (/<meta property="og:image" content="https:\/\/dongnebosal\.com\/([^"]+)"/.exec(h) || [])[1];
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(h), tl = /<div class="tl">([\s\S]*?)<\/div>/.exec(h) || /<meta name="description" content="([^"]*)"/.exec(h);
    const strip = s => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
    if (art && h1) out.push({ slug, kind: "art", label: ART_FAM[fam], title: strip(h1[1]), sub: strip(tl ? tl[1] : ""), art });
  }
  return out;
}

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const url = rel => rel ? "file:///" + encodeURI(path.join(ROOT, rel).replace(/\\/g, "/")) : "";
const PART_HUE = { 1: "#E6B25A", 2: "#6fb7a0", 3: "#9aa8ff", 4: "#e59ac6" };
function html(t) {
  const lec = t.kind === "lecture", art = t.kind === "art";
  const label = lec ? "명리학 배우기 · " + t.lecture + "강" : art ? t.label : t.kind === "hub" ? "동네보살" : t.kind === "article" ? "동네보살 · 보살 칼럼" : "동네보살 · 무료";
  const partNo = lec ? +(/^(\d)부/.exec(t.part) || [0, 1])[1] : 0, hue = PART_HUE[partNo] || "#E6B25A";
  const title = lec ? t.title.replace(/\s*\(명리학 \d+강\)\s*$/, "") : t.title;
  const bg = art ? "" : t.hero ? `<img class="bg" src="${url(t.hero)}">` : "";
  const mascot = !art && t.mascot ? `<img class="mascot" src="${url(t.mascot)}">` : (!art && !t.hero ? `<img class="mascot" src="${url("img/bosal/smile.webp")}">` : "");
  const artImg = art ? `<div class="artbox"><img src="${url(t.art)}"></div>` : "";
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0}
body{width:1200px;height:630px;position:relative;overflow:hidden;font-family:"Pretendard","Noto Sans KR","Malgun Gothic",sans-serif;color:#fff;background:linear-gradient(135deg,#0d1424,#131c30 55%,#0a0f1a)}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,11,20,.9) 0%,rgba(8,11,20,.74) 42%,rgba(8,11,20,.22) 74%,rgba(8,11,20,0) 100%)}
.stars{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.5) 1px,transparent 1.4px);background-size:97px 89px;opacity:.35}
.frame{position:absolute;inset:22px;border:2px solid rgba(212,175,110,.45);border-radius:6px}
.txt{position:absolute;left:78px;top:78px;bottom:78px;width:${art ? 540 : 700}px;display:flex;flex-direction:column}
.pill{align-self:flex-start;font-size:26px;font-weight:700;color:#0d1424;background:${hue};border-radius:999px;padding:8px 22px;letter-spacing:-.3px}
.part{margin-top:14px;font-size:24px;color:#aab3c2;font-weight:500}
h1{margin:24px 0 0;font-weight:800;line-height:1.2;letter-spacing:-2px;word-break:keep-all;font-size:78px;text-shadow:0 2px 18px rgba(0,0,0,.5)}
.sub{margin:22px 0 0;font-size:31px;line-height:1.45;color:#cfd6e0;font-weight:500;word-break:keep-all;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.foot{margin-top:auto;font-size:30px;font-weight:700;color:#d4af6e;letter-spacing:.2px}
.foot small{font-size:24px;font-weight:500;color:#8b95a6;margin-left:14px}
.mascot{position:absolute;right:34px;bottom:14px;height:${t.hero ? 420 : 470}px;filter:drop-shadow(0 10px 24px rgba(0,0,0,.5))}
.artbox{position:absolute;right:78px;top:78px;width:474px;height:474px;border-radius:26px;overflow:hidden;border:3px solid rgba(212,175,110,.6);box-shadow:0 18px 50px rgba(0,0,0,.55)}
.artbox img{width:100%;height:100%;object-fit:cover;display:block}
</style><body>${bg}${art ? '<div class="stars"></div>' : '<div class="shade"></div>'}<div class="frame"></div>${artImg}${mascot}
<div class="txt"><div class="pill">${esc(label)}</div>${lec && t.part ? `<div class="part">${esc(t.part)}</div>` : ""}<h1 id="h">${esc(title)}</h1>${t.sub ? `<div class="sub">${esc(t.sub)}</div>` : ""}<div class="foot">dongnebosal.com<small>무료 사주 · 오늘의 운세</small></div></div></body>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let list = targets().concat(artTargets()); if (only.length) list = list.filter(t => only.includes(t.slug));
  const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--allow-file-access-from-files"] });
  const p = await b.newPage(); await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  const tmp = path.join(ROOT, "img", "og", "_tmp.html"); let n = 0, big = 0;
  for (const t of list) {
    fs.writeFileSync(tmp, html(t)); await p.goto("file:///" + encodeURI(tmp.replace(/\\/g, "/")), { waitUntil: "load" });
    await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });
    // 제목이 칸을 넘으면 글자를 줄인다(세 줄·남는 높이 안에)
    await p.evaluate(() => { const h = document.getElementById("h"), sub = document.querySelector(".sub"), foot = document.querySelector(".foot"); let fs = 78; const room = () => foot.getBoundingClientRect().top - (sub ? sub.getBoundingClientRect().bottom : h.getBoundingClientRect().bottom) ; while (fs > 40 && (h.getBoundingClientRect().height > fs * 1.2 * 3.05 || (sub && sub.getBoundingClientRect().bottom > foot.getBoundingClientRect().top - 10))) { fs -= 3; h.style.fontSize = fs + "px"; } });
    let q = 86, buf; do { buf = await p.screenshot({ type: "jpeg", quality: q, clip: { x: 0, y: 0, width: 1200, height: 630 } }); q -= 6; } while (buf.length > 280000 && q > 50);
    fs.writeFileSync(path.join(OUT, t.slug + ".jpg"), buf); n++; if (buf.length > 200000) big++;
  }
  fs.unlinkSync(tmp); await b.close();
  console.log("카드", n, "장 → img/og/ (200KB 넘는 것", big, "장)");
})().catch(e => { console.error("실패:", e.message); process.exit(1); });
