var seedrandom = require('seed-random'); // Random seeds (duh)
var moment = require('moment'); // Time formatting
var httpsReq = require('https').request; // Request
var cookieDisplay = require('./cookies.json'); // Cookie command
const util = require('util'); // Utils

const youtubeURLRegexp = /https?:\/\/(?:www\.)?youtu(?:\.be\/|be\.com\/watch\?v=)([a-z0-9_-]+)/i;

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
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' hello...');
                    setTimeout(function() {
                        utils.BOT.sendChat('... it\'s me...');
                    }, 4500);
                }
                else {
                    utils.BOT.sendChat('Hi There, @' + utils.getUserUsername());
                }
            }
        ),
        new Command('song', ['song'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat('@' + utils.getUserUsername() + ' The current song is ' + utils.getMediaName() + ', the link is ' + utils.currentMediaPermaLink);
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
                        utils.BOT.sendChat('@' + utils.getUserUsername() + ' you have ' + result + ' ' + propss + '! :)');
                    }
                    else {
                        utils.BOT.sendChat('@' + utils.getUserUsername() + ' you don\'t have any props! Play a song to get props! :)');
                    }
                });
            }
        ),
        new Command('rules', ['rules'], 0.5, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' Rules: https://git.io/vSTpz');
            }
        ),
        new Command('dubplus', ['dubplus', 'dub+'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' You can download and install Dubtrack\'s new extension Dub+ from the following site: https://dub.plus/');
            }
        ),
        new Command('givedememotes', ['gde', 'givedememotes'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' You can download _give dem emotes_ at https://gde.netux.ml');
                utils.BOT.sendChat('*Note:* Put your mouse over the button to see instructions');
            }
        ),
        new Command('css', ['css', 'style', 'styles', 'stylesheet', 'stylesheets'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' A list of CSS Stylesheets can be found at https://git.io/v9T2P');
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
                            'Alexrerder': 'http://goo.gl/o06VPP',
                            'Erikku-Kun': 'https://imgur.com/a/JCqgC',
                            'Lord_eRazor': 'https://imgur.com/a/sCslW'
                        }
                    },
                    function(selectedName) {
                        if(selectedName.toLowerCase() !== 'room') {
                            return;
                        }
                        utils.BOT.sendChat(utils.getTargetName(2) + ' Room Background: ' + 'https://api.dubtrack.fm/room/' + utils.BOT.getRoomMeta().id + '/image');
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
                utils.BOT.sendChat(utils.getTargetName() + ' How to Queue a Song: https://imgur.com/a/FghLg');
            }
        ),
        new Command('ping', ['ping'], 0.5, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat('@' + utils.getUserUsername() + ' pong!');
            }
        ),
        new Command('pong', ['pong'], 0.5, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat('@' + utils.getUserUsername() + ' ping!');
            }
        ),
        new Command('english', ['english', 'eng'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' Please stick to English in this room, doing otherwise will result in a mute.');
            }
        ),
        new Command('shush', ['shush', 'sush', 'noskip', 'noskiperino'], 1, ['vip'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' ' + getShushMessage());
            }
        ),
        new Command('videocheck', ['videocheck'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                var videoStr = 'a video', queryString = '';
                if(utils.getCommandArguments()[0]) {
                    var videoID = utils.getCommandArguments()[0].match(youtubeURLRegexp);
                    if(videoID) videoID = videoID[1];
                    else videoID = utils.getCommandArguments()[0];
                    videoStr = 'that video';
                    queryString = '?ytid=' + videoID;
                } else if(utils.BOT.getMedia() && utils.getMediaType() === 'youtube' && utils.getMediaFkid()) {
                    videoStr = 'current video';
                    queryString = '?ytid=' + utils.getMediaFkid();
                }
                utils.BOT.sendChat('@' + utils.getUserUsername() + ' ' + util.format('Check if %s is available on any country at https://polsy.org.uk/stuff/ytrestrict.cgi%s', videoStr, queryString));
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
                            if(XOR(username.toLowerCase() == utils.BOT.getSelf().username.toLowerCase(), username2.toLowerCase() == utils.BOT.getSelf().username.toLowerCase())) {
                                username = utils.BOT.getSelf().username;
                            }
                        }
                        else if(username2.toLowerCase() == utils.BOT.getSelf().username.toLowerCase()) {
                            utils.BOT.sendChat("@" + utils.getUserUsername() + " I love " + username + " 100%.");
                            return;
                        }
                        else if(username.toLowerCase() == utils.BOT.getSelf().username.toLowerCase()) {
                            utils.BOT.sendChat("@" + utils.getUserUsername() + " I love " + username2 + " 100%.");
                            return;
                        }
                    }
                    if(username.toLowerCase() == utils.getUserUsername().toLowerCase() && username2.toLowerCase() == utils.getUserUsername().toLowerCase()) {
                        utils.BOT.sendChat("@" + utils.getUserUsername() + " well I don't know.... how much do you love yourself?");
                        return;
                    }
                    else if(username.toLowerCase() == utils.BOT.getSelf().username.toLowerCase()) {
                        utils.BOT.sendChat('@' + utils.getUserUsername() + " of course I love you 100%, silly <3");
                        return;
                    }

                    seedrandom(username.hashCode() + username2.hashCode(), { global: true });
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' there is ' + Math.dice(100) + '% of <3 between ' + username2 + ' and ' + username);
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
        // Mod command only no cooldown needed : require mute
        new Command('kick', ['kick'], 0, [], ['kick'],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                processAndDoPunish(utils, 'kick');
            }
        ),
        new Command('lastplayed', ['lastplayed', 'history'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                var fkid;
                if(utils.getCommandArguments().length) {
                    fkid = utils.getCommandArguments()[0].match(youtubeURLRegexp);
                    if(fkid) fkid = fkid[1];
                    else fkid = utils.getCommandArguments()[0];
                } else if(utils.BOT.getMedia()) {
                    fkid = utils.getMediaFkid();
                } else {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' no song is playing right now.');
                    return;
                }

                utils.redisManager.getLastSongTime(fkid, function(result) {
                    var msg = (fkid ? 'That' : 'This') + ' video/song has not played in the past 5 weeks. It could never have played before, is a re-upload, or a remix.';
                    if(result)
                        msg = (fkid ? 'That' : 'This') + ' video/song was last played ' + moment(parseInt(result)).from(Date.now()) + '.';
                    utils.BOT.sendChat(msg);
                });
            }
        ),
        new Command('commands', ['commands'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' A command list can be found here: https://git.io/v1nPT');
            }
        ),
        new Command('setcd', ['setcd', 'setcooldown', 'cooldown'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments()[0] == undefined) {
                    var output = utils.settingsManager.getCooldown();
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' current command cooldown is of ' + output + ' second' + (output === 1 ? '' : 's') + '.');
                    return 1;
                }
                var input = parseInt(utils.getCommandArguments()[0]);
                if(!isNaN(input)) {
                    utils.settingsManager.setCooldown(input);
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' set cooldown to ' + input + ' second' + (input === 1 ? '' : 's') + '.');
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
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' current image removal time is of ' + output + ' second' + (output === 1 ? '' : 's') + '.');
                    return 1;
                }
                var input = parseInt(utils.getCommandArguments()[0]);
                if(!isNaN(input)) {
                    utils.settingsManager.setImgTime(input);
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' set image removal time to ' + input + ' second' + (input === 1 ? '' : 's') + '.');
                }
            }
        ),
        new Command('imgspamamount', ['setimgspamamount', 'imgspamamount', 'imagespamamount'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments()[0] == undefined) {
                    var output = utils.settingsManager.getImgRemoveSpamAmount();
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' current max amount of images on a single thread is ' + output + '.');
                    return 1;
                }
                var input = parseInt(utils.getCommandArguments()[0]);
                if(!isNaN(input)) {
                    utils.settingsManager.setImgRemoveSpamAmount(input);
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' set max amount of images on a single thread to ' + input + '.');
                }
            }
        ),
        new Command('imgspamtime', ['setimgspamtime', 'imgspamtime', 'imagespamtime'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments()[0] == undefined) {
                    var output = utils.settingsManager.getImgRemoveSpamTime();
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' users are getting muted if they exceed the max amount of images on a single thread for ' + output + ' minute' + (output === 1 ? '' : 's') + '.');
                    return 1;
                }
                var input = parseInt(utils.getCommandArguments()[0]);
                if(!isNaN(input)) {
                    utils.settingsManager.setImgRemoveSpamTime(input);
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' users will now get muted for ' + input + ' minute' + (input === 1 ? '' : 's') + ' for exceeding the max amount of images on a single thread');
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
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' current amount of dubs for images is of ' + output + ' dub' + (output === 1 ? '' : 's') + '.');
                    return 1;
                }
                var input = parseInt(utils.getCommandArguments()[0]);
                if(!isNaN(input)) {
                    utils.settingsManager.setImgDubsAmount(input);
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' set the amount of dubs for images to ' + input);
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
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' users are getting muted if they don\`t meet the required amount of dubs for ' + output + ' minute' + (output === 1 ? '' : 's') + '.');
                    return 1;
                }
                var input = parseInt(utils.getCommandArguments()[0]);
                if(!isNaN(input)) {
                    utils.settingsManager.setImgRemoveMuteTime(input);
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' users will now get muted for ' + input + ' minute' + (input === 1 ? '' : 's') + ' for not meeting the required amount of dubs.');
                }
            }
        ),
        new Command('skip', ['skip'], 0, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.moderateDeleteChat(utils.getId());
                utils.botUtils.timeMute(utils.getUser(), null, 5, true);
                utils.BOT.sendChat(`@${utils.getUserUsername()} ${getShushMessage()}`);
            }
        ),
        new Command('clear', ['clear', 'laggy'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' You can clear you chat if it gets too laggy. https://i.imgur.com/D1T64mP.gif');
            }
        ),
        new Command('androidapp', ['android', 'androidapp', 'androidapk'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' Unofficial Android app (sorry iOS users) for Dubtrack: https://play.google.com/store/apps/details?id=co.mar974.dubtrackfm | Thank mar974 :D');
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
                        utils.BOT.sendChat(utils.getTargetName() + ' no cat facts found :(');
                    },
                    function(fact) {
                        var waysOfSayingIt = [
                            '%u Cat fact: %f.',
                            '%u Did you know: %f?',
                            '%u Have you heard? %f.'
                        ];
                        waysOfSayingIt = waysOfSayingIt[Math.dice(waysOfSayingIt.length)];
                        utils.BOT.sendChat(waysOfSayingIt.replace('%u', utils.getTargetName()).replace('%f', fact));
                    }
                );
            }
        ),
        new Command('animelist', ['anime', 'animes', 'animelist'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' Anime List: https://goo.gl/d4lvua');
                utils.BOT.sendChat('Never_Pause also recommends his animelist: https://goo.gl/h6OoW3');
            }
        ),
        new Command('cookie', ['cookie', 'givecookie'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments().length < 2) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' cookies on display: ' + Object.keys(cookieDisplay).join(', '));
                    return;
                }
                var cookie = cookieDisplay[utils.getCommandArguments()[0].toLowerCase()];
                if(!cookie) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' I don\'t have that cookie on display.');
                    return;
                }
                var target = utils.BOT.getUserByName(utils.getTargetName(2, true));
                if(!target) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' I would give them the cookie but they seem to not be here.');
                    return;
                }
                if(target.id === utils.getUserId()) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' don\'t you already have the cookie? Just eat it!');
                    return;
                }
                if(target.id === utils.BOT.getSelf().id) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' for me :heart_eyes:? Thank you! I\'ll eat this ' + cookie.name + ' now if you don\'t mind :rawrrCookie:');
                    return;
                }
                utils.BOT.sendChat('@' + target.username + ' ' + utils.getUserUsername() + ' gave you a/an ' + cookie.name + ' ' + cookie.emote);
            }
        ),
        new Command('banphraseignorespaces', ['setbanphraseignorespaces', 'banphraseignorespaces', 'setbanphrasesignorespaces', 'banphrasesignorespaces'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.getCommandArguments()[0] == undefined) {
                    var output = utils.settingsManager.getImgRemoveMuteTime();
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' checking for ban phrases is ' + (utils.settingsManager.getBanPhrasesIgnoreSpaces() ? '*not*' : '') + ' ignoring spaces.');
                    return 1;
                }
                var input = /^(?:true|enable|yes|y|on|tick|check|:white_check_mark:|:heavy_check_mark:|:ballot_box_with_check:)$/i.test(utils.getCommandArguments()[0]);
                utils.settingsManager.setBanPhrasesIgnoreSpaces(input);
                utils.BOT.sendChat('@' + utils.getUserUsername() + ' ' + getBanPhrasesIgnoreSpacesMessage(input));
            }
        ),
        new Command('set_banphraseignorespaces', ['setspaces', 'setspace'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.settingsManager.setBanPhrasesIgnoreSpaces(true);
                utils.BOT.sendChat('@' + utils.getUserUsername() + ' ' + getBanPhrasesIgnoreSpacesMessage(true));
            }
        ),
        new Command('unset_banphraseignorespaces', ['unsetspaces', 'unsetspace'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.settingsManager.setBanPhrasesIgnoreSpaces(false);
                utils.BOT.sendChat('@' + utils.getUserUsername() + ' ' + getBanPhrasesIgnoreSpacesMessage(false));
            }
        ),
        new Command('roulette_start', ['roulette', 'roullete'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.rouletteManager.started !== false) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' did you forget the "join" part? There is a roulette running right now!');
                    return;
                }
                utils.redisManager.getLastGameTimestamp('roulette', function(last) {
                    {
                        var now = Date.now(), cooldown = utils.settingsManager.getRouletteCooldown();
                        if(last >= 0 && (now - last) < cooldown) {
                            utils.BOT.sendChat('@' + utils.getUserUsername() + ' hold on! Last roulette was ' + moment(last).fromNow() + '. You must wait ' + (cooldown / 60 / 1000) + ' minute(s) to run the roulette again.');
                            return;
                        }
                    }
                    {
                        var queue = utils.BOT.getQueue();
                        if(queue.length <= 1) {
                            utils.BOT.sendChat('@' + utils.getUserUsername() + ' wow what?! I don\'t see users in queue' + (queue.length === 1 ? ', only that ' + queue[0].user.username + ' guy' : '') + '.');
                            return;
                        }
                    }
                    var duration = utils.settingsManager.getRouletteDuration();
                    if(utils.getCommandArguments()[0]) {
                        duration = parseInt(utils.getCommandArguments()[0]);
                        if(isNaN(duration)) {
                            utils.BOT.sendChat('@' + utils.getUserUsername() + ' that duration you gave me doesn\'t seem like a number.');
                            return;
                        }
                    }

                    var price = utils.settingsManager.getRoulettePrice();
                    if(utils.getCommandArguments()[1]) {
                        price = parseInt(utils.getCommandArguments()[1]);
                        if(isNaN(price)) {
                            utils.BOT.sendChat('@' + utils.getUserUsername() + ' that price you gave me doesn\'t seem like a number.');
                            return;
                        }
                    }

                    utils.BOT.sendChat('*Roulette is starting!* Use `!join` to join in!');
                    utils.BOT.sendChat(`Ends in _${utils.strings.formatMeasure(duration, 'second')}_. | Price to join is of _${utils.strings.formatMeasure(price, 'prop')}_.`);
                    utils.rouletteManager.start(duration, price, function(error, winnerId, oldSpot, newSpot) {
                        if(error) {
                            utils.BOT.sendChat('aaaaand *the rou*-- wait.');
                            switch(error) {
                                default:
                                    utils.BOT.sendChat('Uh oh, something happened! They didn\'t tell me what, but it did something to this roulette.');
                                    break;
                                case 'not-enough-users':
                                    utils.BOT.sendChat('Nobody joined the roulette, now I\'m sad :frowning:.');
                                    break;
                                case 'spot-lower-than-zero':
                                    utils.BOT.sendChat('Uh oh. Apparently my algorithm is wrong, because I was about to move someone to spot #' + newSpot + '!');
                                    break;
                                case 'spot-higher-than-queue-length':
                                    utils.BOT.sendChat('Uh oh. Apparently my algorithm is wrong, because I was about to move someone above the size of the queue!');
                                    break;
                            }
                            return;
                        }

                        var movedMsg = Math.abs(oldSpot - newSpot);
                        if(oldSpot === newSpot) {
                            movedMsg = 'same as before :confused:';
                        } else {
                            movedMsg += ' spot' + (movedMsg !== 1 ? 's' : '') + ' ' + (oldSpot > newSpot ? 'above! :SeemsGood:' : 'below :frowning:');
                        }

                        utils.BOT.sendChat('aaaaand *the roulette is over*!');
                        utils.BOT.sendChat('Our lucky winner is @' + utils.BOT.getUser(winnerId).username + '! You\'ll be moved to spot #' + (newSpot + 1) + ' in queue (' + movedMsg + ').');
                        utils.BOT.moderateMoveDJ(winnerId, newSpot);
                    });
                    console.logGameStart(
                        'roulette', utils.getUser(),
                        [
                            `Duration: ${duration} second${duration - 1 ? 's' : ''}`,
                            `Price: ${price} prop${price - 1 ? 's' : ''}`
                        ]
                    );
                });
            }
        ),
        new Command('roulette_join', ['join', 'roulettejoin'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.rouletteManager.started === false) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' I\'m not running a roulette right now.');
                    return;
                }
                if(utils.BOT.getQueuePosition(utils.getUserId()) === -1) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' you are not in queue!');
                    return;
                }
                if(utils.rouletteManager.listedUsers.indexOf(utils.getUserId()) >= 0) {
                    return;
                }
                utils.redisManager.getProps(utils.getUserId(), function(propsCount) {
                    if(typeof propsCount === 'undefined' || isNaN(propsCount)) propsCount = 0;
                    if(propsCount < utils.rouletteManager.currentPrice) {
                        utils.BOT.sendChat('@' + utils.getUserUsername() + ' you\'re low in props! Sorry :S');
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
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' I\'m not running a roulette right now.');
                    return;
                }
                if(utils.rouletteManager.forceStop()) {
                    utils.BOT.sendChat('Hold your typing! ' + utils.getUserUsername() + ' *stopped the roulette*.');
                }
            }
        ),
        new Command('roulette_check', ['roulettecheck', 'roulette_check'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.rouletteManager.started !== false) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' a roulette is running right now, silly!');
                    return;
                }
                utils.redisManager.getLastGameTimestamp('roulette', function(last) {
                    var now = Date.now(), cooldown = utils.settingsManager.getRouletteCooldown();
                    if(last >= 0 && (now - last) < cooldown) {
                        utils.BOT.sendChat('@' + utils.getUserUsername() + ' last roulette was ' + moment(last).fromNow() + '. You will be able to run a roulette in ' + moment(last + cooldown).diff(now, 'minutes') + ' minute(s).');
                    } else {
                        utils.BOT.sendChat('@' + utils.getUserUsername() + ' more than ' + (cooldown / 60 / 1000) + ' minute(s) has passed, go ahead to run that command!')
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
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' spot doesn\'t seem like a number.');
                    return;
                }
                {
                    var queue = utils.BOT.getQueue();
                    if(spot >= queue.length) {
                        spot = queue.length;
                    } else if(spot <= 0) {
                        spot = 1;
                    }
                }
                {
                    var username = user;
                    if(!(user = utils.BOT.getUserByName(username, true))) {
                        utils.BOT.sendChat('@' + utils.getUserUsername() + ' ' + username + ' is not online.');
                        return;
                    }
                }
                if(utils.BOT.getQueuePosition(user.id) === spot - 1) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' ' + (utils.getUserId() === user.id ? 'you are' : 'user') + ' already on that spot!');
                    return;
                }
                utils.BOT.moderateMoveDJ(user.id, spot - 1, function() {
                    utils.BOT.sendChat('@' + user.username + ' you got moved to spot #' + spot + ' in queue.');
                });
            }
        ),
        new Command('export_youtube', ['export', 'exportyoutube', 'exportyt', 'exporttoyoutube', 'exporttoyt'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' How to export a playlist to YouTube: https://imgur.com/a/VVoFV');
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
                        var message;
                        if(!err) {
                            var stream = body.stream;
                            if(stream)
                                message = user + ' is currently *Streaming*  ' + stream.game + ' at ' + stream.channel.url;
                            else message = user + ' is currently *Offline*, https://www.twitch.tv/' + channel.toLowerCase();
                        } else message = user + ' is not a valid TwitchTV Channel name/is not in the list.';
                        utils.BOT.sendChat(message);
                    });
                }

                doListCommand({
                        showListMessage: 'Pick a streamer from the list: %s or _ALL_ (resident-dj+)',
                        showListArgumentName: 'streamer',
                        list: {
                            'Snaky': 'SnakyLUL',
                            'Frosolf': 'frosolf',
                            'The_kineese': 'the_kineese',
                            'Lord_eRazor': 'Gustavknas',
                            'TheHaremKing': 'dubx_theharemking',
                            'DemoZ': 'KRDemoZ',
                            'Erikku-kun': 'DCIErikku',
                            'Juunix': 'Juunix0'
                        },
                    },
                    function(selectedName, list) {
                        if(selectedName.toUpperCase() === 'ALL' && utils.botUtils.checkRole(utils.getUser(), 'resident-dj')) {
                            Object.keys(list).forEach(function(user) {
                                // Ohh the spam
                                fetchStreamerAndSendMessage(user, list[user]);
                            });
                        } else fetchStreamerAndSendMessage(selectedName, selectedName)
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
                utils.BOT.sendChat(utils.getTargetName() + ' Feel free to join our own Discord Server: https://discord.gg/tQgSvdq');
            }
        ),
        new Command('repository', ['repository', 'repo'], 1, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                utils.BOT.sendChat(utils.getTargetName() + ' You can find my GitHub repository here: https://git.io/vSIuM');
            }
        ),
        new Command('scramble_start', ['scramble', 'scrambleword', 'scrable_start'], 1, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.scrambleManager.started !== false) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' I\'m running a scramble right now!');
                    return;
                }
                utils.redisManager.getLastGameTimestamp('scramble', function(last) {
                    {
                        var now = Date.now(), cooldown = utils.settingsManager.getScrambleCooldown();
                        if(last >= 0 && (now - last) < cooldown) {
                            utils.BOT.sendChat('@' + utils.getUserUsername() + ' hold on! Last scramble was ' + moment(last).fromNow() + '. You must wait ' + (cooldown / 60 / 1000) + ' minute(s) to run the scramble again.');
                            return;
                        }
                    }
                    var duration = utils.settingsManager.getScrambleDuration();
                    if(utils.getCommandArguments()[0]) {
                        duration = parseInt(utils.getCommandArguments()[0]);
                        if(isNaN(duration)) {
                            utils.BOT.sendChat('@' + utils.getUserUsername() + ' that duration you gave me doesn\'t seem like a number.');
                            return;
                        }
                    }
                    var reward = utils.settingsManager.getScrambleReward();
                    if(utils.getCommandArguments()[1]) {
                        reward = parseInt(utils.getCommandArguments()[1]);
                        if(isNaN(reward)) {
                            utils.BOT.sendChat('@' + utils.getUserUsername() + ' the reward amount you gave me doesn\'t seem like a number.');
                            return;
                        }
                    }
                    var wordLengthRange = [8, 12];
                    if(utils.getCommandArguments()[2]) {
                        var match = utils.getCommandArguments()[2].match(/^(\d+)(?:,|-)(\d+)$/);
                        if(match) {
                            wordLengthRange[0] = match[1];
                            wordLengthRange[1] = match[2];
                        } else {
                            var wordLength = parseInt(utils.getCommandArguments()[2]);
                            if(isNaN(wordLength)) {
                                utils.BOT.sendChat('@' + utils.getUserUsername() + ' the word length you gave me doesn\'t seem like a number.');
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
                        const letterAmount = scrambledWord.length;
                        [
                            `*Scramble started!* Try to unscramble the word _${scrambledWord}_ (${utils.strings.formatMeasure(letterAmount, 'letter')}) with \`!guess [word]\``,
                            `Ends in _${utils.strings.formatMeasure(duration, 'second')}_. | Reward is of _${utils.strings.formatMeasure(reward, 'prop')}_.`,
                            '> https://www.wordnik.com/img/wordnik_badge_a2.png'
                        ].forEach((message) => utils.BOT.sendChat(message));
                        console.logGameStart(
                            'scramble', utils.getUser(),
                            [
                                `Duration: ${utils.strings.formatMeasure(duration, 'second')}`,
                                `Reward: ${utils.strings.formatMeasure(reward, 'prop')}`,
                                `Word length: ${utils.strings.formatMeasure(letterAmount, 'letter')}`
                            ]
                        );
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
                            utils.BOT.sendChat('@' + utils.getUserUsername() + ' ' + errorMessage);
                            return;
                        }
                        utils.BOT.sendChat(`*Scramble ended!* The word was _${word}_ // https://www.wordnik.com/words/${word}`);
                    });
                });
            }
        ),
        new Command('scramble_guess', ['guess', 'descramble', 'unscramble', 'scrambleguess', 'scramble_guess'], 0, [], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.scrambleManager.started === false) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' I\'m not running a scramble right now.');
                    return;
                }
                const guess = utils.getCommandArguments()[0];
                if(!guess)
                    return;
                if(utils.scrambleManager.guess(utils.getUserId(), guess)) {
                    const word = utils.scrambleManager.word;
                    utils.BOT.sendChat(`*Scramble ended!* @' + utils.getUserUsername() + ' guessed the word, which was _${word}_ // https://www.wordnik.com/words/${word} .`);
                }
            }
        ),
        new Command('scramble_stop', ['scramblestop', 'scramble_stop'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.scrambleManager.started === false) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' I\'m not running a scramble right now.');
                    return;
                }
                if(utils.scrambleManager.forceStop()) {
                    const word = utils.scrambleManager.word;
                    utils.BOT.sendChat(`Stop guessing! ${utils.getUserUsername()} *stopped the scramble*. The word was _${word}_ // https://www.wordnik.com/words/${word} .`);
                }
            }
        ),
        new Command('scramble_check', ['scramblecheck', 'scramble_check'], 0, ['mod'], [],
            /**
             * @param {MessageUtils} utils
             */
            function(utils) {
                if(utils.scrambleManager.started !== false) {
                    utils.BOT.sendChat('@' + utils.getUserUsername() + ' a scramble is running right now, silly!');
                    return;
                }
                utils.redisManager.getLastGameTimestamp('scramble', function(last) {
                    var now = Date.now(), cooldown = utils.settingsManager.getScrambleCooldown();
                    if(last >= 0 && (now - last) < cooldown) {
                        utils.BOT.sendChat('@' + utils.getUserUsername() + ' last scramble was ' + moment(last).fromNow() + '. You will be able to run a scramble in ' + moment(last + cooldown).diff(now, 'minutes') + ' minute(s).');
                    } else {
                        utils.BOT.sendChat('@' + utils.getUserUsername() + ' more than ' + (cooldown / 60 / 1000) + ' minute(s) has passed, go ahead to run that command!')
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
        utils.BOT.sendChat('@' + utils.getUserUsername() + ' ' + util.format(listInfo.showListMessage, Object.keys(listInfo.list).join(', ')));
        utils.BOT.sendChat('Do `!' + command.names[0] + ' <' + listInfo.showListArgumentName + '>' + '` to get the link.');
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
            utils.BOT.sendChat(utils.getTargetName(2) + ' ' + util.format(listInfo.showSelectedMessage, selected) + listInfo.list[selected]);
        }
    } else {
        if(typeof showNotFoundFunk === 'function') {
            showNotFoundFunk(utils.getCommandArguments()[0], listInfo.list);
        }
    }
}

function doProps(utils, commandManager) {
    if(!utils.currentDJ) {
        utils.BOT.sendChat('@' + utils.getUserUsername() + ' there is no song to prop!');
        commandManager.setUserOnCooldown(utils, this, utils.settingsManager.getCooldown());
        return;
    }
    if(utils.getUserId() === utils.currentDJ.id) {
        utils.BOT.sendChat('@' + utils.getUserUsername() + ' we know you love your song, but let others also prop you!');
        commandManager.setUserOnCooldown(utils, this, utils.settingsManager.getCooldown());
        return;
    }
    utils.propsManager.addProp(utils.getUserId());
}

function processAndDoPunish(utils, type) {
    const username = utils.getTargetName(undefined, true);
    const punished = utils.BOT.getUserByName(username, true);
    const mod = utils.getUser();
    if(punished) {
        let time = parseFloat(utils.getCommandArguments()[1]);
        if(isNaN(time)) {
            time = 5;
        }
        switch(type) {
            default:
                utils.BOT.sendChat("Something happened! D:");
                return;
            case 'ban':
                utils.botUtils.timeBan(punished, mod, time, false);
                break;
            case 'mute':
                utils.botUtils.timeMute(punished, mod, time, true);
                break;
            case 'timeout':
                utils.botUtils.timeoutUser(punished, mod, time, true);
                break;
            case 'kick':
                utils.botUtils.kickUser(punished, mod, false);
                break;
        }
    }
    else {
        utils.BOT.sendChat("No user found by the name " + username + ".")
    }
}

function getShushMessage() {
    return ':NoSkip: (Click for better quality) https://i.imgur.com/05NVq0h.png';
}

function getBanPhrasesIgnoreSpacesMessage(input) {
    return 'while checking for ban phrases I will ' + (input ? 'ignore spaces from now on' : 'not ignore spaces') + '.'
}

module.exports = regCommands;
