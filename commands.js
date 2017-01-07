var seedrandom = require('seed-random'); // Random seeds (duh)
var moment = require('moment'); // Time formatting
var httpsReq = require('https').request; // Request
var cookieDisplay = require('./cookies.json'); // Cookie command
const util = require('util'); // Utils

function regCommands(commandManager) {
    var Command = commandManager.Command;
    /**
     * @param {CommandManager} commandManager
     */
    [
        new Command('hello', ['hello'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(Math.dice(50) === 0) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' hello...');
                    setTimeout(function() {
                        utils.bot.sendChat('... it\'s me...');
                    }, 4500);
                }
                else {
                    utils.bot.sendChat('Hi There, @' + utils.getUserUsername());
                }
            }
        ),
        new Command('song', ['song'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat('@' + utils.getUserUsername() + ' The current song is ' + utils.getMediaName() + ', the link is ' + utils.currentMediaPermaLink);
            }
        ),
        // No cooldown because no messages no need to cool this down
        new Command('props', ['props'], 0, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                doProps(utils, commandManager);
            }
        ),
        new Command('eta', ['eta'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' In order to get the ETA Timer, please download the DubX Extension from https://dubx.net/');
                utils.bot.sendChat('https://i.imgur.com/ldj2jqf.png');
            }
        ),
        new Command('myprops', ['myprops'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.redisManager.getProps(utils.getUserId(), function(result) {
                    if(result) {
                        var propss = 'prop';
                        if(result > 1) {
                            propss += 's';
                        }
                        utils.bot.sendChat('@' + utils.getUserUsername() + ' you have ' + result + ' ' + propss + '! :)');
                    }
                    else {
                        utils.bot.sendChat('@' + utils.getUserUsername() + ' you don\'t have any props! Play a song to get props! :)');
                    }
                });
            }
        ),
        new Command('rules', ['rules'], 0.5, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' Rules: https://git.io/v1ZfB');
            }
        ),
        new Command('dubx', ['dubx'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' you can download DubX at https://www.dubx.net');
                utils.bot.sendChat('Follow this guide to help you install DubX! https://git.io/vzCVn');
            }
        ),
        new Command('givedememotes', ['gde', 'givedememotes'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' you can download _give dem emotes_ at https://gde.netux.ml');
                utils.bot.sendChat('*Note:* Put your mouse over the button to see instructions');
            }
        ),
        new Command('css', ['css'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' Fancy CSS! https://imgur.com/a/MuolQ');
            }
        ),
        new Command('background', ['bg', 'background', 'backgrounds'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             * @param {Command} command
             */
            function(utils, command) {
                doListCommand({
                        showListMessage: 'I have background lists from: %s or room',
                        showListArgumentName: 'from',
                        showSelectedMessage: '%s\'s BGs: ',
                        list: {
                            'Snaky': 'https://imgur.com/a/iQ8rh',
                            'Maskinen': 'https://imgur.com/a/P2Y8e',
                            'Netux': 'https://imgur.com/a/j6QbM',
                            'Frosolf': 'https://imgur.com/a/NZvz1 & https://goo.gl/sqfesS (only anime)',
                            'SiilerBloo': 'https://imgur.com/a/oZKQ3',
                            'Pikachu': 'https://imgur.com/a/75R64',
                            'Jagex': 'https://imgur.com/a/swXWN & https://imgur.com/a/rR38y',
                            'DingoTheMagic': 'https://imgur.com/a/DAaYw',
                            'TickingTime': 'https://imgur.com/a/jWhjX',
                            'ItsClutch': 'https://imgur.com/a/EixZ2',
                            'Alexrerder': 'http://goo.gl/o06VPP'
                        }
                    },
                    function(selectedName) {
                        if(selectedName.toLowerCase() !== 'room') {
                            return;
                        }
                        utils.bot.sendChat(utils.getTargetName(2) + ' Room Background: ' + 'https://api.dubtrack.fm/room/' + utils.bot.getRoomMeta().id + '/image');
                    },
                    undefined,
                    utils,
                    command
                );
            }
        ),
        new Command('queue', ['queue'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' How to Queue a Song: https://imgur.com/a/FghLg');
            }
        ),
        new Command('ping', ['ping'], 0.5, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat('@' + utils.getUserUsername() + ' pong!');
            }
        ),
        new Command('pong', ['pong'], 0.5, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat('@' + utils.getUserUsername() + ' ping!');
            }
        ),
        new Command('english', ['english', 'eng'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' Please stick to English in this room, doing otherwise will result in a mute.');
            }
        ),
        new Command('shush', ['shush', 'sush', 'noskip', 'noskiperino'], 1, ['vip'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' ' + getShushMessage());
            }
        ),
        new Command('videocheck', ['videocheck'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                var videoStr = 'a video', queryString = '';
                if(utils.getCommandArguments()[0]) {
                    var videoID = utils.getCommandArguments()[0].match(/https?:\/\/(?:www\.)?youtu(?:\.be\/|be\.com\/watch\?v=)([a-z0-9_-]+)/i);
                    if(videoID) videoID = videoID[1];
                    else videoID = utils.getCommandArguments()[0];
                    videoStr = 'that video';
                    queryString = '?id=' + videoID;
                } else if(utils.bot.getMedia() && utils.getMediaType() === 'youtube' && utils.getMediaFkid()) {
                    videoStr = 'current video';
                    queryString = '?id=' + utils.getMediaFkid();
                }
                utils.bot.sendChat('@' + utils.getUserUsername() + ' ' + util.format('Check if %s is available on any country at https://mitchdev.net/yt/%s', videoStr, queryString));
            }
        ),
        new Command('lovepercentage', ['lovepercent', 'love%', 'lovepercentage'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments().length > 0) {
                    var username = utils.getTargetName().replace('@', '');
                    var username2 = utils.getUserUsername();
                    if(utils.getCommandArguments().length > 1) {
                        username2 = utils.getTargetName(2).replace('@', '');
                        /**
                         * @return {boolean}
                         */
                        function XOR(foo, bar) {
                            return foo ? !bar : bar;
                        }

                        if(XOR(username.toLowerCase() == utils.getUserUsername().toLowerCase(), username2.toLowerCase() == utils.getUserUsername().toLowerCase())) {
                            if(XOR(username.toLowerCase() == utils.bot.getSelf().username.toLowerCase(), username2.toLowerCase() == utils.bot.getSelf().username.toLowerCase())) {
                                username = utils.bot.getSelf().username;
                            }
                        }
                        else if(username2.toLowerCase() == utils.bot.getSelf().username.toLowerCase()) {
                            utils.bot.sendChat("@" + utils.getUserUsername() + " I love " + username + " 100%.");
                            return;
                        }
                        else if(username.toLowerCase() == utils.bot.getSelf().username.toLowerCase()) {
                            utils.bot.sendChat("@" + utils.getUserUsername() + " I love " + username2 + " 100%.");
                            return;
                        }
                    }
                    if(username.toLowerCase() == utils.getUserUsername().toLowerCase() && username2.toLowerCase() == utils.getUserUsername().toLowerCase()) {
                        utils.bot.sendChat("@" + utils.getUserUsername() + " well I don't know.... how much do you love yourself?");
                        return;
                    }
                    else if(username.toLowerCase() == utils.bot.getSelf().username.toLowerCase()) {
                        utils.bot.sendChat('@' + utils.getUserUsername() + " of course I love you 100%, silly <3");
                        return;
                    }

                    seedrandom(username.hashCode() + username2.hashCode(), { global: true });
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' there is ' + Math.dice(100) + '% of :nb3h: between ' + username2 + ' and ' + username);
                    seedrandom.resetGlobal();
                }
            }
        ),
        // Mod command only no cooldown needed : require mute
        new Command('mute', ['mute'], 0, [], ['mute'],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                processAndDoPunish(utils, 'mute');
            }
        ),
        // Mod command only no cooldown needed : require mute
        new Command('timeout', ['timeout'], 0, [], ['mute'],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                processAndDoPunish(utils, 'timeout');
            }
        ),
        // Mod command only no cooldown needed : require mute
        new Command('ban', ['ban'], 0, [], ['ban'],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                processAndDoPunish(utils, 'ban');
            }
        ),
        new Command('lastplayed', ['lastplayed', 'history'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                var arg0 = utils.getCommandArguments()[0];

                if(!arg0 && !utils.bot.getMedia()) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' no song is playing right now.');
                    return;
                }

                utils.redisManager.getLastSongTime(arg0 || utils.getMediaFkid(), function(result) {
                    if(result) {
                        utils.bot.sendChat((arg0 ? 'That' : 'This') + ' video/song was last played ' + moment(parseInt(result)).from(Date.now()) + '.');
                    }
                    else {
                        utils.bot.sendChat((arg0 ? 'That' : 'This') + ' video/song has not played in the past 5 weeks. It could never have played before, is a re-upload, or a remix.');
                    }
                });
            }
        ),
        new Command('commands', ['commands'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' A command list can be found here: https://git.io/v1nPT');
            }
        ),
        new Command('setcd', ['setcd', 'setcooldown', 'cooldown'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments()[0] == undefined) {
                    var output = utils.settingsManager.getCooldown();
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' current command cooldown is of ' + output + ' second' + (output === 1 ? '' : 's') + '.');
                    return 1;
                }
                var input = parseInt(utils.getCommandArguments()[0]);
                if(!isNaN(input)) {
                    utils.settingsManager.setCooldown(input);
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' set cooldown to ' + input + ' second' + (input === 1 ? '' : 's') + '.');
                }
            }
        ),
        new Command('setimgtime', ['setimgtime', 'setimagetime', 'imagetime'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments()[0] == undefined) {
                    var output = utils.settingsManager.getImgTime();
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' current image removal time is of ' + output + ' second' + (output === 1 ? '' : 's') + '.');
                    return 1;
                }
                var input = parseInt(utils.getCommandArguments()[0]);
                if(!isNaN(input)) {
                    utils.settingsManager.setImgTime(input);
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' set image removal time to ' + input + ' second' + (input === 1 ? '' : 's') + '.');
                }
            }
        ),
        new Command('imgdubsamount', ['setimgdubsamount', 'imgdubsamount', 'imagedubsamount'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments()[0] == undefined) {
                    var output = utils.settingsManager.getImgDubsAmount();
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' current amount of dubs for images is of ' + output + ' dub' + (output === 1 ? '' : 's') + '.');
                    return 1;
                }
                var input = parseInt(utils.getCommandArguments()[0]);
                if(!isNaN(input)) {
                    utils.settingsManager.setImgDubsAmount(input);
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' set the amount of dubs for images to ' + input);
                }
            }
        ),
        new Command('imgremovemutetime', ['setimageremovemutetime', 'imgremovemutetime', 'imageremovemutetime'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments()[0] == undefined) {
                    var output = utils.settingsManager.getImgRemoveMuteTime();
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' users are getting muted if they don\`t meet the required amount of dubs for ' + output + ' minute' + (output === 1 ? '' : 's') + '.');
                    return 1;
                }
                var input = parseInt(utils.getCommandArguments()[0]);
                if(!isNaN(input)) {
                    utils.settingsManager.setImgRemoveMuteTime(input);
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' users will now get muted for ' + input + ' minute' + (input === 1 ? '' : 's') + ' for not meeting the required amount of dubs.');
                }
            }
        ),
        new Command('skip', ['skip'], 0, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.moderateDeleteChat(utils.getId());
                utils.timeMuteUser(5, '@' + utils.getUserUsername() + ' ' + getShushMessage());
            }
        ),
        new Command('clear', ['clear', 'laggy'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' You can clear you chat if it gets too laggy. https://i.imgur.com/D1T64mP.gif');
            }
        ),
        new Command('androidapp', ['android', 'androidapp', 'androidapk'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' Unofficial Android app (sorry iOS users) for Dubtrack: https://play.google.com/store/apps/details?id=co.mar974.dubtrackfm | Thank mar974 :D');
            }
        ),
        new Command('catfact', ['catfact', 'catfacts'], 1, ['resident-dj'], [],
            /**
             * @param {MessageUtils} utils
             * @param {Command} command
             * @param {Function} dontSetCooldown
             */
            function(utils, command, dontSetCooldown) {
                requestCatFact(
                    dontSetCooldown,
                    function() {
                        utils.bot.sendChat(utils.getTargetName() + ' no cat facts found :(');
                    },
                    function(fact) {
                        var waysOfSayingIt = [
                            '%u Cat fact: %f.',
                            '%u Did you know: %f?',
                            '%u Have you heard? %f.'
                        ];
                        waysOfSayingIt = waysOfSayingIt[Math.dice(waysOfSayingIt.length)];
                        utils.bot.sendChat(waysOfSayingIt.replace('%u', utils.getTargetName()).replace('%f', fact));
                    }
                );
            }
        ),
        new Command('animelist', ['anime', 'animes', 'animelist'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' Anime List: https://goo.gl/d4lvua');
                utils.bot.sendChat('Never_Pause also recommends his animelist: https://goo.gl/h6OoW3');
            }
        ),
        new Command('cookie', ['cookie', 'givecookie'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments().length < 2) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' cookies on display: ' + Object.keys(cookieDisplay).join(', '));
                    return;
                }
                var cookie = cookieDisplay[utils.getCommandArguments()[0].toLowerCase()];
                if(!cookie) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' I don\'t have that cookie on display.');
                    return;
                }
                var target = utils.bot.getUserByName(utils.getTargetName(2, true));
                if(!target) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' I would give them the cookie but they seem to not be here.');
                    return;
                }
                if(target.id === utils.getUserId()) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' don\'t you already have the cookie? Just eat it!');
                    return;
                }
                if(target.id === utils.bot.getSelf().id) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' for me :nb3Happy:? Thank you! I\'ll eat this ' + cookie.name + ' now if you don\'t mind :rawrrCookie:');
                    return;
                }
                utils.bot.sendChat('@' + target.username + ' ' + utils.getUserUsername() + ' gave you a/an ' + cookie.name + ' ' + cookie.emote);
            }
        ),
        new Command('banphraseignorespaces', ['setbanphraseignorespaces', 'banphraseignorespaces', 'setbanphrasesignorespaces', 'banphrasesignorespaces'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments()[0] == undefined) {
                    var output = utils.settingsManager.getImgRemoveMuteTime();
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' checking for ban phrases is ' + (utils.settingsManager.getBanPhrasesIgnoreSpaces() ? '*not*' : '') + ' ignoring spaces.');
                    return 1;
                }
                var input = /^(?:true|enable|yes|y|on|tick|check|:white_check_mark:|:heavy_check_mark:|:ballot_box_with_check:)$/i.test(utils.getCommandArguments()[0]);
                utils.settingsManager.setBanPhrasesIgnoreSpaces(input);
                utils.bot.sendChat('@' + utils.getUserUsername() + ' ' + getBanPhrasesIgnoreSpacesMessage(input));
            }
        ),
        new Command('set_banphraseignorespaces', ['setspaces', 'setspace'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.settingsManager.setBanPhrasesIgnoreSpaces(true);
                utils.bot.sendChat('@' + utils.getUserUsername() + ' ' + getBanPhrasesIgnoreSpacesMessage(true));
            }
        ),
        new Command('unset_banphraseignorespaces', ['unsetspaces', 'unsetspace'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.settingsManager.setBanPhrasesIgnoreSpaces(false);
                utils.bot.sendChat('@' + utils.getUserUsername() + ' ' + getBanPhrasesIgnoreSpacesMessage(false));
            }
        ),
        new Command('roulette_start', ['roulette', 'roullete'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.rouletteManager.started !== false) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' did you forget the "join" part? There is a roulette running right now!');
                    return;
                }
                utils.redisManager.getLastGameTimestamp('roulette', function(last) {
                    {
                        var now = Date.now(), cooldown = utils.settingsManager.getRouletteCooldown();
                        if(last >= 0 && (now - last) < cooldown) {
                            utils.bot.sendChat('@' + utils.getUserUsername() + ' hold on! Last roulette was ' + moment(last).fromNow() + '. You must wait ' + (cooldown / 60 / 1000) + ' minute(s) to run the roulette again.');
                            return;
                        }
                    }
                    {
                        var queue = utils.bot.getQueue();
                        if(queue.length <= 1) {
                            utils.bot.sendChat('@' + utils.getUserUsername() + ' wow what?! I don\'t see users in queue' + (queue.length === 1 ? ', only that ' + queue[0].user.username + ' guy' : '') + '.');
                            return;
                        }
                    }
                    var duration = utils.settingsManager.getRouletteDuration();
                    if(utils.getCommandArguments()[0]) {
                        duration = parseInt(utils.getCommandArguments()[0]);
                        if(isNaN(duration)) {
                            utils.bot.sendChat('@' + utils.getUserUsername() + ' that duration you gave me doesn\'t seem like a number.');
                            return;
                        }
                    }

                    var price = utils.settingsManager.getRoulettePrice();
                    if(utils.getCommandArguments()[1]) {
                        price = parseInt(utils.getCommandArguments()[1]);
                        if(isNaN(price)) {
                            utils.bot.sendChat('@' + utils.getUserUsername() + ' that price you gave me doesn\'t seem like a number.');
                            return;
                        }
                    }

                    utils.bot.sendChat('*Roulette is starting!* Use `!join` to join in!');
                    utils.bot.sendChat('Ends in _' + duration + ' second' + (duration !== 1 ? 's' : '') + '_. | Price to join is of _' + price + ' prop' + (price !== 1 ? 's' : '') + '_.');
                    utils.rouletteManager.start(duration, price, function(error, winnerId, oldSpot, newSpot) {
                        if(error) {
                            utils.bot.sendChat('aaaaand *the rou*-- wait.');
                            switch(error) {
                                default:
                                    utils.bot.sendChat('Uh oh, something happened! They didn\'t tell me what, but it did something to this roulette.');
                                    break;
                                case 'not-enough-users':
                                    utils.bot.sendChat('Nobody joined the roulette, now I\'m sad :frowning:.');
                                    break;
                                case 'spot-lower-than-zero':
                                    utils.bot.sendChat('Uh oh. Apparently my algorithm is wrong, because I was about to move someone to spot #' + newSpot + '!');
                                    break;
                                case 'spot-higher-than-queue-length':
                                    utils.bot.sendChat('Uh oh. Apparently my algorithm is wrong, because I was about to move someone above the size of the queue!');
                                    break;
                            }
                            return;
                        }

                        var movedMsg = Math.abs(oldSpot - newSpot);
                        if(oldSpot === newSpot) {
                            movedMsg = 'same as before :confused:';
                        } else {
                            movedMsg += ' spot' + (movedMsg !== 1 ? 's' : '') + ' ' + (oldSpot > newSpot ? 'above! :nb3Boosted:' : 'below :frowning:');
                        }

                        utils.bot.sendChat('aaaaand *the roulette is over*!');
                        utils.bot.sendChat('Our lucky winner is @' + utils.bot.getUser(winnerId).username + '! You\'ll be moved to spot #' + (newSpot + 1) + ' in queue (' + movedMsg + ').');
                        utils.bot.moderateMoveDJ(winnerId, newSpot);
                    });
                    console.warn('Roulette started by @' + utils.getUserUsername() + '. Duration: ' + duration + ' second(s). Price: ' + price + ' prop(s).');
                });
            }
        ),
        new Command('roulette_join', ['join', 'roulettejoin'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.rouletteManager.started === false) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' I\'m not running a roulette right now.');
                    return;
                }
                if(utils.bot.getQueuePosition(utils.getUserId()) === -1) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' you are not in queue!');
                    return;
                }
                if(utils.rouletteManager.listedUsers.indexOf(utils.getUserId()) >= 0) {
                    return;
                }
                utils.redisManager.getProps(utils.getUserId(), function(propsCount) {
                    if(typeof propsCount === 'undefined' || isNaN(propsCount)) propsCount = 0;
                    if(propsCount < utils.rouletteManager.currentPrice) {
                        utils.bot.sendChat('@' + utils.getUserUsername() + ' you\'re low in props! Sorry :S');
                        return;
                    }
                    utils.rouletteManager.addUser(utils.getUser().id);
                }.bind(this));
            }
        ),
        new Command('roulette_stop', ['roulettestop', 'roulette_stop'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.rouletteManager.started === false) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' I\'m not running a roulette right now.');
                    return;
                }
                if(utils.rouletteManager.forceStop()) {
                    utils.bot.sendChat('Hold your typing! ' + utils.getUserUsername() + ' *stopped the roulette*.');
                }
            }
        ),
        new Command('roulette_check', ['roulettecheck', 'roulette_check'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.rouletteManager.started !== false) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' a roulette is running right now, silly!');
                    return;
                }
                utils.redisManager.getLastGameTimestamp('roulette', function(last) {
                    var now = Date.now(), cooldown = utils.settingsManager.getRouletteCooldown();
                    if(last >= 0 && (now - last) < cooldown) {
                        utils.bot.sendChat('@' + utils.getUserUsername() + ' last roulette was ' + moment(last).fromNow() + '. You will be able to run a roulette in ' + moment(last + cooldown).diff(now, 'minutes') + ' minute(s).');
                    } else {
                        utils.bot.sendChat('@' + utils.getUserUsername() + ' more than ' + (cooldown / 60 / 1000) + ' minute(s) has passed, go ahead to run that command!')
                    }
                });
            }
        ),
        new Command('move_to', ['move', 'moveto', 'move_to'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                var user = utils.getTargetName(1, true),
                    spot = utils.getCommandArguments()[1];
                if(!user) {
                    return;
                }
                if(!spot) {
                    spot = user;
                    user = utils.getUserUsername();
                }
                if(isNaN(spot = parseInt(spot))) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' spot doesn\'t seem like a number.');
                    return;
                }
                {
                    var queue = utils.bot.getQueue();
                    if(spot >= queue.length) {
                        spot = queue.length;
                    } else if(spot <= 0) {
                        spot = 1;
                    }
                }
                {
                    var username = user;
                    if(!(user = utils.bot.getUserByName(username, true))) {
                        utils.bot.sendChat('@' + utils.getUserUsername() + ' ' + username + ' is not online.');
                        return;
                    }
                }
                if(utils.bot.getQueuePosition(user.id) === spot - 1) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' ' + (utils.getUserId() === user.id ? 'you are' : 'user') + ' already on that spot!');
                    return;
                }
                utils.bot.moderateMoveDJ(user.id, spot - 1, function() {
                    utils.bot.sendChat('@' + user.username + ' you got moved to spot #' + spot + ' in queue.');
                });
            }
        ),
        new Command('export_youtube', ['export', 'exportyoutube', 'exportyt', 'exporttoyoutube', 'exporttoyt'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' How to export a playlist to YouTube: https://imgur.com/a/VVoFV');
            }
        ),
        new Command('streamers', ['stream', 'streams', 'streamers'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             * @param {Command} command
             */
            function(utils, command) {
                function fetchStreamerAndSendMessage(user, channel) {
                    utils.twitchManager.getStream(channel, function(err, body) {
                        if(err) {
                            console.error(err);
                        }
                        var stream = body.stream;
                        if(stream) {
                            utils.bot.sendChat(user + ' is currently *Streaming* ' + stream.channel.url);

                        }
                        else {
                            utils.bot.sendChat(user + ' is currently *Offline* https://www.twitch.tv/' + channel.toLowerCase());
                        }

                    });
                }

                doListCommand({
                        showListMessage: 'Pick a streamer from the list: %s or ALL (resident-dj+)',
                        showListArgumentName: 'streamer',
                        list: {
                            'Snaky': 'Snaky2610',
                            'Frosolf': 'frosolf',
                            'The_kineese': 'the_kineese',
                            'Lord_eRazor': 'Gustavknas',
                            'TheHaremKing': 'dubx_theharemking',
                            'seeBotsChat': 'seebotschat'
                        },
                    },
                    function(selectedName, list) {
                        if(selectedName.toLowerCase() !== 'all' || !utils.botUtils.checkRole(utils.getUser(), 'resident-dj')) {
                            return;
                        }

                        Object.keys(list).forEach(function(user) {
                            // Ohh the spam
                            fetchStreamerAndSendMessage(user, list[user]);
                        });
                    },
                    fetchStreamerAndSendMessage,
                    utils,
                    command
                );
            }
        ),
        new Command('discord', ['discordserver', 'discord'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' Feel free to join our own Discord Server: https://discord.gg/tQgSvdq');
            }
        ),
        new Command('repository', ['repository', 'repo'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.bot.sendChat(utils.getTargetName() + ' You can find my GitHub repository here: https://github.com/Netox005/KappaCave-BOT');
            }
        ),
        new Command('scramble_start', ['scramble', 'scrambleword', 'scrable_start'], 1, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.scrambleManager.started !== false) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' I\'m running a scramble right now!');
                    return;
                }
                utils.redisManager.getLastGameTimestamp('scramble', function(last) {
                    {
                        var now = Date.now(), cooldown = utils.settingsManager.getScrambleCooldown();
                        if(last >= 0 && (now - last) < cooldown) {
                            utils.bot.sendChat('@' + utils.getUserUsername() + ' hold on! Last scramble was ' + moment(last).fromNow() + '. You must wait ' + (cooldown / 60 / 1000) + ' minute(s) to run the scramble again.');
                            return;
                        }
                    }
                    var duration = utils.settingsManager.getScrambleDuration();
                    if(utils.getCommandArguments()[0]) {
                        duration = parseInt(utils.getCommandArguments()[0]);
                        if(isNaN(duration)) {
                            utils.bot.sendChat('@' + utils.getUserUsername() + ' that duration you gave me doesn\'t seem like a number.');
                            return;
                        }
                    }
                    var reward = utils.settingsManager.getScrambleReward();
                    if(utils.getCommandArguments()[1]) {
                        reward = parseInt(utils.getCommandArguments()[1]);
                        if(isNaN(reward)) {
                            utils.bot.sendChat('@' + utils.getUserUsername() + ' the reward amount you gave me doesn\'t seem like a number.');
                            return;
                        }
                    }
                    var wordLengthRange = [5, 8];
                    if(utils.getCommandArguments()[2]) {
                        var match = utils.getCommandArguments()[2].match(/^(\d+)(?:,|-)(\d+)$/);
                        if(match) {
                            wordLengthRange[0] = match[1];
                            wordLengthRange[1] = match[2];
                        } else {
                            var wordLength = parseInt(utils.getCommandArguments()[2]);
                            if(isNaN(wordLength)) {
                                utils.bot.sendChat('@' + utils.getUserUsername() + ' the word length you gave me doesn\'t seem like a number.');
                                return;
                            } else {
                                wordLengthRange[0] = wordLengthRange[1] = wordLength;
                            }
                        }
                        wordLengthRange.forEach(function(minOrMax, index) {
                             if(minOrMax < 3) {
                                wordLengthRange[index] = 3;
                            }
                            if(minOrMax > 20) {
                                wordLengthRange[index] = 20;
                            }
                        });
                    }

                    utils.scrambleManager.start({
                        duration,
                        reward,
                        wordLengthRange
                    }, function(scrambledWord) {
                        utils.bot.sendChat('*Scramble started!* Try to unscramble the word _' + scrambledWord + '_ with `!guess [word]`');
                        utils.bot.sendChat('Ends in _' + duration + ' second' + (duration !== 1 ? 's' : '') + '_. | Reward is of _' + reward + ' prop' + (reward !== 1 ? 's' : '') + '_.');
                    }, function(err, word) {
                        if(err) {
                            var errorMessage = 'Uh oh, something happened, and I don\'t know what! :S';
                            switch(err) {
                                default: break;
                                case 'no-selectable-words':
                                    errorMessage = 'Uh oh, something happened while fetching the word. I can\'t run the Scramble right now.';
                                    break;
                                case 'no-api-key':
                                    errorMessage = 'Uh oh, no API Key from Wordnik specified. I can\'t fetch the words without it!';
                                    break;
                            }
                            utils.bot.sendChat('@' + utils.getUserUsername() + ' ' + errorMessage);
                            return;
                        }
                        utils.bot.sendChat('*Scramble ended!* The word was _' + word + '_');
                    });
                    console.warn('Scramble started by @' + utils.getUserUsername() + '. Duration: ' + duration + ' second(s). Reward: ' + reward + ' prop(s).');
                });
            }
        ),
        new Command('scramble_guess', ['guess', 'descramble', 'unscramble', 'scrambleguess', 'scramble_guess'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.scrambleManager.started === false) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' I\'m not running a scramble right now.');
                    return;
                }
                var guess = utils.getCommandArguments()[0];
                if(!guess) {
                    return;
                }
                if(utils.scrambleManager.guess(utils.getUserId(), guess)) {
                    utils.bot.sendChat('*Scramble ended!* @' + utils.getUserUsername() + ' guessed the word, which was _' + utils.scrambleManager.word + '_.');
                }
            }
        ),
        new Command('scramble_stop', ['scramblestop', 'scramble_stop'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.scrambleManager.started === false) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' I\'m not running a scramble right now.');
                    return;
                }
                if(utils.scrambleManager.forceStop()) {
                    utils.bot.sendChat('Stop guessing! ' + utils.getUserUsername() + ' *stopped the scramble*. The word was _' + utils.scrambleManager.word + '_');
                }
            }
        ),
        new Command('scramble_check', ['scramblecheck', 'scramble_check'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.scrambleManager.started !== false) {
                    utils.bot.sendChat('@' + utils.getUserUsername() + ' a scramble is running right now, silly!');
                    return;
                }
                utils.redisManager.getLastGameTimestamp('scramble', function(last) {
                    var now = Date.now(), cooldown = utils.settingsManager.getScrambleCooldown();
                    if(last >= 0 && (now - last) < cooldown) {
                        utils.bot.sendChat('@' + utils.getUserUsername() + ' last scramble was ' + moment(last).fromNow() + '. You will be able to run a scramble in ' + moment(last + cooldown).diff(now, 'minutes') + ' minute(s).');
                    } else {
                        utils.bot.sendChat('@' + utils.getUserUsername() + ' more than ' + (cooldown / 60 / 1000) + ' minute(s) has passed, go ahead to run that command!')
                    }
                });
            }
        )
    ].forEach(function(command) {
            var ret = commandManager.addCommand(command);
            if(!ret) {
                console.error('Command failed to be added, Command:' + command.id);
            }
        }
    )
}

function requestCatFact(dontSetCooldown, noFacts, cb) {
    var requestsCount = 0;

    function doSo(_cb) {
        if(requestsCount > 5) {
            dontSetCooldown();
            return;
        }
        else {
            requestsCount++;
        }

        httpsReq({
            hostname: 'catfacts-api.appspot.com',
            path: '/api/facts',
            method: 'GET'
        }, function(res) {
            var data = '';
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('error', function(x) {
                noFacts();
                console.error(x);
            });
            res.on('end', function() {
                try {
                    data = JSON.parse(data);
                }
                catch(x) {
                    noFacts();
                }

                // Fact too long. To avoid spam request a new one and call _cb.
                if(data.facts[0].length > 125) {
                    doSo(_cb);
                    _cb(false);
                    return;
                }

                // Replace last period and call _cb.
                _cb(data.facts[0].replace(/\.$/g, ''));
            });
        }).end();
    }

    doSo(function(result) {
        if(result !== false) {
            cb(result);
        }
    });
}

function doListCommand(listInfo, showNotFoundFunk, showSelectedFunk, utils, command) {
    if(!utils.getCommandArguments()[0]) {
        utils.bot.sendChat('@' + utils.getUserUsername() + ' ' + util.format(listInfo.showListMessage, Object.keys(listInfo.list).join(', ')));
        utils.bot.sendChat('Do `!' + command.names[0] + ' <' + listInfo.showListArgumentName + '>' + '` to get the link.');
        return;
    }

    function checkIfSpecify() {
        var result = null;
        Object.keys(listInfo.list).forEach(function(key) {
            if(key.toLowerCase() === utils.getCommandArguments()[0].toLowerCase()) {
                result = key;
            }
        });
        return result;
    }

    var selected;
    if(selected = checkIfSpecify()) {
        if(typeof showSelectedFunk === 'function') {
            showSelectedFunk(selected, listInfo.list[selected], listInfo.list);
        } else {
            utils.bot.sendChat(utils.getTargetName(2) + ' ' + util.format(listInfo.showSelectedMessage, selected) + listInfo.list[selected]);
        }
    } else {
        if(typeof showNotFoundFunk === 'function') {
            showNotFoundFunk(utils.getCommandArguments()[0], listInfo.list);
        }
    }
}

function doProps(utils, commandManager) {
    if(!utils.currentDJ) {
        utils.bot.sendChat('@' + utils.getUserUsername() + ' there is no song to prop!');
        commandManager.setUserOnCooldown(utils, this, utils.settingsManager.getCooldown());
        return;
    }
    if(utils.getUserId() === utils.currentDJ.id) {
        utils.bot.sendChat('@' + utils.getUserUsername() + ' we know you love your song, but let others also prop you!');
        commandManager.setUserOnCooldown(utils, this, utils.settingsManager.getCooldown());
        return;
    }
    utils.propsManager.addProp(utils.getUserId());
}

function processAndDoPunish(utils, type) {
    var username = utils.getTargetName().replace("@", "");
    var punished = utils.bot.getUserByName(username, true);
    if(punished) {
        var time = parseFloat(utils.getCommandArguments()[1]);
        if(isNaN(time)) {
            time = 5;
        }
        switch(type) {
            default:
                utils.bot.sendChat("Something happened! D:");
                return;
            case 'ban':
                utils.botUtils.timeBan(punished, time, null);
                break;
            case 'mute':
                utils.botUtils.timeMute(punished, time, "@" + username + " muted for " + time + " minute" + (time !== 1 ? 's' : '') + '!');
                break;
            case 'timeout':
                utils.botUtils.timeoutUser(punished, time, "@" + username + " timed out for " + time + " minute" + (time !== 1 ? 's' : '') + '!');
                break;
        }
    }
    else {
        utils.bot.sendChat("No user found by the name " + username + ".")
    }
}

function getShushMessage() {
    return ':NoSkip: (Click for better quality) https://i.imgur.com/05NVq0h.png';
}

function getBanPhrasesIgnoreSpacesMessage(input) {
    return 'while checking for ban phrases I will ' + (input ? 'ignore spaces from now on' : 'not ignore spaces') + '.'
}

module.exports = regCommands;
