'use strict';

class MediaUtils {
}

function checkMedia(media) {
    if (media) {
        return media;
    }
    console.error('media is undefined!');
    return null;
}

function checkMediaId(media) {
    media = checkMedia(media);
    if (media.id) {
        return media.id;
    }
    console.error('media.id is undefined!');
    return null;
}

MediaUtils.prototype.getMediaId = function (media) {
    return checkMediaId(media);
};

function checkMediaName(media) {
    media = checkMedia(media);
    if (media.name) {
        return media.name;
    }
    console.error('media.name is undefined!');
    return null;
}

MediaUtils.prototype.getMediaName = function (media) {
    return checkMediaName(media);
};

function checkMediaDescription(media) {
    media = checkMedia(media);
    if (media.description) {
        return media.description;
    }
    console.error('media.description is undefined!');
    return null;
}

MediaUtils.prototype.getMediaDescription = function (media) {
    return checkMediaDescription(media);
};

function checkMediaImages(media) {
    media = checkMedia(media);
    if (media.images) {
        return media.images;
    }
    console.error('media.images is undefined!');
    return null;
}

MediaUtils.prototype.getMediaImages = function (media) {
    return checkMediaImages(media);
};

function checkMediaType(media) {
    media = checkMedia(media);
    if (media.type) {
        return media.type;
    }
    console.error('media.type is undefined!');
    return null;
}

MediaUtils.prototype.getMediaType = function (media) {
    return checkMediaType(media);
};

function checkMediaFkid(media) {
    media = checkMedia(media);
    if (media.fkid) {
        return media.fkid;
    }
    console.error('media.fkid is undefined!');
    return null;
}

MediaUtils.prototype.getMediaFkid = function (media) {
    return checkMediaFkid(media);
};

function checkMediaStreamUrl(media) {
    media = checkMedia(media);
    if (media.streamUrl) {
        return media.streamUrl;
    }
    console.error('media.streamUrl is undefined!');
    return null;
}

MediaUtils.prototype.getMediaStreamUrl = function (media) {
    return checkMediaStreamUrl(media);
};

function checkMediaFileUrl(media) {
    media = checkMedia(media);
    if (media.fileUrl) {
        return media.fileUrl;
    }
    console.error('media.fileUrl is undefined!');
    return null;
}

MediaUtils.prototype.getMediaFileUrl = function (media) {
    return checkMediaFileUrl(media);
};

function checkMediaSongLength(media) {
    media = checkMedia(media);
    if (media.songLength) {
        return media.songLength;
    }
    console.error('media.songLength is undefined!');
    return null;
}

MediaUtils.prototype.getMediaSongLength = function (media) {
    return checkMediaSongLength(media);
};

function checkMediaSongBitrate(media) {
    media = checkMedia(media);
    if (media.songBitrate) {
        return media.songBitrate;
    }
    console.error('media.songBitrate is undefined!');
    return null;
}

MediaUtils.prototype.getMediaSongBitrate = function (media) {
    return checkMediaSongBitrate(media);
};

function checkMediaSongMeta(media) {
    media = checkMedia(media);
    if (media.songMeta) {
        return media.songMeta;
    }
    console.error('media.songMeta is undefined!');
    return null;
}

MediaUtils.prototype.getMediaSongMeta = function (media) {
    return checkMediaSongMeta(media);
};

function checkMediaCreated(media) {
    media = checkMedia(media);
    if (media.created) {
        return media.created;
    }
    console.error('media.created is undefined!');
    return null;
}

MediaUtils.prototype.getMediaCreated = function (media) {
    return checkMediaCreated(media);
};

module.exports = new MediaUtils();
