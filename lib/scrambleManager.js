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
    if(this.started !== false) clearTimeout(this.started);
    this.started = false;
    this.redisManager.setLastGameTimestamp('scramble');
}
ScrambleManager.prototype.start = function(data, startedCallback, endCallback) {
    if(this.started) {
        return false;
    }
    if(!this.settingsManager.getWordnikAPIKey()) {
        if(endCallback) endCallback.call(this, 'no-api-key', null);
        return false;
    }
    this.reward = data.reward;
    httpReq({
        method: 'GET',
        hostname: 'api.wordnik.com',
        path:   '/v4/words.json/randomWords?' +
                'api_key=' + this.settingsManager.getWordnikAPIKey() + '&' +
                'hasDictionaryDef=true&' +
                'minCorpusCount=150000&' +
                'minLength=' + data.wordLengthRange[0] + '&' +
                'maxLength=' + data.wordLengthRange[1] + '&' +
                'limit=5'
    }, function(res) {
        let wordData = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            wordData += chunk;
        });
        res.on('end', function() {
            try {
                wordData = JSON.parse(wordData);
            } catch(x) {
                console.error('Scramble error:');
                console.error(x);
                if(endCallback) endCallback.call(this, x, null);
            }

            var selectedWordObj = null;
            wordData.forEach(function(wordObj) {
                 if(/[^a-z]/.test(wordObj.word))
                     return;
                selectedWordObj = wordObj;
            });

            if(selectedWordObj === null) {
                if(endCallback) endCallback.call(this, 'no-selectable-words', null);
                return;
            }

            this.word = selectedWordObj.word;
            var word = this.word.toLowerCase().split('');
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
                if(endCallback) endCallback.call(this, null, this.word);
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
    end();
    return true;
};

module.exports = ScrambleManager;
