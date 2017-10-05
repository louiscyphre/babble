(function (global, module, factory) {
    'use strict';
    /* global module, require, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.messages = factory();
    }
}(this, module, function () {
    var users = require('./users');
    var messagesArray = [];
    var requests = [];

    return {
        addMessage: function addMessage(message) {
            if (!message.hasOwnProperty('name') ||
                !message.hasOwnProperty('email') ||
                !message.hasOwnProperty('message') ||
                !message.hasOwnProperty('timestamp')) {
                return -1;
            }
            var timestamp = parseInt(message.timestamp);
            if (isNaN(timestamp)) {
                return -1;
            }
            message.url = users.getGravatar(message.email);
            delete message.email;
            //console.log('[INFO] addMessage(): (email removed, gravatar added instead):', JSON.stringify(message));
            messagesArray.push(message);
            return timestamp;
        },
        getMessages: function getMessages(counter) {
            if (typeof counter !== 'number') {
                return [];
            }
            return messagesArray.slice(counter);
        },
        deleteMessage: function deleteMessage(id) {
            if (typeof id !== 'string' || messagesArray.length === 0) {
                return;
            }
            var timestamp = parseInt(id);
            if (isNaN(timestamp)) {
                return;
            }
            for (var i = messagesArray.length - 1; i >= 0; i--) {
                if (parseInt(messagesArray[i].timestamp) === timestamp) {
                    messagesArray.splice(i, 1);
                }
            }
        },
        count: function count() {
            return messagesArray.length;
        },
        clear: function clear() {
            messagesArray = [];
        },
        requests: requests
    };
}));
