/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _, __dirname, exports*/

var fs          = require('fs-extra'),
    requirejs   = require('requirejs'),
    ejs         = require('ejs'),
    render      = require('./lib/render'),
    pdf         = require('./lib/pdf'),
    html        = require('./lib/html');

// load underscore (_) as a global variable
global._ = require('underscore');

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
        "lib/PDFGraphics"       : __dirname + "/lib/PDFGraphics"
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
    PDFGraphics      = requirejs("lib/PDFGraphics");

requirejs("core/Core-meta");
requirejs("core/Core-rules");
requirejs("uml/UML-meta");
requirejs("uml/UML-rules");


/**
 * Root element (typically an instance of type.Project)
 * @private
 * @type {Element}
 */
var _root = null;

/**
 * Load a model file (.mdj)
 * @param{string} path
 * @return{Element} Root element in .mdj file
 */
function loadFromFile(path) {
    var data = fs.readFileSync(path, {encoding: "utf8"});
    _root = Repository.readObject(data);
    return _root;
}

/**
 * Return a root element (typically an instanceof Project)
 * @return {Element} a root element
 */
function getRoot() {
    return _root;
}


// Skip all of jQuery event triggers
_global.$ = function () {
    return { triggerHandler: function () {} };
};

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
exports.getRoot          = getRoot;
exports.render           = render.render;
exports.renderBulk       = render.renderBulk;
exports.exportToPDF      = pdf.exportToPDF;
exports.exportToHTML     = html.exportToHTML;
