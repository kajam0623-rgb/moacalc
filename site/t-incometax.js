TOOLS.push({id:"incometax",cat:"급여·노동",icon:"",name:"종합소득세 계산기",desc:"과세표준→세액",render:function(el){
    el.innerHTML='<label>과세표준</label><div class="field"><input class="money" id="b" value="30,000,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">산출세액 + 지방소득세</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">2026 종합소득세율(6~45%) 기준. 세액공제 전 산출세액입니다.</p>';
    function calc(){var b=num(el.querySelector("#b").value),t=progressive(b),lt=t*.1;
      el.querySelector("#v").innerHTML=won(t+lt)+'<small>원</small>';el.querySelector("#s").textContent="실효세율 "+(b?((t+lt)/b*100).toFixed(1):0)+"%";
      el.querySelector("#rows").innerHTML='<div class="li"><span>산출세액</span><b>'+won(t)+'원</b></div><div class="li"><span>지방소득세 10%</span><b>'+won(lt)+'원</b></div>';}
    bindMoney(el);el.querySelector("#b")._cb=calc;calc();}});