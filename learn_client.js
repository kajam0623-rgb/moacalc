/* 명리학 배우기 — 실습·확인 문제·진도. core.js 의 엔진(sjPillars 등)을 그대로 쓰는 ES5 코드다(build_site.js 가 site/learn.js 로 낸다).
   생년월일·시각·성별은 저장하지 않는다. 저장하는 것은 마친 강 번호(dnbs_learn)뿐이다. */
(function () {
  var KEY = "dnbs_learn", N = 16;
  var PAGES = /*PAGES*/[];
  var ILGAN_META = /*ILGAN_META*/[];
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function E(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ───────── 진도 (마친 강 번호만 이 기기에)
  function getDone() { try { var a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a.filter(function (n) { return n >= 1 && n <= N; }) : []; } catch (e) { return []; } }
  function setDone(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { } }
  function mark(no, on) {
    var a = getDone(), i = a.indexOf(no);
    if (on && i < 0) a.push(no);
    if (!on && i >= 0) a.splice(i, 1);
    a.sort(function (x, y) { return x - y; }); setDone(a); paint();
  }
  function paint() {
    var d = getDone();
    $$(".ldot").forEach(function (e) { e.classList.toggle("on", d.indexOf(+e.getAttribute("data-no")) >= 0); });
    $$(".lcard").forEach(function (e) { e.classList.toggle("done", d.indexOf(+e.getAttribute("data-no")) >= 0); });
    var t = $("#lprogtxt");
    if (t) { t.textContent = d.length + " / " + N + "강 마쳤어요"; var b = $("#lprog .lprog-bar i"); if (b) b.style.width = Math.round(d.length * 100 / N) + "%"; }
    $$(".lmark").forEach(function (b) { var on = d.indexOf(+b.getAttribute("data-no")) >= 0; b.setAttribute("aria-pressed", on ? "true" : "false"); b.textContent = on ? "마쳤어요 ✓ (누르면 취소)" : "이 강 마쳤어요"; });
  }

  // ───────── 확인 문제
  function initQuiz() {
    var box = $("#lquiz"); if (!box) return;
    var no = +box.getAttribute("data-no"), qs = $$(".lq", box), answered = 0, right = 0;
    var sc = $(".lq-score", box);
    qs.forEach(function (q) {
      var a = +q.getAttribute("data-a");
      $$(".lq-b", q).forEach(function (b) {
        b.addEventListener("click", function () {
          if (q.getAttribute("data-done")) return;
          q.setAttribute("data-done", "1"); answered++;
          var c = +b.getAttribute("data-c");
          $$(".lq-b", q).forEach(function (x, j) { x.disabled = true; if (j === a) x.classList.add("ok"); });
          if (c === a) right++; else b.classList.add("no");
          var w = $(".lq-why", q); if (w) w.hidden = false;
          if (answered === qs.length) {
            sc.textContent = (right === qs.length ? "다 맞혔네! " : "") + right + " / " + qs.length + "개 맞혔어요. " + (right === qs.length ? "이 강은 마쳐도 좋습니다." : "풀이를 한 번 더 읽어 보세요.");
            if (right === qs.length) mark(no, true);
          }
        });
      });
    });
  }

  // ───────── 실습 재료
  var HAN = "木火土金水";
  function st(i) { return SJ_S[i] + "(" + SJ_SH[i] + ")"; }
  function br(i) { return SJ_B[i] + "(" + SJ_BH[i] + ")"; }
  function gan(i) { return SJ_S[i] + SJ_EL[SJ_ES[i]] + "(" + SJ_SH[i] + HAN.charAt(SJ_ES[i]) + ")"; } // 경금(庚金)
  function jo(w, pair) { // 앞 글자(괄호 안 한자는 뺀다)의 받침으로 조사를 고른다. pair 는 "무받침/받침" 순서다(hub 의 josa 와 같다)
    var k = String(w).replace(/\([^)]*\)/g, ""), c = k.charCodeAt(k.length - 1), p = pair.split("/"), jong = c >= 0xAC00 && c <= 0xD7A3 ? (c - 0xAC00) % 28 : 0;
    return jong && !(jong === 8 && p[0] === "로") ? p[1] : p[0];
  }
  function jp(w, pair) { return w + jo(w, pair); }
  function gz(x) { return SJ_S[x.s] + SJ_B[x.b] + "(" + SJ_SH[x.s] + SJ_BH[x.b] + ")"; }
  function elS(i) { return SJ_EL[SJ_ES[i]]; }
  function elB(i) { return SJ_EL[SJ_EB[i]]; }
  function yyS(i) { return i % 2 === 0 ? "양" : "음"; }
  function page(no) { return PAGES[no - 1] || "learn.html"; }
  function link(no, text) { return '<p class="lp-links"><a href="' + page(no) + '">' + E(text || (no + "강 다시 읽기")) + '</a></p>'; }
  function say(ok, right) { return '<p class="lp-say">' + (ok ? "잘 짚었네! " : "아깝네, 풀이를 보게. ") + right + '</p>'; }
  function tbl(rows) { return '<table>' + rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return (i === 0 ? '<th scope="row">' : '<td>') + c + (i === 0 ? '</th>' : '</td>'); }).join("") + '</tr>'; }).join("") + '</table>'; }
  function rng(seed) { var s = seed % 2147483647 || 1; return function () { s = (s * 48271) % 2147483647; return s / 2147483647; }; }
  function shuffle(arr, r) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function choose(correct, pool, r, n) { // 정답 하나와 오답 n-1개를 섞는다
    var rest = shuffle(pool.filter(function (x) { return x !== correct; }), r).slice(0, n - 1);
    var all = shuffle([correct].concat(rest), r); return { ch: all, a: all.indexOf(correct) };
  }
  function numChoices(ans, lo, hi) { // 숫자 정답 주변의 네 값(오름차순)
    var out = [ans], k = 1;
    while (out.length < 4 && k < 12) { if (ans - k >= lo && out.length < 4) out.push(ans - k); if (ans + k <= hi && out.length < 4) out.push(ans + k); k++; }
    out.sort(function (a, b) { return a - b; }); return out;
  }
  function seedOf(c) { return c.y * 372 + c.mo * 31 + c.d + (c.h == null ? 0 : c.h + 1); }
  function chartOf(f) {
    var a = f.d.split("-"), y = +a[0], mo = +a[1], d = +a[2], h = f.t === "" ? null : +f.t;
    var p = sjPillars(y, mo, d, h, h == null ? 0 : 30, true), ds = p.d.s;
    return { y: y, mo: mo, d: d, h: h, p: p, ds: ds, de: SJ_ES[ds], male: f.g !== "f", st: sjStrength(p) };
  }
  function cols(p) { return [["연", p.y], ["월", p.m], ["일", p.d]].concat(p.h ? [["시", p.h]] : []); }
  var TG10 = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"];
  var TERM12 = ["입춘", "경칩", "청명", "입하", "망종", "소서", "입추", "백로", "한로", "입동", "대설", "소한"];
  var REL_TEXT = ["나와 같은 오행", "내가 낳는 오행", "내가 이기는 오행", "나를 이기는 오행", "나를 낳는 오행"];
  function relIdx(de, oe) { return oe === de ? 0 : (de + 1) % 5 === oe ? 1 : (de + 2) % 5 === oe ? 2 : (oe + 2) % 5 === de ? 3 : 4; }
  function tenExplain(ds, other, label) { // 십성을 오행 관계와 음양으로 풀어 쓴다
    var de = SJ_ES[ds], oe = SJ_ES[other], k = relIdx(de, oe), same = ds % 2 === other % 2, name = sjTenGod(ds, other);
    return label + ' ' + jp(st(other), "는/은") + ' ' + jp(SJ_EL[oe], "라/이라") + ' 일간 ' + gan(ds) + '에게 <b>' + REL_TEXT[k] + '</b>이고, 음양은 ' + yyS(other) + '으로 일간(' + yyS(ds) + ')과 ' + (same ? '<b>같아서</b>' : '<b>달라서</b>') + ' <b>' + name + '</b>입니다.';
  }
  function bmain(b) { return SJ_BMAIN[b]; }
  function jjgText(b) {
    var l = SJ_JJG[b], nm = l.length === 2 ? ["여기", "정기"] : ["여기", "중기", "정기"];
    return l.map(function (x, i) { return nm[i] + " " + st(x[0]) + " " + x[1] + "일"; }).join(" · ");
  }
  function relPairs(p) { // 네 지지 사이의 충·육합·삼합
    var bs = [["연지", p.y.b], ["월지", p.m.b], ["일지", p.d.b]].concat(p.h ? [["시지", p.h.b]] : []), out = [], i, j;
    for (i = 0; i < bs.length; i++) for (j = i + 1; j < bs.length; j++) {
      var a = bs[i][1], b = bs[j][1], kind = a === b ? "같은 글자" : Math.abs(a - b) === 6 ? "충" : sjYukhap(a) === b ? "육합" : a % 4 === b % 4 ? "삼합(반합)" : "";
      out.push({ n1: bs[i][0], n2: bs[j][0], a: a, b: b, kind: kind });
    }
    return out;
  }
  function daeunRows(c, da) {
    var rows = [], i, kk, age;
    for (i = 1; i <= 8; i++) { kk = ((da.m60 + (da.fwd ? i : -i)) % 60 + 60) % 60; age = da.su + 10 * (i - 1); rows.push([age + "세~" + (age + 9) + "세", SJ_S[kk % 10] + SJ_B[kk % 12] + "(" + SJ_SH[kk % 10] + SJ_BH[kk % 12] + ")", sjTenGod(c.ds, kk % 10)]); }
    return rows;
  }
  function daeunOf(c) { return sjDaeunStart(c.p, c.male, sjJdKST(c.y, c.mo, c.d, c.h == null ? 12 : c.h, c.h == null ? 0 : 30)); }

  // ───────── 실습 정의: 강 번호 → {time, gender, run(c)} → {mat, q, hint, ch, a, reveal(ok)}
  var DEF = {};
  DEF[1] = { time: true, run: function (c) {
    var p = c.p;
    return { mat: '<b>내 사주표</b> — 위 글자는 하늘 글자, 아래 글자는 땅 글자입니다.' + sjGridHtml(p, "날 자리"),
      q: "이 표에서 '나 자신'을 뜻하는 글자는 어느 자리의 위 글자일까요?", ch: ["시각 자리", "날 자리", "달 자리", "해 자리"], a: 1,
      reveal: function (ok) {
        return say(ok, "정답은 <b>날 자리</b>의 위 글자입니다.") +
          '<p>내 일주는 <b>' + gz(p.d) + '</b>이고 일간(나를 뜻하는 글자)은 <b>' + st(p.d.s) + '</b>입니다. 연주 ' + gz(p.y) + ', 월주 ' + gz(p.m) + ', 일주 ' + gz(p.d) + (p.h ? ', 시주 ' + gz(p.h) : '') + ' 순서로 네 기둥을 읽습니다.</p>' +
          '<p>전통적으로 해 자리는 조상과 뿌리, 달 자리는 부모와 사회, 날 자리는 나와 배우자, 시각 자리는 자녀와 말년을 맡는다고 봅니다.' + (p.h ? '' : ' 태어난 시각을 넣지 않아 시각 자리는 비어 있습니다.') + '</p>' + link(1);
      } };
  } };
  DEF[2] = { time: true, run: function (c) {
    var p = c.p, cnt = [0, 0, 0, 0, 0], by = [[], [], [], [], []], n = 0;
    cols(p).forEach(function (x) { cnt[SJ_ES[x[1].s]]++; by[SJ_ES[x[1].s]].push(x[0] + "간 " + SJ_S[x[1].s]); cnt[SJ_EB[x[1].b]]++; by[SJ_EB[x[1].b]].push(x[0] + "지 " + SJ_B[x[1].b]); n += 2; });
    var ans = cnt[c.de], nums = numChoices(ans, 0, n);
    return { mat: '<b>내 ' + (p.h ? '여덟' : '여섯') + ' 글자의 오행</b>(색이 오행입니다)' + sjGridHtml(p, "날 자리") + '<div style="margin-top:6px">내 일간 ' + jp(st(c.ds), "는/은") + ' <b>' + SJ_EL[c.de] + '</b>입니다.</div>',
      q: "일간 자신을 포함해 나와 같은 오행(" + SJ_EL[c.de] + ")의 글자는 모두 몇 개일까요?", hint: p.h ? "여덟 글자를 모두 셉니다." : "시각을 넣지 않아 여섯 글자를 셉니다.",
      ch: nums.map(function (x) { return x + "개"; }), a: nums.indexOf(ans),
      reveal: function (ok) {
        var miss = SJ_EL.filter(function (e, i) { return cnt[i] === 0; });
        return say(ok, "정답은 <b>" + ans + "개</b>입니다.") + tbl(SJ_EL.map(function (e, i) { return [e + "(" + HAN.charAt(i) + ")", cnt[i] + "개", by[i].join(", ") || "—"]; })) +
          '<p>' + (miss.length ? '<b>' + miss.join("·") + '</b> 기운은 하나도 없습니다. 비었다고 결함은 아니고 덜 쓰는 영역으로 읽습니다.' : '다섯 오행이 모두 갖춰져 있습니다.') + '</p>' + link(2);
      } };
  } };
  DEF[3] = { time: false, run: function (c) {
    return { mat: '<b>내 일간</b> ' + st(c.ds) + ' — ' + SJ_EL[c.de] + '(' + HAN.charAt(c.de) + ') 기운의 글자입니다.',
      q: "내 일간 " + jp(st(c.ds), "는/은") + " 양간일까요, 음간일까요?", hint: "열 천간을 갑부터 세면 양과 음이 번갈아 나옵니다.", ch: ["양간", "음간"], a: c.ds % 2,
      reveal: function (ok) {
        return say(ok, "정답은 <b>" + yyS(c.ds) + "간</b>입니다.") + tbl([["양간", "갑(甲) · 병(丙) · 무(戊) · 경(庚) · 임(壬)"], ["음간", "을(乙) · 정(丁) · 기(己) · 신(辛) · 계(癸)"]]) +
          '<p>' + jp(st(c.ds), "는/은") + ' 열 천간 가운데 ' + (c.ds + 1) + '번째 글자로 ' + (c.ds % 2 === 0 ? '홀수 번째라 양' : '짝수 번째라 음') + '입니다. 십성을 정할 때 이 음양을 씁니다.</p>' + link(3);
      } };
  } };
  DEF[4] = { time: true, run: function (c) {
    var jd = sjJdKST(c.y, c.mo, c.d, c.h == null ? 12 : c.h, c.h == null ? 0 : 30), mt = sjMonthTerms(jd), ip = sjIpchun(c.y), ch = choose(mt.prevName, TERM12, rng(seedOf(c)), 4);
    return { mat: '<b>월을 가르는 12절(節)의 대략적인 날짜</b><br>입춘 2/4 · 경칩 3/6 · 청명 4/5 · 입하 5/5 · 망종 6/6 · 소서 7/7 · 입추 8/7 · 백로 9/8 · 한로 10/8 · 입동 11/7 · 대설 12/7 · 소한 1/5',
      q: c.y + "년 " + c.mo + "월 " + c.d + "일생의 월주는 어느 절기에서 시작된 달일까요?", hint: "생일 바로 앞에 있는 절(節)을 찾으세요. 절기 시각은 해마다 조금씩 다릅니다.", ch: ch.ch, a: ch.a,
      reveal: function (ok) {
        return say(ok, "정답은 <b>" + mt.prevName + "</b>입니다.") + '<p>내 월주는 <b>' + gz(c.p.m) + '</b>이고 ' + mt.prevName + '(' + sjKst(mt.prev) + ')부터 ' + mt.nextName + '(' + sjKst(mt.next) + ') 전까지가 이 달입니다.</p>' +
          '<p>연주는 입춘에 바뀝니다. ' + c.y + '년 입춘은 ' + sjKst(ip) + '이고 태어난 때가 그 ' + (jd < ip ? '전이라 전해' : '뒤라 그해') + '의 간지인 <b>' + gz(c.p.y) + '</b>' + jo(gz(c.p.y), "를/을") + ' 씁니다.</p>' + link(4);
      } };
  } };
  DEF[5] = { time: false, run: function (c) {
    var labels = SJ_S.map(function (s, i) { return yyS(i) + SJ_EL[SJ_ES[i]] + "(" + s + ")"; }), mine = labels[c.ds], ch = choose(mine, labels, rng(seedOf(c)), 4), m = ILGAN_META[c.ds] || {};
    return { mat: '<b>내 태어난 날의 하늘 글자</b>는 ' + st(c.ds) + '입니다. 일주는 ' + gz(c.p.d) + '입니다.', q: "내 일간의 음양과 오행은 무엇일까요?", hint: "갑·을은 목, 병·정은 화, 무·기는 토, 경·신은 금, 임·계는 수입니다.", ch: ch.ch, a: ch.a,
      reveal: function (ok) {
        return say(ok, "정답은 <b>" + mine + "</b>입니다.") + '<p>내 일간은 <b>' + SJ_S[c.ds] + SJ_EL[c.de] + '(' + SJ_SH[c.ds] + HAN.charAt(c.de) + ')</b>이고 ' + yyS(c.ds) + '의 ' + SJ_EL[c.de] + '입니다.' + (m.m ? ' 옛 명리학은 이 일간을 <b>' + E(m.m) + '</b>에 견줍니다.' : '') + '</p>' +
          '<p class="lp-links"><a href="ilgan-' + (m.en || "") + '.html">' + SJ_S[c.ds] + SJ_EL[c.de] + ' 일간 페이지 읽기</a></p>' + link(5);
      } };
  } };
  DEF[6] = { time: false, run: function (c) {
    var p = c.p, ans = sjTenGod(c.ds, p.m.s), ch = choose(ans, TG10, rng(seedOf(c)), 4);
    return { mat: '<b>내 일간</b> ' + st(c.ds) + ' · <b>월간</b>(태어난 달의 하늘 글자) ' + st(p.m.s) + '<br><span style="font-size:13px;color:var(--muted)">규칙: ① 오행 관계 — 같음(비견·겁재), 내가 낳음(식신·상관), 내가 이김(편재·정재), 나를 이김(편관·정관), 나를 낳음(편인·정인) ② 음양이 같으면 앞의 이름, 다르면 뒤의 이름</span>',
      q: "내 일간에게 월간 " + jp(st(p.m.s), "는/은") + " 어떤 십성일까요?", ch: ch.ch, a: ch.a,
      reveal: function (ok) {
        return say(ok, "정답은 <b>" + ans + "</b>입니다.") + '<p>' + tenExplain(c.ds, p.m.s, "월간") + '</p>' + '<p>같은 방법으로 연간 ' + jp(st(p.y.s), "는/은") + ' <b>' + sjTenGod(c.ds, p.y.s) + '</b>' + (p.h ? ', 시간 ' + jp(st(p.h.s), "는/은") + ' <b>' + sjTenGod(c.ds, p.h.s) + '</b>' : '') + '입니다.</p>' + link(6);
      } };
  } };
  DEF[7] = { time: true, run: function (c) {
    var p = c.p, de = c.de, pos = [["월지", SJ_EB[p.m.b], br(p.m.b), 3], ["일지", SJ_EB[p.d.b], br(p.d.b), 2], ["월간", SJ_ES[p.m.s], st(p.m.s), 1.5], ["연간", SJ_ES[p.y.s], st(p.y.s), 1], ["연지", SJ_EB[p.y.b], br(p.y.b), 1]];
    if (p.h) pos.push(["시간", SJ_ES[p.h.s], st(p.h.s), 1], ["시지", SJ_EB[p.h.b], br(p.h.b), 1]);
    var sup = 0, dr = 0, rows = pos.map(function (x) { var help = x[1] === de || (x[1] + 1) % 5 === de; if (help) sup += x[3]; else dr += x[3]; return [x[0] + " " + x[2], SJ_EL[x[1]], help ? "돕는 기운 +" + x[3] : "덜어내는 기운 " + x[3]]; });
    var ratio = sup / (sup + dr), ans = ratio >= 0.7 ? 3 : ratio >= 0.5 ? 2 : ratio >= 0.3 ? 1 : 0;
    return { mat: '<b>내 일간</b> ' + gan(c.ds) + ' — 돕는 기운은 <b>' + SJ_EL[de] + '</b>(같은 오행)' + jo(SJ_EL[de], "와/과") + ' <b>' + SJ_EL[(de + 4) % 5] + '</b>(나를 낳는 오행)입니다.<br><span style="font-size:13px;color:var(--muted)">자리별 점수: ' + pos.map(function (x) { return x[0] + " " + x[2] + " " + x[3] + "점"; }).join(" · ") + '</span>',
      q: "돕는 기운의 점수는 전체의 어느 구간일까요?", hint: "각 글자의 오행이 돕는 기운이면 돕는 점수에, 아니면 덜어내는 점수에 더합니다.", ch: ["30% 미만", "30% 이상 50% 미만", "50% 이상 70% 미만", "70% 이상"], a: ans,
      reveal: function (ok) {
        return say(ok, "정답은 <b>" + ["30% 미만", "30% 이상 50% 미만", "50% 이상 70% 미만", "70% 이상"][ans] + "</b>입니다.") + tbl(rows) +
          '<p>돕는 점수 <b>' + sup + '</b>점, 덜어내는 점수 <b>' + dr + '</b>점이라 돕는 비율은 ' + sup + ' ÷ ' + (sup + dr) + ' = 약 <b>' + Math.round(ratio * 100) + '%</b>이고 <b>' + (c.st.strong ? '신강' : '신약') + '</b>입니다.</p>' + link(7);
      } };
  } };
  DEF[8] = { time: true, run: function (c) {
    var s = c.st, ch = choose(SJ_EL[s.yong], SJ_EL, rng(seedOf(c)), 5), y = SJ_YONG[SJ_EL[s.yong]] || {};
    return { mat: '<b>내 일간</b> ' + gan(c.ds) + ' · 돕는 비율 <b>' + Math.round(s.ratio * 100) + '%</b> → <b>' + (s.strong ? '신강' : '신약') + '</b><br><span style="font-size:13px;color:var(--muted)">동네보살의 억부용신: 신강이면 일간이 낳는 기운(식상)을 먼저, 신약이면 일간을 낳는 기운(인성)을 먼저 씁니다. 교재에 따라 재성·관성·비겁이나 계절(조후)을 먼저 보기도 합니다.</span>',
      q: "동네보살 계산으로 이 사주의 억부용신은 어떤 오행일까요?", ch: ch.ch, a: ch.a,
      reveal: function (ok) {
        return say(ok, "정답은 <b>" + SJ_EL[s.yong] + "</b>입니다.") + '<p>' + (s.strong ? '신강이라 일간이 낳는 오행' : '신약이라 일간을 낳는 오행') + '인 <b>' + SJ_EL[s.yong] + '(' + HAN.charAt(s.yong) + ')</b>' + jo(SJ_EL[s.yong], "가/이") + ' 용신이고, 보조로 <b>' + SJ_EL[s.yong2] + '</b>' + jo(SJ_EL[s.yong2], "를/을") + ' 씁니다.</p>' +
          (y.color ? '<p>동네보살은 용신 ' + SJ_EL[s.yong] + '에 어울리는 색 <b>' + E(y.color) + '</b>, 방향 <b>' + E(y.dir) + '</b>, 계절 <b>' + E(y.season) + '</b>' + jo(y.season, "를/을") + ' 참고로 제시합니다. 지키면 결과가 보장되는 규칙은 아닙니다.</p>' : '') + link(8);
      } };
  } };
  DEF[9] = { time: false, run: function (c) {
    var p = c.p, b = p.m.b, bm = bmain(b), tg = sjTenGod(c.ds, bm), name = SJ_GYEOK[tg], all = TG10.map(function (t) { return SJ_GYEOK[t]; }), ch = choose(name, all, rng(seedOf(c)), 4);
    return { mat: '<b>내 월지</b> ' + br(b) + ' · <b>일간</b> ' + st(c.ds) + '<br><span style="font-size:13px;color:var(--muted)">지지별 본기(정기): ' + SJ_B.map(function (z, i) { return z + "→" + SJ_S[bmain(i)]; }).join(" · ") + '</span>',
      q: "내 격국은 무엇일까요?", hint: "월지의 본기를 찾고, 그 글자가 일간에게 어떤 십성인지 본 뒤 이름에 '격'을 붙입니다(동네보살은 비견이면 건록격, 겁재이면 양인격이라고 부릅니다).", ch: ch.ch, a: ch.a,
      reveal: function (ok) {
        return say(ok, "정답은 <b>" + name + "</b>입니다.") + '<p>① 월지 ' + br(b) + ' ② 월지의 본기 ' + st(bm) + ' ③ ' + tenExplain(c.ds, bm, "본기") + ' ④ 이름에 격을 붙여 <b>' + name + '</b>입니다.</p>' +
          '<p>동네보살 사주 풀이는 ' + name + '을 이렇게 읽습니다. ' + E(SJ_GYEOK_DESC[name] || "") + '</p>' + link(9);
      } };
  } };
  DEF[10] = { time: true, run: function (c) {
    var p = c.p, b = p.d.b, seqOf = function (z) { return SJ_JJG[z].map(function (x) { return SJ_S[x[0]]; }).join("·"); }, ans = seqOf(b), pool = [], z;
    for (z = 0; z < 12; z++) { var s2 = seqOf(z); if (pool.indexOf(s2) < 0) pool.push(s2); }
    var ch = choose(ans, pool, rng(seedOf(c)), 4);
    return { mat: '<b>내 일지</b> ' + br(b) + ' — 지지 속에는 여러 천간이 숨어 있습니다.<br><span style="font-size:13px;color:var(--muted)">이 강의 표에서 ' + SJ_B[b] + '(' + SJ_BH[b] + ')의 지장간을 찾아 여기 → 중기 → 정기 순서로 읽습니다.</span>',
      q: "내 일지 " + br(b) + " 속의 지장간을 여기 → 중기 → 정기 순서로 나열하면?", hint: "이 강의 표에서는 자·묘·유가 두 글자, 나머지는 세 글자입니다.", ch: ch.ch, a: ch.a,
      reveal: function (ok) {
        var rows = cols(p).map(function (x) { return [x[0] + "지 " + br(x[1].b), jjgText(x[1].b)]; });
        return say(ok, "정답은 <b>" + ans + "</b>입니다.") + tbl(rows) + '<p>일지 ' + br(b) + '의 정기는 ' + st(bmain(b)) + '이고 일간에게 <b>' + sjTenGod(c.ds, bmain(b)) + '</b>입니다.</p>' + link(10);
      } };
  } };
  DEF[11] = { time: true, run: function (c) {
    var p = c.p, pairs = relPairs(p);
    var a = p.m.b, b = p.d.b, kind = a === b ? "합도 충도 아님" : Math.abs(a - b) === 6 ? "충" : sjYukhap(a) === b ? "육합" : a % 4 === b % 4 ? "삼합(반합)" : "합도 충도 아님";
    var opts = ["충", "육합", "삼합(반합)", "합도 충도 아님"];
    return { mat: '<b>내 월지</b> ' + br(a) + ' · <b>일지</b> ' + br(b) + '<br><span style="font-size:13px;color:var(--muted)">충: 자오·축미·인신·묘유·진술·사해 / 육합: 자축·인해·묘술·진유·사신·오미 / 삼합 무리: 신자진·해묘미·인오술·사유축</span>',
      q: "내 월지 " + jp(br(a), "와/과") + " 일지 " + jp(br(b), "는/은") + " 어떤 관계일까요?", hint: "지지를 열두 칸의 원으로 놓았을 때 정반대에 있으면 충입니다. 동네보살은 같은 삼합 무리의 두 글자가 만나도 삼합(반합)으로 세며, 교재에 따라 자·오·묘·유가 낀 두 글자만 반합으로 보기도 합니다.", ch: opts, a: opts.indexOf(kind),
      reveal: function (ok) {
        var rows = pairs.map(function (x) { return [x.n1 + " " + br(x.a) + " · " + x.n2 + " " + br(x.b), x.kind || "관계 없음"]; });
        return say(ok, "정답은 <b>" + kind + "</b>입니다." + (a === b ? " 두 글자가 같은 글자입니다." : "")) + tbl(rows) + link(11);
      } };
  } };
  DEF[12] = { time: true, run: function (c) {
    var p = c.p, b = p.d.b, ans = sjUnseong(c.ds, b), ch = choose(ans, SJ_UN, rng(seedOf(c)), 4), js = SJ_JS[c.ds];
    return { mat: '<b>내 일간</b> ' + st(c.ds) + ' · <b>일지</b> ' + br(b) + '<br><span style="font-size:13px;color:var(--muted)">' + SJ_S[c.ds] + '의 장생은 ' + br(js) + '에서 시작하고 ' + (c.ds % 2 === 0 ? '양간이라 순행' : '음간이라 역행') + '합니다. 열두 단계: ' + SJ_UN.join(" · ") + '</span>',
      q: "내 일간 " + jp(st(c.ds), "가/이") + " 일지 " + br(b) + "에서 놓인 십이운성은?", ch: ch.ch, a: ch.a,
      reveal: function (ok) {
        return say(ok, "정답은 <b>" + ans + "</b>입니다.") + tbl(cols(p).map(function (x) { return [x[0] + "지 " + br(x[1].b), sjUnseong(c.ds, x[1].b)]; })) + '<p>' + st(c.ds) + '의 장생은 ' + br(js) + '이고 ' + (c.ds % 2 === 0 ? '지지 순서대로' : '지지 역순으로') + ' 나아갑니다. 병·사·묘는 건강이나 수명과 관계없는 기운의 세기 눈금입니다.</p>' + link(12);
      } };
  } };
  DEF[13] = { time: true, run: function (c) {
    var p = c.p, ss = sjSinsal(p), has = ss.indexOf("도화살") >= 0, bs = [p.y.b, p.m.b, p.d.b].concat(p.h ? [p.h.b] : []);
    var all = ["천을귀인", "문창귀인", "도화살", "역마살", "화개살", "양인살", "백호대살", "괴강살"];
    return { mat: '<b>내 일간</b> ' + st(c.ds) + ' · <b>네 지지</b> ' + bs.map(br).join(" · ") + ' · <b>일주</b> ' + gz(p.d) + '<br><span style="font-size:13px;color:var(--muted)">도화살: 연지나 일지가 속한 삼합 무리(신자진→유, 사유축→오, 인오술→묘, 해묘미→자)의 도화 지지가 여덟 글자의 지지에 있으면 붙습니다.</span>',
      q: "내 사주에 도화살이 있을까요?", ch: ["있습니다", "없습니다"], a: has ? 0 : 1,
      reveal: function (ok) {
        var g1 = sjSamhap(p.y.b), g2 = sjSamhap(p.d.b);
        return say(ok, has ? "도화살이 <b>있습니다</b>." : "도화살은 <b>없습니다</b>.") +
          '<p>연지 ' + br(p.y.b) + '의 도화 지지는 ' + br(SJ_DOHWA[g1]) + ', 일지 ' + br(p.d.b) + '의 도화 지지는 ' + br(SJ_DOHWA[g2]) + '입니다. 내 지지 가운데 ' + (has ? '있어서 도화살이 붙습니다.' : '없어서 도화살은 붙지 않습니다.') + '</p>' +
          '<p><b>동네보살이 신살을 읽는 방식</b>(전통 풀이를 옮긴 참고용 문구입니다)</p>' + tbl(all.map(function (n) { var f = ss.indexOf(n) >= 0; return [n, f ? "<b>붙음</b>" : "없음", f ? E(SJ_SINSAL_DESC[n] || "") : ""]; })) + link(13);
      } };
  } };
  DEF[14] = { time: true, gender: true, run: function (c) {
    var da = daeunOf(c), jd = sjJdKST(c.y, c.mo, c.d, c.h == null ? 12 : c.h, c.h == null ? 0 : 30), mt = sjMonthTerms(jd), tgt = da.fwd ? mt.nextName : mt.prevName, nums = numChoices(da.su, 1, 10);
    return { mat: '<b>태어난 해의 천간</b> ' + jp(st(c.p.y.s), "는/은") + ' ' + yyS(c.p.y.s) + ', 성별은 ' + (c.male ? '남' : '여') + '입니다. 남자 양년생과 여자 음년생은 순행, 나머지는 역행하므로 내 대운은 <b>' + (da.fwd ? "순행" : "역행") + '</b>입니다.<br>태어난 순간에서 ' + (da.fwd ? "다음" : "이전") + ' 절기 <b>' + tgt + '</b>까지는 약 <b>' + da.days + '일</b>입니다.',
      q: "날수를 3으로 나누어 반올림하면 첫 대운은 몇 세부터 시작할까요?", hint: "예: 11일 ÷ 3 = 3.67 → 4세. 1세에서 10세 사이로 정합니다.", ch: nums.map(function (x) { return x + "세"; }), a: nums.indexOf(da.su),
      reveal: function (ok) {
        return say(ok, "정답은 <b>" + da.su + "세</b>입니다.") + '<p>약 ' + da.days + ' ÷ 3 = ' + (da.days / 3).toFixed(2) + ' → 반올림해 <b>' + da.su + '세</b>에 첫 대운이 시작됩니다. 내 월주 ' + gz(c.p.m) + '에서 ' + (da.fwd ? '앞으로 한 칸씩 나아갑니다' : '뒤로 한 칸씩 거슬러 갑니다') + '.</p>' +
          tbl(daeunRows(c, da).map(function (r) { return [r[0], r[1], r[2]]; })) + link(14);
      } };
  } };
  DEF[15] = { time: false, run: function (c) {
    var now = new Date(), Y = now.getFullYear(), M = now.getMonth() + 1, yp = sjPillars(Y, M, now.getDate(), 12, 0, false).y, mp = sjPillars(Y, M, 20, 12, 0, false).m;
    var ans = sjTenGod(c.ds, yp.s), ch = choose(ans, TG10, rng(seedOf(c)), 4);
    return { mat: '<b>내 일간</b> ' + st(c.ds) + ' · <b>올해</b>의 간지는 <b>' + gz(yp) + '</b>입니다. 사주의 해는 입춘에 바뀌므로 입춘 전인 1월에서 2월 초에는 앞해의 간지를 씁니다.',
      q: "올해 하늘 글자 " + jp(st(yp.s), "는/은") + " 내 일간에게 어떤 십성일까요?", ch: ch.ch, a: ch.a,
      reveal: function (ok) {
        return say(ok, "정답은 <b>" + ans + "</b>입니다.") + '<p>' + tenExplain(c.ds, yp.s, "올해 하늘 글자") + '</p>' +
          '<p>이번 달(' + M + '월)의 월주는 <b>' + gz(mp) + '</b>이고 하늘 글자 ' + jp(st(mp.s), "는/은") + ' 일간에게 <b>' + sjTenGod(c.ds, mp.s) + '</b>입니다. 달은 절기를 기준으로 바뀌므로 절기 앞뒤에는 월주가 달라질 수 있습니다.</p>' + link(15);
      } };
  } };
  DEF[16] = { time: true, gender: true, run: function (c) {
    var p = c.p, s = c.st, ss = sjSinsal(p), da = daeunOf(c), pairs = relPairs(p).filter(function (x) { return x.kind && x.kind !== "같은 글자"; }), cnt = [0, 0, 0, 0, 0];
    cols(p).forEach(function (x) { cnt[SJ_ES[x[1].s]]++; cnt[SJ_EB[x[1].b]]++; });
    var gy = SJ_GYEOK[sjTenGod(c.ds, bmain(p.m.b))], dar = daeunRows(c, da), first = dar[0];
    var rows = [
      ["1 여덟 글자", gz(p.y) + " " + gz(p.m) + " " + gz(p.d) + (p.h ? " " + gz(p.h) : ""), 1], ["2 오행 개수", SJ_EL.map(function (e, i) { return e + " " + cnt[i]; }).join(" · "), 2],
      ["3 일간", st(c.ds) + " · " + yyS(c.ds) + SJ_EL[c.de], 5], ["4 십성(하늘 글자)", "연간 " + sjTenGod(c.ds, p.y.s) + " · 월간 " + sjTenGod(c.ds, p.m.s) + (p.h ? " · 시간 " + sjTenGod(c.ds, p.h.s) : ""), 6],
      ["5 신강·신약", (s.strong ? "신강" : "신약") + " · 돕는 비율 " + Math.round(s.ratio * 100) + "%", 7], ["6 용신", "억부용신 " + SJ_EL[s.yong] + " (보조 " + SJ_EL[s.yong2] + ")", 8], ["7 격국", gy, 9],
      ["8 지장간·합충", "월지 " + br(p.m.b) + " 정기 " + st(bmain(p.m.b)) + " · " + (pairs.length ? pairs.map(function (x) { return x.n1 + "-" + x.n2 + " " + x.kind; }).join(", ") : "합·충 없음"), 10],
      ["9 십이운성", cols(p).map(function (x) { return x[0] + "지 " + sjUnseong(c.ds, x[1].b); }).join(" · "), 12], ["10 신살", ss.length ? ss.join("·") : "없음", 13],
      ["11 대운", (da.fwd ? "순행" : "역행") + " · " + da.su + "세 시작 · 첫 대운 " + first[1] + " " + first[2], 14], ["12 세운·월운", "15강 실습에서 올해 기준으로 확인하세요", 15]];
    return { mat: "", q: null, reveal: function () {
      return '<p class="lp-say">내 사주 한 장을 열두 단계로 읽었네.</p>' + tbl(rows.map(function (r) { return [E(r[0]), E(r[1]), '<a href="' + page(r[2]) + '">' + r[2] + '강</a>']; })) +
        '<p>값이 어디서 나왔는지 궁금하면 오른쪽 강으로 돌아가 그 강의 실습을 다시 해 보세요. 사주는 전통적인 해석 체계이며 결과를 확정하지 않습니다.</p>' + link(16);
    } };
  } };

  // ───────── 실습 화면
  function mountPractice(box) {
    var no = +box.getAttribute("data-no"), def = DEF[no], mount = $(".lp-mount", box);
    if (!def || !mount) return;
    if (typeof sjPillars !== "function") { mount.innerHTML = '<p class="lp-lead">실습 코드를 불러오지 못했습니다. 페이지를 새로 고쳐 주세요.</p>'; return; }
    var timeHtml = '<div><label for="lp-t">태어난 시각 (선택)</label><select id="lp-t"><option value="">모름 (시주 제외)</option>' + sjHourOpts(-1) + '</select></div>';
    var genHtml = def.gender ? '<div><label for="lp-g">성별</label><select id="lp-g"><option value="m">남</option><option value="f">여</option></select></div>' : '';
    mount.innerHTML = '<div class="lp"><div class="lp-form"><div><label for="lp-d">생년월일 (양력)</label><input type="date" id="lp-d" value="1990-03-15" min="1900-01-01" max="2099-12-31"></div>' +
      (def.time || def.gender ? '<div class="lp-row">' + (def.time ? timeHtml : '') + genHtml + '</div>' : '') + '<button type="button" class="lp-btn" id="lp-go">실습 시작</button></div><div class="lp-out" aria-live="polite"></div></div>';
    try { if (typeof birthDial === "function") birthDial(mount, "#lp-d"); } catch (e) { }
    var out = $(".lp-out", mount);
    function start() {
      var d = $("#lp-d", mount).value, y = +(d.split("-")[0]);
      if (!d || !(y >= 1900 && y <= 2099)) { out.innerHTML = '<p class="lp-lead">1900~2099년 사이의 생년월일을 넣어 주세요.</p>'; return; }
      var c = chartOf({ d: d, t: $("#lp-t", mount) ? $("#lp-t", mount).value : "", g: $("#lp-g", mount) ? $("#lp-g", mount).value : "m" }), o;
      try { o = def.run(c); } catch (e) { out.innerHTML = '<p class="lp-lead">계산 중 문제가 생겼습니다. 다른 생년월일로 다시 해 보세요.</p>'; return; }
      var html = (o.mat ? '<div class="lp-mat">' + o.mat + '</div>' : '');
      if (o.q) {
        html += '<p class="lp-q">' + E(o.q) + '</p>' + (o.hint ? '<p class="lp-hint">' + E(o.hint) + '</p>' : '') +
          '<ul class="lp-ch">' + o.ch.map(function (t, i) { return '<li><button type="button" data-i="' + i + '">' + E(t) + '</button></li>'; }).join("") + '</ul><div class="lp-rv"></div>';
      } else html += '<div class="lp-reveal">' + o.reveal(true) + '</div>';
      html += '<div class="lp-again"><button type="button" class="lp-btn ghost" id="lp-re">다른 생년월일로 다시 해 보기</button></div>';
      out.innerHTML = html;
      if (typeof track === "function") try { track("learn_practice", { tool: "learn" }); } catch (e) { }
      $$(".lp-ch button", out).forEach(function (b) {
        b.addEventListener("click", function () {
          var i = +b.getAttribute("data-i"), ok = i === o.a;
          $$(".lp-ch button", out).forEach(function (x, j) { x.disabled = true; if (j === o.a) x.classList.add("ok"); });
          if (!ok) b.classList.add("no");
          $(".lp-rv", out).innerHTML = '<div class="lp-reveal">' + o.reveal(ok) + '</div>';
        });
      });
      var re = $("#lp-re", out); if (re) re.addEventListener("click", function () { out.innerHTML = ""; var f = $("#lp-d", mount); if (f && f.scrollIntoView) f.scrollIntoView({ block: "center" }); });
      try { out.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) { }
    }
    $("#lp-go", mount).addEventListener("click", start);
  }

  function init() {
    $$(".lmark").forEach(function (b) { b.addEventListener("click", function () { var no = +b.getAttribute("data-no"); mark(no, getDone().indexOf(no) < 0); }); });
    initQuiz();
    var p = $("#lpractice"); if (p) mountPractice(p);
    paint();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
