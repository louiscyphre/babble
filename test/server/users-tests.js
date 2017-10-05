/*jshint esversion: 6 */
(function () {
    'use strict';
    /* global console, require, describe, it */
    let assert = require('chai').assert;
    let sinon = require('sinon');
    let users = require('../../server/users');

    describe('users module functions:', function () {
        assert.notEqual(null, users);

        let user = {
            name: 'Name',
            email: 'email@site.com'
        };

        describe('users.clear():', function () {
            it('users array must be empty after call', function () {
                users.clear();
                assert.deepEqual(0, users.count());
            });
        });

        describe('users.login():', function () {
            it('should add user to array', function () {
                users.login(user);
                assert.deepEqual(1, users.count());
            });
            it('should not login the same user twice', function () {
                users.login(user);
                assert.equal(1, users.count());
            });
        });

        describe('users.logout():', function () {
            it('should delete user from array', function () {
                users.login(user);
                assert.deepEqual(1, users.count());
            });
            it('should not login the same user twice', function () {
                users.login(user);
                assert.equal(1, users.count());
            });
        });

        describe('users.getGravatar():', function () {
            it('should return "none" for empty and non-string parameter', function () {
                assert.deepEqual('none', users.getGravatar(null));
                assert.deepEqual('none', users.getGravatar(undefined));
                assert.deepEqual('none', users.getGravatar({}));
                assert.deepEqual('none', users.getGravatar([]));
                assert.deepEqual('none', users.getGravatar(1));
                assert.deepEqual('none', users.getGravatar(''));
            });
            it('should return gravatar link for mail', function () {
                var link = users.getGravatar('anon@some.com');
                assert.isOk(-1 !== link.search('f37a6ff09482b8c0b2fc36c79c93347d'));
            });
        });

    });
}());
