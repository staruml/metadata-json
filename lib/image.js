/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var fs       = require("fs"),
    mdjson   = require("../metadata-json");

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

function exportDiagramAsPNG(diagram, filename) {
    fs.writeFileSync(filename, getImageData(diagram));
}

function exportDiagramAsSVG(diagram, filename) {
    fs.writeFileSync(filename, getImageData(diagram, 'svg'));
}

exports.exportDiagramAsPNG = exportDiagramAsPNG;
exports.exportDiagramAsSVG = exportDiagramAsSVG;
