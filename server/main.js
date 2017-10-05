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

    var requests = [];

    setInterval(function () {
        var expirationTime = Date.now() - constants.HOLDING_REQUEST_TIMEOUT;
        utils.closeExpired(requests, expirationTime);
        utils.closeExpired(stats.requests, expirationTime);
    }, constants.HOLDING_REQUEST_TIMEOUT);
    // TODO
    // FIXME divide, neat
    var server = http.createServer(function (request, response) {

        utils.setResponseHeaders(response);

        var url = urlUtil.parse(request.url);
        var requestType = request.method + ' ' + url.pathname.substr(0, 9);

        if (requestType === 'GET /messages') {
            var data = queryUtil.parse(url.query);
            var seenCounter = parseInt(data.counter);
            if (!data.counter || isNaN(seenCounter)) {
                response.writeHead(constants.httpErrorCodes.BAD_REQUEST);
            }
            if (messages.count() > seenCounter) {
                response.end(JSON.stringify(messages.getMessages(seenCounter)));
            } else {
                utils.pushResponseToStack(requests, response);
            }
        } else if (requestType === 'GET /stats') {
            utils.pushResponseToStack(stats.requests, response);
        } else if (requestType === 'POST /messages') {
            var id = 0;
            var requestBody = '';
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
        } else if (requestType === 'POST /login') {
            users.doAuth(users.login, request, response, stats);
        } else if (requestType === 'POST /logout') {
            users.doAuth(users.logout, request, response, stats);
        } else if (requestType === 'DELETE /messages') {
            var strid = url.pathname.replace('/messages/', '');
            messages.deleteMessage(strid);
            utils.closePendingRequests(stats.requests, stats.get());
            response.end(JSON.stringify(true));
        } else if (request.method === 'OPTIONS') {
            response.writeHead(constants.httpSuccessCodes.NO_CONTENT, {
                'Content-Type': 'text/plain'
            });
            response.end();
        } else { //FIXME to add handle errors here
            response.writeHead(constants.httpErrorCodes.METHOD_NOT_ALLOWED);
            response.end();
        }
    }).listen(constants.SERVER_PORT);
}(this.window));
