/* 동네보살 자체 방문 통계.
   POST /api/hit  페이지가 보내는 조회·이벤트 기록 (build_site.js 의 비콘, hub.html 의 track())
   POST /api/invite  궁합 초대 링크 만들기(사주 글자만), GET /api/invite?i=  받기 — 7일 보관
   GET  /admin    대시보드. ADMIN_PASS 비밀값을 정하면 비밀번호가 걸린다
   GET  /gunghap.html  ?i= 초대 링크만 미리보기 제목·설명을 '누가 궁합 보자고 보냈다'로 바꾼다(없으면 정적 자산 그대로)
   GET  /namematch.html  ?a=&b= 가 붙은 공유·초대 링크만 미리보기 제목·설명을 결과로 바꿔 돌려준다(없으면 정적 자산 그대로)
   GET  /star-*.html · /zodiac-*.html · /horoscope.html · /zodiacfortune.html  그날(한국 시각) 오늘의 운세 글을 #today-sv 에 끼운다
   GET  /tomorrow.html  다음 날(한국 시각) 파일의 내일 운세 묶음을 #tomorrow-sv 에 끼운다
   그 밖의 주소는 전부 정적 자산(site/)이다. wrangler.jsonc 의 run_worker_first 가 위 경로만 여기로 보낸다. */
import { ogName, ogInvite } from "./worker_og.js";
const PATH_RE = /^\/[a-z0-9-]{0,80}(\.html)?$/;
const EVENTS = new Set(["fortune_view", "tarot_read", "saju_print", "share_click", "image_save", "js_error", "invite_make", "invite_open", "tail_ask", "learn_practice", "learn_test", "share_visit", "person_save", "person_use", "wz_2", "wz_3", "wz_4", "wz_5", "wz_all", "saju_go", "sum_img", "topic_in", "chap_2", "chap_3", "chap_4", "chap_all", "goods_click"]);
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly/i;
const SELF = /(^|\.)dongnebosal\.com$/;
const kstDay = (off = 0) => new Date(Date.now() + 9 * 3600e3 - off * 86400e3).toISOString().slice(0, 10);

export default {
  async fetch(req, env) {
    const u = new URL(req.url), { pathname } = u;
    if (u.protocol === "http:") { u.protocol = "https:"; return Response.redirect(u.toString(), 301); }   // http 주소가 그대로 열려 중복 주소가 되던 것(2026-10-21)
    if (pathname === "/api/hit") return req.method === "POST" ? hit(req, env) : new Response(null, { status: 405 });
    if (pathname === "/api/invite") return req.method === "POST" ? inviteMake(req, env) : req.method === "GET" ? inviteGet(req, env) : new Response(null, { status: 405 });
    if (pathname === "/admin") return admin(req, env);
    if (pathname === "/namematch.html") return namematch(req, env);
    if (pathname === "/gunghap.html") return gunghapInvite(req, env);
    const tf = pathname.match(TODAY_RE);
    if (tf) return todayFortune(req, env, tf[1]);
    if (pathname === "/tomorrow.html") return todayFortune(req, env, "tomorrow", -1, "#tomorrow-sv");
    if (pathname === "/todayfortune.html") return todayFortune(req, env, "goodsToday", 0, "#goods-sv");   // 오늘 기운 물건 + 제목 날짜
    if (pathname === "/lunar.html") return lunarTitle(req, env);
    if (pathname === "/love.html") return todayFortune(req, env, "love", 0, "#love-sv");
    if (pathname === "/lucky.html") return todayFortune(req, env, "lucky", 0, "#lucky-sv");
    if (pathname === "/celeb.html") return todayFortune(req, env, "bday", 0, "#bday-sv");
    if (pathname === "/" || pathname === "/index.html") return todayFortune(req, env, "bdayHome", 0, "#home-bday");
    if (pathname === "/weekly.html") return todayFortune(req, env, "week", 0, "#week-sv");
    if (pathname === "/monthly.html") return todayFortune(req, env, "month", 0, "#month-sv");
    const ny = pathname.match(/^\/newyear-(\d{4})\.html$/);
    if (ny) return todayFortune(req, env, "zodiac-" + TTI_EN[(+ny[1] - 4) % 12], 0, "#today-sv", ny[1].slice(2));
    if (pathname === "/sitemap.xml") return sitemapToday(req, env);
    if (pathname === "/daily.html") return dailyHub(req, env);
    const dd = pathname.match(/^\/daily-(\d{4}-\d{2}-\d{2})\.html$/);
    if (dd) return dailyDated(req, env, dd[1]);
    return env.ASSETS.fetch(req);
  },
  // 방문자 구분값은 90일만 둔다 (개인정보처리방침과 맞춘다)
  async scheduled(_, env) {
    await env.DB.prepare("DELETE FROM visitors WHERE day < ?").bind(kstDay(90)).run();
    await env.DB.prepare("DELETE FROM invites WHERE day < ?").bind(kstDay(7)).run();
    try { await env.DB.prepare("DELETE FROM errors WHERE day < ?").bind(kstDay(30)).run(); } catch {}
    try { await indexNowDaily(env); } catch {}
  },
};

// 이름궁합 공유·초대 링크: 카톡 같은 앱은 링크를 열어 og:title·description 을 읽어 미리보기 카드를 만든다(스크립트는 돌리지 않는다).
// 그래서 서버에서 제목·설명만 결과로 바꾼다. 화면의 계산은 브라우저가 한다. 이름은 읽기만 하고 저장하지 않는다.
// 이름이 든 주소는 검색에 올리지 않는다(noindex). 정식 주소(canonical)는 그대로다.
async function namematch(req, env) {
  const res = await env.ASSETS.fetch(req);
  const q = new URL(req.url).searchParams, og = ogName(q.get("a") || "", q.get("b") || "");
  if (!og || !res.ok || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  const content = key => ({ element(e) { e.setAttribute("content", og[key]); } });
  return new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(og.title + " | 동네보살"); } })
    .on('meta[name="description"]', content("desc"))
    .on('meta[property="og:title"]', content("title"))
    .on('meta[property="og:description"]', content("desc"))
    .on("head", { element(e) { e.append('<meta name="robots" content="noindex,follow">', { html: true }); } })
    .transform(res);
}

// 궁합 초대 링크: 보낸 사람 이름으로 미리보기 글을 바꾼다. 초대가 없거나 지났으면 원래 페이지 그대로
async function gunghapInvite(req, env) {
  const res = await env.ASSETS.fetch(req), id = new URL(req.url).searchParams.get("i") || "";
  if (!/^[a-z0-9]{10}$/.test(id) || !res.ok || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  let og = null;
  try { const row = await env.DB.prepare("SELECT data FROM invites WHERE id = ? AND day >= ?").bind(id, kstDay(7)).first(); og = row ? ogInvite(JSON.parse(row.data)) : null; } catch {}
  if (!og) return res;
  const content = key => ({ element(e) { e.setAttribute("content", og[key]); } });
  return new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(og.title + " | 동네보살"); } })
    .on('meta[name="description"]', content("desc"))
    .on('meta[property="og:title"]', content("title"))
    .on('meta[property="og:description"]', content("desc"))
    .on("head", { element(e) { e.append('<meta name="robots" content="noindex,follow">', { html: true }); } })
    .transform(res);
}

// 오늘의 운세: 별자리·띠 운세는 버튼을 눌러야 화면에서 계산되어, 스크립트를 돌리지 않는 네이버 수집기는 날마다 같은 글만 본다.
// 빌드가 날짜별로 만든 today/YYYY-MM-DD.json 에서 그날 글을 골라 #today-sv 자리에 끼운다. 그날 파일이 없으면 정적 자산 그대로
const TODAY_RE = /^\/(star-[a-z]+|zodiac-[a-z]+|horoscope|zodiacfortune)\.html$/;
// /tomorrow.html 은 다음 날(off=-1) 파일의 tomorrow 묶음을 #tomorrow-sv 에 끼운다. 날짜가 다르니 캐시도 날짜별로 둔다
let todayCache = {};
// 음력 계산기는 제목 앞에 오늘 음력 날짜('오늘 음력 8월 29일 · ') — 날짜 파일의 lunar 값, 없으면 그대로
async function lunarTitle(req, env) {
  const res = await env.ASSETS.fetch(req), day = kstDay();
  if (!res.ok || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  if (!todayCache[day]) { const r = await env.ASSETS.fetch(new URL(`/today/${day}.json`, req.url)); if (r.ok) todayCache = { ...Object.fromEntries(Object.entries(todayCache).filter(([d]) => d >= kstDay())), [day]: await r.json() }; }
  const lun = todayCache[day] && todayCache[day].lunar;
  return lun ? new HTMLRewriter().on("title", { element(e) { e.prepend(`오늘 음력 ${lun} · `); } }).transform(res) : res;
}
// 년생별 2027 운세(newyear-YYYY)는 그 띠의 오늘 글을 받고 제목만 'OO년생 쥐띠 오늘의 운세'로 바꾼다
const TTI_EN = ["rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "goat", "monkey", "rooster", "dog", "pig"];
async function todayFortune(req, env, key, off = 0, sel = "#today-sv", yy = "") {
  const res = await env.ASSETS.fetch(req), day = kstDay(off);
  if (!res.ok || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  if (!todayCache[day]) {
    const r = await env.ASSETS.fetch(new URL(`/today/${day}.json`, req.url));
    if (r.ok) todayCache = { ...Object.fromEntries(Object.entries(todayCache).filter(([d]) => d >= kstDay())), [day]: await r.json() };
  }
  let html = todayCache[day] && todayCache[day][key];
  if (html && yy) html = html.replace(/오늘의 (\S+띠) 운세/, `${yy}년생 $1 오늘의 운세`);
  if (!html) return res;
  const rw = new HTMLRewriter().on(sel, { element(e) { e.setInnerContent(html, { html: true }); } });
  // 오늘 글을 끼운 허브 두 쪽은 제목 앞에 날짜를 붙인다('10월 9일 띠별 운세 …') — 날짜로 찾는 검색과 결과 화면의 신선도
  const [, m, d] = day.split("-").map(Number);
  if (key === "goodsToday" || key === "zodiacfortune" || key === "horoscope" || key === "love" || key === "lucky" || key === "tomorrow" || (!yy && /^(star|zodiac)-/.test(key))) rw.on("title", { element(e) { e.prepend(`${m}월 ${d}일 `); } });
  else if (key === "month") rw.on("title", { element(e) { e.prepend(`${m}월 운세 · `); } });   // '10월운세' 4천·이번달운세 3천
  else if (key === "week") {   // '11월 2일~8일 주간 운세' — 날짜 검색('11월 2일 띠별 운세')은 사이트 칸에 우리가 뜬다(2026-11-01 실측)
    const dt = new Date(day + "T00:00:00Z"), mon = new Date(dt - ((dt.getUTCDay() + 6) % 7) * 864e5), sun = new Date(+mon + 6 * 864e5);
    const a = `${mon.getUTCMonth() + 1}월 ${mon.getUTCDate()}일`, z = sun.getUTCMonth() === mon.getUTCMonth() ? `${sun.getUTCDate()}일` : `${sun.getUTCMonth() + 1}월 ${sun.getUTCDate()}일`;
    rw.on("title", { element(e) { e.prepend(`${a}~${z} `); } });
  }
  return rw.transform(res);
}

// 날짜별 운세(2026-11-09) — 네이버 '오늘의운세'·'띠별운세' 상위가 날짜 박힌 매일 새 기사였다. 틀(/daily.html)에 그날 글을 채워
// /daily-YYYY-MM-DD.html 로 내보낸다. 내일부터 지난 30일까지만 열고 나머지는 목록으로 보낸다(빌드가 지난 31일 치 파일을 만든다)
const DAILY_BACK = 30, WD_KO = "일월화수목금토", DOMAIN = "https://dongnebosal.com";
const STAR_KEYS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
const dailyDays = () => Array.from({ length: DAILY_BACK + 2 }, (_, i) => kstDay(i - 1));   // 내일, 오늘, 어제 … 30일 전
const dLabel = day => { const dt = new Date(day + "T00:00:00Z"); return `${dt.getUTCMonth() + 1}월 ${dt.getUTCDate()}일 ${WD_KO[dt.getUTCDay()]}요일`; };
async function dayJson(req, env, day) {
  if (todayCache[day]) return todayCache[day];
  const r = await env.ASSETS.fetch(new URL(`/today/${day}.json`, req.url));
  return r.ok ? r.json() : null;
}
function dailyLd(o) {
  return '<script type="application/ld+json">' + JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: o.title, description: o.desc,
    inLanguage: "ko", url: o.url, image: DOMAIN + "/img/og/zodiacfortune.jpg", datePublished: o.day + "T00:00:00+09:00", dateModified: o.day + "T00:00:00+09:00",
    author: { "@type": "Organization", name: "동네보살 편집팀", url: DOMAIN + "/about.html" }, publisher: { "@id": DOMAIN + "/#org", "@type": "Organization", name: "동네보살", url: DOMAIN + "/" } }) + "</script>" +
    '<script type="application/ld+json">' + JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: DOMAIN + "/" }, { "@type": "ListItem", position: 2, name: "날짜별 운세", item: DOMAIN + "/daily.html" },
      { "@type": "ListItem", position: 3, name: o.label, item: o.url }] }) + "</script>";
}
async function dailyDated(req, env, day) {
  const days = dailyDays();
  if (!days.includes(day)) return Response.redirect(DOMAIN + "/daily.html", 301);
  const [j, tpl] = await Promise.all([dayJson(req, env, day), env.ASSETS.fetch(new URL("/daily.html", req.url))]);
  if (!j) return Response.redirect(DOMAIN + "/daily.html", 301);
  if (!tpl.ok) return tpl;
  const label = dLabel(day), url = `${DOMAIN}/daily-${day}.html`, i = days.indexOf(day);
  const top = ((j.zodiacfortune || "").match(/점수가 가장 높은 띠는 ([^.<]+)입니다/) || [])[1];
  const title = `${label} 오늘의 운세 — 띠별 운세·별자리 운세 | 동네보살`;
  const desc = `${label} 12띠 운세와 12별자리 운세를 점수와 총운·재물·애정·조언으로 풀었습니다.${top ? ` 이날 띠 1등은 ${top}.` : ""} 일진과 달의 자리로 계산한 무료 운세입니다.`;
  const fix = h => (day === kstDay() ? h : h.replace(/<h2>오늘의 /g, "<h2>"));
  const nav = `<nav class="sibs" aria-label="날짜 이동" style="margin:4px 0 14px">${i < days.length - 1 ? `<a href="daily-${days[i + 1]}.html">← ${dLabel(days[i + 1])}</a>` : ""}<a href="daily.html">날짜 목록</a>${i > 0 ? `<a href="daily-${days[i - 1]}.html">${dLabel(days[i - 1])} →</a>` : ""}</nav>`;
  const body = nav + fix(j.zodiacfortune || "") + TTI_EN.map(k => fix(j["zodiac-" + k] || "")).join("") + fix(j.horoscope || "") + STAR_KEYS.map(k => fix(j["star-" + k] || "")).join("") + nav;
  const attr = (k, v) => ({ element(e) { e.setAttribute(k, v); } });
  return new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(title); } })
    .on('meta[name="description"]', attr("content", desc))
    .on('meta[property="og:title"]', attr("content", title))
    .on('meta[property="og:description"]', attr("content", desc))
    .on('meta[property="og:url"]', attr("content", url))
    .on('link[rel="canonical"]', attr("href", url))
    .on('script[type="application/ld+json"]', { element(e) { e.remove(); } })
    .on("head", { element(e) { e.append(dailyLd({ title, desc, url, day, label }), { html: true }); } })
    .on("h1", { element(e) { e.setInnerContent(`${label} 오늘의 운세`); } })
    .on("#daily-sv", { element(e) { e.setInnerContent(body, { html: true }); } })
    .transform(tpl);
}
// 목록 쪽: 오늘 띠별·별자리 요약 + 내일부터 지난 30일까지 날짜 링크(전문은 날짜 쪽에만 둬 같은 글이 두 주소에 겹치지 않게)
async function dailyHub(req, env) {
  const res = await env.ASSETS.fetch(req), day = kstDay();
  if (!res.ok || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  const j = await dayJson(req, env, day);
  const list = `<section class="guide"><h2>날짜를 골라 보세요</h2><ul>${dailyDays().map(d => `<li><a href="daily-${d}.html">${dLabel(d)} 오늘의 운세</a>${d === day ? " · <b>오늘</b>" : d === kstDay(-1) ? " · 내일" : ""}</li>`).join("")}</ul></section>`;
  const sum = j ? (j.zodiacfortune || "") + (j.horoscope || "") : "";
  const [, m, d] = day.split("-").map(Number);
  return new HTMLRewriter()
    .on("title", { element(e) { e.prepend(`${m}월 ${d}일 `); } })
    .on("#daily-sv", { element(e) { e.setInnerContent(`<p style="margin:4px 0 14px"><a href="daily-${day}.html"><b>${dLabel(day)} 운세 전체 보기 →</b></a></p>` + sum + list, { html: true }); } })
    .transform(res);
}

// 날마다 글이 바뀌는 쪽은 사이트맵 lastmod 를 그날(주간은 그 주 월요일, 이달은 1일)로 바꿔 내보낸다.
// 빌드 lastmod.json 은 배포 날짜에 멈춰 있어(2026-11-01 기준 띠별 10/21·내일 10/10) 수집기가 다시 올 근거가 없었다
const DAILY_RE = /^(|index\.html|daily\.html|zodiacfortune\.html|horoscope\.html|tomorrow\.html|todayfortune\.html|love\.html|lucky\.html|celeb\.html|lunar\.html|zodiac-[a-z]+\.html|star-[a-z]+\.html|newyear-\d{4}\.html)$/;
function dailyMod(p, day) {
  if (p === "weekly.html") { const d = new Date(day + "T00:00:00Z"); return new Date(d - ((d.getUTCDay() + 6) % 7) * 864e5).toISOString().slice(0, 10); }
  if (p === "monthly.html") return day.slice(0, 8) + "01";
  return DAILY_RE.test(p) ? day : null;
}
async function sitemapToday(req, env) {
  const res = await env.ASSETS.fetch(req);
  if (!res.ok) return res;
  const day = kstDay(), xml = (await res.text()).replace(/<loc>https:\/\/dongnebosal\.com\/([^<]*)<\/loc><lastmod>([^<]*)<\/lastmod>/g,
    (all, p, old) => { const d = dailyMod(p, day); return d && d > old ? all.replace(old, d) : all; })
    // 날짜별 운세 쪽(내일~지난 30일). lastmod 는 그 날짜(내일 쪽은 오늘)
    .replace("</urlset>", dailyDays().map(d => `<url><loc>${DOMAIN}/daily-${d}.html</loc><lastmod>${d > day ? day : d}</lastmod></url>`).join("\n") + "\n</urlset>");
  return new Response(xml, { headers: res.headers });
}
// 매일 03시(한국 시각, cron 0 18 UTC) 그날 바뀐 쪽만 IndexNow 로 알린다 — 공용과 네이버 직접(tools/indexnow.js 와 같은 두 곳)
const INDEXNOW_KEY = "9f3c7a1e4b8d2f60a5c1e7b93d4f8a2c";
async function indexNowDaily(env) {
  const day = kstDay(), xml = await (await env.ASSETS.fetch("https://dongnebosal.com/sitemap.xml")).text();
  const urlList = [...xml.matchAll(/<loc>(https:\/\/dongnebosal\.com\/([^<]*))<\/loc>/g)].filter(m => dailyMod(m[2], day) === day).map(m => m[1])
    .concat([`${DOMAIN}/daily-${day}.html`, `${DOMAIN}/daily-${kstDay(-1)}.html`]);   // 날짜별 운세 오늘·내일 쪽
  const body = JSON.stringify({ host: "dongnebosal.com", key: INDEXNOW_KEY, keyLocation: `https://dongnebosal.com/${INDEXNOW_KEY}.txt`, urlList });
  for (const h of ["api.indexnow.org", "searchadvisor.naver.com"])
    console.log("indexnow", h, urlList.length, (await fetch(`https://${h}/indexnow`, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body })).status);
}

async function hit(req, env) {
  const ok = new Response(null, { status: 204 });
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return ok;
  let b;
  try { b = JSON.parse((await req.text()).slice(0, 2000)); } catch { return ok; }
  const day = kstDay(), stmts = [];
  let jsErr = null;
  // ponytail: 요청마다 D1 에 최대 3건 쓴다. 무료 한도(하루 쓰기 10만)면 조회 3만 회 남짓까지. 넘으면 Analytics Engine 으로 옮긴다
  if (typeof b.e === "string") {
    if (!EVENTS.has(b.e)) return ok;
    stmts.push(env.DB.prepare("INSERT INTO events VALUES (?,?,1) ON CONFLICT(day,name) DO UPDATE SET n=n+1").bind(day, b.e));
    if (b.e === "js_error") jsErr = errRow(b);
  } else {
    const path = typeof b.p === "string" && PATH_RE.test(b.p) ? (b.p === "/" ? "/index.html" : b.p) : null;
    if (!path) return ok;
    stmts.push(env.DB.prepare("INSERT INTO views VALUES (?,?,1) ON CONFLICT(day,path) DO UPDATE SET n=n+1").bind(day, path));
    const ip = req.headers.get("cf-connecting-ip") || "";
    const raw = new TextEncoder().encode(`${day}|${ip}|${ua}|${env.STATS_SALT || ""}`);
    const h = [...new Uint8Array(await crypto.subtle.digest("SHA-256", raw))].slice(0, 8).map(x => x.toString(16).padStart(2, "0")).join("");
    stmts.push(env.DB.prepare("INSERT OR IGNORE INTO visitors VALUES (?,?,?)").bind(day, h, /Mobi|Android|iPhone/i.test(ua) ? 1 : 0));
    let host = "";
    try { host = typeof b.r === "string" && b.r ? new URL(b.r).hostname.slice(0, 80) : ""; } catch {}
    if (!SELF.test(host)) stmts.push(env.DB.prepare("INSERT INTO refs VALUES (?,?,1) ON CONFLICT(day,host) DO UPDATE SET n=n+1").bind(day, host || "(직접 방문)"));
  }
  await env.DB.batch(stmts);
  // 오류 내용은 별도 표에 넣는다 — 표가 없거나 실패해도 위의 조회·이벤트 기록에는 영향이 없다
  if (jsErr) { try { await env.DB.prepare("INSERT INTO errors VALUES (?,?,?,1) ON CONFLICT(day,path,msg) DO UPDATE SET n=n+1").bind(day, jsErr.path, jsErr.msg).run(); } catch {} }
  return ok;
}
// 스크립트 오류 한 건 → {path, msg}. 메시지는 120자까지, 숫자 4자리 이상(연도·날짜 조각)은 지우고, 파일 이름은 뒤에 붙인다
function errRow(b) {
  if (typeof b.m !== "string") return null;
  const msg = b.m.replace(/\d{4,}/g, "#").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 120);
  if (!msg) return null;
  const file = typeof b.f === "string" ? b.f.replace(/[^\w.\-]/g, "").slice(0, 40) : "";
  return { path: typeof b.p === "string" && PATH_RE.test(b.p) ? (b.p === "/" ? "/index.html" : b.p) : "", msg: file ? msg + " @" + file : msg };
}

// ---- 궁합 초대 링크
const JSONH = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
async function inviteMake(req, env) {
  let b;
  try { b = JSON.parse((await req.text()).slice(0, 500)); } catch { return new Response(null, { status: 400 }); }
  const p = b && b.p, ok = Array.isArray(p) && p.length === 6 && p.every((v, i) => Number.isInteger(v) && v >= 0 && v < (i % 2 ? 12 : 10));
  if (!ok || (b.g !== "m" && b.g !== "f")) return new Response(null, { status: 400 });
  const n = typeof b.n === "string" ? b.n.replace(/[<>&"'\u0000-\u001f]/g, "").trim().slice(0, 10) : "";
  const id = [...crypto.getRandomValues(new Uint8Array(10))].map(x => "abcdefghijkmnpqrstuvwxyz23456789"[x % 32]).join("");
  await env.DB.prepare("INSERT INTO invites VALUES (?,?,?)").bind(id, JSON.stringify({ p, g: b.g, n }), kstDay()).run();
  return new Response(JSON.stringify({ id }), { headers: JSONH });
}
async function inviteGet(req, env) {
  const id = new URL(req.url).searchParams.get("i") || "";
  if (!/^[a-z0-9]{10}$/.test(id)) return new Response(null, { status: 404 });
  const row = await env.DB.prepare("SELECT data FROM invites WHERE id = ? AND day >= ?").bind(id, kstDay(7)).first();
  return row ? new Response(row.data, { headers: JSONH }) : new Response(null, { status: 404, headers: JSONH });
}

// ---- 대시보드
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const PRIV = { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" };

async function passOk(req, pass) {
  const m = (req.headers.get("authorization") || "").match(/^Basic (.+)$/);
  if (!m) return false;
  let given = "";
  try { given = atob(m[1]).split(":").slice(1).join(":"); } catch { return false; }
  const a = new TextEncoder().encode(given), b = new TextEncoder().encode(pass);
  return a.length === b.length && crypto.subtle.timingSafeEqual(a, b);
}

async function admin(req, env) {
  // 비밀번호(ADMIN_PASS)를 정하지 않았으면 누구나 본다(사용자 요청 2026-09-27). 정하면 그때부터 잠긴다
  if (env.ADMIN_PASS && !(await passOk(req, env.ADMIN_PASS))) return new Response("로그인이 필요합니다.", { status: 401, headers: { ...PRIV, "www-authenticate": 'Basic realm="dongnebosal admin", charset="UTF-8"', "content-type": "text/plain; charset=utf-8" } });

  const days = Math.min(365, Math.max(1, +new URL(req.url).searchParams.get("days") || 30));
  const from = kstDay(days - 1), today = kstDay();
  const q = (sql, ...a) => env.DB.prepare(sql).bind(...a);
  const [dv, dp, pages, refs, evs, tot] = (await env.DB.batch([
    q("SELECT day, COUNT(*) v, SUM(mobile) m FROM visitors WHERE day >= ? GROUP BY day", from),
    q("SELECT day, SUM(n) n FROM views WHERE day >= ? GROUP BY day", from),
    q("SELECT path, SUM(n) n FROM views WHERE day >= ? GROUP BY path ORDER BY n DESC LIMIT 40", from),
    q("SELECT host, SUM(n) n FROM refs WHERE day >= ? GROUP BY host ORDER BY n DESC LIMIT 25", from),
    q("SELECT name, SUM(n) n FROM events WHERE day >= ? GROUP BY name ORDER BY n DESC", from),
    q("SELECT (SELECT COUNT(*) FROM visitors WHERE day = ?) tv, (SELECT COALESCE(SUM(n),0) FROM views WHERE day = ?) tp", today, today),
  ])).map(r => r.results);

  let errs = [];
  try { errs = (await q("SELECT path, msg, SUM(n) n FROM errors WHERE day >= ? GROUP BY path, msg ORDER BY n DESC LIMIT 20", from).all()).results; } catch {}
  const byDay = {};
  for (let i = days - 1; i >= 0; i--) byDay[kstDay(i)] = { v: 0, m: 0, p: 0 };
  for (const r of dv) if (byDay[r.day]) Object.assign(byDay[r.day], { v: r.v, m: r.m });
  for (const r of dp) if (byDay[r.day]) byDay[r.day].p = r.n;
  const rows = Object.entries(byDay);
  const sumV = rows.reduce((a, [, x]) => a + x.v, 0), sumP = rows.reduce((a, [, x]) => a + x.p, 0), sumM = rows.reduce((a, [, x]) => a + x.m, 0);
  const maxP = Math.max(1, ...rows.map(([, x]) => x.p));
  const EV_KO = { fortune_view: "운세 결과 보기", tarot_read: "타로 풀이", saju_print: "사주 인쇄", share_click: "공유 버튼", goods_click: "쿠팡 물건 링크 클릭", share_visit: "공유 링크로 들어옴", wz_2: "사주 입력 2단계(생일)까지", wz_3: "사주 입력 3단계(시각)까지", wz_4: "사주 입력 4단계(성별)까지", wz_5: "사주 입력 5단계(질문)까지", wz_all: "사주 '한 번에 입력' 누름", saju_go: "사주 보기 누름", sum_img: "한 장 요약 이미지 저장", chap_2: "사주 결과 2장 펼침", chap_3: "사주 결과 3장 펼침", chap_4: "사주 결과 4장 펼침", chap_all: "사주 결과 '한 번에 다 보기'", topic_in: "주제 입구(?q=)로 들어옴", person_save: "홈에서 생일 저장", person_use: "저장한 생일로 보기", image_save: "이미지 저장", js_error: "스크립트 오류" };
  const table = (head, list) => `<table><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr>${list.join("") || `<tr><td colspan="${head.length}" class="mu">아직 기록 없음</td></tr>`}</table>`;
  const kpi = (label, v, unit = "") => `<div class="k"><span>${label}</span><b>${v.toLocaleString("ko-KR")}${unit}</b></div>`;

  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>동네보살 통계</title>
<style>
:root{--bg:#f6f7f9;--fg:#15181d;--mu:#6b7280;--card:#fff;--line:#e5e7eb;--bar:#c8863a}
@media (prefers-color-scheme:dark){:root{--bg:#0e1116;--fg:#e8eaed;--mu:#9aa3ad;--card:#161a21;--line:#262c35;--bar:#e0a458}}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,"Malgun Gothic",sans-serif}
.w{max-width:960px;margin:0 auto;padding:20px 16px 60px}h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:28px 0 10px}
.mu{color:var(--mu)}.rng a{margin-right:10px;color:var(--mu)}.rng a.on{color:var(--fg);font-weight:700}
.ks{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:16px}
.k{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px}.k span{display:block;color:var(--mu);font-size:13px}.k b{font-size:22px}
.box{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:6px 12px;overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:7px 6px;border-bottom:1px solid var(--line);white-space:nowrap}th{color:var(--mu);font-weight:600}
td.n,th.n{text-align:right}.bar{height:8px;background:var(--bar);border-radius:4px;min-width:1px}
</style></head><body><div class="w">
<h1>동네보살 통계</h1><div class="mu">한국 시간 기준 · ${esc(from)} ~ ${esc(today)} · 검색봇 제외 · 방문자는 같은 날 같은 기기를 한 명으로 셉니다</div>
<div class="rng" style="margin-top:8px">${[7, 30, 90, 365].map(d => `<a href="?days=${d}"${d === days ? ' class="on"' : ""}>${d}일</a>`).join("")}</div>
<div class="ks">${kpi("오늘 방문자", tot[0].tv)}${kpi("오늘 조회수", tot[0].tp)}${kpi(`${days}일 방문자(일별 합)`, sumV)}${kpi(`${days}일 조회수`, sumP)}${kpi("모바일 비율", sumV ? Math.round(100 * sumM / sumV) : 0, "%")}</div>
<h2>일별 추이</h2><div class="box">${table(["날짜", "방문자", "조회수", ""], rows.slice().reverse().map(([d, x]) => `<tr><td>${esc(d)}</td><td class="n">${x.v}</td><td class="n">${x.p}</td><td style="width:45%"><div class="bar" style="width:${(100 * x.p / maxP).toFixed(1)}%"></div></td></tr>`))}</div>
<h2>많이 본 페이지</h2><div class="box">${table(["페이지", "조회수"], pages.map(r => `<tr><td><a href="${esc(r.path)}" style="color:inherit">${esc(r.path)}</a></td><td class="n">${r.n}</td></tr>`))}</div>
<h2>들어온 곳</h2><div class="box">${table(["사이트", "방문"], refs.map(r => `<tr><td>${esc(r.host)}</td><td class="n">${r.n}</td></tr>`))}</div>
<h2>도구 사용</h2><div class="box">${table(["행동", "횟수"], evs.map(r => `<tr><td>${esc(EV_KO[r.name] || r.name)}</td><td class="n">${r.n}</td></tr>`))}</div>
<h2>스크립트 오류 내용</h2><div class="box">${table(["페이지", "오류", "횟수"], errs.map(r => `<tr><td>${esc(r.path || "-")}</td><td style="white-space:normal">${esc(r.msg)}</td><td class="n">${r.n}</td></tr>`))}</div><p class="mu">오류가 났을 때의 메시지(120자까지, 숫자 4자리 이상은 지움)와 페이지 주소만 30일 동안 둡니다.</p>
<p class="mu" style="margin-top:24px">기록은 이 대시보드를 만든 날부터 쌓입니다. 그 이전 방문은 구글 애널리틱스(GA4)에 있습니다.</p>
</div></body></html>`;
  return new Response(html, { headers: { ...PRIV, "content-type": "text/html; charset=utf-8" } });
}
