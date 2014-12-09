/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _, __dirname, exports*/

var fs          = require("fs-extra");
    requirejs   = require("requirejs"),
    PDFDocument = require("pdfkit"),
    ejs         = require("ejs"),
    generator   = require("./lib/generator");

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

/**
 * Load .mdj file
 * @param{string} fullPath
 * @return{Element} Root element in .mdj file
 */
function loadFromFile(fullPath) {
    var data = fs.readFileSync(fullPath, {encoding: "utf8"});
    return Repository.readObject(data);
}


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
    var canvas = new PDFGraphics.Canvas(doc);
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

/**
 * Export to HTML
 * @param{Project} project Project to be exported
 * @param{string} targetDir Path where generated HTML files to be located
 */
function exportToHTML(project, targetDir) {
    fs.ensureDirSync(targetDir);
    fs.ensureDirSync(targetDir + "/contents");
    fs.ensureDirSync(targetDir + "/diagrams");
    fs.copySync(__dirname + "/html/assets", targetDir + "/assets");

    var options = {
        mdj: exports,
        project: project
    };

    try {
        generator.render(__dirname + "/html/templates/index.ejs", targetDir + "/index.html", options);
        generator.render(__dirname + "/html/templates/navigation.ejs", targetDir + "/contents/navigation.html", options);
        generator.render(__dirname + "/html/templates/diagrams.ejs", targetDir + "/contents/diagrams.html", options);
        generator.render(__dirname + "/html/templates/element_index.ejs", targetDir + "/contents/element_index.html", options);

        // for Project
        options.element = project;
        generator.render(__dirname + "/html/templates/content.ejs", targetDir + "/contents/home.html", options);

        // for Elements
        project.traverse(function (element) {
            if (!(element instanceof type.Project) && element instanceof type.Model) {
                options.element = element;
                generator.render(__dirname + "/html/templates/content.ejs", targetDir + "/contents/" + generator.toFilename(element)  + ".html", options);
            }
        });
    } catch (err) {
        console.error(err);
    }
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
exports.exportToPDF      = exportToPDF;
exports.exportToHTML     = exportToHTML;
