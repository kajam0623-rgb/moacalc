TOOLS.push({id:"annual",cat:"급여·노동",icon:"🌴",name:"연차수당 계산기",desc:"미사용 연차 수당",render:function(el){
    el.innerHTML='<label>월 통상임금(세전)</label><div class="field"><input class="money" id="w" value="3,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>월 소정근로시간</label><input class="money" id="h" value="209"></div><div><label>미사용 연차(일)</label><input class="money" id="d" value="5"></div></div>'+
    '<div class="out"><div class="k">연차수당</div><div class="v" id="r">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">연차수당=시간당 통상임금×8시간×미사용일수. 시간당=월 통상임금÷월 소정근로시간(보통 209).</p>';
    function calc(){var w=num(el.querySelector("#w").value),h=num(el.querySelector("#h").value)||209,d=num(el.querySelector("#d").value);
      var hourly=w/h,pay=hourly*8*d;el.querySelector("#r").innerHTML=won(pay)+'<small>원</small>';
      el.querySelector("#s").textContent="시간당 "+won(hourly)+"원 × 8h × "+d+"일";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});