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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, appshell, document */

define(function (require, exports, module) {
    "use strict";

    var Graphics          = require("core/Graphics"),
        Point             = require("core/Graphics").Point,
        Rect              = require("core/Graphics").Rect,
        Core              = require("core/Core"),
        MetaModelManager  = require("core/MetaModelManager"),
        Repository        = require("core/Repository"),
        PreferenceManager = require("core/PreferenceManager");

    require("flowchart/Flowchart-meta");

    var LEFT_PADDING   = 10,
        RIGHT_PADDING  = 10,
        TOP_PADDING    = 10,
        BOTTOM_PADDING = 10;

    var DECISION_MINWIDTH  = 50,
        DECISION_MINHEIGHT = 30,
        MERGE_MINWIDTH  = 30,
        MERGE_MINHEIGHT = 25,
        EXTRACT_MINWIDTH  = 30,
        EXTRACT_MINHEIGHT = 25;

    /**
     * FCModelElement
     * @constructor
     */
    function FCModelElement() {
        type.ExtensibleModel.apply(this, arguments);
    }
    // inherits from ExtensibleModel
    FCModelElement.prototype = Object.create(type.ExtensibleModel.prototype);
    FCModelElement.prototype.constructor = FCModelElement;

    FCModelElement.prototype.getDisplayClassName = function () {
        var name = this.getClassName();
        return name.substring(2, name.length);
    };

    /**
     * FCFlowchart
     * @constructor
     */
    function FCFlowchart() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCFlowchart.prototype = Object.create(FCModelElement.prototype);
    FCFlowchart.prototype.constructor = FCFlowchart;

    /**
     * FCFlowchartDiagram
     * @constructor
     */
    function FCFlowchartDiagram() {
        type.Diagram.apply(this, arguments);
    }
    // inherits from Diagram
    FCFlowchartDiagram.prototype = Object.create(type.Diagram.prototype);
    FCFlowchartDiagram.prototype.constructor = FCFlowchartDiagram;

    FCFlowchartDiagram.prototype.getDisplayClassName = function () {
        return "FlowchartDiagram";
    };


    /**
     * FCProcess
     * @constructor
     */
    function FCProcess() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCProcess.prototype = Object.create(FCModelElement.prototype);
    FCProcess.prototype.constructor = FCProcess;


    /**
     * FCTerminator
     * @constructor
     */
    function FCTerminator() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCTerminator.prototype = Object.create(FCModelElement.prototype);
    FCTerminator.prototype.constructor = FCTerminator;


    /**
     * FCDecision
     * @constructor
     */
    function FCDecision() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCDecision.prototype = Object.create(FCModelElement.prototype);
    FCDecision.prototype.constructor = FCDecision;


    /**
     * FCDelay
     * @constructor
     */
    function FCDelay() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCDelay.prototype = Object.create(FCModelElement.prototype);
    FCDelay.prototype.constructor = FCDelay;


    /**
     * FCPredefinedProcess
     * @constructor
     */
    function FCPredefinedProcess() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCPredefinedProcess.prototype = Object.create(FCModelElement.prototype);
    FCPredefinedProcess.prototype.constructor = FCPredefinedProcess;


    /**
     * FCAlternateProcess
     * @constructor
     */
    function FCAlternateProcess() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCAlternateProcess.prototype = Object.create(FCModelElement.prototype);
    FCAlternateProcess.prototype.constructor = FCAlternateProcess;


    /**
     * FCData
     * @constructor
     */
    function FCData() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCData.prototype = Object.create(FCModelElement.prototype);
    FCData.prototype.constructor = FCData;


    /**
     * FCDocument
     * @constructor
     */
    function FCDocument() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCDocument.prototype = Object.create(FCModelElement.prototype);
    FCDocument.prototype.constructor = FCDocument;


    /**
     * FCMultiDocument
     * @constructor
     */
    function FCMultiDocument() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCMultiDocument.prototype = Object.create(FCModelElement.prototype);
    FCMultiDocument.prototype.constructor = FCMultiDocument;


    /**
     * FCPreparation
     * @constructor
     */
    function FCPreparation() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCPreparation.prototype = Object.create(FCModelElement.prototype);
    FCPreparation.prototype.constructor = FCPreparation;


    /**
     * FCDisplay
     * @constructor
     */
    function FCDisplay() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCDisplay.prototype = Object.create(FCModelElement.prototype);
    FCDisplay.prototype.constructor = FCDisplay;


    /**
     * FCManualInput
     * @constructor
     */
    function FCManualInput() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCManualInput.prototype = Object.create(FCModelElement.prototype);
    FCManualInput.prototype.constructor = FCManualInput;


    /**
     * FCManualOperation
     * @constructor
     */
    function FCManualOperation() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCManualOperation.prototype = Object.create(FCModelElement.prototype);
    FCManualOperation.prototype.constructor = FCManualOperation;


    /**
     * FCCard
     * @constructor
     */
    function FCCard() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCCard.prototype = Object.create(FCModelElement.prototype);
    FCCard.prototype.constructor = FCCard;


    /**
     * FCPunchedTape
     * @constructor
     */
    function FCPunchedTape() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCPunchedTape.prototype = Object.create(FCModelElement.prototype);
    FCPunchedTape.prototype.constructor = FCPunchedTape;


    /**
     * FCConnector
     * @constructor
     */
    function FCConnector() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCConnector.prototype = Object.create(FCModelElement.prototype);
    FCConnector.prototype.constructor = FCConnector;


    /**
     * FCOffPageConnector
     * @constructor
     */
    function FCOffPageConnector() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCOffPageConnector.prototype = Object.create(FCModelElement.prototype);
    FCOffPageConnector.prototype.constructor = FCOffPageConnector;


    /**
     * FCOr
     * @constructor
     */
    function FCOr() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCOr.prototype = Object.create(FCModelElement.prototype);
    FCOr.prototype.constructor = FCOr;


    /**
     * FCSummingJunction
     * @constructor
     */
    function FCSummingJunction() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCSummingJunction.prototype = Object.create(FCModelElement.prototype);
    FCSummingJunction.prototype.constructor = FCSummingJunction;


    /**
     * FCCollate
     * @constructor
     */
    function FCCollate() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCCollate.prototype = Object.create(FCModelElement.prototype);
    FCCollate.prototype.constructor = FCCollate;


    /**
     * FCSort
     * @constructor
     */
    function FCSort() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCSort.prototype = Object.create(FCModelElement.prototype);
    FCSort.prototype.constructor = FCSort;


    /**
     * FCMerge
     * @constructor
     */
    function FCMerge() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCMerge.prototype = Object.create(FCModelElement.prototype);
    FCMerge.prototype.constructor = FCMerge;


    /**
     * FCExtract
     * @constructor
     */
    function FCExtract() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCExtract.prototype = Object.create(FCModelElement.prototype);
    FCExtract.prototype.constructor = FCExtract;


    /**
     * FCStoredData
     * @constructor
     */
    function FCStoredData() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCStoredData.prototype = Object.create(FCModelElement.prototype);
    FCStoredData.prototype.constructor = FCStoredData;


    /**
     * FCDatabase
     * @constructor
     */
    function FCDatabase() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCDatabase.prototype = Object.create(FCModelElement.prototype);
    FCDatabase.prototype.constructor = FCDatabase;


    /**
     * FCDirectAccessStorage
     * @constructor
     */
    function FCDirectAccessStorage() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCDirectAccessStorage.prototype = Object.create(FCModelElement.prototype);
    FCDirectAccessStorage.prototype.constructor = FCDirectAccessStorage;


    /**
     * FCInternalStorage
     * @constructor
     */
    function FCInternalStorage() {
        FCModelElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    FCInternalStorage.prototype = Object.create(FCModelElement.prototype);
    FCInternalStorage.prototype.constructor = FCInternalStorage;


    /**
     * FCFlow
     * @constructor
     */
    function FCFlow() {
        type.DirectedRelationship.apply(this, arguments);
    }
    // inherits from DirectedRelationship
    FCFlow.prototype = Object.create(type.DirectedRelationship.prototype);
    FCFlow.prototype.constructor = FCFlow;


    /* -------------------------- View Elements ---------------------------- */

    /**
     * FCGeneralNodeView
     * @constructor
     */
    function FCGeneralNodeView() {
        type.NodeView.apply(this, arguments);

        /** @member {boolean} */
        this.wordWrap = true;

        /** @member {LabelView} */
        this.nameLabel = new type.LabelView();
        this.nameLabel.horizontalAlignment = Graphics.AL_CENTER;
        this.nameLabel.parentStyle = true;
        this.addSubView(this.nameLabel);
    }
    // inherits from NodeView
    FCGeneralNodeView.prototype = Object.create(type.NodeView.prototype);
    FCGeneralNodeView.prototype.constructor = FCGeneralNodeView;

    FCGeneralNodeView.prototype.update = function (canvas) {
        type.NodeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameLabel.text = this.model.name;
        }
        this.nameLabel.wordWrap = this.wordWrap;
    };

    FCGeneralNodeView.prototype.sizeObject = function (canvas) {
        type.NodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = this.nameLabel.minWidth + LEFT_PADDING + RIGHT_PADDING;
        this.minHeight = this.nameLabel.minHeight + TOP_PADDING + BOTTOM_PADDING;
    };

    FCGeneralNodeView.prototype.arrangeObject = function (canvas) {
        type.NodeView.prototype.arrangeObject.call(this, canvas);
        this.nameLabel.left = this.left + LEFT_PADDING;
        this.nameLabel.top = this.top + TOP_PADDING;
        this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING;
        this.nameLabel.height = this.nameLabel.minHeight;
        // this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING;
    };

    FCGeneralNodeView.prototype.drawObject = function (canvas) {
        type.NodeView.prototype.drawObject.call(this, canvas);
    };

    FCGeneralNodeView.prototype.canDelete = function () {
        return false;
    };


    /**
     * FCGeneralEdgeView
     * @constructor
     */
    function FCGeneralEdgeView() {
        type.EdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_SOLID_ARROW;
        this.lineMode = Core.LM_SOLID;

        /** @member {EdgeLabelView} */
        this.nameLabel = new type.EdgeLabelView();
        this.nameLabel.hostEdge = this;
        this.nameLabel.edgePosition = Core.EP_MIDDLE;
        this.nameLabel.distance = 15;
        this.nameLabel.alpha = Math.PI / 2;
        this.addSubView(this.nameLabel);
    }
    // inherits from EdgeView
    FCGeneralEdgeView.prototype = Object.create(type.EdgeView.prototype);
    FCGeneralEdgeView.prototype.constructor = FCGeneralEdgeView;

    FCGeneralEdgeView.prototype.update = function (canvas) {
        if (this.model) {
            // nameLabel
            this.nameLabel.visible = (this.model.name.length > 0);
            if (this.model.name) {
                this.nameLabel.text = this.model.name;
            }
            // Enforce nameLabel.mode refers to this.model by using Bypass Command.
            if (this.nameLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.nameLabel, 'model', this.model);
            }
        }
        type.EdgeView.prototype.update.call(this, canvas);
    };

    FCGeneralEdgeView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof FCModelElement);
    };

    FCGeneralEdgeView.prototype.canDelete = function () {
        return false;
    };


    /**
     * FCProcessView
     * @constructor
     */
    function FCProcessView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.process.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCProcessView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCProcessView.prototype.constructor = FCProcessView;

    FCProcessView.prototype.drawObject = function (canvas) {
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };

    /**
     * FCTerminatorView
     * @constructor
     */
    function FCTerminatorView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.terminator.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCTerminatorView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCTerminatorView.prototype.constructor = FCTerminatorView;

    FCTerminatorView.prototype.drawObject = function (canvas) {
        var round = Math.min(this.height, this.width) / 2;
        canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), round);
        canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), round);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FDecisionView
     * @constructor
     */
    function FCDecisionView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.decision.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCDecisionView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCDecisionView.prototype.constructor = FCDecisionView;

    FCDecisionView.prototype.sizeObject = function (canvas) {
        FCGeneralNodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = Math.max(this.nameLabel.minWidth * 2, DECISION_MINWIDTH);
        this.minHeight = Math.max(this.nameLabel.minHeight * 2, DECISION_MINHEIGHT);
    };

    FCDecisionView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        this.nameLabel.left = this.left + (this.width / 4);
        this.nameLabel.top = this.top + (this.height / 4);
        this.nameLabel.width = (this.width / 2);
        this.nameLabel.height = (this.height / 2);
    };

    FCDecisionView.prototype.drawObject = function (canvas) {
        var x = (this.left + this.getRight()) / 2,
            y = (this.top + this.getBottom()) / 2;
        canvas.fillPolygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)]);
        canvas.polygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)]);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCDelayView
     * @constructor
     */
    function FCDelayView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.delay.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCDelayView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCDelayView.prototype.constructor = FCDelayView;

    FCDelayView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        this.nameLabel.width = (this.width * 0.75);
    };

    FCDelayView.prototype.drawObject = function (canvas) {
        var r = this.height / 2;
        canvas.fillRect(this.left, this.top, this.getRight() - r, this.getBottom());
        canvas.fillArc(this.getRight() - r, this.top + r, r, -(Math.PI / 2), Math.PI / 2);
        canvas.line(this.left, this.top, this.left, this.getBottom());
        canvas.line(this.left, this.top, this.getRight() - r, this.top);
        canvas.line(this.left, this.top + this.height, this.getRight() - r, this.top + this.height);
        canvas.arc(this.getRight() - r, this.top + r, r, -(Math.PI / 2), Math.PI / 2);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCPredefinedProcessView
     * @constructor
     */
    function FCPredefinedProcessView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.predefined-process.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCPredefinedProcessView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCPredefinedProcessView.prototype.constructor = FCPredefinedProcessView;

    FCPredefinedProcessView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        this.nameLabel.left = this.left + LEFT_PADDING + 5;
        this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - 5;
    };

    FCPredefinedProcessView.prototype.drawObject = function (canvas) {
        var gap = 5;
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.line(this.left + gap, this.top, this.left + gap, this.getBottom());
        canvas.line(this.getRight() - gap, this.top, this.getRight() - gap, this.getBottom());
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCAlternateProcessView
     * @constructor
     */
    function FCAlternateProcessView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.alternate-process.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCAlternateProcessView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCAlternateProcessView.prototype.constructor = FCAlternateProcessView;

    FCAlternateProcessView.prototype.drawObject = function (canvas) {
        var round = 10;
        canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), round);
        canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), round);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCDataView
     * @constructor
     */
    function FCDataView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.data.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCDataView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCDataView.prototype.constructor = FCDataView;

    FCDataView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = Math.floor(this.width / 6);
        this.nameLabel.left = this.left + LEFT_PADDING + g;
        this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2);
    };

    FCDataView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            g = Math.floor(this.width / 6),
            pts = [
                new Point(r.x1 + g, r.y1),
                new Point(r.x2, r.y1),
                new Point(r.x2 - g, r.y2),
                new Point(r.x1, r.y2),
                new Point(r.x1 + g, r.y1)
            ];
        canvas.fillPolygon(pts);
        canvas.polygon(pts);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCDocumentView
     * @constructor
     */
    function FCDocumentView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.document.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCDocumentView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCDocumentView.prototype.constructor = FCDocumentView;

    FCDocumentView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var h = Math.floor(this.height / 6);
        this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - h;
    };

    FCDocumentView.prototype.drawDocument = function (canvas, rect) {
        var h = Math.floor(rect.getHeight() / 6),
            g = Math.floor(rect.getWidth() / 3);
        canvas.fillPath([['M', rect.x1, rect.y1],
                         ['L', rect.x2, rect.y1],
                         ['L', rect.x2, rect.y2],
                         ['C', rect.x2 - g, rect.y2 - (h * 2), rect.x1 + g, rect.y2 + (h * 1.5), rect.x1, rect.y2 - h],
                         ['L', rect.x1, rect.y1],
                         ['Z']], true);
    };

    FCDocumentView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom());
        this.drawDocument(canvas, r);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCMultiDocumentView
     * @constructor
     */
    function FCMultiDocumentView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.multidocument.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCMultiDocumentView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCMultiDocumentView.prototype.constructor = FCMultiDocumentView;

    FCMultiDocumentView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = 5,
            h = Math.floor(this.height / 6);
        this.nameLabel.top = this.top + TOP_PADDING + (g * 2);
        this.nameLabel.left = this.left + LEFT_PADDING + (g * 2);
        this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2);
        this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - h - (g * 2);
    };

    FCMultiDocumentView.prototype.drawObject = function (canvas) {
        var g = 5,
            r1 = new Rect(this.left, this.top, this.getRight() - (g * 2), this.getBottom() - (g * 2)),
            r2 = new Rect(this.left + g, this.top + g, this.getRight() - g, this.getBottom() - g),
            r3 = new Rect(this.left + (g * 2), this.top + (g * 2), this.getRight(), this.getBottom());
        FCDocumentView.prototype.drawDocument(canvas, r1);
        FCDocumentView.prototype.drawDocument(canvas, r2);
        FCDocumentView.prototype.drawDocument(canvas, r3);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCPreparationView
     * @constructor
     */
    function FCPreparationView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.preparation.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCPreparationView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCPreparationView.prototype.constructor = FCPreparationView;

    FCPreparationView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = Math.floor(this.width / 6);
        this.nameLabel.left = this.left + LEFT_PADDING + g;
        this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2);
    };

    FCPreparationView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            m = (r.y1 + r.y2) / 2,
            g = Math.floor(this.width / 6),
            pts = [
                new Point(r.x1, m),
                new Point(r.x1 + g, r.y1),
                new Point(r.x2 - g, r.y1),
                new Point(r.x2, m),
                new Point(r.x2 - g, r.y2),
                new Point(r.x1 + g, r.y2),
                new Point(r.x1, m)
            ];
        canvas.fillPolygon(pts);
        canvas.polygon(pts);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCDisplayView
     * @constructor
     */
    function FCDisplayView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.display.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCDisplayView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCDisplayView.prototype.constructor = FCDisplayView;

    FCDisplayView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = Math.floor(this.width / 6);
        this.nameLabel.left = this.left + LEFT_PADDING + g;
        this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2);
    };

    FCDisplayView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            m = (r.y1 + r.y2) / 2,
            g = Math.floor(this.width / 6);
        canvas.fillPath([['M', r.x1, m],
                         ['L', r.x1 + g, r.y1],
                         ['L', r.x2 - g, r.y1],
                         ['Q', r.x2, r.y1, r.x2, m],
                         ['Q', r.x2, r.y2, r.x2 - g, r.y2],
                         ['L', r.x1 + g, r.y2],
                         ['L', r.x1, m],
                         ['Z']], true);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCManualInputView
     * @constructor
     */
    function FCManualInputView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.manual-input.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCManualInputView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCManualInputView.prototype.constructor = FCManualInputView;

    FCManualInputView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = Math.floor(this.height / 6);
        this.nameLabel.top = this.top + TOP_PADDING + g;
        this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - g;
    };

    FCManualInputView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            g = Math.floor(this.height / 6),
            pts = [
                new Point(r.x1, r.y1 + g),
                new Point(r.x2, r.y1),
                new Point(r.x2, r.y2),
                new Point(r.x1, r.y2),
                new Point(r.x1, r.y1 + g)
            ];
        canvas.fillPolygon(pts);
        canvas.polygon(pts);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCManualOperationView
     * @constructor
     */
    function FCManualOperationView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.manual-operation.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCManualOperationView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCManualOperationView.prototype.constructor = FCManualOperationView;

    FCManualOperationView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = Math.floor(this.width / 6);
        this.nameLabel.left = this.left + LEFT_PADDING + g;
        this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2);
    };

    FCManualOperationView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            g = Math.floor(this.width / 6),
            pts = [
                new Point(r.x1, r.y1),
                new Point(r.x2, r.y1),
                new Point(r.x2 - g, r.y2),
                new Point(r.x1 + g, r.y2),
                new Point(r.x1, r.y1)
            ];
        canvas.fillPolygon(pts);
        canvas.polygon(pts);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCCardView
     * @constructor
     */
    function FCCardView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.card.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCCardView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCCardView.prototype.constructor = FCCardView;

    FCCardView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            g = Math.floor(this.width / 8),
            pts = [
                new Point(r.x1 + g, r.y1),
                new Point(r.x2, r.y1),
                new Point(r.x2, r.y2),
                new Point(r.x1, r.y2),
                new Point(r.x1, r.y1 + g),
                new Point(r.x1 + g, r.y1)
            ];
        canvas.fillPolygon(pts);
        canvas.polygon(pts);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCPunchedTapeView
     * @constructor
     */
    function FCPunchedTapeView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.punched-tape.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCPunchedTapeView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCPunchedTapeView.prototype.constructor = FCPunchedTapeView;

    FCPunchedTapeView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = Math.floor(this.height / 6);
        this.nameLabel.top = this.top + TOP_PADDING + g;
        this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - (g * 2);
    };

    FCPunchedTapeView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            h = Math.floor(r.getHeight() / 6),
            g = Math.floor(r.getWidth() / 3);
        canvas.fillPath([['M', r.x1, r.y1],
                         ['C', r.x1 + g, r.y1 + (h * 2), r.x2 - g, r.y1 - (h * 1.5), r.x2, r.y1 + h],
                         ['L', r.x2, r.y2],
                         ['C', r.x2 - g, r.y2 - (h * 2), r.x1 + g, r.y2 + (h * 1.5), r.x1, r.y2 - h],
                         ['L', r.x1, r.y1],
                         ['Z']], true);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCConnectorView
     * @constructor
     */
    function FCConnectorView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.connector.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCConnectorView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCConnectorView.prototype.constructor = FCConnectorView;

    FCConnectorView.prototype.sizeObject = function (canvas) {
        FCGeneralNodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = Math.max(30, this.nameLabel.minWidth);
        this.minHeight = Math.max(30, this.nameLabel.minHeight);
    };

    FCConnectorView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        this.nameLabel.left = this.left + (this.width / 4);
        this.nameLabel.top = this.top + (this.height / 4);
        this.nameLabel.width = (this.width / 2);
        this.nameLabel.height = (this.height / 2);
    };

    FCConnectorView.prototype.drawObject = function (canvas) {
        canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
        canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCOffPageConnectorView
     * @constructor
     */
    function FCOffPageConnectorView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.off-page-connector.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCOffPageConnectorView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCOffPageConnectorView.prototype.constructor = FCOffPageConnectorView;

    FCOffPageConnectorView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = Math.floor(this.height / 4);
        this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - g;
    };

    FCOffPageConnectorView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            g = Math.floor(this.height / 4),
            pts = [
                new Point(r.x1, r.y1),
                new Point(r.x2, r.y1),
                new Point(r.x2, r.y2 - g),
                new Point((r.x1 + r.x2) / 2, r.y2),
                new Point(r.x1, r.y2 - g),
                new Point(r.x1, r.y1)
            ];
        canvas.fillPolygon(pts);
        canvas.polygon(pts);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCOrView
     * @constructor
     */
    function FCOrView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.or.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCOrView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCOrView.prototype.constructor = FCOrView;

    FCOrView.prototype.sizeObject = function (canvas) {
        type.NodeView.prototype.sizeObject.call(this, canvas);
        this.nameLabel.visible = false;
        this.minWidth = 30;
        this.minHeight = 30;
        if (this.height !== this.width) {
            this.width  = Math.min(this.width, this.height);
            this.height = Math.min(this.width, this.height);
        }
    };

    FCOrView.prototype.drawObject = function (canvas) {
        canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
        canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
        var p = Graphics.Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()));
        var d = Math.round(Math.sqrt(2) * this.width / 4);
        canvas.line(p.x, this.top, p.x, this.getBottom());
        canvas.line(this.left, p.y, this.getRight(), p.y);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCSummingJunctionView
     * @constructor
     */
    function FCSummingJunctionView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.summing-junction.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCSummingJunctionView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCSummingJunctionView.prototype.constructor = FCSummingJunctionView;

    FCSummingJunctionView.prototype.sizeObject = function (canvas) {
        type.NodeView.prototype.sizeObject.call(this, canvas);
        this.nameLabel.visible = false;
        this.minWidth = 30;
        this.minHeight = 30;
        if (this.height !== this.width) {
            this.width  = Math.min(this.width, this.height);
            this.height = Math.min(this.width, this.height);
        }
    };

    FCSummingJunctionView.prototype.drawObject = function (canvas) {
        canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
        canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
        var p = Graphics.Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()));
        var d = Math.round(Math.sqrt(2) * this.width / 4);
        canvas.line(p.x - d, p.y - d, p.x + d, p.y + d);
        canvas.line(p.x + d, p.y - d, p.x - d, p.y + d);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCCollateView
     * @constructor
     */
    function FCCollateView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.collate.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCCollateView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCCollateView.prototype.constructor = FCCollateView;

    FCCollateView.prototype.sizeObject = function (canvas) {
        type.NodeView.prototype.sizeObject.call(this, canvas);
        this.nameLabel.visible = false;
        this.minWidth = 30;
        this.minHeight = 30;
    };

    FCCollateView.prototype.drawObject = function (canvas) {
        var r   = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            pts = [
                new Point(r.x1, r.y1),
                new Point(r.x2, r.y1),
                new Point(r.x1, r.y2),
                new Point(r.x2, r.y2),
                new Point(r.x1, r.y1)
            ];
        canvas.fillPolygon(pts);
        canvas.polygon(pts);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCSortView
     * @constructor
     */
    function FCSortView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.sort.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCSortView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCSortView.prototype.constructor = FCSortView;

    FCSortView.prototype.sizeObject = function (canvas) {
        type.NodeView.prototype.sizeObject.call(this, canvas);
        this.nameLabel.visible = false;
        this.minWidth = 30;
        this.minHeight = 30;
    };

    FCSortView.prototype.drawObject = function (canvas) {
        var xm = (this.left + this.getRight()) / 2,
            ym = (this.top + this.getBottom()) / 2,
            pts = [
                new Point(this.left, ym),
                new Point(xm, this.top),
                new Point(this.getRight(), ym),
                new Point(xm, this.getBottom()),
                new Point(this.left, ym)
            ];
        canvas.fillPolygon(pts);
        canvas.polygon(pts);
        canvas.line(this.left, ym, this.getRight(), ym);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCMergeView
     * @constructor
     */
    function FCMergeView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.merge.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCMergeView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCMergeView.prototype.constructor = FCMergeView;

    FCMergeView.prototype.sizeObject = function (canvas) {
        FCGeneralNodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = Math.max(this.nameLabel.minWidth * 2, MERGE_MINWIDTH);
        this.minHeight = Math.max(this.nameLabel.minHeight * 2, MERGE_MINHEIGHT);
    };

    FCMergeView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        this.nameLabel.left = this.left + (this.width / 4);
        this.nameLabel.top = this.top + TOP_PADDING;
        this.nameLabel.width = (this.width / 2);
        this.nameLabel.height = (this.height / 2);
    };

    FCMergeView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            pts = [
                new Point(r.x1, r.y1),
                new Point(r.x2, r.y1),
                new Point((r.x1 + r.x2) / 2, r.y2),
                new Point(r.x1, r.y1)
            ];
        canvas.fillPolygon(pts);
        canvas.polygon(pts);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCExtractView
     * @constructor
     */
    function FCExtractView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.extract.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCExtractView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCExtractView.prototype.constructor = FCExtractView;

    FCExtractView.prototype.sizeObject = function (canvas) {
        FCGeneralNodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = Math.max(this.nameLabel.minWidth * 2, EXTRACT_MINWIDTH);
        this.minHeight = Math.max(this.nameLabel.minHeight * 2, EXTRACT_MINHEIGHT);
    };

    FCExtractView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        this.nameLabel.left = this.left + (this.width / 4);
        this.nameLabel.top = this.top + (this.height / 2) - BOTTOM_PADDING;
        this.nameLabel.width = (this.width / 2);
        this.nameLabel.height = (this.height / 2);
    };

    FCExtractView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            pts = [
                new Point((r.x1 + r.x2) / 2, r.y1),
                new Point(r.x2, r.y2),
                new Point(r.x1, r.y2),
                new Point((r.x1 + r.x2) / 2, r.y1)
            ];
        canvas.fillPolygon(pts);
        canvas.polygon(pts);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCStoredDataView
     * @constructor
     */
    function FCStoredDataView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.stored-data.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCStoredDataView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCStoredDataView.prototype.constructor = FCStoredDataView;

    FCStoredDataView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = Math.floor(this.width / 8);
        this.nameLabel.left = this.left + LEFT_PADDING + g;
        this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2);
    };

    FCStoredDataView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            w = r.getWidth(),
            h = r.getHeight(),
            ym = (r.y1 + r.y2) / 2,
            g = Math.floor(w / 8),
            kappa = 0.5522848,
            ox = g * kappa,       // control point offset horizontal
            oy = (h / 2) * kappa; // control point offset vertical

        canvas.fillPath([['M', r.x2, r.y1],
                         ['C', r.x2 - ox, r.y1, r.x2 - g, ym - oy, r.x2 - g, ym],
                         ['C', r.x2 - g, ym + oy, r.x2 - ox, r.y2, r.x2, r.y2],
                         ['L', r.x1 + g, r.y2],
                         ['C', r.x1 + g - ox, r.y2, r.x1, ym + oy, r.x1, ym],
                         ['C', r.x1, ym - oy, r.x1 + g - ox, r.y1, r.x1 + g, r.y1],
                         ['L', r.x2, r.y1],
                         ['Z']], true);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCDatabaseView
     * @constructor
     */
    function FCDatabaseView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.database.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCDatabaseView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCDatabaseView.prototype.constructor = FCDatabaseView;

    FCDatabaseView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = Math.floor(this.height / 8);
        this.nameLabel.top = this.top + TOP_PADDING + (g * 2);
        this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - (g * 3);
    };

    FCDatabaseView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            w = r.getWidth(),
            h = r.getHeight(),
            xm = (r.x1 + r.x2) / 2,
            g = Math.floor(h / 8),
            kappa = 0.5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = g * kappa;       // control point offset vertical

        canvas.fillPath([['M', r.x1, r.y1 + g],
                         ['C', r.x1, r.y1 + g - oy, xm - ox, r.y1, xm, r.y1],
                         ['C', xm + ox, r.y1, r.x2, r.y1 + g - oy, r.x2, r.y1 + g],
                         ['L', r.x2, r.y2 - g],
                         ['C', r.x2, r.y2 - g + oy, xm + ox, r.y2, xm, r.y2],
                         ['C', xm - ox, r.y2, r.x1, r.y2 - g + oy, r.x1, r.y2 - g],
                         ['L', r.x1, r.y1 + g],
                         ['Z']], true);
        canvas.path([['M', r.x1, r.y1 + g],
                     ['C', r.x1, r.y1 + g + oy, xm - ox, r.y1 + (g * 2), xm, r.y1 + (g * 2)],
                     ['C', xm + ox, r.y1 + (g * 2), r.x2, r.y1 + g + oy, r.x2, r.y1 + g]]);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCDirectAccessStorageView
     * @constructor
     */
    function FCDirectAccessStorageView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.direct-access-storage.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCDirectAccessStorageView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCDirectAccessStorageView.prototype.constructor = FCDirectAccessStorageView;

    FCDirectAccessStorageView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = Math.floor(this.width / 8);
        this.nameLabel.left = this.left + LEFT_PADDING + g;
        this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 3);
    };

    FCDirectAccessStorageView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom()),
            w = r.getWidth(),
            h = r.getHeight(),
            ym = (r.y1 + r.y2) / 2,
            g = Math.floor(w / 8),
            kappa = 0.5522848,
            ox = g * kappa,       // control point offset horizontal
            oy = (h / 2) * kappa; // control point offset vertical

        canvas.fillPath([['M', r.x2 - g, r.y1],
                         ['C', r.x2 - g + ox, r.y1, r.x2, ym - oy, r.x2, ym],
                         ['C', r.x2, ym + oy, r.x2 - g + ox, r.y2, r.x2 - g, r.y2],
                         ['L', r.x1 + g, r.y2],
                         ['C', r.x1 + g - ox, r.y2, r.x1, ym + oy, r.x1, ym],
                         ['C', r.x1, ym - oy, r.x1 + g - ox, r.y1, r.x1 + g, r.y1],
                         ['L', r.x2 - g, r.y1],
                         ['Z']], true);
        canvas.path([['M', r.x2 - g, r.y1],
                     ['C', r.x2 - g - ox, r.y1, r.x2 - (g * 2), ym - oy, r.x2 - (g * 2), ym],
                     ['C', r.x2 - (g * 2), ym + oy, r.x2 - g - ox, r.y2, r.x2 - g, r.y2]]);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCInternalStorageView
     * @constructor
     */
    function FCInternalStorageView() {
        FCGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("flowchart.internal-storage.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from FCGeneralNodeView
    FCInternalStorageView.prototype = Object.create(FCGeneralNodeView.prototype);
    FCInternalStorageView.prototype.constructor = FCInternalStorageView;

    FCInternalStorageView.prototype.arrangeObject = function (canvas) {
        FCGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        var g = 10;
        this.nameLabel.left = this.left + LEFT_PADDING + g;
        this.nameLabel.top = this.top + TOP_PADDING + g;
        this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - g;
        this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - g;
    };

    FCInternalStorageView.prototype.drawObject = function (canvas) {
        var gap = 10;
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.line(this.left + gap, this.top, this.left + gap, this.getBottom());
        canvas.line(this.left, this.top + gap, this.getRight(), this.top + gap);
        FCGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * FCFlowView
     * @constructor
     */
    function FCFlowView() {
        FCGeneralEdgeView.apply(this, arguments);
        this.lineStyle = PreferenceManager.get("flowchart.flow.lineStyle", Core.LS_ROUNDRECT) || PreferenceManager.get("view.lineStyle", Core.LS_OBLIQUE);
    }
    // inherits from FCGeneralEdgeView
    FCFlowView.prototype = Object.create(FCGeneralEdgeView.prototype);
    FCFlowView.prototype.constructor = FCFlowView;


    /* ************************** Type definitions ***************************/

    type.FCModelElement            = FCModelElement;
    type.FCFlowchart               = FCFlowchart;
    type.FCFlowchartDiagram        = FCFlowchartDiagram;
    type.FCProcess                 = FCProcess;
    type.FCTerminator              = FCTerminator;
    type.FCDecision                = FCDecision;
    type.FCDelay                   = FCDelay;
    type.FCPredefinedProcess       = FCPredefinedProcess;
    type.FCAlternateProcess        = FCAlternateProcess;
    type.FCData                    = FCData;
    type.FCDocument                = FCDocument;
    type.FCMultiDocument           = FCMultiDocument;
    type.FCPreparation             = FCPreparation;
    type.FCDisplay                 = FCDisplay;
    type.FCManualInput             = FCManualInput;
    type.FCManualOperation         = FCManualOperation;
    type.FCCard                    = FCCard;
    type.FCPunchedTape             = FCPunchedTape;
    type.FCConnector               = FCConnector;
    type.FCOffPageConnector        = FCOffPageConnector;
    type.FCOr                      = FCOr;
    type.FCSummingJunction         = FCSummingJunction;
    type.FCCollate                 = FCCollate;
    type.FCSort                    = FCSort;
    type.FCMerge                   = FCMerge;
    type.FCExtract                 = FCExtract;
    type.FCStoredData              = FCStoredData;
    type.FCDatabase                = FCDatabase;
    type.FCDirectAccessStorage     = FCDirectAccessStorage;
    type.FCInternalStorage         = FCInternalStorage;
    type.FCFlow                    = FCFlow;

    type.FCGeneralNodeView         = FCGeneralNodeView;
    type.FCGeneralEdgeView         = FCGeneralEdgeView;
    type.FCProcessView             = FCProcessView;
    type.FCTerminatorView          = FCTerminatorView;
    type.FCDecisionView            = FCDecisionView;
    type.FCDelayView               = FCDelayView;
    type.FCPredefinedProcessView   = FCPredefinedProcessView;
    type.FCAlternateProcessView    = FCAlternateProcessView;
    type.FCDataView                = FCDataView;
    type.FCDocumentView            = FCDocumentView;
    type.FCMultiDocumentView       = FCMultiDocumentView;
    type.FCPreparationView         = FCPreparationView;
    type.FCDisplayView             = FCDisplayView;
    type.FCManualInputView         = FCManualInputView;
    type.FCManualOperationView     = FCManualOperationView;
    type.FCCardView                = FCCardView;
    type.FCPunchedTapeView         = FCPunchedTapeView;
    type.FCConnectorView           = FCConnectorView;
    type.FCOffPageConnectorView    = FCOffPageConnectorView;
    type.FCOrView                  = FCOrView;
    type.FCSummingJunctionView     = FCSummingJunctionView;
    type.FCCollateView             = FCCollateView;
    type.FCSortView                = FCSortView;
    type.FCMergeView               = FCMergeView;
    type.FCExtractView             = FCExtractView;
    type.FCStoredDataView          = FCStoredDataView;
    type.FCDatabaseView            = FCDatabaseView;
    type.FCDirectAccessStorageView = FCDirectAccessStorageView;
    type.FCInternalStorageView     = FCInternalStorageView;
    type.FCFlowView                = FCFlowView;

});
