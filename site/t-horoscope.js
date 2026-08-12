TOOLS.push({id:"horoscope",cat:"재미·운세",icon:"",name:"별자리 운세",desc:"12별자리 오늘·이번주",render:function(el){
    el.innerHTML='<div class="r2"><div><label>생년월일 (양력)</label><input type="date" id="d" value="'+(loadPrefs().birth||"1995-08-15")+'"></div>'+
    '<div><label>또는 별자리 직접 선택</label><select id="s"><option value="-1">생년월일로 자동 판정</option>'+
    ST_KO.map(function(n,i){return '<option value="'+i+'">'+ST_SYM[i]+' '+n+' ('+ST_RANGE[i]+')</option>';}).join("")+'</select></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">'+ASK_LABEL+'</button>'+
    '<div id="out"></div>';
    function hbar(n,v){return rateBar(n,v);}
    function go(){
      var sel=+el.querySelector("#s").value,mine;
      if(sel>=0)mine=sel;
      else{var dv=el.querySelector("#d").value.split("-");if(dv.length<3)return;mine=stOf(+dv[0],+dv[1],+dv[2]);
        savePrefs({birth:el.querySelector("#d").value});}
      track("fortune_view",{tool:"horoscope"});
      var now=new Date(),ty=now.getFullYear(),tm=now.getMonth()+1,td=now.getDate();
      var sun=stOf(ty,tm,td),k=(sun-mine+12)%12,dist=Math.min(k,12-k),A=ST_ASP[dist];
      var ele=ST_ELE[mine%4],ruler=ST_RULER[mine],fri=ST_ELE_RULERS[ele];
      var score=A[0],wd=now.getDay(),wdr=WD_RULER[wd],rnote="";
      if(wdr===ruler){score+=7;rnote="오늘은 "+WD_KO[wd]+"요일 — 내 수호성 "+ruler+"이 다스리는 날입니다. 하루 중 가장 나다운 판단이 나옵니다.";}
      else if(fri.indexOf(wdr)>=0){score+=3;rnote="오늘을 다스리는 "+wdr+"은 "+ele+" 원소와 결이 맞습니다. 무난하게 밀고 갈 수 있습니다.";}
      else{score-=3;rnote="오늘을 다스리는 "+wdr+"은 "+ele+" 원소와 결이 다릅니다. 속도를 조금 늦추면 마찰이 줄어듭니다.";}
      score=Math.max(35,Math.min(98,score));
      var grade=score>=85?"대길":score>=75?"길":score>=60?"평온":"주의";
      var sub=A[6].map(function(v){return Math.max(30,Math.min(99,score+v));});
      var week="";
      for(var i=0;i<7;i++){var dt=new Date(ty,tm-1,td+i),r=WD_RULER[dt.getDay()],
        g=(r===ruler)?"대길":(fri.indexOf(r)>=0?"길":"평");
        week+='<div class="sj-du"><div class="a">'+(dt.getMonth()+1)+'.'+dt.getDate()+' '+WD_KO[dt.getDay()]+'</div>'+
          '<div class="g" style="font-size:14px;color:'+(g==="대길"?"var(--fun-ink)":g==="길"?"var(--accent)":"var(--muted)")+'">'+g+'</div><div class="a">'+r+'</div></div>';}
      var best=WD_KO[WD_RULER.indexOf(ruler)];
      el.querySelector("#out").innerHTML=
      '<div class="out" style="margin-top:16px"><div class="k">'+ty+'.'+String(tm).padStart(2,"0")+'.'+String(td).padStart(2,"0")+' · 오늘 태양은 '+ST_SYM[sun]+' '+ST_KO[sun]+'</div>'+
      '<div class="v">'+score+'<small>점 · '+grade+'</small></div><div class="s">'+ST_KO[mine]+' 기준 '+A[1]+' 관계</div></div>'+
      '<div class="sj-bars">'+hbar("애정",sub[0])+hbar("재물",sub[1])+hbar("직장",sub[2])+hbar("건강",sub[3])+'</div>'+
      stCard(mine)+
      '<div class="chips"><span class="chip">원소 '+ele+'</span><span class="chip">수호성 '+ruler+'</span><span class="chip">기간 '+ST_RANGE[mine]+'</span><span class="chip">행운의 요일 '+best+'요일</span></div>'+
      '<div class="sj-sec"><h3>오늘의 총운</h3><p>'+A[2]+'</p></div>'+
      '<div class="sj-sec"><h3>애정운</h3><p>'+A[3]+'</p></div>'+
      '<div class="sj-sec"><h3>재물·일</h3><p>'+A[4]+'</p></div>'+
      '<div class="sj-sec"><h3>조언</h3><p>'+A[5]+' '+rnote+'</p></div>'+
      '<div class="sj-sec"><h3>이번주 흐름</h3><div class="sj-daeun">'+week+'</div>'+
      '<p style="font-size:12.5px;color:var(--muted);margin-top:10px;line-height:1.7">요일마다 다스리는 행성(칠요)이 다릅니다. 내 별자리 수호성 '+ruler+'이 맡은 '+best+'요일이 한 주의 중심이고, '+ele+' 원소와 결이 맞는 행성의 날이 그다음입니다.</p></div>'+
      shareBtn()+
      '<p class="note">태어난 날의 태양 황경으로 별자리를 판정하고, 오늘 태양의 위치와 내 별자리가 이루는 각도(합·섹스타일·스퀘어·트라인·오포지션)로 흐름을 읽는 서양 점성술 방식입니다. 경계일(예: 8월 22~23일)에 태어났다면 태양 황경 계산이 날짜표보다 정확합니다. 참고용.</p>';
      bindShare(el,"별자리 운세",ST_KO[mine]+" 오늘의 운세 "+score+"점 · "+grade+" — "+A[1]+" 관계. 동네보살에서 확인:");askFx(el,{score:score,grade:grade});}
    askWire(el,go,["태양 황경으로 별자리를 잡는다","오늘 하늘의 각을 잰다","자네 별자리와 맞춰 본다"],"아직 안 물어봤네.");
    birthDial(el,"#d");}});