// 년생별 2027 운세 원고를 쓸 에이전트에게 줄 입력을 만든다. 사용: node make_inputs.js [입력 폴더]
// batch_01~06.json — 출생 연도 10개씩(1950~1959, …, 2000~2009). 칸마다 그 해의 계산값과 띠 소개를 넣는다
const fs = require("fs"), path = require("path");
const N = require("../../content_newyear_by.js"), Z = require("../../content_zodiac.js"), S = require("../../content_samjae.js");
const DIR = process.argv[2] || "C:/tmp/moacalc-learn/ny2027/in";
fs.mkdirSync(DIR, { recursive: true });
const flat = s => String(s).replace(/\s+/g, " ").trim();
const one = y => { const f = N.facts(y), z = Z[f.b];
  return { key: String(y), year: y, short: String(y).slice(2) + "년생", ganji: `${f.ko}(${f.han})년`, animal: f.animal, color: `${f.color} ${f.animal.replace(/띠$/, "")}`,
    age2027: `생일 전 만 ${f.age[0]}세 · 생일 뒤 만 ${f.age[1]}세`, ageNum: f.age, stage: f.stage,
    stem: { name: f.stem[0], title: f.stem[1], meaning: f.stemPlain },
    rel: { type: f.rel.type, name: f.rel.name, plain: f.relPlain, explain: (require("../../content_ttigunghap.js").EXPLAIN)[f.rel.type] },
    sjNext: f.sjNext, samjae2027: f.samjae ?`${f.samjae}(2025~2027 삼재의 마지막 해). 다음 삼재는 ${f.sjNext}년부터` : `삼재 아님. 다음 삼재는 ${f.sjNext}~${f.sjNext + 2}년`,
    sameTti: N.sameTti(y),
    profile: { intro: flat(z.intro).slice(0, 420), love: flat(z.love).slice(0, 260), work: flat(z.work).slice(0, 260) },
    zodiac2027: flat(z.y2027) };
};
for (let k = 0; k < 6; k++) {
  const ys = N.YEARS.slice(k * 10, k * 10 + 10);
  fs.writeFileSync(path.join(DIR, `batch_0${k + 1}.json`), JSON.stringify(ys.map(one), null, 1));
}
console.log("입력 만듦:", DIR, "· 연도", N.YEARS.length, "· 묶음 6 ·", N.Y0 + "~" + N.Y1, "· 삼재", S.KIND.join("/"));
