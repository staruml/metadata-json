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


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, exports, type, _, __dirname*/

var fs         = require('fs-extra'),
    escapeHtml = require('escape-html'),
    render     = require('./render'),
    mdjson     = require('../metadata-json');

function toFilename(elem) {
    return render.filters.filename(elem._id);
}

// Extended EJS Filters
var filters = {
    toFilename: function (elem) {
        return toFilename(elem);
    },
    toUrl: function (elem) {
        var fn = toFilename(elem);
        return fn + ".html";
    },
    toText: function (elem) {
        return elem.getNodeText();
    },
    toName: function (elem) {
        if (elem.name.trim().length === 0) {
            return "(unnamed)";
        }
        return elem.name;
    },
    toIcon: function (elem) {
        return "_" + elem.getNodeIcon();
    },
    toDiagram: function (elem) {
        var fn = toFilename(elem);
        return "../diagrams/" + fn + ".svg";
    },
    toType: function (obj) {
        if (typeof obj === "undefined" || obj === null || (typeof obj === "string" && obj.trim().length === 0)) {
            return "<span class='label label-info'>none</span>";
        } else if (obj instanceof type.Model) {
            return "<a href='" + filters.toUrl(obj) + "'>" + escapeHtml(obj.name) + "</a>";
        }
        return escapeHtml(obj);
    },
    toValue: function (obj) {
        if (typeof obj === "undefined") {
            return "<span class='label label-info'>void</span>";
        } else if (obj === null) {
            return "<span class='label label-info'>null</span>";
        } else if (typeof obj === "boolean") {
            return "<span class='label label-info'>" + obj + "</span>";
        } else if (typeof obj === "number") {
            return "<span class='label label-info'>" + obj + "</span>";
        } else if (typeof obj === "string") {
            return escapeHtml(obj);
        } else if (obj instanceof type.UMLStereotype) {
            return "<a href='" + filters.toUrl(obj) + "'>" +
                   "<span class='node-icon " + filters.toIcon(obj) + "'></span>" +
                   "«" + escapeHtml(filters.toText(obj)) + "»" +
                   "</a>";
        } else if (obj instanceof type.Model) {
            return "<a href='" + filters.toUrl(obj) + "'>" +
                   "<span class='node-icon " + filters.toIcon(obj) + "'></span>" +
                   escapeHtml(filters.toText(obj)) +
                   "</a>";
        }
        return escapeHtml(obj);
    }
};


/**
 * Export to HTML
 * @param{string} targetDir Path where generated HTML files to be located
 * @param{boolean} exportDiagram Indicate whether generate diagram images or not
 */
function exportToHTML(targetDir, exportDiagram) {
    fs.ensureDirSync(targetDir);
    fs.ensureDirSync(targetDir + "/contents");
    fs.ensureDirSync(targetDir + "/diagrams");
    fs.copySync(__dirname + "/../resources/html/assets", targetDir + "/assets");
    // Generate html documents
    try {
        var root = mdjson.getRoot();
        mdjson.render(__dirname + "/../resources/html/templates/index.ejs", targetDir + "/index.html", root, { filters: filters });
        mdjson.render(__dirname + "/../resources/html/templates/navigation.ejs", targetDir + "/contents/navigation.html", root, { filters: filters });
        mdjson.render(__dirname + "/../resources/html/templates/diagrams.ejs", targetDir + "/contents/diagrams.html", root, { filters: filters });
        mdjson.render(__dirname + "/../resources/html/templates/element_index.ejs", targetDir + "/contents/element_index.html", root, { filters: filters });
        mdjson.renderBulk(__dirname + "/../resources/html/templates/content.ejs", targetDir + "/contents/<%=: element | toFilename %>.html", "@Model", { filters: filters }, function (err, file, elem) {
            if (err) {
                console.error(err);
            }
        });
    } catch (err) {
        console.error(err);
    }
    // Export diagram images
    if (exportDiagram) {
        var diagrams = mdjson.Repository.getInstancesOf("Diagram");
        _.each(diagrams, function (d) {
            mdjson.exportDiagramAsSVG(d, targetDir + "/diagrams/" + toFilename(d) + ".svg");
        });
    }
}

exports.exportToHTML = exportToHTML;
