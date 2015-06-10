/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, _*/

define(function (require, exports, module) {
    "use strict";

    var Unicode = require("lib/Unicode");

    var _fonts = {};

    var _defaultFonts = [];

    var _defaultFont = null;

    var _files = {};

    /**
     * Unicode map for determining one of default fonts
     */
    var _unicodeMap = {};

    function _stripExt(file) {
        if (/\.(ttf|ttc)$/i.test(file)) {
            return file.substring(0, file.length-4);
        } else {
            return file;
        }
    }

    function getDefaultFontInfo(char) {
        if (!char) {
            return _defaultFont;
        } else {
            var code = char.charCodeAt(0);
            return _unicodeMap[code] || _defaultFont;
        }
    }

    function getFontInfo(name, char) {
        var f = _fonts[name] || getDefaultFontInfo(char);
        if (f.unicodeRanges) {
            if (Unicode.inUnicodeRanges(f.unicodeRanges, char)) {
                return f;
            } else {
                return getDefaultFontInfo(char);
            }
        } else {
            return f;
        }
    }

    function _registerFontFiles(font) {
        _files[font.regular]    = (font.path || "") + '/' + font.regular;
        _files[font.italic]     = (font.path || "") + '/' + font.italic;
        _files[font.bold]       = (font.path || "") + '/' + font.bold;
        _files[font.boldItalic] = (font.path || "") + '/' + font.boldItalic;
    }

    function _registerUserFont(font) {
        _registerFontFiles(font);
        _fonts[font.name] = font;
    }

    function _registerDefaultFont(font) {
        _registerFontFiles(font);
        _defaultFonts.push(font);
        if (font.unicodeRanges) {
            for (var i = 0, len = font.unicodeRanges.length; i < len; i++) {
                var range = Unicode.UNICODE_RANGES[font.unicodeRanges[i]];
                for (var j = range[0]; j <= range[1]; j++) {
                    _unicodeMap[j] = font;
                }
            }
        } else {
            _defaultFont = font;
        }
    }

    /**
     * Register a font
     *
     * ex)
     * font = {
     *      name          : "Arial", // Use "default" for default font
     *      path          : "/styles/fonts/Arial",
     *      regular       : "LiberationSans-Regular.ttf",
     *      italic        : "LiberationSans-Italic.ttf",
     *      bold          : "LiberationSans-Bold.ttf",
     *      boldItalic    : "LiberationSans-BoldItalic.ttf",
     *      unicodeRanges : [24, 25, 26] // (optional. unicode range number)
     * }
     *
     * @param {object} font
     */
    function registerFont(font) {
        if (font.name === "default") {
            _registerDefaultFont(font);
        } else {
            _registerUserFont(font);
        }
    }


    // Register standard fonts of pdfkit
    _fonts.Helvetica = {
        name          : "Helvetica",
        regular       : "Helvetica",
        italic        : "Helvetica-Oblique",
        bold          : "Helvetica-Bold",
        boldItalic    : "Helvetica-BoldOblique",
        unicodeRanges : [0,1],
        afm           : true
    };
    _fonts.Times = {
        name          : "Times",
        regular       : "Times-Roman",
        italic        : "Times-Italic",
        bold          : "Times-Bold",
        boldItalic    : "Times-BoldItalic",
        unicodeRanges : [0,1],
        afm           : true
    };
    _fonts.Courier = {
        name          : "Courier",
        regular       : "Courier",
        italic        : "Courier-Oblique",
        bold          : "Courier-Bold",
        boldItalic    : "Courier-BoldOblique",
        unicodeRanges : [0,1],
        afm           : true
    };

    exports.userFonts    = _fonts;
    exports.defaultFonts = _defaultFonts;
    exports.unicodeMap   = _unicodeMap;
    exports.files        = _files;

    exports.getDefaultFontInfo = getDefaultFontInfo;
    exports.getFontInfo        = getFontInfo;
    exports.registerFont       = registerFont;

});
