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
/*global define, app*/

define(function (require, exports, module) {
    "use strict";

    var MetaModelManager  = require("core/MetaModelManager");

    var metaModel = {
        "ERDElement": {
            "kind": "class",
            "super": "ExtensibleModel"
        },
        "ERDDataModel": {
            "kind": "class",
            "super": "ERDElement"
        },
        "ERDDiagram": {
            "kind": "class",
            "super": "Diagram",
            "views": [
                "ERDEntityView",
                "ERDRelationshipView",
            ]
        },
        "ERDColumn": {
            "kind": "class",
            "super": "ERDElement",
            "attributes": [
                { "name": "type",        "kind": "prim", "type": "String",    "visible": true, "options": [ "VARCHAR", "BOOLEAN", "INTEGER", "CHAR", "BINARY", "VARBINARY", "BLOB", "TEXT", "SMALLINT", "BIGINT", "DECIMAL", "NUMERIC", "FLOAT", "DOUBLE", "BIT", "DATE", "TIME", "DATETIME", "TIMESTAMP", "GEOMETRY", "POINT", "LINESTRING", "POLYGON" ] },
                { "name": "length",      "kind": "prim", "type": "String",    "visible": true },
                { "name": "primaryKey",  "kind": "prim", "type": "Boolean",   "visible": true },
                { "name": "foreignKey",  "kind": "prim", "type": "Boolean",   "visible": true },
                { "name": "referenceTo", "kind": "ref",  "type": "ERDColumn", "visible": true },
                { "name": "nullable",    "kind": "prim", "type": "Boolean",   "visible": true },
                { "name": "unique",      "kind": "prim", "type": "Boolean",   "visible": true }
            ]
        },
        "ERDEntity": {
            "kind": "class",
            "super": "ERDElement",
            "view": "ERDEntityView",
            "attributes": [
                { "name": "columns", "kind": "objs", "type": "ERDColumn" }
            ],
            "ordering": 1200
        },
        "ERDRelationshipEnd": {
            "kind": "class",
            "super": "RelationshipEnd",
            "attributes": [
                { "name": "cardinality", "kind": "prim", "type": "String", "visible": true, "default": "1", "options": [ "0..1", "1", "0..*", "1..*" ] }
            ],
            "ordering": 1800
        },
        "ERDRelationship": {
            "kind": "class",
            "super": "UndirectedRelationship",
            "view": "ERDRelationshipView",
            "attributes": [
                { "name": "identifying", "kind": "prim", "type": "Boolean", "visible": true, "default": true }
            ],
            "ordering": 1801
        },
        "ERDColumnView": {
            "kind": "class",
            "super": "NodeView"
        },
        "ERDColumnCompartmentView": {
            "kind": "class",
            "super": "NodeView"
        },
        "ERDEntityView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "nameLabel",         "kind": "ref", "type": "LabelView", "embedded": "subViews" },
                { "name": "columnCompartment", "kind": "ref", "type": "ERDColumnCompartmentView", "embedded": "subViews" }
            ]
        },
        "ERDRelationshipView": {
            "kind": "class",
            "super": "EdgeView",
            "attributes": [
                { "name": "nameLabel",     "kind": "ref",  "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "tailNameLabel", "kind": "ref",  "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "headNameLabel", "kind": "ref",  "type": "EdgeLabelView", "embedded": "subViews" }
            ]
        }
    };

    // Register Meta-model
    MetaModelManager.register(metaModel);

});
