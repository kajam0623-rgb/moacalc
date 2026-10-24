// 사용: node vol.js 키워드파일(한 줄 하나) [결과.json] — 매직맵 네이버 월 검색량, 50개씩, 띄어쓰기 제거
const fs=require("fs");const [,,inp,out="tools/keyword_volume_2026-10-24.json"]=process.argv;
const kws=[...new Set(fs.readFileSync(inp,"utf8").split(/\r?\n/).map(s=>s.replace(/\s+/g,"")).filter(Boolean))];
const old=fs.existsSync(out)?JSON.parse(fs.readFileSync(out,"utf8")):{};
(async()=>{const todo=kws.filter(k=>!(k in old));
for(let i=0;i<todo.length;i+=50){const b=todo.slice(i,i+50);
 const r=await fetch("https://magic-map-fawn.vercel.app/api/naver-keyword-volume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({keywords:b})}).then(r=>r.json());
 for(const it of r.items||[])old[it.keyword.replace(/\s+/g,"")]=it;
 for(const f of r.summary?.failedKeywords||[])old[f]=old[f]||{fail:1};
 console.error("batch",i/50+1,"ok",(r.items||[]).length,"fail",(r.summary?.failedKeywords||[]).length);
 fs.writeFileSync(out,JSON.stringify(old));await new Promise(r=>setTimeout(r,1500));}
const tot=k=>{const o=old[k]||{};return (o.monthlyPcQcCntValue|0)+(o.monthlyMobileQcCntValue|0)};
for(const k of kws)console.log(k+"\t"+JSON.stringify(old[k]||null).slice(0,160));})();
