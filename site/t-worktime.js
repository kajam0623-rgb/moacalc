TOOLS.push({id:"worktime",cat:"생활",icon:"",name:"근무시간 계산기",desc:"출퇴근→근무시간",render:function(el){
    el.innerHTML='<div class="r2"><div><label>출근</label><input type="time" id="i" value="09:00"></div><div><label>퇴근</label><input type="time" id="o" value="18:00"></div></div>'+
    '<label>휴게시간(분)</label><div class="field"><input class="money" id="b" value="60"><span class="suf">분</span></div>'+
    '<div class="out"><div class="k">실 근무시간</div><div class="v" id="v">0<small>시간</small></div><div class="s" id="s"></div></div>';
    function calc(){var i=el.querySelector("#i").value.split(":"),o=el.querySelector("#o").value.split(":"),b=num(el.querySelector("#b").value);
      var mins=(+o[0]*60+ +o[1])-(+i[0]*60+ +i[1]);if(mins<0)mins+=1440;mins-=b;if(mins<0)mins=0;
      el.querySelector("#v").innerHTML=(mins/60).toFixed(2)+'<small>시간</small>';el.querySelector("#s").textContent=Math.floor(mins/60)+"시간 "+(mins%60)+"분";}
    bindMoney(el);el.querySelector("#b")._cb=calc;el.querySelectorAll("#i,#o").forEach(function(e){e.addEventListener("change",calc);});calc();}});