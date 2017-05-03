'use strict';

// Settings stuff only

let isDevEnvironment = (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'developer'); // differentiate between production and development
let globalCooldown = (process.env.COOLDOWN == undefined ? 30 : process.env.COOLDOWN); // time in seconds
let imgTime = (process.env.IMGTIME == undefined ? 5 : process.env.IMGTIME); // time in minutes
let imgRemovalSpam_Amount = (process.env.IMGREMOVALSPAM_AMOUNT == undefined ? 5 : process.env.IMGREMOVALSPAM_AMOUNT); // amount of images
let imgRemovalSpam_Time = (process.env.IMGREMOVALSPAM_AMOUNT == undefined ? 60 : process.env.IMGREMOVALSPAM_AMOUNT); // time in minutes
let imgRemovalDubs_Amount = (process.env.IMAGEREMOVALDUBS_AMOUNT == undefined ? 10 : process.env.IMAGEREMOVALDUBS_AMOUNT); // amount of dubs
let imgRemovalDubs_Time = (process.env.IMAGEREMOVALDUBS_TIME == undefined ? 5 : process.env.IMAGEREMOVALDUBS_TIME); // time in minutes
let banphrasesIgnoreSpaces = (process.env.BANPHRASES_IGNORE_SPACES == 'true'); // boolean from string
let roulette_price = (process.env.ROULETTE_PRICE == undefined ? 3 : process.env.ROULETTE_PRICE); // number
let roulette_dur = (process.env.ROULETTE_DURATION == undefined ? 60 : process.env.ROULETTE_DURATION); // time in seconds
let roulette_cd = (process.env.ROULETTE_COOLDOWN == undefined ? 60 : process.env.ROULETTE_COOLDOWN); // time in minutes
let scramble_reward = (process.env.SCRAMBLE_REWARD == undefined ? 3 : process.env.SCRAMBLE_REWARD); // number
let scramble_dur = (process.env.SCRAMBLE_DURATION == undefined ? 60 : process.env.SCRAMBLE_DURATION); // time in seconds
let scramble_cd = (process.env.SCRAMBLE_COOLDOWN == undefined ? 30 : process.env.SCRAMBLE_COOLDOWN); // time in minutes
let wordnik_api_key = (process.env.WORDNIK_API_KEY); // string

exports.isDevEnvironment = function () {
    return isDevEnvironment;
};

exports.getCooldown = function () {
    return globalCooldown;
};

exports.setCooldown = function (cooldown) {
    globalCooldown = cooldown;
};

/**
 * Returns the amount in seconds that the command should be cause in cooldown
 *
 * @param {MessageUtils} utils
 * @param {Number} commandCooldown
 */
exports.calulateCooldown = function (utils, commandCooldown) {
    if (commandCooldown <= 0) {
        return 0;
    }
    let coolD = commandCooldown;
    if (commandCooldown <= 1) {
        // if the cooldown is less than one take part of the global cooldown
        coolD = Math.floor(globalCooldown * commandCooldown);
    }
    if (!utils.getUserRole()) {
        // no role, full cooldown
        return coolD;
    }
    else if (utils.BOT.isResidentDJ(utils.getUser())) {
        // Resident-DJ, 50% off cooldown
        return Math.floor(coolD * 0.5);
    }
    else if (utils.BOT.isVIP(utils.getUser())) {
        // VIP, 75% off cooldown
        return Math.floor(coolD * 0.25);
    }
    else {
        // Staff (Mod+), no cooldown
        return 0;
    }
};

exports.getImgTime = function () {
    return imgTime;
};

exports.setImgTime = function (imgTimeT) {
    imgTime = imgTimeT;
};

exports.getImgRemoveSpamAmount = function () {
    return imgRemovalSpam_Amount;
};

exports.setImgRemoveSpamAmount = function (imgRemovalSpamAmount) {
    imgRemovalSpam_Amount = imgRemovalSpamAmount;
};

exports.getImgRemoveSpamTime = function () {
    return imgRemovalSpam_Time;
};

exports.setImgRemoveSpamTime = function (imgRemovalSpamTime) {
    imgRemovalSpam_Time = imgRemovalSpamTime;
};

exports.getImgDubsAmount = function () {
    return imgRemovalDubs_Amount;
};

exports.setImgDubsAmount = function (imgDubsAmount) {
    imgRemovalDubs_Amount = imgDubsAmount;
};

exports.getImgRemoveMuteTime = function () {
    return imgRemovalDubs_Time;
};

exports.setImgRemoveMuteTime = function (imgRemoveMuteTime) {
    imgRemovalDubs_Time = imgRemoveMuteTime;
};

exports.getBanPhrasesIgnoreSpaces = function () {
    return banphrasesIgnoreSpaces;
};

exports.setBanPhrasesIgnoreSpaces = function (banPhrasesIgnoreSpacesBool) {
    banphrasesIgnoreSpaces = banPhrasesIgnoreSpacesBool;
};

exports.getRoulettePrice = function () {
    let price = parseInt(roulette_price);
    return isNaN(price) ? 3 : price;
};

exports.getRouletteDuration = function () {
    let duration = parseInt(roulette_dur);
    return isNaN(duration) ? 60 : duration;
};

exports.getRouletteCooldown = function () {
    let cooldown = parseInt(roulette_cd);
    return (isNaN(cooldown) ? 60 : cooldown) * 60 * 1000;
};

exports.getScrambleReward = function () {
    let reward = parseInt(scramble_reward);
    return isNaN(reward) ? 3 : reward;
};

exports.getScrambleDuration = function () {
    let duration = parseInt(scramble_dur);
    return isNaN(duration) ? 60 : duration;
};

exports.getScrambleCooldown = function () {
    let cooldown = parseInt(scramble_cd);
    return (isNaN(cooldown) ? 30 : cooldown) * 60 * 1000;
};

exports.getWordnikAPIKey = function() {
    return wordnik_api_key;
};
