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
            if (!message.hasOwnProperty('name') ||
                !message.hasOwnProperty('email') ||
                !message.hasOwnProperty('timestamp')) {
                return;
            }
            var timestamp = parseInt(message.timestamp);
            if (isNaN(timestamp)) {
                return 0;
            }
            message.url = getGravatar(message.email);
            delete message.email;
            console.log('addMessage(message): Adding message (email removed, gravatar added instead):', message);
            messagesArray.push(message);
            return timestamp;
        },
        getMessages: function getMessages(counter) {
            //console.log('getMessages(counter): Returning array:', messagesArray.slice(counter););
            return messagesArray.slice(counter);
        },
        deleteMessage: function deleteMessage(id) {
            var timestamp = parseInt(id);
            if (isNaN(timestamp) || messagesArray.length === 0) {
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
        }
    };
}));
