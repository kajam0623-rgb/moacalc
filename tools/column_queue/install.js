// 사용: node install.js en1 en2 …  — C:/tmp/col-new/<en>.js·.figs.json 을 리포에 넣고 그림 작업·알트·verify 개수를 맞춘다
const fs = require("fs"), R = "C:/Users/닥터원츠/salary-calc/", N = R + "tools/column_queue/";
const ens = process.argv.slice(2); if (!ens.length) throw "en 없음";
const J = JSON.parse(fs.readFileSync(R + "tools/colimg/jobs.json", "utf8"));
let ci = fs.readFileSync(R + "content_column_img.js", "utf8"); let added = 0;
for (const en of ens) {
  const c = require(N + en + ".js"), F = JSON.parse(fs.readFileSync(N + en + ".figs.json", "utf8"));
  if (c.en !== en) throw en + " en 불일치";
  F.forEach(f => { if (f.after < 0 || f.after >= c.sections.length) throw en + " after 범위"; });
  fs.writeFileSync(R + "columns/" + en + ".js", fs.readFileSync(N + en + ".js", "utf8").replace(/\r\n/g, "\n"));
  F.forEach((f, i) => { const name = `fig-${en}-${i + 1}`;
    const scene = f.scene.replace(/^Cinematic[^:]*:\s*/i, "").replace(/,?\s*no text[^.]*$/i, "");
    if (!J.some(j => j.name === name)) J.push({ name, kind: "fig", subject: scene }); });
  if (!ci.includes(`"${en}": [`)) {
    const alts = F.map(f => { let a = f.alt.replace(/\s*\|\s*동네보살\s*$/, ""); if (a.length > 108) a = a.slice(0, 107) + "…"; return `      { after: ${f.after}, alt: ${JSON.stringify(a + " | 동네보살")} }`; });
    ci = ci.replace(`    "red-goat-2027": [`, `    "${en}": [\n${alts.join(",\n")}\n    ],\n    "red-goat-2027": [`); added += F.length;
  }
}
fs.writeFileSync(R + "tools/colimg/jobs.json", JSON.stringify(J, null, 0).replace(/\},\{/g, "},\n  {").replace(/^\[\{/, "[\n  {").replace(/\}\]$/, "}\n]\n"));
fs.writeFileSync(R + "content_column_img.js", ci);
// verify 의 글 안 그림 수·전체 그림 수를 실제 값으로
delete require.cache[require.resolve(R + "content_column_img.js")];
const CI = require(R + "content_column_img.js"), nf = Object.values(CI.figs).reduce((s, a) => s + a.length, 0), tot = nf + CI.tiles.length;
let v = fs.readFileSync(R + "verify.js", "utf8");
v = v.replace(/"\d+,,true,true"\);/, `"${nf},,true,true");`).replace(/t\("칼럼 그림: 글 안 그림 \d+장/, `t("칼럼 그림: 글 안 그림 ${nf}장`)
  .replace(/"\d+\|"\);/, `"${tot}|");`).replace(/t\("칼럼 그림: \d+장\(타일 14 \+ 글 안 \d+\)/, `t("칼럼 그림: ${tot}장(타일 14 + 글 안 ${nf})`);
fs.writeFileSync(R + "verify.js", v);
console.log("ok", ens.join(","), "그림 추가", added, "글 안", nf, "전체", tot);
