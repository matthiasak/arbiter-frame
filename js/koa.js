import polyfill from "babel-polyfill"

const cluster = require('cluster')
import _router from 'koa-router'
const router = _router()

// middleware
import stat from 'koa-serve-static'
import conditional from 'koa-conditional-get'
import bodyParser from 'koa-bodyparser'
import Compress from 'koa-compress'
import Morgan from 'koa-morgan'
import favicon from 'koa-favicon'
import session from 'koa-session'

// adapt pre Koa 2.0 middle ware to be compatible with Koa 2.0.
import adapt from 'koa-convert'
import etag from 'koa-etag'
import Koa from 'koa'
import request from 'request'
import passport from 'koa-passport'
export const app = new Koa()

const logger = Morgan('combined')
import rt from 'koa-response-time'

//-- app.use(adapt(favicon(require.resolve('./dist/favicon.ico'))))
app.use(adapt(rt()))
app.use(adapt(conditional()))
app.use(adapt(etag()))
app.use(logger)
app.use(adapt(Compress({ flush: require('zlib').Z_SYNC_FLUSH })))
app.keys = [ Array(4).fill(true).map(x => Math.random()+'').join('') ]
app.use(adapt(session({ maxAge: 24 * 60 * 60 * 1000 }, app)))
app.use(adapt(bodyParser()))

/*
Turn on passport (authenticate your users through twitter, etc)
 */

// uncomment to enable passport
// app.use(passport.initialize())
// app.use(passport.session())

// router.get('/logout', ctx => {
//     ctx.logout()
//     ctx.redirect('/')
// })

const authVia = (router, name, success='/', failure='/failure-to-auth') => {
    router.get(`/auth/${name}`, passport.authenticate(name))
    router.get(`/auth/${name}/callback`, passport.authenticate(name, {successRedirect: success, failureRedirect: failure}))
}

// uncomment to enable auth via facebook
// authVia(router, 'facebook')

// uncomment to enable auth via twitter
// authVia(router, 'twitter')

// uncomment to enable auth via google
// authVia(router, 'google')

// uncomment the following to require someone to be logged in, else redirect them to /not-logged-in
// (needed if you turn on any authentication)
//
// app.use((ctx, next) => {
//     if (ctx.isAuthenticated()) {
//         return next()
//     } else {
//         ctx.redirect('/not-logged-in')
//     }
// })

/*
Routes go here
*/

// default proxying
const replaceRemoteTokens = (req, webUrl, tokens=webUrl.match(/:(\w+)/ig)) =>
    (tokens || []).reduce((a, t) =>
        a.replace(new RegExp(t, 'ig'), req.params[t.substr(1)]), webUrl)

const get = url =>
    new Promise((res,rej) => {
        request(url, (error, response, body) => {
            if(!error) { // && response.statusCode === 200
                return res(body)
            }
            return rej(error)
        })
    })

const proxify = (router, localUrl, webUrl) => {
    router.get(localUrl, async (ctx, next) => {
        try {
            var data = await get(replaceRemoteTokens(ctx.req, webUrl) + (ctx.req._parsedUrl.search || ''))
        } catch(e) {
            ctx.body = e
            return
        }
        ctx.body = data
    })

    // router.post(localUrl, async (ctx, next) => {
    //     let data = await request.post(replaceRemoteTokens(ctx.req, webUrl) + ctx.req._parsedUrl.search)//, {form:ctx.req.query})
    //     ctx.body = data
    // })
}

// add your proxies here.
//
// examples:
// proxify(router, '/yummly/recipes', 'http://api.yummly.com/v1/api/recipes')
// proxify(router, '/brewery/styles', 'https://api.brewerydb.com/v2/styles')

const guid = (function() {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    return () => s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
})()

const enableREST = (router) => {
    let collections = {}
    router.get('/collections/:collectionName', async (ctx, next) => {
        if (!collections[ctx.params.collectionName]) {
            ctx.body = []
        } else {
            ctx.body = collections[ctx.params.collectionName]
        }
    })

    router.post('/collections/:collectionName', async (ctx, next) => {
        var collection = collections[ctx.params.collectionName]
        if (!collection) {
            collection = collections[ctx.params.collectionName] = []
        }

        var result = ctx.request.body
        if (!result) {
            ctx.statusCode = 404
            return
        }

        if (result instanceof Array) {
            result.forEach(function(d) {
                d.id = guid()
                collections[ctx.params.collectionName].push(d)
            })
            ctx.body = result
        } else {
            result.id = guid()
            collections[ctx.params.collectionName].push(result)
            ctx.body = result
        }
    })

    router.get('/collections/:collectionName/:id', async (ctx, next) => {
        if (!collections[ctx.params.collectionName]) {
            ctx.statusCode = 401
            return
        }
        let result = collections[ctx.params.collectionName].filter(i => i.id === ctx.params.id)
        if (!result || !result.length) {
            ctx.body = "collection " + ctx.params.collectionName + " does not have an item with id " + ctx.params.id
            ctx.statusCode = 401
            return
        }
        ctx.body = result[0]
    })

    router.put('/collections/:collectionName/:id', function(ctx, next) {
        if (!collections[ctx.params.collectionName]) {
            ctx.statusCode = 401
            ctx.body = "collection " + ctx.params.collectionName + " does not exist."
            return
        }
        var result = collections[ctx.params.collectionName].filter(i => i.id === ctx.params.id)
        if (!result || !result.length) {
            ctx.statusCode = 401
            return
        }

        result[0] = {...result[0], ...ctx.request.body}

        ctx.body = result[0]
    })

    // DELETE /collections/:collectionName
    router.delete('/collections/:collectionName/:id', function(ctx, next) {
        if (!collections[ctx.params.collectionName]) {
            ctx.statusCode = 401
            return
        }

        if (!ctx.params.id && collections[ctx.params.collectionName].length) {
            ctx.statusCode = 401
            return
        }

        collections[ctx.params.collectionName] = collections[ctx.params.collectionName].filter(i => i.id !== ctx.params.id)
        ctx.body = {msg: 'success'}
    })
}

// uncomment the line below to enable an in-memory RESTful endpoint
// enableREST(router)

// example routes
//
// router.get('/', (ctx, next) => {
//     ctx.status = 200
//     ctx.body = 'Hello world from worker ' + (cluster.worker ? cluster.worker.id : '') + '!'
// })
//
// router.get('/students/:id', ctx => {
//     console.log(ctx.params.id)
//     ctx.body = { name:'test', id: id }
// })

app.use(router.routes())
app.use(router.allowedMethods())
app.use(stat('dist'))
