// 공유 미리보기 카드(og_cards.js)를 만들 페이지를 빌드된 site/*.html 에서 고른다. 대량 생성 페이지(월력·일진·일주·타로 등)는 제외.
const fs = require("fs"), path = require("path");
const SITE = path.join(__dirname, "..", "site");
const HUBS = new Set(["learn", "dict", "column", "about"]);
const strip = s => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
function targets() {
  const out = [];
  for (const f of fs.readdirSync(SITE).filter(x => x.endsWith(".html")).sort()) {
    const slug = f.replace(/\.html$/, ""), h = fs.readFileSync(path.join(SITE, f), "utf8");
    const heroSrc = (/<div class="toolhero[^"]*"><img src="([^"]+)"/.exec(h) || [])[1] || "", isTool = heroSrc === "img/tool/h-" + slug + ".webp", lec = /<div class="lbar" data-lecture="(\d+)"/.exec(h);
    const fam = /^(column|concept)-/.test(slug), hub = HUBS.has(slug);
    if (!(isTool || lec || fam || hub)) continue;
    const hero = /<div class="toolhero[^"]*"><img src="([^"]+)"/.exec(h), bos = /<img class="th-bosal" src="([^"]+)"/.exec(h);
    const h1 = /<div class="cap"><h1>([\s\S]*?)<\/h1>/.exec(h) || /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(h), tl = /<div class="tl">([\s\S]*?)<\/div>/.exec(h);
    const desc = (/<meta name="description" content="([^"]*)"/.exec(h) || [])[1] || "";
    const part = lec ? (/<div class="lbar-top"><a[^>]*>[^<]*<\/a><span>([^<]*)<\/span>/.exec(h) || [])[1] : "";
    out.push({ slug, kind: lec ? "lecture" : isTool ? "tool" : hub ? "hub" : "article", title: strip(h1 ? h1[1] : slug), sub: strip(tl ? tl[1] : desc), hero: hero ? hero[1] : "", mascot: bos ? bos[1] : "", lecture: lec ? +lec[1] : 0, part: part ? strip(part) : "" });
  }
  return out;
}
module.exports = { targets };
if (require.main === module) { const t = targets(); const by = {}; t.forEach(x => by[x.kind] = (by[x.kind] || 0) + 1); console.log("대상", t.length, by); t.slice(0, 6).forEach(x => console.log(JSON.stringify(x))); }
