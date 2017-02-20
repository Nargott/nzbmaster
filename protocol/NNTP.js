const conf = require('./../config/config'),
    _ = require('lodash'),
    UUID = require('uuid/v4'),
    Util = require('./../util/Util'),
    dateFormat = require('dateformat'),
    http = require('http'),
    encodeUrl = require('encodeurl'),
    querystring = require("querystring"),
    request = require('request'),
    cmdList = require('./inc/commandsList'),
    nntpCodes = require('./inc/nntpCodes');

class NNTP {
    constructor(config, socket) {
        this.params = {
            serviceDelimiter: '=y'
        };
        this.params.messages = {
            nl: '\r\n',
            end: '.',
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
                console.log("Connection established #" + con.get('id'));
                this.connection = con;
                // Send greeting
                this.write(nntpCodes.AUTH_AV_POSTING_NOT_ALLOWED.code, this.makeGreetingsMsg());
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

    getArticle(cmdArray, cmdHelp, callback) {
        if (!this.user) {
            this.writeAnswer(nntpCodes.AUTH_REQUIRED);
            return;
        }
        if (cmdArray.length != 2) {
            this.write(nntpCodes.SYNTAX_ERROR.code, cmdHelp); //send command help
            return;
        }
        if ((!cmdArray[1].startsWith('<')) || (!cmdArray[1].endsWith('>'))) {
            this.write(nntpCodes.SYNTAX_ERROR.code, cmdHelp); //send command help
            return;
        }
        let articleId = cmdArray[1];
        articleId = articleId.slice(1, -1); //articleId.slice(0, -1); //remove <>-symbols
        conf.log.debug("Get article " + cmdArray[1]);
        let url = encodeUrl(this.config.http.host +
            this.config.http.path +
            '?' +
            this.config.http.param +
            '=' +
            querystring.escape(articleId));
        //request(url).pipe(this.socket);
        conf.log.debug("Request " + url);
        request(url, {
            encoding: this.config.server.encoding,
            preambleCRLF: false,
            postambleCRLF: false,
            gzip: false
        }, (error, response, body) => {
            console.log(response.headers);
            if ((!body) || (body.length == 0)) {
                if (response.headers['d-fin'] == '1') {
                    conf.log.warning("No such article: "+articleId);
                    this.writeAnswer(nntpCodes.NO_ARTICLE);
                    return;
                } else {
                    conf.log.warning("No article body: "+articleId);
                    conf.log.debug("Headers: "+JSON.stringify(response.headers));
                    this.writeAnswer(nntpCodes.AUTH_PERM_UNAVAIL);
                    return;
                }
            }
            callback(error, response, body);
        });
    }

    read(data) {
        data = data.toString().trim();
        if (data.length > 0) { //only if command given
            let cmdArray = data.split(' ');
            let cmd = _.find(cmdList, (o) => {
                return o.split(' ')[0] === cmdArray[0].toLowerCase();
            });
            if ('undefined' === typeof cmd) {
                this.config.log.debug("Unknown command: " + data);
                this.writeAnswer(nntpCodes.UNKNOWN_COMMAND);
            } else {
                switch (cmdArray[0].toLowerCase()) {
                    case 'date': {
                        this.write(nntpCodes.CMD_DATETIME.code, dateFormat((new Date()), "yyyyddmmHHMMss"));
                    }
                        break;
                    case 'help': {
                        var msg = "Legal commands" + this.params.messages.nl;
                        _.forEach(cmdList, (o) => {
                            msg += '  ' + o + this.params.messages.nl;
                        });
                        msg += this.params.messages.end;
                        this.write(nntpCodes.CMD_HELP.code, msg);
                    }
                        break;
                    case 'mode': {
                        if ((cmdArray.length != 2)
                            || ((cmdArray[1].toLowerCase() !== 'reader'))
                        ) {
                            conf.log.warning("Bad mode reader command param: " + cmdArray);
                            this.write(nntpCodes.SYNTAX_ERROR, cmdList[7]); //send mode reader command help
                            break;
                            return;
                        }
                        if (this.config.server.info.posting) {
                            this.writeAnswer(nntpCodes.CMD_MODE_R_POSTING_ALLOWED);
                        } else {
                            this.writeAnswer(nntpCodes.CMD_MODE_R_POSTING_NOT_ALLOWED);
                        }
                    }
                        break;
                    case 'capabilities': {
                        var msg = nntpCodes.CMD_CAPABILITIES.message + this.params.messages.nl;
                        _.forEach(this.config.server.capabilities, (c) => {
                            msg += '  ' + c + this.params.messages.nl;
                        });
                        msg += this.params.messages.end;
                        this.write(nntpCodes.CMD_CAPABILITIES.code, msg);
                    }
                        break;
                    case 'quit': {
                        this.close(true);
                        return;
                    }
                        break;
                    case 'authinfo': {
                        if ((cmdArray.length != 3)
                            || ((cmdArray[1].toLowerCase() !== 'user') && ((cmdArray[1].toLowerCase() !== 'pass')))
                        ) {
                            conf.log.debug("Bad authinfo command param: " + cmdArray);
                            this.write(nntpCodes.SYNTAX_ERROR.code, cmdList[3]); //send authinfo command help
                            break;
                            return;
                        }
                        if ((cmdArray[1].toLowerCase() == 'user')) {
                            this.userName = cmdArray[2];
                            this.writeAnswer(nntpCodes.PASS_REQUIRED);
                            break;
                            return;
                        } else if ((cmdArray[1].toLowerCase() == 'pass') && this.userName != null) {
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
                                        this.writeAnswer(nntpCodes.LOGIN_OK);
                                    } else {
                                        this.config.log.warning("Max user connection exceed");
                                        this.writeAnswer(nntpCodes.ERR_MAX_USER_CONNECTIONS);
                                        this.close();
                                    }
                                })
                                .catch(err => {
                                    this.config.log.error(err);
                                });
                        } else {
                            this.write(nntpCodes.SYNTAX_ERROR, cmdList[3]); //send authinfo command help
                            break;
                            return;
                        }
                        // if ( (this.userName == null)
                        //     && (cmdArray[1] == 'user'))
                    }
                        break;
                    case 'article': {
                        this.getArticle(cmdArray, cmdList[4], (error, response, body) => {
                            if (!error && response.statusCode == 200) {
                                conf.log.debug("Request OK, code = " + response.statusCode);
                                body = body.toString();
                                let onlyBody = body.substr(body.indexOf(this.params.serviceDelimiter), body.length);
                                this.write(
                                    nntpCodes.CMD_ARTICLE.code,
                                    '0 ' + cmdArray[1] + ' ' + cmdArray[0] + this.params.messages.nl + body,
                                    false
                                );
                            } else {
                                if (typeof response != 'undefined')
                                    conf.log.debug("Request filed with code " + response.statusCode);
                                conf.log.error(error);
                            }
                        });
                    }
                        break;
                    case 'head': {
                        this.getArticle(cmdArray, cmdList[5], (error, response, body) => {
                            if (!error && response.statusCode == 200) {
                                conf.log.debug("Request OK, code = " + response.statusCode);
                                let head = body.substr(0, body.indexOf(this.params.serviceDelimiter));
                                this.write(
                                    nntpCodes.CMD_HEAD.code,
                                    '0 ' + cmdArray[1] + ' ' + cmdArray[0] + this.params.messages.nl + head,
                                    false
                                );
                            } else {
                                if (typeof response != 'undefined')
                                    conf.log.debug("Request filed with code " + response.statusCode);
                                conf.log.error(error);
                            }
                        });
                    }
                        break;
                    case 'body': {
                        this.getArticle(cmdArray, cmdList[5], (error, response, body) => {
                            if (!error && response.statusCode == 200) {
                                conf.log.debug("Request OK, code = " + response.statusCode);
                                let onlyBody = body.substr(body.indexOf(this.params.serviceDelimiter), body.length);
                                this.write(
                                    nntpCodes.CMD_BODY.code,
                                    '0 ' + cmdArray[1] + ' ' + cmdArray[0] + this.params.messages.nl + onlyBody,
                                    false
                                );
                            } else {
                                if (typeof response != 'undefined')
                                    conf.log.debug("Request filed with code " + response.statusCode);
                                conf.log.error(error);
                            }
                        });
                    }
                        break;
                }
            }
        }
    }

    writeAnswer(nntpCode) {
        this.socket.write(this.message(nntpCode.code, nntpCode.message, true), this.config.server.encoding);
    }

    write(code, msg, isService = true) {
        this.socket.write(this.message(code, msg, isService), this.config.server.encoding);
    }

    message(code, msg, isService) {
        return code.toString() + ' ' + msg + (isService ? this.params.messages.nl : this.params.messages.end + this.params.messages.nl);
    }

    makeGreetingsMsg() {
        let msg = conf.server.info.name;
        msg += ' ' + conf.server.info.protocol;
        msg += ' ' + conf.server.info.greetingMsg;
        msg += ' (posting ' + (conf.server.info.posting ? 'allowed' : 'prohibited') + ')';
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
        //process.exit(1);
        delete this;
    }

}

module.exports = NNTP;
