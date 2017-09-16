(function (global, module, factory) {
    'use strict';
    /* global module, require, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.utils = factory();
    }
}(this, module, function () {

    return {
        close: function close(requests, timeout) {
            if (requests.length === 0) {
                return;
            }
            var expiration = new Date().getTime() - timeout;
            var response;
            for (var i = requests.length - 1; i !== 0; i--) {
                if (requests[i].timestamp !== expiration) {
                    response = requests[i].response;
                    response.end("");
                }
            }
        }
    };
}));
