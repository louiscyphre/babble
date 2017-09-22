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
            console.log('login(user): logged in:', JSON.stringify(user));
            console.log('login(user): all users:', JSON.stringify(users));
        },
        logout: function logout(user) {
            var index = users.indexOf(user);
            if (index !== -1) {
                users.splice(index, 1);
            }
            console.log('logout(user): logged out:', JSON.stringify(user));
            console.log('logout(user): all users:', JSON.stringify(users));
        },
        count: function count() {
            return users.length;
        },
        getGravatar: function (email) {
            if (typeof email !== 'string' || email === '') {
                return 'none';
            }
            return gravatarify(email);
        },
    };
}));
