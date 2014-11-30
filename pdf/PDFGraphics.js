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
/*global define, _*/

define(function (require, exports, module) {
    "use strict";

    var Graphics = require("core/Graphics");

    var HELVETICA_FONTSET = ["Helvetica", "Helvetica-Bold", "Helvetica-Oblique", "Helvetica-BoldOblique"],
        COURIER_FONTSET   = ["Courier", "Courier-Bold", "Courier-Oblique", "Courier-BoldOblique"],
        TIMES_FONTSET     = ["Times-Roman", "Times-Bold", "Times-Italic", "Times-BoldItalic"];    
    
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
    
    Canvas.prototype._setFont = function (font) {
        this.context.fontSize(font.size * 0.96);
        var _fontset = HELVETICA_FONTSET; // Default
        switch (font.face.toLowerCase()) {
        case "helvetica":
        case "sans-serif":
        case "arial":
            _fontset = HELVETICA_FONTSET;
            break;
        case "times":
        case "times new roman":
        case "sans":
            _fontset = TIMES_FONTSET;
            break;
        case "courier":
        case "courier new":
            _fontset = COURIER_FONTSET;
            break;
        }
        switch (font.style) {
        case Graphics.FS_NORMAL:
            this.context.font(_fontset[0]);
            break;
        case Graphics.FS_BOLD:
            this.context.font(_fontset[1]);
            break;
        case Graphics.FS_ITALIC:
            this.context.font(_fontset[2]);
            break;
        case Graphics.FS_BOLD_ITALIC:
            this.context.font(_fontset[3]);
            break;
        }
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
            this.context.dash(dashPattern[0], dashPattern.length > 1 ? dashPattern[1] : dashPattern[0]);
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
            this.context.dash(dashPattern[0], dashPattern.length > 1 ? dashPattern[1] : dashPattern[0]);
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
            this.context.dash(dashPattern[0], dashPattern.length > 1 ? dashPattern[1] : dashPattern[0]);
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
            this.context.dash(dashPattern[0], dashPattern.length > 1 ? dashPattern[1] : dashPattern[0]);
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
        var sx = x + r * Math.cos(startAngle),
            sy = y + r * Math.sin(startAngle),
            ex = x + r * Math.cos(endAngle),
            ey = y + r * Math.sin(endAngle);
        this.context.strokeColor(this.color);
        this.context.lineWidth(this.lineWidth);
        this.context.opacity(this.alpha);
        var path;
        if (counterClockwise === true) {
            path = "M " + sx + " " + sy + " A " + r + " " + r + " 0 0 0 " + ex + " " + ey;
        } else {
            path = "M " + ex + " " + ey + " A " + r + " " + r + " 0 0 0 " + sx + " " + sy;
        }
        this.context.path(path);
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
        var sx = x + r * Math.cos(startAngle),
            sy = y + r * Math.sin(startAngle),
            ex = x + r * Math.cos(endAngle),
            ey = y + r * Math.sin(endAngle);        
        this.context.fillColor(this.fillColor);
        this.context.opacity(this.alpha);
        var path;
        if (counterClockwise === true) {
            path = "M " + sx + " " + sy + " A " + r + " " + r + " 0 0 0 " + ex + " " + ey;
        } else {
            path = "M " + ex + " " + ey + " A " + r + " " + r + " 0 0 0 " + sx + " " + sy;
        }
        this.context.path(path);
        this.context.fill();
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
                    w = this.context._font.widthOfString(t, this.font.size);
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
        this._setFont(this.font);
        var baseX = rect.x1,
            baseY = rect.y1,
            options = {
                lineBreak: false,
                ellipsis: true,
                width: rect.getWidth(),
                height: rect.getHeight(),
                underline: underline
            };
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
            this.context.text(text, 0, 0, options);
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
            
            // To avoid that a part of text is not rendered
            var w = this.context._font.widthOfString(text, this.font.size);
            if (w > options.width) {
                options.width = w;
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
                    this.context.text(lines[i], baseX, baseY, options);
                    baseY = baseY + this.font.size;
                }
            } else {
                this.context.text(text, baseX, baseY, options);
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
        this._setFont(this.font);
        var sz = new Graphics.Point(0, 0);
        if (wordWrapWidth) {
            var lines = this.wordWrap(text, wordWrapWidth),
                widths = _.map(lines, function (line) { return self.context._font.widthOfString(line, self.font.size); });
            sz.x = _.max(widths);
            sz.y = this.font.size * lines.length;
        } else {
            sz.x = this.context._font.widthOfString(text, this.font.size);
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


    exports.Canvas = Canvas;

});

