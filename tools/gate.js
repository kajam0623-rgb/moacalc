/* 새 페이지군이 배포돼도 되는지 판정한다.
   - 중복: 구글은 본문이 거의 같은 페이지를 하나만 색인하고 나머지를 버린다
   - 분량: 얇은 페이지는 색인돼도 순위가 안 나오고 사이트 전체 평가를 깎는다

   기준값 근거: 기존 일진 60 페이지를 전수(1770쌍)로 재서 공통 크롬 제거 후
   평균 12.3%, 최대 47.9%(경진↔경술)였다. 여기에 여유를 둬 평균 40% / 최대 70%로 잡았다.

   앞서 "평균 67.8%, 최대 73.2%"라는 기준이 돌던 적이 있는데 그건 틀린 값이다.
   60개 중 8개만 표본으로 잰 수치였고 최악 쌍(경진·경술)이 그 표본에 없었다.
   전수로 크롬 포함해 재면 최대가 84.8%다. 표본으로 기준값을 잡지 말 것. */
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
   돌려주는 것: {ok, mean, max, maxPair, shortest, thinnest, chromeRatio, reasons[]} */
function checkGroup(docs, opts) {
  const reasons = [];
  const withG = docs.map(d => ({ ...d, g: grams(d.text) }));

  // 분량 판정은 전체 본문 기준으로 둔다 — 빈 페이지·렌더 실패를 잡는 방어선이라 크롬도 세야 한다
  const shortest = docs.reduce((a, d) => d.text.length < a.text.length ? d : a);
  if (shortest.text.length < opts.minChars) {
    reasons.push(`분량 미달: ${shortest.id} ${shortest.text.length}자 (기준 ${opts.minChars}자)`);
  }

  /* 공통 크롬 제거 후에 유사도를 잰다.
     사이트 전 페이지가 공유하는 네비·FAQ·푸터가 본문 3-gram의 76%를 차지해서, 그대로 재면
     내용이 전부 달라도 68% 아래로 안 내려가고 거의 같아도 85%를 겨우 넘는다 — 신호가 아니라
     잡음을 재게 된다. 그래서 "모든 문서에 다 들어 있는 3-gram = 보일러플레이트"로 보고 빼낸다.
     셀렉터를 하드코딩하지 않으므로 페이지군이 바뀌어도 자기 교정된다.
     문서가 2개뿐이면 교집합이 과하게 커져(둘만 겹쳐도 크롬 취급) 오히려 왜곡되므로 건너뛴다. */
  let common = new Set();
  if (withG.length >= 3) {
    common = new Set(withG[0].g);
    for (let i = 1; i < withG.length && common.size; i++)
      for (const x of common) if (!withG[i].g.has(x)) common.delete(x);
  }
  const uniq = withG.map(d => {
    const u = new Set();
    for (const x of d.g) if (!common.has(x)) u.add(x);
    return { ...d, u };
  });
  const avgG = withG.reduce((a, d) => a + d.g.size, 0) / withG.length;
  const chromeRatio = avgG ? common.size / avgG : 0;

  /* 고유 본문 글자 수: 공통 3-gram이 덮지 않는 문자 위치만 센다.
     판정에는 안 쓰고, 다음 페이지군을 설계할 때 "고유 원고를 얼마나 써야 하나"의 근거로 찍어준다. */
  const uniqueChars = s => {
    if (!common.size) return s.length;
    const hit = new Uint8Array(s.length);
    for (let i = 0; i <= s.length - 3; i++)
      if (common.has(s.slice(i, i + 3))) hit[i] = hit[i + 1] = hit[i + 2] = 1;
    let n = 0;
    for (let i = 0; i < s.length; i++) if (!hit[i]) n++;
    return n;
  };
  const thinnest = uniq.map(d => ({ ...d, uniqueChars: uniqueChars(d.text) }))
                       .reduce((a, d) => d.uniqueChars < a.uniqueChars ? d : a);

  // 중복 — 크롬 뺀 집합끼리 모든 쌍
  let sum = 0, n = 0, max = 0, maxPair = "";
  for (let i = 0; i < uniq.length; i++)
    for (let j = i + 1; j < uniq.length; j++) {
      const s = jaccard(uniq[i].u, uniq[j].u);
      sum += s; n++;
      if (s > max) { max = s; maxPair = `${uniq[i].id} ↔ ${uniq[j].id}`; }
    }
  const mean = n ? sum / n : 0;
  if (mean > opts.maxMean) reasons.push(`평균 유사도 ${(mean*100).toFixed(1)}% > 기준 ${(opts.maxMean*100)}%`);
  if (max > opts.maxMax)  reasons.push(`최대 유사도 ${(max*100).toFixed(1)}% (${maxPair}) > 기준 ${(opts.maxMax*100)}%`);

  return { ok: reasons.length === 0, mean, max, maxPair, shortest, thinnest, chromeRatio, reasons };
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
  const r = checkFiles(path.join(__dirname, "..", "site"), prefix, { maxMean: 0.40, maxMax: 0.70, minChars });
  console.log(`${prefix}*  ${r.count || 0}개`);
  console.log(`  고유도   평균 ${(r.mean*100).toFixed(1)}%   최대 ${(r.max*100).toFixed(1)}%${r.maxPair ? " ("+r.maxPair+")" : ""}`);
  if (r.thinnest) console.log(`  크롬비중 ${(r.chromeRatio*100).toFixed(1)}%   고유 본문 최소 ${r.thinnest.id} ${r.thinnest.uniqueChars}자 / 전체 ${r.thinnest.text.length}자`);
  if (r.ok) { console.log("  ✅ 통과"); }
  else { console.log("  ❌ 막힘:"); r.reasons.forEach(x => console.log("     - " + x)); process.exit(1); }
}
