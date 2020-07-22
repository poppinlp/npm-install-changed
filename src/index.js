"use strict";

const { promises: fs } = require("fs");
const path = require("path");
const crypto = require("crypto");
const spawn = require("cross-spawn");

const ENCODING = "utf8";
const CHECKSUM_ALGORITHM = "md5";
const CHECKSUM_ENCODING = "hex";

const DEFAULT_HASHFILE = ".npm-install-changed.json";

exports.readHistoryHash = async () => {
  try {
    const hash = await fs.readFile(DEFAULT_HASHFILE, {
      encoding: ENCODING,
    });
    return JSON.parse(hash);
  } catch (err) {
    return {};
  }
};

exports.getDepsHash = async (pkgJsonPath,) => {
  fs.readFile(path.join(pkgJsonDir))
};

exports.spawnProcess = (bin, args = []) => new Promise((resolve, reject) => {
  const process = spawn(bin, args, {
    stdio: "inherit",
  });
  process.on('error', reject);
  process.on("close", resolve);
});

const checksum = (
  str,
  algorithm = CHECKSUM_ALGORITHM,
  encoding = CHECKSUM_ENCODING
) => {
  return crypto.createHash(algorithm).update(str, "utf8").digest(encoding);
};

/*
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
*/