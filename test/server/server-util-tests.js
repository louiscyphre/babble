/*jshint esversion: 6 */
(function () {
    'use strict';
    /* global require, describe, it */
    let assert = require('assert');
    let utils = require('../../server/server-util');
    let sinon = require('sinon');

    describe('server-util module existence:', function () {
        it('should load the server-util module', function () {
            assert.notEqual(null, utils);
        });
    });

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
            });
        });
    });
}());
