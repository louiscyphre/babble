(function (global) {
    'use strict';
    /* global require, console */
    var http = require('http');
    var urlUtil = require('url');
    var queryUtil = require('querystring');
    var md5 = require('./crypto-util').md5hash;

    var messages = require('./messages-util');
    var users = require('./users');
    var util = require('./utilities');

    // TODO
    // FIXME divide, neat

    var server = http.createServer(function (request, response) {

        var requests = [];
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        var url = urlUtil.parse(request.url);
        if (request.method === 'GET') {

            console.log("Request url was:", url.query);
            var data = queryUtil.parse(url.query);
            if (url.pathname.substr(0, 9) == '/messages') {
                console.log("Query was:", url.query);
                if (!data.counter || isNaN(parseInt(data.counter))) {
                    if (!Number.isInteger(data.counter)) {
                        console.log("counter is not integer:", data.counter);
                    }
                    console.log("bad request is here");
                    response.writeHead(400);
                }
                console.log('GET /messages received', data.counter);
                if (messages.count() > data.counter) { // || parseInt(data.counter) === 0) {
                    console.log('GET /messages answering: ', messages.getMessages(data.counter));
                    response.end(JSON.stringify(messages.getMessages(data.counter)));
                } else {
                    console.log('Pushed on request to queue');
                    requests.push(response);
                }
            } else if (url.pathname.substr(0, 6) == '/stats') {
                console.log('GET /stats received');
                console.log('GET /stats answering: ', JSON.stringify(util.getStats()));
                response.end(JSON.stringify(util.getStats()));
            } else {
                response.writeHead(400);
            }
        } else if (request.method === 'POST') {
            console.log('request: ', request);
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
            if (url.pathname.substr(0, 9) == '/messages') {
                response.end();
            }
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
}(this.window));
