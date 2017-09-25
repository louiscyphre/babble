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
        closeExpired: function closeExpired(requests, expirationTime) {
            if (requests.length === 0) {
                return;
            }
            for (var i = requests.length - 1; i >= 0; i--) {
                if (requests[i].timestamp >= expirationTime) {
                    requests[i].response.end("");
                    console.log('[INFO] close(requests, timeout): closing request:', i);
                    requests.splice(i, 1);
                }
            }
        },
        closePendingRequests: function closePendingRequests(requests, msg) {
            while (requests.length > 0) {
                var request = requests.pop();
                console.log('[INFO] closePendingRequests(): ', JSON.stringify(msg));
                request.response.end(JSON.stringify(msg));
            }
        }
    };
}));
