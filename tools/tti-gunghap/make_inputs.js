// 띠 궁합 원고를 쓸 에이전트에게 줄 입력을 만든다. 사용: node make_inputs.js [입력 폴더]
// profiles.json — 12띠 소개(성격·연애·일): 두 띠 성향을 이 글에 맞춰 쓰게 하는 근거
// pairs_01~07.json — 짝 78개를 관계 종류별로 묶음(삼합 12 · 육합+충 12 · 원진+형 10 · 무난 11/11/10 · 같은 띠 12)
// hubs.json — 띠별 페이지 도입 글을 쓸 12띠
const fs = require("fs"), path = require("path");
const T = require("../../content_ttigunghap.js"), Z = require("../../content_zodiac.js");
const DIR = process.argv[2] || "C:/tmp/moacalc-learn/tti/in";
fs.mkdirSync(DIR, { recursive: true });
const prof = Z.map((z, i) => ({ name: T.JI[i].name, ji: z.ji, ele: z.ele, season: z.season, month: z.month, intro: z.intro.replace(/\s+/g, " ").trim(), love: z.love.replace(/\s+/g, " ").trim(), work: z.work.replace(/\s+/g, " ").trim() }));
fs.writeFileSync(path.join(DIR, "profiles.json"), JSON.stringify(prof, null, 1));
const pair = p => ({ key: p.key, a: T.JI[p.a].name, b: T.JI[p.b].name, type: p.type, relation: p.name, tags: p.tags, typeExplain: T.EXPLAIN[p.type], sameZodiac: p.a === p.b });
const of = t => T.PAIR_LIST.filter(p => p.type === t).map(pair);
const mundan = of("무난");
const batches = [of("삼합"), of("육합").concat(of("충")), of("원진").concat(of("형")), mundan.slice(0, 11), mundan.slice(11, 22), mundan.slice(22), of("같은 띠")];
batches.forEach((b, i) => fs.writeFileSync(path.join(DIR, "pairs_0" + (i + 1) + ".json"), JSON.stringify(b, null, 1)));
const hubs = T.JI.map(j => { const rs = T.PAIR_LIST.filter(p => p.a === j.i || p.b === j.i), other = p => T.JI[p.a === j.i ? p.b : p.a].name, names = t => rs.filter(p => p.type === t).map(other);
  return { key: j.en, name: j.name, ele: j.ele, season: prof[j.i].season, intro: prof[j.i].intro, love: prof[j.i].love, work: prof[j.i].work, 삼합: names("삼합"), 육합: names("육합"), 충: names("충"), 원진: names("원진"), 형: names("형") }; });
fs.writeFileSync(path.join(DIR, "hubs.json"), JSON.stringify(hubs, null, 1));
console.log("입력 만듦:", DIR, "· 짝", batches.reduce((a, b) => a + b.length, 0), "· 묶음", batches.map(b => b.length).join("/"), "· 띠", hubs.length);
