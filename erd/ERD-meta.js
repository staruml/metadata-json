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
            "super": "Diagram"
        },
        "ERDColumn": {
            "kind": "class",
            "super": "ERDElement",
            "attributes": [
                { "name": "type",        "kind": "prim", "type": "String",    "visible": true, "options": [ "VARCHAR", "BOOLEAN", "INTEGER", "CHAR", "BINARY", "VARBINARY", "BLOB", "TEXT", "SMALLINT", "BIGINT", "DECIMAL", "NUMERIC", "FLOAT", "DOUBLE", "BIT", "DATE", "TIME", "DATETIME", "TIMESTAMP", "GEOMETRY", "POINT", "LINESTRING", "POLYGON" ] },
                { "name": "length",      "kind": "prim", "type": "Integer",   "visible": true },
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
            ]
        },
        "ERDRelationshipEnd": {
            "kind": "class",
            "super": "RelationshipEnd",
            "attributes": [
                { "name": "cardinality", "kind": "prim", "type": "String", "visible": true, "default": "1", "options": [ "0..1", "1", "0..*", "1..*" ] }
            ]
        },
        "ERDRelationship": {
            "kind": "class",
            "super": "UndirectedRelationship",
            "view": "ERDRelationshipView",
            "attributes": [
                { "name": "identifying", "kind": "prim", "type": "Boolean", "visible": true, "default": true }
            ]
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
                { "name": "nameLabel", "kind": "ref", "type": "LabelView" },
                { "name": "columnCompartment", "kind": "ref",  "type": "ERDColumnCompartmentView" }
            ]
        },
        "ERDRelationshipView": {
            "kind": "class",
            "super": "EdgeView",
            "attributes": [
                { "name": "nameLabel",     "kind": "ref",  "type": "EdgeLabelView" },
                { "name": "tailNameLabel", "kind": "ref",  "type": "EdgeLabelView" },
                { "name": "headNameLabel", "kind": "ref",  "type": "EdgeLabelView" }
            ]
        }
    };

    // Register Meta-model
    MetaModelManager.register(metaModel);

});
