/* 새 페이지군이 배포돼도 되는지 판정한다.
   - 중복: 구글은 본문이 거의 같은 페이지를 하나만 색인하고 나머지를 버린다
   - 분량: 얇은 페이지는 색인돼도 순위가 안 나오고 사이트 전체 평가를 깎는다
   기준값 근거: 기존 일진 60 페이지 실측이 평균 67.8%, 최대 73.2%였다. */
const fs = require("fs");
const path = require("path");

const textOf = html => {
  const b = html.slice(html.indexOf("<body"));
  return b.replace(/<script[\s\S]*?<\/script>/g, " ")
          .replace(/<style[\s\S]*?<\/style>/g, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
};

const grams = s => {
  const g = new Set();
  for (let i = 0; i <= s.length - 3; i++) g.add(s.slice(i, i + 3));
  return g;
};

const jaccard = (a, b) => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const uni = a.size + b.size - inter;
  return uni === 0 ? 1 : inter / uni;
};

/* docs: [{id, text}], opts: {maxMean, maxMax, minChars}
   돌려주는 것: {ok, mean, max, maxPair, shortest, reasons[]} */
function checkGroup(docs, opts) {
  const reasons = [];
  const withG = docs.map(d => ({ ...d, g: grams(d.text) }));

  // 분량
  const shortest = docs.reduce((a, d) => d.text.length < a.text.length ? d : a);
  if (shortest.text.length < opts.minChars) {
    reasons.push(`분량 미달: ${shortest.id} ${shortest.text.length}자 (기준 ${opts.minChars}자)`);
  }

  // 중복 — 모든 쌍
  let sum = 0, n = 0, max = 0, maxPair = "";
  for (let i = 0; i < withG.length; i++)
    for (let j = i + 1; j < withG.length; j++) {
      const s = jaccard(withG[i].g, withG[j].g);
      sum += s; n++;
      if (s > max) { max = s; maxPair = `${withG[i].id} ↔ ${withG[j].id}`; }
    }
  const mean = n ? sum / n : 0;
  if (mean > opts.maxMean) reasons.push(`평균 유사도 ${(mean*100).toFixed(1)}% > 기준 ${(opts.maxMean*100)}%`);
  if (max > opts.maxMax)  reasons.push(`최대 유사도 ${(max*100).toFixed(1)}% (${maxPair}) > 기준 ${(opts.maxMax*100)}%`);

  return { ok: reasons.length === 0, mean, max, maxPair, shortest, reasons };
}

/* site/ 에서 접두사로 파일을 모아 검사한다 */
function checkFiles(dir, prefix, opts) {
  const files = fs.readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith(".html"));
  if (!files.length) return { ok: false, reasons: [`${prefix}* 파일이 없다`], mean: 0, max: 0 };
  const docs = files.map(f => ({ id: f, text: textOf(fs.readFileSync(path.join(dir, f), "utf8")) }));
  return { ...checkGroup(docs, opts), count: files.length };
}

module.exports = { textOf, grams, jaccard, checkGroup, checkFiles };

// CLI: node tools/gate.js <접두사> [최소글자수]
if (require.main === module) {
  const prefix = process.argv[2];
  const minChars = +(process.argv[3] || 2000);
  if (!prefix) { console.error("사용법: node tools/gate.js <파일접두사> [최소글자수]"); process.exit(2); }
  const r = checkFiles(path.join(__dirname, "..", "site"), prefix, { maxMean: 0.75, maxMax: 0.85, minChars });
  console.log(`${prefix}*  ${r.count || 0}개`);
  console.log(`  평균 유사도 ${(r.mean*100).toFixed(1)}%   최대 ${(r.max*100).toFixed(1)}%${r.maxPair ? " ("+r.maxPair+")" : ""}`);
  if (r.shortest) console.log(`  최소 분량 ${r.shortest.id} ${r.shortest.text.length}자`);
  if (r.ok) { console.log("  ✅ 통과"); }
  else { console.log("  ❌ 막힘:"); r.reasons.forEach(x => console.log("     - " + x)); process.exit(1); }
}
