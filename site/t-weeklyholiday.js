TOOLS.push({id:"weeklyholiday",cat:"급여·노동",icon:"",name:"주휴수당 계산기",desc:"주 15시간+ 유급",render:function(el){
    el.innerHTML='<label>시급</label><div class="field"><input class="money" id="w" value="10,320"><span class="suf">원</span></div>'+
    '<label>주 근로시간</label><div class="field"><input class="money" id="h" value="20"><span class="suf">시간</span></div>'+
    '<div class="out"><div class="k">주휴수당 (주)</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">주 15시간 이상 개근 시 유급 주휴. 주휴수당=(주 근로시간÷40, 최대 1)×8×시급.</p>';
    function calc(){var w=num(el.querySelector("#w").value),h=num(el.querySelector("#h").value),pay=h>=15?Math.min(h/40,1)*8*w:0;
      el.querySelector("#v").innerHTML=won(pay)+'<small>원</small>';el.querySelector("#s").textContent=h>=15?"월 환산 약 "+won(pay*4.345)+"원":"주 15시간 미만 · 미지급";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});