(function (global, module, factory) {
    'use strict';
    /* global module, require, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.users = factory();
    }
}(this, module, function () {
    var gravatarify = require('gravatar').url;
    var utils = require('./server-util');
    var users = [];

    function isExist(user, array) {
        for (var i = array.length - 1; i >= 0; --i) {
            if (user.email === array[i].email) {
                return i;
            }
        }
        return -1;
    }

    var usersutil = {
        login: function login(user) {
            var index = isExist(user, users);
            if (index === -1) {
                users.push(user);
            }
            //console.log('[INFO] login(): logged in:', JSON.stringify(user));
            //console.log('[INFO] login(): all users:', JSON.stringify(users));
        },
        logout: function logout(user) {
            var index = isExist(user, users);
            if (index !== -1) {
                users.splice(index, 1);
            }
            console.log('[INFO] logout(): logged out:', JSON.stringify(user));
            console.log('[INFO] logout(): all users:', JSON.stringify(users));
        },
        getGravatar: function getGravatar(email) {
            if (typeof email !== 'string' || email === '') {
                return 'none';
            }
            return gravatarify(email);
        },
        doAuth: function doAuth(authCallback, request, response, statsModule) {

            var requestBody = '';
            request.on('data', function (chunk) {
                requestBody += chunk;
            });
            request.on('end', function () {
                var user = JSON.parse(requestBody);
                authCallback(user);
                utils.closePendingRequests(statsModule.requests, statsModule.get());
                response.end(JSON.stringify({
                    gravatar: usersutil.getGravatar(user.email)
                }));
            });
        },
        count: function count() {
            return users.length;
        },
        clear: function clear() {
            users = [];
        }
    };
    return usersutil;
}));
