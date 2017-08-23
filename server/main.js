(function (global) {
    'use strict';
    /* global require, console */
    var http = require('http');
    var urlUtil = require('url');
    var queryUtil = require('querystring');

    var messages = require('./messages-util').messages;

    var server = http.createServer(function (request, response) {

        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers");
        var url = urlUtil.parse(request.url);
        if (request.method === 'GET') {

            var data = queryUtil.parse(url.query);
            console.log(url.query);

            if (!data.counter) {
                console.log("bad request is here");
                response.writeHead(400);
            }
            console.log('We are here');
            console.log(url.pathname);
            if (url.pathname === '/messages') {
                console.log('GET /messages received');
                var array = messages.getMessages(data.counter);
                if (data.counter === 0 || array.length > 0) {
                    console.log('GET /messages answering: ', JSON.stringify(array));
                    response.end(JSON.stringify(array));
                }
            }
            console.log('And here');

        } else if (request.method === 'POST') {
            if (url.pathname === '/messages') {
                console.log('POST /messages received');
                var requestBody = '';
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });

                request.on('end', function () {
                    data = JSON.parse(requestBody);
                    messages.addMessage(data);
                    //console.log('we have all the data ', data);
                });
                response.end('\[\]');
            }
        } else if (request.method === 'DELETE') {

        } else if (request.method === 'OPTIONS') {

            response.writeHead(204, {
                'Content-Type': 'text/json'
            });
            response.end();
        } else {
            console.log("Method not allowed: ", url.messages, url, request);
            response.writeHead(405);
            response.end();
        }
    });
    server.listen(9000);
    console.log("Server is on");
}(this.window));
