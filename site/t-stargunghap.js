TOOLS.push({id:"stargunghap",cat:"재미·운세",icon:"",name:"별자리 궁합",desc:"12별자리 커플 궁합",render:function(el){
    // 원소 관계 [점수, 이름, 해설]
    var ELREL={
    same:[86,"같은 원소","서로를 설명할 필요가 없는 사이일세. 같은 말로 이야기하고 같은 것에 웃지. 다만 서툰 데도 똑같이 겹치니, 둘 다 미뤄 두던 일은 이번에 함께 해 보게."],
    friend:[82,"서로 돕는 원소","불에 바람이 붙듯, 흙에 물이 스미듯 서로를 키워 주는 사이일세. 움직이는 방식은 달라도 가는 방향이 맞아서 함께 있을 때 각자보다 커지네."],
    tense:[58,"결이 다른 원소","물과 불처럼 타고난 바탕이 다른 사이일세. 처음엔 그 다름이 신선하고, 지내다 보면 속도와 온도를 맞춰 가는 재미가 생기네. 서로를 고치려 하지 말고 알아 가 보게."]};
    function elRel(a,b){var ea=a%4,eb=b%4;
      if(ea===eb)return "same";
      if((ea===0&&eb===2)||(ea===2&&eb===0)||(ea===1&&eb===3)||(ea===3&&eb===1))return "friend"; // 불-공기, 흙-물
      return "tense";}
    el.innerHTML='<div class="r2"><div><label>내 별자리</label><select id="a">'+
    ST_KO.map(function(n,i){return '<option value="'+i+'"'+(i===4?' selected':'')+'>'+ST_SYM[i]+' '+n+' ('+ST_RANGE[i]+')</option>';}).join("")+'</select></div>'+
    '<div><label>상대 별자리</label><select id="b">'+
    ST_KO.map(function(n,i){return '<option value="'+i+'"'+(i===8?' selected':'')+'>'+ST_SYM[i]+' '+n+' ('+ST_RANGE[i]+')</option>';}).join("")+'</select></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">'+ASK_LABEL+'</button>'+
    '<div id="out"></div>';
    // 깊이 있는 풀이 원고(sg/deep.json) — 결과가 그려진 뒤에 도착해도 자리(#sgdeep)의 예전 글을 바꿔 끼운다
    var SGD=null,sgLast=null;
    function fillSg(){var h=el.querySelector("#sgdeep");if(!h||!SGD||!sgLast)return;h.innerHTML=sgDeep(sgLast.a,sgLast.b,SGD).secs.map(hsSecHtml).join("");}
    if(typeof fetch==="function")fetch("sg/deep.json").then(function(r){return r.ok?r.json():null;}).then(function(j){if(j){SGD=j;fillSg();}}).catch(function(){});
    function go(){
      var a=+el.querySelector("#a").value,b=+el.querySelector("#b").value;
      track("fortune_view",{tool:"stargunghap"});
      sgLast={a:a,b:b};
      var er=elRel(a,b),E=ELREL[er];
      var k=(b-a+12)%12,dist=Math.min(k,12-k),A=ST_ASP[dist];
      // 수호성 친화: 서로의 수호성이 상대 원소의 지배성 목록에 있으면 가점
      var rA=ST_RULER[a],rB=ST_RULER[b];
      var rFit=(ST_ELE_RULERS[ST_ELE[b%4]].indexOf(rA)>=0?1:0)+(ST_ELE_RULERS[ST_ELE[a%4]].indexOf(rB)>=0?1:0);
      var sc=Math.round(E[0]*0.4+A[0]*0.4+(60+rFit*16)*0.2);
      sc=Math.max(35,Math.min(99,sc));
      var grade=sc>=85?"천생연분":sc>=72?"좋은 인연":sc>=58?"노력형 인연":"신중한 인연";
      var sv=subBal(sc,[(dist===0||dist===4?6:dist===3?-4:2),(er==="same"?6:er==="friend"?4:-6),(er==="tense"?-6:4),(rFit===2?8:rFit===1?4:-2)]),
        subs=[["끌림",sv[0]],["대화",sv[1]],["일상",sv[2]],["롱런",sv[3]]];
      var rNote=rFit===2?"두 사람의 수호성("+rA+"·"+rB+")이 서로의 원소와 결이 맞아, 오래 갈수록 편해지는 조합입니다."
        :rFit===1?"한쪽 수호성은 상대 원소와 결이 맞고 한쪽은 다릅니다. 맞춰주는 쪽이 지치지 않게 표현을 아끼지 마세요."
        :"수호성("+rA+"·"+rB+")의 결이 서로 달라, 연애 초반보다 시간이 지나며 이해가 쌓이는 형태입니다.";
      el.querySelector("#out").innerHTML=
      '<div class="tf-id">'+ST_ELE[a%4]+' × '+ST_ELE[b%4]+' · '+sgAng(dist)+'</div>'+
      '<div class="tf-hl">'+ST_ELE[a%4]+josa(ST_ELE[a%4],"와/과")+' '+ST_ELE[b%4]+josa(ST_ELE[b%4],"가/이")+' 만나면 — '+grade+'.</div>'+
      '<div class="out" style="margin-top:16px"><div class="k">'+ST_SYM[a]+' '+ST_KO[a]+' ♥ '+ST_SYM[b]+' '+ST_KO[b]+'</div>'+
      '<div class="v">'+sc+'<small>점 · '+grade+'</small></div><div class="s">'+E[1]+' · '+SG_ANG[dist][0]+'</div></div>'+
      '<div class="sj-bars">'+subs.map(function(x){return rateBar(x[0],x[1]);}).join("")+'</div>'+
      '<div class="gh-pair">'+stCard(a,"나")+stCard(b,"상대")+'</div>'+
      '<div id="sgdeep"><div class="sj-sec"><h3>원소 궁합 — '+ST_ELE[a%4]+' × '+ST_ELE[b%4]+'</h3><p>'+E[2]+'</p></div>'+
      '<div class="sj-sec"><h3>각도 관계 — '+A[1]+'</h3><p>두 별자리는 황도에서 '+(dist*30)+'° 떨어져 있습니다. '+A[2]+'</p></div>'+
      '<div class="sj-sec"><h3>수호성 궁합</h3><p>'+ST_KO[a]+'는 '+rA+', '+ST_KO[b]+'는 '+rB+josa(rB,"가/이")+' 다스립니다. '+rNote+'</p></div>'+
      '<div class="sj-sec"><h3>이 조합에게</h3><p>'+A[5]+' '+(er==="tense"?"기질이 다른 만큼 상대의 방식을 번역해서 듣는 연습이 필요합니다. 다름은 결함이 아니라 각도의 문제입니다.":"결이 맞는 조합일수록 관계를 당연하게 여기기 쉽습니다. 좋은 이유를 가끔 말로 확인해 주세요.")+'</p></div></div>'+
      shareBtn()+
      '<p class="note">별자리의 원소(불·흙·공기·물), 황도 각도(합·섹스타일·스퀘어·트라인·오포지션), 수호성 친화를 종합한 서양 점성술 궁합입니다. 태양 별자리 기준이며, 정밀 궁합은 달·상승궁까지 봐야 합니다. 참고용.</p>';
      fillSg();
      bindShare(el,"별자리 궁합",ST_KO[a]+" ♥ "+ST_KO[b]+" 궁합 "+sc+"점 · "+grade+". 동네보살에서 확인:");
      saveScore(el,"별자리궁합","별자리 궁합",ST_KO[a]+" ♥ "+ST_KO[b],sc,grade,ST_ELE[a%4]+josa(ST_ELE[a%4],"와/과")+" "+ST_ELE[b%4]+josa(ST_ELE[b%4],"가/이")+" 만나면 — "+grade,SGD?SGD.pair[Math.min(a,b)+"-"+Math.max(a,b)].core:E[2]);askFx(el,{score:sc,grade:grade,pose:sc>=60?"heart":"smile",say:sc>=85?"두 별이 참 잘 어울리네! 이 인연 아껴 두게.":sc>=72?"결이 좋은 사이일세. 이야기만 자주 나누면 오래가네.":sc>=58?"서로 맞춰 가는 재미가 있는 사이야. 아래 '이렇게 하면 더 좋아지네'를 보게.":"다름이 매력인 사이일세. 아래 '이렇게 하면 더 좋아지네'가 길잡이가 되어 줄 걸세."});}
    askWire(el,go,["두 사람의 별자리를 세운다","불·흙·공기·물 원소를 견준다","하늘에서의 거리를 재어 본다"],"두 사람 것을 아직 안 물어봤네.");
    }});