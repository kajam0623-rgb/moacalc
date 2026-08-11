TOOLS.push({id:"ltv",cat:"부동산·세금",icon:"",name:"대출한도(LTV)",desc:"담보가×비율",render:function(el){
    el.innerHTML='<label>담보(주택) 가격</label><div class="field"><input class="money" id="p" value="500,000,000"><span class="suf">원</span></div>'+
    '<label>LTV 비율(%)</label><div class="field"><input class="money" id="r" value="70"><span class="suf">%</span></div>'+
    '<div class="out"><div class="k">최대 대출 한도</div><div class="v" id="v">0<small>원</small></div><div class="s">규제·소득(DSR)에 따라 실제 한도는 낮아질 수 있습니다</div></div>';
    function calc(){var p=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100;el.querySelector("#v").innerHTML=won(p*r)+'<small>원</small>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});