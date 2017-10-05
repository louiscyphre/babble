(function (global, module, factory) {
    'use strict';
    /* global module, require, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.constants = factory();
    }
}(this, module, function () {

    return {
        SERVER_PORT: 9000,

        HOLDING_REQUEST_TIMEOUT: 180000,

        httpSuccessCodes: {
            NO_CONTENT: 204
        },

        httpErrorCodes: {
            BAD_REQUEST: 400,
            NOT_FOUND: 404,
            METHOD_NOT_ALLOWED: 405,
        }
    };
}));
