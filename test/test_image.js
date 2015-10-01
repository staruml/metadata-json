/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var mdjson      = require("../metadata-json");

// mdjson.loadFromFile("Examples.mdj");
mdjson.loadFromFile("unicode_diagram.mdj");

// Retrive all diagrams
var diagrams = mdjson.Repository.getInstancesOf("Diagram");

diagrams.forEach(function (d) {
    mdjson.exportDiagramAsPNG(d, d.name + ".png");
    mdjson.exportDiagramAsSVG(d, d.name + ".svg");
});
