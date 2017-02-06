let sequelize = require('sequelize'),
    net = require('net'),
    config = require('./config/config.js'),
    NNTP = require('./protocol/NNTP');


let NNTPclients = [];
let server = net.createServer();

server.on('error', (e) => {
    if (e.code == 'EADDRINUSE') {
        console.log('Address in use, retrying...');
        setTimeout(() => {
            server.close();
            server.listen(config.server);
        }, 1000);
    }
});

server.on('connection', (socket) => {
    console.log("connected");
    server.getConnections((err, cnt) => {
        console.log("There is "+cnt+" active connections.");
    });

    NNTPclients.push(new NNTP(config, socket));
});

config.db.init().then(() => {
    server.listen(config.server);
});
