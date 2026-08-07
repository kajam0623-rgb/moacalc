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
const CATS = ["급여·노동","금융","부동산·세금","생활","변환·기타","재미·운세"];
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
ladder:"참가자와 결과를 입력하면 사다리타기로 공평하게 짝을 정해줍니다. 청소 당번, 내기, 순서 정하기에 좋습니다.",
anniversary:"사귄 날 등 시작일을 기준으로 오늘까지 며칠째인지, 100일·200일·1주년 등 기념일 날짜를 계산합니다.",
fire:"연 지출, 현재 자산, 연 저축액, 수익률로 경제적 자유(FIRE)까지 걸리는 기간을 계산합니다. 목표는 연 지출의 25배입니다.",
lottoodds:"구매 게임 수를 넣으면 로또 1등 당첨 확률과 기대값을 보여줍니다.",
zodiac:"생년월일로 띠와 별자리, 세는 나이를 확인합니다.",
};

const guide = {
salary:["실수령액 = 세전 급여 − (4대보험 + 소득세 + 지방소득세).","비과세 항목(식대 월 20만원 등)은 4대보험·소득세 계산에서 제외됩니다.","부양가족이 많을수록 소득세가 줄어 실수령액이 늘어납니다."],
severance:["퇴직금 = 1일 평균임금 × 30 × (재직일수 ÷ 365).","평균임금은 퇴직 전 3개월 임금총액을 그 기간 일수로 나눈 값입니다.","계속근로 1년 미만은 법정 지급 대상이 아닙니다."],
annual:["연차수당 = 시간당 통상임금 × 8시간 × 미사용 연차일수.","시간당 통상임금은 보통 월 통상임금 ÷ 209로 계산합니다."],
hourly:["2026년 최저시급은 10,320원, 주 40시간 기준 월 2,156,880원입니다.","주 15시간 이상 근무 시 주휴수당이 더해집니다."],
freelance:["3.3% = 소득세 3% + 지방소득세 0.3%.","5월 종합소득세 신고 때 실제 세금이 정산되어 대부분 일부를 환급받습니다."],
weeklyholiday:["주 15시간 이상 개근하면 하루치 유급휴일(주휴)이 발생합니다.","주휴수당 = (주 근로시간 ÷ 40, 최대 1) × 8 × 시급."],
insurance4:["국민연금 4.75%, 건강보험 3.595%, 장기요양(건보료의 13.14%), 고용보험 0.9%.","사업주도 대부분 같은 금액을 부담하며 고용·산재는 더 냅니다."],
loan:["원리금균등은 매달 갚는 금액이 같아 계획이 쉽습니다.","금리가 같아도 상환기간이 길수록 총 이자는 늘어납니다."],
loanequal:["원금균등은 매달 원금이 같고 이자는 줄어 상환액이 점점 감소합니다.","총 이자는 원리금균등보다 대체로 적습니다."],
dsr:["DSR = 연 원리금상환액 ÷ 연소득 × 100.","은행권은 보통 DSR 40% 이내에서만 대출을 내줍니다."],
deposit:["예금은 목돈을 한 번에 예치하는 상품입니다.","이자에는 15.4%의 이자소득세가 원천징수됩니다."],
compound:["복리는 이자에 다시 이자가 붙어 시간이 갈수록 가속됩니다.","미래가치 = 원금 × (1 + 이율)^기간."],
vat:["부가가치세율은 10%입니다.","합계금액 기준이면 1.1로 나눠 공급가액을 구합니다."],
acqtax:["6억 이하 1%, 6~9억 1~3% 구간, 9억 초과 3%(1주택 기준).","지방교육세·농어촌특별세가 별도로 소액 부과됩니다."],
brokerfee:["거래금액 구간별 법정 상한요율 내에서 협의합니다.","매매와 임대차의 요율표가 다릅니다."],
charcount:["공백 포함/제외 글자수와 바이트 수를 함께 보여줍니다.","자기소개서·리포트 글자 제한 확인에 쓰입니다."],
};

const faq = {
salary:[["실수령액이 왜 사람마다 다른가요?","부양가족 수, 비과세 항목, 급여 수준에 따라 소득세와 4대보험이 달라지기 때문입니다."],["2026년 4대보험 요율은 얼마인가요?","국민연금 4.75%, 건강보험 3.595%, 장기요양은 건강보험료의 13.14%, 고용보험 0.9%입니다(근로자 부담)."]],
severance:[["퇴직금은 언제부터 받나요?","계속 근로기간이 1년 이상이면 지급 대상입니다."],["세금이 떼이나요?","퇴직소득세가 별도로 부과되며 근속연수가 길수록 세부담이 줄어듭니다."]],
annual:[["미사용 연차는 어떻게 되나요?","사용하지 못한 연차는 연차수당으로 보상받을 수 있습니다."],["통상임금이 뭔가요?","정기적·일률적으로 지급되는 임금으로, 시간당 통상임금이 수당 계산의 기준입니다."]],
hourly:[["주휴수당은 언제 붙나요?","주 15시간 이상 근무하고 개근하면 발생합니다."],["2026년 최저임금은 얼마인가요?","시급 10,320원, 주 40시간 기준 월 2,156,880원입니다."]],
freelance:[["3.3%는 무슨 세금인가요?","소득세 3%와 지방소득세 0.3%를 미리 떼는 원천징수입니다."],["환급받을 수 있나요?","네, 5월 종합소득세 신고 때 정산해 대부분 일부를 환급받습니다."]],
weeklyholiday:[["주휴수당은 누구나 받나요?","주 15시간 이상 근무하고 소정근로일을 개근한 근로자가 대상입니다."],["단시간 알바도 받나요?","주 15시간 이상이면 근무시간에 비례해 받습니다."]],
insurance4:[["사업주도 같이 내나요?","국민연금·건강보험은 근로자와 사업주가 절반씩, 고용·산재는 사업주가 더 부담합니다."],["무엇을 기준으로 계산하나요?","비과세를 제외한 과세 대상 월 급여를 기준으로 합니다."]],
loan:[["원리금균등이 뭔가요?","매달 같은 금액(원금+이자)을 갚는 방식입니다."],["총 이자를 줄이려면요?","상환기간을 줄이거나 금리가 낮은 상품을 택하면 됩니다."]],
loanequal:[["원금균등과 원리금균등 차이는요?","원금균등은 매달 원금이 같아 초반 상환액이 크지만 총 이자는 적습니다."],["어떤 게 유리한가요?","여유가 있으면 총 이자가 적은 원금균등이 유리합니다."]],
dsr:[["DSR 40%는 무슨 뜻인가요?","연소득의 40%를 넘는 원리금 상환이면 대출이 제한된다는 뜻입니다."],["DTI와 다른가요?","DSR은 모든 대출의 원리금을, DTI는 주택담보대출 위주로 봅니다."]],
deposit:[["예금과 적금 차이는요?","예금은 목돈을 한 번에, 적금은 매달 나눠 넣습니다."],["세금은 얼마인가요?","이자에 15.4%의 이자소득세가 부과됩니다."]],
compound:[["복리가 왜 강력한가요?","이자에 이자가 붙어 시간이 지날수록 증가 속도가 빨라집니다."],["72의 법칙이 뭔가요?","72를 수익률로 나누면 원금이 두 배 되는 대략의 연수가 나옵니다."]],
vat:[["부가세율은 몇 %인가요?","10%입니다."],["합계에서 부가세를 어떻게 빼나요?","합계를 1.1로 나누면 공급가액, 나머지가 부가세입니다."]],
acqtax:[["취득세는 얼마인가요?","1주택 기준 6억 이하 1%, 9억 초과 3%이며 중간 구간은 1~3%입니다."],["다주택이면 더 내나요?","조정대상지역·다주택은 중과세율이 적용될 수 있습니다."]],
brokerfee:[["중개수수료는 고정인가요?","법정 상한요율 안에서 협의로 정합니다."],["부가세가 붙나요?","중개사가 일반과세자면 부가세가 별도로 붙을 수 있습니다."]],
charcount:[["공백 포함과 제외 차이는요?","공백(띄어쓰기·줄바꿈)을 글자수에 넣느냐 빼느냐의 차이입니다."],["바이트 수는 왜 보나요?","한글은 보통 2바이트라 바이트 제한이 있는 입력창에서 필요합니다."]],
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
  const g=guide[t.id], f=faq[t.id];
  const guideHtml = g ? '<section class="guide"><h2>이렇게 계산해요</h2><ul>'+g.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></section>' : '';
  const faqHtml = f ? '<section class="faq"><h2>자주 묻는 질문</h2>'+f.map(x=>'<details><summary>'+esc(x[0])+'</summary><p>'+esc(x[1])+'</p></details>').join("")+'</section>' : '';
  const faqLd = f ? '<script type="application/ld+json">'+JSON.stringify({"@context":"https://schema.org","@type":"FAQPage",mainEntity:f.map(x=>({"@type":"Question",name:x[0],acceptedAnswer:{"@type":"Answer",text:x[1]}}))})+'</script>' : '';
  return `<!doctype html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
<link rel="stylesheet" href="style.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>${faqLd}
</head><body><div class="wrap">
<a class="back" href="index.html">← 전체 계산기</a>
<h1 class="th">${t.name}</h1>
<div class="tl">${t.desc}</div>
<div class="card tool" id="tool"></div>
<p class="intro">${esc(intro[t.id]||t.desc)}</p>
${guideHtml}${faqHtml}
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
    return '<section class="grp'+(c==="재미·운세"?" fun":"")+'"><div class="cat"><span>'+c+'</span></div>'+items.map(function(t){
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
<header class="masthead"><div><div class="brand">모아계산기</div><div class="mh-sub">물어보면 다 답하는 만능 계산 콘솔</div></div>
<div class="meta">2026 KR<br>${meta.length} TOOLS</div></header>
<div class="console"><div class="prompt">&gt; 무엇을 계산할까요<span class="cur"></span></div><div class="mh-sub" style="margin-top:8px">숫자로 답하는 거의 모든 것. 실수령액·퇴직금·대출부터 사다리타기까지 ${meta.length}가지.</div></div>
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
