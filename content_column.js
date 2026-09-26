/* 보살 칼럼 — 사주·운세를 볼 때 실제로 헷갈리는 것들을 한 편씩 푸는 글.
   애드센스 "가치가 별로 없는 콘텐츠" 반려(2026-09) 대응 5단계. 틀로 찍어 내지 않고 편마다 따로 쓴다.
   원고는 columns/*.js 에 한 편씩 둔다(여러 사람이 동시에 써도 부딪히지 않게). order 순으로 정렬한다.

   한 편의 모양:
   { order, en, title, crumb, desc, lead, tool, related:[도구 id 4개], tags:[], date:"YYYY-MM-DD",
     sections:[["소제목", `문단\n문단`], ...],   // 문단은 줄바꿈으로 나눈다. <b>, <a href="x.html"> 허용
     faq:[["질문","답"], ...], sources:[{t, org, url}] (선택) }
   문체는 존댓말(SEO 원고). 보살 말투는 도구 풀이 안에만 쓴다. */
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "columns");
const REQ = ["order", "en", "title", "crumb", "desc", "lead", "tool", "related", "tags", "date", "sections", "faq"];

const list = fs.existsSync(DIR)
  ? fs.readdirSync(DIR).filter(f => f.endsWith(".js")).map(f => {
      const c = require(path.join(DIR, f));
      for (const k of REQ) if (c[k] === undefined) throw new Error(`칼럼 ${f}: ${k} 없음`);
      if (`${c.en}.js` !== f) throw new Error(`칼럼 ${f}: 파일 이름과 en(${c.en})이 다름`);
      return c;
    })
  : [];
list.sort((a, b) => a.order - b.order);
const seen = new Set();
for (const c of list) { if (seen.has(c.en)) throw new Error("칼럼 en 중복: " + c.en); seen.add(c.en); }
module.exports = list;
