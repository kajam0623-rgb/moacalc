TOOLS.push({id:"horoscope",cat:"재미·운세",icon:"",name:"별자리 운세",desc:"12별자리 오늘·이번주",render:function(el){
    el.innerHTML='<div class="r2"><div><label for="d">생년월일 (양력)</label><input type="date" id="d" value="1995-08-15"></div>'+
    '<div><label>또는 별자리 직접 선택</label><select id="s"><option value="-1">생년월일로 자동 판정</option>'+
    ST_KO.map(function(n,i){var qs=(location.search.match(/[?&]s=(\d+)/)||[])[1];return '<option value="'+i+'"'+(qs!=null&&+qs===i?" selected":"")+'>'+ST_SYM[i]+' '+n+' ('+ST_RANGE[i]+')</option>';}).join("")+'</select></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">'+ASK_LABEL+'</button>'+
    '<div id="out"></div>';
    function hbar(n,v){return rateBar(n,v);}
    // 깊이 있는 풀이 원고(hs/deep.json) — 결과가 그려진 뒤에 도착해도 자리(#hsdeep)의 예전 글을 바꿔 끼운다
    var HSD=null,hsLast=null,hsDone=false;
    function fillHs(){var h=el.querySelector("#hsdeep");if(!h||!HSD||!hsLast)return;h.innerHTML=hsDeep(hsLast.mine,hsLast.now,HSD).secs.map(hsSecHtml).join("");if(hsDone)plainWords(h);}
    if(typeof fetch==="function")fetch("hs/deep.json").then(function(r){return r.ok?r.json():null;}).then(function(j){if(j){HSD=j;fillHs();}}).catch(function(){});
    function go(){
      var sel=+el.querySelector("#s").value,mine;
      if(sel>=0)mine=sel;
      else{var dv=el.querySelector("#d").value.split("-");if(dv.length<3)return;mine=stOf(+dv[0],+dv[1],+dv[2]);}
      track("fortune_view",{tool:"horoscope"});
      var now=new Date(),ty=now.getFullYear(),tm=now.getMonth()+1,td=now.getDate();
      // 점수는 hsScore 한 곳에서 — 홈 "오늘의 별자리 순위"와 같은 값. 하루의 결은 오늘 달의 자리·모양에서, 이달의 큰 배경은 태양에서 나온다
      var hs=hsScore(mine,now),sun=hs.sun,A=hs.A,mo=hs.moon,MA=ST_ASP[hs.md];
      var ele=ST_ELE[mine%4],ruler=ST_RULER[mine],score=hs.score,grade=hsGrade(score),sub=subBal(score,hs.MA[1]);
      var best=WD_KO[WD_RULER.indexOf(ruler)];
      hsLast={mine:mine,now:now};
      // 원고가 아직 안 왔으면 예전 글(태양 각도 기준)로 먼저 보여 주고, 도착하면 바꿔 끼운다
      var oldSecs='<div class="sj-sec"><h3>오늘의 총운</h3><p>'+A[2]+'</p></div>'+
        '<div class="sj-sec"><h3>애정운</h3><p>'+A[3]+'</p></div>'+
        '<div class="sj-sec"><h3>재물·일</h3><p>'+A[4]+'</p></div>'+
        '<div class="sj-sec"><h3>조언</h3><p>'+A[5]+'</p></div>';
      el.querySelector("#out").innerHTML=tfPersonalBox(sel<0?el.querySelector("#d").value:"")+
      '<div class="out" style="margin-top:16px"><div class="k">'+ty+'.'+String(tm).padStart(2,"0")+'.'+String(td).padStart(2,"0")+' · 오늘 달은 '+ST_SYM[mo.sign]+' '+ST_KO[mo.sign]+'</div>'+
      '<div class="v">'+score+'<small>점 · '+grade+'</small></div><div class="s">'+ST_KO[mine]+' 공통 흐름 · 오늘 달과 '+MA[1]+' 관계</div></div>'+
      '<div class="sj-bars">'+hbar("애정",sub[0])+hbar("재물",sub[1])+hbar("직장",sub[2])+hbar("건강",sub[3])+'</div>'+
      stCard(mine)+
      '<div class="chips"><span class="chip">원소 '+ele+'</span><span class="chip">수호성 '+ruler+'</span><span class="chip">오늘 달 '+HS_PH[mo.phase]+' · 밝기 '+mo.illum+'%</span><span class="chip">행운의 요일 '+best+'요일</span></div>'+
      '<div id="hsdeep">'+oldSecs+hsSecHtml(hsWeekSec(mine,now))+'</div>'+
      shareBtn()+
      '<p class="note">태어난 날의 태양 황경으로 별자리를 판정하고, 오늘(낮 12시, 한국 시각) 달이 든 별자리와 내 별자리가 이루는 각도(합·섹스타일·스퀘어·트라인·오포지션 등), 달의 모양, 요일의 별로 하루의 결을 읽는 서양 점성술 방식입니다. 달의 위치는 천문 공식으로 직접 계산한 값이며 미국 해군천문대의 삭·보름 시각과 5분 안팎으로 맞춥니다. 경계일(예: 8월 22~23일)에 태어났다면 태양 황경 계산이 날짜표보다 정확합니다. 참고용.</p>';
      fillHs();
      bindShare(el,"별자리 운세",ST_KO[mine]+" 오늘의 운세 "+score+"점 · "+grade+" — 달 "+MA[1]+" 관계. 동네보살에서 확인:");
      saveScore(el,"별자리운세",ymd3(ty,tm,td)+" 별자리 운세",ST_KO[mine],score,grade,"오늘 달과 "+MA[1]+" 관계의 날",HSD?HSD.moon[hs.md].gen:A[2]);askFx(el,{score:score,grade:grade});hsDone=true;}
    askWire(el,go,["태양 황경으로 별자리를 잡는다","오늘 하늘의 각을 잰다","자네 별자리와 맞춰 본다"],"아직 안 물어봤네.");
    birthDial(el,"#d");}});