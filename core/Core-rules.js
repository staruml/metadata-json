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
/*global define, type*/

define(function (require, exports, module) {
    "use strict";

    var Validator = require("core/Validator");

    var rules = [
        {
            id: "CORE001",
            message: "Name expected.",
            appliesTo: [ "Project", "Tag" ],
            constraint: function (elem) {
                return (elem.name && elem.name.length > 0);
            }
        },
        {
            id: "CORE002",
            message: "[Critical] DirectedRelationship should have source and target.",
            appliesTo: [ "DirectedRelationship" ],
            constraint: function (elem) {
                return (elem.source instanceof type.Model &&
                        elem.target instanceof type.Model);
            }
        },
        {
            id: "CORE003",
            message: "[Critical] UndirectedRelationship should have two ends.",
            appliesTo: [ "UndirectedRelationship" ],
            constraint: function (elem) {
                return (elem.end1 instanceof type.RelationshipEnd &&
                        elem.end1.reference instanceof type.Model &&
                        elem.end2 instanceof type.RelationshipEnd &&
                        elem.end2.reference instanceof type.Model);
            }
        }
    ];

    Validator.addRules(rules);

});
