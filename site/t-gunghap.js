TOOLS.push({id:"gunghap",cat:"재미·운세",icon:"",name:"궁합 보기",desc:"사주 오행·합충 궁합",render:function(el){
    el.innerHTML='<div class="r2"><div><label>내 생년월일</label><input type="date" id="a" value="'+(loadPrefs().birth||"1990-03-15")+'"></div>'+
    '<div><label>상대 생년월일</label><input type="date" id="b" value="'+(loadPrefs().partnerBirth||"1992-07-20")+'"></div></div>'+
    // 성별은 점수에 쓰지 않는다(궁합 네 축은 성별과 무관). 두 사람의 캐릭터 그림과 호칭에만 쓴다
    (function(){var g=loadPrefs().gender==="m"?"m":"f",pg=loadPrefs().partnerGender||(g==="m"?"f":"m");
      function sel(id,v){return '<select id="'+id+'"><option value="f"'+(v==="f"?" selected":"")+'>여</option><option value="m"'+(v==="m"?" selected":"")+'>남</option></select>';}
      function hr(id){return '<select id="'+id+'"><option value="">모름</option>'+sjHourOpts(-1)+'</select>';}
      return '<div class="r2" style="margin-top:10px"><div><label>나의 성별</label>'+sel("ga",g)+'</div><div><label>상대의 성별</label>'+sel("gb",pg)+'</div></div>'+
        '<div class="r2" style="margin-top:10px"><div><label>나의 태어난 시각 (선택)</label>'+hr("ha")+'</div><div><label>상대의 태어난 시각 (선택)</label>'+hr("hb")+'</div></div>';})()+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">'+ASK_LABEL+'</button>'+
    '<div id="out"></div>';
    function ghChar(P,g,who){var e=SJ_EL[SJ_ES[P.d.s]],en={목:"wood",화:"fire",토:"earth",금:"metal",수:"water"}[e];
      return '<div class="sj-char"><img width="520" height="520" src="img/char/el-'+en+'-'+g+'.webp" alt="'+who+' — '+SJ_S[P.d.s]+e+' 일간 캐릭터" loading="lazy" onerror="this.closest(\'.sj-char\').remove()">'+
        '<div class="cap"><div class="t">'+who+' · '+(g==="m"?"남":"여")+'</div><div class="n">'+SJ_S[P.d.s]+e+' 일간</div><p>'+SJ_TTI[P.y.b]+'띠 · '+SJ_S[P.d.s]+SJ_B[P.d.b]+'일주</p></div></div>';}
    function pts(a,b){ // [점수증감, 설명] 목록
      var out=[],sc=60,f={hap:false,r1:null,tti:"",ilji:"",fill:0}; // f: 네 축 계산에 쓰는 판정값
      // 1. 일간 천간합 (갑기·을경·병신·정임·무계)
      if(Math.abs(a.d.s-b.d.s)===5){sc+=18;f.hap=true;out.push(["기운이 딱 맞물림","두 사람을 뜻하는 글자("+SJ_S[a.d.s]+"·"+SJ_S[b.d.s]+")가 서로 짝을 이루는 사이입니다. 사주에서 가장 강한 끌림으로 봅니다. 서로에게 자연스럽게 스며드는 관계."]);}
      else{
        var r1=sjTenGod(a.d.s,b.d.s);f.r1=r1;
        if(r1==="정재"||r1==="정관"){sc+=10;out.push(["서로를 아껴 주는 기운","상대가 나의 "+r1+" — 서로 아껴주고 책임지는 안정형 조합입니다."]);}
        else if(r1==="정인"||r1==="식신"){sc+=8;out.push(["한쪽이 키워 주는 기운","상대가 나의 "+r1+" — 한쪽이 기르고 한쪽이 자라는 순환이 좋은 관계."]);}
        else if(r1==="편관"||r1==="상관"){sc-=6;out.push(["부딪히기 쉬운 기운","상대가 나의 "+r1+" — 자극이 강한 만큼 다툼도 잦을 수 있는 스파크형. 존중의 거리가 필요합니다."]);}
        else{out.push(["무난하게 만나는 기운","상대가 나의 "+r1+" — 무난하게 어울리는 조합입니다."]);}
      }
      // 2. 띠(연지) 합충
      var ab=a.y.b,bb=b.y.b,d=Math.abs(ab-bb);
      if(ab%4===bb%4&&ab!==bb){sc+=12;f.tti="삼합";out.push(["띠끼리 찰떡","두 띠("+SJ_TTI[ab]+"·"+SJ_TTI[bb]+")는 셋이 뭉치는 짝일세 — 목표를 향해 같이 달리는 최고의 팀 궁합."]);}
      else if(ab+bb===13||(ab===0&&bb===1)||(ab===1&&bb===0)){sc+=10;f.tti="육합";out.push(["띠끼리 편안","두 띠는 둘이 맞는 짝 — 서로를 편안하게 만드는 찰떡 조합."]);}
      else if(d===6){sc-=12;f.tti="충";out.push(["띠끼리 부딪힘","두 띠는 서로 부딪히는 짝 — 처음엔 강하게 끌리지만 다투기도 쉬운 관계. 생활 방식을 맞추는 게 관건."]);}
      else{out.push(["띠끼리 무난","띠끼리 맞부딪히거나 붙는 자리가 없어 — 무난한 흐름입니다."]);}
      // 3. 오행 보완 (서로 부족한 오행 채워주는지)
      function cnt6(p){var c=[0,0,0,0,0];[p.y,p.m,p.d].concat(a.h&&b.h?[p.h]:[]).forEach(function(x){c[SJ_ES[x.s]]++;c[SJ_EB[x.b]]++;});return c;}
      var ca=cnt6(a),cb=cnt6(b),fill=0;
      for(var i=0;i<5;i++){if(ca[i]===0&&cb[i]>=2)fill++;if(cb[i]===0&&ca[i]>=2)fill++;}f.fill=fill;
      if(fill>=2){sc+=10;out.push(["서로 채워 주는 기운","서로 없는 오행을 상대가 넉넉히 갖고 있어 — 함께 있을 때 완성되는 보완형."]);}
      else if(fill===1){sc+=5;out.push(["서로 채워 주는 기운","부족한 오행 하나를 상대가 채워줍니다."]);}
      else{out.push(["닮은 기운","오행 구성이 비슷 — 닮아서 편하지만 약점도 같이 겹칠 수 있어요."]);}
      // 4. 일지 합충 (배우자궁)
      var da=a.d.b,db=b.d.b,dd=Math.abs(da-db);
      if(da%4===db%4&&da!==db){sc+=8;f.ilji="삼합";out.push(["같이 사는 호흡","배우자 자리끼리 뭉치는 짝 — 일상 속 호흡이 잘 맞습니다."]);}
      else if(da+db===13||(da===0&&db===1)||(da===1&&db===0)){sc+=8;f.ilji="육합";out.push(["같이 사는 호흡","배우자 자리끼리 맞는 짝 — 살 맞대고 사는 궁합이 특히 좋습니다."]);}
      else if(dd===6){sc-=8;f.ilji="충";out.push(["생활 습관은 조율 필요","배우자 자리끼리 부딪히는 짝 — 애정과 별개로 생활 습관이 자주 엇갈릴 수 있습니다."]);}
      if(a.h&&b.h){var ha=a.h.b,hb=b.h.b;
        if(ha%4===hb%4&&ha!==hb){sc+=4;f.hour="삼합";out.push(["늘그막의 호흡","태어난 시각 자리(자녀·말년 자리)끼리 뭉치는 짝 — 세월이 갈수록 손발이 맞는 사이입니다."]);}
        else if(sjYukhap(ha)===hb){sc+=4;f.hour="육합";out.push(["늘그막의 호흡","태어난 시각 자리끼리 맞는 짝 — 나이 들수록 편안해지는 사이입니다."]);}
        else if(Math.abs(ha-hb)===6){sc-=4;f.hour="충";out.push(["늘그막의 조율","태어난 시각 자리끼리 부딪히는 짝 — 자녀 문제나 노후 계획에서 생각이 갈리기 쉬우니 일찍 이야기해 두세요."]);}}
      return [Math.max(35,Math.min(99,sc)),out,f];
    }
    function go(){
      var av=el.querySelector("#a").value.split("-"),bv=el.querySelector("#b").value.split("-");
      if(av.length<3||(!inv&&bv.length<3))return;
      var ga=el.querySelector("#ga").value,gb=inv?inv.g:el.querySelector("#gb").value;
      // 초대로 들어온 경우 상대 생일은 모른다(사주 글자만 받았다). 저장도 내 것만
      savePrefs(inv?{birth:el.querySelector("#a").value,gender:ga}:{birth:el.querySelector("#a").value,partnerBirth:el.querySelector("#b").value,gender:ga,partnerGender:gb});
      track("fortune_view",{tool:"gunghap"});
      // 시각은 선택. 사주와 같이 진태양시 30분 보정을 쓴다(시진 목록의 범위가 보정을 반영한 값)
      var hav=el.querySelector("#ha").value,hbv=el.querySelector("#hb").value;
      var A=sjPillars(+av[0],+av[1],+av[2],hav===""?null:+hav,30,true),B=inv?inv.p:sjPillars(+bv[0],+bv[1],+bv[2],hbv===""?null:+hbv,30,true);
      var r=pts(A,B),sc=r[0],rows=r[1],f=r[2];
      var grade=sc>=85?"천생연분":sc>=72?"좋은 인연":sc>=58?"노력형 인연":"신중한 인연";
      /* 네 축은 총점에서 가감하지 않고 각자 계산한다. 예전엔 풀이 제목에서 "천간합"·"충" 같은 낱말을 찾았는데
         제목이 쉬운 말로 바뀐 뒤로 한 번도 걸리지 않아 네 막대가 총점 ±2로만 나왔다(2026-09 감사: 62/64/64/64).
         끌림: 두 일간의 관계 · 안정: 띠 합충 · 소통: 상대 일간이 나에게 무슨 십성인가 · 생활: 배우자 자리(일지) 합충과 오행 보완 */
      var AT={정재:18,정관:18,정인:14,식신:14,편관:10,상관:10,편재:6,편인:6,비견:2,겁재:2};
      var TK={식신:20,정인:20,정재:12,정관:12,비견:8,편재:4,편인:4,겁재:-2,편관:-10,상관:-10};
      var attract=60+(f.hap?30:(AT[f.r1]||0));
      var stable=62+(f.tti==="삼합"?22:f.tti==="육합"?18:f.tti==="충"?-16:0);
      var talk=60+(f.hap?16:(TK[f.r1]||0));
      var life=62+(f.ilji==="삼합"?20:f.ilji==="육합"?18:f.ilji==="충"?-16:0)+(f.fill>=2?8:f.fill===1?4:0);
      var subs=[["끌림",attract],["안정",stable],["소통",talk],["생활",life]].map(function(x){
        return [x[0],Math.max(30,Math.min(99,x[1]))];});
      function gbar(n,v){return rateBar(n,v);}
      var advice=sc>=85
        ? "합이 여러 겹으로 걸린 조합입니다. 서로 애쓰지 않아도 흐름이 맞는 편이라, 오히려 당연하게 여기다 소홀해지는 게 유일한 위험입니다. 잘 맞는 이유를 가끔 말로 확인해 주세요."
        : sc>=72
        ? "기본기가 좋은 조합입니다. 큰 충돌 요인이 없으니 관계의 질은 대화의 빈도가 결정합니다. 서운함을 쌓아두지 않으면 오래갑니다."
        : sc>=58
        ? "맞춰가면 되는 조합입니다. 명리에서 노력형이란 안 맞는다는 뜻이 아니라, 서로 다른 축을 갖고 있어 조율이 필요하다는 뜻입니다. 생활 규칙 몇 가지를 미리 정해두면 마찰이 크게 줄어듭니다."
        : "부딪히기 쉬운 지점이 여러 곳에 있는 조합입니다. 다만 충이 있는 관계는 끌림도 강한 경우가 많습니다. 감정이 격해지는 순간을 미리 알고 그때 거리를 두는 규칙을 만들면 충분히 유지됩니다.";
      var elA=(function(p){var c=[0,0,0,0,0];[p.y,p.m,p.d].forEach(function(x){c[SJ_ES[x.s]]++;c[SJ_EB[x.b]]++;});return c;})(A);
      var elB=(function(p){var c=[0,0,0,0,0];[p.y,p.m,p.d].forEach(function(x){c[SJ_ES[x.s]]++;c[SJ_EB[x.b]]++;});return c;})(B);
      var elLine=SJ_EL.map(function(n,i){return n+" "+elA[i]+":"+elB[i];}).join(" · ");
      // 첫 화면 헤드라인 — 네 축 중 가장 높은 축이 이 관계의 성격을 요약한다
      var topAx=subs.slice().sort(function(x,y){return y[1]-x[1];})[0];
      el.querySelector("#out").innerHTML=
      '<div class="tf-id">'+SJ_S[A.d.s]+' × '+SJ_S[B.d.s]+' — 두 사람을 뜻하는 글자 비교</div>'+
      '<div class="tf-hl">'+SJ_TTI[A.y.b]+'띠 × '+SJ_TTI[B.y.b]+'띠 — '+grade+'. '+topAx[0]+'이 가장 강한 축.</div>'+
      '<div class="out" style="margin-top:16px"><div class="k">'+SJ_TTI[A.y.b]+'띠 '+SJ_S[A.d.s]+'일간 ♥ '+SJ_TTI[B.y.b]+'띠 '+SJ_S[B.d.s]+'일간</div>'+
      '<div class="v">'+sc+'<small>점 · '+grade+'</small></div></div>'+
      '<div class="sj-bars">'+subs.map(function(x){return gbar(x[0],x[1]);}).join("")+'</div>'+
      '<div class="gh-pair">'+ghChar(A,ga,"나")+ghChar(B,gb,inv&&inv.n?escH(inv.n):"상대")+'</div>'+
      rows.map(function(x){return '<div class="sj-sec"><h3>'+x[0]+'</h3><p>'+x[1]+'</p></div>';}).join("")+
      '<div class="sj-sec"><h3>다섯 기운, 나와 상대 비교</h3><p>'+(A.h&&B.h?"여덟 글자(연·월·일·시주)":"여섯 글자(연·월·일주)")+'에서 뽑은 오행 개수입니다. 앞이 나, 뒤가 상대예요.</p>'+
      '<div class="chips" style="margin-top:10px">'+SJ_EL.map(function(n,i){
        return '<span class="chip el-'+n+'">'+n+' '+elA[i]+' : '+elB[i]+'</span>';}).join("")+'</div>'+
      '<p style="font-size:12.5px;color:var(--muted);margin-top:10px;line-height:1.7">한쪽이 0인 오행을 상대가 둘 이상 갖고 있으면 서로를 채워주는 보완 관계입니다. 반대로 같은 오행이 양쪽 다 많으면 성향이 닮아 편한 대신 약점도 함께 겹칩니다.</p></div>'+
      '<div class="sj-sec"><h3>이 조합에게</h3><p>'+advice+'</p></div>'+
      '<div class="gh-mkinv">'+bosalImg("phone","bs-side","휴대폰을 든 아기보살")+'<h3>'+(inv?"나도 다른 사람에게 보내기":"이 궁합, 상대에게 보내기")+'</h3><p>내 사주 글자만 담은 링크를 보내면 받은 사람은 자기 생일만 넣고 우리 둘의 궁합을 봅니다. 생년월일은 서버로 가지 않고, 링크는 7일 뒤 지워집니다.</p>'+
      '<div class="ai-row"><input class="gh-nick" maxlength="10" placeholder="내 이름 (선택)" aria-label="보내는 사람 이름"><span class="gh-mk" role="button" tabindex="0">초대 링크 만들기</span></div><p class="gh-link" aria-live="polite"></p></div>'+
      shareBtn()+
      '<p class="note">두 사람을 뜻하는 글자가 짝을 이루는지, 띠와 태어난 날 글자가 서로 붙는지 부딪히는지, 모자란 기운을 채워 주는지를 함께 보는 전통 방식입니다. 끌림은 두 사람의 글자 관계, 안정은 띠 사이, 소통은 글자가 맡은 역할, 생활은 배우자 자리에서 나옵니다. 태어난 시각까지 넣은 정밀 궁합은 사주팔자 만세력에서 각자 여덟 글자를 확인해보세요. 참고용.</p>';
      bindInvite(el,A,ga);
      bindShare(el,"사주 궁합","우리 궁합 "+sc+"점 · "+grade+" ("+SJ_TTI[A.y.b]+"띠 ♥ "+SJ_TTI[B.y.b]+"띠). 동네보살에서 확인:");askFx(el,{score:sc,grade:grade,pose:sc>=60?"heart":"worry",say:sc>=85?"둘이 참 잘 맞물리네! 이 인연 아껴 두게.":sc>=72?"결이 좋은 사이일세. 대화만 자주 하면 오래가네.":sc>=58?"맞춰 가면 되는 사이야. 아래 조율할 자리를 보게.":"부딪히는 자리가 여럿이네. 서로의 거리를 정해 두면 훨씬 편해지네."});}
    // 초대 링크(?i=)로 들어오면 상대 칸 대신 보낸 사람의 사주 글자를 쓴다
    var inv=null,iq=(location.search.match(/[?&]i=([a-z0-9]{10})(?![a-z0-9])/)||[])[1];
    if(iq&&typeof fetch==="function")fetch("/api/invite?i="+iq).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}).then(function(j){
      var bar=document.createElement("div");bar.className="gh-inv";el.insertBefore(bar,el.firstChild);
      if(!j||!j.p){bar.textContent="초대 링크가 만료됐거나 잘못됐네. 링크는 7일 동안만 열리니 보낸 사람에게 다시 받아 보게.";return;}
      inv={p:{y:{s:j.p[0],b:j.p[1]},m:{s:j.p[2],b:j.p[3]},d:{s:j.p[4],b:j.p[5]},h:null},g:j.g==="m"?"m":"f",n:j.n||""};
      bar.innerHTML='<b>'+(inv.n?escH(inv.n)+" 님":"친구")+'</b>'+(inv.n?"이":"가")+' 궁합을 보자고 보냈네. 자네 생년월일과 성별만 넣고 물어보게. 보낸 사람의 생년월일은 여기 오지 않았고, 사주 글자만 받았네.';
      ["#b","#gb","#hb"].forEach(function(q){var x=el.querySelector(q);if(x&&x.parentNode)x.parentNode.style.display="none";});
      track("invite_open",{});});
    askWire(el,go,["두 사람의 명식을 세운다","일간끼리 견주어 본다","일지의 합충을 본다"],"두 사람 것을 아직 안 물어봤네.");birthDial(el,"#a");birthDial(el,"#b");}});