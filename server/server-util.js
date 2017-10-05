(function (global, module, factory) {
    'use strict';
    /* global module, require, console */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.utils = factory();
    }
}(this, module, function () {
    var constants = require('./constants');

    var utils = {

        closeExpired: function closeExpired(requests, expirationTime) {
            if (requests.length === 0) {
                return;
            }
            for (var i = requests.length - 1; i >= 0; i--) {
                if (requests[i].timestamp >= expirationTime) {
                    requests[i].response.end("");
                    //console.log('[INFO] closeExpired(requests, timeout): closing request with timestamp:', requests[i].timestamp);
                    requests.splice(i, 1);
                }
            }
        },

        closePendingRequests: function closePendingRequests(requests, msg) {
            while (requests.length > 0) {
                var request = requests.pop();
                //console.log('[INFO] closePendingRequests(): ', JSON.stringify(msg));
                request.response.end(JSON.stringify(msg));
            }
        },

        setResponseHeaders: function setResponseHeaders(response) {
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
            response.setHeader('Cache-Control', 'max-age=0, public');
            response.setHeader('Content-Type', 'text/plain');
        },

        pushResponseToStack: function pushResponseToStack(requests, response) {
            var resp = {
                response: response,
                timestamp: Date.now()
            };
            requests.push(resp);
        },

        responseWith: function responseWith(response, httpCode) {
            response.writeHead(httpCode);
            response.end();
        },

        doGETmessages: function doGETmessages(url, data, response, messages) {

            var seenCounter = parseInt(data.counter);
            if (!data.counter || isNaN(seenCounter)) {
                utils.responseWith(response, constants.httpErrorCodes.BAD_REQUEST);
            }
            if (messages.count() > seenCounter) {
                response.end(JSON.stringify(messages.getMessages(seenCounter)));
            } else {
                utils.pushResponseToStack(messages.requests, response);
            }
        },

        doPOSTmessages: function (request, response, messages, stats) {

            var requestBody = '';
            request.on('data', function (chunk) {
                requestBody += chunk;
            });
            request.on('end', function () {
                var msg = JSON.parse(requestBody);
                var id = messages.addMessage(msg);
                utils.closePendingRequests(messages.requests, msg);
                utils.closePendingRequests(stats.requests, stats.get());

                response.end(JSON.stringify({
                    id: id.toString()
                }));
            });
        },

        doDELETEmessages: function (url, response, messages, stats) {

            var strid = url.pathname.replace('/messages/', '');
            messages.deleteMessage(strid);
            utils.closePendingRequests(stats.requests, stats.get());
            response.end(JSON.stringify(true));
        }
    };
    return utils;
}));
