(function (window, document, console, localStorage, XMLHttpRequest, Promise, navigator) {

    'use strict';
    console.log('hello from client');


    function request(options) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 400) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.responseText);
                }
            };
            xhr.onerror = function () {
                console.log("Error");
            };
            xhr.open(options.method, window.Babble.apiUrl + options.action, true);
            xhr.setRequestHeader('Content-Type', 'text/json');
            console.log("URL:", window.Babble.apiUrl + options.action);
            if (options.method == 'GET') {
                xhr.send();
            } else {
                xhr.send(JSON.stringify(options.data));
            }
        });
    }

    function poll(obj) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 400) {
                    obj.storeMessages(JSON.parse(xhr.responseText));
                    poll(obj);
                } else {
                    console.log("Server error");
                }
            };
            xhr.onerror = function () {
                console.log("Network error");
            };
            xhr.open('GET', obj.apiUrl + '/messages?counter=' + obj.counter.toString(), true);
            xhr.setRequestHeader('Content-Type', 'text/json');
            console.log("URL:", obj.apiUrl + '/messages?counter=' + obj.counter.toString());
            xhr.send();
        });
    }

    window.Babble = {

        counter: 0,
        apiUrl: 'http://localhost:9000',
        messages: [],
        storage: localStorage,
        run: function (document, window, console) {

            window.Babble.updateKey('all', '');

            var newMessageForm = document.querySelector('.Chat-sendMessageForm');

            newMessageForm.addEventListener('submit', function (e) {
                e.preventDefault();

                var data = JSON.parse(window.Babble.storage.getItem('babble'));
                var textarea = document.querySelector('.Chat-sendMessageFormText');
                var message = {
                    name: data.userInfo.name,
                    email: data.userInfo.email,
                    message: textarea.value,
                    timestamp: window.Date.now()
                };
                window.Babble.postMessage(message, window.Babble.dummy);
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
            });
            if ('serviceWorker' in navigator) {
                try {
                    navigator.serviceWorker.register('./scripts/service-worker.js').then(function () {
                        console.log("Service Worker Registered");
                    }).catch(function () {
                        console.log("Service worker cannot be registered");
                    });
                } catch (e) {

                }

            }
            // https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
            var tx = document.querySelector('.Chat-sendMessageFormText');
            //tx.addEventListener("input", onInput);

            function onInput(e) {
                e.target.style.height = 'auto';
                if (e.target.scrollHeight <= 300) {
                    e.target.style.height = (e.target.scrollHeight) + 'px';
                } else {
                    e.target.style.height = '300px';
                }
            }

            //window.onload = function () {
            //    window.setTimeout(function () {
            //        window.Babble.getMessages(window.Babble.counter, window.Babble.dummy);
            //    }, 2000);
            //};

            window.onbeforeunload = function () {
                request({
                    method: 'POST',
                    action: '/logout',
                    data: (JSON.parse(window.Babble.storage.getItem('babble'))).userInfo
                }).then(function (answer) {
                    console.log('Answer on POST /logout:', answer);
                    window.Babble.updateKey('all', '');
                }).catch(function (error) {
                    console.log(error);
                });
            };
        },

        register: function register(userInfo) {
            window.Babble.updateKey('userInfo', userInfo);
            request({
                method: 'POST',
                action: '/login',
                data: userInfo
            }).then(function (answer) {
                console.log('Answer on POST /login:', answer);
                window.setTimeout(function () {
                    window.Babble.getMessages(window.Babble.counter, window.Babble.dummy);
                    window.Babble.getStats(window.Babble.dummy);
                }, 500);
            }).catch(function (error) {
                console.log(error);
            });
        },

        postMessage: function postMessage(message, callback) {
            window.Babble.updateKey('currentMessage', message.message);
            request({
                method: 'POST',
                action: '/messages',
                data: message
            }).then(function (answer) {
                console.log('Answer on POST /messages:', answer);
            }).catch(function (error) {
                console.log(error);
            });
            callback({
                id: 42
            });
        },
        getMessages: function getMessages(counter, callback) {
            poll(window.Babble);
            callback([]);
        },
        deleteMessage: function deleteMessage(id, callback) {
            request({
                method: 'DELETE',
                action: '/messages',
                data: id
            }).then(function (answer) {
                console.log('Answer on DELETE /messages:', answer);
            }).catch(function (error) {
                console.log(error);
            });
            callback(true);
        },
        getStats: function getStats(callback) {
            request({
                method: 'GET',
                action: '/stats',
                data: ''
            }).then(function (answer) {
                console.log('Answer on GET /stats:', answer);
            }).catch(function (error) {
                console.log(error);
            });
            callback({
                users: 5,
                messages: 20
            });
        },
        storeMessages: function (array) {
            //console.log('storeMessages(): All client messages before:', JSON.stringify(window.Babble.messages));
            //console.log('storeMessages(): Counter before:', window.Babble.counter);
            window.Babble.messages = window.Babble.messages.concat(array);
            window.Babble.counter = window.Babble.messages.length;
            //console.log('storeMessages(): All client messages after:', JSON.stringify(window.Babble.messages));
            //console.log('storeMessages(): Counter after:', window.Babble.counter);
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
        dummy: function (something) {
            // dummy gummy crowbar fix, because need to go on
            return something;
        },
        exception: function exception(what) {
            console.error("[CRITICAL ERROR] Exception thrown: ", what);
        }
    };

    window.Babble.run(document, window, console);

})(this.window, this.document, this.console, this.localStorage, this.XMLHttpRequest, this.Promise, this.navigator);
