/* 카드 HTML을 1080x1350 PNG로 굽는다.
   설치된 크롬을 그대로 쓴다(puppeteer-core). Chromium을 따로 받지 않는다.

   실행: node threads_card.js && node threads_shot.js
   결과: card-out/card-YYYY-MM-DD.png
*/
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = path.join(__dirname, "card-out");
const W = 1080, H = 1350;

(async () => {
  if (!fs.existsSync(path.join(OUT, "index.html"))) {
    console.error("card-out/index.html 이 없다. 먼저 node threads_card.js 를 실행해라.");
    process.exit(1);
  }
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const file = path.join(OUT, `card-${stamp}.png`);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
    // file:// 로 직접 연다 — 서버를 띄울 필요가 없다
    await page.goto("file:///" + path.join(OUT, "index.html").replace(/\\/g, "/"),
      { waitUntil: "networkidle0" });
    // 웹폰트·이미지가 자리 잡을 시간
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H } });
  } finally {
    await browser.close();
  }

  const kb = Math.round(fs.statSync(file).size / 1024);
  console.log(`저장: ${file}  (${W}x${H}, ${kb}KB)`);
})().catch(e => { console.error("실패:", e.message); process.exit(1); });
