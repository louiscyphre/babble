(function (global) {

  'use strict';
  /* global require, console, document,XMLHttpRequest */
  console.log('hello from client');
  var form = document.querySelector('form');

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
  });
}(this.window));
