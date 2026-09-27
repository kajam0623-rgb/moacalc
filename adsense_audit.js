/* 애드센스 "가치가 별로 없는 콘텐츠" 대응 하네스.
   빌드 결과(site/)를 읽어 단계별 게이트를 검사한다. 빌드는 하지 않는다.

   node adsense_audit.js                 현황 보고 + 공통 게이트
   node adsense_audit.js --phase=3       공통 + 2~3단계 게이트까지 강제 (실패하면 종료 코드 1)
   node adsense_audit.js --baseline      현황을 adsense_baseline.json 에 저장 (작업 전 한 번)
   node adsense_audit.js --live          라이브 사이트에서 표본 페이지의 robots 메타와 사이트맵을 확인

   단계: 2 계산기 검색 제외 / 3 월력 줄이기 / 4 음력 페이지 보강 / 5 칼럼 추가 / 6 일주 60 차별화 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const SITE = path.join(__dirname, "site");
const DOMAIN = "https://dongnebosal.com";
// 3단계: 이 기간의 월력만 검색에 남긴다. 나머지는 noindex + 사이트맵 제외
const MANSE_KEEP = { from: "2025-01", to: "2027-12" };
const LUNAR_MIN = 1200;   // 4단계: 음력 페이지 정적 본문 최소 글자(공백 제외)
const THIN_MIN = 800;     // 이보다 얇은 검색 노출 페이지는 목록으로 보고한다
const COLUMN_MIN = { count: 6, chars: 1500 };
// 5단계. 개수보다 편마다 고유 표·구조가 우선이라 6편(2026-09 영상 검토 후 10→6)
const UNIQ = { k: 10, ilju: 50 }; // 6단계: 노출 페이지 전체에서 이 페이지에만 있는 10자 조각 비율(%). 2026-09 측정 일주 12% · 별자리 74% · 타로 89%

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
  return { index: "홈", "404": "404", about: "소개", privacy: "약관", terms: "약관", iljin: "일진", manse: "만세력안내", column: "칼럼목록" }[id] || "기타";
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
  return { f, id, type: typeOf(id), noindex: /noindex/i.test(robots), canon, chars: visible(html).length, body: visible(html.replace(/<div class="sibs">[\s\S]*?<\/div>/g, "")), links, navLinks: [...navHtml.matchAll(/href="([a-z0-9-]+)\.html"/g)].map(m => m[1]) };
});
const byId = Object.fromEntries(pages.map(p => [p.id, p]));
const sitemap = fs.readFileSync(path.join(SITE, "sitemap.xml"), "utf8");
const smIds = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(DOMAIN + "/", "").replace(/\.html$/, "") || "index"));
const rss = fs.readFileSync(path.join(SITE, "rss.xml"), "utf8");
const llms = fs.existsSync(path.join(SITE, "llms.txt")) ? fs.readFileSync(path.join(SITE, "llms.txt"), "utf8") : "";
const indexable = pages.filter(p => !p.noindex && p.id !== "404");
// 고유율: 노출 페이지들의 K자 조각 가운데 이 페이지에서만 나오는 조각의 비율. 이름만 바꿔 끼운 템플릿 문장은 여기서 걸린다
const shCount = new Map();
for (const p of indexable) { const seen = new Set(); for (let i = 0; i + UNIQ.k <= p.body.length; i++) { const s = p.body.slice(i, i + UNIQ.k); if (!seen.has(s)) { seen.add(s); shCount.set(s, (shCount.get(s) || 0) + 1); } } }
for (const p of indexable) { let n = 0, u = 0; for (let i = 0; i + UNIQ.k <= p.body.length; i++) { n++; if (shCount.get(p.body.slice(i, i + UNIQ.k)) === 1) u++; } p.uniq = n ? Math.round(100 * u / n) : 0; }

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
const uAvg = {}; for (const p of indexable) (uAvg[p.type] = uAvg[p.type] || []).push(p.uniq);
console.log("고유율(평균·최소) " + Object.entries(uAvg).filter(([, v]) => v.length > 1).map(([k, v]) => `${k} ${Math.round(v.reduce((a, b) => a + b, 0) / v.length)}·${Math.min(...v)}%`).join(" · "));
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
gate(0, "RSS·llms.txt 에 noindex 페이지 주소가 없다", pages.filter(p => p.noindex && (rss.includes(`/${p.f}<`) || rss.includes(`/${p.f}"`) || llms.includes(`/${p.f})`))).map(p => p.id));

// 계산기는 처음엔 noindex 로 숨겼다가(7bf1139) 사이트에서 아예 뺐다. 페이지가 하나라도 생기면 실패
const calcs = Object.keys(TOOL_CAT).filter(id => typeOf(id) === "계산기");   // hub.html 에 남은 계산기 전부
gate(2, "계산기 페이지가 사이트에 없다", calcs.filter(id => byId[id]).concat(calcs.length >= 40 ? [] : [`hub 계산기 ${calcs.length}개 — 분류 확인`]));
gate(2, "계산기가 사이트맵에 없다", calcs.filter(id => smIds.has(id)));
gate(2, "노출 페이지에서 계산기로 가는 링크가 없다", indexable.flatMap(p => p.links.filter(l => calcs.includes(l)).map(l => `${p.id}→${l}`)).slice(0, 20));
gate(2, "RSS·llms.txt 에 계산기 주소가 없다", calcs.filter(id => rss.includes(`/${id}.html`) || llms.includes(`/${id}.html`)));

const manse = pages.filter(p => p.type === "월력");
const inKeep = id => { const ym = id.slice(6); return ym >= MANSE_KEEP.from && ym <= MANSE_KEEP.to; };
gate(3, `월력은 ${MANSE_KEEP.from}~${MANSE_KEEP.to} 만 노출`, manse.filter(p => inKeep(p.id) === p.noindex).map(p => p.id));
gate(3, "밖의 월력이 사이트맵에 없다", manse.filter(p => !inKeep(p.id) && smIds.has(p.id)).map(p => p.id));
const iljin60 = pages.filter(p => /^iljin-/.test(p.id));
gate(3, "일진 60장은 noindex·사이트맵 제외, 오늘 일진만 노출", iljin60.filter(p => !p.noindex || smIds.has(p.id)).map(p => p.id)
  .concat(iljin60.length === 60 ? [] : [`일진 ${iljin60.length}장`]).concat(byId.iljin && !byId.iljin.noindex && smIds.has("iljin") ? [] : ["iljin.html"]));

gate(4, `음력 페이지 본문 ${LUNAR_MIN}자 이상`, byId.lunar && byId.lunar.chars >= LUNAR_MIN ? [] : [`lunar ${byId.lunar ? byId.lunar.chars : "없음"}자`]);

gate(5, `얇은 노출 페이지(<${THIN_MIN}자)가 없다`, thin.map(p => `${p.id}(${p.chars})`));
const cols = indexable.filter(p => p.type === "칼럼");
gate(5, `칼럼 ${COLUMN_MIN.count}편 이상`, cols.length >= COLUMN_MIN.count ? [] : [`${cols.length}편`]);
gate(5, `칼럼마다 ${COLUMN_MIN.chars}자 이상`, cols.filter(p => p.chars < COLUMN_MIN.chars).map(p => `${p.id}(${p.chars})`));
gate(5, "칼럼이 사이트맵에 있다", cols.filter(p => !smIds.has(p.id)).map(p => p.id));

const ilju = indexable.filter(p => p.type === "일주");
gate(6, `일주 60편 모두 고유율 ${UNIQ.ilju}% 이상`, ilju.filter(p => p.uniq < UNIQ.ilju).sort((a, b) => a.uniq - b.uniq).map(p => `${p.id}(${p.uniq}%)`).concat(ilju.length === 60 ? [] : [`일주 ${ilju.length}편`]));

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
    let d = ""; r.on("data", c => d += c); r.on("end", () => res({ status: r.statusCode, server: r.headers.server, age: r.headers.age, cache: r.headers["cf-cache-status"], body: d }));
  }).on("error", rej));
}
async function live() {
  console.log("\n== 라이브 표본");
  const sm = await get(`${DOMAIN}/sitemap.xml`);
  const liveIds = new Set([...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(DOMAIN + "/", "").replace(/\.html$/, "") || "index"));
  const same = [...smIds].every(i => liveIds.has(i)) && liveIds.size === smIds.size;
  console.log(`${same ? "일치" : "불일치"} 사이트맵 ${sm.status} ${sm.server} · 주소 ${liveIds.size}개 (로컬 ${smIds.size}개) · age=${sm.age ?? "-"} cache=${sm.cache ?? "-"}`);
  if (!same) fail++;
  for (const id of ["salary", "bmi"]) { // 계산기는 사이트에서 내렸다 — 404 여야 한다
    const r = await get(`${DOMAIN}/${id}.html`);
    console.log(`${r.status === 404 ? "일치" : "불일치"} ${id} ${r.status} (계산기 → 404 기대)`);
    if (r.status !== 404) fail++;
  }
  for (const id of ["manse-2020-05", "manse-2026-09", "lunar", "saju"].filter(i => byId[i])) {
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
