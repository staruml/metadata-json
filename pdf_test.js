/*

var fs          = require("fs"),
    PDFDocument = require("pdfkit");

var doc = new PDFDocument();

doc.pipe(fs.createWriteStream("file.pdf"));

doc.moveTo(0, 20)
   .lineTo(100, 160)
   .quadraticCurveTo(130, 200, 150, 120)
   .bezierCurveTo(190, -40, 200, 200, 300, 150)
   .lineTo(400, 90)
   .stroke();

doc.end();

*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var mdjson = require("./mdjson");

mdjson.loadFromFile("test/diagram_pdf_test.mdj");
// var diagram = mdjson.Repository.get("AAAAAAFF+qBtyKM79qY=");
var diagram = mdjson.Repository.get("AAAAAAFJ7F7C7gM5JcM=");

mdjson.exportToPDF(diagram, "pdf-file.pdf");

