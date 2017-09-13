(function (global, module, factory) {
    'use strict';
    /* global module, require, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.utils = factory();
    }
}(this, module, function () {
    var exception = function exception(what) {
        console.error('[CRITICAL ERROR] Exception thrown: ', what);
    };
    var gravatarify = require('gravatar').url;

    var allMessages = 0;
    var deletedMessages = 0;
    var messagesArray = [];

    var getGravatar = function getGravatar(email) {
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
            allMessages++;
            return allMessages - deletedMessages;
        },
        getMessages: function getMessages(counter) {
            var arr = messagesArray.slice(counter);
            console.log('getMessages(counter): Returning array:', arr);
            return arr;
        },
        deleteMessage: function deleteMessage(id) {
            try {
                var index = parseInt(id);
                if (isNaN(index) || (allMessages - deletedMessages) <= 0) {
                    throw exception('Bad message index.');
                }
                messagesArray.splice(index, 1);
                deletedMessages++;
            } catch (e) {}
        },
        count: function count() {
            return messagesArray.length;
        }
    };
}));
