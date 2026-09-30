TOOLS.push({id:"namematch",cat:"재미·운세",icon:"",name:"이름 궁합",desc:"획수 계산 전통놀이",render:function(el){
    var CHO=[1,2,2,3,3,4,4,6,2,4,4,6,4,6,3,2,3,4,3];   // ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ 근사 획수
    var CHOs="ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
    var JUNG=[2,3,3,4,2,3,3,4,2,4,5,4,3,2,4,5,4,3,1,2,1]; // ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ
    var JONG=[0,1,2,3,2,3,4,3,3,5,7,9,9,7,9,10,7,2,4,2,4,1,2,3,3,4,3,4];
    function strokes(ch){var c=ch.charCodeAt(0);
      if(c<0xAC00||c>0xD7A3)return 3;
      var s=c-0xAC00,cho=Math.floor(s/588),jung=Math.floor((s%588)/28),jong=s%28;
      return CHO[cho]+JUNG[jung]+JONG[jong];}
    el.innerHTML='<div class="r2"><div><label for="a">이름 1</label><input id="a" value="김철수" style="text-align:left;font-family:inherit"></div>'+
    '<div><label for="b">이름 2</label><input id="b" value="이영희" style="text-align:left;font-family:inherit"></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">궁합 계산</button>'+
    '<div id="out"></div>';
    function go(){
      var A=el.querySelector("#a").value.replace(/\s/g,""),B=el.querySelector("#b").value.replace(/\s/g,"");
      if(!A||!B)return;
      var mix=[],L=Math.max(A.length,B.length);
      for(var i=0;i<L;i++){if(A[i])mix.push(strokes(A[i]));if(B[i])mix.push(strokes(B[i]));}
      var steps=[mix.map(function(x){return x%10;})],cur=steps[0];
      while(cur.length>2){var nx=[];for(var j=0;j<cur.length-1;j++)nx.push((cur[j]+cur[j+1])%10);steps.push(nx);cur=nx;}
      var score=cur.length===2?cur[0]*10+cur[1]:cur[0];if(score===0)score=100;
      var msg=score>=90?"운명이라 불러도 될 점수일세! 오늘 바로 연락해 보게.":score>=75?"아주 잘 어울리는 짝이야. 함께 있으면 웃음이 끊이지 않겠네.":score>=55?"함께 무르익는 궁합일세. 반은 하늘이, 반은 두 사람이 만들어 가네.":score>=35?"밀고 당기는 재미가 있는 사이야. 다름이 매력이 될 걸세.":"불꽃이 튀는 짝일세! 다른 만큼 더 끌리는 법이지.";
      var pyramid=steps.map(function(row,ri){return '<div style="text-align:center;font-family:var(--mono);font-size:'+(ri===steps.length-1?'22px;font-weight:800;color:var(--fun)':'14px;color:var(--muted)')+';letter-spacing:8px;margin:4px 0">'+row.join("")+'</div>';}).join("");
      // 점수대별 관계 해설 — [유형, 잘 맞는 점, 부딪히는 점, 조언]
      var BAND=score>=90
        ? ["운명형","서로의 리듬이 거의 같네. 말하지 않아도 다음 행동이 짐작되니 함께 있는 시간이 참 편안하지.","너무 닮아서 새로움이 줄 수 있으니, 둘 다 미뤄 두던 일을 함께 해 보면 새 기운이 생기네.","이 정도로 잘 맞으면 표현을 아끼기 쉽네. 당연한 것도 말로 확인하는 습관이 이 관계를 오래 지켜 주지."]
        : score>=75
        ? ["안정형","기본 호흡이 잘 맞는 조합일세. 큰 갈등 없이 오래 이어지는 사이야.","무난함에 익숙해지면 서로의 변화를 놓치기 쉬우니, 눈여겨보고 한마디 건네 보게.","가끔 새로운 것을 함께 해 보게. 이 조합은 자극이 조금만 더해져도 다시 반짝이네."]
        : score>=55
        ? ["성장형","처음엔 낯설어도 시간이 지날수록 서로에게 맞춰지는 조합일세.","맞춰 가는 동안 한쪽이 더 양보한다고 느낄 수 있으니 고마운 마음을 자주 말해 주게.","서로 다른 점은 고치려 들지 말고 규칙으로 정해 보게. 이 조합은 대화의 양이 좋은 결과를 만드네."]
        : score>=35
        ? ["밀당형","끌리는 힘과 서로를 궁금해하는 힘이 함께 있네. 지루할 틈이 없는 조합이야.","감정의 폭이 커서 뜨거울 때와 식을 때의 온도차가 있으니, 그럴 땐 잠깐 쉬었다 이야기해 보게.","화가 난 상태에서는 결론을 내지 말고 마음이 가라앉은 뒤에 말하게. 이 조합은 타이밍만 맞춰도 훨씬 좋아지네."]
        : ["도전형","서로 완전히 다른 결을 가진 조합일세. 배울 것이 많은 만큼 함께 자라기 좋은 사이야.","기본 바탕이 달라 같은 말도 다르게 들릴 수 있으니, 뜻을 한 번 더 물어보는 습관이 도움이 되네.","이 놀이의 점수는 낮아도 실제 관계와는 별개일세. 다른 만큼 서로에게 없는 것을 건네 줄 수 있지."];
      var lenNote=(A.length!==B.length)
        ? "두 이름의 글자 수가 달라, 짧은 쪽이 먼저 끝나고 남은 글자가 이어 붙습니다. 첫 이름의 글자가 먼저 놓이므로 이름 1·2의 순서를 바꾸면 점수가 달라집니다."
        : "두 이름의 글자 수가 같아 획수가 나란히 번갈아 놓입니다. 가장 정석적인 배열이에요. 다만 첫 이름의 글자가 먼저 놓이므로 이름 1·2의 순서를 바꾸면 점수가 달라집니다.";
      el.querySelector("#out").innerHTML=
      '<div class="out" style="margin-top:16px"><div class="k">'+escH(A)+' ♥ '+escH(B)+'</div><div class="v">'+score+'<small>점 · '+BAND[0]+'</small></div></div>'+
      '<div class="sj-sec"><h3>획수 피라미드</h3>'+pyramid+
      '<p style="font-size:12.5px;color:var(--muted);margin-top:8px;line-height:1.7">맨 윗줄이 두 이름의 획수를 번갈아 놓은 것이고, 이웃한 두 수를 더해 일의 자리만 남기며 줄여 내려갑니다. 마지막 두 자리가 점수예요. '+lenNote+'</p></div>'+
      '<div class="sj-sec"><h3>풀이</h3><p>'+msg+'</p></div>'+
      '<div class="sj-sec"><h3>이 조합의 좋은 점</h3><p>'+BAND[1]+'</p></div>'+
      '<div class="sj-sec"><h3>맞춰 가면 좋은 점</h3><p>'+BAND[2]+'</p></div>'+
      '<div class="sj-sec"><h3>조언</h3><p>'+BAND[3]+'</p></div>'+
      '<p class="note">이름 글자의 획수를 번갈아 놓고 이웃끼리 더하는 전통 이름궁합 놀이입니다. 한글 자모의 획수를 기준으로 계산하므로 한자 이름과는 결과가 다를 수 있습니다. 재미로만 보세요. 사주 기반 궁합은 궁합 보기를 이용하세요.</p>';}
    el.querySelector("#go").addEventListener("click",go);go();}});