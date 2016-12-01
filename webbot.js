'use strict';

require('./lib/utilsLoader');
// setup file reader
var read = require('fs').readFileSync;
// setup web server
var express = require('express'),
    http = require('http'),
    https = require('https');
var app = express();
// crypto
var crypto = require('crypto');
// Twitch and redis mans
var twitchManager = require('./lib/twitchManager.js');
var redisManager = require('./lib/redisManager.js');

// Direct the peeps home
app.get('/', function (req, res) {
    res.redirect('https://github.com/nightbloo/nb3bot');
    res.end();
});
// Handle the twitch stuff
app.get('/auth/twitch/', function (req, res) {
    var send = '';
    if (req.query.code && req.query.scope) {
        var code = req.query.code;
        twitchManager.getAccessToken(code, function (err, body) {
            if (err) {
                console.error(err);
                send += 'getAccessToken\n';
                res.send(send + ' ' + err.status + ':' + err.error + ': ' + err.message);
                return;
            }
            var accessToken = body.access_token;
            twitchManager.getAuthenticatedUser(accessToken, function (err, body) {
                if (err) {
                    console.error(err);
                    send += 'getThisUser\n';
                    res.send(send + ' ' + err.status + ':' + err.error + ': ' + err.message);
                    return;
                }
                if (body) {
                    // ok we know that they have token and a name
                    var user = body.display_name;
                    var key = crypto.createHash('md5').update(user).update(process.env.HASH_SALT).digest('hex');
                    redisManager.getTwitchAuthKey(key, function (result) {
                        // see if we need to save this key.
                        if (!result) {
                            redisManager.setTwitchAuthKey(key, user);
                        }
                        // See if they are a sub
                        twitchManager.getChannelSubscriptionOfUser(user, 'Nightblue3', accessToken, function (err, body) {
                            send += 'Use "!twitchlink ' + key + '" in the dubtrack chat to get link your dubtrack to your twitch.\n';
                            if (err && err.status == 404) {
                                send += "You are not a twitch sub!";
                            }
                            else if (err) {
                                console.error(err);
                                send += 'getChannelSubscriptionOfUser\n';
                                res.send(send + ' ' + err.status + ':' + err.error + ': ' + err.message);
                                return;
                            }
                            if (body) {
                                send += 'Your a Twitch sub! When you use the !twitchlink command it will make any needed change.\n';
                                send += 'Just note if you have a staff role as it is it will not change your role.\n';
                                redisManager.setTwitchSub(user, true);
                            }
                            res.send(send);
                        });
                    });
                }
                else {
                    // Error?
                }
            });
        });
    }
    else {
        res.redirect(twitchManager.getAuthorizationUrl());
    }
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
