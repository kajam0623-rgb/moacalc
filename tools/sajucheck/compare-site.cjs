// Compare fixed-clock builds; only known script relocation differences are allowed.
const fs = require("fs"), path = require("path"), crypto = require("crypto"), assert = require("assert");
const root = path.resolve(__dirname, "../.."), evidence = path.join(root, ".refactor-evidence");
const before = path.join(evidence, "site_before"), after = path.join(root, "site");
const hash = b => crypto.createHash("sha256").update(b).digest("hex");
function files(dir, prefix = "") {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name), prefix + e.name + "/") : [prefix + e.name]).sort();
}
const a = files(before), b = files(after), inventory = [], changed = [], unexpected = [];
const added = b.filter(f => !a.includes(f)), removed = a.filter(f => !b.includes(f));
const normalize = s => s.replace(/core\.js\?v=[0-9a-f]{8}/g, "core.js?v=ENGINE")
  .replace(/t-(newyear|tojeong)\.js\?v=[0-9a-f]{8}/g, "t-$1.js?v=ENGINE");
for (const f of a.filter(f => b.includes(f))) {
  const x = fs.readFileSync(path.join(before, f)), y = fs.readFileSync(path.join(after, f));
  const row = { file: f, before: hash(x), after: hash(y), beforeBytes: x.length, afterBytes: y.length };
  inventory.push(row);
  if (x.equals(y)) continue;
  let reason;
  if (f.endsWith(".html") && normalize(x.toString()) === normalize(y.toString())) reason = "script content-hash query only";
  else if (f === "core.js") reason = "shared engine wrapper and moved calculations";
  else if (f === "t-newyear.js" || f === "t-tojeong.js") reason = "local calculation declarations moved to core.js";
  else { reason = "UNEXPECTED"; unexpected.push(f); }
  const lines = v => { const s = v.toString(); return s.split("\n").length - (s.endsWith("\n") ? 1 : 0); };
  changed.push({ ...row, beforeLines: lines(x), afterLines: lines(y), reason });
}
const html = a.filter(f => f.endsWith(".html")), htmlChanged = changed.filter(f => f.file.endsWith(".html"));
const summary = { beforeFiles: a.length, afterFiles: b.length, html: html.length, htmlIdentical: html.length - htmlChanged.length,
  htmlHashReferenceOnly: htmlChanged.filter(f => f.reason !== "UNEXPECTED").length, changedFiles: changed.length, added, removed, unexpected };
fs.writeFileSync(path.join(evidence, "site-hashes.json"), JSON.stringify(inventory, null, 2));
fs.writeFileSync(path.join(evidence, "site-diff.json"), JSON.stringify({ summary, changed }, null, 2));
fs.writeFileSync(path.join(evidence, "site-diff.tsv"), "file\treason\tbefore lines\tafter lines\tbefore bytes\tafter bytes\tbefore SHA-256\tafter SHA-256\n" + changed.map(r => [r.file,r.reason,r.beforeLines,r.afterLines,r.beforeBytes,r.afterBytes,r.before,r.after].join("\t")).join("\n") + "\n");
console.log(JSON.stringify(summary, null, 2));
assert.deepStrictEqual({ added, removed, unexpected }, { added: [], removed: [], unexpected: [] });
