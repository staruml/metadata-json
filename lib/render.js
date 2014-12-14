/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, exports*/

var fs       = require('fs-extra'),
    _        = require("underscore"),
    ejs      = require('ejs'),
    mdjson   = require('../metadata-json');

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
    
    if (options.filters) {
        _.extend(ejs.filters, options.filters);
    }    
    
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
 */
function renderBulk(templatePath, outputPath, elements, options) {
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
    
    if (options.filters) {
        _.extend(ejs.filters, options.filters);
    }
    
    for (var i = 0, len = elements.length; i < len; i++) {
        options.element = elements[i];
        rendered = ejs.render(template, options);
        renderedOutput = ejs.render(outputPath, options);
        fs.ensureFileSync(renderedOutput);
        fs.writeFileSync(renderedOutput, rendered);
    }
}

// Default EJS Filter functions

exports.render     = render;
exports.renderBulk = renderBulk;
