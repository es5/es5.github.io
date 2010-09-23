#!/usr/bin/env node
// Simple node-static Web server for use in local testing.
// It serves files from this directory over HTTP on localhost port
// 8080, and tells clients to not cache anything (we don't want
// UAs caching files while we are still making changes to them and
// testing those changes...)
//
// To run it, just do, e.g.:
//
//     nohup node server.js &

var static = require('node-static');
var fileServer = new static.Server(".",{ cache: 0 });
require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    fileServer.serve(request, response);
  });
}).listen(8080);
