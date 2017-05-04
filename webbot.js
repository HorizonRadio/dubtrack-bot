'use strict';

require('./lib/utilsLoader');
// setup file reader
var read = require('fs').readFileSync;
// setup web server
var express = require('express'),
    http = require('http'),
    https = require('https');
var app = express();
var packageInfo = require('./package.json');

// Direct the peeps home
app.get('/', function (req, res) {
    res.redirect(packageInfo.repository ? packageInfo.homepage : 'data:text/plain, what are you doing?');
    res.end();
});

var httpServer = http.createServer(app);
httpServer.listen(80);
if (process.env.HTTPS_KEY && process.env.HTTPS_CERT && process.env.HTTPS_CA) {
    var httpsServer = https.createServer({
        key: read(process.env.HTTPS_KEY),
        cert: read(process.env.HTTPS_CERT),
        ca: [
            read(process.env.HTTPS_CA)
        ]
    }, app);
    httpsServer.listen(443);
}
