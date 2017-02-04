let sequelize = require('sequelize'),
    net = require('net'),
    NNTP = require('./protocol/NNTP');
let NNTPclients = [];
let server = net.createServer();

server.on('error', (e) => {
    if (e.code == 'EADDRINUSE') {
        console.log('Address in use, retrying...');
        setTimeout(() => {
            server.close();
            server.listen(PORT, HOST);
        }, 1000);
    }
});

server.on('connection', (socket) => {
    console.log("connected");
    server.getConnections((err, cnt) => {
        console.log("There is "+cnt+" active connections.");
    });
    NNTPclients.push(new NNTP(socket));
});

server.listen({
    host: 'localhost',
    port: 119,
    exclusive: false
});