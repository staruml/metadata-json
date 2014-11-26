/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _, __dirname, exports*/

var fs          = require("fs"),
    requirejs   = require("requirejs"),
    PDFDocument = require("pdfkit");

// load underscore (_) as a global variable
global._ = require("underscore");

requirejs.config({
    paths: {
        "core/Core-meta"        : __dirname + "/core/Core-meta",
        "core/Core-rules"       : __dirname + "/core/Core-rules",
        "core/Core"             : __dirname + "/core/Core",
        "core/Global"           : __dirname + "/core/Global",
        "core/Graphics"         : __dirname + "/core/Graphics",
        "core/IdGenerator"      : __dirname + "/core/IdGenerator",
        "core/MetaModelManager" : __dirname + "/core/MetaModelManager",
        "core/OperationBuilder" : __dirname + "/core/OperationBuilder",
        "core/Repository"       : __dirname + "/core/Repository",
        "core/Toolkit"          : __dirname + "/core/Toolkit",
        "core/Validator"        : __dirname + "/core/Validator",
        "uml/UML-meta"          : __dirname + "/uml/UML-meta",
        "uml/UML-rules"         : __dirname + "/uml/UML-rules",
        "uml/UML"               : __dirname + "/uml/UML",
        "uml/UMLDiagram"        : __dirname + "/uml/UMLDiagram",
        "pdf/PDFGraphics"       : __dirname + "/pdf/PDFGraphics"
    }
});

var _global          = requirejs("core/Global").global,
    Graphics         = requirejs("core/Graphics"),
    Toolkit          = requirejs("core/Toolkit"),
    IdGenerator      = requirejs("core/IdGenerator"),
    Core             = requirejs("core/Core"),
    MetaModelManager = requirejs("core/MetaModelManager"),
    OperationBuilder = requirejs("core/OperationBuilder"),
    Repository       = requirejs("core/Repository"),
    Validator        = requirejs("core/Validator"),
    UML              = requirejs("uml/UML"),
    UMLDiagram       = requirejs("uml/UMLDiagram"),
    PDFGraphics      = requirejs("pdf/PDFGraphics");

requirejs("core/Core-meta");
requirejs("core/Core-rules");
requirejs("uml/UML-meta");
requirejs("uml/UML-rules");


function loadFromFile(fullPath) {
    var data = fs.readFileSync(fullPath, {encoding: "utf8"});
    return Repository.readObject(data);
}


function exportToPDF(diagram, fullPath) {
    var doc = new PDFDocument();
    
    doc.pipe(fs.createWriteStream(fullPath));

    // Skip jQuery event triggers
    _global.$ = function () {
        return { 
            triggerHandler: function () {
            }
        };
    };
    
    
    var canvas = new PDFGraphics.Canvas(doc);
    
    diagram.drawDiagram(canvas, false);
    
    doc.end();
    
}


// Public APIs

exports.Core             = Core;
exports.Graphics         = Graphics;
exports.Toolkit          = Toolkit;
exports.IdGenerator      = IdGenerator;
exports.MetaModelManager = MetaModelManager;
exports.OperationBuilder = OperationBuilder;
exports.Repository       = Repository;
exports.Validator        = Validator;
exports.UML              = UML;
exports.UMLDiagram       = UMLDiagram;
exports.PDFGraphics      = PDFGraphics;

exports.loadFromFile     = loadFromFile;
exports.exportToPDF      = exportToPDF;
