let config = {};

config.server = {
    host: 'localhost',
    port: 119
};

config.server.info = {
    name: 'Nargott',
    protocol: 'NNTP',
    greetingMsg: 'Service Ready',
    posting: false,
    yEnc: true
};

module.exports = config;
