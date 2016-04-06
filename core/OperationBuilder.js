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
/*global define, $, _ */

/**
 *
 * This module dispatches these events:
 *     - insert:         (elem)
 *     - remove:         (elem)
 *     - fieldAssign:    (elem, field, val)
 *     - fieldInsert:    (elem, field, val)
 *     - fieldInsertAt:  (elem, field, val, pos)
 *     - fieldRemove:    (elem, field, val)
 *     - fieldRemoveAt:  (elem, field, val, pos)
 *     - fieldReorder:   (elem, field, val, newPos)
 *     - fieldRelocate:  (elem, field, oldParent, newParent)
 */
define(function (require, exports, module) {
    "use strict";

    var global      = require("core/Global").global,
        IdGenerator = require("core/IdGenerator"),
        Writer      = require("core/Core").Writer;

    /**
     * @const {string}
     */
    var OP_INSERT            = 'I',
        OP_REMOVE            = 'R',
        OP_FIELD_ASSIGN      = 'a',
        OP_FIELD_INSERT      = 'i',
        OP_FIELD_REMOVE      = 'r',
        OP_FIELD_REORDER     = 'o',
        OP_FIELD_RELOCATE    = 'l';

    /**
     * Current Operation
     *
     * @private
     * @type {Object}
     */
    var _currentOperation = null;

    /**
     * Keep an array of array field of a particular element.
     *
     * @private
     * @type {Object.<string,Array>}
     */
    var _currentArray = {};

    /**
     * Return timestamp
     */
    function getTimestamp() {
        return (new Date()).getTime();
    }

    /**
     * Make and return a base operation object.
     *
     * @private
     * @param {string} name Operation name
     * @return {Object} Base operation object
     */
    function _getBase(name) {
        var operation = {
            id: IdGenerator.generateGuid(),
            time: getTimestamp(),
            name: name,
            bypass: false,
            ops: []
        };
        return operation;
    }

    /**
     * Return a copied array of array field of a particular element.
     * It could be changed by `fieldInsert`, `fieldRemove`.
     * The reason why using this is index value maybe incorrect when performing `fieldInsert` multiple times.
     *
     * @private
     * @param {Element} elem An element
     * @param {string} field Array field name
     * @return {number}
     */
    function _getArray(elem, field) {
        var f = elem._id + "." + field;
        if (!_currentArray[f]) {
            _currentArray[f] = _.clone(elem[field]);
        }
        return _currentArray[f];
    }

    /**
     * Begin to make an operation.
     *
     * @param {string} opName Operation name
     */
    function begin(name, bypass) {
        _currentOperation = _getBase(name);
        if (bypass === true) {
            _currentOperation.bypass = true;
        }
    }

    /**
     * Finish to make an operation.
     */
    function end() {
        _currentArray = {};
        return null;
    }

    /**
     * Discard currently making operation.
     */
    function discard() {
        _currentOperation = null;
        _currentArray = {};
    }

    /**
     * Return currently made operation.
     *
     * @return {Object}
     */
    function getOperation() {
        return _currentOperation;
    }

    /**
     * Insert an element.
     *
     * @param {Element} elem
     */
    function insert(elem) {
        try {
            $(exports).triggerHandler('insert', [elem]);
        } catch (err) {
            console.error(err);
        }
        var writer = new Writer();
        elem.save(writer);
        _currentOperation.ops.push({op: OP_INSERT, arg: writer.current});
    }

    /**
     * Remove an element.
     *
     * @param {Element} elem
     */
    function remove(elem) {
        try {
            $(exports).triggerHandler('remove', [elem]);
        } catch (err) {
            console.error(err);
        }
        var writer = new Writer();
        elem.save(writer);
        _currentOperation.ops.push({op: OP_REMOVE, arg: writer.current});
    }

    /**
     * Assign value to field.
     *
     * @param {Element} elem
     * @param {string} field
     * @param {?} val
     */
    function fieldAssign(elem, field, val) {
        try {
            $(exports).triggerHandler('fieldAssign', [elem, field, val]);
        } catch (err) {
            console.error(err);
        }
        var isCustomField = (elem[field] && elem[field].__read);
        var oldVal;
        if (isCustomField) {
            oldVal = elem[field].__write();
        } else {
            oldVal = elem[field];
        }
        _currentOperation.ops.push({
            op: OP_FIELD_ASSIGN,
            arg: {
                _id: elem._id,
                f: field,
                n: val,
                o: oldVal
            }
        });
    }

    /**
     * Insert an element to array field.
     *
     * @param {Element} elem
     * @param {string} field
     * @param {?} val
     */
    function fieldInsert(elem, field, val) {
        try {
            $(exports).triggerHandler('fieldInsert', [elem, field, val]);
        } catch (err) {
            console.error(err);
        }
        var array = _getArray(elem, field);
        array.push(val);
        _currentOperation.ops.push({
            op: OP_FIELD_INSERT,
            arg: {
                _id: elem._id,
                f: field,
                e: val._id,
                i: array.indexOf(val)
            }
        });
    }

    /**
     * Insert a value to array field at a specific position (index).
     *
     * @param {Element} elem
     * @param {string} field
     * @param {?} val
     * @param {number} pos
     */
    function fieldInsertAt(elem, field, val, pos) {
        try {
            $(exports).triggerHandler('fieldInsertAt', [elem, field, val, pos]);
        } catch (err) {
            console.error(err);
        }
        _currentOperation.ops.push({
            op: OP_FIELD_INSERT,
            arg: {
                _id: elem._id,
                f: field,
                e: val._id,
                i: pos
            }
        });
    }

    /**
     * Remove a value from array field.
     *
     * @param {Element} elem
     * @param {string} field
     * @param {?} val
     */
    function fieldRemove(elem, field, val) {
        try {
            $(exports).triggerHandler('fieldRemove', [elem, field, val]);
        } catch (err) {
            console.error(err);
        }
        var array = _getArray(elem, field);
        _currentOperation.ops.push({
            op: OP_FIELD_REMOVE,
            arg: {
                _id: elem._id,
                f: field,
                e: val._id,
                i: array.indexOf(val)
            }
        });
        array.remove(val);
    }

    /**
     * Remove a value from array field at a specific position.
     *
     * @param {Element} elem
     * @param {string} field
     * @param {?} value
     * @param {number} pos
     */
    function fieldRemoveAt(elem, field, val, pos) {
        try {
            $(exports).triggerHandler('fieldRemoveAt', [elem, field, val, pos]);
        } catch (err) {
            console.error(err);
        }
        _currentOperation.ops.push({
            op: OP_FIELD_REMOVE,
            arg: {
                _id: elem._id,
                f: field,
                e: val._id,
                i: pos
            }
        });
    }

    /**
     * Change order of a value in array field.
     *
     * @param {Element} elem
     * @param {string} field
     * @param {?} val
     * @param {number} pos Position to be placed
     */
    function fieldReorder(elem, field, val, pos) {
        try {
            $(exports).triggerHandler('fieldReorder', [elem, field, val, pos]);
        } catch (err) {
            console.error(err);
        }
        _currentOperation.ops.push({
            op: OP_FIELD_REORDER,
            arg: {
                _id: elem._id,
                f: field,
                e: val._id,
                i: pos
            }
        });
    }

    /**
     * Relocate an element to another parent.
     *
     * @param {Element} elem Element to be relocated
     * @param {string} field Field name of parent
     * @param {number} oldParent Current parent
     * @param {number} newParent New parent to be located in
     */
    function fieldRelocate(elem, field, oldParent, newParent) {
        try {
            $(exports).triggerHandler('fieldRelocate', [elem, field, oldParent, newParent]);
        } catch (err) {
            console.error(err);
        }
        _currentOperation.ops.push({
            op: OP_FIELD_RELOCATE,
            arg: {
                _id: elem._id,
                f: field,
                op: oldParent._id,
                np: newParent._id
            }
        });
    }

    // constants
    exports.OP_INSERT            = OP_INSERT;
    exports.OP_REMOVE            = OP_REMOVE;
    exports.OP_FIELD_ASSIGN      = OP_FIELD_ASSIGN;
    exports.OP_FIELD_INSERT      = OP_FIELD_INSERT;
    exports.OP_FIELD_REMOVE      = OP_FIELD_REMOVE;
    exports.OP_FIELD_REORDER     = OP_FIELD_REORDER;
    exports.OP_FIELD_RELOCATE    = OP_FIELD_RELOCATE;

    // Define public API
    exports.begin           = begin;
    exports.end             = end;
    exports.discard         = discard;
    exports.getOperation    = getOperation;
    exports.insert          = insert;
    exports.remove          = remove;
    exports.fieldAssign     = fieldAssign;
    exports.fieldInsert     = fieldInsert;
    exports.fieldInsertAt   = fieldInsertAt;
    exports.fieldRemove     = fieldRemove;
    exports.fieldRemoveAt   = fieldRemoveAt;
    exports.fieldReorder    = fieldReorder;
    exports.fieldRelocate   = fieldRelocate;

});

