'use strict';

const WAIT_MAGIC_NUMBER = 1500;

const BotUtils = function(BOT, strings) {
    this.BOT = BOT;
    this.strings = strings;
    return this;
};

function punishUser(punishData) {
    const BOT = this.BOT;
    const strings = this.strings;
    const user = punishData.user;
    const mod = punishData.mod;
    const time = punishData.time ? punishData.time : false;
    const withMessage = punishData.withMessage;
    const type = punishData.type;

    const residentDJRoleId = BOT.roles['resident-dj'].id;
    let wasResidentDJ = false;

    const waitAndDoPunishment = () => setTimeout(function() {
        const waitAndAttemptToSetBackResidentDJ = () => setTimeout(function() {
            if(!wasResidentDJ)
                return;
            BOT.moderateSetRole(
                user.id,
                residentDJRoleId,
                () => console.warn(`${strings.formatUser(user)} got his Resident-DJ back`)
            );
        }, WAIT_MAGIC_NUMBER);

        switch(type) {
            default:
                return;
            case 'ban':
                if(time) {
                    BOT.moderateBanUser(user.id, time, waitAndAttemptToSetBackResidentDJ);
                }
                else {
                    BOT.moderateBanUser(user.id, 0, waitAndAttemptToSetBackResidentDJ);
                }
                break;
            case 'mute':
                BOT.moderateMuteUser(user.id, waitAndAttemptToSetBackResidentDJ);
                setTimeout(
                    () => BOT.moderateUnmuteUser(user.id),
                    time * 60000 // minutes to milliseconds
                );
                break;
            case 'kick':
                BOT.moderateKickUser(user.id, waitAndAttemptToSetBackResidentDJ);
                break;
        }

        const punishmentStringArgs = [type, user, mod, time];
        console.logPunishment.apply(console, punishmentStringArgs);
        if(withMessage)
            BOT.sendChat(strings.formatPunishmentForChat.apply(strings, punishmentStringArgs));
    }, WAIT_MAGIC_NUMBER);

    if(BOT.isResidentDJ(user)) {
        wasResidentDJ = true;
        BOT.moderateUnsetRole(
            user.id,
            residentDJRoleId,
            function() {
                // In case a crash happens, know if we need to give Resident-DJ back to user by looking at the logs
                console.warn(`Removed Resident-DJ role from ${strings.formatUser(user)}`);
                waitAndDoPunishment();
            });
    } else waitAndDoPunishment();
}

BotUtils.prototype.timeMute = function(user, mod, time, withMessage) {
    punishUser.call(this, {
        type: 'mute',
        user,
        mod,
        time,
        withMessage
    });
};

BotUtils.prototype.timeBan = function(user, mod, time, withMessage) {
    punishUser.call(this, {
        type: 'ban',
        user,
        mod,
        time,
        withMessage
    });
};

BotUtils.prototype.banUser = function(user, mod, withMessage) {
    punishUser.call(this, {
        type: 'ban',
        user,
        mod,
        withMessage
    });
};

BotUtils.prototype.kickUser = function(user, mod, withMessage) {
    punishUser.call(this, {
        type: 'kick',
        user,
        mod,
        withMessage
    });
};

BotUtils.prototype.clearUserChat = function(user) {
    var chatHistory = this.BOT.getChatHistory();
    var arrayLength = chatHistory.length;
    for(var i = 0; i < arrayLength; i++) {
        if(user.id == chatHistory[i].user.id) {
            this.BOT.moderateDeleteChat(chatHistory[i].id);
        }
    }
};

BotUtils.prototype.timeoutUser = function(user, time, message) {
    this.clearUserChat(user);
    this.timeMute(user, time, message)
};

BotUtils.prototype.checkPermission = function(user, permission) {
    let BOT = this.BOT;
    return BOT.hasPermission(user, permission);
};

BotUtils.prototype.checkRole = function(user, role) {
    let BOT = this.BOT;
    //noinspection FallThroughInSwitchStatementJS
    switch(BOT.roles[role.toLowerCase()].type) {
        case 'resident-dj':
            // RDJ+
            if(BOT.isResidentDJ(user)) {
                return true
            }
        case 'vip':
            // VIP+
            if(BOT.isVIP(user)) {
                return true;
            }
        case 'mod':
            // Mod+
            if(BOT.isMod(user)) {
                return true;
            }
        case 'manager':
            // Manager+
            if(BOT.isManager(user)) {
                return true;
            }
        case 'co-owner':
            // Owner/Creator only
            if(BOT.isOwner(user) || BOT.isCreator(user)) {
                return true
            }
    }
    return false;
};

module.exports = BotUtils;
