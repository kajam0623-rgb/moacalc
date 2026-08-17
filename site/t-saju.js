TOOLS.push({id:"saju",cat:"재미·운세",icon:"",name:"사주팔자 만세력",desc:"오행·십성·대운",render:function(el){
    var ILGAN=["큰 나무처럼 곧고 이끄는 힘이 있는 사람일세. 한번 정한 방향은 좀처럼 꺾지 않아. 명분과 원칙을 중히 여기니 사람들이 믿고 따르네. 다만 융통성 없다는 소리는 자네도 들어봤을 걸세.",
    "덩굴과 화초처럼 유연하고 섬세한 사람일세. 어디 갖다 놔도 적응하지. 부드러워 보여도 살아남는 힘이 질기고, 실속 챙기는 눈이 밝네.",
    "태양처럼 밝고 정열적이며 숨기는 게 없는 사람일세. 사람을 모으는 힘이 있고 말솜씨도 트였네. 대신 감정이 얼굴에 그대로 드러나지.",
    "촛불이나 달빛 같은 사람일세. 따뜻하고 헌신적이며 남이 못 보는 걸 보네. 겉은 온화한데 속에는 아주 단단한 집념이 하나 박혀 있어.",
    "큰 산처럼 묵직하고 신용을 목숨처럼 아는 사람일세. 쉽게 흔들리지 않는 중심이 있어 사람들이 기대오지. 대신 변하는 데는 느리네.",
    "밭의 흙처럼 품이 넓고 성실한 사람일세. 남을 돌보고 길러내는 힘이 좋고, 실무며 관리며 손에 잡히는 일에 강하네.",
    "무쇠나 바위 같은 사람일세. 결단이 빠르고 의리를 아네. 맺고 끊음이 분명해 승부처에서 힘을 내지. 다만 곧은 말이 오해를 사기도 하네.",
    "보석이나 바늘처럼 예리하고 빈틈을 못 견디는 사람일세. 보는 눈과 따지는 머리가 좋고, 세련된 것을 알아보네.",
    "바다나 큰 강처럼 품이 크고 지혜로운 사람일세. 자유를 사랑하고 사람을 품을 줄 아네. 대신 한곳에 매이는 걸 못 견디지.",
    "이슬비나 시냇물처럼 총명하고 감수성이 깊은 사람일세. 스며들듯 남의 마음을 읽어내고, 머릿속에 생각이 늘 많네."];
    var ELDESC={목:"성장·시작·인정",화:"열정·표현·확산",토:"신용·중재·안정",금:"결단·원칙·마무리",수:"지혜·유연·저장"};
    var EL_EN={목:"wood",화:"fire",토:"earth",금:"metal",수:"water"};
    var EL_TITLE={목:["푸른 나무",  "곧게 자라는 사람"],화:["붉은 태양","환하게 비추는 사람"],토:["너른 대지","품어 기르는 사람"],금:["벼린 쇠","맺고 끊는 사람"],수:["깊은 물","고요히 스며드는 사람"]};
    var today=new Date();
    el.innerHTML='<div class="r2"><div><label>생년월일 (양력)</label><input type="date" id="d" value="'+(loadPrefs().birth||"1990-03-15")+'"></div>'+
    '<div><label>태어난 시각</label><select id="t"><option value="">모름 (시주 제외)</option>'+
    Array.from({length:24},function(_,i){var sv=loadPrefs().birthHour!=null?+loadPrefs().birthHour:12;return '<option value="'+i+'"'+(i===sv?' selected':'')+'>'+String(i).padStart(2,"0")+"시</option>";}).join("")+'</select></div></div>'+
    '<div class="r2"><div><label>성별 (대운 방향)</label><select id="g"><option value="m"'+(loadPrefs().gender==="f"?"":" selected")+'>남</option><option value="f"'+(loadPrefs().gender==="f"?" selected":"")+'>여</option></select></div>'+
    '<div><label>진태양시 보정</label><select id="c"><option value="1">적용 (−30분, 한국 표준)</option><option value="0">안 함</option></select></div></div>'+
    // 무엇을 물으러 왔는지를 받는다. 생일만 받으면 결과는 조회가 되고,
    // 물음을 받으면 상담이 된다. 계산은 같고 무엇을 앞에 놓느냐가 달라진다
    '<div style="margin-top:10px"><label>제일 궁금한 것</label><select id="q">'+
      '<option value="all">전체 다 보기</option>'+
      '<option value="money">재물 — 언제 큰돈이 붙나</option>'+
      '<option value="job">일·사업 — 지금 하는 일을 언제까지</option>'+
      '<option value="love">인연 — 언제 만나나</option>'+
      '<option value="health">건강 — 어디를 조심하나</option>'+
    '</select></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">'+ASK_LABEL+'</button>'+
    '<div id="out"></div>';
    function P(p){return SJ_SH[p.s]+SJ_BH[p.b];}
    function cell(s,b,ds){var tg1=s===null?"":sjTenGod(ds,s),tg2=sjTenGod(ds,SJ_BMAIN[b]);
      return '<div class="sj-cell"><div class="sj-han el-'+SJ_EL[SJ_ES[s]]+'">'+SJ_SH[s]+'</div><div class="sj-ko">'+SJ_S[s]+' · '+SJ_EL[SJ_ES[s]]+'</div><div class="sj-tg">'+tg1+'</div></div>'+
      '<div class="sj-cell"><div class="sj-han el-'+SJ_EL[SJ_EB[b]]+'">'+SJ_BH[b]+'</div><div class="sj-ko">'+SJ_B[b]+' · '+SJ_EL[SJ_EB[b]]+'</div><div class="sj-tg">'+tg2+'</div>'+
      '<div class="sj-tg" style="color:var(--muted)">'+sjUnseong(ds,b)+'</div></div>';}
    function go(){
      var dv=el.querySelector("#d").value.split("-"),y=+dv[0],mo=+dv[1],d=+dv[2];
      savePrefs({birth:el.querySelector("#d").value,birthHour:el.querySelector("#t").value,gender:el.querySelector("#g").value});
      track("fortune_view",{tool:"saju"});
      var tv=el.querySelector("#t").value,h=tv===""?null:+tv,corr=el.querySelector("#c").value==="1",male=el.querySelector("#g").value==="m";
      var qsel=el.querySelector("#q"),Q=qsel?qsel.value:"all";
      if(!y){return;}
      var p=sjPillars(y,mo,d,h,0,corr),ds=p.d.s;
      // 오행 카운트
      var cnt=[0,0,0,0,0],chars=[p.y,p.m,p.d];if(p.h)chars.push(p.h);
      chars.forEach(function(c){cnt[SJ_ES[c.s]]++;cnt[SJ_EB[c.b]]++;});
      var tot=cnt.reduce(function(a,b){return a+b;},0);
      var mx=SJ_EL[cnt.indexOf(Math.max.apply(null,cnt))],mn=SJ_EL[cnt.indexOf(Math.min.apply(null,cnt))];
      // 대운
      var fwd=(p.y.s%2===0)===male,jd0=sjJdKST(y,mo,d,h==null?12:h,0);
      function mIdxOf(jd){return Math.floor((((sjSunLong(jd)-315)%360)+360)%360/30);}
      var base=mIdxOf(jd0),days=30;
      for(var t=0.25;t<=32;t+=0.25){if(mIdxOf(jd0+(fwd?t:-t))!==base){days=t;break;}}
      var su=Math.max(1,Math.min(10,Math.round(days/3)));
      var m60=0;for(var k=0;k<60;k++)if(k%10===p.m.s&&k%12===p.m.b){m60=k;break;}
      var duHtml="",duList=[];for(var i2=1;i2<=8;i2++){var kk=((m60+(fwd?i2:-i2))%60+60)%60;
        var dTg=sjTenGod(ds,kk%10),dAge=su+10*(i2-1);
        // el: 대운 천간의 오행. 용신과 맞는 구간인지 판정하는 데 쓴다
        duList.push({age:dAge,g:SJ_SH[kk%10]+SJ_BH[kk%12],tg:dTg,el:SJ_EL[SJ_ES[kk%10]]});
        duHtml+='<div class="sj-du"><div class="a">'+dAge+'세</div><div class="g">'+SJ_SH[kk%10]+SJ_BH[kk%12]+'</div><div class="a" style="color:var(--fun-ink);margin-top:3px">'+dTg+'</div></div>';}
      // 십성 카운트
      var tgc={};chars.forEach(function(c,ci){if(!(ci===2)){var g1=sjTenGod(ds,c.s);tgc[g1]=(tgc[g1]||0)+1;}var g2=sjTenGod(ds,SJ_BMAIN[c.b]);tgc[g2]=(tgc[g2]||0)+1;});
      var tgTop=Object.entries(tgc).sort(function(a,b){return b[1]-a[1];}).slice(0,3).map(function(x){return x[0]+" "+x[1];}).join(" · ");
      var cols=[["시주",p.h?cell(p.h.s,p.h.b,ds):'<div class="sj-cell"><div class="sj-han" style="opacity:.25">?</div><div class="sj-ko">시각 모름</div></div>'],
                ["일주(나)",cell(p.d.s,p.d.b,ds)],["월주",cell(p.m.s,p.m.b,ds)],["연주",cell(p.y.s,p.y.b,ds)]];
      // 신강·신약 / 용신 / 격국 / 신살 / 십이운성
      var st=sjStrength(p),yEl=SJ_EL[st.yong],y2El=SJ_EL[st.yong2],Y=SJ_YONG[yEl];
      var wolTg=sjTenGod(ds,SJ_BMAIN[p.m.b]),gyeok=SJ_GYEOK[wolTg],sinsal=sjSinsal(p),ilUn=sjUnseong(ds,p.d.b);
      // 십성 그룹 집계 (재성·관성·식상·인성·비겁)
      function grp(n){return {"비견":"비겁","겁재":"비겁","식신":"식상","상관":"식상","편재":"재성","정재":"재성","편관":"관성","정관":"관성","편인":"인성","정인":"인성"}[n];}
      var G={비겁:0,식상:0,재성:0,관성:0,인성:0};
      chars.forEach(function(c,ci){if(ci!==2)G[grp(sjTenGod(ds,c.s))]++;G[grp(sjTenGod(ds,SJ_BMAIN[c.b]))]++;});
      var WEAK={목:"간·담과 눈, 근육",화:"심장·소장과 혈액순환",토:"위장·비장 등 소화기",금:"폐·대장과 호흡기·피부",수:"신장·방광과 뼈·귀"};
      /* 운세 4종. 판정 한 줄로 끝내면 읽고 나서 남는 게 없다.
         [판정] · [왜 — 명식의 근거] · [그래서 — 용신의 처방] 세 토막으로 쓴다.
         전부 계산에서 나온 값이다. 새로 지어낸 해석이 아니다. */
      var P="<br><br>";
      // 운세 본문에서 "지금 어느 때인가"를 쓰려면 현재 대운이 먼저 있어야 한다
      var duNow=duList.filter(function(d){return d.age<=(new Date().getFullYear()-y+1);}).pop()||duList[0];
      var duG=grp(duNow.tg);   // 지금 대운이 어느 십성 무리인지
      var moneyBase=G.재성===0?"자네 사주엔 재성이 드러나 있지 않네. 큰돈을 좇기보다 <b>꾸준한 수입 구조</b>를 만드는 쪽이 훨씬 잘 맞아. 월급이든 계약이든 정해진 흐름에서 차곡차곡 모으게."
        :G.재성>=3?"재성이 <b>많네</b>. 돈을 다루는 감이 좋고 기회도 자주 오지. 그런데 일간이 그걸 감당할 힘이 없으면 되레 돈에 쫓기는 구조가 되네. 자네한텐 버는 것보다 <b>관리와 분산</b>이 관건일세."
        :"재성이 <b>알맞네</b>. 현실 감각이 살아 있어 들고 나는 걸 스스로 맞출 줄 아네. 무리한 확장만 안 하면 재물은 무난하게 흐르겠어.";
      var money=moneyBase+P+
        (G.재성?"명식에 재성이 "+G.재성+"자리 들었네. ":"명식에 재성이 한 자리도 없네. ")+(st.strong
          ?"일간이 신강하니 그 재물을 감당할 힘은 있네. 벌어들인 걸 지킬 그릇이 된다는 뜻일세. 기회가 왔을 때 손을 뻗어도 좋아."
          :"허나 일간이 신약하니 재물을 감당할 힘이 얇네. 크게 벌리는 것보다 새는 자리를 먼저 막는 게 순서일세. 빚과 보증은 특히 조심하게.")+P+
        "돈이 드나드는 자리는 용신 "+yEl+"의 결을 따르게. "+Y.color+" 계열을 가까이 두고 "+Y.dir+" 방향을 눈여겨보게. 일로는 "+Y.job+" 쪽이 재물의 길과 가깝네."+P+
        "시기로 보면 지금 대운이 "+duNow.tg+"("+duG+")일세. "+(duG==="재성"?"재물이 직접 오가는 구간이라 벌이가 느는 때야. 다만 나가는 자리도 같이 커지니 장부를 자주 들여다보게."
          :duG==="비겁"?"경쟁과 지출이 함께 붙는 구간이라 돈이 새기 쉽네. 큰 결제는 하루 묵혀 두고 정하게."
          :duG==="식상"?"재물을 낳는 뿌리가 자라는 구간일세. 당장의 수입보다 만들어 두는 데 힘을 쓰게."
          :duG==="관성"?"자리와 책임이 먼저 커지는 구간이라 수입은 뒤따라오네. 조급해하지 말게."
          :"배우고 쌓는 구간이라 재물은 잔잔하네. 이때 준비해 두면 다음 대운에서 그대로 쓰네.");
      var jobBase=G.관성===0?"관성이 없네. 조직의 틀에 매이면 자네가 답답해서 못 견디는 구조야. <b>전문성이든 프리랜서든 자기 사업이든</b>, 규칙을 스스로 정하는 자리에서 능력이 나오네."
        :G.관성>=3?"관성이 <b>강하네</b>. 책임과 자리를 맡는 힘이 있는데 그만큼 눌리는 것도 크지. 권한이 분명한 조직에서 실력으로 인정받는 짜임이 잘 맞아."
        :G.식상>=3?"식상이 발달했네. <b>표현하고 만들어내는 일</b>이 자네 강점일세. 정해진 매뉴얼보다 기획이든 창작이든 교육이든, 결과를 스스로 만드는 데서 빛나네."
        :"관성이 알맞네. <b>조직이든 자율이든 어느 쪽도 감당</b>할 수 있는 구조야. 역할이 분명하고 성과가 눈에 보이는 자리에서 만족이 크겠어.";
      var jobLean=G.식상>G.관성?"만들어 내놓는 쪽":(G.식상<G.관성?"맡아 지키는 쪽":"양쪽이 팽팽한 쪽");
      var job=jobBase+P+
        "관성 "+G.관성+" · 식상 "+G.식상+" · 인성 "+G.인성+"의 짜임일세. 관성은 맡아 지키는 힘, 식상은 만들어 내놓는 힘, 인성은 배워 쌓는 힘이야. 자네는 <b>"+jobLean+"</b>에 무게가 실려 있네."+P+
        "격국이 "+gyeok+josa(gyeok,"라/이라")+" 그 뼈대 위에서 일을 고르면 덜 흔들리네. 용신이 "+yEl+josa(yEl,"라/이라")+" "+Y.job+" 쪽 결이 맞고, 일하다 막히거든 이런 걸 곁들이게 — "+Y.act+"."+P+
        (st.strong?"일간이 신강하니 <b>제 이름으로 하는 일</b>에서 힘이 나네. 남 밑에서 오래 눌려 있으면 답답해서 오래 못 버티지. 결정권이 있는 자리로 옮겨갈수록 성과가 붙네."
          :"일간이 신약하니 <b>기댈 틀이 있는 자리</b>가 낫네. 혼자 다 짊어지면 금세 지치지. 좋은 조직과 스승을 만나면 자네 실력이 두 배로 서네.");
      var loveBase=male?(G.재성===0?"남자 사주에서 재성은 배우자 자리일세. 그게 드러나 있지 않으니 인연이 늦거나 조용히 오는 편이야. 조건 따지지 말고 <b>같이 있을 때 편한 사람</b>을 기준으로 삼게."
        :G.재성>=3?"재성이 많아 <b>이성 인연이 잦은</b> 구조일세. 고를 게 많은 만큼 기준이 흔들리기 쉬우니, 오래 볼 사람인지 한 번 더 보고 정하게."
        :"재성이 알맞아 <b>연애도 결혼도 안정적인</b> 구조일세. 생활 리듬이 맞는 사람과 오래가네.")
        :(G.관성===0?"여자 사주에서 관성은 배우자 자리일세. 그게 드러나 있지 않으니 인연이 늦거나 자네가 끌고 가는 관계가 되기 쉬워. 기다리지 말고 <b>먼저 다가가는 편</b>이 낫네."
        :G.관성>=3?"관성이 많아 <b>이성의 관심은 잦은데</b> 그만큼 부담도 큰 구조일세. 나를 존중하는 사람인지, 책임질 줄 아는 사람인지를 기준에 두게."
        :"관성이 알맞아 <b>연애도 결혼도 안정적인</b> 구조일세. 책임을 나눠 질 줄 아는 사람과 잘 맞네.");
      var love=loveBase+P+
        "일지는 배우자 자리일세. 자네 일지는 "+SJ_B[p.d.b]+"("+SJ_BH[p.d.b]+")이고, 일간이 거기서 <b>"+ilUn+"</b> 자리에 앉아 있네. 배우자 궁의 기운이 그 단계에 놓였다는 뜻이야."+P+
        "곁에 둘 사람은 용신 "+yEl+"의 결을 지닌 이가 편하네. "+ELDESC[yEl]+" — 이런 기운을 가진 사람일세. 조건을 먼저 보지 말고, 같이 있을 때 숨이 트이는지를 보게."+P+
        "시기로 보면 지금 대운이 "+duNow.tg+"("+duG+")일세. "+((male&&duG==="재성")||(!male&&duG==="관성")
          ?"배우자 자리에 해당하는 기운이 들어와 있는 구간이라 인연이 움직이기 쉬운 때야. 사람을 만나는 자리에 몸을 두게."
          :"배우자 자리와 곧바로 닿는 구간은 아닐세. 조급히 굴기보다 자네 결을 다져두게. 준비된 사람에게 다음 흐름이 사람을 데려오네.");
      var healthBase=cnt[SJ_ES[0]]!==undefined?("오행 중 <b>"+mn+"</b>"+josa(mn,"가/이")+" 가장 약하네. 명리에서 "+mn+josa(mn,"는/은")+" "+WEAK[mn]+josa(WEAK[mn],"와/과")+" 이어져 있어. 무리가 쌓이면 거기부터 신호가 오니 평소에 챙겨두게."):"";
      var health=healthBase?(healthBase+P+
        "반대로 "+mx+josa(mx,"가/이")+" 과한 편일세. 한쪽으로 몰린 기운은 몸에서 먼저 표가 나는 법이야. "+WEAK[mx]+" 쪽도 함께 살펴두면 좋네."+P+
        "계절로는 "+Y.season+"에 몸이 순해지네. 무리가 느껴지거든 이런 활동으로 기운을 돌리게 — "+Y.act+". 색으로는 "+Y.color+josa(Y.color,"를/을")+" 가까이 두면 도움이 되고."+P+
        (st.strong?"기운이 넘치는 사주라 안에 쌓아두면 탈이 나네. 땀을 내어 밖으로 덜어내는 운동이 자네한테는 약일세."
          :"기운이 얇은 사주라 한번 몰아치면 오래 못 가네. 길게 무리하기보다 짧게 자주 쉬는 쪽이 맞아. 잠이 제일 큰 보약일세.")):"";
      var DUTXT={"비견":"자립과 동료의 시기일세. 제 힘으로 밀고 나가기 좋으나 동업은 경계를 분명히 하게.","겁재":"경쟁과 지출의 시기야. 사람은 얻되 돈은 새기 쉬우니 관리가 핵심일세.","식신":"표현과 결실의 시기일세. 만들고 낳는 일에 볕이 들고 몸도 편안하네.","상관":"변화와 도전의 시기야. 틀을 깨는 힘이 강하나 윗사람과의 마찰은 조심하게.","편재":"큰돈이 오가는 시기일세. 기회가 많은 만큼 흔들림도 크네.","정재":"안정과 축적의 시기야. 성실함이 그대로 자산이 되네.","편관":"시험과 승부의 시기일세. 부담이 크지만 통과하면 급이 오르네.","정관":"명예와 자리의 시기야. 승진이든 합격이든 공적인 인정운이 밝네.","편인":"공부와 전환의 시기일세. 속으로 자라는 때이니 결정은 좀 묵혔다 내리게.","정인":"귀인과 문서의 시기야. 어른과 기관의 도움, 그리고 배움이 따르네."};
      /* 대운 구간별 해설. 간지만 늘어놓으면 자기 구간을 못 찾는다.
         구간마다 십성 뜻과, 그 구간이 용신에 맞는지까지 짚는다 — 둘 다 계산값이다. */
      // u: 대운이면 "구간", 세운이면 "해". 같은 문장을 쓰면 세운을 구간이라 부르게 된다
      function duFit(e,u){
        u=u||"구간";
        return e===yEl?"용신 "+yEl+josa(yEl,"와/과")+" 같은 기운이라 <b>순하게 풀리는 "+u+"</b>일세."
          // u가 "구간"이면 받침이 있고 "해"면 없다. 조사를 박아두면 "해이야"가 나온다
          :e===y2El?"보조용신 "+y2El+josa(y2El,"와/과")+" 같은 기운이라 <b>도움이 붙는 "+u+"</b>"+josa(u,"야/이야")+"."
          :"용신과는 결이 다른 "+u+josa(u,"라/이라")+" <b>벌이기보다 다지는 때</b>로 삼게.";}
      var duDetail=duList.map(function(dd){
        var cur=dd.age===duNow.age;
        return '<p style="margin:0 0 12px">'+(cur?'▶ ':'')+'<b>'+dd.age+'세 ~ '+(dd.age+9)+'세</b> · '+dd.g+' · '+dd.tg+' ('+dd.el+')'+
          (cur?' <b style="color:var(--fun-ink)">지금 여기</b>':'')+'<br>'+DUTXT[dd.tg]+' '+duFit(dd.el)+'</p>';}).join("");

      /* 물음에 답하는 자리.
         사람들은 명식표를 보러 오지 않는다. "언제"와 "그래서 뭘"을 보러 온다.
         둘 다 이미 계산돼 있는데 여태 표로만 흩어놓고 있었다.
         주제에 맞는 십성 무리와 용신이 함께 드는 대운 구간을 골라 답으로 만든다. */
      var QMETA={
        money:{t:"재물",grp:["재성"],why:"재성이 돈이 들어오는 자리라 그렇네.",
          plan:"그때까지는 새는 자리를 막고 종잣돈을 모아두게. 그릇을 먼저 키워야 큰돈이 담기네."},
        job:{t:"일·사업",grp:["관성","식상"],why:"관성은 자리와 책임을, 식상은 만들어 내놓는 힘을 뜻하네.",
          plan:"그때를 겨냥해 사람과 시스템을 미리 갖춰두게. 혼자 뛰는 방식으로는 그 판을 못 받네."},
        love:{t:"인연",grp:[male?"재성":"관성"],why:male?"남자 사주에서는 재성이 배우자 자리라 그렇네.":"여자 사주에서는 관성이 배우자 자리라 그렇네.",
          plan:"그때까지는 자네 결을 다져두게. 준비된 사람한테 인연이 오는 법일세."},
        health:{t:"건강",grp:[],why:"몸은 용신이 채워지는 때에 편해지는 법일세.",
          plan:"그 전까지가 고비일세. 무리를 줄이고 잠을 먼저 지키게."}
      };
      function span(dd){return dd.age+"세~"+(dd.age+9)+"세";}
      // 큰 흐름이 지났을 때, 지금 구간이 무엇에 좋은지로 답을 돌려주기 위한 표
      var GRP_GOOD={비겁:"사람과 자립",식상:"만들어 내놓는 일",재성:"재물",관성:"자리와 이름",인성:"배움과 문서"};
      function focusBlock(){
        if(!QMETA[Q])return "";
        var M=QMETA[Q], nowAge=new Date().getFullYear()-y+1;
        var inGrp=function(dd){return M.grp.indexOf(grp(dd.tg))>=0;};
        var inYong=function(dd){return dd.el===yEl||dd.el===y2El;};
        /* 조건을 느슨하게 잡으면 여덟 구간이 전부 "좋은 때"로 나온다. 그건 답이 아니다.
           십성과 용신이 함께 드는 구간을 먼저 찾고, 없을 때만 십성 하나로 내려간다.
           건강은 해당 십성이 없으니 용신으로만 본다. */
        var both=duList.filter(function(dd){return inGrp(dd)&&inYong(dd);});
        var loose=duList.filter(function(dd){return M.grp.length?inGrp(dd):inYong(dd);});
        var pool=both.length?both:loose;
        // 앞에서부터 자르면 다 지나간 어린 시절 구간만 뽑힌다. 아직 남은 때를 먼저 보여준다
        var future=pool.filter(function(dd){return dd.age+9>=nowAge;});
        var pick=(future.length?future:pool).slice(0,3), tight=both.length>0;
        var nowIn=pool.some(function(dd){return dd.age===duNow.age;});
        var next=pool.filter(function(dd){return dd.age>nowAge;})[0];   // 아직 시작 안 한 구간만
        return '<div class="sj-sec" style="border:1px solid var(--fun-ink);border-radius:12px;padding:14px 16px">'+
          '<h3 style="margin-top:0">자네가 물은 것 — '+M.t+'</h3>'+
          '<p>지금은 <b>'+span(duNow)+'</b>, '+duNow.tg+'('+grp(duNow.tg)+') 대운일세. '+
          (nowIn?'<b>지금이 바로 그때일세.</b> '+M.t+'에 볕이 드는 구간 안에 들어와 있네.'
                :'물은 '+M.t+'과는 직접 닿지 않는 구간이야. 지금은 힘을 모으는 때일세.')+'</p>'+
          (pick.length
            ?'<p>여든까지 여덟 구간 가운데 '+M.t+'에 볕이 드는 때는 <b>'+pick.map(span).join(" · ")+'</b>일세. '+
              (tight?'십성과 용신이 함께 드는 구간이라 그중에서도 힘이 실리네. ':'')+M.why+'</p>'
            :'<p>여덟 구간 가운데 '+M.t+josa(M.t,"와/과")+' 곧바로 닿는 때는 없네. '+M.why+'</p>')+
          // 구간 표기는 늘 "…세"로 끝나 받침이 없다. 조사는 항상 "는"이다
          /* 여기서 "지나왔다"로 끝내면 안 된다. 대운 여덟 구간은 여든까지일 뿐이고,
             큰 흐름이 지났다면 지금 구간이 무엇에 좋은지로 답을 돌려줘야 한다. */
          (next?'<p>다음으로 열리는 때는 <b>'+next.age+'세</b>부터일세. '+M.plan+'</p>'
               :(nowIn?'<p>지금 구간이 그 마지막일세. 이때를 흘려보내지 말게. '+M.plan+'</p>'
               :(!pool.length
                      // 애초에 해당 구간이 없던 경우다. "지나왔다"고 하면 거짓말이 된다
                      ?'<p>그러니 '+M.t+josa(M.t,"는/은")+' 대운보다 해마다 드는 운에서 갈리네. 지금은 '+duNow.tg+
                        ' 대운이라 <b>'+GRP_GOOD[grp(duNow.tg)]+'</b>에 힘이 실리는 때일세.</p>'
                      :'<p>큰 흐름으로 보면 '+M.t+'의 때는 지나왔네. 다만 지금은 '+duNow.tg+
                        ' 대운이라 <b>'+GRP_GOOD[grp(duNow.tg)]+'</b>에 힘이 실리는 때일세. '+
                        M.t+josa(M.t,"는/은")+' 이제 해마다 드는 운에서 갈리니 그쪽을 봐야 하네.</p>')))+
          '<p>어느 때든 자네를 받치는 건 용신 '+yEl+'일세. '+Y.act+' — 이런 걸 곁에 두게.</p>'+
          '<span style="color:var(--muted);font-size:12.5px">대운의 십성과 오행을 용신과 대조해 고른 구간입니다. 아래에 항목별 풀이가 이어집니다.</span></div>';
      }

      // 물은 주제를 맨 앞으로 올린다. 계산은 그대로고 순서만 바꾼다
      var SEC={
        money:'<div class="sj-sec"><h3>재물운</h3><p>'+money+'</p></div>',
        job:'<div class="sj-sec"><h3>직업운</h3><p>'+job+'</p></div>',
        love:'<div class="sj-sec"><h3>애정운</h3><p>'+love+'</p></div>',
        health:'<div class="sj-sec"><h3>건강운</h3><p>'+health+'</p></div>'};
      var ORDER=["money","job","love","health"];
      if(QMETA[Q])ORDER=[Q].concat(ORDER.filter(function(k){return k!==Q;}));
      var secFortune=ORDER.map(function(k){return SEC[k];}).join("");

      /* 올해 세운. 앞에서 "해마다 드는 운에서 갈리니 그쪽을 보라"고 해놓고
         정작 보여주지 않으면 말이 빈다. 오늘 날짜로 사주를 한 번 더 세워 연주를 가져온다.
         해가 입춘에 바뀌는 처리는 sjPillars가 이미 한다. */
      var nowD=new Date();
      var seP=sjPillars(nowD.getFullYear(),nowD.getMonth()+1,nowD.getDate(),12,0,false);
      var seTg=sjTenGod(ds,seP.y.s), seEl=SJ_EL[SJ_ES[seP.y.s]];
      var seSec='<div class="sj-sec"><h3>올해 세운 — '+nowD.getFullYear()+' '+
        SJ_S[seP.y.s]+SJ_B[seP.y.b]+'('+SJ_SH[seP.y.s]+SJ_BH[seP.y.b]+')년</h3>'+
        '<p>올해 하늘 글자는 '+SJ_S[seP.y.s]+'('+seEl+')일세. 자네 일간에게는 <b>'+seTg+'</b>에 해당하네.<br><br>'+
        DUTXT[seTg]+' '+duFit(seEl,"해")+'<br><br>'+
        '대운이 십 년의 큰 결이라면 세운은 그해의 결일세. 큰 흐름이 좋아도 그해가 눌리면 더디게 가고, '+
        '큰 흐름이 얇아도 그해가 받쳐주면 일이 되네. 두 개를 겹쳐 봐야 그해의 무게가 나오는 게야.'+
        '<br><span style="color:var(--muted);font-size:12.5px">오늘 날짜로 연주를 다시 세워 구했습니다. 해는 양력 1월이 아니라 입춘을 기준으로 바뀝니다.</span></p></div>';

      // 십성 분포는 숫자만 나열돼 있었다. 어느 축으로 사는 사람인지까지 읽어준다
      var GRP_MEAN={비겁:"내 힘과 사람",식상:"표현과 재능",재성:"현실 감각과 돈",관성:"책임과 자리",인성:"배움과 받는 힘"};
      var gTop=Object.keys(G).sort(function(a,b){return G[b]-G[a];})[0];
      var gZero=Object.keys(G).filter(function(k){return G[k]===0;});
      var gTxt='가장 두터운 자리는 <b>'+gTop+'</b>('+GRP_MEAN[gTop]+')일세. 자네 삶이 그 축으로 굴러간다는 뜻이야.'+
        (gZero.length
          ?' 반대로 '+gZero.join("·")+josa(gZero[gZero.length-1],"가/이")+' 비어 있네. 없는 자리는 평생 목마른 자리라, '+
            '그쪽을 채워주는 사람이나 일을 곁에 두면 숨통이 트이네.'
          :' 다섯 자리가 고루 들어 어느 한쪽으로도 치우치지 않는 짜임일세. 무난한 대신 뾰족한 무기는 스스로 만들어야 하네.');

      // 용신 활용법이 목록만 있었다. 왜 이 기운인지와 어떻게 쓰는지를 붙인다
      var yongWhy=(st.strong
        ?'자네는 힘이 넘치는 쪽이라, 용신 '+yEl+josa(yEl,"는/은")+' 그 힘을 밖으로 빼주는 자리일세.'
        :'자네는 힘이 얇은 쪽이라, 용신 '+yEl+josa(yEl,"는/은")+' 자네를 받쳐 채워주는 자리일세.')+
        ' 타고난 걸 억지로 바꾸라는 말이 아니야. 이 기운이 도는 자리에 몸을 두라는 말일세.';
      var yongHow='옷이나 물건은 '+Y.color+' 쪽으로, 이사나 사무실은 '+Y.dir+' 방향으로 잡게. '+
        '큰일은 '+Y.season+'에 벌이면 결이 맞고, 일은 '+Y.job+' 쪽이 몸에 붙네. '+
        '지칠 땐 이런 걸로 기운을 돌리게 — '+Y.act+'.';

      /* 제목과 맺음말.
         여태 결과가 항목 나열로 시작해 나열로 끝났다. 읽는 사람은 자기 얘기가
         어떤 그림인지 먼저 보고, 마지막엔 사람 말 한마디를 듣고 싶어 한다.
         둘 다 계산값(최강·최약 오행, 신강신약, 용신)에서 나온다. */
      var EL_STRONG={목:"뻗어 오르는 나무",화:"타오르는 불",토:"두텁게 쌓인 흙",금:"벼려진 쇠",수:"깊이 흐르는 물"};
      var EL_NEED={목:"뿌리내릴 나무",화:"데워줄 불",토:"붙잡아줄 흙",금:"맺고 끊을 쇠",수:"식혀줄 물"};
      // 오행이 고르면 최강과 최약이 같은 글자로 나온다. 그때는 다른 제목을 쓴다
      var headTxt=(mx===mn)?"기운이 고르게 퍼진 사주"
        :EL_STRONG[mx]+' 사이에서<br>'+EL_NEED[mn]+josa(EL_NEED[mn],"를/을")+' 찾는 사주';
      var headline='<div style="text-align:center;margin:6px 0 18px">'+
        '<div style="font-size:19px;font-weight:800;line-height:1.45">'+headTxt+'</div>'+
        '<div style="color:var(--muted);font-size:13px;margin-top:7px">'+SJ_S[ds]+'('+SJ_SH[ds]+') 일간 · '+
        (st.strong?"신강":"신약")+' · 용신 '+yEl+'</div></div>';
      var closing='<div class="sj-sec"><h3>맺는 말</h3><p>'+
        (st.strong
          ?'자네는 기운이 넘치는 사람일세. 여태 남한테 기대지 않고 제 힘으로 밀고 온 값이 그 안에 있어. 다만 넘치는 건 덜어내야 탈이 안 나네.'
          :'자네는 기운이 얇은 사람일세. 그래서 여태 남보다 몇 배로 애를 썼을 게야. 부족해서가 아니라 그렇게 생긴 짜임이라 그런 걸세.')+
        '<br><br>'+
        (st.strong
          ?'모자란 '+mn+'의 자리를 채우고, 넘치는 힘은 밖으로 쓸 길을 열어두게. 그러면 그 힘이 짐이 아니라 연장이 되네.'
          :'혼자 다 지려 말게. 용신 '+yEl+' 기운을 곁에 두면 자네 힘은 두 배로 서네. 기대는 건 약한 게 아닐세.')+
        '<br><br>여기 적힌 건 타고난 결일세. 결을 알면 거스르지 않고 탈 수 있네. 오늘 하루도 잘 살아내게.</p></div>';
      el.querySelector("#out").innerHTML=
        headline+
        '<div class="sj-grid">'+cols.map(function(c){return '<div class="sj-col"><div class="h">'+c[0]+'</div>'+c[1]+'</div>';}).join("")+'</div>'+
        '<div class="sj-bars">'+SJ_EL.map(function(e,i){return '<div class="sj-bar"><span class="n el-'+e+'">'+e+'</span><span class="t"><i class="bg-'+e+'" style="width:'+(tot?cnt[i]/tot*100:0)+'%"></i></span><span class="c">'+cnt[i]+'</span></div>';}).join("")+'</div>'+
        '<div class="out" style="margin-top:18px"><div class="k">일간의 힘</div><div class="v" style="font-size:26px">'+(st.strong?"신강":"신약")+'<small> · 용신 '+yEl+'</small></div>'+
        '<div class="s">돕는 기운 '+Math.round(st.ratio*100)+'% · 보조용신 '+y2El+'</div></div>'+
        focusBlock()+
        '<div class="sj-char"><img src="img/char/el-'+EL_EN[SJ_EL[SJ_ES[ds]]]+'-'+(male?"m":"f")+'.webp" alt="'+SJ_EL[SJ_ES[ds]]+' 오행 캐릭터" loading="lazy" onerror="this.closest(\'.sj-char\').remove()">'+
        '<div class="cap"><div class="t">'+SJ_EL[SJ_ES[ds]]+'('+SJ_SH[ds]+') 일간 · '+(male?"남":"여")+'</div><div class="n">'+EL_TITLE[SJ_EL[SJ_ES[ds]]][0]+'</div>'+
        '<p>'+EL_TITLE[SJ_EL[SJ_ES[ds]]][1]+' · '+ELDESC[SJ_EL[SJ_ES[ds]]]+'의 기운을 타고났네.</p></div></div>'+
        '<div class="sj-sec"><h3>일간 — '+SJ_S[ds]+'('+SJ_SH[ds]+') '+SJ_EL[SJ_ES[ds]]+'</h3><p>'+ILGAN[ds]+'</p></div>'+
        '<div class="sj-sec"><h3>격국 — '+gyeok+'</h3><p>'+conceptArt(ART_GYEOK[gyeok],gyeok)+''+SJ_GYEOK_DESC[gyeok]+'<br><br>격국은 타고난 그릇의 모양일세. '+
        (st.strong?'자네는 힘이 넉넉하니 이 틀을 크게 벌려 써도 버티네. 판을 키우는 쪽이 맞아.'
                  :'자네는 힘이 얇으니 이 틀을 좁게 잡고 깊이 파는 편이 낫네. 넓히기보다 하나를 끝까지 밀게.')+
        '<br><span style="color:var(--muted);font-size:12.5px">월지 '+SJ_B[p.m.b]+'('+SJ_BH[p.m.b]+')의 본기가 '+wolTg+'이라 '+gyeok+'으로 봅니다. 격국은 사주 전체의 뼈대이자 타고난 그릇의 모양입니다.</span></p></div>'+
        // 회색 소자 = 계산 근거 주석. 보살 말투는 풀이 본문에만 쓴다
        (sinsal.length?'<div class="sj-sec"><h3>신살 — '+sinsal.length+'개</h3><p>'+conceptArt(ART_SINSAL[sinsal[0]],sinsal[0])+''+sinsal.map(function(s){return '<b>'+s+'</b> — '+SJ_SINSAL_DESC[s];}).join("<br><br>")+'</p></div>'
          :'<div class="sj-sec"><h3>신살</h3><p>두드러진 신살이 없는 담백한 구조일세. 큰 기복 없이 제 걸음을 지키는 편이고, 오행과 십성의 흐름이 그대로 드러나네.</p></div>')+
        '<div class="sj-sec"><h3>십이운성 — 일지 '+ilUn+'</h3><p>자네 일간 '+SJ_S[ds]+'는 일지 '+SJ_B[p.d.b]+'에서 <b>'+ilUn+'</b> 자리에 앉아 있네.<br><br>'+SJ_UN_DESC[ilUn]+'<br><span style="color:var(--muted);font-size:12.5px">십이운성은 일간의 기운이 각 자리에서 어느 단계에 있는지를 사람의 일생에 빗대어 본 것입니다. 명식표의 지지 아래에 각각 표시했습니다.</span></p></div>'+
        '<div class="sj-sec"><h3>신강·신약과 용신</h3><p>일간을 돕는 기운이 '+Math.round(st.ratio*100)+'%로 <b>'+(st.strong?"신강":"신약")+'</b>한 사주일세. '+
        (st.strong?"힘이 넘치니 그걸 <b>밖으로 써서 덜어내야</b> 하네.":"힘이 얇으니 <b>자네를 받쳐 채워줄</b> 기운이 있어야 하네.")+
        ' 그래서 용신은 <b>'+yEl+'</b>, 보조로 '+y2El+josa(y2El,"를/을")+' 쓰네. 이 기운을 가까이 둘수록 일이 순하게 풀려.</p></div>'+
        '<div class="sj-sec"><h3>용신 '+yEl+' 활용법</h3><p>'+yongWhy+'<br><br>'+
        '· 색: <b>'+Y.color+'</b>  · 방향: <b>'+Y.dir+'</b>  · 계절: '+Y.season+'<br>· 잘 맞는 일: '+Y.job+'<br>· 도움이 되는 활동: '+Y.act+'<br><br>'+
        yongHow+'</p></div>'+
        secFortune+
        '<div class="sj-sec"><h3>오행 균형</h3><p>'+conceptArt(ART_SAENG[SJ_EL.indexOf(mn)],mn+josa(mn,"를/을")+" 낳는 상생")+mx+'('+ELDESC[mx]+')의 기운이 가장 강하고 '+mn+'('+ELDESC[mn]+')이 상대적으로 약하네. 강한 기운은 재능인 동시에 과할 때 그림자가 되는 법일세. 모자란 '+mn+'의 자리를 일부러 채워주면 균형이 잡히네.</p></div>'+
        '<div class="sj-sec"><h3>십성 분포</h3><p>비겁 '+G.비겁+' · 식상 '+G.식상+' · 재성 '+G.재성+' · 관성 '+G.관성+' · 인성 '+G.인성+'<br><br>'+
        gTxt+'<br><span style="color:var(--muted);font-size:12.5px">비겁은 자립심, 식상은 표현·재능, 재성은 현실 감각, 관성은 책임·조직, 인성은 학문·수용력을 뜻합니다.</span></p></div>'+
        seSec+
        '<div class="sj-sec"><h3>대운 (10년 주기 · '+(fwd?"순행":"역행")+')</h3><div class="sj-daeun">'+duHtml+'</div>'+
        '<p style="margin-top:12px">지금은 <b>'+duNow.age+'세 '+duNow.g+' ('+duNow.tg+')</b> 대운일세. '+DUTXT[duNow.tg]+' '+duFit(duNow.el)+'</p></div>'+
        '<div class="sj-sec"><h3>대운 구간별 흐름 — 80년</h3>'+duDetail+
        '<p style="color:var(--muted);font-size:12.5px;margin-top:4px">대운은 10년마다 바뀌는 큰 흐름입니다. 태어난 날부터 절기까지의 날수로 시작 나이를 정하며, 여기서는 8개 구간을 보여드립니다. 괄호 안은 그 구간 천간의 오행입니다.</p></div>'+
        closing+
        // 저장·소장 경로. 브라우저 인쇄 대화상자에서 "PDF로 저장"을 고르면 파일이 된다
        '<div style="text-align:center;margin:18px 0 4px">'+
        '<button type="button" id="pdf" style="padding:11px 20px;border:1px solid var(--line-2);'+
        'background:var(--surface-2);color:var(--ink);font:inherit;font-weight:700;border-radius:10px;cursor:pointer">'+
        'PDF로 저장 · 인쇄</button>'+
        '<div style="color:var(--muted);font-size:12px;margin-top:6px">인쇄 창에서 대상을 “PDF로 저장”으로 고르면 됩니다.</div></div>'+
        '<p class="note">'+p.tti+'띠 · 절기(태양황경) 기반 만세력 · 진태양시 보정 '+(corr?"적용":"미적용")+'. 신강·신약은 월령·득지 가중으로, 용신은 억부(抑扶) 기준으로 산출했습니다. 전통 명리학의 해석 틀에 따른 참고용 풀이입니다.</p>';
      var pdfBtn=el.querySelector("#pdf");
      if(pdfBtn)pdfBtn.addEventListener("click",function(){track("saju_print",{});window.print();});
      askFx(el,{});}
    askWire(el,go,["생년월일로 사주 여덟 글자를 세우고","일간의 힘부터 재어 본다","격국과 신살을 짚는다"],"명식을 아직 안 뽑았네.");birthDial(el,"#d");}});