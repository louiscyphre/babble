(function (global, module, factory) {
    'use strict';
    /* global module, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.utils = factory();
    }
}(this, module, function () {
    var exception = function exception(what) {
        console.error("[CRITICAL ERROR] Exception thrown: ", what);
    };

    var allMessages = 0;
    var deletedMessages = 0;
    var messagesArray = [];

    return {
        addMessage: function addMessage(message) {
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

            var index = parseInt(id);
            if (isNaN(index) || (allMessages - deletedMessages) <= 0) {
                return;
            }
            messagesArray.splice(index, 1);
            deletedMessages++;
        },
        count: function count() {
            return messagesArray.length;
        }
    };
}));
