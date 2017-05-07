'use strict';

const strings = {
    formatUser(user) {
        return user ? `@${user.username} (${user.id})` : null;
    },
    formatMeasure(amount, name) {
        return `${amount} ${name}${amount - 1 ? 's' : ''}`;
    },
    formatPunishmentTemplate(type, includeMod, time, reason) {
        let punishment, canHaveATime = false;
        //noinspection FallThroughInSwitchStatementJS
        switch(type) {
            default:
                return null;
            case 'mute':
                canHaveATime = true;
            case 'unmute':
                punishment = type + 'd';
                break;
            case 'ban':
                canHaveATime = true;
            case 'unban':
                punishment = type + 'ned';
                break;
            case 'timeout':
                punishment = 'timed out';
                canHaveATime = true;
                break;
            case 'kick':
                punishment = 'kicked';
                canHaveATime = false;
                break;
        }
        return  `%user% was ${punishment}` +
                `${canHaveATime ? ` ${(time ? `for ${strings.formatMeasure(time, 'minute')}` : 'forever')}` : ''}` +
                `${includeMod ? ` by %mod%` : ''}${reason ? ` for ${reason}` : ''}`
    },
    formatGameStart(name, starter, data) {
        let result = `${name[0].toUpperCase() + name.substr(1)} started by ${strings.formatUser(starter)} -`;
        data.forEach((dat) => result += ` ${dat}.`);
        return result;
    },
    formatPunishment(type, user, mod, time, reason) {
        return strings.formatPunishmentTemplate(type, mod, time, reason)
                      .replace('%user%', strings.formatUser(user))
                      .replace('%mod%', strings.formatUser(mod));
    },
    formatPunishmentForChat(type, user, mod, time, reason) {
        return strings.formatPunishmentTemplate(type, mod, time, reason)
                      .replace('%user%', user.username)
                      .replace('%mod%', mod ? mod.username : null);
    },
    formatRoleChange(isPromotion, user, mod, fromRoleName, toRoleName) {
        return  `${strings.formatUser(user)} got ${isPromotion ? 'promoted' : 'demoted'} ` +
                `${fromRoleName ? `from ${fromRoleName} ` : ''}to ` +
                `${toRoleName || 'nothing (default role)'}${mod ? ` by ${strings.formatUser(mod)}` : ''}`;
    }
};

module.exports = strings;
