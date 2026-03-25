/*!
 * fulmin.build 5.1.2
 *
 * cavassani (c) 2026
 */

export default (Fulmin) => {
    const REGEX_DATA = 'fulmin';

    const subParts = /(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*\]/g;
    
    const parts = Fulmin.union([/\({{([\w$]+)}}\)|{{([\w$]+)}}/, subParts], 'g', {
        conjunction: 'or'
    });

    /**
     * remove um `^` inicial e um `$` não escapado final, se
     * ambos estiverem presentes
     * 
     * @private
     * 
     * @param {String} pattern pattern a ser processada
     * 
     * @returns {String} pattern com âncoras edge removidas
     */
    function deanchor(pattern) {
        // permite qualquer número de grupos vazios que não
        // capturem caracteres antes/depois das âncoras, pois
        // os regex criados/gerados pelo fulmin às vezes
        // as incluem
        const leadingAnchor = /^(?:\(\?:\))*\^/;
        const trailingAnchor = /\$(?:\(\?:\))*$/;

        if (
            leadingAnchor.test(pattern) &&
            trailingAnchor.test(pattern) &&
            trailingAnchor.test(pattern.replace(/\\[\s\S]/g, ''))
        ) {
            return pattern.replace(leadingAnchor, '').replace(trailingAnchor, '');
        }

        return pattern;
    }

    /**
     * converte o valor fornecido em um fulmin. flags regexp
     * nativas não são preservadas
     * 
     * @private
     * 
     * @param {String|RegExp} value valor a ser convertido
     * @param {Boolean} [addFlagX] flag `x` aplicada
     * 
     * @returns {RegExp} objeto fulmin com a sintaxe aplicada
     */
    function asFulmin(value, addFlagX) {
        const flags = addFlagX ? 'x' : '';

        return Fulmin.isRegExp(value) ?
            (value[REGEX_DATA] && value[REGEX_DATA].captureNames ?
                // não re-compilar, para preservar nomes de captura
                value :
                
                // re-compila como fulmin
                Fulmin(value.source, flags)
            ) :
            
            // compila string como fulmin
            Fulmin(value, flags);
    }

    function interpolate(substitution) {
        return substitution instanceof RegExp ? substitution : Fulmin.escape(substitution);
    }

    function reduceToSubpatternsObject(subpatterns, interpolated, subpatternIndex) {
        subpatterns[`subpattern${subpatternIndex}`] = interpolated;
        
        return subpatterns;
    }

    function embedSubpatternAfter(raw, subpatternIndex, rawLiterals) {
        const hasSubpattern = subpatternIndex < rawLiterals.length - 1;
        
        return raw + (hasSubpattern ? `{{subpattern${subpatternIndex}}}` : '');
    }

    /**
     * fornece literais de modelo com tags que criam regexes com
     * a sintaxe e os parâmetros do fulmin. o padrão fornecido
     * é tratado como uma string bruta, portanto, as barras
     * invertidas não precisam ser escapadas
     * 
     * a interpolação de strings e regexes compartilha as
     * características de `fulmin.build`. padrões interpolados
     * são tratados como unidades atômicas quando
     * quantificados, strings interpoladas têm seus caracteres
     * especiais escapados, um `^` inicial e um `$` final não
     * escapado são removidos de expressões regulares
     * interpoladas se ambos estiverem presentes, e quaisquer
     * referências anteriores dentro de uma expressão regular
     * interpolada são reescritas para funcionar dentro do
     * padrão geral
     * 
     * @memberOf fulmin
     * 
     * @param {String} [flags] qualquer combinação das flags fulmin
     * 
     * @returns {Function} handler para literais de template que constroem regexes com sintaxe fulmin
     * 
     * @example
     * 
     * fulmin.tag()`\b\w+\b`.test('word'); // -> true
     * 
     * const hours = /1[0-2]|0?[1-9]/;
     * const minutes = /(?<minutes>[0-5][0-9])/;
     * 
     * const time = fulmin.tag('x')`\b ${hours} : ${minutes} \b`;
     * 
     * time.test('10:59'); // -> true
     * 
     * fulmin.exec('10:59', time).groups.minutes; // -> '59'
     * 
     * const backref1 = /(a)\1/;
     * const backref2 = /(b)\1/;
     * 
     * fulmin.tag()`${backref1}${backref2}`.test('aabb'); // -> true
     */
    Fulmin.tag = (flags) => (literals, ...substitutions) => {
        const subpatterns = substitutions.map(interpolate).reduce(reduceToSubpatternsObject, {});
        const pattern = literals.raw.map(embedSubpatternAfter).join('');
        
        return Fulmin.build(pattern, subpatterns, flags);
    }

    /**
     * constrói regexes usando subpadrões nomeados, para
     * facilitar a leitura e a reutilização de padrões. as
     * referências anteriores no padrão externo e nos subpadrões
     * fornecidos são renumeradas automaticamente para funcionar
     * corretamente
     * 
     * os parâmetros nativos usados ​​pelos subpadrões fornecidos
     * são ignorados em favor do argumento `flags`
     * 
     * @memberOf fulmin
     * 
     * @param {String} pattern padrão fulmin utilizando `{{name}}` para subpadrões embutidos
     * @param {Object} subs objeto de observação para subpadrões nomeados
     * @param {String} [flags] qualquer combinação das flags do fulmin
     * 
     * @returns {RegExp} regex com subpadrões interpolados
     * 
     * @example
     * 
     * const time = fulmin.build('(?x)^ {{hours}} ({{minutes}}) $', {
     *     hours: fulmin.build('{{h12}} : | {{h24}}', {
     *         h12: /1[0-2]|0?[1-9]/,
     *         h24: /2[0-3]|[01][0-9]/
     *     }, 'x'),
     * 
     *     minutes: /^[0-5][0-9]$/
     * });
     * 
     * time.test('10:59'); // -> true
     * 
     * fulmin.exec('10:59', time).groups.minutes; // -> '59'
     */
    Fulmin.build = (pattern, subs, flags) => {
        flags = flags || '';

        // usado com chamadas `asfulmin` para `pattern` e
        // subpatterns em `subs`, para contornar a forma como
        // alguns navegadores convertem `regexp('\n')` em um
        // regex que contém os caracteres literais `\` e `n`
        //
        // veja mais detalhes em:
        // - https://github.com/slevithan/xregexp/pull/163
        const addFlagF = flags.includes('f');
        const inlineFlags = /^\(\?([\w$]+)\)/.exec(pattern);

        // adiciona flags
        if (inlineFlags) {
            flags = Fulmin._clipDuplicates(flags + inlineFlags[1]);
        }

        const data = {};
        
        for (const p in subs) {
            if (subs.hasOwnProperty(p)) {
                // passar para o fulmin habilita sintaxe
                // estendida e garante validade independente,
                // para evitar que um `(`, `)`, `[` ou `\`
                // final sem escape quebre o wrapper `(?:)`.
                // para subpadrões fornecidos como regexes
                // nativos, ele falha em números octais e
                // adiciona a propriedade usada para armazenar
                // dados de instância de regex estendido,
                // por simplicidade
                const sub = asFulmin(subs[p], addFlagF);

                data[p] = {
                    pattern: deanchor(sub.source),
                    names: sub[REGEX_DATA].captureNames || []
                };
            }
        }
    };
};