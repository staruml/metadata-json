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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global define, $, _, */

define(function (require, exports, module) {
    "use strict";

    var _global    = require("core/Global").global,
        Repository = require("core/Repository");

    /**
     * Add validation rules
     *
     * @param {Array.<Object>} rules
     */
    function addRules(rules) {
        _.each(rules, function (rule) {
            _global.rules[rule.id] = rule;
        });
    }

    /**
     * Validate and return validation errors
     *
     * @return {Array.<Object>}
     */
    function validate() {
        var failed = [];

        _.each(_global.rules, function (rule) {

            // Get instances of types in rule.appliesTo
            var targets = Repository.getInstancesOf(rule.appliesTo);

            // Rejects instances of types in rule.exceptions
            if (rule.exceptions && rule.exceptions.length > 0) {
                targets = _.reject(targets, function (target) {
                    return _.some(rule.exceptions, function (exception) {
                        return target instanceof _global.type[exception];
                    });
                });
            }

            // Check constraints
            _.each(targets, function (target) {
                try {
                    if (!rule.constraint(target)) {
                        var item = {
                            id: target._id,
                            ruleId: rule.id,
                            message: rule.message
                        };
                        failed.push(item);
                    }
                } catch (err) {
                    console.log("[Validator] Failed to apply the rule (" + rule.id + ") on ", target);
                    console.error(err);
                }
            });
        });

        return failed;
    }

    exports.addRules = addRules;
    exports.validate = validate;

});
