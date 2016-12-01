'use strict';

/* String object extensions */
String.prototype.hashCode = function () { // From http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

/* Math object extensions */
Math.dice = function (min, max) {
    if (typeof(max) === 'undefined') {
        max = min;
        min = 0;
    }
    var min1 = Math.min(min, max), max1 = Math.max(min, max);
    return Math.floor(Math.random() * (max1 - min1)) + min1;
};

/* Array object extensions */
Array.prototype.contains = function (element) {
    return (this.indexOf(element) > -1);
};
Array.prototype.remove = function (element) {
    if (this.contains(element)) {
        this.splice(this.indexOf(element), 1);
        return true;
    }
    else {
        return false;
    }
};

/* .env variables */
require('dotenv').load();
