var mdjson = require('../metadata-json');

mdjson.loadFromFile("diagram_test.mdj");

// Retrive all diagrams
var diagrams = mdjson.Repository.getInstancesOf("Diagram");

// Options for PDF export
var options = {
    size: "A4",
    layout: "landscape",
    showName: true
};

mdjson.exportToPDF(diagrams, "out.pdf", options);
