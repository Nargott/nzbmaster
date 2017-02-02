let sequelize = require('sequelize'),
    net = require('net')
    NNTP = require('./protocol/NNTP');
let NNTPServer;
let server = net.createServer((socket) => {
    NNTPServer = new NNTP(socket);
    socket.on('data', (data) => {
        NNTPServer.read(data);
        server.getConnections((err, cnt) => {
            console.log("There is "+cnt+" active connections.");
        });
    });

    socket.on('end', () => {
        console.log('client disconnected');
    });

    socket.on('error', (e) => {
        if (e.code == 'EADDRINUSE') {
            console.log('Address in use, retrying...');
            setTimeout(() => {
                server.close();
                server.listen(PORT, HOST);
            }, 1000);
        }
    });

    //socket.pipe(socket);
});

server.on('connection', (server) => {
    console.log("connected");

    //server.write("200 Nargott NNTP Service Ready (posting is not allowed) (yEnc enabled).\r\n");
    NNTPServer.write(200, NNTPServer.makeGreetingsMsg());
});

server.listen({
    host: 'localhost',
    port: 119,
    exclusive: true
});