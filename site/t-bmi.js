TOOLS.push({id:"bmi",cat:"생활",icon:"⚖️",name:"BMI 계산기",desc:"체질량·표준체중",render:function(el){
    el.innerHTML='<div class="r2"><div><label>키(cm)</label><input class="money" id="h" value="170"></div><div><label>몸무게(kg)</label><input class="money" id="w" value="65"></div></div>'+
    '<div class="out"><div class="k">BMI</div><div class="v" id="v">0</div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div>';
    function calc(){var h=num(el.querySelector("#h").value)/100,w=num(el.querySelector("#w").value);if(!h)return;
      var bmi=w/(h*h),g=bmi<18.5?"저체중":bmi<23?"정상":bmi<25?"과체중":"비만",std=22*h*h;
      el.querySelector("#v").textContent=bmi.toFixed(1);el.querySelector("#s").textContent=g;
      el.querySelector("#rows").innerHTML='<div class="li"><span>표준체중(BMI22)</span><b>'+std.toFixed(1)+'kg</b></div><div class="li"><span>차이</span><b>'+(w-std>0?"+":"")+(w-std).toFixed(1)+'kg</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});