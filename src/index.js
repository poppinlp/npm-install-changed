"use strict";

const { promises: fs } = require("fs");
const path = require("path");
const crypto = require("crypto");
const spawn = require("cross-spawn");

const ENCODING = "utf8";
const CHECKSUM_ALGORITHM = "md5";
const CHECKSUM_ENCODING = "hex";

const DEFAULT_HASHFILE = ".npm-install-changed.json";

exports.readHash = async () => {
  try {
    const hash = await fs.readFile(DEFAULT_HASHFILE, {
      encoding: ENCODING,
    });
    return JSON.parse(hash);
  } catch (err) {
    return {};
  }
};

try {
  var config = JSON.parse(fs.readFileSync(hashFile));
} catch (e) {}

/*
exports.checksum = (
  str,
  algorithm = CHECKSUM_ALGORITHM,
  encoding = CHECKSUM_ENCODING
) => {
  return crypto.createHash(algorithm).update(str, "utf8").digest(encoding);
};

function componentsFolder(dir) {
  if (packager.bin === "bower") {
    var bowerComponents = path.join(dir, "bower_components");
    try {
      var bowerRc = JSON.parse(fs.readFileSync(path.join(dir, ".bowerrc")));
      packager.componentsFolder = path.join(dir, bowerRc.directory);
    } catch (e) {}

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