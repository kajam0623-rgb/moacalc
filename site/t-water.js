TOOLS.push({id:"water",cat:"생활",icon:"",name:"물 섭취량 계산기",desc:"하루 권장량",render:function(el){
    el.innerHTML='<label>체중(kg)</label><div class="field"><input class="money" id="w" value="60"><span class="suf">kg</span></div>'+
    '<div class="out"><div class="k">하루 권장 수분</div><div class="v" id="v">0<small>ml</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">체중 1kg당 약 33ml 기준. 운동·날씨에 따라 더 필요할 수 있습니다.</p>';
    function calc(){var w=num(el.querySelector("#w").value),ml=w*33;el.querySelector("#v").innerHTML=Math.round(ml).toLocaleString()+'<small>ml</small>';el.querySelector("#s").textContent="약 "+(ml/1000).toFixed(1)+"L · 물컵 "+Math.round(ml/200)+"잔";}
    bindMoney(el);el.querySelector("#w")._cb=calc;calc();}});