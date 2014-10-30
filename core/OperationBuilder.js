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
     * 현재 구성중인 Operation
     * @private
     * @type {Object}
     */
    var _currentOperation = null;

    /**
     * 특정 요소의 배열필드의 배열을 유지한다.
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
     * 기본적인 Operation 구성의 틀을 리턴.
     *
     * @private
     * @param {string} name - Operation 이름
     * @return {Object} 기본 Operation 틀
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
     * 특정 요소의 "임시로 복제된 배열 필드"를 넘겨준다.
     * - fieldInsert, fieldRemove가 진행됨에 따라 변경된다.
     * - 이것을 사용하는 이유는 fieldInsert를 여러번 수행하면 요소의 index 값이 정확하지 않기 때문.
     *
     * @private
     * @param {Element} elem - 요소
     * @param {string} field - 배열 필드명
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
     * Operation 구성을 시작함.
     *
     * @param {string} opName - Operation 이름
     */
    function begin(name, bypass) {
        _currentOperation = _getBase(name);
        if (bypass === true) {
            _currentOperation.bypass = true;
        }
    }

    /**
     * Operation 구성을 종료함.
     */
    function end() {
        _currentArray = {};
        return null;
    }

    /**
     * Operation 구성을 취소함.
     */
    function discard() {
        _currentOperation = null;
        _currentArray = {};
    }

    /**
     * 현재까지 구성된 Operation를 리턴.
     *
     * @return {Object}
     */
    function getOperation() {
        return _currentOperation;
    }

    /**
     * 요소 생성 오퍼레이션을 커멘드에 추가.
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
     * 요소 삭제 오퍼레이션을 커멘드에 추가.
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
     * 요소의 필드값 변경 오퍼레이션을 커멘드에 추가.
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
     * 요소의 (배열)필드에 값 추가 오퍼레이션을 커멘드에 추가.
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
     * 요소의 (배열)필드에 값을 특정 위치에 추가하는 오퍼레이션을 커멘드에 추가.
     *
     * @param {Element} elem
     * @param {string} field
     * @param {?} val
     * @param {number} pos - 추가할 위치 (정수 인덱스값)
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
     * 요소의 (배열)필드에 특정 값 삭제 오퍼레이션을 커멘드에 추가.
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
     * 요소의 (배열)필드에 특정 위치의 값을 삭제하는 오퍼레이션을 커멘드에 추가.
     *
     * @param {Element} elem
     * @param {string} field
     * @param {number} pos - 추가할 위치 (정수 인덱스값)
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
     * 요소의 (배열)필드에 특정 위치의 값을 다른 위치로 이동하는 오퍼레이션을 커멘드에 추가.
     *
     * @param {Element} elem
     * @param {string} field
     * @param {?} val
     * @param {number} pos - 이동할 위치 (정수 인덱스값)
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
     * 요소를 다른 위치로 이동하는 오퍼레이션을 커멘드에 추가.
     *
     * @param {Element} elem - 이동할 요소
     * @param {string} field - 포함하는 요소의 배열 필드
     * @param {number} oldParent - 현재 위치 (이전에 포함하던 요소)
     * @param {number} newParent - 이동할 위치 (이후에 포함하는 요소)
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

