TOOLS.push({id:"brokerfee",cat:"부동산·세금",icon:"🤝",name:"중개수수료 계산기",desc:"매매·전월세 상한",render:function(el){
    el.innerHTML='<label>거래금액</label><div class="field"><input class="money" id="p" value="500,000,000"><span class="suf">원</span></div>'+
    '<label>거래 유형</label><select id="t"><option value="sale">매매·교환</option><option value="rent">전세·월세</option></select>'+
    '<div class="out" style="margin-top:14px"><div class="k">중개보수 상한</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">주택 기준 법정 상한요율. 실제는 상한 내 협의이며 부가세 별도일 수 있습니다.</p>';
    function rate(P,t){var b=t==="sale"?[[5e7,.006],[2e8,.005],[9e8,.004],[12e8,.005],[15e8,.006]]:[[5e7,.005],[1e8,.004],[6e8,.003],[12e8,.004],[15e8,.005]];
      for(var i=0;i<b.length;i++)if(P<=b[i][0])return b[i][1];return t==="sale"?.007:.006;}
    function calc(){var P=num(el.querySelector("#p").value),t=el.querySelector("#t").value,rt=rate(P,t),fee=P*rt;
      el.querySelector("#v").innerHTML=won(fee)+'<small>원</small>';el.querySelector("#s").textContent="상한요율 "+(rt*100).toFixed(1)+"%";}
    bindMoney(el);el.querySelector("#p")._cb=calc;el.querySelector("#t").addEventListener("change",calc);calc();}});