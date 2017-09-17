(function (window, document, console, localStorage, XMLHttpRequest, Promise, navigator) {

    'use strict';
    window.Babble = {
        counter: 0,
        apiUrl: 'http://localhost:9000/',
        messages: [],
        myMessagesIds: [],
        stats: {
            users: 0,
            messages: 0
        },
        storage: localStorage,

        poll: function poll(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 400) {
                    console.log('Poll response from server:', xhr.responseText);
                    if (xhr.responseText !== "") {
                        callback(JSON.parse(xhr.responseText));
                    }
                    poll(url, callback);
                } else {
                    console.log('Server error');
                }
            };
            xhr.onerror = function () {
                console.log('Network error');
            };
            var fullUrl;
            if (url === 'messages?counter=') {
                fullUrl = window.Babble.apiUrl + url + window.Babble.counter.toString();
            } else {
                fullUrl = window.Babble.apiUrl + url;
            }
            xhr.open('GET', fullUrl, true);
            xhr.setRequestHeader('Content-Type', 'text/plain');
            console.log('poll URL:', fullUrl);
            xhr.send();
        },
        register: function register(userInfo) {
            window.Babble.updateKey('userInfo', userInfo);
            window.Babble.request('POST', 'login', userInfo).then(function (answer) {
                window.Babble.getMessages(window.Babble.counter, window.Babble.storeMessages);
            }).catch(function (error) {
                console.log(error);
            });
        },

        postMessage: function postMessage(message, callback) {
            callback({
                id: '42'
            });
            window.Babble.updateKey('currentMessage', message.message);
            window.Babble.request('POST', 'messages', message).then(function (ans) {
                callback(ans);
            }).catch(function (err) {
                console.log(err);
            });
        },
        getMessages: function getMessages(counter, callback) {
            callback([]);
            //var url = 'messages?counter=' + counter.toString();
            //window.Babble.request('GET', url).then(function (ans) {
            //callback(ans);
            window.Babble.poll('messages?counter=', callback);
            //}).catch(function (err) {
            //    console.log(err);
            //});
        },
        deleteMessage: function deleteMessage(id, callback) {
            if (callback) {
                callback(true);
            }
            var url = 'messages/' + id.toString();
            window.Babble.request('DELETE', url).then(function (ans) {
                callback(ans);
            }).catch(function (err) {
                console.log(err);
            });
        },
        getStats: function getStats(callback) {
            callback({
                users: 5,
                messages: 20
            });
            //window.Babble.request('GET', 'stats').then(function (ans) {
            //    callback(ans);
            window.Babble.poll('stats', callback);
            // }).catch(function (err) {
            //    console.log(err);
            //});
        },
        request: function request(method, url, data) {
            return new Promise(function (resolve, reject) {

                var xhr = new XMLHttpRequest();

                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        console.log('Server error');
                        reject(JSON.parse(xhr.responseText));
                    }
                };
                xhr.onerror = function () {
                    console.log('Network error');
                };
                xhr.open(method, window.Babble.apiUrl + url, true);
                xhr.setRequestHeader('Content-Type', 'text/plain');
                console.log('request: URL:', window.Babble.apiUrl + url);
                if (method === 'POST') {
                    console.log('POSTing: ', JSON.stringify(data));
                    xhr.send(JSON.stringify(data));
                } else {
                    xhr.send();
                }
            });
        },
        storeMessages: function (array) {
            window.Babble.messages = window.Babble.messages.concat(array);
            window.Babble.counter = window.Babble.messages.length;
            console.log('Messages on client:', window.Babble.messages);
        },
        updateStats: function (stats) {

        },
        updateDeletedCounter: function (ans) {
            if (ans !== true) {
                return;
            }
            window.Babble.deletedCounter++;
        },
        storeId: function (id) {

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
            console.error('[CRITICAL ERROR] Exception thrown: ', what);
        },
        run: function (document, window, console) {
            var app = window.Babble;
            app.updateKey('all', '');
            app.getStats(app.updateStats);

            var newMessageForm = document.querySelector('.Chat-sendMessageForm');

            newMessageForm.addEventListener('submit', function (e) {
                e.preventDefault();

                var data = JSON.parse(app.storage.getItem('babble'));
                var textarea = document.querySelector('.Chat-sendMessageFormText');
                //var date = new Date();
                //var ts = String(date.getTime() + date.getTimezoneOffset() * 6000);
                var message = {
                    name: data.userInfo.name,
                    email: data.userInfo.email,
                    message: textarea.value,
                    timestamp: window.Date.now()
                };
                app.postMessage(message, app.storeId);
            });

            var registerForm = document.querySelector('.Modal');

            registerForm.addEventListener('submit', function (e) {
                e.preventDefault();

                app.register({
                    name: registerForm.elements[0].value,
                    email: registerForm.elements[1].value
                });
                registerForm.style.display = 'none';
                registerForm.style.visibility = 'hidden';
                registerForm.setAttribute('aria-hidden', 'true');
            });

            window.onbeforeunload = function () {
                var data = (JSON.parse(app.storage.getItem('babble'))).userInfo;
                app.request('POST', 'logout', data).then(function (answer) {
                    console.log('Answer on POST /logout:', answer);
                    app.updateKey('all', '');
                }).catch(function (error) {
                    console.log(error);
                });
            };
        }
    };

    window.Babble.run(document, window, console);

})(this.window, this.document, this.console, this.localStorage, this.XMLHttpRequest, this.Promise, this.navigator);
