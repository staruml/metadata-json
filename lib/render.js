/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, exports*/

var fs       = require('fs-extra'),
    _        = require("underscore"),
    ejs      = require('ejs'),
    markdown_ = require('markdown').markdown,
    mdjson   = require('../metadata-json');

// Predefined Filters
var filters = {
    
    // Convert text to possible filename in Windows.
    filename: function (text) {
        var fn = text
            .replace(/_/g,  "_ul_")  // `_` underline
            .replace(/</g,  "_lt_")  // `<` less than
            .replace(/>/g,  "_gt_")  // `>` greater than
            .replace(/\\/g, "_bs_")  // `\` back-slash
            .replace(/\//g, "_sl_")  // `/` slash 
            .replace(/\*/g, "_ak_")  // `*` asterisk
            .replace(/:/g,  "_cl_")  // `:` colon
            .replace(/"/g,  "_qu_")  // `"` quote
            .replace(/\|/g, "_br_")  // `|` bar
            .replace(/\?/g, "_qs_"); // `?` question
        return fn;
    },

    // Render markdown syntax
    markdown: function (text) {
        return markdown_.toHTML(text);
    }

};


/**
 * Render a template file with options and save to an output file
 *
 * @param{string} templatePath Path for a template file
 * @param{string} outputPath Path for an output file. You can use ejs expression (e.g. `out/<% element.name %>.java`)
 * @param{Element} element Element to be rendered
 * @param{Object} options Options used for ejs rendering
 */
function render(templatePath, outputPath, element, options) {        
    var template = fs.readFileSync(templatePath, 'utf8'),
        rendered = "",
        renderedOutput = "";
    
    element  = element || null;
    options  = options || {};
    
    _.extend(options, {
        mdjson   : mdjson,
        filename : templatePath, // to avoid "include" error
        root     : mdjson.getRoot(),
        element  : element
    });

    // Append predefined filters
    if (!options.filters) {
        options.filters = {};
    }    
    _.extend(options.filters, filters);
    
    rendered = ejs.render(template, options);
    renderedOutput = ejs.render(outputPath, options);
    fs.ensureFileSync(renderedOutput);
    fs.writeFileSync(renderedOutput, rendered);
}

/**
 * Render a template file with a set of elements and save to multple output files at once
 *
 * @param{string} templatePath Path for a template file
 * @param{string} outputPath Path for output file(s). You can use ejs expression (e.g. `out/<% element.name %>.java`)
 * @param{Array.<Element> | string} elements Array of elements or selector expression to be rendered
 * @param{Object} options Options used for ejs rendering
 * @param{function(err, file, elem)} fn Function to be called for each element is rendered
 */
function renderBulk(templatePath, outputPath, elements, options, fn) {
    var template = fs.readFileSync(templatePath, 'utf8'),
        rendered = "",
        renderedOutput = "";

    elements = elements || [];
    options  = options || {};
    
    // if elements parameter is selector expression, retrieve them from Repository.
    if (_.isString(elements)) {
        elements = mdjson.Repository.select(elements) || [];
    }

    _.extend(options, {
        mdjson   : mdjson,
        filename : templatePath, // to avoid "include" error
        root     : mdjson.getRoot()
    });
    
    // Append predefined filters
    if (!options.filters) {
        options.filters = {};
    }    
    _.extend(options.filters, filters);
    
    for (var i = 0, len = elements.length; i < len; i++) {
        try {
            options.element = elements[i];
            rendered = ejs.render(template, options);
            renderedOutput = ejs.render(outputPath, options);
            fs.ensureFileSync(renderedOutput);
            fs.writeFileSync(renderedOutput, rendered);
            if (_.isFunction(fn)) {
                fn(null, renderedOutput, options.element);
            }
        } catch (err) {
            if (_.isFunction(fn)) {
                fn(err);
            }
        }
    }
}

// Default EJS Filter functions

exports.render     = render;
exports.renderBulk = renderBulk;
exports.filters    = filters;
