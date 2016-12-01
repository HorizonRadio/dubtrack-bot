'use strict';

class CommandManager {
}

CommandManager.prototype.Command = function Command(id, names, cooldown, roles, permissions, funk) {
    this.id = id;
    this.names = names; // String[]
    if (typeof cooldown === 'object') {
        this.cooldown = cooldown.value; // int seconds
        this.perCmdCooldown = cooldown.perCmd; // boolean
    } else {
        this.cooldown = cooldown; // int seconds
    }
    this.roles = roles; // String[]
    this.permissions = permissions; // String[]
    this.funk = funk; // function(utils)
};

var commandList = [];
var commands = [];

var CommandListElement = function (commandId, commandAliases, action) {
    this.commandId = commandId;
    this.commandAliases = commandAliases;
    this.action = action;
};

/**
 * @param {MessageUtils} utils
 */
function getCommandName(utils) {
    return utils.getMessage().replace(/ {2,}/g, ' ').split(" ")[0].replace('!', '').toLowerCase();
}

/**
 * @param {MessageUtils} utils
 * @param {Command} command
 */
function checkPermission(utils, command) {
    if (!command.permissions.length) {
        // No permission means all can use it!
        return true;
    }
    // default to true
    let ret = true;
    command.permissions.every(function (permission) {
        // Only take power away if they do not match a required permission
        if (!utils.botUtils.checkPermission(utils.getUser(), permission)) {
            ret = false;
            return false;
        }
    });
    return ret;
}

/**
 * @param {MessageUtils} utils
 * @param {Command} command
 */
function checkRole(utils, command) {
    if (!command.roles.length) {
        // No roles means all can use it!
        return true;
    }
    var ret = false;
    var user = utils.getUser();
    command.roles.every(function (role) {
        if (utils.botUtils.checkRole(user, role)) {
            ret = true;
            return false;
        }
    });
    return ret;
}

/**
 * @param {MessageUtils} utils
 * @param {Command} command
 */
function isAllowed(utils, command) {
    return checkPermission(utils, command) && checkRole(utils, command);
}

/**
 * @param {MessageUtils} utils
 * @param {Command} command
 * @returns {Boolean} True if cooldown should not be set, false otherwise.
 */
function runCommand(utils, command) {
    // Set for the uppers to stop now so a command may tell it to keep going
    utils.reply.stop();
    function execute() {
        var dontSetCooldown = false;
        command.funk(
            utils,
            /**
             * @param (Optional) bool
             */
            function (bool) {
                dontSetCooldown = bool || true;
            }
        );
        return dontSetCooldown;
    }

    if (utils.settingsManager.isDevEnvironment()) {
        execute();
    }
    else {
        try {
            execute();
        }
        catch (err) {
            console.error("Well we had an error! Command: " + command.id);
            console.error(err);
        }
    }
    return false;
}

/**
 * @param {MessageUtils} utils
 */
CommandManager.prototype.processCommand = function (utils) {
    var commandName = getCommandName(utils);
    var commandListElement = null;
    commandList.forEach(function (element) {
        if (!commandListElement) {
            if (element.commandAliases.contains(commandName)) {
                commandListElement = element;
            }
        }
    });
    if (!commandListElement) {
        return;
    }
    var command = commands[commandListElement.commandId];
    if (!command) {
        // just an extra bit of error checking
        return;
    }
    // make sure that they are allowed to use the command
    if (!isAllowed(utils, command)) {
        // if not allowed
        return;
    }
    var cooldown = utils.settingsManager.calulateCooldown(utils, command.cooldown);
    if (commandListElement.action || cooldown <= 0) {
        // ok so just run it we did all we needed to do
        runCommand(utils, command);
    }
    else {
        var that = this;
        this.getUserCooldown(utils, command.perCmdCooldown ? command.id : undefined, function (onCooldown) {
            if (onCooldown) {
                return;
            }

            if (!runCommand(utils, command)) {
                that.setUserOnCooldown(utils, command, cooldown);
            }
        });
    }
};

CommandManager.prototype.getUserCooldown = function (utils, commandId, callback) {
    utils.redisManager.getUserCommandCooldown(utils.getUserId(), commandId, callback);
};

function isStaff(utils) {
    var bot = utils.bot;
    var user = utils.getUser();
    return bot.isMod(user) || bot.isManager(user) || bot.isOwner(user) || bot.isCreator(user);
}

CommandManager.prototype.setUserOnCooldown = function (utils, command, setCooldown) {
    var cooldown = setCooldown ? setCooldown : command ? utils.settingsManager.calulateCooldown(utils, command.cooldown) : utils.settingsManager.getCooldown();
    if (isStaff(utils)) {
        cooldown = 0;
    }
    if (cooldown > 0) {
        utils.redisManager.setUserCommandCooldown(
            utils.getUserId(),
            cooldown,
            (command && command.perCmdCooldown) ? command.id : undefined
        );
    }
};

CommandManager.prototype.getCommandList = function () {
    return commandList.slice(0);
};

CommandManager.prototype.getCommand = function (commandId) {
    return commands[commandId];
};

/**
 * @param {Command} command
 */
CommandManager.prototype.addCommand = function (command) {
    var commandListElement = new CommandListElement(command.id, command.names, command.cooldown == 0);
    if (commandList.contains(commandListElement)) {
        return false;
    }
    commandList.push(commandListElement);
    commands[command.id] = command;
    return true;
};

/**
 * @param {String} command
 * @param {Command} command
 */
CommandManager.prototype.removeCommand = function (command) {
    var commandId = null;
    if (command instanceof Command) {
        if (commands.contains(command)) {
            commands.remove(command);
            commandId = command.id;
        }
    }
    else if (typeof command === 'string') {
        var Rcommand = commands[command];
        if (Rcommand) {
            commands.remove(Rcommand);
            commandId = Rcommand.id;
        }
    }
    if (commandId) {
        commandList.forEach(function (commandListElement) {
            if (commandListElement.commandId == commandId) {
                commandList.remove(commandListElement);
            }
        });
        // not sure what to do if we don't find it
    }
};

module.exports = CommandManager;
