(function (window, document, console, localStorage, XMLHttpRequest, Promise, navigator) {

    'use strict';

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

    /*function poll(obj) {

        //console.log("Poll called with args:", obj, callback);
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 400) {
                    console.log("Poll response from server:", xhr.responseText);
                    resolve(JSON.parse(xhr.responseText));
                    //callback(JSON.parse(xhr.responseText));
                    //poll(obj, callback);
                } else {
                    console.log("Server error");
                    reject(JSON.parse(xhr.responseText));
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
    }*/


    /*function poll(obj, callback) {

        //console.log("Poll called with args:", obj, callback);
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 400) {
                    console.log("Poll response from server:", xhr.responseText);
                    callback(JSON.parse(xhr.responseText));
                    poll(obj, callback);
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
    }*/
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
                window.addEventListener('load', function () {
                    try {
                        navigator.serviceWorker.register('./scripts/service-worker.js').then(function (registration) {
                            // Registration was successful
                            console.log('ServiceWorker registration successful with scope: ', registration.scope);
                        }, function (err) {
                            // registration failed :(
                            console.log('ServiceWorker registration failed: ', err);
                        });
                    } catch (e) {

                    }
                });
            }

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

        poll: function poll(counter, callback) {
            var xhr = new XMLHttpRequest();

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 400) {
                    console.log("Poll response from server:", xhr.responseText);
                    callback(JSON.parse(xhr.responseText));
                    poll(counter, callback);
                } else {
                    console.log("Server error");
                }
            };
            xhr.onerror = function () {
                console.log("Network error");
            };
            xhr.open('GET', window.Babble.apiUrl + '/messages?counter=' + window.Babble.counter.toString(), true);
            xhr.setRequestHeader('Content-Type', 'text/json');
            console.log("URL:", window.Babble.apiUrl + '/messages?counter=' + window.Babble.counter.toString());
            xhr.send();
        },
        register: function register(userInfo) {
            window.Babble.updateKey('userInfo', userInfo);
            request({
                method: 'POST',
                action: '/login',
                data: userInfo
            }).then(function (answer) {
                console.log('Answer on POST /login:', answer);
                window.Babble.getMessages(window.Babble.counter, window.Babble.storeMessages);
                window.Babble.getStats(window.Babble.dummy);
                //window.setInterval(function () {
                //    window.Babble.getStats(window.Babble.dummy);
                //}, 6000);
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
        /*getMessages: function getMessages(counter, callback) {

            callback([]);
            var err = function (error) {
                console.log(error);
            };

            var ok = function (msgs) {
                console.log("Messages from server:", msgs);
                callback(msgs);
                poll(window.Babble);
            };

            poll(window.Babble).then(ok).catch(err);

            //poll(window.Babble, callback);
        },*/
        getMessages: function getMessages(counter, callback) {
            window.Babble.poll(counter, callback);
        },
        deleteMessage: function deleteMessage(id, callback) {
            request({
                method: 'DELETE',
                action: '/messages',
                data: id
            }).then(function (answer) {
                console.log('Answer on DELETE /messages:', answer);
                callback(true);
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
            window.Babble.messages = window.Babble.messages.concat(array);
            window.Babble.counter = window.Babble.messages.length;
            console.log("Messages on client:", window.Babble.messages);
        },
        showStats: function (stats) {

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
            return something;
        },
        exception: function exception(what) {
            console.error("[CRITICAL ERROR] Exception thrown: ", what);
        }
    };

    window.Babble.run(document, window, console);

})(this.window, this.document, this.console, this.localStorage, this.XMLHttpRequest, this.Promise, this.navigator);
