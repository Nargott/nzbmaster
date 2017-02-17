var Sequelize = require('sequelize');

class DB {
    constructor(conf) {
        this.isInited = false;
        this.conf = conf;
        this.sequelize = new Sequelize(
            conf.db.params.database,
            conf.db.params.username,
            conf.db.params.password,
            conf.db.params
        );

        //Models definitions
        this.Models = {};

        this.Models.User = this.sequelize.define('users', require('./models/users.js')());
        this.Models.Connection = this.sequelize.define('connections', require('./models/connections.js')());

        //Models relations
        this.Models.Connection.belongsTo(this.Models.User);
        this.Models.User.hasMany(this.Models.Connection);
    }

    init() {
        if (!this.isInited) {
            //Must to init all models
            //return this.sequelize.sync(); //DOESN'T WORK :(
            return this.Models.User.sync()
                .then(() => {
                    return this.Models.Connection.sync()
                })
                .then(() => {
                    this.isInited = true;
                    return Promise.resolve();
                })
                .catch(err => {
                    this.isInited = false;
                    this.conf.log.error("DB init error: " + err);
                    process.exit();
                    return Promise.reject();
                });

        } else {
            return Promise.resolve();
        }
    }
}

module.exports = conf => {
    return new DB(conf)
};
