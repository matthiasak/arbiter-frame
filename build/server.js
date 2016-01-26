'use strict';

var _expressInstance = require('./express-instance');

var _expressInstance2 = _interopRequireDefault(_expressInstance);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _config = require('../config.json');

var _config2 = _interopRequireDefault(_config);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var range = function range(min, max) {
    return min + Math.round(Math.random() * (max - min));
};

var appName = _config2.default.appName || '',
    root = _config2.default.sslroot || '/etc/letsencrypt/live',
    certfolder = root + '/' + appName,
    keyname = _config2.default.keyname || 'privkey.pem',
    certname = _config2.default.certname || 'fullchain.pem';

try {
    if (!_config2.default.ssl_enabled) throw 'SSL is turned off';

    var ssl = 443,
        // || range(3000,6000),
    notssl = _expressInstance2.default.get('port'); // || range(3000,6000)

    var ssl_app = _https2.default.createServer({
        key: _fs2.default.readFileSync(certfolder + '/' + keyname),
        cert: _fs2.default.readFileSync(certfolder + '/' + certname)
    }, _expressInstance2.default);

    var instance = (0, _express2.default)();
    instance.use('*', function (req, res) {
        return res.redirect('https://' + req.hostname + req.url);
    });
    var http_app = _http2.default.createServer(instance);

    if (typeof PhusionPassenger !== 'undefined') {
        http_app.listen('passenger');
        ssl_app.listen(ssl);
    } else {
        http_app.listen(notssl);
        ssl_app.listen(ssl);
    }
} catch (e) {
    console.log('--------------------------------------------');
    console.log(e);
    console.log('--------------------------------------------');
    // likely the certs didn't exist, because we aren't on a deployed server
    _http2.default.createServer(_expressInstance2.default).listen(_expressInstance2.default.get('port'), function () {
        console.log('HTTP Express server listening on port ' + _expressInstance2.default.get('port'));
    });
}