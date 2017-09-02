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
    return {
        getStats: function getStats() {
            return {
                users: users.count(),
                messages: messages.count(),
            };
        }
    };
}));
