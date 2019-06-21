var fs = require('fs-extra');

module.exports = function (inputs, output, options = {}) {
    if (inputs.length > 1) {
        throw new Error('Cannot move more than one file at once to ' + output);
    }
    var input = inputs[0];

    return fs.move(input, output, options);
};
