TOOLS.push({id:"newyear",cat:"재미·운세",icon:"",name:"신년운세",desc:"2026 병오 · 2027 정미 나의 한 해",render:function(el){
    // 해마다 바뀌는 건 그 해의 간지뿐이다. 12~2월이 성수기라 10월부터는 다음 해를 먼저 연다(?y=2027 로 고정 가능)
    var YEARS={2026:{s:2,b:6,ko:"병오",han:"丙午",ani:"붉은 말"},2027:{s:3,b:7,ko:"정미",han:"丁未",ani:"붉은 양"}};
    var nowD=new Date(),qy=+((location.search.match(/[?&]y=(20\d\d)/)||[])[1]||0);
    var defY=YEARS[qy]?qy:(nowD.getMonth()>=9&&YEARS[nowD.getFullYear()+1])?nowD.getFullYear()+1:(YEARS[nowD.getFullYear()]?nowD.getFullYear():2026);
    var TXT={ // 병(丙)이 내 일간에 대해 갖는 십성 → 올해의 큰 흐름
    "비견":["동료와 함께 크는 해","같은 불이 하나 더 켜지는 해일세. 자네 힘이 커지는 만큼 함께 뛸 동료도 또렷하게 보이네. 동업이든 협업이든 각자 맡을 일을 글로 적어 나눠 두면 서로 든든하고, 처음부터 분명히 해 두면 뒤끝 없이 오래 가네.","독립하고 창업하기 좋은 기운일세. 자금은 자네 몫을 분명히 나눠 두면 마음이 편하네."],
    "겁재":["지키며 모으는 해","기운은 왕성하고 사람 복이 많은 해일세. 씀씀이가 커지기 쉬우니 보증이나 동업 자금 같은 큰 선심은 상반기에 한 번 더 따져 보고 결정하면 좋네. 대신 사람은 많이 얻는 해야.","버는 해라기보다 지키는 해로 짜 두게. 그러면 연말이 넉넉하고 편안하네."],
    "식신":["결실과 표현의 해","재능이 수입으로 이어지는 해일세. 만들고 쓰고 내보이는 일마다 볕이 드네. 몸도 대체로 편안한 해야.","미뤄둔 창작이든 콘텐츠든 부업이든, 시작하기엔 올해만 한 해가 없네."],
    "상관":["도전과 변화의 해","틀을 깨는 기운이 강한 해일세. 이직이든 전업이든 새 시도에 유리하고, 윗사람이나 규정과는 말을 고르며 이야기하면 더 잘 통하네. 말이 곧 재산이 되는 해야.","불만을 기획서로 바꾸게. 그게 올해 자네 최고의 무기일세."],
    "편재":["큰 기회와 유동성의 해","돈이 크게 오가는 해일세. 투자든 확장이든 영업이든 기회가 많은 해라, 욕심을 알맞게 두고 현금 흐름표를 곁에 두면 기회가 그대로 결실이 되네.","기회는 상반기, 정리는 하반기. 그 리듬을 타면 되네."],
    "정재":["안정과 축적의 해","성실이 그대로 쌓이는 해일세. 연봉이며 계약이며 저축이며 확실한 재물에 볕이 드네. 한탕 말고 복리를 택하게.","돈 관리의 기본기를 다지기 가장 좋은 해야."],
    "편관":["도전으로 급이 오르는 해","묵직한 과제가 오지만 해내면 자리가 한 단계 오르는 해일세. 올해는 몸을 챙기며 쉬는 시간을 지키는 것이 가장 든든한 밑천이야.","피할 수 없는 큰 일이라면 상반기에 정면으로 맞는 편이 마음이 가볍네."],
    "정관":["명예와 자리의 해","승진이든 합격이든 공식적인 인정운이 밝은 해일세. 원칙대로 움직일수록 평판이 자산이 되네.","이력서든 자격이든 직함이든, 공적인 것을 정비하기 좋은 해야."],
    "편인":["공부와 전환의 해","겉보다 속이 자라는 해일세. 자격증·공부·기획에 유리하고, 결정은 좀 묵혔다 내리는 게 좋네.","혼자 파고드는 시간이 하반기의 반전을 만들어."],
    "정인":["귀인과 문서의 해","어른이든 스승이든 기관이든, 위에서 도움이 오는 해일세. 계약·합격·승인 같은 문서운이 밝네.","배움에 쓰는 돈이 올해 자네한테 제일 수익률 높은 투자야."]};
    el.innerHTML='<label>어느 해</label><select id="yr">'+Object.keys(YEARS).map(function(k){return '<option value="'+k+'"'+(+k===defY?" selected":"")+'>'+k+' '+YEARS[k].ko+'년 ('+YEARS[k].ani+')</option>';}).join("")+'</select>'+
    '<label for="d" style="margin-top:12px">생년월일 (양력)</label><input type="date" id="d" value="1990-03-15">'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">'+ASK_LABEL+'</button>'+
    '<div id="out"></div>';
    // 깊이 있는 풀이 원고(ny/deep.json) — 결과가 그려진 뒤에 도착해도 자리(#nydeep)에 채운다
    var NYD=null,nyLast=null,nyDone=false;
    function fillNy(){var h=el.querySelector("#nydeep");if(!h||!NYD||!nyLast)return;h.innerHTML=nyDeep(nyLast.me,nyLast.YR,nyLast.YW,NYD).secs.map(nySecHtml).join("");if(nyDone)plainWords(h);}
    /* 신년운세 점수 — 그 해 하늘 글자와 나(일간)의 관계 + 내 띠·일지가 그 해 땅 글자와 삼합·육합(+5)·충(-6). go 와 상위 %가 같이 쓴다 */
    function nyScore(ds,yb,db,YS,YB){
      var sc={비견:74,겁재:62,식신:88,상관:70,편재:80,정재:85,편관:60,정관:86,편인:68,정인:84}[sjTenGod(ds,YS)];
      [yb,db].forEach(function(b){if(b%4===YB%4&&b!==YB||sjYukhap(b)===YB)sc+=5;else if(Math.abs(b-YB)===6)sc-=6;});
      return Math.max(40,Math.min(97,sc));}
    // 상위 N%: 60갑자 일주 × 12띠(720가지, 같은 무게) 가운데 이 해 점수가 내 점수 이상인 비율
    function nyPct(score,YS,YB){var t=0,c=0;for(var d=0;d<60;d++)for(var y=0;y<12;y++){t++;if(nyScore(d%10,y,d%12,YS,YB)>=score)c++;}return Math.max(1,Math.round(c/t*100));}
    if(typeof fetch==="function")fetch("ny/deep.json").then(function(r){return r.ok?r.json():null;}).then(function(j){if(j){NYD=j;fillNy();}}).catch(function(){});
    function go(){
      var dv=el.querySelector("#d").value.split("-");if(dv.length<3)return;
      track("fortune_view",{tool:"newyear"});
      var YR=+el.querySelector("#yr").value,Y=YEARS[YR],YS=Y.s,YB=Y.b,TSE=SJ_B[YB]+SJ_EL[SJ_EB[YB]]; // 태세 지지와 오행(예: 오화, 미토)
      var YW=YR===new Date().getFullYear()?"올해":YR+"년"; // 다음 해를 볼 때 "올해"라고 부르지 않는다
      var me=sjPillars(+dv[0],+dv[1],+dv[2],null,0,false);
      var rel=sjTenGod(me.d.s,YS),T=TXT[rel];
      var yb=me.y.b,db=me.d.b,notes=[];
      var seenRel={};
      function relB(b,label){var k=b%4===YB%4&&b!==YB?"삼합":sjYukhap(b)===YB?"육합":Math.abs(b-YB)===6?"충":"";if(!k)return;
        if(seenRel[k]){notes.push(label+"도 그 해 글자와 "+k+"일세. 앞에서 말한 흐름이 한 겹 더 힘을 얻네.");return;}seenRel[k]=1;
        if(k==="삼합")notes.push(label+"가 그 해 글자("+TSE+")와 삼합일세. 귀인과 협력의 흐름이 한 해 내내 힘을 보태네.");
        else if(k==="육합")notes.push(label+"가 그 해 글자와 육합일세. 사람 사이가 유난히 부드러운 해야.");
        else notes.push(label+"가 그 해 글자와 충일세. 움직임이 생기는 해라 이사든 이직이든 자네가 먼저 계획 안으로 끌어들이면 든든하네.");}
      relB(yb,"내 띠(연지)");relB(db,"내 일지");
      var score=nyScore(me.d.s,yb,db,YS,YB);
      // 십성별 항목 보정 [재물·직장·애정·건강] + 상·하반기 흐름 + 올해 주의
      var EXT={
      "비견":[[-4,6,0,6],"상반기엔 사람이 모이네. 제안이 늘고 동업 이야기가 오가는 구간일세.","하반기엔 역할을 정리해 두면 좋네. 흐지부지 둔 몫을 이때 분명히 해 두면 한결 개운해.","친구·동료와의 돈거래는 금액과 기한을 글로 남겨 두면 좋네. 정으로 시작한 돈일수록 마음 편하게 적어 두는 것이 관계를 지켜 주지."],
      "겁재":[[-14,4,0,4],"상반기에는 지출이 늘기 쉬운 구간일세. 큰 결제와 보증은 하반기로 미뤄 두면 마음이 편하네.","하반기부터 정리가 잘되네. 새어 나가는 곳을 막아 두면 연말이 든든해.","보증, 투자 권유, 동업 자금 이야기는 사람을 통해 들어오는 해일세. 결정하기 전에 하룻밤 두고 믿는 이와 한 번 더 이야기해 보면 좋네."],
      "식신":[[8,4,8,-2],"상반기는 만들고 표현하는 데 볕이 드네. 시작한 것이 수입으로 이어지는 구간일세.","하반기엔 결실이 눈에 보이네. 벌려둔 일을 상품으로 다듬을 때야.","먹을 복이 좋은 해라 체중과 속을 가볍게 챙겨 두면 더 상쾌하네."],
      "상관":[[4,-10,-4,2],"상반기는 하고 싶은 말이 많아지는 구간일세. 그 마음이 새 방향을 찾아 주네.","하반기에 실제로 움직이네. 이직이나 전업이라면 이 구간이 유리해.","윗사람이나 규정과는 옳은 말도 부드럽게 건네는 것이 힘이 되는 해일세. 말투 한 겹이 자네 뜻을 끝까지 지켜 주네."],
      "편재":[[12,2,6,-2],"상반기에 기회가 몰리네. 거래든 확장이든 영업이든 이때 승부를 보게.","하반기는 정리하고 거두는 구간일세. 벌려둔 걸 줄이면 이익이 남네.","매출이 커지는 해라 현금이 손에 남도록 통장을 나눠 두면 좋네. 쓰는 통장과 모으는 통장만 갈라도 든든해."],
      "정재":[[12,4,4,2],"상반기에 기반이 다져지네. 연봉이든 계약이든 저축 조건이든 손보기 좋아.","하반기엔 쌓인 게 눈에 보이네. 무리한 확장만 안 하면 순조로워.","쓸 자리에는 시원하게 쓰는 것도 복이야. 사람과 배움에 쓰는 돈은 기회로 돌아오네."],
      "편관":[[0,8,-8,-14],"상반기에 묵직한 일이 오네. 범위부터 정해 두고 하나씩 풀면 가볍게 넘어가.","하반기에 그 결과가 평가로 돌아오네. 견딘 만큼 자리가 올라가.","몸이 밑천인 해일세. 잠과 끼니를 지켜 두면 나머지 일이 전부 수월하게 따라오네."],
      "정관":[[2,12,4,0],"상반기는 공식적인 일에 유리하네. 시험이든 승진이든 자격이든 이 구간에 놓게.","하반기엔 평판이 자산이 되네. 원칙대로 처리한 일이 자네 이름을 만들어.","절차를 하나하나 지키는 것이 복이 되는 해일세. 바른 길로 간 값이 크게 돌아오네."],
      "편인":[[-2,0,-6,4],"상반기는 안으로 파고드는 때일세. 공부든 자격이든 기획이든 여기 시간을 쓰게.","하반기에 그 준비가 형태를 갖추네. 결정은 이 구간에 내리는 게 낫겠어.","생각이 깊어지는 해라 실행할 날짜를 미리 정해 두면 좋네. 달력에 적어 두면 좋은 생각이 열매가 되지."],
      "정인":[[0,8,2,6],"상반기에 귀인과 문서가 움직이네. 합격·승인·계약 소식이 오기 쉬운 구간일세.","하반기엔 배운 게 쓰이기 시작하네. 사람을 통해 다음 기회가 와.","손 내밀면 열리는 해일세. 혼자 해결하려 하지 말고 도움을 청하면 문이 활짝 열리네."]};
      var E=EXT[rel],sb=subBal(score,E[0]),sub=[["재물",sb[0]],["직장",sb[1]],["애정",sb[2]],["건강",sb[3]]];
      function ybar(n,v){return rateBar(n,v);}
      var un=sjUnseong(me.d.s,YB); // 태세 지지가 내 일간에 갖는 십이운성
      el.querySelector("#out").innerHTML=
      '<div class="tf-id">'+SJ_ILGAN_ID[me.d.s]+'</div>'+
      '<div class="tf-hl">'+Y.ko+'년, 자네에게 '+rel+'의 해일세.</div>'+
      '<div class="out" style="margin-top:16px"><div class="k">'+YR+' '+Y.ko+'년('+Y.han+'年) · '+SJ_TTI[yb]+'띠 · '+SJ_S[me.d.s]+'일간</div>'+
      '<div class="v">'+score+'<small>점</small></div><div class="s">'+YW+(YW==="올해"?"는":"은")+' 자네에게 <b>'+rel+'</b>의 해 — '+T[0]+'</div></div>'+
      '<div class="sj-bars">'+sub.map(function(x){return ybar(x[0],x[1]);}).join("")+'</div>'+
      zoCard(me.y.b)+
      '<div class="sj-sec fold-skip"><h3>한 해의 큰 흐름</h3><p>'+T[1]+'</p></div>'+
      '<div class="sj-sec fold-skip"><h3>상반기 (입춘~하지)</h3><p>'+E[1]+'</p></div>'+
      '<div class="sj-sec fold-skip"><h3>하반기 (하지~입춘 전)</h3><p>'+E[2]+'</p></div>'+
      '<div class="sj-sec fold-skip"><h3>'+YW+' 미리 챙겨 두면 좋은 것</h3><p>'+E[3]+'</p></div>'+
      '<div class="sj-sec fold-skip"><h3>'+YW+'의 전략</h3><p>'+T[2]+'</p></div>'+
      '<div id="nydeep"></div>'+
      (notes.length?'<div class="sj-sec fold-skip"><h3>잘 맞는 자리와 맞춰 갈 자리</h3><p>'+notes.join(" ")+'</p></div>':"")+
      '<div class="sj-sec fold-skip"><h3>그 해 글자와 나 — 십이운성 '+un+'</h3><p>그 해 아래 글자 '+SJ_B[YB]+'('+SJ_BH[YB]+')는 자네를 뜻하는 글자 '+SJ_S[me.d.s]+'에게 '+un+'의 자리일세. '+YR+'년 한 해 밑바탕에 깔리는 기운이 여기서 나오네.<br><br>'+SJ_UN_DESC[un]+'</p></div>'+
      shareBtn()+
      '<p class="note">그 해 하늘 글자('+SJ_SH[YS]+')와 나를 뜻하는 글자가 맺는 관계, 그 해 아래 글자('+SJ_BH[YB]+')가 내 띠·태어난 날 글자와 붙는지 부딪히는지, 기운의 단계를 함께 보는 전통 신년운세입니다. 사주에서 새해는 1월 1일이 아니라 입춘(2월 4일경)에 시작합니다. 참고용.</p>';
      nyLast={me:me,YR:YR,YW:YW};fillNy();
      bindShare(el,YR+" 신년운세",YR+" "+Y.ko+"년 내 운세 "+score+"점 — "+T[0]+" ("+rel+"의 해). 동네보살에서 확인:");
      saveScore(el,YR+"신년운세",YR+" 신년운세",SJ_ILGAN_ID[me.d.s],score,rel+"의 해",Y.ko+"년, 자네에게 "+rel+"의 해일세",T[1],score>=60?"newyear":"worry");askFx(el,{sum:sumCard({ttl:YR+"년 한 장 요약",sub:"이 해의 무게중심",arch:Y.ko+"년 · "+rel+"의 해",archd:score+"점 · "+SJ_TTI[yb]+"띠 · "+SJ_S[me.d.s]+"일간",
        chips:[rel+"의 해",SJ_TTI[yb]+"띠"],axes:sub,pct:{v:nyPct(score,YS,YB),t:YR+"년 운 "+score+"점",n:"60갑자 일주와 12띠를 짝지은 720가지를 같은 계산으로 돌려, "+YR+"년 점수가 "+score+"점 이상인 비율입니다."},
        spoon:"네 칸은 그 해 하늘 글자가 자네를 뜻하는 글자와 맺는 관계로 매긴 점수일세. 낮은 칸은 막히는 곳이 아니라 미리 챙겨 두면 좋은 곳이네."}),toon:[["상반기","diary",YR+"년을 반으로 나눠 보세. 먼저 입춘부터 여름 문턱까지일세."],[YR+"년 미리 챙겨","talisman","미리 챙겨 두면 한 해가 훨씬 수월하네. 하나만 골라 지켜 보게."],["잘 맞는 자리","point","끝으로 이 해와 자네가 잘 맞는 자리, 맞춰 갈 자리일세."]],score:score,pose:score>=60?"newyear":"worry",say:score>=80?YR+"년은 자네 편일세! 복주머니 단단히 매 두게.":score>=60?YR+"년, 자네 걸음대로 가면 되네. 상·하반기 흐름부터 보게.":YR+"년은 차분히 다지는 해일세. 아래 '미리 챙겨 두면 좋은 것'부터 챙기게."});nyDone=true;}
    askWire(el,go,["그 해 글자를 세운다","자네 글자와 견주어 본다","띠와 날 글자의 관계를 짚는다"],"올해 것을 아직 안 물어봤네.");birthDial(el,"#d");}},

  /* 토정비결 — 음력 생일과 볼 해의 음력 달력으로 상·중·하괘를 세워 144괘 가운데 하나를 뽑는다.
     작괘법은 한국민족문화대백과 등 다섯 곳이 같은 공식(세는나이+태세수, 생월 날수+월건수, 생일+일진수).
     월건은 절기가 아니라 음력 월 번호로 정한다(연상기월법). 풀이 원고는 tj/<괘>.json 으로 따로 받는다 */);