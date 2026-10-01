/* 띠 궁합 — 지지 관계표(순수 계산)와 페이지 원고. build_site.js 와 verify.js 가 같은 표를 쓴다.
   관계표는 지지의 합·충·원진·형·해·파 일람(여러 명리 자료를 교차 확인, 2026-10-01)을 그대로 옮긴 것이다.
   띠 순서는 content_zodiac.js 와 같다: 자축인묘진사오미신유술해 = 쥐 소 호랑이 토끼 용 뱀 말 양 원숭이 닭 개 돼지.
   원고(TEXT)는 tools/tti-gunghap/merge_tti.js 가 content_ttigunghap_text.js 로 합쳐 둔다. 없으면 빈 칸으로 돌아간다. */
const ZODIAC = require("./content_zodiac.js");
const KO = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const HAN = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const JI = ZODIAC.map((z, i) => ({ i, en: z.en, name: z.ko + "띠", ko: KO[i], han: HAN[i], ji: KO[i] + "(" + HAN[i] + ")", ele: z.ele })); // ji 는 "자(子)" 꼴(띠 소개 페이지와 같다)
const jj = (...xs) => xs.map(i => KO[i]).join("") + "(" + xs.map(i => HAN[i]).join("") + ")";

// [띠 번호들, 이름, 오행]
const SAMHAP = [[[8, 0, 4], "신자진(申子辰) 삼합", "수"], [[11, 3, 7], "해묘미(亥卯未) 삼합", "목"], [[2, 6, 10], "인오술(寅午戌) 삼합", "화"], [[5, 9, 1], "사유축(巳酉丑) 삼합", "금"]];
const YUKHAP = [[0, 1, "토"], [2, 11, "목"], [3, 10, "화"], [4, 9, "금"], [5, 8, "수"], [6, 7, "화"]]; // 자축·인해·묘술·진유·사신·오미 — 합쳐서 되는 오행
const CHUNG = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];                                  // 자오·축미·인신·묘유·진술·사해
const WONJIN = [[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]];                                 // 자미·축오·인유·묘신·진해·사술
const HYUNG = [[0, 3, "자묘(子卯) 상형"], [2, 5, "인사신(寅巳申) 삼형"], [5, 8, "인사신(寅巳申) 삼형"], [2, 8, "인사신(寅巳申) 삼형"],
  [1, 10, "축술미(丑戌未) 삼형"], [10, 7, "축술미(丑戌未) 삼형"], [1, 7, "축술미(丑戌未) 삼형"]];     // 형 — 같은 띠끼리의 자형(진·오·유·해)은 JAHYUNG
const JAHYUNG = [4, 6, 9, 11];
const HAE = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];                                    // 육해: 자미·축오·인사·묘진·신해·유술
const PA = [[0, 9], [1, 4], [2, 11], [3, 6], [5, 8], [7, 10]];                                     // 육파: 자유·축진·인해·묘오·사신·미술

const TYPES = ["삼합", "육합", "충", "원진", "형", "같은 띠", "무난"];
const SYMBOL = { "삼합": "◎", "육합": "○", "충": "✕", "원진": "△", "형": "▲", "같은 띠": "＝", "무난": "·" };
const eq = (p, a, b) => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a);
const find = (list, a, b) => list.find(p => eq(p, a, b));

// 우선순위: 삼합 > 육합 > 충 > 원진 > 형 > (같은 띠) > 무난. 겹치는 형·해·파는 tags 로 붙인다
function rel(a, b) {
  const tags = [];
  if (a === b) return { type: "같은 띠", name: "같은 띠", ele: JI[a].ele, tags: JAHYUNG.includes(a) ? ["자형(自刑)"] : [] };
  const hy = find(HYUNG, a, b), ha = find(HAE, a, b), pa = find(PA, a, b);
  const sam = SAMHAP.find(s => s[0].includes(a) && s[0].includes(b)), yuk = find(YUKHAP, a, b), chu = find(CHUNG, a, b), won = find(WONJIN, a, b);
  let type = "무난", name = "특별한 합·충이 없는 사이", ele = "";
  if (sam) { type = "삼합"; name = sam[1]; ele = sam[2]; }
  else if (yuk) { type = "육합"; name = jj(...yuk.slice(0, 2)) + " 육합"; ele = yuk[2]; }
  else if (chu) { type = "충"; name = jj(...chu) + " 충"; }
  else if (won) { type = "원진"; name = jj(...won) + " 원진"; }
  else if (hy) { type = "형"; name = hy[2]; }
  if (hy && type !== "형") tags.push(hy[2]);
  if (ha) tags.push(jj(ha[0], ha[1]) + " 해(害)");
  if (pa) tags.push(jj(pa[0], pa[1]) + " 파(破)");
  return { type, name, ele, tags };
}
const keyOf = (a, b) => JI[Math.min(a, b)].en + "-" + JI[Math.max(a, b)].en;
const PAIR_LIST = []; for (let a = 0; a < 12; a++) for (let b = a; b < 12; b++) PAIR_LIST.push({ a, b, key: keyOf(a, b), ...rel(a, b) });
const years = i => [1948, 1960, 1972, 1984, 1996, 2008, 2020].map(y => y + i).filter(y => y <= 2026); // (연도 − 4) % 12 === 띠 번호. 아직 안 태어난 해는 뺀다

// 관계 종류별 쉬운 설명(모든 페이지가 같은 말) — 짝마다 다른 말은 원고(TEXT)에 있다
const EXPLAIN = {
  "삼합": "삼합은 세 띠가 모여 하나의 기운을 이루는 관계입니다. 둘만 만나도 같은 방향을 보기 쉬워 일과 생활에서 손발이 잘 맞는 사이로 봅니다.",
  "육합": "육합은 두 띠가 짝을 이뤄 서로를 끌어당기는 관계입니다. 편안하게 스며드는 사이로 보고, 열두 띠 가운데 여섯 쌍이 있습니다.",
  "충": "충은 열두 띠를 둥글게 놓았을 때 정반대에 마주 서는 관계입니다. 속도와 방식이 반대라 부딪히기 쉽지만, 서로에게 없는 것을 가진 사이로도 읽습니다.",
  "원진": "원진은 이유 없이 서운함이 쌓이기 쉽다고 전해지는 관계입니다. 큰 다툼보다 작은 오해가 쌓이는 모양이라, 마음을 말로 확인하는 습관이 도움이 됩니다.",
  "형": "형은 서로를 자극해 다듬는 관계로 전해집니다. 말투와 거리를 조절하면 오히려 서로를 단단하게 만드는 사이가 됩니다.",
  "같은 띠": "같은 띠는 기운과 성향이 닮은 사이입니다. 말이 잘 통하는 만큼, 같은 자리에서 같이 막히기 쉬운 점도 닮았습니다.",
  "무난": "특별한 합이나 충이 없는 사이입니다. 서로를 크게 끌어당기지도 밀어내지도 않아서, 두 사람의 성격과 노력이 관계의 모양을 만듭니다."
};

let TEXT = { pairs: {}, hubs: {} };
try { TEXT = require("./content_ttigunghap_text.js"); } catch (e) { /* 원고를 아직 안 합쳤으면 빈 칸 */ }

module.exports = { JI, KO, HAN, SAMHAP, YUKHAP, CHUNG, WONJIN, HYUNG, JAHYUNG, HAE, PA, TYPES, SYMBOL, EXPLAIN, rel, keyOf, PAIR_LIST, years, jj, TEXT };
