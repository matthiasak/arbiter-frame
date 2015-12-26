// cluster management and load-balancing with nanny
// ----
// maintains a pool of workers,
// monitors the health of the workers including event loop responsiveness and memory consumption,
// restarts workers if they stop,
// stops workers if they fail a health check,
// distributes incoming connections to the cluster workers

var config = require('./config.json')

if(!config.nodeCluster){
    return require('./server.js')
}

const nanny = require('nanny'),
    mary_poppins = new nanny({
        workerPath: `${__dirname}/server.js`
    })

process.title = 'nodejs - heroku-server'
mary_poppins.start()
