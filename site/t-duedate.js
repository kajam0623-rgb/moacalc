TOOLS.push({id:"duedate",cat:"생활",icon:"",name:"출산 예정일",desc:"마지막 생리+280일",render:function(el){
    el.innerHTML='<label>마지막 생리 시작일</label><input type="date" id="d">'+
    '<div class="out"><div class="k">출산 예정일</div><div class="v" id="v" style="font-size:26px">-</div><div class="s" id="s"></div></div>'+
    '<p class="note">네겔레 법칙(마지막 생리 시작일+280일) 기준 추정. 개인차가 있어 병원 확인이 필요합니다.</p>';
    el.querySelector("#d").value=new Date(Date.now()-56*864e5).toISOString().slice(0,10);
    function calc(){var d=new Date(el.querySelector("#d").value);if(isNaN(d))return;var due=new Date(d.getTime()+280*864e5),week=Math.floor((Date.now()-d)/864e5/7);
      el.querySelector("#v").textContent=due.toISOString().slice(0,10);el.querySelector("#s").textContent=week>=0&&week<=45?"현재 임신 "+week+"주차":"";}
    el.querySelector("#d").addEventListener("change",calc);calc();}});