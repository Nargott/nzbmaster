let conf = require('./../config/config'),
    _ = require('lodash'),
    UUID = require('uuid/v4'),
    Util = require('./../util/Util'),
    dateFormat = require('dateformat'),
    cmdList = require('./commandsList');

class NNTP {
    constructor(config, socket) {
        this.params = {};
        this.params.messages = {
            end: '\r\n',
            notRecognized: 'What?'
        };
        this.uuid = UUID();
        this.socket = socket;
        this.config = config;
        this.userName = null;
        this.connection = null;
        this.user = null;

        //db actions
        this.config.db.Models.Connection.create({
            uuid: this.uuid,
            ip: this.socket.remoteAddress
        })
            .then(con => {
                this.connection = con;
            })
            .catch(err => {
                this.config.log.error(err);
            });

        //event listeners
        this.socket.on('end', () => {
            this.close();
        });

        socket.on('data', (data) => {
            this.read(data);
        });

        // Send greeting
        this.write(200, this.makeGreetingsMsg());
    }

    read(data) {
        data = data.toString().toLowerCase().trim();
        if (data.length > 0) { //only if command given
            let cmdArray = data.split(' ');
            let cmd = _.find(cmdList, (o) => {
                return o.split(' ')[0] === cmdArray[0];
            });
            if ('undefined' === typeof cmd) {
                this.write(500, this.params.messages.notRecognized);
            } else {
                switch (cmdArray[0]) {
                    case 'date': {
                        this.write(111, dateFormat((new Date()), "yyyyddmmHHMMss"));
                    }
                        break;
                    case 'help': {
                        var msg = "Legal commands" + this.params.messages.end;
                        _.forEach(cmdList, (o) => {
                            msg += '  ' + o + this.params.messages.end;
                        });
                        msg += '.';
                        this.write(100, msg);
                    }
                        break;
                    case 'quit': {
                        this.close();
                        this.socket.destroy();
                        return;
                    }
                        break;
                    case 'authinfo': {
                        if ((cmdArray.length != 3)
                            || ((cmdArray[1] !== 'user') && ((cmdArray[1] !== 'pass')))
                        ) {
                            this.write(501, cmdList[2]); //send authinfo command help
                            break;
                            return;
                        }
                        if ((cmdArray[1] == 'user')) {
                            this.userName = cmdArray[2];
                            this.write(381, 'PASS required');
                            break;
                            return;
                        } else if ((cmdArray[1] == 'pass') && this.userName != null) {
                            //try to find this user in our DB
                            this.config.db.Models.User.findOne({
                                where: {
                                    userName: this.userName,
                                    passHash: Util.sha256(cmdArray[2])
                                }
                            })
                                .then(user => {
                                    if (user == null) {
                                        this.close();
                                        this.socket.destroy();
                                        return;
                                    } else {
                                        this.user = user;
                                        this.write(281, "Ok");
                                    }

                                })
                                .catch(err => {
                                    this.config.log.error(err);
                                });
                        } else {
                            this.write(501, cmdList[2]); //send authinfo command help
                            break;
                            return;
                        }
                        // if ( (this.userName == null)
                        //     && (cmdArray[1] == 'user'))
                    }
                        break;
                }
            }
        }
    }

    write(code, msg) {
        this.socket.write(this.message(code, msg));
    }

    message(code, msg) {
        return code.toString() + ' ' + msg + this.params.messages.end;
    }

    makeGreetingsMsg() {
        let msg = conf.server.info.name;
        msg += ' ' + conf.server.info.protocol;
        msg += ' ' + conf.server.info.greetingMsg;
        msg += ' (posting is ' + (conf.server.info.posting ? 'not ' : '') + 'allowed)';
        msg += ' (yEnc ' + (conf.server.info.yEnc ? 'enabled' : 'disabled') + ')';
        msg += '.';
        return msg;
    }

    close() {
        console.log('client disconnected');
        this.connection.destroy();
        delete this;
    }

}

module.exports = NNTP;
