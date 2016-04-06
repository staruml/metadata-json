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
/*global define*/

/**
 * Global object.
 *
 * To get a global object, see the following code.
 *
 * ```
 * var global = app.getModule('core/Global').global;
 * ```
 */
define(function (require, exports, module) {
    "use strict";

    /*
     * Define core app namespace if it isn't already defined
     *
     * We can't simply do 'app = {}' to define it in the global namespace because
     * we're in "use strict" mode. Most likely, 'window' will always point to the global
     * object when this code is running. However, in case it isn't (e.g. if we're running
     * inside Node for CI testing) we use this trick to get the global object.
     *
     * Taken from:
     *   http://stackoverflow.com/questions/3277182/how-to-get-the-global-object-in-javascript
     *
     * @private
     */
    var Fn = Function, _global = (new Fn("return this"))();

    // for meta object
    _global.meta = {};

    // for types
    _global.type = {};

    // for rules
    _global.rules = {};

    /**
     * Array Extension
     */

    Array.prototype.indexOf = function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item) return i;
        }
        return -1;
    };

    Array.prototype.clear = function () {
        this.length = 0;
    };

    Array.prototype.add = function (item) {
        return this.push(item);
    };

    Array.prototype.remove = function (item) {
        var index = this.indexOf(item);
        if (index > -1) {
            this.splice(index, 1);
        }
    };

    Array.prototype.removeAt = function (index) {
        return this.splice(index, 1);
    };

    Array.prototype.insert = function (index, item) {
        return this.splice(index, 0, item);
    };

    Array.prototype.contains = function (item) {
        return this.indexOf(item) > -1;
    };

    /**
     * Math Extension
     */

    Math.square = function (x) {
        return x * x;
    };

    Math.trunc = function (n) {
        return ~~n;
    };

    exports.global = _global;

});

