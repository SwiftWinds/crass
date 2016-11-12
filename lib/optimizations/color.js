var colorConvert = require('color-convert');

var colors = require('../colors');
var objects = require('../objects');

module.exports = function(applier, alpha, kw) {
    var func = require('../utils').func;

    var choices = [];
    var grayVal;

    if (alpha > 1) {
        alpha = 1;
    } else if (alpha < 0) {
        alpha = 0;
    }

    if (alpha === 0) {
        applier = function(fn) {
            if (fn === 'rgb') {
                return [0, 0, 0];
            }
            return colorConvert.rgb[fn]([0, 0, 0]);
        };
    }

    var hsl = applier('hsl');
    var hwb = applier('hwb');
    var lab = applier('lab');
    var lch = applier('lch');
    var rgb = applier('rgb');

    if (alpha === 1) {
        choices.push(
            [
                'rgb(' +  rgb.map(minimizeNum).join(',') + ')',
                function() {
                    return func('rgb', rgb);
                }
            ]
        );
        choices.push(
            [
                // NOTE: This isn't "correct" but it gives the correct length, which is what matters
                'hsl(' +  rgb.map(minimizeNum).join('%,') + ')',
                function() {
                    return func('hsl', [hsl[0], percentify(hsl[1]), percentify(hsl[2])]);
                }
            ]
        );
        if (kw.css4) {
            choices.push(
                [
                    'hwb(' +  hwb.map(minimizeNum).join(' ') + ')',
                    function() {
                        return func('hwb', [hwb[0], percentify(hwb[1]), percentify(hwb[2])], null);
                    }
                ]
            );
            choices.push(
                [
                    'lab(' +  lab.map(minimizeNum).join(' ') + ')',
                    function() {
                        return func('lab', [lab[0], percentify(lab[1]), percentify(lab[2])], null);
                    }
                ]
            );
            choices.push(
                [
                    'lch(' +  lch.map(minimizeNum).join(' ') + ')',
                    function() {
                        return func('lch', [lch[0], percentify(lch[1]), percentify(lch[2])], null);
                    }
                ]
            );
        }

        var hex = shortenHexColor(makeHex(rgb)).toLowerCase();
        choices.push(
            [
                hex,
                function() {
                    return new objects.HexColor(hex);
                }
            ]
        );

        // OPT: Return the color name instead of hex value when shorter.
        if (hex in colors.HEX_TO_COLOR) {
            choices.push(
                [
                    colors.HEX_TO_COLOR[hex],
                    function() {
                        return colors.HEX_TO_COLOR[hex];
                    }
                ]
            );
        }

        if (
            kw.css4 &&
            rgb[0] === rgb[1] &&
            rgb[1] === rgb[2]
        ) {
            grayVal = (rgb[0] / 255 * 100).toFixed(2);
            choices.push(
                [
                    'gray(' + minimizeNum(grayVal) + '%)',
                    function() {
                        return func('gray', [percentify(grayVal)]);
                    }
                ]
            );
        }
    } else {
        var alphaNum = minimizeNum(alpha);

        choices.push(
            [
                'rgba(' +  rgb.map(minimizeNum).join(',') + ',' + alphaNum + ')',
                function() {
                    return func('rgba', rgb.concat([alpha]));
                }
            ]
        );
        choices.push(
            [
                // NOTE: This isn't "correct" but it gives the correct length, which is what matters
                'hsla(' +  hsl.map(minimizeNum).join('%,') + ',' + alphaNum + ')',
                function() {
                    return func('hsla', hslArgs(hsl).concat([alpha]));
                }
            ]
        );
        if (kw.css4) {
            choices.push(
                [
                    'hwb(' +  hwb.map(minimizeNum).join(' ') + '/' + alphaNum + ')',
                    function() {
                        return func(
                            'hwb',
                            [hwb[0], percentify(hwb[1]), percentify(hwb[2]), alpha],
                            function(i) {
                                return i === 3 ? '/' : null;
                            }
                        );
                    }
                ]
            );
            choices.push(
                [
                    'lab(' +  lab.map(minimizeNum).join(' ') + '/' + alphaNum + ')',
                    function() {
                        return func(
                            'lab',
                            [lab[0], lab[1], lab[2], alpha],
                            function(i) {
                                return i === 3 ? '/' : null;
                            }
                        );
                    }
                ]
            );
            choices.push(
                [
                    'lch(' +  lch.map(minimizeNum).join(' ') + '/' + alphaNum + ')',
                    function() {
                        return func(
                            'lch',
                            [lch[0], lch[1], lch[2], alpha],
                            function(i) {
                                return i === 3 ? '/' : null;
                            }
                        );
                    }
                ]
            );

            var hexVariant = '#' + colorConvert.rgb.hex(rgb).toLowerCase();
            var hexAlphaV = ('00' + (alpha * 255).toString(16)).substr(-2);
            if (hexAlphaV.indexOf('.') === -1) {
                var canShortenHexVariant = (
                    hexVariant.length !== shortenHexColor(hexVariant).length &&
                    hexAlphaV[0] === hexAlphaV[1]
                );
                if (canShortenHexVariant) {
                    var shortenHexColorVariant = shortenHexColor(hexVariant);
                    choices.push(
                        [
                            shortenHexColorVariant + hexAlphaV,
                            function() {
                                return new objects.HexColor(shortenHexColorVariant + hexAlphaV[0]);
                            }
                        ]
                    );
                } else {
                    choices.push(
                        [
                            hexVariant + hexAlphaV,
                            function() {
                                return new objects.HexColor(hexVariant + hexAlphaV);
                            }
                        ]
                    );
                }
            }
        }

        if (
            kw.css4 &&
            rgb[0] === rgb[1] &&
            rgb[1] === rgb[2]
        ) {
            grayVal = minimizeNum((rgb[0] / 255 * 100).toFixed(2));
            choices.push(
                [
                    'gray(' + grayVal + '%/' + alphaNum + ')',
                    function() {
                        return func('gray', [percentify(grayVal), alpha], '/');
                    }
                ]
            );
        }

        if (alpha === 0) {
            choices.push(
                [
                    'transparent',
                    function() {
                        return 'transparent';
                    }
                ]
            );
        }
    }

    return choices.reduce(function(acc, cur) {
        var len = cur[0].length;
        var accLen = acc[0].length;

        if (len < accLen) {
            return cur;
        } else {
            return acc;
        }
    })[1]();
};

var shortenHexColor = module.exports.shortenHexColor = function(hex) {
    if (hex[1] === hex[2] &&
        hex[3] === hex[4] &&
        hex[5] === hex[6]) {
        return '#' + hex[1] + hex[3] + hex[5];
    }
    return hex;
};


function minimizeNum(n) {
    return (new objects.Number(n)).toString();
}

function percentify(x) {
    return new objects.Dimension(new objects.Number(x), '%')
}
function hslArgs(args) {
    args[1] = percentify(args[1]);
    args[2] = percentify(args[2]);
    return args;
}

function makeHex(rgb) {
    return '#' + rgb.map(function(c) {
        var str = c.toString(16);
        if (str.length === 1) {
            str = '0' + str;
        }
        return str;
    }).join('');
}