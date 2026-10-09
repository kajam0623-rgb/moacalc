# 사주가 비슷한 유명인(2026-10-09) — 위키데이터(CC0)에서 한국 국적·생존·생일(일 단위)·위키 링크 16개 이상 인물을 받아 content_celeb.json 으로.
# 정치·공직·법조 직군은 뺀다. 실행: py -3 tools/celeb_fetch.py  (요청 헤더에 개인 정보를 넣지 않는다)
import json, re, urllib.request, urllib.parse, pathlib
Q = """
SELECT ?p ?ko ?birth ?occLabel ?links WHERE {
  ?p wdt:P27 wd:Q884; wdt:P31 wd:Q5; wdt:P569 ?birth; wikibase:sitelinks ?links; rdfs:label ?ko .
  FILTER(LANG(?ko)="ko")
  ?p p:P569/psv:P569 [ wikibase:timePrecision 11 ] .
  FILTER(YEAR(?birth) >= 1940 && YEAR(?birth) <= 2010)
  FILTER(?links >= 16)
  FILTER NOT EXISTS { ?p wdt:P570 ?d }
  ?p wdt:P106 ?occ . ?occ rdfs:label ?occLabel . FILTER(LANG(?occLabel)="ko")
} LIMIT 4000
"""
url = "https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(Q)
req = urllib.request.Request(url, headers={"User-Agent": "dongnebosal-celeb/1.0 (https://dongnebosal.com)", "Accept": "application/sparql-results+json"})
rows = json.load(urllib.request.urlopen(req, timeout=150))["results"]["bindings"]
P = {}
for r in rows:
    q = r["p"]["value"].rsplit("/", 1)[1]
    o = P.setdefault(q, {"ko": r["ko"]["value"], "b": r["birth"]["value"][:10], "links": int(r["links"]["value"]), "occ": set()})
    o["occ"].add(r["occLabel"]["value"])
BAN = {"정치인", "행정부 수반", "외교관", "변호사", "군인", "판사", "검사", "법률가", "공무원", "대통령", "국회의원", "장교", "활동가"}
CAT = [("가수", {"가수", "래퍼", "싱어송라이터", "팝 가수", "트로트 가수", "아이돌"}), ("배우", {"배우", "영화 배우", "텔레비전 배우", "연극 배우", "아역 배우", "뮤지컬 배우"}),
       ("운동선수", None), ("방송인", {"TV 사회자", "진행자", "코미디언", "방송인", "유튜버", "라디오 DJ"}), ("감독", {"영화 감독", "감독", "텔레비전 감독", "축구 감독"}),
       ("음악가", {"작곡가", "작곡가 겸 작사가", "음악 프로듀서", "피아노 연주자", "음악가", "작사가", "바이올리니스트", "지휘자"}), ("작가", {"작가", "소설가", "시인", "각본가", "만화가"}),
       ("기업인", {"사업가", "기업가", "요식업자", "경영인"})]
def cats(occ):
    out = []
    for name, s in CAT:
        if (s is None and any(o.endswith("선수") for o in occ)) or (s and occ & s): out.append(name)
    return "·".join(out[:2])
fin, seen = [], set()
for q, o in sorted(P.items(), key=lambda kv: -kv[1]["links"]):
    if o["occ"] & BAN or not re.fullmatch(r"[가-힣]{2,6}", o["ko"]) or o["ko"] in seen: continue
    c = cats(o["occ"])
    if not c: continue
    seen.add(o["ko"]); fin.append([o["ko"], o["b"], c, q])
out = pathlib.Path(__file__).resolve().parent.parent / "content_celeb.json"
json.dump({"src": "위키데이터(CC0) 2026-10-09", "rows": fin}, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(fin), "명 →", out.name)
