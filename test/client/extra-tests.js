/*jshint esversion: 6 */
(function (window) {
    'use strict';

    /* jshint browser: true */
    /* global require, describe, it, before, beforeEach, after, afterEach */
    let assert = window.chai.assert;
    let sinon = window.sinon;
    let Babble = window.Babble;


    describe('Client-Server', function () {

        let server, apiUrl;

        before(function () {
            apiUrl = 'http://localhost:9000';
            server = sinon.fakeServer.create({
                "autoRespond": true,
                "autoRespondAfter": true,
                "respondImmediately": true,
                "fakeHTTPMethods": true,
                "logger": true,
                "unsafeHeadersEnabled": true
            });
        });
        beforeEach(function () {
            server.requests.length = 0;
        });
        after(function () {
            server.restore();
        });

        describe('API', function () {
            let ans = {
                id: (Date.now()).toString()
            };

            let message = {
                name: 'Alex Krul',
                email: 'alex@krul.co.il',
                message: 'Hi from mocha',
                timestamp: ans.id
            };
            it('should issue POST /messages ', function () {

                server.respondWith('POST', `${apiUrl}/messages`, [200, {
                        'Content-Type': 'text/plain',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                        'Cache-Control': 'max-age=0, public'
                    }, JSON.stringify(ans)
                ]);

                let callback = sinon.spy();
                Babble.postMessage(message, callback);
                //server.respond();
                //setTimeout(function () {
                ///    sinon.assert.calledWith(callback, ans);
                //}, 3000);
            });
        });
    });
}(this));
