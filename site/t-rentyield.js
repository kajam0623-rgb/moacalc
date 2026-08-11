TOOLS.push({id:"rentyield",cat:"부동산·세금",icon:"",name:"임대수익률 계산기",desc:"연 수익률",render:function(el){
    el.innerHTML='<label>매매가</label><div class="field"><input class="money" id="p" value="300,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>보증금</label><div class="field"><input class="money" id="d" value="30,000,000"></div></div><div><label>월세</label><div class="field"><input class="money" id="m" value="1,000,000"></div></div></div>'+
    '<div class="out"><div class="k">연 임대수익률</div><div class="v" id="v">0<small>%</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">수익률 = 연 월세 ÷ (매매가 − 보증금) × 100. 세금·관리비 제외.</p>';
    function calc(){var p=num(el.querySelector("#p").value),d=num(el.querySelector("#d").value),m=num(el.querySelector("#m").value),invest=p-d;
      el.querySelector("#v").innerHTML=(invest>0?(m*12/invest*100).toFixed(2):0)+'<small>%</small>';el.querySelector("#s").textContent="실투자금 "+won(invest)+"원";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});