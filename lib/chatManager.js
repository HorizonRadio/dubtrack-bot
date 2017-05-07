'use strict';

const fs = require('fs');
const util = require('util');
const jsonfile = require('jsonfile');
const MessageUtils = require('./messageUtils.js');

class ChatManager {
}

/**
 * @param {MessageUtils} utils
 * @param {CommandManager} commandManager
 */
ChatManager.prototype.processChat = function(utils, commandManager) {
    // clean that chat!
    cleanChat(utils);
    if(utils.reply.stopping()) {
        // if we are done because of the cleaning stop!
        return;
    }
    // Commands
    // Messages that start with ! are commands!
    if(/^!/.test(utils.getMessage())) {
        if(new RegExp('!' + utils.getUserUsername().toLowerCase()).test(utils.getMessage().toLowerCase())) {
            utils.BOT.sendChat('@' + utils.getUserUsername() + ' is awesome!');
            return;
        }
        // !processCommands
        commandManager.processCommand(utils);
        if(utils.reply.stopping()) {
            return;
        }
    }
    // Actions
    if(new RegExp(utils.BOT.getSelf().username, 'gi').test(utils.getMessage())) {
        commandManager.getUserCooldown(utils, function(onCooldown) {
            if(!onCooldown) {
                try {
                    botActionToMention(utils);
                }
                catch(err) {
                    console.error(err);
                }
                if(utils.reply.stopping()) {
                    commandManager.setUserOnCooldown(utils);
                    return;
                }
            }
        });
    }
};

let imageRemovalQueue = [];
ChatManager.prototype.removeFromImageRemovalQueue = function(id) {
    let index = imageRemovalQueue.indexOf(id);
    if(index === -1) {
        return;
    }
    imageRemovalQueue.splice(index, 1);
};

let sameThreadImagesCount = 0;

/**
 * @param {MessageUtils} utils
 */
// This is temp will be replaced with a manager if I find the time
function botActionToMention(utils) {
    /**
     * {DubAPI} utils
     */
    const BOT = utils.BOT;

    let user = utils.getUser();
    let userName = utils.getUserUsername();

    /**
     * Will set to top if message is sent
     *
     * @param message The message to send
     */
    let sendChat = function(message) {
        BOT.sendChat(message);
        utils.reply.stop();
    };

    let actions = [
        {
            test: /are you real/gi,
            action: function() {
                sendChat(util.format('@%s yes I am real.', userName));
            },
        },
        {
            test: /are you human/gi,
            action: function() {
                sendChat(util.format('@%s no, I\'m a robot with AI functionality.', userName));
            }
        },
        {
            test: /how old (?:are|r) (?:you|u)/gi,
            action: function() {
                sendChat(util.format('Well, @%s, I\'ve currently been running for %s.', userName, utils.getRuntimeMessage().replace(" ago", "")));
            }
        },
        {
            test: /gender/gi,
            action: function() {
                sendChat(util.format('@%s I am a duck :rooDuck:', userName));
            }
        },
        {
            test: /cat me please/gi,
            action: function() {
                if(utils.botUtils.checkRole(user, 'mod')) {
                    sendChat(util.format('@%s :nb3three: http://i.imgur.com/FmbuPNe.jpg', userName));
                }
            }
        },
        {
            test: /doge me please/gi,
            action: function() {
                if(utils.botUtils.checkRole(user, 'mod')) {
                    sendChat(util.format('@%s :frankerz: http://themetapicture.com/pic/images/2015/01/12/cute-dog-wrapped-bed-sleeping.jpg', userName));
                }
            }
        },
        {
            test: /o\//g,
            action: function() {
                sendChat(util.format('@%s o/', userName));
            }
        },
        {
            test: /rock|paper|scissors/gi,
            action: function() {
                var rps = ['rock', 'paper', 'scissors'];
                sendChat(util.format('@%s %s', userName, rps[Math.dice(rps.length)]));
            }
        },
        {
            test: /who is a good duck/gi,
            action: function() {
                sendChat(util.format('@%s http://i.imgur.com/7n2qgyW.png (edited by TickingTime)', userName));
            }
        }
    ];

    actions.forEach(function(botAction) {
        if(botAction.test.test(utils.getMessage())) {
            botAction.action();
        }
    });

}

/**
 * @param {MessageUtils} utils
 */
function cleanChat(utils) {
    let cleanFunctions = [
        cleanChatBanPhrases,
        // TODO: Fix and uncomment:
        //cleanChatImageSpam,
        //cleanLastChatImage,
        cleanChatImageTimeout,
        utils.setThisAsLastMessageWithImage.bind(utils),
        cleanChatAdvertisingBan,
        cleanChatAntiCaps,
    ];
    cleanFunctions.forEach(function(chatCleaner) {
        if(utils.reply.continuing()) {
            try {
                chatCleaner(utils);
            }
            catch(err) {
                console.error(err);
            }
        }
    });
}

/**
 * @param {MessageUtils} utils
 */
function cleanChatAntiCaps(utils) {
    if(utils.getUser().dubs > utils.settingsManager.getImgDubsAmount()) {
        return;
    }
    if(utils.botUtils.checkRole(utils.getUser(), 'resident-dj')) {
        return;
    }
    let message = utils.getMessage();
    let upper = message.replace(/[^A-Z]/g, '').length;
    let lower = message.replace(/[^a-z]/g, '').length;
    if(upper > 10 && (upper / (upper + lower)) > 0.5) {
        safeRemoveMessage(utils);
        utils.botUtils.timeMute(
            utils.getUser(), null, 5, 'using a lot of caps',
            () => console.logPunishment('Message matched ' + (upper / (upper + lower)) * 100 + '%')
        );
        utils.reply.stop();
    }
}

/**
 * @param {MessageUtils} utils
 */
function cleanChatBanPhrases(utils) {
    if(utils.botUtils.checkRole(utils.getUser(), 'vip')) {
        // Do not check for vip+
        return;
    }

    var banData = "banphrases.json";
    fs.stat(banData, function(err, stat) {
        var banJSON = jsonfile.readFileSync(banData);
        var phrases = banJSON.banPhrases;

        function checkIfContains(phrase) {
            if(!phrase || phrase === '') {
                return false;
            }
            let regString;
            if(utils.settingsManager.getBanPhrasesIgnoreSpaces()) {
                // This would match fig /(?!\s)(f|\s)+?\s*(?!\s)(i|\s)+?\s*(?!\s)(g|\s)+?/ https://www.debuggex.com/r/FPtcgjHdJv-SlDaS
                regString = '';
                let lastChar = '';
                for(let i = 0; i < phrase.length; i++) {
                    let char = phrase.charAt(i);
                    // Do not check for white space as we do that as it is
                    if(/\S/.test(char) && char !== lastChar) {
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

        for(var key in phrases) {
            if(typeof phrases[key] != 'function') {
                var phrasesList;
                if(Array.isArray(phrases[key].phrase)) {
                    phrasesList = phrases[key].phrase;
                }
                else {
                    phrasesList = [phrases[key].phrase];
                }
                for(var i = 0; i < phrasesList.length; i++) {
                    var phrase = phrasesList[i];
                    if(checkIfContains(phrase)) {
                        safeRemoveMessage(utils);
                        const phraseObj = phrase[key];
                        const isPermanent = typeof phraseObj.banTime === 'string' && /p|perm|permanent/i.test(phraseObj.banTime);
                        const banCallback = () => console.logPunishment('Message sent: ' + utils.getMessage());
                        if(isPermanent)
                            utils.botUtils.banUser(utils.getUser(), null, phraseObj.reason, banCallback)
                        else utils.botUtils.timeBan(utils.getUser(), null, phraseObj.banTime, phraseObj.reason, banCallback)
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
function cleanLastChatImage(utils) {
    if(!utils.hasImages() || !MessageUtils.getLastMessageWithImage())
        return;

    if(utils.getUserId() !== MessageUtils.getLastMessageWithImage().getUserId())
        MessageUtils.getLastMessageWithImage().delete();
}

/**
 * @param {MessageUtils} utils
 */
let reachedImageAmountLimit = false;
function cleanChatImageSpam(utils) {
    let lastMessageWithImage = MessageUtils.getLastMessageWithImage(),
        isSameUserAsBefore = lastMessageWithImage && lastMessageWithImage.getUserId() === utils.getUserId();
    if(!utils.hasImages() || utils.settingsManager.getImgRemoveSpamAmount() < 0)
        return sameThreadImagesCount = isSameUserAsBefore ? sameThreadImagesCount : 0;

    if(utils.getFirstMessageByUser().getId() === utils.getId() || !isSameUserAsBefore) {
        sameThreadImagesCount = utils.getImageAmount();
        if(lastMessageWithImage)
            safeRemoveMessage(lastMessageWithImage);
        return;
    } else sameThreadImagesCount += utils.getImageAmount();

    if(sameThreadImagesCount === parseInt(utils.settingsManager.getImgRemoveSpamAmount())) {
        safeRemoveMessage(utils, () => reachedImageAmountLimit = false);
        reachedImageAmountLimit = true;
        sameThreadImagesCount = 0;
        if(!utils.botUtils.checkRole(utils.getUser(), 'resident-dj'))
            utils.botUtils.timeMute(
                utils.settingsManager.getImgRemoveSpamTime(),
                'User muted for ' + utils.settingsManager.getImgRemoveSpamTime() + ' minutes. Reason: Sending more than ' + utils.settingsManager.getImgRemoveSpamAmount() + ' images in a row.'
            );
    } else if(isSameUserAsBefore && reachedImageAmountLimit)
        safeRemoveMessage(utils); // silent deletion
}

/**
 * @param {MessageUtils} utils
 */
function cleanChatImageTimeout(utils) {
    if(!utils.hasImages())
        return;

    if(
        utils.settingsManager.getImgDubsAmount() >= 0
        && utils.settingsManager.getImgRemoveMuteTime() >= 0
        && utils.getUser().dubs < utils.settingsManager.getImgDubsAmount()
        && !utils.botUtils.checkRole(utils.getUser(), 'resident-dj') // Do not run for Resident-DJ+
    ) {
        safeRemoveMessage(utils);
        utils.botUtils.timeMute(
            utils.settingsManager.getImgRemoveMuteTime(),
            'User muted for ' + utils.settingsManager.getImgRemoveMuteTime() + ' minutes. Reason: Sending Images having less than ' + utils.settingsManager.getImgDubsAmount() + ' dubs.'
        );
        utils.reply.stop();
    }
    if(utils.settingsManager.getImgTime() >= 0) {
        let multiplier = utils.getUserId() == utils.BOT.getSelf().id ? 2 : 1;
        let id = utils.getFirstMessageByUser().getId();
        imageRemovalQueue.push(id);
        setTimeout(function() {
            if(imageRemovalQueue.indexOf(id) === -1) {
                return;
            }
            safeRemoveMessage(utils);
        }, utils.settingsManager.getImgTime() * multiplier * 60000);
    }
}

/**
 * @param {MessageUtils} utils
 */
function cleanChatAdvertisingBan(utils) {
    if(utils.botUtils.checkRole(utils.getUser(), 'mod')) {
        // Do not check for mod+
        return;
    }

    let advertiseMatch = utils.getMessage().match(/(dubtrack\.fm\/join|plug\.dj)\/([a-z0-9-]+)/i);
    if(advertiseMatch) {
        if(utils.BOT.getRoomMeta() &&
            advertiseMatch[1] === 'dubtrack.fm/join' &&
            advertiseMatch[2].toLowerCase() === utils.BOT.getRoomMeta().roomUrl) {
            return;
        }
        safeRemoveMessage(utils);
        utils.botUtils.banUser(utils.getUser(), null, 'advertising another DubtrackFM/Plug.DJ room');
        utils.reply.stop();
    }
}

/**
 * @param {MessageUtils} utils
 * @param {Function} [callback]
 */
function safeRemoveMessage(utils, callback) {
    let deletes = 0;
    function deleteCallback() {
        deletes++;
        if(deletes > 2 && callback)
            callback();
    }

    utils.getFirstMessageByUser().delete(deleteCallback);
    utils.delete(deleteCallback); // fallback in case someone joined while the messages were "mid said"
}

module.exports = ChatManager;
