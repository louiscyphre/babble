(function (global) {
    'use strict';
    /* global require, console */
    /* jshint browser: true */
    var http = require('http');
    var urlUtil = require('url');
    var queryUtil = require('querystring');

    var constants = require('./constants');
    var messages = require('./messages-util');
    var utils = require('./server-util');
    var users = require('./users');
    var stats = require('./stats');

    setInterval(function () {
        var expirationTime = Date.now() - constants.HOLDING_REQUEST_TIMEOUT;
        utils.closeExpired(messages.requests, expirationTime);
        utils.closeExpired(stats.requests, expirationTime);
    }, constants.HOLDING_REQUEST_TIMEOUT);

    var server = http.createServer(function (request, response) {

        utils.setResponseHeaders(response);

        var url = urlUtil.parse(request.url);
<<<<<<< HEAD
        var requestBody = '';
        if (request.method === 'GET') {
            var data = queryUtil.parse(url.query);
            if (url.pathname.substr(0, 9) == '/messages') {
                if (!data.counter || isNaN(parseInt(data.counter))) {
                    response.writeHead(400);
                }
                if (messages.count() > data.counter) {
                    response.end(JSON.stringify(messages.getMessages(data.counter)));
                } else {
                    utils.pushResponseToStack(requests, response);
                }
            } else if (url.pathname.substr(0, 6) == '/stats') {
                utils.pushResponseToStack(stats.requests, response);
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
                    utils.closePendingRequests(requests, msg);
                    utils.closePendingRequests(stats.requests, stats.get());
=======
        var path = url.pathname.substr(0, 9);
        var requestType = request.method + ' ' + path;
>>>>>>> 4c2ce34b11587abcd2af91eade24cdc5f24b9773

        if (requestType === 'GET /messages') {
            var data = queryUtil.parse(url.query);
            utils.doGETmessages(url, data, response, messages);
        } else if (requestType === 'GET /stats') {
            utils.pushResponseToStack(stats.requests, response);
        } else if (requestType === 'POST /messages') {
            utils.doPOSTmessages(request, response, messages, stats);
        } else if (requestType === 'POST /login') {
            users.doAuth(users.login, request, response, stats);
        } else if (requestType === 'POST /logout') {
            users.doAuth(users.logout, request, response, stats);
        } else if (requestType === 'DELETE /messages') {
            utils.doDELETEmessages(url, response, messages, stats);
        } else if (request.method === 'OPTIONS') {
            utils.responseWith(response, constants.httpSuccessCodes.NO_CONTENT);
        } else {
            utils.responseWith(response, constants.httpErrorCodes.METHOD_NOT_ALLOWED);
        }
<<<<<<< HEAD
    });
    server.listen(9000);
}(this.window));
=======
    }).listen(constants.SERVER_PORT);
}(this.window));
>>>>>>> 4c2ce34b11587abcd2af91eade24cdc5f24b9773
