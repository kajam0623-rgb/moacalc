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
        duList.push({age:dAge,g:SJ_SH[kk%10]+SJ_BH[kk%12],tg:dTg});
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
      var money=G.재성===0?"자네 사주엔 재성이 드러나 있지 않네. 큰돈을 좇기보다 <b>꾸준한 수입 구조</b>를 만드는 쪽이 훨씬 잘 맞아. 월급이든 계약이든 정해진 흐름에서 차곡차곡 모으게."
        :G.재성>=3?"재성이 <b>많네</b>. 돈을 다루는 감이 좋고 기회도 자주 오지. 그런데 일간이 그걸 감당할 힘이 없으면 되레 돈에 쫓기는 구조가 되네. 자네한텐 버는 것보다 <b>관리와 분산</b>이 관건일세."
        :"재성이 <b>알맞네</b>. 현실 감각이 살아 있어 들고 나는 걸 스스로 맞출 줄 아네. 무리한 확장만 안 하면 재물은 무난하게 흐르겠어.";
      var job=G.관성===0?"관성이 없네. 조직의 틀에 매이면 자네가 답답해서 못 견디는 구조야. <b>전문성이든 프리랜서든 자기 사업이든</b>, 규칙을 스스로 정하는 자리에서 능력이 나오네."
        :G.관성>=3?"관성이 <b>강하네</b>. 책임과 자리를 맡는 힘이 있는데 그만큼 눌리는 것도 크지. 권한이 분명한 조직에서 실력으로 인정받는 짜임이 잘 맞아."
        :G.식상>=3?"식상이 발달했네. <b>표현하고 만들어내는 일</b>이 자네 강점일세. 정해진 매뉴얼보다 기획이든 창작이든 교육이든, 결과를 스스로 만드는 데서 빛나네."
        :"관성이 알맞네. <b>조직이든 자율이든 어느 쪽도 감당</b>할 수 있는 구조야. 역할이 분명하고 성과가 눈에 보이는 자리에서 만족이 크겠어.";
      var love=male?(G.재성===0?"남자 사주에서 재성은 배우자 자리일세. 그게 드러나 있지 않으니 인연이 늦거나 조용히 오는 편이야. 조건 따지지 말고 <b>같이 있을 때 편한 사람</b>을 기준으로 삼게."
        :G.재성>=3?"재성이 많아 <b>이성 인연이 잦은</b> 구조일세. 고를 게 많은 만큼 기준이 흔들리기 쉬우니, 오래 볼 사람인지 한 번 더 보고 정하게."
        :"재성이 알맞아 <b>연애도 결혼도 안정적인</b> 구조일세. 생활 리듬이 맞는 사람과 오래가네.")
        :(G.관성===0?"여자 사주에서 관성은 배우자 자리일세. 그게 드러나 있지 않으니 인연이 늦거나 자네가 끌고 가는 관계가 되기 쉬워. 기다리지 말고 <b>먼저 다가가는 편</b>이 낫네."
        :G.관성>=3?"관성이 많아 <b>이성의 관심은 잦은데</b> 그만큼 부담도 큰 구조일세. 나를 존중하는 사람인지, 책임질 줄 아는 사람인지를 기준에 두게."
        :"관성이 알맞아 <b>연애도 결혼도 안정적인</b> 구조일세. 책임을 나눠 질 줄 아는 사람과 잘 맞네.");
      var health=cnt[SJ_ES[0]]!==undefined?("오행 중 <b>"+mn+"</b>"+josa(mn,"가/이")+" 가장 약하네. 명리에서 "+mn+josa(mn,"는/은")+" "+WEAK[mn]+"과 이어져 있어. 무리가 쌓이면 거기부터 신호가 오니 평소에 챙겨두게. 반대로 "+mx+josa(mx,"가/이")+" 과한 편이라, 그 기운을 쓰는 활동으로 좀 풀어주면 몸이 편해지네."):"";
      var duNow=duList.filter(function(d){return d.age<=(new Date().getFullYear()-y+1);}).pop()||duList[0];
      var DUTXT={"비견":"자립과 동료의 시기일세. 제 힘으로 밀고 나가기 좋으나 동업은 경계를 분명히 하게.","겁재":"경쟁과 지출의 시기야. 사람은 얻되 돈은 새기 쉬우니 관리가 핵심일세.","식신":"표현과 결실의 시기일세. 만들고 낳는 일에 볕이 들고 몸도 편안하네.","상관":"변화와 도전의 시기야. 틀을 깨는 힘이 강하나 윗사람과의 마찰은 조심하게.","편재":"큰돈이 오가는 시기일세. 기회가 많은 만큼 흔들림도 크네.","정재":"안정과 축적의 시기야. 성실함이 그대로 자산이 되네.","편관":"시험과 승부의 시기일세. 부담이 크지만 통과하면 급이 오르네.","정관":"명예와 자리의 시기야. 승진이든 합격이든 공적인 인정운이 밝네.","편인":"공부와 전환의 시기일세. 속으로 자라는 때이니 결정은 좀 묵혔다 내리게.","정인":"귀인과 문서의 시기야. 어른과 기관의 도움, 그리고 배움이 따르네."};
      el.querySelector("#out").innerHTML=
        '<div class="sj-grid">'+cols.map(function(c){return '<div class="sj-col"><div class="h">'+c[0]+'</div>'+c[1]+'</div>';}).join("")+'</div>'+
        '<div class="sj-bars">'+SJ_EL.map(function(e,i){return '<div class="sj-bar"><span class="n el-'+e+'">'+e+'</span><span class="t"><i class="bg-'+e+'" style="width:'+(tot?cnt[i]/tot*100:0)+'%"></i></span><span class="c">'+cnt[i]+'</span></div>';}).join("")+'</div>'+
        '<div class="out" style="margin-top:18px"><div class="k">일간의 힘</div><div class="v" style="font-size:26px">'+(st.strong?"신강":"신약")+'<small> · 용신 '+yEl+'</small></div>'+
        '<div class="s">돕는 기운 '+Math.round(st.ratio*100)+'% · 보조용신 '+y2El+'</div></div>'+
        '<div class="sj-char"><img src="img/char/el-'+EL_EN[SJ_EL[SJ_ES[ds]]]+'-'+(male?"m":"f")+'.webp" alt="'+SJ_EL[SJ_ES[ds]]+' 오행 캐릭터" loading="lazy" onerror="this.closest(\'.sj-char\').remove()">'+
        '<div class="cap"><div class="t">'+SJ_EL[SJ_ES[ds]]+'('+SJ_SH[ds]+') 일간 · '+(male?"남":"여")+'</div><div class="n">'+EL_TITLE[SJ_EL[SJ_ES[ds]]][0]+'</div>'+
        '<p>'+EL_TITLE[SJ_EL[SJ_ES[ds]]][1]+' · '+ELDESC[SJ_EL[SJ_ES[ds]]]+'의 기운을 타고났네.</p></div></div>'+
        '<div class="sj-sec"><h3>일간 — '+SJ_S[ds]+'('+SJ_SH[ds]+') '+SJ_EL[SJ_ES[ds]]+'</h3><p>'+ILGAN[ds]+'</p></div>'+
        '<div class="sj-sec"><h3>격국 — '+gyeok+'</h3><p>'+conceptArt(ART_GYEOK[gyeok],gyeok)+''+SJ_GYEOK_DESC[gyeok]+'<br><span style="color:var(--muted);font-size:12.5px">월지 '+SJ_B[p.m.b]+'('+SJ_BH[p.m.b]+')의 본기가 '+wolTg+'이라 '+gyeok+'으로 봅니다. 격국은 사주 전체의 뼈대이자 타고난 그릇의 모양입니다.</span></p></div>'+
        // 회색 소자 = 계산 근거 주석. 보살 말투는 풀이 본문에만 쓴다
        (sinsal.length?'<div class="sj-sec"><h3>신살 — '+sinsal.length+'개</h3><p>'+conceptArt(ART_SINSAL[sinsal[0]],sinsal[0])+''+sinsal.map(function(s){return '<b>'+s+'</b> — '+SJ_SINSAL_DESC[s];}).join("<br><br>")+'</p></div>'
          :'<div class="sj-sec"><h3>신살</h3><p>두드러진 신살이 없는 담백한 구조일세. 큰 기복 없이 제 걸음을 지키는 편이고, 오행과 십성의 흐름이 그대로 드러나네.</p></div>')+
        '<div class="sj-sec"><h3>십이운성 — 일지 '+ilUn+'</h3><p>자네 일간 '+SJ_S[ds]+'는 일지 '+SJ_B[p.d.b]+'에서 <b>'+ilUn+'</b> 자리에 앉아 있네.<br><br>'+SJ_UN_DESC[ilUn]+'<br><span style="color:var(--muted);font-size:12.5px">십이운성은 일간의 기운이 각 자리에서 어느 단계에 있는지를 사람의 일생에 빗대어 본 것입니다. 명식표의 지지 아래에 각각 표시했습니다.</span></p></div>'+
        '<div class="sj-sec"><h3>신강·신약과 용신</h3><p>일간을 돕는 기운이 '+Math.round(st.ratio*100)+'%로 <b>'+(st.strong?"신강":"신약")+'</b>한 사주일세. '+
        (st.strong?"힘이 넘치니 그걸 <b>밖으로 써서 덜어내야</b> 하네.":"힘이 얇으니 <b>자네를 받쳐 채워줄</b> 기운이 있어야 하네.")+
        ' 그래서 용신은 <b>'+yEl+'</b>, 보조로 '+y2El+josa(y2El,"를/을")+' 쓰네. 이 기운을 가까이 둘수록 일이 순하게 풀려.</p></div>'+
        '<div class="sj-sec"><h3>용신 '+yEl+' 활용법</h3><p>· 색: <b>'+Y.color+'</b>  · 방향: <b>'+Y.dir+'</b>  · 계절: '+Y.season+'<br>· 잘 맞는 일: '+Y.job+'<br>· 도움이 되는 활동: '+Y.act+'</p></div>'+
        '<div class="sj-sec"><h3>재물운</h3><p>'+money+'</p></div>'+
        '<div class="sj-sec"><h3>직업운</h3><p>'+job+'</p></div>'+
        '<div class="sj-sec"><h3>애정운</h3><p>'+love+'</p></div>'+
        '<div class="sj-sec"><h3>건강운</h3><p>'+health+'</p></div>'+
        '<div class="sj-sec"><h3>오행 균형</h3><p>'+conceptArt(ART_SAENG[SJ_EL.indexOf(mn)],mn+josa(mn,"를/을")+" 낳는 상생")+mx+'('+ELDESC[mx]+')의 기운이 가장 강하고 '+mn+'('+ELDESC[mn]+')이 상대적으로 약하네. 강한 기운은 재능인 동시에 과할 때 그림자가 되는 법일세. 모자란 '+mn+'의 자리를 일부러 채워주면 균형이 잡히네.</p></div>'+
        '<div class="sj-sec"><h3>십성 분포</h3><p>비겁 '+G.비겁+' · 식상 '+G.식상+' · 재성 '+G.재성+' · 관성 '+G.관성+' · 인성 '+G.인성+'<br>비겁은 자립심, 식상은 표현·재능, 재성은 현실 감각, 관성은 책임·조직, 인성은 학문·수용력을 뜻합니다.</p></div>'+
        '<div class="sj-sec"><h3>대운 (10년 주기 · '+(fwd?"순행":"역행")+')</h3><div class="sj-daeun">'+duHtml+'</div>'+
        '<p style="margin-top:12px">현재 대운은 <b>'+duNow.age+'세 '+duNow.g+' ('+duNow.tg+')</b> — '+DUTXT[duNow.tg]+'</p></div>'+
        '<div class="sj-sec"><h3>대운 흐름 요약</h3><p>'+duList.slice(0,5).map(function(d){return '<b>'+d.age+'세~</b> '+d.tg+' — '+DUTXT[d.tg].split(".")[0]+'.';}).join("<br>")+'</p></div>'+
        '<p class="note">'+p.tti+'띠 · 절기(태양황경) 기반 만세력 · 진태양시 보정 '+(corr?"적용":"미적용")+'. 신강·신약은 월령·득지 가중으로, 용신은 억부(抑扶) 기준으로 산출했습니다. 전통 명리학의 해석 틀에 따른 참고용 풀이입니다.</p>';
      askFx(el,{});}
    askWire(el,go,["생년월일로 사주 여덟 글자를 세우고","일간의 힘부터 재어 본다","격국과 신살을 짚는다"],"명식을 아직 안 뽑았네.");birthDial(el,"#d");}});