(function (global) {
    'use strict';
    /* global require, console */
    /* jshint browser: true */
    var http = require('http');
    var urlUtil = require('url');
    var queryUtil = require('querystring');

    var messages = require('./messages-util');
    var utils = require('./server-util');
    var users = require('./users');
    var stats = require('./stats');

    var requests = [];

    setInterval(function () {
        var expirationTime = Date.now() - 180000;
        utils.closeExpired(requests, expirationTime);
        utils.closeExpired(stats.requests, expirationTime);
    }, 180000);
    // TODO
    // FIXME divide, neat
    var server = http.createServer(function (request, response) {
        utils.setResponseHeaders(response);
        var url = urlUtil.parse(request.url);
        var requestBody = '';
        var path = url.pathname.substr(0, 9);
        if (request.method === 'GET') {
            var data = queryUtil.parse(url.query);
            if (path == '/messages') {
                var seenCounter = parseInt(data.counter);
                if (!data.counter || isNaN(seenCounter)) {
                    response.writeHead(400);
                }
                if (messages.count() > seenCounter) {
                    response.end(JSON.stringify(messages.getMessages(seenCounter)));
                } else {
                    utils.pushResponseToStack(requests, response);
                }
            } else if (path == '/stats') {
                utils.pushResponseToStack(stats.requests, response);
            } else {
                response.writeHead(400);
            }
        } else if (request.method === 'POST') {
            var user;
            if (path == '/messages') {
                var id = 0;
                requestBody = '';
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });
                request.on('end', function () {
                    var msg = JSON.parse(requestBody);
                    id = messages.addMessage(msg);
                    utils.closePendingRequests(requests, msg);
                    utils.closePendingRequests(stats.requests, stats.get());

                    response.end(JSON.stringify({
                        id: id.toString()
                    }));
                });
            } else if (path == '/login') {
                users.doAuth(users.login, request, response, stats);
            } else if (path == '/logout') {
                users.doAuth(users.logout, request, response, stats);
            }
        } else if (request.method === 'DELETE' &&
            path == '/messages') {
            var strid = url.pathname.replace('/messages/', '');
            messages.deleteMessage(strid);
            utils.closePendingRequests(stats.requests, stats.get());
            response.end(JSON.stringify(true));
        } else if (request.method === 'OPTIONS') {
            response.writeHead(204, {
                'Content-Type': 'text/plain'
            });
            response.end();
        } else {
            response.writeHead(405);
            response.end();
        }
    });
    server.listen(9000);
}(this.window));
