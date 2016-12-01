'use strict';

var fs = require('fs');
const util = require('util');
var jsonfile = require('jsonfile');

class ChatManager {
}

/**
 * @param {MessageUtils} utils
 * @param {CommandManager} commandManager
 */
ChatManager.prototype.processChat = function (utils, commandManager) {
    // clean that chat!
    cleanChat(utils);
    if (utils.reply.stopping()) {
        // if we are done because of the cleaning stop!
        return;
    }
    // Commands
    // Messages that start with ! are commands!
    if (/^!/.test(utils.getMessage())) {
        if (new RegExp('!' + utils.getUserUsername().toLowerCase()).test(utils.getMessage().toLowerCase())) {
            utils.bot.sendChat('@' + utils.getUserUsername() + ' is awesome!');
            return;
        }
        // !processCommands
        commandManager.processCommand(utils);
        if (utils.reply.stopping()) {
            return;
        }
    }
    // Actions
    if (new RegExp(utils.bot.getSelf().username, 'gi').test(utils.getMessage())) {
        commandManager.getUserCooldown(utils, function (onCooldown) {
            if (!onCooldown) {
                try {
                    botActions(utils);
                }
                catch (err) {
                    console.error(err);
                }
                if (utils.reply.stopping()) {
                    commandManager.setUserOnCooldown(utils);
                    return;
                }
            }
        });
    }
};

var imageRemovalQueue = [];
ChatManager.prototype.removeFromImageRemovalQueue = function (id) {
    var index = imageRemovalQueue.indexOf(id);
    if (index === -1) {
        return;
    }
    imageRemovalQueue.splice(index, 1);
};

/**
 * @param {MessageUtils} utils
 */
// This is temp will be replaced with a manager if I find the time
function botActions(utils) {
    /**
     * {DubAPI} utils
     */
    const bot = utils.bot;

    let user = utils.getUser();
    let userName = utils.getUserUsername();

    /**
     * Will set to top if message is sent
     *
     * @param message The message to send
     */
    let sendChat = function (message) {
        bot.sendChat(message);
        utils.reply.stop();
    };

    let actions = [
        {
            test: /are you real/gi,
            action: function () {
                sendChat(util.format('@%s yes I am real.', userName));
            },
        },
        {
            test: /are you human/gi,
            action: function () {
                sendChat(util.format('@%s no, I\'m a robot with AI functionality.', userName));
            }
        },
        {
            test: /are you a fan of (?:nightblue3|nb3|nb)/gi,
            action: function () {
                sendChat(util.format('@%s  I love NB3 <3!', userName));
            }
        },
        {
            test: /how old are you/gi,
            action: function () {
                sendChat(util.format('Well, @%s, I\'ve currently been running for %s.', userName, utils.getRuntimeMessage().replace(" ago", "")));
            }
        },
        {
            test: /gender/gi,
            action: function () {
                sendChat(util.format('@%s I am a female.', userName));
            }
        },
        {
            test: /cat me please/gi,
            action: function () {
                if (utils.botUtils.checkRole(user, 'mod')) {
                    sendChat(util.format('@%s :nb3three: http://i.imgur.com/FmbuPNe.jpg', userName));
                }
            }
        },
        {
            test: /doge me please/gi,
            action: function () {
                if (utils.botUtils.checkRole(user, 'mod')) {
                    sendChat(util.format('@%s :frankerz: http://themetapicture.com/pic/images/2015/01/12/cute-dog-wrapped-bed-sleeping.jpg', userName));
                }
            }
        },
        {
            test: /o\//g,
            action: function () {
                sendChat(util.format('@%s o/', userName));
            }
        },
        {
            test: /rock|paper|scissors/gi,
            action: function () {
                var rps = ['rock', 'paper', 'scissors'];
                sendChat(util.format('@%s %s', userName, rps[Math.dice(rps.length)]));
            }
        },
        {
            test: /good (?:girl|bot)/gi,
            action: function () {
                if (utils.botUtils.checkRole(user, 'mod')) {
                    var comics = [
                        'https://i.imgur.com/G8Q9mL9.png',
                        'https://i.imgur.com/XErCm6C.png (edited by TickingTime)',
                        'https://i.imgur.com/zue7Zib.png (edited by TickingTime)',
                        'https://i.imgur.com/dJxJhHe.png (edited by TickingTime)'
                    ];
                    sendChat(util.format('@%s %s', userName, comics[Math.dice(comics.length)]));
                }
            }
        },
    ];

    actions.forEach(function (botAction) {
        if (botAction.test.test(utils.getMessage())) {
            botAction.action();
        }
    });

}

/**
 * @param {MessageUtils} utils
 */
function cleanChat(utils) {
    var cleanFunctions = [
        cleanChatBanPhrases,
        cleanChatImageTimeout,
        cleanChatAdvertisingBan,
        cleanChatAntiCaps,
    ];
    cleanFunctions.forEach(function (chatCleaner) {
        if (utils.reply.continuing()) {
            try {
                chatCleaner(utils);
            }
            catch (err) {
                console.error(err);
            }
        }
    });
}

/**
 * @param {MessageUtils} utils
 */
function cleanChatAntiCaps(utils) {
    if (utils.getUser().dubs > utils.settingsManager.getImgDubsAmount()) {
        return;
    }
    if (utils.botUtils.checkRole(utils.getUser(), 'resident-dj')) {
        return;
    }
    let message = utils.getMessage();
    let upper = message.replace(/[^A-Z]/g, '').length;
    let lower = message.replace(/[^a-z]/g, '').length;
    if (upper > 10 && (upper / (upper + lower)) > 0.5) {
        safeRemoveMessage(utils);
        utils.botUtils.timeMute(utils.getUser(), 5, 'User muted: User needs to calm down.');
        console.log('User Message: ' + utils.getMessage());
        console.log('Message matched ' + (upper / (upper + lower)) * 100 + '%');
        utils.reply.stop();
    }
}

/**
 * @param {MessageUtils} utils
 */
function cleanChatBanPhrases(utils) {
    if (utils.botUtils.checkRole(utils.getUser(), 'vip')) {
        // Do not check for vip+
        return;
    }

    var banData = "banphrases.json";
    fs.stat(banData, function (err, stat) {
        var banJSON = jsonfile.readFileSync(banData);
        var phrases = banJSON.banPhrases;

        function checkIfContains(phrase) {
            if (!phrase || phrase === '') {
                return false;
            }
            let regString;
            if (utils.settingsManager.getBanPhrasesIgnoreSpaces()) {
                // This would match fig /(?!\s)(f|\s)+?\s*(?!\s)(i|\s)+?\s*(?!\s)(g|\s)+?/ https://www.debuggex.com/r/FPtcgjHdJv-SlDaS
                regString = '';
                let lastChar = '';
                for (let i = 0; i < phrase.length; i++) {
                    let char = phrase.charAt(i);
                    // Do not check for white space as we do that as it is
                    if (/\S/.test(char) && char !== lastChar) {
                        regString += '(?!\\s)(' + char + '|\\s)+?\\s*';
                        lastChar = char;
                    }
                }
                // remove the +\s* if it is at the end
                regString = regString.replace(/\+\\s\*$/, '');
            }
            var phraseTest = new RegExp(regString || phrase, 'gi');
            return phraseTest.test(utils.getMessage());
        }

        for (var key in phrases) {
            if (typeof phrases[key] != 'function') {
                var phrasesList;
                if (Array.isArray(phrases[key].phrase)) {
                    phrasesList = phrases[key].phrase;
                }
                else {
                    phrasesList = [phrases[key].phrase];
                }
                for (var i = 0; i < phrasesList.length; i++) {
                    var phrase = phrasesList[i];
                    if (checkIfContains(phrase)) {
                        safeRemoveMessage(utils);
                        if (typeof phrases[key].banTime === 'string' && /p|perm|permanent/i.test(phrases[key].banTime)) {
                            utils.botUtils.banUser(utils.getUser(), "User banned. Reason: " + phrases[key].reason);
                        }
                        else {
                            utils.botUtils.timeBan(utils.getUser(), phrases[key].banTime, "User banned. Reason: " + phrases[key].reason);
                        }
                        console.log('User Message: ' + utils.getMessage());
                        utils.reply.stop();
                        break;
                    }
                }
            }
        }
    });
}

/**
 * @param {MessageUtils} utils
 */
function cleanChatImageTimeout(utils) {
    var re = /(.*)http(s?):\/\/.+\.(gif|png|jpg|jpeg)(.*)/i;
    if (re.test(utils.getMessage().toLowerCase())) {
        // Do not run for rdj+
        if (
            utils.settingsManager.getImgDubsAmount() >= 0
            && utils.settingsManager.getImgRemoveMuteTime() >= 0
            && utils.getUser().dubs < utils.settingsManager.getImgDubsAmount()
            && !utils.botUtils.checkRole(utils.getUser(), 'resident-dj')
        ) {
            safeRemoveMessage(utils);
            utils.timeMuteUser(
                utils.settingsManager.getImgRemoveMuteTime(),
                'User muted for ' + utils.settingsManager.getImgRemoveMuteTime() + ' minutes. Reason: Sending Images having less than ' + utils.settingsManager.getImgDubsAmount() + ' dubs.'
            );
            utils.reply.stop();
        }
        if (utils.settingsManager.getImgTime() >= 0) {
            // imageRemovalQueue
            var multiplier = utils.getUserId() == utils.bot.getSelf().id ? 2 : 1;
            var id = utils.getFirstMessageByUser().getId();
            imageRemovalQueue.push(id);
            setTimeout(function () {
                if (imageRemovalQueue.indexOf(id) === -1) {
                    return;
                }
                safeRemoveMessage(utils);
            }, utils.settingsManager.getImgTime() * multiplier * 1000);
        }
    }
}

/**
 * @param {MessageUtils} utils
 */
function cleanChatAdvertisingBan(utils) {
    if (utils.botUtils.checkRole(utils.getUser(), 'mod')) {
        // Do not check for mod+
        return;
    }

    var advertiseMatch = utils.getMessage().match(/(dubtrack\.fm\/join|plug\.dj)\/([a-z0-9-]+)/i);
    if (advertiseMatch) {
        if (advertiseMatch[1] === 'dubtrack.fm/join' && advertiseMatch[2].toLowerCase() === 'nightblue3') {
            return;
        }
        safeRemoveMessage(utils);
        utils.botUtils.banUser(utils.getUser(), 'User banned. Reason: Advertising another DubTrack room.');
        utils.reply.stop();
    }
}

/**
 * @param {MessageUtils} utils
 */
function safeRemoveMessage(utils) {
    utils.bot.moderateDeleteChat(utils.getFirstMessageByUser().getId());
    utils.bot.moderateDeleteChat(utils.getId()); // fallback in case someone joined while the messages were "mid said"
}

module.exports = ChatManager;
