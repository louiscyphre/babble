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
        curr: {},
        prev: {}
    };
    return {
        getStats: function getStats() {
            stats.prev = stats.curr;
            stats.curr = {
                users: users.count(),
                messages: messages.count(),
            };
            return stats.curr;
        }
    };
}));
