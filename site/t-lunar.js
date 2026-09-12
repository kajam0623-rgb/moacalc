TOOLS.push({id:"lunar",cat:"생활",icon:"🌙",name:"음력 양력 변환",desc:"양력↔음력 날짜 변환",render:function(el){
    var LF=new Intl.DateTimeFormat("en-US-u-ca-chinese",{year:"numeric",month:"numeric",day:"numeric"});
    function toLunar(d){var p=LF.formatToParts(d),g=function(t){return (p.find(function(x){return x.type===t})||{}).value;};
      var m=String(g("month"));
      // "6bis" = 윤6월. Intl이 윤달을 이렇게 표기한다
      return {m:parseInt(m,10), leap:/bis/.test(m), d:+g("day"), y:+g("relatedYear")};}
    function fromLunar(ly,lm,ld,leap){
      // 음력 설은 양력 1월 하순~2월 중순이라 그 해 1월 1일부터 훑으면 충분하다
      var start=new Date(ly,0,1);
      for(var i=0;i<400;i++){var d=new Date(ly,0,1+i),r=toLunar(d);
        if(r.y===ly&&r.m===lm&&r.d===ld&&r.leap===leap)return d;}
      return null;}
    var today=new Date();
    var iso=function(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
    el.innerHTML=
      '<div class="r2"><div><label>변환 방향</label><select id="dir"><option value="s2l">양력 → 음력</option><option value="l2s">음력 → 양력</option></select></div>'+
      '<div><label>윤달 (음→양일 때만)</label><select id="leap"><option value="0">평달</option><option value="1">윤달</option></select></div></div>'+
      '<div id="pane-s2l"><label>양력 날짜</label><input type="date" id="sd" value="'+iso(today)+'"></div>'+
      '<div id="pane-l2s" style="display:none"><div class="r2"><div><label>음력 연</label><input type="number" id="ly" value="'+today.getFullYear()+'"></div>'+
      '<div><label>음력 월</label><input type="number" id="lm" min="1" max="12" value="1"></div></div>'+
      '<label>음력 일</label><input type="number" id="ld" min="1" max="30" value="1"></div>'+
      '<div class="out" style="margin-top:14px"><div class="k" id="k">음력</div><div class="v" id="v">—</div><div class="s" id="s"></div></div>'+
      '<p class="note">브라우저 표준 달력(Intl)의 음력 계산입니다. 설날·추석 21건(2018~2028)으로 대조했습니다. 윤달은 음력 월 뒤에 (윤)으로 표시합니다.</p>';
    function calc(){
      var dir=el.querySelector("#dir").value;
      el.querySelector("#pane-s2l").style.display = dir==="s2l" ? "" : "none";
      el.querySelector("#pane-l2s").style.display = dir==="l2s" ? "" : "none";
      var K=el.querySelector("#k"),V=el.querySelector("#v"),S=el.querySelector("#s");
      if(dir==="s2l"){
        var v=el.querySelector("#sd").value; if(!v){return;}
        var p=v.split("-").map(Number), d=new Date(p[0],p[1]-1,p[2]);
        var r=toLunar(d);
        K.textContent="음력";
        V.innerHTML=r.y+". "+r.m+(r.leap?"(윤)":"")+". "+r.d+"<small>일</small>";
        S.textContent="양력 "+v+" 기준";
      } else {
        var ly=+el.querySelector("#ly").value, lm=+el.querySelector("#lm").value, ld=+el.querySelector("#ld").value;
        var leap=el.querySelector("#leap").value==="1";
        var d2=fromLunar(ly,lm,ld,leap);
        K.textContent="양력";
        if(!d2){V.innerHTML="—";S.textContent="그 해에 음력 "+lm+(leap?"(윤)":"")+"월 "+ld+"일이 없습니다.";}
        else{V.innerHTML=iso(d2).replace(/-/g,". ");
          S.textContent="음력 "+ly+". "+lm+(leap?"(윤)":"")+". "+ld+" 기준";}
      }}
    ["#dir","#sd","#ly","#lm","#ld","#leap"].forEach(function(q){
      var n=el.querySelector(q); if(n){n.addEventListener("change",calc);n.addEventListener("input",calc);}});
    calc();}});