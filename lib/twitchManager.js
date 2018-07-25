'use strict'

const clientId = process.env.TWITCH_CLIENT_ID
const clientSecret = process.env.TWITCH_CLIENT_SECRET

const TwitchHelix = require('twitch-helix')


class TwitchManager extends TwitchHelix {
    constructor() {
        super({
            clientId: clientId,
            clientSecret: clientSecret
        })
    }

    async getGame(game_id) {
        const games = await this.sendHelixRequest('/games', {
            requestOptions: {
                qs: {
                    id: game_id
                }
            }
        })

        return games[ 0 ] || null
    }
}

module.exports = new TwitchManager()
