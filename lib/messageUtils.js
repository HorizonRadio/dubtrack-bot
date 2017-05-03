'use strict';

const imageRegExp = /https?:\/\/\S+\.(?:gif|png|jpg|jpeg)/gi;

let lastMessageFirstByUser = null;
let lastMessageWithImage = null;

/**
 * @param utils
 * @param data
 * */
const MessageUtils = function(utils, data) {

    const that = this;
    Object.keys(utils).forEach(function(utilName) {
        that[utilName] = utils[utilName];
    });

    let firstByUser;
    if(!lastMessageFirstByUser || lastMessageFirstByUser.getUserId() !== data.user.id) {
        lastMessageFirstByUser = this;
    }
    firstByUser = lastMessageFirstByUser;

    this.getFirstMessageByUser = function() {
        return firstByUser;
    };

    this.getId = function() {
        return this.chatUtils.getId(data);
    };

    this.getMessage = function() {
        return this.chatUtils.getMessage(data);
    };

    this.getCommandArguments = function() {
        return data.message.replace(/ {2,}/g, ' ').split(" ").slice(1);
    };

    this.getUser = function() {
        return this.chatUtils.getUser(data);
    };

    this.getUserId = function() {
        return this.userUtils.getUserId(this.getUser());
    };

    this.getUserRole = function() {
        return this.userUtils.getUserRole(this.getUser());
    };

    this.getUserCreated = function() {
        return this.userUtils.getUserCreated(this.getUser());
    };

    this.getUserUsername = function() {
        return this.userUtils.getUserUsername(this.getUser());
    };

    this.getUserProfileImage = function() {
        return this.userUtils.getUserProfileImage(this.getUser());
    };

    this.timeMuteUser = function(time, message) {
        this.botUtils.timeMute(this.getUser(), time, message);
    };

    this.getTargetName = function(pos, doNotAddAtSymbol) {
        let target = data.message.split(" ")[typeof pos !== 'undefined' ? pos : 1];
        if(!target) {
            return '';
        }
        if(target.toLowerCase() == 'everyone' && !this.BOT.hasPermission(this.getUser(), 'chat-mention')) {
            // Do not allow people to ping everyone unless they can!
            return '';
        }
        target = target || "";
        if(target.indexOf('@') == 0) {
            if(doNotAddAtSymbol) {
                target = target.replace('@', '');
            }
        }
        else if(!doNotAddAtSymbol) {
            target = '@' + target;
        }
        return target;
    };

    this.getMediaId = function() {
        return this.mediaUtils.getMediaId(this.BOT.getMedia());
    };

    this.getMediaName = function() {
        return this.mediaUtils.getMediaName(this.BOT.getMedia());
    };

    this.getMediaDescription = function() {
        return this.mediaUtils.getMediaDescription(this.BOT.getMedia());
    };

    this.getMediaImages = function() {
        return this.mediaUtils.getMediaImages(this.BOT.getMedia());
    };

    this.getMediaType = function() {
        return this.mediaUtils.getMediaType(this.BOT.getMedia());
    };

    this.getMediaFkid = function() {
        return this.mediaUtils.getMediaFkid(this.BOT.getMedia());
    };

    this.getMediaStreamUrl = function() {
        return this.mediaUtils.getMediaStreamUrl(this.BOT.getMedia());
    };

    this.getMediaFileUrl = function() {
        return this.mediaUtils.getMediaFileUrl(this.BOT.getMedia());
    };

    this.getMediaSongLength = function() {
        return this.mediaUtils.getMediaSongLength(this.BOT.getMedia());
    };

    this.getMediaSongBitrate = function() {
        return this.mediaUtils.getMediaSongBitrate(this.BOT.getMedia());
    };

    this.getMediaSongMeta = function() {
        return this.mediaUtils.getMediaSongMeta(this.BOT.getMedia());
    };

    this.getMediaCreated = function() {
        return this.mediaUtils.getMediaCreated(this.BOT.getMedia());
    };

    let imagesAmount = this.getMessage().match(imageRegExp);
    imagesAmount = imagesAmount ? imagesAmount.length : 0;
    this.hasImages = function() {
        return imagesAmount > 0;
    };
    this.getImageAmount = function() {
        return imagesAmount;
    };

    this.delete = function(callback) {
        return utils.BOT.moderateDeleteChat(this.getId(), callback);
    };

    this.reply = {
        _continue: true
        ,
        continuing: function() {
            return this._continue;
        }
        ,
        stopping: function() {
            return !this.continuing();
        }
        ,
        /**
         * Inform the world that no more chat things should be handled.
         */
        stop: function() {
            this._continue = false;
        }
    };

    this.setThisAsLastMessageWithImage = function() {
        if(!this.hasImages())
            return;

        lastMessageWithImage = this;
    }

};

MessageUtils.getLastMessageWithImage = function() {
    return lastMessageWithImage;
};

module.exports = MessageUtils;
