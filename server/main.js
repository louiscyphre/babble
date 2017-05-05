(function (global) {

  'use strict';
  /* global require, console */
  var http = require("http");
  var server = http.createServer(function (request, response) {
    console.log(request.url);
    if (request.url === '/login') {
      console.log("Logged in");
      response.end(request.method);
    }
  });
  server.listen(8000);
  console.log("Cou cou");
  // TODO install nodemon
}(this.window));
