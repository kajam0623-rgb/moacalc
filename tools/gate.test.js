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

// 6) checkGroup: 전 페이지 공통 크롬은 빼고 잰다 (문서 3개 이상일 때)
{
  const chrome = "동네보살 실수령액 계산기 퇴직금 계산기 대출 이자 계산기 글자수 세기 개인정보처리방침 이용약관 오늘의 운세 별자리 운세 띠별 운세 사주팔자 만세력 궁합 보기 타로 카드 ".repeat(25);
  const mk = seed => chrome + (seed + " 고유한 본문 문단입니다. ").repeat(30) + seed.repeat(200);
  const docs = [
    { id: "a", text: mk("가나다") },
    { id: "b", text: mk("ABCDEF") },
    { id: "c", text: mk("１２３４") },
  ];
  // 크롬을 안 빼면 본문이 전부 달라도 유사도가 높게 나온다 — 이 테스트가 실제로 뭔가를 막고 있다는 증거
  assert.ok(jaccard(grams(docs[0].text), grams(docs[1].text)) > 0.7, "크롬 포함 원본은 유사도가 높아야 한다");

  const r = checkGroup(docs, { maxMean: 0.40, maxMax: 0.70, minChars: 2000 });
  assert.strictEqual(r.ok, true, "크롬을 빼면 통과해야 한다: " + r.reasons.join(" | "));
  assert.ok(r.chromeRatio > 0.5, "크롬 비중이 잡혀야 한다: " + r.chromeRatio);
  assert.ok(r.thinnest.uniqueChars < docs[0].text.length, "고유 본문은 전체보다 짧아야 한다");
}

// 7) checkGroup: 문서가 2개면 크롬 제거를 건너뛴다 (교집합이 과해져 왜곡되므로)
{
  const chrome = "공통 푸터 문구가 아주 길게 들어갑니다. ".repeat(60);
  const docs = [
    { id: "a", text: chrome + "가나다".repeat(300) },
    { id: "b", text: chrome + "ABCDEF".repeat(300) },
  ];
  const r = checkGroup(docs, { maxMean: 0.40, maxMax: 0.70, minChars: 2000 });
  assert.strictEqual(r.chromeRatio, 0, "2개짜리는 크롬을 빼지 않는다");
}

console.log("✅ gate.test.js 전부 통과");
