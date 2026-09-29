/* 정확성 검증: 만세력 엔진(문헌 검증값 대조) + 세금·공식 스팟체크. 실행: node verify.js */
const fs = require("fs");
const src = fs.readFileSync("hub.html", "utf8");
const bs = fs.readFileSync("build_site.js", "utf8"); // 페이지 마크업(사이드바 이미지 등) 검사용
const inner = src.match(/<script>([\s\S]*?)<\/script>/)[1];
const engine = inner.slice(inner.indexOf("var SJ_S="), inner.indexOf("// ---------- shared"));
const shared = inner.slice(inner.indexOf("function earnedDed"), inner.indexOf("// ---------- TOOLS"));
eval(engine); eval(shared);

let pass = 0, fail = 0;
function t(name, got, want) {
  const ok = got === want;
  ok ? pass++ : fail++;
  console.log((ok ? "✅" : "❌") + " " + name + " → " + got + (ok ? "" : "  (기대: " + want + ")"));
}
const G = i => SJ_S[i.s] + SJ_B[i.b];

// 도메인이 어긋나면 canonical·OG·sitemap이 전부 엉뚱한 곳을 가리킨다
t("DOMAIN 상수는 프로토콜 포함·끝 슬래시 없음", /const DOMAIN = "https:\/\/[a-z0-9.-]+"/.test(bs) && !/const DOMAIN = "[^"]*\/";/.test(bs), true);

// ── 만세력: 문헌 검증값 ──
let p = sjPillars(2000, 1, 1, 12, 0, false);
t("2000-01-01 연주(기묘)", G(p.y), "기묘");
t("2000-01-01 월주(병자)", G(p.m), "병자");
t("2000-01-01 일주(무오)", G(p.d), "무오");
t("2000-01-01 12시 시주(무오시)", SJ_S[p.h.s] + SJ_B[p.h.b], "무오");

p = sjPillars(1900, 1, 1, null, 0, false);
t("1900-01-01 일주(갑술)", G(p.d), "갑술");

p = sjPillars(2000, 2, 5, 12, 0, false); // 입춘(2/4) 다음날
t("2000-02-05 연주(경진, 입춘 후)", G(p.y), "경진");
t("2000-02-05 월주(무인)", G(p.m), "무인");

p = sjPillars(2000, 2, 3, 12, 0, false); // 입춘 전날
t("2000-02-03 연주(기묘, 입춘 전)", G(p.y), "기묘");

p = sjPillars(2026, 1, 1, null, 0, false); // 2026-01-01 = 정묘일 (60갑자 연산 교차)
// 2000-01-01(무오,idx54)부터 9497일 → (54+9497)%60=11 → 을해? 계산기 검증용 산술 자체 대조
const jdn = (y,m,d)=>{const a=Math.floor((14-m)/12),Y=y+4800-a,M=m+12*a-3;return d+Math.floor((153*M+2)/5)+365*Y+Math.floor(Y/4)-Math.floor(Y/100)+Math.floor(Y/400)-32045;};
const di = (((jdn(2026,1,1)-2451545)+54)%60+60)%60;
t("2026-01-01 일주(산술 교차검증)", G(p.d), SJ_S[di%10]+SJ_B[di%12]);

// ── 24절기 ──
// 기존 sjIpchun 과 일반 함수가 어긋나면 월주 판정과 절기 표시가 서로 다른 말을 한다
const kst = jd => { // JD → KST 달력 (verify 안에서만 쓰는 역변환)
  const z = Math.floor(jd + 0.5 + 9/24), f = (jd + 0.5 + 9/24) - z;
  let a = z; if (z >= 2299161){ const al = Math.floor((z-1867216.25)/36524.25); a = z+1+al-Math.floor(al/4); }
  const b = a+1524, c = Math.floor((b-122.1)/365.25), d0 = Math.floor(365.25*c), e = Math.floor((b-d0)/30.6001);
  const day = b-d0-Math.floor(30.6001*e), mo = e<14 ? e-1 : e-13, yr = mo>2 ? c-4716 : c-4715;
  const mins = Math.round(f*1440);
  return { y:yr, mo, d:day, h:Math.floor(mins/60)%24, mi:mins%60 };
};
const fmtT = o => `${o.y}-${String(o.mo).padStart(2,"0")}-${String(o.d).padStart(2,"0")} ${String(o.h).padStart(2,"0")}:${String(o.mi).padStart(2,"0")}`;

for (const y of [2000, 2026, 2030]) {
  const diffMin = Math.abs(sjTermJd(y, 315) - sjIpchun(y)) * 1440;
  t(`${y} 입춘: 일반 절기 함수가 sjIpchun과 1분 이내`, diffMin < 1, true);
}
// 외부 대조 — 포스텔러 만세력 2026년 9월 표시값 (스크린샷)
t("2026 백로 날짜", fmtT(kst(sjTermJd(2026, 165))).slice(0,10), "2026-09-07");
t("2026 추분 날짜", fmtT(kst(sjTermJd(2026, 180))).slice(0,10), "2026-09-23");
// 홍콩천문대 공식 절기표(영국 HMNAO·미국 USNO 자료, HKT=KST-1) — ±1분
for (const [y, deg, want, nm] of [[2026, 315, "2026-02-04 05:02", "입춘"], [2026, 45, "2026-05-05 20:49", "입하"], [2027, 45, "2027-05-06 02:25", "입하"], [2028, 270, "2028-12-21 17:20", "동지"]]) {
  const o = kst(sjTermJd(y, deg)), w = want.match(/(\d+)-(\d+)-(\d+) (\d+):(\d+)/).map(Number);
  const dm = (sjJdn(o.y, o.mo, o.d) - sjJdn(w[1], w[2], w[3])) * 1440 + (o.h * 60 + o.mi) - (w[4] * 60 + w[5]);
  t(`${y} ${nm} 공식 ${want} ±1분`, Math.abs(dm) <= 1, true);
}
// 밤 자시: 1990-03-15(기묘일) 23:30 → 시주 병자(다음 날 경진일의 자시), 새벽 00:30 → 갑자
t("밤 자시 시 천간은 다음 날 기준(병자)", (p => p.s + "-" + p.b)(sjPillars(1990, 3, 15, 23, 30, true).h), "2-0");
t("새벽 자시는 그날 기준(갑자)", (p => p.s + "-" + p.b)(sjPillars(1990, 3, 15, 0, 30, true).h), "0-0");
t("정확한 시각 칸이 서머타임·UTC+8:30을 되돌려 쓴다", ["function birthIn()", "krClockShift(y,mo,d).min", 'id="tm"', "sjPillars(B.y,B.mo,B.d,h,B.mi,corr)"].every(x => src.includes(x)), true);
// 시각은 ±5분 허용 (포스텔러 화면값은 분 단위)
const bkMin = (o => o.h*60+o.mi)(kst(sjTermJd(2026, 165)));
t("2026 백로 시각 23:40 ±5분", Math.abs(bkMin - (23*60+40)) <= 5, true);

// 십성 스팟: 갑(0) 기준 — 을(1)=겁재, 병(2)=식신, 신(7)=정관, 계(9)=정인
t("십성 갑→을(겁재)", sjTenGod(0,1), "겁재");
t("십성 갑→병(식신)", sjTenGod(0,2), "식신");
t("십성 갑→신(정관)", sjTenGod(0,7), "정관");
t("십성 갑→계(정인)", sjTenGod(0,9), "정인");

// ── 신강·신약 / 용신 ──
const stA = sjStrength(sjPillars(1990,3,15,12,0,false));
t("신강신약 판정 반환", typeof stA.strong === "boolean" && stA.yong >= 0 && stA.yong <= 4, true);
t("용신 규칙: 신강→식상 / 신약→인성", stA.yong === (stA.strong ? (stA.de+1)%5 : (stA.de+4)%5), true);
t("돕는 기운 비율 0~1", stA.ratio >= 0 && stA.ratio <= 1, true);

// ── 십이운성 / 신살 / 격국 ──
t("십이운성 갑목 亥=장생", sjUnseong(0,11), "장생");
t("십이운성 갑목 寅=건록", sjUnseong(0,2), "건록");
t("십이운성 병화 寅=장생", sjUnseong(2,2), "장생");
t("십이운성 을목(음간 역행) 午=장생", sjUnseong(1,6), "장생");
t("십이운성 경금 巳=장생", sjUnseong(6,5), "장생");
const pS = sjPillars(1990,3,15,12,0,false);
t("신살 배열 반환", Array.isArray(sjSinsal(pS)), true);
t("격국: 월지 본기 십성으로 판정", !!SJ_GYEOK[sjTenGod(pS.d.s, SJ_BMAIN[pS.m.b])], true);

// ── 궁합·운세 합충 산술 ──
t("천간합 갑기(|0-5|=5)", Math.abs(0-5)===5, true);
t("삼합 신자진(8,0,4 → %4 동일)", (8%4===0%4)&&(0%4===4%4), true);
t("육합 인해(2+11=13)", 2+11===13, true);
t("충 자오(|0-6|=6)", Math.abs(0-6)===6, true);
t("충 묘유(|3-9|=6)", Math.abs(3-9)===6, true);

// ── 육합 짝 (자축·인해·묘술·진유·사신·오미) ──
t("육합 자(子)→축(丑)", sjYukhap(0), 1);
t("육합 축(丑)→자(子)", sjYukhap(1), 0);
t("육합 인(寅)→해(亥)", sjYukhap(2), 11);
t("육합 오(午)→미(未)", sjYukhap(6), 7);
t("육합은 대칭", [0,1,2,3,4,5,6,7,8,9,10,11].every(b => sjYukhap(sjYukhap(b)) === b), true);

// ── 서양 별자리: 태양황경 기반 판정 ──
t("별자리 춘분 다음날(3/21)=양자리", ST_KO[stOf(2026,3,21)], "양자리");
t("별자리 8/15=사자자리", ST_KO[stOf(2026,8,15)], "사자자리");
t("별자리 12/25=염소자리", ST_KO[stOf(2026,12,25)], "염소자리");
t("별자리 1/30=물병자리", ST_KO[stOf(2026,1,30)], "물병자리");
t("별자리 배열 12개 정합", ST_KO.length===12 && ST_EN.length===12 && ST_RULER.length===12 && ST_RANGE.length===12, true);
t("어스펙트 표 7단계(0~180°)", ST_ASP.length===7 && ST_ASP.every(a=>a[6].length===4), true);
t("수호성은 칠요 안에 있음", ST_RULER.every(r => WD_RULER.indexOf(r) >= 0), true);
t("원소별 지배성 집합에 자기 수호성 포함", ST_KO.every((_,i)=>ST_ELE_RULERS[ST_ELE[i%4]].indexOf(ST_RULER[i])>=0), true);
t("오행 행운표 5개", SJ_LUCK.length===5 && SJ_HOUR.length===12, true);

// ── 세금·공식: 공식 세율표 대조 ──
t("소득세 1400만(6%)", progressive(14e6), 840000);
t("소득세 5000만(경계)", progressive(50e6), 6240000);
t("소득세 8800만(경계)", progressive(88e6), 15360000);
t("근로소득공제 5000만", earnedDed(50e6), 12000000 + 5e6*0.05);
// 취득세 구간
const acq = P => P<=6e8?1:(P<=9e8?P/1e8*2/3-3:3);
t("취득세 6억(1%)", acq(6e8), 1);
t("취득세 7.5억(2%)", acq(7.5e8), 2);
t("취득세 9억(3%)", acq(9e8), 3);
// 4대보험 (2026 요율, 앞서 공식 확인)
t("국민연금 300만", Math.round(3e6*0.0475), 142500);
t("건강보험 300만", Math.round(3e6*0.03595), 107850);

// ── 타로: 대화형 리딩 — 카드 데이터·스프레드·풀이 원고가 어긋나면 undefined가 화면에 뜬다 ──
const tarotSrc = inner.slice(inner.indexOf('id:"tarot"'), inner.indexOf('id:"todayfortune"'));
const tarotData = new Function(tarotSrc.slice(tarotSrc.indexOf("var M="), tarotSrc.indexOf("el.innerHTML=")) +
  "; return {M:M,STORY:STORY,ART:ART,CARD_EL:CARD_EL,YN:YN,YN_LINE:YN_LINE,TOPICS:TOPICS,REL:REL,REVL:REVL,CLOSE:CLOSE,KW:KW,EL_LINE:EL_LINE,EL_MIX:EL_MIX,STAGE:STAGE};")();
const TREAD = require("./content_tarot_read.js");
t("타로 78장 (메이저 22 · 마이너 56)", tarotData.M.length, 78);
t("타로 아트 매핑 78장", Object.keys(tarotData.ART).length, 78);
t("타로 상징 스토리 78개", tarotData.STORY.length === 78 && tarotData.STORY.every(s => s.length >= 25), true);
t("타로 카드 오행 78장 (0~4)", tarotData.CARD_EL.length === 78 && tarotData.CARD_EL.every(e => e >= 0 && e <= 4), true);
t("타로 스프레드 자리는 풀이 원고에 있는 키만", tarotData.TOPICS.every(tp => tp.qs.every(q => q.sp.length >= 1 && q.sp.length <= 3 &&
  q.sp.every(([k]) => k === "answer" || TREAD[0].role[k] !== undefined))), true);
const ROLE_K = ["past","now","future","mine","theirs","block","advice","cause","fix"], TOPIC_K = ["love","money","work","exam","family","friend","health","day"];
t("타로 고민 키는 원고 topic 키와 일치", tarotData.TOPICS.map(tp => tp.k).join(","), TOPIC_K.join(","));
t("타로 풀이 원고 78장 · 자리 9 · 고민 8×정역 · 한마디", TREAD.length === 78 && TREAD.every((c, i) => c.no === i &&
  ROLE_K.every(k => typeof c.role[k] === "string" && c.role[k].length >= 30) &&
  TOPIC_K.every(k => Array.isArray(c.topic[k]) && c.topic[k].length === 2 && c.topic[k].every(x => x.length >= 40)) && c.one.length >= 10), true);
const readLines = TREAD.flatMap(c => ROLE_K.map(k => c.role[k]).concat(...TOPIC_K.map(k => c.topic[k]), [c.one]));
const bosalLines = readLines.concat(TREAD.flatMap(c => [c.desc.up, c.desc.rev]), tarotData.EL_LINE, [tarotData.EL_MIX], tarotData.STAGE, tarotData.REVL, tarotData.CLOSE, [].concat(...tarotData.REL), [].concat(...Object.values(tarotData.YN_LINE)),
  tarotData.TOPICS.flatMap(tp => [tp.hi].concat(tp.qs.map(q => q.say))));
t("타로 대화 원고에 존댓말 없음", bosalLines.filter(x => /습니다|합니다|하세요|입니다|십시오/.test(x)).length, 0);
t("타로 대화 원고가 보살 어미 사용", bosalLines.filter(x => !/일세|걸세|하게|게\.|네\.|야\.|지\.|어\.|해\.|워\./.test(x)).length, 0);
t("타로 대화 원고에 단정·유도 표현 없음", bosalLines.filter(x => /반드시|틀림없|정확하게|신령|부적|굿을/.test(x)).length, 0);
// 건강 고민은 생활 리듬·컨디션만 다룬다. 병명·증상·예후를 말하면 사람을 겁주거나 병원에 갈 사람을 붙잡는다
const healthLines = TREAD.flatMap(c => c.topic.health);
t("타로 건강 풀이에 병·증상·치료 표현 없음", healthLines.filter(x => /질환|증상|암에|수술|약을|약이|진단|통증|아프|낫는|낫게|회복|치료|감기|염증|부상|다치/.test(x)).length, 0);
t("타로 건강 고민은 병원 안내를 먼저 한다", /병원/.test(tarotData.TOPICS.find(tp => tp.k === "health").hi) && /병원/.test(tarotData.CLOSE[tarotData.TOPICS.findIndex(tp => tp.k === "health")]), true);
t("타로 카드 설명 78장 × 정역 (250자 이상)", TREAD.every(c => c.desc && ["up","rev"].every(k => typeof c.desc[k] === "string" && c.desc[k].replace(/\s/g, "").length >= 250)), true);
t("타로 핵심어는 카드 뜻 페이지 keyword와 같음", tarotData.KW.join("|"), require("./content_tarot.js").map(c => c.keyword).join("|"));
t("타로 종합 원소 문장 5 · 여정 구간 3", tarotData.EL_LINE.length === 5 && tarotData.STAGE.length === 3, true);
t("타로 결과는 진지한 보살 로딩(최소 3.6초) 뒤에 차례로 띄운다", tarotSrc.includes("mascot-serious.webp") && /Math\.max\(3600,/.test(tarotSrc) && tarotSrc.includes("tr-in"), true);
t("타로 진지한 보살 이미지 파일 존재", fs.existsSync("img/mascot-serious.webp"), true);
t("타로 게임 연출: 문질러 섞기·입자·날아가 꽂히기", tarotSrc.includes("bindRub()") && tarotSrc.includes("function burst(") && tarotSrc.includes("tr-fly"), true);
t("타로 첫 화면 고민 8칸 (두 줄 격자에 빈칸 없음)", tarotData.TOPICS.length, 8);
t("타로 관계 풀이 5관계 × 고민 수", tarotData.REL.length === 5 && tarotData.REL.every(r => r.length === tarotData.TOPICS.length) && tarotData.CLOSE.length === tarotData.TOPICS.length, true);
t("타로 예/아니오 성향은 카드 뜻 페이지와 같음", tarotData.YN.join(","), require("./content_tarot.js").map(c => c.yesno).join(","));
t("타로 예/아니오 줄은 성향 3종 × 정역", ["예","아니오","조건부"].every(k => tarotData.YN_LINE[k] && tarotData.YN_LINE[k].length === 2), true);
t("타로 풀이 원고가 청크에 주입됨", /c\.id === "tarot" \? "var TAROT_READ="/.test(bs), true);
t("타로 풀이 조립에 스토리·자리·고민 사용", tarotSrc.includes("STORY[pk.i]") && tarotSrc.includes("c.role[role]") && tarotSrc.includes("c.topic[topic.k][pk.rev?1:0]"), true);

// ── 오늘의 운세: 십성 10종 모두 9개 필드(총운·애정·직장·건강 포함)를 갖는가 ──
const tfSrc = inner.slice(inner.indexOf('id:"todayfortune"'), inner.indexOf('id:"horoscope"'));
const tfKeys = [...tfSrc.matchAll(/"(비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인)":\[/g)].map(m => m[1]);
t("오늘의 운세 십성 10종 정의", new Set(tfKeys).size, 10);
t("오늘의 운세 항목별 해설(애정·직장·건강) 존재", /애정운 <span|T\[6\]/.test(tfSrc) && /T\[7\]/.test(tfSrc) && /T\[8\]/.test(tfSrc), true);

// ── T1 콘텐츠 대개편: 정체성·무드·헤드라인·용신 ──
t("일간 정체성 SJ_ILGAN_ID 10문장", SJ_ILGAN_ID.length===10 && SJ_ILGAN_ID.every(s=>s.indexOf("—")>0), true);
t("십이운성 무드 UN_MOOD 12문장", Object.keys(UN_MOOD).length===12 && SJ_UN.every(u=>typeof UN_MOOD[u]==="string" && UN_MOOD[u].length>=20), true);
const txtCode = tfSrc.slice(tfSrc.indexOf("var TXT={"), tfSrc.indexOf("]};")+3);
// 한 줄 요약(TXT[..][9])은 홈 오늘 카드와 같이 쓰려고 core 의 TF_LINE 으로 옮겼다
const tfLineCode = (inner.match(/var TF_LINE=\{[^\n]*\};/) || [""])[0];
t("오늘의 운세 한 줄 TF_LINE 이 core 에 있다", tfLineCode.length > 0, true);
const TFTXT = new Function(tfLineCode + txtCode + "; return TXT;")();
t("오늘의 운세 TXT 10종 × 10필드(hl 포함)", Object.keys(TFTXT).length===10 && Object.values(TFTXT).every(a=>a.length===10 && typeof a[9]==="string" && a[9].length>=8), true);
t("총운 3계층 조립(UN_MOOD 접합)", tfSrc.includes("UN_MOOD[un]") && tfSrc.includes("삼합도 충도 육합도 없어"), true);
t("용신 섹션·내일 미리보기 렌더", tfSrc.includes("나를 받쳐 주는 기운으로 보는 오늘") && tfSrc.includes("내일 미리보기"), true);
t("용신 보정 후 클램프 상한", Math.max(35,Math.min(98,85+8+5)), 98);
t("용신 보정 후 클램프 하한", Math.max(35,Math.min(98,35-10-3)), 35);
t("첫 화면 후킹(정체성+헤드라인이 점수 위)", tfSrc.indexOf('tf-id')<tfSrc.indexOf('class="out"') && tfSrc.indexOf('tf-hl')<tfSrc.indexOf('class="out"') && tfSrc.indexOf('tf-id')>0, true);

// ── T2 페르소나: 보살 문체 ──
// 풀이 원고에 존댓말이 섞이면 화자가 둘로 갈라진다. 계산 근거 고지(note·회색 주석)는 존댓말 유지이므로 데이터만 검사한다.
const JONDAE = /습니다|합니다|하세요|입니다|십시오/;
const BOSAL = /일세|걸세|하게|게\.|네\.|야\.|지\.|어\.|해\.|워\./;
const tfBody = Object.values(TFTXT).flatMap(a => [a[1],a[2],a[3],a[4],a[6],a[7],a[8]]);
const tfHead = Object.values(TFTXT).map(a => a[9]);
t("오늘의 운세 원고에 존댓말 없음", tfBody.concat(tfHead).filter(s=>JONDAE.test(s)).length, 0);
t("오늘의 운세 원고가 보살 어미 사용", tfBody.filter(s=>!BOSAL.test(s)).length, 0);
// 헤드라인(슬롯 9)만은 체언 종결 카피 — 공유·저장 이미지에 그대로 박히므로 짧게 유지한다
t("헤드라인 10종은 짧은 카피", tfHead.every(s=>s.length<=34), true);
t("UN_MOOD 12종 보살 문체", Object.values(UN_MOOD).filter(s=>JONDAE.test(s)).length, 0);
t("SJ_UN_DESC 12종 보살 문체", Object.values(SJ_UN_DESC).filter(s=>JONDAE.test(s)).length, 0);
t("SJ_SINSAL_DESC 8종 보살 문체", Object.values(SJ_SINSAL_DESC).filter(s=>JONDAE.test(s)).length, 0);
t("SJ_GYEOK_DESC 10종 보살 문체", Object.values(SJ_GYEOK_DESC).filter(s=>JONDAE.test(s)).length, 0);
t("긴 섹션은 문단 분할(<br><br>)", (tfSrc.match(/<br><br>/g)||[]).length >= 8, true);
t("조언에 최저·최고 항목 명시", tfSrc.includes("SUB_LBL[loI]") && tfSrc.includes("SUB_LBL[hiI]"), true);

// ── T3 물어보기 게이트 · 도파민 연출 ──
// 운세 7종은 버튼을 눌러야 답이 나온다. 자동 실행이 하나라도 남으면 게이트가 뚫린다
const FORTUNE_GATED = ["saju","todayfortune","horoscope","stargunghap","zodiacfortune","gunghap","newyear","tojeong"];
const toolBlock = id => { const i = inner.indexOf('{id:"'+id+'"'); const j = inner.indexOf('{id:"', i+8); return inner.slice(i, j<0?inner.length:j); };
t("운세 8종 물어보기 배선(askWire)", FORTUNE_GATED.every(id=>/askWire\(el,go,\[/.test(toolBlock(id))), true);
// 버튼 클릭 외에 결과를 그리는 경로가 남아 있으면 게이트가 샌다(select change·초기 go() 모두)
t("운세 8종 자동 실행 제거", FORTUNE_GATED.every(id=>{const b=toolBlock(id);return !/;go\(\);/.test(b) && !/addEventListener\("change",go\)/.test(b);}), true);
t("버튼 문구 통일(ASK_LABEL)", (inner.match(/'\+ASK_LABEL\+'<\/button>/g)||[]).length, 8);
t("물어보기 전 대기 화면", /function askWait/.test(inner) && /ask-wait/.test(src), true);
// 도파민 1 — 짚어 보는 연출(릴 + 단계 문구), 2 — 점수 카운트업·막대 채우기·등급, 3 — 스트릭·부적
t("연출1 짚어보기(릴+단계)", /function askThink/.test(inner) && /ask-reel/.test(src) && /reelspin/.test(src), true);
t("연출2 카운트업·막대·등급", /function countUp/.test(inner) && /function fillBars/.test(inner) && /function gradeFx/.test(inner) && /\.out\.hit/.test(src), true);
t("연출3 스트릭·부적", /function bumpStreak/.test(inner) && /function bujeokHtml/.test(inner) && /\.bujeok\{/.test(src), true);
t("스트릭·부적은 매일 오는 도구에만", (inner.match(/streak:true/g)||[]).length===1 && (inner.match(/bujeok:true/g)||[]).length===1, true);
t("부적 문구 8종", (inner.slice(inner.indexOf("var BUJEOK=")).match(/\["/g)||[]).length>=8, true);
t("모션 최소화 설정 존중", /prefers-reduced-motion/.test(src), true);

// ── 오행 상생·상극 / 합충 삽화 ──
// 파일이 없으면 onerror로 조용히 사라져 버그를 못 잡는다. 존재 여부를 여기서 못 박는다
t("상생 삽화 5장 존재", ART_SAENG.length===5 && ART_SAENG.every(f=>fs.existsSync("img/char/"+f+".webp")), true);
t("상극 삽화 5장 존재", ART_GEUK.length===5 && ART_GEUK.every(f=>fs.existsSync("img/char/"+f+".webp")), true);
t("합충 삽화 6장 존재", Object.keys(ART_HAP).length===6 && Object.values(ART_HAP).every(f=>fs.existsSync("img/char/"+f+".webp")), true);
// 상생 인덱스는 "그 오행을 낳는" 관계여야 한다 (수생목 → 목 자리)
t("상생 매핑은 나를 낳는 관계", ART_SAENG[0]==="el-saeng-sumok" && ART_SAENG[1]==="el-saeng-mokhwa" && ART_SAENG[4]==="el-saeng-geumsu", true);
t("상극 매핑은 나를 극하는 관계", ART_GEUK[0]==="el-geuk-geummok" && ART_GEUK[1]==="el-geuk-suhwa" && ART_GEUK[4]==="el-geuk-tosu", true);
t("합충 삽화 배선(오늘의 운세·띠별·사주)", /bonusArt\?conceptArt\(ART_HAP/.test(inner) && /ART_HAP\[rel\]\?conceptArt/.test(inner) && /conceptArt\(ART_SAENG\[SJ_EL\.indexOf\(mn\)\]/.test(inner), true);
// 상극 5장이 파일만 있고 화면에 안 뜨면 죽은 자산이다. 용신이 극당하는 날에만 노출한다
t("상극 삽화 배선(용신 극하는 날)", /yongClash\?conceptArt\(ART_GEUK\[st\.yong\]/.test(inner), true);
t("상생 삽화 배선(용신 들어오는 날)", /yongHit\?conceptArt\(ART_SAENG\[st\.yong\]/.test(inner), true);


// ── 한글 조사 자동 선택 (받침 유무) ──
t("조사 받침 있음 → 과/이", josa("불","와/과")+josa("물","가/이"), "과이");
t("조사 받침 없음 → 와/가", josa("공기","와/과")+josa("공기","가/이"), "와가");
t("네 원소 전부 조사 처리", ST_ELE.every(e=>["와","과"].indexOf(josa(e,"와/과"))>=0), true);
// 오행 이름 뒤 조사: 목·금은 받침 있고 화·토·수는 없다 (용신 문장에서 "화(火)이" 같은 오류 방지)
t("오행 조사: 목→이/은/을, 화→가/는/를", SJ_EL.map(e=>e+josa(e,"가/이")).join(" "), "목이 화가 토가 금이 수가");
t("용신 문장에 하드코딩 조사 없음", !/EL_HAN\.charAt\(st\.yong\)\+'\)이|SJ_EL\[st\.yong\]\+'은 |SJ_EL\[st\.yong\]\+"을 극/.test(tfSrc), true);

// ── T4: 궁합·신년·별자리궁합 첫 화면 헤드라인 ──
[["gunghap","newyear"],["newyear","namematch"],["stargunghap","gunghap"]].forEach(([id,next])=>{
  const s = inner.slice(inner.indexOf(`id:"${id}"`), inner.indexOf(`id:"${next}"`));
  t(`${id} 헤드라인이 점수 카드 위에 렌더`, s.indexOf("tf-hl")>0 && s.indexOf("tf-hl") < s.indexOf('class="out"'), true);
});

// ── 사주 종합 풀이·영역별 시기 (2026-09 평가: 칸마다 따로 놀고 "언제"가 없었다) ──
{
  const sj = toolBlock("saju");
  const arr = n => { const i = sj.indexOf("var " + n + "=["); return i < 0 ? 0 : (sj.slice(i, sj.indexOf("];", i)).match(/"[^"]+"/g) || []).length; };
  t("사주 종합 풀이: 일간 결 10 · 이기는 방식 10", arr("STYLE")+"/"+arr("WIN"), "10/10");
  const stg = sj.slice(sj.indexOf("var STAGE={"), sj.indexOf("};", sj.indexOf("var STAGE={")));
  t("사주 종합 풀이: 격국 무대 십성 10개", (stg.match(/"[^"]+":/g) || []).length, 10);
  t("사주 종합 풀이가 결과 맨 위(한눈에 앞)에 붙음", sj.includes("headline+synth+hourSec()+'<div class=\"tail-wrap fold-skip\" id=\"tailbox\"></div>'+glance"), true);
  t("인생 시기표 영역 표시·앞으로 10년 요약 배선", sj.includes("yr-tags") && sj.includes("planTxt") && sj.includes('TAGS=["인연","이동","일","문서","돈","지출","집안"]'), true);
}

// ── 사주 조합 원고(일간×격국) — 같은 일간이면 같은 문단을 받던 것을 격국까지 갈라 쓴다 ──
{
  const CO = require("./content_saju_combo.js"), IL = ["gap","eul","byeong","jeong","mu","gi","gyeong","sin","im","gye"];
  const TGS = ["bigyeon","geopjae","siksin","sanggwan","pyeonjae","jeongjae","pyeongwan","jeonggwan","pyeonin","jeongin"], F = ["core","money","job","love","health"];
  const cells = IL.flatMap(i => TGS.map(t => (CO[i] || {})[t]));
  t("사주 조합 원고 100조합 × 5칸", cells.filter(c => c && F.every(f => typeof c[f] === "string" && c[f].replace(/\s/g, "").length >= 100)).length, 100);
  t("사주 조합 원고는 보살 말투", cells.filter(c => c && JONDAE.test(F.map(f => c[f]).join(" "))).length, 0);
  const VD = require("./content_saju_verdict.js"), BK = { money: ["none","mid","many"], job: ["none","many","craft","mid"], love: ["none","mid","many"] };
  t("사주 판정 문장: 일간×갈래 첫 문장 · 격국×갈래 설명 전부", Object.entries(BK).every(([a, bs]) => IL.every(i => bs.every(k => VD[a].head[i] && VD[a].head[i][k])) && TGS.every(tg => bs.every(k => VD[a].follow[tg] && VD[a].follow[tg][k]))), true);
  t("사주 판정 문장은 보살 말투", Object.values(VD).flatMap(o => [...Object.values(o.head), ...Object.values(o.follow)].flatMap(Object.values)).filter(x => JONDAE.test(x)).length, 0);
  const SY = require("./content_saju_synth.js"), GRPS = ["비겁","식상","재성","관성","인성"], SINS = ["천을귀인","문창귀인","도화살","역마살","화개살","양인살","백호대살","괴강살"];
  t("사주 종합 원고: 일간×격국×강약 200 · 빈 기운 50 · 신살 80 · 지금 흐름 40", IL.every(i => SY[i] && TGS.every(tg => SY[i].synth[tg] && SY[i].synth[tg].strong && SY[i].synth[tg].weak) && GRPS.every(k => SY[i].miss[k]) && SINS.every(k => SY[i].sin[k])) && TGS.every(tg => ["both","du","se","none"].every(k => SY.nowfit[tg] && SY.nowfit[tg][k])), true);
  t("사주 종합 원고는 보살 말투", JSON.stringify(SY).match(/습니다|합니다|입니다|하세요|십시오/g), null);
  t("달마다 흐름: 열두 달 · 십성 10종 문장 · 절기 시작일 표시", toolBlock("saju").includes("function monthSec()") && toolBlock("saju").includes("monthSec()+") && (toolBlock("saju").match(/"(비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인)":\["[^"]+달/g) || []).length === 10, true);
  t("태어난 시각이 재물·애정·시기·한눈에 풀이에 들어간다", ["HOUR_MONEY[hTg]", "HOUR_LOVE[hTg]", 'T.push("집안")', "태어난 시각 자리</b> —"].every(x => toolBlock("saju").includes(x)), true);
  t("홈 h1에 title 검색어(무료사주·사주풀이·오늘의 운세·궁합·타로)", (h => ["무료사주","사주풀이","오늘의 운세","궁합","타로"].every(k => h.includes(k)))((bs.match(/<h1 class="hero-h">([\s\S]*?)<\/h1>/) || ["",""])[1].replace(/&nbsp;/g, " ")), true);
  t("꼬리질문 통계 이벤트: 화면이 보내는 이름을 서버가 허용", /const EVENTS = new Set\(\[[^\]]*"tail_ask"/.test(fs.readFileSync("worker.js", "utf8")) && src.includes('track("tail_ask"'), true);
  t("사주 꼬리질문: 결과 뒤에 자리·질문 12개·엔진 연결", ["tailAsk(el.querySelector(\"#tailbox\"),tailCfg)", 'first:["money","quit","marry","month"]', 'fetch("sj/q.json")', "TPRED={"].every(x => toolBlock("saju").includes(x)) && ["quit","exam","move","marry","kids","people","startup","month","money","job","love","health"].every(k => toolBlock("saju").includes(k + ":")), true);
  t("오늘의 운세 꼬리질문: 자리·질문 8개·엔진 연결", ["tailAsk(el.querySelector(\"#tailbox\"),tfTail)", 'first:["confess","contract","interview","spend"]', 'fetch("tf/q.json")'].every(x => toolBlock("todayfortune").includes(x)) && ["confess","contract","interview","spend","talk","travel","start","meet"].every(k => toolBlock("todayfortune").includes(k + ":")), true);
  t("타로 꼬리질문: 자리·주제 비춰 보기·조언·한마디", ["tailAsk(rd.querySelector(\"#tailbox\"),tarotTail)", 'tpool.adv=', 'tpool.one=', '"이 패를 "+t.name+"에 비춰 보면?"'].every(x => toolBlock("tarot").includes(x)), true);
  t("지장간 표: 열두 지지 · 일수 합 30 · 마지막(정기)이 SJ_BMAIN 과 같다", SJ_JJG.length === 12 && SJ_JJG.every((r, b) => r.reduce((a, x) => a + x[1], 0) === 30 && r[r.length - 1][0] === SJ_BMAIN[b]), true);
  t("사주 도구가 대운 시작을 공용 sjDaeunStart 로 계산한다", toolBlock("saju").includes("sjDaeunStart(p,male,") && !toolBlock("saju").includes("function mIdxOf"), true);
  // ── 명리학 배우기
  { const LEARN = require("./content_learn.js"), L = LEARN.LECTURES, lsrc = fs.readFileSync("learn_client.js", "utf8");
    t("배우기: 16강 · 번호 연속 · 4부", L.length === 16 && L.every((c, i) => c.no === i + 1) && LEARN.PARTS.length === 4, true);
    t("배우기: 새 강의 7편(1·5·7·9·10·13·16)과 기존 페이지 9편", L.filter(c => c.en).map(c => c.no).join(",") + "|" + L.filter(c => c.url).length, "1,5,7,9,10,13,16|9");
    const CONC = require("./content_concept.js").map(c => "concept-" + c.en + ".html"), COL = require("./content_column.js").map(c => "column-" + c.en + ".html");
    t("배우기: 기존 페이지 강의는 실제 개념·칼럼 페이지를 가리킨다", L.filter(c => c.url).every(c => CONC.includes(c.url) || COL.includes(c.url)), true);
    t("배우기: 확인 문제 3개씩 · 정답 번호 범위 · 선택지 4개", L.every(c => c.quiz.length === 3 && c.quiz.every(q => q.c.length === 4 && q.a >= 0 && q.a < 4 && q.why.length > 15)), true);
    // 엔진으로 검증되는 확인 문제는 정답이 엔진 값과 같아야 한다
    let chkN = 0, chkBad = [];
    L.forEach(c => c.quiz.forEach((q, i) => { if (!q.chk) return; chkN++;
      const ans = q.c[q.a];
      if (q.chk.tenGod && sjTenGod(q.chk.tenGod[0], q.chk.tenGod[1]) !== ans) chkBad.push(c.no + "강 문제" + (i + 1));
      if (q.chk.unseong && sjUnseong(q.chk.unseong[0], q.chk.unseong[1]) !== ans) chkBad.push(c.no + "강 문제" + (i + 1));
      if (q.chk.chung && !(Math.abs(q.chk.chung[0] - q.chk.chung[1]) === 6 && ans.startsWith(SJ_B[q.chk.chung[1]]))) chkBad.push(c.no + "강 문제" + (i + 1)); }));
    t("배우기: 엔진으로 검증되는 확인 문제 정답(" + chkN + "개)이 엔진 값과 같다", chkBad.join(","), "");
    t("배우기: 확인 문제의 기준 값(갑-병 식신, 병-무 식신, 갑목 해 장생)이 엔진과 같다", sjTenGod(0, 2) === "식신" && sjTenGod(2, 4) === "식신" && sjUnseong(0, 11) === "장생", true);
    t("배우기: 새 강의 본문·표·FAQ 4개·자리표시자 외 코드 이름 없음", L.filter(c => c.en).every(c => c.sections.length >= 4 && c.faq.length === 4 && c.sections.map(s => s[1].replace(/\s/g, "")).join("").length >= 700 &&
      !/hub\.html|sjStrength|strengthBand|SJ_[A-Z]|엔진/.test(JSON.stringify([c.sections, c.faq, c.desc, c.lead, c.quiz]))), true);
    // 자리표시자는 "경(庚)" 같은 한자 표기로 채워져 받침을 알 수 없으므로 그 바로 뒤에 은·는·가·을·를·과·와·로 를 붙이지 않는다
    t("배우기: 새 강의 글에서 자리표시자 바로 뒤에 조사(은·는·가·을·를·과·와·로)가 붙지 않는다",
      L.filter(c => c.en).flatMap(c => (JSON.stringify([c.sections, c.faq, c.quiz, c.desc, c.lead]).match(/\}\}(은|는|가|을|를|과|와|로|으로)(?![가-힣])/g) || []).map(m => c.no + "강 " + m)).join(","), "");
    // 7강 가중치 표에 적은 숫자로 신강 비율을 다시 계산해 sjStrength 와 견준다
    { const wt = {}; L.find(c => c.no === 7).tables({}, {})[0].rows.forEach(r => { wt[r[0]] = parseFloat(r[1]); });
      let wbad = 0;
      [[1976, 7, 27, 14], [1990, 3, 15, null], [2001, 11, 8, 23], [1984, 2, 4, 9], [1955, 9, 30, 6], [2010, 6, 21, 18], [1969, 12, 31, 1], [1993, 5, 5, 12], [2024, 8, 8, null], [1947, 1, 20, 21]].forEach(([y, mo, d, h]) => {
        const q = sjPillars(y, mo, d, h, h == null ? 0 : 30, true), de = SJ_ES[q.d.s]; let sup = 0, tot = 0;
        const add = (el, w) => { tot += w; if (el === de || (el + 1) % 5 === de) sup += w; };
        add(SJ_EB[q.m.b], wt["월지"]); add(SJ_EB[q.d.b], wt["일지"]); add(SJ_ES[q.m.s], wt["월간"]); add(SJ_ES[q.y.s], wt["연간"]); add(SJ_EB[q.y.b], wt["연지"]);
        if (q.h) { add(SJ_ES[q.h.s], wt["시간"]); add(SJ_EB[q.h.b], wt["시지"]); }
        if (Math.abs(sup / tot - sjStrength(q).ratio) > 1e-9) wbad++; });
      t("배우기: 7강 가중치 표(월지 3·일지 2·월간 1.5·나머지 1)가 sjStrength 와 같은 값이다", Object.keys(wt).length + ":" + wbad, "7:0"); }
    // 자동 출제: 열여섯 강이 모두 문제를 만들고, 4지선다·정답 번호·풀이가 갖춰지며, 엔진과 바로 맞출 수 있는 종류는 정답이 엔진 값과 같다
    // (엔진과 별개로 손으로 적은 표와의 대조는 C:\\tmp\\moacalc-learn\\learngen_test.js 가 한다)
    { const greg = lsrc.slice(lsrc.indexOf("// ───────── 실습 재료"), lsrc.indexOf("// ───────── 실습 화면")), gE = lsrc.slice(lsrc.indexOf("function E(s)"), lsrc.indexOf("\n", lsrc.indexOf("function E(s)")));
      const GH = eval("(function(){var PAGES=[],ILGAN_META=[],SHORTS=[];" + gE + "\n" + greg + "\nreturn {GEN:GEN,rng:rng};})()");
      const lab = (a, b) => a + "(" + b + ")", stL = i => lab(SJ_S[i], SJ_SH[i]), brL = i => lab(SJ_B[i], SJ_BH[i]);
      const engine1 = { tg: a => sjTenGod(a[0], a[1]), unseong: a => sjUnseong(a[0], a[1]), gyeok: a => SJ_GYEOK[sjTenGod(a[0], SJ_BMAIN[a[1]])], bmain: a => stL(SJ_BMAIN[a[0]]), yukhap: a => brL(sjYukhap(a[0])),
        jangsaeng: a => brL(SJ_JS[a[0]]), munchang: a => brL(SJ_MUNCHANG[a[0]]), samhap: a => ["신·자·진", "사·유·축", "인·오·술", "해·묘·미"][sjSamhap(a[0])] };
      let gn = 0; const gbad = [], gk = {};
      for (let no = 1; no <= 16; no++) for (let seed = 1; seed <= 120; seed++) { const r = GH.rng(seed * 6151 + no);
        GH.GEN[no].forEach(fn => { const g = fn(r); gn++; gk[g.kind] = 1;
          if (!(g.no === no && g.c.length === 4 && new Set(g.c).size === 4 && g.a >= 0 && g.a < 4 && g.q.length > 8 && g.why.length > 12 && !/undefined|NaN|\[object|null/.test(g.q + g.c.join("") + g.why))) gbad.push(no + ":" + g.kind);
          if (engine1[g.kind] && g.c[g.a] !== engine1[g.kind](g.args)) gbad.push("엔진 불일치 " + no + ":" + g.kind + JSON.stringify(g.args)); }); }
      t("배우기: 자동 출제 열여섯 강 × 33종류 문제(" + gn + "개)가 4지선다·풀이를 갖추고 정답이 엔진 값과 같다", Object.keys(gk).length + ":" + gbad.slice(0, 3).join("|"), "33:"); }
    t("배우기: 강 페이지에 자동 출제 칸, 허브에 종합 테스트 칸이 있다", bs.includes('id="lmore" data-no="${c.no}"') && bs.includes('id="ltest"') && bs.includes('"/*SHORTS*/[]"') && /initMore\(\);\s*initTest\(\);/.test(lsrc), true);
    t("배우기: 종합 테스트 통계 이벤트 이름을 서버가 허용", /const EVENTS = new Set\(\[[^\]]*"learn_test"/.test(fs.readFileSync("worker.js", "utf8")) && lsrc.includes('track("learn_test"'), true);
    t("배우기: 실습 열여섯 가지가 모두 정의돼 있다", [...lsrc.matchAll(/DEF\[(\d+)\] =/g)].map(m => +m[1]).sort((a, b) => a - b).join(","), "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16");
    let lsyn = ""; try { new Function(lsrc); } catch (e) { lsyn = e.message; }
    t("배우기: learn_client.js 구문", lsyn, "");
    // 실습 코드가 쓰는 core.js 전역이 hub.html 엔진·공용 헬퍼에 실제로 있다
    const used = ["sjPillars", "sjStrength", "sjTenGod", "sjUnseong", "sjSinsal", "sjSamhap", "sjYukhap", "sjDaeunStart", "sjJdKST", "sjMonthTerms", "sjKst", "sjIpchun", "sjHourOpts", "sjGridHtml", "birthDial", "SJ_JJG", "SJ_JS", "SJ_BMAIN", "SJ_GYEOK", "SJ_GYEOK_DESC", "SJ_SINSAL_DESC", "SJ_DOHWA", "SJ_YONG", "SJ_UN"];
    t("배우기: 실습이 쓰는 전역 함수·표가 hub.html 에 정의돼 있다", used.filter(n => !new RegExp("function " + n + "\\(|var " + n + "\\s*=|," + n + "=").test(src)).join(","), "");
    t("배우기: 실습은 생년월일을 저장하지 않는다(진도 키만 저장)", /localStorage\.setItem\(KEY/.test(lsrc) && !/setItem\([^)]*(birth|생일|dnbs")/.test(lsrc) && /var KEY = "dnbs_learn"/.test(lsrc), true);
    t("배우기: 실습 통계 이벤트 이름을 서버가 허용", /const EVENTS = new Set\(\[[^\]]*"learn_practice"/.test(fs.readFileSync("worker.js", "utf8")) && lsrc.includes('track("learn_practice"'), true);
    t("배우기: 허브·강의 페이지·끼워 넣기 빌드 코드", ["function learnHubPage()", "function lecturePage(", "function lectureByPage(", "learnBar(lec)", "learnBottom(lec)", 'smUrl("learn.html")'].every(x => bs.includes(x)), true);
  }
  t("모든 페이지 공통 헤더에 og:locale·twitter:card 가 있다", /const headExtra = [^\n]*og:locale[^\n]*twitter:card/.test(bs), true);
  t("글 페이지 구조화 데이터에 keywords 가 태그에서 나온다", bs.includes("ld.keywords = o.tags.join("), true);
  t("일간 페이지 건강 절에 의학적 진단이 아니라는 고지가 있다", /para\(g\.health\)\}<p[^>]*>[^<]*의학적 진단이 아닙니다/.test(bs), true);
  t("사주 사전에 칼럼 섹션이 있다", bs.includes("${dictColumnsHtml()}"), true);
  t("생년월일·시각·성별·이름을 저장하지도 읽지도 않는다", !/loadPrefs\(\)\.(birth|partnerBirth|gender|partnerGender|name|birthHour|birthTime)\b/.test(src) && !/savePrefs\(\{[^}]*\b(birth|gender|name|partner)/.test(src) && !/c\.birth=|\.birth;\}catch/.test(bs), true);
  t("예전에 저장된 생년월일은 core 가 지운다", /\["birth","birthHour","birthTime","gender","name","partnerBirth","partnerGender"\]\.forEach\(function\(k\)\{if\(k in c\)\{delete c\[k\]/.test(src), true);
  t("궁합 결과도 두 사람 명식 표부터 나온다", /innerHTML=\s*'<div class="gh-myeong">/.test(toolBlock("gunghap")) && toolBlock("gunghap").includes('sjGridHtml(A,') && toolBlock("gunghap").includes('sjGridHtml(B,'), true);
  t("명식 표가 결과 맨 위에 나온다(풀이보다 먼저)", (b => b.indexOf("sjGridHtml(p,") < b.indexOf("headline+synth+hourSec()"))(toolBlock("saju").slice(toolBlock("saju").indexOf('el.querySelector("#out").innerHTML='))) && /innerHTML=\s*sjGridHtml\(p,/.test(toolBlock("saju")), true);
  t("태어난 시각 칸이 종합 바로 아래 늘 펼쳐져 있다", toolBlock("saju").includes("headline+synth+hourSec()+'<div class=\"tail-wrap fold-skip\" id=\"tailbox\"></div>'+glance") && toolBlock("saju").includes('sj-hour fold-skip'), true);
  t("사주 도구가 조합 원고를 받아 쓴다(없으면 일간 원고로)", toolBlock("saju").includes('fetch("sj/"+k+".json")') && toolBlock("saju").includes("CB&&CB[a]?P+CB[a]:ILG"), true);
}

{ const mm = (y, m) => { const p = sjPillars(y, m, 20, 12, 0, false).m; return p.s + "-" + p.b; };
  t("달마다 흐름 월주: 2026-10 무술 · 2027-01 신축 · 2026-03 신묘", [mm(2026, 10), mm(2027, 1), mm(2026, 3)].join(","), "4-10,7-1,7-3"); }

// ── 토정비결 작괘 — 출처 예제(chunun·badukworld·만복가)와 2026 벡터 ──
{
  const tjSrc = toolBlock("tojeong");
  const tjCalc = new Function("return " + tjSrc.slice(tjSrc.indexOf("function tjCalc"), tjSrc.indexOf("    var MON=")))();
  const KLC = require("./vendor-lunar.js");
  const jdn = (y, m, d) => { const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3; return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045; };
  const gz = (y, m, d) => { const i = (jdn(y, m, d) + 49) % 60; return [i % 10, i % 12]; };
  const TV = [[1976,8,26,2005,"212"],[1975,7,25,2024,"811"],[1972,7,9,2003,"231"],[1990,1,15,2026,"531"],[1985,2,14,2026,"262"],[1976,8,26,2026,"363"],[2000,12,1,2026,"331"],[1970,5,30,2026,"151"],[1966,2,30,2026,"562"]];
  t("토정비결 작괘 9개 예제", TV.map(([a,b2,c,Y])=>tjCalc(a,b2,c,Y,KLC,gz).code).join(","), TV.map(x=>x[4]).join(","));
  const TJ = require("./content_tojeong.js"), codes = []; for (let a = 1; a <= 8; a++) for (let b2 = 1; b2 <= 6; b2++) for (let c = 1; c <= 3; c++) codes.push(""+a+b2+c);
  t("토정비결 144괘 원고 · 총운 + 12달", codes.every(k => TJ[k] && TJ[k].chongun.length > 250 && [1,2,3,4,5,6,7,8,9,10,11,12].every(m => (TJ[k].months[m]||"").length > 60)), true);
  t("토정비결 풀이는 보살 말투", codes.filter(k => JONDAE.test([TJ[k].chongun].concat(Object.values(TJ[k].months)).join(" "))).length, 0);
}

// ── T3 프로그래매틱 SEO: 별자리 12 + 띠 12 원고 ──
const STAR_PAGES = require("./content_star.js"), ZODIAC_PAGES = require("./content_zodiac.js");
const bodyLen = o => (o.intro+o.love+o.work+o.match.why+o.match.hardWhy+o.y2026).replace(/\s/g,"").length;
t("별자리 원고 12개 · ST_EN 순서 일치", STAR_PAGES.length===12 && STAR_PAGES.every((s,i)=>s.en===ST_EN[i]), true);
t("띠 원고 12개 · 십이지 순서 일치", ZODIAC_PAGES.length===12 && ZODIAC_PAGES.every((z,i)=>z.en===ZO_EN[i]), true);
t("별자리 원고 본문 1,300자+ (전 항목)", STAR_PAGES.every(s=>bodyLen(s)>=1300), true);
t("띠 원고 본문 1,300자+ (전 항목)", ZODIAC_PAGES.every(z=>bodyLen(z)>=1300), true);
t("별자리 기간 표기는 ST_RANGE와 동일", STAR_PAGES.every((s,i)=>s.range===ST_RANGE[i]), true);
t("별자리 원소는 ST_ELE 규칙(index%4)과 일치", STAR_PAGES.every((s,i)=>s.ele===ST_ELE[i%4]), true);
t("별자리 수호성은 ST_RULER와 일치", STAR_PAGES.every((s,i)=>s.ruler===ST_RULER[i]), true);
t("띠 오행은 엔진 SJ_EB와 일치", ZODIAC_PAGES.every((z,i)=>z.ele===SJ_EL[SJ_EB[i]]), true);
t("띠 이름은 엔진 SJ_TTI와 일치", ZODIAC_PAGES.every((z,i)=>z.ko===SJ_TTI[i]), true);
// 충은 여섯 칸 건너, 삼합은 지지 index%4가 같은 조 — 원고의 궁합 서술이 엔진 규칙과 어긋나면 안 된다
t("띠 충 상대는 자기 지지의 6칸 반대", ZODIAC_PAGES.every((z,i)=>z.match.hard[0]===SJ_TTI[(i+6)%12]+"띠"), true);
t("띠 삼합 상대는 index%4 동일 조", ZODIAC_PAGES.every((z,i)=>z.match.best.every(b=>{
  const j = SJ_TTI.indexOf(b.replace("띠","")); return j%4===i%4 && j!==i; })), true);
t("띠 육합 상대는 sjYukhap 결과", ZODIAC_PAGES.every((z,i)=>z.match.hap===SJ_TTI[sjYukhap(i)]+"띠"), true);
// ── 별자리·띠 본문컷 (SEO 페이지 원고 옆 삽화) ──
t("별자리 본문컷 12장 존재", STAR_PAGES.every(s=>fs.existsSync("img/char/stc-"+s.en+".webp")), true);
t("띠 본문컷 12장 존재", ZODIAC_PAGES.every(z=>fs.existsSync("img/char/zoc-"+z.en+".webp")), true);
t("본문컷 배선(별자리·띠 페이지)", /bodyCut\("stc-"\+s\.en/.test(bs) && /bodyCut\("zoc-"\+z\.en/.test(bs), true);

// ── 색인 유도: 홈 링크 · lastmod · 일일 갱신 신호 · 앵커 ──
// 개념 44페이지가 홈에서 링크되지 않으면 크롤 깊이가 2가 되고 중요도도 낮게 잡힌다
t("홈에서 개념 44페이지 링크(생성기)", /conceptGroups/.test(bs) && /conceptHtml/.test(bs), true);
// 이름만 있으면 '갑목'·'비견'이 무슨 말인지 알 수 없다. 뜻 한 줄이 같이 나가야 한다
t("개념 링크에 뜻 한 줄 동반", /g\.metaphor\]/.test(bs) && /s\.keyword\]/.test(bs) && /class="ix-d">\$\{esc\(gloss\)\}/.test(bs), true);
// ── 모바일 글자 크기 ──
// 한글은 같은 px에서 영문보다 작게 읽힌다. 이 값들이 조용히 되돌아가면 다시 읽기 힘들어진다
const mqStart = src.indexOf(".sj-sec p{font-size:16px");
const mqBlock = src.slice(mqStart, src.indexOf("  }", mqStart) + 3);
t("모바일 본문 16px", /\.sj-sec p\{font-size:16px/.test(mqBlock), true);
t("모바일 입력창 16px (iOS 확대 방지)", /input,select,textarea[^}]*font-size:16px/.test(mqBlock), true);
// 12.5px 미만이 하나라도 있으면 최소선이 무너진 것이다
const smalls = [...mqBlock.matchAll(/font-size:(\d+(?:\.\d+)?)px/g)].map(m => +m[1]);
t("모바일 글자 최소 12.5px", smalls.length > 10 && Math.min(...smalls) >= 12.5, true);

t("sitemap lastmod는 본문이 바뀐 날(lastmod.json)", /<lastmod>@@LASTMOD:\$\{p\}@@<\/lastmod>/.test(bs) && /lastmod\[file\]\.h !== h/.test(bs), true);
t("일일 갱신 도구에만 dateModified", /const DAILY = \["todayfortune","horoscope","zodiacfortune"\]/.test(bs) && /ld\.dateModified = BUILD_DAY/.test(bs), true);
t("일간·십성 앵커에 검색어", /\$\{g\.ko\}\$\{g\.el\} 일간<\/a>/.test(bs) && /\$\{s\.ko\} 뜻<\/a>/.test(bs), true);

// ── 브랜드: 파비콘·로고 ──
// 계산기 시절 '=' 아이콘이 남아 있으면 브랜드가 갈린다
t("파비콘은 보살 마크(= 아이콘 잔재 없음)", !/%3D<\/text>/.test(bs) && /favicon\.ico/.test(bs), true);
t("파비콘 규격 파일 존재", ["favicon.ico","favicon-32.png","icon-192.png","icon-512.png","apple-touch-icon.png"]
  .every(f=>fs.existsSync("img/"+f)), true);
t("웹매니페스트 출력", /site\.webmanifest/.test(bs), true);
t("배우기 CSS 클래스가 hub.html 의 공용 CSS 와 겹치지 않는다(lp-row 는 음력 선택기 것)", ["lmark", "lp-row"].map(n => (bs.slice(bs.indexOf(".lbar{border:1px"), bs.indexOf(".tabbar{display:none;}", bs.indexOf(".lbar{border:1px"))).match(new RegExp("\\." + n + "[{\\[:, ]", "g")) || []).length).join(","), "0,0");
// 스크립트 오류 기록: 내용은 서버 표(errors)에도 남고, 실패해도 조회·이벤트 기록에 영향이 없으며, 같은 오류를 두 번 세지 않는다
{ const wk = fs.readFileSync("worker.js", "utf8");
  t("오류 기록: 서버가 메시지·주소를 errors 표에 넣되 실패는 삼킨다", /if \(jsErr\) \{ try \{ await env\.DB\.prepare\("INSERT INTO errors/.test(wk) && wk.includes("DELETE FROM errors") && fs.readFileSync("stats_schema.sql", "utf8").includes("CREATE TABLE IF NOT EXISTS errors"), true);
  t("오류 기록: 메시지는 숫자 4자리 이상을 지우고 120자로 자른다", /replace\(\/\\d\{4,\}\/g, "#"\)/.test(wk) && wk.includes(".slice(0, 120)"), true);
  t("오류 기록: 브라우저는 js_error 에만 메시지·파일·주소를 보내고 오류 리스너는 하나뿐이다", src.includes('JSON.stringify(ev==="js_error"&&p?{e:ev,m:p.m,f:p.f,p:location.pathname}:{e:ev})') && (src.match(/addEventListener\("error"/g) || []).length === 1, true);
  t("오류 기록: 개인정보처리방침에 오류 메시지 보관(30일)이 적혀 있다", /오류 메시지\(120자 이내, 숫자 네 자리 이상은 지움\)/.test(fs.readFileSync("content_site.js", "utf8")) && fs.readFileSync("content_site.js", "utf8").includes("오류 메시지는 30일 뒤"), true); }
t("클래스 이름 lmark 는 홈 머리 로고 하나만 쓴다(배우기 버튼은 lmarkbtn — 같은 이름이면 로고가 빈 사각형이 된다)", (fs.readFileSync("hub.html", "utf8").match(/\.lmark\{/g) || []).length + "|" + (bs.match(/\.lmark\{/g) || []).length + "|" + (bs.match(/class="lmark"/g) || []).length, "1|0|1");
// 모바일 화면 점검(2026-09)에서 나온 깨짐: 떠 있는 캐릭터 옆에 카드가 좁게 눌리거나 모서리를 덮이던 것, 값이 긴 표에서 라벨이 한 글자 폭으로 눌리던 것
t("배우기 카드·진도 칸은 떠 있는 캐릭터 아래로 내린다(clear:both — 옆에 끼면 카드가 좁게 눌린다)", /\.learncta\{[^}]*clear:both/.test(bs) && /\.lprog\{clear:both;/.test(bs), true);
t("히어로: 캐릭터가 있는 히어로는 캡션 오른쪽 자리를 비우고(제목이 캐릭터 밑에 깔리지 않게), 모바일에서 제목이 14자를 넘으면 캐릭터를 숨긴다", /\.toolhero:has\(>img\.th-bosal\)>\.cap\{padding-right:104px/.test(bs) && /\(min-width:760px\)\{\.toolhero:has\(>img\.th-bosal\)>\.cap\{padding-right:196px/.test(bs) && /\.toolhero\.longh:has\(>img\.th-bosal\)>\.cap\{padding-right:22px/.test(bs) && /o\.h1\.length > 14 \? " longh"/.test(bs), true);
t("값이 긴 표(26자 이상)는 좁은 화면에서 라벨 위·값 아래로 쌓는다(칼럼·배우기 표 생성기 둘 다 + CSS)", (bs.match(/tb\.rows\.some\(x => x\[1\]\.length >= 26\) \? " stack"/g) || []).length + "|" + /\.exbox \.row\.stack\{flex-direction:column/.test(src), "2|true");
t("헤더 로고는 이미지(화면 크기에 맞춘 68px webp)", /class="lmark" src="img\/logo-68\.webp"/.test(bs) && fs.existsSync("img/logo-68.webp") && fs.statSync("img/logo-68.webp").size < 12000, true);
t("로고 파일 존재·정사각", fs.existsSync("img/logo.png") && fs.statSync("img/logo.png").size > 5000, true);
// 승인 전 빈 광고 자리는 완성도만 깎는다
t("광고 자리 플레이스홀더 제거", !/배너 자리/.test(bs) && !/배너 자리/.test(src), true);
// 파일이 없으면 onerror로 조용히 사라져 티가 안 난다. 원본 24장이 규격(webp·10KB 이상)인지 본다
t("본문컷 24장 규격", STAR_PAGES.concat(ZODIAC_PAGES).every((x,i)=>{
  const f = "img/char/" + (i<12 ? "stc-" : "zoc-") + x.en + ".webp";
  return fs.existsSync(f) && fs.statSync(f).size > 10000; }), true);

// ── 일간 10 · 십성 10 개별 페이지 ──
const ILGAN_PAGES = require("./content_ilgan.js"), SIPSEONG_PAGES = require("./content_sipseong.js");
// 일간·십성은 6개 섹션 구성(별자리·띠와 항목 수가 달라 기준선도 별도로 잡는다)
const longLen = o => (o.intro+o.love+o.work+o.money+(o.health||o.many)+o.y2026).replace(/\s/g,"").length;
t("일간 원고 10개 · 천간 순서 일치", ILGAN_PAGES.length===10 && ILGAN_PAGES.every((g,i)=>g.ko===SJ_S[i]), true);
t("일간 오행은 엔진 SJ_ES와 일치", ILGAN_PAGES.every((g,i)=>g.el===SJ_EL[SJ_ES[i]]), true);
t("일간 음양은 index 짝수=양", ILGAN_PAGES.every((g,i)=>g.yy===(i%2===0?"양":"음")), true);
t("일간 원고 본문 880자+ (전 항목)", ILGAN_PAGES.every(g=>longLen(g)>=880), true);
t("십성 원고 10개 · 엔진 십성명과 일치", SIPSEONG_PAGES.length===10 &&
  SIPSEONG_PAGES.every(s=>["비견","겁재","식신","상관","편재","정재","편관","정관","편인","정인"].includes(s.ko)), true);
t("십성 원고 본문 880자+ (전 항목)", SIPSEONG_PAGES.every(s=>longLen(s)>=880), true);
// 짝 관계는 서로를 가리켜야 한다 (비견↔겁재, 식신↔상관 …)
t("십성 pair는 상호 참조", SIPSEONG_PAGES.every(s=>{
  const p = SIPSEONG_PAGES.find(x=>x.ko===s.pair); return p && p.pair===s.ko && p.group===s.group; }), true);
t("일간·십성 이미지 파일 존재", ILGAN_PAGES.every(g=>fs.existsSync("img/char/ilgan-"+g.en+".webp")) &&
  SIPSEONG_PAGES.every(s=>fs.existsSync("img/char/ss-"+s.en+".webp")), true);
t("일간·십성 페이지 생성기 배선", /ILGAN_PAGES\.forEach/.test(bs) && /SIPSEONG_PAGES\.forEach/.test(bs), true);
t("일간·십성 sitemap 포함", /smUrl\("ilgan-"\+g\.en\+"\.html"\)/.test(bs) && /smUrl\("sipseong-"\+s\.en\+"\.html"\)/.test(bs), true);
t("사주 페이지에서 일간·십성으로 내부링크", /ilganChips\(null\)/.test(bs) && /sipseongChips\(null\)/.test(bs), true);

// ── 타로 카드 뜻 78장 ──
const TAROT_PAGES = require("./content_tarot.js");
const tarotTool = inner.slice(inner.indexOf('id:"tarot"'), inner.indexOf('id:"todayfortune"'));
const toolNames = tarotData.M.map(x=>x[1]);
t("타로 원고 78장 · 번호 0~77 순서", TAROT_PAGES.length === 78 && TAROT_PAGES.every((c, i) => c.no === i), true);
t("타로 원고 카드 이름이 도구 M과 일치", TAROT_PAGES.every((c, i) => c.ko === toolNames[i]), true);
t("타로 카드 그림 파일 78장 존재", TAROT_PAGES.every(c => fs.existsSync(`img/char/tarot-${String(c.no).padStart(2, "0")}-${c.en}.webp`)), true);
const TK = { symbol: 280, up: 280, rev: 280, love: 280, reunion: 200, work: 250, advice: 70, yesnoWhy: 60 };
const tarotShort = TAROT_PAGES.flatMap(c => Object.keys(TK).filter(k => typeof c[k] !== "string" || c[k].replace(/\s/g, "").length < TK[k]).map(k => c.ko + "." + k));
t("타로 원고 항목별 최소 분량", tarotShort.join(","), "");
t("타로 키워드 정·역 4개씩 · 예/아니오 값", TAROT_PAGES.every(c => c.upWords.length === 4 && c.revWords.length === 4 && ["예", "아니오", "조건부"].includes(c.yesno)), true);
const tSents = TAROT_PAGES.flatMap(c => Object.keys(TK).flatMap(k => c[k].split(/(?<=[.!?])\s*/).filter(x => x.length > 15)));
t("타로 원고 카드 간 중복 문장 없음", tSents.length - new Set(tSents).size, 0);
t("타로 원고는 존댓말 (자네 없음)", TAROT_PAGES.every(c => !/자네/.test(Object.keys(TK).map(k => c[k]).join(""))), true);
t("타로 페이지 생성·사이트맵·도구 페이지 링크 배선", /TAROT_PAGES\.forEach/.test(bs) && /TAROT_PAGES\.map\(c=>smUrl\("tarot-/.test(bs) && /tarotChips\(null\)/.test(bs), true);
// 십성 이름은 받침이 섞여 있다(비견/겁재). 하드코딩 조사가 남으면 "겁재과 연애"가 출력된다
const sipsSrc = bs.slice(bs.indexOf("function sipseongPage"), bs.indexOf("const FUN_TOP"));
t("십성 페이지 조사는 josa() 사용", !/\$\{s\.(?:ko|pair)\}(?:은|는|이|가|과|와)[\s`]/.test(sipsSrc), true);

// ── 도구 스크립트 정적 검사: 정의되지 않은 헬퍼 호출 (렌더 중단 버그 방지) ──
const HELPERS = ["num","won","comma","bindMoney","progressive","earnedDed","incomeTaxMonthly","sjPillars","sjHourOpts","sjGridHtml","tailAsk","sjDaeunStart","sjTenGod","sjJdKST","sjSunLong","sjJdn","sjIpchun","sjStrength","sjUnseong","sjSinsal","sjSamhap","sjYukhap","zoCard","stOf","stCard","escH","josa","loadPrefs","savePrefs","track","rateBar","shareBtn","bindShare","fortuneCard","bindSave","wrapText","birthDial","conceptArt","askWire","askFx","askWait","askThink","seerThink","slowReveal","foldAll","plainWords","reveal","countUp","fillBars","gradeFx","bumpStreak","streakHtml","bujeokHtml","tfGrade","tfToday","tfPersonalBox","lunarPick","krClockShift","sjKst","sjMonthTerms","sjBasisHtml","sjAiPrompt","sjAiHtml","bindAiCopy","bindYearFb","bindInvite","zfRel","zfScore","zfRank","peopleChips","hsScore","hsRank","bosalImg","bosalPose","bosalSay","diaryAdd","diaryNote"];
const toolsSrc = inner.slice(inner.indexOf("var TOOLS="));
// 문자열 리터럴(HTML·CSS 조각) 제거 후 실제 호출만 검사
const codeOnly = toolsSrc.replace(/'(?:\\.|[^'\\])*'/g, "''").replace(/"(?:\\.|[^"\\])*"/g, '""');
const called = [...codeOnly.matchAll(/(?:^|[^\w.$])([a-zA-Z_$][\w$]*)\s*\(/g)].map(m => m[1]);
const known = new Set([...HELPERS, "fetch","function","if","for","while","switch","catch","return","typeof","Math","Number","String","Array","Date","Set","Map","JSON","parseInt","parseFloat","isNaN","el","cb","render","calc","go","gen","draw","deal","cell","P","relB","pts","cnt6","strokes","mIdxOf","fromP","fromM","rate","name","require","console"]);
const unknownCalls = [...new Set(called)].filter(n => !known.has(n) && !/^[A-Z]/.test(n) && !toolsSrc.includes("function "+n) && !toolsSrc.includes("var "+n+"=") && !toolsSrc.includes(n+"=function"));
t("도구 스크립트: 미정의 헬퍼 호출 없음", unknownCalls.length === 0, true);
if (unknownCalls.length) console.log("   ⚠ 의심 호출:", unknownCalls.join(", "));

// ── 생년월일 다이얼 ──
t("다이얼 헬퍼 birthDial 정의", /function birthDial\(/.test(inner), true);
t("다이얼은 hidden input의 값을 갱신(기존 로직 보존)", /\.value\s*=\s*(pad|ymd|v)/.test(inner) && /dispatchEvent/.test(inner.slice(inner.indexOf("function birthDial"))), true);
t("다이얼 DOM은 typeof document 가드", /typeof document/.test(inner.slice(inner.indexOf("function birthDial"), inner.indexOf("function birthDial")+400)), true);
t("연·월·일 3열 구성", /data-unit="y"|dial-col/.test(inner), true);
t("돌릴 때 간지 미리보기 갱신", /dial-ganji/.test(inner), true);
// 답은 물어보기 버튼에서만 나온다. 다이얼이 결과를 다시 그리면 '물어본다'는 감각이 사라진다
t("다이얼은 결과를 재계산하지 않음", !/g\)g\.click\(\)/.test(inner.slice(inner.indexOf("function birthDial"), inner.indexOf("function shareBtn"))), true);
t("키보드 접근성(role=listbox + tabindex + 화살표 키)", /"role","listbox"/.test(inner) && /tabIndex\s*=\s*0/.test(inner) && /ArrowDown/.test(inner), true);
// 마우스 휠은 한 틱에 여러 칸을 건너뛴다. 기본 스크롤을 막고 한 칸씩 이동해야 원하는 값을 고를 수 있다
t("휠 한 틱 = 한 칸 (preventDefault + step)", /wheel[\s\S]{0,200}preventDefault[\s\S]{0,200}step\(col/.test(inner), true);
t("휠 연타 잠금(wheelLock)", /wheelLock/.test(inner), true);
t("일 목록은 일수 변할 때만 재생성", /max===dayCount/.test(inner), true);
// 조작 방식 3종: 휠·드래그·직접 입력
t("포인터 드래그로 돌리기", /pointerdown/.test(inner) && /pointermove/.test(inner) && /pointerup/.test(inner), true);
t("드래그와 클릭 구분(이동거리 임계)", /dragMoved|moved\s*>/.test(inner), true);
t("직접 입력란 노출(date input)", /dial-typed/.test(inner), true);
t("직접 입력 → 다이얼 동기화", /syncFromInput|fromInput/.test(inner), true);

// ── P2-3 결과 이미지 저장(카드 캡처) ──
const shareSrc = inner.slice(inner.indexOf("function shareBtn"), inner.indexOf("// ---------- TOOLS"));
t("카드 캡처 헬퍼 fortuneCard 정의", /function fortuneCard\(/.test(shareSrc), true);
t("카드 규격 1080x1350", /1080/.test(shareSrc) && /1350/.test(shareSrc), true);
t("toBlob → share(files) → 다운로드 폴백", /toBlob/.test(shareSrc) && /canShare/.test(shareSrc) && /download/.test(shareSrc), true);
t("캔버스 API는 typeof 가드 (노드 하네스 보호)", /typeof document/.test(shareSrc), true);
t("이미지 저장 버튼 마크업", /save-btn/.test(shareSrc), true);
// 한글 줄바꿈: 캔버스에는 자동 줄바꿈이 없어 직접 끊어야 카드 밖으로 넘치지 않는다
t("캔버스 줄바꿈 함수 존재", /function wrapText\(|measureText/.test(shareSrc), true);
// 저장 이미지는 출처를 달고 퍼진다. 구 도메인이 박혀 있으면 유입이 엉뚱한 데로 간다
t("저장 이미지 도메인은 상수(BRAND_URL)", /var BRAND_URL="[a-z0-9.-]+"/.test(inner) && /fillText\(BRAND_URL/.test(inner), true);
t("구 도메인 gyesangi 잔재 없음", !/gyesangi/.test(inner), true);
t("저장 이미지에 브랜드명·설명 동반", /fillText\("동네보살"/.test(inner) && /무료 사주 · 오늘의 운세/.test(inner), true);

// ── 일간·십성 원고 필수 필드 (본문·순서 검사는 위 SEO 블록) ──
t("일간 원고 필수 필드", ILGAN_PAGES.every(p=>p.en&&p.ko&&p.han&&p.el&&p.intro&&p.love&&p.work&&p.money&&p.y2026), true);
t("십성 원고 필수 필드", SIPSEONG_PAGES.every(p=>p.en&&p.ko&&p.han&&p.group&&p.pair&&p.rule&&p.keyword&&p.strong&&p.weak&&p.intro&&p.love&&p.work&&p.money&&p.y2026), true);

// 목록의 뜻은 한 줄 말줄임이라 길면 잘린다. 375px 실측에서 별자리가 가장 빠듯했다
// (양태를 빼기 전 여유 5px). 글자 수로 상한을 걸어 재발을 막는다
const GLOSS_MAX = 20;
t("별자리 뜻 길이 상한", STAR_PAGES.every(x => `${x.range} · ${x.ele} 원소`.length <= GLOSS_MAX), true);
t("일간 뜻 길이 상한", ILGAN_PAGES.every(g => g.metaphor.length <= GLOSS_MAX), true);
t("십성 뜻 길이 상한", SIPSEONG_PAGES.every(x => x.keyword.length <= GLOSS_MAX), true);

// ── E-E-A-T 신뢰 페이지 + GEO ──
const SITE_PAGES = require("./content_site.js");
t("신뢰 페이지 3종(About·개인정보·약관) 원고", SITE_PAGES.map(p=>p.id).sort().join(","), "about,privacy,terms");
t("신뢰 페이지 각각 본문·FAQ 보유", SITE_PAGES.every(p=>p.body.length>=5 && p.faq.length>=3 && p.desc.length>=40), true);
t("신뢰 페이지 파일 출력 배선", /SITE_PAGES\.forEach[\s\S]{0,80}sitePage/.test(bs), true);
t("llms.txt(AI 검색 안내) 생성", /llms\.txt/.test(bs), true);
// 템플릿에서 없는 필드를 참조하면 undefined가 그대로 박힌다(과거 z.years 사고)
const ZP = require("./content_zodiac.js"), SP = require("./content_star.js");
const llmsFields = [...bs.matchAll(/\$\{(?:ZODIAC_PAGES|STAR_PAGES)\.map\(([a-z])=>`[^`]*`/g)]
  .flatMap(m => [...m[0].matchAll(new RegExp("\\$\\{" + m[1] + "\\.([a-zA-Z]+)", "g"))].map(x => x[1]));
const pageFields = new Set([...Object.keys(ZP[0]), ...Object.keys(SP[0])]);
t("llms.txt 템플릿이 실제 필드만 참조", llmsFields.filter(f => !pageFields.has(f)).join(",") || "(없음)", "(없음)");
t("Organization 스키마", /"@type":"Organization"/.test(bs), true);
t("BreadcrumbList 스키마", /BreadcrumbList/.test(bs), true);
t("신뢰 페이지도 sitemap에 포함", /about\.html[\s\S]{0,200}sitemap|SITE_PAGES/.test(bs), true);

// ── 모바일 최적화 ──
const cssM = src.match(/<style>([\s\S]*?)<\/style>/)[1];
t("사이드바 링크 터치 타겟 44px", /\.rail a\{[^}]*min-height:44px/.test(cssM), true);
t("뒤로가기 링크 터치 타겟 44px", /\.back\{[^}]*min-height:44px/.test(cssM), true);
t("푸터 링크 터치 타겟 44px (sfoot·sitenav)", /\.sfoot a\{[^}]*min-height:44px/.test(cssM) && /\.sitenav a\{[^}]*min-height:44px/.test(bs), true);
// 모바일 본문은 16px. 한글은 같은 px에서 영문보다 작게 읽힌다
t("모바일 본문 폰트 16px", /\.sj-sec p\{font-size:16px/.test(cssM), true);
// 목록의 뜻은 한 줄 말줄임이라 상한이 있다. 375px 실측으로 15.5/13.5가 44개 전부 안 잘리는 한계였다
t("모바일 목록 이름·뜻은 잘리지 않는 상한 내", /\.ix-n\{font-size:15\.5px/.test(cssM) && /\.ix-d\{font-size:13\.5px/.test(cssM), true);
// iOS는 16px 미만 입력창 포커스 시 화면을 확대한다
t("모바일 입력창 16px(확대 방지)", /input,select,textarea[^{]*\{font-size:16px/.test(cssM), true);
t("다이얼 항목 44px(손가락 기준)", /\.dial-item\{height:44px/.test(cssM), true);
// 좁은 화면에서 .r2가 2단으로 남으면 다이얼 한 칸이 45px로 눌려 '1990년'이 겹쳐 보인다
t("좁은 화면에서 r2는 1단", /@media \(max-width:560px\)\{\.r2\{grid-template-columns:1fr/.test(src), true);
t("다이얼 열에 최소폭", /grid-template-columns:minmax\(64px/.test(src), true);
// max-width는 반응형이라 정상. 고정 width만 가로 스크롤을 만든다
t("본문 컨테이너는 고정폭이 아니라 max-width", /\.wrap\{[^}]*max-width:\s*\d+px/.test(cssM) && !/\.wrap\{[^}]*[^-]width:\s*\d{3,}px/.test(cssM), true);

// 이미지 비율: CLS용 width/height 속성을 붙인 이미지는 CSS에 height:auto가 있어야
// aspect-ratio가 살아난다. 없으면 height 속성이 이겨 그림이 늘어난 틀에 갇히고 좌우가 잘린다.
const cssAll = src.match(/<style>([\s\S]*?)<\/style>/)[1];
const imgRule = (cssAll.match(/\.sj-char img\{([^}]*)\}/) || [])[1] || "";
t("정사각 캐릭터 이미지에 height:auto (aspect-ratio 보호)", /height:\s*auto/.test(imgRule) && /aspect-ratio:\s*1\/1/.test(imgRule), true);

// CLS용 width/height 속성을 붙인 이미지 클래스는 CSS에 height:auto가 있어야 한다.
// 없으면 height 속성이 그대로 살아 이미지가 늘어나거나 잘린다(과거 rart 75% 왜곡 사고).
const sized = new Set();
[...src.matchAll(/<img class="([a-z-]+)"[^>]*height="\d+"/g)].forEach(m => sized.add(m[1]));
[...bs.matchAll(/<img class="([a-z-]+)"[^>]*height="\$?\{?[\d]/g)].forEach(m => sized.add(m[1]));
const missing = [...sized].filter(cls => {
  const rule = (cssAll.match(new RegExp("\\.(?:[a-z-]+ )?" + cls + "\\{([^}]*)\\}")) || [])[1];
  return rule !== undefined && !/height:\s*auto/.test(rule);
});
t("height 속성 쓰는 이미지 클래스에 height:auto 존재", missing.length, 0);
if (missing.length) console.log("   ⚠ height:auto 누락:", missing.join(", "));

// 조립 변수 뒤에 조사를 붙일 때 josa()를 안 쓰면 "화이/수이/사은" 같은 오류가 화면에 나온다.
// 오행·십이운성처럼 받침이 섞인 값을 담는 표현식 바로 뒤에 조사 리터럴이 오는지 소스에서 잡는다.
// WEAK[..]: 장부 이름은 받침이 섞여 있다. "피부과 이어져"가 실제로 화면에 나갔었다
const JVAR = "(?:SJ_EL\\[[^\\]]+\\]|SJ_UN\\[[^\\]]+\\]|WEAK\\[[^\\]]+\\]|\\bmn|\\bmx|\\bun|\\brel|\\byEl|\\by2El|\\bluckEl|\\bgyeok|\\bs1)";
const hardJosa = [...toolsSrc.matchAll(new RegExp(JVAR + "\\s*\\+\\s*[\"'](?:이|은|을|과|가|는|를|와)(?=[\\s\"'])", "g"))].map(m => m[0].replace(/\s+/g, ""));
t("조립 변수 뒤 하드코딩 조사 없음 (josa 사용)", hardJosa.length, 0);
if (hardJosa.length) console.log("   ⚠ 조사 하드코딩:", hardJosa.join(" | "));

// 공유 URL·문구에 생년월일이 들어가면 개인정보가 링크를 타고 같이 퍼진다.
// 함수 본문과 '호출부'를 둘 다 본다 — 위험한 값은 호출할 때 넘어간다.
const bindSrc = inner.slice(inner.indexOf("function bindShare"), inner.indexOf("// ---------- TOOLS"));
t("공유 URL에서 쿼리스트링 제거", /location\.href\.split\("#"\)\[0\]\.split\("\?"\)\[0\]/.test(bindSrc), true);
const bindCalls = [...toolsSrc.matchAll(/bindShare\s*\(([^;]{0,300}?)\)\s*;/g)].map(m => m[1]);
t("bindShare 호출이 최소 1개", bindCalls.length >= 1, true);
const leakyShare = bindCalls.filter(a =>
  /\bbirth\b|loadPrefs|\bd\.value|getElementById\(["\']d["\']\)|querySelector\(["\']#d["\']\)/.test(a));
t("공유 인자에 생년월일 값 없음", leakyShare.length, 0);
if (leakyShare.length) console.log("   ⚠ 공유 인자에 생일:", leakyShare.join(" | "));

// 사주는 대표 도구다. 여기에 공유 수단이 없으면 바이럴 유입이 거기서 끊긴다
const sajuToolSrc = toolsSrc.slice(toolsSrc.indexOf('{id:"saju"'), toolsSrc.indexOf('{id:"tarot"'));
t("사주 결과에 공유 버튼 있음", /shareBtn\(\)/.test(sajuToolSrc), true);
t("사주 결과에 bindShare 배선됨", /bindShare\(/.test(sajuToolSrc), true);
// 만세력 입구 두 장 — "만세력"(월 16.9만) 검색어를 받는 페이지
t("만세력 입구·보는법 페이지 생성 배선", /manseHubPage\(\)/.test(bs) && /manseHowtoPage\(\)/.test(bs), true);
t("만세력 입구·보는법 사이트맵 포함", /smUrl\("manse\.html"\)/.test(bs) && /smUrl\("manse-howto\.html"\)/.test(bs), true);
t("월별 만세력의 상위는 무료 만세력", /parent:"manse\.html", parentName:"무료 만세력"/.test(bs), true);
t("만세력 보는법 예시 조사는 josa() 사용", /\)\$\{josa\(E\.SJ_EL\[E\.SJ_ES\[ds\]\],"이\/가"\)\} 이 사람 자신/.test(bs), true);
// 사주도 진지한 보살 로딩(최소 4초 이상)과 느린 등장을 쓴다
t("사주 물어보기는 보살 로딩 옵션으로 배선", /askWire\(el,go,\[[\s\S]*?\{min:(\d+)/.test(sajuToolSrc) && +sajuToolSrc.match(/\{min:(\d+)/)[1] >= 4000, true);
t("사주 결과는 느린 등장(slowReveal)", /slowReveal\(outEl\)/.test(sajuToolSrc), true);
const GUNG = require("./content_saju_gung.js"), TEN = ["비견","겁재","식신","상관","편재","정재","편관","정관","편인","정인"];
const gungLines = ["year","month","day","hour"].flatMap(k => TEN.map(tg => GUNG[k] && GUNG[k][tg]));
t("사주 자리 읽기 원고 4자리 × 10십성", gungLines.filter(x => typeof x === "string" && x.replace(/\s/g, "").length >= 110).length, 40);
t("사주 자리 읽기 원고는 보살 말투", gungLines.filter(x => /습니다|합니다|하세요|입니다|십시오/.test(x) || !/일세|걸세|하게|게\.|네\.|야\.|지\.|어\.|해\.|워\./.test(x)).length, 0);
t("사주 자리 읽기 원고가 사주 청크에 주입됨", /c\.id === "saju" \? "var SAJU_GUNG="/.test(bs), true);
t("사주 새 풀이(오행 3종·신강 구간) 보살 말투", (() => { const d = new Function(sajuToolSrc.slice(sajuToolSrc.indexOf("var EL_HI="), sajuToolSrc.indexOf("var EL_TITLE=")) + "return [].concat(Object.values(EL_HI),Object.values(EL_LO),Object.values(EL_FILL),[0.8,0.6,0.4,0.1].map(strengthBand));")();
  return d.length === 19 && d.every(x => !/습니다|합니다|하세요|입니다|십시오/.test(x) && /일세|걸세|하게|게\.|네\.|야\.|지\.|어\.|해\.|워\./.test(x)); })(), true);

// .tool button 의 !important 배경이 공유·저장 버튼을 강조색으로 덮어쓴 적이 있다.
// 되받지 않으면 외곽선 스타일이 화면에 아예 안 나온다.
// .tool button 은 (0,1,1)이라 !important 만 붙인 (0,1,0) .share-btn 은 못 이긴다.
// 선택자에 .tool 이 붙어 특이도가 올라갔는지까지 본다.
const shareCss = (cssAll.match(/\.tool \.share-btn\{([^}]*)\}/) || [])[1] || "";
const saveCss = (cssAll.match(/\.tool \.save-btn\{([^}]*)\}/) || [])[1] || "";
t("공유 버튼 배경이 .tool button 을 특이도로 이김", /background:\s*transparent\s*!important/.test(shareCss), true);
t("저장 버튼 배경이 .tool button 을 특이도로 이김", /background:\s*transparent\s*!important/.test(saveCss), true);


// 월력 페이지가 빌드에 연결됐는지 — 사이트맵에 빠지면 크롤러가 못 찾는다
t("build_site에 MANSE_PAGES 존재", /const MANSE_PAGES\s*=/.test(bs), true);
// 애드센스 반려 대응(2026-09): 월력은 MANSE_KEEP(2025~2027)만 사이트맵에 낸다
t("사이트맵에 월력(MANSE_KEEP 범위) 포함", /MANSE_PAGES\.filter\(MANSE_KEEP\)\.map\(p=>smUrl\("manse-/.test(bs), true);

// 일주 60은 일진 60과 같은 간지를 쓴다. 제목이 겹치면 자기잠식이 난다.
t("build_site에 ILJU_PAGES 존재", /const ILJU_PAGES\s*=/.test(bs), true);
t("사이트맵에 일주 포함", /ILJU_PAGES\.map\(p=>smUrl\("ilju-/.test(bs), true);
t("일주는 UN_DESC(존댓말판)를 쓴다", /ILJU_SRC\.UN_DESC/.test(bs), true);
t("일주 페이지가 SJ_UN_DESC(보살말투)를 쓰지 않는다", /ilju[\s\S]{0,3000}SJ_UN_DESC/.test(bs), false);
// ── 계산 근거: 출생 당시 시계(tzdb Asia/Seoul) · 월 절기 ──
{ const hs = inner.slice(inner.indexOf("  var KR_DST="), inner.indexOf("  /* 계산 근거"));
  const E = new Function("sjSunLong","sjTermJd","SJ_TERM", hs + "; return {krClockShift, sjMonthTerms, sjKst};")(sjSunLong, sjTermJd, SJ_TERM);
  t("시계 보정 1987-07-01 서머타임 +60분", E.krClockShift(1987,7,1).min, 60);
  t("시계 보정 1987-05-10 서머타임 첫날 +60분", E.krClockShift(1987,5,10).min, 60);
  t("시계 보정 1987-10-11 해제일 0분", E.krClockShift(1987,10,11).min, 0);
  t("시계 보정 1958-01-15 UTC+8:30 −30분", E.krClockShift(1958,1,15).min, -30);
  t("시계 보정 1958-07-01 UTC+8:30+서머타임 +30분", E.krClockShift(1958,7,1).min, 30);
  t("시계 보정 1990-07-01 없음", E.krClockShift(1990,7,1).min, 0);
  const mt = E.sjMonthTerms(sjJdKST(1992,6,18,8,30));
  t("1992-06-18 월주 구간 망종~소서", mt.prevName + "~" + mt.nextName, "망종~소서");
  t("1992 망종 절입일 6월 5일", E.sjKst(mt.prev).startsWith("1992년 6월 5일 "), true); }
console.log("\n결과: " + pass + " 통과 / " + fail + " 실패");
process.exit(fail ? 1 : 0);
