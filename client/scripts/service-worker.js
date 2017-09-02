(function (global, module, factory) {
    'use strict';
    /* global module, require, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.utils = factory();
    }
}(this, module, function () {

    require('serviceworker-cache-polyfill.js');

    // TODO 
    this.addEventListener('install', function (event) {
        event.waitUntil(
            caches.open('demo-cache').then(function (cache) {
                return cache.addAll(['/', '/index.html', '/styles/main.css', '/scripts/main.js']);
            })
        );
    });

    this.addEventListener('fetch', function (event) {
        event.respondWith(
            caches.match(event.request).then(function (response) {
                return response || new Response("Nothing in the cache for this request");
            })
        );
    });
}));
