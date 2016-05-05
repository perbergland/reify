var assert = require("assert");

describe("import statements", function () {
  it("should work in nested scopes", function () {
    import { name, id } from "./name";
    assert.strictEqual(name, "name.js");
    assert.strictEqual(id.split("/").pop(), "name.js");
  });

  it("should cope with dependency cycles", function () {
    import { check as aCheck } from "./cycle-a";
    aCheck();

    import { check as bCheck } from "./cycle-a";
    bCheck();
  });
});

describe("export statements", function () {
  it("should allow * exports", function () {
    import Default, {
      a, b, c as d,
    } from "./export-all.js";

    assert.strictEqual(a, "a");
    assert.strictEqual(b, "b");
    assert.strictEqual(d, "c");

    assert.deepEqual(Default, {
      a: "a",
      b: "b",
      c: "c"
    });
  });

  it("should allow named re-exports", function test() {
    import { a, c, v, si } from "./export-some.js";
    assert.strictEqual(a, "a");
    assert.strictEqual(c(), "c");
    assert.strictEqual(v, "b");
    assert.strictEqual(si, "cee");
  });
});

describe("built-in modules", function () {
  it("should fire setters if already loaded", function () {
    // The "module" module is required in ../lib/node.js before we begin
    // compiling anything.
    import { Module as M } from "module";
    assert.ok(module instanceof M);
  });
});