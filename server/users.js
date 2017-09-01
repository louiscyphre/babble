(function (global, module, factory) {
    'use strict';
    /* global module, require, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.utils = factory();
    }
}(this, module, function () {
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
        }
    };
}));
