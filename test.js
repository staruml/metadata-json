/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var mdjson = require("./mdjson");

mdjson.loadFromFile("test.mdj");
console.log(mdjson.Validator.validate());
