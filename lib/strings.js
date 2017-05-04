'use strict';

const strings = {
    formatUser(user) {
        return user ? `${user.username} (${user.id})` : null;
    },
    formatPunishmentTemplate(type, includeMod, time) {
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
                `${canHaveATime ? ` ${(time ? `for ${time} minute${time - 1 ? 's' : ''}` : 'forever')}` : ''}` +
                `${includeMod ? ` by %mod%` : ''}`
    },
    formatGameStart(name, starter, data) {
        let result = `${name[0].toUpperCase() + name.substr(1)} started by ${strings.formatUser(starter)}!`;
        data.forEach((dat) => result += ` ${dat}.`);
        return result;
    },
    formatPunishment(type, user, mod, time) {
        return strings.formatPunishmentTemplate(type, mod, time)
                      .replace('%user%', strings.formatUser(user))
                      .replace('%mod%', strings.formatUser(mod));
    },
    formatPunishmentForChat(type, user, mod, time) {
        return strings.formatPunishmentTemplate(type, mod, time)
                      .replace('%user%', user.username)
                      .replace('%mod%', mod ? mod.username : null);
    },
    formatRoleSetting(fromRoleName, toRoleName, isPromotion, user, mod) {
        return  `${strings.formatUser(user)} got ${isPromotion ? 'promoted' : 'demoted'} from ${fromRoleName} to `+
                `${toRoleName}${mod ? ` by ${strings.formatUser(mod)}` : ''}`;
    }
};

module.exports = strings;
