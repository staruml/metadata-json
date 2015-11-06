/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var mdjson = require("../metadata-json");

mdjson.loadFromFile("UMLExamples.mdj");

mdjson.exportToHTML("html-docs", true);
