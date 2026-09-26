/* 애드센스 "가치가 별로 없는 콘텐츠" 대응 하네스.
   빌드 결과(site/)를 읽어 단계별 게이트를 검사한다. 빌드는 하지 않는다.

   node adsense_audit.js                 현황 보고 + 공통 게이트
   node adsense_audit.js --phase=3       공통 + 2~3단계 게이트까지 강제 (실패하면 종료 코드 1)
   node adsense_audit.js --baseline      현황을 adsense_baseline.json 에 저장 (작업 전 한 번)
   node adsense_audit.js --live          라이브 사이트에서 표본 페이지의 robots 메타와 사이트맵을 확인

   단계: 2 계산기 검색 제외 / 3 월력 줄이기 / 4 음력 페이지 보강 / 5 칼럼 추가 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const SITE = path.join(__dirname, "site");
const DOMAIN = "https://dongnebosal.com";
// 3단계: 이 기간의 월력만 검색에 남긴다. 나머지는 noindex + 사이트맵 제외
const MANSE_KEEP = { from: "2025-01", to: "2027-12" };
const LUNAR_MIN = 1200;   // 4단계: 음력 페이지 정적 본문 최소 글자(공백 제외)
const THIN_MIN = 800;     // 이보다 얇은 검색 노출 페이지는 목록으로 보고한다
const COLUMN_MIN = { count: 10, chars: 1500 }; // 5단계

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
const PHASE = +(args.phase || 0);

// 도구 id → 분류 (hub.html TOOLS 가 원본)
const hub = fs.readFileSync(path.join(__dirname, "hub.html"), "utf8");
const TOOL_CAT = {};
for (const m of hub.matchAll(/\{id:"([a-z0-9]+)",\s*cat:"([^"]+)"/g)) TOOL_CAT[m[1]] = m[2];

const typeOf = id => {
  if (TOOL_CAT[id]) return TOOL_CAT[id] === "재미·운세" ? "운세도구" : id === "lunar" ? "음력" : "계산기";
  if (/^manse-\d{4}-\d{2}$/.test(id)) return "월력";
  const m = id.match(/^([a-z]+)-/); if (m) return { iljin: "일진", ilju: "일주", tarot: "타로", star: "별자리", zodiac: "띠", ilgan: "일간", sipseong: "십성", concept: "개념", column: "칼럼", manse: "만세력안내" }[m[1]] || m[1];
  return { index: "홈", "404": "404", about: "소개", privacy: "약관", terms: "약관", iljin: "일진", manse: "만세력안내" }[id] || "기타";
};
const TEMPLATED = new Set(["월력", "일진", "일주"]);

const visible = html => {
  let h = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<(header|footer|nav|aside)[\s\S]*?<\/\1>/gi, "");
  const m = h.match(/<main[\s\S]*<\/main>/i);
  return (m ? m[0] : h).replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, "");
};

// ---- 읽기
const pages = fs.readdirSync(SITE).filter(f => f.endsWith(".html")).map(f => {
  const html = fs.readFileSync(path.join(SITE, f), "utf8");
  const id = f.replace(/\.html$/, "");
  const robots = (html.match(/<meta name="robots" content="([^"]+)"/i) || [])[1] || "";
  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/i) || [])[1] || "";
  const navHtml = (html.match(/<nav class="sitenav">[\s\S]*?<\/nav>/) || [""])[0];
  const links = [...html.matchAll(/href="([a-z0-9-]+)\.html(?:[#?][^"]*)?"/g)].map(m => m[1]);
  return { f, id, type: typeOf(id), noindex: /noindex/i.test(robots), canon, chars: visible(html).length, links, navLinks: [...navHtml.matchAll(/href="([a-z0-9-]+)\.html"/g)].map(m => m[1]) };
});
const byId = Object.fromEntries(pages.map(p => [p.id, p]));
const sitemap = fs.readFileSync(path.join(SITE, "sitemap.xml"), "utf8");
const smIds = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(DOMAIN + "/", "").replace(/\.html$/, "") || "index"));
const rss = fs.readFileSync(path.join(SITE, "rss.xml"), "utf8");
const llms = fs.existsSync(path.join(SITE, "llms.txt")) ? fs.readFileSync(path.join(SITE, "llms.txt"), "utf8") : "";
const indexable = pages.filter(p => !p.noindex && p.id !== "404");

// ---- 현황
const count = {};
for (const p of pages) { const c = count[p.type] = count[p.type] || { 전체: 0, 노출: 0 }; c.전체++; if (!p.noindex && p.id !== "404") c.노출++; }
const templ = indexable.filter(p => TEMPLATED.has(p.type)).length;
const thin = indexable.filter(p => p.chars < THIN_MIN && !["약관", "소개", "홈"].includes(p.type)).sort((a, b) => a.chars - b.chars);
const report = {
  페이지: pages.length, 검색노출: indexable.length, 사이트맵: smIds.size,
  찍어낸페이지비율: `${templ}/${indexable.length} (${(100 * templ / indexable.length).toFixed(0)}%)`,
  종류별: count, 얇은노출페이지: thin.map(p => `${p.id}(${p.chars})`),
};
console.log("== 현황");
console.log(`페이지 ${report.페이지} · 검색 노출 ${report.검색노출} · 사이트맵 ${report.사이트맵} · 찍어 낸 페이지 ${report.찍어낸페이지비율}`);
console.log(Object.entries(count).sort((a, b) => b[1].전체 - a[1].전체).map(([k, v]) => `${k} ${v.노출}/${v.전체}`).join(" · "));
console.log(`얇은 노출 페이지(<${THIN_MIN}자) ${thin.length}개: ${thin.slice(0, 12).map(p => `${p.id}(${p.chars})`).join(" ")}${thin.length > 12 ? " …" : ""}`);

if (args.baseline) {
  fs.writeFileSync(path.join(__dirname, "adsense_baseline.json"), JSON.stringify({ date: new Date().toISOString().slice(0, 10), ...report }, null, 1));
  console.log("기준값 저장: adsense_baseline.json");
}

// ---- 게이트
const results = [];
const gate = (phase, name, bad) => results.push({ phase, name, ok: bad.length === 0, bad });

gate(0, "사이트맵 주소가 실제 페이지로 있다", [...smIds].filter(id => !byId[id]));
gate(0, "사이트맵에 noindex 페이지가 없다", [...smIds].filter(id => byId[id] && byId[id].noindex));
gate(0, "노출 페이지의 canonical 이 자기 주소다", indexable.filter(p => p.canon !== `${DOMAIN}/${p.id === "index" ? "" : p.f}`).map(p => p.id));

const calcs = pages.filter(p => p.type === "계산기").map(p => p.id);
gate(2, "계산기 45개가 모두 noindex", calcs.filter(id => !byId[id].noindex).concat(calcs.length === 45 ? [] : [`계산기 수 ${calcs.length}`]));
gate(2, "계산기가 사이트맵에 없다", calcs.filter(id => smIds.has(id)));
gate(2, "노출 페이지에서 계산기로 가는 링크가 없다", indexable.flatMap(p => p.links.filter(l => calcs.includes(l)).map(l => `${p.id}→${l}`)).slice(0, 20));
gate(2, "RSS·llms.txt 에 계산기 주소가 없다", calcs.filter(id => rss.includes(`/${id}.html`) || llms.includes(`/${id}.html`)));

const manse = pages.filter(p => p.type === "월력");
const inKeep = id => { const ym = id.slice(6); return ym >= MANSE_KEEP.from && ym <= MANSE_KEEP.to; };
gate(3, `월력은 ${MANSE_KEEP.from}~${MANSE_KEEP.to} 만 노출`, manse.filter(p => inKeep(p.id) === p.noindex).map(p => p.id));
gate(3, "밖의 월력이 사이트맵에 없다", manse.filter(p => !inKeep(p.id) && smIds.has(p.id)).map(p => p.id));

gate(4, `음력 페이지 본문 ${LUNAR_MIN}자 이상`, byId.lunar && byId.lunar.chars >= LUNAR_MIN ? [] : [`lunar ${byId.lunar ? byId.lunar.chars : "없음"}자`]);

const cols = indexable.filter(p => p.type === "칼럼");
gate(5, `칼럼 ${COLUMN_MIN.count}편 이상`, cols.length >= COLUMN_MIN.count ? [] : [`${cols.length}편`]);
gate(5, `칼럼마다 ${COLUMN_MIN.chars}자 이상`, cols.filter(p => p.chars < COLUMN_MIN.chars).map(p => `${p.id}(${p.chars})`));
gate(5, "칼럼이 사이트맵에 있다", cols.filter(p => !smIds.has(p.id)).map(p => p.id));

console.log(`\n== 게이트 (강제: 공통${PHASE >= 2 ? " + 2~" + PHASE + "단계" : ""})`);
let fail = 0;
for (const r of results) {
  const enforced = r.phase === 0 || (r.phase >= 2 && r.phase <= PHASE);
  if (!r.ok && enforced) fail++;
  console.log(`${r.ok ? "통과" : enforced ? "실패" : "대기"} [${r.phase || "공통"}] ${r.name}${r.ok ? "" : " — " + r.bad.slice(0, 8).join(", ") + (r.bad.length > 8 ? ` 외 ${r.bad.length - 8}` : "")}`);
}

// ---- 라이브 표본 확인 (Cloudflare IP 고정: 이 PC DNS 캐시가 옛 Vercel IP 를 들고 있을 수 있다)
function get(url) {
  return new Promise((res, rej) => https.get(url, { lookup: (h, o, cb) => o && o.all ? cb(null, [{ address: "104.21.25.207", family: 4 }]) : cb(null, "104.21.25.207", 4) }, r => {
    let d = ""; r.on("data", c => d += c); r.on("end", () => res({ status: r.statusCode, server: r.headers.server, body: d }));
  }).on("error", rej));
}
async function live() {
  console.log("\n== 라이브 표본");
  const sm = await get(`${DOMAIN}/sitemap.xml`);
  const liveIds = new Set([...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(DOMAIN + "/", "").replace(/\.html$/, "") || "index"));
  console.log(`사이트맵 ${sm.status} ${sm.server} · 주소 ${liveIds.size}개 (로컬 ${smIds.size}개) · 로컬과 ${[...smIds].every(i => liveIds.has(i)) && liveIds.size === smIds.size ? "같음" : "다름"}`);
  for (const id of ["salary", "bmi", "manse-2020-05", "manse-2026-09", "lunar", "saju"].filter(i => byId[i])) {
    const r = await get(`${DOMAIN}/${id}.html`);
    const rb = (r.body.match(/<meta name="robots" content="([^"]+)"/i) || [])[1] || "(없음)";
    const ok = /noindex/.test(rb) === byId[id].noindex;
    console.log(`${ok ? "일치" : "불일치"} ${id} ${r.status} ${r.server} robots=${rb} (로컬 ${byId[id].noindex ? "noindex" : "노출"})`);
    if (!ok) fail++;
  }
}
(args.live ? live() : Promise.resolve()).then(() => {
  console.log(fail ? `\n실패 ${fail}건` : "\n강제 게이트 전부 통과");
  process.exit(fail ? 1 : 0);
});
