/*jshint esversion: 6 */
(function () {
    'use strict';
    /* global console, require, describe, it */
    let assert = null,
        sinon = null,
        users = null;
    try {
        assert = require('assert');
        sinon = require('sinon');
        users = require('../../server/users');

        describe('users module functions:', function () {
            assert.notEqual(null, users);

            let user = {
                name: 'Name',
                email: 'email@site.com'
            };

            describe('users.clear():', function () {
                it('users array must be empty after call', function () {
                    users.clear();
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

        });
    } catch (err) {
        console.log(err);
    }
}());
