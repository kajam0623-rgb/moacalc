/* 명리학 배우기 — 실습·확인 문제·진도. core.js 의 엔진(sjPillars 등)을 그대로 쓰는 ES5 코드다(build_site.js 가 site/learn.js 로 낸다).
   생년월일·시각·성별은 저장하지 않는다. 저장하는 것은 마친 강 번호(dnbs_learn)뿐이다. */
(function () {
  var KEY = "dnbs_learn", N = 16;
  var PAGES = ["learn-eight-characters.html","concept-eumyang-ohaeng.html","concept-cheongan-jiji.html","concept-jeolgi.html","learn-day-master.html","column-sipseong-lookup-table.html","learn-strength.html","concept-yongsin.html","learn-gyeokguk.html","learn-hidden-stems.html","concept-hapchung.html","concept-sibiunseong.html","learn-sinsal.html","column-daeun-reading.html","column-yearly-luck-table.html","learn-read-whole-chart.html"];
  var SHORTS = ["사주팔자란 — 여덟 글자와 네 자리","음양오행","천간과 지지","절기와 만세력","일간 — 나를 뜻하는 글자","십성 — 열 가지 관계","신강·신약 — 힘의 세기","용신 — 나에게 필요한 기운","격국 — 사주의 틀","지장간 — 지지 속에 숨은 글자","합과 충","십이운성","신살 — 글자 조합이 만드는 상징","대운 — 10년의 흐름","세운과 월운","종합 — 내 사주 한 장 읽기"];
  var ILGAN_META = [{"en":"gap","m":"하늘로 곧게 크는 큰 나무"},{"en":"eul","m":"바위를 감아 오르는 덩굴"},{"en":"byeong","m":"숨김없이 내리쬐는 태양"},{"en":"jeong","m":"어둠을 밝히는 촛불"},{"en":"mu","m":"흔들리지 않는 큰 산"},{"en":"gi","m":"곡식을 기르는 밭의 흙"},{"en":"gyeong","m":"벼려서 날을 세우는 무쇠"},{"en":"sin","m":"다듬어 빛나는 보석"},{"en":"im","m":"깊고 넓게 흐르는 바다"},{"en":"gye","m":"스며들어 적시는 빗물과 이슬"}];
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
    if (t) { t.textContent = d.length + " / " + N + "강 마쳤어요" + (d.length === N ? " — 모두 마쳤어요! 아래 종합 테스트로 확인해 보세요." : ""); var b = $("#lprog .lprog-bar i"); if (b) b.style.width = Math.round(d.length * 100 / N) + "%"; }
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

  // ───────── 자동 출제 — 엔진 규칙으로 문제를 그때그때 만든다. 정답은 언제나 엔진 값과 같고, kind·args 는 테스트가 정답을 다시 계산할 때 쓴다
  var STEP12 = ["여덟 글자 세우기", "오행 세기", "일간 찾기", "십성 읽기", "신강·신약 판단", "용신 정하기", "격국 찾기", "지장간과 합충", "십이운성", "신살", "대운", "세운·월운"];
  var GROUP_NAME = ["신·자·진", "사·유·축", "인·오·술", "해·묘·미"];
  var BANDS = ["30% 미만", "30% 이상 50% 미만", "50% 이상 70% 미만", "70% 이상"];
  function ri(r, n) { return Math.floor(r() * n); }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function plain(s) { return String(s).replace(/<[^>]+>/g, ""); }
  function stAll() { return SJ_S.map(function (s, i) { return st(i); }); }
  function brAll() { return SJ_B.map(function (z, i) { return br(i); }); }
  function elName(e) { return SJ_EL[e] + "(" + HAN.charAt(e) + ")"; }
  function q4(no, kind, args, q, correct, pool, r, why) {
    var ch = choose(correct, pool, r, 4);
    return { no: no, kind: kind, args: args, q: q, c: ch.ch, a: ch.a, why: why };
  }
  var GEN = {};
  GEN[1] = [
    function (r) {
      var ds = ri(r, 10), hb = 1 + ri(r, 11), start = (ds % 5) * 2 % 10, s = (start + hb) % 10;
      return q4(1, "hour", [ds, hb], "일간이 " + st(ds) + "인 날 " + SJ_B[hb] + "시(" + SJ_BH[hb] + "時)에 태어난 사람의 시주 하늘 글자는?", st(s), stAll(), r,
        "갑·기일은 자시가 갑자로, 을·경일은 병자로, 병·신일은 무자로, 정·임일은 경자로, 무·계일은 임자로 시작하고 시진마다 하늘 글자가 하나씩 나아갑니다. 일간 " + st(ds) + "이면 자시가 " + SJ_S[start] + "자이므로 " + SJ_B[hb] + "시는 " + st(s) + "입니다.");
    },
    function (r) {
      var hb = ri(r, 12), pool = [], i, ans = pad2((23 + 2 * hb) % 24) + ":30~" + pad2((25 + 2 * hb) % 24) + ":29";
      for (i = 0; i < 12; i++) pool.push(pad2((23 + 2 * i) % 24) + ":30~" + pad2((25 + 2 * i) % 24) + ":29");
      return q4(1, "sijin", [hb], "진태양시 보정을 적용한 동네보살 기준에서 " + SJ_B[hb] + "시(" + SJ_BH[hb] + "時)는 몇 시부터 몇 시까지인가요?", ans, pool, r,
        "하루를 두 시간씩 열두 시진으로 나누며 자시는 23:30에 시작합니다. " + SJ_B[hb] + "시는 " + ans.split("~")[0] + "부터 " + ans.split("~")[1] + "까지입니다.");
    }
  ];
  GEN[2] = [
    function (r) {
      var e = ri(r, 5), k = ri(r, 4), ans = (e + [1, 4, 2, 3][k]) % 5, pool = [0, 1, 2, 3, 4].map(elName),
        q = [jp(elName(e), "가/이") + " 낳는 오행은?", jp(elName(e), "를/을") + " 낳아 주는 오행은?", jp(elName(e), "가/이") + " 이기는 오행은?", jp(elName(e), "를/을") + " 이기는 오행은?"][k],
        why = [
          "상생(낳는 관계)은 목→화→토→금→수→목 순서입니다. " + elName(e) + " 바로 다음 칸이 " + elName(ans) + "입니다.",
          "상생은 목→화→토→금→수→목 순서이므로 " + elName(e) + " 바로 앞 칸이 " + elName(ans) + "입니다.",
          "상극(이기는 관계)은 목→토→수→화→금→목 순서입니다. " + elName(e) + " 바로 다음 칸이 " + elName(ans) + "입니다.",
          "상극은 목→토→수→화→금→목 순서이므로 " + elName(e) + " 바로 앞 칸이 " + elName(ans) + "입니다."][k];
      return q4(2, "wuxing", [e, k], q, elName(ans), pool, r, why);
    }
  ];
  GEN[3] = [
    function (r) {
      var n = 2 + ri(r, 9);
      return q4(3, "stemNth", [n], "갑(甲)부터 세어 " + n + "번째 천간은?", st(n - 1), stAll(), r, "천간은 갑·을·병·정·무·기·경·신·임·계 열 글자입니다. " + n + "번째는 " + st(n - 1) + "입니다.");
    },
    function (r) {
      var b = ri(r, 12);
      return q4(3, "tti", [b], "지지 " + jp(br(b), "는/은") + " 무슨 띠일까요?", SJ_TTI[b], SJ_TTI, r,
        "지지는 " + SJ_B.map(function (z, i) { return z + "=" + SJ_TTI[i]; }).join(" · ") + " 순서로 띠와 짝지어집니다. " + jp(br(b), "는/은") + " " + SJ_TTI[b] + "띠입니다.");
    },
    function (r) {
      var yang = r() < 0.5, c = ri(r, 5) * 2 + (yang ? 0 : 1), pool = [], i;
      for (i = 0; i < 10; i++) if (i % 2 !== c % 2) pool.push(st(i));
      return q4(3, "yinyang", [c], "다음 중 " + (yang ? "양간(陽干)" : "음간(陰干)") + "인 것은?", st(c), pool, r,
        "열 천간을 갑부터 세면 양과 음이 번갈아 나옵니다. 양간은 갑·병·무·경·임, 음간은 을·정·기·신·계입니다. " + jp(st(c), "는/은") + " " + (yang ? "양" : "음") + "간입니다.");
    }
  ];
  GEN[4] = [
    function (r) {
      var i = ri(r, 12), b = (i + 2) % 12;
      return q4(4, "termToBranch", [i], jp(TERM12[i], "가/이") + " 드는 달의 월지(月支)는?", br(b), brAll(), r,
        "월주는 열두 절(節)이 드는 순간에 바뀝니다. " + TERM12.map(function (t, k) { return t + " " + SJ_B[(k + 2) % 12] + "월"; }).join(" · ") + " 순서이므로 " + jp(TERM12[i], "는/은") + " " + SJ_B[b] + "월입니다.");
    },
    function (r) {
      var b = ri(r, 12), i = (b + 10) % 12;
      return q4(4, "branchToTerm", [b], "월지가 " + br(b) + "인 달은 어느 절기가 드는 순간부터 시작되나요?", TERM12[i], TERM12, r,
        "월주는 열두 절(節)에서 바뀌고 입춘부터 인월·묘월·진월 순서로 이어집니다. " + SJ_B[b] + "월은 " + TERM12[i] + "부터 시작됩니다.");
    }
  ];
  GEN[5] = [
    function (r) {
      var i = ri(r, 10), pool = [], j;
      for (j = 0; j < 10; j++) pool.push(yyS(j) + SJ_EL[SJ_ES[j]]);
      return q4(5, "daymaster", [i], "일간이 " + st(i) + "이면 음양과 오행은?", yyS(i) + SJ_EL[SJ_ES[i]], pool, r,
        "갑·을은 목, 병·정은 화, 무·기는 토, 경·신은 금, 임·계는 수이고 각 오행에서 앞 글자가 양, 뒤 글자가 음입니다. " + jp(st(i), "는/은") + " " + yyS(i) + SJ_EL[SJ_ES[i]] + "입니다.");
    },
    function (r) {
      var e = ri(r, 5), c = e * 2 + ri(r, 2), pool = [], i;
      for (i = 0; i < 10; i++) if (SJ_ES[i] !== e) pool.push(st(i));
      return q4(5, "stemElement", [c], "다음 중 오행이 " + elName(e) + "인 천간은?", st(c), pool, r, "갑·을은 목, 병·정은 화, 무·기는 토, 경·신은 금, 임·계는 수입니다. " + jp(st(c), "는/은") + " " + elName(e) + "입니다.");
    }
  ];
  GEN[6] = [
    function (r) {
      var d = ri(r, 10), o = ri(r, 10), ans = sjTenGod(d, o);
      return q4(6, "tg", [d, o], "일간 " + st(d) + "에게 " + jp(st(o), "는/은") + " 어떤 십성일까요?", ans, TG10, r, plain(tenExplain(d, o, "대상 글자")));
    },
    function (r) {
      var k = ri(r, 5), same = r() < 0.5, ans = TG10[2 * k + (same ? 0 : 1)];
      return q4(6, "tgRule", [k, same ? 1 : 0], "일간에게 " + REL_TEXT[k] + "이면서 음양이 " + (same ? "같으면" : "다르면") + " 어떤 십성일까요?", ans, TG10, r,
        "오행 관계로 " + TG10[2 * k] + "·" + TG10[2 * k + 1] + " 두 이름 중에서 고르고, 음양이 같으면 앞의 이름(" + TG10[2 * k] + "), 다르면 뒤의 이름(" + TG10[2 * k + 1] + ")을 씁니다.");
    }
  ];
  GEN[7] = [
    function (r) {
      var x, y, ratio, band;
      do { x = ri(r, 15) / 2; y = ri(r, 15) / 2; ratio = x + y ? x / (x + y) : -1; }
      while (x + y === 0 || Math.abs(ratio - 0.3) < 0.02 || Math.abs(ratio - 0.5) < 0.02 || Math.abs(ratio - 0.7) < 0.02);
      band = ratio >= 0.7 ? 3 : ratio >= 0.5 ? 2 : ratio >= 0.3 ? 1 : 0;
      return { no: 7, kind: "ratio", args: [x, y], q: "돕는 점수가 " + x + "점, 덜어내는 점수가 " + y + "점이면 돕는 비율은 어느 구간일까요?", c: BANDS.slice(), a: band,
        why: x + " ÷ (" + x + " + " + y + ") = 약 " + Math.round(ratio * 100) + "%이므로 " + BANDS[band] + "입니다. 50% 이상이면 신강, 못 미치면 신약으로 봅니다." };
    },
    function (r) {
      var P = [["월지", 3], ["일지", 2], ["월간", 1.5], ["연간", 1], ["연지", 1], ["시간", 1], ["시지", 1]], p = P[ri(r, 7)], all = ["1점", "1.5점", "2점", "3점"];
      return { no: 7, kind: "weight", args: [p[0]], q: "동네보살의 신강·신약 계산에서 " + jp(p[0], "는/은") + " 몇 점으로 셀까요?", c: all, a: all.indexOf(p[1] + "점"),
        why: "자리별 점수는 월지 3점, 일지 2점, 월간 1.5점, 연간·연지·시간·시지 각 1점입니다. " + jp(p[0], "는/은") + " " + p[1] + "점입니다." };
    }
  ];
  GEN[8] = [
    function (r) {
      var de = ri(r, 5), strong = r() < 0.5, ans = (de + (strong ? 1 : 4)) % 5;
      return q4(8, "yong", [de, strong ? 1 : 0], "일간 오행이 " + elName(de) + "인 사주가 " + (strong ? "신강" : "신약") + "이면 동네보살이 먼저 쓰는 억부용신은?", elName(ans), [0, 1, 2, 3, 4].map(elName), r,
        (strong ? "신강이면 일간이 낳는 기운(식상)을 먼저 씁니다. " + jp(elName(de), "가/이") + " 낳는 오행은 " : "신약이면 일간을 낳는 기운(인성)을 먼저 씁니다. " + jp(elName(de), "를/을") + " 낳는 오행은 ") + elName(ans) + "입니다. 교재에 따라 재성·관성·비겁이나 계절(조후)을 먼저 보기도 합니다.");
    }
  ];
  GEN[9] = [
    function (r) {
      var d = ri(r, 10), b = ri(r, 12), bm = SJ_BMAIN[b], tg = sjTenGod(d, bm);
      return q4(9, "gyeok", [d, b], "일간이 " + st(d) + "이고 월지가 " + br(b) + "일 때 동네보살이 붙이는 격국은?", SJ_GYEOK[tg], TG10.map(function (t) { return SJ_GYEOK[t]; }), r,
        "월지 " + br(b) + "의 본기는 " + st(bm) + "이고 일간 " + st(d) + "에게 " + tg + "이므로 " + SJ_GYEOK[tg] + "입니다.");
    },
    function (r) {
      var t = ri(r, 10), tg = TG10[t];
      return q4(9, "gyeokName", [t], "월지의 본기가 일간에게 " + tg + "이면 동네보살이 붙이는 격국 이름은?", SJ_GYEOK[tg], TG10.map(function (x) { return SJ_GYEOK[x]; }), r,
        "본기의 십성 이름에 격을 붙입니다. 비견은 건록격, 겁재는 양인격이라고 동네보살은 따로 부릅니다.");
    }
  ];
  GEN[10] = [
    function (r) {
      var b = ri(r, 12);
      return q4(10, "bmain", [b], "지지 " + br(b) + "의 정기(본기)는?", st(SJ_BMAIN[b]), stAll(), r, "정기는 지장간의 마지막 글자입니다. " + jjgText(b) + "이므로 정기는 " + st(SJ_BMAIN[b]) + "입니다.");
    },
    function (r) {
      var b = ri(r, 12), pool = [], z, seq = function (i) { return SJ_JJG[i].map(function (x) { return SJ_S[x[0]]; }).join("·"); };
      for (z = 0; z < 12; z++) pool.push(seq(z));
      return q4(10, "jjgSeq", [b], "지지 " + br(b) + "의 지장간을 여기 → 중기 → 정기 순서로 나열하면?", seq(b), pool, r, br(b) + "의 지장간은 " + jjgText(b) + "입니다.");
    }
  ];
  GEN[11] = [
    function (r) {
      var b = ri(r, 12), o = (b + 6) % 12;
      return q4(11, "chung", [b], "지지 " + jp(br(b), "와/과") + " 충(沖)을 이루는 지지는?", br(o), brAll(), r, "충은 열두 지지를 원으로 놓았을 때 정반대(6칸 떨어진) 자리입니다. " + br(b) + "의 반대편은 " + br(o) + "입니다.");
    },
    function (r) {
      var b = ri(r, 12), o = sjYukhap(b);
      return q4(11, "yukhap", [b], "지지 " + jp(br(b), "와/과") + " 육합(六合)을 이루는 짝은?", br(o), brAll(), r, "육합은 자축·인해·묘술·진유·사신·오미 여섯 짝입니다. " + br(b) + "의 짝은 " + br(o) + "입니다.");
    },
    function (r) {
      var b = ri(r, 12);
      return q4(11, "samhap", [b], "지지 " + jp(br(b), "가/이") + " 속한 삼합 무리는?", GROUP_NAME[b % 4], GROUP_NAME, r, "삼합 무리는 신·자·진, 사·유·축, 인·오·술, 해·묘·미 네 조입니다. " + jp(br(b), "는/은") + " " + GROUP_NAME[b % 4] + " 무리입니다.");
    }
  ];
  GEN[12] = [
    function (r) {
      var d = ri(r, 10), b = ri(r, 12), ans = sjUnseong(d, b);
      return q4(12, "unseong", [d, b], "일간이 " + st(d) + "일 때 지지 " + br(b) + "에서 놓인 십이운성은?", ans, SJ_UN, r,
        st(d) + "의 장생은 " + br(SJ_JS[d]) + "이고 " + (d % 2 === 0 ? "양간이라 지지 순서대로" : "음간이라 지지 역순으로") + " " + SJ_UN.join("·") + " 열두 단계가 이어집니다. " + jp(br(b), "는/은") + " " + ans + " 자리입니다.");
    },
    function (r) {
      var d = ri(r, 10);
      return q4(12, "jangsaeng", [d], st(d) + "의 장생(長生)은 어느 지지에서 시작할까요?", br(SJ_JS[d]), brAll(), r,
        "장생 지지는 갑 해, 을 오, 병·무 인, 정·기 유, 경 사, 신 자, 임 신, 계 묘입니다. " + st(d) + "의 장생은 " + br(SJ_JS[d]) + "입니다.");
    }
  ];
  GEN[13] = [
    function (r) {
      var g = ri(r, 4), k = ri(r, 3), nm = ["도화", "역마", "화개"][k], t = [SJ_DOHWA, SJ_YEOKMA, SJ_HWAGAE][k];
      return q4(13, "samhapSinsal", [g, k], "삼합 무리 " + GROUP_NAME[g] + "의 " + nm + " 지지는?", br(t[g]), brAll(), r,
        "삼합 무리로 정하는 신살입니다. " + GROUP_NAME[g] + " 무리의 도화는 " + br(SJ_DOHWA[g]) + ", 역마는 " + br(SJ_YEOKMA[g]) + ", 화개는 " + br(SJ_HWAGAE[g]) + "입니다.");
    },
    function (r) {
      var d = ri(r, 10);
      return q4(13, "munchang", [d], "일간이 " + st(d) + "일 때 문창귀인 지지는?", br(SJ_MUNCHANG[d]), brAll(), r, "문창귀인은 일간으로 정합니다. " + st(d) + "의 문창귀인은 " + br(SJ_MUNCHANG[d]) + "입니다.");
    },
    function (r) {
      var d = ri(r, 10), list = SJ_CHEONEUL[d], ok = ri(r, list.length), pool = [], i;
      for (i = 0; i < 12; i++) if (list.indexOf(i) < 0) pool.push(br(i));
      return q4(13, "cheoneul", [d, ok], "다음 중 일간 " + st(d) + "의 천을귀인 지지는?", br(list[ok]), pool, r,
        "천을귀인은 일간으로 정하며 일간마다 지지가 두 개입니다. " + st(d) + "의 천을귀인은 " + list.map(br).join("·") + "입니다.");
    }
  ];
  GEN[14] = [
    function (r) {
      var yang = r() < 0.5, male = r() < 0.5, fwd = yang === male;
      return q4(14, "direction", [yang ? 1 : 0, male ? 1 : 0], "태어난 해의 하늘 글자가 " + (yang ? "양(갑·병·무·경·임)" : "음(을·정·기·신·계)") + "인 " + (male ? "남자" : "여자") + "의 대운 방향은?",
        fwd ? "순행" : "역행", ["순행", "역행", "시주가 정한다", "일주가 정한다"], r,
        "대운의 방향은 태어난 해의 음양과 성별로 정합니다. 양의 해 남자와 음의 해 여자는 순행, 나머지는 역행입니다.");
    },
    function (r) {
      var n = 2 + ri(r, 28), ans = Math.min(10, Math.max(1, Math.round(n / 3))), nums = numChoices(ans, 1, 10);
      return { no: 14, kind: "daeunAge", args: [n], q: "태어난 날부터 대운 방향의 절기까지 " + n + "일이면 첫 대운은 몇 세에 시작할까요?", c: nums.map(function (x) { return x + "세"; }), a: nums.indexOf(ans),
        why: "3일을 1년으로 셉니다. " + n + " ÷ 3 = " + (n / 3).toFixed(2) + " → 반올림하면 " + ans + "세입니다(1~10세 범위)." };
    }
  ];
  GEN[15] = [
    function (r) {
      var y = 2020 + ri(r, 25), s = ((y - 4) % 10 + 10) % 10, b = ((y - 4) % 12 + 12) % 12, pool = [], k, s2, b2;
      for (k = -2; k <= 2; k++) if (k !== 0) { s2 = ((y + k - 4) % 10 + 10) % 10; b2 = ((y + k - 4) % 12 + 12) % 12; pool.push(gz({ s: s2, b: b2 })); }
      return q4(15, "yearGanzhi", [y], y + "년의 간지는?", gz({ s: s, b: b }), pool, r,
        "연도에서 4를 뺀 값을 10으로 나눈 나머지가 하늘 글자, 12로 나눈 나머지가 땅 글자의 순서입니다. " + y + "년은 " + gz({ s: s, b: b }) + "년입니다(사주의 해는 입춘부터 바뀝니다).");
    },
    function (r) {
      var d = ri(r, 10), y = 2024 + ri(r, 15), s = ((y - 4) % 10 + 10) % 10, ans = sjTenGod(d, s);
      return q4(15, "sewun", [d, y], "일간이 " + st(d) + "일 때 " + y + "년의 하늘 글자 " + jp(st(s), "는/은") + " 어떤 십성일까요?", ans, TG10, r, plain(tenExplain(d, s, y + "년 하늘 글자")));
    }
  ];
  GEN[16] = [
    function (r) {
      var k = ri(r, 11);
      return q4(16, "step", [k], "사주 한 장을 읽는 열두 단계에서 '" + STEP12[k] + "' 다음에 오는 단계는?", STEP12[k + 1], STEP12, r,
        "열두 단계는 " + STEP12.map(function (s, i) { return (i + 1) + " " + s; }).join(" → ") + " 순서입니다.");
    },
    function (r) {
      var k = ri(r, 12), nums = numChoices(k + 1, 1, 12);
      return { no: 16, kind: "stepNo", args: [k], q: "사주 한 장을 읽는 열두 단계에서 '" + STEP12[k] + "'은(는) 몇 번째 단계일까요?", c: nums.map(function (x) { return x + "단계"; }), a: nums.indexOf(k + 1),
        why: "열두 단계는 " + STEP12.map(function (s, i) { return (i + 1) + " " + s; }).join(" → ") + " 순서입니다." };
    }
  ];
  function newRng() { return rng(1 + Math.floor(Math.random() * 2147483645)); }
  function genOne(no, r) { var f = GEN[no]; return f[ri(r, f.length)](r); }
  function genSet(no, n, r) {
    var out = [], seen = {}, tries = 0, g;
    while (out.length < n && tries++ < 60) { g = genOne(no, r); if (!seen[g.q]) { seen[g.q] = 1; out.push(g); } }
    return out;
  }

  // ───────── 자동 출제 화면 — 강 페이지의 "더 풀어 보기"와 허브의 종합 테스트 (아무것도 저장하지 않는다)
  function qEl(g, label) {
    var d = document.createElement("div");
    d.className = "lq gen"; d.setAttribute("data-a", g.a); d.setAttribute("data-no", g.no); d.setAttribute("role", "group");
    d.innerHTML = '<p class="lq-q">' + (label ? E(label) + " " : "") + E(g.q) + '</p><ul class="lq-c">' +
      g.c.map(function (t, j) { return '<li><button type="button" class="lq-b" data-c="' + j + '">' + E(t) + '</button></li>'; }).join("") + '</ul><p class="lq-why" hidden>' + E(g.why) + '</p>';
    return d;
  }
  function pickAnswer(q, b) { // 정답을 보여 주고 맞았는지 돌려준다
    var a = +q.getAttribute("data-a"), c = +b.getAttribute("data-c");
    $$(".lq-b", q).forEach(function (x, j) { x.disabled = true; if (j === a) x.classList.add("ok"); });
    if (c !== a) b.classList.add("no");
    var w = $(".lq-why", q); if (w) w.hidden = false;
    return c === a;
  }
  function initMore() {
    var box = $("#lmore"); if (!box) return;
    var no = +box.getAttribute("data-no"), out = $(".lmore-out", box), sc = $(".lmore-score", box), go = $("#lmore-go"), asked = 0, right = 0;
    go.addEventListener("click", function () {
      var set = genSet(no, 3, newRng()); out.innerHTML = "";
      set.forEach(function (g, i) {
        var q = qEl(g, (i + 1) + "."); out.appendChild(q);
        $$(".lq-b", q).forEach(function (b) {
          b.addEventListener("click", function () {
            if (q.getAttribute("data-done")) return;
            q.setAttribute("data-done", "1"); asked++; if (pickAnswer(q, b)) right++;
            sc.textContent = "자동 출제 " + asked + "문제 중 " + right + "개 맞혔어요.";
          });
        });
      });
      go.textContent = "새 문제 3개 더 풀어 보기";
      if (typeof track === "function") try { track("learn_practice", { tool: "gen" }); } catch (e) { }
    });
  }
  function initTest() {
    var box = $("#ltest"); if (!box) return;
    var out = $(".ltest-out", box), go = $("#ltest-go");
    function start() {
      var r = newRng(), qs = [], seen = {}, no, g, extra = [6, 9, 12, 13], tries = 0, idx = 0, right = 0, wrong = {};
      for (no = 1; no <= 16; no++) { g = genOne(no, r); seen[g.q] = 1; qs.push(g); }
      while (qs.length < 20 && tries++ < 80) { g = genOne(extra[ri(r, extra.length)], r); if (!seen[g.q]) { seen[g.q] = 1; qs.push(g); } }
      qs.sort(function (a, b) { return a.no - b.no; });
      go.hidden = true;
      function show() {
        var cur = qs[idx], q = qEl(cur, ""), nxt = document.createElement("button");
        out.innerHTML = '<div class="ltest-head"><b>' + (idx + 1) + ' / ' + qs.length + '</b> · ' + cur.no + '강 ' + E(SHORTS[cur.no - 1] || "") + '<div class="lprog-bar"><i style="width:' + Math.round(idx * 100 / qs.length) + '%"></i></div></div>';
        out.appendChild(q);
        nxt.type = "button"; nxt.className = "lp-btn"; nxt.hidden = true; nxt.textContent = idx + 1 < qs.length ? "다음 문제" : "결과 보기"; out.appendChild(nxt);
        $$(".lq-b", q).forEach(function (b) {
          b.addEventListener("click", function () {
            if (q.getAttribute("data-done")) return;
            q.setAttribute("data-done", "1"); if (pickAnswer(q, b)) right++; else wrong[cur.no] = 1;
            nxt.hidden = false; nxt.focus();
          });
        });
        nxt.addEventListener("click", function () { idx++; if (idx < qs.length) show(); else finish(); });
      }
      function finish() {
        var n = qs.length, ws = Object.keys(wrong).map(Number).sort(function (a, b) { return a - b; }),
          msg = right >= 18 ? "16강의 핵심 규칙이 손에 익었어요. 이제 내 사주 결과를 하나씩 읽어 보세요." : right >= 14 ? "기초가 탄탄해요. 틀린 강만 다시 보면 됩니다." : right >= 8 ? "절반은 왔어요. 아래 강을 다시 읽고 실습해 보세요." : "처음 강의부터 천천히 다시 읽어 보세요.";
        out.innerHTML = '<div class="ltest-res" tabindex="-1"><p class="ltest-score">' + right + ' / ' + n + '</p><p>' + E(msg) + '</p>' +
          (ws.length ? '<p class="ltest-again-lead">다시 보면 좋은 강</p><div class="sibs">' + ws.map(function (k) { return '<a href="' + page(k) + '">' + k + '강 ' + E(SHORTS[k - 1]) + '</a>'; }).join("") + '</div>' : '<p>틀린 문제가 없습니다.</p>') +
          '<div class="lp-again"><button type="button" class="lp-btn" id="ltest-again">다시 풀기</button></div></div>';
        var res = $(".ltest-res", out); if (res && res.focus) res.focus();
        $("#ltest-again", out).addEventListener("click", start);
        if (typeof track === "function") try { track("learn_test", { tool: "learn" }); } catch (e) { }
      }
      show();
    }
    go.addEventListener("click", function () {
      if (typeof sjTenGod === "function" && typeof SJ_B !== "undefined") { start(); return; }
      go.disabled = true; go.textContent = "불러오는 중…";
      var s = document.createElement("script"); s.src = box.getAttribute("data-core") || "core.js";
      s.onload = function () { go.disabled = false; go.textContent = "테스트 시작"; start(); };
      s.onerror = function () { go.disabled = false; go.textContent = "테스트 시작"; out.innerHTML = '<p class="lp-lead">문제를 불러오지 못했습니다. 페이지를 새로 고쳐 주세요.</p>'; };
      document.head.appendChild(s);
    });
  }

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
    initMore();
    initTest();
    var p = $("#lpractice"); if (p) mountPractice(p);
    paint();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
