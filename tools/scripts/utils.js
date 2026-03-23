const fs = require('fs');
const jsesc = require('jsesc');

const pkg = require('../../package.json');
const dependencies = Object.keys(pkg.devDependencies);

const unicodeVersion = dependencies.find((name) => /^@unicode\/unicode-\d/.test(name));

// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
const highSurrogate = (codePoint) => Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
const lowSurrogate = (codePoint) => ((codePoint - 0x10000) % 0x400) + 0xDC00;

const codePointToString = (codePoint) => {
    const string = String.fromCodePoint(codePoint);

    // importante: escapar meta-caracteres regexp
    if (/[$()*+\-\./?\[\]^{|}]/.test(string)) {
        return `\\${string}`;
    }

    return string;
};

const createRange = (codePoints) => {
    // a gama inclui substitutos isolados de alta intensidade?
    let isBmpLast = false;

    // a gama inclui pontos de código astral?
    let hasAstralCodePoints = false;

    const bmp = [];

    const supplementary = new Map();

    for (const codePoint of codePoints) {
        if (codePoint >= 0xD800 && codePoint <= 0xDBFF) {
            isBmpLast = true;

            bmp.push(codePoint);
        } else if (codePoint <= 0xFFFF) {
            bmp.push(codePoint);
        } else { // é um ponto de código suplementar
            const hi = highSurrogate(codePoint);
            const lo = lowSurrogate(codePoint);

            if (supplementary.has(hi)) {
                supplementary.get(hi).push(lo);
            } else {
                supplementary.set(hi, [lo]);
            }

            hasAstralCodePoints = true;
        }
    }

    const supplementaryByLowRanges = new Map();

    for (const [hi, lo] of supplementary) {
        const key = createBmpRange(lo);

        if (supplementaryByLowRanges.has(key)) {
            supplementaryByLowRanges.get(key).push(hi);
        } else {
            supplementaryByLowRanges.set(key, [hi]);
        }
    }

    // `supplementarydictbylowranges` se parece com isto:
    // {'range': [lista de surrogates]}

    const bmpRange = createBmpRange(bmp, {
        addBrackets: false
    });

    const buf = [];

    let astralRange = '';

    if (hasAstralCodePoints) {
        for (const [lo, hi] of supplementaryByLowRanges) {
            buf.push(createBmpRange(hi) + lo);
        }

        astralRange = buf.join('|');
    }

    return {
        bmp: bmpRange,
        astral: astralRange,
        isBmpLast: isBmpLast && hasAstralCodePoints
    };
};

const createBmpRange = (r, {addBrackets} = {addBrackets: true}) => {
    if (r.length === 0) {
        return '';
    }

    const buf = [];

    let [start] = r;
    let [end] = r;

    let predict = start + 1;

    r = r.slice(1);

    let counter = 0;

    for (const code of r) {
        if (predict == code) {
            end = code;
            predict = code + 1;

            continue;
        } else {
            if (start == end) {
                buf.push(codePointToString(start));

                counter++;
            } else if (end == start + 1) {
                buf.push(`${codePointToString(start)}${codePointToString(end)}`);

                counter += 2;
            } else {
                buf.push(`${codePointToString(start)}-${codePointToString(end)}`);

                counter += 2;
            }

            start = code;
            end = code;
            predict = code + 1;
        }
    }

    if (start == end) {
        buf.push(codePointToString(start));

        counter++;
    } else if (end == start + 1) {
        buf.push(`${codePointToString(start)}${codePointToString(end)}`);

        counter += 2;
    } else {
        buf.push(`${codePointToString(start)}-${codePointToString(end)}`);

        counter += 2;
    }

    const output = buf.join('|');

    if (!addBrackets || counter == 1) {
        return output;
    }

    return `[${output}]`;
};

const assemble = ({name, alias, codePoints}) => {
    const {
        bmp,
        astral,
        isBmpLast
    } = createRange(codePoints);
    
    const result = {name};

    if (alias) {
        result.alias = alias;
    }

    if (isBmpLast) {
        result.isBmpLast = true;
    }
    
    if (bmp) {
        result.bmp = bmp;
    }
    
    if (astral) {
        result.astral = astral;
    }
    
    return result;
};

const writeFile = (name, object) => {
    console.log(`salvando ${name}…`);

    const output = jsesc(object, {
        compact: false,
        indent: '    '
    });

    fs.writeFileSync(
        `${__dirname}/../output/${name}`,
        `module.exports = ${output};\n`
    );
};

module.exports = {
    assemble,
    writeFile,
    
    unicodeVersion
};