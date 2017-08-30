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
        md5hash: require('md5') // copy-pasting saved
    };
}));
