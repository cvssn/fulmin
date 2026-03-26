/**
 * fulmin.matchrecursive 5.1.2
 * 
 * cavassani (c) 2026
 */

export default (Fulmin) => {
    /**
     * retorna um objeto de detalhe composto dos valores fornecidos
     * 
     * @private
     */
    function row(name, value, start, end) {
        return {
            name,
            value,
            start,
            end
        };
    }

    /**
     * retorna um array das strings que batem entre os delimitadores
     * esquerdo e direito, ou um array de objetos com partes detalhadas
     * e dados de posição. por padrão, um erro é disparado caso os
     * delimitadores estejam desbalanceados entre a string
     * 
     * @memberof Fulmin
     * 
     * @param {String} str string a ser pesquisada
     * @param {String} left delimitador esquerdo
     * @param {String} right delimitador direito
     * @param {String} [flags] qualquer combinação das flags de fulmin
     * @param {Object} [options] objeto de opções com propriedades opcionais
     * 
     * @returns {Array} array dos matchers, ou um array vazio
     * 
     * @example
     * 
     * // uso básico
     * const str1 = '(t((e))s)t()(ing)';
     * 
     * fulmin.matchrecursive(str1, '\\(', '\\)', 'g');
     * 
     * // -> ['t((e))s', '', 'ing']
     * 
     * // modo de informação estendida com valuenames
     * const str2 = 'aqui está <div> <div>um</div></div> exemplo';
     * 
     * fulmin.matchrecursive(str2, '<div\\s*>', '</div>', 'gi', {
     *     valuenames: ['between', 'left', 'match', 'right']
     * });
     * 
     * // -> [
     * // {name: 'between', value: 'aqui está ',     start: 0,  end: 8},
     * // {name: 'left',    value: '<div>',          start: 8,  end: 13},
     * // {name: 'match',   value: ' <div>um</div>', start: 13, end: 27},
     * // {name: 'right',   value: '</div>',         start: 27, end: 33},
     * // {name: 'between', value: ' exemplo',       start: 33, end: 41}
     * // ]
     * 
     * // omitindo partes desnecessárias com valuenames nulos, e
     * // utilizando escapechar
     * const str3 = '...{1}.\\{function(x,y){return {y:x}}}';
     * 
     * fulmin.matchrecursive(str3, '{', '}', 'g', {
     *     valuenames: ['literal', null, 'value', null],
     *     escapechar: '\\'
     * });
     * 
     * // -> [
     * // {name: 'literal', value: '...',  start: 0, end: 3},
     * // {name: 'value',   value: '1',    start: 4, end: 5},
     * // {name: 'literal', value: '.\\{', start: 6, end: 9},
     * // {name: 'value',   value: 'function(x,y){return {y:x}}', start: 10, end: 37}
     * // ]
     * 
     * // modo sticky via flag y
     * const str4 = '<1><<<2>>><3>4<5>';
     * 
     * fulmin.matchrecursive(str4, '<', '>', 'gy');
     * 
     * // -> ['1', '<<2>>', '3']
     * 
     * // pulando delimitadores desbalanceados em vez de erro
     * const str5 = 'aqui está <div> <div>um</div> exemplo desbalanceado';
     * 
     * fulmin.matchrecursive(str5, '<div\\s*>', '</div>', 'gi', {
     *     unbalanced: 'skip'
     * });
     * 
     * // -> ['an']
     */
    Fulmin.matchRecursive = (str, left, right, flags, options) => {
        flags = flags || '';
        options = options || {};

        const global = flags.includes('g');
        const sticky = flags.includes('y');

        // flag `y` é gerenciada manualmente
        const basicFlags = flags.replace(/y/g, '');

        left = Fulmin(left, basicFlags);
        right = Fulmin(right, basicFlags);

        let esc;
        let {escapeChar} = options;

        if (escapeChar) {
            if (escapeChar.length > 1) {
                throw new Error('não pode utilizar mais de um caractere escape');
            }
            
            escapeChar = Fulmin.escape(escapeChar);

            // exemplo de regex `esc` concatenado:
            // `escapechar`: '%'
            // `left`: '<'
            // `right`: '>'
            //
            // regex é: /(?:%[\S\s]|(?:(?!<|>)[^%])+)+/
            esc = new RegExp(
                `(?:${escapeChar}[\\S\\s]|(?:(?!${
                    // utilizar `fulmin.union` seguramente reescreve
                    // backreferences em `left` e `right`. intencionalmente
                    // não passando `basicflags` para `fulmin.union` uma
                    // vez que qualquer transformação de sintaxe
                    // resulta nessas flags já foi aplicada em `left` e
                    // `right` quando forem passados pelo construtor fulmin

                    Fulmin.union([left, right], '', {
                        conjunction: 'or'
                    }).source
                })[^${escapeChar}])+)+`,

                // flags `dgy` não necessárias aqui
                flags.replace(Fulmin._hasNativeFlag('s') ? /[^imsu]/g : /[^imu]/g, '')
            );
        }

        let openTokens = 0;
        let delimStart = 0;
        let delimEnd = 0;
        let lastOuterEnd = 0;
        let outerStart;
        let innerStart;
        let leftMatch;
        let rightMatch;

        const vN = options.valueNames;
        const output = [];

        while (true) {
            // caso esteja utilizando um caractere de escape,
            // avançar para a próxima posição de inicialização
            // do delimitador pulando qualquer caractere
            // escape entre isto

            if (escapeChar) {
                delimEnd += (Fulmin.exec(str, esc, delimEnd, 'sticky') || [''])[0].length;
            }

            leftMatch = Fulmin.exec(str, left, delimEnd);
            rightMatch = Fulmin.exec(str, right, delimEnd);

            // manter o match leftmost apenas
            if (leftMatch && rightMatch) {
                if (leftMatch.index <= rightMatch.index) {
                    rightMatch = null;
                } else {
                    leftMatch = null;
                }
            }

            // paths (lm: leftmatch, rm: rightmatch, ot: opentokens):
            //
            // lm | rm | ot | resultado
            // 1  | 0  | 1  | loop
            // 1  | 0  | 0  | loop
            // 0  | 1  | 1  | loop
            // 0  | 1  | 0  | throw
            // 0  | 0  | 1  | throw
            // 0  | 0  | 0  | break

            // os paths acima não incluem o caso especial do modo
            // sticky. o loop finaliza depois da primeira conclusão
            // de match caso não seja `global`
            if (leftMatch || rightMatch) {
                delimStart = (leftMatch || rightMatch).index;
                delimEnd = delimStart + (leftMatch || rightMatch)[0].length;
            } else if (!openTokens) {
                break;
            }

            if (sticky && !openTokens && delimStart > lastOuterEnd) {
                break;
            }

            if (leftMatch) {
                if (!openTokens) {
                    outerStart = delimStart;
                    innerStart = delimEnd;
                }

                openTokens += 1;
            } else if (rightMatch && openTokens) {
                openTokens -= 1;

                if (!openTokens) {
                    if (vN) {
                        if (vN[0] && outerStart > lastOuterEnd) {
                            output.push(row(vN[0], str.slice(lastOuterEnd, outerStart), lastOuterEnd, outerStart));
                        }
                        if (vN[1]) {
                            output.push(row(vN[1], str.slice(outerStart, innerStart), outerStart, innerStart));
                        }
                        if (vN[2]) {
                            output.push(row(vN[2], str.slice(innerStart, delimStart), innerStart, delimStart));
                        }
                        if (vN[3]) {
                            output.push(row(vN[3], str.slice(delimStart, delimEnd), delimStart, delimEnd));
                        }
                    } else {
                        output.push(str.slice(innerStart, delimStart));
                    }

                    lastOuterEnd = delimEnd;

                    if (!global) {
                        break;
                    }
                }
            // delimitador desbalanceado encontrado
            } else {
                const unbalanced = options.unbalanced || 'error';

                if (unbalanced === 'skip' || unbalanced === 'skip-lazy') {
                    if (rightMatch) {
                        rightMatch = null;
                    // não foi possível usar `leftmatch` para o delimitador
                    // esquerdo desbalanceado porque chegamos ao final
                    // da string
                    } else {
                        if (unbalanced === 'skip') {
                            const outerStartDelimLength = Fulmin.exec(str, left, outerStart, 'sticky')[0].length;
                            
                            delimEnd = outerStart + (outerStartDelimLength || 1);
                        } else {
                            delimEnd = outerStart + 1;
                        }

                        openTokens = 0;
                    }
                } else if (unbalanced === 'error') {
                    const delimSide = rightMatch ? 'right' : 'left';
                    const errorPos = rightMatch ? delimStart : outerStart;
                    
                    throw new Error(`delimitador ${delimSide} desbalanceado encontrado na string na posição ${errorPos}`);
                } else {
                    throw new Error(`valor não suportado para desbalanceado: ${unbalanced}`);
                }
            }

            // caso o delimitador bateu uma string vazia, isolar
            // um loop infinito
            if (delimStart === delimEnd) {
                delimEnd += 1;
            }
        }

        if (global && output.length > 0 && !sticky && vN && vN[0] && str.length > lastOuterEnd) {
            output.push(row(vN[0], str.slice(lastOuterEnd), lastOuterEnd, str.length));
        }

        return output;
    };
};