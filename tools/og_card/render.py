# 동네보살 기본 공유 그림 만들기: home.html 을 1200x630 으로 찍어 img/og.jpg 로 저장한다. 실행: py -3 tools/og_card/render.py
import pathlib, subprocess
from playwright.sync_api import sync_playwright
here = pathlib.Path(__file__).resolve().parent
root = here.parent.parent
png = here / "home.png"
with sync_playwright() as pw:
    b = pw.chromium.launch(); p = b.new_page(viewport={"width": 1200, "height": 630})
    p.goto((here / "home.html").as_uri()); p.wait_for_timeout(1500)
    p.screenshot(path=str(png)); b.close()
ff = "C:/Users/닥터원츠/ffmpeg/bin/ffmpeg"
subprocess.run([ff, "-loglevel", "error", "-y", "-i", str(png), "-q:v", "3", str(root / "img" / "og.jpg")], check=True)
print("img/og.jpg", (root / "img" / "og.jpg").stat().st_size, "bytes")
