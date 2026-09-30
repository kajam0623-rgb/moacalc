TOOLS.push({id:"tojeong",cat:"재미·운세",icon:"",name:"토정비결",desc:"음력 생일로 뽑는 한 해 144괘",render:function(el){
    function tjCalc(ly, lm, ld, Y, K, gz) {
      var SS = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5], SB = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4];          // 선천수
      var JS = [11, 10, 9, 8, 7, 11, 10, 9, 8, 7], JB = [9, 11, 8, 8, 11, 7, 7, 11, 10, 10, 11, 9]; // 중천수
      var ys = ((Y - 4) % 10 + 10) % 10, yb = ((Y - 4) % 12 + 12) % 12;
      var age = Y - ly + 1, taese = JS[ys] + JB[yb];
      var cal = new K(), days = cal.getLunarMonthDays(Y, lm, false);
      var ms = ((ys % 5) * 2 + 2 + lm - 1) % 10, mb = (lm + 1) % 12, wolgeon = SS[ms] + SB[mb];
      var d = Math.min(ld, days); cal.setLunarDate(Y, lm, d, false);
      var s = cal.getSolarCalendar(), g = gz(s.year, s.month, s.day), iljin = SS[g[0]] + JB[g[1]];
      var up = (age + taese) % 8 || 8, mid = (days + wolgeon) % 6 || 6, low = (d + iljin) % 3 || 3;
      return { code: "" + up + mid + low, age: age, ys: ys, yb: yb, taese: taese, days: days, ms: ms, mb: mb, wolgeon: wolgeon,
        ds: g[0], db: g[1], iljin: iljin, clamp: d !== ld, solar: s };
    }
    var MON=["정월","이월","삼월","사월","오월","유월","칠월","팔월","구월","시월","동짓달","섣달"];
    var nowD=new Date(),Y0=nowD.getFullYear(),YS=[Y0,Y0+1],defY=nowD.getMonth()>=9?Y0+1:Y0;
    el.innerHTML='<label>어느 해</label><select id="yr">'+YS.map(function(y){var i=((y-4)%10+10)%10,j=((y-4)%12+12)%12;return '<option value="'+y+'"'+(y===defY?" selected":"")+'>'+y+' '+SJ_S[i]+SJ_B[j]+'년</option>';}).join("")+'</select>'+
    '<label for="d" style="margin-top:12px">생년월일 (양력 · 음력이면 아래에서 바꿔 넣기)</label><input type="date" id="d" value="1990-03-15">'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">'+ASK_LABEL+'</button>'+
    '<div id="out"></div>';
    function lib(){if(window.KoreanLunarCalendar||document.getElementById("vendor-lunar"))return;
      var sc=document.createElement("script");sc.id="vendor-lunar";sc.src="vendor-lunar.js";document.head.appendChild(sc);}
    lib();
    var gz=function(y,m,d){var p=sjPillars(y,m,d,null,0,false);return [p.d.s,p.d.b];};
    var cache={};
    function data(code){return cache[code]||(cache[code]=fetch("tj/"+code+".json").then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}));}
    function go(){
      var out=el.querySelector("#out"),dv=el.querySelector("#d").value.split("-");if(dv.length<3)return;
      var K=window.KoreanLunarCalendar;
      if(!K){lib();out.innerHTML='<p class="note">음력 달력을 불러오는 중이네. 잠깐 뒤에 다시 눌러 주게.</p>';return;}
      track("fortune_view",{tool:"tojeong"});
      var Y=+el.querySelector("#yr").value,cal=new K();
      cal.setSolarDate(+dv[0],+dv[1],+dv[2]);var L=cal.getLunarCalendar();
      var r=tjCalc(L.year,L.month,L.day,Y,K,gz);
      var tn=new K();tn.setSolarDate(nowD.getFullYear(),nowD.getMonth()+1,nowD.getDate());var TL=tn.getLunarCalendar(),cur=TL.year===Y?TL.month:0;
      out.innerHTML='<p class="note">괘를 펼치는 중이네…</p>';
      data(r.code).then(function(g){
        var yg=SJ_S[r.ys]+SJ_B[r.yb],mg=SJ_S[r.ms]+SJ_B[r.mb],dg=SJ_S[r.ds]+SJ_B[r.db];
        var order=[];for(var i=1;i<=12;i++)order.push(i);if(cur)order=[cur].concat(order.filter(function(x){return x!==cur;}));
        out.innerHTML=
        '<div class="tf-hl">'+Y+'년 자네 괘는 '+r.code+', '+g.title+'</div>'+
        '<div class="out" style="margin-top:16px"><div class="k">'+Y+' '+yg+'년 토정비결 · 음력 '+L.year+'년 '+L.month+'월'+(L.intercalation?'(윤)':'')+' '+L.day+'일생</div>'+
        '<div class="v">'+r.code+'<small>괘</small></div><div class="s">'+g.title+'</div></div>'+
        bosalSay(g.grade==="흉"?"worry":g.grade==="길"?"newyear":"scroll",g.grade==="길"?"좋은 괘가 나왔네. 그래도 들뜨지 말고 달마다 짚은 대로 가게.":g.grade==="흉"?"차분히 다져 갈 대목이 있는 괘일세. 걱정할 것 없네. 미리 알고 준비하면 오히려 든든하지.":"좋고 궂은 게 섞인 괘야. 달마다 흐름을 보고 고삐를 쥐게.")+
        '<div class="sj-sec"><h3>'+Y+'년 총운</h3><p>'+g.chongun+'</p></div>'+
        order.map(function(m){return '<div class="sj-sec"><h3>'+(m===cur?'이번 달 — ':'')+'음력 '+MON[m-1]+'</h3><p>'+g.months[m]+'</p></div>';}).join("")+
        '<div class="sj-sec"><h3>괘를 세운 근거</h3><p>상괘 '+r.code[0]+' = (세는 나이 '+r.age+' + 태세수 '+r.taese+' · '+yg+'년) ÷ 8의 나머지<br>'+
        '중괘 '+r.code[1]+' = ('+Y+'년 음력 '+L.month+'월 날수 '+r.days+' + 월건수 '+r.wolgeon+' · '+mg+'월) ÷ 6의 나머지<br>'+
        '하괘 '+r.code[2]+' = (음력 생일 '+Math.min(L.day,r.days)+' + 일진수 '+r.iljin+' · '+dg+'일) ÷ 3의 나머지<br>나머지가 0이면 8·6·3을 씁니다.'+
        (r.clamp?'<br>'+Y+'년 음력 '+L.month+'월은 29일까지라 30일생은 29일로 당겨 셉니다(구현 관례).':'')+
        (L.intercalation?'<br>윤달생은 평달로 봅니다(통례).':'')+'</p></div>'+
        shareBtn()+
        '<p class="note">토정비결은 조선 후기부터 전해 오는 한 해 신수 풀이입니다. 괘를 세우는 방법은 전통 작괘법(세는 나이·태세수, 생월 날수·월건수, 생일·일진수)을 그대로 따르고, 음력은 한국천문연구원 기준으로 계산합니다. 144괘의 풀이 문장은 전통 괘의 길흉과 상징을 바탕으로 동네보살이 새로 썼습니다. 참고용.</p>';
        bindShare(el,Y+" 토정비결",Y+"년 내 토정비결은 "+r.code+"괘 — "+g.title+". 동네보살에서 확인:");
        saveScore(el,Y+"토정비결",Y+" 토정비결","한 해 신수를 세운 괘",r.code,"토정비결 괘",g.title,g.chongun,g.grade==="흉"?"worry":g.grade==="길"?"newyear":"scroll");
        askFx(el,{grade:g.grade==="흉"?"주의":g.grade==="평"?"평온":"길"});
      }).catch(function(){out.innerHTML='<p class="note">괘 풀이를 불러오지 못했네. 잠시 뒤 다시 눌러 주게.</p>';});}
    askWire(el,go,["음력 생일을 찾는다","그해 달력에서 태세·월건·일진을 센다","상·중·하괘를 세운다"],"올해 괘를 아직 안 뽑았네.");birthDial(el,"#d");}});