/* 음력 생일 입력 — 홈·SEO 페이지의 숫자 8자리 생일칸(.sjw-row, #hb)에 '음력 생일이에요' 체크를 붙인다.
   체크된 채 버튼을 누르거나 Enter 를 치면, 각 위젯 코드가 값을 읽기 전에(캡처 단계) 음력→양력으로 바꿔 칸에 넣는다.
   위젯 계산 코드는 그대로 둔다. 변환은 vendor-lunar.js(KASI 기준, 체크할 때 한 번 받음). build_site.js 가 site/lunar-in.js 로 복사 */
(function () {
  function lib(cb) {
    if (window.KoreanLunarCalendar) return cb && cb();
    var s = document.getElementById("vendor-lunar");
    if (!s) { s = document.createElement("script"); s.id = "vendor-lunar"; s.src = "vendor-lunar.js"; document.head.appendChild(s); }
    if (cb) s.addEventListener("load", cb);
  }
  var boxes = [];
  function add(inp) {
    if (inp.dataset.lunar) return; inp.dataset.lunar = "1";
    var row = inp.closest(".sjw-row,.today-row"), lab = document.querySelector('label[for="' + inp.id + '"]');
    var w = document.createElement("div"); w.className = "lnin";
    w.innerHTML = '<label><input type="checkbox" class="lnin-l"> 음력 생일이에요</label><label class="lnin-lp" hidden><input type="checkbox" class="lnin-p"> 윤달</label><p class="lnin-n" aria-live="polite"></p>';
    row.parentNode.insertBefore(w, row.nextSibling);
    var cl = w.querySelector(".lnin-l"), lp = w.querySelector(".lnin-lp"), n = w.querySelector(".lnin-n"), lab0 = lab ? lab.textContent : "";
    function mark() { lp.hidden = !cl.checked; if (lab) lab.textContent = cl.checked ? lab0.replace("(양력)", "(음력)") : lab0; if (cl.checked) lib(); }
    cl.addEventListener("change", function () { n.textContent = ""; mark(); });
    boxes.push({ inp: inp, row: row, cl: cl, lp: w.querySelector(".lnin-p"), n: n, mark: mark });
  }
  // 음력이면 칸 값을 양력 8자리로 바꾸고 체크를 푼다. 바꿀 수 없으면 false(위젯 실행을 막는다)
  function convert(b) {
    if (!b.cl.checked) return true;
    var v = (b.inp.value || "").replace(/\D/g, "");
    if (v.length !== 8) return true; // 형식 오류 안내는 위젯이 한다
    if (!window.KoreanLunarCalendar) { b.n.textContent = "음력 달력을 불러오는 중이에요. 잠시 뒤 다시 눌러 주세요."; lib(); return false; }
    var y = +v.slice(0, 4), m = +v.slice(4, 6), d = +v.slice(6, 8), leap = b.lp.checked, cal = new window.KoreanLunarCalendar();
    if (!cal.setLunarDate(y, m, d, leap)) { b.n.textContent = y + "년에는 음력 " + m + "월" + (leap ? "(윤달)" : "") + " " + d + "일이 없어요. 날짜나 윤달 표시를 다시 보세요."; return false; }
    var s = cal.getSolarCalendar(), p = function (x) { return String(x).padStart(2, "0"); };
    b.inp.value = b.inp.maxLength === 10 ? s.year + "." + p(s.month) + "." + p(s.day) : "" + s.year + p(s.month) + p(s.day);
    b.cl.checked = false; b.lp.checked = false; b.mark();
    b.n.textContent = "음력 " + y + "년 " + m + "월" + (leap ? "(윤달)" : "") + " " + d + "일 = 양력 " + s.year + "년 " + s.month + "월 " + s.day + "일로 바꿔서 봤어요.";
    return true;
  }
  function find(t) { for (var i = 0; i < boxes.length; i++) { var b = boxes[i], c = b.row.closest(".sjw,.today") || b.row; if (c.contains(t)) return b; } }
  function stop(e) { e.preventDefault(); e.stopImmediatePropagation(); }
  document.addEventListener("click", function (e) { var t = e.target.closest && e.target.closest("button"); var b = t && find(t); if (b && t.closest(".sjw-row,.today-row") === b.row && !convert(b)) stop(e); }, true);
  document.addEventListener("keydown", function (e) { if (e.key !== "Enter" || e.target.tagName !== "INPUT") return; var b = find(e.target); if (b && !convert(b)) stop(e); }, true);
  function scan() {
    var L = document.querySelectorAll('#hb,.sjw-row input[maxlength="8"]');
    for (var i = 0; i < L.length; i++) { var lab = document.querySelector('label[for="' + L[i].id + '"]'); if (L[i].id === "hb" || (lab && /생년월일/.test(lab.textContent))) add(L[i]); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan); else scan();
})();
