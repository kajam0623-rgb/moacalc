TOOLS.push({id:"acqtax",cat:"부동산·세금",icon:"🏠",name:"부동산 취득세",desc:"주택 취득세율",render:function(el){
    el.innerHTML='<label>주택 취득가액</label><div class="field"><input class="money" id="p" value="500,000,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">취득세(본세)</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">1주택 유상취득 기준. 6억↓ 1%, 6~9억 1~3% 구간, 9억↑ 3%. 지방교육세·농특세 별도(소액). 다주택·조정지역은 중과.</p>';
    function calc(){var P=num(el.querySelector("#p").value),rate;
      if(P<=6e8)rate=1;else if(P<=9e8)rate=P/1e8*2/3-3;else rate=3;
      var tax=P*rate/100;el.querySelector("#v").innerHTML=won(tax)+'<small>원</small>';
      el.querySelector("#s").textContent="적용 세율 "+rate.toFixed(2)+"%";}
    bindMoney(el);el.querySelector("#p")._cb=calc;calc();}});