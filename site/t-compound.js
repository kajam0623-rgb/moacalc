TOOLS.push({id:"compound",cat:"금융",icon:"",name:"복리 계산기",desc:"원금·이율→미래가치",render:function(el){
    el.innerHTML='<label>원금</label><div class="field"><input class="money" id="p" value="10,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>연이율(%)</label><input class="money" id="r" value="5"></div><div><label>기간(년)</label><input class="money" id="y" value="10"></div></div>'+
    '<div class="out"><div class="k">만기 금액</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">연 복리 기준. 미래가치=원금×(1+이율)^년수.</p>';
    function calc(){var p=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100,y=num(el.querySelector("#y").value);
      var fv=p*Math.pow(1+r,y);el.querySelector("#v").innerHTML=won(fv)+'<small>원</small>';el.querySelector("#s").textContent=y+"년 후 · 원금의 "+(p?(fv/p).toFixed(2):0)+"배";
      el.querySelector("#rows").innerHTML='<div class="li"><span>원금</span><b>'+won(p)+'원</b></div><div class="li"><span>수익</span><b>+'+won(fv-p)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});