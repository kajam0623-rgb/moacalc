TOOLS.push({id:"gunghap",cat:"재미·운세",icon:"",name:"궁합 보기",desc:"사주 오행·합충 궁합",render:function(el){
    el.innerHTML='<div class="r2"><div><label>내 생년월일</label><input type="date" id="a" value="'+(loadPrefs().birth||"1990-03-15")+'"></div>'+
    '<div><label>상대 생년월일</label><input type="date" id="b" value="'+(loadPrefs().partnerBirth||"1992-07-20")+'"></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">'+ASK_LABEL+'</button>'+
    '<div id="out"></div>';
    function pts(a,b){ // [점수증감, 설명] 목록
      var out=[],sc=60;
      // 1. 일간 천간합 (갑기·을경·병신·정임·무계)
      if(Math.abs(a.d.s-b.d.s)===5){sc+=18;out.push(["일간 천간합","두 사람의 일간("+SJ_S[a.d.s]+"·"+SJ_S[b.d.s]+")이 천간합 — 명리에서 가장 강한 끌림으로 봅니다. 서로에게 자연스럽게 스며드는 관계."]);}
      else{
        var r1=sjTenGod(a.d.s,b.d.s);
        if(r1==="정재"||r1==="정관"){sc+=10;out.push(["일간 상생","상대가 나의 "+r1+" — 서로 아껴주고 책임지는 안정형 조합입니다."]);}
        else if(r1==="정인"||r1==="식신"){sc+=8;out.push(["일간 상생","상대가 나의 "+r1+" — 한쪽이 기르고 한쪽이 자라는 순환이 좋은 관계."]);}
        else if(r1==="편관"||r1==="상관"){sc-=6;out.push(["일간 긴장","상대가 나의 "+r1+" — 자극이 강한 만큼 다툼도 잦을 수 있는 스파크형. 존중의 거리가 필요합니다."]);}
        else{out.push(["일간 관계","상대가 나의 "+r1+" — 무난하게 어울리는 조합입니다."]);}
      }
      // 2. 띠(연지) 합충
      var ab=a.y.b,bb=b.y.b,d=Math.abs(ab-bb);
      if(ab%4===bb%4&&ab!==bb){sc+=12;out.push(["띠 삼합","두 띠("+SJ_TTI[ab]+"·"+SJ_TTI[bb]+")가 삼합 — 목표를 향해 같이 달리는 최고의 팀 궁합."]);}
      else if(ab+bb===13||(ab===0&&bb===1)||(ab===1&&bb===0)){sc+=10;out.push(["띠 육합","두 띠가 육합 — 서로를 편안하게 만드는 찰떡 조합."]);}
      else if(d===6){sc-=12;out.push(["띠 충","두 띠가 충(沖) — 처음엔 강하게 끌리지만 부딪히기도 쉬운 관계. 생활 패턴 조율이 관건."]);}
      else{out.push(["띠 관계","띠 사이 특별한 합·충 없음 — 무난한 흐름입니다."]);}
      // 3. 오행 보완 (서로 부족한 오행 채워주는지)
      function cnt6(p){var c=[0,0,0,0,0];[p.y,p.m,p.d].forEach(function(x){c[SJ_ES[x.s]]++;c[SJ_EB[x.b]]++;});return c;}
      var ca=cnt6(a),cb=cnt6(b),fill=0;
      for(var i=0;i<5;i++){if(ca[i]===0&&cb[i]>=2)fill++;if(cb[i]===0&&ca[i]>=2)fill++;}
      if(fill>=2){sc+=10;out.push(["오행 보완","서로 없는 오행을 상대가 넉넉히 갖고 있어 — 함께 있을 때 완성되는 보완형."]);}
      else if(fill===1){sc+=5;out.push(["오행 보완","부족한 오행 하나를 상대가 채워줍니다."]);}
      else{out.push(["오행 구성","오행 구성이 비슷 — 닮아서 편하지만 약점도 같이 겹칠 수 있어요."]);}
      // 4. 일지 합충 (배우자궁)
      var da=a.d.b,db=b.d.b,dd=Math.abs(da-db);
      if(da%4===db%4&&da!==db){sc+=8;out.push(["배우자궁 삼합","일지(배우자 자리)끼리 삼합 — 일상 속 호흡이 잘 맞습니다."]);}
      else if(da+db===13||(da===0&&db===1)||(da===1&&db===0)){sc+=8;out.push(["배우자궁 육합","일지끼리 육합 — 살 맞대고 사는 궁합이 특히 좋습니다."]);}
      else if(dd===6){sc-=8;out.push(["배우자궁 충","일지끼리 충 — 애정과 별개로 생활 습관 충돌이 잦을 수 있습니다."]);}
      return [Math.max(35,Math.min(99,sc)),out];
    }
    function go(){
      var av=el.querySelector("#a").value.split("-"),bv=el.querySelector("#b").value.split("-");
      if(av.length<3||bv.length<3)return;
      savePrefs({birth:el.querySelector("#a").value,partnerBirth:el.querySelector("#b").value});
      track("fortune_view",{tool:"gunghap"});
      var A=sjPillars(+av[0],+av[1],+av[2],null,0,false),B=sjPillars(+bv[0],+bv[1],+bv[2],null,0,false);
      var r=pts(A,B),sc=r[0],rows=r[1];
      var grade=sc>=85?"천생연분":sc>=72?"좋은 인연":sc>=58?"노력형 인연":"신중한 인연";
      // 축별 점수 — 각 항목이 어디서 왔는지 보이도록 분해
      function has(k){return rows.some(function(x){return x[0].indexOf(k)>=0;});}
      var attract=sc+(has("천간합")?10:0)+(has("긴장")?4:-2);          // 끌림: 일간 관계가 좌우
      var stable=sc+(has("삼합")||has("육합")?8:0)-(has("충")?10:0);   // 안정: 띠 합충
      var talk=sc+(has("상생")?8:0)-(has("긴장")?12:0);                 // 소통: 일간 십성
      var life=sc+(has("배우자궁 삼합")||has("배우자궁 육합")?10:0)-(has("배우자궁 충")?12:0); // 생활: 일지
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
      '<div class="tf-id">'+SJ_S[A.d.s]+' 일간 × '+SJ_S[B.d.s]+' 일간 — 두 사람의 명식 비교</div>'+
      '<div class="tf-hl">'+SJ_TTI[A.y.b]+'띠 × '+SJ_TTI[B.y.b]+'띠 — '+grade+'. '+topAx[0]+'이 가장 강한 축.</div>'+
      '<div class="out" style="margin-top:16px"><div class="k">'+SJ_TTI[A.y.b]+'띠 '+SJ_S[A.d.s]+'일간 ♥ '+SJ_TTI[B.y.b]+'띠 '+SJ_S[B.d.s]+'일간</div>'+
      '<div class="v">'+sc+'<small>점 · '+grade+'</small></div></div>'+
      '<div class="sj-bars">'+subs.map(function(x){return gbar(x[0],x[1]);}).join("")+'</div>'+
      '<div class="gh-pair">'+zoCard(A.y.b,"나")+zoCard(B.y.b,"상대")+'</div>'+
      rows.map(function(x){return '<div class="sj-sec"><h3>'+x[0]+'</h3><p>'+x[1]+'</p></div>';}).join("")+
      '<div class="sj-sec"><h3>오행 구성 비교</h3><p>여섯 글자(연·월·일주)에서 뽑은 오행 개수입니다. 앞이 나, 뒤가 상대예요.</p>'+
      '<div class="chips" style="margin-top:10px">'+SJ_EL.map(function(n,i){
        return '<span class="chip el-'+n+'">'+n+' '+elA[i]+' : '+elB[i]+'</span>';}).join("")+'</div>'+
      '<p style="font-size:12.5px;color:var(--muted);margin-top:10px;line-height:1.7">한쪽이 0인 오행을 상대가 둘 이상 갖고 있으면 서로를 채워주는 보완 관계입니다. 반대로 같은 오행이 양쪽 다 많으면 성향이 닮아 편한 대신 약점도 함께 겹칩니다.</p></div>'+
      '<div class="sj-sec"><h3>이 조합에게</h3><p>'+advice+'</p></div>'+
      shareBtn()+
      '<p class="note">일간 천간합, 띠·일지의 삼합·육합·충, 오행 보완을 종합한 정통 명리 궁합입니다. 끌림은 일간 관계, 안정은 띠 합충, 소통은 십성, 생활은 일지(배우자궁)에서 나옵니다. 시각까지 넣은 정밀 궁합은 사주팔자 만세력에서 각자 명식을 확인해보세요. 참고용.</p>';
      bindShare(el,"사주 궁합","우리 궁합 "+sc+"점 · "+grade+" ("+SJ_TTI[A.y.b]+"띠 ♥ "+SJ_TTI[B.y.b]+"띠). 동네보살에서 확인:");askFx(el,{score:sc,grade:grade});}
    askWire(el,go,["두 사람의 명식을 세운다","일간끼리 견주어 본다","일지의 합충을 본다"],"두 사람 것을 아직 안 물어봤네.");birthDial(el,"#a");birthDial(el,"#b");}});