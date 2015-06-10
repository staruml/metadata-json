/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var mdjson = require("../metadata-json");

mdjson.loadFromFile("unicode_diagram.mdj");

// Retrive all diagrams
var diagrams = mdjson.Repository.getInstancesOf("Diagram");

// Options for PDF export
var options = {
    size: "A4",
    layout: "landscape",
    showName: true
};

mdjson.registerFont(__dirname + "/../../staruml/src/styles/fonts/Liberation");
mdjson.registerFont(__dirname + "/../../staruml/src/styles/fonts/NotoSans");
mdjson.registerFont(__dirname + "/../../staruml/src/styles/fonts/Lato");
mdjson.registerFont(__dirname + "/../../staruml/src/styles/fonts/Roboto");

mdjson.exportToPDF(diagrams, "out.pdf", options);
