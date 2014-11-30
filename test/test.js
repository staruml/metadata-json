/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var mdj = require("./metadata-json");

mdj.loadFromFile("test.mdj");
console.log(mdj.Validator.validate());
