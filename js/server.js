console.log('Starting TLS server at ' + (new Date).toISOString())
process.on('exit', function() {
    console.log('Process exit at ' + (new Date).toISOString())
})

const cluster = require('cluster')
import pem from 'pem'
import {app} from './koa'
const config = require('../config.json')
import spdy from 'spdy'
const http = require('http')
// import socketIo from 'socket.io'
// import sticky from 'socketio-sticky-session'
const os = require('os')
// import uws from 'uws'

var port = process.argv[3] || process.env.PORT || 3000 //(process.getuid() === 0) ? 443 : 3000

// generate a cert/keypair on the fly
const keys = new Promise((res, rej) => {
    pem.createCertificate({ days: 1, selfSigned: true }, (err, keys) => {
        if(err) return rej(err)
        res(keys)
    })
})

keys.then(({serviceKey:key, certificate:cert}) => {
    const credentials = { key, cert },
        getServer = () => {
            if(config.https){
                const server = spdy.createServer(credentials, app.callback())
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
                return server
            }

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
        getServer().listen(port, function() {
            console.log('server (no cluster) listening on port ' + port)
        })
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
}).catch(e => console.error(e))
