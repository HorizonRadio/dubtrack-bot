'use strict';

var clientId = process.env.TWITCH_CLIENT_ID;
var clientSecret = process.env.TWITCH_CLIENT_SECRET;
var redirectUri = process.env.TWITCH_REDIRECT_URL;
var scopes = ['user_subscriptions', 'user_read'];

var TwitchApi = require('twitch-api');

class TwitchManager extends TwitchApi {

    constructor() {
        super({
            clientId: clientId,
            clientSecret: clientSecret,
            redirectUri: redirectUri,
            scopes: scopes
        });
    }

    getStream(stream, callback) {
        this._executeRequest({
                method: 'GET',
                path: '/streams/' + stream
            },
            callback
        );
    }

}

module.exports = new TwitchManager();
