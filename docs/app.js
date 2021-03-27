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

require.register("curvature/animate/Ease.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ease = void 0;

var _Mixin = require("../base/Mixin");

var _PromiseMixin = require("../mixin/PromiseMixin");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

var Ease = /*#__PURE__*/function (_Mixin$with) {
  _inherits(Ease, _Mixin$with);

  var _super = _createSuper(Ease);

  function Ease(interval) {
    var _this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Ease);

    _this = _super.call(this);
    _this.interval = interval;
    _this.terminal = false;
    _this.initial = false;
    _this.timeout = false;
    _this["final"] = false;
    _this.canceled = false;
    _this.done = false;
    _this.calculate = _this.calculate || 'calculate' in options ? options.calculate : false;
    _this.bounded = 'bounded' in options ? options.bounded : true;
    _this.repeat = 'repeat' in options ? options.repeat : 1;
    _this.reverse = 'reverse' in options ? options.reverse : false;
    return _this;
  }

  _createClass(Ease, [{
    key: "start",
    value: function start() {
      var _this2 = this;

      this.done = false;
      requestAnimationFrame(function () {
        _this2.initial = Date.now();
        _this2.terminal = _this2.initial + _this2.interval;

        if (_this2.repeat >= 0) {
          _this2.terminal = _this2.initial + _this2.interval * _this2.repeat;
          _this2.timeout = setTimeout(function () {
            if (_this2.done) {
              return _this2.reverse ? 0 : 1;
            }

            _this2.done = true;

            _this2[_PromiseMixin.PromiseMixin.Accept](_this2.reverse ? 0 : 1);
          }, _this2.interval * _this2.repeat);
        }
      });
    }
  }, {
    key: "cancel",
    value: function cancel() {
      if (this.done) {
        return this["final"];
      }

      clearTimeout(this.timeout);
      this["final"] = this.current();
      this.canceled = this.done = true;

      this[_PromiseMixin.PromiseMixin.Reject](this["final"]);

      return this["final"];
    }
  }, {
    key: "fraction",
    value: function fraction() {
      if (this.done) {
        return this.reverse ? 0 : 1;
      }

      if (this.initial === false) {
        return this.reverse ? 1 : 0;
      }

      var elapsed = Date.now() - this.initial;

      if (elapsed / this.interval >= this.repeat) {
        return this.reverse ? 0 : 1;
      }

      var fraction = elapsed % this.interval / this.interval;
      return this.reverse ? 1 - fraction : fraction;
    }
  }, {
    key: "current",
    value: function current() {
      var t = this.fraction();

      if (this.calculate) {
        return this.calculate(t);
      }

      return t;
    }
  }]);

  return Ease;
}(_Mixin.Mixin["with"](_PromiseMixin.PromiseMixin));

exports.Ease = Ease;
  })();
});

require.register("curvature/animate/ease/QuintIn.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuintIn = void 0;

var _Ease2 = require("../Ease");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var QuintIn = /*#__PURE__*/function (_Ease) {
  _inherits(QuintIn, _Ease);

  var _super = _createSuper(QuintIn);

  function QuintIn() {
    var _this;

    _classCallCheck(this, QuintIn);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "calculate", function (t) {
      return t * t * t * t * t;
    });

    return _this;
  }

  return QuintIn;
}(_Ease2.Ease);

exports.QuintIn = QuintIn;
  })();
});

require.register("curvature/animate/ease/QuintInOut.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuintInOut = void 0;

var _Ease2 = require("../Ease");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var QuintInOut = /*#__PURE__*/function (_Ease) {
  _inherits(QuintInOut, _Ease);

  var _super = _createSuper(QuintInOut);

  function QuintInOut() {
    var _this;

    _classCallCheck(this, QuintInOut);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "calculate", function (t) {
      return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
    });

    return _this;
  }

  return QuintInOut;
}(_Ease2.Ease);

exports.QuintInOut = QuintInOut;
  })();
});

require.register("curvature/animate/ease/QuintOut.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuintOut = void 0;

var _Ease2 = require("../Ease");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var QuintOut = /*#__PURE__*/function (_Ease) {
  _inherits(QuintOut, _Ease);

  var _super = _createSuper(QuintOut);

  function QuintOut() {
    var _this;

    _classCallCheck(this, QuintOut);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "calculate", function (t) {
      return 1 + --t * t * t * t * t;
    });

    return _this;
  }

  return QuintOut;
}(_Ease2.Ease);

exports.QuintOut = QuintOut;
  })();
});

require.register("curvature/base/Bag.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bag = void 0;

var _Bindable = require("./Bindable");

var _Mixin = require("./Mixin");

var _EventTargetMixin = require("../mixin/EventTargetMixin");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

var toId = function toId(_int) {
  return Number(_int);
};

var fromId = function fromId(id) {
  return parseInt(id);
};

var Bag = /*#__PURE__*/function (_Mixin$with) {
  _inherits(Bag, _Mixin$with);

  var _super = _createSuper(Bag);

  function Bag() {
    var _this;

    var changeCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

    _classCallCheck(this, Bag);

    _this = _super.call(this);
    _this.meta = Symbol('meta');
    _this.content = new Map();
    _this.list = _Bindable.Bindable.makeBindable([]);
    _this.current = 0;
    _this.type = undefined;
    _this.length = 0;
    _this.changeCallback = changeCallback;
    return _this;
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

      var adding = new CustomEvent('adding', {
        detail: {
          item: item
        }
      });

      if (!this.dispatchEvent(adding)) {
        return;
      }

      var id = toId(this.current++);
      this.content.set(item, id);
      this.list[id] = item;

      if (this.changeCallback) {
        this.changeCallback(item, this.meta, Bag.ITEM_ADDED, id);
      }

      var add = new CustomEvent('added', {
        detail: {
          item: item,
          id: id
        }
      });
      this.dispatchEvent(add);
      this.length = this.size;
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

      var removing = new CustomEvent('removing', {
        detail: {
          item: item
        }
      });

      if (!this.dispatchEvent(removing)) {
        return;
      }

      var id = this.content.get(item);
      delete this.list[id];
      this.content["delete"](item);

      if (this.changeCallback) {
        this.changeCallback(item, this.meta, Bag.ITEM_REMOVED, id);
      }

      var remove = new CustomEvent('removed', {
        detail: {
          item: item,
          id: id
        }
      });
      this.dispatchEvent(remove);
      this.length = this.size;
      return item;
    }
  }, {
    key: "items",
    value: function items() {
      return Array.from(this.content.entries()).map(function (entry) {
        return entry[0];
      });
    }
  }, {
    key: "size",
    get: function get() {
      return this.content.size;
    }
  }]);

  return Bag;
}(_Mixin.Mixin["with"](_EventTargetMixin.EventTargetMixin));

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

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

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
var Names = Symbol('Names');
var Executing = Symbol('executing');
var Stack = Symbol('stack');
var ObjSymbol = Symbol('object');
var Wrapped = Symbol('wrapped');
var Unwrapped = Symbol('unwrapped');
var GetProto = Symbol('getProto');
var OnGet = Symbol('onGet');
var OnAllGet = Symbol('onAllGet');
var BindChain = Symbol('bindChain');
var Descriptors = Symbol('Descriptors');
var TypedArray = Object.getPrototypeOf(Int8Array);
var win = window || {};
var excludedClasses = [win.Node, win.File, win.Map, win.Set, win.WeakMap, win.WeakSet, win.ArrayBuffer, win.ResizeObserver, win.MutationObserver, win.PerformanceObserver, win.IntersectionObserver].filter(function (x) {
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
      return object[Ref] || object || false;
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
        return object[Ref];
      }

      if (object[Binding]) {
        return object;
      }

      Object.defineProperty(object, Ref, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: false
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
      Object.defineProperty(object, Descriptors, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: new Map()
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
          var bindIndex = object[BindingAll].length;
          object[BindingAll].push(callback);

          if (!('now' in options) || options.now) {
            for (var i in object) {
              callback(object[i], i, object, false);
            }
          }

          return function () {
            delete object[BindingAll][bindIndex];
          };
        }

        if (!object[Binding][property]) {
          object[Binding][property] = new Set();
        } // let bindIndex = object[Binding][property].length;


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

        object[Binding][property].add(callback);

        if (!('now' in options) || options.now) {
          callback(object[property], property, object, false);
        }

        var debinder = function debinder() {
          var subDebind = object[SubBinding].get(callback);

          if (subDebind) {
            object[SubBinding]["delete"](callback);
            subDebind();
          }

          if (!object[Binding][property]) {
            return;
          }

          if (!object[Binding][property].has(callback)) {
            return;
          }

          object[Binding][property]["delete"](callback);
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
          }));
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
          var _iterator = _createForOfIteratorHelper(object[Binding][key]),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var callback = _step.value;

              // if(!object[Binding][key])
              // {
              // 	continue;
              // }
              // if(!object[Binding][key][i])
              // {
              // 	continue;
              // }
              if (callback(value, key, target, false, target[key]) === false) {
                stop = true;
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
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
          for (var _i3 in object[Binding]['length']) {
            var _callback = object[Binding]['length'][_i3];

            _callback(target.length, 'length', target, false, target.length);
          }
        }

        return result;
      };

      var deleteProperty = function deleteProperty(target, key) {
        if (!(key in target)) {
          return true;
        }

        for (var _i4 in object[BindingAll]) {
          object[BindingAll][_i4](undefined, key, target, true, target[key]);
        }

        if (key in object[Binding]) {
          for (var _i5 in object[Binding][key]) {
            if (!object[Binding][key][_i5]) {
              continue;
            }

            object[Binding][key][_i5](undefined, key, target, true, target[key]);
          }
        }

        delete target[key];
        return true;
      };

      var construct = function construct(target, args) {
        var key = 'constructor';

        for (var _i6 in target.___before___) {
          target.___before___[_i6](target, key, object[Stack], undefined, args);
        }

        var instance = Bindable.make(_construct(target[Original], _toConsumableArray(args)));

        for (var _i7 in target.___after___) {
          target.___after___[_i7](target, key, object[Stack], instance, args);
        }

        return instance;
      };

      var descriptors = object[Descriptors];
      var wrapped = object[Wrapped];
      var stack = object[Stack];

      var get = function get(target, key) {
        if (key === Ref || key === Original || key === 'apply' || key === 'isBound' || key === 'bindTo' || key === '__proto__' || key === 'constructor') {
          return object[key];
        }

        if (key in wrapped) {
          return wrapped[key];
        }

        var descriptor;

        if (descriptors.has(key)) {
          descriptor = descriptors.get(key);
        } else {
          descriptor = Object.getOwnPropertyDescriptor(object, key);
          descriptors.set(key, descriptor);
        }

        if (descriptor && !descriptor.configurable && !descriptor.writable) {
          return object[key];
        }

        if (OnAllGet in object) {
          return object[OnAllGet](key);
        }

        if (OnGet in object && !(key in object)) {
          return object[OnGet](key);
        }

        if (descriptor && !descriptor.configurable && !descriptor.writable) {
          wrapped[key] = object[key];
          return wrapped[key];
        }

        if (typeof object[key] === 'function') {
          if (Names in object[key]) {
            return object[key];
          }

          Object.defineProperty(object[Unwrapped], key, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: object[key]
          });

          var wrappedMethod = function wrappedMethod() {
            var SetIterator = Set.prototype[Symbol.iterator];
            var MapIterator = Map.prototype[Symbol.iterator];
            var objRef = typeof Promise === 'function' && object instanceof Promise || typeof Map === 'function' && object instanceof Map || typeof Set === 'function' && object instanceof Set || typeof MapIterator === 'function' && object.prototype === MapIterator || typeof SetIterator === 'function' && object.prototype === SetIterator || typeof SetIterator === 'function' && object.prototype === SetIterator || typeof WeakMap === 'function' && object instanceof WeakMap || typeof WeakSet === 'function' && object instanceof WeakSet || typeof Date === 'function' && object instanceof Date || typeof TypedArray === 'function' && object instanceof TypedArray || typeof ArrayBuffer === 'function' && object instanceof ArrayBuffer || typeof EventTarget === 'function' && object instanceof EventTarget || typeof ResizeObserver === 'function' && object instanceof ResizeObserver || typeof MutationObserver === 'function' && object instanceof MutationObserver || typeof PerformanceObserver === 'function' && object instanceof PerformanceObserver || typeof IntersectionObserver === 'function' && object instanceof IntersectionObserver || typeof object[Symbol.iterator] === 'function' && key === 'next' ? object : object[Ref];
            object[Executing] = key;
            stack.unshift(key);

            for (var _len3 = arguments.length, providedArgs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              providedArgs[_key3] = arguments[_key3];
            }

            for (var _i8 in object.___before___) {
              object.___before___[_i8](object, key, stack, object, providedArgs);
            }

            var ret;

            if (new.target) {
              ret = _construct(object[Unwrapped][key], providedArgs);
            } else {
              var prototype = Object.getPrototypeOf(object);
              var isMethod = prototype[key] === object[key];
              var func = object[Unwrapped][key];

              if (isMethod) {
                ret = func.apply(objRef || object, providedArgs);
              } else {
                ret = func.apply(void 0, providedArgs);
              }
            }

            for (var _i9 in object.___after___) {
              object.___after___[_i9](object, key, stack, object, providedArgs);
            }

            object[Executing] = null;
            stack.shift();
            return ret;
          };

          wrappedMethod[Names] = wrappedMethod[Names] || new WeakMap();
          wrappedMethod[Names].set(object, key);

          wrappedMethod[OnAllGet] = function (key) {
            var selfName = wrappedMethod[Names].get(object);
            return object[selfName][key];
          };

          wrapped[key] = Bindable.make(wrappedMethod);
          return wrapped[key];
        }

        return object[key];
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
      this.routes = routes || listener.routes;
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
        } // let styleEvent = new CustomEvent('cvStyle', {detail:{styles}});
        // if(!_this.node.dispatchEvent(styleEvent))
        // {
        // 	return;
        // }


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
    Object.defineProperty(_assertThisInitialized(_this), 'nodesAttached', {
      value: new _Bag.Bag(function (i, s, a) {})
    });
    Object.defineProperty(_assertThisInitialized(_this), 'nodesDetached', {
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
    Object.defineProperty(_assertThisInitialized(_this), 'timeouts', {
      value: new Map()
    });
    Object.defineProperty(_assertThisInitialized(_this), 'intervals', {
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
    Object.defineProperty(_assertThisInitialized(_this), 'unpauseCallbacks', {
      value: new Map()
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

      var timeoutInfo = {
        timeout: null,
        callback: null,
        time: time,
        fired: false,
        created: new Date().getTime(),
        paused: false
      };

      var wrappedCallback = function wrappedCallback() {
        callback();
        timeoutInfo.fired = true;

        _this3.timeouts["delete"](timeoutInfo.timeout);
      };

      var timeout = setTimeout(wrappedCallback, time);
      timeoutInfo.callback = wrappedCallback;
      timeoutInfo.timeout = timeout;
      this.timeouts.set(timeoutInfo.timeout, timeoutInfo);
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
      var _iterator = _createForOfIteratorHelper(this.timeouts),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
              callback = _step$value[0],
              timeoutInfo = _step$value[1];

          clearTimeout(timeoutInfo.timeout);
          this.timeouts["delete"](timeoutInfo.timeout);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
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
        var _iterator2 = _createForOfIteratorHelper(this.timeouts),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _step2$value = _slicedToArray(_step2.value, 2),
                callback = _step2$value[0],
                timeout = _step2$value[1];

            if (timeout.fired) {
              this.timeouts["delete"](timeout.timeout);
              continue;
            }

            clearTimeout(timeout.timeout);
            timeout.paused = true;
            timeout.time = Math.max(0, timeout.time - (Date.now() - timeout.created));
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        for (var i in this.intervals) {
          clearInterval(this.intervals[i].timeout);
        }
      } else {
        var _iterator3 = _createForOfIteratorHelper(this.timeouts),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var _step3$value = _slicedToArray(_step3.value, 2),
                _callback = _step3$value[0],
                _timeout = _step3$value[1];

            if (!_timeout.paused) {
              continue;
            }

            if (_timeout.fired) {
              this.timeouts["delete"](_timeout.timeout);
              continue;
            }

            _timeout.timeout = setTimeout(_timeout.callback, _timeout.time);
            _timeout.paused = false;
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        for (var _i2 in this.intervals) {
          if (!this.intervals[_i2].timeout.paused) {
            continue;
          }

          this.intervals[_i2].timeout.paused = false;
          this.intervals[_i2].timeout = setInterval(this.intervals[_i2].callback, this.intervals[_i2].time);
        }

        var _iterator4 = _createForOfIteratorHelper(this.unpauseCallbacks),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var _step4$value = _slicedToArray(_step4.value, 2),
                _callback2 = _step4$value[1];

            _callback2();
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }

        this.unpauseCallbacks.clear();
      }

      var _iterator5 = _createForOfIteratorHelper(this.viewLists),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _step5$value = _slicedToArray(_step5.value, 2),
              tag = _step5$value[0],
              viewList = _step5$value[1];

          viewList.pause(!!paused);
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      for (var _i3 in this.tags) {
        if (Array.isArray(this.tags[_i3])) {
          for (var j in this.tags[_i3]) {
            this.tags[_i3][j].pause(!!paused);
          }

          continue;
        }

        this.tags[_i3].pause(!!paused);
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
      var attach = this.nodesAttached.items();

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
        var detach = this.nodesDetached.items();

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

      proxy[expandProperty] = _Bindable.Bindable.make(proxy[expandProperty]);
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

              _this6.nodesAttached.add(onAttach);

              v.render(tag.parentNode, dynamicNode);

              var cleanup = function cleanup() {
                if (!v.preserve) {
                  v.remove();
                }
              };

              _this6.onRemove(cleanup);

              v.onRemove(function () {
                _this6.nodesAttached.remove(onAttach);

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
      } else if (tag.nodeType === Node.ELEMENT_NODE) {
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
            var matchingSegments = bindProperties[longProperty]; // const changeAttribute = (v, k, t, d) => {
            // 	tag.setAttribute(attribute.name, segments.join(''));
            // };

            _this6.onRemove(proxy.bindTo(property, function (v, k, t, d) {
              if (transformer) {
                v = transformer(v);
              }

              for (var _i4 in bindProperties) {
                for (var _j in bindProperties[longProperty]) {
                  segments[bindProperties[longProperty][_j]] = t[_i4];

                  if (k === property) {
                    segments[bindProperties[longProperty][_j]] = v;
                  }
                }
              }

              if (!_this6.paused) {
                // changeAttribute(v,k,t,d);
                tag.setAttribute(attribute.name, segments.join(''));
              } else {
                // this.unpauseCallbacks.set(attribute, () => changeAttribute(v,k,t,d));
                _this6.unpauseCallbacks.set(attribute, function () {
                  return tag.setAttribute(attribute.name, segments.join(''));
                });
              }
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

              _this7.nodesAttached.add(selectOption);
            } else {
              tag.value = v == null ? '' : v;
            }

            tag.dispatchEvent(autoChangedEvent);
          }
        } else {
          if (v instanceof View) {
            var _iterator6 = _createForOfIteratorHelper(tag.childNodes),
                _step6;

            try {
              for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                var node = _step6.value;
                node.remove();
              }
            } catch (err) {
              _iterator6.e(err);
            } finally {
              _iterator6.f();
            }

            var onAttach = function onAttach(parentNode) {
              if (v.dispatchAttach()) {
                v.attached(parentNode);
                v.dispatchAttached();
              }
            };

            _this7.nodesAttached.add(onAttach);

            v.render(tag);
            v.onRemove(function () {
              return _this7.nodesAttached.remove(onAttach);
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
                var _iterator7 = _createForOfIteratorHelper(tag.childNodes),
                    _step7;

                try {
                  for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                    var _node = _step7.value;

                    _node.remove();
                  }
                } catch (err) {
                  _iterator7.e(err);
                } finally {
                  _iterator7.f();
                }

                tag.innerHTML = v;
              }

              _Dom.Dom.mapTags(tag, false, function (t) {
                return t[dontParse] = true;
              });
            }
          } else {
            if (tag.textContent !== v) {
              var _iterator8 = _createForOfIteratorHelper(tag.childNodes),
                  _step8;

              try {
                for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                  var _node2 = _step8.value;

                  _node2.remove();
                }
              } catch (err) {
                _iterator8.e(err);
              } finally {
                _iterator8.f();
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
            _this8.nodesAttached.add(eventListener);

            break;

          case '_detach':
            _this8.nodesDetached.add(eventListener);

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

        var _loop8 = function _loop8(_i5) {
          var debind = v.bindTo(_i5, function (vv, kk) {
            view.args[kk] = vv;
          });
          var debindUp = view.args.bindTo(_i5, function (vv, kk) {
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

        for (var _i5 in v) {
          _loop8(_i5);
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
        for (var _i6 in _this14.tags) {
          if (Array.isArray(_this14.tags[_i6])) {
            _this14.tags[_i6] && _this14.tags[_i6].map(function (t) {
              return t.remove();
            });

            _this14.tags[_i6].splice(0);
          } else {
            _this14.tags[_i6] && _this14.tags[_i6].remove();
            _this14.tags[_i6] = undefined;
          }
        }

        for (var _i7 in _this14.nodes) {
          _this14.nodes[_i7] && _this14.nodes[_i7].dispatchEvent(new Event('cvDomDetached'));
          _this14.nodes[_i7] && _this14.nodes[_i7].remove();
          _this14.nodes[_i7] = undefined;
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

      var _iterator9 = _createForOfIteratorHelper(callbacks),
          _step9;

      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var callback = _step9.value;

          this._onRemove.remove(callback);

          callback();
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }

      var cleanup;

      while (cleanup = this.cleanup.shift()) {
        cleanup && cleanup();
      }

      var _iterator10 = _createForOfIteratorHelper(this.viewLists),
          _step10;

      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var _step10$value = _slicedToArray(_step10.value, 2),
              tag = _step10$value[0],
              viewList = _step10$value[1];

          viewList.remove();
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }

      this.viewLists.clear();

      var _iterator11 = _createForOfIteratorHelper(this.timeouts),
          _step11;

      try {
        for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
          var _step11$value = _slicedToArray(_step11.value, 2),
              _callback3 = _step11$value[0],
              timeout = _step11$value[1];

          clearTimeout(timeout.timeout);
          this.timeouts["delete"](timeout.timeout);
        }
      } catch (err) {
        _iterator11.e(err);
      } finally {
        _iterator11.f();
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
        return node.removeEventListener(eventName, callback, options);
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
  }, {
    key: "detach",
    value: function detach() {
      for (var n in this.nodes) {
        this.nodes[n].remove();
      }

      return this.nodes;
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

      if (_this.focusElement && document.activeElement !== _this.focusElement && (!_this.focusElement.contains(document.activeElement) || document.activeElement.matches('input,textarea'))) {
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

      if (_this.focusElement && document.activeElement !== _this.focusElement && (!_this.focusElement.contains(document.activeElement) || document.activeElement.matches('input,textarea'))) {
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

require.register("subspace-console/Console.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Console = void 0;

var _View2 = require("curvature/base/View");

var _Bag = require("curvature/base/Bag");

var _MeltingText = require("./view/MeltingText");

var _Task = require("./Task");

var _Path = require("./Path");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

var Console = /*#__PURE__*/function (_View) {
  _inherits(Console, _View);

  var _super = _createSuper(Console);

  function Console() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Console);

    _this = _super.call(this, args);
    var defaults = {
      init: false,
      path: _Path.Path
    };
    var allOptions = Object.assign({}, defaults, options);
    _this.template = "<div class = \"terminal [[inverted]]\" cv-on = \"click:focus(event)\">\n\t<div class = \"output\" cv-each = \"output:line:l\" cv-ref = \"output:curvature/base/Tag\">\n\t\t<p>[[line]]</p>\n\t</div>\n\t<div class = \"bottom\">\n\t\t<div>[[prompt]]&nbsp;</div>\n\t\t<div>\n\t\t\t<form cv-on = \"submit:cancel(event)\">\n\t\t\t\t<textarea\n\t\t\t\t\tcv-bind = \"input\"\n\t\t\t\t\tcv-on   = \":keydown(event);:keyup(event)\"\n\t\t\t\t\tcv-ref  = \"input:curvature/base/Tag\"\n\t\t\t\t\trow     = \"1\"\n\t\t\t\t></textarea>\n\t\t\t</form>\n\n\t\t\t<form cv-on = \"submit:cancel(event)\">\n\t\t\t\t<input\n\t\t\t\t\tautocomplete = \"one-time-code\"\n\t\t\t\t\tname    = \"pw-input\"\n\t\t\t\t\ttype    = \"password\"\n\t\t\t\t\tcv-bind = \"input\"\n\t\t\t\t\tcv-ref  = \"password:curvature/base/Tag\"\n\t\t\t\t\tcv-on   = \":keydown(event,false);:keyup(event,false)\"\n\t\t\t\t/>\n\t\t\t</form>\n\n\t\t\t<input\n\t\t\t\tcv-on  = \"input:fileLoaded(event)\"\n\t\t\t\tcv-ref = \"file:curvature/base/Tag\"\n\t\t\t\tname   = \"file-input\"\n\t\t\t\ttype   = \"file\"\n\t\t\t\tstyle  = \"display: none\"\n\t\t\t/>\n\t\t</div>\n\t</div>\n</div>\n\n<div class = \"scanlines\"></div>\n";
    _this.args.input = '';
    _this.args.output = [];
    _this.args.inverted = '';
    _this.localEcho = true;
    _this.postToken = null;
    _this.args.prompt = '::';
    _this.routes = {};
    _this.args.passwordMode = false;
    _this.tasks = [];
    _this.taskList = new _Bag.Bag();
    _this.taskList.type = _Task.Task;
    _this.max = 512;
    _this.historyCursor = -1;
    _this.history = [];
    _this.env = new Map();

    _this.args.output.___after(function (t, k, o, a) {
      if (k !== 'push') {
        return;
      }

      if (_this.args.output.length > _this.max) {
        var removed = _this.args.output.shift();

        if (_typeof(removed) === 'object') {
          removed.remove();
        }
      }

      var scroller = _this.scroller;
      var scrollTo = scroller === window ? document.body.scrollHeight : scroller.scrollHeight;

      _this.onNextFrame(function () {
        scroller.scrollTo({
          behavior: 'smooth',
          left: 0,
          top: scroller.scrollHeight
        });
      });
    });

    if (allOptions.init) {
      _this.runScript(allOptions.init);
    }

    _this.scroller = allOptions.scroller || window;
    _this.path = allOptions.path || {};
    _this.originalInput = '';
    return _this;
  }

  _createClass(Console, [{
    key: "runCommand",
    value: function runCommand(command) {
      // console.log(command);
      if (this.historyCursor != 0) {
        this.history.unshift(command);
      }

      var ret;

      if (command.substring(0, 1) === '/') {
        if (!this.args.passwordMode) {
          this.args.output.push(":: ".concat(command));
        }

        ret = this.interpret(command.substr(1));
      } else if (this.tasks.length) {
        if (!this.args.passwordMode) {
          this.args.output.push("".concat(this.tasks[0].prompt, " ").concat(command));
        }

        ret = this.tasks[0].write(command) || Promise.resolve();
      } else {
        if (!this.args.passwordMode) {
          this.args.output.push(":: ".concat(command));
        }

        ret = this.interpret(command);
      }

      if (!(ret instanceof Promise)) {
        ret = Promise.resolve(ret);
      }

      this.historyCursor = -1;
      this.originalInput = this.args.input = '';
      return ret;
    }
  }, {
    key: "runScript",
    value: function runScript(url) {
      var _this2 = this;

      fetch(url + '?api=txt').then(function (response) {
        return response.text();
      }).then(function (init) {
        var lines = init.split("\n");

        var process = function process(lines) {
          if (!lines.length) {
            return;
          }

          var line = lines.shift();

          if (line && line[0] == '!') {
            _this2.args.output.push(line.substring(1));

            process(lines);
          } else if (line) {
            _this2.runCommand(line).then(function () {
              return process(lines);
            });
          } else {
            process(lines);
          }
        };

        process(lines);
      });
    }
  }, {
    key: "postRender",
    value: function postRender() {
      var _this3 = this;

      var inputBox = this.tags.input.element;
      var passwordBox = this.tags.password.element;
      this.args.bindTo('input', function (v) {
        inputBox.style.height = 'auto';
        inputBox.style.height = inputBox.scrollHeight + 'px';
      }, {
        frame: 1
      });
      this.args.bindTo('passwordMode', function (v) {
        if (v) {
          inputBox.style.display = 'none';
          passwordBox.style.display = 'unset';
        } else {
          inputBox.style.display = 'unset';
          passwordBox.style.display = 'none';
        }
      });
      this.args.bindTo('passwordMode', function (v) {
        _this3.focus(null, v);
      }, {
        frame: 1
      });
    }
  }, {
    key: "focus",
    value: function focus() {
      var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var passwordMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (event) {
        event.preventDefault();
      }

      if (event && event.target && event.target.matches('input,textarea')) {
        return;
      }

      if (window.getSelection().toString()) {
        return;
      }

      if (passwordMode || this.args.passwordMode) {
        this.tags.password.element.focus();
        return;
      }

      this.tags.input.element.focus();
    }
  }, {
    key: "interpret",
    value: function interpret(command) {
      var _this4 = this;

      this.historyCursor = -1;
      var commands = command.split(/\s*\|\s*/);
      var task = null;
      var topTask = null;

      var _iterator = _createForOfIteratorHelper(commands),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var commandString = _step.value;
          var args = commandString.trim().split(' ');

          var _command = args.shift().trim();

          if (_command.length > 1 && _command.substr(-1) == "?") {
            _command = _command.substr(0, _command.length - 1);

            if (_command in this.path) {
              this.args.output.push("?? ".concat(this.path[_command].helpText));
              this.args.output.push("?? ".concat(this.path[_command].useText));
            }

            continue;
          }

          if (_command in this.path) {
            var cmdClass = this.path[_command]; // console.log(cmdClass);

            task = new cmdClass(args, task, this);
          } else {
            switch (_command) {
              case 'clear':
                this.args.output.splice(0);
                break;

              case 'z':
                this.args.output.splice(0);
                this.args.output.push(new _MeltingText.MeltingText({
                  input: 'lmao!'
                }));
                break;

              case 'commands':
              case '?':
                this.args.output.push("   Subspace Console 0.29a \xA92018-2020 Sean Morris");

                for (var cmd in this.path) {
                  // console.log(cmd, this.path[cmd]);
                  this.args.output.push(" * ".concat(cmd, " - ").concat(this.path[cmd].helpText));
                  this.path[cmd].useText && this.args.output.push("   ".concat(this.path[cmd].useText));
                  this.args.output.push("  ");
                }

                break;

              default:
                this.args.output.push("!! Bad command: ".concat(_command));
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (task) {
        this.tasks.unshift(task);

        var output = function output(event) {
          var prompt = task.outPrompt || task.prompt || _this4.args.prompt || '::';

          _this4.args.output.push("".concat(prompt, " ").concat(event.detail));
        };

        var error = function error(event) {
          var errorPrompt = task.errorPrompt || '!!';

          _this4.args.output.push("".concat(errorPrompt, " ").concat(event.detail));
        };

        task.addEventListener('output', output);
        task.addEventListener('error', error);
        task.execute();
        task["catch"](function (error) {
          return console.error(error);
        });
        task["catch"](function (error) {
          return _this4.args.output.push("!! ".concat(error));
        });
        this.args.prompt = task.prompt;
        task["finally"](function (done) {
          task.removeEventListener('error', error);
          task.removeEventListener('output', output);

          _this4.tasks.shift();

          if (_this4.tasks.length) {
            _this4.args.prompt = _this4.tasks[0].prompt;
          } else {
            _this4.args.prompt = '::';
          }
        });
      }

      this.args.input = '';
      return task;
    }
  }, {
    key: "keydown",
    value: function keydown(event, autocomplete) {
      switch (event.key) {
        case 'Tab':
          if (autocomplete) {
            break;
          }

          event.preventDefault();
          break;

        case 'Enter':
          if (!event.ctrlKey) {
            event.preventDefault();
          }

          break;
      }
    }
  }, {
    key: "keyup",
    value: function keyup(event, autocomplete) {
      var _this5 = this;

      switch (event.key) {
        case 'ArrowDown':
          this.historyCursor--;

          if (this.historyCursor <= -1) {
            this.historyCursor = -1;
            this.args.input = this.originalInput;
            return;
          }

          this.args.input = this.history[this.historyCursor];
          this.onNextFrame(function () {
            var element = _this5.tags.input.element;
            element.selectionStart = element.value.length;
            element.selectionEnd = element.value.length;
          });
          break;

        case 'ArrowUp':
          if (this.historyCursor == -1) {
            this.originalInput = this.args.input;
          }

          this.historyCursor++;

          if (this.historyCursor >= this.history.length) {
            this.historyCursor--;
            return;
          }

          this.args.input = this.history[this.historyCursor];
          this.onNextFrame(function () {
            var element = _this5.tags.input.element;
            element.selectionStart = element.value.length;
            element.selectionEnd = element.value.length;
          });
          break;

        case 'Escape':
          if (this.tasks.length) {
            console.log(_Task.Task.KILL);
            this.tasks[0]["finally"](function () {
              return _this5.args.output.push(":: Killed.");
            });
            this.tasks[0].signal(_Task.Task.KILL);
            this.tasks[0].signal('kill');
          }

          this.args.passwordMode = false;
          break;

        case 'Tab':
          event.preventDefault();

          if (!this.args.input || this.args.input[0] !== '/') {
            break;
          }

          var search = this.args.input.substr(1);

          for (var cmd in this.path) {
            if (cmd.length < search.length) {
              continue;
            }

            if (search === cmd.substr(0, search.length)) {
              this.args.input = '/' + cmd;
              break;
            }
          }

          break;

        case 'Enter':
          if (!event.ctrlKey) {
            event.preventDefault();
          } else {
            return;
          }

          this.runCommand(this.args.input);
          break;

        default:
          this.historyCursor = -1;
          window.scrollTo({
            top: document.body.scrollHeight,
            left: 0,
            behavior: 'smooth'
          });
          break;
      }
    }
  }, {
    key: "cancel",
    value: function cancel(event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }]);

  return Console;
}(_View2.View);

exports.Console = Console;
  })();
});

require.register("subspace-console/Path.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Path = void 0;

var _Task = require("subspace-console/Task");

var Path = {};
exports.Path = Path;
  })();
});

require.register("subspace-console/Task.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Task = void 0;

var _Bindable = require("curvature/base/Bindable");

var _Mixin = require("curvature/base/Mixin");

var _Target = require("./mixin/Target");

var _TaskSignals = require("./mixin/TaskSignals");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

var taskId = 0;
var target = Symbol('target');
var Accept = Symbol('accept');
var Reject = Symbol('reject');
var Execute = Symbol('execute');

var Task = /*#__PURE__*/function (_Mixin$with) {
  _inherits(Task, _Mixin$with);

  var _super = _createSuper(Task);

  function Task() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var prev = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var term = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, Task);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "title", 'Generic Task');

    _defineProperty(_assertThisInitialized(_this), "prompt", '::');

    _this.args = args;
    _this.prev = prev;
    _this.term = term;
    _this.status = -1;
    _this.thread = new Promise(function (accept, reject) {
      _this[Accept] = accept;
      _this[Reject] = reject;
    });
    _this.id = taskId++;

    _this.thread["finally"](function () {
      return console.log(_this.title + ' closed.');
    });

    return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
  }

  _createClass(Task, [{
    key: "then",
    value: function then(callback) {
      return this.thread.then(callback);
    }
  }, {
    key: "catch",
    value: function _catch(callback) {
      return this.thread["catch"](callback);
    }
  }, {
    key: "finally",
    value: function _finally(callback) {
      return this.thread["finally"](callback);
    }
  }, {
    key: "print",
    value: function print(detail) {
      this.dispatchEvent(new CustomEvent('output', {
        detail: detail
      }));
    }
  }, {
    key: "printErr",
    value: function printErr(detail) {
      this.dispatchEvent(new CustomEvent('error', {
        detail: detail
      }));
    }
  }, {
    key: "write",
    value: function write(line) {
      return this.main(line);
    }
  }, {
    key: "signal",
    value: function signal(signalName) {
      console.log(this, "signal::".concat(signalName));

      if (this["signal::".concat(signalName)]) {
        this["signal::".concat(signalName)]();
      }

      switch (signalName) {
        case 'close':
          if (this.dispatchEvent(new CustomEvent('close'))) {
            this.status > 0 ? this[Reject]() : this[Accept]();
          }

          break;

        case 'kill':
          this.status > 0 ? this[Reject]() : this[Accept]();
          break;
      }
    }
  }, {
    key: "execute",
    value: function execute() {
      return this[Execute](this.prev);
    }
  }, {
    key: Execute,
    value: function value() {
      var _this2 = this;

      var onOutputEvent = function onOutputEvent(_ref) {
        var detail = _ref.detail;
        return _this2.write(detail);
      };

      if (prev) {
        prev.addEventListener('output', onOutputEvent);
      }

      console.log(this.title + ' initializing.');
      var init = this.init.apply(this, _toConsumableArray(this.args));
      var prev = this.prev;

      if (!(init instanceof Promise)) {
        init = Promise.resolve(init);
      } else {
        console.log(this.title + ' continues...');
      }

      if (prev) {
        prev[Execute]();
        return Promise.allSettled([prev, init])["finally"](function () {
          prev.then(function (r) {
            return _this2[Accept](r);
          });
          prev["catch"](function (e) {
            return _this2[Reject](r);
          });
          prev.removeEventListener('output', onOutputEvent);
          return _this2.done();
        });
      } else {
        return Promise.allSettled([init]).then(function () {
          try {
            _this2.main(undefined);

            _this2[Accept]();
          } catch (_unused) {
            _this2[Reject]();
          }

          _this2.done();
        });
      }
    }
  }, {
    key: "init",
    value: function init() {}
  }, {
    key: "main",
    value: function main() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    }
  }, {
    key: "done",
    value: function done(results) {
      return this.status;
    }
  }]);

  return Task;
}(_Mixin.Mixin["with"](_Target.Target, _TaskSignals.TaskSignals)); // export class Task extends Target.mix(BaseTask){};


exports.Task = Task;
  })();
});

require.register("subspace-console/mixin/Target.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Target = void 0;

var _Mixin = require("curvature/base/Mixin");

var _Target;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var target = Symbol('target');
var index = 0;
var Target = (_Target = {}, _defineProperty(_Target, _Mixin.Mixin.Constructor, function () {
  try {
    this[target] = new EventTarget();
  } catch (error) {
    this[target] = document.createDocumentFragment();
  }

  this[target].x = index++;
}), _defineProperty(_Target, "dispatchEvent", function dispatchEvent() {
  var _this$target;

  (_this$target = this[target]).dispatchEvent.apply(_this$target, arguments);
}), _defineProperty(_Target, "addEventListener", function addEventListener() {
  var _this$target2;

  (_this$target2 = this[target]).addEventListener.apply(_this$target2, arguments);
}), _defineProperty(_Target, "removeEventListener", function removeEventListener() {
  var _this$target3;

  (_this$target3 = this[target]).removeEventListener.apply(_this$target3, arguments);
}), _Target);
exports.Target = Target;
  })();
});

require.register("subspace-console/mixin/TaskSignals.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskSignals = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TaskSignals = /*#__PURE__*/function () {
  function TaskSignals() {
    _classCallCheck(this, TaskSignals);
  }

  _createClass(TaskSignals, [{
    key: 'signal::kill',
    value: function signalKill() {
      console.log('KILL!');
      this.status > 0 ? this[Reject]() : this[Accept]();
    }
  }, {
    key: 'signal::close',
    value: function signalClose() {
      if (this.dispatchEvent(new CustomEvent('error', {
        detail: detail
      }))) {
        this.status > 0 ? this[Reject]() : this[Accept]();
      }
    }
  }]);

  return TaskSignals;
}();

exports.TaskSignals = TaskSignals;

_defineProperty(TaskSignals, "KILL", 'kill');

_defineProperty(TaskSignals, "CLOSE", 'close');
  })();
});

require.register("subspace-console/view/MeltingText.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MeltingText = void 0;

var _View = require("curvature/base/View");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

var MeltingText = /*#__PURE__*/function (_BaseView) {
  _inherits(MeltingText, _BaseView);

  var _super = _createSuper(MeltingText);

  function MeltingText(args) {
    var _this;

    _classCallCheck(this, MeltingText);

    _this = _super.call(this, args);
    _this.last = _this.init = Date.now();
    _this.charUp = [// '\u030d', /*     ̍     */		'\u030e', /*     ̎     */		'\u0304', /*     ̄     */		'\u0305', /*     ̅     */
    // '\u033f', /*     ̿     */		'\u0311', /*     ̑     */		'\u0306', /*     ̆     */		'\u0310', /*     ̐     */
    // '\u0352', /*     ͒     */		'\u0357', /*     ͗     */		'\u0351', /*     ͑     */		'\u0307', /*     ̇     */
    // '\u0308', /*     ̈     */		'\u030a', /*     ̊     */		'\u0342', /*     ͂     */		'\u0343', /*     ̓     */
    "\u0344",
    /*     ̈́     */

    /*	'\u034a', /*     ͊     */

    /*	'\u034b', /*     ͋     */

    /*	'\u034c', /*     ͌     */
    "\u0303",
    /*     ̃     */

    /*	'\u0302', /*     ̂     */

    /*	'\u030c', /*     ̌     */

    /*	'\u0350', /*     ͐     */
    "\u0300"
    /*     ̀     */
    //	'\u0301', /*     ́     */		'\u030b', /*     ̋     */		'\u030f', /*     ̏     */
    // '\u0312', /*     ̒     */		'\u0313', /*     ̓     */		'\u0314', /*     ̔     */		'\u033d', /*     ̽     */
    // '\u0309', /*     ̉     */		'\u0363', /*     ͣ     */		'\u0364', /*     ͤ     */		'\u0365', /*     ͥ     */
    // '\u0366', /*     ͦ     */		'\u0367', /*     ͧ     */		'\u0368', /*     ͨ     */		'\u0369', /*     ͩ     */
    // '\u036a', /*     ͪ     */		'\u036b', /*     ͫ     */		'\u036c', /*     ͬ     */		'\u036d', /*     ͭ     */
    // '\u036e', /*     ͮ     */		'\u036f', /*     ͯ     */		'\u033e', /*     ̾     */		'\u035b', /*     ͛     */
    ];
    _this.charMid = ["\u0315",
    /*     ̕     */
    "\u031B",
    /*     ̛     */
    "\u0340",
    /*     ̀     */
    "\u0341",
    /*     ́     */
    "\u0358",
    /*     ͘     */
    "\u0321",
    /*     ̡     */
    "\u0322",
    /*     ̢     */
    "\u0327",
    /*     ̧     */
    "\u0328",
    /*     ̨     */
    "\u0334",
    /*     ̴     */
    "\u0335",
    /*     ̵     */
    "\u0336",
    /*     ̶     */
    "\u034F",
    /*     ͏     */
    "\u035C",
    /*     ͜     */
    "\u035D",
    /*     ͝     */
    "\u035E",
    /*     ͞     */
    "\u035F",
    /*     ͟     */
    "\u0360",
    /*     ͠     */

    /*'\u0362',      ͢     */
    "\u0338",
    /*     ̸     */
    "\u0337",
    /*     ̷     */
    "\u0361"
    /*     ͡     */

    /*'\u0489'     ҉_     */
    ];
    _this.charDown = [// '\u0316', /*     ̖     */		'\u0317', /*     ̗     */		'\u0318', /*     ̘     */		'\u0319', /*     ̙     */
    // '\u0316', /*     ̖     */		'\u0317', /*     ̗     */		'\u0318', /*     ̘     */		'\u0319', /*     ̙     */
    // '\u0320', /*     ̠     */		'\u0324', /*     ̤     */		'\u0325', /*     ̥     */		'\u0326', /*     ̦     */
    // '\u0329', /*     ̩     */		'\u032a', /*     ̪     */		'\u032b', /*     ̫     */		'\u032c', /*     ̬     */
    // '\u032d', /*     ̭     */		'\u032e', /*     ̮     */		'\u032f', /*     ̯     */		'\u0330', /*     ̰     */
    // '\u0331', /*     ̱     */		'\u0332', /*     ̲     */		'\u0333', /*     ̳     */		'\u0339', /*     ̹     */
    "\u033A",
    /*     ̺     */
    "\u033B",
    /*     ̻     */
    "\u033C",
    /*     ̼     */
    "\u0345"
    /*     ͅ     */
    //'\u0347', /*     ͇     */		'\u0348', /*     ͈     */		'\u0349', /*     ͉     */		'\u034d', /*     ͍     */
    //'\u034e', /*     ͎     */		'\u0353', /*     ͓     */		'\u0354', /*     ͔     */		'\u0355', /*     ͕     */
    // '\u0356', /*     ͖     */		'\u0359', /*     ͙     */		'\u035a', /*     ͚     */		'\u0323' /*     ̣     */
    ];
    _this.template = "\n\t\t\t<div cv-bind = \"output\" class = \"melting\"></div>\n\t\t";
    _this.args.input = "Magic is no more than the art of employing consciously invisible means to produce visible effects. Will, love, and imagination are magic powers that everyone possesses; and whoever knows how to develop them to their fullest extent is a magician. Magic has but one dogma, namely, that the seen is the measure of the unseen\n"; // this.args.input      = 'anything';

    _this.args.output = 'uh.';
    _this.corruptors = [];
    _this.maxMaxCorrupt = 25;
    _this.maxCorrupt = 0;
    _this.type = '';

    _this.onFrame(function () {
      _this.typewriter(_this.args.input);
    });

    _this.onInterval(16 * 4, function () {
      var selection = window.getSelection();

      if (selection.anchorOffset !== selection.focusOffset) {
        return;
      }

      if (selection.anchorNode !== selection.focusNode) {
        return;
      }

      _this.args.output = _this.corrupt(_this.type); // this.args.output = this.type;
    });

    _this.args.bindTo('input', function (v) {
      _this.type = '';
      _this.corruptors = [];
    });

    return _this;
  }

  _createClass(MeltingText, [{
    key: "age",
    value: function age() {
      return this.init - Date.now();
    }
  }, {
    key: "lastFrame",
    value: function lastFrame() {
      return this.last - Date.now();
    }
  }, {
    key: "corrupt",
    value: function corrupt(v) {
      if (v.length * 1.15 < this.args.input.length) {
        return this.type;
      }

      var chars = v.split('');

      var random = function random(x) {
        return parseInt(Math.random() * x);
      };

      if (random(1024) < 256 && this.maxCorrupt < this.maxMaxCorrupt) {
        this.maxCorrupt += 5;
      }

      for (var _i in chars) {
        this.corruptors[_i] = this.corruptors[_i] || [];

        if (chars[_i].match(/\W/)) {
          continue;
        }

        var charSets = [// this.charDown // Melt Slow
        this.charDown, this.charMid // Melt
        // this.charDown, this.charUp,   this.charMid, // Boil
        // this.charMid, this.charUp, // Burn
        // this.charMid // Simmer
        // this.charUp // Rain
        ];
        var charSet = charSets[random(charSets.length)];

        if (random(8192) < 1) {
          this.corruptors[_i].unshift(charSet[random(charSet.length)]);
        }

        if (this.corruptors[_i].length < this.maxCorrupt) {
          this.corruptors[_i].unshift(charSet[random(charSet.length)]);
        }

        if (random(2048) < 1 && this.maxCorrupt > 25) {
          this.corruptors[_i].splice(5 * random(5));
        }

        this.corruptors[_i].push(this.corruptors[_i].shift());
      }

      for (var i in chars) {
        if (this.corruptors[i]) {
          chars[i] += this.corruptors[i].join('');
        }
      }

      return chars.join('');
    }
  }, {
    key: "typewriter",
    value: function typewriter(v) {
      this.type = this.type || '';

      if (this.type !== v) {
        this.type += v.substr(this.type.length, 1);
        this.onTimeout(150, function () {
          var max = window.scrollY + window.innerHeight;

          if (document.body.scrollHeight > max) {
            window.scrollTo({
              top: document.body.scrollHeight,
              left: 0,
              behavior: 'smooth'
            });
          }
        });
      } else {
        return true;
      }

      return false;
    }
  }]);

  return MeltingText;
}(_View.View);

exports.MeltingText = MeltingText;
  })();
});
require.register("Classifier.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Classifier = void 0;

var _Mixin = require("curvature/base/Mixin");

var _EventTargetMixin = require("curvature/mixin/EventTargetMixin");

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

var Classifier = /*#__PURE__*/function (_Mixin$with) {
  _inherits(Classifier, _Mixin$with);

  var _super = _createSuper(Classifier);

  function Classifier(criteria) {
    var _this;

    var comparator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (criterion, item) {
      return item instanceof criterion;
    };

    _classCallCheck(this, Classifier);

    _this = _super.call(this);
    _this.compare = comparator;
    _this.index = new Map();

    for (var i in criteria) {
      _this.index.set(criteria[i], new Set());
    }

    return _this;
  }

  _createClass(Classifier, [{
    key: "add",
    value: function add(object) {
      var before = new CustomEvent('adding', {
        detail: {
          object: object
        }
      });

      if (!this.dispatchEvent(before)) {
        return;
      }

      var indexes = new Set();

      var _iterator = _createForOfIteratorHelper(this.index.entries()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
              index = _step$value[0],
              list = _step$value[1];

          if (this.compare(index, object)) {
            indexes.add(index);
            list.add(object);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var after = new CustomEvent('added', {
        detail: {
          object: object,
          indexes: indexes
        }
      });
      this.dispatchEvent(after);
    }
  }, {
    key: "remove",
    value: function remove(object) {
      var before = new CustomEvent('removing', {
        detail: {
          object: object
        }
      });

      if (!this.dispatchEvent(before)) {
        return;
      }

      var indexes = new Set();

      var _iterator2 = _createForOfIteratorHelper(this.index.entries()),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
              index = _step2$value[0],
              list = _step2$value[1];

          if (this.compare(index, object)) {
            indexes.add(index);
            list["delete"](object);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var after = new CustomEvent('added', {
        detail: {
          object: object,
          indexes: indexes
        }
      });
      this.dispatchEvent(after);
    }
  }, {
    key: "get",
    value: function get(key) {
      return this.index.get(key);
    }
  }, {
    key: "count",
    value: function count(key) {
      return this.get(key).size;
    }
  }, {
    key: "has",
    value: function has(key) {
      return !!this.count(key);
    }
  }]);

  return Classifier;
}(_Mixin.Mixin["with"](_EventTargetMixin.EventTargetMixin));

exports.Classifier = Classifier;
});

;require.register("Menu/MainMenu.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MainMenu = void 0;

var _Card = require("../intro/Card");

var _Cylinder = require("../effects/Cylinder");

var _Pinch = require("../effects/Pinch");

var _Menu2 = require("./Menu");

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MainMenu = /*#__PURE__*/function (_Menu) {
  _inherits(MainMenu, _Menu);

  var _super = _createSuper(MainMenu);

  function MainMenu(args, parent) {
    var _this;

    _classCallCheck(this, MainMenu);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", require('./main-menu.html'));

    _this.args.cardName = 'main-menu';
    _this.args.haveToken = false;
    _this.args.joinGame = false;
    _this.args.hostGame = false;
    _this.args.copy = 'copy';

    _this.refreshConnection();

    _this.args.items = {
      'Single Player': {
        available: 'available',
        callback: function callback() {
          return _this.remove();
        }
      },
      'Direct Connect': {
        children: {
          'Host a game': {
            callback: function callback() {
              _this.args.hostOutput = '';
              _this.args.hostGame = true;
              _this.args.copy = 'copy';
            }
          },
          'Join a game': {
            callback: function callback() {
              _this.args.joinOutput = '';
              _this.args.joinGame = true;
              _this.args.copy = 'copy';

              _this.client.offer().then(function (token) {
                var tokenString = JSON.stringify(token);
                var encodedToken = "s3ktp://request/".concat(btoa(tokenString));
                _this.args.joinOutput = encodedToken;
                _this.args.haveToken = true;
              });
            }
          }
        }
      },
      'Connect To Server': {
        available: 'unavailable'
      }
    };
    _this.bgm = new Audio('/Sonic/s3k-competition.mp3');
    _this.bgm.volume = 0.5;

    _this.onRemove(function () {
      return _this.bgm.pause();
    });

    _this.bgm.loop = true;
    return _this;
  }

  _createClass(MainMenu, [{
    key: "clear",
    value: function clear() {
      this.args.input = '';
      this.args.joinOutput = '';
      this.args.hostOutput = '';
    }
  }, {
    key: "input",
    value: function input(controller) {
      _get(_getPrototypeOf(MainMenu.prototype), "input", this).call(this, controller);

      if (this.args.warp) {
        this.args.warp.args.dx = (controller.axes[2] ? controller.axes[2].magnitude : 0) * 32;
        this.args.warp.args.dy = (controller.axes[3] ? controller.axes[3].magnitude : 0) * 32;
      }
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this.clear();

      if (this.args.hostGame) {
        this.server.close();
      } else if (this.args.joinGame) {
        this.client.close();
      }

      this.args.connected = false;
      this.args.hostGame = false;
      this.args.joinGame = false;
      this.refreshConnection();
    }
  }, {
    key: "onRendered",
    value: function onRendered() {
      var _this2 = this;

      var debind = this.parent.args.bindTo('audio', function (v) {
        v ? _this2.onTimeout(500, function () {
          return _this2.bgm.play();
        }) : _this2.bgm.pause();
      });

      _get(_getPrototypeOf(MainMenu.prototype), "onRendered", this).call(this, event);

      this.onRemove(debind);
      this.args.warp = new _Pinch.Pinch({
        id: 'menu-warp',
        scale: 64
      });
    }
  }, {
    key: "back",
    value: function back() {
      _get(_getPrototypeOf(MainMenu.prototype), "back", this).call(this);

      this.disconnect();
    }
  }, {
    key: "answer",
    value: function answer() {
      var _this3 = this;

      var offerString = this.args.input;
      var isEncoded = /^s3ktp:\/\/request\/(.+)/.exec(offerString);

      if (isEncoded) {
        offerString = atob(isEncoded[1]);
      }

      var offer = JSON.parse(offerString);
      var answer = this.server.answer(offer);
      answer.then(function (token) {
        var tokenString = JSON.stringify(token);
        var encodedToken = "s3ktp://accept/".concat(btoa(tokenString));
        _this3.args.hostOutput = encodedToken;
        _this3.args.haveToken = true;
      });
      return answer;
    }
  }, {
    key: "accept",
    value: function accept() {
      var answerString = this.args.input;
      var isEncoded = /^s3ktp:\/\/accept\/(.+)/.exec(answerString);

      if (isEncoded) {
        answerString = atob(isEncoded[1]);
      }

      var answer = JSON.parse(answerString);
      this.client.accept(answer);
    }
  }, {
    key: "select",
    value: function select() {
      if (this.args.hostGame) {
        this.tags.hostOutput.select();
      } else if (this.args.joinGame) {
        this.tags.joinOutput.select();
      }
    }
  }, {
    key: "copy",
    value: function copy() {
      if (this.args.hostGame) {
        if (!this.args.input) {
          return;
        }

        this.tags.hostOutput.select();
      } else if (this.args.joinGame) {
        if (!this.args.joinOutput) {
          return;
        }

        this.tags.joinOutput.select();
      }

      document.execCommand("copy");
      this.args.copy = 'copied!';
    }
  }, {
    key: "paste",
    value: function paste(event) {
      var _this4 = this;

      navigator.clipboard.readText().then(function (copied) {
        if (_this4.args.hostGame && copied.match(/^s3ktp:\/\/request\//)) {
          _this4.args.input = copied;

          _this4.answer().then(function (token) {
            _this4.copy();
          });
        }

        if (_this4.args.joinGame && copied.match(/^s3ktp:\/\/accept\//)) {
          _this4.args.input = copied;

          _this4.accept();
        }
      });
    }
  }, {
    key: "refreshConnection",
    value: function refreshConnection() {
      var _this5 = this;

      this.server = this.parent.getServer(true);
      this.client = this.parent.getClient(true);
      var server = this.server;
      var client = this.client;

      var onOpen = function onOpen(event) {
        _this5.parent.args.networked = true;

        _this5.remove();
      };

      var onClose = function onClose(event) {
        return _this5.disconnect();
      };

      this.listen(server, 'open', onOpen);
      this.listen(server, 'close', onClose);
      this.listen(client, 'open', onOpen);
      this.listen(client, 'close', onClose);
    }
  }]);

  return MainMenu;
}(_Menu2.Menu);

exports.MainMenu = MainMenu;
});

;require.register("Menu/Menu.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Menu = void 0;

var _Card2 = require("../intro/Card");

var _Cylinder = require("../effects/Cylinder");

var _Pinch = require("../effects/Pinch");

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

var Menu = /*#__PURE__*/function (_Card) {
  _inherits(Menu, _Card);

  var _super = _createSuper(Menu);

  function Menu(args, parent) {
    var _this;

    _classCallCheck(this, Menu);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", require('./main-menu.html'));

    _this.args.cardName = 'menu';
    _this.args.items = {};
    _this.currentItem = null;
    _this.selector = 'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])';

    _this.onRemove(function () {
      return parent.focus();
    });

    return _this;
  }

  _createClass(Menu, [{
    key: "onRendered",
    value: function onRendered(event) {
      this.focusFirst();
    }
  }, {
    key: "focusFirst",
    value: function focusFirst() {
      var _this2 = this;

      if (!this.tags.bound) {
        return;
      }

      var bounds = this.tags.bound;
      this.args.bindTo('items', function (v) {
        if (!v || !Object.keys(v).length) {
          return;
        }

        var next = _this2.findNext(_this2.currentItem, _this2.tags.bound.node);

        if (next) {
          _this2.focus(next);
        }
      }, {
        frame: 1
      });
    }
  }, {
    key: "findNext",
    value: function findNext(current, bounds) {
      var reverse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var elements = bounds.querySelectorAll(this.selector);

      if (!elements.length) {
        return;
      }

      var found = false;
      var first = null;
      var last = null;

      var _iterator = _createForOfIteratorHelper(elements),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var element = _step.value;

          if (!first) {
            if (!current && !reverse) {
              return element;
            }

            first = element;
          }

          if (!reverse && found) {
            return element;
          }

          if (element === current) {
            if (reverse && last) {
              return last;
            }

            found = true;
          }

          last = element;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (reverse) {
        return last;
      }

      return this.findNext(undefined, bounds, reverse);
    }
  }, {
    key: "focus",
    value: function focus(element) {
      if (element) {
        element.classList.add('focused');
        element.focus();
      }

      if (this.currentItem && this.currentItem !== element) {
        this.blur(this.currentItem);
      }

      this.currentItem = element;
    }
  }, {
    key: "blur",
    value: function blur(element) {
      element.classList.remove('focused');
      element.blur();
    }
  }, {
    key: "input",
    value: function input(controller) {
      var _this3 = this;

      if (!this.tags.bound) {
        return;
      }

      var next;

      if (controller.buttons[12] && controller.buttons[12].time === 1) {
        next = this.findNext(this.currentItem, this.tags.bound.node, true);
      } else if (controller.buttons[13] && controller.buttons[13].time === 1) {
        next = this.findNext(this.currentItem, this.tags.bound.node);
        this.focus(next);
      } else if (controller.buttons[14] && controller.buttons[14].time === 1) {
        this.args.last = 'LEFT';
      } else if (controller.buttons[15] && controller.buttons[15].time === 1) {
        this.args.last = 'RIGHT';
      }

      if (controller.buttons[0] && controller.buttons[0].time === 1) {
        this.currentItem && this.currentItem.click();
        this.args.last = 'A';
      } else if (controller.buttons[1] && controller.buttons[1].time === 1) {
        this.back();
        this.args.last = 'B';
      }

      next && this.onNextFrame(function () {
        return _this3.focus(next);
      });
    }
  }, {
    key: "run",
    value: function run(item) {
      var _this4 = this;

      item.callback && item.callback();

      if (item.children) {
        var prev = this.args.items;
        var back = {
          callback: function callback() {
            return _this4.args.items = prev;
          }
        };
        this.args.items = item.children;
        this.args.items['back'] = this.args.items['back'] || back;
      }
    }
  }, {
    key: "back",
    value: function back() {
      if (this.args.items['back']) {
        this.args.items['back'].callback();
      }
    }
  }]);

  return Menu;
}(_Card2.Card);

exports.Menu = Menu;
});

;require.register("Menu/PauseMenu.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PauseMenu = void 0;

var _Card = require("../intro/Card");

var _Cylinder = require("../effects/Cylinder");

var _Pinch = require("../effects/Pinch");

var _Menu2 = require("./Menu");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PauseMenu = /*#__PURE__*/function (_Menu) {
  _inherits(PauseMenu, _Menu);

  var _super = _createSuper(PauseMenu);

  function PauseMenu(args, parent) {
    var _this;

    _classCallCheck(this, PauseMenu);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", require('./pause-menu.html'));

    _this.args.cardName = 'pause-menu';
    _this.args.animation = '';
    _this.args.items = {
      'Continue': {
        callback: function callback() {
          return parent.args.paused = false;
        }
      },
      'Quit': {
        callback: function callback() {
          return parent.quit();
        }
      }
    };
    return _this;
  }

  return PauseMenu;
}(_Menu2.Menu);

exports.PauseMenu = PauseMenu;
});

;require.register("Menu/main-menu.html", function(exports, require, module) {
module.exports = "<div class = \"screen-card screen-card-[[cardName]] [[animation]]\">\n\n\t<div class = \"menu-scroller\"></div>\n\n\t[[warp]]\n\n\t<section class = \"contents\" cv-if = \"!connected\">\n\t\t<div class = \"menu-container\">\n\t\t\t<div>Sonic 3000</div>\n\t\t\t<ul cv-ref = \"bound\" cv-each = \"items:item:title\">\n\t\t\t\t<li class = \"[[item.available]]\" cv-on = \"click:run(item)\" tabindex=\"0\">[[title]]</li>\n\t\t\t</ul>\n\t\t</div>\n\t</section>\n\n\t<section class = \"contents\" cv-if = \"!connected\">\n\n\t\t<section class = \"contents\" cv-if = \"hostGame\">\n\t\t\t<div class = \"token-exchange\" data-have-token = \"[[haveToken]]\">\n\n\t\t\t\t<label>\n\t\t\t\t\t<p>Input the token from your friend here.</p>\n\t\t\t\t\t<textarea cv-bind = \"input\" cv-on = \"click:paste(event)\"></textarea>\n\t\t\t\t\t<button cv-on = \"click:answer\">go!</button>\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\t<p>Send this token to your friend to get started.</p>\n\t\t\t\t\t<textarea cv-on = \"click:copy\" cv-ref = \"hostOutput\" cv-bind = \"hostOutput\" readonly = \"true\"></textarea>\n\t\t\t\t\t<button cv-on = \"click:copy\">[[copy]]</button>\n\n\t\t\t\t\t<div class = \"close\" cv-on = \"click:disconnect\"></div>\n\t\t\t\t</label>\n\n\t\t\t</div>\n\t\t</section>\n\n\t\t<section class = \"contents\" cv-if = \"joinGame\">\n\t\t\t<div class = \"token-exchange\">\n\n\t\t\t\t<label cv-if = \"haveToken\">\n\t\t\t\t\t<p>Send this token to your friend to get started.</p>\n\t\t\t\t\t<textarea cv-on = \"click:copy\" cv-ref = \"joinOutput\" cv-bind = \"joinOutput\" readonly = \"true\"></textarea>\n\t\t\t\t\t<button cv-on = \"click:copy\">[[copy]]</button>\n\t\t\t\t</label>\n\n\t\t\t\t<label cv-if = \"haveToken\">\n\t\t\t\t\t<p>Input the token they send back here.</p>\n\t\t\t\t\t<textarea cv-bind = \"input\" cv-on = \"click:paste(event)\"></textarea>\n\t\t\t\t\t<button cv-on = \"click:accept\">go!</button>\n\t\t\t\t\t<div class = \"close\" cv-on = \"click:disconnect\"></div>\n\t\t\t\t</label>\n\n\t\t\t</div>\n\t\t</section>\n\n\t</section>\n</div>\n"
});

;require.register("Menu/pause-menu.html", function(exports, require, module) {
module.exports = "<div class = \"screen-card screen-card-[[cardName]] [[animation]]\">\n\n\t<div class = \"menu-scroller\"></div>\n\n\t[[warp]]\n\n\t<section class = \"contents\" cv-if = \"!connected\">\n\n\t\t<div class = \"menu-container\">\n\n\t\t\t<div>Sonic 3000</div>\n\n\t\t\t<ul cv-ref = \"bound\" cv-each = \"items:item:title\">\n\t\t\t\t<li class = \"[[item.available]]\" cv-on = \"click:run(item)\" tabindex=\"0\">[[title]]</li>\n\t\t\t</ul>\n\n\t\t</div>\n\n\t</section>\n\n</div>\n"
});

;require.register("ObjectPalette.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ObjectPalette = void 0;

var _Block = require("./actor/Block");

var _QuestionBlock = require("./actor/QuestionBlock");

var _BrokenMonitor = require("./actor/BrokenMonitor");

var _MarbleBlock = require("./actor/MarbleBlock");

var _CompanionBlock = require("./actor/CompanionBlock");

var _LayerSwitch = require("./actor/LayerSwitch");

var _Explosion = require("./actor/Explosion");

var _StarPost = require("./actor/StarPost");

var _Emerald = require("./actor/Emerald");

var _Window = require("./actor/Window");

var _Monitor = require("./actor/Monitor");

var _Spring = require("./actor/Spring");

var _Ring = require("./actor/Ring");

var _Coin = require("./actor/Coin");

var _WaterFall = require("./actor/WaterFall");

var _WaterJet = require("./actor/WaterJet");

var _PowerupGlow = require("./actor/PowerupGlow");

var _PointActor = require("./actor/PointActor");

var _Projectile = require("./actor/Projectile");

var _TextActor = require("./actor/TextActor");

var _EggMobile = require("./actor/EggMobile");

var _DrillCar = require("./actor/DrillCar");

var _Tornado = require("./actor/Tornado");

var _NuclearSuperball = require("./actor/NuclearSuperball");

var _MechaSonic = require("./actor/MechaSonic");

var _Eggrobo = require("./actor/Eggrobo");

var _Eggman = require("./actor/Eggman");

var _Sonic = require("./actor/Sonic");

var _Tails = require("./actor/Tails");

var _Knuckles = require("./actor/Knuckles");

var _Seymour = require("./actor/Seymour");

var _Rocks = require("./actor/Rocks");

var _Switch = require("./actor/Switch");

var _Balloon = require("./actor/Balloon");

var _Region = require("./region/Region");

var _WaterRegion = require("./region/WaterRegion");

var _ShadeRegion = require("./region/ShadeRegion");

// import { SuperRing }   from './actor/SuperRing';
var ObjectPalette = {
  player: _NuclearSuperball.NuclearSuperball,
  spring: _Spring.Spring,
  'layer-switch': _LayerSwitch.LayerSwitch,
  'star-post': _StarPost.StarPost,
  'projectile': _Projectile.Projectile,
  'block': _Block.Block,
  'q-block': _QuestionBlock.QuestionBlock,
  'marble-block': _MarbleBlock.MarbleBlock,
  'companion-block': _CompanionBlock.CompanionBlock,
  'drill-car': _DrillCar.DrillCar,
  'tornado': _Tornado.Tornado,
  'egg-mobile': _EggMobile.EggMobile,
  'rocks-tall': _Rocks.Rocks,
  'rocks-med': _Rocks.Rocks,
  'rocks-short': _Rocks.Rocks,
  'mecha-sonic': _MechaSonic.MechaSonic,
  'sonic': _Sonic.Sonic,
  'tails': _Tails.Tails,
  'knuckles': _Knuckles.Knuckles,
  'eggman': _Eggman.Eggman,
  'eggrobo': _Eggrobo.Eggrobo,
  'seymour': _Seymour.Seymour,
  'switch': _Switch.Switch,
  'window': _Window.Window,
  'emerald': _Emerald.Emerald,
  'region': _WaterRegion.WaterRegion,
  'shade-region': _ShadeRegion.ShadeRegion,
  'ring': _Ring.Ring // , 'super-ring':   SuperRing
  ,
  'coin': _Coin.Coin,
  'powerup-glow': _PowerupGlow.PowerupGlow,
  'explosion': _Explosion.Explosion,
  'text-actor': _TextActor.TextActor,
  'water-jet': _WaterJet.WaterJet,
  'water-fall': _WaterFall.WaterFall,
  'balloon': _Balloon.Balloon
};
exports.ObjectPalette = ObjectPalette;
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

;require.register("abilities/LightDash.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LightDash = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LightDash = function LightDash() {
  _classCallCheck(this, LightDash);
};

exports.LightDash = LightDash;
});

;require.register("actor/Balloon.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Balloon = void 0;

var _PointActor2 = require("./PointActor");

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

var Balloon = /*#__PURE__*/function (_PointActor) {
  _inherits(Balloon, _PointActor);

  var _super = _createSuper(Balloon);

  function Balloon() {
    var _this;

    _classCallCheck(this, Balloon);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-balloon';
    _this.args["float"] = -1;
    _this.args.width = 32;
    _this.args.height = 32;
    _this.args.airAngle = -Math.PI;
    return _this;
  }

  _createClass(Balloon, [{
    key: "update",
    value: function update() {
      if (this.attachedTo) {
        var other = this.attachedTo;
        var attach = other.rotatePoint(0, other.args.height + 8);
        this.args.x = other.x + attach[0];
        this.args.y = other.y + attach[1];
        this.args.airAngle = other.realAngle;
      }
    }
  }, {
    key: "collideA",
    value: function collideA(other) {
      if (!other.controllable) {
        return;
      }

      this.attachedTo = other;
    } // get solid() { return false; }
    // get effect() { return true; }

  }]);

  return Balloon;
}(_PointActor2.PointActor);

exports.Balloon = Balloon;
});

;require.register("actor/Block.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Block = void 0;

var _PointActor2 = require("./PointActor");

var _QuintIn = require("curvature/animate/ease/QuintIn");

var _QuintOut = require("curvature/animate/ease/QuintOut");

var _QuintInOut = require("curvature/animate/ease/QuintInOut");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Block = /*#__PURE__*/function (_PointActor) {
  _inherits(Block, _PointActor);

  var _super = _createSuper(Block);

  _createClass(Block, null, [{
    key: "fromDef",
    value: function fromDef(objDef) {
      var obj = _get(_getPrototypeOf(Block), "fromDef", this).call(this, objDef);

      obj.args.width = objDef.width;
      obj.args.height = objDef.height;
      obj.args.x = obj.originalX = Math.floor((objDef.x + Math.floor(objDef.width / 32) * 16) / 32) * 32;
      obj.args.y = obj.originalY = Math.floor(objDef.y / 32) * 32;
      return obj;
    }
  }]);

  function Block() {
    var _args$collapse;

    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Block);

    _this = _super.call(this, args);
    _this.args.type = 'actor-item actor-block';
    _this.args.width = args.width || 32;
    _this.args.height = args.height || 32;
    _this.originalX = _this.args.x;
    _this.originalY = _this.args.y;
    _this.args.solid = true;
    _this.args.gravity = 0.5;
    _this.args["float"] = -1;
    _this.args.collapse = (_args$collapse = args.collapse) !== null && _args$collapse !== void 0 ? _args$collapse : false;
    _this.ease = new _QuintInOut.QuintInOut(_this["public"].period);

    _this.ease.start();

    return _this;
  }

  _createClass(Block, [{
    key: "collideA",
    value: function collideA(other, type) {
      // if(other instanceof this.constructor)
      // {
      // 	return false;
      // }
      if (!other.controllable && !other.isVehicle) {
        return true;
      }

      if (this.args["float"] > 0) {
        return true;
      }

      if (this["public"].collapse && type === 0) {
        this.args["float"] = 5;
      }

      return true;
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;

      _get(_getPrototypeOf(Block.prototype), "update", this).call(this);

      if (this["public"]["float"] && this["public"].oscillateX) {
        var moveX = Math.round(this.ease.current() * this["public"].oscillateX);
        this.args.x = this.originalX - moveX;
      }

      if (this["public"]["float"] && this["public"].oscillateY) {
        var moveY = Math.round(this.ease.current() * this["public"].oscillateY);
        this.args.y = this.originalY - moveY;
      }

      if (this.ease.done && !this.nextEase) {
        var reverse = this.ease.reverse;
        var Ease = _QuintInOut.QuintInOut;
        this.nextEase = new Ease(this["public"].period, {
          reverse: !reverse
        });
        ;
      }

      if (this.nextEase) {
        this.ease = this.nextEase;
        this.nextEase = false;
        this.onTimeout(1000, function () {
          _this2.ease.start();
        });
      }

      if (!this["public"]["float"] && this["public"].ySpeed === 0 && !this.reset) {
        this.reset = this.onTimeout(5000, function () {
          _this2.args.falling = true;
          _this2.args["float"] = -1;
          _this2.args.goBack = true;
          _this2.reset = false;
        });
      }

      if (this["public"].goBack) {
        this.args["float"] = -1;
        var distX = this.originalX - this.args.x;
        var distY = this.originalY - this.args.y;

        if (Math.abs(distX) > 3) {
          this.args.x += Math.sign(distX) * 1;
        } else {
          this.args.x = this.originalX;
        }

        if (Math.abs(distY) > 3) {
          this.args.y += Math.sign(distY) * 3;
        } else {
          this.args.y = this.originalY;
        }

        if (this["public"].x === this.originalX && this.args.y === this.originalY) {
          this.args.goBack = false;
        }
      }
    }
  }, {
    key: "rotateLock",
    get: function get() {
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
      return !this["public"].collapse || this["public"]["float"] !== 0 || !this["public"].goBack;
    }
  }]);

  return Block;
}(_PointActor2.PointActor);

exports.Block = Block;
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

var _Monitor = require("../actor/Monitor");

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
    key: "collideA",
    value: function collideA(other) {
      // if(other instanceof Monitor)
      // {
      // 	this.viewport && this.viewport.actors.remove(this);
      // 	return false;
      // }
      _get(_getPrototypeOf(BrokenMonitor.prototype), "collideA", this).call(this, other);

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

;require.register("actor/Coin.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Coin = void 0;

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

var Coin = /*#__PURE__*/function (_PointActor) {
  _inherits(Coin, _PointActor);

  var _super = _createSuper(Coin);

  function Coin() {
    var _this;

    _classCallCheck(this, Coin);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-coin';
    _this.args.width = 32;
    _this.args.height = 32;
    _this.args["float"] = -1;
    _this.args.gone = false;
    return _this;
  }

  _createClass(Coin, [{
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(Coin.prototype), "update", this).call(this);

      if (this.viewport.args.audio && !this.sample) {
        this.sample = new Audio('/mario/smw_coin.wav');
        this.sample.volume = 1;
      }
    }
  }, {
    key: "collideA",
    value: function collideA(other) {
      var _this2 = this;

      _get(_getPrototypeOf(Coin.prototype), "collideA", this).call(this, other);

      if (this.args.gone) {
        return;
      }

      this.args.type = 'actor-item actor-coin collected';

      if (!this.args.gone) {
        if (this.viewport.args.audio && this.sample) {
          this.sample.play();
        }

        this.onTimeout(240, function () {
          _this2.args.type = 'actor-item actor-coin collected gone';
        });
        this.onTimeout(480, function () {
          _this2.viewport.actors.remove(_this2);

          _this2.remove();
        });
        var x = this.x;
        var y = this.y; // const viewport = this.viewport;
        // viewport.spawn.add({
        // 	time: Date.now() + 7500
        // 	, frame:  this.viewport.args.frameId + 450
        // 	, object: new Coin({x,y})
        // });

        if (other.args.owner) {
          other.args.owner.args.coins += 1;
        } else if (other.occupant) {
          other.occupant.args.coins += 1;
        } else {
          other.args.coins += 1;
        }
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

  return Coin;
}(_PointActor2.PointActor);

exports.Coin = Coin;
});

;require.register("actor/CompanionBlock.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CompanionBlock = void 0;

var _MarbleBlock2 = require("./MarbleBlock");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var CompanionBlock = /*#__PURE__*/function (_MarbleBlock) {
  _inherits(CompanionBlock, _MarbleBlock);

  var _super = _createSuper(CompanionBlock);

  function CompanionBlock() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, CompanionBlock);

    _this = _super.call(this, args);
    _this.args.type = 'actor-item actor-marble-companion-block';
    return _this;
  }

  return CompanionBlock;
}(_MarbleBlock2.MarbleBlock);

exports.CompanionBlock = CompanionBlock;
});

;require.register("actor/DrillCar.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DrillCar = void 0;

var _Vehicle2 = require("./Vehicle");

var _Tag = require("curvature/base/Tag");

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

var DrillCar = /*#__PURE__*/function (_Vehicle) {
  _inherits(DrillCar, _Vehicle);

  var _super = _createSuper(DrillCar);

  function DrillCar() {
    var _this;

    _classCallCheck(this, DrillCar);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-drill-car';
    _this.args.width = 64;
    _this.args.height = 48;
    _this.removeTimer = null;
    _this.args.gSpeedMax = 20;
    _this.args.decel = 0.30;
    _this.args.accel = 0.75;
    _this.args.seatHeight = 34;
    _this.args.skidTraction = 0.95;
    _this.dustCount = 0;
    _this.args.particleScale = 2;
    return _this;
  }

  _createClass(DrillCar, [{
    key: "onAttached",
    value: function onAttached() {
      this.box = this.findTag('div');
      this.sprite = this.findTag('div.sprite');
      this.backSprite = new _Tag.Tag('<div class = "sprite-back sprite">');
      this.drill = new _Tag.Tag('<div class = "drill-car-drill">');
      this.seat = new _Tag.Tag('<div class = "drill-car-seat">');
      this.windsheild = new _Tag.Tag('<div class = "drill-car-windsheild">');
      this.copterCap = new _Tag.Tag('<div class = "drill-car-copter-cap">');
      this.copterBladeA = new _Tag.Tag('<div class = "drill-car-copter-blade-a">');
      this.copterBladeB = new _Tag.Tag('<div class = "drill-car-copter-blade-b">');
      this.frontWheelA = new _Tag.Tag('<div class = "drill-car-tire drill-car-tire-front-a">');
      this.frontWheelB = new _Tag.Tag('<div class = "drill-car-tire drill-car-tire-front-b">');
      this.backWheelA = new _Tag.Tag('<div class = "drill-car-tire drill-car-tire-back-a">');
      this.backWheelB = new _Tag.Tag('<div class = "drill-car-tire drill-car-tire-back-b">');
      this.sprite.appendChild(this.drill.node);
      this.backSprite.appendChild(this.copterCap.node);
      this.backSprite.appendChild(this.copterBladeA.node);
      this.backSprite.appendChild(this.copterBladeB.node);
      this.sprite.appendChild(this.windsheild.node);
      this.backSprite.appendChild(this.seat.node);
      this.sprite.appendChild(this.frontWheelA.node);
      this.backSprite.appendChild(this.frontWheelB.node);
      this.sprite.appendChild(this.backWheelA.node);
      this.backSprite.appendChild(this.backWheelB.node);
      this.box.appendChild(this.backSprite.node);
    }
  }, {
    key: "update",
    value: function update() {
      var falling = this.args.falling;

      if (this.viewport.args.audio && !this.flyingSound) {
        this.flyingSound = new Audio('/Sonic/drill-car-copter.wav');
        this.flyingSound.volume = 0.35 + Math.random() * -0.2;
        this.flyingSound.loop = true;
      }

      if (this.flyingSound) {
        if (!this.flyingSound.paused) {
          this.flyingSound.volume = 0.25 + Math.random() * -0.2;
        }

        if (this.flyingSound.currentTime > 0.2) {
          this.flyingSound.currentTime = 0.0;
        }
      }

      if (!this.box) {
        _get(_getPrototypeOf(DrillCar.prototype), "update", this).call(this);

        return;
      }

      if (!falling) {
        this.flyingSound && this.flyingSound.pause();
        var direction = this.args.direction;
        var gSpeed = this.args.gSpeed;
        var speed = Math.abs(gSpeed);
        var maxSpeed = this.args.gSpeedMax;

        if (this.dustCount > 0) {
          this.dustCount--;
        }

        if (Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5) {
          this.box.setAttribute('data-animation', 'skidding');
          var viewport = this.viewport;
          var particleA = new _Tag.Tag('<div class = "particle-dust">');
          var pointA = this.rotatePoint(this.args.gSpeed, 0);
          particleA.style({
            '--x': pointA[0] + this.x,
            '--y': pointA[1] + this.y,
            'z-index': 0,
            opacity: Math.random() * 2
          });
          var particleB = new _Tag.Tag('<div class = "particle-dust">');
          var pointB = this.rotatePoint(this.args.gSpeed + 40 * this.args.direction, 0);
          particleB.style({
            '--x': pointB[0] + this.x,
            '--y': pointB[1] + this.y,
            'z-index': 0,
            opacity: Math.random() * 2
          });
          viewport.particles.add(particleA);
          viewport.particles.add(particleB);
          setTimeout(function () {
            viewport.particles.remove(particleA);
            viewport.particles.remove(particleB);
          }, 350);
        } else if (this.args.moving && speed > maxSpeed * 0.75) {
          this.box.setAttribute('data-animation', 'running');
        } else if (this.args.moving && speed) {
          this.box.setAttribute('data-animation', 'walking');
        } else {
          this.box.setAttribute('data-animation', 'standing');
        }
      } else if (this.args.flying) {
        this.box.setAttribute('data-animation', 'flying');
      } else if (this.args.falling) {
        this.flyingSound && this.flyingSound.pause();
        this.box.setAttribute('data-animation', 'jumping');
      }

      if (this.args.copterCoolDown == 0) {
        if (this.args.ySpeed > 5) {
          this.flyingSound && this.flyingSound.pause();
          this.args.flying = false;
        }
      } else if (this.args.copterCoolDown > 0) {
        this.args.copterCoolDown--;
      }

      _get(_getPrototypeOf(DrillCar.prototype), "update", this).call(this);
    }
  }, {
    key: "command_0",
    value: function command_0() {
      if (!this.args.falling) {
        this.args.copterCoolDown = 15;

        _get(_getPrototypeOf(DrillCar.prototype), "command_0", this).call(this);

        return;
      }

      if (this.args.copterCoolDown > 0) {
        return;
      }

      if (this.args.ySpeed > 1) {
        if (!this.args.flying) {
          this.flyingSound && this.flyingSound.play();
        }

        this.args.flying = true;

        if (this.args.copterCoolDown == 0) {
          this.args.copterCoolDown = 7;
        }

        this.args.ySpeed = -1;
        this.args["float"] = 8;
      }
    }
  }, {
    key: "sleep",
    value: function sleep() {
      this.flyingSound && this.flyingSound.pause();
    }
  }, {
    key: "solid",
    get: function get() {
      return !this.occupant;
    }
  }]);

  return DrillCar;
}(_Vehicle2.Vehicle);

exports.DrillCar = DrillCar;
});

;require.register("actor/EggMobile.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EggMobile = void 0;

var _Vehicle2 = require("./Vehicle");

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

var EggMobile = /*#__PURE__*/function (_Vehicle) {
  _inherits(EggMobile, _Vehicle);

  var _super = _createSuper(EggMobile);

  function EggMobile() {
    var _this;

    _classCallCheck(this, EggMobile);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-vehicle actor-eggmobile';
    _this.args.accel = 0.15;
    _this.args.decel = 0.8;
    _this.args.gSpeedMax = 15;
    _this.args.xSpeedMax = 25;
    _this.args.ySpeedMax = 30;
    _this.args.jumpForce = 12;
    _this.args.gravity = 0.6;
    _this.args.width = 54;
    _this.args.height = 20;
    _this.args["float"] = -1;
    _this.args.yMargin = 42;
    _this.args.falling = true;
    _this.args.flying = true;
    return _this;
  }

  _createClass(EggMobile, [{
    key: "update",
    value: function update() {
      if (Math.abs(this.yAxis) > 0.1) {
        if (Math.abs(this.args.ySpeed) < this.args.ySpeedMax) {
          var ySpeed = this.args.ySpeed;

          if (Math.sign(this.yAxis) === Math.sign(this.args.ySpeed)) {
            ySpeed += this.yAxis * this.args.accel * 3;
          } else {
            ySpeed += this.yAxis * this.args.accel * 6;
          }

          ySpeed = Math.floor(ySpeed * 1000) / 1000;
          this.args.ySpeed = ySpeed;
        }
      } else {
        this.args.ySpeed = this.args.ySpeed * this.args.decel;
      }

      if (!this.xAxis) {
        this.args.xSpeed = this.args.xSpeed * this.args.decel;
      }

      this.args.falling = true;
      this.args.flying = true;
      this.args.mode = 0;

      _get(_getPrototypeOf(EggMobile.prototype), "update", this).call(this);
    }
  }, {
    key: "solid",
    get: function get() {
      return true;
    }
  }]);

  return EggMobile;
}(_Vehicle2.Vehicle);

exports.EggMobile = EggMobile;
});

;require.register("actor/Eggman.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Eggman = void 0;

var _PointActor2 = require("./PointActor");

var _Tag = require("curvature/base/Tag");

var _SkidDust = require("../behavior/SkidDust");

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

var Eggman = /*#__PURE__*/function (_PointActor) {
  _inherits(Eggman, _PointActor);

  var _super = _createSuper(Eggman);

  function Eggman() {
    var _this;

    _classCallCheck(this, Eggman);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _this.behaviors.add(new _SkidDust.SkidDust());

    _this.args.type = 'actor-item actor-eggman';
    _this.accelNormal = 0.15;
    _this.accelSuper = 0.30;
    _this.args.accel = 0.15;
    _this.args.decel = 0.3;
    _this.args.normalHeight = 40;
    _this.args.rollingHeight = 23;
    _this.gSpeedMaxNormal = 16;
    _this.gSpeedMaxSuper = 28;
    _this.args.gSpeedMax = _this.gSpeedMaxNormal;
    _this.args.normalHeight = 57;
    _this.args.rollingHeight = 32;
    _this.jumpForceNormal = 11;
    _this.jumpForceSuper = 18;
    _this.args.jumpForce = _this.jumpForceNormal;
    _this.args.gravity = 0.5;
    _this.args.width = 32;
    _this.args.height = 57;
    _this.args.spriteSheet = _this.spriteSheet = '/Sonic/eggman.png';
    _this.superSpriteSheet = '/Sonic/eggman-super.png';
    return _this;
  }

  _createClass(Eggman, [{
    key: "onAttached",
    value: function onAttached() {
      this.box = this.findTag('div');
    }
  }, {
    key: "update",
    value: function update() {
      var falling = this.args.falling;

      if (!this.box) {
        _get(_getPrototypeOf(Eggman.prototype), "update", this).call(this);

        return;
      } else if (this.yAxis > 0) {
        this.args.crouching = true;
      } else {
        this.args.crouching = false;
      }

      var direction = this.args.direction;
      var gSpeed = this.args.gSpeed;
      var speed = Math.abs(gSpeed);
      var maxSpeed = this.args.gSpeedMax;

      if (falling) {
        this.box.setAttribute('data-animation', 'jumping');
        this.args.height = this["public"].rollingHeight;
      } else if (this["public"].rolling) {
        this.args.height = this["public"].rollingHeight;

        if (this["public"].direction !== Math.sign(this["public"].gSpeed)) {
          this.args.direction = Math.sign(this["public"].gSpeed);

          if (this.args.direction < 0) {
            this.args.facing = 'left';
          } else {
            this.args.facing = 'right';
          }
        }

        this.box.setAttribute('data-animation', 'rolling');
      } else {
        this.args.height = this["public"].normalHeight;

        if (Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5) {
          this.box.setAttribute('data-animation', 'skidding');
        } else if (speed > maxSpeed / 2) {
          this.box.setAttribute('data-animation', 'running');
        } else if (this.args.moving && gSpeed) {
          this.box.setAttribute('data-animation', 'walking');
        } else if (this.args.crouching || this.standingOn && this.standingOn.isVehicle) {
          this.box.setAttribute('data-animation', 'crouching');
        } else {
          this.box.setAttribute('data-animation', 'standing');
        }
      }

      _get(_getPrototypeOf(Eggman.prototype), "update", this).call(this);
    }
  }, {
    key: "command_3",
    value: function command_3() {
      var _this2 = this;

      this.isSuper = !this.isSuper;
      this.onTimeout(150, function () {
        if (_this2.args.rings === 0) {
          // this.isSuper = false;
          _this2.setProfile();
        }

        ;
      });
      this.setProfile();
    }
  }, {
    key: "setProfile",
    value: function setProfile() {
      if (this.isSuper) {
        this.args.spriteSheet = this.superSpriteSheet;
        this.args.gSpeedMax = this.gSpeedMaxSuper;
        this.args.jumpForce = this.jumpForceSuper;
        this.args.accel = this.accelSuper;
      } else {
        this.args.spriteSheet = this.spriteSheet;
        this.args.gSpeedMax = this.gSpeedMaxNormal;
        this.args.jumpForce = this.jumpForceNormal;
        this.args.accel = this.accelNormal;
      }
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "canRoll",
    get: function get() {
      return true;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return false;
    }
  }, {
    key: "controllable",
    get: function get() {
      return true;
    }
  }]);

  return Eggman;
}(_PointActor2.PointActor);

exports.Eggman = Eggman;
});

;require.register("actor/Eggrobo.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Eggrobo = void 0;

var _PointActor2 = require("./PointActor");

var _Projectile = require("./Projectile");

var _Tag = require("curvature/base/Tag");

var _SkidDust = require("../behavior/SkidDust");

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

var Eggrobo = /*#__PURE__*/function (_PointActor) {
  _inherits(Eggrobo, _PointActor);

  var _super = _createSuper(Eggrobo);

  function Eggrobo() {
    var _this;

    _classCallCheck(this, Eggrobo);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _this.behaviors.add(new _SkidDust.SkidDust());

    _this.args.type = 'actor-item actor-eggrobo';
    _this.args.accel = 0.125;
    _this.args.decel = 0.3;
    _this.args.gSpeedMax = 12;
    _this.args.jumpForce = 11;
    _this.args.gravity = 0.5;
    _this.args.width = 32;
    _this.args.height = 57;
    return _this;
  }

  _createClass(Eggrobo, [{
    key: "onAttached",
    value: function onAttached() {
      this.box = this.findTag('div');
      this.sprite = this.findTag('div.sprite');
      this.flame = new _Tag.Tag('<div class = "eggrobo-flame">');
      this.muzzleFlash = new _Tag.Tag('<div class = "eggrobo-muzzle-flash">');
      this.sprite.appendChild(this.flame.node);
      this.sprite.appendChild(this.muzzleFlash.node);
    }
  }, {
    key: "update",
    value: function update() {
      var falling = this.args.falling;

      if (this.viewport.args.audio && !this.shootingSample) {
        this.shootingSample = new Audio('/Sonic/shot-fired.wav');
        this.thrusterSound = new Audio('/Sonic/mecha-sonic-thruster.wav');
        this.thrusterSound.loop = true;
      }

      if (this.thrusterSound) {
        if (this.thrusterSound.currentTime > 0.4 + Math.random() / 10) {
          this.thrusterSound.currentTime = 0.05;
        }

        this.thrusterSound.volume = 0.2 + Math.random() * -0.05;
      }

      if (!this.box) {
        _get(_getPrototypeOf(Eggrobo.prototype), "update", this).call(this);

        return;
      }

      if (!falling) {
        if (this.yAxis > 0) {
          this.args.crouching = true;
        } else {
          this.args.crouching = false;
        }

        var direction = this.args.direction;
        var gSpeed = this.args.gSpeed;
        var speed = Math.abs(gSpeed);
        var maxSpeed = this.args.gSpeedMax;

        if (Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5) {
          this.thrusterSound && this.thrusterSound.pause();
          this.box.setAttribute('data-animation', 'skidding');
        } else if (speed > maxSpeed / 2) {
          this.thrusterSound && this.thrusterSound.pause();
          this.box.setAttribute('data-animation', 'running');
        } else if (this.args.moving && gSpeed) {
          this.box.setAttribute('data-animation', 'walking');
        } else if (this.args.crouching || this.standingOn && this.standingOn.isVehicle) {
          this.box.setAttribute('data-animation', 'crouching');
        } else {
          this.box.setAttribute('data-animation', 'standing');
        }
      } else {
        this.args.crouching = false;
        this.box.setAttribute('data-animation', 'jumping');
      }

      if (!this.args.falling) {
        this.args.flying = false;
      }

      if (this.args.flying) {
        this.box.setAttribute('data-animation', 'flying');
      } else if (this.args.falling) {
        this.box.setAttribute('data-animation', 'jumping');
      }

      if (this.args.shotCoolDown > 0) {
        this.args.shotCoolDown--;
      }

      if (this.args.rocketCoolDown == 0) {
        this.thrusterSound && this.thrusterSound.pause();
      }

      if (this.args.rocketCoolDown > 0) {
        this.args.rocketCoolDown--;
      }

      if (this.args.rocketCoolDown == 0) {
        this.args.flying = false;
      }

      _get(_getPrototypeOf(Eggrobo.prototype), "update", this).call(this);
    }
  }, {
    key: "hold_0",
    value: function hold_0() {
      if (!this.args.falling) {
        this.args.rocketCoolDown = 5;
        return;
      }

      if (this.args.ySpeed > 1 || this.args.flying) {
        this.args.flying = true;

        if (this.args.rocketCoolDown <= 1) {
          this.thrusterSound && this.thrusterSound.play();
          this.args.rocketCoolDown = 3;
        }

        this.args.ySpeed = 0;
        this.args["float"] = 4;
      }
    }
  }, {
    key: "hold_2",
    value: function hold_2() {
      var _this2 = this;

      if (this.args.shotCoolDown > 0) {
        return;
      }

      var direction = Math.sign(this.args.direction);
      var groundAngle = this.args.groundAngle;
      var offset, trajectory, spotAngle;

      switch (this.args.mode) {
        case 0:
          spotAngle = -groundAngle - Math.PI / 2 + Math.PI / 4 * direction;
          trajectory = -groundAngle;
          break;

        case 1:
          spotAngle = -groundAngle + Math.PI / 4 * direction;
          trajectory = -groundAngle + Math.PI / 2;
          break;

        case 2:
          spotAngle = -groundAngle + Math.PI / 2 + Math.PI / 4 * direction;
          trajectory = -groundAngle - Math.PI;
          break;

        case 3:
          spotAngle = -groundAngle - Math.PI + Math.PI / 4 * direction;
          trajectory = -groundAngle;
          break;
      }

      offset = [50 * Math.cos(spotAngle), 50 * Math.sin(spotAngle)];

      if (this.args.falling || this.args.crouching) {
        trajectory = 0;
        offset = [26 * direction, -26];
      }

      var projectile = new _Projectile.Projectile({
        direction: this["public"].direction,
        x: this["public"].x + offset[0],
        y: this["public"].y + offset[1],
        owner: this
      });
      projectile.impulse(16, trajectory + (direction < 0 ? Math.PI : 0), true);
      projectile.update();
      this.viewport.auras.add(projectile);
      this.viewport.spawn.add({
        object: projectile
      });
      this.box.setAttribute('data-shooting', 'true');
      this.onTimeout(140, function () {
        _this2.box.setAttribute('data-shooting', 'false');
      });

      if (this.viewport.args.audio && this.shootingSample) {
        this.shootingSample.volume = 0.6 + Math.random() * -0.3;
        this.shootingSample.currentTime = 0;
        this.shootingSample.play();
      }

      this.args.shotCoolDown = 4;
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return false;
    }
  }, {
    key: "controllable",
    get: function get() {
      return true;
    }
  }]);

  return Eggrobo;
}(_PointActor2.PointActor);

exports.Eggrobo = Eggrobo;
});

;require.register("actor/Emerald.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Emerald = void 0;

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

var Emerald = /*#__PURE__*/function (_PointActor) {
  _inherits(Emerald, _PointActor);

  var _super = _createSuper(Emerald);

  function Emerald() {
    var _this;

    _classCallCheck(this, Emerald);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-emerald emerald-' + (_this.args.color || 'white');
    _this.args.width = 12;
    _this.args.height = 12;
    return _this;
  }

  _createClass(Emerald, [{
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(Emerald.prototype), "update", this).call(this);

      var viewport = this.viewport;

      if (!viewport) {
        return;
      }

      if (viewport.args.audio && !this.sample) {
        this.sample = new Audio('/Sonic/S3K_9C.wav');
        this.sample.volume = 0.25 + Math.random() * 0.5;
      }
    }
  }, {
    key: "collideA",
    value: function collideA(other) {
      _get(_getPrototypeOf(Emerald.prototype), "collideA", this).call(this, other);

      if (this.args.gone) {
        return;
      }

      this.args.type = 'actor-item actor-emerald collected emerald-' + (this.args.color || 'white');

      if (!this.args.gone) {
        if (this.viewport.args.audio && this.sample) {
          this.sample.play();
        }

        this.args.type = 'actor-item actor-emerald collected gone emerald-' + (this.args.color || 'white');
        this.viewport.actors.remove(this);
        this.remove();

        if (other.args.owner) {
          other.args.owner.args.emeralds += 1;
        } else if (other.occupant) {
          other.occupant.args.emeralds += 1;
        } else {
          other.args.emeralds += 1;
        }
      }

      this.args.gone = true;
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "effect",
    get: function get() {
      return true;
    }
  }]);

  return Emerald;
}(_PointActor2.PointActor);

exports.Emerald = Emerald;
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
      _get(_getPrototypeOf(Explosion.prototype), "update", this).call(this);

      if (!this.removeTimer) {
        var viewport = this.viewport;
        this.removeTimer = this.onTimeout(360, function () {// viewport.actors.remove( this );
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
      return false;
    }
  }]);

  return Explosion;
}(_PointActor2.PointActor);

exports.Explosion = Explosion;
});

;require.register("actor/Knuckles.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Knuckles = void 0;

var _PointActor2 = require("./PointActor");

var _Tag = require("curvature/base/Tag");

var _KnuxBomb = require("./KnuxBomb");

var _SkidDust = require("../behavior/SkidDust");

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

var Knuckles = /*#__PURE__*/function (_PointActor) {
  _inherits(Knuckles, _PointActor);

  var _super = _createSuper(Knuckles);

  function Knuckles() {
    var _this;

    _classCallCheck(this, Knuckles);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _this.behaviors.add(new _SkidDust.SkidDust());

    _this.args.type = 'actor-item actor-knuckles';
    _this.args.accel = 0.35;
    _this.args.decel = 0.4;
    _this.args.gSpeedMax = 16;
    _this.args.jumpForce = 11;
    _this.args.gravity = 0.5;
    _this.args.width = 28;
    _this.args.height = 41;
    _this.args.normalHeight = 41;
    _this.args.rollingHeight = 23;
    _this.punching = 0;
    _this.punched = false;
    _this.beforePunch = 'standing';
    _this.bombsDropped = 0;

    _this.args.bindTo('falling', function (v) {
      if (v || !_this["public"].flying) {
        return;
      }

      if (_this["public"].mode === 1 || _this["public"].mode === 3) {
        _this.args.climbing = true;
        _this.args.gSpeed = 0;
        _this.args.xSpeed = 0;
        _this.args.ySpeed = 0;
      }
    });

    return _this;
  }

  _createClass(Knuckles, [{
    key: "onAttached",
    value: function onAttached() {
      this.box = this.findTag('div');
    }
  }, {
    key: "update",
    value: function update() {
      if (this["public"].mode === 0 || this["public"].mode === 2) {
        this.args.climbing = false;
      }

      var falling = this["public"].falling;

      if (!this.box) {
        _get(_getPrototypeOf(Knuckles.prototype), "update", this).call(this);

        return;
      }

      if (this.throwing && Date.now() - this.throwing > 160) {
        this.throwing = false;
        this.holdBomb = false;
        var bomb = new _KnuxBomb.KnuxBomb({
          x: this["public"].x,
          y: this["public"].y - 16,
          owner: this,
          xSpeed: this["public"].direction * 10 + (-1 + Math.random() * 2),
          ySpeed: Math.random() * -2
        });
        this.viewport.spawn.add({
          object: bomb
        });
      }

      if (this.punching && Date.now() - this.punching > 256) {
        this.punching = false;
        this.args.gSpeed = this.punchMomentum;
        this.punchMomentum = 0;
      }

      if (this.punching && Date.now() - this.punching > 128) {
        this.punchMomentum = this["public"].gSpeed;
        this.args.gSpeed = 2 * Math.sign(this["public"].gSpeed);
        this.punched = false;
      }

      if (!falling) {
        this.bombsDropped = 0;
        var direction = this["public"].direction;
        var gSpeed = this["public"].gSpeed;
        var speed = Math.abs(gSpeed);
        var maxSpeed = this["public"].gSpeedMax;

        if (this["public"].flying) {
          this.args.flying = false;
          this.args["float"] = 0;
        }

        this.args.knucklesFlyCoolDown = 15;
        this.args.flying = false;

        if (!this["public"].rolling) {
          if (this["public"].climbing) {
            if (this.yAxis < 0) {
              this.box.setAttribute('data-animation', 'climbing-up');

              if (Math.abs(this.args.gSpeed) < 4) {
                this.args.direction = this["public"].mode === 1 ? 1 : -1;
                this.args.gSpeed -= this["public"].direction;
              }
            } else if (this.yAxis > 0) {
              this.box.setAttribute('data-animation', 'climbing-down');

              if (Math.abs(this.args.gSpeed) < 4) {
                this.args.direction = this["public"].mode === 1 ? 1 : -1;
                this.args.gSpeed += this["public"].direction;
              }
            } else {
              this.box.setAttribute('data-animation', 'climbing');
              this.args.gSpeed = 0;
            }
          } else if (Math.sign(this["public"].gSpeed) !== direction && Math.abs(this["public"].gSpeed - direction) > 5) {
            this.box.setAttribute('data-animation', 'skidding');
          } else if (this.holdBomb) {
            this.box.setAttribute('data-animation', 'hold-bomb');
          } else if (this.throwing) {
            this.box.setAttribute('data-animation', 'throw-bomb');
          } else if (this.punching) {
            this.box.setAttribute('data-animation', 'punching');
          } else if (speed > maxSpeed * 0.75) {
            this.box.setAttribute('data-animation', 'running');
          } else if (this["public"].moving && this["public"].gSpeed) {
            this.box.setAttribute('data-animation', 'walking');
          } else {
            this.box.setAttribute('data-animation', 'standing');
          }
        } else {
          this.box.setAttribute('data-animation', 'rolling');
        }
      } else if (this["public"].flying) {
        this.box.setAttribute('data-animation', 'flying');
      } else {
        this.box.setAttribute('data-animation', 'jumping');
      }

      if (this["public"].flying) {
        if (this.yAxis > 0) {
          this.args.flying = false;
          return;
        }

        if (this["public"].ySpeed > 0) {
          this.args.ySpeed = 0;
        }

        if (this["public"].ySpeed < 1) {
          this.args.ySpeed += 1;
        }

        if (this["public"].ySpeed > 1) {
          this.args.ySpeed -= 1;
        }

        if (this.xAxis) {
          this.args.flyDirection = Math.sign(this.xAxis);
        }

        this.args.direction = Math.sign(this["public"].xSpeed);

        if (this["public"].direction < 0) {
          this.args.facing = 'left';
        } else {
          this.args.facing = 'right';
        }

        if (this["public"].flyDirection) {
          // console.log(this.public.flyDirection, Math.sign(this.args.xSpeed));
          if (Math.abs(this.args.xSpeed) < 16) {
            if (this["public"].flyDirection !== Math.sign(this["public"].xSpeed)) {
              this.args.xSpeed += 0.15625 * Math.sign(this["public"].flyDirection) * 4;
            } else {
              this.args.xSpeed += 0.15625 * Math.sign(this["public"].flyDirection);
            }
          }
        }

        this.args["float"] = 3;
        this.willStick = true;
        this.stayStuck = true;
      } else if (this["public"].mode % 2 === 0 || this["public"].groundAngle) {
        this.willStick = false;
        this.stayStuck = false;
        this.args.flyDirection = 0;
      } // if(this.args.knucklesFlyCoolDown == 0 && this.args.ySpeed > 5)
      // {
      // 	this.args.flying = false;
      // }


      if (this.args.knucklesFlyCoolDown > 0) {
        this.args.knucklesFlyCoolDown--;
      }

      _get(_getPrototypeOf(Knuckles.prototype), "update", this).call(this);
    }
  }, {
    key: "dropBomb",
    value: function dropBomb() {
      if (this["public"].falling) {
        this.args.ySpeed = -8;
      }

      var bomb = new _KnuxBomb.KnuxBomb({
        x: this["public"].x,
        y: this["public"].y - 16,
        owner: this,
        xSpeed: this["public"].xSpeed,
        ySpeed: -3
      });
      ;
      this.viewport.spawn.add({
        object: bomb
      });
    }
  }, {
    key: "release_0",
    value: function release_0() {
      _get(_getPrototypeOf(Knuckles.prototype), "release_0", this).call(this);
    }
  }, {
    key: "command_0",
    value: function command_0() {
      _get(_getPrototypeOf(Knuckles.prototype), "command_0", this).call(this);

      if (!this["public"].falling) {
        return;
      }

      this.args.flying = true;
      this.args.xSpeed = 9 * this["public"].direction;
      this.args.willJump = false;
    }
  }, {
    key: "command_1",
    value: function command_1() {
      if (this.punching || this.throwing || this["public"].climbing) {
        return;
      }

      this.beforePunch = this.box.getAttribute('data-animation');
      this.punching = Date.now();
      this.punched = true;
      this.args.ignore = 8;
    }
  }, {
    key: "release_1",
    value: function release_1() {
      if (!this.punched) {// this.box.setAttribute('data-animation', this.beforePunch);
      }
    }
  }, {
    key: "command_2",
    value: function command_2() {
      if (!this["public"].ignore && this["public"].falling && !this["public"].flying && this.bombsDropped < 3) {
        this.dropBomb();
        this.bombsDropped++;
        return;
      }

      if (this["public"].falling || this["public"].climbing) {
        return;
      }

      if (Math.abs(this.args.gSpeed) > 3) {
        return;
      }

      if (this.punching || this.throwing) {
        return;
      }

      this.holdBomb = Date.now();
      this.args.ignore = -1;
      this.args.gSpeed = 0;
    }
  }, {
    key: "release_2",
    value: function release_2() {
      if (this["public"].falling || this["public"].climbing) {
        return;
      }

      if (Math.abs(this.args.gSpeed) > 3) {
        return;
      }

      if (!this.holdBomb) {
        return;
      }

      this.args.ignore = 4;
      this.holdBomb = false;
      this.throwing = Date.now();
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "canRoll",
    get: function get() {
      return !this["public"].climbing;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return false;
    }
  }, {
    key: "controllable",
    get: function get() {
      return true;
    }
  }]);

  return Knuckles;
}(_PointActor2.PointActor);

exports.Knuckles = Knuckles;
});

;require.register("actor/KnuxBomb.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KnuxBomb = void 0;

var _PointActor2 = require("./PointActor");

var _Explosion = require("../actor/Explosion");

var _Tag = require("curvature/base/Tag");

var _Region = require("../region/Region");

var _Spring = require("./Spring");

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

var KnuxBomb = /*#__PURE__*/function (_PointActor) {
  _inherits(KnuxBomb, _PointActor);

  var _super = _createSuper(KnuxBomb);

  function KnuxBomb() {
    var _this;

    _classCallCheck(this, KnuxBomb);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-knux-bomb';
    _this.args.width = 16;
    _this.args.height = 16;
    _this.removeTimer = null;
    return _this;
  }

  _createClass(KnuxBomb, [{
    key: "update",
    value: function update() {
      var _this2 = this;

      if (this.removed) {
        return;
      }

      _get(_getPrototypeOf(KnuxBomb.prototype), "update", this).call(this);

      if (!this.args.xSpeed && !this.args.ySpeed && !this.args.gSpeed) {
        this.removeTimer = this.onTimeout(250, function () {
          return _this2.explode();
        });
      }

      if (!this.removeTimer) {
        this.removeTimer = this.onTimeout(1500, function () {
          return _this2.explode();
        });
      }
    } // collideA(other)
    // {
    // 	if(other === this.args.owner || other instanceof KnuxBomb || other instanceof Region || other instanceof Spring)
    // 	{
    // 		return false;
    // 	}
    // 	this.args.x += Math.cos(this.public.angle) * other.args.width / 2 * Math.sign(this.public.xSpeed);
    // 	this.args.y += Math.sin(this.public.angle) * other.args.width / 2 * Math.sign(this.public.xSpeed);
    // 	this.explode();
    // 	return false;
    // }

  }, {
    key: "explode",
    value: function explode() {
      var viewport = this.viewport;

      if (!viewport) {
        return;
      }

      var particle = new _Tag.Tag('<div class = "particle-explosion">');
      particle.style({
        '--x': this.x,
        '--y': this.y
      });
      viewport.particles.add(particle);
      setTimeout(function () {
        return viewport.particles.remove(particle);
      }, 350);
      this.viewport.actors.remove(this);
      this.remove();
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

  return KnuxBomb;
}(_PointActor2.PointActor);

exports.KnuxBomb = KnuxBomb;
});

;require.register("actor/LayerSwitch.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LayerSwitch = void 0;

var _PointActor2 = require("./PointActor");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var LayerSwitch = /*#__PURE__*/function (_PointActor) {
  _inherits(LayerSwitch, _PointActor);

  var _super = _createSuper(LayerSwitch);

  _createClass(LayerSwitch, [{
    key: "onAttach",
    value: function onAttach(event) {
      event.preventDefault(event);
    }
  }], [{
    key: "fromDef",
    value: function fromDef(objDef) {
      var obj = _get(_getPrototypeOf(LayerSwitch), "fromDef", this).call(this, objDef);

      obj.args.width = objDef.width;
      obj.args.height = objDef.height;
      return obj;
    }
  }]);

  function LayerSwitch() {
    var _this;

    _classCallCheck(this, LayerSwitch);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-layer-switch';
    _this.args.width = 32;
    _this.args.height = 32;
    _this.args["float"] = -1;
    return _this;
  }

  _createClass(LayerSwitch, [{
    key: "collideA",
    value: function collideA(other, type) {
      var _this2 = this;

      var speed = other.args.gSpeed;
      var back = !!Number(this["public"].back);
      var roll = !!Number(this["public"].roll);

      if (roll && !other["public"].rolling) {
        other.args.layer = toLayer === 1 ? 2 : 1;
        return false;
      }

      if (back && other["public"].falling) {
        speed = other.args.xSpeed;
        back = !back;
      }

      var toLayer = other["public"].layer;

      if (speed > 0) {
        toLayer = back ? 1 : 2;
      }

      if (speed < 0) {
        toLayer = back ? 2 : 1;
      }

      if (!this.viewport.tileMap.getSolid(other.x, other.y, toLayer)) {
        other.args.layer = toLayer;
      } else {
        this.onNextFrame(function () {
          if (!_this2.viewport.tileMap.getSolid(other.x, other.y, toLayer)) {
            other.args.layer = toLayer;
          }
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

  return LayerSwitch;
}(_PointActor2.PointActor);

exports.LayerSwitch = LayerSwitch;
});

;require.register("actor/MarbleBlock.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MarbleBlock = void 0;

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

var MarbleBlock = /*#__PURE__*/function (_PointActor) {
  _inherits(MarbleBlock, _PointActor);

  var _super = _createSuper(MarbleBlock);

  function MarbleBlock() {
    var _this;

    _classCallCheck(this, MarbleBlock);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-block-marble';
    _this.args.width = 32;
    _this.args.height = 32;
    return _this;
  }

  _createClass(MarbleBlock, [{
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(MarbleBlock.prototype), "update", this).call(this);

      var scan = this.scanBottomEdge();

      if (scan === 0) {
        this.args.falling = true;
      }
    }
  }, {
    key: "collideA",
    value: function collideA(other, type) {
      _get(_getPrototypeOf(MarbleBlock.prototype), "collideA", this).call(this, other, type);

      var otherSpeed = other.args.gSpeed || other.args.xSpeed;

      if (Math.abs(other["public"].ySpeed) > Math.abs(other["public"].xSpeed)) {
        return true;
      }

      if (type === 1 && otherSpeed <= 0) {
        return false;
      }

      if (type === 3 && otherSpeed >= 0) {
        return false;
      }

      if (type === 1 || type === 3) {
        if (!otherSpeed) {
          return true;
        }

        var tileMap = this.viewport.tileMap;
        var moveBy = type === 1 && 1 || type === 3 && -1;
        var blockers = tileMap.getSolid(this.x + this.args.width / 2 * moveBy, this.y);

        if (blockers) {
          return true;
        }

        var scan = this.scanBottomEdge(moveBy);

        if (moveBy > 0 && scan === 0) {
          this.args.falling = true;
        } else if (moveBy < 0 && scan === 0) {
          this.args.falling = true;
        } else if (!this.args.falling || scan > 0) {
          var nextPosition = this.findNextStep(moveBy);

          if (!nextPosition[1]) {
            var realMoveBy = nextPosition[0] || moveBy;
            this.args.x += realMoveBy;
            return scan === 0;
          }

          return true;
        }
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
  }, {
    key: "rotateLock",
    get: function get() {
      return true;
    }
  }, {
    key: "isPushable",
    get: function get() {
      return true;
    }
  }]);

  return MarbleBlock;
}(_PointActor2.PointActor);

exports.MarbleBlock = MarbleBlock;
});

;require.register("actor/MechaSonic.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MechaSonic = void 0;

var _PointActor2 = require("./PointActor");

var _Tag = require("curvature/base/Tag");

var _SkidDust = require("../behavior/SkidDust");

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

var MechaSonic = /*#__PURE__*/function (_PointActor) {
  _inherits(MechaSonic, _PointActor);

  var _super = _createSuper(MechaSonic);

  function MechaSonic() {
    var _this;

    _classCallCheck(this, MechaSonic);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _this.behaviors.add(new _SkidDust.SkidDust('particle-sparks'));

    _this.args.type = 'actor-item actor-mecha-sonic';
    _this.args.accel = 0.35;
    _this.args.decel = 0.4;
    _this.args.skidTraction = 2;
    _this.args.gSpeedMax = 16;
    _this.args.jumpForce = 11;
    _this.args.gravity = 0.5;
    _this.args.takeoffPlayed = false;
    _this.args.width = 32;
    _this.args.height = 63;

    _this.args.bindTo('falling', function (v) {
      if (!v) {
        _this.landSound();
      }
    });

    return _this;
  }

  _createClass(MechaSonic, [{
    key: "onAttached",
    value: function onAttached() {
      this.box = this.findTag('div');
      this.sprite = this.findTag('div.sprite');
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;

      if (!this.sprite) {
        return;
      }

      var falling = this.args.falling;
      this.args.accel = 0.3;
      var direction = this["public"].direction;
      var gSpeed = this["public"].gSpeed;
      var speed = Math.abs(gSpeed);
      var maxSpeed = 100;
      var minRun = 100 * 0.1;
      var minRun2 = 0.75 * this["public"].gSpeedMax;

      if (!this.flame) {
        this.sparks = new _Tag.Tag('<div class = "mecha-sonic-sparks">');
        this.flame = new _Tag.Tag('<div class = "mecha-sonic-flame">');
        this.sprite.appendChild(this.sparks.node);
        this.sprite.appendChild(this.flame.node);
      }

      if (this.viewport.args.audio && !this.thrusterSound) {
        this.takeoffSound = new Audio('/Sonic/mecha-sonic-takeoff.wav');
        this.thrusterSound = new Audio('/Sonic/mecha-sonic-thruster.wav');
        this.scrapeSound = new Audio('/Sonic/mecha-sonic-scrape.wav');
        this.thrusterCloseSound = new Audio('/Sonic/mecha-sonic-thruster-close.wav');
        this.thrusterCloseSound.volume = 0.25;
        this.takeoffSound.volume = 0.5;
        this.scrapeSound.volume = 0.1;
        this.thrusterSound.loop = true;
        this.scrapeSound.loop = true;
      }

      if (this.thrusterSound) {
        this.thrusterSound.volume = 0.15 + Math.random() * -0.05;

        if (this.thrusterSound.currentTime > 1.5) {
          this.thrusterSound.currentTime = 0.5;
        }

        if (this.scrapeSound.currentTime > 1.5) {
          this.scrapeSound.currentTime = 0.5;
        }
      }

      if (!this["public"].rolling && !falling) {
        if (Math.sign(this["public"].gSpeed) !== direction && Math.abs(this["public"].gSpeed - direction) > 5) {
          this.scrapeSound && this.scrapeSound.play();
          this.box.setAttribute('data-animation', 'skidding');
        } else if (speed >= minRun2) {
          this.scrapeSound && this.scrapeSound.pause();
          this.box.setAttribute('data-animation', 'running2');
          this.thrusterSound && this.thrusterSound.play();

          if (!this["public"].takeoffPlayed) {
            this.args.takeoffPlayed = true;
            this.takeoffSound && this.takeoffSound.play();
          }

          this.args.accel = 0.75;

          if (speed > maxSpeed * 0.75) {
            this.args.accel = 0.01;
          }
        } else if (speed >= minRun) {
          this.scrapeSound && this.scrapeSound.play();
          this.box.setAttribute('data-animation', 'running');
        } else if (this.args.moving && gSpeed) {
          this.scrapeSound && this.scrapeSound.play();
          this.box.setAttribute('data-animation', 'walking');
        } else if (this.args.crouching || this.standingOn && this.standingOn.isVehicle) {
          this.box.setAttribute('data-animation', 'crouching');
        } else {
          this.scrapeSound && this.scrapeSound.pause();
          this.box.setAttribute('data-animation', 'standing');
        }

        if (speed < minRun2) {
          this.closeThruster();
        }
      } else if (this["public"].rolling) {
        if (this.box.getAttribute('data-animation') !== 'rolling' && this.box.getAttribute('data-animation') !== 'jumping') {
          this.box.setAttribute('data-animation', 'curling');
          this.onTimeout(128, function () {
            if (_this2["public"].rolling) {
              _this2.box.setAttribute('data-animation', 'rolling');

              _this2.closeThruster();
            }
          });
        } else {
          this.box.setAttribute('data-animation', 'rolling');
          this.closeThruster();
        }
      } else {
        this.scrapeSound && this.scrapeSound.pause();

        if (this.box.getAttribute('data-animation') !== 'rolling' && this.box.getAttribute('data-animation') !== 'jumping') {
          this.box.setAttribute('data-animation', 'curling');
          this.onTimeout(128, function () {
            if (_this2["public"].falling) {
              _this2.box.setAttribute('data-animation', 'jumping');

              _this2.closeThruster();
            }
          });
        } else {
          this.box.setAttribute('data-animation', 'jumping');
          this.closeThruster();
        }
      }

      _get(_getPrototypeOf(MechaSonic.prototype), "update", this).call(this);
    }
  }, {
    key: "closeThruster",
    value: function closeThruster() {
      if (this.args.takeoffPlayed) {
        this.landSound();
      }

      this.args.takeoffPlayed = false;
      this.thrusterSound && this.thrusterSound.pause();
    }
  }, {
    key: "landSound",
    value: function landSound() {
      this.thrusterCloseSound && this.thrusterCloseSound.play();
    }
  }, {
    key: "sleep",
    value: function sleep() {
      this.thrusterSound && this.thrusterSound.pause();
      this.scrapeSound && this.scrapeSound.pause();
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return false;
    }
  }, {
    key: "canRoll",
    get: function get() {
      return true;
    }
  }, {
    key: "controllable",
    get: function get() {
      return true;
    }
  }]);

  return MechaSonic;
}(_PointActor2.PointActor);

exports.MechaSonic = MechaSonic;
});

;require.register("actor/Monitor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Monitor = void 0;

var _PointActor2 = require("./PointActor");

var _Tag = require("curvature/base/Tag");

var _Explosion = require("../actor/Explosion");

var _Projectile = require("../actor/Projectile");

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
    _this.args.width = 32;
    _this.args.height = 32;
    _this.args.gone = false;
    return _this;
  }

  _createClass(Monitor, [{
    key: "attached",
    value: function attached() {
      this.screen = new _Tag.Tag("<div class = \"monitor-screen\">");
      this.sprite.appendChild(this.screen.node);
    }
  }, {
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(Monitor.prototype), "update", this).call(this);

      if (!this.viewport) {
        return;
      }

      if (this.viewport.args.audio && !this.sample) {
        this.sample = new Audio('/Sonic/object-destroyed.wav');
        this.sample.volume = 0.6 + Math.random() * -0.3;
      }
    }
  }, {
    key: "collideA",
    value: function collideA(other, type) {
      _get(_getPrototypeOf(Monitor.prototype), "collideA", this).call(this, other, type);

      if (type !== 2 && (other["public"].ySpeed > 0 && other.y < this.y || other["public"].rolling) && (!this["public"].falling || this["public"]["float"] === -1) && !this["public"].gone && this.viewport) {
        this.pop(other);
        return;
      }

      if ((type === 1 || type === 3) && (Math.abs(other.args.xSpeed) > 15 || Math.abs(other.args.gSpeed) > 15 || other instanceof _Projectile.Projectile) && !this["public"].gone && this.viewport) {
        this.pop(other);
        return;
      }
    }
  }, {
    key: "pop",
    value: function pop(other) {
      var _this2 = this;

      var viewport = this.viewport;

      if (!viewport || this["public"].gone) {
        return;
      }

      var explosion = new _Tag.Tag('<div class = "particle-explosion">');
      explosion.style({
        '--x': this.x,
        '--y': this.y - 16
      });
      viewport.particles.add(explosion);
      setTimeout(function () {
        return viewport.particles.remove(explosion);
      }, 512);
      setTimeout(function () {
        return _this2.screen.remove();
      }, 1024);
      this.args.gone = true;
      this.box.setAttribute('data-animation', 'broken');

      if (other.occupant) {
        other = other.occupant;
      }

      if (other.args.owner) {
        other = other.args.owner;
      }

      if (other.controllable) {
        this.effect(other);
      }

      if (viewport.args.audio && this.sample) {
        this.sample.play();
      }

      var ySpeed = other.args.ySpeed;

      if (other.args.falling) {
        this.onNextFrame(function () {
          return other.args.ySpeed = -ySpeed;
        });
      }

      if (this.args.falling && other.args.falling) {
        this.onNextFrame(function () {
          return other.args.xSpeed = -other.args.xSpeed;
        });
      }
    }
  }, {
    key: "effect",
    value: function effect() {}
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

  return Monitor;
}(_PointActor2.PointActor);

exports.Monitor = Monitor;
});

;require.register("actor/NuclearSuperball.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NuclearSuperball = void 0;

var _PointActor2 = require("./PointActor");

var _Tag = require("curvature/base/Tag");

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

var NuclearSuperball = /*#__PURE__*/function (_PointActor) {
  _inherits(NuclearSuperball, _PointActor);

  var _super = _createSuper(NuclearSuperball);

  function NuclearSuperball() {
    var _this;

    _classCallCheck(this, NuclearSuperball);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.gSpeedMax = 150;
    _this.args.accel = 2;
    _this.args.jumpForce = 20;
    _this.willStick = true;
    _this.stayStuck = true;
    return _this;
  }

  _createClass(NuclearSuperball, [{
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return false;
    }
  }, {
    key: "controllable",
    get: function get() {
      return true;
    }
  }]);

  return NuclearSuperball;
}(_PointActor2.PointActor);

exports.NuclearSuperball = NuclearSuperball;
});

;require.register("actor/PointActor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PointActor = void 0;

var _Bindable = require("curvature/base/Bindable");

var _View2 = require("curvature/base/View");

var _Tag = require("curvature/base/Tag");

var _Twist = require("../effects/Twist");

var _Pinch = require("../effects/Pinch");

var _CharacterString = require("../ui/CharacterString");

var _Classifier = require("../Classifier");

var _Controller = require("../controller/Controller");

var _Sheild = require("../powerups/Sheild");

var _FireSheild = require("../powerups/FireSheild");

var _BubbleSheild = require("../powerups/BubbleSheild");

var _ElectricSheild = require("../powerups/ElectricSheild");

var _LayerSwitch = require("./LayerSwitch");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

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

var MODE_FLOOR = 0;
var MODE_LEFT = 1;
var MODE_CEILING = 2;
var MODE_RIGHT = 3;
var WALKING_SPEED = 100;
var RUNNING_SPEED = Infinity;
var CRAWLING_SPEED = 1;
var JUMP_FORCE = 15;
var DEFAULT_GRAVITY = MODE_FLOOR;

var PointActor = /*#__PURE__*/function (_View) {
  _inherits(PointActor, _View);

  var _super = _createSuper(PointActor);

  _createClass(PointActor, null, [{
    key: "fromDef",
    value: function fromDef(objDef) {
      var instance = new this();
      var objArgs = {
        x: objDef.x + 16,
        y: objDef.y - 1,
        visible: objDef.visible,
        name: objDef.name,
        id: objDef.id
      };

      for (var i in objDef.properties) {
        var property = objDef.properties[i];
        objArgs[property.name] = property.value;
      }

      return new this(Object.assign({}, objArgs));
    }
  }]);

  function PointActor() {
    var _this;

    _classCallCheck(this, PointActor);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", "<div\n\t\tclass  = \"point-actor [[type]]\"\n\t\tstyle  = \"\n\t\t\tdisplay:[[display]];\n\t\t\t--fg-filter:[[fgFilter]];\n\t\t\t--animation-bias:[[animationBias]];\n\t\t\t--bg-filter:[[bgFilter]];\n\t\t\t--sprite-sheet:[[spriteSheet|urlWrap]];\n\t\t\t--angle:[[angle]];\n\t\t\t--fly-angle:[[flyAngle]];\n\t\t\t--ground-angle:[[groundAngle]];\n\t\t\t--air-angle:[[airAngle]];\n\t\t\t--height:[[height]];\n\t\t\t--width:[[width]];\n\t\t\t--x:[[x]];\n\t\t\t--y:[[y]];\n\t\t\"\n\t\tdata-camera-mode = \"[[cameraMode]]\"\n\t\tdata-colliding   = \"[[colliding]]\"\n\t\tdata-falling     = \"[[falling]]\"\n\t\tdata-facing      = \"[[facing]]\"\n\t\tdata-filter      = \"[[filter]]\"\n\t\tdata-angle       = \"[[angle|rad2deg]]\"\n\t\tdata-layer       = \"[[layer]]\"\n\t\tdata-mode        = \"[[mode]]\"\n\t>\n\t\t<div class = \"sprite\" cv-ref = \"sprite\">\n\t\t\t<div class = \"labels\" cv-ref = \"labels\" cv-each = \"charStrings:charString:c\">[[charString]]</div>\n\t\t</div>\n\t</div>");

    _defineProperty(_assertThisInitialized(_this), "profiles", {
      normal: {
        height: 1,
        width: 1,
        decel: 0.85,
        accel: 0.2,
        gravity: 0.65,
        airAccel: 0.3,
        jumpForce: 14,
        gSpeedMax: 100
      } // , rollSpeedMax = 37;

    });

    _this.region = null;
    _this.powerups = new Set();
    _this.behaviors = new Set();
    _this.inventory = new _Classifier.Classifier([_Sheild.Sheild, _FireSheild.FireSheild, _BubbleSheild.BubbleSheild, _ElectricSheild.ElectricSheild]);
    _this.sheild = null;

    _this.inventory.addEventListener('adding', function (event) {
      var item = event.detail.object;
      _this.args.currentSheild = item;

      if (_this.inventory.has(item.constructor)) {
        event.preventDefault();
      }
    });

    _this.args.bindTo('currentSheild', function (v) {
      var _iterator = _createForOfIteratorHelper(_this.inventory.get(_Sheild.Sheild)),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var shield = _step.value;
          shield.detach();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      v && v.render(_this.sprite);
    });

    Object.defineProperty(_assertThisInitialized(_this), 'public', {
      value: {}
    });

    _this.args.bindTo(function (v, k) {
      _this["public"][k] = v;
    });

    _this.args.type = 'actor-generic';
    _this.args.charStrings = [];
    _this.args.display = _this.args.display || 'initial';
    _this.args.emeralds = 0;
    _this.args.rings = 0;
    _this.args.coins = 0;
    _this.args.yMargin = 0;
    _this.args.cameraMode = 'normal';
    _this.args.layer = 1;
    _this.args.moving = false;
    _this.args.flySpeedMax = 40;
    _this.args.x = _this.args.x || 1024 + 256;
    _this.args.y = _this.args.y || 32;
    _this.args.xOff = 0;
    _this.args.yOff = 0;
    _this.args.width = _this.args.width || 1;
    _this.args.height = _this.args.height || 1;
    _this.args.direction = _this.args.direction || 1;
    _this.args.gSpeed = _this.args.gSpeed || 0;
    _this.args.xSpeed = _this.args.xSpeed || 0;
    _this.args.ySpeed = _this.args.ySpeed || 0;
    _this.args.angle = _this.args.angle || 0;
    _this.args.groundAngle = 0;
    _this.args.airAngle = 0;
    _this.lastAngles = [0, 0];
    _this.angleAvg = 8;
    _this.args.xSpeedMax = 512;
    _this.args.ySpeedMax = 512;
    _this.args.gSpeedMax = WALKING_SPEED;
    _this.args.rollSpeedMax = 34;
    _this.args.gravity = 0.65;
    _this.args.decel = 0.85;
    _this.args.accel = 0.2;
    _this.args.airAccel = 0.3;
    _this.args.jumpForce = 14;
    _this.args.jumping = false;
    _this.args.jumpedAt = null;
    _this.args.deepJump = false;
    _this.args.highJump = false;
    _this.maxStep = 4;
    _this.backStep = 0;
    _this.frontStep = 0;
    _this.args.rolling = false;
    _this.args.skidTraction = 5;
    _this.args.skidTraction = 2.25;
    _this.args.fgFilter = 'none';
    _this.args.bgFilter = 'none';
    _this.args.falling = true;
    _this.args.running = false;
    _this.args.crawling = false;
    _this.args.climbing = false;
    _this.args.rotateFixed = false;
    _this.args.mode = DEFAULT_GRAVITY;
    _this.xAxis = 0;
    _this.yAxis = 0;
    _this.willStick = false;
    _this.stayStuck = false;
    _this.args.ignore = _this.args.ignore || 0;
    _this.args["float"] = _this.args["float"] || 0;
    _this.colliding = false;
    _this.args.flyAngle = 0;

    _this.args.bindTo('xSpeed', function (v) {
      return _this.args.airAngle = Math.atan2(_this.args.ySpeed, v);
    });

    _this.args.bindTo('ySpeed', function (v) {
      return _this.args.airAngle = Math.atan2(v, _this.args.xSpeed);
    }); // this.args.bindTo('gSpeed', v => console.trace(v));
    // this.args.bindTo('falling', v => console.trace(v));


    _this.impulseMag = null;
    _this.impulseDir = null;
    _this.args.stopped = 0;
    _this.args.particleScale = 1;
    _this.dropDashCharge = 0;

    var bindable = _Bindable.Bindable.make(_assertThisInitialized(_this));

    _this.debindGroundX = null;
    _this.debindGroundY = null;
    _this.debindGroundL = null;

    if (_this.controllable) {
      _this.controller = new _Controller.Controller({
        deadZone: 0.2
      });
      _this.args.charStrings = [new _CharacterString.CharacterString({
        value: _this["public"].name
      })];

      _this.controller.zero();
    }

    bindable.bindTo('region', function (region, key, target) {
      if (region) {
        var drag = region.args.drag;
        _this.args.xSpeed *= drag;
        _this.args.ySpeed *= drag;
        _this.args.gSpeed *= drag;
      }

      if (!region) {
        region = target[key];
      }

      if (!region) {
        return;
      }

      if (_this.viewport) {
        var viewport = _this.viewport;

        if (region.entryParticle) {
          var splash = new _Tag.Tag(region.entryParticle);
          splash.style({
            '--x': _this.x,
            '--y': region.y - region.args.height,
            'z-index': 5,
            opacity: Math.random,
            '--particleScale': _this.args.particleScale
          });
          viewport.particles.add(splash);
          setTimeout(function () {
            return viewport.particles.remove(splash);
          }, 240 * (_this.args.particleScale || 1));
        }
      }
    });
    _this.debindGroundX = new Set();
    _this.debindGroundY = new Set();
    _this.debindGroundL = new Set();

    _this.args.bindTo('standingOn', function (groundObject, key, target) {
      if (_this.args.standingOn === groundObject) {
        return;
      }

      var _iterator2 = _createForOfIteratorHelper(_this.debindGroundX),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var debind = _step2.value;

          _this.debindGroundX["delete"](debind);

          debind();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var _iterator3 = _createForOfIteratorHelper(_this.debindGroundY),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _debind = _step3.value;

          _this.debindGroundY["delete"](_debind);

          _debind();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      var _iterator4 = _createForOfIteratorHelper(_this.debindGroundL),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var _debind2 = _step4.value;

          _this.debindGroundL["delete"](_debind2);

          _debind2();
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      var prevGroundObject = target[key];

      if (!groundObject) {
        if (prevGroundObject && prevGroundObject.isVehicle) {
          if (prevGroundObject.occupant === _assertThisInitialized(_this)) {
            prevGroundObject.occupant = null;
            prevGroundObject.stayStuck = false;
            prevGroundObject.willStick = false;
          }

          prevGroundObject.xAxis = 0;
          prevGroundObject.yAxis = 0;
        }

        return;
      }

      if (_this["public"].jumping && _this.controllable && groundObject.isVehicle) {
        var debindGroundX = groundObject.args.bindTo('x', function (vv, kk) {
          var x = groundObject.args.direction * groundObject.args.seatForward || 0;
          var y = groundObject.args.seatHeight || groundObject.args.height || 0;
          var xRot = x * Math.cos(groundObject.realAngle) - y * Math.sin(groundObject.realAngle);
          var yRot = y * Math.cos(groundObject.realAngle) + x * Math.sin(groundObject.realAngle);
          _this.args.x = xRot + vv;
          _this.args.y = yRot + groundObject.y;
        });
        var debindGroundY = groundObject.args.bindTo('y', function (vv, kk) {
          var x = groundObject.args.direction * groundObject.args.seatForward || 0;
          var y = groundObject.args.seatHeight || groundObject.args.height || 0;
          var xRot = x * Math.cos(groundObject.realAngle) - y * Math.sin(groundObject.realAngle);
          var yRot = y * Math.cos(groundObject.realAngle) + x * Math.sin(groundObject.realAngle);
          _this.args.x = xRot + groundObject.x;
          _this.args.y = yRot + vv;
        });
        var debindGroundL = groundObject.args.bindTo('layer', function (vv, kk) {
          _this.args.layer = vv;
        });

        _this.debindGroundX.add(debindGroundX);

        _this.debindGroundY.add(debindGroundY);

        _this.debindGroundL.add(debindGroundL);

        var occupant = groundObject.occupant;
        groundObject.occupant = _assertThisInitialized(_this);
        groundObject.args.yMargin = _this.args.height;

        if (occupant) {
          occupant.args.standingOn = null;
          occupant.args.y -= 32;
          occupant.args.gSpeed = 0;
          occupant.args.xSpeed = -5 * _this.args.direction;
          occupant.args.ySpeed = -8;
          occupant.args.falling = true;
        }

        _this.args.gSpeed = 0;
        _this.args.xSpeed = 0;
        _this.args.ySpeed = 0;
      } else if (!groundObject.isVehicle) {
        var _debindGroundX = groundObject.args.bindTo('x', function (vv, kk) {
          _this.args.x += vv - groundObject.args.x;
        });

        var _debindGroundY = groundObject.args.bindTo('y', function (vv, kk) {
          _this.args.y = vv - groundObject.args.height;
        });

        var _debindGroundL = groundObject.args.bindTo('layer', function (vv, kk) {
          _this.args.layer = vv;
        });

        _this.debindGroundX.add(_debindGroundX);

        _this.debindGroundY.add(_debindGroundY);

        _this.debindGroundL.add(_debindGroundL);
      }

      if (prevGroundObject && prevGroundObject.isVehicle) {
        if (prevGroundObject.occupant === _assertThisInitialized(_this)) {
          prevGroundObject.occupant = null;
          prevGroundObject.stayStuck = false;
          prevGroundObject.willStick = false;
        }

        prevGroundObject.xAxis = 0;
        prevGroundObject.yAxis = 0;
      }

      groundObject.standBelow(_assertThisInitialized(_this));
    });

    return _possibleConstructorReturn(_this, bindable);
  }

  _createClass(PointActor, [{
    key: "onRendered",
    value: function onRendered() {
      var _this2 = this;

      this.box = this.findTag('div');
      this.sprite = this.findTag('div.sprite');

      if (this.controllable) {
        this.sprite.parentNode.classList.add('controllable');
      }

      this.listen('click', function () {
        if (_this2.viewport.args.networked) {
          return;
        }

        if (!_this2.controllable) {
          return;
        }

        _this2.viewport.nextControl = _Bindable.Bindable.ref(_this2);

        var _iterator5 = _createForOfIteratorHelper(_this2.viewport.tags.currentActor.options),
            _step5;

        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var option = _step5.value;

            if (option.value === _this2.args.name) {
              _this2.viewport.tags.currentActor.value = option.value;
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }

        _this2.args.ySpeed = 0;
      });
    }
  }, {
    key: "updateStart",
    value: function updateStart() {
      this.colliding = false;
      this.restingOn = null;
    }
  }, {
    key: "updateEnd",
    value: function updateEnd() {}
  }, {
    key: "update",
    value: function update() {
      var _this3 = this;

      if (this["public"].rolling) {
        this.args.height = this["public"].rollingHeight || this.args.height;
      } else if (this.canRoll) {
        this.args.height = this["public"].normalHeight || this.args.height;
      }

      if (this.args.dontJump > 0) {
        this.args.dontJump--;
      }

      if (this.args.dontJump < 0) {
        this.args.dontJump = 0;
      }

      if (!this.viewport || this.removed) {
        return;
      }

      if (this.args.standingOn && this.args.standingOn.isVehicle && this.args.standingOn.occupant === this) {
        var vehicle = this.args.standingOn;
        this.processInput();

        if (this.willJump && this.yAxis >= 0) {
          this.willJump = false;
          this.args.standingOn.command_0();
        }

        if (this.willJump && this.yAxis < 0) {
          this.willJump = false;
          this.args.standingOn = false;
          this.args.falling = true;
          this.args.y -= vehicle["public"].seatHeight || vehicle["public"].height;
          this.args.ySpeed = -this["public"].jumpForce;
          vehicle.args.ySpeed = 0;
        }

        this.region = this.viewport.regionAtPoint(this.x, this.y);
        return;
      }

      var gSpeedMax = this["public"].gSpeedMax;

      if (this.running) {
        gSpeedMax = RUNNING_SPEED;
      } else if (this.crawling) {
        gSpeedMax = CRAWLING_SPEED;
      }

      if (this.impulseMag !== null) {
        this.args.xSpeed += Number(Number(Math.cos(this.impulseDir) * this.impulseMag).toFixed(2));
        this.args.ySpeed += Number(Number(Math.sin(this.impulseDir) * this.impulseMag).toFixed(2));

        if (!this.impulseFal) {
          switch (this["public"].mode) {
            case MODE_FLOOR:
              this.args.gSpeed = Math.cos(this.impulseDir) * this.impulseMag;
              this.args.direction = 1;
              break;

            case MODE_CEILING:
              this.args.gSpeed = -Math.cos(this.impulseDir) * this.impulseMag;
              this.args.direction = -1;
              break;

            case MODE_LEFT:
              this.args.gSpeed = -Math.sin(this.impulseDir) * this.impulseMag;
              this.args.direction = 1;
              break;

            case MODE_RIGHT:
              this.args.gSpeed = Math.sin(this.impulseDir) * this.impulseMag;
              this.args.direction = -1;
              break;
          }
        } else {
          this.args.falling = this.impulseFal;
        }

        this.impulseMag = null;
        this.impulseDir = null;
        this.impulseFal = null;
      }

      if (this["public"].ignore === -2 && this["public"].falling === false) {
        console.log('deignore on land');
        this["public"].ignore = 0;
      }

      if (this["public"].ignore < 1 && this["public"].ignore > 0) {
        this.args.ignore = 0;
      }

      if (this["public"].ignore > 0) {
        this.args.ignore--;
      }

      if (this["public"]["float"] > 0) {
        this.args["float"]--;
      }

      if (this.args.falling) {
        this.args.standingOn = null;
        this.args.landed = false;
        this.lastAngles = [];

        if (this["public"].jumping && this["public"].jumpedAt < this.y) {
          this.args.deepJump = true;
        } else if (this["public"].jumping && this["public"].jumpedAt > this.y + 160) {
          this.args.highJump = true;
        } else {
          this.args.deepJump = false;
        }
      } else {
        if (this["public"].jumping) {
          this.args.jumping = false;
          this.args.deepJump = false;
          this.args.highJump = false;
          this.args.jumpedAt = null;
          this.args.dontJump = 5;
        }
      }

      this.region = this.viewport.regionAtPoint(this.x, this.y);

      if (!this.isEffect && this["public"].falling && this.viewport) {
        this.updateAirPosition();
      } else if (!this.isEffect && !this["public"].falling) {
        this.updateGroundPosition();
        this.args.animationBias = Math.abs(this.args.gSpeed / this.args.gSpeedMax).toFixed(1);

        if (this.args.animationBias > 1) {
          this.args.animationBias = 1;
        }
      }

      if (this.viewport && !(this instanceof _LayerSwitch.LayerSwitch)) {
        this.viewport.actorsAtPoint(this.x, this.y, this["public"].width, this["public"].height).filter(function (x) {
          return x.args !== _this3.args;
        }).filter(function (x) {
          return !(x instanceof _LayerSwitch.LayerSwitch || x.isPushable);
        }).filter(function (x) {
          return x.callCollideHandler(_this3);
        });
      }

      if (!this.viewport || this.removed) {
        return;
      }

      var tileMap = this.viewport.tileMap;

      if (this["public"].gSpeed === 0 && !this["public"].falling && this["public"].dontJump === 0) {
        if (!this.stayStuck && !this["public"].climbing) {
          var half = Math.floor(this["public"].width / 2) || 0;

          if (!tileMap.getSolid(this.x, this.y + 1, this["public"].layer)) {
            var mode = this.args.mode;
            this.lastAngles = [];

            if (mode !== MODE_FLOOR) {
              if (mode === MODE_LEFT && this["public"].groundAngle <= 0) {
                this.doJump(1);
                this.args.x += Math.floor(this["public"].width / 2);
                this.args.facing = 'right';
                this.args.direction = 1;
              } else if (mode === MODE_RIGHT && this["public"].groundAngle >= 0) {
                this.doJump(1);
                this.args.x -= Math.floor(this["public"].width / 2);
                this.args.facing = 'left';
                this.args.direction = -1;
              } else if (mode === MODE_CEILING) {
                this.args.y += Math.floor(this["public"].height);

                if (this["public"].direction == -1) {
                  this.args.direction = 1;
                  this.args.facing = 'right';
                } else {
                  this.args.direction = -1;
                  this.args.facing = 'left';
                }

                this.doJump(0.5);
              }
            }
          }
        }
      }

      this.args.landed = true;
      this.args.x = Math.floor(this["public"].x);
      this.args.y = Math.floor(this["public"].y);

      if (this["public"].falling && !this.isEffect) {
        this.resolveIntersection();
      }

      if (this["public"].falling && this["public"].ySpeed < this["public"].ySpeedMax) {
        if (!this["public"]["float"]) {
          this.args.ySpeed += this["public"].gravity * (this.region ? this.region["public"].gravity : 1);
        }

        this.args.landed = false;
      }

      this.processInput();

      if (this["public"].falling || this["public"].gSpeed) {
        this.args.stopped = 0;
      } else {
        this.args.stopped++;
      }

      if (!this["public"].falling && !this["public"]["float"]) {
        if (this.lastAngles.length > 0) {
          this.args.groundAngle = this.lastAngles.map(function (a) {
            return Number(a);
          }).reduce(function (a, b) {
            return a + b;
          }) / this.lastAngles.length;
        }

        if (isNaN(this["public"].groundAngle)) {
          console.log(this.lastAngles, this.lastAngles.length);
        }

        var standingOn = this.getMapSolidAt.apply(this, _toConsumableArray(this.groundPoint));

        var _half = Math.floor(this.args.width / 2);

        if (Array.isArray(standingOn) && standingOn.length) {
          var groundActors = standingOn.filter(function (a) {
            return a.args !== _this3.args && a.solid;
          });
          this.args.standingOn = groundActors[0];
          this.args.groundAngle = 0;
        } else if (standingOn) {
          this.args.standingOn = null;
        } else {
          if (_half) {
            var leftGroundPoint = _toConsumableArray(this.groundPoint);

            leftGroundPoint[0] -= _half;
            var standingOnLeft = this.getMapSolidAt(leftGroundPoint[0], leftGroundPoint[1]);

            if (Array.isArray(standingOnLeft) && standingOnLeft.length) {
              var _groundActors = standingOnLeft.filter(function (a) {
                return a.args !== _this3.args && a.solid;
              });

              this.args.standingOn = _groundActors[0];
            } else if (standingOnLeft) {
              this.args.standingOn = null;
            } else {
              var rightGroundPoint = _toConsumableArray(this.groundPoint);

              rightGroundPoint[0] += _half;
              var standingOnRight = this.getMapSolidAt(rightGroundPoint[0], rightGroundPoint[1]);

              if (Array.isArray(standingOnRight) && standingOnRight.length) {
                var _groundActors2 = standingOnRight.filter(function (a) {
                  return a.args !== _this3.args && a.solid;
                });

                this.args.standingOn = _groundActors2[0];
              } else if (standingOnRight) {
                this.args.standingOn = null;
              } else {
                this.args.standingOn = null;
                this.args.falling = true;
              }
            }
          } else {
            this.args.standingOn = null;
            this.args.falling = true;
          }
        }
      } else {
        this.args.standingOn = null;
      }

      if (this.args.standingOn && this.args.standingOn.isVehicle) {
        this.args.cameraMode = this.args.standingOn["public"].cameraMode;
      } else {
        if (this.getMapSolidAt(this.x, this.y + 48, false)) {
          this.args.cameraMode = 'normal';
        } else if (this["public"].falling && !this.getMapSolidAt(this.x, this.y + 48, false)) {
          this.onTimeout(750, function () {
            if (_this3.args.cameraMode === 'airplane') {
              return;
            }

            if (_this3["public"].falling && !_this3.getMapSolidAt(_this3.x, _this3.y + 48, false)) {
              _this3.args.cameraMode = 'aerial';
            }
          });
        }
      }

      this.args.colliding = this.colliding;

      var _iterator6 = _createForOfIteratorHelper(this.behaviors),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var behavior = _step6.value;
          behavior.update(this);
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      if (this.twister) {
        this.twister.args.x = this["public"].x;
        this.twister.args.y = this["public"].y;
        this.twister.args.xOff = this["public"].xOff;
        this.twister.args.yOff = this["public"].yOff;
        this.twister.args.width = this["public"].width;
        this.twister.args.height = this["public"].height;
      }

      if (this.pincherBg) {
        this.pincherBg.args.x = this["public"].x;
        this.pincherBg.args.y = this["public"].y;
        this.pincherBg.args.xOff = this["public"].xOff;
        this.pincherBg.args.yOff = this["public"].yOff;
        this.pincherBg.args.width = this["public"].width;
        this.pincherBg.args.height = this["public"].height;
      }

      if (this.pincherFg) {
        this.pincherFg.args.x = this["public"].x;
        this.pincherFg.args.y = this["public"].y;
        this.pincherFg.args.xOff = this["public"].xOff;
        this.pincherFg.args.yOff = this["public"].yOff;
        this.pincherFg.args.width = this["public"].width;
        this.pincherFg.args.height = this["public"].height;
      }
    }
  }, {
    key: "updateGroundPosition",
    value: function updateGroundPosition() {
      var drag = this.region ? this.region["public"].drag : 1;

      if (!this["public"].dontJump && this.willJump) {
        this.willJump = false;
        var force = this.args.jumpForce * drag;

        if (this.running) {
          force = force * 1.5;
        } else if (this.crawling) {
          force = force * 0.5;
        }

        this.doJump(force);
        return;
      }

      var gSpeedMax = this.args.gSpeedMax;

      if (this.running) {
        gSpeedMax = RUNNING_SPEED;
      } else if (this.crawling) {
        gSpeedMax = CRAWLING_SPEED;
      }

      var nextPosition = [0, 0];

      if (this["public"].gSpeed) {
        var radius = Math.floor(this["public"].width / 2);
        var scanDist = radius + Math.abs(this["public"].gSpeed);
        var direction = Math.sign(this["public"].gSpeed || this["public"].direction);
        var max = Math.abs(this["public"].gSpeed);
        var step = 1;
        this.pause(true);

        for (var s = 0; s < max; s += step) {
          nextPosition = this.findNextStep(step * direction);

          if (!nextPosition) {
            break;
          }

          if (this["public"].width > 1) {
            if (this["public"].rolling) {
              var scanForwardHead = this.scanForward(step * direction, 1);

              if (scanForwardHead !== false) {
                this.args.gSpeed = scanForwardHead;
                break;
              }
            } else {
              var scanForwardWaist = this.scanForward(step * direction, 0.5);

              if (scanForwardWaist !== false) {
                this.args.gSpeed = scanForwardWaist;
                break;
              }
            }
          }

          if (nextPosition[3]) {
            this.args.moving = false;
            this.args.gSpeed = 0;

            if (this["public"].mode === MODE_LEFT || this["public"].mode === MODE_RIGHT) {
              this.args.mode = MODE_FLOOR;
              this.lastAngles = [];
            }

            break;
          } else if (nextPosition[2] === true) {
            this.args.moving = true;
            nextPosition[0] = step;
            nextPosition[1] = 0;
            this.args.ySpeed = 0;

            switch (this["public"].mode) {
              case MODE_FLOOR:
                this.args.xSpeed = this["public"].gSpeed;
                this.args.x += this["public"].direction;
                this.args.falling = !!this["public"].gSpeed;
                this.args["float"] = this.args["float"] < 0 ? this.args["float"] : 1;
                break;

              case MODE_CEILING:
                this.args.xSpeed = -this["public"].gSpeed;
                this.args.falling = !!this["public"].gSpeed;
                this.args["float"] = this.args["float"] < 0 ? this.args["float"] : 1;
                break;

              case MODE_LEFT:
                if (Math.abs(this["public"].gSpeed) < 8) {
                  this.args.mode = MODE_FLOOR;
                  this.args.y--;
                  this.args.x += this["public"].direction * this["public"].width / 2;
                } else {
                  this.args.ySpeed = this["public"].gSpeed;
                  this.args.xSpeed = 0;
                  this.args.ignore = 8;
                  this.args.falling = true;
                }

                break;

              case MODE_RIGHT:
                if (Math.abs(this["public"].gSpeed) < 8) {
                  this.args.mode = MODE_FLOOR;
                  this.args.y--;
                  this.args.x += this["public"].direction * this["public"].width / 2;
                } else {
                  this.args.ySpeed = -this["public"].gSpeed;
                  this.args.xSpeed = 0;
                  this.args.ignore = 8;
                  this.args.falling = true;
                }

                break;
            }

            this.args.gSpeed = 0;
            break;
          } else if (!nextPosition[0] && !nextPosition[1]) {
            this.args.moving = false;

            switch (this["public"].mode) {
              case MODE_FLOOR:
              case MODE_CEILING:
                this.args.gSpeed = 0;
                break;

              case MODE_LEFT:
              case MODE_RIGHT:
                break;
            }
          } else if ((nextPosition[0] || nextPosition[1]) && !this.rotateLock) {
            this.args.moving = true;
            this.args.angle = nextPosition[0] ? Math.atan(nextPosition[1] / nextPosition[0]) : nextPosition[1] > 0 ? Math.PI / 2 : -Math.PI / 2;
            this.lastAngles.unshift(this["public"].angle);
            this.lastAngles.splice(this.angleAvg);
          }

          if (!this.rotateLock) {
            switch (this["public"].mode) {
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

            if (this["public"].angle > Math.PI / 4 && this["public"].angle < Math.PI / 2) {
              this.lastAngles = this.lastAngles.map(function (n) {
                return n - Math.PI / 2;
              });

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

              this.args.groundAngle -= Math.PI / 2;
            } else if (this["public"].angle < -Math.PI / 4 && this["public"].angle > -Math.PI / 2) {
              var orig = this.args.mode;
              this.lastAngles = this.lastAngles.map(function (n) {
                return Number(n) + Math.PI / 2;
              });

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

              this.args.groundAngle = Number(this.args.groundAngle) + Math.PI / 2;
            }
          }
        }

        this.pause(false);
        var slopeFactor = 0;

        if (!this.args.climbing) {
          switch (this.args.mode) {
            case MODE_FLOOR:
              slopeFactor = this["public"].groundAngle / (Math.PI / 4);

              if (direction > 0) {
                slopeFactor *= -1;
              }

              break;

            case MODE_CEILING:
              slopeFactor = 0;
              break;

            case MODE_RIGHT:
              if (direction > 0) {
                slopeFactor = -2;
                slopeFactor -= this["public"].groundAngle / (Math.PI / 4);
              } else {
                slopeFactor = 2;
                slopeFactor += this["public"].groundAngle / (Math.PI / 4);
              }

              break;

            case MODE_LEFT:
              if (direction > 0) {
                slopeFactor = 2;
                slopeFactor -= this["public"].groundAngle / (Math.PI / 4);
              } else {
                slopeFactor = -2;
                slopeFactor += this["public"].groundAngle / (Math.PI / 4);
              }

              break;
          }

          if (this["public"].rolling) {
            if (slopeFactor < 0) {
              this.args.gSpeed *= 1.0000 - (0 - slopeFactor / 2 * 0.005);
            } else if (slopeFactor > 0) {
              this.args.gSpeed *= 1.0000 * (1 + slopeFactor / 2 * 0.035);
            }

            if (Math.sign(this["public"].gSpeed) !== Math.sign(this.xAxis) && Math.abs(this["public"].gSpeed) < 1) {// this.public.gSpeed = 10 * Math.sign(this.xAxis);
            }
          } else if (!this.stayStuck) {
            var speedFactor = 1;

            if (slopeFactor < 0 && Math.abs(this["public"].gSpeed) < 10) {
              speedFactor = 0.99990 * (1 - Math.pow(slopeFactor, 2) / 4 / 2);
            } else if (slopeFactor > 0 && Math.abs(this["public"].gSpeed) < this["public"].gSpeedMax / 2) {
              speedFactor = 1.05000 * (1 + Math.pow(slopeFactor, 2) / 4 / 2);
            }

            this.args.gSpeed *= speedFactor;

            if (Math.abs(this["public"].gSpeed) < 1) {
              if (slopeFactor < -1) {
                this.args.gSpeed *= -0.5;
                this.args.ignore = 8;
                this.xAxis = 0;
              }
            }
          }

          if (!this.stayStuck && slopeFactor < -1 && Math.abs(this.args.gSpeed) < 1) {
            if (this.args.mode === 1) {
              this.args.gSpeed = 1;
            } else if (this.args.mode === 3) {
              this.args.gSpeed = -1;
            }
          }
        }

        if (!this.xAxis && this["public"].gSpeed > 0) {
          if (this["public"].rolling) {
            this.args.gSpeed -= this["public"].decel * 1 / drag * 0.125;
          } else {
            this.args.gSpeed -= this["public"].decel * 1 / drag;
          }
        } else if (!this.xAxis && this["public"].gSpeed < 0) {
          if (this["public"].rolling) {
            this.args.gSpeed += this["public"].decel * 1 / drag * 0.125;
          } else {
            this.args.gSpeed += this["public"].decel * 1 / drag;
          }
        }

        if (!this.xAxis && Math.abs(this["public"].gSpeed) < this["public"].decel * 1 / drag) {
          this.args.gSpeed = 0;
        }
      }

      if (nextPosition && (nextPosition[0] !== false || nextPosition[1] !== false)) {
        if (Math.abs(this["public"].gSpeed) > this["public"].rollSpeedMax && this["public"].rollSpeedMax !== Infinity && this["public"].rollSpeedMax !== -Infinity) {
          this.args.gSpeed = this["public"].rollSpeedMax * Math.sign(this["public"].gSpeed);
        }
      } else {
        this.args.ignore = this["public"].ignore || 1;
        this.args.gSpeed = 0;
      }
    }
  }, {
    key: "updateAirPosition",
    value: function updateAirPosition() {
      var _this4 = this;

      var lastPoint = [this.x, this.y];
      var lastPointB = [this.x, this.y];
      var lastForePoint = [this.x, this.y];
      this.lastAngles.splice(0);
      this.args.groundAngle = 0;
      var tileMap = this.viewport.tileMap;
      var cSquared = Math.pow(this["public"].xSpeed, 2) + Math.pow(this["public"].ySpeed, 2);
      var airSpeed = cSquared ? Math.sqrt(cSquared) : 0;
      var viewport = this.viewport;
      var radius = Math.round(this["public"].width / 2);
      var direction = Math.sign(this["public"].xSpeed); // this.args.direction = direction;

      if (!airSpeed) {
        return;
      }

      if (!this.willStick && this.args.xSpeed) {
        var foreDistance = this.scanForward(this["public"].xSpeed, 0.5);

        if (foreDistance !== false) {
          this.args.x += foreDistance * Math.sign(this["public"].xSpeed);
          this.args.flySpeed = 0;
          this.args.xSpeed = 0;

          if (!this.args.flying && !this.args["float"]) {// this.args.ignore = -2;
          }
        }
      }

      if (this["public"].xSpeed) {
        var backDistance = this.castRay(radius, Math.PI, function (i, point) {
          if (tileMap.getSolid.apply(tileMap, _toConsumableArray(point).concat([_this4["public"].layer]))) {
            return i;
          }
        });

        var _foreDistance = this.castRay(radius, 0, function (i, point) {
          if (tileMap.getSolid.apply(tileMap, _toConsumableArray(point).concat([_this4["public"].layer]))) {
            return i;
          }
        });

        if (backDistance && _foreDistance) {// crush instakill?
        } else if (_foreDistance) {
          this.args.x -= 0 + (radius - _foreDistance);
        } else if (backDistance) {
          this.args.x += 0 + (radius - backDistance);
        }
      }

      var airPoint = this.castRay(airSpeed + radius, this["public"].airAngle, function (i, point) {
        var actors = viewport.actorsAtPoint(point[0], point[1]).filter(function (x) {
          return x.args !== _this4.args;
        }).filter(function (x) {
          return x.callCollideHandler(_this4);
        }).filter(function (x) {
          return x.solid;
        });

        if (actors.length > 0) {
          return point;
        }

        if (tileMap.getSolid(point[0], point[1], _this4["public"].layer)) {
          return lastPoint;
        }

        lastPoint = point.map(Math.floor);
      });
      var airPointB = this.castRay(airSpeed + radius, this["public"].airAngle, [0, -3], function (i, point) {
        var actors = viewport.actorsAtPoint(point[0], point[1]).filter(function (x) {
          return x.args !== _this4.args;
        }).filter(function (x) {
          return x.callCollideHandler(_this4);
        }).filter(function (x) {
          return x.solid;
        });

        if (actors.length > 0) {
          return point;
        }

        if (tileMap.getSolid(point[0], point[1], _this4["public"].layer)) {
          return lastPointB;
        }

        lastPointB = point.map(Math.floor);
      });
      this.willJump = false;
      var blockers = false;
      var upMargin = (this["public"].flying ? this["public"].height + this["public"].yMargin : this["public"].height) || 1;
      var upDistance = this.castRay(Math.abs(this["public"].ySpeed) + upMargin + 1, this.upAngle, function (i, point) {
        if (!_this4.viewport) {
          return false;
        }

        var actors = _this4.viewport.actorsAtPoint(point[0], point[1]).filter(function (x) {
          return x.args !== _this4.args;
        }).filter(function (x) {
          return x.callCollideHandler(_this4);
        }).filter(function (a) {
          return a.solid;
        });

        if (actors.length > 0) {
          return i;
        }

        if (tileMap.getSolid(point[0], point[1], _this4.args.layer)) {
          return i;
        }
      });
      var xSpeedOriginal = this["public"].xSpeed;
      var ySpeedOriginal = this["public"].ySpeed;

      if (this["public"].ySpeed < 0 && upDistance !== false) {
        this.args.ignore = 1;
        this.args.y -= Math.floor(upDistance - upMargin);
        this.args.ySpeed = 0;
        blockers = this.getMapSolidAt(this.x, this.y);

        if (Array.isArray(blockers) && !this["public"].flying) {
          var stickers = blockers.filter(function (a) {
            return a.canStick;
          });

          if (this.willStick && stickers.length) {
            this.args.gSpeed = Math.floor(-xSpeedOriginal);
            this.args.mode = MODE_CEILING;
            this.args.falling = false;
          }
        } else if (this.willStick && !this["public"].flying) {
          var _blockers = this.getMapSolidAt(this.x, this.y - 1);

          var _stickers = Array.isArray(_blockers) && _blockers.filter(function (a) {
            return a.canStick;
          });

          if (!_blockers.length || _blockers.length && _stickers.length) {
            this.args.gSpeed = Math.floor(-xSpeedOriginal);
            this.args.mode = MODE_CEILING;
            this.args.falling = false;
          }
        }
      } else if (airPoint !== false && airPointB !== false) {
        var collisionAngle = Math.atan2(airPoint[0] - airPointB[0], airPoint[1] - airPointB[1]);
        var isLeft = Math.abs(collisionAngle) < Math.PI / 2 && this["public"].xSpeed < 0;
        var isRight = Math.abs(collisionAngle) < Math.PI / 2 && this["public"].xSpeed > 0; // this.args.ignore = 0;

        var _xSpeedOriginal = this.args.xSpeed;
        var _ySpeedOriginal = this.args.ySpeed;
        this.args.gSpeed = _xSpeedOriginal || this.args.gSpeed;
        this.args.xSpeed = 0;
        this.args.ySpeed = 0;
        var stickX = this.args.x = Math.floor(airPoint[0]);
        var stickY = this.args.y = Math.floor(airPoint[1]);
        blockers = this.getMapSolidAt(this.x + direction, this.y);

        if (Array.isArray(blockers)) {
          blockers = blockers.filter(function (a) {
            return a.callCollideHandler(_this4);
          });

          if (!blockers.length) {
            blockers = false;
          }
        }

        if (this.willStick && !this.getMapSolidAt(this.x - direction, this.y) && !this.getMapSolidAt(this.x, this.y + 1)) {
          if (isLeft) {
            this.args.gSpeed = Math.floor(airSpeed) * Math.sign(_ySpeedOriginal);
            this.args.gSpeed = 0.1;
            this.args.mode = MODE_LEFT;
          } else if (isRight) {
            this.args.gSpeed = Math.floor(airSpeed) * -Math.sign(_ySpeedOriginal);
            this.args.gSpeed = 0.1;
            this.args.mode = MODE_RIGHT;
          } else {
            this.args.mode = MODE_FLOOR;
          }
        }

        var halfWidth = Math.floor(this["public"].width / 2);
        var backPosition = this.findNextStep(-halfWidth);
        var forePosition = this.findNextStep(halfWidth);
        var sensorSpread = this["public"].width;

        if (forePosition && backPosition) {
          var newAngle = Math.atan2(forePosition[1] - backPosition[1], sensorSpread + 1).toFixed(1);

          if (isNaN(newAngle)) {
            console.log(newAngle);
            throw new Error('angle is NAN!');
          }

          if (forePosition[0] !== false || backPosition[0] !== false) {
            this.args.angle = this.args.groundAngle = newAngle;
            this.lastAngles.unshift(newAngle);
            this.lastAngles.splice(this.angleAvg);
            var slopeDir = -Math.sign(this.args.groundAngle);

            if (Math.abs(slopeDir) > 0) {
              this.args.gSpeed = _ySpeedOriginal * slopeDir;
            } else if (_xSpeedOriginal) {
              this.args.gSpeed = _xSpeedOriginal;
            }
          }

          if (Math.abs(this.args.gSpeed) < 1) {
            this.args.gSpeed = Math.sign(this.args.gSpeed);
          }
        }

        this.args.falling = false;

        if (this.dropDashCharge && this.args.mode === MODE_FLOOR) {
          var dropBoost = this.dropDashCharge * Math.sign(this["public"].xSpeed || this["public"].direction);
          this.args.gSpeed += dropBoost;
          var _viewport = this.viewport;
          var dustParticle = new _Tag.Tag('<div class = "particle-dust">');
          var dustPoint = this.rotatePoint(this.args.gSpeed, 0);
          dustParticle.style({
            '--x': dustPoint[0] + this.x,
            '--y': dustPoint[1] + this.y,
            'z-index': 0,
            opacity: Math.random() * 2
          });

          _viewport.particles.add(dustParticle);

          setTimeout(function () {
            _viewport.particles.remove(dustParticle);
          }, 350);
        }

        if (this.yAxis > 0 && this.canRoll && this["public"].gSpeed) {
          this.args.rolling = true;
        }
      } else if (this["public"].ySpeed > 0) {
        this.args.mode = DEFAULT_GRAVITY;
        this.args.gSpeed = Math.floor(xSpeedOriginal);
      }

      if (Math.abs(this["public"].xSpeed) > this["public"].xSpeedMax) {
        this.args.xSpeed = this["public"].xSpeedMax * Math.sign(this["public"].xSpeed);
      }

      if (Math.abs(this["public"].ySpeed) > this["public"].ySpeedMax) {
        this.args.ySpeed = this["public"].ySpeedMax * Math.sign(this["public"].ySpeed);
      }

      if (airPoint === false) {
        this.args.x += this["public"].xSpeed;
        this.args.y += this["public"].ySpeed;
        this.args.falling = true;
      }
    }
  }, {
    key: "callCollideHandler",
    value: function callCollideHandler(other) {
      if (this.isGhost) {
        return;
      }

      this.colliding = true;
      var type;
      this.args.collType = 'collision-intersect';
      type = -1;

      if (other.y <= this.y - this.args.height) {
        this.args.collType = 'collision-top';
        type = 0;
      } else if (other.x < this.x - Math.floor(this.args.width / 2)) {
        this.args.collType = 'collision-left';
        type = 1;
      } else if (other.x >= this.x + Math.floor(this.args.width / 2)) {
        this.args.collType = 'collision-right';
        type = 3;
      } else if (other.y >= this.y) {
        this.args.collType = 'collision-bottom';
        type = 2;
      }

      if (this.viewport) {
        var collisionListA = this.viewport.collisions.get(this) || new Set();
        var collisionListB = this.viewport.collisions.get(other) || new Set();
        collisionListA.add(other);
        collisionListB.add(this);
        this.viewport.collisions.set(this, collisionListA);
        this.viewport.collisions.set(other, collisionListB);
      }

      this.collideB(other, type);
      other.collideB(this);
      return this.collideA(other, type) || other.collideA(this);
    }
  }, {
    key: "resolveIntersection",
    value: function resolveIntersection() {
      var _this5 = this;

      if (!this.args.falling || this["public"].jumping) {
        return;
      }

      var backAngle = this.args.airAngle + Math.PI;
      var iterations = 0;

      if (this.getMapSolidAt(this.x, this.y)) {
        var testX = this.x;
        var testY = this.y;
        this.args.ignore = 10;
        var blockers, b;
        var maxIterations = this["public"].height > this["public"].width ? this["public"].height : this["public"].witdth;

        while (true) {
          if (!this.viewport) {
            return;
          }

          b = this.getMapSolidAt(testX, testY);

          if (!b) {
            break;
          }

          blockers = b;

          if (Array.isArray(blockers)) {
            blockers = blockers.filter(function (x) {
              return x.args !== _this5.args;
            }).filter(function (x) {
              return x.callCollideHandler(_this5);
            });

            if (!blockers.length) {
              break;
            }
          }

          testX -= Math.cos(backAngle);
          testY -= Math.sin(backAngle);
          iterations++;

          if (iterations > maxIterations) {
            break;
          }
        }

        var below = this.checkBelow(testX, testY);

        if (Array.isArray(blockers)) {
          if (this.willStick && blockers.filter(function (a) {
            return a.canStick;
          }).length) {
            this.args.ySpeed = 0;
            this.args.xSpeed = 0;
          }

          if (!below) {
            this.args.falling = true;
          }
        } else if (blockers) {
          if ((this.willStick || below) && this.args.ySpeed > 0) {
            this.args.falling = false;
            var halfWidth = Math.floor(this["public"].width / 2);
            var backPosition = this.findNextStep(-halfWidth);
            var forePosition = this.findNextStep(halfWidth);
            var sensorSpread = this["public"].width;
            var newAngle = Math.atan2(forePosition[1] - backPosition[1], sensorSpread + 1);

            if (isNaN(newAngle)) {
              console.log(newAngle);
            }

            this.args.angle = this.args.groundAngle = newAngle;
            this.lastAngles.unshift(newAngle);
            this.lastAngles.splice(this.angleAvg);
            var slopeDir = -Math.sign(this["public"].groundAngle);
            this.args.gSpeed = (1 + this["public"].ySpeed) * slopeDir;
          } else if (!below) {
            this.args.falling = true;
          }
        }

        this.args.x = testX;
        this.args.y = testY;
        this.willJump = false;
      }
    }
  }, {
    key: "checkBelow",
    value: function checkBelow(testX, testY) {
      var _this6 = this;

      var below = this.getMapSolidAt(testX + Math.floor(this.args.width / 2), testY + 1);

      if (!below) {
        below = this.getMapSolidAt(testX - Math.floor(this.args.width / 2), testY + 1);
      }

      if (Array.isArray(below)) {
        below = below.filter(function (x) {
          return x.solid && x.callCollideHandler(_this6);
        }).length;
      }

      return below;
    }
  }, {
    key: "processInput",
    value: function processInput() {
      if (this.controllable && this.args.standingOn && this.args.standingOn.isVehicle && this.args.standingOn.occupant === this) {
        var vehicle = this.args.standingOn;
        vehicle.xAxis = this.xAxis;
        vehicle.yAxis = this.yAxis;
        vehicle.stayStuck = this.stayStuck;
        vehicle.willStick = this.willStick;
        this.processInputVehicle();
        this.args.direction = vehicle["public"].direction;
        this.args.facing = vehicle["public"].facing;
        this.args.layer = vehicle["public"].layer;
        this.args.mode = vehicle["public"].mode;
        this.args.angle = vehicle["public"].angle;

        if (!vehicle.args.falling) {
          this.args.groundAngle = vehicle.args.groundAngle || 0;
        } else {
          this.args.groundAngle = (vehicle.args.flyAngle || 0) * -this["public"].direction;
        }

        this.args.cameraMode = vehicle.args.cameraMode; // const seatX = (vehicle.args.seatX || 0) * this.args.direction;
        // const seatY = (vehicle.args.seatY || 0);
        // this.args.x = vehicle.args.x + seatX;
        // this.args.y = vehicle.args.y + vehicle.args.height + seatY;
      } else if (this.controllable) {
        this.processInputDirect();
      }
    }
  }, {
    key: "processInputDirect",
    value: function processInputDirect() {
      var xAxis = this.xAxis;
      var yAxis = this.yAxis;

      if (this["public"].ignore !== 0) {
        xAxis = 0;
        yAxis = 0;
      }

      var gSpeedMax = this["public"].gSpeedMax;

      if (this.running) {
        gSpeedMax = RUNNING_SPEED;
      } else if (this.crawling) {
        gSpeedMax = CRAWLING_SPEED;
      }

      if (!this["public"].falling) {
        if (Math.abs(this["public"].gSpeed) < 0.01) {
          this.args.rolling = false;
          this["public"].gSpeed = 0;
        } else if (this.canRoll && this.yAxis > 0) {
          this.args.rolling = true;
        }
      } else {
        this.args.rolling = false;
      }

      var drag = this.region ? this.region["public"].drag : 1;

      if (!this["public"].falling) {
        if (xAxis && !this["public"].rolling) {
          var gSpeed = this["public"].gSpeed;
          var axisSign = Math.sign(xAxis);
          var sign = Math.sign(this["public"].gSpeed);

          if (!this["public"].rolling) {
            if (axisSign === sign || !sign) {
              gSpeed += xAxis * this["public"].accel * drag;
            } else {
              gSpeed += xAxis * this["public"].accel * drag * this["public"].skidTraction;
            }
          }

          if (Math.abs(gSpeed) > gSpeedMax) {
            gSpeed = gSpeedMax * Math.sign(gSpeed);
          }

          if (!Math.sign(this["public"].gSpeed) || Math.sign(this["public"].gSpeed) === Math.sign(gSpeed)) {
            if (Math.abs(gSpeed) < gSpeedMax || Math.sign(gSpeed) !== xAxis) {
              this.args.gSpeed = gSpeed;
            }
          } else {
            this.args.gSpeed = 0;
            return;
          }
        }
      } else if (this["public"].falling && xAxis && Math.abs(this["public"].xSpeed) < this.args.xSpeedMax) {
        if (Math.abs(this["public"].xSpeed) < this.args.flySpeedMax) {
          this.args.xSpeed += xAxis * this["public"].airAccel * drag;
        }
      }

      if (xAxis < 0) {
        if (!this["public"].climbing) {
          this.args.facing = 'left';
        }

        this.args.direction = -1;
      }

      if (xAxis > 0) {
        if (!this["public"].climbing) {
          this.args.facing = 'right';
        }

        this.args.direction = 1;
      }

      if (this.aAxis < -0.75) {
        if (this.inventory.has(_ElectricSheild.ElectricSheild)) {
          this.args.currentSheild = _toConsumableArray(this.inventory.get(_ElectricSheild.ElectricSheild))[0];
        }
      }

      if (this.aAxis > +0.75) {
        if (this.inventory.has(_FireSheild.FireSheild)) {
          this.args.currentSheild = _toConsumableArray(this.inventory.get(_FireSheild.FireSheild))[0];
        }
      }

      if (this.bAxis < -0.75) {
        if (this.inventory.has(_BubbleSheild.BubbleSheild)) {
          this.args.currentSheild = _toConsumableArray(this.inventory.get(_BubbleSheild.BubbleSheild))[0];
        }
      }

      if (this.bAxis > +0.75) {
        this.args.currentSheild = '';
      }
    }
  }, {
    key: "processInputVehicle",
    value: function processInputVehicle() {
      this.args.standingOn.processInputDirect();
    }
  }, {
    key: "collideA",
    value: function collideA(other, type) {
      return this.solid;
    }
  }, {
    key: "collideB",
    value: function collideB(other) {}
  }, {
    key: "findNextStep",
    value: function findNextStep(offset) {
      var _this7 = this;

      if (!this.viewport) {
        return;
      }

      var viewport = this.viewport;
      var tileMap = viewport.tileMap;
      var maxStep = this.maxStep;
      var sign = Math.sign(offset);
      var downFirstSolid = false;
      var upFirstSpace = false;
      var prevUp = 0,
          prevDown = 0,
          prev = 0;
      var col = 0;

      for (; col < Math.abs(offset); col += 1) {
        downFirstSolid = false;
        upFirstSpace = false;
        var offsetPoint = void 0;
        var columnNumber = (1 + col) * sign;

        switch (this["public"].mode) {
          case MODE_FLOOR:
            offsetPoint = [columnNumber, 1];
            break;

          case MODE_RIGHT:
            offsetPoint = [1, -columnNumber];
            break;

          case MODE_CEILING:
            offsetPoint = [-columnNumber, -1];
            break;

          case MODE_LEFT:
            offsetPoint = [-1, columnNumber];
            break;
        }

        downFirstSolid = this.castRay(maxStep * (1 + col), this.downAngle, offsetPoint, function (i, point) {
          if (tileMap.getSolid(point[0], point[1], _this7["public"].layer)) {
            return i;
          }

          var actors = viewport.actorsAtPoint(point[0], point[1]).filter(function (a) {
            return a.args !== _this7.args;
          }).filter(function (a) {
            return (i <= 1 || _this7["public"].gSpeed) && a.callCollideHandler(_this7);
          }).filter(function (a) {
            return a.solid;
          });

          if (actors.length > 0) {
            return i;
          }
        });

        if (downFirstSolid === false) {
          return [false, false, true];
        }

        var downDiff = Math.abs(prevDown - downFirstSolid);

        if (Math.abs(downDiff) >= maxStep) {
          return [false, false, false, true];
        }

        if (downFirstSolid === 0) {
          var _offsetPoint = void 0;

          switch (this["public"].mode) {
            case MODE_FLOOR:
              _offsetPoint = [columnNumber, 0];
              break;

            case MODE_RIGHT:
              _offsetPoint = [0, -columnNumber];
              break;

            case MODE_CEILING:
              _offsetPoint = [-columnNumber, 0];
              break;

            case MODE_LEFT:
              _offsetPoint = [0, columnNumber];
              break;
          }

          var upLength = +1 + maxStep * (1 + col);
          upFirstSpace = this.castRay(upLength, this.upAngle, _offsetPoint, function (i, point) {
            var actors = viewport.actorsAtPoint(point[0], point[1]).filter(function (x) {
              return x.args !== _this7.args;
            }).filter(function (a) {
              return (i <= 1 || _this7["public"].gSpeed) && a.callCollideHandler(_this7);
            }).filter(function (x) {
              return x.solid;
            });

            if (actors.length === 0) {
              if (!tileMap.getSolid(point[0], point[1], _this7["public"].layer)) {
                return i;
              }
            }
          });
          var upDiff = Math.abs(prevUp - upFirstSpace);

          if (upFirstSpace === false) {
            return [false, false, false, true];
            return [(1 + col) * sign, false, false, true];
          }

          if (upDiff >= maxStep) {
            return [false, false, false, true];
            return [-1 + col, prev, false, true];
          }

          prev = prevUp = upFirstSpace;
        } else {
          prev = prevDown = downFirstSolid;
        }
      }

      if (upFirstSpace !== false) {
        return [col * sign, upFirstSpace, false];
      }

      return [col * sign, -downFirstSolid, false];
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
        var bottom = [this["public"].x + offset[0] + i * Math.cos(angle), this["public"].y + offset[1] + i * Math.sin(angle)];
        var retVal = callback(i, bottom);

        if (retVal !== undefined) {
          return retVal;
        }
      }

      return false;
    }
  }, {
    key: "doJump",
    value: function doJump(force) {
      if (this["public"].ignore || this["public"].falling || !this["public"].landed || this["public"]["float"]) {
        return;
      }

      var backPosition = this.findNextStep(Math.ceil(-this["public"].width / 2));
      var forePosition = this.findNextStep(Math.ceil(this["public"].width / 2));
      var sensorSpread = this["public"].width;
      var groundAngle = Math.atan2(backPosition[1] - forePosition[1], Math.ceil(sensorSpread));
      this.args.ignore = 6;
      this.args.landed = false;
      this.args.falling = true;
      var originalMode = this["public"].mode;

      switch (this["public"].mode) {
        case MODE_FLOOR:
          this.args.y -= 16;
          break;

        case MODE_RIGHT:
          groundAngle += -Math.PI / 2;
          this.args.x += -this["public"].width / 2;
          break;

        case MODE_CEILING:
          groundAngle += Math.PI;
          this.args.y += this["public"].height;
          break;

        case MODE_LEFT:
          groundAngle += Math.PI / 2;
          this.args.x += this["public"].width / 2;
          break;
      }

      this.args.xSpeed = this["public"].gSpeed * Math.cos(groundAngle);
      this.args.ySpeed = this["public"].gSpeed * Math.sin(groundAngle);
      var jumpAngle = groundAngle - Math.PI / 2;
      var xJump = force * Math.cos(jumpAngle);
      var yJump = force * Math.sin(jumpAngle);

      if (Math.abs(xJump) < 0.01) {
        xJump = 0;
      }

      if (Math.abs(yJump) < 0.01) {
        yJump = 0;
      }

      this.args.airAngle = jumpAngle;
      this.args.xSpeed += xJump;
      this.args.ySpeed += yJump;
      this.args.jumpedAt = this.y;
      this.args.jumping = true;
      this.args.mode = DEFAULT_GRAVITY;
    }
  }, {
    key: "impulse",
    value: function impulse(magnitude, direction) {
      var willFall = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      this.impulseMag = magnitude;
      this.impulseDir = direction;
      this.impulseFal = willFall;
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
    key: "findNearestActor",
    value: function findNearestActor(selector, maxDistance) {
      var _this8 = this;

      var direction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var viewport = this.viewport;

      if (!viewport) {
        return;
      }

      var cells = viewport.getNearbyColCells(this);
      var actors = new Map();
      cells.map(function (s) {
        return s.forEach(function (a) {
          if (a === _this8) {
            return;
          }

          if (a["public"].gone) {
            return;
          }

          if (!selector(a)) {
            return;
          }

          var distance = _this8.distanceFrom(a);

          var angle = Math.atan2(a.y - _this8.y, a.x - _this8.x);

          if (Math.abs(distance) > maxDistance) {
            return;
          }

          actors.set(distance, a);
        });
      });

      var distances = _toConsumableArray(actors.keys());

      var shortest = Math.min.apply(Math, _toConsumableArray(distances));
      var closest = actors.get(shortest);
      return closest;
    }
  }, {
    key: "scanForward",
    value: function scanForward(speed) {
      var _this9 = this;

      var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;
      var scanActors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var dir = Math.sign(speed);
      var radius = Math.round(this["public"].width / 2);
      var hRadius = Math.round(this["public"].height / 2);
      var scanDist = Math.abs(speed);
      var viewport = this.viewport;

      if (!viewport) {
        return;
      }

      var tileMap = viewport.tileMap;
      var startPoint = this.rotatePoint(radius * -dir, this["public"].height * height);
      return this.castRay(scanDist, this["public"].falling ? Math.sign(speed) > 0 ? 0 : Math.PI : this.realAngle + (Math.sign(speed) < 0 ? Math.PI : 0), startPoint, function (i, point) {
        if (scanActors) {
          var actors = viewport.actorsAtPoint(point[0], point[1]).filter(function (x) {
            return x.args !== _this9.args;
          }).filter(function (x) {
            return i <= radius && x.callCollideHandler(_this9);
          }).filter(function (x) {
            return x.solid;
          });

          if (actors.length > 0) {
            return i;
          }
        }

        if (tileMap.getSolid(point[0], point[1], _this9["public"].layer)) {
          return i;
        }
      });
    }
  }, {
    key: "scanBottomEdge",
    value: function scanBottomEdge() {
      var _this10 = this;

      var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var tileMap = this.viewport.tileMap;
      return this.castRay(this["public"].width, direction < 0 ? Math.PI : 0, [-direction * (this["public"].width / 2), 0], function (i, point) {
        var actors = _this10.viewport.actorsAtPoint(point[0], point[1] + 1).filter(function (a) {
          return a.args !== _this10.args;
        });

        if (!actors.length && !tileMap.getSolid(point[0], point[1] + 1, _this10["public"].layer)) {
          return i;
        }
      });
    }
  }, {
    key: "scanVerticalEdge",
    value: function scanVerticalEdge() {
      var _this11 = this;

      var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var tileMap = this.viewport.tileMap;
      return this.castRay(this["public"].height + 1, Math.PI / 2, [direction * this["public"].width / 2, -this["public"].height], function (i, point) {
        var actors = _this11.viewport.actorsAtPoint(point[0], point[1]).filter(function (a) {
          return a.args !== _this11.args;
        });

        if (actors.length || tileMap.getSolid(point[0], point[1], _this11["public"].layer)) {
          return i;
        }
      });
    }
  }, {
    key: "rotatePoint",
    value: function rotatePoint(x, y) {
      var xRot = x * Math.cos(this.realAngle) - y * Math.sin(this.realAngle);
      var yRot = y * Math.cos(this.realAngle) + x * Math.sin(this.realAngle);
      return [xRot, yRot];
    }
  }, {
    key: "standBelow",
    value: function standBelow(other) {}
  }, {
    key: "getMapSolidAt",
    value: function getMapSolidAt(x, y) {
      var _this12 = this;

      var actors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      if (!this.viewport) {
        return;
      }

      if (actors) {
        var _actors = this.viewport.actorsAtPoint(x, y).filter(function (x) {
          return x.args !== _this12.args;
        }).filter(function (x) {
          return x.solid;
        });

        if (_actors.length > 0) {
          return _actors;
        }
      }

      var tileMap = this.viewport.tileMap;
      return tileMap.getSolid(x, y, this["public"].layer);
    }
  }, {
    key: "readInput",
    value: function readInput() {
      if (!this.controller) {
        return;
      }

      var controller = this.controller;

      if (controller.axes[0]) {
        this.xAxis = controller.axes[0].magnitude;
      }

      if (controller.axes[1]) {
        this.yAxis = controller.axes[1].magnitude;
      }

      if (controller.axes[2]) {
        this.aAxis = controller.axes[2].magnitude;
      }

      if (controller.axes[3]) {
        this.bAxis = controller.axes[3].magnitude;
      }

      var buttons = controller.buttons;

      for (var i in buttons) {
        var button = buttons[i];
        var release = "release_".concat(i); // const change  = `change_${i}`;

        var press = "command_".concat(i);
        var hold = "hold_".concat(i);

        if (!this.args.standingOn || !this.args.standingOn.isVehicle || i == 0) {
          if (button.delta === 1) {
            this[press] && this[press](button);
          } else if (button.delta === -1) {
            this[release] && this[release](button);
          } else if (button.active) {
            this[hold] && this[hold](button);
          }
        } else if (this.args.standingOn && this.args.standingOn.isVehicle) {
          var vehicle = this.args.standingOn;

          if (button.delta === 1) {
            vehicle[press] && vehicle[press](button);
          } else if (button.delta === -1) {
            vehicle[release] && vehicle[release](button);
          } else if (button.active) {
            vehicle[hold] && vehicle[hold](button);
          }
        }
      }
    }
  }, {
    key: "command_0",
    value: function command_0() // jump
    {
      if (this["public"].falling || this.willJump || this["public"].dontJump) {
        return;
      }

      if (!this.willJump) {
        this.willJump = true;
      }
    }
  }, {
    key: "release_0",
    value: function release_0() {
      if (this.args.jumping && this.args.ySpeed < 0) {
        this.args.ySpeed *= 0.5;
      }
    }
  }, {
    key: "distanceFrom",
    value: function distanceFrom(_ref) {
      var x = _ref.x,
          y = _ref.y;
      var aSquared = Math.pow(this.x - x, 2);
      var bSquared = Math.pow(this.y - y, 2);
      var cSquared = aSquared + bSquared;

      if (cSquared) {
        return Math.sqrt(cSquared);
      }

      return 0;
    }
  }, {
    key: "twist",
    value: function twist(warp) {
      var _this13 = this;

      if (!this.twister) {
        var filterContainer = this.viewport.tags.bgFilters;
        var html = "<div class = \"point-actor-filter twist-filter\">";
        this.twistFilter = new _Tag.Tag(html);
        filterContainer.appendChild(this.twistFilter.node);
        this.twister = new _Twist.Twist({
          id: 'twist-' + this.args.id,
          scale: 60
        });
        this.twister.args.bindTo(['x', 'y', 'width', 'height', 'xOff', 'yOff'], function (v, k) {
          var _this13$twistFilter$s;

          _this13.twistFilter.style((_this13$twistFilter$s = {}, _defineProperty(_this13$twistFilter$s, "--".concat(k), v), _defineProperty(_this13$twistFilter$s, "filter", "url(#twist-".concat(_this13.args.id, ")")), _this13$twistFilter$s));
        });
        this.twister.render(this.sprite);
      }

      this.twister.args.scale = warp;
    }
  }, {
    key: "pinch",
    value: function pinch() {
      var _this14 = this;

      var warpBg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var warpFg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (!this.pincherBg) {
        var filterContainer = this.viewport.tags.bgFilters;
        var type = this.args.type.split(' ').shift();
        var html = "<div class = \"point-actor-filter pinch-filter\">";
        this.pinchFilterBg = new _Tag.Tag(html);
        filterContainer.appendChild(this.pinchFilterBg.node);
        this.pincherBg = new _Pinch.Pinch({
          id: 'pinch-' + this.args.id,
          scale: 60
        });
        this.pincherBg.args.bindTo(['x', 'y', 'width', 'height', 'xOff', 'yOff'], function (v, k) {
          var _this14$pinchFilterBg;

          _this14.pinchFilterBg.style((_this14$pinchFilterBg = {}, _defineProperty(_this14$pinchFilterBg, "--".concat(k), v), _defineProperty(_this14$pinchFilterBg, "filter", "url(#pinch-".concat(_this14.args.id, ")")), _this14$pinchFilterBg));
        });
        this.args.yOff = 16;
        this.pincherBg.render(this.sprite);
      }

      this.pincherBg.args.scale = warpBg;

      if (!this.pincherFg) {
        var _filterContainer = this.viewport.tags.fgFilters;

        var _type = this.args.type.split(' ').shift();

        var _html = "<div class = \"point-actor-filter pinch-filter\">";
        this.pinchFilterFg = new _Tag.Tag(_html);

        _filterContainer.appendChild(this.pinchFilterFg.node);

        this.pincherFg = new _Pinch.Pinch({
          id: 'pinch-fg-' + this.args.id,
          scale: 60
        });
        this.pincherFg.args.bindTo(['x', 'y', 'width', 'height', 'xOff', 'yOff'], function (v, k) {
          var _this14$pinchFilterFg;

          _this14.pinchFilterFg.style((_this14$pinchFilterFg = {}, _defineProperty(_this14$pinchFilterFg, "--".concat(k), v), _defineProperty(_this14$pinchFilterFg, "filter", "url(#pinch-fg-".concat(_this14.args.id, ")")), _this14$pinchFilterFg));
        });
        this.args.yOff = 16;
        this.pincherFg.render(this.sprite);
      }

      this.pincherFg.args.scale = warpFg;
    }
  }, {
    key: "sleep",
    value: function sleep() {}
  }, {
    key: "wakeUp",
    value: function wakeUp() {}
  }, {
    key: "urlWrap",
    value: function urlWrap(url) {
      return "url(".concat(url, ")");
    }
  }, {
    key: "realAngle",
    get: function get() {
      if (this["public"].falling) {
        return Math.PI;
      }

      var groundAngle = Number(this["public"].groundAngle);
      var trajectory;

      switch (this["public"].mode) {
        case 0:
          trajectory = -groundAngle - Math.PI;
          break;

        case 1:
          trajectory = -groundAngle - Math.PI / 2;
          break;

        case 2:
          trajectory = -groundAngle;
          break;

        case 3:
          trajectory = -groundAngle + Math.PI / 2;
          break;
      }

      return trajectory;
    }
  }, {
    key: "downAngle",
    get: function get() {
      switch (this["public"].mode) {
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
      switch (this["public"].mode) {
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
      switch (this["public"].mode) {
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
      switch (this["public"].mode) {
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
    key: "groundPoint",
    get: function get() {
      switch (this["public"].mode) {
        case MODE_FLOOR:
          return [this.x + 0, this.y + 1];
          break;

        case MODE_RIGHT:
          return [this.x + 1, this.y + 0];
          break;

        case MODE_CEILING:
          return [this.x + 0, this.y - 1];
          break;

        case MODE_LEFT:
          return [this.x - 1, this.y + 0];
          break;
      }
    }
  }, {
    key: "canRoll",
    get: function get() {
      return false;
    }
  }, {
    key: "canStick",
    get: function get() {
      return false;
    }
  }, {
    key: "canSpindash",
    get: function get() {
      return false;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return false;
    }
  }, {
    key: "isGhost",
    get: function get() {
      return false;
    }
  }, {
    key: "isPushable",
    get: function get() {
      return false;
    }
  }, {
    key: "isVehicle",
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
      return this["public"].x;
    }
  }, {
    key: "y",
    get: function get() {
      return this["public"].y;
    }
  }, {
    key: "point",
    get: function get() {
      return [this["public"].x, this["public"].y];
    }
  }, {
    key: "rotateLock",
    get: function get() {
      return false;
    }
  }, {
    key: "controllable",
    get: function get() {
      return false;
    }
  }, {
    key: "skidding",
    get: function get() {
      return Math.abs(this["public"].gSpeed) && Math.sign(this["public"].gSpeed) !== this["public"].direction;
    }
  }]);

  return PointActor;
}(_View2.View);

exports.PointActor = PointActor;
});

;require.register("actor/PowerupGlow.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PowerupGlow = void 0;

var _PointActor2 = require("./PointActor");

var _Tag = require("curvature/base/Tag");

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

var PowerupGlow = /*#__PURE__*/function (_PointActor) {
  _inherits(PowerupGlow, _PointActor);

  var _super = _createSuper(PowerupGlow);

  function PowerupGlow() {
    var _this;

    _classCallCheck(this, PowerupGlow);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-powerup-glow';
    _this.args.width = 64;
    _this.args.height = 64;
    return _this;
  }

  _createClass(PowerupGlow, [{
    key: "onAttached",
    value: function onAttached() {
      this.icon = new _Tag.Tag('<div class = "powerup-icon">');
      this.halo = new _Tag.Tag('<div class = "powerup-halo">');
      this.tags.sprite.appendChild(this.halo.node);
      this.tags.sprite.appendChild(this.icon.node);
    }
  }, {
    key: "collideA",
    value: function collideA(other) {
      var _this2 = this;

      _get(_getPrototypeOf(PowerupGlow.prototype), "collideA", this).call(this, other);

      if (!other.controllable) {
        return;
      }

      this.onTimeout(125, function () {
        return _this2.tags.sprite.classList.add('closed');
      });
      this.onTimeout(2500, function () {
        return _this2.tags.sprite.classList.remove('closed');
      });
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

  return PowerupGlow;
}(_PointActor2.PointActor);

exports.PowerupGlow = PowerupGlow;
});

;require.register("actor/Projectile.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Projectile = void 0;

var _PointActor2 = require("./PointActor");

var _Explosion = require("../actor/Explosion");

var _Tag = require("curvature/base/Tag");

var _Region = require("../region/Region");

var _Spring = require("./Spring");

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

var Projectile = /*#__PURE__*/function (_PointActor) {
  _inherits(Projectile, _PointActor);

  var _super = _createSuper(Projectile);

  function Projectile() {
    var _this;

    _classCallCheck(this, Projectile);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-projectile';
    _this.args.width = 8;
    _this.args.height = 8;
    _this.args["float"] = -1;
    _this.removeTimer = null;
    return _this;
  }

  _createClass(Projectile, [{
    key: "update",
    value: function update() {
      var _this2 = this;

      if (this.removed) {
        return;
      }

      _get(_getPrototypeOf(Projectile.prototype), "update", this).call(this);

      if (!this.args.xSpeed && !this.args.ySpeed) {
        this.explode();
      }

      if (!this.removeTimer) {
        this.removeTimer = this.onTimeout(500, function () {
          return _this2.explode();
        });
      }
    }
  }, {
    key: "collideA",
    value: function collideA(other) {
      if (other === this.args.owner || other instanceof Projectile || other instanceof _Region.Region || other instanceof _Spring.Spring) {
        return false;
      }

      this.args.x += Math.cos(this["public"].angle) * (other.args.width / 2) * Math.sign(this["public"].xSpeed);
      this.args.y += Math.sin(this["public"].angle) * (other.args.width / 2) * Math.sign(this["public"].xSpeed);
      this.explode();
      return false;
    }
  }, {
    key: "explode",
    value: function explode() {
      var viewport = this.viewport;

      if (!viewport) {
        return;
      }

      var particle = new _Tag.Tag('<div class = "particle-explosion">');
      particle.style({
        '--x': this.x,
        '--y': this.y
      });
      viewport.particles.add(particle);
      setTimeout(function () {
        return viewport.particles.remove(particle);
      }, 350);
      this.viewport.actors.remove(this);
      this.remove();
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

  return Projectile;
}(_PointActor2.PointActor);

exports.Projectile = Projectile;
});

;require.register("actor/QuestionBlock.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuestionBlock = void 0;

var _PointActor2 = require("./PointActor");

var _Monitor = require("./Monitor");

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

    _defineProperty(_assertThisInitialized(_this), "maxBounce", 4);

    _defineProperty(_assertThisInitialized(_this), "template", "<div\n\t\tclass = \"point-actor [[type]] [[collType]]\"\n\t\tstyle = \"\n\t\t\tdisplay:[[display]];\n\t\t\t--angle:[[angle]];\n\t\t\t--airAngle:[[airAngle]];\n\t\t\t--display-angle:[[_angle]];\n\t\t\t--height:[[height]];\n\t\t\t--width:[[width]];\n\t\t\t--x:[[x]];\n\t\t\t--y:[[y]];\n\t\t\"\n\t\tdata-colliding = \"[[colliding]]\"\n\t\tdata-falling   = \"[[falling]]\"\n\t\tdata-facing    = \"[[facing]]\"\n\t\tdata-angle     = \"[[angle|rad2deg]]\"\n\t\tdata-mode      = \"[[mode]]\"\n\t\tdata-empty     = \"[[empty]]\"\n\t><div class = \"sprite\"></div></div>");

    _this.args.type = 'actor-question-block actor-item';
    _this.args.width = 32;
    _this.args.height = 32;
    _this.args["float"] = -1;
    _this.initY = null;
    _this.empty = false;
    return _this;
  }

  _createClass(QuestionBlock, [{
    key: "collideA",
    value: function collideA(other, type) {
      var _this2 = this;

      _get(_getPrototypeOf(QuestionBlock.prototype), "collideA", this).call(this, other);

      if (this.initY === null) {
        this.initY = this.y;
      }

      if (type === 2) {
        var impulse = Math.abs(other.args.ySpeed);
        other.args.falling = true;

        if (other.args.ySpeed > 0) {
          other.args.ySpeed += this.args.ySpeed;
        } else {
          this.args.y -= impulse;
          other.args.y += impulse;
        }

        if (this.args.ySpeed > 0 && this.args.ySpeed > other.args.ySpeed) {
          other.args.ySpeed = Math.abs(other.args.ySpeed);
          other.args.y += this.args.ySpeed;
        }

        if (this.args.ySpeed < 0) {
          this.args.ySpeed = -Math.abs(this.args.ySpeed);
        }

        if (this.args.ySpeed) {
          return true;
        }

        var ySpeedMax = this.maxBounce;
        var speed = type === 2 ? -Math.abs(other.args.ySpeed) : other.args.ySpeed;

        if (Math.abs(speed) > ySpeedMax) {
          speed = ySpeedMax * Math.sign(speed);
        }

        this.args.ySpeed = speed;
        other.args.ySpeed = -other.args.ySpeed;
      }

      if (type === 2 && !this.args.empty) {
        if (!this.args.empty) {
          var monitor = new _Monitor.Monitor({
            x: this.x + 2,
            y: this.y - 128
          });
          this.onNextFrame(function () {
            _this2.viewport.actors.add(monitor);
          });
          monitor.onRemove(function () {
            return _this2.args.empty = false;
          });
          this.args.empty = true;
        }
      }

      return true;
    }
  }, {
    key: "update",
    value: function update() {
      if (this.initY !== null) {
        if (this.initY > this.y) {
          this.args.ySpeed += 0.75;
        } else if (this.initY < this.y) {
          this.args.ySpeed -= 0.75;
        }

        if (Math.abs(this.args.y - this.initY) < 1 && Math.abs(this.args.ySpeed) < 1) {
          this.args.ySpeed = 0;
          this.args.y = this.initY;
        }
      }

      this.args.ySpeed *= 0.9;
      this.args.ySpeed = Math.floor(this.args.ySpeed * 100) / 100;
      this.args.y = Math.round(this.args.y);
      var ySpeedMax = this.maxBounce;

      if (Math.abs(this.args.ySpeed) > ySpeedMax) {
        this.args.ySpeed = ySpeedMax * Math.sign(this.args.ySpeed);
      }

      _get(_getPrototypeOf(QuestionBlock.prototype), "update", this).call(this);
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
    _this.args.width = 32;
    _this.args.height = 32;
    _this.args["float"] = -1;
    _this.args.gone = false;
    return _this;
  }

  _createClass(Ring, [{
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(Ring.prototype), "update", this).call(this);

      if (this.viewport.args.audio && !this.sample) {
        this.sample = new Audio('/Sonic/ring-collect.wav');
        this.sample.volume = 0.15 + Math.random() * -0.05;
      }
    }
  }, {
    key: "collideA",
    value: function collideA(other) {
      var _this2 = this;

      if (this["public"].gone) {
        return;
      }

      _get(_getPrototypeOf(Ring.prototype), "collideA", this).call(this, other);

      if (other.args.owner) {
        other.args.owner.args.rings += 1;
      } else if (other.occupant) {
        other.occupant.args.rings += 1;
      } else {
        other.args.rings += 1;
      }

      if (!other.controllable && !other.occupant && !other.args.owner) {
        return;
      }

      this.args.gone = true;
      this.args.type = 'actor-item actor-ring collected';

      if (this.viewport.args.audio && this.sample) {
        this.sample.play();
      }

      this.onTimeout(60, function () {
        _this2.args.type = 'actor-item actor-ring collected gone';
      });
      var x = this.x;
      var y = this.y;
      var viewport = this.viewport;
      this.onTimeout(3500, function () {
        _this2.args.gone = false;
        _this2.args.type = 'actor-item actor-ring';
      });

      if (other.collect) {
        this.onNextFrame(function () {
          other.collect(_this2);
        });
      } // this.onTimeout(120, () => {
      // 	viewport.actors.remove( this );
      // 	this.remove();
      // });
      // viewport.spawn.add({
      // 	time: Date.now() + 3500
      // 	, frame:  this.viewport.args.frameId + 210
      // 	, object: new Ring({x,y})
      // });
      // this.args.gone = true;

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

;require.register("actor/Rocks.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Rocks = void 0;

var _PointActor2 = require("./PointActor");

var _Projectile = require("../actor/Projectile");

var _Tag = require("curvature/base/Tag");

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

var Rocks = /*#__PURE__*/function (_PointActor) {
  _inherits(Rocks, _PointActor);

  var _super = _createSuper(Rocks);

  function Rocks() {
    var _this;

    _classCallCheck(this, Rocks);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-rocks-tall';
    _this.args.width = 48;
    _this.args.height = 80;
    _this.gone = false;
    return _this;
  }

  _createClass(Rocks, [{
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(Rocks.prototype), "update", this).call(this);

      if (this.viewport && this.viewport.args.audio && !this.sample) {
        this.sample = new Audio('/Sonic/rock-smash.wav');
        this.sample.volume = 0.3 + Math.random() * -0.2;
      }
    }
  }, {
    key: "collideA",
    value: function collideA(other, type) {
      _get(_getPrototypeOf(Rocks.prototype), "collideA", this).call(this, other, type);

      if (other.occupant || other.rolling) {
        this.pop(other);
        return false;
      }

      if (type !== 2 && (!this.args.falling || this.args["float"] === -1) && other.args.ySpeed > 0 && other.y < this.y && this.viewport && !this["public"].gone) {
        this.args.gone = true;

        if (this.args.falling && Math.abs(other.args.ySpeed) > 0) {
          other.args.xSpeed *= -1;
        }

        this.pop(other);
        return false;
      }

      if ((type === 1 || type === 3) && (Math.abs(other.args.xSpeed) > 10 || Math.abs(other.args.gSpeed) > 10 || other instanceof _Projectile.Projectile) && this.viewport && !this["public"].gone) {
        this.pop(other);
        return false;
      }

      return true;
    }
  }, {
    key: "collideB",
    value: function collideB(other) {
      if (this["public"].gone) {
        other.args.ySpeed *= -1;
        other.args.falling = true;
      }
    }
  }, {
    key: "pop",
    value: function pop(other) {
      var viewport = this.viewport;

      if (!viewport) {
        return;
      }

      if (viewport.args.audio && this.sample) {
        this.sample.play();
      }

      var particleA = new _Tag.Tag('<div class = "particle-rock">');
      var particleB = new _Tag.Tag('<div class = "particle-rock">');
      var particleC = new _Tag.Tag('<div class = "particle-rock">');
      var particleD = new _Tag.Tag('<div class = "particle-rock">');
      var particleE = new _Tag.Tag('<div class = "particle-rock">');
      var particleF = new _Tag.Tag('<div class = "particle-rock">');
      var particleG = new _Tag.Tag('<div class = "particle-rock">');
      var particleH = new _Tag.Tag('<div class = "particle-rock">');
      var direction = Math.sign(other.args.gSpeed || other.args.xSpeed);
      var fuzzFactor = 60;
      var fallSpeed = 1250;
      var xForce = 180;
      var yForce = 10;
      particleA.style({
        '--x': this.x,
        '--y': this.y - 10,
        '--fallSpeed': fallSpeed + fuzzFactor * Math.random(),
        '--xMomentum': xForce * direction + fuzzFactor * Math.random(),
        '--yMomentum': yForce,
        'z-index': 0
      });
      particleB.style({
        '--x': this.x + 20,
        '--y': this.y - 10,
        '--fallSpeed': fallSpeed + fuzzFactor * Math.random(),
        '--xMomentum': xForce * direction + fuzzFactor * Math.random(),
        '--yMomentum': yForce,
        'z-index': 0
      });
      particleC.style({
        '--x': this.x,
        '--y': this.y - 20,
        '--fallSpeed': fallSpeed + fuzzFactor * Math.random(),
        '--xMomentum': xForce * direction + fuzzFactor * Math.random(),
        '--yMomentum': yForce,
        'z-index': 0
      });
      particleD.style({
        '--x': this.x + 10,
        '--y': this.y - 20,
        '--fallSpeed': fallSpeed + fuzzFactor * Math.random(),
        '--xMomentum': xForce * direction + fuzzFactor * Math.random(),
        '--yMomentum': yForce,
        'z-index': 0
      });
      particleE.style({
        '--x': this.x,
        '--y': this.y - 30,
        '--fallSpeed': fallSpeed + fuzzFactor * Math.random(),
        '--xMomentum': xForce * direction + fuzzFactor * Math.random(),
        '--yMomentum': yForce,
        'z-index': 0
      });
      particleF.style({
        '--x': this.x + 20,
        '--y': this.y - 30,
        '--fallSpeed': fallSpeed + fuzzFactor * Math.random(),
        '--xMomentum': xForce * direction + fuzzFactor * Math.random(),
        '--yMomentum': yForce,
        'z-index': 0
      });
      particleG.style({
        '--x': this.x,
        '--y': this.y - 40,
        '--fallSpeed': fallSpeed + fuzzFactor * Math.random(),
        '--xMomentum': xForce * direction + fuzzFactor * Math.random(),
        '--yMomentum': yForce,
        'z-index': 0
      });
      particleH.style({
        '--x': this.x + 10,
        '--y': this.y - 40,
        '--fallSpeed': fallSpeed + fuzzFactor * Math.random(),
        '--xMomentum': xForce * direction + fuzzFactor * Math.random(),
        '--yMomentum': 50,
        'z-index': 0
      });
      viewport.particles.add(particleA);
      viewport.particles.add(particleB);
      viewport.particles.add(particleC);
      viewport.particles.add(particleD);
      viewport.particles.add(particleE);
      viewport.particles.add(particleF);
      viewport.particles.add(particleG);
      viewport.particles.add(particleH);
      setTimeout(function () {
        viewport.particles.remove(particleA);
        viewport.particles.remove(particleB);
        viewport.particles.remove(particleC);
        viewport.particles.remove(particleD);
        viewport.particles.remove(particleE);
        viewport.particles.remove(particleF);
        viewport.particles.remove(particleG);
        viewport.particles.remove(particleH);
      }, 512);
      viewport.actors.remove(this);
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

  return Rocks;
}(_PointActor2.PointActor);

exports.Rocks = Rocks;
});

;require.register("actor/Seymour.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Seymour = void 0;

var _PointActor2 = require("./PointActor");

var _Tag = require("curvature/base/Tag");

var _SkidDust = require("../behavior/SkidDust");

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

var Seymour = /*#__PURE__*/function (_PointActor) {
  _inherits(Seymour, _PointActor);

  var _super = _createSuper(Seymour);

  function Seymour() {
    var _this;

    _classCallCheck(this, Seymour);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _this.behaviors.add(new _SkidDust.SkidDust());

    _this.args.type = 'actor-item actor-seymour';
    _this.args.normalHeight = 64;
    _this.args.rollingHeight = 23;
    _this.args.accel = 0.45;
    _this.args.decel = 0.3;
    _this.args.gSpeedMax = 15;
    _this.args.jumpForce = 15;
    _this.args.gravity = 1;
    _this.args.width = 25;
    _this.args.height = 64;
    return _this;
  }

  _createClass(Seymour, [{
    key: "onAttached",
    value: function onAttached() {
      this.box = this.findTag('div');
    }
  }, {
    key: "update",
    value: function update() {
      var falling = this.args.falling;

      if (!this.box) {
        _get(_getPrototypeOf(Seymour.prototype), "update", this).call(this);

        return;
      }

      if (!falling) {
        if (this.yAxis > 0) {
          this.args.crouching = true;
        } else {
          this.args.crouching = false;
        }

        var direction = this.args.direction;
        var gSpeed = this.args.gSpeed;
        var speed = Math.abs(gSpeed);
        var maxSpeed = this.args.gSpeedMax;

        if (this["public"].rolling) {
          this.box.setAttribute('data-animation', 'rolling');
        } else if (Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5) {
          this.box.setAttribute('data-animation', 'standing');
        } else if (speed > maxSpeed * 0.25) {
          this.box.setAttribute('data-animation', 'running');
        } else if (this.args.moving && gSpeed) {
          this.box.setAttribute('data-animation', 'walking');
        } // else if(this.args.crouching || (this.args.standingOn && this.args.standingOn.isVehicle))
        // {
        // 	this.box.setAttribute('data-animation', 'crouching');
        // }
        else {
            this.box.setAttribute('data-animation', 'standing');
          }
      } else {
        this.box.setAttribute('data-animation', 'jumping');
      }

      _get(_getPrototypeOf(Seymour.prototype), "update", this).call(this);
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "canRoll",
    get: function get() {
      return true;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return false;
    }
  }, {
    key: "controllable",
    get: function get() {
      return true;
    }
  }]);

  return Seymour;
}(_PointActor2.PointActor);

exports.Seymour = Seymour;
});

;require.register("actor/Sonic.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sonic = void 0;

var _PointActor2 = require("./PointActor");

var _Tag = require("curvature/base/Tag");

var _View = require("curvature/base/View");

var _Twist = require("../effects/Twist");

var _Pinch = require("../effects/Pinch");

var _Png = require("../sprite/Png");

var _Ring = require("./Ring");

var _FireSheild = require("../powerups/FireSheild");

var _BubbleSheild = require("../powerups/BubbleSheild");

var _ElectricSheild = require("../powerups/ElectricSheild");

var _SkidDust = require("../behavior/SkidDust");

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

var MODE_FLOOR = 0;
var MODE_LEFT = 1;
var MODE_CEILING = 2;
var MODE_RIGHT = 3;

var Sonic = /*#__PURE__*/function (_PointActor) {
  _inherits(Sonic, _PointActor);

  var _super = _createSuper(Sonic);

  function Sonic() {
    var _this;

    _classCallCheck(this, Sonic);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _this.behaviors.add(new _SkidDust.SkidDust());

    _this.args.type = 'actor-sonic actor-item';
    _this.accelNormal = 0.35;
    _this.accelSuper = 0.70;
    _this.args.accel = 0.35;
    _this.args.decel = 0.4;
    _this.gSpeedMaxNormal = 16;
    _this.gSpeedMaxSuper = 28;
    _this.jumpForceNormal = 11;
    _this.jumpForceSuper = 16;
    _this.args.gSpeedMax = _this.gSpeedMaxNormal;
    _this.args.jumpForce = _this.jumpForceNormal;
    _this.args.gravity = 0.5;
    _this.args.width = 28;
    _this.args.normalHeight = 40;
    _this.args.rollingHeight = 23;
    _this.args.height = 40;
    _this.spindashCharge = 0;
    _this.dropDashCharge = 0;
    _this.willStick = false;
    _this.stayStuck = false;
    _this.dashed = false;
    _this.airControlCard = _View.View.from(require('../cards/sonic-air-controls.html'));
    _this.controlCard = _View.View.from(require('../cards/sonic-controls.html'));
    _this.moveCard = _View.View.from(require('../cards/basic-moves.html'));
    _this.args.spriteSheet = _this.spriteSheet = '/Sonic/sonic.png';

    _this.args.bindTo('falling', function (v) {
      if (v) {
        return;
      }

      if (_this["public"].mode === 1 || _this["public"].mode === 3) {
        _this.args.wallSticking = true;
        _this.args.gSpeed = 0;
        _this.args.xSpeed = 0;
        _this.args.ySpeed = 0;
      } else {
        _this.args.wallSticking = false;
      }
    });

    return _this;
  }

  _createClass(Sonic, [{
    key: "onAttached",
    value: function onAttached(event) {
      var _this2 = this;

      if (!Sonic.png) {
        var png = Sonic.png = new _Png.Png(this["public"].spriteSheet);
        png.ready.then(function () {
          var newPng = png.recolor({
            '8080e0': 'e0e080',
            '6060c0': 'e0e000',
            '4040a0': 'e0e001',
            '202080': 'a0a000'
          });
          _this2.superSpriteSheet = newPng.toUrl();
        });
      }
    }
  }, {
    key: "update",
    value: function update() {
      if (this.isSuper) {
        if (this.viewport.args.frameId % 60 === 0) {
          if (this.args.rings > 0) {
            this.args.rings--;
          } else {
            this.isSuper = false;
            this.setProfile();
          }
        }
      }

      if (this["public"].falling) {
        this.args.wallSticking = false;
      } else {
        this.doubleSpin = this.dashed = false;

        if (this["public"].mode % 2 === 0) {
          this.args.wallSticking = false;
        }

        this.willStick = false;
        this.stayStuck = false;
      }

      if (this.lightDashingCoolDown > 0) {
        this.lightDashingCoolDown--;
      }

      if (this.dashTimer > 0) {
        this.dashTimer--;
      }

      var falling = this["public"].falling;

      if (!this.box) {
        _get(_getPrototypeOf(Sonic.prototype), "update", this).call(this);

        return;
      }

      if (this["public"].wallSticking) {
        this.box.setAttribute('data-animation', 'wall-stick');
        var slip = 2;

        if (this.yAxis > 0) {
          slip = 6;
        } else if (this.yAxis < 0) {
          this.stayStuck = true;
          slip = 0;
        }

        if (this["public"].mode === 1) {
          this.args.facing = 'left';
          this.args.direction = 1;

          if (Math.abs(this.args.gSpeed) < slip) {
            this.args.gSpeed += 1;
          } else {
            this.args.gSpeed = slip;
          }
        } else if (this["public"].mode === 3) {
          this.args.facing = 'right';
          this.args.direction = -1;

          if (Math.abs(this.args.gSpeed) < slip) {
            this.args.gSpeed -= 1;
          } else {
            this.args.gSpeed = -slip;
          }
        }
      } else if (this.lightDashing) {
        var direction = Math.sign(this["public"].xSpeed) || Math.sign(this["public"].gSpeed);

        if (direction < 0) {
          this.box.setAttribute('data-animation', 'lightdash-back');
        } else if (direction > 0) {
          this.box.setAttribute('data-animation', 'lightdash');
        }

        if (falling) {
          this.args.direction = Math.sign(this["public"].xSpeed) || this.args.direction;
          this.args.mode = MODE_FLOOR;
        }
      } else if (!falling) {
        var _direction = this["public"].direction;
        var gSpeed = this["public"].gSpeed;
        var speed = Math.abs(gSpeed);
        var maxSpeed = this["public"].gSpeedMax;
        this.args.height = this["public"].normalHeight;

        if (this.spindashCharge) {
          this.box.setAttribute('data-animation', 'spindash');
        } else if (!this["public"].rolling) {
          if (Math.sign(this["public"].gSpeed) !== _direction && Math.abs(this["public"].gSpeed - _direction) > 5) {
            this.box.setAttribute('data-animation', 'skidding'); // const viewport = this.viewport;
            // const dustParticle = new Tag('<div class = "particle-dust">');
            // const dustPoint = this.rotatePoint(this.args.gSpeed, 0);
            // dustParticle.style({
            // 	'--x': dustPoint[0] + this.x
            // 	, '--y': dustPoint[1] + this.y
            // 	, 'z-index': 0
            // 	, opacity: Math.random() * 2
            // });
            // viewport.particles.add(dustParticle);
            // setTimeout(() => {
            // 	viewport.particles.remove(dustParticle);
            // }, 350);
          } else if (speed > maxSpeed / 2) {
            this.box.setAttribute('data-animation', 'running');
          } else if (this["public"].moving && this["public"].gSpeed) {
            this.box.setAttribute('data-animation', 'walking');
          } else {
            this.box.setAttribute('data-animation', 'standing');
          }
        } else {
          this.box.setAttribute('data-animation', 'rolling');
        }

        if (!this.spindashCharge && this.dashDust) {
          this.dashDust.remove();
          this.dashDust = null;
        }
      } else if (!this.dashed) {
        this.args.height = this["public"].rollingHeight;
        this.box.setAttribute('data-animation', 'jumping');
      }

      if (this.skidding && !this["public"].rolling && !this["public"].falling && !this.spindashCharge) {
        this.args.xOff = 8 * -this.args.direction;
        this.args.yOff = 32;
        var warp = -this["public"].gSpeed * 15;

        if (Math.abs(warp) > 120) {
          warp = 120 * Math.sign(warp);
        }

        this.twist(warp);
      } else if (!this.spindashCharge) {
        this.twister && (this.twister.args.scale = 0);
      }

      if (this.pincherBg || this.pincherFg) {
        this.pincherBg.args.scale *= 0.875;
        this.pincherFg.args.scale *= 0.875;

        if (Math.abs(this.pincherBg.args.scale) < 0.001) {
          this.pincherBg.args.scale = 0;
          this.pincherFg.args.scale = 0;
        }
      } else {
        this.pinch(0, 0);
      }

      if (!this.twister) {
        this.twist(0);
      }

      _get(_getPrototypeOf(Sonic.prototype), "update", this).call(this);
    }
  }, {
    key: "readInput",
    value: function readInput() {
      if (!this.dashed) {
        _get(_getPrototypeOf(Sonic.prototype), "readInput", this).call(this);
      }
    }
  }, {
    key: "command_4",
    value: function command_4() {
      if (this["public"].falling) {
        this.airDash(-1);
        this.args.facing = 'left';
      }
    }
  }, {
    key: "command_5",
    value: function command_5() {
      if (this["public"].falling) {
        this.airDash(1);
      }
    }
  }, {
    key: "airDash",
    value: function airDash(direction) {
      if (this.dashed || this["public"].ignore) {
        return;
      }

      var dashSpeed = direction * 12;
      var foreDistance = this.scanForward(dashSpeed, 0.5);

      if (foreDistance === 0) {
        this.dashed = true;
        this.box.setAttribute('data-animation', 'airdash');
        return;
      }

      this.box.setAttribute('data-animation', 'airdash');

      if (Math.sign(this["public"].xSpeed) !== Math.sign(direction)) {
        this.args.xSpeed = 0;
      }

      if (this["public"].ySpeed > 0) {
        this.args.ySpeed = 0;
      }

      this.args.xSpeed += dashSpeed;
      this.dashTimer = 0;
      this.dashed = true;
    }
  }, {
    key: "command_0",
    value: function command_0() {
      this.dropDashCharge = 0;

      if (this["public"].falling && !this.dashed && !this.doubleSpin) {
        this.doubleSpin = true;
        this.args.xOff = 0;
        this.args.yOff = 32;
        this.pinch(-300, 50);
      }

      _get(_getPrototypeOf(Sonic.prototype), "command_0", this).call(this);
    }
  }, {
    key: "hold_0",
    value: function hold_0() {
      if (this.yAxis > 0 && this["public"].jumping) {
        if (this.dropDashCharge < 20) {
          this.dropDashCharge++;
        }

        this.willStick = false;
      } else if (this["public"].jumping || this.dashed) {
        this.dropDashCharge = 0;
        this.willStick = true;
        this.stayStuck = true;
      }
    }
  }, {
    key: "release_1",
    value: function release_1() // spindash
    {
      if (!this.spindashCharge) {
        return;
      }

      var direction = this["public"].direction;
      var dashPower = this.spindashCharge / 40;

      if (dashPower > 1) {
        dashPower = 1;
      }

      this.args.rolling = true;
      var dashBoost = dashPower * 32;

      if (Math.sign(direction) !== Math.sign(dashBoost)) {
        this.args.gSpeed = dashBoost * Math.sign(direction);
      } else {
        this.args.gSpeed += dashBoost * Math.sign(direction);
      }

      this.spindashCharge = 0;

      if (this.dashDust) {
        this.dashDust.remove();
      }
    }
  }, {
    key: "release_0",
    value: function release_0() {
      _get(_getPrototypeOf(Sonic.prototype), "release_0", this).call(this);

      this.willStick = false;
      this.stayStuck = false;

      if (this["public"].wallSticking) {
        this.args.falling = true;
        this.args.ySpeed = 0;
        this.airDash(this["public"].mode === 1 ? 1 : -1);
        this.args.ignore = -2;
      }
    }
  }, {
    key: "hold_1",
    value: function hold_1(button) // spindash
    {
      if (this.args.falling || this.willJump || this["public"].gSpeed) {
        this.spindashCharge = 0;
        return;
      }

      this.args.ignore = 1;
      var dashCharge = this.spindashCharge / 20;

      if (dashCharge > 1) {
        dashCharge = 1;
      }

      if (this.spindashCharge === 0) {
        this.spindashCharge = 1;
        var viewport = this.viewport;
        var dustParticle = new _Tag.Tag('<div class = "particle-spindash-dust">');
        var dustPoint = this.rotatePoint(this.args.gSpeed, 0);
        dustParticle.style({
          '--x': dustPoint[0] + this.x,
          '--y': dustPoint[1] + this.y,
          '--direction': this["public"].direction,
          '--dashCharge': 0
        });

        if (this["public"].direction < 0) {
          dustParticle.setAttribute('data-facing', 'left');
        } else if (this["public"].direction > 0) {
          dustParticle.setAttribute('data-facing', 'right');
        }

        viewport.particles.add(dustParticle.node);
        this.dashDust = dustParticle;
      } else if (this.dashDust) {
        this.dashDust.style({
          '--dashCharge': dashCharge
        });
      }

      if (this.viewport.args.frameId % 3 === 0) {
        this.spindashCharge++;
      }

      this.args.xOff = 5 * -this.args.direction;
      this.args.yOff = 32;
      this.twist(120 * dashCharge * this["public"].direction);
      this.box.setAttribute('data-animation', 'spindash');

      if (this["public"].direction < 0) {
        this.args.facing = 'left';
      } else if (this["public"].direction > 0) {
        this.args.facing = 'right';
      }
    }
  }, {
    key: "hold_2",
    value: function hold_2() {
      // if(!this.public.falling)
      // {
      // 	return;
      // }
      if (this.lightDashing) {
        return;
      }

      if (this.lightDashingCoolDown > 0) {
        return;
      }

      var ring = this.findDashableRing(64);

      if (ring) {
        this.lightDash(ring); // this.lightDashingCoolDown = 9;
      }
    }
  }, {
    key: "command_3",
    value: function command_3() {
      var _this3 = this;

      this.isSuper = !this.isSuper;
      this.onTimeout(150, function () {
        if (_this3.args.rings === 0) {
          _this3.isSuper = false;

          _this3.setProfile();
        }

        ;
      });
      this.setProfile();
    }
  }, {
    key: "setProfile",
    value: function setProfile() {
      if (this.isSuper) {
        this.args.spriteSheet = this.superSpriteSheet;
        this.args.gSpeedMax = this.gSpeedMaxSuper;
        this.args.jumpForce = this.jumpForceSuper;
        this.args.accel = this.accelSuper;
      } else {
        this.args.spriteSheet = this.spriteSheet;
        this.args.gSpeedMax = this.gSpeedMaxNormal;
        this.args.jumpForce = this.jumpForceNormal;
        this.args.accel = this.accelNormal;
      }
    }
  }, {
    key: "findNearestRing",
    value: function findNearestRing() {
      return this.findDashableRing();
    }
  }, {
    key: "findDashableRing",
    value: function findDashableRing() {
      var _this4 = this;

      var maxDist = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 128;

      var findRing = function findRing(actor) {
        if (!(actor instanceof _Ring.Ring)) {
          return false;
        }

        var direction = Math.sign(_this4["public"].xSpeed);

        if (direction > 0 && actor.x < _this4.x) {
          return false;
        }

        if (direction < 0 && actor.x > _this4.x) {
          return false;
        }

        return true;
      };

      var ring = this.findNearestActor(findRing, maxDist);

      if (!ring) {
        return;
      }

      var nextRing = ring.findNearestActor(findRing, maxDist);

      if (!nextRing) {
        return;
      }

      var firstAngle = Math.atan2(this.y - ring.y, this.x - ring.x);
      var secondAngle = Math.atan2(ring.y - nextRing.y, ring.x - nextRing.x);

      if (Math.abs(firstAngle - secondAngle) > Math.PI / 2) {
        return;
      }

      return ring;
    }
  }, {
    key: "readInput",
    value: function readInput() {
      if (!this.lightDashing) {
        _get(_getPrototypeOf(Sonic.prototype), "readInput", this).call(this);
      }
    }
  }, {
    key: "lightDash",
    value: function lightDash(ring) {
      var currentAngle;
      this.spindashCharge = 0;
      var angle = Math.atan2(ring.y - this.y, ring.x - this.x);

      if (this["public"].falling) {
        currentAngle = this["public"].airAngle;
      } // else
      // {
      // 	currentAngle = this.public.groundAngle;
      // 	switch(this.public.mode)
      // 	{
      // 		case MODE_FLOOR:
      // 			currentAngle = currentAngle;
      // 			break;
      // 		case MODE_LEFT:
      // 			currentAngle = -(currentAngle - (Math.PI / 2));
      // 			break;
      // 		case MODE_CEILING:
      // 			currentAngle = -(currentAngle - (Math.PI));
      // 			break;
      // 		case MODE_RIGHT:
      // 			currentAngle = (currentAngle + (Math.PI / 2));
      // 			break;
      // 	}
      // 	if(this.public.direction < 0)
      // 	{
      // 		currentAngle += Math.PI;
      // 	}
      // 	if(currentAngle > Math.PI)
      // 	{
      // 		currentAngle -= Math.PI * 2;
      // 	}
      // }


      var angleDiff = Math.abs(currentAngle - angle);

      if (!this.lightDashing) {
        if (angleDiff >= Math.PI / 2) {
          return;
        }
      }

      var dashSpeed = this.distanceFrom(ring) * (Math.PI / 2 / angleDiff);
      var maxDash = 55;

      if (dashSpeed > maxDash) {
        dashSpeed = maxDash;
      }

      var space = this.scanForward(dashSpeed, 0.5, false);

      if (space && dashSpeed > space) {
        dashSpeed = space / 2;
      }

      this.args.ignore = 4;
      this.args["float"] = -1;
      var direction = Math.sign(this.args.xSpeed) || Math.sign(this.args.gSpeed);

      if (this["public"].direction < 0) {
        this.box.setAttribute('data-animation', 'lightdash-back');
      } else if (this["public"].direction > 0) {
        this.box.setAttribute('data-animation', 'lightdash');
      }

      var breakGroundAngle = Math.PI / 8 * 2;
      this.args.airAngle = angle;
      this.lightDashing = true;

      if (this["public"].falling || angleDiff > breakGroundAngle) {
        this.args.gSpeed = 0;
        this.args.xSpeed = Math.round(dashSpeed * Math.cos(angle));
        this.args.ySpeed = Math.round(dashSpeed * Math.sin(angle));
      } // else
      // {
      // 	this.args.gSpeed = Math.round(dashSpeed * (Math.sign(this.public.gSpeed) || this.public.direction));
      // 	this.args.rolling = false;
      // }


      this.lightDashTimeout();
    }
  }, {
    key: "collect",
    value: function collect(pickup) {
      if (pickup instanceof _Ring.Ring) {
        if (this.lightDashing) {
          var ring = this.findNearestActor(function (actor) {
            return actor instanceof _Ring.Ring;
          }, 128);

          if (ring) {
            // this.args.x = pickup.x;
            // this.args.y = pickup.y;
            this.lightDash(ring);
          } else {
            this.lightDashing = false;
            this.args["float"] = 0;
          }
        }
      }
    }
  }, {
    key: "lightDashTimeout",
    value: function lightDashTimeout() {
      var _this5 = this;

      if (this.clearLightDash) {
        this.clearTimeout(this.clearLightDash);
        this.clearLightDash = false;
      }

      this.clearLightDash = this.onTimeout(150, function () {
        _this5.clearLightDash = false;
        _this5.lightDashing = false;
        _this5.args["float"] = 0;
      });
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "canRoll",
    get: function get() {
      return true;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return false;
    }
  }, {
    key: "controllable",
    get: function get() {
      return true;
    }
  }]);

  return Sonic;
}(_PointActor2.PointActor);

exports.Sonic = Sonic;
});

;require.register("actor/Spring.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Spring = void 0;

var _PointActor2 = require("./PointActor");

var _Region = require("../region/Region");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Spring = /*#__PURE__*/function (_PointActor) {
  _inherits(Spring, _PointActor);

  var _super = _createSuper(Spring);

  _createClass(Spring, null, [{
    key: "fromDef",
    value: function fromDef(objDef) {
      var obj = _get(_getPrototypeOf(Spring), "fromDef", this).call(this, objDef);

      obj.args.angle = Number(obj.args.angle);
      return obj;
    }
  }]);

  function Spring() {
    var _this;

    _classCallCheck(this, Spring);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", "<div\n\t\tclass = \"point-actor actor-item [[type]] [[collType]]\"\n\t\tstyle = \"\n\t\t\tdisplay:[[display]];\n\t\t\t--angle:[[angle]];\n\t\t\t--airAngle:[[airAngle]];\n\t\t\t--ground-angle:[[groundAngle]];\n\t\t\t--height:[[height]];\n\t\t\t--width:[[width]];\n\t\t\t--x:[[x]];\n\t\t\t--y:[[y]];\n\t\t\"\n\t\tdata-colliding = \"[[colliding]]\"\n\t\tdata-falling   = \"[[falling]]\"\n\t\tdata-facing    = \"[[facing]]\"\n\t\tdata-angle     = \"[[angle|rad2deg]]\"\n\t\tdata-mode      = \"[[mode]]\"\n\t>\n\t\t<div\n\t\t\tdata-color = \"[[color]]\"\n\t\t\tdata-type  = \"[[base]]\"\n\t\t\tclass      = \"spring-pad\"\n\t\t\tstyle = \"--color:[[color]]deg\"\n\t\t></div>\n\t\t<div class = \"sprite\"></div>\n\t</div>");

    _this.args.type = 'actor-item actor-spring';
    _this.args.width = _this.args.width || 32;
    _this.args.height = _this.args.height || 32;
    _this.args.color = _this.args.color || 0;
    _this.args["float"] = -1;
    return _this;
  }

  _createClass(Spring, [{
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(Spring.prototype), "update", this).call(this);

      if (this.viewport && this.viewport.args.audio && !this.sample) {
        this.sample = new Audio('/Sonic/spring-activated.wav');
        this.sample.volume = 0.25 + Math.random() * 0.1;
      }
    }
  }, {
    key: "collideA",
    value: function collideA(other) {
      var _this2 = this;

      _get(_getPrototypeOf(Spring.prototype), "collideA", this).call(this, other);

      if (this.active) {
        return;
      }

      if (other instanceof _Region.Region) {
        return;
      }

      if (this.viewport.args.audio && this.sample) {
        this.sample.currentTime = 0;
        this.sample.volume = 0.2 + Math.random() / 4;
        this.sample.play();
      }

      var rounded = this.roundAngle(this.args.angle, 8, true);
      other.impulse(this.args.power, rounded, ![0, Math.PI].includes(this.args.angle));
      other.args.direction = Math.sign(this["public"].gSpeed);
      this.onTimeout(64, function () {
        _this2.active = false;
      });
      this.active = true;
      other.args.ignore = 5;
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

  return Spring;
}(_PointActor2.PointActor);

exports.Spring = Spring;
});

;require.register("actor/StarPost.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StarPost = void 0;

var _PointActor2 = require("./PointActor");

var _Tag = require("curvature/base/Tag");

var _Projectile = require("../actor/Projectile");

var _Monitor = require("./Monitor");

var _RingMonitor = require("./monitor/RingMonitor");

var _SheildFireMonitor = require("./monitor/SheildFireMonitor");

var _SheildWaterMonitor = require("./monitor/SheildWaterMonitor");

var _SheildElectricMonitor = require("./monitor/SheildElectricMonitor");

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

var StarPost = /*#__PURE__*/function (_PointActor) {
  _inherits(StarPost, _PointActor);

  var _super = _createSuper(StarPost);

  function StarPost() {
    var _this;

    _classCallCheck(this, StarPost);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-star-post';
    _this.args.width = 16;
    _this.args.height = 48;
    _this.args.active = false;
    _this.spinning = false;
    return _this;
  }

  _createClass(StarPost, [{
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(StarPost.prototype), "update", this).call(this);

      if (this.viewport && this.viewport.args.audio && !this.sample) {
        this.sample = new Audio('/Sonic/starpost-active.wav');
        this.sample.volume = 0.5 + Math.random() * 0.025;
      }
    }
  }, {
    key: "onRendered",
    value: function onRendered() {
      this.sprite = this.findTag('div.sprite');
      this.box = this.findTag('div');
      this.headBox = new _Tag.Tag('<div class = "star-post-head-box">');
      this.head = new _Tag.Tag('<div class = "star-post-head">');
      this.headBox.appendChild(this.head.node);
      this.box.appendChild(this.headBox.node);
    }
  }, {
    key: "collideA",
    value: function collideA(other) {
      var _this2 = this;

      _get(_getPrototypeOf(StarPost.prototype), "collideA", this).call(this, other);

      if (!other.controllable && !other.args.owner && !other.occupant) {
        return;
      }

      if (!this.box) {
        return;
      }

      if (!this.args.active) {
        this.box.setAttribute('data-direction', other.args.direction);
        this.box.setAttribute('data-active', 'true');
        this.box.setAttribute('data-spin', 'true');
        this.viewport.args.audio && this.sample && this.sample.play();
        var throwSpeed = (other.args.gSpeed || other.args.xSpeed) / 2;

        if (Math.abs(throwSpeed) > 5) {
          throwSpeed = 5 * Math.sign(throwSpeed);
        }

        var monitorClasses = [_RingMonitor.RingMonitor, _SheildFireMonitor.SheildFireMonitor, _SheildWaterMonitor.SheildWaterMonitor, _SheildElectricMonitor.SheildElectricMonitor];
        var monitorClass = monitorClasses[Math.floor(Math.random() * monitorClasses.length)];
        var monitor = new monitorClass({
          direction: other.args.direction,
          xSpeed: throwSpeed,
          ySpeed: -5,
          x: this.x - 10,
          y: this.y - 48
        });
        this.viewport.spawn.add({
          object: monitor
        });
        this.args.active = true;
        this.onTimeout(3000, function () {
          _this2.box.setAttribute('data-active', 'false');

          _this2.args.active = false;
        });
        this.spinning = true;
        this.onTimeout(600, function () {
          return _this2.spinning = false;
        });
      } else if (other instanceof _Projectile.Projectile && !this.spinning) {
        this.box.setAttribute('data-direction', other.args.direction);
        this.box.setAttribute('data-spin', 'false');

        if (this.viewport.args.audio && this.sample) {
          this.sample.currentTime = 0;
          this.sample.play();
        }

        this.onTimeout(0, function () {
          return _this2.box.setAttribute('data-spin', 'true');
        });
        this.spinning = true;
        this.onTimeout(600, function () {
          return _this2.spinning = false;
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

  return StarPost;
}(_PointActor2.PointActor);

exports.StarPost = StarPost;
});

;require.register("actor/SuperRing.js", function(exports, require, module) {
// import { PointActor } from './PointActor';
// const THREE         = require('three')
// const ColladaLoader = require('three-collada-loader');
// export class SuperRing extends PointActor
// {
// 	constructor(...args)
// 	{
// 		super(...args);
// 		this.args.type = 'actor-super-ring actor-item';
// 		this.args.width  = 64;
// 		this.args.height = 64;
// 		this.args.float  = -1;
// 		this.args.gone   = false;
// 		this.args.xRot = 0;
// 		this.args.yRot = 0;
// 		this.args.zRot = 0;
// 		this.args.speed = 4;
// 		this.leaving = new WeakSet;
// 		this.args.xOff = 0;
// 		this.args.yOff = 0;
// 	}
// 	onAttached()
// 	{
// 		this.initRenderer();
// 		this.pinch(0);
// 	}
// 	initRenderer()
// 	{
// 		this.cameraRear = new THREE.PerspectiveCamera(12.5, undefined, 10, 100);
// 		this.cameraFore = new THREE.PerspectiveCamera(12.5, undefined, 1, 10.1);
// 		const modelUrl   = '/models/ring.dae';
// 		const specular   = 0xBBBBBB;
// 		const color      = 0xBBBB00;
// 		const outline    = 0x000000;
// 		// const finalX     = qTurn / 8 * 7;
// 		const emissive   = 0x999900;
// 		const lineColor  = 0x0000AA;
// 		const colladaLoader = new ColladaLoader;
// 		colladaLoader.load(modelUrl, response => {
// 			const geometry = response.dae.geometries['root-mesh'].mesh.geometry3js;
// 			this.cameraRear.position.z = 10;
// 			this.cameraRear.position.x = 0;
// 			this.cameraRear.position.y = 0;
// 			this.cameraFore.position.z = 10;
// 			this.cameraFore.position.x = 0;
// 			this.cameraFore.position.y = 0;
// 			this.scene = new THREE.Scene();
// 			const edgeGeometry = new THREE.EdgesGeometry(geometry);
// 			const goldMaterial = new THREE.MeshPhongMaterial({
// 				side:          THREE.FrontSide
// 				, transparent: true
// 				, skinning:    true
// 				, emissive
// 				, specular
// 				, color
// 			});
// 			const blackMaterial = new THREE.MeshBasicMaterial({
// 				color: outline
// 				, side: THREE.BackSide
// 			});
// 			this.mainMesh = new THREE.Mesh(geometry, goldMaterial);
// 			this.outlineMesh = new THREE.Mesh(geometry, blackMaterial);
// 			this.inlineMesh = new THREE.Mesh(geometry, blackMaterial);
// 			this.outlineMesh.scale.multiplyScalar(1.075);
// 			this.inlineMesh.scale.multiplyScalar(0.925);
// 			this.wireMaterial = new THREE.LineBasicMaterial({
// 				depthTest:   true
// 				, linewidth:   1.25
// 				, color:       lineColor
// 				, transparent: true
// 				, opacity:     0.125
// 			} );
// 			this.wireframe = new THREE.LineSegments(edgeGeometry, this.wireMaterial);
// 			const light = new THREE.DirectionalLight(0xFFFFFF, 0.333);
// 			light.position.set(1, 1.75, 0).normalize();
// 			light.target = this.wireframe;
// 			const light2 = new THREE.DirectionalLight(0xFFFFFF);
// 			light2.position.set(0.75, -1, 0).normalize();
// 			light.target = this.wireframe;
// 			this.scene.add(this.mainMesh);
// 			this.scene.add(this.outlineMesh);
// 			this.scene.add(this.inlineMesh);
// 		 	this.scene.add(this.wireframe);
// 			this.scene.add(light);
// 			this.rendererRear = new THREE.WebGLRenderer({
// 				antialias: true
// 				, alpha:   true
// 			});
// 			this.rendererFore = new THREE.WebGLRenderer({
// 				antialias: true
// 				, alpha:   true
// 			});
// 			this.resizeRenderer();
// 			const parent = this.tags.sprite.node.parentNode;
// 			parent.appendChild(this.rendererRear.domElement);
// 			parent.appendChild(this.rendererFore.domElement);
// 			this.rendererRear.render(this.scene, this.cameraRear);
// 			this.rendererFore.render(this.scene, this.cameraFore);
// 		});
// 	}
// 	resizeRenderer()
// 	{
// 		const parent    = this.tags.sprite.node;
// 		const width     = this.args.width;  //parent.clientWidth  || parent.offsetWidth || width || 0;
// 		const height    = this.args.height; //parent.clientHeight || parent.offsetHeight || height || 0;
// 		const longAxis  = width > height ? width : height;
// 		const shortAxis = width < height ? width : height;
// 		this.cameraRear.aspect = 1;
// 		this.cameraFore.aspect = 1;
// 		this.rendererRear.setSize(shortAxis,  shortAxis);
// 		this.rendererFore.setSize(shortAxis,  shortAxis);
// 		// parent.style.setProperty('--long-axis', longAxis + 'px');
// 		// parent.style.setProperty('--short-axis', shortAxis + 'px');
// 		this.wireMaterial.linewidth = shortAxis / 750;
// 	}
// 	update()
// 	{
// 		super.update();
// 		if(!this.wireframe)
// 		{
// 			return;
// 		}
// 		if(this.caught)
// 		{
// 			this.wireframe.material.opacity = 0.125;
// 			const caught = this.caught;
// 			caught.args.xSpeed = 0;
// 			caught.args.ySpeed = 0;
// 			if(this.caught.yAxis > 0)
// 			{
// 				this.drop();
// 			}
// 			else if(this.caught.yAxis < 0)
// 			{
// 				this.wireframe.material.opacity = 0.25;
// 				this.args.speed++;
// 				caught.args.x = this.public.x;
// 				caught.args.y = this.public.y - 16;
// 			}
// 			else
// 			{
// 				const toX = this.public.x;
// 				const toY = this.public.y - 16;
// 				const speed = 12;
// 				if(caught.public.x !== toX)
// 				{
// 					caught.args.x += Math.sign(toX - caught.public.x) * this.args.speed;
// 				}
// 				if(caught.public.y !== toY)
// 				{
// 					caught.args.y += Math.sign(toY - caught.public.y) * this.args.speed;
// 				}
// 				if(Math.abs(caught.public.x - toX) < speed)
// 				{
// 					caught.args.x = toX;
// 				}
// 				if(Math.abs(caught.public.y - toY) < speed)
// 				{
// 					caught.args.y = toY;
// 				}
// 			}
// 			if(this.args.speed < 5)
// 			{
// 				this.args.speed += 0.25;
// 			}
// 			if(this.args.speed > 5)
// 			{
// 				this.args.speed -= 0.5;
// 			}
// 		}
// 		else
// 		{
// 			this.wireframe.material.opacity = 0.1;
// 			if(this.args.speed > 4)
// 			{
// 				this.args.speed -= 0.125;
// 			}
// 		}
// 		const yRot = (this.args.yRot / 60) % (Math.PI * 2);
// 		if(yRot > (Math.PI / 2 - 0.125) && yRot < (Math.PI / 2 + 0.125))
// 		{
// 			if(this.args.speed > 20)
// 			{
// 				this.onTimeout(500, ()=>this.drop());
// 			}
// 		}
// 		// this.wireframe.rotation.x
// 		//	= this.mainMesh.rotation.x
// 		//	= this.outlineMesh.rotation.x
// 		//	= this.inlineMesh.rotation.x
// 		//	= this.args.xRot / 200;
// 		this.wireframe.rotation.y
// 			= this.mainMesh.rotation.y
// 			= this.outlineMesh.rotation.y
// 			= this.inlineMesh.rotation.y
// 			= yRot;
// 		this.wireframe.rotation.z
// 			= this.mainMesh.rotation.z
// 			= this.outlineMesh.rotation.z
// 			= this.inlineMesh.rotation.z
// 			= this.args.zRot / 60;
// 		this.args.yRot += this.args.speed;
// 		// this.args.xRot++;
// 		this.args.zRot++;
// 		this.onTimeout(0, () => {
// 			this.rendererRear.render(this.scene, this.cameraRear);
// 			this.rendererFore.render(this.scene, this.cameraFore);
// 		});
// 	}
// 	collideA(other)
// 	{
// 		super.collideA(other);
// 		if(!other.controllable || other.public.flying)
// 		{
// 			if(this.leaving.delete(other))
// 			{
// 				return;
// 			}
// 			return;
// 		}
// 		if(this.leaving.has(other))
// 		{
// 			return;
// 		}
// 		if(this.caught)
// 		{
// 			this.caught.args.xSpeed = (Math.sign(other.public.xSpeed) * 3) || 3;
// 			this.leaving.add(this.caught);
// 		}
// 		if(this.caught !== other)
// 		{
// 			this.drop();
// 			if(this.leaving.has(other))
// 			{
// 				return;
// 			}
// 			this.onTimeout(500, () => {
// 				if(this.leaving.has(other))
// 				{
// 					return;
// 				}
// 				this.caught = other
// 			});
// 			this.grab();
// 		}
// 		other.args.xSpeed = 0;
// 		other.args.ySpeed = 0;
// 		other.args.float  = -1;
// 	}
// 	drop()
// 	{
// 		if(this.caught)
// 		{
// 			const caught = this.caught;
// 			this.pinchFilterBg.classList.add('grabbing-start');
// 			this.pinch(-50, 15);
// 			this.leaving.add(caught);
// 			if(this.startGrab)
// 			{
// 				clearTimeout(this.startDrop);
// 				this.startDrop = false;
// 			}
// 			this.startDrop = this.onTimeout(150, () => {
// 				this.pinchFilterBg.classList.add('grabbing');
// 				caught.args.float = 0;
// 				caught.args.ySpeed = 10;
// 				if(this.dropDone)
// 				{
// 					clearTimeout(this.dropDone);
// 					this.dropDone = false;
// 				}
// 				this.dropDone = this.onTimeout(650, () => {
// 					this.pinchFilterBg.classList.remove('grabbing-start');
// 					this.pinchFilterBg.classList.remove('grabbing');
// 					this.pinch(0, 0);
// 				});
// 				this.caught = null;
// 			});
// 			this.onTimeout(1500, () => {
// 				this.leaving.delete(caught);
// 			});
// 		}
// 	}
// 	grab()
// 	{
// 		if(this.pinchFilterFg)
// 		{
// 			this.pinchFilterFg.classList.add('grabbing-start');
// 			this.onTimeout(150, () => {
// 				this.pinchFilterFg.classList.add('grabbing');
// 				this.pinch(0, 100);
// 				this.onTimeout(650, () => {
// 					this.pinch(0, 0);
// 					this.pinchFilterFg.classList.remove('grabbing-start');
// 					this.pinchFilterFg.classList.remove('grabbing');
// 				});
// 			});
// 		}
// 	}
// }
"use strict";
});

;require.register("actor/Switch.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Switch = void 0;

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

var Switch = /*#__PURE__*/function (_PointActor) {
  _inherits(Switch, _PointActor);

  var _super = _createSuper(Switch);

  function Switch() {
    var _this;

    _classCallCheck(this, Switch);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-switch';
    _this.args.width = 32;
    _this.args.height = 10; // this.args.float  = -1;

    _this.removeTimer = null;
    _this.args.active = false;
    _this.activator = null;

    _this.args.bindTo('active', function (v) {
      _this.box && _this.box.setAttribute('data-active', v ? 'true' : 'false');
    });

    _this.ignore = 0;
    return _this;
  }

  _createClass(Switch, [{
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(Switch.prototype), "update", this).call(this);

      if (this.ignore > 0) {
        this.ignore--;
        return;
      }

      if (!this.activator || this.activator.args.standingOn !== this) {
        this.args.active = false;
        this.activator = null;
      }
    }
  }, {
    key: "onAttached",
    value: function onAttached() {
      this.box = this.findTag('div');
      this.sample = new Audio('/Sonic/switch-activated.wav');
    }
  }, {
    key: "collideA",
    value: function collideA(other, type) {
      var _this2 = this;

      if (other["public"].ySpeed < 0) {
        if (other["public"].ySpeed === 0 && other.y > this.y) {
          return true;
        }

        return false;
      }

      if (this["public"].active && other.y < this.y) {
        return true;
      }

      other.onRemove(function () {
        if (_this2.activator === other) {
          _this2.activator = null;
        }
      });

      if (other.isVehicle) {
        if (!this["public"].active) {
          this.activate();
        }

        this.activator = other;
        this.ignore = 16;
        var top = this.y - this["public"].height;

        if (other.y > top && !other["public"].falling) {
          other.args.y = top;
        }

        if (type === 1 || type === 3) {
          return false;
        }

        if (type === 0 || other["public"].ySpeed < 0) {
          return false;
        }

        return true;
      }

      if (other.y < this.y) {
        if (!this["public"].active) {
          this.activate();
        }

        this.ignore = 8;
        this.args.active = true;
        this.activator = other;
        return true;
      }

      return false;
    }
  }, {
    key: "activate",
    value: function activate() {
      this.beep();

      if (this.args.destroyLayer) {
        var layerId = this.args.destroyLayer;
        var layer = this.viewport.args.layers[layerId];
        layer.args.destroyed = true;
      }

      this.args.active = true;
    }
  }, {
    key: "beep",
    value: function beep() {
      if (this.viewport.args.audio && this.sample) {
        this.sample.play();
      }
    }
  }, {
    key: "solid",
    get: function get() {
      return this["public"].active;
    }
  }]);

  return Switch;
}(_PointActor2.PointActor);

exports.Switch = Switch;
});

;require.register("actor/Tails.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tails = void 0;

var _PointActor2 = require("./PointActor");

var _Tag = require("curvature/base/Tag");

var _SkidDust = require("../behavior/SkidDust");

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

var Tails = /*#__PURE__*/function (_PointActor) {
  _inherits(Tails, _PointActor);

  var _super = _createSuper(Tails);

  function Tails() {
    var _this;

    _classCallCheck(this, Tails);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _this.behaviors.add(new _SkidDust.SkidDust());

    _this.args.type = 'actor-item actor-tails';
    _this.args.accel = 0.35;
    _this.args.decel = 0.4;
    _this.args.flySpeedMax = 25;
    _this.args.gSpeedMax = 16;
    _this.args.jumpForce = 11;
    _this.args.gravity = 0.5;
    _this.args.width = 28;
    _this.args.height = 32;
    _this.args.normalHeight = 32;
    _this.args.rollingHeight = 23;
    _this.willStick = false;
    _this.stayStuck = false;
    return _this;
  }

  _createClass(Tails, [{
    key: "onAttached",
    value: function onAttached() {
      this.box = this.findTag('div');
      this.sprite = this.findTag('div.sprite');
      this.tails = new _Tag.Tag('<div class = "tails-tails">');
      this.sprite.appendChild(this.tails.node);
      this.flyingSound = new Audio('/Sonic/tails-flying.wav');
      this.flyingSound.volume = 0.35 + Math.random() * -0.3;
      this.flyingSound.loop = true;
    }
  }, {
    key: "update",
    value: function update() {
      var falling = this.args.falling;

      if (this.viewport.args.audio && this.flyingSound) {
        if (!this.flyingSound.paused) {
          this.flyingSound.volume = 0.35 + Math.random() * -0.3;
        }

        if (this.flyingSound.currentTime > 0.2) {
          this.flyingSound.currentTime = 0.0;
        }
      }

      if (!this.box) {
        _get(_getPrototypeOf(Tails.prototype), "update", this).call(this);

        return;
      }

      if (this["public"].tailFlyCoolDown > 0) {
        this.args.tailFlyCoolDown--;
      }

      if (this["public"].tailFlyCoolDown < 0) {
        this.args.tailFlyCoolDown++;
      }

      if (this.args.tailFlyCoolDown === 0) {
        this.flyingSound.pause();
        this.args.flying = false;
      }

      if (!falling) {
        this.args.tailFlyCoolDown = 0;
        this.flyingSound.pause();
        var direction = this.args.direction;
        var gSpeed = this.args.gSpeed;
        var speed = Math.abs(gSpeed);
        var maxSpeed = this.args.gSpeedMax;

        if (!this["public"].rolling) {
          if (Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5) {
            this.box.setAttribute('data-animation', 'skidding');
          } else if (speed > maxSpeed / 2) {
            this.box.setAttribute('data-animation', 'running');
          } else if (this.args.moving && this.args.gSpeed) {
            this.box.setAttribute('data-animation', 'walking');
          } else {
            this.box.setAttribute('data-animation', 'standing');
          }
        } else {
          this.box.setAttribute('data-animation', 'rolling');
        }
      } else if (this.args.flying) {
        if (this.yAxis > 0) {
          this.box.setAttribute('data-animation', 'jumping');
          this.args.ySpeed = this.args.jumpForce;
        } else {
          this.box.setAttribute('data-animation', 'flying');
        }
      } else if (this.args.falling) {
        this.flyingSound.pause();
        this.box.setAttribute('data-animation', 'jumping');
      }

      _get(_getPrototypeOf(Tails.prototype), "update", this).call(this);
    }
  }, {
    key: "command_0",
    value: function command_0(button) {
      _get(_getPrototypeOf(Tails.prototype), "command_0", this).call(this, button);

      if (!this["public"].falling) {
        this.args.tailFlyCoolDown = -80;
        return;
      }

      if (this.args.tailFlyCoolDown === 0) {
        this.args.tailFlyCoolDown = 80;
        return;
      }

      if (this["public"].ySpeed > 0) {
        this.args.ySpeed = 0;
      }

      this.args.tailFlyCoolDown = 80;
      this.args.flying = true;
      this.flyingSound.volume = 0.35 + Math.random() * -0.3;

      if (this.viewport.args.audio && this.flyingSound.paused) {
        this.flyingSound.play();
      }
    }
  }, {
    key: "hold_0",
    value: function hold_0(button) {
      if (this["public"].flying) {
        if (this.args.ySpeed > 0) {
          this.args.ySpeed = 0;
        }

        if (Math.random() > 0.8) {
          this.flyingSound.volume = 0.35 + Math.random() * -0.3;
        }

        this.args.tailFlyCoolDown = 80;
        this.args.ySpeed -= Math.min(3, button.time / 9);
        this.args.ySpeed = Math.max(-5, this.args.ySpeed);
      } else {
        this.args.flying = true;
      }
    }
  }, {
    key: "sleep",
    value: function sleep() {
      this.flyingSound && this.flyingSound.pause();
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "canRoll",
    get: function get() {
      return true;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return false;
    }
  }, {
    key: "controllable",
    get: function get() {
      return true;
    }
  }]);

  return Tails;
}(_PointActor2.PointActor);

exports.Tails = Tails;
});

;require.register("actor/TextActor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextActor = void 0;

var _PointActor2 = require("./PointActor");

var _CharacterString = require("../ui/CharacterString");

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

var TextActor = /*#__PURE__*/function (_PointActor) {
  _inherits(TextActor, _PointActor);

  var _super = _createSuper(TextActor);

  function TextActor(args, parent) {
    var _this;

    _classCallCheck(this, TextActor);

    _this = _super.call(this, args, parent);
    _this.args.type = 'actor-item actor-text-actor';
    _this.args["float"] = -1;
    _this.text = new _CharacterString.CharacterString({
      value: ''
    });

    _this.args.bindTo('content', function (v) {
      return _this.text.args.value = v;
    });

    return _this;
  }

  _createClass(TextActor, [{
    key: "onAttached",
    value: function onAttached() {
      this.sprite = this.findTag('div.sprite');
      this.text.render(this.sprite);
    }
  }, {
    key: "solid",
    get: function get() {
      return false;
    }
  }]);

  return TextActor;
}(_PointActor2.PointActor);

exports.TextActor = TextActor;
});

;require.register("actor/Tornado.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tornado = void 0;

var _Vehicle2 = require("./Vehicle");

var _Tag = require("curvature/base/Tag");

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

var Tornado = /*#__PURE__*/function (_Vehicle) {
  _inherits(Tornado, _Vehicle);

  var _super = _createSuper(Tornado);

  function Tornado() {
    var _this;

    _classCallCheck(this, Tornado);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-tornado';
    _this.args.width = 96;
    _this.args.height = 48;
    _this.removeTimer = null;
    _this.args.xSpeedMaxThrusting = 64;
    _this.args.xSpeedMaxOriginal = 32;
    _this.args.xSpeedMax = _this.args.xSpeedMaxOriginal;
    _this.args.gSpeedMax = 5;
    _this.args.decel = 0.15;
    _this.args.accel = 0.5;
    _this.args.seatHeight = 14;
    _this.args.seatForward = 12;
    _this.args.skidTraction = 0.95;
    _this.dustCount = 0;
    _this.args.flyAngle = -0.25;
    _this.args.particleScale = 2;
    _this.args["float"] = -1;
    _this.args.thrusting = false;
    _this.args.landingGear = true;
    _this.args.jumpForce = 8;
    _this.args.fuelLevel = 100;
    _this.args.thrusterFill = 0;
    _this.args.noThrust = 0;
    return _this;
  }

  _createClass(Tornado, [{
    key: "onAttached",
    value: function onAttached() {
      var _this2 = this;

      this.box = this.findTag('div');
      this.sprite = this.findTag('div.sprite');
      this.plane = new _Tag.Tag('<div class = "plane">');
      this.fuselage = new _Tag.Tag('<div class = "fuselage">');
      this.propeller = new _Tag.Tag('<div class = "propeller">');
      this.thruster = new _Tag.Tag('<div class = "thruster">');
      this.fuelMeter = new _Tag.Tag('<div class = "fuel-meter">');
      this.frontGear = new _Tag.Tag('<div class = "front-landing-gear">');
      this.rearGear = new _Tag.Tag('<div class = "rear-landing-gear">');
      this.sprite.appendChild(this.plane.node);
      this.thruster.appendChild(this.fuelMeter.node);
      this.plane.appendChild(this.thruster.node);
      this.plane.appendChild(this.propeller.node);
      this.plane.appendChild(this.frontGear.node);
      this.plane.appendChild(this.rearGear.node);
      this.plane.appendChild(this.fuselage.node);
      this.args.bindTo('landingGear', function (v) {
        if (_this2.plane) {
          _this2.plane.setAttribute('data-landing-gear', v);
        }
      });
      this.args.bindTo('thrusting', function (v) {
        if (_this2.plane) {
          _this2.plane.setAttribute('data-thrusting', v);
        }
      });
    }
  }, {
    key: "update",
    value: function update() {
      if (!this.occupant || !this.args.falling) {
        this.args.flyAngle = this["public"].falling ? 0.26 : -0.26;
        this.args.flying = false;
        this.args["float"] = 0;
      }

      if (!this["public"].thrusting && Math.abs(this["public"].xSpeed) < 8) {
        this.args["float"] = 0;
        this.args.flying = false;
      } else if (this["public"].falling) {
        this.args["float"] = -1;
        this.args.flying = true;
      }

      if (!this.args.jumping && this["public"].xSpeed === 0 && this["public"].falling) {
        this.args.flying = false;
        this.args["float"] = 0;

        if (this["public"].thrusting) {
          this.args.crashed = true;
          this.args.thrusting = false;
          this.args.noThrust = Date.now() + 500;
        }

        _get(_getPrototypeOf(Tornado.prototype), "update", this).call(this);

        return;
      }

      var maxAirSpeed = this.args.xSpeedMaxThrusting;

      if (this["public"].thrusting && this.args.fuelLevel <= 0) {
        this.args.thrusting = false;
        this.args.noThrust = Date.now() + 500;
        this.args.thrusterFill = Date.now() + 500;
      }

      if (this["public"].thrusting) {
        this.args.xSpeedMax = this["public"].xSpeedMaxThrusting;

        if (this.args.fuelLevel > 0) {
          this.args.fuelLevel -= 0.1;
        }
      } else {
        this.args.xSpeedMax = this["public"].xSpeedMaxOriginal;

        if (this.args.thrusterFill < Date.now() && this.args.fuelLevel < 100) {
          this.args.fuelLevel += 0.25;
        }
      }

      this.fuelMeter.style({
        '--fuelLevel': this.args.fuelLevel / 100
      });

      if (!this["public"].thrusting && Math.abs(this["public"].xSpeed) > maxAirSpeed) {
        this.args.xSpeed -= Math.sign(this["public"].xSpeed) * 0.2;
      }

      if (this["public"].thrusting && (Math.sign(this.args.xSpeed) !== this["public"].direction || Math.abs(this["public"].xSpeed) < maxAirSpeed)) {
        if (!this.args.falling && this["public"].xSpeed === 0) {
          this.args.flyAngle = -0.26;
          this.args.falling = true;
          this.args.flying = true;
          this.args.ySpeed = -5;
        }

        this.args.xSpeed += Math.sign(this["public"].direction) * 4;
      }

      if (Math.abs(this["public"].xSpeed) > this.args.xSpeedMax / 2 && !this["public"].thrusting && !this.xAxis) {
        this.args.xSpeed *= 0.95;
      }

      if (Math.abs(this["public"].xSpeed) > maxAirSpeed) {
        this.args.xSpeed = maxAirSpeed * Math.sign(this["public"].direction);
      }

      if (this["public"].flying) {
        if (this["public"].ySpeed === 0) {
          this.args.flyAngle = 0;
        }

        if (this["public"].landingGear) {
          if (!this["public"].thrusting && this.args.flyAngle < Math.PI / 4) {
            this.args.flyAngle += 0.005;
          } else if (this["public"].thrusting && this.args.flyAngle > -Math.PI / 4) {
            this.args.flyAngle -= 0.005;
          }
        } else {
          if (Math.abs(this.args.flyAngle) > 0.00125) {
            this.args.flyAngle -= 0.00125 * Math.sign(this.args.flyAngle);
          } else {
            this.args.flyAngle = 0;
          }
        }

        if (!this["public"].xSpeed) {
          this.args.flying = false;
          return;
        }

        var newAngle = this.args.flyAngle + Math.sign(this.yAxis) * 0.035;

        if (this.args.flyAngle > 0) {
          this.args.xSpeed *= 1.025;
        } else if (this.args.flyAngle > 0) {
          this.args.xSpeed /= 1.025;
        }

        if (this.yAxis && Math.abs(newAngle) < Math.PI / 2) {
          this.args.flyAngle = newAngle;
        }

        if (Math.sign(this["public"].xSpeed) === this["public"].direction) {
          var speed = this["public"].xSpeed || this["public"].gSpeed;
          this.args.ySpeed = Math.sin(this["public"].flyAngle) * speed * this["public"].direction * 2;
        }
      } else {
        if (!this["public"].thrusting && this.args.flyAngle < Math.PI / 2 && this.args.ySpeed > 0) {
          this.args.flyAngle += 0.025;
        }
      }

      if (this["public"].flying) {
        this.args.airAngle = this.args.flyAngle;
        this.args.jumping = false;
      }

      if (!this["public"].falling) {
        this.args.landingGear = true;
        this.args.flyAngle = -0.26;
      }

      _get(_getPrototypeOf(Tornado.prototype), "update", this).call(this);

      if (this["public"].flying) {
        this.args.cameraMode = 'airplane';
      }
    }
  }, {
    key: "command_1",
    value: function command_1() {
      if (this.args.falling) {
        this.args.landingGear = !this.args.landingGear;
      }
    }
  }, {
    key: "hold_2",
    value: function hold_2() {
      if (!this.args.thrusting && this.args.fuelLevel <= 1) {
        return;
      }

      if (this.args.fuelLevel <= 0) {
        return;
      }

      if (this.args.crashed || this.args.noThrust > Date.now()) {
        this.args["false"] = true;
        return;
      }

      this.args.thrusting = true;
    }
  }, {
    key: "release_2",
    value: function release_2() {
      this.args.thrusting = false;
      this.args.crashed = false;
    }
  }, {
    key: "solid",
    get: function get() {
      return true;
    }
  }]);

  return Tornado;
}(_Vehicle2.Vehicle);

exports.Tornado = Tornado;
});

;require.register("actor/Vehicle.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vehicle = void 0;

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

var Vehicle = /*#__PURE__*/function (_PointActor) {
  _inherits(Vehicle, _PointActor);

  var _super = _createSuper(Vehicle);

  function Vehicle() {
    _classCallCheck(this, Vehicle);

    return _super.apply(this, arguments);
  }

  _createClass(Vehicle, [{
    key: "update",
    value: function update() {
      if (this.occupant) {
        this.running = this.occupant.running;
        this.crawling = this.occupant.crawling;
      }

      _get(_getPrototypeOf(Vehicle.prototype), "update", this).call(this);
    }
  }, {
    key: "collideA",
    value: function collideA(other, type) {
      if (other.controllable) {
        if (other.args.ySpeed > 0) {
          return true;
        } else {
          return false;
        }
      }

      if (other.y >= this.y) {
        return false;
      }

      if (!other.args["float"]) {
        other.args.ySpeed = -other.args.ySpeed;
        other.args.xSpeed = other.args.xSpeed || other.args.direction * 5;

        if (other.args.ySpeed > -5) {
          other.args.ySpeed = -5;
        }

        other.args.falling = true;
      }

      return false;
    }
  }, {
    key: "standBelow",
    value: function standBelow(other) {
      if (!other.controllable) {
        other.args.ySpeed = -other.args.ySpeed;
        other.args.xSpeed = other.args.xSpeed || other.args.direction * 5;

        if (other.args.ySpeed > -5) {
          other.args.ySpeed = -5;
        }

        other.args.falling = true;
      }
    }
  }, {
    key: "isVehicle",
    get: function get() {
      return true;
    }
  }]);

  return Vehicle;
}(_PointActor2.PointActor);

exports.Vehicle = Vehicle;
});

;require.register("actor/WaterFall.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WaterFall = void 0;

var _PointActor2 = require("./PointActor");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var WaterFall = /*#__PURE__*/function (_PointActor) {
  _inherits(WaterFall, _PointActor);

  var _super = _createSuper(WaterFall);

  _createClass(WaterFall, null, [{
    key: "fromDef",
    value: function fromDef(objDef) {
      var obj = _get(_getPrototypeOf(WaterFall), "fromDef", this).call(this, objDef);

      obj.args.width = objDef.width;
      obj.args.height = objDef.height;
      obj.args.toHeight = objDef.toHeight || 0;
      obj.args.x = objDef.x + 32;
      obj.args.yOriginal = objDef.y;
      return obj;
    }
  }]);

  function WaterFall() {
    var _this;

    _classCallCheck(this, WaterFall);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.width = _this["public"].width || 32;
    _this.args.height = _this["public"].height || 64;
    _this.args.type = 'actor-item actor-water-fall';
    _this.args["float"] = -1;
    _this.args.active = false;
    return _this;
  }

  _createClass(WaterFall, [{
    key: "onAttached",
    value: function onAttached() {
      var _this2 = this;

      this["switch"] = this.viewport.actorsById[this["public"]["switch"]];
      this["switch"].args.bindTo('active', function (v) {
        if (v && !_this2.args.active) {
          _this2.args.active = true;

          _this2.onNextFrame(function () {
            _this2.args.toHeight = _this2.args.openHeight;
            _this2.args.y -= _this2.args.openOffset;
          });
        }
      });
    }
  }, {
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(WaterFall.prototype), "update", this).call(this);

      if (this.args.toHeight !== this.args.height) {
        var diff = this.args.toHeight - this.args.height;
        var increment = Math.sign(diff) * 8;

        if (diff < increment) {
          this.args.height = this.args.toHeight;
          this.args.y = this["public"].yOriginal + this.args.toHeight;
        }

        this.args.height += increment;
        this.args.y += increment;
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

  return WaterFall;
}(_PointActor2.PointActor);

exports.WaterFall = WaterFall;
});

;require.register("actor/WaterJet.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WaterJet = void 0;

var _PointActor2 = require("./PointActor");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var WaterJet = /*#__PURE__*/function (_PointActor) {
  _inherits(WaterJet, _PointActor);

  var _super = _createSuper(WaterJet);

  _createClass(WaterJet, null, [{
    key: "fromDef",
    value: function fromDef(objDef) {
      var obj = _get(_getPrototypeOf(WaterJet), "fromDef", this).call(this, objDef);

      obj.args.width = objDef.width;
      obj.args.height = objDef.height;
      obj.args.x = objDef.x + objDef.width / 2;
      return obj;
    }
  }]);

  function WaterJet() {
    var _this;

    _classCallCheck(this, WaterJet);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.width = _this["public"].width || 32;
    _this.args.height = _this["public"].height || 64;
    _this.args["float"] = -1;
    _this.args.type = 'actor-item actor-water-jet';
    return _this;
  }

  _createClass(WaterJet, [{
    key: "solid",
    get: function get() {
      return false;
    }
  }, {
    key: "isEffect",
    get: function get() {
      return true;
    }
  }, {
    key: "isGhost",
    get: function get() {
      return true;
    }
  }]);

  return WaterJet;
}(_PointActor2.PointActor);

exports.WaterJet = WaterJet;
});

;require.register("actor/Window.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Window = void 0;

var _PointActor2 = require("./PointActor");

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

var Window = /*#__PURE__*/function (_PointActor) {
  _inherits(Window, _PointActor);

  var _super = _createSuper(Window);

  function Window() {
    var _this;

    _classCallCheck(this, Window);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'actor-item actor-window';
    _this.args.width = 64;
    _this.args.height = 160;
    _this.args["float"] = -1;
    return _this;
  }

  _createClass(Window, [{
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

  return Window;
}(_PointActor2.PointActor);

exports.Window = Window;
});

;require.register("actor/monitor/RingMonitor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RingMonitor = void 0;

var _Monitor2 = require("../Monitor");

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

var RingMonitor = /*#__PURE__*/function (_Monitor) {
  _inherits(RingMonitor, _Monitor);

  var _super = _createSuper(RingMonitor);

  function RingMonitor() {
    _classCallCheck(this, RingMonitor);

    return _super.apply(this, arguments);
  }

  _createClass(RingMonitor, [{
    key: "attached",
    value: function attached(event) {
      _get(_getPrototypeOf(RingMonitor.prototype), "attached", this).call(this, event);

      this.box.attr({
        'data-monitor': 'ring'
      });
    }
  }, {
    key: "effect",
    value: function effect(other) {
      other.args.rings += 10;
    }
  }]);

  return RingMonitor;
}(_Monitor2.Monitor);

exports.RingMonitor = RingMonitor;
});

;require.register("actor/monitor/SheildElectricMonitor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SheildElectricMonitor = void 0;

var _Monitor2 = require("../Monitor");

var _ElectricSheild = require("../../powerups/ElectricSheild");

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

var SheildElectricMonitor = /*#__PURE__*/function (_Monitor) {
  _inherits(SheildElectricMonitor, _Monitor);

  var _super = _createSuper(SheildElectricMonitor);

  function SheildElectricMonitor() {
    _classCallCheck(this, SheildElectricMonitor);

    return _super.apply(this, arguments);
  }

  _createClass(SheildElectricMonitor, [{
    key: "attached",
    value: function attached(event) {
      _get(_getPrototypeOf(SheildElectricMonitor.prototype), "attached", this).call(this, event);

      this.box.attr({
        'data-monitor': 'sheild-electric'
      });
    }
  }, {
    key: "effect",
    value: function effect(other) {
      if (!other.controllable) {
        return;
      }

      var sheild = new _ElectricSheild.ElectricSheild();
      other.powerups.add(sheild);
      other.inventory.add(sheild);
    }
  }]);

  return SheildElectricMonitor;
}(_Monitor2.Monitor);

exports.SheildElectricMonitor = SheildElectricMonitor;
});

;require.register("actor/monitor/SheildFireMonitor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SheildFireMonitor = void 0;

var _Monitor2 = require("../Monitor");

var _FireSheild = require("../../powerups/FireSheild");

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

var SheildFireMonitor = /*#__PURE__*/function (_Monitor) {
  _inherits(SheildFireMonitor, _Monitor);

  var _super = _createSuper(SheildFireMonitor);

  function SheildFireMonitor() {
    _classCallCheck(this, SheildFireMonitor);

    return _super.apply(this, arguments);
  }

  _createClass(SheildFireMonitor, [{
    key: "attached",
    value: function attached(event) {
      _get(_getPrototypeOf(SheildFireMonitor.prototype), "attached", this).call(this, event);

      this.box.attr({
        'data-monitor': 'sheild-fire'
      });
    }
  }, {
    key: "effect",
    value: function effect(other) {
      if (!other.controllable) {
        return;
      }

      var sheild = new _FireSheild.FireSheild();
      other.powerups.add(sheild);
      other.inventory.add(sheild);
    }
  }]);

  return SheildFireMonitor;
}(_Monitor2.Monitor);

exports.SheildFireMonitor = SheildFireMonitor;
});

;require.register("actor/monitor/SheildWaterMonitor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SheildWaterMonitor = void 0;

var _Monitor2 = require("../Monitor");

var _BubbleSheild = require("../../powerups/BubbleSheild");

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

var SheildWaterMonitor = /*#__PURE__*/function (_Monitor) {
  _inherits(SheildWaterMonitor, _Monitor);

  var _super = _createSuper(SheildWaterMonitor);

  function SheildWaterMonitor() {
    _classCallCheck(this, SheildWaterMonitor);

    return _super.apply(this, arguments);
  }

  _createClass(SheildWaterMonitor, [{
    key: "attached",
    value: function attached(event) {
      _get(_getPrototypeOf(SheildWaterMonitor.prototype), "attached", this).call(this, event);

      this.box.attr({
        'data-monitor': 'sheild-water'
      });
    }
  }, {
    key: "effect",
    value: function effect(other) {
      if (!other.controllable) {
        return;
      }

      var sheild = new _BubbleSheild.BubbleSheild();
      other.powerups.add(sheild);
      other.inventory.add(sheild);
    }
  }]);

  return SheildWaterMonitor;
}(_Monitor2.Monitor);

exports.SheildWaterMonitor = SheildWaterMonitor;
});

;require.register("backdrop/Backdrop.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Backdrop = void 0;

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var layers = [];

var Backdrop = /*#__PURE__*/function (_View) {
  _inherits(Backdrop, _View);

  var _super = _createSuper(Backdrop);

  function Backdrop() {
    var _this;

    _classCallCheck(this, Backdrop);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", "<div class = \"backdrop\">\n\t\t<div cv-ref = \"backdrop\" class = \"parallax\"></div>\n\t</div>");

    _defineProperty(_assertThisInitialized(_this), "layers", []);

    return _this;
  }

  _createClass(Backdrop, [{
    key: "onAttached",
    value: function onAttached(event) {
      if (this.alreadyAttached) {
        return;
      }

      this.alreadyAttached = true;
      var backdrop = this.tags.backdrop;
      var strips = this.args.strips.reverse();
      var yPositions = [];
      var xPositions = [];
      var urls = [];
      var stacked = 0;

      for (var i in strips) {
        var strip = strips[i];
        yPositions.push("calc(100% - calc(1px * ".concat(stacked, "))"));
        var xFormula = "0px";

        if (strip.parallax) {
          xFormula = "calc(".concat(xFormula, " + calc(1px * calc(").concat(strip.parallax, " * var(--x))))");
        }

        if (strip.autoscroll) {
          xFormula = "calc(".concat(xFormula, " + calc(1px * calc(").concat(strip.autoscroll, " * var(--frame) )) )");
        }

        xPositions.push(xFormula);
        urls.push(strips[i].url);
        stacked += strips[i].height - 1;
      }

      var xPos = xPositions.join(', ');
      var yPos = yPositions.join(', ');
      var url = urls.map(function (u) {
        return "url(".concat(u, ")");
      }).join(', ');
      backdrop.style({
        'background-position-y': yPos,
        'background-position-x': xPos,
        'background-repeat': 'repeat-x',
        'background-image': url,
        '--x': this.args.x,
        '--y': this.args.y
      });
      this.args.bindTo(['x', 'y', 'xMax', 'yMax', 'frame'], function (v, k) {
        return backdrop.style(_defineProperty({}, "--".concat(k), v));
      });
    }
  }]);

  return Backdrop;
}(_View2.View);

exports.Backdrop = Backdrop;
});

;require.register("backdrop/MarbleGarden.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MarbleGarden = void 0;

var _Backdrop2 = require("./Backdrop");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var MarbleGarden = /*#__PURE__*/function (_Backdrop) {
  _inherits(MarbleGarden, _Backdrop);

  var _super = _createSuper(MarbleGarden);

  function MarbleGarden(args, parent) {
    var _this;

    _classCallCheck(this, MarbleGarden);

    _this = _super.call(this, args, parent);
    _this.args.strips = [{
      autoscroll: -1.25,
      parallax: 0.015,
      url: '/Sonic/backdrop/marble-garden/0.png',
      height: 32
    }, {
      autoscroll: -1,
      parallax: 0.015,
      url: '/Sonic/backdrop/marble-garden/1.png',
      height: 24
    }, {
      autoscroll: -0.9,
      parallax: 0.015,
      url: '/Sonic/backdrop/marble-garden/2.png',
      height: 8
    }, {
      autoscroll: -0.8,
      parallax: 0.015,
      url: '/Sonic/backdrop/marble-garden/3.png',
      height: 24
    }, {
      autoscroll: -0.7,
      parallax: 0.015,
      url: '/Sonic/backdrop/marble-garden/4.png',
      height: 8
    }, {
      autoscroll: -0.6,
      parallax: 0.0125,
      url: '/Sonic/backdrop/marble-garden/5.png',
      height: 24
    }, {
      autoscroll: -0.5,
      parallax: 0.0125,
      url: '/Sonic/backdrop/marble-garden/6.png',
      height: 16
    }, {
      autoscroll: -0.45,
      parallax: 0.0125,
      url: '/Sonic/backdrop/marble-garden/7.png',
      height: 8
    }, {
      autoscroll: -0.45,
      parallax: 0.0125,
      url: '/Sonic/backdrop/marble-garden/8.png',
      height: 16
    }, {
      autoscroll: -0.4,
      parallax: 0.0125,
      url: '/Sonic/backdrop/marble-garden/9.png',
      height: 8
    }, {
      autoscroll: -0.35,
      parallax: 0.025,
      url: '/Sonic/backdrop/marble-garden/10.png',
      height: 16
    }, {
      autoscroll: -0.3,
      parallax: 0.01,
      url: '/Sonic/backdrop/marble-garden/11.png',
      height: 8
    }, {
      autoscroll: -0.25,
      parallax: 0.0075,
      url: '/Sonic/backdrop/marble-garden/12.png',
      height: 8
    }, {
      autoscroll: -0.2,
      parallax: 0.0075,
      url: '/Sonic/backdrop/marble-garden/13.png',
      height: 8
    }, {
      autoscroll: -0.15,
      parallax: 0.01,
      url: '/Sonic/backdrop/marble-garden/14.png',
      height: 8
    }, {
      autoscroll: -0.1,
      parallax: 0.01,
      url: '/Sonic/backdrop/marble-garden/15.png',
      height: 5
    }, {
      autoscroll: 0,
      parallax: 0.1,
      url: '/Sonic/backdrop/marble-garden/16.png',
      height: 30
    }, {
      autoscroll: 0,
      parallax: 0.125,
      url: '/Sonic/backdrop/marble-garden/17.png',
      height: 12
    }, {
      autoscroll: 0,
      parallax: 0.125,
      url: '/Sonic/backdrop/marble-garden/18.png',
      height: 6
    }, {
      autoscroll: 0,
      parallax: 0.15,
      url: '/Sonic/backdrop/marble-garden/19.png',
      height: 6
    }, {
      autoscroll: 0,
      parallax: 0.175,
      url: '/Sonic/backdrop/marble-garden/20.png',
      height: 8
    }, {
      autoscroll: 0,
      parallax: 0.2,
      url: '/Sonic/backdrop/marble-garden/21.png',
      height: 8
    }, {
      autoscroll: 0,
      parallax: 0.225,
      url: '/Sonic/backdrop/marble-garden/22.png',
      height: 24
    }, {
      autoscroll: 0,
      parallax: 0.25,
      url: '/Sonic/backdrop/marble-garden/23.png',
      height: 344
    }];
    return _this;
  }

  return MarbleGarden;
}(_Backdrop2.Backdrop);

exports.MarbleGarden = MarbleGarden;
});

;require.register("behavior/Behavior.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Behavior = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Behavior = /*#__PURE__*/function () {
  function Behavior() {
    _classCallCheck(this, Behavior);
  }

  _createClass(Behavior, [{
    key: "update",
    value: function update(host) {}
  }]);

  return Behavior;
}();

exports.Behavior = Behavior;
});

;require.register("behavior/SkidDust.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SkidDust = void 0;

var _Tag = require("curvature/base/Tag");

var _Behavior2 = require("./Behavior");

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

var SkidDust = /*#__PURE__*/function (_Behavior) {
  _inherits(SkidDust, _Behavior);

  var _super = _createSuper(SkidDust);

  function SkidDust(dustType) {
    var _this;

    _classCallCheck(this, SkidDust);

    _this = _super.call(this);
    _this.dustType = dustType || 'particle-dust';
    return _this;
  }

  _createClass(SkidDust, [{
    key: "update",
    value: function update(host) {
      if (host["public"].falling || host["public"].rolling) {
        return;
      }

      if (host["public"].wallSticking || host["public"].climbing) {
        return;
      }

      if (Math.sign(host["public"].gSpeed) === direction) {
        return;
      }

      if (Math.abs(host["public"].gSpeed - direction) < 5) {
        return;
      }

      if (!host.skidding) {
        return;
      }

      host.box.setAttribute('data-animation', 'skidding');
      var direction = host["public"].direction;
      var viewport = host.viewport;

      if (viewport.args.frameId % 2 !== 0) {
        return;
      }

      var dustParticle = new _Tag.Tag("<div class = \"".concat(this.dustType, "\">"));
      var dustPoint = host.rotatePoint(host["public"].gSpeed, 0);
      dustParticle.style({
        '--x': dustPoint[0] + host.x,
        '--y': dustPoint[1] + host.y,
        'z-index': 0,
        opacity: Math.random() * 2
      });
      viewport.particles.add(dustParticle);
      setTimeout(function () {
        viewport.particles.remove(dustParticle);
      }, 350);
    }
  }]);

  return SkidDust;
}(_Behavior2.Behavior);

exports.SkidDust = SkidDust;
});

;require.register("cards/basic-controls.html", function(exports, require, module) {
module.exports = "<div class = \"control-card\">\n\t<span class = \"button-index\">\n\t\t<span class = \"arrow button arrow-west\"></span>\n\t\t/ <span class = \"arrow button arrow-east\"></span>\n\t\t/ <b>wasd</b>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-x\"></span>\n\t\t<span class = \"button xb xb-a\"></span>\n\t\t<b>space</b>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-o\"></span>\n\t\t<span class = \"button xb xb-b\"></span>\n\t\t<b>ctrl</b>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-s\"></span>\n\t\t<span class = \"button xb xb-x\"></span>\n\t\t<b>shift</b>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-t\"></span>\n\t\t<span class = \"button xb xb-y\"></span>\n\t\t<b>z</b>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-l1\"></span>\n\t\t<span class = \"button xb xb-lb\"></span>\n\t\t<b>q</b>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-r1\"></span>\n\t\t<span class = \"button xb xb-rb\"></span>\n\t\t<b>e</b>\n\t</span>\n</div>\n"
});

;require.register("cards/basic-moves.html", function(exports, require, module) {
module.exports = "<p><b>jump</b> + <b>jump</b> - fly / double jump action</p>\n\n<p><span class = \"arrow-button arrow-north\"></span> + <b>jump</b> - disengage vehicle</p>\n\n<!-- <p><span class = \"arrow-button arrow-south\"></span> + <b>jump</b> - spindash</p> -->\n"
});

;require.register("cards/plane-air-controls.html", function(exports, require, module) {
module.exports = "<div class = \"control-card\">\n\t<span class = \"button-index\">\n\t\t<span class = \"arrow button arrow-west\"></span>\n\t\t/ <span class = \"arrow button arrow-east\"></span>\n\t\t/ <b>wasd</b>\n\t\t- move\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-x\"></span>\n\t\t<span class = \"button xb xb-a\"></span>\n\t\t<b>space</b>\n\t\t- double barrier\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-o\"></span>\n\t\t<span class = \"button xb xb-b\"></span>\n\t\t<b>ctrl</b>\n\t\t- <span>no action</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-s\"></span>\n\t\t<span class = \"button xb xb-x\"></span>\n\t\t<b>shift</b>\n\t\t- <span>light dash</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-t\"></span>\n\t\t<span class = \"button xb xb-y\"></span>\n\t\t<b>z</b>\n\t\t- <span>no action</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-l1\"></span>\n\t\t<span class = \"button xb xb-lb\"></span>\n\t\t<b>q</b>\n\t\t- <span>air dash left</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-r1\"></span>\n\t\t<span class = \"button xb xb-rb\"></span>\n\t\t<b>e</b>\n\t\t- <span>air dash right</span>\n\t</span>\n\n</div>\n"
});

;require.register("cards/sonic-air-controls.html", function(exports, require, module) {
module.exports = "<div class = \"control-card\">\n\t<span class = \"button-index\">\n\t\t<span class = \"arrow button arrow-west\"></span>\n\t\t/ <span class = \"arrow button arrow-east\"></span>\n\t\t/ <b>wasd</b>\n\t\t- move\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-x\"></span>\n\t\t<span class = \"button xb xb-a\"></span>\n\t\t<b>space</b>\n\t\t- double barrier\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-o\"></span>\n\t\t<span class = \"button xb xb-b\"></span>\n\t\t<b>ctrl</b>\n\t\t- <span>no action</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-s\"></span>\n\t\t<span class = \"button xb xb-x\"></span>\n\t\t<b>shift</b>\n\t\t- <span>light dash</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-t\"></span>\n\t\t<span class = \"button xb xb-y\"></span>\n\t\t<b>z</b>\n\t\t- <span>no action</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-l1\"></span>\n\t\t<span class = \"button xb xb-lb\"></span>\n\t\t<b>q</b>\n\t\t- <span>air dash left</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-r1\"></span>\n\t\t<span class = \"button xb xb-rb\"></span>\n\t\t<b>e</b>\n\t\t- <span>air dash right</span>\n\t</span>\n\n</div>\n"
});

;require.register("cards/sonic-controls.html", function(exports, require, module) {
module.exports = "<div class = \"control-card\">\n\n\t<span class = \"button-index\">\n\t\t<span class = \"arrow button arrow-west\"></span>\n\t\t/ <span class = \"arrow button arrow-east\"></span>\n\t\t/ <b>wasd</b>\n\t\t- move\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-x\"></span>\n\t\t<span class = \"button xb xb-a\"></span>\n\t\t<b>space</b>\n\t\t- jump\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-o\"></span>\n\t\t<span class = \"button xb xb-b\"></span>\n\t\t<b>ctrl</b>\n\t\t- <span>spindash</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-s\"></span>\n\t\t<span class = \"button xb xb-x\"></span>\n\t\t<b>z</b>\n\t\t- <span>no action</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-t\"></span>\n\t\t<span class = \"button xb xb-y\"></span>\n\t\t<b>x</b>\n\t\t- <span>super</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-l1\"></span>\n\t\t<span class = \"button xb xb-lb\"></span>\n\t\t<b>q</b>\n\t\t- <span>no action</span>\n\t</span>\n\n\t<span class = \"button-index\">\n\t\t<span class = \"button ps ps-r1\"></span>\n\t\t<span class = \"button xb xb-rb\"></span>\n\t\t<b>e</b>\n\t\t- <span>no action</span>\n\t</span>\n\n</div>\n"
});

;require.register("console/task/Impulse.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Impulse = void 0;

var _Task2 = require("subspace-console/Task");

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

var Impulse = /*#__PURE__*/function (_Task) {
  _inherits(Impulse, _Task);

  var _super = _createSuper(Impulse);

  function Impulse() {
    var _this;

    _classCallCheck(this, Impulse);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Impulse task');

    _defineProperty(_assertThisInitialized(_this), "prompt", '..');

    return _this;
  }

  _createClass(Impulse, [{
    key: "init",
    value: function init(magnitude, angle) {
      // this.print(`Pressing button ${buttonId} for ${ms} milliseconds...`);
      var actor = Impulse.viewport.controlActor;
      actor.impulse(magnitude, angle, true);
    }
  }, {
    key: "write",
    value: function write(line) {
      this.print(line);
    }
  }]);

  return Impulse;
}(_Task2.Task);

exports.Impulse = Impulse;

_defineProperty(Impulse, "viewport", null);

_defineProperty(Impulse, "helpText", 'Apply an impulse to the player object.');

_defineProperty(Impulse, "useText", 'input magnitude angle');
});

;require.register("console/task/Input.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Input = void 0;

var _Task2 = require("subspace-console/Task");

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

var Input = /*#__PURE__*/function (_Task) {
  _inherits(Input, _Task);

  var _super = _createSuper(Input);

  function Input() {
    var _this;

    _classCallCheck(this, Input);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Input task');

    _defineProperty(_assertThisInitialized(_this), "prompt", '..');

    return _this;
  }

  _createClass(Input, [{
    key: "init",
    value: function init(buttonId) {
      var ms = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
      this.print("Pressing button ".concat(buttonId, " for ").concat(ms, " milliseconds..."));
      var frame = {
        buttons: _defineProperty({}, buttonId, 1)
      };
      var actor = Input.viewport.controlActor;
      var controller = actor.controller;
      controller.replay(frame);
      actor.readInput();
      return new Promise(function (accept) {
        setTimeout(function () {
          frame.buttons[buttonId] = 0;
          controller.replay(frame);
          actor.readInput();
          accept();
        }, ms);
      });
    }
  }, {
    key: "write",
    value: function write(line) {
      this.print(line);
    }
  }]);

  return Input;
}(_Task2.Task); // import { Task } from 'subspace-console/Task';
// export class Input extends Task
// {
// 	static viewport = null;
// 	static helpText = 'Press a button x for y milliseconds.';
// 	static useText  = 'input x y';
// 	title  = 'Input task';
// 	prompt = '..';
// 	init(buttonId, ms = 500)
// 	{
// 		this.print(`Pressing button ${buttonId} for ${ms} milliseconds...`);
// 		this.actor = Input.viewport.controlActor;
// 		this.frame = {buttons: { [buttonId]: 1 }};
// 		this.buttonId   = buttonId;
// 		this.controller = this.actor.controller;
// 		this.hold = setInterval(() => this.controller.replay(this.frame), 16);
// 		this.ms   = ms;
// 		this.controller.replay(this.frame);
// 		return new Promise(accept => {
// 			setTimeout(() => {
// 				clearInterval(this.hold);
// 				this.frame.buttons[this.buttonId] = 0;
// 				this.controller.replay(this.frame);
// 				accept();
// 			}, this.ms);
// 		});
// 	}
// 	main(line)
// 	{
// 		this.print(line);
// 	}
// }


exports.Input = Input;

_defineProperty(Input, "viewport", null);

_defineProperty(Input, "helpText", 'Press a button x for y milliseconds.');

_defineProperty(Input, "useText", 'input x y');
});

;require.register("console/task/Move.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Move = void 0;

var _Task2 = require("subspace-console/Task");

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

var Move = /*#__PURE__*/function (_Task) {
  _inherits(Move, _Task);

  var _super = _createSuper(Move);

  function Move() {
    var _this;

    _classCallCheck(this, Move);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "prompt", '..');

    return _this;
  }

  _createClass(Move, [{
    key: "init",
    value: function init(x, y) {
      this.print("Moving character to x, y...");
      var actor = Move.viewport.controlActor;
      actor.args.x = Number(x);
      actor.args.y = Number(y);
    }
  }]);

  return Move;
}(_Task2.Task);

exports.Move = Move;

_defineProperty(Move, "viewport", null);

_defineProperty(Move, "helpText", 'Move the current actor to a position in space.');

_defineProperty(Move, "useText", 'move x y');
});

;require.register("console/task/Pos.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pos = void 0;

var _Task2 = require("subspace-console/Task");

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

var Pos = /*#__PURE__*/function (_Task) {
  _inherits(Pos, _Task);

  var _super = _createSuper(Pos);

  function Pos() {
    _classCallCheck(this, Pos);

    return _super.apply(this, arguments);
  }

  _createClass(Pos, [{
    key: "init",
    value: function init(x, y) {
      var actor = Pos.viewport.controlActor;
      this.print("Character is at ".concat(actor.x, ", ").concat(actor.y, "."));
    }
  }]);

  return Pos;
}(_Task2.Task);

exports.Pos = Pos;

_defineProperty(Pos, "viewport", null);

_defineProperty(Pos, "helpText", 'Check the current actor\'s position in space.');
});

;require.register("controller/Axis.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Axis = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Axis = /*#__PURE__*/function () {
  function Axis(_ref) {
    var _ref$deadZone = _ref.deadZone,
        deadZone = _ref$deadZone === void 0 ? 0 : _ref$deadZone,
        _ref$proportional = _ref.proportional,
        proportional = _ref$proportional === void 0 ? true : _ref$proportional;

    _classCallCheck(this, Axis);

    _defineProperty(this, "active", false);

    _defineProperty(this, "magnitude", 0);

    _defineProperty(this, "delta", 0);

    if (deadZone) {
      this.proportional = proportional;
      this.deadZone = deadZone;
    }
  }

  _createClass(Axis, [{
    key: "tilt",
    value: function tilt(magnitude) {
      if (this.deadZone && Math.abs(magnitude) >= this.deadZone) {
        magnitude = (Math.abs(magnitude) - this.deadZone) / (1 - this.deadZone) * Math.sign(magnitude);
      } else {
        magnitude = 0;
      }

      this.delta = Number(magnitude - this.magnitude).toFixed(3) - 0;
      this.magnitude = Number(magnitude).toFixed(3) - 0;
    }
  }, {
    key: "zero",
    value: function zero() {
      this.magnitude = this.delta = 0;
    }
  }]);

  return Axis;
}();

exports.Axis = Axis;
});

;require.register("controller/Button.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Button = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Button = /*#__PURE__*/function () {
  function Button() {
    _classCallCheck(this, Button);

    _defineProperty(this, "active", false);

    _defineProperty(this, "pressure", 0);

    _defineProperty(this, "delta", 0);

    _defineProperty(this, "time", 0);
  }

  _createClass(Button, [{
    key: "update",
    value: function update() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this.pressure) {
        this.time++;
      } else if (!this.pressure && this.time > 0) {
        this.time = -1;
      } else if (!this.pressure && this.time < 0) {
        this.time--;
      }

      if (this.time < -1 && this.delta === -1) {
        this.delta = 0;
      }
    }
  }, {
    key: "press",
    value: function press(pressure) {
      this.delta = Number(pressure - this.pressure).toFixed(3) - 0;
      this.pressure = Number(pressure).toFixed(3) - 0;
      this.active = true;
      this.time = this.time > 0 ? this.time : 0;
    }
  }, {
    key: "release",
    value: function release() {
      if (!this.active) {
        return;
      }

      this.delta = Number(-this.pressure).toFixed(3) - 0;
      this.pressure = 0;
      this.active = false;
    }
  }, {
    key: "zero",
    value: function zero() {
      this.pressure = this.delta = 0;
      this.active = false;
    }
  }]);

  return Button;
}();

exports.Button = Button;
});

;require.register("controller/Controller.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = void 0;

var _Axis = require("./Axis");

var _Button = require("./Button");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var keys = {
  ' ': 0,
  'Enter': 0,
  'Control': 1,
  'Shift': 2,
  'z': 3,
  'q': 4,
  'e': 5,
  'w': 12,
  'a': 14,
  's': 13,
  'd': 15,
  'p': 9,
  'Pause': 9,
  'Tab': 11,
  'ArrowUp': 12,
  'ArrowDown': 13,
  'ArrowLeft': 14,
  'ArrowRight': 15,
  'Backquote': 5000
};

_toConsumableArray(Array(12)).map(function (x, fn) {
  return keys["F".concat(fn)] = 1000 + fn;
});

var axisMap = {
  12: -1,
  13: +1,
  14: -0,
  15: +0
};

var Controller = /*#__PURE__*/function () {
  function Controller(_ref) {
    var _ref$keys = _ref.keys,
        keys = _ref$keys === void 0 ? {} : _ref$keys,
        _ref$deadZone = _ref.deadZone,
        deadZone = _ref$deadZone === void 0 ? 0 : _ref$deadZone,
        _ref$gamepad = _ref.gamepad,
        gamepad = _ref$gamepad === void 0 ? null : _ref$gamepad,
        _ref$keyboard = _ref.keyboard,
        keyboard = _ref$keyboard === void 0 ? null : _ref$keyboard;

    _classCallCheck(this, Controller);

    this.deadZone = deadZone;
    Object.defineProperties(this, {
      buttons: {
        value: {}
      },
      pressure: {
        value: {}
      },
      axes: {
        value: {}
      },
      keys: {
        value: {}
      }
    });
  }

  _createClass(Controller, [{
    key: "update",
    value: function update() {
      for (var i in this.buttons) {
        var button = this.buttons[i];
        button.update();
      }
    }
  }, {
    key: "readInput",
    value: function readInput(_ref2) {
      var keyboard = _ref2.keyboard,
          gamepad = _ref2.gamepad;
      var pressed = {};
      var released = {};

      if (gamepad) {
        for (var i in gamepad.buttons) {
          var button = gamepad.buttons[i];

          if (button.pressed) {
            this.press(i, button.value);
            pressed[i] = true;
          }
        }
      }

      if (keyboard) {
        for (var _i in _toConsumableArray(Array(10))) {
          if (pressed[_i]) {
            continue;
          }

          if (keyboard.getKey(_i) > 0) {
            this.press(_i, 1);
            pressed[_i] = true;
          }
        }

        for (var keycode in keys) {
          if (pressed[keycode]) {
            continue;
          }

          var buttonId = keys[keycode];

          if (keyboard.getKey(keycode) > 0) {
            this.press(buttonId, 1);
            pressed[buttonId] = true;
          }
        }
      }

      if (gamepad) {
        for (var _i2 in gamepad.buttons) {
          if (pressed[_i2]) {
            continue;
          }

          var _button = gamepad.buttons[_i2];

          if (!_button.pressed) {
            this.release(_i2);
            released[_i2] = true;
          }
        }
      }

      if (keyboard) {
        for (var _i3 in _toConsumableArray(Array(10))) {
          if (released[_i3]) {
            continue;
          }

          if (pressed[_i3]) {
            continue;
          }

          if (keyboard.getKey(_i3) < 0) {
            this.release(_i3);
            released[_i3] = true;
          }
        }

        for (var _keycode in keys) {
          var _buttonId = keys[_keycode];

          if (released[_buttonId]) {
            continue;
          }

          if (pressed[_buttonId]) {
            continue;
          }

          if (keyboard.getKey(_keycode) < 0) {
            this.release(_buttonId);
            released[_keycode] = true;
          }
        }
      }

      var tilted = {};

      if (gamepad) {
        for (var _i4 in gamepad.axes) {
          var axis = gamepad.axes[_i4];
          tilted[_i4] = true;
          this.tilt(_i4, axis);
        }
      }

      for (var _buttonId2 in axisMap) {
        if (!this.buttons[_buttonId2]) {
          this.buttons[_buttonId2] = new _Button.Button();
        }

        var _axis = axisMap[_buttonId2];
        var value = Math.sign(1 / _axis);
        var axisId = Math.abs(_axis);

        if (this.buttons[_buttonId2].active) {
          tilted[axisId] = true;
          this.tilt(axisId, value);
        } else if (!tilted[axisId]) {
          this.tilt(axisId, 0);
        }
      }
    }
  }, {
    key: "tilt",
    value: function tilt(axisId, magnitude) {
      if (!this.axes[axisId]) {
        this.axes[axisId] = new _Axis.Axis({
          deadZone: this.deadZone
        });
      }

      this.axes[axisId].tilt(magnitude);
    }
  }, {
    key: "press",
    value: function press(buttonId) {
      var pressure = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      if (!this.buttons[buttonId]) {
        this.buttons[buttonId] = new _Button.Button();
      }

      this.buttons[buttonId].press(pressure);
    }
  }, {
    key: "release",
    value: function release(buttonId) {
      if (!this.buttons[buttonId]) {
        this.buttons[buttonId] = new _Button.Button();
      }

      this.buttons[buttonId].release();
    }
  }, {
    key: "serialize",
    value: function serialize() {
      var buttons = {};

      for (var i in this.buttons) {
        buttons[i] = this.buttons[i].pressure;
      }

      var axes = {};

      for (var _i5 in this.axes) {
        axes[_i5] = this.axes[_i5].magnitude;
      }

      return {
        axes: axes,
        buttons: buttons
      };
    }
  }, {
    key: "replay",
    value: function replay(input) {
      if (input.buttons) {
        for (var i in input.buttons) {
          if (input.buttons[i] > 0) {
            this.press(i, input.buttons[i]);
          } else {
            this.release(i);
          }
        }
      }

      if (input.axes) {
        for (var _i6 in input.axes) {
          if (input.axes[_i6].magnitude !== input.axes[_i6]) {
            this.tilt(_i6, input.axes[_i6]);
          }
        }
      }
    }
  }, {
    key: "zero",
    value: function zero() {
      for (var i in this.axes) {
        this.axes[i].zero();
      }

      for (var _i7 in this.buttons) {
        this.buttons[_i7].zero();
      }
    }
  }]);

  return Controller;
}();

exports.Controller = Controller;
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

    _defineProperty(_assertThisInitialized(_this), "template", "<div class = \"point-dump\">\n\t\t<div class = \"point\" style = \"--color:[[color]]\">[[x]], [[y]]</div>\n\t</div>");

    _this.args.x = _this.args.x || 0;
    _this.args.y = _this.args.y || 0;
    return _this;
  }

  return PointDump;
}(_View2.View);

exports.PointDump = PointDump;
});

;require.register("debug/arrow-east.svg", function(exports, require, module) {
module.exports = "<svg width=\"497.81px\" height=\"497.81px\" enable-background=\"new 0 0 497.812 497.812\" version=\"1.1\" viewBox=\"0 0 497.81 497.81\" xmlns=\"http://www.w3.org/2000/svg\">\n\t<g transform=\"matrix(-1 0 0 1 497.81 0)\">\n\t\t<path d=\"m203.66 312.91 117.03 117.03-67.906 67.875-248.91-248.91 248.91-248.91 67.906 67.875-117.06 117.06 290.28-0.031 0.031 127.97z\"/>\n\t</g>\n</svg>\n"
});

;require.register("effects/Cylinder.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cylinder = void 0;

var _View2 = require("curvature/base/View");

var _Tag = require("curvature/base/Tag");

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

var Cylinder = /*#__PURE__*/function (_View) {
  _inherits(Cylinder, _View);

  var _super = _createSuper(Cylinder);

  function Cylinder(args, parent) {
    var _this;

    _classCallCheck(this, Cylinder);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", require('./twist.svg'));

    _this.args.scale = _this.args.scale || 0;
    _this.args.id = _this.args.id || 'cylinder';
    _this.args.width = _this.args.width || 64;
    _this.args.height = _this.args.height || 64;
    return _this;
  }

  _createClass(Cylinder, [{
    key: "onRendered",
    value: function onRendered() {
      var _this2 = this;

      var displacer = new _Tag.Tag("<canvas width = \"".concat(this.args.width, "\" height = \"").concat(this.args.height, "\">"));
      var context = displacer.getContext('2d');
      context.imageSmoothingEnabled = false;
      var image = context.getImageData(0, 0, this.args.width, this.args.height);
      var pixels = image.data;

      for (var i = 0; i < pixels.length; i += 4) {
        var _r, _g, _b;

        var r = void 0,
            g = void 0,
            b = void 0,
            a = void 0,
            c = void 0,
            d = 0;
        var w = i / 4;
        var y = Math.floor(w / this.args.width);
        var x = w % this.args.width;
        var ox = x - this.args.width / 2;
        var oy = y - this.args.height / 2;
        var p = Math.sqrt(Math.pow(ox, 2) + Math.pow(oy, 2));
        var s = Math.min(this.args.width, this.args.height) / 2;
        c = Math.abs(ox / this.args.width) / 2; // d = p / s;

        r = 128 + ox * 4 * c;
        g = 128; // + (oy * 4) * d;

        b = 0;
        pixels[i + 0] = (_r = r) !== null && _r !== void 0 ? _r : 128;
        pixels[i + 1] = (_g = g) !== null && _g !== void 0 ? _g : 128;
        pixels[i + 2] = (_b = b) !== null && _b !== void 0 ? _b : 128;
        pixels[i + 3] = a !== null && a !== void 0 ? a : 255;
      }

      context.putImageData(image, 0, 0);
      displacer.toBlob(function (png) {
        return _this2.args.blob = URL.createObjectURL(png);
      }, 'image/png');
    }
  }, {
    key: "name",
    get: function get() {
      return "".concat(this.args.id); // return `filter_${this.args.id}`;
    }
  }]);

  return Cylinder;
}(_View2.View);

exports.Cylinder = Cylinder;
});

;require.register("effects/Pinch.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pinch = void 0;

var _View2 = require("curvature/base/View");

var _Tag = require("curvature/base/Tag");

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

var Pinch = /*#__PURE__*/function (_View) {
  _inherits(Pinch, _View);

  var _super = _createSuper(Pinch);

  function Pinch(args, parent) {
    var _this;

    _classCallCheck(this, Pinch);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", require('./twist.svg'));

    _this.args.scale = _this.args.scale || 0;
    _this.args.id = _this.args.id || 'pinch';
    _this.args.width = _this.args.width || 64;
    _this.args.height = _this.args.height || 64;
    return _this;
  }

  _createClass(Pinch, [{
    key: "onRendered",
    value: function onRendered() {
      var _this2 = this;

      var displacer = new _Tag.Tag("<canvas width = \"".concat(this.args.width, "\" height = \"").concat(this.args.height, "\">"));
      var context = displacer.getContext('2d');
      context.imageSmoothingEnabled = false;
      var image = context.getImageData(0, 0, this.args.width, this.args.height);
      var pixels = image.data;

      for (var i = 0; i < pixels.length; i += 4) {
        var _r, _g, _b;

        var r = void 0,
            g = void 0,
            b = void 0,
            a = void 0,
            c = void 0,
            d = 0;
        var w = i / 4;
        var y = Math.floor(w / this.args.width);
        var x = w % this.args.width;
        var ox = x - this.args.width / 2;
        var oy = y - this.args.height / 2;
        var p = Math.sqrt(Math.pow(ox, 2) + Math.pow(oy, 2));
        var ss = Math.min(this.args.width, this.args.height);
        var s = ss / 2;

        if (p < s) {
          c = Math.pow(1 - p / s, 2);
          d = Math.pow(1 - p / s, 2);
        } else {
          c = 0;
          d = 0;
        }

        r = 128 + ox * 4 * c;
        g = 128 + oy * 4 * d;
        b = 0;
        pixels[i + 0] = (_r = r) !== null && _r !== void 0 ? _r : 128;
        pixels[i + 1] = (_g = g) !== null && _g !== void 0 ? _g : 128;
        pixels[i + 2] = (_b = b) !== null && _b !== void 0 ? _b : 128;
        pixels[i + 3] = a !== null && a !== void 0 ? a : 255;
      }

      context.putImageData(image, 0, 0);
      displacer.toBlob(function (png) {
        return _this2.args.blob = URL.createObjectURL(png);
      }, 'image/png');
    }
  }, {
    key: "name",
    get: function get() {
      return "".concat(this.args.id); // return `filter_${this.args.id}`;
    }
  }]);

  return Pinch;
}(_View2.View);

exports.Pinch = Pinch;
});

;require.register("effects/Twist.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Twist = void 0;

var _View2 = require("curvature/base/View");

var _Tag = require("curvature/base/Tag");

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

var Twist = /*#__PURE__*/function (_View) {
  _inherits(Twist, _View);

  var _super = _createSuper(Twist);

  function Twist(args, parent) {
    var _this;

    _classCallCheck(this, Twist);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", require('./twist.svg'));

    _this.args.scale = _this.args.scale || 0;
    _this.args.id = _this.args.id || 'twist';
    _this.args.width = _this.args.width || 64;
    _this.args.height = _this.args.height || 64;
    _this.args.dx = 0;
    _this.args.dy = 0;
    return _this;
  }

  _createClass(Twist, [{
    key: "onRendered",
    value: function onRendered() {
      var _this2 = this;

      var displacer = new _Tag.Tag('<canvas width = "64" height = "64">');
      var context = displacer.getContext('2d');
      context.imageSmoothingEnabled = false;
      var image = context.getImageData(0, 0, 64, 64);
      var pixels = image.data;

      for (var i = 0; i < pixels.length; i += 4) {
        var _r, _g;

        var r = void 0,
            g = void 0,
            b = void 0,
            a = void 0,
            c = 1;
        var w = i / 4;
        var y = Math.floor(w / 64);
        var x = w % 64;
        var ox = x - 31.5;
        var oy = y - 31.5 - 15.5;
        var p = Math.sqrt(Math.pow(ox, 2) + Math.pow(oy, 2));

        if (p > 32) {
          c = 0;
        } else {
          c = Math.pow(1 - p / 32, 3);
        }

        r = 128 + oy * 4 * c;
        g = 128 - ox * 4 * c;
        pixels[i + 0] = (_r = r) !== null && _r !== void 0 ? _r : 0;
        pixels[i + 1] = (_g = g) !== null && _g !== void 0 ? _g : 0;
        pixels[i + 2] = b !== null && b !== void 0 ? b : 0;
        pixels[i + 3] = a !== null && a !== void 0 ? a : 255;
      }

      context.putImageData(image, 0, 0);
      displacer.toBlob(function (png) {
        return _this2.args.blob = URL.createObjectURL(png);
      }, 'image/png');
    }
  }, {
    key: "name",
    get: function get() {
      return "".concat(this.args.id); // return `filter_${this.args.id}`;
    }
  }]);

  return Twist;
}(_View2.View);

exports.Twist = Twist;
});

;require.register("effects/twist.svg", function(exports, require, module) {
module.exports = "<svg\n\theight =\"100%\"\n\twidth  =\"100%\"\n>\n\t<defs>\n\n\t\t<filter\n\t\t\tcv-ref = \"filter\"\n\t\t\tcolor-interpolation-filters=\"sRGB\"\n\t\t\theight = \"100%\"\n\t\t\twidth  = \"100%\"\n\t\t\tid     = \"[[id]]\"\n\t\t\tx      = \"0%\"\n\t\t\ty      = \"0%\"\n\n\t\t>\n\t\t\t<feFlood\n\t\t\t\tflood-color=\"#808000\"\n\t\t\t\theight = \"100%\"\n\t\t\t\twidth  = \"100%\"\n\t\t\t\tresult = \"OffsetNeutral\"\n\t\t\t\tx=\"0\"\n\t\t\t\ty=\"0\"\n\t\t\t/>\n\n\t\t\t<feImage\n\t\t\t\txlink:href=\"[[blob]]\"\n\t\t\t\tresult = \"DisplacementSource\"\n\t\t\t\theight = \"100%\"\n\t\t\t\twidth  = \"100%\"\n\t\t\t/>\n\n\t\t\t<feOffset\n\t\t\t\tin      = \"DisplacementSource\"\n\t\t\t\tresult  = \"OffsetSource\"\n\t\t\t\tcv-attr =  \"dx:dx,dy:dy\"\n\t\t\t/>\n\n\t\t\t<feComposite\n\t\t\t\toperator=\"over\"\n\t\t\t\tin2    = \"OffsetNeutral\"\n\t\t\t\tin     = \"OffsetSource\"\n\t\t\t\tresult = \"DisplacementResult\"\n\t\t\t/>\n\n\t\t\t<feDisplacementMap\n\t\t\t\txChannelSelector = \"R\"\n\t\t\t\tyChannelSelector = \"G\"\n\t\t\t\tin      = \"SourceGraphic\"\n\t\t\t\tin2     = \"DisplacementResult\"\n\t\t\t\tcv-ref  = \"displace\"\n\t\t\t\tcv-attr = \"scale:scale\"\n\t\t\t/>\n\n\t\t</filter>\n\n\t</defs>\n</svg>\n"
});

;require.register("initialize.js", function(exports, require, module) {
"use strict";

var _Tag = require("curvature/base/Tag");

var _TileMap = require("./tileMap/TileMap");

var _Viewport = require("./viewport/Viewport");

var viewportA = new _Viewport.Viewport();
document.addEventListener('DOMContentLoaded', function () {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/worker-cache.js');
  }

  var lastTime = 0;
  viewportA.render(document.body);
  var body = new _Tag.Tag(document.body);
  var skyShift = 100;
  var frameTimes = [];

  var update = function update() {
    var now = performance.now();
    var frameTime = now - lastTime;
    var frameAgeMin = 1000 / (viewportA.args.maxFps || 60);
    requestAnimationFrame(update);

    if (viewportA.args.maxFps < 60 && frameAgeMin > frameTime) {
      return;
    }

    viewportA.update();
    lastTime = now;
    frameTimes.push(frameTime);

    if (frameTimes.length > 5) {
      frameTimes.shift();
    }

    if (frameTimes.length > 1) {
      var frameTimeSum = frameTimes.reduce(function (a, b) {
        return a + b;
      });
      var frameTimeAvg = frameTimeSum / frameTimes.length;
      viewportA.args.fps = 1000 / frameTimeAvg;
    } else {
      viewportA.args.fps = '...';
    }
  };

  update();
});
});

require.register("intro/BootCard.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BootCard = void 0;

var _Card2 = require("./Card");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var BootCard = /*#__PURE__*/function (_Card) {
  _inherits(BootCard, _Card);

  var _super = _createSuper(BootCard);

  function BootCard(args, parent) {
    var _this;

    _classCallCheck(this, BootCard);

    _this = _super.call(this, args, parent);
    _this.args.cardName = 'boot-card';
    _this.args.text = "PRODUCED BY\nSEAN MORRIS UNDER\nTHE APACHE 2.0 LICENSE";
    return _this;
  }

  return BootCard;
}(_Card2.Card);

exports.BootCard = BootCard;
});

;require.register("intro/Card.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Card = void 0;

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Card = /*#__PURE__*/function (_View) {
  _inherits(Card, _View);

  var _super = _createSuper(Card);

  function Card() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var parent = arguments.length > 1 ? arguments[1] : undefined;

    _classCallCheck(this, Card);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", require('./card.html'));

    args.text = args.text || 'this is an intro card.';
    _this.args.timeout = _this.args.timeout || 1000;
    _this.args.animation = 'opening';
    return _this;
  }

  _createClass(Card, [{
    key: "play",
    value: function play(event) {
      var _this2 = this;

      this.onTimeout(50, function () {
        return _this2.args.animation = 'opened';
      });
      return new Promise(function (accept) {
        var timeAcc = _this2.args.timeout;

        if (timeAcc < 0) {
          return;
        }

        _this2.onTimeout(timeAcc - 500, function () {
          return _this2.args.animation = 'closing';
        });

        _this2.onTimeout(timeAcc, function () {
          _this2.args.animation = 'closed';
          var done = new Promise(function (acceptDone) {
            return _this2.onTimeout(timeAcc, acceptDone);
          });
          accept([done]);
        });
      });
    }
  }]);

  return Card;
}(_View2.View);

exports.Card = Card;
});

;require.register("intro/LoadingCard.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoadingCard = void 0;

var _Card2 = require("./Card");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var LoadingCard = /*#__PURE__*/function (_Card) {
  _inherits(LoadingCard, _Card);

  var _super = _createSuper(LoadingCard);

  function LoadingCard(args, parent) {
    var _this;

    _classCallCheck(this, LoadingCard);

    _this = _super.call(this, args, parent);
    _this.args.cardName = 'loading-card';
    return _this;
  }

  return LoadingCard;
}(_Card2.Card);

exports.LoadingCard = LoadingCard;
});

;require.register("intro/LogoSplash.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LogoSplash = void 0;

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

var LogoSplash = /*#__PURE__*/function (_View) {
  _inherits(LogoSplash, _View);

  var _super = _createSuper(LogoSplash);

  function LogoSplash() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var parent = arguments.length > 1 ? arguments[1] : undefined;

    _classCallCheck(this, LogoSplash);

    _this = _super.call(this, args, parent);
    _this.ringSample = new Audio('/Sonic/ring-collect.wav');
    _this.ringSample.volume = 0.50;
    _this.template = "<div class = \"splash [[animation]]\" style = \"\n\t\t\tpointer-events: [[pointerEvents]]\n\t\t\">\n\t\t\t<div class = \"center\">SEAN<span class = \"min\">MORRIS</span><div class = \"sm\">SM</div></div>\n\t\t\t<div class = \"center\">SEAN<span class = \"min\">MORRIS</span><div class = \"sm\">SM</div></div>\n\t\t\t<div class = \"center\">SEAN<span class = \"min\">MORRIS</span><div class = \"sm\">SM</div></div>\n\t\t</div>";
    return _this;
  }

  _createClass(LogoSplash, [{
    key: "onAttached",
    value: function onAttached() {
      var _this2 = this;

      if (this.alreadyAttached) {
        return;
      }

      this.alreadyAttached = true;
      this.args.left = 0;
      this.args.right = 0;
      this.args.fade = 1;
      this.args.frame = 0;
      this.args.fullFade = 1;
      this.args.pointerEvents = 'all';
      this.args.animation = 'hide';
      this.onTimeout(500, function () {
        return _this2.args.animation = 'slide';
      });
      this.onTimeout(1250, function () {
        return _this2.args.animation = 'show';
      });
      this.onTimeout(5000, function () {
        return _this2.args.animation = 'done';
      });
      this.onTimeout(1250, function () {
        return _this2.parent.args.audio && _this2.ringSample.play();
      });
    }
  }]);

  return LogoSplash;
}(_View2.View);

exports.LogoSplash = LogoSplash;
});

;require.register("intro/SeanCard.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SeanCard = void 0;

var _Card2 = require("./Card");

var _LogoSplash = require("./LogoSplash");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var SeanCard = /*#__PURE__*/function (_Card) {
  _inherits(SeanCard, _Card);

  var _super = _createSuper(SeanCard);

  function SeanCard(args, parent) {
    var _this;

    _classCallCheck(this, SeanCard);

    _this = _super.call(this, args, parent);
    _this.args.cardName = 'sean-card';
    _this.args.text = new _LogoSplash.LogoSplash({}, parent);
    return _this;
  }

  return SeanCard;
}(_Card2.Card);

exports.SeanCard = SeanCard;
});

;require.register("intro/Series.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Series = void 0;

var _View2 = require("curvature/base/View");

var _Card = require("./Card");

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

var Series = /*#__PURE__*/function (_View) {
  _inherits(Series, _View);

  var _super = _createSuper(Series);

  function Series() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var parent = arguments.length > 1 ? arguments[1] : undefined;

    _classCallCheck(this, Series);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", "<div class = \"intro-cards\" cv-each = \"cards:card:c\">[[card]]</div>");

    _this.cards = args.cards;
    _this.args.cards = [];
    _this.args.card = null;
    return _this;
  }

  _createClass(Series, [{
    key: "play",
    value: function play() {
      var _this2 = this;

      var card = this.cards.shift();
      var play = card.play();
      this.args.cards.push(card);
      var removeEarly = new Promise(function (accept) {
        return card.onRemove(accept);
      });
      return Promise.race([play, removeEarly]).then(function (done) {
        if (done) {
          Promise.all(done).then(function () {
            return card.remove();
          });
        }

        if (_this2.cards.length) {
          return _this2.play();
        } else {
          return play;
        }
      });
    }
  }, {
    key: "input",
    value: function input(controller) {
      var card = this.args.cards[this.args.cards.length - 1];

      if (card && card.input) {
        card.input(controller);
      }
    }
  }]);

  return Series;
}(_View2.View);

exports.Series = Series;
});

;require.register("intro/TitleScreenCard.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TitleScreenCard = void 0;

var _Card2 = require("./Card");

var _CharacterString = require("../ui/CharacterString");

var _MarbleGarden = require("../backdrop/MarbleGarden");

var _Keyboard = require("curvature/input/Keyboard");

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TitleScreenCard = /*#__PURE__*/function (_Card) {
  _inherits(TitleScreenCard, _Card);

  var _super = _createSuper(TitleScreenCard);

  function TitleScreenCard(args, parent) {
    var _this;

    _classCallCheck(this, TitleScreenCard);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", require('./titlescreen.html'));

    _this.args.cardName = 'title-screen-card';
    _this.args.text = '';
    _this.args.backdrop = '...';
    _this.startPressed = false;
    var backdrop = new _MarbleGarden.MarbleGarden();
    backdrop.args.frame = 0;
    backdrop.args.x = 0;
    backdrop.args.y = 140;
    backdrop.args.xMax = 10000;
    backdrop.args.yMax = 800;
    _this.started = 0;
    _this.bgm = new Audio('/Sonic/carnival-night-zone-act-2-beta.mp3');
    _this.bgm.volume = 0.5;

    _this.onRemove(function () {
      return _this.bgm.pause();
    });

    var keyBinding = _Keyboard.Keyboard.get().codes.bindTo('Enter', function (v) {
      if (!_this.started || Date.now() - _this.started < 2000) {
        return;
      }

      _this.onTimeout(200, function () {
        return _this.startPressed = true;
      });

      _this.args.animation = 'closing';

      _this.audioDebind();
    });

    _this.onRemove(keyBinding);

    _this.start = new Promise(function (accept) {
      _this.onFrame(function () {
        if (!_this.started || Date.now() - _this.started < 0) {
          return;
        }

        backdrop.args.x -= 24;
        backdrop.args.frame++;

        if (_this.startPressed) {
          var done = new Promise(function (acceptDone) {
            return _this.onTimeout(200, acceptDone);
          });
          accept([done]);
        }
      });
    });
    _this.args.backdrop = backdrop;
    _this.args.pressStart = new _CharacterString.CharacterString({
      value: 'press start/enter'
    });
    return _this;
  }

  _createClass(TitleScreenCard, [{
    key: "input",
    value: function input(controller) {
      var _this2 = this;

      if (!this.started || Date.now() - this.started < 2000) {
        return;
      }

      if (controller.buttons[9] && controller.buttons[9].time === 1) {
        this.onTimeout(200, function () {
          return _this2.startPressed = true;
        });
        this.args.animation = 'closing';
        this.audioDebind();
      }
    }
  }, {
    key: "play",
    value: function play() {
      var _this3 = this;

      this.onTimeout(1000, function () {
        _this3.audioDebind = _this3.parent.args.bindTo('audio', function (v) {
          v ? _this3.bgm.play() : _this3.bgm.pause();
        });

        _this3.onRemove(_this3.audioDebind);
      });
      this.onTimeout(1300, function () {
        return _this3.args.aurora = 'aurora';
      });
      this.started = Date.now();

      var play = _get(_getPrototypeOf(TitleScreenCard.prototype), "play", this).call(this);

      play.then(function () {
        _this3.bgm.pause();

        _this3.audioDebind();
      });
      return Promise.race([this.start, play]);
    }
  }]);

  return TitleScreenCard;
}(_Card2.Card);

exports.TitleScreenCard = TitleScreenCard;
});

;require.register("intro/card.html", function(exports, require, module) {
module.exports = "<div class = \"screen-card screen-card-[[cardName]] [[animation]]\">\n\t<span>[[text]]</span>\n</div>\n"
});

;require.register("intro/titlescreen.html", function(exports, require, module) {
module.exports = "<div class = \"screen-card screen-card-[[cardName]] [[animation]] [[aurora]]\">\n\t[[backdrop]]\n\n\t<div class = \"main-elements-container\">\n\n\t\t<div class = \"title-emblem\"></div>\n\t\t<div class = \"press-start\">[[pressStart]]</div>\n\n\t</div>\n\n</div>\n"
});

;require.register("legacy/Actor.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Actor = void 0;

var _View2 = require("curvature/base/View");

var _PointDump = require("../debug/PointDump");

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
    _this.gSpeed = 0; // this.gSpeedMax = 48;

    _this.gSpeedMax = 40;
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
      this.args.animspeed = Math.floor((this.gSpeedMax - Math.abs(g)) / 12);

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

        if (Math.abs(g) > this.gSpeedMax / 2) {
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

          leftSolid = map.getSolid(scanLX, scanLY);

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

          rightSolid = map.getSolid(scanRX, scanRY);

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
        this.falling = true;
      } else {
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

      if (this.gSpeed > -this.gSpeedMax) {
        this.gSpeed--;
      }
    }
  }, {
    key: "goRight",
    value: function goRight() {
      if (this.gSpeed < 0) {
        this.gSpeed = 0;
      }

      if (this.gSpeed < this.gSpeedMax) {
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

;require.register("network/ChatBox.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChatBox = void 0;

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ChatBox = /*#__PURE__*/function (_View) {
  _inherits(ChatBox, _View);

  var _super = _createSuper(ChatBox);

  function ChatBox(args, parent) {
    var _this;

    _classCallCheck(this, ChatBox);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", require('./chat-box.html'));

    _this.args.outputLines = [];

    var onOpen = function onOpen(event) {
      return _this.args.outputLines = ['You joined the chat.'];
    };

    var onMessage = function onMessage(event) {
      var packet = JSON.parse(event.detail);

      if (packet.message) {
        _this.args.outputLines.push("> ".concat(packet.message));

        _this.onNextFrame(function () {
          var chatOutput = _this.tags.chatOutput;
          chatOutput && chatOutput.scrollTo(0, chatOutput.scrollHeight);
        });
      }
    };

    _this.listen(args.pipe, 'open', onOpen);

    _this.listen(args.pipe, 'message', onMessage);

    return _this;
  }

  _createClass(ChatBox, [{
    key: "send",
    value: function send(event) {
      var _this2 = this;

      if (event && event.key !== 'Enter') {
        return;
      }

      var message = this.args.chatInput;

      if (!message) {
        return;
      }

      this.args.outputLines.push("< ".concat(message));
      this.args.chatInput = '';
      this.onNextFrame(function () {
        var tag = _this2.tags.chatOutput;
        tag.scrollTo(0, tag.scrollHeight);
        tag.focus();
      });
      this.args.pipe.send(JSON.stringify({
        message: message
      }));
    }
  }]);

  return ChatBox;
}(_View2.View);

exports.ChatBox = ChatBox;
});

;require.register("network/Rtc.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Rtc = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rtc = function Rtc() {
  _classCallCheck(this, Rtc);
};

exports.Rtc = Rtc;
});

;require.register("network/RtcClient.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RtcClient = void 0;

var _Mixin = require("curvature/base/Mixin");

var _EventTargetMixin = require("curvature/mixin/EventTargetMixin");

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

var RtcClient = /*#__PURE__*/function (_Mixin$with) {
  _inherits(RtcClient, _Mixin$with);

  var _super = _createSuper(RtcClient);

  function RtcClient(rtcConfig) {
    var _this;

    _classCallCheck(this, RtcClient);

    _this = _super.call(this);
    _this.peerClient = new RTCPeerConnection(rtcConfig);
    _this.peerClientChannel = _this.peerClient.createDataChannel("chat");

    _this.peerClientChannel.addEventListener('open', function () {
      var openEvent = new CustomEvent('open', {
        detail: event.data
      });
      openEvent.originalEvent = event;

      _this.dispatchEvent(openEvent);

      _this.connected = true;
    });

    _this.peerClientChannel.addEventListener('close', function () {
      var closeEvent = new CustomEvent('close', {
        detail: event.data
      });
      closeEvent.originalEvent = event;

      _this.dispatchEvent(closeEvent);

      _this.connected = false;
    });

    _this.peerClientChannel.addEventListener('message', function (event) {
      var messageEvent = new CustomEvent('message', {
        detail: event.data
      });
      messageEvent.originalEvent = event;

      _this.dispatchEvent(messageEvent);
    });

    return _this;
  }

  _createClass(RtcClient, [{
    key: "send",
    value: function send(input) {
      this.peerClientChannel && this.peerClientChannel.send(input);
    }
  }, {
    key: "close",
    value: function close() {
      this.peerClientChannel && this.peerClientChannel.close();
    }
  }, {
    key: "offer",
    value: function offer() {
      var _this2 = this;

      this.peerClient.createOffer().then(function (offer) {
        _this2.peerClient.setLocalDescription(offer);
      });
      var candidates = new Set();
      return new Promise(function (accept) {
        _this2.peerClient.addEventListener('icecandidate', function (event) {
          if (!event.candidate) {
            return;
          } else {
            candidates.add(event.candidate);
          }

          accept(_this2.peerClient.localDescription);
        });
      });
    }
  }, {
    key: "accept",
    value: function accept(answer) {
      var session = new RTCSessionDescription(answer);
      this.peerClient.setRemoteDescription(session);
    }
  }]);

  return RtcClient;
}(_Mixin.Mixin["with"](_EventTargetMixin.EventTargetMixin));

exports.RtcClient = RtcClient;
});

;require.register("network/RtcClientTask.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RtcClientTask = void 0;

var _Task2 = require("subspace-console/Task");

var _Tag = require("curvature/base/Tag");

var _RtcClient = require("./RtcClient");

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

var Accept = Symbol('accept');

var RtcClientTask = /*#__PURE__*/function (_Task) {
  _inherits(RtcClientTask, _Task);

  var _super = _createSuper(RtcClientTask);

  function RtcClientTask() {
    var _this;

    _classCallCheck(this, RtcClientTask);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'RTC Client Task');

    _defineProperty(_assertThisInitialized(_this), "connected", false);

    return _this;
  }

  _createClass(RtcClientTask, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      this.client = new _RtcClient.RtcClient({
        iceServers: [{
          urls: 'stun:stun1.l.google.com:19302'
        }, {
          urls: 'stun:stun2.l.google.com:19302'
        }]
      });
      this["finally"](function () {
        console.log('Terminating connection...');

        _this2.client.close();
      });
      this.client.addEventListener('open', function () {
        _this2.print('Remote peer client accepted!');
      });
      this.client.addEventListener('close', function () {
        _this2.print('Peer reset connection.');
      });
      this.client.addEventListener('message', function (event) {
        _this2.print("> ".concat(event.detail));
      });
      this.client.offerToken.then(function (token) {
        var tokenString = JSON.stringify(token);
        var encodedToken = "s3ktp://request/".concat(btoa(tokenString));

        _this2.print("Client request code: ".concat(encodedToken));

        var offerTag = new _Tag.Tag('<textarea style = "display:none">');
        offerTag.innerText = encodedToken;
        document.body.append(offerTag.node);
        offerTag.select();
        document.execCommand("copy");
        offerTag.node.remove();
      });
      return new Promise(function (accept) {
        _this2[Accept] = accept;
      });
    }
  }, {
    key: "main",
    value: function main(input) {
      if (!input) {
        return;
      }

      if (!this.client.connected) {
        this.accept(input);
        return;
      }

      this.print("< ".concat(input));
      this.client.send(input);
    }
  }, {
    key: "accept",
    value: function accept(answerString) {
      if (!answerString) {
        this.print("Please supply server's accept string.");
        return;
      }

      var isEncoded = /^s3ktp:\/\/accept\/(.+)/.exec(answerString);
      console.log(isEncoded);

      if (isEncoded) {
        answerString = atob(isEncoded[1]);
      }

      var answer = JSON.parse(answerString);
      this.client.accept(answer);
    }
  }]);

  return RtcClientTask;
}(_Task2.Task);

exports.RtcClientTask = RtcClientTask;

_defineProperty(RtcClientTask, "helpText", 'RTC Client.');

_defineProperty(RtcClientTask, "useText", '');
});

;require.register("network/RtcServer.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RtcServer = void 0;

var _Mixin = require("curvature/base/Mixin");

var _EventTargetMixin = require("curvature/mixin/EventTargetMixin");

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

var RtcServer = /*#__PURE__*/function (_Mixin$with) {
  _inherits(RtcServer, _Mixin$with);

  var _super = _createSuper(RtcServer);

  function RtcServer(rtcConfig) {
    var _this;

    _classCallCheck(this, RtcServer);

    _this = _super.call(this);
    _this.peerServer = new RTCPeerConnection(rtcConfig);

    _this.peerServer.addEventListener('datachannel', function (event) {
      _this.peerServerChannel = event.channel;

      _this.peerServerChannel.addEventListener('open', function () {
        var openEvent = new CustomEvent('open', {
          detail: event.data
        });
        openEvent.originalEvent = event;

        _this.dispatchEvent(openEvent);

        _this.connected = true;
      });

      _this.peerServerChannel.addEventListener('close', function () {
        var closeEvent = new CustomEvent('close', {
          detail: event.data
        });
        closeEvent.originalEvent = event;

        _this.dispatchEvent(closeEvent);

        _this.connected = false;
      });

      _this.peerServerChannel.addEventListener('message', function (event) {
        var messageEvent = new CustomEvent('message', {
          detail: event.data
        });
        messageEvent.originalEvent = event;

        _this.dispatchEvent(messageEvent);
      });
    });

    return _this;
  }

  _createClass(RtcServer, [{
    key: "send",
    value: function send(input) {
      this.peerServerChannel && this.peerServerChannel.send(input);
    }
  }, {
    key: "close",
    value: function close() {
      this.peerServerChannel && this.peerServerChannel.close();
    }
  }, {
    key: "answer",
    value: function answer(offer) {
      var _this2 = this;

      return new Promise(function (accept) {
        _this2.peerServer.setRemoteDescription(offer);

        _this2.peerServer.createAnswer(function (answer) {
          return _this2.peerServer.setLocalDescription(answer);
        }, function (error) {
          return console.error(error);
        });

        var candidates = new Set();

        _this2.peerServer.addEventListener('icecandidate', function (event) {
          if (!event.candidate) {
            return;
          } else {
            candidates.add(event.candidate);
          }

          accept(_this2.peerServer.localDescription);
        });
      });
    }
  }]);

  return RtcServer;
}(_Mixin.Mixin["with"](_EventTargetMixin.EventTargetMixin));

exports.RtcServer = RtcServer;
});

;require.register("network/RtcServerTask.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RtcServerTask = void 0;

var _Task2 = require("subspace-console/Task");

var _Tag = require("curvature/base/Tag");

var _RtcServer = require("./RtcServer");

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

var Accept = Symbol('accept');

var RtcServerTask = /*#__PURE__*/function (_Task) {
  _inherits(RtcServerTask, _Task);

  var _super = _createSuper(RtcServerTask);

  function RtcServerTask() {
    var _this;

    _classCallCheck(this, RtcServerTask);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'RTC Server Task');

    _defineProperty(_assertThisInitialized(_this), "connected", false);

    return _this;
  }

  _createClass(RtcServerTask, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      this.server = new _RtcServer.RtcServer({
        iceServers: [{
          urls: 'stun:stun1.l.google.com:19302'
        }, {
          urls: 'stun:stun2.l.google.com:19302'
        }]
      });
      this["finally"](function () {
        _this2.print('Terminating connection...');

        _this2.server.close();
      });
      this.server.addEventListener('open', function () {
        _this2.print('Remote peer client accepted!');
      });
      this.server.addEventListener('close', function () {
        _this2.print('Peer reset connection.');
      });
      this.server.addEventListener('message', function (event) {
        _this2.print("> ".concat(event.detail));
      });
      this.server.answerToken.then(function (token) {
        var tokenString = JSON.stringify(token);
        var encodedToken = "s3ktp://accept/".concat(btoa(tokenString));

        _this2.print("Server accept code: ".concat(encodedToken));

        var answerTag = new _Tag.Tag('<textarea style = "display:none">');
        answerTag.innerText = encodedToken;
        document.body.append(answerTag.node);
        answerTag.select();
        document.execCommand("copy");
        answerTag.node.remove();
      });
      this.printErr("Please supply client's request code.");
      return new Promise(function (accept) {
        _this2[Accept] = accept;
      });
    }
  }, {
    key: "main",
    value: function main(input) {
      if (!input) {
        return;
      }

      if (!this.server.connected) {
        this.answer(input);
        return;
      }

      this.print("< ".concat(input));
      this.server.send(input);
    }
  }, {
    key: "answer",
    value: function answer(offerString) {
      var isEncoded = /^s3ktp:\/\/request\/(.+)/.exec(offerString);
      console.log(isEncoded);

      if (isEncoded) {
        offerString = atob(isEncoded[1]);
      }

      var offer = JSON.parse(offerString);
      this.server.answer(offer);
    }
  }, {
    key: "done",
    value: function done() {}
  }]);

  return RtcServerTask;
}(_Task2.Task);

exports.RtcServerTask = RtcServerTask;

_defineProperty(RtcServerTask, "helpText", 'RTC Server.');

_defineProperty(RtcServerTask, "useText", '');
});

;require.register("network/chat-box.html", function(exports, require, module) {
module.exports = "<div class = \"chatbox\">\n\n\t<div class = \"chat-output\" cv-each = \"outputLines:line\" cv-ref = \"chatOutput\">\n\t\t<p>[[line]]</p>\n\t</div>\n\n\t<div class = \"chat-input\">\n\t\t<input cv-bind = \"chatInput\" cv-ref = \"chatInput\" cv-on = \"keydown:send(event)\">\n\t\t<button cv-on = \"click:send\">send</button>\n\t</div>\n\n</div>\n"
});

;require.register("powerups/BubbleSheild.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BubbleSheild = void 0;

var _Sheild2 = require("./Sheild");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var BubbleSheild = /*#__PURE__*/function (_Sheild) {
  _inherits(BubbleSheild, _Sheild);

  var _super = _createSuper(BubbleSheild);

  function BubbleSheild() {
    var _this;

    _classCallCheck(this, BubbleSheild);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", "<div class = \"sheild bubble-sheild\"><div class = \"bubble-sheild-shine\"></div></div>");

    _defineProperty(_assertThisInitialized(_this), "type", 'water');

    return _this;
  }

  return BubbleSheild;
}(_Sheild2.Sheild);

exports.BubbleSheild = BubbleSheild;
});

;require.register("powerups/ElectricSheild.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ElectricSheild = void 0;

var _Sheild2 = require("./Sheild");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ElectricSheild = /*#__PURE__*/function (_Sheild) {
  _inherits(ElectricSheild, _Sheild);

  var _super = _createSuper(ElectricSheild);

  function ElectricSheild() {
    var _this;

    _classCallCheck(this, ElectricSheild);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", "<div class = \"sheild electric-sheild\"></div>");

    _defineProperty(_assertThisInitialized(_this), "type", 'electric');

    return _this;
  }

  return ElectricSheild;
}(_Sheild2.Sheild);

exports.ElectricSheild = ElectricSheild;
});

;require.register("powerups/FireSheild.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FireSheild = void 0;

var _Sheild2 = require("./Sheild");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FireSheild = /*#__PURE__*/function (_Sheild) {
  _inherits(FireSheild, _Sheild);

  var _super = _createSuper(FireSheild);

  function FireSheild() {
    var _this;

    _classCallCheck(this, FireSheild);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", "<div class = \"sheild fire-sheild\"></div>");

    _defineProperty(_assertThisInitialized(_this), "type", 'fire');

    return _this;
  }

  return FireSheild;
}(_Sheild2.Sheild);

exports.FireSheild = FireSheild;
});

;require.register("powerups/Sheild.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sheild = void 0;

var _View2 = require("curvature/base/View");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Sheild = /*#__PURE__*/function (_View) {
  _inherits(Sheild, _View);

  var _super = _createSuper(Sheild);

  function Sheild() {
    _classCallCheck(this, Sheild);

    return _super.apply(this, arguments);
  }

  return Sheild;
}(_View2.View);

exports.Sheild = Sheild;
});

;require.register("region/Region.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Region = void 0;

var _PointActor2 = require("../actor/PointActor");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Region = /*#__PURE__*/function (_PointActor) {
  _inherits(Region, _PointActor);

  var _super = _createSuper(Region);

  _createClass(Region, null, [{
    key: "fromDef",
    value: function fromDef(objDef) {
      var obj = _get(_getPrototypeOf(Region), "fromDef", this).call(this, objDef);

      obj.args.width = objDef.width;
      obj.args.height = objDef.height;
      return obj;
    }
  }]);

  function Region() {
    var _this;

    _classCallCheck(this, Region);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.args.type = 'region';
    _this.args.width = _this["public"].width || 32;
    _this.args.height = _this["public"].height || 32;
    _this.args.gravity = 1;
    _this.args.drag = 1;
    return _this;
  }

  _createClass(Region, [{
    key: "update",
    value: function update() {
      _get(_getPrototypeOf(Region.prototype), "update", this).call(this);

      var topBoundry = -this.viewport.args.y - (this.y - this.args.height);
      var leftBoundry = -16 + -this.viewport.args.x - this.x;
      this.tags.sprite && this.tags.sprite.style({
        '--viewportWidth': this.viewport.args.width + 'px',
        '--viewportHeight': this.viewport.args.height + 'px',
        '--leftBoundry': leftBoundry + 'px',
        '--topBoundry': topBoundry + 'px'
      });
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

  return Region;
}(_PointActor2.PointActor);

exports.Region = Region;
});

;require.register("region/ShadeRegion.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShadeRegion = void 0;

var _CharacterString = require("../ui/CharacterString");

var _Cylinder = require("../effects/Cylinder");

var _Pinch = require("../effects/Pinch");

var _Region2 = require("./Region");

var _Tag = require("curvature/base/Tag");

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ShadeRegion = /*#__PURE__*/function (_Region) {
  _inherits(ShadeRegion, _Region);

  var _super = _createSuper(ShadeRegion);

  function ShadeRegion() {
    var _this;

    _classCallCheck(this, ShadeRegion);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "currentFilter", -1);

    _defineProperty(_assertThisInitialized(_this), "filters", ['studio', 'western', 'hydro', 'heat', 'frost', 'eight-bit', 'corruption' // , 'black-hole'
    , 'normal']);

    _this.args.type = 'region region-shade';
    return _this;
  }

  _createClass(ShadeRegion, [{
    key: "onAttached",
    value: function onAttached() {
      this.filterWrapper = new _Tag.Tag('<div class = "region-filter-wrapper">');
      this.colorWrapper = new _Tag.Tag('<div class = "region-color-wrapper">');
      this.filter = new _Tag.Tag('<div class = "region-filter">');
      this.color = new _Tag.Tag('<div class = "region-color">');
      this.filterWrapper.appendChild(this.filter.node);
      this.colorWrapper.appendChild(this.color.node);
      this.mainElem = this.tags.sprite.parentNode;
      this.tags.sprite.appendChild(this.filterWrapper.node);
      this.mainElem.appendChild(this.colorWrapper.node);
      this.text = new _CharacterString.CharacterString({
        value: ''
      });
      this.text.render(this.tags.sprite);
      this.cylinder = new _Cylinder.Cylinder({
        id: 'shade-cylinder',
        width: this.args.width,
        height: this.args.height
      });
      this.cylinder.render(this.tags.sprite);
      this.pinch = new _Pinch.Pinch({
        id: 'shade-pinch',
        width: this.args.width,
        height: this.args.height,
        scale: 150
      });
      this.pinch.render(this.tags.sprite); // this.args.bindTo('scale', v => {
      // 	this.pinch.args.scale = v;
      // 	this.cylinder.args.scale = v;
      // });

      this.rotateFilter();
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;

      _get(_getPrototypeOf(ShadeRegion.prototype), "update", this).call(this);

      this.args.scale = 175 - Math.abs(Math.sin(Date.now() / 200) * 25);

      if (!this["switch"] && this["public"]["switch"]) {
        this["switch"] = this.viewport.actorsById[this["public"]["switch"]];

        if (this["switch"]) {
          this["switch"].args.bindTo('active', function (v) {
            if (v) {
              _this2.rotateFilter();
            }
          });
        }
      }
    }
  }, {
    key: "rotateFilter",
    value: function rotateFilter() {
      if (this.mainElem && this["public"].filter) {
        this.mainElem.classList.remove(this["public"].filter);
      }

      if (this.mainElem) {
        this.args.filter = this.filters[this.currentFilter++];

        if (this.currentFilter >= this.filters.length) {
          this.currentFilter = 0;
        }

        this["public"].filter && this.mainElem.classList.add(this["public"].filter);

        if (this["public"].filter) {
          this.text.remove();
          this.text = new _CharacterString.CharacterString({
            value: "".concat(this.currentFilter, ": ").concat(this["public"].filter)
          });
          this.text.render(this.tags.sprite);
        }
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

  return ShadeRegion;
}(_Region2.Region);

exports.ShadeRegion = ShadeRegion;
});

;require.register("region/WaterRegion.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WaterRegion = void 0;

var _Region2 = require("./Region");

var _Tag = require("curvature/base/Tag");

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var WaterRegion = /*#__PURE__*/function (_Region) {
  _inherits(WaterRegion, _Region);

  var _super = _createSuper(WaterRegion);

  function WaterRegion() {
    var _this;

    _classCallCheck(this, WaterRegion);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "isWater", true);

    _this.args.type = 'region region-water';
    _this.entryParticle = '<div class = "particle-splash">';
    _this.args.gravity = 0.25;
    _this.args.drag = 0.85;
    _this.draining = 0;
    return _this;
  }

  _createClass(WaterRegion, [{
    key: "update",
    value: function update() {
      var _this2 = this;

      if (!this.filterWrapper && this.tags.sprite) {
        this.filterWrapper = new _Tag.Tag('<div class = "region-filter-wrapper">');
        this.colorWrapper = new _Tag.Tag('<div class = "region-color-wrapper">');
        this.filter = new _Tag.Tag('<div class = "region-filter">');
        this.color = new _Tag.Tag('<div class = "region-color">');
        this.filterWrapper.appendChild(this.filter.node);
        this.colorWrapper.appendChild(this.color.node);
        this.tags.sprite.appendChild(this.filterWrapper.node);
        this.tags.sprite.appendChild(this.colorWrapper.node);
      }

      if (!this["switch"] && this["public"]["switch"]) {
        this["switch"] = this.viewport.actorsById[this["public"]["switch"]];
        this["switch"].args.bindTo('active', function (v) {
          if (!v && _this2.draining > 0) {// this.draining = -1;
          }

          if (v) {
            _this2.draining = 1;
          }
        });
      }

      if (!this.originalHeight) {
        this.originalHeight = this["public"].height;
      }

      if (this.draining) {
        if (this.draining > 0 && this["public"].height >= 32) {
          this.args.height -= 3.5;
        } else if (this.draining < 0 && this["public"].height < this.originalHeight) {
          this.args.height += 0.5;
        }

        if (this["public"].height <= 0) {
          this.args.display = 'none';

          if (this.draining > 0) {
            this.draining = 0;
          }
        } else {
          this.args.display = 'initial';
        }
      }

      _get(_getPrototypeOf(WaterRegion.prototype), "update", this).call(this);
    }
  }, {
    key: "collideA",
    value: function collideA(other, type) {
      _get(_getPrototypeOf(WaterRegion.prototype), "collideA", this).call(this, other, type);
    }
  }, {
    key: "collideB",
    value: function collideB(other, type) {
      _get(_getPrototypeOf(WaterRegion.prototype), "collideA", this).call(this, other, type);
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

  return WaterRegion;
}(_Region2.Region);

exports.WaterRegion = WaterRegion;
});

;require.register("sprite/Png.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Png = void 0;

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

var header = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

var Pixel = /*#__PURE__*/function () {
  function Pixel() {
    var r = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var g = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var b = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var a = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

    _classCallCheck(this, Pixel);

    _defineProperty(this, "r", 0);

    _defineProperty(this, "g", 0);

    _defineProperty(this, "b", 0);

    _defineProperty(this, "a", 1);

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  _createClass(Pixel, [{
    key: "mean",
    value: function mean() {
      return (this.r + this.g + this.b) / 3;
    }
  }, {
    key: "hex",
    value: function hex() {
      var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;

      if (length === 3) {
        return "".concat(this.r.toString(16).padStart(2, '0')).concat(this.g.toString(16).padStart(2, '0')).concat(this.b.toString(16).padStart(2, '0'));
      }

      if (length === 4) {
        return "".concat(this.r.toString(16).padStart(2, '0')).concat(this.g.toString(16).padStart(2, '0')).concat(this.b.toString(16).padStart(2, '0')).concat(this.a.toString(16).padStart(2, '0'));
      }
    }
  }, {
    key: "valueOf",
    value: function valueOf() {
      return "rgba(".concat(this.r, ", ").concat(this.g, ", ").concat(this.b, ", ").concat(this.a, ")");
    }
  }]);

  return Pixel;
}();

var Chunk = /*#__PURE__*/function () {
  function Chunk() {
    _classCallCheck(this, Chunk);

    _defineProperty(this, "previous", null);

    _defineProperty(this, "content", null);

    _defineProperty(this, "length", 0);

    _defineProperty(this, "start", 0);

    _defineProperty(this, "type", '');

    _defineProperty(this, "crc", 0);
  }

  _createClass(Chunk, [{
    key: "text",
    get: function get() {
      return this.bytes.map(function (b) {
        return String.fromCharCode(b);
      }).join('');
    }
  }, {
    key: "bytes",
    get: function get() {
      var bytes = [];

      for (var i = 0; i < this.length; i++) {
        bytes.push(this.content.getUint8(i));
      }

      return bytes;
    }
  }]);

  return Chunk;
}();

var Png = /*#__PURE__*/function () {
  function Png(source) {
    var _this = this;

    _classCallCheck(this, Png);

    _defineProperty(this, "buffer", null);

    _defineProperty(this, "width", 0);

    _defineProperty(this, "height", 0);

    _defineProperty(this, "depth", 0);

    _defineProperty(this, "colorType", 0);

    _defineProperty(this, "compression", 0);

    _defineProperty(this, "filter", 0);

    _defineProperty(this, "interlace", 0);

    if (typeof source === 'string') {
      this.ready = fetch(source).then(function (response) {
        return response.arrayBuffer();
      }).then(function (buffer) {
        _this.buffer = buffer;

        _this.checkHeader();

        _this.indexChunks();
      });
    } else if (_typeof(source) === 'object') {
      if (source instanceof Png) {
        this.ready = Promise.resolve();
        this.buffer = source.buffer.slice(0);
        this.checkHeader();
        this.indexChunks();
      }
    }
  }

  _createClass(Png, [{
    key: "checkHeader",
    value: function checkHeader() {
      var bytes = new Uint8Array(this.buffer);

      for (var i in header) {
        if (header[i] !== bytes[i]) {
          throw new Error('Png is not valid.');
        }
      }
    }
  }, {
    key: "readIhdr",
    value: function readIhdr() {
      var ihdr = this.chunks[0];
      this.width = ihdr.content.getUint32(0);
      this.height = ihdr.content.getUint32(4);
      this.depth = ihdr.content.getUint8(8);
      this.colorType = ihdr.content.getUint8(9);
      this.compression = ihdr.content.getUint8(10);
      this.filter = ihdr.content.getUint8(11);
      this.interlace = ihdr.content.getUint8(12);
    }
  }, {
    key: "recolor",
    value: function recolor() {
      var colorMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var palette = this.palette;
      var newPalette = [];

      for (var i in palette) {
        var color = palette[i];
        var rgba = color.valueOf();
        var mean = color.mean();
        var hex = color.hex();

        if (colorMap[hex]) {
          var newColor = colorMap[hex];
          var newR = newColor.substring(0, 2);
          var newG = newColor.substring(2, 4);
          var newB = newColor.substring(4, 6);
          var triplet = [newR, newG, newB].map(function (x) {
            return parseInt(x, 16);
          });
          newPalette.push.apply(newPalette, _toConsumableArray(triplet));
        } else {
          newPalette.push(color.r, color.g, color.b);
        }
      }

      var newPng = new Png(this);

      for (var _i in newPng.chunks) {
        var chunk = newPng.chunks[_i];

        if (chunk.type !== 'PLTE') {
          continue;
        }

        var newBytes = new Uint8Array(newPng.buffer);
        var crcPointer = new DataView(newPng.buffer, chunk.start + chunk.length, 4);
        newBytes.set(newPalette, chunk.start);
        crcPointer.setUint32(0, newPng.runCrc(chunk));
      }

      return newPng;
    }
  }, {
    key: "runCrc",
    value: function runCrc(chunk) {
      if (!Png.crcTable) {
        Png.crcTable = new Uint32Array(256);

        for (var n = 0; n < 256; n++) {
          var c = n;

          for (var k = 0; k < 8; k++) {
            if ((c & 1) == 1) {
              c = 0xEDB88320 ^ c >>> 1;
            } else {
              c = c >>> 1;
            }
          }

          Png.crcTable[n] = c;
        }
      }

      var crc = 0xFFFFFFFF;
      var bytes = new Uint8Array(this.buffer);
      var chunkBytes = bytes.slice(chunk.start - 4, chunk.start + chunk.length);

      for (var i in chunkBytes) {
        var _byte = chunkBytes[i];
        crc = Png.crcTable[(crc ^ _byte) & 0xFF] ^ crc >>> 8;
      }

      crc = (crc ^ 0xFFFFFFFF) >>> 0;
      return crc;
    }
  }, {
    key: "indexChunks",
    value: function indexChunks() {
      var chunks = [];
      var pos = 8;

      while (pos < this.buffer.byteLength) {
        var lengthView = new DataView(this.buffer, pos, 4);
        pos += 4;
        var typeView = new DataView(this.buffer, pos, 4);
        pos += 4;
        var chunk = new Chunk();
        chunk.start = pos;
        chunk.length = lengthView.getUint32();

        for (var i = 0; i < 4; i++) {
          var _byte2 = typeView.getUint8(i);

          var _char = String.fromCharCode(_byte2);

          chunk.type += _char;
        }

        chunk.content = new DataView(this.buffer, pos, chunk.length);
        pos += chunk.length;
        var crcView = new DataView(this.buffer, pos, 4);
        chunk.crc = crcView.getUint32();
        chunk.previous = chunks[chunks.length - 1];
        chunks.push(chunk);
        pos += 4;
      }

      this.chunks = chunks;
    }
  }, {
    key: "toBlob",
    value: function toBlob() {
      return new Blob([new Uint8Array(this.buffer)], {
        type: 'image/png'
      });
    }
  }, {
    key: "toUrl",
    value: function toUrl() {
      return URL.createObjectURL(this.toBlob());
    }
  }, {
    key: "palette",
    get: function get() {
      var palette = [];

      for (var i in this.chunks) {
        var chunk = this.chunks[i];

        if (chunk.type !== 'PLTE') {
          continue;
        }

        for (var ii = 0; ii < chunk.bytes.length; ii += 3) {
          var color = new Pixel(chunk.bytes[ii + 0], chunk.bytes[ii + 1], chunk.bytes[ii + 2]);
          palette.push(color);
        }

        return palette;
      }
    }
  }]);

  return Png;
}();

exports.Png = Png;
Png.Pixel = Pixel;
Png.Chunk = Chunk;
});

require.register("tileMap/TileMap.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TileMap = void 0;

var _Tag = require("curvature/base/Tag");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TileMap = /*#__PURE__*/function () {
  function TileMap(args, parent) {
    var _this = this;

    _classCallCheck(this, TileMap);

    this.heightMask = null;
    this.tileImages = new Map();
    this.tileNumberCache = new Map();
    this.tileSetCache = new Map();
    this.heightMasks = new Map();
    this.heightMaskCache = new Map();
    this.solidCache = new Map();
    this.collisionLayers = [];
    this.destructibleLayers = [];
    this.tileLayers = [];
    this.objectLayers = [];
    var mapUrl = '/map/pixel-hill-zone.json';
    this.ready = new Promise(function (accept) {
      fetch(mapUrl).then(function (r) {
        return r.json();
      }).then(function (data) {
        Object.defineProperty(_this, 'mapData', {
          value: data
        });
        var layers = data.layers || [];
        _this.objectLayers = layers.filter(function (l) {
          return l.type === 'objectLayers';
        });
        _this.tileLayers = layers.filter(function (l) {
          return l.type === 'tilelayer';
        });
        _this.collisionLayers = _this.tileLayers.filter(function (l) {
          if (!l.name.match(/^Collision\s\d+/)) {
            return false;
          }

          return true;
        });
        _this.destructibleLayers = _this.tileLayers.filter(function (l) {
          if (!l.name.match(/^Destructible\s\d+/)) {
            return false;
          }

          return true;
        });
        var fetchImages = [];

        var _loop = function _loop(i) {
          var tileset = _this.mapData.tilesets[i];
          var image = new Image();

          _this.tileImages.set(tileset, image);

          var fetchImage = new Promise(function (accept) {
            image.addEventListener('load', function (event) {
              var heightMask = new _Tag.Tag('<canvas>');
              heightMask.width = image.width;
              heightMask.height = image.height;
              heightMask.getContext('2d').drawImage(image, 0, 0, image.width, image.height);

              _this.heightMasks.set(tileset, heightMask);

              accept(image.heightMask);
            });
          });
          image.src = '/map/' + tileset.image;
          fetchImages.push(fetchImage);
        };

        for (var i in _this.mapData.tilesets) {
          _loop(i);
        }

        Promise.all(fetchImages).then(accept);
      });
    });
  }

  _createClass(TileMap, [{
    key: "coordsToTile",
    value: function coordsToTile(x, y) {
      var blockSize = this.mapData.tilewidth;
      return [Math.floor(x / blockSize), Math.floor(y / blockSize)];
    }
  }, {
    key: "getTileNumber",
    value: function getTileNumber(x, y) {
      var layerId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var tileLayers = this.tileLayers;
      var mapData = this.mapData;

      if (x >= mapData.width || y >= mapData.height || x < 0 || y < 0) {
        if (layerId !== 0) {
          return false;
        }

        return 1;
      }

      var tileIndex = y * mapData.width + x;

      if (tileIndex in tileLayers[layerId].data) {
        var layer = tileLayers[layerId];
        var tile = layer.data[tileIndex];
        return tile > 0 ? tile - 1 : 0;
      }

      return false;
    }
  }, {
    key: "getObjectDefs",
    value: function getObjectDefs() {
      return this.mapData.layers.filter(function (layer) {
        return layer.type === 'objectgroup';
      }).map(function (layer) {
        return layer.objects;
      }).flat();
    }
  }, {
    key: "getTile",
    value: function getTile(tileNumber) {
      var blockSize = this.blockSize;
      var x = 0;
      var y = 0;
      var src = '';
      var tileset = this.getTileset(tileNumber);
      var image = this.tileImages.get(tileset);

      if (tileNumber) {
        var localTileNumber = tileNumber + -tileset.firstgid + 1;
        var blocksWide = Math.ceil(image.width / blockSize);
        x = localTileNumber % blocksWide;
        y = Math.floor(localTileNumber / blocksWide);
        src = tileset.image;
      }

      return [x, y, src];
    }
  }, {
    key: "getSolid",
    value: function getSolid(xInput, yInput) {
      var layerInput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var currentTile = this.coordsToTile(xInput, yInput);
      var tileNumber = this.getTileNumber.apply(this, _toConsumableArray(currentTile).concat([layerInput]));

      if (layerInput === 1 || layerInput === 2) {
        if (this.getSolid(xInput, yInput, 0)) {
          return true;
        }

        for (var i = 3; i < this.tileLayers.length; i++) {
          var layer = this.tileLayers[i];

          if (layer.name.substring(0, 3) === 'Art') {
            continue;
          }

          if (layer.name.substring(0, 12) === 'Destructible') {
            if (layer.destroyed) {
              continue;
            }
          }

          if (this.getSolid(xInput, yInput, i)) {
            return true;
          }
        }
      }

      if (layerInput <= 2) {
        if (tileNumber === 0) {
          return false;
        }

        if (tileNumber === 1) {
          return true;
        }
      }

      var tileSet = this.getTileset(tileNumber);
      var mapData = this.mapData;
      var blockSize = mapData.tilewidth;
      var tilePos = this.getTile(tileNumber).map(function (coord) {
        return coord * blockSize;
      });
      var x = Math.floor(Number(xInput) % blockSize);
      var y = Math.floor(Number(yInput) % blockSize);
      var xPixel = tilePos[0] + x;
      var yPixel = tilePos[1] + y;
      var heightMaskKey = [xPixel, yPixel, tileNumber].join('::');
      var heightMaskCache = this.heightMaskCache;

      if (heightMaskCache.has(heightMaskKey)) {
        return heightMaskCache.get(heightMaskKey);
      }

      var heightMask = this.heightMasks.get(tileSet);
      var pixel = heightMask.getContext('2d').getImageData(xPixel, yPixel, 1, 1).data;
      var result = false; // if(pixel[0] === 255 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 255)
      // {
      // 	// result = 0xFF0000;
      // 	result = true;
      // }
      // else

      if (pixel[3] === 255) {
        // result = 0xFFFFFF;
        result = true;
      } else {
        result = false;
      }

      heightMaskCache.set(heightMaskKey, result);
      return result;
    }
  }, {
    key: "getTileset",
    value: function getTileset(tileNumber) {
      tileNumber = Number(tileNumber);

      if (this.tileSetCache.has(tileNumber)) {
        return this.tileSetCache.get(tileNumber);
      }

      if (!this.mapData) {
        return;
      }

      for (var i in this.mapData.tilesets) {
        var tileset = this.mapData.tilesets[i]; // console.log(tileNumber, tileset.firstgid);

        if (tileNumber + 1 >= tileset.firstgid) {
          var nextTileset = this.mapData.tilesets[Number(i) + 1];
          var src = void 0;

          if (nextTileset) {
            if (tileNumber + 1 < nextTileset.firstgid) {
              this.tileSetCache.set(tileNumber, tileset);
              return tileset;
            }
          } else {
            this.tileSetCache.set(tileNumber, tileset);
            return tileset;
          }
        }
      }
    }
  }, {
    key: "blockSize",
    get: function get() {
      return this.mapData.tilewidth;
    }
  }]);

  return TileMap;
}();

exports.TileMap = TileMap;
});

;require.register("titlecard/Titlecard.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Titlecard = void 0;

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Titlecard = /*#__PURE__*/function (_View) {
  _inherits(Titlecard, _View);

  var _super = _createSuper(Titlecard);

  function Titlecard() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var parent = arguments.length > 1 ? arguments[1] : undefined;

    _classCallCheck(this, Titlecard);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", require('./titlecard.html'));

    _this.args.firstLine = args.firstLine || 'First Line';
    _this.args.secondLine = args.secondLine || 'Second Line';
    _this.args.creditLine = args.creditLine || 'Credit Line';
    _this.args.actNumber = args.actNumber || 1;
    _this.args.animation = 'start';
    return _this;
  }

  _createClass(Titlecard, [{
    key: "play",
    value: function play(event) {
      var _this2 = this;

      return new Promise(function (accept) {
        var timeAcc = 500;

        _this2.onTimeout(timeAcc, function () {
          return _this2.args.animation = '';
        });

        timeAcc += 750;

        _this2.onTimeout(timeAcc, function () {
          return _this2.args.animation = 'opening';
        });

        timeAcc += 500;

        _this2.onTimeout(timeAcc, function () {
          return _this2.args.animation = 'opening2';
        });

        _this2.onTimeout(timeAcc + 750, function () {
          accept([new Promise(function (acceptDone) {
            return _this2.onTimeout(timeAcc + 500, acceptDone);
          })]);
        });

        var finishPlaying = function finishPlaying(event) {
          timeAcc += 750;

          _this2.onTimeout(timeAcc, function () {
            return _this2.args.animation = 'closing';
          });

          timeAcc += 1000;

          _this2.onTimeout(timeAcc, function () {
            return _this2.args.animation = 'closed';
          });
        };

        if (!_this2.args.waitFor) {
          return finishPlaying();
        } else {
          return _this2.args.waitFor["finally"](finishPlaying);
        }
      });
    }
  }]);

  return Titlecard;
}(_View2.View);

exports.Titlecard = Titlecard;
});

;require.register("titlecard/titlecard.html", function(exports, require, module) {
module.exports = "<div class = \"titlecard [[animation]]\">\n\n\t<div class = \"titlecard-field\"></div>\n\n\t<div class = \"titlecard-bottom-border\">\n\t\t<div class = \"titlecard-border-text\">[[creditLine]]</div>\n\t</div>\n\n\t<div class = \"titlecard-left-border\">\n\t\t<div class = \"titlecard-border-shadow\"></div>\n\t\t<div class = \"titlecard-border-color\"></div>\n\t</div>\n\n\t<div class = \"titlecard-title\">\n\n\t\t<div class = \"titlecard-title-box\">\n\n\t\t\t<div class = \"titlecard-title-line-1\">[[firstLine]]</div>\n\n\t\t\t<div class = \"titlecard-title-line-2\">\n\t\t\t\t[[secondLine]]<div class = \"titlecard-title-number\">[[actNumber]]</div>\n\t\t\t</div>\n\n\t\t</div>\n\n\t</div>\n\n</div>\n"
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

    _defineProperty(_assertThisInitialized(_this), "template", "<div cv-ref = \"main\" class = \"hud-character-string [[hide]] [[color]]\" cv-each = \"chars:char:c\" style = \"--scale:[[scale]];\"><span\n\t\t\t\tclass = \"hud-character\"\n\t\t\t\tdata-type  = \"[[char.type]]\"\n\t\t\t\tdata-value = \"[[char.pos]]\"\n\t\t\t\tdata-index = \"[[c]]\"\n\t\t\t\tstyle      = \"--value:[[char.pos]];--index:[[c]];--length:[[chars.length]];\"\n\t\t\t>[[char.original]]</span></div>");

    _this.args.chars = [];
    _this.args.scale = _this.args.scale || 1;

    _this.args.bindTo('value', function (v) {
      if (Math.abs(v) > _this.args.high) {
        _this.args.color = 'red';
      } else if (Math.abs(v) > _this.args.med) {
        _this.args.color = 'orange';
      } else if (Math.abs(v) > _this.args.low) {
        _this.args.color = 'yellow';
      } // else if(this.args.flash > 0)
      // {
      // 	this.args.color = this.args.flashColor;
      // }
      else {
          _this.args.color = '';
        }

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

            case '/':
              pos = 13;
              type = 'number';
              break;

            case ' ':
              pos = 14;
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

;require.register("ui/ClickSwitch.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClickSwitch = void 0;

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ClickSwitch = /*#__PURE__*/function (_View) {
  _inherits(ClickSwitch, _View);

  var _super = _createSuper(ClickSwitch);

  function ClickSwitch() {
    var _this;

    _classCallCheck(this, ClickSwitch);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", require('./click-switch.html'));

    return _this;
  }

  _createClass(ClickSwitch, [{
    key: "toggle",
    value: function toggle() {
      this.args.active = !this.args.active;
    }
  }]);

  return ClickSwitch;
}(_View2.View);

exports.ClickSwitch = ClickSwitch;
});

;require.register("ui/HudFrame.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HudFrame = void 0;

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

var HudFrame = /*#__PURE__*/function (_View) {
  _inherits(HudFrame, _View);

  var _super = _createSuper(HudFrame);

  function HudFrame() {
    var _this;

    _classCallCheck(this, HudFrame);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "template", "<div class = \"hud-frame [[type]] [[alert]]\">\n\t\t<div class = \"hud-value\">[[value]]</div>\n\t</div>");

    return _this;
  }

  return HudFrame;
}(_View2.View);

exports.HudFrame = HudFrame;
});

;require.register("ui/click-switch.html", function(exports, require, module) {
module.exports = "<div class = \"switch\" data-active = \"[[active]]\"  cv-on = \"click:toggle(event)\">\n\n\t<div class = \"label labelOff\">\n\t\t<img src = \"/ui/mute.svg\" />\n\t</div>\n\n\t<div class = \"slide\">\n\t\t<div class = \"head\"></div>\n\t</div>\n\n\t<div class = \"label labelOn\">\n\t\t<img src = \"/ui/unmute.svg\" />\n\t</div>\n\n</div>\n"
});

;require.register("viewport/Layer.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Layer = void 0;

var _View2 = require("curvature/base/View");

var _Tag = require("curvature/base/Tag");

var _Bag = require("curvature/base/Bag");

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

var Layer = /*#__PURE__*/function (_View) {
  _inherits(Layer, _View);

  var _super = _createSuper(Layer);

  function Layer(args, parent) {
    var _this;

    _classCallCheck(this, Layer);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "template", require('./layer.html'));

    _this.args.width = 320;
    _this.args.height = 200;
    _this.args.blockSize = 32;
    _this.x = 0;
    _this.y = 0;
    _this.args.offsetX = 0;
    _this.args.offsetY = 0;
    _this.args.layerId = 0 || _this.args.layerId;
    Object.defineProperty(_assertThisInitialized(_this), 'blocksXY', {
      value: {}
    });
    Object.defineProperty(_assertThisInitialized(_this), 'blocks', {
      value: new _Bag.Bag()
    });
    Object.defineProperty(_assertThisInitialized(_this), 'offsets', {
      value: new Map()
    });
    Object.defineProperty(_assertThisInitialized(_this), 'blockSrcs', {
      value: new Map()
    });
    _this.args.blocks = _this.blocks.list;
    return _this;
  }

  _createClass(Layer, [{
    key: "update",
    value: function update(tileMap, xDir, yDir) {
      var viewport = this.args.viewport;

      if (this.args.destroyed && this.tags.background) {
        var _tileMap = viewport.tileMap;
        var _layerId = this.args.layerId;
        var layers = _tileMap.tileLayers;
        var layerDef = layers[_layerId];
        layerDef.destroyed = true;
        this.tags.background.style({
          display: 'none'
        });
        return;
      }

      var blockSize = this.args.blockSize;
      var blocksWide = Math.ceil(this.args.width / blockSize);
      var blocksHigh = Math.ceil(this.args.height / blockSize);
      var blocksXY = this.blocksXY;
      var blocks = this.blocks;
      var offsets = this.offsets;
      var blockSrcs = this.blockSrcs;
      var offsetX = this.args.offsetX;
      var offsetY = this.args.offsetY;
      var layerId = this.args.layerId;
      var startColumn = 0;
      var endColumn = blocksWide;

      for (var i = startColumn; i <= endColumn; i += Math.sign(blocksWide)) {
        var tileX = i - Math.ceil(this.x / blockSize);

        for (var j = 0; j <= blocksHigh; j += Math.sign(blocksHigh)) {
          var xy = [i, j].join('::');
          var tileY = j - Math.ceil(this.y / blockSize);
          var blockId = tileMap.getTileNumber(tileX, tileY, layerId);
          var block = void 0;

          if (!blocksXY[xy]) {
            blocksXY[xy] = new _Tag.Tag('<div>');
            block = blocksXY[xy];
            block.style({
              width: blockSize + 'px',
              height: blockSize + 'px'
            });
            var transX = blockSize * i;
            var transY = blockSize * j;
            var src = block[2];
            block.style({
              transform: "translate(".concat(transX, "px, ").concat(transY, "px)"),
              'background-image': "url(/map/".concat(src, ")"),
              position: 'absolute',
              left: 0,
              top: 0
            });
            blocks.add(block);
          } else {
            block = blocksXY[xy];
          }

          var tileXY = [];

          if (layerId && blockId === false) {
            tileXY[0] = -1;
            tileXY[1] = -1;
          } else {
            tileXY = tileMap.getTile(blockId);
          }

          var existingOffset = offsets.get(block);
          var existingSrc = blockSrcs.get(block);
          var blockOffset = -1 * (tileXY[0] * blockSize) + 'px ' + -1 * (tileXY[1] * blockSize) + 'px';
          var blockSrc = tileXY[2];

          if (existingOffset !== blockOffset || existingSrc !== blockSrc) {
            if (blockId !== false && blockId !== 0) {
              block.style({
                display: 'initial',
                'background-position': blockOffset,
                'background-image': "url(/map/".concat(blockSrc, ")")
              });
            } else {
              block.style({
                display: 'none'
              });
            }
          }

          offsets.set(block, blockOffset);
          blockSrcs.set(block, blockSrc);
        }
      }
    }
  }]);

  return Layer;
}(_View2.View);

exports.Layer = Layer;
});

;require.register("viewport/Viewport.js", function(exports, require, module) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Viewport = void 0;

var _Bindable = require("curvature/base/Bindable");

var _Bag = require("curvature/base/Bag");

var _Tag = require("curvature/base/Tag");

var _View2 = require("curvature/base/View");

var _Keyboard = require("curvature/input/Keyboard");

var _TileMap = require("../tileMap/TileMap");

var _Titlecard = require("../titlecard/Titlecard");

var _MarbleGarden = require("../backdrop/MarbleGarden");

var _Series = require("../intro/Series");

var _Card = require("../intro/Card");

var _TitleScreenCard = require("../intro/TitleScreenCard");

var _LoadingCard = require("../intro/LoadingCard");

var _BootCard = require("../intro/BootCard");

var _SeanCard = require("../intro/SeanCard");

var _PauseMenu = require("../Menu/PauseMenu.js");

var _MainMenu = require("../Menu/MainMenu.js");

var _LayerSwitch = require("../actor/LayerSwitch");

var _Region = require("../region/Region");

var _CharacterString = require("../ui/CharacterString");

var _HudFrame = require("../ui/HudFrame");

var _Layer = require("./Layer");

var _Controller = require("../controller/Controller");

var _ObjectPalette = require("../ObjectPalette");

var _ClickSwitch = require("../ui/ClickSwitch");

var _Console = require("subspace-console/Console");

var _Input = require("../console/task/Input");

var _Impulse = require("../console/task/Impulse");

var _Move = require("../console/task/Move");

var _Pos = require("../console/task/Pos");

var _RtcClientTask = require("../network/RtcClientTask");

var _RtcServerTask = require("../network/RtcServerTask");

var _RtcClient = require("../network/RtcClient");

var _RtcServer = require("../network/RtcServer");

var _Classifier = require("../Classifier");

var _ChatBox = require("../network/ChatBox");

var _Sonic = require("../actor/Sonic");

var _Tails = require("../actor/Tails");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

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

var ColCellsNear = Symbol('collision-cells-near');
var ColCell = Symbol('collision-cell');

var Viewport = /*#__PURE__*/function (_View) {
  _inherits(Viewport, _View);

  var _super = _createSuper(Viewport);

  function Viewport(args, parent) {
    var _this;

    _classCallCheck(this, Viewport);

    _this = _super.call(this, args, parent);

    _defineProperty(_assertThisInitialized(_this), "secretSample", new Audio('/doom/dssecret.wav'));

    _defineProperty(_assertThisInitialized(_this), "secretsFound", new Set());

    _defineProperty(_assertThisInitialized(_this), "template", require('./viewport.html'));

    _this.server = null;
    _this.client = null;
    _this.args.networked = false;
    _this.settings = {
      blur: true,
      displace: true
    };
    _this.vizi = true;
    _this.args.level = '';
    Object.defineProperty(_assertThisInitialized(_this), 'tileMap', {
      value: new _TileMap.TileMap()
    });
    _this.sprites = new _Bag.Bag();
    _this.world = null;
    var ready = _this.tileMap.ready;
    _this.args.titlecard = new _Series.Series({
      cards: _this.introCards()
    });
    _this.args.pauseMenu = new _PauseMenu.PauseMenu({}, _assertThisInitialized(_this));
    _this.particles = new _Bag.Bag();
    _this.effects = new _Bag.Bag();
    _this.args.particles = _this.particles.list;
    _this.args.effects = _this.effects.list;
    _this.args.maxFps = 60;
    _this.args.currentActor = '';
    _this.args.xOffset = 0.5;
    _this.args.yOffset = 0.5;
    _this.args.xOffsetTarget = 0.5;
    _this.args.yOffsetTarget = 0.75;
    _this.args.topLine = new _CharacterString.CharacterString({
      value: '',
      scale: 2
    });
    _this.args.status = new _CharacterString.CharacterString({
      value: '',
      scale: 2
    });
    _this.args.focusMe = new _CharacterString.CharacterString({
      value: '',
      scale: 2
    });
    _this.args.labelChar = new _CharacterString.CharacterString({
      value: 'Char: '
    });
    _this.args.labelX = new _CharacterString.CharacterString({
      value: 'x pos: '
    });
    _this.args.labelY = new _CharacterString.CharacterString({
      value: 'y pos: '
    });
    _this.args.labelGround = new _CharacterString.CharacterString({
      value: 'Grounded: '
    });
    _this.args.labelAngle = new _CharacterString.CharacterString({
      value: 'Gnd theta: '
    });
    _this.args.labelGSpeed = new _CharacterString.CharacterString({
      value: 'speed: '
    });
    _this.args.labelXSpeed = new _CharacterString.CharacterString({
      value: 'X air spd: '
    });
    _this.args.labelYSpeed = new _CharacterString.CharacterString({
      value: 'Y air spd: '
    });
    _this.args.labelMode = new _CharacterString.CharacterString({
      value: 'Mode: '
    });
    _this.args.labelFrame = new _CharacterString.CharacterString({
      value: 'Frame ID: '
    });
    _this.args.labelFps = new _CharacterString.CharacterString({
      value: 'FPS: '
    });
    _this.args.labelAirAngle = new _CharacterString.CharacterString({
      value: 'Air theta: '
    });
    _this.args["char"] = new _CharacterString.CharacterString({
      value: '...'
    });
    _this.args.xPos = new _CharacterString.CharacterString({
      value: 0
    });
    _this.args.yPos = new _CharacterString.CharacterString({
      value: 0
    });
    _this.args.gSpeed = new _CharacterString.CharacterString({
      value: 0,
      high: 199,
      med: 99,
      low: 49
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
    _this.args.nowPlaying = new _CharacterString.CharacterString({
      value: 'Now playing'
    });
    _this.args.trackName = new _CharacterString.CharacterString({
      value: 'Ice cap zone act 1 theme'
    });
    _this.args.fpsSprite = new _CharacterString.CharacterString({
      value: 0
    });
    _this.args.frame = new _CharacterString.CharacterString({
      value: 0
    });
    _this.rings = new _CharacterString.CharacterString({
      value: 0
    });
    _this.coins = new _CharacterString.CharacterString({
      value: 0
    });
    _this.emeralds = new _CharacterString.CharacterString({
      value: '0/7'
    });
    _this.args.emeralds = new _HudFrame.HudFrame({
      value: _this.emeralds,
      type: 'emerald-frame'
    });
    _this.args.timer = new _HudFrame.HudFrame({
      value: new _CharacterString.CharacterString({
        value: '00:00.00'
      })
    });
    _this.args.rings = new _HudFrame.HudFrame({
      value: _this.rings,
      type: 'ring-frame'
    });
    _this.args.coins = new _HudFrame.HudFrame({
      value: _this.coins,
      type: 'coin-frame'
    }); // this.args.bindTo('frameId', v => this.args.frame.args.value = Number(v) );

    _this.args.bindTo('fps', function (v) {
      return _this.args.fpsSprite.args.value = Number(v).toFixed(2);
    });

    _this.args.frameId = -1; // this.controlCard = View.from(require('../cards/basic-controls.html'));
    // this.moveCard    = View.from(require('../cards/basic-moves.html'));

    _this.args.blockSize = 32;
    _this.args.populated = false;
    _this.args.willStick = false;
    _this.args.stayStuck = false;
    _this.args.willStick = true;
    _this.args.stayStuck = true;
    _this.args.width = 32 * 14;
    _this.args.height = 32 * 8;
    _this.args.scale = 2; // this.args.width  = 32 * 14 * 2;
    // this.args.height = 32 * 8  * 2;
    // this.args.scale  = 1;

    _this.collisions = new WeakMap();
    _this.args.x = _this.args.x || 0;
    _this.args.y = _this.args.y || 0;
    _this.args.layers = [];
    _this.args.animation = '';
    _this.regions = new Set();
    _this.spawn = new Set();
    _this.auras = new Set();
    _this.actorsById = {};
    _this.playable = new Set();
    _this.actors = new _Bag.Bag(function (i, s, a) {
      if (a == _Bag.Bag.ITEM_ADDED) {
        i.viewport = _assertThisInitialized(_this);

        _this.setColCell(i);

        if (i instanceof _Region.Region) {
          _this.regions.add(i);
        }

        if (i.controllable) {
          _this.playable.add(i);
        }

        _this.actorsById[i.args.id] = i;

        _this.objectDb.add(i);
      } else if (a == _Bag.Bag.ITEM_REMOVED) {
        i.viewport = null;
        i.remove();

        if (i[ColCell]) {
          _this.playable["delete"](i);

          i[ColCell]["delete"](i);
        }

        if (i instanceof _Region.Region) {
          _this.regions["delete"](i);
        }

        _this.auras["delete"](i);

        delete i.controllable[i.args.name];
        delete _this.actorsById[i.args.id];
        delete i[ColCell];

        _this.objectDb.remove(i);
      }
    });
    var critiera = [/^Art\s+$/, /^Collision\s+$/, /^Destructible\s+$/];

    var comparator = function comparator() {};

    _this.layerDb = new _Classifier.Classifier(critiera, comparator);
    _this.objectDb = new _Classifier.Classifier(Object.values(_ObjectPalette.ObjectPalette));
    _this.blocks = new _Bag.Bag();
    _this.args.blocks = _this.blocks.list;
    _this.args.actors = _this.actors.list;

    _this.listen(window, 'gamepadconnected', function (event) {
      return _this.padConnected(event);
    });

    _this.listen(window, 'gamepaddisconnected', function (event) {
      return _this.padRemoved(event);
    });

    _this.colCellCache = new Map();
    _this.colCellDiv = _this.args.width > _this.args.height ? _this.args.width * 0.6 : _this.args.height * 0.6;
    _this.colCells = new Set();
    _this.actorPointCache = new Map();
    _this.startTime = null;
    _this.args.audio = true;
    _this.nextControl = false;
    _this.args.controllable = {};
    _this.updateStarted = new Set();
    _this.updateEnded = new Set();
    _this.updated = new Set();
    _this.args.xBlur = 0;
    _this.args.yBlur = 0; // this.args.controlCard = View.from(require('../cards/sonic-controls.html'));

    _this.args.controlCard = _View2.View.from(require('../cards/basic-controls.html'));
    _this.args.moveCard = _View2.View.from(require('../cards/basic-moves.html'));
    _this.args.isRecording = false;
    _this.args.isReplaying = false;
    _this.replayInputs = []; // this.replayInputs = JSON.parse(localStorage.getItem('replay')) || [];

    _this.args.standalone = '';
    _this.args.fullscreen = '';
    _this.args.initializing = 'initializing';
    _this.args.muteSwitch = new _ClickSwitch.ClickSwitch();
    _this.args.muteSwitch.args.active = !!JSON.parse(localStorage.getItem('sonic-3000-audio-enabled') || 0);

    _this.args.muteSwitch.args.bindTo('active', function (v) {
      return _this.args.audio = v;
    });

    _this.args.bindTo('audio', function (v) {
      localStorage.setItem('sonic-3000-audio-enabled', v);
    });

    _this.args.showConsole = null;

    _this.listen(document, 'keydown', function (event) {
      if (event.key === 'F10') {
        if (!_this.args.subspace) {
          _this.args.subspace = new _Console.Console({
            scroller: _this.tags.subspace,
            path: {
              'input': _Input.Input,
              'move': _Move.Move,
              'impulse': _Impulse.Impulse,
              'pos': _Pos.Pos,
              'client': _RtcClientTask.RtcClientTask,
              'server': _RtcServerTask.RtcServerTask
            }
          }); // this.args.subspace.tasks.bindTo((v,k) => {
          // 	console.log(k,v);
          // });
        }

        _this.args.showConsole = _this.args.showConsole ? null : 'showConsole';
        event.preventDefault();
      }
    });

    _this.args.bindTo('showConsole', function (v) {
      if (!_this.args.subspace) {
        return;
      }

      if (v) {
        _this.onNextFrame(function () {
          return _this.args.subspace.focus();
        });

        _this.args.showConsole = 'showConsole';
      } else {
        _this.onNextFrame(function () {
          return _this.tags.viewport.focus();
        });

        _this.args.showConsole = null;
      }
    });

    _this.controller = new _Controller.Controller({
      deadZone: 0.2
    });

    _this.controller.zero();

    return _this;
  }

  _createClass(Viewport, [{
    key: "fullscreen",
    value: function fullscreen() {
      var _this2 = this;

      if (document.fullscreenElement) {
        document.exitFullscreen();
        this.showStatus(3000, ' hit escape to revert. ');
        this.showStatus(0, '');
        this.args.focusMe.args.hide = '';
        this.args.fullscreen = '';
        return;
      }

      this.args.focusMe.args.hide = 'hide';
      this.initScale = this.args.scale;
      this.showStatus(3500, ' hit escape to revert. ');
      this.tags.viewport.node.requestFullscreen().then(function (res) {
        _this2.onTimeout(100, function () {
          _this2.fitScale();

          _this2.args.fullscreen = 'fullscreen';
        });
      })["catch"](function (e) {
        return console.error(e);
      });
    }
  }, {
    key: "fitScale",
    value: function fitScale() {
      var fill = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var hScale = window.innerHeight / this.args.height;
      var vScale = window.innerWidth / this.args.width;

      if (fill) {
        this.args.scale = hScale > vScale ? hScale : vScale;
      } else {
        this.args.scale = hScale > vScale ? vScale : hScale;
      }

      this.tags.frame && this.tags.frame.style({
        '--width': this.args.width,
        '--height': this.args.height,
        '--scale': this.args.scale
      });
    }
  }, {
    key: "showStatus",
    value: function showStatus(timeout, text) {
      var _this3 = this;

      this.args.status.args.hide = '';
      this.args.status.args.value = text;

      if (timeout >= 0) {
        this.onTimeout(timeout, function () {
          _this3.args.status.args.hide = 'hide';
        });
      }
    }
  }, {
    key: "onAttached",
    value: function onAttached(event) {
      var _this4 = this;

      _Impulse.Impulse.viewport = this;
      _Input.Input.viewport = this;
      _Move.Move.viewport = this;
      _Pos.Pos.viewport = this;
      this.onTimeout(8800, function () {
        _this4.args.focusMe.args.value = ' Click here to enable keyboard control. ';
      });
      this.tags.blurDistance.setAttribute('style', "filter:url(#motionBlur)");
      this.listen(this.tags.frame, 'click', function (event) {
        if (event.target === _this4.tags.frame.node) {
          _this4.tags.viewport.focus();
        }
      });
      this.listen(document, 'fullscreenchange', function (event) {
        if (!document.fullscreenElement) {
          _this4.args.scale = _this4.initScale;
          _this4.args.fullscreen = '';
          return;
        }
      });
      this.args.titlecard.play().then(function (done) {
        _this4.startLevel();

        _this4.update();
      });
      this.tags.frame.style({
        '--width': this.args.width,
        '--height': this.args.height,
        '--scale': this.args.scale
      });
      this.update();

      if (!this.startTime) {
        this.startTime = 0;
      }

      this.args.started = false;
      this.args.paused = true;
      this.listen(document.body, 'click', function (event) {
        if (event.target !== document.body) {
          return;
        }

        _this4.tags.viewport.focus();
      });
      this.args.scale = this.args.scale || 1;

      var keyboard = _Keyboard.Keyboard.get();

      keyboard.listening = true;
      keyboard.focusElement = this.tags.viewport.node;

      if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches) {
        this.args.standalone = 'standalone';
        document.title = 'Sonic 3000';
        this.listen(window, 'resize', function () {
          return _this4.fitScale(false);
        });
        this.onTimeout(100, function () {
          return _this4.fitScale(false);
        });
      }

      this.onTimeout(100, function () {
        return _this4.args.initializing = '';
      });
    }
  }, {
    key: "startLevel",
    value: function startLevel() {
      var _this5 = this;

      this.args.started = true;
      this.args.paused = false;
      this.args.level = 'level';
      this.args.backdrop = new _MarbleGarden.MarbleGarden();
      this.tileMap.ready.then(function () {
        if (_this5.args.populated) {
          return;
        }

        if (_this5.args.networked) {
          var sonic = new _Sonic.Sonic({
            name: 'Player 1',
            x: 1500,
            y: 1600
          });
          var tails = new _Tails.Tails({
            name: 'Player 2',
            x: 1400,
            y: 1600
          });
          sonic.render(_this5.tags.actors);
          tails.render(_this5.tags.actors);

          _this5.auras.add(sonic);

          _this5.auras.add(tails);

          _this5.actors.add(sonic);

          _this5.actors.add(tails);
        }

        _this5.populateMap();

        if (!_this5.args.networked) {
          var actors = _this5.actors.list;

          if (!_this5.playableIterator) {
            _this5.playableIterator = _this5.playable.entries();

            _this5.playableIterator.next();
          }

          _this5.nextControl = _this5.nextControl || actors[0];
        } else if (_this5.args.networked) {
          var _actors = _this5.actors.list;
          _this5.nextControl = _this5.nextControl || _actors[-1 + _this5.args.playerId];
        }

        _this5.startTime = Date.now();
      });
    }
  }, {
    key: "takeInput",
    value: function takeInput(controller) {
      var keyboard = _Keyboard.Keyboard.get();

      keyboard.update();

      if (!this.gamepad) {
        controller.readInput({
          keyboard: keyboard
        });
      } else {
        var gamepads = navigator.getGamepads();

        for (var i = 0; i < gamepads.length; i++) {
          var gamepad = gamepads.item(i);

          if (!gamepad) {
            continue;
          }

          controller.readInput({
            keyboard: keyboard,
            gamepad: gamepad
          });

          if (gamepad) {
            var gamepadId = String(gamepad.id);

            if (gamepadId.match(/xbox/i)) {
              this.args.inputName = 'xbox controller & keyboard';
              this.args.inputType = 'input-xbox';
            } else {
              this.args.inputName = 'playstation controller & keyboard';
              this.args.inputType = 'input-playstation';
            }
          } else {
            this.args.inputName = 'keyboard';
            this.args.inputType = '';
          }
        }
      }

      if (controller.buttons[1011] && controller.buttons[1011].time === 1) {
        this.fullscreen();
      }

      if (!this.args.networked && !this.args.paused) {
        if (!this.dontSwitch && controller.buttons[11] && controller.buttons[11].time === 1) {
          this.playableIterator = this.playableIterator || this.playable.entries();
          var next = this.playableIterator.next();

          if (next.done) {
            this.playableIterator = false;
            this.playableIterator = this.playable.entries();
            next = this.playableIterator.next();
          }

          if (next.value) {
            this.nextControl = next.value[0];
            this.dontSwitch = 3;
          }
        }
      }

      if (this.args.started) {
        if (this.controlActor) {
          this.args.currentSheild = this.controlActor["public"].currentSheild ? this.controlActor["public"].currentSheild.type : '';
        }

        if (controller.buttons[9] && controller.buttons[9].active && controller.buttons[9].time === 1) {
          this.args.paused = !this.args.paused;
          this.focus();
        }

        if (this.controlActor && this.args.isRecording) {
          var frame = this.args.frameId;
          var input = controller.serialize();

          var args = _defineProperty({}, this.controlActor["public"].id, {
            x: this.controlActor["public"].x,
            y: this.controlActor["public"].y,
            gSpeed: this.controlActor["public"].gSpeed,
            xSpeed: this.controlActor["public"].xSpeed,
            ySpeed: this.controlActor["public"].ySpeed
          });

          this.replayInputs.push({
            frame: frame,
            input: input,
            args: args
          });
        }
      }

      controller.update();
    }
  }, {
    key: "moveCamera",
    value: function moveCamera() {
      if (!this.controlActor) {
        return;
      }

      var cameraSpeed = 15;
      var highJump = this.controlActor["public"].highJump;
      var deepJump = this.controlActor["public"].deepJump;
      var falling = this.controlActor["public"].falling;
      var fallSpeed = this.controlActor["public"].ySpeed;

      if (this.controlActor.args.cameraMode == 'airplane') {
        this.args.yOffsetTarget = 0.5;
        this.args.xOffsetTarget = -this.controlActor.args.direction * 0.35 + 0.5;
      } else if (this.controlActor.args.mode === 2) {
        this.args.xOffsetTarget = 0.5;
        this.args.yOffsetTarget = 0.25;
      } else if (!falling && this.controlActor.args.mode) {
        this.args.yOffsetTarget = 0.5;
      } else if (this.controlActor.args.cameraMode == 'normal') {
        this.args.xOffsetTarget = 0.5;
        this.args.yOffsetTarget = 0.75;

        if (!falling) {
          cameraSpeed = 10;
        }
      } else if ((deepJump || highJump) && fallSpeed > 0) {
        this.args.xOffsetTarget = 0.5;
        this.args.yOffsetTarget = 0.25;
      } else if ((deepJump || highJump) && fallSpeed < 0) {
        this.args.xOffsetTarget = 0.5;
        this.args.yOffsetTarget = 0.75;
      } else {
        this.args.xOffsetTarget = 0.5;
        this.args.yOffsetTarget = 0.75;
        cameraSpeed = 25;
      }

      var xNext = -this.controlActor.x + this.args.width * this.args.xOffset;
      var yNext = -this.controlActor.y + this.args.height * this.args.yOffset;
      var jumping = this.controlActor["public"].jumping;
      var dragSpeedX = 2;
      var dragSpeedY = this.args.jumping && this.args.ySpeed < 0 ? 0.25 : 3;
      var maxDragX = 128;
      var maxDragYDown = 64;
      var maxDragY = 16;
      this.args.x = xNext;

      if (this.args.x !== xNext) {
        var drag = this.args.x - xNext;
        var abs = Math.abs(drag);
        var step = drag / 64;

        if (abs > maxDragX) {
          this.args.x -= Math.sign(drag) * maxDragX;
        } else if (Math.abs(step) < 1) {
          this.args.x = step * dragSpeedX;
        } else {
          this.args.x = xNext;
        }
      }

      if (this.args.y < yNext) {
        var _drag = this.args.y - yNext;

        var _abs = Math.abs(_drag);

        var _step = _drag / 128;

        if (_abs > maxDragYDown) {
          this.args.y = yNext + maxDragYDown * Math.sign(_drag);
        } else if (Math.abs(_step) < 1) {
          this.args.y -= _step * dragSpeedY;
        } else {
          this.args.y = yNext;
        }
      }

      if (this.args.y > yNext) {
        this.args.y = yNext;

        var _drag2 = this.args.y - yNext;

        var _abs2 = Math.abs(_drag2);

        var _step2 = _drag2 / 128;

        if (_abs2 > maxDragY) {
          this.args.y = yNext + maxDragY * Math.sign(_drag2);
        } else if (Math.abs(_step2) > 1) {
          this.args.y -= _step2 * dragSpeedY;
        } else {
          this.args.y = yNext;
        }
      }

      if (Math.abs(this.args.yOffsetTarget - this.args.yOffset) < 0.01) {
        this.args.yOffset = this.args.yOffsetTarget;
      } else {
        this.args.yOffset += (this.args.yOffsetTarget - this.args.yOffset) / cameraSpeed;
      }

      if (Math.abs(this.args.xOffsetTarget - this.args.xOffset) < 0.01) {
        this.args.xOffset = this.args.xOffsetTarget;
      } else {
        this.args.xOffset += (this.args.xOffsetTarget - this.args.xOffset) / cameraSpeed;
      }

      if (this.args.x > 96) {
        this.args.x = 96;
      }

      if (this.args.y > 96) {
        this.args.y = 96;
      }

      var xMax = -(this.tileMap.mapData.width * 32) + this.args.width - 96;
      var yMax = -(this.tileMap.mapData.height * 32) + this.args.height - 96;

      if (this.args.x < xMax) {
        this.args.x = xMax;
      }

      if (this.args.y < yMax) {
        this.args.y = yMax;
      }
    }
  }, {
    key: "updateBackground",
    value: function updateBackground() {
      var layers = this.tileMap.tileLayers;
      var layerCount = layers.length;
      var controlActor = this.controlActor;

      if (controlActor && controlActor.standingOn && controlActor.standingOn.isVehicle) {
        controlActor = this.controlActor.standingOn;
      }

      if (this.settings.blur && controlActor && this.tags.blur) {
        var xBlur = Math.pow(Number((controlActor.x - this.xPrev) * 100 / 500), 2).toFixed(2);
        var yBlur = Math.pow(Number((controlActor.y - this.yPrev) * 100 / 500), 2).toFixed(2);
        var blurAngle = Number(controlActor.realAngle + Math.PI).toFixed(2);
        var maxBlur = 32;
        xBlur = xBlur < maxBlur ? xBlur : maxBlur;
        yBlur = yBlur < maxBlur ? yBlur : maxBlur;
        var blur = (Math.sqrt(Math.pow(xBlur, 2) + Math.pow(yBlur, 2)) / 4).toFixed(2);

        if (blur > 1) {
          if (controlActor["public"].falling) {
            blurAngle = Math.atan2(controlActor["public"].ySpeed, controlActor["public"].xSpeed);
          }

          this.tags.blurAngle.setAttribute('style', "transform:rotate(calc(1rad * ".concat(blurAngle, "))"));
          this.tags.blurAngleCancel.setAttribute('style', "transform:rotate(calc(-1rad * ".concat(blurAngle, "))"));
          this.tags.blur.setAttribute('stdDeviation', "".concat(blur * 0.75 - 1, ", 0"));
        } else {
          blurAngle = 0;
          blur = 0;
          this.tags.blurAngle.setAttribute('style', "transform:rotate(calc(1rad * ".concat(blurAngle, "))"));
          this.tags.blurAngleCancel.setAttribute('style', "transform:rotate(calc(-1rad * ".concat(blurAngle, "))"));
          this.tags.blur.setAttribute('stdDeviation', "".concat(blur, ", 0"));
        }

        this.xPrev = controlActor.x;
        this.yPrev = controlActor.y;
      }

      for (var i = 0; i < layerCount; i++) {
        if (!this.args.layers[i]) {
          this.args.layers[i] = new _Layer.Layer({
            layerId: i,
            viewport: this,
            name: layers[i].name
          });
          this.args.layers[i].args.height = this.args.height;
          this.args.layers[i].args.width = this.args.width;
        }

        var xDir = Math.sign(this.args.layers[i].x - this.args.x);
        var yDir = Math.sign(this.args.layers[i].y = this.args.y);
        this.args.layers[i].x = this.args.x;
        this.args.layers[i].y = this.args.y;
        this.args.layers[i].update(this.tileMap, xDir, yDir);
      }

      var xMax = -(this.tileMap.mapData.width * 32);
      var yMax = -(this.tileMap.mapData.height * 32);
      this.tags.bgFilters.style({
        '--x': Math.round(this.args.x),
        '--y': Math.round(this.args.y)
      });
      this.tags.fgFilters.style({
        '--x': Math.round(this.args.x),
        '--y': Math.round(this.args.y)
      });
      this.tags.content.style({
        '--x': Math.round(this.args.x),
        '--y': Math.round(this.args.y)
      });
      this.args.backdrop && Object.assign(this.args.backdrop.args, {
        'x': Math.round(this.args.x),
        'y': Math.round(this.args.y),
        'xMax': xMax,
        'yMax': yMax,
        'frame': this.args.frameId
      });
      var xMod = this.args.x < 0 ? Math.round(this.args.x % this.args.blockSize) : (-this.args.blockSize + Math.round(this.args.x % this.args.blockSize)) % this.args.blockSize;
      var yMod = this.args.y < 0 ? Math.round(this.args.y % this.args.blockSize) : (-this.args.blockSize + Math.round(this.args.y % this.args.blockSize)) % this.args.blockSize;
      this.tags.background.style({
        transform: "translate( ".concat(xMod, "px, ").concat(yMod, "px )")
      });
      this.tags.frame.style({
        '--width': this.args.width,
        '--height': this.args.height,
        '--scale': this.args.scale
      });
    }
  }, {
    key: "populateMap",
    value: function populateMap() {
      if (this.args.populated) {
        return;
      }

      this.args.populated = true;
      var objDefs = this.tileMap.getObjectDefs();

      for (var i in objDefs) {
        var objDef = objDefs[i];
        var objType = objDef.type;

        if (!_ObjectPalette.ObjectPalette[objType]) {
          continue;
        }

        if (this.args.networked) {
          if (!['layer-switch', 'ring', 'companion-block', 'water-region'].includes(objType)) {
            continue;
          }
        }

        var objClass = _ObjectPalette.ObjectPalette[objType];

        var actor = _Bindable.Bindable.make(objClass.fromDef(objDef)); // if(!actor.controllable)
        // {
        // 	continue;
        // }


        this.actors.add(actor);
        actor.render(this.tags.actors);
        var width = this.args.width;
        var height = this.args.height;
        var margin = 32;
        var camLeft = -this.args.x + -16 + -margin;
        var camRight = -this.args.x + width + -16 + margin;
        var camTop = -this.args.y;
        var camBottom = -this.args.y + height;
        var actorTop = actor.y - actor["public"].height;
        var actorRight = actor.x + actor["public"].width;
        var actorLeft = actor.x;

        if (camLeft < actorRight && camRight > actorLeft && camBottom > actorTop && camTop < actor.y) {
          actor.args.display = 'initial';
        } else {
          actor.args.display = 'none';
          actor.detach();
        }

        if (actor.controllable) {
          this.args.controllable[objDef.name] = actor; // this.auras.add( actor );

          actor.args.display = 'initial';
        }
      }
    }
  }, {
    key: "spawnActors",
    value: function spawnActors() {
      var _iterator = _createForOfIteratorHelper(this.spawn.values()),
          _step3;

      try {
        for (_iterator.s(); !(_step3 = _iterator.n()).done;) {
          var spawn = _step3.value;

          if (spawn.frame) {
            if (spawn.frame <= this.args.frameId) {
              this.spawn["delete"](spawn);
              this.actors.add(_Bindable.Bindable.make(spawn.object));
              spawn.object.render(this.tags.actors);
            }
          } else {
            this.spawn["delete"](spawn);
            this.actors.add(_Bindable.Bindable.make(spawn.object));
            spawn.object.render(this.tags.actors);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "actorUpdateStart",
    value: function actorUpdateStart(nearbyCells) {
      for (var i in nearbyCells) {
        var cell = nearbyCells[i];
        var actors = cell.values();

        var _iterator2 = _createForOfIteratorHelper(actors),
            _step4;

        try {
          for (_iterator2.s(); !(_step4 = _iterator2.n()).done;) {
            var actor = _step4.value;

            if (this.updateStarted.has(actor)) {
              continue;
            }

            actor.updateStart();
            this.updateStarted.add(actor);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }
  }, {
    key: "actorUpdate",
    value: function actorUpdate(nearbyCells) {
      for (var i in nearbyCells) {
        var cell = nearbyCells[i];
        var actors = cell.values();

        var _iterator3 = _createForOfIteratorHelper(actors),
            _step5;

        try {
          for (_iterator3.s(); !(_step5 = _iterator3.n()).done;) {
            var actor = _step5.value;

            if (this.updated.has(actor)) {
              continue;
            }

            actor.update();
            this.setColCell(actor);
            this.updated.add(actor);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }
    }
  }, {
    key: "actorUpdateEnd",
    value: function actorUpdateEnd(nearbyCells) {
      var width = this.args.width;
      var height = this.args.height;
      var x = this.args.x;
      var y = this.args.y;

      for (var i in nearbyCells) {
        var cell = nearbyCells[i];
        var actors = cell.values();

        var _iterator4 = _createForOfIteratorHelper(actors),
            _step6;

        try {
          for (_iterator4.s(); !(_step6 = _iterator4.n()).done;) {
            var actor = _step6.value;

            if (this.updateEnded.has(actor)) {
              continue;
            }

            actor.updateEnd();
            this.updateEnded.add(actor);
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
      }
    }
  }, {
    key: "nearbyActors",
    value: function nearbyActors(actor) {
      var nearbyCells = this.getNearbyColCells(actor);
      var width = this.args.width;
      var height = this.args.height;
      var x = this.args.x;
      var y = this.args.y;
      var result = new Set();

      for (var i in nearbyCells) {
        var cell = nearbyCells[i];
        var actors = cell.values();

        var _iterator5 = _createForOfIteratorHelper(actors),
            _step7;

        try {
          for (_iterator5.s(); !(_step7 = _iterator5.n()).done;) {
            var _actor = _step7.value;
            result.add(_actor);
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
      }

      return result;
    }
  }, {
    key: "update",
    value: function update() {
      var _this6 = this;

      var time = (Date.now() - this.startTime) / 1000;
      var minutes = String(Math.floor(Math.abs(time) / 60)).padStart(2, '0');
      var seconds = String((Math.abs(time) % 60).toFixed(2)).padStart(5, '0');
      var neg = time < 0 ? '-' : '';

      if (neg) {
        minutes = Number(minutes);
      }

      var controller = this.controlActor ? this.controlActor.controller : this.controller;

      if (!this.args.started) {
        this.takeInput(controller);
        this.startTime = Date.now();

        if (this.args.titlecard) {
          this.args.titlecard.input(controller);
        }

        return;
      } else if (this.args.paused && !this.args.networked) {
        this.takeInput(controller);
        this.args.pauseMenu.input(controller);
        return;
      }

      this.args.timer.args.value.args.value = "".concat(neg).concat(minutes, ":").concat(seconds);

      if (this.dontSwitch > 0) {
        this.dontSwitch--;
      }

      if (this.dontSwitch < 0) {
        this.dontSwitch = 0;
      }

      this.args.rippleFrame = this.args.frameId % 128;
      this.actorPointCache.clear();
      this.args.frameId++;
      this.args.displaceWater = this.args.frameId % 128;

      if (this.controlActor) {
        if (this.args.isReplaying) {
          this.args.focusMe.args.hide = 'hide';
          var replay = this.replayInputs[this.args.frameId];

          if (replay && replay.actors) {
            for (var actorId in replay.actors) {
              var actor = this.actorsById[actorId];
              var frame = replay.actors[actorId];

              if (frame.input) {
                actor.controller.replay(frame.input);
                actor.readInput();
              }

              if (frame.args) {
                Object.assign(actor.args, frame.args);
              }
            }

            if (this.replayInputs.length) {
              this.args.hasRecording = true;
              this.args.topLine.args.value = ' i cant believe its not canvas. ';
              this.args.status.args.value = ' click here to exit demo. ';
            }
          } else {
            this.args.isReplaying = false;
          }
        }

        if (!this.args.isReplaying) {
          if (this.gamepad) {
            this.args.focusMe.args.hide = 'hide';
          } else {// this.args.focusMe.args.hide = '';
          }

          this.takeInput(this.controlActor.controller);
          this.controlActor.readInput();
        } // if(!this.args.maxSpeed)
        // {
        // 	this.args.maxSpeed = this.controlActor.args.gSpeedMax;
        // }
        // this.controlActor.args.gSpeedMax = this.args.maxSpeed;
        // this.controlActor.willStick = !!this.args.willStick;
        // this.controlActor.stayStuck = !!this.args.stayStuck;


        this.controlActor.crawling = false;
        this.controlActor.running = false;
      }

      this.updateStarted.clear();
      this.updated.clear();
      this.updateEnded.clear();
      this.updateBackground();

      var _iterator6 = _createForOfIteratorHelper(this.regions.values()),
          _step8;

      try {
        for (_iterator6.s(); !(_step8 = _iterator6.n()).done;) {
          var region = _step8.value;
          region.updateStart();
          this.updateStarted.add(region);
          region.update();
          this.updated.add(region);
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      var actorCells = new WeakMap();

      var _iterator7 = _createForOfIteratorHelper(this.auras.values()),
          _step9;

      try {
        for (_iterator7.s(); !(_step9 = _iterator7.n()).done;) {
          var _actor3 = _step9.value;
          var nearbyCells = this.getNearbyColCells(_actor3);
          actorCells.set(_actor3, nearbyCells);

          if (this.updateStarted.has(_actor3)) {
            continue;
          }

          _actor3.updateStart();

          this.updateStarted.add(_actor3);
          this.actorUpdateStart(nearbyCells);
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }

      var _iterator8 = _createForOfIteratorHelper(this.auras.values()),
          _step10;

      try {
        for (_iterator8.s(); !(_step10 = _iterator8.n()).done;) {
          var _actor4 = _step10.value;

          var _nearbyCells = actorCells.get(_actor4);

          if (this.updated.has(_actor4)) {
            continue;
          }

          _actor4.update();

          this.updated.add(_actor4);
          this.actorUpdate(_nearbyCells);
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }

      if (this.controlActor) {
        this.rings.args.value = this.controlActor.args.rings;
        this.coins.args.value = this.controlActor.args.coins;
        this.emeralds.args.value = "".concat(this.controlActor.args.emeralds, "/7");
        this.args.hasRings = !!this.controlActor.args.rings;
        this.args.hasCoins = !!this.controlActor.args.coins;
        this.args.hasEmeralds = !!this.controlActor.args.emeralds;
        this.args["char"].args.value = this.controlActor.args.name;
        this.args.charName = this.controlActor.args.name;
        this.args.xPos.args.value = Math.round(this.controlActor.x);
        this.args.yPos.args.value = Math.round(this.controlActor.y); // this.args.ground.args.value   = this.controlActor.args.landed;
        // this.args.gSpeed.args.value   = this.controlActor.args.gSpeed.toFixed(2);
        // this.args.xSpeed.args.value   = Math.round(this.controlActor.args.xSpeed);
        // this.args.ySpeed.args.value   = Math.round(this.controlActor.args.ySpeed);
        // this.args.angle.args.value    = (Math.round((this.controlActor.args.groundAngle) * 1000) / 1000).toFixed(3);
        // this.args.airAngle.args.value = (Math.round((this.controlActor.args.airAngle) * 1000) / 1000).toFixed(3);

        var modes = ['FLOOR', 'L-WALL', 'CEILING', 'R-WALL'];
        this.args.mode.args.value = modes[Math.floor(this.controlActor.args.mode)] || Math.floor(this.controlActor.args.mode);
      }

      var _iterator9 = _createForOfIteratorHelper(this.auras.values()),
          _step11;

      try {
        for (_iterator9.s(); !(_step11 = _iterator9.n()).done;) {
          var _actor5 = _step11.value;

          var _nearbyCells2 = actorCells.get(_actor5);

          if (!this.updateEnded.has(_actor5)) {
            _actor5.updateEnd();

            this.updateEnded.add(_actor5);
            this.actorUpdateEnd(_nearbyCells2);
          }
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }

      var _iterator10 = _createForOfIteratorHelper(this.regions.values()),
          _step12;

      try {
        for (_iterator10.s(); !(_step12 = _iterator10.n()).done;) {
          var _region = _step12.value;

          if (!this.updateEnded.has(_region)) {
            _region.updateEnd();

            this.updateEnded.add(_region);
          }
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }

      var width = this.args.width;
      var height = this.args.height;
      var margin = 16;
      var camLeft = -this.args.x + -16 + -margin;
      var camRight = -this.args.x + width + -16 + margin;
      var camTop = -this.args.y - margin;
      var camBottom = -this.args.y + height + margin;
      var inAuras = new WeakSet();

      if (this.controlActor) {
        // if(this.visibilityTimer)
        // {
        // 	clearTimeout(this.visibilityTimer);
        // 	this.visibilityTimer = false;
        // }
        // this.visibilityTimer = setTimeout(()=>{
        // }, 0);
        this.visibilityTimer = false;

        for (var i in this.actors.list) {
          var _actor2 = this.actors.list[i];

          if (!this.auras.has(_actor2)) {
            var actorBottom = _actor2.y + 64;
            var actorTop = _actor2.y - _actor2["public"].height - 64;
            var actorRight = _actor2.x + _actor2["public"].width + 64;
            var actorLeft = _actor2.x - _actor2["public"].width - 64;

            if (inAuras.has(_actor2)) {
              continue;
            }

            var offscreenX = 0;
            var offscreenY = 0;

            if (camLeft < actorRight) {
              offscreenX = actorRight - camLeft;
            } else if (camRight > actorLeft) {
              offscreenX = camRight - actorLeft;
            }

            if (camBottom > actorTop) {
              offscreenY = camBottom - actorTop;
            } else if (camTop < actorBottom) {
              offscreenY = actorBottom - camTop;
            }

            if (camLeft < actorRight && camRight > actorLeft && camBottom > actorTop && camTop < actorBottom && !(_actor2 instanceof _LayerSwitch.LayerSwitch)) {
              _actor2.args.display = 'initial';

              if (!_actor2.vizi) {
                _actor2.nodes.map(function (n) {
                  return _this6.tags.actors.append(n);
                });

                _actor2.wakeUp();

                _actor2.vizi = true;
              }
            } else if (_actor2.vizi && (offscreenX > 0 || offscreenY > 0)) {
              _actor2.sleep();

              _actor2.detach();

              _actor2.vizi = false;
            }

            inAuras.add(_actor2);
          }
        }
      }

      this.spawnActors();

      if (this.nextControl) {
        this.auras["delete"](this.controlActor);
        this.controlActor && this.controlActor.sprite.parentNode.classList.remove('actor-selected');
        this.controlActor = this.nextControl;
        this.controlActor.sprite.parentNode.classList.add('actor-selected');
        this.auras.add(this.controlActor);
        this.controlActor.args.display = 'initial';
        this.controlActor.nodes.map(function (n) {
          return _this6.tags.actors.append(n);
        });
        this.controlActor.vizi = true;
        this.args.maxSpeed = null;
        this.nextControl = null;
      } // if(this.controlActor && this.controlActor.controlCard)
      // {
      // 	if(this.controlActor.public.falling)
      // 	{
      // 		this.args.controlCard = this.controlActor.airControlCard;
      // 	}
      // 	else
      // 	{
      // 		this.args.controlCard = this.controlActor.controlCard;
      // 	}
      // }
      // else
      // {
      // 	this.args.controlCard = this.controlCard;
      // }


      if (this.controlActor) {
        this.moveCamera();

        if (this.controlActor.args.name === 'seymour' && this.controlActor.y < 3840 && this.controlActor.x > 38400 && this.controlActor.standingOn && this.controlActor.standingOn.isVehicle) {
          this.args.secret = 'aurora';

          if (!this.secretsFound.has('seymour-aurora')) {
            if (this.args.audio && this.secretSample) {
              this.secretSample.currentTime = 0;
              this.secretSample.volume = 0.25;
              this.secretSample.play();
            }

            this.showStatus(10000, ' A secret is revealed ');
            this.secretsFound.add('seymour-aurora');
          }
        } else {
          this.args.secret = '';
        }
      }

      this.args.moveCard = this.moveCard;
      this.collisions = new WeakMap();

      if (this.args.networked && this.controlActor) {
        var netState = {
          frame: this.serializePlayer()
        };

        if (this.args.playerId === 1) {
          this.server.send(JSON.stringify(netState));
        } else if (this.args.playerId === 2) {
          this.client.send(JSON.stringify(netState));
        }
      }
    }
  }, {
    key: "click",
    value: function click(event) {
      if (this.args.isReplaying) {
        this.controlActor.controller.zero();
        this.stop();
      }
    }
  }, {
    key: "regionAtPoint",
    value: function regionAtPoint(x, y) {
      var _iterator11 = _createForOfIteratorHelper(this.regions.values()),
          _step13;

      try {
        for (_iterator11.s(); !(_step13 = _iterator11.n()).done;) {
          var region = _step13.value;
          var regionArgs = region["public"];
          var regionX = regionArgs.x;
          var regionY = regionArgs.y;
          var width = regionArgs.width;
          var height = regionArgs.height;
          var offset = Math.floor(width / 2);
          var left = regionX;
          var right = regionX + width;
          var top = regionY - height;
          var bottom = regionY;

          if (x >= left && right > x) {
            if (bottom >= y && y > top) {
              return region;
            }
          }
        }
      } catch (err) {
        _iterator11.e(err);
      } finally {
        _iterator11.f();
      }
    }
  }, {
    key: "actorsAtPoint",
    value: function actorsAtPoint(x, y) {
      var w = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var h = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var cacheKey = [x, y].join('::');
      var actorPointCache = this.actorPointCache;

      if (actorPointCache.has(cacheKey)) {
        return actorPointCache.get(cacheKey);
      }

      var actors = [];
      this.getNearbyColCells({
        x: x,
        y: y
      }).map(function (cell) {
        var _iterator12 = _createForOfIteratorHelper(cell.values()),
            _step14;

        try {
          for (_iterator12.s(); !(_step14 = _iterator12.n()).done;) {
            var actor = _step14.value;

            if (actor.removed) {
              // cell.delete(actor);
              continue;
            }

            var actorArgs = actor["public"];
            var actorX = actorArgs.x;
            var actorY = actorArgs.y;
            var width = actorArgs.width;
            var height = actorArgs.height;
            var myRadius = Math.max(Math.floor(w / 2) - 1, 0);
            var myLeft = x - myRadius;
            var myRight = x + myRadius;
            var myTop = y - h;
            var myBottom = y;
            var offset = Math.floor(width / 2);
            var otherLeft = -offset + actorX;
            var otherRight = -offset + actorX + width;
            var otherTop = actorY - height;
            var otherBottom = actorY;

            if (myRight >= otherLeft && otherRight > myLeft) {
              if (otherBottom >= myTop && myBottom > otherTop) {
                actors.push(actor);
              }
            }
          }
        } catch (err) {
          _iterator12.e(err);
        } finally {
          _iterator12.f();
        }
      });
      actorPointCache.set(cacheKey, actors);
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
    key: "padRemoved",
    value: function padRemoved(event) {
      if (!this.gamepad) {
        return;
      }

      if (this.gamepad.index === event.gamepad.index) {
        this.gamepad = null;
      }
    }
  }, {
    key: "getColCell",
    value: function getColCell(actor) {
      var colCellDiv = this.colCellDiv;
      var colCells = this.colCells;
      var cellX = Math.floor(actor.x / colCellDiv);
      var cellY = Math.floor(actor.y / colCellDiv);
      colCells[cellX] = colCells[cellX] || {};
      colCells[cellX][cellY] = colCells[cellX][cellY] || new Set();
      return colCells[cellX][cellY];
    }
  }, {
    key: "setColCell",
    value: function setColCell(actor) {
      actor = _Bindable.Bindable.make(actor);
      var cell = this.getColCell(actor);
      var originalCell = actor[ColCell];

      if (originalCell && originalCell !== cell) {
        originalCell["delete"](actor);
      }

      actor[ColCell] = cell;
      actor[ColCell].add(actor);
      return cell;
    }
  }, {
    key: "getNearbyColCells",
    value: function getNearbyColCells(actor) {
      var actorX = actor.x;
      var actorY = actor.y;
      var colCellDiv = this.colCellDiv;
      var cellX = Math.floor(actorX / colCellDiv);
      var cellY = Math.floor(actorY / colCellDiv);
      var name = "".concat(cellX, "::").concat(cellY);
      var cache = this.colCellCache.get(name);

      if (cache) {
        return cache.filter(function (set) {
          return set.size;
        });
      }

      var space = colCellDiv;
      var colA = actorX - space;
      var colB = actorX;
      var colC = actorX + space;
      var rowA = actorY - space;
      var rowB = actorY;
      var rowC = actorY + space;
      this.colCellCache.set(name, cache = [this.getColCell({
        x: colA,
        y: rowA
      }), this.getColCell({
        x: colA,
        y: rowB
      }), this.getColCell({
        x: colA,
        y: rowC
      }), this.getColCell({
        x: colB,
        y: rowA
      }), this.getColCell({
        x: colB,
        y: rowB
      }), this.getColCell({
        x: colB,
        y: rowC
      }), this.getColCell({
        x: colC,
        y: rowA
      }), this.getColCell({
        x: colC,
        y: rowB
      }), this.getColCell({
        x: colC,
        y: rowC
      })]);
      return cache.filter(function (set) {
        return set.size;
      });
    }
  }, {
    key: "change",
    value: function change(event) {
      if (!event.target.value) {
        return;
      }

      if (!this.args.controllable[event.target.value]) {
        return;
      }

      var actor = this.args.controllable[event.target.value];
      this.nextControl = actor;
      this.tags.viewport.focus();
    }
  }, {
    key: "screenFilter",
    value: function screenFilter(filterName) {
      this.args.screenFilter = filterName;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.stop();

      for (var i in this.actors.list) {
        var actor = this.actors.list[i];
        this.actors.remove(actor);
      }

      this.controlActor && this.actors.remove(this.controlActor);
      this.spawn.clear();
      this.actorPointCache.clear();
      this.args.isRecording = false;
      this.args.isReplaying = false;
      this.args.populated = false;
      this.controlActor = null;
      this.args.frameId = -1;
      this.populateMap();
      this.nextControl = Object.values(this.args.actors)[0];
      this.tags.viewport.focus();
    }
  }, {
    key: "quit",
    value: function quit() {
      var _this7 = this;

      for (var i in this.actors.list) {
        var actor = this.actors.list[i];
        this.actors.remove(actor);
      }

      this.args.isRecording = false;
      this.args.isReplaying = false;
      this.playableIterator = false;
      this.args.populated = false;
      this.args.paused = false;
      this.args.started = false;
      this.controlActor = null;
      this.args.frameId = -1;
      this.emeralds.args.value = 0;
      this.rings.args.value = 0;
      this.coins.args.value = 0;
      this.args.hasRings = false;
      this.args.hasCoins = false;
      this.args.hasEmeralds = false;
      this.args["char"].args.value = '';
      this.args.charName = '';
      var layers = this.args.layers;
      var layerCount = layers.length;

      for (var _i = 0; _i < layerCount; _i++) {
        if (!layers[_i]) {
          continue;
        }

        var layer = layers[_i];
        layer.remove();
      }

      this.args.layers = []; // this.args.backdrop = null;

      this.args.titlecard = new _Series.Series({
        cards: this.homeCards()
      });
      this.args.titlecard.play().then(function (done) {
        _this7.populateMap();

        if (!_this7.args.networked) {
          var actors = _this7.actors.list;

          if (!_this7.playableIterator) {
            _this7.playableIterator = _this7.playable.entries();

            var item = _this7.playableIterator.next();

            _this7.nextControl = item.value[0];
          }
        } else if (_this7.args.networked) {
          var _actors2 = _this7.actors.list;
          _this7.nextControl = _actors2[-1 + _this7.args.playerId];
        }

        _this7.auras.clear();

        _this7.auras.add(_this7.nextControl);

        _this7.nextControl.args.display = 'initial';

        _this7.startLevel();

        _this7.update();
      });
    }
  }, {
    key: "introCards",
    value: function introCards() {
      return [new _LoadingCard.LoadingCard({
        timeout: 350,
        text: 'loading'
      }, this), new _BootCard.BootCard({
        timeout: 3500
      }), new _SeanCard.SeanCard({
        timeout: 5000
      }, this)].concat(_toConsumableArray(this.homeCards()));
    }
  }, {
    key: "homeCards",
    value: function homeCards() {
      return [new _TitleScreenCard.TitleScreenCard({
        timeout: 50000,
        waitFor: this.tileMap.ready
      }, this), new _MainMenu.MainMenu({
        timeout: -1
      }, this), new _Titlecard.Titlecard({
        firstLine: 'PIXEL HILL',
        secondLine: 'ZONE',
        creditLine: 'Sean Morris',
        waitFor: this.tileMap.ready
      }, this)];
    }
  }, {
    key: "record",
    value: function record() {
      this.reset();
      this.replayInputs = [];
      this.args.isRecording = true;
      this.args.hasRecording = true;
    }
  }, {
    key: "playback",
    value: function playback() {
      this.reset();
      this.args.isReplaying = true;
    }
  }, {
    key: "stop",
    value: function stop() {
      this.args.isReplaying = false;

      if (this.args.isRecording) {
        var replay = JSON.stringify(_toConsumableArray(this.replayInputs));
        localStorage.setItem('replay', replay);
      }

      this.args.isRecording = false;
      this.controlActor && this.controlActor.controller.zero();
    }
  }, {
    key: "focus",
    value: function focus() {
      this.tags.viewport && this.tags.viewport.focus();
    }
  }, {
    key: "getServer",
    value: function getServer() {
      var _this8 = this;

      var refresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var rtcConfig = {
        iceServers: [// {urls: 'stun:stun1.l.google.com:19302'},
          // {urls: 'stun:stun2.l.google.com:19302'}
        ]
      };
      var server = !refresh && server || new _RtcServer.RtcServer(rtcConfig);

      var onOpen = function onOpen(event) {
        _this8.args.chatBox = new _ChatBox.ChatBox({
          pipe: server
        }); // const actors = this.actors.list;
        // if(actors[1])
        // {
        // 	actors[1].args.name = 'Player 2';
        // }

        _this8.args.playerId = 1;
      };

      var onMessage = function onMessage(event) {
        var actors = _this8.actors.list;

        if (actors[1]) {
          var packet = JSON.parse(event.detail);
          var actor = actors[1];

          if (packet.frame) {
            if (packet.frame.input) {
              actor.controller.replay(packet.frame.input);
              actor.readInput();
            }

            if (packet.frame.args) {
              Object.assign(actor.args, packet.frame.args);
            }
          }
        }
      };

      this.listen(server, 'open', onOpen, {
        once: true
      });
      this.listen(server, 'message', onMessage);
      this.server = server;
      return server;
    }
  }, {
    key: "getClient",
    value: function getClient() {
      var _this9 = this;

      var refresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var rtcConfig = {
        iceServers: [// {urls: 'stun:stun1.l.google.com:19302'},
          // {urls: 'stun:stun2.l.google.com:19302'}
        ]
      };
      var client = !refresh && this.client || new _RtcClient.RtcClient(rtcConfig);

      var onOpen = function onOpen(event) {
        // const actors = this.actors.list;
        _this9.args.chatBox = new _ChatBox.ChatBox({
          pipe: client
        }); // if(actors[0])
        // {
        // 	actors[0].args.name = 'Player 1';
        // }

        _this9.args.playerId = 2;
      };

      var onMessage = function onMessage(event) {
        var actors = _this9.actors.list;

        if (actors[0]) {
          var packet = JSON.parse(event.detail);
          var actor = actors[0];

          if (packet.frame) {
            if (packet.frame.input) {
              actor.controller.replay(packet.frame.input);
              actor.readInput();
            }

            if (packet.frame.args) {
              Object.assign(actor.args, packet.frame.args);
            }
          }
        }
      };

      this.listen(client, 'open', onOpen, {
        once: true
      });
      this.listen(client, 'message', onMessage);
      this.client = client;
      return client;
    }
  }, {
    key: "serializePlayer",
    value: function serializePlayer() {
      var frame = this.args.frameId;
      var input = this.controlActor.controller.serialize();
      var args = {
        x: this.controlActor["public"].x,
        y: this.controlActor["public"].y,
        gSpeed: this.controlActor["public"].gSpeed,
        xSpeed: this.controlActor["public"].xSpeed,
        ySpeed: this.controlActor["public"].ySpeed,
        direction: this.controlActor["public"].direction,
        facing: this.controlActor["public"].facing,
        falling: this.controlActor["public"].falling,
        rolling: this.controlActor["public"].rolling,
        jumping: this.controlActor["public"].jumping,
        flying: this.controlActor["public"].flying,
        "float": this.controlActor["public"]["float"],
        angle: this.controlActor["public"].angle,
        mode: this.controlActor["public"].mode,
        groundAngle: this.controlActor["public"].groundAngle
      };
      return {
        frame: frame,
        input: input,
        args: args
      };
    }
  }]);

  return Viewport;
}(_View2.View);

exports.Viewport = Viewport;
});

;require.register("viewport/layer.html", function(exports, require, module) {
module.exports = "<div data-name = \"[[name]]\" class = \"viewport-background\" cv-each = \"blocks:block:b\" cv-ref = \"background\" data-layer = \"[[layerId]]\">[[block]]</div>\n"
});

;require.register("viewport/viewport.html", function(exports, require, module) {
module.exports = "<section class = \"filters\" cv-each = \"effects:effect\">[[effect]]</section>\n\n<div class = \"viewport-frame [[initializing]] [[standalone]] [[secret]] [[level]]\" cv-ref = \"frame\">\n\t<div class = \"viewport-header\">\n\t\t<span class = \"sean-icon\"></span>\n\t\t<h1>Pixel Physics</h1>\n\t</div>\n\t<div class = \"viewport [[standalone]] [[fullscreen]]\" cv-ref = \"viewport\" tabindex=\"0\" cv-on = \"click(event)\">\n\n\t\t<svg>\n\t\t<defs>\n\n\t\t\t<filter id=\"motionBlur\">\n\t\t\t\t<feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"0\" cv-ref = \"blur\" />\n\t\t\t</filter>\n\n\t\t\t<filter id=\"dilate\">\n\t\t\t\t<feMorphology operator=\"dilate\" radius=\"0.25\" result = \"expanded\"/>\n\t\t\t\t<feMerge>\n\t\t\t\t\t<feMergeNode in=\"expanded\" />\n\t\t\t\t\t<feMergeNode in=\"SourceGraphic\" />\n\t\t\t\t</feMerge>\n\t\t\t</filter>\n\n\t\t\t<filter id = \"waves\"\n\t\t\t\tcolor-interpolation-filters=\"sRGB\"\n\t\t\t\tx      =\"0%\"\n\t\t\t\ty      =\"0%\"\n\t\t\t\theight =\"100%\"\n\t\t\t\twidth  =\"100%\"\n\t\t\t>\n\t\t\t\t<feFlood flood-color=\"#408000\" result = \"DisplacementGreen\" />\n\n\t\t\t\t<feImage\n\t\t\t\t\txlink:href=\"/effects/wave.png\"\n\t\t\t\t\tresult=\"DisplacementSource\"\n\t\t\t\t\theight=\"64\"\n\t\t\t\t\twidth=\"64\"\n\t\t\t\t/>\n\n\t\t\t\t<feTile\n\t\t\t\t\tin=\"DisplacementSource\"\n\t\t\t\t\tresult=\"DisplacementTile\"\n\t\t\t\t>\n\n\t\t\t\t</feTile>\n\n\t\t\t\t<feComposite\n\t\t\t\t\tin  = \"DisplacementTile\"\n\t\t\t\t\tin2 = \"DisplacementGreen\"\n\t\t\t\t\tresult =\"DisplacementField\"\n\t\t\t\t\toperator =\"over\"\n\t\t\t\t>\n\n\t\t\t\t</feComposite>\n\n\t\t\t\t<feOffset\n\t\t\t\t\tin  = \"DisplacementField\"\n\t\t\t\t\tout = \"DisplacementOffset\"\n\t\t\t\t\tdx  = \"0\"\n\t\t\t\t>\n\t\t\t\t\t<animate\n\t\t\t\t\t\tattributeName=\"dy\"\n\t\t\t\t\t\tvalues = \"0;-64\"\n\t\t\t\t\t\tdur=\"1500ms\"\n\t\t\t\t\t\trepeatCount=\"indefinite\" />\n\n\t\t\t\t</feOffset>\n\n\n\t\t\t\t<feDisplacementMap\n\t\t\t\t\tin=\"SourceGraphic\"\n\t\t\t\t\tin2=\"DisplacementOffset\"\n\t\t\t\t\tresult=\"Displaced\"\n\t\t\t\t\txChannelSelector=\"R\"\n\t\t\t\t\tyChannelSelector=\"G\"\n\t\t\t\t\tscale=\"4\"\n\t\t\t\t/>\n\n\t\t\t\t<feGaussianBlur\n\t\t\t\t\tin=\"Displaced\"\n\t\t\t\t\tstdDeviation=\"0.35\"\n\t\t\t\t/>\n\n\t\t\t</filter>\n\n\t\t\t<!-- <filter\n\t\t\t\tcolor-interpolation-filters=\"sRGB\"\n\t\t\t\tid = \"twist\"\n\t\t\t\tx      =\"-0%\"\n\t\t\t\ty      =\"0%\"\n\t\t\t\theight =\"100%\"\n\t\t\t\twidth  =\"100%\"\n\t\t\t>\n\t\t\t\t<feImage\n\t\t\t\t\txlink:href=\"/effects/twist.png\"\n\t\t\t\t\tresult=\"DisplacementSource\"\n\t\t\t\t\theight=\"64\"\n\t\t\t\t\twidth=\"64\"\n\t\t\t\t/>\n\t\t\t\t<feDisplacementMap\n\t\t\t\t\tin=\"SourceGraphic\"\n\t\t\t\t\tin2=\"DisplacementSource\"\n\t\t\t\t\txChannelSelector=\"R\"\n\t\t\t\t\tyChannelSelector=\"G\"\n\t\t\t\t\tscale=\"10\"\n\t\t\t\t/>\n\n\t\t\t</filter> -->\n\n\t\t\t<!-- <filter\n\t\t\t\tcolor-interpolation-filters=\"sRGB\"\n\t\t\t\tid = \"pinch\"\n\t\t\t\tx      =\"-0%\"\n\t\t\t\ty      =\"0%\"\n\t\t\t\theight =\"100%\"\n\t\t\t\twidth  =\"100%\"\n\t\t\t>\n\t\t\t\t<feImage\n\t\t\t\t\txlink:href=\"/effects/pinch.png\"\n\t\t\t\t\tresult=\"DisplacementSource\"\n\t\t\t\t\theight=\"64\"\n\t\t\t\t\twidth=\"64\"\n\t\t\t\t/>\n\t\t\t\t<feDisplacementMap\n\t\t\t\t\tin=\"SourceGraphic\"\n\t\t\t\t\tin2=\"DisplacementSource\"\n\t\t\t\t\txChannelSelector=\"R\"\n\t\t\t\t\tyChannelSelector=\"G\"\n\t\t\t\t\tscale=\"30\"\n\t\t\t\t/>\n\n\t\t\t</filter>\n\n\t\t\t<filter\n\t\t\t\tcolor-interpolation-filters=\"sRGB\"\n\t\t\t\tid = \"unpinch\"\n\t\t\t\tx      =\"-0%\"\n\t\t\t\ty      =\"0%\"\n\t\t\t\theight =\"100%\"\n\t\t\t\twidth  =\"100%\"\n\t\t\t>\n\t\t\t\t<feImage\n\t\t\t\t\txlink:href=\"/effects/pinch.png\"\n\t\t\t\t\tresult=\"DisplacementSource\"\n\t\t\t\t\theight=\"64\"\n\t\t\t\t\twidth=\"64\"\n\t\t\t\t/>\n\t\t\t\t<feDisplacementMap\n\t\t\t\t\tin=\"SourceGraphic\"\n\t\t\t\t\tin2=\"DisplacementSource\"\n\t\t\t\t\txChannelSelector=\"R\"\n\t\t\t\t\tyChannelSelector=\"G\"\n\t\t\t\t\tscale=\"-30\"\n\t\t\t\t/>\n\n\t\t\t</filter> -->\n\t\t</defs>\n\t\t</svg>\n\n\t\t<div class = \"viewport-zoom\">\n\n\t\t\t[[backdrop]]\n\n\t\t\t<div class = \"blurAngle\" cv-ref = \"blurAngle\">\n\t\t\t<div class = \"blurDistance\" cv-ref = \"blurDistance\">\n\t\t\t<div class = \"blurAngleCancel\" cv-ref = \"blurAngleCancel\">\n\t\t\t\t<div\n\t\t\t\t\tcv-ref  = \"background\"\n\t\t\t\t\tclass   = \"viewport-bg-layers\"\n\t\t\t\t\tcv-each = \"layers:layer\"\n\t\t\t\t>[[layer]]</div>\n\t\t\t</div>\n\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<div class = \"filters filters-background\" cv-ref = \"bgFilters\"></div>\n\n\t\t\t<div cv-ref = \"content\" class = \"viewport-content\">\n\n\t\t\t\t<div cv-ref = \"actors\" class = \"viewport-actors\">[[actor]]</div>\n\n\t\t\t\t<div cv-ref = \"particles\" class = \"viewport-particles\" cv-each = \"particles:particle:p\">[[particle]]</div>\n\n \t\t\t</div>\n \t\t</div>\n\n \t\t<div class = \"viewport-overlay\">\n\t\t\t<div class = \"hud\">\n\t\t\t\t<table>\n\n\t\t\t\t\t<!-- <tr>\n\t\t\t\t\t\t<td colspan = \"2\">[[char]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelGround]]</td>\n\t\t\t\t\t\t<td>[[ground]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelMode]]</td>\n\t\t\t\t\t\t<td>[[mode]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelX]]</td>\n\t\t\t\t\t\t<td>[[xPos]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelY]]</td>\n\t\t\t\t\t\t<td>[[yPos]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelXSpeed]]</td>\n\t\t\t\t\t\t<td>[[xSpeed]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelYSpeed]]</td>\n\t\t\t\t\t\t<td>[[ySpeed]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelAirAngle]]</td>\n\t\t\t\t\t\t<td>[[airAngle]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelAngle]]</td>\n\t\t\t\t\t\t<td>[[angle]]</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelFrame]]</td>\n\t\t\t\t\t\t<td>[[frame]]</td>\n\t\t\t\t\t</tr> -->\n\n\t\t\t\t\t<!-- <tr>\n\t\t\t\t\t\t<td>[[labelFps]]</td>\n\t\t\t\t\t\t<td>[[fpsSprite]]</td>\n\t\t\t\t\t</tr> -->\n\n\t\t\t\t\t<!-- <tr>\n\t\t\t\t\t\t<td>[[labelGSpeed]]</td>\n\t\t\t\t\t\t<td>[[gSpeed]]</td>\n\t\t\t\t\t</tr> -->\n\n\t\t\t\t</table>\n\t\t\t</div>\n\n\t\t\t<div class = \"hud hud-top-right\">\n\n\t\t\t\t<div class = \"char-hud\">\n\t\t\t\t\t[[char]]\n\t\t\t\t\t<div class = \"char-icon [[charName]]\"></div>\n\t\t\t\t</div>\n\n\t\t\t</div>\n\n\t\t\t<div class = \"hud hud-bottom-right\" cv-if = \"fps\">\n\n\t\t\t\t<div class =\"sheild-hud [[currentSheild]] [[hasElectric]] [[hasFire]] [[hasWater]]\">\n\t\t\t\t\t<div class = \"sheild-icon sheild-electric\"></div>\n\t\t\t\t\t<div class = \"sheild-icon spacer\"></div>\n\t\t\t\t\t<div class = \"sheild-icon sheild-fire\"></div>\n\t\t\t\t\t<div class = \"sheild-icon sheild-water\"></div>\n\t\t\t\t</div>\n\n\t\t\t\t<table>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>[[labelFps]]</td>\n\t\t\t\t\t\t<td>[[fpsSprite]]</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</table>\n\n\t\t\t</div>\n\n\t\t\t<!-- <div class = \"hud hud-dark hud-bottom-left\">\n\t\t\t\t[[nowPlaying]]\n\t\t\t\t[[trackName]]\n\t\t\t</div> -->\n\n\t\t\t<div class = \"filters filters-foreground\" cv-ref = \"fgFilters\"></div>\n\n\t\t\t<div class = \"hud hud-top-left\">\n\t\t\t\t<div class = \"timer\">[[timer]]</div>\n\t\t\t\t<div cv-if = \"hasRings\">[[rings]]</div>\n\t\t\t\t<div cv-if = \"hasCoins\">[[coins]]</div>\n\t\t\t\t<div cv-if = \"hasEmeralds\">[[emeralds]]</div>\n\t\t\t</div>\n\n\t\t\t<section class = \"full\" cv-if = \"paused\">[[pauseMenu]]</section>\n\n\t\t\t[[titlecard]]\n\n\t\t\t<div class = \"topLine\">\n\t\t\t\t<div class = \"status-message\">[[topLine]]</div>\n\t\t\t</div>\n\n\t\t\t<div class = \"focus-me\">\n\t\t\t\t<div class = \"status-message\">[[focusMe]]</div>\n\t\t\t</div>\n\n\t\t\t<div class = \"status-message\">[[status]]</div>\n\n\t\t\t<section class = \"contents\" cv-if = \"networked\">[[chatBox]]</section>\n\n\t\t\t<div class = \"console [[showConsole]]\" cv-ref = \"subspace\" tab-index = \"0\">[[subspace]]</div>\n\n\n\t\t</div>\n\n\t\t<div class = \"quick-controls\">\n\n\t\t\t[[muteSwitch]]\n\n\t\t\t<div class = \"button\" cv-on = \"click:fullscreen()\">\n\t\t\t\t<image src = \"/ui/fullscreen.svg\" />\n\t\t\t</div>\n\n\t\t</div>\n\n\n\t</div>\n\n\t<div class = \"viewport-caption [[inputType]]\">\n\n\t\t<div class = \"top-bar\">\n\n\t\t\t<div class = \"buttons\">\n\n\t\t\t\t<button cv-on = \"click:fullscreen(event)\">fullscreen</button>\n\n\t\t\t\t<span cv-if = \"!isRecording\">\n\t\t\t\t\t<span cv-if = \"!isReplaying\">\n\t\t\t\t\t\t<button cv-on = \"click:reset(event)\">reset</button>\n\t\t\t\t\t\t<button cv-on = \"click:record(event)\">record</button>\n\t\t\t\t\t\t<span cv-if = \"hasRecording\">\n\t\t\t\t\t\t\t<button cv-on = \"click:playback(event)\">playback</button>\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</span>\n\t\t\t\t</span>\n\n\t\t\t\t<span cv-if = \"isReplaying\">\n\t\t\t\t\t<button cv-on = \"click:stop(event)\">stop</button>\n\t\t\t\t</span>\n\n\t\t\t\t<span cv-if = \"isRecording\">\n\t\t\t\t\t<button cv-on = \"click:stop(event)\">stop</button>\n\t\t\t\t</span>\n\n\t\t\t</div>\n\n\t\t\t<a class = \"github\" cv-link = \"https://github.com/seanmorris/pixel-physics\">\n\t\t\t\t<span class = \"github-icon\"></span>\n\t\t\t\tview the project on github\n\t\t\t</a>\n\n\t\t\t<label class = \"change-character\">\n\n\t\t\t\tchange character:\n\n\t\t\t\t<select cv-each = \"controllable:obj:name\" cv-ref = \"currentActor\" cv-on = \"change(event)\">\n\t\t\t\t\t<option value = \"[[name]]\">[[name]]</option>\n\t\t\t\t</select>\n\n\t\t\t</label>\n\n\t\t</div>\n\n\t\t<div>\n\n\t\t\t<div>\n\t\t\t\t<b>controls: [[inputName]]</b> [[controlCard]]\n\t\t\t</div>\n\n\t\t\t<!-- <div>\n\t\t\t\t<b>moves:</b> [[moveCard]]\n\t\t\t</div> -->\n\n\t\t\t<div class = \"right\">\n\n\t\t\t\t<b>options:</b>\n\n\t\t\t\t<label>\n\t\t\t\t\t<span>enable audio</span>\n\t\t\t\t\t<input type = \"checkbox\" cv-bind = \"audio\" value = \"1\" />\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\t<span>max fps</span>\n\t\t\t\t\t<input type = \"number\" cv-bind = \"maxFps\" value = \"100\" />\n\t\t\t\t</label>\n\n\t\t\t\t<label>\n\t\t\t\t\t<span>scale:</span>\n\t\t\t\t\t<form>\n\t\t\t\t\t\t<input type = \"number\" cv-bind = \"scale\" min = \"1\" max = \"5\" />\n\t\t\t\t\t</form>\n\t\t\t\t</label>\n\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\n</div>\n\n\n\n\n<div class = \"sun\"></div>\n<div class = \"clouds-a\"></div>\n<div class = \"clouds-b\"></div>\n\n"
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
  var port = ar.port || 9485;
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