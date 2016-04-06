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


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true, evil: true, loopfunc: true */
/*global define, $, _, window, meta, type, appshell */

define(function (require, exports, module) {
    "use strict";

    var global            = require("core/Global").global,
        Graphics          = require("core/Graphics"),
        Point             = require("core/Graphics").Point,
        Rect              = require("core/Graphics").Rect,
        Color             = require("core/Graphics").Color,
        Font              = require("core/Graphics").Font,
        ZoomFactor        = require("core/Graphics").ZoomFactor,
        GridFactor        = require("core/Graphics").GridFactor,
        Points            = require("core/Graphics").Points,
        Coord             = require("core/Graphics").Coord,
        Canvas            = require("core/Graphics").Canvas,
        Toolkit           = require("core/Toolkit"),
        Core              = require("core/Core"),
        Diagram           = require("core/Core").Diagram,
        Cursor            = require("core/Core").Cursor,
        MouseEvent        = require("core/Core").MouseEvent,
        NodeView          = require("core/Core").NodeView,
        EdgeView          = require("core/Core").EdgeView,
        LabelView         = require("core/Core").LabelView,
        ParasiticView     = require("core/Core").ParasiticView,
        NodeParasiticView = require("core/Core").NodeParasiticView,
        EdgeParasiticView = require("core/Core").EdgeParasiticView,
        NodeLabelView     = require("core/Core").NodeLabelView,
        EdgeLabelView     = require("core/Core").EdgeLabelView,
        NodeNodeView      = require("core/Core").NodeNodeView,
        EdgeNodeView      = require("core/Core").EdgeNodeView,
        MetaModelManager  = require("core/MetaModelManager"),
        PreferenceManager = require("core/PreferenceManager"),
        Repository        = require("core/Repository"),
        UML               = require("uml/UML");

    /**
     * View Constants
     * @private
     * @const {number}
     */
    var SHADOW_OFFSET = 7,
        SHADOW_ALPHA = 0.2,
        SHADOW_COLOR = Color.LIGHT_GRAY,

        // When use a sequence of labels, leave space after LabelView
        LABEL_INTERVAL = 3,

        COMPARTMENT_ITEM_INTERVAL = 2,
        COMPARTMENT_LEFT_PADDING = 5,
        COMPARTMENT_RIGHT_PADDING = 5,
        COMPARTMENT_TOP_PADDING = 5,
        COMPARTMENT_BOTTOM_PADDING = 5,

        DECORATION_ICON_WIDTH = 24,
        DECORATION_ICON_HEIGHT = 24,

        ICONICVIEW_ICONMINWIDTH = 24,
        ICONICVIEW_ICONMINHEIGHT = 24,

        TEMPLATEPARAMETERCOMPARTMENT_OVERLAP = 5,
        TEMPLATEPARAMETERCOMPARTMENT_LEFT_MARGIN = 20,
        TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY = 10,

        CLASS_ACTIVE_VERTLINE_WIDTH = 3,

        PACKAGE_MINWIDTH = 50,
        PACKAGE_MINHEIGHT = 40,
        PACKAGE_TAB_HEIGHT = 15,

        INTERFACE_ICONMINWIDTH = 24,
        INTERFACE_ICONMINHEIGHT = 24,

        PORT_MINWIDTH = 14,
        PORT_MINHEIGHT = 14,

        ACTOR_ICON_MINHEIGHT = 55,
        ACTOR_ICON_MINWIDTH = 26,
        ACTOR_RATIO_PERCENT = (ACTOR_ICON_MINWIDTH / ACTOR_ICON_MINHEIGHT) * 100,

        USECASE_MINWIDTH = 70,
        USECASE_MINHEIGHT = 32,
        USECASE_ICON_MINWIDTH = 70,
        USECASE_ICON_MINHEIGHT = 32,
        USECASE_RATIO_PERCENT = (USECASE_ICON_MINWIDTH / USECASE_ICON_MINHEIGHT) * 100,

        ARTIFACT_ICON_MINWIDTH = 40,
        ARTIFACT_ICON_MINHEIGHT = 50,
        ARTIFACT_RATIO_PERCENT = (ARTIFACT_ICON_MINWIDTH / ARTIFACT_ICON_MINHEIGHT) * 100,

        COMPONENT_MINWIDTH = 50,
        COMPONENT_MINHEIGHT = 45,
        COMPONENT_ICON_MINWIDTH = 50,
        COMPONENT_ICON_MINHEIGHT = 45,
        COMPONENT_RATIO_PERCENT = (COMPONENT_ICON_MINWIDTH / COMPONENT_ICON_MINHEIGHT) * 100,
        COMPONENT_STATIC_MARGIN = 20,
        COMPONENT_BALANCED_HEIGHT = 45,
        COMPONENT_RECT_INDENT = 10,

        NODE_MINWIDTH = 45,
        NODE_MINHEIGHT = 45,
        NODE_RATIO_PERCENT = (NODE_MINWIDTH / NODE_MINHEIGHT) * 100,
        NODE_STATIC_MARGIN = 10,

        // State Machines
        STATE_MINWIDTH = 60,
        STATE_MINHEIGHT = 40,
        STATE_ROUND = 10,

        REGION_MINWIDTH = 50,
        REGION_MINHEIGHT = 50,

        INITIALSTATE_MINWIDTHH = 20,
        INITIALSTATE_MINHEIGHT = 20,
        FINALSTATE_MINWIDTHH = 26,
        FINALSTATE_MINHEIGHT = 26,
        HISTORYSTATE_MINWIDTHH = 26,
        HISTORYSTATE_MINHEIGHT = 26,
        JOIN_MINLENGTH = 70,
        JOIN_MINTHICK = 6,
        FORK_MINLENGTH = 70,
        FORK_MINTHICK = 6,
        CHOICE_MINWIDTH = 23,
        CHOICE_MINHEIGHT = 19,
        JUNCTION_MINWIDTH = 15,
        JUNCTION_MINHEIGHT = 15,
        ENTRYPOINT_MINWIDTH = 15,
        ENTRYPOINT_MINHEIGHT = 15,
        EXITPOINT_MINWIDTH = 15,
        EXITPOINT_MINHEIGHT = 15,
        TERMINATE_MINWIDTH = 26,
        TERMINATE_MINHEIGHT = 26,
        SELFTRANSITION_DISTANCE = 30,

        CONNECTIONPOINT_MINWIDTH = 14,
        CONNECTIONPOINT_MINHEIGHT = 14,

        // Activities
        ACTION_MINWIDTH = 60,
        ACTION_MINHEIGHT = 40,
        ACTION_ROUND = 10,

        PIN_MINWIDTH = 18,
        PIN_MINHEIGHT = 18,
        
        INITIALNODE_MINWIDTH = 20,
        INITIALNODE_MINHEIGHT = 20,
        ACTIVITYFINALNODE_MINWIDTH = 26,
        ACTIVITYFINALNODE_MINHEIGHT = 26,
        FLOWFINALNODE_MINWIDTH = 26,
        FLOWFINALNODE_MINHEIGHT = 26,
        FORKNODE_MINLENGTH = 70,
        FORKNODE_MINTHICK = 6,
        JOINNODE_MINLENGTH = 70,
        JOINNODE_MINTHICK = 6,
        MERGENODE_MINWIDTH = 23,
        MERGENODE_MINHEIGHT = 19,
        DECISIONNODE_MINWIDTH = 23,
        DECISIONNODE_MINHEIGHT = 19,

        SWIMLANE_HORIZ_LEFT = 50,
        SWIMLANE_VERT_TOP = 50,
        SWIMLANE_VERT_MINWIDTH = 50,
        SWIMLANE_VERT_MINHEIGHT = 300,
        SWIMLANE_HORIZ_MINWIDTH = SWIMLANE_VERT_MINHEIGHT,
        SWIMLANE_HORIZ_MINHEIGHT = SWIMLANE_VERT_MINWIDTH,
        SWIMLANE_HEADER_TOP_MARGIN = 4,
        SWIMLANE_HEADER_BOTTOM_MARGIN = 4,
        SWIMLANE_HEADER_LEFT_MARGIN = 10,
        SWIMLANE_HEADER_RIGHT_MARGIN = 10,
        SWIMLANE_PEN_WIDTH = 2,

        // Interactions
        COLLABORATION_MINHEIGHT = USECASE_MINHEIGHT,
        COLLABORATION_MINWIDTH = USECASE_MINWIDTH,

        ACTIVATION_MINWIDTH = 14,
        ACTIVATION_MINHEIGHT = 25,
        LIFELINE_MINWIDTH = 10, // should be even number
        LIFELINE_MINHEIGHT = 50,
        LIFELINE_TOP_POSITION = 40,
        SEQ_OBJECT_MINHEIGHT = 40,
        SEQ_OBJECT_MINWIDTH = 30,
        MULTI_INSTANCE_MARGIN = 5,
        SELF_MESSAGE_WIDTH = 30,
        SELF_MESSAGE_HEIGHT = 20,
        SEQ_OBJECT_MESSAGE_MIN_INTERVAL = 10,

        STATEINVARIANT_MINWIDTH = 50,
        STATEINVARIANT_MINHEIGHT = 20,

        CONTINUATION_MINWIDTH = 50,
        CONTINUATION_MINHEIGHT = 20,

        FRAME_MINWIDTH = 80,
        FRAME_MINHEIGHT = 50,
        FRAME_CONTENT_MINWIDTH = 10,
        FRAME_CONTENT_MINHEIGHT = 30,

        COMBINEDFRAGMENT_MINWIDTH = FRAME_MINWIDTH,
        COMBINEDFRAGMENT_MINHEIGHT = FRAME_MINHEIGHT,
        COMBINEDFRAGMENT_CONTENT_MINWIDTH = FRAME_CONTENT_MINWIDTH,
        COMBINEDFRAGMENT_CONTENT_MINHEIGHT = FRAME_CONTENT_MINHEIGHT,

        INTERACTIONOPERAND_MINWIDTH = COMBINEDFRAGMENT_MINWIDTH,
        INTERACTIONOPERAND_MINHEIGHT = COMBINEDFRAGMENT_CONTENT_MINHEIGHT,
        INTERACTIONOPERAND_GUARD_HORZ_MARGIN = 20,
        INTERACTIONOPERAND_GUARD_VERT_MARGIN = 15,

        HYPERLINK_MINWIDTH = 100,
        HYPERLINK_MINHEIGHT = 20,

        CUSTOM_TEXT_MINWIDTH = 10,
        CUSTOM_TEXT_MINHEIGHT = 10,

        NOTE_MINWIDTH = 50,
        NOTE_MINHEIGHT = 20,
        NOTE_FOLDING_SIZE = 10;

    function hasValue(value) {
        return (value && value.length > 0);
    }

    function getValue(prefix, value, postfix) {
        if (hasValue(value)) {
            return prefix + value + postfix;
        } else {
            return "";
        }
    }

    function getTypeName(prefix, type) {
        if (_.isString(type) && (type.length > 0)) {
            return prefix + type;
        } else if (type instanceof global.type.Model) {
            return prefix + type.name;
        } else {
            return "";
        }
    }

    function getTheta(x1, y1, x2, y2) {
        var x = x1 - x2;
        var y = y1 - y2;
        var th = Math.atan(Math.abs(y) / (Math.abs(x) + 0.0000000001));
        if (x > 0) {
            if (y > 0) {
                th = Math.PI - th;
            } else {
                th = th + Math.PI;
            }
        } else if (y < 0) {
            th = 2 * Math.PI - th;
        }
        return th;
    }

    /**
     * Draw image
     * @private
     * @param {Canvas} canvas
     * @param {Rect} rect
     * @param {type.UMLImage} image
     */
    function drawImage(canvas, rect, image) {
        if (image && image.content) {
            try {
                eval(image.content);
            } catch (err) {
                console.log(err);
            }
        }
    }

    /**************************************************************************
     *                                                                        *
     *                               COMMON VIEWS                             *
     *                                                                        *
     *************************************************************************/

    /**
     * UMLDiagram
     * @constructor
     * @extends Diagram
     */
    function UMLDiagram() {
        Diagram.apply(this, arguments);
        this.name = null;
    }
    // inherits from Diagram
    UMLDiagram.prototype = Object.create(Diagram.prototype);
    UMLDiagram.prototype.constructor = UMLDiagram;

    UMLDiagram.prototype.getDisplayClassName = function () {
        var name = this.getClassName();
        return name.substring(3, name.length);
    };

    /**
     * UMLCompartmentView
     * @constructor
     * @extends NodeView
     */
    function UMLCompartmentView() {
        NodeView.apply(this, arguments);
        this.selectable = Core.SK_PROPAGATE;
        this.parentStyle = true;

        /* temporal */
        this._leftPadding   = COMPARTMENT_LEFT_PADDING;
        this._rightPadding  = COMPARTMENT_RIGHT_PADDING;
        this._topPadding    = COMPARTMENT_TOP_PADDING;
        this._bottomPadding = COMPARTMENT_BOTTOM_PADDING;
        this._itemInterval  = COMPARTMENT_ITEM_INTERVAL;
    }
    // inherits from NodeView
    UMLCompartmentView.prototype = Object.create(NodeView.prototype);
    UMLCompartmentView.prototype.constructor = UMLCompartmentView;

    /**
     * size
     */
    UMLCompartmentView.prototype.size = function (canvas) {
        var i, len, w = 0, h = this._topPadding;
        for (i = 0, len = this.subViews.length; i < len; i++) {
            var item = this.subViews[i];
            if (item.parentStyle) {
                item.font.size = item._parent.font.size;
            }
            item.size(canvas);
            if (item.visible) {
                if (w < item.minWidth) {
                    w = item.minWidth;
                }
                if (i > 0) {
                    h += this._itemInterval;
                }
                h += item.minHeight;
            }
        }
        this.minWidth = w + this._leftPadding + this._rightPadding;
        this.minHeight = h + this._bottomPadding;
        this.sizeConstraints();
    };

    /**
     * arrange
     */
    UMLCompartmentView.prototype.arrange = function (canvas) {
        var i, len, h = this._topPadding;
        for (i = 0, len = this.subViews.length; i < len; i++) {
            var item = this.subViews[i];
            if (item.visible) {
                if (i > 0) { h += this._itemInterval; }
                item.left = this.left + this._leftPadding;
                item.top = this.top + h;
                item.width = this.width - this._leftPadding - this._rightPadding;
                h += item.height;
            }
            item.arrange(canvas);
        }
        h += this._bottomPadding;
        this.height = h;
        this.sizeConstraints();
    };


    /**
     * UMLNameCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLNameCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
        this.selectable = Core.SK_NO;

        /** @member {LabelView} */
        this.stereotypeLabel = new LabelView();
        this.stereotypeLabel.horizontalAlignment = Graphics.AL_CENTER;
        this.stereotypeLabel.parentStyle = true;
        this.addSubView(this.stereotypeLabel);

        /** @member {LabelView} */
        this.nameLabel = new LabelView();
        this.nameLabel.horizontalAlignment = Graphics.AL_CENTER;
        this.nameLabel.parentStyle = true;
        this.addSubView(this.nameLabel);

        /** @member {LabelView} */
        this.namespaceLabel = new LabelView();
        this.namespaceLabel.horizontalAlignment = Graphics.AL_CENTER;
        this.namespaceLabel.parentStyle = true;
        this.addSubView(this.namespaceLabel);

        /** @member {LabelView} */
        this.propertyLabel = new LabelView();
        this.propertyLabel.horizontalAlignment = Graphics.AL_RIGHT;
        this.propertyLabel.parentStyle = true;
        this.addSubView(this.propertyLabel);

        /** @member {boolean} */
        this.wordWrap = false;
    }
    // inherits from UMLCompartmentView
    UMLNameCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLNameCompartmentView.prototype.constructor = UMLNameCompartmentView;

    UMLNameCompartmentView.prototype.update = function (canvas) {
        this.namespaceLabel.font.size = this.font.size * 0.9;
        if (this.model) {
            if (this.model.isAbstract === true) {
                this.nameLabel.font.style = Graphics.FS_BOLD_ITALIC;
            } else {
                this.nameLabel.font.style = Graphics.FS_BOLD;
            }
            if (this.model instanceof type.UMLInstance) {
                this.nameLabel.underline = true;
            }
            this.nameLabel.wordWrap = this.wordWrap;
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };

    UMLNameCompartmentView.prototype.size = function (canvas) {
        UMLCompartmentView.prototype.size.call(this, canvas);
        this.stereotypeLabel.height = this.stereotypeLabel.minHeight;
        this.nameLabel.height = this.nameLabel.minHeight;
        this.namespaceLabel.height = this.namespaceLabel.minHeight;
        this.propertyLabel.height = this.propertyLabel.minHeight;
        if (this._parent instanceof type.UMLGeneralNodeView && this._parent.stereotypeDisplay === UML.SD_DECORATION) {
            this.minHeight = DECORATION_ICON_HEIGHT + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING;
            this.sizeConstraints();
        }
    };


    /**
     * UMLAttributeView
     * @constructor
     * @extends LabelView
     */
    function UMLAttributeView() {
        LabelView.apply(this, arguments);
        this.selectable = Core.SK_YES;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_NONE;
        this.parentStyle = true;
        this.horizontalAlignment = Graphics.AL_LEFT;
    }
    // inherits from LabelView
    UMLAttributeView.prototype = Object.create(LabelView.prototype);
    UMLAttributeView.prototype.constructor = UMLAttributeView;

    UMLAttributeView.prototype.update = function (canvas) {
        var options = {
            showVisibility    : true,
            stereotypeDisplay : UML.SD_LABEL,
            showProperty      : true,
            showType          : true,
            showMultiplicity  : true
        };
        if (this._parent && this._parent._parent) {
            options.showVisibility    = this._parent._parent.showVisibility;
            options.stereotypeDisplay = this._parent._parent.stereotypeDisplay;
            options.showProperty      = this._parent._parent.showProperty;
            options.showType          = this._parent._parent.showType;
            options.showMultiplicity  = this._parent._parent.showMultiplicity;
        }
        if (this._parent) {
            this.visible = this._parent.visible;
        }
        if (this.model) {
            this.text = this.model.getString(options);
            this.underline = (this.model.isStatic === true);
        }
        LabelView.prototype.update.call(this, canvas);
    };

    UMLAttributeView.prototype.size = function (canvas) {
        LabelView.prototype.size.call(this, canvas);
        this.height = this.minHeight;
    };


    /**
     * UMLAttributeCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLAttributeCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
    }
    // inherits from UMLCompartmentView
    UMLAttributeCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLAttributeCompartmentView.prototype.constructor = UMLAttributeCompartmentView;

    UMLAttributeCompartmentView.prototype.update = function (canvas) {
        if (this.model.attributes) {
            var i, len, tempViews = this.subViews;
            this.subViews = [];
            for (i = 0, len = this.model.attributes.length; i < len; i++) {
                var attr = this.model.attributes[i];
                var attrView = _.find(tempViews, function (v) { return v.model === attr; });
                if (!attrView) {
                    attrView = new UMLAttributeView();
                    attrView.model = attr;
                    attrView._parent = this;
                    // attrView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                    Repository.bypassInsert(this, 'subViews', attrView);
                } else {
                    this.addSubView(attrView);
                }
                attrView.setup(canvas);
            }
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };


    /**
     * UMLOperationView
     * @constructor
     * @extends LabelView
     */
    function UMLOperationView() {
        LabelView.apply(this, arguments);
        this.selectable = Core.SK_YES;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_NONE;
        this.parentStyle = true;
        this.horizontalAlignment = Graphics.AL_LEFT;
    }
    // inherits from LabelView
    UMLOperationView.prototype = Object.create(LabelView.prototype);
    UMLOperationView.prototype.constructor = UMLOperationView;

    UMLOperationView.prototype.update = function (canvas) {
        var options = {
            showVisibility         : true,
            stereotypeDisplay      : UML.SD_LABEL,
            showProperty           : true,
            showType               : true,
            showMultiplicity       : true,
            showOperationSignature : true
        };
        if (this._parent && (this._parent._parent instanceof type.UMLClassifierView)) {
            options.showVisibility         = this._parent._parent.showVisibility;
            options.stereotypeDisplay      = this._parent._parent.stereotypeDisplay;
            options.showProperty           = this._parent._parent.showProperty;
            options.showType               = this._parent._parent.showType;
            options.showMultiplicity       = this._parent._parent.showMultiplicity;
            options.showOperationSignature = this._parent._parent.showOperationSignature;
        }
        if (this._parent) {
            this.visible = this._parent.visible;
        }
        if (this.model) {
            this.text = this.model.getString(options);
            this.underline = (this.model.isStatic === true);
            if (this.model.isAbstract) {
                this.font.style = Graphics.FS_ITALIC;
            } else {
                this.font.style = Graphics.FS_NORMAL;
            }
        }
        LabelView.prototype.update.call(this, canvas);
    };

    UMLOperationView.prototype.size = function (canvas) {
        LabelView.prototype.size.call(this, canvas);
        this.height = this.minHeight;
    };


    /**
     * UMLOperationCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLOperationCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
    }
    // inherits from UMLCompartmentView
    UMLOperationCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLOperationCompartmentView.prototype.constructor = UMLOperationCompartmentView;

    UMLOperationCompartmentView.prototype.update = function (canvas) {
        if (this.model.operations) {
            var i, len, tempViews = this.subViews;
            this.subViews = [];
            for (i = 0, len = this.model.operations.length; i < len; i++) {
                var op = this.model.operations[i];
                var opView = _.find(tempViews, function (v) { return v.model === op; });
                if (!opView) {
                    opView = new UMLOperationView();
                    opView.model = op;
                    opView._parent = this;
                    // opView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                    Repository.bypassInsert(this, 'subViews', opView);
                } else {
                    this.addSubView(opView);
                }
                opView.setup(canvas);
            }
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };


    /**
     * UMLReceptionView
     * @constructor
     * @extends LabelView
     */
    function UMLReceptionView() {
        LabelView.apply(this, arguments);
        this.selectable = Core.SK_YES;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_NONE;
        this.parentStyle = true;
        this.horizontalAlignment = Graphics.AL_LEFT;
    }
    // inherits from LabelView
    UMLReceptionView.prototype = Object.create(LabelView.prototype);
    UMLReceptionView.prototype.constructor = UMLReceptionView;

    UMLReceptionView.prototype.update = function (canvas) {
        var options = {
            showVisibility         : true,
            stereotypeDisplay      : UML.SD_LABEL,
            showProperty           : true,
            showType               : true,
            showOperationSignature : true
        };
        if (this._parent && (this._parent._parent instanceof type.UMLClassifierView)) {
            options.showVisibility         = this._parent._parent.showVisibility;
            options.stereotypeDisplay      = this._parent._parent.stereotypeDisplay;
            options.showProperty           = this._parent._parent.showProperty;
            options.showType               = this._parent._parent.showType;
            options.showOperationSignature = this._parent._parent.showOperationSignature;
        }
        if (this._parent) {
            this.visible = this._parent.visible;
        }
        if (this.model) {
            this.text = this.model.getString(options);
            this.underline = (this.model.isStatic === true);
        }
        LabelView.prototype.update.call(this, canvas);
    };

    UMLReceptionView.prototype.size = function (canvas) {
        LabelView.prototype.size.call(this, canvas);
        this.height = this.minHeight;
    };


    /**
     * UMLReceptionCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLReceptionCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
    }
    // inherits from UMLCompartmentView
    UMLReceptionCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLReceptionCompartmentView.prototype.constructor = UMLReceptionCompartmentView;

    UMLReceptionCompartmentView.prototype.update = function (canvas) {
        if (this.model.receptions) {
            var i, len, tempViews = this.subViews;
            this.subViews = [];
            for (i = 0, len = this.model.receptions.length; i < len; i++) {
                var rcp = this.model.receptions[i];
                var rcpView = _.find(tempViews, function (v) { return v.model === rcp; });
                if (!rcpView) {
                    rcpView = new UMLReceptionView();
                    rcpView.model = rcp;
                    rcpView._parent = this;
                    // opView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                    Repository.bypassInsert(this, 'subViews', rcpView);
                } else {
                    this.addSubView(rcpView);
                }
                rcpView.setup(canvas);
            }
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };


    /**
     * UMLTemplateParameterView
     * @constructor
     * @extends LabelView
     */
    function UMLTemplateParameterView() {
        LabelView.apply(this, arguments);
        this.selectable = Core.SK_YES;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_NONE;
        this.parentStyle = true;
        this.horizontalAlignment = Graphics.AL_LEFT;
    }
    // inherits from LabelView
    UMLTemplateParameterView.prototype = Object.create(LabelView.prototype);
    UMLTemplateParameterView.prototype.constructor = UMLTemplateParameterView;

    UMLTemplateParameterView.prototype.update = function (canvas) {
        var options = {
            showType : true
        };
        if (this._parent && (this._parent._parent instanceof type.UMLClassifierView)) {
            options.showType = this._parent._parent.showType;
        }
        if (this._parent) {
            this.visible = this._parent.visible;
        }
        if (this.model) {
            this.text = this.model.getString(options);
        }
        LabelView.prototype.update.call(this, canvas);
    };

    UMLTemplateParameterView.prototype.size = function (canvas) {
        LabelView.prototype.size.call(this, canvas);
        this.height = this.minHeight;
    };


    /**
     * UMLTemplateParameterCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLTemplateParameterCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
    }
    // inherits from UMLCompartmentView
    UMLTemplateParameterCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLTemplateParameterCompartmentView.prototype.constructor = UMLTemplateParameterCompartmentView;

    UMLTemplateParameterCompartmentView.prototype.update = function (canvas) {
        if (this.model.templateParameters) {
            var i, len, tempViews = this.subViews;
            this.subViews = [];
            for (i = 0, len = this.model.templateParameters.length; i < len; i++) {
                var tp = this.model.templateParameters[i];
                var tpView = _.find(tempViews, function (v) { return v.model === tp; });
                if (!tpView) {
                    tpView = new UMLTemplateParameterView();
                    tpView.model = tp;
                    tpView._parent = this;
                    // tpView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                    Repository.bypassInsert(this, 'subViews', tpView);
                } else {
                    this.addSubView(tpView);
                }
                tpView.setup(canvas);
            }
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };

    UMLTemplateParameterCompartmentView.prototype.drawShadow = function (canvas) {
        canvas.storeState();
        canvas.alpha = SHADOW_ALPHA;
        canvas.fillColor = SHADOW_COLOR;
        canvas.fillRect(
            this.left + SHADOW_OFFSET,
            this.top + SHADOW_OFFSET,
            this.getRight() + SHADOW_OFFSET,
            this.getBottom() + SHADOW_OFFSET
        );
        canvas.restoreState();
    };

    UMLTemplateParameterCompartmentView.prototype.drawObject = function (canvas) {
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom(), [3]);
    };


    /**
     * UMLGeneralNodeView
     * @constructor
     * @extends NodeView
     */
    function UMLGeneralNodeView() {
        NodeView.apply(this, arguments);

        /** @member {string} */
        this.stereotypeDisplay = UML.SD_LABEL;

        /** @member {boolean} */
        this.showVisibility = true;

        /** @member {boolean} */
        this.showNamespace = false;

        /** @member {boolean} */
        this.showProperty = true;

        /** @member {boolean} */
        this.showType = true;

        /** @member {boolean} */
        this.wordWrap = false;

        /** @member {UMLNameCompartmentView} */
        this.nameCompartment = new UMLNameCompartmentView();
        this.nameCompartment.parentStyle = true;
        this.addSubView(this.nameCompartment);

        /* temporal */
        this.mainRect = new Rect(0, 0, 0, 0);
        this.iconRect = new Rect(0, 0, 0, 0);
        this.iconRatio = 100;
    }
    // inherits from NodeView
    UMLGeneralNodeView.prototype = Object.create(NodeView.prototype);
    UMLGeneralNodeView.prototype.constructor = UMLGeneralNodeView;

    UMLGeneralNodeView.prototype.computeIconRect = function (rect, ratioPercent) {
        var rr = rect.getRatioPercent(), ir = ratioPercent,
            x = 0, y = 0, h = 0, w = 0;
        if (rr >= ir) {
            h = rect.getHeight();
            w = h * ir / 100;
            x = rect.x1 + (rect.x2 - rect.x1 - w) / 2;
            y = rect.y1;
        } else {
            w = rect.getWidth();
            h = w * 100 / ir;
            y = rect.y1 + (rect.y2 - rect.y1 - h) / 2;
            x = rect.x1;
        }
        return new Rect(x, y, x + w, y + h);
    };

    UMLGeneralNodeView.prototype.drawIcon = function (canvas, rect) {
        if (this.model) {
            if (this.model.stereotype && this.model.stereotype.icon && this.model.stereotype.icon.content.trim().length > 0) {
                var ratioRect = this.computeIconRect(rect, (this.model.stereotype.icon.width / this.model.stereotype.icon.height) * 100);
                drawImage(canvas, ratioRect, this.model.stereotype.icon);
            } else {
                canvas.rect(rect.x1, rect.y1, rect.x2, rect.y2);
                canvas.line(rect.x1, rect.y1, rect.x2, rect.y2);
                canvas.line(rect.x2, rect.y1, rect.x1, rect.y2);
            }
        }
    };

    UMLGeneralNodeView.prototype.drawDecorationIcon = function (canvas, rect) {
        this.drawIcon(canvas, rect);
    };

    UMLGeneralNodeView.prototype.getAllCompartments = function () {
        var i, len, comps = [];
        for (i = 0, len = this.subViews.length; i < len; i++) {
            var v = this.subViews[i];
            if (v instanceof UMLCompartmentView) {
                comps.push(v);
            }
        }
        return comps;
    };

    UMLGeneralNodeView.prototype.getSizeOfAllCompartments = function (canvas) {
        var comps = this.getAllCompartments();
        var i, len, w = 0, h = 0;
        for (i = 0, len = comps.length; i < len; i++) {
            var comp = comps[i];
            comp.size(canvas);
            if (comp.visible) {
                if (w < comp.minWidth) {
                    w = comp.minWidth;
                }
                h += comp.minHeight;
            }
        }
        return new Point(w, h);
    };

    UMLGeneralNodeView.prototype.arrangeAllCompartments = function (rect, canvas) {
        var comps = this.getAllCompartments();
        var i, len, _y = rect.y1;
        for (i = 0, len = comps.length; i < len; i++) {
            var comp = comps[i];
            if (comp.visible) {
                comp.left = rect.x1;
                comp.top = _y;
                comp.width = (rect.x2 - rect.x1) + 1;
                comp.height = comp.minHeight;
                comp.arrange(canvas);
                _y += comp.height;
            }
        }
    };

    UMLGeneralNodeView.prototype.delimitContainingBoundary = function (canvas) {
        var i, len, r = new Rect(this.left, this.top, this.getRight(), this.getBottom());
        for (i = 0, len = this.containedViews.length; i < len; i++) {
            if (this.containedViews[i].containerExtending) {
                var vr = this.containedViews[i].getBoundingBox(canvas);
                vr = new Rect(vr.x1 - COMPARTMENT_LEFT_PADDING, vr.y1 - COMPARTMENT_TOP_PADDING,
                              vr.x2 + COMPARTMENT_RIGHT_PADDING, vr.y2 + COMPARTMENT_BOTTOM_PADDING);
                r = Coord.unionRect(r, vr);
            }
        }
        this.left = r.x1;
        this.top = r.y1;
        this.setRight(r.x2);
        this.setBottom(r.y2);
    };

    UMLGeneralNodeView.prototype.getStereotypeLabelText = function () {
        return this.model.getStereotypeString();
    };

    UMLGeneralNodeView.prototype.update = function (canvas) {
        if (this.model) {
            // nameCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.nameCompartment.model !== this.model) {
                Repository.bypassFieldAssign(this.nameCompartment, 'model', this.model);
            }
            this.nameCompartment.stereotypeLabel.text = this.getStereotypeLabelText();
            this.nameCompartment.nameLabel.text = this.model.name;
            this.nameCompartment.namespaceLabel.text = this.model.getNamespaceString();
            this.nameCompartment.propertyLabel.text = this.model.getPropertyString();
            this.nameCompartment.namespaceLabel.visible = this.showNamespace;
            this.nameCompartment.propertyLabel.visible = this.showProperty;
            this.nameCompartment.wordWrap = this.wordWrap;
            switch (this.stereotypeDisplay) {
            case UML.SD_NONE:
                this.nameCompartment.stereotypeLabel.visible = false;
                break;
            case UML.SD_LABEL:
                this.nameCompartment.stereotypeLabel.visible = (this.nameCompartment.stereotypeLabel.text.length > 0);
                break;
            case UML.SD_DECORATION:
                this.nameCompartment.stereotypeLabel.visible = false;
                break;
            case UML.SD_DECORATION_LABEL:
                this.nameCompartment.stereotypeLabel.visible = true;
                break;
            case UML.SD_ICON:
                this.nameCompartment.stereotypeLabel.visible = false;
                break;
            case UML.SD_ICON_LABEL:
                this.nameCompartment.stereotypeLabel.visible = true;
                break;
            }
            if (this.nameCompartment.propertyLabel.text.length === 0) {
                this.nameCompartment.propertyLabel.visible = false;
            }
        }
        NodeView.prototype.update.call(this, canvas);
    };

    UMLGeneralNodeView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        this.sizeCommon(canvas);
        switch (this.stereotypeDisplay) {
        case UML.SD_NONE:
            this.sizeAsCanonicalForm(canvas, false);
            break;
        case UML.SD_LABEL:
            this.sizeAsCanonicalForm(canvas, true);
            break;
        case UML.SD_DECORATION:
            this.sizeAsDecorationForm(canvas, false);
            break;
        case UML.SD_DECORATION_LABEL:
            this.sizeAsDecorationForm(canvas, true);
            break;
        case UML.SD_ICON:
            this.sizeAsIconicForm(canvas, false);
            break;
        case UML.SD_ICON_LABEL:
            this.sizeAsIconicForm(canvas, true);
            break;
        }
        this.delimitContainingBoundary(canvas);
    };

    UMLGeneralNodeView.prototype.sizeCommon = function (canvas) {
    };

    UMLGeneralNodeView.prototype.sizeAsCanonicalForm = function (canvas, showLabel) {
        var sz = this.getSizeOfAllCompartments(canvas);
        this.minWidth = sz.x;
        this.minHeight = sz.y;
    };

    UMLGeneralNodeView.prototype.sizeAsDecorationForm = function (canvas, showLabel) {
        var sz = this.getSizeOfAllCompartments(canvas);
        this.minWidth = Math.max(this.nameCompartment.minWidth + DECORATION_ICON_WIDTH + COMPARTMENT_RIGHT_PADDING + COMPARTMENT_LEFT_PADDING, sz.x);
        this.minHeight = sz.y;
    };

    UMLGeneralNodeView.prototype.sizeAsIconicForm = function (canvas, showLabel) {
        var sz = this.getSizeOfAllCompartments(canvas);
        this.minWidth = Math.max(sz.x, ICONICVIEW_ICONMINWIDTH);
        this.minHeight = ICONICVIEW_ICONMINHEIGHT + sz.y;
    };

    UMLGeneralNodeView.prototype.arrangeObject = function (canvas) {
        this.arrangeCommon(canvas);
        switch (this.stereotypeDisplay) {
        case UML.SD_NONE:
            this.arrangeAsCanonicalForm(canvas, false);
            break;
        case UML.SD_LABEL:
            this.arrangeAsCanonicalForm(canvas, true);
            break;
        case UML.SD_DECORATION:
            this.arrangeAsDecorationForm(canvas, false);
            break;
        case UML.SD_DECORATION_LABEL:
            this.arrangeAsDecorationForm(canvas, true);
            break;
        case UML.SD_ICON:
            this.arrangeAsIconicForm(canvas, false);
            break;
        case UML.SD_ICON_LABEL:
            this.arrangeAsIconicForm(canvas, true);
            break;
        }
        NodeView.prototype.arrangeObject.call(this, canvas);
    };

    UMLGeneralNodeView.prototype.arrangeCommon = function (canvas) {
         this.mainRect.setRect(this.left, this.top, this.getRight(), this.getBottom());
    };

    UMLGeneralNodeView.prototype.arrangeAsCanonicalForm = function (canvas, showLabel) {
        this.arrangeAllCompartments(this.mainRect, canvas);
    };

    UMLGeneralNodeView.prototype.arrangeAsDecorationForm = function (canvas, showLabel) {
        this.arrangeAllCompartments(this.mainRect, canvas);
        this.nameCompartment.width = this.width - DECORATION_ICON_WIDTH - COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING;
        this.nameCompartment.arrange(canvas);
    };

    UMLGeneralNodeView.prototype.arrangeAsIconicForm = function (canvas, showLabel) {
        var sz = this.getSizeOfAllCompartments(canvas);
        var r  = new Rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2 - sz.y);
        this.iconRect = this.computeIconRect(r, this.iconRatio);
        var r2 = new Rect(this.mainRect.x1, this.mainRect.y1 + this.iconRect.getHeight(), this.mainRect.x2, this.mainRect.y2);
        this.arrangeAllCompartments(r2, canvas);
    };

    UMLGeneralNodeView.prototype.drawShadow = function (canvas) {
        canvas.storeState();
        canvas.alpha = SHADOW_ALPHA;
        canvas.lineColor = "#ffffff00";
        canvas.fillColor = SHADOW_COLOR;
        this.drawShadowCommon(canvas);
        switch (this.stereotypeDisplay) {
        case UML.SD_NONE:
            this.drawShadowAsCanonicalForm(canvas, false);
            break;
        case UML.SD_LABEL:
            this.drawShadowAsCanonicalForm(canvas, true);
            break;
        case UML.SD_DECORATION:
            this.drawShadowAsDecorationForm(canvas, false);
            break;
        case UML.SD_DECORATION_LABEL:
            this.drawShadowAsDecorationForm(canvas, true);
            break;
        case UML.SD_ICON:
            this.drawShadowAsIconicForm(canvas, false);
            break;
        case UML.SD_ICON_LABEL:
            this.drawShadowAsIconicForm(canvas, true);
            break;
        }
        canvas.restoreState();
        NodeView.prototype.drawShadow.call(this, canvas);
    };

    UMLGeneralNodeView.prototype.drawShadowCommon = function (canvas) {
    };

    UMLGeneralNodeView.prototype.drawShadowAsCanonicalForm = function (canvas, showLabel) {
        canvas.fillRect(
            this.mainRect.x1 + SHADOW_OFFSET,
            this.mainRect.y1 + SHADOW_OFFSET,
            this.mainRect.x2 + SHADOW_OFFSET,
            this.mainRect.y2 + SHADOW_OFFSET
        );
    };

    UMLGeneralNodeView.prototype.drawShadowAsDecorationForm = function (canvas, showLabel) {
        this.drawShadowAsCanonicalForm(canvas);
    };

    UMLGeneralNodeView.prototype.drawShadowAsIconicForm = function (canvas, showLabel) {
        /*
        canvas.fillRect(
            this.iconRect.x1 + SHADOW_OFFSET,
            this.iconRect.y1 + SHADOW_OFFSET,
            this.iconRect.x2 + SHADOW_OFFSET,
            this.iconRect.y2 + SHADOW_OFFSET
        );
        */
    };

    UMLGeneralNodeView.prototype.drawObject = function (canvas) {
        this.drawCommon(canvas);
        switch (this.stereotypeDisplay) {
        case UML.SD_NONE:
            this.drawAsCanonicalForm(canvas, false);
            break;
        case UML.SD_LABEL:
            this.drawAsCanonicalForm(canvas, true);
            break;
        case UML.SD_DECORATION:
            this.drawAsDecorationForm(canvas, false);
            break;
        case UML.SD_DECORATION_LABEL:
            this.drawAsDecorationForm(canvas, true);
            break;
        case UML.SD_ICON:
            this.drawAsIconicForm(canvas, false);
            break;
        case UML.SD_ICON_LABEL:
            this.drawAsIconicForm(canvas, true);
            break;
        }
        NodeView.prototype.drawObject.call(this, canvas);
    };

    UMLGeneralNodeView.prototype.drawCommon = function (canvas) {
        if ((this.stereotypeDisplay !== UML.SD_ICON) && (this.stereotypeDisplay !== UML.SD_ICON_LABEL)) {
            canvas.fillRect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2);
            canvas.rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2);
        }
    };

    UMLGeneralNodeView.prototype.drawAsCanonicalForm = function (canvas, showLabel) {
    };

    UMLGeneralNodeView.prototype.drawAsDecorationForm = function (canvas, showLabel) {
        var r   = new Rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2),
            icon_x = r.x2 - COMPARTMENT_RIGHT_PADDING - DECORATION_ICON_WIDTH,
            icon_y  = r.y1 + COMPARTMENT_TOP_PADDING;
        this.iconRect = this.computeIconRect(new Rect(icon_x, icon_y, icon_x + DECORATION_ICON_WIDTH, icon_y + DECORATION_ICON_HEIGHT), this.iconRatio);
        this.drawDecorationIcon(canvas, this.iconRect);
    };

    UMLGeneralNodeView.prototype.drawAsIconicForm = function (canvas, showLabel) {
        var _iconWidth  = this.iconRect.getWidth(),
            _iconHeight = this.iconRect.getHeight(),
            _x          = (this.left + this.getRight()) / 2;
        this.drawIcon(canvas, new Rect(_x - (_iconWidth / 2), this.top, _x + (_iconWidth / 2), this.top + _iconHeight));
    };


    /**
     * UMLFloatingNodeView
     * @constructor
     * @extends NodeView
     */
    function UMLFloatingNodeView() {
        NodeView.apply(this, arguments);
        this.containerChangeable = false;
        this.containerExtending = false;

        /** @member {NodeLabelView} */
        this.nameLabel = new NodeLabelView();
        this.nameLabel.distance = 20;
        this.nameLabel.alpha = 3 * Math.PI / 4;
        this.addSubView(this.nameLabel);

        /** @member {NodeLabelView} */
        this.stereotypeLabel = new NodeLabelView();
        this.stereotypeLabel.distance = 35;
        this.stereotypeLabel.alpha = 3 * Math.PI / 4;
        this.addSubView(this.stereotypeLabel);

        /** @member {NodeLabelView} */
        this.propertyLabel = new NodeLabelView();
        this.propertyLabel.distance = 20;
        this.propertyLabel.alpha = -3 * Math.PI / 4;
        this.addSubView(this.propertyLabel);

        /** @member {boolean} */
        this.showProperty = true;

    }
    // inherits from LabelView
    UMLFloatingNodeView.prototype = Object.create(NodeView.prototype);
    UMLFloatingNodeView.prototype.constructor = UMLFloatingNodeView;

    UMLFloatingNodeView.prototype.update = function (canvas) {
        NodeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameLabel.text = this.model.name;
            if (this.model.stereotype !== null) {
                this.stereotypeLabel.text = this.model.getStereotypeString();
            }
            // propertyLabel
            this.propertyLabel.text = this.model.getPropertyString();
            this.propertyLabel.visible = (this.showProperty ? this.propertyLabel.text.length > 0 : false);
            // nameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.nameLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.nameLabel, 'model', this.model);
            }
            // stereotypeLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.stereotypeLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.stereotypeLabel, 'model', this.model);
            }
            // propertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.propertyLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.propertyLabel, 'model', this.model);
            }
        }
    };

    /**
     * Compute Junction Point
     *
     * @param {Rect} r
     * @param {Point} p
     * @return {Point}
     */
    UMLFloatingNodeView.prototype._junction2 = function (r, p) {
        var c = new Point();
        c.x = (r.x1 + r.x2) / 2;
        c.y = (r.y1 + r.y2) / 2;
        if ((c.x === p.x) || (c.y === p.y)) {
            return Coord.orthoJunction(r, p);
        }
        var lean = (p.y - c.y) / (p.x - c.x);
        // contact points
        var cp = [];
        cp[0] = new Point(r.x1, Math.round(lean * (r.x1 - c.x) + c.y)); // left
        cp[1] = new Point(r.x2, Math.round(lean * (r.x2 - c.x) + c.y)); // right
        cp[2] = new Point(Math.round((r.y1 - c.y) / lean + c.x), r.y1); // top
        cp[3] = new Point(Math.round((r.y2 - c.y) / lean + c.x), r.y2); // bottom

        var i;
        if (Coord.ptInRect2(p, r)) {
            var idx = 0;
            var md = Math.sqrt(Math.square(cp[0].x - p.x) + Math.square(cp[0].y - p.y));
            for (i = 1; i <= 3; i++) {
                var d = Math.sqrt(Math.square(cp[i].x - p.x) + Math.square(cp[i].y - p.y));
                if (d < md) {
                    md = d;
                    idx = i;
                }
            }
            return cp[idx];
        } else {
            var cpRect = new Rect(c.x, c.y, p.x, p.y);
            Coord.normalizeRect(cpRect);
            c.x = cpRect.x1; c.y = cpRect.y1;
            p.x = cpRect.x2; p.y = cpRect.y2;
            i = -1;
            do {
                i++;
            } while (!(((r.x1 <= cp[i].x) && (cp[i].x <= r.x2) &&
                        (r.y1 <= cp[i].y) && (cp[i].y <= r.y2) &&
                        (c.x <= cp[i].x)  && (cp[i].x <= p.x)  &&
                        (c.y <= cp[i].y)  && (cp[i].y <= p.y)) || (i > 4)));
            if (i > 3) {
                return new Point((r.x1 + r.x2) / 2, (r.y1 + r.y2) / 2);
            } else {
                return cp[i];
            }
        }
    };

    UMLFloatingNodeView.prototype.arrange = function (canvas) {
        this.nameLabel.visible = (this.nameLabel.text.length > 0);
        this.stereotypeLabel.visible = (this.stereotypeLabel.text.length > 0);
        NodeView.prototype.arrange.call(this, canvas);
    };


    /**
     * UMLGeneralEdgeView
     * @constructor
     * @extends EdgeView
     */
    function UMLGeneralEdgeView() {
        EdgeView.apply(this, arguments);

        /** @member {string} */
        this.stereotypeDisplay = UML.SD_LABEL;

        /** @member {boolean} */
        this.showVisibility = true;

        /** @member {boolean} */
        this.showProperty = true;

        /** @member {EdgeLabelView} */
        this.nameLabel = new EdgeLabelView();
        this.nameLabel.hostEdge = this;
        this.nameLabel.edgePosition = Core.EP_MIDDLE;
        this.nameLabel.distance = 15;
        this.nameLabel.alpha = Math.PI / 2;
        this.addSubView(this.nameLabel);

        /** @member {EdgeLabelView} */
        this.stereotypeLabel = new EdgeLabelView();
        this.stereotypeLabel.hostEdge = this;
        this.stereotypeLabel.edgePosition = Core.EP_MIDDLE;
        this.stereotypeLabel.distance = 30;
        this.stereotypeLabel.alpha = Math.PI / 2;
        this.addSubView(this.stereotypeLabel);

        /** @member {EdgeLabelView} */
        this.propertyLabel = new EdgeLabelView();
        this.propertyLabel.hostEdge = this;
        this.propertyLabel.edgePosition = Core.EP_MIDDLE;
        this.propertyLabel.distance = 15;
        this.propertyLabel.alpha = -Math.PI / 2;
        this.addSubView(this.propertyLabel);
    }
    // inherits from EdgeView
    UMLGeneralEdgeView.prototype = Object.create(EdgeView.prototype);
    UMLGeneralEdgeView.prototype.constructor = UMLGeneralEdgeView;

    UMLGeneralEdgeView.prototype.update = function (canvas) {
        if (this.model) {
            // nameLabel
            this.nameLabel.visible = (this.model.name.length > 0);
            if (this.model.name) {
                this.nameLabel.text = this.model.getString(this.showVisibility);
            }
            // stereotypeLabel
            this.stereotypeLabel.visible =
                this.model.stereotype && (this.stereotypeDisplay === UML.SD_LABEL ||
                                          this.stereotypeDisplay === UML.SD_DECORATION_LABEL ||
                                          this.stereotypeDisplay === UML.SD_ICON_LABEL);
            if (this.model.stereotype) {
                this.stereotypeLabel.text = this.model.getStereotypeString();
            }
            // propertyLabel
            this.propertyLabel.text = this.model.getPropertyString();
            this.propertyLabel.visible = (this.showProperty ? this.propertyLabel.text.length > 0 : false);
            // nameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.nameLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.nameLabel, 'model', this.model);
            }
            // stereotypeLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.stereotypeLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.stereotypeLabel, 'model', this.model);
            }
            // propertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.propertyLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.propertyLabel, 'model', this.model);
            }
        }
        EdgeView.prototype.update.call(this, canvas);
    };


    /**
     * UMLClassifierView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLClassifierView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.containerChangeable = true;

        /** @member {boolean} */
        this.suppressAttributes = false;

        /** @member {boolean} */
        this.suppressOperations = false;

        /** @member {boolean} */
        this.suppressReceptions = true;

        /** @member {boolean} */
        this.showMultiplicity = true;

        /** @member {boolean} */
        this.showOperationSignature = true;

        /** @member {UMLAttributeCompartmentView} */
        this.attributeCompartment = new UMLAttributeCompartmentView();
        this.attributeCompartment.parentStyle = true;
        this.addSubView(this.attributeCompartment);

        /** @member {UMLOperationCompartmentView} */
        this.operationCompartment = new UMLOperationCompartmentView();
        this.operationCompartment.parentStyle = true;
        this.addSubView(this.operationCompartment);

        /** @member {UMLReceptionCompartmentView} */
        this.receptionCompartment = new UMLReceptionCompartmentView();
        this.receptionCompartment.parentStyle = true;
        this.addSubView(this.receptionCompartment);

        /** @member {UMLTemplateParameterCompartmentView} */
        this.templateParameterCompartment = new UMLTemplateParameterCompartmentView();
        this.templateParameterCompartment.parentStyle = true;
        this.addSubView(this.templateParameterCompartment);
    }
    // inherits from UMLGeneralNodeView
    UMLClassifierView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLClassifierView.prototype.constructor = UMLClassifierView;

    UMLClassifierView.prototype.getAllCompartments = function () {
        return [
            this.nameCompartment,
            this.attributeCompartment,
            this.operationCompartment,
            this.receptionCompartment
        ];
    };

    UMLClassifierView.prototype.update = function (canvas) {
        // attributeCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.attributeCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.attributeCompartment, 'model', this.model);
        }
        // operationCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.operationCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.operationCompartment, 'model', this.model);
        }
        // receptionCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.receptionCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.receptionCompartment, 'model', this.model);
        }
        // templateParameterCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.templateParameterCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.templateParameterCompartment, 'model', this.model);
        }
        if (this.model) {
            if (this.model.templateParameters && this.model.templateParameters.length > 0) {
                this.templateParameterCompartment.visible = true;
            } else {
                this.templateParameterCompartment.visible = false;
            }
        }
        if ((this.stereotypeDisplay === UML.SD_ICON) || (this.stereotypeDisplay === UML.SD_ICON_LABEL)) {
            this.templateParameterCompartment.visible = false;
        }
        this.attributeCompartment.visible = !this.suppressAttributes;
        this.operationCompartment.visible = !this.suppressOperations;
        this.receptionCompartment.visible = !this.suppressReceptions;
        UMLGeneralNodeView.prototype.update.call(this, canvas);
    };

    UMLClassifierView.prototype.sizeObject = function (canvas) {
        UMLGeneralNodeView.prototype.sizeObject.call(this, canvas);
        if (this.templateParameterCompartment.visible) {
            this.templateParameterCompartment.size(canvas);
            this.templateParameterCompartment.width = this.templateParameterCompartment.minWidth;
            this.templateParameterCompartment.height = this.templateParameterCompartment.minHeight;
            this.minWidth = Math.max(this.minWidth, this.templateParameterCompartment.width) + TEMPLATEPARAMETERCOMPARTMENT_LEFT_MARGIN + TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY;
            this.minHeight = this.minHeight + this.templateParameterCompartment.height - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP;
        }
    };


    UMLClassifierView.prototype.arrangeCommon = function (canvas) {
        UMLGeneralNodeView.prototype.arrangeCommon.call(this, canvas);
        if (this.templateParameterCompartment.visible) {
            this.templateParameterCompartment.left = this.getRight() - this.templateParameterCompartment.width;
            this.templateParameterCompartment.top = this.top;
            this.templateParameterCompartment.arrange(canvas);
            var x1 = this.left,
                y1 = this.top + this.templateParameterCompartment.height - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP,
                x2 = this.getRight() - TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY,
                y2 = this.getBottom();
            this.mainRect.setRect(x1, y1, x2, y2);
        }
    };

    UMLClassifierView.prototype.drawObject = function (canvas) {
        UMLGeneralNodeView.prototype.drawObject.call(this, canvas);
        if (this.attributeCompartment.visible) {
            canvas.line(
                this.attributeCompartment.left,
                this.attributeCompartment.top,
                this.attributeCompartment.getRight(),
                this.attributeCompartment.top);
        }
        if (this.operationCompartment.visible) {
            canvas.line(
                this.operationCompartment.left,
                this.operationCompartment.top,
                this.operationCompartment.getRight(),
                this.operationCompartment.top);
        }
        if (this.receptionCompartment.visible) {
            canvas.line(
                this.receptionCompartment.left,
                this.receptionCompartment.top,
                this.receptionCompartment.getRight(),
                this.receptionCompartment.top);
        }
    };


    /**
     * UMLUndirectedRelationshipView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLUndirectedRelationshipView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_FLAT;
        this.lineMode = Core.LM_SOLID;

        /** @member {boolean} */
        this.showMultiplicity = true;

        /** @member {boolean} */
        this.showType = true;

        /** @member {EdgeLabelView} */
        this.tailRoleNameLabel = new EdgeLabelView();
        this.tailRoleNameLabel.hostEdge = this;
        this.tailRoleNameLabel.edgePosition = Core.EP_TAIL;
        this.tailRoleNameLabel.alpha = Math.PI / 6;
        this.tailRoleNameLabel.distance = 30;
        this.addSubView(this.tailRoleNameLabel);

        /** @member {EdgeLabelView} */
        this.tailPropertyLabel = new EdgeLabelView();
        this.tailPropertyLabel.hostEdge = this;
        this.tailPropertyLabel.edgePosition = Core.EP_TAIL;
        this.tailPropertyLabel.alpha = Math.PI / 4;
        this.tailPropertyLabel.distance = 40;
        this.addSubView(this.tailPropertyLabel);

        /** @member {EdgeLabelView} */
        this.tailMultiplicityLabel = new EdgeLabelView();
        this.tailMultiplicityLabel.hostEdge = this;
        this.tailMultiplicityLabel.edgePosition = Core.EP_TAIL;
        this.tailMultiplicityLabel.alpha = -Math.PI / 6;
        this.tailMultiplicityLabel.distance = 25;
        this.addSubView(this.tailMultiplicityLabel);

        /** @member {EdgeLabelView} */
        this.headRoleNameLabel = new EdgeLabelView();
        this.headRoleNameLabel.hostEdge = this;
        this.headRoleNameLabel.edgePosition = Core.EP_HEAD;
        this.headRoleNameLabel.alpha = -Math.PI / 6;
        this.headRoleNameLabel.distance = 30;
        this.addSubView(this.headRoleNameLabel);

        /** @member {EdgeLabelView} */
        this.headPropertyLabel = new EdgeLabelView();
        this.headPropertyLabel.hostEdge = this;
        this.headPropertyLabel.edgePosition = Core.EP_HEAD;
        this.headPropertyLabel.alpha = -Math.PI / 4;
        this.headPropertyLabel.distance = 40;
        this.addSubView(this.headPropertyLabel);

        /** @member {EdgeLabelView} */
        this.headMultiplicityLabel = new EdgeLabelView();
        this.headMultiplicityLabel.hostEdge = this;
        this.headMultiplicityLabel.edgePosition = Core.EP_HEAD;
        this.headMultiplicityLabel.alpha = Math.PI / 6;
        this.headMultiplicityLabel.distance = 25;
        this.addSubView(this.headMultiplicityLabel);
    }
    // inherits from UMLGeneralEdgeView
    UMLUndirectedRelationshipView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLUndirectedRelationshipView.prototype.constructor = UMLUndirectedRelationshipView;

    UMLUndirectedRelationshipView.prototype.update = function (canvas) {
        if (this.model) {
            // RoleName Labels
            this.tailRoleNameLabel.visible = (this.model.end1.name.length > 0);
            if (this.model.end1.name) {
                this.tailRoleNameLabel.text = this.model.end1.getString(this.showVisibility);
            }
            this.headRoleNameLabel.visible = (this.model.end2.name.length > 0);
            if (this.model.end2.name) {
                this.headRoleNameLabel.text = this.model.end2.getString(this.showVisibility);
            }
            // isDerived
            if (this.model.end1.isDerived === true) {
                this.tailRoleNameLabel.text = "/ " + this.tailRoleNameLabel.text;
            }
            if (this.model.end2.isDerived === true) {
                this.headRoleNameLabel.text = "/ " + this.headRoleNameLabel.text;
            }

            // Property Labels
            this.tailPropertyLabel.text = this.model.end1.getPropertyString();
            this.headPropertyLabel.text = this.model.end2.getPropertyString();
            this.tailPropertyLabel.visible = (this.showProperty ? this.tailPropertyLabel.text.length > 0 : false);
            this.headPropertyLabel.visible = (this.showProperty ? this.headPropertyLabel.text.length > 0 : false);

            // Multiplicity Labels
            this.tailMultiplicityLabel.visible = (this.showMultiplicity && this.model.end1.multiplicity.length > 0);
            if (this.model.end1.multiplicity) {
                this.tailMultiplicityLabel.text = this.model.end1.multiplicity;
            }
            this.headMultiplicityLabel.visible = (this.showMultiplicity && this.model.end2.multiplicity.length > 0);
            if (this.model.end2.multiplicity) {
                this.headMultiplicityLabel.text = this.model.end2.multiplicity;
            }
            // Set End Styles
            var tailNavigable = this.model.end1.navigable;
            var headNavigable = this.model.end2.navigable;
            if (tailNavigable && !headNavigable) {
                this.tailEndStyle = Core.ES_STICK_ARROW;
                this.headEndStyle = Core.ES_FLAT;
                switch (this.model.end1.aggregation) {
                case UML.AK_SHARED:
                    this.tailEndStyle = Core.ES_ARROW_DIAMOND;
                    break;
                case UML.AK_COMPOSITE:
                    this.tailEndStyle = Core.ES_ARROW_FILLED_DIAMOND;
                    break;
                }
                switch (this.model.end2.aggregation) {
                case UML.AK_SHARED:
                    this.headEndStyle = Core.ES_DIAMOND;
                    break;
                case UML.AK_COMPOSITE:
                    this.headEndStyle = Core.ES_FILLED_DIAMOND;
                    break;
                }
            } else if (!tailNavigable && headNavigable) {
                this.tailEndStyle = Core.ES_FLAT;
                this.headEndStyle = Core.ES_STICK_ARROW;
                switch (this.model.end1.aggregation) {
                case UML.AK_SHARED:
                    this.tailEndStyle = Core.ES_DIAMOND;
                    break;
                case UML.AK_COMPOSITE:
                    this.tailEndStyle = Core.ES_FILLED_DIAMOND;
                    break;
                }
                switch (this.model.end2.aggregation) {
                case UML.AK_SHARED:
                    this.headEndStyle = Core.ES_ARROW_DIAMOND;
                    break;
                case UML.AK_COMPOSITE:
                    this.headEndStyle = Core.ES_ARROW_FILLED_DIAMOND;
                    break;
                }
            } else {
                this.tailEndStyle = Core.ES_FLAT;
                this.headEndStyle = Core.ES_FLAT;
                switch (this.model.end1.aggregation) {
                case UML.AK_SHARED:
                    this.tailEndStyle = Core.ES_DIAMOND;
                    break;
                case UML.AK_COMPOSITE:
                    this.tailEndStyle = Core.ES_FILLED_DIAMOND;
                    break;
                }
                switch (this.model.end2.aggregation) {
                case UML.AK_SHARED:
                    this.headEndStyle = Core.ES_DIAMOND;
                    break;
                case UML.AK_COMPOSITE:
                    this.headEndStyle = Core.ES_FILLED_DIAMOND;
                    break;
                }
            }
            // tailRoleNameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.tailRoleNameLabel.model !== this.model.end1) {
                Repository.bypassFieldAssign(this.tailRoleNameLabel, 'model', this.model.end1);
            }
            // tailPropertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.tailPropertyLabel.model !== this.model.end1) {
                Repository.bypassFieldAssign(this.tailPropertyLabel, 'model', this.model.end1);
            }
            // tailMultiplicityLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.tailMultiplicityLabel.model !== this.model.end1) {
                Repository.bypassFieldAssign(this.tailMultiplicityLabel, 'model', this.model.end1);
            }
            // headRoleNameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.headRoleNameLabel.model !== this.model.end1) {
                Repository.bypassFieldAssign(this.headRoleNameLabel, 'model', this.model.end2);
            }
            // headPropertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.headPropertyLabel.model !== this.model.end1) {
                Repository.bypassFieldAssign(this.headPropertyLabel, 'model', this.model.end2);
            }
            // headMultiplicityLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.headMultiplicityLabel.model !== this.model.end1) {
                Repository.bypassFieldAssign(this.headMultiplicityLabel, 'model', this.model.end2);
            }
        }
        UMLGeneralEdgeView.prototype.update.call(this, canvas);
    };

    /**************************************************************************
     *                                                                        *
     *                            CLASS DIAGRAM VIEWS                         *
     *                                                                        *
     *************************************************************************/

    /**
     * UMLClassDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLClassDiagram() {
        UMLDiagram.apply(this, arguments);
    }
    // inherits from UMLDiagram
    UMLClassDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLClassDiagram.prototype.constructor = UMLClassDiagram;

    UMLClassDiagram.prototype.canAcceptModel = function (model) {
        return (model instanceof type.Hyperlink) ||
               (model instanceof type.Diagram) ||
               (model instanceof type.UMLConstraint) ||
               (model instanceof type.UMLPackage) ||
               (model instanceof type.UMLClassifier) ||
               (model instanceof type.UMLInstance) ||
               (model instanceof type.UMLPort) ||
               (model instanceof type.UMLAttribute) ||
               (model instanceof type.UMLGeneralization) ||
               (model instanceof type.UMLDependency) ||
               (model instanceof type.UMLInterfaceRealization) ||
               (model instanceof type.UMLComponentRealization) ||
               (model instanceof type.UMLAssociation) ||
               (model instanceof type.UMLLink) ||
               (model instanceof type.UMLConnector);
    };


    /**
     * UMLClassView
     * @constructor
     * @extends UMLClassifierView
     */
    function UMLClassView() {
        UMLClassifierView.apply(this, arguments);
        this.fillColor  = PreferenceManager.get("uml.class.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.stereotypeDisplay  = PreferenceManager.get("uml.class.stereotypeDisplay", UML.SD_LABEL);
        this.suppressAttributes = PreferenceManager.get("uml.class.suppressAttributes", false);
        this.suppressOperations = PreferenceManager.get("uml.class.suppressOperations", false);
    }
    // inherits from UMLClassifierView
    UMLClassView.prototype = Object.create(UMLClassifierView.prototype);
    UMLClassView.prototype.constructor = UMLClassView;

    UMLClassView.prototype.drawCommon = function (canvas) {
        UMLClassifierView.prototype.drawCommon.call(this, canvas);
        if (this.model && this.model.isActive) {
            canvas.line(this.mainRect.x1 + CLASS_ACTIVE_VERTLINE_WIDTH, this.mainRect.y1, this.mainRect.x1 + CLASS_ACTIVE_VERTLINE_WIDTH, this.mainRect.y2);
            canvas.line(this.mainRect.x2 - CLASS_ACTIVE_VERTLINE_WIDTH, this.mainRect.y1, this.mainRect.x2 - CLASS_ACTIVE_VERTLINE_WIDTH, this.mainRect.y2);
        }
    };


    /**
     * UMLInterfaceView
     * @constructor
     * @extends UMLClassifierView
     */
    function UMLInterfaceView() {
        UMLClassifierView.apply(this, arguments);

        /** temporal */
        this.depViews = null;
        this.relViews = null;

        this.fillColor  = PreferenceManager.get("uml.interface.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.stereotypeDisplay  = PreferenceManager.get("uml.interface.stereotypeDisplay", UML.SD_ICON);
        this.suppressAttributes = PreferenceManager.get("uml.interface.suppressAttributes", true);
        this.suppressOperations = PreferenceManager.get("uml.interface.suppressOperations", true);
    }
    // inherits from UMLClassifierView
    UMLInterfaceView.prototype = Object.create(UMLClassifierView.prototype);
    UMLInterfaceView.prototype.constructor = UMLInterfaceView;

    UMLInterfaceView.prototype.collectSupplierDependencyViews = function () {
        var views = [];
        for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
            var v = this.getDiagram().ownedViews[i];
            if ((v instanceof UMLDependencyView) && (v.head === this)) {
                views.push(v);
            }
        }
        return views;
    };

    UMLInterfaceView.prototype.collectSupplierRealizationViews = function () {
        var views = [];
        for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
            var v = this.getDiagram().ownedViews[i];
            if ((v instanceof UMLInterfaceRealizationView) && (v.head === this)) {
                views.push(v);
            }
        }
        return views;
    };

    UMLInterfaceView.prototype.getStereotypeLabelText = function () {
        return "«interface»";
    };

    UMLInterfaceView.prototype.update = function (canvas) {
        UMLClassifierView.prototype.update.call(this, canvas);
    };

    UMLInterfaceView.prototype.arrangeCommon = function (canvas) {
        this.depViews = this.collectSupplierDependencyViews();
        this.relViews = this.collectSupplierRealizationViews();
        UMLClassifierView.prototype.arrangeCommon.call(this, canvas);
    };

    UMLInterfaceView.prototype.drawShadowAsIconicForm = function (canvas) {
        if ((this.relViews.length > 0) || (this.depViews.length === 0)) {
            canvas.fillEllipse(
                this.iconRect.x1 + SHADOW_OFFSET,
                this.iconRect.y1 + SHADOW_OFFSET,
                this.iconRect.x2 + SHADOW_OFFSET,
                this.iconRect.y2 + SHADOW_OFFSET
            );
        }
    };

    UMLInterfaceView.prototype.drawIcon = function (canvas, rect) {
        if ((this.depViews.length > 0) && (this.relViews.length > 0)) {
            this.drawBallAndSocketNotation(canvas, rect, this.depViews);
        } else if (this.depViews.length > 0) {
            this.drawSocketNotation(canvas, rect, this.depViews);
        } else {
            this.drawBallNotation(canvas, rect);
        }
    };

    UMLInterfaceView.prototype.drawDecorationIcon = function (canvas, rect) {
        this.drawBallNotation(canvas, new Rect(rect.x1 + 3, rect.y1 + 3, rect.x2 - 3, rect.y2 - 3));
    };

    UMLInterfaceView.prototype.drawBallNotation = function (canvas, rect) {
        canvas.fillEllipse(rect.x1, rect.y1, rect.x2, rect.y2);
        canvas.ellipse(rect.x1, rect.y1, rect.x2, rect.y2);
    };

    UMLInterfaceView.prototype.drawSocketNotation = function (canvas, rect, supplierDependencyViews) {
        var i, len, v, c = Coord.getCenter(rect);
        for (i = 0, len = supplierDependencyViews.length; i < len; i++) {
            v = supplierDependencyViews[i];
            v.arrange(canvas);
            var b      = Coord.junction(rect, v.points.getPoint(v.points.count() - 1)),
                theta  = Coord.getAngle(c.x, c.y, b.x, b.y),
                radius = Math.min(rect.getWidth() / 2, rect.getHeight() / 2);
            canvas.arc(c.x, c.y, radius, theta - Math.PI / 2, theta + Math.PI / 2, false);
        }
    };

    UMLInterfaceView.prototype.drawBallAndSocketNotation = function (canvas, rect, supplierDependencyViews) {
        this.drawSocketNotation(canvas, rect, supplierDependencyViews);
        var r = new Rect(rect.x1 + 3, rect.y1 + 3, rect.x2 - 3, rect.y2 - 3);
        this.drawBallNotation(canvas, r);
    };


    /**
     * UMLSignalView
     * @constructor
     * @extends UMLClassifierView
     */
    function UMLSignalView() {
        UMLClassifierView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("uml.signal.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLClassifierView
    UMLSignalView.prototype = Object.create(UMLClassifierView.prototype);
    UMLSignalView.prototype.constructor = UMLSignalView;

    UMLSignalView.prototype.getStereotypeLabelText = function () {
        return "«signal»";
    };


    /**
     * UMLDataTypeView
     * @constructor
     * @extends UMLClassifierView
     */
    function UMLDataTypeView() {
        UMLClassifierView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("uml.datatype.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.suppressAttributes = true;
        this.suppressOperations = true;
    }
    // inherits from UMLClassifierView
    UMLDataTypeView.prototype = Object.create(UMLClassifierView.prototype);
    UMLDataTypeView.prototype.constructor = UMLDataTypeView;

    UMLDataTypeView.prototype.getStereotypeLabelText = function () {
        return "«dataType»";
    };


    /**
     * UMLPrimitiveTypeView
     * @constructor
     * @extends UMLClassifierView
     */
    function UMLPrimitiveTypeView() {
        UMLClassifierView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("uml.datatype.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.suppressAttributes = true;
        this.suppressOperations = true;
    }
    // inherits from UMLClassifierView
    UMLPrimitiveTypeView.prototype = Object.create(UMLClassifierView.prototype);
    UMLPrimitiveTypeView.prototype.constructor = UMLPrimitiveTypeView;

    UMLPrimitiveTypeView.prototype.getStereotypeLabelText = function () {
        return "«primitiveType»";
    };


    /**
     * UMLEnumerationLiteralView
     * @constructor
     * @extends LabelView
     */
    function UMLEnumerationLiteralView() {
        LabelView.apply(this, arguments);
        this.selectable = Core.SK_YES;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_NONE;
        this.parentStyle = true;
        this.horizontalAlignment = Graphics.AL_LEFT;
    }
    // inherits from LabelView
    UMLEnumerationLiteralView.prototype = Object.create(LabelView.prototype);
    UMLEnumerationLiteralView.prototype.constructor = UMLEnumerationLiteralView;

    UMLEnumerationLiteralView.prototype.update = function (canvas) {
        var options = {
            showVisibility    : true,
            stereotypeDisplay : UML.SD_LABEL,
            showProperty      : true
        };
        if (this._parent && (this._parent._parent instanceof UMLClassifierView)) {
            options.showVisibility    = this._parent._parent.showVisibility;
            options.stereotypeDisplay = this._parent._parent.stereotypeDisplay;
            options.showProperty      = this._parent._parent.showProperty;
        }
        if (this._parent) {
            this.visible = this._parent.visible;
        }
        if (this.model) {
            this.text = this.model.getString(options);
        }
        LabelView.prototype.update.call(this, canvas);
    };

    UMLEnumerationLiteralView.prototype.size = function (canvas) {
        LabelView.prototype.size.call(this, canvas);
        this.height = this.minHeight;
    };


    /**
     * UMLEnumerationLiteralCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLEnumerationLiteralCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
    }
    // inherits from UMLCompartmentView
    UMLEnumerationLiteralCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLEnumerationLiteralCompartmentView.prototype.constructor = UMLEnumerationLiteralCompartmentView;

    UMLEnumerationLiteralCompartmentView.prototype.update = function (canvas) {
        if (this.model.literals) {
            var tempViews = this.subViews;
            this.subViews = [];
            for (var i = 0, len = this.model.literals.length; i < len; i++) {
                var literal = this.model.literals[i];
                var literalView = _.find(tempViews, function (v) { return v.model === literal; });
                if (!literalView) {
                    literalView = new UMLEnumerationLiteralView();
                    literalView.model = literal;
                    literalView._parent = this;
                    literalView._parent = this;
                    // literalView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                    Repository.bypassInsert(this, 'subViews', literalView);
                } else {
                    this.addSubView(literalView);
                }
                literalView.setup(canvas);
            }
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };


    /**
     * UMLEnumerationView
     * @constructor
     * @extends UMLClassifierView
     */
    function UMLEnumerationView() {
        UMLClassifierView.apply(this, arguments);

        /** @member {boolean} */
        this.suppressLiterals = false;

        /** @member {UMLEnumerationLiteralCompartmentView} */
        this.enumerationLiteralCompartment = new UMLEnumerationLiteralCompartmentView();
        this.enumerationLiteralCompartment.parentStyle = true;
        this.addSubView(this.enumerationLiteralCompartment);

        this.fillColor  = PreferenceManager.get("uml.enumeration.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.stereotypeDisplay  = PreferenceManager.get("uml.enumeration.stereotypeDisplay", UML.SD_LABEL);
        this.suppressAttributes = PreferenceManager.get("uml.enumeration.suppressAttributes", true);
        this.suppressOperations = PreferenceManager.get("uml.enumeration.suppressOperations", true);
        this.suppressLiterals   = PreferenceManager.get("uml.enumeration.suppressLiterals", false);
    }
    // inherits from UMLClassifierView
    UMLEnumerationView.prototype = Object.create(UMLClassifierView.prototype);
    UMLEnumerationView.prototype.constructor = UMLEnumerationView;

    UMLEnumerationView.prototype.getAllCompartments = function () {
        return [
            this.nameCompartment,
            this.enumerationLiteralCompartment,
            this.attributeCompartment,
            this.operationCompartment
        ];
    };

    UMLEnumerationView.prototype.getStereotypeLabelText = function () {
        return "«enumeration»";
    };

    UMLEnumerationView.prototype.update = function (canvas) {
        // enumerationLiteralCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.enumerationLiteralCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.enumerationLiteralCompartment, 'model', this.model);
        }
        this.enumerationLiteralCompartment.visible = !this.suppressLiterals;
        UMLClassifierView.prototype.update.call(this, canvas);
    };

    UMLEnumerationView.prototype.drawObject = function (canvas) {
        UMLClassifierView.prototype.drawObject.call(this, canvas);
        if (this.enumerationLiteralCompartment.visible) {
            canvas.line(
                this.enumerationLiteralCompartment.left,
                this.enumerationLiteralCompartment.top,
                this.enumerationLiteralCompartment.getRight(),
                this.enumerationLiteralCompartment.top);
        }
    };


    /**
     * UMLGeneralizationView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLGeneralizationView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_TRIANGLE;
        this.lineMode = Core.LM_SOLID;
    }
    // inherits from UMLGeneralEdgeView
    UMLGeneralizationView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLGeneralizationView.prototype.constructor = UMLGeneralizationView;

    UMLGeneralizationView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLClassifier);
    };

    /**
     * UMLDependencyView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLDependencyView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_STICK_ARROW;
        this.lineMode = Core.LM_DOT;
    }
    // inherits from UMLGeneralEdgeView
    UMLDependencyView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLDependencyView.prototype.constructor = UMLDependencyView;

    UMLDependencyView.prototype.arrangeObject = function (canvas) {
        UMLGeneralEdgeView.prototype.arrangeObject.call(this, canvas);
        this.lineMode = Core.LM_DOT;
        this.headEndStyle = Core.ES_STICK_ARROW;
        if (this.head instanceof UMLInterfaceView) {
            var v = this.head;
            if ((v.stereotypeDisplay === UML.SD_ICON) || (v.stereotypeDisplay === UML.SD_ICON_LABEL)) {
                this.lineMode = Core.LM_SOLID;
                this.headEndStyle = Core.ES_FLAT;
                var c = this.points.count();
                var p = Coord.junction(v.iconRect, this.points.getPoint(c - 1));
                this.points.setPoint(c - 1, p);
                if ((this.lineStyle === Core.LS_RECTILINEAR || this.lineStyle === Core.LS_ROUNDRECT) && (c >= 2)) {
                    var p2 = this.points.getPoint(c - 2);
                    if (Math.abs(p2.x - p.x) > Math.abs(p2.y - p.y)) {
                        p2.y = p.y;
                    } else {
                        p2.x = p.x;
                    }
                    this.points.setPoint(c - 2, p2);
                }
            }
        }
    };

    UMLDependencyView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLModelElement);
    };

    /**
     * UMLRealizationView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLRealizationView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_TRIANGLE;
        this.lineMode = Core.LM_DOT;
    }
    // inherits from UMLGeneralEdgeView
    UMLRealizationView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLRealizationView.prototype.constructor = UMLRealizationView;

    /**
     * UMLInterfaceRealizationView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLInterfaceRealizationView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_TRIANGLE;
        this.lineMode = Core.LM_DOT;
    }
    // inherits from UMLGeneralEdgeView
    UMLInterfaceRealizationView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLInterfaceRealizationView.prototype.constructor = UMLInterfaceRealizationView;

    UMLInterfaceRealizationView.prototype.arrangeObject = function (canvas) {
        UMLGeneralEdgeView.prototype.arrangeObject.call(this, canvas);
        this.lineMode = Core.LM_DOT;
        this.headEndStyle = Core.ES_TRIANGLE;
        if (this.head instanceof UMLInterfaceView) {
            var v = this.head;
            if ((v.stereotypeDisplay === UML.SD_ICON) || (v.stereotypeDisplay === UML.SD_ICON_LABEL)) {
                this.lineMode = Core.LM_SOLID;
                this.headEndStyle = Core.ES_FLAT;
                var c = this.points.count();
                var p = Coord.junction(v.iconRect, this.points.getPoint(c - 1));
                this.points.setPoint(c - 1, p);
                if ((this.lineStyle === Core.LS_RECTILINEAR || this.lineStyle === Core.LS_ROUNDRECT) && (c >= 2)) {
                    var p2 = this.points.getPoint(c - 2);
                    if (Math.abs(p2.x - p.x) > Math.abs(p2.y - p.y)) {
                        p2.y = p.y;
                    } else {
                        p2.x = p.x;
                    }
                    this.points.setPoint(c - 2, p2);
                }
            }
        }
    };

    UMLInterfaceRealizationView.prototype.canConnectTo = function (view, isTail) {
        return (isTail && view.model instanceof type.UMLClassifier) ||
               (!isTail && view.model instanceof type.UMLInterface);
    };

    /**
     * UMLQualifierCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLQualifierCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
    }
    // inherits from UMLCompartmentView
    UMLQualifierCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLQualifierCompartmentView.prototype.constructor = UMLQualifierCompartmentView;

    UMLQualifierCompartmentView.prototype.update = function (canvas) {
        if (this.model.qualifiers) {
            var tempViews = this.subViews;
            this.subViews = [];
            for (var i = 0, len = this.model.qualifiers.length; i < len; i++) {
                var attr = this.model.qualifiers[i];
                var attrView = _.find(tempViews, function (v) { return v.model == attr; });
                if (!attrView) {
                    attrView = new UMLAttributeView();
                    attrView.model = attr;
                    attrView._parent = this;
                    // attrView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                    Repository.bypassInsert(this, 'subViews', attrView);
                } else {
                    this.addSubView(attrView);
                }
            }
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };

    UMLQualifierCompartmentView.prototype.drawShadow = function (canvas) {
        canvas.storeState();
        canvas.alpha = SHADOW_ALPHA;
        canvas.fillColor = SHADOW_COLOR;
        canvas.fillRect(
            this.left + SHADOW_OFFSET,
            this.top + SHADOW_OFFSET,
            this.getRight() + SHADOW_OFFSET,
            this.getBottom() + SHADOW_OFFSET
        );
        canvas.restoreState();
    };

    UMLQualifierCompartmentView.prototype.drawObject = function (canvas) {
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
    };


    /**
     * UMLAssociationView
     * @constructor
     * @extends UMLUndirectedRelationshipView
     */
    function UMLAssociationView() {
        UMLUndirectedRelationshipView.apply(this, arguments);

        /** @member {} */
        this.tailQualifiersCompartment = new UMLQualifierCompartmentView();
        this.addSubView(this.tailQualifiersCompartment);

        /** @member {} */
        this.headQualifiersCompartment = new UMLQualifierCompartmentView();
        this.addSubView(this.headQualifiersCompartment);
    }
    // inherits from UMLUndirectedRelationshipView
    UMLAssociationView.prototype = Object.create(UMLUndirectedRelationshipView.prototype);
    UMLAssociationView.prototype.constructor = UMLAssociationView;

    UMLAssociationView.prototype.update = function (canvas) {
        if (this.model) {
            this.tailQualifiersCompartment.visible = this.model.end1.qualifiers.length > 0;
            this.headQualifiersCompartment.visible = this.model.end2.qualifiers.length > 0;
            // tailQualifiersCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.tailQualifiersCompartment.model !== this.model.end1) {
                Repository.bypassFieldAssign(this.tailQualifiersCompartment, 'model', this.model.end1);
            }
            // headQualifiersCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.headQualifiersCompartment.model !== this.model.end2) {
                Repository.bypassFieldAssign(this.headQualifiersCompartment, 'model', this.model.end2);
            }
        }
        UMLUndirectedRelationshipView.prototype.update.call(this, canvas);
    };

    UMLAssociationView.prototype.sizeObject = function (canvas) {
        UMLUndirectedRelationshipView.prototype.sizeObject.call(this, canvas);
        this.tailQualifiersCompartment.sizeObject(canvas);
        this.headQualifiersCompartment.sizeObject(canvas);
    };

    UMLAssociationView.prototype.arrangeQualifierCompartment = function (canvas, qv, isTail) {
        var jp, nv, p1, pn;
        if (isTail) {
            nv = this.tail;
            p1 = this.points.getPoint(1);
            jp = 0;
        } else {
            nv = this.head;
            p1 = this.points.getPoint(this.points.count() - 2);
            jp = this.points.count() - 1;
        }
        if (qv.visible) {
            qv.width = qv.minWidth;
            qv.height = qv.minHeight;
            pn = Coord.junction(nv.getBoundingBox(canvas), p1);
            var dx = Math.abs(p1.x - pn.x),
                dy = Math.abs(p1.y - pn.y);
            if ((pn.x <= p1.x) && (dx >= dy)) {
                qv.left = nv.getRight();
                qv.top = pn.y - qv.height / 2;
            } else if ((pn.y >= p1.y) && (dy > dx)) {
                qv.left = pn.x - qv.width / 2;
                qv.top = nv.top - qv.height + 1;
            } else if ((pn.x > p1.x) && (dx >= dy)) {
                qv.left = nv.left - qv.width + 1;
                qv.top = pn.y - qv.height / 2;
            } else if ((pn.y < p1.y) && (dy > dx)) {
                qv.left = pn.x - qv.width / 2;
                qv.top = nv.getBottom();
            }
            var p = Coord.junction(qv.getBoundingBox(canvas), p1);
            this.points.setPoint(jp, p);
        }
    };

    UMLAssociationView.prototype.arrange = function (canvas) {
        this.recalcPoints(canvas);
        this.arrangeQualifierCompartment(canvas, this.tailQualifiersCompartment, true);
        this.arrangeQualifierCompartment(canvas, this.headQualifiersCompartment, false);
        UMLUndirectedRelationshipView.prototype.arrange.call(this, canvas);
        var t = null, h = null;
        if (this.tailQualifiersCompartment.visible) {
            t = this.tail;
            this.tail = this.tailQualifiersCompartment;
        }
        if (this.headQualifiersCompartment.visible) {
            h = this.head;
            this.head = this.headQualifiersCompartment;
        }
        this.recalcPoints(canvas);
        if (this.tailQualifiersCompartment.visible) {
            this.tail = t;
        }
        if (this.headQualifiersCompartment.visible) {
            this.head = h;
        }
    };

    UMLAssociationView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLClassifier);
    };

    /**
     * UMLAssociationClassLinkView
     * @constructor
     * @extends EdgeView
     */
    function UMLAssociationClassLinkView() {
        EdgeView.apply(this, arguments);
        this.lineMode = Core.LM_DOT;
    }
    // inherits from EdgeView
    UMLAssociationClassLinkView.prototype = Object.create(EdgeView.prototype);
    UMLAssociationClassLinkView.prototype.constructor = UMLAssociationClassLinkView;

    UMLAssociationClassLinkView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLClass || view.model instanceof type.UMLAssociation);
    };

    /**************************************************************************
     *                                                                        *
     *                        PACKAGE DIAGRAM VIEWS                           *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLPackageDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLPackageDiagram() {
        UMLDiagram.apply(this, arguments);
    }
    // inherits from UMLDiagram
    UMLPackageDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLPackageDiagram.prototype.constructor = UMLPackageDiagram;

    UMLPackageDiagram.prototype.canAcceptModel = function (model) {
        return (model instanceof type.Hyperlink) ||
               (model instanceof type.Diagram) ||
               (model instanceof type.UMLConstraint) ||
               (model instanceof type.UMLPackage) ||
               (model instanceof type.UMLSubsystem) ||
               (model instanceof type.UMLDependency);
    };


    /**
     * UMLPackageView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLPackageView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.containerChangeable = true;
        this.fillColor = PreferenceManager.get("uml.package.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLPackageView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLPackageView.prototype.constructor = UMLPackageView;

    UMLPackageView.prototype.canContainViewKind = function (kind) {
        return MetaModelManager.isKindOf(kind, "UMLClassifierView") ||
               MetaModelManager.isKindOf(kind, "UMLPackageView") ||
               MetaModelManager.isKindOf(kind, "UMLObjectView") ||
               MetaModelManager.isKindOf(kind, "UMLArtifactInstanceView") ||
               MetaModelManager.isKindOf(kind, "UMLComponentInstanceView") ||
               MetaModelManager.isKindOf(kind, "UMLNodeInstanceView");
    };

    UMLPackageView.prototype.update = function (canvas) {
        UMLGeneralNodeView.prototype.update.call(this, canvas);
    };

    UMLPackageView.prototype.sizeObject = function (canvas) {
        UMLGeneralNodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = Math.max(this.minWidth, PACKAGE_MINWIDTH);
        this.minHeight = Math.max(PACKAGE_TAB_HEIGHT + this.minHeight, PACKAGE_MINHEIGHT);
    };

    UMLPackageView.prototype.arrangeCommon = function (canvas) {
        UMLGeneralNodeView.prototype.arrangeCommon.call(this, canvas);
        if ((this.stereotypeDisplay !== UML.SD_ICON) && (this.stereotypeDisplay !== UML.SD_ICON_LABEL)) {
            this.mainRect.setRect(this.left, this.top + PACKAGE_TAB_HEIGHT, this.getRight(), this.getBottom());
        }
    };

    UMLPackageView.prototype.drawShadowAsCanonicalForm = function (canvas, showLabel) {
        var tabRightX = this.left + (this.getRight() - this.left) * 2 / 5,
            tabBottomY = this.top + PACKAGE_TAB_HEIGHT;
        canvas.fillRect(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET, tabRightX + SHADOW_OFFSET, tabBottomY + SHADOW_OFFSET);
        canvas.fillRect(this.left + SHADOW_OFFSET, tabBottomY - 1 + SHADOW_OFFSET, this.getRight() + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET);
    };

    UMLPackageView.prototype.drawAsCanonicalForm = function (canvas, showLabel) {
        var tabRightX = this.left + (this.getRight() - this.left) * 2 / 5,
            tabBottomY = this.top + PACKAGE_TAB_HEIGHT;
        canvas.fillRect(this.left, this.top, tabRightX, tabBottomY);
        canvas.rect(this.left, this.top, tabRightX, tabBottomY);
        canvas.fillRect(this.left, tabBottomY - 1, this.getRight(), this.getBottom());
        canvas.rect(this.left, tabBottomY - 1, this.getRight(), this.getBottom());
        UMLGeneralNodeView.prototype.drawAsCanonicalForm.call(this, canvas, showLabel);
    };

    UMLPackageView.prototype.drawAsDecorationForm = function (canvas, showLabel) {
        this.drawAsCanonicalForm(canvas, showLabel);
        UMLGeneralNodeView.prototype.drawAsDecorationForm.call(this, canvas, showLabel);
    };


    /**
     * UMLModelView
     * @constructor
     * @extends UMLPackageView
     */
    function UMLModelView() {
        UMLPackageView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("uml.model.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLPackageView
    UMLModelView.prototype = Object.create(UMLPackageView.prototype);
    UMLModelView.prototype.constructor = UMLModelView;

    UMLModelView.prototype.drawAsCanonicalForm = function (canvas, showLabel) {
        UMLPackageView.prototype.drawAsCanonicalForm.call(this, canvas, showLabel);
        var tabRightX = this.left + (this.getRight() - this.left) * 2 / 5;
        canvas.polyline([new Point(tabRightX - 9, this.top + 3), new Point(tabRightX - 15, this.top + 10), new Point(tabRightX - 3, this.top + 10), new Point(tabRightX - 9, this.top + 3)]);
    };


    /**
     * UMLSubsystemView
     * @constructor
     * @extends UMLPackageView
     */
    function UMLSubsystemView() {
        UMLPackageView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("uml.subsystem.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLPackageView
    UMLSubsystemView.prototype = Object.create(UMLPackageView.prototype);
    UMLSubsystemView.prototype.constructor = UMLSubsystemView;

    UMLSubsystemView.prototype.drawAsCanonicalForm = function (canvas, showLabel) {
        UMLPackageView.prototype.drawAsCanonicalForm.call(this, canvas, showLabel);
        var tabRightX = this.left + (this.getRight() - this.left) * 2 / 5;
        canvas.polyline([new Point(tabRightX - 8, this.top + 3), new Point(tabRightX - 8, this.top + 7)]);
        canvas.polyline([new Point(tabRightX - 11, this.top + 11), new Point(tabRightX - 11, this.top + 7), new Point(tabRightX - 5, this.top + 7)]);
        canvas.polyline([new Point(tabRightX - 5, this.top + 11), new Point(tabRightX - 5, this.top + 7), new Point(tabRightX - 11, this.top + 7)]);
    };


    /**
     * UMLContainmentView
     * @constructor
     * @extends EdgeView
     */
    function UMLContainmentView() {
        EdgeView.apply(this, arguments);
        this.headEndStyle = Core.ES_CIRCLE_PLUS;
    }
    // inherits from EdgeView
    UMLContainmentView.prototype = Object.create(EdgeView.prototype);
    UMLContainmentView.prototype.constructor = UMLContainmentView;

    UMLContainmentView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLModelElement);
    };

    /**************************************************************************
     *                                                                        *
     *                  COMPOSITE STRUCTURE DIAGRAM VIEWS                     *
     *                                                                        *
     **************************************************************************/


    /**
     * UMLCompositeStructureDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLCompositeStructureDiagram() {
        UMLDiagram.apply(this, arguments);
    }
    // inherits from UMLDiagram
    UMLCompositeStructureDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLCompositeStructureDiagram.prototype.constructor = UMLCompositeStructureDiagram;

    UMLCompositeStructureDiagram.prototype.canAcceptModel = function (model) {
        return (model instanceof type.Hyperlink) ||
               (model instanceof type.Diagram) ||
               (model instanceof type.UMLConstraint) ||
               (model instanceof type.UMLPackage) ||
               (model instanceof type.UMLClassifier) ||
               (model instanceof type.UMLPort) ||
               (model instanceof type.UMLAttribute) ||
               (model instanceof type.UMLCollaborationUse) ||
               (model instanceof type.UMLGeneralization) ||
               (model instanceof type.UMLDependency) ||
               (model instanceof type.UMLInterfaceRealization) ||
               (model instanceof type.UMLComponentRealization) ||
               (model instanceof type.UMLAssociation) ||
               (model instanceof type.UMLLink) ||
               (model instanceof type.UMLConnector);
    };


    /**
     * UMLPortView
     * @constructor
     * @extends UMLFloatingNodeView
     */
    function UMLPortView() {
        UMLFloatingNodeView.apply(this, arguments);
        this.sizable = Core.SZ_NONE;
        this.fillColor = PreferenceManager.get("uml.port.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");

        /** @member {boolean} */
        this.showVisibility = false;

        /** @member {boolean} */
        this.showType = true;

        /** @member {boolean} */
        this.showMultiplicity = true;
    }
    // inherits from LabelView
    UMLPortView.prototype = Object.create(UMLFloatingNodeView.prototype);
    UMLPortView.prototype.constructor = UMLPortView;

    UMLPortView.prototype.update = function (canvas) {
        UMLFloatingNodeView.prototype.update.call(this, canvas);
        var options = {
            showVisibility   : this.showVisibility,
            showType         : this.showType,
            showMultiplicity : this.showMultiplicity,
            showProperty     : false
        };
        this.nameLabel.text = this.model.getString(options);
        this.nameLabel.underline = (this.model.isStatic === true);
    };

    UMLPortView.prototype.sizeObject = function (canvas) {
        UMLFloatingNodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = PORT_MINWIDTH;
        this.minHeight = PORT_MINHEIGHT;
    };

    UMLPortView.prototype.arrange = function (canvas) {
        if (this.containerView) {
            var r = this.containerView.getBoundingBox(canvas);
            var c = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()));
            var p = this._junction2(r, c);
            this.left = p.x - PORT_MINWIDTH / 2;
            this.top = p.y - PORT_MINHEIGHT / 2;
            this.setRight(p.x + PORT_MINWIDTH / 2);
            this.setBottom(p.y + PORT_MINHEIGHT / 2);
        }
        UMLFloatingNodeView.prototype.arrange.call(this, canvas);
    };

    UMLPortView.prototype.drawObject = function (canvas) {
        UMLFloatingNodeView.prototype.drawObject.call(this, canvas);
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
    };


    /**
     * UMLPartView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLPartView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.containerChangeable = false;
        this.showVisibility = false;

        /** @member {boolean} */
        this.showMultiplicity = true;

        this.fillColor = PreferenceManager.get("uml.part.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLPartView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLPartView.prototype.constructor = UMLPartView;

    UMLPartView.prototype.update = function (canvas) {
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        if (this.model && (this.model instanceof type.UMLAttribute)) {
            this.nameCompartment.nameLabel.text = this.model.getString(this);
            this.nameCompartment.nameLabel.underline = (this.model.isStatic === true);
        }
    };

    UMLPartView.prototype.drawObject = function (canvas) {
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
        UMLGeneralNodeView.prototype.drawObject.call(this, canvas);
    };


    /**
     * UMLConnectorView
     * @constructor
     * @extends UMLUndirectedRelationshipView
     */
    function UMLConnectorView() {
        UMLUndirectedRelationshipView.apply(this, arguments);
    }
    // inherits from UMLUndirectedRelationshipView
    UMLConnectorView.prototype = Object.create(UMLUndirectedRelationshipView.prototype);
    UMLConnectorView.prototype.constructor = UMLConnectorView;

    UMLConnectorView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLModelElement);
    };

    UMLConnectorView.prototype.update = function (canvas) {
        UMLUndirectedRelationshipView.prototype.update.call(this, canvas);
        if (this.model) {
            // nameLabel
            var text = "";
            if (this.model.name) {
                text += this.model.getString(this.showVisibility);
            }
            if (this.model.type && this.showType) {
                text += ": " + this.model.type.name;
            }
            this.nameLabel.text = text;
            this.nameLabel.visible = (text.length > 0);
        }
    };

    /**
     * UMLCollaborationView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLCollaborationView() {
        UMLGeneralNodeView.apply(this, arguments);

        /** @member {UMLTemplateParameterCompartmentView} */
        this.templateParameterCompartment = new UMLTemplateParameterCompartmentView();
        this.templateParameterCompartment.selectable = Core.SK_PROPAGATE;
        this.templateParameterCompartment.parentStyle = true;
        this.addSubView(this.templateParameterCompartment);

        this.fillColor = PreferenceManager.get("uml.collaboration.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLCollaborationView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLCollaborationView.prototype.constructor = UMLCollaborationView;

    UMLCollaborationView.prototype.update = function (canvas) {
        // templateParameterCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.templateParameterCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.templateParameterCompartment, 'model', this.model);
        }
        if (this.model) {
            if (this.model.templateParameters && this.model.templateParameters.length > 0) {
                this.templateParameterCompartment.visible = true;
            } else {
                this.templateParameterCompartment.visible = false;
            }
        }
        UMLGeneralNodeView.prototype.update.call(this, canvas);
    };

    UMLCollaborationView.prototype.drawShadowAsCanonicalForm = function (canvas, showLabel) {
        canvas.fillEllipse(
            this.mainRect.x1 + SHADOW_OFFSET,
            this.mainRect.y1 + SHADOW_OFFSET,
            this.mainRect.x2 + SHADOW_OFFSET,
            this.mainRect.y2 + SHADOW_OFFSET);
    };

    UMLCollaborationView.prototype.sizeObject = function (canvas) {
        UMLGeneralNodeView.prototype.sizeObject.call(this, canvas);
        // Calculating minimum size <= minimum Nampcompartment's circumscription size
        // rectangle's circumscription's height and width are Sqrt(2) times of rectangle's height and width
        var w = Math.max(Math.trunc(Math.sqrt(2) * this.nameCompartment.minWidth), COLLABORATION_MINWIDTH);
        var h = Math.max(Math.trunc(Math.sqrt(2) * this.nameCompartment.minHeight), COLLABORATION_MINHEIGHT);
        if (this.templateParameterCompartment.visible) {
            this.templateParameterCompartment.size(canvas);
            w = Math.max(w, this.templateParameterCompartment.minWidth);
            w = w + TEMPLATEPARAMETERCOMPARTMENT_LEFT_MARGIN + TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY;
            h = h + this.templateParameterCompartment.minHeight - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP;
        }
        this.minWidth = w;
        this.minHeight = h;
    };


    UMLCollaborationView.prototype.arrangeObject = function (canvas) {
        UMLGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        // Arranging view objects.
        if (this.templateParameterCompartment.visible) {
            this.templateParameterCompartment.left = this.getRight() - TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY - this.templateParameterCompartment.minWidth;
            this.templateParameterCompartment.top = this.top;
            this.templateParameterCompartment.setRight(this.getRight());
            this.templateParameterCompartment.arrange(canvas);
            this.nameCompartment.left = this.left;
            this.nameCompartment.top = ((this.getBottom() + this.top + this.templateParameterCompartment.height - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP) / 2) - (this.nameCompartment.height / 2);
            this.nameCompartment.setRight(this.getRight() - TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY);
            this.nameCompartment.arrange(canvas);
            var x1 = this.left,
                y1 = this.top + this.templateParameterCompartment.height - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP,
                x2 = this.getRight() - TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY,
                y2 = this.getBottom();
            this.mainRect.setRect(x1, y1, x2, y2);
        } else {
            this.nameCompartment.left = this.left;
            this.nameCompartment.top = ((this.getBottom() + this.top) / 2) - (this.nameCompartment.height / 2);
            this.nameCompartment.setRight(this.getRight());
            this.nameCompartment.arrange(canvas);
        }
    };

    UMLCollaborationView.prototype.drawObject = function (canvas) {
        var r = new Rect();
        if (this.templateParameterCompartment.visible) {
            r.x1 = this.left;
            r.y1 = this.top + this.templateParameterCompartment.height - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP;
            r.x2 = this.getRight() - TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY;
            r.y2 = this.getBottom();
        } else {
            r.setRect(this.left, this.top, this.getRight(), this.getBottom());
        }
        canvas.fillEllipse(r.x1, r.y1, r.x2, r.y2);
        canvas.ellipse(r.x1, r.y1, r.x2, r.y2, [5]);
    };


    /**
     * UMLCollaborationUseView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLCollaborationUseView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("uml.collaborationuse.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLCollaborationUseView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLCollaborationUseView.prototype.constructor = UMLCollaborationUseView;

    UMLCollaborationUseView.prototype.update = function (canvas) {
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        if (this.model.type && this.model.type.name) {
            this.nameCompartment.nameLabel.text = this.model.name + ": " + this.model.type.name;
        }
    };

    UMLCollaborationUseView.prototype.drawShadowAsCanonicalForm = function (canvas) {
        canvas.fillEllipse(
            this.mainRect.x1 + SHADOW_OFFSET,
            this.mainRect.y1 + SHADOW_OFFSET,
            this.mainRect.x2 + SHADOW_OFFSET,
            this.mainRect.y2 + SHADOW_OFFSET);
    };

    UMLCollaborationUseView.prototype.sizeObject = function (canvas) {
        UMLGeneralNodeView.prototype.sizeObject.call(this, canvas);
        // Calculating minimum size <= minimum Nampcompartment's circumscription size
        // rectangle's circumscription's height and width are Sqrt(2) times of rectangle's height and width
        var w = Math.max(Math.trunc(Math.sqrt(2) * this.nameCompartment.minWidth), COLLABORATION_MINWIDTH);
        var h = Math.max(Math.trunc(Math.sqrt(2) * this.nameCompartment.minHeight), COLLABORATION_MINHEIGHT);
        this.minWidth = w;
        this.minHeight = h;
    };

    UMLCollaborationUseView.prototype.arrangeObject = function (canvas) {
        UMLGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        this.nameCompartment.left = this.left;
        this.nameCompartment.top = ((this.getBottom() + this.top) / 2) - (this.nameCompartment.height / 2);
        this.nameCompartment.setRight(this.getRight());
        this.nameCompartment.arrange(canvas);
    };

    UMLCollaborationUseView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.fillEllipse(r.x1, r.y1, r.x2, r.y2);
        canvas.ellipse(r.x1, r.y1, r.x2, r.y2, [5]);
    };


    /**
     * UMLRoleBindingView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLRoleBindingView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_STICK_ARROW;
        this.lineMode = Core.LM_DOT;

        /** @member {EdgeLabelView} */
        this.roleNameLabel = new EdgeLabelView();
        this.roleNameLabel.hostEdge = this;
        this.roleNameLabel.edgePosition = Core.EP_HEAD;
        this.roleNameLabel.alpha = -Math.PI / 6;
        this.roleNameLabel.distance = 30;
        this.addSubView(this.roleNameLabel);
    }
    // inherits from UMLGeneralEdgeView
    UMLRoleBindingView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLRoleBindingView.prototype.constructor = UMLRoleBindingView;

    UMLRoleBindingView.prototype.update = function (canvas) {
        if (this.model) {
            this.roleNameLabel.visible = (this.model.roleName && this.model.roleName.length > 0);
            if (this.model.roleName) {
                this.roleNameLabel.text = this.model.roleName;
            }
            // roleNameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.roleNameLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.roleNameLabel, 'model', this.model);
            }
        }
        UMLGeneralEdgeView.prototype.update.call(this, canvas);
    };

    UMLRoleBindingView.prototype.canConnectTo = function (view, isTail) {
        return (isTail && view.model instanceof type.UMLCollaborationUse) ||
               (!isTail && view.model instanceof type.UMLAttribute);
    };

    /**************************************************************************
     *                                                                        *
     *                           OBJECT DIAGRAM VIEWS                         *
     *                                                                        *
     *************************************************************************/

    /**
     * UMLObjectDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLObjectDiagram() {
        UMLDiagram.apply(this, arguments);
    }
    // inherits from UMLDiagram
    UMLObjectDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLObjectDiagram.prototype.constructor = UMLObjectDiagram;

    UMLObjectDiagram.prototype.canAcceptModel = function (model) {
        return (model instanceof type.Hyperlink) ||
               (model instanceof type.Diagram) ||
               (model instanceof type.UMLConstraint) ||
               (model instanceof type.UMLClassifier) ||
               (model instanceof type.UMLInstance) ||
               (model instanceof type.UMLDependency) ||
               (model instanceof type.UMLLink);
    };


    /**
     * UMLSlotView
     * @constructor
     * @extends LabelView
     */
    function UMLSlotView() {
        LabelView.apply(this, arguments);
        this.selectable = Core.SK_YES;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_NONE;
        this.parentStyle = true;
        this.horizontalAlignment = Graphics.AL_LEFT;
    }
    // inherits from LabelView
    UMLSlotView.prototype = Object.create(LabelView.prototype);
    UMLSlotView.prototype.constructor = UMLSlotView;

    UMLSlotView.prototype.update = function (canvas) {
        var options = {
            showVisibility    : true,
            stereotypeDisplay : UML.SD_LABEL,
            showProperty      : true,
            showType          : true
        };
        if (this._parent && this._parent._parent) {
            options.showVisibility    = this._parent._parent.showVisibility;
            options.stereotypeDisplay = this._parent._parent.stereotypeDisplay;
            options.showProperty      = this._parent._parent.showProperty;
            options.showType          = this._parent._parent.showType;
        }
        if (this._parent) {
            this.visible = this._parent.visible;
        }
        if (this.model) {
            this.text = this.model.getString(options);
        }
        LabelView.prototype.update.call(this, canvas);
    };


    UMLSlotView.prototype.size = function (canvas) {
        LabelView.prototype.size.call(this, canvas);
        this.height = this.minHeight;
    };


    /**
     * UMLSlotCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLSlotCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
    }
    // inherits from UMLCompartmentView
    UMLSlotCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLSlotCompartmentView.prototype.constructor = UMLSlotCompartmentView;

    UMLSlotCompartmentView.prototype.update = function (canvas) {
        if (this.model.slots) {
            var tempViews = this.subViews;
            this.subViews = [];
            for (var i = 0, len = this.model.slots.length; i < len; i++) {
                var slot = this.model.slots[i];
                var slotView = _.find(tempViews, function (v) { return v.model == slot; });
                if (!slotView) {
                    slotView = new UMLSlotView();
                    slotView.model = slot;
                    slotView._parent = this;
                    // slotView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                    Repository.bypassInsert(this, 'subViews', slotView);
                } else {
                    this.addSubView(slotView);
                }
                slotView.setup(canvas);
            }
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };


    /**
     * UMLObjectView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLObjectView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.containerChangeable = true;

        /** @member {UMLSlotCompartmentView} */
        this.slotCompartment = new UMLSlotCompartmentView();
        this.slotCompartment.selectable = Core.SK_PROPAGATE;
        this.slotCompartment.parentStyle = true;
        this.addSubView(this.slotCompartment);

        this.fillColor = PreferenceManager.get("uml.object.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLObjectView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLObjectView.prototype.constructor = UMLObjectView;

    UMLObjectView.prototype.update = function (canvas) {
        // slotCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.slotCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.slotCompartment, 'model', this.model);
        }
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameCompartment.nameLabel.text = this.model.getString(this);
            if (this.model.slots && this.model.slots.length > 0) {
                this.slotCompartment.visible = true;
            } else {
                this.slotCompartment.visible = false;
            }
            if (this.model.value !== null && this.model.value.length > 0) {
                this.nameCompartment.namespaceLabel.text = this.model.value;
                this.nameCompartment.namespaceLabel.visible = true;
            }
        }
    };

    UMLObjectView.prototype.drawObject = function (canvas) {
        UMLGeneralNodeView.prototype.drawObject.call(this, canvas);
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom());
        if (this.model.isMultiInstance) {
            canvas.rect(r.x1 + MULTI_INSTANCE_MARGIN, r.y1 + MULTI_INSTANCE_MARGIN, r.x2 + MULTI_INSTANCE_MARGIN, r.y2 + MULTI_INSTANCE_MARGIN);
        }
        canvas.fillRect(r.x1, r.y1, r.x2, r.y2);
        canvas.rect(r.x1, r.y1, r.x2, r.y2);
        if (this.model.classifier && this.model.classifier.isActive) {
            canvas.line(this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.top, this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.getBottom());
            canvas.line(this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.top, this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.getBottom());
        }
        if (this.slotCompartment.visible) {
            canvas.line(
                this.slotCompartment.left,
                this.slotCompartment.top,
                this.slotCompartment.getRight(),
                this.slotCompartment.top);
        }
    };


    /**
     * UMLLinkView
     * @constructor
     * @extends UMLUndirectedRelationshipView
     */
    function UMLLinkView() {
        UMLUndirectedRelationshipView.apply(this, arguments);
    }
    // inherits from UMLUndirectedRelationshipView
    UMLLinkView.prototype = Object.create(UMLUndirectedRelationshipView.prototype);
    UMLLinkView.prototype.constructor = UMLLinkView;

    UMLLinkView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLInstance);
    };

    /**************************************************************************
     *                                                                        *
     *                         COMPONENT DIAGRAM VIEWS                        *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLComponentDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLComponentDiagram() {
        UMLDiagram.apply(this, arguments);
    }
    // inherits from UMLDiagram
    UMLComponentDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLComponentDiagram.prototype.constructor = UMLComponentDiagram;

    UMLComponentDiagram.prototype.canAcceptModel = function (model) {
        return (model instanceof type.Hyperlink) ||
               (model instanceof type.Diagram) ||
               (model instanceof type.UMLConstraint) ||
               (model instanceof type.UMLPackage) ||
               (model instanceof type.UMLClassifier) ||
               (model instanceof type.UMLInstance) ||
               (model instanceof type.UMLPort) ||
               (model instanceof type.UMLAttribute) ||
               (model instanceof type.UMLGeneralization) ||
               (model instanceof type.UMLDependency) ||
               (model instanceof type.UMLInterfaceRealization) ||
               (model instanceof type.UMLComponentRealization) ||
               (model instanceof type.UMLAssociation) ||
               (model instanceof type.UMLLink) ||
               (model instanceof type.UMLConnector);
    };

    /**
     * UMLArtifactViewMixin
     * @mixin
     */
    var UMLArtifactViewMixin = {

        sizeAsIconicForm: function (canvas, showLabel) {
            var sz = this.getSizeOfAllCompartments(canvas);
            this.minWidth = Math.max(sz.x, ARTIFACT_ICON_MINWIDTH);
            this.minHeight = ARTIFACT_ICON_MINHEIGHT + sz.y;
        },

        drawShadowAsIconicForm: function (canvas) {
            var w = this.iconRect.x2 - this.iconRect.x1,
                h = this.iconRect.y2 - this.iconRect.y1,
                x = this.iconRect.x2 - w * 30 / 100,
                y = this.iconRect.y1 + w * 30 / 100;
            canvas.fillPolygon([
                new Point(this.iconRect.x1 + SHADOW_OFFSET, this.iconRect.y1 + SHADOW_OFFSET),
                new Point(x + SHADOW_OFFSET, this.iconRect.y1 + SHADOW_OFFSET),
                new Point(this.iconRect.x2 + SHADOW_OFFSET, y + SHADOW_OFFSET),
                new Point(this.iconRect.x2 + SHADOW_OFFSET, this.iconRect.y2 + SHADOW_OFFSET),
                new Point(this.iconRect.x1 + SHADOW_OFFSET, this.iconRect.y2 + SHADOW_OFFSET)]);
        },

        drawIcon: function (canvas, rect) {
            var w = rect.x2 - rect.x1,
                h = rect.y2 - rect.y1,
                x = rect.x2 - w * 30 / 100,
                y = rect.y1 + w * 30 / 100;
            canvas.fillPolygon([new Point(rect.x1, rect.y1), new Point(x, rect.y1), new Point(rect.x2, y), new Point(rect.x2, rect.y2), new Point(rect.x1, rect.y2)]);
            canvas.polygon([new Point(rect.x1, rect.y1), new Point(x, rect.y1), new Point(rect.x2, y), new Point(rect.x2, rect.y2), new Point(rect.x1, rect.y2)]);
            canvas.polygon([new Point(x, rect.y1), new Point(x, y), new Point(rect.x2, y)]);
        }

    };


    /**
     * UMLArtifactView
     * @constructor
     * @mixes UMLArtifactViewMixin
     * @extends UMLClassifierView
     */
    function UMLArtifactView() {
        UMLClassifierView.apply(this, arguments);
        this.iconRatio = ARTIFACT_RATIO_PERCENT;
        // mixin UMLArtifactViewMixin
        _.extend(UMLArtifactView.prototype, UMLArtifactViewMixin);

        this.fillColor  = PreferenceManager.get("uml.artifact.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.stereotypeDisplay  = PreferenceManager.get("uml.artifact.stereotypeDisplay", UML.SD_ICON);
        this.suppressAttributes = PreferenceManager.get("uml.artifact.suppressAttributes", true);
        this.suppressOperations = PreferenceManager.get("uml.artifact.suppressOperations", true);
    }
    // inherits from UMLClassifierView
    UMLArtifactView.prototype = Object.create(UMLClassifierView.prototype);
    UMLArtifactView.prototype.constructor = UMLArtifactView;

    UMLArtifactView.prototype.getStereotypeLabelText = function () {
        return "«artifact»";
    };


    /**
     * UMLArtifactInstanceView
     * @constructor
     * @mixes UMLArtifactViewMixin
     * @extends UMLGeneralNodeView
     */
    function UMLArtifactInstanceView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.iconRatio = ARTIFACT_RATIO_PERCENT;
        this.containerChangeable = true;
        // mixin UMLArtifactViewMixin
        _.extend(UMLArtifactInstanceView.prototype, UMLArtifactViewMixin);

        this.fillColor = PreferenceManager.get("uml.artifactinstance.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.stereotypeDisplay = PreferenceManager.get("uml.artifact.stereotypeDisplay", UML.SD_ICON);
    }
    // inherits from UMLGeneralNodeView
    UMLArtifactInstanceView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLArtifactInstanceView.prototype.constructor = UMLArtifactInstanceView;

    UMLArtifactInstanceView.prototype.getStereotypeLabelText = function () {
        return "«artifact»";
    };

    UMLArtifactInstanceView.prototype.update = function (canvas) {
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameCompartment.nameLabel.text = this.model.getString(this);
        }
    };

    /**
     * UMLComponentViewMixin
     * @mixin
     */
    var UMLComponentViewMixin = {

        sizeAsCanonicalForm: function (canvas, showLabel) {
            var sz = this.getSizeOfAllCompartments(canvas);
            this.minWidth = Math.max(sz.x + COMPONENT_STATIC_MARGIN, COMPONENT_MINWIDTH);
            this.minHeight = Math.max(sz.y, COMPONENT_MINHEIGHT);
        },

        sizeAsIconicForm: function (canvas, showLabel) {
            var sz = this.getSizeOfAllCompartments(canvas);
            this.minWidth = Math.max(sz.x, COMPONENT_ICON_MINWIDTH);
            this.minHeight = COMPONENT_ICON_MINHEIGHT + sz.y;
        },

        arrangeCommon: function (canvas) {
            UMLGeneralNodeView.prototype.arrangeCommon.call(this, canvas);
            if (this.stereotypeDisplay == UML.SD_NONE || this.stereotypeDisplay == UML.SD_LABEL) {
                this.mainRect.setRect(this.left + COMPONENT_STATIC_MARGIN, this.top, this.getRight(), this.getBottom());
            }
        },

        drawShadowAsCanonicalForm: function (canvas) {
            canvas.fillRect(
                this.left + COMPONENT_RECT_INDENT + SHADOW_OFFSET,
                this.top + SHADOW_OFFSET,
                this.getRight() + SHADOW_OFFSET,
                this.getBottom() + SHADOW_OFFSET);
        },

        drawCommon: function (canvas) {
            if (this.stereotypeDisplay == UML.SD_DECORATION) {
                canvas.fillRect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2);
                canvas.rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2);
            }
        },

        drawIcon: function (canvas, rect) {
            canvas.fillRect(rect.x1 + COMPONENT_RECT_INDENT, rect.y1, rect.x2, rect.y2);
            canvas.rect(rect.x1 + COMPONENT_RECT_INDENT, rect.y1, rect.x2, rect.y2);
            canvas.fillRect(rect.x1, rect.y1 + 7, rect.x1 + 20, rect.y1 + 17);
            canvas.rect(rect.x1, rect.y1 + 7, rect.x1 + 20, rect.y1 + 17);
            canvas.fillRect(rect.x1, rect.y1 + 27, rect.x1 + 20, rect.y1 + 37);
            canvas.rect(rect.x1, rect.y1 + 27, rect.x1 + 20, rect.y1 + 37);
        },

        drawDecorationIcon: function (canvas, rect) {
            canvas.fillRect(rect.x1 + 9, rect.y1 + 5,  rect.x1 + 22, rect.y1 + 21);
            canvas.rect(rect.x1 + 9, rect.y1 + 5,  rect.x1 + 22, rect.y1 + 21);
            canvas.fillRect(rect.x1 + 6, rect.y1 + 8,  rect.x1 + 13, rect.y1 + 12);
            canvas.rect(rect.x1 + 6, rect.y1 + 8,  rect.x1 + 13, rect.y1 + 12);
            canvas.fillRect(rect.x1 + 6, rect.y1 + 14, rect.x1 + 13, rect.y1 + 18);
            canvas.rect(rect.x1 + 6, rect.y1 + 14, rect.x1 + 13, rect.y1 + 18);
        },

        drawAsCanonicalForm: function (canvas, showLabel) {
            UMLGeneralNodeView.prototype.drawAsCanonicalForm.call(this, canvas, showLabel);
            canvas.fillRect(this.left + COMPONENT_RECT_INDENT, this.top, this.getRight(), this.getBottom());
            canvas.rect(this.left + COMPONENT_RECT_INDENT, this.top, this.getRight(), this.getBottom());
            canvas.fillRect(this.left, this.top + 7, this.left + 20, this.top + 17);
            canvas.rect(this.left, this.top + 7, this.left + 20, this.top + 17);
            canvas.fillRect(this.left, this.top + 27, this.left + 20, this.top + 37);
            canvas.rect(this.left, this.top + 27, this.left + 20, this.top + 37);
        },

        drawAsDecorationForm: function (canvas, showLabel) {
            canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
            canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
            UMLGeneralNodeView.prototype.drawAsDecorationForm.call(this, canvas, showLabel);
        }

    };


    /**
     * UMLComponentView
     * @constructor
     * @mixes UMLComponentViewMixin
     * @extends UMLClassifierView
     */
    function UMLComponentView() {
        UMLClassifierView.apply(this, arguments);

        // mixin UMLComponentViewMixin
        _.extend(UMLComponentView.prototype, UMLComponentViewMixin);

        this.fillColor = PreferenceManager.get("uml.component.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.stereotypeDisplay  = PreferenceManager.get("uml.component.stereotypeDisplay", UML.SD_LABEL);
        this.suppressAttributes = PreferenceManager.get("uml.component.suppressAttributes", true);
        this.suppressOperations = PreferenceManager.get("uml.component.suppressOperations", true);
    }
    // inherits from UMLClassifierView
    UMLComponentView.prototype = Object.create(UMLClassifierView.prototype);
    UMLComponentView.prototype.constructor = UMLComponentView;


    /**
     * UMLComponentInstanceView
     * @constructor
     * @mixes UMLComponentViewMixin
     * @extends UMLGeneralNodeView
     */
    function UMLComponentInstanceView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.containerChangeable = true;
        // mixin UMLComponentViewMixin
        _.extend(UMLComponentInstanceView.prototype, UMLComponentViewMixin);

        this.fillColor = PreferenceManager.get("uml.componentinstance.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.stereotypeDisplay  = PreferenceManager.get("uml.component.stereotypeDisplay", UML.SD_LABEL);
    }
    // inherits from UMLGeneralNodeView
    UMLComponentInstanceView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLComponentInstanceView.prototype.constructor = UMLComponentInstanceView;

    UMLComponentInstanceView.prototype.update = function (canvas) {
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameCompartment.nameLabel.text = this.model.getString(this);
        }
    };


    /**
     * UMLComponentRealizationView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLComponentRealizationView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_TRIANGLE;
        this.lineMode = Core.LM_DOT;
    }
    // inherits from UMLGeneralEdgeView
    UMLComponentRealizationView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLComponentRealizationView.prototype.constructor = UMLComponentRealizationView;

    UMLComponentRealizationView.prototype.canConnectTo = function (view, isTail) {
        return (isTail && view.model instanceof type.UMLClassifier) ||
               (!isTail && view.model instanceof type.UMLComponent);
    };

    /**************************************************************************
     *                                                                        *
     *                        DEPLOYMENT DIAGRAM VIEWS                        *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLDeploymentDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLDeploymentDiagram() {
        UMLDiagram.apply(this, arguments);
    }
    // inherits from UMLDiagram
    UMLDeploymentDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLDeploymentDiagram.prototype.constructor = UMLDeploymentDiagram;

    UMLDeploymentDiagram.prototype.canAcceptModel = function (model) {
        return (model instanceof type.Hyperlink) ||
               (model instanceof type.Diagram) ||
               (model instanceof type.UMLConstraint) ||
               (model instanceof type.UMLPackage) ||
               (model instanceof type.UMLClassifier) ||
               (model instanceof type.UMLInstance) ||
               (model instanceof type.UMLPort) ||
               (model instanceof type.UMLAttribute) ||
               (model instanceof type.UMLGeneralization) ||
               (model instanceof type.UMLDependency) ||
               (model instanceof type.UMLInterfaceRealization) ||
               (model instanceof type.UMLComponentRealization) ||
               (model instanceof type.UMLAssociation) ||
               (model instanceof type.UMLLink) ||
               (model instanceof type.UMLConnector);
    };


    /**
     * UMLNodeViewMixin
     * @mixin
     */
    var UMLNodeViewMixin = {

        sizeAsCanonicalForm: function (canvas, showLabel) {
            var sz = this.getSizeOfAllCompartments(canvas);
            this.minWidth = Math.max(sz.x + NODE_STATIC_MARGIN, NODE_MINWIDTH);
            this.minHeight = Math.max(sz.y + NODE_STATIC_MARGIN, NODE_MINHEIGHT);
        },

        sizeAsIconicForm: function (canvas, showLabel) {
            var sz = this.getSizeOfAllCompartments(canvas);
            this.minWidth = Math.max(sz.x, NODE_MINWIDTH);
            this.minHeight = NODE_MINHEIGHT + sz.y;
        },

        arrangeCommon: function (canvas) {
            UMLGeneralNodeView.prototype.arrangeCommon.call(this, canvas);
            if (this.stereotypeDisplay == UML.SD_NONE || this.stereotypeDisplay == UML.SD_LABEL) {
                this.mainRect.setRect(this.left, this.top + NODE_STATIC_MARGIN, this.getRight() - NODE_STATIC_MARGIN, this.getBottom());
            }
        },

        drawShadowAsCanonicalForm: function (canvas) {
            var r = this.getRight() - 1, b = this.getBottom()- 1;
            canvas.fillPolygon([
                new Point(this.left + SHADOW_OFFSET, this.top + NODE_STATIC_MARGIN + SHADOW_OFFSET),
                new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, this.top + NODE_STATIC_MARGIN + SHADOW_OFFSET),
                new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, b + SHADOW_OFFSET),
                new Point(this.left + SHADOW_OFFSET, b + SHADOW_OFFSET)]);
            canvas.fillPolygon([
                new Point(this.left + SHADOW_OFFSET, this.top + NODE_STATIC_MARGIN + SHADOW_OFFSET),
                new Point(this.left + NODE_STATIC_MARGIN + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
                new Point(r + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
                new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, this.top + NODE_STATIC_MARGIN + SHADOW_OFFSET)]);
            canvas.fillPolygon([
                new Point(r + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
                new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, this.top + NODE_STATIC_MARGIN + SHADOW_OFFSET),
                new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, b + SHADOW_OFFSET),
                new Point(r + SHADOW_OFFSET, b - NODE_STATIC_MARGIN + SHADOW_OFFSET)]);
        },

        drawShadowAsIconicForm: function (canvas) {
            var r = this.iconRect.x2 - 1, b = this.iconRect.y2 - 1;
            canvas.fillPolygon([
                new Point(this.iconRect.x1 + SHADOW_OFFSET, this.iconRect.y1+NODE_STATIC_MARGIN + SHADOW_OFFSET),
                new Point(r-NODE_STATIC_MARGIN + SHADOW_OFFSET, this.iconRect.y1+NODE_STATIC_MARGIN + SHADOW_OFFSET),
                new Point(r-NODE_STATIC_MARGIN + SHADOW_OFFSET, b + SHADOW_OFFSET),
                new Point(this.iconRect.x1 + SHADOW_OFFSET, b + SHADOW_OFFSET)]);
            canvas.fillPolygon([
                new Point(this.iconRect.x1 + SHADOW_OFFSET, this.iconRect.y1+NODE_STATIC_MARGIN + SHADOW_OFFSET),
                new Point(this.iconRect.x1+NODE_STATIC_MARGIN + SHADOW_OFFSET, this.iconRect.y1 + SHADOW_OFFSET),
                new Point(r + SHADOW_OFFSET, this.iconRect.y1 + SHADOW_OFFSET),
                new Point(r-NODE_STATIC_MARGIN + SHADOW_OFFSET, this.iconRect.y1+NODE_STATIC_MARGIN + SHADOW_OFFSET)]);
            canvas.fillPolygon([
                new Point(r + SHADOW_OFFSET, this.iconRect.y1 + SHADOW_OFFSET),
                new Point(r-NODE_STATIC_MARGIN + SHADOW_OFFSET, this.iconRect.y1+NODE_STATIC_MARGIN + SHADOW_OFFSET),
                new Point(r-NODE_STATIC_MARGIN + SHADOW_OFFSET, b + SHADOW_OFFSET),
                new Point(r + SHADOW_OFFSET, b-NODE_STATIC_MARGIN + SHADOW_OFFSET)]);
        },

        drawCommon: function (canvas) {
            if (this.stereotypeDisplay == UML.SD_DECORATION) {
                canvas.fillRect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2);
                canvas.rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2);
            }
        },

        drawIcon: function (canvas, rect) {
            var r = rect.x2 - 1, b = rect.y2 - 1;
            canvas.fillPolygon([new Point(rect.x1, rect.y1+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, rect.y1+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, b), new Point(rect.x1, b)]);
            canvas.fillPolygon([new Point(rect.x1, rect.y1+NODE_STATIC_MARGIN), new Point(rect.x1+NODE_STATIC_MARGIN, rect.y1), new Point(r, rect.y1), new Point(r-NODE_STATIC_MARGIN, rect.y1+NODE_STATIC_MARGIN)]);
            canvas.fillPolygon([new Point(r, rect.y1), new Point(r-NODE_STATIC_MARGIN, rect.y1+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, b), new Point(r, b-NODE_STATIC_MARGIN)]);
            canvas.polygon([new Point(rect.x1, rect.y1+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, rect.y1+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, b), new Point(rect.x1, b)]);
            canvas.polygon([new Point(rect.x1, rect.y1+NODE_STATIC_MARGIN), new Point(rect.x1+NODE_STATIC_MARGIN, rect.y1), new Point(r, rect.y1), new Point(r-NODE_STATIC_MARGIN, rect.y1+NODE_STATIC_MARGIN)]);
            canvas.polygon([new Point(r, rect.y1), new Point(r-NODE_STATIC_MARGIN, rect.y1+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, b), new Point(r, b-NODE_STATIC_MARGIN)]);
        },

        drawDecorationIcon: function (canvas, rect) {
            canvas.rect(rect.x1 + 3, rect.y1 + 10, rect.x1 + 19, rect.y1 + 20);
            canvas.polygon([new Point(rect.x1 + 3, rect.y1 + 10), new Point(rect.x1 + 8, rect.y1 + 5), new Point(rect.x1 + 24, rect.y1 + 5), new Point(rect.x1 + 19, rect.y1 + 10)]);
            canvas.polygon([new Point(rect.x1 + 19, rect.y1 + 10), new Point(rect.x1 + 24, rect.y1 + 5), new Point(rect.x1 + 24, rect.y1 + 15), new Point(rect.x1 + 19, rect.y1 + 20)]);
        },

        drawAsCanonicalForm: function (canvas) {
            UMLGeneralNodeView.prototype.drawAsCanonicalForm.call(this, canvas);
            var r = this.getRight() - 1, b = this.getBottom()- 1;
            canvas.fillPolygon([new Point(this.left, this.top+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, this.top+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, b), new Point(this.left, b)]);
            canvas.fillPolygon([new Point(this.left, this.top+NODE_STATIC_MARGIN), new Point(this.left+NODE_STATIC_MARGIN, this.top), new Point(r, this.top), new Point(r-NODE_STATIC_MARGIN, this.top+NODE_STATIC_MARGIN)]);
            canvas.fillPolygon([new Point(r, this.top), new Point(r-NODE_STATIC_MARGIN, this.top+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, b), new Point(r, b-NODE_STATIC_MARGIN)]);
            canvas.polygon([new Point(this.left, this.top+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, this.top+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, b), new Point(this.left, b)]);
            canvas.polygon([new Point(this.left, this.top+NODE_STATIC_MARGIN), new Point(this.left+NODE_STATIC_MARGIN, this.top), new Point(r, this.top), new Point(r-NODE_STATIC_MARGIN, this.top+NODE_STATIC_MARGIN)]);
            canvas.polygon([new Point(r, this.top), new Point(r-NODE_STATIC_MARGIN, this.top+NODE_STATIC_MARGIN), new Point(r-NODE_STATIC_MARGIN, b), new Point(r, b-NODE_STATIC_MARGIN)]);
        },

        drawAsDecorationForm: function (canvas, showLabel) {
            canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
            canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
            UMLGeneralNodeView.prototype.drawAsDecorationForm.call(this, canvas, showLabel);
        }
    };


    /**
     * UMLNodeView
     * @constructor
     * @mixes UMLNodeViewMixin
     * @extends UMLClassifierView
     */
    function UMLNodeView() {
        UMLClassifierView.apply(this, arguments);

        this.iconRatio = NODE_RATIO_PERCENT;
        // mixin UMLNodeViewMixin
        _.extend(UMLNodeView.prototype, UMLNodeViewMixin);

        this.fillColor = PreferenceManager.get("uml.node.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.stereotypeDisplay  = PreferenceManager.get("uml.node.stereotypeDisplay", UML.SD_LABEL);
        this.suppressAttributes = PreferenceManager.get("uml.node.suppressAttributes", true);
        this.suppressOperations = PreferenceManager.get("uml.node.suppressOperations", true);
    }
    // inherits from UMLClassifierView
    UMLNodeView.prototype = Object.create(UMLClassifierView.prototype);
    UMLNodeView.prototype.constructor = UMLNodeView;


    /**
     * UMLNodeInstanceView
     * @constructor
     * @mixes UMLNodeViewMixin
     * @extends UMLGeneralNodeView
     */
    function UMLNodeInstanceView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.iconRatio = NODE_RATIO_PERCENT;
        this.containerChangeable = true;
        // mixin UMLNodeViewMixin
        _.extend(UMLNodeInstanceView.prototype, UMLNodeViewMixin);

        this.fillColor = PreferenceManager.get("uml.nodeinstance.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.stereotypeDisplay  = PreferenceManager.get("uml.node.stereotypeDisplay", UML.SD_LABEL);
    }
    // inherits from UMLGeneralNodeView
    UMLNodeInstanceView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLNodeInstanceView.prototype.constructor = UMLNodeInstanceView;

    UMLNodeInstanceView.prototype.update = function (canvas) {
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameCompartment.nameLabel.text = this.model.getString(this);
        }
    };


    /**
     * UMLDeploymentView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLDeploymentView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_STICK_ARROW;
        this.lineMode = Core.LM_DOT;
    }
    // inherits from UMLGeneralEdgeView
    UMLDeploymentView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLDeploymentView.prototype.constructor = UMLDeploymentView;

    UMLDeploymentView.prototype.update = function (canvas) {
        UMLGeneralEdgeView.prototype.update.call(this, canvas);
        this.stereotypeLabel.visible = true;
        this.stereotypeLabel.text = "«deploy»";
    };

    UMLDeploymentView.prototype.canConnectTo = function (view, isTail) {
        return (isTail && view.model instanceof type.UMLClassifier) ||
               (!isTail && view.model instanceof type.UMLNode);
    };

    /**
     * UMLCommunicationPathView
     * @constructor
     * @extends UMLAssociationView
     */
    function UMLCommunicationPathView() {
        UMLAssociationView.apply(this, arguments);
    }
    // inherits from UMLAssociationView
    UMLCommunicationPathView.prototype = Object.create(UMLAssociationView.prototype);
    UMLCommunicationPathView.prototype.constructor = UMLCommunicationPathView;

    UMLCommunicationPathView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLNode);
    };


    /**************************************************************************
     *                                                                        *
     *                         USE-CASE DIAGRAM VIEWS                         *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLUseCaseDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLUseCaseDiagram() {
        UMLDiagram.apply(this, arguments);
    }
    // inherits from UMLDiagram
    UMLUseCaseDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLUseCaseDiagram.prototype.constructor = UMLUseCaseDiagram;

    UMLUseCaseDiagram.prototype.canAcceptModel = function (model) {
        return (model instanceof type.Hyperlink) ||
               (model instanceof type.Diagram) ||
               (model instanceof type.UMLConstraint) ||
               (model instanceof type.UMLPackage) ||
               (model instanceof type.UMLClassifier) ||
               (model instanceof type.UMLUseCaseSubject) ||
               (model instanceof type.UMLInstance) ||
               (model instanceof type.UMLGeneralization) ||
               (model instanceof type.UMLDependency) ||
               (model instanceof type.UMLInterfaceRealization) ||
               (model instanceof type.UMLComponentRealization) ||
               (model instanceof type.UMLAssociation) ||
               (model instanceof type.UMLLink) ||
               (model instanceof type.UMLConnector);
    };

    UMLUseCaseDiagram.prototype.layout = function (direction, separations) {
        if (!direction) {
            direction = Core.DIRECTION_RL;
        }
        UMLDiagram.prototype.layout.call(this, direction, separations);
    };


    /**
     * UMLExtensionPointView
     * @constructor
     * @extends LabelView
     */
    function UMLExtensionPointView() {
        LabelView.apply(this, arguments);
        this.selectable = Core.SK_YES;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_NONE;
        this.parentStyle = true;
        this.horizontalAlignment = Graphics.AL_LEFT;
    }
    // inherits from LabelView
    UMLExtensionPointView.prototype = Object.create(LabelView.prototype);
    UMLExtensionPointView.prototype.constructor = UMLExtensionPointView;

    UMLExtensionPointView.prototype.update = function (canvas) {
        var options = {
            stereotypeDisplay : UML.SD_LABEL,
            showProperty      : true
        };
        if (this._parent && this._parent._parent) {
            options.stereotypeDisplay = this._parent._parent.stereotypeDisplay;
            options.showProperty      = this._parent._parent.showProperty;
        }
        if (this._parent) {
            this.visible = this._parent.visible;
        }
        if (this.model) {
            this.text = this.model.getString(options);
        }
        LabelView.prototype.update.call(this, canvas);
    };

    UMLExtensionPointView.prototype.size = function (canvas) {
        LabelView.prototype.size.call(this, canvas);
        this.height = this.minHeight;
    };


    /**
     * UMLExtensionPointCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLExtensionPointCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
    }
    // inherits from UMLCompartmentView
    UMLExtensionPointCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLExtensionPointCompartmentView.prototype.constructor = UMLExtensionPointCompartmentView;

    UMLExtensionPointCompartmentView.prototype.update = function (canvas) {
        if (this.model.extensionPoints) {
            var tempViews = this.subViews;
            this.subViews = [];
            for (var i = 0, len = this.model.extensionPoints.length; i < len; i++) {
                var ep = this.model.extensionPoints[i];
                var epView = _.find(tempViews, function (v) { return v.model == ep; });
                if (!epView) {
                    epView = new UMLExtensionPointView();
                    epView.model = ep;
                    epView._parent = this;
                    // epView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                    Repository.bypassInsert(this, 'subViews', epView);
                } else {
                    this.addSubView(epView);
                }
                epView.setup(canvas);
            }
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };


    /**
     * UMLUseCaseView
     * @constructor
     * @extends UMLClassifierView
     */
    function UMLUseCaseView() {
        UMLClassifierView.apply(this, arguments);
        this.iconRatio = USECASE_RATIO_PERCENT;

        /** @member {UMLExtensionPointCompartmentView} */
        this.extensionPointCompartment = new UMLExtensionPointCompartmentView();
        this.extensionPointCompartment.parentStyle = true;
        this.addSubView(this.extensionPointCompartment);

        this.fillColor = PreferenceManager.get("uml.usecase.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.stereotypeDisplay  = PreferenceManager.get("uml.usecase.stereotypeDisplay", UML.SD_LABEL);
        this.suppressAttributes = PreferenceManager.get("uml.usecase.suppressAttributes", true);
        this.suppressOperations = PreferenceManager.get("uml.usecase.suppressOperations", true);
    }
    // inherits from UMLClassifierView
    UMLUseCaseView.prototype = Object.create(UMLClassifierView.prototype);
    UMLUseCaseView.prototype.constructor = UMLUseCaseView;

    UMLUseCaseView.prototype.getAllCompartments = function () {
        return [
            this.nameCompartment,
            this.attributeCompartment,
            this.operationCompartment,
            this.extensionPointCompartment
        ];
    };

    UMLUseCaseView.prototype.update = function (canvas) {
        // extensionPointCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.extensionPointCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.extensionPointCompartment, 'model', this.model);
        }
        if (this.model) {
            if (this.model.extensionPoints && this.model.extensionPoints.length > 0) {
                this.extensionPointCompartment.visible = true;
            } else {
                this.extensionPointCompartment.visible = false;
            }
        }
        UMLClassifierView.prototype.update.call(this, canvas);
    };

    UMLUseCaseView.prototype.sizeAsCanonicalForm = function (canvas, showLabel) {
        UMLClassifierView.prototype.sizeAsCanonicalForm.call(this, canvas, showLabel);
        // Calculating minimum size <= minimum Namecompartment circumscription size
        // rectangle's circumscription ellipse height and width are rectangle's height and width * Sqrt(2)
        var w = Math.max(Math.trunc(Math.sqrt(2) * this.nameCompartment.minWidth), USECASE_ICON_MINWIDTH);
        if (this.attributeCompartment.visible) {
            w = Math.max(w, this.attributeCompartment.minWidth);
        }
        if (this.operationCompartment.visible) {
            w = Math.max(w, this.operationCompartment.minWidth);
        }
        if (this.extensionPointCompartment.visible) {
            w = Math.max(w, this.extensionPointCompartment.minWidth);
        }
        this.minWidth = w;
        var h = Math.max(Math.trunc(Math.sqrt(2) * this.nameCompartment.minHeight), USECASE_ICON_MINHEIGHT);
        if (this.attributeCompartment.visible) {
            h = h + this.attributeCompartment.minHeight;
        }
        if (this.operationCompartment.visible) {
            h = h + this.operationCompartment.minHeight;
        }
        if (this.extensionPointCompartment.visible) {
            h = h + this.extensionPointCompartment.minHeight;
        }
        this.minHeight = h;
    };

    UMLUseCaseView.prototype.sizeAsIconicForm = function (canvas, showLabel) {
        var sz = this.getSizeOfAllCompartments(canvas);
        this.minWidth = Math.max(sz.x, USECASE_ICON_MINWIDTH);
        this.minHeight = USECASE_ICON_MINHEIGHT + sz.y;
    };

    UMLUseCaseView.prototype.arrangeAsCanonicalForm = function (canvas, showLabel) {
        UMLClassifierView.prototype.arrangeAsCanonicalForm.call(this, canvas, showLabel);
        var y = this.getBottom();
        if (this.extensionPointCompartment.visible) {
            y = y - this.extensionPointCompartment.height;
            this.extensionPointCompartment.left = this.left;
            this.extensionPointCompartment.setRight(this.getRight());
            this.extensionPointCompartment.top = y;
            this.extensionPointCompartment.arrange(canvas);
        }
        if (this.operationCompartment.visible) {
            y = y - this.operationCompartment.height;
            this.operationCompartment.left = this.left;
            this.operationCompartment.setRight(this.getRight());
            this.operationCompartment.top = y;
            this.operationCompartment.arrange(canvas);
        }
        if (this.attributeCompartment.visible) {
            y = y - this.attributeCompartment.height;
            this.attributeCompartment.left = this.left;
            this.attributeCompartment.setRight(this.getRight());
            this.attributeCompartment.top = y;
            this.attributeCompartment.arrange(canvas);
        }
        this.nameCompartment.width = Math.trunc(1 / Math.sqrt(2) * this.width);
        this.nameCompartment.left = this.left + (this.width - this.nameCompartment.width) / 2;
        this.nameCompartment.top = ((y + this.top) / 2) - (this.nameCompartment.height / 2);
        this.nameCompartment.arrange(canvas);
    };

    UMLUseCaseView.prototype.drawShadowAsCanonicalForm = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom());
        var EXTENSIONPOINTS_MARGIN_TOP = 5;
        if (this.extensionPointCompartment.visible) {
            r.y2 = r.y2 - this.extensionPointCompartment.height - EXTENSIONPOINTS_MARGIN_TOP;
        }
        if (this.operationCompartment.visible) {
            r.y2 = r.y2 - this.operationCompartment.height;
        }
        if (this.attributeCompartment.visible) {
            r.y2 = r.y2 - this.attributeCompartment.height;
        }
        canvas.fillEllipse(
            r.x1 + SHADOW_OFFSET,
            r.y1 + SHADOW_OFFSET,
            r.x2 + SHADOW_OFFSET,
            r.y2 + SHADOW_OFFSET);
    };

    UMLUseCaseView.prototype.drawShadowAsDecorationForm = function (canvas) {
        canvas.fillRect(
            this.mainRect.x1 + SHADOW_OFFSET,
            this.mainRect.y1 + SHADOW_OFFSET,
            this.mainRect.x2 + SHADOW_OFFSET,
            this.mainRect.y2 + SHADOW_OFFSET
        );
    };

    UMLUseCaseView.prototype.drawShadowAsIconicForm = function (canvas) {
        canvas.fillEllipse(
            this.iconRect.x1 + SHADOW_OFFSET,
            this.iconRect.y1 + SHADOW_OFFSET,
            this.iconRect.x2 + SHADOW_OFFSET,
            this.iconRect.y2 + SHADOW_OFFSET
        );
    };

    UMLUseCaseView.prototype.drawIcon = function (canvas, rect) {
        var r = rect;
        var x, y;
        var w = r.x2 - r.x1;
        var h = r.y2 - r.y1;
        var rr = w * 100 / h;
        var ir = USECASE_ICON_MINWIDTH * 100 / USECASE_ICON_MINHEIGHT;
        if (rr >= ir) {
            h = (r.y2 - r.y1);
            w = h * ir / 100;
            x = r.x1 + (r.x2 - r.x1 - w) / 2;
            y = r.y1;
        } else {
            w = (r.x2 - r.x1);
            h = w * 100 / ir;
            y = r.y1 + (r.y2 - r.y1 - h) / 2;
            x = r.x1;
        }
        canvas.fillEllipse(x, y, x + w, y + h);
        canvas.ellipse(x, y, x + w, y + h);
    };

    UMLUseCaseView.prototype.drawObject = function (canvas) {
        UMLClassifierView.prototype.drawObject.call(this, canvas);
        if (this.extensionPointCompartment.visible) {
            canvas.line(
                this.extensionPointCompartment.left,
                this.extensionPointCompartment.top,
                this.extensionPointCompartment.getRight(),
                this.extensionPointCompartment.top);
        }
    };

    UMLUseCaseView.prototype.drawCommon = function (canvas) {
        if (this.stereotypeDisplay === UML.SD_DECORATION || this.stereotypeDisplay === UML.SD_DECORATION_LABEL) {
            canvas.fillRect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2);
            canvas.rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2);
        }
    };

    UMLUseCaseView.prototype.drawAsCanonicalForm = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom());
        var EXTENSIONPOINTS_MARGIN_TOP = 5;
        if (this.extensionPointCompartment.visible) {
            r.y2 = r.y2 - this.extensionPointCompartment.height - EXTENSIONPOINTS_MARGIN_TOP;
        }
        if (this.operationCompartment.visible) {
            r.y2 = r.y2 - this.operationCompartment.height;
        }
        if (this.attributeCompartment.visible) {
            r.y2 = r.y2 - this.attributeCompartment.height;
        }
        canvas.fillEllipse(r.x1, r.y1, r.x2, r.y2);
        canvas.ellipse(r.x1, r.y1, r.x2, r.y2);
    };


    /**
     * UMLActorView
     * @constructor
     * @extends UMLClassifierView
     */
    function UMLActorView() {
        UMLClassifierView.apply(this, arguments);
        this.iconRatio = ACTOR_RATIO_PERCENT;

        this.fillColor = PreferenceManager.get("uml.actor.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this.stereotypeDisplay  = PreferenceManager.get("uml.actor.stereotypeDisplay", UML.SD_LABEL);
        this.suppressAttributes = PreferenceManager.get("uml.actor.suppressAttributes", true);
        this.suppressOperations = PreferenceManager.get("uml.actor.suppressOperations", true);
    }
    // inherits from UMLClassifierView
    UMLActorView.prototype = Object.create(UMLClassifierView.prototype);
    UMLActorView.prototype.constructor = UMLActorView;

    UMLActorView.prototype.sizeAsCanonicalForm = function (canvas, showLabel) {
        this.sizeAsIconicForm(canvas, showLabel);
    };

    UMLActorView.prototype.sizeAsIconicForm = function (canvas, showLabel) {
        var sz = this.getSizeOfAllCompartments(canvas);
        this.minWidth = Math.max(sz.x, ACTOR_ICON_MINWIDTH);
        this.minHeight = ACTOR_ICON_MINHEIGHT + sz.y;
    };

    UMLActorView.prototype.arrangeAsCanonicalForm = function (canvas, showLabel) {
        this.arrangeAsIconicForm(canvas, showLabel);
    };

    UMLActorView.prototype.drawShadowAsCanonicalForm = function (canvas) {};

    UMLActorView.prototype.drawShadowAsDecorationForm = function (canvas) {
        canvas.fillRect(
            this.mainRect.x1 + SHADOW_OFFSET,
            this.mainRect.y1 + SHADOW_OFFSET,
            this.mainRect.x2 + SHADOW_OFFSET,
            this.mainRect.y2 + SHADOW_OFFSET
        );
    };

    UMLActorView.prototype.drawShadowAsIconicForm = function (canvas) {};

    UMLActorView.prototype.drawIcon = function (canvas, rect) {
        var cx, h, w, xa, xh, ya, yh, yl;
        w = rect.x2 - rect.x1;
        h = rect.y2 - rect.y1;
        xh = w * 16 / 100;
        xa = w * 14 / 100;
        yh = rect.y1 + h * 34 / 100;
        ya = rect.y1 + h * 46 / 100;
        yl = rect.y1 + h * 66 / 100;
        cx = rect.x1 + w / 2;
        canvas.fillEllipse(rect.x1 + xh, rect.y1 + 1, rect.x2 - xh, yh);
        canvas.ellipse(rect.x1 + xh, rect.y1 + 1, rect.x2 - xh, yh);
        canvas.polyline([new Point(cx, yh), new Point(cx, yl)]);
        canvas.polyline([new Point(rect.x1 + xa, ya), new Point(rect.x2 - xa, ya)]);
        canvas.polyline([new Point(cx, yl), new Point(rect.x1, rect.y2 - 1)]);
        canvas.polyline([new Point(cx, yl), new Point(rect.x2, rect.y2 - 1)]);
    };

    UMLActorView.prototype.drawCommon = function (canvas) {
        if (this.stereotypeDisplay === UML.SD_DECORATION || this.stereotypeDisplay === UML.SD_DECORATION_LABEL) {
            canvas.fillRect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2);
            canvas.rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2);
        }
    };

    UMLActorView.prototype.drawAsCanonicalForm = function (canvas) {
        this.drawAsIconicForm(canvas);
    };


    /**
     * UMLIncludeView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLIncludeView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_STICK_ARROW;
        this.lineMode = Core.LM_DOT;
    }
    // inherits from UMLGeneralEdgeView
    UMLIncludeView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLIncludeView.prototype.constructor = UMLIncludeView;

    UMLIncludeView.prototype.update = function (canvas) {
        UMLGeneralEdgeView.prototype.update.call(this, canvas);
        this.stereotypeLabel.visible = true;
        this.stereotypeLabel.text = "«include»";
    };

    UMLIncludeView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLUseCase);
    };

    /**
     * UMLExtendView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLExtendView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_STICK_ARROW;
        this.lineMode = Core.LM_DOT;
    }
    // inherits from UMLGeneralEdgeView
    UMLExtendView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLExtendView.prototype.constructor = UMLExtendView;

    UMLExtendView.prototype.update = function (canvas) {
        UMLGeneralEdgeView.prototype.update.call(this, canvas);
        this.stereotypeLabel.visible = true;
        this.stereotypeLabel.text = "«extend»";
    };

    UMLExtendView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLUseCase);
    };

    /**
     * UMLUseCaseSubjectView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLUseCaseSubjectView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.zIndex = -1;
    }
    // inherits from UMLGeneralNodeView
    UMLUseCaseSubjectView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLUseCaseSubjectView.prototype.constructor = UMLUseCaseSubjectView;

    UMLUseCaseSubjectView.prototype.update = function (canvas) {
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        if (this.model.represent && this.model.represent.name) {
            this.nameCompartment.nameLabel.text = this.model.represent.name;
        }
    };

    UMLUseCaseSubjectView.prototype.drawShadowAsCanonicalForm = function (canvas) {
        canvas.fillRect(
            this.mainRect.x1 + SHADOW_OFFSET,
            this.mainRect.y1 + SHADOW_OFFSET,
            this.mainRect.x2 + SHADOW_OFFSET,
            this.mainRect.y2 + SHADOW_OFFSET);
    };

    UMLUseCaseSubjectView.prototype.arrangeObject = function (canvas) {
        UMLGeneralNodeView.prototype.arrangeObject.call(this, canvas);
    };

    UMLUseCaseSubjectView.prototype.drawObject = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.fillRect(r.x1, r.y1, r.x2, r.y2);
        canvas.rect(r.x1, r.y1, r.x2, r.y2);
    };


    /**************************************************************************
     *                                                                        *
     *                        STATECHART DIAGRAM VIEWS                        *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLStatechartDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLStatechartDiagram() {
        UMLDiagram.apply(this, arguments);
    }
    // inherits from UMLDiagram
    UMLStatechartDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLStatechartDiagram.prototype.constructor = UMLStatechartDiagram;

    UMLStatechartDiagram.prototype.canAcceptModel = function (model) {
        return (model instanceof type.Hyperlink) ||
               (model instanceof type.Diagram) ||
               (model instanceof type.UMLConstraint) ||
               (model instanceof type.UMLState) ||
               (model instanceof type.UMLPseudostate) ||
               (model instanceof type.UMLConnectionPointReference) ||
               (model instanceof type.UMLStateMachine);
    };

    UMLStatechartDiagram.prototype.layout = function (direction, separations) {
        if (!direction) {
            direction = Core.DIRECTION_RL;
        }
        UMLDiagram.prototype.layout.call(this, direction, separations);
    };


    /**
     * UMLPseudostateView
     * @constructor
     * @extends UMLFloatingNodeView
     */
    function UMLPseudostateView() {
        UMLFloatingNodeView.apply(this, arguments);
        this.sizable = Core.SZ_FREE;
        this.containerChangeable = true;
    }
    // inherits from UMLFloatingNodeView
    UMLPseudostateView.prototype = Object.create(UMLFloatingNodeView.prototype);
    UMLPseudostateView.prototype.constructor = UMLPseudostateView;

    UMLPseudostateView.prototype.sizeObject = function (canvas) {
        UMLFloatingNodeView.prototype.sizeObject.call(this, canvas);
        switch (this.model.kind) {
        case UML.PSK_INITIAL:
            this.minWidth = INITIALSTATE_MINWIDTHH;
            this.minHeight = INITIALSTATE_MINHEIGHT;
            break;
        case UML.PSK_DEEPHISTORY:
            this.minWidth = HISTORYSTATE_MINWIDTHH;
            this.minHeight = HISTORYSTATE_MINHEIGHT;
            break;
        case UML.PSK_SHALLOWHISTORY:
            this.minWidth = HISTORYSTATE_MINWIDTHH;
            this.minHeight = HISTORYSTATE_MINHEIGHT;
            break;
        case UML.PSK_JOIN:
            if (this.height > this.width) {
                // Vertical Synchronization
                this.minWidth = JOIN_MINTHICK;
                this.minHeight = JOIN_MINLENGTH;
                this.width = this.minWidth;
            } else {
                // Horizontal Synchronization
                this.minWidth = JOIN_MINLENGTH;
                this.minHeight = JOIN_MINTHICK;
                this.height = this.minHeight;
            }
            break;
        case UML.PSK_FORK:
            if (this.height > this.width) {
                // Vertical Synchronization
                this.minWidth = FORK_MINTHICK;
                this.minHeight = FORK_MINLENGTH;
                this.width = this.minWidth;
            } else {
                // Horizontal Synchronization
                this.minWidth = FORK_MINLENGTH;
                this.minHeight = FORK_MINTHICK;
                this.height = this.minHeight;
            }
            break;
        case UML.PSK_JUNCTION:
            this.minWidth = JUNCTION_MINWIDTH;
            this.minHeight = JUNCTION_MINHEIGHT;
            break;
        case UML.PSK_CHOICE:
            this.minWidth = CHOICE_MINWIDTH;
            this.minHeight = CHOICE_MINHEIGHT;
            break;
        case UML.PSK_ENTRYPOINT:
            this.minWidth = ENTRYPOINT_MINWIDTH;
            this.minHeight = ENTRYPOINT_MINHEIGHT;
            break;
        case UML.PSK_EXITPOINT:
            this.minWidth = EXITPOINT_MINWIDTH;
            this.minHeight = EXITPOINT_MINHEIGHT;
            break;
        case UML.PSK_TERMINATE:
            this.minWidth = TERMINATE_MINWIDTH;
            this.minHeight = TERMINATE_MINHEIGHT;
            break;
        }
        this.sizeConstraints();
    };

    UMLPseudostateView.prototype.arrange = function (canvas) {
        UMLFloatingNodeView.prototype.arrange.call(this, canvas);
        this.stereotypeLabel.visible = false;
        this.nameLabel.visible = false;
    };

    UMLPseudostateView.prototype.drawShadow = function (canvas) {
        canvas.storeState();
        canvas.alpha = SHADOW_ALPHA;
        canvas.fillColor = SHADOW_COLOR;
        switch (this.model.kind) {
        case UML.PSK_INITIAL:
        case UML.PSK_DEEPHISTORY:
        case UML.PSK_SHALLOWHISTORY:
        case UML.PSK_JUNCTION:
        case UML.PSK_ENTRYPOINT:
        case UML.PSK_EXITPOINT:
            canvas.fillEllipse(
                this.left        + SHADOW_OFFSET,
                this.top         + SHADOW_OFFSET,
                this.getRight()  + SHADOW_OFFSET,
                this.getBottom() + SHADOW_OFFSET
            );
            break;
        case UML.PSK_JOIN:
        case UML.PSK_FORK:
            canvas.fillRoundRect(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET, this.getRight() + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET, 3);
            break;
        case UML.PSK_CHOICE:
            var x = this.left + (this.width / 2);
            var y = this.top + (this.height / 2);
            canvas.fillPolygon([
                new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET),
                new Point(x + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
                new Point(this.getRight() + SHADOW_OFFSET, y + SHADOW_OFFSET),
                new Point(x + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
                new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET)]);
            break;
        case UML.PSK_TERMINATE:
            // No shadow
            break;
        }
        canvas.restoreState();
        UMLFloatingNodeView.prototype.drawShadow.call(this, canvas);
    };

    UMLPseudostateView.prototype.drawObject = function (canvas) {
        var x, y, sz, p, d;
        switch (this.model.kind) {
        case UML.PSK_INITIAL:
            canvas.fillColor = this.lineColor;
            canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
            break;
        case UML.PSK_DEEPHISTORY:
            canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
            canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
            sz = canvas.textExtent('H*');
            x = this.left + (this.width - sz.x) / 2;
            y = this.top + (this.height - sz.y) / 2;
            canvas.textOut(x, y, 'H*');
            break;
        case UML.PSK_SHALLOWHISTORY:
            canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
            canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
            sz = canvas.textExtent('H');
            x = this.left + (this.width - sz.x) / 2;
            y = this.top + (this.height - sz.y) / 2;
            canvas.textOut(x, y, 'H');
            break;
        case UML.PSK_JOIN:
            canvas.fillColor = this.lineColor;
            if (Math.abs(this.getRight() - this.left) >= Math.abs(this.getBottom() - this.top)) {
                canvas.fillRoundRect(this.left, this.top, this.getRight(), this.top + JOIN_MINTHICK, 3);
            } else {
                canvas.fillRoundRect(this.left, this.top, this.left + JOIN_MINTHICK, this.getBottom(), 3);
            }
            break;
        case UML.PSK_FORK:
            canvas.fillColor = this.lineColor;
            if (Math.abs(this.getRight() - this.left) >= Math.abs(this.getBottom() - this.top)) {
                canvas.fillRoundRect(this.left, this.top, this.getRight(), this.top + FORK_MINTHICK, 3);
            } else {
                canvas.fillRoundRect(this.left, this.top, this.left + FORK_MINTHICK, this.getBottom(), 3);
            }
            break;
        case UML.PSK_JUNCTION:
            canvas.fillColor = this.lineColor;
            canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
            canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
            break;
        case UML.PSK_CHOICE:
            x = (this.left + this.getRight()) / 2;
            y = (this.top + this.getBottom()) / 2;
            canvas.fillPolygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)]);
            canvas.polygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)]);
            break;
        case UML.PSK_ENTRYPOINT:
            canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
            canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
            break;
        case UML.PSK_EXITPOINT:
            canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
            canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
            p = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()));
            d = Math.round(Math.sqrt(2) * this.width / 4);
            canvas.line(p.x - d, p.y - d, p.x + d, p.y + d);
            canvas.line(p.x + d, p.y - d, p.x - d, p.y + d);
            break;
        case UML.PSK_TERMINATE:
            p = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()));
            d = Math.round(Math.sqrt(2) * this.width / 4);
            canvas.line(p.x - d, p.y - d, p.x + d, p.y + d);
            canvas.line(p.x + d, p.y - d, p.x - d, p.y + d);
            break;
        }
    };


    /**
     * UMLFinalStateView
     * @constructor
     * @extends NodeView
     */
    function UMLFinalStateView() {
        NodeView.apply(this, arguments);
        this.sizable = Core.SZ_FREE;
        this.containerChangeable = true;
    }
    // inherits from NodeView
    UMLFinalStateView.prototype = Object.create(NodeView.prototype);
    UMLFinalStateView.prototype.constructor = UMLFinalStateView;

    UMLFinalStateView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = FINALSTATE_MINWIDTHH;
        this.minHeight = FINALSTATE_MINHEIGHT;
        this.sizeConstraints();
    };

    UMLFinalStateView.prototype.drawShadow = function (canvas) {
        canvas.storeState();
        canvas.alpha = SHADOW_ALPHA;
        canvas.fillColor = SHADOW_COLOR;
        canvas.fillEllipse(
            this.left        + SHADOW_OFFSET,
            this.top         + SHADOW_OFFSET,
            this.getRight()  + SHADOW_OFFSET,
            this.getBottom() + SHADOW_OFFSET
        );
        canvas.restoreState();
        NodeView.prototype.drawShadow.call(this, canvas);
    };

    UMLFinalStateView.prototype.drawObject = function (canvas) {
        canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
        canvas.fillColor = this.lineColor;
        canvas.fillEllipse(this.left+5, this.top+5, this.getRight()-5, this.getBottom()-5);
    };


    /**
     * UMLConnectionPointReferenceView
     * @constructor
     * @extends UMLFloatingNodeView
     */
    function UMLConnectionPointReferenceView() {
        UMLFloatingNodeView.apply(this, arguments);
        this.sizable = Core.SZ_NONE;
    }
    // inherits from LabelView
    UMLConnectionPointReferenceView.prototype = Object.create(UMLFloatingNodeView.prototype);
    UMLConnectionPointReferenceView.prototype.constructor = UMLConnectionPointReferenceView;

    UMLConnectionPointReferenceView.prototype.update = function (canvas) {
        UMLFloatingNodeView.prototype.update.call(this, canvas);
        if (this.model) {
            var connectedPoints = [];
            _.each(this.model.entry, function (point) {
                if (point.name && point.name.length > 0) {
                    connectedPoints.push(point.name);
                }
            });
            _.each(this.model.exit, function (point) {
                if (point.name && point.name.length > 0) {
                    connectedPoints.push(point.name);
                }
            });
            if (connectedPoints.length > 0) {
                this.nameLabel.text = connectedPoints.join(", ");
            }
        }
    };

    UMLConnectionPointReferenceView.prototype.sizeObject = function (canvas) {
        UMLFloatingNodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = CONNECTIONPOINT_MINWIDTH;
        this.minHeight = CONNECTIONPOINT_MINHEIGHT;
    };

    UMLConnectionPointReferenceView.prototype.arrange = function (canvas) {
        if (this.containerView) {
            var r = this.containerView.getBoundingBox(canvas);
            var c = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()));
            var p = this._junction2(r, c);
            this.left = p.x - CONNECTIONPOINT_MINWIDTH / 2;
            this.top = p.y - CONNECTIONPOINT_MINHEIGHT / 2;
            this.setRight(p.x + CONNECTIONPOINT_MINWIDTH / 2);
            this.setBottom(p.y + CONNECTIONPOINT_MINHEIGHT / 2);
        }
        UMLFloatingNodeView.prototype.arrange.call(this, canvas);
    };

    UMLConnectionPointReferenceView.prototype.drawObject = function (canvas) {
        UMLFloatingNodeView.prototype.drawObject.call(this, canvas);
        if (this.model.exit.length > 0) {
            // draw exitPoint
            canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
            canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
            var p = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()));
            var d = Math.round(Math.sqrt(2) * this.width / 4);
            canvas.line(p.x - d, p.y - d, p.x + d, p.y + d);
            canvas.line(p.x + d, p.y - d, p.x - d, p.y + d);
        } else {
            // draw entryPoint
            canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
            canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
        }
    };


    /**
     * UMLInternalActivityView
     * @constructor
     * @extends LabelView
     */
    function UMLInternalActivityView() {
        LabelView.apply(this, arguments);
        this.selectable = Core.SK_YES;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_NONE;
        this.parentStyle = true;
        this.horizontalAlignment = Graphics.AL_LEFT;
    }
    // inherits from LabelView
    UMLInternalActivityView.prototype = Object.create(LabelView.prototype);
    UMLInternalActivityView.prototype.constructor = UMLInternalActivityView;

    UMLInternalActivityView.prototype.update = function (canvas) {
        if (this._parent) {
            this.visible = this._parent.visible;
        }
        if (this.model) {
            var text = "";
            if (_.contains(this.model._parent.entryActivities, this.model)) {
                text += "entry/";
            } else if (_.contains(this.model._parent.doActivities, this.model)) {
                text += "do/";
            } else if (_.contains(this.model._parent.exitActivities, this.model)) {
                text += "exit/";
            }
            text += this.model.name;
            this.text = text;
        }
        LabelView.prototype.update.call(this, canvas);
    };

    UMLInternalActivityView.prototype.size = function (canvas) {
        LabelView.prototype.size.call(this, canvas);
        this.height = this.minHeight;
    };


    /**
     * UMLInternalActivityCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLInternalActivityCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
    }
    // inherits from UMLCompartmentView
    UMLInternalActivityCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLInternalActivityCompartmentView.prototype.constructor = UMLInternalActivityCompartmentView;

    UMLInternalActivityCompartmentView.prototype.update = function (canvas) {
        if (this.model.entryActivities && this.model.doActivities && this.model.exitActivities) {
            var tempViews = this.subViews;
            this.subViews = [];
            var actions = _.union(this.model.entryActivities, this.model.doActivities, this.model.exitActivities);
            for (var i = 0, len = actions.length; i < len; i++) {
                var action = actions[i];
                var actionView = _.find(tempViews, function (v) { return v.model == action; });
                if (!actionView) {
                    actionView = new UMLInternalActivityView();
                    actionView.model = action;
                    actionView._parent = this;
                    // actionView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                    Repository.bypassInsert(this, 'subViews', actionView);
                } else {
                    this.addSubView(actionView);
                }
                actionView.setup(canvas);
            }
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };


    /**
     * UMLInternalTransitionView
     * @constructor
     * @extends LabelView
     */
    function UMLInternalTransitionView() {
        LabelView.apply(this, arguments);
        this.selectable = Core.SK_YES;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_NONE;
        this.parentStyle = true;
        this.horizontalAlignment = Graphics.AL_LEFT;
    }
    // inherits from LabelView
    UMLInternalTransitionView.prototype = Object.create(LabelView.prototype);
    UMLInternalTransitionView.prototype.constructor = UMLInternalTransitionView;

    UMLInternalTransitionView.prototype.update = function (canvas) {
        LabelView.prototype.update.call(this, canvas);
        if (this._parent) {
            this.visible = this._parent.visible;
        }
        if (this.model) {
            this.text = this.model.getString();
        }
    };

    UMLInternalTransitionView.prototype.size = function (canvas) {
        LabelView.prototype.size.call(this, canvas);
        this.height = this.minHeight;
    };


    /**
     * UMLInternalTransitionCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLInternalTransitionCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
    }
    // inherits from UMLCompartmentView
    UMLInternalTransitionCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLInternalTransitionCompartmentView.prototype.constructor = UMLInternalTransitionCompartmentView;

    UMLInternalTransitionCompartmentView.prototype.update = function (canvas) {
        var tempViews = this.subViews;
        this.subViews = [];
        var internals = this.model.getInternalTransitions();
        for (var i = 0, len = internals.length; i < len; i++) {
            var trans = internals[i];
            var transView = _.find(tempViews, function (v) { return v.model === trans; });
            if (!transView) {
                transView = new UMLInternalTransitionView();
                transView.model = trans;
                transView._parent = this;
                // actionView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                Repository.bypassInsert(this, 'subViews', transView);
            } else {
                this.addSubView(transView);
            }
            transView.setup(canvas);
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };


    /**
     * UMLRegionView
     * @constructor
     * @extends NodeView
     */
    function UMLRegionView() {
        NodeView.apply(this, arguments);
        this.selectable = Core.SK_YES;
        this.movable = Core.MM_NONE;
        this.sizable = Core.SZ_VERT;
        this.parentStyle = true;
    }
    // inherits from LabelView
    UMLRegionView.prototype = Object.create(NodeView.prototype);
    UMLRegionView.prototype.constructor = UMLRegionView;

    UMLRegionView.prototype._isTopRegionView = function () {
        var result = true;
        if (this._parent !== null) {
            for (var i = 0, len = this._parent.subViews.length; i < len; i++) {
                var v = this._parent.subViews[i];
                if ((v instanceof UMLRegionView) && (v !== this)) {
                    if (v.top < this.top) {
                        result = false;
                        return result;
                    }
                }
            }
        }
        return result;
    };

    UMLRegionView.prototype.update = function (canvas) {
        NodeView.prototype.update.call(this, canvas);
        if (this._parent) {
            this.visible = this._parent.visible;
        }
    };

    UMLRegionView.prototype.sizeObject = function (canvas) {
        this.minWidth = REGION_MINWIDTH;
        this.minHeight = REGION_MINHEIGHT;
        NodeView.prototype.sizeObject.call(this, canvas);
    };

    UMLRegionView.prototype.drawObject = function (canvas) {
        NodeView.prototype.drawObject.call(this, canvas);
        if (!this._isTopRegionView()) {
            canvas.line(this.left, this.top, this.getRight(), this.top, [10,3]);
        }
    };

    UMLRegionView.prototype.canContainViewKind = function (kind) {
        return MetaModelManager.isKindOf(kind, "UMLStateView") ||
               MetaModelManager.isKindOf(kind, "UMLPseudostateView") ||
               MetaModelManager.isKindOf(kind, "UMLFinalStateView");
    };


    /**
     * UMLDecompositionCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLDecompositionCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
        this.minHeight = 15;

        /* temporal */
        this._leftPadding   = 0;
        this._rightPadding  = 0;
        this._topPadding    = 0;
        this._bottomPadding = 0;
        this._itemInterval  = 0;
    }
    // inherits from UMLCompartmentView
    UMLDecompositionCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLDecompositionCompartmentView.prototype.constructor = UMLDecompositionCompartmentView;

    UMLDecompositionCompartmentView.prototype.update = function (canvas) {
        if (this.model.regions) {
            var tempViews = this.subViews;
            this.subViews = [];
            for (var i = 0, len = this.model.regions.length; i < len; i++) {
                var region = this.model.regions[i];
                var regionView = _.find(tempViews, function (v) { return v.model == region; });
                if (!regionView) {
                    regionView = new UMLRegionView();
                    regionView.model = region;
                    regionView._parent = this;
                    regionView._parent = this;
                    // UMLRegionView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                    Repository.bypassInsert(this, 'subViews', regionView);
                } else {
                    this.addSubView(regionView);
                }
                regionView.setup(canvas);
            }
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };

    UMLDecompositionCompartmentView.prototype.sizeObject = function (canvas) {
        UMLCompartmentView.prototype.sizeObject.call(this, canvas);
        var h = 0;
        for (var i = 0, len = this.subViews.length; i < len; i++) {
            var regionView = this.subViews[i];
            h += regionView.height;
        }
        this.minHeight = h;
    };


    /**
     * UMLStateView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLStateView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.containerChangeable = true;

        /** @member {UMLInternalActivityCompartmentView} */
        this.internalActivityCompartment = new UMLInternalActivityCompartmentView();
        this.internalActivityCompartment.parentStyle = true;
        this.addSubView(this.internalActivityCompartment);

        /** @member {UMLInternalTransitionCompartmentView} */
        this.internalTransitionCompartment = new UMLInternalTransitionCompartmentView();
        this.internalTransitionCompartment.parentStyle = true;
        this.addSubView(this.internalTransitionCompartment);

        /** @member {UMLDecompositionCompartmentView} */
        this.decompositionCompartment = new UMLDecompositionCompartmentView();
        this.decompositionCompartment.parentStyle = true;
        this.addSubView(this.decompositionCompartment);

        this.fillColor = PreferenceManager.get("uml.state.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLStateView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLStateView.prototype.constructor = UMLStateView;

    UMLStateView.prototype.getAllCompartments = function () {
        return [
            this.nameCompartment,
            this.internalActivityCompartment,
            this.internalTransitionCompartment,
            this.decompositionCompartment
        ];
    };

    UMLStateView.prototype.update = function (canvas) {
        // internalActivityCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.internalActivityCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.internalActivityCompartment, 'model', this.model);
        }
        // internalTransitionCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.internalTransitionCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.internalTransitionCompartment, 'model', this.model);
        }
        // decompositionCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.decompositionCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.decompositionCompartment, 'model', this.model);
        }
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.sizable = Core.SZ_FREE;
            if (this.model.entryActivities.length + this.model.doActivities.length + this.model.exitActivities.length > 0) {
                this.internalActivityCompartment.visible = true;
            } else {
                this.internalActivityCompartment.visible = false;
            }
            if (this.model.getInternalTransitions().length > 0) {
                this.internalTransitionCompartment.visible = true;
            } else {
                this.internalTransitionCompartment.visible = false;
            }

            if (this.model.submachine !== null && this.showType) {
                this.nameCompartment.nameLabel.text = this.model.name + ": " + this.model.submachine.name;
            }
        }
    };

    UMLStateView.prototype.sizeObject = function (canvas) {
        UMLGeneralNodeView.prototype.sizeObject.call(this, canvas);
        var sz = this.getSizeOfAllCompartments(canvas);
        this.minWidth = Math.max(sz.x, STATE_MINWIDTH);
        if (this.model.submachine !== null) {
            this.minHeight = Math.max(sz.y + 16, STATE_MINHEIGHT);
        } else {
            this.minHeight = Math.max(sz.y, STATE_MINHEIGHT);
        }
        this.sizeConstraints();
    };

    UMLStateView.prototype.drawShadowAsCanonicalForm = function (canvas, showLabel) {
        canvas.fillRoundRect(
            this.mainRect.x1 + SHADOW_OFFSET,
            this.mainRect.y1 + SHADOW_OFFSET,
            this.mainRect.x2 + SHADOW_OFFSET,
            this.mainRect.y2 + SHADOW_OFFSET,
            STATE_ROUND
        );
    };

    UMLStateView.prototype.drawShadowAsDecorationForm = function (canvas) {
        this.drawShadowAsCanonicalForm(canvas);
    };

    UMLStateView.prototype.drawShadowAsIconicForm = function (canvas) {
        this.drawShadowAsCanonicalForm(canvas);
    };

    UMLStateView.prototype.drawObject = function (canvas) {
        canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND);
        canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND);
        if (this.internalActivityCompartment.visible) {
            canvas.line(
                this.internalActivityCompartment.left,
                this.internalActivityCompartment.top,
                this.internalActivityCompartment.getRight(),
                this.internalActivityCompartment.top);
        }
        if (this.internalTransitionCompartment.visible) {
            canvas.line(
                this.internalTransitionCompartment.left,
                this.internalTransitionCompartment.top,
                this.internalTransitionCompartment.getRight(),
                this.internalTransitionCompartment.top);
        }
        if (this.decompositionCompartment.visible && this.decompositionCompartment.subViews.length > 0) {
            canvas.line(
                this.decompositionCompartment.left,
                this.decompositionCompartment.top,
                this.decompositionCompartment.getRight(),
                this.decompositionCompartment.top);
        }
        if (this.model.submachine !== null) {
            canvas.ellipse(this.getRight()-26, this.getBottom()-16, this.getRight()-20, this.getBottom()-10);
            canvas.line(this.getRight()-20, this.getBottom()-13, this.getRight()-14, this.getBottom()-13);
            canvas.ellipse(this.getRight()-14, this.getBottom()-16, this.getRight()-8, this.getBottom()-10);
        }
    };


    /**
     * UMLTransitionView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLTransitionView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_STICK_ARROW;
        this.lineMode = Core.LM_SOLID;
    }
    // inherits from UMLGeneralEdgeView
    UMLTransitionView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLTransitionView.prototype.constructor = UMLTransitionView;

    UMLTransitionView.prototype.update = function (canvas) {
        UMLGeneralEdgeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameLabel.text = this.model.getString();
            this.nameLabel.visible = (this.nameLabel.text.length > 0);
        }
    };

    UMLTransitionView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLVertex);
    };

    /**************************************************************************
     *                                                                        *
     *                         ACTIVITY DIAGRAM VIEWS                         *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLActivityDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLActivityDiagram() {
        UMLDiagram.apply(this, arguments);
    }
    // inherits from UMLDiagram
    UMLActivityDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLActivityDiagram.prototype.constructor = UMLActivityDiagram;

    UMLActivityDiagram.prototype.canAcceptModel = function (model) {
        return (model instanceof type.Hyperlink) ||
               (model instanceof type.Diagram) ||
               (model instanceof type.UMLConstraint) ||
               (model instanceof type.UMLActivity) ||
               (model instanceof type.UMLAction) ||
               (model instanceof type.UMLActivityNode) ||
               (model instanceof type.UMLActivityPartition) ||
               (model instanceof type.UMLPin);
    };

    UMLActivityDiagram.prototype.layout = function (direction, separations) {
        if (!direction) {
            direction = Core.DIRECTION_BT;
        }
        UMLDiagram.prototype.layout.call(this, direction, separations);
    };


    /**
     * UMLPinView
     * @constructor
     * @extends UMLFloatingNodeView
     */
    function UMLPinView() {
        UMLFloatingNodeView.apply(this, arguments);
        this.sizable = Core.SZ_NONE;
    }
    // inherits from UMLFloatingNodeView
    UMLPinView.prototype = Object.create(UMLFloatingNodeView.prototype);
    UMLPinView.prototype.constructor = UMLPinView;

    UMLPinView.prototype.update = function (canvas) {
        UMLFloatingNodeView.prototype.update.call(this, canvas);
        var options = {
            showProperty      : true,
            showType          : true,
            showMultiplicity  : true
        };
        if (this.model) {
            this.nameLabel.text = this.model.getString(options);
            this.nameLabel.underline = (this.model.isStatic === true);
        }
    };

    UMLPinView.prototype.sizeObject = function (canvas) {
        UMLFloatingNodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = PIN_MINWIDTH;
        this.minHeight = PIN_MINHEIGHT;
    };

    UMLPinView.prototype.getPosition = function (canvas) {
        var RANGE = Math.round(PIN_MINWIDTH / 2);
        if (this.containerView) {
            var r = this.containerView.getBoundingBox(canvas);
            var b = this.getBoundingBox(canvas);
            if (r.y1-RANGE <= b.y2 && b.y2 <= r.y1+RANGE) {
                return "top";
            } else if (r.y2-RANGE <= b.y1 && b.y1 <= r.y2+RANGE) {
                return "bottom";
            } else if (r.x1-RANGE <= b.x2 && b.x2 <= r.x1+RANGE) {
                return "left";
            } else if (r.x2-RANGE <= b.x1 && b.x1 <= r.x2+RANGE) {
                return "right";
            }
        }
        return "else"; // default
    };

    UMLPinView.prototype.drawArrow = function (canvas, direction) {
        var MARGIN = 2;
        var rect = this.getBoundingBox(canvas),
            c = Coord.getCenter(rect),
            t = new Point(c.x, rect.y1 + MARGIN),
            b = new Point(c.x, rect.y2 - MARGIN),
            l = new Point(rect.x1 + MARGIN, c.y),
            r = new Point(rect.x2 - MARGIN, c.y);
        switch (direction) {
        case "up":
            canvas.line(b.x, b.y, t.x, t.y);
            canvas.line(t.x, t.y, t.x - 3, t.y + 3);
            canvas.line(t.x, t.y, t.x + 3, t.y + 3);
            break;
        case "down":
            canvas.line(b.x, b.y, t.x, t.y);
            canvas.line(b.x, b.y, b.x - 3, b.y - 3);
            canvas.line(b.x, b.y, b.x + 3, b.y - 3);
            break;
        case "left":
            canvas.line(l.x, l.y, r.x, r.y);
            canvas.line(l.x, l.y, l.x + 3, l.y - 3);
            canvas.line(l.x, l.y, l.x + 3, l.y + 3);
            break;
        case "right":
            canvas.line(l.x, l.y, r.x, r.y);
            canvas.line(r.x, r.y, r.x - 3, r.y - 3);
            canvas.line(r.x, r.y, r.x - 3, r.y + 3);
            break;
        }
    };

    UMLPinView.prototype.arrange = function (canvas) {
        if (this.containerView) {
            var r = this.containerView.getBoundingBox(canvas);
            var box = new Rect(this.left, this.top, this.getRight(), this.getBottom());
            var c = Coord.getCenter(box);
            var p = this._junction2(r, c);
            if (!Coord.ptInRect2(p, box)) {
                if (r.x1 < p.x) {
                    this.left = p.x;
                } else {
                    this.left = p.x - PIN_MINWIDTH + 1;
                }
                if (r.y1 < p.y) {
                    this.top = p.y;
                } else {
                    this.top = p.y - PIN_MINHEIGHT + 1;
                }
            }
            this.width = this.minWidth;
            this.height = this.minHeight;
        }
        UMLFloatingNodeView.prototype.arrange.call(this, canvas);
    };

    UMLPinView.prototype.drawObject = function (canvas) {
        UMLFloatingNodeView.prototype.drawObject.call(this, canvas);
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
    };


    /**
     * UMLInputPinView
     * @constructor
     * @extends UMLPinView
     */
    function UMLInputPinView() {
        UMLPinView.apply(this, arguments);
        this.sizable = Core.SZ_NONE;
    }
    // inherits from LabelView
    UMLInputPinView.prototype = Object.create(UMLPinView.prototype);
    UMLInputPinView.prototype.constructor = UMLInputPinView;

    UMLInputPinView.prototype.drawObject = function (canvas) {
        UMLPinView.prototype.drawObject.call(this, canvas);
        switch (this.getPosition(canvas)) {
        case "top":    this.drawArrow(canvas, "down");  break;
        case "bottom": this.drawArrow(canvas, "up");    break;
        case "left":   this.drawArrow(canvas, "right"); break;
        case "right":  this.drawArrow(canvas, "left");  break;
        }
    };


    /**
     * UMLOutputPinView
     * @constructor
     * @extends UMLPinView
     */
    function UMLOutputPinView() {
        UMLPinView.apply(this, arguments);
        this.sizable = Core.SZ_NONE;
    }
    // inherits from LabelView
    UMLOutputPinView.prototype = Object.create(UMLPinView.prototype);
    UMLOutputPinView.prototype.constructor = UMLOutputPinView;

    UMLOutputPinView.prototype.drawObject = function (canvas) {
        UMLPinView.prototype.drawObject.call(this, canvas);
        switch (this.getPosition(canvas)) {
        case "top":    this.drawArrow(canvas, "up");  break;
        case "bottom": this.drawArrow(canvas, "down");    break;
        case "left":   this.drawArrow(canvas, "left"); break;
        case "right":  this.drawArrow(canvas, "right");  break;
        }
    };

    
    /**
     * UMLExpansionNodeView
     * @constructor
     * @extends UMLPinView
     */
    function UMLExpansionNodeView() {
        UMLPinView.apply(this, arguments);
    }
    // inherits from UMLPinView
    UMLExpansionNodeView.prototype = Object.create(UMLPinView.prototype);
    UMLExpansionNodeView.prototype.constructor = UMLExpansionNodeView;

    UMLExpansionNodeView.prototype.sizeObject = function (canvas) {
        UMLPinView.prototype.sizeObject.call(this, canvas);
        switch (this.getPosition(canvas)) {
        case "top":
        case "bottom":
            this.minWidth = PIN_MINHEIGHT * 4;
            this.minHeight = PIN_MINHEIGHT;
            break;
        case "left":
        case "right":
            this.minWidth = PIN_MINWIDTH;
            this.minHeight = PIN_MINWIDTH * 4;
            break;
        }
    };

    UMLExpansionNodeView.prototype.drawObject = function (canvas) {
        UMLPinView.prototype.drawObject.call(this, canvas);
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
        switch (this.getPosition(canvas)) {
        case "top":
        case "bottom":
            canvas.line(this.left + PIN_MINHEIGHT, this.top, this.left + PIN_MINHEIGHT, this.getBottom());
            canvas.line(this.left + PIN_MINHEIGHT * 2, this.top, this.left + PIN_MINHEIGHT * 2, this.getBottom());
            canvas.line(this.left + PIN_MINHEIGHT * 3, this.top, this.left + PIN_MINHEIGHT * 3, this.getBottom());            
            break;
        case "left":
        case "right":
            canvas.line(this.left, this.top + PIN_MINWIDTH, this.getRight(), this.top + PIN_MINWIDTH);
            canvas.line(this.left, this.top + PIN_MINWIDTH * 2, this.getRight(), this.top + PIN_MINWIDTH * 2);
            canvas.line(this.left, this.top + PIN_MINWIDTH * 3, this.getRight(), this.top + PIN_MINWIDTH * 3);
            break;
        }        
    };
    

    /**
     * UMLActionView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLActionView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.containerChangeable = true;
        this.fillColor = PreferenceManager.get("uml.action.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLActionView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLActionView.prototype.constructor = UMLActionView;

    UMLActionView.prototype.update = function (canvas) {
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        if (this.model) {
            if (this.model.subactivity instanceof type.UMLActivity) {
                this.nameCompartment.nameLabel.text = this.model.name + ":" + this.model.subactivity.name;
            }
        }
    };

    UMLActionView.prototype.sizeObject = function (canvas) {
        UMLGeneralNodeView.prototype.sizeObject.call(this, canvas);
        var sz = this.getSizeOfAllCompartments(canvas);
        if (this.model.kind === UML.ACK_TIMEEVENT) {
            this.minWidth = Math.max(sz.x, ICONICVIEW_ICONMINWIDTH);
            this.minHeight = ICONICVIEW_ICONMINHEIGHT + sz.y;
        } else {
            this.minWidth = Math.max(sz.x, ACTION_MINWIDTH);
            if (this.model.submachine !== null) {
                this.minHeight = Math.max(sz.y + 16, ACTION_MINHEIGHT);
            } else {
                this.minHeight = Math.max(sz.y, ACTION_MINHEIGHT);
            }
        }
        this.sizeConstraints();
    };

    UMLActionView.prototype.arrangeObject = function (canvas) {
        UMLGeneralNodeView.prototype.arrangeObject.call(this, canvas);
        if (this.model.kind === UML.ACK_TIMEEVENT) {
            var sz = this.getSizeOfAllCompartments(canvas);
            var r  = new Rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2 - sz.y);
            this.iconRect = this.computeIconRect(r, this.iconRatio);
            var r2 = new Rect(this.mainRect.x1, this.mainRect.y1 + this.iconRect.getHeight(), this.mainRect.x2, this.mainRect.y2);
            this.arrangeAllCompartments(r2, canvas);
        }
    };

    UMLActionView.prototype.drawShadowAsCanonicalForm = function (canvas, showLabel) {
        var p;
        switch (this.model.kind) {
        case UML.ACK_OPAQUE:
        case UML.ACK_CREATE:
        case UML.ACK_DESTROY:
        case UML.ACK_READ:
        case UML.ACK_WRITE:
        case UML.ACK_INSERT:
        case UML.ACK_DELETE:
        case UML.ACK_TRIGGEREVENT:
        case UML.ACK_STRUCTURED:
            canvas.fillRoundRect(
                this.mainRect.x1 + SHADOW_OFFSET,
                this.mainRect.y1 + SHADOW_OFFSET,
                this.mainRect.x2 + SHADOW_OFFSET,
                this.mainRect.y2 + SHADOW_OFFSET,
                STATE_ROUND
            );
            break;
        case UML.ACK_SENDSIGNAL:
            p = [
                new Point(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
                new Point(this.left + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
                new Point(this.getRight() - this.height / 4 + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
                new Point(this.getRight() + SHADOW_OFFSET, this.top + this.height / 2 + SHADOW_OFFSET),
                new Point(this.getRight() - this.height / 4 + SHADOW_OFFSET, this.top + SHADOW_OFFSET)
            ];
            canvas.fillPolygon(p);
            break;
        case UML.ACK_ACCEPTSIGNAL:
        case UML.ACK_ACCEPTEVENT:
            p = [
                new Point(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
                new Point(this.getRight() + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
                new Point(this.getRight() + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
                new Point(this.left + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
                new Point(this.left + this.height / 4 + SHADOW_OFFSET, this.top + this.height / 2 + SHADOW_OFFSET)
                ];
            canvas.fillPolygon(p);
            break;
        case UML.ACK_TIMEEVENT:
            break;
        }

    };

    UMLActionView.prototype.drawShadowAsDecorationForm = function (canvas) {
        this.drawShadowAsCanonicalForm(canvas);
    };

    UMLActionView.prototype.drawShadowAsIconicForm = function (canvas) {
        this.drawShadowAsCanonicalForm(canvas);
    };

    UMLActionView.prototype.drawObject = function (canvas) {
        switch (this.model.kind) {
        case UML.ACK_OPAQUE:
        case UML.ACK_CREATE:
        case UML.ACK_DESTROY:
        case UML.ACK_READ:
        case UML.ACK_WRITE:
        case UML.ACK_INSERT:
        case UML.ACK_DELETE:
        case UML.ACK_TRIGGEREVENT:
        case UML.ACK_STRUCTURED:
            canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND);
            canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND);
            if (this.model.subactivity !== null) {
                canvas.ellipse(this.getRight()-26, this.getBottom()-16, this.getRight()-20, this.getBottom()-10);
                canvas.line(this.getRight()-20, this.getBottom()-13, this.getRight()-14, this.getBottom()-13);
                canvas.ellipse(this.getRight()-14, this.getBottom()-16, this.getRight()-8, this.getBottom()-10);
            }
            break;
        case UML.ACK_SENDSIGNAL:
            var polygon = [
                new Point(this.left, this.top),
                new Point(this.left, this.getBottom()),
                new Point(this.getRight() - this.height / 4, this.getBottom()),
                new Point(this.getRight(), this.top + this.height / 2),
                new Point(this.getRight() - this.height / 4, this.top)
            ];
            canvas.fillPolygon(polygon);
            canvas.polygon(polygon);
            break;
        case UML.ACK_ACCEPTSIGNAL:
        case UML.ACK_ACCEPTEVENT:
            var p = [
                new Point(this.left, this.top),
                new Point(this.getRight(), this.top),
                new Point(this.getRight(), this.getBottom()),
                new Point(this.left, this.getBottom()),
                new Point(this.left + this.height / 4, this.top + this.height / 2)
                ];
            canvas.fillPolygon(p);
            canvas.polygon(p);
            break;
        case UML.ACK_TIMEEVENT:
            var _iconWidth  = this.iconRect.getWidth(),
                _iconHeight = this.iconRect.getHeight(),
                _x          = (this.left + this.getRight()) / 2,
                _r          = new Rect(_x - (_iconWidth / 2), this.top, _x + (_iconWidth / 2), this.top + _iconHeight);
            var p2 = [
                new Point(_r.x1, _r.y1),
                new Point(_r.x2, _r.y1),
                new Point(_r.x1, _r.y2),
                new Point(_r.x2, _r.y2),
                new Point(_r.x1, _r.y1)
            ];
            canvas.fillPolygon(p2);
            canvas.polygon(p2);
            break;
        }
    };


    /**
     * UMLObjectNodeView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLObjectNodeView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.containerChangeable = true;
        this.fillColor = PreferenceManager.get("uml.objectnode.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLObjectNodeView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLObjectNodeView.prototype.constructor = UMLObjectNodeView;
    
    UMLObjectNodeView.prototype.update = function (canvas) {
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameCompartment.nameLabel.text = this.model.getString();
        }
    };

    UMLObjectNodeView.prototype.drawObject = function (canvas) {
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
        UMLGeneralNodeView.prototype.drawObject.call(this, canvas);
    };

    
    /**
     * UMLCentralBufferNodeView
     * @constructor
     * @extends UMLObjectNodeView
     */
    function UMLCentralBufferNodeView() {
        UMLObjectNodeView.apply(this, arguments);
    }
    // inherits from UMLObjectNodeView
    UMLCentralBufferNodeView.prototype = Object.create(UMLObjectNodeView.prototype);
    UMLCentralBufferNodeView.prototype.constructor = UMLCentralBufferNodeView;

    UMLCentralBufferNodeView.prototype.getStereotypeLabelText = function () {
        return "«centralBuffer»";
    };

    
    /**
     * UMLDataStoreNodeView
     * @constructor
     * @extends UMLObjectNodeView
     */
    function UMLDataStoreNodeView() {
        UMLObjectNodeView.apply(this, arguments);
    }
    // inherits from UMLObjectNodeView
    UMLDataStoreNodeView.prototype = Object.create(UMLObjectNodeView.prototype);
    UMLDataStoreNodeView.prototype.constructor = UMLDataStoreNodeView;

    UMLDataStoreNodeView.prototype.getStereotypeLabelText = function () {
        return "«datastore»";
    };

    
    /**
     * UMLControlNodeView
     * @constructor
     * @extends NodeView
     */
    function UMLControlNodeView() {
        NodeView.apply(this, arguments);
        this.containerChangeable = true;
        this.sizable = Core.SZ_FREE;
    }
    // inherits from NodeView
    UMLControlNodeView.prototype = Object.create(NodeView.prototype);
    UMLControlNodeView.prototype.constructor = UMLControlNodeView;

    UMLControlNodeView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        if (this.model instanceof type.UMLInitialNode) {
            this.minWidth = INITIALNODE_MINWIDTH;
            this.minHeight = INITIALNODE_MINHEIGHT;
        } else if (this.model instanceof type.UMLActivityFinalNode) {
            this.minWidth = ACTIVITYFINALNODE_MINWIDTH;
            this.minHeight = ACTIVITYFINALNODE_MINHEIGHT;
        } else if (this.model instanceof type.UMLFlowFinalNode) {
            this.minWidth = FLOWFINALNODE_MINWIDTH;
            this.minHeight = FLOWFINALNODE_MINHEIGHT;
        } else if (this.model instanceof type.UMLForkNode) {
            if (this.height > this.width) {
                // Vertical Synchronization
                this.minWidth = FORKNODE_MINTHICK;
                this.minHeight = FORKNODE_MINLENGTH;
                this.width = this.minWidth;
            } else {
                // Horizontal Synchronization
                this.minWidth = FORKNODE_MINLENGTH;
                this.minHeight = FORKNODE_MINTHICK;
                this.height = this.minHeight;
            }
        } else if (this.model instanceof type.UMLJoinNode) {
            if (this.height > this.width) {
                // Vertical Synchronization
                this.minWidth = JOINNODE_MINTHICK;
                this.minHeight = JOINNODE_MINLENGTH;
                this.width = this.minWidth;
            } else {
                // Horizontal Synchronization
                this.minWidth = JOINNODE_MINLENGTH;
                this.minHeight = JOINNODE_MINTHICK;
                this.height = this.minHeight;
            }
        } else if (this.model instanceof type.UMLMergeNode) {
            this.minWidth = MERGENODE_MINWIDTH;
            this.minHeight = MERGENODE_MINHEIGHT;
        } else if (this.model instanceof type.UMLDecisionNode) {
            this.minWidth = DECISIONNODE_MINWIDTH;
            this.minHeight = DECISIONNODE_MINHEIGHT;
        }
        this.sizeConstraints();
    };

    UMLControlNodeView.prototype.drawShadow = function (canvas) {
        canvas.storeState();
        canvas.alpha = SHADOW_ALPHA;
        canvas.fillColor = SHADOW_COLOR;
        if ((this.model instanceof type.UMLInitialNode) ||
            (this.model instanceof type.UMLActivityFinalNode) ||
            (this.model instanceof type.UMLFlowFinalNode)) {
            canvas.fillEllipse(
                this.left        + SHADOW_OFFSET,
                this.top         + SHADOW_OFFSET,
                this.getRight()  + SHADOW_OFFSET,
                this.getBottom() + SHADOW_OFFSET
            );
        } else if ((this.model instanceof type.UMLForkNode) || (this.model instanceof type.UMLJoinNode)) {
            canvas.fillRoundRect(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET, this.getRight() + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET, 3);
        } else if ((this.model instanceof type.UMLMergeNode) || (this.model instanceof type.UMLDecisionNode)) {
            var x = this.left + (this.width / 2);
            var y = this.top + (this.height / 2);
            canvas.fillPolygon([
                new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET),
                new Point(x + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
                new Point(this.getRight() + SHADOW_OFFSET, y + SHADOW_OFFSET),
                new Point(x + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
                new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET)]);
        }
        canvas.restoreState();
        NodeView.prototype.drawShadow.call(this, canvas);
    };

    UMLControlNodeView.prototype.drawObject = function (canvas) {
        var x, y, sz;
        if (this.model instanceof type.UMLInitialNode) {
            canvas.fillColor = this.lineColor;
            canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
        } else if (this.model instanceof type.UMLActivityFinalNode) {
            canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
            canvas.fillColor = this.lineColor;
            canvas.fillEllipse(this.left+5, this.top+5, this.getRight()-5, this.getBottom()-5);
        } else if (this.model instanceof type.UMLFlowFinalNode) {
            canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
            canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
            var p = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()));
            var d = Math.round(Math.sqrt(2) * this.width / 4);
            canvas.line(p.x - d, p.y - d, p.x + d, p.y + d);
            canvas.line(p.x + d, p.y - d, p.x - d, p.y + d);
        } else if (this.model instanceof type.UMLForkNode) {
            canvas.fillColor = this.lineColor;
            if (Math.abs(this.getRight() - this.left) >= Math.abs(this.getBottom() - this.top)) {
                canvas.fillRoundRect(this.left, this.top, this.getRight(), this.top + FORKNODE_MINTHICK, 3);
            } else {
                canvas.fillRoundRect(this.left, this.top, this.left + FORKNODE_MINTHICK, this.getBottom(), 3);
            }
        } else if (this.model instanceof type.UMLJoinNode) {
            canvas.fillColor = this.lineColor;
            if (Math.abs(this.getRight() - this.left) >= Math.abs(this.getBottom() - this.top)) {
                canvas.fillRoundRect(this.left, this.top, this.getRight(), this.top + JOINNODE_MINTHICK, 3);
            } else {
                canvas.fillRoundRect(this.left, this.top, this.left + JOINNODE_MINTHICK, this.getBottom(), 3);
            }
        } else if ((this.model instanceof type.UMLMergeNode) || (this.model instanceof type.UMLDecisionNode)) {
            x = (this.left + this.getRight()) / 2;
            y = (this.top + this.getBottom()) / 2;
            canvas.fillPolygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)]);
            canvas.polygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)]);
        }
    };

        
    /**
     * UMLControlFlowView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLControlFlowView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_STICK_ARROW;
        this.lineMode = Core.LM_SOLID;
    }
    // inherits from UMLGeneralEdgeView
    UMLControlFlowView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLControlFlowView.prototype.constructor = UMLControlFlowView;

    UMLControlFlowView.prototype.update = function (canvas) {
        UMLGeneralEdgeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameLabel.text = this.model.getString();
            this.nameLabel.visible = (this.nameLabel.text.length > 0);
        }
    };

    UMLControlFlowView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLActivityNode);
    };

    /**
     * UMLObjectFlowView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLObjectFlowView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_STICK_ARROW;
        this.lineMode = Core.LM_SOLID;
    }
    // inherits from UMLGeneralEdgeView
    UMLObjectFlowView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLObjectFlowView.prototype.constructor = UMLObjectFlowView;

    UMLObjectFlowView.prototype.update = function (canvas) {
        UMLGeneralEdgeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameLabel.text = this.model.getString();
            this.nameLabel.visible = (this.nameLabel.text.length > 0);
        }
    };

    UMLObjectFlowView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLActivityNode || view.model instanceof type.UMLPin);
    };
    
    
    /**
     * UMLZigZagAdornmentView
     * @constructor
     * @extends EdgeNodeView
     */
    function UMLZigZagAdornmentView() {
        EdgeNodeView.apply(this, arguments);
        this.edgePosition = Core.EP_MIDDLE;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_FREE;
        this.alpha = Math.PI / 2;
        this.distance = 20;
    }
    // inherits from EdgeNodeView
    UMLZigZagAdornmentView.prototype = Object.create(EdgeNodeView.prototype);
    UMLZigZagAdornmentView.prototype.constructor = UMLZigZagAdornmentView;


    UMLZigZagAdornmentView.prototype.update = function () {
        EdgeNodeView.prototype.update.call(this);
    };

    UMLZigZagAdornmentView.prototype.sizeObject = function (canvas) {
        EdgeNodeView.prototype.sizeObject.call(this, canvas);
        this.width = 25;
        this.height = 20;
    };
    
    UMLZigZagAdornmentView.prototype.arrangeObject = function (canvas) {
        EdgeNodeView.prototype.arrangeObject.call(this, canvas);
    };
    
    UMLZigZagAdornmentView.prototype.drawObject = function (canvas) {
        EdgeNodeView.prototype.drawObject.call(this, canvas);
        canvas.line(this.left, this.top, this.getRight(), this.top);
        canvas.line(this.getRight(), this.top, this.left, this.getBottom() - 5);
        canvas.line(this.left, this.getBottom() - 5, this.getRight(), this.getBottom() - 5);
        canvas.line(this.getRight(), this.getBottom() - 5, this.getRight() - 5, this.getBottom());
        canvas.line(this.getRight(), this.getBottom() - 5, this.getRight() - 5, this.getBottom() - 10);
    };

    /** Cannot be copied to clipboard. */
    UMLZigZagAdornmentView.prototype.canCopy = function () {
        return false;
    };

    /** Cannnot be deleted view only. */
    UMLZigZagAdornmentView.prototype.canDelete = function () {
        return false;
    };
    
    
    /**
     * UMLExceptionHandlerView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLExceptionHandlerView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_STICK_ARROW;
        this.lineMode = Core.LM_SOLID;
        
        /** @member {UMLZigZagAdornmentView} */
        this.adornment = new UMLZigZagAdornmentView();
        this.adornment.parentStyle = true;
        this.addSubView(this.adornment);        
    }
    // inherits from UMLGeneralEdgeView
    UMLExceptionHandlerView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLExceptionHandlerView.prototype.constructor = UMLExceptionHandlerView;

    UMLExceptionHandlerView.prototype.update = function () {
        UMLGeneralEdgeView.prototype.update.call(this);
        // adornment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.adornment.model !== this.model) {
            Repository.bypassFieldAssign(this.adornment, 'model', this.model);
        }
    };
    
    UMLExceptionHandlerView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLActivityNode);
    };
    

    /**
     * UMLActivityInterruptView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLActivityInterruptView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_STICK_ARROW;
        this.lineMode = Core.LM_SOLID;
        
        /** @member {UMLZigZagAdornmentView} */
        this.adornment = new UMLZigZagAdornmentView();
        this.adornment.parentStyle = true;
        this.addSubView(this.adornment);        
    }
    // inherits from UMLGeneralEdgeView
    UMLActivityInterruptView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLActivityInterruptView.prototype.constructor = UMLActivityInterruptView;

    UMLActivityInterruptView.prototype.update = function () {
        UMLGeneralEdgeView.prototype.update.call(this);
        // adornment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.adornment.model !== this.model) {
            Repository.bypassFieldAssign(this.adornment, 'model', this.model);
        }
    };
    
    UMLActivityInterruptView.prototype.canConnectTo = function (view, isTail) {
        return (view.model instanceof type.UMLActivityNode);
    };
    
    
    /**
     * UMLSwimlaneView
     * @constructor
     * @extends NodeView
     */
    function UMLSwimlaneView() {
        NodeView.apply(this, arguments);

        /** @member {Boolean} */
        this.isVertical = true;

        /** @member {LabelView} */
        this.nameLabel = new LabelView();
        this.nameLabel.horizontalAlignment = Graphics.AL_CENTER;
        this.nameLabel.verticalAlignment = Graphics.AL_TOP;
        this.nameLabel.selectable = Core.SK_NO;
        this.nameLabel.parentStyle = true;
        this.addSubView(this.nameLabel);
    }
    // inherits from NodeView
    UMLSwimlaneView.prototype = Object.create(NodeView.prototype);
    UMLSwimlaneView.prototype.constructor = UMLSwimlaneView;

    UMLSwimlaneView.prototype.canContainViewKind = function (kind) {
        return MetaModelManager.isKindOf(kind, "UMLActionView") ||
               MetaModelManager.isKindOf(kind, "UMLControlNodeView") ||
               MetaModelManager.isKindOf(kind, "UMLObjectNodeView") ||
               MetaModelManager.isKindOf(kind, "UMLFinalStateView");
    };

    UMLSwimlaneView.prototype.update = function (canvas) {
        if (this.model) {
            this.nameLabel.text = this.model.name;
            this.nameLabel.visible = (this.model.name.length > 0);
            if (this.isVertical) {
                this.nameLabel.direction = Core.DK_HORZ;
            } else {
                this.nameLabel.direction = Core.DK_VERT;
            }
        }
    };

    UMLSwimlaneView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        var w, h;
        if (this.isVertical) {
            w = this.nameLabel.minWidth + SWIMLANE_HEADER_LEFT_MARGIN + SWIMLANE_HEADER_RIGHT_MARGIN;
            this.minWidth = Math.max(w, SWIMLANE_VERT_MINWIDTH);
            h = this.nameLabel.minHeight + SWIMLANE_HEADER_TOP_MARGIN + SWIMLANE_HEADER_BOTTOM_MARGIN;
            this.minHeight = Math.max(h, SWIMLANE_VERT_MINHEIGHT);
        } else {
            w = this.nameLabel.minWidth + SWIMLANE_HEADER_TOP_MARGIN + SWIMLANE_HEADER_BOTTOM_MARGIN;
            this.minWidth = Math.max(w, SWIMLANE_HORIZ_MINWIDTH);
            h = this.nameLabel.minHeight + SWIMLANE_HEADER_LEFT_MARGIN + SWIMLANE_HEADER_RIGHT_MARGIN;
            this.minHeight = Math.max(h, SWIMLANE_HORIZ_MINHEIGHT);
        }
    };

    UMLSwimlaneView.prototype.arrangeObject = function (canvas) {
        // not inherited (SwimlaneView must not be affected by 'AutoResize' attribute.
        if (this.isVertical) {
            this.nameLabel.direction = Core.DK_HORZ;
            this.nameLabel.width = this.nameLabel.minWidth;
            this.nameLabel.height = this.nameLabel.minHeight;
            this.nameLabel.left = this.left;
            this.nameLabel.setRight(this.getRight());
            this.nameLabel.top = this.top + SWIMLANE_HEADER_TOP_MARGIN;
        } else {
            this.nameLabel.direction = Core.DK_VERT;
            this.nameLabel.width = this.nameLabel.minWidth;
            this.nameLabel.height = this.nameLabel.minHeight;
            this.nameLabel.left = this.left + SWIMLANE_HEADER_TOP_MARGIN;
            this.nameLabel.top = this.top;
            this.nameLabel.setBottom(this.getBottom());
        }
    };

    UMLSwimlaneView.prototype.drawObject = function (canvas) {
        NodeView.prototype.drawObject.call(this, canvas);
        canvas.lineWidth = SWIMLANE_PEN_WIDTH;
        if (this.isVertical) {
            var h = this.top + this.nameLabel.height + SWIMLANE_HEADER_TOP_MARGIN + SWIMLANE_HEADER_BOTTOM_MARGIN;
            canvas.fillRect(this.left, this.top, this.getRight(), h);
            canvas.rect(this.left, this.top, this.getRight(), h);
            canvas.polyline([new Point(this.left, this.getBottom()), new Point(this.left, this.top), new Point(this.getRight(), this.top), new Point(this.getRight(), this.getBottom())]);
        } else {
            var w = this.left + this.nameLabel.width + SWIMLANE_HEADER_TOP_MARGIN + SWIMLANE_HEADER_BOTTOM_MARGIN;
            canvas.fillRect(this.left, this.top, w, this.getBottom());
            canvas.rect(this.left, this.top, w, this.getBottom());
            canvas.polyline([new Point(this.getRight(), this.top), new Point(this.left, this.top), new Point(this.left, this.getBottom()), new Point(this.getRight(), this.getBottom())]);
        }
        canvas.lineWidth = 1;
    };
    
    
    /**
     * UMLInterruptibleActivityRegionView
     * @constructor
     * @extends NodeView
     */
    function UMLInterruptibleActivityRegionView() {
        NodeView.apply(this, arguments);
    }
    // inherits from NodeView
    UMLInterruptibleActivityRegionView.prototype = Object.create(NodeView.prototype);
    UMLInterruptibleActivityRegionView.prototype.constructor = UMLInterruptibleActivityRegionView;

    UMLInterruptibleActivityRegionView.prototype.canContainViewKind = function (kind) {
        return MetaModelManager.isKindOf(kind, "UMLActionView") ||
               MetaModelManager.isKindOf(kind, "UMLControlNodeView") ||
               MetaModelManager.isKindOf(kind, "UMLObjectNodeView") ||
               MetaModelManager.isKindOf(kind, "UMLFinalStateView");
    };

    UMLInterruptibleActivityRegionView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = 30;
        this.minHeight = 30;
    };
    
    UMLInterruptibleActivityRegionView.prototype.drawObject = function (canvas) {
        canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND, [3]);
    };
    
    
    /**
     * UMLStructuredActivityNodeView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLStructuredActivityNodeView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.containerChangeable = true;
        this.fillColor = PreferenceManager.get("uml.action.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLStructuredActivityNodeView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLStructuredActivityNodeView.prototype.constructor = UMLStructuredActivityNodeView;

    UMLStructuredActivityNodeView.prototype.getStereotypeLabelText = function () {
        return "«structured»";
    };
    
    UMLStructuredActivityNodeView.prototype.canContainViewKind = function (kind) {
        return MetaModelManager.isKindOf(kind, "UMLActionView") ||
               MetaModelManager.isKindOf(kind, "UMLControlNodeView") ||
               MetaModelManager.isKindOf(kind, "UMLObjectNodeView") ||
               MetaModelManager.isKindOf(kind, "UMLFinalStateView") ||
               MetaModelManager.isKindOf(kind, "UMLStructuredActivityNodeView");
    };
    
    UMLStructuredActivityNodeView.prototype.update = function (canvas) {
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        this.nameCompartment.stereotypeLabel.horizontalAlignment = Graphics.AL_LEFT;
        if (this.model) {
            if (this.model.subactivity instanceof type.UMLActivity) {
                this.nameCompartment.nameLabel.text = this.model.name + ":" + this.model.subactivity.name;
            }
        }
    };
        
    UMLStructuredActivityNodeView.prototype.drawShadowAsCanonicalForm = function (canvas, showLabel) {
        canvas.fillRoundRect(
            this.mainRect.x1 + SHADOW_OFFSET,
            this.mainRect.y1 + SHADOW_OFFSET,
            this.mainRect.x2 + SHADOW_OFFSET,
            this.mainRect.y2 + SHADOW_OFFSET,
            STATE_ROUND
        );
    };

    UMLStructuredActivityNodeView.prototype.drawShadowAsDecorationForm = function (canvas) {
        this.drawShadowAsCanonicalForm(canvas);
    };

    UMLStructuredActivityNodeView.prototype.drawShadowAsIconicForm = function (canvas) {
        this.drawShadowAsCanonicalForm(canvas);
    };

    UMLStructuredActivityNodeView.prototype.drawObject = function (canvas) {
        canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND);
        canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND, [3]);
        if (this.model.subactivity !== null) {
            canvas.ellipse(this.getRight()-26, this.getBottom()-16, this.getRight()-20, this.getBottom()-10);
            canvas.line(this.getRight()-20, this.getBottom()-13, this.getRight()-14, this.getBottom()-13);
            canvas.ellipse(this.getRight()-14, this.getBottom()-16, this.getRight()-8, this.getBottom()-10);
        }
    };

    
    /**
     * UMLExpansionRegionView
     * @constructor
     * @extends UMLStructuredActivityNodeView
     */
    function UMLExpansionRegionView() {
        UMLStructuredActivityNodeView.apply(this, arguments);
    }
    // inherits from UMLStructuredActivityNodeView
    UMLExpansionRegionView.prototype = Object.create(UMLStructuredActivityNodeView.prototype);
    UMLExpansionRegionView.prototype.constructor = UMLExpansionRegionView;

    UMLExpansionRegionView.prototype.getStereotypeLabelText = function () {
        switch (this.model.mode) {
        case UML.EK_PARALLEL:
            return "«parallel»";
        case UML.EK_ITERATIVE:
            return "«iterative»";
        case UML.EK_STREAM:
            return "«stream»";
        }
        return this.model.getStereotypeString();
    };
    
    
    /**************************************************************************
     *                                                                        *
     *                         SEQUENCE DIAGRAM VIEWS                         *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLSequenceDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLSequenceDiagram() {
        UMLDiagram.apply(this, arguments);
        this.showSequenceNumber = true;
        this.showSignature = true;
        this.showActivation = true;
    }
    // inherits from UMLDiagram
    UMLSequenceDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLSequenceDiagram.prototype.constructor = UMLSequenceDiagram;

    UMLSequenceDiagram.prototype.canAcceptModel = function (model) {
        if (model instanceof type.Hyperlink || model instanceof type.Diagram) {
            return true;
        } else if (model instanceof type.UMLMessageEndpoint ||
            model instanceof type.UMLCombinedFragment ||
            model instanceof type.UMLStateInvariant ||
            model instanceof type.UMLInteraction ||
            model instanceof type.UMLInteractionUse ||
            model instanceof type.UMLContinuation ||
            model instanceof type.UMLMessage) {
            return _.every(this.ownedViews, function (v) { return v.model !== model; });
        } else {
            return (model instanceof type.UMLConstraint) ||
                   (model instanceof type.UMLClassifier);
        }
    };

    UMLSequenceDiagram.prototype.drawDiagram = function (canvas, drawSelection) {
        var i,
            len,
            view;

        // Regulate sequence number of message views
        for (i = 0, len = this.ownedViews.length; i < len; i++) {
            view = this.ownedViews[i];
            if (view instanceof UMLSeqMessageView) {
                view.regulateSequenceNumber();
            }
        }
        UMLDiagram.prototype.drawDiagram.call(this, canvas, drawSelection);
    };

    UMLSequenceDiagram.prototype.layout = function (direction, separations) {
        // TODO: Layout for Sequence Diagram
    };


    /**
     * UMLLinePartView (Line Part of LifelineView)
     * @constructor
     * @extends NodeView
     */
    function UMLLinePartView() {
        NodeView.apply(this, arguments);
        this.movable = Core.MM_NONE;
        this.sizable = Core.SZ_VERT;
        this.selectable = Core.SK_NO;
    }
    // inherits from NodeView
    UMLLinePartView.prototype = Object.create(NodeView.prototype);
    UMLLinePartView.prototype.constructor = UMLLinePartView;

    /**
     * @param {number} yPosition
     * @return {UMLActivationView}
     */
    UMLLinePartView.prototype.getActivationAt = function (yPosition) {
        var frontMostActivation = null;
        // find the most extruded Activation(FrontMostActivation)
        // regard Activation whose Top position is the lowest as the most extruded Activation
        for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
            if (this.getDiagram().ownedViews[i] instanceof UMLSeqMessageView) {
                var msg = this.getDiagram().ownedViews[i];
                if (msg.head === this) {
                    if (msg.activation.visible && (msg.activation.top <= yPosition) && (msg.activation.getBottom() > yPosition)) {
                        if (frontMostActivation !== null) {
                            if (msg.activation.top > frontMostActivation.top) {
                                frontMostActivation = msg.activation;
                            }
                        } else {
                            frontMostActivation = msg.activation;
                        }
                    }
                }
            }
        }
        return frontMostActivation;
    };

    UMLLinePartView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        // Auto-expanding Lifeline
        var bottomMost = 0;
        for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
            if (this.getDiagram().ownedViews[i] instanceof UMLSeqMessageView) {
                var msg = this.getDiagram().ownedViews[i];
                if (msg.model && (msg.model.source === this.model || msg.model.target === this.model)) {
                    var box = msg.getBoundingBox(canvas);
                    if (bottomMost < box.y2) {
                        bottomMost = box.y2;
                    }
                }
            }
        }
        this.minWidth = 1;
        if (bottomMost > (this.minHeight + this.top)) {
            this.minHeight = (bottomMost - this.top) + 15;
        } else {
            this.minHeight = LIFELINE_MINHEIGHT;
        }
        this.sizeConstraints();
    };

    UMLLinePartView.prototype.arrangeObject = function (canvas) {
        NodeView.prototype.arrangeObject.call(this, canvas);
        this.width = this.minWidth;
    };

    UMLLinePartView.prototype.drawObject = function (canvas) {
        NodeView.prototype.drawObject.call(this, canvas);
        var c = this.left + (this.width / 2);
        canvas.line(c, this.top, c, this.getBottom(), [3]);
    };


    /**
     * UMLSeqLifelineView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLSeqLifelineView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.movable = Core.MM_HORZ;

        /** @member {UMLLinePartView} */
        this.linePart = new UMLLinePartView();
        this.addSubView(this.linePart);

        this.fillColor = PreferenceManager.get("uml.lifeline.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLSeqLifelineView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLSeqLifelineView.prototype.constructor = UMLSeqLifelineView;

    UMLSeqLifelineView.prototype.drawIcon = function (canvas, rect) {
        if (this.model) {
            if (this.model.stereotype && this.model.stereotype.icon) {
                UMLGeneralNodeView.prototype.drawIcon.call(this, canvas, rect);
            } else if (this.model.represent && (this.model.represent.type instanceof type.Model)) {
                var iconRatioBackup = this.iconRatio;
                if (this.model.represent.type instanceof type.UMLActor) {
                    this.iconRatio = ACTOR_RATIO_PERCENT;
                    this.arrangeObject(canvas);
                    UMLActorView.prototype.drawIcon.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type instanceof type.UMLUseCase) {
                    this.iconRatio = USECASE_RATIO_PERCENT;
                    this.arrangeObject(canvas);
                    UMLUseCaseView.prototype.drawIcon.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type instanceof type.UMLInterface) {
                    this.iconRatio = 100;
                    this.arrangeObject(canvas);
                    UMLInterfaceView.prototype.drawBallNotation.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type instanceof type.UMLArtifact) {
                    this.iconRatio = ARTIFACT_RATIO_PERCENT;
                    this.arrangeObject(canvas);
                    UMLArtifactViewMixin.drawIcon.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type instanceof type.UMLComponent) {
                    this.iconRatio = COMPONENT_RATIO_PERCENT;
                    this.arrangeObject(canvas);
                    UMLComponentViewMixin.drawIcon.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type instanceof type.UMLNode) {
                    this.iconRatio = NODE_RATIO_PERCENT;
                    this.arrangeObject(canvas);
                    UMLNodeViewMixin.drawIcon.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type.stereotype && this.model.represent.type.stereotype.icon) {
                    var _icon = this.model.represent.type.stereotype.icon;
                    var _rect = this.computeIconRect(rect, (_icon.width / _icon.height) * 100);
                    drawImage(canvas, _rect, _icon);
                } else {
                    UMLGeneralNodeView.prototype.drawIcon.call(this, canvas, rect);
                }
                this.iconRatio = iconRatioBackup;
                this.arrangeObject(canvas);
            } else {
                UMLGeneralNodeView.prototype.drawIcon.call(this, canvas, rect);
            }
        }
    };

    UMLSeqLifelineView.prototype.update = function () {
        UMLGeneralNodeView.prototype.update.call(this);
        // linePart가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
        if (this.linePart.model !== this.model) {
            Repository.bypassFieldAssign(this.linePart, 'model', this.model);
        }
        if (this.model) {
            this.nameCompartment.nameLabel.text = this.model.getString(this);
            this.nameCompartment.nameLabel.underline = false;
        }
    };

    UMLSeqLifelineView.prototype.sizeAsCanonicalForm = function (canvas, showLabel) {
        var sz = this.getSizeOfAllCompartments(canvas);
        this.minWidth = Math.max(SEQ_OBJECT_MINWIDTH, sz.x + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING);
        this.minHeight = Math.max(SEQ_OBJECT_MINHEIGHT, sz.y) + this.linePart.minHeight;
    };

    UMLSeqLifelineView.prototype.sizeAsDecorationForm = function (canvas, showLabel) {
        var sz = this.getSizeOfAllCompartments(canvas);
        this.minWidth = Math.max(SEQ_OBJECT_MINWIDTH, this.nameCompartment.minWidth + DECORATION_ICON_WIDTH + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING);
        this.minHeight = Math.max(SEQ_OBJECT_MINHEIGHT, sz.y) + this.linePart.minHeight;
        this.sizeConstraints();
    };

    UMLSeqLifelineView.prototype.sizeAsIconicForm = function (canvas, showLabel) {
        var sz = this.getSizeOfAllCompartments(canvas);
        this.minWidth = Math.max(sz.x, ICONICVIEW_ICONMINWIDTH);
        this.minHeight = ICONICVIEW_ICONMINHEIGHT + sz.y + this.linePart.minHeight;
    };

    UMLSeqLifelineView.prototype.arrangeCommon = function (canvas) {
        // If a create message is connected, Y position should be determined by the Message's Y position.
        var _createMessage = null;
        for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
            var v = this.getDiagram().ownedViews[i];
            if (v instanceof UMLSeqMessageView &&
                v.model.messageSort === UML.MS_CREATEMESSAGE &&
                v.head === this.linePart) {
                _createMessage = v;
                break;
            }
        }
        if (_createMessage) {
            this.top = Math.round(_createMessage.points.getPoint(1).y - (SEQ_OBJECT_MINHEIGHT / 2));
        } else {
            this.top = LIFELINE_TOP_POSITION;
        }
        this.mainRect.setRect(this.left, this.top, this.getRight(), this.getBottom());
    };

    UMLSeqLifelineView.prototype.arrangeAsCanonicalForm = function (canvas, showLabel) {
        // not inherited: must not be affected by 'AutoResize' attribute.
        UMLGeneralNodeView.prototype.arrangeAsCanonicalForm.call(this, canvas, showLabel);
        this.nameCompartment.height = SEQ_OBJECT_MINHEIGHT;
        this.linePart.top = this.nameCompartment.getBottom() + 1;
        this.linePart.left = Math.round(this.left + (this.width / 2));
        this.linePart.setBottom(this.getBottom());
    };

    UMLSeqLifelineView.prototype.arrangeAsDecorationForm = function (canvas, showLabel) {
        // not inherited: must not be affected by 'AutoResize' attribute.
        UMLGeneralNodeView.prototype.arrangeAsDecorationForm.call(this, canvas, showLabel);
        this.linePart.top = this.nameCompartment.getBottom() + 1;
        this.linePart.left = Math.round(this.left + (this.width / 2));
        this.linePart.setBottom(this.getBottom());
    };

    UMLSeqLifelineView.prototype.arrangeAsIconicForm = function (canvas, showLabel) {
        // UMLGeneralNodeView.prototype.arrangeAsIconicForm.call(this, canvas);
        var sz = this.getSizeOfAllCompartments(canvas);
        var r  = new Rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y1 + SEQ_OBJECT_MINHEIGHT);
        this.iconRect = this.computeIconRect(r, this.iconRatio);
        var r2 = new Rect(this.mainRect.x1, this.mainRect.y1 + this.iconRect.getHeight(), this.mainRect.x2, this.mainRect.y2);
        this.arrangeAllCompartments(r2, canvas);
        this.linePart.top = this.nameCompartment.getBottom() + 1;
        this.linePart.left = Math.round(this.left + (this.width / 2));
        this.linePart.setBottom(this.getBottom());
    };

    UMLSeqLifelineView.prototype.drawCommon = function (canvas) {
        // draw nothing
    };

    UMLSeqLifelineView.prototype.drawAsCanonicalForm = function (canvas, showLabel) {
        UMLGeneralNodeView.prototype.drawAsCanonicalForm.call(this, canvas);
        var r = new Rect(this.left, this.top, this.getRight(), this.nameCompartment.getBottom());
        if (this.model.isMultiInstance) {
            canvas.rect(r.x1 + MULTI_INSTANCE_MARGIN, r.y1 + MULTI_INSTANCE_MARGIN, r.x2 + MULTI_INSTANCE_MARGIN, r.y2 + MULTI_INSTANCE_MARGIN);
        }
        canvas.fillRect(r.x1, r.y1, r.x2, r.y2);
        canvas.rect(r.x1, r.y1, r.x2, r.y2);
        if (this.model.represent && this.model.represent.type && this.model.represent.type.isActive === true) {
            canvas.line(this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.top, this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.getBottom());
            canvas.line(this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.top, this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.getBottom());
        }
    };

    UMLSeqLifelineView.prototype.drawAsDecorationForm = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.nameCompartment.getBottom());
        if (this.model.isMultiInstance) {
            canvas.rect(r.x1 + MULTI_INSTANCE_MARGIN, r.y1 + MULTI_INSTANCE_MARGIN, r.x2 + MULTI_INSTANCE_MARGIN, r.y2 + MULTI_INSTANCE_MARGIN);
        }
        canvas.fillRect(r.x1, r.y1, r.x2, r.y2);
        canvas.rect(r.x1, r.y1, r.x2, r.y2);
        if (this.model.represent && this.model.represent.type && this.model.represent.type.isActive === true) {
            canvas.line(this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.top, this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.getBottom());
            canvas.line(this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.top, this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.getBottom());
        }
        UMLGeneralNodeView.prototype.drawAsDecorationForm.call(this, canvas);
    };

    UMLSeqLifelineView.prototype.drawAsIconicForm = function (canvas) {
        UMLGeneralNodeView.prototype.drawAsIconicForm.call(this, canvas);
    };

    UMLSeqLifelineView.prototype.drawShadowAsCanonicalForm = function (canvas) {
        canvas.fillRect(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET, this.getRight() + SHADOW_OFFSET, this.nameCompartment.getBottom() + SHADOW_OFFSET);
    };

    UMLSeqLifelineView.prototype.drawShadowAsDecorationForm = function (canvas) {
        canvas.fillRect(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET, this.getRight() + SHADOW_OFFSET, this.nameCompartment.getBottom() + SHADOW_OFFSET);
    };

    UMLSeqLifelineView.prototype.drawShadowAsIconicForm = function (canvas) {
        /*
        canvas.fillRect(
            this.iconRect.x1 + SHADOW_OFFSET,
            this.iconRect.y1 + SHADOW_OFFSET,
            this.iconRect.x2 + SHADOW_OFFSET,
            this.iconRect.y2 + SHADOW_OFFSET
        );
        */
    };

    /**
     * Cannot be copied to clipboard.
     */
    UMLSeqLifelineView.prototype.canCopy = function () {
        return false;
    };

    /**
     * Cannnot be deleted view only.
     */
    UMLSeqLifelineView.prototype.canDelete = function () {
        return false;
    };


    var MESSAGEENDPOINT_MINWIDTH = 15,
        MESSAGEENDPOINT_MINHEIGHT = 15;

    /**
     * UMLMessageEndpointView
     * @constructor
     * @extends NodeView
     */
    function UMLMessageEndpointView() {
        NodeView.apply(this, arguments);
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_HORZ;
    }
    // inherits from NodeView
    UMLMessageEndpointView.prototype = Object.create(NodeView.prototype);
    UMLMessageEndpointView.prototype.constructor = UMLMessageEndpointView;

    UMLMessageEndpointView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = MESSAGEENDPOINT_MINWIDTH;
        this.minHeight = MESSAGEENDPOINT_MINHEIGHT;
    };

    /**
     * Movable freely when nothing connected,
     * but movable horizontally only when a message is connected.
     */
    UMLMessageEndpointView.prototype.arrangeObject = function (canvas) {
        this.width = this.minWidth;
        this.height = this.minHeight;
        var edges = Repository.getEdgeViewsOf(this);
        if (edges.length > 0) {
            this.movable = Core.MM_HORZ;
        } else {
            this.movable = Core.MM_FREE;
        }
        NodeView.prototype.arrangeObject.call(this, canvas);
    };

    /**
     * Cannot be copied to clipboard.
     */
    UMLMessageEndpointView.prototype.canCopy = function () {
        return false;
    };

    /**
     * Cannnot be deleted view only.
     */
    UMLMessageEndpointView.prototype.canDelete = function () {
        return false;
    };


    /**
     * UMLEndpointView
     * @constructor
     * @extends UMLMessageEndpointView
     */
    function UMLEndpointView() {
        UMLMessageEndpointView.apply(this, arguments);
    }
    // inherits from UMLMessageEndpointView
    UMLEndpointView.prototype = Object.create(UMLMessageEndpointView.prototype);
    UMLEndpointView.prototype.constructor = UMLEndpointView;

    UMLEndpointView.prototype.drawObject = function (canvas) {
        canvas.fillColor = this.lineColor;
        canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
    };


    /**
     * UMLGateView
     * @constructor
     * @extends UMLMessageEndpointView
     */
    function UMLGateView() {
        UMLMessageEndpointView.apply(this, arguments);
    }
    // inherits from UMLMessageEndpointView
    UMLGateView.prototype = Object.create(UMLMessageEndpointView.prototype);
    UMLGateView.prototype.constructor = UMLGateView;

    UMLGateView.prototype.drawObject = function (canvas) {
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
    };


    /**
     * UMLActivationView
     * @constructor
     * @extends NodeView
     */
    function UMLActivationView() {
        NodeView.apply(this, arguments);
        this.sizable = Core.SZ_VERT;
        this.movable = Core.MM_NONE;
    }
    // inherits from NodeView
    UMLActivationView.prototype = Object.create(NodeView.prototype);
    UMLActivationView.prototype.constructor = UMLActivationView;

    UMLActivationView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = ACTIVATION_MINWIDTH;
        this.minHeight = ACTIVATION_MINHEIGHT;
    };

    UMLActivationView.prototype.arrangeObject = function (canvas) {
        var messageView      = this._parent,
            linePart         = messageView.head,
            parentActivation = (linePart instanceof UMLLinePartView ? linePart.getActivationAt(this.top - 1) : null);

        this.top = messageView.points.getPoint(messageView.points.count() - 1).y;
        this.width = ACTIVATION_MINWIDTH;
        // Left position extrudes a little right than Parent Activation
        if (parentActivation !== null) {
            this.left = parentActivation.left + (ACTIVATION_MINWIDTH / 2);
        } else {
            this.left = linePart.left - (ACTIVATION_MINWIDTH / 2);
        }
        // if Activation is not shown
        if (!this.visible) {
            if (parentActivation !== null) {
                this.left = parentActivation.left;
            } else {
                this.left = linePart.left;
            }
        // if Activation is shown
        } else {
            // Height must wrap all Child Activations at least.
            //   - Child Activation satisfies below conditions
            //     (1) in all current LifeLine's In-coming Messages,
            //     (2) if its head side's y position is between Top and Bottom,
            //     (3) the message's Activation is really Child Activation.
            var minimumBottom = this.top + ACTIVATION_MINHEIGHT;
            for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
                if (this.getDiagram().ownedViews[i] instanceof UMLSeqMessageView) {
                    var msg = this.getDiagram().ownedViews[i];
                    if ((msg.head == linePart) && (msg != messageView)) {
                        var y = msg.points.getPoint(msg.points.count() - 1).y;
                        if ((this.top <= y) && (this.getBottom() > y)) {
                            if (msg.activation.visible && (msg.activation.getBottom() > minimumBottom)) {
                                minimumBottom = msg.activation.getBottom();
                            }
                        }
                    }
                }
            }
            if (this.getBottom() < minimumBottom + 3) {
                this.setBottom(minimumBottom + 3);
            }
        }
        NodeView.prototype.arrangeObject.call(this, canvas);
    };

    UMLActivationView.prototype.drawObject = function (canvas) {
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
    };

    /**
     * Cannot be copied to clipboard.
     */
    UMLActivationView.prototype.canCopy = function () {
        return false;
    };

    /**
     * Cannnot be deleted view only.
     */
    UMLActivationView.prototype.canDelete = function () {
        return false;
    };


    /**
     * UMLSeqMessageView
     * @constructor
     * @extends EdgeView
     */
    function UMLSeqMessageView() {
        EdgeView.apply(this, arguments);
        this.lineStyle = Core.LS_RECTILINEAR;
        this.zIndex = 1;

        /** @member {EdgeLabelView} */
        this.nameLabel = new EdgeLabelView();
        this.nameLabel.hostEdge = this;
        this.nameLabel.edgePosition = Core.EP_MIDDLE;
        this.nameLabel.distance = 10;
        this.nameLabel.alpha = Math.PI / 2;
        this.addSubView(this.nameLabel);

        /** @member {EdgeLabelView} */
        this.stereotypeLabel = new EdgeLabelView();
        this.stereotypeLabel.hostEdge = this;
        this.stereotypeLabel.edgePosition = Core.EP_MIDDLE;
        this.stereotypeLabel.distance = 25;
        this.stereotypeLabel.alpha = Math.PI / 2;
        this.addSubView(this.stereotypeLabel);

        /** @member {EdgeLabelView} */
        this.propertyLabel = new EdgeLabelView();
        this.propertyLabel.hostEdge = this;
        this.propertyLabel.edgePosition = Core.EP_MIDDLE;
        this.propertyLabel.distance = 10;
        this.propertyLabel.alpha = -Math.PI / 2;
        this.addSubView(this.propertyLabel);

        /** @member {UMLActivationView} */
        this.activation = new UMLActivationView();
        this.addSubView(this.activation);

        /** @member {boolean} */
        this.showProperty = true;

        /** @member {boolean} */
        this.showType = true;
    }
    // inherits from EdgeView
    UMLSeqMessageView.prototype = Object.create(EdgeView.prototype);
    UMLSeqMessageView.prototype.constructor = UMLSeqMessageView;

    UMLSeqMessageView.prototype._fixPointCount = function (cnt, xpos, ypos) {
        if (this.points.count() != cnt) {
            this.points.clear();
            for (var pi = 1; pi <= cnt; pi++) {
                this.points.add(new Point(xpos, ypos));
            }
        }
    };

    /**
     * @private
     */
    UMLSeqMessageView.prototype._getSequenceNumberByPos = function (xpos, ypos) {
        var seqNum = 0,
            views  = this.getDiagram().ownedViews;
        for (var i = 0, len = views.length; i < len; i++) {
            var v = views[i];
            if (v instanceof UMLSeqMessageView) {
                if (v.points.getPoint(0).y < ypos) {
                    seqNum = seqNum + 1;
                } else if (v.points.getPoint(0).y == ypos) {
                    if (v.points.getPoint(0).x < xpos) {
                        seqNum = seqNum + 1;
                    }
                }
            }
        }
        return seqNum;
    };

    /**
     * @private
     */
    UMLSeqMessageView.prototype._indexOfMessageView = function (model) {
        var dgm = this.getDiagram();
        for (var i = 0, len = dgm.ownedViews.length; i < len; i++) {
            var v = dgm.ownedViews[i];
            if (v.model == model) {
                return i;
            }
        }
        return -1;
    };

    UMLSeqMessageView.prototype.regulateSequenceNumber = function () {
        // var fromLine       = this.tail,
        //     fromActivation = fromLine.getActivationAt(this.points.getPoint(0).y),
        var dgm            = this.getDiagram(),
            msg            = this.model,
            interaction    = this.model._parent,
            sn             = _.indexOf(interaction.messages, msg),
            sn2            = this._getSequenceNumberByPos(this.points.getPoint(0).x, this.points.getPoint(0).y);
        // determine sequence number
        if (sn != sn2) {
            // change by ownedViews' index to correspond to SequenceNumber.
            var c = this._indexOfMessageView(interaction.messages[sn2]);
            dgm.ownedViews.remove(this);
            dgm.ownedViews.insert(c, this);
            // move at interactions' index to correspond to SequenceNumber.
            interaction.messages.remove(msg);
            interaction.messages.insert(sn2, msg);
        }
    };

    UMLSeqMessageView.prototype.update = function () {
        EdgeView.prototype.update.call(this);
        if (this.model) {
            var options = {
                showSequenceNumber : this.getDiagram().showSequenceNumber,
                showSignature      : this.getDiagram().showSignature,
                showActivation     : this.getDiagram().showActivation,
                showType           : this.showType
            };
            this.nameLabel.text = this.model.getString(options);
            this.nameLabel.visible = (this.nameLabel.text.length > 0);
            this.stereotypeLabel.visible = (this.stereotypeLabel.text.length > 0);
            this.activation.visible = (this.head instanceof UMLLinePartView &&
                                       options.showActivation &&
                                       ((this.model.messageSort === UML.MS_SYNCHCALL) ||
                                        (this.model.messageSort === UML.MS_ASYNCHCALL) ||
                                        (this.model.messageSort === UML.MS_DELETEMESSAGE)));
            // line style
            if ((this.model.messageSort === UML.MS_REPLY) || (this.model.messageSort === UML.MS_CREATEMESSAGE)) {
                this.lineMode = Core.LM_DOT;
            } else {
                this.lineMode = Core.LM_SOLID;
            }
            // head end style
            if ((this.model.messageSort === UML.MS_ASYNCHCALL) ||
                (this.model.messageSort === UML.MS_ASYNCHSIGNAL) ||
                (this.model.messageSort === UML.MS_CREATEMESSAGE) ||
                (this.model.messageSort === UML.MS_REPLY)) {
                this.headEndStyle = Core.ES_STICK_ARROW;
            } else {
                this.headEndStyle = Core.ES_SOLID_ARROW;
            }
            // stereotype
            if (this.model.messageSort === UML.MS_CREATEMESSAGE) {
                this.stereotypeLabel.text = "«create»";
            } else if (this.model.messageSort === UML.MS_DELETEMESSAGE) {
                this.stereotypeLabel.text = "«destroy»";
            } else if (hasValue(this.model.stereotype)) {
                this.stereotypeLabel.text = this.model.getStereotypeString();
            } else {
                this.stereotypeLabel.text = "";
            }
            // propertyLabel
            this.propertyLabel.text = this.model.getPropertyString();
            this.propertyLabel.visible = (this.showProperty ? this.propertyLabel.text.length > 0 : false);
            // activation가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.activation.model !== this.model) {
                Repository.bypassFieldAssign(this.activation, 'model', this.model);
            }
            // nameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.nameLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.nameLabel, 'model', this.model);
            }
            // stereotypeLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.stereotypeLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.stereotypeLabel, 'model', this.model);
            }
            // propertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.propertyLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.propertyLabel, 'model', this.model);
            }
        }
    };

    UMLSeqMessageView.prototype.arrange = function (canvas) {
        // arrange activation
        this.activation.arrangeObject(canvas);
        // if head or tail is MessageEndpointView
        if (this.head instanceof UMLMessageEndpointView) {
            this.head.top = this.points.getPoint(1).y - (this.head.height / 2);
        }
        if (this.tail instanceof UMLMessageEndpointView) {
            this.tail.top = this.points.getPoint(1).y - (this.tail.height / 2);
        }
        EdgeView.prototype.arrange.call(this, canvas);
        // if create message, head's X position should be the left of Lifeline.
        if (this.model.messageSort === UML.MS_CREATEMESSAGE) {
             if (this.points.getPoint(1).x > this.points.getPoint(0).x) {
                 if (this.head._parent instanceof UMLSeqLifelineView) {
                     var lifeline = this.head._parent;
                     this.points.getPoint(1).x = lifeline.left;
                 }
             }
        }
    };

    UMLSeqMessageView.prototype.arrangeObject = function (canvas) {
        // default variable values
        this.lineStyle = Core.LS_RECTILINEAR;
        EdgeView.prototype.arrangeObject.call(this, canvas);

        var fromLifeline   = this.tail,
            fromActivation = (fromLifeline instanceof UMLLinePartView ? fromLifeline.getActivationAt(this.points.getPoint(0).y) : null),
            toLifeline     = this.head,
            toActivation   = (toLifeline instanceof UMLLinePartView ? toLifeline.getActivationAt(this.points.getPoint(this.points.count() - 1).y) : null);

        // (1) in case of Self message
        if (this.head === this.tail) {
            this._fixPointCount(4, this.points.getPoint(0).x, this.points.getPoint(0).y);
            if ((fromActivation !== null) && fromActivation.visible) {
                this.points.setPoint(0, new Point(fromActivation.getRight(), this.points.getPoint(0).y));
            } else {
                this.points.setPoint(0, new Point(fromLifeline.getRight(), this.points.getPoint(0).y));
            }
            this.points.setPoint(1, new Point(this.points.getPoint(0).x + SELF_MESSAGE_WIDTH, this.points.getPoint(0).y));
            this.points.setPoint(2, new Point(this.points.getPoint(0).x + SELF_MESSAGE_WIDTH, this.points.getPoint(0).y + SELF_MESSAGE_HEIGHT));
            if ((toActivation !== null) && toActivation.visible) {
                this.points.setPoint(3, new Point(this.activation.getRight(), this.points.getPoint(0).y + SELF_MESSAGE_HEIGHT));
            } else {
                this.points.setPoint(3, new Point(this.tail.getRight(), this.points.getPoint(0).y + SELF_MESSAGE_HEIGHT));
            }
        // (2) in case of left-to-right directed message
        } else if (this.points.getPoint(1).x > this.points.getPoint(0).x) {
            this._fixPointCount(2, this.points.getPoint(0).x, this.points.getPoint(0).y);
            if ((fromActivation !== null) && fromActivation.visible) {
                this.points.setPoint(0, new Point(fromActivation.getRight(), this.points.getPoint(0).y));
            } else {
                this.points.setPoint(0, new Point(fromLifeline.getRight(), this.points.getPoint(0).y));
            }
            if ((toActivation !== null) && toActivation.visible) {
                this.points.setPoint(1, new Point(this.activation.left, this.points.getPoint(0).y));
            } else {
                this.points.setPoint(1, new Point(this.head.left, this.points.getPoint(0).y));
            }
        // (3) in case of right-to-left direced message
        } else {
            this._fixPointCount(2, this.points.getPoint(0).x, this.points.getPoint(0).y);
            if ((fromActivation !== null) && fromActivation.visible) {
                this.points.setPoint(0, new Point(fromActivation.left, this.points.getPoint(0).y));
            } else {
                this.points.setPoint(0, new Point(fromLifeline.left, this.points.getPoint(0).y));
            }
            if ((toActivation !== null) && toActivation.visible) {
                this.points.setPoint(1, new Point(this.activation.getRight(), this.points.getPoint(0).y));
            } else {
                this.points.setPoint(1, new Point(this.head.getRight(), this.points.getPoint(0).y));
            }
        }
        this.update();
    };

    UMLSeqMessageView.prototype.drawObject = function (canvas) {
        EdgeView.prototype.drawObject.call(this, canvas);
        if (this.model.messageSort === UML.MS_DELETEMESSAGE) {
            var lifeline = this.head,
                bottom   = lifeline.getBottom(),
                center   = (lifeline.left + lifeline.getRight()) / 2;
            canvas.line(center - 10, bottom - 10, center + 10, bottom + 10);
            canvas.line(center + 10, bottom - 10, center - 10, bottom + 10);
        }
    };

    /**
     *
     */
    UMLSeqMessageView.prototype.initialize = function (canvas, x1, y1, x2, y2) {
        this.lineStyle = Core.LS_RECTILINEAR;
        if (this.head != this.tail) {
            this.points.clear();
            this.points.add(new Point(this.tail.getRight(), y1));
            this.points.add(new Point(this.head.left, y2));
        } else { // Self Message
            this.points.clear();
            this.points.add(new Point(x1, y1));
            this.points.add(new Point(x1, y1));
            this.points.add(new Point(x1, y1));
            this.points.add(new Point(x1, y1));
        }
    };

    /**
     * Cannot be copied to clipboard.
     */
    UMLSeqMessageView.prototype.canCopy = function () {
        return false;
    };

    /**
     * Cannnot be deleted view only.
     */
    UMLSeqMessageView.prototype.canDelete = function () {
        return false;
    };

    /**
     * Determine where it can be connected to
     */
    UMLSeqMessageView.prototype.canConnectTo = function (view, isTail) {
        return (view.model && view.model instanceof type.UMLMessageEndpoint);
    };

    /**
     * UMLStateInvariantView
     * @constructor
     * @extends NodeView
     */
    function UMLStateInvariantView() {
        NodeView.apply(this, arguments);
        this.movable = Core.MM_VERT;
        this.zIndex = 1;

        /** @member {LabelView} */
        this.invariantLabel = new LabelView();
        this.invariantLabel.horizontalAlignment = Graphics.AL_CENTER;
        this.invariantLabel.verticalAlignment = Graphics.AL_MIDDLE;
        this.addSubView(this.invariantLabel);
    }
    // inherits from NodeView
    UMLStateInvariantView.prototype = Object.create(NodeView.prototype);
    UMLStateInvariantView.prototype.constructor = UMLStateInvariantView;

    UMLStateInvariantView.prototype.update = function (canvas) {
        NodeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.invariantLabel.text = "{" + this.model.invariant + "}";
        }
    };

    UMLStateInvariantView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = Math.max(this.invariantLabel.minWidth, STATEINVARIANT_MINWIDTH);
        this.minHeight = Math.max(this.invariantLabel.minHeight, STATEINVARIANT_MINHEIGHT);
        this.sizeConstraints();
    };

    UMLStateInvariantView.prototype.arrangeObject = function (canvas) {
        NodeView.prototype.arrangeObject.call(this, canvas);
        if (this._parent instanceof UMLSeqLifelineView) {
            this.left = this._parent.linePart.left - (this.width / 2);
        }
        this.invariantLabel.top  = this.top + (this.height - this.invariantLabel.height) / 2;
        this.invariantLabel.left  = this.left + (this.width - this.invariantLabel.width) / 2;
    };

    UMLStateInvariantView.prototype.drawObject = function (canvas) {
        canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND);
        canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND);
        NodeView.prototype.drawObject.call(this, canvas);
    };

    /**
     * Cannot be copied to clipboard.
     */
    UMLStateInvariantView.prototype.canCopy = function () {
        return false;
    };

    /**
     * Cannnot be deleted view only.
     */
    UMLStateInvariantView.prototype.canDelete = function () {
        return false;
    };


    /**
     * UMLContinuationView
     * @constructor
     * @extends NodeView
     */
    function UMLContinuationView() {
        NodeView.apply(this, arguments);
        this.zIndex = 1;

        /** @member {LabelView} */
        this.nameLabel = new LabelView();
        this.nameLabel.horizontalAlignment = Graphics.AL_CENTER;
        this.nameLabel.verticalAlignment = Graphics.AL_MIDDLE;
        this.addSubView(this.nameLabel);
    }
    // inherits from NodeView
    UMLContinuationView.prototype = Object.create(NodeView.prototype);
    UMLContinuationView.prototype.constructor = UMLContinuationView;

    UMLContinuationView.prototype.update = function (canvas) {
        NodeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameLabel.text = this.model.name;
        }
    };

    UMLContinuationView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = Math.max(this.nameLabel.minWidth, CONTINUATION_MINWIDTH);
        this.minHeight = Math.max(this.nameLabel.minHeight, CONTINUATION_MINHEIGHT);
        this.sizeConstraints();
    };

    UMLContinuationView.prototype.arrangeObject = function (canvas) {
        NodeView.prototype.arrangeObject.call(this, canvas);
        this.nameLabel.top  = this.top + (this.height - this.nameLabel.height) / 2;
        this.nameLabel.left  = this.left + (this.width - this.nameLabel.width) / 2;
    };

    UMLContinuationView.prototype.drawObject = function (canvas) {
        canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND);
        canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND);
        NodeView.prototype.drawObject.call(this, canvas);
    };

    /**
     * Cannot be copied to clipboard.
     */
    UMLContinuationView.prototype.canCopy = function () {
        return false;
    };

    /**
     * Cannnot be deleted view only.
     */
    UMLContinuationView.prototype.canDelete = function () {
        return false;
    };


    /**
     * UMLCustomFrameView
     * @constructor
     * @extends NodeView
     */
    function UMLCustomFrameView() {
        NodeView.apply(this, arguments);

        /** @member {LabelView} */
        this.nameLabel = new LabelView();
        this.nameLabel.parentStyle = true;
        this.addSubView(this.nameLabel);

        /** @member {LabelView} */
        this.frameTypeLabel = new LabelView();
        this.frameTypeLabel.parentStyle = true;
        this.addSubView(this.frameTypeLabel);
    }
    // inherits from NodeView
    UMLCustomFrameView.prototype = Object.create(NodeView.prototype);
    UMLCustomFrameView.prototype.constructor = UMLCustomFrameView;

    UMLCustomFrameView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        var h = Math.max(this.frameTypeLabel.minHeight, this.nameLabel.minHeight) + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING;
        this.minHeight = Math.max(h + FRAME_CONTENT_MINHEIGHT, FRAME_MINHEIGHT);
        var w = this.frameTypeLabel.minWidth + this.nameLabel.minWidth;
        if (this.frameTypeLabel.visible && this.frameTypeLabel.visible) {
            w = w + LABEL_INTERVAL;
        }
        w = w + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING + h / 2;
        this.minWidth = Math.max(w + FRAME_CONTENT_MINWIDTH, FRAME_MINWIDTH);
        this.sizeConstraints();
    };

    UMLCustomFrameView.prototype.arrangeObject = function (canvas) {
        NodeView.prototype.arrangeObject.call(this, canvas);
        this.frameTypeLabel.font.style = Graphics.FS_BOLD;
        this.frameTypeLabel.left = this.left + COMPARTMENT_LEFT_PADDING;
        this.frameTypeLabel.top = this.top + COMPARTMENT_TOP_PADDING;
        this.frameTypeLabel.setRight(this.frameTypeLabel.left + this.frameTypeLabel.minWidth);
        if (this.frameTypeLabel.visible) {
            this.nameLabel.left = this.frameTypeLabel.getRight() + LABEL_INTERVAL * 2;
        } else {
            this.nameLabel.left = this.left + COMPARTMENT_LEFT_PADDING;
        }
        this.nameLabel.top = this.top + COMPARTMENT_TOP_PADDING;
        this.nameLabel.setRight(this.nameLabel.left + this.nameLabel.minWidth);
    };

    UMLCustomFrameView.prototype.drawObject = function (canvas) {
        NodeView.prototype.drawObject.call(this, canvas);
        var y = Math.max(this.frameTypeLabel.getBottom(), this.nameLabel.getBottom()) + COMPARTMENT_BOTTOM_PADDING,
            h = y - this.top,
            x = this.nameLabel.getRight() + COMPARTMENT_RIGHT_PADDING + h / 2;
        canvas.polyline([new Point(this.left, this.top), new Point(this.getRight(), this.top), new Point(this.getRight(), this.getBottom()), new Point(this.left, this.getBottom()), new Point(this.left, this.top)]);
        canvas.fillPolygon([new Point(this.left, this.top), new Point(this.left, y), new Point(x - h / 2, y), new Point(x, this.top + h / 2), new Point(x, this.top), new Point(this.left, this.top)]);
        canvas.polygon([new Point(this.left, this.top), new Point(this.left, y), new Point(x - h / 2, y), new Point(x, this.top + h / 2), new Point(x, this.top), new Point(this.left, this.top)]);
    };


    /**
     * UMLFrameView
     * @constructor
     * @extends UMLCustomFrameView
     */
    function UMLFrameView() {
        UMLCustomFrameView.apply(this, arguments);
        this.zIndex = -1;
    }
    // inherits from UMLCustomFrameView
    UMLFrameView.prototype = Object.create(UMLCustomFrameView.prototype);
    UMLFrameView.prototype.constructor = UMLFrameView;

    UMLFrameView.prototype.update = function (canvas) {
        UMLCustomFrameView.prototype.update.call(this, canvas);
        if (this.model) {
            // frame kind
            if (this.model instanceof type.UMLClass || this.model instanceof type.UMLClassDiagram) {
                this.frameTypeLabel.text = "class";
            } else if (this.model instanceof type.UMLComponent || this.model instanceof type.UMLComponentDiagram) {
                this.frameTypeLabel.text = "component";
            } else if (this.model instanceof type.UMLDeploymentDiagram) {
                this.frameTypeLabel.text = "deployment";
            } else if (this.model instanceof type.UMLInteraction || this.model instanceof type.UMLSequenceDiagram || this.model instanceof type.UMLCommunicationDiagram) {
                this.frameTypeLabel.text = "interaction";
            } else if (this.model instanceof type.UMLStateMachine || this.model instanceof type.UMLStatechartDiagram) {
                this.frameTypeLabel.text = "state machine";
            } else if (this.model instanceof type.UMLActivity || this.model instanceof type.UMLActivityDiagram) {
                this.frameTypeLabel.text = "activity";
            } else if (this.model instanceof type.UMLUseCase || this.model instanceof type.UMLUseCaseDiagram) {
                this.frameTypeLabel.text = "use case";
            } else if (this.model instanceof type.UMLPackage || this.model instanceof type.UMLPackageDiagram) {
                this.frameTypeLabel.text = "package";
            }
            // name
            if (this.model.name.length > 0) {
                this.nameLabel.text = this.model.name;
            }
        }
    };


    /**
     * UMLInteractionOperandView
     * @constructor
     * @extends NodeView
     */
    function UMLInteractionOperandView() {
        NodeView.apply(this, arguments);
        this.selectable = Core.SK_YES;
        this.movable = Core.MM_NONE;
        this.sizable = Core.SZ_VERT;
        this.parentStyle = true;
        this.minHeight = 15;
        this.height = 30;

        /** @member {LabelView} */
        this.guardLabel = new LabelView();
        this.addSubView(this.guardLabel);
    }
    // inherits from LabelView
    UMLInteractionOperandView.prototype = Object.create(NodeView.prototype);
    UMLInteractionOperandView.prototype.constructor = UMLInteractionOperandView;

    UMLInteractionOperandView.prototype._isTopOperandView = function () {
        var result = true;
        if (this._parent !== null) {
            for (var i = 0, len = this._parent.subViews.length; i < len; i++) {
                var v = this._parent.subViews[i];
                if ((v instanceof UMLInteractionOperandView) && (v !== this)) {
                    if (v.top < this.top) {
                        result = false;
                        return result;
                    }
                }
            }
        }
        return result;
    };

    UMLInteractionOperandView.prototype.update = function (canvas) {
        NodeView.prototype.update.call(this, canvas);
        if (this._parent) {
            this.visible = this._parent.visible;
        }
        if (this.model) {
            if (hasValue(this.model.guard)) {
                this.guardLabel.text = '[' + this.model.guard + ']';
            } else {
                this.guardLabel.text = '';
            }
            this.guardLabel.visible = (this.guardLabel.text.length > 0);
        }
    };

    UMLInteractionOperandView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        this.minWidth = Math.max(this.guardLabel.minWidth + INTERACTIONOPERAND_GUARD_HORZ_MARGIN * 2, INTERACTIONOPERAND_MINWIDTH);
        this.minHeight = Math.max(this.guardLabel.minHeight + INTERACTIONOPERAND_GUARD_VERT_MARGIN * 2, INTERACTIONOPERAND_MINHEIGHT);
    };

    UMLInteractionOperandView.prototype.arrangeObject = function (canvas) {
        NodeView.prototype.arrangeObject.call(this, canvas);
        this.guardLabel.left = this.left + INTERACTIONOPERAND_GUARD_HORZ_MARGIN;
        this.guardLabel.top = this.top + INTERACTIONOPERAND_GUARD_VERT_MARGIN;
        this.guardLabel.width = this.guardLabel.minWidth;
        this.guardLabel.height = this.guardLabel.minHeight;
    };

    UMLInteractionOperandView.prototype.drawObject = function (canvas) {
        NodeView.prototype.drawObject.call(this, canvas);
        if (!this._isTopOperandView()) {
            canvas.line(this.left, this.top, this.getRight(), this.top, [10,3]);
        }
    };

    /**
     * Cannot be copied to clipboard.
     */
    UMLInteractionOperandView.prototype.canCopy = function () {
        return false;
    };

    /**
     * Cannnot be deleted view only.
     */
    UMLInteractionOperandView.prototype.canDelete = function () {
        return false;
    };


    /**
     * UMLInteractionOperandCompartmentView
     * @constructor
     * @extends UMLCompartmentView
     */
    function UMLInteractionOperandCompartmentView() {
        UMLCompartmentView.apply(this, arguments);
        this.minHeight = 15;

        /* temporal */
        this._leftPadding   = 0;
        this._rightPadding  = 0;
        this._topPadding    = 0;
        this._bottomPadding = 0;
        this._itemInterval  = 0;
    }
    // inherits from UMLCompartmentView
    UMLInteractionOperandCompartmentView.prototype = Object.create(UMLCompartmentView.prototype);
    UMLInteractionOperandCompartmentView.prototype.constructor = UMLInteractionOperandCompartmentView;

    UMLInteractionOperandCompartmentView.prototype.update = function (canvas) {
        if (this.model.operands) {
            var tempViews = this.subViews;
            this.subViews = [];
            for (var i = 0, len = this.model.operands.length; i < len; i++) {
                var operand = this.model.operands[i];
                var operandView = _.find(tempViews, function (v) { return v.model == operand; });
                if (!operandView) {
                    operandView = new UMLInteractionOperandView();
                    operandView.model = operand;
                    operandView._parent = this;
                    operandView._parent = this;
                    // UMLInteractionOperandView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
                    Repository.bypassInsert(this, 'subViews', operandView);
                } else {
                    this.addSubView(operandView);
                }
                operandView.setup(canvas);
            }
        }
        UMLCompartmentView.prototype.update.call(this, canvas);
    };


    /**
     * UMLCombinedFragmentView
     * @constructor
     * @extends UMLCustomFrameView
     */
    function UMLCombinedFragmentView() {
        UMLCustomFrameView.apply(this, arguments);

        /** @member {UMLInteractionOperandCompartmentView} */
        this.operandCompartment = new UMLInteractionOperandCompartmentView();
        this.operandCompartment.parentStyle = true;
        this.addSubView(this.operandCompartment);
    }
    // inherits from UMLCustomFrameView
    UMLCombinedFragmentView.prototype = Object.create(UMLCustomFrameView.prototype);
    UMLCombinedFragmentView.prototype.constructor = UMLCombinedFragmentView;

    UMLCombinedFragmentView.prototype._carryOnOperandViews = function () {
        if (this.subViews.length > 0) {
            var i, len, interOpViews = [];
            for(i = 0, len = this.subViews.length; i < len; i++) {
                if (this.subViews[i] instanceof UMLInteractionOperandView) {
                    interOpViews.push(this.subViews[i]);
                }
            }
            if (interOpViews.length > 0) {
                _.sortBy(interOpViews, function (view) { return view.top; });
                var firstIOV = interOpViews[0];
                firstIOV.top = Math.max(this.frameTypeLabel.getBottom(), this.nameLabel.getBottom()) + COMPARTMENT_BOTTOM_PADDING;
                for (i = 1; i <= (interOpViews.length - 1); i++) {
                    interOpViews[i].top = interOpViews[i - 1].getBottom();
                }
                var lastIOV = interOpViews[interOpViews.length - 1];
                lastIOV.setBottom(this.getBottom());
                this.minHeight = lastIOV.top + lastIOV.minHeight - this.top;
            }
        }
    };

    UMLCombinedFragmentView.prototype.update = function (canvas) {
        if (this.operandCompartment.model !== this.model) {
            // operandCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            Repository.bypassFieldAssign(this.operandCompartment, 'model', this.model);
        }
        if (this.model) {
            this.nameLabel.text = this.model.name;
            this.frameTypeLabel.text = this.model.interactionOperator;
            this.nameLabel.visible = (this.nameLabel.text.length > 0);
            this.frameTypeLabel.visible = (this.frameTypeLabel.text.length > 0);
            if (this.model.operands && this.model.operands.length > 0) {
                this.operandCompartment.visible = true;
            } else {
                this.operandCompartment.visible = false;
            }
        }
        UMLCustomFrameView.prototype.update.call(this, canvas);
    };

    UMLCombinedFragmentView.prototype.sizeObject = function (canvas) {
        UMLCustomFrameView.prototype.sizeObject.call(this, canvas);
        if (this.operandCompartment.visible) {
            var h = Math.max(this.frameTypeLabel.height, this.nameLabel.height) + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING;
            this.minHeight = h + this.operandCompartment.height;
        }
    };


    UMLCombinedFragmentView.prototype.arrangeObject = function (canvas) {
        UMLCustomFrameView.prototype.arrangeObject.call(this, canvas);
        if (this.operandCompartment.visible) {
            var h = Math.max(this.frameTypeLabel.height, this.nameLabel.height) + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING;
            this.operandCompartment.left = this.left;
            this.operandCompartment.top = this.top + h;
            this.operandCompartment.width = this.width;
            this.operandCompartment.height = this.height - h;
            this.operandCompartment.arrange(canvas);
        }
    };

    /**
     * Cannot be copied to clipboard.
     */
    UMLCombinedFragmentView.prototype.canCopy = function () {
        return false;
    };

    /**
     * Cannnot be deleted view only.
     */
    UMLCombinedFragmentView.prototype.canDelete = function () {
        return false;
    };


    /**
     * UMLInteractionUseView
     * @constructor
     * @extends NodeView
     */
    function UMLInteractionUseView() {
        NodeView.apply(this, arguments);
        this.zIndex = 1;

        /** @member {LabelView} */
        this.nameLabel = new LabelView();
        this.addSubView(this.nameLabel);

        /** @member {LabelView} */
        this.frameTypeLabel = new LabelView();
        this.frameTypeLabel.font.style = Graphics.FS_BOLD;
        this.addSubView(this.frameTypeLabel);
    }
    // inherits from NodeView
    UMLInteractionUseView.prototype = Object.create(NodeView.prototype);
    UMLInteractionUseView.prototype.constructor = UMLInteractionUseView;

    UMLInteractionUseView.prototype.update = function (canvas) {
        NodeView.prototype.update.call(this, canvas);
        this.frameTypeLabel.text = 'ref';
        if (this.model) {
            var s = "";
            if (this.model.returnValueRecipient) {
                s += this.model.returnValueRecipient.name + " = ";
            }
            if (this.model.refersTo) {
                s += this.model.refersTo.name;
            }
            if (this.model.arguments.length > 0) {
                s += "(" + this.model.arguments + ")";
            }
            if (this.model.returnValue.length > 0) {
                s += ": " + this.model.returnValue;
            }
            this.nameLabel.text = s;
        }
    };

    UMLInteractionUseView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        var h = this.frameTypeLabel.minHeight + this.nameLabel.minHeight + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING;
        this.minHeight = Math.max(h, FRAME_MINHEIGHT);
        var w = Math.max(this.frameTypeLabel.width, this.nameLabel.width);
        w = w + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING;
        this.minWidth = Math.max(w, FRAME_MINWIDTH);
        this.sizeConstraints();
    };

    UMLInteractionUseView.prototype.arrangeObject = function (canvas) {
        NodeView.prototype.arrangeObject.call(this, canvas);
        this.frameTypeLabel.left = this.left + COMPARTMENT_LEFT_PADDING;
        this.frameTypeLabel.top = this.top + COMPARTMENT_TOP_PADDING;
        this.frameTypeLabel.setRight(this.frameTypeLabel.left + this.frameTypeLabel.minWidth);
        this.nameLabel.top = this.top + (this.height - this.nameLabel.height) / 2;
        this.nameLabel.left = this.left + (this.width - this.nameLabel.width) / 2;
    };

    UMLInteractionUseView.prototype.drawObject = function (canvas) {
        NodeView.prototype.drawObject.call(this, canvas);
        var y = this.frameTypeLabel.getBottom() + COMPARTMENT_BOTTOM_PADDING,
            h = y - this.top,
            x = this.frameTypeLabel.getRight() + COMPARTMENT_RIGHT_PADDING + h / 2;
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.polygon([new Point(this.left, this.top), new Point(this.left, y), new Point(x - h / 2, y), new Point(x, this.top + h / 2), new Point(x, this.top), new Point(this.left, this.top)]);
    };

    /**
     * Cannot be copied to clipboard.
     */
    UMLInteractionUseView.prototype.canCopy = function () {
        return false;
    };

    /**
     * Cannnot be deleted view only.
     */
    UMLInteractionUseView.prototype.canDelete = function () {
        return false;
    };


    /**************************************************************************
     *                                                                        *
     *                       COMMUNICATION DIAGRAM VIEWS                      *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLCommunicationDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLCommunicationDiagram() {
        UMLDiagram.apply(this, arguments);
        this.showSequenceNumber = true;
        this.showSignature = true;
    }
    // inherits from UMLDiagram
    UMLCommunicationDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLCommunicationDiagram.prototype.constructor = UMLCommunicationDiagram;

    UMLCommunicationDiagram.prototype.canAcceptModel = function (model) {
        if (model instanceof type.Hyperlink || model instanceof type.Diagram) {
            return true;
        } else if (model instanceof type.UMLLifeline) {
            return _.every(this.ownedViews, function (v) { return v.model !== model; });
        } else if (model instanceof type.UMLMessage) {
            return _.some(this.ownedViews, function (v) { return v.model === model.source; }) &&
                   _.some(this.ownedViews, function (v) { return v.model === model.target; }) &&
                   _.every(this.ownedViews, function (v) { return v.model !== model; });
        } else {
            return (model instanceof type.UMLConstraint) ||
                   (model instanceof type.UMLClassifier);
        }
    };

    /**
     * UMLCommLifelineView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLCommLifelineView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("uml.lifeline.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLCommLifelineView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLCommLifelineView.prototype.constructor = UMLCommLifelineView;

    UMLCommLifelineView.prototype.update = function (canvas) {
        UMLGeneralNodeView.prototype.update.call(this, canvas);
        if (this.model) {
            this.nameCompartment.nameLabel.text = this.model.getString(this);
            this.nameCompartment.nameLabel.underline = false;
        }
    };

    UMLCommLifelineView.prototype.drawIcon = function (canvas, rect) {
        if (this.model) {
            if (this.model.stereotype && this.model.stereotype.icon) {
                UMLGeneralNodeView.prototype.drawIcon.call(this, canvas, rect);
            } else if (this.model.represent && (this.model.represent.type instanceof type.Model)) {
                var iconRatioBackup = this.iconRatio;
                if (this.model.represent.type instanceof type.UMLActor) {
                    this.iconRatio = ACTOR_RATIO_PERCENT;
                    this.arrangeObject(canvas);
                    UMLActorView.prototype.drawIcon.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type instanceof type.UMLUseCase) {
                    this.iconRatio = USECASE_RATIO_PERCENT;
                    this.arrangeObject(canvas);
                    UMLUseCaseView.prototype.drawIcon.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type instanceof type.UMLInterface) {
                    this.iconRatio = 100;
                    this.arrangeObject(canvas);
                    UMLInterfaceView.prototype.drawBallNotation.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type instanceof type.UMLArtifact) {
                    this.iconRatio = ARTIFACT_RATIO_PERCENT;
                    this.arrangeObject(canvas);
                    UMLArtifactViewMixin.drawIcon.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type instanceof type.UMLComponent) {
                    this.iconRatio = COMPONENT_RATIO_PERCENT;
                    this.arrangeObject(canvas);
                    UMLComponentViewMixin.drawIcon.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type instanceof type.UMLNode) {
                    this.iconRatio = NODE_RATIO_PERCENT;
                    this.arrangeObject(canvas);
                    UMLNodeViewMixin.drawIcon.call(this, canvas, this.iconRect);
                } else if (this.model.represent.type.stereotype && this.model.represent.type.stereotype.icon) {
                    drawImage(canvas, rect, this.model.represent.type.stereotype.icon);
                } else {
                    UMLGeneralNodeView.prototype.drawIcon.call(this, canvas, rect);
                }
                this.iconRatio = iconRatioBackup;
                this.arrangeObject(canvas);
            } else {
                UMLGeneralNodeView.prototype.drawIcon.call(this, canvas, rect);
            }
        }
    };

    UMLCommLifelineView.prototype.drawAsCanonicalForm = function (canvas, showLabel) {
        UMLGeneralNodeView.prototype.drawAsCanonicalForm.call(this, canvas);
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom());
        if (this.model.isMultiInstance) {
            canvas.rect(r.x1 + MULTI_INSTANCE_MARGIN, r.y1 + MULTI_INSTANCE_MARGIN, r.x2 + MULTI_INSTANCE_MARGIN, r.y2 + MULTI_INSTANCE_MARGIN);
        }
        canvas.fillRect(r.x1, r.y1, r.x2, r.y2);
        canvas.rect(r.x1, r.y1, r.x2, r.y2);
    };

    UMLCommLifelineView.prototype.drawAsDecorationForm = function (canvas) {
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom());
        if (this.model.isMultiInstance) {
            canvas.rect(r.x1 + MULTI_INSTANCE_MARGIN, r.y1 + MULTI_INSTANCE_MARGIN, r.x2 + MULTI_INSTANCE_MARGIN, r.y2 + MULTI_INSTANCE_MARGIN);
        }
        canvas.fillRect(r.x1, r.y1, r.x2, r.y2);
        canvas.rect(r.x1, r.y1, r.x2, r.y2);
        UMLGeneralNodeView.prototype.drawAsDecorationForm.call(this, canvas);
    };

    UMLCommLifelineView.prototype.drawAsIconicForm = function (canvas) {
        UMLGeneralNodeView.prototype.drawAsIconicForm.call(this, canvas);
    };


    /**
     * Cannot be copied to clipboard.
     */
    UMLCommLifelineView.prototype.canCopy = function () {
        return false;
    };

    /**
     * Cannnot be deleted view only.
     */
    UMLCommLifelineView.prototype.canDelete = function () {
        return false;
    };


    /**
     * UMLCommMessageView
     * @constructor
     * @extends EdgeNodeView
     */
    function UMLCommMessageView() {
        EdgeNodeView.apply(this, arguments);
        this.edgePosition = Core.EP_MIDDLE;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_FREE;
        this.alpha = Math.PI / 2;
        this.distance = 10;

        this.headPoint = new Point();
        this.tailPoint = new Point();
        this.arrowPoint1 = new Point();
        this.arrowPoint2 = new Point();

        /** @member {NodeLabelView} */
        this.nameLabel = new NodeLabelView();
        this.nameLabel.distance = 10;
        this.nameLabel.alpha = Math.PI / 2;
        this.addSubView(this.nameLabel);

        /** @member {NodeLabelView} */
        this.stereotypeLabel = new NodeLabelView();
        this.stereotypeLabel.distance = 25;
        this.stereotypeLabel.alpha = Math.PI / 2;
        this.addSubView(this.stereotypeLabel);

        /** @member {NodeLabelView} */
        this.propertyLabel = new NodeLabelView();
        this.propertyLabel.distance = 10;
        this.propertyLabel.alpha = Math.PI / 2;
        this.addSubView(this.propertyLabel);

        /** @member {boolean} */
        this.showProperty = true;

        /** @member {boolean} */
        this.showType = true;
    }
    // inherits from EdgeNodeView
    UMLCommMessageView.prototype = Object.create(EdgeNodeView.prototype);
    UMLCommMessageView.prototype.constructor = UMLCommMessageView;

    UMLCommMessageView.prototype._calcPosition = function (canvas) {
        var midPointIndex = Math.floor(this.hostEdge.points.count() / 2);
        if (this.hostEdge.points.count() % 2 === 0) {
            midPointIndex--;
        }

        var p1 = this.hostEdge.points.getPoint(midPointIndex);
        var p2 = this.hostEdge.points.getPoint(midPointIndex+1);
        var tempP1 = p1.copy();
        var tempP2 = p2.copy();
        if ((this.hostEdge.points.count() % 2) === 0) {
            tempP1.x = Math.floor((tempP1.x + tempP2.x) / 2);
            tempP1.y = Math.floor((tempP1.y + tempP2.y) / 2);
        }

        // Calc Theta of Link
        var tempTh = getTheta(tempP1.x, tempP1.y, tempP2.x, tempP2.y);

        // Calc Head and Tail Points of Message
        var tempMiddleX = (tempP1.x + tempP2.x) / 2;
        var tempMiddleY = (tempP1.y + tempP2.y) / 2;
        var tempX = this.distance * Math.cos(tempTh + this.alpha);
        var tempY = this.distance * Math.sin(tempTh + this.alpha);

        tempMiddleX = tempMiddleX + tempX;
        tempMiddleY = tempMiddleY - tempY;

        tempX = 20 * Math.cos(tempTh);
        tempY = 20 * Math.sin(tempTh);

        tempMiddleX = this.left + Math.abs(tempX);
        tempMiddleY = this.top + Math.abs(tempY);

        var tempHPointX, tempHPointY, tempTPointX, tempTPointY;

        if (this.model.source === this.hostEdge.tail.model) {
            // Forward Stimulus
            tempHPointX = tempMiddleX + tempX;
            tempHPointY = tempMiddleY - tempY;
            tempTPointX = tempMiddleX - tempX;
            tempTPointY = tempMiddleY + tempY;
        } else {
            // Reverse Stimulus
            tempTPointX = tempMiddleX + tempX;
            tempTPointY = tempMiddleY - tempY;
            tempHPointX = tempMiddleX - tempX;
            tempHPointY = tempMiddleY + tempY;
        }

        this.headPoint.x = Math.floor(tempHPointX);
        this.headPoint.y = Math.floor(tempHPointY);
        this.tailPoint.x = Math.floor(tempTPointX);
        this.tailPoint.y = Math.floor(tempTPointY);

        // Calc Arrow Points of Message;
        var rt = new Rect(this.headPoint.x, this.headPoint.y, this.tailPoint.x, this.tailPoint.y);
        var a = rt.y2 - rt.y1;
        var b = (rt.x2 - rt.x1 + 0.00001);
        var th = Math.atan(a / b);
        if (((a < 0) && (b < 0)) || ((a > 0) && (b < 0)) || ((a === 0) && (b < 0))) {
            th = th + Math.PI;
        }
        var th1 = th - Math.PI / 8;
        var th2 = th + Math.PI / 8;
        this.arrowPoint1.x = Math.floor(12 * Math.cos(th1)) + rt.x1;
        this.arrowPoint1.y = Math.floor(12 * Math.sin(th1)) + rt.y1;
        this.arrowPoint2.x = Math.floor(12 * Math.cos(th2)) + rt.x1;
        this.arrowPoint2.y = Math.floor(12 * Math.sin(th2)) + rt.y1;

        // this.left = Math.min(this.headPoint.x, this.tailPoint.x);
        // this.top = Math.min(this.headPoint.y, this.tailPoint.y);
        // this.setRight(Math.max(this.headPoint.x, this.tailPoint.x));
        // this.setBottom(Math.max(this.headPoint.y, this.tailPoint.y));
        this.width = Math.max(this.headPoint.x, this.tailPoint.x) - Math.min(this.headPoint.x, this.tailPoint.x);
        this.height = Math.max(this.headPoint.y, this.tailPoint.y) - Math.min(this.headPoint.y, this.tailPoint.y);
    };

    UMLCommMessageView.prototype.update = function () {
        EdgeNodeView.prototype.update.call(this);
        if (this.model) {
            var options = {
                showSequenceNumber : this.getDiagram().showSequenceNumber,
                showSignature      : this.getDiagram().showSignature,
                showType           : this.showType
            };
            this.nameLabel.text = this.model.getString(options);
            // stereotype
            if (this.model.messageSort === UML.MS_CREATEMESSAGE) {
                this.stereotypeLabel.text = "«create»";
            } else if (this.model.messageSort === UML.MS_DELETEMESSAGE) {
                this.stereotypeLabel.text = "«destroy»";
            } else if (hasValue(this.model.stereotype)) {
                this.stereotypeLabel.text = this.model.getStereotypeString();
            } else {
                this.stereotypeLabel.text = "";
            }
            // propertyLabel
            this.propertyLabel.text = this.model.getPropertyString();
            this.propertyLabel.visible = (this.showProperty ? this.propertyLabel.text.length > 0 : false);
            // nameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.nameLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.nameLabel, 'model', this.model);
            }
            // stereotypeLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.stereotypeLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.stereotypeLabel, 'model', this.model);
            }
            // propertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
            if (this.propertyLabel.model !== this.model) {
                Repository.bypassFieldAssign(this.propertyLabel, 'model', this.model);
            }
        }
    };

    UMLCommMessageView.prototype.containsPoint = function (canvas, x, y) {
        var r = this.getBoundingBox(canvas);
        // Expand selectable area because it is difficult to select UMLCommMessageView when it is not diagonal.
        r.expand(10);
        return Coord.ptInRect(x, y, r);
    };

    UMLCommMessageView.prototype.arrangeObject = function (canvas) {
        EdgeNodeView.prototype.arrangeObject.call(this, canvas);
        var v = this.propertyLabel.visible;
        this.nameLabel.visible = (this.nameLabel.text.length > 0);
        this.stereotypeLabel.visible = (this.stereotypeLabel.text.length > 0);
        this.propertyLabel.visible = (this.propertyLabel.text.length > 0);
        this._calcPosition(canvas);
        // this.width = Math.max(this.headPoint.x, this.tailPoint.x) - Math.min(this.headPoint.x, this.tailPoint.x);
        // this.height = Math.max(this.headPoint.y, this.tailPoint.y) - Math.min(this.headPoint.y, this.tailPoint.y);

        // Reassign distance of this.nameLabel, this.stereotypeLabel
        if (!v && this.propertyLabel.visible) {
            if (this.nameLabel.distance < 25) {
                if (this.stereotypeLabel.distance <= this.nameLabel.distance + 15) {
                    this.stereotypeLabel.distance = this.stereotypeLabel.distance + 15;
                }
                this.nameLabel.distance = this.nameLabel.distance + 15;
            }
        }
        /*
        // Arrange this.nameLabel
        var p1 = this.tailPoint;
        var p2 = this.headPoint;
        var p = Coord.getPointAwayLine(p1, p2, this.nameLabel.alpha, this.nameLabel.distance);
        this.nameLabel.left = (p.x + p1.x) - (this.nameLabel.width / 2);
        this.nameLabel.top = (p.y + p1.y) - (this.nameLabel.height / 2);
        // Arrange this.stereotypeLabel
        p = Coord.getPointAwayLine(p1, p2, this.stereotypeLabel.alpha, this.stereotypeLabel.distance);
        this.stereotypeLabel.left = (p.x + p1.x) - (this.stereotypeLabel.width / 2);
        this.stereotypeLabel.top = (p.y + p1.y) - (this.stereotypeLabel.height / 2);
        // Arrange this.propertyLabel
        p = Coord.getPointAwayLine(p1, p2, this.propertyLabel.alpha, this.propertyLabel.distance);
        this.propertyLabel.left = (p.x + p1.x) - (this.propertyLabel.width / 2);
        this.propertyLabel.top = (p.y + p1.y) - (this.propertyLabel.height / 2);
        */
        // call Update here because Action's changed are not reflected
        this.update();
    };

    UMLCommMessageView.prototype.drawObject = function (canvas) {
        EdgeNodeView.prototype.drawObject.call(this, canvas);
        // message body
        if (this.model.messageSort == UML.MS_REPLY) {
            canvas.line(this.headPoint.x, this.headPoint.y, this.tailPoint.x, this.tailPoint.y, [3]);
        } else {
            canvas.line(this.headPoint.x, this.headPoint.y, this.tailPoint.x, this.tailPoint.y);
        }
        // message head
        if ((this.model.messageSort === UML.MS_ASYNCHCALL) ||
            (this.model.messageSort === UML.MS_ASYNCHSIGNAL) ||
            (this.model.messageSort === UML.MS_CREATEMESSAGE) ||
            (this.model.messageSort === UML.MS_REPLY)) {
            canvas.polyline([this.arrowPoint1, this.headPoint, this.arrowPoint2]);
        } else {
            canvas.fillColor = this.lineColor;
            canvas.fillPolygon([this.arrowPoint1, this.headPoint, this.arrowPoint2]);
            canvas.fillColor = this.fillColor;
        }
    };

    UMLCommMessageView.prototype.drawSelection = function (canvas) {
        Toolkit.drawHighlighter(canvas, this.tailPoint.x, this.tailPoint.y, Toolkit.DEFAULT_HALF_HIGHLIGHTER_SIZE, true, Toolkit.HIGHLIGHTER_COLOR);
        Toolkit.drawHighlighter(canvas, this.headPoint.x, this.headPoint.y, Toolkit.DEFAULT_HALF_HIGHLIGHTER_SIZE, true, Toolkit.HIGHLIGHTER_COLOR);
    };


    /**
     * Cannot be copied to clipboard.
     */
    UMLCommMessageView.prototype.canCopy = function () {
        return false;
    };

    /**
     * Cannnot be deleted view only.
     */
    UMLCommMessageView.prototype.canDelete = function () {
        return false;
    };

    /**************************************************************************
     *                                                                        *
     *                          PROFILE DIAGRAM VIEWS                         *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLProfileDiagram
     * @constructor
     * @extends UMLDiagram
     */
    function UMLProfileDiagram() {
        UMLDiagram.apply(this, arguments);
    }
    // inherits from UMLDiagram
    UMLProfileDiagram.prototype = Object.create(UMLDiagram.prototype);
    UMLProfileDiagram.prototype.constructor = UMLProfileDiagram;

    UMLProfileDiagram.prototype.canAcceptModel = function (model) {
        return (model instanceof type.Hyperlink) ||
               (model instanceof type.Diagram) ||
               (model instanceof type.UMLConstraint) ||
               (model instanceof type.UMLMetaClass) ||
               (model instanceof type.UMLStereotype) ||
               (model instanceof type.UMLGeneralization) ||
               (model instanceof type.UMLDependency) ||
               (model instanceof type.UMLInterfaceRealization) ||
               (model instanceof type.UMLComponentRealization) ||
               (model instanceof type.UMLAssociation);
    };


    /**
     * UMLProfileView
     * @constructor
     * @extends UMLPackageView
     */
    function UMLProfileView() {
        UMLPackageView.apply(this, arguments);
    }
    // inherits from UMLPackageView
    UMLProfileView.prototype = Object.create(UMLPackageView.prototype);
    UMLProfileView.prototype.constructor = UMLProfileView;

    UMLProfileView.prototype.getStereotypeLabelText = function () {
        return "«profile»";
    };


    /**
     * UMLMetaClassView
     * @constructor
     * @extends UMLGeneralNodeView
     */
    function UMLMetaClassView() {
        UMLGeneralNodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("uml.metaclass.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLGeneralNodeView
    UMLMetaClassView.prototype = Object.create(UMLGeneralNodeView.prototype);
    UMLMetaClassView.prototype.constructor = UMLMetaClassView;

    UMLMetaClassView.prototype.getStereotypeLabelText = function () {
        return "«metaClass»";
    };

    /**
     * UMLStereotypeView
     * @constructor
     * @extends UMLClassView
     */
    function UMLStereotypeView() {
        UMLClassView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("uml.stereotype.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
    }
    // inherits from UMLClassView
    UMLStereotypeView.prototype = Object.create(UMLClassView.prototype);
    UMLStereotypeView.prototype.constructor = UMLStereotypeView;

    UMLStereotypeView.prototype.getStereotypeLabelText = function () {
        return "«stereotype»";
    };


    /**
     * UMLExtensionView
     * @constructor
     * @extends UMLGeneralEdgeView
     */
    function UMLExtensionView() {
        UMLGeneralEdgeView.apply(this, arguments);
        this.tailEndStyle = Core.ES_FLAT;
        this.headEndStyle = Core.ES_SOLID_ARROW;
        this.lineMode = Core.LM_SOLID;
    }
    // inherits from UMLGeneralEdgeView
    UMLExtensionView.prototype = Object.create(UMLGeneralEdgeView.prototype);
    UMLExtensionView.prototype.constructor = UMLExtensionView;

    UMLExtensionView.prototype.canConnectTo = function (view, isTail) {
        return (isTail && view.model instanceof type.UMLStereotype) ||
               (!isTail && view.model instanceof type.UMLMetaClass);
    };


    /**************************************************************************
     *                                                                        *
     *                            ANNOTATION VIEWS                            *
     *                                                                        *
     **************************************************************************/

    /**
     * HyperlinkView
     * @constructor
     * @extends NodeView
     */
    function HyperlinkView() {
        NodeView.apply(this, arguments);

        /** @member {LabelView} */
        this.nameLabel = new LabelView();
        this.nameLabel.parentStyle = true;
        this.addSubView(this.nameLabel);

        /** @member {LabelView} */
        this.typeLabel = new LabelView();
        this.typeLabel.parentStyle = true;
        this.addSubView(this.typeLabel);
    }
    // inherits from NodeView
    HyperlinkView.prototype = Object.create(NodeView.prototype);
    HyperlinkView.prototype.constructor = HyperlinkView;

    HyperlinkView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        var h = this.typeLabel.minHeight + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING;
        this.minHeight = Math.max(h, HYPERLINK_MINHEIGHT);
        var w = this.typeLabel.width + this.nameLabel.width + (COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING) * 2;
        this.minWidth = Math.max(w, HYPERLINK_MINWIDTH);
        this.sizeConstraints();
    };

    HyperlinkView.prototype.arrangeObject = function (canvas) {
        NodeView.prototype.arrangeObject.call(this, canvas);
        this.typeLabel.left = this.left + COMPARTMENT_LEFT_PADDING;
        this.typeLabel.top = this.top + COMPARTMENT_TOP_PADDING;
        this.typeLabel.setRight(this.typeLabel.left + this.typeLabel.minWidth);
        this.nameLabel.top = this.top + COMPARTMENT_TOP_PADDING;
        this.nameLabel.left = this.typeLabel.getRight() + COMPARTMENT_RIGHT_PADDING + COMPARTMENT_LEFT_PADDING;
    };

    HyperlinkView.prototype.drawObject = function (canvas) {
        NodeView.prototype.drawObject.call(this, canvas);
        var x = this.typeLabel.getRight() + COMPARTMENT_RIGHT_PADDING;
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.line(x, this.top, x, this.getBottom());
    };

    HyperlinkView.prototype.update = function (canvas) {
        NodeView.prototype.update.call(this, canvas);
        this.typeLabel.font.style = Graphics.FS_BOLD;
        this.typeLabel.text = "link";
        if (this.model && this.model.reference instanceof type.Model) {
            this.nameLabel.text = this.model.reference.name;
        } else {
            this.nameLabel.text = this.model.url;
        }
    };

    /**
     * UMLCustomTextView
     * @constructor
     * @extends NodeView
     */
    function UMLCustomTextView() {
        NodeView.apply(this, arguments);

        /** @member {string} */
        this.text = '';

        /** @member {boolean} */
        this.wordWrap = true;

        /* transient */
        this._rightPadding = 0;
    }
    // inherits from NodeView
    UMLCustomTextView.prototype = Object.create(NodeView.prototype);
    UMLCustomTextView.prototype.constructor = UMLCustomTextView;

    UMLCustomTextView.prototype.sizeObject = function (canvas) {
        var size, marg, minW, minH, w, h;
        var lines = null;
        if (this.text && this.text.length > 0) {
            lines = this.text.split("\n");
        }
        w = 0;
        h = 0;
        if (lines !== null && lines.length > 0) {
            for (var i = 0, len = lines.length; i < len; i++) {
                if (this.wordWrap) {
                    marg = COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING + this._rightPadding;
                    minW = canvas.textExtent(lines[i], 1).x;
                    minH = canvas.textExtent(lines[i], this.width - marg).y;
                    w = Math.max(w, minW);
                    h = h + minH + 2;
                } else {
                    var sz = canvas.textExtent(lines[i]);
                    w = Math.max(w, sz.x);
                    h = h + canvas.textExtent('^_').y + 2;
                }
            }
        }
        w += COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING + this._rightPadding;
        h += COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING;
        this.minWidth = Math.max(CUSTOM_TEXT_MINWIDTH, w);
        this.minHeight = Math.max(CUSTOM_TEXT_MINHEIGHT, h);
        NodeView.prototype.sizeObject.call(this, canvas);
    };

    UMLCustomTextView.prototype.drawObject = function (canvas) {
        NodeView.prototype.drawObject.call(this, canvas);
        if (this.text && this.text.length > 0) {
            var lines = this.text.split("\n");
            var x1 = this.left + COMPARTMENT_LEFT_PADDING,
                x2 = this.getRight() - COMPARTMENT_RIGHT_PADDING,
                y = this.top + COMPARTMENT_TOP_PADDING;
            for (var i = 0, len = lines.length; i < len; i++) {
                var sz = canvas.textExtent(lines[i], this.width - 1);
                var r = new Graphics.Rect(x1, y, x2, y + sz.y + 2);
                canvas.textOut2(r, lines[i], Graphics.AL_LEFT, Graphics.AL_TOP, false, this.wordWrap);
                y = y + sz.y + 2;
            }
        }
    };


    /**
     * UMLTextView
     * @constructor
     * @extends UMLCustomTextView
     */
    function UMLTextView() {
        UMLCustomTextView.apply(this, arguments);
    }
    // inherits from UMLCustomTextView
    UMLTextView.prototype = Object.create(UMLCustomTextView.prototype);
    UMLTextView.prototype.constructor = UMLTextView;


    /**
     * UMLCustomNoteView
     * @constructor
     * @extends UMLCustomTextView
     */
    function UMLCustomNoteView() {
        UMLCustomTextView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("uml.note.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");
        this._rightPadding = NOTE_FOLDING_SIZE;
    }
    // inherits from UMLCustomTextView
    UMLCustomNoteView.prototype = Object.create(UMLCustomTextView.prototype);
    UMLCustomNoteView.prototype.constructor = UMLCustomNoteView;

    UMLCustomNoteView.prototype.drawObject = function (canvas) {
        var r = this.getRight() - 1, b = this.getBottom() - 1;
        var pts = [new Point(this.left, this.top), new Point(r - NOTE_FOLDING_SIZE, this.top),
                   new Point(r, this.top + NOTE_FOLDING_SIZE),
                   new Point(r, b),
                   new Point(this.left, b),
                   new Point(this.left, this.top)];
        canvas.fillPolygon(pts);
        canvas.polygon(pts);
        canvas.polygon([new Point(r - NOTE_FOLDING_SIZE, this.top),
                        new Point(r - NOTE_FOLDING_SIZE, this.top + NOTE_FOLDING_SIZE),
                        new Point(r, this.top + NOTE_FOLDING_SIZE)]);
        UMLCustomTextView.prototype.drawObject.call(this, canvas);
    };


    /**
     * UMLNoteView
     * @constructor
     * @extends UMLCustomNoteView
     */
    function UMLNoteView() {
        UMLCustomNoteView.apply(this, arguments);
    }
    // inherits from UMLCustomNoteView
    UMLNoteView.prototype = Object.create(UMLCustomNoteView.prototype);
    UMLNoteView.prototype.constructor = UMLNoteView;


    /**
     * UMLConstraintView
     * @constructor
     * @extends UMLCustomNoteView
     */
    function UMLConstraintView() {
        UMLCustomNoteView.apply(this, arguments);
    }
    // inherits from UMLCustomNoteView
    UMLConstraintView.prototype = Object.create(UMLCustomNoteView.prototype);
    UMLConstraintView.prototype.constructor = UMLConstraintView;

    UMLConstraintView.prototype.update = function (canvas) {
        if (typeof this.model.specification === "string") {
            this.text = "{" + this.model.specification + "}";
            var parentField = this.model.getParentField();
            switch (parentField) {
            case "preconditions":       this.text = "«precondition»\n" + this.text;       break;
            case "postconditions":      this.text = "«postcondition»\n" + this.text;      break;
            case "bodyConditions":      this.text = "«bodyCondition»\n" + this.text;      break;
            case "localPreconditions":  this.text = "«localPrecondition»\n" + this.text;  break;
            case "localPostconditions": this.text = "«localPostcondition»\n" + this.text; break;
            }
        }
    };


    /**
     * UMLNoteLinkView
     * @constructor
     * @extends EdgeView
     */
    function UMLNoteLinkView() {
        EdgeView.apply(this, arguments);
        this.lineMode = Core.LM_DOT;
    }
    // inherits from EdgeView
    UMLNoteLinkView.prototype = Object.create(EdgeView.prototype);
    UMLNoteLinkView.prototype.constructor = UMLNoteLinkView;


    /**
     * UMLConstraintLinkView
     * @constructor
     * @extends EdgeView
     */
    function UMLConstraintLinkView() {
        EdgeView.apply(this, arguments);
        this.lineMode = Core.LM_DOT;
    }
    // inherits from EdgeView
    UMLConstraintLinkView.prototype = Object.create(EdgeView.prototype);
    UMLConstraintLinkView.prototype.constructor = UMLConstraintLinkView;


    /**
     * ShapeView
     * @constructor
     * @extends NodeView
     */
    function ShapeView() {
        NodeView.apply(this, arguments);
    }
    // inherits from NodeView
    ShapeView.prototype = Object.create(NodeView.prototype);
    ShapeView.prototype.constructor = ShapeView;


    /**
     * RectangleView
     * @constructor
     * @extends ShapeView
     */
    function RectangleView() {
        ShapeView.apply(this, arguments);
    }
    // inherits from ShapeView
    RectangleView.prototype = Object.create(ShapeView.prototype);
    RectangleView.prototype.constructor = RectangleView;

    RectangleView.prototype.drawObject = function (canvas) {
        ShapeView.prototype.drawObject.call(this, canvas);
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
    };


    /**
     * RoundRectView
     * @constructor
     * @extends ShapeView
     */
    function RoundRectView() {
        ShapeView.apply(this, arguments);
    }
    // inherits from ShapeView
    RoundRectView.prototype = Object.create(ShapeView.prototype);
    RoundRectView.prototype.constructor = RoundRectView;

    RoundRectView.prototype.drawObject = function (canvas) {
        ShapeView.prototype.drawObject.call(this, canvas);
        var r = Math.max(this.width, this.height);
        canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), r / 6);
        canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), r / 6);
    };


    /**
     * EllipseView
     * @constructor
     * @extends ShapeView
     */
    function EllipseView() {
        ShapeView.apply(this, arguments);
    }
    // inherits from ShapeView
    EllipseView.prototype = Object.create(ShapeView.prototype);
    EllipseView.prototype.constructor = EllipseView;

    EllipseView.prototype.drawObject = function (canvas) {
        ShapeView.prototype.drawObject.call(this, canvas);
        canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
        canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
    };

    /* -------------------------------------------------------------------------------------------- */

    // Type definitions

    // Common Views
    type.UMLDiagram                           = UMLDiagram;
    type.UMLCompartmentView                   = UMLCompartmentView;
    type.UMLNameCompartmentView               = UMLNameCompartmentView;
    type.UMLAttributeView                     = UMLAttributeView;
    type.UMLAttributeCompartmentView          = UMLAttributeCompartmentView;
    type.UMLOperationView                     = UMLOperationView;
    type.UMLOperationCompartmentView          = UMLOperationCompartmentView;
    type.UMLReceptionView                     = UMLReceptionView;
    type.UMLReceptionCompartmentView          = UMLReceptionCompartmentView;
    type.UMLTemplateParameterView             = UMLTemplateParameterView;
    type.UMLTemplateParameterCompartmentView  = UMLTemplateParameterCompartmentView;
    type.UMLGeneralNodeView                   = UMLGeneralNodeView;
    type.UMLFloatingNodeView                  = UMLFloatingNodeView;
    type.UMLGeneralEdgeView                   = UMLGeneralEdgeView;
    type.UMLClassifierView                    = UMLClassifierView;
    type.UMLUndirectedRelationshipView        = UMLUndirectedRelationshipView;
    // Class Diagram Views
    type.UMLClassDiagram                      = UMLClassDiagram;
    type.UMLClassView                         = UMLClassView;
    type.UMLInterfaceView                     = UMLInterfaceView;
    type.UMLSignalView                        = UMLSignalView;
    type.UMLDataTypeView                      = UMLDataTypeView;
    type.UMLPrimitiveTypeView                 = UMLPrimitiveTypeView;
    type.UMLEnumerationLiteralView            = UMLEnumerationLiteralView;
    type.UMLEnumerationLiteralCompartmentView = UMLEnumerationLiteralCompartmentView;
    type.UMLEnumerationView                   = UMLEnumerationView;
    type.UMLGeneralizationView                = UMLGeneralizationView;
    type.UMLDependencyView                    = UMLDependencyView;
    type.UMLRealizationView                   = UMLRealizationView;
    type.UMLInterfaceRealizationView          = UMLInterfaceRealizationView;
    type.UMLQualifierCompartmentView          = UMLQualifierCompartmentView;
    type.UMLAssociationView                   = UMLAssociationView;
    type.UMLAssociationClassLinkView          = UMLAssociationClassLinkView;
    // Package Diagram Views
    type.UMLPackageDiagram                    = UMLPackageDiagram;
    type.UMLPackageView                       = UMLPackageView;
    type.UMLModelView                         = UMLModelView;
    type.UMLSubsystemView                     = UMLSubsystemView;
    type.UMLContainmentView                   = UMLContainmentView;
    // Composite Structure Diagram Views
    type.UMLCompositeStructureDiagram         = UMLCompositeStructureDiagram;
    type.UMLPortView                          = UMLPortView;
    type.UMLPartView                          = UMLPartView;
    type.UMLConnectorView                     = UMLConnectorView;
    type.UMLCollaborationView                 = UMLCollaborationView;
    type.UMLCollaborationUseView              = UMLCollaborationUseView;
    type.UMLRoleBindingView                   = UMLRoleBindingView;
    // Object Diagram Views
    type.UMLObjectDiagram                     = UMLObjectDiagram;
    type.UMLSlotView                          = UMLSlotView;
    type.UMLSlotCompartmentView               = UMLSlotCompartmentView;
    type.UMLObjectView                        = UMLObjectView;
    type.UMLLinkView                          = UMLLinkView;
    // Component Diagram Views
    type.UMLComponentDiagram                  = UMLComponentDiagram;
    type.UMLArtifactView                      = UMLArtifactView;
    type.UMLArtifactInstanceView              = UMLArtifactInstanceView;
    type.UMLComponentView                     = UMLComponentView;
    type.UMLComponentInstanceView             = UMLComponentInstanceView;
    type.UMLComponentRealizationView          = UMLComponentRealizationView;
    // Deployment Diagram Views
    type.UMLDeploymentDiagram                 = UMLDeploymentDiagram;
    type.UMLNodeView                          = UMLNodeView;
    type.UMLNodeInstanceView                  = UMLNodeInstanceView;
    type.UMLDeploymentView                    = UMLDeploymentView;
    type.UMLCommunicationPathView             = UMLCommunicationPathView;
    // Use Case Diagram Views
    type.UMLUseCaseDiagram                    = UMLUseCaseDiagram;
    type.UMLExtensionPointView                = UMLExtensionPointView;
    type.UMLExtensionPointCompartmentView     = UMLExtensionPointCompartmentView;
    type.UMLUseCaseView                       = UMLUseCaseView;
    type.UMLActorView                         = UMLActorView;
    type.UMLIncludeView                       = UMLIncludeView;
    type.UMLExtendView                        = UMLExtendView;
    type.UMLUseCaseSubjectView                = UMLUseCaseSubjectView;
    // Statechart Diagram Views
    type.UMLStatechartDiagram                 = UMLStatechartDiagram;
    type.UMLPseudostateView                   = UMLPseudostateView;
    type.UMLFinalStateView                    = UMLFinalStateView;
    type.UMLConnectionPointReferenceView      = UMLConnectionPointReferenceView;
    type.UMLInternalActivityView              = UMLInternalActivityView;
    type.UMLInternalActivityCompartmentView   = UMLInternalActivityCompartmentView;
    type.UMLInternalTransitionView            = UMLInternalTransitionView;
    type.UMLInternalTransitionCompartmentView = UMLInternalTransitionCompartmentView;
    type.UMLRegionView                        = UMLRegionView;
    type.UMLDecompositionCompartmentView      = UMLDecompositionCompartmentView;
    type.UMLStateView                         = UMLStateView;
    type.UMLTransitionView                    = UMLTransitionView;
    // Activity Diagram Views
    type.UMLActivityDiagram                   = UMLActivityDiagram;
    type.UMLPinView                           = UMLPinView;
    type.UMLInputPinView                      = UMLInputPinView;
    type.UMLOutputPinView                     = UMLOutputPinView;
    type.UMLExpansionNodeView                 = UMLExpansionNodeView;
    type.UMLActionView                        = UMLActionView;
    type.UMLObjectNodeView                    = UMLObjectNodeView;
    type.UMLCentralBufferNodeView             = UMLCentralBufferNodeView;
    type.UMLDataStoreNodeView                 = UMLDataStoreNodeView;
    type.UMLControlNodeView                   = UMLControlNodeView;
    type.UMLControlFlowView                   = UMLControlFlowView;
    type.UMLObjectFlowView                    = UMLObjectFlowView;
    type.UMLZigZagAdornmentView               = UMLZigZagAdornmentView;
    type.UMLExceptionHandlerView              = UMLExceptionHandlerView;
    type.UMLActivityInterruptView             = UMLActivityInterruptView;
    type.UMLSwimlaneView                      = UMLSwimlaneView;
    type.UMLInterruptibleActivityRegionView   = UMLInterruptibleActivityRegionView;
    type.UMLStructuredActivityNodeView        = UMLStructuredActivityNodeView;
    type.UMLExpansionRegionView               = UMLExpansionRegionView;
    // Sequence Diagram Views
    type.UMLSequenceDiagram                   = UMLSequenceDiagram;
    type.UMLLinePartView                      = UMLLinePartView;
    type.UMLSeqLifelineView                   = UMLSeqLifelineView;
    type.UMLMessageEndpointView               = UMLMessageEndpointView;
    type.UMLEndpointView                      = UMLEndpointView;
    type.UMLGateView                          = UMLGateView;
    type.UMLActivationView                    = UMLActivationView;
    type.UMLSeqMessageView                    = UMLSeqMessageView;
    type.UMLStateInvariantView                = UMLStateInvariantView;
    type.UMLContinuationView                  = UMLContinuationView;
    type.UMLCustomFrameView                   = UMLCustomFrameView;
    type.UMLFrameView                         = UMLFrameView;
    type.UMLInteractionOperandView            = UMLInteractionOperandView;
    type.UMLInteractionOperandCompartmentView = UMLInteractionOperandCompartmentView;
    type.UMLCombinedFragmentView              = UMLCombinedFragmentView;
    type.UMLInteractionUseView                = UMLInteractionUseView;
    // Communication Diagram Views
    type.UMLCommunicationDiagram              = UMLCommunicationDiagram;
    type.UMLCommLifelineView                  = UMLCommLifelineView;
    type.UMLCommMessageView                   = UMLCommMessageView;
    // Profile Diagram Views
    type.UMLProfileDiagram                    = UMLProfileDiagram;
    type.UMLProfileView                       = UMLProfileView;
    type.UMLMetaClassView                     = UMLMetaClassView;
    type.UMLStereotypeView                    = UMLStereotypeView;
    type.UMLExtensionView                     = UMLExtensionView;
    // Annotation Views
    type.HyperlinkView                        = HyperlinkView;
    type.UMLCustomTextView                    = UMLCustomTextView;
    type.UMLTextView                          = UMLTextView;
    type.UMLCustomNoteView                    = UMLCustomNoteView;
    type.UMLNoteView                          = UMLNoteView;
    type.UMLConstraintView                    = UMLConstraintView;
    type.UMLNoteLinkView                      = UMLNoteLinkView;
    type.UMLConstraintLinkView                = UMLConstraintLinkView;
    type.ShapeView                            = ShapeView;
    type.RectangleView                        = RectangleView;
    type.RoundRectView                        = RoundRectView;
    type.EllipseView                          = EllipseView;

});
