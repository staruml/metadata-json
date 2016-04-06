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
