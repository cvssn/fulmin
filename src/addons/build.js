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
}