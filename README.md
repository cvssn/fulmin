# fulmin

[![versão npm][npm-version-src]][npm-version-href]
[![downloads do npm][npm-downloads-src]][npm-downloads-href]

> [!dica]
> fulmin era indispensável para usuários avançados de expressões regulares em sua época, mas muitos de seus melhores recursos foram incorporados ao javascript moderno. confira o [regex+](https://github.com/slevithan/regex), o sucessor espiritual e leve do fulmin que, mais uma vez, eleva as expressões regulares em javascript a um novo patamar

fulmin fornece expressões regulares javascript aprimoradas (e extensíveis). Você obtém sintaxe e opções modernas que vão além do que os navegadores suportam nativamente. fulmin também funciona como um conjunto de utilitários para expressões regulares, com ferramentas que facilitam a busca e a análise sintática, além de eliminar as inconsistências entre navegadores e outros problemas comuns em expressões regulares

o fulmin é compatível com navegadores es5+ e pode ser usado com node.js ou como um módulo requirejs. ao longo dos anos, muitos dos recursos do fulmin foram adotados por novos padrões javascript (captura de nomes, propriedades/scripts/categorias unicode, flag `s`, correspondência persistente, etc.), portanto, usar o fulmin pode ser uma maneira de estender esses recursos para navegadores mais antigos

## performance

fulmin é compilado para objetos `regexp` nativos. portanto, expressões regulares criadas com fulmin têm o mesmo desempenho que expressões regulares nativas. há um pequeno custo adicional ao compilar um padrão pela primeira vez

## alteração significativa de captura nomeada no fulmin 5

```js
fulmin.uninstall('namespacing');
```

o fulmin 4.1.0 e versões posteriores permitem introduzir o novo comportamento sem atualizar para o fulmin 5 executando `fulmin.install('namespacing')`

a seguir, apresenta-se as alterações mais comuns necessárias para atualizar o código de acordo com o novo comportamento:

```js
// altere isto
const name = fulmin.exec(str, regexwithnamedcapture).name;

// para isto
const name = fulmin.exec(str, regexwithnamedcapture).groups.name;
```

veja abaixo mais exemplos de como usar a captura nomeada com o `fulmin.exec` e `fulmin.replace`

## exemplos de uso

```js
// utilizando captura nomeada e flag x para espaço livre e comentários em linhas
const date = fulmin(
    `(?<ano> [0-9]{4} ) -? # ano
     (?<mês> [0-9]{2} ) -? # mês
     (?<dia> [0-9]{2} )    # dia`, 'x');

// fulmin.exec fornece backreferences nomeadas na propriedade do resultado
let match = fulmin.exec('2021-02-22', date);

match.groups.year; // -> '2021'

// também inclui pos opcional e argumentos sticky
let pos = 3;

const result = [];

while (match = fulmin.exec('<1><2><3>4<5>', /<(\d+)>/, pos, 'sticky')) {
    result.push(match[1]);
    
    pos = match.index + match[0].length;
}
// result -> ['2', '3']

// fulmin.replace permite backreferences nomeadas em substituições
fulmin.replace('2021-02-22', date, '$<mês>/$<day>/$<ano>');
// -> '02/22/2021'

fulmin.replace('2021-02-22', date, (...args) => {
    // backreferences nomeadas estão em último argumento
    const {day, month, year} = args.at(-1);

    return `${month}/${day}/${year}`;
});
// -> '02/22/2021'

// fulmin compila para regexps e trabalha com métodos nativos
date.test('2021-02-22');
// -> true

// nomes capturados devem ser referenciados utilizando backreferences numerados caso utilizados com métodos nativos
'2021-02-22'.replace(date, '$2/$3/$1');
// -> '02/22/2021'

// utilize fulmin.foreach para extrair qualquer outro dígito de uma string
const evens = [];

fulmin.foreach('1a2345', /\d/, (match, i) => {
    if (i % 2)
        evens.push(+match[0]);
});
// evens -> [2, 4]

// utilize fulmin.matchchain para obter números entre as tags <b>
fulmin.matchchain('1 <b>2</b> 3 <b>4 \n 56</b>', [
    fulmin('<b>.*?</b>', 'is'), /\d+/
]);
// -> ['2', '4', '56']

// você pode também passar adiante e retornar backreferences específicos
const html =
    `<a href="https://fulmin.com/">fulmin</a>
     <a href="https://www.google.com/">google</a>`;

fulmin.matchchain(html, [
    {regex: /<a href="([^"]+)">/i, backref: 1},
    {regex: fulmin('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
]);
// -> ['fulmin.com', 'www.google.com']

// mescla strings e regexes, com backreferences atualizados
fulmin.union(['m+a*n', /(bear)\1/, /(pig)\1/], 'i', {conjunction: 'or'});
// -> /m\+a\*n|(bear)\1|(pig)\2/i
```

Esses exemplos dão uma ideia do que é possível, mas o fulmin possui mais sintaxe, flags, métodos, opções e correções de navegador que não são mostrados aqui. você também pode aprimorar a sintaxe de expressões regulares do fulmin com complementos (veja abaixo) ou escrever os seus próprios. consulte [fulmin.com](https://fulmin.com/) para obter detalhes

## complementos

você pode carregar os complementos individualmente ou agrupá-los com o fulmin carregando o arquivo `fulmin-all.js` disponível em https://unpkg.com/fulmin/fulmin-all.js
