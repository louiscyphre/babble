(function (window, document, console, localStorage, XMLHttpRequest, Promise) {

    'use strict';
    console.log('hello from client');

    window.Babble = {

        apiUrl: 'http://localhost:9000',
        counter: 0,
        storage: localStorage,
        request: function request(options) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();

                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        // Success!
                        console.log(xhr.responseText);
                        resolve(xhr.responseText);
                    } else {
                        // We reached our target server, but it returned an error
                        console.log(xhr.responseText);
                        reject(xhr.responseText);
                    }
                };

                xhr.onerror = function () {
                    // There was a connection error of some sort
                    console.log("Error");
                };


                if (options.method == 'GET') {
                    xhr.open(options.method, window.Babble.apiUrl + options.action + '?' + options.data, true);
                    console.log("URL:", window.Babble.apiUrl + options.action + '?' + options.data);
                    xhr.send();
                } else {
                    xhr.open(options.method, window.Babble.apiUrl + options.action, true);
                    xhr.setRequestHeader('Content-Type', 'text/json');
                    xhr.send(JSON.stringify(options.data));
                }
            });
        },

        poll: function poll() {
            window.Babble.request({
                method: 'GET',
                action: '/messages',
                data: 'counter=' + window.Babble.counter.toString()
            }).then(function (result) {
                console.log(result);
                window.setTimeout(poll, 6000);
            }).catch(function (error) {
                console.log(error);
            });
        },

        run: function (document, window, console) {

            window.Babble.updateKey('all', '');

            var newMessageForm = document.querySelector('.Chat-sendMessageForm');

            newMessageForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var message = document.querySelector('.Chat-message').value;
                window.Babble.postMessage(message, function () {});
            });

            var registerForm = document.querySelector('.Modal');

            registerForm.addEventListener('submit', function (e) {
                e.preventDefault();

                window.Babble.register({
                    name: registerForm.elements[0].value,
                    email: registerForm.elements[1].value
                });
                registerForm.style.display = 'none';
                registerForm.style.visibility = 'hidden';
                registerForm.setAttribute("aria-hidden", "true");
                window.Babble.getMessages(window.Babble.counter, window.Babble.updateCounter);
            });

            (function makeGrowable(container) {
                var area = container.querySelector('textarea');
                var clone = container.querySelector('span');
                area.addEventListener('input', function (e) {
                    clone.textContent = area.value;
                });
            }(document.querySelector('.js-growable')));
        },

        register: function register(userInfo) {
            window.Babble.updateKey('userInfo', userInfo);
        },

        postMessage: function postMessage(message, callback) {
            window.Babble.updateKey('currentMessage', message.message);
            return window.Babble.request({
                    method: 'POST',
                    action: '/messages',
                    data: message
                }).then(callback())
                .catch(function (error) {
                    console.log(error);
                });
        },
        getMessages: function getMessages(counter, callback) {
            callback();
            window.Babble.request({
                method: 'GET',
                action: '/messages',
                data: 'counter=' + counter.toString()
            }).then(function (result) {
                console.log(result);
                window.setTimeout(function () {
                    getMessages(counter, callback);
                }, 6000);
            }).catch(function (error) {
                console.log(error);
            });
        },
        updateCounter: function (amount) {
            window.Babble.counter -= amount;
        },
        updateKey: function updateKey(keyName, value) {
            if (keyName === 'all') {
                window.Babble.storage.setItem('babble', JSON.stringify({
                    currentMessage: value,
                    userInfo: {
                        name: value,
                        email: value
                    }
                }));
                return;
            }
            var data = JSON.parse(window.Babble.storage.getItem('babble'));
            if (keyName === 'userInfo') {
                data.userInfo.name = value.name;
                data.userInfo.email = value.email;
                window.Babble.storage.setItem('babble', JSON.stringify(data));
                return;
            } else if (keyName === 'currentMessage') {
                data.currentMessage = value;
                window.Babble.storage.setItem('babble', JSON.stringify(data));
                return;
            } else throw new window.Babble.exception('wrong use of updateKey()');
        },
        exception: function exception(what) {
            console.error("[CRITICAL ERROR] Exception thrown: ", what);
        }
    };

    window.Babble.run(document, window, console);

})(this.window, this.document, this.console, this.localStorage, this.XMLHttpRequest, this.Promise);
/*var formCallback = function formCallback(e) {
    e.preventDefault();
    Babble.request({
        method: e.target.method,
        action: e.target.action,
        data: serialize(e.target)
    }).then(function (result) {
        console.log(result);
    });
}

var newMessageForm = document.querySelector('.Chat-sendMessageForm');

newMessageForm.addEventListener('submit', formCallback);

var registerForm = document.querySelector('.Modal');
*/
