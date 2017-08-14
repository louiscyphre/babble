/* jshint -W097 */
'use strict';
/* global require, console, document, XMLHttpRequest, FormData, Promise,localStorage */
console.log('hello from client');

var Babble = {

    apiUrl: 'http://localhost:9000',

    request: function request(options) {
        /* jshint -W098 */
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(options.method, Babble.apiUrl + options.action);
            xhr.addEventListener('load', function (e) {
                resolve(e.target.responseText);
            });
            xhr.send(JSON.stringify(options.data));
        });
    },

    run: function (document) {

        var newMessageForm = document.querySelector('.Chat-sendMessageForm');

        newMessageForm.addEventListener('submit', function (e) {
            e.preventDefault();
            Babble.request({
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
            var userInfo = {
                currentMessage: "",
                name: registerForm.elements[0].value,
                email: registerForm.elements[1].value
            };
            localStorage.setItem("babble", JSON.stringify(userInfo));
            Babble.register(serialize(registerForm))
                .then(function (result) {
                    console.log(result);
                    //var userInfo = new FormData(registerForm);
                });
        });

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

        /*function serialize(form) {
            console.log(new FormData(form));
            return new FormData(form);
        }*/

        makeGrowable(document.querySelector('.js-growable'));

        function makeGrowable(container) {
            var area = container.querySelector('textarea');
            var clone = container.querySelector('span');
            area.addEventListener('input', function (e) {
                clone.textContent = area.value;
            });
        }
    },

    register: function register(props) {
        return Babble.request({
            method: "POST",
            action: "/register",
            data: props
        });
    },

    postMessage: function postMessage(message, callback) {
        return Babble.request(message);
    }
};

Babble.run(document);

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
