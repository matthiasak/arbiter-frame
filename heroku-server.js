require('babel/register')({
    stage: 1
})

var cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    startServer = require("./server.js").startServer

startServer()

// if (cluster.isMaster) {
//     for(var i=0; i<numCPUs; i++){ cluster.fork() }

//     cluster.on('online', function(worker){ console.log('Worker ' + worker.process.pid + ' is online') })

//     cluster.on('exit', function(worker, code, signal) {
//         console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal)
//         console.log('Starting a new worker')
//         cluster.fork()
//     })
// } else {
//     startServer()

//     process.on('message', function(message) {
//         if(message.type === 'shutdown') {
//             process.exit(0)
//         }
//     })
// }

// function restartWorkers() {
//     var wid, workerIds = []

//     for(wid in cluster.workers) {
//         workerIds.push(wid)
//     }

//     workerIds.forEach(function(wid) {
//         cluster.workers[wid].send({ text: 'shutdown', from: 'master' })

//         setTimeout(function() {
//             cluster.workers[wid] && cluster.workers[wid].kill('SIGKILL')
//         }, 5000)
//     })
// }