/**
 * Create links between files. Cross-platform.
 */

var fs   = require('fs-extra');
var link = require('lnk');

module.exports = function (inputs, output) {
    if (inputs.length > 1) {
        throw new Error('Cannot shortcut more than one file at once to ' + output);
    }
    var input = inputs[0];

    return fs.access(input).then(function () {
        return link(input, output).catch(function () {
            // Ignore errors.
        });
    });
};

