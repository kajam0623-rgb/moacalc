// 다시 쓴 원고를 저장소 파일로 합친다. 사용: node merge.js <combo|verdict|gung|q|today|todayq|horoscope> ...
const fs = require("fs"), path = require("path");
const ROOT = "C:/Users/닥터원츠/salary-calc/", S = __dirname + "/", OUT = S + "out/", IN = S + "in/", BAK = S + "bak/";
fs.mkdirSync(BAK, { recursive: true });
const rd = f => JSON.parse(fs.readFileSync(f, "utf8"));
const backup = f => { const b = BAK + path.basename(f) + "." + Date.now(); fs.copyFileSync(f, b); return b; };
const flat = (o, p = "", acc = {}) => { if (typeof o === "string") acc[p] = o; else if (o && typeof o === "object") Object.keys(o).forEach(k => flat(o[k], p ? p + "." + k : k, acc)); return acc; };
function sameKeys(a, b, label) { const fa = Object.keys(flat(a)).sort().join("|"), fb = Object.keys(flat(b)).sort().join("|"); if (fa !== fb) throw new Error(label + " 키 구조가 원문과 다르다"); }
const what = process.argv.slice(2);
for (const w of what) {
  if (w === "combo") {
    const orig = require(ROOT + "content_saju_combo.js"), merged = {};
    ["gap", "eul", "byeong", "jeong", "mu", "gi", "gyeong", "sin", "im", "gye"].forEach(k => { const o = rd(OUT + "combo_" + k + ".json"); merged[k] = o[k]; });
    sameKeys(orig, merged, "combo"); backup(ROOT + "content_saju_combo.js");
    fs.writeFileSync(ROOT + "content_saju_combo.js", "// 사주 조합 원고 — 일간 10 × 격국(월지 본기 십성) 10. 보살 말투. core=격국 칸, money·job·love·health=운세 네 칸\n// 2026-09-30 쉬운 말·긍정 베이스·풀어서 설명으로 다시 씀(사용자 지적: \"말들이 어려워\"). 사이트에는 sj/<일간>-<십성>.json 으로 나눠 싣고, 사주 도구가 버튼을 누를 때 받아 둔다\nmodule.exports = " + JSON.stringify(merged, null, 1) + ";\n");
    console.log("combo 합침", Object.keys(flat(merged)).length + "칸");
  }
  if (w === "verdict") {
    const orig = require(ROOT + "content_saju_verdict.js"), merged = {}; ["money", "job", "love"].forEach(k => { merged[k] = rd(OUT + "verdict_" + k + ".json")[k]; });
    sameKeys(orig, merged, "verdict"); backup(ROOT + "content_saju_verdict.js");
    fs.writeFileSync(ROOT + "content_saju_verdict.js", "// 사주 운세 판정 문장 — head[일간][갈래] = 칸의 첫 문장(접힌 제목), follow[격국 십성][갈래] = 이어지는 설명. 보살 말투\n// 갈래: 재물 none·mid·many(재성 수) / 직업 none·many·craft·mid(관성·식상 수) / 애정 none·mid·many(짝 별 수)\n// 2026-09-30 쉬운 말·긍정 베이스로 다시 씀\nmodule.exports = " + JSON.stringify(merged, null, 1) + ";\n");
    console.log("verdict 합침", Object.keys(flat(merged)).length + "칸");
  }
  if (w === "gung") {
    const orig = require(ROOT + "content_saju_gung.js"), m = rd(OUT + "gung.json"); sameKeys(orig, m, "gung"); backup(ROOT + "content_saju_gung.js");
    fs.writeFileSync(ROOT + "content_saju_gung.js", "// 사주 여덟 글자 자리 풀이 — 자리(year·month·day·hour) × 그 자리 지지 본기의 열 가지 역할. 2026-09-30 쉬운 말·긍정 베이스로 다시 씀\nmodule.exports = " + JSON.stringify(m, null, 1) + ";\n");
    console.log("gung 합침", Object.keys(flat(m)).length + "칸");
  }
  if (w === "q") {
    const orig = require(ROOT + "content_saju_q.js"), m = rd(OUT + "q.json"); sameKeys(orig, m, "q"); backup(ROOT + "content_saju_q.js");
    fs.writeFileSync(ROOT + "content_saju_q.js", "// 사주 꼬리질문 답 문장 — [질문키].ten[십성] = 그 해(또는 그 달)의 십성이 드는 때에 보여 주는 문장, none = 앞으로 10년 안에 그런 해가 없을 때. 보살 말투\n// 시기는 hub.html(사주 도구)이 해마다 드는 운을 사주와 맞춰 고르고, 빌드가 site/sj/q.json 으로 내보낸다. 2026-09-30 쉬운 말·긍정 베이스로 다시 씀\nmodule.exports = " + JSON.stringify(m, null, 1) + ";\n");
    console.log("q 합침", Object.keys(flat(m)).length + "칸");
  }
  if (w === "todayq") {
    const orig = require(ROOT + "content_today_q.js"), m = rd(OUT + "today_q.json"); sameKeys(orig, m, "todayq"); backup(ROOT + "content_today_q.js");
    fs.writeFileSync(ROOT + "content_today_q.js", "// 오늘의 운세 꼬리질문 답 — [질문키].ten[십성] · chung · hap. 보살 말투. 2026-09-30 쉬운 말·긍정 베이스로 다시 씀\nmodule.exports = " + JSON.stringify(m, null, 1) + ";\n");
    console.log("todayq 합침", Object.keys(flat(m)).length + "칸");
  }
  if (w === "today") {
    // hub.html 의 오늘의 운세 그날 기운 원고(TXT)·한 줄 요약(TF_LINE)·십이운성(UN_MOOD, SJ_UN_DESC)을 문자열 단위로 바꿔 끼운다
    let s = fs.readFileSync(ROOT + "hub.html", "utf8"); backup(ROOT + "hub.html");
    const oldT = rd(IN + "today_txt.json"), newT = rd(OUT + "today_txt.json"); sameKeys(oldT, newT, "today_txt");
    const oldU = rd(IN + "un.json"), newU = rd(OUT + "un.json"); sameKeys(oldU, newU, "un");
    let n = 0; const rep = (a, b) => { const q = x => JSON.stringify(x).slice(1, -1); let A = a; let c = s.split(A).length - 1; if (c !== 1) { A = q(a); c = s.split(A).length - 1; } if (c !== 1) throw new Error("오늘의 운세 문자열 일치 " + c + "곳(기대 1): " + a.slice(0, 40)); s = s.split(A).join(q(b)); n++; };
    const esc = x => x.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
    Object.keys(oldT).forEach(k => Object.keys(oldT[k]).forEach(f => { if (f === "line") return; rep(oldT[k][f], newT[k][f]); }));
    // TF_LINE 은 따옴표로 감싼 한 줄 표라 문자열 그대로 바꾼다(요약은 형태가 같은 문자열 하나)
    Object.keys(oldT).forEach(k => { if (oldT[k].line !== newT[k].line) rep(oldT[k].line, newT[k].line); });
    const mk = (name, o) => "var " + name + "={\n" + Object.keys(o).map(k => "   \"" + k + "\":\"" + esc(o[k]) + "\"").join(",\n") + "};";
    s = s.replace(/var UN_MOOD=\{[\s\S]*?\};/, () => mk("UN_MOOD", newU.mood)); s = s.replace(/var SJ_UN_DESC=\{[\s\S]*?\};/, () => mk("SJ_UN_DESC", newU.desc));
    fs.writeFileSync(ROOT + "hub.html", s); console.log("today 합침 문자열 " + n + "개 + 십이운성 24개");
  }
  if (w === "zodiac") {
    const g = rd(OUT + "zodiac_gen.json"), r = rd(OUT + "zodiac_rest.json"), m = { gen: g, ...r, note: "오늘 날짜의 땅 글자와 내 띠의 관계, 오늘 하늘 글자가 내 띠에게 갖는 역할, 올해·내년 태세와의 관계로 문장을 골랐습니다. 전통 명리의 해석을 바탕으로 한 참고용입니다." };
    const head = "/* 띠별 운세(오늘) — 오늘 일진과 내 띠의 관계(7)·오늘 하늘 글자의 역할(10)·띠(12)로 고르는 원고. hub.html 의 zfDeep(b, today, D, art)·zfYear(b, D)가 쓴다. build_site.js 가 zf/deep.json 으로 내보낸다.\n   gen[띠][관계] · money·love·body·tip[관계] · tg[십성] · year[관계](토큰 {Y} {A}). 풀이는 보살 말투, note 만 존댓말 */\n";
    fs.writeFileSync(ROOT + "content_zodiac_fortune.js", head + "module.exports = " + JSON.stringify(m, null, 1) + ";\n");
    console.log("zodiac 저장", Object.keys(flat(m)).length + "칸");
  }
  if (w === "horoscope") {
    const m = rd(OUT + "horoscope.json"); m.note = "달의 위치는 천문 공식으로 직접 계산한 값이며, 내 별자리와 이루는 각도·달의 모양·요일의 별로 하루의 결을 골랐습니다. 행운의 색은 전통 대응에 따른 참고용이며 실제 결정을 대신하지 않습니다.";
    fs.writeFileSync(ROOT + "content_horoscope.js", "/* 별자리 운세(오늘) — 오늘 달의 자리·모양과 내 별자리의 각도로 고르는 원고. hub.html 의 hsDeep(mine, now, D)이 쓴다. build_site.js 가 hs/deep.json 으로 내보낸다.\n   토큰: {wd} 요일 글자 {wdr} 요일의 별 {ele} 내 원소 {ruler} 내 수호성 {color} 색. 풀이는 보살 말투, note 만 존댓말 */\nmodule.exports = " + JSON.stringify(m, null, 1) + ";\n");
    console.log("horoscope 저장", Object.keys(flat(m)).length + "칸");
  }
}
