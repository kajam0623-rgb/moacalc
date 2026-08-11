TOOLS.push({id:"prepay",cat:"금융",icon:"",name:"중도상환수수료",desc:"잔액×율×잔여",render:function(el){
    el.innerHTML='<label>중도상환 금액</label><div class="field"><input class="money" id="a" value="50,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>수수료율(%)</label><input class="money" id="r" value="1.2"></div><div><label>잔여기간(개월)</label><input class="money" id="rm" value="24"></div></div>'+
    '<label>대출 총기간(개월)</label><div class="field"><input class="money" id="tm" value="36"></div>'+
    '<div class="out"><div class="k">중도상환수수료</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">수수료=상환금액×수수료율×(잔여기간÷대출총기간). 보통 3년 경과 시 면제됩니다.</p>';
    function calc(){var a=num(el.querySelector("#a").value),r=num(el.querySelector("#r").value)/100,rm=num(el.querySelector("#rm").value),tm=num(el.querySelector("#tm").value)||1;
      var fee=a*r*(rm/tm);el.querySelector("#v").innerHTML=won(fee)+'<small>원</small>';el.querySelector("#s").textContent="유효 수수료율 "+(r*rm/tm*100).toFixed(2)+"%";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});