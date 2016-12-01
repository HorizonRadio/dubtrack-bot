'use strict';

var pmx = require('pmx');
var fs = require('fs');

/**
 * @param {DubAPI} bot
 * */
function keymetrics(bot, redisManager) {
    var probe = pmx.probe();
    pmx.action('send:Chat', function (param, reply) {
        if (!param || param.length === 0) {
            return reply('[X] Param not specified.');
        }
        bot.sendChat(param);
        reply('Message "' + param + '" sent!');
    });
    pmx.action('reset:RouletteCooldown', function (reply) {
        redisManager.setLastRouletteTimestamp(true);
        reply('Roulette Cooldown reseted!');
    });
    probe.metric({
        name: 'Realtime users',
        value: function () {
            return bot.getUsers().length;
        }
    });
    var chatMin = probe.counter({
        name: 'chat/min'
    });
    bot.on(bot.events.chatMessage, function (data) {
        chatMin.inc();
        setTimeout(function () {
            chatMin.dec();
        }, 60000);
    });
}

exports.keymetrics = keymetrics;
