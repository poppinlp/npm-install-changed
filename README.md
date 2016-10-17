# npm-install-changed

Speed up your CI node builds by only running `npm install` when dependencies changed.

[![version](https://img.shields.io/npm/v/npm-install-changed.svg)](http://npm.im/npm-install-changed)
[![downloads](https://img.shields.io/npm/dm/npm-install-changed.svg)](http://npm-stat.com/charts.html?package=npm-install-changed)
[![MIT License](https://img.shields.io/npm/l/npm-install-changed.svg)](http://opensource.org/licenses/MIT)

- - -

### Installation

```shell
$ npm install -g npm-install-changed
```

### Usage

In the root folder of your node project run:

```
npm-install-changed
```

instead of the usual `npm install`

### Arguments

Use `--bower` for bower package manager. To do recursive checking on dependencies, use `--recursive`. Use `--prune` to remove unused dependencies after running install.

### License

> MIT License 2016 © Jose Pereira
