'use strict';

class ChatUtils {
}

function checkData(data) {
    if (data) {
        return data;
    }
    console.error('data is undefined!');
    return null;
}

function checkId(data) {
    if (checkData(data)) {
        if (data.id) {
            return data.id;
        }
    }
    console.error('data.id is undefined!');
    return null;
}

ChatUtils.prototype.getId = function (data) {
    return checkId(data);
};

function checkMessage(data) {
    if (checkData(data)) {
        if (data.message) {
            return data.message;
        }
    }
    console.error('data.message is undefined!');
    return null;
}

ChatUtils.prototype.getMessage = function (data) {
    return checkMessage(data);
};

function checkUser(data) {
    if (checkData(data)) {
        if (data.user) {
            return data.user;
        }
    }
    console.error('data.user is undefined!');
    return null;
}

ChatUtils.prototype.getUser = function (data) {
    return checkUser(data);
};

module.exports = new ChatUtils();
