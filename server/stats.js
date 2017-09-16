(function (global, module, factory) {
    'use strict';
    /* global module, require, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.utils = factory();
    }
}(this, module, function () {
    var users = require('./users');
    var messages = require('./messages-util');

    var stats = {
        users: 0,
        messages: 0
    };
    return {
        get: function get() {
            return {
                users: users.count(),
                messages: messages.count(),
            };
        }
    };
}));
