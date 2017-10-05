/*jshint esversion: 6 */
(function () {
    'use strict';
    /* global console, require, describe, it */
    let assert = null,
        stats = null,
        users = null,
        messages = null;
    try {
        assert = require('assert');
        stats = require('../../server/stats');
        users = require('../../server/users');
        messages = require('../../server/messages-util');

        describe('stats module functions:', function () {
            assert.notEqual(null, messages);
            assert.notEqual(null, users);

            describe('stats.get():', function () {
                it('should return {users:0, messages:0} for initial state', function () {

                    messages.clear();
                    users.clear();

                    assert.deepEqual({
                        users: 0,
                        messages: 0
                    }, stats.get());
                });
            });

            describe('stats.get():', function () {
                it('should return {users:1, messages:1}', function () {
                    let message = {
                        name: 'Anonymous',
                        email: 'anon@somewhere.com',
                        message: 'Hi',
                        timestamp: Date.now()
                    };
                    messages.addMessage(message);

                    let user = {
                        name: '',
                        email: ''
                    };
                    users.login(user);
                    assert.deepEqual({
                        users: 1,
                        messages: 1
                    }, stats.get());
                });
            });
        });
    } catch (err) {
        console.log(err);
    }
}());
