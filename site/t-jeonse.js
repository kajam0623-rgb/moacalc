TOOLS.push({id:"jeonse",cat:"부동산·세금",icon:"🔑",name:"전월세 전환율",desc:"보증금↔월세",render:function(el){
    el.innerHTML='<label>전세 보증금</label><div class="field"><input class="money" id="d" value="300,000,000"><span class="suf">원</span></div>'+
    '<label>전환율(연 %)</label><div class="field"><input class="money" id="r" value="5.5"><span class="suf">%</span></div>'+
    '<div class="out"><div class="k">환산 월세</div><div class="v" id="v">0<small>원</small></div><div class="s">보증금 전액 월세 전환 시</div></div>'+
    '<p class="note">월세=보증금×전환율÷12. 법정 전환율 상한은 기준금리+2% 등 규정 참고.</p>';
    function calc(){var d=num(el.querySelector("#d").value),r=num(el.querySelector("#r").value)/100;el.querySelector("#v").innerHTML=won(d*r/12)+'<small>원</small>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  /* 음↔양력 변환.
     삭(달의 위상) 계산을 직접 하지 않는다. 브라우저 Intl이 중국력(음력)을 이미 안다.
     한국 음력은 KASI 기준이라 중국력과 삭 시각 자정 근처에서 갈릴 수 있는데,
     설날·추석 21건(2018~2028)으로 대조해 전부 일치하는 것을 확인하고 채택했다.
     역변환(음→양)은 공식이 없다. 후보 날짜를 하루씩 훑어 맞는 것을 집는다 —
     한 달 남짓이면 반드시 나오므로 40일만 본다. */);