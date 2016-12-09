'use strict';

const util = require('util');
const httpsReq = require('https').request;
const URL = require('url');

const toSend = [];
const functionColors = {
    'info': 51200,      //   0, 200,   0
    'error': 13107200,  // 200,   0,   0
    'warn': 13158400    // 200, 200,   0
};

let sendInterval = null;

function sendToWebhook(embeds, callback) {
    try {
        let options = URL.parse(process.env.DISCORD_WEBHOOK_URL);
        options.protocol = 'https:';
        options.method = 'POST';
        options.headers = {
            'Content-Type': 'application/json'
        };

        let req = httpsReq(options, function(res) {
            res.on('error', function(x) {
                console.error('Webhook error:');
                console.error(x);
                if(callback) callback.call(req, x);
            });
            if(callback) res.on('end', callback.bind(req, null));
        });
        req.write(JSON.stringify({ embeds: embeds }));
        req.end();
    } catch(x) {
        // Let's not have infinite looping errors
        if(callback) callback.call(undefined, x);
    }
}
function convertToEmbeds() {
    var lastType = toSend[0].type, embedDescription = '';
    var result = [];
    for(var index = 0; index < toSend.length + 1; index++) {
        var toSendObj = toSend[index];

        if(!toSendObj || lastType !== toSendObj.type) {
            result.push({
                description: embedDescription,
                timestamp: new Date(),
                color: functionColors[lastType]
            });
            embedDescription = '';
        }
        if(toSendObj) {
            lastType = toSendObj.type;
            embedDescription += toSendObj.content + '\n';
        }
    }
    return result;
}
function addToSend(content, type, dontEscapeMarkdown) {
    if(!process.env.DISCORD_WEBHOOK_URL)
        return;

    content = util.format.apply(this, content);

    if(!dontEscapeMarkdown)
        content = content.replace(/(`|\*|_|~)/g, '\\$1');

    toSend.push({ content, type });
}

console.sendLogsToWebhook = function(value) {
    this._noWebhook = value;
};
Object.keys(functionColors).forEach(function(functionName) {
    var originalFunk = eval('console.' + functionName);

    function useOriginalFunk(content) {
        if(typeof originalFunk === 'function')
            originalFunk.apply(this, content);
    }

    eval('console.' + functionName + ' = ' + function() {
            useOriginalFunk(arguments);

            if(!this._noWeebhook)
                addToSend(arguments, functionName, false);
        } + ';');

    eval('console.' + functionName + 'FW = ' + function(content, force, dontEscapeMarkdown) {
            if(typeof content === 'string')
                content = [content];

            useOriginalFunk(content);

            if(typeof force === 'undefined')
                force = this._noWebhook;

            if(force)
                addToSend(content, functionName, dontEscapeMarkdown)
        } + ';');
});

if(process.env.DISCORD_WEBHOOK_URL) {
    {
        var interval = parseInt(process.env.DISCORD_WEBHOOK_INTERVAL);
        if(!interval || isNaN(interval)) interval = 1000;
        sendInterval = setInterval(function() {
            if(toSend.length <= 0)
                return;

            sendToWebhook(convertToEmbeds(toSend));
            toSend.length = 0;
        }, interval);

        console.infoFW('> DISCORD WEBHOOK READY', false);
    }
}

process.on('uncaughtException', function(err) {
    if(sendInterval) clearInterval(sendInterval);
    console.errorFW('**-- Uncaught Exception --**', true, true);
    console.error(err.stack);
    if(process.env.DISCORD_WEBHOOK_URL) {
        sendToWebhook(convertToEmbeds(toSend), function(err) {
            if(err !== null) {
                // Error already logged, no need to log it twice.
                console.warn('Today is just bad luck, isn\'t it? Crash error and no way to see it on Discord :/');
            }
            process.exit(1);
        });
    }
});