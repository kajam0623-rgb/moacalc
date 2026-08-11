TOOLS.push({id:"deposit",cat:"금융",icon:"💵",name:"예금 만기 계산기",desc:"복리 예치 만기금",render:function(el){
    el.innerHTML='<label>예치금</label><div class="field"><input class="money" id="p" value="10,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>연이율(%)</label><input class="money" id="r" value="3.5"></div><div><label>기간(개월)</label><input class="money" id="n" value="12"></div></div>'+
    '<div class="out"><div class="k">만기 수령액(세후)</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">월복리·이자소득세 15.4% 반영.</p>';
    function calc(){var p=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100,n=num(el.querySelector("#n").value);
      var mature=p*Math.pow(1+r/12,n),pretax=mature-p,tax=pretax*.154,net=p+pretax-tax;
      el.querySelector("#v").innerHTML=won(net)+'<small>원</small>';el.querySelector("#s").textContent="원금 "+won(p)+"원";
      el.querySelector("#rows").innerHTML='<div class="li"><span>세전 이자</span><b>'+won(pretax)+'원</b></div><div class="li neg"><span>이자세 15.4%</span><b>-'+won(tax)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});