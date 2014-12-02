/*
 * Copyright (c) 2013-2014 Minkyu Lee. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of Minkyu Lee. The intellectual and technical concepts
 * contained herein are proprietary to Minkyu Lee and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Minkyu Lee (niklaus.lee@gmail.com).
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, _*/

var fs  = require("fs"),
    ejs = require("ejs");

/**
 * Render a template file with data and save to a file
 * @param{string} templatePath
 * @param{Object} data
 */
function render(templatePath, resultPath, data) {
    var template = fs.readFileSync(templatePath, 'utf8');
    var str = ejs.render(template, data);
    fs.writeFileSync(resultPath, str);
}

exports.render = render;
