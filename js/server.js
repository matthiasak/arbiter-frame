import app from './express-instance'
import http from 'http'
import https from 'https'
import config from '../config.json'
import fs from 'fs'
import express from 'express'
const range = (min,max) =>
        min + Math.round(Math.random() * (max-min))

const appName = config.appName || '',
    root = config.sslroot || `/etc/letsencrypt/live`,
    certfolder = `${root}/${appName}`,
    keyname = config.keyname || 'privkey.pem',
    certname = config.certname || 'fullchain.pem'

try {
    if(!config.ssl_enabled) throw 'SSL is turned off'

    var ssl = 443,// || range(3000,6000),
        notssl = app.get('port')// || range(3000,6000)

    var ssl_app = https.createServer({
        key: fs.readFileSync(`${certfolder}/${keyname}`),
        cert: fs.readFileSync(`${certfolder}/${certname}`)
    }, app)

    var instance = express()
    instance.use('*', (req,res) => res.redirect('https://'+req.hostname+req.url))
    var http_app = http.createServer(instance)

    if (typeof(PhusionPassenger) !== 'undefined') {
        http_app.listen('passenger')
        ssl_app.listen(ssl)
    } else {
        http_app.listen(notssl)
        ssl_app.listen(ssl)
    }
} catch(e) {
    console.log('--------------------------------------------')
    console.log(e)
    console.log('--------------------------------------------')
    // likely the certs didn't exist, because we aren't on a deployed server
    http.createServer(app).listen(app.get('port'), () => {
        console.log(`HTTP Express server listening on port ${app.get('port')}`)
    })
}

