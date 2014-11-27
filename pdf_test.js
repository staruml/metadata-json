/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var mdjson = require("./mdjson");

// mdjson.loadFromFile("test/diagram_pdf_test.mdj");
mdjson.loadFromFile("test/StarUML2.mdj");

var diagrams = mdjson.Repository.getInstancesOf("Diagram");

var options = {
    size: "A4",
    layout: "landscape",
    showName: true
};
mdjson.exportToPDF(diagrams, "pdf-file.pdf", options);
