'use strict';

class UserUtils {
}

function checkUser(user) {
    if (user) {
        return user;
    }
    console.error('user is undefined!');
    return null;
}

function checkUserId(user) {
    user = checkUser(user);
    if (user.id) {
        return user.id;
    }
    console.error('user.id is undefined!');
    return null;
}

UserUtils.prototype.getUserId = function (user) {
    return checkUserId(user);
};

function checkUserRole(user) {
    user = checkUser(user);
    if (user.role) {
        return user.role;
    }
    return null;
}

UserUtils.prototype.getUserRole = function (user) {
    return checkUserRole(user);
};

function checkUserCreated(user) {
    user = checkUser(user);
    if (user.created) {
        return user.created;
    }
    console.error('user.created is undefined!');
    return null;
}

UserUtils.prototype.getUserCreated = function (user) {
    return checkUserCreated(user);
};

function checkUserUpdated(user) {
    user = checkUser(user);
    if (user.updated) {
        return user.updated;
    }
    console.error('user.updated is undefined!');
    return null;
}

UserUtils.prototype.getUserUpdated = function (user) {
    return checkUserUpdated(user);
};

function checkUserUsername(user) {
    user = checkUser(user);
    if (user.username) {
        return user.username;
    }
    console.error('user.username is undefined!');
    return null;
}

UserUtils.prototype.getUserUsername = function (user) {
    return checkUserUsername(user);
};

function checkUserProfileImage(user) {
    user = checkUser(user);
    if (user.profileImage) {
        return user.profileImage;
    }
    console.error('user.profileImage is undefined!');
    return null;
}

UserUtils.prototype.getUserProfileImage = function (user) {
    return checkUserProfileImage(user);
};

function checkUserSkippedCount(user) {
    user = checkUser(user);
    if (user.skippedCount) {
        return user.skippedCount;
    }
    console.error('user.skippedCount is undefined!');
    return null;
}

UserUtils.prototype.getUserSkippedCount = function (user) {
    return checkUserSkippedCount(user);
};

function checkUserPlayedCount(user) {
    user = checkUser(user);
    if (user.playedCount) {
        return user.playedCount;
    }
    console.error('user.playedCount is undefined!');
    return null;
}

UserUtils.prototype.getUserPlayedCount = function (user) {
    return checkUserPlayedCount(user);
};

function checkUserSongsInQueue(user) {
    user = checkUser(user);
    if (user.songsInQueue) {
        return user.songsInQueue;
    }
    console.error('user.songsInQueue is undefined!');
    return null;
}

UserUtils.prototype.getUserSongsInQueue = function (user) {
    return checkUserSongsInQueue(user);
};

function checkUserActive(user) {
    user = checkUser(user);
    if (user.active) {
        return user.active;
    }
    console.error('user.active is undefined!');
    return null;
}

UserUtils.prototype.getUserActive = function (user) {
    return checkUserActive(user);
};

function checkUserDubs(user) {
    user = checkUser(user);
    if (user.dubs) {
        return user.dubs;
    }
    console.error('user.dubs is undefined!');
    return null;
}

UserUtils.prototype.getUserDubs = function (user) {
    return checkUserDubs(user);
};

function checkUserBanned(user) {
    user = checkUser(user);
    if (user.active) {
        return user.active;
    }
    else if (user.active == false) {
        return false;
    }
    console.error('user.active is undefined!');
    return null;
}

UserUtils.prototype.getUserActive = function (user) {
    return checkUserActive(user);
};

function checkUserBannedTime(user) {
    user = checkUser(user);
    if (user.bannedTime) {
        return user.bannedTime;
    }
    console.error('user.bannedTime is undefined!');
    return null;
}

UserUtils.prototype.getUserBannedTime = function (user) {
    return checkUserBannedTime(user);
};

function checkUserBannedUntil(user) {
    user = checkUser(user);
    if (user.bannedUntil) {
        return user.bannedUntil;
    }
    console.error('user.bannedUntil is undefined!');
    return null;
}

UserUtils.prototype.getUserBannedUntil = function (user) {
    return checkUserBannedUntil(user);
};

function checkUserKickCount(user) {
    user = checkUser(user);
    if (user.kickCount) {
        return user.kickCount;
    }
    console.error('user.kickCount is undefined!');
    return null;
}

UserUtils.prototype.getUserKickCount = function (user) {
    return checkUserKickCount(user);
};

function checkUserBannedTime(user) {
    user = checkUser(user);
    if (user.bannedTime) {
        return user.bannedTime;
    }
    console.error('user.bannedTime is undefined!');
    return null;
}

UserUtils.prototype.getUserBannedTime = function (user) {
    return checkUserBannedTime(user);
};

function checkUserMuted(user) {
    user = checkUser(user);
    if (user.muted) {
        return user.muted;
    }
    console.error('user.muted is undefined!');
    return null;
}

UserUtils.prototype.getUserMuted = function (user) {
    return checkUserMuted(user);
};

function checkUserOrder(user) {
    user = checkUser(user);
    if (user.order) {
        return user.order;
    }
    console.error('user.order is undefined!');
    return null;
}

UserUtils.prototype.getUserOrder = function (user) {
    return checkUserOrder(user);
};

function checkUserDub(user) {
    user = checkUser(user);
    if (user.dub) {
        return user.dub;
    }
    console.error('user.dub is undefined!');
    return null;
}

UserUtils.prototype.getUserDub = function (user) {
    return checkUserDub(user);
};

module.exports = new UserUtils();
