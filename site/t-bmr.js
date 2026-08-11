TOOLS.push({id:"bmr",cat:"생활",icon:"",name:"기초대사량(BMR)",desc:"하루 소모 칼로리",render:function(el){
    el.innerHTML='<div class="r2"><div><label>성별</label><select id="g"><option value="m">남</option><option value="f">여</option></select></div><div><label>나이</label><input class="money" id="a" value="30"></div></div>'+
    '<div class="r2"><div><label>키(cm)</label><input class="money" id="h" value="170"></div><div><label>몸무게(kg)</label><input class="money" id="w" value="65"></div></div>'+
    '<div class="out"><div class="k">기초대사량</div><div class="v" id="v">0<small>kcal</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">Mifflin-St Jeor 공식. 활동대사량은 BMR×1.4~1.7.</p>';
    function calc(){var g=el.querySelector("#g").value,a=num(el.querySelector("#a").value),h=num(el.querySelector("#h").value),w=num(el.querySelector("#w").value);
      var bmr=10*w+6.25*h-5*a+(g==="m"?5:-161);el.querySelector("#v").innerHTML=Math.round(bmr)+'<small>kcal</small>';el.querySelector("#s").textContent="활동 보통 시 약 "+Math.round(bmr*1.55)+"kcal/일";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});el.querySelector("#g").addEventListener("change",calc);calc();}});