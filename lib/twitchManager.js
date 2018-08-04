'use strict';

var clientId = process.env.TWITCH_CLIENT_ID;
var clientSecret = process.env.TWITCH_CLIENT_SECRET;

var TwitchApi = require('twitch-api');

class TwitchManager extends TwitchApi {

    constructor() {
        super({
            clientId: clientId,
            clientSecret: clientSecret
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
