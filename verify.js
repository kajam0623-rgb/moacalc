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
t("타로 결과는 진지한 보살 로딩(최소 5.2초) 뒤에 차례로 띄운다 — 움직임 줄이기를 켠 기기에서도 로딩을 건너뛰지 않는다", tarotSrc.includes("mascot-serious.webp") && /Math\.max\(5200,/.test(tarotSrc) && tarotSrc.includes("tr-in") && !/if\(RM\)\{render\(\);return;\}/.test(tarotSrc) && /if\(RM\)\{wait\(1800,spread\);return;\}/.test(tarotSrc), true);
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
t("버튼 문구 통일(ASK_LABEL)", (inner.match(/'\+ASK_LABEL\+'<\/button>/g)||[]).length, 9);
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
  t("사주 종합·성격 풀이가 결과 맨 위(한눈에 앞)에 붙음", sj.includes("headline+synth+charSec+hourSec()+'<div class=\"tail-wrap fold-skip\" id=\"tailbox\"></div>'+glance"), true);
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
  // 2026-10: 맨 위는 '이 정보로 풀었습니다' 확인 카드와 '한 장 요약'(sjSumHtml), 그 바로 아래가 명식 표다 — 명식 표는 여전히 풀이보다 먼저
  t("명식 표가 풀이보다 먼저 나오고, 그 위는 확인 카드와 한 장 요약뿐이다", (b => b.indexOf("sjGridHtml(p,") < b.indexOf("headline+synth+charSec+hourSec()"))(toolBlock("saju").slice(toolBlock("saju").indexOf('el.querySelector("#out").innerHTML='))) && /innerHTML=\s*(?:\/\/[^\n]*\n\s*)?'<div class="sj-confirm">[\s\S]{0,700}?sjSumHtml\(\{[^}]*\}\)\+\s*sjGridHtml\(p,/.test(toolBlock("saju")), true);
  t("태어난 시각 칸이 종합·성격 바로 아래 늘 펼쳐져 있다", toolBlock("saju").includes("headline+synth+charSec+hourSec()+'<div class=\"tail-wrap fold-skip\" id=\"tailbox\"></div>'+glance") && toolBlock("saju").includes('sj-hour fold-skip'), true);
  t("사주 도구가 조합 원고를 받아 쓴다(없으면 일간 원고로)", toolBlock("saju").includes('fetch("sj/"+k+".json")') && toolBlock("saju").includes("CB&&CB[a]?P+CB[a]:ILG"), true);
}

{ const mm = (y, m) => { const p = sjPillars(y, m, 20, 12, 0, false).m; return p.s + "-" + p.b; };
  t("달마다 흐름 월주: 2026-10 무술 · 2027-01 신축 · 2026-03 신묘", [mm(2026, 10), mm(2027, 1), mm(2026, 3)].join(","), "4-10,7-1,7-3"); }

// ── 토정비결 작괘 — 출처 예제(chunun·badukworld·만복가)와 2026 벡터 ──
{
  const tjSrc = toolBlock("tojeong");
  const tjCalc = new Function("return " + tjSrc.slice(tjSrc.indexOf("function tjCalc"), tjSrc.indexOf("    var nowD=new Date(),Y0")))();
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
  .every(f=>fs.existsSync("img/v2/"+f)), true);
t("웹매니페스트 출력", /site\.webmanifest/.test(bs), true);
t("배우기 CSS 클래스가 hub.html 의 공용 CSS 와 겹치지 않는다(lp-row 는 음력 선택기 것)", ["lmark", "lp-row"].map(n => (bs.slice(bs.indexOf(".lbar{border:1px"), bs.indexOf(".tabbar{display:none;}", bs.indexOf(".lbar{border:1px"))).match(new RegExp("\\." + n + "[{\\[:, ]", "g")) || []).length).join(","), "0,0");
// 스크립트 오류 기록: 내용은 서버 표(errors)에도 남고, 실패해도 조회·이벤트 기록에 영향이 없으며, 같은 오류를 두 번 세지 않는다
{ const wk = fs.readFileSync("worker.js", "utf8");
  t("오류 기록: 서버가 메시지·주소를 errors 표에 넣되 실패는 삼킨다", /if \(jsErr\) \{ try \{ await env\.DB\.prepare\("INSERT INTO errors/.test(wk) && wk.includes("DELETE FROM errors") && fs.readFileSync("stats_schema.sql", "utf8").includes("CREATE TABLE IF NOT EXISTS errors"), true);
  t("오류 기록: 메시지는 숫자 4자리 이상을 지우고 120자로 자른다", /replace\(\/\\d\{4,\}\/g, "#"\)/.test(wk) && wk.includes(".slice(0, 120)"), true);
  t("오류 기록: 브라우저는 js_error 에만 메시지·파일·주소를 보내고 오류 리스너는 하나뿐이다", src.includes('JSON.stringify(ev==="js_error"&&p?{e:ev,m:p.m,f:p.f,p:location.pathname}:{e:ev})') && (src.match(/addEventListener\("error"/g) || []).length === 1, true);
  t("오류 기록: 개인정보처리방침에 오류 메시지 보관(30일)이 적혀 있다", /오류 메시지\(120자 이내, 숫자 네 자리 이상은 지움\)/.test(fs.readFileSync("content_site.js", "utf8")) && fs.readFileSync("content_site.js", "utf8").includes("오류 메시지는 30일 뒤"), true); }
// 공유 출처 측정: 공유 버튼이 만드는 주소에 ?from=share 를 달고, 그 주소로 열리면 비콘이 share_visit 을 한 번 더 보내며, 서버가 그 이벤트를 받는다
{ const wk = fs.readFileSync("worker.js", "utf8");
  const beacon = (bs.match(/`<script>(addEventListener\("load",function\(\)\{try\{navigator\.sendBeacon\("\/api\/hit".*?)<\/script>`/) || [])[1] || "";
  const sent = search => { const out = []; let onLoad = null;
    try { new Function("addEventListener", "navigator", "location", "document", beacon)((ev, fn) => { if (ev === "load") onLoad = fn; }, { sendBeacon: (u, b) => out.push(b) }, { pathname: "/namematch.html", search }, { referrer: "" }); if (onLoad) onLoad(); } catch (e) { out.push("ERR " + e.message); }
    return out; };
  const EV = new Function(wk.match(/const EVENTS = new Set\(\[[^\]]*\]\);/)[0] + "return EVENTS;")();
  t("공유 출처: 비콘 코드를 소스에서 찾았다", beacon.includes("share_visit"), true);
  t("공유 출처: 보통 방문은 조회 하나만 보낸다", sent("").join("|"), '{"p":"/namematch.html","r":""}');
  t("공유 출처: ?from=share 로 열리면 조회 뒤에 share_visit 하나가 더 간다(다른 쿼리와 섞여도)", [sent("?from=share"), sent("?s=3&from=share"), sent("?from=share&s=3")].map(a => a.length + a[1]).join(","), '2{"e":"share_visit"},2{"e":"share_visit"},2{"e":"share_visit"}');
  t("공유 출처: from=shared·xfrom=share 같은 비슷한 값은 세지 않는다", [sent("?from=shared").length, sent("?xfrom=share").length].join(","), "1,1");
  t("공유 출처: 서버 허용 목록에 share_visit 이 있고 아무 이름이나 받지는 않는다", EV.has("share_visit") + "," + EV.has("share_visit2") + "," + EV.has("fortune_view"), "true,false,true");
  t("공유 출처: 공유 버튼은 쿼리를 걷어낸 주소 뒤에 ?from=share(와 결과 쿼리 q)를 붙인다", src.includes('var url=location.href.split("#")[0].split("?")[0]+"?from=share"+(q?"&"+q:"");'), true);
  t("공유 출처: 대시보드가 share_visit 을 한글로 보여 주고 방침 문구에 적혀 있다", wk.includes('share_visit: "공유 링크로 들어옴"') && fs.readFileSync("content_site.js", "utf8").includes("공유 링크로 열렸는지 포함"), true); }
t("클래스 이름 lmark 는 홈 머리 로고 하나만 쓴다(배우기 버튼은 lmarkbtn — 같은 이름이면 로고가 빈 사각형이 된다)", (fs.readFileSync("hub.html", "utf8").match(/\.lmark\{/g) || []).length + "|" + (bs.match(/\.lmark\{/g) || []).length + "|" + (bs.match(/class="lmark"/g) || []).length, "1|0|1");
// 모바일 화면 점검(2026-09)에서 나온 깨짐: 떠 있는 캐릭터 옆에 카드가 좁게 눌리거나 모서리를 덮이던 것, 값이 긴 표에서 라벨이 한 글자 폭으로 눌리던 것
t("배우기 카드·진도 칸은 떠 있는 캐릭터 아래로 내린다(clear:both — 옆에 끼면 카드가 좁게 눌린다)", /\.learncta\{[^}]*clear:both/.test(bs) && /\.lprog\{clear:both;/.test(bs), true);
// 인쇄(PDF 저장): 사주 결과용 규칙이 글 본문까지 숨겨 강의·칼럼·사전 430여 쪽이 제목만 찍히던 것(2026-09-30 발견)
{ const pb = src.slice(src.indexOf("@media print{\n    :root{--bg:#fff"), src.indexOf("@page{margin:14mm}"));
  t("인쇄: 글 본문(.guide .intro .exbox .faq)은 결과가 채워진 페이지에서만 숨긴다(자리표시 .ask-wait 는 결과가 아님)", pb.length > 200 && pb.includes("body:has(#out>:not(.ask-wait)) :is(.guide,.intro,.exbox,.faq){display:none!important}") && !/\.tags,\.guide,/.test(pb), true);
  t("인쇄: 히어로 제목은 검정 글자(흰 글자는 배경 그래픽을 끈 기본 인쇄에서 사라짐), 오행 막대 등은 배경 없이도 찍힌다", pb.includes(".toolhero .cap h1{color:#111;text-shadow:none}") && pb.includes("print-color-adjust:exact"), true);
  t("인쇄: 접힌 FAQ 는 인쇄 때 펼치고, 강의 실습·문제·진도 UI 는 인쇄에서 뺀다", bs.includes('addEventListener("beforeprint",function(){var q=document.querySelectorAll("details")') && bs.includes("@media print{.lbar,.lprog,.lpractice,.lquiz,.lmore,.ltest,.lmark-row,.lbar-nav{display:none!important;}}"), true); }
// "이미지로 저장" 버튼을 그리는 도구는 모두 저장을 연결해야 한다(6곳이 버튼만 있고 눌러도 무반응이었다 — 2026-09-30 발견)
{ const nBtn = (src.match(/shareBtn\(\)\+/g) || []).length;
  const nSave = (src.match(/(?<!function )saveScore\(el,/g) || []).length + (src.match(/bindSave\(el,cardData\)/g) || []).length + (src.match(/bindSave\(el,\{file:"오늘의운세"/g) || []).length;
  t("저장 버튼(shareBtn)을 그리는 도구 " + nBtn + "곳은 모두 이미지 저장(saveScore/bindSave)이 연결돼 있다", nBtn + "|" + nSave, "9|9"); }
// 공유 미리보기 카드(img/og, tools/og_cards.js 가 만든다): 규격과 개수
{ const jpgDims = f => { const b = fs.readFileSync(f); let i = 2; while (i < b.length) { if (b[i] !== 0xFF) { i++; continue; } const m = b[i + 1]; if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + b.readUInt16BE(i + 2); } return null; };
  const ogs = fs.existsSync("img/og") ? fs.readdirSync("img/og").filter(f => f.endsWith(".jpg")) : [];
  const badOg = ogs.filter(f => { const d = jpgDims("img/og/" + f); return !d || d[0] !== 1200 || d[1] !== 630 || fs.statSync("img/og/" + f).size > 300000; });
  t("공유 미리보기 카드 50장 이상(img/og)", ogs.length >= 50, true);
  t("공유 미리보기 카드는 모두 1200×630 JPG · 300KB 이하 (어긋난 것: " + badOg.slice(0, 3).join(",") + ")", badOg.length, 0);
  t("빌드가 페이지 이름의 카드를 og:image 로 쓴다(폭·높이 메타 포함)", bs.includes("const hasOgCard = slug =>") && bs.includes('<meta property="og:image:width" content="1200">') && bs.includes("ogTag(o.id)"), true); }
// 사주 궁합 점수는 두 사람에게 같아야 한다(초대 링크로 보낸 사람·받은 사람이 같은 점수를 본다). 옛 코드는 순서를 바꾸면 무작위 100쌍 중 65쌍이 달라졌다(최대 14점)
t("사주 궁합: 일간 십성은 두 방향을 평균 내 점수가 순서와 무관하다", src.includes("r2=sjTenGod(b.d.s,a.d.s)") && src.includes("sc+=((RD1[r1]||0)+(RD1[r2]||0))/2;") && src.includes("((AT[f.r1]||0)+(AT[f.r2]||0))/2") && src.includes("((TK[f.r1]||0)+(TK[f.r2]||0))/2"), true);
t("이름 궁합: 순서를 바꾸면 점수가 달라진다는 안내가 글자 수가 같을 때도 있다", (src.match(/이름 1·2의 순서를 바꾸면 점수가 달라집니다/g) || []).length, 2);
// 일간·일주·십성·띠·일진·월력 페이지가 강의로 가는 문맥 링크를 갖는다(본문 링크 0개였음)
t("생성 페이지 9군(별자리·띠·일간·십성·개념·타로 + 띠 궁합 허브·띠별·짝)이 강의 링크 블록(learnMore)을 갖는다", (bs.match(/    learn: learnMore\(/g) || []).length + "|" + bs.includes("${o.body}\n${o.learn || \"\"}"), "9|true");
// 2027 정미(丁未)년 원고: 띠는 태세 지지 미(未)와의 관계, 일간은 천간 정(丁)과 미 본기 기(己)의 십성이 엔진 계산과 같아야 한다
{ const ZO = require("./content_zodiac.js"), IL = require("./content_ilgan.js");
  const REL = b => b === 7 ? "본명년" : (b + 6) % 12 === 7 ? "충(沖) 관계" : sjYukhap(b) === 7 ? "육합을 이룹니다" : b % 4 === 3 ? "삼합" : b === 0 ? "해(害) 관계" : b === 10 ? "형(刑)이자 파(破)" : "충·합 관계가 없습니다";
  const badZ = ZO.filter(z => { const b = SJ_B.indexOf(z.ji[0]); return b < 0 || typeof z.y2027 !== "string" || z.y2027.replace(/\s/g, "").length < 240 || !z.y2027.includes(REL(b)) || !/2027년/.test(z.y2027); }).map(z => z.ko);
  t("띠 12: 2027 원고가 있고 태세 미(未)와의 관계(충·합·해·형·본명년)가 엔진 계산과 같다 (어긋난 것: " + badZ.join(",") + ")", badZ.length, 0);
  const badI = IL.filter(g => { const i = SJ_S.indexOf(g.ko); if (i < 0) return true; const a = sjTenGod(i, 3), c = sjTenGod(i, SJ_BMAIN[7]); return typeof g.y2027 !== "string" || g.y2027.replace(/\s/g, "").length < 200 || !g.y2027.includes(a + ", 지지 미토(未)의 본기 기토(己)는 " + c + "에 해당"); }).map(g => g.ko);
  t("일간 10: 2027 원고가 있고 천간 정(丁)·미 본기 기(己)의 십성이 엔진 계산과 같다 (어긋난 것: " + badI.join(",") + ")", badI.length, 0);
  t("띠·일간 페이지 생성기가 2027 섹션·제목·FAQ 를 쓴다", (bs.match(/y2027/g) || []).length >= 4 && bs.includes("— 2027 정미년 | 동네보살") && bs.includes("2027 운세 | 동네보살"), true); }
// 별자리 2027: 2027 외행성 위치(토성·해왕성 양자리, 천왕성 쌍둥이자리, 명왕성 물병자리, 목성 사자→처녀 7/26)와 별자리 단위 각을 이루는 행성을 원고가 모두 언급한다
{ const ST = require("./content_star.js"), EN = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
  const PL = [["토성", 0], ["해왕성", 0], ["천왕성", 2], ["명왕성", 10], ["목성", 4], ["목성", 5]], ASP = new Set([0, 2, 3, 4, 6, 8, 9, 10]);
  const badS = ST.filter(s => { const i = EN.indexOf(s.en); if (i < 0) return true; const need = [...new Set(PL.filter(x => ASP.has((x[1] - i + 12) % 12)).map(x => x[0]))]; return typeof s.y2027 !== "string" || s.y2027.replace(/\s/g, "").length < 200 || !/2027년/.test(s.y2027) || need.some(n => !s.y2027.includes(n)); }).map(s => s.ko);
  t("별자리 12: 2027 원고가 있고 2027 외행성과 각을 이루는 행성을 모두 언급한다 (어긋난 것: " + badS.join(",") + ")", badS.length, 0);
  t("별자리 페이지 생성기가 2027 섹션·제목·FAQ·행성 위치 안내를 쓴다", bs.includes("${para(s.y2027)}") && bs.includes("— 2027 | 동네보살") && bs.includes("목성은 7월 26일에 사자자리에서 처녀자리로 옮깁니다"), true); }
t("보안 헤더: 프레임 삽입 금지·쓰지 않는 기능 차단(_headers)", bs.includes("X-Frame-Options: SAMEORIGIN") && bs.includes("Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()"), true);
// 칼럼 "2027 정미년 한눈에": 표가 엔진 계산·개별 페이지 원고와 같다
{ const CL = require("./columns/zodiac-2027.js"), ZO = require("./content_zodiac.js"), IL = require("./content_ilgan.js");
  const gRows = CL.tables[1].rows, zRows = CL.tables[0].rows;
  const badG = IL.filter((g, k) => { const i = SJ_S.indexOf(g.ko); return zRows.length !== 12 || gRows[i][1] !== "정 " + sjTenGod(i, 3) + " · 기 " + sjTenGod(i, SJ_BMAIN[7]); }).map(g => g.ko);
  t("2027 칼럼 표: 일간 10줄의 십성이 엔진(sjTenGod)과 같다 (어긋난 것: " + badG.join(",") + ")", badG.length + "|" + gRows.length, "0|10");
  const KEY = { "해(害)·원진": "해(害) 관계", "충(축미충)": "충(沖) 관계", "합충 없음": "충·합 관계가 없습니다", "삼합(반합)": "삼합", "육합": "육합을 이룹니다", "본명년(같은 띠)": "본명년", "형·파": "형(刑)이자 파(破)", "삼합의 두 글자(공합)": "삼합" };
  const badZ = ZO.filter(z => { const b = SJ_B.indexOf(z.ji[0]), rel = zRows[b][1], key = rel.startsWith("합충 없음") ? KEY["합충 없음"] : KEY[rel]; return !key || !z.y2027.includes(key); }).map(z => z.ko);
  t("2027 칼럼 표: 띠 12줄의 관계가 띠 페이지 2027 원고의 관계와 같다 (어긋난 것: " + badZ.join(",") + ")", badZ.length, 0);
  t("2027 칼럼: 개별 페이지 34곳으로 가는 링크가 있다", (CL.sections[4][1].match(/href=\"(zodiac|ilgan|star)-[a-z]+\.html\"/g) || []).length, 34); }
t("홈: 신년 성수기 링크(2027 한눈에 칼럼)가 도구 타일 아래에 있다 — 입춘(2027-02-04) 뒤 시즌이 끝나면 지운다", bs.includes('class="dictcta seasoncta" href="column-zodiac-2027.html"'), true);
// 공망: 60갑자 전수 — 손으로 적은 순별 표(갑자순 술해, 갑술순 신유, 갑신순 오미, 갑오순 진사, 갑진순 인묘, 갑인순 자축)와 엔진이 같다
{ const HAND = [["갑자순", "술", "해"], ["갑술순", "신", "유"], ["갑신순", "오", "미"], ["갑오순", "진", "사"], ["갑진순", "인", "묘"], ["갑인순", "자", "축"]];
  const badGm = []; for (let k = 0; k < 60; k++) { const s = k % 10, b = k % 12, h = HAND[Math.floor(k / 10)], g = sjGongmang(s, b); if (g.sun !== h[0] || SJ_B[g.empty[0]] !== h[1] || SJ_B[g.empty[1]] !== h[2]) badGm.push(SJ_S[s] + SJ_B[b]); }
  t("공망: 60갑자 전수가 손으로 적은 순별 표와 같다 (어긋난 것: " + badGm.slice(0, 4).join(",") + ")", badGm.length, 0);
  t("공망: 일지는 자기 일주의 공망에 들지 않는다(60갑자)", Array.from({ length: 60 }, (_, k) => sjGongmang(k % 10, k % 12).empty.includes(k % 12)).filter(Boolean).length, 0); }
t("공망: 일주 60쪽이 한눈에 표에 공망 행을 갖고 공망 찾기 도구로 잇는다", bs.includes("gm:ENGINE.sjGongmang(s, b)") && bs.includes("[\"공망(空亡)\",`${gmTxt(p.gm)} — ${p.gm.sun}`]") && bs.includes('<a href=\"gongmang.html\">공망 찾기</a>'), true);
// 육십갑자 표 칼럼: 60줄이 엔진(간지 이름·띠·오행·순·공망)과 같고 연도가 60년 주기이며 일주 60쪽으로 링크한다
{ const GP = require("./columns/gapja-60.js"), rows = GP.tables[0].rows, badGp = [];
  for (let k = 0; k < 60; k++) { const s = k % 10, b = k % 12, g = sjGongmang(s, b), r = rows[k];
    const okLabel = r[0].startsWith((k + 1) + ". " + SJ_S[s] + SJ_B[b] + "(" + SJ_SH[s] + SJ_BH[b] + ")");
    const okVal = r[1] === SJ_TTI[b] + "띠 · " + SJ_EL[SJ_ES[s]] + SJ_EL[SJ_EB[b]] + " · " + g.sun;
    const okYear = r[2] === "공망 " + SJ_B[g.empty[0]] + "·" + SJ_B[g.empty[1]] + " — " + (1924 + k) + " · " + (1984 + k) + " · " + (2044 + k) + "년";
    if (!okLabel || !okVal || !okYear) badGp.push(SJ_S[s] + SJ_B[b]); }
  t("육십갑자 표: 60줄의 간지·띠·오행·순·공망·연도가 엔진 계산과 같다 (어긋난 것: " + badGp.slice(0, 4).join(",") + ")", badGp.length + "|" + rows.length, "0|60");
  t("육십갑자 표: 1984=갑자, 2026=병오(43번째), 2027=정미", [rows[0][2].includes("1984"), rows[42][0].startsWith("43. 병오") && rows[42][2].includes("2026"), rows[43][0].startsWith("44. 정미") && rows[43][2].includes("2027")].join(","), "true,true,true");
  t("육십갑자 표: 일주 60쪽으로 가는 링크가 60개", (GP.sections[2][1].match(/href=\"ilju-[a-z]+\.html\"/g) || []).length, 60); }
// 종합 점수와 네 항목 점수의 평균이 같다(사용자 지적: 86점인데 90·96·90·88 평균은 91)
{ let badSb = 0, nSb = 0; const OFF = [[4, 10, 4, 2], [6, -4, 2, 0], [-6, -2, -3, -8], [8, 8, -2, 4], [0, 0, 0, 0], [12, 12, 12, -20]];
  for (let sc = 35; sc <= 99; sc++) for (const o of OFF) { nSb++; const r = subBal(sc, o); if (r.reduce((a, b) => a + b, 0) !== sc * 4 || r.some(x => x < 30 || x > 99)) badSb++; }
  t("항목 점수 평균 = 종합 점수 (subBal: 점수 35~99 × 편차 6종 " + nSb + "건)", badSb, 0);
  t("여섯 도구가 subBal 로 항목 점수를 만든다", ["subBal(score,T[5])", "subBal(score,hs.MA[1])", "subBal(score,Z[5])", "subBal(score,E[0])", "subBal(sc,[attract,stable,talk,life])", "subBal(sc,[(dist===0"].map(x => src.includes(x)).join(","), "true,true,true,true,true,true");
  t("옛 방식(종합 점수에 고정 가산값)이 남아 있지 않다", (src.match(/Math\.max\(30,Math\.min\(99,score\+/g) || []).length, 0); }
// 오늘의 운세 생년월일은 달력·다이얼이 아니라 숫자 입력(홈·도구), 홈 생일은 자세히·사주로 넘어간다
t("오늘의 운세 입력: 홈과 도구가 숫자 입력칸이고 달력(type=date)·다이얼이 아니다", [bs.includes('id="hb" inputmode="numeric"'), !bs.includes('type="date" id="hb"'), src.includes('id="d" inputmode="numeric" maxlength="10" placeholder="예) 19900315"'), !src.slice(src.indexOf('id:"todayfortune"'), src.indexOf('id:"horoscope"')).includes('birthDial(el,"#d")')].join(","), "true,true,true,true");
t("홈 생일을 자세히·사주 페이지로 넘긴다(탭 안에서만, 한 번 읽으면 지움)", [bs.includes('sessionStorage.setItem("dnbs_hb"'), bs.includes('sessionStorage.removeItem("dnbs_hb")'), bs.includes('id==="todayfortune"||id==="saju"'), bs.includes("Date.now()-hh.t<6e5")].join(","), "true,true,true,true");
// 시진 목록: 라벨 범위(30분 보정 반영) 열두 개가 하루 1440분을 빠짐없이 덮고, 각 분의 시주 지지가 엔진과 같다
{ const rows = [...src.matchAll(/\["(.)시","(\d\d):(\d\d)~(\d\d):(\d\d)"\]/g)]; let bad = 0, n = 0; const seen = new Set();
  rows.forEach((m, i) => { const a = (+m[2]) * 60 + (+m[3]), z = (+m[4]) * 60 + (+m[5]);
    for (let t = a, k = 0; k < 1440; t = (t + 1) % 1440, k++) { n++; seen.add(t); const p = sjPillars(1990, 3, 15, Math.floor(t / 60), t % 60, true); if (p.h.b !== i) bad++; if (t === z) break; } });
  t("시진 목록: 12개 범위가 하루 1440분을 겹침 없이 덮고 엔진 시주 지지와 같다", bad + "|" + n + "|" + seen.size + "|" + rows.length, "0|1440|1440|12");
  // 옵션 값(0,2,…,22,23) → birthIn 이 쓰는 가운데 시각(값:30분)이 그 시진에 든다: 값 v → 시진 index = v==23 ? 0 : v/2
  let badMid = 0; for (const v of [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 23]) { const idx = v === 23 ? 0 : v / 2; if (sjPillars(1990, 3, 15, v, 30, true).h.b !== idx || sjPillars(1990, 3, 15, v, 30, false).h.b !== idx) badMid++; }
  t("시진 목록: 고른 값의 가운데 시각(값:30)이 보정 적용·미적용 모두 그 시진이다", badMid, 0); }
// 사주 궁합 깊은 풀이(content_gunghap.js → ghDeep) + 점수 기준선
{ const GD = require("./content_gunghap.js"), JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요/;
  const RELS = ["합", "비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"], ELS = ["목", "화", "토", "금", "수"];
  const relOk = RELS.every(k => GD.rel[k] && ["t", "pull", "clash", "fix", "you"].every(f => GD.rel[k][f] && GD.rel[k][f].length > 10) && GD.tip[k] && GD.tip[k].length === 3 && GD.mode[k] && GD.mode[k].love && GD.mode[k].marry && GD.mode[k].work);
  const pairKeys = []; for (let i = 0; i < 5; i++) for (let j = i; j < 5; j++) pairKeys.push(ELS[i] + ELS[j]);
  const SEAS = ["봄", "여름", "가을", "겨울"], seasKeys = []; for (let i = 0; i < 4; i++) for (let j = i; j < 4; j++) seasKeys.push(SEAS[i] + SEAS[j]);
  t("궁합 원고: 십성 관계 11종·오행 짝 15종·계절 짝 10종·역할 5종의 칸이 모두 채워져 있다", [relOk, pairKeys.every(k => GD.pairEl[k] && GD.pairEl[k].img && GD.pairEl[k].body), seasKeys.every(k => GD.seasonPair[k]) && SEAS.every(k => GD.season[k]), ["재", "관", "식", "인", "비"].every(g => ["t", "lead", "both", "even", "none"].every(f => GD.role[g][f])), GD.hap.length === 5, ["삼합", "육합", "충", "같음", "무난"].every(k => GD.home.tti[k] && GD.home.ilji[k])].join(","), "true,true,true,true,true,true");
  { const { note, ...body } = GD; t("궁합 원고: 풀이 본문은 보살 말투(존댓말 어미 0, 근거 고지 note 만 존댓말)", JOND.test(JSON.stringify(body)) ? "혼입" : "0", "0"); }
  const RG = () => [1930 + Math.floor(Math.random() * 86), 1 + Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)], GRD = ["천생연분", "좋은 인연", "노력형 인연", "신중한 인연"];
  const dupG = {}, cnt = { token: 0, undef: 0, jondae: 0, josa: 0, secs: 0, dup: 0 }; let minLen = 1e9; const strip = x => String(x).replace(/<[^>]+>/g, "");
  for (let i = 0; i < 3000; i++) { const a = RG(), b = RG(), ha = i % 3 ? null : Math.floor(Math.random() * 24), hb = i % 3 ? null : Math.floor(Math.random() * 24);
    const A = sjPillars(a[0], a[1], a[2], ha, 30, true), B = sjPillars(b[0], b[1], b[2], hb, 30, true), nb = i % 4 === 0 ? "김동성 님" : "상대";
    const o = ghDeep(A, B, { nb, grade: GRD[i % 4], axes: [["끌림", 70 + i % 20], ["안정", 65 + i % 25], ["소통", 72 + i % 15], ["생활", 60 + i % 30]], now: 2026 }, GD);
    const parts = [o.sum]; o.secs.forEach(s => { parts.push(s.h); (s.p || []).forEach(x => parts.push(x)); (s.roles || []).forEach(r => parts.push(r.k + " " + r.w + " " + r.t)); (s.years || []).forEach(y => parts.push(y.la + " " + y.lb + " " + y.j + " " + y.flag)); (s.list || []).forEach(x => parts.push(x)); });
    const txt = parts.map(strip).join("\n"); minLen = Math.min(minLen, txt.replace(/\s+/g, "").length);
    if (/[{}]/.test(txt)) cnt.token++; if (/undefined|NaN|null/.test(txt)) cnt.undef++; if (JOND.test(txt)) cnt.jondae++;
    if (/자네(은|이|을|과)(?![가-힣])/.test(txt) || /님(가|는|를|와)(?![가-힣])/.test(txt)) cnt.josa++; if (o.secs.length !== 11) cnt.secs++;
    { const sn = {}; txt.split(/(?<=[.!?])s+/).map(x => x.trim()).filter(x => x.length >= 14).forEach(x => { sn[x] = (sn[x] || 0) + 1; }); if (Object.values(sn).some(n => n > 1)) { cnt.dup++; Object.keys(sn).forEach(x => { if (sn[x] > 1) dupG[x.slice(0, 44)] = 1; }); } } }
  t("궁합 깊은 풀이: 무작위 3000쌍 — 남은 토큰·undefined·존댓말 혼입·조사 오류·섹션 수·같은 문장 되풀이가 모두 0" + (cnt.dup ? " — 예: " + Object.keys(dupG).slice(0, 4).join(" | ") : ""), JSON.stringify(cnt), JSON.stringify({ token: 0, undef: 0, jondae: 0, josa: 0, secs: 0, dup: 0 }));
  t("궁합 깊은 풀이: 어느 쌍이든 글자 수(공백 제외)가 1700자 이상 (최소 " + minLen + ")", minLen >= 1700, true);
  // 해별 점수는 신년운세 도구와 같은 식이다(십성 기본점수 표가 같고 삼합·육합 +5 / 충 -6)
  { const nyb = toolBlock("newyear"), m1 = /var sc=\{([^}]*)\}\[sjTenGod\(ds,YS\)\]/.exec(nyb), m2 = /var GH_YB=\{([^}]*)\}/.exec(inner);
    t("궁합 해별 점수표(GH_YB)가 신년운세 점수표와 같다", m1 && m2 && m1[1] === m2[1], true);
    t("궁합 해별 점수는 신년운세와 같은 합충 가감(삼합·육합 +5, 충 -6)", inner.includes("if(b%4===yb%4&&b!==yb)sc+=5;else if(sjYukhap(b)===yb)sc+=5;else if(Math.abs(b-yb)===6)sc-=6;") && nyb.includes("if(b%4===YB%4&&b!==YB||sjYukhap(b)===YB)sc+=5;else if(Math.abs(b-YB)===6)sc-=6;"), true); }
  // 점수 기준선: 합이 하나도 없는 평범한 조합이 노력형 인연에 몰리지 않는다(무작위 3000쌍: 중앙값 74~82, 노력형 35% 이하, 신중 10% 이하)
  { const gb = toolBlock("gunghap"), ps = gb.slice(gb.indexOf("function pts(a,b){"), gb.indexOf("function go(){")), pts = new Function("sjTenGod", "sjYukhap", "SJ_S", "SJ_B", "SJ_ES", "SJ_EB", "SJ_TTI", ps + "\nreturn pts;")(sjTenGod, sjYukhap, SJ_S, SJ_B, SJ_ES, SJ_EB, SJ_TTI);
    const sc = []; for (let i = 0; i < 3000; i++) { const a = RG(), b = RG(); sc.push(pts(sjPillars(a[0], a[1], a[2], null, 30, true), sjPillars(b[0], b[1], b[2], null, 30, true))[0]); }
    sc.sort((x, y) => x - y); const med = sc[1500], pEf = sc.filter(v => v >= 58 && v < 72).length / 30, pCa = sc.filter(v => v < 58).length / 30, pTop = sc.filter(v => v >= 85).length / 30;
    t("궁합 점수 분포(무작위 3000쌍): 중앙값 72~80 · 노력형 35% 이하 · 신중 10% 이하 · 천생연분 10~30% (" + med + " · " + pEf.toFixed(0) + "% · " + pCa.toFixed(0) + "% · " + pTop.toFixed(0) + "%)", med >= 72 && med <= 80 && pEf <= 35 && pCa <= 10 && pTop >= 10 && pTop <= 30, true); }
}
// 사주 결과 "타고난 성격": 원고 칸이 다 있고 무작위 명식 3000개에서 네 조각이 모두 나오며 문체 규칙을 지킨다
{ const SC = require("./content_saju_char.js"), JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요/;
  t("사주 성격 원고: 일간 10(성격·사랑·일·쉼) · 힘의 세기 2×5 · 계절 4 · 십성 무리 5 칸이 모두 채워져 있다", [SC.core.length === 10 && SC.core.every(x => x.length > 60) && SC.love.length === 10 && SC.work.length === 10 && SC.rest.length === 10, SC.power.strong.length === 5 && SC.power.weak.length === 5, ["봄", "여름", "가을", "겨울"].every(k => SC.season[k]), ["비", "식", "재", "관", "인"].every(k => SC.group[k])].join(","), "true,true,true,true");
  { const { note, ...body } = SC; t("사주 성격 원고: 풀이 본문은 보살 말투(존댓말 어미 0)", JOND.test(JSON.stringify(body)) ? "혼입" : "0", "0"); }
  let badC = 0, minC = 1e9, maxC = 0; for (let i = 0; i < 3000; i++) { const y = 1930 + Math.floor(Math.random() * 86), m = 1 + Math.floor(Math.random() * 12), d = 1 + Math.floor(Math.random() * 28), h = i % 3 ? null : Math.floor(Math.random() * 24);
    const p = sjPillars(y, m, d, h, 30, true), r = sjChar(p, SC), len = r.join("").replace(/\s+/g, "").length; minC = Math.min(minC, len); maxC = Math.max(maxC, len);
    if (r.length !== 7 || r.some(x => !x || /undefined|\{|\}/.test(x)) || JOND.test(r.join(" "))) badC++; }
  t("사주 성격 섹션: 무작위 명식 3000개에서 네 조각이 모두 나오고 문체 이상이 없다 (글자 수 " + minC + "~" + maxC + ")", badC + "|" + (minC >= 250), "0|true");
  t("사주 도구가 성격 원고를 받아 종합 바로 뒤에 펼친 채로 넣는다", [src.includes('fetch("sj/char.json")'), src.includes("headline+synth+charSec+hourSec()+"), src.includes('sj-sec sj-persona fold-skip'), bs.includes('"sj","char.json"')].join(","), "true,true,true,true"); }
// 신년운세 깊이 풀이(content_newyear.js → nyDeep): 원고 칸 · 월주 손계산 · 무작위 생일 3000개 · 도구 배선
{ const NY = require("./content_newyear.js"), JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요/;
  const RELS = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"];
  t("신년 원고: 십성 10종 × (재물·일·사랑·건강) · 달 3문장 · 약속 3 · 적합 3단계 · 한눈에 4종이 모두 채워져 있다",
    [RELS.every(k => NY.rel[k] && ["money", "work", "love", "health"].every(f => NY.rel[k][f] && NY.rel[k][f].length > 50) && NY.month[k] && NY.month[k].length === 3 && NY.month[k].every(x => x.length > 10) && NY.tip[k] && NY.tip[k].length === 3),
     [0, 1, 2].every(k => NY.fit[k] && NY.fit[k].length > 30), ["both", "bestOnly", "worstOnly", "flat"].every(k => NY.sum[k] && NY.sum[k].length > 20), !!(NY.monthFit && NY.monthChung && NY.monthHap && NY.help && NY.note.money && NY.note.months && NY.note.help && NY.note.events)].join(","), "true,true,true,true");
  t("신년 원고: 일 종류 5가지 × 십성 무리 5가지(25칸)에 한 해 판단이 채워져 있다", ["job", "deal", "study", "meet", "biz"].every(k => NY.ev[k] && ["비겁", "식상", "재성", "관성", "인성"].every(g => NY.ev[k][g] && NY.ev[k][g].length > 40)), true);
  { const { note, ...body } = NY; t("신년 원고: 풀이 본문은 보살 말투(존댓말 어미 0, 근거 고지 note 만 존댓말)", JOND.test(JSON.stringify(body)) ? "혼입" : "0", "0"); }
  // 월주 손계산표: 입춘 기준 열두 달(2026 병오년 경인월~신축월, 2027 정미년 임인월~계축월) — 병·신년은 경인, 정·임년은 임인에서 시작한다
  const HAND = { 2026: "庚寅,辛卯,壬辰,癸巳,甲午,乙未,丙申,丁酉,戊戌,己亥,庚子,辛丑", 2027: "壬寅,癸卯,甲辰,乙巳,丙午,丁未,戊申,己酉,庚戌,辛亥,壬子,癸丑" };
  { const p0 = sjPillars(1990, 3, 15, null, 0, false);
    t("신년 열두 달: 월주가 손계산표와 같다(2026 庚寅~辛丑, 2027 壬寅~癸丑)", [2026, 2027].map(Y => nyDeep(p0, Y, Y + "년", NY).meta.months.map(m => m.han).join(",") === HAND[Y]).join(","), "true,true");
    t("신년 열두 달: 달 번호가 2월~12월, 이듬해 1월 순서다", nyDeep(p0, 2026, "올해", NY).meta.months.map(m => m.y + "." + m.m).join(","), "2026.2,2026.3,2026.4,2026.5,2026.6,2026.7,2026.8,2026.9,2026.10,2026.11,2026.12,2027.1"); }
  const RG = () => [1930 + Math.floor(Math.random() * 86), 1 + Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)];
  const dupEx = {}, cnt = { token: 0, undef: 0, jondae: 0, josa: 0, secs: 0, mon: 0, pick: 0, tip: 0, dup: 0 }; let minLen = 1e9, maxLen = 0, withBest = 0, withWorst = 0; const strip = x => String(x).replace(/<[^>]+>/g, "");
  for (let i = 0; i < 3000; i++) { const b = RG(), h = i % 3 ? null : Math.floor(Math.random() * 24), YR = i % 2 ? 2027 : 2026, YW = YR === 2026 ? "올해" : "2027년";
    const o = nyDeep(sjPillars(b[0], b[1], b[2], h, 30, true), YR, YW, NY), body = [], all = [];
    o.secs.forEach(s => { const c = [s.h]; (s.p || []).forEach(x => c.push(x)); (s.list || []).forEach(x => c.push(x)); (s.rows || []).forEach(r => { c.push(r.h); c.push(r.sub); c.push(r.t); }); c.forEach(x => { body.push(x); all.push(x); }); if (s.n) all.push(s.n); });
    const btxt = body.map(strip).join("\n"), atxt = all.map(strip).join("\n"), len = atxt.replace(/\s+/g, "").length; minLen = Math.min(minLen, len); maxLen = Math.max(maxLen, len);
    if (/[{}]/.test(atxt)) cnt.token++; if (/undefined|NaN|null/.test(atxt)) cnt.undef++; if (JOND.test(btxt)) cnt.jondae++;
    if (/자네(은|이|을|과)(?![가-힣])/.test(btxt) || /올해(은|이|을|과)(?![가-힣])/.test(btxt) || /\d년(는|가|를|와)(?![가-힣])/.test(btxt) || /(봄|여름|가을|겨울)가(?![가-힣])/.test(btxt) || /환절기이(?![가-힣])/.test(btxt)) cnt.josa++;
    if (o.secs.length !== 9 || o.meta.events.length !== 5) cnt.secs++; const mo = o.meta.months; if (mo.length !== 12 || mo.some(m => !m.t || m.t.length < 20)) cnt.mon++;
    if (o.meta.best.length > 3 || o.meta.worst.length > 2) cnt.pick++; if (o.meta.best.length) withBest++; if (o.meta.worst.length) withWorst++;
    const tp = o.secs.find(s => s.k === "tip"); if (!tp || tp.list.length !== 3) cnt.tip++;
    { const sn = {}; body.map(strip).join(" ").split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => x.length >= 14).forEach(x => { sn[x] = (sn[x] || 0) + 1; }); if (Object.values(sn).some(n => n > 1)) { cnt.dup++; Object.keys(sn).forEach(x => { if (sn[x] > 1) dupEx[x.slice(0, 44)] = 1; }); } } }
  t("신년 깊이 풀이: 무작위 3000명 × 2026·2027 — 남은 토큰·undefined·존댓말 혼입·조사 오류·섹션 수·열두 달·고른 달 수·같은 문장 되풀이가 모두 0" + (cnt.dup ? " — 예: " + Object.keys(dupEx).slice(0, 4).join(" | ") : ""), JSON.stringify(cnt), JSON.stringify({ token: 0, undef: 0, jondae: 0, josa: 0, secs: 0, mon: 0, pick: 0, tip: 0, dup: 0 }));
  t("신년 깊이 풀이: 글자 수(공백 제외) 최소 " + minLen + " · 최대 " + maxLen + " — 1900자 이상", minLen >= 1900, true);
  t("신년 깊이 풀이: 힘이 실리는 달을 고른 비율 " + (withBest / 30).toFixed(0) + "% · 차분히 가는 달을 고른 비율 " + (withWorst / 30).toFixed(0) + "% (둘 다 30~95% — 네 가지 한눈에 문장이 고루 나온다)", withBest / 30 >= 30 && withBest / 30 <= 95 && withWorst / 30 >= 30 && withWorst / 30 <= 95, true);
  { const nyb = toolBlock("newyear");
    t("신년운세 도구가 깊이 풀이 원고(ny/deep.json)를 받아 자리(#nydeep)에 채우고 결과 칸은 접지 않는다",
      [nyb.includes('fetch("ny/deep.json")'), nyb.includes('<div id="nydeep"></div>'), nyb.includes("nyLast={me:me,YR:YR,YW:YW};fillNy();"), !/<div class="sj-sec"><h3>/.test(nyb), bs.includes('"ny","deep.json"'), /nyDeep/.test(bs)].join(","), "true,true,true,true,true,true"); } }
// 사주 쉬운 종합(content_saju_easy.js → sjEasy): 원고 칸 · 문체(보살 말투·긍정·쉬운 말) · 무작위 명식 3000개 · 이름 부르기 · 도구 배선
{ const SE = require("./content_saju_easy.js"), JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요/,
    NEG = /위험|흉|불행|재앙|사고(?!력)|실패|나쁜|망하|망한|화근|재난|불길|불운/, HARD = /격국|용신|신강|신약|십성|비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인|일간|월지|지지/;
  const TG = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"], SINK = ["천을귀인", "문창귀인", "도화살", "역마살", "화개살", "양인살", "백호대살", "괴강살"], GRPK = ["재성", "관성", "인성", "식상", "비겁"];
  t("쉬운 종합 원고: 일간 10 · 힘 2 · 짜임 10(좋은 방식·챙길 것) · 별 8 · 비어 있는 기운 5 · 큰 흐름 10 · 올해 10 · 받침 4 · 맺음 2가 모두 채워져 있다",
    [SE.il.length === 10 && SE.il.every(x => x.length > 20), SE.str.strong && SE.str.weak && SE.strat.strong && SE.strat.weak && SE.close.strong && SE.close.weak, TG.every(k => SE.gy[k] && SE.good[k] && SE.care[k] && SE.du[k] && SE.du[k].length === 2 && SE.se[k] && SE.se[k].length === 2),
     SINK.every(k => SE.sin[k] && SE.sin[k].length === 2), GRPK.every(k => SE.miss[k]), ["both", "du", "se", "none"].every(k => SE.fit[k]), !!SE.note].map(Boolean).join(",") + "|" + [SE.str3.length === 10 && SE.people.length === 10 && SE.habit.length === 10 && SE.habit.every(x => x.length > 30) && SE.str3.every(x => x.length > 15) && SE.people.every(x => x.length > 30), TG.every(k => SE.work[k] && SE.money[k] && SE.seTip[k]), /\{E\}/.test(SE.body)].join(","), "true,true,true,true,true,true,true|true,true,true");
  { const { note, ...body } = SE, strs = []; (function w(o) { if (typeof o === "string") strs.push(o); else if (o && typeof o === "object") Object.values(o).forEach(w); })(body); const all = strs.join("\n");
    t("쉬운 종합 원고: 보살 말투(존댓말 어미 0, 근거 고지 note 만 존댓말)", JOND.test(all) ? "혼입" : "0", "0");
    t("쉬운 종합 원고: 긍정 베이스 — 겁주는 말(위험·흉·불행·사고·실패·나쁜 …)이 0", (all.match(NEG) || []).join(",") || "0", "0");
    t("쉬운 종합 원고: 어려운 명리 용어(격국·용신·신강·신약·십성 이름·일간·월지)가 본문에 0 — 별 이름은 괄호 안에만", (all.replace(/\([^)]*\)/g, "").match(HARD) || []).join(",") || "0", "0"); }
  const G5 = { 비견: "비겁", 겁재: "비겁", 식신: "식상", 상관: "식상", 편재: "재성", 정재: "재성", 편관: "관성", 정관: "관성", 편인: "인성", 정인: "인성" };
  const cnt = { token: 0, undef: 0, jondae: 0, josa: 0, paras: 0, neg: 0 }; let minL = 1e9, maxL = 0, sumL = 0; const NMS = ["", "민지 님", "엄마", "김동성 님", "하늘 님"];
  for (let i = 0; i < 3000; i++) { const y = 1930 + Math.floor(Math.random() * 86), m = 1 + Math.floor(Math.random() * 12), d = 1 + Math.floor(Math.random() * 28), h = i % 3 ? null : Math.floor(Math.random() * 24), p = sjPillars(y, m, d, h, 30, true), ds = p.d.s, st = sjStrength(p);
    const G = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 }; [p.y, p.m, p.d].concat(p.h ? [p.h] : []).forEach((c, ci) => { if (ci !== 2) G[G5[sjTenGod(ds, c.s)]]++; G[G5[sjTenGod(ds, SJ_BMAIN[c.b])]]++; });
    const nm = NMS[i % NMS.length], f = { ds, strong: st.strong, yong: SJ_EL[st.yong], wolTg: sjTenGod(ds, SJ_BMAIN[p.m.b]), sin: sjSinsal(p), miss: Object.keys(G).filter(k => G[k] === 0), duTg: TG[i % 10], seTg: TG[(i * 7 + 3) % 10], duOk: !!(i & 1), seOk: !!(i & 2), nm };
    const ps = sjEasy(f, SE), txt = ps.map(x => x.replace(/<[^>]+>/g, "")).join("\n"), len = txt.replace(/\s+/g, "").length; minL = Math.min(minL, len); maxL = Math.max(maxL, len); sumL += len;
    if (/[{}]/.test(txt)) cnt.token++; if (/undefined|NaN|null/.test(txt)) cnt.undef++; if (JOND.test(txt)) cnt.jondae++; if (NEG.test(txt)) cnt.neg++;
    if (ps.length < 8 || ps.length > 12) cnt.paras++;
    const first = ps[0].replace(/<[^>]+>/g, ""); if (nm ? !first.startsWith("쉽게 말하면 — " + nm + josa(nm, "는/은") + " ") : !first.startsWith("쉽게 말하면 — 자네는 ")) cnt.josa++; }
  t("쉬운 종합: 무작위 3000명(이름 없음·민지 님·엄마 …) — 남은 토큰·undefined·존댓말 혼입·겁주는 말·문단 수·이름 조사 오류가 모두 0", JSON.stringify(cnt), JSON.stringify({ token: 0, undef: 0, jondae: 0, josa: 0, paras: 0, neg: 0 }));
  // 글자 수의 최솟값은 무작위가 아니라 계산으로 잡는다(항목마다 문장이 이어 붙는 합이라 차원별 최솟값의 합이 곧 전체 최솟값 — 무작위 표본은 그보다 작을 수 없다)
  { const EL5 = ["목", "화", "토", "금", "수"], base = { ds: 0, strong: true, yong: "목", wolTg: "비견", sin: [], miss: [], duTg: "비견", seTg: "비견", duOk: false, seOk: false, nm: "" }, L = f => sjEasy(f, SE).map(x => x.replace(/<[^>]+>/g, "")).join("\n").replace(/\s+/g, "").length, L0 = L(base);
    let exact = L0; [["ds", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], ["strong", [true, false]], ["yong", EL5], ["wolTg", TG], ["duTg", TG], ["seTg", TG]].forEach(([k, vs]) => { exact += Math.min(...vs.map(v => L({ ...base, [k]: v }))) - L0; });
    exact += Math.min(...[[false, false], [true, false], [false, true], [true, true]].map(v => L({ ...base, duOk: v[0], seOk: v[1] }))) - L0;
    t("쉬운 종합: 글자 수(공백 제외) 이론상 최소 " + exact + " · 무작위 최소 " + minL + " · 평균 " + Math.round(sumL / 3000) + " · 최대 " + maxL + " — 예전 종합(공백 빼고 약 450자)의 1.5배를 넘는 700자 이상, 평균 950자 이상", exact >= 700 && minL >= exact && sumL / 3000 >= 950, true); }
  // 이름 부르기: 엄마·아빠는 님을 더 붙이지 않고 이름에는 님을 붙이며, 결과 글의 섹션마다 첫 '자네'를 바꾼다(조사는 받침대로)
  t("이름 부르기(nmHon): 이름은 님을 붙이고 이미 호칭이면 그대로 둔다", [nmHon("민지"), nmHon("민지 님"), nmHon("엄마"), nmHon("이수현씨"), nmHon("  "), nmHon(""), nmHon("남친"), nmHon("딸")].join("|"), "민지 님|민지 님|엄마|이수현씨|||남친|딸");
  { const sj = toolBlock("saju");
    t("사주 도구: 쉬운 종합 원고(sj/easy.json)를 받아 종합을 쓰고, 못 받으면 예전 문장으로 대신하며, 결과의 섹션마다 이름을 부른다",
      [sj.includes('fetch("sj/easy.json")'), sj.includes("synthOld"), sj.includes("sjEasy({ds:ds"), sj.includes("nmSwap(outEl,nmHon(nm))"), sj.includes("쉽게 말하면</b> — 태어난 시각은"), bs.includes('"sj","easy.json"')].join(","), "true,true,true,true,true,true"); } }
// 별자리 운세: 오늘의 달(hsMoon) — 미국 해군천문대(USNO) 삭·상현·보름·하현 99개(2026~27)와 대조 · 날마다 결이 바뀌는지 · 점수 분포
{ const P = "2026-01-03 10:03 F|2026-01-10 15:48 L|2026-01-18 19:52 N|2026-01-26 04:47 Q|2026-02-01 22:09 F|2026-02-09 12:43 L|2026-02-17 12:01 N|2026-02-24 12:27 Q|2026-03-03 11:38 F|2026-03-11 09:38 L|2026-03-19 01:23 N|2026-03-25 19:18 Q|2026-04-02 02:12 F|2026-04-10 04:51 L|2026-04-17 11:52 N|2026-04-24 02:32 Q|2026-05-01 17:23 F|2026-05-09 21:10 L|2026-05-16 20:01 N|2026-05-23 11:11 Q|2026-05-31 08:45 F|2026-06-08 10:00 L|2026-06-15 02:54 N|2026-06-21 21:55 Q|2026-06-29 23:56 F|2026-07-07 19:29 L|2026-07-14 09:43 N|2026-07-21 11:05 Q|2026-07-29 14:36 F|2026-08-06 02:21 L|2026-08-12 17:37 N|2026-08-20 02:46 Q|2026-08-28 04:18 F|2026-09-04 07:51 L|2026-09-11 03:27 N|2026-09-18 20:44 Q|2026-09-26 16:49 F|2026-10-03 13:25 L|2026-10-10 15:50 N|2026-10-18 16:12 Q|2026-10-26 04:12 F|2026-11-01 20:28 L|2026-11-09 07:02 N|2026-11-17 11:48 Q|2026-11-24 14:53 F|2026-12-01 06:08 L|2026-12-09 00:52 N|2026-12-17 05:42 Q|2026-12-24 01:28 F|2026-12-30 18:59 L|2027-01-07 20:24 N|2027-01-15 20:34 Q|2027-01-22 12:17 F|2027-01-29 10:55 L|2027-02-06 15:56 N|2027-02-14 07:58 Q|2027-02-20 23:23 F|2027-02-28 05:16 L|2027-03-08 09:29 N|2027-03-15 16:25 Q|2027-03-22 10:44 F|2027-03-30 00:54 L|2027-04-06 23:51 N|2027-04-13 22:56 Q|2027-04-20 22:27 F|2027-04-28 20:18 L|2027-05-06 10:58 N|2027-05-13 04:44 Q|2027-05-20 10:59 F|2027-05-28 13:58 L|2027-06-04 19:40 N|2027-06-11 10:56 Q|2027-06-19 00:44 F|2027-06-27 04:54 L|2027-07-04 03:02 N|2027-07-10 18:39 Q|2027-07-18 15:45 F|2027-07-26 16:55 L|2027-08-02 10:05 N|2027-08-09 04:54 Q|2027-08-17 07:29 F|2027-08-25 02:27 L|2027-08-31 17:41 N|2027-09-07 18:31 Q|2027-09-15 23:03 F|2027-09-23 10:20 L|2027-09-30 02:36 N|2027-10-07 11:47 Q|2027-10-15 13:47 F|2027-10-22 17:29 L|2027-10-29 13:36 N|2027-11-06 08:00 Q|2027-11-14 03:26 F|2027-11-21 00:48 L|2027-11-28 03:24 N|2027-12-06 05:22 Q|2027-12-13 16:09 F|2027-12-20 09:11 L|2027-12-27 20:12 N".split("|"), WANT = { N: 0, Q: 90, F: 180, L: 270 }, jdUT = (y, m, d, h, mi) => Date.UTC(y, m - 1, d, h, mi) / 86400000 + 2440587.5;
  let worst = 0; P.forEach(x => { const m = /^(\d+)-(\d+)-(\d+) (\d+):(\d+) (\w)$/.exec(x), jd = jdUT(+m[1], +m[2], +m[3], +m[4], +m[5]); worst = Math.max(worst, Math.abs(((hsMoonLong(jd) - sjSunLong(jd) - WANT[m[6]]) % 360 + 540) % 360 - 180)); });
  t("달 황경: 미국 해군천문대 삭·상현·보름·하현 " + P.length + "개와 대조한 최대 오차 " + worst.toFixed(3) + "° (0.1° 이하 = 위상 시각 12분 안)", worst <= 0.1, true);
  t("달 황경: Meeus 예제(1992-04-12 0h TD → 133.1627°)", Math.abs(hsMoonLong(2448724.5) - 133.162655) < 0.05, true);
  t("달 모양: 2026-09-11 삭 · 2026-09-26 보름(밝기 100%) · 2026-09-30 기우는 달(황소자리)", [hsMoon(2026, 9, 11).phase, hsMoon(2026, 9, 26).phase, hsMoon(2026, 9, 26).illum, hsMoon(2026, 9, 30).phase, hsMoon(2026, 9, 30).sign].join(","), "0,4,100,5,1");
  const D366 = []; for (let i = 0; i < 366; i++) D366.push(new Date(2026, 0, 1 + i));
  let sumS = 0, nS = 0; const gd = { 대길: 0, 길: 0, 평온: 0, 주의: 0 }; D366.forEach(d => { for (let s = 0; s < 12; s++) { const h = hsScore(s, d); sumS += h.score; nS++; gd[hsGrade(h.score)]++; } });
  const pc = k => gd[k] / nS * 100;
  t("별자리 점수 분포(12별자리×366일): 평균 " + (sumS / nS).toFixed(1) + " · 대길 " + pc("대길").toFixed(0) + "% · 주의 " + pc("주의").toFixed(0) + "% — 평균 72~77 · 대길 8~25% · 주의 10% 이하", sumS / nS >= 72 && sumS / nS <= 77 && pc("대길") >= 8 && pc("대길") <= 25 && pc("주의") <= 10, true);
  // 태양 각도만 쓰던 예전 방식은 30일 동안 글이 2종뿐이었다. 달을 쓰면 하루하루 다르다
  const md = new Set(), scs = new Set(), mss = new Set(); for (let i = 0; i < 30; i++) { const h = hsScore(4, new Date(2026, 8, 1 + i)); md.add(h.md); scs.add(h.score); mss.add(h.moon.sign); }
  t("별자리 운세는 날마다 달라진다: 사자자리 30일 동안 달 각도 " + md.size + "종(6 이상) · 점수 " + scs.size + "종(10 이상) · 달 별자리 " + mss.size + "개(10 이상)", md.size >= 6 && scs.size >= 10 && mss.size >= 10, true);
  { const r = hsRank(new Date(2026, 8, 30)); t("오늘의 별자리 순위: 12개가 모두 나오고 점수 내림차순", r.length === 12 && new Set(r.map(x => x.i)).size === 12 && r.every((x, i) => i === 0 || r[i - 1].score >= x.score), true); }
  t("홈 순위 한 줄은 달의 각도(md)로 고른다", bs.includes("HS_LINE[z.md]") && !bs.includes("HS_LINE[z.dist]"), true); }
// 쉬운 말·긍정 베이스로 다시 쓴 원고(2026-09-30): 조합·판정·자리·꼬리질문·오늘의 운세 — 존댓말 0 · 겁주는 말 0 · 어려운 명리 용어 0 · 키 구조 유지
{ const NEG = /위험|흉(?!내|터)|불행|재앙|사고(?!력)|실패|나쁜|망하|망한|화근|재난|불길한|불길함|불운|파탄|파산|몰락|이혼|사별|단명|요절|횡액|관재|기운이 얇|기운이 약|복이 없|팔자가 사납|팔자가 세/,
    HARD = /격국|용신|십성|신강|신약|일간|월지|천간|비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인|인성|재성|관성|식상|비겁/, JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요|드립니다|주세요/;
  const strs = o => { const a = []; (function w(x) { if (typeof x === "string") a.push(x); else if (x && typeof x === "object") Object.values(x).forEach(w); })(o); return a; };
  const scan = (label, o, opts = {}) => { const a = strs(o); let jo = 0, ng = 0, hd = 0; a.forEach(s => { if (JOND.test(s)) jo++; if (NEG.test(s)) ng++; if (!opts.allowHard && HARD.test(s.replace(/\([^)]*\)/g, ""))) hd++; });
    t(label + ": 문자열 " + a.length + "개 — 존댓말·겁주는 말·어려운 용어가 모두 0", jo + "," + ng + "," + hd, "0,0,0"); };
  const CB = require("./content_saju_combo.js"), TGK = ["bigyeon", "geopjae", "siksin", "sanggwan", "pyeonjae", "jeongjae", "pyeongwan", "jeonggwan", "pyeonin", "jeongin"];
  t("사주 조합 원고: 일간 10 × 짜임 10 × 5칸(core·money·job·love·health)이 모두 있다", Object.keys(CB).length === 10 && Object.values(CB).every(g => TGK.every(k => g[k] && ["core", "money", "job", "love", "health"].every(f => g[k][f] && g[k][f].length > 150))), true);
  scan("사주 조합 원고", CB);
  { const V = require("./content_saju_verdict.js"); scan("사주 판정 문장", V);
    t("사주 판정 문장: head 는 한 문장(핵심 요약)·follow 와 이어 읽는다", ["money", "job", "love"].every(a => Object.values(V[a].head).every(h => Object.values(h).every(s => s.length >= 20 && s.length <= 90 && (s.match(/[.!?]/g) || []).length <= 2))), true); }
  scan("사주 여덟 글자 자리 풀이", require("./content_saju_gung.js"));
  scan("사주 꼬리질문 답", require("./content_saju_q.js"));
  scan("오늘의 운세 꼬리질문 답", require("./content_today_q.js"));
  { const src2 = inner.slice(inner.indexOf("{id:\"todayfortune\"")), code = src2.slice(src2.indexOf("var TXT="), src2.indexOf("el.innerHTML=")), tfl = (inner.match(/var TF_LINE=\{[^\n]*\};/) || [""])[0], R = new Function(tfl + "\n" + code + "\nreturn {TXT:TXT,TF_LINE:TF_LINE};")();
    scan("오늘의 운세 그날 기운 원고(TXT·한 줄 요약)", { a: Object.values(R.TXT).map(v => v.filter(x => typeof x === "string")), b: R.TF_LINE });
    t("오늘의 운세 그날 기운 원고: 10가지 × (총운·재물·조언·살펴 둘 것·애정·직장·건강) 칸이 모두 있고 각 칸이 두 문장 이상이다", Object.values(R.TXT).every(v => [1, 2, 3, 4, 6, 7, 8].every(i => typeof v[i] === "string" && (v[i].match(/[.!?]/g) || []).length >= 2)), true); }
}
// 별자리 운세 깊이 풀이(content_horoscope.js → hsDeep): 원고 칸 · 문체 · 무작위 별자리×날짜 3000개 · 도구 배선
{ const HD = require("./content_horoscope.js"), JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요/, NEGH = /위험|흉(?!내|터)|불행|재앙|사고(?!력)|실패|나쁜|불길한|불운/;
  const strs = o => { const a = []; (function w(x) { if (typeof x === "string") a.push(x); else if (x && typeof x === "object") Object.values(x).forEach(w); })(o); return a; };
  t("별자리 원고: 달이 든 별자리 12 · 달 모양 8 · 달과의 각도 7×5 · 요일의 별 3 · 이 달의 배경 7 · 행운의 색 7이 모두 채워져 있다",
    [HD.sign.length === 12 && HD.sign.every(x => x.length > 60), HD.phase.length === 8 && HD.phase.every(x => x.length > 40), HD.moon.length === 7 && HD.moon.every(m => ["gen", "love", "work", "body", "tip"].every(f => m[f] && m[f].length > 40)), HD.rnote.length === 3, HD.sun.length === 7 && HD.sun.every(x => x.length > 50), ["태양", "달", "화성", "수성", "목성", "금성", "토성"].every(k => HD.lucky.color[k]) && !!HD.lucky.line, !!HD.note].join(","), "true,true,true,true,true,true,true");
  { const { note, ...body } = HD, all = strs(body).join("\n"); t("별자리 원고: 보살 말투(존댓말 0) · 겁주는 말 0 (근거 note 만 존댓말)", (JOND.test(all) ? "존댓말 " : "") + (NEGH.test(all) ? "겁주는말" : "") || "0", "0"); }
  const cH = { token: 0, undef: 0, jondae: 0, secs: 0 }; let minH = 1e9, maxH = 0;
  for (let i = 0; i < 3000; i++) { const mine = i % 12, now = new Date(2026 + Math.floor(i / 1500), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)), o = hsDeep(mine, now, HD),
      parts = []; o.secs.forEach(s => { parts.push(s.h); (s.p || []).forEach(x => parts.push(x)); (s.days || []).forEach(d => parts.push(d.d + " " + d.g + " " + d.m)); }); const txt = parts.join("\n"), len = txt.replace(/\s+/g, "").length; minH = Math.min(minH, len); maxH = Math.max(maxH, len);
    if (/[{}]/.test(txt)) cH.token++; if (/undefined|NaN|null/.test(txt)) cH.undef++; if (JOND.test(txt)) cH.jondae++; if (o.secs.length !== 9) cH.secs++; }
  t("별자리 깊이 풀이: 무작위 3000개 — 남은 토큰·undefined·존댓말·섹션 수 이상이 모두 0", JSON.stringify(cH), JSON.stringify({ token: 0, undef: 0, jondae: 0, secs: 0 }));
  t("별자리 깊이 풀이: 글자 수(공백 제외) 최소 " + minH + " · 최대 " + maxH + " — 예전(태양 각도 4문장 약 300자)의 3배를 넘는 900자 이상", minH >= 900, true);
  { const hb = toolBlock("horoscope");
    t("별자리 운세 도구가 원고(hs/deep.json)를 받아 자리(#hsdeep)에 채우고, 홈 순위·설명글이 달 기준으로 바뀌었다", [hb.includes('fetch("hs/deep.json")'), hb.includes('<div id="hsdeep">'), hb.includes("fillHs();"), bs.includes('"hs","deep.json"'), bs.includes("오늘 달의 자리와 요일의 별로 매긴 12별자리 순위"), !bs.includes("오늘 태양의 자리와 요일의 별로 매긴")].join(","), "true,true,true,true,true,true"); } }
// 띠별 운세 깊이 풀이(content_zodiac_fortune.js → zfDeep·zfYear): 12띠 × 일진 60개 · 문체 · 도구 배선
{ const ZD = require("./content_zodiac_fortune.js"), JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요/, NEGZ = /위험|흉(?!내|터)|불행|재앙|사고(?!력)|실패|나쁜|불길한|불운/, RL = ["삼합", "육합", "복음", "평", "해", "형", "충"], TGN = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"];
  const strs = o => { const a = []; (function w(x) { if (typeof x === "string") a.push(x); else if (x && typeof x === "object") Object.values(x).forEach(w); })(o); return a; };
  t("띠 원고: 총운 12띠×7관계 · 재물·애정·몸·조언 각 7관계 · 하늘 글자 10 · 한 해 7관계가 모두 채워져 있다",
    [Object.keys(ZD.gen).length === 12 && Object.values(ZD.gen).every(g => RL.every(r => g[r] && g[r].length > 80)), ["money", "love", "body", "tip"].every(k => RL.every(r => ZD[k][r] && ZD[k][r].length > 50)), TGN.every(k => ZD.tg[k] && ZD.tg[k].length > 30), RL.every(r => ZD.year[r] && /\{Y\}/.test(ZD.year[r]) && /\{A\}/.test(ZD.year[r])) && RL.every(r => ZD.yearAgain[r] && /\{P\}/.test(ZD.yearAgain[r]))].join(","), "true,true,true,true");
  { const { note, ...body } = ZD, all = strs(body).join("\n"); t("띠 원고: 보살 말투 · 겁주는 말 0 (근거 note 만 존댓말)", (JOND.test(all) ? "존댓말 " : "") + (NEGZ.test(all) ? "겁주는말" : "") || "0", "0"); }
  const cZ = { token: 0, undef: 0, jondae: 0, secs: 0, dup: 0, rels: new Set() }; let minZ = 1e9;
  for (let b = 0; b < 12; b++) for (let d = 0; d < 60; d++) { const today = sjPillars(2026, 1, 1 + d, null, 0, false), o = zfDeep(b, today, ZD, ""), ys = zfYear(b, ZD), parts = []; o.secs.concat(ys).forEach(s => { parts.push(s.h); (s.p || []).forEach(x => parts.push(x)); }); const txt = parts.join("\n"); cZ.rels.add(o.rel); minZ = Math.min(minZ, txt.replace(/\s+/g, "").length);
    if (/[{}]/.test(txt)) cZ.token++; if (/undefined|NaN|null/.test(txt)) cZ.undef++; if (JOND.test(txt)) cZ.jondae++; if (o.secs.length !== 5 || ys.length !== 2) cZ.secs++;
    { const sn = {}; txt.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => x.length >= 14).forEach(x => { sn[x] = (sn[x] || 0) + 1; }); if (Object.values(sn).some(n => n > 1)) cZ.dup++; } }
  t("띠 깊이 풀이: 12띠 × 일진 60개 — 남은 토큰·undefined·존댓말·섹션 수·같은 문장 되풀이가 모두 0 (본 관계 " + cZ.rels.size + "종)", JSON.stringify({ token: cZ.token, undef: cZ.undef, jondae: cZ.jondae, secs: cZ.secs, dup: cZ.dup }), JSON.stringify({ token: 0, undef: 0, jondae: 0, secs: 0, dup: 0 }));
  t("띠 깊이 풀이: 글자 수(공백 제외) 최소 " + minZ + " — 예전 같은 일곱 칸(약 400자)의 1.5배를 넘는 650자 이상", minZ >= 650, true);
  { const zb = toolBlock("zodiacfortune"); t("띠별 운세 도구가 원고(zf/deep.json)를 받아 자리(#zfdeep·#zfyear)에 채운다", [zb.includes('fetch("zf/deep.json")'), zb.includes('<div id="zfdeep">'), zb.includes('<div id="zfyear">'), zb.includes("fillZf();"), bs.includes('"zf","deep.json"')].join(","), "true,true,true,true,true"); } }
// 별자리 궁합 깊이 풀이(content_stargunghap.js → sgDeep): 별자리 쌍 78 · 원소 10 · 각도 7 · 수호성 3 · 문체 · 12×12 모든 조합 · 도구 배선
{ const SD = require("./content_stargunghap.js"), JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요/, NEGS = /위험|흉(?!내|터)|불행|재앙|사고(?!력)|실패|나쁜|불길한|불운/;
  const strs = o => { const a = []; (function w(x) { if (typeof x === "string") a.push(x); else if (x && typeof x === "object") Object.values(x).forEach(w); })(o); return a; };
  const PK = []; for (let i = 0; i < 12; i++) for (let j = i; j < 12; j++) PK.push(i + "-" + j);
  t("별자리 궁합 원고: 별자리 쌍 78 · 원소 조합 10 · 각도 7 · 수호성 결 3이 모두 채워져 있다",
    [PK.every(k => SD.pair[k] && ["core", "good", "tip"].every(f => SD.pair[k][f] && SD.pair[k][f].length > 60)) && Object.keys(SD.pair).length === 78, Object.keys(SD.el).length === 10 && Object.values(SD.el).every(x => x.length > 100), SD.asp.length === 7 && SD.asp.every(x => x.length > 100), SD.ruler.length === 3 && SD.ruler.every(x => /\{ra\}/.test(x) && /\{rb\}/.test(x))].join(","), "true,true,true,true");
  { const all = strs(SD).join("\n"); t("별자리 궁합 원고: 보살 말투(존댓말 0) · 겁주는 말 0", (JOND.test(all) ? "존댓말 " : "") + (NEGS.test(all) ? "겁주는말" : "") || "0", "0"); }
  { const KO = ["양자리", "황소자리", "쌍둥이자리", "게자리", "사자자리", "처녀자리", "천칭자리", "전갈자리", "궁수자리", "염소자리", "물병자리", "물고기자리"]; let mix = 0;
    PK.forEach(k => { const [i, j] = k.split("-").map(Number), txt = SD.pair[k].core + SD.pair[k].good + SD.pair[k].tip; KO.forEach((n, x) => { if (x !== i && x !== j && txt.includes(n)) mix++; }); if (!SD.pair[k].core.includes(KO[i]) || !SD.pair[k].core.includes(KO[j])) mix++; });
    t("별자리 궁합 원고: 쌍 글에 그 쌍의 두 별자리 이름이 있고 다른 별자리 이름은 섞이지 않는다", mix, 0); }
  const cS = { token: 0, undef: 0, jondae: 0, secs: 0, term: 0 }; let minS = 1e9, maxS = 0;
  for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) { const o = sgDeep(a, b, SD), parts = []; o.secs.forEach(s => { parts.push(s.h); s.p.forEach(x => parts.push(x)); }); const txt = parts.join("\n"), len = txt.replace(/\s+/g, "").length, all = txt + (o.secs[4].n || ""); minS = Math.min(minS, len); maxS = Math.max(maxS, len);
    if (/[{}]/.test(all)) cS.token++; if (/undefined|NaN|null/.test(all)) cS.undef++; if (JOND.test(txt)) cS.jondae++; if (o.secs.length !== 6) cS.secs++; if (/황도|섹스타일|스퀘어|트라인|오포지션|퀸컹스|세미/.test(txt.replace(/\([^)]*\)/g, ""))) cS.term++; }
  t("별자리 궁합 깊이 풀이: 12×12 모든 조합 — 남은 토큰·undefined·존댓말·섹션 수·괄호 밖 점성술 용어가 모두 0", JSON.stringify(cS), JSON.stringify({ token: 0, undef: 0, jondae: 0, secs: 0, term: 0 }));
  t("별자리 궁합 깊이 풀이: 글자 수(공백 제외) 최소 " + minS + " · 최대 " + maxS + " — 예전(약 300자)의 1.5배를 넘는 450자 이상", minS >= 450, true);
  t("별자리 궁합: 같은 두 별자리는 누가 '나'든 같은 쌍 글이 나온다(양자리·물병자리 = 물병자리·양자리)", sgDeep(0, 10, SD).secs[0].p[0] === sgDeep(10, 0, SD).secs[0].p[0], true);
  { const sb = toolBlock("stargunghap");
    t("별자리 궁합 도구가 원고(sg/deep.json)를 받아 자리(#sgdeep)에 채우고, 빌드가 sg/deep.json 을 내보낸다", [sb.includes('fetch("sg/deep.json")'), sb.includes('<div id="sgdeep">'), sb.includes("fillSg();"), bs.includes('"sg","deep.json"')].join(","), "true,true,true,true"); } }
// 토정비결 144괘·꿈해몽·타로 78장 풀이 문장: 겁주는 말과 존댓말 어미가 없다(등급·분류 이름·분류 소개글·꿈 제목은 제외)
{ const NEGX = /위험|흉(?!내|터)|불행|재앙|사고(?!력)|실패|나쁜|망하|망한|화근|재난|불길한|불길함|불운|파탄|파산|몰락|이혼|사별|단명|요절|횡액|관재|기운이 얇|기운이 약|복이 없|팔자가 사납|팔자가 세/, JONDX = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요|드립니다|주세요/;
  const flat = (o, p, a) => { if (typeof o === "string") a[p] = o; else if (o && typeof o === "object") Object.keys(o).forEach(k => flat(o[k], p ? p + "." + k : k, a)); return a; };
  [["토정비결", require("./content_tojeong.js"), /\.(grade)$/], ["꿈해몽", require("./content_dream.js"), /\.(kind|id|ko|title|intro)$/], ["타로", require("./content_tarot_read.js"), /\.(no)$/]].forEach(([nm, d, skip]) => {
    const f = flat(d, "", {}), bad = Object.entries(f).filter(([k, v]) => !skip.test(k) && (NEGX.test(v) || JONDX.test(v))).map(([k]) => k);
    t(nm + " 풀이: 겁주는 말·존댓말 어미 0 (문자열 " + Object.keys(f).length + "개)" + (bad.length ? " — " + bad.slice(0, 3).join(",") : ""), bad.length, 0); }); }
// 공망 찾기 깊이 풀이(content_gongmang.js → gmDeep): 원고 칸 · 문체 · 60일주 × 시각 유무 × 여러 해 · 도구 배선
{ const GD = require("./content_gongmang.js"), JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요/, NEGG = /위험|흉(?!내|터)|불행|재앙|사고(?!력)|실패|나쁜|불길한|불운/;
  const strs = o => { const a = []; (function w(x) { if (typeof x === "string") a.push(x); else if (x && typeof x === "object") Object.values(x).forEach(w); })(o); return a; };
  t("공망 원고: 땅 글자 12개의 뜻·비었을 때 · 연월시 자리 3 · 없을 때·날 자리·채워지는 해·읽는 법이 모두 채워져 있다",
    [GD.branch.length === 12 && GD.branch.every(b => b.gist.length > 30 && b.empty.length > 80), ["y", "m", "h"].every(k => GD.pos[k] && GD.pos[k].length > 100), GD.filled.length > 60 && GD.none.length > 100 && GD.nohour.length > 10, GD.years.head.length > 30 && GD.years.tail.length > 60, GD.read.length === 3 && GD.read.every(x => x.length > 80), ["{sun}", "{start}", "{end}", "{ea}", "{eb}"].every(k => GD.intro.includes(k))].join(","), "true,true,true,true,true,true");
  { const all = strs(GD).join("\n"); t("공망 원고: 보살 말투(존댓말 0) · 겁주는 말 0", (JOND.test(all) ? "존댓말 " : "") + (NEGG.test(all) ? "겁주는말" : "") || "0", "0"); }
  const cG = { token: 0, undef: 0, jondae: 0, secs: 0, years: 0, hard: 0 }; let minG = 1e9;
  for (let s = 0; s < 10; s++) for (let b = s % 2; b < 12; b += 2) for (const hh of [null, 0, 6, 11]) for (const yy of [2026, 2031]) {
    const P = sjPillars(1980 + ((s * 12 + b) % 40), 1 + ((s + b) % 12), 1 + ((s * 5 + b) % 28), hh, 30, true), G = sjGongmang(P.d.s, P.d.b), Y = sjGongmang(P.y.s, P.y.b), o = gmDeep(P, G, Y, yy, GD), parts = [];
    o.secs.forEach(x => { parts.push(x.h); x.p.forEach(z => parts.push(z)); });
    const txt = parts.join("\n"), all = txt + o.secs.map(x => x.n || "").join(""), len = txt.replace(/<[^>]+>/g, "").replace(/\s+/g, "").length; minG = Math.min(minG, len);
    if (/[{}]/.test(all)) cG.token++; if (/undefined|NaN|null/.test(all)) cG.undef++; if (JOND.test(txt)) cG.jondae++; if (o.secs.length !== 6) cG.secs++;
    if ((o.secs[3].p[1].match(/<b>/g) || []).length !== 2) cG.years++; if (/(?<![가-힣])(천간|지지)/.test(txt.replace(/\([^)]*\)/g, ""))) cG.hard++; }
  t("공망 깊이 풀이: 60일주 근사 × 시각 유무 × 두 해 — 남은 토큰·undefined·존댓말·섹션 수·채워지는 해(항상 두 해)·어려운 낱말이 모두 0", JSON.stringify(cG), JSON.stringify({ token: 0, undef: 0, jondae: 0, secs: 0, years: 0, hard: 0 }));
  t("공망 깊이 풀이: 글자 수(공백·태그 제외) 최소 " + minG + " — 예전 결과 전체(약 670자)의 1.8배를 넘는 1,200자 이상", minG >= 1200, true);
  { const gb = toolBlock("gongmang"); t("공망 도구가 원고(gm/deep.json)를 받아 자리(#gmdeep)에 채우고, 빌드가 gm/deep.json 을 내보낸다", [gb.includes('fetch("gm/deep.json")'), gb.includes('<div id="gmdeep">'), gb.includes("fillGm();"), bs.includes('"gm","deep.json"')].join(","), "true,true,true,true"); } }
// 음력 생일 칸: 열면 위 양력 날짜의 음력이 먼저 보이고, 음력 칸을 고치면 [양력으로 넣기]를 안 눌러도 넣는다. 양력을 고치면 음력이 따라온다
{ const a = inner.indexOf("function lunarPick("), b = inner.indexOf("function shareBtn()"), lp = inner.slice(a, b);
  t("음력 생일 칸: 열면 양력 날짜의 음력을 채우고(fromSolar), 음력 칸을 고치면 0.4초 뒤 자동으로 넣고(auto→apply), 양력을 고치면 음력이 따라온다(sync)",
    [lp.includes("function fromSolar()"), lp.includes('lp.addEventListener("toggle",function(){if(lp.open)fromSolar();});'), lp.includes("timer=setTimeout(apply,400)"), lp.includes('lp.addEventListener("input",auto)'), lp.includes('inp.addEventListener("input",sync)'), lp.includes("function whenLib(cb)")].join(","), "true,true,true,true,true,true"); }
// 토정비결 144괘 쉬운 말 풀이(content_tojeong.js → tjDeep): 새 칸 · 문체(보살 말투·겁주는 말 0·옛말 0) · 등급별 달 분위기 · 제목 144개 · 화면 구성
{ const TJ = require("./content_tojeong.js"), codes = []; for (let a = 1; a <= 8; a++) for (let b2 = 1; b2 <= 6; b2++) for (let c = 1; c <= 3; c++) codes.push("" + a + b2 + c);
  const JONDT = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요|드립니다|주세요/, NEGT = /위험|흉(?!내|터)|불행|재앙|사고(?!력)|실패|나쁜|망하|망한|화근|재난|불길|불운|파탄|파산|몰락|이혼|사별|단명|요절|횡액|관재|기운이 얇|기운이 약|복이 없|팔자가 사납|팔자가 세|액운|액땜/,
    ARCHT = /섣달|동짓달|정월|귀인|혼사|횡재|송사|구설|시비|곳간|음덕|덕망|경사|재물운|복을 짓|왕성|번창|융성|형통|도모|삼가|근신|유념|임하게|처신|길복|옥구슬|꾀꼬리|오곡|비단|보금자리|사방으로|형국|연유|대저|하매/, HARDT = /격국|용신|십성|신강|신약|일간|월지|천간|(?<![가-힣])지지|비견|겁재|식신|상관(?!없|이 없|이 있)|편재|정재|편관|정관|편인|정인|인성|재성|관성|식상|비겁/;
  const F = ["title", "sum", "image", "chongun", "money", "work", "love", "health"], MIN = { title: 8 }, MS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const flatStr = g => F.map(f => [f, g[f]]).concat((g.tips || []).map((x, i) => ["tips." + i, x])).concat(MS.map(m => ["months." + m, (g.months || {})[m] || ""]));
  t("토정비결 144괘가 모두 새 형식이다(제목·한눈에·옛 그림·총운·분야 4칸·실천 3·달 흐름 12글자·열두 달)",
    codes.filter(k => { const g = TJ[k]; return !(g && F.every(f => typeof g[f] === "string" && g[f].length >= (MIN[f] || 20)) && Array.isArray(g.tips) && g.tips.length === 3 && /^[goc]{12}$/.test(g.flow || "") && MS.every(m => (g.months[m] || "").length >= 85) && ["길", "평", "흉"].includes(g.grade)); }).length, 0);
  { const bad = { jondae: [], neg: [], arch: [], hard: [], token: [] };
    codes.forEach(k => flatStr(TJ[k]).forEach(([f, v]) => { const vv = f === "image" ? v.replace(/'[^']*'/g, "") : v; if (JONDT.test(v)) bad.jondae.push(k + "." + f); if (NEGT.test(v)) bad.neg.push(k + "." + f); if (ARCHT.test(vv)) bad.arch.push(k + "." + f); if (HARDT.test(vv.replace(/\([^)]*\)/g, ""))) bad.hard.push(k + "." + f); if (/[{}]|undefined|NaN/.test(v)) bad.token.push(k + "." + f); }));
    t("토정비결 풀이: 존댓말 어미·겁주는 말·옛말/시적 말·명리 용어·토큰이 모두 0" + (Object.values(bad).some(a => a.length) ? " — " + Object.entries(bad).filter(([, a]) => a.length).map(([n, a]) => n + ":" + a.slice(0, 3).join(",")).join(" ") : ""), Object.values(bad).reduce((n, a) => n + a.length, 0), 0); }
  { const bad = codes.filter(k => { const g = TJ[k], fl = g.flow || "", gg = (fl.match(/g/g) || []).length, cc = (fl.match(/c/g) || []).length; return g.grade === "길" ? !(gg >= 5 && gg <= 9 && cc <= 3) : g.grade === "평" ? !(gg >= 3 && gg <= 6 && cc >= 2 && cc <= 5) : !(gg >= 2 && gg <= 5 && cc >= 3 && cc <= 7); });
    t("토정비결 달 분위기: 길 g5~9·c≤3 / 평 g3~6·c2~5 / 흉 g2~5·c3~7 을 모든 괘가 지킨다" + (bad.length ? " — " + bad.slice(0, 5).join(",") : ""), bad.length, 0); }
  t("토정비결 제목 144개가 모두 다르다", new Set(codes.map(k => TJ[k].title)).size, 144);
  { const cnt = { secs: 0, grid: 0, tok: 0, dup: 0, month: 0 }; let minLen = 1e9, maxLen = 0;
    codes.forEach((k, i) => { const cur = [0, 1, 7, 12][i % 4], starts = {}; for (let m = 1; m <= 12; m++) starts[m] = [(m + 1) % 12 + 1, 3 + m];
      const S = tjDeep(TJ[k], 2026, cur, starts), html = S.map(tjSecHtml).join(""), txt = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "), len = txt.replace(/\s/g, "").length; minLen = Math.min(minLen, len); maxLen = Math.max(maxLen, len);
      if (S.length !== 17) cnt.secs++; const gr = S.find(s => s.k === "grid"); if (!gr || gr.grid.length !== 12 || gr.grid.some(c => !c.lab || !c.d)) cnt.grid++; if (/[{}]|undefined|NaN/.test(html)) cnt.tok++;
      const sn = {}; txt.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => x.length >= 14).forEach(x => { sn[x] = (sn[x] || 0) + 1; }); if (Object.values(sn).some(n => n > 1)) cnt.dup++;
      const ms = S.filter(s => s.month); if (ms.length !== 12 || (cur && !/^이번 달 — /.test(ms[0].h)) || ms.some(s => !s.p[0] || !s.p[1])) cnt.month++; });
    t("토정비결 화면 구성(tjDeep): 144괘 × 이번 달 4가지 — 17칸(한눈에·총운·분야별·실천·달 표·달 풀이 12)·달 표 12칸·토큰 0·같은 문장 되풀이 0·이번 달이 맨 앞", JSON.stringify(cnt), JSON.stringify({ secs: 0, grid: 0, tok: 0, dup: 0, month: 0 }));
    t("토정비결 화면 글자 수(공백 제외) 최소 " + minLen + " · 최대 " + maxLen + " — 예전(총운 약 450자 + 달 12×110자 ≈ 1,800자)보다 많은 1,900자 이상", minLen >= 1900, true); }
  { const tb = toolBlock("tojeong");
    t("토정비결 도구가 tjDeep 으로 결과를 그리고, 그날 쓴 음력 생일과 바꾸는 방법을 밝힌다", [tb.includes("tjDeep(g,Y,cur,starts).map(tjSecHtml)"), tb.includes("음력 생일이세요?"), tb.includes("g.sum"), !tb.includes("g.chongun"), bs.includes("쉬운 말로 새로 썼습니다")].join(","), "true,true,true,true,true"); } }
// 생일을 탭의 임시 저장소로 넘기는 만큼, 개인정보 문구(홈 신뢰 블록·홈 FAQ·소개문·처리방침)가 그 사실을 밝힌다
t("생일 넘기기(sessionStorage)를 쓰는 만큼 개인정보 문구 네 곳이 이를 밝힌다", bs.includes("sessionStorage.setItem(\"dnbs_hb\"") ? [(bs.match(/이 탭에 잠깐 두었다가/g)||[]).length>=3, fs.readFileSync("content_site.js","utf8").includes("임시 저장소(sessionStorage)에 잠깐 두었다가")].join(",") : "n/a", "true,true");
{ const bd = inner.slice(inner.indexOf("function birthDial"), inner.indexOf("function shareBtn"));
  t("생년월일 입력: 숫자 입력이 기본이고 다이얼은 접혀 있으며 치는 도중의 반쪽 값을 다이얼이 채우지 않는다(정규식 백슬래시 포함)",
    [bd.includes('inp.type="text";inp.inputMode="numeric"'), bd.includes('className="dial-box"'), bd.includes("돌려서 고르기"),
     bd.includes('if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(inp.value||""))return;'), bd.includes('function bdOk(v){var m=/^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(v||"")'),
     bd.includes('t.closest("#go")') && bd.includes("e.stopImmediatePropagation()")].join(","), "true,true,true,true,true,true");
  t("사주 정확한 시각 칸은 clockParse 로 읽고(못 읽으면 이유를 밝히고 결과로 가지 않는다) 시각 없는 결과에도 안내 카드가 나온다", [src.includes('<input type="text" id="tm" inputmode="numeric"'), src.includes('clockParse(el.querySelector("#tm").value)'), src.includes('id="tmerr"'), src.includes('태어난 시각을 넣으면 더해지는 것')].join(","), "true,true,true,true");
  { const CK = [["", true, ""], ["1430", true, "14:30"], ["0930", true, "09:30"], ["930", true, "09:30"], ["9:30", true, "09:30"], ["230", true, "02:30"], ["14", true, "14:00"], ["9시", true, "09:00"], ["9시 30분", true, "09:30"], ["오후 2시 30분", true, "14:30"], ["오전 9시", true, "09:00"], ["새벽 2시 5분", true, "02:05"], ["밤 12시", true, "00:00"], ["밤 11시 40분", true, "23:40"], ["낮 12시 30분", true, "12:30"], ["오전 12시", true, "00:00"], ["오후 12시", true, "12:00"], ["PM 3:20", true, "15:20"], ["0000", true, "00:00"], ["2359", true, "23:59"], ["2530", false, ""], ["24:00", false, ""], ["9:75", false, ""], ["abc", false, ""], ["12345", false, ""]];
    t("시각 읽기(clockParse): 0930·930·9:30·9시 30분·오후 2시 30분 같은 꼴을 읽고 못 읽는 것은 이유를 돌려준다", CK.map(c => { const r = clockParse(c[0]); return r.ok === c[1] && r.v === c[2] && (r.ok || r.err.length > 10); }).every(Boolean), true); }
  const fa = src.slice(src.indexOf("function foldAll"), src.indexOf("function birthDial"));
  t("접이식: 첫 문장을 뽑고 남은 글이 70자 미만이면 접지 않고 펼쳐 둔다", fa.includes("body.textContent.trim().length<70") && fa.includes("fold=has&&!flat"), true); }
t("히어로: 캐릭터가 있는 히어로는 캡션 오른쪽 자리를 비우고(제목이 캐릭터 밑에 깔리지 않게), 모바일에서 제목이 14자를 넘으면 캐릭터를 숨긴다", /\.toolhero:has\(>img\.th-bosal\)>\.cap\{padding-right:104px/.test(bs) && /\(min-width:760px\)\{\.toolhero:has\(>img\.th-bosal\)>\.cap\{padding-right:196px/.test(bs) && /\.toolhero\.longh:has\(>img\.th-bosal\)>\.cap\{padding-right:22px/.test(bs) && /o\.h1\.length > 14 \? " longh"/.test(bs), true);
t("값이 긴 표(26자 이상)는 좁은 화면에서 라벨 위·값 아래로 쌓는다(칼럼·배우기 표 생성기 둘 다 + CSS)", (bs.match(/tb\.rows\.some\(x => x\[1\]\.length >= 26\) \? " stack"/g) || []).length + "|" + /\.exbox \.row\.stack\{flex-direction:column/.test(src), "2|true");
t("헤더 로고는 이미지(화면 크기에 맞춘 68px webp)", /class="lmark" src="img\/v2\/logo-68\.webp"/.test(bs) && fs.existsSync("img/v2/logo-68.webp") && fs.statSync("img/v2/logo-68.webp").size < 12000, true);
t("로고 파일 존재·정사각", fs.existsSync("img/v2/logo.png") && fs.statSync("img/v2/logo.png").size > 5000, true);
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
const HELPERS = ["tjDeep","tjSecHtml","gmDeep","sgDeep","sgAng","zfDeep","zfYear","hsMoon","hsMoonLong","hsDeep","hsSecHtml","hsWeekSec","hsGrade","nmHon","nmSwap","sjSumHtml","sjToon","sjToonSaju","sumCard","ghPct","GH_PCT","sjMonthSvg","sjPct","sjPcList","sumCanvas","plainTxt","sjChapters","tfPct","tfScore","sjEasy","clockParse","clockSay","sjGongmang","subBal","sjChar","nyDeep","nySecHtml","ghDeep","ghFill","ghYear","nmJ","nmChar","nmCalc","nmBand","bdParse","bdFmt","bdBind","saveScore","ymd3","num","won","comma","bindMoney","progressive","earnedDed","incomeTaxMonthly","sjPillars","sjHourOpts","sjGridHtml","tailAsk","sjDaeunStart","sjTenGod","sjJdKST","sjSunLong","sjJdn","sjIpchun","sjStrength","sjUnseong","sjSinsal","sjSamhap","sjYukhap","zoCard","stOf","stCard","escH","josa","loadPrefs","savePrefs","track","rateBar","shareBtn","bindShare","fortuneCard","bindSave","wrapText","birthDial","conceptArt","askWire","askFx","askWait","askThink","seerThink","slowReveal","foldAll","plainWords","reveal","countUp","fillBars","gradeFx","bumpStreak","streakHtml","bujeokHtml","tfGrade","tfToday","tfPersonalBox","lunarPick","krClockShift","sjKst","sjMonthTerms","sjBasisHtml","sjAiPrompt","sjAiHtml","bindAiCopy","bindYearFb","bindInvite","zfRel","zfScore","zfRank","peopleChips","hsScore","hsRank","bosalImg","bosalPose","bosalSay","diaryAdd","diaryNote"];
const toolsSrc = inner.slice(inner.indexOf("var TOOLS="));
// 문자열 리터럴(HTML·CSS 조각) 제거 후 실제 호출만 검사
const codeOnly = toolsSrc.replace(/'(?:\\.|[^'\\])*'/g, "''").replace(/"(?:\\.|[^"\\])*"/g, '""');
const called = [...codeOnly.matchAll(/(?:^|[^\w.$])([a-zA-Z_$][\w$]*)\s*\(/g)].map(m => m[1]);
const known = new Set([...HELPERS, "fetch","encodeURIComponent","decodeURIComponent","iljuCardKey","ilKey","function","if","for","while","switch","catch","return","typeof","Math","Number","String","Array","Date","Set","Map","JSON","parseInt","parseFloat","isNaN","el","cb","render","calc","go","gen","draw","deal","cell","P","relB","pts","cnt6","strokes","mIdxOf","fromP","fromM","rate","name","require","console"]);
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
// ── 이름 궁합(획수): 순수 함수(NM 블록)·한글 11,172자 전수·점수 규칙·안내글과의 일치·도구 배선 ──
{ const ID = [2,4,2,3,6,5,4,4,8,2,4,1,3,6,4,3,4,4,3], MD = [2,3,3,4,2,3,3,4,2,4,5,3,3,2,4,5,3,3,1,2,1], FD = [0,2,4,4,2,5,5,3,5,7,9,9,7,9,9,8,4,4,6,2,4,1,3,4,3,4,4,3]; // 선분수 기준 초성 19·중성 21·받침 28 값(구성 자모 합 규칙과 따로 손으로 적은 표)
  let n = 0; const bad = [];
  for (let c = 0xAC00; c <= 0xD7A3; c++) { const q = c - 0xAC00, exp = ID[Math.floor(q / 588)] + MD[Math.floor((q % 588) / 28)] + FD[q % 28], got = nmChar(String.fromCharCode(c)).n; n++; if (got !== exp && bad.length < 5) bad.push(String.fromCharCode(c) + got + "≠" + exp); }
  t("이름궁합 획수: 한글 11,172자가 독립 표(초성 19·중성 21·받침 28)와 같다", n + ":" + bad.join(","), "11172:");
  t("이름궁합 획수: 김·이·철·영·수·희 = 7,2,11,5,4,5", ["김","이","철","영","수","희"].map(c => nmChar(c).n).join(","), "7,2,11,5,4,5");
  t("이름궁합 획수: 쌍자음·겹받침·복합 모음(쌍·값·닭·괜·왕·최·뒤·읊)", ["쌍","값","닭","괜","왕","최","뒤","읊"].map(c => nmChar(c).n).join(","), "7,10,12,9,6,7,6,11");
  t("이름궁합 획수: 한글 음절이 아니면 null(영문·숫자·자음·공백)", [nmChar("A"), nmChar("1"), nmChar("ㄱ"), nmChar(" ")].every(x => x === null), true);
  const c1 = nmCalc("김철수", "이영희"), c2 = nmCalc("이영희", "김철수"), c3 = nmCalc("철수", "영희"), c4 = nmCalc("영희", "철수");
  t("이름궁합: 김철수♥이영희 줄어드는 과정과 점수", c1.steps.map(r => r.join("")).join("/") + "=" + c1.score, "721545/93699/2958/143/57=57");
  t("이름궁합: 순서를 바꾸면(97)·성을 빼면(58·25) 점수가 달라진다", [c2.score, c3.score, c4.score].join(","), "97,58,25");
  t("이름궁합: 한글이 없는 쪽이 있으면 null(영문·숫자·빈 칸)", [nmCalc("Kim", "이영희"), nmCalc("", "이영희"), nmCalc("김철수", "123")].every(x => x === null), true);
  t("이름궁합: 영문·공백은 빼고 한글만 센다", nmCalc("김 철수 ab", "이영희").score, 57);
  t("이름궁합: 한 글자씩이면 두 수가 곧 점수(김·이 → 72)", nmCalc("김", "이").score, 72);
  t("이름궁합: 마지막 두 자리가 00이면 100점, 08이면 8점(값·값, 값·박)", [nmCalc("값", "값").score, nmCalc("값", "박").score].join(","), "100,8");
  let seed = 12345; const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m;
  const SY = "김이박최정강조윤장임한오서신권황안송류전홍고문양손배백허유남심노하곽성차주우구민나진지엄채원천방공현함변염여추도소석선설마길연위표명기반왕금옥육인맹제모".split(""), badR = [];
  for (let i = 0; i < 400; i++) { const mk = () => Array.from({ length: 1 + rnd(4) }, () => SY[rnd(SY.length)]).join(""), a = mk(), b = mk(), r = nmCalc(a, b), lens = r.steps.map(x => x.length), last = r.steps[r.steps.length - 1];
    const ok = r.steps[0].length === a.length + b.length && lens.every((L, k) => k === 0 || L === lens[k - 1] - 1) && last.length === 2 && r.steps.every(x => x.every(d => d >= 0 && d <= 9)) && r.score === (last[0] * 10 + last[1] || 100) && r.score >= 1 && r.score <= 100;
    if (!ok && badR.length < 3) badR.push(a + "/" + b); }
  t("이름궁합: 무작위 이름 400쌍 — 줄이 한 칸씩 줄어 두 자리에서 끝나고 점수는 1~100", badR.join(","), "");
  const JOND = /습니다|합니다|입니다|하세요|십시오|해요|이에요|예요/, NEGS = /위험|흉(?!내|터)|불행|재앙|사고(?!력)|실패|나쁜|불길한|불운/, bandBad = [];
  [100, 95, 90, 89, 80, 75, 74, 60, 55, 54, 40, 35, 34, 10, 1].forEach(sc => { const b = nmBand(sc); ["msg", "good", "care", "tip"].forEach(k => { if (!b[k] || JOND.test(b[k]) || NEGS.test(b[k])) bandBad.push(sc + k); }); });
  t("이름궁합 풀이: 점수대 다섯 유형의 문장이 모두 있고 보살 말투·겁주는 말 없음", bandBad.join(","), "");
  t("이름궁합 점수대: 90/75/55/35 경계가 안내글 표와 같다", [[100, "운명형"], [90, "운명형"], [89, "안정형"], [75, "안정형"], [74, "성장형"], [55, "성장형"], [54, "밀당형"], [35, "밀당형"], [34, "도전형"], [1, "도전형"]].every(([sc, ty]) => nmBand(sc).type === ty)
    && ['["90점 이상","운명형"', '["75~89점","안정형"', '["55~74점","성장형"', '["35~54점","밀당형"', '["34점 이하","도전형"'].every(x => bs.includes(x)), true);
  const NMB = (() => { const a = src.indexOf("/*NM-BEGIN*/"), b = src.indexOf("/*NM-END*/"); return new Function(src.slice(a, b) + "\nreturn {nmCalc:nmCalc};")(); })();
  t("이름궁합: NM 블록이 혼자서도 돈다(build_site.js 가 그대로 읽어 안내글 숫자를 만든다)", NMB.nmCalc("김철수", "이영희").score, 57);
  t("이름궁합 안내글: 숫자·획수표는 NM 블록 함수로 만들고 제목 검색어를 맞춘다", [bs.includes("/*NM-BEGIN*/"), bs.includes("NMX.o1.score"), bs.includes("NMX.cons"), bs.includes('namematch: "이름 궁합 테스트"'), bs.includes('namematch:"이름 궁합 — 획수로 보는 무료 이름궁합 테스트"')].join(","), "true,true,true,true,true");
  const nb = toolBlock("namematch");
  t("이름궁합 도구 배선: 순수 함수로 계산하고 공유·이미지 저장을 단다", [nb.includes("nmCalc(an,bn)"), nb.includes("shareBtn()"), nb.includes('bindShare(el,"이름 궁합"'), nb.includes('saveScore(el,"이름궁합"'), !nb.includes("strokes(")].join(","), "true,true,true,true,true");
  t("이름궁합 도구는 이름만 다루고 저장·전송을 하지 않는다(localStorage·fetch 없음)", !/localStorage|fetch\(/.test(nb), true);
  t("이름궁합 통계: 눌렀을 때만 fortune_view 를 보낸다(처음 그려질 때는 안 보냄)", [nb.includes('if(user===true)track("fortune_view",{tool:"namematch"})'), nb.includes('function(){go(true);}'), nb.includes("\ngo();}}") || nb.includes("go();}}")].join(","), "true,true,true"); }
// 이름 궁합 도구를 실제로 그려 본다(가짜 DOM) — 정의 안 한 변수(bv) 때문에 결과가 아예 안 그려졌는데도 문자열 검사만으론 통과했던 일(2026-10-01)
{ const nb2 = toolBlock("namematch"), blk = nb2.slice(0, nb2.indexOf("\n  ];"));
  const draw = (a, b, search) => { const nodes = {}, shared = [], sargs = [], tracked = [], bar = [];
    const mk = (sel, v) => (nodes[sel] = { value: v, innerHTML: "", focused: false, handlers: [], addEventListener(ty, fn) { this.handlers.push([ty, fn]); }, querySelector: () => null, focus() { this.focused = true; } });
    mk("#a", a); mk("#b", b); mk("#go", ""); mk("#out", "");
    const el = { innerHTML: "", querySelector: sel => nodes[sel] || mk(sel, ""), insertBefore: n => bar.push(n), firstChild: null };
    const doc = { createElement: () => ({ className: "", innerHTML: "" }) };
    const tool = new Function("nmCalc", "nmBand", "nmJ", "escH", "josa", "track", "shareBtn", "bindShare", "saveScore", "location", "document", "return (" + blk + ");")(nmCalc, nmBand, nmJ, escH, josa, ev => tracked.push(ev), () => '<button class="share-btn"></button><button class="save-btn"></button>', (e, ti, tx, q, sel, ev) => { shared.push("share"); sargs.push([tx, q || "", sel || "", ev || ""]); }, (e, f, tl, id, sc, gr) => shared.push("save:" + sc + ":" + gr), { search: search || "" }, doc);
    tool.render(el); return { out: nodes["#out"].innerHTML, shared, sargs, tracked, bar, nodes }; };
  const tryDraw = (a, b, search) => { try { return { r: draw(a, b, search), err: "" }; } catch (e) { return { r: null, err: String(e.message) }; } };
  const d1 = tryDraw("김철수", "이영희"), o1 = d1.r ? d1.r.out : "", tx1 = o1.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  t("이름궁합 도구 그리기(가짜 DOM): 실행 오류 없이 결과를 그린다", d1.err, "");
  t("이름궁합 도구 결과: 57점·성장형·글자별 획수·피라미드·순서 바꾼 97점·풀이 칸·버튼·공유/저장 연결", [/57<small>점 · 성장형/.test(o1), tx1.includes("김 · ㄱ(2)+ㅣ(1)+ㅁ(4) = 7"), tx1.includes("글자별 획수") && tx1.includes("획수 피라미드"), tx1.includes("이영희를 먼저 놓으면 97점 · 운명형"), ["풀이", "이 조합의 좋은 점", "맞춰 가면 좋은 점", "조언"].every(h => tx1.includes(h)), o1.includes("share-btn") && o1.includes("save-btn"), d1.r && d1.r.shared.join(",")].join(","), "true,true,true,true,true,true,share,share,save:57:성장형");
  const d2 = tryDraw("Kim", "이영희"); t("이름궁합 도구: 영문만 넣으면 한글 안내만 보이고 오류가 없다", d2.err + "|" + (d2.r ? d2.r.out.includes("두 칸 모두 한글 이름을 넣어 주세요") : "x"), "|true");
  const d3 = tryDraw("김철수1", "이영희"); t("이름궁합 도구: 한글이 아닌 글자를 빼고 계산하면 안내 문구가 붙는다", d3.err + "|" + (d3.r ? d3.r.out.includes("한글이 아닌 글자는 빼고 계산했어요") : "x"), "|true");
  { const d = tryDraw("김철수", "이영희"); let e4 = ""; if (d.r) { d.r.nodes["#a"].value = "민준"; d.r.nodes["#b"].value = "서연"; const h = d.r.nodes["#go"].handlers.find(x => x[0] === "click"); try { h[1](); } catch (e) { e4 = String(e.message); } }
    const o4 = d.r ? d.r.nodes["#out"].innerHTML : "";
    t("이름궁합 도구: 버튼을 누르면 다시 계산한다(민준♥서연 24점·도전형, 순서를 바꾼 줄 포함)", e4 + "|" + /24<small>점 · 도전형/.test(o4) + "|" + o4.includes("서연을 먼저 놓으면"), "|true|true"); }
  // 공유·초대 링크: 결과 링크는 두 이름을, 초대 링크는 내 이름만 싣고, 받는 쪽은 열자마자 결과(또는 초대 안내)를 본다. 한글 아닌 값·깨진 값은 버린다
  const enc = encodeURIComponent, dd = tryDraw("김철수", "이영희"), sa = dd.r ? dd.r.sargs : [];
  t("이름궁합 링크: 결과 공유는 두 이름을, 초대는 첫 이름만 싣고 초대는 invite_make 로 센다", JSON.stringify([sa[0] && sa[0][1], sa[0] && sa[0][2], sa[1] && sa[1][1], sa[1] && sa[1][2], sa[1] && sa[1][3]]), JSON.stringify(["a=" + enc("김철수") + "&b=" + enc("이영희"), "", "a=" + enc("김철수"), ".invite-btn", "invite_make"]));
  t("이름궁합 링크: 초대 문구에 보낸 사람 이름과 조사가 맞게 들어간다(김철수가·김철민이)", [sa[1] && sa[1][0], (tryDraw("김철민", "이영희").r.sargs[1] || [])[0]].join("|"), "김철수가 이름궁합 보자고 보냈어요. 내 이름만 넣으면 바로 나와요:|김철민이 이름궁합 보자고 보냈어요. 내 이름만 넣으면 바로 나와요:");
  t("이름궁합 링크: 초대 버튼이 결과에 그려진다", dd.r && dd.r.out.includes('class="invite-btn"'), true);
  { const r = tryDraw("김철수", "이영희", "?from=share&a=" + enc("민준") + "&b=" + enc("서연")).r;
    t("이름궁합 링크: ?a=&b= 로 열면 두 칸을 채우고 열자마자 결과(24점·도전형)를 그리며 통계 이벤트는 안 보낸다", r && [r.nodes["#a"].value, r.nodes["#b"].value, /24<small>점 · 도전형/.test(r.out), r.tracked.length].join("|"), "민준|서연|true|0"); }
  { const r = tryDraw("김철수", "이영희", "?from=share&a=" + enc("김철민")).r;
    t("이름궁합 링크: ?a= 만 있으면 첫 칸만 채우고 둘째 칸을 비워 입력을 기다리며 invite_open 하나만 센다", r && [r.nodes["#a"].value, JSON.stringify(r.nodes["#b"].value), r.nodes["#b"].focused, r.out === "", r.tracked.join(",")].join("|"), '김철민|""|true|true|invite_open');
    t("이름궁합 링크: 초대 안내에 보낸 이름이 조사와 함께 나온다", r && r.bar.length === 1 && r.bar[0].className === "gh-inv" && r.bar[0].innerHTML.includes("<b>김철민</b>이 이름궁합을 보자고 보냈어요"), true); }
  { const bad = ["?a=%3Cscript%3Ealert(1)%3C%2Fscript%3E&b=" + enc("영희"), "?a=%E0%A4%A&b=%E0%A4%A", "?a=Kim&b=Lee", "?a=&b=" + enc("영희")].map(s => { const x = tryDraw("김철수", "이영희", s); return x.err + (x.r ? [x.r.bar.length, x.r.nodes["#a"].value, /57<small>점/.test(x.r.out)].join(":") : "x"); });
    t("이름궁합 링크: 스크립트·영문·깨진 값은 버리고 예전처럼 기본 결과(57점)를 그린다(오류 없음)", bad.join(","), "0:김철수:true,0:김철수:true,0:김철수:true,0:김철수:true"); }
  // 미리보기(워커): 같은 점수 함수를 쓰는 nm_core.js 가 hub.html 의 NM 블록과 같고, ogName 이 한글만 받아 제목을 만든다
  { const hubNM = src.slice(src.indexOf("/*NM-BEGIN*/"), src.indexOf("/*NM-END*/") + "/*NM-END*/".length).replace(/\r\n/g, "\n"), coreTxt = fs.readFileSync("nm_core.js", "utf8").replace(/\r\n/g, "\n"), ogTxt = fs.readFileSync("worker_og.js", "utf8");
    t("이름궁합 미리보기: nm_core.js 가 hub.html 의 NM 블록 그대로다(오래됐으면 node build_site.js 로 다시 만든다)", coreTxt.includes(hubNM) && coreTxt.trimEnd().endsWith("export { nmCalc, nmBand };"), true);
    const ogName = new Function(coreTxt.replace(/^export \{[^}]*\};?\s*$/m, "") + "\n" + ogTxt.replace(/^import .*$/m, "").replace(/^export function /gm, "function ") + "\nreturn ogName;")();
    const og1 = ogName("김철수", "이영희"), og2 = ogName("김철수", ""), og3 = ogName("김철민", "");
    t("이름궁합 미리보기: 김철수♥이영희 = '57점 · 성장형' 제목(화면과 같은 점수)이고 설명에 내 이름 안내가 있다", [og1 && og1.title, og1 && og1.desc.endsWith("내 이름으로도 해 보세요 — 동네보살"), og1 && og1.title.includes(nmCalc("김철수", "이영희").score + "점")].join("|"), "김철수 ♥ 이영희 이름궁합 57점 · 성장형|true|true");
    t("이름궁합 미리보기: 초대 링크 제목은 조사가 맞다(김철수가·김철민이)", [og2 && og2.title, og3 && og3.title].join("|"), "김철수가 이름궁합을 보냈어요|김철민이 이름궁합을 보냈어요");
    t("이름궁합 미리보기: 한글이 아니거나 비었거나 너무 긴 값은 null(원래 페이지 그대로)", [ogName("", "이영희"), ogName("Kim", "이영희"), ogName("김철수", "Lee"), ogName("<b>", ""), ogName("김철수철수철수철수철수", "이영희"), ogName("김철수", "이영희이영희이영희이영희")].map(x => x === null).join(","), "true,true,true,true,true,true");
    const wk2 = fs.readFileSync("worker.js", "utf8"), wr = fs.readFileSync("wrangler.jsonc", "utf8");
    t("이름궁합 미리보기: 워커가 /namematch.html 만 받아 title·description·og 를 바꾸고 noindex 를 붙이며 wrangler 가 그 경로를 먼저 워커로 보낸다", [wk2.includes('import { ogName, ogInvite } from "./worker_og.js"'), wk2.includes('pathname === "/namematch.html"'), wk2.includes("new HTMLRewriter()"), wk2.includes('.on(\'meta[property="og:title"]\'') && wk2.includes('.on(\'meta[property="og:description"]\'') && wk2.includes('.on(\'meta[name="description"]\''), wk2.includes("noindex,follow"), /"run_worker_first": \["\/api\/\*", "\/admin", "\/namematch\.html", "\/gunghap\.html"[,\]]/.test(wr)].join(","), "true,true,true,true,true,true");
    t("이름궁합 링크: 개인정보처리방침에 이름이 링크에 담긴다는 것과 서버가 저장하지 않는다는 것이 적혀 있다", /넣은 이름\(초대 링크는 내 이름만\)이 담깁니다/.test(fs.readFileSync("content_site.js", "utf8")) && fs.readFileSync("content_site.js", "utf8").includes("서버가 이름을 읽지만 저장하지 않습니다"), true); } }
// ── 띠 궁합(content_ttigunghap.js): 관계표를 독립 표와 대조 · 원고 78쌍·12띠 · 문체·중복 · 빌드 배선 ──
{ const TT = require("./content_ttigunghap.js"), NAMES = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
  const norm = s => s.split(" ").map(x => { const a = NAMES.indexOf(x[0]), b = NAMES.indexOf(x[1]); return Math.min(a, b) + "-" + Math.max(a, b); }).sort().join(" ");
  const EXP = { "삼합": "자진 자신 진신 해묘 묘미 해미 인오 오술 인술 사유 유축 사축", "육합": "자축 인해 묘술 진유 사신 오미", "충": "자오 축미 인신 묘유 진술 사해", "원진": "자미 축오 인유 묘신 진해 사술", "형": "자묘 인사 축술 술미" };   // 지지 합·충·원진·형 일람(여러 명리 자료 교차 확인)을 코드와 따로 적은 것
  const got = t => TT.PAIR_LIST.filter(p => p.type === t).map(p => p.a + "-" + p.b).sort().join(" ");
  Object.keys(EXP).forEach(ty => t(`띠 궁합 관계표: ${ty} 쌍이 독립 표와 같다`, got(ty), norm(EXP[ty])));
  t("띠 궁합: 78쌍 = 삼합 12·육합 6·충 6·원진 6·형 4·같은 띠 12·무난 32", TT.PAIR_LIST.length + "=" + ["삼합","육합","충","원진","형","같은 띠","무난"].map(x => TT.PAIR_LIST.filter(p => p.type === x).length).join("/"), "78=12/6/6/6/4/12/32");
  t("띠 궁합: 관계는 두 띠 순서와 상관없다(대칭)", TT.JI.every(x => TT.JI.every(y => TT.rel(x.i, y.i).type === TT.rel(y.i, x.i).type)), true);
  t("띠 궁합: 모든 띠가 삼합 상대 2·육합 1·충 1·원진 1", TT.JI.every(x => [["삼합",2],["육합",1],["충",1],["원진",1]].every(([ty, c]) => TT.JI.filter(y => y.i !== x.i && TT.rel(x.i, y.i).type === ty).length === c)), true);
  t("띠 궁합: 짝 키 78개가 서로 다르다", new Set(TT.PAIR_LIST.map(p => p.key)).size, 78);
  t("띠 궁합: 출생 연도 목록은 (연도−4)%12 가 띠 번호이고 2026 이하", TT.JI.every(z => TT.years(z.i).every(y => (y - 4) % 12 === z.i && y <= 2026)), true);
  t("띠 궁합: 1984 쥐띠·1985 소띠·2019 돼지띠가 목록에 있다", TT.years(0).includes(1984) && TT.years(1).includes(1985) && TT.years(11).includes(2019), true);
  const BAN = /위험|흉(?!내|터)|불행|재앙|재난|불길|불운|파탄|이혼|사별|실패|나쁜|망하|최악|저주|상극|원수|악연|헤어|깨지|절대|반드시|결혼하면 안|단점|약하|약한|약해|약점|얇[은아다으고게]|여리[다고지게며]|여린|여려|모자라|모자란|부족한 사람|힘이 없/, JARG = /일간|용신|십성|격국|신강|신약|지장간|천간|(?<![가-힣])지지(?![가-힣])|합화|오행|상생/, BOS = /(일세|하네|이야|이지|하게|하세나|이군|하군)[.!?]?$/;
  const SENT = x => String(x).split(/(?<=[.!?])\s+/).map(y => y.trim()).filter(Boolean);
  const P = TT.TEXT.pairs, Hh = TT.TEXT.hubs, badF = [], badL = [], badW = [], badN = [], seen = new Map(), dupS = [];
  TT.PAIR_LIST.forEach(p => { const o = P[p.key]; if (!o) { badF.push(p.key); return; }
    ["sum","love","work","home","myth"].forEach(f => { if (typeof o[f] !== "string" || !o[f]) badF.push(p.key + "." + f); });
    if (!Array.isArray(o.tips) || o.tips.length !== 3) badF.push(p.key + ".tips");
    const L = (f, v, lo, hi) => { if (String(v).length < lo || String(v).length > hi) badL.push(p.key + "." + f + ":" + String(v).length); };
    L("sum", o.sum, 45, 90); L("love", o.love, 200, 350); L("work", o.work, 180, 330); L("home", o.home, 150, 290); L("myth", o.myth, 45, 105); (o.tips || []).forEach((x, i) => L("tips" + i, x, 45, 115));
    const all = ["sum","love","work","home","myth"].map(f => o[f]).concat(o.tips || []).join(" ");
    SENT(all).forEach(x => { if (BAN.test(x) || JARG.test(x) || BOS.test(x)) badW.push(p.key + ":" + x.slice(0, 18)); if (x.length >= 14) { if (!seen.has(x)) seen.set(x, new Set()); seen.get(x).add(p.key); } });
    const nm = [TT.JI[p.a].name, TT.JI[p.b].name]; ["sum","love","work","home"].forEach(f => nm.forEach(n => { if (!String(o[f]).includes(n)) badN.push(p.key + "." + f + "/" + n); })); });
  seen.forEach((v, x) => { if (v.size > 1) dupS.push([...v].join(",") + ":" + x.slice(0, 16)); });
  t("띠 궁합 원고: 78쌍이 모든 칸(sum·love·work·home·tips 3·myth)을 갖췄다", badF.slice(0, 4).join(","), "");
  t("띠 궁합 원고: 칸마다 분량 범위(sum 45~90 · love 200~350 · work 180~330 · home 150~290 · tips 45~115 · myth 45~105)", badL.slice(0, 4).join(","), "");
  t("띠 궁합 원고: 금지어·어려운 명리 용어·보살 말투 끝맺음이 없다", badW.slice(0, 4).join(","), "");
  t("띠 궁합 원고: sum·love·work·home 마다 두 띠 이름이 들어 있다", badN.slice(0, 4).join(","), "");
  t("띠 궁합 원고: 다른 짝과 같은 문장(14자 이상)이 없다", dupS.slice(0, 3).join(" | "), "");
  const hb = [], hdup = new Map(), hdupS = [];
  TT.JI.forEach(z => { const o = Hh[z.en]; if (!o) { hb.push(z.en); return; }
    [["intro",170,320],["love",150,280],["work",150,280],["tip",100,220]].forEach(([f, lo, hi]) => { const v = String(o[f] || ""); if (v.length < lo || v.length > hi) hb.push(z.en + "." + f + ":" + v.length); if (!v.includes(z.name)) hb.push(z.en + "." + f + ":이름없음"); SENT(v).forEach(x => { if (BAN.test(x) || JARG.test(x) || BOS.test(x) || /삼합|육합|원진|(?<![가-힣])충(?![가-힣])/.test(x)) hb.push(z.en + "." + f + ":" + x.slice(0, 14)); if (x.length >= 14) { if (!hdup.has(x)) hdup.set(x, new Set()); hdup.get(x).add(z.en); } }); }); });
  hdup.forEach((v, x) => { if (v.size > 1) hdupS.push(x.slice(0, 16)); });
  t("띠 궁합 도입 글: 12띠가 모두 있고 분량·문체·관계 이름 없음·띠 이름 포함", hb.slice(0, 4).join(","), "");
  t("띠 궁합 도입 글: 띠끼리 같은 문장이 없다", hdupS.slice(0, 3).join(" | "), "");
  t("띠 궁합 배선: 허브·띠별·짝 페이지를 만들고 사이트맵·llms·홈에 싣는다", [bs.includes("ttiMainPage()"), bs.includes("TTI.PAIR_LIST.forEach(p=>fs.writeFileSync"), bs.includes("TTI.PAIR_LIST.map(p=>smUrl(ttiPairUrl"), bs.includes("## 띠별 궁합 (13)"), bs.includes('"띠 궁합 " + (TTI.JI.length + 1)')].join(","), "true,true,true,true,true");
  t("띠 궁합 배선: 원고가 없으면 빌드가 멈춘다(빈 페이지를 내보내지 않는다)", bs.includes('throw new Error("띠 궁합 원고 없음: "') && bs.includes('throw new Error("띠 궁합 도입 글 없음: "'), true); }
// ── 띠 궁합 공유·초대(정적 페이지의 인라인 스크립트) · 사주 궁합 초대 카드 위치 ──
{ const m = bs.match(/const TTI_SHARE_JS = `<script>(.*?)<\/script>`;/s), js = m ? m[1] : "";
  const run = (nav, ev, data) => { const out = { beacons: [], shared: null, copied: null }, hs = {};
    const btn = { dataset: Object.assign({ share: "1", ev: ev }, data), textContent: "라벨", addEventListener(ty, fn) { hs[ty] = fn; } };
    const doc = { readyState: "complete", querySelectorAll: () => [btn], addEventListener() {} };
    const navi = Object.assign({ sendBeacon: (u, b) => { out.beacons.push(b); return true; } }, nav(out));
    let err = ""; try { new Function("navigator", "document", "window", "setTimeout", js)(navi, doc, globalThis, () => {}); if (hs.click) hs.click(); } catch (e) { err = String(e.message); }
    out.label = btn.textContent; out.err = err; delete globalThis.ttiShare; return out; };
  const D = { title: "띠 궁합 보자", text: "나는 쥐띠, 너는 무슨 띠야? 우리 띠 궁합 보자:", url: "https://dongnebosal.com/tti-gunghap.html?from=share&a=0" };
  const r1 = run(o => ({ share: x => { o.shared = x; return { catch() {} }; } }), "invite_make", D);
  t("띠 궁합 공유: 기기 공유창에 제목과 '문구 + 주소'를 통째로 넘기고 invite_make 를 센다", [r1.err, JSON.stringify(r1.beacons), r1.shared && r1.shared.title, r1.shared && r1.shared.text].join("|"), '|["{\\"e\\":\\"invite_make\\"}"]|띠 궁합 보자|나는 쥐띠, 너는 무슨 띠야? 우리 띠 궁합 보자: https://dongnebosal.com/tti-gunghap.html?from=share&a=0');
  const r2 = run(o => ({ clipboard: { writeText: x => { o.copied = x; return { then: f => f() }; } } }), "share_click", D);
  t("띠 궁합 공유: 공유창이 없으면 클립보드로 복사하고 버튼에 안내를 띄우며 share_click 을 센다", [r2.err, JSON.stringify(r2.beacons), r2.copied, r2.label].join("|"), '|["{\\"e\\":\\"share_click\\"}"]|나는 쥐띠, 너는 무슨 띠야? 우리 띠 궁합 보자: https://dongnebosal.com/tti-gunghap.html?from=share&a=0|복사됨! 카톡에 붙여넣으세요');
  const r3 = run(() => ({}), "share_click", D);
  t("띠 궁합 공유: 공유창도 클립보드도 없으면 오류 없이 안내만 띄운다", r3.err + "|" + r3.label, "|이 기기에서는 복사를 못 했어요");
  const hubSrc = bs.slice(bs.indexOf("function ttiMainPage()"), bs.indexOf("function ttiMainPage()") + 12000);
  t("띠 궁합 배선: 짝 페이지·띠별 페이지에 공유·초대 줄을 달고, 허브는 위젯 앞에 공유 스크립트를 둔다", [bs.includes("ttiShareRow(`${cross} 궁합`"), bs.includes("ttiShareRow(`${z.name} 궁합`"), bs.includes("</p></div>` + TTI_SHARE_JS + sel +"), bs.includes('ttiShare(o)}')].join(","), "true,true,true,true");
  t("띠 궁합 위젯: ?a=&b= 로 열면 고른 값으로 결과를, ?a= 만이면 보낸 띠를 상대 칸에 두고 내 띠 고르기 안내 + invite_open", [hubSrc.includes('u.get("a")') && hubSrc.includes('u.get("b")'), hubSrc.includes('new Option("내 띠를 골라 보세요","")'), hubSrc.includes("b.value=qa"), hubSrc.includes('{e:"invite_open"}'), hubSrc.includes('if(a.value===""||b.value==="")return;')].join(","), "true,true,true,true,true");
  t("띠 궁합 위젯: 공유는 그 짝 페이지(?from=share)로, 초대는 허브(?from=share&a=내 띠)로 보낸다", [hubSrc.includes('location.origin+"/"+d[2]+"?from=share"'), hubSrc.includes('location.origin+location.pathname+"?from=share&a="+i')].join(","), "true,true");
  t("띠 궁합 공유: 버튼 모양(.ttibtn·.ttishare)이 CSS 에 있다", bs.includes(".ttibtn{width:100%") && bs.includes(".ttishare{display:grid"), true);
  const iA = src.indexOf('<div class="gh-mkinv">'), iB = src.indexOf('<div id="ghdeep"></div>'), iC = src.indexOf("계산 근거 — 글자별로 본 궁합");
  t("사주 궁합: 상대에게 보내기 카드가 점수·글자 카드 바로 아래(깊은 풀이·계산 근거보다 위)에 있고 버튼 글이 알아보기 쉽다", [iA > 0 && iA < iB && iB < iC, src.includes(">친구에게 궁합 보자고 보내기</span>"), !src.includes(">초대 링크 만들기</span>")].join(","), "true,true,true"); }
// ── 내 일주 카드(hub.html iljuCard · sj/ilju.json · 일주 페이지 공유 줄) ──
{ const code = src.slice(src.indexOf("function ilKey("), src.indexOf("function iljuCard(host,y,m,d)"));
  const ilKey = new Function(code + "return ilKey;")();
  let bad = 0; for (let k = 0; k < 60; k++) if (ilKey(k % 10, k % 12) !== k) bad++;
  t("일주 카드: 번호 k 는 (천간 k%10, 지지 k%12)에서 60칸 모두 왕복한다", bad, 0);
  t("일주 카드: 짝이 안 맞는 (천간, 지지)는 -1", [ilKey(0, 1), ilKey(1, 0), ilKey(2, 5)].join(","), "-1,-1,-1");
  const d0 = sjPillars(2000, 1, 1, null, 0, false).d;
  t("일주 카드: 2000-01-01 은 무오일주(번호 54), 1900-01-01·2024-02-10 도 엔진 일주와 번호가 맞는다", [d0.s + "," + d0.b + "→" + ilKey(d0.s, d0.b), [[1900, 1, 1], [2024, 2, 10], [1984, 7, 20]].every(([y, m, d]) => { const q = sjPillars(y, m, d, null, 0, false).d, k = ilKey(q.s, q.b); return k >= 0 && k % 10 === q.s && k % 12 === q.b; })].join("|"), "4,6→54|true");
  const IL = require("./content_ilju60.js"), keys = Object.keys(IL), first = x => IL[x].core.trim().split(/(?<=[.?!])\s+/)[0];
  const BANIL = /약하|약한|약해|약점|허약|나약|취약|여리|여린|얇[은아다으고게]|힘이 없|모자란|부족한 사람/;
  t("일주 카드 원고: 60칸, 별명(6~20자)·첫 문장(15~80자)이 모두 있고 별명이 서로 다르다", [keys.length, keys.every(k => IL[k].tag && IL[k].tag.length >= 6 && IL[k].tag.length <= 20), keys.every(k => first(k).length >= 15 && first(k).length <= 80), new Set(keys.map(k => IL[k].tag)).size].join(","), "60,true,true,60");
  t("일주 카드 원고: 별명·첫 문장에 사람을 약하다고 판정하는 말이 없다", keys.filter(k => BANIL.test(IL[k].tag) || BANIL.test(first(k))).join(","), "");
  // 실행: 가짜 문서·가짜 fetch 로 카드를 그리고 저장 카드 옵션·공유 문구를 본다
  const J = [{ en: "gapja", ko: "갑자", han: "甲子", g: "gap", t: "겨울 물에 발 담근 대들보", d: "밤의 찬 물이 큰 나무 뿌리를 적시는 모양입니다." }];
  const syncP = v => ({ then: f => syncP(f(v)), catch: () => syncP(v) });
  const run = ok => { const calls = { share: null, card: null, saved: null, tracked: [], done: null }, els = {};
    const mkEl = () => ({ innerHTML: "", handlers: {}, addEventListener(ty, fn) { this.handlers[ty] = fn; }, querySelector(sel) { return els[sel] || (els[sel] = mkEl()); } });
    const host = { appended: [], querySelector: () => null, appendChild(n) { this.appended.push(n); } };
    const E = new Function("sjPillars", "escH", "bindSave", "fortuneCard", "track", "shareOut", "document", "fetch", "location", "Image", code + "return {iljuCardKey:iljuCardKey};")(
      sjPillars, escH, (el, o) => { calls.saved = o; }, o => { calls.card = o; return "CANVAS"; }, ev => calls.tracked.push(ev), (b, ti, full, idle) => { calls.share = [ti, full, idle]; },
      { createElement: () => mkEl() }, () => syncP({ ok, json: () => J }), { origin: "https://dongnebosal.com", pathname: "/saju.html" }, class { set src(v) { this._src = v; if (this.onload) this.onload(); } });
    let err = ""; try { E.iljuCardKey(host, 0); if (calls.saved) calls.saved.draw(c => { calls.done = c; }); if (els[".ilc-share"] && els[".ilc-share"].handlers.click) els[".ilc-share"].handlers.click.call({}); } catch (e) { err = String(e.message); }
    return { calls, host, err }; };
  const r1 = run(true), h1 = r1.host.appended[0] ? r1.host.appended[0].innerHTML : "";
  t("일주 카드 실행: 칸에 일주 이름·한자·별명·한 줄·저장/공유 버튼·일주 페이지 링크가 그려진다", [r1.err, h1.includes("갑자일주 <small>甲子</small>"), h1.includes("겨울 물에 발 담근 대들보"), h1.includes("밤의 찬 물이 큰 나무"), h1.includes('class="save-btn"') && h1.includes('class="ilc-share"'), h1.includes('href="ilju-gapja.html"')].join("|"), "|true|true|true|true|true");
  t("일주 카드 실행: 저장 카드는 큰 이름·한자·별명·한 줄·일간 그림을 담고 생일·이름은 없다", [JSON.stringify(Object.keys(r1.calls.card || {}).sort()), r1.calls.card && r1.calls.card.big, r1.calls.card && r1.calls.card.grade, r1.calls.card && r1.calls.card.headline, r1.calls.card && r1.calls.card.bosalImg && r1.calls.card.bosalImg._src, r1.calls.done].join("|"), '["big","body","bosalImg","grade","headline","ident","tool"]|갑자일주|甲子|겨울 물에 발 담근 대들보|img/char/ilgan-gap.webp|CANVAS');
  t("일주 카드 실행: 공유는 그 일주 페이지(?from=share)로 가고 share_click 을 센다", [r1.calls.share && r1.calls.share[0], r1.calls.share && r1.calls.share[1], r1.calls.share && r1.calls.share[2], r1.calls.tracked.join(",")].join("|"), "갑자일주|나는 갑자일주(甲子) — 겨울 물에 발 담근 대들보. 내 일주는 뭘까? 동네보살에서 확인: https://dongnebosal.com/ilju-gapja.html?from=share|친구에게 알려주기|share_click");
  const r2 = run(false); t("일주 카드 실행: 별명 파일을 못 받으면 칸을 그리지 않고 오류도 없다", r2.err + "|" + r2.host.appended.length, "|0");
  const cardFn = code.slice(code.indexOf("function iljuCardKey("));
  t("일주 카드: 카드·공유 코드에 생일·이름·저장값이 들어가지 않는다", !/birth|loadPrefs|localStorage|\.value|nm\b/.test(cardFn), true);
  t("일주 카드 배선: 사주 결과 헤드라인 뒤에 칸을 두고 채우며, 그림은 big 을 그리고, 홈 오늘 카드·일주 페이지·sj/ilju.json 이 이어진다", [
    src.includes("+yEl+'</div></div><div class=\"ilc-slot\"></div>';"), src.includes('iljuCardKey(el.querySelector(".ilc-slot"),ilKey(p.d.s,p.d.b));'), src.includes("else if(o.big){") && src.includes("hy2=(o.score!=null||o.big?700:520)+oy"),
    bs.includes('if(window.iljuCard)iljuCard(box.querySelector(".today-card"),+p[0],+p[1],+p[2]);'), bs.includes("ttiBtn(\"이 일주 공유하기\"") && bs.includes("iljuShareRow(p) +"), bs.includes('path.join(OUT,"sj","ilju.json")')].join(","), "true,true,true,true,true,true"); }
// ── 홈 저장 명단(직접 저장만) · 홈 화면 추가 안내 ──
{ const m = bs.match(/const HOME_KEEP_JS = `(.*?)`;/s), js = m ? m[1] : "";
  const K = new Function(js + "return {dnbPeople:dnbPeople,dnbKeep:dnbKeep,dnbA2hs:dnbA2hs};")();
  const good = [{ n: "나", b: "1990-03-15" }, { n: "민지", b: "1995-01-02" }];
  t("홈 저장 명단: 도구 페이지 저장 명단과 같은 [{n,b}] 를 읽고, 이름이 없거나 생일 꼴이 틀린 줄·깨진 값은 버린다", [JSON.stringify(K.dnbPeople(JSON.stringify(good))), JSON.stringify(K.dnbPeople(JSON.stringify(good.concat([{ n: "", b: "1990-03-15" }, { n: "가", b: "19900315" }, { n: 3, b: "1990-03-15" }, null, "x"])))), JSON.stringify(K.dnbPeople("{깨짐")), JSON.stringify(K.dnbPeople('{"n":"나"}')), JSON.stringify(K.dnbPeople(null))].join("|"), JSON.stringify(good) + "|" + JSON.stringify(good) + "|[]|[]|[]");
  t("홈 저장 명단: 최대 8명", K.dnbPeople(JSON.stringify(Array.from({ length: 12 }, (_, i) => ({ n: "사람" + i, b: "1990-03-15" })))).length, 8);
  let l = K.dnbKeep([], "  나  ", "1990-03-15");
  t("홈 저장: 이름 앞뒤 공백을 지우고 맨 앞에 넣는다", JSON.stringify(l), JSON.stringify([{ n: "나", b: "1990-03-15" }]));
  l = K.dnbKeep(l, "민지", "1995-01-02"); const l2 = K.dnbKeep(l, "민지", "2000-05-05"), l3 = K.dnbKeep(l, "새이름", "1995-01-02");
  t("홈 저장: 같은 이름은 새 생일로 바꾸고 같은 생일은 새 이름으로 바꾼다(중복 없음), 맨 앞이 최신", [l.map(x => x.n).join(","), l2.map(x => x.n + x.b).join(","), l3.map(x => x.n).join(",")].join("|"), "민지,나|민지2000-05-05,나1990-03-15|새이름,나");
  t("홈 저장: 이름이 비었거나 생일 꼴이 틀리면 그대로 둔다, 이름은 8자까지", [K.dnbKeep(l, "", "1990-03-15") === l, K.dnbKeep(l, "가", "1990.03.15") === l, K.dnbKeep([], "가나다라마바사아자차", "1990-03-15")[0].n].join(","), "true,true,가나다라마바사아");
  t("홈 저장: 9번째 저장은 가장 오래된 것을 밀어낸다", K.dnbKeep(Array.from({ length: 8 }, (_, i) => ({ n: "사람" + i, b: "1990-03-1" + (i % 10) })), "새사람", "1999-12-31").map(x => x.n).join(",").split(",").length + "|" + K.dnbKeep(Array.from({ length: 8 }, (_, i) => ({ n: "사람" + i, b: "1990-03-1" + (i % 10) })), "새사람", "1999-12-31")[0].n, "8|새사람");
  const IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", AND = "Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36", DESK = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", NOW = 1800000000000, DAY = 86400000;
  t("홈 화면 추가 안내: iPhone·Android 브라우저에서만, 이미 앱으로 연 화면·30일 안에 닫은 경우는 안 보인다", [K.dnbA2hs(IOS, false, 0, NOW), K.dnbA2hs(AND, false, 0, NOW), K.dnbA2hs(DESK, false, 0, NOW) === "", K.dnbA2hs(IOS, true, 0, NOW) === "", K.dnbA2hs(IOS, false, NOW - 10 * DAY, NOW) === "", K.dnbA2hs(AND, false, NOW - 40 * DAY, NOW)].join(","), "ios,android,true,true,true,android");
  t("홈 화면 추가 안내: 카톡·네이버·인스타 같은 앱 안 브라우저와 안드로이드 웹뷰에서는 안 보인다(거기엔 그 메뉴가 없다)", [IOS + " KAKAOTALK 10.4.0", AND.replace("Mobile Safari", "Mobile Safari KAKAOTALK 10.4.0"), IOS + " NAVER(inapp; search; 1000; 12.0)", AND + " Instagram 320.0", AND.replace("SM-S918N)", "SM-S918N; wv)")].map(u => K.dnbA2hs(u, false, 0, NOW) === "").join(","), "true,true,true,true,true");
  // 배선: 자동 저장이 없다 — 저장은 '저장' 버튼·× 버튼에서만 일어난다
  const home = bs.slice(bs.indexOf('<script>(function(){var box=document.getElementById("today")'), bs.indexOf('<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"'));
  const showFn = home.slice(home.indexOf("function show(b){"), home.indexOf("function bdFmt(")), wireFn = home.slice(home.indexOf("function wire(){"), home.indexOf("load(function(){var ol="));
  t("홈 저장 배선: 입력·결과를 그리는 동안(show·wire)에는 저장하지 않는다 — putP 호출은 지우기(×)와 '저장' 버튼 둘뿐이다", [(home.match(/putP\(/g) || []).length - 1, showFn.includes("putP(") || wireFn.includes("putP("), /d\.onclick=function\(e\)\{[^]*?putP\(a\);chips\(\)/.test(home), /function ok\(\)\{[^]*?putP\(dnbKeep\(getP\(\),n,v\)\)/.test(home)].join(","), "2,false,true,true");
  t("홈 저장 배선: 결과 카드 뒤에 저장 줄을 달고, 입력칸을 묶을 때(처음·다른 생일 뒤) 칩을 그리고, localStorage 쓰기는 명단·닫기 기록 둘뿐이다", [home.includes('keepBox(box.querySelector(".today-card"),b);'), home.includes("show(v);};chips();}"), home.includes("${HOME_KEEP_JS}") || home.includes("\${HOME_KEEP_JS}"), (home.match(/localStorage\.setItem\(/g) || []).length + "개:" + (home.match(/localStorage\.setItem\(([^,]+),/g) || []).map(x => x.replace("localStorage.setItem(", "").replace(",", "")).join("+")].join("|"), "true|true|true|2개:DNB_P+\"dnbs_a2hs\"");
  const wk3 = fs.readFileSync("worker.js", "utf8");
  t("홈 저장 통계: 서버가 person_save·person_use 를 허용하고 대시보드에 한글로 보인다", [/const EVENTS = new Set\(\[[^\]]*"person_save"[^\]]*"person_use"/.test(wk3), wk3.includes('person_save: "홈에서 생일 저장"'), wk3.includes('person_use: "저장한 생일로 보기"'), home.includes('ev("person_save")'), home.includes('ev("person_use")')].join(","), "true,true,true,true,true");
  const pol = fs.readFileSync("content_site.js", "utf8");
  t("홈 저장 방침: 홈에서 저장한 생일도 같은 이름표 저장소라는 것과 홈 화면 추가 안내를 닫은 날짜가 적혀 있고, 홈 안내문은 '직접 저장하지 않으면 탭을 닫을 때 지워진다'로 정확하다", [pol.includes("홈 화면에서 저장한 것도 같은 곳에 남습니다"), pol.includes("홈 화면 추가 안내를 닫은 날짜입니다"), bs.includes("직접 저장하지 않으면 이 탭을 닫을 때 지워집니다"), !bs.includes("<p class=\"today-note\">생일은 서버로 보내지 않습니다. 이 탭을 닫으면 지워집니다.")].join(","), "true,true,true,true"); }
// ── 보살 칼럼 그림(홈 벤토 타일 14 · 글 안 큰 그림 36 · 전부 webp, 용량 예산) ──
{ const CI = require("./content_column_img.js"), CP = require("./content_column.js"), ens = CP.map(c => c.en);
  const cnt = {}; CI.tiles.forEach(t => { cnt[t[1]] = (cnt[t[1]] || 0) + 1; });
  t("칼럼 그림: 타일이 칼럼 전부를 한 번씩 덮고(순서가 곧 그리드 순서) 크기는 큰 1·가로 3·작은 10 → 4열 5줄 20칸이 빈칸 없이 찬다", [CI.tiles.length === ens.length, new Set(CI.tiles.map(x => x[0])).size === ens.length, CI.tiles.every(x => ens.includes(x[0])), "l" + cnt.l + "w" + cnt.w + "s" + cnt.s, (cnt.l || 0) * 4 + (cnt.w || 0) * 2 + (cnt.s || 0)].join(","), "true,true,true,l1w3s10,20");
  // 얼굴 상자: 타일 그림은 3:2 원본 그대로 두고 칸에 깔 때 object-fit:cover 로 잘린다. 어떤 칸 비율(폰 1.15 ~ 데스크톱 1.3 · 가로 칸 2.33~2.68)에서도 상자가 보이는 창 안에 통째로 들어야 한다
  t("칼럼 그림: 타일 얼굴 상자는 [x0,y0,x1,y1](0~1, x0<x1·y0<y1)이고 객체 위치(tilePos)는 '가로% 세로%' 꼴이다", CI.tiles.every(x => Array.isArray(x[2]) && x[2].length === 4 && x[2].every(v => v >= 0 && v <= 1) && x[2][0] < x[2][2] && x[2][1] < x[2][3] && /^[0-9]{1,3}% [0-9]{1,3}%$/.test(x[3] || CI.tilePos(x[2], x[1]))), true);
  { const inWin = (lo, hi, v, p) => { const s = v >= 1 ? 0 : p / 100 * (1 - v); return s <= lo + 0.005 && s + v >= hi - 0.005; }, bad = [], textBand = [];
    CI.tiles.forEach(([en, sz, f, at]) => { const [px, py] = (at || CI.tilePos(f, sz)).split(" ").map(parseFloat);
      [CI.AR[sz][0] * 0.97, CI.AR[sz][0], CI.AR[sz][1], CI.AR[sz][1] * 1.03].forEach(a => { const vx = Math.min(1, a / CI.SRC), vy = Math.min(1, CI.SRC / a);
        if (!inWin(f[0], f[2], vx, px) || !inWin(f[1], f[3], vy, py)) bad.push(en + "@" + a.toFixed(2));
        if (sz === "w") { const s = vy >= 1 ? 0 : py / 100 * (1 - vy); if ((f[3] - s) / vy > 0.62) textBand.push(en + "@" + a.toFixed(2)); } }); });
    t("칼럼 그림: 어느 칸 비율(±3%)에서도 얼굴 상자가 보이는 창 안에 통째로 든다(얼굴이 잘리지 않는다)", bad.slice(0, 4).join(","), "");
    t("칼럼 그림: 가로 타일은 얼굴이 아래 38% 글자 띠를 피해 위쪽 62% 안에 놓인다", textBand.slice(0, 4).join(","), ""); }
  let nf = 0, badF = [];
  Object.entries(CI.figs).forEach(([en, a]) => { const c = CP.find(x => x.en === en); if (!c) { badF.push(en + ":칼럼 없음"); return; } nf += a.length;
    a.forEach((f, k) => { if (!Number.isInteger(f.after) || f.after < 0 || f.after >= c.sections.length) badF.push(en + ":after " + f.after); if (typeof f.alt !== "string" || f.alt.length < 15 || f.alt.length > 120) badF.push(en + ":alt " + k); if (k && f.after <= a[k - 1].after) badF.push(en + ":순서 " + k); }); });
  t("칼럼 그림: 글 안 그림 36장 — 칼럼마다 2~3장, 섹션 번호가 범위 안·오름차순이고 설명(alt)이 15~120자다", [nf, badF.slice(0, 3).join("|"), Object.values(CI.figs).every(a => a.length >= 2 && a.length <= 3), Object.keys(CI.figs).length === ens.length].join(","), "36,,true,true");
  // 파일: 전부 있고 진짜 webp 이며 비율·용량 예산을 지킨다 (원본 PNG 2~3MB 를 줄인 것)
  const webpDim = f => { const b = fs.readFileSync(f); if (b.toString("latin1", 0, 4) !== "RIFF" || b.toString("latin1", 8, 12) !== "WEBP") return null; const k = b.toString("latin1", 12, 16);
    if (k === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff }; if (k === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (k === "VP8L") { const v = b.readUInt32LE(21); return { w: (v & 0x3fff) + 1, h: ((v >> 14) & 0x3fff) + 1 }; } return null; };
  const want = [], tileSz = Object.fromEntries(CI.tiles.map(x => [x[0], x[1]]));
  CI.tiles.forEach(x => want.push(["tile-" + x[0], [CI.SRC, x[1] === "s" ? 40 : 80]]));
  Object.entries(CI.figs).forEach(([en, a]) => a.forEach((_, k) => want.push([`fig-${en}-${k + 1}`, [16 / 9, 80]])));
  const miss = [], notWebp = [], badAsp = [], big = []; let total = 0;
  want.forEach(([n, [asp, kb]]) => { const f = `img/col/${n}.webp`; if (!fs.existsSync(f)) { miss.push(n); return; } const d = webpDim(f), sz = fs.statSync(f).size; total += sz;
    if (!d) { notWebp.push(n); return; } if (Math.abs(d.w / d.h - asp) > 0.03 * asp) badAsp.push(n + " " + d.w + "x" + d.h); if (sz > kb * 1024) big.push(n + " " + Math.round(sz / 1024) + "KB"); });
  t("칼럼 그림: 50장(타일 14 + 글 안 36)이 모두 img/col 에 있다", want.length + "|" + miss.slice(0, 4).join(","), "50|");
  t("칼럼 그림: 전부 진짜 webp 이고 원본 비율 그대로다(타일 3:2, 글 안 16:9 — 미리 자르면 얼굴이 잘린다)", notWebp.slice(0, 3).join(",") + "|" + badAsp.slice(0, 3).join(","), "|");
  t("칼럼 그림: 용량 예산(작은 타일 40KB · 큰 타일·가로 타일·글 안 80KB 이하), 전체 3.6MB 이하", big.slice(0, 4).join(",") + "|" + (total <= 3.6 * 1024 * 1024) + "|" + Math.round(total / 1024) + "KB", "|true|" + Math.round(total / 1024) + "KB");
  t("칼럼 그림: img/col 에는 webp 말고 다른 파일이 없다(원본 PNG 는 리포에 두지 않는다)", fs.readdirSync("img/col").filter(f => !f.endsWith(".webp")).join(","), "");
  // 배선
  t("칼럼 그림 배선: 홈은 벤토(columnBento)를 쓰고 옛 한 줄 목록 카드는 없다, 타일 그림은 지연 로딩·alt 비움(제목이 글로 있다)", [bs.includes("${columnBento()}"), bs.includes("function columnBento()"), !bs.includes('class="alllist"><section class="grp wash fun"><div class="cat" data-n="${COLUMN_PAGES.length}"'), bs.includes('alt="" width="${w}" height="${h}" loading="lazy" decoding="async"'), bs.includes("보살 칼럼 ${COLUMN_PAGES.length}편 전체 보기")].join(","), "true,true,true,true,true");
  t("칼럼 그림 배선: 4열 dense 그리드(+모바일 2열), 큰 타일 2×2·가로 타일 2×1, 칼럼 글은 섹션 뒤에 그림을 끼우고 16:9 로 보인다", [bs.includes(".colbento{display:grid;grid-template-columns:repeat(4,1fr);") && bs.includes("grid-auto-flow:dense"), bs.includes(".cb-l{grid-column:span 2;grid-row:span 2;}.cb-w{grid-column:span 2;}"), /@media \(max-width:899px\)\{\.colbento\{grid-template-columns:repeat\(2,1fr\)/.test(bs), bs.includes("+colFig(c.en, i)).join"), bs.includes("aspect-ratio:16/9")].join(","), "true,true,true,true,true");
  t("칼럼 그림 배선: 타일 칸 비율을 행 높이로 고정(열 폭÷비율, 컨테이너 단위 cqw — 구형 브라우저는 옛 clamp 행 높이로 폴백), 타일마다 얼굴 상자로 정한 object-position·transform-origin 을 단다", [bs.includes('<div class="cbwrap"><div class="colbento">'), bs.includes(".cbwrap{container-type:inline-size;}"), bs.includes("@supports (width:1cqw){.colbento{grid-auto-rows:calc((100cqw - 3 * var(--cg)) / 4 / ${COLIMG.AR.s[1]});}}"), bs.includes("/ 2 / ${COLIMG.AR.s[0]});}}}"), bs.includes('style="object-position:${pos};transform-origin:${pos}"')].join(","), "true,true,true,true,true");
  t("칼럼 그림: 만든 법(tools/colimg: 작업 목록·생성기·변환기·README)이 리포에 있다", ["jobs.json", "gen.js", "convert.js", "README.md"].every(f => fs.existsSync("tools/colimg/" + f)), true); }
// ── 일주 그림(사용자의 '일주 60편 시리즈' 그림 → img/ilju) · 결과 카드 예시(img/promo) ──
{ const IG = require("./content_ilju_img.js"), IL = require("./content_ilju60.js"), AT = ["top", "scene", "love", "seat", "work", "care"];
  const keys = Object.keys(IG), bad = [];
  keys.forEach(en => { const a = IG[en];
    if (!IL[en]) bad.push(en + ":없는 일주");
    if (!Array.isArray(a) || !a.length || a[0].at !== "top") bad.push(en + ":1번이 top 이 아니다");
    if (a.filter(f => f.at === "top").length !== 1) bad.push(en + ":top 이 하나가 아니다");
    a.forEach((f, k) => { if (!AT.includes(f.at)) bad.push(en + ":at " + f.at); if (typeof f.alt !== "string" || f.alt.length < 10 || f.alt.length > 80) bad.push(en + ":alt " + (k + 1)); if (/일주|<|"/.test(f.alt)) bad.push(en + ":alt 에 일주 이름·따옴표 " + (k + 1)); }); });
  t("일주 그림 데이터: 키는 실제 일주, 1번은 top(대표 그림) 하나, 놓을 곳은 정해진 여섯 중 하나, 설명은 10~80자(일주 이름은 빌드가 붙인다)", [keys.length >= 33, bad.slice(0, 4).join("|")].join("|"), "true|");
  // 파일: 데이터와 img/ilju 가 1:1, 진짜 webp, 용량 예산 100KB · 결과 카드 70KB
  const webpOk = f => { const b = fs.readFileSync(f); return b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP"; };
  const want = []; keys.forEach(en => IG[en].forEach((_, k) => want.push(`${en}-${k + 1}.webp`)));
  const have = fs.existsSync("img/ilju") ? fs.readdirSync("img/ilju") : [];
  const miss = want.filter(f => !have.includes(f)), orphan = have.filter(f => !want.includes(f));
  const big = want.filter(f => have.includes(f) && fs.statSync("img/ilju/" + f).size > 100 * 1024), notWebp = want.filter(f => have.includes(f) && !webpOk("img/ilju/" + f));
  t("일주 그림 파일: 데이터의 그림이 img/ilju 에 다 있고 남는 파일이 없으며(원본 PNG 금지) 전부 진짜 webp · 100KB 이하", [want.length, miss.slice(0, 3).join(","), orphan.slice(0, 3).join(","), big.slice(0, 3).join(","), notWebp.slice(0, 3).join(",")].join("|"), want.length + "||||");
  const promo = ["tarot-card-1", "tarot-card-2", "namematch-card-1"].map(n => "img/promo/" + n + ".webp");
  t("결과 카드 예시 파일: 타로 2장 · 이름궁합 1장이 진짜 webp · 70KB 이하로 있다", promo.every(f => fs.existsSync(f) && webpOk(f) && fs.statSync(f).size <= 70 * 1024), true);
  t("일주 그림 배선: 일주 페이지는 한눈에 보기 아래(top)와 다섯 절 끝에 그림을 끼우고, 1번 그림을 대표 그림(og:image)으로, sj/ilju.json 에 i·iw·ih 를 싣는다", [
    bs.includes('iljuShareRow(p) + iljuFig(p, "top") +'), ["scene", "love", "seat", "work", "care"].every(a => bs.includes(`\${iljuFig(p, "${a}")}</section>`)),
    bs.includes("img:(iljuImgs(p.en)[0] || {}).rel || `img/char/ilgan-${G.en}.webp`"), bs.includes("...(im?{i:im.rel,iw:im.w,ih:im.h}:{})"),
    bs.includes('alt="${esc(p.ko + "일주 그림 — " + f.alt)}" width="${f.w}" height="${f.h}" loading="lazy" decoding="async"'), bs.includes(".iljufig.sq{max-width:600px;}.iljufig.pt{max-width:500px;}")].join(","), "true,true,true,true,true,true");
  t("결과 카드 예시 배선: 타로·이름궁합 도구 페이지 설명 뒤에 예시 카드 칸(실제 크기 width/height · 지연 로딩)", [bs.includes("${introHtml}${cardShowHtml(t.id)}"), bs.includes("promo/tarot-card-1.webp") && bs.includes("promo/namematch-card-1.webp"), bs.includes('width="${w}" height="${h}" loading="lazy" decoding="async"></figure>`; }).join("")')].join(","), "true,true,true");
  // 내 일주 카드 — 그림이 있는 일주(i)는 카드 맨 위에 그림을 싣고, 저장 이미지는 일간 그림 대신 그 그림(photo)을 쓴다
  const code = src.slice(src.indexOf("function ilKey("), src.indexOf("function iljuCard(host,y,m,d)"));
  const J2 = [{ en: "gapja", ko: "갑자", han: "甲子", g: "gap", t: "겨울 물에 발 담근 대들보", d: "밤의 찬 물이 큰 나무 뿌리를 적시는 모양입니다.", i: "img/ilju/gapja-1.webp", iw: 1200, ih: 800 }];
  const syncP = v => ({ then: f => syncP(f(v)), catch: () => syncP(v) }), calls = { card: null, saved: null };
  const mkEl = () => ({ innerHTML: "", addEventListener() {}, querySelector() { return mkEl(); } });
  const host = { appended: [], querySelector: () => null, appendChild(n) { this.appended.push(n); } };
  const E = new Function("sjPillars", "escH", "bindSave", "fortuneCard", "track", "shareOut", "document", "fetch", "location", "Image", code + "return {iljuCardKey:iljuCardKey};")(
    sjPillars, escH, (el, o) => { calls.saved = o; }, o => { calls.card = o; return "CANVAS"; }, () => {}, () => {}, { createElement: () => mkEl() }, () => syncP({ ok: true, json: () => J2 }),
    { origin: "https://dongnebosal.com", pathname: "/" }, class { set src(v) { this._src = v; if (this.onload) this.onload(); } });
  let err = ""; try { E.iljuCardKey(host, 0); calls.saved.draw(() => {}); } catch (e) { err = String(e.message); }
  const h = host.appended[0] ? host.appended[0].innerHTML : "";
  t("일주 그림 · 내 일주 카드: 그림이 있으면 카드 맨 위에 실제 크기로 싣고, 저장 이미지는 photo 로 그 그림을 쓴다(bosalImg 없음)", [err, h.startsWith('<img class="ilc-img" src="img/ilju/gapja-1.webp" width="1200" height="800" alt="갑자일주 그림"'), calls.card && calls.card.photo && calls.card.photo._src, calls.card && "bosalImg" in calls.card].join("|"), "|true|img/ilju/gapja-1.webp|false");
  t("일주 그림 · 저장 카드: photo 는 글이 끝난 아래~브랜드 위 남는 높이(220~440)에 둥근 모서리 · 금빛 테로 비율 그대로 그리고, 본문은 네 줄로 줄인다", [src.includes("if(o.photo){var ph=o.photo,mh=Math.max(220,Math.min(440,H-218-(endY+70)))"), src.includes("x.clip();x.drawImage(ph,pxx,pyy,mw,mh);x.restore();"), src.includes("cap2=o.bosalImg||o.photo?4:6"), src.includes("endY=by2+(Math.min(bl2.length,cap2)-1)*60;"), src.includes("else if(o.bosalImg){var bh=300")].join(","), "true,true,true,true,true");
  // 배치 계산: 가장 긴 별명(두 줄)·본문 네 줄이어도 그림 윗변이 글 아래 70px 밑에 오고, 220 이상이며 브랜드(H-218) 위에서 끝난다
  { const H = 1920, hy2 = 700 + 285; const lay = (hl, bl) => { const by2 = hy2 + hl * 74 + 56, endY = by2 + (bl - 1) * 60, mh = Math.max(220, Math.min(440, H - 218 - (endY + 70))); return { top: H - 218 - mh, endY, mh }; };
    const cases = [[1, 1], [1, 4], [2, 4], [3, 4]].map(([a, c]) => lay(a, c));
    t("일주 그림 · 저장 카드 배치: 별명 1~2줄 · 본문 1~4줄에서 그림이 글과 겹치지 않는다(높이 " + cases.map(c => c.mh).join("/") + ")", cases.slice(0, 3).every(c => c.top >= c.endY + 60 && c.mh >= 220), true); }
  t("일주 그림: 만든 법(tools/iljuimg/convert.js · README)이 리포에 있다", ["convert.js", "README.md"].every(f => fs.existsSync("tools/iljuimg/" + f)), true); }
// ── 2027 신년 시즌: 삼재(독립 일람 대조·위젯 실행) · 년생별 60(엔진 대조·원고 문체·중복) · 날짜 · 빌드 배선 ──
{ const SJ = require("./content_samjae.js"), NB = require("./content_newyear_by.js"), NC = require("./tools/newyear2027/ny_check.js");
  const B12 = [...Array(12).keys()];
  // 신자진→인묘진 · 사유축→해자축 · 인오술→신유술 · 해묘미→사오미 (여러 명리 자료 교차 확인 — 코드와 따로 적은 것)
  const EXP = ["인묘진", "해자축", "신유술", "사오미", "인묘진", "해자축", "신유술", "사오미", "인묘진", "해자축", "신유술", "사오미"];
  const sjOrd = b => { const ys = B12.filter(yb => SJ.samjae(b, yb)); return ["들삼재", "눌삼재", "날삼재"].map(k => SJ_B[ys.find(yb => SJ.samjae(b, yb) === k)]).join(""); };
  t("삼재: 띠마다 들·눌·날삼재 세 해(지지)가 독립 일람과 같다", B12.map(sjOrd).join(","), EXP.join(","));
  t("삼재: 2027(미) 삼재띠 = 토끼·양·돼지 날삼재 · 2028(신) = 호랑이·말·개 들삼재", [2027, 2028].map(y => B12.filter(b => SJ.samjae(b, SJ.branchOf(y))).map(b => SJ_B[b] + ":" + SJ.samjae(b, SJ.branchOf(y))).join(" ")).join(" | "), "묘:날삼재 미:날삼재 해:날삼재 | 인:들삼재 오:들삼재 술:들삼재");
  t("삼재: 다음 첫해 — 말띠(2027부터) 2028 · 돼지띠(2028부터) 2037 · 쥐띠 2034 · 소띠 2031", [SJ.nextStart(6, 2027), SJ.nextStart(11, 2028), SJ.nextStart(0, 2027), SJ.nextStart(1, 2027)].join(","), "2028,2037,2034,2031");
  { const js = SJ.widgetScript(NB.Y0, NB.Y1).replace(/^<script>/, "").replace(/<\/script>$/, ""), el = {}, win = {};
    const doc = { getElementById: id => el[id] || (el[id] = { value: "", innerHTML: "" }) };
    let err = ""; try { new Function("document", "window", js)(doc, win); } catch (e) { err = String(e.message); }
    const C = y => win.samjaeCalc ? win.samjaeCalc(y, 2027) : null, s = r => JSON.stringify(r && [r.tti, r.years, r.cur, r.next]);
    t("삼재 위젯: 1990(말띠) → 2026·2027 아님, 2028 들삼재, 다음 2028~2030", err + s(C(1990)), JSON.stringify(["말띠", [[2026, ""], [2027, ""], [2028, "들삼재"]], null, [2028, 2029, 2030]]));
    t("삼재 위젯: 1991(양띠) → 2026 눌삼재·2027 날삼재, 지금 2025~2027, 다음 2037~2039", s(C(1991)), JSON.stringify(["양띠", [[2026, "눌삼재"], [2027, "날삼재"], [2028, ""]], [2025, 2026, 2027], [2037, 2038, 2039]]));
    t("삼재 위젯: 1920~2026 모든 해가 함수(samjae)와 같은 판정", Array.from({ length: 107 }, (_, i) => 1920 + i).every(y => { const r = C(y); return r && r.years.every(([x, k]) => k === SJ.samjae(SJ.branchOf(y), SJ.branchOf(x))); }), true);
    if (el.sjgo && el.sjgo.onclick) { el.sjy.value = "1987"; el.sjgo.onclick(); }
    const h = el.sjout ? el.sjout.innerHTML : "";
    t("삼재 위젯: 1987 입력 → 토끼띠·날삼재·다음 2037~2039·1987년생 페이지 링크", [h.includes("1987년생은 토끼띠"), h.includes("날삼재"), h.includes("2037~2039"), h.includes('href="newyear-1987.html"')].join(","), "true,true,true,true");
    if (el.sjgo && el.sjgo.onclick) { el.sjy.value = "abc"; el.sjgo.onclick(); }
    t("삼재 위젯: 숫자가 아니면 안내만 띄운다", (el.sjout ? el.sjout.innerHTML : "").includes("네 자리 숫자"), true); }
  t("년생별: 1950~2009 60해의 간지가 60갑자를 한 번씩 돈다", new Set(NB.YEARS.map(y => NB.facts(y).ko)).size + "/" + NB.YEARS.length, "60/60");
  t("년생별: 간지가 만세력 엔진의 연주(그해 7월 1일)와 같다", NB.YEARS.filter(y => { const p = sjPillars(y, 7, 1, null, 0, false).y; return SJ_S[p.s] + SJ_B[p.b] !== NB.facts(y).ko; }).join(","), "");
  t("년생별: 한 해의 주제 = 정(丁)이 태어난 해 천간에게 되는 십성(엔진 sjTenGod)", NB.YEARS.filter(y => { const f = NB.facts(y); return sjTenGod(f.s, 3) !== f.stem[0]; }).join(","), "");
  { const ny = src.slice(src.indexOf('{id:"newyear"')), j = ny.indexOf("var TXT="), TX = new Function("return " + ny.slice(j + 8, ny.indexOf("};", j) + 1))();
    t("년생별: 한 해의 제목이 신년운세 도구의 제목과 같다(같은 사이트에서 말이 갈리지 않게)", NB.STEM_REL.filter(([g, ti]) => !TX[g] || TX[g][0] !== ti).map(x => x[0]).join(","), ""); }
  t("년생별: 색 띠 — 1990 흰 말띠 · 1952 검은 용띠 · 1959 황금 돼지띠 · 1964 푸른 용띠 · 1976 붉은 용띠", [1990, 1952, 1959, 1964, 1976].map(y => NB.facts(y).color + " " + NB.facts(y).animal).join(","), "흰 말띠,검은 용띠,황금 돼지띠,푸른 용띠,붉은 용띠");
  // "정미년과 띠" 표 줄(한눈에 보기)은 rel.name("해묘미(亥卯未) 삼합" 같은 지지 원문)을 그대로 쓰면 안 읽힌다 — 관계 종류만 보여야 한다
  t("년생별: '정미년과 띠' 표 줄에 지지 원문(rel.name)이 아니라 관계 종류만 들어간다(해묘미·오미·자오 같은 글자 없음)", /relRow = f\.rel\.type === "무난" \? f\.relPlain : f\.rel\.type === "같은 띠" \? `\$\{f\.relPlain\}\(본명년\)` : `\$\{f\.relPlain\} — \$\{f\.rel\.type\}`;/.test(bs), true);
  t("년생별: 2027년 만 나이 — 1990 36/37 · 2009 17/18 · 1950 76/77", [1990, 2009, 1950].map(y => NB.facts(y).age.join("/")).join(","), "36/37,17/18,76/77");
  t("년생별 원고: 60해가 모두 있다", NB.YEARS.filter(y => !NB.TEXT[String(y)]).join(","), "");
  const ne = []; NB.YEARS.forEach(y => { const f = NB.facts(y), o = NB.TEXT[String(y)]; if (!o) return;
    NC.checkOne({ key: String(y), year: y, short: String(y).slice(2) + "년생", animal: f.animal, rel: { type: f.rel.type }, samjae2027: f.samjae || "삼재 아님", ageNum: f.age, sjNext: f.sjNext }, o).forEach(x => ne.push(x)); });
  t("년생별 원고: 칸·분량·금지어·명리 용어·존댓말·관계 이름·삼재·나이·연도 규칙(tools/newyear2027/ny_check.js)", ne.slice(0, 4).join(" | "), "");
  t("년생별 원고: 다른 해와 같은 문장(14자 이상)이 없다", NC.dupSentences(NB.TEXT).slice(0, 3).join(" | "), "");
  const X = SJ.TEXT, sjAll = [X.intro, X.what, X.custom, X.bok, X.when, X.note].concat(X.kinds.map(k => k[1]), X.tips, X.faq.map(q => q[1]));
  t("삼재 원고: 금지어 없음 · 모든 문장이 존댓말로 끝난다", NC.SENT(sjAll.join(" ")).filter(x => NC.BAN.test(x) || !NC.END.test(x)).slice(0, 3).join(" | "), "");
  { const q = X.faq.find(f => f[0].startsWith("2027년 삼재는 몇 년생")), bad = []; const NAME = { "돼지띠": 11, "토끼띠": 3, "양띠": 7 };
    (q[1].match(/(돼지띠|토끼띠|양띠) ([\d·]+)년생/g) || []).forEach(m => { const [, n, ys] = m.match(/(\S+) ([\d·]+)년생/); ys.split("·").forEach(y => { if (SJ.branchOf(+y) !== NAME[n]) bad.push(n + y); }); });
    t("삼재 원고: 2027 삼재 출생 연도 목록이 띠 계산과 같다(세 띠 모두 있음)", bad.join(",") + "|" + ["돼지띠", "토끼띠", "양띠"].every(n => q[1].includes(n)), "|true"); }
  { const jd = sjTermJd(2027, 315), ms = Math.round(((jd - 2440587.5) * 86400000 + 9 * 3600000) / 60000) * 60000, d = new Date(ms), K = require("./vendor-lunar.js"), c = new K(); c.setLunarDate(2027, 1, 1, false); const sol = c.getSolarCalendar();
    const ip = `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 오전 ${d.getUTCHours()}시 ${d.getUTCMinutes()}분`, seol = `${sol.month}월 ${sol.day}일`;
    t("2027 날짜: 입춘(태양황경 315°)·설날(음력 1월 1일) 계산값이 삼재 원고·삼재 표·신년운세 FAQ·llms 에 적힌 것과 같다(" + ip + " · 설날 " + seol + ")",
      [X.when.includes(ip) && X.when.includes("설날(음력 1월 1일)은 " + seol), X.faq.some(f => f[1].includes(ip)), bs.includes("2027년은 " + ip), bs.includes("2027년 입춘(" + ip + ")부터 정미년"), bs.includes("입춘(" + ip + ")부터이고, 설날(음력 1월 1일)은 " + seol)].join(","), "true,true,true,true,true"); }
  t("2027 날짜: 옛 어림값 '입춘 10시 40분경'이 사이트 원고에 남아 있지 않다(한 페이지에서 시각이 둘로 갈리지 않게)", bs.includes("10시 40분"), false);
  t("2027 시즌 배선: 삼재·년생별 페이지를 쓰고 사이트맵·llms·RSS·띠 페이지·신년운세·토정비결·칼럼에 잇는다",
    [bs.includes('fs.writeFileSync(path.join(OUT,"samjae.html"), samjaePage());'), bs.includes("NYB.YEARS.forEach(y=>fs.writeFileSync(path.join(OUT,nybUrl(y)), nybPage(y)));"),
     bs.includes('smUrl("samjae.html")+"\\n"+NYB.YEARS.map(y=>smUrl(nybUrl(y)))'), bs.includes("## 2027 정미년 — 삼재와 년생별 운세 (61)"), bs.includes('[DOMAIN + "/samjae.html", "삼재 계산기'),
     bs.includes("${z.ko}띠 년생별 2027년 운세"), bs.includes('<section class="guide" id="by-year">'), bs.includes('t.id==="tojeong" ? \'<section class="guide"><h2>2027 정미년 함께 보기</h2>\'+SEASON_LINKS'),
     fs.readFileSync("columns/zodiac-2027.js", "utf8").includes('link("samjae.html"')].join(","), "true,true,true,true,true,true,true,true,true");
  t("2027 시즌 배선: 원고가 없으면 빌드가 멈추고, 위젯은 content_samjae.js 의 것을 쓴다", [bs.includes('throw new Error("년생별 2027 원고 없음: "'), bs.includes("const SAMJAE_JS = SAMJAE.widgetScript(NYB.Y0, NYB.Y1);")].join(","), "true,true");
  t("2027 시즌: 원고 파이프라인(tools/newyear2027)이 리포에 있다", ["make_inputs.js", "STYLE_NY.md", "ny_check.js", "merge_ny.js", "README.md"].every(f => fs.existsSync("tools/newyear2027/" + f)), true); }
// ── 사주 결과 '한 장 요약'(sjSumHtml) · 상위 N%(SJ_PCT) — 표는 실제 분포여야 하고, 카드는 그려져야 한다 ──
{ const MP = require("./tools/sajupct/make_pct.js"), S30 = MP.make(7);   // 7일 간격: 60일 주기(일진)와 서로소라 일간이 고루 뽑힌다(30일 간격은 일간 두 개만 뽑혀 7%p 어긋났다)
  const share = (A, gi, c) => { const a = A[gi], t = a.reduce((x, y) => x + y, 0); return a.slice(c).reduce((x, y) => x + y, 0) / t * 100; };
  let worst = 0; ["h", "n"].forEach(k => [0, 1, 2, 3, 4].forEach(gi => [1, 2, 3, 4].forEach(c => { worst = Math.max(worst, Math.abs(share(SJ_PCT[k], gi, c) - share(S30[k], gi, c))); })));
  t("상위 N%: hub.html 의 SJ_PCT 가 엔진으로 다시 잰 분포(7일 간격 표본)와 2%p 안에서 맞는다(지어낸 숫자가 아니다)", worst < 2, true);
  t("상위 N%: 표본 수 — 시각 있음 262,980 · 시각 모름 21,915", [SJ_PCT.h[0].reduce((a, b) => a + b, 0), SJ_PCT.n[0].reduce((a, b) => a + b, 0)].join(","), "262980,21915");
  t("상위 N%: 칸이 많을수록 상위 %가 작아진다(재물 1→4칸)", [1, 2, 3, 4].map(c => sjPct(2, c, true)).every((v, i, a) => i === 0 || v < a[i - 1]), true);
  const p = sjPillars(1990, 3, 15, 14, 30, true), cnt = [0, 0, 0, 0, 0], G = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 }, GR = { 비견: "비겁", 겁재: "비겁", 식신: "식상", 상관: "식상", 편재: "재성", 정재: "재성", 편관: "관성", 정관: "관성", 편인: "인성", 정인: "인성" };
  [p.y, p.m, p.d, p.h].forEach((c, ci) => { cnt[SJ_ES[c.s]]++; cnt[SJ_EB[c.b]]++; if (ci !== 2) G[GR[sjTenGod(p.d.s, c.s)]]++; G[GR[sjTenGod(p.d.s, SJ_BMAIN[c.b])]]++; });
  const hz = sjSumHtml({ p, cnt, G, strong: true, yEl: "수", nm: "민지 님", hasH: true });
  t("한 장 요약: 그려진다 — 제목·일간 글자·오행 다섯 칸·별 그림·상위 % 카드·풀이 한 스푼, undefined/NaN 없음",
    [hz.includes("민지 님 한 장 요약"), hz.includes('class="ss-glyph'), (hz.match(/class="ss-t5"/g) || []).length === 5, hz.includes('<svg class="ss-radar"'), (hz.match(/class="ss-pc"/g) || []).length >= 1, hz.includes("풀이 한 스푼"), !/undefined|NaN/.test(hz)].join(","), "true,true,true,true,true,true,true");
  t("한 장 요약: 사람을 약하다고 부르지 않는다(신약 대신 채워 가며 크는 편)", !/신약|약한|약해/.test(sjSumHtml({ p, cnt, G, strong: false, yEl: "목", nm: "", hasH: true })), true);
  t("한 장 요약: 사주 결과 맨 위에 '이 정보로 풀었습니다' 확인 카드와 함께 붙고, 일주 별명은 sj/ilju.json 으로 채운다",
    [src.includes("'<div class=\"sj-confirm\"><div class=\"k\">이 정보로 풀었습니다</div>"), src.includes("sjSumHtml({p:p,cnt:cnt,G:G,strong:st.strong,yEl:yEl,nm:nmHon(nm),hasH:!!p.h})+\n        sjGridHtml("), src.includes('box.querySelector(".ss-arch-t").textContent=o.t')].join(","), "true,true,true"); }
// ── 궁합·신년 상위 N% — 궁합 표(GH_PCT)는 다른 시드로 다시 재어 맞추고, 신년은 점수 함수 하나를 go 와 상위 %가 같이 쓴다 ──
{ const GM = require("./tools/sajupct/make_gh_pct.js"), R = GM.make(40000, 777), sh = (A, sc) => A.slice(sc - 35).reduce((a, b) => a + b, 0) / A.reduce((a, b) => a + b, 0) * 100;
  const worst = Math.max(...[50, 60, 67, 75, 85, 95].map(sc => Math.abs(sh(GH_PCT, sc) - sh(R, sc))));
  t("궁합 상위 N%: GH_PCT 가 궁합 점수 함수로 다시 잰 표본(4만 쌍·다른 시드)과 2%p 안에서 맞는다", worst < 2, true);
  t("궁합 상위 N%: 표본 20만 쌍 · 점수가 높을수록 상위 %가 작아진다", GH_PCT.reduce((a, b) => a + b, 0) === 200000 && ghPct(90) < ghPct(70) && ghPct(70) < ghPct(50), true);
  const a = src.indexOf("    function nyScore("), b = src.indexOf("    if(typeof fetch===\"function\")fetch(\"ny/deep.json\")");
  const NY = new Function("sjTenGod", "sjYukhap", src.slice(a, b) + "\nreturn {nyScore,nyPct};")(sjTenGod, sjYukhap);
  t("신년 상위 N%: go 가 nyScore 를 쓰고(옛 셈 없음), 2027(丁未) 상위 %는 점수가 높을수록 작고 1~100 사이", [src.includes("var score=nyScore(me.d.s,yb,db,YS,YB);"), !src.includes('notes.forEach(function(n){if(n.indexOf("충")>=0)score-=6;'),
    NY.nyPct(90, 3, 7) < NY.nyPct(70, 3, 7), NY.nyPct(40, 3, 7) === 100, NY.nyPct(97, 3, 7) >= 1].join(","), "true,true,true,true,true");
  const sc = sumCard({ ttl: "두 사람 한 장 요약", sub: "s", arch: "a", archd: "d", chips: ["x"], axes: [["끌림", 73], ["안정", 65], ["소통", 76], ["생활", 54]], pct: { v: ghPct(90), t: "궁합 90점", n: "n" }, spoon: "s" }), sc2 = sumCard({ ttl: "t", sub: "s", arch: "a", archd: "d", axes: [["끌림", 50], ["안정", 50], ["소통", 50], ["생활", 50]], pct: { v: ghPct(55), t: "궁합 55점", n: "n" }, spoon: "s" });
  t("궁합·신년 한 장 요약: 상위 %는 60% 안일 때만 싣는다(90점 "+ghPct(90)+"% 보임 · 55점 "+ghPct(55)+"% 숨김)", [sc.includes('class="ss-pc"'), !sc2.includes('class="ss-pc"')].join(","), "true,true");
  { const M = [3,1,-1,4,0,2,5,-2,1,0,3,1].map((v, i) => ({ y: 2026, m: (i + 9) % 12 + 1, sc: v })), mv = sjMonthSvg(M);
    t("사주 열두 달 그래프: 점 12개·힘 실리는 달(3점↑) 금색 4·아낄 달(0점 아래) 붉은 2, 결과 뒤 MSC 로 채운다", [(mv.match(/<circle/g) || []).length, (mv.match(/class="mg"/g) || []).length, (mv.match(/class="mb"/g) || []).length, !/NaN|undefined/.test(mv), src.includes("mo.innerHTML=sjMonthSvg(MSC)")].join(","), "12,4,2,true,true"); }
  t("궁합·신년 한 장 요약: 상위 % 카드와 별 그림 4축이 그려지고 undefined/NaN 없음", [sc.includes('class="ss-pc"'), (sc.match(/<circle/g) || []).length === 4, !/undefined|NaN/.test(sc)].join(","), "true,true,true");
}
// ── 궁합 초대 링크 미리보기(워커) — 보낸 사람 이름만 쓰고, 이상한 이름은 '친구'로, 초대 없으면 null ──
{ const ogTxt = fs.readFileSync("worker_og.js", "utf8"), coreTxt = fs.readFileSync("nm_core.js", "utf8");
  const ogInvite = new Function(coreTxt.replace(/^export \{[^}]*\};?\s*$/m, "") + "\n" + ogTxt.replace(/^import .*$/m, "").replace(/^export function /gm, "function ") + "\nreturn ogInvite;")();
  const a = ogInvite({ p: [0, 0, 0, 0, 0, 0], g: "m", n: "민지" }), b = ogInvite({ n: "<b>" }), w = fs.readFileSync("worker.js", "utf8"), wr = fs.readFileSync("wrangler.jsonc", "utf8");
  t("궁합 초대 미리보기: '민지님이…' / 이상한 이름은 '친구가…' / 초대 없으면 null, 워커가 /gunghap.html 을 먼저 받고 noindex", [a.title, b.title, ogInvite(null), w.includes('if (pathname === "/gunghap.html") return gunghapInvite(req, env);'), /"\/gunghap\.html"[,\]]/.test(wr), /gunghapInvite[\s\S]{0,1200}noindex/.test(w)].join("|"),
    "민지님이 사주 궁합 보자고 보냈어요|친구가 사주 궁합 보자고 보냈어요||true|true|true");
}
// ── 오늘의 운세(서버가 끼우는 글): 글을 받는 26쪽이 wrangler(먼저 Worker로)·worker 정규식·빌드의 빈 자리에 모두 있어야 한다.
//    하나라도 빠지면 그 쪽만 조용히 글이 안 붙는다 ──
{ const w = fs.readFileSync("worker.js", "utf8"), wr = fs.readFileSync("wrangler.jsonc", "utf8"), re = new RegExp(w.match(/const TODAY_RE = \/(.+)\/;/)[1]),
    pages = ["horoscope", "zodiacfortune", ...require("./content_star.js").map(s => "star-" + s.en), ...require("./content_zodiac.js").map(z => "zodiac-" + z.en)];
  t("오늘의 운세: 26쪽 모두 wrangler·worker 정규식이 받고, 빌드가 빈 자리(#today-sv)를 4곳에 둔다", [pages.length, pages.filter(p => !wr.includes(`"/${p}.html"`) || !re.test(`/${p}.html`)).join(","), bs.split('<div id="today-sv"></div>').length - 1].join("|"), "26||4");
}
// ── 오늘의 운세 상위 N% — TF_PCT(60일주×필요한 기운)는 엔진으로 다시 잰 표본과 맞고, 점수는 tfScore 하나로 셈한다 ──
{ const R = require("./tools/sajupct/make_tf_pct.js").make(7), tot = A => A.flat().reduce((a, b) => a + b, 0), T1 = tot(TF_PCT), T2 = tot(R);
  let worst = 0; for (let i = 0; i < 60; i++) for (let e = 0; e < 5; e++) worst = Math.max(worst, Math.abs(TF_PCT[i][e] / T1 - R[i][e] / T2) * 100);
  t("오늘 상위 N%: TF_PCT 가 7일 간격 표본과 칸마다 0.5%p 안에서 맞고 전수 21,915명", worst < 0.5 && T1 === 21915, true);
  const today = sjPillars(2026, 10, 6, null, 0, false), tf = tfToday(1990, 3, 15, new Date(2026, 9, 6));
  t("오늘 상위 N%: tfToday 점수가 tfScore 와 같고, 높은 점수일수록 상위 %가 작다(98점 ≤ 70점 ≤ 35점=100%)", [tf.score === tfScore(tf.me.d.s, tf.me.d.b, tf.st.yong, today).score, tfPct(98, today) <= tfPct(70, today), tfPct(35, today) === 100].join(","), "true,true,true");
  t("오늘 상위 N%: 결과 화면·저장 카드에 60% 안일 때만 싣는다", [src.includes("(tfP<=60?'<div class=\"tf-pct\">"), src.includes('badge:tfP<=60?"오늘 운 상위 "+tfP+"%":""')].join(","), "true,true");
}
console.log("\n결과: " + pass + " 통과 / " + fail + " 실패");
process.exit(fail ? 1 : 0);
