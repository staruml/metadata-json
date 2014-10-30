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

/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, type, _*/

define(function (require, exports, module) {
    "use strict";

    var Validator = require("core/Validator");

    var rules = [
        {
            id: "UML003",
            message: "Duplicated names in attributes.",
            appliesTo: [ "UMLClassifier" ],
            constraint: function (elem) {
                var attributeNames = _.map(elem.attributes, function (attr) { return attr.name; });
                var uniq = _.uniq(attributeNames);
                return (attributeNames.length === uniq.length);
            }
        }
    ];

    Validator.addRules(rules);

});
