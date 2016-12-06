const DiscordWebhook = require("discord-webhooks");
const util = require('util');

const toSend = [];
const functionColors = {
    'info': 51200,      //   0, 200,   0
    'error': 13107200,  // 200,   0,   0
    'warn': 13158400    // 200, 200,   0
};

function addToSend(content, type) {
    if (!process.env.DISCORD_WEBHOOK_URL)
        return;

    toSend.push({
        content: util.format.apply(this, content),
        type: type
    });
}

console.sendLogsToWebhook = function (value) {
    this._noWebhook = value;
};
Object.keys(functionColors).forEach(function (functionName) {
    var originalFunk = eval('console.' + functionName);

    function useOriginalFunk(content) {
        if (typeof originalFunk === 'function')
            originalFunk.apply(this, content);
    }

    eval('console.' + functionName + ' = ' + function () {
            useOriginalFunk(arguments);

            if (!this._noWeebhook)
                addToSend(arguments, functionName);
        } + ';');

    eval('console.' + functionName + 'FW = ' + function (content, force) {
            if (typeof content === 'string')
                content = [content];

            useOriginalFunk(content);

            if (typeof force === 'undefined')
                force = this._noWebhook;

            if (force)
                addToSend(content, functionName)
        } + ';');
});

if (process.env.DISCORD_WEBHOOK_URL) {
    const webhook = new DiscordWebhook(process.env.DISCORD_WEBHOOK_URL);
    webhook.on('ready', function () {
        var interval = parseInt(process.env.DISCORD_WEBHOOK_INTERVAL);
        if (!interval || isNaN(interval)) interval = 1000;
        setInterval(function () {
            if (toSend.length <= 0)
                return;

            var lastType = toSend[0].type, embedDescription = '';
            var toSendEmbeds = [];
            for (var index = 0; index < toSend.length + 1; index++) {
                var toSendObj = toSend[index];

                if (!toSendObj || lastType !== toSendObj.type) {
                    toSendEmbeds.push({
                        description: embedDescription.replace(/(`|\*|_|~)/g, '\\$1'),
                        timestamp: new Date(),
                        color: functionColors[lastType]
                    });
                    embedDescription = '';
                }
                if (toSendObj) {
                    lastType = toSendObj.type;
                    embedDescription += toSendObj.content + '\n';
                }
            }

            webhook.execute({embeds: toSendEmbeds});
            toSend.length = 0;
        }, interval);

        console.infoFW('> DISCORD WEBHOOK READY', false);
    });
    webhook.on('error', function (err) {
        console.error('Error on Webhooks:');
        console.error(err);
    });
}