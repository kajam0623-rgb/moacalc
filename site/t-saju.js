TOOLS.push({id:"saju",cat:"재미·운세",icon:"",name:"사주팔자 만세력",desc:"오행·십성·대운",render:function(el){
    var ILGAN=["큰 나무처럼 곧고 리더십이 있으며, 한번 정한 방향은 쉽게 꺾지 않습니다. 명분과 원칙을 중시해 주변의 신뢰를 얻지만, 융통성이 부족하다는 말을 들을 수 있습니다.",
    "덩굴과 화초처럼 유연하고 섬세하며, 환경 적응력이 뛰어납니다. 부드러워 보여도 생존력이 강하고, 실속을 챙기는 현실 감각이 좋습니다.",
    "태양처럼 밝고 정열적이며 숨김이 없습니다. 사람을 모으는 힘이 있고 표현력이 뛰어나지만, 감정 기복이 드러나기 쉽습니다.",
    "촛불·달빛처럼 따뜻하고 헌신적이며 관찰력이 섬세합니다. 겉은 온화하지만 속에는 강한 집념이 있습니다.",
    "큰 산처럼 묵직하고 신용을 중시합니다. 쉽게 흔들리지 않는 중심이 있어 사람들이 기대지만, 변화에는 느린 편입니다.",
    "밭의 흙처럼 포용력이 있고 성실합니다. 남을 돌보고 기르는 힘이 좋으며, 실무와 관리에 강합니다.",
    "무쇠·바위처럼 결단력 있고 의리를 중시합니다. 맺고 끊음이 분명해 승부처에 강하지만, 직설적인 말로 오해를 살 수 있습니다.",
    "보석·바늘처럼 예리하고 완벽주의적입니다. 미적 감각과 분석력이 뛰어나며, 세련된 것을 추구합니다.",
    "바다·큰 강처럼 스케일이 크고 지혜롭습니다. 자유를 사랑하고 포용력이 있지만, 한곳에 매이는 것을 싫어합니다.",
    "이슬비·시냇물처럼 총명하고 감수성이 풍부합니다. 스며드는 힘으로 사람의 마음을 읽어내며, 아이디어가 많습니다."];
    var ELDESC={목:"성장·시작·인정",화:"열정·표현·확산",토:"신용·중재·안정",금:"결단·원칙·마무리",수:"지혜·유연·저장"};
    var EL_EN={목:"wood",화:"fire",토:"earth",금:"metal",수:"water"};
    var EL_TITLE={목:["푸른 나무",  "곧게 자라는 사람"],화:["붉은 태양","환하게 비추는 사람"],토:["너른 대지","품어 기르는 사람"],금:["벼린 쇠","맺고 끊는 사람"],수:["깊은 물","고요히 스며드는 사람"]};
    var today=new Date();
    el.innerHTML='<div class="r2"><div><label>생년월일 (양력)</label><input type="date" id="d" value="'+(loadPrefs().birth||"1990-03-15")+'"></div>'+
    '<div><label>태어난 시각</label><select id="t"><option value="">모름 (시주 제외)</option>'+
    Array.from({length:24},function(_,i){var sv=loadPrefs().birthHour!=null?+loadPrefs().birthHour:12;return '<option value="'+i+'"'+(i===sv?' selected':'')+'>'+String(i).padStart(2,"0")+"시</option>";}).join("")+'</select></div></div>'+
    '<div class="r2"><div><label>성별 (대운 방향)</label><select id="g"><option value="m"'+(loadPrefs().gender==="f"?"":" selected")+'>남</option><option value="f"'+(loadPrefs().gender==="f"?" selected":"")+'>여</option></select></div>'+
    '<div><label>진태양시 보정</label><select id="c"><option value="1">적용 (−30분, 한국 표준)</option><option value="0">안 함</option></select></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">명식 뽑기</button>'+
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
      var money=G.재성===0?"사주에 재성이 드러나지 않았습니다. 큰돈을 좇기보다 <b>꾸준한 수입 구조</b>를 만드는 쪽이 잘 맞습니다. 월급·계약처럼 정해진 흐름에서 안정적으로 모으는 편이 유리합니다."
        :G.재성>=3?"재성이 <b>많습니다</b>. 돈을 다루는 감각이 좋고 기회도 자주 오지만, 일간이 감당할 힘이 없으면 오히려 돈에 쫓기는 구조가 됩니다. 벌이보다 <b>관리와 분산</b>이 관건입니다."
        :"재성이 <b>적절합니다</b>. 현실 감각이 살아 있어 수입과 지출의 균형을 스스로 잡을 수 있습니다. 무리한 확장만 피하면 재물운은 무난하게 흐릅니다.";
      var job=G.관성===0?"관성이 없어 조직의 틀에 매이는 것을 답답해합니다. <b>전문성·프리랜서·자기 사업</b>처럼 스스로 규칙을 정하는 환경에서 능력이 더 나옵니다."
        :G.관성>=3?"관성이 <b>강합니다</b>. 책임과 자리를 맡는 힘이 있지만 압박도 그만큼 큽니다. 권한이 분명한 조직에서 실력을 인정받는 구조가 잘 맞습니다."
        :G.식상>=3?"식상이 발달해 <b>표현하고 만들어내는 일</b>에 강점이 있습니다. 정해진 매뉴얼보다 기획·창작·교육처럼 결과를 스스로 만드는 일에서 빛납니다."
        :"관성이 적절해 <b>조직과 자율 어느 쪽도 감당</b>할 수 있습니다. 역할이 명확하고 성과가 보이는 자리에서 만족도가 높습니다.";
      var love=male?(G.재성===0?"남성 사주에서 재성은 배우자를 뜻합니다. 재성이 드러나지 않아 인연이 늦거나 조용히 오는 편입니다. 조건보다 <b>함께 있을 때 편한 사람</b>을 기준으로 삼는 편이 좋습니다."
        :G.재성>=3?"재성이 많아 <b>이성 인연이 잦은</b> 구조입니다. 선택지가 많은 만큼 기준이 흔들리기 쉬우니, 오래 볼 사람인지 한 번 더 확인하세요."
        :"재성이 적절해 <b>연애와 결혼운이 안정적</b>입니다. 서로의 생활 리듬이 맞는 상대와 오래갑니다.")
        :(G.관성===0?"여성 사주에서 관성은 배우자를 뜻합니다. 관성이 드러나지 않아 인연이 늦거나 본인이 주도하는 관계가 되기 쉽습니다. 기다리기보다 <b>먼저 다가가는 편</b>이 낫습니다."
        :G.관성>=3?"관성이 많아 <b>이성의 관심이 잦지만</b> 그만큼 부담도 큽니다. 나를 존중하는지, 책임감이 있는지를 기준으로 두세요."
        :"관성이 적절해 <b>연애와 결혼운이 안정적</b>입니다. 서로 책임을 나눌 수 있는 상대와 잘 맞습니다.");
      var health=cnt[SJ_ES[0]]!==undefined?("오행 중 <b>"+mn+"</b>"+josa(mn,"가/이")+" 가장 약합니다. 명리에서 "+mn+josa(mn,"는/은")+" "+WEAK[mn]+"과 연결됩니다. 무리가 쌓이면 이 부위부터 신호가 오기 쉬우니 평소 관리해 두면 좋습니다. 반대로 "+mx+josa(mx,"가/이")+" 과한 편이라 관련된 기운을 쓰는 활동으로 풀어주는 것이 도움이 됩니다."):"";
      var duNow=duList.filter(function(d){return d.age<=(new Date().getFullYear()-y+1);}).pop()||duList[0];
      var DUTXT={"비견":"자립과 동료의 시기. 내 힘으로 밀고 나가기 좋지만 동업은 경계를 분명히.","겁재":"경쟁과 지출의 시기. 사람은 얻되 돈은 새기 쉬우니 관리가 핵심.","식신":"표현과 결실의 시기. 만들고 낳는 일에 볕이 들며 건강운도 좋음.","상관":"변화와 도전의 시기. 틀을 깨는 힘이 강하나 윗사람과 마찰 주의.","편재":"큰돈이 오가는 시기. 기회가 많지만 변동성도 큼.","정재":"안정과 축적의 시기. 성실함이 그대로 자산이 됨.","편관":"시험과 승부의 시기. 부담이 크지만 통과하면 급이 오름.","정관":"명예와 자리의 시기. 승진·합격 등 공적 인정운이 밝음.","편인":"공부와 전환의 시기. 속으로 자라며 결정은 숙성 후에.","정인":"귀인과 문서의 시기. 어른·기관의 도움과 배움이 따름."};
      el.querySelector("#out").innerHTML=
        '<div class="sj-grid">'+cols.map(function(c){return '<div class="sj-col"><div class="h">'+c[0]+'</div>'+c[1]+'</div>';}).join("")+'</div>'+
        '<div class="sj-bars">'+SJ_EL.map(function(e,i){return '<div class="sj-bar"><span class="n el-'+e+'">'+e+'</span><span class="t"><i class="bg-'+e+'" style="width:'+(tot?cnt[i]/tot*100:0)+'%"></i></span><span class="c">'+cnt[i]+'</span></div>';}).join("")+'</div>'+
        '<div class="out" style="margin-top:18px"><div class="k">일간의 힘</div><div class="v" style="font-size:26px">'+(st.strong?"신강":"신약")+'<small> · 용신 '+yEl+'</small></div>'+
        '<div class="s">돕는 기운 '+Math.round(st.ratio*100)+'% · 보조용신 '+y2El+'</div></div>'+
        '<div class="sj-char"><img src="img/char/el-'+EL_EN[SJ_EL[SJ_ES[ds]]]+'-'+(male?"m":"f")+'.webp" alt="'+SJ_EL[SJ_ES[ds]]+' 오행 캐릭터" loading="lazy" onerror="this.closest(\'.sj-char\').remove()">'+
        '<div class="cap"><div class="t">'+SJ_EL[SJ_ES[ds]]+'('+SJ_SH[ds]+') 일간 · '+(male?"남":"여")+'</div><div class="n">'+EL_TITLE[SJ_EL[SJ_ES[ds]]][0]+'</div>'+
        '<p>'+EL_TITLE[SJ_EL[SJ_ES[ds]]][1]+' · '+ELDESC[SJ_EL[SJ_ES[ds]]]+'의 기운을 타고났습니다.</p></div></div>'+
        '<div class="sj-sec"><h3>일간 — '+SJ_S[ds]+'('+SJ_SH[ds]+') '+SJ_EL[SJ_ES[ds]]+'</h3><p>'+ILGAN[ds]+'</p></div>'+
        '<div class="sj-sec"><h3>격국 — '+gyeok+'</h3><p>'+conceptArt(ART_GYEOK[gyeok],gyeok)+''+SJ_GYEOK_DESC[gyeok]+'<br><span style="color:var(--muted);font-size:12.5px">월지 '+SJ_B[p.m.b]+'('+SJ_BH[p.m.b]+')의 본기가 '+wolTg+'이라 '+gyeok+'으로 봅니다. 격국은 사주 전체의 뼈대이자 타고난 그릇의 모양입니다.</span></p></div>'+
        (sinsal.length?'<div class="sj-sec"><h3>신살 — '+sinsal.length+'개</h3><p>'+conceptArt(ART_SINSAL[sinsal[0]],sinsal[0])+''+sinsal.map(function(s){return '<b>'+s+'</b> — '+SJ_SINSAL_DESC[s];}).join("<br><br>")+'</p></div>'
          :'<div class="sj-sec"><h3>신살</h3><p>두드러진 신살이 없는 담백한 구조입니다. 특별한 기복 없이 자기 페이스를 지키는 편이며, 오행과 십성의 흐름이 그대로 드러납니다.</p></div>')+
        '<div class="sj-sec"><h3>십이운성 — 일지 '+ilUn+'</h3><p>일간 '+SJ_S[ds]+'가 일지 '+SJ_B[p.d.b]+'에서 <b>'+ilUn+'</b> 자리에 있습니다. '+SJ_UN_DESC[ilUn]+'<br><span style="color:var(--muted);font-size:12.5px">십이운성은 일간의 기운이 각 자리에서 어느 단계에 있는지를 사람의 일생에 빗대어 본 것입니다. 명식표의 지지 아래에 각각 표시했습니다.</span></p></div>'+
        '<div class="sj-sec"><h3>신강·신약과 용신</h3><p>일간을 돕는 기운이 '+Math.round(st.ratio*100)+'%로 <b>'+(st.strong?"신강":"신약")+'</b>한 사주입니다. '+
        (st.strong?"힘이 넘치므로 그 기운을 <b>밖으로 써서 덜어내는</b> 것이 좋습니다.":"힘이 부족하므로 <b>나를 도와 채워주는</b> 기운이 필요합니다.")+
        ' 그래서 용신은 <b>'+yEl+'</b>, 보조로 '+y2El+'을 씁니다. 이 기운을 가까이 둘수록 일이 순조롭게 풀립니다.</p></div>'+
        '<div class="sj-sec"><h3>용신 '+yEl+' 활용법</h3><p>· 색: <b>'+Y.color+'</b>  · 방향: <b>'+Y.dir+'</b>  · 계절: '+Y.season+'<br>· 잘 맞는 일: '+Y.job+'<br>· 도움이 되는 활동: '+Y.act+'</p></div>'+
        '<div class="sj-sec"><h3>재물운</h3><p>'+money+'</p></div>'+
        '<div class="sj-sec"><h3>직업운</h3><p>'+job+'</p></div>'+
        '<div class="sj-sec"><h3>애정운</h3><p>'+love+'</p></div>'+
        '<div class="sj-sec"><h3>건강운</h3><p>'+health+'</p></div>'+
        '<div class="sj-sec"><h3>오행 균형</h3><p>'+mx+'('+ELDESC[mx]+')의 기운이 가장 강하고, '+mn+'('+ELDESC[mn]+')이 상대적으로 약합니다. 강한 기운은 재능이자 과할 때의 그림자이니, 부족한 '+mn+'의 영역을 의식적으로 채우면 균형이 좋아집니다.</p></div>'+
        '<div class="sj-sec"><h3>십성 분포</h3><p>비겁 '+G.비겁+' · 식상 '+G.식상+' · 재성 '+G.재성+' · 관성 '+G.관성+' · 인성 '+G.인성+'<br>비겁은 자립심, 식상은 표현·재능, 재성은 현실 감각, 관성은 책임·조직, 인성은 학문·수용력을 뜻합니다.</p></div>'+
        '<div class="sj-sec"><h3>대운 (10년 주기 · '+(fwd?"순행":"역행")+')</h3><div class="sj-daeun">'+duHtml+'</div>'+
        '<p style="margin-top:12px">현재 대운은 <b>'+duNow.age+'세 '+duNow.g+' ('+duNow.tg+')</b> — '+DUTXT[duNow.tg]+'</p></div>'+
        '<div class="sj-sec"><h3>대운 흐름 요약</h3><p>'+duList.slice(0,5).map(function(d){return '<b>'+d.age+'세~</b> '+d.tg+' — '+DUTXT[d.tg].split(".")[0]+'.';}).join("<br>")+'</p></div>'+
        '<p class="note">'+p.tti+'띠 · 절기(태양황경) 기반 만세력 · 진태양시 보정 '+(corr?"적용":"미적용")+'. 신강·신약은 월령·득지 가중으로, 용신은 억부(抑扶) 기준으로 산출했습니다. 전통 명리학의 해석 틀에 따른 참고용 풀이입니다.</p>';}
    el.querySelector("#go").addEventListener("click",go);go();birthDial(el,"#d");}});