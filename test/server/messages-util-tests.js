/*jshint esversion: 6 */
(function () {
    'use strict';
    /* global require, describe, it */
    let assert = require('assert');
    let messages = require('../../server/messages-util');

    describe('Message', function () {
        it('should load the messages module', function () {
            assert.notEqual(null, messages);
        });
        it('should be able to add a new message and return id', function () {
            let first = {
                name: 'Alex Krul',
                email: 'alex@krul.co.il',
                message: 'Hi from mocha',
                timestamp: Date.now()
            };
            let id = messages.addMessage(first);
            assert.notEqual(null, id);
        });
        it('should return new messages', function () {
            let all = messages.getMessages(0);
            let second = {
                name: 'Alex Krul',
                email: 'alex@krul.co.il',
                message: 'Hi from mocha',
                timestamp: Date.now()
            };
            messages.addMessage(second);
            let newMessages = messages.getMessages(all.length);
            assert.deepEqual(newMessages, [second]);
        });
        it('should be able to delete a message', function () {
            let third = {
                name: 'Alex Krul',
                email: 'alex@krul.co.il',
                message: 'Hi from mocha',
                timestamp: Date.now()
            };
            let id = messages.addMessage(third);
            messages.deleteMessage(id.toString());
            assert.equal(null, messages.getMessages(0).find(m => m.timestamp === id));
        });
    });

    describe('message-util module extra:', function () {
        describe('messages.addMessage():', function () {
            it('should not accept messages without "name" property', function () {
                let msg = {
                    email: 'alex@krul.co.il',
                    message: 'Hi from mocha',
                    timestamp: Date.now()
                };
                let id = messages.addMessage(msg);
                assert.deepEqual(-1, id);
            });
            it('should not accept messages without "email" property', function () {
                let msg = {
                    name: 'Alex Krul',
                    message: 'Hi from mocha',
                    timestamp: Date.now()
                };
                let id = messages.addMessage(msg);
                assert.deepEqual(-1, id);
            });
            it('should not accept messages without "message" property', function () {
                let msg = {
                    name: 'Alex Krul',
                    email: 'alex@krul.co.il',
                    timestamp: Date.now()
                };
                let id = messages.addMessage(msg);
                assert.deepEqual(-1, id);
            });
            it('should not accept messages without "timestamp" property', function () {
                let msg = {
                    name: 'Alex Krul',
                    email: 'alex@krul.co.il',
                    message: 'Hi from mocha'
                };
                let id = messages.addMessage(msg);
                assert.deepEqual(-1, id);
            });
            it('should not accept messages that their timestamp cannot be parsed as integer', function () {
                let msg = {
                    name: 'Alex Krul',
                    email: 'alex@krul.co.il',
                    message: 'Hi from mocha',
                    timestamp: '.34'
                };
                let id = messages.addMessage(msg);
                assert.deepEqual(-1, id);
                msg.timestamp = 'str';
                id = messages.addMessage(msg);
                assert.deepEqual(-1, id);
            });
        });
        describe('messages.getMessages():', function () {
            it('counter must be of type number', function () {
                var array = messages.getMessages(0);
                assert.deepEqual([], messages.getMessages('s'));
                assert.deepEqual([], messages.getMessages({}));
                assert.deepEqual([], messages.getMessages([]));
                assert.deepEqual([], messages.getMessages(null));
                assert.deepEqual([], messages.getMessages(undefined));
                assert.deepEqual(array, messages.getMessages(0));
            });
        });
        describe('messages.deleteMessage():', function () {
            it('id must be of type string, otherwise messages array remain unchanged', function () {
                var array = messages.getMessages(0);
                messages.deleteMessage({});
                messages.deleteMessage([]);
                messages.deleteMessage(null);
                messages.deleteMessage(undefined);
                assert.deepEqual(array, messages.getMessages(0));
            });
            it('id must be valid, otherwise messages array remain unchanged', function () {
                var array = messages.getMessages(0);
                messages.deleteMessage('.1');
                messages.deleteMessage('0');
                messages.deleteMessage('-1');
                assert.deepEqual(array, messages.getMessages(0));
            });
        });
        describe('messages.count():', function () {
            it('must be equal to messages array length', function () {
                var array = messages.getMessages(0);
                assert.deepEqual(messages.count(), array.length);
            });
        });
    });
}());
