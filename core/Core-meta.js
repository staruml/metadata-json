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
/*global define*/

define(function (require, exports, module) {
    "use strict";

    var MetaModelManager  = require("core/MetaModelManager");

    var metaModel = {
        "TagKind": {
            "kind": "enum",
            "literals": [ "string", "reference", "boolean", "number", "hidden" ]
        },
        "Element": {
            "kind": "class",
            "attributes": [
                { "name": "_id",     "kind": "prim", "type": "String" },
                { "name": "_parent", "kind": "ref",  "type": "Element" }
            ]
        },
        "Model": {
            "kind": "class",
            "super": "Element",
            "attributes": [
                { "name": "name",          "kind": "prim", "type": "String", "visible": true },
                { "name": "ownedElements", "kind": "objs", "type": "Element" }
            ]
        },
        "Tag": {
            "kind": "class",
            "super": "Model",
            "attributes": [
                { "name": "kind",      "kind": "enum", "type": "TagKind", "visible": true },
                { "name": "value",     "kind": "prim", "type": "String",  "visible": true, "multiline": true },
                { "name": "reference", "kind": "ref",  "type": "Model",   "visible": true },
                { "name": "checked",   "kind": "prim", "type": "Boolean", "visible": true },
                { "name": "number",    "kind": "prim", "type": "Integer", "visible": true }
            ]
        },
        "Hyperlink": {
            "kind": "class",
            "super": "Model",
            "attributes": [
                { "name": "reference", "kind": "ref",  "type": "Model",   "visible": true },
                { "name": "url",       "kind": "prim", "type": "String",  "visible": true }
            ],
            "view": "HyperlinkView"
        },
        "ExtensibleModel": {
            "kind": "class",
            "super": "Model",
            "attributes": [
                { "name": "documentation", "kind": "prim", "type": "String" },
                { "name": "tags",          "kind": "objs", "type": "Tag" }
            ]
        },
        "Relationship": {
            "kind": "class",
            "super": "ExtensibleModel"
        },
        "DirectedRelationship": {
            "kind": "class",
            "super": "Relationship",
            "attributes": [
                { "name": "source", "kind": "ref", "type": "Model", "visible": true, "readOnly": true },
                { "name": "target", "kind": "ref", "type": "Model", "visible": true, "readOnly": true }
            ]
        },
        "RelationshipEnd": {
            "kind": "class",
            "super": "ExtensibleModel",
            "attributes": [
                { "name": "reference", "kind": "ref", "type": "Model", "visible": true, "readOnly": true }
            ]
        },
        "UndirectedRelationship": {
            "kind": "class",
            "super": "Relationship",
            "attributes": [
                { "name": "end1", "kind": "obj", "type": "RelationshipEnd", "expand": true },
                { "name": "end2", "kind": "obj", "type": "RelationshipEnd", "expand": true }
            ]
        },
        "View": {
            "kind": "class",
            "super": "Element",
            "attributes": [
                { "name": "model",               "kind": "ref",    "type": "Element" },
                { "name": "subViews",            "kind": "objs",   "type": "View" },
                { "name": "containerView",       "kind": "ref",    "type": "View" },
                { "name": "containedViews",      "kind": "refs",   "type": "View" },
                { "name": "visible",             "kind": "prim",   "type": "Boolean", "default": true },
                { "name": "enabled",             "kind": "prim",   "type": "Boolean", "default": true },
                { "name": "selected",            "kind": "prim",   "type": "Boolean", "transient": true },
                { "name": "lineColor",           "kind": "prim",   "type": "String" },
                { "name": "fillColor",           "kind": "prim",   "type": "String" },
                { "name": "fontColor",           "kind": "prim",   "type": "String" },
                { "name": "font",                "kind": "custom", "type": "Font" },
                { "name": "parentStyle",         "kind": "prim",   "type": "Boolean", "default": false, "transient": true },
                { "name": "showShadow",          "kind": "prim",   "type": "Boolean", "default": true },
                { "name": "containerChangeable", "kind": "prim",   "type": "Boolean", "default": false, "transient": false },
                { "name": "containerExtending",  "kind": "prim",   "type": "Boolean", "default": false, "transient": false }
            ]
        },
        "NodeView": {
            "kind": "class",
            "super": "View",
            "attributes": [
                { "name": "left",       "kind": "prim", "type": "Integer", "default": 0 },
                { "name": "top",        "kind": "prim", "type": "Integer", "default": 0 },
                { "name": "width",      "kind": "prim", "type": "Integer", "default": 0 },
                { "name": "height",     "kind": "prim", "type": "Integer", "default": 0 },
                { "name": "autoResize", "kind": "prim", "type": "Boolean", "default": false }
            ]
        },
        "EdgeView": {
            "kind": "class",
            "super": "View",
            "attributes": [
                { "name": "head",      "kind": "ref",    "type": "View" },
                { "name": "tail",      "kind": "ref",    "type": "View" },
                { "name": "lineStyle", "kind": "prim",   "type": "Integer" },
                { "name": "points",    "kind": "custom", "type": "Points" }
            ]
        },
        "LabelView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "underline",           "kind": "prim", "type": "Boolean", "default": false },
                { "name": "text",                "kind": "prim", "type": "String" },
                { "name": "horizontalAlignment", "kind": "prim", "type": "Integer", "default": 2 },
                { "name": "verticalAlignment",   "kind": "prim", "type": "Integer", "default": 5 },
                { "name": "direction",           "kind": "prim", "type": "Integer", "default": 0,     "transient": true },
                { "name": "wordWrap",            "kind": "prim", "type": "Boolean", "default": false, "transient": true }
            ]
        },
        "ParasiticView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "alpha",    "kind": "prim", "type": "Real" },
                { "name": "distance", "kind": "prim", "type": "Real" }
            ]
        },
        "NodeParasiticView": {
            "kind": "class",
            "super": "ParasiticView",
            "attributes": [
                { "name": "hostNode", "kind": "ref", "type": "NodeView" }
            ]
        },
        "EdgeParasiticView": {
            "kind": "class",
            "super": "ParasiticView",
            "attributes": [
                { "name": "hostEdge",     "kind": "ref",  "type": "EdgeView" },
                { "name": "edgePosition", "kind": "prim", "type": "Integer", "default": 0 }
            ]
        },
        "NodeLabelView": {
            "kind": "class",
            "super": "NodeParasiticView",
            "attributes": [
                { "name": "underline",           "kind": "prim", "type": "Boolean", "default": false },
                { "name": "text",                "kind": "prim", "type": "String" },
                { "name": "horizontalAlignment", "kind": "prim", "type": "Integer", "default": 2 },
                { "name": "verticalAlignment",   "kind": "prim", "type": "Integer", "default": 5 }
            ]
        },
        "EdgeLabelView": {
            "kind": "class",
            "super": "EdgeParasiticView",
            "attributes": [
                { "name": "underline",           "kind": "prim", "type": "Boolean", "default": false },
                { "name": "text",                "kind": "prim", "type": "String" },
                { "name": "horizontalAlignment", "kind": "prim", "type": "Integer", "default": 2 },
                { "name": "verticalAlignment",   "kind": "prim", "type": "Integer", "default": 5 }
            ]
        },
        "NodeNodeView": {
            "kind": "class",
            "super": "NodeParasiticView"
        },
        "EdgeNodeView": {
            "kind": "class",
            "super": "EdgeParasiticView"
        },
        "Diagram": {
            "kind": "class",
            "super": "ExtensibleModel",
            "attributes": [
                { "name": "visible",        "kind": "prim", "type": "Boolean", "default": true },
                { "name": "defaultDiagram", "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "ownedViews",     "kind": "objs", "type": "View" }
            ]
        },
        "Project": {
            "kind": "class",
            "super": "ExtensibleModel",
            "attributes": [
                { "name": "author",         "kind": "prim", "type": "String",  "visible": true },
                { "name": "company",        "kind": "prim", "type": "String",  "visible": true },
                { "name": "copyright",      "kind": "prim", "type": "String",  "visible": true },
                { "name": "version",        "kind": "prim", "type": "String",  "visible": true }
            ]
        }
    };

    // Register Meta-model
    MetaModelManager.register(metaModel);

});
