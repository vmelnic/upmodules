/**
 * NodeJS package that gives a simplier API to npm install (programatically installs things)
 * @see https://github.com/maxleiko/npmi
 * @licence https://github.com/maxleiko/npmi/blob/master/LICENSE
 */

var npm    = require('./global-npm');
var fs     = require('fs');
var path   = require('path');
var semver = require('semver');

var LOAD_ERR    = 'NPM_LOAD_ERR',
    INSTALL_ERR = 'NPM_INSTALL_ERR',
    VIEW_ERR    = 'NPM_VIEW_ERR';

var npmi = function (options, callback) {
    callback = callback || function () {};

    var name         = options.name,
        pkgName      = options.pkgName || name,
        version      = options.version || 'latest',
        installPath  = options.path || '.',
        packageFile  = options.packageFile || 'package.json',
        modulesDir  = options.modulesDir || 'node_modules',
        forceInstall = options.forceInstall || false,
        localInstall = options.localInstall || false,
        npmLoad      = options.npmLoad || {loglevel: 'silent'},
        savedPrefix  = null;

    function viewCallback(installedVersion)  {
        return function (err, view) {
            if (err) {
                npm.prefix = savedPrefix;
                err.code = VIEW_ERR;
                return callback(err);
            }

            var latestVersion = Object.keys(view)[0];
            if ((typeof latestVersion !== 'undefined') && (latestVersion === installedVersion)) {
                npm.prefix = savedPrefix;
                return callback();
            } else {
                npm.commands.install(installPath, [name+'@'+latestVersion], installCallback);
            }
        };
    }

    function checkInstalled(isTarball) {
        var module = name+'@'+version;

        if (isTarball) {
            module = name;
            if (pkgName === name) {
                console.warn(`npm ${npmi.NPM_VERSION}: install ${name}`);
            }
        }

        fs.readFile(path.normalize(path.resolve(installPath, modulesDir, pkgName, packageFile)), function (err, pkgRawData) {
            if (err) {
                return npm.commands.install(installPath, [module], installCallback);
            }

            var pkg = JSON.parse(pkgRawData);
            if (version === 'latest') {
                if (isTarball) {
                    console.warn(`npm ${npmi.NPM_VERSION}: install from tarball without options.version specified.`);
                    return npm.commands.install(installPath, [module], installCallback);
                } else {
                    return npm.commands.view([name], true, viewCallback(pkg.version));
                }

            } else if (pkg.version === version) {
                npm.prefix = savedPrefix;
                return callback();

            } else {
                return npm.commands.install(installPath, [module], installCallback);
            }
        });
    }

    function installCallback(err, result) {
        npm.prefix = savedPrefix;

        if (err) {
            err.code = INSTALL_ERR;
        }

        callback(err, result);
    }

    function loadCallback(err) {
        if (err) {
            err.code = LOAD_ERR;
            return callback(err);
        }

        savedPrefix = npm.prefix;
        npm.prefix = installPath;
        if (!name) {
            npm.commands.install(installPath, [], installCallback);
        } else if (localInstall) {
            if (forceInstall) {
                // local install won't work with version specified
                npm.commands.install(installPath, [name], installCallback);
            } else {
                fs.readFile(path.normalize(path.resolve(name, packageFile)), 'utf8', function (err, sourcePkgData) {
                    if (err) {
                        // reset npm.prefix to saved value
                        npm.prefix = savedPrefix;
                        callback(err);

                    } else {
                        try {
                            var sourcePkg = JSON.parse(sourcePkgData);
                        } catch (err) {
                            // reset npm.prefix to saved value
                            npm.prefix = savedPrefix;
                            callback(err);
                            return;
                        }

                        var pkgName = sourcePkg.name || path.basename(name);
                        fs.readFile(path.normalize(path.resolve(installPath, modulesDir, pkgName, packageFile)), 'utf8', function (err, targetPkgData) {
                            if (err) {
                                // file probably doesn't exist, or is corrupted: install
                                // local install won't work with version specified
                                npm.commands.install(installPath, [name], installCallback);
                            } else {
                                // there is a module that looks a lot like the one you want to install: do some checks
                                try {
                                    var targetPkg = JSON.parse(targetPkgData);
                                } catch (err) {
                                    // reset npm.prefix to saved value
                                    npm.prefix = savedPrefix;
                                    callback(err);
                                    return;
                                }

                                if (semver.gt(sourcePkg.version, targetPkg.version)) {
                                    // install because current found version seems outdated
                                    // local install won't work with version specified
                                    npm.commands.install(installPath, [name], installCallback);
                                } else {
                                    // reset npm.prefix to saved value
                                    npm.prefix = savedPrefix;
                                    callback();
                                }
                            }
                        });
                    }
                });
            }
        } else {
            if (forceInstall) {
                if (name.indexOf('/') === -1) {
                    npm.commands.install(installPath, [name+'@'+version], installCallback);
                } else {
                    npm.commands.install(installPath, [name], installCallback);
                }
            } else {
                checkInstalled(name.indexOf('/') !== -1);
            }
        }
    }

    npm.load(npmLoad, loadCallback);
};

npmi.LOAD_ERR    = LOAD_ERR;
npmi.INSTALL_ERR = INSTALL_ERR;
npmi.VIEW_ERR    = VIEW_ERR;

npmi.NPM_VERSION = npm.version;

module.exports = npmi;