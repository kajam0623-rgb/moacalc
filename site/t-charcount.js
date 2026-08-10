TOOLS.push({id:"charcount",cat:"생활",icon:"🔤",name:"글자수 세기",desc:"공백 포함/제외",render:function(el){
    el.innerHTML='<label>텍스트를 붙여넣으세요</label><textarea id="t" placeholder="자소서·블로그 글 등을 입력하세요"></textarea>'+
    '<div class="chips" id="c"></div>';
    function calc(){var v=el.querySelector("#t").value,noSp=v.replace(/\s/g,""),bytes=0;
      for(var i=0;i<v.length;i++){bytes+=v.charCodeAt(i)>127?2:1;}
      var words=v.trim()?v.trim().split(/\s+/).length:0;
      el.querySelector("#c").innerHTML=[["공백포함",v.length+"자"],["공백제외",noSp.length+"자"],["단어",words],["바이트",bytes+"B"],["줄",v?v.split(/\n/).length:0]]
        .map(function(x){return '<span class="chip">'+x[0]+' '+x[1]+'</span>';}).join("");}
    el.querySelector("#t").addEventListener("input",calc);calc();}});