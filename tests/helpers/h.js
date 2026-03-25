if (typeof global === 'undefined') {
    global = window;
} else {
    global.Fulmin = require('../../fulmin-all');
}

// certifica se todas as features estão resetadas ao padrão
// quando cada spec iniciar
global.resetFeatures = function() {
    Fulmin.uninstall('astral');
    Fulmin.install('namespacing');
};

// nome de propriedade utilizada para regex estendido
global.REGEX_DATA = 'fulmin';

// checa pelo suporte à flag `d` de es2021
global.hasNativeD = Fulmin._hasNativeFlag('d');

// checa pelo suporte à flag `s` de es2018
global.hasNativeS = Fulmin._hasNativeFlag('s');

// checa pelo suporte à flag `u` de es6
global.hasNativeU = Fulmin._hasNativeFlag('u');

// checa pelo suporte à flag `y` de es6
global.hasNativeY = Fulmin._hasNativeFlag('y');

global.hasStrictMode = (function() {
    'use strict';

    return !this;
}());

// polyfill nativo de string.prototype.repeat
if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
        return count ? Array(count + 1).join(this) : '';
    };
}