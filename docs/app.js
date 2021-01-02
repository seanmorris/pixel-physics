(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("curvature/base/Bag.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bag = void 0;

var _Bindable = require("./Bindable");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var toId = function toId(_int) {
  return Number(_int);
};

var fromId = function fromId(id) {
  return parseInt(id);
};

var Bag = /*#__PURE__*/function () {
  function Bag() {
    var changeCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

    _classCallCheck(this, Bag);

    this.meta = Symbol('meta');
    this.content = new Map();
    this.list = _Bindable.Bindable.makeBindable([]);
    this.current = 0;
    this.type = undefined;
    this.changeCallback = changeCallback;
  }

  _createClass(Bag, [{
    key: "has",
    value: function has(item) {
      return this.content.has(item);
    }
  }, {
    key: "add",
    value: function add(item) {
      if (item === undefined || !(item instanceof Object)) {
        throw new Error('Only objects may be added to Bags.');
      }

      if (this.type && !(item instanceof this.type)) {
        console.error(this.type, item);
        throw new Error("Only objects of type ".concat(this.type, " may be added to this Bag."));
      }

      if (this.content.has(item)) {
        return;
      }

      var id = toId(this.current++);
      this.content.set(item, id);
      this.list[id] = item;

      if (this.changeCallback) {
        this.changeCallback(item, this.meta, Bag.ITEM_ADDED, id);
      }
    }
  }, {
    key: "remove",
    value: function remove(item) {
      if (item === undefined || !(item instanceof Object)) {
        throw new Error('Only objects may be removed from Bags.');
      }

      if (this.type && !(item instanceof this.type)) {
        console.error(this.type, item);
        throw new Error("Only objects of type ".concat(this.type, " may be removed from this Bag."));
      }

      if (!this.content.has(item)) {
        if (this.changeCallback) {
          this.changeCallback(item, this.meta, 0, undefined);
        }

        return false;
      }

      var id = this.content.get(item);
      delete this.list[id];
      this.content["delete"](item);

      if (this.changeCallback) {
        this.changeCallback(item, this.meta, Bag.ITEM_REMOVED, id);
      }

      return item;
    }
  }, {
    key: "items",
    value: function items() {
      return Array.from(this.content.entries()).map(function (entry) {
        return entry[0];
      });
    }
  }]);

  return Bag;
}();

exports.Bag = Bag;
Object.defineProperty(Bag, 'ITEM_ADDED', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: 1
});
Object.defineProperty(Bag, 'ITEM_REMOVED', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: -1
});
  })();
});

require.register("curvature/base/Bindable.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bindable = void 0;

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Ref = Symbol('ref');
var Original = Symbol('original');
var Deck = Symbol('deck');
var Binding = Symbol('binding');
var SubBinding = Symbol('subBinding');
var BindingAll = Symbol('bindingAll');
var IsBindable = Symbol('isBindable');
var Wrapping = Symbol('wrapping');
var Executing = Symbol('executing');
var Stack = Symbol('stack');
var ObjSymbol = Symbol('object');
var Wrapped = Symbol('wrapped');
var Unwrapped = Symbol('unwrapped');
var GetProto = Symbol('getProto');
var OnGet = Symbol('onGet');
var OnAllGet = Symbol('onAllGet');
var BindChain = Symbol('bindChain');
var TypedArray = Object.getPrototypeOf(Int8Array);
var win = window || {};
var excludedClasses = [win.Node, win.File, win.Map, win.Set, win.ArrayBuffer, win.ResizeObserver, win.MutationObserver, win.PerformanceObserver, win.IntersectionObserver].filter(function (x) {
  return typeof x === 'function';
});

var Bindable = /*#__PURE__*/function () {
  function Bindable() {
    _classCallCheck(this, Bindable);
  }

  _createClass(Bindable, null, [{
    key: "isBindable",
    value: function isBindable(object) {
      if (!object || !object[IsBindable]) {
        return false;
      }

      return object[IsBindable] === Bindable;
    }
  }, {
    key: "onDeck",
    value: function onDeck(object, key) {
      return object[Deck][key] || false;
    }
  }, {
    key: "ref",
    value: function ref(object) {
      return object[Ref] || false;
    }
  }, {
    key: "makeBindable",
    value: function makeBindable(object) {
      return this.make(object);
    }
  }, {
    key: "shuck",
    value: function shuck(original, seen) {
      seen = seen || new Map();
      var clone = {};

      if (original instanceof TypedArray || original instanceof ArrayBuffer) {
        var _clone = original.slice(0);

        seen.set(original, _clone);
        return _clone;
      }

      var properties = Object.keys(original);

      for (var i in properties) {
        var ii = properties[i];

        if (ii.substring(0, 3) === '___') {
          continue;
        }

        var alreadyCloned = seen.get(original[ii]);

        if (alreadyCloned) {
          clone[ii] = alreadyCloned;
          continue;
        }

        if (original[ii] === original) {
          seen.set(original[ii], clone);
          clone[ii] = clone;
          continue;
        }

        if (original[ii] && _typeof(original[ii]) === 'object') {
          var originalProp = original[ii];

          if (Bindable.isBindable(original[ii])) {
            originalProp = original[ii][Original];
          }

          clone[ii] = this.shuck(originalProp, seen);
        } else {
          clone[ii] = original[ii];
        }

        seen.set(original[ii], clone[ii]);
      }

      if (Bindable.isBindable(original)) {
        delete clone.bindTo;
        delete clone.isBound;
      }

      return clone;
    }
  }, {
    key: "make",
    value: function make(object) {
      var _this = this;

      if (!object || !['function', 'object'].includes(_typeof(object))) {
        return object;
      }

      if (excludedClasses.filter(function (x) {
        return object instanceof x;
      }).length || Object.isSealed(object) || !Object.isExtensible(object)) {
        return object;
      }

      if (object[Ref]) {
        return object;
      }

      if (object[Binding]) {
        return object;
      }

      Object.defineProperty(object, Ref, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: object
      });
      Object.defineProperty(object, Original, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: object
      });
      Object.defineProperty(object, Deck, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      });
      Object.defineProperty(object, Binding, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      });
      Object.defineProperty(object, SubBinding, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: new Map()
      });
      Object.defineProperty(object, BindingAll, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, IsBindable, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: Bindable
      });
      Object.defineProperty(object, Executing, {
        enumerable: false,
        writable: true
      });
      Object.defineProperty(object, Wrapping, {
        enumerable: false,
        writable: true
      });
      Object.defineProperty(object, Stack, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, '___before___', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, '___after___', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, Wrapped, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      });
      Object.defineProperty(object, Unwrapped, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      });

      var bindTo = function bindTo(property) {
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var bindToAll = false;

        if (Array.isArray(property)) {
          var debinders = property.map(function (p) {
            return bindTo(p, callback, options);
          });
          return function () {
            return debinders.map(function (d) {
              return d();
            });
          };
        }

        if (property instanceof Function) {
          options = callback || {};
          callback = property;
          bindToAll = true;
        }

        if (options.delay >= 0) {
          callback = _this.wrapDelayCallback(callback, options.delay);
        }

        if (options.throttle >= 0) {
          callback = _this.wrapThrottleCallback(callback, options.throttle);
        }

        if (options.wait >= 0) {
          callback = _this.wrapWaitCallback(callback, options.wait);
        }

        if (options.frame) {
          callback = _this.wrapFrameCallback(callback, options.frame);
        }

        if (options.idle) {
          callback = _this.wrapIdleCallback(callback);
        }

        if (bindToAll) {
          var _bindIndex = object[BindingAll].length;
          object[BindingAll].push(callback);

          if (!('now' in options) || options.now) {
            for (var i in object) {
              callback(object[i], i, object, false);
            }
          }

          return function () {
            delete object[BindingAll][_bindIndex];
          };
        }

        if (!object[Binding][property]) {
          object[Binding][property] = [];
        }

        var bindIndex = object[Binding][property].length;

        if (options.children) {
          var original = callback;

          callback = function callback() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            var v = args[0];
            var subDebind = object[SubBinding].get(original);

            if (subDebind) {
              object[SubBinding]["delete"](original);
              subDebind();
            }

            if (_typeof(v) !== 'object') {
              original.apply(void 0, args);
              return;
            }

            var vv = Bindable.make(v);

            if (Bindable.isBindable(vv)) {
              object[SubBinding].set(original, vv.bindTo(function () {
                for (var _len2 = arguments.length, subArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  subArgs[_key2] = arguments[_key2];
                }

                return original.apply(void 0, args.concat(subArgs));
              }, Object.assign({}, options, {
                children: false
              })));
            }

            original.apply(void 0, args);
          };
        }

        object[Binding][property].push(callback);

        if (!('now' in options) || options.now) {
          callback(object[property], property, object, false);
        }

        var cleaned = false;

        var debinder = function debinder() {
          var subDebind = object[SubBinding].get(callback);

          if (subDebind) {
            object[SubBinding]["delete"](callback);
            subDebind();
          }

          if (cleaned) {
            return;
          }

          cleaned = true;

          if (!object[Binding][property]) {
            return;
          }

          delete object[Binding][property][bindIndex];
        };

        if (options.removeWith && options.removeWith instanceof View) {
          options.removeWith.onRemove(function () {
            return debinder;
          });
        }

        return debinder;
      };

      Object.defineProperty(object, 'bindTo', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: bindTo
      });

      var ___before = function ___before(callback) {
        var beforeIndex = object.___before___.length;

        object.___before___.push(callback);

        var cleaned = false;
        return function () {
          if (cleaned) {
            return;
          }

          cleaned = true;
          delete object.___before___[beforeIndex];
        };
      };

      var ___after = function ___after(callback) {
        var afterIndex = object.___after___.length;

        object.___after___.push(callback);

        var cleaned = false;
        return function () {
          if (cleaned) {
            return;
          }

          cleaned = true;
          delete object.___after___[afterIndex];
        };
      };

      Object.defineProperty(object, BindChain, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function value(path, callback) {
          var parts = path.split('.');
          var node = parts.shift();
          var subParts = parts.slice(0);
          var debind = [];
          debind.push(object.bindTo(node, function (v, k, t, d) {
            var rest = subParts.join('.');

            if (subParts.length === 0) {
              callback(v, k, t, d);
              return;
            }

            if (v === undefined) {
              v = t[k] = _this.makeBindable({});
            }

            debind = debind.concat(v[BindChain](rest, callback));
          })); // console.log(debind);

          return function () {
            return debind.map(function (x) {
              return x();
            });
          };
        }
      });
      Object.defineProperty(object, '___before', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: ___before
      });
      Object.defineProperty(object, '___after', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: ___after
      });

      var isBound = function isBound() {
        for (var i in object[BindingAll]) {
          if (object[BindingAll][i]) {
            return true;
          }
        }

        for (var _i in object[Binding]) {
          for (var j in object[Binding][_i]) {
            if (object[Binding][_i][j]) {
              return true;
            }
          }
        }

        return false;
      };

      Object.defineProperty(object, 'isBound', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: isBound
      });

      var _loop = function _loop(i) {
        if (object[i] && object[i] instanceof Object && !object[i] instanceof Promise) {
          if (!excludedClasses.filter(function (excludeClass) {
            return object[i] instanceof excludeClass;
          }).length && Object.isExtensible(object[i]) && !Object.isSealed(object[i])) {
            object[i] = Bindable.make(object[i]);
          }
        }
      };

      for (var i in object) {
        _loop(i);
      }

      var set = function set(target, key, value) {
        if (key === Original) {
          return true;
        }

        if (object[Deck][key] !== undefined && object[Deck][key] === value) {
          return true;
        }

        if (typeof key === 'string' && key.substring(0, 3) === '___' && key.slice(-3) === '___') {
          return true;
        }

        if (target[key] === value) {
          return true;
        }

        if (value && value instanceof Object) {
          if (!excludedClasses.filter(function (x) {
            return object instanceof x;
          }).length && Object.isExtensible(object) && !Object.isSealed(object)) {
            value = Bindable.makeBindable(value);
          }
        }

        object[Deck][key] = value;

        for (var _i2 in object[BindingAll]) {
          if (!object[BindingAll][_i2]) {
            continue;
          }

          object[BindingAll][_i2](value, key, target, false);
        }

        var stop = false;

        if (key in object[Binding]) {
          for (var _i3 in object[Binding][key]) {
            if (!object[Binding][key]) {
              continue;
            }

            if (!object[Binding][key][_i3]) {
              continue;
            }

            if (object[Binding][key][_i3](value, key, target, false, target[key]) === false) {
              stop = true;
            }
          }
        }

        delete object[Deck][key];

        if (!stop) {
          var descriptor = Object.getOwnPropertyDescriptor(target, key);
          var excluded = target instanceof File && key == 'lastModifiedDate';

          if (!excluded && (!descriptor || descriptor.writable) && target[key] === value) {
            target[key] = value;
          }
        }

        var result = Reflect.set(target, key, value);

        if (Array.isArray(target) && object[Binding]['length']) {
          for (var _i4 in object[Binding]['length']) {
            var callback = object[Binding]['length'][_i4];
            callback(target.length, 'length', target, false, target.length);
          }
        }

        return result;
      };

      var deleteProperty = function deleteProperty(target, key) {
        if (!(key in target)) {
          return true;
        }

        for (var _i5 in object[BindingAll]) {
          object[BindingAll][_i5](undefined, key, target, true, target[key]);
        }

        if (key in object[Binding]) {
          for (var _i6 in object[Binding][key]) {
            if (!object[Binding][key][_i6]) {
              continue;
            }

            object[Binding][key][_i6](undefined, key, target, true, target[key]);
          }
        }

        delete target[key];
        return true;
      };

      var construct = function construct(target, args) {
        var key = 'constructor';

        for (var _i7 in target.___before___) {
          target.___before___[_i7](target, key, target[Stack], undefined, args);
        }

        var instance = Bindable.make(_construct(target[Original], _toConsumableArray(args)));

        for (var _i8 in target.___after___) {
          target.___after___[_i8](target, key, target[Stack], instance, args);
        }

        return instance;
      };

      var get = function get(target, key) {
        if (key === Ref || key === Original || key === 'apply' || key === 'isBound' || key === 'bindTo' || key === '__proto__') {
          return target[key];
        }

        var descriptor = Object.getOwnPropertyDescriptor(object, key);

        if (descriptor && !descriptor.configurable && !descriptor.writable) {
          return target[key];
        }

        if (object[OnAllGet]) {
          return object[OnAllGet](key);
        }

        if (object[OnGet] && !(key in object)) {
          return object[OnGet](key);
        }

        if (target[Wrapped][key]) {
          return target[Wrapped][key];
        }

        if (descriptor && !descriptor.configurable && !descriptor.writable) {
          target[Wrapped][key] = target[key];
          return target[Wrapped][key];
        }

        if (typeof target[key] === 'function') {
          Object.defineProperty(target[Unwrapped], key, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: target[key]
          });
          target[Wrapped][key] = Bindable.make(function () {
            var objRef = object instanceof Promise || object instanceof Map || object instanceof Set || typeof Date === 'function' && object instanceof Date || typeof TypedArray === 'function' && object instanceof TypedArray || typeof ArrayBuffer === 'function' && object instanceof ArrayBuffer || typeof EventTarget === 'function' && object instanceof EventTarget || typeof ResizeObserver === 'function' && object instanceof ResizeObserver || typeof MutationObserver === 'function' && object instanceof MutationObserver || typeof PerformanceObserver === 'function' && object instanceof PerformanceObserver || typeof IntersectionObserver === 'function' && object instanceof IntersectionObserver ? object : object[Ref];
            target[Executing] = key;
            target[Stack].unshift(key);

            for (var _len3 = arguments.length, providedArgs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              providedArgs[_key3] = arguments[_key3];
            }

            for (var _i9 in target.___before___) {
              target.___before___[_i9](target, key, target[Stack], object, providedArgs);
            }

            var ret;

            if (new.target) {
              ret = _construct(target[Unwrapped][key], providedArgs);
            } else {
              var prototype = Object.getPrototypeOf(target);
              var isMethod = prototype[key] === target[key];

              if (isMethod) {
                ret = target[key].apply(objRef || object, providedArgs);
              } else {
                ret = target[key].apply(target, providedArgs);
              }
            }

            for (var _i10 in target.___after___) {
              target.___after___[_i10](target, key, target[Stack], object, providedArgs);
            }

            target[Executing] = null;
            target[Stack].shift();
            return ret;
          });
          return target[Wrapped][key];
        }

        return target[key];
      };

      var getPrototypeOf = function getPrototypeOf(target) {
        if (GetProto in object) {
          return object[GetProto];
        }

        return Reflect.getPrototypeOf(target);
      };

      Object.defineProperty(object, Ref, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: new Proxy(object, {
          get: get,
          set: set,
          construct: construct,
          getPrototypeOf: getPrototypeOf,
          deleteProperty: deleteProperty
        })
      });
      return object[Ref];
    }
  }, {
    key: "clearBindings",
    value: function clearBindings(object) {
      var clearObj = function clearObj(o) {
        return Object.keys(o).map(function (k) {
          return delete o[k];
        });
      };

      var maps = function maps(func) {
        return function () {
          for (var _len4 = arguments.length, os = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            os[_key4] = arguments[_key4];
          }

          return os.map(func);
        };
      };

      var clearObjs = maps(clearObj);
      clearObjs(object[Wrapped], object[Binding], object[BindingAll], object.___after___, object.___before___);
    }
  }, {
    key: "resolve",
    value: function resolve(object, path) {
      var owner = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var node;
      var pathParts = path.split('.');
      var top = pathParts[0];

      while (pathParts.length) {
        if (owner && pathParts.length === 1) {
          var obj = this.makeBindable(object);
          return [obj, pathParts.shift(), top];
        }

        node = pathParts.shift();

        if (!node in object || !object[node] || !(object[node] instanceof Object)) {
          object[node] = {};
        }

        object = this.makeBindable(object[node]);
      }

      return [this.makeBindable(object), node, top];
    }
  }, {
    key: "wrapDelayCallback",
    value: function wrapDelayCallback(callback, delay) {
      return function () {
        for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        return setTimeout(function () {
          return callback.apply(void 0, args);
        }, delay);
      };
    }
  }, {
    key: "wrapThrottleCallback",
    value: function wrapThrottleCallback(callback, throttle) {
      var _this2 = this;

      this.throttles.set(callback, false);
      return function () {
        if (_this2.throttles.get(callback, true)) {
          return;
        }

        callback.apply(void 0, arguments);

        _this2.throttles.set(callback, true);

        setTimeout(function () {
          _this2.throttles.set(callback, false);
        }, throttle);
      };
    }
  }, {
    key: "wrapWaitCallback",
    value: function wrapWaitCallback(callback, wait) {
      var _this3 = this;

      return function () {
        for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
          args[_key6] = arguments[_key6];
        }

        var waiter;

        if (waiter = _this3.waiters.get(callback)) {
          _this3.waiters["delete"](callback);

          clearTimeout(waiter);
        }

        waiter = setTimeout(function () {
          return callback.apply(void 0, args);
        }, wait);

        _this3.waiters.set(callback, waiter);
      };
    }
  }, {
    key: "wrapFrameCallback",
    value: function wrapFrameCallback(callback, frames) {
      return function () {
        for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
          args[_key7] = arguments[_key7];
        }

        requestAnimationFrame(function () {
          return callback.apply(void 0, args);
        });
      };
    }
  }, {
    key: "wrapIdleCallback",
    value: function wrapIdleCallback(callback) {
      return function () {
        for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
          args[_key8] = arguments[_key8];
        }

        // Compatibility for Safari 08/2020
        var req = window.requestIdleCallback || requestAnimationFrame;
        req(function () {
          return callback.apply(void 0, args);
        });
      };
    }
  }]);

  return Bindable;
}();

exports.Bindable = Bindable;

_defineProperty(Bindable, "waiters", new WeakMap());

_defineProperty(Bindable, "throttles", new WeakMap());

Object.defineProperty(Bindable, 'OnGet', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: OnGet
});
Object.defineProperty(Bindable, 'GetProto', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: GetProto
});
Object.defineProperty(Bindable, 'OnAllGet', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: OnAllGet
});
  })();
});

require.register("curvature/base/Cache.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cache = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Cache = /*#__PURE__*/function () {
  function Cache() {
    _classCallCheck(this, Cache);
  }

  _createClass(Cache, null, [{
    key: "store",
    value: function store(key, value, expiry) {
      var bucket = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'standard';
      var expiration = 0;

      if (expiry) {
        expiration = expiry * 1000 + new Date().getTime();
      } // console.log(
      // 	`Caching ${key} until ${expiration} in ${bucket}.`
      // 	, value
      // 	, this.bucket
      // );


      if (!this.bucket) {
        this.bucket = {};
      }

      if (!this.bucket[bucket]) {
        this.bucket[bucket] = {};
      }

      this.bucket[bucket][key] = {
        expiration: expiration,
        value: value
      };
    }
  }, {
    key: "load",
    value: function load(key) {
      var defaultvalue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var bucket = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'standard';

      // console.log(
      // 	`Checking cache for ${key} in ${bucket}.`
      // 	, this.bucket
      // );
      if (this.bucket && this.bucket[bucket] && this.bucket[bucket][key]) {
        // console.log(this.bucket[bucket][key].expiration, (new Date).getTime());
        if (this.bucket[bucket][key].expiration == 0 || this.bucket[bucket][key].expiration > new Date().getTime()) {
          return this.bucket[bucket][key].value;
        }
      }

      return defaultvalue;
    }
  }]);

  return Cache;
}();

exports.Cache = Cache;
  })();
});

require.register("curvature/base/Config.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Config = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var AppConfig = {};

try {
  AppConfig = require('/Config').Config || {};
} catch (error) {
  window.devMode === true && console.error(error);
}

var Config = /*#__PURE__*/function () {
  function Config() {
    _classCallCheck(this, Config);
  }

  _createClass(Config, null, [{
    key: "get",
    value: function get(name) {
      return this.configs[name];
    }
  }, {
    key: "set",
    value: function set(name, value) {
      this.configs[name] = value;
      return this;
    }
  }, {
    key: "dump",
    value: function dump() {
      return this.configs;
    }
  }, {
    key: "init",
    value: function init() {
      for (var _len = arguments.length, configs = new Array(_len), _key = 0; _key < _len; _key++) {
        configs[_key] = arguments[_key];
      }

      for (var i in configs) {
        var config = configs[i];

        if (typeof config === 'string') {
          config = JSON.parse(config);
        }

        for (var name in config) {
          var value = config[name];
          return this.configs[name] = value;
        }
      }

      return this;
    }
  }]);

  return Config;
}();

exports.Config = Config;
Object.defineProperty(Config, 'configs', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: AppConfig
});
  })();
});

require.register("curvature/base/Dom.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Dom = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var traversals = 0;

var Dom = /*#__PURE__*/function () {
  function Dom() {
    _classCallCheck(this, Dom);
  }

  _createClass(Dom, null, [{
    key: "mapTags",
    value: function mapTags(doc, selector, callback, startNode, endNode) {
      var result = [];
      var started = true;

      if (startNode) {
        started = false;
      }

      var ended = false;
      var treeWalker = document.createTreeWalker(doc, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode: function acceptNode(node, walker) {
          if (!started) {
            if (node === startNode) {
              started = true;
            } else {
              return NodeFilter.FILTER_SKIP;
            }
          }

          if (endNode && node === endNode) {
            ended = true;
          }

          if (ended) {
            return NodeFilter.FILTER_SKIP;
          }

          if (selector) {
            if (node instanceof Element) {
              if (node.matches(selector)) {
                return NodeFilter.FILTER_ACCEPT;
              }
            }

            return NodeFilter.FILTER_SKIP;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }, false);
      var traversal = traversals++;

      while (treeWalker.nextNode()) {
        result.push(callback(treeWalker.currentNode, treeWalker));
      }

      return result;
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(doc, event) {
      doc.dispatchEvent(event);
      Dom.mapTags(doc, false, function (node) {
        node.dispatchEvent(event);
      });
    }
  }]);

  return Dom;
}();

exports.Dom = Dom;
  })();
});

require.register("curvature/base/Mixin.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Mixin = void 0;

var _Bindable = require("./Bindable");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Constructor = Symbol('constructor');
var MixinList = Symbol('mixinList');

var Mixin = /*#__PURE__*/function () {
  function Mixin() {
    _classCallCheck(this, Mixin);
  }

  _createClass(Mixin, null, [{
    key: "from",
    value: function from(baseClass) {
      for (var _len = arguments.length, mixins = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        mixins[_key - 1] = arguments[_key];
      }

      var constructors = [];

      var newClass = /*#__PURE__*/function (_baseClass) {
        _inherits(newClass, _baseClass);

        var _super = _createSuper(newClass);

        function newClass() {
          var _this;

          _classCallCheck(this, newClass);

          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          var instance = _this = _super.call.apply(_super, [this].concat(args));

          var _iterator = _createForOfIteratorHelper(mixins),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var mixin = _step.value;

              if (mixin[Mixin.Constructor]) {
                mixin[Mixin.Constructor].apply(_assertThisInitialized(_this));
              }

              switch (_typeof(mixin)) {
                // case 'function':
                // 	this.mixClass(mixin, newClass);
                // 	break;
                case 'object':
                  Mixin.mixObject(mixin, _assertThisInitialized(_this));
                  break;
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          return _possibleConstructorReturn(_this, instance);
        }

        return newClass;
      }(baseClass);

      return newClass;
    }
  }, {
    key: "to",
    value: function to(base) {
      var descriptors = {};

      for (var _len3 = arguments.length, mixins = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        mixins[_key3 - 1] = arguments[_key3];
      }

      mixins.map(function (mixin) {
        switch (_typeof(mixin)) {
          case 'object':
            Object.assign(descriptors, Object.getOwnPropertyDescriptors(mixin));
            break;

          case 'function':
            Object.assign(descriptors, Object.getOwnPropertyDescriptors(mixin.prototype));
            break;
        }

        delete descriptors.constructor;
        Object.defineProperties(base.prototype, descriptors);
      });
    }
  }, {
    key: "with",
    value: function _with() {
      for (var _len4 = arguments.length, mixins = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        mixins[_key4] = arguments[_key4];
      }

      return this.from.apply(this, [Object].concat(mixins));
    }
  }, {
    key: "mixObject",
    value: function mixObject(mixin, instance) {
      var _iterator2 = _createForOfIteratorHelper(Object.getOwnPropertyNames(mixin)),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var func = _step2.value;

          if (typeof mixin[func] === 'function') {
            instance[func] = mixin[func].bind(instance);
            continue;
          }

          instance[func] = mixin[func];
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var _iterator3 = _createForOfIteratorHelper(Object.getOwnPropertySymbols(mixin)),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _func = _step3.value;

          if (typeof mixin[_func] === 'function') {
            instance[_func] = mixin[_func].bind(instance);
            continue;
          }

          instance[_func] = mixin[_func];
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "mixClass",
    value: function mixClass(cls, newClass) {
      var _iterator4 = _createForOfIteratorHelper(Object.getOwnPropertyNames(cls.prototype)),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var func = _step4.value;
          newClass.prototype[func] = cls.prototype[func].bind(newClass.prototype);
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      var _iterator5 = _createForOfIteratorHelper(Object.getOwnPropertySymbols(cls.prototype)),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _func2 = _step5.value;
          newClass.prototype[_func2] = cls.prototype[_func2].bind(newClass.prototype);
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      var _iterator6 = _createForOfIteratorHelper(Object.getOwnPropertyNames(cls)),
          _step6;

      try {
        var _loop = function _loop() {
          var func = _step6.value;

          if (typeof cls[func] !== 'function') {
            return "continue";
          }

          var prev = newClass[func] || false;
          var meth = cls[func].bind(newClass);

          newClass[func] = function () {
            prev && prev.apply(void 0, arguments);
            return meth.apply(void 0, arguments);
          };
        };

        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var _ret = _loop();

          if (_ret === "continue") continue;
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      var _iterator7 = _createForOfIteratorHelper(Object.getOwnPropertySymbols(cls)),
          _step7;

      try {
        var _loop2 = function _loop2() {
          var func = _step7.value;

          if (typeof cls[func] !== 'function') {
            return "continue";
          }

          var prev = newClass[func] || false;
          var meth = cls[func].bind(newClass);

          newClass[func] = function () {
            prev && prev.apply(void 0, arguments);
            return meth.apply(void 0, arguments);
          };
        };

        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var _ret2 = _loop2();

          if (_ret2 === "continue") continue;
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    }
  }, {
    key: "mix",
    value: function mix(mixinTo) {
      var constructors = [];
      var allStatic = {};
      var allInstance = {};

      var mixable = _Bindable.Bindable.makeBindable(mixinTo);

      var _loop3 = function _loop3(base) {
        var instanceNames = Object.getOwnPropertyNames(base.prototype);
        var staticNames = Object.getOwnPropertyNames(base);
        var prefix = /^(before|after)__(.+)/;

        var _iterator8 = _createForOfIteratorHelper(staticNames),
            _step8;

        try {
          var _loop5 = function _loop5() {
            var methodName = _step8.value;
            var match = methodName.match(prefix);

            if (match) {
              switch (match[1]) {
                case 'before':
                  mixable.___before(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;

                case 'after':
                  mixable.___after(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;
              }

              return "continue";
            }

            if (allStatic[methodName]) {
              return "continue";
            }

            if (typeof base[methodName] !== 'function') {
              return "continue";
            }

            allStatic[methodName] = base[methodName];
          };

          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var _ret3 = _loop5();

            if (_ret3 === "continue") continue;
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }

        var _iterator9 = _createForOfIteratorHelper(instanceNames),
            _step9;

        try {
          var _loop6 = function _loop6() {
            var methodName = _step9.value;
            var match = methodName.match(prefix);

            if (match) {
              switch (match[1]) {
                case 'before':
                  mixable.___before(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base.prototype[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;

                case 'after':
                  mixable.___after(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base.prototype[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;
              }

              return "continue";
            }

            if (allInstance[methodName]) {
              return "continue";
            }

            if (typeof base.prototype[methodName] !== 'function') {
              return "continue";
            }

            allInstance[methodName] = base.prototype[methodName];
          };

          for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
            var _ret4 = _loop6();

            if (_ret4 === "continue") continue;
          }
        } catch (err) {
          _iterator9.e(err);
        } finally {
          _iterator9.f();
        }
      };

      for (var base = this; base && base.prototype; base = Object.getPrototypeOf(base)) {
        _loop3(base);
      }

      for (var methodName in allStatic) {
        mixinTo[methodName] = allStatic[methodName].bind(mixinTo);
      }

      var _loop4 = function _loop4(_methodName) {
        mixinTo.prototype[_methodName] = function () {
          for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
          }

          return allInstance[_methodName].apply(this, args);
        };
      };

      for (var _methodName in allInstance) {
        _loop4(_methodName);
      }

      return mixable;
    }
  }]);

  return Mixin;
}();

exports.Mixin = Mixin;
Mixin.Constructor = Constructor;
  })();
});

require.register("curvature/base/Router.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Router = void 0;

var _View = require("./View");

var _Cache = require("./Cache");

var _Config = require("./Config");

var _Routes = require("./Routes");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var NotFoundError = Symbol('NotFound');
var InternalError = Symbol('Internal');

var Router = /*#__PURE__*/function () {
  function Router() {
    _classCallCheck(this, Router);
  }

  _createClass(Router, null, [{
    key: "wait",
    value: function wait(view) {
      var _this = this;

      var event = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'DOMContentLoaded';
      var node = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;
      node.addEventListener(event, function () {
        _this.listen(view);
      });
    }
  }, {
    key: "listen",
    value: function listen(listener) {
      var _this2 = this;

      var routes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.routes = routes;
      Object.assign(this.query, this.queryOver({}));

      var listen = function listen(event) {
        event.preventDefault();

        if (event.state && 'routedId' in event.state) {
          if (event.state.routedId <= _this2.routeCount) {
            _this2.history.splice(event.state.routedId);

            _this2.routeCount = event.state.routedId;
          } else if (event.state.routedId > _this2.routeCount) {
            _this2.history.push(event.state.prev);

            _this2.routeCount = event.state.routedId;
          }
        } else {
          if (_this2.prevPath !== null && _this2.prevPath !== location.pathname) {
            _this2.history.push(_this2.prevPath);
          }
        }

        if (location.origin !== 'null') {
          _this2.match(location.pathname, listener);
        } else {
          _this2.match(_this2.nextPath, listener);
        }

        for (var i in _this2.query) {
          delete _this2.query[i];
        }

        Object.assign(_this2.query, _this2.queryOver({}));
      };

      window.addEventListener('popstate', listen);
      window.addEventListener('cvUrlChanged', listen);
      var route = location.origin !== 'null' ? location.pathname + location.search : false;

      if (location.origin && location.hash) {
        route += location.hash;
      }

      this.go(route !== false ? route : '/');
    }
  }, {
    key: "go",
    value: function go(path, silent) {
      var configTitle = _Config.Config.get('title');

      if (configTitle) {
        document.title = configTitle;
      }

      if (location.origin === 'null') {
        this.nextPath = path;
      } else if (silent === 2 && location.pathname !== path) {
        history.replaceState({
          routedId: this.routeCount,
          prev: this.prevPath,
          url: location.pathname
        }, null, path);
      } else if (location.pathname !== path) {
        history.pushState({
          routedId: ++this.routeCount,
          prev: this.prevPath,
          url: location.pathname
        }, null, path);
      }

      if (!silent) {
        if (silent === false) {
          this.path = null;
        }

        if (path.substring(0, 1) === '#') {
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        } else {
          window.dispatchEvent(new CustomEvent('cvUrlChanged'));
        }
      }

      for (var i in this.query) {
        delete this.query[i];
      }

      Object.assign(this.query, this.queryOver({}));
      this.prevPath = path;
    }
  }, {
    key: "match",
    value: function match(path, listener) {
      var _this3 = this;

      var forceRefresh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (this.path === path && !forceRefresh) {
        return;
      }

      this.queryString = location.search;
      this.path = path;
      var prev = this.prevPath;
      var current = listener.args.content;

      var routes = this.routes || listener.routes || _Routes.Routes.dump();

      var query = new URLSearchParams(location.search);

      for (var i in this.query) {
        delete this.query[i];
      }

      Object.assign(this.query, this.queryOver({}));
      var args = {},
          selected = false,
          result = '';
      path = path.substr(1).split('/');

      for (var _i in this.query) {
        args[_i] = this.query[_i];
      }

      L1: for (var _i2 in routes) {
        var route = _i2.split('/');

        if (route.length < path.length && route[route.length - 1] !== '*') {
          continue;
        }

        L2: for (var j in route) {
          if (route[j].substr(0, 1) == '%') {
            var argName = null;
            var groups = /^%(\w+)\??/.exec(route[j]);

            if (groups && groups[1]) {
              argName = groups[1];
            }

            if (!argName) {
              throw new Error("".concat(route[j], " is not a valid argument segment in route \"").concat(_i2, "\""));
            }

            if (!path[j]) {
              if (route[j].substr(route[j].length - 1, 1) == '?') {
                args[argName] = '';
              } else {
                continue L1;
              }
            } else {
              args[argName] = path[j];
            }
          } else if (route[j] !== '*' && path[j] !== route[j]) {
            continue L1;
          }
        }

        selected = _i2;
        result = routes[_i2];

        if (route[route.length - 1] === '*') {
          args.pathparts = path.slice(route.length - 1);
        }

        break;
      }

      var eventStart = new CustomEvent('cvRouteStart', {
        cancelable: true,
        detail: {
          path: path,
          prev: prev,
          root: listener,
          selected: selected,
          routes: routes
        }
      });

      if (!document.dispatchEvent(eventStart)) {
        return;
      }

      if (!forceRefresh && listener && current && result instanceof Object && current instanceof result && !(result instanceof Promise) && current.update(args)) {
        listener.args.content = current;
        return true;
      }

      try {
        if (!(selected in routes)) {
          routes[selected] = routes[NotFoundError];
        }

        var processRoute = function processRoute(selected) {
          var result = false;

          if (typeof routes[selected] === 'function') {
            if (routes[selected].prototype instanceof _View.View) {
              result = new routes[selected](args);
            } else {
              result = routes[selected](args);
            }
          } else {
            result = routes[selected];
          }

          return result;
        };

        result = processRoute(selected);

        if (result === false) {
          result = processRoute(NotFoundError);
        }

        if (result instanceof Promise) {
          return result.then(function (realResult) {
            _this3.update(listener, path, realResult, routes, selected, args, forceRefresh);
          })["catch"](function (error) {
            document.dispatchEvent(new CustomEvent('cvRouteError', {
              detail: {
                error: error,
                path: path,
                prev: prev,
                view: listener,
                routes: routes,
                selected: selected
              }
            }));

            _this3.update(listener, path, window['devMode'] ? String(error) : 'Error: 500', routes, selected, args, forceRefresh);

            throw error;
          });
        } else {
          return this.update(listener, path, result, routes, selected, args, forceRefresh);
        }
      } catch (error) {
        document.dispatchEvent(new CustomEvent('cvRouteError', {
          detail: {
            error: error,
            path: path,
            prev: prev,
            view: listener,
            routes: routes,
            selected: selected
          }
        }));
        this.update(listener, path, window['devMode'] ? String(error) : 'Error: 500', routes, selected, args, forceRefresh);
        throw error;
      }
    }
  }, {
    key: "update",
    value: function update(listener, path, result, routes, selected, args, forceRefresh) {
      if (!listener) {
        return;
      }

      var prev = this.prevPath;
      var event = new CustomEvent('cvRoute', {
        cancelable: true,
        detail: {
          result: result,
          path: path,
          prev: prev,
          view: listener,
          routes: routes,
          selected: selected
        }
      });

      if (result !== false) {
        if (listener.args.content instanceof _View.View) {
          listener.args.content.pause(true);
          listener.args.content.remove();
        }

        if (document.dispatchEvent(event)) {
          listener.args.content = result;
        }

        if (result instanceof _View.View) {
          result.pause(false);
          result.update(args, forceRefresh);
        }
      }

      var eventEnd = new CustomEvent('cvRouteEnd', {
        cancelable: true,
        detail: {
          result: result,
          path: path,
          prev: prev,
          view: listener,
          routes: routes,
          selected: selected
        }
      });
      document.dispatchEvent(eventEnd);
    }
  }, {
    key: "queryOver",
    value: function queryOver() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var params = new URLSearchParams(location.search);
      var finalArgs = {};
      var query = {};

      var _iterator = _createForOfIteratorHelper(params),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var pair = _step.value;
          query[pair[0]] = pair[1];
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      finalArgs = Object.assign(finalArgs, query, args);
      delete finalArgs['api'];
      return finalArgs; // for(let i in query)
      // {
      // 	finalArgs[i] = query[i];
      // }
      // for(let i in args)
      // {
      // 	finalArgs[i] = args[i];
      // }
    }
  }, {
    key: "queryToString",
    value: function queryToString() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var fresh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var parts = [],
          finalArgs = args;

      if (!fresh) {
        finalArgs = this.queryOver(args);
      }

      for (var i in finalArgs) {
        if (finalArgs[i] === '') {
          continue;
        }

        parts.push(i + '=' + encodeURIComponent(finalArgs[i]));
      }

      return parts.join('&');
    }
  }, {
    key: "setQuery",
    value: function setQuery(name, value, silent) {
      var args = this.queryOver();
      args[name] = value;

      if (value === undefined) {
        delete args[name];
      }

      var queryString = this.queryToString(args, true);
      this.go(location.pathname + (queryString ? '?' + queryString : ''), silent);
    }
  }]);

  return Router;
}();

exports.Router = Router;
Object.defineProperty(Router, 'query', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: {}
});
Object.defineProperty(Router, 'history', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: []
});
Object.defineProperty(Router, 'routeCount', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: 0
});
Object.defineProperty(Router, 'prevPath', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: null
});
Object.defineProperty(Router, 'queryString', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: null
});
Object.defineProperty(Router, 'InternalError', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: InternalError
});
Object.defineProperty(Router, 'NotFoundError', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: NotFoundError
});
  })();
});

require.register("curvature/base/Routes.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Routes = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var AppRoutes = {};

try {
  Object.assign(AppRoutes, require('Routes').Routes || {});
} catch (error) {
  window.devMode === true && console.warn(error);
}

var Routes = /*#__PURE__*/function () {
  function Routes() {
    _classCallCheck(this, Routes);
  }

  _createClass(Routes, null, [{
    key: "get",
    value: function get(name) {
      return this.routes[name];
    }
  }, {
    key: "dump",
    value: function dump() {
      return this.routes;
    }
  }]);

  return Routes;
}();

exports.Routes = Routes;
Object.defineProperty(Routes, 'routes', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: AppRoutes
});
  })();
});

require.register("curvature/base/RuleSet.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RuleSet = void 0;

var _Dom = require("./Dom");

var _Tag = require("./Tag");

var _View = require("./View");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RuleSet = /*#__PURE__*/function () {
  function RuleSet() {
    _classCallCheck(this, RuleSet);
  }

  _createClass(RuleSet, [{
    key: "add",
    value: function add(selector, callback) {
      this.rules = this.rules || {};
      this.rules[selector] = this.rules[selector] || [];
      this.rules[selector].push(callback);
      return this;
    }
  }, {
    key: "apply",
    value: function apply() {
      var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
      var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      RuleSet.apply(doc, view);

      for (var selector in this.rules) {
        for (var i in this.rules[selector]) {
          var callback = this.rules[selector][i];
          var wrapped = RuleSet.wrap(doc, callback, view);
          var nodes = doc.querySelectorAll(selector);

          var _iterator = _createForOfIteratorHelper(nodes),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var node = _step.value;
              wrapped(node);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }
      }
    }
  }], [{
    key: "add",
    value: function add(selector, callback) {
      this.globalRules = this.globalRules || {};
      this.globalRules[selector] = this.globalRules[selector] || [];
      this.globalRules[selector].push(callback);
      return this;
    }
  }, {
    key: "apply",
    value: function apply() {
      var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
      var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      for (var selector in this.globalRules) {
        for (var i in this.globalRules[selector]) {
          var callback = this.globalRules[selector][i];
          var wrapped = this.wrap(doc, callback, view);
          var nodes = doc.querySelectorAll(selector);

          var _iterator2 = _createForOfIteratorHelper(nodes),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var node = _step2.value;
              wrapped(node);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      }
    }
  }, {
    key: "wait",
    value: function wait() {
      var _this = this;

      var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'DOMContentLoaded';
      var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

      var listener = function (event, node) {
        return function () {
          node.removeEventListener(event, listener);
          return _this.apply();
        };
      }(event, node);

      node.addEventListener(event, listener);
    }
  }, {
    key: "wrap",
    value: function wrap(doc, callback) {
      var view = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (callback instanceof _View.View || callback && callback.prototype && callback.prototype instanceof _View.View) {
        callback = function (callback) {
          return function () {
            return callback;
          };
        }(callback);
      }

      return function (element) {
        if (typeof element.___cvApplied___ === 'undefined') {
          Object.defineProperty(element, '___cvApplied___', {
            enumerable: false,
            writable: false,
            value: []
          });
        }

        for (var i in element.___cvApplied___) {
          if (callback == element.___cvApplied___[i]) {
            return;
          }
        }

        var direct, parentView;

        if (view) {
          direct = parentView = view;

          if (view.viewList) {
            parentView = view.viewList.parent;
          }
        }

        if (parentView) {
          parentView.onRemove(function () {
            return element.___cvApplied___.splice(0);
          });
        }

        var tag = new _Tag.Tag(element, parentView, null, undefined, direct);
        var parent = tag.element.parentNode;
        var sibling = tag.element.nextSibling;
        var result = callback(tag);

        if (result !== false) {
          element.___cvApplied___.push(callback);
        }

        if (result instanceof HTMLElement) {
          result = new _Tag.Tag(result);
        }

        if (result instanceof _Tag.Tag) {
          if (!result.element.contains(tag.element)) {
            while (tag.element.firstChild) {
              result.element.appendChild(tag.element.firstChild);
            }

            tag.remove();
          }

          if (sibling) {
            parent.insertBefore(result.element, sibling);
          } else {
            parent.appendChild(result.element);
          }
        }

        if (result && result.prototype && result.prototype instanceof _View.View) {
          result = new result({}, view);
        }

        if (result instanceof _View.View) {
          if (view) {
            view.cleanup.push(function (r) {
              return function () {
                r.remove();
              };
            }(result));
            view.cleanup.push(view.args.bindTo(function (v, k, t) {
              t[k] = v;
              result.args[k] = v;
            }));
            view.cleanup.push(result.args.bindTo(function (v, k, t, d) {
              t[k] = v;
              view.args[k] = v;
            }));
          }

          tag.clear();
          result.render(tag.element);
        }
      };
    }
  }]);

  return RuleSet;
}();

exports.RuleSet = RuleSet;
  })();
});

require.register("curvature/base/Tag.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tag = void 0;

var _Bindable = require("./Bindable");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Tag = /*#__PURE__*/function () {
  function Tag(element, parent, ref, index, direct) {
    var _this2 = this;

    _classCallCheck(this, Tag);

    if (typeof element === 'string') {
      var subdoc = document.createRange().createContextualFragment(element);
      element = subdoc.firstChild;
    }

    this.element = _Bindable.Bindable.makeBindable(element);
    this.node = this.element;
    this.parent = parent;
    this.direct = direct;
    this.ref = ref;
    this.index = index;
    this.cleanup = [];

    this[_Bindable.Bindable.OnAllGet] = function (name) {
      if (typeof _this2[name] === 'function') {
        return _this2[name];
      }

      if (_this2.node && typeof _this2.node[name] === 'function') {
        return function () {
          var _this2$node;

          return (_this2$node = _this2.node)[name].apply(_this2$node, arguments);
        };
      }

      if (_this2.node && name in _this2.node) {
        return _this2.node[name];
      }

      return _this2[name];
    };

    this.style = function (_this) {
      return _Bindable.Bindable.make(function (styles) {
        if (!_this.node) {
          return;
        }

        var styleEvent = new CustomEvent('cvStyle', {
          detail: {
            styles: styles
          }
        });

        if (!_this.node.dispatchEvent(styleEvent)) {
          return;
        }

        for (var property in styles) {
          if (property[0] === '-') {
            _this.node.style.setProperty(property, styles[property]);
          }

          _this.node.style[property] = styles[property];
        }
      });
    }(this);

    this.proxy = _Bindable.Bindable.make(this);
    this.proxy.style.bindTo(function (v, k) {
      _this2.element.style[k] = v;
    });
    this.proxy.bindTo(function (v, k) {
      if (k in element) {
        element[k] = v;
      }

      return false;
    });
    return this.proxy;
  }

  _createClass(Tag, [{
    key: "attr",
    value: function attr(attributes) {
      for (var attribute in attributes) {
        if (attributes[attribute] === undefined) {
          this.node.removeAttribute(attribute);
        } else if (attributes[attribute] === null) {
          this.node.setAttribute(attribute, '');
        } else {
          this.node.setAttribute(attribute, attributes[attribute]);
        }
      }
    }
  }, {
    key: "remove",
    value: function remove() {
      if (this.node) {
        this.node.remove();
      }

      _Bindable.Bindable.clearBindings(this);

      var cleanup;

      while (cleanup = this.cleanup.shift()) {
        cleanup();
      }

      this.clear();

      if (!this.node) {
        return;
      }

      var detachEvent = new Event('cvDomDetached');
      this.node.dispatchEvent(detachEvent);
      this.node = this.element = this.ref = this.parent = undefined;
    }
  }, {
    key: "clear",
    value: function clear() {
      if (!this.node) {
        return;
      }

      var detachEvent = new Event('cvDomDetached');

      while (this.node.firstChild) {
        this.node.firstChild.dispatchEvent(detachEvent);
        this.node.removeChild(this.node.firstChild);
      }
    }
  }, {
    key: "pause",
    value: function pause() {
      var paused = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    }
  }, {
    key: "listen",
    value: function listen(eventName, callback, options) {
      var node = this.node;
      node.addEventListener(eventName, callback, options);

      var remove = function remove() {
        node.removeEventListener(eventName, callback, options);
      };

      var remover = function remover() {
        remove();

        remove = function remove() {
          return console.warn('Already removed!');
        };
      };

      this.parent.onRemove(function () {
        return remover();
      });
      return remover;
    }
  }]);

  return Tag;
}();

exports.Tag = Tag;
  })();
});

require.register("curvature/base/View.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.View = void 0;

var _Bindable = require("./Bindable");

var _ViewList = require("./ViewList");

var _Router = require("./Router");

var _Dom = require("./Dom");

var _Tag = require("./Tag");

var _Bag = require("./Bag");

var _RuleSet = require("./RuleSet");

var _Mixin = require("./Mixin");

var _PromiseMixin = require("../mixin/PromiseMixin");

var _EventTargetMixin = require("../mixin/EventTargetMixin");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var dontParse = Symbol('dontParse');
var expandBind = Symbol('expandBind');
var uuid = Symbol('uuid');
var moveIndex = 0;

var View = /*#__PURE__*/function (_Mixin$with) {
  _inherits(View, _Mixin$with);

  var _super = _createSuper(View);

  _createClass(View, [{
    key: "_id",
    get: function get() {
      return this[uuid];
    }
  }], [{
    key: "from",
    value: function from(template) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var view = new this(args, parent);
      view.template = template;
      return view;
    }
  }]);

  function View() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var mainView = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, View);

    _this = _super.call(this, args, mainView);
    Object.defineProperty(_assertThisInitialized(_this), 'args', {
      value: _Bindable.Bindable.make(args)
    });
    Object.defineProperty(_assertThisInitialized(_this), uuid, {
      value: _this.uuid()
    });
    Object.defineProperty(_assertThisInitialized(_this), 'attach', {
      value: new _Bag.Bag(function (i, s, a) {})
    });
    Object.defineProperty(_assertThisInitialized(_this), 'detach', {
      value: new _Bag.Bag(function (i, s, a) {})
    });
    Object.defineProperty(_assertThisInitialized(_this), '_onRemove', {
      value: new _Bag.Bag(function (i, s, a) {})
    });
    Object.defineProperty(_assertThisInitialized(_this), 'cleanup', {
      value: []
    });
    Object.defineProperty(_assertThisInitialized(_this), 'parent', {
      value: mainView
    });
    Object.defineProperty(_assertThisInitialized(_this), 'views', {
      value: new Map()
    });
    Object.defineProperty(_assertThisInitialized(_this), 'viewLists', {
      value: new Map()
    });
    Object.defineProperty(_assertThisInitialized(_this), 'withViews', {
      value: new Map()
    });
    Object.defineProperty(_assertThisInitialized(_this), 'tags', {
      value: _Bindable.Bindable.make({})
    });
    Object.defineProperty(_assertThisInitialized(_this), 'nodes', {
      value: _Bindable.Bindable.make([])
    });
    Object.defineProperty(_assertThisInitialized(_this), 'intervals', {
      value: []
    });
    Object.defineProperty(_assertThisInitialized(_this), 'timeouts', {
      value: []
    });
    Object.defineProperty(_assertThisInitialized(_this), 'frames', {
      value: []
    });
    Object.defineProperty(_assertThisInitialized(_this), 'ruleSet', {
      value: new _RuleSet.RuleSet()
    });
    Object.defineProperty(_assertThisInitialized(_this), 'preRuleSet', {
      value: new _RuleSet.RuleSet()
    });
    Object.defineProperty(_assertThisInitialized(_this), 'subBindings', {
      value: {}
    });
    Object.defineProperty(_assertThisInitialized(_this), 'templates', {
      value: {}
    });
    Object.defineProperty(_assertThisInitialized(_this), 'eventCleanup', {
      value: []
    });
    Object.defineProperty(_assertThisInitialized(_this), 'interpolateRegex', {
      value: /(\[\[((?:\$+)?[\w\.\|-]+)\]\])/g
    });
    Object.defineProperty(_assertThisInitialized(_this), 'rendered', {
      value: new Promise(function (accept, reject) {
        return Object.defineProperty(_assertThisInitialized(_this), 'renderComplete', {
          value: accept
        });
      })
    });
    _this.template = "";
    _this.firstNode = null;
    _this.lastNode = null;
    _this.viewList = null;
    _this.mainView = null;
    _this.preserve = false;
    _this.removed = false;
    return _possibleConstructorReturn(_this, _Bindable.Bindable.make(_assertThisInitialized(_this)));
  }

  _createClass(View, [{
    key: "onFrame",
    value: function onFrame(callback) {
      var _this2 = this;

      var stopped = false;

      var cancel = function cancel() {
        stopped = true;
      };

      var c = function c(timestamp) {
        if (_this2.removed || stopped) {
          return;
        }

        if (!_this2.paused) {
          callback(Date.now());
        }

        requestAnimationFrame(c);
      };

      requestAnimationFrame(function () {
        return c(Date.now());
      });
      this.frames.push(cancel);
      return cancel;
    }
  }, {
    key: "onNextFrame",
    value: function onNextFrame(callback) {
      return requestAnimationFrame(function () {
        return callback(Date.now());
      });
    }
  }, {
    key: "onIdle",
    value: function onIdle(callback) {
      return requestIdleCallback(function () {
        return callback(Date.now());
      });
    }
  }, {
    key: "onTimeout",
    value: function onTimeout(time, callback) {
      var _this3 = this;

      var wrappedCallback = function wrappedCallback() {
        _this3.timeouts[index].fired = true;
        _this3.timeouts[index].callback = null;
        callback();
      };

      var timeout = setTimeout(wrappedCallback, time);
      var index = this.timeouts.length;
      this.timeouts.push({
        timeout: timeout,
        callback: wrappedCallback,
        time: time,
        fired: false,
        created: new Date().getTime(),
        paused: false
      });
      return timeout;
    }
  }, {
    key: "clearTimeout",
    value: function (_clearTimeout) {
      function clearTimeout(_x) {
        return _clearTimeout.apply(this, arguments);
      }

      clearTimeout.toString = function () {
        return _clearTimeout.toString();
      };

      return clearTimeout;
    }(function (timeout) {
      for (var i in this.timeouts) {
        if (timeout === this.timeouts[i].timeout) {
          clearTimeout(this.timeouts[i].timeout);
          delete this.timeouts[i];
        }
      }
    })
  }, {
    key: "onInterval",
    value: function onInterval(time, callback) {
      var timeout = setInterval(callback, time);
      this.intervals.push({
        timeout: timeout,
        callback: callback,
        time: time,
        paused: false
      });
      return timeout;
    }
  }, {
    key: "clearInterval",
    value: function (_clearInterval) {
      function clearInterval(_x2) {
        return _clearInterval.apply(this, arguments);
      }

      clearInterval.toString = function () {
        return _clearInterval.toString();
      };

      return clearInterval;
    }(function (timeout) {
      for (var i in this.intervals) {
        if (timeout === this.intervals[i].timeout) {
          clearInterval(this.intervals[i].timeout);
          delete this.intervals[i];
        }
      }
    })
  }, {
    key: "pause",
    value: function pause() {
      var paused = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      if (paused === undefined) {
        this.paused = !this.paused;
      }

      this.paused = paused;

      if (this.paused) {
        for (var i in this.timeouts) {
          if (this.timeouts[i].fired) {
            delete this.timeouts[i];
            continue;
          }

          clearTimeout(this.timeouts[i].timeout);
        }

        for (var _i in this.intervals) {
          clearInterval(this.intervals[_i].timeout);
        }
      } else {
        for (var _i2 in this.timeouts) {
          if (!this.timeouts[_i2].timeout.paused) {
            continue;
          }

          if (this.timeouts[_i2].fired) {
            delete this.timeouts[_i2];
            continue;
          }

          this.timeouts[_i2].timeout = setTimeout(this.timeouts[_i2].callback, this.timeouts[_i2].time);
        }

        for (var _i3 in this.intervals) {
          if (!this.intervals[_i3].timeout.paused) {
            continue;
          }

          this.intervals[_i3].timeout.paused = false;
          this.intervals[_i3].timeout = setInterval(this.intervals[_i3].callback, this.intervals[_i3].time);
        }
      }

      var _iterator = _createForOfIteratorHelper(this.viewLists),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
              tag = _step$value[0],
              viewList = _step$value[1];

          viewList.pause(!!paused);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      for (var _i4 in this.tags) {
        if (Array.isArray(this.tags[_i4])) {
          for (var j in this.tags[_i4]) {
            this.tags[_i4][j].pause(!!paused);
          }

          continue;
        }

        this.tags[_i4].pause(!!paused);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$nodes,
          _this4 = this;

      var parentNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var insertPoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (parentNode instanceof View) {
        parentNode = parentNode.firstNode.parentNode;
      }

      if (insertPoint instanceof View) {
        insertPoint = insertPoint.firstNode;
      }

      if (this.firstNode) {
        return this.reRender(parentNode, insertPoint);
      }

      this.dispatchEvent(new CustomEvent('render'));
      var templateParsed = this.template instanceof DocumentFragment ? this.template.cloneNode(true) : View.templates.has(this.template);
      var subDoc = templateParsed ? this.template instanceof DocumentFragment ? templateParsed : View.templates.get(this.template).cloneNode(true) : document.createRange().createContextualFragment(this.template);

      if (!templateParsed && !(this.template instanceof DocumentFragment)) {
        View.templates.set(this.template, subDoc.cloneNode(true));
      }

      this.mainView || this.preRuleSet.apply(subDoc, this);
      this.mapTags(subDoc);
      this.mainView || this.ruleSet.apply(subDoc, this);

      if (window.devMode === true) {
        this.firstNode = document.createComment("Template ".concat(this._id, " Start"));
        this.lastNode = document.createComment("Template ".concat(this._id, " End"));
      } else {
        this.firstNode = document.createTextNode('');
        this.lastNode = document.createTextNode('');
      }

      (_this$nodes = this.nodes).push.apply(_this$nodes, [this.firstNode].concat(_toConsumableArray(Array.from(subDoc.childNodes)), [this.lastNode]));

      this.postRender(parentNode);
      this.dispatchEvent(new CustomEvent('rendered'));

      if (!this.dispatchAttach()) {
        return;
      }

      if (parentNode) {
        var rootNode = parentNode.getRootNode();
        var moveType = 'internal';
        var toRoot = false;

        if (rootNode.isConnected) {
          toRoot = true;
          moveType = 'external';
        }

        if (insertPoint) {
          parentNode.insertBefore(this.firstNode, insertPoint);
          parentNode.insertBefore(this.lastNode, insertPoint);
        } else {
          parentNode.appendChild(this.firstNode);
          parentNode.appendChild(this.lastNode);
        }

        parentNode.insertBefore(subDoc, this.lastNode);
        moveIndex++;

        if (toRoot) {
          this.attached(rootNode, parentNode);
          this.dispatchAttached(rootNode, parentNode);
        } else {
          parentNode.addEventListener('cvDomAttached', function () {
            _this4.attached(rootNode, parentNode);

            _this4.dispatchAttached(rootNode, parentNode);
          }, {
            once: true
          });
        }
      }

      this.renderComplete(this.nodes);
      return this.nodes;
    }
  }, {
    key: "dispatchAttach",
    value: function dispatchAttach() {
      return this.dispatchEvent(new CustomEvent('attach', {
        cancelable: true,
        target: this
      }));
    }
  }, {
    key: "dispatchAttached",
    value: function dispatchAttached(rootNode, parentNode) {
      this.dispatchEvent(new CustomEvent('attached', {
        target: this
      }));
      var attach = this.attach.items();

      for (var i in attach) {
        attach[i](rootNode, parentNode);
      }

      this.nodes.filter(function (n) {
        return n.nodeType !== Node.COMMENT_NODE;
      }).map(function (child) {
        if (!child.matches) {
          return;
        }

        _Dom.Dom.mapTags(child, false, function (tag, walker) {
          if (!tag.matches) {
            return;
          }

          tag.dispatchEvent(new Event('cvDomAttached', {
            target: tag
          }));
        });

        child.dispatchEvent(new Event('cvDomAttached', {
          target: child
        }));
      });
    }
  }, {
    key: "reRender",
    value: function reRender(parentNode, insertPoint) {
      var willReRender = this.dispatchEvent(new CustomEvent('reRender'), {
        cancelable: true,
        target: this
      });

      if (!willReRender) {
        return;
      }

      var subDoc = new DocumentFragment();

      if (this.firstNode.isConnected) {
        var detach = this.detach.items();

        for (var i in detach) {
          detach[i]();
        }
      }

      subDoc.append.apply(subDoc, _toConsumableArray(this.nodes));

      if (parentNode) {
        if (insertPoint) {
          parentNode.insertBefore(this.firstNode, insertPoint);
          parentNode.insertBefore(this.lastNode, insertPoint);
        } else {
          parentNode.appendChild(this.firstNode);
          parentNode.appendChild(this.lastNode);
        }

        parentNode.insertBefore(subDoc, this.lastNode);
        this.dispatchEvent(new CustomEvent('reRendered'), {
          cancelable: true,
          target: this
        });
        var rootNode = parentNode.getRootNode();

        if (rootNode.isConnected) {
          this.attached(rootNode, parentNode);
          this.dispatchAttached(rootNode, parentNode);
        }
      }

      return this.nodes;
    }
  }, {
    key: "mapTags",
    value: function mapTags(subDoc) {
      var _this5 = this;

      _Dom.Dom.mapTags(subDoc, false, function (tag, walker) {
        if (tag[dontParse]) {
          return;
        }

        if (tag.matches) {
          tag = _this5.mapInterpolatableTag(tag);
          tag = tag.matches('[cv-template]') && _this5.mapTemplateTag(tag) || tag;
          tag = tag.matches('[cv-slot]') && _this5.mapSlotTag(tag) || tag;
          tag = tag.matches('[cv-prerender]') && _this5.mapPrendererTag(tag) || tag;
          tag = tag.matches('[cv-link]') && _this5.mapLinkTag(tag) || tag;
          tag = tag.matches('[cv-attr]') && _this5.mapAttrTag(tag) || tag;
          tag = tag.matches('[cv-expand]') && _this5.mapExpandableTag(tag) || tag;
          tag = tag.matches('[cv-ref]') && _this5.mapRefTag(tag) || tag;
          tag = tag.matches('[cv-on]') && _this5.mapOnTag(tag) || tag;
          tag = tag.matches('[cv-each]') && _this5.mapEachTag(tag) || tag;
          tag = tag.matches('[cv-bind]') && _this5.mapBindTag(tag) || tag;
          tag = tag.matches('[cv-with]') && _this5.mapWithTag(tag) || tag;
          tag = tag.matches('[cv-if]') && _this5.mapIfTag(tag) || tag;
          tag = tag.matches('[cv-view]') && _this5.mapViewTag(tag) || tag;
        } else {
          tag = _this5.mapInterpolatableTag(tag);
        }

        if (tag !== walker.currentNode) {
          walker.currentNode = tag;
        }
      });
    }
  }, {
    key: "mapExpandableTag",
    value: function mapExpandableTag(tag) {
      /*/
      const tagCompiler = this.compileExpandableTag(tag);
      	const newTag = tagCompiler(this);
      	tag.replaceWith(newTag);
      	return newTag;
      /*/
      var existing = tag[expandBind];

      if (existing) {
        existing();
        tag[expandBind] = false;
      }

      var _Bindable$resolve = _Bindable.Bindable.resolve(this.args, tag.getAttribute('cv-expand'), true),
          _Bindable$resolve2 = _slicedToArray(_Bindable$resolve, 2),
          proxy = _Bindable$resolve2[0],
          expandProperty = _Bindable$resolve2[1];

      tag.removeAttribute('cv-expand');

      if (!proxy[expandProperty]) {
        proxy[expandProperty] = {};
      }

      this.onRemove(tag[expandBind] = proxy[expandProperty].bindTo(function (v, k, t, d, p) {
        if (d || v === undefined) {
          tag.removeAttribute(k, v);
          return;
        }

        if (v === null) {
          tag.setAttribute(k, '');
          return;
        }

        tag.setAttribute(k, v);
      })); // let expandProperty = tag.getAttribute('cv-expand');
      // let expandArg = Bindable.makeBindable(
      // 	this.args[expandProperty] || {}
      // );
      // tag.removeAttribute('cv-expand');
      // for(let i in expandArg)
      // {
      // 	if(i === 'name' || i === 'type')
      // 	{
      // 		continue;
      // 	}
      // 	let debind = expandArg.bindTo(i, ((tag,i)=>(v)=>{
      // 		tag.setAttribute(i, v);
      // 	})(tag,i));
      // 	this.onRemove(()=>{
      // 		debind();
      // 		if(expandArg.isBound())
      // 		{
      // 			Bindable.clearBindings(expandArg);
      // 		}
      // 	});
      // }

      return tag; //*/
    }
  }, {
    key: "compileExpandableTag",
    value: function compileExpandableTag(sourceTag) {
      return function (bindingView) {
        var tag = sourceTag.cloneNode(true);
        var expandProperty = tag.getAttribute('cv-expand');

        var expandArg = _Bindable.Bindable.make(bindingView.args[expandProperty] || {});

        tag.removeAttribute('cv-expand');

        var _loop = function _loop(i) {
          if (i === 'name' || i === 'type') {
            return "continue";
          }

          var debind = expandArg.bindTo(i, function (tag, i) {
            return function (v) {
              tag.setAttribute(i, v);
            };
          }(tag, i));
          bindingView.onRemove(function () {
            debind();

            if (expandArg.isBound()) {
              _Bindable.Bindable.clearBindings(expandArg);
            }
          });
        };

        for (var i in expandArg) {
          var _ret = _loop(i);

          if (_ret === "continue") continue;
        }

        return tag;
      };
    }
  }, {
    key: "mapAttrTag",
    value: function mapAttrTag(tag) {
      //*/
      var tagCompiler = this.compileAttrTag(tag);
      var newTag = tagCompiler(this);
      tag.replaceWith(newTag);
      return newTag;
      /*/
      	let attrProperty = tag.getAttribute('cv-attr');
      	tag.removeAttribute('cv-attr');
      	let pairs = attrProperty.split(',');
      let attrs = pairs.map((p) => p.split(':'));
      	for (let i in attrs)
      {
      	let proxy        = this.args;
      	let bindProperty = attrs[i][1];
      	let property     = bindProperty;
      		if(bindProperty.match(/\./))
      	{
      		[proxy, property] = Bindable.resolve(
      			this.args
      			, bindProperty
      			, true
      		);
      	}
      		let attrib = attrs[i][0];
      		this.onRemove(proxy.bindTo(
      		property
      		, (v)=>{
      			if(v == null)
      			{
      				tag.setAttribute(attrib, '');
      				return;
      			}
      			tag.setAttribute(attrib, v);
      		}
      	));
      }
      	return tag;
      	//*/
    }
  }, {
    key: "compileAttrTag",
    value: function compileAttrTag(sourceTag) {
      var attrProperty = sourceTag.getAttribute('cv-attr');
      var pairs = attrProperty.split(',');
      var attrs = pairs.map(function (p) {
        return p.split(':');
      });
      sourceTag.removeAttribute('cv-attr');
      return function (bindingView) {
        var tag = sourceTag.cloneNode(true);

        var _loop2 = function _loop2(i) {
          var bindProperty = attrs[i][1] || attrs[i][0];

          var _Bindable$resolve3 = _Bindable.Bindable.resolve(bindingView.args, bindProperty, true),
              _Bindable$resolve4 = _slicedToArray(_Bindable$resolve3, 2),
              proxy = _Bindable$resolve4[0],
              property = _Bindable$resolve4[1];

          var attrib = attrs[i][0];
          bindingView.onRemove(proxy.bindTo(property, function (v, k, t, d) {
            if (d || v === undefined) {
              tag.removeAttribute(attrib, v);
              return;
            }

            if (v === null) {
              tag.setAttribute(attrib, '');
              return;
            }

            tag.setAttribute(attrib, v);
          }));
        };

        for (var i in attrs) {
          _loop2(i);
        }

        return tag;
      };
    }
  }, {
    key: "mapInterpolatableTag",
    value: function mapInterpolatableTag(tag) {
      var _this6 = this;

      var regex = this.interpolateRegex;

      if (tag.nodeType === Node.TEXT_NODE) {
        var original = tag.nodeValue;

        if (!this.interpolatable(original)) {
          return tag;
        }

        var header = 0;
        var match;

        var _loop3 = function _loop3() {
          var bindProperty = match[2];
          var unsafeHtml = false;
          var unsafeView = false;
          var propertySplit = bindProperty.split('|');
          var transformer = false;

          if (propertySplit.length > 1) {
            transformer = _this6.stringTransformer(propertySplit.slice(1));
            bindProperty = propertySplit[0];
          }

          if (bindProperty.substr(0, 2) === '$$') {
            unsafeHtml = true;
            unsafeView = true;
            bindProperty = bindProperty.substr(2);
          }

          if (bindProperty.substr(0, 1) === '$') {
            unsafeHtml = true;
            bindProperty = bindProperty.substr(1);
          }

          if (bindProperty.substr(0, 3) === '000') {
            expand = true;
            bindProperty = bindProperty.substr(3);
            return "continue";
          }

          var staticPrefix = original.substring(header, match.index);
          header = match.index + match[1].length;
          var staticNode = document.createTextNode(staticPrefix);
          staticNode[dontParse] = true;
          tag.parentNode.insertBefore(staticNode, tag);
          var dynamicNode = void 0;

          if (unsafeHtml) {
            dynamicNode = document.createElement('div');
          } else {
            dynamicNode = document.createTextNode('');
          }

          dynamicNode[dontParse] = true;
          var proxy = _this6.args;
          var property = bindProperty;

          if (bindProperty.match(/\./)) {
            var _Bindable$resolve5 = _Bindable.Bindable.resolve(_this6.args, bindProperty, true);

            var _Bindable$resolve6 = _slicedToArray(_Bindable$resolve5, 2);

            proxy = _Bindable$resolve6[0];
            property = _Bindable$resolve6[1];
          }

          tag.parentNode.insertBefore(dynamicNode, tag);
          var debind = proxy.bindTo(property, function (v, k, t) {
            if (t[k] !== v && (t[k] instanceof View || t[k] instanceof Node || t[k] instanceof _Tag.Tag)) {
              if (!t[k].preserve) {
                t[k].remove();
              }
            }

            dynamicNode.nodeValue = '';

            if (unsafeView && !(v instanceof View)) {
              var unsafeTemplate = v;
              v = new View(_this6.args, _this6);
              v.template = unsafeTemplate;
            }

            if (transformer) {
              v = transformer(v);
            }

            if (v instanceof View) {
              var onAttach = function onAttach(parentNode) {
                if (v.dispatchAttach()) {
                  v.attached(parentNode);
                  v.dispatchAttached();
                }
              };

              _this6.attach.add(onAttach);

              v.render(tag.parentNode, dynamicNode);

              var cleanup = function cleanup() {
                if (!v.preserve) {
                  v.remove();
                }
              };

              _this6.onRemove(cleanup);

              v.onRemove(function () {
                _this6.attach.remove(onAttach);

                _this6._onRemove.remove(cleanup);
              });
            } else if (v instanceof Node) {
              tag.parentNode.insertBefore(v, dynamicNode);

              _this6.onRemove(function () {
                return v.remove();
              });
            } else if (v instanceof _Tag.Tag) {
              tag.parentNode.insertBefore(v.node, dynamicNode);

              _this6.onRemove(function () {
                return v.remove();
              });
            } else {
              if (v instanceof Object && v.__toString instanceof Function) {
                v = v.__toString();
              }

              if (unsafeHtml) {
                dynamicNode.innerHTML = v;
              } else {
                dynamicNode.nodeValue = v;
              }
            }

            dynamicNode[dontParse] = true;
          });

          _this6.onRemove(debind);
        };

        while (match = regex.exec(original)) {
          var _ret2 = _loop3();

          if (_ret2 === "continue") continue;
        }

        var staticSuffix = original.substring(header);
        var staticNode = document.createTextNode(staticSuffix);
        staticNode[dontParse] = true;
        tag.parentNode.insertBefore(staticNode, tag);
        tag.nodeValue = '';
      }

      if (tag.nodeType === Node.ELEMENT_NODE) {
        var _loop4 = function _loop4(i) {
          if (!_this6.interpolatable(tag.attributes[i].value)) {
            return "continue";
          }

          var header = 0;
          var match = void 0;
          var original = tag.attributes[i].value;
          var attribute = tag.attributes[i];
          var bindProperties = {};
          var segments = [];

          while (match = regex.exec(original)) {
            segments.push(original.substring(header, match.index));

            if (!bindProperties[match[2]]) {
              bindProperties[match[2]] = [];
            }

            bindProperties[match[2]].push(segments.length);
            segments.push(match[1]);
            header = match.index + match[1].length;
          }

          segments.push(original.substring(header));

          var _loop5 = function _loop5(j) {
            var proxy = _this6.args;
            var property = j;
            var propertySplit = j.split('|');
            var transformer = false;
            var longProperty = j;

            if (propertySplit.length > 1) {
              transformer = _this6.stringTransformer(propertySplit.slice(1));
              property = propertySplit[0];
            }

            if (property.match(/\./)) {
              var _Bindable$resolve7 = _Bindable.Bindable.resolve(_this6.args, property, true);

              var _Bindable$resolve8 = _slicedToArray(_Bindable$resolve7, 2);

              proxy = _Bindable$resolve8[0];
              property = _Bindable$resolve8[1];
            } // if(property.match(/\./))
            // {
            // 	[proxy, property] = Bindable.resolve(
            // 		this.args
            // 		, property
            // 		, true
            // 	);
            // }
            // console.log(this.args, property);


            var matching = [];
            var bindProperty = j;
            var matchingSegments = bindProperties[longProperty];

            _this6.onRemove(proxy.bindTo(property, function (v, k, t, d) {
              if (transformer) {
                v = transformer(v);
              }

              for (var _i5 in bindProperties) {
                for (var _j in bindProperties[longProperty]) {
                  segments[bindProperties[longProperty][_j]] = t[_i5];

                  if (k === property) {
                    segments[bindProperties[longProperty][_j]] = v;
                  }
                }
              }

              tag.setAttribute(attribute.name, segments.join(''));
            }));

            _this6.onRemove(function () {
              if (!proxy.isBound()) {
                _Bindable.Bindable.clearBindings(proxy);
              }
            });
          };

          for (var j in bindProperties) {
            _loop5(j);
          }
        };

        for (var i = 0; i < tag.attributes.length; i++) {
          var _ret3 = _loop4(i);

          if (_ret3 === "continue") continue;
        }
      }

      return tag;
    }
  }, {
    key: "mapRefTag",
    value: function mapRefTag(tag) {
      var refAttr = tag.getAttribute('cv-ref');

      var _refAttr$split = refAttr.split(':'),
          _refAttr$split2 = _slicedToArray(_refAttr$split, 3),
          refProp = _refAttr$split2[0],
          _refAttr$split2$ = _refAttr$split2[1],
          refClassname = _refAttr$split2$ === void 0 ? null : _refAttr$split2$,
          _refAttr$split2$2 = _refAttr$split2[2],
          refKey = _refAttr$split2$2 === void 0 ? null : _refAttr$split2$2;

      var refClass = _Tag.Tag;

      if (refClassname) {
        refClass = this.stringToClass(refClassname);
      }

      tag.removeAttribute('cv-ref');
      Object.defineProperty(tag, '___tag___', {
        enumerable: false,
        writable: true
      });
      this.onRemove(function () {
        tag.___tag___ = null;
        tag.remove();
      });
      var parent = this;
      var direct = this;

      if (this.viewList) {
        parent = this.viewList.parent; // if(!this.viewList.parent.tags[refProp])
        // {
        // 	this.viewList.parent.tags[refProp] = [];
        // }
        // let refKeyVal = this.args[refKey];
        // this.viewList.parent.tags[refProp][refKeyVal] = new refClass(
        // 	tag, this, refProp, refKeyVal
        // );
      } else {// this.tags[refProp] = new refClass(
          // 	tag, this, refProp
          // );
        }

      var tagObject = new refClass(tag, this, refProp, undefined, direct);
      tag.___tag___ = tagObject;
      this.tags[refProp] = tagObject;

      while (parent) {
        if (!parent.parent) {}

        var refKeyVal = this.args[refKey];

        if (refKeyVal !== undefined) {
          if (!parent.tags[refProp]) {
            parent.tags[refProp] = [];
          }

          parent.tags[refProp][refKeyVal] = tagObject;
        } else {
          parent.tags[refProp] = tagObject;
        }

        parent = parent.parent;
      }

      return tag;
    }
  }, {
    key: "mapBindTag",
    value: function mapBindTag(tag) {
      var _this7 = this;

      var bindArg = tag.getAttribute('cv-bind');
      var proxy = this.args;
      var property = bindArg;
      var top = null;

      if (bindArg.match(/\./)) {
        var _Bindable$resolve9 = _Bindable.Bindable.resolve(this.args, bindArg, true);

        var _Bindable$resolve10 = _slicedToArray(_Bindable$resolve9, 3);

        proxy = _Bindable$resolve10[0];
        property = _Bindable$resolve10[1];
        top = _Bindable$resolve10[2];
      }

      if (proxy !== this.args) {
        this.subBindings[bindArg] = this.subBindings[bindArg] || [];
        this.onRemove(this.args.bindTo(top, function () {
          while (_this7.subBindings.length) {
            _this7.subBindings.shift()();
          }
        }));
      }

      var unsafeHtml = false;

      if (property.substr(0, 1) === '$') {
        property = property.substr(1);
        unsafeHtml = true;
      }

      var debind = proxy.bindTo(property, function (v, k, t, d, p) {
        if ((p instanceof View || p instanceof Node || p instanceof _Tag.Tag) && p !== v) {
          p.remove();
        }

        var autoChangedEvent = new CustomEvent('cvAutoChanged', {
          bubbles: true
        });

        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag.tagName)) {
          var _type = tag.getAttribute('type');

          if (_type && _type.toLowerCase() === 'checkbox') {
            tag.checked = !!v;
            tag.dispatchEvent(autoChangedEvent);
          } else if (_type && _type.toLowerCase() === 'radio') {
            tag.checked = v == tag.value;
            tag.dispatchEvent(autoChangedEvent);
          } else if (_type !== 'file') {
            if (tag.tagName === 'SELECT') {
              var selectOption = function selectOption() {
                for (var i = 0; i < tag.options.length; i++) {
                  var option = tag.options[i];

                  if (option.value == v) {
                    tag.selectedIndex = i;
                  }
                }
              };

              selectOption();

              _this7.attach.add(selectOption);
            } else {
              tag.value = v == null ? '' : v;
            }

            tag.dispatchEvent(autoChangedEvent);
          }
        } else {
          if (v instanceof View) {
            var _iterator2 = _createForOfIteratorHelper(tag.childNodes),
                _step2;

            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var node = _step2.value;
                node.remove();
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }

            var onAttach = function onAttach(parentNode) {
              if (v.dispatchAttach()) {
                v.attached(parentNode);
                v.dispatchAttached();
              }
            };

            _this7.attach.add(onAttach);

            v.render(tag);
            v.onRemove(function () {
              return _this7.attach.remove(onAttach);
            });
          } else if (v instanceof Node) {
            tag.insert(v);
          } else if (v instanceof _Tag.Tag) {
            tag.append(v.node);
          } else if (unsafeHtml) {
            if (tag.innerHTML !== v) {
              v = String(v);

              if (tag.innerHTML === v.substring(0, tag.innerHTML.length)) {
                tag.innerHTML += v.substring(tag.innerHTML.length);
              } else {
                var _iterator3 = _createForOfIteratorHelper(tag.childNodes),
                    _step3;

                try {
                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                    var _node = _step3.value;

                    _node.remove();
                  }
                } catch (err) {
                  _iterator3.e(err);
                } finally {
                  _iterator3.f();
                }

                tag.innerHTML = v;
              }

              _Dom.Dom.mapTags(tag, false, function (t) {
                return t[dontParse] = true;
              });
            }
          } else {
            if (tag.textContent !== v) {
              var _iterator4 = _createForOfIteratorHelper(tag.childNodes),
                  _step4;

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var _node2 = _step4.value;

                  _node2.remove();
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }

              tag.textContent = v;
            }
          }
        }
      });

      if (proxy !== this.args) {
        this.subBindings[bindArg].push(debind);
      }

      this.onRemove(debind);
      var type = tag.getAttribute('type');
      var multi = tag.getAttribute('multiple');

      var inputListener = function inputListener(event) {
        if (event.target !== tag) {
          return;
        }

        if (type && type.toLowerCase() === 'checkbox') {
          if (tag.checked) {
            proxy[property] = event.target.getAttribute('value');
          } else {
            proxy[property] = false;
          }
        } else if (event.target.matches('[contenteditable=true]')) {
          proxy[property] = event.target.innerHTML;
        } else if (type === 'file' && multi) {
          var files = Array.from(event.target.files);

          var current = proxy[property] || _Bindable.Bindable.onDeck(proxy, property);

          if (!current || !files.length) {
            proxy[property] = files;
          } else {
            var _loop6 = function _loop6(i) {
              if (files[i] !== current[i]) {
                files[i].toJSON = function () {
                  return {
                    name: file[i].name,
                    size: file[i].size,
                    type: file[i].type,
                    date: file[i].lastModified
                  };
                };

                current[i] = files[i];
                return "break";
              }
            };

            for (var i in files) {
              var _ret4 = _loop6(i);

              if (_ret4 === "break") break;
            }
          }
        } else if (type === 'file' && !multi) {
          var _file = event.target.files.item(0);

          _file.toJSON = function () {
            return {
              name: _file.name,
              size: _file.size,
              type: _file.type,
              date: _file.lastModified
            };
          };

          proxy[property] = _file;
        } else {
          proxy[property] = event.target.value;
        }
      };

      if (type === 'file' || type === 'radio') {
        tag.addEventListener('change', inputListener);
      } else {
        tag.addEventListener('input', inputListener);
        tag.addEventListener('change', inputListener);
        tag.addEventListener('value-changed', inputListener);
      }

      this.onRemove(function () {
        if (type === 'file' || type === 'radio') {
          tag.removeEventListener('change', inputListener);
        } else {
          tag.removeEventListener('input', inputListener);
          tag.removeEventListener('change', inputListener);
          tag.removeEventListener('value-changed', inputListener);
        }
      });
      tag.removeAttribute('cv-bind');
      return tag;
    }
  }, {
    key: "mapOnTag",
    value: function mapOnTag(tag) {
      var _this8 = this;

      var referents = String(tag.getAttribute('cv-on'));
      referents.split(';').map(function (a) {
        return a.split(':');
      }).map(function (a) {
        a = a.map(function (a) {
          return a.trim();
        });
        var argLen = a.length;
        var eventName = String(a.shift()).trim();
        var callbackName = String(a.shift() || eventName).trim();
        var eventFlags = String(a.shift() || '').trim();
        var argList = [];
        var groups = /(\w+)(?:\(([$\w\s-'",]+)\))?/.exec(callbackName);

        if (groups) {
          callbackName = groups[1].replace(/(^[\s\n]+|[\s\n]+$)/, '');

          if (groups[2]) {
            argList = groups[2].split(',').map(function (s) {
              return s.trim();
            });
          }

          if (groups.length) {}
        } else {
          argList.push('$event');
        }

        if (!eventName || argLen === 1) {
          eventName = callbackName;
        }

        var eventMethod;
        var parent = _this8;

        while (parent) {
          if (typeof parent[callbackName] === 'function') {
            var _ret5 = function () {
              var _parent = parent;
              var _callBackName = callbackName;

              eventMethod = function eventMethod() {
                _parent[_callBackName].apply(_parent, arguments);
              };

              return "break";
            }();

            if (_ret5 === "break") break;
          }

          if (parent.parent) {
            parent = parent.parent;
          } else {
            break;
          }
        }

        var eventListener = function eventListener(event) {
          var argRefs = argList.map(function (arg) {
            var match;

            if (parseInt(arg) == arg) {
              return arg;
            } else if (arg === 'event' || arg === '$event') {
              return event;
            } else if (arg === '$view') {
              return parent;
            } else if (arg === '$tag') {
              return tag;
            } else if (arg === '$parent') {
              return _this8.parent;
            } else if (arg === '$subview') {
              return _this8;
            } else if (arg in _this8.args) {
              return _this8.args[arg];
            } else if (match = /^['"]([\w-]+?)["']$/.exec(arg)) {
              return match[1];
            }
          });

          if (!(typeof eventMethod === 'function')) {
            throw new Error("".concat(callbackName, " is not defined on View object.") + "\n" + "Tag:" + "\n" + "".concat(tag.outerHTML));
          }

          eventMethod.apply(void 0, _toConsumableArray(argRefs));
        };

        var eventOptions = {};

        if (eventFlags.includes('p')) {
          eventOptions.passive = true;
        } else if (eventFlags.includes('P')) {
          eventOptions.passive = false;
        }

        if (eventFlags.includes('c')) {
          eventOptions.capture = true;
        } else if (eventFlags.includes('C')) {
          eventOptions.capture = false;
        }

        if (eventFlags.includes('o')) {
          eventOptions.once = true;
        } else if (eventFlags.includes('O')) {
          eventOptions.once = false;
        }

        switch (eventName) {
          case '_init':
            eventListener();
            break;

          case '_attach':
            _this8.attach.add(eventListener);

            break;

          case '_detach':
            _this8.detach.add(eventListener);

            break;

          default:
            tag.addEventListener(eventName, eventListener, eventOptions);

            _this8.onRemove(function () {
              tag.removeEventListener(eventName, eventListener, eventOptions);
            });

            break;
        }

        return [eventName, callbackName, argList];
      });
      tag.removeAttribute('cv-on');
      return tag;
    }
  }, {
    key: "mapLinkTag",
    value: function mapLinkTag(tag) {
      /*/
      const tagCompiler = this.compileLinkTag(tag);
      	const newTag = tagCompiler(this);
      	tag.replaceWith(newTag);
      	return newTag;
      /*/
      var linkAttr = tag.getAttribute('cv-link');
      tag.setAttribute('href', linkAttr);

      var linkClick = function linkClick(event) {
        event.preventDefault();

        if (linkAttr.substring(0, 4) === 'http' || linkAttr.substring(0, 2) === '//') {
          window.open(tag.getAttribute('href', linkAttr));
          return;
        }

        _Router.Router.go(tag.getAttribute('href'));
      };

      tag.addEventListener('click', linkClick);
      this.onRemove(function (tag, eventListener) {
        return function () {
          tag.removeEventListener('click', eventListener);
          tag = undefined;
          eventListener = undefined;
        };
      }(tag, linkClick));
      tag.removeAttribute('cv-link');
      return tag; //*/
    }
  }, {
    key: "compileLinkTag",
    value: function compileLinkTag(sourceTag) {
      var linkAttr = sourceTag.getAttribute('cv-link');
      sourceTag.removeAttribute('cv-link');
      return function (bindingView) {
        var tag = sourceTag.cloneNode(true);
        tag.setAttribute('href', linkAttr);
        return tag;
      };
    }
  }, {
    key: "mapPrendererTag",
    value: function mapPrendererTag(tag) {
      var prerenderAttr = tag.getAttribute('cv-prerender');
      var prerendering = window.prerenderer || navigator.userAgent.match(/prerender/i);

      if (prerendering) {
        window.prerenderer = window.prerenderer || true;
      }

      if (prerenderAttr === 'never' && prerendering || prerenderAttr === 'only' && !prerendering) {
        tag.parentNode.removeChild(tag);
      }

      return tag;
    }
  }, {
    key: "mapWithTag",
    value: function mapWithTag(tag) {
      var _this9 = this;

      var withAttr = tag.getAttribute('cv-with');
      var carryAttr = tag.getAttribute('cv-carry');
      var viewAttr = tag.getAttribute('cv-view');
      tag.removeAttribute('cv-with');
      tag.removeAttribute('cv-carry');
      tag.removeAttribute('cv-view');
      var viewClass = viewAttr ? this.stringToClass(viewAttr) : View;
      var subTemplate = new DocumentFragment();

      _toConsumableArray(tag.childNodes).map(function (n) {
        return subTemplate.appendChild(n);
      });

      var carryProps = [];

      if (carryAttr) {
        carryProps = carryAttr.split(',').map(function (s) {
          return s.trim();
        });
      }

      var debind = this.args.bindTo(withAttr, function (v, k, t, d) {
        if (_this9.withViews.has(tag)) {
          _this9.withViews["delete"](tag);
        }

        while (tag.firstChild) {
          tag.removeChild(tag.firstChild);
        }

        var view = new viewClass({}, _this9);

        _this9.onRemove(function (view) {
          return function () {
            view.remove();
          };
        }(view));

        view.template = subTemplate;

        var _loop7 = function _loop7(i) {
          var debind = _this9.args.bindTo(carryProps[i], function (v, k) {
            view.args[k] = v;
          });

          view.onRemove(debind);

          _this9.onRemove(function () {
            debind();
            view.remove();
          });
        };

        for (var i in carryProps) {
          _loop7(i);
        }

        var _loop8 = function _loop8(_i6) {
          var debind = v.bindTo(_i6, function (vv, kk) {
            view.args[kk] = vv;
          });
          var debindUp = view.args.bindTo(_i6, function (vv, kk) {
            v[kk] = vv;
          });

          _this9.onRemove(function () {
            debind();

            if (!v.isBound()) {
              _Bindable.Bindable.clearBindings(v);
            }

            view.remove();
          });

          view.onRemove(function () {
            debind();

            if (!v.isBound()) {
              _Bindable.Bindable.clearBindings(v);
            }
          });
        };

        for (var _i6 in v) {
          _loop8(_i6);
        }

        view.render(tag);

        _this9.withViews.set(tag, view);
      });
      this.onRemove(function () {
        _this9.withViews["delete"](tag);

        debind();
      });
      return tag;
    }
  }, {
    key: "mapViewTag",
    value: function mapViewTag(tag) {
      var _this10 = this;

      var viewAttr = tag.getAttribute('cv-view');
      tag.removeAttribute('cv-view');
      var subTemplate = new DocumentFragment();

      _toConsumableArray(tag.childNodes).map(function (n) {
        return subTemplate.appendChild(n);
      });

      var parts = viewAttr.split(':');
      var viewClass = parts.pop() ? this.stringToClass(viewAttr) : View;
      var viewName = parts.shift();
      var view = new viewClass(this.args, this);
      this.views.set(tag, view);

      if (viewName) {
        this.views.set(viewName, view);
      }

      this.onRemove(function (view) {
        return function () {
          view.remove();

          _this10.views["delete"](tag);

          _this10.views["delete"](viewName);
        };
      }(view));
      view.template = subTemplate;
      view.render(tag);
      return tag;
    }
  }, {
    key: "mapEachTag",
    value: function mapEachTag(tag) {
      var _this11 = this;

      var eachAttr = tag.getAttribute('cv-each');
      var viewAttr = tag.getAttribute('cv-view');
      tag.removeAttribute('cv-each');
      tag.removeAttribute('cv-view');
      var viewClass = viewAttr ? this.stringToClass(viewAttr) : View;
      var subTemplate = new DocumentFragment();
      Array.from(tag.childNodes).map(function (n) {
        return subTemplate.appendChild(n);
      });

      var _eachAttr$split = eachAttr.split(':'),
          _eachAttr$split2 = _slicedToArray(_eachAttr$split, 3),
          eachProp = _eachAttr$split2[0],
          asProp = _eachAttr$split2[1],
          keyProp = _eachAttr$split2[2];

      var debind = this.args.bindTo(eachProp, function (v, k, t, d, p) {
        if (_this11.viewLists.has(tag)) {
          _this11.viewLists.get(tag).remove();
        }

        var viewList = new _ViewList.ViewList(subTemplate, asProp, v, _this11, keyProp, viewClass);

        var viewListRemover = function viewListRemover() {
          return viewList.remove();
        };

        _this11.onRemove(viewListRemover);

        viewList.onRemove(function () {
          return _this11._onRemove.remove(viewListRemover);
        });

        var debindA = _this11.args.bindTo(function (v, k, t, d) {
          if (k === '_id') {
            return;
          }

          if (d) {
            delete viewList.subArgs[k];
          }

          viewList.subArgs[k] = v;
        });

        var debindB = viewList.args.bindTo(function (v, k, t, d, p) {
          if (k === '_id' || k === 'value' || k.substring(0, 3) === '___') {
            return;
          }

          if (d) {
            delete _this11.args[k];
          }

          if (k in _this11.args) {
            _this11.args[k] = v;
          }
        });
        viewList.onRemove(debindA);
        viewList.onRemove(debindB);

        _this11.onRemove(debindA);

        _this11.onRemove(debindB);

        while (tag.firstChild) {
          tag.removeChild(tag.firstChild);
        }

        _this11.viewLists.set(tag, viewList);

        viewList.render(tag);
      });
      this.onRemove(debind);
      return tag;
    }
  }, {
    key: "mapIfTag",
    value: function mapIfTag(tag) {
      var _this12 = this;

      var sourceTag = tag;
      var viewProperty = tag.getAttribute('cv-view');
      var ifProperty = sourceTag.getAttribute('cv-if');
      var inverted = false;
      var defined = false;
      sourceTag.removeAttribute('cv-view');
      sourceTag.removeAttribute('cv-if');
      var viewClass = viewProperty ? this.stringToClass(viewProperty) : View;

      if (ifProperty.substr(0, 1) === '!') {
        ifProperty = ifProperty.substr(1);
        inverted = true;
      }

      if (ifProperty.substr(0, 1) === '?') {
        ifProperty = ifProperty.substr(1);
        defined = true;
      }

      var subTemplate = new DocumentFragment();
      Array.from(sourceTag.childNodes).map(function (n) {
        return subTemplate.appendChild(n);
      } // n => subTemplate.appendChild(n.cloneNode(true))
      );
      var bindingView = this;
      var ifDoc = new DocumentFragment();
      var view = new viewClass(this.args, bindingView);
      this.onRemove(view.tags.bindTo(function (v, k) {
        _this12.tags[k] = v;
      }));
      view.template = subTemplate;
      var proxy = bindingView.args;
      var property = ifProperty;

      if (ifProperty.match(/\./)) {
        var _Bindable$resolve11 = _Bindable.Bindable.resolve(bindingView.args, ifProperty, true);

        var _Bindable$resolve12 = _slicedToArray(_Bindable$resolve11, 2);

        proxy = _Bindable$resolve12[0];
        property = _Bindable$resolve12[1];
      }

      view.render(ifDoc);
      var propertyDebind = proxy.bindTo(property, function (v, k) {
        var o = v;

        if (defined) {
          v = v !== null && v !== undefined;
        }

        if (Array.isArray(v)) {
          v = !!v.length;
        }

        if (inverted) {
          v = !v;
        }

        if (v) {
          tag.appendChild(ifDoc);
        } else {
          view.nodes.map(function (n) {
            return ifDoc.appendChild(n);
          });
        }
      }, {
        wait: 0,
        children: Array.isArray(proxy[property])
      }); // const propertyDebind = this.args.bindChain(property, onUpdate);

      bindingView.onRemove(propertyDebind);

      var bindableDebind = function bindableDebind() {
        if (!proxy.isBound()) {
          _Bindable.Bindable.clearBindings(proxy);
        }
      };

      var viewDebind = function viewDebind() {
        propertyDebind();
        bindableDebind();

        bindingView._onRemove.remove(propertyDebind);

        bindingView._onRemove.remove(bindableDebind);
      };

      bindingView.onRemove(viewDebind);
      this.onRemove(function () {
        view.remove();

        if (bindingView !== _this12) {
          bindingView.remove();
        }
      });
      return tag; //*/
    }
  }, {
    key: "compileIfTag",
    value: function compileIfTag(sourceTag) {
      var ifProperty = sourceTag.getAttribute('cv-if');
      var inverted = false;
      sourceTag.removeAttribute('cv-if');

      if (ifProperty.substr(0, 1) === '!') {
        ifProperty = ifProperty.substr(1);
        inverted = true;
      }

      var subTemplate = new DocumentFragment();
      Array.from(sourceTag.childNodes).map(function (n) {
        return subTemplate.appendChild(n.cloneNode(true));
      });
      return function (bindingView) {
        var tag = sourceTag.cloneNode();
        var ifDoc = new DocumentFragment();
        var view = new View({}, bindingView);
        view.template = subTemplate; // view.parent   = bindingView;

        bindingView.syncBind(view);
        var proxy = bindingView.args;
        var property = ifProperty;

        if (ifProperty.match(/\./)) {
          var _Bindable$resolve13 = _Bindable.Bindable.resolve(bindingView.args, ifProperty, true);

          var _Bindable$resolve14 = _slicedToArray(_Bindable$resolve13, 2);

          proxy = _Bindable$resolve14[0];
          property = _Bindable$resolve14[1];
        }

        var hasRendered = false;
        var propertyDebind = proxy.bindTo(property, function (v, k) {
          if (!hasRendered) {
            var renderDoc = bindingView.args[property] || inverted ? tag : ifDoc;
            view.render(renderDoc);
            hasRendered = true;
            return;
          }

          if (Array.isArray(v)) {
            v = !!v.length;
          }

          if (inverted) {
            v = !v;
          }

          if (v) {
            tag.appendChild(ifDoc);
          } else {
            view.nodes.map(function (n) {
              return ifDoc.appendChild(n);
            });
          }
        }); // let cleaner = bindingView;
        // while(cleaner.parent)
        // {
        // 	cleaner = cleaner.parent;
        // }

        bindingView.onRemove(propertyDebind);

        var bindableDebind = function bindableDebind() {
          if (!proxy.isBound()) {
            _Bindable.Bindable.clearBindings(proxy);
          }
        };

        var viewDebind = function viewDebind() {
          propertyDebind();
          bindableDebind();

          bindingView._onRemove.remove(propertyDebind);

          bindingView._onRemove.remove(bindableDebind);
        };

        view.onRemove(viewDebind);
        return tag;
      };
    }
  }, {
    key: "mapTemplateTag",
    value: function mapTemplateTag(tag) {
      var templateName = tag.getAttribute('cv-template');
      tag.removeAttribute('cv-template');

      this.templates[templateName] = function () {
        return tag.tagName === 'TEMPLATE' ? tag.content.cloneNode(true) : new DocumentFragment(tag.innerHTML);
      };

      this.rendered.then(function () {
        return tag.remove();
      });
      return tag;
    }
  }, {
    key: "mapSlotTag",
    value: function mapSlotTag(tag) {
      var templateName = tag.getAttribute('cv-slot');
      var getTemplate = this.templates[templateName];

      if (!getTemplate) {
        var parent = this;

        while (parent) {
          getTemplate = parent.templates[templateName];

          if (getTemplate) {
            break;
          }

          parent = this.parent;
        }

        if (!getTemplate) {
          console.error("Template ".concat(templateName, " not found."));
          return;
        }
      }

      var template = getTemplate();
      tag.removeAttribute('cv-slot');

      while (tag.firstChild) {
        tag.firstChild.remove();
      }

      tag.appendChild(template);
      return tag;
    }
  }, {
    key: "syncBind",
    value: function syncBind(subView) {
      var _this13 = this;

      var debindA = this.args.bindTo(function (v, k, t, d) {
        if (k === '_id') {
          return;
        }

        if (subView.args[k] !== v) {
          subView.args[k] = v;
        }
      }); // for(let i in this.args)
      // {
      // 	if(i == '_id')
      // 	{
      // 		continue;
      // 	}
      // 	subView.args[i] = this.args[i];
      // }

      var debindB = subView.args.bindTo(function (v, k, t, d, p) {
        if (k === '_id') {
          return;
        }

        var newRef = v;
        var oldRef = p;

        if (newRef instanceof View) {
          newRef = newRef.___ref___;
        }

        if (oldRef instanceof View) {
          oldRef = oldRef.___ref___;
        }

        if (newRef !== oldRef && oldRef instanceof View) {
          p.remove();
        }

        if (k in _this13.args) {
          _this13.args[k] = v;
        }
      });
      this.onRemove(debindA);
      this.onRemove(debindB);
      subView.onRemove(function () {
        _this13._onRemove.remove(debindA);

        _this13._onRemove.remove(debindB);
      });
    }
  }, {
    key: "postRender",
    value: function postRender(parentNode) {}
  }, {
    key: "attached",
    value: function attached(parentNode) {}
  }, {
    key: "interpolatable",
    value: function interpolatable(str) {
      return !!String(str).match(this.interpolateRegex);
    }
  }, {
    key: "uuid",
    value: function uuid() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
        return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
      });
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this14 = this;

      var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var remover = function remover() {
        for (var _i7 in _this14.tags) {
          if (Array.isArray(_this14.tags[_i7])) {
            _this14.tags[_i7] && _this14.tags[_i7].map(function (t) {
              return t.remove();
            });

            _this14.tags[_i7].splice(0);
          } else {
            _this14.tags[_i7] && _this14.tags[_i7].remove();
            _this14.tags[_i7] = undefined;
          }
        }

        for (var _i8 in _this14.nodes) {
          _this14.nodes[_i8] && _this14.nodes[_i8].dispatchEvent(new Event('cvDomDetached'));
          _this14.nodes[_i8] && _this14.nodes[_i8].remove();
          _this14.nodes[_i8] = undefined;
        }

        _this14.nodes.splice(0);

        _this14.firstNode = _this14.lastNode = undefined;
      };

      if (now) {
        remover();
      } else {
        requestAnimationFrame(remover);
      }

      var callbacks = this._onRemove.items();

      var _iterator5 = _createForOfIteratorHelper(callbacks),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var callback = _step5.value;

          this._onRemove.remove(callback);

          callback();
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      var cleanup;

      while (cleanup = this.cleanup.shift()) {
        cleanup && cleanup();
      }

      var _iterator6 = _createForOfIteratorHelper(this.viewLists),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var _step6$value = _slicedToArray(_step6.value, 2),
              tag = _step6$value[0],
              viewList = _step6$value[1];

          viewList.remove();
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      this.viewLists.clear();

      for (var _i9 in this.timeouts) {
        clearTimeout(this.timeouts[_i9].timeout);
        delete this.timeouts[_i9];
      }

      for (var i in this.intervals) {
        clearInterval(this.intervals[i].timeout);
        delete this.intervals[i];
      }

      for (var i in this.frames) {
        this.frames[i]();
        delete this.frames[i];
      }

      this.removed = true;
    }
  }, {
    key: "findTag",
    value: function findTag(selector) {
      for (var i in this.nodes) {
        var result = void 0;

        if (!this.nodes[i].querySelector) {
          continue;
        }

        if (this.nodes[i].matches(selector)) {
          return new _Tag.Tag(this.nodes[i], this, undefined, undefined, this);
        }

        if (result = this.nodes[i].querySelector(selector)) {
          return new _Tag.Tag(result, this, undefined, undefined, this);
        }
      }
    }
  }, {
    key: "findTags",
    value: function findTags(selector) {
      var _this15 = this;

      return this.nodes.filter(function (n) {
        return n.querySelectorAll;
      }).map(function (n) {
        return _toConsumableArray(n.querySelectorAll(selector));
      }).flat().map(function (n) {
        return new _Tag.Tag(n, _this15, undefined, undefined, _this15);
      });
    }
  }, {
    key: "onRemove",
    value: function onRemove(callback) {
      this._onRemove.add(callback);
    }
  }, {
    key: "update",
    value: function update() {}
  }, {
    key: "beforeUpdate",
    value: function beforeUpdate(args) {}
  }, {
    key: "afterUpdate",
    value: function afterUpdate(args) {}
  }, {
    key: "stringTransformer",
    value: function stringTransformer(methods) {
      var _this16 = this;

      return function (x) {
        for (var m in methods) {
          var parent = _this16;
          var method = methods[m];

          while (parent && !parent[method]) {
            parent = parent.parent;
          }

          if (!parent) {
            return;
          }

          x = parent[methods[m]](x);
        }

        return x;
      };
    }
  }, {
    key: "stringToClass",
    value: function stringToClass(refClassname) {
      if (View.refClasses.has(refClassname)) {
        return View.refClasses.get(refClassname);
      }

      var refClassSplit = refClassname.split('/');
      var refShortClass = refClassSplit[refClassSplit.length - 1];

      var refClass = require(refClassname);

      View.refClasses.set(refClassname, refClass[refShortClass]);
      return refClass[refShortClass];
    }
  }, {
    key: "preventParsing",
    value: function preventParsing(node) {
      node[dontParse] = true;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.nodes.map(function (n) {
        return n.outerHTML;
      }).join(' ');
    }
  }, {
    key: "listen",
    value: function listen(node, eventName, callback, options) {
      var _this17 = this;

      if (typeof node === 'string') {
        options = callback;
        callback = eventName;
        eventName = node;
        node = this;
      }

      if (node instanceof View) {
        return this.listen(node.nodes, eventName, callback, options);
      }

      if (Array.isArray(node)) {
        var removers = node.map(function (n) {
          return _this17.listen(n, eventName, callback, options);
        });
        return function () {
          return removers.map(function (r) {
            return r();
          });
        };
      }

      if (node instanceof _Tag.Tag) {
        return this.listen(node.element, eventName, callback, options);
      }

      node.addEventListener(eventName, callback, options);

      var remove = function remove() {
        node.removeEventListener(eventName, callback, options);
      };

      var remover = function remover() {
        remove();

        remove = function remove() {};
      };

      this.onRemove(function () {
        return remover();
      });
      return remover;
    }
  }], [{
    key: "isView",
    value: function isView() {
      return View;
    }
  }]);

  return View;
}(_Mixin.Mixin["with"](_EventTargetMixin.EventTargetMixin));

exports.View = View;
Object.defineProperty(View, 'templates', {
  value: new Map()
});
Object.defineProperty(View, 'refClasses', {
  value: new Map()
});
  })();
});

require.register("curvature/base/ViewList.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ViewList = void 0;

var _Bindable = require("./Bindable");

var _View = require("./View");

var _Bag = require("./Bag");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ViewList = /*#__PURE__*/function () {
  function ViewList(template, subProperty, list, parent) {
    var _this = this;

    var keyProperty = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var viewClass = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;

    _classCallCheck(this, ViewList);

    this.removed = false;
    this.args = _Bindable.Bindable.makeBindable({});
    this.args.value = _Bindable.Bindable.makeBindable(list || {});
    this.subArgs = _Bindable.Bindable.makeBindable({});
    this.views = [];
    this.cleanup = [];
    this.viewClass = viewClass || _View.View;
    this._onRemove = new _Bag.Bag();
    this.template = template;
    this.subProperty = subProperty;
    this.keyProperty = keyProperty;
    this.tag = null;
    this.paused = false;
    this.parent = parent;
    this.rendered = new Promise(function (accept, reject) {
      Object.defineProperty(_this, 'renderComplete', {
        configurable: false,
        writable: true,
        value: accept
      });
    });
    this.willReRender = false;

    this.args.___before(function (t, e, s, o, a) {
      if (e == 'bindTo') {
        return;
      }

      _this.paused = true;
    });

    this.args.___after(function (t, e, s, o, a) {
      if (e == 'bindTo') {
        return;
      }

      _this.paused = s.length > 1;

      _this.reRender();
    });

    var debind = this.args.value.bindTo(function (v, k, t, d) {
      if (_this.paused) {
        return;
      }

      var kk = k;

      if (_typeof(k) === 'symbol') {
        return;
      }

      if (isNaN(k)) {
        kk = '_' + k;
      }

      if (d) {
        if (_this.views[kk]) {
          _this.views[kk].remove();
        }

        delete _this.views[kk];

        for (var i in _this.views) {
          if (typeof i === 'string') {
            _this.views[i].args[_this.keyProperty] = i.substr(1);
            continue;
          }

          _this.views[i].args[_this.keyProperty] = i;
        }
      } else if (!_this.views[kk] && !_this.willReRender) {
        cancelAnimationFrame(_this.willReRender);
        _this.willReRender = requestAnimationFrame(function () {
          _this.reRender();
        });
      } else if (_this.views[kk] && _this.views[kk].args) {
        _this.views[kk].args[_this.keyProperty] = k;
        _this.views[kk].args[_this.subProperty] = v;
      }
    });

    this._onRemove.add(debind);
  }

  _createClass(ViewList, [{
    key: "render",
    value: function render(tag) {
      var _this2 = this;

      var renders = [];

      var _iterator = _createForOfIteratorHelper(this.views),
          _step;

      try {
        var _loop = function _loop() {
          var view = _step.value;
          view.render(tag);
          renders.push(view.rendered.then(function () {
            return view;
          }));
        };

        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.tag = tag;
      Promise.all(renders).then(function (views) {
        return _this2.renderComplete(views);
      });
    }
  }, {
    key: "reRender",
    value: function reRender() {
      var _this3 = this;

      if (this.paused || !this.tag) {
        return;
      }

      var views = [];

      for (var i in this.views) {
        views[i] = this.views[i];
      }

      var finalViews = [];
      this.upDebind && this.upDebind.map(function (d) {
        return d && d();
      });
      this.downDebind && this.downDebind.map(function (d) {
        return d && d();
      });
      this.upDebind = [];
      this.downDebind = [];
      var minKey = Infinity;
      var anteMinKey = Infinity;

      var _loop2 = function _loop2(_i) {
        var found = false;
        var k = _i;

        if (isNaN(k)) {
          k = '_' + _i;
        } else if (String(k).length) {
          k = Number(k);
        }

        for (var _j = views.length - 1; _j >= 0; _j--) {
          if (views[_j] && _this3.args.value[_i] !== undefined && _this3.args.value[_i] === views[_j].args[_this3.subProperty]) {
            found = true;
            finalViews[k] = views[_j];

            if (!isNaN(k)) {
              minKey = Math.min(minKey, k);
              k > 0 && (anteMinKey = Math.min(anteMinKey, k));
            }

            finalViews[k].args[_this3.keyProperty] = _i;
            delete views[_j];
            break;
          }
        }

        if (!found) {
          var viewArgs = {};
          var view = finalViews[k] = new _this3.viewClass(viewArgs, _this3.parent);

          if (!isNaN(k)) {
            minKey = Math.min(minKey, k);
            k > 0 && (anteMinKey = Math.min(anteMinKey, k));
          }

          finalViews[k].template = _this3.template instanceof Object ? _this3.template : _this3.template;
          finalViews[k].viewList = _this3;
          finalViews[k].args[_this3.keyProperty] = _i;
          finalViews[k].args[_this3.subProperty] = _this3.args.value[_i];
          _this3.upDebind[k] = viewArgs.bindTo(_this3.subProperty, function (v, k, t, d) {
            var index = viewArgs[_this3.keyProperty];

            if (d) {
              delete _this3.args.value[index];
              return;
            }

            _this3.args.value[index] = v;
          });
          _this3.downDebind[k] = _this3.subArgs.bindTo(function (v, k, t, d) {
            if (d) {
              delete viewArgs[k];
              return;
            }

            viewArgs[k] = v;
          });
          view.onRemove(function () {
            _this3.upDebind[k] && _this3.upDebind[k]();
            _this3.downDebind[k] && _this3.downDebind[k]();
            delete _this3.downDebind[k];
            delete _this3.upDebind[k];
          });

          _this3._onRemove.add(function () {
            _this3.upDebind.filter(function (x) {
              return x;
            }).map(function (d) {
              return d();
            });

            _this3.upDebind.splice(0);
          });

          _this3._onRemove.add(function () {
            _this3.downDebind.filter(function (x) {
              return x;
            }).map(function (d) {
              return d();
            });

            _this3.downDebind.splice(0);
          });

          viewArgs[_this3.subProperty] = _this3.args.value[_i];
        }
      };

      for (var _i in this.args.value) {
        _loop2(_i);
      }

      for (var _i2 in views) {
        var found = false;

        for (var j in finalViews) {
          if (views[_i2] === finalViews[j]) {
            found = true;
            break;
          }
        }

        if (!found) {
          views[_i2].remove();
        }
      }

      if (Array.isArray(this.args.value)) {
        var localMin = minKey === 0 && finalViews[1] !== undefined && finalViews.length > 1 || anteMinKey === Infinity ? minKey : anteMinKey;

        var renderRecurse = function renderRecurse() {
          var i = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var ii = finalViews.length - i - 1;

          while (ii > localMin && finalViews[ii] === undefined) {
            ii--;
          }

          if (ii < localMin) {
            return Promise.resolve();
          }

          if (finalViews[ii] === _this3.views[ii]) {
            if (!finalViews[ii].firstNode) {
              finalViews[ii].render(_this3.tag, finalViews[ii + 1]);
              return finalViews[ii].rendered.then(function () {
                return renderRecurse(Number(i) + 1);
              });
            }

            return renderRecurse(Number(i) + 1);
          }

          finalViews[ii].render(_this3.tag, finalViews[ii + 1]);

          _this3.views.splice(ii, 0, finalViews[ii]);

          return finalViews[ii].rendered.then(function () {
            return renderRecurse(Number(i) + 1);
          });
        };

        this.rendered = renderRecurse();
      } else {
        var renders = [];
        var leftovers = Object.assign({}, finalViews);

        var _loop3 = function _loop3(_i3) {
          delete leftovers[_i3];

          if (finalViews[_i3].firstNode && finalViews[_i3] === _this3.views[_i3]) {
            return "continue";
          }

          finalViews[_i3].render(_this3.tag);

          renders.push(finalViews[_i3].rendered.then(function () {
            return finalViews[_i3];
          }));
        };

        for (var _i3 in finalViews) {
          var _ret = _loop3(_i3);

          if (_ret === "continue") continue;
        }

        for (var _i4 in leftovers) {
          delete this.args.views[_i4];
          leftovers.remove();
        }

        this.rendered = Promise.all(renders);
      }

      this.views = finalViews;

      for (var _i5 in finalViews) {
        if (isNaN(_i5)) {
          finalViews[_i5].args[this.keyProperty] = _i5.substr(1);
          continue;
        }

        finalViews[_i5].args[this.keyProperty] = _i5;
      }

      this.willReRender = false;
    }
  }, {
    key: "pause",
    value: function pause() {
      var _pause = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      for (var i in this.views) {
        this.views[i].pause(_pause);
      }
    }
  }, {
    key: "onRemove",
    value: function onRemove(callback) {
      this._onRemove.add(callback);
    }
  }, {
    key: "remove",
    value: function remove() {
      for (var i in this.views) {
        this.views[i].remove();
      }

      var onRemove = this._onRemove.items();

      for (var _i6 in onRemove) {
        this._onRemove.remove(onRemove[_i6]);

        onRemove[_i6]();
      }

      var cleanup;

      while (this.cleanup.length) {
        cleanup = this.cleanup.pop();
        cleanup();
      }

      this.views = [];

      while (this.tag && this.tag.firstChild) {
        this.tag.removeChild(this.tag.firstChild);
      }

      if (this.subArgs) {
        _Bindable.Bindable.clearBindings(this.subArgs);
      }

      _Bindable.Bindable.clearBindings(this.args);

      if (this.args.value && !this.args.value.isBound()) {
        _Bindable.Bindable.clearBindings(this.args.value);
      }

      this.removed = true;
    }
  }]);

  return ViewList;
}();

exports.ViewList = ViewList;
  })();
});

require.register("curvature/input/Keyboard.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Keyboard = void 0;

var _Bindable = require("../base/Bindable");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Keyboard = /*#__PURE__*/function () {
  _createClass(Keyboard, null, [{
    key: "get",
    value: function get() {
      return this.instance = this.instance || _Bindable.Bindable.make(new this());
    }
  }]);

  function Keyboard() {
    var _this = this;

    _classCallCheck(this, Keyboard);

    this.maxDecay = 120;
    this.comboTime = 500;
    this.listening = false;
    this.focusElement = document.body;
    Object.defineProperty(this, 'combo', {
      value: _Bindable.Bindable.make([])
    });
    Object.defineProperty(this, 'whichs', {
      value: _Bindable.Bindable.make({})
    });
    Object.defineProperty(this, 'codes', {
      value: _Bindable.Bindable.make({})
    });
    Object.defineProperty(this, 'keys', {
      value: _Bindable.Bindable.make({})
    });
    Object.defineProperty(this, 'pressedWhich', {
      value: _Bindable.Bindable.make({})
    });
    Object.defineProperty(this, 'pressedCode', {
      value: _Bindable.Bindable.make({})
    });
    Object.defineProperty(this, 'pressedKey', {
      value: _Bindable.Bindable.make({})
    });
    Object.defineProperty(this, 'releasedWhich', {
      value: _Bindable.Bindable.make({})
    });
    Object.defineProperty(this, 'releasedCode', {
      value: _Bindable.Bindable.make({})
    });
    Object.defineProperty(this, 'releasedKey', {
      value: _Bindable.Bindable.make({})
    });
    Object.defineProperty(this, 'keyRefs', {
      value: _Bindable.Bindable.make({})
    });
    document.addEventListener('keyup', function (event) {
      if (!_this.listening) {
        return;
      }

      if (_this.focusElement && document.activeElement !== _this.focusElement) {
        return;
      }

      event.preventDefault();
      _this.releasedWhich[event.which] = Date.now();
      _this.releasedCode[event.code] = Date.now();
      _this.releasedKey[event.key] = Date.now();
      _this.whichs[event.which] = -1;
      _this.codes[event.code] = -1;
      _this.keys[event.key] = -1;
    });
    document.addEventListener('keydown', function (event) {
      if (!_this.listening) {
        return;
      }

      if (_this.focusElement && document.activeElement !== _this.focusElement) {
        return;
      }

      event.preventDefault();

      if (event.repeat) {
        return;
      }

      _this.combo.push(event.code);

      clearTimeout(_this.comboTimer);
      _this.comboTimer = setTimeout(function () {
        return _this.combo.splice(0);
      }, _this.comboTime);
      _this.pressedWhich[event.which] = Date.now();
      _this.pressedCode[event.code] = Date.now();
      _this.pressedKey[event.key] = Date.now();

      if (_this.keys[event.key] > 0) {
        return;
      }

      _this.whichs[event.which] = 1;
      _this.codes[event.code] = 1;
      _this.keys[event.key] = 1;
    });

    var windowBlur = function windowBlur(event) {
      for (var i in _this.keys) {
        if (_this.keys[i] < 0) {
          continue;
        }

        _this.releasedKey[i] = Date.now();
        _this.keys[i] = -1;
      }

      for (var _i in _this.codes) {
        if (_this.codes[_i] < 0) {
          continue;
        }

        _this.releasedCode[_i] = Date.now();
        _this.codes[_i] = -1;
      }

      for (var _i2 in _this.whichs) {
        if (_this.whichs[_i2] < 0) {
          continue;
        }

        _this.releasedWhich[_i2] = Date.now();
        _this.whichs[_i2] = -1;
      }
    };

    window.addEventListener('blur', windowBlur);
    window.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        return;
      }

      windowBlur();
    });
  }

  _createClass(Keyboard, [{
    key: "getKeyRef",
    value: function getKeyRef(keyCode) {
      var keyRef = this.keyRefs[keyCode] = this.keyRefs[keyCode] || _Bindable.Bindable.make({});

      return keyRef;
    }
  }, {
    key: "getKeyTime",
    value: function getKeyTime(key) {
      var released = this.releasedKey[key];
      var pressed = this.pressedKey[key];

      if (!pressed) {
        return 0;
      }

      if (!released || released < pressed) {
        return Date.now() - pressed;
      }

      return (Date.now() - released) * -1;
    }
  }, {
    key: "getCodeTime",
    value: function getCodeTime(code) {
      var released = this.releasedCode[code];
      var pressed = this.pressedCode[code];

      if (!pressed) {
        return 0;
      }

      if (!released || released < pressed) {
        return Date.now() - pressed;
      }

      return (Date.now() - released) * -1;
    }
  }, {
    key: "getWhichTime",
    value: function getWhichTime(code) {
      var released = this.releasedWhich[code];
      var pressed = this.pressedWhich[code];

      if (!pressed) {
        return 0;
      }

      if (!released || released < pressed) {
        return Date.now() - pressed;
      }

      return (Date.now() - released) * -1;
    }
  }, {
    key: "getKey",
    value: function getKey(key) {
      if (!this.keys[key]) {
        return 0;
      }

      return this.keys[key];
    }
  }, {
    key: "getKeyCode",
    value: function getKeyCode(code) {
      if (!this.codes[code]) {
        return 0;
      }

      return this.codes[code];
    }
  }, {
    key: "update",
    value: function update() {
      for (var i in this.keys) {
        if (this.keys[i] > 0) {
          this.keys[i]++;
        } else if (this.keys[i] > -this.maxDecay) {
          this.keys[i]--;
        } else {
          delete this.keys[i];
        }
      }

      for (var i in this.codes) {
        var released = this.releasedCode[i];
        var pressed = this.pressedCode[i];
        var keyRef = this.getKeyRef(i);

        if (this.codes[i] > 0) {
          keyRef.frames = this.codes[i]++;
          keyRef.time = pressed ? Date.now() - pressed : 0;
          keyRef.down = true;

          if (!released || released < pressed) {
            return;
          }

          return (Date.now() - released) * -1;
        } else if (this.codes[i] > -this.maxDecay) {
          keyRef.frames = this.codes[i]--;
          keyRef.time = released - Date.now();
          keyRef.down = false;
        } else {
          keyRef.frames = 0;
          keyRef.time = 0;
          keyRef.down = false;
          delete this.codes[i];
        }
      }

      for (var i in this.whichs) {
        if (this.whichs[i] > 0) {
          this.whichs[i]++;
        } else if (this.whichs[i] > -this.maxDecay) {
          this.whichs[i]--;
        } else {
          delete this.whichs[i];
        }
      }
    }
  }]);

  return Keyboard;
}();

exports.Keyboard = Keyboard;
  })();
});

require.register("curvature/mixin/EventTargetMixin.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventTargetMixin = void 0;

var _Mixin = require("../base/Mixin");

var _EventTargetMixin;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _EventTarget = Symbol('Target');

var EventTargetMixin = (_EventTargetMixin = {}, _defineProperty(_EventTargetMixin, _Mixin.Mixin.Constructor, function () {
  try {
    this[_EventTarget] = new EventTarget();
  } catch (error) {
    this[_EventTarget] = document.createDocumentFragment();
  }
}), _defineProperty(_EventTargetMixin, "dispatchEvent", function dispatchEvent() {
  var _this$_EventTarget;

  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var event = args[0];

  (_this$_EventTarget = this[_EventTarget]).dispatchEvent.apply(_this$_EventTarget, args);

  var defaultHandler = "on".concat(event.type[0].toUpperCase() + event.type.slice(1));

  if (typeof this[defaultHandler] === 'function') {
    this[defaultHandler](event);
  }

  return event.returnValue;
}), _defineProperty(_EventTargetMixin, "addEventListener", function addEventListener() {
  var _this$_EventTarget2;

  (_this$_EventTarget2 = this[_EventTarget]).addEventListener.apply(_this$_EventTarget2, arguments);
}), _defineProperty(_EventTargetMixin, "removeEventListener", function removeEventListener() {
  var _this$_EventTarget3;

  (_this$_EventTarget3 = this[_EventTarget]).removeEventListener.apply(_this$_EventTarget3, arguments);
}), _EventTargetMixin);
exports.EventTargetMixin = EventTargetMixin;
  })();
});

require.register("curvature/mixin/PromiseMixin.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PromiseMixin = void 0;

var _Mixin = require("../base/Mixin");

var _PromiseMixin;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _Promise = Symbol('Promise');

var Accept = Symbol('Accept');
var Reject = Symbol('Reject');
var PromiseMixin = (_PromiseMixin = {}, _defineProperty(_PromiseMixin, _Mixin.Mixin.Constructor, function () {
  var _this = this;

  this[_Promise] = new Promise(function (accept, reject) {
    _this[Accept] = accept;
    _this[Reject] = reject;
  });
}), _defineProperty(_PromiseMixin, "then", function then() {
  var _this$_Promise;

  return (_this$_Promise = this[_Promise]).then.apply(_this$_Promise, arguments);
}), _defineProperty(_PromiseMixin, "catch", function _catch() {
  var _this$_Promise2;

  return (_this$_Promise2 = this[_Promise])["catch"].apply(_this$_Promise2, arguments);
}), _defineProperty(_PromiseMixin, "finally", function _finally() {
  var _this$_Promise3;

  return (_this$_Promise3 = this[_Promise])["finally"].apply(_this$_Promise3, arguments);
}), _PromiseMixin);
exports.PromiseMixin = PromiseMixin;
Object.defineProperty(PromiseMixin, 'Reject', {
  value: Reject
});
Object.defineProperty(PromiseMixin, 'Accept', {
  value: Accept
});
  })();
});
require.register("World.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.World = void 0;

var _Bag = require("curvature/base/Bag");

var _Bindable = require("curvature/base/Bindable");

var _TileMap = require("tileMap/TileMap");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var World = /*#__PURE__*/function () {
  function World() {
    var _this = this;

    _classCallCheck(this, World);

    _defineProperty(this, "tileMap", new _TileMap.TileMap());

    this.viewports = new _Bag.Bag(function (i, s, a) {
      switch (a) {
        case BAG.ITEM_ADDED:
          i.world = _this;
          break;

        case BAG.ITEM_REMOVED:
          i.world = null;
          break;
      }
    });
    this.actors = new _Bag.Bag(function (i, s, a) {
      switch (a) {
        case BAG.ITEM_ADDED:
          i.world = _this;
          break;

        case BAG.ITEM_REMOVED:
          i.world = null;
          break;
      }
    });
  }

  _createClass(World, [{
    key: "getOnScreenObjects",
    value: function getOnScreenObjects(tolerance) {}
  }, {
    key: "update",
    value: function update() {}
  }]);

  return World;
}();

exports.World = World;

_defineProperty(World, "globals", _Bindable.Bindable.make({}));
});

;require.register("actor/BrokenMonitor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BrokenMonitor = void 0;

var _PointActor2 = require("./PointActor");

var _Explosion = require("../actor/Explosion");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

// import { BrokenMonitor } from '../actor/BrokenMonitor';
var BrokenMonitor = /*#__PURE__*/function (_PointActor) {
  _inherits(BrokenMonitor, _PointActor);

  var _super = _createSuper(BrokenMonitor);

  function BrokenMonitor() {
    var _this;

    _classCallCheck(this, BrokenMonitor);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-monitor actor-monitor-broken';
    _this.args.width = 28;
    _this.args.height = 32;
    return _this;
  }

  _createClass(BrokenMonitor, [{
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(BrokenMonitor.prototype), "update", this).call(this);

      if (!this.restingOn) {
        this.debindYs && this.debindYs();
        this.debindXs && this.debindXs();
        this.debindGs && this.debindGs();
        this.debindX && this.debindX();
        this.debindY && this.debindY();
      }
    }
  }, {
    key: "collideA",
    value: function collideA(other) {
      _get(_getPrototypeOf(BrokenMonitor.prototype), "collideA", this).call(this, other);

      if (this.args["float"] === -1 && this.args.collType === 'collision-bottom') {
        this.args["float"] = 1;
        var maxBounce = 6;
        var speed = other.args.ySpeed;

        if (Math.abs(speed) < maxBounce) {
          this.args.ySpeed = speed;
        } else {
          this.args.ySpeed = -maxBounce;
        }

        other.args.ySpeed = 0;
        return true;
      }

      return true;
    }
  }, {
    key: "collideB",
    value: function collideB(other) {
      var _this2 = this;

      _get(_getPrototypeOf(BrokenMonitor.prototype), "collideB", this).call(this, other);

      if (this.restingOn) {
        return true;
      }

      if (other.solid && this.args.collType === 'collision-bottom' && other.y > this.y) {
        this.debindYs && this.debindYs();
        this.debindXs && this.debindXs();
        this.debindGs && this.debindGs();
        this.debindX && this.debindX();
        this.debindY && this.debindY();
        this.restingOn = other;
        this.debindYs = other.args.bindTo('ySpeed', function (v) {
          return _this2.args.gSpeed = v;
        });
        this.debindXs = other.args.bindTo('xSpeed', function (v) {
          return _this2.args.gSpeed = v;
        });
        this.debindGs = other.args.bindTo('gSpeed', function (v) {
          return _this2.args.gSpeed = v;
        });
        this.debindX = other.args.bindTo('x', function (v) {
          return _this2.args.x = v;
        });
        this.debindY = other.args.bindTo('y', function (v) {
          return _this2.args.y = v - _this2.args.height;
        });
        this.onRemove(function () {
          _this2.debindYs && _this2.debindYs();
          _this2.debindXs && _this2.debindXs();
          _this2.debindGs && _this2.debindGs();
          _this2.debindX && _this2.debindX();
          _this2.debindY && _this2.debindY();
        });
      }

      return true;
    }
  }, {
    key: "canStick",
    get: function get() {
      return false;
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }]);

  return BrokenMonitor;
}(_PointActor2.PointActor);

exports.BrokenMonitor = BrokenMonitor;
});

;require.register("actor/Explosion.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Explosion = void 0;

var _PointActor2 = require("./PointActor");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Explosion = /*#__PURE__*/function (_PointActor) {
  _inherits(Explosion, _PointActor);

  var _super = _createSuper(Explosion);

  function Explosion() {
    var _this;

    _classCallCheck(this, Explosion);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-explosion';
    _this.args.width = 48;
    _this.args.height = 48;
    _this.args["float"] = -1;
    _this.removeTimer = null;
    return _this;
  }

  _createClass(Explosion, [{
    key: "update",
    value: function update() {
      var _this2 = this;

      _get(_getPrototypeOf(Explosion.prototype), "update", this).call(this);

      if (!this.removeTimer) {
        this.removeTimer = this.onTimeout(240, function () {
          _this2.viewport.actors.remove(_this2);
        });
      }
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return true;
    }
  }]);

  return Explosion;
}(_PointActor2.PointActor);

exports.Explosion = Explosion;
});

;require.register("actor/Monitor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Monitor = void 0;

var _PointActor2 = require("./PointActor");

var _Explosion = require("../actor/Explosion");

var _BrokenMonitor = require("../actor/BrokenMonitor");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Monitor = /*#__PURE__*/function (_PointActor) {
  _inherits(Monitor, _PointActor);

  var _super = _createSuper(Monitor);

  function Monitor() {
    var _this;

    _classCallCheck(this, Monitor);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-monitor';
    _this.args.width = 28;
    _this.args.height = 32;
    return _this;
  }

  _createClass(Monitor, [{
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(Monitor.prototype), "update", this).call(this);

      if (!this.restingOn) {
        this.debindYs && this.debindYs();
        this.debindXs && this.debindXs();
        this.debindGs && this.debindGs();
        this.debindX && this.debindX();
        this.debindY && this.debindY();
      }
    }
  }, {
    key: "collideA",
    value: function collideA(other) {
      var _this2 = this;

      _get(_getPrototypeOf(Monitor.prototype), "collideA", this).call(this, other);

      if (this.args["float"] === -1 && this.args.collType === 'collision-bottom') {
        this.args["float"] = 1;
        var maxBounce = 6;
        var speed = other.args.ySpeed;

        if (Math.abs(speed) < maxBounce) {
          this.args.ySpeed = speed;
        } else {
          this.args.ySpeed = -maxBounce;
        }

        other.args.ySpeed = 0;
        return true;
      } else if ((!this.args.falling || this.args["float"] === -1) && (Math.abs(other.args.xSpeed) > 64 || Math.abs(other.args.gSpeed) > 64 || other.args.ySpeed > 1 && other.y < this.y) && this.viewport && !this.gone) {
        // other.args.xSpeed *= -1;
        other.args.ySpeed *= -1;
        var viewport = this.viewport;
        viewport.actors.add(new _Explosion.Explosion({
          x: this.x,
          y: this.y + 8
        }));

        if (Math.abs(other.args.xSpeed) > 64 || Math.abs(other.args.gSpeed) > 64) {
          viewport.actors.remove(this);
          viewport.actors.add(new _BrokenMonitor.BrokenMonitor({
            x: this.x,
            y: this.y + 1
          }));
        } else {
          this.onTimeout(60, function () {
            viewport.actors.remove(_this2);
            viewport.actors.add(new _BrokenMonitor.BrokenMonitor({
              x: _this2.x,
              y: _this2.y + 1
            }));
          });
        }

        return false;
      }

      return true;
    }
  }, {
    key: "collideB",
    value: function collideB(other) {
      var _this3 = this;

      _get(_getPrototypeOf(Monitor.prototype), "collideB", this).call(this, other);

      if (this.restingOn) {
        return true;
      }

      if (other.solid && this.args.collType === 'collision-bottom' && other.y > this.y) {
        this.debindYs && this.debindYs();
        this.debindXs && this.debindXs();
        this.debindGs && this.debindGs();
        this.debindX && this.debindX();
        this.debindY && this.debindY();
        this.restingOn = other;
        this.debindYs = other.args.bindTo('ySpeed', function (v) {
          return _this3.args.gSpeed = v;
        });
        this.debindXs = other.args.bindTo('xSpeed', function (v) {
          return _this3.args.gSpeed = v;
        });
        this.debindGs = other.args.bindTo('gSpeed', function (v) {
          return _this3.args.gSpeed = v;
        });
        this.debindX = other.args.bindTo('x', function (v) {
          return _this3.args.x = v;
        });
        this.debindY = other.args.bindTo('y', function (v) {
          return _this3.args.y = v - _this3.args.height;
        });
        this.onRemove(function () {
          _this3.debindYs && _this3.debindYs();
          _this3.debindXs && _this3.debindXs();
          _this3.debindGs && _this3.debindGs();
          _this3.debindX && _this3.debindX();
          _this3.debindY && _this3.debindY();
        });
      }

      return true;
    }
  }, {
    key: "canStick",
    get: function get() {
      return false;
    }
  }, {
    key: "solid",
    get: function get() {
      return true;
    }
  }]);

  return Monitor;
}(_PointActor2.PointActor);

exports.Monitor = Monitor;
});

;require.register("actor/PointActor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PointActor = void 0;

var _View2 = require("curvature/base/View");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MODE_FLOOR = 0;
var MODE_LEFT = 1;
var MODE_CEILING = 2;
var MODE_RIGHT = 3;
var WALKING_SPEED = 128;
var RUNNING_SPEED = 2 * WALKING_SPEED;
var CRAWLING_SPEED = 1;
var JUMP_FORCE = 16;
var DEFAULT_GRAVITY = MODE_FLOOR;

var PointActor = /*#__PURE__*/function (_View) {
  _inherits(PointActor, _View);

  var _super = _createSuper(PointActor);

  function PointActor() {
    var _this;

    _classCallCheck(this, PointActor);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", "<div\n\t\tclass = \"point-actor [[type]] [[collType]]\"\n\t\tstyle = \"\n\t\t\t--angle:[[angle]];\n\t\t\t--airAngle:[[airAngle]];\n\t\t\t--debugVector:[[debugVector]];\n\t\t\t--height:[[height]];\n\t\t\t--width:[[width]];\n\t\t\t--x:[[x]];\n\t\t\t--y:[[y]];\n\t\t\"\n\t\tdata-colliding = \"[[colliding]]\"\n\t\tdata-falling   = \"[[falling]]\"\n\t\tdata-facing    = \"[[facing]]\"\n\t\tdata-angle     = \"[[angle|rad2deg]]\"\n\t\tdata-mode      = \"[[mode]]\"\n\t></div>");

    _this.args.type = 'actor-generic';
    _this.args.x = _this.args.x || 1024 + 256;
    _this.args.y = _this.args.y || 32;
    _this.args.width = 1;
    _this.args.height = 1;
    _this.args.direction = 1;
    _this.args.maxGSpeed = WALKING_SPEED;
    _this.args.gSpeed = 0;
    _this.args.xSpeed = 0;
    _this.args.ySpeed = 0;
    _this.args.angle = 0;
    _this.args.xSpeedMax = 256;
    _this.args.ySpeedMax = 256;
    _this.maxStep = 4;
    _this.backStep = 0;
    _this.frontStep = 0;
    _this.args.falling = true;
    _this.args.running = false;
    _this.args.crawling = false;
    _this.args.mode = DEFAULT_GRAVITY;
    _this.xAxis = 0;
    _this.yAxis = 0;
    _this.willStick = false;
    _this.stayStuck = false;
    _this.args.ignore = _this.args.ignore || 0;
    _this.args["float"] = _this.args["float"] || 0;
    _this.colliding = false;

    _this.args.bindTo(['xSpeed'], function (v) {
      _this.args.airAngle = Math.atan2(_this.args.ySpeed, v);
    });

    _this.args.bindTo(['ySpeed'], function (v) {
      _this.args.airAngle = Math.atan2(v, _this.args.xSpeed);
    });

    return _this;
  }

  _createClass(PointActor, [{
    key: "updateStart",
    value: function updateStart() {
      this.colliding = false;
    }
  }, {
    key: "updateEnd",
    value: function updateEnd() {
      this.restingOn = null;
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;

      if (this.args.ignore > 0) {
        this.args.ignore--;
      }

      if (this.args["float"] > 0) {
        this.args["float"]--;
      }

      if (this.running) {
        this.args.maxGSpeed = RUNNING_SPEED;
      } else if (this.crawling) {
        this.args.maxGSpeed = CRAWLING_SPEED;
      } else {
        this.args.maxGSpeed = WALKING_SPEED;
      }

      if (this.args.ignore < 1) {
        this.args.ignore = 0;
      }

      var tileMap = this.viewport.tileMap;

      if (this.args.falling) {
        this.args.landed = false;
      }

      var offset;

      switch (this.args.mode) {
        case MODE_FLOOR:
          offset = [0, 1];
          break;

        case MODE_RIGHT:
          offset = [1, 0];
          break;

        case MODE_CEILING:
          offset = [0, -1];
          break;

        case MODE_LEFT:
          offset = [-1, 0];
          break;
      }

      if (!this.isEffect && this.args.falling) {
        var lastPoint = [this.x, this.y];
        var airSpeed = Math.sqrt(Math.pow(this.args.xSpeed, 2) + Math.pow(this.args.ySpeed, 2));
        var airPoint = this.castRay(airSpeed, this.args.airAngle, function (i, point) {
          var _this2$viewport;

          var actors = (_this2$viewport = _this2.viewport).actorsAtPoint.apply(_this2$viewport, _toConsumableArray(point)).filter(function (x) {
            return x !== _this2;
          }).filter(function (x) {
            return x.collideA(_this2);
          }).filter(function (x) {
            return x !== x.isSolid && x.canStick;
          });

          if (actors.length > 0) {
            console.log(i, lastPoint);
            return lastPoint;
          }

          var tile = tileMap.coordsToTile.apply(tileMap, _toConsumableArray(point));
          var tileNo = tileMap.getTileNumber.apply(tileMap, _toConsumableArray(tile));

          if (!tileNo) {
            lastPoint = point.map(Math.floor);
            return;
          }

          if (tileMap.getSolid.apply(tileMap, [tileNo].concat(_toConsumableArray(point)))) {
            return lastPoint;
          }

          lastPoint = point.map(Math.floor);
        });
        this.willJump = false;
        var blockers = false;
        var upDistance = this.castRay(Math.abs(this.args.ySpeed) + 1, this.upAngle, function (i, point) {
          var _this2$viewport2;

          var actors = (_this2$viewport2 = _this2.viewport).actorsAtPoint.apply(_this2$viewport2, _toConsumableArray(point)).filter(function (x) {
            return x !== _this2;
          }).filter(function (x) {
            return x.collideA(_this2);
          }).filter(function (a) {
            return a.solid;
          });

          if (actors.length > 0) {
            return i;
          }

          var tile = tileMap.coordsToTile.apply(tileMap, _toConsumableArray(point));
          var tileNo = tileMap.getTileNumber.apply(tileMap, _toConsumableArray(tile));

          if (!tileNo) {
            return;
          }

          if (tileMap.getSolid.apply(tileMap, [tileNo].concat(_toConsumableArray(point)))) {
            return i;
          }
        });
        var xSpeedOriginal = this.args.xSpeed;
        var ySpeedOriginal = this.args.ySpeed;

        if (this.args.ySpeed < 0 && upDistance !== false) {
          this.args.ignore = 1;
          this.args.y -= Math.floor(upDistance - 1);
          blockers = this.getMapSolidAt(this.x, this.y);

          if (Array.isArray(blockers)) {
            var stickers = blockers.filter(function (a) {
              return a.canStick;
            });
            console.log(blockers);

            if (this.willStick && stickers.length) {
              this.args.gSpeed = Math.floor(-xSpeedOriginal);
              this.args.mode = MODE_CEILING;
              this.args.falling = false;
            } else {
              console.log('Item ceiling bounce');
              this.args.ySpeed = -Math.abs(this.args.ySpeed);
            }
          } else if (this.willStick) {
            this.args.gSpeed = Math.floor(-xSpeedOriginal);
            this.args.mode = MODE_CEILING;
            this.args.falling = false;
          } else {
            console.log('Ceiling bounce');
            this.args.ySpeed = -Math.abs(this.args.ySpeed);
          }

          console.log(this.args.ySpeed, blockers);
        } else if (airPoint !== false) {
          this.args.ignore = 1;
          var direction = Math.sign(this.args.xSpeed);
          this.args.xSpeed = 0;
          this.args.ySpeed = 0;
          this.args.x = Math.floor(airPoint[0]);
          this.args.y = Math.floor(airPoint[1]);
          blockers = this.getMapSolidAt(this.x + direction, this.y);

          if (!blockers) {
            this.args.gSpeed = Math.floor(xSpeedOriginal);
            this.args.mode = MODE_FLOOR;
            this.args.falling = false;
          } else if (Array.isArray(blockers)) {
            blockers = blockers.filter(function (a) {
              return a.collideA(_this2);
            });

            if (blockers.length && this.willStick) {
              if (blockers.filter(function (a) {
                return a.canStick;
              })) {
                this.args.falling = false;
                this.args.gSpeed = Math.floor(ySpeedOriginal * -direction);
                this.args.mode = direction < 0 ? MODE_LEFT : MODE_RIGHT;
              }
            }
          } else if (this.willStick) {
            this.args.falling = false;
            this.args.gSpeed = Math.floor(ySpeedOriginal * -direction);
            this.args.mode = direction < 0 ? MODE_LEFT : MODE_RIGHT;
          }
        } else if (this.args.ySpeed > 0) {
          this.args.mode = DEFAULT_GRAVITY;
          this.args.gSpeed = Math.floor(xSpeedOriginal);
        }

        if (airPoint === false) {
          this.args.x += this.args.xSpeed;
          this.args.y += this.args.ySpeed;
          this.args.falling = true;
        }
      }

      if (Math.abs(this.args.xSpeed) > this.args.xSpeedMax) {
        this.args.xSpeed = this.args.xSpeedMax * Math.sign(this.args.xSpeed);
      }

      if (Math.abs(this.args.ySpeed) > this.args.ySpeedMax) {
        this.args.ySpeed = this.args.ySpeedMax * Math.sign(this.args.ySpeed);
      }

      var nextPosition = [0, 0];

      if (!this.isEffect && !this.args.falling) {
        if (this.args.gSpeed) {
          var max = Math.abs(this.args.gSpeed);
          var step = Math.ceil(max / 16);

          var _direction = Math.sign(this.args.gSpeed);

          for (var s = 0; s < max; s += step) {
            nextPosition = this.findNextStep(step * _direction);

            if (step && nextPosition[2] === true) {
              nextPosition[0] = step;
              nextPosition[1] = 0;
              this.args.ySpeed = 0;

              switch (this.args.mode) {
                case MODE_FLOOR:
                  this.args.xSpeed = this.args.gSpeed;
                  this.args.falling = true;
                  break;

                case MODE_RIGHT:
                  // this.args.ySpeed = this.args.gSpeed;
                  break;

                case MODE_CEILING:
                  this.args.xSpeed = -this.args.gSpeed;
                  this.args.falling = true;
                  break;

                case MODE_LEFT:
                  this.args.mode = MODE_FLOOR;
                  this.args.y--;
                  this.args.x += this.args.direction; // this.args.ySpeed = -this.args.gSpeed;

                  break;
              }

              this.args.gSpeed = 0;
              break;
            } else if (!nextPosition[0] && !nextPosition[1]) {
              switch (this.args.mode) {
                case MODE_FLOOR:
                case MODE_CEILING:
                  this.args.gSpeed = 0;
                  break;

                case MODE_LEFT:
                case MODE_RIGHT:
                  break;
              }
            } else if (nextPosition[1] !== false) {
              this.args.angle = nextPosition[0] ? Math.atan(nextPosition[1] / nextPosition[0]) : nextPosition[1] > 0 ? Math.PI / 2 : -Math.PI / 2;
            }

            switch (this.args.mode) {
              case MODE_FLOOR:
                this.args.x += nextPosition[0];
                this.args.y -= nextPosition[1];
                break;

              case MODE_CEILING:
                this.args.x -= nextPosition[0];
                this.args.y += nextPosition[1];
                break;

              case MODE_LEFT:
                this.args.x += nextPosition[1];
                this.args.y += nextPosition[0];
                break;

              case MODE_RIGHT:
                this.args.x -= nextPosition[1];
                this.args.y -= nextPosition[0];
                break;
            }

            if (this.args.angle > Math.PI / 4 && this.args.angle < Math.PI / 2) {
              switch (this.args.mode) {
                case MODE_FLOOR:
                  this.args.mode = MODE_RIGHT;
                  break;

                case MODE_RIGHT:
                  this.args.mode = MODE_CEILING;
                  break;

                case MODE_CEILING:
                  this.args.mode = MODE_LEFT;
                  break;

                case MODE_LEFT:
                  this.args.mode = MODE_FLOOR;
                  break;
              }

              this.args.angle -= Math.PI / 8 * 3;
            } else if (this.args.angle < -Math.PI / 4 && this.args.angle > -Math.PI / 2) {
              var orig = this.args.mode;

              switch (this.args.mode) {
                case MODE_FLOOR:
                  this.args.mode = MODE_LEFT;
                  break;

                case MODE_RIGHT:
                  this.args.mode = MODE_FLOOR;
                  break;

                case MODE_CEILING:
                  this.args.mode = MODE_RIGHT;
                  break;

                case MODE_LEFT:
                  this.args.mode = MODE_CEILING;
                  break;
              }

              this.args.angle += Math.PI / 8 * 3;
            }
          }
        } else {
          var sensorSpread = 3;
          var backPosition = this.findNextStep(-sensorSpread);
          var forePosition = this.findNextStep(sensorSpread);

          if (nextPosition[0] === false && nextPosition[1] === false) {
            this.args.falling = true;
          }

          if (nextPosition[1] !== false) {
            this.args.angle = Math.atan2(forePosition[1] - backPosition[1], sensorSpread * 2 + 1);
          }
        }

        if (this.willJump) {
          this.willJump = false;
          this.doJump();
        }

        if (this.args.gSpeed === 0) {
          if (!this.stayStuck) {
            var currentTile = tileMap.coordsToTile(this.x, this.y + 1);
            var currentTileNo = tileMap.getTileNumber.apply(tileMap, _toConsumableArray(currentTile));

            if (!tileMap.getSolid(currentTileNo, this.x, this.y + 1)) {
              this.args.mode = DEFAULT_GRAVITY;
            }
          }
        }

        this.args.landed = true;
      }

      this.args.x = Math.floor(this.args.x);
      this.args.y = Math.floor(this.args.y);

      if (this.args.ignore < 1) {
        this.args.ignore = 0;
      }

      if (nextPosition[0] !== false || nextPosition[1] !== false) {
        if (Math.abs(this.args.gSpeed) > this.args.maxGSpeed) {
          this.args.gSpeed = this.args.maxGSpeed * Math.sign(this.args.gSpeed);
        }
      } else {
        this.args.ignore = this.args.ignore || 1;
        this.args.gSpeed = 0;
      }

      if (this.args.ignore === 0) {
        if (!this.args.falling) {
          if (this.xAxis) {
            if (this.args.gSpeed < this.args.maxGSpeed && this.args.gSpeed > -this.args.maxGSpeed) {
              this.args.gSpeed += this.xAxis;
            }
          } else if (this.args.gSpeed > 0) {
            this.args.gSpeed--;
          } else if (this.args.gSpeed < 0) {
            this.args.gSpeed++;
          }
        } else if (this.xAxis) {
          this.args.xSpeed += this.xAxis * 0.8;
        }
      }

      if (!this.isEffect) {
        var backAngle = this.args.airAngle;

        if (this.args.airAngle > 0) {
          backAngle -= Math.PI;
        } else {
          backAngle += Math.PI;
        }

        var testX = this.x;
        var testY = this.y;

        if (this.getMapSolidAt(testX, testY)) {
          this.args.ignore = 1;

          var _blockers;

          while (true) {
            _blockers = this.getMapSolidAt(testX, testY);

            if (!_blockers) {
              break;
            }

            if (Array.isArray(_blockers)) {
              _blockers = _blockers.filter(function (x) {
                return x !== _this2;
              }).filter(function (x) {
                return x.collideA(_this2);
              });

              if (!_blockers.length) {
                break;
              }
            }

            if (!this.args.xSpeed && !this.args.ySpeed) {
              testY--;
            } else {
              testX += Math.cos(backAngle);
              testY += Math.sin(backAngle);
            }
          }

          this.args.falling = false;
          this.args.x = testX;
          this.args.y = testY;
          this.willJump = false;
        }
      }

      var scanDown = this.castRay(4, this.downAngle, function (i, point) {
        var _this2$viewport3;

        var actors = (_this2$viewport3 = _this2.viewport).actorsAtPoint.apply(_this2$viewport3, _toConsumableArray(point)).filter(function (x) {
          return x !== _this2;
        }).filter(function (a) {
          return a.collideA(_this2);
        }).filter(function (x) {
          return x.solid;
        });

        if (actors.length > 0) {
          return i;
        }

        var tile = tileMap.coordsToTile.apply(tileMap, _toConsumableArray(point));
        var tileNo = tileMap.getTileNumber.apply(tileMap, _toConsumableArray(tile));

        if (!tileNo) {
          return;
        }

        if (tileMap.getSolid.apply(tileMap, [tileNo].concat(_toConsumableArray(point)))) {
          return i;
        }
      });

      if (!this.args.falling && (scanDown === false || scanDown > 1)) {
        this.args.falling = true;
        this.args.xSpeed = 0; //-1 * Math.sign(this.args.xSpeed);

        this.args.ySpeed = 0;
        this.args.ignore = 6;
      }

      this.args.debugVector = this.args.angle;

      if (this.args.falling && !this.args["float"] && this.args.ySpeed < this.args.ySpeedMax) {
        this.args.ySpeed++;
        this.args.debugVector = this.args.airAngle;
        this.args.landed = false;
      }

      if (this.xAxis < 0) {
        this.args.facing = 'left';
        this.args.direction = -1;
      }

      if (this.xAxis > 0) {
        this.args.facing = 'right';
        this.args.direction = 1;
      }

      this.args.colliding = this.colliding;
    }
  }, {
    key: "collideA",
    value: function collideA(other) {
      if (other.y <= this.y - this.args.height) {
        this.args.collType = 'collision-top';
      } else if (other.x < this.x - Math.floor(this.args.width / 2)) {
        this.args.collType = 'collision-left';
      } else if (other.x >= this.x + Math.floor(this.args.width / 2)) {
        this.args.collType = 'collision-right';
      } else if (other.y >= this.y) {
        this.args.collType = 'collision-bottom';
      }

      this.colliding = true;
      other.collideB(this);
    }
  }, {
    key: "collideB",
    value: function collideB(other) {
      if (other.y <= this.y - this.args.height) {
        this.args.collType = 'collision-top';
      } else if (other.x < this.x - Math.floor(this.args.width / 2)) {
        this.args.collType = 'collision-left';
      } else if (other.x >= this.x + Math.floor(this.args.width / 2)) {
        this.args.collType = 'collision-right';
      } else if (other.y >= this.y) {
        this.args.collType = 'collision-bottom';
      }

      this.colliding = true;
    }
  }, {
    key: "findNextStep",
    value: function findNextStep(offset) {
      var _this3 = this;

      var sign = Math.sign(offset);
      var downFirstSolid;
      var upFirstSpace;
      var col = 0;
      var tileMap = this.viewport.tileMap;
      var retVal = false;
      var currentLevel = 0;
      var prevUp = 0;
      var isCliff = false;

      for (; col < Math.abs(offset); col++) {
        downFirstSolid = false;
        upFirstSpace = false;
        var offsetPoint = void 0;

        switch (this.args.mode) {
          case MODE_FLOOR:
            offsetPoint = [(1 + col) * sign, 1];
            break;

          case MODE_RIGHT:
            offsetPoint = [1, -(1 + col) * sign];
            break;

          case MODE_CEILING:
            offsetPoint = [-(1 + col) * sign, -1];
            break;

          case MODE_LEFT:
            offsetPoint = [-1, (1 + col) * sign];
            break;
        }

        downFirstSolid = this.castRay(this.maxStep * (1 + col), this.downAngle, offsetPoint, function (i, point) {
          var _this3$viewport;

          var actors = (_this3$viewport = _this3.viewport).actorsAtPoint.apply(_this3$viewport, _toConsumableArray(point)).filter(function (x) {
            return x !== _this3;
          }).filter(function (a) {
            return a.collideA(_this3);
          }).filter(function (x) {
            return x.solid;
          });

          if (actors.length > 0) {
            return i;
          }

          var tile = tileMap.coordsToTile.apply(tileMap, _toConsumableArray(point));
          var tileNo = tileMap.getTileNumber.apply(tileMap, _toConsumableArray(tile));

          if (!tileNo) {
            return;
          }

          if (tileMap.getSolid.apply(tileMap, [tileNo].concat(_toConsumableArray(point)))) {
            return i;
          }
        });

        if (downFirstSolid === false) {
          return [col * sign, false, true];
        } else {// currentLevel += downFirstSolid;
        }

        if (downFirstSolid === 0) {
          var _offsetPoint = void 0;

          switch (this.args.mode) {
            case MODE_FLOOR:
              _offsetPoint = [(1 + col) * sign, 0];
              break;

            case MODE_RIGHT:
              _offsetPoint = [0, -(1 + col) * sign];
              break;

            case MODE_CEILING:
              _offsetPoint = [-(1 + col) * sign, 0];
              break;

            case MODE_LEFT:
              _offsetPoint = [0, (1 + col) * sign];
              break;
          }

          var upLength = this.maxStep * (1 + col);
          upFirstSpace = this.castRay(upLength, this.upAngle, _offsetPoint, function (i, point) {
            var _this3$viewport2;

            var actors = (_this3$viewport2 = _this3.viewport).actorsAtPoint.apply(_this3$viewport2, _toConsumableArray(point)).filter(function (x) {
              return x !== _this3;
            }).filter(function (a) {
              return a.collideA(_this3);
            }).filter(function (x) {
              return x.solid;
            });

            if (actors.length === 0) {
              var tile = tileMap.coordsToTile.apply(tileMap, _toConsumableArray(point));
              var tileNo = tileMap.getTileNumber.apply(tileMap, _toConsumableArray(tile));

              if (!tileNo) {
                return i;
              }

              if (!tileMap.getSolid.apply(tileMap, [tileNo].concat(_toConsumableArray(point)))) {
                return i;
              }
            }
          });

          if (upFirstSpace === false || Math.abs(prevUp - upFirstSpace) > this.maxStep) {
            return [col * sign, false, false, currentLevel];
          } else {
            currentLevel -= upFirstSpace;
            prevUp = upFirstSpace;
          }
        }
      }

      if (upFirstSpace !== false) {
        return [col * sign, upFirstSpace, false, currentLevel];
      }

      return [col * sign, -downFirstSolid, false, currentLevel];
    }
  }, {
    key: "castRay",
    value: function castRay() {
      var length = 1;

      var callback = function callback() {};

      var angle = Math.PI / 2;
      var offset = [0, 0];

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      switch (args.length) {
        case 2:
          length = args[0];
          callback = args[1];
          break;

        case 3:
          length = args[0];
          angle = args[1];
          callback = args[2];
          break;

        case 4:
          length = args[0];
          angle = args[1];
          offset = args[2];
          callback = args[3];
          break;
      }

      var hit = false;

      for (var i = 0; i < Math.floor(length); i++) {
        var bottom = [this.x + offset[0] + i * Math.cos(angle), this.y + offset[1] + i * Math.sin(angle)];
        var retVal = callback(i, bottom);

        if (retVal !== undefined) {
          return retVal;
        }
      }

      return false;
    }
  }, {
    key: "jump",
    value: function jump() {
      if (this.args.falling || this.willJump) {
        return;
      }

      if (!this.willJump) {
        this.willJump = true;
      }
    }
  }, {
    key: "doJump",
    value: function doJump() {
      if (this.args.ignore || this.args.falling || !this.args.landed || this.args["float"]) {
        return;
      }

      var force = JUMP_FORCE;

      if (this.running) {
        force = JUMP_FORCE * 1.5;
      } else if (this.crawling) {
        force = JUMP_FORCE * 0.5;
      }

      var originalMode = this.args.mode;
      this.args.ignore = 1;
      this.args.landed = false;
      this.args.falling = true;

      switch (originalMode) {
        case MODE_FLOOR:
          this.args.xSpeed = this.args.gSpeed * Math.sin(this.args.angle + Math.PI / 2);
          this.args.ySpeed = this.args.gSpeed * Math.cos(this.args.angle + Math.PI / 2);
          this.args.xSpeed += force * Math.cos(this.args.angle + Math.PI / 2);
          this.args.ySpeed -= force * Math.sin(this.args.angle + Math.PI / 2);
          break;

        case MODE_LEFT:
          this.args.xSpeed = -this.args.gSpeed * Math.cos(this.args.angle + Math.PI / 2);
          this.args.ySpeed = this.args.gSpeed * Math.sin(this.args.angle + Math.PI / 2);
          this.args.xSpeed -= force * Math.sin(this.args.angle - Math.PI / 2);
          this.args.ySpeed -= force * Math.cos(this.args.angle - Math.PI / 2);
          break;

        case MODE_CEILING:
          this.args.xSpeed = -this.args.gSpeed * Math.sin(this.args.angle + Math.PI / 2);
          this.args.ySpeed = -this.args.gSpeed * Math.cos(this.args.angle + Math.PI / 2);
          this.args.xSpeed -= force * Math.cos(this.args.angle + Math.PI / 2);
          this.args.ySpeed += force * Math.sin(this.args.angle + Math.PI / 2);
          break;

        case MODE_RIGHT:
          this.args.xSpeed = this.args.gSpeed * Math.cos(this.args.angle + Math.PI / 2);
          this.args.ySpeed = -this.args.gSpeed * Math.sin(this.args.angle + Math.PI / 2);
          this.args.xSpeed += force * Math.sin(this.args.angle - Math.PI / 2);
          this.args.ySpeed += force * Math.cos(this.args.angle - Math.PI / 2);
          break;
      }

      if (Math.abs(this.args.xSpeed) < 0.001) {
        this.args.xSpeed = 0;
      }

      if (Math.abs(this.args.ySpeed) < 0.001) {
        this.args.ySpeed = 0;
      }

      this.args.mode = DEFAULT_GRAVITY;
    }
  }, {
    key: "rad2deg",
    value: function rad2deg(rad) {
      var deg = 180 / Math.PI * rad;

      if (deg > 0) {
        return Math.floor(deg * 10) / 10;
      }

      return Math.ceil(deg * 10) / 10;
    }
  }, {
    key: "roundAngle",
    value: function roundAngle(angle, segments) {
      segments /= 2;
      var rAngle = Math.round(angle / (Math.PI / segments)) * Math.PI / segments;
      return rAngle;
    }
  }, {
    key: "getMapSolidAt",
    value: function getMapSolidAt(x, y) {
      var _this4 = this;

      var actors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var tileMap = this.viewport.tileMap;

      if (actors) {
        var _actors = this.viewport.actorsAtPoint(x, y).filter(function (x) {
          return x !== _this4;
        }).filter(function (x) {
          return x.solid;
        });

        if (_actors.length > 0) {
          return _actors;
        }
      }

      var tile = tileMap.coordsToTile(x, y);
      var tileNo = tileMap.getTileNumber.apply(tileMap, _toConsumableArray(tile));

      if (!tileNo) {
        return false;
      }

      return tileMap.getSolid(tileNo, x, y);
    }
  }, {
    key: "downAngle",
    get: function get() {
      switch (this.args.mode) {
        case MODE_FLOOR:
          return Math.PI / 2;
          break;

        case MODE_RIGHT:
          return 0;
          break;

        case MODE_CEILING:
          return -Math.PI / 2;
          break;

        case MODE_LEFT:
          return Math.PI;
          break;
      }
    }
  }, {
    key: "upAngle",
    get: function get() {
      switch (this.args.mode) {
        case MODE_FLOOR:
          return -Math.PI / 2;
          break;

        case MODE_RIGHT:
          return Math.PI;
          break;

        case MODE_CEILING:
          return Math.PI / 2;
          break;

        case MODE_LEFT:
          return 0;
          break;
      }
    }
  }, {
    key: "leftAngle",
    get: function get() {
      switch (this.args.mode) {
        case MODE_FLOOR:
          return Math.PI;
          break;

        case MODE_RIGHT:
          return -Math.PI / 2;
          break;

        case MODE_CEILING:
          return 0;
          break;

        case MODE_LEFT:
          return Math.PI / 2;
          break;
      }
    }
  }, {
    key: "rightAngle",
    get: function get() {
      switch (this.args.mode) {
        case MODE_FLOOR:
          return 0;
          break;

        case MODE_RIGHT:
          return Math.PI / 2;
          break;

        case MODE_CEILING:
          return Math.PI;
          break;

        case MODE_LEFT:
          return -Math.PI / 2;
          break;
      }
    }
  }, {
    key: "canStick",
    get: function get() {
      return false;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return false;
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "x",
    get: function get() {
      return this.args.x;
    }
  }, {
    key: "y",
    get: function get() {
      return this.args.y;
    }
  }, {
    key: "point",
    get: function get() {
      return [this.args.x, this.args.y];
    }
  }]);

  return PointActor;
}(_View2.View);

exports.PointActor = PointActor;
});

;require.register("actor/QuestionBlock.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuestionBlock = void 0;

var _PointActor2 = require("./PointActor");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var QuestionBlock = /*#__PURE__*/function (_PointActor) {
  _inherits(QuestionBlock, _PointActor);

  var _super = _createSuper(QuestionBlock);

  function QuestionBlock() {
    var _this;

    _classCallCheck(this, QuestionBlock);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-question-block';
    _this.args.width = 32;
    _this.args.height = 32;
    _this.args["float"] = -1;
    _this.initY = null;
    return _this;
  }

  _createClass(QuestionBlock, [{
    key: "collideA",
    value: function collideA(other) {
      _get(_getPrototypeOf(QuestionBlock.prototype), "collideA", this).call(this, other);

      if (this.initY === null) {
        this.initY = this.y;
      }

      if (this.args.collType === 'collision-bottom') {
        if (other.args.ySpeed >= 0) {
          if (this.args.ySpeed >= 0) {
            other.args.ySpeed += this.args.ySpeed;
          } else {
            other.args.ySpeed *= 2;
          }

          return true;
        }

        if (this.args.ySpeed) {
          other.args.y = this.y + this.args.height - this.args.ySpeed;
          other.args.ySpeed = -other.args.ySpeed;
          return true;
        }

        var speed = -Math.abs(other.args.ySpeed);
        this.args.ySpeed = speed;
        var ySpeedMax = 12;

        if (Math.abs(speed) > ySpeedMax) {
          this.args.ySpeed = ySpeedMax * Math.sign(speed);
        }

        other.args.ySpeed = -speed;
      }

      return true;
    }
  }, {
    key: "update",
    value: function update() {
      if (this.initY !== null) {
        if (this.initY > this.y) {
          this.args.ySpeed += 1;
        } else if (this.initY < this.y) {
          this.args.ySpeed -= 1;
        }

        if (Math.abs(this.args.y - this.initY) < 1 && Math.abs(this.args.ySpeed) < 0.75) {
          this.args.ySpeed = 0;
          this.args.y = this.initY;
        }
      }

      _get(_getPrototypeOf(QuestionBlock.prototype), "update", this).call(this);

      this.args.ySpeed *= 0.9;
    }
  }, {
    key: "canStick",
    get: function get() {
      return false;
    }
  }, {
    key: "solid",
    get: function get() {
      return true;
    }
  }]);

  return QuestionBlock;
}(_PointActor2.PointActor);

exports.QuestionBlock = QuestionBlock;
});

;require.register("actor/Ring.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ring = void 0;

var _PointActor2 = require("./PointActor");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Ring = /*#__PURE__*/function (_PointActor) {
  _inherits(Ring, _PointActor);

  var _super = _createSuper(Ring);

  function Ring() {
    var _this;

    _classCallCheck(this, Ring);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-ring';
    _this.args.width = 24;
    _this.args.height = 24;
    _this.args["float"] = -1;
    _this.args.gone = false;
    return _this;
  }

  _createClass(Ring, [{
    key: "collideA",
    value: function collideA(other) {
      var _this2 = this;

      _get(_getPrototypeOf(Ring.prototype), "collideA", this).call(this, other);

      if (this.args.gone) {
        return;
      }

      this.args.type = 'actor-item actor-ring collected';

      if (!this.args.gone) {
        this.onTimeout(240, function () {
          _this2.args.type = 'actor-item actor-ring collected gone';
        });
        this.onTimeout(480, function () {
          _this2.viewport.actors.remove(_this2);
        });
      }

      this.args.gone = true;
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return true;
    }
  }]);

  return Ring;
}(_PointActor2.PointActor);

exports.Ring = Ring;
});

;require.register("debug/LineDump.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LineDump = void 0;

var _View2 = require("curvature/base/View");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var LineDump = /*#__PURE__*/function (_View) {
  _inherits(LineDump, _View);

  var _super = _createSuper(LineDump);

  function LineDump() {
    var _this;

    _classCallCheck(this, LineDump);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", "<div class = \"line-dump\" style = \"--x:[[x]];--y:[[y]];--length:[[len]];--angle:[[angle]]\">\n\t\t<div class = \"line\" style = \"border-color:[[color]]\"></div>\n\t</div>");

    _this.args.x = _this.args.x || 0;
    _this.args.y = _this.args.y || 0;
    return _this;
  }

  return LineDump;
}(_View2.View);

exports.LineDump = LineDump;
});

;require.register("debug/PointDump.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PointDump = void 0;

var _View2 = require("curvature/base/View");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PointDump = /*#__PURE__*/function (_View) {
  _inherits(PointDump, _View);

  var _super = _createSuper(PointDump);

  function PointDump() {
    var _this;

    _classCallCheck(this, PointDump);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", "<div class = \"point-dump\" style = \"--x:[[x]];--y:[[y]];\">\n\t\t<div class = \"point\" style = \"--color:[[color]]\"></div>\n\t</div>");

    _this.args.x = _this.args.x || 0;
    _this.args.y = _this.args.y || 0;
    return _this;
  }

  return PointDump;
}(_View2.View);

exports.PointDump = PointDump;
});

;require.register("initialize.js", function(exports, require, module) {
"use strict";

var _Tag = require("curvature/base/Tag");

var _TileMap = require("./tileMap/TileMap");

var _Viewport = require("./viewport/Viewport");

var viewportA = new _Viewport.Viewport(); // const viewportB = new Viewport;

var minFrameTime = 0;
document.addEventListener('DOMContentLoaded', function () {
  viewportA.render(document.body); // viewportB.render(document.body);

  var lastTime = Date.now();
  Promise.all([viewportA.tileMap.ready]).then(function () {
    var body = new _Tag.Tag(document.body);
    var skyShift = 100;
    setInterval(function () {
      return body.style({
        'background-position': "".concat(skyShift++ / 25, "px top, -").concat(skyShift++ / 10, "px 63%, -10% bottom")
      });
    }, 45);
    viewportA.update();

    var update = function update() {
      if (Date.now() - lastTime >= minFrameTime) {
        viewportA.update();
        lastTime = Date.now();
      } // viewportB.update();


      requestAnimationFrame(update);
    };

    update();
  });
});
});

require.register("legacy/Actor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Actor = void 0;

var _View2 = require("curvature/base/View");

var _TileMap = require("../tileMap/TileMap");

var _PointDump = require("../debug/PointDump");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Actor = /*#__PURE__*/function (_View) {
  _inherits(Actor, _View);

  var _super = _createSuper(Actor);

  function Actor() {
    var _this;

    _classCallCheck(this, Actor);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "speed", 15);

    _defineProperty(_assertThisInitialized(_this), "template", require('./actor.html'));

    _this.world = null;
    _this.x = 92;
    _this.y = 1024;
    _this.width = 64;
    _this.height = 64;
    _this.boxWidth = 64;
    _this.boxHeight = 64;
    _this.directions = 16;
    _this.state = 'standing';
    _this.gSpeed = 0; // this.maxGSpeed = 48;

    _this.maxGSpeed = 40;
    _this.xSpeed = 0;
    _this.ySpeed = 0;
    _this.angle = 0;
    _this.maxGravity = 48;
    _this.gravity = 0;
    _this.slopeFactor = 0.01;
    _this.falling = true;
    _this.sensors = {
      top: false,
      bottom: false,
      left: false,
      right: false
    };
    _this.mode = _this.args.mode = 0;
    _this.modes = {
      floor: 0,
      leftWall: 1,
      ceiling: 2,
      rightWall: 3
    };
    _this.animationClasses = {};
    _this.currentClasses = null;
    _this.pdL = new _PointDump.PointDump({
      color: 'red'
    });
    _this.pdR = new _PointDump.PointDump({
      color: 'green'
    });
    _this.args.debugs = [_this.pdL, _this.pdR];
    return _this;
  }

  _createClass(Actor, [{
    key: "destroy",
    value: function destroy() {}
  }, {
    key: "update",
    value: function update() {
      if (!this.tags.actor) {
        return;
      }

      var g = this.gSpeed;
      this.args.animspeed = Math.floor((this.maxGSpeed - Math.abs(g)) / 12);

      if (this.args.animspeed < 1) {
        this.args.animspeed = 1;
      }

      var angle = Math.round(this.angle * 1000) / 1000;

      if (!this.falling) {
        if (angle > Math.PI / 4 && angle < 2 * Math.PI / 4) {
          if (this.mode === this.modes.floor) {
            this.args.mode = this.mode = this.modes.leftWall;
          } else if (this.mode === this.modes.leftWall) {
            this.args.mode = this.mode = this.modes.ceiling;
          } else if (this.mode === this.modes.ceiling) {
            this.args.mode = this.mode = this.modes.rightWall;
          } else if (this.mode === this.modes.rightWall) {
            this.args.mode = this.mode = this.modes.floor;
          }
        }

        if (angle < -Math.PI / 4 && angle > -2 * Math.PI / 4) {
          if (this.mode === this.modes.floor) {
            this.args.mode = this.mode = this.modes.rightWall;
          } else if (this.mode === this.modes.rightWall) {
            this.args.mode = this.mode = this.modes.ceiling;
          } else if (this.mode === this.modes.ceiling) {
            this.args.mode = this.mode = this.modes.leftWall;
          } else if (this.mode === this.modes.leftWall) {
            this.args.mode = this.mode = this.modes.floor;
          }
        }

        if (Math.abs(g) > this.maxGSpeed / 2) {
          this.args.state = 'running';
        } else if (Math.abs(g) > 0) {
          this.args.state = 'walking';
        } else {
          this.args.state = 'standing';
        }

        if (g > 0) {
          this.args.facing = 'facing-right';
        } else {
          this.args.facing = 'facing-left';
        }
      } else if (this.falling || this.jumped) {
        this.args.state = 'jumping';
      }

      if (this.falling) {
        if (this.mode == this.modes.floor) {
          this.ySpeed++;
        } else if (this.mode == this.modes.ceiling) {
          this.ySpeed--;
        } else if (this.mode == this.modes.leftWall) {
          this.xSpeed--;
        } else if (this.mode == this.modes.rightWall) {
          this.xSpeed++;
        }
      } else if (!this.jumped) {
        this.xSpeed = 0;
        this.ySpeed = 0;
      }

      this.x += this.xSpeed;
      this.ySpeed && (this.y += this.ySpeed > 0 ? 1 : -1);

      if (g) {
        var max = 8;
        var abG = Math.abs(g);
        var div = abG > max ? max : abG;

        for (var i = 0; i < div; i++) {
          this.iteratePosition(Math.floor(g / div));
        }
      } else {
        this.iteratePosition(0);
      }

      if (this.ySpeed > 32) {
        this.ySpeed = 32;
      }

      if (this.ySpeed < -32) {
        this.ySpeed = -32;
      }

      if (this.xSpeed > 32) {
        this.xSpeed = 32;
      }

      if (this.xSpeed < -32) {
        this.xSpeed = -32;
      }

      this.tags.actor.style({
        '--x': Math.floor(this.x),
        '--y': Math.floor(this.y)
      });

      if (this.mode === this.modes.floor) {
        this.tags.actor.style({
          '--angle': this.angle
        });
      } else if (this.mode === this.modes.leftWall) {
        this.tags.actor.style({
          '--angle': this.angle + 1 * (Math.PI / 2)
        });
      } else if (this.mode === this.modes.ceiling) {
        this.tags.actor.style({
          '--angle': this.angle + 2 * (Math.PI / 2)
        });
      } else if (this.mode === this.modes.rightWall) {
        this.tags.actor.style({
          '--angle': this.angle + 3 * (Math.PI / 2)
        });
      }

      if (this.jumped) {
        this.jumped = false;
      }
    }
  }, {
    key: "iteratePosition",
    value: function iteratePosition(speed) {
      var sin = Math.sin(this.angle);
      var cos = Math.cos(this.angle);
      var center = this.center;
      var top = this.top;
      var bottom = this.bottom;
      var left = this.left;
      var right = this.right;
      var arm, leg, sensorLeft, sensorRight, sensorSpread;

      if (this.mode == this.modes.floor || this.mode == this.modes.ceiling) {
        arm = right - center[0];
        leg = bottom - center[1];
      } else if (this.mode == this.modes.leftWall || this.mode == this.modes.rightWall) {
        arm = right - center[1];
        leg = bottom - center[0];
      }

      sensorLeft = this.left - arm * sin + arm * 0.5;
      sensorRight = this.right - arm * sin - arm * 0.5;
      sensorSpread = Math.abs(sensorRight - sensorLeft);
      var map = this.viewport.tileMap;
      var leftScan = 0;
      var rightScan = 0;
      var scanLX, scanLY, scanRX, scanRY;
      var leftSolid = false,
          rightSolid = false;
      var height = this.falling ? this.height : this.height;
      var scans = [[-height, 0], [-height, height]];

      regress: for (var i in scans) {
        leftScan = scans[i][0];

        while (leftScan < scans[i][1]) {
          if (this.mode == this.modes.floor) {
            scanLX = sensorLeft;
            scanLY = bottom + leftScan;
          } else if (this.mode == this.modes.ceiling) {
            scanLX = sensorLeft;
            scanLY = bottom - leftScan;
          } else if (this.mode == this.modes.leftWall) {
            scanLX = bottom - leftScan;
            scanLY = sensorLeft;
          } else if (this.mode == this.modes.rightWall) {
            scanLX = bottom + leftScan;
            scanLY = sensorLeft;
          }

          var leftTile = map.coordsToTile(scanLX, scanLY);
          var leftTileNo = map.getTileNumber.apply(map, _toConsumableArray(leftTile));

          if (leftTileNo === false) {
            break;
          }

          leftSolid = map.getSolid(leftTileNo, scanLX, scanLY);

          if (leftSolid) {
            if (leftScan !== 0) {
              break regress;
            }

            break;
          }

          leftScan++;
        }
      }

      regress: for (var _i in scans) {
        rightScan = scans[_i][0];

        while (rightScan < scans[_i][1]) {
          if (this.mode == this.modes.floor) {
            scanRX = sensorRight;
            scanRY = bottom + rightScan;
          } else if (this.mode == this.modes.ceiling) {
            scanRX = sensorRight;
            scanRY = bottom - rightScan;
          } else if (this.mode == this.modes.leftWall) {
            scanRX = bottom - rightScan;
            scanRY = sensorRight;
          } else if (this.mode == this.modes.rightWall) {
            scanRX = bottom + rightScan;
            scanRY = sensorRight;
          }

          var rightTile = map.coordsToTile(scanRX, scanRY);
          var rightTileNo = map.getTileNumber.apply(map, _toConsumableArray(rightTile));

          if (rightTileNo === false) {
            break;
          }

          rightSolid = map.getSolid(rightTileNo, scanRX, scanRY);

          if (rightSolid) {
            break;
          }

          rightScan++;
        }
      }

      this.pdL.args.x = scanLX;
      this.pdL.args.y = scanLY;
      this.pdR.args.x = scanRX;
      this.pdR.args.y = scanRY;
      this.angle = Math.atan((rightScan - leftScan) / sensorSpread);

      if (!this.falling) {
        var offset = (leftScan + rightScan) / 2;

        if (this.mode === this.modes.floor) {
          this.x += speed * cos;
          this.y += speed * sin;
        } else if (this.mode === this.modes.rightWall) {
          this.x += speed * sin;
          this.y -= speed * cos;
        } else if (this.mode === this.modes.ceiling) {
          this.x -= speed * cos;
          this.y -= speed * sin;
        } else if (this.mode === this.modes.leftWall) {
          this.x -= speed * sin;
          this.y += speed * cos;
        }

        if (leftSolid && rightSolid && leftScan <= 0 && rightScan <= 0) {
          if (this.mode == this.modes.floor) {
            this.y += Math.ceil(offset);
          } else if (this.mode == this.modes.ceiling) {
            this.y -= Math.ceil(offset);
          } else if (this.mode == this.modes.leftWall) {
            this.x -= offset;
          } else if (this.mode == this.modes.rightWall) {
            this.x += offset;
          }
        }
      }

      if (leftScan > 0 && rightScan > 0) {
        console.log(leftScan, rightScan);
        this.falling = true;
      } else {
        console.log(leftScan, rightScan);
        this.falling = false;
      }
    }
  }, {
    key: "isColliding",
    value: function isColliding(actor) {}
  }, {
    key: "animate",
    value: function animate(aniation) {}
  }, {
    key: "animate",
    value: function animate() {
      if (!this.animationClasses[animation]) {
        return;
      }

      if (this.currentClasses == this.animationClasses[animation]) {
        return;
      }

      this.currentClasses.map(function (remClass) {
        this.tags.sprite.removeClass(remClass);
      });
      this.animationClasses[animation].map(function (newClass) {
        this.tags.sprite.addClass(newClass);
      });
      this.currentClasses = this.animationClasses[animation];
    }
  }, {
    key: "roundAngle",
    value: function roundAngle(angle, segments) {
      angle = Math.round(angle * (180 / Math.PI));
      var rAngle = "Math.round"(angle / (360 / segments)) * 360 / segments;
      return rAngle * (Math.PI / 180);
    }
  }, {
    key: "goLeft",
    value: function goLeft() {
      if (this.gSpeed > 0) {
        this.gSpeed = 0;
      }

      if (this.gSpeed > -this.maxGSpeed) {
        this.gSpeed--;
      }
    }
  }, {
    key: "goRight",
    value: function goRight() {
      if (this.gSpeed < 0) {
        this.gSpeed = 0;
      }

      if (this.gSpeed < this.maxGSpeed) {
        this.gSpeed++;
      }
    }
  }, {
    key: "slowDown",
    value: function slowDown() {
      if (Math.abs(this.gSpeed) > 32) {
        this.gSpeed = this.gSpeed * 0.95;
      } else {
        this.gSpeed = this.gSpeed * 0.75;
      }

      if (Math.abs(this.gSpeed) <= 0.1) {
        this.gSpeed = 0;
      }
    }
  }, {
    key: "jump",
    value: function jump() {
      if (this.falling) {
        return;
      }

      this.falling = true;
      this.jumped = true;
      this.mode = this.args.mode = this.modes.floor;
      var angle;

      if (this.mode === this.modes.floor) {
        angle = this.angle;
      } else if (this.mode === this.modes.leftWall) {
        angle = this.angle + 1 * (Math.PI / 2);
      } else if (this.mode === this.modes.ceiling) {
        angle = this.angle + 2 * (Math.PI / 2);
      } else if (this.mode === this.modes.rightWall) {
        angle = this.angle + 3 * (Math.PI / 2);
      }

      this.angle = 0;
      this.ySpeed = -Math.cos(angle) * 20;
      this.xSpeed = Math.sin(angle) * 20;

      if (this.mode === this.modes.leftWall || this.mode === this.modes.rightWall) {
        this.gSpeed = 0;
      }
    }
  }, {
    key: "center",
    get: function get() {
      return [this.x + this.boxWidth / 2, this.y + this.boxHeight / 2];
    }
  }, {
    key: "left",
    get: function get() {
      if (this.mode == this.modes.floor) {
        return this.center[0] - this.width / 2;
      } else if (this.mode == this.modes.ceiling) {
        return this.center[0] + this.width / 2;
      } else if (this.mode == this.modes.leftWall) {
        return this.center[1] - this.width / 2;
      } else if (this.mode == this.modes.rightWall) {
        return this.center[1] + this.width / 2;
      }
    }
  }, {
    key: "right",
    get: function get() {
      if (this.mode == this.modes.floor) {
        return this.center[0] + this.width / 2;
      } else if (this.mode == this.modes.ceiling) {
        return this.center[0] - this.width / 2;
      } else if (this.mode == this.modes.leftWall) {
        return this.center[1] + this.width / 2;
      } else if (this.mode == this.modes.rightWall) {
        return this.center[1] - this.width / 2;
      }
    }
  }, {
    key: "top",
    get: function get() {
      if (this.mode == this.modes.floor) {
        return this.center[1] - Math.floor(this.height / 2);
      } else if (this.mode == this.modes.ceiling) {
        return this.center[1] + Math.floor(this.height / 2);
      } else if (this.mode == this.modes.leftWall) {
        return this.center[0] + Math.floor(this.height / 2);
      } else if (this.mode == this.modes.rightWall) {
        return this.center[0] - Math.floor(this.height / 2);
      }
    }
  }, {
    key: "bottom",
    get: function get() {
      if (this.mode == this.modes.floor) {
        return this.center[1] + Math.floor(this.height / 2);
      } else if (this.mode == this.modes.ceiling) {
        return this.center[1] - Math.floor(this.height / 2);
      } else if (this.mode == this.modes.leftWall) {
        return this.center[0] - Math.floor(this.height / 2);
      } else if (this.mode == this.modes.rightWall) {
        return this.center[0] + Math.floor(this.height / 2);
      }
    }
  }]);

  return Actor;
}(_View2.View);

exports.Actor = Actor;
});

;require.register("legacy/Walker.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Walker = void 0;

var _Actor2 = require("./Actor");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Walker = /*#__PURE__*/function (_Actor) {
  _inherits(Walker, _Actor);

  var _super = _createSuper(Walker);

  function Walker() {
    _classCallCheck(this, Walker);

    return _super.apply(this, arguments);
  }

  return Walker;
}(_Actor2.Actor);

exports.Walker = Walker;
});

;require.register("legacy/actor.html", function(exports, require, module) {
module.exports = "<div class = \"actor knuckles [[state]] [[facing]]\" cv-ref = \"actor\" data-mode = \"[[mode]]\" style = \"--animspeed:[[animspeed]]\">\n\t<div class = \"sprite\" cv-ref = \"sprite\" ></div>\n</div>\n<div cv-each = \"debugs:debug\">[[debug]]</div>\n"
});

;require.register("tileMap/TileMap.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TileMap = void 0;

var _Tag = require("curvature/base/Tag");

var _View2 = require("curvature/base/View");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var mapData = {
  "compressionlevel": -1,
  "height": 50,
  "infinite": false,
  "layers": [{
    "data": [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 14, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 19, 18, 2, 2, 2, 2, 2, 2, 2, 2, 2, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 17, 2, 2, 2, 2, 2, 2, 2, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 17, 2, 2, 2, 2, 2, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 17, 2, 2, 2, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 21, 2, 2, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 27, 28, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 20, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 27, 28, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 27, 28, 2, 2, 2, 2, 2, 23, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 27, 28, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 26, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 21, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 20, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 17, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 19, 18, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 14, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 19, 18, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 14, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 17, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 27, 28, 2, 2, 2, 2, 2, 2, 4, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 21, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 27, 28, 2, 2, 4, 5, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 20, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24, 2, 2, 2, 2, 2, 2, 3, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 26, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 21, 2, 2, 2, 2, 2, 2, 2, 2, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 26, 2, 2, 2, 2, 2, 2, 2, 2, 6, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 20, 2, 2, 2, 2, 2, 2, 2, 2, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 2, 2, 2, 2, 2, 2, 2, 2, 7, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 17, 2, 2, 2, 2, 2, 2, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 27, 28, 2, 2, 4, 5, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 19, 18, 2, 2, 14, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24, 2, 2, 2, 2, 2, 2, 3, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 26, 2, 2, 2, 2, 2, 2, 2, 2, 6, 1, 1, 1, 1, 1, 21, 2, 2, 2, 2, 2, 2, 2, 2, 11, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 2, 2, 2, 2, 2, 2, 2, 2, 7, 1, 1, 1, 1, 1, 20, 2, 2, 2, 2, 2, 2, 2, 2, 12, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 17, 2, 2, 2, 2, 2, 2, 10, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 19, 18, 2, 2, 14, 13, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 27, 28, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 5, 1, 1, 1, 1, 1, 1, 21, 2, 2, 2, 2, 2, 2, 2, 2, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 3, 1, 1, 1, 1, 1, 20, 2, 2, 2, 2, 2, 2, 2, 2, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 26, 23, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 2, 6, 1, 1, 1, 1, 1, 17, 2, 2, 2, 2, 2, 2, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 23, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 2, 7, 1, 1, 1, 1, 1, 1, 19, 18, 2, 2, 14, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 26, 23, 23, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 23, 23, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 26, 23, 23, 23, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 27, 28, 2, 2, 4, 5, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 23, 23, 23, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 5, 1, 1, 1, 1, 1, 1, 24, 2, 2, 2, 2, 2, 2, 3, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 26, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 1, 1, 1, 26, 2, 2, 2, 2, 2, 2, 2, 2, 6, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 2, 2, 2, 6, 1, 1, 1, 25, 2, 2, 2, 2, 2, 2, 2, 2, 7, 1, 1, 1, 1, 26, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 26, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 2, 2, 2, 7, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 25, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 2, 2, 2, 2, 6, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 26, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 26, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 2, 2, 2, 2, 7, 1, 1, 21, 2, 2, 2, 2, 2, 2, 2, 2, 11, 1, 1, 1, 25, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 23, 23, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 2, 2, 2, 2, 2, 2, 9, 9, 9, 9, 9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 2, 2, 2, 2, 2, 6, 1, 20, 2, 2, 2, 2, 2, 2, 2, 2, 12, 1, 1, 24, 2, 2, 2, 2, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 26, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24, 23, 23, 23, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 2, 2, 2, 2, 2, 2, 2, 9, 9, 9, 9, 9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 2, 2, 2, 2, 2, 7, 1, 1, 17, 2, 2, 2, 2, 2, 2, 10, 1, 1, 24, 2, 2, 2, 2, 2, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 7, 1, 1, 1, 1, 1, 1, 1, 1, 24, 2, 23, 23, 23, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 2, 2, 2, 2, 2, 2, 2, 2, 9, 9, 9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 23, 2, 2, 2, 2, 2, 3, 1, 1, 19, 18, 2, 2, 14, 13, 1, 1, 24, 2, 2, 2, 2, 2, 2, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 1, 1, 1, 1, 27, 28, 2, 2, 2, 23, 23, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 2, 2, 2, 2, 2, 2, 9, 9, 9, 9, 9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 4, 5, 1, 1, 1, 1, 1, 1, 27, 28, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 5, 1, 1, 1, 1, 1, 1, 27, 28, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 5, 1, 27, 28, 2, 2, 2, 2, 2, 23, 23, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 2, 2, 2, 2, 2, 2, 9, 9, 9, 9, 9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 23, 23, 23, 2, 2, 2, 2, 2, 2, 2, 2, 4, 5, 1, 1, 27, 28, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 23, 2, 2, 2, 23, 2, 2, 2, 2, 2, 2, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    "height": 50,
    "id": 1,
    "name": "Tile Layer 1",
    "opacity": 1,
    "type": "tilelayer",
    "visible": true,
    "width": 100,
    "x": 0,
    "y": 0
  }],
  "nextlayerid": 2,
  "nextobjectid": 1,
  "orientation": "orthogonal",
  "renderorder": "right-down",
  "tiledversion": "2020.12.18",
  "tileheight": 32,
  "tilesets": [{
    "columns": 7,
    "firstgid": 1,
    "image": "..\/Sonic\/testTiles2.png",
    "imageheight": 128,
    "imagewidth": 224,
    "margin": 0,
    "name": "Shapes",
    "spacing": 0,
    "tilecount": 28,
    "tileheight": 32,
    "tilewidth": 32
  }],
  "tilewidth": 32,
  "type": "map",
  "version": 1.4,
  "width": 100
};

var TileMap = /*#__PURE__*/function (_View) {
  _inherits(TileMap, _View);

  var _super = _createSuper(TileMap);

  function TileMap(args, parent) {
    var _this;

    _classCallCheck(this, TileMap);

    _this = _super.call(this, args, parent);
    _this.heightMask = null;
    var image = new Image();
    _this.mapData = mapData;
    _this.ready = new Promise(function (accept) {
      image.addEventListener('load', function (event) {
        _this.width = image.width;
        _this.height = image.height;
        var heightMask = new _Tag.Tag('<canvas>');
        heightMask.width = image.width;
        heightMask.height = image.height;
        heightMask.getContext('2d').drawImage(image, 0, 0, _this.width, _this.height);
        _this.heightMask = heightMask;
        accept();
      });
      image.src = '/Sonic/testTiles2.png';
    });
    return _this;
  }

  _createClass(TileMap, [{
    key: "coordsToTile",
    value: function coordsToTile(x, y) {
      return [Math.floor(x / this.blockSize), Math.floor(y / this.blockSize)];
    }
  }, {
    key: "getTileNumber",
    value: function getTileNumber(x, y) {
      this.tileNoCache = this.tileNoCache || {};
      this.tileNoCache[x] = this.tileNoCache[x] || {};

      if (this.tileNoCache[x][y] !== undefined) {
        return this.tileNoCache[x][y];
      }

      if (x >= this.mapData.width || y >= this.mapData.height || x < 0 || y < 0) {
        return this.tileNoCache[x][y] = 1;
      }

      var tileIndex = y * this.mapData.width + x;

      if (this.mapData.layers[0].data[tileIndex] !== undefined) {
        return this.tileNoCache[x][y] = this.mapData.layers[0].data[tileIndex] - 1;
      }

      return this.tileNoCache[x][y] = false;
    }
  }, {
    key: "getTile",
    value: function getTile(tileNumber) {
      var x = 0;
      var y = 0;

      if (tileNumber) {
        var blocksWide = Math.ceil(this.width / 32);
        x = tileNumber % blocksWide;
        y = Math.floor(tileNumber / blocksWide);
      }

      return [x, y];
    }
  }, {
    key: "getSolid",
    value: function getSolid(tileNumber, xInput, yInput) {
      var _this2 = this;

      if (tileNumber === 0) {
        return false;
      }

      if (tileNumber === 1) {
        return true;
      }

      var tilePos = this.getTile(tileNumber).map(function (coord) {
        return coord * _this2.blockSize;
      });
      var x = Math.floor(Number(xInput) % this.blockSize);
      var y = Math.floor(Number(yInput) % this.blockSize);

      if (this.heightMaskCache !== undefined && this.heightMaskCache[tileNumber] !== undefined && this.heightMaskCache[tileNumber][x] !== undefined && this.heightMaskCache[tileNumber][x][y] !== undefined) {
        return this.heightMaskCache[tileNumber][x][y];
      }

      if (this.heightMask) {
        var xPixel = tilePos[0] + x;
        var yPixel = tilePos[1] + y;

        if (!this.heightMaskCache) {
          this.heightMaskCache = {};
        }

        if (!this.heightMaskCache[tileNumber]) {
          this.heightMaskCache[tileNumber] = {};
        }

        if (!this.heightMaskCache[tileNumber][x]) {
          this.heightMaskCache[tileNumber][x] = {};
        }

        this.heightMaskCache[tileNumber][x][y] = false;
        var pixel = this.heightMask.getContext('2d').getImageData(xPixel, yPixel, 1, 1).data;

        if (pixel[0] === 0) {
          this.heightMaskCache[tileNumber][x][y] = true;
        }

        return this.heightMaskCache[tileNumber][x][y];
      }

      return false;
    }
  }, {
    key: "blockSize",
    get: function get() {
      return this.mapData.tilewidth;
    }
  }]);

  return TileMap;
}(_View2.View);

exports.TileMap = TileMap;
});

;require.register("ui/CharacterString.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CharacterString = void 0;

var _View2 = require("curvature/base/View");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CharacterString = /*#__PURE__*/function (_View) {
  _inherits(CharacterString, _View);

  var _super = _createSuper(CharacterString);

  function CharacterString() {
    var _this;

    _classCallCheck(this, CharacterString);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", "<div class = \"hud-character-string [[hide]]\" cv-each = \"chars:char:c\" style = \"--scale:[[scale]];\"><span\n\t\t\t\tclass = \"hud-character\"\n\t\t\t\tdata-type  = \"[[char.type]]\"\n\t\t\t\tdata-value = \"[[char.pos]]\"\n\t\t\t\tdata-index = \"[[c]]\"\n\t\t\t\tstyle      = \"--value:[[char.pos]];--index:[[c]];--length:[[chars.length]];\"\n\t\t\t>[[char.original]]</span></div>");

    _this.args.chars = [];
    _this.args.scale = _this.args.scale || 1;

    _this.args.bindTo('value', function (v) {
      var chars = String(v).split('').map(function (pos, i) {
        var original = pos;
        var type = 'number';

        if (pos === ' ' || Number(pos) != pos) {
          switch (pos) {
            case '-':
              pos = 11;
              type = 'number';
              break;

            case ':':
              pos = 10;
              type = 'number';
              break;

            case '.':
              pos = 12;
              type = 'number';
              break;

            case ' ':
              pos = 13;
              type = 'number';
              break;

            default:
              pos = String(pos).toLowerCase().charCodeAt(0) - 97;
              type = 'letter';
              break;
          }
        }

        if (_this.args.chars[i]) {
          _this.args.chars[i].original = original;
          _this.args.chars[i].type = type;
          _this.args.chars[i].pos = pos;
          return _this.args.chars[i];
        }

        return {
          pos: pos,
          type: type,
          original: original
        };
      });
      Object.assign(_this.args.chars, chars);

      _this.args.chars.splice(chars.length);
    });

    return _this;
  }

  return CharacterString;
}(_View2.View);

exports.CharacterString = CharacterString;
});

;require.register("viewport/Viewport.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Viewport = void 0;

var _Bag = require("curvature/base/Bag");

var _Tag = require("curvature/base/Tag");

var _View2 = require("curvature/base/View");

var _Keyboard = require("curvature/input/Keyboard");

var _TileMap = require("../tileMap/TileMap");

var _QuestionBlock = require("../actor/QuestionBlock");

var _BrokenMonitor = require("../actor/BrokenMonitor");

var _PointActor = require("../actor/PointActor");

var _Explosion = require("../actor/Explosion");

var _Monitor = require("../actor/Monitor");

var _Ring = require("../actor/Ring");

var _CharacterString = require("../ui/CharacterString");

var _PointDump = require("../debug/PointDump");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ColCell = Symbol('collision-cell');

var Viewport = /*#__PURE__*/function (_View) {
  _inherits(Viewport, _View);

  var _super = _createSuper(Viewport);

  function Viewport(args, parent) {
    var _this;

    _classCallCheck(this, Viewport);

    _this = _super.call(this, args, parent); // this.hud = new Hud

    _defineProperty(_assertThisInitialized(_this), "template", require('./viewport.html'));

    _this.sprites = new _Bag.Bag();
    _this.tileMap = new _TileMap.TileMap();
    _this.world = null;
    _this.args.status = new _CharacterString.CharacterString({
      value: '',
      scale: 2
    });
    _this.args.labelX = new _CharacterString.CharacterString({
      value: 'x pos: '
    });
    _this.args.labelY = new _CharacterString.CharacterString({
      value: 'y pos: '
    });
    _this.args.labelGround = new _CharacterString.CharacterString({
      value: 'Ground: '
    });
    _this.args.labelGSpeed = new _CharacterString.CharacterString({
      value: 'G speed: '
    });
    _this.args.labelXSpeed = new _CharacterString.CharacterString({
      value: 'X speed: '
    });
    _this.args.labelYSpeed = new _CharacterString.CharacterString({
      value: 'Y speed: '
    });
    _this.args.labelMode = new _CharacterString.CharacterString({
      value: 'Mode: '
    });
    _this.args.labelAngle = new _CharacterString.CharacterString({
      value: 'G Angle: '
    });
    _this.args.labelAirAngle = new _CharacterString.CharacterString({
      value: 'Air Angle: '
    });
    _this.args.xPos = new _CharacterString.CharacterString({
      value: 0
    });
    _this.args.yPos = new _CharacterString.CharacterString({
      value: 0
    });
    _this.args.gSpeed = new _CharacterString.CharacterString({
      value: 0
    });
    _this.args.ground = new _CharacterString.CharacterString({
      value: ''
    });
    _this.args.xSpeed = new _CharacterString.CharacterString({
      value: 0
    });
    _this.args.ySpeed = new _CharacterString.CharacterString({
      value: 0
    });
    _this.args.mode = new _CharacterString.CharacterString({
      value: 0
    });
    _this.args.angle = new _CharacterString.CharacterString({
      value: 0
    });
    _this.args.airAngle = new _CharacterString.CharacterString({
      value: 0
    });
    _this.args.blockSize = 32;
    _this.args.willStick = false;
    _this.args.stayStuck = false;
    _this.args.willStick = true;
    _this.args.stayStuck = true;
    _this.args.width = 32 * 12.5;
    _this.args.height = 32 * 8.5;
    _this.args.scale = 2;
    _this.args.x = 0;
    _this.args.y = 0;
    _this.args.offsetX = 0;
    _this.args.offsetY = 0;
    _this.blocksXY = {};
    _this.args.animation = '';
    _this.actors = new _Bag.Bag(function (i, s, a) {
      if (a == _Bag.Bag.ITEM_ADDED) {
        i.viewport = _assertThisInitialized(_this);
      } else if (a == _Bag.Bag.ITEM_REMOVED) {
        i.viewport = null;

        if (i[ColCell]) {
          i[ColCell]["delete"](i);
        }
      }
    });
    var actor = new _PointActor.PointActor({
      x: 1280,
      y: 96
    });
    var monitor = new _Monitor.Monitor({
      x: 1312,
      y: 96
    });
    var monitor2 = new _Monitor.Monitor({
      x: 1376,
      y: 192,
      "float": -1
    });
    var questionBlock = new _QuestionBlock.QuestionBlock({
      x: 1312,
      y: 224
    });
    var ring6 = new _Ring.Ring({
      x: 1456,
      y: 287
    });
    var ring5 = new _Ring.Ring({
      x: 1424,
      y: 287
    });
    var ring4 = new _Ring.Ring({
      x: 1392,
      y: 287
    });
    var ring3 = new _Ring.Ring({
      x: 1184,
      y: 191
    });
    var ring2 = new _Ring.Ring({
      x: 1216,
      y: 191
    });
    var ring1 = new _Ring.Ring({
      x: 1248,
      y: 191
    });

    _this.actors.add(actor);

    _this.actors.add(questionBlock);

    _this.actors.add(monitor);

    _this.actors.add(monitor2);

    _this.actors.add(ring1);

    _this.actors.add(ring2);

    _this.actors.add(ring3);

    _this.actors.add(ring4);

    _this.actors.add(ring5);

    _this.actors.add(ring6);

    _this.args.actors = _this.actors.list;
    _this.blocks = new _Bag.Bag();
    _this.args.blocks = _this.blocks.list;

    _this.args.bindTo('willStick', function (v) {
      if (v) {
        _this.args.stayStuck = true;
      }
    });

    _this.args.bindTo('stayStuck', function (v) {
      if (!v) {
        _this.args.willStick = false;
      }
    });

    _this.listen(window, 'gamepadconnected', function (event) {
      return _this.padConnected(event);
    });

    _this.colCellDiv = 64;
    _this.colCells = {};
    return _this;
  }

  _createClass(Viewport, [{
    key: "onAttached",
    value: function onAttached(event) {
      var _this2 = this;

      this.update();
      this.args.paused = true;
      this.args.status.args.hide = 'hide';
      this.args.animation = 'start';
      this.onTimeout(250, function () {
        _this2.args.animation = '';

        _this2.onTimeout(750, function () {
          _this2.args.animation = 'opening';

          _this2.tags.viewport.focus();

          _this2.onTimeout(500, function () {
            _this2.args.animation = 'opening2';

            _this2.tags.viewport.focus();

            _this2.update();

            _this2.onTimeout(1500, function () {
              _this2.args.animation = 'closing';

              _this2.tags.viewport.focus();

              _this2.args.status.args.value = ' Click here for keyboard control. ';
              _this2.args.status.args.hide = '';

              _this2.onTimeout(500, function () {
                _this2.args.animation = 'closed';

                _this2.tags.viewport.focus();
              });

              _this2.onTimeout(250, function () {
                _this2.args.paused = false;
              });
            });
          });
        });
      });
      this.listen(document.body, 'click', function (event) {
        if (event.target !== document.body) {
          return;
        }

        _this2.tags.viewport.focus();
      });
      this.args.scale = this.args.scale || 1;

      var keyboard = _Keyboard.Keyboard.get();

      keyboard.listening = true;
      keyboard.focusElement = this.tags.viewport.node;
    }
  }, {
    key: "update",
    value: function update() {
      if (this.args.paused) {
        this.tags.frame.style({
          '--scale': this.args.scale,
          '--width': this.args.width
        });
        return;
      }

      this.args.actors[0].willStick = !!this.args.willStick;
      this.args.actors[0].stayStuck = !!this.args.stayStuck;
      this.args.actors[0].xAxis = 0;
      this.args.actors[0].running = false;
      this.args.actors[0].crawling = false;

      if (this.gamepad) {
        var gamepads = navigator.getGamepads();

        for (var _i = 0; _i < gamepads.length; _i++) {
          var gamepad = gamepads.item(_i);

          if (!gamepad) {
            continue;
          }

          if (gamepad.axes[0] && Math.abs(gamepad.axes[0]) > 0.3) {
            this.args.actors[0].xAxis = gamepad.axes[0] > 0 ? 1 : -1;
          } else if (gamepad.axes[1] && Math.abs(gamepad.axes[1]) > 0.3) {
            if (this.args.actors[0].args.mode === 1) {
              this.args.actors[0].xAxis = gamepad.axes[1] > 0 ? 1 : -1;
            } else if (this.args.actors[0].args.mode === 3) {
              this.args.actors[0].xAxis = gamepad.axes[1] > 0 ? -1 : 1;
            }
          } else {
            this.args.actors[0].xAxis = 0;
          }

          if (gamepad.buttons[14].pressed) {
            this.args.actors[0].xAxis = -1;
          } else if (gamepad.buttons[15].pressed) {
            this.args.actors[0].xAxis = 1;
          } else if (gamepad.buttons[12].pressed) {
            if (this.args.actors[0].args.mode === 1) {
              this.args.actors[0].xAxis = -1;
            } else if (this.args.actors[0].args.mode === 3) {
              this.args.actors[0].xAxis = 1;
            }
          } else if (gamepad.buttons[13].pressed) {
            if (this.args.actors[0].args.mode === 1) {
              this.args.actors[0].xAxis = 1;
            } else if (this.args.actors[0].args.mode === 3) {
              this.args.actors[0].xAxis = -1;
            }
          }

          if (gamepad.buttons[5].pressed) {
            this.args.actors[0].running = false;
            this.args.actors[0].crawling = true;
          } else if (gamepad.buttons[1].pressed || gamepad.buttons[4].pressed) {
            this.args.actors[0].running = true;
            this.args.actors[0].crawling = false;
          }

          if (gamepad.buttons[0].pressed) {
            this.args.actors[0].jump(Date.now());
          }
        }
      }

      if (_Keyboard.Keyboard.get().getKey('Shift') > 0) {
        this.args.actors[0].running = false;
        this.args.actors[0].crawling = true;
      } else if (_Keyboard.Keyboard.get().getKey('Control') > 0) {
        this.args.actors[0].running = true;
        this.args.actors[0].crawling = false;
      }

      if (_Keyboard.Keyboard.get().getKey('ArrowLeft') > 0 || _Keyboard.Keyboard.get().getKey('a') > 0) {
        this.args.actors[0].xAxis = -1;
      } else if (_Keyboard.Keyboard.get().getKey('ArrowRight') > 0 || _Keyboard.Keyboard.get().getKey('d') > 0) {
        this.args.actors[0].xAxis = 1;
      } else if (_Keyboard.Keyboard.get().getKey('ArrowUp') > 0 || _Keyboard.Keyboard.get().getKey('w') > 0) {
        if (this.args.actors[0].args.mode === 1) {
          this.args.actors[0].xAxis = -1;
        } else if (this.args.actors[0].args.mode === 3) {
          this.args.actors[0].xAxis = 1;
        }
      } else if (_Keyboard.Keyboard.get().getKey('ArrowDown') > 0 || _Keyboard.Keyboard.get().getKey('s') > 0) {
        if (this.args.actors[0].args.mode === 1) {
          this.args.actors[0].xAxis = 1;
        } else if (this.args.actors[0].args.mode === 3) {
          this.args.actors[0].xAxis = -1;
        }
      }

      if (_Keyboard.Keyboard.get().getKey(' ') > 0) {
        this.args.actors[0].jump();
      }

      var angle = this.args.actors[0].angle;
      var blocksWide = Math.ceil(this.args.width / this.args.blockSize);
      var blocksHigh = Math.ceil(this.args.height / this.args.blockSize);

      for (var _i2 in this.args.actors) {
        var actor = this.args.actors[_i2];
        this.setColCell(actor);
        actor.updateStart();
      }

      for (var _i3 in this.args.actors) {
        var _actor = this.args.actors[_i3];

        if (_actor.args["float"]) {
          _actor.update();
        }
      }

      for (var _i4 in this.args.actors) {
        var _actor2 = this.args.actors[_i4];

        if (!_actor2.args["float"]) {
          _actor2.update();
        }
      }

      this.args.x = -this.args.actors[0].x + this.args.width * 0.5;
      this.args.y = -this.args.actors[0].y + this.args.height * 0.66;

      if (this.args.x > 0) {
        this.args.x = 0;
      }

      if (this.args.y > 0) {
        this.args.y = 0;
      }

      var xMax = -(this.tileMap.mapData.width * 32) + this.args.width;
      var yMax = -(this.tileMap.mapData.height * 32) + this.args.height;

      if (this.args.x < xMax) {
        this.args.x = xMax;
      }

      if (this.args.y < yMax) {
        this.args.y = yMax;
      }

      for (var i = -1; i <= blocksWide + 1; i++) {
        for (var j = -1; j <= blocksHigh + 1; j++) {
          if (!this.blocksXY[i]) {
            this.blocksXY[i] = {};
          }

          if (!this.blocksXY[i][j]) {
            this.blocksXY[i][j] = new _Tag.Tag('<div>');
          }

          var block = this.blocksXY[i][j];
          var blockId = this.tileMap.getTileNumber(this.args.offsetX + i - Math.ceil(this.args.x / this.args.blockSize) + 0, this.args.offsetY + j - Math.ceil(this.args.y / this.args.blockSize) + 0);
          var tileXY = this.tileMap.getTile(blockId);

          if (!this.blocks.has(block)) {
            block.style({
              width: this.args.blockSize + 'px',
              height: this.args.blockSize + 'px'
            });
            var transX = this.args.blockSize * i + this.args.offsetX * this.args.blockSize % this.args.blockSize;
            var transY = this.args.blockSize * j + this.args.offsetY * this.args.blockSize % this.args.blockSize;
            block.style({
              transform: "translate(".concat(transX, "px, ").concat(transY, "px)"),
              'background-image': 'url(/Sonic/testTiles2.png)',
              'background-position': -1 * (tileXY[0] * this.args.blockSize) + 'px ' + -1 * (tileXY[1] * this.args.blockSize) + 'px',
              position: 'absolute',
              left: 0,
              top: 0
            });
            this.blocks.add(block);
          }

          var blockOffset = -1 * (tileXY[0] * this.args.blockSize) + 'px ' + -1 * (tileXY[1] * this.args.blockSize) + 'px';

          if (block.blockOffset !== blockOffset) {
            block.style({
              'background-position': blockOffset
            });
          }

          block.blockOffset = blockOffset;
        }
      }

      this.tags.frame.style({
        '--x': Math.round(this.args.x),
        '--y': Math.round(this.args.y),
        '--xMod': this.args.x < 0 ? Math.round(this.args.x % this.args.blockSize) : (-this.args.blockSize + Math.round(this.args.x % this.args.blockSize)) % this.args.blockSize,
        '--yMod': this.args.y < 0 ? Math.round(this.args.y % this.args.blockSize) : (-this.args.blockSize + Math.round(this.args.y % this.args.blockSize)) % this.args.blockSize,
        '--width': this.args.width,
        '--height': this.args.height,
        '--scale': this.args.scale
      });
      this.args.xPos.args.value = Math.round(this.args.actors[0].x);
      this.args.yPos.args.value = Math.round(this.args.actors[0].y);
      this.args.ground.args.value = this.args.actors[0].args.landed;
      this.args.gSpeed.args.value = this.args.actors[0].args.gSpeed;
      this.args.xSpeed.args.value = Math.round(this.args.actors[0].args.xSpeed);
      this.args.ySpeed.args.value = Math.round(this.args.actors[0].args.ySpeed);
      this.args.angle.args.value = (Math.round(this.args.actors[0].args.angle * 1000) / 1000).toFixed(3);
      this.args.airAngle.args.value = (Math.round(this.args.actors[0].args.airAngle * 1000) / 1000).toFixed(3);
      var modes = ['FLOOR', 'L-WALL', 'CEILING', 'R-WALL'];
      this.args.mode.args.value = modes[Math.floor(this.args.actors[0].args.mode)] || Math.floor(this.args.actors[0].args.mode);

      for (var _i5 in this.args.actors) {
        var _actor3 = this.args.actors[_i5];

        _actor3.updateEnd();
      }
    }
  }, {
    key: "actorsAtPoint",
    value: function actorsAtPoint(x, y) {
      var actors = [];
      var cells = this.getNearbyColCells({
        x: x,
        y: y
      });

      for (var i in cells) {
        var cell = cells[i];

        var _iterator = _createForOfIteratorHelper(cell.values()),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var actor = _step.value;
            var offset = Math.floor(actor.args.width / 2);
            var left = -offset + actor.args.x;
            var right = -offset + actor.args.x + actor.args.width;
            var top = actor.args.y - actor.args.height;
            var bottom = actor.args.y;

            if (x >= left && right > x) {
              if (bottom >= y && y > top) {
                actors.push(actor);
              }
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } // for(let i in this.args.actors)
      // {
      // 	const actor = this.args.actors[i];
      // 	const offset = Math.floor(actor.args.width / 2);
      // 	const left   = -offset + actor.args.x;
      // 	const right  = -offset + actor.args.x + actor.args.width;
      // 	const top    = actor.args.y - actor.args.height;
      // 	const bottom = actor.args.y;
      // 	if(x >= left && right > x)
      // 	{
      // 		if(bottom >= y && y > top)
      // 		{
      // 			actors.push( actor );
      // 		}
      // 	}
      // }


      return actors;
    }
  }, {
    key: "screenBox",
    value: function screenBox() {
      return [this.camera.x - Math.floor(this.width / 2), this.camera.y - Math.floor(this.height / 2), this.camera.x + Math.ceil(this.width / 2), this.camera.y + Math.ceil(this.height / 2)];
    }
  }, {
    key: "padConnected",
    value: function padConnected(event) {
      this.gamepad = event.gamepad;
    }
  }, {
    key: "colCellAddress",
    value: function colCellAddress(_ref) {
      var x = _ref.x,
          y = _ref.y;
      return {
        x: Math.floor(x / this.colCellDiv),
        y: Math.floor(y / this.colCellDiv)
      };
    }
  }, {
    key: "getColCell",
    value: function getColCell(actor) {
      var address = this.colCellAddress(actor);
      this.colCells[address.x] = this.colCells[address.x] || {};
      this.colCells[address.x][address.y] = this.colCells[address.x][address.y] || new Set();
      return this.colCells[address.x][address.y];
    }
  }, {
    key: "setColCell",
    value: function setColCell(actor) {
      var cell = this.getColCell(actor);

      if (actor[ColCell] && actor[ColCell] !== cell) {
        actor[ColCell]["delete"](actor);
      }

      actor[ColCell] = cell;
      actor[ColCell].add(actor);
      return cell;
    }
  }, {
    key: "getNearbyColCells",
    value: function getNearbyColCells(actor) {
      return [this.getColCell({
        x: actor.x - this.colCellDiv,
        y: actor.y - this.colCellDiv
      }), this.getColCell({
        x: actor.x - this.colCellDiv,
        y: actor.y + 0
      }), this.getColCell({
        x: actor.x - this.colCellDiv,
        y: actor.y + this.colCellDiv
      }), this.getColCell({
        x: actor.x,
        y: actor.y - this.colCellDiv
      }), this.getColCell({
        x: actor.x,
        y: actor.y + 0
      }), this.getColCell({
        x: actor.x,
        y: actor.y + this.colCellDiv
      }), this.getColCell({
        x: actor.x + this.colCellDiv,
        y: actor.y - this.colCellDiv
      }), this.getColCell({
        x: actor.x + this.colCellDiv,
        y: actor.y + 0
      }), this.getColCell({
        x: actor.x + this.colCellDiv,
        y: actor.y + this.colCellDiv
      })];
    }
  }]);

  return Viewport;
}(_View2.View);

exports.Viewport = Viewport;
});

;require.register("viewport/viewport.html", function(exports, require, module) {
module.exports = "<div class = \"viewport-frame\" cv-ref = \"frame\">\n\t<div class = \"viewport-header\">\n\t\t<span class = \"sean-icon\"></span>\n\t\t<h1>Pixel Physics</h1>\n\t</div>\n\t<div class = \"viewport\" cv-ref = \"viewport\" tabindex=\"0\">\n\n\t\t<div class = \"viewport-zoom\">\n\t\t\t<div class = \"viewport-background\" cv-each = \"blocks:block:b\" cv-ref = \"background\">[[block]]</div>\n\t\t\t<div class = \"viewport-content\" cv-each = \"actors:actor:a\">[[actor]]</div>\n\t\t</div>\n\n\t\t<div class = \"viewport-double-zoom\">\n\t\t\t<div class = \"hud\">\n\t\t\t\t<table>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelX]]</td>\n\t\t\t\t\t\t<td>[[xPos]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelY]]</td>\n\t\t\t\t\t\t<td>[[yPos]]</td>\n\t\t\t\t\t</tr>\n\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelMode]]</td>\n\t\t\t\t\t\t<td>[[mode]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelGround]]</td>\n\t\t\t\t\t\t<td>[[ground]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelAngle]]</td>\n\t\t\t\t\t\t<td>[[angle]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelGSpeed]]</td>\n\t\t\t\t\t\t<td>[[gSpeed]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelAirAngle]]</td>\n\t\t\t\t\t\t<td>[[airAngle]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelXSpeed]]</td>\n\t\t\t\t\t\t<td>[[xSpeed]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelYSpeed]]</td>\n\t\t\t\t\t\t<td>[[ySpeed]]</td>\n\t\t\t\t\t</tr>\n\n\n\t\t\t\t</table>\n\t\t\t</div>\n\n\t\t\t<div class = \"titlecard [[animation]]\">\n\n\t\t\t\t<div class = \"titlecard-field\"></div>\n\n\t\t\t\t<div class = \"titlecard-bottom-border\">\n\t\t\t\t\t<div class = \"titlecard-border-text\">SEAN MORRIS</div>\n\t\t\t\t</div>\n\n\t\t\t\t<div class = \"titlecard-left-border\">\n\t\t\t\t\t<div class = \"titlecard-border-shadow\"></div>\n\t\t\t\t\t<div class = \"titlecard-border-color\"></div>\n\t\t\t\t</div>\n\n\t\t\t\t<div class = \"titlecard-title\">\n\t\t\t\t\t<div class = \"titlecard-title-box\">\n\n\t\t\t\t\t\t<div class = \"titlecard-title-line-1\">\n\t\t\t\t\t\t\tPIXEL HILL\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div class = \"titlecard-title-line-2\">\n\t\t\t\t\t\t\tZONE<div class = \"titlecard-title-number\">\n\t\t\t\t\t\t\t\t1\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\n\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t</div>\n\t\t\t<div class = \"focus-me\">\n\t\t\t\t<div class = \"status-message\">[[status]]</div>\n\t\t\t</div>\n\n\t\t</div>\n\t</div>\n\n\t<div class = \"viewport-caption\">\n\t\t<div>\n\t\t\t<div>\n\t\t\t\t<span class = \"button-index\">\n\t\t\t\t\t<span class = \"arrow button arrow-west\"></span>\n\t\t\t\t\t/ <span class = \"arrow button arrow-east\"></span>\n\t\t\t\t\t/ <b>wasd</b>\n\t\t\t\t\t- move\n\t\t\t\t</span>\n\n\t\t\t\t<span class = \"button-index\">\n\t\t\t\t\t<span class = \"button ps-x\"></span>\n\t\t\t\t\t/ <span class = \"button xb-a\"></span>\n\t\t\t\t\t/ <b>space</b>\n\t\t\t\t\t- jump\n\t\t\t\t</span>\n\n\t\t\t\t<span class = \"button-index\">\n\t\t\t\t\t<span class = \"button ps-o\"></span>\n\t\t\t\t\t/ <span class = \"button xb-b\"></span>\n\t\t\t\t\t/ <b>ctrl</b>\n\t\t\t\t\t- run\n\t\t\t\t</span>\n\n\t\t\t\t<span class = \"button-index\">\n\t\t\t\t\t<span class = \"button ps-l1\"></span>\n\t\t\t\t\t/ <span class = \"button xb-lb\"></span>\n\t\t\t\t\t/ <b>ctrl</b>\n\t\t\t\t\t- run\n\t\t\t\t</span>\n\n\t\t\t\t<span class = \"button-index\">\n\t\t\t\t\t<span class = \"button ps-r1\"></span>\n\t\t\t\t\t/ <span class = \"button xb-rb\"></span>\n\t\t\t\t\t/ <b>shift</b>\n\t\t\t\t\t- brakes\n\t\t\t\t</span>\n\n\n\t\t\t\t<p>\n\t\t\t\t\t<a class = \"github\" cv-link = \"https://github.com/seanmorris/pixel-physics\">\n\t\t\t\t\t\t<span class = \"github-icon\"></span>\n\t\t\t\t\t\tview the project on github\n\t\t\t\t\t</a>\n\t\t\t\t</p>\n\t\t\t</div>\n\n\t\t\t<div class = \"right\">\n\n\t\t\t\t<span class = \"label\"><i>(pixels enlarged to show texture)</i></span>\n\n\t\t\t\t<label>\n\t\t\t\t\tplayer can stop on walls\n\t\t\t\t\t<input type = \"checkbox\" cv-bind = \"stayStuck\" value = \"1\" />\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\tjumps can stick to walls\n\t\t\t\t\t<input type = \"checkbox\" cv-bind = \"willStick\" value = \"1\" />\n\t\t\t\t\t<br />\n\t\t\t\t</label>\n\n\t\t\t\t<small>(requires \"stop on walls\")</small>\n\n\t\t\t\t<label>\n\t\t\t\t\tscale&nbsp;\n\t\t\t\t\t<form>\n\t\t\t\t\t\t<input type = \"number\" cv-bind = \"scale\" min = \"1\" max = \"5\" />\n\t\t\t\t\t</form>\n\t\t\t\t</label>\n\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\n</div>\n\n"
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

"use strict";

/* jshint ignore:start */
(function () {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch = window.brunch || {};
  var ar = br['auto-reload'] = br['auto-reload'] || {};
  if (!WebSocket || ar.disabled) return;
  if (window._ar) return;
  window._ar = true;

  var cacheBuster = function cacheBuster(url) {
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'cacheBuster=' + date;
  };

  var browser = navigator.userAgent.toLowerCase();
  var forceRepaint = ar.forceRepaint || browser.indexOf('chrome') > -1;
  var reloaders = {
    page: function page() {
      window.location.reload(true);
    },
    stylesheet: function stylesheet() {
      [].slice.call(document.querySelectorAll('link[rel=stylesheet]')).filter(function (link) {
        var val = link.getAttribute('data-autoreload');
        return link.href && val != 'false';
      }).forEach(function (link) {
        link.href = cacheBuster(link.href);
      }); // Hack to force page repaint after 25ms.

      if (forceRepaint) setTimeout(function () {
        document.body.offsetHeight;
      }, 25);
    },
    javascript: function javascript() {
      var scripts = [].slice.call(document.querySelectorAll('script'));
      var textScripts = scripts.map(function (script) {
        return script.text;
      }).filter(function (text) {
        return text.length > 0;
      });
      var srcScripts = scripts.filter(function (script) {
        return script.src;
      });
      var loaded = 0;
      var all = srcScripts.length;

      var onLoad = function onLoad() {
        loaded = loaded + 1;

        if (loaded === all) {
          textScripts.forEach(function (script) {
            eval(script);
          });
        }
      };

      srcScripts.forEach(function (script) {
        var src = script.src;
        script.remove();
        var newScript = document.createElement('script');
        newScript.src = cacheBuster(src);
        newScript.async = true;
        newScript.onload = onLoad;
        document.head.appendChild(newScript);
      });
    }
  };
  var port = ar.port || 9486;
  var host = br.server || window.location.hostname || 'localhost';

  var connect = function connect() {
    var connection = new WebSocket('ws://' + host + ':' + port);

    connection.onmessage = function (event) {
      if (ar.disabled) return;
      var message = event.data;
      var reloader = reloaders[message] || reloaders.page;
      reloader();
    };

    connection.onerror = function () {
      if (connection.readyState) connection.close();
    };

    connection.onclose = function () {
      window.setTimeout(connect, 1000);
    };
  };

  connect();
})();
/* jshint ignore:end */
;
//# sourceMappingURL=app.js.map