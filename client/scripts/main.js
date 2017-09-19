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

        run: function (document, window, console) {

            window.Babble.updateKey('all', '');
            window.Babble.getStats(window.Babble.updateStats);

            var msgForm = document.querySelector('.Chat-msgForm');

            msgForm.addEventListener('submit', function (e) {
                e.preventDefault();

                var data = JSON.parse(window.Babble.storage.getItem('babble'));
                var textarea = document.querySelector('.Chat-msgFormText');
                //var date = new Date();
                //var ts = String(date.getTime() + date.getTimezoneOffset() * 6000);
                var message = {
                    name: data.userInfo.name,
                    email: data.userInfo.email,
                    message: textarea.value,
                    timestamp: window.Date.now()
                };
                window.Babble.postMessage(message, window.Babble.storeId);
            });

            var modal = document.querySelector('.Modal');

            modal.addEventListener('submit', function (e) {
                e.preventDefault();

                window.Babble.register({
                    name: modal.elements[0].value,
                    email: modal.elements[1].value
                });
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.setAttribute('aria-hidden', 'true');
            });

            window.onbeforeunload = function () {
                var data = (JSON.parse(window.Babble.storage.getItem('babble'))).userInfo;
                window.Babble.request('POST', 'logout', data).then(function (answer) {
                    console.log('Answer on POST /logout:', answer);
                    window.Babble.updateKey('all', '');
                }).catch(function (error) {
                    console.log(error);
                });
            };
        },
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
            window.Babble.poll('messages?counter=', callback);
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
            window.Babble.poll('stats', callback);
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
        createHTMLPost: function (chatMsgNode, msg) {
            var node = chatMsgNode.cloneNode(true);
            if (msg.url !== 'none') {
                node.firstChild.setAttribute('src', msg.url);
            }
            var article = node.firstChild.nextSibling;
            var cite = article.firstChild.firstChild;
            cite.innerHTML = (msg.name === '') ? 'Anonymous' : msg.name;
            var date = new Date(parseInt(msg.timestamp) * 1000);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var formattedTime = hours + ':' + minutes.substr(-2);
            var time = cite.nextSibling;
            time.setAttribute('datetime', date.toISOString());
            time.innerHTML = formattedTime;
            var innerText = document.createTextNode(msg.message);
            var message = article.firstChild.nextSibling;
            message.innerHTML = innerText;
            return node;
        },
        updateStats: function (stats) {

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
        }
    };

    window.Babble.run(document, window, console);

})(this.window, this.document, this.console, this.localStorage, this.XMLHttpRequest, this.Promise, this.navigator);
