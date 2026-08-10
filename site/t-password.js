TOOLS.push({id:"password",cat:"변환·기타",icon:"",name:"비밀번호 생성기",desc:"안전한 랜덤",render:function(el){
    el.innerHTML='<label>길이</label><div class="field"><input class="money" id="n" value="16"></div>'+
    '<div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:12px">'+
    '<label style="text-transform:none;letter-spacing:0;font-weight:600;font-size:14px;margin:0"><input type="checkbox" id="d" checked>숫자</label>'+
    '<label style="text-transform:none;letter-spacing:0;font-weight:600;font-size:14px;margin:0"><input type="checkbox" id="s" checked>기호</label>'+
    '<label style="text-transform:none;letter-spacing:0;font-weight:600;font-size:14px;margin:0"><input type="checkbox" id="up" checked>대문자</label></div>'+
    '<div class="out"><div class="k">생성된 비밀번호</div><div class="v" id="v" style="font-size:19px;word-break:break-all;text-align:left"></div></div>'+
    '<button id="b" style="margin-top:14px;width:100%;padding:13px;border:none;background:var(--accent);color:#fff;font:inherit;font-weight:800;cursor:pointer">다시 생성</button>';
    function gen(){var n=Math.max(4,Math.min(64,num(el.querySelector("#n").value))),set="abcdefghijkmnpqrstuvwxyz";
      if(el.querySelector("#up").checked)set+="ABCDEFGHJKLMNPQRSTUVWXYZ";if(el.querySelector("#d").checked)set+="23456789";if(el.querySelector("#s").checked)set+="!@#$%^&*?";
      var p="";for(var i=0;i<n;i++)p+=set[Math.floor(Math.random()*set.length)];el.querySelector("#v").textContent=p;}
    el.querySelector("#b").addEventListener("click",gen);el.querySelectorAll("input").forEach(function(e){e.addEventListener("input",gen);e.addEventListener("change",gen);});gen();}});