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


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _, exports*/

var fs        = require("fs-extra"),
    crypto    = require('crypto'),
    ejs       = require('ejs'),
    markdown_ = require('markdown').markdown,
    mdjson    = require("../metadata-json");

// Predefined Filters
var filters = {

    // Convert text to possible filename in Windows.
    filename: function (text) {
        var fn = crypto.createHash('md5').update(text).digest('hex');
        return fn;
    },

    // Render markdown syntax
    markdown: function (text) {
        return markdown_.toHTML(text);
    }

};

function getBoundingBox(diagram) {
    var Canvas  = require('canvas'),
        _canvas = new Canvas(1, 1),
        ctx     = _canvas.getContext('2d'),
        canvas  = new mdjson.Graphics.Canvas(ctx);
    var boundingBox = diagram.getBoundingBox(canvas);
    return boundingBox;
}

function getImageData(diagram, type) {
    // Compute bounding box of diagram
    var boundingBox, rectExpand  = 10;
    boundingBox = getBoundingBox(diagram);
    boundingBox.expand(rectExpand);

    var Canvas  = require('canvas'),
        _canvas = new Canvas(boundingBox.getWidth(), boundingBox.getHeight(), type),
        ctx     = _canvas.getContext('2d'),
        canvas  = new mdjson.Graphics.Canvas(ctx);

    // Initialize new Canvas
    canvas.origin = new mdjson.Graphics.Point(-boundingBox.x1, -boundingBox.y1);
    canvas.zoomFactor = new mdjson.Graphics.ZoomFactor(1, 1);

    // Draw diagram
    diagram.drawDiagram(canvas);

    return _canvas.toBuffer();
}

/**
 * Export a given diagram to PNG image
 *
 * @param{Diagram} diagram Diagram to be exported
 * @param{string} filename File name for output image
 */
function exportDiagramAsPNG(diagram, filename) {
    fs.writeFileSync(filename, getImageData(diagram));
}

/**
 * Export a given diagram to SVG image
 *
 * @param{Diagram} diagram Diagram to be exported
 * @param{string} filename File name for output image
 */
function exportDiagramAsSVG(diagram, filename) {
    fs.writeFileSync(filename, getImageData(diagram, 'svg'));
}

/**
 * Export a set of diagrams at once
 *
 * @param{Array.<Diagram> | string} diagrams Array of diagrams or selector expression to be exported
 * @param{string} filename File name for output image file(s). You can use ejs expression (Default: `<%=diagram.name%>.png`)
 * @param{string} format Image format ("png" or "svg").
 * @param{Object} options Options used for ejs rendering
 * @param{function(err, file, elem)} fn Function to be called for each diagram is exported
 */
function exportDiagramBulk(diagrams, filename, format, options, fn) {
    diagrams = diagrams || [];
    filename = filename || "<%=diagram.name%>.png";
    format   = format   || "png";
    options  = options  || {};

    // if elements parameter is selector expression, retrieve them from Repository.
    if (_.isString(diagrams)) {
        diagrams = mdjson.Repository.select(diagrams) || [];
    }

    _.extend(options, {
        mdjson   : mdjson,
        root     : mdjson.getRoot()
    });

    // Append predefined filters
    if (!options.filters) {
        options.filters = {};
    }
    _.extend(options.filters, filters);

    var renderedFilename = "";
    for (var i = 0, len = diagrams.length; i < len; i++) {
        try {
            options.diagram = diagrams[i];
            renderedFilename = ejs.render(filename, options);
            fs.ensureFileSync(renderedFilename);
            if (format === "png") {
                exportDiagramAsPNG(options.diagram, renderedFilename);
            } else if (format === "svg") {
                exportDiagramAsSVG(options.diagram, renderedFilename);
            }
            if (_.isFunction(fn)) {
                fn(null, renderedFilename, options.diagram);
            }
        } catch (err) {
            if (_.isFunction(fn)) {
                fn(err);
            }
        }
    }
}

exports.exportDiagramAsPNG = exportDiagramAsPNG;
exports.exportDiagramAsSVG = exportDiagramAsSVG;
exports.exportDiagramBulk  = exportDiagramBulk;
