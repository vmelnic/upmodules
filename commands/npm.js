var fs   = require('fs-extra');
var path = require('path');
var npmi = require('../src/npmi');

module.exports = function (inputs, output, options = {}) {
    if (inputs.length > 1) {
        throw new Error('Provide modules.' + output);
    }

    if (!Object.keys(options).length || options.repository.length === 0) {
        throw new Error('Provide npm repository. ' + output);
    }

    var params = {
        name        : options.repository,
        path        : output,
        forceInstall: false
    };

    return npmi(params, function (err) {
        if (err) {
            if (err.code === npmi.LOAD_ERR) {
                console.log(`npm ${npmi.NPM_VERSION}: load error.`);
            } else if (err.code === npmi.INSTALL_ERR) {
                console.log(`npm ${npmi.NPM_VERSION}: install error.`);
            }

            return console.log(`npm ${npmi.NPM_VERSION}: error ${err.message}`);
        }

        return fs.move(path.join(output, 'node_modules', inputs[0]), path.join(output, inputs[0])).then(function () {
            for (var file of ['package-lock.json', 'node_modules']) {
                fs.remove(path.join(output, file));
            }
        }).catch(function () {
            // Catch the errors.
        });
    });
};
