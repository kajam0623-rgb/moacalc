TOOLS.push({id:"unit",cat:"변환·기타",icon:"",name:"단위 변환",desc:"길이·무게·온도",render:function(el){
    el.innerHTML='<label>종류</label><select id="c"><option value="len">길이</option><option value="wt">무게</option><option value="temp">온도</option></select>'+
    '<label>값</label><div class="field"><input class="money" id="v" value="100"></div>'+
    '<div class="rows" id="rows" style="margin-top:16px"></div>';
    function calc(){var c=el.querySelector("#c").value,x=num(el.querySelector("#v").value),out;
      if(c==="len")out=[["m",x],["km",x/1000],["cm",x*100],["inch",x*39.3701],["ft",x*3.28084],["mile",x/1609.34]];
      else if(c==="wt")out=[["kg",x],["g",x*1000],["근(600g)",x/0.6],["파운드",x*2.20462],["온스",x*35.274]];
      else out=[["°C",x],["°F",x*9/5+32],["K",x+273.15]];
      el.querySelector("#rows").innerHTML=out.map(function(o){return '<div class="li"><span>'+o[0]+'</span><b>'+(Math.round(o[1]*1000)/1000).toLocaleString("ko-KR")+'</b></div>';}).join("");}
    bindMoney(el);el.querySelector("#v")._cb=calc;el.querySelector("#c").addEventListener("change",calc);calc();}});