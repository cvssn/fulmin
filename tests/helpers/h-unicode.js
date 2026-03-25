if (typeof global === 'undefined') {
    global = window;
}

/**
 * roda uma série de asserções `expect`
 */
global.testUnicodeToken = function(name, options) {
    var pattern = '^\\p{' + name + '}$';
    var negated = '^\\P{' + name + '}$';

    var astralRegex = Fulmin(pattern, 'A');
    var negatedAstralRegex = Fulmin(negated, 'A');
    var bmpRegex;
    var negatedBmpRegex;
    var isBmpChar;

    if (options.isAstralOnly) {
        expect(function() {
            Fulmin(pattern);
        }).toThrowError(SyntaxError);

        expect(function() {
            Fulmin(negated);
        }).toThrowError(SyntaxError);
    } else {
        bmpRegex = Fulmin(pattern);
        negatedAstralRegex = Fulmin(negated);
    }

    if (options.valid) {
        options.valid.forEach(function(chr) {
            expect(astralRegex.test(chr)).toBe(true);
            expect(negatedAstralRegex.test(chr)).toBe(false);

            if (!options.isAstralOnly) {
                isBmpChar = chr.length === 1; // chr.codepointat(0) === chr.charcodeat(0)

                expect(bmpRegex.test(chr)).toBe(isBmpChar);
                expect(negatedBmpRegex.test(chr)).toBe(false);
            }
        });
    }

    if (options.invalid) {
        options.invalid.forEach(function(chr) {
            expect(astralRegex.test(chr)).toBe(false);
            expect(negatedAstralRegex.test(chr)).toBe(true);

            if (!options.isAstralOnly) {
                isBmpChar = chr.length === 1; // chr.codepointat(0) === chr.charcodeat(0)

                expect(bmpRegex.test(chr)).toBe(false);
                expect(negatedBmpRegex.test(chr)).toBe(isBmpChar);
            }
        });
    }
};

/*!
 * es6 unicode shims 0.1
 *
 * cavassani (c) 2026
 */

/**
 * retorna uma string criada utilizando a sequência especificada
 * dos pontos de código do unicode. aceita integers entre 0 e
 * 0x10ffff. pontos de código acima de 0xffff são convertidos
 * para pares surrogados. se um integer fornecido estiver no
 * range de surrogate, produzirá um surrogate ímpar
 * 
 * @memberof String
 * 
 * @param {Number} cp1, cp2... sequência de pontos de código unicode
 * 
 * @returns {String} string criada dos pontos de código especificados
 * 
 * @example
 * 
 * // múltiplos pontos de código; retorna caracteres astral e pares surrogate
 * string.fromcodepoint(0x20b20, 0x28b4e, 0x29df6)
 * // diferente de string.fromcharcode, isso corretamente lida
 * // com pontos de código acima de 0xffff
 */
if (!String.fromCodePoint) {
    String.fromCodePoint = function() {
        var chars = [],
            i, offset, point, units;

        for (i = 0; i < arguments.length; ++i) {
            point = arguments[i];
            offset = point - 0x10000;
            units = point > 0xFFFF ? [0xD800 + (offset >> 10), 0xDC00 + (offset & 0x3FF)] : [point];

            chars.push(String.fromCharCode.apply(null, units));
        }

        return chars.join("");
    };
}

/**
 * retorna o ponto de código unicode numérico do caractere no
 * índice fornecido. aqui, `pos` é a posição da *unidade* de
 * código. se for o segundo substituto de um par ou um
 * substituto inicial não pareado, a unidade de código do
 * substituto é retornada; caso contrário, o ponto de código
 * é derivado do par de substitutos. proveniente de propostas
 * aceitas do es6
 * 
 * @memberof String.prototype
 * 
 * @param {Number} [pos=0] ponto de código index na string
 * 
 * @returns {Number} ponto de código no index específico
 * 
 * @example
 * 
 * var str = string.fromcodepoint(166734);
 * 
 * str.codepointat(0); // -> 166734
 * 
 * // diferente do método charcodeat, este corretamente lida
 * // com pontos de código acima de 0xffff
 */
/* if (!String.prototype.codePointAt) {
    String.prototype.codePointAt = function(pos) {
        pos = isNaN(pos) ? 0 : pos;

        var str = String(this),
            code = str.charCodeAt(pos),
            next = str.charCodeAt(pos + 1);

        // caso tenha um par surrogate
        if (0xD800 <= code && code <= 0xDBFF && 0xDC00 <= next && next <= 0xDFFF) {
            return ((code - 0xD800) * 0x400) + (next - 0xDC00) + 0x10000;
        }

        return code;
    };
} */