/* 동네보살 자체 방문 통계.
   POST /api/hit  페이지가 보내는 조회·이벤트 기록 (build_site.js 의 비콘, hub.html 의 track())
   POST /api/invite  궁합 초대 링크 만들기(사주 글자만), GET /api/invite?i=  받기 — 7일 보관
   GET  /admin    대시보드. ADMIN_PASS 비밀값을 정하면 비밀번호가 걸린다
   그 밖의 주소는 전부 정적 자산(site/)이다. wrangler.jsonc 의 run_worker_first 가 위 두 경로만 여기로 보낸다. */
const PATH_RE = /^\/[a-z0-9-]{0,80}(\.html)?$/;
const EVENTS = new Set(["fortune_view", "tarot_read", "saju_print", "share_click", "image_save", "js_error", "invite_make", "invite_open", "tail_ask", "learn_practice", "learn_test", "share_visit"]);
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly/i;
const SELF = /(^|\.)dongnebosal\.com$/;
const kstDay = (off = 0) => new Date(Date.now() + 9 * 3600e3 - off * 86400e3).toISOString().slice(0, 10);

export default {
  async fetch(req, env) {
    const { pathname } = new URL(req.url);
    if (pathname === "/api/hit") return req.method === "POST" ? hit(req, env) : new Response(null, { status: 405 });
    if (pathname === "/api/invite") return req.method === "POST" ? inviteMake(req, env) : req.method === "GET" ? inviteGet(req, env) : new Response(null, { status: 405 });
    if (pathname === "/admin") return admin(req, env);
    return env.ASSETS.fetch(req);
  },
  // 방문자 구분값은 90일만 둔다 (개인정보처리방침과 맞춘다)
  async scheduled(_, env) {
    await env.DB.prepare("DELETE FROM visitors WHERE day < ?").bind(kstDay(90)).run();
    await env.DB.prepare("DELETE FROM invites WHERE day < ?").bind(kstDay(7)).run();
    try { await env.DB.prepare("DELETE FROM errors WHERE day < ?").bind(kstDay(30)).run(); } catch {}
  },
};

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
  const EV_KO = { fortune_view: "운세 결과 보기", tarot_read: "타로 풀이", saju_print: "사주 인쇄", share_click: "공유 버튼", share_visit: "공유 링크로 들어옴", image_save: "이미지 저장", js_error: "스크립트 오류" };
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
