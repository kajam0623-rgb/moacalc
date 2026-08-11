TOOLS.push({id:"stargunghap",cat:"재미·운세",icon:"",name:"별자리 궁합",desc:"12별자리 커플 궁합",render:function(el){
    // 원소 관계 [점수, 이름, 해설]
    var ELREL={
    same:[86,"같은 원소","서로를 설명할 필요가 없는 조합입니다. 같은 언어로 말하고 같은 것에 웃습니다. 다만 약점도 똑같이 겹쳐서, 둘 다 피하는 문제는 아무도 해결하지 않습니다."],
    friend:[82,"상생 원소","불에 바람이 붙듯, 흙에 물이 스미듯 서로를 키워주는 조합입니다. 다른 방식으로 움직이지만 방향이 맞아, 함께 있을 때 각자보다 커집니다."],
    tense:[58,"긴장 원소","물과 불처럼 기질의 전제가 다른 조합입니다. 처음엔 그 다름이 신선하지만 일상에서는 속도와 온도 차이로 부딪힙니다. 서로를 고치려 들지 않는 것이 관건입니다."]};
    function elRel(a,b){var ea=a%4,eb=b%4;
      if(ea===eb)return "same";
      if((ea===0&&eb===2)||(ea===2&&eb===0)||(ea===1&&eb===3)||(ea===3&&eb===1))return "friend"; // 불-공기, 흙-물
      return "tense";}
    el.innerHTML='<div class="r2"><div><label>내 별자리</label><select id="a">'+
    ST_KO.map(function(n,i){return '<option value="'+i+'"'+(i===4?' selected':'')+'>'+ST_SYM[i]+' '+n+' ('+ST_RANGE[i]+')</option>';}).join("")+'</select></div>'+
    '<div><label>상대 별자리</label><select id="b">'+
    ST_KO.map(function(n,i){return '<option value="'+i+'"'+(i===8?' selected':'')+'>'+ST_SYM[i]+' '+n+' ('+ST_RANGE[i]+')</option>';}).join("")+'</select></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">별자리 궁합 보기</button>'+
    '<div id="out"></div>';
    function go(){
      var a=+el.querySelector("#a").value,b=+el.querySelector("#b").value;
      track("fortune_view",{tool:"stargunghap"});
      var er=elRel(a,b),E=ELREL[er];
      var k=(b-a+12)%12,dist=Math.min(k,12-k),A=ST_ASP[dist];
      // 수호성 친화: 서로의 수호성이 상대 원소의 지배성 목록에 있으면 가점
      var rA=ST_RULER[a],rB=ST_RULER[b];
      var rFit=(ST_ELE_RULERS[ST_ELE[b%4]].indexOf(rA)>=0?1:0)+(ST_ELE_RULERS[ST_ELE[a%4]].indexOf(rB)>=0?1:0);
      var sc=Math.round(E[0]*0.4+A[0]*0.4+(60+rFit*16)*0.2);
      sc=Math.max(35,Math.min(99,sc));
      var grade=sc>=85?"천생연분":sc>=72?"좋은 인연":sc>=58?"노력형 인연":"신중한 인연";
      var subs=[["끌림",sc+(dist===0||dist===4?6:dist===3?-4:2)],["대화",sc+(er==="same"?6:er==="friend"?4:-6)],
        ["일상",sc+(er==="tense"?-6:4)],["롱런",sc+(rFit===2?8:rFit===1?4:-2)]].map(function(x){
        return [x[0],Math.max(30,Math.min(99,x[1]))];});
      var rNote=rFit===2?"두 사람의 수호성("+rA+"·"+rB+")이 서로의 원소와 결이 맞아, 오래 갈수록 편해지는 조합입니다."
        :rFit===1?"한쪽 수호성은 상대 원소와 결이 맞고 한쪽은 다릅니다. 맞춰주는 쪽이 지치지 않게 표현을 아끼지 마세요."
        :"수호성("+rA+"·"+rB+")의 결이 서로 달라, 연애 초반보다 시간이 지나며 이해가 쌓이는 형태입니다.";
      el.querySelector("#out").innerHTML=
      '<div class="tf-id">'+ST_ELE[a%4]+' 원소 × '+ST_ELE[b%4]+' 원소 · 황도 '+A[1]+'</div>'+
      '<div class="tf-hl">'+ST_ELE[a%4]+josa(ST_ELE[a%4],"와/과")+' '+ST_ELE[b%4]+josa(ST_ELE[b%4],"가/이")+' 만나면 — '+grade+'.</div>'+
      '<div class="out" style="margin-top:16px"><div class="k">'+ST_SYM[a]+' '+ST_KO[a]+' ♥ '+ST_SYM[b]+' '+ST_KO[b]+'</div>'+
      '<div class="v">'+sc+'<small>점 · '+grade+'</small></div><div class="s">'+E[1]+' · '+A[1]+' 관계</div></div>'+
      '<div class="sj-bars">'+subs.map(function(x){return rateBar(x[0],x[1]);}).join("")+'</div>'+
      '<div class="gh-pair">'+stCard(a,"나")+stCard(b,"상대")+'</div>'+
      '<div class="sj-sec"><h3>원소 궁합 — '+ST_ELE[a%4]+' × '+ST_ELE[b%4]+'</h3><p>'+E[2]+'</p></div>'+
      '<div class="sj-sec"><h3>각도 관계 — '+A[1]+'</h3><p>두 별자리는 황도에서 '+(dist*30)+'° 떨어져 있습니다. '+A[2]+'</p></div>'+
      '<div class="sj-sec"><h3>수호성 궁합</h3><p>'+ST_KO[a]+'는 '+rA+', '+ST_KO[b]+'는 '+rB+'가 다스립니다. '+rNote+'</p></div>'+
      '<div class="sj-sec"><h3>이 조합에게</h3><p>'+A[5]+' '+(er==="tense"?"기질이 다른 만큼 상대의 방식을 번역해서 듣는 연습이 필요합니다. 다름은 결함이 아니라 각도의 문제입니다.":"결이 맞는 조합일수록 관계를 당연하게 여기기 쉽습니다. 좋은 이유를 가끔 말로 확인해 주세요.")+'</p></div>'+
      shareBtn()+
      '<p class="note">별자리의 원소(불·흙·공기·물), 황도 각도(합·섹스타일·스퀘어·트라인·오포지션), 수호성 친화를 종합한 서양 점성술 궁합입니다. 태양 별자리 기준이며, 정밀 궁합은 달·상승궁까지 봐야 합니다. 참고용.</p>';
      bindShare(el,"별자리 궁합",ST_KO[a]+" ♥ "+ST_KO[b]+" 궁합 "+sc+"점 · "+grade+". 동네보살에서 확인:");}
    el.querySelector("#go").addEventListener("click",go);
    el.querySelector("#a").addEventListener("change",go);
    el.querySelector("#b").addEventListener("change",go);go();}});