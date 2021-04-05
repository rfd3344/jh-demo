'use strict';

const fs   = require('fs');
const path = require('path');

var logger = require('./logger').getLogger();
const pkg = require(path.join(__dirname, '../../', 'package.json'));

module.exports.getAppName = function () {
  return pkg.name;
};

module.exports.getAppVersion = function () {
  return pkg.version;
};

module.exports.getAppVendor = function () {
  return pkg.author;
};

module.exports.getAppDescription = function () {
  return pkg.description;
};

module.exports.printHeaderAndLogo = function () {
  const logoFile = path.join(__dirname, 'logo.txt');
  if (fs.existsSync(logoFile)) {
    const logo = fs.readFileSync(logoFile, 'utf8').toString();
    const lines = logo.split('\n');
    lines.forEach(function (line) {
      logger.info(line);
    });
  }
};