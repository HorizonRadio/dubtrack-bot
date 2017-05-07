/*
 **************************************************************************
 * ABOUT
 **************************************************************************
 *
 * NightBlueBot is a BOT created for
 * the now vanished NightBlue3 room
 * on www.dubtrack.fm
 *
 * This is a modified version of said
 * BOT, for usage on the Horizon room
 * on the same site
 *
 **************************************************************************
 * CONTRIBUTORS
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
 * CURRENT DEVELOPERS
 **************************************************************************
 *
 * @AngeloidIkaros
 * @Netux
 *
 **************************************************************************
 * COMMAND LIST
 **************************************************************************
 *
 * List can be found at https://git.io/v1nPT
 * or by reading through the file `commands.js`
 *
 **************************************************************************
 */

'use strict';

require('./lib/utilsLoader');
require('./lib/discordWebhookLoader');
const DubAPI = require('dubapi');
const jsonfile = require('jsonfile');
const fs = require('fs');
const os = require("os");
const httpReq = require('http').request;
// Twitch Stuff
const twitchManager = require('./lib/twitchManager.js');
// Time formatting
const moment = require('moment');
// Redis Manager - handles all of the redis interaction
const redisManager = require('./lib/redisManager.js');
// Settings Manager
const settingsManager = require('./lib/settingsManager.js');
// props Manager
const PropsManager = new require('./lib/propsManager.js');
const propsManager = new PropsManager(redisManager);
// Chat and User Utils
const chatUtils = require('./lib/chatUtils.js');
const userUtils = require('./lib/userUtils.js');
const mediaUtils = require('./lib/mediaUtils.js');
const strings = require('./lib/strings.js');
const MessageUtils = require('./lib/messageUtils.js');
// Chat and Command Mangers
const ChatManager = require('./lib/chatManager.js');
const chatManager = new ChatManager();
const CommandManager = require('./lib/commandManager.js');
const commandManager = new CommandManager();

const startTime = Date.now();

console.infoFW('> Starting DubAPI...', false);

let connectedBOT;
new DubAPI({
        username: process.env.DT_LOGIN,
        password: process.env.DT_PASS
    },
    /**
     * @param err
     * @param {DubAPI} BOT
     * */
    function(err, BOT) {
        const BotUtils = require('./lib/botUtils.js');
        const botUtils = new BotUtils(BOT, strings);
        require('./commands.js')(commandManager);

        // roulette manager
        const RouletteManager = new require('./lib/rouletteManager.js');
        const rouletteManager = new RouletteManager(redisManager, settingsManager, BOT);

        // descramble manager
        const ScrambleManager = new require('./lib/scrambleManager.js');
        const scrambleManager = new ScrambleManager(redisManager, settingsManager, BOT);

        let currentName = "";
        let currentID = "";
        let currentType = "";
        let currentDJ = null;
        let currentDJName = "";
        let currentStream = "";
        let lastMediaFKID = "", currentMediaPermaLink = undefined;

        if(err) {
            return console.error(err);
        }

        console.infoFW("> Horizon-BOT", false);
        console.infoFW("> DEVELOPED BY ANGELOIDIKAROS, DEMOZ, LARRY1123, MATT, NETUX, ZUBOHM", false);

        // reset roulette, for debugging only
        if(process.env.GAME_RESET) {
            const games = process.env.GAME_RESET.split(',');
            games.forEach(function(gameName) {
                redisManager.setLastGameTimestamp(gameName.toLowerCase(), true);
                console.infoFW('> ' + gameName.toUpperCase() + ' RESETED.', false);
            });
        }

        const connectToRoom = () => BOT.connect(process.env.DT_ROOM);

        BOT.on('connected', function(name) {
            connectedBOT = BOT;
            console.info('> Connected to ' + name);
        });

        BOT.on('disconnected', function(name) {
            connectedBOT = null;
            console.info('> Disconnected from ' + name);
            setTimeout(connectToRoom, 15000);
        });

        BOT.on('error', function(err) {
            console.error(err);
        });

        BOT.on(BOT.events.roomPlaylistUpdate, function(data) {
            if(data !== undefined) {
                if(data.media == undefined) {
                    return;
                }
                lastMediaFKID = currentID;
                if(data.media.fkid === lastMediaFKID) {
                    return;
                }
                currentName = data.media.name;
                currentID = data.media.fkid;
                currentType = data.media.type;
                // Save song time
                redisManager.getLastSong(function(result) {
                    if(result) {
                        if(result == currentID) {
                            // Don't let it do anything if the song has not changed
                            return;
                        }
                        redisManager.setLastSongTime(result, Date.now());
                    }
                    redisManager.setLastSong(currentID);
                });
                // Save Props START
                if(currentDJ) {
                    const props = propsManager.onSongChange(currentDJ.id);
                    if(props) {
                        let propStr = 'prop';
                        if(props > 1) {
                            propStr += 's';
                        }
                        BOT.sendChat(currentDJ.username + ' got ' + props + ' ' + propStr + ' for the song they just played.');
                    }
                } else {
                    propsManager.resetProps();
                }
                // Save Props END
                if(data.user) {
                    currentDJ = data.user;
                } else {
                    currentDJ = null;
                }
                currentDJName = (data.user == undefined ? "404usernamenotfound" : (data.user.username == undefined ? "404usernamenotfound" : data.user.username));
                if(currentType == "soundcloud") {
                    currentStream = data.media.streamURL;
                    currentMediaPermaLink = "not found (?!) or something went wrong";
                    const soundcloudAccountId = process.env.SC_CLIENT_ID;
                    if(soundcloudAccountId) {
                        httpReq({
                            hostname: 'api.soundcloud.com',
                            path: '/tracks/' + currentID + '?client_id=' + soundcloudAccountId,
                            method: 'GET'
                        }, function(res) {
                            let data = '';
                            res.setEncoding('utf8');
                            res.on('data', function(chunk) {
                                data += chunk;
                            });
                            res.on('error', function(x) {
                                console.error(x);
                            });
                            res.on('end', function() {
                                // Soundcloud API sometimes returns badly formatted JSON.
                                try {
                                    currentMediaPermaLink = JSON.parse(data).permalink_url;
                                } catch(err) {
                                    // workaround with RegExp
                                    const match = data.match(/"permalink_url":"(.[^"]+)"/g);
                                    if(match) {
                                        currentMediaPermaLink = match[0].match(/http(s|)\:\/\/.+/);
                                    }
                                }
                            });
                        }).end();
                    }
                } else {
                    currentMediaPermaLink = 'https://youtu.be/' + currentID;
                }
            }

            // Waddie :rooHappy:
            const startTime = (data.startTime || data.raw.startTime);
            if(currentType === 'youtube' && currentID === 'QZhBR7buK_k' && startTime <= 51) {
                setTimeout(BOT.sendChat.bind(BOT, 'Waddie :rooHappy:'), 1000 * (51 - startTime));
            }

            // Able to use markdown
            if(currentID && userUtils.getUserDubs(BOT.getSelf()) < 10) {
                BOT.updub();
            }
        });

        const getRuntimeMessage = () => moment(startTime).fromNow();
        BOT.on(BOT.events.chatMessage, function(data) {
            if(typeof data === "undefined" || typeof data.user === "undefined") {
                console.error("data is undefined");
                // It won't crash now.
                BOT.reconnect();
                return;
            }
            // Setup Utils
            const messageUtils = new MessageUtils({
                BOT,
                redisManager,
                twitchManager,
                propsManager,
                rouletteManager,
                scrambleManager,
                settingsManager,
                chatUtils,
                userUtils,
                mediaUtils,
                botUtils,
                strings,

                currentMediaPermaLink,
                currentDJ,
                getRuntimeMessage
            }, data);
            chatManager.processChat(messageUtils, commandManager);
        });

        BOT.on(BOT.events.deleteChatMessage, function(data) {
            chatManager.removeFromImageRemovalQueue(data.id);
        });

        // Punishment Logs
        function fixAndCheckEventToLog(data) {
            if(!data || !data.mod || data.mod.id === BOT.getSelf().id)
                return false;
            if(!data.user) {
                const rawUser = data.raw.modUser;
                if(!rawUser)
                    return false;
                data.user = {
                    username: rawUser.username,
                    id: rawUser._id
                }
            }
            return data;
        }
        function doLogPunishment(data) {
            if(!(data = fixAndCheckEventToLog(data)))
                return;

            console.logPunishment(
                data.type.replace('user-', ''),
                data.user,
                data.mod,
                parseInt(data.time)
            );
        }
        BOT.on(BOT.events.userBan, doLogPunishment);
        BOT.on(BOT.events.userUnban, doLogPunishment);
        BOT.on(BOT.events.userMute, doLogPunishment);
        BOT.on(BOT.events.userUnmute, doLogPunishment);
        BOT.on(BOT.events.userKick, doLogPunishment);

        // Role Change Logs
        function doRoleChangeLog(data) {
            if(!(data = fixAndCheckEventToLog(data)))
                return;

            const prevRole = BOT.roles[data.userPreviousRole];
            const newRole = BOT.roles[data.user.role];

            console.logRoleChange(
                getRoleLevel(newRole) > getRoleLevel(prevRole),
                data.user,
                data.mod,
                prevRole ? prevRole.label : null,
                newRole ? newRole.label : null
            )
        }
        BOT.on(BOT.events.userSetRole, doRoleChangeLog);
        BOT.on(BOT.events.userUnsetRole, doRoleChangeLog);

        // Everything setup time to connect
        connectToRoom();
    }
);

const getRoleLevel = (role) => [
    'dj',
    'resident-dj',
    'vip',
    'mod',
    'manager',
    'co-owner'
].indexOf(role ? role.type : null) + 1;


/* Exit Events */
{
    let closing = false;
    const onExit = function() {
        if(closing)
            return;

        closing = true;
        console.info('> Stopping everything');
        if(connectedBOT) {
            connectedBOT.on('disconnected', function() {
                process.exit(1);
            });
            connectedBOT.disconnect();
        } else process.exit(1);
    };
    process.on('SIGINT', onExit);
    process.on('exit', onExit);
}
