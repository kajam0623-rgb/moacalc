TOOLS.push({id:"loanequal",cat:"금융",icon:"",name:"원금균등 상환",desc:"매달 원금 동일",render:function(el){
    el.innerHTML='<label>대출 원금</label><div class="field"><input class="money" id="p" value="100,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>연이자율(%)</label><input class="money" id="r" value="4.5"></div><div><label>기간(개월)</label><input class="money" id="n" value="120"></div></div>'+
    '<div class="out"><div class="k">첫 달 상환액</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">매달 원금(원금÷개월) 고정 + 잔액 이자. 상환액은 매달 감소합니다.</p>';
    function calc(){var P=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100/12,n=num(el.querySelector("#n").value)||1;
      var pr=P/n,first=pr+P*r,last=pr+pr*r,interest=P*r*(n+1)/2;
      el.querySelector("#v").innerHTML=won(first)+'<small>원</small>';el.querySelector("#s").textContent="마지막 달 "+won(last)+"원";
      el.querySelector("#rows").innerHTML='<div class="li"><span>총 상환액</span><b>'+won(P+interest)+'원</b></div><div class="li neg"><span>총 이자</span><b>'+won(interest)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});