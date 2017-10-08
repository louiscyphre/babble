(function (window, document, console, localStorage, XMLHttpRequest, Promise, navigator) {

    'use strict';

    function submitNewMessageForm(e) {
        e.preventDefault();

        var data = JSON.parse(window.Babble.storage.getItem('babble'));
        var textarea = document.querySelector('.Chat-msgFormText');

        var message = {
            name: data.userInfo.name,
            email: data.userInfo.email,
            message: textarea.value,
            timestamp: window.Date.now()
        };
        textarea.value = "";
        window.Babble.postMessage(message, window.Babble.saveLastMessage);
    }

    function submitRegisterForm(e) {
        e.preventDefault();

        window.Babble.register({
            name: e.target.elements[0].value,
            email: e.target.elements[1].value
        });
        e.target.classList.add('hidden');
        e.target.setAttribute('aria-hidden', 'true');
        var pre = document.querySelector('.Shadowmaker');
        pre.classList.add('hidden');
        pre.setAttribute('aria-hidden', 'true');
    }

    window.Babble = {
        apiServerUrl: 'http://localhost:9000',
        anonymousAvatar: 'images/anon.svg',
        deleteMessageImg: 'images/del_msg.svg',
        messages: undefined,
        storage: localStorage,
        gravatar: '',

        run: function (document, window, console) {

            window.Babble.updateKeyInLocalStorage('allKeys', '');

            var msgForm = document.querySelector('.Chat-msgForm');
            msgForm.onsubmit = submitNewMessageForm;

            var modal = document.querySelector('.Modal');
            modal.onsubmit = submitRegisterForm;

            window.onbeforeunload = function () {
                var data = (JSON.parse(window.Babble.storage.getItem('babble'))).userInfo;
                window.Babble.request('POST', '/logout', data).then(function (answer) {
                    window.Babble.updateKeyInLocalStorage('all', ''); // FIXME Last message: to see or not to see?
                }).catch(function (error) {
                    console.log(error);
                });
            };
        },

        request: function request(method, requestPath, data) {
            return new Promise(function (resolve, reject) {

                var xhr = new XMLHttpRequest();
                //xhr.addEventListener("load", callback);
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        //console.log('Server answered with:', xhr.responseText);
                        resolve(xhr.responseText);
                    } else {
                        reject(xhr.responseText);
                    }
                };
                xhr.onerror = function () {
                    console.log('Network error');
                };
                var fullUrl;
                if (requestPath === '/messages?counter=') {
                    var counter = window.Babble.messages.length.toString();
                    fullUrl = window.Babble.apiServerUrl + requestPath + counter;
                } else {
                    fullUrl = window.Babble.apiServerUrl + requestPath;
                }
                xhr.open(method, fullUrl, true);
                xhr.setRequestHeader('Content-Type', 'text/plain');
                console.log('request: URL: ', method + ' ' + fullUrl);
                if (method === 'POST') {
                    console.log('POSTing: ', JSON.stringify(data));
                    xhr.send(JSON.stringify(data));
                } else {
                    xhr.send();
                }
            });
        },

        poll: function poll(url, callback) {
            window.Babble.request('GET', url).then(function (ans) {
                if (ans !== "") { //console.log('server answer: ', ans);
                    callback(JSON.parse(ans));
                }
                poll(url, callback);
            }).catch(function (err) {
                console.log('Error from server: ', err);
            });
        },

        register: function register(userInfo) {
            window.Babble.updateKeyInLocalStorage('userInfo', userInfo);
            window.Babble.getStats(window.Babble.updateStats);
            window.Babble.request('POST', '/login', userInfo).then(function (ans) {
                window.Babble.gravatar = (JSON.parse(ans)).gravatar;
                window.Babble.getMessages(0, window.Babble.initMessagesArray);
            }).catch(function (err) {
                console.log(err);
            });
        },

        postMessage: function postMessage(message, callback) {
            callback(message);
            window.Babble.request('POST', '/messages', message).catch(function (err) {
                console.log(err);
            });
        },

        getMessages: function getMessages(counter, callback) {
            callback([]);
            window.Babble.poll('/messages?counter=', window.Babble.storeMessages);
        },

        deleteMessage: function deleteMessage(id, callback) {
            window.Babble.request('DELETE', '/messages/' + id)
                .then(function (ans) {
                    callback(JSON.parse(ans), id);
                }).catch(function (err) {
                    console.log(err);
                });
        },

        getStats: function getStats(callback) {
            window.Babble.poll('/stats', callback);
        },

        storeMessages: function (array) {
            window.Babble.messages = window.Babble.messages.concat(array);
            window.Babble.appendToListView([].concat(array));
        },

        appendToListView: function (array) {
            var ol = document.querySelector('.Chat-msgs-list');
            for (var i = 0; i < array.length; ++i) {
                ol.appendChild(window.Babble.createMessageHTML(array[i]));
            }
        },

        deleteMessageFromClient: function (serverAck, id) {
            //console.log('Deleting from client: message serverAck, id:', serverAck, id);
            if (!serverAck || !id) {
                return;
            }
            //console.log('Deleting from client: message id:', id);
            for (var i = window.Babble.messages.length - 1; i >= 0; --i) {
                if (id === window.Babble.messages[i].timestamp) {
                    //console.log('Splicing:', i);
                    window.Babble.messages.splice(i, 1);
                }
            }
            window.Babble.deleteMessageHTML(id);
        },

        deleteMessageHTML: function (id) {
            var ol = document.querySelector('.Chat-msgs-list');
            ol.removeChild(document.getElementById(id));
        },

        createMessageHTML: function (msg) {
            var li = document.createElement('li');
            li.classList.add('Chat-msg');
            li.setAttribute('tabindex', '-1');
            li.id = msg.timestamp;

            li.appendChild(window.Babble.createAvatarHTML(msg));
            li.appendChild(window.Babble.createArticleHTML(msg));

            return li;
        },

        createAvatarHTML: function (msg) {
            var img = document.createElement('img');
            img.classList.add('Chat-msg-avatar');
            if (msg.url !== 'none') {
                img.setAttribute('src', msg.url);
            } else {
                img.setAttribute('src', window.Babble.anonymousAvatar);
            }
            img.setAttribute('alt', '');
            img.setAttribute('tabindex', '-1');
            return img;
        },

        createMessageTimeHTML: function (msg) {
            var date = new Date(parseInt(msg.timestamp));
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var formattedTime = hours + ':' + minutes.substr(-2);
            var time = document.createElement('time');
            time.setAttribute('tabindex', '0');
            time.setAttribute('aria-label', 'Posted at:');
            time.setAttribute('datetime', date.toISOString());
            time.innerHTML = formattedTime;
            return time;
        },

        createHeaderHTML: function (msg) {
            var header = document.createElement('header');
            header.setAttribute('tabindex', '-1');
            var cite = document.createElement('cite');
            cite.setAttribute('tabindex', '0');
            cite.setAttribute('aria-label', 'Posted by:');
            cite.innerHTML = (msg.name === '') ? 'Anonymous' : msg.name;
            header.appendChild(cite);
            header.appendChild(window.Babble.createMessageTimeHTML(msg));
            if (window.Babble.gravatar === msg.url) {
                header.appendChild(window.Babble.createDeleteButtonHTML(msg));
            }
            return header;
        },

        createDeleteButtonHTML: function (msg) {
            var button = document.createElement('button');
            button.classList.add('Chat-msg-delete');
            button.setAttribute('type', 'submit');
            button.setAttribute('tabindex', '0');
            button.setAttribute('aria-label', 'Delete this message');
            button.onclick = function (e) {
                window.Babble.deleteMessage(msg.timestamp, window.Babble.deleteMessageFromClient);
            };
            return button;
        },

        createParagraphHTML: function (msg) {
            var innerText = document.createTextNode(msg.message);
            var paragraph = document.createElement('p');
            paragraph.setAttribute('tabindex', '0');
            paragraph.appendChild(innerText);
            return paragraph;
        },

        createArticleHTML: function (msg) {
            var article = document.createElement('article');
            article.classList.add('Chat-msg-text');
            if (window.Babble.gravatar === msg.url) {
                article.classList.add('Chat-msg-text--own');
            }
            article.setAttribute('tabindex', '-1');

            article.appendChild(window.Babble.createHeaderHTML(msg));
            article.appendChild(window.Babble.createParagraphHTML(msg));

            return article;
        },

        initMessagesArray: function (array) {
            window.Babble.messages = array;
        },

        updateStats: function (stats) {
            var msgsCount = document.querySelector('.msgsCount');
            msgsCount.textContent = stats.messages.toString();
            var usersCount = document.querySelector('.usersCount');
            usersCount.textContent = stats.users.toString();
        },

        saveLastMessage: function (message) {
            window.Babble.updateKeyInLocalStorage('currentMessage', message.message);
        },

        updateKeyInLocalStorage: function (keyName, value) {
            if (keyName === 'allKeys') {
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
            } else if (keyName === 'currentMessage') {
                data.currentMessage = value;
                window.Babble.storage.setItem('babble', JSON.stringify(data));
            }
        }
    };

    window.Babble.run(document, window, console);

})(this.window, this.document, this.console, this.localStorage, this.XMLHttpRequest, this.Promise, this.navigator);
