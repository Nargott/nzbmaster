module.exports = {
    //host:'127.0.0.1',
    username: 'nzb',
    password: null,
    //port: '8306',
    database: 'nzbmaster',
    dialect: 'sqlite',
    storage: './storage/db.sqlite', //':memory:',
    sync: { force: true }
};