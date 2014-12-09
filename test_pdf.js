/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var mdj = require("./metadata-json");

// mdj.loadFromFile("test/diagram_pdf_test.mdj");
mdj.loadFromFile("test/StarUML2.mdj");

var diagrams = mdj.Repository.getInstancesOf("Diagram");

var options = {
    size: "A4",
    layout: "landscape",
    showName: true
};
mdj.exportToPDF(diagrams, "pdf-file.pdf", options);
