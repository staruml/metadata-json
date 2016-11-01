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


/*NOTE: This module is for requirejs. Do not import by node's `require` */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, _*/

define(function (require, exports, module) {
    "use strict";

    var Graphics = require("core/Graphics"),
        Unicode  = require("lib/Unicode"),
        Font     = require("lib/Font");

    /**
     * FontSet
     */
    var _fontSet = {};

    function _drawArc(context, x, y, r, startAngle, endAngle, counterClockwise, fill) {
        var sx = x + r * Math.cos(startAngle),
            sy = y + r * Math.sin(startAngle),
            ex = x + r * Math.cos(endAngle),
            ey = y + r * Math.sin(endAngle),
            path;
        if (counterClockwise === true) {
            path = "M " + sx + " " + sy + " A " + r + " " + r + " 0 0 0 " + ex + " " + ey;
        } else {
            path = "M " + ex + " " + ey + " A " + r + " " + r + " 0 0 0 " + sx + " " + sy;
        }
        context.path(path);
        if (fill) {
            context.fill();
        } else {
            context.stroke();
        }
        context.moveTo(ex, ey);
    }

    /**
     * Canvas
     * @constructor
     */
    function Canvas(context) {
        this.context = context;
        this.stateStack = [];
        this.color = Graphics.Color.BLACK;
        this.fillColor = Graphics.Color.WHITE;
        this.fontColor = Graphics.Color.BLACK;
        this.font = new Graphics.Font("Arial", 12, Graphics.FS_NORMAL);
        this.lineWidth = 1;
        this.alpha = 1.0;
        this.origin = new Graphics.Point(0.0, 0.0);
        this.zoomFactor = new Graphics.ZoomFactor(1, 1);
        this.gridFactor = new Graphics.GridFactor(1, 1);
        this.coordTransformApplied = true;
    }

    Canvas.prototype._setFontByStyle = function (fontInfo, style) {
        switch (style) {
        case Graphics.FS_NORMAL:
            this.context.font(fontInfo.regular);
            break;
        case Graphics.FS_BOLD:
            this.context.font(fontInfo.bold);
            break;
        case Graphics.FS_ITALIC:
            this.context.font(fontInfo.italic);
            break;
        case Graphics.FS_BOLD_ITALIC:
            this.context.font(fontInfo.boldItalic);
            break;
        }
    };

    Canvas.prototype._hasChar = function (char) {
        var _font = this.context._font;
        var code = char.charCodeAt(0);
        if (_font.font && _font.font.cmap && _font.font.cmap.unicode.codeMap[code]) {
            return true;
        }
        return false;
    };

    Canvas.prototype._setFont = function (font, char) {
        var fontInfo = Font.getFontInfo(font.face, char);
        this._setFontByStyle(fontInfo, font.style);
        if (fontInfo.afm !== true && !this._hasChar(char)) {
            var defaultFontInfo = Font.getDefaultFontInfo(char);
            this._setFontByStyle(defaultFontInfo, font.style);
        }
        this.context.fontSize(font.size * 0.96);
    };

    /**
     * Canvas의 상태를 스택에 저장
     */
    Canvas.prototype.storeState = function () {
        var state = {
            color: this.color,
            fillColor: this.fillColor,
            fontColor: this.fontColor,
            font: this.font.copy(),
            lineWidth: this.lineWidth,
            alpha: this.alpha
        };
        this.stateStack.push(state);
    };

    /**
     * Canvas의 상태를 스택으로부터 복구
     */
    Canvas.prototype.restoreState = function () {
        var state = this.stateStack.pop();
        if (state !== null) {
            this.color = state.color;
            this.fillColor = state.fillColor;
            this.fontColor = state.fontColor;
            this.font = state.font;
            this.lineWidth = state.lineWidth;
            this.alpha = state.alpha;
        }
    };

    /**
     * Transform (Scale)
     */
    Canvas.prototype.transform = function () {
        this.context.save();
        if (this.coordTransformApplied === true) {
            this.context.translate(this.origin.x, this.origin.y);
            var scale = this.zoomFactor.getScale();
            this.context.scale(scale);
        }
    };

    /**
     * Restore Transform
     */
    Canvas.prototype.restoreTransform = function () {
        this.context.restore();
    };

    /**
     * Put a pixel
     *
     * @param {number} x
     * @param {number} y
     * @param {number} c - Color
     */
    Canvas.prototype.putPixel = function (x, y, c) {
        this.transform();
        this.context.strokeColor(c);
        this.context.opacity(this.alpha);
        this.context.moveTo(x, y);
        this.context.lineTo(x + 1, y + 1);
        this.context.stroke();
        this.restoreTransform();
    };

    /**
     * Draw a line
     *
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {?Array.<number>} dashPattern
     */
    Canvas.prototype.line = function (x1, y1, x2, y2, dashPattern) {
        this.transform();
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.opacity(this.alpha);
        if (dashPattern && dashPattern.length > 0) {
            this.context.dash(dashPattern[0], dashPattern.length > 1 ? { space: dashPattern[1] } : { space: dashPattern[0] });
        }
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
        this.restoreTransform();
    };

    /**
     * rect
     *
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {Array.<number>} dashPattern - e.g.) [3]
     */
    Canvas.prototype.rect = function (x1, y1, x2, y2, dashPattern) {
        this.transform();
        var x = (x1 < x2 ? x1 : x2),
            y = (y1 < y2 ? y1 : y2),
            w = Math.abs(x2 - x1),
            h = Math.abs(y2 - y1);
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.opacity(this.alpha);
        if (dashPattern && dashPattern.length > 0) {
            this.context.dash(dashPattern[0], dashPattern.length > 1 ? { space: dashPattern[1] } : { space: dashPattern[0] });
        }
        this.context.rect(x, y, w, h);
        this.context.stroke();
        this.restoreTransform();
    };

    /**
     * fillRect
     *
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    Canvas.prototype.fillRect = function (x1, y1, x2, y2) {
        this.transform();
        var x = (x1 < x2 ? x1 : x2),
            y = (y1 < y2 ? y1 : y2),
            w = Math.abs(x2 - x1),
            h = Math.abs(y2 - y1);
        this.context.fillColor(this.fillColor);
        this.context.opacity(this.alpha);
        this.context.rect(x, y, w, h);
        this.context.fill();
        this.restoreTransform();
    };

    /**
     * roundRect
     *
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} radius
     */
    Canvas.prototype.roundRect = function (x1, y1, x2, y2, radius) {
        this.transform();
        var x = (x1 < x2 ? x1 : x2),
            y = (y1 < y2 ? y1 : y2),
            w = Math.abs(x2 - x1),
            h = Math.abs(y2 - y1);
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.opacity(this.alpha);
        this.context.roundedRect(x, y, w, h, radius);
        this.context.stroke();
        this.restoreTransform();
    };

    /**
     * fillRoundRect
     *
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} radius
     */
    Canvas.prototype.fillRoundRect = function (x1, y1, x2, y2, radius) {
        this.transform();
        var x = (x1 < x2 ? x1 : x2),
            y = (y1 < y2 ? y1 : y2),
            w = Math.abs(x2 - x1),
            h = Math.abs(y2 - y1);
        this.context.fillColor(this.fillColor);
        this.context.opacity(this.alpha);
        this.context.roundedRect(x, y, w, h, radius);
        this.context.fill();
        this.restoreTransform();
    };


    /**
     * ellipse
     *
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {Array.<number>} dashPattern
     */
    Canvas.prototype.ellipse = function (x1, y1, x2, y2, dashPattern) {
        this.transform();
        var cx = (x1 + x2) / 2.0,
            cy = (y1 + y2) / 2.0,
            rx = Math.abs(x2 - x1) / 2.0,
            ry = Math.abs(y2 - y1) / 2.0;
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.opacity(this.alpha);
        if (dashPattern && dashPattern.length > 0) {
            this.context.dash(dashPattern[0], dashPattern.length > 1 ? { space: dashPattern[1] } : { space: dashPattern[0] });
        }
        this.context.ellipse(cx, cy, rx, ry);
        this.context.stroke();
        this.restoreTransform();
    };

    /**
     * fillEllipse
     *
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    Canvas.prototype.fillEllipse = function (x1, y1, x2, y2) {
        this.transform();
        var cx = (x1 + x2) / 2.0,
            cy = (y1 + y2) / 2.0,
            rx = Math.abs(x2 - x1) / 2.0,
            ry = Math.abs(y2 - y1) / 2.0;
        this.context.fillColor(this.fillColor);
        this.context.opacity(this.alpha);
        this.context.ellipse(cx, cy, rx, ry);
        this.context.fill();
        this.restoreTransform();
    };

    /**
     * Draw polyline
     * @param {Array.<Point>} points
     * @param {Array.<number>} dashPattern
     */
    Canvas.prototype.polyline = function (points, dashPattern) {
        var i, len, p;
        this.transform();
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.opacity(this.alpha);
        if (dashPattern && dashPattern.length > 0) {
            this.context.dash(dashPattern[0], dashPattern.length > 1 ? { space: dashPattern[1] } : { space: dashPattern[0] });
        }
        for (i = 0, len = points.length; i < len; i++) {
            p = points[i];
            if (i === 0) {
                this.context.moveTo(p.x, p.y);
            } else {
                this.context.lineTo(p.x, p.y);
            }
        }
        this.context.stroke();
        this.restoreTransform();
    };

    /**
     * Draw roundRectLine
     * @param {Array.<Point>} points
     * @param {Array.<number>} dashPattern
     */
    Canvas.prototype.roundRectLine = function (points, dashPattern) {
        var ROUND_RADIUS = 8;
        var i, len;
        this.transform();
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.opacity(this.alpha);
        if (dashPattern && dashPattern.length > 0) {
            this.context.dash(dashPattern[0], dashPattern.length > 1 ? { space: dashPattern[1] } : { space: dashPattern[0] });
        }
        if (points.length > 0) {
            var p, prev, next, pdir, ndir;
            this.context.moveTo(points[0].x, points[0].y);
            for (i = 1, len = points.length - 1; i < len; i++) {
                p = points[i];
                prev = points[i - 1];
                next = points[i + 1];
                // direction of previous line
                if (prev.x === p.x) { // vertical
                    pdir = (prev.y < p.y) ? 'VD' : 'VU'; // down or up
                } else { // horizontal
                    pdir = (prev.x < p.x) ? 'HR' : 'HL'; // right or left
                }
                // direction of next line
                if (next.x === p.x) {
                    ndir = (next.y < p.y) ? 'VU' : 'VD'; // vertical down or up
                } else {
                    ndir = (next.x < p.x) ? 'HL' : 'HR'; // horizontal right or left
                }
                // draw line
                switch (pdir) {
                case 'VD':
                    // this.context.moveTo(prev.x, prev.y + ROUND_RADIUS);
                    this.context.lineTo(p.x, p.y - ROUND_RADIUS);
                    break;
                case 'VU':
                    // this.context.moveTo(prev.x, prev.y - ROUND_RADIUS);
                    this.context.lineTo(p.x, p.y + ROUND_RADIUS);
                    break;
                case 'HR':
                    // this.context.moveTo(prev.x + ROUND_RADIUS, prev.y);
                    this.context.lineTo(p.x - ROUND_RADIUS, p.y);
                    break;
                case 'HL':
                    // this.context.moveTo(prev.x - ROUND_RADIUS, prev.y);
                    this.context.lineTo(p.x + ROUND_RADIUS, p.y);
                    break;
                }
                // draw corner
                switch (pdir) {
                case 'VD':
                    if (ndir === 'HL') {
                        _drawArc(this.context, p.x - ROUND_RADIUS, p.y - ROUND_RADIUS, ROUND_RADIUS, 0, 0.5 * Math.PI, false);
                    } else { // HR
                        _drawArc(this.context, p.x + ROUND_RADIUS, p.y - ROUND_RADIUS, ROUND_RADIUS, Math.PI, 0.5 * Math.PI, true);
                    }
                    break;
                case 'VU':
                    if (ndir === 'HL') {
                        _drawArc(this.context, p.x - ROUND_RADIUS, p.y + ROUND_RADIUS, ROUND_RADIUS, 0, 1.5 * Math.PI, true);
                    } else { // HR
                        _drawArc(this.context, p.x + ROUND_RADIUS, p.y + ROUND_RADIUS, ROUND_RADIUS, Math.PI, 1.5 * Math.PI, false);
                    }
                    break;
                case 'HR':
                    if (ndir === 'VD') {
                        _drawArc(this.context, p.x - ROUND_RADIUS, p.y + ROUND_RADIUS, ROUND_RADIUS, 1.5 * Math.PI, 0, false);
                    } else { // VU
                        _drawArc(this.context, p.x - ROUND_RADIUS, p.y - ROUND_RADIUS, ROUND_RADIUS, 0.5 * Math.PI, 0, true);
                    }
                    break;
                case 'HL':
                    if (ndir === 'VD') {
                        _drawArc(this.context, p.x + ROUND_RADIUS, p.y + ROUND_RADIUS, ROUND_RADIUS, 1.5 * Math.PI, Math.PI, true);
                    } else { // VU
                        _drawArc(this.context, p.x + ROUND_RADIUS, p.y - ROUND_RADIUS, ROUND_RADIUS, 0.5 * Math.PI, Math.PI, false);
                    }
                    break;
                }
            }
            this.context.lineTo(points[points.length-1].x, points[points.length-1].y);
        }
        this.context.stroke();
        this.restoreTransform();
    };

    /**
     * Draw curveLine
     * @param {Array.<Point>} points
     * @param {Array.<number>} dashPattern
     */
    Canvas.prototype.curveLine = function (points, dashPattern) {
        var i, len;
        this.transform();
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.opacity(this.alpha);
        if (dashPattern && dashPattern.length > 0) {
            this.context.dash(dashPattern[0], dashPattern.length > 1 ? { space: dashPattern[1] } : { space: dashPattern[0] });
        }
        this.context.moveTo(points[0].x, points[0].y);
        if (points.length > 2) {
            for (i = 1, len = points.length - 2; i < len; i++) {
                var xc = (points[i].x + points[i + 1].x) / 2;
                var yc = (points[i].y + points[i + 1].y) / 2;
                this.context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            this.context.quadraticCurveTo(points[i].x, points[i].y, points[i+1].x,points[i+1].y);
        } else {
            this.context.lineTo(points[points.length-1].x, points[points.length-1].y);
        }
        this.context.stroke();
        this.restoreTransform();
    };

    /**
     * Draw polygon
     * @param {Array.<Point>} points
     */
    Canvas.prototype.polygon = function (points) {
        var i, len, p;
        this.transform();
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.opacity(this.alpha);
        for (i = 0, len = points.length; i < len; i++) {
            p = points[i];
            if (i === 0) {
                this.context.moveTo(p.x, p.y);
            } else {
                this.context.lineTo(p.x, p.y);
            }
        }
        this.context.lineTo(points[0].x, points[0].y);
        this.context.stroke();
        this.restoreTransform();
    };

    /**
     * Draw filled polygon
     * @param {Points} points
     */
    Canvas.prototype.fillPolygon = function (points) {
        var i, len, p;
        this.transform();
        this.context.fillColor(this.fillColor);
        this.context.opacity(this.alpha);
        for (i = 0, len = points.length; i < len; i++) {
            p = points[i];
            if (i === 0) {
                this.context.moveTo(p.x, p.y);
            } else {
                this.context.lineTo(p.x, p.y);
            }
        }
        this.context.lineTo(points[0].x, points[0].y);
        this.context.fill();
        this.restoreTransform();
    };

    /**
     * Draw arc
     *
     * @param {number} x
     * @param {number} y
     * @param {number} r
     * @param {number} startAngle
     * @param {number} endAngle
     * @param {boolean} counterClockwise
     */
    Canvas.prototype.arc = function (x, y, r, startAngle, endAngle, counterClockwise) {
        this.transform();
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.opacity(this.alpha);
        _drawArc(this.context, x, y, r, startAngle, endAngle, counterClockwise);
        this.context.stroke();
        this.restoreTransform();
    };

    /**
     * Draw filled arc
     *
     * @param {number} x
     * @param {number} y
     * @param {number} r
     * @param {number} startAngle
     * @param {number} endAngle
     * @param {boolean} counterClockwise
     */
    Canvas.prototype.fillArc = function (x, y, r, startAngle, endAngle, counterClockwise) {
        this.transform();
        this.context.fillColor(this.fillColor);
        this.context.opacity(this.alpha);
        _drawArc(this.context, x, y, r, startAngle, endAngle, counterClockwise, true);
        this.restoreTransform();
    };

    /**
     * Draw a path.
     * A path command is one of the followings:
     *   ['M', x, y] - moveTo
     *   ['L', x, y] - lineTo
     *   ['C', x1, y1, x2, y2, x, y] - bezierCurveTo
     *   ['Q', x1, y1, x, 2] - quadraticCurveTo
     *   ['Z'] - closePath
     *
     * @param {Array.<Array>}
     */
    Canvas.prototype.path = function (commands) {
        this.transform();
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.opacity(this.alpha);
        for (var i = 0, len = commands.length; i < len; i++) {
            var comm = commands[i];
            switch (comm[0]) {
            case 'M':
                this.context.moveTo(comm[1], comm[2]);
                break;
            case 'L':
                this.context.lineTo(comm[1], comm[2]);
                break;
            case 'C':
                this.context.bezierCurveTo(comm[1], comm[2], comm[3], comm[4], comm[5], comm[6]);
                break;
            case 'Q':
                this.context.quadraticCurveTo(comm[1], comm[2], comm[3], comm[4]);
                break;
            case 'Z':
                this.context.closePath();
                break;
            }
        }
        this.context.stroke();
        this.restoreTransform();
    };

    /**
     * Draw a filled path
     * A path command is one of the followings:
     *   ['M', x, y] - moveTo
     *   ['L', x, y] - lineTo
     *   ['C', x1, y1, x2, y2, x, y] - bezierCurveTo
     *   ['Q', x1, y1, x, 2] - quadraticCurveTo
     *   ['Z'] - closePath
     *
     * @param {Array.<Array>}
     * @param {boolean} doStroke
     */
    Canvas.prototype.fillPath = function (commands, doStroke) {
        this.transform();
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.fillColor(this.fillColor);
        this.context.opacity(this.alpha);
        this.context.fillOpacity(this.alpha);
        var i, len, comm;
        for (i = 0, len = commands.length; i < len; i++) {
            comm = commands[i];
            switch (comm[0]) {
            case 'M':
                this.context.moveTo(comm[1], comm[2]);
                break;
            case 'L':
                this.context.lineTo(comm[1], comm[2]);
                break;
            case 'C':
                this.context.bezierCurveTo(comm[1], comm[2], comm[3], comm[4], comm[5], comm[6]);
                break;
            case 'Q':
                this.context.quadraticCurveTo(comm[1], comm[2], comm[3], comm[4]);
                break;
            case 'Z':
                this.context.closePath();
                break;
            }
        }
        this.context.fill();
        if (doStroke) {
            for (i = 0, len = commands.length; i < len; i++) {
                comm = commands[i];
                switch (comm[0]) {
                case 'M':
                    this.context.moveTo(comm[1], comm[2]);
                    break;
                case 'L':
                    this.context.lineTo(comm[1], comm[2]);
                    break;
                case 'C':
                    this.context.bezierCurveTo(comm[1], comm[2], comm[3], comm[4], comm[5], comm[6]);
                    break;
                case 'Q':
                    this.context.quadraticCurveTo(comm[1], comm[2], comm[3], comm[4]);
                    break;
                case 'Z':
                    this.context.closePath();
                    break;
                }
            }
            this.context.stroke();
        }
        this.restoreTransform();
    };

    /**
     * Word Wrap
     * @param {string} text
     * @param {number} width
     * @return {Array.<string>}
     */
    Canvas.prototype.wordWrap = function (text, width) {
        var lines  = text.split(" ");
        if (lines.length > 0) {
            var result = [],
                term   = lines[0];
            for (var i = 1, len = lines.length; i < len; i++) {
                var t = term + " " + lines[i],
                    w = this.__widthOfStringUnicode(t, this.font.size);
                if (w <= width) {
                    term = t;
                } else {
                    result.push(term);
                    term = lines[i];
                }
            }
            if (term.length > 0) {
                result.push(term);
            }
            return result;
        }
        return [];
    };

    /**
     * Draw text
     *
     * @param {number} x
     * @param {number} y
     * @param {text} text
     * @param {boolean} rotate
     * @param {boolean} wordWrap
     * @param {boolean} underline
     */
    Canvas.prototype.textOut = function (x, y, text, rotation, wordWrap, underline) {
        var r = new Graphics.Rect(x, y, x, y);
        rotation  = rotation ? rotation : 0;
        wordWrap  = wordWrap ? wordWrap : false;
        underline = underline ? underline : false;
        this.textOut2(r, text, Graphics.AL_LEFT, Graphics.AL_TOP, rotation, wordWrap, underline);
    };


    /**
     * Compute width of unicode string
     * @private
     */
    Canvas.prototype.__widthOfStringUnicode = function (text, fontSize) {
        var terms = Unicode.tokenize(text);
        var width = 0;
        for (var i = 0, len = terms.length; i < len; i++) {
            var term = terms[i];
            this._setFont(this.font, term);
            this.context.fontSize(fontSize);
            width = width + this.context._font.widthOfString(term, fontSize);
        }
        return width;
    };

    /**
     * Draw unicode text with Default System Font
     * @private
     */
    Canvas.prototype.__textOutUnicode = function (text, x, y, options) {
        var terms = Unicode.tokenize(text);
        var _x = x,
            _y = y;

        // Compute position where text to be draw
        if (options.align) {
            var width = this.__widthOfStringUnicode(text, this.font.size);
            switch (options.align) {
            case 'left':
                break;
            case 'right':
                _x = (_x + options.width) - width;
                break;
            case 'center':
                _x = _x + (options.width - width) / 2;
                break;
            }
        }
        delete options.align;

        // Draw text
        options.continued = true;
        for (var i = 0, len = terms.length; i < len; i++) {
            var term = terms[i];
            var isLast = (i >= (len - 1));
            options.continued = !isLast;
            if (i === 0) {
                this._setFont(this.font, term);
                this.context.text(term, _x, _y, options);
            } else {
                this._setFont(this.font, term);
                this.context.text(term, options);
            }
        }
        this._setFont(this.font, text);
    };


    /**
     * Draw text
     *
     * @param {Rect} rect
     * @param {string} text
     * @param {number} horizontalAlignment
     * @param {number} verticalAlignment
     * @param {boolean} rotate
     * @param {boolean} wordWrap
     * @param {boolean} underline
     */
    Canvas.prototype.textOut2 = function (rect, text, horizontalAlignment, verticalAlignment, rotate, wordWrap, underline) {
        this.transform();
        this.context.save();
        this.context.fillColor(this.fontColor);
        this.context.opacity(this.alpha);
        this._setFont(this.font, text);
        var baseX = rect.x1,
            baseY = rect.y1,
            options = {
                lineBreak: false,
                ellipsis: false,
                width: rect.getWidth(),
                height: rect.getHeight(),
                underline: underline
            };
        var w;
        if (rotate === true) {
            switch (verticalAlignment) {
            case Graphics.AL_TOP:
                baseX = rect.x1;
                break;
            case Graphics.AL_BOTTOM:
                baseX = rect.x2 - this.font.size;
                break;
            case Graphics.AL_MIDDLE:
                baseX = ((rect.x1 + rect.x2) / 2.0) - (this.font.size / 2.0);
                break;
            }
            baseY = rect.y2;
            options.width = rect.getHeight();
            options.height = rect.getWidth();
            switch (horizontalAlignment) {
            case Graphics.AL_LEFT:
                options.align = "left";
                break;
            case Graphics.AL_RIGHT:
                options.align = "right";
                break;
            case Graphics.AL_CENTER:
                options.align = "center";
                break;
            }
            this.context.translate(baseX, baseY);
            this.context.rotate(-90);
            this.__textOutUnicode(text, 0, 0, options);
        } else {
            switch (verticalAlignment) {
            case Graphics.AL_TOP:
                baseY = rect.y1;
                break;
            case Graphics.AL_BOTTOM:
                baseY = rect.y2 - this.font.size;
                break;
            case Graphics.AL_MIDDLE:
                baseY = ((rect.y1 + rect.y2) / 2.0) - (this.font.size / 2.0);
            }
            switch (horizontalAlignment) {
            case Graphics.AL_LEFT:
                options.align = "left";
                break;
            case Graphics.AL_RIGHT:
                options.align = "right";
                break;
            case Graphics.AL_CENTER:
                options.align = "center";
            }
            if (wordWrap) {
                var lines = this.wordWrap(text, rect.getWidth()),
                    _height = (lines.length * this.font.size);
                switch (verticalAlignment) {
                case Graphics.AL_BOTTOM:
                    baseY = rect.y2 - ((lines.length - 1) * this.font.size);
                    break;
                case Graphics.AL_MIDDLE:
                    baseY = rect.y1 + ((rect.getHeight() - _height) / 2.0);
                    break;
                }
                for (var i = 0, len = lines.length; i < len; i++) {
                    // To avoid that a part of text is not rendered
                    w = this.__widthOfStringUnicode(lines[i], this.font.size);
                    if (w > options.width) {
                        options.width = w;
                    }
                    switch (horizontalAlignment) {
                    case Graphics.AL_LEFT:
                        options.align = "left";
                        break;
                    case Graphics.AL_RIGHT:
                        options.align = "right";
                        break;
                    case Graphics.AL_CENTER:
                        options.align = "center";
                        break;
                    }
                    this.__textOutUnicode(lines[i], baseX, baseY, options);
                    baseY = baseY + this.font.size;
                }
            } else {
                // To avoid that a part of text is not rendered
                w = this.__widthOfStringUnicode(text, this.font.size);
                if (w > options.width) {
                    options.width = w;
                }
                this.__textOutUnicode(text, baseX, baseY, options);
            }
        }
        this.context.restore();
        this.restoreTransform();
    };

    /**
     * Get Text Extent
     * @param {string} text
     * @param {number} wordWrapWidth
     * @return {Point}
     */
    Canvas.prototype.textExtent = function (text, wordWrapWidth) {
        var self = this;
        this._setFont(this.font, text);
        var sz = new Graphics.Point(0, 0);
        if (wordWrapWidth) {
            var lines = this.wordWrap(text, wordWrapWidth),
                widths = _.map(lines, function (line) { return self.__widthOfStringUnicode(line, self.font.size); });
            sz.x = _.max(widths);
            sz.y = this.font.size * lines.length;
        } else {
            sz.x = this.__widthOfStringUnicode(text, this.font.size);
            sz.y = this.font.size;
        }
        return sz;
    };

    /**
     * Draw Image
     *
     * @param {Image} image
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    Canvas.prototype.drawImage = function (image, x, y, width, height) {
    };

    /**
     * Register FontSet
     *
     * @param {string} name Font set name
     * @param {Array.<string>} fontSet A list of 4 font names (normal, bold, italic, boldItalic)
     */
    function registerFontSet(family, fontSet) {
        _fontSet[family] = fontSet;
    }

    registerFontSet("Helvetica", ["Helvetica", "Helvetica-Bold", "Helvetica-Oblique", "Helvetica-BoldOblique"]);
    registerFontSet("Courier",   ["Courier", "Courier-Bold", "Courier-Oblique", "Courier-BoldOblique"]);
    registerFontSet("Times",     ["Times-Roman", "Times-Bold", "Times-Italic", "Times-BoldItalic"]);
    registerFontSet("System", _fontSet["Helvetica"]);

    exports.Canvas          = Canvas;
    exports.registerFontSet = registerFontSet;

});

