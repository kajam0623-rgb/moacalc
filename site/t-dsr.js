TOOLS.push({id:"dsr",cat:"금융",icon:"",name:"DSR 계산기",desc:"소득 대비 상환",render:function(el){
    el.innerHTML='<label>연 소득</label><div class="field"><input class="money" id="y" value="50,000,000"><span class="suf">원</span></div>'+
    '<label>월 총 원리금 상환액</label><div class="field"><input class="money" id="m" value="1,500,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">DSR</div><div class="v" id="v">0<small>%</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">DSR=연 원리금상환액÷연소득. 은행권은 대개 40% 이내로 규제합니다.</p>';
    function calc(){var y=num(el.querySelector("#y").value),m=num(el.querySelector("#m").value),dsr=y?m*12/y*100:0;
      el.querySelector("#v").innerHTML=dsr.toFixed(1)+'<small>%</small>';el.querySelector("#s").textContent=dsr<=40?"규제 40% 이내":"40% 초과 · 대출 제한 가능";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});