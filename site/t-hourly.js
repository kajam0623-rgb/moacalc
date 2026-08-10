TOOLS.push({id:"hourly",cat:"급여·노동",icon:"⏱️",name:"시급→월급 변환",desc:"시급·근로시간→월급",render:function(el){
    el.innerHTML='<label>시급</label><div class="field"><input class="money" id="w" value="10,320"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>주 근로시간</label><input class="money" id="h" value="40"></div><div><label>주휴 포함</label><select id="p"><option value="1">예</option><option value="0">아니오</option></select></div></div>'+
    '<div class="out"><div class="k">예상 월급(세전)</div><div class="v" id="r">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">2026 최저시급 10,320원. 주휴수당=주 15시간 이상 시 유급. 월=주×4.345.</p>';
    function calc(){var w=num(el.querySelector("#w").value),h=num(el.querySelector("#h").value),p=el.querySelector("#p").value==="1";
      var weekly=w*h+(p&&h>=15?w*(h/40*8):0),m=weekly*4.345;el.querySelector("#r").innerHTML=won(m)+'<small>원</small>';
      el.querySelector("#s").textContent="주급 "+won(weekly)+"원 · 연 "+won(m*12)+"원";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});el.querySelector("#p").addEventListener("change",calc);calc();}});