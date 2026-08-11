TOOLS.push({id:"realreturn",cat:"금융",icon:"",name:"실질 수익률",desc:"물가 반영 수익",render:function(el){
    el.innerHTML='<div class="r2"><div><label>명목 수익률(%)</label><input class="money" id="a" value="5"></div><div><label>물가상승률(%)</label><input class="money" id="b" value="3"></div></div>'+
    '<div class="out"><div class="k">실질 수익률</div><div class="v" id="v">0<small>%</small></div><div class="s">물가를 뺀 진짜 수익</div></div>'+
    '<p class="note">실질 = (1+명목)/(1+물가) − 1.</p>';
    function calc(){var a=num(el.querySelector("#a").value)/100,b=num(el.querySelector("#b").value)/100;el.querySelector("#v").innerHTML=(((1+a)/(1+b)-1)*100).toFixed(2)+'<small>%</small>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});