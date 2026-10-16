// Deterministic comparison clock; used only via node --require in refactor checks.
const NativeDate = Date;
const instant = NativeDate.parse("2026-10-17T03:00:00.000Z");
global.Date = class extends NativeDate {
  constructor(...args) { super(...(args.length ? args : [instant])); }
  static now() { return instant; }
};
let seed = 20261017;
Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
