TOOLS.push({id:"zodiacfortune",cat:"재미·운세",icon:"",name:"띠별 운세",desc:"12띠 오늘의 운세",render:function(el){
    // 오늘 일지와 내 띠(연지)의 관계 → [기본점수, 총운, 재물·일, 애정, 조언, [애정·재물·직장·건강]]
    var ZR={
    "삼합":[88,"자네 띠와 오늘 지지가 삼합을 이루었네. 혼자 끙끙대던 일에 사람이 붙는 날일세.","협업이든 소개든 계약이든 다 유리해. 오늘은 부탁하면 대체로 열리네.","만남과 화해에 좋은 날이야. 먼저 연락하는 쪽이 이기네.","오늘 도와준 사람 이름은 적어두게. 이 인연은 한 번으로 끝나지 않아.",[8,6,8,2]],
    "육합":[84,"자네 띠와 오늘 지지가 육합일세. 걸리는 데 없이 부드럽게 맞물리는 하루야.","조율이든 정산이든 마무리든 술술 풀리네.","오래 미뤄둔 이야기를 꺼내기 좋은 날일세.","오늘은 무리할 것 없네. 흐름에 맡기고 한 가지만 확실히 끝내게.",[8,4,4,4]],
    "복음":[74,"오늘 지지가 자네 띠와 똑같네. 기운이 두 배로 진해지니 좋고 나쁨도 그만큼 선명해지는 날일세.","익숙한 데서는 강하네. 대신 새 영역은 오늘 손대지 말게.","자네와 닮은 사람에게 끌리는 날이야. 닮은 만큼 부딪히기도 쉽지.","오늘은 자네를 다시 확인하는 날일세. 다만 과하면 그게 고집이 되네.",[0,0,4,-2]],
    "평":[72,"굴곡 없이 평평한 하루일세. 눈에 띄는 일이 없는 대신 손해 볼 일도 없어.","하던 대로 이어가기 좋은 날이야.","무난하네. 서두르지만 않으면 어긋날 일도 없어.","새로 벌이기보다 정리하기 좋은 날일세.",[0,2,2,2]],
    "해":[60,"자네 띠와 오늘 지지가 해(害)로 만났네. 사소한 어긋남이 감정을 건드리기 쉬운 날일세.","약속 시간이나 금액 같은 작은 숫자에서 착오가 나. 두 번씩 확인하게.","말투 때문에 오해가 생기는 날이야. 문자보다 목소리로 하게.","오늘의 서운함은 대개 사실 확인 한 번이면 풀리네. 담아두지 말게.",[-8,-4,-4,-2]],
    "형":[56,"자네 띠와 오늘 지지가 형(刑)일세. 밀어붙일수록 마찰이 커지는 날이야.","서류든 계약이든 법적인 문제든 다툼이 나기 쉬워. 도장은 내일 찍게.","날 선 말이 오가네. 이기려 들지 말게.","오늘 참으면 내일 자네가 유리해져. 정면충돌은 오늘의 방식이 아닐세.",[-8,-6,-8,-8]],
    "충":[52,"자네 띠와 오늘 지지가 충(沖)일세. 정해둔 게 흔들리고 변수가 튀어나오는 날이야.","이동이며 변경이며 취소가 잦아. 여유 시간을 미리 빼두게.","감정 기복이 큰 날일세. 중요한 대화는 하루 미루게.","충은 나쁜 게 아니라 움직이는 기운일세. 어차피 움직일 거라면 자네가 먼저 정하게.",[-10,-8,-6,-10]]};
    el.innerHTML='<div class="r2"><div><label>태어난 해 (양력)</label><input type="number" id="y" value="'+((loadPrefs().birth||"1990-03-15").split("-")[0])+'" min="1900" max="2100"></div>'+
    '<div><label>또는 띠 직접 선택</label><select id="s"><option value="-1">태어난 해로 자동 판정</option>'+
    SJ_TTI.map(function(n,i){return '<option value="'+i+'">'+n+'띠</option>';}).join("")+'</select></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">'+ASK_LABEL+'</button>'+
    '<div id="out"></div>';
    function zrel(b,t){
      if(Math.abs(b-t)===6)return"충";
      var H=[[0,3],[2,5],[5,8],[8,2],[1,10],[10,7],[7,1]],i;
      for(i=0;i<H.length;i++)if((H[i][0]===b&&H[i][1]===t)||(H[i][0]===t&&H[i][1]===b))return"형";
      var Y=[[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]];
      for(i=0;i<Y.length;i++)if((Y[i][0]===b&&Y[i][1]===t)||(Y[i][0]===t&&Y[i][1]===b))return"해";
      if(b===t)return"복음";
      if(b%4===t%4)return"삼합";
      if(sjYukhap(b)===t)return"육합";
      return"평";}
    function zbar(n,v){return rateBar(n,v);}
    function go(){
      var sel=+el.querySelector("#s").value,b;
      if(sel>=0)b=sel;else{var y=+el.querySelector("#y").value;if(!y)return;b=((y-4)%12+12)%12;}
      track("fortune_view",{tool:"zodiacfortune"});
      var now=new Date(),ty=now.getFullYear(),tm=now.getMonth()+1,td=now.getDate();
      var today=sjPillars(ty,tm,td,null,0,false),tb=today.d.b;
      var rel=zrel(b,tb),Z=ZR[rel],score=Z[0];
      // 오늘 천간이 내 띠 본기 천간에 대해 갖는 십성 — 하루의 성격을 한 겹 더한다
      var tg=sjTenGod(SJ_BMAIN[b],today.d.s);
      var TG={"비견":"내 힘으로 밀고 가는","겁재":"지출이 새기 쉬운","식신":"표현과 먹을 복이 좋은","상관":"말이 앞서기 쉬운","편재":"큰돈이 움직이는","정재":"성실함이 돈이 되는","편관":"압박과 도전이 따르는","정관":"원칙이 통하는","편인":"생각이 깊어지는","정인":"귀인과 문서의"}[tg];
      score=Math.max(35,Math.min(98,score+({"식신":4,"정재":4,"정관":3,"정인":4,"편재":2,"비견":0,"상관":-3,"편인":-2,"겁재":-5,"편관":-5}[tg]||0)));
      var grade=score>=85?"대길":score>=75?"길":score>=60?"평온":"주의";
      var sub=Z[5].map(function(v){return Math.max(30,Math.min(99,score+v));});
      var luckEl=(SJ_EB[b]+4)%5,L=SJ_LUCK[luckEl],hb=sjYukhap(tb);
      var un=sjUnseong(SJ_BMAIN[b],tb); // 오늘 지지가 내 띠 본기 천간에 갖는 십이운성
      var y26=(b===6)?"2026 병오년은 태세와 같은 말띠 해일세. 존재감이 커지는 대신 과열도 쉬우니, 올해는 속도 조절이 관건이야."
        :(b===0)?"2026 병오년 태세 오(午)와 자오충일세. 이동이든 이직이든 이사든 변화가 예고된 해야. 가만히 당하지 말고 자네가 먼저 계획에 넣게."
        :(b===2||b===10)?"2026 병오년 태세 오(午)와 인오술 삼합일세. 사람과 기회가 붙는 한 해야."
        :(b===7)?"2026 병오년 태세 오(午)와 오미 육합일세. 관계도 계약도 부드럽게 풀리는 한 해야."
        :(b===1)?"2026 병오년 태세 오(午)와 축오 해(害)일세. 작은 어긋남이 쌓이지 않게 그때그때 털고 가게."
        :"2026 병오년 태세 오(午)와는 뚜렷한 합충이 없네. 큰 변동 없이 자네 걸음대로 갈 수 있는 한 해일세.";
      el.querySelector("#out").innerHTML=
      '<div class="out" style="margin-top:16px"><div class="k">'+ty+'.'+String(tm).padStart(2,"0")+'.'+String(td).padStart(2,"0")+' · 오늘 일진 '+SJ_SH[today.d.s]+SJ_BH[tb]+'('+SJ_S[today.d.s]+SJ_B[tb]+')</div>'+
      '<div class="v">'+score+'<small>점 · '+grade+'</small></div><div class="s">'+SJ_TTI[b]+'띠 · 오늘 지지와 <b>'+rel+'</b></div></div>'+
      '<div class="sj-bars">'+zbar("애정",sub[0])+zbar("재물",sub[1])+zbar("직장",sub[2])+zbar("건강",sub[3])+'</div>'+
      zoCard(b)+
      '<div class="sj-sec"><h3>오늘의 총운</h3><p>'+(ART_HAP[rel]?conceptArt(ART_HAP[rel],rel):"")+Z[1]+'<br><br>거기에 오늘 천간이 '+SJ_TTI[b]+'띠에게 '+tg+'이라, '+TG+' 결도 한 겹 얹혔네.</p></div>'+
      '<div class="sj-sec"><h3>재물·일</h3><p>'+Z[2]+'</p></div>'+
      '<div class="sj-sec"><h3>애정운</h3><p>'+Z[3]+'</p></div>'+
      '<div class="sj-sec"><h3>조언</h3><p>'+Z[4]+'</p></div>'+
      '<div class="sj-sec"><h3>오늘의 기운 — 십이운성 '+un+'</h3><p>'+conceptArt(ART_UN[un],un)+'오늘 지지 '+SJ_B[tb]+'('+SJ_BH[tb]+')는 '+SJ_TTI[b]+'띠의 본기 '+SJ_S[SJ_BMAIN[b]]+'에게 '+un+'의 자리일세. 하루 동안 몸으로 느끼는 기운의 결이 여기서 나오네.<br><br>'+SJ_UN_DESC[un]+'</p></div>'+
      '<div class="sj-sec"><h3>오늘의 행운</h3><div class="chips"><span class="chip">색 '+L[0]+'</span><span class="chip">방위 '+L[1]+'</span><span class="chip">숫자 '+L[2]+'</span><span class="chip">시간 '+SJ_HOUR[hb]+'</span></div>'+
      '<p style="font-size:12.5px;color:var(--muted);margin-top:10px;line-height:1.7">'+SJ_TTI[b]+'띠는 '+SJ_EL[SJ_EB[b]]+' 기운일세. 그걸 생해 주는 '+SJ_EL[luckEl]+josa(SJ_EL[luckEl],"가/이")+' 오늘의 보완이라, '+L[0]+' 계열과 '+L[1]+' 방향이 자네를 돕네. 시간은 오늘 일지와 육합이 되는 '+SJ_B[hb]+'('+SJ_BH[hb]+')시야.</p></div>'+
      '<div class="sj-sec"><h3>2026 병오년 한 해</h3><p>'+y26+'</p></div>'+
      shareBtn()+
      '<p class="note">띠(연지)와 오늘 일진 지지의 삼합·육합·충·형·해 관계로 푸는 전통 방식입니다. 사주에서 띠는 입춘(2월 4일경)에 바뀌므로, 1~2월 초 출생이라면 앞 해의 띠일 수 있습니다. 참고용.</p>';
      bindShare(el,"띠별 운세",SJ_TTI[b]+"띠 오늘의 운세 "+score+"점 · "+grade+". 동네보살에서 확인:");askFx(el,{score:score,grade:grade});}
    askWire(el,go,["자네 띠부터 잡는다","오늘 지지와 맞춰 본다","삼합·육합·충을 짚는다"],"아직 안 물어봤네.");
    }});