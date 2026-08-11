TOOLS.push({id:"calorie",cat:"생활",icon:"",name:"운동 칼로리 소모",desc:"운동·시간·체중",render:function(el){
    el.innerHTML='<label>운동</label><select id="m"><option value="3.5">걷기</option><option value="8">달리기</option><option value="6">자전거</option><option value="7">수영</option><option value="6">등산</option><option value="5">웨이트</option></select>'+
    '<div class="r2"><div><label>체중(kg)</label><input class="money" id="w" value="65"></div><div><label>시간(분)</label><input class="money" id="t" value="30"></div></div>'+
    '<div class="out"><div class="k">소모 칼로리</div><div class="v" id="v">0<small>kcal</small></div><div class="s">MET × 체중 × 시간(근사)</div></div>';
    function calc(){var met=+el.querySelector("#m").value,w=num(el.querySelector("#w").value),t=num(el.querySelector("#t").value)/60;
      el.querySelector("#v").innerHTML=Math.round(met*w*t*1.05)+'<small>kcal</small>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});el.querySelector("#m").addEventListener("change",calc);calc();}});