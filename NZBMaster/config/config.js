let beautify = require("json-beautify");

let config = {};

config.server = {
    host: 'localhost',
    port: 1192,
    exclusive: false
};

config.server.info = {
    name: 'Nargott',
    protocol: 'NNTP',
    greetingMsg: 'Service Ready',
    posting: false,
    yEnc: true
};

config.http = {
    host: 'http://attic.attic.pw:8020',
    path: '/article/get/',
    param: 'mid'
};

//log
config.log = require('./log.js');
// config.log.debugJSON = (data) => {
//     config.log.debug(beautify(data, null, 2, 50));
// };
// config.log.errorJSON = (data) => {
//     config.log.error(beautify(data, null, 2, 50));
// };

//DB params
config.db = {};
config.db.params = require('./sqlite.js');
config.db.params.logging = config.log.debug; //set the logging function for DB
//DB object
config.db = require('./../storage/db.js')(config);

module.exports = config;
