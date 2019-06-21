#!/usr/bin/env node

var upmodules = require('../src/index');
var fs        = require('fs-extra');
var minimist  = require('minimist');

var opts = minimist(process.argv);
delete opts.cwd;

var configFile = opts._.length == 3 && opts._[2] || 'package.json';
delete opts._;

fs.readJson(configFile).then(function (obj) {
    return upmodules.process(obj.upmodules || {}, opts);
}).catch(function (err) {
    console.error(err);
    process.exit(1);
});
