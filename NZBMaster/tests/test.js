var assert = require('assert'),
    net = require('net'),
    zlib = require('zlib'),
    NNTP = require('node-nntp'),
    child_process = require('child_process'),
    server;

//child_process.fork("app.js");

describe('NNTP', function () {
    describe('#connect()', function () {
        it('should return a response when connection is successful', function (done) {
            var nntp = new NNTP({host: 'localhost', port: 119});

            nntp.connect(function (error, response) {
                assert.equal(null, error);
                assert.equal(response.status, 201);
                assert.equal(response.message, 'Nargott NNTP Service Ready (posting is allowed) (yEnc enabled).');

                done();
            });
        });

        it('should return an error when connection is unsuccessful', function (done) {
            var nntp = new NNTP({host: 'localhost', port: 120});

            nntp.connect(function (error, response) {
                assert.notEqual(null, error);
                assert.equal(error.message, 'connect ECONNREFUSED 127.0.0.1:120');
                assert.equal(null, response);

                done();
            });
        });
    });

    describe('#authenticate()', function () {

        it('should return a response when authentication with password is successful', function (done) {
            var nntp = new NNTP({host: 'localhost', port: 119, username: 'attic', password: 'attic'});

            nntp.connect(function (error, response) {
                nntp.authenticate(function (error, response) {
                    assert.equal(null, error);
                    assert.equal(response.status, 281);
                    assert.equal(response.message, 'Ok');

                    done();
                });
            });
        });

        it('should return an error when authentication without a password', function (done) {

                let nntp = new NNTP({host: 'localhost', port: 119, username: 'attic', password: 'attic'});

                nntp.connect(function (error, response) {
                    nntp.authenticate(function (error, response) {
                        assert.notEqual(null, error);
                        console.log(error);
                        assert.equal(error.message, 'Password is required');
                        assert.equal(null, response);

                        done();
                    });
                });
        });
    });

    describe('#cmaxConnections()', function () {
        it('should return response when connections is less than maxConnections', function (done) {
            for (let i=0; i<19; i++) {
                var nntp = new NNTP({host: 'localhost', port: 119, username: 'attic', password: 'attic'});

                nntp.connectAndAuthenticate(function (error, response) {
                    assert.equal(null, error);
                    assert.equal(response.status, 281);
                    assert.equal(response.message, 'Ok');

                    done();
                });
            }
        });

        it('should return error when connections is more than maxConnections', function (done) {
            this.timeout(15000);
            for (let i=0; i<21; i++) {
                var nntp = new NNTP({host: 'localhost', port: 119, username: 'attic', password: 'attic'});

                nntp.connectAndAuthenticate(function (error, response) {
                    assert.equal(null, error);
                    assert.equal(response.status, 281);
                    assert.equal(response.message, 'Ok');
                });
            }
            var nntp = new NNTP({host: 'localhost', port: 119, username: 'attic', password: 'attic'});

            nntp.connectAndAuthenticate(function (error, response) {
                assert.notEqual(null, error);
                console.log(error.message);
                assert.equal(error.message, 'Max user connection exceed');
                assert.equal(null, response);

                done();
            });
        });
    });

    describe('#getArticle()', function () {
        it('should return pipe with article contents', function (done) {
            this.timeout(50000);
            for (let i=0; i<21; i++) {
                var nntp = new NNTP({host: 'localhost', port: 119, username: 'attic', password: 'attic'});

                nntp.connectAndAuthenticate(function (error, response) {
                    assert.equal(null, error);
                    assert.equal(response.status, 281);
                    assert.equal(response.message, 'Ok');
                });
            }
            var nntp = new NNTP({host: 'localhost', port: 119, username: 'attic', password: 'attic'});

            nntp.connectAndAuthenticate(function (error, response) {
                assert.notEqual(null, error);
                console.log(error.message);
                assert.equal(error.message, 'Max user connection exceed');
                assert.equal(null, response);

                done();
            });
        });
    });
});
