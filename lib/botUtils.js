'use strict';

var BotUtils = function (bot) {
    this.bot = bot;
    return this;
};

function timePunish(banData) {
    let bot = this.bot;
    let user = banData.user;
    let time = banData.time ? banData.time : false;
    let message = banData.message ? banData.message : false;
    let type = banData.type;
    let logMessage = 'User: ' + user.username + ' (' + user.id + ') was ' + type + 'ed' + (time ? (' for ' + time + ' minutes') : '') + '.';

    var residentDJRoleId = bot.roles['resident-dj'].id;
    var wasResidentDJ = false;

    function doPunish() {
        function giveResidentDJBack() {
            if (wasResidentDJ) {
                bot.moderateSetRole(user.id, residentDJRoleId);
                console.log('setting resident-dj back to user ' + user.username + ' (' + user.id + ') to ' + type);
            }
        }

        switch (type) {
            default:
                return;
            case 'ban':
                if (time) {
                    bot.moderateBanUser(user.id, time, setTimeout.bind(undefined, giveResidentDJBack, 1500));
                }
                else {
                    bot.moderateBanUser(user.id, 0, setTimeout.bind(undefined, giveResidentDJBack, 1500));
                }
                break;
            case 'mute':
                bot.moderateMuteUser(user.id, setTimeout.bind(undefined, giveResidentDJBack, 1500));
                setTimeout(function () {
                    bot.moderateUnmuteUser(user.id);
                }, time * 60000); // minutes to milliseconds
                break;
        }
        console.log(logMessage);
        if (typeof (message) === 'string') {
            bot.sendChat(message);
            console.log(message);
        }
        else {
            bot.sendChat(logMessage);
        }
    }

    if (bot.isResidentDJ(user)) {
        wasResidentDJ = true;
        // In case a crash happens, know if we need to give resident-dj back to user by looking at the logs
        console.log('un-setting resident-dj to user ' + user.username + ' (' + user.id + ') to ' + type);
        bot.moderateUnsetRole(user.id, residentDJRoleId, setTimeout.bind(undefined, doPunish, 1500));
    } else {
        setTimeout(doPunish, 1500);
    }
}

BotUtils.prototype.timeMute = function (user, time, message) {
    timePunish.bind(this)({
        user: user,
        time: time,
        message: message,
        type: 'mute',
    });
};

BotUtils.prototype.timeBan = function (user, time, message) {
    timePunish.bind(this)({
        user: user,
        time: time,
        message: message,
        type: 'ban',
    });
};

BotUtils.prototype.banUser = function (user, message) {
    timePunish.bind(this)({
        user: user,
        message: message,
        type: 'ban',
    });
};

BotUtils.prototype.clearUserChat = function (user) {
    var chatHistory = this.bot.getChatHistory();
    var arrayLength = chatHistory.length;
    for (var i = 0; i < arrayLength; i++) {
        if (user.id == chatHistory[i].user.id) {
            this.bot.moderateDeleteChat(chatHistory[i].id);
        }
    }
};

BotUtils.prototype.timeoutUser = function (user, time, message) {
    this.clearUserChat(user);
    this.timeMute(user, time, message)
};

BotUtils.prototype.checkPermission = function (user, permission) {
    let bot = this.bot;
    return bot.hasPermission(user, permission);
};

BotUtils.prototype.checkRole = function (user, role) {
    let bot = this.bot;
    //noinspection FallThroughInSwitchStatementJS
    switch (role.toLowerCase()) {
        case 'resident-dj':
        case '5615feb8e596154fc2000002':
            // RDJ+
            if (bot.isResidentDJ(user)) {
                return true
            }
        case 'vip':
        case '5615fe1ee596154fc2000001':
            // VIP+
            if (bot.isVIP(user)) {
                return true;
            }
        case 'mod':
        case '52d1ce33c38a06510c000001':
            // Mod+
            if (bot.isMod(user)) {
                return true;
            }
        case 'manager':
        case '5615fd84e596150061000003':
            // Manager+
            if (bot.isManager(user)) {
                return true;
            }
        case 'co-owner':
        case '5615fa9ae596154a5c000000':
            // Owner/Creator only
            if (bot.isOwner(user) || bot.isCreator(user)) {
                return true
            }
    }
    return false;
};

module.exports = BotUtils;
