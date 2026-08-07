/* hub.html(단일 SPA) → 멀티페이지 정적 사이트(site/) 생성.
   각 도구 = 독립 HTML(고유 title/description/h1/본문) + 공유 style.css/app.js + 내부링크 + sitemap.
   실행: node build_site.js   결과: site/  (그대로 Vercel/Netlify에 배포) */
const fs = require("fs"), path = require("path");
const DIR = __dirname, OUT = path.join(DIR, "site");
fs.mkdirSync(OUT, { recursive: true });

const DOMAIN = "https://gyesangi.vercel.app"; // 배포 도메인
const src = fs.readFileSync(path.join(DIR, "hub.html"), "utf8");

// --- 원본에서 CSS / 헬퍼 / TOOLS 추출 (재작성 없이 재사용) ---
const css = src.match(/<style>([\s\S]*?)<\/style>/)[1].trim();
const inner = src.match(/<script>([\s\S]*?)<\/script>/)[1];
const helpers = inner.slice(inner.indexOf("var num="), inner.indexOf("var TOOLS="));
const tStart = inner.indexOf("var TOOLS=");
const toolsArr = inner.slice(tStart, inner.indexOf("\n  ];", tStart) + "\n  ];".length);

// 도구 메타 파싱
const CATS = ["급여·노동","금융","부동산·세금","생활","변환·기타","재미"];
const meta = [];
const re = /\{id:"([^"]+)",cat:"([^"]+)",icon:"[^"]*",name:"([^"]+)",desc:"([^"]+)"/g;
let m; while ((m = re.exec(toolsArr))) meta.push({ id:m[1], cat:m[2], name:m[3], desc:m[4] });

// 페이지별 고유 소개문 (SEO 본문)
const intro = {
salary:"연봉이나 월급의 세전 금액을 입력하면 국민연금·건강보험·장기요양·고용보험 등 4대보험과 소득세를 제외한 월 실수령액을 바로 확인합니다. 2026년 최신 요율 기준입니다.",
severance:"입사일과 퇴사일, 평균임금을 입력하면 근로기준법에 따른 예상 퇴직금을 계산합니다. 계속근로 1년 이상부터 지급 대상입니다.",
annual:"미사용 연차 일수와 통상임금으로 받을 수 있는 연차수당을 계산합니다. 시간당 통상임금 × 8시간 × 미사용일수로 산정됩니다.",
hourly:"시급과 주 근로시간을 입력해 예상 월급과 연봉을 환산합니다. 2026년 최저시급 10,320원 기준 주휴수당도 반영할 수 있습니다.",
freelance:"프리랜서 계약금액에서 3.3%(소득세 3%+지방소득세 0.3%)를 원천징수한 실수령액을 계산합니다. 5월 종합소득세 신고 시 환급이 발생할 수 있습니다.",
loan:"대출 원금·이자율·기간을 입력하면 원리금균등 방식의 월 상환액과 총 이자를 계산합니다.",
savings:"매달 납입하는 적금의 만기 수령액을 이자소득세 15.4%를 반영해 계산합니다.",
deposit:"목돈을 예치하는 예금의 만기 수령액을 월복리와 이자소득세 기준으로 계산합니다.",
loanequal:"원금균등 상환 방식의 첫 달·마지막 달 상환액과 총 이자를 계산합니다. 매달 원금은 같고 이자는 줄어듭니다.",
dsr:"연 소득 대비 원리금 상환 비율(DSR)을 계산합니다. 은행권은 대개 40% 이내로 규제합니다.",
prepay:"대출을 만기 전에 갚을 때 발생하는 중도상환수수료를 잔여기간 기준으로 계산합니다.",
compound:"원금과 연이율, 기간을 입력하면 복리로 불어난 미래 금액과 수익을 계산합니다.",
ltv:"담보 가격과 LTV 비율로 최대 대출 한도를 계산합니다. 실제 한도는 규제와 소득에 따라 달라집니다.",
vat:"공급가액 또는 합계금액을 기준으로 부가가치세(10%)를 계산합니다.",
acqtax:"주택 취득가액을 입력하면 유상취득 기준 취득세율과 세액을 계산합니다.",
brokerfee:"매매 또는 전월세 거래금액에 대한 부동산 중개보수 상한을 계산합니다.",
pyeong:"평과 제곱미터(㎡)를 서로 변환합니다. 1평은 약 3.3058㎡입니다.",
jeonse:"전세 보증금과 전환율로 환산 월세를 계산합니다.",
age:"생년월일을 입력하면 만 나이와 태어난 지 며칠인지 계산합니다.",
dday:"두 날짜 사이의 남은 일수 또는 지난 일수(D-day)를 계산합니다.",
datecalc:"기준일에서 일정 일수를 더하거나 뺀 날짜와 요일을 계산합니다.",
worktime:"출근·퇴근 시각과 휴게시간으로 실 근무시간을 계산합니다.",
duedate:"마지막 생리 시작일을 기준으로 네겔레 법칙(+280일)에 따른 출산 예정일을 추정합니다. 병원 확인이 필요합니다.",
smoke:"하루 흡연량과 담뱃값으로 월·연·10년 흡연 비용을 계산합니다.",
charcount:"텍스트의 공백 포함/제외 글자수, 단어 수, 바이트, 줄 수를 세어줍니다. 자기소개서·블로그 글자수 확인에 유용합니다.",
bmi:"키와 몸무게로 체질량지수(BMI)와 표준체중을 계산합니다.",
discount:"정가와 할인율로 할인가와 할인 금액을 계산합니다.",
percent:"A는 B의 몇 %인지, B의 A%는 얼마인지, 증감율은 몇 %인지 계산합니다.",
unit:"길이·무게·온도 단위를 서로 변환합니다.",
password:"길이와 문자 종류를 선택해 안전한 랜덤 비밀번호를 생성합니다.",
weeklyholiday:"주 근로시간과 시급으로 주휴수당을 계산합니다. 주 15시간 이상 개근 시 지급됩니다.",
insurance4:"월 급여 기준 국민연금·건강보험·장기요양·고용보험 등 4대보험 근로자 부담액을 계산합니다.",
lotto:"1부터 45까지 중복 없는 로또 번호 6개를 무작위로 생성합니다.",
draw:"입력한 후보 중에서 무작위로 당첨자를 뽑거나 순서를 정합니다.",
};

const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

// 전체 도구 내부링크 네비 (모든 페이지에 삽입 → SEO 링크)
function siteNav(currentId){
  return '<nav class="sitenav">'+CATS.map(function(c){
    var items=meta.filter(function(t){return t.cat===c;});
    return '<h2>'+c+'</h2>'+items.map(function(t){
      return t.id===currentId ? '<span class="cur">'+t.name+'</span>' : '<a href="'+t.id+'.html">'+t.name+'</a>';
    }).join("");
  }).join("")+'</nav>';
}

function toolPage(t){
  const title = t.name+" — 무료 온라인 계산기 | 모아계산기";
  const desc = (intro[t.id]||t.desc).slice(0,155);
  const url = DOMAIN+"/"+t.id+".html";
  const ld = {"@context":"https://schema.org","@type":"WebApplication",name:t.name,description:desc,
    applicationCategory:"FinanceApplication",operatingSystem:"All",url:url,
    offers:{"@type":"Offer",price:"0",priceCurrency:"KRW"}};
  return `<!doctype html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
<link rel="stylesheet" href="style.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head><body><div class="wrap">
<a class="back" href="index.html">← 전체 계산기</a>
<h1 class="th">${t.name}</h1>
<div class="tl">${t.desc}</div>
<div class="card tool" id="tool"></div>
<p class="intro">${esc(intro[t.id]||t.desc)}</p>
<div class="ad">AD · 애드센스 / 쿠팡 배너 자리</div>
${siteNav(t.id)}
<div class="foot">© 2026 모아계산기 · 모든 계산은 참고용입니다</div>
</div>
<script src="app.js"></script>
<script>mountTool("${t.id}","tool");</script>
</body></html>`;
}

function indexPage(){
  const rows = CATS.map(function(c){
    var items=meta.filter(function(t){return t.cat===c;});
    return '<section class="grp"><div class="cat"><span>'+c+'</span></div>'+items.map(function(t){
      return '<a class="idxrow" href="'+t.id+'.html"><span class="ix-n">'+t.name+'</span><span class="ix-d">'+t.desc+'</span><span class="ix-a">→</span></a>';
    }).join("")+'</section>';
  }).join("");
  const desc="실수령액·퇴직금·대출·부가세·글자수 등 자주 쓰는 계산기 "+meta.length+"개를 한 곳에. 2026년 기준, 무료.";
  return `<!doctype html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>모아계산기 — ${meta.length}가지 무료 계산기 모음 (2026)</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${DOMAIN}/">
<meta property="og:title" content="모아계산기 — 무료 계산기 모음">
<meta property="og:description" content="${esc(desc)}">
<link rel="stylesheet" href="style.css">
</head><body><div class="wrap">
<header class="masthead"><div><div class="brand">모아계산기</div><div class="mh-sub">필요한 계산, 한 장에서 끝냅니다</div></div>
<div class="meta">2026 KR<br>${meta.length} TOOLS</div></header>
${rows}
<div class="ad">AD · 애드센스 / 쿠팡 배너 자리</div>
<div class="foot">© 2026 모아계산기 · 모든 계산은 참고용입니다</div>
</div></body></html>`;
}

// app.js (공유 로직): 헬퍼 + TOOLS + mountTool
const appJs = `(function(){\n${helpers}\n${toolsArr}\n`+
  `window.mountTool=function(id,elId){var t=TOOLS.filter(function(x){return x.id===id;})[0];if(t)t.render(document.getElementById(elId));};\n})();`;

// 사이트맵 + robots
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
  `<url><loc>${DOMAIN}/</loc></url>\n`+meta.map(t=>`<url><loc>${DOMAIN}/${t.id}.html</loc></url>`).join("\n")+`\n</urlset>`;
const robots = `User-agent: *\nAllow: /\nSitemap: ${DOMAIN}/sitemap.xml`;

// CSS + 페이지 전용 추가 스타일
const extraCss = `\n.intro{font-size:13.5px;color:var(--muted);line-height:1.8;margin:20px 2px 0;}`+
  `\n.sitenav{margin-top:36px;border-top:1px solid var(--line);padding-top:18px;}`+
  `\n.sitenav h2{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-ink);margin:16px 0 7px;font-weight:700;}`+
  `\n.sitenav a{display:inline-block;color:var(--muted);text-decoration:none;font-size:13px;margin:0 14px 7px 0;}`+
  `\n.sitenav a:hover{color:var(--accent);}`+
  `\n.sitenav .cur{display:inline-block;color:var(--ink);font-weight:700;font-size:13px;margin:0 14px 7px 0;}`;

// 쓰기
fs.writeFileSync(path.join(OUT,"style.css"), css+extraCss);
fs.writeFileSync(path.join(OUT,"app.js"), appJs);
fs.writeFileSync(path.join(OUT,"index.html"), indexPage());
meta.forEach(t=>fs.writeFileSync(path.join(OUT,t.id+".html"), toolPage(t)));
fs.writeFileSync(path.join(OUT,"sitemap.xml"), sitemap);
fs.writeFileSync(path.join(OUT,"robots.txt"), robots);

console.log("✅ 생성 완료:", meta.length, "개 도구 페이지 + index + sitemap + robots");
console.log("   → site/ 폴더. DOMAIN 상수를 실제 도메인으로 바꾸고 재실행 후 배포.");
