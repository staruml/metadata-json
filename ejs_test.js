
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var mdj = require("./metadata-json");
var gen = require("./lib/generator");

// mdj.loadFromFile("test/diagram_pdf_test.mdj");
mdj.loadFromFile("test/StarUML2.mdj");

var diagrams = mdj.Repository.getInstancesOf("Diagram");

gen.render("test/template.ejs", "result.html", {dgms: diagrams}); 
