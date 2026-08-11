TOOLS.push({id:"dday",cat:"생활",icon:"📅",name:"D-day 계산기",desc:"날짜 사이 일수",render:function(el){
    el.innerHTML='<div class="r2"><div><label>시작일</label><input type="date" id="a"></div><div><label>목표일</label><input type="date" id="b"></div></div>'+
    '<div class="out"><div class="k">남은/지난 일수</div><div class="v" id="v">D-0</div><div class="s" id="s"></div></div>';
    var t=new Date();el.querySelector("#a").value=t.toISOString().slice(0,10);var f=new Date(t.getTime()+100*864e5);el.querySelector("#b").value=f.toISOString().slice(0,10);
    function calc(){var a=new Date(el.querySelector("#a").value),b=new Date(el.querySelector("#b").value);if(isNaN(a)||isNaN(b))return;
      var d=Math.round((b-a)/864e5);el.querySelector("#v").textContent=d>0?"D-"+d:d<0?"D+"+(-d):"D-DAY";
      el.querySelector("#s").textContent=Math.abs(d).toLocaleString()+"일 "+(d>=0?"남음":"지남");}
    el.querySelectorAll("input").forEach(function(e){e.addEventListener("change",calc);});calc();}});