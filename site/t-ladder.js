TOOLS.push({id:"ladder",cat:"재미·운세",icon:"",name:"사다리타기",desc:"공평하게 정하기",render:function(el){
    el.innerHTML='<label>참가자 (줄바꿈)</label><textarea id="p" style="min-height:78px">철수\n영희\n민수\n지영</textarea>'+
    '<label>결과 (줄바꿈·같은 개수)</label><textarea id="r" style="min-height:78px">청소\n설거지\n빨래\n꽝</textarea>'+
    '<button id="b" style="margin-top:12px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">사다리 타기</button>'+
    '<div id="out" style="margin-top:16px"></div>';
    function go(){
      var P=el.querySelector("#p").value.split(/\n/).map(function(s){return s.trim();}).filter(Boolean);
      var R=el.querySelector("#r").value.split(/\n/).map(function(s){return s.trim();}).filter(Boolean);
      var n=P.length;if(n<2||R.length<n){el.querySelector("#out").innerHTML='<p class="note">참가자·결과를 2개 이상, 같은 수로 입력하세요.</p>';return;}
      var rows=Math.max(6,n*2),W=Math.min(70,320/n),H=26,rungs=[];
      for(var y=1;y<rows;y++){var used={};for(var x=0;x<n-1;x++){if(Math.random()<0.4&&!used[x-1]){rungs.push([x,y]);used[x]=1;}}}
      var end=[];for(var i=0;i<n;i++){var c=i;for(var y2=1;y2<rows;y2++){
        if(rungs.some(function(g){return g[1]===y2&&g[0]===c-1;}))c--;
        else if(rungs.some(function(g){return g[1]===y2&&g[0]===c;}))c++;}end.push(c);}
      var sw=(n-1)*W+40,sh=(rows-1)*H+20,s='<svg viewBox="0 0 '+sw+' '+sh+'" style="width:100%;max-width:'+sw+'px" stroke="currentColor" fill="none">';
      for(var x2=0;x2<n;x2++)s+='<line x1="'+(20+x2*W)+'" y1="10" x2="'+(20+x2*W)+'" y2="'+(sh-10)+'" stroke-opacity=".35"/>';
      rungs.forEach(function(g){var yy=10+g[1]*H;s+='<line x1="'+(20+g[0]*W)+'" y1="'+yy+'" x2="'+(20+(g[0]+1)*W)+'" y2="'+yy+'" stroke="#e6b25a" stroke-width="2.5"/>';});
      s+='</svg>';
      el.querySelector("#out").innerHTML=s+'<div class="rows">'+P.map(function(name,i){return '<div class="li"><span>'+name+'</span><b>'+R[end[i]]+'</b></div>';}).join("")+'</div>';}
    el.querySelector("#b").addEventListener("click",go);go();}});