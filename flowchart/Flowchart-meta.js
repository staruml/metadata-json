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
        "FCModelElement": {
            "kind": "class",
            "super": "ExtensibleModel"
        },
        "FCFlowchart": {
            "kind": "class",
            "super": "FCModelElement"
        },
        "FCFlowchartDiagram": {
            "kind": "class",
            "super": "Diagram"
        },
        "FCProcess": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCProcessView"
        },
        "FCTerminator": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCTerminatorView"
        },
        "FCDecision": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCDecisionView"
        },
        "FCDelay": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCDelayView"
        },
        "FCPredefinedProcess": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCPredefinedProcessView"
        },
        "FCAlternateProcess": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCAlternateProcessView"
        },
        "FCData": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCDataView"
        },
        "FCDocument": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCDocumentView"
        },
        "FCMultiDocument": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCMultiDocumentView"
        },
        "FCPreparation": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCPreparationView"
        },
        "FCDisplay": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCDisplayView"
        },
        "FCManualInput": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCManualInputView"
        },
        "FCManualOperation": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCManualOperationView"
        },
        "FCCard": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCCardView"
        },
        "FCPunchedTape": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCPunchedTapeView"
        },
        "FCConnector": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCConnectorView"
        },
        "FCOffPageConnector": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCOffPageConnectorView"
        },
        "FCOr": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCOrView"
        },
        "FCSummingJunction": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCSummingJunctionView"
        },
        "FCCollate": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCCollateView"
        },
        "FCSort": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCSortView"
        },
        "FCMerge": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCMergeView"
        },
        "FCExtract": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCExtractView"
        },
        "FCStoredData": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCStoredDataView"
        },
        "FCDatabase": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCDatabaseView"
        },
        "FCDirectAccessStorage": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCDirectAccessStorageView"
        },
        "FCInternalStorage": {
            "kind": "class",
            "super": "FCModelElement",
            "view":  "FCInternalStorageView"
        },
        "FCFlow": {
            "kind": "class",
            "super": "DirectedRelationship",
            "view": "FCFlowView"
        },
        "FCGeneralNodeView": {
            "kind": "class",
            "super": "NodeView",
            "attributes": [
                { "name": "nameLabel", "kind": "ref",  "type": "LabelView", "embedded": "subViews" },
                { "name": "wordWrap",  "kind": "prim", "type": "Boolean", "default": true }
            ]
        },
        "FCGeneralEdgeView": {
            "kind": "class",
            "super": "EdgeView",
            "attributes": [
                { "name": "nameLabel", "kind": "ref",  "type": "EdgeLabelView", "embedded": "subViews" }
            ]
        },
        "FCProcessView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCTerminatorView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCDecisionView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCDelayView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCPredefinedProcessView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCAlternateProcessView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCDataView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCDocumentView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCMultiDocumentView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCPreparationView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCDisplayView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCManualInputView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCManualOperationView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCCardView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCPunchedTapeView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCConnectorView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCOffPageConnectorView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCOrView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCSummingJunctionView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCCollateView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCSortView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCMergeView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCExtractView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCStoredDataView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCDatabaseView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCDirectAccessStorageView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCInternalStorageView": {
            "kind": "class",
            "super": "FCGeneralNodeView"
        },
        "FCFlowView": {
            "kind": "class",
            "super": "FCGeneralEdgeView"
        }
    };

    // Register Meta-model
    MetaModelManager.register(metaModel);

});
