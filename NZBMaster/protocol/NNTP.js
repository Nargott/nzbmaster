let conf = require('./../config/config'),
    _ = require('lodash'),
    UUID = require('uuid/v4'),
    Util = require('./../util/Util'),
    dateFormat = require('dateformat'),
    http = require('http'),
    encodeUrl = require('encodeurl'),
    request = require('request'),
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
                console.log("Connection established #"+con.get('id'));
                this.connection = con;
                // Send greeting
                this.write(201, this.makeGreetingsMsg());
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

        socket.on('error', (err) => {
            this.config.log.error(err);
            this.close();
        });
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
                        this.close(true);
                        return;
                    }
                        break;
                    case 'authinfo': {
                        if ((cmdArray.length != 3)
                            || ((cmdArray[1] !== 'user') && ((cmdArray[1] !== 'pass')))
                        ) {
                            this.write(501, cmdList[3]); //send authinfo command help
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
                                        this.close(true);
                                        return Promise.reject(new Error("No such user!"));
                                    }
                                    this.user = user;
                                    let promises = [];
                                    if (this.connection) {
                                        this.connection.set('userId', user.id);
                                        promises.push(this.connection.save());
                                    } else {
                                        promises.push(Promise.resolve());
                                    }
                                    // promises.push(
                                    //     this.config.db.Models.Connection.count({where: {userId:user.id}})
                                    // );
                                    return Promise.all(promises);
                                })
                                .then(con => {
                                    return this.config.db.Models.Connection.count({where: {userId: this.user.id}});
                                })
                                .then(result => {
                                    console.log(result);
                                    let conCount = (result) ? parseInt(0 + result) : 0;
                                    let userMaxConn = (this.user) ? parseInt(0 + this.user.get('maxConnections')) : 0;
                                    if (conCount <= userMaxConn) {
                                        this.write(281, "Ok");
                                    } else {
                                        this.config.log.warning("Max user connection exceed");
                                        this.write(502, "Max user connection exceed");
                                        this.close();
                                    }
                                })
                                .catch(err => {
                                    this.config.log.error(err);
                                });
                        } else {
                            this.write(501, cmdList[3]); //send authinfo command help
                            break;
                            return;
                        }
                        // if ( (this.userName == null)
                        //     && (cmdArray[1] == 'user'))
                    }
                        break;
                    case 'article': {
                        if (!this.user) {
                            this.write(480, "Authentication required for command");
                            break;
                            return;
                        }
                        if (cmdArray.length != 2) {
                            this.write(501, cmdList[4]); //send article command help
                            break;
                            return;
                        }
                        if ( (!cmdArray[1].startsWith('<')) || (!cmdArray[1].endsWith('>'))) {
                            this.write(501, cmdList[4]); //send article command help
                            break;
                            return;
                        }
                        let articleId = cmdArray[1];
                        articleId.slice(1, -1); articleId.slice(0, -1); //remove <>-symbols

                        request(encodeUrl(
                            this.config.http.host +
                            this.config.http.path +
                            '?' +
                            this.config.http.param +
                            '=' +
                            articleId
                        )).pipe(this.socket);
                    } break;
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

    close(socketToo = false) {
        this.config.log.info('client disconnected');
        this.userName = null;
        this.user = null;
        if (this.connection) this.connection.destroy();
        if (this.socket && socketToo) this.socket.destroy();
        delete this;
    }

}

module.exports = NNTP;
