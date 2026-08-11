TOOLS.push({id:"fx",cat:"금융",icon:"",name:"환율 계산기",desc:"수동 환율 변환",render:function(el){
    el.innerHTML='<label>외화 금액</label><div class="field"><input class="money" id="a" value="100"></div>'+
    '<label>환율 (1단위 = ? 원)</label><div class="field"><input class="money" id="r" value="1,380"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">원화 환산</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">실시간 환율은 은행·포털에서 확인해 입력하세요.</p>';
    function calc(){var a=num(el.querySelector("#a").value),r=num(el.querySelector("#r").value);
      el.querySelector("#v").innerHTML=won(a*r)+'<small>원</small>';el.querySelector("#s").textContent="1원 = "+(r?(1/r).toFixed(4):0)+" 외화";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});