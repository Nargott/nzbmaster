let sequelize = require('sequelize'),
    net = require('net'),
    Util = require('./util/Util'),
    config = require('./config/config.js'),
    NNTP = require('./protocol/NNTP');

let NNTPclients = [];
let server = net.createServer();

/**dev main user**/
config.db.Models.User.findOne({
    where: {
        userName: 'attic',
        passHash: Util.sha256('attic')
    }
})
    .then(user => {
        if (user == null) {
            config.log.debug("No such attic user. Creating one!");
            config.db.Models.User.create({ userName: 'attic', passHash: Util.sha256('attic'), maxConnections: 20})
                .then(function(user) {
                    config.log.debug("Attic user created.");
                })
        }
    });
/**---*/

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
    socket.setEncoding(config.server.encoding);
    NNTPclients.push(new NNTP(config, socket));
});

config.db.init().then(() => {
    server.listen(config.server);
});
