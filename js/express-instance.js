import express from 'express'
import request from 'request'
import compression from 'compression'
import session from 'express-session'
import bodyParser from 'body-parser'
import csrf from 'csurf'
import override from 'method-override'
import {serverRender, apis} from '../config.json'

let app = express()

// all environments
app.set('port', process.argv[3] || process.env.PORT || 3000)
app.disable('x-powered-by')
app.use(
    bodyParser.urlencoded({ extended: false }), // for parsing application/x-www-form-urlencoded
    bodyParser.json(), // for parsing application/json
    compression({
        filter: (req,res) => true,
        level: 9
    }),
    express.static(__dirname+'/../dist', {maxAge: 1000*60*60*12})
)

// { test: 'name', test2: 'name2' } --> '?test=name&test2=name2'
const querify = (queryParamsObject) => {
    var params = Object.keys(queryParamsObject).map(function(val, key) {
        return val + '=' + queryParamsObject[val]
    }).join('&')
    return params.length === 0 ? '' : '?' + params
}

const proxify = (localUrl, webUrl) => {
    const tokens = webUrl.match(/:(\w+)/ig)

    const replaceRemoteTokens = (req) =>
        (tokens || []).reduce((a, t) =>
            a.replace(new RegExp(t, 'ig'), req.params[t.substr(1)]), webUrl)

    app.get(localUrl, (req, res, next) => {
        req.pipe(
            request(replaceRemoteTokens(req) + querify(req.query))
                .on('error', err => console.error(err))
        ).pipe(res)
    })
    app.post(localUrl, (req, res, next) => {
        req.pipe(
            request.post(replaceRemoteTokens(req) + querify(req.query), {form:req.query})
                .on('error', err => console.error(err))
        ).pipe(res)
    })
}

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
app.disable('x-powered-by')
// change the generic session cookie name
// app.use(session({ secret: 'some secret', key: 'sessionId', cookie: {httpOnly: true, secure: true} }))
// enable overriding
app.use(override("X-HTTP-Method-Override"))
// enable CSRF protection
// app.use(csrf())
// app.use((req, res, next) => {
//     res.locals.csrftoken = req.csrfToken() // send the token to the browser app
//     next()
// })
// ---------------------------

module.exports = app