/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var mdjson = require("../metadata-json");

mdjson.loadFromFile("diagram_pdf_test.mdj");

// Retrive all diagrams
var diagrams = mdjson.Repository.getInstancesOf("Diagram");

// Options for PDF export
var options = {
    size: "A4",
    layout: "landscape",
    showName: true
};

mdjson.registerFontSet(
    "Noto Sans",
    __dirname + "/../../pdfkit-test/NotoSansCJKkr-Regular.ttf",
    __dirname + "/../../pdfkit-test/NotoSansCJKkr-Bold.ttf",
    __dirname + "/../../pdfkit-test/NotoSansCJKkr-Regular.ttf",
    __dirname + "/../../pdfkit-test/NotoSansCJKkr-Bold.ttf",
    true);

mdjson.exportToPDF(diagrams, "out.pdf", options);
