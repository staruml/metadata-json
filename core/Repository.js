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
/*global define, $, _, type*/

/**
 * Repository maintains a set of elements.
 *
 * Reponsibilities:
 * - Applies operations. (Undo/Redo)
 * - Query for retrieve elements.
 *
 * This module dispatches these events:
 * - created:                (elems)
 * - updated:                (elems)
 * - deleted:                (elems)
 * - reordered:              (elem)
 * - relocated:              (elem, field, oldParent, newParent)
 * - beforeExecuteOperation: (operation)
 * - operationExecuted:      (operation) - after doOperation, undo, redo
 * - beforeUndo:             (operation)
 * - beforeRedo:             (operation)
 */
define(function (require, exports, module) {
    "use strict";

    var _global          = require("core/Global").global,
        IdGenerator      = require("core/IdGenerator"),
        Core             = require("core/Core"),
        OperationBuilder = require("core/OperationBuilder");

    /**
     * Size-limited Stack
     * @private
     * @constructor
     */
    function Stack(maxSize) {
        this.maxSize = maxSize;
        this.stack = [];
    }

    /**
     * Clear stack.
     */
    Stack.prototype.clear = function () {
        this.stack = [];
    };

    /**
     * Push an item
     * @param {?} item Item to be stacked.
     */
    Stack.prototype.push = function (item) {
        this.stack.push(item);
        if (this.stack.length > this.maxSize) {
            this.stack.splice(0, 1);
        }
    };

    /**
     * Pop an item from the top
     * @return {?} Item on the top.
     */
    Stack.prototype.pop = function () {
        return this.stack.pop();
    };

    /**
     * Return size of stack
     * @return {number} Size of stack.
     */
    Stack.prototype.size = function () {
        return this.stack.length;
    };


    /**
     * Maximum size of undo/redo stack
     * @const
     */
    var MAX_STACK_SIZE = 100;

    /**
     * Map for id to Element.
     * @private
     * @type {Object.<string,Element>}
     */
    var _idMap = {};

    /**
     * Inverted index for referencing: {id, {id, refCount}}.
     * @private
     * @type {Object.<string,Object.<string,number>>}
     */
    var _refMap = {};

    /**
     * Indicate model is modified or not.
     * @private
     * @type {boolean}
     */
    var _modified = false;

    /**
     * Undo stack.
     * @private
     * @type {Stack}
     */
    var _undoStack = new Stack(MAX_STACK_SIZE);

    /**
     * Redo stack.
     * @private
     * @type {Stack}
     */
    var _redoStack = new Stack(MAX_STACK_SIZE);

    /**
     * Add a reference to the inverted index. (increase refCount by one)
     *
     * @private
     * @param {Core.Element} refer Referencing element.
     * @param {Core.Element} refee Referenced element.
     */
    function _addRef(refer, refee) {
        var item = _refMap[refee._id];
        if (!item) {
            item = {};
            _refMap[refee._id] = item;
        }
        var count = item[refer._id];
        if (count) {
            item[refer._id] = count + 1;
        } else {
            item[refer._id] = 1;
        }
    }

    /**
     * Remove a reference from the inverted index. (Decrease refCount by one. Remove the entry if refCount reached zero)
     *
     * @private
     * @param {Core.Element} refer Referencing element.
     * @param {Core.Element} refee Referenced element.
     */
    function _removeRef(refer, refee) {
        var item = _refMap[refee._id];
        if (item) {
            var count = item[refer._id];
            if (count && (count > 0)) {
                item[refer._id] = count - 1;
            } else {
                item[refer._id] = 0;
            }
            if (item[refer._id] === 0) {
                delete item[refer._id];
            }
        }
    }

    /**
     * 요소의 모든 참조 필드들을 레퍼런스 인덱스에 추가
     *
     * @private
     * @param {Core.Element} elem
     */
    function _addRefsOf(elem) {
        _.forEach(elem.getMetaAttributes(), function (attr) {
            var i;
            switch (attr.kind) {
            case Core.ATTR_KIND_OBJ:
            case Core.ATTR_KIND_REF:
                var ref = elem[attr.name];
                if (ref && _idMap[ref._id]) {
                    _addRef(elem, ref);
                }
                break;
            case Core.ATTR_KIND_OBJS:
            case Core.ATTR_KIND_REFS:
                var refs = elem[attr.name];
                if (refs && refs.length > 0) {
                    for (i = 0; i < refs.length; i++) {
                        if (refs[i] && refs[i]._id && _idMap[refs[i]._id]) {
                            _addRef(elem, refs[i]);
                        }
                    }
                }
                break;
            }
        });
    }

    /**
     * 요소의 모든 참조 필드들을 레퍼런스 인덱스에서 제거 (요소가 제거될 것이므로 본 요소가 가지는 모든 참조는 제거됨)
     *
     * @private
     * @param {Core.Element} elem
     */
    function _removeRefsOf(elem) {
        _.forEach(elem.getMetaAttributes(), function (attr) {
            var i;
            switch (attr.kind) {
            case Core.ATTR_KIND_OBJ:
            case Core.ATTR_KIND_REF:
                var ref = elem[attr.name];
                if (ref && _idMap[ref._id]) {
                    _removeRef(elem, ref);
                }
                break;
            case Core.ATTR_KIND_OBJS:
            case Core.ATTR_KIND_REFS:
                var refs = elem[attr.name];
                if (refs && refs.length > 0) {
                    for (i = 0; i < refs.length; i++) {
                        if (refs[i]._id && _idMap[refs[i]._id]) {
                            _removeRef(elem, refs[i]);
                        }
                    }
                }
                break;
            }
        });
        // 인덱스에서 항목을 제거.
        delete _refMap[elem._id];
    }

    /**
     * Operation 수행하기.
     *
     * @private
     * @param {Operation} operation
     */
    function _applyOperation(operation) {
        var i,
            j,
            len,
            op,
            id,
            name,
            elem,
            obj,
            reader,
            val;
        var createdElems = [],
            deletedElems = [],
            updatedElems = [];
        // 1) 요소들의 생성 및 인덱스 등록
        for (i = 0, len = operation.ops.length; i < len; i++) {
            op = operation.ops[i];
            switch (op.op) {
            case OperationBuilder.OP_INSERT:
                reader = new Core.Reader({ data: op.arg }, _global.type);
                elem = reader.readObj("data");
                op._elem = elem;
                op._idMap = reader.idMap;
                // 인덱스에 등록하기
                for (id in reader.idMap) {
                    if (reader.idMap.hasOwnProperty(id)) {
                        obj = reader.idMap[id];
                        _idMap[obj._id] = obj;
                    }
                }
                break;
            case OperationBuilder.OP_REMOVE:
                reader = new Core.Reader({ data: op.arg }, _global.type);
                elem = reader.readObj("data");
                op._elem = elem;
                op._idMap = reader.idMap;
                // 레퍼런스 인덱스에서 제거하기
                for (id in op._idMap) {
                    if (op._idMap.hasOwnProperty(id)) {
                        if (!_.isUndefined(_idMap[id])) {
                            _removeRefsOf(_idMap[id]);
                        }
                    }
                }
                break;
            }
        }
        // 2) 요소들의 필드값 적용
        for (i = 0, len = operation.ops.length; i < len; i++) {
            op = operation.ops[i];
            switch (op.op) {
            case OperationBuilder.OP_INSERT:
                elem = op._elem;
                // 레퍼런스 값들을 복원하기.
                for (id in op._idMap) {
                    if (op._idMap.hasOwnProperty(id)) {
                        obj = op._idMap[id];
                        for (name in obj) {
                            if (obj.hasOwnProperty(name)) {
                                val = obj[name];
                                // if val is a reference
                                if (val && val.$ref) {
                                    obj[name] = _idMap[val.$ref];
                                // if val is an array reference
                                } else if (_.isArray(val)) {
                                    for (j = 0; j < val.length; j++) {
                                        if (val[j] && val[j].$ref) {
                                            val[j] = _idMap[val[j].$ref];
                                        }
                                    }
                                }
                            }
                        }
                        // obj의 참조들을 레퍼런스 인덱스에 추가하기
                        _addRefsOf(obj);
                    }
                }
                createdElems.push(elem);
                break;
            case OperationBuilder.OP_REMOVE:
                elem = op._elem;
                // 인덱스에서 제거하기
                for (id in op._idMap) {
                    if (op._idMap.hasOwnProperty(id)) {
                        delete _idMap[id];
                        delete _refMap[id];
                    }
                }
                deletedElems.push(elem);
                break;
            case OperationBuilder.OP_FIELD_ASSIGN:
                elem = _idMap[op.arg._id];
                if (elem[op.arg.f] && elem[op.arg.f].__read) {
                    elem[op.arg.f].__read(op.arg.n);
                } else {
                    if (op.arg.n && op.arg.n._id) {
                        elem[op.arg.f] = _idMap[op.arg.n._id];
                    } else {
                        elem[op.arg.f] = op.arg.n;
                    }
                    // oldVal를 레퍼런스 인덱스에서 제거
                    if (op.arg.o && op.arg.o._id) {
                        _removeRef(elem, op.arg.o);
                    }
                    // newVal를 레퍼런스 인덱스에 추가
                    if (op.arg.n && op.arg.n._id) {
                        _addRef(elem, op.arg.n);
                    }
                }
                updatedElems.push(elem);
                break;
            case OperationBuilder.OP_FIELD_INSERT:
                elem = _idMap[op.arg._id];
                val = _idMap[op.arg.e];
                if (elem && val) {
                    elem[op.arg.f].insert(op.arg.i, val);
                    // val을 레퍼런스 인덱스에 추가
                    if (val._id) {
                        _addRef(elem, val);
                    }
                }
                updatedElems.push(elem);
                break;
            case OperationBuilder.OP_FIELD_REMOVE:
                elem = _idMap[op.arg._id];
                val = _idMap[op.arg.e];
                if (elem && val) {
                    // 레퍼런스 인덱스에서 제거
                    if (val._id) {
                        _removeRef(elem, val);
                    }
                    elem[op.arg.f].remove(val);
                }
                updatedElems.push(elem);
                break;
            case OperationBuilder.OP_FIELD_REORDER:
                elem = _idMap[op.arg._id];
                val = _idMap[op.arg.e];
                // Store old index of val in the array field of element.
                op.arg.oi = _.indexOf(elem[op.arg.f], val);
                if (elem && val) {
                    elem[op.arg.f].remove(val);
                    elem[op.arg.f].insert(op.arg.i, val);
                }
                // updatedElems.push(elem);
                try {
                    $(exports).triggerHandler('reordered', [val]);
                } catch (err) {
                    console.error(err);
                }
                break;
            case OperationBuilder.OP_FIELD_RELOCATE:
                elem = _idMap[op.arg._id];
                var oldParent  = _idMap[op.arg.op];
                var newParent  = _idMap[op.arg.np];
                if (elem && oldParent && newParent) {
                    oldParent[op.arg.f].remove(elem);
                    newParent[op.arg.f].push(elem);
                    elem._parent = newParent;
                    _removeRef(oldParent, elem);
                    _addRef(newParent, elem);
                }
                try {
                    $(exports).triggerHandler('relocated', [elem, op.arg.f, oldParent, newParent]);
                } catch (err) {
                    console.error(err);
                }
                break;
            }
        }
        // Bypass Operation가 아니면 이벤트를 발생한다.
        if (operation.bypass !== true) {
            if (createdElems.length > 0) {
                try {
                    $(exports).triggerHandler('created', [createdElems]);
                } catch (err) {
                    console.error(err);
                }
            }
            if (deletedElems.length > 0) {
                try {
                    $(exports).triggerHandler('deleted', [deletedElems]);
                } catch (err) {
                    console.error(err);
                }
            }
            if (updatedElems.length > 0) {
                try {
                    $(exports).triggerHandler('updated', [updatedElems]);
                } catch (err) {
                    console.error(err);
                }
            }
            setModified(true);
        }
    }

    /**
     * Operation 되돌리기.
     *
     * @private
     * @param {Operation} operation
     */
    function _revertOperation(operation) {
        var i,
            j,
            id,
            name,
            op,
            obj,
            elem,
            reader,
            val;
        var createdElems = [],
            deletedElems = [],
            updatedElems = [];
        // 1) 요소들의 복구 및 인덱스 등록
        for (i = operation.ops.length - 1; i >= 0; i--) {
            op = operation.ops[i];
            switch (op.op) {
            case OperationBuilder.OP_INSERT:
                reader = new Core.Reader({ data: op.arg }, _global.type);
                elem = reader.readObj("data");
                op._elem = elem;
                op._idMap = reader.idMap;
                // 레퍼런스 인덱스에서 제거하기
                for (id in op._idMap) {
                    if (op._idMap.hasOwnProperty(id)) {
                        _removeRefsOf(_idMap[id]);
                    }
                }
                break;
            case OperationBuilder.OP_REMOVE:
                reader = new Core.Reader({ data: op.arg }, _global.type);
                elem = reader.readObj("data");
                op._elem = elem;
                op._idMap = reader.idMap;
                // 인덱스에 등록하기
                for (id in reader.idMap) {
                    if (reader.idMap.hasOwnProperty(id)) {
                        obj = reader.idMap[id];
                        _idMap[obj._id] = obj;
                    }
                }
                break;
            }
        }
        // 2) 요소들의 필드값 복구
        for (i = operation.ops.length - 1; i >= 0; i--) {
            op = operation.ops[i];
            switch (op.op) {
            case OperationBuilder.OP_INSERT:
                elem = op._elem;
                // 인덱스에서 제거하기
                for (id in op._idMap) {
                    if (op._idMap.hasOwnProperty(id)) {
                        delete _idMap[id];
                        delete _refMap[id];
                    }
                }
                deletedElems.push(elem);
                break;
            case OperationBuilder.OP_REMOVE:
                elem = op._elem;
                // 레퍼런스 값들을 복원하기.
                for (id in op._idMap) {
                    if (op._idMap.hasOwnProperty(id)) {
                        obj = op._idMap[id];
                        for (name in obj) {
                            if (obj.hasOwnProperty(name)) {
                                val = obj[name];
                                // if val is a reference
                                if (val && val.$ref) {
                                    obj[name] = _idMap[val.$ref];
                                // if val is an array reference
                                } else if (_.isArray(val)) {
                                    for (j = 0; j < val.length; j++) {
                                        if (val[j] && val[j].$ref) {
                                            val[j] = _idMap[val[j].$ref];
                                        }
                                    }
                                }
                            }
                        }
                        // obj의 참조들을 레퍼런스 인덱스에 추가하기
                        _addRefsOf(obj);
                    }
                }
                createdElems.push(elem);
                break;
            case OperationBuilder.OP_FIELD_ASSIGN:
                elem = _idMap[op.arg._id];
                if (elem[op.arg.f] && elem[op.arg.f].__read) {
                    elem[op.arg.f].__read(op.arg.o);
                } else {
                    if (op.arg.o && op.arg.o._id) {
                        elem[op.arg.f] = _idMap[op.arg.o._id];
                    } else {
                        elem[op.arg.f] = op.arg.o;
                    }
                    // oldVal를 레퍼런스 인덱스에 추가
                    if (op.arg.o && op.arg.o._id) {
                        _addRef(elem, op.arg.o);
                    }
                    // newVal를 레퍼런스 인덱스에서 제거
                    if (op.arg.n && op.arg.n._id) {
                        _removeRef(elem, op.arg.n);
                    }
                }
                updatedElems.push(elem);
                break;
            case OperationBuilder.OP_FIELD_INSERT:
                elem = _idMap[op.arg._id];
                val = _idMap[op.arg.e];
                if (elem && val) {
                    elem[op.arg.f].remove(val);
                    // val 레퍼런스 인덱스에서 제거
                    if (val._id) {
                        _removeRef(elem, val);
                    }
                }
                updatedElems.push(elem);
                break;
            case OperationBuilder.OP_FIELD_REMOVE:
                elem = _idMap[op.arg._id];
                val = _idMap[op.arg.e];
                if (elem && val) {
                    elem[op.arg.f].insert(op.arg.i, val);
                    // val을 레퍼런스 인덱스에 추가
                    if (val._id) {
                        _addRef(elem, val);
                    }
                }
                updatedElems.push(elem);
                break;
            case OperationBuilder.OP_FIELD_REORDER:
                elem = _idMap[op.arg._id];
                val = _idMap[op.arg.e];
                if (elem && val) {
                    elem[op.arg.f].remove(val);
                    elem[op.arg.f].insert(op.arg.oi, val);
                }
                // updatedElems.push(elem);
                try {
                    $(exports).triggerHandler('reordered', [elem]);
                } catch (err) {
                    console.error(err);
                }
                break;
            case OperationBuilder.OP_FIELD_RELOCATE:
                elem = _idMap[op.arg._id];
                var oldParent  = _idMap[op.arg.op];
                var newParent  = _idMap[op.arg.np];
                if (elem && oldParent && newParent) {
                    newParent[op.arg.f].remove(elem);
                    oldParent[op.arg.f].push(elem);
                    elem._parent = oldParent;
                    _removeRef(newParent, elem);
                    _addRef(oldParent, elem);
                }
                try {
                    $(exports).triggerHandler('relocated', [elem, op.arg.f, newParent, oldParent]);
                } catch (err) {
                    console.error(err);
                }
                break;
            }
        }
        if (createdElems.length > 0) {
            try {
                $(exports).triggerHandler('created', [createdElems]);
            } catch (err) {
                console.error(err);
            }
        }
        if (deletedElems.length > 0) {
            try {
                $(exports).triggerHandler('deleted', [deletedElems]);
            } catch (err) {
                console.error(err);
            }
        }
        if (updatedElems.length > 0) {
            try {
                $(exports).triggerHandler('updated', [updatedElems]);
            } catch (err) {
                console.error(err);
            }
        }
        setModified(true);
    }

    /**
     * Encode a given element to JSON data.
     * @private
     * @param {Core.Element} elem Element to be encoded
     * @return {string} JSON-encoded data.
     */
    function writeObject(elem) {
        var writer = new Core.Writer();
        elem.save(writer);
        var data = JSON.stringify(writer.current, null, "\t");
        return data;
    }


    /**
     * Read object from JSON data
     * @private
     * @param {string|Object} data - Object or JSON-string
     * @param {?boolean} replaceIds
     * @return {Core.Element}
     */
    function readObject(data, replaceIds) {
        var element = null,
            id,
            name,
            obj,
            val,
            _replaceIdMap;

        function _replaceRef(item) {
            var newId = _replaceIdMap[item.$ref];
            if (newId) {
                item.$ref = newId;
            }
        }

        function _resolveRef(item) {
            return _idMap[item.$ref];
        }

        if (data) {
            if (_.isString(data)) {
                data = JSON.parse(data);
            }
            var reader = new Core.Reader({data: data}, _global.type);
            element = reader.readObj("data");

            // Replace all ids
            if (replaceIds) {

                // Map.<oldId, newId>
                _replaceIdMap = {};

                // Assign new ids
                for (id in reader.idMap) {
                    if (reader.idMap.hasOwnProperty(id)) {
                        var newId = IdGenerator.generateGuid();
                        obj = reader.idMap[id];
                        _replaceIdMap[obj._id] = newId;
                        delete reader.idMap[obj._id];
                        obj._id = newId;
                        reader.idMap[newId] = obj;
                    }
                }

                // Fix all refs to refer to new ids
                for (id in reader.idMap) {
                    if (reader.idMap.hasOwnProperty(id)) {
                        obj = reader.idMap[id];
                        for (name in obj) {
                            if (obj.hasOwnProperty(name)) {
                                val = obj[name];
                                // when val is reference
                                if (val && val.$ref) {
                                    _replaceRef(val);
                                // when val is non-empty array of reference
                                } else if (_.isArray(val) && val.length > 0 && val[0].$ref) {
                                    _.each(val, _replaceRef);
                                }
                            }
                        }

                    }
                }
            }

            // Resolve all references
            _.extend(_idMap, reader.idMap);
            for (id in reader.idMap) {
                if (reader.idMap.hasOwnProperty(id)) {
                    obj = _idMap[id];
                    for (name in obj) {
                        if (obj.hasOwnProperty(name)) {
                            val = obj[name];
                            // when val is reference
                            if (val && val.$ref) {
                                obj[name] = _idMap[val.$ref];
                            // when val is non-empty array of reference
                            } else if (_.isArray(val) && val.length > 0 && val[0].$ref) {
                                var resolvedRefs = _.map(val, _resolveRef);
                                obj[name] = resolvedRefs;
                            }
                        }
                    }
                    _addRefsOf(obj);
                }
            }

            // Fix problems in the file
            // TODO: Remove this enough time after
            for (id in reader.idMap) {
                if (reader.idMap.hasOwnProperty(id)) {
                    obj = _idMap[id];

                    // Fix _parent of Image owned by Stereotype
                    if (obj instanceof type.UMLStereotype && obj.icon instanceof type.UMLImage) {
                        obj.icon._parent = obj;
                    }

                    // Fix: remove disconnected UndirectedRelationships
                    if (obj instanceof type.UndirectedRelationship) {
                        if (!(obj.end1 instanceof type.RelationshipEnd &&
                              obj.end1.reference instanceof type.Model &&
                              obj.end2 instanceof type.RelationshipEnd &&
                              obj.end2.reference instanceof type.Model)) {
                            if (obj._parent && obj.getParentField()) {
                                obj._parent[obj.getParentField()].remove(obj);
                                obj._parent = null;
                                obj.end1.reference = null;
                                obj.end2.reference = null;
                                delete reader.idMap[obj._id];
                            }
                        }
                    }

                    // Fix: remove disconnected DirectedRelationships
                    if (obj instanceof type.DirectedRelationship) {
                        if (!(obj.source instanceof type.Model &&
                              obj.target instanceof type.Model)) {
                            if (obj._parent && obj.getParentField()) {
                                obj._parent[obj.getParentField()].remove(obj);
                                obj._parent = null;
                                obj.source = null;
                                obj.target = null;
                                delete reader.idMap[obj._id];
                            }
                        }
                    }

                    // Fix: Clear too large distance values
                    if (obj instanceof type.ParasiticView) {
                        if (obj.distance > 5000) {
                            obj.distance = 10;
                        }
                    }

                    // Fix: problems in diagram
                    if (obj instanceof type.Diagram) {
                        var diagram = obj;

                        // 1) Communication Diagram에서 hostEdge가 null인 UMLCommMessageView를 모두 지움.
                        if (diagram instanceof type.UMLCommunicationDiagram) {
                            _.each(diagram.ownedViews, function (v) {
                                if (v instanceof type.UMLCommMessageView && v.hostEdge === null) {
                                    diagram.removeOwnedView(v);
                                    delete reader.idMap[v._id];
                                }
                            });
                        }

                        for (var vi = 0, vlen = diagram.ownedViews.length; vi < vlen; vi++) {
                            var v = diagram.ownedViews[vi];

                            if (!v) { continue; }

                            // 1) model이 없는 UMLGeneralNodeView, UMLGeneralEdgeView를 모두 삭제.
                            if (!v.model && v instanceof type.UMLGeneralNodeView) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }
                            if (!v.model && v instanceof type.UMLGeneralEdgeView) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }

                            // 2) _parent가 없는 View들 모두 삭제
                            if (!v._parent) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }

                            // 3) head or tail이 없는 EdgeView는 삭제
                            if (v instanceof type.EdgeView) {
                                if (!v.head || !v.tail) {
                                    diagram.removeOwnedView(v);
                                    delete reader.idMap[v._id];
                                }
                            }

                            // 4) end1.reference or end2.reference가 없는 UndirectedRelationship을 모두 삭제.
                            if (v.model instanceof type.UndirectedRelationship) {
                                if (!v.model.end1.reference || !v.model.end2.reference) {
                                    var pf1 = v.model.getParentField();
                                    if (v.model._parent && pf1) {
                                        v.model._parent[pf1].remove(v.model);
                                    }
                                    diagram.removeOwnedView(v);
                                    delete reader.idMap[v._id];
                                }
                            }

                            // 5) source or target이 없는 DirectedRelationship을 모두 삭제.
                            if (v.model instanceof type.DirectedRelationship) {
                                if (!v.model.source || !v.model.target) {
                                    var pf2 = v.model.getParentField();
                                    if (v.model._parent && pf2) {
                                        v.model._parent[pf2].remove(v.model);
                                    }
                                    diagram.removeOwnedView(v);
                                    delete reader.idMap[v._id];
                                }
                            }

                            // 5) nameLabel, stereotypeLabel, propertyLabel, RoleNameLabel, MultiplicityLabel, PropertyLabel, QualifiersCompartment
                            if (v.nameLabel && !reader.idMap[v.nameLabel._id]) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }
                            if (v.stereotypeLabel && !reader.idMap[v.stereotypeLabel._id]) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }
                            if (v.propertyLabel && !reader.idMap[v.propertyLabel._id]) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }
                            if (v.tailRoleNameLabel && !reader.idMap[v.tailRoleNameLabel._id]) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }
                            if (v.tailPropertyLabel && !reader.idMap[v.tailPropertyLabel._id]) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }
                            if (v.tailMultiplicityLabel && !reader.idMap[v.tailMultiplicityLabel._id]) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }
                            if (v.tailQualifiersCompartment && !reader.idMap[v.tailQualifiersCompartment._id]) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }
                            if (v.headRoleNameLabel && !reader.idMap[v.headRoleNameLabel._id]) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }
                            if (v.headPropertyLabel && !reader.idMap[v.headPropertyLabel._id]) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }
                            if (v.headMultiplicityLabel && !reader.idMap[v.headMultiplicityLabel._id]) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }
                            if (v.headQualifiersCompartment && !reader.idMap[v.headQualifiersCompartment._id]) {
                                diagram.removeOwnedView(v);
                                delete reader.idMap[v._id];
                            }

                        }

                    }

                }
            }
        }
        return element;
    }


    /**
     * Extract changed elements from a given Operation
     * @param {Operation} operation
     * @return {Array.<Element>}
     */
    function extractChanged(operation) {
        var i, len, op, elem, changed = [];
        if (operation.ops.length > 0) {
            for (i = 0, len = operation.ops.length; i < len; i++) {
                op = operation.ops[i];
                if (op._elem && op._elem._id) {
                    elem = get(op._elem._id);
                    if (elem && !_.contains(changed, elem)) {
                        changed.push(elem);
                    }
                }
                if (op.arg && op.arg._id) {
                    elem = get(op.arg._id);
                    if (elem && !_.contains(changed, elem)) {
                        changed.push(elem);
                    }
                }
            }
        }
        return changed;
    }

    /**
     * Do an Operation
     * If operation.bypass == true, the operation will not be pushed to UndoStack.
     * @param {Operation} operation
     */
    function doOperation(operation) {
        if (operation.ops.length > 0) {
            try {
                $(exports).triggerHandler('beforeExecuteOperation', [operation]);
                _applyOperation(operation);
                if (operation.bypass !== true) {
                    _undoStack.push(operation);
                    _redoStack.clear();
                    $(exports).triggerHandler('operationExecuted', [operation]);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    /**
     * Undo
     */
    function undo() {
        if (_undoStack.size() > 0) {
            try {
                var operation = _undoStack.pop();
                $(exports).triggerHandler('beforeUndo', [operation]);
                _revertOperation(operation);
                _redoStack.push(operation);
                $(exports).triggerHandler('undo', [operation]);
                $(exports).triggerHandler('operationExecuted', [operation]);
            } catch (err) {
                console.error(err);
            }
        }
    }

    /**
     * Redo
     */
    function redo() {
        if (_redoStack.size() > 0) {
            try {
                var operation = _redoStack.pop();
                $(exports).triggerHandler('beforeRedo', [operation]);
                _applyOperation(operation);
                _undoStack.push(operation);
                $(exports).triggerHandler('redo', [operation]);
                $(exports).triggerHandler('operationExecuted', [operation]);
            } catch (err) {
                console.error(err);
            }
        }
    }

    /**
     * Clear all maps and stacks
     */
    function clear() {
        _idMap = {};
        _refMap = {};
        _undoStack.clear();
        _redoStack.clear();
        setModified(false);
    }

    /**
     * Return whether project is modified or not.
     * @return {boolean}
     */
    function isModified() {
        return _modified;
    }

    /**
     * Set model as modified. (A event will be triggered if modified state is changed.)
     * @private
     * @param {boolean} modified
     */
    function setModified(modified) {
        _modified = modified;
        if (_modified) {
            try {
                $(exports).triggerHandler('modified');
            } catch (err) {
                console.error(err);
            }
        }
    }

    /**
     * Return true if the given parameter is an element in this Repository.
     * @param {Element} elem
     * @return {boolean}
     */
    function isElement(elem) {
        return (elem && elem._id && get(elem._id));
    }

    /**
     * Return an array of elements selected by selector expression.
     * This is a quite heavy operation, so you need to concern about performance.
     *
     * Selector expression
     *     - Children selector
     *       ex) Package1:: -- all children of Package1
     *
     *     - Type selector: "@<type>"
     *       ex) Package1::@UMLClass
     *
     *     - Field selector: ".<field>"
     *       ex) Class1.attributes, Package1.owendElements
     *
     *     - Value selector: "[field=value]"
     *       ex) Class1.operations[isAbstract=false]
     *
     *     - Name selector: "<name>" (equivalent to "[name=<name>]")
     *       ex) Class1, Class1::Attribute1
     *
     * Selector examples:
     *     @UMLClass
     *     Package1::Class1.attributes[type=String]
     *     Package1::Model1::@UMLInterface.operations[isAbstract=false]
     *
     * @param {string} selector
     * @return {Array.<Element>}
     */
    function select(selector) {
        selector = selector || "";

        // Parse selector into an array of terms
        var interm = selector
            .replace(/::/g, "\n::\n")
            .replace(/@/g, "\n@")
            .replace(/\./g, "\n.")
            .replace(/\[/g, "\n[");

        var i, len,
            sliced = interm.split("\n"),
            terms = [];

        for (i = 0, len = sliced.length; i < len; i++) {
            var item = sliced[i].trim(), arg;
            // children selector
            if (item === "::") {
                terms.push({ op: "::" });
            // type selector
            } else if (item.charAt(0) === "@") {
                arg = item.substring(1, item.length).trim();
                if (arg.length === 0) {
                    throw "[Selector] Type selector requires type name after '@'";
                }
                terms.push({ op: "@", type: arg });
            // field selector
            } else if (item.charAt(0) === ".") {
                arg = item.substring(1, item.length).trim();
                if (arg.length === 0) {
                    throw "[Selector] Field selector requires field name after '.'";
                }
                terms.push({ op: ".", field: arg});
            // value selector
            } else if (item.charAt(0) === "[") {
                arg = item.substring(1, item.length - 1);
                var fv = arg.split("="), f = fv[0] || "", v = fv[1] || "";
                if (!(item.charAt(item.length - 1) === "]" && fv.length === 2 && f.trim().length > 0 && v.trim().length > 0)) {
                    throw "[Selector] Value selector should be format of '[field=value]'";
                }
                terms.push({ op: "[]", field: f.trim(), value: v.trim()});
            // name selector
            } else if (item.length > 0) {
                terms.push({ op: "name", name: item });
            }
        }

        // Process terms sequentially
        var current = _.values(_idMap),
            term,
            elems;
        for (i = 0, len = terms.length; i < len; i++) {
            term = terms[i];
            elems = [];
            switch (term.op) {
            case "::":
                current.forEach(function (e) {
                    elems = _.union(elems, e.getChildren());
                });
                current = elems;
                break;
            case "@":
                current.forEach(function (e) {
                    if (type[term.type] && e instanceof type[term.type]) {
                        elems.push(e);
                    }
                });
                current = elems;
                break;
            case ".":
                current.forEach(function (e) {
                    if (typeof e[term.field] !== "undefined") {
                        var val = e[term.field];
                        if (isElement(val)) {
                            elems.push(val);
                        }
                        if (Array.isArray(val)) {
                            val.forEach(function (e2) {
                                if (isElement(e2)) {
                                    elems.push(e2);
                                }
                            });
                        }
                    }
                });
                current = elems;
                break;
            case "[]":
                current.forEach(function (e) {
                    if (typeof e[term.field] !== "undefined") {
                        var val = e[term.field];
                        if (term.value == val) {
                            elems.push(e);
                        }
                    }
                });
                current = elems;
                break;
            case "name":
                current.forEach(function (e) {
                    if (e.name === term.name) {
                        elems.push(e);
                    }
                });
                current = elems;
                break;
            }
        }

        return current;
    }

    /**
     * Return element by id.
     * @param {string} id Identifier of element.
     * @return {Element} Element of id.
     */
    function get(id) {
        return _idMap[id];
    }

    /**
     * Return instances of a specified type name(s).
     * @param {string|Array.<string>} _typeName Type name(s) of instances to be returned.
     * @return {Array.<Element>} instances of the type name(s).
     */
    function getInstancesOf(_typeName) {
        var _instances = [],
            _typeNames = [];

        if (_.isArray(_typeName)) {
            _typeNames = _typeName;
        } else if (_.isString(_typeName)) {
            _typeNames.push(_typeName);
        }

        _.each(_idMap, function (elem) {
            var i, len, _typeTest = false;

            for (i = 0, len = _typeNames.length; i < len; i++) {
                if (elem instanceof _global.type[_typeNames[i]]) {
                    _typeTest = true;
                    break;
                }
            }

            if (_typeTest) {
                _instances.push(elem);
            }
        });

        return _instances;
    }

    /**
     * Find the first matched element satisfying the predicate.
     * @param {function(Element):boolean} predicate A function to filter elements.
     * @return {Element} A matched element.
     */
    function find(predicate) {
        var key, elem;
        for (key in _idMap) {
            if (_idMap.hasOwnProperty(key)) {
                elem = _idMap[key];
                if (predicate(elem)) {
                    return elem;
                }
            }
        }
        return null;
    }

    /**
     * Find all elements satisfying the predicate.
     * @param {function(Element):boolean} predicate A function to filter elements.
     * @return {Array.<Element>} All matched elements.
     */
    function findAll(predicate) {
        var key,
            elem,
            result = [];
        for (key in _idMap) {
            if (_idMap.hasOwnProperty(key)) {
                elem = _idMap[key];
                if (predicate(elem)) {
                    result.push(elem);
                }
            }
        }
        return result;
    }


    /**
     * Search elements by keyword and type
     * @param {string} keyword
     * @param {constructor} typeFilter
     * @return {Array.<Element>} elements
     */
    function search(keyword, typeFilter) {
        keyword = keyword.toLowerCase();
        typeFilter = typeFilter || type.Element;
        var results = findAll(function (elem) {
            var name = elem.name ? elem.name.toLowerCase() : "";
            return (name.indexOf(keyword) > -1 && elem instanceof typeFilter);
        });
        return results;
    }

    /**
     * Lookup an element and then find. (See `Element.prototype.lookup` and `find`).
     * @param {!Element} namespace Element to start to lookup.
     * @param {string} name Name of element to find
     * @param {constructor} typeFilter Type filter. (e.g. `type.UMLClass`)
     * @return {Element} A matched element.
     */
    function lookupAndFind(namespace, name, typeFilter) {
        var ref = namespace.lookup(name, typeFilter);
        if (ref === null) {
            ref = find(function (elem) {
                return ((elem instanceof typeFilter) && (elem.name === name));
            });
        }
        return ref;
    }


    /**
     * Return all elements referencing to the given element.
     * @param {Core.Element} elem Element. (model element, view element, or diagram)
     * @param {?function(Element):boolean} iterator if given, returns instances only satisfying iterator function.
     * @return {Array<Core.Element>} Elements referencing to.
     */
    function getRefsTo(elem, iterator) {
        var id,
            ref,
            obj,
            list = [];
        if (elem) {
            obj = _refMap[elem._id];
            if (obj) {
                for (id in obj) {
                    if (obj.hasOwnProperty(id)) {
                        ref = _idMap[id];
                        if (iterator) {
                            if (iterator(ref)) { list.push(ref); }
                        } else {
                            list.push(ref);
                        }
                    }
                }
            }
        }
        return list;
    }

    /**
     * Return all instances of Relationship connected to the given model element.
     * @param {Core.Model} model Model element.
     * @param {?function(Element):boolean} iterator if given, returns instances only satisfying iterator function.
     * @return {Array<Core.Model>} Instances of Relationship.
     */
    function getRelationshipsOf(model, iterator) {
        var i,
            len,
            ref,
            refs = getRefsTo(model),
            results = [];

        function _add(rel) {
            if (!_.contains(results, rel)) {
                results.push(rel);
            }
        }

        for (i = 0, len = refs.length; i < len; i++) {
            ref = refs[i];

            // for DirectedRelationship
            if ((ref instanceof Core.DirectedRelationship) && (ref.source === model || ref.target === model)) {
                if (iterator) {
                    if (iterator(ref)) {
                        _add(ref);
                    }
                } else {
                    _add(ref);
                }
            }

            // for UndirectedRelationship
            if ((ref instanceof Core.RelationshipEnd) && (ref.reference === model)) {
                if (iterator) {
                    if (iterator(ref._parent)) {
                        _add(ref._parent);
                    }
                } else {
                    _add(ref._parent);
                }
            }
        }
        return results;
    }

    /**
     * Return all views associated with the given model.
     * @param {Core.Model} model Model element.
     * @return {Array<Core.View>} View elements associated with.
     */
    function getViewsOf(model) {
        return getRefsTo(model, function (ref) {
            return (ref instanceof Core.View) && (ref.model === model);
        });
    }

    /**
     * Return all instances of EdgeView linked to the given view.
     * @param {Core.View} view View element. Typically an instance of NodeView.
     * @return {Array<Core.EdgeView>} Instances of EdgeView linked to.
     */
    function getEdgeViewsOf(view) {
        return getRefsTo(view, function (ref) {
            return (ref instanceof Core.EdgeView) &&
                   (ref.head === view || ref.tail === view);
        });
    }

    /**
     * Insert an element to an array field. This will not insert an Operation into UndoStack (bypass = true). Use it carefully.
     * @param {Core.Element} parent Field owner.
     * @param {string} field Field name.
     * @param {Core.Element} elem An element to be inserted.
     */
    function bypassInsert(parent, field, elem) {
        OperationBuilder.begin("bypassInsert", true);
        OperationBuilder.insert(elem);
        OperationBuilder.fieldInsert(parent, field, elem);
        OperationBuilder.end();
        doOperation(OperationBuilder.getOperation());
    }

    /**
     * Assign a value to a field. This will not insert an Operation into UndoStack (bypass = true). Use it carefully.
     * @param {module:core/Core.Element} elem Field owner.
     * @param {string} field Field name.
     * @param {Core.Element} val Value to be assigned to.
     */
    function bypassFieldAssign(elem, field, val) {
        OperationBuilder.begin("bypassFieldAssign", true);
        OperationBuilder.fieldAssign(elem, field, val);
        OperationBuilder.end();
        doOperation(OperationBuilder.getOperation(), true);
    }

    // Define public API
    exports.writeObject         = writeObject;
    exports.readObject          = readObject;
    exports.extractChanged      = extractChanged;
    exports.doOperation         = doOperation;
    exports.undo                = undo;
    exports.redo                = redo;
    exports.clear               = clear;
    exports.isModified          = isModified;
    exports.setModified         = setModified;
    exports.isElement           = isElement;
    exports.select              = select;
    exports.get                 = get;
    exports.getInstancesOf      = getInstancesOf;
    exports.find                = find;
    exports.findAll             = findAll;
    exports.search              = search;
    exports.lookupAndFind       = lookupAndFind;
    exports.getRefsTo           = getRefsTo;
    exports.getRelationshipsOf  = getRelationshipsOf;
    exports.getViewsOf          = getViewsOf;
    exports.getEdgeViewsOf      = getEdgeViewsOf;

    exports.bypassInsert        = bypassInsert;
    exports.bypassFieldAssign   = bypassFieldAssign;

    exports.getIdMap  = function () { return _idMap; };  // for test
    exports.getRefMap = function () { return _refMap; }; // for test

    exports.Stack = Stack; // for test

});
