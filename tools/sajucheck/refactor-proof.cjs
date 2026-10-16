// Run with --require ./tools/sajucheck/fixed-clock.cjs, before / after extraction.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const root = path.resolve(__dirname, "../.."), dir = path.join(root, ".refactor-evidence");
const phase = process.argv[2];
if (!["before", "after"].includes(phase)) throw new Error("Expected before or after");
fs.mkdirSync(dir, { recursive: true });
const R = require("./render.js"), C = R.ctx;
const hash = s => crypto.createHash("sha256").update(s).digest("hex");
const pad = n => String(n).padStart(2, "0");
let seed = 20261017;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const regions = C.SJ_REGIONS.map(r => r[0]).concat(["", "unknown"]);
const cases = [];
const add = (d, h, label) => cases.push({ date: d, time: h, gender: random() < .5 ? "m" : "f", region: regions[cases.length % regions.length], label });
// Every historical DST transition, including the minute before and after it.
C.KR_DST.forEach(pair => pair.forEach(s => {
  const ms = Date.parse(s + "Z");
  [-1, 0, 1].forEach(n => { const iso = new Date(ms + n * 60000).toISOString(); add(iso.slice(0, 10), iso.slice(11, 16), "DST"); });
}));
// Both days and minutes around ipchun; compute inputs once with the old engine.
[1900, 1954, 1961, 1987, 1988, 2000, 2026].forEach(y => {
  const ms = Math.round(((C.sjIpchun(y) - 2440587.5) * 86400000 + 9 * 3600000) / 60000) * 60000;
  [-1440, -1, 0, 1, 1440].forEach(n => { const iso = new Date(ms + n * 60000).toISOString(); add(iso.slice(0, 10), iso.slice(11, 16), "ipchun"); });
});
["1954-03-21", "1961-08-10", "2000-02-29", "2020-12-31"].forEach(d => ["00:00", "00:01", "01:29", "01:30", "23:00", "23:29", "23:30", "23:59", null].forEach(h => add(d, h, "clock/leap/jasi")));
while (cases.length < 300) {
  const y = 1900 + Math.floor(random() * 126), m = 1 + Math.floor(random() * 12), d = 1 + Math.floor(random() * new Date(Date.UTC(y, m, 0)).getUTCDate());
  add(y + "-" + pad(m) + "-" + pad(d), random() < .12 ? null : pad(Math.floor(random() * 24)) + ":" + pad(Math.floor(random() * 60)), "random");
}
const inputsFile = path.join(dir, "births.json");
if (phase === "before") {
  if (fs.existsSync(inputsFile)) throw new Error("Refusing to overwrite baseline");
  fs.writeFileSync(inputsFile, JSON.stringify({ seed: 20261017, clock: new Date().toISOString(), cases }, null, 2));
}
const inputs = JSON.parse(fs.readFileSync(inputsFile)).cases;
const results = inputs.map((v, i) => {
  const html = R.renderSaju(v.date, v.time, v.gender, "", v.region);
  if (!html.includes("sj-confirm")) throw new Error("Missing result: " + i);
  return { i, ...v, bytes: Buffer.byteLength(html), sha256: hash(html) };
});
fs.writeFileSync(path.join(dir, phase + "-render.json"), JSON.stringify(results, null, 2));
if (phase === "after") {
  const before = JSON.parse(fs.readFileSync(path.join(dir, "before-render.json")));
  const mismatch = results.filter((v, i) => v.sha256 !== before[i].sha256);
  console.log(JSON.stringify({ count: results.length, mismatch }, null, 2));
  if (mismatch.length) process.exitCode = 1;
} else console.log("Saved baseline hashes: " + results.length);
