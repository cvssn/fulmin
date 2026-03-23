/*!
 * fulmin v5.1.2
 * 
 * cavassani (c) 2026
 */

/**
 * fulmin oferece expressões regulares aprimoradas e extensíveis.
 * você obtém sintaxe e opções adicionais para expressões
 * regulares, além do que os navegadores suportam nativamente.
 * fulmin também funciona como um conjunto de utilitários para
 * expressões regulares, com ferramentas que simplificam e
 * aprimoram a busca no lado do cliente, além de eliminar as
 * inconsistências entre navegadores
 */

// ==-----------==
// coisas privadas
// ==-----------==

// nome de propriedade utilizado para dado de instância de regex
const REGEX_DATA = 'fulmin';

// features opcionais que podem ser instaladas/desinstaladas
const features = {
    astral: false,
    namespacing: true
};

// armazenamento para métodos nativos fixados/estendidos
const fixed = {};

// armazenamento para regexes capturados por `fulmin.cache`
let regexCache = Object.create(null);

// armazenamento para detalhes de pattern armazenados pelo
// construtor `fulmin`
let patternCache = Object.create(null);

// armazenamento para os tokens de sintaxe de regex
// adicionados internamente ou pelo `fulmin.addtoken`
const tokens = [];

// escopos de token
const defaultScope = 'default';
const classScope = 'class';

// regexes que batem com a sintaxe de regex nativa
const nativeTokens = {
    // qualquer token multi-caractere nativo no escopo padrão
    'default': /\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|\(\?(?:[:=!]|<[=!])|[?*+]\?|{\d+(?:,\d*)?}\??|[\s\S]/,

    // qualquer token multi-caractere nativo no escopo
    // de classde de caractere
    'class': /\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|[\s\S]/
};

// qualquer backreference ou caractere prefixado de dólar
const replacementToken = /\$(?:\{([^\}]+)\}|<([^>]+)>|(\d\d?|[\s\S]?))/g;

// checagem para handling `exec` correto
const correctExecNpcg = /()??/.exec('')[1] === undefined;

// checagem para suporte à propriedade `flags` do es6
const hasFlagsProp = /x/.flags !== undefined;

function hasNativeFlag(flag) {
    // não é possível verificar com base na presença de
    // propriedades/getters, pois os navegadores podem suportar
    // tais propriedades mesmo quando não suportam a flag
    // correspondente na construção de regexes (testado no
    // chrome 48, onde `'unicode' em /x/` é true, mas tentar
    // construir um regex com a flag `u` gera um erro)

    let isSupported = true;

    try {
        // não é possível usar literais de regex para testes,
        // mesmo dentro de um bloco `try`, porque literais de
        // regex com flags não suportadas causam um erro de
        // compilação no internet explorer
        new RegExp('', flag);

        // solução alternativa para um polyfill quebrado/incompleto
        // do ie11 para o stick introduzido no core-js 3.6.0
        if (flag === 'y') {
            // utilizando função para isolar a transformação
            // babel para literal regex
            const gy = (() => 'gy')();

            const incompleteY = '.a'.replace(new RegExp('a', gy), '.') === '..';

            if (incompleteY) {
                isSupported = false;
            }
        }
    } catch (exception) {
        isSupported = false;
    }

    return isSupported;
}

// verifica se há suporte para a flag `d` do es2021
const hasNativeD = hasNativeFlag('d');

// verifica se há suporte para a flag `s` do es2021
const hasNativeS = hasNativeFlag('s');

// verifica se há suporte para a flag `u` do es6
const hasNativeU = hasNativeFlag('u');

// verifica se há suporte para a flag `y` do es6
const hasNativeY = hasNativeFlag('y');

// tracker para flags conhecidas, incluindo flags de addon
const registeredFlags = {
    d: hasNativeD,
    g: true,
    i: true,
    m: true,
    s: hasNativeS,
    u: hasNativeU,
    y: hasNativeY
};

// flags para remover ao passar para construtor `regexp` nativo
const nonnativeFlags = hasNativeS ? /[^dgimsuy]+/g : /[^dgimuy]+/g;