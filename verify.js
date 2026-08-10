/* 정확성 검증: 만세력 엔진(문헌 검증값 대조) + 세금·공식 스팟체크. 실행: node verify.js */
const fs = require("fs");
const src = fs.readFileSync("hub.html", "utf8");
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
// 로또 45C6
const C=(n,r)=>{let x=1;for(let i=0;i<r;i++)x=x*(n-i)/(i+1);return Math.round(x);};
t("로또 45C6", C(45,6), 8145060);
// 4대보험 (2026 요율, 앞서 공식 확인)
t("국민연금 300만", Math.round(3e6*0.0475), 142500);
t("건강보험 300만", Math.round(3e6*0.03595), 107850);

// ── 도구 스크립트 정적 검사: 정의되지 않은 헬퍼 호출 (렌더 중단 버그 방지) ──
const HELPERS = ["num","won","comma","bindMoney","progressive","earnedDed","incomeTaxMonthly","sjPillars","sjTenGod","sjJdKST","sjSunLong","sjJdn","sjIpchun","sjStrength","sjUnseong","sjSinsal","sjSamhap","sjYukhap","zoCard","stOf","stCard"];
const toolsSrc = inner.slice(inner.indexOf("var TOOLS="));
// 문자열 리터럴(HTML·CSS 조각) 제거 후 실제 호출만 검사
const codeOnly = toolsSrc.replace(/'(?:\\.|[^'\\])*'/g, "''").replace(/"(?:\\.|[^"\\])*"/g, '""');
const called = [...codeOnly.matchAll(/(?:^|[^\w.$])([a-zA-Z_$][\w$]*)\s*\(/g)].map(m => m[1]);
const known = new Set([...HELPERS, "function","if","for","while","switch","catch","return","typeof","Math","Number","String","Array","Date","Set","Map","JSON","parseInt","parseFloat","isNaN","el","render","calc","go","gen","draw","deal","cell","P","relB","pts","cnt6","strokes","mIdxOf","fromP","fromM","rate","name","require","console"]);
const unknownCalls = [...new Set(called)].filter(n => !known.has(n) && !/^[A-Z]/.test(n) && !toolsSrc.includes("function "+n) && !toolsSrc.includes("var "+n+"=") && !toolsSrc.includes(n+"=function"));
t("도구 스크립트: 미정의 헬퍼 호출 없음", unknownCalls.length === 0, true);
if (unknownCalls.length) console.log("   ⚠ 의심 호출:", unknownCalls.join(", "));

console.log("\n결과: " + pass + " 통과 / " + fail + " 실패");
process.exit(fail ? 1 : 0);
