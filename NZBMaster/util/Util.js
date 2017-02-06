let crypto = require('crypto');

class Util {
    static sha256(data) {
        let hash = crypto.createHash('sha256');
        hash.update(data);
        return hash.digest('base64')
    }
}

module.exports = Util;
