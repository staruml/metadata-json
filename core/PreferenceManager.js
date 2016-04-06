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
/*global define, $, _, window, appshell, localStorage */

/**
 * PreferenceManager only works in browser (it uses global localStorage object).
 */
define(function (require, exports, module) {
    "use strict";

    var global = require("core/Global").global;

    /**
     * Preference Schema Map
     * @type {Object.<string,{name:string, schema:Object}>}
     */
    var _schemaMap = {};

    /**
     * Preference Item Map
     * @type {Object.<string,Object>}
     */
    var _itemMap = {};

    function getSchema(id) {
        return _schemaMap[id].schema;
    }

    function getSchemaName(id) {
        return _schemaMap[id].name;
    }

    function getSchemaIds() {
        return _.keys(_schemaMap);
    }

    function getItem(key) {
        return _itemMap[key];
    }

    /**
     * Validate preference schema
     * @param {Object} schema
     * @return {boolean}
     */
    function validate(schema) {
        var key, item;
        for (key in schema) {
            if (schema.hasOwnProperty(key)) {
                item = schema[key];
                if (!item.text) {
                    console.error("[PreferenceManager] missing required field: 'text' of '" + key + "'");
                }
                if (!item.type) {
                    console.error("[PreferenceManager] missing required field: 'type' of '" + key + "'");
                }
                if (item.type !== "Section" && typeof item['default'] === "undefined") {
                    console.error("[PreferenceManager] missing required field: 'default' of '" + key + "'");
                }
                if (item.type === "Combo" || item.type === "Dropdown") {
                    if (item.options && item.options.length > 0) {
                        var i, len;
                        for (i = 0, len = item.options.length; i < len; i++) {
                            if (typeof item.options[i].value === "undefined") {
                                console.error("[PreferenceManager] missing required field of option item: 'value' of '" + key + "'");
                            }
                            if (typeof item.options[i].text === "undefined") {
                                console.error("[PreferenceManager] missing required field of option item: 'text' of '" + key + "'");
                            }
                        }
                    } else {
                        console.error("[PreferenceManager] missing required field or no items: 'options' of '" + key + "'");
                    }
                }
            }
        }
        return true;
    }

    /**
     * Register preference schema
     * @param {string} id
     * @param {string} name
     * @param {Object} schema
     */
    function register(id, name, schema) {
        if (!id || !name || !schema) {
            console.error("register(): missing required parameters: id, name, or schema");
            return;
        }

        if (validate(schema)) {
            _schemaMap[id] = {
                id: id,
                name: name,
                schema: schema
            };

            // Build Preference Item Map
            _.each(schema, function (item, key) {
                if (item) {
                    _itemMap[key] = item;
                }
            });
        }
    }

    /**
     * Return value of key
     *
     * @param {string} key
     * @param {?} defaultValue
     * @return {?}
     */
    function get(key, defaultValue) {
        defaultValue = typeof defaultValue === "undefined" ? null : defaultValue;
        if (global.localStorage) {
            var _value = global.localStorage.getItem(key),
                value = null;
            if (_value) {
                try {
                    value = JSON.parse(_value);
                } catch (e) {
                    console.error("[PreferenceManager] Failed to read preference value of key: " + key);
                }
            } else {
                // if not stored in localStorage, return default value from schema
                if (_itemMap[key] && typeof _itemMap[key]['default'] !== "undefined") {
                    value = _itemMap[key]['default'];
                } else {
                    value = defaultValue;
                }
            }
            return value;
        } else {
            return defaultValue;
        }
    }

    /**
     * Change value of key
     * @param {string} key
     * @param {?} value
     */
    function set(key, value) {
        if (global.localStorage) {
            var _value;
            try {
                _value = JSON.stringify(value);
                global.localStorage.setItem(key, _value);
                $(exports).triggerHandler("change", [key, value]);
            } catch (e) {
                console.error("[PreferenceManager] Failed to write preference value of key: " + key);
            }
        }
    }

    /**
     * Convenience function that gets a view state
     *
     * @param {string} id preference to get
     * @param {?Object} context Optional additional information about the request
     */
    function getViewState(id, context) {
        var state = get("_viewState." + id);
        if (!state) {
            state = {};
        }
        return state;
    }

    /**
     * Convenience function that sets a view state and then saves the file
     *
     * @param {string} id preference to set
     * @param {*} value new value for the preference
     * @param {?Object} context Optional additional information about the request
     * @param {boolean=} doNotSave If it is undefined or false, then save the
     *      view state immediately.
     */
    function setViewState(id, value, context, doNotSave) {
        set("_viewState." + id, value);
    }

    // Public API
    exports.getSchema     = getSchema;
    exports.getSchemaName = getSchemaName;
    exports.getSchemaIds  = getSchemaIds;
    exports.getItem       = getItem;
    exports.register      = register;
    exports.get           = get;
    exports.set           = set;
    exports.getViewState  = getViewState;
    exports.setViewState  = setViewState;

});
