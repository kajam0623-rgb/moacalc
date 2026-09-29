/* 명리학 배우기 — 16강 목차와 강의 원고.
   learn/NN-*.js 를 강 번호순으로 읽는다. 새로 쓰는 강의는 en(페이지 이름)이 있고 본문·표·FAQ 가 있다.
   기존 개념·칼럼 페이지를 쓰는 강의는 url 이 있고 그 페이지에 강 띠·실습·확인 문제가 끼워진다.
   본문의 {{연주}} 같은 자리표시자는 빌드가 SAMPLE(예시 인물)의 엔진 계산값으로 채운다.
   SAMPLE_EXPECT 는 채운 값이 기대와 같은지 빌드가 대조한다(엔진이 바뀌어 본문의 설명과 어긋나면 빌드가 멈춘다). */
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "learn");

const PARTS = [
  { no: 1, title: "1부 기초", sub: "사주가 무엇인지" },
  { no: 2, title: "2부 나를 읽기", sub: "일간에서 격국까지" },
  { no: 3, title: "3부 글자 사이의 관계", sub: "숨은 글자와 합·충, 운성, 신살" },
  { no: 4, title: "4부 시간의 흐름", sub: "대운과 세운, 그리고 종합" },
];
// 모든 새 강의가 따라가는 예시 인물. 신강(67%)에 정인격, 신살 셋이 붙어 1~16강을 한 사람으로 이어 배우기 좋다
const SAMPLE = { y: 1976, mo: 7, d: 27, h: 14, mi: 20, male: true };
const SAMPLE_EXPECT = {
  연주: "병진(丙辰)", 월주: "을미(乙未)", 일주: "경진(庚辰)", 시주: "계미(癸未)",
  일간이름: "경금(庚金)", 오행개수: "목 1 · 화 1 · 토 4 · 금 1 · 수 1", 신강약: "신강", 돕는비율: "67%",
  용신: "수(水)", 용신2: "목(木)", 격국: "정인격", 월지본기: "기(己)", 월지십성: "정인",
  신살목록: "천을귀인·화개살·괴강살", 대운방향: "순행", 대운시작: "4세", 첫대운: "병신(丙申)",
};

const REQ = ["no", "part", "short", "goal", "practice", "quiz"];
const REQ_NEW = ["en", "title", "crumb", "desc", "lead", "tags", "date", "related", "sections", "tables", "faq"];
const PRACTICE = ["seats", "elements", "stems", "terms", "daymaster", "tengod", "strength", "yongsin", "gyeok", "hidden", "relations", "unseong", "sinsal", "daeun", "seyun", "whole"];

const list = fs.readdirSync(DIR).filter(f => f.endsWith(".js")).map(f => {
  const c = require(path.join(DIR, f));
  for (const k of REQ) if (c[k] === undefined) throw new Error(`강의 ${f}: ${k} 없음`);
  if (!c.en === !c.url) throw new Error(`강의 ${f}: en(새 페이지)과 url(기존 페이지) 중 하나만 있어야 한다`);
  if (c.en) for (const k of REQ_NEW) if (c[k] === undefined) throw new Error(`강의 ${f}: ${k} 없음`);
  if (!PRACTICE.includes(c.practice)) throw new Error(`강의 ${f}: 알 수 없는 practice ${c.practice}`);
  if (!Array.isArray(c.quiz) || c.quiz.length !== 3) throw new Error(`강의 ${f}: 확인 문제는 3개`);
  c.quiz.forEach((q, i) => {
    if (!q.q || !Array.isArray(q.c) || q.c.length !== 4 || !(q.a >= 0 && q.a < 4) || !q.why) throw new Error(`강의 ${f}: 문제 ${i + 1} 형식 오류`);
    if (new Set(q.c).size !== 4) throw new Error(`강의 ${f}: 문제 ${i + 1} 선택지가 겹침`);
  });
  c.file = f;
  c.page = c.en ? c.en + ".html" : c.url;
  return c;
}).sort((a, b) => a.no - b.no);

if (list.length !== 16) throw new Error(`강의는 16개여야 한다(현재 ${list.length})`);
list.forEach((c, i) => { if (c.no !== i + 1) throw new Error(`강 번호가 이어지지 않는다: ${c.file}`); if (!PARTS.some(p => p.no === c.part)) throw new Error(`부 번호 오류: ${c.file}`); });
const seenPage = new Set();
for (const c of list) { if (seenPage.has(c.page)) throw new Error("강의 페이지 중복: " + c.page); seenPage.add(c.page); }
module.exports = { PARTS, SAMPLE, SAMPLE_EXPECT, LECTURES: list };
