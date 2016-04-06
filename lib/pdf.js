/*
 * Copyright (c) 2014 MKLab. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, loopfunc: true */
/*global require, exports, _*/

var fs          = require('fs-extra'),
    PDFDocument = require('pdfkit'),
    mdjson      = require('../metadata-json');

var PDF_MARGIN = 30;
var PDF_DEFAULT_ZOOM = 1; // Default Zoom Level

/**
 * Registered TTF fonts
 * @type{{name:string, path:string}}
 */
var _fonts = [];

/**
 * Register a font
 * @param {string} folder
 */
function registerFont(folder) {
    var data = fs.readFileSync(folder + "/font.json", {encoding: "utf8"});
    var fontArray = JSON.parse(data);
    for (var i = 0, len = fontArray.length; i < len; i++) {
        var font = fontArray[i];
        font.path = folder;
        mdjson.Font.registerFont(font);
    }
}

/**
 * Export diagrams to a PDF file
 * @param{Array.<Diagram>} diagrams
 * @param{string} fullPath
 * @param{Object} options
 */
function exportToPDF(diagrams, fullPath, options) {
    var doc = new PDFDocument(options);
    _.each(mdjson.Font.files, function (path, name) {
        doc.registerFont(name, path);
    });
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

        _.each(diagram.ownedViews, function (v) {
            v.setup(canvas);
            v.update(canvas);
            v.size(canvas);
            v.arrange(canvas);
        });

        diagram.drawDiagram(canvas, false);

        if (options.showName) {
            doc.fontSize(10);
            doc.font("Helvetica");
            doc.text(diagram.getPathname(), PDF_MARGIN, PDF_MARGIN-10);
        }
    }
    doc.end();
}

exports.registerFont = registerFont;
exports.exportToPDF  = exportToPDF;
