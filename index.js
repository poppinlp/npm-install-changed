#!/usr/bin/env node

/**
 * Jose Pereira <onaips@gmail.com>
 *
 * Run this script ensures 'npm install' is only run if there are dependency
 *  changes between installations. It makes a huge difference in build times
 *  on build servers.
 *
 * Use --bower argument to do the same for 'bower install'
 */
'use strict';

var fs = require('fs');
var spawn = require('child_process').spawn;
var crypto = require('crypto');
var assert = require('assert');

var hashFile = '.npm-install-changed.json';
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
 * Returns a hash built from all package.json dependencies and devDependencies
 *  project names and versions.
 */
function configJsonDepsHash() {
    return new Promise(function(resolve) {
        fs.readFile(packager.configJson, function(err, data) {
            assert.ifError(err);

            var packageJson = JSON.parse(data);
            var newHash = 'emptydeps';
            ['dependencies', 'devDependencies'].forEach(
                function(
                    dep) {
                    for (var key in packageJson[dep]) {
                        newHash = checksum(newHash + key +
                            packageJson[dep][key]);
                    }
                });

            resolve(newHash);
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

configJsonDepsHash().then(function(hash) {
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
    });

}, function(err) {
    console.log(err);
});
