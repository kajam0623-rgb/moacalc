TOOLS.push({id:"installment",cat:"금융",icon:"",name:"카드 할부 수수료",desc:"할부 이자 계산",render:function(el){
    el.innerHTML='<label>할부 금액</label><div class="field"><input class="money" id="p" value="1,200,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>할부 개월</label><input class="money" id="n" value="6"></div><div><label>수수료율(연 %)</label><input class="money" id="r" value="15"></div></div>'+
    '<div class="out"><div class="k">총 수수료</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">잔액 기준 월 수수료 합산(근사). 실제는 카드사 방식에 따라 다릅니다.</p>';
    function calc(){var p=num(el.querySelector("#p").value),n=num(el.querySelector("#n").value)||1,r=num(el.querySelector("#r").value)/100/12;
      var monthly=p/n,fee=0;for(var i=0;i<n;i++)fee+=(p-monthly*i)*r;
      el.querySelector("#v").innerHTML=won(fee)+'<small>원</small>';el.querySelector("#s").textContent="월 납부 약 "+won(p/n+fee/n)+"원";
      el.querySelector("#rows").innerHTML='<div class="li"><span>총 결제액</span><b>'+won(p+fee)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});