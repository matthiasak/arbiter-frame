require('babel-core/register')

var app = require('./express-instance'),
    app2 = require('express')(),
    http = require('http'),
    // http2 = require('http2')
    https = require('https'),
    config = require('./config.json'),
    appName = config.appName || '',
    root = config.sslroot || `/etc/letsencrypt/live/`,
    certfolder = `${root}${appName}`,
    keyname = config.keyname || 'privkey.pem',
    certname = config.certname || 'fullchain.pem',
    fs = require('fs')

try {
    https.createServer({
        key: fs.readFileSync(`${certfolder}/${keyname}`),
        cert: fs.readFileSync(`${certfolder}/${certname}`)
    }, app).listen(443, () => {
        console.log(`HTTPS Express server listening on port 443`)
    })

    app2.use('*', (req,res) => res.redirect('https://'+req.hostname+req.url))
    http.createServer(app2).listen(80, () => {
        console.log(`HTTP Express server listening on port 80`)
    })
} catch(e) {
    console.log('--------------------------------------------')
    console.log(e)
    console.log('--------------------------------------------')
    // likely the certs didn't exist, because we aren't on a deployed server
    http.createServer(app).listen(app.get('port'), () => {
        console.log(`HTTP Express server listening on port ${app.get('port')}`)
    })
}

process.title = 'nodejs - http listener'