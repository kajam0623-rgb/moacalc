TOOLS.push({id:"anniversary",cat:"생활",icon:"",name:"기념일 계산기",desc:"사귄 날부터 D일",render:function(el){
    el.innerHTML='<label>시작일 (사귄 날 등)</label><input type="date" id="d">'+
    '<div class="out"><div class="k">오늘로</div><div class="v" id="v">0<small>일째</small></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">시작일을 1일째로 계산합니다.</p>';
    el.querySelector("#d").value=new Date(Date.now()-100*864e5).toISOString().slice(0,10);
    function calc(){var d=new Date(el.querySelector("#d").value);if(isNaN(d))return;
      var days=Math.floor((Date.now()-d)/864e5)+1;el.querySelector("#v").innerHTML=days.toLocaleString()+'<small>일째</small>';
      el.querySelector("#rows").innerHTML=[100,200,300,365,500,1000,2000].map(function(m){var t=new Date(d.getTime()+(m-1)*864e5);
        return '<div class="li"><span>'+(m===365?"1주년":m+"일")+'</span><b>'+t.toISOString().slice(0,10)+'</b></div>';}).join("");}
    el.querySelector("#d").addEventListener("change",calc);calc();}});