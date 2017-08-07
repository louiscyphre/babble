(function (global) {

  'use strict';
  /* global require, console */
  var http = require('http');
  var urlUtil = require('url');
  var queryUtil = require('querystring');
  var server = http.createServer(function (request, response) {

    response.setHeader('Access-Control-Allow-Origin', '*');

    if (request.method === 'GET') {

      var url = urlUtil.parse(request.url);
      var data = queryUtil.parse(url.query);
      console.log(data.message);

      if (!data.message) {
        response.writeHead(400);
      }
      response.end();

    } else if (request.method === 'POST') {

      var requestBody = 'dfadfasd';

      request.on('data', function (chunk) {
        requestBody += chunk;
      });

      request.on('end', function () {
        var data = queryUtil.parse(requestBody);
        console.log('we have all the data ', data.message);
        response.end('thank you');
      });

    } else {
      response.writeHead(405);
      response.end();
    }
  });
  server.listen(8000);
  console.log("Cou cou ca vah");


}(this.window));
