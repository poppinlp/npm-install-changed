#!/usr/bin/env node

/**
 * Jose Pereira <onaips@gmail.com>
 *
 * Run this script ensures 'npm install' is only run if there are dependency
 *  changes between installations. It makes a huge difference in build times
 *  on build servers.
 */
'use strict';

var fs = require('fs');
var spawn = require('child_process').spawn;
var crypto = require('crypto');
var assert = require('assert');

var hashFile = '.npm-install-changed.json';

var config = {};

try {
    var config = JSON.parse(fs.readFileSync(hashFile));
} catch (e) {}

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
function packageJsonDepsHash() {
    return new Promise(function(resolve) {
        fs.readFile('./package.json', function(err, data) {
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

packageJsonDepsHash().then(function(hash) {
    //make sure that if package.json changed, npm shrinkwrap should as well
    if (hash === config.hash) {
        console.log('Nothing to do.');
        return;
    }

    //looks like package.json dependencies have changed
    console.log('Running npm install...');
    var npmProcess = spawn('npm', ['install'], {
        stdio: 'inherit'
    });

    npmProcess.on('close', function(code) {
        if (code !== 0) {
            return;
        }

        config.hash = hash;

        //only save new hash if npm install was successful
        fs.writeFile(hashFile, JSON.stringify(config));
    });

}, function(err) {
    console.log(err);
});
