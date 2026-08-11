TOOLS.push({id:"savegoal",cat:"금융",icon:"",name:"목표 저축 계산기",desc:"목표까지 월 저축",render:function(el){
    el.innerHTML='<label>목표 금액</label><div class="field"><input class="money" id="g" value="10,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>기간(개월)</label><input class="money" id="n" value="24"></div><div><label>연이율(%)</label><input class="money" id="r" value="3"></div></div>'+
    '<div class="out"><div class="k">매달 저축액</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">적금 복리 가정. 이율 0이면 목표÷개월입니다.</p>';
    function calc(){var g=num(el.querySelector("#g").value),n=num(el.querySelector("#n").value)||1,r=num(el.querySelector("#r").value)/100/12;
      var pmt=r>0?g*r/(Math.pow(1+r,n)-1):g/n;el.querySelector("#v").innerHTML=won(pmt)+'<small>원</small>';el.querySelector("#s").textContent=n+"개월 · 총 납입 "+won(pmt*n)+"원";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});