(function (global) {
    'use strict';
    /* global require, console */
    var http = require('http');
    var urlUtil = require('url');
    var queryUtil = require('querystring');

    var messages = require('./messages-util').messages;

    var server = http.createServer(function (request, response) {

        response.setHeader('Access-Control-Allow-Origin', '*');

        var url = urlUtil.parse(request.url);
        if (request.method === 'GET') {

            var data = queryUtil.parse(url.query);
            console.log(url.query);

            if (!data.counter) {
                console.log("bad request is here");
                response.writeHead(400);
            }
            var array = messages.getMessages(data.counter);
            response.end(JSON.stringify(array));

        } else if (request.method === 'POST') {
            if (url.path === '/messages') {
                var message = getPostData(request);
                messages.addMessage(message);
            }
        } else if (request.method === 'OPTIONS') {

            response.writeHead(204, {
                'Content-Type': 'text/json'
            });
            response.end();
        } else {
            console.log("Methoid not allowed: ", url.messages, url, request);
            response.writeHead(405);
            response.end();
        }
        var getPostData = function getPostData(request) {

            var requestBody = '',
                data = {};
            request.on('data', function (chunk) {
                requestBody += chunk;
            });

            request.on('end', function () {
                data = JSON.parse(requestBody);
                //console.log('we have all the data ', data);
                console.log('we have all the data ', JSON.stringify(data));
                response.end('thank you');
            });
            return data;
        };
    });
    server.listen(9000);
    console.log("Server is on");
}(this.window));
