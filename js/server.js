process.on('exit', function() {
    console.log('Process exit at ' + (new Date).toISOString())
})

// const cluster = require('cluster')
import {app} from './koa'
const config = require('../config.json')
import spdy from 'spdy'
import http from 'http'
import koa from 'koa'
// import socketIo from 'socket.io'
// import sticky from 'socketio-sticky-session'
const os = require('os')
// import uws from 'uws'

const IS_PROD = process.env.NODE_ENV === 'production'
var port = parseInt(process.argv[3] || process.env.PORT || 3000) //(process.getuid() === 0) ? 443 : 3000

if(config.https){
    let LEX = require('letsencrypt-express')
    if(!IS_PROD) LEX = LEX.testing()
    const lex = LEX.create({
        configDir: './build',
        approveRegistration: (hostname, cb) => {
            // leave `null` to disable automatic registration
            // Note: this is the place to check your database to get the user associated with this domain
            cb(null, {
              domains: [hostname],
              email: config.email, // user@example.com
              agreeTos: true
            })
        }
    })

    spdy.createServer(lex.httpsOptions, LEX.createAcmeResponder(lex, app.callback())).listen(port+1 || 443, function(){ console.log('HTTPS::Listening at ', this.address()) })
    http.createServer(app.callback()).listen(port || 80, function(){ console.log('HTTP::Listening at ', this.address()) })
} else {
    http.createServer(app.callback()).listen(port || 80, function(){ console.log('HTTP::Listening at ', this.address()) })
}

const getServer = () => {
    // const server = spdy.createServer(credentials, app.callback())
    // socketio
    // const io = socketIo.listen(server)
    // io.on('connection', function(socket) {
        // TODO: do stuff with socket
    // })
    // uws
    // var UWSServer = uws.Server
    // var wss = new UWSServer({ port: 8080 })
    // wss.on('connection', ws => {
    //     ws.on('message', message => {
    //         console.log('received: ' + message)
    //     })
    //     ws.send('something')
    // })
    return http.createServer(app.callback())
}

if (config.cluster) {
    // sticky({
    //     // https://github.com/wzrdtales/socket-io-sticky-session
    //     num: os.cpus(), // process count
    //     proxy: false, // if the layer 4 patching should be used or not, needed if behind a proxy.
    // }, getServer).listen(port, function() {
    //     console.log('Cluster worker ' + (cluster.worker ? cluster.worker.id : '') + ' server listening on port ' + port)
    // })
} else {
    // getServer().listen(port, function() {
    //     console.log('server (no cluster) listening on port ' + port)
    // })
}

if (process.getuid() === 0) { // if we are root
    // we have opened the sockets, now drop our root privileges
    process.setgid('nobody')
    process.setuid('nobody')
    // Newer node versions allow you to set the effective uid/gid
    if (process.setegid) {
        process.setegid('nobody')
        process.seteuid('nobody')
    }
}