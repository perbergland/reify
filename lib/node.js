var Module = require("module");
var Mp = Module.prototype;

if (typeof Mp.import === "function") {
  // If the Module.prototype.import method is already defined, abandon
  // reification immediately.
  return;
}

var Entry = require("./entry.js").Entry;
var compile = require("./compiler.js").compile;

Mp.import = function (id, setters) {
  var module = this;

  id = Module._resolveFilename(id, module);

  if (setters && typeof setters === "object") {
    var entry = Entry.getOrCreate(id);
    entry.addSetters(setters);
    entry.addParent(module);
  }

  var countBefore = entry && entry.runCount;
  var exports = module.require(id);

  if (entry && entry.runCount === countBefore) {
    entry.runModuleSetters(Module._cache[id] || {
      id: id,
      exports: exports,
      getExportByName: Mp.getExportByName
    });
  }

  return exports;
};

// Override Module.prototype.load to call Entry.runModuleSetters whenever
// a module has loaded.
var load = Mp.load;
Mp.load = function () {
  var result = load.apply(this, arguments);
  Entry.runModuleSetters(this);
  return result;
};

// Override Module.prototype._compile to compile any code that will be
// evaluated as a module.
// TODO Does this work in the Node REPL?
var _compile = Mp._compile;
Mp._compile = function (content, filename) {
  return _compile.call(this, compile(content), filename);
};

// This method can be overridden by client code to implement custom export
// naming logic. The current implementation works well with Babel's
// __esModule convention.
Mp.getExportByName = function (name) {
  var exports = this.exports;

  if (name === "*") {
    return exports;
  }

  if (name === "default" &&
      ! (exports && exports.__esModule)) {
    return exports;
  }

  return exports && exports[name];
};