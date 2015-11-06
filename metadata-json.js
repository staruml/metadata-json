/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _, __dirname, exports*/

var fs          = require('fs-extra'),
    requirejs   = require('requirejs'),
    ejs         = require('ejs'),
    render      = require('./lib/render'),
    pdf         = require('./lib/pdf'),
    html        = require('./lib/html'),
    image       = require('./lib/image');

// load underscore (_) as a global variable
global._ = require('underscore');

requirejs.config({
    paths: {
        "core/Core-meta"           : __dirname + "/core/Core-meta",
        "core/Core-rules"          : __dirname + "/core/Core-rules",
        "core/Core"                : __dirname + "/core/Core",
        "core/Global"              : __dirname + "/core/Global",
        "core/Graphics"            : __dirname + "/core/Graphics",
        "core/IdGenerator"         : __dirname + "/core/IdGenerator",
        "core/MetaModelManager"    : __dirname + "/core/MetaModelManager",
        "core/OperationBuilder"    : __dirname + "/core/OperationBuilder",
        "core/Repository"          : __dirname + "/core/Repository",
        "core/Toolkit"             : __dirname + "/core/Toolkit",
        "core/Validator"           : __dirname + "/core/Validator",
        "core/PreferenceManager"   : __dirname + "/core/PreferenceManager",
        "uml/UML-meta"             : __dirname + "/uml/UML-meta",
        "uml/UML-rules"            : __dirname + "/uml/UML-rules",
        "uml/UML"                  : __dirname + "/uml/UML",
        "uml/UMLDiagram"           : __dirname + "/uml/UMLDiagram",
        "erd/ERD-meta"             : __dirname + "/erd/ERD-meta",
        "erd/ERD-rules"            : __dirname + "/erd/ERD-rules",
        "erd/ERD"                  : __dirname + "/erd/ERD",
        "flowchart/Flowchart-meta" : __dirname + "/flowchart/Flowchart-meta",
        "flowchart/Flowchart"      : __dirname + "/flowchart/Flowchart",
        "lib/Unicode"              : __dirname + "/lib/Unicode",
        "lib/Font"                 : __dirname + "/lib/Font",
        "lib/PDFGraphics"          : __dirname + "/lib/PDFGraphics"
    }
});

requirejs("core/Core-meta");
requirejs("core/Core-rules");
requirejs("uml/UML-meta");
requirejs("uml/UML-rules");
requirejs("erd/ERD-meta");
requirejs("erd/ERD-rules");
requirejs("flowchart/Flowchart-meta");

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
    ERD              = requirejs("erd/ERD"),
    Flowchart        = requirejs("flowchart/Flowchart"),
    Unicode          = requirejs("lib/Unicode"),
    Font             = requirejs("lib/Font"),
    PDFGraphics      = requirejs("lib/PDFGraphics");


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

exports.Core               = Core;
exports.Graphics           = Graphics;
exports.Toolkit            = Toolkit;
exports.IdGenerator        = IdGenerator;
exports.MetaModelManager   = MetaModelManager;
exports.OperationBuilder   = OperationBuilder;
exports.Repository         = Repository;
exports.Validator          = Validator;
exports.UML                = UML;
exports.UMLDiagram         = UMLDiagram;
exports.ERD                = ERD;
exports.Flowchart          = Flowchart;
exports.Unicode            = Unicode;
exports.Font               = Font;
exports.PDFGraphics        = PDFGraphics;

exports.loadFromFile       = loadFromFile;
exports.getRoot            = getRoot;
exports.render             = render.render;
exports.renderBulk         = render.renderBulk;
exports.exportToPDF        = pdf.exportToPDF;
exports.exportToHTML       = html.exportToHTML;
exports.registerFont       = pdf.registerFont;
exports.exportDiagramAsPNG = image.exportDiagramAsPNG;
exports.exportDiagramAsSVG = image.exportDiagramAsSVG;
exports.exportDiagramBulk  = image.exportDiagramBulk;
