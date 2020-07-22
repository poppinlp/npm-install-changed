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
 * Use --prune to remove unused dependencies after running install.
 */

"use strict";

const npmInstallChanged = require("../");

const FLAG_BOWER = "--bower";
const FLAG_YARN = "--yarn";
const FLAG_RECURSIVE = "--recursive";
const FLAG_PRUNE = "--prune";

const PACKAGE_MANAGER = {
  bower: {
    bin: "bower",
    config: "bower.json",
  },
  yarn: {
    bin: "yarn",
    config: "package.json",
  },
  npm: {
    bin: "npm",
    config: "package.json",
  },
};

const args = new Set(process.argv.slice(2));
const isBower = args.has(FLAG_BOWER) && args.delete(FLAG_BOWER);
const isYarn = args.has(FLAG_YARN) && args.delete(FLAG_YARN);
const isRecursive = args.has(FLAG_RECURSIVE) && args.delete(FLAG_RECURSIVE);
const isPrune = args.has(FLAG_PRUNE) && args.delete(FLAG_PRUNE);

(async () => {
  const historyHash = await npmInstallChanged.readHistoryHash();

  // TODO:
  // We may let user specify package manager name via CLI argument.
  // But it may bring break change.
  let packageManager = PACKAGE_MANAGER.npm;
  isBower && (packageManager = PACKAGE_MANAGER.bower);
  isYarn && (packageManager = PACKAGE_MANAGER.yarn);

  const hashKey = packageManager.bin + "-hash";
  const depsHash = await npmInstallChanged.getDepsHash(isRecursive);

  if (depsHash === historyHash[hashKey]) return;

  await npmInstallChanged.spawnProcess(
    ["install", ...args]
  );

  postInstall();
})();

function postInstall(hash) {
  config[hashKey] = hash;

  //only save new hash if packager install was successful
  fs.writeFile(hashFile, JSON.stringify(config), (err) => {
    if (err) {
      console.log(err);
    }
  });

  if (prune) {
    spawnProcessAndHandleClose("prune");
  }
}

/*
const fs = require("fs");
const spawn = require("cross-spawn");
const crypto = require("crypto");
const path = require("path");

const hashFile = ".npm-install-changed.json";
const args = process.argv.slice(2);
const filteredArgs = args.filter(function (el) {
  return ["--recursive", "--bower", "--prune"].indexOf(el) === -1;
});
const recursive = args.indexOf("--recursive") >= 0;
const prune = args.indexOf("--prune") >= 0;
const bower = args.indexOf("--bower") >= 0;
const config = {};
var packager;

function checksum(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || "md5")
    .update(str, "utf8")
    .digest(encoding || "hex");
}

function componentsFolder(dir) {
  if (packager.bin === "bower") {
    var bowerComponents = path.join(dir, "bower_components");
    try {
      var bowerRc = JSON.parse(fs.readFileSync(path.join(dir, ".bowerrc")));
      packager.componentsFolder = path.join(dir, bowerRc.directory);
    } catch (e) {
    }

    return bowerComponents;
  } else if (packager.bin === "npm") {
    return path.join(dir, "node_modules");
  } else {
    throw "Packager not supported";
  }
}

function dependenciesFolders(dir) {
  var components = componentsFolder(dir);
  try {
    return fs
      .readdirSync(components)
      .filter(function (file) {
        return fs.statSync(path.join(components, file)).isDirectory();
      })
      .map(function (file) {
        return path.join(components, file);
      });
  } catch (e) {
    return [];
  }
}

function configJsonDepsHash(configJsonDir) {
  return new Promise(function (resolve) {
    fs.readFile(path.join(configJsonDir, packager.configJson), function (
      err,
      data
    ) {
      if (err) {
        resolve("noconfig");
        return;
      }

      var packageJson = JSON.parse(data);
      var newHash = "emptydeps";
      ["dependencies", "devDependencies"].forEach(function (dep) {
        for (var key in packageJson[dep]) {
          newHash = checksum(newHash + key + packageJson[dep][key]);
        }
      });

      if (recursive) {
        var hashPromises = dependenciesFolders(configJsonDir).map(function (
          dir
        ) {
          return configJsonDepsHash(dir);
        });

        Promise.all(hashPromises)
          .then(function (hashes) {
            for (var i = 0; i < hashes.length; i++) {
              newHash = checksum(newHash + hashes[i]);
            }

            resolve(newHash);
          })
          .catch(function (err) {
            console.log(err);
            //there was some problem here, log it but continue.
            resolve("exception");
          });
      } else {
        resolve(newHash);
      }
    });
  });
}

function spawnProcessAndHandleClose(action, hash, cb) {
  action = [].concat(action);
  console.log("Running " + packager.bin + " " + action.join(" ") + "...");
  var process = spawn(packager.bin, [action], {
    stdio: "inherit",
  });

  process.on("close", function (code) {
    if (code !== 0) {
      return;
    }
    if (typeof cb === "function") {
      cb(hash);
    }
  });
}

function postInstall(hash) {
  config[hashKey] = hash;

  //only save new hash if packager install was successful
  fs.writeFile(hashFile, JSON.stringify(config), (err) => {
    if (err) {
      console.log(err);
    }
  });

  if (prune) {
    spawnProcessAndHandleClose("prune");
  }
}

try {
  var config = JSON.parse(fs.readFileSync(hashFile));
} catch (e) {}

//determine what packager are we targeting
if (bower) {
  packager = {
    bin: "bower",
    configJson: "./bower.json",
  };
} else {
  packager = {
    bin: "npm",
    configJson: "./package.json",
  };
}

var hashKey = [packager.bin + "-hash"];

configJsonDepsHash(process.cwd())
  .then(function (hash) {
    if (hash === config[hashKey]) {
      console.log("Nothing to do.");
      return;
    }

    //looks like configJson dependencies have changed
    spawnProcessAndHandleClose(
      ["install"].concat(filteredArgs),
      hash,
      postInstall
    );
  })
  .catch(function (err) {
    console.log(err);
  });
*/
