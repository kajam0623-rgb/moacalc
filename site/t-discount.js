TOOLS.push({id:"discount",cat:"생활",icon:"🏷️",name:"할인가 계산기",desc:"정가·할인율→가격",render:function(el){
    el.innerHTML='<div class="r2"><div><label>정가</label><div class="field"><input class="money" id="p" value="50,000"></div></div><div><label>할인율(%)</label><input class="money" id="r" value="30"></div></div>'+
    '<div class="out"><div class="k">할인가</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>';
    function calc(){var p=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value);var f=p*(1-r/100);
      el.querySelector("#v").innerHTML=won(f)+'<small>원</small>';el.querySelector("#s").textContent=won(p*r/100)+"원 할인";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});