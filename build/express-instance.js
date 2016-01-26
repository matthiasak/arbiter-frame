'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _csurf = require('csurf');

var _csurf2 = _interopRequireDefault(_csurf);

var _methodOverride = require('method-override');

var _methodOverride2 = _interopRequireDefault(_methodOverride);

var _config = require('../config.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

// all environments
app.set('port', process.argv[3] || process.env.PORT || 3000);
app.disable('x-powered-by');
app.use(_bodyParser2.default.urlencoded({ extended: false }), // for parsing application/x-www-form-urlencoded
_bodyParser2.default.json(), // for parsing application/json
(0, _compression2.default)({
    filter: function filter(req, res) {
        return true;
    },
    level: 9
}), _express2.default.static(__dirname + '/../dist', { maxAge: 1000 * 60 * 60 * 12 }));

// { test: 'name', test2: 'name2' } --> '?test=name&test2=name2'
var querify = function querify(queryParamsObject) {
    var params = Object.keys(queryParamsObject).map(function (val, key) {
        return val + '=' + queryParamsObject[val];
    }).join('&');
    return params.length === 0 ? '' : '?' + params;
};

var proxify = function proxify(localUrl, webUrl) {
    var tokens = webUrl.match(/:(\w+)/ig);

    var replaceRemoteTokens = function replaceRemoteTokens(req) {
        return (tokens || []).reduce(function (a, t) {
            return a.replace(new RegExp(t, 'ig'), req.params[t.substr(1)]);
        }, webUrl);
    };

    app.get(localUrl, function (req, res, next) {
        req.pipe((0, _request2.default)(replaceRemoteTokens(req) + querify(req.query)).on('error', function (err) {
            return console.error(err);
        })).pipe(res);
    });
    app.post(localUrl, function (req, res, next) {
        req.pipe(_request2.default.post(replaceRemoteTokens(req) + querify(req.query), { form: req.query }).on('error', function (err) {
            return console.error(err);
        })).pipe(res);
    });
};

// add your proxies here.
//
// examples:
// proxify('/yummly/recipes', 'http://api.yummly.com/v1/api/recipes');
// proxify('/brewery/styles', 'https://api.brewerydb.com/v2/styles');

// SOME SECURITY STUFF
// ----------------------------
// more info: https://speakerdeck.com/ckarande/top-overlooked-security-threats-to-node-dot-js-web-applications
// ----
// remove some info so we don't divulge to potential
// attackers what platform runs the website
app.disable('x-powered-by');
// change the generic session cookie name
// app.use(session({ secret: 'some secret', key: 'sessionId', cookie: {httpOnly: true, secure: true} }))
// enable overriding
app.use((0, _methodOverride2.default)("X-HTTP-Method-Override"));
// enable CSRF protection
// app.use(csrf())
// app.use((req, res, next) => {
//     res.locals.csrftoken = req.csrfToken() // send the token to the browser app
//     next()
// })
// ---------------------------

module.exports = app;