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
    var users = [];

    return {
        login: function login(user) {
            var index = users.indexOf(user);
            if (index === -1) {
                users.push(user);
            }
            console.log('[INFO] login(): logged in:', JSON.stringify(user));
            console.log('[INFO] login(): all users:', JSON.stringify(users));
        },
        logout: function logout(user) {
            var index = users.indexOf(user);
            if (index !== -1) {
                users.splice(index, 1);
            }
            console.log('[INFO] logout(): logged out:', JSON.stringify(user));
            console.log('[INFO] logout(): all users:', JSON.stringify(users));
        },
        count: function count() {
            return users.length;
        },
        getGravatar: function getGravatar(email) {
            if (typeof email !== 'string' || email === '') {
                return 'none';
            }
            return gravatarify(email);
        },
        processAuth: function processAuth(authCallback, request, response,
            requestsHandler, pendingRequests, msg) {

            var requestBody = '';
            request.on('data', function (chunk) {
                requestBody += chunk;
            });
            request.on('end', function () {
                var user = JSON.parse(requestBody);
                authCallback(user);
                requestsHandler(pendingRequests, msg);
                response.end(JSON.stringify({
                    gravatar: gravatarify(user.email)
                }));
            });
        }
    };
}));
