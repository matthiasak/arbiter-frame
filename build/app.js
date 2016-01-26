'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _babelPolyfill = require('babel-polyfill');

var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

var _universalUtils = require('universal-utils');

var u = _interopRequireWildcard(_universalUtils);

var _babelPresetEs = require('babel-preset-es2015');

var _babelPresetEs2 = _interopRequireDefault(_babelPresetEs);

var _babelPresetStage = require('babel-preset-stage-0');

var _babelPresetStage2 = _interopRequireDefault(_babelPresetStage);

var _babelPresetReact = require('babel-preset-react');

var _babelPresetReact2 = _interopRequireDefault(_babelPresetReact);

var _codemirror = require('codemirror');

var _codemirror2 = _interopRequireDefault(_codemirror);

var _javascript = require('codemirror/mode/javascript/javascript');

var _javascript2 = _interopRequireDefault(_javascript);

var _comment = require('codemirror/addon/comment/comment');

var _comment2 = _interopRequireDefault(_comment);

var _sublime = require('codemirror/keymap/sublime');

var _sublime2 = _interopRequireDefault(_sublime);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // es5, 6, and 7 polyfills, powered by babel

// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
// require("isomorphic-fetch")

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc

var mount = u.mount;
var m = u.m;
var update = u.update;
var store = u.store;
var container = u.container;
var rAF = u.rAF;
var debounce = u.debounce;
var qs = u.qs;
var router = u.router;
var _fetch = u.fetch;
var channel = u.channel;

// the following line, if uncommented, will enable browserify to push
// a changed file to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets

if (module.hot) {
    module.hot.accept();
    module.hot.dispose(function () {
        // app()
        update();
    });
}

var Babel = require('babel-core');

var presets = [_babelPresetEs2.default, _babelPresetStage2.default, _babelPresetReact2.default];

// import {container, resolver, m} from 'mithril-resolver'

String.prototype.hashCode = function () {
    var hash = 0,
        i,
        chr,
        len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

var directions = '/* (1) code your JS as normal.\n * (2) parsing and operational errors will be displayed in a popover.\n * (3) CMD+S to share a link to your code.\n *\n * Other things to note: this tool compiles es7/6 (es2015/2016) into es5, sends it\n * to an iframe, and polyfills most missing functionality. Thus, for built-in AJAX,\n * you can use fetch(), and for built-in Promises you can use the es6 Promise() spec.\n *\n * What else works with Arbiter? ... Everything! Arbiter uses babel-core to transpile\n * JavaScript right here, in your browser. You can see the latest and\n * greatest Babel features at https://babeljs.io/docs/learn-es2015/.\n *\n * require() any package like so:\n *\n * --------\n * require(\'react\', \'lodash\').then() => // load multiple libs, too!\n *     let React = react\n *     // ... use React as normal\n * )\n *\n * or require any specific version with semver:\n * require(\'lodash@^3.0.1\')\n * require(\'react@0.14.1\')\n * --------\n *\n * Built with love by @matthiasak\n * - http://mkeas.org\n * - http://github.com/matthiasak\n * */';

// Check for ServiceWorker support before trying to install it
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./serviceworker.js').then(function () {
        // Registration was successful
        console.info('registration success');
    }).catch(function () {
        console.error('registration failed');
        // Registration failed
    });
} else {
        // No ServiceWorker Support
    }

var program = unescape(window.location.hash.slice(1)) || directions + '\n\nlet canvas = document.createElement(\'canvas\'),\n    {body} = document,\n    c = canvas.getContext(\'2d\')\n\nbody.appendChild(canvas)\n\ncanvas.width = body.offsetWidth\ncanvas.height = body.offsetHeight\n\nc.fillStyle = \'#f449f0\'\nc.fillRect(0,0,500,400)\n\nc.fillStyle = \'white\'\nc.fillRect(50,50,20,20)\n';

function prepEnvironment() {
    // Disable Context Menu
    document.oncontextmenu = function () {
        return false;
    };

    // Disable dragging of HTML elements
    document.ondragstart = function () {
        return false;
    };
}
prepEnvironment();

var key = 'AIzaSyC70EBqy70L7fzc19pm_CBczzBxOK-JnhU';
var urlShortener = function urlShortener() {
    googleShortener(window.location.toString());
};
var googleShortener = function googleShortener(longUrl) {
    return fetch('https://www.googleapis.com/urlshortener/v1/url?key=' + key, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ longUrl: longUrl })
    }).then(function (r) {
        return r.json();
    }).then(function (data) {
        window.prompt("Copy URL to clipboard:", data.id);
    });
};

/**
 * TRANSDUCER stuff
 */

// resources
var clone = function clone(data) {
    return typeof data === 'undefined' ? data : JSON.parse(JSON.stringify(data));
};
var concat = function concat(arr, x) {
    return arr.concat([x]);
};
var compose = function compose(f, g) {
    return function (x) {
        return f(g(x));
    };
};
var each = function each(c, cb) {
    return c.forEach(cb);
};
var c = compose;
var map = function map(c, transform) {
    return c.map(transform);
};
var reduce = function reduce(c, reducer, initial) {
    return c.reduce(reducer, initial);
};
var filter = function filter(c, pred) {
    return c.filter(pred);
};
var ident = function ident(x) {
    return x;
};
var until = function until(c, pred) {
    var hasBeenReached = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    return c.reduce(function (a, v) {
        !hasBeenReached && !(hasBeenReached = pred(v)) && a.push(v);
        return a;
    }, []);
};
var last = function last(c) {
    return c[c.length > 1 ? c.length - 1 : 0];
};
var head = function head(c) {
    return c[0];
};
var rest = function rest(c) {
    return c.slice(1);
};
var find = function find(c, pred) {
    for (var i = 0, len = c.length; i < len; i++) {
        var r = c[i];
        if (pred(r)) return r;
    }
    return null;
};
var concatAll = function concatAll(cc) {
    var _ref;

    return (_ref = []).concat.apply(_ref, _toConsumableArray(cc));
};
var ignores = function ignores(c, ignore) {
    return filter(c, function (x) {
        return ignore.indexOf(x) === -1;
    });
};
var count = function count(a) {
    return a.length;
};

var prop = function prop(val, onSet) {
    return function (x) {
        if (!arguments.length) return val;
        val = x;
        onSet instanceof Function && onSet(x, val);
        return val;
    };
};

// const chan = () => {
//     const dests = new Set(),
//         pipe = (...args) => {
//             for(var x of dests) x(...args)
//         }

//     return {
//         from: cb => cb(pipe),
//         to: cb => dests.add(cb),
//         unto: cb => dests.remove(cb),
//         send: (...args) => pipe(...args)
//     }
// }

var channels = {
    codeEdited: channel(),
    logEmitted: channel(),
    codeCleared: channel(),
    errorOccurred: channel(),
    codeAnalyzed: channel()
};

var computable = function computable(fn) {
    return function () {
        // m.startComputation()
        var val = fn.apply(undefined, arguments);
        update();
        // m.endComputation()
        return val;
    };
};

var prefix_code = function prefix_code(code) {
    return '\nconst _log = (arg) => {\n    if(typeof arg === \'function\') return arg+\'\'\n    if(arg instanceof Object) return JSON.stringify(arg)\n    return arg\n}\n\nconst range = (min, max) =>\n    min + Math.round(Math.random() * (max-min))\n\nconst reset = () => window.parent.reset()\n\nconst each = (c, fn) => c.forEach(fn)\n\nconst assert = (...args) => window.parent.assert(...args)\n\n// https://wzrd.in/standalone/semver\n// https://npmcdn.com/semver\n\nconst __r = (semver, url=\'https://wzrd.in/standalone/\') =>\n    ((localStorage && (url+semver) in localStorage) ?\n        new Promise((res,rej) => res(localStorage[url+semver])) :\n        fetch(url+semver).then(x => x.text()).then(x => localStorage[url+semver] = x))\n        .then(x => eval(x))\n        .catch((e) => log(e+\' --- \'+url+semver))\n\nconst require = (...libs) =>\n    Promise.all(libs.map(l =>\n        __r(l)))\n\nconst clearAll = () =>\n    Object.keys(localStorage).map(x =>\n        localStorage.clear(x))\n\nconst log = (...args) => {\n    let x = args.map(_log)\n    each(x, i => {\n        window.parent.addLog(i)\n    })\n}\n\n' + code + '\n';
};

var iframe_el = prop();

var analyze = function analyze(program) {
    try {
        (function () {
            window.location.hash = '#' + escape(program.trim());

            var result = Babel.transform(prefix_code(program), { presets: presets });
            var code = result.code;

            channels.codeAnalyzed.spawn(regeneratorRuntime.mark(function _callee(put, take) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return put(code);

                            case 2:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            channels.errorOccurred.spawn(regeneratorRuntime.mark(function _callee2(put, take) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return put(false);

                            case 2:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        })();
    } catch (e) {
        (function () {
            var stackFrame = e.stackFrame;
            var message = e.message;
            var x = { stackFrame: stackFrame, message: message };

            channels.codeCleared.spawn(regeneratorRuntime.mark(function _callee3(put, take) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                put(true);

                            case 1:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            channels.errorOccurred.spawn(regeneratorRuntime.mark(function _callee4(put, take) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                put(x);

                            case 1:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));
        })();
    }
};

var execCode = //debounce(
function execCode(transpiled) {
    codeframe.contentWindow.location.reload();
    channels.codeCleared.spawn(regeneratorRuntime.mark(function _callee5(put, take) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        put(true);

                    case 1:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));
    codeframe.onload = function () {
        try {
            iframe_el().contentWindow.eval(transpiled);
        } catch (e) {
            (function () {
                var stackFrame = e.stackFrame;
                var message = e.message;
                var x = { stackFrame: stackFrame, message: message };

                if (typeof e === 'string') x = { message: e };

                if (!x.stackFrame && !x.message) {
                    var _message = 'Error thrown, however the value thrown is not handled as an instance of Error().';
                    x = { message: _message };
                }

                channels.errorOccurred.spawn(regeneratorRuntime.mark(function _callee6(put, take) {
                    return regeneratorRuntime.wrap(function _callee6$(_context6) {
                        while (1) {
                            switch (_context6.prev = _context6.next) {
                                case 0:
                                    put(x);
                                case 1:
                                case 'end':
                                    return _context6.stop();
                            }
                        }
                    }, _callee6, this);
                }));
            })();
        }
    };
};
// , 250)

channels.codeEdited.spawn(regeneratorRuntime.mark(function _callee7(put, take) {
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
            switch (_context7.prev = _context7.next) {
                case 0:
                    if (!true) {
                        _context7.next = 6;
                        break;
                    }

                    analyze(take()[1]);
                    _context7.next = 4;
                    return;

                case 4:
                    _context7.next = 0;
                    break;

                case 6:
                case 'end':
                    return _context7.stop();
            }
        }
    }, _callee7, this);
}));

channels.codeAnalyzed.spawn(regeneratorRuntime.mark(function _callee8(put, take) {
    var _take, _take2, status, transpiled;

    return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
            switch (_context8.prev = _context8.next) {
                case 0:
                    if (!true) {
                        _context8.next = 10;
                        break;
                    }

                    _take = take();
                    _take2 = _slicedToArray(_take, 2);
                    status = _take2[0];
                    transpiled = _take2[1];

                    transpiled && execCode(transpiled);
                    _context8.next = 8;
                    return;

                case 8:
                    _context8.next = 0;
                    break;

                case 10:
                case 'end':
                    return _context8.stop();
            }
        }
    }, _callee8, this);
}));

var TwoPainz = function TwoPainz() {
    return m('.grid.grid-2-800', Code, Results);
};

var editor = null;
var edit = function edit(_) {
    return channels.codeEdited.spawn(regeneratorRuntime.mark(function _callee9(put, take) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        put(editor.getValue());

                    case 1:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }));
};

var Code = function Code() {
    var config = function config(el) {
        editor = _codemirror2.default.fromTextArea(el, {
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 4,
            fixedGutter: true,
            mode: "javascript",
            keyMap: "sublime",
            extraKeys: {
                "Cmd-S": urlShortener,
                "Ctrl-S": urlShortener
            },
            // foldGutter: true,
            inputStyle: "textarea",
            autofocus: true,
            theme: 'material'
        });
        editor.on('change', edit);
        rAF(function (_) {
            return edit;
        });
    };

    return m('div', { shouldUpdate: function shouldUpdate() {
            return 0;
        } }, m('textarea', { config: config }, program));
};

var state = {
    logs: [],
    error: ''
};

var addLog = window.addLog = function () {
    for (var _len = arguments.length, m = Array(_len), _key = 0; _key < _len; _key++) {
        m[_key] = arguments[_key];
    }

    return channels.logEmitted.spawn(regeneratorRuntime.mark(function _callee10(put, take) {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        put(m);

                    case 1:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this);
    }));
};

var reset = window.reset = function () {
    return channels.codeCleared.spawn(regeneratorRuntime.mark(function _callee11(put, take) {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        put(true);

                    case 1:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    }));
};

var clear = computable(function () {
    return state.logs = [];
}),
    log = computable(function () {
    for (var _len2 = arguments.length, m = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        m[_key2] = arguments[_key2];
    }

    return state.logs = [].concat(_toConsumableArray(state.logs), m);
}),
    err = computable(function (e) {
    return state.error = e || '';
});

channels.codeCleared.spawn(regeneratorRuntime.mark(function _callee12(put, take) {
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
            switch (_context12.prev = _context12.next) {
                case 0:
                    if (!true) {
                        _context12.next = 7;
                        break;
                    }

                    take();
                    clear();
                    _context12.next = 5;
                    return;

                case 5:
                    _context12.next = 0;
                    break;

                case 7:
                case 'end':
                    return _context12.stop();
            }
        }
    }, _callee12, this);
}));

channels.logEmitted.spawn(regeneratorRuntime.mark(function _callee13(put, take) {
    var _take3, _take4, s, val;

    return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
            switch (_context13.prev = _context13.next) {
                case 0:
                    if (!true) {
                        _context13.next = 10;
                        break;
                    }

                    _take3 = take();
                    _take4 = _slicedToArray(_take3, 2);
                    s = _take4[0];
                    val = _take4[1];

                    val && log.apply(undefined, _toConsumableArray(val));
                    _context13.next = 8;
                    return;

                case 8:
                    _context13.next = 0;
                    break;

                case 10:
                case 'end':
                    return _context13.stop();
            }
        }
    }, _callee13, this);
}));

channels.errorOccurred.spawn(regeneratorRuntime.mark(function _callee14(put, take) {
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
            switch (_context14.prev = _context14.next) {
                case 0:
                    if (!true) {
                        _context14.next = 6;
                        break;
                    }

                    err(take()[1]);
                    _context14.next = 4;
                    return;

                case 4:
                    _context14.next = 0;
                    break;

                case 6:
                case 'end':
                    return _context14.stop();
            }
        }
    }, _callee14, this);
}));

var Results = function Results() {
    var iframe = function iframe(el) {
        return iframe_el(el) && edit();
    };

    var getError = function getError() {
        return state.error && state.error + '\n---------\n' + (state.error.codeFrame || state.error.message);
    };

    return m('.right-pane', m('iframe#codeframe', { src: './worker.html', config: iframe, shouldUpdate: function shouldUpdate(_) {
            return false;
        } }), m('textarea.errors' + (state.error ? '.active' : ''), { readonly: true, value: getError() }), m('textarea.logs' + (state.logs.length ? '.active' : ''), { readonly: true, value: state.logs.join('\n') }));
};

var app = function app() {
    mount(TwoPainz, qs('.container'));
};

app();