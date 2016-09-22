#!/usr/bin/env node

/**
 * Jose Pereira <onaips@gmail.com>
 *
 * Run this script ensures 'npm install' is only run if there are dependency
 *  changes between installations. It makes a huge difference in build times
 *  on build servers.
 *
 * Use --bower argument to do the same for 'bower install'
 * Use --recursive argument to verify if dependency configs changed.
 */
'use strict';

var fs = require('fs');
var spawn = require('cross-spawn');
var crypto = require('crypto');
var path = require('path');

var hashFile = '.npm-install-changed.json';
var recursive = process.argv.indexOf('--recursive') >= 0;
var prune = process.argv.indexOf('--prune') >= 0;
var config = {};
var packager;

/**
 * Returns checksum of passed string.
 */
function checksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

/**
 * Returns component folder path for dir.
 */
function componentsFolder(dir) {
    if (packager.bin === 'bower') {
        var bowerComponents = path.join(dir, 'bower_components');
        try {
            var bowerRc = JSON.parse(fs.readFileSync(
                path.join(dir, '.bowerrc')));
            packager.componentsFolder = path.join(dir, bowerRc.directory);
        } catch (e) {}

        return bowerComponents;
    } else if (packager.bin === 'npm') {
        return path.join(dir, 'node_modules');
    } else {
        throw 'Packager not supported';
    }
}

/**
 * Returns directories inside components folder.
 */
function dependenciesFolders(dir) {
    var components = componentsFolder(dir);
    try {
        return fs.readdirSync(components)
            .filter(function(file) {
                return fs.statSync(path.join(components, file)).isDirectory();
            }).map(function(file) {
                return path.join(components, file);
            });
    } catch (e) {
        return [];
    }
}

/**
 * Returns a hash built from all package.json dependencies and devDependencies
 *  project names and versions.
 */
function configJsonDepsHash(configJsonDir) {
    return new Promise(function(resolve) {
        fs.readFile(path.join(configJsonDir, packager.configJson),
            function(err, data) {
                if (err) {
                    resolve('noconfig');
                    return;
                }

                var packageJson = JSON.parse(data);
                var newHash = 'emptydeps';
                ['dependencies', 'devDependencies'].forEach(
                    function(
                        dep) {
                        for (var key in packageJson[dep]) {
                            newHash = checksum(newHash +
                                key +
                                packageJson[dep][key]);
                        }
                    });

                if (recursive) {
                    var hashPromises = dependenciesFolders(
                        configJsonDir).map(
                        function(dir) {
                            return configJsonDepsHash(dir);
                        });

                    Promise.all(hashPromises).then(function(hashes) {
                        for (var i = 0; i < hashes.length; i++) {
                            newHash = checksum(newHash + hashes[i]);
                        }

                        resolve(newHash);
                    }).catch(function(err) {
                        console.log(err);
                        //there was some problem here, log it but continue.
                        resolve('exception');
                    });
                } else {
                    resolve(newHash);
                }
            });
    });
}

try {
    var config = JSON.parse(fs.readFileSync(hashFile));
} catch (e) {}

//determine what packager are we targeting
if (process.argv.indexOf('--bower') >= 0) {
    packager = {
        bin: 'bower',
        configJson: './bower.json'
    };
} else {
    packager = {
        bin: 'npm',
        configJson: './package.json'
    };
}

configJsonDepsHash(process.cwd()).then(function(hash) {
    var hashKey = [packager.bin + '-hash'];

    if (hash === config[hashKey]) {
        console.log('Nothing to do.');
        return;
    }

    //looks like configJson dependencies have changed
    console.log('Running ' + packager.bin + ' install...');
    var packagerProcess = spawn(packager.bin, ['install'], {
        stdio: 'inherit'
    });

    packagerProcess.on('close', function(code) {
        if (code !== 0) {
            return;
        }

        config[hashKey] = hash;

        //only save new hash if packager install was successful
        fs.writeFile(hashFile, JSON.stringify(config));
        
        if(prune){
            var pruneProcess = spawn(packager.bin, ['prune'], {
                stdio: 'inherit'
            });
        }
    });

    pruneProcess.on('close', function(code) {
        if (code !== 0) {
            return;
        }
    });

}).catch(function(err) {
    console.log(err);
});
