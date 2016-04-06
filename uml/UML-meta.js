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
    require("core/Core-meta");

    var metaModel = {
        "UMLVisibilityKind": {
            "kind": "enum",
            "literals": [ "public", "protected", "private", "package" ]
        },
        "UMLAggregationKind": {
            "kind": "enum",
            "literals": [ "none", "shared", "composite" ]
        },
        "UMLDirectionKind": {
            "kind": "enum",
            "literals": [ "in", "inout", "out", "return" ]
        },
        "UMLCallConcurrencyKind": {
            "kind": "enum",
            "literals": [ "sequential", "guarded", "concurrent" ]
        },
        "UMLConnectorKind": {
            "kind": "enum",
            "literals": [ "assembly", "delegation" ]
        },
        "UMLMessageSort": {
            "kind": "enum",
            "literals": [ "synchCall", "asynchCall", "asynchSignal", "createMessage", "deleteMessage", "reply" ]
        },
        "UMLPseudostateKind": {
            "kind": "enum",
            "literals": [ "initial", "deepHistory", "shallowHistory", "join", "fork", "junction", "choice", "entryPoint", "exitPoint", "terminate" ]
        },
        "UMLTransitionKind": {
            "kind": "enum",
            "literals": [ "external", "internal", "local" ]
        },
        "UMLEventKind": {
            "kind": "enum",
            "literals": [ "signal", "call", "change", "time", "anyReceive" ]
        },
        "UMLInteractionOperatorKind": {
            "kind": "enum",
            "literals": [ "alt", "opt", "par", "loop", "critical", "neg", "assert", "strict", "seq", "ignore", "consider", "break" ]
        },
        "UMLActionKind": {
            "kind": "enum",
            "literals": [ "opaque", "create", "destroy", "read", "write", "insert", "delete", "sendSignal", "acceptSignal", "triggerEvent", "acceptEvent", "structured", "timeEvent" ]
        },
        "UMLObjectNodeOrderingKind": {
            "kind": "enum",
            "literals": [ "unordered", "ordered", "LIFO", "FIFO" ]
        },
        "UMLExpansionKind": {
            "kind": "enum",
            "literals": [ "parallel", "iterative", "stream" ]
        },
        "UMLStereotypeDisplayKind": {
            "kind": "enum",
            "literals": [ "none", "label", "decoration", "decoration-label", "icon", "icon-label" ]
        },
        "UMLModelElement": {
            "kind": "class",
            "super": "ExtensibleModel",
            "attributes": [
                { "name": "stereotype",         "kind": "var",  "type": "UMLStereotype", "visible": true },
                { "name": "visibility",         "kind": "enum", "type": "UMLVisibilityKind", "default": "public", "visible": true },
                { "name": "templateParameters", "kind": "objs", "type": "UMLTemplateParameter" }
            ]
        },
        "UMLConstraint": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "specification",       "kind": "prim", "type": "String", "visible": true, "multiline": true },
                { "name": "constrainedElements", "kind": "refs", "type": "UMLModelElement", "visible": true }
            ],
            "view": "UMLConstraintView"
        },
        "UMLTemplateParameter": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "parameterType", "kind": "prim", "type": "String", "visible": true },
                { "name": "defaultValue",  "kind": "prim", "type": "String", "visible": true }
            ],
            "ordering": 1101
        },
        "UMLFeature": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "isStatic", "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isLeaf",   "kind": "prim", "type": "Boolean", "visible": true, "default": false }
            ]
        },
        "UMLStructuralFeature": {
            "kind": "class",
            "super": "UMLFeature",
            "attributes": [
                { "name": "type",          "kind": "var",  "type": "UMLClassifier", "visible": true },
                { "name": "multiplicity",  "kind": "prim", "type": "String", "visible": true, "options": [ "0..1", "1", "0..*", "1..*", "*" ] },
                { "name": "isReadOnly",    "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isOrdered",     "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isUnique",      "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "defaultValue",  "kind": "prim", "type": "String", "visible": true }
            ]
        },
        "UMLParameter": {
            "kind": "class",
            "super": "UMLStructuralFeature",
            "attributes": [
                { "name": "direction",    "kind": "enum", "type": "UMLDirectionKind", "visible": true, "default": "in" }
            ],
            "ordering": 1102
        },
        "UMLBehavioralFeature": {
            "kind": "class",
            "super": "UMLFeature",
            "attributes": [
                { "name": "parameters",       "kind": "objs", "type": "UMLParameter", "visible": true },
                { "name": "raisedExceptions", "kind": "refs", "type": "UMLClassifier", "visible": true },
                { "name": "concurrency",      "kind": "enum", "type": "UMLCallConcurrencyKind", "visible": true, "default": "sequential" }
            ]
        },
        "UMLAttribute": {
            "kind": "class",
            "super": "UMLStructuralFeature",
            "attributes": [
                { "name": "isDerived",    "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "aggregation",  "kind": "enum", "type": "UMLAggregationKind", "visible": true, "default": "none" },
                { "name": "isID",         "kind": "prim", "type": "Boolean", "visible": true, "default": false }
            ],
            "view": "UMLPartView",
            "ordering": 1105
        },
        "UMLOperation": {
            "kind": "class",
            "super": "UMLBehavioralFeature",
            "attributes": [
                { "name": "isQuery",        "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isAbstract",     "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "specification",  "kind": "prim", "type": "String", "visible": true, "multiline": true },
                { "name": "preconditions",  "kind": "objs", "type": "UMLConstraint" },
                { "name": "bodyConditions", "kind": "objs", "type": "UMLConstraint" },
                { "name": "postconditions", "kind": "objs", "type": "UMLConstraint" }
            ],
            "ordering": 1106
        },
        "UMLReception": {
            "kind": "class",
            "super": "UMLBehavioralFeature",
            "attributes": [
                { "name": "signal", "kind": "ref", "type": "UMLSignal", "visible": true }
            ],
            "ordering": 1107
        },
        "UMLClassifier": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "attributes",            "kind": "objs", "type": "UMLAttribute" },
                { "name": "operations",            "kind": "objs", "type": "UMLOperation" },
                { "name": "receptions",            "kind": "objs", "type": "UMLReception" },
                { "name": "behaviors",             "kind": "objs", "type": "UMLBehavior" },
                { "name": "isAbstract",            "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isFinalSpecialization", "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isLeaf",                "kind": "prim", "type": "Boolean", "visible": true, "default": false }
            ]
        },
        "UMLDirectedRelationship": {
            "kind": "class",
            "super": "DirectedRelationship",
            "attributes": [
                { "name": "stereotype",         "kind": "var",  "type": "UMLStereotype", "visible": true },
                { "name": "visibility",         "kind": "enum", "type": "UMLVisibilityKind", "default": "public", "visible": true }
            ]
        },
        "UMLRelationshipEnd": {
            "kind": "class",
            "super": "RelationshipEnd",
            "attributes": [
                { "name": "stereotype",   "kind": "prim", "type": "String", "visible": true },
                { "name": "visibility",   "kind": "enum", "type": "UMLVisibilityKind", "default": "public", "visible": true },
                { "name": "navigable",    "kind": "prim", "type": "Boolean", "visible": true, "default": true },
                { "name": "aggregation",  "kind": "enum", "type": "UMLAggregationKind", "visible": true, "default": "none" },
                { "name": "multiplicity", "kind": "prim", "type": "String", "visible": true, "options": [ "0..1", "1", "0..*", "1..*", "*" ] },
                { "name": "defaultValue", "kind": "prim", "type": "String", "visible": true },
                { "name": "isReadOnly",   "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isOrdered",    "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isUnique",     "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isDerived",    "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isID",         "kind": "prim", "type": "Boolean", "visible": true, "default": false }
            ]
        },
        "UMLUndirectedRelationship": {
            "kind": "class",
            "super": "UndirectedRelationship",
            "attributes": [
                { "name": "stereotype", "kind": "var",  "type": "UMLStereotype", "visible": true },
                { "name": "visibility", "kind": "enum", "type": "UMLVisibilityKind", "default": "public", "visible": true }
            ]
        },
        "UMLBehavior": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "isReentrant",    "kind": "prim", "type": "Boolean", "visible": true, "default": true },
                { "name": "parameters",     "kind": "objs", "type": "UMLParameter" },
                { "name": "preconditions",  "kind": "objs", "type": "UMLConstraint" },
                { "name": "postconditions", "kind": "objs", "type": "UMLConstraint" }
            ]
        },
        "UMLOpaqueBehavior": {
            "kind": "class",
            "super": "UMLBehavior"
        },
        "UMLEvent": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "kind",            "kind": "enum", "type": "UMLEventKind", "visible": true, "default": "anyReceive" },
                { "name": "value",           "kind": "prim", "type": "String",       "visible": true },
                { "name": "expression",      "kind": "prim", "type": "String",       "visible": true },
                { "name": "targetOperation", "kind": "ref",  "type": "UMLOperation", "visible": true },
                { "name": "targetSignal",    "kind": "ref",  "type": "UMLSignal",    "visible": true }
            ]
        },
        "UMLPackage": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "importedElements", "kind": "refs", "type": "UMLModelElement", "visible": true }
            ],
            "view": "UMLPackageView",
            "ordering": 1001
        },
        "UMLModel": {
            "kind": "class",
            "super": "UMLPackage",
            "attributes": [
                { "name": "viewpoint", "kind": "prim", "type": "String", "visible": true }
            ],
            "view": "UMLModelView",
            "ordering": 1000
        },
        "UMLClass": {
            "kind": "class",
            "super": "UMLClassifier",
            "attributes": [
                { "name": "isActive",   "kind": "prim", "type": "Boolean", "visible": true, "default": false }
            ],
            "view": "UMLClassView",
            "ordering": 1201
        },
        "UMLInterface": {
            "kind": "class",
            "super": "UMLClassifier",
            "view": "UMLInterfaceView",
            "ordering": 1202
        },
        "UMLSignal": {
            "kind": "class",
            "super": "UMLClassifier",
            "view": "UMLSignalView",
            "ordering": 1203
        },
        "UMLDataType": {
            "kind": "class",
            "super": "UMLClassifier",
            "view": "UMLDataTypeView",
            "ordering": 1204
        },
        "UMLPrimitiveType": {
            "kind": "class",
            "super": "UMLDataType",
            "view": "UMLPrimitiveTypeView",
            "ordering": 1205
        },
        "UMLEnumerationLiteral": {
            "kind": "class",
            "super": "UMLModelElement",
            "ordering": 1103
        },
        "UMLEnumeration": {
            "kind": "class",
            "super": "UMLDataType",
            "attributes": [
                { "name": "literals", "kind": "objs", "type": "UMLEnumerationLiteral" }
            ],
            "view": "UMLEnumerationView",
            "ordering": 1206
        },
        "UMLDependency": {
            "kind": "class",
            "super": "UMLDirectedRelationship",
            "attributes": [
                { "name": "mapping", "kind": "prim", "type": "String", "visible": true }
            ],
            "view": "UMLDependencyView",
            "ordering": 1806
        },
        "UMLAbstraction": {
            "kind": "class",
            "super": "UMLDependency",
            "ordering": 1811
        },
        "UMLRealization": {
            "kind": "class",
            "super": "UMLAbstraction",
            "ordering": 1808,
            "view": "UMLRealizationView"
        },
        "UMLGeneralization": {
            "kind": "class",
            "super": "UMLDirectedRelationship",
            "attributes": [
                { "name": "discriminator", "kind": "prim", "type": "String", "visible": true }
            ],
            "view": "UMLGeneralizationView",
            "ordering": 1807
        },
        "UMLInterfaceRealization": {
            "kind": "class",
            "super": "UMLRealization",
            "view": "UMLInterfaceRealizationView",
            "ordering": 1809
        },
        "UMLComponentRealization": {
            "kind": "class",
            "super": "UMLRealization",
            "view": "UMLComponentRealizationView",
            "ordering": 1810
        },
        "UMLAssociationEnd": {
            "kind": "class",
            "super": "UMLRelationshipEnd",
            "attributes": [
                { "name": "qualifiers",    "kind": "objs", "type": "UMLAttribute", "visible": true }
            ],
            "ordering": 1801
        },
        "UMLAssociation": {
            "kind": "class",
            "super": "UMLUndirectedRelationship",
            "attributes": [
                { "name": "isDerived", "kind": "prim", "type": "Boolean", "visible": true, "default": false }
            ],
            "view": "UMLAssociationView",
            "ordering": 1802
        },
        "UMLAssociationClassLink": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "classSide",       "kind": "ref", "type": "UMLClass", "visible": true },
                { "name": "associationSide", "kind": "ref", "type": "UMLAssociation", "visible": true }
            ],
            "view": "UMLAssociationClassLinkView",
            "ordering": 1803
        },
        "UMLSlot": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "definingFeature", "kind": "ref",  "type": "UMLStructuralFeature", "visible": true },
                { "name": "type",            "kind": "var",  "type": "UMLClassifier", "visible": true },
                { "name": "value",           "kind": "prim", "type": "String", "visible": true }
            ],
            "ordering": 1109
        },
        "UMLInstance": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "classifier", "kind": "var",  "type": "UMLClassifier", "visible": true },
                { "name": "slots",      "kind": "objs", "type": "UMLSlot" },
                { "name": "value",      "kind": "prim", "type": "String", "visible": true }
            ],
            "ordering": 1301
        },
        "UMLObject": {
            "kind": "class",
            "super": "UMLInstance",
            "view": "UMLObjectView",
            "ordering": 1302
        },
        "UMLArtifactInstance": {
            "kind": "class",
            "super": "UMLInstance",
            "view": "UMLArtifactInstanceView",
            "ordering": 1303
        },
        "UMLComponentInstance": {
            "kind": "class",
            "super": "UMLInstance",
            "view": "UMLComponentInstanceView",
            "ordering": 1304
        },
        "UMLNodeInstance": {
            "kind": "class",
            "super": "UMLInstance",
            "view": "UMLNodeInstanceView",
            "ordering": 1305
        },
        "UMLLinkEnd": {
            "kind": "class",
            "super": "UMLRelationshipEnd",
            "ordering": 1814
        },
        "UMLLink": {
            "kind": "class",
            "super": "UMLUndirectedRelationship",
            "attributes": [
                { "name": "association",  "kind": "ref",  "type": "UMLAssociation", "visible": true }
            ],
            "view": "UMLLinkView",
            "ordering": 1815
        },
        "UMLPort": {
            "kind": "class",
            "super": "UMLAttribute",
            "attributes": [
                { "name": "isBehavior",   "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isService",    "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isConjugated", "kind": "prim", "type": "Boolean", "visible": true, "default": false }
            ],
            "view": "UMLPortView",
            "ordering": 1104
        },
        "UMLConnectorEnd": {
            "kind": "class",
            "super": "UMLRelationshipEnd",
            "ordering": 1812
        },
        "UMLConnector": {
            "kind": "class",
            "super": "UMLUndirectedRelationship",
            "attributes": [
                { "name": "type", "kind": "ref",  "type": "UMLAssociation",   "visible": true },
                { "name": "kind", "kind": "enum", "type": "UMLConnectorKind", "visible": true, "default": "assembly" },
            ],
            "view": "UMLConnectorView",
            "ordering": 1813
        },
        "UMLCollaboration": {
            "kind": "class",
            "super": "UMLClassifier",
            "view": "UMLCollaborationView",
            "ordering": 1401
        },
        "UMLCollaborationUse": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "type", "kind": "ref", "type": "UMLCollaboration", "visible": true }
            ],
            "view": "UMLCollaborationUseView",
            "ordering": 1405
        },
        "UMLRoleBinding": {
            "kind": "class",
            "super": "UMLDependency",
            "attributes": [
                { "name": "roleName", "kind": "prim", "type": "String", "visible": true }
            ],
            "view": "UMLRoleBindingView",
            "ordering": 1818
        },
        "UMLArtifact": {
            "kind": "class",
            "super": "UMLClassifier",
            "attributes": [
                { "name": "fileName", "kind": "prim", "type": "String", "visible": true }
            ],
            "view": "UMLArtifactView",
            "ordering": 1207
        },
        "UMLComponent": {
            "kind": "class",
            "super": "UMLClassifier",
            "attributes": [
                { "name": "isIndirectlyInstantiated", "kind": "prim", "type": "Boolean", "visible": true, "default": true }
            ],
            "view": "UMLComponentView",
            "ordering": 1208
        },
        "UMLSubsystem": {
            "kind": "class",
            "super": "UMLComponent",
            "view": "UMLSubsystemView",
            "ordering": 1002
        },
        "UMLNode": {
            "kind": "class",
            "super": "UMLClassifier",
            "view": "UMLNodeView",
            "ordering": 1209
        },
        "UMLDeployment": {
            "kind": "class",
            "super": "UMLDependency",
            "view": "UMLDeploymentView",
            "ordering": 1804
        },
        "UMLCommunicationPath": {
            "kind": "class",
            "super": "UMLAssociation",
            "view": "UMLCommunicationPathView",
            "ordering": 1805
        },
        "UMLExtensionPoint": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "location", "kind": "prim", "type": "String", "visible": true }
            ],
            "ordering": 1108
        },
        "UMLUseCase": {
            "kind": "class",
            "super": "UMLClassifier",
            "attributes": [
                { "name": "extensionPoints", "kind": "objs", "type": "UMLExtensionPoint", "visible": true }
            ],
            "view": "UMLUseCaseView",
            "ordering": 1210
        },
        "UMLActor": {
            "kind": "class",
            "super": "UMLClassifier",
            "view": "UMLActorView",
            "ordering": 1211
        },
        "UMLInclude": {
            "kind": "class",
            "super": "UMLDirectedRelationship",
            "view": "UMLIncludeView",
            "ordering": 1816
        },
        "UMLExtend": {
            "kind": "class",
            "super": "UMLDirectedRelationship",
            "attributes": [
                { "name": "condition", "kind": "prim", "type": "String", "visible": true },
                { "name": "extensionLocations", "kind": "refs", "type": "UMLExtensionPoint", "visible": true }
            ],
            "view": "UMLExtendView",
            "ordering": 1817
        },
        "UMLUseCaseSubject": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "represent", "kind": "ref", "type": "UMLClassifier", "visible": true }
            ],
            "view": "UMLUseCaseSubjectView",
            "ordering": 1003
        },
        "UMLStateMachine": {
            "kind": "class",
            "super": "UMLBehavior",
            "attributes": [
                { "name": "regions", "kind": "objs", "type": "UMLRegion"}
            ],
            "ordering": 1402
        },
        "UMLRegion": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "vertices",    "kind": "objs", "type": "UMLVertex" },
                { "name": "transitions", "kind": "objs", "type": "UMLTransition" }
            ],
            "ordering": 1407
        },
        "UMLVertex": {
            "kind": "class",
            "super": "UMLModelElement"
        },
        "UMLPseudostate": {
            "kind": "class",
            "super": "UMLVertex",
            "attributes": [
                { "name": "kind", "kind": "enum", "type": "UMLPseudostateKind", "visible": true }
            ],
            "view": "UMLPseudostateView",
            "ordering": 1408
        },
        "UMLConnectionPointReference": {
            "kind": "class",
            "super": "UMLVertex",
            "attributes": [
                { "name": "entry", "kind": "refs", "type": "UMLPseudostate", "visible": true },
                { "name": "exit",  "kind": "refs", "type": "UMLPseudostate", "visible": true }
            ],
            "view": "UMLConnectionPointReferenceView",
            "ordering": 1408
        },
        "UMLState": {
            "kind": "class",
            "super": "UMLVertex",
            "attributes": [
                { "name": "regions",         "kind": "objs", "type": "UMLRegion" },
                { "name": "entryActivities", "kind": "objs", "type": "UMLBehavior" },
                { "name": "doActivities",    "kind": "objs", "type": "UMLBehavior" },
                { "name": "exitActivities",  "kind": "objs", "type": "UMLBehavior" },
                { "name": "submachine",      "kind": "ref",  "type": "UMLStateMachine", "visible": true },
                { "name": "connections",     "kind": "objs", "type": "UMLConnectionPointReference" }
            ],
            "view": "UMLStateView",
            "ordering": 1409
        },
        "UMLFinalState": {
            "kind": "class",
            "super": "UMLState",
            "view": "UMLFinalStateView",
            "ordering": 1410
        },
        "UMLTransition": {
            "kind": "class",
            "super": "UMLDirectedRelationship",
            "attributes": [
                { "name": "kind",       "kind": "enum", "type": "UMLTransitionKind", "visible": true, "default": "external" },
                { "name": "guard",      "kind": "prim", "type": "String",            "visible": true },
                { "name": "triggers",   "kind": "objs", "type": "UMLEvent" },
                { "name": "effects",    "kind": "objs", "type": "UMLBehavior" }
            ],
            "view": "UMLTransitionView",
            "ordering": 1819
        },
        "UMLActivity": {
            "kind": "class",
            "super": "UMLBehavior",
            "attributes": [
                { "name": "isReadOnly",        "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isSingleExecution", "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "nodes",             "kind": "objs", "type": "UMLActivityNode" },
                { "name": "edges",             "kind": "objs", "type": "UMLActivityEdge" },
                { "name": "groups",            "kind": "objs", "type": "UMLActivityGroup" }
            ],
            "ordering": 1404
        },
        "UMLPin": {
            "kind": "class",
            "super": "UMLStructuralFeature"
        },
        "UMLInputPin": {
            "kind": "class",
            "super": "UMLPin",
            "view": "UMLInputPinView"
        },
        "UMLOutputPin": {
            "kind": "class",
            "super": "UMLPin",
            "view": "UMLOutputPinView"
        },
        "UMLExpansionNode": {
            "kind": "class",
            "super": "UMLPin",
            "view": "UMLExpansionNodeView",
            "ordering": 1412
        },
        "UMLActivityNode": {
            "kind": "class",
            "super": "UMLModelElement"
        },
        "UMLAction": {
            "kind": "class",
            "super": "UMLActivityNode",
            "attributes": [
                { "name": "kind",                "kind": "enum", "type": "UMLActionKind", "visible": true, "default": "opaque" },
                { "name": "inputs",              "kind": "objs", "type": "UMLInputPin" },
                { "name": "outputs",             "kind": "objs", "type": "UMLOutputPin" },
                { "name": "triggers",            "kind": "objs", "type": "UMLEvent" },
                { "name": "target",              "kind": "ref",  "type": "UMLModelElement", "visible": true },
                { "name": "subactivity",         "kind": "ref",  "type": "UMLActivity", "visible": true },
                { "name": "isLocallyReentrant",  "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "isSynchronous",       "kind": "prim", "type": "Boolean", "visible": true, "default": true },
                { "name": "language",            "kind": "prim", "type": "String",  "visible": true },
                { "name": "body",                "kind": "prim", "type": "String",  "visible": true, "multiline": true },
                { "name": "localPreconditions",  "kind": "objs", "type": "UMLConstraint" },
                { "name": "localPostconditions", "kind": "objs", "type": "UMLConstraint" }
            ],
            "view": "UMLActionView",
            "ordering": 1411
        },
        "UMLStructuredActivityNode": {
            "kind": "class",
            "super": "UMLAction",
            "attributes": [
                { "name": "mustIsolate",  "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "nodes", "kind": "objs", "type": "UMLActivityNode" },
                { "name": "edges", "kind": "objs", "type": "UMLActivityEdge" }
            ],
            "view": "UMLStructuredActivityNodeView",
            "ordering": 1412
        },
        "UMLExpansionRegion": {
            "kind": "class",
            "super": "UMLStructuredActivityNode",
            "attributes": [
                { "name": "mode",  "kind": "enum", "type": "UMLExpansionKind", "visible": true, "default": "iterative" }
            ],
            "view": "UMLExpansionRegionView",
            "ordering": 1412
        },
        "UMLObjectNode": {
            "kind": "class",
            "super": "UMLActivityNode",
            "attributes": [
                { "name": "type",          "kind": "var",  "type": "UMLClassifier", "visible": true },
                { "name": "isControlType", "kind": "prim", "type": "Boolean", "visible": true, "default": false },
                { "name": "ordering",      "kind": "enum", "type": "UMLObjectNodeOrderingKind", "visible": true }
            ],
            "view": "UMLObjectNodeView",
            "ordering": 1412
        },
        "UMLCentralBufferNode": {
            "kind": "class",
            "super": "UMLObjectNode",
            "view": "UMLCentralBufferNodeView",
            "ordering": 1412
        },
        "UMLDataStoreNode": {
            "kind": "class",
            "super": "UMLCentralBufferNode",
            "view": "UMLDataStoreNodeView",
            "ordering": 1412
        },
        "UMLControlNode": {
            "kind": "class",
            "super": "UMLActivityNode",
            "ordering": 1413
        },
        "UMLInitialNode": {
            "kind": "class",
            "super": "UMLControlNode",
            "view": "UMLControlNodeView",
            "ordering": 1414
        },
        "UMLFinalNode": {
            "kind": "class",
            "super": "UMLControlNode",
            "view": "UMLControlNodeView",
            "ordering": 1415
        },
        "UMLActivityFinalNode": {
            "kind": "class",
            "super": "UMLFinalNode",
            "view": "UMLControlNodeView",
            "ordering": 1416
        },
        "UMLFlowFinalNode": {
            "kind": "class",
            "super": "UMLFinalNode",
            "view": "UMLControlNodeView",
            "ordering": 1417
        },
        "UMLForkNode": {
            "kind": "class",
            "super": "UMLControlNode",
            "view": "UMLControlNodeView",
            "ordering": 1418
        },
        "UMLJoinNode": {
            "kind": "class",
            "super": "UMLControlNode",
            "view": "UMLControlNodeView",
            "ordering": 1419
        },
        "UMLMergeNode": {
            "kind": "class",
            "super": "UMLControlNode",
            "view": "UMLControlNodeView",
            "ordering": 1420
        },
        "UMLDecisionNode": {
            "kind": "class",
            "super": "UMLControlNode",
            "view": "UMLControlNodeView",
            "ordering": 1421
        },
        "UMLActivityGroup": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "subgroups", "kind": "objs", "type": "UMLActivityGroup" },
                { "name": "nodes",     "kind": "objs", "type": "UMLActivityNode" },
                { "name": "edges",     "kind": "objs", "type": "UMLActivityEdge" }
            ],
            "ordering": 1422
        },
        "UMLActivityPartition": {
            "kind": "class",
            "super": "UMLActivityGroup",
            "view": "UMLSwimlaneView",
            "ordering": 1423
        },
        "UMLInterruptibleActivityRegion": {
            "kind": "class",
            "super": "UMLActivityGroup",
            "view": "UMLInterruptibleActivityRegionView",
            "ordering": 1423
        },
        "UMLExceptionHandler": {
            "kind": "class",
            "super": "UMLDirectedRelationship",
            "view": "UMLExceptionHandlerView",
            "attributes": [
                { "name": "exceptionTypes", "kind": "refs", "type": "UMLClassifier",   "visible": true },
                { "name": "handlerBody",    "kind": "ref",  "type": "UMLActivityNode", "visible": true }
            ],
            "ordering": 1820
        },
        "UMLActivityEdge": {
            "kind": "class",
            "super": "UMLDirectedRelationship",
            "attributes": [
                { "name": "guard",  "kind": "prim", "type": "String", "visible": true },
                { "name": "weight", "kind": "prim", "type": "String", "visible": true }
            ]
        },
        "UMLControlFlow": {
            "kind": "class",
            "super": "UMLActivityEdge",
            "view": "UMLControlFlowView",
            "ordering": 1820
        },
        "UMLObjectFlow": {
            "kind": "class",
            "super": "UMLActivityEdge",
            "view": "UMLObjectFlowView",
            "ordering": 1821
        },
        "UMLActivityInterrupt": {
            "kind": "class",
            "super": "UMLActivityEdge",
            "view": "UMLActivityInterruptView",
            "ordering": 1821
        },
        "UMLInteractionFragment": {
            "kind": "class",
            "super": "UMLBehavior"
        },
        "UMLInteraction": {
            "kind": "class",
            "super": "UMLInteractionFragment",
            "attributes": [
                { "name": "messages",     "kind": "objs", "type": "UMLMessage" },
                { "name": "participants", "kind": "objs", "type": "UMLMessageEndpoint" },
                { "name": "fragments",    "kind": "objs", "type": "UMLInteractionFragment" }
            ],
            "ordering": 1403
        },
        "UMLStateInvariant": {
            "kind": "class",
            "super": "UMLInteractionFragment",
            "attributes": [
                { "name": "covered",   "kind": "ref",  "type": "UMLLifeline", "visible": true },
                { "name": "invariant", "kind": "prim", "type": "String", "visible": true }
            ],
            "view": "UMLStateInvariantView",
            "ordering": 1424
        },
        "UMLContinuation": {
            "kind": "class",
            "super": "UMLInteractionFragment",
            "attributes": [
                { "name": "setting", "kind": "prim", "type": "Boolean", "visible": true, "default": false }
            ],
            "view": "UMLContinuationView",
            "ordering": 1425
        },
        "UMLInteractionOperand": {
            "kind": "class",
            "super": "UMLInteractionFragment",
            "attributes": [
                { "name": "guard", "kind": "prim", "type": "String", "visible": true }
            ],
            "ordering": 1427
        },
        "UMLCombinedFragment": {
            "kind": "class",
            "super": "UMLInteractionFragment",
            "attributes": [
                { "name": "interactionOperator",  "kind": "enum", "type": "UMLInteractionOperatorKind", "visible": true },
                { "name": "operands",             "kind": "objs", "type": "UMLInteractionOperand" }
            ],
            "view": "UMLCombinedFragmentView",
            "ordering": 1426
        },
        "UMLInteractionUse": {
            "kind": "class",
            "super": "UMLInteractionFragment",
            "attributes": [
                { "name": "refersTo",             "kind": "ref",  "type": "UMLInteraction", "visible": true },
                { "name": "arguments",            "kind": "prim", "type": "String", "visible": true },
                { "name": "returnValue",          "kind": "prim", "type": "String", "visible": true },
                { "name": "returnValueRecipient", "kind": "ref",  "type": "UMLStructuralFeature", "visible": true }
            ],
            "view": "UMLInteractionUseView",
            "ordering": 1406
        },
        "UMLMessageEndpoint": {
            "kind": "class",
            "super": "UMLModelElement"
        },
        "UMLLifeline": {
            "kind": "class",
            "super": "UMLMessageEndpoint",
            "attributes": [
                { "name": "selector",        "kind": "prim", "type": "String", "visible": true },
                { "name": "represent",       "kind": "ref",  "type": "UMLStructuralFeature", "visible": true },
                { "name": "isMultiInstance", "kind": "prim", "type": "Boolean", "visible": true }
            ],
            "view": "UMLCommLifelineView",
            "ordering": 1428
        },
        "UMLGate": {
            "kind": "class",
            "super": "UMLMessageEndpoint",
            "view": "UMLGateView",
            "ordering": 1429
        },
        "UMLEndpoint": {
            "kind": "class",
            "super": "UMLMessageEndpoint",
            "view": "UMLEndpointView",
            "ordering": 1430
        },
        "UMLMessage": {
            "kind": "class",
            "super": "UMLDirectedRelationship",
            "attributes": [
                { "name": "messageSort",           "kind": "enum", "type": "UMLMessageSort",  "visible": true },
                { "name": "signature",             "kind": "ref",  "type": "UMLModelElement", "visible": true },
                { "name": "connector",             "kind": "ref",  "type": "UMLConnector",    "visible": true },
                { "name": "arguments",             "kind": "prim", "type": "String",          "visible": true },
                { "name": "assignmentTarget",      "kind": "prim", "type": "String",          "visible": true },
                { "name": "guard",                 "kind": "prim", "type": "String",          "visible": true },
                { "name": "iteration",             "kind": "prim", "type": "String",          "visible": true },
                { "name": "isConcurrentIteration", "kind": "prim", "type": "Boolean",         "visible": true }
            ],
            "ordering": 1822
        },
        "UMLProfile": {
            "kind": "class",
            "super": "UMLPackage",
            "view": "UMLProfileView",
            "ordering": 1901
        },
        "UMLImage": {
            "kind": "class",
            "super": "UMLModelElement",
            "attributes": [
                { "name": "width",   "kind": "prim", "type": "Integer",  "visible": true },
                { "name": "height",  "kind": "prim", "type": "Integer",  "visible": true },
                { "name": "content", "kind": "prim", "type": "String",   "visible": true, "multiline": true }
            ],
            "ordering": 1902
        },
        "UMLStereotype": {
            "kind": "class",
            "super": "UMLClass",
            "attributes": [
                { "name": "icon",    "kind": "obj",  "type": "UMLImage", "visible": true, "expand": true }
            ],
            "view": "UMLStereotypeView",
            "ordering": 1903
        },
        "UMLMetaClass": {
            "kind": "class",
            "super": "UMLModelElement",
            "view": "UMLMetaClassView",
            "ordering": 1904
        },
        "UMLExtension": {
            "kind": "class",
            "super": "UMLDirectedRelationship",
            "view": "UMLExtensionView",
            "ordering": 1905
        },
        "UMLDiagram": {
            "kind": "class",
            "super": "Diagram",
            "views": [
                "UMLCustomTextView",
                "ShapeView",
                "UMLNoteLinkView",
                "UMLConstraintLinkView",
                "UMLFrameView"
            ]
        },
        "UMLCompartmentView": {
            "kind": "class",
            "super": "NodeView"
        },
        "UMLNameCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView",
            "attributes": [
                { "name": "stereotypeLabel", "kind": "ref", "type": "LabelView", "embedded": "subViews" },
                { "name": "nameLabel",       "kind": "ref", "type": "LabelView", "embedded": "subViews" },
                { "name": "namespaceLabel",  "kind": "ref", "type": "LabelView", "embedded": "subViews" },
                { "name": "propertyLabel",   "kind": "ref", "type": "LabelView", "embedded": "subViews" },
                { "name": "wordWrap",        "kind": "prim", "type": "Boolean", "default": false, "transient": true }
            ]
        },
        "UMLAttributeView": {
            "kind": "class",
            "super": "LabelView"
        },
        "UMLAttributeCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView"
        },
        "UMLOperationView": {
            "kind": "class",
            "super": "LabelView"
        },
        "UMLOperationCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView"
        },
        "UMLReceptionView": {
            "kind": "class",
            "super": "LabelView"
        },
        "UMLReceptionCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView"
        },
        "UMLTemplateParameterView": {
            "kind": "class",
            "super": "LabelView"
        },
        "UMLTemplateParameterCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView"
        },
        "UMLGeneralNodeView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "stereotypeDisplay", "kind": "enum", "type": "UMLStereotypeDisplayKind", "default": "label" },
                { "name": "showVisibility",    "kind": "prim", "type": "Boolean", "default": true },
                { "name": "showNamespace",     "kind": "prim", "type": "Boolean", "default": false },
                { "name": "showProperty",      "kind": "prim", "type": "Boolean", "default": true },
                { "name": "showType",          "kind": "prim", "type": "Boolean", "default": true },
                { "name": "nameCompartment",   "kind": "ref",  "type": "UMLNameCompartmentView", "embedded": "subViews" },
                { "name": "wordWrap",          "kind": "prim", "type": "Boolean", "default": false }
            ]
        },
        "UMLFloatingNodeView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "nameLabel",       "kind": "ref", "type": "NodeLabelView", "embedded": "subViews" },
                { "name": "stereotypeLabel", "kind": "ref", "type": "NodeLabelView", "embedded": "subViews" },
                { "name": "propertyLabel",   "kind": "ref", "type": "NodeLabelView", "embedded": "subViews" },
                { "name": "showProperty",    "kind": "prim", "type": "Boolean", "default": true }
            ]
        },
        "UMLGeneralEdgeView": {
            "kind": "class",
            "super": "EdgeView",
            "attributes": [
                { "name": "stereotypeDisplay", "kind": "enum", "type": "UMLStereotypeDisplayKind", "default": "label" },
                { "name": "showVisibility",    "kind": "prim", "type": "Boolean", "default": false },
                { "name": "showProperty",      "kind": "prim", "type": "Boolean", "default": true },
                { "name": "nameLabel",         "kind": "ref",  "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "stereotypeLabel",   "kind": "ref",  "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "propertyLabel",     "kind": "ref",  "type": "EdgeLabelView", "embedded": "subViews" }
            ]
        },
        "UMLClassifierView": {
            "kind": "class",
            "super": "UMLGeneralNodeView",
            "attributes": [
                { "name": "suppressAttributes",           "kind": "prim", "type": "Boolean", "default": false },
                { "name": "suppressOperations",           "kind": "prim", "type": "Boolean", "default": false },
                { "name": "suppressReceptions",           "kind": "prim", "type": "Boolean", "default": true },
                { "name": "showMultiplicity",             "kind": "prim", "type": "Boolean", "default": true },
                { "name": "showOperationSignature",       "kind": "prim", "type": "Boolean", "default": true },
                { "name": "attributeCompartment",         "kind": "ref",  "type": "UMLAttributeCompartmentView", "embedded": "subViews" },
                { "name": "operationCompartment",         "kind": "ref",  "type": "UMLOperationCompartmentView", "embedded": "subViews" },
                { "name": "receptionCompartment",         "kind": "ref",  "type": "UMLReceptionCompartmentView", "embedded": "subViews" },
                { "name": "templateParameterCompartment", "kind": "ref",  "type": "UMLTemplateParameterCompartmentView", "embedded": "subViews" }
            ]
        },
        "UMLUndirectedRelationshipView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView",
            "attributes": [
                { "name": "showMultiplicity",          "kind": "prim", "type": "Boolean", "default": true },
                { "name": "showType",                  "kind": "prim", "type": "Boolean", "default": true },
                { "name": "tailRoleNameLabel",         "kind": "ref", "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "tailPropertyLabel",         "kind": "ref", "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "tailMultiplicityLabel",     "kind": "ref", "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "headRoleNameLabel",         "kind": "ref", "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "headPropertyLabel",         "kind": "ref", "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "headMultiplicityLabel",     "kind": "ref", "type": "EdgeLabelView", "embedded": "subViews" }
            ]
        },
        "UMLClassDiagram": {
            "kind": "class",
            "super": "UMLDiagram",
            "views": [
                "UMLPackageView",
                "UMLModelView",
                "UMLSubsystemView",
                "UMLContainmentView",
                "UMLClassView",
                "UMLInterfaceView",
                "UMLSignalView",
                "UMLDataTypeView",
                "UMLPrimitiveTypeView",
                "UMLEnumerationView",
                "UMLDependencyView",
                "UMLGeneralizationView",
                "UMLRealizationView",
                "UMLInterfaceRealizationView",
                "UMLAssociationView",
                "UMLAssociationClassLinkView",
                "UMLPortView",
                "UMLPartView",
                "UMLConnectorView",
                "UMLCollaborationView",
                "UMLCollaborationUseView",
                "UMLRoleBindingView",
                "UMLObjectView",
                "UMLLinkView",
                "UMLArtifactView",
                "UMLComponentView",
                "UMLArtifactInstanceView",
                "UMLComponentInstanceView",
                "UMLComponentRealizationView",
                "UMLNodeView",
                "UMLNodeInstanceView",
                "UMLDeploymentView",
                "UMLCommunicationPathView",
                "UMLUseCaseView",
                "UMLActorView",
                "UMLUseCaseSubjectView",
                "UMLExtendView",
                "UMLIncludeView",
                "UMLProfileView",
                "UMLExtensionView",
                "UMLMetaClassView",
                "UMLStereotypeView"
            ]
        },
        "UMLClassView": {
            "kind": "class",
            "super": "UMLClassifierView"
        },
        "UMLInterfaceView": {
            "kind": "class",
            "super": "UMLClassifierView"
        },
        "UMLSignalView": {
            "kind": "class",
            "super": "UMLClassifierView"
        },
        "UMLDataTypeView": {
            "kind": "class",
            "super": "UMLClassifierView"
        },
        "UMLPrimitiveTypeView": {
            "kind": "class",
            "super": "UMLClassifierView"
        },
        "UMLEnumerationLiteralView": {
            "kind": "class",
            "super": "LabelView",
            "attributes": []
        },
        "UMLEnumerationLiteralCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView"
        },
        "UMLEnumerationView": {
            "kind": "class",
            "super": "UMLClassifierView",
            "attributes": [
                { "name": "suppressLiterals",              "kind": "prim", "type": "Boolean", "default": false },
                { "name": "enumerationLiteralCompartment", "kind": "ref",  "type": "UMLEnumerationLiteralCompartmentView", "embedded": "subViews" }
            ]
        },
        "UMLGeneralizationView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "UMLDependencyView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "UMLRealizationView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "UMLInterfaceRealizationView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "UMLQualifierCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView",
            "attributes": []
        },
        "UMLAssociationView": {
            "kind": "class",
            "super": "UMLUndirectedRelationshipView",
            "attributes": [
                { "name": "tailQualifiersCompartment", "kind": "ref", "type": "UMLQualifierCompartmentView", "embedded": "subViews" },
                { "name": "headQualifiersCompartment", "kind": "ref", "type": "UMLQualifierCompartmentView", "embedded": "subViews" }
            ]
        },
        "UMLAssociationClassLinkView": {
            "kind": "class",
            "super": "EdgeView"
        },
        "UMLPackageDiagram": {
            "kind": "class",
            "super": "UMLDiagram",
            "views": [
                "UMLPackageView",
                "UMLModelView",
                "UMLSubsystemView",
                "UMLContainmentView",
                "UMLClassView",
                "UMLInterfaceView",
                "UMLSignalView",
                "UMLDataTypeView",
                "UMLPrimitiveTypeView",
                "UMLEnumerationView",
                "UMLDependencyView",
                "UMLGeneralizationView",
                "UMLRealizationView",
                "UMLInterfaceRealizationView",
                "UMLAssociationView",
                "UMLAssociationClassLinkView",
                "UMLPortView",
                "UMLPartView",
                "UMLConnectorView",
                "UMLCollaborationView",
                "UMLCollaborationUseView",
                "UMLRoleBindingView",
                "UMLObjectView",
                "UMLLinkView",
                "UMLArtifactView",
                "UMLComponentView",
                "UMLArtifactInstanceView",
                "UMLComponentInstanceView",
                "UMLComponentRealizationView",
                "UMLNodeView",
                "UMLNodeInstanceView",
                "UMLDeploymentView",
                "UMLCommunicationPathView",
                "UMLUseCaseView",
                "UMLActorView",
                "UMLUseCaseSubjectView",
                "UMLExtendView",
                "UMLIncludeView",
                "UMLProfileView",
                "UMLExtensionView",
                "UMLMetaClassView",
                "UMLStereotypeView"
            ]
        },
        "UMLPackageView": {
            "kind": "class",
            "super": "UMLGeneralNodeView"
        },
        "UMLModelView": {
            "kind": "class",
            "super": "UMLPackageView"
        },
        "UMLSubsystemView": {
            "kind": "class",
            "super": "UMLPackageView"
        },
        "UMLContainmentView": {
            "kind": "class",
            "super": "EdgeView"
        },
        "UMLCompositeStructureDiagram": {
            "kind": "class",
            "super": "UMLDiagram",
            "views": [
                "UMLPackageView",
                "UMLModelView",
                "UMLSubsystemView",
                "UMLContainmentView",
                "UMLClassView",
                "UMLInterfaceView",
                "UMLSignalView",
                "UMLDataTypeView",
                "UMLPrimitiveTypeView",
                "UMLEnumerationView",
                "UMLDependencyView",
                "UMLGeneralizationView",
                "UMLRealizationView",
                "UMLInterfaceRealizationView",
                "UMLAssociationView",
                "UMLAssociationClassLinkView",
                "UMLPortView",
                "UMLPartView",
                "UMLConnectorView",
                "UMLCollaborationView",
                "UMLCollaborationUseView",
                "UMLRoleBindingView",
                "UMLObjectView",
                "UMLLinkView",
                "UMLArtifactView",
                "UMLComponentView",
                "UMLArtifactInstanceView",
                "UMLComponentInstanceView",
                "UMLComponentRealizationView",
                "UMLNodeView",
                "UMLNodeInstanceView",
                "UMLDeploymentView",
                "UMLCommunicationPathView",
                "UMLUseCaseView",
                "UMLActorView",
                "UMLUseCaseSubjectView",
                "UMLExtendView",
                "UMLIncludeView",
                "UMLProfileView",
                "UMLExtensionView",
                "UMLMetaClassView",
                "UMLStereotypeView"
            ]
        },
        "UMLPortView": {
            "kind": "class",
            "super": "UMLFloatingNodeView",
            "attributes": [
                { "name": "showVisibility",   "kind": "prim", "type": "Boolean", "default": false },
                { "name": "showType",         "kind": "prim", "type": "Boolean", "default": true },
                { "name": "showMultiplicity", "kind": "prim", "type": "Boolean", "default": true }
            ]
        },
        "UMLPartView": {
            "kind": "class",
            "super": "UMLGeneralNodeView",
            "attributes": [
                { "name": "showMultiplicity", "kind": "prim", "type": "Boolean", "default": true }
            ]
        },
        "UMLConnectorView": {
            "kind": "class",
            "super": "UMLUndirectedRelationshipView"
        },
        "UMLCollaborationView": {
            "kind": "class",
            "super": "UMLGeneralNodeView",
            "attributes": [
                { "name": "templateParameterCompartment", "kind": "ref", "type": "UMLTemplateParameterCompartmentView", "embedded": "subViews" }
            ]
        },
        "UMLCollaborationUseView": {
            "kind": "class",
            "super": "UMLGeneralNodeView"
        },
        "UMLRoleBindingView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView",
            "attributes": [
                { "name": "roleNameLabel", "kind": "ref", "type": "EdgeLabelView", "embedded": "subViews" }
            ]
        },
        "UMLObjectDiagram": {
            "kind": "class",
            "super": "UMLDiagram",
            "views": [
                "UMLPackageView",
                "UMLModelView",
                "UMLSubsystemView",
                "UMLContainmentView",
                "UMLClassView",
                "UMLInterfaceView",
                "UMLSignalView",
                "UMLDataTypeView",
                "UMLPrimitiveTypeView",
                "UMLEnumerationView",
                "UMLDependencyView",
                "UMLGeneralizationView",
                "UMLRealizationView",
                "UMLInterfaceRealizationView",
                "UMLAssociationView",
                "UMLAssociationClassLinkView",
                "UMLPortView",
                "UMLPartView",
                "UMLConnectorView",
                "UMLCollaborationView",
                "UMLCollaborationUseView",
                "UMLRoleBindingView",
                "UMLObjectView",
                "UMLLinkView",
                "UMLArtifactView",
                "UMLComponentView",
                "UMLArtifactInstanceView",
                "UMLComponentInstanceView",
                "UMLComponentRealizationView",
                "UMLNodeView",
                "UMLNodeInstanceView",
                "UMLDeploymentView",
                "UMLCommunicationPathView",
                "UMLUseCaseView",
                "UMLActorView",
                "UMLUseCaseSubjectView",
                "UMLExtendView",
                "UMLIncludeView",
                "UMLProfileView",
                "UMLExtensionView",
                "UMLMetaClassView",
                "UMLStereotypeView"
            ]
        },
        "UMLSlotView": {
            "kind": "class",
            "super": "LabelView"
        },
        "UMLSlotCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView"
        },
        "UMLObjectView": {
            "kind": "class",
            "super": "UMLGeneralNodeView",
            "attributes": [
                { "name": "slotCompartment", "kind": "ref", "type": "UMLSlotCompartmentView", "embedded": "subViews" }
            ]
        },
        "UMLLinkView": {
            "kind": "class",
            "super": "UMLUndirectedRelationshipView"
        },
        "UMLComponentDiagram": {
            "kind": "class",
            "super": "UMLDiagram",
            "views": [
                "UMLPackageView",
                "UMLModelView",
                "UMLSubsystemView",
                "UMLContainmentView",
                "UMLClassView",
                "UMLInterfaceView",
                "UMLSignalView",
                "UMLDataTypeView",
                "UMLPrimitiveTypeView",
                "UMLEnumerationView",
                "UMLDependencyView",
                "UMLGeneralizationView",
                "UMLRealizationView",
                "UMLInterfaceRealizationView",
                "UMLAssociationView",
                "UMLAssociationClassLinkView",
                "UMLPortView",
                "UMLPartView",
                "UMLConnectorView",
                "UMLCollaborationView",
                "UMLCollaborationUseView",
                "UMLRoleBindingView",
                "UMLObjectView",
                "UMLLinkView",
                "UMLArtifactView",
                "UMLComponentView",
                "UMLArtifactInstanceView",
                "UMLComponentInstanceView",
                "UMLComponentRealizationView",
                "UMLNodeView",
                "UMLNodeInstanceView",
                "UMLDeploymentView",
                "UMLCommunicationPathView",
                "UMLUseCaseView",
                "UMLActorView",
                "UMLUseCaseSubjectView",
                "UMLExtendView",
                "UMLIncludeView",
                "UMLProfileView",
                "UMLExtensionView",
                "UMLMetaClassView",
                "UMLStereotypeView"
            ]
        },
        "UMLArtifactView": {
            "kind": "class",
            "super": "UMLClassifierView"
        },
        "UMLArtifactInstanceView": {
            "kind": "class",
            "super": "UMLGeneralNodeView"
        },
        "UMLComponentView": {
            "kind": "class",
            "super": "UMLClassifierView"
        },
        "UMLComponentInstanceView": {
            "kind": "class",
            "super": "UMLGeneralNodeView"
        },
        "UMLComponentRealizationView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "UMLDeploymentDiagram": {
            "kind": "class",
            "super": "UMLDiagram",
            "views": [
                "UMLPackageView",
                "UMLModelView",
                "UMLSubsystemView",
                "UMLContainmentView",
                "UMLClassView",
                "UMLInterfaceView",
                "UMLSignalView",
                "UMLDataTypeView",
                "UMLPrimitiveTypeView",
                "UMLEnumerationView",
                "UMLDependencyView",
                "UMLGeneralizationView",
                "UMLRealizationView",
                "UMLInterfaceRealizationView",
                "UMLAssociationView",
                "UMLAssociationClassLinkView",
                "UMLPortView",
                "UMLPartView",
                "UMLConnectorView",
                "UMLCollaborationView",
                "UMLCollaborationUseView",
                "UMLRoleBindingView",
                "UMLObjectView",
                "UMLLinkView",
                "UMLArtifactView",
                "UMLComponentView",
                "UMLArtifactInstanceView",
                "UMLComponentInstanceView",
                "UMLComponentRealizationView",
                "UMLNodeView",
                "UMLNodeInstanceView",
                "UMLDeploymentView",
                "UMLCommunicationPathView",
                "UMLUseCaseView",
                "UMLActorView",
                "UMLUseCaseSubjectView",
                "UMLExtendView",
                "UMLIncludeView",
                "UMLProfileView",
                "UMLExtensionView",
                "UMLMetaClassView",
                "UMLStereotypeView"
            ]
        },
        "UMLNodeView": {
            "kind": "class",
            "super": "UMLClassifierView"
        },
        "UMLNodeInstanceView": {
            "kind": "class",
            "super": "UMLGeneralNodeView"
        },
        "UMLDeploymentView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "UMLCommunicationPathView": {
            "kind": "class",
            "super": "UMLAssociationView"
        },
        "UMLUseCaseDiagram": {
            "kind": "class",
            "super": "UMLDiagram",
            "views": [
                "UMLPackageView",
                "UMLModelView",
                "UMLSubsystemView",
                "UMLContainmentView",
                "UMLClassView",
                "UMLInterfaceView",
                "UMLSignalView",
                "UMLDataTypeView",
                "UMLPrimitiveTypeView",
                "UMLEnumerationView",
                "UMLDependencyView",
                "UMLGeneralizationView",
                "UMLRealizationView",
                "UMLInterfaceRealizationView",
                "UMLAssociationView",
                "UMLAssociationClassLinkView",
                "UMLPortView",
                "UMLPartView",
                "UMLConnectorView",
                "UMLCollaborationView",
                "UMLCollaborationUseView",
                "UMLRoleBindingView",
                "UMLObjectView",
                "UMLLinkView",
                "UMLArtifactView",
                "UMLComponentView",
                "UMLArtifactInstanceView",
                "UMLComponentInstanceView",
                "UMLComponentRealizationView",
                "UMLNodeView",
                "UMLNodeInstanceView",
                "UMLDeploymentView",
                "UMLCommunicationPathView",
                "UMLUseCaseView",
                "UMLActorView",
                "UMLUseCaseSubjectView",
                "UMLExtendView",
                "UMLIncludeView",
                "UMLProfileView",
                "UMLExtensionView",
                "UMLMetaClassView",
                "UMLStereotypeView"
            ]
        },
        "UMLExtensionPointView": {
            "kind": "class",
            "super": "LabelView",
            "attributes": []
        },
        "UMLExtensionPointCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView"
        },
        "UMLUseCaseView": {
            "kind": "class",
            "super": "UMLClassifierView",
            "attributes": [
                { "name": "extensionPointCompartment", "kind": "ref",  "type": "UMLExtensionPointCompartmentView", "embedded": "subViews" }
            ]
        },
        "UMLActorView": {
            "kind": "class",
            "super": "UMLClassifierView"
        },
        "UMLIncludeView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "UMLExtendView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "UMLUseCaseSubjectView": {
            "kind": "class",
            "super": "UMLGeneralNodeView"
        },
        "UMLStatechartDiagram": {
            "kind": "class",
            "super": "UMLDiagram"
        },
        "UMLPseudostateView": {
            "kind": "class",
            "super": "UMLFloatingNodeView"
        },
        "UMLFinalStateView": {
            "kind": "class",
            "super": "NodeView"
        },
        "UMLConnectionPointReferenceView": {
            "kind": "class",
            "super": "UMLFloatingNodeView"
        },
        "UMLInternalActivityView": {
            "kind": "class",
            "super": "LabelView"
        },
        "UMLInternalActivityCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView"
        },
        "UMLInternalTransitionView": {
            "kind": "class",
            "super": "LabelView"
        },
        "UMLInternalTransitionCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView"
        },
        "UMLRegionView": {
            "kind": "class",
            "super": "NodeView"
        },
        "UMLDecompositionCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView"
        },
        "UMLStateView": {
            "kind": "class",
            "super": "UMLGeneralNodeView",
            "attributes": [
                { "name": "internalActivityCompartment",   "kind": "ref",  "type": "UMLInternalActivityCompartmentView", "embedded": "subViews" },
                { "name": "internalTransitionCompartment", "kind": "ref",  "type": "UMLInternalTransitionCompartmentView", "embedded": "subViews" },
                { "name": "decompositionCompartment",      "kind": "ref",  "type": "UMLDecompositionCompartmentView", "embedded": "subViews" }
            ]
        },
        "UMLTransitionView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "UMLActivityDiagram": {
            "kind": "class",
            "super": "UMLDiagram"
        },
        "UMLPinView": {
            "kind": "class",
            "super": "UMLFloatingNodeView"
        },
        "UMLInputPinView": {
            "kind": "class",
            "super": "UMLPinView"
        },
        "UMLOutputPinView": {
            "kind": "class",
            "super": "UMLPinView"
        },
        "UMLExpansionNodeView": {
            "kind": "class",
            "super": "UMLPinView"
        },
        "UMLActionView": {
            "kind": "class",
            "super": "UMLGeneralNodeView"
        },
        "UMLStructuredActivityNodeView": {
            "kind": "class",
            "super": "UMLGeneralNodeView"
        },
        "UMLExpansionRegionView": {
            "kind": "class",
            "super": "UMLStructuredActivityNodeView"
        },
        "UMLObjectNodeView": {
            "kind": "class",
            "super": "UMLGeneralNodeView"
        },
        "UMLCentralBufferNodeView": {
            "kind": "class",
            "super": "UMLObjectNodeView"
        },
        "UMLDataStoreNodeView": {
            "kind": "class",
            "super": "UMLObjectNodeView"
        },
        "UMLControlNodeView": {
            "kind": "class",
            "super": "NodeView"
        },
        "UMLControlFlowView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "UMLObjectFlowView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "UMLZigZagAdornmentView": {
            "kind": "class",
            "super": "EdgeNodeView"
        },
        "UMLExceptionHandlerView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView",
            "attributes": [
                { "name": "adornment",  "kind": "ref",  "type": "UMLZigZagAdornmentView", "embedded": "subViews" }
            ]
        },
        "UMLActivityInterruptView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView",
            "attributes": [
                { "name": "adornment",  "kind": "ref",  "type": "UMLZigZagAdornmentView", "embedded": "subViews" }
            ]
        },
        "UMLSwimlaneView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "nameLabel",  "kind": "ref",  "type": "LabelView", "embedded": "subViews" },
                { "name": "isVertical", "kind": "prim", "type": "Boolean", "default": true }
            ]
        },
        "UMLInterruptibleActivityRegionView": {
            "kind": "class",
            "super": "NodeView"
        },
        "UMLSequenceDiagram": {
            "kind": "class",
            "super": "UMLDiagram",
            "attributes": [
                { "name": "showSequenceNumber", "kind": "prim", "type": "Boolean", "visible": true, "default": true },
                { "name": "showSignature",      "kind": "prim", "type": "Boolean", "visible": true, "default": true },
                { "name": "showActivation",     "kind": "prim", "type": "Boolean", "visible": true, "default": true }
            ]
        },
        "UMLLinePartView": {
            "kind": "class",
            "super": "NodeView"
        },
        "UMLSeqLifelineView": {
            "kind": "class",
            "super": "UMLGeneralNodeView",
            "attributes": [
                { "name": "linePart", "kind": "ref", "type": "UMLLinePartView", "embedded": "subViews" }
            ]
        },
        "UMLMessageEndpointView": {
            "kind": "class",
            "super": "NodeView"
        },
        "UMLEndpointView": {
            "kind": "class",
            "super": "UMLMessageEndpointView"
        },
        "UMLGateView": {
            "kind": "class",
            "super": "UMLMessageEndpointView"
        },
        "UMLActivationView": {
            "kind": "class",
            "super": "NodeView"
        },
        "UMLSeqMessageView": {
            "kind": "class",
            "super": "EdgeView",
            "attributes": [
                { "name": "nameLabel",       "kind": "ref", "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "stereotypeLabel", "kind": "ref", "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "propertyLabel",   "kind": "ref", "type": "EdgeLabelView", "embedded": "subViews" },
                { "name": "activation",      "kind": "ref", "type": "UMLActivationView", "embedded": "subViews" },
                { "name": "showProperty",    "kind": "prim", "type": "Boolean", "default": true },
                { "name": "showType",        "kind": "prim", "type": "Boolean", "default": true }
            ]
        },
        "UMLStateInvariantView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "invariantLabel", "kind": "ref", "type": "LabelView", "embedded": "subViews" }
            ]
        },
        "UMLContinuationView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "nameLabel", "kind": "ref", "type": "LabelView", "embedded": "subViews" }
            ]
        },
        "UMLCustomFrameView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "nameLabel",      "kind": "ref", "type": "LabelView", "embedded": "subViews" },
                { "name": "frameTypeLabel", "kind": "ref", "type": "LabelView", "embedded": "subViews" }
            ]
        },
        "UMLFrameView": {
            "kind": "class",
            "super": "UMLCustomFrameView"
        },
        "UMLInteractionOperandView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "guardLabel", "kind": "ref", "type": "LabelView", "embedded": "subViews" }
            ]
        },
        "UMLInteractionOperandCompartmentView": {
            "kind": "class",
            "super": "UMLCompartmentView"
        },
        "UMLCombinedFragmentView": {
            "kind": "class",
            "super": "UMLCustomFrameView",
            "attributes": [
                { "name": "operandCompartment", "kind": "ref", "type": "UMLInteractionOperandCompartmentView", "embedded": "subViews" }
            ]
        },
        "UMLInteractionUseView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "nameLabel",      "kind": "ref", "type": "LabelView", "embedded": "subViews" },
                { "name": "frameTypeLabel", "kind": "ref", "type": "LabelView", "embedded": "subViews" }
            ]
        },
        "UMLCommunicationDiagram": {
            "kind": "class",
            "super": "UMLDiagram",
            "attributes": [
                { "name": "showSequenceNumber", "kind": "prim", "type": "Boolean", "visible": true, "default": true },
                { "name": "showSignature",      "kind": "prim", "type": "Boolean", "visible": true, "default": true }
            ]
        },
        "UMLCommLifelineView": {
            "kind": "class",
            "super": "UMLGeneralNodeView"
        },
        "UMLCommMessageView": {
            "kind": "class",
            "super": "EdgeNodeView",
            "attributes": [
                { "name": "nameLabel",       "kind": "ref", "type": "NodeLabelView", "embedded": "subViews" },
                { "name": "stereotypeLabel", "kind": "ref", "type": "NodeLabelView", "embedded": "subViews" },
                { "name": "propertyLabel",   "kind": "ref", "type": "NodeLabelView", "embedded": "subViews" },
                { "name": "showProperty",    "kind": "prim", "type": "Boolean", "default": true },
                { "name": "showType",        "kind": "prim", "type": "Boolean", "default": true }
            ]
        },
        "UMLProfileDiagram": {
            "kind": "class",
            "super": "UMLDiagram",
            "views": [
                "UMLPackageView",
                "UMLModelView",
                "UMLSubsystemView",
                "UMLContainmentView",
                "UMLClassView",
                "UMLInterfaceView",
                "UMLSignalView",
                "UMLDataTypeView",
                "UMLPrimitiveTypeView",
                "UMLEnumerationView",
                "UMLDependencyView",
                "UMLGeneralizationView",
                "UMLRealizationView",
                "UMLInterfaceRealizationView",
                "UMLAssociationView",
                "UMLAssociationClassLinkView",
                "UMLPortView",
                "UMLPartView",
                "UMLConnectorView",
                "UMLCollaborationView",
                "UMLCollaborationUseView",
                "UMLRoleBindingView",
                "UMLObjectView",
                "UMLLinkView",
                "UMLArtifactView",
                "UMLComponentView",
                "UMLArtifactInstanceView",
                "UMLComponentInstanceView",
                "UMLComponentRealizationView",
                "UMLNodeView",
                "UMLNodeInstanceView",
                "UMLDeploymentView",
                "UMLCommunicationPathView",
                "UMLUseCaseView",
                "UMLActorView",
                "UMLUseCaseSubjectView",
                "UMLExtendView",
                "UMLIncludeView",
                "UMLProfileView",
                "UMLExtensionView",
                "UMLMetaClassView",
                "UMLStereotypeView"
            ]
        },
        "UMLProfileView": {
            "kind": "class",
            "super": "UMLPackageView"
        },
        "UMLMetaClassView": {
            "kind": "class",
            "super": "UMLGeneralNodeView"
        },
        "UMLStereotypeView": {
            "kind": "class",
            "super": "UMLClassView"
        },
        "UMLExtensionView": {
            "kind": "class",
            "super": "UMLGeneralEdgeView"
        },
        "HyperlinkView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "nameLabel", "kind": "ref", "type": "LabelView", "embedded": "subViews" },
                { "name": "typeLabel", "kind": "ref", "type": "LabelView", "embedded": "subViews" }
            ]
        },
        "UMLCustomTextView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "text",     "kind": "prim", "type": "String" },
                { "name": "wordWrap", "kind": "prim", "type": "Boolean", "default": true }
            ]
        },
        "UMLTextView": {
            "kind": "class",
            "super": "UMLCustomTextView"
        },
        "UMLCustomNoteView": {
            "kind": "class",
            "super": "UMLCustomTextView"
        },
        "UMLNoteView": {
            "kind": "class",
            "super": "UMLCustomNoteView"
        },
        "UMLConstraintView": {
            "kind": "class",
            "super": "UMLCustomNoteView"
        },
        "UMLNoteLinkView": {
            "kind": "class",
            "super": "EdgeView"
        },
        "UMLConstraintLinkView": {
            "kind": "class",
            "super": "EdgeView"
        },
        "ShapeView": {
            "kind": "class",
            "super": "NodeView"
        },
        "RectangleView": {
            "kind": "class",
            "super": "ShapeView"
        },
        "RoundRectView": {
            "kind": "class",
            "super": "ShapeView"
        },
        "EllipseView": {
            "kind": "class",
            "super": "ShapeView"
        }
    };

    // Register Meta-model
    MetaModelManager.register(metaModel);

});
