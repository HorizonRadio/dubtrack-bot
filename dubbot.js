/*
 **************************************************************************
 * ABOUT
 **************************************************************************
 *
 * NightBlueBot is a bot created for the
 * NightBlue3 room on www.dubtrack.fm
 *
 * This is a modified version of said
 * bot, for usage on the KappaCave
 * room on www.dubtrack.fm as well
 *
 **************************************************************************
 * DEVELOPERS
 **************************************************************************
 *
 * @AngeloidIkaros
 * @DemoZ
 * @Larry1123
 * @Matt
 * @Netux
 * @ZubOhm
 *
 **************************************************************************
 * COMMAND LIST
 **************************************************************************
 *
 * List can be found at https://git.io/v1nPT
 * by reading through the file `commands.js`
 *
 **************************************************************************
 */

'use strict';

require('./lib/utilsLoader');
require('./lib/discordWebhookLoader');
var DubAPI = require('dubapi');
var jsonfile = require('jsonfile');
var fs = require('fs');
var os = require("os");
var httpReq = require('http').request;
// Twitch Stuff
var twitchManager = require('./lib/twitchManager.js');
// Time formatting
var moment = require('moment');
// Redis Manager - handles all of the redis interaction
var redisManager = require('./lib/redisManager.js');
// Settings Manager
var settingsManager = require('./lib/settingsManager.js');
// props Manager
var PropsManager = new require('./lib/propsManager.js');
var propsManager = new PropsManager(redisManager);
// Chat and User Utils
var chatUtils = require('./lib/chatUtils.js');
var userUtils = require('./lib/userUtils.js');
var mediaUtils = require('./lib/mediaUtils.js');
var MessageUtils = require('./lib/messageUtils.js');
// Chat and Command Mangers
var ChatManager = require('./lib/chatManager.js');
var chatManager = new ChatManager();
var CommandManager = require('./lib/commandManager.js');
var commandManager = new CommandManager();

var startTime = Date.now();

console.infoFW('> Starting DubAPI...', false);

new DubAPI({
        username: process.env.DT_LOGIN,
        password: process.env.DT_PASS
    },
    /**
     * @param err
     * @param {DubAPI} bot
     * */
    function (err, bot) {
        var BotUtils = require('./lib/botUtils.js');
        var botUtils = new BotUtils(bot);
        require('./commands.js')(commandManager);

        // roulette manager
        var RouletteManager = new require('./lib/rouletteManager.js');
        var rouletteManager = new RouletteManager(redisManager, settingsManager, bot);

        var currentName = "";
        var currentID = "";
        var currentType = "";
        var currentDJ = null;
        var currentDJName = "";
        var currentStream = "";
        var lastMediaFKID = "",
            currentMediaPermaLink = undefined;

        if (err) {
            return console.error(err);
        }

        console.infoFW("> KappaCave-BOT", false);
        console.infoFW("> DEVELOPED BY ANGELOIDIKAROS, DEMOZ, LARRY1123, MATT, NETUX, ZUBOHM", false);

        // reset roulette, for debugging only
        if (process.env.ROULETTE_RESET) {
            redisManager.setLastRouletteTimestamp(true);
            console.infoFW('> ROULETTE RESETED.', false);
        }

        function connect() {
            bot.connect(process.env.DT_ROOM);
        }

        bot.on('connected', function (name) {
            console.info('> Connected to ' + name);
        });

        bot.on('disconnected', function (name) {
            console.info('> Disconnected from ' + name);
            setTimeout(connect, 15000);
        });

        bot.on('error', function (err) {
            console.error(err);
        });

        bot.on(bot.events.roomPlaylistUpdate, function (data) {
            if (data !== undefined) {
                if (data.media == undefined) {
                    return;
                }
                lastMediaFKID = currentID;
                if (data.media.fkid === lastMediaFKID) {
                    return;
                }
                currentName = data.media.name;
                currentID = data.media.fkid;
                currentType = data.media.type;
                // Save song time
                redisManager.getLastSong(function (result) {
                    if (result) {
                        if (result == currentID) {
                            // Don't let it do anything if the song has not changed
                            return;
                        }
                        redisManager.setLastSongTime(result, Date.now());
                    }
                    redisManager.setLastSong(currentID);
                });
                // Save Props START
                if (currentDJ) {
                    var props = propsManager.onSongChange(currentDJ.id);
                    if (props) {
                        var propss = 'prop';
                        if (props > 1) {
                            propss += 's';
                        }
                        bot.sendChat(currentDJ.username + ' got ' + props + ' ' + propss + ' for the song they just played.');
                    }
                }
                else {
                    propsManager.resetProps();
                }
                // Save Props END
                if (data.user) {
                    currentDJ = data.user;
                }
                else {
                    currentDJ = null;
                }
                currentDJName = (data.user == undefined ? "404usernamenotfound" : (data.user.username == undefined ? "404usernamenotfound" : data.user.username));
                if (currentType == "soundcloud") {
                    currentStream = data.media.streamURL;
                    currentMediaPermaLink = "not found (?!) or something went wrong";
                    var soundcloudAccountId = process.env.SC_CLIENT_ID;
                    if (soundcloudAccountId) {
                        httpReq({
                            hostname: 'api.soundcloud.com',
                            path: '/tracks/' + currentID + '?client_id=' + soundcloudAccountId,
                            method: 'GET'
                        }, function (res) {
                            var data = '';
                            res.setEncoding('utf8');
                            res.on('data', function (chunk) {
                                data += chunk;
                            });
                            res.on('error', function (x) {
                                console.error(x);
                            });
                            res.on('end', function () {
                                // Soundcloud API sometimes returns badly formatted JSON.
                                try {
                                    currentMediaPermaLink = JSON.parse(data).permalink_url;
                                }
                                catch (err) {
                                    // workaround with RegExp
                                    var match = data.match(/"permalink_url":"(.[^"]+)"/g);
                                    if (match) {
                                        currentMediaPermaLink = match[0].match(/http(s|)\:\/\/.+/);
                                    }
                                }
                            });
                        }).end();
                    }
                }
                else {
                    currentMediaPermaLink = 'https://youtu.be/' + currentID;
                }
            }

            // Waddie :rooHappy:
            var startTime = (data.startTime || data.raw.startTime);
            if (currentType === 'youtube' && currentID === 'QZhBR7buK_k' && startTime <= 51) {
                setTimeout(bot.sendChat.bind(bot, 'Waddie :rooHappy:'), 1000 * (51 - startTime));
            }

            // Able to use markdown
            if (currentID && userUtils.getUserDubs(bot.getSelf()) < 10) {
                bot.updub();
            }
        });

        bot.on(bot.events.chatMessage, function (data) {
            if (typeof data === "undefined" || typeof data.user === "undefined") {
                console.error("data is undefined");
                // It won't crash now.
                bot.reconnect();
                return;
            }
            // Setup Utils
            var messageUtils = new MessageUtils({
                bot: bot,
                redisManager: redisManager,
                twitchManager: twitchManager,
                propsManager: propsManager,
                rouletteManager: rouletteManager,
                settingsManager: settingsManager,
                chatUtils: chatUtils,
                userUtils: userUtils,
                mediaUtils: mediaUtils,
                botUtils: botUtils,

                currentMediaPermaLink: currentMediaPermaLink,
                currentDJ: currentDJ,
                getRuntimeMessage: function () {
                    return moment(startTime).fromNow();
                }
            }, data);
            chatManager.processChat(messageUtils, commandManager);
        });

        bot.on(bot.events.deleteChatMessage, function (data) {
            chatManager.removeFromImageRemovalQueue(data.id);
        });

        // Everything setup time to connect
        connect();
    });

function roughSizeOfObject(object) {
    var objectList = [];
    var recurse = function (value) {
        var bytes = 0;
        if (typeof value === 'boolean') {
            bytes = 4;
        }
        else if (typeof value === 'string') {
            bytes = value.length * 2;
        }
        else if (typeof value === 'number') {
            bytes = 8;
        }
        else if (
            typeof value === 'object' && objectList.indexOf(value) === -1
        ) {
            objectList[objectList.length] = value;
            for (var i in value) {
                bytes += 8; // an assumed existence overhead
                bytes += recurse(value[i])
            }
        }
        return bytes;
    };
    return recurse(object);
}

function time_format(d) {
    var hours = format_two_digits(d.getHours());
    var minutes = format_two_digits(d.getMinutes());
    var seconds = format_two_digits(d.getSeconds());
    return hours + ":" + minutes + ":" + seconds;
}

function format_two_digits(n) {
    return n < 10 ? '0' + n : n;
}
