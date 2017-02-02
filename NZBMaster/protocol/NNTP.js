let conf = require('./../config/config'),
    _ = require('lodash'),
    dateFormat = require('dateformat'),
    cmdList = require('./commandsList');

class NNTP {
    constructor(socket) {
        this.params = {};
        this.params.messages = {
            end : '\r\n',
            notRecognized: 'What?'
        };

        this.socket = socket;
    }

    read(data) {
        if (data.toString().trim().length > 0) { //only if command given
            let cmd = _.find(cmdList, (o) => {
                return o === data.toString().toLowerCase().trim();
            });
            if ('undefined' === typeof cmd) {
                this.write(500, this.params.messages.notRecognized);
            } else {
                switch (cmd) {
                    case 'date': {
                        this.write(111,dateFormat((new Date()), "yyyyddmmHHMMss"));
                    } break;
                    case 'help': {
                        var msg = "Legal commands"+this.params.messages.end;
                        _.forEach(cmdList, (o) => {
                            msg+='  '+o+this.params.messages.end;
                        });
                        msg+='.';
                        this.write(100, msg);
                    }
                }
            }
        }
    }

    write(code, msg) {
        this.socket.write(this.message(code, msg));
    }

    message(code, msg) {
        return code.toString()+' '+msg+this.params.messages.end;
    }

    makeGreetingsMsg() {
        let msg = conf.server.info.name;
        msg+=' '+conf.server.info.protocol;
        msg+=' '+conf.server.info.greetingMsg;
        msg+=' (posting is '+(conf.server.info.posting ? 'not ' : '')+'allowed)';
        msg+=' (yEnc '+(conf.server.info.yEnc ? 'enabled' : 'disabled')+')';
        msg+='.';
        return msg;
    }
}

module.exports = NNTP;
