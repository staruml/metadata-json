/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, _*/

var fs  = require("fs-extra");
var mdj = require("./metadata-json");
var gen = require("./lib/generator");

var project = mdj.loadFromFile("test/diagram_pdf_test.mdj");
// var project = mdj.loadFromFile("test/StarUML2.mdj");



function convertToWindowsFilename(filename) {
    return filename.replace(/[\/\*<>:\\\"|?]/g, "_");
}



var targetDir = "test/html-out";
fs.ensureDirSync(targetDir);
fs.ensureDirSync(targetDir + "/contents");
fs.copySync("html/assets", targetDir + "/assets");


gen.render("html/templates/index.ejs", targetDir + "/index.html", {});
gen.render("html/templates/navigation.ejs", targetDir + "/contents/navigation.html", { project: project });

project.traverse(function (element) {
    if (element instanceof type.Model) {
        var name = convertToWindowsFilename(element.getPathname());
        gen.render("html/templates/content.ejs", targetDir + "/contents/" + name  + ".html", { element: element });
    }
});
