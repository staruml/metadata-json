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


/*
 * Meta Class Definition
 * - kind: 'class', 'enum', or 'datatype'
 * - super? : super meta class
 * - attributes : []
 * - constraints : {
 *     allowedParents: [ {type: 'UMLClassifier', field: 'ownedElements' }, ... ]
 *     correspondViews: [ {diagram: 'UMLClassDiagram', viewType: 'UMLClass' }, ... ]
 *   }
 *
 * Meta Attribute Definition
 * - name: 속성의 이름
 * - kind: 속성의 종류 (ATTR_KIND_*)
 * - type: 속성의 타입 (String등의 기본 타입에서 다른 클래스명) Allowed Primitive Types = String | Boolean | Integer | Real
 * - default: 속성의 기본 값 (optional)
 * - visible: 속성의 가시성 (PropertyEditor에 보일것인가를 결정) (optional)
 * - readOnly: 읽기전용 속성 (PropertyEditor에서 사용자에 의해 편집 불가) (optional)
 * - transient: 속성이 저장될것인가 (e.g. View's selected 속성은 저장되면 안됨) (optional)
 */

/**
 * Core module
 * Meta Class Definition
 * - super? : super meta class
 * - attributes : []
 * - constraints : {
 *     allowedParents: [ {type: 'UMLClassifier', field: 'ownedElements' }, ... ]
 *     correspondViews: [ {diagram: 'UMLClassDiagram', viewType: 'UMLClass' }, ... ]
 *   }
 *
 * 메타 속성의 정의
 * - name: 속성의 이름
 * - kind: 속성의 종류 (ATTR_KIND_*)
 * - type: 속성의 타입 (String등의 기본 타입에서 다른 클래스명)
 * - default: 속성의 기본 값 (optional)
 * - visible: 속성의 가시성 (PropertyEditor에 보일것인가를 결정) (optional)
 * - readOnly: 읽기전용 속성 (PropertyEditor에서 사용자에 의해 편집 불가) (optional)
 * - transient: 속성이 저장될것인가 (e.g. View's selected 속성은 저장되면 안됨) (optional)
 * @exports core/Core
 */

/**
 * NOTE:
 * Requires graphlib and dagre as global variables, which are used only in Diagram.layout().
 * If not exists, Diagram.layout() will not work with no errors.
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true, loopfunc: true */
/*global define, _, type, graphlib, dagre */

/**
 * Core classes is defined in this module. We don't recommend to instantiate
 *   instance of classes defined in this module in your extension.
 *
 * (This module is not well documented)
 */
define(function (require, exports, module) {
    "use strict";

    var _global           = require("core/Global").global,
        IdGenerator       = require("core/IdGenerator"),
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
        MetaModelManager  = require("core/MetaModelManager"),
        PreferenceManager = require("core/PreferenceManager");

    /**
     * Attribute Kind
     * @const {string}
     */
    var ATTR_KIND_PRIM   = 'prim',
        ATTR_KIND_ENUM   = 'enum',
        ATTR_KIND_REF    = 'ref',
        ATTR_KIND_REFS   = 'refs',
        ATTR_KIND_OBJ    = 'obj',
        ATTR_KIND_OBJS   = 'objs',
        ATTR_KIND_VAR    = 'var',
        ATTR_KIND_CUSTOM = 'custom';

    /**
     * Selectable Kind
     * @enum {number}
     */
    var SK_NO        = 0,
        SK_YES       = 1,
        SK_PROPAGATE = 2;

    /**
     * Sizing Mode
     * @enum {number}
     */
    var SZ_NONE  = 0,
        SZ_HORZ  = 1,
        SZ_VERT  = 2,
        SZ_RATIO = 3,
        SZ_FREE  = 4;

    /**
     * Move Mode
     * @enum {number}
     */
    var MM_NONE = 0,
        MM_HORZ = 1,
        MM_VERT = 2,
        MM_FREE = 3;

    /**
     * Line Mode
     * @enum {number}
     */
    var LM_SOLID = 0,
        LM_DOT   = 1;

    /**
     * Line Style
     * @enum {number}
     */
    var LS_RECTILINEAR = 0,
        LS_OBLIQUE     = 1,
        LS_ROUNDRECT   = 2,
        LS_CURVE       = 3;

    /**
     * Line End Style
     * @enum {number}
     */
    var ES_FLAT                 = 0,
        ES_STICK_ARROW          = 1,
        ES_SOLID_ARROW          = 2,
        ES_TRIANGLE             = 3,
        ES_FILLED_TRIANGLE      = 4,
        ES_DIAMOND              = 5,
        ES_FILLED_DIAMOND       = 6,
        ES_ARROW_DIAMOND        = 7,
        ES_ARROW_FILLED_DIAMOND = 8,
        ES_PLUS                 = 9,
        ES_CIRCLE               = 10,
        ES_CIRCLE_PLUS          = 11,
        ES_CROWFOOT_ONE         = 12,
        ES_CROWFOOT_MANY        = 13,
        ES_CROWFOOT_ZERO_ONE    = 14,
        ES_CROWFOOT_ZERO_MANY   = 15;

    /**
     * Edge Position
     * @enum {number}
     */
    var EP_HEAD   = 0,
        EP_MIDDLE = 1,
        EP_TAIL   = 2;

    /**
     * Direction Kind
     * @enum {number}
     */
    var DK_HORZ = 0,
        DK_VERT = 1;


    /**
     * Diagram Layout Direction
     */
    var DIRECTION_TB = "TB",
        DIRECTION_BT = "BT",
        DIRECTION_LR = "LR",
        DIRECTION_RL = "RL";


    /**
     * Constants for Layout
     */
    var LAYOUT_MARGIN_LEFT = 20,
        LAYOUT_MARGIN_TOP  = 20,
        NODE_SEPARATION    = 30,
        EDGE_SEPARATION    = 30,
        RANK_SEPARATION    = 30;

    /**
     * TagKind
     * @enum
     */
    var TK_STRING    = 'string',
        TK_REFERENCE = 'reference',
        TK_BOOLEAN   = 'boolean',
        TK_NUMBER    = 'number',
        TK_HIDDEN    = 'hidden';

    /**
     * Element
     * @constructor
     */
    function Element() {

        /**
         * gloly unique identifier
         * @member {string}
         */
        this._id = IdGenerator.generateGuid();

        /**
         * reference to its parent
         * @member {object}
         */
        this._parent = null;
    }

    /**
     * Return class name for display (e.g. "Class" rather than "UMLClass").
     * @return {string}
     */
    Element.prototype.getDisplayClassName = function () {
        return this.getClassName();
    };

    /**
     * Return Class. (equivalent to `type[element.getClassName()])`
     *
     * @return {constructor}
     */
    Element.prototype.getClass = function () {
        return _global.type[this.constructor.name];
    };

    /**
     * Return Class name.
     *
     * @return {string}
     */
    Element.prototype.getClassName = function () {
        return this.constructor.name;
    };

    /**
     * Return Meta Class.
     *
     * @return {Object}
     */
    Element.prototype.getMetaClass = function () {
        return _global.meta[this.constructor.name];
    };

    /**
     * Return Meta Attributes.
     *
     * @return {Array.<{name:string, kind:string, type:string}>}
     */
    Element.prototype.getMetaAttributes = function () {
        return MetaModelManager.getMetaAttributes(this.getClassName());
    };

    /**
     * Return name of parent's field containing this object.
     *
     * @return {string} Field name (e.g. 'ownedElements')
     */
    Element.prototype.getParentField = function () {
        if (this._parent) {
            for (var field in this._parent) {
                var value = this._parent[field];
                if (_.isArray(value)) {
                    if (_.contains(value, this)) { return field; }
                } else if (_.isObject(value)) {
                    if (value === this) { return field; }
                }
            }
            return null;
        }
        return null;
    };

    /**
     * Return CSS class name of icon for this object. (Shown in Explorer)
     *
     * @return {string} - iconClass명 (e.g. 'icon-UMLClass')
     */
    Element.prototype.getNodeIcon = function () {
        return "icon-" + this.getClassName();
    };

    /**
     * Return textual string for this object. (Shown in Explorer)
     *
     * @return {string} Text (e.g. '<<stereotype>>Class1')
     */
    Element.prototype.getNodeText = function () {
        if (this.name && this.name.length > 0) {
            return this.name;
        } else {
            return "(" + this.getDisplayClassName() + ")";
        }
    };

    /**
     * Return ordering priority number. (Lower value comes first in Explorer)
     *
     * @param {number} index
     * @return {Number}
     */
    Element.prototype.getOrdering = function (index) {
        var base      = 100000,
            ordering  = 0,
            metaClass = this.getMetaClass();
        if (metaClass && metaClass.ordering) {
            ordering = metaClass.ordering * base;
        }
        if (_.isNumber(index)) {
            ordering = ordering + index;
        }
        return ordering;
    };

    /**
     * Return all child nodes to be shown in Explorer.
     *
     * @param {boolean} sort
     * @return {Array.<Element>}
     */
    Element.prototype.getChildNodes = function (sort) {
        var children = [];
        var self = this;

        function push(elem) {
            if (elem instanceof Model) {
                children.push(elem);
            }
        }

        _.forEach(this.getMetaAttributes(), function (attr) {
            switch (attr.kind) {
            case ATTR_KIND_OBJ:
                if (self[attr.name]) {
                    push(self[attr.name]);
                }
                break;
            case ATTR_KIND_OBJS:
                var items = self[attr.name];
                if (items && items.length > 0) {
                    _.forEach(items, function (item) {
                        push(item);
                    });
                }
                break;
            }
        });

        if (sort) {
            children = _.sortBy(children, function (child, idx) {
                return child.getOrdering(idx);
            });
        }

        return children;
    };


    /**
     * Return all children.
     *
     * @return {Array.<Element>}
     */
    Element.prototype.getChildren = function () {
        var children = [];
        var self = this;
        _.forEach(this.getMetaAttributes(), function (attr) {
            switch (attr.kind) {
            case ATTR_KIND_OBJ:
                if (self[attr.name]) {
                    children.push(self[attr.name]);
                }
                break;
            case ATTR_KIND_OBJS:
                var items = self[attr.name];
                if (items && items.length > 0) {
                    _.forEach(items, function (item) {
                        children.push(item);
                    });
                }
                break;
            }
        });
        return children;
    };

    /**
     * Traverse all nodes in the tree structure. (Breadth-First Traversal)
     *
     * @param {function(elem:Element)} fun
     */
    Element.prototype.traverse = function (fun) {
        fun(this);
        var attrs = this.getMetaAttributes();
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            if (this[attr.name] !== null) {
                switch (attr.kind) {
                case ATTR_KIND_OBJ:
                    this[attr.name].traverse(fun);
                    break;
                case ATTR_KIND_OBJS:
                    for (var j = 0, len1 = this[attr.name].length; j < len1; j++) {
                        var obj = this[attr.name][j];
                        obj.traverse(fun);
                    }
                    break;
                }
            }
        }
    };

    /**
     * Traverse all nodes in the tree structure. (Depth-First Traversal)
     *
     * @param {function(elem:Element)} fun
     */
    Element.prototype.traverseDepthFirst = function (fun) {
        var attrs = this.getMetaAttributes();
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            if (this[attr.name] !== null) {
                switch (attr.kind) {
                case ATTR_KIND_OBJ:
                    this[attr.name].traverseDepthFirst(fun);
                    break;
                case ATTR_KIND_OBJS:
                    for (var j = 0, len1 = this[attr.name].length; j < len1; j++) {
                        var obj = this[attr.name][j];
                        obj.traverseDepthFirst(fun);
                    }
                    break;
                }
            }
        }
        fun(this);
    };

    /**
     * Traverse a specific field chains. (Breadth-First Traversal)
     *
     * @param {string} field Field name to traverse (e.g. 'ownedElements')
     * @param {function} fun
     */
    Element.prototype.traverseField = function (field, fun) {
        fun(this);
        var ref = this[field];
        for (var i = 0, len = ref.length; i < len; i++) {
            var v = ref[i];
            v.traverseField(field, fun);
        }
    };

    /**
     * Traverse a specific field chains. (Depth-First Traversal)
     *
     * @param {string} field Field name to traverse (e.g. 'ownedElements')
     * @param {function} fun
     */
    Element.prototype.traverseFieldDepthFirst = function (field, fun) {
        var ref = this[field];
        for (var i = 0, len = ref.length; i < len; i++) {
            var v = ref[i];
            v.traverseFieldDepthFirst(field, fun);
        }
        fun(this);
    };

    /**
     * Traverse up along with the `_parent` chain.
     * @param {function} fun
     */
    Element.prototype.traverseUp = function (fun) {
        fun(this);
        if (this._parent) {
            this._parent.traverseUp(fun);
        }
    };

    /**
     * Read it's state data from Reader.
     *
     * @param {Reader} reader
     */
    Element.prototype.load = function (reader) {
        var attrs = this.getMetaAttributes();
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i], val;
            switch (attr.kind) {
            case ATTR_KIND_PRIM:
                val = reader.read(attr.name);
                if (typeof val !== "undefined") {
                    this[attr.name] = val;
                }
                break;
            case ATTR_KIND_ENUM:
                val = reader.read(attr.name);
                if (typeof val !== "undefined") {
                    this[attr.name] = val;
                }
                break;
            case ATTR_KIND_REF:
                val = reader.readRef(attr.name);
                var prevRef = this[attr.name];
                if (typeof val !== "undefined") {
                    // Remove previous embedded reference
                    if (prevRef && attr.embedded) {
                        if (Array.isArray(this[attr.embedded])) {
                            this[attr.embedded].remove(prevRef);
                        }
                    }
                    // Assign new reference
                    this[attr.name] = val;
                } else {
                    // Register previous embedded reference
                    if (prevRef && attr.embedded) {
                        reader.idMap[prevRef._id] = prevRef;
                    }
                }
                break;
            case ATTR_KIND_REFS:
                val = reader.readRefArray(attr.name);
                if (typeof val !== "undefined") {
                    this[attr.name] = val;
                }
                break;
            case ATTR_KIND_OBJ:
                val = reader.readObj(attr.name);
                if (typeof val !== "undefined") {
                    this[attr.name] = val;
                }
                break;
            case ATTR_KIND_OBJS:
                val = reader.readObjArray(attr.name);
                if (!Array.isArray(this[attr.name])) {
                    this[attr.name] = [];
                }
                // Append loaded objects to the existing array
                if (Array.isArray(val)) {
                    for (var j = 0; j < val.length; j++) {
                        this[attr.name].push(val[j]);
                    }
                }
                break;
            case ATTR_KIND_VAR:
                val = reader.readVariant(attr.name);
                if (typeof val !== "undefined") {
                    this[attr.name] = val;
                }
                break;
            case ATTR_KIND_CUSTOM:
                val = reader.readCustom(attr.type, attr.name);
                if (typeof val !== "undefined") {
                    this[attr.name] = val;
                }
                break;
            default:
                void 0;
            }
        }
    };

    /**
     * Write it's state data to writer.
     *
     * @param {Writer} writer
     */
    Element.prototype.save = function (writer) {
        writer.write('_type', this.getClassName());
        var attrs = this.getMetaAttributes();
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            if (typeof this[attr.name] !== "undefined" && attr.transient !== true) {
                switch (attr.kind) {
                case ATTR_KIND_PRIM:
                    switch (attr.type) {
                    case "String":
                        if (this[attr.name] !== "" && this[attr.name] !== null) {
                            writer.write(attr.name, this[attr.name]);
                        }
                        break;
                    case "Integer":
                    case "Real":
                        writer.write(attr.name, this[attr.name]);
                        break;
                    case "Boolean":
                        writer.write(attr.name, this[attr.name]);
                        break;
                    default:
                        writer.write(attr.name, this[attr.name]);
                        break;
                    }
                    break;
                case ATTR_KIND_ENUM:
                    writer.write(attr.name, this[attr.name]);
                    break;
                case ATTR_KIND_REF:
                    if (this[attr.name] !== null) {
                        writer.writeRef(attr.name, this[attr.name]);
                    }
                    break;
                case ATTR_KIND_REFS:
                    if (_.isArray(this[attr.name]) && this[attr.name].length > 0) {
                        writer.writeRefArray(attr.name, this[attr.name]);
                    }
                    break;
                case ATTR_KIND_OBJ:
                    if (this[attr.name] !== null) {
                        writer.writeObj(attr.name, this[attr.name]);
                    }
                    break;
                case ATTR_KIND_OBJS:
                    if (_.isArray(this[attr.name]) && this[attr.name].length > 0) {
                        writer.writeObjArray(attr.name, this[attr.name]);
                    }
                    break;
                case ATTR_KIND_VAR:
                    if (this[attr.name] !== null) {
                        writer.writeVariant(attr.name, this[attr.name]);
                    }
                    break;
                case ATTR_KIND_CUSTOM:
                    if (this[attr.name] !== null) {
                        writer.writeCustom(attr.name, this[attr.name]);
                    }
                    break;
                }
            }
        }
    };

    /**
     * Store it's state data to memento
     *
     * @param {object} memento
     */
    Element.prototype.assignTo = function (memento) {
        var attrs = this.getMetaAttributes();
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            if (this[attr.name] !== null) {
                switch (attr.kind) {
                case ATTR_KIND_PRIM:
                    memento[attr.name] = this[attr.name];
                    break;
                case ATTR_KIND_ENUM:
                    memento[attr.name] = this[attr.name];
                    break;
                case ATTR_KIND_CUSTOM:
                    memento[attr.name] = this[attr.name].__write();
                    break;
                }
            }
        }
    };

    /**
     * Load it's state data from memento
     *
     * @param {object} memento
     */
    Element.prototype.assignFrom = function (memento) {
        var attrs = this.getMetaAttributes();
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            switch (attr.kind) {
            case ATTR_KIND_PRIM:
                this[attr.name] = memento[attr.name];
                break;
            case ATTR_KIND_ENUM:
                this[attr.name] = memento[attr.name];
                break;
            case ATTR_KIND_CUSTOM:
                if (this[attr.name] !== null) {
                    this[attr.name].__read(memento[attr.name]);
                }
                break;
            }
        }
    };

    /**
     * Return differences between it's state data and data stored in memento.
     *
     * @param {object} memento
     * @return {Array.<{elem:Element, f:string, n:?, o:?}>} `{f: Field name, n: New value, o: Old value}`
     */
    Element.prototype.diff = function (memento) {
        var diffs = [];
        var attrs = this.getMetaAttributes();
        var newVal = null, oldVal = null;
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            if (this[attr.name] !== null) {
                switch (attr.kind) {
                case ATTR_KIND_PRIM:
                    newVal = this[attr.name];
                    oldVal = memento[attr.name];
                    if (newVal !== oldVal) {
                        diffs.push({
                            elem: this,
                            f: attr.name,
                            n: newVal,
                            o: oldVal
                        });
                    }
                    break;
                case ATTR_KIND_ENUM:
                    newVal = this[attr.name];
                    oldVal = memento[attr.name];
                    if (newVal !== oldVal) {
                        diffs.push({
                            elem: this,
                            f: attr.name,
                            n: newVal,
                            o: oldVal
                        });
                    }
                    break;
                case ATTR_KIND_CUSTOM:
                    newVal = this[attr.name].__write();
                    oldVal = memento[attr.name];
                    if (newVal !== oldVal) {
                        diffs.push({
                            elem: this,
                            f: attr.name,
                            n: newVal,
                            o: oldVal
                        });
                    }
                }
            }
        }
        return diffs;
    };

    /**
     * Find an element by name. Find through `ownedElements` chain, and then lookup through `_parent` chain.
     *
     * @param {string} name
     * @param {constructor} typeFilter
     * @param {Element} namespace Lookup only inside of namespace
     * @return {Element} Return the first matched element.
     */
    Element.prototype.lookup = function (name, typeFilter, namespace) {
        var children = this.getChildren();
        for (var i = 0, len = children.length; i < len; i++) {
            var elem = children[i];
            if (typeFilter) {
                if ((elem instanceof typeFilter) && (elem.name === name)) {
                    return elem;
                }
            } else {
                if (elem.name === name) {
                    return elem;
                }
            }
        }
        if (this !== namespace && this._parent !== null) {
            return this._parent.lookup(name, typeFilter, namespace);
        }
        return null;
    };

    /**
     * Find by name in child elements
     *
     * @param {string | Array.<string>} name
     * @return {Element}
     */
    Element.prototype.findByName = function (name) {
        var children = this.getChildren();
        for (var i = 0, len = children.length; i < len; i++) {
            var elem = children[i];
            if (elem.name === name) {
                return elem;
            }
        }
        return null;
    };

    /**
     * Look down an element along parent-children chains.
     *
     * @param {Array.<string>} pathName
     * @return {Element}
     */
    Element.prototype.lookdown = function (pathName) {
        if (_.isArray(pathName) && pathName.length > 0) {
            var elem = this.findByName(pathName[0]);
            if (pathName.length === 1) {
                return elem;
            } else if (elem) {
                return elem.lookdown(_.rest(pathName));
            }
        }
        return null;
    };

    /**
     * Return true only if a given elem is one of the container.
     *
     * @param {Element} elem
     * @return {boolean}
     */
    Element.prototype.isOneOfTheContainers = function(elem) {
        if ((this._parent === null) || (elem === this)) {
            return false;
        } else if (elem === this._parent) {
            return true;
        } else {
            return this._parent.isOneOfTheContainers(elem);
        }
    };

    /**
     * Return true only if it can contain the kind of elements
     *
     * @param {string} kind
     * @return {Boolean}
     */
    Element.prototype.canContainKind = function(kind) {
        var attrs = this.getMetaAttributes();
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            if (attr.kind === ATTR_KIND_OBJ || attr.kind === ATTR_KIND_OBJS) {
                if (attr.type && _global.meta[kind] && (MetaModelManager.isKindOf(kind, attr.type))) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * Return true only if it can contain a given element.
     *
     * @param {Element} elem
     * @return {Boolean}
     */
    Element.prototype.canContain = function(elem) {
        if (elem !== null) {
            return this.canContainKind(elem.getClassName()) &&
                   (elem !== this) &&
                   (!this.isOneOfTheContainers(elem));
        } else {
            return false;
        }
    };

    /**
     * Return true only if it could be copied.
     * @return {Boolean}
     */
    Element.prototype.canCopy = function () {
        return true;
    };

    /**
     * Return true only if it could be deleted alone.
     * @return {Boolean}
     */
    Element.prototype.canDelete = function () {
        return true;
    };

    /**
     * Return true only if it can accomodate elements in clipboard
     *     based on a given kind and copyContext.
     *
     * @param {string} kind
     * @param {{field:string}} copyContext
     * @return {Boolean}
     */
    Element.prototype.canPaste = function (kind, copyContext) {
        return this.canContainKind(kind) && this[copyContext.field];
    };

    /**
     * Model
     *
     * @constructor
     * @extends Element
     */
    function Model() {
        Element.apply(this, arguments);

        /** @member {string} */
        this.name = "";

        /** @member {Array.<Model>} */
        this.ownedElements = [];
    }

    // inherits from Element
    Model.prototype = Object.create(Element.prototype);
    Model.prototype.constructor = Model;

    /**
     * Get a corresponding view type
     *
     * @return {constructor}
     */
    Model.prototype.getViewType = function () {
        var typeName = MetaModelManager.getViewTypeOf(this.getClassName()),
            ViewType = typeName ? type[typeName] : null;
        return ViewType;
    };

    /**
     * Get path to from a given base
     *
     * @param {Model} base
     * @return {Array.<string>}
     */
    Model.prototype.getPath = function(base) {
        if (this === base) {
            return [];
        } else if (!this._parent) {
            return [this];
        } else if (this._parent) {
            var result = this._parent.getPath(base);
            result.push(this);
            return result;
        }
    };

    /**
     * Return full pathname
     *
     * @return {string}
     */
    Model.prototype.getPathname = function() {
        var _name = this.name;
        if (this._parent && this._parent._parent) {
            return this._parent.getPathname() + "::" + _name;
        } else {
            return _name;
        }
    };

    /**
     * Return true only if it can contain a given element.
     *
     * @override
     * @param {Element} elem
     * @return {Boolean}
     */
    Model.prototype.canContain = function(elem) {
        if (elem !== null) {
            if (elem instanceof Diagram) {
                return this.canContainDiagram(elem);
            } else {
                return this.canContainKind(elem.getClassName()) &&
                       (elem !== this) &&
                       (!this.isOneOfTheContainers(elem));
            }
        } else {
            return false;
        }
    };

    /**
     * Determines whether a given diagram type name can be contained or not.
     *
     * @param {string} kind
     * @return {Boolean}
     */
    Model.prototype.canContainDiagramKind = function (kind) {
        return false;
    };

    /**
     * Determines whether a given diagram can be contained or not.
     *
     * @param {Diagram} diagram
     * @return {Boolean}
     */
    Model.prototype.canContainDiagram = function (diagram) {
        return this.canContainDiagramKind(diagram.getClassName());
    };

    /**
     * Determines whether this object can be relocated to a given element.
     *
     * @param {Model} model
     * @return {Boolean}
     */
    Model.prototype.canRelocateTo = function (model) {
        return model.canContain(this);
    };


    /**
     * Tag
     *
     * @constructor
     * @extends Model
     */
    function Tag() {
        Model.apply(this, arguments);

        /** @member {TagKind} */
        this.kind = TK_STRING;

        /** @member {*} */
        this.value = '';

        /** @member {Model} */
        this.reference = null;

        /** @member {boolean} */
        this.checked = false;

        /** @member {number} */
        this.number = 0;

    }
    // inherits from Model
    Tag.prototype = Object.create(Model.prototype);
    Tag.prototype.constructor = Tag;

    /**
     * Hyperlink
     *
     * @constructor
     * @extends Model
     */
    function Hyperlink() {
        Model.apply(this, arguments);

        /** @member {Model} */
        this.reference = null;

        /** @member {*} */
        this.url = '';
    }
    // inherits from Model
    Hyperlink.prototype = Object.create(Model.prototype);
    Hyperlink.prototype.constructor = Hyperlink;

    Hyperlink.prototype.getNodeText = function () {
        if (this.reference instanceof type.Model) {
            return "(link to " + this.reference.name + ")";
        } else if (this.url && this.url.length > 0) {
            return "(link to " + this.url + ")";
        } else {
            return "(none)";
        }
    };


    /**
     * ExtensibleModel
     *
     * @constructor
     * @extends Model
     */
    function ExtensibleModel() {
        Model.apply(this, arguments);

        /** @member {string} */
        this.documentation = "";

        /** @member {Array.<Tag>} */
        this.tags = [];
    }
    // inherits from Element
    ExtensibleModel.prototype = Object.create(Model.prototype);
    ExtensibleModel.prototype.constructor = ExtensibleModel;


    /**
     * Return whether element has a specific tag
     *
     * @param {string} tagName
     * @return {Boolean}
     */
    ExtensibleModel.prototype.hasTag = function (tagName) {
        for (var i = 0, len = this.tags.length; i < len; i++) {
            var tag = this.tags[i];
            if (tag.name === tagName) {
                return true;
            }
        }
        return false;
    };

    /**
     * Return a specific tag by name
     *
     * @param {string} tagName
     * @return {Tag|undefined}
     */
    ExtensibleModel.prototype.getTag = function (tagName) {
        for (var i = 0, len = this.tags.length; i < len; i++) {
            var tag = this.tags[i];
            if (tag.name === tagName) {
                return tag;
            }
        }
        return undefined;
    };

    /**
     * Return value of a specific tag
     *
     * @param {string} tagName
     * @return {Boolean|undefined}
     */
    ExtensibleModel.prototype.getTagValue = function (tagName) {
        for (var i = 0, len = this.tags.length; i < len; i++) {
            var tag = this.tags[i];
            if (tag.name === tagName) {
                return tag.value;
            }
        }
        return undefined;
    };


    /**
     * Relationship
     *
     * @constructor
     * @extends ExtensibleModel
     */
    function Relationship() {
        ExtensibleModel.apply(this, arguments);
    }

    // Relationship inherits ExtensibleModel
    Relationship.prototype = Object.create(ExtensibleModel.prototype);
    Relationship.prototype.constructor = Relationship;



    /**
     * DirectedRelationship
     *
     * @constructor
     * @extends Relationship
     */
    function DirectedRelationship() {
        Relationship.apply(this, arguments);

        /** @member {Model} */
        this.target = null;

        /** @member {Model} */
        this.source = null;
    }
    // DirectedRelationship inherits Relationship
    DirectedRelationship.prototype = Object.create(Relationship.prototype);
    DirectedRelationship.prototype.constructor = DirectedRelationship;

    DirectedRelationship.prototype.getNodeText = function () {
        if (!this.source || !this.target) {
            console.error("source or target is not assigned");
            console.log(this);
            return "(?→?)";
        }
        var _text = "(" + this.source.name + "→" + this.target.name + ")";
        if (this.name && this.name.length > 0) {
            _text = this.name + " " + _text;
        }
        return _text;
    };


    /**
     * RelationshipEnd
     *
     * @constructor
     * @extends ExtensibleModel
     */
    function RelationshipEnd() {
        ExtensibleModel.apply(this, arguments);

        /** @member {Model} */
        this.reference = null;
    }

    // RelationshipEnd inherits ExtensibleModel
    RelationshipEnd.prototype = Object.create(ExtensibleModel.prototype);
    RelationshipEnd.prototype.constructor = RelationshipEnd;

    RelationshipEnd.prototype.canDelete = function () {
        return false;
    };

    /**
     * UndirectedRelationship
     *
     * @constructor
     * @extends Relationship
     */
    function UndirectedRelationship() {
        Relationship.apply(this, arguments);

        /** @member {RelationshipEnd} */
        this.end1 = null;

        /** @member {RelationshipEnd} */
        this.end2 = null;
    }

    // UndirectedRelationship inherits Relationship
    UndirectedRelationship.prototype = Object.create(Relationship.prototype);
    UndirectedRelationship.prototype.constructor = UndirectedRelationship;

    UndirectedRelationship.prototype.getNodeText = function () {
        return "(" + this.end1.reference.name + "—" + this.end2.reference.name + ")";
    };


    /**
     * View
     *
     * @constructor
     * @extends Element
     */
    function View() {
        Element.apply(this, arguments);

        /** @member {Model} */
        this.model = null;

        /** @member {Array.<View>} */
        this.subViews = [];

        /** @member {View} */
        this.containerView = null;

        /** @member {Array.<View>} */
        this.containedViews = [];

        /** @member {boolean} */
        this.visible = true;

        /** @member {boolean} */
        this.enabled = true;

        /** @member {boolean} */
        this.selected = false;

        /** @member {number} */
        this.selectable = SK_YES;

        /** @member {string} */
        this.lineColor = PreferenceManager.get("view.lineColor", "#000000");

        /** @member {string} */
        this.fillColor = PreferenceManager.get("view.fillColor", "#ffffff");

        /** @member {string} */
        this.fontColor = PreferenceManager.get("view.fontColor", "#000000");

        /** @member {Font} */
        this.font = new Font(
            PreferenceManager.get("view.font", "Arial"),
            PreferenceManager.get("view.fontSize", 13),
            Graphics.FS_NORMAL
        );

        /** @member {boolean} */
        this.parentStyle = false;

        /** @member {boolean} */
        this.showShadow = PreferenceManager.get("view.showShadow", true);

        /** @member {boolean} */
        this.containerChangeable = false;

        /** @member {boolean} */
        this.containerExtending = false;

        /** @member {number} */
        this.zIndex = 0;
    }
    // View inherits Element
    View.prototype = Object.create(Element.prototype);
    View.prototype.constructor = View;

    /**
     * Traverse all sub views recursively (Breadth-First Traversal)
     *
     * @param {function} fun
     */
    View.prototype.traverse = function (fun) {
        fun(this);
        var ref = this.subViews;
        for (var i = 0, len = ref.length; i < len; i++) {
            var v = ref[i];
            v.traverse(fun);
        }
    };

    /**
     * Traverse all sub views recursively (Depth-First Traversal)
     *
     * @param {function} fun
     */
    View.prototype.traverseDepthFirst = function (fun) {
        var ref = this.subViews;
        for (var i = 0, len = ref.length; i < len; i++) {
            var v = ref[i];
            v.traverseDepthFirst(fun);
        }
        fun(this);
    };

    View.prototype.find = function (predicate) {
        if (predicate(this)) {
            return this;
        }
        var ref = this.subViews;
        for (var i = 0, len = ref.length; i < len; i++) {
            var v = ref[i];
            var result = v.find(predicate);
            if (result) {
                return result;
            }
        }
        return null;
    };

    View.prototype.findDepthFirst = function (predicate) {
        var ref = this.subViews;
        for (var i = 0, len = ref.length; i < len; i++) {
            var v = ref[i];
            var result = v.findDepthFirst(predicate);
            if (result) {
                return result;
            }
        }
        if (predicate(this)) {
            return this;
        }
        return null;
    };

    /**
     * Assign styles to canvas.
     *
     * @param {Canvas} canvas
     */
    View.prototype.assignStyleToCanvas = function (canvas) {
        canvas.color = this.lineColor;
        canvas.fillColor = this.fillColor;
        canvas.fontColor = this.fontColor;
        canvas.font = this.font;
    };

    View.prototype.delimitContainingBoundary = function (canvas) {
    };

    /**
     * Initialize view object.
     *
     * @abstract
     * @param {Canvas} canvas
     */
    View.prototype.initialize = function (canvas, x1, y1, x2, y2) {};

    /**
     * Move view object including all sub views by (dx, dy)
     *
     * @param {Canvas} canvas
     * @param {number} dx
     * @param {number} dy
     */
    View.prototype.move = function (canvas, dx, dy) {
        this.moveObject(canvas, dx, dy);
        for (var i = 0, len = this.subViews.length; i < len; i++) {
            var v = this.subViews[i];
            v.move(canvas, dx, dy);
        }
    };

    /**
     * Move this view object by (dx, dy).
     *
     * @param {Canvas} canvas
     * @param {number} dx
     * @param {number} dy
     */
    View.prototype.moveObject = function (canvas, dx, dy) {};

    /**
     * Setup view object (styles and attributes)
     *
     * @param {Canvas} canvas
     */
    View.prototype.setup = function (canvas) {
        if (this.parentStyle && this._parent && this._parent.font) {
            this.lineColor = this._parent.lineColor;
            this.fillColor = this._parent.fillColor;
            this.fontColor = this._parent.fontColor;
            this.font.face = this._parent.font.face;
            this.font.size = this._parent.font.size;
            this.font.style = this._parent.font.style;
        }
        this.assignStyleToCanvas(canvas);
        if (this._parent && this._parent.visible === false) {
            this.visible = false;
        }
        for (var i = 0, len = this.subViews.length; i < len; i++) {
            var v = this.subViews[i];
            v.setup(canvas);
        }
    };

    /**
     * Update view object from a corresponding model object.
     *
     * @param {Canvas} canvas
     */
    View.prototype.update = function (canvas) {
        for (var i = 0, len = this.subViews.length; i < len; i++) {
            var v = this.subViews[i];
            v.update(canvas);
        }
    };

    /**
     * Compute it's size
     *
     * @param {Canvas} canvas
     */
    View.prototype.size = function (canvas) {
        this.assignStyleToCanvas(canvas);
        for (var i = 0, len = this.subViews.length; i < len; i++) {
            var v = this.subViews[i];
            v.size(canvas);
        }
        this.sizeObject(canvas);
    };

    /**
     * Compute it's size
     *
     * @param {Canvas} canvas
     */
    View.prototype.sizeObject = function (canvas) {};

    /**
     * Arrange this view object.
     *
     * @param {Canvas} canvas
     */
    View.prototype.arrange = function (canvas) {
        this.assignStyleToCanvas(canvas);
        for (var i = 0, len = this.subViews.length; i < len; i++) {
            var v = this.subViews[i];
            v.arrange(canvas);
        }
        this.delimitContainingBoundary(canvas);
        this.arrangeObject(canvas);
    };

    /**
     * Arrange this view object.
     *
     * @param {Canvas} canvas
     */
    View.prototype.arrangeObject = function (canvas) {};

    /**
     * Draw shadow.
     *
     * @param {Canvas} canvas
     */
    View.prototype.drawShadow = function (canvas) {
        for (var i = 0, len = this.subViews.length; i < len; i++) {
            var v = this.subViews[i];
            if (v.visible) {
                v.drawShadow(canvas);
            }
        }
    };

    /**
     * Draw view object.
     *
     * @param {Canvas} canvas
     */
    View.prototype.draw = function (canvas) {
        this.assignStyleToCanvas(canvas);
        this.drawObject(canvas);
        for (var i = 0, len = this.subViews.length; i < len; i++) {
            var v = this.subViews[i];
            if (v.visible) {
                v.draw(canvas);
            }
        }
    };

    /**
     * Draw view object.
     *
     * @param {Canvas} canvas
     */
    View.prototype.drawObject = function (canvas) {};

    /**
     * Draw selection of this view object.
     *
     * @abstract
     * @param {Canvas} canvas
     */
    View.prototype.drawSelection = function (canvas) {};

    /**
     * Return a sub view located at (x, y).
     *
     * @param {Canvas} canvas
     * @param {number} x
     * @param {number} y
     */
    View.prototype.getViewAt = function (canvas, x, y) {
        for (var i = this.subViews.length - 1; i >= 0; i--) {
            var v = this.subViews[i];
            if (v.visible && (v.selectable != SK_NO)) {
                var sub = v.getViewAt(canvas, x, y);
                if (sub !== null) {
                    return sub;
                }
            }
        }
        if (this.containsPoint(canvas, x, y) && (this.selectable == SK_YES)) {
            return this;
        }
        return null;
    };

    /**
     * Return a diagram containg this view object.
     *
     * @return {View}
     */
    View.prototype.getDiagram = function () {
        if (this._parent instanceof Diagram) {
            return this._parent;
        } else if (this._parent !== null) {
            return this._parent.getDiagram();
        }
        return null;
    };

    /**
     * Return a bounding box.
     *
     * @param {Canvas} canvas
     * @param {Rect}
     */
    View.prototype.getBoundingBox = function (canvas) {
        return new Rect(-1, -1, 0, 0);
    };

    /**
     * Determines whether this view contains a point (x, y)
     *
     * @param {Canvas} canvas
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    View.prototype.containsPoint = function (canvas, x, y) {
        var r = this.getBoundingBox(canvas);
        if (this.selected) {
            var zr = r,
                zp = new Point(x, y);
            Coord.coordTransform2(canvas.zoomFactor, GridFactor.NO_GRID, zr);
            zr.setRect(zr.x1 - Toolkit.DEFAULT_HIGHLIGHTER_SIZE, zr.y1 - Toolkit.DEFAULT_HIGHLIGHTER_SIZE, zr.x2 + Toolkit.DEFAULT_HIGHLIGHTER_SIZE, zr.y2 + Toolkit.DEFAULT_HIGHLIGHTER_SIZE);
            Coord.coordTransform(canvas.zoomFactor, GridFactor.NO_GRID, zp);
            return Coord.ptInRect(zp.x, zp.y, zr);
        }
        return Coord.ptInRect(x, y, r);
    };

    /**
     * Determines whether this view overlaps a given rect
     *
     * @param {Canvas} canvas
     * @param {Rect} rect
     * @return {boolean}
     */
    View.prototype.overlapRect = function (canvas, rect) {
        var bound = this.getBoundingBox(canvas);
        if (this.selected) {
            bound.setRect(bound.x1 - 5, bound.y1 - 5, bound.x2 + 5, bound.y2 + 5);
        }
        return Coord.rectInRect(rect, bound);
    };

    /**
     * Add a sub view.
     *
     * @param {View} view
     */
    View.prototype.addSubView = function (view) {
        this.subViews.add(view);
        view._parent = this;
    };

    /**
     * Remove a sub view
     *
     * @param {View} view
     */
    View.prototype.removeSubView = function (view) {
        this.subViews.remove(view);
        view._parent = null;
    };

    /**
     * Add a contained view.
     *
     * @param {View} view
     */
    View.prototype.addContainedView = function (view) {
        this.containedViews.add(view);
        view.containerView = this;
    };

    /**
     * Remove a contained view.
     * @param {View} view
     */
    View.prototype.removeContainedView = function (view) {
        this.containedViews.remove(view);
        view.containerView = null;
    };

    /**
     *
     */
    View.prototype.isOneOfTheContainerViews = function (view) {
        if ((this.containerView === null) || (view == this)) {
            return false;
        } else if (this.containerView == view) {
            return true;
        } else {
            return this.containerView.isOneOfTheContainerViews(view);
        }
    };

    /**
     *
     */
    View.prototype.canContainViewKind = function (kind) {
        return false;
    };

    /**
     *
     */
    View.prototype.canContainView = function (view) {
        return (view !== null) &&
               (view !== this) &&
               (!this.isOneOfTheContainerViews(view)) &&
               (this.canContainViewKind(view.getClassName()));
    };

    /**
     *
     */
    View.prototype.drawContainingBox = function (canvas) {
        var rect = this.getBoundingBox(canvas);
        Toolkit.drawRangeBox(canvas, rect.x1 + 1, rect.y1 + 1, rect.x2 - 1, rect.y2 - 1);
    };

    /**
     *
     */
    View.prototype.eraseContainingBox = function (canvas) {
        // NOTHING TO DO
    };


    /**
     * NodeView
     * @constructor
     * @extends View
     */
    function NodeView() {
        View.apply(this, arguments);

        /** @member {number} */
        this.left = 0;

        /** @member {number} */
        this.top = 0;

        /** @member {number} */
        this.width = 0;

        /** @member {number} */
        this.height = 0;

        /** @member {number} */
        this.minWidth = 0;

        /** @member {number} */
        this.minHeight = 0;

        /** @member {number} */
        this.sizable = SZ_FREE;

        /** @member {number} */
        this.movable = MM_FREE;

        /** @member {Boolean} */
        this.autoResize = false;
    }
    // NodeView inherits View
    NodeView.prototype = Object.create(View.prototype);
    NodeView.prototype.constructor = NodeView;

    /**
     *
     */
    NodeView.prototype.getRight = function () {
        return this.left + this.width - 1;
    };

    /**
     *
     */
    NodeView.prototype.setRight = function (value) {
        this.width = value - this.left + 1;
    };

    /**
     *
     */
    NodeView.prototype.getBottom = function () {
        return this.top + this.height - 1;
    };

    /**
     *
     */
    NodeView.prototype.setBottom = function (value) {
        this.height = value - this.top + 1;
    };

    /**
     *
     */
    NodeView.prototype.getCenter = function () {
        return new Point((this.left + this.getRight()) / 2, (this.top + this.getBottom()) / 2);
    };

    /**
     *
     */
    NodeView.prototype.moveObject = function (canvas, dx, dy) {
        this.left = this.left + dx;
        this.top = this.top + dy;
    };

    /**
     *
     */
    NodeView.prototype.initialize = function (canvas, x1, y1, x2, y2) {
        var r = new Rect(x1, y1, x2, y2);
        Coord.normalizeRect(r);
        this.left = r.x1;
        this.top = r.y1;
        this.width = Math.max(this.minWidth, r.x2 - r.x1);
        this.height = Math.max(this.minHeight, r.y2 - r.y1);
    };

    NodeView.prototype.sizeConstraints = function (canvas) {
        if (this.autoResize) {
            this.width = this.minWidth;
            this.height = this.minHeight;
        }
        if (this.width < this.minWidth) {
            this.width = this.minWidth;
        }
        if (this.height < this.minHeight) {
            this.height = this.minHeight;
        }
    };

    /**
     *
     */
    NodeView.prototype.sizeObject = function (canvas) {
        View.prototype.sizeObject.call(this, canvas);
        this.sizeConstraints();
    };

    /**
     *
     */
    NodeView.prototype.arrangeObject = function (canvas) {
        View.prototype.arrangeObject.call(this, canvas);
    };

    /**
     *
     */
    NodeView.prototype.drawObject = function (canvas) {
        View.prototype.drawObject.call(this, canvas);
    };

    /**
     *
     */
    NodeView.prototype.drawSelection = function (canvas) {
        if (this.sizable === SZ_NONE) {
            Toolkit.drawSelection(canvas, this.left-1, this.top-1, this.getRight()+1, this.getBottom()+1);
        } else {
            var retouch = !(this.sizable === SZ_FREE || this.sizable === SZ_RATIO);
            var x1, x2, y1, y2;
            x1 = this.left - 1;
            y1 = this.top - 1;
            x2 = this.getRight() + 1;
            y2 = this.top - 1;
            Toolkit.drawSelectionLine(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_SELECTIONLINE_WIDTH, Toolkit.NWSE_N, retouch);
            x1 = this.left - 1;
            y1 = this.top - 1;
            x2 = this.left - 1;
            y2 = this.getBottom() + 1;
            Toolkit.drawSelectionLine(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_SELECTIONLINE_WIDTH, Toolkit.NWSE_W, retouch);
            x1 = this.getRight() + 1;
            y1 = this.top - 1;
            x2 = this.getRight() + 1;
            y2 = this.getBottom() + 1;
            Toolkit.drawSelectionLine(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_SELECTIONLINE_WIDTH, Toolkit.NWSE_E, retouch);
            x1 = this.left - 1;
            y1 = this.getBottom() + 1;
            x2 = this.getRight() + 1;
            y2 = this.getBottom() + 1;
            Toolkit.drawSelectionLine(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_SELECTIONLINE_WIDTH, Toolkit.NWSE_S, retouch);

            x1 = this.left - 1;
            y1 = this.top -1;
            x2 = this.getRight() + 1;
            y2 = this.getBottom() + 1;
            Toolkit.drawSelectionBox(canvas, x1, y1, x2, y2);

            if (this.sizable === SZ_FREE || this.sizable === SZ_RATIO) {
                Toolkit.drawHighlighter2(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_HIGHLIGHTER_SIZE, Toolkit.CT_LT, true, Toolkit.HIGHLIGHTER_COLOR);
                Toolkit.drawHighlighter2(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_HIGHLIGHTER_SIZE, Toolkit.CT_RT, true, Toolkit.HIGHLIGHTER_COLOR);
                Toolkit.drawHighlighter2(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_HIGHLIGHTER_SIZE, Toolkit.CT_LB, true, Toolkit.HIGHLIGHTER_COLOR);
                Toolkit.drawHighlighter2(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_HIGHLIGHTER_SIZE, Toolkit.CT_RB, true, Toolkit.HIGHLIGHTER_COLOR);
            }
            if (this.sizable === SZ_FREE || this.sizable === SZ_VERT) {
                Toolkit.drawHighlighter2(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_HIGHLIGHTER_SIZE, Toolkit.CT_MT, true, Toolkit.HIGHLIGHTER_COLOR);
                Toolkit.drawHighlighter2(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_HIGHLIGHTER_SIZE, Toolkit.CT_MB, true, Toolkit.HIGHLIGHTER_COLOR);
            }
            if (this.sizable === SZ_FREE || this.sizable === SZ_HORZ) {
                Toolkit.drawHighlighter2(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_HIGHLIGHTER_SIZE, Toolkit.CT_LM, true, Toolkit.HIGHLIGHTER_COLOR);
                Toolkit.drawHighlighter2(canvas, x1, y1, x2, y2, Toolkit.DEFAULT_HIGHLIGHTER_SIZE, Toolkit.CT_RM, true, Toolkit.HIGHLIGHTER_COLOR);
            }
        }
    };

    /**
     *
     */
    NodeView.prototype.getBoundingBox = function (canvas) {
        return new Rect(this.left, this.top, this.getRight(), this.getBottom());
    };


    /**
     * EdgeView
     * @constructor
     * @extends View
     */
    function EdgeView() {
        View.apply(this, arguments);
        this.BACKGROUND_COLOR = Color.WHITE;

        /** @member {View} */
        this.head = null;

        /** @member {View} */
        this.tail = null;

        /** @member {number} */
        this.lineStyle = PreferenceManager.get("view.lineStyle", LS_OBLIQUE);

        this.lineMode = LM_SOLID;
        this.points = new Points();
        this.headEndStyle = ES_FLAT;
        this.tailEndStyle = ES_FLAT;
    }

    // EdgeView inherits View
    EdgeView.prototype = Object.create(View.prototype);
    EdgeView.prototype.constructor = EdgeView;

    /** EdgeView Constants */
    EdgeView.SELF_EDGE_HORIZ_INTERVAL = 30;
    EdgeView.SELF_EDGE_VERTI_INTERVAL = 20;

    /**
     *
     */
    EdgeView.prototype.reducePoints = function (canvas) {
        var b, i, j, _i, _results;
        if (!(this.tail instanceof EdgeView)) {
            b = this.tail.getBoundingBox(canvas);
            i = 1;
            while (i < this.points.count() - 1) {
                if (Coord.ptInRect2(this.points.getPoint(i), b)) {
                    for (j = _i = 1; 1 <= i ? _i <= i : _i >= i; j = 1 <= i ? ++_i : --_i) {
                        this.points.remove(1);
                    }
                    i = 1;
                } else {
                    i++;
                }
            }
        }
        if (!(this.head instanceof EdgeView)) {
            b = this.head.getBoundingBox(canvas);
            i = 1;
            _results = [];
            while (i < this.points.count() - 1) {
                if (Coord.ptInRect2(this.points.getPoint(i), b)) {
                    _results.push((function () {
                        var _j, _ref, _results1;
                        _results1 = [];
                        for (j = _j = 1, _ref = this.points.count() - i - 1; 1 <= _ref ? _j <= _ref : _j >= _ref; j = 1 <= _ref ? ++_j : --_j) {
                            _results1.push(this.points.remove(i));
                        }
                        return _results1;
                    }).call(this));
                } else {
                    _results.push(i++);
                }
            }
            return _results;
        }
    };

    /**
     *
     */
    EdgeView.prototype.recalcOblique = function (canvas) {
        var hb, headPoints, i, tailPoints, tb;
        this.reducePoints(canvas);
        if (!(this.tail instanceof EdgeView)) {
            tb = this.tail.getBoundingBox(canvas);
        } else {
            tailPoints = this.tail.points;
            i = Math.floor((tailPoints.count() - 1) / 2);
            tb = new Rect(tailPoints.getPoint(i).x, tailPoints.getPoint(i).y, tailPoints.getPoint(i + 1).x, tailPoints.getPoint(i + 1).y);
        }
        this.points.setPoint(0, Coord.getCenter(tb));
        if (!(this.head instanceof EdgeView)) {
            hb = this.head.getBoundingBox(canvas);
        } else {
            headPoints = this.head.points;
            i = Math.floor((headPoints.count() - 1) / 2);
            hb = new Rect(headPoints.getPoint(i).x, headPoints.getPoint(i).y, headPoints.getPoint(i + 1).x, headPoints.getPoint(i + 1).y);
        }
        tb.expand(1);
        hb.expand(1);
        this.points.setPoint(this.points.count() - 1, Coord.getCenter(hb));
        if (!(this.tail instanceof EdgeView)) {
            this.points.setPoint(0, Coord.junction(tb, this.points.getPoint(1)));
        }
        if (!(this.head instanceof EdgeView)) {
            this.points.setPoint(this.points.count() - 1, Coord.junction(hb, this.points.getPoint(this.points.count() - 2)));
        }
    };

    /**
     *
     */
    EdgeView.prototype.recalcRectilinear = function (canvas) {
        var bb, bh, bt, h, hps, i, p, tps, w;
        if (this.head === this.tail) {
            if (this.points.count() <= 3) {
                this.points.clear();
                bb = this.head.getBoundingBox(canvas);
                w = bb.x2 - bb.x1;
                h = bb.y2 - bb.y1;
                this.points.add(Coord.getCenter(bb));
                this.points.add(new Point(this.points.getPoint(0).x, Math.floor(this.points.getPoint(0).y - (h / 2) - EdgeView.SELF_EDGE_VERTI_INTERVAL)));
                this.points.add(new Point(this.points.getPoint(0).x + Math.floor(w / 2) + EdgeView.SELF_EDGE_HORIZ_INTERVAL, this.points.getPoint(0).y - (h / 2) - EdgeView.SELF_EDGE_VERTI_INTERVAL));
                this.points.add(new Point(this.points.getPoint(0).x + Math.floor(w / 2) + EdgeView.SELF_EDGE_HORIZ_INTERVAL, this.points.getPoint(0).y));
                this.points.add(Coord.getCenter(bb));
            }
        }
        if (!(this.tail instanceof EdgeView)) {
            bt = this.tail.getBoundingBox(canvas);
        } else {
            tps = this.tail.points;
            i = Math.floor((tps.count() - 1) / 2);
            bt = new Rect(tps.getPoint(i).x, tps.getPoint(i).y, tps.getPoint(i + 1).x, tps.getPoint(i + 1).y);
            bt.setRect3(Coord.getCenter(bt), Coord.getCenter(bt));
        }
        if (!(this.head instanceof EdgeView)) {
            bh = this.head.getBoundingBox(canvas);
        } else {
            hps = this.head.points;
            i = Math.floor((hps.count() - 1) / 2);
            bh = new Rect(hps.getPoint(i).x, hps.getPoint(i).y, hps.getPoint(i + 1).x, hps.getPoint(i + 1).y);
            bh.setRect3(Coord.getCenter(bh), Coord.getCenter(bh));
            bt.expand(1);
            bh.expand(1);
        }

        // Add new point, if have not enough points.
        if (this.points.count() === 2) {
            p = Coord.orthoJunction(bt, this.points.getPoint(1));
            if ((p.x === -100) && (p.y === -100)) {
                this.points.insert(0, Coord.orthoJunction(bt, this.points.getPoint(0)));
            } else {
                this.points.setPoint(0, p);
            }
            p = Coord.orthoJunction(bh, this.points.getPoint(this.points.count() - 2));
            if ((p.x === -100) && (p.y === -100)) {
                this.points.add(Coord.orthoJunction(bh, this.points.getPoint(this.points.count() - 1)));
            } else {
                this.points.setPoint(this.points.count() - 1, p);
            }
        }

        // Replace 0-indexed point with junction point to TailView
        p = Coord.orthoJunction(bt, this.points.getPoint(1));
        if ((p.x === -100) && (p.y === -100)) {
            if (this.points.getPoint(1).y === this.points.getPoint(2).y) {
                this.points.setPoint(1, new Point(Coord.getCenter(bt).x, this.points.getPoint(1).y));
            } else {
                this.points.setPoint(1, new Point(this.points.getPoint(1).x, Coord.getCenter(bt).y));
            }
        }
        this.points.setPoint(0, Coord.orthoJunction(bt, this.points.getPoint(1)));

        // Replace highest-indexed point with junction point to HeadView
        p = Coord.orthoJunction(bh, this.points.getPoint(this.points.count() - 2));
        if ((p.x === -100) && (p.y === -100)) {
            if (this.points.getPoint(this.points.count() - 2).y === this.points.getPoint(this.points.count() - 3).y) {
                this.points.setPoint(this.points.count() - 2, new Point(Coord.getCenter(bh).x, this.points.getPoint(this.points.count() - 2).y));
            } else {
                this.points.setPoint(this.points.count() - 2, new Point(this.points.getPoint(this.points.count() - 2).x, Coord.getCenter(bh).y));
            }
        }
        this.points.setPoint(this.points.count() - 1, Coord.orthoJunction(bh, this.points.getPoint(this.points.count() - 2)));

        // Must be removed, and calculate this in another module (Handlers)
        // FitToGrid(GraphicClasses.GridFactor(5, 5));
        this.points.reduceOrthoLine();
        this.reducePoints(canvas);

        p = this.points.getPoint(0).copy();
        this.points.setPoint(0, Coord.orthoJunction(bt, this.points.getPoint(1)));
        if ((this.points.getPoint(0).x === -100) || (this.points.getPoint(0).y === -100)) {
            this.points.setPoint(0, p);
        }

        p = this.points.getPoint(this.points.count() - 1).copy();
        this.points.setPoint(this.points.count() - 1, Coord.orthoJunction(bh, this.points.getPoint(this.points.count() - 2)));
        if ((this.points.getPoint(this.points.count() - 1).x === -100) || (this.points.getPoint(this.points.count() - 1).y === -100)) {
            this.points.setPoint(this.points.count() - 1, p);
        }
    };

    /**
     *
     */
    EdgeView.prototype.drawLineEnd = function (canvas, edgeEndStyle, isHead) {
        if (edgeEndStyle !== ES_FLAT) {
            var rt = new Rect(0, 0, 0, 0);
            if (isHead) {
                rt.setRect(this.points.getPoint(this.points.count() - 1).x, this.points.getPoint(this.points.count() - 1).y, this.points.getPoint(this.points.count() - 2).x, this.points.getPoint(this.points.count() - 2).y);
            } else {
                rt.setRect(this.points.getPoint(0).x, this.points.getPoint(0).y, this.points.getPoint(1).x, this.points.getPoint(1).y);
            }
            var a = rt.y2 - rt.y1,
                b = rt.x2 - rt.x1,
                th = Math.atan(a / b);
            if ((a < 0 && b < 0) || (a > 0 && b < 0) || (a === 0 && b < 0)) {
                th = th + Math.PI;
            }
            var th1 = th - Math.PI / 8,
                th2 = th + Math.PI / 8,
                th3 = th - Math.PI / 2,
                th4 = th + Math.PI / 2,
                th5 = th - Math.PI / 2,
                th6 = th + Math.PI / 2,
                c1 = 11.0,
                c2 = c1 * 2.0,
                c3 = 7,
                p0 = new Point(rt.x1, rt.y1),
                p1 = new Point((c1 * Math.cos(th1)) + rt.x1, (c1 * Math.sin(th1)) + rt.y1),
                p2 = new Point((c1 * Math.cos(th2)) + rt.x1, (c1 * Math.sin(th2)) + rt.y1),
                p3 = new Point((c2 * Math.cos(th)) + rt.x1, (c2 * Math.sin(th)) + rt.y1),
                p4 = new Point((c2 * Math.cos(th1)) + rt.x1, (c2 * Math.sin(th1)) + rt.y1),
                p5 = new Point((c2 * Math.cos(th2)) + rt.x1, (c2 * Math.sin(th2)) + rt.y1),
                p6 = new Point((c1 * Math.cos(th1)) + p3.x, (c1 * Math.sin(th1)) + p3.y),
                p7 = new Point((c1 * Math.cos(th2)) + p3.x, (c1 * Math.sin(th2)) + p3.y),
                p8 = new Point((c3 * Math.cos(th)) + rt.x1, (c3 * Math.sin(th)) + rt.y1),
                p9 = new Point((c3 * Math.cos(th3)) + p8.x, (c3 * Math.sin(th3)) + p8.y),
                p10 = new Point((c3 * Math.cos(th4)) + p8.x, (c3 * Math.sin(th4)) + p8.y),
                p11 = new Point(((c3*2) * Math.cos(th)) + rt.x1, ((c3*2) * Math.sin(th)) + rt.y1),
                p12 = new Point(c3 * Math.cos(th5) + p0.x, c3 * Math.sin(th5) + p0.y),
                p13 = new Point(c3 * Math.cos(th6) + p0.x, c3 * Math.sin(th6) + p0.y);
            canvas.color = this.lineColor;
            canvas.fillColor = Color.WHITE;
            switch (edgeEndStyle) {
            case ES_STICK_ARROW:
                canvas.polyline([p1, p0, p2]);
                break;
            case ES_SOLID_ARROW:
                canvas.fillColor = this.lineColor;
                canvas.fillPolygon([p1, p0, p2]);
                canvas.polygon([p1, p0, p2]);
                break;
            case ES_TRIANGLE:
                canvas.fillPolygon([p4, p0, p5]);
                canvas.polygon([p4, p0, p5]);
                break;
            case ES_FILLED_TRIANGLE:
                canvas.fillColor = this.lineColor;
                canvas.fillPolygon([p4, p0, p5]);
                break;
            case ES_DIAMOND:
                canvas.fillPolygon([p1, p0, p2, p3]);
                canvas.polygon([p1, p0, p2, p3]);
                break;
            case ES_FILLED_DIAMOND:
                canvas.fillColor = this.lineColor;
                canvas.fillPolygon([p1, p0, p2, p3]);
                canvas.polygon([p1, p0, p2, p3]);
                break;
            case ES_ARROW_DIAMOND:
                canvas.fillPolygon([p1, p0, p2, p3]);
                canvas.polygon([p1, p0, p2, p3]);
                canvas.polyline([p6, p3, p7]);
                break;
            case ES_ARROW_FILLED_DIAMOND:
                canvas.fillColor = this.lineColor;
                canvas.fillPolygon([p1, p0, p2, p3]);
                canvas.polygon([p1, p0, p2, p3]);
                canvas.polyline([p6, p3, p7]);
                break;
            case ES_PLUS:
                canvas.line(p9.x, p9.y, p10.x, p10.y);
                break;
            case ES_CIRCLE:
                canvas.fillEllipse(p8.x - c3, p8.y - c3, p8.x + c3, p8.y + c3);
                canvas.ellipse(p8.x - c3, p8.y - c3, p8.x + c3, p8.y + c3);
                break;
            case ES_CIRCLE_PLUS:
                canvas.fillEllipse(p8.x - c3, p8.y - c3, p8.x + c3, p8.y + c3);
                canvas.ellipse(p8.x - c3, p8.y - c3, p8.x + c3, p8.y + c3);
                canvas.line(p11.x, p11.y, p0.x, p0.y);
                canvas.line(p9.x, p9.y, p10.x, p10.y);
                break;
            case ES_CROWFOOT_ONE:
                /*
                canvas.putPixel(p0.x, p0.y, Color.BLACK);

                canvas.putPixel(p1.x, p1.y, Color.RED);
                canvas.putPixel(p2.x, p2.y, Color.RED);
                canvas.putPixel(p3.x, p3.y, Color.GREEN);
                canvas.putPixel(p4.x, p4.y, Color.GREEN);
                canvas.putPixel(p5.x, p5.y, Color.GREEN);
                canvas.putPixel(p6.x, p6.y, Color.MAGENTA);
                canvas.putPixel(p7.x, p7.y, Color.MAGENTA);
                canvas.putPixel(p8.x, p8.y, Color.MAGENTA);

                canvas.putPixel(p9.x, p9.y, Color.ORANGE);
                canvas.putPixel(p10.x, p10.y, Color.ORANGE);
                canvas.putPixel(p11.x, p11.y, Color.ORANGE);

                canvas.putPixel(p12.x, p12.y, Color.CYAN);
                canvas.putPixel(p13.x, p13.y, Color.CYAN);
                */


                // canvas.line(p11.x, p11.y, p12.x, p12.y);
                // canvas.line(p11.x, p11.y, p13.x, p13.y);
                // canvas.fillEllipse(p3.x - c3, p3.y - c3, p3.x + c3, p3.y + c3);
                // canvas.ellipse(p3.x - c3, p3.y - c3, p3.x + c3, p3.y + c3);

                canvas.line(p9.x, p9.y, p10.x, p10.y);


                break;
            case ES_CROWFOOT_MANY:
                canvas.line(p11.x, p11.y, p12.x, p12.y);
                canvas.line(p11.x, p11.y, p13.x, p13.y);
                break;
            case ES_CROWFOOT_ZERO_ONE:
                canvas.fillEllipse(p3.x - c3, p3.y - c3, p3.x + c3, p3.y + c3);
                canvas.ellipse(p3.x - c3, p3.y - c3, p3.x + c3, p3.y + c3);
                canvas.line(p9.x, p9.y, p10.x, p10.y);
                break;
            case ES_CROWFOOT_ZERO_MANY:
                canvas.line(p11.x, p11.y, p12.x, p12.y);
                canvas.line(p11.x, p11.y, p13.x, p13.y);
                canvas.fillEllipse(p3.x - c3, p3.y - c3, p3.x + c3, p3.y + c3);
                canvas.ellipse(p3.x - c3, p3.y - c3, p3.x + c3, p3.y + c3);
                break;

            }
        }
    };

    /**
     *
     */
    EdgeView.prototype.initialize = function (canvas, x1, y1, x2, y2) {
        this.points.clear();
        this.points.add(Coord.junction(this.tail.getBoundingBox(canvas), Coord.getCenter(this.head.getBoundingBox(canvas))));
        this.points.add(Coord.junction(this.head.getBoundingBox(canvas), Coord.getCenter(this.tail.getBoundingBox(canvas))));
        if (this.lineStyle === LS_RECTILINEAR || this.lineStyle === LS_ROUNDRECT) {
            this.points.convObliqueToRectilinear();
        }
    };

    /**
     *
     */
    EdgeView.prototype.moveObject = function (canvas, dx, dy) {
        var ref = this.points.points;
        for (var i = 0, len = ref.length; i < len; i++) {
            var p = ref[i];
            p.setPoint(p.x + dx, p.y + dy);
        }
    };

    /**
     *
     */
    EdgeView.prototype.recalcPoints = function (canvas) {
        switch (this.lineStyle) {
        case LS_RECTILINEAR:
            if (!this.points.isRectilinear()) {
                this.points.convObliqueToRectilinear();
            }
            this.recalcRectilinear(canvas);
            break;
        case LS_OBLIQUE:
            this.recalcOblique(canvas);
            break;
        case LS_ROUNDRECT:
            if (!this.points.isRectilinear()) {
                this.points.convObliqueToRectilinear();
            }
            this.recalcRectilinear(canvas);
            break;
        case LS_CURVE:
            this.recalcOblique(canvas);
            break;
        default:
            if (!this.points.isRectilinear()) {
                this.points.convObliqueToRectilinear();
            }
            this.recalcRectilinear(canvas);
        }
        this.points.quantize();
    };

    /**
     *
     */
    EdgeView.prototype.arrangeObject = function (canvas) {
        if (this.head === this.tail) {
            this.lineStyle = LS_RECTILINEAR;
        }
        this.recalcPoints(canvas);
    };

    /**
     *
     */
    EdgeView.prototype.drawObject = function (canvas) {
        this.assignStyleToCanvas(canvas);
        canvas.fillColor = this.BACKGROUND_COLOR;
        var pattern = (this.lineMode === LM_SOLID) ? null : [3];
        switch (this.lineStyle) {
        case LS_RECTILINEAR:
            canvas.polyline(this.points.points, pattern);
            break;
        case LS_OBLIQUE:
            canvas.polyline(this.points.points, pattern);
            break;
        case LS_ROUNDRECT:
            canvas.roundRectLine(this.points.points, pattern);
            break;
        case LS_CURVE:
            canvas.curveLine(this.points.points, pattern);
            break;
        default:
            canvas.polyline(this.points.points, pattern);
        }
        this.drawLineEnd(canvas, this.headEndStyle, true);
        this.drawLineEnd(canvas, this.tailEndStyle, false);
    };

    /**
     *
     */
    EdgeView.prototype.drawSelection = function (canvas) {
        Toolkit.drawDottedLine(canvas, this.points);
        for (var i = 0, len = this.points.points.length; i < len; i++) {
            var p = this.points.points[i];
            Toolkit.drawHighlighter(canvas, p.x, p.y, Toolkit.DEFAULT_HALF_HIGHLIGHTER_SIZE, true, Toolkit.HIGHLIGHTER_COLOR);
        }
    };

    /**
     *
     */
    EdgeView.prototype.getBoundingBox = function (canvas) {
        var r = this.points.getBoundingRect();
        for (var i = 0, len = this.subViews.length; i < len; i++) {
            var sv = this.subViews[i];
            if (sv.visible) {
                r.setRect2(Coord.unionRect(r, sv.getBoundingBox(canvas)));
            }
        }
        return r;
    };

    /**
     *
     */
    EdgeView.prototype.containsPoint = function (canvas, x, y) {
        return this.containedIndex(canvas, new Point(x, y)) > -1;
    };

    /**
     *
     */
    EdgeView.prototype.disToPoint = function (p1, p2) {
        return Math.sqrt(Math.square(p1.x - p2.x) + Math.square(p1.y - p2.y));
    };

    /**
     *
     */
    EdgeView.prototype.disToOrthoLine = function (lh, lt, p) {
        var l1, l2;
        l1 = new Point(0, 0);
        l2 = new Point(0, 0);
        if (lh.y === lt.y) {
            if (lh.x > lt.x) {
                l1.setPoint(lt.x, lt.y);
                l2.setPoint(lh.x, lh.y);
            } else {
                l1.setPoint(lh.x, lh.y);
                l2.setPoint(lt.x, lt.y);
            }
            if (p.x > l2.x) {
                return this.disToPoint(p, l2);
            } else if (p.x < l1.x) {
                return this.disToPoint(p, l1);
            } else {
                return Math.abs(p.y - l1.y);
            }
        } else {
            if (lh.y > lt.y) {
                l1.setPoint(lt.x, lt.y);
                l2.setPoint(lh.x, lh.y);
            } else {
                l1.setPoint(lh.x, lh.y);
                l2.setPoint(lt.x, lt.y);
            }
            if (p.y > l2.y) {
                return this.disToPoint(p, l2);
            } else if (p.y < l1.y) {
                return this.disToPoint(p, l1);
            } else {
                return Math.abs(p.x - l1.x);
            }
        }
    };

    /**
     *
     */
    EdgeView.prototype.containedIndex = function (canvas, p) {
        var RECOG_MIN_DIS, d, i, minDis, minDisIndex, ph, pt, result, _i, _j, _ref, _ref1;
        result = -1;
        pt = new Point(0, 0);
        ph = new Point(0, 0);
        if (this.lineStyle === LS_RECTILINEAR || this.lineStyle === LS_ROUNDRECT) {
            RECOG_MIN_DIS = 5;
            minDis = RECOG_MIN_DIS;
            minDisIndex = -1;
            for (i = _i = 0, _ref = this.points.count() - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
                pt.setPoint2(this.points.getPoint(i));
                ph.setPoint2(this.points.getPoint(i + 1));
                d = this.disToOrthoLine(ph, pt, p);
                if (d <= minDis) {
                    minDis = d;
                    minDisIndex = i;
                }
            }
            result = minDisIndex;
        } else {
            result = -1;
            for (i = _j = 0, _ref1 = this.points.count() - 2; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
                pt.setPoint2(this.points.getPoint(i));
                ph.setPoint2(this.points.getPoint(i + 1));
                if (Coord.ptInLine(new Rect(pt.x, pt.y, ph.x, ph.y), p)) {
                    result = i;
                }
            }
        }
        return result;
    };

    /**
     *
     */
    EdgeView.prototype.selectedPoint = function (canvas, p) {
        var result = -1;
        for (var i = 0, len = this.points.points.length; i < len; i++) {
            var pt = this.points.points[i];
            if (Coord.equalPt(pt, p)) {
                result = i;
            }
        }
        return result;
    };

    /**
     * Return true only if this edge can be connected the view
     *
     * @param {View} view
     * @param {boolean} isTail Try to connect to tail-side or not
     * @return {boolean}
     */
    EdgeView.prototype.canConnectTo = function (view, isTail) {
        return true;
    };


    /**
     * LabelView
     * @constructor
     * @extends NodeView
     */
    function LabelView() {
        NodeView.apply(this, arguments);
        this.parentStyle = true;
        this.selectable = SK_NO;

        /** @member {string} */
        this.underline = false;

        /** @member {string} */
        this.text = "";

        /** @member {number} */
        this.horizontalAlignment = Graphics.AL_CENTER;

        /** @member {number} */
        this.verticalAlignment = Graphics.AL_MIDDLE;

        /** @member {number} */
        this.direction = DK_HORZ;

        /** @member {boolean} */
        this.wordWrap = false;

    }
    // LabelView inherits NodeView
    LabelView.prototype = Object.create(NodeView.prototype);
    LabelView.prototype.constructor = LabelView;

    /**
     *
     */
    LabelView.prototype.sizeObject = function (canvas) {
        NodeView.prototype.sizeObject.call(this, canvas);
        this.assignStyleToCanvas(canvas);
        var size, minW, minH, w, h;
        if (this.wordWrap && this.direction === DK_HORZ) {
            size = canvas.textExtent(this.text, 1);
            minW = size.x;
            minH = canvas.textExtent(this.text, this.width - 1).y;
            size = canvas.textExtent(this.text, this.width - 1);
            w = size.x;
            h = size.y;
        } else {
            minW = canvas.textExtent(this.text).x;
            minH = canvas.textExtent("^_").y;
            w = minW;
            h = minH;
        }
        if (this.direction === DK_HORZ) {
            this.minWidth = minW;
            this.minHeight = minH;
            this.height = h;
        } else {
            this.minWidth = minH;
            this.minHeight = minW;
            this.width = w;
        }
        this.sizeConstraints();
    };

    /**
     * Arrange LabelView
     */
    LabelView.prototype.arrange = function (canvas) {
        NodeView.prototype.arrange.call(this, canvas);
    };

    /**
     * Draw LabelView
     */
    LabelView.prototype.draw = function (canvas) {
        this.assignStyleToCanvas(canvas);
        var r = new Rect(this.left, this.top, this.getRight(), this.getBottom());
        if (this.direction === DK_HORZ) {
            canvas.textOut2(r, this.text, this.horizontalAlignment, this.verticalAlignment, false, this.wordWrap, this.underline);
        } else {
            canvas.textOut2(r, this.text, this.horizontalAlignment, this.verticalAlignment, true, this.wordWrap, this.underline);
        }
        View.prototype.draw.call(this, canvas);
    };

    /**
     * LabelView cannot be copied alone.
     * @override
     * @return {Boolean}
     */
    LabelView.prototype.canCopy = function () {
        return false;
    };

    /**
     * LabelView cannot be deleted alone.
     * @override
     * @return {Boolean}
     */
    LabelView.prototype.canDelete = function () {
        return false;
    };


    /**
     * ParasiticView
     * @constructor
     * @extends NodeView
     */
    function ParasiticView() {
        NodeView.apply(this, arguments);
        this.alpha = 0;
        this.distance = 0;
    }
    // ParasiticView inherits NodeView
    ParasiticView.prototype = Object.create(NodeView.prototype);
    ParasiticView.prototype.constructor = ParasiticView;

    /**
     * ParasiticView cannot be copied alone.
     * @override
     * @return {Boolean}
     */
    ParasiticView.prototype.canCopy = function () {
        return false;
    };

    /**
     * ParasiticView cannot be deleted alone.
     * @override
     * @return {Boolean}
     */
    ParasiticView.prototype.canDelete = function () {
        return false;
    };


    /**
     * NodeParasiticView
     * @constructor
     * @extends ParasiticView
     */
    function NodeParasiticView() {
        ParasiticView.apply(this, arguments);
        this.hostNode = null;
    }

    // NodeParasiticView inherits ParasiticView
    NodeParasiticView.prototype = Object.create(ParasiticView.prototype);
    NodeParasiticView.prototype.constructor = NodeParasiticView;

    NodeParasiticView.prototype.arrange = function (canvas) {
        ParasiticView.prototype.arrange.call(this, canvas);
        var node = null;
        if (this.hostNode !== null) {
            node = this.hostNode;
        } else if (this._parent instanceof NodeView) {
            node = this._parent;
        } else {
            return;
        }
        var p1 = new Point();
        p1.x = (node.left + node.getRight()) / 2;
        p1.y = (node.top + node.getBottom()) / 2;
        var p = Coord.getPointAwayLine(p1, p1, this.alpha, this.distance);
        this.left = p.x + p1.x - this.width / 2;
        this.top = p.y + p1.y - this.height / 2;
    };


    /**
     * EdgeParasiticView
     * @constructor
     * @extends ParasiticView
     */
    function EdgeParasiticView() {
        ParasiticView.apply(this, arguments);
        this.hostEdge = null;
        this.edgePosition = EP_HEAD;
    }

    // EdgeParasiticView inherits ParasiticView
    EdgeParasiticView.prototype = Object.create(ParasiticView.prototype);
    EdgeParasiticView.prototype.constructor = EdgeParasiticView;

    EdgeParasiticView.prototype.arrangeObject = function (canvas) {
        ParasiticView.prototype.arrangeObject.call(this, canvas);
        var edge, midPointIndex, p, p1, p2;
        edge = null;
        if (this.hostEdge !== null) {
            edge = this.hostEdge;
        } else if (this._parent instanceof EdgeView) {
            edge = this._parent;
        } else {
            return;
        }
        switch (this.edgePosition) {
        case EP_HEAD:
            p1 = edge.points.getPoint(edge.points.count() - 1).copy();
            p2 = edge.points.getPoint(edge.points.count() - 2).copy();
            break;
        case EP_TAIL:
            p1 = edge.points.getPoint(0).copy();
            p2 = edge.points.getPoint(1).copy();
            break;
        case EP_MIDDLE:
            midPointIndex = Math.floor(edge.points.count() / 2);
            if ((edge.points.count() % 2) === 0) {
                midPointIndex--;
            }
            p1 = edge.points.getPoint(midPointIndex).copy();
            p2 = edge.points.getPoint(midPointIndex + 1).copy();
            if ((edge.points.count() % 2) === 0) {
                p1.x = Math.floor((p1.x + p2.x) / 2);
                p1.y = Math.floor((p1.y + p2.y) / 2);
            }
        }
        p = Coord.getPointAwayLine(p1, p2, this.alpha, this.distance);
        this.left = p.x + p1.x - Math.floor(this.width / 2);
        this.top = p.y + p1.y - Math.floor(this.height / 2);
    };


    /**
     * NodeLabelView
     * @constructor
     * @extends NodeParasiticView
     */
    function NodeLabelView() {
        NodeParasiticView.apply(this, arguments);

        /** @member {string} */
        this.underline = false;

        this.enabled = true;
        this.movable = MM_FREE;
        this.sizable = SZ_NONE;
        this.text = "";
        this.horizontalAlignment = Graphics.AL_CENTER;
        this.verticalAlignment = Graphics.AL_MIDDLE;
    }

    // NodeLabelView inherits NodeParasiticView
    NodeLabelView.prototype = Object.create(NodeParasiticView.prototype);
    NodeLabelView.prototype.constructor = NodeLabelView;

    NodeLabelView.prototype.sizeObject = function (canvas) {
        NodeParasiticView.prototype.sizeObject.call(this, canvas);
        this.assignStyleToCanvas(canvas);
        var sz = canvas.textExtent(this.text);
        this.minWidth = sz.x;
        this.minHeight = sz.y;
        this.width = this.minWidth;
        this.height = this.minHeight;
    };

    NodeLabelView.prototype.arrange = function (canvas) {
        NodeParasiticView.prototype.arrange.call(this, canvas);
    };

    NodeLabelView.prototype.draw = function (canvas) {
        this.assignStyleToCanvas(canvas);
        canvas.textOut(this.left, this.top, this.text, 0, false, this.underline);
    };


    /**
     * EdgeLabelView
     * @constructor
     * @extends EdgeParasiticView
     */
    function EdgeLabelView() {
        EdgeParasiticView.apply(this, arguments);

        /** @member {string} */
        this.underline = false;

        this.enabled = true;
        this.movable = MM_FREE;
        this.sizable = SZ_NONE;
        this.text = "";
        this.horizontalAlignment = Graphics.AL_CENTER;
        this.verticalAlignment = Graphics.AL_MIDDLE;
    }
    // EdgeLabelView inherits EdgeParasiticView
    EdgeLabelView.prototype = Object.create(EdgeParasiticView.prototype);
    EdgeLabelView.prototype.constructor = EdgeLabelView;

    EdgeLabelView.prototype.sizeObject = function (canvas) {
        EdgeParasiticView.prototype.sizeObject.call(this, canvas);
        this.assignStyleToCanvas(canvas);
        var sz = canvas.textExtent(this.text);
        this.minWidth = sz.x;
        this.minHeight = sz.y;
        this.width = this.minWidth;
        this.height = this.minHeight;
    };

    EdgeLabelView.prototype.arrange = function (canvas) {
        EdgeParasiticView.prototype.arrange.call(this, canvas);
    };

    EdgeLabelView.prototype.draw = function (canvas) {
        this.assignStyleToCanvas(canvas);
        canvas.textOut(this.left, this.top, this.text, 0, false, this.underline);
        // EdgeParasiticView.prototype.draw.call(this, canvas);
    };


    /**
     * NodeNodeView
     * @constructor
     * @extends NodeParasiticView
     */
    function NodeNodeView() {
        NodeParasiticView.apply(this, arguments);
    }
    // NodeNodeView inherits NodeParasiticView
    NodeNodeView.prototype = Object.create(NodeParasiticView.prototype);
    NodeNodeView.prototype.constructor = NodeNodeView;


    /**
     * EdgeNodeView
     * @constructor
     * @extends EdgeParasiticView
     */
    function EdgeNodeView() {
        EdgeParasiticView.apply(this, arguments);
    }
    // EdgeNodeView inherits EdgeParasiticView
    EdgeNodeView.prototype = Object.create(EdgeParasiticView.prototype);
    EdgeNodeView.prototype.constructor = EdgeNodeView;


    /**
     * Diagram
     *
     * @constructor
     * @extends ExtensibleModel
     */
    function Diagram() {
        ExtensibleModel.apply(this, arguments);

        /** @member {boolean} */
        this.visible = true;

        /** @member {boolean} */
        this.defaultDiagram = false;

        /** @member {Array.<View>} */
        this.ownedViews = [];

        /** @member {Array.<View>} */
        this.selectedViews = [];
    }

    // Diagram inherits Model
    Diagram.prototype = Object.create(ExtensibleModel.prototype);
    Diagram.prototype.constructor = Diagram;

    Diagram.prototype.traverse = function (fun) {
        fun(this);
        for (var i = 0, len = this.ownedViews.length; i < len; i++) {
            var v = this.ownedViews[i];
            v.traverse(fun);
        }
    };

    Diagram.prototype.traverseDepthFirst = function (fun) {
        for (var i = 0, len = this.ownedViews.length; i < len; i++) {
            var v = this.ownedViews[i];
            v.traverseDepthFirst(fun);
        }
        fun(this);
    };


    Diagram.prototype.find = function (predicate) {
        if (predicate(this)) {
            return this;
        }
        var ref = this.ownedViews;
        for (var i = 0, len = ref.length; i < len; i++) {
            var v = ref[i];
            var result = v.find(predicate);
            if (result) {
                return result;
            }
        }
        return null;
    };

    Diagram.prototype.findDepthFirst = function (predicate) {
        var ref = this.ownedViews;
        for (var i = 0, len = ref.length; i < len; i++) {
            var v = ref[i];
            var result = v.findDepthFirst(predicate);
            if (result) {
                return result;
            }
        }
        if (predicate(this)) {
            return this;
        }
        return null;
    };

    Diagram.prototype.selectViewByRect = function (canvas, v, r) {
        // EdgeLabelView들은 영역에 의해 선택가능하다. (parentStyle = false 이기 때문에)
        // 하지만, LabelView, CompartmentView 들은 parentStyle = true이기 때문에 선택이 불가능하다.
        if (v.visible === true && v.enabled === true && v.parentStyle === false && (v.selectable === SK_YES)) {
            if (v.overlapRect(canvas, r)) {
                v.selected = true;
                if (!_.contains(this.selectedViews, v)) {
                    this.selectedViews.push(v);
                }
            }
        }
        for (var i = 0, len = v.subViews.length; i < len; i++) {
            var sub = v.subViews[i];
            this.selectViewByRect(canvas, sub, r);
        }
    };

    Diagram.prototype.selectView = function (v) {
        if (v.visible && v.enabled && (v.selectable === SK_YES)) {
            v.selected = true;
            if (!_.contains(this.selectedViews, v)) {
                this.selectedViews.push(v);
            }
        }
    };

    Diagram.prototype.deselectView = function (v) {
        if (v.visible && v.enabled && (v.selectable === SK_YES)) {
            v.selected = false;
            if (_.contains(this.selectedViews, v)) {
                this.selectedViews.remove(v);
            }
        }
    };

    /**
     * Draw Diagram
     * 1. setup all views (breadth-first)
     * 2. update all views (breadth-first)
     * 3. compute size of views (depth-first)
     * 4. arrange views (breadth-first)
     * 5. draw views (breadth-first)
     *
     * @param {Canvas} canvas
     * @param {?boolean} drawSelection
     */
    Diagram.prototype.drawDiagram = function (canvas, drawSelection) {
        var i, len;
        // Sort views by zIndex
        var sortedViews = _.sortBy(this.ownedViews, function (v) { return v.zIndex; });
        // Draw views
        for (i = 0, len = sortedViews.length; i < len; i++) {
            var view = sortedViews[i];
            try {
                view.setup(canvas);
                view.update(canvas);
                view.size(canvas);
                view.arrange(canvas);
                if (view.showShadow) {
                    view.drawShadow(canvas);
                }
                view.draw(canvas);
            } catch (err) {
                console.log(view);
                console.error(err);
            }
        }
        // Draw selection
        if (drawSelection !== false) {
            for (i = 0, len = this.selectedViews.length; i < len; i++) {
                var v = this.selectedViews[i];
                try {
                    v.drawSelection(canvas);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    };

    Diagram.prototype.addOwnedView = function (view) {
        this.ownedViews.add(view);
        view._parent = this;
    };

    Diagram.prototype.removeOwnedView = function (view) {
        this.ownedViews.remove(view);
        view._parent = null;
    };

    Diagram.prototype.getOwnedViewById = function (id) {
        for (var i = 0, len = this.ownedViews.length; i < len; i++) {
            var v = this.ownedViews[i];
            if (id === v._id) {
                return v;
            }
        }
        return null;
    };

    /**
     * Find a view at specific position (x, y)
     *
     * @param {Canvas} canvas
     * @param {number} x
     * @param {number} y
     * @param {boolean} shallow Find only in first level (don't find in subviews)
     * @param {?constructor} viewType
     * @return {View}
     */
    Diagram.prototype.getViewAt = function (canvas, x, y, shallow, viewType) {
        // Sort views by zIndex
        var sortedViews = _.sortBy(this.ownedViews, function (v) { return v.zIndex; });
        for (var i = sortedViews.length - 1; i >= 0; i--) {
            var v = sortedViews[i];
            if (shallow === true) {
                if (v.visible && (v.selectable === SK_YES) && v.containsPoint(canvas, x, y)) {
                    if (viewType) {
                        if (v instanceof viewType) {
                            return v;
                        }
                    } else {
                        return v;
                    }
                }
            } else {
                if (v.visible && (v.selectable !== SK_NO)) {
                    var view = v.getViewAt(canvas, x, y);
                    if (view !== null) {
                        return view;
                    }
                }
            }
        }
        if (this.containsPoint(canvas, x, y) && (this.selectable === SK_YES))  {
            return this;
        }
        return null;
    };

    /**
     * Find View at specific position (x, y) in depth-first manner
     *
     * @param {Canvas} canvas
     * @param {number} x
     * @param {number} y
     * @return {View}
     */
    Diagram.prototype.getBottomViewAt = function (canvas, x, y) {
        return this.findDepthFirst(function (v) {
            return (v instanceof View && v.visible && (v.selectable !== SK_NO) && v.containsPoint(canvas, x, y));
        });
    };

    /**
     * Get a view of a specific model
     *
     * @param {Model} model
     * @param {?constructor} viewType
     * @return {View}
     */
    Diagram.prototype.getViewOf = function (model, viewType) {
        return this.find(function (v) {
            if (viewType) {
                return (v.model === model) && (v instanceof viewType);
            } else {
                return (v.model === model);
            }
        });
    };

    Diagram.prototype.getSelectedBoundingBox = function (canvas) {
        var r = new Rect(10000, 10000, -10000, -10000);
        for (var i = 0, len = this.selectedViews.length; i < len; i++) {
            var v = this.selectedViews[i];
            r = Coord.unionRect(r, v.getBoundingBox(canvas));
        }
        return r;
    };

    Diagram.prototype.getBoundingBox = function (canvas) {
        if (this.ownedViews.length > 0) {
            var r = this.ownedViews[0].getBoundingBox(canvas);
            for (var i = 1, len = this.ownedViews.length; i < len; i++) {
                var v = this.ownedViews[i];
                r.union(v.getBoundingBox(canvas));
            }
            return r;
        }
        return new Rect(0, 0, 0, 0);
    };

    Diagram.prototype.containsPoint = function (canvas, x, y) {
        var r = this.getBoundingBox(canvas);
        return Coord.ptInRect(x, y, r);
    };

    Diagram.prototype.selectArea = function (canvas, x1, y1, x2, y2) {
        var r = new Rect(x1, y1, x2, y2);
        Coord.normalizeRect(r);
        for (var i = 0, len = this.ownedViews.length; i < len; i++) {
            var v = this.ownedViews[i];
            if (v.visible && v.enabled && (v.selectable === SK_YES) && v.overlapRect(canvas, r)) {
                if (!_.contains(this.selectedViews, v)) {
                    v.selected = true;
                    this.selectedViews.push(v);
                }
            }
            this.selectViewByRect(canvas, v, r);
        }
    };

    Diagram.prototype.selectAll = function () {
        var self = this;
        for (var i = 0, len = this.ownedViews.length; i < len; i++) {
            var v = this.ownedViews[i];
            this.selectView(v);
            v.traverse(function (sub) {
                if (sub.visible === true && sub.enabled === true && sub.parentStyle === false && sub.selectable === SK_YES) {
                    self.selectView(sub);
                }
            });
        }
    };

    Diagram.prototype.deselectAll = function () {
        for (var i = 0, len = this.selectedViews.length; i < len; i++) {
            var v = this.selectedViews[i];
            v.selected = false;
        }
        this.selectedViews.clear();
    };

    Diagram.prototype.canPaste = function (kind, copyContext) {
        return false;
    };

    /**
     * Return true only if all selected views could be copied.
     *
     * @return {Boolean}
     */
    Diagram.prototype.canCopyViews = function () {
        for (var i = 0, len = this.selectedViews.length; i < len; i++) {
            if (!this.selectedViews[i].canCopy()) {
                return false;
            }
        }
        return true;
    };

    /**
     * Return true only if all selected views could be deleted.
     *
     * @return {Boolean}
     */
    Diagram.prototype.canDeleteViews = function () {
        for (var i = 0, len = this.selectedViews.length; i < len; i++) {
            if (!this.selectedViews[i].canDelete())  {
                return false;
            }
        }
        return true;
    };

    /**
     * Determine whether views in clipboard can be pasted in this diagram.
     *
     * @param {Array.<View>} views
     * @return {Boolean}
     */
    Diagram.prototype.canPasteViews = function (views) {
        var viewTypes = MetaModelManager.getAvailableViewTypes(this.getClassName());
        return _.all(views, function (v) {
            return _.any(viewTypes, function (vt) {
                return v instanceof type[vt];
            });
        });
    };

    /**
     * Determine whether to accept to create a view of a given model drag-and-dropped from Explorer.
     *
     * @param {Model} model
     * @return {Boolean}
     */
    Diagram.prototype.canAcceptModel = function (model) {
        return false;
    };

    /**
     * Layout diagram automatically
     *
     * @param {string} direction Rank Direction ( "TB" | "BT" | "LR" | "RL" )
     * @param {{node:number, edge:number, rank:number}} separations
     */
    Diagram.prototype.layout = function (direction, separations) {
        if (typeof graphlib !== "undefined" && typeof dagre !== "undefined") {
            var i, len, v, g = new graphlib.Digraph();

            // Make Graph
            for (i = 0, len = this.ownedViews.length; i < len; i++) {
                v = this.ownedViews[i];
                if (v instanceof _global.type.NodeView) {
                    g.addNode(v._id, { width: v.width, height: v.height });
                }
            }
            for (i = 0, len = this.ownedViews.length; i < len; i++) {
                v = this.ownedViews[i];
                if (v instanceof _global.type.EdgeView && v.head instanceof type.NodeView && v.tail instanceof type.NodeView) {
                    g.addEdge(v._id, v.head._id, v.tail._id);
                }
            }

            // Layout Options
            var nodeSeparation = NODE_SEPARATION,
                edgeSeparation = EDGE_SEPARATION,
                rankSeparation = RANK_SEPARATION,
                rankDir        = DIRECTION_TB;
            if (direction) {
                rankDir = direction;
            }
            if (separations) {
                if (typeof separations.node !== undefined) { nodeSeparation = separations.node; }
                if (typeof separations.edge !== undefined) { edgeSeparation = separations.edge; }
                if (typeof separations.rank !== undefined) { rankSeparation = separations.rank; }
            }

            // Do Layout
            var layout = dagre.layout()
                .nodeSep(nodeSeparation)
                .edgeSep(edgeSeparation)
                .rankSep(rankSeparation)
                .rankDir(rankDir)
                .run(g);

            // Apply Layout Results
            var key;
            for (key in layout._nodes) {
                var node = layout._nodes[key];
                var nodeView = this.getOwnedViewById(node.id);
                nodeView.left = node.value.x - (node.value.width / 2) + LAYOUT_MARGIN_LEFT;
                nodeView.top = node.value.y - (node.value.height / 2) + LAYOUT_MARGIN_TOP;
            }
            for (key in layout._edges) {
                var edge = layout._edges[key];
                var edgeView = this.getOwnedViewById(edge.id);
                var headView = this.getOwnedViewById(edge.u);
                var tailView = this.getOwnedViewById(edge.v);
                edgeView.lineStyle = LS_CURVE;
                edgeView.points.clear();
                edgeView.points.add(tailView.getCenter());
                for (var j = edge.value.points.length - 1; j >= 0; j--) {
                    var p = edge.value.points[j];
                    edgeView.points.add(new Graphics.Point(p.x + LAYOUT_MARGIN_LEFT, p.y + LAYOUT_MARGIN_TOP));
                }
                edgeView.points.add(headView.getCenter());
            }
        }
    };


    /**
     * Project
     *
     * @constructor
     * @extends ExtensibleModel
     */
    function Project() {
        ExtensibleModel.apply(this, arguments);
        this.name = "Untitled";
        this.author = '';
        this.company = '';
        this.copyright = '';
        this.version = '';
    }

    // Project inherits ExtensibleModel
    Project.prototype = Object.create(ExtensibleModel.prototype);
    Project.prototype.constructor = Project;

    Project.prototype.canCopy = function () {
        return false;
    };

    Project.prototype.canDelete = function () {
        return false;
    };

    /**
     * Writer Class for storing Elements into JSON data.
     * @constructor
     */
    function Writer() {

        /** @member {Object<string, ?>} - 현재 저장중인 데이터 */
        this.current = {};
    }

    /**
     * Write primitive value
     *
     * @param {string} name
     * @param {string|number|boolean|null} value
     */
    Writer.prototype.write = function (name, value) {
        if (!name) {
            console.error("Writer.write(): missing required parameters: name");
            return;
        }
        if (!_.isString(value) && !_.isNumber(value) && !_.isBoolean(value) && value !== null) {
            console.error("Writer.write(): type of 'value' parameter should be one of string, number or boolean.", name + " = ", value);
            return;
        }
        this.current[name] = value;
    };

    /**
     * Write an Object
     *
     * @param {string} name
     * @param {Element} value
     */
    Writer.prototype.writeObj = function (name, value) {
        if (!name) {
            console.error("Writer.writeObj(): missing required parameters: name");
            return;
        }
        if (value && value instanceof Element) {
            var temp = this.current;
            this.current[name] = {};
            this.current = this.current[name];
            value.save(this);
            this.current = temp;
        } else {
            this.current[name] = null;
        }
    };

    /**
     * Write an Array of Objects
     *
     * @param {string} name
     * @param {Array.<Element>} value
     */
    Writer.prototype.writeObjArray = function (name, value) {
        if (!name) {
            console.error("Writer.writeObjArray(): missing required parameters: name");
            return;
        }
        if (!_.isArray(value)) {
            console.error("Writer.writeObjArray(): type of 'value' parameter should be an array.", name + " = ", value);
            return;
        }
        var temp = this.current;
        this.current[name] = [];
        var i, len,
            array = this.current[name];
        for (i = 0, len = value.length; i < len; i++) {
            var o = value[i];
            if (o instanceof Element) {
                this.current = {};
                o.save(this);
                array.push(this.current);
            } else {
                console.error("Writer.writeObjArray(): one of 'value' array is not instanceof Core.Element.", o);
                return;
            }
        }
        this.current = temp;
    };

    /**
     * Write a Reference
     *
     * @param {string} name
     * @param {Element} value
     */
    Writer.prototype.writeRef = function (name, value) {
        if (!name) {
            console.error("Writer.writeRef(): missing required parameters: name");
            return;
        }
        if (value) {
            if (value instanceof Element) {
                this.current[name] = { $ref: value._id };
            } else {
                console.error("Writer.writeRef(): 'value' parameter is not instanceof Core.Element.", name + " = ", value);
                return;
            }
        } else {
            this.current[name] = null;
        }
    };

    /**
     * Write an Array of Reference
     *
     * @param {string} name
     * @param {Array.<Element>} value
     */
    Writer.prototype.writeRefArray = function (name, value) {
        if (!name) {
            console.error("Writer.writeRefArray(): missing required parameters: name");
            return;
        }
        if (!_.isArray(value)) {
            console.error("Writer.writeRefArray(): type of 'value' parameter should be an array.", name + " = ", value);
            return;
        }
        var temp = this.current;
        this.current[name] = [];
        var i, len,
            array = this.current[name];
        for (i = 0, len = value.length; i < len; i++) {
            var o = value[i];
            if (o instanceof Element) {
                var ref = { $ref: o._id };
                array.push(ref);
            } else {
                console.error("Writer.writeRefArray(): one of 'value' array is not instanceof Core.Element.", o);
                return;
            }
        }
        this.current = temp;
    };

    /**
     * Write a Variant (Primitive or Reference)
     *
     * @param {string} name
     * @param {number|string|boolean|Element} value
     */
    Writer.prototype.writeVariant = function (name, value) {
        if (!name) {
            console.error("Writer.writeVariant(): missing required parameters: name");
            return;
        }
        if (value === null) {
            this.current[name] = null;
        } else if (value instanceof Element) {
            this.current[name] = { $ref: value._id };
        } else if (_.isString(value) || _.isNumber(value) || _.isBoolean(value)) {
            this.current[name] = value;
        } else {
            console.error("Writer.writeVariant(): invalid type of parameter: value.", name + " = ", value);
        }
    };

    /**
     * Write a Custom Object (Custom Object have it's own method to store itself)
     *
     * @param {string} name
     * @param {{__write: function()}} value
     */
    Writer.prototype.writeCustom = function (name, value) {
        if (!name) {
            console.error("Writer.writeCustom(): missing required parameters: name");
            return;
        }
        if (value) {
            if (_.isFunction(value.__write)) {
                this.current[name] = value.__write();
            } else {
                console.error("Writer.writeCustom(): the 'value' parameter should have '__write' function", name + " = ", value);
                return;
            }
        } else {
            console.error("Writer.writeCustom(): missing required parameters: value");
            return;
        }
    };

    /**
     * Reader Class
     * @constructor
     * @param {Object} data
     * @param {Object.<string, constructor>} ctors
     */
    function Reader(data, ctors) {
        if (!_.isObject(data)) {
            console.error("Reader constructor: 'data' parameter should be JSON object");
            return;
        }
        this.data = data;
        this.ctors = ctors;
        this.current = this.data;
        this.idMap = {};
    }

    /**
     * Read primitive type
     * @param {string} name
     * @return {number|string|boolean|null}
     */
    Reader.prototype.read = function (name) {
        if (!name) {
            console.error("Reader.read(): missing required parameters: name");
            return;
        }

        var value = this.current[name];

        if (typeof value !== "undefined") {
            // Check type of data to be read
            if (!_.isString(value) && !_.isNumber(value) && !_.isBoolean(value) && value !== null) {
                console.error("Reader.read(): type of data to be read should be one of number, string, boolean, or null.", name + " = ", value);
                return;
            }
            return this.current[name];
        }
        return undefined;
    };

    /**
     * Read an Object
     * @param {string} name
     * @return {Element}
     */
    Reader.prototype.readObj = function (name) {
        if (!name) {
            console.error("Reader.readObj(): missing required parameters: name");
            return;
        }

        var value = this.current[name];

        if (typeof value !== "undefined") {
            // Check type of data to be read
            if (!_.isObject(value)) {
                console.error("Reader.readObj(): type of data to be read should be an Object.", name + " = ", value);
                return;
            }
            if (!value._type) {
                console.error("Reader.readObj(): '_type' field is not found to instantiate an Object.", name + " = ", value);
                return;
            }
            if (!_.isFunction(this.ctors[value._type])) {
                console.error("Reader.readObj(): type." + value._type + " is not registered.");
                return;
            }

            var obj = new this.ctors[value._type]();
            var temp = this.current;
            this.current = value;
            obj.load(this);
            this.current = temp;

            // Register to idMap
            this.idMap[obj._id] = obj;

            return obj;
        }
        return undefined;
    };

    /**
     * Read an Array of Object
     * @param {string} name
     * @return {Array.<Element>}
     */
    Reader.prototype.readObjArray = function (name) {
        if (!name) {
            console.error("Reader.readObjArray(): missing required parameters: name");
            return;
        }

        var value = this.current[name];

        if (typeof value !== "undefined") {
            // Check type of data to be read
            if (!_.isArray(value)) {
                console.error("Reader.readObjArray(): type of data to be read should be an array.", name + " = ", value);
                return;
            }

            var ref = value;
            var i, len, array = [];
            for (i = 0, len = ref.length; i < len; i++) {
                var o = ref[i];

                // Check type of an element of array
                if (!_.isObject(o)) {
                    console.error("Reader.readObjArray(): one of array elements is not Object.", o);
                    continue;
                }
                if (!o._type) {
                    console.error("Reader.readObjArray(): '_type' field is not found to instantiate an Object.", o);
                    continue;
                }
                if (!_.isFunction(this.ctors[o._type])) {
                    console.error("Reader.readObjArray(): type." + o._type + " is not registered.");
                    continue;
                }

                var obj = new this.ctors[o._type]();
                var temp = this.current;
                this.current = o;
                obj.load(this);
                this.current = temp;

                // Register to idMap
                this.idMap[obj._id] = obj;
                array.push(obj);
            }
            return array;
        }
        return undefined;
    };

    /**
     * Read a reference to an Object. The returned {$ref} object should be resolved later.
     * @param {string} name
     * @return {{$ref:string}}
     */
    Reader.prototype.readRef = function (name) {
        if (!name) {
            console.error("Reader.readRef(): missing required parameters: name");
            return;
        }

        var value = this.current[name];

        if (typeof value !== "undefined") {
            // Check type of data to be read
            if (value && !_.isString(value.$ref)) {
                console.error("Reader.readRef(): data is not a reference ('$ref' not found).", name + " = ", value);
                return;
            }

            return value;
        }
        return undefined;
    };

    /**
     * Read an array of reference.
     * @param {string} name
     * @return {Array.<{$ref:string}>}
     */
    Reader.prototype.readRefArray = function (name) {
        if (!name) {
            console.error("Reader.readRefArray(): missing required parameters: name");
            return;
        }

        var value = this.current[name];

        if (typeof value !== "undefined") {
            // Check type of data to be read
            if (!_.isArray(value)) {
                console.error("Reader.readRefArray(): type of data to be read should be an array.", name + " = ", value);
                return;
            }

            var array = [];
            var i, len, ref = this.current[name];
            for (i = 0, len = ref.length; i < len; i++) {
                var _refObj = ref[i];

                // Check type of an element of array
                if (!_.isObject(_refObj)) {
                    console.error("Reader.readRefArray(): one of array elements is not Object.", _refObj);
                    return;
                }
                if (!_.isString(_refObj.$ref)) {
                    console.error("Reader.readRefArray(): data is not a reference ('$ref' not found).", _refObj);
                    return;
                }

                array.push(_refObj);
            }
            return array;
        }
        return undefined;
    };

    /**
     * Read Variant
     * @param {string} name
     * @return {{$ref:string}|null|number|boolean|string}
     */
    Reader.prototype.readVariant = function (name) {
        if (!name) {
            console.error("Reader.readVariant(): missing required parameters: name");
            return;
        }

        var value = this.current[name];

        if (typeof value !== "undefined") {
            // Check type of data to be read
            if (!_.isString(value) && !_.isNumber(value) && !_.isBoolean(value) && value !== null && !_.isString(value.$ref)) {
                console.error("Reader.readVariant(): type of data to be read should be one of number, string, boolean, null, or reference.", name + " = ", value);
                return;
            }

            return this.current[name];
        }
        return undefined;
    };

    /**
     * Read a custom object
     * @param {string} typeName
     * @param {string} name
     * @return {{__read: function(Object)}}
     */
    Reader.prototype.readCustom = function (typeName, name) {
        if (!name) {
            console.error("Reader.readCustom(): missing required parameters: name");
            return;
        }

        var value = this.current[name];

        if (typeof value !== "undefined") {
            if (!_.isFunction(this.ctors[typeName])) {
                console.error("Reader.readCustom(): type." + typeName + " is not registered.");
                return;
            }

            var custom = new this.ctors[typeName]();

            if (!_.isFunction(custom.__read)) {
                console.error("Reader.readCustom(): Object of type." + typeName + " should have '__read' function.", custom);
                return;
            }

            custom.__read(value);
            return custom;
        }
        return undefined;
    };

    /**
     * Return a super type of a given type.
     *
     * @param {constructor} subType
     * @return {constructor} - superType of subType
     */
    function getSuperType(subType) {
        if (subType) {
            return _global.type[_global.meta[subType.name].super];
        } else {
            return null;
        }
    }

    /**
     * Return a generalized type of given elements.
     *
     * @param {Array.<Element>} elems
     * @return {constructor}
     */
    function getCommonType(elems) {
        if (elems && elems.length > 0) {
            var commonType = elems[0].getClass();
            while (!_.every(elems, function (e) { return (e instanceof commonType); })) {
                commonType = getSuperType(commonType);
            }
            return commonType;
        } else {
            return null;
        }
    }

    /**
     * Find element by name in a given array.
     *
     * @param {Array.<Element>} array
     * @param {string} name
     * @return {Element}
     */
    function findByName(array, name) {
        if (array && array.length > 0) {
            for (var i = 0, len = array.length; i < len; i++) {
                var elem = array[i];
                if (elem.name == name) {
                    return elem;
                }
            }
        }
        return null;
    }

    /**
     * Find an available name in a given array. (e.g. Class1, Class2, ... )
     *
     * @param {Array.<Element>} array
     * @param {string} prefix Prefix for name
     * @return {string} Return a new name
     */
    function getNewName(array, prefix) {
        var num = 0, name = null;
        do {
            num++;
            name = prefix + num;
        } while (findByName(array, name));
        return name;
    }

    // Type definitions
    _global.type.Element                = Element;
    _global.type.Model                  = Model;
    _global.type.Tag                    = Tag;
    _global.type.Hyperlink              = Hyperlink;
    _global.type.ExtensibleModel        = ExtensibleModel;
    _global.type.Relationship           = Relationship;
    _global.type.DirectedRelationship   = DirectedRelationship;
    _global.type.RelationshipEnd        = RelationshipEnd;
    _global.type.UndirectedRelationship = UndirectedRelationship;
    _global.type.View                   = View;
    _global.type.NodeView               = NodeView;
    _global.type.EdgeView               = EdgeView;
    _global.type.LabelView              = LabelView;
    _global.type.ParasiticView          = ParasiticView;
    _global.type.NodeParasiticView      = NodeParasiticView;
    _global.type.EdgeParasiticView      = EdgeParasiticView;
    _global.type.NodeLabelView          = NodeLabelView;
    _global.type.EdgeLabelView          = EdgeLabelView;
    _global.type.NodeNodeView           = NodeNodeView;
    _global.type.EdgeNodeView           = EdgeNodeView;
    _global.type.Diagram                = Diagram;
    _global.type.Project                = Project;

    // Define public API

    exports.ATTR_KIND_PRIM          = ATTR_KIND_PRIM;
    exports.ATTR_KIND_ENUM          = ATTR_KIND_ENUM;
    exports.ATTR_KIND_REF           = ATTR_KIND_REF;
    exports.ATTR_KIND_REFS          = ATTR_KIND_REFS;
    exports.ATTR_KIND_OBJ           = ATTR_KIND_OBJ;
    exports.ATTR_KIND_OBJS          = ATTR_KIND_OBJS;
    exports.ATTR_KIND_VAR           = ATTR_KIND_VAR;
    exports.ATTR_KIND_CUSTOM        = ATTR_KIND_CUSTOM;

    exports.SK_NO                   = SK_NO;
    exports.SK_YES                  = SK_YES;
    exports.SK_PROPAGATE            = SK_PROPAGATE;

    exports.SZ_NONE                 = SZ_NONE;
    exports.SZ_HORZ                 = SZ_HORZ;
    exports.SZ_VERT                 = SZ_VERT;
    exports.SZ_RATIO                = SZ_RATIO;
    exports.SZ_FREE                 = SZ_FREE;

    exports.MM_NONE                 = MM_NONE;
    exports.MM_HORZ                 = MM_HORZ;
    exports.MM_VERT                 = MM_VERT;
    exports.MM_FREE                 = MM_FREE;

    exports.LM_SOLID                = LM_SOLID;
    exports.LM_DOT                  = LM_DOT;

    exports.LS_RECTILINEAR          = LS_RECTILINEAR;
    exports.LS_OBLIQUE              = LS_OBLIQUE;
    exports.LS_ROUNDRECT            = LS_ROUNDRECT;
    exports.LS_CURVE                = LS_CURVE;

    exports.ES_FLAT                 = ES_FLAT;
    exports.ES_STICK_ARROW          = ES_STICK_ARROW;
    exports.ES_SOLID_ARROW          = ES_SOLID_ARROW;
    exports.ES_TRIANGLE             = ES_TRIANGLE;
    exports.ES_FILLED_TRIANGLE      = ES_FILLED_TRIANGLE;
    exports.ES_DIAMOND              = ES_DIAMOND;
    exports.ES_FILLED_DIAMOND       = ES_FILLED_DIAMOND;
    exports.ES_ARROW_DIAMOND        = ES_ARROW_DIAMOND;
    exports.ES_ARROW_FILLED_DIAMOND = ES_ARROW_FILLED_DIAMOND;
    exports.ES_PLUS                 = ES_PLUS;
    exports.ES_CIRCLE               = ES_CIRCLE;
    exports.ES_CIRCLE_PLUS          = ES_CIRCLE_PLUS;
    exports.ES_CROWFOOT_ONE         = ES_CROWFOOT_ONE;
    exports.ES_CROWFOOT_MANY        = ES_CROWFOOT_MANY;
    exports.ES_CROWFOOT_ZERO_ONE    = ES_CROWFOOT_ZERO_ONE;
    exports.ES_CROWFOOT_ZERO_MANY   = ES_CROWFOOT_ZERO_MANY;


    exports.EP_HEAD                 = EP_HEAD;
    exports.EP_MIDDLE               = EP_MIDDLE;
    exports.EP_TAIL                 = EP_TAIL;

    exports.DK_HORZ                 = DK_HORZ;
    exports.DK_VERT                 = DK_VERT;

    exports.DIRECTION_TB            = DIRECTION_TB;
    exports.DIRECTION_BT            = DIRECTION_BT;
    exports.DIRECTION_LR            = DIRECTION_LR;
    exports.DIRECTION_RL            = DIRECTION_RL;

    exports.TK_STRING               = TK_STRING;
    exports.TK_REFERENCE            = TK_REFERENCE;
    exports.TK_BOOLEAN              = TK_BOOLEAN;
    exports.TK_NUMBER               = TK_NUMBER;
    exports.TK_HIDDEN               = TK_HIDDEN;


    // Public Classes
    exports.Element                 = Element;
    exports.Model                   = Model;
    exports.Tag                     = Tag;
    exports.Hyperlink               = Hyperlink;
    exports.ExtensibleModel         = ExtensibleModel;
    exports.Relationship            = Relationship;
    exports.DirectedRelationship    = DirectedRelationship;
    exports.RelationshipEnd         = RelationshipEnd;
    exports.UndirectedRelationship  = UndirectedRelationship;
    exports.View                    = View;
    exports.NodeView                = NodeView;
    exports.EdgeView                = EdgeView;
    exports.LabelView               = LabelView;
    exports.ParasiticView           = ParasiticView;
    exports.NodeParasiticView       = NodeParasiticView;
    exports.EdgeParasiticView       = EdgeParasiticView;
    exports.NodeLabelView           = NodeLabelView;
    exports.EdgeLabelView           = EdgeLabelView;
    exports.NodeNodeView            = NodeNodeView;
    exports.EdgeNodeView            = EdgeNodeView;
    exports.Diagram                 = Diagram;
    exports.Project                 = Project;
    exports.Reader                  = Reader;
    exports.Writer                  = Writer;

    // Public Functions
    exports.getSuperType            = getSuperType;
    exports.getCommonType           = getCommonType;
    exports.findByName              = findByName;
    exports.getNewName              = getNewName;
});

