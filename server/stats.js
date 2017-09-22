(function (global, module, factory) {
    'use strict';
    /* global module, require, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.stats = factory();
    }
}(this, module, function () {
    var users = require('./users');
    var messages = require('./messages-util');

    return {
        get: function get() {
            return {
                users: users.count(),
                messages: messages.count(),
            };
        }
    };
}));
