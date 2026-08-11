TOOLS.push({id:"jeonse",cat:"부동산·세금",icon:"🔑",name:"전월세 전환율",desc:"보증금↔월세",render:function(el){
    el.innerHTML='<label>전세 보증금</label><div class="field"><input class="money" id="d" value="300,000,000"><span class="suf">원</span></div>'+
    '<label>전환율(연 %)</label><div class="field"><input class="money" id="r" value="5.5"><span class="suf">%</span></div>'+
    '<div class="out"><div class="k">환산 월세</div><div class="v" id="v">0<small>원</small></div><div class="s">보증금 전액 월세 전환 시</div></div>'+
    '<p class="note">월세=보증금×전환율÷12. 법정 전환율 상한은 기준금리+2% 등 규정 참고.</p>';
    function calc(){var d=num(el.querySelector("#d").value),r=num(el.querySelector("#r").value)/100;el.querySelector("#v").innerHTML=won(d*r/12)+'<small>원</small>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});