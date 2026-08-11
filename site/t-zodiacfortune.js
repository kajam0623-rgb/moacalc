TOOLS.push({id:"zodiacfortune",cat:"재미·운세",icon:"",name:"띠별 운세",desc:"12띠 오늘의 운세",render:function(el){
    // 오늘 일지와 내 띠(연지)의 관계 → [기본점수, 총운, 재물·일, 애정, 조언, [애정·재물·직장·건강]]
    var ZR={
    "삼합":[88,"내 띠와 오늘 지지가 삼합을 이룹니다. 혼자 애쓰던 일에 사람이 붙는 날입니다.","협업·소개·계약에 유리합니다. 부탁하면 대체로 열립니다.","만남과 화해에 좋습니다. 먼저 연락하는 쪽이 유리합니다.","오늘 도와준 사람의 이름을 기억해두세요. 이 인연은 한 번으로 끝나지 않습니다.",[8,6,8,2]],
    "육합":[84,"내 띠와 오늘 지지가 육합입니다. 마찰 없이 부드럽게 맞물리는 하루입니다.","조율·정산·마무리가 술술 풀립니다.","오래 미뤄둔 대화를 꺼내기 좋은 날입니다.","무리하지 않아도 되는 날입니다. 흐름에 맡기고 한 가지만 확실히 끝내세요.",[8,4,4,4]],
    "복음":[74,"오늘 지지가 내 띠와 같습니다. 기운이 두 배로 진해지는 만큼 좋고 나쁨도 선명해집니다.","익숙한 분야에서는 강하지만 새 영역은 오늘 손대지 마세요.","같은 성향의 사람에게 끌립니다. 닮은 만큼 부딪히기도 쉽습니다.","오늘은 나를 다시 확인하는 날입니다. 과하면 고집이 됩니다.",[0,0,4,-2]],
    "평":[72,"큰 굴곡 없는 평이한 하루입니다. 눈에 띄는 일은 없지만 손해도 없습니다.","하던 일을 그대로 유지하기 좋습니다.","무난합니다. 서두르지 않으면 어긋날 일도 없습니다.","오늘은 새로 벌이기보다 정리하기 좋은 날입니다.",[0,2,2,2]],
    "해":[60,"내 띠와 오늘 지지가 해(害)로 만납니다. 사소한 어긋남이 감정을 건드리기 쉽습니다.","약속 시간·금액 같은 작은 숫자에서 착오가 납니다. 두 번 확인하세요.","말투 때문에 오해가 생깁니다. 문자보다 통화가 낫습니다.","오늘의 서운함은 대개 사실 확인 한 번으로 풀립니다.",[-8,-4,-4,-2]],
    "형":[56,"내 띠와 오늘 지지가 형(刑)입니다. 밀어붙일수록 마찰이 커지는 날입니다.","서류·계약·법적인 문제에서 다툼이 생기기 쉽습니다. 도장은 내일.","날 선 말이 오갑니다. 이기려 하지 마세요.","오늘 참으면 내일 유리해집니다. 정면충돌은 오늘의 방식이 아닙니다.",[-8,-6,-8,-8]],
    "충":[52,"내 띠와 오늘 지지가 충(沖)입니다. 예정이 흔들리고 변수가 튀어나오는 날입니다.","이동·변경·취소가 잦습니다. 여유 시간을 미리 빼두세요.","감정 기복이 큽니다. 중요한 대화는 하루 미루세요.","충은 나쁜 것이 아니라 움직이는 기운입니다. 어차피 움직일 거라면 내가 먼저 정하세요.",[-10,-8,-6,-10]]};
    el.innerHTML='<div class="r2"><div><label>태어난 해 (양력)</label><input type="number" id="y" value="'+((loadPrefs().birth||"1990-03-15").split("-")[0])+'" min="1900" max="2100"></div>'+
    '<div><label>또는 띠 직접 선택</label><select id="s"><option value="-1">태어난 해로 자동 판정</option>'+
    SJ_TTI.map(function(n,i){return '<option value="'+i+'">'+n+'띠</option>';}).join("")+'</select></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">띠별 운세 보기</button>'+
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
      var y26=(b===6)?"2026 병오년은 태세와 같은 말띠 해입니다. 존재감이 커지는 대신 과열도 쉬우니 속도 조절이 관건입니다."
        :(b===0)?"2026 병오년 태세 오(午)와 자오충입니다. 이동·이직·이사 같은 변화가 예고된 해이니 수동적으로 겪기보다 먼저 계획에 넣으세요."
        :(b===2||b===10)?"2026 병오년 태세 오(午)와 인오술 삼합입니다. 사람과 기회가 붙는 한 해입니다."
        :(b===7)?"2026 병오년 태세 오(午)와 오미 육합입니다. 관계와 계약이 부드럽게 풀리는 한 해입니다."
        :(b===1)?"2026 병오년 태세 오(午)와 축오 해(害)입니다. 작은 어긋남이 쌓이지 않도록 그때그때 정리하세요."
        :"2026 병오년 태세 오(午)와 특별한 합충이 없습니다. 큰 변동 없이 내 페이스대로 갈 수 있는 한 해입니다.";
      el.querySelector("#out").innerHTML=
      '<div class="out" style="margin-top:16px"><div class="k">'+ty+'.'+String(tm).padStart(2,"0")+'.'+String(td).padStart(2,"0")+' · 오늘 일진 '+SJ_SH[today.d.s]+SJ_BH[tb]+'('+SJ_S[today.d.s]+SJ_B[tb]+')</div>'+
      '<div class="v">'+score+'<small>점 · '+grade+'</small></div><div class="s">'+SJ_TTI[b]+'띠 · 오늘 지지와 <b>'+rel+'</b></div></div>'+
      '<div class="sj-bars">'+zbar("애정",sub[0])+zbar("재물",sub[1])+zbar("직장",sub[2])+zbar("건강",sub[3])+'</div>'+
      zoCard(b)+
      '<div class="sj-sec"><h3>오늘의 총운</h3><p>'+Z[1]+' 오늘 천간은 '+SJ_TTI[b]+'띠에게 '+tg+'에 해당해 '+TG+' 하루이기도 합니다.</p></div>'+
      '<div class="sj-sec"><h3>재물·일</h3><p>'+Z[2]+'</p></div>'+
      '<div class="sj-sec"><h3>애정운</h3><p>'+Z[3]+'</p></div>'+
      '<div class="sj-sec"><h3>조언</h3><p>'+Z[4]+'</p></div>'+
      '<div class="sj-sec"><h3>오늘의 기운 — 십이운성 '+un+'</h3><p>'+SJ_UN_DESC[un]+' 오늘 지지 '+SJ_B[tb]+'('+SJ_BH[tb]+')가 '+SJ_TTI[b]+'띠의 본기 '+SJ_S[SJ_BMAIN[b]]+'에게 '+un+'의 자리라, 하루 동안 체감하는 기운의 결이 이렇습니다.</p></div>'+
      '<div class="sj-sec"><h3>오늘의 행운</h3><div class="chips"><span class="chip">색 '+L[0]+'</span><span class="chip">방위 '+L[1]+'</span><span class="chip">숫자 '+L[2]+'</span><span class="chip">시간 '+SJ_HOUR[hb]+'</span></div>'+
      '<p style="font-size:12.5px;color:var(--muted);margin-top:10px;line-height:1.7">'+SJ_TTI[b]+'띠는 '+SJ_EL[SJ_EB[b]]+' 기운입니다. 이를 생해 주는 '+SJ_EL[luckEl]+josa(SJ_EL[luckEl],"가/이")+' 오늘의 보완이라 '+L[0]+' 계열과 '+L[1]+' 방향이 유리합니다. 시간대는 오늘 일지와 육합이 되는 '+SJ_B[hb]+'('+SJ_BH[hb]+')시입니다.</p></div>'+
      '<div class="sj-sec"><h3>2026 병오년 한 해</h3><p>'+y26+'</p></div>'+
      shareBtn()+
      '<p class="note">띠(연지)와 오늘 일진 지지의 삼합·육합·충·형·해 관계로 푸는 전통 방식입니다. 사주에서 띠는 입춘(2월 4일경)에 바뀌므로, 1~2월 초 출생이라면 앞 해의 띠일 수 있습니다. 참고용.</p>';
      bindShare(el,"띠별 운세",SJ_TTI[b]+"띠 오늘의 운세 "+score+"점 · "+grade+". 동네보살에서 확인:");}
    el.querySelector("#go").addEventListener("click",go);
    el.querySelector("#s").addEventListener("change",go);go();}});