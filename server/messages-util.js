(function (global, module, factory) {
    'use strict';
    /* global module, require, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.utils = factory();
    }
}(this, module, function () {
    var gravatarify = require('gravatar').url;
    var messagesArray = [];

    var getGravatar = function (email) {
        if (typeof email !== 'string' || email === '') {
            return 'none';
        }
        return gravatarify(email);
    };

    return {
        addMessage: function addMessage(message) {
            message.url = getGravatar(message.email);
            console.log('addMessage(message): Adding message:', message);
            messagesArray.push(message);
            return message.timestamp;
        },
        getMessages: function getMessages(counter) {
            var arr = messagesArray.slice(counter);
            console.log('getMessages(counter): Returning array:', arr);
            return arr;
        },
        deleteMessage: function deleteMessage(id) {
            var timestamp = parseInt(id);
            if (isNaN(timestamp) || messagesArray.length === 0) {
                return;
            }
            for (var i = messagesArray.length - 1; i >= 0; i--) {
                if (messagesArray[i].timestamp === timestamp) {
                    messagesArray.splice(i, 1);
                }
            }
        },
        count: function count() {
            return messagesArray.length;
        }
    };
}));
