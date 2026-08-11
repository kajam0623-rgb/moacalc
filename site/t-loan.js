TOOLS.push({id:"loan",cat:"금융",icon:"🏦",name:"대출 이자 계산기",desc:"원리금균등 월상환",render:function(el){
    el.innerHTML='<label>대출 원금</label><div class="field"><input class="money" id="p" value="100,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>연이자율(%)</label><input class="money" id="r" value="4.5"></div><div><label>기간(개월)</label><input class="money" id="n" value="360"></div></div>'+
    '<div class="out"><div class="k">월 상환액</div><div class="v" id="m">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div>';
    function calc(){var P=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100/12,n=num(el.querySelector("#n").value);
      var m=r>0?P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):P/n,total=m*n,interest=total-P;
      el.querySelector("#m").innerHTML=won(m)+'<small>원</small>';el.querySelector("#s").textContent=n+"개월 원리금균등";
      el.querySelector("#rows").innerHTML='<div class="li"><span>총 상환액</span><b>'+won(total)+'원</b></div><div class="li neg"><span>총 이자</span><b>'+won(interest)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});