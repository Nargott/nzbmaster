const assert = require('assert'),
    net = require('net'),
    zlib = require('zlib'),
    NNTP = require('node-nntp'),
    Nitpin = require('nitpin'),
    srv_conf = require('./../config/main'),
    child_process = require('child_process'),
    md5 = require('md5');

let config = {
    host: srv_conf.server.host,
    port: srv_conf.server.port,
    user: 'attic',
    pass: 'attic',
    secure: false,
    connections: 1,
    article: '<Part1of55.80937093214A4FE8A462CF63BB1DAD57@1486126183.local>'
};

let ethalonService = {
    host: 'eu.news.astraweb.com',
    port: 119,
    user: 'nzbfreak777',
    pass: 'bper2013',
    secure: false,
    connections: 1
};

//let child = child_process.fork("app.js");

describe('NNTP', function () {
    describe('#connect()', function () {
        it('should return a response when connection is successful', function (done) {
            var nntp = new NNTP({host: config.host, port: config.port});

            nntp.connect(function (error, response) {
                assert.equal(null, error);
                assert.equal(response.status, 201);
                assert.equal(response.message, 'Nargott NNTP Service Ready (posting prohibited) (yEnc enabled).');

                done();
            });
        });

        it('should return an error when connection is unsuccessful', function (done) {
            var nntp = new NNTP({host: config.host, port: (config.port - 1)});

            nntp.connect(function (error, response) {
                assert.notEqual(null, error);
                assert.equal(error.message, 'connect ECONNREFUSED ' + config.host + ':' + (config.port - 1));
                assert.equal(null, response);

                done();
            });
        });
    });

    describe('#authenticate()', function () {

        it('should return a response when authentication with password is successful', function (done) {
            var nntp = new NNTP({host: config.host, port: config.port, username: config.user, password: config.pass});

            nntp.connect(function (error, response) {
                nntp.authenticate(function (error, response) {
                    assert.equal(null, error);
                    console.log(response);
                    assert.equal(response.status, 281);
                    assert.equal(response.message, 'Ok');

                    done();
                });
            });
        });

        it('should return an error when authentication without a password', function (done) {
            let nntp = new NNTP({host: config.host, port: config.port, username: config.user});

            nntp.connect(function (error, response) {
                nntp.authenticate(function (error, response) {
                    assert.notEqual(null, error);
                    assert.equal(error.message, 'Password is required');
                    assert.equal(null, response);

                    done();
                });
            });
        });
    });

    // describe('#cmaxConnections()', function () {
    //     it('should return response when connections is less than maxConnections', function (done) {
    //         this.timeout(15000);
    //
    //         for (let i = 0; i < 19; i++) {
    //             var nntp = new NNTP({
    //                 host: config.host,
    //                 port: config.port,
    //                 username: config.user,
    //                 password: config.pass
    //             });
    //
    //             nntp.connectAndAuthenticate(function (error, response) {
    //                 console.log(response);
    //                 assert.equal(null, error);
    //                 assert.equal(response.status, 281);
    //                 assert.equal(response.message, 'Ok');
    //
    //                 done();
    //             });
    //         }
    //     });
    //
    //     it('should return error when connections is more than maxConnections', function (done) {
    //         this.timeout(15000);
    //         for (let i = 0; i < 19; i++) {
    //             var nntp = new NNTP({
    //                 host: config.host,
    //                 port: config.port,
    //                 username: config.user,
    //                 password: config.pass
    //             });
    //
    //             nntp.connectAndAuthenticate(function (error, response) {
    //                 assert.equal(null, error);
    //                 assert.equal(response.status, 281);
    //                 assert.equal(response.message, 'Ok');
    //             });
    //         }
    //
    //         var nntp = new NNTP({host: config.host, port: config.port, username: config.user, password: config.pass});
    //
    //         nntp.connectAndAuthenticate(function (error, response) {
    //             assert.notEqual(null, error);
    //             console.log(error.message);
    //             assert.equal(error.message, 'Max user connection exceed');
    //             assert.equal(null, response);
    //
    //             done();
    //         });
    //     });
    // });

    describe('#getArticle()', function () {
        it('should much article content from ethalon connection', function (done) {
            this.timeout(50000);
            let server0 = new Nitpin(ethalonService);
            server0.getArticle('', config.article, function gotArticle(err, headers, body) {
                assert.equal(null, err);
                let ethalonArticleMD5 = {
                    headers: md5(headers),
                    body: md5(body)
                };
                console.log("Ethalon headers: " + ethalonArticleMD5.headers);
                console.log("Ethalon body: " + ethalonArticleMD5.body);
                let server = new Nitpin(config);
                server.getArticle('', config.article, function gotArticle2(err, headers, body) {
                    let result = {
                        headers: md5(headers),
                        body: md5(body)
                    };
                    console.log("Result headers: " + result.headers);
                    console.log("Result body: " + result.body);
                    assert.equal(ethalonArticleMD5.headers, result.headers);
                    assert.equal(ethalonArticleMD5.body, result.body);

                    done();
                });
            });
        });

        it('should return no such article', function (done) {
            this.timeout(50000);
            let server = new Nitpin(config);
            server.getArticle('', '<BAD_ARTICLE>', function gotArticle(err, headers, body) {
                assert.notEqual(null, err);

                done();
            });
        });
    });
});
