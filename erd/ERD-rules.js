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
/*global define, _, type, meta*/

define(function (require, exports, module) {
    "use strict";

    var Validator = require("core/Validator");

    var rules = [
        {
            id: "ERD001",
            message: "Primary key cannot be nullable.",
            appliesTo: [ "ERDColumn" ],
            exceptions: [],
            constraint: function (elem) {
                if (elem.primaryKey === true && elem.nullable === true) {
                    return false;
                }
                return true;
            }
        },
        {
            id: "ERD002",
            message: "No relationship with the foreign key reference.",
            appliesTo: [ "ERDColumn" ],
            exceptions: [],
            constraint: function (elem) {
                if (elem.foreignKey && elem.referenceTo) {
                    var ends = elem._parent.getRelationshipEnds(true);
                    return _.some(ends, function (e) {
                        return e.reference === elem.referenceTo._parent;
                    });
                }
                return true;
            }
        }
    ];

    Validator.addRules(rules);

});
