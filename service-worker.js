var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [

  'https://louiscyphre.github.io/babble/#/vegans',
  'https://louiscyphre.github.io/babble/index.html',
  'https://louiscyphre.github.io/babble/images/send_bg.webp',
  'https://louiscyphre.github.io/babble/images/send_bg_medium.webp',
  'https://louiscyphre.github.io/babble/images/send_bg_small.webp',
  'https://louiscyphre.github.io/babble/images/logo.svg',
  'https://louiscyphre.github.io/babble/images/logo_small.svg',
  'https://louiscyphre.github.io/babble/images/del_msg.svg',
  'https://louiscyphre.github.io/babble/images/del_msg_small.svg',
  'https://louiscyphre.github.io/babble/images/msgs.svg',
  'https://louiscyphre.github.io/babble/images/msgs_small.svg',
  'https://louiscyphre.github.io/babble/images/anon.svg',
  'https://louiscyphre.github.io/babble/images/users.svg',
  'https://louiscyphre.github.io/babble/images/users_small.svg',


];

self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function (cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
        .then(function (response) {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // IMPORTANT: Clone the request. A request is a stream and
            // can only be consumed once. Since we are consuming this
            // once by cache and once by the browser for fetch, we need
            // to clone the response.
            var fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(
                function (response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    var responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(function (cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );

    event.waitUntil(
        caches.open('v1').then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});