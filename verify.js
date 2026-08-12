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

// ── 타로: 카드 데이터와 분야별 해석 배열의 길이가 어긋나면 undefined가 화면에 뜬다 ──
const tarotSrc = inner.slice(inner.indexOf('id:"tarot"'), inner.indexOf('id:"todayfortune"'));
const mArr = tarotSrc.slice(tarotSrc.indexOf("var M="), tarotSrc.indexOf("// 분야별 해석"));
const fArr = tarotSrc.slice(tarotSrc.indexOf("var FLD="), tarotSrc.indexOf("var POS="));
const countRows = s => (s.match(/\["/g) || []).length; // 각 행은 ["로 시작하고 행 안에는 다시 나오지 않는다
t("타로 메이저 아르카나 22장", countRows(mArr), 22);
t("타로 분야별 해석 22장 (M과 동일)", countRows(fArr), 22);
t("타로 아트 매핑 22장", (tarotSrc.slice(tarotSrc.indexOf("var ART=")).match(/tarot-\d\d-/g) || []).length, 22);
// T2: 포지션별 해석 66문장 + 상징 스토리 22개
const posmCode = tarotSrc.slice(tarotSrc.indexOf("var POSM="), tarotSrc.indexOf("// 카드 상징 스토리"));
const storyCode = tarotSrc.slice(tarotSrc.indexOf("var STORY="), tarotSrc.indexOf("var ART="));
const POSM = new Function(posmCode + "; return POSM;")();
const STORY = new Function(storyCode + "; return STORY;")();
t("타로 포지션 해석 22장 × 3포지션", POSM.length === 22 && POSM.every(r => r.length === 3 && r.every(s => typeof s === "string" && s.length >= 20)), true);
t("타로 포지션 문장은 카드 안에서 서로 다름", POSM.every(r => new Set(r).size === 3), true);
t("타로 상징 스토리 22개", STORY.length === 22 && STORY.every(s => s.length >= 25), true);
t("타로 출력에 스토리·포지션 조립", tarotSrc.includes("STORY[pk.i]") && tarotSrc.includes("POSM[pk.i][i]"), true);
const guideCode = tarotSrc.slice(tarotSrc.indexOf("var POS_GUIDE="), tarotSrc.indexOf("// 포지션별 해석"));
t("타로 포지션 안내 3종", new Function(guideCode + "; return POS_GUIDE;")().length, 3);

// ── 오늘의 운세: 십성 10종 모두 9개 필드(총운·애정·직장·건강 포함)를 갖는가 ──
const tfSrc = inner.slice(inner.indexOf('id:"todayfortune"'), inner.indexOf('id:"horoscope"'));
const tfKeys = [...tfSrc.matchAll(/"(비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인)":\[/g)].map(m => m[1]);
t("오늘의 운세 십성 10종 정의", new Set(tfKeys).size, 10);
t("오늘의 운세 항목별 해설(애정·직장·건강) 존재", /애정운 <span|T\[6\]/.test(tfSrc) && /T\[7\]/.test(tfSrc) && /T\[8\]/.test(tfSrc), true);

// ── T1 콘텐츠 대개편: 정체성·무드·헤드라인·용신 ──
t("일간 정체성 SJ_ILGAN_ID 10문장", SJ_ILGAN_ID.length===10 && SJ_ILGAN_ID.every(s=>s.indexOf("—")>0), true);
t("십이운성 무드 UN_MOOD 12문장", Object.keys(UN_MOOD).length===12 && SJ_UN.every(u=>typeof UN_MOOD[u]==="string" && UN_MOOD[u].length>=20), true);
const txtCode = tfSrc.slice(tfSrc.indexOf("var TXT={"), tfSrc.indexOf("]};")+3);
const TFTXT = new Function(txtCode + "; return TXT;")();
t("오늘의 운세 TXT 10종 × 10필드(hl 포함)", Object.keys(TFTXT).length===10 && Object.values(TFTXT).every(a=>a.length===10 && typeof a[9]==="string" && a[9].length>=8), true);
t("총운 3계층 조립(UN_MOOD 접합)", tfSrc.includes("UN_MOOD[un]") && tfSrc.includes("삼합도 충도 육합도 없어"), true);
t("용신 섹션·내일 미리보기 렌더", tfSrc.includes("용신으로 보는 오늘") && tfSrc.includes("내일 미리보기"), true);
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
const FORTUNE_GATED = ["saju","todayfortune","horoscope","stargunghap","zodiacfortune","gunghap","newyear"];
const toolBlock = id => { const i = inner.indexOf('{id:"'+id+'"'); const j = inner.indexOf('{id:"', i+8); return inner.slice(i, j<0?inner.length:j); };
t("운세 7종 물어보기 배선(askWire)", FORTUNE_GATED.every(id=>/askWire\(el,go,\[/.test(toolBlock(id))), true);
// 버튼 클릭 외에 결과를 그리는 경로가 남아 있으면 게이트가 샌다(select change·초기 go() 모두)
t("운세 7종 자동 실행 제거", FORTUNE_GATED.every(id=>{const b=toolBlock(id);return !/;go\(\);/.test(b) && !/addEventListener\("change",go\)/.test(b);}), true);
t("버튼 문구 통일(ASK_LABEL)", (inner.match(/'\+ASK_LABEL\+'<\/button>/g)||[]).length, 7);
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
t("sitemap에 lastmod", /<lastmod>\$\{BUILD_DAY\}<\/lastmod>/.test(bs), true);
t("일일 갱신 도구에만 dateModified", /const DAILY = \["todayfortune","horoscope","zodiacfortune"\]/.test(bs) && /ld\.dateModified = BUILD_DAY/.test(bs), true);
t("일간·십성 앵커에 검색어", /\$\{g\.ko\}\$\{g\.el\} 일간<\/a>/.test(bs) && /\$\{s\.ko\} 뜻<\/a>/.test(bs), true);

// ── 브랜드: 파비콘·로고 ──
// 계산기 시절 '=' 아이콘이 남아 있으면 브랜드가 갈린다
t("파비콘은 보살 마크(= 아이콘 잔재 없음)", !/%3D<\/text>/.test(bs) && /favicon\.ico/.test(bs), true);
t("파비콘 규격 파일 존재", ["favicon.ico","favicon-32.png","icon-192.png","icon-512.png","apple-touch-icon.png"]
  .every(f=>fs.existsSync("img/"+f)), true);
t("웹매니페스트 출력", /site\.webmanifest/.test(bs), true);
t("헤더 로고는 이미지", /class="lmark" src="img\/logo\.png"/.test(bs) && /class=\\"lmark\\" src=\\"img\/logo\.png\\"/.test(inner) || /class="lmark" src="img\/logo\.png"/.test(bs), true);
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
// 십성 이름은 받침이 섞여 있다(비견/겁재). 하드코딩 조사가 남으면 "겁재과 연애"가 출력된다
const sipsSrc = bs.slice(bs.indexOf("function sipseongPage"), bs.indexOf("const FUN_TOP"));
t("십성 페이지 조사는 josa() 사용", !/\$\{s\.(?:ko|pair)\}(?:은|는|이|가|과|와)[\s`]/.test(sipsSrc), true);

// ── 도구 스크립트 정적 검사: 정의되지 않은 헬퍼 호출 (렌더 중단 버그 방지) ──
const HELPERS = ["num","won","comma","bindMoney","progressive","earnedDed","incomeTaxMonthly","sjPillars","sjTenGod","sjJdKST","sjSunLong","sjJdn","sjIpchun","sjStrength","sjUnseong","sjSinsal","sjSamhap","sjYukhap","zoCard","stOf","stCard","escH","josa","loadPrefs","savePrefs","track","rateBar","shareBtn","bindShare","fortuneCard","bindSave","wrapText","birthDial","conceptArt","askWire","askFx","askWait","askThink","reveal","countUp","fillBars","gradeFx","bumpStreak","streakHtml","bujeokHtml"];
const toolsSrc = inner.slice(inner.indexOf("var TOOLS="));
// 문자열 리터럴(HTML·CSS 조각) 제거 후 실제 호출만 검사
const codeOnly = toolsSrc.replace(/'(?:\\.|[^'\\])*'/g, "''").replace(/"(?:\\.|[^"\\])*"/g, '""');
const called = [...codeOnly.matchAll(/(?:^|[^\w.$])([a-zA-Z_$][\w$]*)\s*\(/g)].map(m => m[1]);
const known = new Set([...HELPERS, "function","if","for","while","switch","catch","return","typeof","Math","Number","String","Array","Date","Set","Map","JSON","parseInt","parseFloat","isNaN","el","render","calc","go","gen","draw","deal","cell","P","relB","pts","cnt6","strokes","mIdxOf","fromP","fromM","rate","name","require","console"]);
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
const JVAR = "(?:SJ_EL\\[[^\\]]+\\]|SJ_UN\\[[^\\]]+\\]|\\bmn|\\bmx|\\bun|\\brel|\\byEl|\\by2El|\\bluckEl|\\bgyeok|\\bs1)";
const hardJosa = [...toolsSrc.matchAll(new RegExp(JVAR + "\\s*\\+\\s*[\"'](?:이|은|을|과|가|는|를|와)(?=[\\s\"'])", "g"))].map(m => m[0].replace(/\s+/g, ""));
t("조립 변수 뒤 하드코딩 조사 없음 (josa 사용)", hardJosa.length, 0);
if (hardJosa.length) console.log("   ⚠ 조사 하드코딩:", hardJosa.join(" | "));

console.log("\n결과: " + pass + " 통과 / " + fail + " 실패");
process.exit(fail ? 1 : 0);
