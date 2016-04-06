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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true, loopfunc: true */
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

    require("erd/ERD-meta");


    /**
     * ERDElement
     * @constructor
     */
    function ERDElement() {
        type.ExtensibleModel.apply(this, arguments);
    }
    // inherits from ExtensibleModel
    ERDElement.prototype = Object.create(type.ExtensibleModel.prototype);
    ERDElement.prototype.constructor = ERDElement;

    ERDElement.prototype.getDisplayClassName = function () {
        var name = this.getClassName();
        return name.substring(3, name.length);
    };

    /**
     * ERDDataModel
     * @constructor
     */
    function ERDDataModel() {
        ERDElement.apply(this, arguments);
    }
    // inherits from FCModelElement
    ERDDataModel.prototype = Object.create(ERDElement.prototype);
    ERDDataModel.prototype.constructor = ERDDataModel;

    /**
     * ERDDiagram
     * @constructor
     */
    function ERDDiagram() {
        type.Diagram.apply(this, arguments);
    }
    // inherits from Diagram
    ERDDiagram.prototype = Object.create(type.Diagram.prototype);
    ERDDiagram.prototype.constructor = ERDDiagram;

    ERDDiagram.prototype.canAcceptModel = function (model) {
        return (model instanceof type.Hyperlink) ||
               (model instanceof type.Diagram) ||
               (model instanceof type.ERDEntity) ||
               (model instanceof type.ERDRelationship);
    };


    /**
     * ERDColumn
     * @constructor
     */
    function ERDColumn() {
        ERDElement.apply(this, arguments);

        /** @member {string} */
        this.type = '';

        /** @member {string} */
        this.length = '';

        /** @member {boolean} */
        this.primaryKey = false;

        /** @member {boolean} */
        this.foreignKey = false;

        /** @member {ERDColumn} */
        this.referenceTo = null;

        /** @member {boolean} */
        this.nullable = false;

        /** @member {boolean} */
        this.unique = false;
    }
    // inherits from FCModelElement
    ERDColumn.prototype = Object.create(ERDElement.prototype);
    ERDColumn.prototype.constructor = ERDColumn;

    ERDColumn.prototype.getKeyString = function () {
        var _key = this.primaryKey ? "PK" : "";
        if (this.foreignKey) {
            _key += (_key.length > 0) ? ",FK" : "FK";
        }
        if (!this.primaryKey && this.nullable) {
            _key += (_key.length > 0) ? ",N" : "N";
        }
        if (!this.primaryKey && this.unique) {
            _key += (_key.length > 0) ? ",U" : "U";
        }
        return _key;
    };

    ERDColumn.prototype.getNameString = function () {
        return this.name;
    };

    ERDColumn.prototype.getTypeString = function () {
        var _type = '';
        if (this.type && this.type.length > 0) {
            _type += this.type;
        }
        if (this.length || (_.isString(this.length) && this.length.length > 0)) {
            _type += "(" + this.length + ")";
        }
        return _type;
    };

    ERDColumn.prototype.getString = function () {
        return this.getKeyString() + " " + this.name + ": " + this.type;
    };

    /**
     * ERDEntity
     * @constructor
     */
    function ERDEntity() {
        ERDElement.apply(this, arguments);

        /** @member {Array.<ERDColumn>} */
        this.columns = [];
    }
    // inherits from FCModelElement
    ERDEntity.prototype = Object.create(ERDElement.prototype);
    ERDEntity.prototype.constructor = ERDEntity;

    /**
     * Get all relationships
     * @return {Array.<ERDRelationship>}
     */
    ERDEntity.prototype.getRelationships = function () {
        var rels = Repository.getRelationshipsOf(this, function (r) { return (r instanceof type.ERDRelationship); });
        return rels;
    };

    /**
     * Get all relationship ends linked to this element or counterpart
     * @param {boolean} counterpart Returns whether counterpart (opposite-side) relationship ends or not.
     * @return {Array.<ERDRelationshipEnd>}
     */
    ERDEntity.prototype.getRelationshipEnds = function (counterpart) {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) { return (r instanceof type.ERDRelationship); }),
            ends = _.map(rels, function (r) {
                if (counterpart === true) {
                    return (r.end1.reference === self ? r.end2 : r.end1);
                } else {
                    return (r.end1.reference === self ? r.end1 : r.end2);
                }
            });
        return ends;
    };

    /**
     * ERDRelationshipEnd
     * @constructor
     */
    function ERDRelationshipEnd() {
        type.RelationshipEnd.apply(this, arguments);

        /** @member {string} */
        this.cardinality = '1';
    }
    // inherits from RelationshipEnd
    ERDRelationshipEnd.prototype = Object.create(type.RelationshipEnd.prototype);
    ERDRelationshipEnd.prototype.constructor = ERDRelationshipEnd;


    /**
     * ERDRelationship
     * @constructor
     */
    function ERDRelationship() {
        type.UndirectedRelationship.apply(this, arguments);

        /** @member {boolean} */
        this.identifying = true;

        /** @member {ERDRelationshipEnd} */
        this.end1 = new ERDRelationshipEnd();
        this.end1._parent = this;

        /** @member {ERDRelationshipEnd} */
        this.end2 = new ERDRelationshipEnd();
        this.end2._parent = this;
    }
    // inherits from UndirectedRelationship
    ERDRelationship.prototype = Object.create(type.UndirectedRelationship.prototype);
    ERDRelationship.prototype.constructor = ERDRelationship;

    /**************************************************************************
     *                                                                        *
     *                              VIEW ELEMENTS                             *
     *                                                                        *
     **************************************************************************/

    var SHADOW_OFFSET = 7,
        SHADOW_ALPHA = 0.2,
        SHADOW_COLOR = Graphics.Color.LIGHT_GRAY;

    var COMPARTMENT_ITEM_INTERVAL = 2,
        COMPARTMENT_LEFT_PADDING = 5,
        COMPARTMENT_RIGHT_PADDING = 5,
        COMPARTMENT_TOP_PADDING = 5,
        COMPARTMENT_BOTTOM_PADDING = 5;

    /**
     * ERDColumnView
     * @constructor
     * @extends LabelView
     */
    function ERDColumnView() {
        type.LabelView.apply(this, arguments);
        this.horizontalAlignment = Graphics.AL_LEFT;
        this.selectable = Core.SK_YES;
        this.sizable = Core.SZ_NONE;
        this.movable = Core.MM_NONE;
        this.parentStyle = true;

        this._nameOffset = 0;
        this._typeOffset = 0;
        this._width      = 0;
    }
    // inherits from LabelView
    ERDColumnView.prototype = Object.create(type.LabelView.prototype);
    ERDColumnView.prototype.constructor = ERDColumnView;

    ERDColumnView.prototype.update = function (canvas) {
        type.LabelView.prototype.update.call(this, canvas);
    };

    ERDColumnView.prototype.size = function (canvas) {
        type.LabelView.prototype.size.call(this, canvas);
        this.minWidth = this._width;
        this.height = this.minHeight;
    };

    ERDColumnView.prototype.draw = function (canvas) {
        this.assignStyleToCanvas(canvas);
        if (this.model) {
            canvas.textOut(this.left, this.top, this.model.getKeyString());
            canvas.textOut(this.left + this._nameOffset + COMPARTMENT_LEFT_PADDING, this.top, this.model.getNameString());
            canvas.textOut(this.left + this._typeOffset + COMPARTMENT_LEFT_PADDING, this.top, this.model.getTypeString());
        }
        type.View.prototype.draw.call(this, canvas);
    };

    /**
     * ERDColumnCompartmentView
     * @constructor
     * @extends NodeView
     */
    function ERDColumnCompartmentView() {
        type.NodeView.apply(this, arguments);
        this.selectable = Core.SK_PROPAGATE;
        this.parentStyle = true;

        this._nameOffset = 0;
        this._typeOffset = 0;
    }
    // inherits from NodeView
    ERDColumnCompartmentView.prototype = Object.create(type.NodeView.prototype);
    ERDColumnCompartmentView.prototype.constructor = ERDColumnCompartmentView;

    ERDColumnCompartmentView.prototype.update = function (canvas) {
        if (this.model.columns) {
            var i, len, tempViews = this.subViews;
            this.subViews = [];
            for (i = 0, len = this.model.columns.length; i < len; i++) {
                var column = this.model.columns[i];
                var columnView = _.find(tempViews, function (v) { return v.model === column; });
                if (!columnView) {
                    columnView = new ERDColumnView();
                    columnView.model = column;
                    columnView._parent = this;
                    // Insert columnView to subViewsby bypass command.
                    Repository.bypassInsert(this, 'subViews', columnView);
                } else {
                    this.addSubView(columnView);
                }
                columnView.setup(canvas);
            }
        }
        type.NodeView.prototype.update.call(this, canvas);
    };


    ERDColumnCompartmentView.prototype.size = function (canvas) {
        var i,
            len,
            item,
            _keyWidth = 0,
            _nameWidth = 0,
            _typeWidth = 0;

        // Compute min-width of key, name, and type column
        var _key, _name, _type;
        for (i = 0, len = this.subViews.length; i < len; i++) {
            item = this.subViews[i];
            if (item.visible && item.model) {
                _key  = canvas.textExtent(item.model.getKeyString()).x;
                _name = canvas.textExtent(item.model.getNameString()).x;
                _type = canvas.textExtent(item.model.getTypeString()).x;
                _keyWidth  = Math.max(_keyWidth, _key);
                _nameWidth = Math.max(_nameWidth, _name);
                _typeWidth = Math.max(_typeWidth, _type);
            }
        }
        this._nameOffset = _keyWidth + COMPARTMENT_RIGHT_PADDING;
        this._typeOffset = this._nameOffset + COMPARTMENT_LEFT_PADDING + _nameWidth + COMPARTMENT_RIGHT_PADDING;

        // Compute size
        var w = 0,
            h = 0;
        for (i = 0, len = this.subViews.length; i < len; i++) {
            item = this.subViews[i];
            item._nameOffset = this._nameOffset;
            item._typeOffset = this._typeOffset;
            item._width      = this._typeOffset + COMPARTMENT_LEFT_PADDING + _typeWidth;
            if (item.parentStyle) {
                item.font.size = item._parent.font.size;
            }
            item.size(canvas);
            if (item.visible) {
                if (w < item.minWidth) {
                    w = item.minWidth;
                }
                if (i > 0) {
                    h += COMPARTMENT_ITEM_INTERVAL;
                }
                h += item.minHeight;
            }
        }
        this.minWidth = w + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING;
        this.minHeight = h + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING;
        this.sizeConstraints();
    };

    ERDColumnCompartmentView.prototype.arrange = function (canvas) {
        var i,
            len,
            item,
            _keyWidth = 0,
            _nameWidth = 0,
            _typeWidth = 0;

        // Compute min-width of key, name, and type column
        var _key, _name, _type;
        for (i = 0, len = this.subViews.length; i < len; i++) {
            item = this.subViews[i];
            if (item.visible && item.model) {
                _key  = canvas.textExtent(item.model.getKeyString()).x;
                _name = canvas.textExtent(item.model.getNameString()).x;
                _type = canvas.textExtent(item.model.getTypeString()).x;
                _keyWidth  = Math.max(_keyWidth, _key);
                _nameWidth = Math.max(_nameWidth, _name);
                _typeWidth = Math.max(_typeWidth, _type);
            }
        }

        var h = COMPARTMENT_TOP_PADDING;
        for (i = 0, len = this.subViews.length; i < len; i++) {
            item = this.subViews[i];
            if (item.visible) {
                if (i > 0) { h += COMPARTMENT_ITEM_INTERVAL; }
                item.left = this.left + COMPARTMENT_LEFT_PADDING;
                item.top = this.top + h;
                item.width = this.width - COMPARTMENT_LEFT_PADDING - COMPARTMENT_RIGHT_PADDING;
                h += item.height;
            }
            item.arrange(canvas);
        }
        h += COMPARTMENT_BOTTOM_PADDING;
        this.height = h;
        this.sizeConstraints();
    };

    /**
     * ERDEntityView
     * @constructor
     */
    function ERDEntityView() {
        type.NodeView.apply(this, arguments);
        this.fillColor = PreferenceManager.get("erd.entity.fillColor", "#ffffff") || PreferenceManager.get("view.fillColor", "#ffffff");

        /** @member {LabelView} */
        this.nameLabel = new type.LabelView();
        this.nameLabel.horizontalAlignment = Graphics.AL_CENTER;
        this.nameLabel.parentStyle = true;
        this.addSubView(this.nameLabel);

        /** @member {ERDColumnCompartmentView} */
        this.columnCompartment = new ERDColumnCompartmentView();
        this.columnCompartment.parentStyle = true;
        this.addSubView(this.columnCompartment);
    }
    // inherits from NodeView
    ERDEntityView.prototype = Object.create(type.NodeView.prototype);
    ERDEntityView.prototype.constructor = ERDEntityView;

    ERDEntityView.prototype.update = function (canvas) {
        // Assign this.model to columnCompartment.model by bypass command.
        if (this.columnCompartment.model !== this.model) {
            Repository.bypassFieldAssign(this.columnCompartment, 'model', this.model);
        }
        if (this.model) {
            this.nameLabel.text = this.model.name;
            this.nameLabel.font.style = Graphics.FS_BOLD;
        }
        type.NodeView.prototype.update.call(this, canvas);
    };

    ERDEntityView.prototype.sizeObject = function (canvas) {
        type.NodeView.prototype.sizeObject.call(this, canvas);
        var _h = 0, _w = 0;
        _h += COMPARTMENT_TOP_PADDING + this.nameLabel.minHeight + COMPARTMENT_BOTTOM_PADDING;
        _h += this.columnCompartment.minHeight;
        _w = Math.max(this.nameLabel.minWidth + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING, this.columnCompartment.minWidth);
        this.minHeight = _h;
        this.minWidth = _w;
    };

    ERDEntityView.prototype.arrangeObject = function (canvas) {
        var _y = this.top + COMPARTMENT_TOP_PADDING;
        this.nameLabel.top = _y;
        this.nameLabel.left = this.left;
        this.nameLabel.width = this.width;
        this.nameLabel.height = this.nameLabel.minHeight;
        _y += this.nameLabel.height + COMPARTMENT_BOTTOM_PADDING;
        this.columnCompartment.top = _y;
        this.columnCompartment.left = this.left;
        this.columnCompartment.width = this.width;
        type.NodeView.prototype.arrangeObject.call(this, canvas);
    };

    ERDEntityView.prototype.drawShadow = function (canvas) {
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

    ERDEntityView.prototype.drawObject = function (canvas) {
        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
        if (this.columnCompartment.subViews.length > 0) {
            canvas.line(this.left, this.columnCompartment.top, this.getRight(), this.columnCompartment.top);
            var _x1 = this.left + COMPARTMENT_LEFT_PADDING + this.columnCompartment._nameOffset,
                _x2 = this.left + COMPARTMENT_LEFT_PADDING + this.columnCompartment._typeOffset;
            canvas.line(_x1, this.columnCompartment.top, _x1, this.getBottom());
            canvas.line(_x2, this.columnCompartment.top, _x2, this.getBottom());
        }
        type.NodeView.prototype.drawObject.call(this, canvas);
    };

    /**
     * ERDRelationshipView
     * @constructor
     * @extends EdgeView
     */
    function ERDRelationshipView() {
        type.EdgeView.apply(this, arguments);
        this.lineStyle = PreferenceManager.get("erd.relationship.lineStyle", Core.LS_ROUNDRECT) || PreferenceManager.get("view.lineStyle", Core.LS_OBLIQUE);

        this.headEndStyle = Core.ES_CROWFOOT_ONE;
        this.tailEndStyle = Core.ES_CROWFOOT_ONE;

        /** @member {EdgeLabelView} */
        this.nameLabel = new type.EdgeLabelView();
        this.nameLabel.hostEdge = this;
        this.nameLabel.edgePosition = Core.EP_MIDDLE;
        this.nameLabel.distance = 15;
        this.nameLabel.alpha = Math.PI / 2;
        this.addSubView(this.nameLabel);

        /** @member {EdgeLabelView} */
        this.tailNameLabel = new type.EdgeLabelView();
        this.tailNameLabel.hostEdge = this;
        this.tailNameLabel.edgePosition = Core.EP_TAIL;
        this.tailNameLabel.alpha = Math.PI / 6;
        this.tailNameLabel.distance = 30;
        this.addSubView(this.tailNameLabel);

        /** @member {EdgeLabelView} */
        this.headNameLabel = new type.EdgeLabelView();
        this.headNameLabel.hostEdge = this;
        this.headNameLabel.edgePosition = Core.EP_HEAD;
        this.headNameLabel.alpha = -Math.PI / 6;
        this.headNameLabel.distance = 30;
        this.addSubView(this.headNameLabel);
    }
    // inherits from EdgeView
    ERDRelationshipView.prototype = Object.create(type.EdgeView.prototype);
    ERDRelationshipView.prototype.constructor = ERDRelationshipView;

    ERDRelationshipView.prototype.update = function (canvas) {
        if (this.model) {
            this.nameLabel.visible = (this.model.name.length > 0);
            this.nameLabel.text = this.model.name;
            if (this.model.end1) {
                this.tailNameLabel.text = this.model.end1.name;
                switch (this.model.end1.cardinality) {
                case "0..1":
                    this.tailEndStyle = Core.ES_CROWFOOT_ZERO_ONE;
                    break;
                case "1":
                    this.tailEndStyle = Core.ES_CROWFOOT_ONE;
                    break;
                case "0..*":
                    this.tailEndStyle = Core.ES_CROWFOOT_ZERO_MANY;
                    break;
                case "1..*":
                    this.tailEndStyle = Core.ES_CROWFOOT_MANY;
                    break;
                default:
                    this.tailEndStyle = Core.ES_CROWFOOT_ONE;
                }
            }
            if (this.model.end2) {
                this.headNameLabel.text = this.model.end2.name;
                switch (this.model.end2.cardinality) {
                case "0..1":
                    this.headEndStyle = Core.ES_CROWFOOT_ZERO_ONE;
                    break;
                case "1":
                    this.headEndStyle = Core.ES_CROWFOOT_ONE;
                    break;
                case "0..*":
                    this.headEndStyle = Core.ES_CROWFOOT_ZERO_MANY;
                    break;
                case "1..*":
                    this.headEndStyle = Core.ES_CROWFOOT_MANY;
                    break;
                default:
                    this.headEndStyle = Core.ES_CROWFOOT_ONE;
                }
            }
            if (this.model.identifying) {
                this.lineMode = Core.LM_SOLID;
            } else {
                this.lineMode = Core.LM_DOT;
            }
        }
        type.EdgeView.prototype.update.call(this, canvas);
    };


    /* ************************** Type definitions ***************************/

    type.ERDElement         = ERDElement;
    type.ERDDataModel       = ERDDataModel;
    type.ERDDiagram         = ERDDiagram;
    type.ERDColumn          = ERDColumn;
    type.ERDEntity          = ERDEntity;
    type.ERDRelationshipEnd = ERDRelationshipEnd;
    type.ERDRelationship    = ERDRelationship;

    type.ERDColumnView            = ERDColumnView;
    type.ERDColumnCompartmentView = ERDColumnCompartmentView;
    type.ERDEntityView            = ERDEntityView;
    type.ERDRelationshipView      = ERDRelationshipView;

});
