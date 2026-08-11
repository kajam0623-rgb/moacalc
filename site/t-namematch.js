TOOLS.push({id:"namematch",cat:"재미·운세",icon:"",name:"이름 궁합",desc:"획수 계산 전통놀이",render:function(el){
    var CHO=[1,2,2,3,3,4,4,6,2,4,4,6,4,6,3,2,3,4,3];   // ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ 근사 획수
    var CHOs="ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
    var JUNG=[2,3,3,4,2,3,3,4,2,4,5,4,3,2,4,5,4,3,1,2,1]; // ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ
    var JONG=[0,1,2,3,2,3,4,3,3,5,7,9,9,7,9,10,7,2,4,2,4,1,2,3,3,4,3,4];
    function strokes(ch){var c=ch.charCodeAt(0);
      if(c<0xAC00||c>0xD7A3)return 3;
      var s=c-0xAC00,cho=Math.floor(s/588),jung=Math.floor((s%588)/28),jong=s%28;
      return CHO[cho]+JUNG[jung]+JONG[jong];}
    el.innerHTML='<div class="r2"><div><label>이름 1</label><input id="a" value="김철수" style="text-align:left;font-family:inherit"></div>'+
    '<div><label>이름 2</label><input id="b" value="이영희" style="text-align:left;font-family:inherit"></div></div>'+
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
      var msg=score>=90?"운명이라 불러도 될 점수! 오늘 바로 연락하세요.":score>=75?"아주 잘 어울리는 짝. 함께 있으면 웃음이 끊이지 않습니다.":score>=55?"노력하면 무르익는 궁합. 반은 하늘이, 반은 두 사람이 만듭니다.":score>=35?"밀당이 필요한 사이. 다름이 매력이 될 수도 있어요.":"불꽃 튀는 상극?! 그래서 더 끌리는 법이죠.";
      var pyramid=steps.map(function(row,ri){return '<div style="text-align:center;font-family:var(--mono);font-size:'+(ri===steps.length-1?'22px;font-weight:800;color:var(--fun)':'14px;color:var(--muted)')+';letter-spacing:8px;margin:4px 0">'+row.join("")+'</div>';}).join("");
      // 점수대별 관계 해설 — [유형, 잘 맞는 점, 부딪히는 점, 조언]
      var BAND=score>=90
        ? ["운명형","서로의 리듬이 거의 같습니다. 말하지 않아도 다음 행동이 예측되는 편이라 함께 있는 시간이 편안합니다.","너무 닮아서 새로움이 줄어들 수 있습니다. 둘 다 같은 것을 피하면 아무도 그 문제를 해결하지 않습니다.","이 정도로 잘 맞으면 오히려 표현을 게을리하기 쉽습니다. 당연한 것을 말로 확인하는 습관이 이 관계를 지킵니다."]
        : score>=75
        ? ["안정형","기본 호흡이 잘 맞는 조합입니다. 큰 갈등 없이 오래 이어지는 형태예요.","무난함에 익숙해지면 서로의 변화를 눈치채지 못합니다.","가끔 새로운 것을 함께 해보세요. 이 조합은 자극이 부족할 때만 흔들립니다."]
        : score>=55
        ? ["성장형","처음엔 낯설지만 시간이 지날수록 서로에게 맞춰지는 조합입니다.","맞춰가는 과정에서 한쪽이 더 많이 양보하고 있다고 느끼기 쉽습니다.","서로 다른 점을 고치려 들지 말고 규칙으로 정하세요. 이 조합은 대화의 양이 결과를 만듭니다."]
        : score>=35
        ? ["밀당형","끌리는 힘과 밀어내는 힘이 함께 있습니다. 지루할 틈은 없는 조합이에요.","감정의 진폭이 커서 좋을 때와 나쁠 때의 온도차가 큽니다.","화가 난 상태에서 결론을 내지 마세요. 이 조합은 타이밍만 조절해도 점수가 달라집니다."]
        : ["도전형","서로 완전히 다른 결을 가진 조합입니다. 배울 것이 많은 대신 이해에 시간이 걸립니다.","기본 전제가 달라 같은 말을 다르게 알아듣기 쉽습니다.","이 놀이의 점수는 낮아도 실제 관계와는 별개입니다. 다른 만큼 서로에게 없는 것을 줄 수 있습니다."];
      var lenNote=(A.length!==B.length)
        ? "두 이름의 글자 수가 달라, 짧은 쪽이 먼저 끝나고 남은 글자가 이어 붙습니다. 그래서 순서를 바꾸면 점수가 달라질 수 있어요."
        : "두 이름의 글자 수가 같아 획수가 나란히 번갈아 놓입니다. 가장 정석적인 배열이에요.";
      el.querySelector("#out").innerHTML=
      '<div class="out" style="margin-top:16px"><div class="k">'+escH(A)+' ♥ '+escH(B)+'</div><div class="v">'+score+'<small>점 · '+BAND[0]+'</small></div></div>'+
      '<div class="sj-sec"><h3>획수 피라미드</h3>'+pyramid+
      '<p style="font-size:12.5px;color:var(--muted);margin-top:8px;line-height:1.7">맨 윗줄이 두 이름의 획수를 번갈아 놓은 것이고, 이웃한 두 수를 더해 일의 자리만 남기며 줄여 내려갑니다. 마지막 두 자리가 점수예요. '+lenNote+'</p></div>'+
      '<div class="sj-sec"><h3>풀이</h3><p>'+msg+'</p></div>'+
      '<div class="sj-sec"><h3>이 조합의 좋은 점</h3><p>'+BAND[1]+'</p></div>'+
      '<div class="sj-sec"><h3>부딪히기 쉬운 점</h3><p>'+BAND[2]+'</p></div>'+
      '<div class="sj-sec"><h3>조언</h3><p>'+BAND[3]+'</p></div>'+
      '<p class="note">이름 글자의 획수를 번갈아 놓고 이웃끼리 더하는 전통 이름궁합 놀이입니다. 한글 자모의 획수를 기준으로 계산하므로 한자 이름과는 결과가 다를 수 있습니다. 재미로만 보세요. 사주 기반 궁합은 궁합 보기를 이용하세요.</p>';}
    el.querySelector("#go").addEventListener("click",go);go();}});