TOOLS.push({id:"namematch",cat:"재미·운세",icon:"",name:"이름 궁합",desc:"획수 계산 전통놀이",render:function(el){
    el.innerHTML='<div class="r2"><div><label for="a">이름 1</label><input id="a" value="김철수" maxlength="10" autocomplete="off" enterkeyhint="go" style="text-align:left;font-family:inherit"></div>'+
    '<div><label for="b">이름 2</label><input id="b" value="이영희" maxlength="10" autocomplete="off" enterkeyhint="go" style="text-align:left;font-family:inherit"></div></div>'+
    '<p style="font-size:12.5px;color:var(--muted);margin:8px 0 0;line-height:1.7">성까지 한글로 넣어 주세요. 성을 빼거나 이름 순서를 바꾸면 점수가 달라져요.</p>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">궁합 계산</button>'+
    '<div id="out"></div>';
    function part(x){return x.cho+"("+nmJ(x.cho)+")+"+x.jung+"("+nmJ(x.jung)+")"+(x.jong?"+"+x.jong+"("+nmJ(x.jong)+")":"")+" = "+x.n;}
    function chips(list){return '<div class="chips" style="margin:6px 0 10px">'+list.map(function(x){return '<span class="chip">'+x.ch+' · '+part(x)+'</span>';}).join("")+'</div>';}
    function names(list){return list.map(function(x){return x.ch;}).join("");}
    function go(user){
      var an=el.querySelector("#a").value,bn=el.querySelector("#b").value,out=el.querySelector("#out"),r=nmCalc(an,bn);
      if(!r){out.innerHTML='<p class="note" style="margin-top:16px">두 칸 모두 한글 이름을 넣어 주세요. 영문·숫자·자음만 쓴 글자는 획수를 셀 수 없어 계산하지 않아요.</p>';return;}
      if(user===true)track("fortune_view",{tool:"namematch"});
      var A=names(r.A),B=names(r.B),band=nmBand(r.score),rv=nmCalc(bn,an),bv=nmBand(rv.score),
        skipped=an.replace(/\s/g,"").length!==A.length||bn.replace(/\s/g,"").length!==B.length;
      var pyramid=r.steps.map(function(row,ri){return '<div style="text-align:center;font-family:var(--mono);font-size:'+(ri===r.steps.length-1?'22px;font-weight:800;color:var(--fun)':'14px;color:var(--muted)')+';letter-spacing:8px;margin:4px 0">'+row.join("")+'</div>';}).join("");
      var lenNote=(r.A.length!==r.B.length)
        ? "두 이름의 글자 수가 달라, 짧은 쪽이 먼저 끝나고 남은 글자가 이어 붙습니다. 첫 이름의 글자가 먼저 놓이므로 이름 1·2의 순서를 바꾸면 점수가 달라집니다."
        : "두 이름의 글자 수가 같아 획수가 나란히 번갈아 놓입니다. 가장 정석적인 배열이에요. 다만 첫 이름의 글자가 먼저 놓이므로 이름 1·2의 순서를 바꾸면 점수가 달라집니다.";
      out.innerHTML=
      '<div class="out" style="margin-top:16px"><div class="k">'+escH(A)+' ♥ '+escH(B)+'</div><div class="v">'+r.score+'<small>점 · '+band.type+'</small></div></div>'+
      (skipped?'<p class="note" style="margin-top:8px">한글이 아닌 글자는 빼고 계산했어요.</p>':'')+
      '<div class="sj-sec"><h3>글자별 획수</h3><p style="font-size:12.5px;color:var(--muted);margin:0">이름 1 · '+escH(A)+'</p>'+chips(r.A)+
      '<p style="font-size:12.5px;color:var(--muted);margin:0">이름 2 · '+escH(B)+'</p>'+chips(r.B)+
      '<p style="font-size:12.5px;color:var(--muted);margin-top:4px;line-height:1.7">한글 획수는 사이트마다 달라요. 이 도구는 선분수(ㄱ=2, ㅎ=3)로 세고, 쌍자음·겹받침·복합 모음은 구성 자모를 더합니다. 첫 줄에는 획수의 일의 자리만 씁니다(11획 → 1).</p></div>'+
      '<div class="sj-sec"><h3>획수 피라미드</h3>'+pyramid+
      '<p style="font-size:12.5px;color:var(--muted);margin-top:8px;line-height:1.7">맨 윗줄이 두 이름의 획수를 번갈아 놓은 것이고, 이웃한 두 수를 더해 일의 자리만 남기며 줄여 내려갑니다. 마지막 두 자리가 점수예요. '+lenNote+'</p></div>'+
      '<div class="sj-sec"><h3>이름 순서를 바꾸면</h3><p style="font-size:14px;line-height:1.8">'+escH(B)+josa(B,"를/을")+' 먼저 놓으면 '+rv.score+'점 · '+bv.type+'이에요. '+(rv.score===r.score?'이번에는 순서를 바꿔도 점수가 같아요.':'번갈아 놓는 순서가 바뀌면 더하는 짝이 전부 달라져서 점수가 달라집니다.')+'</p></div>'+
      '<div class="sj-sec"><h3>풀이</h3><p>'+band.msg+'</p></div>'+
      '<div class="sj-sec"><h3>이 조합의 좋은 점</h3><p>'+band.good+'</p></div>'+
      '<div class="sj-sec"><h3>맞춰 가면 좋은 점</h3><p>'+band.care+'</p></div>'+
      '<div class="sj-sec"><h3>조언</h3><p>'+band.tip+'</p></div>'+
      shareBtn()+
      '<p class="note">이름 글자의 획수를 번갈아 놓고 이웃끼리 더하는 전통 이름궁합 놀이입니다. 한글 자모를 선분수(ㄱ=2, ㅎ=3)로 세어 계산하며, 획수 기준은 사이트마다 달라 같은 이름도 점수가 다를 수 있습니다. 한자 이름과도 결과가 다릅니다. 재미로만 보세요. 사주 기반 궁합은 궁합 보기를 이용하세요.</p>';
      bindShare(el,"이름 궁합",A+" ♥ "+B+" 이름궁합 "+r.score+"점 · "+band.type+". 동네보살에서 해 보기:");
      saveScore(el,"이름궁합","이름 궁합",A+" ♥ "+B,r.score,band.type,band.msg,band.good,r.score>=55?"heart":"diary");}
    el.querySelector("#go").addEventListener("click",function(){go(true);});
    ["#a","#b"].forEach(function(q){el.querySelector(q).addEventListener("keydown",function(e){if(e.key==="Enter")go(true);});});
    go();}});