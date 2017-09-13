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

    var requests = [];
    var statsRequests = [];
    var stats = {
        current: {},
        previous: {}
    };
    // TODO
    // FIXME divide, neat
    var server = http.createServer(function (request, response) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");response.setHeader("Cache-Control", "max-age=86400");
        max-age=86400	
        var url = urlUtil.parse(request.url);
        var requestBody = '';
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
                if (messages.count() > data.counter) {
                    console.log('GET /messages answering: ', messages.getMessages(data.counter));
                    response.end(JSON.stringify(messages.getMessages(data.counter)));
                } else {
                    console.log('Pushed messages request to queue');
                    requests.push(response);
                }
            } else if (url.pathname.substr(0, 6) == '/stats') {
                console.log('GET /stats received');
                console.log('Pushed stats request to queue');
                statsRequests.push(response);
            } else {
                response.writeHead(400);
            }
        } else if (request.method === 'POST') {
            var user;
            if (url.pathname.substr(0, 9) == '/messages') {
                var id = 0;
                requestBody = '';
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });
                request.on('end', function () {
                    var msg = JSON.parse(requestBody);
                    id = messages.addMessage(msg);
                    console.log('POST /messages received', id);
                    while (requests.length > 0) {
                        var client = requests.pop();
                        client.end(JSON.stringify(msg));
                    }
                    while (statsRequests.length > 0) {
                        var statsreq = statsRequests.pop();
                        console.log('GET /stats answering: ', JSON.stringify(util.getStats()));
                        statsreq.end(JSON.stringify(util.getStats()));
                    }
                    response.end(JSON.stringify({
                        id: id.toString()
                    }));
                });
            } else if (url.pathname.substr(0, 6) == '/login') {
                requestBody = '';
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });
                request.on('end', function () {
                    user = JSON.parse(requestBody);
                    users.login(user);
                    while (statsRequests.length > 0) {
                        var statsreq = statsRequests.pop();
                        console.log('GET /stats answering: ', JSON.stringify(util.getStats()));
                        statsreq.end(JSON.stringify(util.getStats()));
                    }
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
                    while (statsRequests.length > 0) {
                        var statsreq = statsRequests.pop();
                        console.log('GET /stats answering: ', JSON.stringify(util.getStats()));
                        statsreq.end(JSON.stringify(util.getStats()));
                    }
                    response.end(JSON.stringify(user));
                });
            }
        } else if (request.method === 'DELETE') {
            if (url.pathname.substr(0, 9) == '/messages') {
                var strid = url.pathname.replace('/messages/', '');
                messages.deleteMessage(parseInt(strid));
                while (statsRequests.length > 0) {
                    var statsreq = statsRequests.pop();
                    console.log('GET /stats answering: ', JSON.stringify(util.getStats()));
                    statsreq.end(JSON.stringify(util.getStats()));
                }
                response.end(JSON.stringify(true));
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
