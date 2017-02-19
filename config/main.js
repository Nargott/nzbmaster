module.exports = {
    server : {
        host: '127.0.0.1',
        port: 1190,
        exclusive: false,
        encoding: 'binary',
        info : {
            name: 'Nargott',
            protocol: 'NNTP',
            greetingMsg: 'Service Ready',
            posting: false,
            yEnc: true
        }
    },

    http : {
        host: 'http://attic.attic.pw:8020',
        path: '/article/get/',
        param: 'mid'
    }
};