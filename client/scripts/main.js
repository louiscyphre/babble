(function (window, document, console, localStorage, XMLHttpRequest, Promise, navigator) {

    'use strict';

    function submitNewMessageForm(e) {
        e.preventDefault();

        var data = JSON.parse(Babble.storage.getItem('babble'));
        var textarea = document.querySelector('.Chat-msgFormText');

        var message = {
            name: data.userInfo.name,
            email: data.userInfo.email,
            message: textarea.value,
            timestamp: window.Date.now()
        };
        Babble.postMessage(message, Babble.dummy);
    }

    function submitRegisterForm(e) {
        e.preventDefault();

        Babble.register({
            name: e.target.elements[0].value,
            email: e.target.elements[1].value
        });
        e.target.classList.add('hidden');
        e.target.setAttribute('aria-hidden', 'true');
    }

    function deleteMessageFromServer(e) {
        e.preventDefault();
        var id = e.target.parentNode.parentNode.parentNode.id;
        console.log('deleteMessageFromServer():Message id is:', id);
        var message = document.getElementById(id);
        message.classList.add('hidden');
        message.setAttribute('aria-hidden', 'true');

        Babble.deleteMessage(id, Babble.dummy);
    }

    var Babble = {
        apiUrl: 'http://localhost:9000/',
        anonymousAvatar: 'images/anon.svg',
        deleteMessageImg: 'images/del_msg.svg',
        messages: [],
        messagesCounter: 0,
        stats: {
            users: 0,
            messages: 0
        },
        storage: localStorage,
        gravatar: '',

        run: function (document, window, console) {

            Babble.updateKeyInLocalStorage('allKeys', '');
            Babble.getStats(Babble.dummy);

            var msgForm = document.querySelector('.Chat-msgForm');
            msgForm.onsubmit = submitNewMessageForm;

            var modal = document.querySelector('.Modal');
            modal.onsubmit = submitRegisterForm;

            window.onbeforeunload = function () {
                var data = (JSON.parse(Babble.storage.getItem('babble'))).userInfo;
                Babble.request('POST', 'logout', data).then(function (answer) {
                    console.log('Answer on POST /logout:', answer);
                    Babble.updateKeyInLocalStorage('all', '');
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
                fullUrl = Babble.apiUrl + url + Babble.messagesCounter.toString();
            } else {
                fullUrl = Babble.apiUrl + url;
            }
            xhr.open('GET', fullUrl, true);
            xhr.setRequestHeader('Content-Type', 'text/plain');
            console.log('poll URL:', fullUrl);
            xhr.send();
        },

        register: function register(userInfo) {
            Babble.updateKeyInLocalStorage('userInfo', userInfo);
            Babble.request('POST', 'login', userInfo).then(function (ans) {
                Babble.gravatar = ans.gravatar;
                Babble.getMessages(Babble.messagesCounter, Babble.dummy);
            }).catch(function (err) {
                console.log(err);
            });
        },

        postMessage: function postMessage(message, callback) {
            callback({
                id: '42'
            });
            Babble.updateKeyInLocalStorage('currentMessage', message.message);
            Babble.request('POST', 'messages', message).then(function (ans) {})
                .catch(function (err) {
                    console.log(err);
                });
        },

        getMessages: function getMessages(counter, callback) {
            callback([]);
            Babble.poll('messages?counter=', Babble.storeMessages);
        },

        deleteMessage: function deleteMessage(id, callback) {
            if (callback) {
                callback(true);
            }
            var url = 'messages/' + id.toString();
            Babble.request('DELETE', url).then(function (ans) {
                Babble.decreaseCounter(ans);
            }).catch(function (err) {
                console.log(err);
            });
        },

        getStats: function getStats(callback) {
            callback({
                users: 5,
                messages: 20
            });
            Babble.poll('stats', Babble.updateStats);
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
                xhr.open(method, Babble.apiUrl + url, true);
                xhr.setRequestHeader('Content-Type', 'text/plain');
                console.log('request: URL:', Babble.apiUrl + url);
                if (method === 'POST') {
                    console.log('POSTing: ', JSON.stringify(data));
                    xhr.send(JSON.stringify(data));
                } else {
                    xhr.send();
                }
            });
        },

        storeMessages: function (array) {
            Babble.messages = Babble.messages.concat(array);
            Babble.messagesCounter = Babble.messages.length;
            Babble.appendToListView([].concat(array));
        },

        appendToListView: function (array) {
            var ol = document.querySelector('.Chat-msgs-list');
            for (var i = 0; i < array.length; ++i) {
                ol.appendChild(Babble.createMessageHTML(array[i]));
            }
        },

        decreaseCounter: function (serverAck) {
            if (serverAck) {
                --Babble.messagesCounter;
            }
        },

        dummy: function (any) {},

        createMessageHTML: function (msg) {
            var li = document.createElement('li');
            li.classList.add('Chat-msg');
            li.id = msg.timestamp;

            li.appendChild(Babble.createAvatarHTML(msg));
            li.appendChild(Babble.createArticleHTML(msg));

            return li;
        },

        createAvatarHTML: function (msg) {
            var img = document.createElement('img');
            img.classList.add('Chat-msg-avatar');
            if (msg.url !== 'none') {
                img.setAttribute('src', msg.url);
            } else {
                img.setAttribute('src', Babble.anonymousAvatar);
            }
            img.setAttribute('alt', '');
            return img;
        },

        createMessageTimeHTML: function (msg) {
            var date = new Date(parseInt(msg.timestamp));
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var formattedTime = hours + ':' + minutes.substr(-2);
            var time = document.createElement('time');
            time.setAttribute('datetime', date.toISOString());
            time.innerHTML = formattedTime;
            return time;
        },

        createHeaderHTML: function (msg) {
            var header = document.createElement('header');
            var cite = document.createElement('cite');
            cite.innerHTML = (msg.name === '') ? 'Anonymous' : msg.name;
            header.appendChild(cite);
            header.appendChild(Babble.createMessageTimeHTML(msg));
            if (Babble.gravatar === msg.url) {
                header.appendChild(Babble.createDeleteButtonHTML(msg));
            }
            return header;
        },

        createDeleteButtonHTML: function (msg) {
            var button = document.createElement('button');
            button.classList.add('Chat-msg-delete');
            button.setAttribute('type', 'submit');
            button.setAttribute('aria-label', 'Delete this message');
            button.onclick = deleteMessageFromServer;
            return button;
        },

        createParagraphHTML: function (msg) {
            var innerText = document.createTextNode(msg.message);
            var paragraph = document.createElement('p');
            paragraph.appendChild(innerText);
            return paragraph;
        },

        createArticleHTML: function (msg) {
            var article = document.createElement('article');
            article.classList.add('Chat-msg-text');

            article.appendChild(Babble.createHeaderHTML(msg));
            article.appendChild(Babble.createParagraphHTML(msg));

            return article;
        },

        updateStats: function (stats) {
            var msgsCount = document.querySelector('.msgsCount');
            msgsCount.textContent = stats.messages.toString();
            var usersCount = document.querySelector('.usersCount');
            usersCount.textContent = stats.users.toString();
        },

        updateKeyInLocalStorage: function (keyName, value) {
            if (keyName === 'allKeys') {
                Babble.storage.setItem('babble', JSON.stringify({
                    currentMessage: value,
                    userInfo: {
                        name: value,
                        email: value
                    }
                }));
                return;
            }
            var data = JSON.parse(Babble.storage.getItem('babble'));
            if (keyName === 'userInfo') {
                data.userInfo.name = value.name;
                data.userInfo.email = value.email;
                Babble.storage.setItem('babble', JSON.stringify(data));
                return;
            } else if (keyName === 'currentMessage') {
                data.currentMessage = value;
                Babble.storage.setItem('babble', JSON.stringify(data));
                return;
            }
        }
    };

    Babble.run(document, window, console);

})(this.window, this.document, this.console, this.localStorage, this.XMLHttpRequest, this.Promise, this.navigator);
