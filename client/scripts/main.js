(function (global) {

    /*  'use strict';
       global require, console, document,XMLHttpRequest 
      console.log('hello from client');
      var form = document.getElementsByClassName('Chat-sendMessageForm');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        console.log(form.action);
        var data = '';
        for (var element in form.elements) {
          if (element.name) {
            data += element.name + '=' + encodeURIComponent(element.value) + '&';
          }
        }
        var xhr = new XMLHttpRequest();
        xhr.open(form.method, form.action);
        if (form.method === 'POST') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhr.addEventListener('load', function (e) {
          console.log(e.target.responseText);
        });
        xhr.send(data);
      });*/

    'use strict';
    /* global require, console, document, XMLHttpRequest, Promise */
    console.log('hello from client');

    var form = document.querySelector('form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        request({
            method: form.method,
            action: form.action,
            data: serialize(form)
        }).then(function (result) {
            console.log(result);
        });
    });

    function serialize(form) {
        return form.elements.reduce(function (data, element) {
            if (element.name) {
                data += element.name + '=' + encodeURIComponent(element.value) + '&';
            }
            return data;
        }, '');
    }

    function request(options) {
        /* jshint -W098 */
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(options.method, options.action);
            if (options.method === 'post') {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            xhr.addEventListener('load', function (e) {
                resolve(e.target.responseText);
            });
            xhr.send(options.data);
        });
    }

    makeGrowable(document.querySelector('.js-growable'));

    function makeGrowable(container) {
        var area = container.querySelector('textarea');
        var clone = container.querySelector('span');
        area.addEventListener('input', function (e) {
            clone.textContent = area.value;
        });
    }

}(this.window));
