TOOLS.push({id:"percent",cat:"변환·기타",icon:"",name:"퍼센트 계산기",desc:"비율 3종",render:function(el){
    el.innerHTML='<label>계산 종류</label><select id="m"><option value="0">A는 B의 몇 %인가</option><option value="1">B의 A%는 얼마</option><option value="2">A에서 B로 몇 % 증감</option></select>'+
    '<div class="r2" style="margin-top:14px"><div><label>A</label><input class="money" id="a" value="30"></div><div><label>B</label><input class="money" id="b" value="200"></div></div>'+
    '<div class="out"><div class="k">결과</div><div class="v" id="v">0</div></div>';
    function calc(){var m=el.querySelector("#m").value,a=num(el.querySelector("#a").value),b=num(el.querySelector("#b").value),r;
      if(m==="0")r=(b?a/b*100:0).toFixed(2)+"%";else if(m==="1")r=won(b*a/100);else r=(a?((b-a)/a*100).toFixed(2):0)+"%";
      el.querySelector("#v").textContent=r;}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});el.querySelector("#m").addEventListener("change",calc);calc();}});