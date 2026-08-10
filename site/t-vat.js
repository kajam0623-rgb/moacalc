TOOLS.push({id:"vat",cat:"부동산·세금",icon:"🧮",name:"부가세 계산기",desc:"공급가↔합계 10%",render:function(el){
    el.innerHTML='<label>금액</label><div class="field"><input class="money" id="a" value="1,000,000"><span class="suf">원</span></div>'+
    '<label>기준</label><select id="m"><option value="supply">이 금액이 공급가액 (부가세 더하기)</option><option value="total">이 금액이 합계 (부가세 빼기)</option></select>'+
    '<div class="rows" id="rows" style="margin-top:16px"></div>';
    function calc(){var a=num(el.querySelector("#a").value),m=el.querySelector("#m").value,supply,vat,total;
      if(m==="supply"){supply=a;vat=a*.1;}else{supply=a/1.1;vat=a-supply;}total=supply+vat;
      el.querySelector("#rows").innerHTML='<div class="li"><span>공급가액</span><b>'+won(supply)+'원</b></div><div class="li"><span>부가세(10%)</span><b>'+won(vat)+'원</b></div><div class="li"><span>합계</span><b>'+won(total)+'원</b></div>';}
    bindMoney(el);el.querySelector("#a")._cb=calc;el.querySelector("#m").addEventListener("change",calc);calc();}});