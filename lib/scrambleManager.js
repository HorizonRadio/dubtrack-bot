'use strict';

const httpReq = require('http').request;

/**
 * @param {RedisManager} redisManager
 * @param {object} settingsManager
 * @param {DubAPI} BOT
 * @constructor
 */
let ScrambleManager = function(redisManager, settingsManager, BOT) {
    this.started = false;
    this.redisManager = redisManager;
    this.settingsManager = settingsManager;
    this.BOT = BOT;

    end = end.bind(this);
};

ScrambleManager.prototype.guess = function(userid, word) {
    if(this.word.toLowerCase() === word.toLowerCase() || !this.started) {
        this.redisManager.incPropsBy(userid, this.reward);
        end();
        return true;
    }
    return false;
};

function end() {
    delete this.reward;
    this.started = false;
    this.redisManager.setLastGameTimestamp('scramble');
}
ScrambleManager.prototype.start = function(data, startedCallback, endCallback) {
    if(this.started) {
        return false;
    }
    this.reward = data.reward;
    httpReq({
        hostname: 'www.setgetgo.com',
        path: '/randomword/get.php?len=' + data.wordLength,
        method: 'GET'
    }, function(res) {
        let word = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            word += chunk;
        });
        res.on('end', function() {
            this.word = word;

            word = word.toLowerCase().split('');
            let scrambledWord = this.word;
            while(scrambledWord === this.word) {
                scrambledWord = '';
                while(word.length > 0) {
                    let index = Math.floor(Math.random() * word.length);
                    scrambledWord += word[index];
                    word.splice(index, 1);
                }
            }
            if(startedCallback) startedCallback.call(this, scrambledWord, false);

            this.started = setTimeout(function() {
                end();
                if(endCallback) endCallback.call(this, this.word);
            }.bind(this), data.duration * 1000);
        }.bind(this));
        res.on('error', function(err) {
            console.error('Scramble error:');
            console.error(err);
            if(startedCallback) startedCallback.call(this, null, err);
        }.bind(this));
    }.bind(this)).end();
    return true;
};

ScrambleManager.prototype.forceStop = function() {
    if(!this.started) {
        return false;
    }
    clearTimeout(this.started);
    end();
    return true;
};

module.exports = ScrambleManager;