'use strict';

var lastMessageFirstByUser = null;

/**
 * @param {DubAPI} bot
 * @param {TwitchManager} twitchManager
 * @param {RedisManager} redisManager
 * @param {PropsManager} propsManager
 * @param settingsManager
 * @param {ChatUtils} chatUtils
 * @param {UserUtils} userUtils
 * @param {BotUtils} botUtils
 * @param {MediaUtils} mediaUtils
 * @param data
 * */
//var MessageUtils = function (bot, redisManager, twitchManager, propsManager, settingsManager, chatUtils, userUtils, mediaUtils, botUtils, data) {
var MessageUtils = function (utils, data) {

    var that = this;
    Object.keys(utils).forEach(function (utilName) {
        that[utilName] = utils[utilName];
    });

    var firstByUser;
    if (!lastMessageFirstByUser || lastMessageFirstByUser.getUserId() !== data.user.id) {
        lastMessageFirstByUser = this;
    }
    firstByUser = lastMessageFirstByUser;

    this.getFirstMessageByUser = function () {
        return firstByUser;
    };

    this.getId = function () {
        return this.chatUtils.getId(data);
    };

    this.getMessage = function () {
        return this.chatUtils.getMessage(data);
    };

    this.getCommandArguments = function () {
        return data.message.replace(/ {2,}/g, ' ').split(" ").slice(1);
    };

    this.getUser = function () {
        return this.chatUtils.getUser(data);
    };

    this.getUserId = function () {
        return this.userUtils.getUserId(this.getUser());
    };

    this.getUserRole = function () {
        return this.userUtils.getUserRole(this.getUser());
    };

    this.getUserCreated = function () {
        return this.userUtils.getUserCreated(this.getUser());
    };

    this.getUserUsername = function () {
        return this.userUtils.getUserUsername(this.getUser());
    };

    this.getUserProfileImage = function () {
        return this.userUtils.getUserProfileImage(this.getUser());
    };

    this.timeMuteUser = function (time, message) {
        this.botUtils.timeMute(this.getUser(), time, message);
    };

    this.getTargetName = function (pos, dontAddAtSymbol) {
        var target = data.message.split(" ")[typeof pos !== 'undefined' ? pos : 1];
        if (!target) {
            return '';
        }
        if (target.toLowerCase() == 'everyone' && !this.bot.hasPermission(this.getUser(), 'chat-mention')) {
            // Do not allow people to ping everyone unless they can!
            return '';
        }
        target = target || "";
        if (target.indexOf('@') == 0) {
            if (dontAddAtSymbol) {
                target = target.replace('@', '');
            }
        }
        else if (!dontAddAtSymbol) {
            target = '@' + target;
        }
        return target;
    };

    this.getMediaId = function () {
        return this.mediaUtils.getMediaId(this.bot.getMedia());
    };

    this.getMediaName = function () {
        return this.mediaUtils.getMediaName(this.bot.getMedia());
    };

    this.getMediaDescription = function () {
        return this.mediaUtils.getMediaDescription(this.bot.getMedia());
    };

    this.getMediaImages = function () {
        return this.mediaUtils.getMediaImages(this.bot.getMedia());
    };

    this.getMediaType = function () {
        return this.mediaUtils.getMediaType(this.bot.getMedia());
    };

    this.getMediaFkid = function () {
        return this.mediaUtils.getMediaFkid(this.bot.getMedia());
    };

    this.getMediaStreamUrl = function () {
        return this.mediaUtils.getMediaStreamUrl(this.bot.getMedia());
    };

    this.getMediaFileUrl = function () {
        return this.mediaUtils.getMediaFileUrl(this.bot.getMedia());
    };

    this.getMediaSongLength = function () {
        return this.mediaUtils.getMediaSongLength(this.bot.getMedia());
    };

    this.getMediaSongBitrate = function () {
        return this.mediaUtils.getMediaSongBitrate(this.bot.getMedia());
    };

    this.getMediaSongMeta = function () {
        return this.mediaUtils.getMediaSongMeta(this.bot.getMedia());
    };

    this.getMediaCreated = function () {
        return this.mediaUtils.getMediaCreated(this.bot.getMedia());
    };

    this.reply = {
        _continue: true
        ,
        continuing: function () {
            return this._continue;
        }
        ,
        stopping: function () {
            return !this.continuing();
        }
        ,
        /**
         * Inform the world that no more chat things should be handled.
         */
        stop: function () {
            this._continue = false;
        }
    };

};

module.exports = MessageUtils;
