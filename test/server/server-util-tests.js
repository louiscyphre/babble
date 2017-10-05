/*jshint esversion: 6 */
(function () {
    'use strict';
<<<<<<< HEAD
    /* global require, describe, it */
    let assert = require('assert');
    let utils = require('../../server/server-util');
    let sinon = require('sinon');

    describe('server-util module existence:', function () {
        it('should load the server-util module', function () {
            assert.notEqual(null, utils);
        });
    });

=======
    /* global console, require, describe, it */
    let assert = require('assert');
    let sinon = require('sinon');
    let utils = require('../../server/server-util');

>>>>>>> 4c2ce34b11587abcd2af91eade24cdc5f24b9773
    describe('server-util module functions:', function () {
        let requests = [];
        let spy = sinon.spy();
        let response = {
            end: spy
        };
        describe('utils.pushResponseToStack():', function () {
            it('requests array should contain response after use', function () {
                assert.deepEqual([], requests);
                utils.pushResponseToStack(requests, response);
                assert.deepEqual(1, requests.length);
            });
            it('response must be timestamped', function () {
                assert.deepEqual(true, requests[0].hasOwnProperty('timestamp'));
            });
        });
        describe('utils.closeExpired():', function () {
            it('should close all expired requests (expirationTime = 0)', function () {
                utils.closeExpired(requests, 0);
                assert.deepEqual([], requests);
            });
            it('should call .end() of each response', function () {
                sinon.assert.called(spy);
<<<<<<< HEAD
            });
            it('.end() should be called as .end("")', function () {
                sinon.assert.calledWith(spy, "");
            });
        });
        describe('utils.closePendingRequests():', function () {
            it('should answer with stringified message sent as parameter', function () {

                utils.pushResponseToStack(requests, response);

                let message = {
                    closeRequestsWithMessage: "Hi",
                    timestamp: 1506983034931
                }

                utils.closePendingRequests(requests, message);
                assert.deepEqual([], requests);
                sinon.assert.called(spy);
                sinon.assert.calledWith(spy, JSON.stringify(message));
=======
            });
            it('.end() should be called as .end("")', function () {
                sinon.assert.calledWith(spy, "");
            });
        });
        describe('utils.closePendingRequests():', function () {
            it('should answer with stringified message sent as parameter', function () {

                utils.pushResponseToStack(requests, response);

                let message = {
                    closeRequestsWithMessage: "Hi",
                    timestamp: 1506983034931
                };

                utils.closePendingRequests(requests, message);
                assert.deepEqual([], requests);
                sinon.assert.called(spy);
                sinon.assert.calledWith(spy, JSON.stringify(message));
            });
        });
        describe('utils.setResponseHeaders():', function () {
            it('should set apropriate headers for response', function () {

                let response = {
                    setHeader: spy
                };

                utils.setResponseHeaders(response);

                sinon.assert.calledWith(spy, 'Access-Control-Allow-Origin', '*');
                sinon.assert.calledWith(spy, 'Access-Control-Allow-Headers', 'Content-Type');
                sinon.assert.calledWith(spy, 'Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
                sinon.assert.calledWith(spy, 'Cache-Control', 'max-age=0, public');
                sinon.assert.calledWith(spy, 'Content-Type', 'text/plain');
>>>>>>> 4c2ce34b11587abcd2af91eade24cdc5f24b9773
            });
        });
    });
}());
