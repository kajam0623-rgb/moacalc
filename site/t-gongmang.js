TOOLS.push({id:"gongmang",cat:"재미·운세",icon:"",name:"공망 찾기",desc:"일주로 보는 공망(空亡)",render:function(el){
    // 연지·월지·시지가 공망에 들었을 때 읽는 자리의 뜻(연지=조상·어린 시절, 월지=부모·사회, 시지=자녀·말년)
    var POS=[["연지","조상·어린 시절","조상과 물려받은 것, 어린 시절의 자리가 비었다고 보아, 물려받은 도움보다 스스로 세운 것이 많아지는 쪽으로 읽네."],
      ["월지","부모·사회","부모·형제와 사회, 일의 자리가 비었다고 보아, 조직에서 기대만큼 채워지지 않는 느낌이 들 수 있다고 읽네."],
      ["시지","자녀·말년","자녀와 말년, 일의 결실 자리가 비었다고 보아, 결과를 기다리는 시간이 길어지는 쪽으로 읽네."]];
    el.innerHTML='<label for="d">생년월일 (양력)</label><input type="date" id="d" value="1990-03-15">'+
    '<label for="h" style="margin-top:12px">태어난 시각 (선택)</label><select id="h"><option value="">모름</option>'+sjHourOpts(-1)+'</select>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">'+ASK_LABEL+'</button>'+
    '<div id="out"></div>';
    function nm(b){return SJ_B[b]+"("+SJ_BH[b]+")";}
    // 깊이 있는 풀이 원고(gm/deep.json) — 결과가 그려진 뒤에 도착해도 자리(#gmdeep)의 예전 글을 바꿔 끼운다
    var GMD=null,gmLast=null;
    function fillGm(){var h=el.querySelector("#gmdeep");if(!h||!GMD||!gmLast)return;h.innerHTML=gmDeep(gmLast.P,gmLast.G,gmLast.Y,gmLast.year,GMD).secs.map(hsSecHtml).join("");}
    if(typeof fetch==="function")fetch("gm/deep.json").then(function(r){return r.ok?r.json():null;}).then(function(j){if(j){GMD=j;fillGm();}}).catch(function(){});
    function go(){
      var v=el.querySelector("#d").value.split("-");if(v.length<3)return;
      track("fortune_view",{tool:"gongmang"});
      var hv=el.querySelector("#h").value,P=sjPillars(+v[0],+v[1],+v[2],hv===""?null:+hv,30,true);
      var G=sjGongmang(P.d.s,P.d.b),Y=sjGongmang(P.y.s,P.y.b),ilju=SJ_S[P.d.s]+SJ_B[P.d.b];
      gmLast={P:P,G:G,Y:Y,year:new Date().getFullYear()};
      var slots=[["연지",P.y.b],["월지",P.m.b]].concat(P.h?[["시지",P.h.b]]:[]);
      var hit=slots.filter(function(x){return G.empty.indexOf(x[1])>=0;});
      var hitHtml=hit.length?hit.map(function(x){var q=POS[["연지","월지","시지"].indexOf(x[0])];
        return '<p><b>'+x[0]+' '+nm(x[1])+'</b> — '+q[1]+'<br>'+q[2]+'</p>';}).join("")
        :'<p>연지·월지'+(P.h?'·시지':'')+' 어디에도 공망 글자가 없네. 일주 기준으로는 공망에 든 자리가 없으니 이 부분은 크게 마음 쓰지 않아도 되네.'+(P.h?'':' 태어난 시각을 넣으면 시지까지 살펴 주겠네.')+'</p>';
      var yh=[["월지",P.m.b],["일지",P.d.b]].concat(P.h?[["시지",P.h.b]]:[]).filter(function(x){return Y.empty.indexOf(x[1])>=0;});
      var yearNote='연주('+SJ_S[P.y.s]+SJ_B[P.y.b]+') 기준으로 보는 학파도 있어 참고로 적네. 이쪽은 '+nm(Y.empty[0])+'·'+nm(Y.empty[1])+' 두 글자가 비는데, '+
        (yh.length?'자네 자리 중 거기 든 글자는 '+yh.map(function(x){return x[0]+" "+SJ_B[x[1]];}).join(", ")+'일세.':'자네 다른 자리 중에는 거기 드는 글자가 없네.');
      el.querySelector("#out").innerHTML=
      '<div class="tf-id">'+ilju+'일주 · '+G.sun+'</div>'+
      '<div class="tf-hl">자네 공망은 '+nm(G.empty[0])+' · '+nm(G.empty[1])+'일세.</div>'+
      '<div class="out" style="margin-top:16px"><div class="k">일주 기준 공망</div><div class="v">'+SJ_B[G.empty[0]]+' · '+SJ_B[G.empty[1]]+'</div>'+
      '<div class="s">'+G.sun+' — '+SJ_S[0]+SJ_B[G.start]+'부터 '+SJ_S[9]+SJ_B[(G.start+9)%12]+'까지 열 개 짝에서 남는 땅 글자</div></div>'+
      sjGridHtml(P,"날 자리(나)")+
      '<div id="gmdeep"><div class="sj-sec"><h3>내 사주에서 공망에 든 자리</h3>'+hitHtml+
      '<p style="font-size:12.5px;color:var(--muted);margin-top:10px;line-height:1.7">일지는 자기 일주의 순에서 짝을 이룬 글자라 자기 공망에는 들지 않습니다.</p></div>'+
      '<div class="sj-sec"><h3>공망을 읽을 때 함께 볼 것</h3><p>공망은 학파마다 해석이 갈리네. 비어 있기에 집착이 줄고 정신적·학문적인 쪽으로 쓰인다고 보는 풀이도 있네. 또 그 지지가 대운이나 세운에서 들어와 자리를 채우면(전실) 비어 있던 자리의 일이 드러난다고 보고, 사주 안의 다른 글자와 합이나 충을 이루면 공망이 풀린다고 보는 견해도 있네. 다만 이 부분은 학파마다 견해가 다르니 참고로만 받아 두게. 결정을 미루라는 뜻이 아니라, 그 자리에 기대를 걸 때 한 번 더 살펴보라는 표시로 받아 두게.</p></div>'+
      '<div class="sj-sec"><h3>연주 기준으로도 보면(참고)</h3><p>'+yearNote+'</p></div></div>'+
      '<button type="button" class="share-btn">결과 공유하기</button>'+
      '<p class="note">공망(空亡)은 육십갑자를 갑자·갑술·갑신·갑오·갑진·갑인으로 시작하는 열 개씩 여섯 묶음(순, 旬)으로 나눌 때, 열 개의 천간이 열두 지지와 짝을 짓다 남는 지지 두 개입니다. 일주가 속한 순으로 정하는 방식이 가장 흔하고, 연주 기준을 함께 보는 학파도 있습니다. 해석은 학파마다 다르며 참고용입니다. 태어난 시각을 넣으면 진태양시 30분 보정과 입춘·절기 기준으로 기둥을 세웁니다.</p>';
      fillGm();
      bindShare(el,"공망 찾기","내 일주는 "+ilju+"일주("+G.sun+"), 공망은 "+SJ_B[G.empty[0]]+"·"+SJ_B[G.empty[1]]+". 동네보살에서 확인:");}
    askWire(el,go,["날 글자가 속한 묶음을 찾는다","묶음에서 짝 없는 땅 글자를 짚는다","내 다른 자리와 견주어 본다"],"공망을 아직 안 물어봤네.");birthDial(el,"#d");}});