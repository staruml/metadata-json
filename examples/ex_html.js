/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var mdjson = require('../metadata-json');

// mdjson.loadFromFile("../test/diagram_pdf_test.mdj");
mdjson.loadFromFile("../test/StarUML2.mdj");

mdjson.exportToHTML("html-out", true);
