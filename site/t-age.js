TOOLS.push({id:"age",cat:"생활",icon:"🎂",name:"만 나이 계산기",desc:"생년월일→만 나이",render:function(el){
    el.innerHTML='<label>생년월일</label><input type="date" id="b" value="1990-01-01">'+
    '<div class="out"><div class="k">만 나이</div><div class="v" id="v">0<small>세</small></div><div class="s" id="s"></div></div>';
    function calc(){var b=new Date(el.querySelector("#b").value),n=new Date();if(isNaN(b))return;
      var a=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--;
      var days=Math.floor((n-b)/864e5);el.querySelector("#v").innerHTML=a+'<small>세</small>';el.querySelector("#s").textContent="태어난 지 "+days.toLocaleString()+"일";}
    el.querySelector("#b").addEventListener("change",calc);calc();}});