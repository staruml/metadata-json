/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, exports*/

var fs          = require('fs-extra'),
    PDFDocument = require('pdfkit'),
    mdjson      = require('../metadata-json');

var PDF_MARGIN = 30;
var PDF_DEFAULT_ZOOM = 1; // Default Zoom Level

/**
 * Export diagrams to a PDF file
 * @param{Array.<Diagram>} diagrams
 * @param{string} fullPath
 * @param{Object} options
 */
function exportToPDF(diagrams, fullPath, options) {
    var doc = new PDFDocument(options);
    doc.pipe(fs.createWriteStream(fullPath));
    var canvas = new mdjson.PDFGraphics.Canvas(doc);
    var i, len;
    for (i = 0, len = diagrams.length; i < len; i++) {
        if (i > 0) {
            doc.addPage(options);
        }
        var diagram = diagrams[i],
            box     = diagram.getBoundingBox(canvas),
            w       = doc.page.width - PDF_MARGIN * 2,
            h       = doc.page.height - PDF_MARGIN * 2,
            zoom    = Math.min(w / box.x2, h / box.y2);

        canvas.zoomFactor.numer = Math.min(zoom, PDF_DEFAULT_ZOOM);
        canvas.origin.x = PDF_MARGIN;
        canvas.origin.y = PDF_MARGIN;
        diagram.drawDiagram(canvas, false);
        
        if (options.showName) {
            doc.fontSize(10);
            doc.font("Helvetica");
            doc.text(diagram.getPathname(), PDF_MARGIN, PDF_MARGIN-10);
        }
    }
    doc.end();
}

exports.exportToPDF = exportToPDF;
