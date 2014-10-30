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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true, loopfunc: true */
/*global define */

define(function (require, exports, module) {
    "use strict";

    /**
     * Counter for IdGenerator
     * @private
     */
    var idGeneratorCounter = Math.floor(Math.random() * 65536);

    /**
     * IdGenerator
     * @private
     */
    var _idGenerator = null;

    /**
     * Table for base64
     * @onst
     */
    var tableStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var table = tableStr.split("");

    /**
     * atob
     * @private
     */
    function atob(base64) {
        if (/(=[^=]+|={3,})$/.test(base64)) throw new Error("String contains an invalid character");
        base64 = base64.replace(/=/g, "");
        var n = base64.length & 3;
        if (n === 1) throw new Error("String contains an invalid character");
        for (var i = 0, j = 0, len = base64.length / 4, bin = []; i < len; ++i) {
            var a = tableStr.indexOf(base64[j++] || "A"),
                b = tableStr.indexOf(base64[j++] || "A");
            var c = tableStr.indexOf(base64[j++] || "A"),
                d = tableStr.indexOf(base64[j++] || "A");
            if ((a | b | c | d) < 0) throw new Error("String contains an invalid character");
            bin[bin.length] = ((a << 2) | (b >> 4)) & 255;
            bin[bin.length] = ((b << 4) | (c >> 2)) & 255;
            bin[bin.length] = ((c << 6) | d) & 255;
        }
        return String.fromCharCode.apply(null, bin).substr(0, bin.length + n - 4);
    }

    /**
     * btoa
     * @private
     */
    function btoa(bin) {
        for (var i = 0, j = 0, len = bin.length / 3, base64 = []; i < len; ++i) {
            var a = bin.charCodeAt(j++),
                b = bin.charCodeAt(j++),
                c = bin.charCodeAt(j++);
            if ((a | b | c) > 255) throw new Error("String contains an invalid character");
            base64[base64.length] = table[a >> 2] + table[((a << 4) & 63) | (b >> 4)] +
                (isNaN(b) ? "=" : table[((b << 2) & 63) | (c >> 6)]) +
                (isNaN(b + c) ? "=" : table[c & 63]);
        }
        return base64.join("");
    }

    /**
     * hexToBase64
     * @private
     */
    function hexToBase64(str) {
        return btoa(String.fromCharCode.apply(null,
            str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
    }

    /**
     * base64ToHex
     * @private
     */
    function base64ToHex(str) {
        for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
            var tmp = bin.charCodeAt(i).toString(16);
            if (tmp.length === 1) tmp = "0" + tmp;
            hex[hex.length] = tmp;
        }
        return hex.join(" ");
    }

    /**
     * IdGenerator
     *
     * @constructor
     */
    function IdGenerator() {
    }

    IdGenerator.prototype.setBaseHex = function (val) {
        this.baseHex = val;
    };

    IdGenerator.prototype.toHex = function (digit, num) {
        var fill, hex, r;
        hex = num.toString(16);
        if (hex.length < digit) {
            r = digit - hex.length;
            fill = new Array(r + 1).join("0");
            hex = fill + hex;
        }
        return hex;
    };

    IdGenerator.prototype.generate = function () {
        var base64, counter, counterHex, hex, random, randomHex, timestamp, timestampHex;
        timestamp = (new Date()).getTime();
        counter = idGeneratorCounter;
        idGeneratorCounter++;
        if (idGeneratorCounter > 65535) {
            idGeneratorCounter = 0;
        }
        random = Math.floor(Math.random() * 65536);
        timestampHex = this.toHex(16, timestamp);
        counterHex = this.toHex(4, counter);
        randomHex = this.toHex(4, random);
        hex = this.baseHex + timestampHex + counterHex + randomHex;
        base64 = hexToBase64(hex);
        return base64;
    };

    /**
     * Set GUID Base
     */
    function setGuidBase(baseHex) {
        _idGenerator = new IdGenerator();
        _idGenerator.setBaseHex(baseHex);
    }

    /**
     * Set GUID Base as Number
     */
    function setGuidBaseNum(baseNum) {
        _idGenerator = new IdGenerator();
        _idGenerator.setBaseHex(_idGenerator.toHex(24, baseNum));
    }

    /**
     * Generate GUID
     */
    function generateGuid() {
        if (_idGenerator === null) {
            _idGenerator = new IdGenerator("");
        }
        return _idGenerator.generate();
    }

    // Public API
    exports.setGuidBase    = setGuidBase;
    exports.setGuidBaseNum = setGuidBaseNum;
    exports.generateGuid   = generateGuid;

});

