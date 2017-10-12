/*jshint esversion: 6 */
(function () {
    'use strict';
    /* global console, require, describe, it */
    let assert = require('assert');
    let sinon = require('sinon');
    let utils = require('../../server/server-util');
    let messages = require('../../server/messages-util');
    let stats = require('../../server/stats');

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
                };

                utils.closePendingRequests(requests, message);
                assert.deepEqual([], requests);
                sinon.assert.called(spy);
                sinon.assert.calledWith(spy, JSON.stringify(message));
            });
        });
        describe('utils.setResponseHeaders():', function () {
            it('should set apropriate headers for response', function () {

                response.setHeader = spy;
                utils.setResponseHeaders(response);

                sinon.assert.calledWith(spy, 'Access-Control-Allow-Origin', '*');
                sinon.assert.calledWith(spy, 'Access-Control-Allow-Headers', 'Content-Type');
                sinon.assert.calledWith(spy, 'Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
                sinon.assert.calledWith(spy, 'Cache-Control', 'max-age=0, public');
                sinon.assert.calledWith(spy, 'Content-Type', 'text/plain');
            });
        });
        describe('utils.responseWith():', function () {
            it('should set error code for response with writeHead()', function () {

                response.writeHead = spy;

                utils.responseWith(response, 404);
                sinon.assert.calledWith(spy, 404);
            });
        });

        describe('utils.doGETmessages():', function () {
            it('should push to response all asked messages', function () {

                let data = {
                    counter: 0
                };
                let msg = {
                    name: 'Admin',
                    email: 'mail@gmail.com',
                    message: 'Hi',
                    timestamp: 1506983034931
                };
                messages.clear();

                messages.addMessage(msg);
                utils.doGETmessages(data, response, messages);
                sinon.assert.calledWith(response.end, JSON.stringify([msg]));
            });
        });

        describe('utils.doDELETEmessages():', function () {
            it('should delete message on specified url and release stats requests', function () {

                let url = {
                    pathname: '/messages/1506983034931'
                };
                let statsResponse = {
                    end: sinon.spy()
                };
                let msg = {
                    name: 'Admin',
                    email: 'mail@gmail.com',
                    message: 'Hi',
                    timestamp: 1506983034931
                };
                messages.clear();

                messages.addMessage(msg);

                utils.pushResponseToStack(stats.requests, statsResponse);
                assert.equal(true, stats.requests.length >= 1);

                utils.doDELETEmessages(url, response, messages, stats);

                assert.deepEqual([], stats.requests);
                sinon.assert.calledWith(response.end, JSON.stringify(true));
                let allMessages = messages.getMessages(0);
                assert.deepEqual(allMessages, []);
            });
        });
    });
}());
