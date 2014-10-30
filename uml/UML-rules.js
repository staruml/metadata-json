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
            id: "UML001",
            message: "Name expected.",
            appliesTo: [ "UMLModelElement" ],
            exceptions: [ "UMLParameter", "UMLDirectedRelationship", "UMLRelationshipEnd", "UMLUndirectedRelationship", "UMLAssociationClassLink", "UMLRegion", "UMLPseudostate", "UMLFinalState", "UMLControlNode", "UMLEndpoint", "UMLGate", "UMLImage" ],
            constraint: function (elem) {
                return (elem.name && elem.name.length > 0);
            }
        },
        {
            id: "UML002",
            message: "Name is already defined.",
            appliesTo: [ "UMLModelElement" ],
            exceptions: [ "UMLOperation" ],
            constraint: function (elem) {
                var parent   = elem._parent,
                    field    = elem.getParentField(),
                    siblings = parent[field],
                    i, len;
                for (i = 0, len = siblings.length; i < len; i++) {
                    var sibling = siblings[i];
                    if (elem !== sibling && elem.name.length > 0 && elem.name === sibling.name) {
                        return false;
                    }
                }
                return true;
            }
        }
    ];

    Validator.addRules(rules);

});
