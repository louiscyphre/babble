(function (window, document, console) {

    'use strict';
    /* global XMLHttpRequest, Promise,localStorage */
    console.log('hello from client');

    window.Babble = {

        apiUrl: 'http://localhost:9000',
        storage: localStorage,
        request: function request(options) {
            /* jshint -W098 */
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();

                xhr.addEventListener('load', function (e) {
                    resolve(e.target.responseText);
                });

                if (options.method == 'GET') {
                    xhr.send();
                } else {
                    xhr.open(options.method, window.Babble.apiUrl + options.action);
                    xhr.setRequestHeader('Content-Type', 'text/plain');
                    xhr.send(JSON.stringify(options.data));
                }
            });
        },

        run: function (document) {

            window.Babble.storage.setItem('babble', JSON.stringify({
                currentMessage: '',
                userInfo: {
                    name: '',
                    email: ''
                }
            }));

            var newMessageForm = document.querySelector('.Chat-sendMessageForm');

            newMessageForm.addEventListener('submit', function (e) {
                e.preventDefault();
                window.Babble.request({
                    method: newMessageForm.method,
                    action: newMessageForm.action,
                    data: serialize(newMessageForm)
                }).then(function (result) {
                    console.log(result);
                });
            });

            var registerForm = document.querySelector('.Modal');

            registerForm.addEventListener('submit', function (e) {
                e.preventDefault();

                window.Babble.register(registerForm.elements)
                    .then(function (result) {
                        console.log(result);
                        //var userInfo = new FormData(registerForm);
                    });
            });


            function makeGrowable(container) {
                var area = container.querySelector('textarea');
                var clone = container.querySelector('span');
                area.addEventListener('input', function (e) {
                    clone.textContent = area.value;
                });
            }

            makeGrowable(document.querySelector('.js-growable'));
        },

        register: function register(formElements) {
            var userInfo = {
                name: formElements[0].value,
                email: formElements[1].value
            };
            window.Babble.storage.setItem('userInfo', JSON.stringify(userInfo));
            return window.Babble.request({
                method: 'POST',
                action: '/register',
                data: window.Babble.storage.userInfo
            });
        },

        postMessage: function postMessage(message, callback) {
            window.Babble.storage.setItem('babble', window.Babble.storage.currentMessage);
            return window.Babble.request({
                method: 'POST',
                action: '/message',
                data: window.Babble.storage.currentMessage
            });
        }
    };

    window.Babble.run(document);

})(this.window, this.document, this.console);
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

registerForm.addEventListener('submit', formCallback);*/
/*localStorage.setItem("babble", JSON.stringify({
    currentMessage: "",
    userInfo: {
        name: "",
        email: ""
    }
}));*/

/*
        function serialize(form) {
            var data = '';
            //console.log('enter serialize: ');

            for (var i = 0; i < form.elements.length; i++) {
                var element = form.elements[i];
                //console.log("form.elements[i]:", JSON.stringify(JSON.parse(form.elements[i])));
                if (element.name) {
                    data += element.name + '=' + encodeURIComponent(element.value) + '&';

                    //console.log('serialize: ', element.name);
                }
            }
            console.log('encoded data: ', data);
            return data;
        }
*/
/*function serialize(form) {
    console.log(new FormData(form));
    return new FormData(form);
}*/
