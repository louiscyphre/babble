(function (global, module, factory) {
    'use strict';
    /* global module */
    if (typeof module === 'object' && module.exports) {
        module.exports.messages = factory();
    } else {
        global.utils = factory();
    }
}(this, module, function () {
    var exception = function exception(what) {
        this.console.error("[CRITICAL ERROR] Exception thrown: ", what);
    };

    var allMessages = 0;
    var deletedMessages = 0;
    var messages = [];

    return {
        index: function () {
            return 'Hello world';
        },
        addMessage: function addMessage(message) {

            return 'Hello world';
        },
        getMessages: function getMessages(counter) {

            return messages;
        }
    };
}));
