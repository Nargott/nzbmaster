let conf = require('./../config/config'),
    _ = require('lodash'),
    UUID = require('uuid/v4'),
    dateFormat = require('dateformat'),
    cmdList = require('./commandsList');

class NNTP {
    constructor(socket) {
        this.params = {};
        this.params.messages = {
            end : '\r\n',
            notRecognized: 'What?'
        };
        this.uuid = UUID();
        this.socket = socket;

        //event listeners
        this.socket.on('end', () => {
            console.log('client disconnected');
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
                return o === cmdArray[0];
            });
            if ('undefined' === typeof cmd) {
                this.write(500, this.params.messages.notRecognized);
            } else {
                switch (cmd) {
                    case 'date': {
                        this.write(111, dateFormat((new Date()), "yyyyddmmHHMMss"));
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
