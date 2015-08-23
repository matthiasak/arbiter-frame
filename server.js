var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express(),
    request = require('request'),
    session = require('express-session'),
    csrf = require('csurf'),
    override = require('method-override')

function startServer() {

    app.use('/', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*")
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Content-Type')
        next()
    })

    function querify(queryParamsObject){
        return '?'+Object.keys(queryParamsObject).map(function(val, key){ return val+'='+queryParamsObject[val] }).join('&')
    }

    // adds a new rule to proxy a localUrl -> webUrl
    // i.e. proxify ('/my/server/google', 'http://google.com/')
    function proxify(localUrl, webUrl){
        app.get(localUrl, (req, res) => {
            var tokens = webUrl.match(/:(\w+)/ig)
            var remote = (tokens || []).reduce((a, t) => {
                return a.replace(new RegExp(t, 'ig'), req.params[t.substr(1)])
            }, webUrl)
            req.pipe( request(remote + querify(req.query)) ).pipe(res)
        })
    }

    // add your proxies here.
    //
    // examples:
    // proxify('/yummly/recipes', 'http://api.yummly.com/v1/api/recipes');
    // proxify('/brewery/styles', 'https://api.brewerydb.com/v2/styles');

    // all environments
    app.set('port', process.argv[3] || process.env.PORT || 3000)
    app.use(express.static(path.join(__dirname, '/dist')))

    // SOME SECURITY STUFF
    // ----------------------------
    // more info: https://speakerdeck.com/ckarande/top-overlooked-security-threats-to-node-dot-js-web-applications
    // ----
    // remove some info so we don't divulge to potential
    // attackers what platform runs the website
    app.disable('x-powered-by')
    // change the generic session cookie name
    app.use(session({ secret: 'some secret', key: 'sessionId', cookie: {httpOnly: true, secure: true} }))
    // enable overriding
    app.use(override("X-HTTP-Method-Override"))
    // enable CSRF protection
    app.use(csrf())
    app.use((req, res, next) => {
        res.locals.csrftoken = req.csrfToken() // send the token to the browser app
        next()
    })
    // ---------------------------

    http.createServer(app).listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'))
    })

}

module.exports.startServer = startServer