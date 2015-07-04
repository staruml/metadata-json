/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, __dirname, _*/
var fs      = require('fs');
var mdjson  = require("../metadata-json");
var Unicode = mdjson.Unicode;
var Font    = mdjson.Font;


// Register Fonts

var fonts = [], path, data;

path = __dirname + "/../../staruml/src/styles/fonts/NotoSans";
data = JSON.parse(fs.readFileSync(path + "/font.json", {encoding: "utf8"}));
_.map(data, function (d) { d.path = path; });
fonts = fonts.concat(data);

path = __dirname + "/../../staruml/src/styles/fonts/Liberation";
data = JSON.parse(fs.readFileSync(path + "/font.json", {encoding: "utf8"}));
_.map(data, function (d) { d.path = path; });
fonts = fonts.concat(data);

path = __dirname + "/../../staruml/src/styles/fonts/Lato";
data = JSON.parse(fs.readFileSync(path + "/font.json", {encoding: "utf8"}));
_.map(data, function (d) { d.path = path; });
fonts = fonts.concat(data);

path = __dirname + "/../../staruml/src/styles/fonts/Roboto";
data = JSON.parse(fs.readFileSync(path + "/font.json", {encoding: "utf8"}));
_.map(data, function (d) { d.path = path; });
fonts = fonts.concat(data);

path = __dirname + "/../../staruml/src/styles/fonts/SourceSansPro";
data = JSON.parse(fs.readFileSync(path + "/font.json", {encoding: "utf8"}));
_.map(data, function (d) { d.path = path; });
fonts = fonts.concat(data);

path = __dirname + "/../../staruml/src/styles/fonts/SourceCodePro";
data = JSON.parse(fs.readFileSync(path + "/font.json", {encoding: "utf8"}));
_.map(data, function (d) { d.path = path; });
fonts = fonts.concat(data);

_.each(fonts, function (font) {
    Font.registerFont(font);
});

// Retrive all diagrams
// mdjson.loadFromFile("diagram_pdf_test.mdj");
// mdjson.loadFromFile("unicode_diagram_kr.mdj");
mdjson.loadFromFile(__dirname + "/../../staruml/samples/StarUML2.mdj");
var diagrams = mdjson.Repository.getInstancesOf("Diagram");

// Options for PDF export
var options = {
    size: "A4",
    layout: "landscape",
    showName: true
};

mdjson.exportToPDF(diagrams, "out.pdf", options);



function _getStr(range) {
    var r = Unicode.UNICODE_RANGES[range];
    console.log("[" + r[0] + "," + r[1] + "] - " + r[2]);
    var t = "";
    for (var i = r[0]; i <= r[1]; i++) {
        t = t + String.fromCharCode(i);
    }
    return t;
}


// console.log(_getStr(119));
// 72,73,74,83,85,87,103,119

