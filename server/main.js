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
        var path = url.pathname.substr(0, 9);
        var requestType = request.method + ' ' + path;

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
    }).listen(constants.SERVER_PORT);
}(this.window));
