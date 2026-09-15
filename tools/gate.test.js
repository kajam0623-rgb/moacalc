/* gate.js 자체 검사. 프레임워크 없이 assert 로만. 실행: node tools/gate.test.js */
const assert = require("assert");
const { textOf, grams, jaccard, checkGroup } = require("./gate.js");

// 1) textOf: script/style/태그를 걷어내고 본문만 남긴다
{
  const html = `<html><head><style>.a{color:red}</style></head><body>
    <p>안녕하세요</p><script>var x=1;</script><div>반갑습니다</div></body></html>`;
  const t = textOf(html);
  assert.ok(t.includes("안녕하세요"), "본문이 남아야 한다");
  assert.ok(t.includes("반갑습니다"), "본문이 남아야 한다");
  assert.ok(!t.includes("var x"), "script 내용은 빠져야 한다");
  assert.ok(!t.includes("color:red"), "style 내용은 빠져야 한다");
}

// 2) jaccard: 같은 글은 1, 완전히 다른 글은 0에 가깝다
{
  const a = grams("가나다라마바사아자차카타파하");
  assert.strictEqual(jaccard(a, a), 1, "자기 자신과는 1");
  const b = grams("ABCDEFGHIJKLMNOP");
  assert.ok(jaccard(a, b) < 0.05, "겹치지 않는 글은 0에 가깝다");
}

// 3) checkGroup: 임계값을 넘으면 ok:false 와 이유를 돌려준다
{
  const same = "같은 문장이 반복되는 아주 긴 본문입니다. ".repeat(80);
  const docs = [
    { id: "a", text: same },
    { id: "b", text: same },
  ];
  const r = checkGroup(docs, { maxMean: 0.75, maxMax: 0.85, minChars: 2000 });
  assert.strictEqual(r.ok, false, "똑같은 문서 둘은 중복으로 잡혀야 한다");
  assert.ok(/유사도/.test(r.reasons.join(" ")), "이유에 유사도가 나와야 한다");
}

// 4) checkGroup: 짧은 본문은 분량 미달로 잡는다
{
  const docs = [
    { id: "a", text: "짧다" },
    { id: "b", text: "이것도 짧다" },
  ];
  const r = checkGroup(docs, { maxMean: 0.75, maxMax: 0.85, minChars: 2000 });
  assert.strictEqual(r.ok, false, "짧은 본문은 막아야 한다");
  assert.ok(/분량/.test(r.reasons.join(" ")), "이유에 분량이 나와야 한다");
}

// 5) checkGroup: 충분히 다르고 충분히 길면 통과
{
  const mk = seed => (seed + " 서로 다른 내용을 담은 문단입니다. ").repeat(60) +
    seed.repeat(400);
  const docs = [
    { id: "a", text: mk("가나다") },
    { id: "b", text: mk("ABCDEF") },
    { id: "c", text: mk("１２３４") },
  ];
  const r = checkGroup(docs, { maxMean: 0.75, maxMax: 0.85, minChars: 2000 });
  assert.strictEqual(r.ok, true, "통과해야 한다: " + r.reasons.join(" | "));
}

console.log("✅ gate.test.js 전부 통과");
