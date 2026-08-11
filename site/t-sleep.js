TOOLS.push({id:"sleep",cat:"생활",icon:"",name:"수면 시간 계산기",desc:"기상 시각 역산",render:function(el){
    el.innerHTML='<label>기상 시각</label><input type="time" id="t" value="07:00">'+
    '<div class="rows" id="rows" style="margin-top:16px"></div><p class="note">수면주기 90분 + 입면 14분 기준 추천 취침시각.</p>';
    function calc(){var p=el.querySelector("#t").value.split(":"),wake=(+p[0]*60+ +p[1]);
      el.querySelector("#rows").innerHTML=[6,5,4].map(function(c){var m=((wake-(c*90+14))%1440+1440)%1440,h=Math.floor(m/60),mm=m%60;
        return '<div class="li"><span>'+c+'주기('+(c*1.5)+'시간)</span><b>'+String(h).padStart(2,"0")+":"+String(mm).padStart(2,"0")+'</b></div>';}).join("");}
    el.querySelector("#t").addEventListener("change",calc);calc();}});