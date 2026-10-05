/* 이름궁합 공유 링크의 미리보기 글(카톡·문자 등이 링크를 열어 읽는 제목·설명).
   점수는 도구와 같은 함수(nm_core.js = hub.html 의 NM 블록)로 낸다. 한글만 받고, 아무 글이나 제목에 넣지 않는다.
   순수 함수 — verify.js 가 이 파일을 읽어 실행해 본다 */
import { nmCalc, nmBand } from "./nm_core.js";

const NAME = /^[가-힣]{1,10}$/;
const ga = w => ((w.charCodeAt(w.length - 1) - 0xAC00) % 28 ? "이" : "가");

// a 만 있으면 초대(보낸 사람 이름), a·b 가 다 있으면 결과. 못 쓰는 값이면 null(원래 페이지 그대로)
export function ogName(a, b) {
  if (!NAME.test(a)) return null;
  if (!b) return { title: `${a}${ga(a)} 이름궁합을 보냈어요`, desc: "내 이름만 넣으면 둘의 궁합이 바로 나와요. 이름 글자의 획수를 번갈아 더하는 전통 놀이 — 동네보살" };
  if (!NAME.test(b)) return null;
  const r = nmCalc(a, b);
  if (!r) return null;
  const band = nmBand(r.score);
  return { title: `${a} ♥ ${b} 이름궁합 ${r.score}점 · ${band.type}`, desc: `${band.msg} 내 이름으로도 해 보세요 — 동네보살` };
}

// 궁합 초대 링크(gunghap.html?i=)의 미리보기 글. data 는 /api/invite 가 저장한 {p,g,n}. 보낸 사람 이름만 쓰고 사주 글자는 싣지 않는다
const NICK = /^[가-힣A-Za-z0-9 ]{1,10}$/;
export function ogInvite(data) {
  if (!data || typeof data !== "object") return null;
  const n = typeof data.n === "string" && NICK.test(data.n.trim()) ? data.n.trim() : "";
  return { title: `${n ? n + "님이" : "친구가"} 사주 궁합 보자고 보냈어요`, desc: "내 생일만 넣으면 우리 둘의 궁합 점수(끌림·안정·소통·생활)가 바로 나와요. 생년월일은 서버로 가지 않아요." };
}
