(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":3}],2:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],3:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("/private/var/www/GroupWorkBase/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":2,"/private/var/www/GroupWorkBase/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":5,"inherits":4}],4:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],6:[function(require,module,exports){
/**
 * power-assert.js - Power Assert in JavaScript.
 *
 * https://github.com/twada/power-assert
 *
 * Copyright (c) 2013-2014 Takuto Wada
 * Licensed under the MIT license.
 *   https://raw.github.com/twada/power-assert/master/MIT-LICENSE.txt
 */
(function (root, factory) {
    'use strict';

    // using returnExports UMD pattern
    if (typeof define === 'function' && define.amd) {
        define(['assert', 'empower', 'power-assert-formatter'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('assert'), require('empower'), require('power-assert-formatter'));
    } else {
        root.assert = factory(root.assert, root.empower, root.powerAssertFormatter);
    }
}(this, function (baseAssert, empower, formatter) {
    'use strict';

    return empower(baseAssert, formatter(), {modifyMessageOnFail: true, saveContextOnFail: true});
}));

},{"assert":1,"empower":7,"power-assert-formatter":8}],7:[function(require,module,exports){
/**
 * empower.js - Power Assert feature enhancer for assert function/object.
 *
 * https://github.com/twada/empower
 *
 * Copyright (c) 2013-2014 Takuto Wada
 * Licensed under the MIT license.
 *   https://raw.github.com/twada/empower/master/MIT-LICENSE.txt
 *
 * A part of extend function is:
 *   Copyright 2012 jQuery Foundation and other contributors
 *   Released under the MIT license.
 *   http://jquery.org/license
 */
(function (root, factory) {
    'use strict';

    // using returnExports UMD pattern
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.empower = factory();
    }
}(this, function () {
    'use strict';

    var isPhantom = typeof window !== 'undefined' && typeof window.callPhantom === 'function';

    function defaultOptions () {
        return {
            destructive: false,
            modifyMessageOnFail: false,
            saveContextOnFail: false,
            targetMethods: {
                oneArg: [
                    'ok'
                ],
                twoArgs: [
                    'equal',
                    'notEqual',
                    'strictEqual',
                    'notStrictEqual',
                    'deepEqual',
                    'notDeepEqual'
                ]
            }
        };
    }


    /**
     * Enhance Power Assert feature to assert function/object.
     * @param assert target assert function or object to enhance
     * @param formatter power assert format function
     * @param options enhancement options
     * @return enhanced assert function/object
     */
    function empower (assert, formatter, options) {
        var typeOfAssert = (typeof assert),
            config;
        if ((typeOfAssert !== 'object' && typeOfAssert !== 'function') || assert === null) {
            throw new TypeError('empower argument should be a function or object.');
        }
        if (isEmpowered(assert)) {
            return assert;
        }
        config = extend(defaultOptions(), (options || {}));
        switch (typeOfAssert) {
        case 'function':
            return empowerAssertFunction(assert, formatter, config);
        case 'object':
            return empowerAssertObject(assert, formatter, config);
        default:
            throw new Error('Cannot be here');
        }
    }


    function isEmpowered (assertObjectOrFunction) {
        return (typeof assertObjectOrFunction._capt === 'function') && (typeof assertObjectOrFunction._expr === 'function');
    }


    function empowerAssertObject (assertObject, formatter, config) {
        var enhancement = enhance(assertObject, formatter, config),
            target = config.destructive ? assertObject : Object.create(assertObject);
        return extend(target, enhancement);
    }


    function empowerAssertFunction (assertFunction, formatter, config) {
        if (config.destructive) {
            throw new Error('cannot use destructive:true to function.');
        }
        var enhancement = enhance(assertFunction, formatter, config),
            powerAssert = function powerAssert (context, message) {
                enhancement(context, message);
            };
        extend(powerAssert, assertFunction);
        return extend(powerAssert, enhancement);
    }


    function enhance (target, formatter, config) {
        var eagerEvaluation = !(config.modifyMessageOnFail || config.saveContextOnFail),
            doPowerAssert = function (baseAssert, args, message, context) {
                var f;
                if (eagerEvaluation) {
                    args.push(buildPowerAssertText(message, context));
                    return baseAssert.apply(target, args);
                }
                try {
                    args.push(message);
                    return baseAssert.apply(target, args);
                } catch (e) {
                    if (e.name !== 'AssertionError') {
                        throw e;
                    }
                    if (typeof target.AssertionError !== 'function') {
                        throw e;
                    }
                    if (isPhantom) {
                        f = new target.AssertionError({
                            actual: e.actual,
                            expected: e.expected,
                            operator: e.operator,
                            message: e.message
                        });
                    } else {
                        f = e;
                    }
                    if (config.modifyMessageOnFail) {
                        f.message = buildPowerAssertText(message, context);
                        if (typeof e.generatedMessage !== 'undefined') {
                            f.generatedMessage = false;
                        }
                    }
                    if (config.saveContextOnFail) {
                        f.powerAssertContext = context;
                    }
                    throw f;
                }
            },
            enhancement = (typeof target === 'function') ? decorateOneArg(target, target, doPowerAssert) : {},
            events = [];

        function buildPowerAssertText (message, context) {
            var powerAssertText = formatter(context);
            return message ? message + ' ' + powerAssertText : powerAssertText;
        }

        function _capt (value, espath) {
            events.push({value: value, espath: espath});
            return value;
        }

        function _expr (value, args) {
            var captured = events;
            events = [];
            return { powerAssertContext: {value: value, events: captured}, meta: {tree: args.tree, tokens: args.tokens}, source: {content: args.content, filepath: args.filepath} };
        }

        config.targetMethods.oneArg.forEach(function (methodName) {
            if (typeof target[methodName] === 'function') {
                enhancement[methodName] = decorateOneArg(target, target[methodName], doPowerAssert);
            }
        });
        config.targetMethods.twoArgs.forEach(function (methodName) {
            if (typeof target[methodName] === 'function') {
                enhancement[methodName] = decorateTwoArgs(target, target[methodName], doPowerAssert);
            }
        });

        enhancement._capt = _capt;
        enhancement._expr = _expr;
        return enhancement;
    }


    function isEspoweredValue (value) {
        return (typeof value !== 'undefined') && (typeof value.powerAssertContext !== 'undefined');
    }


    function decorateOneArg (target, baseAssert, doPowerAssert) {
        return function (arg1, message) {
            var context, val1;
            if (! isEspoweredValue(arg1)) {
                return baseAssert.apply(target, [arg1, message]);
            }
            val1 = arg1.powerAssertContext.value;
            context = {
                source: arg1.source,
                args: []
            };
            context.args.push({
                value: val1,
                events: arg1.powerAssertContext.events,
                meta: arg1.meta
            });
            return doPowerAssert(baseAssert, [val1], message, context);
        };
    }


    function decorateTwoArgs (target, baseAssert, doPowerAssert) {
        return function (arg1, arg2, message) {
            var context, val1, val2;
            if (!(isEspoweredValue(arg1) || isEspoweredValue(arg2))) {
                return baseAssert.apply(target, [arg1, arg2, message]);
            }

            if (isEspoweredValue(arg1)) {
                context = {
                    source: arg1.source,
                    args: []
                };
                context.args.push({
                    value: arg1.powerAssertContext.value,
                    events: arg1.powerAssertContext.events,
                    meta: arg1.meta
                });
                val1 = arg1.powerAssertContext.value;
            } else {
                val1 = arg1;
            }

            if (isEspoweredValue(arg2)) {
                if (!isEspoweredValue(arg1)) {
                    context = {
                        source: arg2.source,
                        args: []
                    };
                }
                context.args.push({
                    value: arg2.powerAssertContext.value,
                    events: arg2.powerAssertContext.events,
                    meta: arg2.meta
                });
                val2 = arg2.powerAssertContext.value;
            } else {
                val2 = arg2;
            }

            return doPowerAssert(baseAssert, [val1, val2], message, context);
        };
    }


    // borrowed from qunit.js
    function extend (a, b) {
        var prop;
        for (prop in b) {
            if (b.hasOwnProperty(prop)) {
                if (typeof b[prop] === 'undefined') {
                    delete a[prop];
                } else {
                    a[prop] = b[prop];
                }
            }
        }
        return a;
    }


    // using returnExports UMD pattern with substack pattern
    empower.defaultOptions = defaultOptions;
    return empower;
}));

},{}],8:[function(require,module,exports){
/**
 * power-assert-formatter.js - Power Assert output formatter
 *
 * https://github.com/twada/power-assert-formatter
 *
 * Copyright (c) 2013-2014 Takuto Wada
 * Licensed under the MIT license.
 *   https://raw.github.com/twada/power-assert-formatter/master/MIT-LICENSE.txt
 *
 * A part of extend function is:
 *   Copyright 2012 jQuery Foundation and other contributors
 *   Released under the MIT license.
 *   http://jquery.org/license
 */
(function (root, factory) {
    'use strict';

    // using returnExports UMD pattern
    if (typeof define === 'function' && define.amd) {
        define(['estraverse'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('estraverse'));
    } else {
        root.powerAssertFormatter = factory(root.estraverse);
    }
}(this, function (estraverse) {
    'use strict';

    var syntax = estraverse.Syntax;

    function defaultOptions () {
        return {
            lineSeparator: '\n',
            dump: jsonDump,
            widthOf: multibyteStringWidthOf
        };
    }


    function PowerAssertContextRenderer (dump, widthOf, context) {
        this.dump = dump;
        this.widthOf = widthOf;
        this.initialVertivalBarLength = 1;
        this.initWithContext(context);
    }

    PowerAssertContextRenderer.prototype.initWithContext = function (context) {
        var i, events = collectEvents(context);
        // console.log(JSON.stringify(context, null, 2));
        events.sort(rightToLeft);
        this.events = events;
        this.assertionLine = context.source.content;
        this.filepath = context.source.filepath;
        this.lineNumber = firstLineNumberFor(context);
        this.rows = [];
        for (i = 0; i <= this.initialVertivalBarLength; i += 1) {
            this.addOneMoreRow();
        }
    };

    PowerAssertContextRenderer.prototype.newRowFor = function (assertionLine) {
        return createRow(this.widthOf(assertionLine), ' ');
    };

    PowerAssertContextRenderer.prototype.addOneMoreRow = function () {
        this.rows.push(this.newRowFor(this.assertionLine));
    };

    PowerAssertContextRenderer.prototype.lastRow = function () {
        return this.rows[this.rows.length - 1];
    };

    PowerAssertContextRenderer.prototype.renderVerticalBarAt = function (columnIndex) {
        var i, lastRowIndex = this.rows.length - 1;
        for (i = 0; i < lastRowIndex; i += 1) {
            this.rows[i].splice(columnIndex, 1, '|');
        }
    };

    PowerAssertContextRenderer.prototype.renderValueAt = function (columnIndex, dumpedValue) {
        var i, width = this.widthOf(dumpedValue);
        for (i = 0; i < width; i += 1) {
            this.lastRow().splice(columnIndex + i, 1, dumpedValue.charAt(i));
        }
    };

    PowerAssertContextRenderer.prototype.isOverlapped = function (prevCapturing, nextCaputuring, dumpedValue) {
        return (typeof prevCapturing !== 'undefined') && this.startColumnFor(prevCapturing) <= (this.startColumnFor(nextCaputuring) + this.widthOf(dumpedValue));
    };

    PowerAssertContextRenderer.prototype.constructRows = function (capturedEvents) {
        var that = this,
            prevCaptured;
        capturedEvents.forEach(function (captured) {
            var dumpedValue = that.dump(captured.value);
            if (that.isOverlapped(prevCaptured, captured, dumpedValue)) {
                that.addOneMoreRow();
            }
            that.renderVerticalBarAt(that.startColumnFor(captured));
            that.renderValueAt(that.startColumnFor(captured), dumpedValue);
            prevCaptured = captured;
        });
    };

    PowerAssertContextRenderer.prototype.startColumnFor = function (captured) {
        return this.widthOf(this.assertionLine.slice(0, captured.location.start.column));
    };

    PowerAssertContextRenderer.prototype.renderLines = function () {
        var lines = [], lineNum = this.lineNumber;
        this.constructRows(this.events);
        if (this.filepath) {
            lines.push('# ' + [this.filepath, lineNum].join(':'));
        } else {
            lines.push('# at line: ' + lineNum);
        }
        lines.push('');
        lines.push(this.assertionLine);
        this.rows.forEach(function (columns) {
            lines.push(columns.join(''));
        });
        lines.push('');
        return lines;
    };


    function firstLineNumberFor(context) {
        var lineNums = context.args.map(function (arg) {
            return arg.meta.tree.loc.start.line;
        });
        lineNums.sort(function (a, b) {
            return b - a;
        });
        return lineNums[0];
    }


    function collectEvents(context) {
        var events = [];
        context.args.forEach(function (arg) {
            var tokens = arg.meta.tokens,
                espathList = arg.events.map(function (ev) {
                    return ev.espath;
                }),
                espathToValue = arg.events.reduce(function (accum, ev) {
                    accum[ev.espath] = ev.value;
                    return accum;
                }, {});
            // console.log(JSON.stringify(espathToValue, null, 2));
            // console.log(JSON.stringify(espathList, null, 2));
            // console.log(JSON.stringify(arg.meta.tree, null, 2));
            estraverse.traverse(arg.meta.tree, {
                enter: function (currentNode, parentNode) {
                    var controller = this,
                        path = controller.path(),
                        espath = path ? path.join('/') : '';
                    if ((typeof espathToValue[espath] === 'undefined') && (espathList.indexOf(espath) === -1)) {
                        return;
                    }
                    events.push({value: espathToValue[espath], espath: espath, location: locationOf(currentNode, tokens)});
                }
            });
        });
        return events;
    }


    function locationOf(currentNode, tokens) {
        switch(currentNode.type) {
        case syntax.MemberExpression:
            return propertyLocationOf(currentNode, tokens);
        case syntax.CallExpression:
            if (currentNode.callee.type === syntax.MemberExpression) {
                return propertyLocationOf(currentNode.callee, tokens);
            }
            break;
        case syntax.BinaryExpression:
        case syntax.LogicalExpression:
        case syntax.AssignmentExpression:
            return infixOperatorLocationOf(currentNode, tokens);
        default:
            break;
        }
        return currentNode.loc;
    }


    function searchToken(tokens, fromLine, toLine, predicate) {
        var i, token, found;
        for(i = 0; i < tokens.length; i += 1) {
            token = tokens[i];
            if (token.loc.start.line < fromLine) {
                continue;
            }
            if (toLine < token.loc.end.line) {
                break;
            }
            found = predicate(token, i);
            if (found) {
                return found;
            }
        }
        return undefined;
    }


    function findLeftBracketTokenOf(expression, tokens) {
        var fromColumn = expression.property.loc.start.column,
            fromLine = expression.loc.start.line,
            toLine = expression.property.loc.start.line;
        return searchToken(tokens, fromLine, toLine, function (token, index) {
            var prevToken;
            if (token.loc.start.column === fromColumn) {
                prevToken = tokens[index - 1];
                if (prevToken.type === 'Punctuator' && prevToken.value === '[') {
                    return prevToken;
                }
            }
            return undefined;
        });
    }


    function findOperatorTokenOf(expression, tokens) {
        var fromColumn = expression.left.loc.end.column,
            toColumn = expression.right.loc.start.column,
            fromLine = expression.left.loc.end.line,
            toLine = expression.right.loc.start.line;
        return searchToken(tokens, fromLine, toLine, function (token, index) {
            if (fromColumn < token.loc.start.column &&
                token.loc.end.column < toColumn &&
                token.type === 'Punctuator' &&
                token.value === expression.operator) {
                return token;
            }
            return undefined;
        });
    }


    // calculate location of infix operator for BinaryExpression, AssignmentExpression and LogicalExpression.
    function infixOperatorLocationOf (expression, tokens) {
        var token = findOperatorTokenOf(expression, tokens);
        if (token) {
            // console.log('TOKEN INDEX: ' + token.loc.start.column);
            return token.loc;
        }
        return expression.left.loc;
    }


    function propertyLocationOf(memberExpression, tokens) {
        var prop = memberExpression.property,
            token;
        if (memberExpression.computed) {
            token = findLeftBracketTokenOf(memberExpression, tokens);
            if (token) {
                return token.loc;
            }
        }
        return prop.loc;
    }


    function createRow (numCols, initial) {
        var row = [], i;
        for(i = 0; i < numCols; i += 1) {
            row[i] = initial;
        }
        return row;
    }


    function rightToLeft (a, b) {
        return b.location.start.column - a.location.start.column;
    }


    function multibyteStringWidthOf (str) {
        var i, c, width = 0;
        for(i = 0; i < str.length; i+=1){
            c = str.charCodeAt(i);
            if ((0x0 <= c && c < 0x81) || (c === 0xf8f0) || (0xff61 <= c && c < 0xffa0) || (0xf8f1 <= c && c < 0xf8f4)) {
                width += 1;
            } else {
                width += 2;
            }
        }
        return width;
    }


    function jsonDump (obj) {
        var seen = [],
            replacer = function(key, val) {
                if (typeof val === 'object' && val) {
                    if (seen.indexOf(val) !== -1) {
                        return '#Circular#';
                    }
                    seen.push(val);
                }
                return val;
            },
            str = JSON.stringify(obj, replacer);
        if (typeof str === 'undefined') {
            return 'undefined';
        }
        return str;
    }


    // borrowed from qunit.js
    function extend (a, b) {
        var prop;
        for (prop in b) {
            if (b.hasOwnProperty(prop)) {
                if (typeof b[prop] === 'undefined') {
                    delete a[prop];
                } else {
                    a[prop] = b[prop];
                }
            }
        }
        return a;
    }


    function create (options) {
        var config = extend(defaultOptions(), (options || {}));
        return function (context) {
            var renderer = new PowerAssertContextRenderer(config.dump, config.widthOf, context);
            return renderer.renderLines().join(config.lineSeparator);
        };
    }

    create.PowerAssertContextRenderer = PowerAssertContextRenderer;
    return create;
}));

},{"estraverse":9}],9:[function(require,module,exports){
/*
  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*jslint vars:false, bitwise:true*/
/*jshint indent:4*/
/*global exports:true, define:true*/
(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // and plain browser loading,
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.estraverse = {}));
    }
}(this, function (exports) {
    'use strict';

    var Syntax,
        isArray,
        VisitorOption,
        VisitorKeys,
        BREAK,
        SKIP;

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MethodDefinition: 'MethodDefinition',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    function ignoreJSHintError() { }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    function deepCopy(obj) {
        var ret = {}, key, val;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                val = obj[key];
                if (typeof val === 'object' && val !== null) {
                    ret[key] = deepCopy(val);
                } else {
                    ret[key] = val;
                }
            }
        }
        return ret;
    }

    function shallowCopy(obj) {
        var ret = {}, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }
    ignoreJSHintError(shallowCopy);

    // based on LLVM libc++ upper_bound / lower_bound
    // MIT License

    function upperBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                len = diff;
            } else {
                i = current + 1;
                len -= diff + 1;
            }
        }
        return i;
    }

    function lowerBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                i = current + 1;
                len -= diff + 1;
            } else {
                len = diff;
            }
        }
        return i;
    }
    ignoreJSHintError(lowerBound);

    VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        ArrayExpression: ['elements'],
        ArrayPattern: ['elements'],
        ArrowFunctionExpression: ['params', 'defaults', 'rest', 'body'],
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
        BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
        CatchClause: ['param', 'body'],
        ClassBody: ['body'],
        ClassDeclaration: ['id', 'body', 'superClass'],
        ClassExpression: ['id', 'body', 'superClass'],
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: ['body', 'test'],
        EmptyStatement: [],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'defaults', 'rest', 'body'],
        FunctionExpression: ['id', 'params', 'defaults', 'rest', 'body'],
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        Literal: [],
        LabeledStatement: ['label', 'body'],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        MethodDefinition: ['key', 'value'],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        ObjectPattern: ['properties'],
        Program: ['body'],
        Property: ['key', 'value'],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SwitchStatement: ['discriminant', 'cases'],
        SwitchCase: ['test', 'consequent'],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: ['block', 'handlers', 'handler', 'guardedHandlers', 'finalizer'],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id', 'init'],
        WhileStatement: ['test', 'body'],
        WithStatement: ['object', 'body'],
        YieldExpression: ['argument']
    };

    // unique id
    BREAK = {};
    SKIP = {};

    VisitorOption = {
        Break: BREAK,
        Skip: SKIP
    };

    function Reference(parent, key) {
        this.parent = parent;
        this.key = key;
    }

    Reference.prototype.replace = function replace(node) {
        this.parent[this.key] = node;
    };

    function Element(node, path, wrap, ref) {
        this.node = node;
        this.path = path;
        this.wrap = wrap;
        this.ref = ref;
    }

    function Controller() { }

    // API:
    // return property path array from root to current node
    Controller.prototype.path = function path() {
        var i, iz, j, jz, result, element;

        function addToPath(result, path) {
            if (isArray(path)) {
                for (j = 0, jz = path.length; j < jz; ++j) {
                    result.push(path[j]);
                }
            } else {
                result.push(path);
            }
        }

        // root node
        if (!this.__current.path) {
            return null;
        }

        // first node is sentinel, second node is root element
        result = [];
        for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {
            element = this.__leavelist[i];
            addToPath(result, element.path);
        }
        addToPath(result, this.__current.path);
        return result;
    };

    // API:
    // return array of parent elements
    Controller.prototype.parents = function parents() {
        var i, iz, result;

        // first node is sentinel
        result = [];
        for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
            result.push(this.__leavelist[i].node);
        }

        return result;
    };

    // API:
    // return current node
    Controller.prototype.current = function current() {
        return this.__current.node;
    };

    Controller.prototype.__execute = function __execute(callback, element) {
        var previous, result;

        result = undefined;

        previous  = this.__current;
        this.__current = element;
        this.__state = null;
        if (callback) {
            result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
        }
        this.__current = previous;

        return result;
    };

    // API:
    // notify control skip / break
    Controller.prototype.notify = function notify(flag) {
        this.__state = flag;
    };

    // API:
    // skip child nodes of current node
    Controller.prototype.skip = function () {
        this.notify(SKIP);
    };

    // API:
    // break traversals
    Controller.prototype['break'] = function () {
        this.notify(BREAK);
    };

    Controller.prototype.__initialize = function(root, visitor) {
        this.visitor = visitor;
        this.root = root;
        this.__worklist = [];
        this.__leavelist = [];
        this.__current = null;
        this.__state = null;
    };

    Controller.prototype.traverse = function traverse(root, visitor) {
        var worklist,
            leavelist,
            element,
            node,
            nodeType,
            ret,
            key,
            current,
            current2,
            candidates,
            candidate,
            sentinel;

        this.__initialize(root, visitor);

        sentinel = {};

        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;

        // initialize
        worklist.push(new Element(root, null, null, null));
        leavelist.push(new Element(null, null, null, null));

        while (worklist.length) {
            element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                ret = this.__execute(visitor.leave, element);

                if (this.__state === BREAK || ret === BREAK) {
                    return;
                }
                continue;
            }

            if (element.node) {

                ret = this.__execute(visitor.enter, element);

                if (this.__state === BREAK || ret === BREAK) {
                    return;
                }

                worklist.push(sentinel);
                leavelist.push(element);

                if (this.__state === SKIP || ret === SKIP) {
                    continue;
                }

                node = element.node;
                nodeType = element.wrap || node.type;
                candidates = VisitorKeys[nodeType];

                current = candidates.length;
                while ((current -= 1) >= 0) {
                    key = candidates[current];
                    candidate = node[key];
                    if (!candidate) {
                        continue;
                    }

                    if (!isArray(candidate)) {
                        worklist.push(new Element(candidate, key, null, null));
                        continue;
                    }

                    current2 = candidate.length;
                    while ((current2 -= 1) >= 0) {
                        if (!candidate[current2]) {
                            continue;
                        }
                        if ((nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && 'properties' === candidates[current]) {
                            element = new Element(candidate[current2], [key, current2], 'Property', null);
                        } else {
                            element = new Element(candidate[current2], [key, current2], null, null);
                        }
                        worklist.push(element);
                    }
                }
            }
        }
    };

    Controller.prototype.replace = function replace(root, visitor) {
        var worklist,
            leavelist,
            node,
            nodeType,
            target,
            element,
            current,
            current2,
            candidates,
            candidate,
            sentinel,
            outer,
            key;

        this.__initialize(root, visitor);

        sentinel = {};

        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;

        // initialize
        outer = {
            root: root
        };
        element = new Element(root, null, null, new Reference(outer, 'root'));
        worklist.push(element);
        leavelist.push(element);

        while (worklist.length) {
            element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                target = this.__execute(visitor.leave, element);

                // node may be replaced with null,
                // so distinguish between undefined and null in this place
                if (target !== undefined && target !== BREAK && target !== SKIP) {
                    // replace
                    element.ref.replace(target);
                }

                if (this.__state === BREAK || target === BREAK) {
                    return outer.root;
                }
                continue;
            }

            target = this.__execute(visitor.enter, element);

            // node may be replaced with null,
            // so distinguish between undefined and null in this place
            if (target !== undefined && target !== BREAK && target !== SKIP) {
                // replace
                element.ref.replace(target);
                element.node = target;
            }

            if (this.__state === BREAK || target === BREAK) {
                return outer.root;
            }

            // node may be null
            node = element.node;
            if (!node) {
                continue;
            }

            worklist.push(sentinel);
            leavelist.push(element);

            if (this.__state === SKIP || target === SKIP) {
                continue;
            }

            nodeType = element.wrap || node.type;
            candidates = VisitorKeys[nodeType];

            current = candidates.length;
            while ((current -= 1) >= 0) {
                key = candidates[current];
                candidate = node[key];
                if (!candidate) {
                    continue;
                }

                if (!isArray(candidate)) {
                    worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                    continue;
                }

                current2 = candidate.length;
                while ((current2 -= 1) >= 0) {
                    if (!candidate[current2]) {
                        continue;
                    }
                    if (nodeType === Syntax.ObjectExpression && 'properties' === candidates[current]) {
                        element = new Element(candidate[current2], [key, current2], 'Property', new Reference(candidate, current2));
                    } else {
                        element = new Element(candidate[current2], [key, current2], null, new Reference(candidate, current2));
                    }
                    worklist.push(element);
                }
            }
        }

        return outer.root;
    };

    function traverse(root, visitor) {
        var controller = new Controller();
        return controller.traverse(root, visitor);
    }

    function replace(root, visitor) {
        var controller = new Controller();
        return controller.replace(root, visitor);
    }

    function extendCommentRange(comment, tokens) {
        var target;

        target = upperBound(tokens, function search(token) {
            return token.range[0] > comment.range[0];
        });

        comment.extendedRange = [comment.range[0], comment.range[1]];

        if (target !== tokens.length) {
            comment.extendedRange[1] = tokens[target].range[0];
        }

        target -= 1;
        if (target >= 0) {
            comment.extendedRange[0] = tokens[target].range[1];
        }

        return comment;
    }

    function attachComments(tree, providedComments, tokens) {
        // At first, we should calculate extended comment ranges.
        var comments = [], comment, len, i, cursor;

        if (!tree.range) {
            throw new Error('attachComments needs range information');
        }

        // tokens array is empty, we attach comments to tree as 'leadingComments'
        if (!tokens.length) {
            if (providedComments.length) {
                for (i = 0, len = providedComments.length; i < len; i += 1) {
                    comment = deepCopy(providedComments[i]);
                    comment.extendedRange = [0, tree.range[0]];
                    comments.push(comment);
                }
                tree.leadingComments = comments;
            }
            return tree;
        }

        for (i = 0, len = providedComments.length; i < len; i += 1) {
            comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        }

        // This is based on John Freeman's implementation.
        cursor = 0;
        traverse(tree, {
            enter: function (node) {
                var comment;

                while (cursor < comments.length) {
                    comment = comments[cursor];
                    if (comment.extendedRange[1] > node.range[0]) {
                        break;
                    }

                    if (comment.extendedRange[1] === node.range[0]) {
                        if (!node.leadingComments) {
                            node.leadingComments = [];
                        }
                        node.leadingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor += 1;
                    }
                }

                // already out of owned node
                if (cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        cursor = 0;
        traverse(tree, {
            leave: function (node) {
                var comment;

                while (cursor < comments.length) {
                    comment = comments[cursor];
                    if (node.range[1] < comment.extendedRange[0]) {
                        break;
                    }

                    if (node.range[1] === comment.extendedRange[0]) {
                        if (!node.trailingComments) {
                            node.trailingComments = [];
                        }
                        node.trailingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor += 1;
                    }
                }

                // already out of owned node
                if (cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        return tree;
    }

    exports.version = '1.3.3-dev';
    exports.Syntax = Syntax;
    exports.traverse = traverse;
    exports.replace = replace;
    exports.attachComments = attachComments;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
    exports.Controller = Controller;
}));
/* vim: set sw=4 ts=4 et tw=80 : */

},{}],10:[function(require,module,exports){
var assert, data;
assert = require('power-assert');
data = app.$data;
describe('vote method', function () {
    return it('should add +1 like', function () {
        var actual, items;
        items = [
            {
                id: 1,
                like: 10
            },
            {
                id: 2,
                like: 10
            },
            {
                id: 3,
                like: 10
            }
        ];
        actual = data.items = items;
        app.vote(2);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(actual, 'left/object/object')[0], 'left/object').like, 'left') === 10, ''), {
            tree: {
                'type': 'BinaryExpression',
                'operator': '===',
                'left': {
                    'type': 'MemberExpression',
                    'computed': false,
                    'object': {
                        'type': 'MemberExpression',
                        'computed': true,
                        'object': {
                            'type': 'Identifier',
                            'name': 'actual',
                            'loc': {
                                'start': {
                                    'line': 24,
                                    'column': 14
                                },
                                'end': {
                                    'line': 24,
                                    'column': 20
                                },
                                'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                            }
                        },
                        'property': {
                            'type': 'Literal',
                            'value': 0,
                            'raw': '0',
                            'loc': {
                                'start': {
                                    'line': 24,
                                    'column': 21
                                },
                                'end': {
                                    'line': 24,
                                    'column': 22
                                },
                                'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                            }
                        },
                        'loc': {
                            'start': {
                                'line': 24,
                                'column': 14
                            },
                            'end': {
                                'line': 24,
                                'column': 23
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'property': {
                        'type': 'Identifier',
                        'name': 'like',
                        'loc': {
                            'start': {
                                'line': 24,
                                'column': 24
                            },
                            'end': {
                                'line': 24,
                                'column': 28
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'loc': {
                        'start': {
                            'line': 24,
                            'column': 14
                        },
                        'end': {
                            'line': 24,
                            'column': 28
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'right': {
                    'type': 'Literal',
                    'value': 10,
                    'raw': '10',
                    'loc': {
                        'start': {
                            'line': 24,
                            'column': 33
                        },
                        'end': {
                            'line': 24,
                            'column': 35
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'loc': {
                    'start': {
                        'line': 24,
                        'column': 14
                    },
                    'end': {
                        'line': 24,
                        'column': 35
                    },
                    'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                }
            },
            tokens: [
                {
                    'type': 'Identifier',
                    'value': 'actual',
                    'loc': {
                        'start': {
                            'line': 24,
                            'column': 14
                        },
                        'end': {
                            'line': 24,
                            'column': 20
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '[',
                    'loc': {
                        'start': {
                            'line': 24,
                            'column': 20
                        },
                        'end': {
                            'line': 24,
                            'column': 21
                        }
                    }
                },
                {
                    'type': 'Numeric',
                    'value': '0',
                    'loc': {
                        'start': {
                            'line': 24,
                            'column': 21
                        },
                        'end': {
                            'line': 24,
                            'column': 22
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': ']',
                    'loc': {
                        'start': {
                            'line': 24,
                            'column': 22
                        },
                        'end': {
                            'line': 24,
                            'column': 23
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '.',
                    'loc': {
                        'start': {
                            'line': 24,
                            'column': 23
                        },
                        'end': {
                            'line': 24,
                            'column': 24
                        }
                    }
                },
                {
                    'type': 'Identifier',
                    'value': 'like',
                    'loc': {
                        'start': {
                            'line': 24,
                            'column': 24
                        },
                        'end': {
                            'line': 24,
                            'column': 28
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '===',
                    'loc': {
                        'start': {
                            'line': 24,
                            'column': 29
                        },
                        'end': {
                            'line': 24,
                            'column': 32
                        }
                    }
                },
                {
                    'type': 'Numeric',
                    'value': '10',
                    'loc': {
                        'start': {
                            'line': 24,
                            'column': 33
                        },
                        'end': {
                            'line': 24,
                            'column': 35
                        }
                    }
                }
            ],
            content: '    assert.ok(actual[0].like === 10, \'id:1 is not target\');',
            filepath: '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
        }), 'id:1 is not target');
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(actual, 'left/object/object')[1], 'left/object').like, 'left') === 11, ''), {
            tree: {
                'type': 'BinaryExpression',
                'operator': '===',
                'left': {
                    'type': 'MemberExpression',
                    'computed': false,
                    'object': {
                        'type': 'MemberExpression',
                        'computed': true,
                        'object': {
                            'type': 'Identifier',
                            'name': 'actual',
                            'loc': {
                                'start': {
                                    'line': 25,
                                    'column': 14
                                },
                                'end': {
                                    'line': 25,
                                    'column': 20
                                },
                                'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                            }
                        },
                        'property': {
                            'type': 'Literal',
                            'value': 1,
                            'raw': '1',
                            'loc': {
                                'start': {
                                    'line': 25,
                                    'column': 21
                                },
                                'end': {
                                    'line': 25,
                                    'column': 22
                                },
                                'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                            }
                        },
                        'loc': {
                            'start': {
                                'line': 25,
                                'column': 14
                            },
                            'end': {
                                'line': 25,
                                'column': 23
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'property': {
                        'type': 'Identifier',
                        'name': 'like',
                        'loc': {
                            'start': {
                                'line': 25,
                                'column': 24
                            },
                            'end': {
                                'line': 25,
                                'column': 28
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'loc': {
                        'start': {
                            'line': 25,
                            'column': 14
                        },
                        'end': {
                            'line': 25,
                            'column': 28
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'right': {
                    'type': 'Literal',
                    'value': 11,
                    'raw': '11',
                    'loc': {
                        'start': {
                            'line': 25,
                            'column': 33
                        },
                        'end': {
                            'line': 25,
                            'column': 35
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'loc': {
                    'start': {
                        'line': 25,
                        'column': 14
                    },
                    'end': {
                        'line': 25,
                        'column': 35
                    },
                    'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                }
            },
            tokens: [
                {
                    'type': 'Identifier',
                    'value': 'actual',
                    'loc': {
                        'start': {
                            'line': 25,
                            'column': 14
                        },
                        'end': {
                            'line': 25,
                            'column': 20
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '[',
                    'loc': {
                        'start': {
                            'line': 25,
                            'column': 20
                        },
                        'end': {
                            'line': 25,
                            'column': 21
                        }
                    }
                },
                {
                    'type': 'Numeric',
                    'value': '1',
                    'loc': {
                        'start': {
                            'line': 25,
                            'column': 21
                        },
                        'end': {
                            'line': 25,
                            'column': 22
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': ']',
                    'loc': {
                        'start': {
                            'line': 25,
                            'column': 22
                        },
                        'end': {
                            'line': 25,
                            'column': 23
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '.',
                    'loc': {
                        'start': {
                            'line': 25,
                            'column': 23
                        },
                        'end': {
                            'line': 25,
                            'column': 24
                        }
                    }
                },
                {
                    'type': 'Identifier',
                    'value': 'like',
                    'loc': {
                        'start': {
                            'line': 25,
                            'column': 24
                        },
                        'end': {
                            'line': 25,
                            'column': 28
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '===',
                    'loc': {
                        'start': {
                            'line': 25,
                            'column': 29
                        },
                        'end': {
                            'line': 25,
                            'column': 32
                        }
                    }
                },
                {
                    'type': 'Numeric',
                    'value': '11',
                    'loc': {
                        'start': {
                            'line': 25,
                            'column': 33
                        },
                        'end': {
                            'line': 25,
                            'column': 35
                        }
                    }
                }
            ],
            content: '    assert.ok(actual[1].like === 11, \'id:2 is target\');',
            filepath: '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
        }), 'id:2 is target');
        return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(actual, 'left/object/object')[2], 'left/object').like, 'left') === 10, ''), {
            tree: {
                'type': 'BinaryExpression',
                'operator': '===',
                'left': {
                    'type': 'MemberExpression',
                    'computed': false,
                    'object': {
                        'type': 'MemberExpression',
                        'computed': true,
                        'object': {
                            'type': 'Identifier',
                            'name': 'actual',
                            'loc': {
                                'start': {
                                    'line': 26,
                                    'column': 21
                                },
                                'end': {
                                    'line': 26,
                                    'column': 27
                                },
                                'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                            }
                        },
                        'property': {
                            'type': 'Literal',
                            'value': 2,
                            'raw': '2',
                            'loc': {
                                'start': {
                                    'line': 26,
                                    'column': 28
                                },
                                'end': {
                                    'line': 26,
                                    'column': 29
                                },
                                'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                            }
                        },
                        'loc': {
                            'start': {
                                'line': 26,
                                'column': 21
                            },
                            'end': {
                                'line': 26,
                                'column': 30
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'property': {
                        'type': 'Identifier',
                        'name': 'like',
                        'loc': {
                            'start': {
                                'line': 26,
                                'column': 31
                            },
                            'end': {
                                'line': 26,
                                'column': 35
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'loc': {
                        'start': {
                            'line': 26,
                            'column': 21
                        },
                        'end': {
                            'line': 26,
                            'column': 35
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'right': {
                    'type': 'Literal',
                    'value': 10,
                    'raw': '10',
                    'loc': {
                        'start': {
                            'line': 26,
                            'column': 40
                        },
                        'end': {
                            'line': 26,
                            'column': 42
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'loc': {
                    'start': {
                        'line': 26,
                        'column': 21
                    },
                    'end': {
                        'line': 26,
                        'column': 42
                    },
                    'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                }
            },
            tokens: [
                {
                    'type': 'Identifier',
                    'value': 'actual',
                    'loc': {
                        'start': {
                            'line': 26,
                            'column': 21
                        },
                        'end': {
                            'line': 26,
                            'column': 27
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '[',
                    'loc': {
                        'start': {
                            'line': 26,
                            'column': 27
                        },
                        'end': {
                            'line': 26,
                            'column': 28
                        }
                    }
                },
                {
                    'type': 'Numeric',
                    'value': '2',
                    'loc': {
                        'start': {
                            'line': 26,
                            'column': 28
                        },
                        'end': {
                            'line': 26,
                            'column': 29
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': ']',
                    'loc': {
                        'start': {
                            'line': 26,
                            'column': 29
                        },
                        'end': {
                            'line': 26,
                            'column': 30
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '.',
                    'loc': {
                        'start': {
                            'line': 26,
                            'column': 30
                        },
                        'end': {
                            'line': 26,
                            'column': 31
                        }
                    }
                },
                {
                    'type': 'Identifier',
                    'value': 'like',
                    'loc': {
                        'start': {
                            'line': 26,
                            'column': 31
                        },
                        'end': {
                            'line': 26,
                            'column': 35
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '===',
                    'loc': {
                        'start': {
                            'line': 26,
                            'column': 36
                        },
                        'end': {
                            'line': 26,
                            'column': 39
                        }
                    }
                },
                {
                    'type': 'Numeric',
                    'value': '10',
                    'loc': {
                        'start': {
                            'line': 26,
                            'column': 40
                        },
                        'end': {
                            'line': 26,
                            'column': 42
                        }
                    }
                }
            ],
            content: '    return assert.ok(actual[2].like === 10, \'id:3 is not target\');',
            filepath: '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
        }), 'id:3 is not target');
    });
});
describe('add method', function () {
    return it('should add a new item with max+1 id', function () {
        var actual, items;
        items = [
            {
                id: 1,
                like: 10
            },
            {
                id: 2,
                like: 10
            },
            {
                id: 3,
                like: 10
            }
        ];
        actual = data.items = items;
        app.add({ title: 'added' });
        return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(actual, 'left/object/object')[3], 'left/object').id, 'left') === 4, ''), {
            tree: {
                'type': 'BinaryExpression',
                'operator': '===',
                'left': {
                    'type': 'MemberExpression',
                    'computed': false,
                    'object': {
                        'type': 'MemberExpression',
                        'computed': true,
                        'object': {
                            'type': 'Identifier',
                            'name': 'actual',
                            'loc': {
                                'start': {
                                    'line': 49,
                                    'column': 21
                                },
                                'end': {
                                    'line': 49,
                                    'column': 27
                                },
                                'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                            }
                        },
                        'property': {
                            'type': 'Literal',
                            'value': 3,
                            'raw': '3',
                            'loc': {
                                'start': {
                                    'line': 49,
                                    'column': 28
                                },
                                'end': {
                                    'line': 49,
                                    'column': 29
                                },
                                'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                            }
                        },
                        'loc': {
                            'start': {
                                'line': 49,
                                'column': 21
                            },
                            'end': {
                                'line': 49,
                                'column': 30
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'property': {
                        'type': 'Identifier',
                        'name': 'id',
                        'loc': {
                            'start': {
                                'line': 49,
                                'column': 31
                            },
                            'end': {
                                'line': 49,
                                'column': 33
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'loc': {
                        'start': {
                            'line': 49,
                            'column': 21
                        },
                        'end': {
                            'line': 49,
                            'column': 33
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'right': {
                    'type': 'Literal',
                    'value': 4,
                    'raw': '4',
                    'loc': {
                        'start': {
                            'line': 49,
                            'column': 38
                        },
                        'end': {
                            'line': 49,
                            'column': 39
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'loc': {
                    'start': {
                        'line': 49,
                        'column': 21
                    },
                    'end': {
                        'line': 49,
                        'column': 39
                    },
                    'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                }
            },
            tokens: [
                {
                    'type': 'Identifier',
                    'value': 'actual',
                    'loc': {
                        'start': {
                            'line': 49,
                            'column': 21
                        },
                        'end': {
                            'line': 49,
                            'column': 27
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '[',
                    'loc': {
                        'start': {
                            'line': 49,
                            'column': 27
                        },
                        'end': {
                            'line': 49,
                            'column': 28
                        }
                    }
                },
                {
                    'type': 'Numeric',
                    'value': '3',
                    'loc': {
                        'start': {
                            'line': 49,
                            'column': 28
                        },
                        'end': {
                            'line': 49,
                            'column': 29
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': ']',
                    'loc': {
                        'start': {
                            'line': 49,
                            'column': 29
                        },
                        'end': {
                            'line': 49,
                            'column': 30
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '.',
                    'loc': {
                        'start': {
                            'line': 49,
                            'column': 30
                        },
                        'end': {
                            'line': 49,
                            'column': 31
                        }
                    }
                },
                {
                    'type': 'Identifier',
                    'value': 'id',
                    'loc': {
                        'start': {
                            'line': 49,
                            'column': 31
                        },
                        'end': {
                            'line': 49,
                            'column': 33
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '===',
                    'loc': {
                        'start': {
                            'line': 49,
                            'column': 34
                        },
                        'end': {
                            'line': 49,
                            'column': 37
                        }
                    }
                },
                {
                    'type': 'Numeric',
                    'value': '4',
                    'loc': {
                        'start': {
                            'line': 49,
                            'column': 38
                        },
                        'end': {
                            'line': 49,
                            'column': 39
                        }
                    }
                }
            ],
            content: '    return assert.ok(actual[3].id === 4);',
            filepath: '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
        }));
    });
});
describe('find method', function () {
    return it('should return item', function () {
        var actual, item, items;
        items = [
            {
                id: 1,
                like: 10
            },
            {
                id: 2,
                like: 11
            },
            {
                id: 3,
                like: 12
            }
        ];
        data.items = items;
        actual = item = app.find(2);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(actual, 'left/object').id, 'left') === 2, ''), {
            tree: {
                'type': 'BinaryExpression',
                'operator': '===',
                'left': {
                    'type': 'MemberExpression',
                    'computed': false,
                    'object': {
                        'type': 'Identifier',
                        'name': 'actual',
                        'loc': {
                            'start': {
                                'line': 70,
                                'column': 14
                            },
                            'end': {
                                'line': 70,
                                'column': 20
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'property': {
                        'type': 'Identifier',
                        'name': 'id',
                        'loc': {
                            'start': {
                                'line': 70,
                                'column': 21
                            },
                            'end': {
                                'line': 70,
                                'column': 23
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'loc': {
                        'start': {
                            'line': 70,
                            'column': 14
                        },
                        'end': {
                            'line': 70,
                            'column': 23
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'right': {
                    'type': 'Literal',
                    'value': 2,
                    'raw': '2',
                    'loc': {
                        'start': {
                            'line': 70,
                            'column': 28
                        },
                        'end': {
                            'line': 70,
                            'column': 29
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'loc': {
                    'start': {
                        'line': 70,
                        'column': 14
                    },
                    'end': {
                        'line': 70,
                        'column': 29
                    },
                    'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                }
            },
            tokens: [
                {
                    'type': 'Identifier',
                    'value': 'actual',
                    'loc': {
                        'start': {
                            'line': 70,
                            'column': 14
                        },
                        'end': {
                            'line': 70,
                            'column': 20
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '.',
                    'loc': {
                        'start': {
                            'line': 70,
                            'column': 20
                        },
                        'end': {
                            'line': 70,
                            'column': 21
                        }
                    }
                },
                {
                    'type': 'Identifier',
                    'value': 'id',
                    'loc': {
                        'start': {
                            'line': 70,
                            'column': 21
                        },
                        'end': {
                            'line': 70,
                            'column': 23
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '===',
                    'loc': {
                        'start': {
                            'line': 70,
                            'column': 24
                        },
                        'end': {
                            'line': 70,
                            'column': 27
                        }
                    }
                },
                {
                    'type': 'Numeric',
                    'value': '2',
                    'loc': {
                        'start': {
                            'line': 70,
                            'column': 28
                        },
                        'end': {
                            'line': 70,
                            'column': 29
                        }
                    }
                }
            ],
            content: '    assert.ok(actual.id === 2);',
            filepath: '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
        }));
        return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(actual, 'left/object').like, 'left') === 11, ''), {
            tree: {
                'type': 'BinaryExpression',
                'operator': '===',
                'left': {
                    'type': 'MemberExpression',
                    'computed': false,
                    'object': {
                        'type': 'Identifier',
                        'name': 'actual',
                        'loc': {
                            'start': {
                                'line': 71,
                                'column': 21
                            },
                            'end': {
                                'line': 71,
                                'column': 27
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'property': {
                        'type': 'Identifier',
                        'name': 'like',
                        'loc': {
                            'start': {
                                'line': 71,
                                'column': 28
                            },
                            'end': {
                                'line': 71,
                                'column': 32
                            },
                            'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                        }
                    },
                    'loc': {
                        'start': {
                            'line': 71,
                            'column': 21
                        },
                        'end': {
                            'line': 71,
                            'column': 32
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'right': {
                    'type': 'Literal',
                    'value': 11,
                    'raw': '11',
                    'loc': {
                        'start': {
                            'line': 71,
                            'column': 37
                        },
                        'end': {
                            'line': 71,
                            'column': 39
                        },
                        'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                    }
                },
                'loc': {
                    'start': {
                        'line': 71,
                        'column': 21
                    },
                    'end': {
                        'line': 71,
                        'column': 39
                    },
                    'source': '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
                }
            },
            tokens: [
                {
                    'type': 'Identifier',
                    'value': 'actual',
                    'loc': {
                        'start': {
                            'line': 71,
                            'column': 21
                        },
                        'end': {
                            'line': 71,
                            'column': 27
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '.',
                    'loc': {
                        'start': {
                            'line': 71,
                            'column': 27
                        },
                        'end': {
                            'line': 71,
                            'column': 28
                        }
                    }
                },
                {
                    'type': 'Identifier',
                    'value': 'like',
                    'loc': {
                        'start': {
                            'line': 71,
                            'column': 28
                        },
                        'end': {
                            'line': 71,
                            'column': 32
                        }
                    }
                },
                {
                    'type': 'Punctuator',
                    'value': '===',
                    'loc': {
                        'start': {
                            'line': 71,
                            'column': 33
                        },
                        'end': {
                            'line': 71,
                            'column': 36
                        }
                    }
                },
                {
                    'type': 'Numeric',
                    'value': '11',
                    'loc': {
                        'start': {
                            'line': 71,
                            'column': 37
                        },
                        'end': {
                            'line': 71,
                            'column': 39
                        }
                    }
                }
            ],
            content: '    return assert.ok(actual.like === 11);',
            filepath: '/private/var/www/GroupWorkBase/public_html/front/demo/vote-browserify/test/test.coffee'
        }));
    });
});


},{"power-assert":6}]},{},[10])