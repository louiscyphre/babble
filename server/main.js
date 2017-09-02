(function (global) {
    'use strict';
    /* global require, console */
    var http = require('http');
    var urlUtil = require('url');
    var queryUtil = require('querystring');
    var md5 = require('./crypto-util').md5hash;

    var messages = require('./messages-util');
    var users = require('./users');

    // TODO
    // FIXME divide, neat

    var server = http.createServer(function (request, response) {

        var requests = [];
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        var url = urlUtil.parse(request.url);
        if (request.method === 'GET') {

            var data = queryUtil.parse(url.query);
            console.log(url.query);
            if (!data.counter) {
                console.log("bad request is here");
                response.writeHead(400);
            }
            //console.log('We are here');
            //console.log(url.pathname);
            if (url.pathname.substr(0, 9) == '/messages') {
                console.log('GET /messages received', data.counter);
                if (messages.getMessages(0).length > data.counter) {
                    console.log('GET /messages answering: ', messages.getMessages(data.counter));
                    response.end(JSON.stringify(messages.getMessages(data.counter)));
                } else {
                    requests.push(response);
                }
            }
            if (url.pathname.substr(0, 6) == '/stats') {
                console.log('GET /stats received');
                console.log('GET /stats answering: ', messages.getMessages(data.counter).len);
                response.end(JSON.stringify(messages.getMessages(data.counter)));
                requests.push(response);

            }
            //console.log('And here');

        } else if (request.method === 'POST') {

            var requestBody = '';
            var user;
            if (url.pathname.substr(0, 9) == '/messages') {
                var id = 0;
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });
                request.on('end', function () {
                    var msg = JSON.parse(requestBody);
                    id = messages.addMessage(msg);
                    while (requests.length > 0) {
                        var client = requests.pop();
                        client.end(JSON.stringify(msg));
                    }
                    response.end(JSON.stringify({
                        id: id.toString()
                    }));
                });

                console.log('POST /messages received', id);

            } else if (url.pathname.substr(0, 6) == '/login') {
                requestBody = '';
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });
                request.on('end', function () {
                    user = JSON.parse(requestBody);
                    users.login(user);
                    response.end(JSON.stringify(user));
                });
            } else if (url.pathname.substr(0, 7) == '/logout') {
                requestBody = '';
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });
                request.on('end', function () {
                    user = JSON.parse(requestBody);
                    users.logout(user);
                    response.end(JSON.stringify(user));
                });
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
