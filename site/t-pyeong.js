TOOLS.push({id:"pyeong",cat:"부동산·세금",icon:"📐",name:"평↔㎡ 변환",desc:"평수 제곱미터",render:function(el){
    el.innerHTML='<div class="r2"><div><label>평</label><input class="money" id="p" value="34"></div><div><label>㎡</label><input class="money" id="m" value="112.4"></div></div>'+
    '<p class="note">1평 = 3.305785㎡. 한쪽을 입력하면 다른 쪽이 자동 변환됩니다.</p>';
    var K=3.305785,lock=false;
    function fromP(){if(lock)return;lock=true;el.querySelector("#m").value=(num(el.querySelector("#p").value)*K).toFixed(2);lock=false;}
    function fromM(){if(lock)return;lock=true;el.querySelector("#p").value=(num(el.querySelector("#m").value)/K).toFixed(2);lock=false;}
    el.querySelector("#p").addEventListener("input",fromP);el.querySelector("#m").addEventListener("input",fromM);}});