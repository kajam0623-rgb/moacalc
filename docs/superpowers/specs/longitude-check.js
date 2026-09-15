/* 진태양시 -30분 고정 보정이 지역별로 얼마나 어긋나는지 실제로 계산한다.
   스펙에 "-4 ~ +8분", "약 5%"라고 썼는데 암산이었다. 숫자를 만든다. */

// 한국 표준시 자오선
const STD = 135.0;
// 우리가 쓰는 고정 보정
const FIXED_MIN = -30;
// 그 보정이 암묵적으로 가정하는 경도
const IMPLIED_LON = STD + FIXED_MIN / 4;   // 1도 = 4분

console.log("고정 -30분이 가정하는 경도: " + IMPLIED_LON.toFixed(2) + "°E\n");

// 시청/시 중심 좌표 (위키백과 등에 실린 통용값)
const CITIES = [
  ["백령도(최서단 유인도)", 124.71, null],
  ["인천",   126.705, 297],
  ["서울",   126.978, 939],
  ["수원",   127.029, 122],
  ["광주",   126.852, 141],
  ["대전",   127.385, 145],
  ["전주",   127.148,  64],
  ["대구",   128.601, 236],
  ["부산",   129.075, 329],
  ["울산",   129.311, 110],
  ["포항",   129.365,  49],
  ["강릉",   128.876,  21],
  ["울릉도", 130.906, null],
];

console.log("지역".padEnd(22) + "경도".padEnd(10) + "정확한 보정".padEnd(12) + "-30분 대비".padEnd(12) + "시주 어긋날 확률");
let wSum = 0, wPop = 0;
for (const [name, lon, pop] of CITIES) {
  const exact = (lon - STD) * 4;          // 분, 음수
  const delta = exact - FIXED_MIN;        // -30분 대비 차이. 음수면 더 빼야 함
  const pct = Math.abs(delta) / 120 * 100; // 시(時)는 120분 단위
  if (pop) { wSum += Math.abs(delta) * pop; wPop += pop; }
  console.log(
    name.padEnd(22) +
    (lon.toFixed(3) + "°E").padEnd(10) +
    (exact.toFixed(1) + "분").padEnd(12) +
    ((delta >= 0 ? "+" : "") + delta.toFixed(1) + "분").padEnd(12) +
    pct.toFixed(1) + "%" + (pop ? "   (인구 " + pop + "만)" : "")
  );
}
const wAvg = wSum / wPop;
console.log("\n인구 가중 평균 |차이| : " + wAvg.toFixed(2) + "분");
console.log("인구 가중 평균 어긋날 확률: " + (wAvg / 120 * 100).toFixed(1) + "%");

// 본토 범위 (섬 제외)
const main = CITIES.filter(c => c[2] !== null).map(c => (c[1] - STD) * 4 - FIXED_MIN);
console.log("\n본토 주요 도시 범위: " + Math.min(...main).toFixed(1) + "분 ~ +" + Math.max(...main).toFixed(1) + "분");
