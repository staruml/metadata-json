var mdjson = require("./metadata-json");

var fs = require('fs');

var Canvas = require('canvas');

/**
 * Get image data of diagram
 * @param {Diagram} diagram
 * @return {Buffer}
 */
function getImageData(diagram, type) {
    // Make a new canvas element for making image data
    var canvasElement = new Canvas(500, 500, type),
        canvas        = new mdjson.Graphics.Canvas(canvasElement.getContext("2d")),
        boundingBox   = diagram.getBoundingBox(canvas),
        rectExpand    = 10;

    // Initialize new canvas
    boundingBox.expand(rectExpand);
    canvas.origin = new mdjson.Graphics.Point(-boundingBox.x1, -boundingBox.y1);
    canvas.zoomFactor = new mdjson.Graphics.ZoomFactor(1, 1);
    canvasElement.width = boundingBox.getWidth();
    canvasElement.height = boundingBox.getHeight();

    // Draw diagram to the new canvas
    diagram.drawDiagram(canvas);
    return canvasElement.toBuffer();
}

// mdjson.loadFromFile("test/diagram_pdf_test.mdj");
mdjson.loadFromFile("test/StarUML2.mdj");

var diagrams = mdjson.Repository.getInstancesOf("Diagram");

fs.writeFile('out.png', getImageData(diagrams[2]));

